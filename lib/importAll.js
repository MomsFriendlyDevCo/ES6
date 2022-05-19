import Debug from 'debug';
import {join} from 'node:path';
import {globby} from 'globby';
import {URL} from 'node:url';
import sortPaths from '#es6/sortPaths';

let debug = Debug('importAll');

/**
* Load modules in series / parallel optionally executing a function
*
* @param {string|function|Array<string|function>} [imports] Array of paths / globs to import, functions are waited on and expected to return paths / globs or function workers - can also be specified as `options.imports`
* @param {Object} [options] Additional options
* @param {string|function|Array<string|function>} [options.imports] Array of paths / globs to import, functions are waited on and expected to return paths / globs or function workers
* @param {boolean} [options.glob=true] If true, globs are resolved, if false paths are assumed to be literal
* @param {string} [options.method='default'] Function to run after import
* @param {Array<*>} [options.args] Optional arguments to pass to the method
* @param {string} [options.root] Root path to resolve modules from
* @param {function} [options.sort] Path sorter function to use before running the import cycle
* @param {Object} [options.sortOptions] Secondary parameter passed to the sort function
* @returns {Promise} A promise which will resolve when all imports have succeeded
*/
export default function importAll(imports, options) {
	// Argument mangling {{{
	if (typeof imports == 'object') {
		[options, imports] = [imports, null];
	}
	// }}}

	let settings = {
		imports: typeof imports == 'string' ? [imports] : imports,
		method: 'default',
		glob: true,
		args: [],
		root: new URL('..', import.meta.url).pathname, // Utterly ridiculous way to resolve __dirname in ES6
		sort: sortPaths,
		sortOptions: {},
		...options,
	};

	return Promise.resolve()
		// Resolve initial imports if its a function {{{
		.then(()=> typeof settings.imports == 'function'
			? settings.imports(settings.args)
			: settings.imports
		)
		.then(importsResolved => settings.imports = importsResolved)
		// }}}
		// Resolve all async functions {{{
		.then(()=> Promise.all(settings.imports.map(imp =>
			typeof imp == 'function' ? imp(settings.args)
			: imp
		)))
		// }}}
		// Expand globs {{{
		.then(imps => settings.glob
			? imps.flatMap(i => globby(i))
			: imps
		)
		.then(imps => Promise.all(imps))
		.then(imps => imps.flat()) // Flatten all glob responses into a flat array
		// }}}
		// Sort using a Schwartzian transform with the sort options {{{
		.then(paths => settings.sort(paths, settings.sortOptions))
		// }}}
		// Perform imports in series {{{
		.then(imps => {
			let responses = [];
			return imps.reduce((chain, imp) =>
				chain
					.then(()=> { // Conduct import
						let importPath = join(settings.root, imp);
						debug('Import', importPath);
						return import(importPath);
					})
					.then(val => responses.push({...val})) // Need to copy this into a plain object or JS returns a weird response
			, Promise.resolve())
				.then(()=> responses)
		})
		// }}}
		// Tidy output and return {{{
		.then(finalOutput => Array.from(finalOutput))
		// }}}
}

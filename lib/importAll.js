import Debug from 'debug';
import dirName from '#es6/dirName';
import {join} from 'node:path';
import {globby} from 'globby';
import sortPaths from '#es6/sortPaths';

let debug = Debug('importAll');

/**
* Load modules in series / parallel optionally executing a function
*
* @param {string|function|Array<string|function>} [imports] Array of paths / globs to import, functions are waited on and expected to return paths / globs or function workers - can also be specified as `options.imports`
* @param {Object} [options] Additional options
* @param {string|function|Array<string|function>} [options.imports] Array of paths / globs to import, functions are waited on and expected to return paths / globs or function workers
* @param {boolean} [options.glob=true] If true, globs are resolved, if false paths are assumed to be literal
* @param {string|Array<string>} [options.method='default'] Function(s) to run after import in order
* @param {Array<*>} [options.args] Optional arguments to pass to the method
* @param {string} [options.root] Root path to resolve modules from
* @param {function} [options.sort] Path sorter function to use before running the import cycle
* @param {Object} [options.sortOptions] Secondary parameter passed to the sort function
* @param {string} [options.sortWhen='perGlob'] When to sort, ENUM: 'perGlob', 'preImport'
* @returns {Promise} A promise which will resolve when all imports have succeeded
*/
export default function importAll(imports, options) {
	// Argument mangling {{{
	if (typeof imports == 'object' && imports.imports) {
		[options, imports] = [imports, null];
	}
	// }}}

	let settings = {
		imports: typeof imports == 'string' ? [imports] : imports,
		method: null,
		glob: true,
		args: [],
		root: dirName({stackDepth: 2}), // Get root path of the callee function
		sort: sortPaths,
		sortOptions: {
			uniq: false, // No need to do this in the sort module if we're handling it here
		},
		sortWhen: 'perGlob',
		uniq: true,
		warnEmptyGlob: true,
		...options,
	};

	// Sanity checks {{{
	if (!Array.isArray(settings.imports) && !['function', 'string'].includes(typeof settings.imports)) throw new Error('Unknown import input type - specify an string, function or array of the same');
	if (Array.isArray(settings.imports) && settings.imports.length < 1) throw new Error('No imports specified in array');
	if (typeof settings.method == 'string') settings.method = [settings.method]; // Transform settings.method into an array
	if (!Array.isArray(settings.method) || !settings.method.every(i => typeof i == 'string')) throw new Error('Method property must be a string or array of strings');
	if (!['perGlob', 'preImport'].includes(settings.sortWhen)) throw new Error(`Invalid setting for sortWhen="${settings.sortWhen}"`);

	debug(`Start importAll run with root "${settings.root}"...`);
	// }}}

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
		// Expand globs (+sorting) {{{
		.then(imps => settings.glob
			? imps.flatMap(i => globby(i, {cwd: settings.root})
				.then(paths => {
					if (settings.warnEmptyGlob && paths.length == 0) console.warn(`Warning importAll glob "${i}", returned no matches`);
					return paths;
				})
			)
			: imps
		)
		.then(imps => Promise.all(imps))
		.then(imps => settings.sortWhen == 'perGlob' // Sort perGlob
			? imps.map(paths =>
				settings.sort(paths, settings.sortOptions)
			)
			: imps
		)
		.then(imps => imps.flat()) // Flatten all glob responses into a flat array
		.then(paths => settings.sortWhen == 'preImport' // Sort preImport
			? settings.sort(paths, settings.sortOptions)
			: paths
		)
		// }}}
		// Uniq imports {{{
		.then(paths => {
			if (!settings.uniq) return paths; // Uniq disabled - passthru
			let seen = new Set();
			return paths.reduce((total, path) => { // Since paths could be muddled we need to use a random Uniq scanner
				if (seen.has(path)) {
					return total;
				} else {
					seen.add(path);
					return total.concat([path]);
				}
			}, []);
		})
		// }}}
		// Perform imports in series {{{
		.then(imps => {
			let responses = [];
			return imps.reduce((chain, imp) =>
				chain
					.then(()=> { // Conduct import
						let importPath = join(settings.root, imp);
						debug('Import', importPath);
						return import(importPath)
							.then(module => settings.method.reduce((methodChain, method) =>
								chain.then(()=> {
									if (module[method]) {
										debug(`Running method on ${importPath} # ${method}()...`);
										return module[method](...settings.args)
									} else {
										debug(`No method method on ${importPath} # ${method}() - skipping`);
									}
								})
							, Promise.resolve()))
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

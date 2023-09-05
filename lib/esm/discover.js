/**
* Utilities to query & discovert other ES6 NPM modules
* Note that NPM no longer has a programatic API as of https://github.com/npm/cli/pull/3762
* so we have to pull from the CLI
*/

import {execa} from 'execa';

/**
* Find other ES6 NPM modules either locally or globally
* @param {Object} [options] Options mutating behaviour
* @param {RegExp|Function} [options.filter] Optional filter function to query modules. If a function this is called as `(npmName, npmAttrs)`, if a RegExp its used to match the npm.id
* @param {Boolean} [options.local=false] Query local repositories
* @param {Boolean} [options.global=true] Query global repositories
* @param {String} [options.want='collection'] Output type. ENUM: `'collection'`, `'object'`, `'set'`
* @returns {Promise<Array<String>>} A list of modules matching query parameters
*/
export default function discover(options) {
	let settings = {
		filter: undefined,
		local: false,
		global: true,
		want: 'collection',
		...options,
	};

	let npms = {};

	return Promise.all([
		// Local Scan
		settings.local && Promise.resolve()
			.then(()=> execa('npm', [
				'list',
				'--json',
			]))
			.then(({stdout}) => JSON.parse(stdout))
			.then(rawNpms => rawNpms?.dependencies ?? npms)
			.then(rawNpms => Object.entries(rawNpms).forEach(([npm, config]) =>
				npms[npm] = {
					...npms[npm],
					...config,
					isLocal: true,
				}
			)),

		// Global Scan
		settings.global && Promise.resolve()
			.then(()=> execa('npm', [
				'--global',
				'list',
				'--json',
			]))
			.then(({stdout}) => JSON.parse(stdout))
			.then(rawNpms => rawNpms?.dependencies ?? npms)
			.then(rawNpms => Object.entries(rawNpms).forEach(([npm, config]) =>
				npms[npm] = {
					...npms[npm],
					...config,
					isGlobal: true,
				}
			)),
	])
		.then(()=> settings.filter
			? Object.fromEntries(
				Object.entries(npms)
					.filter(([key, attr]) => {
						if (typeof settings.filter == 'function') {
							return settings.filter.call(attr, key, attr);
						} else if (settings.filter instanceof RegExp) {
							return settings.filter.test(key)
						} else {
							throw new Error('Unknown filter type');
						}
					})
			)
			: npms
		)
		.then(result => npms = result)
		.then(()=>
			settings.want == 'object' ? npms
			: settings.want == 'collection' ? Object.entries(npms).map(([npm, attr]) => ({
				id: npm,
				...attr,
			}))
			: settings.want == 'want' ? new Set(npms.map(n => n.id))
			: (()=> { throw new Error(`Unknown "want" type "${settings.want}"`) })()
		)
}

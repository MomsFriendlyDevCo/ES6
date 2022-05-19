import path from 'node:path';

/**
* Sort array items in a "logical" way
* This is really just a nicer wrapper around Intl.Collator without array mutation
*/
export default function sortPaths(paths, options) {
	let settings = {
		stripDir: false,
		stripExt: true,
		rewritePath: (parsed, settings) => path.join(...[
			!settings.stripDir && parsed.dir,
			parsed.name,
			!settings.stripExt && parsed.ext,
		].filter(Boolean)),
		locale: 'en',
		localeOptions: {
			sensitivity: 'base',
			caseFirst: false,
			ignorePunctuation: true,
			numeric: true,
		},
		...options,
	};

	let localeComparison = new Intl.Collator(settings.locale, settings.localeOptions);

	return paths
		.map(a => [ // Prepare Schwartzian transform wrap
			settings.rewritePath(path.parse(a), settings),
			a,
		])
		.sort((a, b) => localeComparison.compare(a[0], b[0]))
		.map(a => a[1]) // Unwrap transform
}

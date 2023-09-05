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
		uniq: true,
		...options,
	};

	let localeComparison = new Intl.Collator(settings.locale, settings.localeOptions);

	let sortedPaths = paths
		.map(a => [ // Prepare Schwartzian transform wrap
			settings.rewritePath(path.parse(a), settings),
			a,
		])
		.sort((a, b) => localeComparison.compare(a[0], b[0]))
		.map(a => a[1]) // Unwrap transform

	return settings.uniq
		? sortedPaths.reduce((total, path, offset, paths) => // Since the array is sorted we only need to look at the next item to uniq filter
			offset == 0 || path != paths[offset-1] // This path isn't the same as the previous in sequence
				? total.concat([path])
				: total
		, [])
		: sortedPaths
}

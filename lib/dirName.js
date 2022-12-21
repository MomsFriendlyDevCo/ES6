import {dirname, join as pathJoin} from 'path';


/**
* Return the calling functions directory name (simulating `__dirname`)
* @param {Object|String} [options] Options to mutate behaviour - if a string is given its assumed to populate `options.relativeTo`
* @param {String} [options.relativeTo] Also append being relative to the current directory. So `..` would return the calling modules parent absolute path
* @param {Number} [options.stackDepth=1] How far down the stack to look for the calling functions path
* @param {Boolean} [options.translateFileProtocol=true] Whether to translate the file protocol (e.g. `file://some/path`) to a regular root path string
* @param {Boolean} [options.includeFilename=false] Whether to include the file basename of the parent function as well as its path
* @returns {String} The directory name relative to the calling function (+ other relativeity via `relativeTo`)
*/
export default function dirName(options) {
	let settings = {
		relativeTo: typeof options == 'string' ? options : null,
		stackDepth: 1,
		translateFileProtocol: true,
		includeFilename: false,
		...(typeof options == 'object' ? options : null),
	};
	if (settings.relativeTo && settings.includeFilename) throw new Error('Setting both relativeTo + includeFilename makes no sense');

	try { // Throw intentional error to get a stack trace
		throw new Error('dirName intentional error');
	} catch (e) {
		let path = e.stack
			.split(/\n+/)
			.map(line =>
				/\((.+?):\d+:\d+\)$/.exec(line)?.[1] // e.g. `at $FUNC ($PATH:$LINE:$COL)
				|| /^\s+at (.+?):\d+:\d+$/.exec(line)?.[1] // e.g. `at $PATH:$LINE:$COL`
			)
			.filter(Boolean) // Remove duds
			.slice(settings.stackDepth) // Ignore THIS path (or other stack depths)
			.shift()

		if (settings.translateFileProtocol)
			path = path.replace(/^file:\/\//, '') // Strip 'file://' prefix

		return settings.includeFilename ? path
			: settings.relativeTo ? pathJoin(dirname(path), settings.relativeTo)
			: dirname(path);
	}

}

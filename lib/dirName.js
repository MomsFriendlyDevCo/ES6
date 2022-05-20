import {dirname} from 'path';
import {fileURLToPath} from 'url';

export default function dirName(options) {
	let settings = {
		stackDepth: 1,
		translateFileProtocol: true,
		includeFilename: false,
		...options,
	};

	try { // Throw intentional error to get a stack trace
		throw new Error('dirName intentional error');
	} catch (e) {
		let path = e.stack
			.split(/\n+/)
			.map(line => /\((.+?):\d+:\d+\)$/.exec(line)?.[1])
			.filter(Boolean) // Remove duds
			.slice(settings.stackDepth) // Ignore THIS path (or other stack depths)
			.shift()

		if (settings.translateFileProtocol)
			path = path.replace(/^file:\/{2}/, '') // Strip 'file://' prefix

		return settings.includeFilename ? path : dirname(path);
	}

}

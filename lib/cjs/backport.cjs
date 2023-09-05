const parentModule = require('parent-module');
const {createRequire} = require('node:module');
const url = require('node:url');

/**
* Try to import a ESM module as a CJS backport
* This is somewhat altered code from https://github.com/davidmarkclements/inclusion featuring a windows patch to fix issues with Windows
*
* @param {String} path The relative path/name of the module to import
* @param {String} [extract] Optional sub-module / sub-object to extract, this is useful if importing an entire module but only a sub-key is required
* @returns {Object} The contents of the exported import - usually the `default` meta object
*/
module.exports = function backport(path, extract) {
	const {resolve} = createRequire(parentModule()); // Get parent module relative importer
	let modPath = url.pathToFileURL(resolve(path));

	return import(modPath)
		.then(res => {
			if (extract) { // Return extraction
				if (!res[extract]) throw new Error(`Cannot find export "${extract}" from ESM imported module "${path}"`);
				return res[extract];
			} else { // Just return entire module
				return res;
			}
		})
}

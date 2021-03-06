@MomsFriendlyDevCo/ES6
======================
Various ES6 utilities.


API
===

All methods are importable directly or via a default object:

```javascript
// Import everything as es6
import es6 from '@momsfriendlydevco';
es6.importAll(...);
es6.$FUNC(...);

// Import individual functions
import {dirName, importAll, sortPaths} from '@momsfriendlydevco/es6';
dirName(...);
importAll(...);
sortPaths(...);

// Direct import via path
import importAll from '@momsfriendlydevco/es6/importAll';
importAll(...);
```


dirname(options)
----------------
Returns a string.
Fetch the directory of the calling function.

| Option                  | Type      | Default | Description                                                                     |
|-------------------------|-----------|---------|---------------------------------------------------------------------------------|
| `stackDepth`            | `Number`  | `1`     | How far down the call stack to search for a path                                |
| `translateFileProtocol` | `Boolean` | `true`  | Whether to replace the `file://` prefix with a simple on-disk path              |
| `includeFilename`       | `Boolean` | `false` | Whether to include the actual filename, if false only the directory is returned |


**Notes:**
* `stackDepth` is the number of functions in the stack to look upwards from the actual dirName worker. The default of `1` means look to the callee. If you wish to look higher up the stack increase this value.


```javascript
import {dirName} from '@momsfriendlydevco/es6';

let myPath = dirName(); //=~ the directory the saved script file exists in

let myFile = dirName({includeFilename: true}); //=~ Full path including file
```


importAll(paths, options)
-------------------------
Returns a promise.
Import various ES6 modules using a glob.
This module uses the `sortPaths` API to return paths in a logical order (i.e. `./lib/a.js` is included before `./lib/a.a.js`).


Options are:

| Option        | Type                      | Default         | Description                                                       |
|---------------|---------------------------|-----------------|-------------------------------------------------------------------|
| `imports`     | Various*                  | `[]`            | Alternate way to specify the paths input, see notes               |
| `glob`        | `Boolean`                 | `true`          | Support globbing in paths                                         |
| `method`      | `String`, `Array<String>` |                 | If specified run the method or array of methods after each import |
| `args`        | `Array`                   | `[]`            | Arguments to pass to the `method` on run                          |
| `root`        | `String`                  | Auto*           | Root path of the project to resolve modules from                  |
| `sort`        | `Function`                | `ES6.sortPaths` | Function to use to sort evaluated glob paths per run              |
| `sortOptions` | `Object`                  | `{}`            | Options passed to the sort function                               |
| `sortWhen`    | `String`                  | `perGlob`       | When to sort. ENUM: `perGlob` or `preImport`                      |
| `uniq`        | `Boolean`                 | `true`          | Include each eventual path only once, avoiding duplicates         |


**Notes:**
* `imports` can be a single string glob, array of globs or a single function / array of functions which (async eventually) returns the strings / globs to include
* `sortWhen` determines when the sorting algorithm should operate. `perGlob` sorts each glob evaluation, meaning that the order of paths is preserved except globs that "expand" into multiple files. `preImport` Expands all globs first then sorts all files which could potentially destroy any preferred order


```javascript
// Glob include all files specified (in a logical order) running the 'init' method for each
await importAll([
	'./libs/*.js',
	'./middleware/*.js',
], {
	method: 'init',
})
```


sortPaths(paths, options)
-------------------------
Returns a new array of sorted paths.

Sorts an array of paths in a logical, "human" order.

Options are:

| Option          | Type       | Default  | Description                                           |
|-----------------|------------|----------|-------------------------------------------------------|
| `stripDir`      | `Boolean`  | `false`  | Whether to ignore the path component when sorting     |
| `stripExt`      | `Boolean`  | `true`   | Whether to ignore the file extension when sorting     |
| `rewritePath`   | `Function` | See code | The path rewrite function (uses the `strip*` options) |
| `locale`        | `String`   | `'en'`   | The locale region when sorting                        |
| `localeOptions` | `Object`   | See code | Locale options when sorting                           |
| `uniq`          | `Boolean`  | `true`   | Whether to de-duplicate the calculated paths          |


```javascript
sortPaths([
	'./lib/a.js',
	'./lib/a.a.js', // Expects to extend 'a'
	'./lib/a.b.js',
	'./lib/a.c.js',
	'
	'./lib/z.js',
	'./lib/z-1.js',
	'./lib/z-2.js',
	'./lib/z-3.js',
	'./lib/z-10.js', // Numerics are correctly evaluated in order
]); //= The above "ideal" order
```

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

// Import individual functions
import {importAll, sortPaths} from '@momsfriendlydevco/es6';
importAll(...);

// Direct import via path
import importAll from '@momsfriendlydevco/es6/importAll';
importAll(...);
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


**Notes:**
* `imports` can be a single string glob, array of globs or a single function / array of functions which (async eventually) returns the strings / globs to include
*


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

For example the following paths are returned:

```
./lib/a.js
./lib/a.a.js // Expects to extend 'a'
./lib/a.b.js // Expects to extend 'a'
./lib/a.c.js // Expects to extend 'a'

./lib/z.js
./lib/z-1.js
./lib/z-2.js
./lib/z-3.js
./lib/z-10.js // Numerics are correctly evaluated in order
```

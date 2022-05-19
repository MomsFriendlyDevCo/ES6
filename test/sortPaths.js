import {expect} from 'chai';
import sortPaths from '#es6/sortPaths';

describe('sortPaths()', ()=> {

	it('should sort paths in a logical order #1', ()=> {
		let paths = [
			'./test/data/sort-a.js',
			'./test/data/sort-a.a.js',
			'./test/data/sort-a.b.js',
			'./test/data/sort-a.c.js',
			'./test/data/sort-b.js',
			'./test/data/sort-z.js',
		];

		// Expect sorted paths to be in the same order
		expect(sortPaths([...paths].reverse())).to.deep.equal(paths);
	});

	it('should sort paths in a logical order #2', ()=> {
		let paths = [
			'./a.js',
			'./a.a.js',
			'./a.b.js',
			'./b.js',
			'./c.js',
			'./test/data/sort-a.js',
			'./test/data/sort-a.alpha.js',
			'./test/data/sort-a.base.js',
			'./test/data/sort-a.compare.js',
			'./test/data/sort-b.js',
			'./test/data/sort-z.js',
		];

		// Expect sorted paths to be in the same order
		expect(sortPaths([...paths].reverse())).to.deep.equal(paths);
	});

});

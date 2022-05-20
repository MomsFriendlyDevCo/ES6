import {expect} from 'chai';
import importAll from '#es6/importAll';

describe('importAll()', ()=> {

	it('should import file globs in a logical order', async ()=>
		expect(await importAll('./data/sort-*.js'))
			.to.deep.equal([
				{default: 'a'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'b'},
				{default: 'z'},
			])
	);

	it('should import file globs once (using uniq)', async ()=>
		expect(await importAll([
			'./data/sort-*.js',
			'./data/sort-*.js',
			'./data/sort-*.js',
		]))
			.to.deep.equal([
				{default: 'a'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'b'},
				{default: 'z'},
			])
	);

	it('should import file globs multiple times (using !uniq)', async ()=>
		expect(await importAll([
			'./data/sort-b*.js',
			'./data/sort-b*.js',
			'./data/sort-b*.js',
		], {uniq: false}))
			.to.deep.equal([
				{default: 'b'},
				{default: 'b'},
				{default: 'b'},
			])
	);

	it('should preserve path set order', async ()=>
		expect(await importAll([
			'./data/sort-b*.js',
			'./data/sort-c*.js',
			'./data/sort-a*.js',
			'./data/sort-*.js',
		]))
			.to.deep.equal([
				{default: 'b'},
				{default: 'a'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'z'},
			])
	);

});

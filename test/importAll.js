import {expect} from 'chai';
import importAll from '#es6/importAll';

describe('importAll()', ()=> {

	it('should import file globs in a logical order', async ()=>
		expect(await importAll('./data/sort-*.js'))
			.to.deep.equal([
				{default: 'a', init: 'a-init'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'b', init: 'b-init'},
				{default: 'z', init: 'z-init'},
			])
	);

	it('should import file globs once (using uniq)', async ()=>
		expect(await importAll([
			'./data/sort-*.js',
			'./data/sort-*.js',
			'./data/sort-*.js',
		]))
			.to.deep.equal([
				{default: 'a', init: 'a-init'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'b', init: 'b-init'},
				{default: 'z', init: 'z-init'},
			])
	);

	it('should import file globs multiple times (using !uniq)', async ()=>
		expect(await importAll([
			'./data/sort-b*.js',
			'./data/sort-b*.js',
			'./data/sort-b*.js',
		], {uniq: false}))
			.to.deep.equal([
				{default: 'b', init: 'b-init'},
				{default: 'b', init: 'b-init'},
				{default: 'b', init: 'b-init'},
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
				{default: 'b', init: 'b-init'},
				{default: 'a', init: 'a-init'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'z', init: 'z-init'},
			])
	);

	it('export all methods in order - init() AND default()', async()=>
		expect(await importAll([
			'./data/sort-?.js',
		]))
			.to.deep.equal([
				{init: 'a-init', default: 'a'},
				{init: 'b-init', default: 'b'},
				{init: 'z-init', default: 'z'},
			])
	);

	it('run methods in order - init() AND default()', async()=>
		expect(await importAll([
			'./data/sort-?.js',
		], {
			method: ['init', 'default'],
			methodPerCycle: false,
		}))
			.to.deep.equal([
				{init: 'a-init', default: 'a'},
				{init: 'b-init', default: 'b'},
				{init: 'z-init', default: 'z'},
			])
	);

	it('run methods in order - all(init()) + all(default())', async()=>
		expect(await importAll([
			'./data/sort-?.js',
		], {
			method: ['init', 'default'],
			methodPerCycle: true,
		}))
			.to.deep.equal([
				{init: 'a-init'},
				{init: 'b-init'},
				{init: 'z-init'},
				{default: 'a'},
				{default: 'b'},
				{default: 'z'},
			])
	);

});

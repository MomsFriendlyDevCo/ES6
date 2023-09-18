import {expect} from 'chai';
import importAll from '#es6/importAll';

describe('importAll()', ()=> {

	it('should import file globs in a logical order', async ()=> {
		let res = await importAll('./data/sort-*.js');
		expect(res).to.be.an('array');

		expect(res[0]).to.deep.equal({default: 'a', init: 'a-init'});
		expect(res[1]).to.deep.equal({default: 'a.a'});
		expect(res[2]).to.deep.equal({default: 'a.b'});
		expect(res[3]).to.deep.equal({default: 'a.c'});

		expect(res[4]).to.have.property('default', 'b');
		expect(res[4]).to.have.property('init');
		expect(res[4].init).to.be.a('function');

		expect(res[5]).to.have.property('default', 'z');
		expect(res[5]).to.have.property('init');
		expect(res[5].init).to.be.a('function');

		expect(res).to.have.length(6);
	});

	it('should import file globs once (using uniq)', async ()=> {
		let res = await importAll([
			'./data/sort-*.js',
			'./data/sort-*.js',
			'./data/sort-*.js',
		]);
		expect(res).to.be.an('array');

		expect(res[0]).to.deep.equal({default: 'a', init: 'a-init'});
		expect(res[1]).to.deep.equal({default: 'a.a'});
		expect(res[2]).to.deep.equal({default: 'a.b'});
		expect(res[3]).to.deep.equal({default: 'a.c'});

		expect(res[4]).to.have.property('default', 'b');
		expect(res[4]).to.have.property('init');
		expect(res[4].init).to.be.a('function');

		expect(res[5]).to.have.property('default', 'z');
		expect(res[5]).to.have.property('init');
		expect(res[5].init).to.be.a('function');

		expect(res).to.have.length(6);
	});

	it('should import file globs multiple times (using !uniq)', async ()=> {
		let res = await importAll([
			'./data/sort-b*.js',
			'./data/sort-b*.js',
			'./data/sort-b*.js',
		], {uniq: false});
		expect(res).to.be.an('array');

		expect(res[0]).to.have.property('default', 'b');
		expect(res[0]).to.have.property('init');
		expect(res[0].init).to.be.a('function');

		expect(res[1]).to.have.property('default', 'b');
		expect(res[1]).to.have.property('init');
		expect(res[1].init).to.be.a('function');

		expect(res[2]).to.have.property('default', 'b');
		expect(res[2]).to.have.property('init');
		expect(res[2].init).to.be.a('function');

		expect(res).to.have.length(3);
	});

	it('should preserve path set order', async ()=> {
		let res = await importAll([
			'./data/sort-b*.js',
			'./data/sort-c*.js',
			'./data/sort-a*.js',
			'./data/sort-*.js',
		]);

		expect(res[0]).to.have.property('default', 'b');
		expect(res[0]).to.have.property('init');
		expect(res[0].init).to.be.a('function');

		expect(res[1]).to.deep.equal({default: 'a', init: 'a-init'});
		expect(res[2]).to.deep.equal({default: 'a.a'});
		expect(res[3]).to.deep.equal({default: 'a.b'});
		expect(res[4]).to.deep.equal({default: 'a.c'});

		expect(res[5]).to.have.property('default', 'z');
		expect(res[5]).to.have.property('init');
		expect(res[5].init).to.be.a('function');

		expect(res).to.have.length(6);
	});

	it('export all methods in order - init() AND default()', async() => {
		let res = await importAll([
			'./data/sort-?.js',
		]);

		expect(res[0]).to.deep.equal({default: 'a', init: 'a-init'});

		expect(res[1]).to.have.property('default', 'b');
		expect(res[1]).to.have.property('init');
		expect(res[1].init).to.be.a('function');

		expect(res[2]).to.have.property('default', 'z');
		expect(res[2]).to.have.property('init');
		expect(res[2].init).to.be.a('function');

		expect(res).to.have.length(3);
	});

	it('run methods in order - init() AND default()', async() => {
		let res = await importAll([
			'./data/sort-?.js',
		], {
			method: ['init', 'default'],
			methodPerCycle: false,
		});

		expect(res[0]).to.deep.equal({default: 'a', init: 'a-init'});

		expect(res[1]).to.have.property('default', 'b');
		expect(res[1]).to.have.property('init', 'b-init'); // Will have resolved

		expect(res[2]).to.have.property('default', 'z');
		expect(res[2]).to.have.property('init', 'z-init'); // Will have resolved

		expect(res).to.have.length(3);
	});

	it('run methods in order - all(init()) + all(default())', async() => {
		let res = await importAll([
			'./data/sort-?.js',
		], {
			method: ['init', 'default'],
			methodPerCycle: true,
		});

		expect(res).to.be.deep.equal([
			{init: 'a-init'},
			{init: 'b-init'},
			{init: 'z-init'},
			{default: 'a'},
			{default: 'b'},
			{default: 'z'},
		]);
	});

});

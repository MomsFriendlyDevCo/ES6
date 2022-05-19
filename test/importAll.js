import {expect} from 'chai';
import importAll from '#es6/importAll';

describe('importAll()', ()=> {

	it('should import file globs in a logical order', async ()=>
		expect(await importAll('./test/data/sort-*.js'))
			.to.deep.equal([
				{default: 'a'},
				{default: 'a.a'},
				{default: 'a.b'},
				{default: 'a.c'},
				{default: 'b'},
				{default: 'z'},
			])
	);

});

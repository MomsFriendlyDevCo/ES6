/**
* NOTE: This testkit assumes that `depcheck` is installed globally
*/

import discover from '#es6/discover';
import {expect} from 'chai';

describe('discover()', function() {
	this.timeout(60 * 1000);

	it('should be able to query global modules', ()=>
		discover({
			local: false,
			global: true,
		})
			.then(modules => {
				expect(modules).to.be.an('array');
				expect(modules).to.have.length.above(0);
			})
	);

	it('should be able to query global modules by RegExp', ()=>
		discover({
			filter: /^depcheck/,
		})
			.then(modules => {
				expect(modules).to.be.an('array');
				expect(modules).to.have.length.above(0);
				modules.forEach(mod => {
					expect(mod.id).to.match(/^depcheck/);
				});
			})
	);

});

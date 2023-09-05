const expect = require('chai').expect;
const {backport} = require('../lib/cjs/index.cjs');

describe('backport()', ()=> {

	it('can backport ESM modules to CJS', ()=>
		backport('execa')
			.then(res => {
				expect(res).to.not.be.a('function'); // ... its a weird meta-object thing
				expect(res).to.have.property('execa');
				expect(res.execa).to.be.a('function');

				return res.execa('echo', ['Hello World'])
					.then(({stdout}) => expect(stdout).to.be.equal('Hello World'))
			})
	);

	it('can backport one ESM sub-module to CJS', ()=>
		backport('execa', 'execa') // Extract 'execa' export only
			.then(execa => {
				expect(execa).to.be.a('function'); // ... its a weird meta-object thing

				return execa('echo', ['Hello World 2'])
			})
			.then(({stdout}) => expect(stdout).to.be.equal('Hello World 2'))
	);

});

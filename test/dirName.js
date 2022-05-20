import {expect} from 'chai';
import dirName from '#es6/dirName';


// Horrible suggested way to get the __dirname
import {dirname} from 'path';
import {fileURLToPath} from 'url';
let __dirname = dirname(fileURLToPath(import.meta.url));


describe('dirName()', ()=> {

	it('should get the dirname of this test script', ()=> {
		expect(dirName()).to.deep.equal(__dirname);
	});

	it('should get the full path of this test script', ()=> {
		expect(dirName({includeFilename: true})).to.deep.equal(`${__dirname}/dirName.js`);
	});

});

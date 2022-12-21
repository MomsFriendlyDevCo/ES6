import {expect} from 'chai';
import dirName from '#es6/dirName';
import fsPath from 'node:path';


// Horrible suggested way to get the __dirname
import {dirname} from 'path';
import {fileURLToPath} from 'url';
let __dirname = dirname(fileURLToPath(import.meta.url));


describe('dirName()', ()=> {

	it('should get the dirname of this test script', ()=> {
		let res = dirName();
		expect(res).to.deep.equal(__dirname);
		expect(res).to.not.match(/\/\.{1,2}\//, 'No relative path segments');
		expect(res).to.deep.equal(fsPath.normalize(res), 'Path is already normalized');
	});

	it('should get the parent dirname of this test script', ()=> {
		let res = dirName('..');
		let realPath = fsPath.resolve(__dirname, '..');
		expect(res).to.deep.equal(realPath);
		expect(res).to.not.match(/\/\.{1,2}\//, 'No relative path segments');
		expect(res).to.not.match(/\/test$/, 'Should not be this test directory');
		expect(res).to.deep.equal(fsPath.normalize(res), 'Path is already normalized');

		res = dirName({translateFileProtocol: false, relativeTo: '..'})
		expect(res).to.not.match(/\/\.{1,2}\//, 'No relative path segments');
		expect(res).to.not.match(/\/test$/, 'Should not be this test directory');
		expect(res).to.deep.equal(fsPath.normalize(res), 'Path + protocol is already normalized');
	});

	it('should get the full path of this test script', ()=> {
		let res = dirName({includeFilename: true});
		expect(res).to.deep.equal(`${__dirname}/dirName.js`);
	});

});

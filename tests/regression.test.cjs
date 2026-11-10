const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const name of fs.readdirSync(path.join(__dirname,'reference')))test('V9.7 '+name+' is unchanged',()=>assert.equal(fs.readFileSync(path.join(__dirname,'../app/js',name),'utf8'),fs.readFileSync(path.join(__dirname,'reference',name),'utf8')));
test('version alias equals landing page',()=>assert.equal(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),fs.readFileSync(path.join(__dirname,'../promyan_wt_tuksa9.8.html'),'utf8')));

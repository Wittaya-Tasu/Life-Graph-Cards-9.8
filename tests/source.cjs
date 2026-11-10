const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script[^>]*src="(app\/[^"?]+)[^"]*"[^>]*><\/script>/g)].map(m=>({name:m[1],code:fs.readFileSync(path.join(root,m[1]),'utf8')}));
const source=scripts.filter(s=>!/(studio|auth|bootstrap)\.js$/.test(s.name)).map(s=>s.code).join('\n');
const css=fs.readdirSync(path.join(root,'app/css')).filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(path.join(root,'app/css',f),'utf8')).join('\n');
module.exports={html,scripts,source,css};

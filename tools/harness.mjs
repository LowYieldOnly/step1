/* Shared plumbing for the checks in tools/checks/.
   Every check needs the same four things — serve the repo, open a browser, load
   the app, and tally pass/fail — so they live here once instead of being copied
   into each file and drifting.

   Nothing here knows anything about BRODY MODE. The app-specific setup (making a
   plan, opening a tab) belongs in each check. */
import { chromium, devices } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES = {'.html':'text/html','.json':'application/json','.js':'text/javascript',
  '.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};

/* Serve the repo exactly as GitHub Pages does: static files from the root, index.html
   at /. Port 0 lets the OS pick a free one, so two checks can run at the same time. */
function serve(){
  return new Promise(res=>{
    const s=http.createServer((req,rq)=>{
      try{
        const rel=(req.url==='/'?'/index.html':req.url.split('?')[0]);
        const file=path.join(REPO,path.normalize(rel).replace(/^(\.\.[/\\])+/,''));
        if(!file.startsWith(REPO))throw new Error('outside repo');
        rq.setHeader('content-type',TYPES[path.extname(file)]||'application/octet-stream');
        rq.end(fs.readFileSync(file));
      }catch(e){rq.statusCode=404;rq.end();}
    }).listen(0,()=>res(s));
  });
}

/* Playwright's own browser unless the environment pins one (CI images often do).
   Falling back keeps these runnable on a laptop after `npm install`. */
function chromiumPath(){
  const pinned=process.env.PLAYWRIGHT_CHROMIUM;
  if(pinned&&fs.existsSync(pinned))return pinned;
  if(fs.existsSync('/opt/pw-browsers/chromium'))return '/opt/pw-browsers/chromium';
  return undefined;
}

/* Opens the app and waits for the catalog, which almost every screen needs.
   `mobile:true` uses an iPhone 13 viewport — several bugs only appeared there. */
export async function openApp(opts={}){
  const server=await serve();
  const port=server.address().port;
  const exe=chromiumPath();
  const browser=await chromium.launch(exe?{executablePath:exe}:{});
  const ctx=await browser.newContext(opts.mobile
    ? {viewport:devices['iPhone 13'].viewport}
    : {viewport:{width:1280,height:1000}});
  const page=await ctx.newPage();
  const errors=[];   // uncaught page errors — a check that ignores these can pass on a broken screen
  const requests=[]; // off-site requests, for checks that assert a tab loads nothing external
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(!r.url().startsWith('http://localhost:'+port))requests.push(r.url());});
  await page.goto('http://localhost:'+port+'/');
  await page.waitForTimeout(300);
  if(opts.catalog!==false)await page.evaluate(()=>new Promise(r=>loadCatalog(r)));
  await page.waitForTimeout(150);
  return {browser,ctx,page,errors,requests,port,
    async mobilePage(){                       // a second page at phone size, sharing the server
      const m=await ctx.newPage();
      await m.setViewportSize(devices['iPhone 13'].viewport);
      m.on('pageerror',e=>errors.push('[mobile] '+String(e)));
      await m.goto('http://localhost:'+port+'/');
      await m.waitForTimeout(300);
      await m.evaluate(()=>new Promise(r=>loadCatalog(r)));
      await m.waitForTimeout(150);
      return m;
    },
    async close(){await browser.close();server.close();}};
}

/* Tally. `chk(name, condition, detail)` — the detail is only printed on failure,
   and should carry the numbers that explain WHY, so a red line is diagnosable
   without re-running anything. */
export function checker(title){
  const rows=[];
  const chk=(name,ok,detail='')=>rows.push({name,ok:!!ok,detail:String(detail)});
  const report=()=>{
    rows.forEach(r=>console.log((r.ok?'✓ ':'✗ FAIL ')+r.name+(r.ok?'':'  — '+r.detail)));
    const bad=rows.filter(r=>!r.ok).length;
    console.log('\n'+(rows.length-bad)+'/'+rows.length+' passed'+(title?'  ·  '+title:''));
    return bad;
  };
  return {chk,report};
}

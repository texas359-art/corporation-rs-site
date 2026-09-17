import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseURL=process.env.VISUAL_QA_BASE_URL||'http://127.0.0.1:4173';
const outputDir=path.resolve('visual-qa-output');
const viewports=[
  {name:'mobile-390',width:390,height:844},
  {name:'mobile-430',width:430,height:932},
  {name:'tablet-768',width:768,height:1024},
  {name:'desktop-1440',width:1440,height:900},
  {name:'desktop-1920',width:1920,height:1080},
];

await fs.rm(outputDir,{recursive:true,force:true});
await fs.mkdir(outputDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];

for(const viewport of viewports){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},deviceScaleFactor:1,isMobile:viewport.width<768,hasTouch:viewport.width<768});
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  const response=await page.goto(new URL('/',baseURL).href,{waitUntil:'networkidle',timeout:30000});
  await page.waitForTimeout(350);
  const metrics=await page.evaluate(()=>{
    const root=document.documentElement;
    const body=document.body;
    const brokenImages=[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(img=>img.currentSrc||img.src);
    const projectOverlaps=[];
    document.querySelectorAll('.project').forEach((project,index)=>{
      const gallery=project.querySelector('.project__gallery');
      const info=project.querySelector('.project__info');
      if(!gallery||!info)return;
      const a=gallery.getBoundingClientRect();
      const b=info.getBoundingClientRect();
      const ow=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
      const oh=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      if(ow>2&&oh>2)projectOverlaps.push({index:index+1,width:Math.round(ow),height:Math.round(oh)});
    });
    return {
      documentWidth:Math.max(root.scrollWidth,body.scrollWidth),
      viewportWidth:innerWidth,
      brokenImages,
      projectOverlaps,
    };
  });
  const base=`home__${viewport.name}`;
  await page.screenshot({path:path.join(outputDir,`${base}__viewport.png`),fullPage:false,animations:'disabled'});
  await page.screenshot({path:path.join(outputDir,`${base}__full.png`),fullPage:true,animations:'disabled'});
  results.push({viewport:viewport.name,status:response?.status()??0,horizontalOverflow:metrics.documentWidth>metrics.viewportWidth+1,brokenImages:metrics.brokenImages,projectOverlaps:metrics.projectOverlaps,pageErrors});
  await context.close();
}
await browser.close();

const fatal=results.filter(r=>r.status===0||r.status>=400||r.horizontalOverflow||r.brokenImages.length||r.projectOverlaps.length||r.pageErrors.length);
const report={generatedAt:new Date().toISOString(),baseURL,results,fatalCount:fatal.length};
await fs.writeFile(path.join(outputDir,'report.json'),JSON.stringify(report,null,2),'utf8');
const md=['# Visual QA','',`Fatal checks: ${fatal.length}`,'','| Viewport | HTTP | Overflow | Broken images | Project overlaps |','|---|---:|---:|---:|---:|',...results.map(r=>`| ${r.viewport} | ${r.status} | ${r.horizontalOverflow?'YES':'no'} | ${r.brokenImages.length} | ${r.projectOverlaps.length} |`)];
await fs.writeFile(path.join(outputDir,'report.md'),md.join('\n'),'utf8');
console.log(md.join('\n'));
if(fatal.length)process.exitCode=1;

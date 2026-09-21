const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const {serve} = require('./server.cjs');
const ROOT = path.resolve(__dirname,'..');
const PAGES = ['index.html','research.html','professor.html','members.html','projects.html','news.html','join.html'];
const EXPECTED = ['차규현 교수','하수기반역학','차규현','연구관심분야','PFAS','소식','연구실 연락처'];

async function check() {
  const server=await serve(path.join(ROOT,'dist'));
  let browser;
  try {
    browser=await chromium.launch(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{});
    const staticContext=await browser.newContext({javaScriptEnabled:false});
    await staticContext.route('**/*',route=>route.request().url().startsWith(server.url)?route.continue():route.abort());
    const titles=new Set();
    for (let i=0;i<PAGES.length;i++) {
      const page=await staticContext.newPage();
      const response=await page.goto(server.url+'/'+PAGES[i]);
      assert.equal(response.status(),200);
      assert((await page.locator('body').innerText()).includes(EXPECTED[i]),'Static text missing: '+PAGES[i]);
      assert.equal(await page.locator('#navList a').count(),7);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://ghcha90.github.io/'+(i===0?'':PAGES[i]));
      const title=await page.title();assert(title.includes('차규현'));titles.add(title);
      const schema=JSON.parse(await page.locator('#structured-data').textContent());assert.equal(schema['@graph'].length,4);
      assert.equal(await page.locator('#loadmsg').isVisible(),false);
      await page.close();
    }
    assert.equal(titles.size,7,'Titles must be unique');
    await staticContext.close();
    const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',route=>route.request().url().startsWith(server.url)?route.continue():route.abort());
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await fs.mkdir(path.join(ROOT,'test-results'),{recursive:true});
    await page.goto(server.url+'/');
    await page.waitForFunction(()=>document.documentElement.dataset.contentReady==='true');
    await page.screenshot({path:path.join(ROOT,'test-results/home-desktop.png'),fullPage:true});
    assert.equal(await page.locator('#heroTitle').innerText(),'Environmental Microbiology & Genomics');
    await page.locator('#lang').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert((await page.title()).includes('Gyuhyon Cha'));
    assert((await page.locator('meta[name="description"]').getAttribute('content')).includes('Gyuhyon Cha'));
    await page.locator('#navList a[href="professor.html"]').click();
    await page.waitForFunction(()=>document.documentElement.dataset.contentReady==='true');
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert((await page.locator('#pi').innerText()).includes('Assistant Professor'));
    await page.locator('#lang').click();
    assert((await page.title()).includes('차규현 교수 소개'));
    await page.screenshot({path:path.join(ROOT,'test-results/professor-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    for (const file of PAGES) {
      await page.goto(server.url+'/'+file);
      await page.waitForFunction(()=>document.documentElement.dataset.contentReady==='true');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Mobile overflow: '+file);
      assert.equal(await page.locator('#navList a').count(),7);
      const broken=await page.locator('img').evaluateAll(images=>images.filter(img=>img.getBoundingClientRect().width>0 && img.loading!=='lazy' && (!img.complete||img.naturalWidth===0)).map(img=>img.src));
      assert.deepEqual(broken,[],'Broken images: '+file);
      if(file==='index.html')await page.screenshot({path:path.join(ROOT,'test-results/home-mobile.png'),fullPage:true});
    }
    await page.goto(server.url+'/publications.html');
    await page.waitForURL('**/professor.html#pi');
    await page.waitForFunction(()=>document.documentElement.dataset.contentReady==='true');
    assert.deepEqual(errors,[],'Browser errors');
    await context.close();
    const fallback=await browser.newContext();
    await fallback.route('**/content/*.json',route=>route.abort());
    const fallbackPage=await fallback.newPage();
    await fallbackPage.goto(server.url+'/');
    assert((await fallbackPage.locator('#heroSub').innerText()).includes('차규현 교수'));
    assert.equal(await fallbackPage.locator('#loadmsg').isVisible(),false);
    await fallback.close();
    const sitemap=await fs.readFile(path.join(ROOT,'dist/sitemap.xml'),'utf8');
    assert.equal((sitemap.match(/<loc>/g)||[]).length,7);
    assert(!sitemap.includes('publications.html'));
    const files=await fs.readdir(path.join(ROOT,'dist'));
    for(const privateFile of ['.git','.github','scripts','package.json','.pages.yml'])assert(!files.includes(privateFile));
    console.log('PASS: seven static pages; unique metadata; bilingual navigation; mobile layout; images; redirect; failed-fetch fallback; sitemap; public-only output.');
  } finally {
    if(browser)await browser.close();
    await server.close();
  }
}
check().catch(error=>{console.error(error);process.exitCode=1;});

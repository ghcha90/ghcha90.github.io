// Render the existing bilingual UI at build time, using the same CMS JSON and renderer.
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require('playwright');
const {serve} = require('./server.cjs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const BASE = 'https://ghcha90.github.io/';
const PAGES = ['index.html','research.html','professor.html','members.html','projects.html','news.html','join.html'];
const escapeXML = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

async function build() {
  const data = {};
  for (const name of ['site','pi','research','projects','publications','teaching','people','news','admissions']) {
    data[name] = JSON.parse(await fs.readFile(path.join(ROOT, 'content', name+'.json'), 'utf8'));
  }
  // Only this build's fixed output directory is ever cleared.
  await fs.rm(OUT, {recursive:true, force:true});
  await fs.mkdir(OUT, {recursive:true});
  for (const dir of ['assets','content','media']) await fs.cp(path.join(ROOT,dir), path.join(OUT,dir), {recursive:true});
  for (const file of ['.nojekyll','publications.html','robots.txt']) await fs.copyFile(path.join(ROOT,file), path.join(OUT,file));
  const server = await serve(ROOT);
  let browser;
  try {
    browser = await chromium.launch(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {});
    const context = await browser.newContext({reducedMotion:'reduce'});
    await context.route('**/*', route => route.request().url().startsWith(server.url) ? route.continue() : route.abort());
    for (const file of PAGES) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(server.url+'/'+file);
      await page.waitForFunction(() => document.documentElement.dataset.contentReady === 'true');
      if (errors.length) throw new Error(file+': '+errors.join('; '));
      const canonical = BASE + (file==='index.html' ? '' : file);
      const person = {'@type':'Person','@id':BASE+'#gyuhyon-cha',name:'차규현',alternateName:'Gyuhyon Cha',url:BASE+'professor.html',image:BASE+data.pi.photo,jobTitle:data.pi.position_ko,affiliation:{'@type':'CollegeOrUniversity',name:'수원대학교',alternateName:'University of Suwon'},sameAs:[data.pi.scholar_url,data.pi.linkedin_url].filter(Boolean)};
      const org = {'@type':'Organization','@id':BASE+'#lab',name:'수원대학교 차규현 교수 연구실',alternateName:'Gyuhyon Lab',url:BASE,email:data.site.email,parentOrganization:person.affiliation};
      const website = {'@type':'WebSite','@id':BASE+'#website',name:'차규현 교수 연구실',alternateName:'Gyuhyon Lab',url:BASE,publisher:{'@id':BASE+'#lab'},inLanguage:'ko'};
      const webpage = {'@type':file==='professor.html'?'ProfilePage':'WebPage','@id':canonical+'#webpage',url:canonical,name:await page.title(),isPartOf:{'@id':BASE+'#website'},inLanguage:'ko',about:{'@id':BASE+'#lab'}};
      if (file==='professor.html') webpage.mainEntity={'@id':BASE+'#gyuhyon-cha'};
      const schema = {'@context':'https://schema.org','@graph':[org,person,website,webpage]};
      await page.evaluate(schema => {
        document.querySelector('#structured-data')?.remove();
        const script = document.createElement('script');
        script.id='structured-data'; script.type='application/ld+json';
        script.textContent=JSON.stringify(schema).replace(/</g,'\\u003c');
        document.head.append(script);
        // Preserve the static content when runtime JSON requests fail.
        document.documentElement.dataset.prerendered='true';
        delete document.documentElement.dataset.contentReady;
        document.documentElement.classList.remove('js');
        document.querySelectorAll('.rv').forEach(el => el.classList.remove('in'));
        document.querySelector('#loadmsg').hidden=true;
      }, schema);
      const html = await page.content();
      await fs.writeFile(path.join(OUT,file), html+'\n');
      console.log('Rendered '+file);
      await page.close();
    }
    await context.close();
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
  const urls=PAGES.map(file => BASE+(file==='index.html'?'':file));
  await fs.writeFile(path.join(OUT,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'  <url><loc>'+escapeXML(url)+'</loc></url>').join('\n')+'\n</urlset>\n');
  console.log('Built 7 searchable pages and sitemap in dist/');
}
build().catch(error => {console.error(error);process.exitCode=1;});

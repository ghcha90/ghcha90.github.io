
(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var LANG='ko', D={}, AREA={wbe:'var(--c-wbe)',meta:'var(--c-meta)',arg:'var(--c-arg)',mat:'var(--c-mat)',none:'var(--ink-3)'};
var PAGE=document.body.dataset.page||'home';
try{LANG=localStorage.getItem('gyuhyon-language')==='en'?'en':'ko';}catch(e){}
var NAV=[['home','홈','Home','index.html'],['research','연구','Research','research.html'],['pi','교수 소개','Professor','professor.html'],['members','구성원','Members','members.html'],['projects','연구과제','Projects','projects.html'],['news','소식','News','news.html'],['join','모집','Join & Contact','join.html']];
var GROUPS={home:[],news:['news'],research:['research'],pi:['pi','teaching'],members:['people'],publications:['publications'],projects:['projects'],join:['join','admissions']};


function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function t(o,k){ if(!o) return ''; var v=o[k+'_'+LANG]; if(v===undefined) v=o[LANG]; 
  if(v===undefined||v==='') v=(o[k+'_ko']!==undefined?o[k+'_ko']:o.ko); return v==null?'':v; }
function el(id){return document.getElementById(id);}
function nl2br(s){return esc(s).replace(/\n/g,'<br>');}

/* ---------- decorative SVG ---------- */
var P=el('parts');
if(P){var sh=[['#7FD1C4',5],['#D8A83C',4],['#C8384C',4],['#9C7FD1',5],['#6FA8B8',3]];
 for(var i=0;i<34;i++){var s=sh[i%sh.length],c=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
  c.setAttribute('cx',-30);c.setAttribute('cy',366+Math.random()*46);
  c.setAttribute('rx',s[1]+Math.random()*2);c.setAttribute('ry',s[1]*0.72);
  c.setAttribute('fill',s[0]);c.setAttribute('opacity',(0.45+Math.random()*0.45).toFixed(2));
  c.setAttribute('class','flow');c.style.animationDuration=(9+Math.random()*8).toFixed(1)+'s';
  c.style.animationDelay=(-Math.random()*16).toFixed(1)+'s';P.appendChild(c);}}
var C=el('cov');
if(C){for(var j=0;j<30;j++){var h=6+Math.abs(Math.sin(j*0.9))*28+Math.random()*8;
  var r=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x',1232+j*4.6);r.setAttribute('width',3);r.setAttribute('y',238-h);r.setAttribute('height',h);
  r.setAttribute('fill',h>28?'#D8A83C':'#3E8E8A');r.setAttribute('opacity','.9');
  if(!reduce){r.style.transformOrigin='bottom';r.style.animation='rise .7s cubic-bezier(.2,.8,.3,1) backwards';
   r.style.animationDelay=(600+j*22)+'ms';}C.appendChild(r);}
 var st=document.createElement('style');st.textContent='@keyframes rise{from{transform:scaleY(.05)}to{transform:scaleY(1)}}';
 document.head.appendChild(st);}

/* ---------- load content ---------- */
var FILES=['site','pi','research','projects','publications','teaching','people','news','admissions'];
Promise.all(FILES.map(function(n){
  return fetch('content/'+n+'.json',{cache:'no-cache'}).then(function(r){
    if(!r.ok) throw new Error(n); return r.json();}).catch(function(){return null;});
})).then(function(res){
  FILES.forEach(function(n,i){D[n]=res[i];});
  if(!D.site){el('loadmsg').textContent='페이지를 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';return;}
  el('loadmsg').hidden=true;
  render(); initUI();
});

/* ---------- render ---------- */
function render(){
  document.documentElement.lang=LANG;document.documentElement.dataset.lang=LANG;el('lang').textContent=LANG==='ko'?'English':'한국어';
  var s=D.site;
  document.querySelectorAll('[data-i18n]').forEach(function(n){
    var p=n.dataset.i18n.split('|'); n.textContent = LANG==='en' ? (p[1]||p[0]) : p[0];});

  el('brandName').textContent=t(s,'lab_name');
  el('brandTag').textContent=s.lab_tag||'';
  document.title=t(s,'lab_name')+' · '+(LANG==='ko'?'수원대학교':'University of Suwon');
  el('heroTitle').textContent=t(s,'hero_headline');
  el('heroSub').innerHTML=t(s,'hero_sub').split(/\n\s*\n/).map(function(p){return '<p>'+esc(p)+'</p>';}).join('');
  el('heroCredit').textContent=t(s,'hero_credit');
  el('researchTitle').textContent=t(s,'research_title');
  el('researchLede').textContent=t(s,'research_lede');
  el('joinTitle').textContent=t(s,'join_title');
  el('joinLede').textContent=t(s,'join_lede');
  el('cEmail').innerHTML='<a href="mailto:'+esc(s.email)+'">'+esc(s.email)+'</a>';
  el('cPhone').innerHTML='<a href="tel:'+esc(s.phone_link||s.phone)+'">'+esc(s.phone)+'</a>';
  el('cAddr').innerHTML=nl2br(t(s,'address'));
  el('footer').textContent=t(s,'footer');
  el('joinPoints').innerHTML=(s.join_points||[]).map(function(p){
    return '<li>'+esc(LANG==='en'?(p.en||p.ko):p.ko)+'</li>';}).join('');
  show('join',true);
  var admissions=D.admissions;
  if(admissions){
    [['admissionsTitle','title'],['admissionsIntro','intro'],['admissionsSpring','spring'],['admissionsFall','fall'],['admissionsNote','note'],['admissionsOffice','office']].forEach(function(pair){el(pair[0]).textContent=t(admissions,pair[1]);});
    el('admissionsLink').href=admissions.url;
    el('admissionsPhones').innerHTML=(LANG==='en'?'Phone: ':'전화: ')+(admissions.phones||[]).map(function(number){return '<a href="tel:'+esc(number.replace(/^0/,'+82').replace(/-/g,''))+'">'+esc(number)+'</a>';}).join(' · ');
    el('admissionsEmail').innerHTML='Email: <a href="mailto:'+esc(admissions.email)+'">'+esc(admissions.email)+'</a>';
  }
  show('admissions',!!admissions);


  /* Compact research areas */
  var R=D.research||[];
  el('researchCards').innerHTML=R.map(function(a,i){
    return '<article class="card" style="--k:'+(AREA[a.area]||AREA.none)+'">'
      +(a.image?'<img class="research-illustration" src="'+esc(a.image)+'" alt="'+esc(t(a,'image_alt'))+'" width="1254" height="1254" loading="lazy">':'')
      +'<p class="idx"><i></i>0'+(i+1)+'</p><h3>'+esc(t(a,'title'))+'</h3>'
      +'<p>'+esc(t(a,'summary'))+'</p></article>';}).join('');
  show('research',R.length>0);

  /* PI */
  var p=D.pi;
  if(p){
    el('piName').textContent=t(p,'name');
    el('piPosition').textContent=t(p,'position');
    el('piAffiliation').textContent=t(p,'affiliation');
    el('piAddress').innerHTML=nl2br(t(s,'address'));
    el('piEmail').innerHTML='Email: <a href="mailto:'+esc(s.email)+'">'+esc(s.email)+'</a>';
    el('piPhone').innerHTML='Tel: <a href="tel:'+esc(s.phone_link||s.phone)+'">'+esc(s.phone)+'</a>';
    el('piScholar').innerHTML=[['Google Scholar',p.scholar_url],['LinkedIn',p.linkedin_url]].filter(function(x){return x[1];}).map(function(x){return '<a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+x[0]+'</a>';}).join('<span aria-hidden="true"> | </span>');
    el('piPhoto').innerHTML=p.photo?'<img class="portrait" src="'+esc(p.photo)+'" alt="'+esc(t(p,'name'))+'" width="1726" height="2220">':'';
    function cvList(category){return (p.timeline||[]).filter(function(x){return x.category===category;}).map(function(x){
      var when=LANG==='en'?String(x.when||'').replace('현재','Present'):x.when;
      return '<li><div class="cv-title"><strong>'+esc(t(x,'title'))+'</strong><span class="cv-date">'+esc(when)+'</span></div><div class="cv-detail">'+t(x,'detail')+'</div></li>';
    }).join('');}
    el('piEducation').innerHTML=cvList('education');
    el('piExperience').innerHTML=cvList('experience');
    el('piFacts').innerHTML=(p.facts||[]).map(function(x){
      return '<li><strong>'+esc(t(x,'title'))+'</strong>'
        +(t(x,'detail')?'<span>'+esc(t(x,'detail'))+'</span>':'')+'</li>';}).join('');
    show('pi',true);
  }

  /* Members: empty slots are intentionally visible until details are supplied. */
  var PE=D.people||[];
  el('peopleGrid').innerHTML=PE.map(function(m){
    var labels=LANG==='en'?['Photo','Name','Position','Research interests']:['사진','이름','직책','연구관심분야'];
    return '<article class="person">'+(m.photo?'<img src="'+esc(m.photo)+'" alt="'+esc(t(m,'name'))+'">':'<div class="ph">'+labels[0]+'</div>')
      +'<dl>'+['name','role','topic'].map(function(k,i){return '<div><dt>'+labels[i+1]+'</dt><dd>'+esc(t(m,k))+'</dd></div>';}).join('')+'</dl></article>';}).join('');
  show('people',true);

  /* projects */
  var PR=D.projects||[];
  el('projCurrent').innerHTML=PR.filter(function(x){return x.status!=='past';}).map(function(x){
    return '<article class="proj" style="--k:'+(AREA[x.area]||AREA.none)+'">'
      +'<h3>'+t(x,'title')+'</h3>'
      +'<p class="line">'+esc(t(x,'funding'))+'</p>'
      +(t(x,'summary')?'<p class="line">'+esc(t(x,'summary'))+'</p>':'')
      +(t(x,'role')?'<span class="role">'+esc(t(x,'role'))+'</span>':'')+'</article>';}).join('');
  el('projPast').innerHTML=PR.filter(function(x){return x.status==='past';}).map(function(x){
    return '<li><span class="when">'+esc(x.when||'')+'</span><span class="what"><strong>'
      +t(x,'title')+'</strong><span>'+esc(t(x,'funding'))+'</span></span></li>';}).join('');
  show('projects',PR.length>0);
  var featured=PR.filter(function(x){return x.status==='current'&&x.feature_title_ko;});
  function feature(x,i){
    return '<article class="project-feature" style="--k:'+(AREA[x.area]||AREA.none)+'">'
      +'<div class="feature-meta"><span>0'+(i+1)+' / '+esc(t(x,'role'))+'</span><span>'+esc(t(x,'funding'))+'</span></div>'
      +'<h3>'+esc(t(x,'feature_title'))+'</h3><p class="feature-question">'+esc(t(x,'question'))+'</p>'
      +'<p class="feature-overview">'+esc(t(x,'overview'))+'</p>'
      +(x.figure?'<figure><a href="'+esc(x.figure)+'" target="_blank" rel="noopener" aria-label="'+(LANG==='en'?'Open full-size figure':'그림 크게 보기')+'"><img src="'+esc(x.figure)+'" alt="'+esc(t(x,'figure_alt'))+'" loading="lazy"></a></figure>':'')
      +'<div class="lab-role"><h4>'+(LANG==='en'?'Gyuhyon Lab’s role':'Gyuhyon Lab의 역할')+'</h4><p>'+esc(t(x,'contribution'))+'</p></div>'
      +'<details class="project-official"><summary>'+(LANG==='en'?'Official project title':'정식 과제명')+'</summary><p>'+esc(t(x,'title'))+'</p></details></article>';
  }
  el('projectFeatures').innerHTML=featured.map(feature).join('');
  show('projectHighlights',featured.length>0);
  if(PAGE==='projects')el('projCurrent').innerHTML=featured.map(feature).join('');


  /* publications */
  var PB=(D.publications||[]).slice().sort(function(a,b){return (b.year||0)-(a.year||0);});
  var picks=['10.1016/j.scitotenv.2024.173468','10.1016/j.watres.2024.121269','10.1111/1462-2920.15785'];
  var headlines=LANG==='ko'?['냉장 없이 핵산을 보존하는 PSAP 비드','하수 감시를 위한 Moore swab의 성능 평가','간작 토양의 미생물 구조와 기능']:['Cold-chain free nucleic acid preservation','Evaluating Moore swabs for sewage monitoring','Microbial structure and function in intercropped soils'];
  el('selectedPapers').innerHTML=picks.map(function(doi,i){var x=PB.find(function(p){return p.doi===doi;});if(!x)return '';return '<article><span class="num">SELECTED / 0'+(i+1)+'</span><h3>'+esc(headlines[i])+'</h3><span class="journal">'+esc(x.journal)+' · '+x.year+'</span><a href="https://doi.org/'+esc(x.doi)+'" target="_blank" rel="noopener">'+(LANG==='ko'?'논문 읽기 ↗':'Read paper ↗')+'</a></article>';}).join('');
  var nFirst=PB.filter(function(x){return x.first_author;}).length;
  el('pubFilter').innerHTML=
     '<button type="button" data-f="all" aria-pressed="true">'+(LANG==='en'?'All ':'전체 ')+PB.length+(LANG==='en'?'':'편')+'</button>'
    +'<button type="button" data-f="first" aria-pressed="false">'+(LANG==='en'?'First author ':'제1저자 ')+nFirst+(LANG==='en'?'':'편')+'</button>'
    +'<button type="button" data-f="wbe" aria-pressed="false">'+(LANG==='en'?'Wastewater epidemiology':'하수기반역학')+'</button>'
    +'<button type="button" data-f="meta" aria-pressed="false">'+(LANG==='en'?'Metagenomics':'환경 메타게놈')+'</button>';
  el('pubList').innerHTML=PB.map(function(x){
    var au=esc(x.authors).replace(/Cha, G\./g,'<b>Cha, G.</b>');
    return '<article class="pub" data-role="'+(x.first_author?'first':'co')+'" data-area="'+esc(x.area||'none')
      +'" style="--k:'+(AREA[x.area]||AREA.none)+'"><div class="yr"><i></i>'+esc(x.year)+'</div><div>'
      +'<p class="ti">'+(x.title||'')+'</p><p class="au">'+au+'</p>'
      +'<p class="jr"><em>'+esc(x.journal)+'</em>'+(x.detail?', '+esc(x.detail):'')+'.'
      +(x.doi?' <a href="https://doi.org/'+esc(x.doi)+'" target="_blank" rel="noopener">DOI</a>':'')
      +'</p></div></article>';}).join('');
  show('publications',PB.length>0);
  var fb=el('pubFilter').querySelectorAll('button'), pubs=el('pubList').querySelectorAll('.pub');
  fb.forEach(function(b){b.addEventListener('click',function(){
    fb.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
    var f=b.dataset.f;
    pubs.forEach(function(q){
      var ok = f==='all' || (f==='first'&&q.dataset.role==='first') || q.dataset.area===f;
      q.style.display=ok?'':'none';});});});

  /* News: newest first; empty until an actual announcement is supplied. */
  var N=(D.news||[]).slice().sort(function(a,b){
    function key(x){return String(x.date||'').replace(/[.\/]/g,'-');}
    return key(b).localeCompare(key(a));
  });
  el('newsList').innerHTML=N.length?N.map(function(x){
    return '<article class="news-item"><header><time>'+esc(x.date||'')+'</time>'
      +(t(x,'title')?'<h3>'+esc(t(x,'title'))+'</h3>':'')+'</header><div class="news-body">'
      +t(x,'body').split(/\n\s*\n/).map(function(p){return '<p>'+nl2br(p)+'</p>';}).join('')+'</div></article>';
  }).join(''):'<p class="news-empty">'+(LANG==='en'?'No announcements yet.':'아직 등록된 소식이 없습니다.')+'</p>';
  show('news',true);

  /* teaching */
  var TC=D.teaching||[];
  el('courseList').innerHTML=TC.map(function(c){
    return '<li>'+esc(LANG==='en'?(c.en||c.ko):c.ko)+'</li>';}).join('');
  show('teaching',TC.length>0);

  buildNav();
}

function show(id,on){ el(id).hidden=!(on && (GROUPS[PAGE]||[]).includes(id)); }

function buildNav(){
  el('navList').innerHTML=NAV.map(function(n){return '<li><a href="'+n[3]+'"'+(n[0]===PAGE?' class="on" aria-current="page"':'')+'>'+(LANG==='en'?n[2]:n[1])+'</a></li>';}).join('');
  var current=NAV.find(function(n){return n[0]===PAGE;})||NAV[0];
  document.title=(PAGE==='home'?'':(LANG==='en'?current[2]:current[1])+' · ')+t(D.site,'lab_name')+' · '+(LANG==='en'?'University of Suwon':'수원대학교');
}

function initUI(){
  var lb=el('lang'), root=document.documentElement;
  lb.addEventListener('click',function(){
    LANG = LANG==='ko' ? 'en':'ko';
    try{localStorage.setItem('gyuhyon-language',LANG);}catch(e){}
    root.setAttribute('lang',LANG); root.setAttribute('data-lang',LANG);
    lb.textContent = LANG==='ko' ? 'English':'한국어';
    render();
    document.querySelectorAll('.rv').forEach(function(x){x.classList.add('in');});
  });
  window.addEventListener('scroll',function(){
    var h=document.documentElement.scrollHeight-window.innerHeight;
    el('prog').style.width=(h>0?(window.scrollY/h*100):0)+'%';},{passive:true});
  if(!reduce){
    var o=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target);}});},
      {rootMargin:'0px 0px -12% 0px'});
    document.querySelectorAll('.rv').forEach(function(x){o.observe(x);});
  } else { document.querySelectorAll('.rv').forEach(function(x){x.classList.add('in');}); }
}
})();

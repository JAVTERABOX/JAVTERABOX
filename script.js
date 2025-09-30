const OPEN_SHEET='https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const PER_PAGE=20,MAX_PAGE_BUTTONS=5,PLACEHOLDER='https://via.placeholder.com/640x360?text=No+Image';
let fullPosts=[],filteredPosts=[],currentPage=1;

function el(id){return document.getElementById(id)}
function safeImg(src){return src||PLACEHOLDER;}

async function init(){
  const resp=await fetch(OPEN_SHEET);
  const json=await resp.json();
  const raw=json.filter(r=>(r['undefined']||r.Trigger||'').toString().toUpperCase().startsWith('FIX'));
  fullPosts=raw.reverse();
  filteredPosts=fullPosts.slice();
  renderList(1);
  setTimeout(showPopupIfNeeded,1200);
  handleHash();
}

function renderList(page=1){
  currentPage=Math.max(1,Math.floor(page));
  const total=filteredPosts.length,totalPages=Math.max(1,Math.ceil(total/PER_PAGE));
  if(currentPage>totalPages) currentPage=totalPages;
  const start=(currentPage-1)*PER_PAGE,pageItems=filteredPosts.slice(start,start+PER_PAGE);
  if(pageItems.length===0){
    el('grid').innerHTML='<div class="msg">No results.</div>';
    el('pagination').innerHTML='';
    return;
  }
  el('grid').innerHTML=pageItems.map(p=>{
    const img=safeImg(p['N']); // ambil dari kolom N
    const code=(p.CODE||'').trim();
    const actress=(p.Actress||'').trim();
    return `<div class="card" onclick="openDetail('${escapeJS(code)}')">
      <div class="thumb"><img src="${img}" onerror="this.src='${PLACEHOLDER}'" alt="${escapeHTML(code+' '+actress)}"/></div>
      <div class="title">${escapeHTML(code+' '+actress)}</div>
    </div>`;
  }).join('');
  renderPagination(totalPages);
  el('listView').classList.remove('hidden');
  el('detailView').classList.add('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderPagination(totalPages){
  const c=el('pagination');
  if(totalPages<=1){c.innerHTML='';return;}
  let s=currentPage-Math.floor(MAX_PAGE_BUTTONS/2);if(s<1)s=1;
  let e=s+MAX_PAGE_BUTTONS-1;if(e>totalPages){e=totalPages;s=Math.max(1,e-MAX_PAGE_BUTTONS+1);}
  let html='';if(currentPage>1)html+=`<button class="pg-btn" onclick="renderList(${currentPage-1})">&lt;</button>`;
  for(let i=s;i<=e;i++){html+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="renderList(${i})">${i}</button>`}
  if(currentPage<totalPages)html+=`<button class="pg-btn" onclick="renderList(${currentPage+1})">&gt;</button>`;
  c.innerHTML=html;
}

function doSearch(){
  const q=(el('search').value||'').trim().toLowerCase();
  const top=el('topMsg');top.classList.add('hidden');
  if(!q){filteredPosts=fullPosts.slice();renderList(1);return;}
  let res=fullPosts.filter(p=>((p.CODE||'')+(p.Actress||'')+(p.Tags||'')).toLowerCase().includes(q));
  if(res.length===0){
    const tokens=q.split(/\s+/).filter(Boolean);
    res=fullPosts.filter(p=>{
      const hay=((p.CODE||'')+' '+(p.Actress||'')+' '+(p.Tags||'')).toLowerCase();
      return tokens.every(t=>hay.includes(t))
    })
  }
  if(res.length===0){
    filteredPosts=fullPosts.slice();
    top.textContent=`No exact matches for "${q}", showing latest.`;
    top.classList.remove('hidden');
    renderList(1);
    return;
  }
  filteredPosts=res.slice();renderList(1)
}

function openDetail(code){
  const post=fullPosts.find(p=>(p.CODE||'').toUpperCase()===code.toUpperCase());
  if(!post)return;
  window.location.hash=code;
  el('detailView').innerHTML=buildDetailHTML(post);
  el('listView').classList.add('hidden');
  el('detailView').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'})
}

function buildDetailHTML(p){
  const code=p.CODE||'',actress=p.Actress||'',tags=(p.Tags||'').split(',').map(s=>s.trim()).filter(Boolean);
  const img=safeImg(p['N']); // ambil dari kolom N
  const link=escapeAttr(p.LINK||'#');
  const tagsHTML=tags.map(t=>`<span onclick="searchTag('${escapeJS(t)}')">${escapeHTML(t)}</span>`).join(' ');
  const actressHTML=(actress||'').split(',').map(a=>`<span onclick="searchTag('${escapeJS(a.trim())}')">${escapeHTML(a.trim())}</span>`).join('');
  const related=fullPosts.filter(x=>(x.CODE||'')!==code).slice(0,6);
  const relatedHTML=related.map(r=>`<div class="related-item" onclick="openDetail('${escapeJS(r.CODE)}')">
      <div class="thumb"><img src="${safeImg(r['N'])}" onerror="this.src='${PLACEHOLDER}'"></div>
      <div class="r-title">${escapeHTML(r.CODE+' '+(r.Actress||''))}</div>
    </div>`).join('');
  return `<div class="detail-wrap">
    <div class="breadcrumb"><a href="javascript:resetToHome()">Home</a> › ${escapeHTML(actress)} › ${escapeHTML(code)}</div>
    <h2 class="detail-title">${escapeHTML(code+' '+actress)}</h2>
    <div style="text-align:center"><div class="poster-wrap">
      <img src="${img}" onerror="this.src='${PLACEHOLDER}'"><div class="play-overlay" onclick="window.open('${link}','_blank')"></div>
    </div></div>
    <div class="download-center"><a class="download-btn" href="${link}" target="_blank">Watch and Download</a></div>
    <div style="text-align:center;margin-top:10px;color:var(--muted)">
      <div><strong>Actress:</strong> ${actressHTML}</div>
      <div style="margin-top:8px"><strong>Tags:</strong> ${tagsHTML||'—'}</div>
    </div>
    <a class="home-btn" href="javascript:resetToHome()">Home</a>
    <div class="related-section"><h3 class="related-title">Related Posts</h3><div class="related-grid">${relatedHTML}</div></div>
  </div>`;
}

function searchTag(tag){el('search').value=tag;doSearch()}
function resetToHome(){el('search').value='';el('topMsg').classList.add('hidden');filteredPosts=fullPosts.slice();renderList(1);window.location.hash='';}
function showPopupIfNeeded(){if(localStorage.getItem('popupClosed'))return;el('popup').classList.remove('hidden')}
function handleHash(){
  if(window.location.hash){
    const code=window.location.hash.replace('#','').toUpperCase();
    const post=fullPosts.find(p=>(p.CODE||'').toUpperCase()===code);
    if(post) openDetail(code);
  }
}

el('popupClose').addEventListener('click',()=>{el('popup').classList.add('hidden');localStorage.setItem('popupClosed','1')})
el('searchBtn').addEventListener('click',doSearch)
el('search').addEventListener('keypress',e=>{if(e.key==='Enter')doSearch()})
window.addEventListener('hashchange',handleHash);

function escapeJS(s){return(s||'').replace(/'/g,"\\'").replace(/"/g,'\\"')}
function escapeHTML(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function escapeAttr(s){return(s||'').replace(/"/g,'&quot;').replace(/'/g,"&#039;")}

init();

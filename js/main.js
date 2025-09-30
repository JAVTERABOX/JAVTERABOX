const OPEN_SHEET='https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const PER_PAGE=20,MAX_PAGE_BUTTONS=5,PLACEHOLDER='assets/placeholder.png';
let fullPosts=[],filteredPosts=[],currentPage=1;

function el(id){return document.getElementById(id)}
function safeImg(src){return src||PLACEHOLDER;}

// Lazy load observer
const lazyObserver = new IntersectionObserver((entries, obs)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove("lazy");
      obs.unobserve(img);
    }
  });
});

async function init(){
  const resp = await fetch(OPEN_SHEET);
  fullPosts = (await resp.json()).reverse();
  filteredPosts = fullPosts.slice();
  renderList(1);
  setTimeout(showPopupIfNeeded,1200);
}

// Render list with pagination
function renderList(page=1){
  currentPage = Math.max(1, Math.floor(page));
  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total/PER_PAGE));
  if(currentPage>totalPages) currentPage=totalPages;
  const start=(currentPage-1)*PER_PAGE;
  const pageItems=filteredPosts.slice(start,start+PER_PAGE);

  if(pageItems.length===0){
    el('grid').innerHTML='<div class="msg">No results.</div>';
    el('pagination').innerHTML='';
    return;
  }

  el('grid').innerHTML = pageItems.map(p=>{
    const img = safeImg(p['LINK FOTO']);
    const code = (p.CODE||'').trim();
    const actress = (p.Actress||'').trim();
    return `<div class="card" onclick="openDetail('${escapeJS(code)}')">
      <div class="thumb">
        <img class="lazy" data-src="${img}" src="${PLACEHOLDER}" onerror="this.src='${PLACEHOLDER}'" alt="${escapeHTML(code+' '+actress)}"/>
      </div>
      <div class="title">${escapeHTML(code+' '+actress)}</div>
    </div>`;
  }).join('');

  // Observe lazy images
  document.querySelectorAll('img.lazy').forEach(img=>lazyObserver.observe(img));

  renderPagination(totalPages);
  el('listView').classList.remove('hidden');
  el('detailView').classList.add('hidden');
  window.scrollTo({top:0,behavior:'smooth'});

  // Update URL
  const url = page>1 ? `/page/${page}` : '/';
  history.pushState({page}, '', url);
}

// Render pagination buttons
function renderPagination(totalPages){
  const c=el('pagination');if(totalPages<=1){c.innerHTML='';return;}
  let s=currentPage-Math.floor(MAX_PAGE_BUTTONS/2);if(s<1)s=1;
  let e=s+MAX_PAGE_BUTTONS-1;if(e>totalPages){e=totalPages;s=Math.max(1,e-MAX_PAGE_BUTTONS+1);}
  let html='';
  if(currentPage>1) html+=`<button class="pg-btn" onclick="renderList(${currentPage-1})">&lt;</button>`;
  for(let i=s;i<=e;i++) html+=`<button class="pg-btn ${i===currentPage?'active':''}" onclick="renderList(${i})">${i}</button>`;
  if(currentPage<totalPages) html+=`<button class="pg-btn" onclick="renderList(${currentPage+1})">&gt;</button>`;
  c.innerHTML = html;
}

// Search function
function doSearch(){
  const q = (el('search').value||'').trim().toLowerCase();
  const top = el('topMsg'); top.classList.add('hidden');
  if(!q){filteredPosts=fullPosts.slice(); renderList(1); return;}
  let res = fullPosts.filter(p=>((p.CODE||'')+(p.Actress||'')+(p.Tags||'')).toLowerCase().includes(q));
  if(res.length===0){
    const tokens=q.split(/\s+/).filter(Boolean);
    res = fullPosts.filter(p=>{
      const hay = ((p.CODE||'')+' '+(p.Actress||'')+' '+(p.Tags||'')).toLowerCase();
      return tokens.every(t=>hay.includes(t));
    });
  }
  if(res.length===0){
    filteredPosts=fullPosts.slice();
    top.textContent=`No exact matches for "${q}", showing latest.`;
    top.classList.remove('hidden');
    renderList(1); return;
  }
  filteredPosts = res.slice(); renderList(1);
}

// Open detail post
function openDetail(code){
  const post = fullPosts.find(p=>(p.CODE||'').toUpperCase()===code.toUpperCase());
  if(!post) return;
  el('detailView').innerHTML = buildDetailHTML(post);
  el('listView').classList.add('hidden'); el('detailView').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  history.pushState({code}, '', `/${code}`);
}

// Build HTML for detail
function buildDetailHTML(p){
  const code = p.CODE||'', actress = p.Actress||'', tags = (p.Tags||'').split(',').map(s=>s.trim()).filter(Boolean);
  const img = safeImg(p['LINK FOTO']); const link = escapeAttr(p.LINK||'#');
  const tagsHTML = tags.map(t=>`<span onclick="searchTag('${escapeJS(t)}')">${escapeHTML(t)}</span>`).join(' ');
  const actressHTML = (actress||'').split(',').map(a=>`<span onclick="searchTag('${escapeJS(a.trim())}')">${escapeHTML(a.trim())}</span>`).join(' ');
  const related = fullPosts.filter(x=>(x.CODE||'')!==code).slice(0,6);
  const relatedHTML = related.map(r=>`<div class="related-item" onclick="openDetail('${escapeJS(r.CODE)}')">
    <div class="thumb"><img class="lazy" data-src="${safeImg(r['LINK FOTO'])}" src="${PLACEHOLDER}" onerror="this.src='${PLACEHOLDER}'"></div>
    <div class="r-title">${escapeHTML(r.CODE+' '+(r.Actress||''))}</div></div>`).join('');
  // observe related images
  setTimeout(()=>document.querySelectorAll('#detailView img.lazy').forEach(img=>lazyObserver.observe(img)),0);
  return `<div class="detail-wrap">
    <div class="breadcrumb"><a href="javascript:resetToHome()">Home</a> › ${escapeHTML(actress)} › ${escapeHTML(code)}</div>
    <h2 class="detail-title">${escapeHTML(code+' '+actress)}</h2>
    <div style="text-align:center">
      <div class="poster-wrap">
        <img class="lazy" data-src="${img}" src="${PLACEHOLDER}" onerror="this.src='${PLACEHOLDER}'">
        <div class="play-overlay" onclick="window.open('${link}','_blank')"></div>
      </div>
    </div>
    <div class="download-center"><a class="download-btn" href="${link}" target="_blank">Watch and Download</a></div>
    <div style="text-align:center;margin-top:10px;color:var(--muted)">
      <div><strong>Actress:</strong> ${actressHTML}</div>
      <div style="margin-top:8px"><strong>Tags:</strong> ${tagsHTML||'—'}</div>
    </div>
    <a class="home-btn" href="javascript:resetToHome()">Home</a>
    <div class="related-section"><h3 class="related-title">Related Posts</h3><div class="related-grid">${relatedHTML}</div></div>
  </div>`;
}

// Tag click search
function searchTag(tag){el('search').value=tag;doSearch()}

// Reset home
function resetToHome(){el('search').value='';el('topMsg').classList.add('hidden');filteredPosts=fullPosts.slice();renderList(1)}

// Popup
function showPopupIfNeeded(){if(localStorage.getItem('popupClosed')) return; el('popup').classList.remove('hidden')}
el('popupClose').addEventListener('click',()=>{el('popup').classList.add('hidden'); localStorage.setItem('popupClosed','1')})

// Search event
el('searchBtn').addEventListener('click',doSearch)
el('search').addEventListener('keypress',e=>{if(e.key==='Enter') doSearch()})

// Escape helpers
function escapeJS(s){return(s||'').replace(/'/g,"\\'").replace(/"/g,'\\"')}
function escapeHTML(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function escapeAttr(s){return(s||'').replace(/"/g,'&quot;').replace(/'/g,"&#039;")}

// Handle browser back/forward
window.addEventListener('popstate', (e)=>{
  if(e.state?.page) renderList(e.state.page);
  else if(e.state?.code) openDetail(e.state.code);
  else resetToHome();
})

init();

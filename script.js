const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const POSTS_PER_PAGE = 20;
let allPosts = [];

async function fetchPosts(){
  const container = document.getElementById('posts');
  container.innerHTML = '<p>Memuat data...</p>';
  try{
    const response = await fetch(SHEET_URL);
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    // Filter & reverse
    allPosts = data.filter(r => (r['undefined']||'').toUpperCase().startsWith('FIX')).reverse();
    renderPage(1);
  }catch(err){
    container.innerHTML = `<p style="color:red;">Gagal memuat data.<br>${err}</p>`;
  }
}

function renderPage(page){
  const container = document.getElementById('posts');
  container.innerHTML = '';
  const totalPages = Math.ceil(allPosts.length/POSTS_PER_PAGE);
  if(page>totalPages) page=totalPages;

  const start = (page-1)*POSTS_PER_PAGE;
  const end = start+POSTS_PER_PAGE;
  const pagePosts = allPosts.slice(start,end);

  pagePosts.forEach(post=>{
    const kode = post.CODE||'Unknown';
    const actres = post.Actress||'-';
    const image = post["LINK FOTO"]||'';
    const download = post.LINK||'#';

    const div = document.createElement('div');
    div.classList.add('cover');
    div.innerHTML = `
      <a href="detail.html?code=${kode}" class="cover-wrapper">
        <img src="${image}" alt="${kode}">
        <div class="play-button">&#9658;</div>
        <div class="overlay">${kode} ${actres}</div>
      </a>
    `;
    container.appendChild(div);
  });

  // Pagination
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for(let i=1;i<=totalPages;i++){
    const a = document.createElement('a');
    a.href="#";
    a.textContent=i;
    if(i===page)a.classList.add('active');
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      renderPage(i);
      window.scrollTo(0,0);
    });
    pagination.appendChild(a);
  }
}

// Search
document.getElementById('search').addEventListener('keypress', function(e){
  if(e.key==='Enter'){
    const val = this.value.trim().toLowerCase();
    const filtered = allPosts.filter(p=>{
      return (p.CODE||'').toLowerCase().includes(val) || (p.Actress||'').toLowerCase().includes(val) || (p.Tags||'').toLowerCase().includes(val);
    });
    if(filtered.length===0) alert('No results found');
    else {
      allPosts = filtered;
      renderPage(1);
    }
  }
});

fetchPosts();

// Popup Telegram
const popup=document.getElementById('popup');
const closeBtn=document.getElementById('popup-close');
window.addEventListener('load',()=>popup.style.display='block');
closeBtn.addEventListener('click',()=>popup.style.display='none');

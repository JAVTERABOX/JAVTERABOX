const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const POSTS_PER_PAGE = 20;
const urlParams = new URLSearchParams(window.location.search);
let page = parseInt(urlParams.get('page')) || 1;
let filterKeyword = '';
let allPosts = [];

async function fetchPosts() {
  const container = document.getElementById('posts');
  container.innerHTML = 'Memuat data...';
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();
    allPosts = data.filter(r => (r["undefined"] || '').toUpperCase().startsWith('FIX'));
    renderPosts();
  } catch(e) {
    container.innerHTML = `<p style="color:red;">Gagal memuat data. ${e}</p>`;
  }
}

function renderPosts() {
  let filtered = allPosts;
  if(filterKeyword) {
    filtered = filtered.filter(p => {
      const kw = filterKeyword.toLowerCase();
      return (p.CODE && p.CODE.toLowerCase().includes(kw)) ||
             (p.Actress && p.Actress.toLowerCase().includes(kw)) ||
             (p.Actor && p.Actor.toLowerCase().includes(kw)) ||
             (p.Tags && p.Tags.toLowerCase().includes(kw));
    });
  }

  const start = (page-1)*POSTS_PER_PAGE;
  const pagePosts = filtered.slice(start, start+POSTS_PER_PAGE);

  const container = document.getElementById('posts');
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.classList.add('grid');

  pagePosts.forEach(post => {
    const kode = post.CODE || 'Unknown';
    const actres = post.Actress || '-';
    const image = post['LINK FOTO'] || '';
    const div = document.createElement('div');
    div.classList.add('cover');
    div.innerHTML = `
      <a href="detail.html?kode=${kode}">
        <img src="${image}" alt="${kode}" loading="lazy">
        <span class="overlay">${kode} ${actres}</span>
      </a>`;
    grid.appendChild(div);
  });
  container.appendChild(grid);

  // Pagination
  const totalPages = Math.ceil(filtered.length/POSTS_PER_PAGE);
  const pagination = document.createElement('div');
  pagination.classList.add('pagination');
  for(let i=1;i<=totalPages;i++){
    const a = document.createElement('a');
    a.href = `?page=${i}`;
    a.textContent = i;
    if(i===page) a.classList.add('active');
    pagination.appendChild(a);
  }
  container.appendChild(pagination);
}

// Search bar: hanya aktif saat Enter
document.getElementById('search').addEventListener('keypress', e=>{
  if(e.key==='Enter'){
    filterKeyword = e.target.value.trim();
    page=1;
    renderPosts();
  }
});

// Telegram popup
const popup = document.getElementById('popup');
document.getElementById('popup-close').addEventListener('click', ()=> popup.style.display='none');
setTimeout(()=>{ popup.style.display='block'; },3000);

fetchPosts();

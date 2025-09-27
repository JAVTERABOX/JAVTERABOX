const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const POSTS_PER_PAGE = 20;

// Ambil nomor halaman dari URL: ?page=1
const urlParams = new URLSearchParams(window.location.search);
const page = parseInt(urlParams.get('page')) || 1;

async function fetchPosts() {
  const container = document.getElementById('posts');
  container.innerHTML = '<p>Memuat data...</p>';

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Filter semua trigger FIX
    const filtered = data.filter(r => {
      const trigger = r.M || r.Trigger || r["undefined"];
      return trigger && trigger.toUpperCase().startsWith('FIX');
    });

    if (filtered.length === 0) {
      container.innerHTML = '<p>Tidak ada postingan.</p>';
      return;
    }

    renderGrid(filtered);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">Gagal memuat data.<br>${err}</p>`;
  }
}

function renderGrid(posts) {
  const container = document.getElementById('posts');
  container.innerHTML = '';

  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, end);

  const grid = document.createElement('div');
  grid.classList.add('grid');

  pagePosts.forEach(post => {
    const kode = post.CODE || 'Unknown';
    const image = post['LINK FOTO'] || '';
    const div = document.createElement('div');
    div.classList.add('cover');

    // Link ke detail.html dengan query parameter ?kode=...
    div.innerHTML = `
      <a href="detail.html?kode=${kode}">
        <img src="${image}" alt="${kode}" />
        <span class="kode">${kode}</span>
      </a>
    `;
    grid.appendChild(div);
  });

  container.appendChild(grid);

  // Pagination
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagination = document.createElement('div');
  pagination.classList.add('pagination');

  for (let i = 1; i <= totalPages; i++) {
    const a = document.createElement('a');
    a.href = `?page=${i}`;
    a.textContent = i;
    if (i === page) a.classList.add('active');
    pagination.appendChild(a);
  }

  container.appendChild(pagination);
}

fetchPosts();

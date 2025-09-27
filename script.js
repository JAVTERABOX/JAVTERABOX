// URL OpenSheet final
const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';

async function fetchPosts() {
  const container = document.getElementById('posts');
  container.innerHTML = '<p>Memuat data...</p>';

  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log('Data OpenSheet:', data); // debug

    // Filter baris dengan trigger FIX (M atau Trigger)
    const filtered = data.filter(r => {
      const trigger = r.M || r.Trigger;
      return trigger && trigger.toUpperCase().startsWith('FIX');
    });

    if (filtered.length === 0) {
      container.innerHTML = '<p>Tidak ada postingan dengan trigger FIX di Sheet.</p>';
      return;
    }

    renderPosts(filtered);
  } catch (err) {
    console.error('Gagal fetch data dari OpenSheet:', err);
    container.innerHTML = `<p style="color:red;">Gagal memuat data. Cek console untuk detail error.<br>${err}</p>`;
  }
}

function renderPosts(posts) {
  const container = document.getElementById('posts');
  container.innerHTML = '';

  posts.forEach(post => {
    const kode = post.F || post.Kode || 'Unknown';
    const actres = post.G || post.Actres || '-';
    const actor = post.H || post.Actor || '-';
    const label = post.I || post.Label || '-';
    const tags = post.J ? post.J.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join(' ') : '';
    const image = post.K || post.Image || '';
    const download = post.A || post.Download || '#';

    const div = document.createElement('div');
    div.classList.add('post');

    div.innerHTML = `
      ${image ? `<img src="${image}" alt="${kode}" />` : ''}
      <div class="post-content">
        <h2>${kode}</h2>
        <p><strong>Actres:</strong> ${actres}</p>
        <p><strong>Actor:</strong> ${actor}</p>
        <p><strong>Label:</strong> ${label}</p>
        <p class="tags">${tags}</p>
        <a href="${download}" target="_blank">Download</a>
      </div>
    `;

    container.appendChild(div);
  });
}

// Jalankan fetch saat halaman load
fetchPosts();

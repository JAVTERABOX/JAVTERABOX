const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';

async function fetchDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const kodePage = urlParams.get('kode'); // ambil ?kode=NAMA_KODE
  const container = document.getElementById('detail');
  container.innerHTML = '<p>Memuat data...</p>';

  if (!kodePage) {
    container.innerHTML = '<p>Kode postingan tidak ditemukan.</p>';
    return;
  }

  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();

    const post = data.find(r => (r.CODE || '').toUpperCase() === kodePage.toUpperCase());
    if (!post) {
      container.innerHTML = '<p>Postingan tidak ditemukan.</p>';
      return;
    }

    renderDetail(post);
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Gagal memuat data.<br>${err}</p>`;
  }
}

function renderDetail(post) {
  const container = document.getElementById('detail');
  container.innerHTML = '';

  const kode = post.CODE || 'Unknown';
  const actres = post.Actress || '-';
  const actor = post.Actor || '-';
  const label = post.Studio || '-';
  const tags = post.Tags ? post.Tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join(' ') : '';
  const image = post['LINK FOTO'] || '';
  const download = post.LINK || '#';

  container.innerHTML = `
    <div class="detail-post">
      <img src="${image}" alt="${kode}" />
      <h2>${kode}</h2>
      <p><strong>Actres:</strong> ${actres}</p>
      <p><strong>Actor:</strong> ${actor}</p>
      <p><strong>Label:</strong> ${label}</p>
      <p class="tags">${tags}</p>
      <a href="${download}" target="_blank">Download</a>
      <br><a href="index.html">Kembali ke daftar</a>
    </div>
  `;
}

fetchDetail();

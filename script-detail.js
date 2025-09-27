const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const urlParams = new URLSearchParams(window.location.search);
const kodePage = urlParams.get('kode');
const container = document.getElementById('detail');

async function fetchDetail(){
  container.innerHTML='Memuat data...';
  try{
    const response = await fetch(SHEET_URL);
    const data = await response.json();
    const post = data.find(r => (r.CODE||'').toUpperCase()===kodePage.toUpperCase());
    if(!post){ container.innerHTML='<p>Postingan tidak ditemukan.</p>'; return; }
    renderDetail(post);
  }catch(e){ container.innerHTML=`<p style="color:red;">Gagal memuat data.<br>${e}</p>`; }
}

function renderDetail(post){
  const kode = post.CODE || 'Unknown';
  const actres = post.Actress || '-';
  const actor = post.Actor || '-';
  const label = post.Studio || '-';
  const tags = post.Tags ? post.Tags.split(',').map(t=>`<a href="index.html?tag=${encodeURIComponent(t.trim())}" class="tag">${t.trim()}</a>`).join(' ') : '';
  const image = post['LINK FOTO'] || '';
  const download = post.LINK || '#';

  container.innerHTML=`
    <div class="detail-post">
      <a href="${download}" target="_blank"><img src="${image}" alt="${kode}"></a>
      <h2>${kode} - ${actres}</h2>
      <p><strong>Actres:</strong> <a href="index.html?actres=${encodeURIComponent(actres)}">${actres}</a></p>
      <p><strong>Actor:</strong> ${actor}</p>
      <p><strong>Label:</strong> ${label}</p>
      <p>${tags}</p>
      <a href="${download}" class="btn-download" target="_blank">Download</a>
      <a href="index.html" class="btn-back">Kembali ke daftar</a>
    </div>
  `;
}

fetchDetail();

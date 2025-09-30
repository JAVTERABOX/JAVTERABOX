const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const urlParams = new URLSearchParams(window.location.search);
const codeParam = urlParams.get('code');
const detailContainer = document.getElementById('detail-post');

async function fetchDetail() {
  detailContainer.innerHTML = '<p>Memuat data...</p>';
  try {
    const response = await fetch(SHEET_URL);
    if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    const post = data.find(p => (p.CODE||'') === codeParam);
    if(!post){detailContainer.innerHTML='<p>Post not found.</p>';return;}

    const kode = post.CODE||'Unknown';
    const actres = post.Actress||'-';
    const actor = post.Actor||'-';
    const studio = post.Studio||'-';
    const tags = post.Tags||'';
    const image = post['N']||''; // kolom N untuk gambar
    const download = post.LINK||'#';

    detailContainer.innerHTML = `
      <a href="${download}" target="_blank" class="cover-wrapper">
        <img src="${image}" alt="${kode}">
        <div class="play-button">&#9658;</div>
      </a>
      <h2><a href="${download}" target="_blank">${kode} ${actres}</a></h2>
      <p><strong>Actress:</strong> <a href="index.html?actres=${encodeURIComponent(actres)}">${actres}</a></p>
      <p><strong>Actor:</strong> ${actor}</p>
      <p><strong>Studio:</strong> ${studio}</p>
      <p><strong>Tags:</strong> ${tags.split(',').map(t=>`<a class="tag" href="index.html?tag=${encodeURIComponent(t.trim())}">${t.trim()}</a>`).join(' ')}</p>
      <a href="${download}" target="_blank" class="btn-download">Watch and Download</a>
      <a href="index.html" class="btn-back">Back to List</a>
      <div class="recommendations" id="recommendations"></div>
    `;

    // Related posts
    const related = data.filter(p => (p.Tags||'').split(',').some(t=>tags.includes(t)) && p.CODE!==kode).slice(0,8);
    const recContainer = document.getElementById('recommendations');
    related.forEach(r=>{
      const rec = document.createElement('div');
      rec.classList.add('rec-post');
      rec.innerHTML = `<a href="detail.html?code=${r.CODE}"><img src="${r['N']}" alt="${r.CODE}"><span>${r.CODE} ${r.Actress}</span></a>`;
      recContainer.appendChild(rec);
    });
  } catch(err) {
    detailContainer.innerHTML = `<p style="color:red;">Gagal memuat data.<br>${err}</p>`;
  }
}

fetchDetail();

// Popup Telegram
const popup = document.getElementById('popup');
const closeBtn = document.getElementById('popup-close');
window.addEventListener('load',()=>popup.style.display='block');
closeBtn.addEventListener('click',()=>popup.style.display='none');

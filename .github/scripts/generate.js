const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OPEN_SHEET = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const POSTS_DIR = path.join(__dirname, '../../posts/');

// Pastikan folder posts ada
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

function escapeHTML(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

(async () => {
  try {
    const resp = await axios.get(OPEN_SHEET);
    const data = resp.data.reverse(); // latest first

    for (const row of data) {
      // Gunakan kolom FIX1, FIX2, dst. Jika ada berarti generate
      const fixKeys = Object.keys(row).filter(k => k.toUpperCase().startsWith('FIX') && row[k].trim());
      if (fixKeys.length === 0) continue;

      // Data utama
      const code = (row['JUDUL'] || '').trim();
      const actress = (row['ACTRES'] || '').trim();
      const link = (row['LINK TERABOX'] || '#').trim();
      const img = (row['LINK FOTO'] || 'https://via.placeholder.com/640x360?text=No+Image').trim();
      const tags = (row['TAGS'] || '').split(',').map(t=>t.trim()).filter(Boolean).join(', ');

      // Buat file HTML per FIX
      for (const fix of fixKeys) {
        const filename = path.join(POSTS_DIR, `${code}.html`);
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHTML(code+' '+actress)}</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<h1>${escapeHTML(code+' '+actress)}</h1>
<img src="${img}" alt="${escapeHTML(code+' '+actress)}" style="max-width:100%">
<p>Actress: ${escapeHTML(actress)}</p>
<p>Tags: ${escapeHTML(tags)}</p>
<a href="${link}" target="_blank">Watch and Download</a>
</body>
</html>`;
        fs.writeFileSync(filename, html, 'utf8');
      }
    }

    console.log('Posts generated successfully!');
  } catch (err) {
    console.error('Error generating posts:', err);
  }
})();

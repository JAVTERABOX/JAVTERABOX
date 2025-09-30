const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OPEN_SHEET = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const POSTS_DIR = path.join(__dirname, '..', '..', 'posts');

if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

function escapeHTML(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                         .replace(/"/g,'&quot;').replace(/'/g,"&#039;");
}

function buildDetailHTML(post) {
    const code = post.F || '';
    const actress = post.G || '';
    const link = post.A || '#';
    const tags = (post.J || '').split(',').map(t=>t.trim()).filter(Boolean);
    const img = post.K || '';

    const tagsHTML = tags.map(t=>`<span>${escapeHTML(t)}</span>`).join(' ');
    const actressHTML = actress.split(',').map(a=>`<span>${escapeHTML(a.trim())}</span>`).join(' ');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHTML(code+' '+actress)}</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<div class="detail-wrap">
    <h2 class="detail-title">${escapeHTML(code+' '+actress)}</h2>
    <div style="text-align:center">
        <div class="poster-wrap">
            <img src="${img}" alt="${escapeHTML(code+' '+actress)}">
            <div class="play-overlay" onclick="window.open('${link}','_blank')"></div>
        </div>
    </div>
    <div class="download-center">
        <a class="download-btn" href="${link}" target="_blank">Watch and Download</a>
    </div>
    <div style="text-align:center;margin-top:10px;color:#bdbdbd">
        <div><strong>Actress:</strong> ${actressHTML}</div>
        <div style="margin-top:8px"><strong>Tags:</strong> ${tagsHTML||'—'}</div>
    </div>
    <a class="home-btn" href="../index.html">Home</a>
</div>
</body>
</html>`;
}

(async () => {
    try {
        const resp = await axios.get(OPEN_SHEET);
        const data = resp.data.reverse();

        fs.readdirSync(POSTS_DIR).forEach(file=>{
            if(file.endsWith('.html')) fs.unlinkSync(path.join(POSTS_DIR, file));
        });

        data.forEach(post => {
            const fixKeys = Object.keys(post).filter(k => /^FIX\d+$/i.test(k) && post[k].trim());
            if(fixKeys.length === 0) return;

            const code = post.F || ('post'+Math.random().toString(36).substr(2,5));
            const filename = `${code}.html`;
            const filepath = path.join(POSTS_DIR, filename);

            const html = buildDetailHTML(post);
            fs.writeFileSync(filepath, html, 'utf-8');
            console.log('Generated:', filename);
        });

        console.log('All posts generated successfully.');
    } catch (err) {
        console.error('Error generating posts:', err);
    }
})();

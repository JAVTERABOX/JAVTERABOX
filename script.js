const SHEET_URL = 'https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6JjZF6z8-JcqZkWGHrVoCI/Sheet1';

async function fetchPosts() {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.json();

    const filtered = data.filter(r => r.M && r.M.startsWith('FIX'));
    renderPosts(filtered);
  } catch (err) {
    console.error('Gagal fetch data dari OpenSheet:', err);
    document.getElementById('posts').innerHTML = '<p style="color:red;">Gagal memuat data.</p>';
  }
}

function renderPosts(posts) {
  const container = document.getElementById('posts');
  container.innerHTML = '';

  posts.forEach(post => {
    const div = document.createElement('div');
    div.classList.add('post');

    const tagsHTML = post.J ? post.J.split(',').map(t => `<span>${t.trim()}</span>`).join('') : '';

    div.innerHTML = `
      <img src="${post.K}" alt="${post.F}" />
      <div class="post-content">
        <h2>${post.F}</h2>
        <p><strong>Actres:</strong> ${post.G}</p>
        <p><strong>Actor:</strong> ${post.H}</p>
        <p><strong>Label:</strong> ${post.I}</p>
        <p class="tags">${tagsHTML}</p>
        <a href="${post.A}" target="_blank">Download</a>
      </div>
    `;

    container.appendChild(div);
  });
}

fetchPosts();

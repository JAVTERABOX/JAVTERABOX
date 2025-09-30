
const OPEN_SHEET='https://opensheet.elk.sh/15m33t4659Iq9unQ7_Gi-lOPe6Jj9T7wzAA060HxyFRs/Sheet1';
const PER_PAGE=20, MAX_PAGE_BUTTONS=5;
let fullPosts=[], filteredPosts=[], currentPage=1;

function el(id){return document.getElementById(id);}
function safeImg(src){return src;} // kolom K fix

async function init(){
  const resp=await fetch(OPEN_SHEET);
  const json=await resp.json();
  fullPosts=json.reverse().filter(p=>p.FIX1||p.FIX2||p.FIX3); // ambil yang ada FIXx
  filteredPosts=fullPosts.slice();
  renderList(1);
  setTimeout(showPopupIfNeeded,1200);
}

// renderList, renderPagination, openDetail, buildDetailHTML, doSearch
// semua sama seperti script lama, cukup copy

async function loadJSON(path){
  const res = await fetch(path); if(!res.ok) throw new Error(res.status);
  return res.json();
}
function paginate(items, page, size){
  const start = (page-1)*size; return items.slice(start, start+size);
}
function renderPager(el, total, page, size, onChange){
  const pages = Math.max(1, Math.ceil(total/size));
  el.innerHTML = '';
  const mk = (label, p)=>{ const b=document.createElement('button'); b.textContent=label; b.disabled = p===page; b.onclick=()=>onChange(p); return b; };
  el.appendChild(mk('«', 1));
  for(let p=Math.max(1,page-2); p<=Math.min(pages,page+2); p++) el.appendChild(mk(String(p), p));
  el.appendChild(mk('»', pages));
}
function renderList(el, items){
  el.innerHTML='';
  items.forEach(it=>{ const li=document.createElement('li'); li.textContent=it; el.appendChild(li); });
}
async function main(){
  const data = await loadJSON('data/docs.json');
  const files = Array.isArray(data.files)?data.files:[];
  const searchEl = document.getElementById('search');
  const sizeEl = document.getElementById('page-size');
  const listEl = document.getElementById('list');
  const pagerEl = document.getElementById('pager');
  const summaryEl = document.getElementById('summary');
  let q='', page=1, size=parseInt(sizeEl.value,10)||100;

  function apply(){
    const filtered = q? files.filter(f=>f.toLowerCase().includes(q.toLowerCase())): files;
    const pageItems = paginate(filtered, page, size);
    summaryEl.textContent = `Tổng: ${files.length} | Lọc: ${filtered.length} | Trang: ${page}`;
    renderList(listEl, pageItems);
    renderPager(pagerEl, filtered.length, page, size, (p)=>{ page=p; apply(); });
  }

  searchEl.addEventListener('input', (e)=>{ q=e.target.value; page=1; apply(); });
  sizeEl.addEventListener('change', ()=>{ size=parseInt(sizeEl.value,10)||100; page=1; apply(); });

  apply();
}
document.addEventListener('DOMContentLoaded', main);

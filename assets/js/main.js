async function loadJSON(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error('Failed to load', path, e);
        return null;
    }
}

function renderList(el, items, limit = 100) {
    el.innerHTML = '';
    (items || []).slice(0, limit).forEach((it) => {
        const li = document.createElement('li');
        li.textContent = it;
        el.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Website loaded successfully!');

    const stats = await loadJSON('data/line_count.json');
    const modules = await loadJSON('data/modules.json');
    const docs = await loadJSON('data/docs.json');

    if (stats && typeof stats.lines === 'number') {
        document.getElementById('line-count').textContent = stats.lines.toLocaleString('vi-VN');
    } else {
        document.getElementById('line-count').textContent = 'N/A';
    }

    const moduleFiles = modules && Array.isArray(modules.files) ? modules.files : [];
    const docFiles = docs && Array.isArray(docs.files) ? docs.files : [];

    document.getElementById('module-count').textContent = moduleFiles.length.toLocaleString('vi-VN');
    document.getElementById('doc-count').textContent = docFiles.length.toLocaleString('vi-VN');

    renderList(document.getElementById('module-list'), moduleFiles);
    renderList(document.getElementById('doc-list'), docFiles);
});
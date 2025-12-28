async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
}

function formatNumber(n) {
    return typeof n === 'number' ? n.toLocaleString('vi-VN') : 'N/A';
}

function renderList(el, items, emptyText) {
    el.innerHTML = '';
    if (!items || items.length === 0) {
        const li = document.createElement('li');
        li.textContent = emptyText;
        el.appendChild(li);
        return;
    }

    items.forEach((text) => {
        const li = document.createElement('li');
        li.textContent = text;
        el.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('status');
    const linesEl = document.getElementById('lines-count');
    const modulesEl = document.getElementById('modules-count');
    const docsEl = document.getElementById('docs-count');
    const latestModulesEl = document.getElementById('latest-modules');
    const latestDocsEl = document.getElementById('latest-docs');

    // If this isn't the homepage, skip to avoid errors
    if (!statusEl) return;

    statusEl.textContent = 'Đang tải dữ liệu...';

    try {
        const [modulesData, docsData, linesData] = await Promise.all([
            loadJSON('data/modules.json'),
            loadJSON('data/docs.json'),
            loadJSON('data/line_count.json').catch(() => ({})),
        ]);

        const modules = Array.isArray(modulesData.files) ? modulesData.files : [];
        const docs = Array.isArray(docsData.files) ? docsData.files : [];
        const lineCount = typeof linesData.lines === 'number' ? linesData.lines : null;

        linesEl.textContent = formatNumber(lineCount);
        modulesEl.textContent = formatNumber(modules.length);
        docsEl.textContent = formatNumber(docs.length);

        renderList(latestModulesEl, modules.slice(-8).reverse(), 'Chưa có module mới.');
        renderList(latestDocsEl, docs.slice(-8).reverse(), 'Chưa có doc mới.');

        statusEl.textContent = 'Dữ liệu đã được cập nhật tự động.';
    } catch (err) {
        console.error('Không tải được dữ liệu:', err);
        statusEl.textContent = 'Không tải được dữ liệu (vui lòng thử lại).';
    }
});
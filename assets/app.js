/* =====================================================
 * 团队文档中心 - 核心逻辑
 * - 通过 GitHub Contents API 列目录
 * - 通过 _meta.json 获取中文标题与描述
 * - 支持 md 在线预览、原文下载、全站搜索
 * ===================================================== */

const CONFIG = {
    owner: 'links1994',
    repo: 'links1994.github.io',
    branch: 'main',
    // 文档根目录（站点只展示此目录下内容）
    docsRoot: 'docs',
};

const RAW_BASE = `https://raw.githubusercontent.com/${CONFIG.owner}/${CONFIG.repo}/${CONFIG.branch}`;

// 简易内存缓存
const cache = {
    dir: new Map(),
    meta: new Map(),
    raw: new Map(),
};

// ========= 工具 =========
const $ = (sel) => document.querySelector(sel);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isMarkdown = (name) => /\.(md|markdown)$/i.test(name);

function formatSize(bytes) {
    if (bytes == null) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// ========= 基于 _meta.json 的目录清单 =========
// 完全不使用 GitHub Contents API，避免 60 次/小时匿名限额。
// 规则：每个目录下必须存在 _meta.json，其中 `dirs` 声明子目录，`files` 声明文件。
async function listDir(path) {
    if (cache.dir.has(path)) return cache.dir.get(path);
    const meta = await loadMeta(path);
    if (!meta) {
        throw new Error(`目录 ${path} 缺少 _meta.json 或无法访问`);
    }
    const items = [];
    const dirs = meta.dirs || {};
    const files = meta.files || {};
    for (const name of Object.keys(dirs)) {
        const entry = dirs[name];
        const extra = typeof entry === 'string'
            ? { description: entry }
            : { description: entry.description || '', icon: entry.icon, color: entry.color, accent: entry.accent };
        items.push({ name, path: `${path}/${name}`, type: 'dir', size: null, ...extra });
    }
    for (const name of Object.keys(files)) {
        items.push({ name, path: `${path}/${name}`, type: 'file', size: null });
    }
    cache.dir.set(path, items);
    return items;
}

async function loadMeta(path) {
    if (cache.meta.has(path)) return cache.meta.get(path);
    try {
        const res = await fetch(`${RAW_BASE}/${encodeURI(path)}/_meta.json`);
        if (!res.ok) { cache.meta.set(path, null); return null; }
        const json = await res.json();
        cache.meta.set(path, json);
        return json;
    } catch (e) {
        cache.meta.set(path, null);
        return null;
    }
}

async function loadRaw(path) {
    if (cache.raw.has(path)) return cache.raw.get(path);
    const res = await fetch(`${RAW_BASE}/${encodeURI(path)}`);
    if (!res.ok) throw new Error(`无法加载文件 ${path} (${res.status})`);
    const text = await res.text();
    cache.raw.set(path, text);
    return text;
}

// 跨域强制下载：fetch 成 blob 后触发 <a download>。
// 双保险：iOS/旧版浏览器不支持时，回落到 window.open + 提示手动另存。
async function downloadFile(url, filename, btn) {
    const originalText = btn ? btn.textContent : '';
    try {
        if (btn) { btn.textContent = '下载中...'; btn.style.pointerEvents = 'none'; }
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();

        // iOS Safari 不支持 a.download，直接 open blob 即可
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
            return;
        }

        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = filename;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        // 直接 dispatch 一个可信任的 click，避免手势丢失
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(objUrl);
        }, 1500);
    } catch (e) {
        console.error('[downloadFile] 失败', e);
        alert(`下载失败：${e.message}\n请打开 F12 → Console 查看具体错误。`);
    } finally {
        if (btn) { btn.textContent = originalText; btn.style.pointerEvents = ''; }
    }
}

// ========= 渲染：侧边栏分类标签（平铺，不递归）=========
async function renderTree() {
    const root = $('#tree');
    root.innerHTML = '<div style="padding:12px;font-size:13px;color:#6b7280">加载中...</div>';
    try {
        const items = await listDir(CONFIG.docsRoot);
        root.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'tab-list';
        for (const item of items) {
            if (item.type !== 'dir') continue;
            const tab = document.createElement('div');
            tab.className = 'sidebar-tab';
            tab.dataset.path = item.path;
            if (item.color) tab.style.setProperty('--tab-bg', item.color);
            if (item.accent) tab.style.setProperty('--tab-accent', item.accent);
            tab.innerHTML = `
                <span class="tab-icon">${item.icon || '📁'}</span>
                <div class="tab-text">
                    <div class="tab-name">${escapeHtml(item.name)}</div>
                    ${item.description ? `<div class="tab-desc">${escapeHtml(item.description)}</div>` : ''}
                </div>`;
            tab.addEventListener('click', () => navigate(item.path));
            wrap.appendChild(tab);
        }
        root.appendChild(wrap);
    } catch (e) {
        root.innerHTML = `<div style="padding:10px;color:#dc2626;font-size:13px">${escapeHtml(e.message)}</div>`;
    }
}

function sortItems(a, b) {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
}

function highlightTreeNode(path) {
    // 高亮当前所属的顶级分类标签（例如路径 docs/API文档/xxx 则高亮 API文档 tab）
    document.querySelectorAll('.sidebar-tab').forEach(el => {
        const tabPath = el.dataset.path;
        const active = path === tabPath || path.startsWith(tabPath + '/');
        el.classList.toggle('active', active);
    });
}

// ========= 渲染：目录视图 =========
async function renderDirView(path) {
    const viewer = $('#viewer');
    viewer.innerHTML = '<div class="loading">加载中...</div>';
    try {
        const [items, meta] = await Promise.all([listDir(path), loadMeta(path)]);
        const title = meta?.title || (path === CONFIG.docsRoot ? '文档中心' : path.split('/').pop());
        const desc = meta?.description || '';
        const fileDescMap = meta?.files || {};
        const dirDescMap = meta?.dirs || {};

        const visible = items;

        if (visible.length === 0) {
            viewer.innerHTML = `
                <div class="dir-header"><h2>${escapeHtml(title)}</h2>${desc ? `<p>${escapeHtml(desc)}</p>` : ''}</div>
                <div class="empty">此目录暂无文件</div>`;
            return;
        }

        const cards = await Promise.all(visible.map(async (item) => {
            if (item.type === 'dir') {
                const subMeta = await loadMeta(item.path);
                const label = subMeta?.title || item.name;
                const rawDesc = dirDescMap[item.name];
                const description = subMeta?.description || (typeof rawDesc === 'string' ? rawDesc : (rawDesc?.description || ''));
                return `
                    <div class="item-card" data-path="${escapeHtml(item.path)}" data-type="dir">
                        <div class="head"><span class="icon">📁</span><span class="name">${escapeHtml(label)}</span></div>
                        <div class="desc">${escapeHtml(description || '子目录')}</div>
                        <div class="actions">
                            <button class="btn primary" data-action="open">打开目录 →</button>
                        </div>
                    </div>`;
            } else {
                const rawDesc = fileDescMap[item.name];
                const description = typeof rawDesc === 'string' ? rawDesc : (rawDesc?.description || '');
                const icon = isMarkdown(item.name) ? '📄' : '📎';
                const rawUrl = `${RAW_BASE}/${encodeURI(item.path)}`;
                return `
                    <div class="item-card" data-path="${escapeHtml(item.path)}" data-type="file">
                        <div class="head"><span class="icon">${icon}</span><span class="name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span></div>
                        <div class="desc">${escapeHtml(description || (isMarkdown(item.name) ? 'Markdown 文档' : '文件'))}</div>
                        <div class="actions" style="justify-content:space-between;align-items:center">
                            <span style="font-size:11px;color:#9ca3af">${formatSize(item.size)}</span>
                            <div style="display:flex;gap:6px">
                                ${isMarkdown(item.name) ? `<button class="btn" data-action="preview">预览</button>` : ''}
                                <button class="btn primary" data-action="download" data-url="${rawUrl}" data-name="${escapeHtml(item.name)}">下载</button>
                            </div>
                        </div>
                    </div>`;
            }
        }));

        viewer.innerHTML = `
            <div class="dir-header">
                <h2>${escapeHtml(title)}</h2>
                ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
            </div>
            <div class="item-grid">${cards.join('')}</div>`;

        viewer.querySelectorAll('.item-card').forEach(card => {
            const itemPath = card.dataset.path;
            const type = card.dataset.type;
            card.addEventListener('click', (e) => {
                const dlBtn = e.target.closest('button[data-action="download"]');
                if (dlBtn) {
                    e.stopPropagation();
                    downloadFile(dlBtn.dataset.url, dlBtn.dataset.name, dlBtn);
                    return;
                }
                navigate(itemPath);
            });
        });
    } catch (e) {
        viewer.innerHTML = `<div class="error">加载失败：${escapeHtml(e.message)}</div>`;
    }
}

// ========= 渲染：文件视图 =========
async function renderFileView(path) {
    const viewer = $('#viewer');
    viewer.innerHTML = '<div class="loading">加载中...</div>';
    const name = path.split('/').pop();
    const rawUrl = `${RAW_BASE}/${encodeURI(path)}`;
    const ghUrl = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/blob/${CONFIG.branch}/${encodeURI(path)}`;

    if (!isMarkdown(name)) {
        viewer.innerHTML = `
            <div class="file-placeholder">
                <div class="big-icon">📎</div>
                <h3>${escapeHtml(name)}</h3>
                <p>该文件类型不支持在线预览</p>
                <button class="btn primary" id="dlBtn">⬇ 下载文件</button>
            </div>`;
        viewer.querySelector('#dlBtn').addEventListener('click', (e) => {
            downloadFile(rawUrl, name, e.currentTarget);
        });
        return;
    }

    try {
        const text = await loadRaw(path);
        const html = marked.parse(text, { breaks: true, gfm: true });
        viewer.innerHTML = `
            <div class="file-toolbar">
                <a class="btn" href="${ghUrl}" target="_blank" rel="noopener">在 GitHub 打开</a>
                <button class="btn primary" id="dlBtn">⬇ 下载原文件</button>
            </div>
            <article class="markdown" id="mdContent">${html}</article>`;
        viewer.querySelector('#dlBtn').addEventListener('click', (e) => {
            downloadFile(rawUrl, name, e.currentTarget);
        });
        if (window.hljs) viewer.querySelectorAll('pre code').forEach(b => window.hljs.highlightElement(b));
    } catch (e) {
        viewer.innerHTML = `<div class="error">加载失败：${escapeHtml(e.message)}</div>`;
    }
}

// ========= 渲染：面包屑 =========
function renderBreadcrumb(path) {
    const bc = $('#breadcrumb');
    const parts = path.split('/');
    const crumbs = [];
    let acc = '';
    parts.forEach((p, i) => {
        acc = i === 0 ? p : acc + '/' + p;
        const label = p === CONFIG.docsRoot ? '🏠 首页' : p;
        if (i < parts.length - 1) {
            crumbs.push(`<a href="#${encodeURIComponent(acc)}">${escapeHtml(label)}</a>`);
            crumbs.push('<span class="sep">/</span>');
        } else {
            crumbs.push(`<span>${escapeHtml(label)}</span>`);
        }
    });
    bc.innerHTML = crumbs.join(' ');
}

// ========= 路由 =========
function navigate(path) {
    location.hash = encodeURIComponent(path);
}

async function handleRoute() {
    const raw = location.hash.slice(1);
    const path = raw ? decodeURIComponent(raw) : CONFIG.docsRoot;
    if (!path.startsWith(CONFIG.docsRoot)) {
        navigate(CONFIG.docsRoot);
        return;
    }
    renderBreadcrumb(path);
    highlightTreeNode(path);

    // 判断是文件还是目录：有扩展名则视为文件
    const name = path.split('/').pop();
    if (/\.[a-zA-Z0-9]+$/.test(name)) {
        await renderFileView(path);
    } else {
        await renderDirView(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========= 搜索（基于文件名 + _meta.json 描述） =========
let searchIndex = null; // {path, name, type, description}[]
let indexBuilding = null;

async function buildSearchIndex() {
    if (searchIndex) return searchIndex;
    if (indexBuilding) return indexBuilding;
    indexBuilding = (async () => {
        const result = [];
        async function walk(path) {
            let items;
            try { items = await listDir(path); } catch { return; }
            const meta = await loadMeta(path);
            const fileDescMap = meta?.files || {};
            const dirDescMap = meta?.dirs || {};
            for (const it of items) {
                if (it.name === '_meta.json') continue;
                if (it.type === 'dir') {
                    const subMeta = await loadMeta(it.path);
                    const rawDesc = dirDescMap[it.name];
                    const description = subMeta?.description || (typeof rawDesc === 'string' ? rawDesc : (rawDesc?.description || ''));
                    result.push({
                        path: it.path,
                        name: subMeta?.title || it.name,
                        type: 'dir',
                        description,
                    });
                    await walk(it.path);
                } else {
                    const rawDesc = fileDescMap[it.name];
                    const description = typeof rawDesc === 'string' ? rawDesc : (rawDesc?.description || '');
                    result.push({
                        path: it.path,
                        name: it.name,
                        type: 'file',
                        description,
                    });
                }
            }
        }
        await walk(CONFIG.docsRoot);
        searchIndex = result;
        return result;
    })();
    return indexBuilding;
}

function doSearch(keyword) {
    const results = $('#searchResults');
    const q = keyword.trim().toLowerCase();
    if (!q) { results.classList.add('hidden'); return; }

    results.classList.remove('hidden');
    results.innerHTML = '<div class="empty">建立索引中...</div>';

    buildSearchIndex().then(index => {
        const matched = index.filter(it =>
            it.name.toLowerCase().includes(q) ||
            (it.description || '').toLowerCase().includes(q) ||
            it.path.toLowerCase().includes(q)
        ).slice(0, 30);

        if (matched.length === 0) {
            results.innerHTML = '<div class="empty">未找到相关结果</div>';
            return;
        }
        results.innerHTML = matched.map(it => `
            <div class="item" data-path="${escapeHtml(it.path)}">
                <div class="name">${it.type === 'dir' ? '📁' : '📄'} ${escapeHtml(it.name)}</div>
                ${it.description ? `<div class="desc">${escapeHtml(it.description)}</div>` : ''}
                <div class="path">${escapeHtml(it.path)}</div>
            </div>
        `).join('');
        results.querySelectorAll('.item').forEach(el => {
            el.addEventListener('click', () => {
                navigate(el.dataset.path);
                results.classList.add('hidden');
                $('#searchInput').value = '';
            });
        });
    }).catch(e => {
        results.innerHTML = `<div class="empty">搜索失败：${escapeHtml(e.message)}</div>`;
    });
}

function setupSearch() {
    const input = $('#searchInput');
    const results = $('#searchResults');
    let timer = null;
    input.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => doSearch(e.target.value), 200);
    });
    input.addEventListener('focus', () => {
        if (input.value.trim()) results.classList.remove('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) results.classList.add('hidden');
    });
}

// ========= 初始化 =========
window.addEventListener('DOMContentLoaded', () => {
    renderTree();
    setupSearch();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
});
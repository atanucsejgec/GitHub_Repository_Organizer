// ===== Configuration =====
const GITHUB_USER = 'atanucsejgec';
const REPOS_API = `https://api.github.com/users/${GITHUB_USER}/repos`;
const TREE_API_BASE = `https://api.github.com/repos/${GITHUB_USER}`;

// ===== Category Definitions =====
const CATEGORIES = {
  'Android & Kotlin': { icon: '📱', cssClass: 'cat-kotlin',     languages: ['Kotlin', 'Java'] },
  Web:                { icon: '🌐', cssClass: 'cat-web',        languages: ['HTML', 'CSS', 'JavaScript', 'Vue', 'Svelte', 'PHP'] },
  Python:             { icon: '🐍', cssClass: 'cat-python',     languages: ['Python'] },
  TypeScript:         { icon: '🔷', cssClass: 'cat-typescript', languages: ['TypeScript'] },
  'C++':              { icon: '⚙️', cssClass: 'cat-cpp',        languages: ['C++'] },
  C:                  { icon: '🔧', cssClass: 'cat-c',          languages: ['C'] },
  'C#':               { icon: '🟩', cssClass: 'cat-csharp',     languages: ['C#'] },
  Go:                 { icon: '🐹', cssClass: 'cat-go',         languages: ['Go'] },
  Rust:               { icon: '🦀', cssClass: 'cat-rust',       languages: ['Rust'] },
  Ruby:               { icon: '💎', cssClass: 'cat-ruby',       languages: ['Ruby'] },
  Swift:              { icon: '🍎', cssClass: 'cat-swift',      languages: ['Swift'] },
  Dart:               { icon: '🎯', cssClass: 'cat-dart',       languages: ['Dart'] },
  Shell:              { icon: '🖥️', cssClass: 'cat-shell',      languages: ['Shell', 'PowerShell', 'Batchfile'] },
  'README Only / Empty': { icon: '📄', cssClass: 'cat-readme',  languages: [] },
  'Other Projects':   { icon: '📦', cssClass: 'cat-other',      languages: [] },
};

// ===== State =====
let allRepos = [];
let categorizedRepos = {};
let treeCache = {};
let isLoaded = false;

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== SVG Icons =====
const icons = {
  search: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 1 1-1.06 1.06l-3.04-3.04ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/></svg>`,
  chevron: `<svg class="tree-chevron" viewBox="0 0 16 16" fill="currentColor"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/></svg>`,
  repo: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>`,
  folder: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M.75 0h4a.75.75 0 0 1 .596.297L7.003 3H13.5a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-.75.75h-13a.75.75 0 0 1-.75-.75V.75A.75.75 0 0 1 .75 0ZM1.5 1.5v10h12v-7H6.747a.75.75 0 0 1-.596-.297L4.497 1.5Z"/></svg>`,
  file: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>`,
  star: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg>`,
  fork: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/></svg>`,
  external: `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 2h3.5a.75.75 0 0 1 0 1.5H4.56l6.22 6.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L3.5 4.56v2.69a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 2.75 3h1ZM7.5 8.75a.75.75 0 0 1 .75-.75h4A1.75 1.75 0 0 1 14 9.75v3.5A1.75 1.75 0 0 1 12.25 15h-3.5A1.75 1.75 0 0 1 7 13.25v-4A.75.75 0 0 1 7.5 8.75Zm.75.75v3.75c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-4v.25-.25Z"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"/></svg>`,
  arrowRight: `→`,
};

// ===== PAT Management =====
function getToken() {
  return localStorage.getItem('github_pat') || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem('github_pat', token.trim());
  } else {
    localStorage.removeItem('github_pat');
  }
}

function getHeaders() {
  const headers = { 'Accept': 'application/vnd.github.v3+json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ===== API Calls =====
async function fetchAllRepos() {
  let page = 1;
  let repos = [];
  const perPage = 100;
  const token = getToken();

  // Use /user/repos when authenticated (returns private repos)
  // Use /users/{username}/repos when unauthenticated (public only)
  const baseUrl = token
    ? 'https://api.github.com/user/repos'
    : `https://api.github.com/users/${GITHUB_USER}/repos`;

  while (true) {
    const url = `${baseUrl}?per_page=${perPage}&page=${page}&sort=updated`;
    const res = await fetch(url, { headers: getHeaders() });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error(`GitHub API error ${res.status}: Invalid token or rate limited`);
      }
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    if (data.length === 0) break;
    repos = repos.concat(data);

    if (data.length < perPage) break;
    page++;
  }

  return repos;
}

// Only called on Page 3 when user clicks a repo — saves rate limits
async function fetchRepoTree(repoName) {
  if (treeCache[repoName]) return treeCache[repoName];

  for (const branch of ['main', 'master']) {
    const url = `${TREE_API_BASE}/${repoName}/git/trees/${branch}?recursive=1`;
    const res = await fetch(url, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      treeCache[repoName] = data;
      return data;
    }
  }

  throw new Error('Could not fetch repository tree. Branch may not exist.');
}

// ===== Categorization =====
function categorizeRepos(repos) {
  const cats = {};
  Object.keys(CATEGORIES).forEach(cat => { cats[cat] = []; });

  repos.forEach(repo => {
    const lang = repo.language;

    if (!lang) {
      cats['README Only / Empty'].push(repo);
      return;
    }

    let placed = false;
    for (const [catName, catDef] of Object.entries(CATEGORIES)) {
      if (catDef.languages.includes(lang)) {
        cats[catName].push(repo);
        placed = true;
        break;
      }
    }

    if (!placed) {
      cats['Other Projects'].push(repo);
    }
  });

  // Remove empty categories
  Object.keys(cats).forEach(key => {
    if (cats[key].length === 0) delete cats[key];
  });

  return cats;
}

// ===== Language Colors =====
function getLanguageColor(lang) {
  const colors = {
    Python: '#3572A5', Kotlin: '#A97BFF', Java: '#B07219',
    JavaScript: '#F1E05A', TypeScript: '#3178C6', HTML: '#E34C26',
    CSS: '#563D7C', 'C++': '#6295CB', C: '#555555',
    'C#': '#178600', Go: '#00ADD8', Rust: '#DEA584',
    Ruby: '#CC342D', Swift: '#F05138', Dart: '#00B4AB',
    Shell: '#89E051', PHP: '#4F5D95', R: '#198CE7',
    Vue: '#41B883', Svelte: '#FF3E00',
  };
  return colors[lang] || '#8b949e';
}

// ===== File Extension to Icon/Color =====
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = {
    py: { color: '#3572A5', label: 'PY' }, kt: { color: '#A97BFF', label: 'KT' },
    kts: { color: '#A97BFF', label: 'KT' }, java: { color: '#B07219', label: 'JV' },
    js: { color: '#F1E05A', label: 'JS' }, jsx: { color: '#F1E05A', label: 'JX' },
    ts: { color: '#3178C6', label: 'TS' }, tsx: { color: '#3178C6', label: 'TX' },
    html: { color: '#E34C26', label: '🌐' }, css: { color: '#563D7C', label: '🎨' },
    scss: { color: '#C6538C', label: 'SC' }, cpp: { color: '#6295CB', label: 'C+' },
    c: { color: '#555', label: ' C' }, h: { color: '#555', label: ' H' },
    cs: { color: '#178600', label: 'C#' }, go: { color: '#00ADD8', label: 'GO' },
    rs: { color: '#DEA584', label: 'RS' }, rb: { color: '#CC342D', label: 'RB' },
    swift: { color: '#F05138', label: 'SW' }, dart: { color: '#00B4AB', label: 'DT' },
    json: { color: '#F1E05A', label: '{}' }, xml: { color: '#E34C26', label: 'XM' },
    yml: { color: '#CB171E', label: 'YM' }, yaml: { color: '#CB171E', label: 'YM' },
    md: { color: '#083FA1', label: 'MD' }, txt: { color: '#8b949e', label: 'TX' },
    sh: { color: '#89E051', label: 'SH' }, bat: { color: '#C1F12E', label: 'BT' },
    gradle: { color: '#02303A', label: 'GR' }, svg: { color: '#FFB13B', label: 'SV' },
    png: { color: '#a453c9', label: '🖼' }, jpg: { color: '#a453c9', label: '🖼' },
    gif: { color: '#a453c9', label: '🖼' }, ico: { color: '#a453c9', label: '🖼' },
    gitignore: { color: '#F05033', label: 'GI' }, dockerfile: { color: '#384D54', label: 'DK' },
    toml: { color: '#9C4221', label: 'TM' }, cfg: { color: '#8b949e', label: 'CF' },
    ini: { color: '#8b949e', label: 'IN' }, sql: { color: '#E38C00', label: 'SQ' },
    php: { color: '#4F5D95', label: 'PH' }, r: { color: '#198CE7', label: ' R' },
    ipynb: { color: '#DA5B0B', label: 'NB' },
  };
  return map[ext] || { color: '#8b949e', label: '📄' };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Router =====
function getRoute() {
  const hash = window.location.hash || '#/';
  if (hash === '#/' || hash === '#') return { page: 'home' };

  const catMatch = hash.match(/^#\/category\/(.+)$/);
  if (catMatch) return { page: 'category', category: decodeURIComponent(catMatch[1]) };

  const repoMatch = hash.match(/^#\/repo\/(.+)$/);
  if (repoMatch) return { page: 'repo', repo: decodeURIComponent(repoMatch[1]) };

  return { page: 'home' };
}

function navigate(hash) {
  window.location.hash = hash;
}

// ===== Stats Bar =====
function renderStatsBar() {
  const totalRepos = allRepos.length;
  const publicCount = allRepos.filter(r => !r.private).length;
  const privateCount = allRepos.filter(r => r.private).length;
  const totalStars = allRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const catCount = Object.keys(categorizedRepos).length;

  $('#stats-bar').innerHTML = `
    <div class="stat-chip">
      <span class="stat-dot" style="background: var(--accent-blue)"></span>
      <span class="stat-value">${totalRepos}</span> Repositories
    </div>
    <div class="stat-chip">
      <span class="stat-dot" style="background: var(--accent-green)"></span>
      <span class="stat-value">${publicCount}</span> Public
    </div>
    ${privateCount > 0 ? `
    <div class="stat-chip">
      <span class="stat-dot" style="background: var(--accent-orange)"></span>
      <span class="stat-value">${privateCount}</span> Private
    </div>` : ''}
    <div class="stat-chip">
      <span class="stat-dot" style="background: var(--accent-yellow)"></span>
      <span class="stat-value">${totalStars}</span> Stars
    </div>
    <div class="stat-chip">
      <span class="stat-dot" style="background: var(--accent-purple)"></span>
      <span class="stat-value">${catCount}</span> Categories
    </div>
  `;
}

// ===== Breadcrumb =====
function renderBreadcrumb(route) {
  const bc = $('#breadcrumb');
  if (route.page === 'home') {
    bc.innerHTML = '';
    return;
  }

  let html = `<a href="#/">Home</a>`;

  if (route.page === 'category') {
    const cat = CATEGORIES[route.category];
    html += `<span class="bc-sep">/</span>`;
    html += `<span class="bc-current">${cat ? cat.icon : '📁'} ${route.category}</span>`;
  }

  if (route.page === 'repo') {
    // Find which category this repo belongs to
    let repoCat = null;
    for (const [catName, repos] of Object.entries(categorizedRepos)) {
      if (repos.find(r => r.name === route.repo)) {
        repoCat = catName;
        break;
      }
    }
    if (repoCat) {
      const cat = CATEGORIES[repoCat];
      html += `<span class="bc-sep">/</span>`;
      html += `<a href="#/category/${encodeURIComponent(repoCat)}">${cat ? cat.icon : '📁'} ${repoCat}</a>`;
    }
    html += `<span class="bc-sep">/</span>`;
    html += `<span class="bc-current">${route.repo}</span>`;
  }

  bc.innerHTML = html;
}


// ============================================================
//  PAGE 1: HOME — Folder Cards + Quick Access Repo Tree
// ============================================================
function renderHomePage() {
  const container = $('#page-container');
  const sortedCats = Object.entries(categorizedRepos).sort((a, b) => b[1].length - a[1].length);

  let html = '';

  // Search
  html += `
    <div class="search-section">
      <div class="search-box">
        ${icons.search}
        <input type="text" id="home-search" placeholder="Search repositories..." autocomplete="off">
      </div>
    </div>
  `;

  // Section: Language Folders
  html += `
    <div class="section-title">
      <span class="title-icon">📁</span>
      Language Folders
      <span class="title-count">${sortedCats.length} categories</span>
    </div>
    <div class="folder-grid" id="folder-grid">
  `;

  for (const [catName, repos] of sortedCats) {
    const cat = CATEGORIES[catName];
    html += `
      <a href="#/category/${encodeURIComponent(catName)}" class="folder-card" id="folder-${catName.replace(/[^a-zA-Z0-9]/g, '')}">
        <div class="folder-card-icon ${cat.cssClass}">${cat.icon}</div>
        <div class="folder-card-info">
          <div class="folder-card-name">${catName}</div>
          <div class="folder-card-count">${repos.length} repo${repos.length !== 1 ? 's' : ''}</div>
        </div>
        <span class="folder-card-arrow">${icons.arrowRight}</span>
      </a>
    `;
  }
  html += `</div>`;

  // Section: Quick Access — All Repos Tree (VS Code Explorer Style)
  html += `
    <div class="quick-tree-section">
      <div class="section-title">
        <span class="title-icon">🌳</span>
        All Repositories — Quick Access
        <span class="title-count">${allRepos.length} repos</span>
      </div>
      <div class="quick-tree" id="quick-tree">
  `;

  for (const [catName, repos] of sortedCats) {
    const cat = CATEGORIES[catName];
    html += `
      <div class="explorer-folder" data-cat="${catName}">📂 ${cat.icon} ${catName}</div>
      <ul class="explorer-file-list" data-cat="${catName}">
        ${repos.map(repo => `
          <li data-repo="${repo.name}">
            <span class="explorer-file-icon">📄</span>
            <span class="repo-link" title="${repo.name}">${repo.name}</span>
            ${repo.private ? '<span class="explorer-private-badge">Private</span>' : ''}
            ${repo.description ? `<span class="explorer-description">- ${escapeHtml(repo.description)}</span>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
  }
  html += `</div></div>`;

  container.innerHTML = html;

  // Bind events
  bindHomeEvents();
}

function bindHomeEvents() {
  // Repo click → navigate to Page 3
  $$('.explorer-file-list li').forEach(item => {
    item.addEventListener('click', () => {
      navigate(`#/repo/${encodeURIComponent(item.dataset.repo)}`);
    });
  });

  // Search filter
  const searchInput = $('#home-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      filterHomeTree(term);
    });
  }
}

function filterHomeTree(term) {
  $$('.explorer-file-list').forEach(list => {
    const catName = list.dataset.cat;
    const items = list.querySelectorAll('li');
    let visibleCount = 0;

    items.forEach(item => {
      const name = (item.dataset.repo || '').toLowerCase();
      const desc = (item.querySelector('.explorer-description')?.textContent || '').toLowerCase();
      const match = !term || name.includes(term) || desc.includes(term);
      item.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // Hide folder + list if no matches
    const folderEl = document.querySelector(`.explorer-folder[data-cat="${catName}"]`);
    if (folderEl) {
      folderEl.style.display = visibleCount === 0 && term ? 'none' : '';
    }
    list.style.display = visibleCount === 0 && term ? 'none' : '';
  });

  // Also filter folder cards
  $$('.folder-card').forEach(card => {
    if (!term) {
      card.style.display = '';
      return;
    }
    const href = card.getAttribute('href');
    const catName = decodeURIComponent(href.replace('#/category/', ''));
    const repos = categorizedRepos[catName] || [];
    const catMatch = catName.toLowerCase().includes(term);
    const repoMatch = repos.some(r => r.name.toLowerCase().includes(term));
    card.style.display = catMatch || repoMatch ? '' : 'none';
  });
}


// ============================================================
//  PAGE 2: CATEGORY — Repos for a specific language/category
// ============================================================
function renderCategoryPage(catName) {
  const container = $('#page-container');
  const cat = CATEGORIES[catName];
  const repos = categorizedRepos[catName];

  if (!repos || repos.length === 0) {
    container.innerHTML = `
      <a href="#/" class="back-btn">${icons.arrowLeft} Back to Home</a>
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Category "${catName}" not found</div>
        <div class="empty-state-hint">Go back to the home page to browse categories</div>
      </div>
    `;
    return;
  }

  let html = '';

  // Back button
  html += `<a href="#/" class="back-btn">${icons.arrowLeft} Back to Home</a>`;

  // Category header
  html += `
    <div class="category-header-section">
      <div class="category-header-icon ${cat.cssClass}" style="font-size: 28px;">${cat.icon}</div>
      <div class="category-header-info">
        <h1>${catName}</h1>
        <p>${repos.length} repositor${repos.length !== 1 ? 'ies' : 'y'} • Languages: ${cat.languages.length > 0 ? cat.languages.join(', ') : 'None detected'}</p>
      </div>
    </div>
  `;

  // Search
  html += `
    <div class="search-section">
      <div class="search-box">
        ${icons.search}
        <input type="text" id="cat-search" placeholder="Search in ${catName}..." autocomplete="off">
      </div>
    </div>
  `;

  // Repo cards grid
  html += `<div class="repo-grid" id="repo-grid">`;
  for (const repo of repos) {
    const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    html += `
      <a href="#/repo/${encodeURIComponent(repo.name)}" class="repo-card" data-repo="${repo.name}">
        <div class="repo-card-top">
          <span class="repo-card-icon">${icons.repo}</span>
          <span class="repo-card-name">${repo.name}</span>
          <span class="repo-card-badge ${repo.private ? 'private' : 'public'}">${repo.private ? '🔒 Private' : 'Public'}</span>
          <span class="repo-card-arrow">${icons.arrowRight}</span>
        </div>
        <div class="repo-card-desc">${repo.description || 'No description provided.'}</div>
        <div class="repo-card-meta">
          ${repo.language ? `
            <span class="repo-card-meta-item">
              <span class="repo-card-meta-dot" style="background: ${getLanguageColor(repo.language)};"></span>
              ${repo.language}
            </span>
          ` : ''}
          <span class="repo-card-meta-item">${icons.star} ${repo.stargazers_count || 0}</span>
          <span class="repo-card-meta-item">${icons.fork} ${repo.forks_count || 0}</span>
          <span class="repo-card-meta-item">Updated ${updated}</span>
        </div>
      </a>
    `;
  }
  html += `</div>`;

  container.innerHTML = html;

  // Search
  const searchInput = $('#cat-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      $$('.repo-card').forEach(card => {
        const name = card.dataset.repo.toLowerCase();
        const desc = (card.querySelector('.repo-card-desc')?.textContent || '').toLowerCase();
        card.style.display = (!term || name.includes(term) || desc.includes(term)) ? '' : 'none';
      });
    });
  }
}


// ============================================================
//  PAGE 3: REPO TREE — File structure (tree API called on demand)
// ============================================================
async function renderRepoPage(repoName) {
  const container = $('#page-container');
  const repo = allRepos.find(r => r.name === repoName);

  if (!repo) {
    container.innerHTML = `
      <a href="#/" class="back-btn">${icons.arrowLeft} Back to Home</a>
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">Repository "${repoName}" not found</div>
        <div class="empty-state-hint">Go back to the home page to browse repositories</div>
      </div>
    `;
    return;
  }

  // Find category for back navigation
  let repoCat = null;
  for (const [catName, repos] of Object.entries(categorizedRepos)) {
    if (repos.find(r => r.name === repoName)) {
      repoCat = catName;
      break;
    }
  }

  const backHref = repoCat ? `#/category/${encodeURIComponent(repoCat)}` : '#/';
  const backLabel = repoCat || 'Home';

  // Back button + repo header + loading
  let html = `<a href="${backHref}" class="back-btn">${icons.arrowLeft} Back to ${backLabel}</a>`;
  html += `<div class="repo-detail-section">`;
  html += renderRepoHeader(repo);
  html += `
    <div class="file-tree-container">
      <div class="file-tree-loading">
        <div class="spinner"></div>
        <div>Loading file structure...</div>
      </div>
    </div>
  `;
  html += `</div>`;

  container.innerHTML = html;

  // Fetch tree
  try {
    const treeData = await fetchRepoTree(repoName);
    renderFileTreeInPage(repo, treeData);
  } catch (err) {
    const treeContainer = container.querySelector('.file-tree-container');
    if (treeContainer) {
      treeContainer.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${err.message}</div>
          <div class="error-hint">Make sure the repository has a main or master branch</div>
        </div>
      `;
    }
  }
}

function renderRepoHeader(repo) {
  const updated = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return `
    <div class="repo-header">
      <div class="repo-info">
        <div class="repo-name">
          ${repo.name}
          <span class="badge ${repo.private ? 'badge-private' : 'badge-public'}">
            ${repo.private ? '🔒 Private' : 'Public'}
          </span>
        </div>
        ${repo.description ? `<div class="repo-description">${escapeHtml(repo.description)}</div>` : ''}
        <div class="repo-meta">
          ${repo.language ? `<span class="repo-meta-item">
            <span style="background: ${getLanguageColor(repo.language)}; width: 12px; height: 12px; border-radius: 50%; display: inline-block;"></span>
            ${repo.language}
          </span>` : ''}
          <span class="repo-meta-item">${icons.star} ${repo.stargazers_count || 0}</span>
          <span class="repo-meta-item">${icons.fork} ${repo.forks_count || 0}</span>
          <span class="repo-meta-item">Updated ${updated}</span>
        </div>
      </div>
      <div class="repo-actions">
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="btn-outline">
          ${icons.external} Open on GitHub
        </a>
      </div>
    </div>
  `;
}

function buildTreeStructure(items) {
  const root = { children: {}, type: 'tree' };

  items.forEach(item => {
    const parts = item.path.split('/');
    let current = root;

    parts.forEach((part, i) => {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          type: i === parts.length - 1 ? item.type : 'tree',
          path: parts.slice(0, i + 1).join('/'),
          children: {},
          size: item.size || 0,
        };
      }
      current = current.children[part];
    });
  });

  return root;
}

function renderTreeNode(node, repoName, depth = 0) {
  const sortedChildren = Object.values(node.children).sort((a, b) => {
    if (a.type === 'tree' && b.type !== 'tree') return -1;
    if (a.type !== 'tree' && b.type === 'tree') return 1;
    return a.name.localeCompare(b.name);
  });

  let html = '<ul>';

  sortedChildren.forEach((child, idx) => {
    const isDir = child.type === 'tree';
    const hasChildren = Object.keys(child.children).length > 0;
    const isLast = idx === sortedChildren.length - 1;
    const fileInfo = getFileIcon(child.name);
    const fileUrl = `https://github.com/${GITHUB_USER}/${repoName}/blob/main/${child.path}`;
    const dirUrl = `https://github.com/${GITHUB_USER}/${repoName}/tree/main/${child.path}`;

    if (isDir) {
      html += `
        <li${isLast ? ' class="tree-last"' : ''}>
          <div class="file-tree-item dir" data-path="${child.path}">
            <span class="tree-toggle">${icons.chevron}</span>
            <span class="file-icon" style="color: #58a6ff;">${icons.folder}</span>
            <span class="file-name"><a href="${dirUrl}" target="_blank" rel="noopener">${child.name}</a></span>
          </div>
          ${hasChildren ? `<div class="dir-children">${renderTreeNode(child, repoName, depth + 1)}</div>` : ''}
        </li>`;
    } else {
      const sizeStr = child.size ? formatSize(child.size) : '';
      html += `
        <li${isLast ? ' class="tree-last"' : ''}>
          <div class="file-tree-item">
            <span class="file-icon" style="color: ${fileInfo.color};">${icons.file}</span>
            <span class="file-name"><a href="${fileUrl}" target="_blank" rel="noopener">${child.name}</a></span>
            ${sizeStr ? `<span class="file-size">${sizeStr}</span>` : ''}
          </div>
        </li>`;
    }
  });

  html += '</ul>';
  return html;
}

function renderFileTreeInPage(repo, treeData) {
  const structure = buildTreeStructure(treeData.tree || []);
  const treeHtml = renderTreeNode(structure, repo.name);

  const fileCount = (treeData.tree || []).filter(i => i.type === 'blob').length;
  const dirCount = (treeData.tree || []).filter(i => i.type === 'tree').length;

  // Find the repo-detail-section and replace its file-tree part
  const section = document.querySelector('.repo-detail-section');
  if (!section) return;

  // Remove existing file-tree-container and tree-stats
  const existingTreeContainer = section.querySelector('.file-tree-container');
  const existingStats = section.querySelector('.tree-stats');
  if (existingStats) existingStats.remove();

  // Insert stats
  const statsDiv = document.createElement('div');
  statsDiv.className = 'tree-stats';
  statsDiv.innerHTML = `
    <span>📁 ${dirCount} folders</span>
    <span>📄 ${fileCount} files</span>
    ${treeData.truncated ? '<span style="color: var(--accent-orange);">⚠️ Tree truncated (large repo)</span>' : ''}
    <div class="tree-toggle-actions">
      <button class="btn-tree-toggle" id="btn-collapse-all" title="Collapse all folders">⊟ Collapse All</button>
      <button class="btn-tree-toggle" id="btn-expand-all" title="Expand all folders">⊞ Expand All</button>
    </div>
  `;

  if (existingTreeContainer) {
    section.insertBefore(statsDiv, existingTreeContainer);
    existingTreeContainer.innerHTML = `<div class="file-tree">${treeHtml}</div>`;
  }

  // Bind directory toggle (chevron + children)
  $$('.file-tree-item.dir').forEach(dir => {
    dir.addEventListener('click', (e) => {
      e.stopPropagation();
      // Don't toggle if the user clicked the GitHub link
      if (e.target.closest('a')) return;
      const children = dir.parentElement.querySelector('.dir-children');
      if (children) {
        const isOpen = children.classList.toggle('open');
        if (isOpen) {
          dir.classList.add('expanded');
        } else {
          dir.classList.remove('expanded');
        }
      }
    });
  });

  // Auto-expand ALL directories so the full tree is visible
  document.querySelectorAll('.file-tree .dir-children').forEach(el => {
    el.classList.add('open');
  });
  document.querySelectorAll('.file-tree-item.dir').forEach(el => {
    el.classList.add('expanded');
  });

  // Bind Collapse All / Expand All buttons
  const collapseBtn = document.getElementById('btn-collapse-all');
  const expandBtn = document.getElementById('btn-expand-all');

  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      document.querySelectorAll('.file-tree .dir-children').forEach(el => {
        el.classList.remove('open');
      });
      document.querySelectorAll('.file-tree-item.dir').forEach(el => {
        el.classList.remove('expanded');
      });
    });
  }

  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      document.querySelectorAll('.file-tree .dir-children').forEach(el => {
        el.classList.add('open');
      });
      document.querySelectorAll('.file-tree-item.dir').forEach(el => {
        el.classList.add('expanded');
      });
    });
  }
}


// ===== Utility =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Settings Modal =====
function openSettings() {
  const token = getToken();
  $('#token-input').value = token;
  updateTokenStatus();
  $('#settings-modal').classList.add('visible');
}

function closeSettings() {
  $('#settings-modal').classList.remove('visible');
}

function updateTokenStatus() {
  const token = getToken();
  const statusEl = $('#token-status');
  const settingsBtn = $('#btn-settings');

  if (token) {
    statusEl.className = 'token-status connected';
    statusEl.innerHTML = '🟢 Personal Access Token is configured';
    settingsBtn.classList.add('has-token');
  } else {
    statusEl.className = 'token-status disconnected';
    statusEl.innerHTML = '⚪ No token configured — showing public repos only';
    settingsBtn.classList.remove('has-token');
  }
}

function saveToken() {
  const token = $('#token-input').value.trim();
  setToken(token || null);
  updateTokenStatus();
  closeSettings();
  showToast(token ? '✅ Token saved! Reloading repos...' : '🗑️ Token removed. Reloading...', 'success');
  treeCache = {};
  loadRepos();
}

function deleteToken() {
  setToken(null);
  $('#token-input').value = '';
  updateTokenStatus();
  closeSettings();
  showToast('🗑️ Token deleted. Reloading...', 'success');
  treeCache = {};
  loadRepos();
}

// ===== Toast =====
function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ===== Loading State =====
function showLoadingState() {
  const container = $('#page-container');
  container.innerHTML = `
    <div class="section-title">
      <span class="title-icon">📁</span>
      Loading Repositories...
    </div>
    <div class="folder-grid">
      ${Array(6).fill(0).map(() => `<div class="skeleton skeleton-card"></div>`).join('')}
    </div>
    <div style="margin-top: 40px;">
      ${Array(8).fill(0).map(() => `
        <div style="padding: 10px 12px;">
          <div class="skeleton skeleton-line" style="width: ${60 + Math.random() * 30}%"></div>
        </div>
      `).join('')}
    </div>
  `;
  $('#stats-bar').innerHTML = '';
  $('#breadcrumb').innerHTML = '';
}

// ===== Main Router =====
function renderPage() {
  if (!isLoaded) return;

  const route = getRoute();
  renderBreadcrumb(route);

  // Re-animate container
  const container = $('#page-container');
  container.style.animation = 'none';
  // Trigger reflow
  void container.offsetHeight;
  container.style.animation = '';

  switch (route.page) {
    case 'home':
      renderHomePage();
      break;
    case 'category':
      renderCategoryPage(route.category);
      break;
    case 'repo':
      renderRepoPage(route.repo);
      break;
    default:
      renderHomePage();
  }
}

// ===== Load Repos =====
async function loadRepos() {
  showLoadingState();
  const refreshBtn = $('#btn-refresh');
  refreshBtn.classList.add('spinning');
  isLoaded = false;

  try {
    allRepos = await fetchAllRepos();
    categorizedRepos = categorizeRepos(allRepos);
    isLoaded = true;

    renderStatsBar();
    renderPage();
  } catch (err) {
    $('#page-container').innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-message">${err.message}</div>
        <div class="error-hint">Check your internet connection or add a GitHub token</div>
      </div>
    `;
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}

// ===== Init =====
function init() {
  updateTokenStatus();

  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-refresh').addEventListener('click', () => {
    treeCache = {};
    loadRepos();
  });

  $('#btn-close-modal').addEventListener('click', closeSettings);
  $('#btn-save-token').addEventListener('click', saveToken);
  $('#btn-delete-token').addEventListener('click', deleteToken);

  // Close modal on overlay click
  $('#settings-modal').addEventListener('click', (e) => {
    if (e.target === $('#settings-modal')) closeSettings();
  });

  // Escape to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });

  // Hash-based routing
  window.addEventListener('hashchange', renderPage);

  // Load repos
  loadRepos();
}

document.addEventListener('DOMContentLoaded', init);

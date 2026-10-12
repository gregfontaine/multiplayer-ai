import { LANGS, MODES, OUTCOMES, UI } from './config.js';
import { enableDragAndDrop } from './dnd.js';

const app = document.getElementById('app');
const overlay = document.getElementById('overlay');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
  lang: initialLang(),
  scenarios: [],
  scenario: null,
  placement: {}, // taskId -> mode id, or null when the task is still in the backlog
  lastRun: null, // { n, placement, results: { taskId: outcomeKey } }
  history: [], // [{ n, score, max, counts }]
  selected: null, // taskId selected by tap/click, waiting for a column
};

// ---------- helpers ----------

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem('lang');
    if (LANGS.includes(saved)) return saved;
  } catch { /* storage unavailable */ }
  return (navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

// Pick the current language from a { en, ja } object (plain strings pass through).
function tx(value) {
  if (value == null) return '';
  if (typeof value !== 'object' || Array.isArray(value)) return value;
  return value[state.lang] ?? value.en ?? Object.values(value)[0] ?? '';
}

function ui(key, vars = {}) {
  const s = UI[state.lang][key] ?? UI.en[key] ?? key;
  return typeof s === 'string' ? s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '') : s;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const modeById = id => MODES.find(m => m.id === id);
const memberById = id => state.scenario?.members.find(m => m.id === id);
const remainingCount = () => state.scenario.tasks.filter(t => !state.placement[t.id]).length;

function isStale(taskId) {
  return state.lastRun && state.lastRun.placement[taskId] !== state.placement[taskId];
}

// ---------- loading ----------

async function loadScenarios() {
  const index = await fetchJson('scenarios/index.json');
  const list = await Promise.all(index.scenarios.map(id => fetchJson(`scenarios/${id}.json`)));
  list.forEach(validateScenario);
  return list;
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  try {
    return await res.json();
  } catch (e) {
    throw new Error(`${url}: invalid JSON (${e.message})`);
  }
}

// Warn authors in the console about incomplete scenario files.
function validateScenario(s) {
  const where = `Scenario "${s.id}"`;
  if (!s.id || !s.title || !Array.isArray(s.members) || !Array.isArray(s.tasks)) {
    console.warn(`${where}: needs id, title, members[] and tasks[].`);
    return;
  }
  const memberIds = new Set(s.members.map(m => m.id));
  for (const t of s.tasks) {
    if (t.owner && !memberIds.has(t.owner)) console.warn(`${where}, task "${t.id}": unknown owner "${t.owner}".`);
    for (const m of MODES) {
      const o = t.outcomes?.[m.id];
      if (!o) console.warn(`${where}, task "${t.id}": missing outcome for mode "${m.id}".`);
      else if (!OUTCOMES[o.result]) console.warn(`${where}, task "${t.id}", mode "${m.id}": unknown result "${o.result}".`);
    }
  }
}

// ---------- navigation ----------

function route() {
  const id = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const scenario = state.scenarios.find(s => s.id === id) || null;
  if (scenario !== state.scenario) {
    state.scenario = scenario;
    state.placement = scenario ? Object.fromEntries(scenario.tasks.map(t => [t.id, null])) : {};
    state.lastRun = null;
    state.history = [];
    state.selected = null;
    window.scrollTo(0, 0);
  }
  render();
}

function setLang(lang) {
  state.lang = lang;
  try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  render();
}

// ---------- rendering ----------

function render() {
  document.documentElement.lang = state.lang;
  document.title = state.scenario ? `${tx(state.scenario.title)} — ${ui('appTitle')}` : ui('appTitle');
  document.getElementById('brand-title').textContent = ui('appTitle');
  document.getElementById('footer').innerHTML = `${esc(ui('footer'))} · <a href="https://agorax.jp" target="_blank" rel="noopener">Agorax</a>`;
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));

  if (!state.scenario) {
    app.innerHTML = homeView();
    return;
  }
  app.innerHTML = boardView();
  renderBoard();
  renderResults();
}

function homeView() {
  const steps = ui('how').map(s => `<li>${esc(s)}</li>`).join('');
  const modes = MODES.map((m, i) => `
    <div class="mode-pill mode-${m.id}">
      <span class="mode-num">${i + 1}</span>
      <span class="mode-icon" aria-hidden="true">${m.icon}</span>
      <div><strong>${esc(tx(m.label))}</strong><span>${esc(tx(m.desc))}</span></div>
    </div>`).join('');
  const teams = state.scenarios.map(s => `
    <a class="team-card" href="#/${encodeURIComponent(s.id)}">
      <span class="team-icon" aria-hidden="true">${esc(s.icon || '👥')}</span>
      <h3>${esc(tx(s.title))}</h3>
      <p>${esc(tx(s.description))}</p>
      <div class="team-meta">
        <span class="avatars" aria-hidden="true">${s.members.map(m => esc(m.avatar || '🙂')).join('')}</span>
        <span>${esc(ui('tasksCount', { n: s.tasks.length }))}</span>
      </div>
    </a>`).join('');

  return `
    <section class="hero">
      <h1>${esc(ui('appTitle')).replace('AI', '<span class="hl">AI</span>')}</h1>
      <p>${esc(ui('tagline'))}</p>
    </section>
    <section class="intro">
      <div class="panel">
        <h2>${esc(ui('howTitle'))}</h2>
        <ol class="steps">${steps}</ol>
      </div>
      <div class="panel">
        <h2>${esc(ui('modesTitle'))}</h2>
        <div class="mode-list">${modes}</div>
      </div>
    </section>
    <h2 class="section-title">${esc(ui('chooseTeam'))}</h2>
    <div class="team-grid">${teams}</div>`;
}

function boardView() {
  const s = state.scenario;
  const members = s.members.map(m => `
    <article class="member">
      <div class="member-head">
        <span class="avatar" aria-hidden="true">${esc(m.avatar || '🙂')}</span>
        <div><strong>${esc(tx(m.name))}</strong><span class="role">${esc(tx(m.role))}</span></div>
      </div>
      <ul>${(tx(m.strengths) || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </article>`).join('');

  return `
    <a class="back-link" href="#/">${esc(ui('changeTeam'))}</a>
    <section class="team-header">
      <span class="team-icon" aria-hidden="true">${esc(s.icon || '👥')}</span>
      <div>
        <h1>${esc(tx(s.title))}</h1>
        <p>${esc(tx(s.description))}</p>
      </div>
    </section>
    <h2 class="section-title">${esc(ui('members'))}</h2>
    <div class="members">${members}</div>
    <p class="hint">💡 ${esc(ui('hint'))}</p>
    <div id="board" class="board"></div>
    <div id="sprintbar" class="sprintbar"></div>
    <section id="results" class="results"></section>`;
}

function taskCard(task) {
  const owner = memberById(task.owner);
  const run = state.lastRun;
  const outcome = run && !isStale(task.id) && state.placement[task.id] ? run.results[task.id] : null;
  const badge = outcome
    ? `<span class="badge outcome-${outcome}">${OUTCOMES[outcome].icon} ${esc(tx(OUTCOMES[outcome].label))}</span>`
    : '';
  const classes = ['task', state.selected === task.id ? 'selected' : '', outcome ? `has-result outcome-${outcome}` : ''].join(' ');
  return `
    <div class="${classes}" data-task="${esc(task.id)}" tabindex="0" role="button" aria-pressed="${state.selected === task.id}">
      <div class="task-title">${esc(tx(task.title))}</div>
      ${task.description ? `<div class="task-desc">${esc(tx(task.description))}</div>` : ''}
      <div class="task-foot">
        ${owner ? `<span class="owner" title="${esc(ui('owner'))}">${esc(owner.avatar || '🙂')} ${esc(tx(owner.name))}</span>` : '<span></span>'}
        ${badge}
      </div>
    </div>`;
}

function column(zone, num, icon, title, desc, tasks) {
  const cards = tasks.map(taskCard).join('');
  const target = state.selected && state.placement[state.selected] !== (zone || null);
  return `
    <section class="col ${zone ? `mode-${zone}` : 'backlog'} ${target ? 'targetable' : ''}" data-zone="${zone}" aria-label="${esc(title)}">
      <header>
        <div class="col-title"><span class="mode-num">${num}</span><span aria-hidden="true">${icon}</span> ${esc(title)}</div>
        <div class="col-desc">${esc(desc)}</div>
        ${target ? `<div class="tap-here">${esc(ui('tapHere'))}</div>` : ''}
      </header>
      <div class="drop">${cards || `<div class="empty">${esc(ui('emptyDrop'))}</div>`}</div>
    </section>`;
}

function renderBoard() {
  const tasks = state.scenario.tasks;
  const backlog = tasks.filter(t => !state.placement[t.id]);
  let html = column('', 0, '📋', ui('backlog'), ui('backlogDesc'), backlog);
  MODES.forEach((m, i) => {
    html += column(m.id, i + 1, m.icon, tx(m.label), tx(m.desc), tasks.filter(t => state.placement[t.id] === m.id));
  });
  document.getElementById('board').innerHTML = html;

  const left = remainingCount();
  document.getElementById('sprintbar').innerHTML = `
    <div class="sprintbar-inner">
      <span class="progress ${left ? '' : 'ok'}">${esc(left ? ui('remaining', { n: left }) : ui('ready'))}</span>
      <div class="actions">
        <button type="button" class="btn ghost" data-action="reset">${esc(ui('reset'))}</button>
        <button type="button" class="btn primary" data-action="run" ${left ? 'disabled' : ''}>${esc(state.lastRun ? ui('rerun') : ui('run'))}</button>
      </div>
    </div>`;

  const staleNote = document.getElementById('stale-note');
  if (staleNote) staleNote.hidden = !tasks.some(t => isStale(t.id));
}

function renderResults(animate = false) {
  const el = document.getElementById('results');
  const run = state.lastRun;
  if (!run) { el.innerHTML = ''; return; }

  const last = state.history[state.history.length - 1];
  const tally = Object.entries(OUTCOMES).map(([key, o]) => `
    <div class="tally-item outcome-${key}"><span class="tally-n">${last.counts[key]}</span><span>${o.icon} ${esc(tx(o.label))}</span></div>`).join('');

  // Show results grouped by way of working, in board order.
  const ordered = MODES.flatMap(m => state.scenario.tasks.filter(t => run.placement[t.id] === m.id));
  const items = ordered.map((t, i) => {
    const mode = modeById(run.placement[t.id]);
    const key = run.results[t.id];
    const o = OUTCOMES[key];
    return `
      <article class="result outcome-${key} ${animate ? 'reveal' : ''}" style="--i:${i}">
        <div class="result-top">
          <span class="badge outcome-${key}">${o.icon} ${esc(tx(o.label))}</span>
          <h3>${esc(tx(t.title))}</h3>
          <span class="mode-chip mode-${mode.id}"><span aria-hidden="true">${mode.icon}</span> ${esc(tx(mode.label))}</span>
        </div>
        <p>${esc(tx(t.outcomes[mode.id].comment))}</p>
      </article>`;
  }).join('');

  const history = state.history.length > 1 ? `
    <div class="history">
      <h3>${esc(ui('history'))}</h3>
      ${state.history.map(h => `
        <div class="history-row ${h === last ? 'current' : ''}">
          <span>${esc(ui('sprintN', { n: h.n }))}</span>
          <span class="bar"><span style="width:${(100 * h.score / h.max).toFixed(1)}%"></span></span>
          <span class="history-score">${h.score} / ${h.max}</span>
        </div>`).join('')}
    </div>` : '';

  el.innerHTML = `
    <div class="results-head">
      <h2>${esc(ui('resultsTitle', { n: run.n }))}</h2>
      <div class="score">
        <span class="score-label">${esc(ui('score'))}</span>
        <span class="score-value">${last.score}<small> / ${last.max}</small></span>
      </div>
    </div>
    <p id="stale-note" class="stale-note" ${state.scenario.tasks.some(t => isStale(t.id)) ? '' : 'hidden'}>🔄 ${esc(ui('stale'))}</p>
    <div class="tally">${tally}</div>
    <div class="result-list">${items}</div>
    ${history}
    <p class="try-again">🔁 ${esc(ui('tryAgain'))}</p>`;
}

// ---------- actions ----------

function moveTask(taskId, zone) {
  if (!(taskId in state.placement)) return;
  state.placement[taskId] = zone || null;
  state.selected = null;
  renderBoard();
}

function select(taskId) {
  state.selected = state.selected === taskId ? null : taskId;
  renderBoard();
  if (state.selected) document.querySelector(`.task[data-task="${CSS.escape(taskId)}"]`)?.focus({ preventScroll: true });
}

function resetBoard() {
  for (const id of Object.keys(state.placement)) state.placement[id] = null;
  state.selected = null;
  renderBoard();
}

async function runSprint() {
  if (remainingCount() > 0) return;
  state.selected = null;
  await playSprintAnimation();

  const results = {};
  const counts = Object.fromEntries(Object.keys(OUTCOMES).map(k => [k, 0]));
  let score = 0;
  for (const t of state.scenario.tasks) {
    const key = t.outcomes[state.placement[t.id]]?.result;
    results[t.id] = key;
    counts[key]++;
    score += OUTCOMES[key].points;
  }
  const n = state.history.length + 1;
  const max = state.scenario.tasks.length * Math.max(...Object.values(OUTCOMES).map(o => o.points));
  state.lastRun = { n, placement: { ...state.placement }, results };
  state.history.push({ n, score, max, counts });

  renderBoard();
  renderResults(!reducedMotion);
  document.getElementById('results').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function playSprintAnimation() {
  if (reducedMotion) return Promise.resolve();
  const days = ui('days');
  overlay.innerHTML = `
    <div class="overlay-card" role="status">
      <div class="overlay-title">${esc(ui('running'))}</div>
      <div class="days">${days.map((d, i) => `<span style="--d:${i}">${esc(d)}</span>`).join('')}</div>
    </div>`;
  overlay.hidden = false;
  return new Promise(resolve => setTimeout(() => { overlay.hidden = true; resolve(); }, 1600));
}

// ---------- events ----------

document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch { /* ignore */ }
});

app.addEventListener('click', e => {
  const action = e.target.closest('[data-action]')?.dataset.action;
  if (action === 'run') return runSprint();
  if (action === 'reset') return resetBoard();

  // Tap-to-move: a card is selected, then the user taps a column.
  if (state.selected && !e.target.closest('.task')) {
    const col = e.target.closest('[data-zone]');
    if (col) moveTask(state.selected, col.dataset.zone);
  }
});

app.addEventListener('keydown', e => {
  const card = e.target.closest?.('.task');
  if (!card) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    select(card.dataset.task);
  } else if (/^[0-4]$/.test(e.key)) {
    const id = card.dataset.task;
    moveTask(id, e.key === '0' ? '' : MODES[Number(e.key) - 1].id);
    document.querySelector(`.task[data-task="${CSS.escape(id)}"]`)?.focus();
  } else if (e.key === 'Escape' && state.selected) {
    select(state.selected);
  }
});

enableDragAndDrop(app, {
  onDrop: (taskId, zone) => moveTask(taskId, zone),
  onTap: taskId => select(taskId),
});

window.addEventListener('hashchange', route);

// ---------- start ----------

(async function start() {
  render();
  try {
    state.scenarios = await loadScenarios();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="panel error"><h2>${esc(ui('loadError'))}</h2><p>${esc(ui('loadErrorHint'))}</p><pre>${esc(err.message)}</pre></div>`;
    return;
  }
  route();
})();

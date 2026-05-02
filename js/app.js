// ============================================
// Keeping it Clean
// Vanilla JS App - No Framework Dependencies
// ============================================

(function () {
  'use strict';

  // Error overlay — never show a blank page
  window.addEventListener('error', (e) => {
    const msg = e.message + (e.filename ? ' (' + e.filename + ':' + e.lineno + ')' : '');
    const app = document.getElementById('app');
    if (app && !app.children.length) {
      app.innerHTML = `<div style="padding:2rem;text-align:center;font-family:sans-serif"><h2>Something went wrong</h2><pre style="white-space:pre-wrap;word-break:all;background:#f5f2eb;padding:1rem;border-radius:8px">${msg}</pre><button onclick="location.reload()" style="padding:0.5rem 1rem;margin-top:1rem;cursor:pointer">Reload</button></div>`;
    }
  });

  // --- State ---
  let activeTab = 'checklist';
  let activeFreqFilter = 'all';
  let activeRoomFilter = 'all';
  let activeRecipeFilter = 'all';
  let expandedRecipeId = null;
  let showCustomRecipeModal = false;
  let showTaskModal = false;
  let editingTaskId = null;
  let toastMessage = '';
  let toastVisible = false;
  let scrollPositions = { checklist: 0, recipes: 0, settings: 0 };
  let newTaskFreq = 'daily';
  let recipeSearchTerm = '';
  let soundEnabled = loadSoundEnabled();
  let justCheckedTaskId = null;

  // --- Timer State ---
  let activeTimer = null; // { taskId, startTime (ms), elapsed (ms) }
  let timerInterval = null;

  // --- DOM Helpers ---
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  function el(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'class') {
        let classes = [];
        if (typeof val === 'string') {
          classes = val.split(/\s+/).filter(Boolean);
        } else if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === 'string' && item) classes.push(...item.split(/\s+/));
            else if (typeof item === 'object' && item !== null) {
              for (const [c, v] of Object.entries(item)) { if (v) classes.push(c); }
            }
          }
        } else if (typeof val === 'object' && val !== null) {
          for (const [c, v] of Object.entries(val)) { if (v) classes.push(c); }
        }
        element.className = classes.join(' ');
      } else if (key === 'dataset') {
        Object.assign(element.dataset, val);
      } else if (key.startsWith('on') && typeof val === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), val);
      } else if (key === 'textContent') {
        element.textContent = val;
      } else if (key === 'innerHTML') {
        element.innerHTML = val;
      } else {
        element.setAttribute(key, val);
      }
    }
    for (const child of children) {
      if (typeof child === 'string') element.appendChild(document.createTextNode(child));
      else if (child) element.appendChild(child);
    }
    return element;
  }

  // --- SVG Icon Helpers ---
  function svgIcon(attrs = {}, children = []) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
    for (const child of children) { if (typeof child === 'object') svg.appendChild(child); }
    return svg;
  }
  function svgPath(d, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', d);
    for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
    return p;
  }
  function svgPolyline(points, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const pl = document.createElementNS(ns, 'polyline');
    pl.setAttribute('points', points);
    for (const [k, v] of Object.entries(attrs)) pl.setAttribute(k, v);
    return pl;
  }
  function svgLine(x1, y1, x2, y2, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    for (const [k, v] of Object.entries(attrs)) l.setAttribute(k, v);
    return l;
  }
  function svgRect(x, y, w, h, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', x); r.setAttribute('y', y);
    r.setAttribute('width', w); r.setAttribute('height', h);
    for (const [k, v] of Object.entries(attrs)) r.setAttribute(k, v);
    return r;
  }
  function svgCircle(cx, cy, r, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
    for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, v);
    return c;
  }

  // --- Icons ---
  function checkmarkSvg() {
    return svgIcon({ viewBox: '0 0 24 24', width: '14', height: '14', fill: 'none', stroke: 'white', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M6 12l4 4 8-8')]);
  }
  function checklistTabIcon(active) {
    const sw = active ? '2.5' : '2';
    return svgIcon({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: '24', height: '24' }, [svgRect('3','3','18','18',{ rx:'2', ry:'2' }), svgPolyline('9 11 12 14 22 4')]);
  }
  function recipeTabIcon(active) {
    const sw = active ? '2.5' : '2';
    return svgIcon({ viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: '24', height: '24' }, [svgPath('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), svgPolyline('14 2 14 8 20 8'), svgLine('16','13','8','13'), svgLine('16','17','8','17')]);
  }
  function settingsIcon(active) {
    const sw = active ? '2.5' : '2';
    return svgIcon({ viewBox: '0 0 24 24', width: '24', height: '24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
      svgCircle('12','12','3'),
      svgPath('M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z')
    ]);
  }
  function upArrowIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '14', height: '14', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPolyline('18 15 12 9 6 15')]);
  }
  function downArrowIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '14', height: '14', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPolyline('6 9 12 15 18 9')]);
  }
  function heartIcon(active) {
    return svgIcon({ viewBox: '0 0 24 24', width: '20', height: '20', stroke: active ? 'var(--color-danger)' : 'var(--color-text-light)', fill: active ? 'var(--color-danger)' : 'none', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.83l-1.06-1.22a5.5 5.5 0 0 0-7.78 7.78l1.06 1.22L12 21.29l7.78-7.78 1.06-1.22a5.5 5.5 0 0 0 0-7.78z')]);
  }
  function chevronIcon(expanded) {
    return svgIcon({ viewBox: '0 0 24 24', width: '20', height: '20', fill: 'none', stroke: 'var(--color-text-muted)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: `transition: transform 0.2s ease; transform: rotate(${expanded ? 180 : 0}deg);` }, [svgPath('M6 9l6 6 6-6')]);
  }
  function plusIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '24', height: '24', fill: 'none', stroke: 'white', 'stroke-width': '2.5', 'stroke-linecap': 'round' }, [svgPath('M12 5v14M5 12h14')]);
  }
  function closeIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '20', height: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }, [svgPath('M18 6L6 18M6 6l12 12')]);
  }
  function resetIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'), svgPath('M3 3v5h5')]);
  }
  function editIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'), svgPath('M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z')]);
  }
  function trashIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6')]);
  }
  function recipeLinkIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'var(--color-accent)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'), svgPolyline('14 2 14 8 20 8'), svgLine('16','13','8','13'), svgLine('16','17','8','17')]);
  }
  function timerIcon(active) {
    return svgIcon({ viewBox: '0 0 24 24', width: '18', height: '18', fill: 'none', stroke: active ? 'var(--color-accent)' : 'var(--color-text-muted)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [svgPath('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'), svgPath('M12 6v6l4 2')]);
  }
  function playIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'var(--color-accent)', stroke: 'none' }, [svgPath('M8 5v14l11-7z')]);
  }
  function pauseIcon() {
    return svgIcon({ viewBox: '0 0 24 24', width: '16', height: '16', fill: 'var(--color-accent)', stroke: 'none' }, [svgPath('M6 4h4v16H6zM14 4h4v16h-4z')]);
  }

  // --- Timer Helpers ---
  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function getTimerElapsed() {
    if (!activeTimer) return 0;
    return activeTimer.elapsed + (Date.now() - activeTimer.lastTick);
  }

  function pauseTimerInterval() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function resumeTimerInterval() {
    pauseTimerInterval();
    if (activeTimer) {
      timerInterval = setInterval(() => {
        activeTimer.elapsed += Date.now() - activeTimer.lastTick;
        activeTimer.lastTick = Date.now();
        saveActiveTimer(activeTimer);
        const td = $('#timer-display');
        if (td) td.textContent = formatTime(getTimerElapsed());
      }, 1000);
    }
  }

  function startTimer(taskId) {
    const saved = loadActiveTimer();
    if (saved && saved.taskId === taskId) {
      activeTimer = { taskId: saved.taskId, startTime: saved.startTime, elapsed: saved.elapsed + (Date.now() - saved.lastTick), lastTick: Date.now() };
    } else {
      activeTimer = { taskId, startTime: Date.now(), elapsed: 0, lastTick: Date.now() };
    }
    saveActiveTimer(activeTimer);
    resumeTimerInterval();
  }

  function stopTimer() {
    if (activeTimer) {
      activeTimer.elapsed += Date.now() - activeTimer.lastTick;
      activeTimer.lastTick = Date.now();
      saveActiveTimer(activeTimer);
    }
    activeTimer = null;
    clearActiveTimer();
    pauseTimerInterval();
  }

  function toggleTimer(taskId) {
    if (activeTimer && activeTimer.taskId === taskId) {
      stopTimer();
    } else {
      startTimer(taskId);
    }
    render();
  }

  // --- Toast ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage = msg; toastVisible = true; render();
    toastTimer = setTimeout(() => { toastVisible = false; toastTimer = null; render(); }, 2500);
  }

  // --- Confirm Dialog ---
  function showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = el('div', { class: 'modal-overlay', onClick: (e) => { if (e.target === overlay) cleanup(false); } });
      const sheet = el('div', { class: 'modal-sheet' });
      sheet.appendChild(el('div', { class: 'modal-handle' }));
      sheet.appendChild(el('h2', { class: 'modal-title' }, [message]));
      sheet.appendChild(el('button', { class: 'btn-primary', onClick: () => cleanup(true) }, ['OK']));
      sheet.appendChild(el('button', { class: 'btn-secondary', onClick: () => cleanup(false) }, ['Cancel']));
      overlay.appendChild(sheet);
      document.getElementById('app').appendChild(overlay);
      function cleanup(result) { overlay.remove(); resolve(result); }
    });
  }

  // --- Daily Reset Check ---
  function checkDailyReset() {
    const lastVisit = loadLastVisit();
    const t = today();
    if (lastVisit && lastVisit !== t) {
      const allTasks = getAllTasks();
      const now = new Date();
      for (const task of allTasks) {
        const lastDone = loadTasks()[task.id]?.lastCompleted;
        if (!lastDone) continue;
        const last = new Date(lastDone + 'T00:00:00');
        const diffDays = (now - last) / 86400000;
        let shouldReset = false;
        switch (task.frequency) {
          case 'daily': shouldReset = true; break;
          case 'weekly': shouldReset = diffDays >= 7; break;
          case 'biweekly': shouldReset = diffDays >= 14; break;
          case 'monthly': shouldReset = diffDays >= 30; break;
        }
        if (shouldReset) {
          const tasks = loadTasks();
          if (tasks[task.id]) {
            tasks[task.id].completed = false;
            tasks[task.id].completedDate = null;
            saveTaskState(task.id, tasks[task.id]);
          }
        }
      }
    }
    saveLastVisit(t);
  }

  // --- Merge built-in + user tasks ---
  function getAllTasks() {
    let userTasks = loadUserTasks();
    const order = loadUserTaskOrder();
    if (order) {
      userTasks = [...userTasks].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
    }
    return [...cleaningTasks, ...userTasks];
  }

  // --- Reorder user tasks ---
  function reorderUserTask(taskId, direction) {
    const userTasks = loadUserTasks();
    const idx = userTasks.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === userTasks.length - 1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    [userTasks[idx], userTasks[newIdx]] = [userTasks[newIdx], userTasks[idx]];
    _set('user-tasks', userTasks);
    _set('user-task-order', userTasks.map(t => t.id));
    render();
  }

  // --- Recipe Recommendation Engine ---
  // Match task name/note keywords to recipe tags
  function findRecipeForTask(task) {
    const keywords = (task.name + ' ' + (task.note || '')).toLowerCase();
    const allRecipes = [...cleaningRecipes, ...loadCustomRecipes()];

    // Keyword-to-tag mapping
    const keywordMap = {
      'counter': ['counters', 'kitchen'],
      'stove': ['kitchen', 'grease-cutter'],
      'oven': ['kitchen', 'grease-cutter'],
      'sink': ['kitchen', 'bathroom'],
      'floor': ['floors', 'multi-purpose'],
      'window': ['glass', 'windows'],
      'mirror': ['glass', 'bathroom'],
      'toilet': ['bathroom'],
      'shower': ['bathroom'],
      'tub': ['bathroom'],
      'fridge': ['fridge', 'kitchen'],
      'refrigerator': ['fridge', 'kitchen'],
      'closet': ['closet', 'deodorizer'],
      'wardrobe': ['closet', 'deodorizer'],
      'laundry': ['laundry'],
      'fabric': ['fabric', 'laundry'],
      'mattress': ['deodorizer'],
      'carpet': ['floors', 'deodorizer'],
      'rug': ['floors', 'deodorizer'],
      'dust': ['multi-purpose'],
      'vacuum': ['floors', 'multi-purpose'],
      'sweep': ['floors', 'multi-purpose'],
      'mop': ['floors', 'multi-purpose'],
      'dish': ['kitchen'],
      'appliance': ['multi-purpose', 'kitchen'],
      'faucet': ['bathroom', 'kitchen'],
      'tile': ['bathroom'],
      'grout': ['bathroom'],
      'couch': ['fabric', 'deodorizer'],
      'sofa': ['fabric', 'deodorizer'],
      'curtain': ['fabric'],
      'blinds': ['multi-purpose'],
      'furniture': ['multi-purpose'],
      'wood': ['multi-purpose'],
      'metal': ['multi-purpose'],
      'trash': ['deodorizer'],
      'bin': ['deodorizer'],
      'pet': ['cat-safe'],
      'cat': ['cat-safe'],
    };

    let bestMatch = null;
    let bestScore = 0;

    for (const recipe of allRecipes) {
      let score = 0;
      const recipeTags = (recipe.tags || []).map(t => t.toLowerCase());
      const recipeName = (recipe.name || '').toLowerCase();

      // Check keyword map
      for (const [keyword, tags] of Object.entries(keywordMap)) {
        if (keywords.includes(keyword)) {
          for (const tag of tags) {
            if (recipeTags.includes(tag)) score += 2;
          }
        }
      }

      // Direct tag name match
      for (const tag of recipeTags) {
        if (keywords.includes(tag)) score += 1;
      }

      // Recipe name keyword match
      const nameWords = recipeName.split(/\s+/);
      for (const word of nameWords) {
        if (word.length > 3 && keywords.includes(word)) score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = recipe;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  // --- Streak + Calendar Helpers (delegated to storage.js) ---
  // loadStreak, updateStreak, loadCalendar, recordCalendarDay, loadAchievements, unlockAchievement
  // are all defined in storage.js and used from there.

  // --- Mini Calendar Render ---
  function renderMiniCalendar() {
    const cal = loadCalendar();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const wrapper = el('div', { class: 'mini-calendar' });
    wrapper.appendChild(el('div', { class: 'cal-header' }, [`${monthNames[month]} ${year}`]));

    // Day headers
    const dayHeaders = el('div', { class: 'cal-day-headers' });
    for (const d of ['S','M','T','W','T','F','S']) dayHeaders.appendChild(el('div', { class: 'cal-day-label' }, [d]));
    wrapper.appendChild(dayHeaders);

    // Grid
    const grid = el('div', { class: 'cal-grid' });
    // Empty cells
    for (let i = 0; i < firstDay; i++) grid.appendChild(el('div', { class: 'cal-cell empty' }));
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = d === now.getDate();
      const data = cal[dateStr];
      const cell = el('div', { class: ['cal-cell', { today: isToday, active: !!data }] });
      cell.appendChild(el('div', { class: 'cal-day-num' }, [String(d)]));
      if (data) {
        cell.appendChild(el('div', { class: 'cal-pct', style: `background: conic-gradient(var(--color-accent) ${data.pct}%, var(--color-border) ${data.pct}%)` }));
      }
      grid.appendChild(cell);
    }
    wrapper.appendChild(grid);
    return wrapper;
  }

  // --- Achievement Definitions ---
  const ACHIEVEMENTS = [
    { id: 'first_clean', name: 'First Clean', icon: '🌟', desc: 'Complete your first task', check: (s) => s.totalCompleted >= 1 },
    { id: 'ten_clean', name: 'Clean Streak', icon: '🔥', desc: 'Complete 10 tasks total', check: (s) => s.totalCompleted >= 10 },
    { id: 'fifty_clean', name: 'Cleaning Pro', icon: '💪', desc: 'Complete 50 tasks total', check: (s) => s.totalCompleted >= 50 },
    { id: 'hundred_clean', name: 'Century Club', icon: '💯', desc: 'Complete 100 tasks total', check: (s) => s.totalCompleted >= 100 },
    { id: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: 'Keep a 3-day streak', check: (s) => s.bestStreak >= 3 },
    { id: 'streak_7', name: 'Week Warrior', icon: '⚡', desc: 'Keep a 7-day streak', check: (s) => s.bestStreak >= 7 },
    { id: 'streak_30', name: 'Monthly Master', icon: '🏆', desc: 'Keep a 30-day streak', check: (s) => s.bestStreak >= 30 },
    { id: 'all_daily', name: 'Daily Done', icon: '✅', desc: 'Complete all daily tasks in one day', check: (s) => s.allDailyCompleted },
    { id: 'all_weekly', name: 'Weekly Warrior', icon: '🎯', desc: 'Complete all weekly tasks', check: (s) => s.allWeeklyCompleted },
    { id: 'all_done', name: 'Perfect Day', icon: '👑', desc: 'Complete every visible task', check: (s) => s.allTasksCompleted },
    { id: 'recipe_user', name: 'DIY Creator', icon: '🧪', desc: 'Add a custom recipe', check: (s) => s.hasCustomRecipe },
    { id: 'task_user', name: 'Task Maker', icon: '📝', desc: 'Add a custom task', check: (s) => s.hasUserTask },
  ];

  // --- Achievement State Tracking ---
  function getAchievementState() {
    const streak = loadStreak();
    const cal = loadCalendar();
    const taskState = loadTasks();
    const allTasks = getAllTasks();
    const todayStr = today();
    const todayData = cal[todayStr] || {};

    // Total completed today
    const completedToday = allTasks.filter(t => taskState[t.id]?.completed).length;
    const dailyTasks = allTasks.filter(t => t.frequency === 'daily');
    const weeklyTasks = allTasks.filter(t => t.frequency === 'weekly');
    const dailyDone = dailyTasks.filter(t => taskState[t.id]?.completed).length;
    const weeklyDone = weeklyTasks.filter(t => taskState[t.id]?.completed).length;

    return {
      totalCompleted: completedToday,
      bestStreak: streak.best,
      allDailyCompleted: dailyTasks.length > 0 && dailyDone === dailyTasks.length,
      allWeeklyCompleted: weeklyTasks.length > 0 && weeklyDone === weeklyTasks.length,
      allTasksCompleted: allTasks.length > 0 && completedToday === allTasks.length,
      hasCustomRecipe: loadCustomRecipes().length > 0,
      hasUserTask: loadUserTasks().length > 0,
    };
  }

  // --- Check & Unlock Achievements ---
  function checkAchievements() {
    const state = getAchievementState();
    const newUnlocks = [];
    for (const ach of ACHIEVEMENTS) {
      if (ach.check(state) && unlockAchievement(ach.id)) {
        newUnlocks.push(ach);
      }
    }
    return newUnlocks;
  }

  // --- Sound Effects ---
  function playCompletionSound() {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.value = 523.25; // C5
      osc2.frequency.value = 783.99; // G5
      osc1.type = 'sine';
      osc2.type = 'sine';
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  function playUncheckSound() {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(392, ctx.currentTime); // G4
      osc.frequency.linearRampToValueAtTime(329.63, ctx.currentTime + 0.15); // E4
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  }

  // --- Confetti Animation ---
  function burstConfetti() {
    const colors = ['#E8D5B7', '#C4A882', '#8B7355', '#F5F2EB', '#D4C5A9'];
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const p = el('div', {
        class: 'confetti-particle',
        style: `left: ${Math.random() * 100}vw; top: ${Math.random() * 50 + 25}vh; background: ${colors[i % colors.length]}; animation-delay: ${Math.random() * 0.3}s;`
      });
      document.body.appendChild(p);
      particles.push(p);
    }
    setTimeout(() => particles.forEach(p => p.remove()), 1200);
  }

  // --- Targeted Progress Bar Update ---
  function updateProgressBars() {
    const taskState = loadTasks();
    const allTasks = getAllTasks();

    // Update frequency filter chip counts
    if (activeFreqFilter === 'all') {
      // Update all progress cards
      const progressCards = $$('.progress-card');
      for (const card of progressCards) {
        const freqLabelEl = card.querySelector('.freq-label');
        if (!freqLabelEl) continue;
        const freqName = freqLabelEl.textContent;
        const freqConfig = frequencies.find(f => f.label === freqName);
        if (!freqConfig) continue;
        const tasksForFreq = allTasks.filter(t => t.frequency === freqConfig.value);
        const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
        const total = tasksForFreq.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const fill = card.querySelector('.progress-bar-fill');
        const text = card.querySelector('.progress-text');
        if (fill) fill.style.width = `${pct}%`;
        if (text) {
          text.textContent = pct === 100 ? '✓ All done!' : `${done} / ${total} done`;
          text.classList.toggle('done', pct === 100);
        }
      }
    } else {
      // Update single progress card
      const tasksForFreq = allTasks.filter(t => t.frequency === activeFreqFilter);
      const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
      const total = tasksForFreq.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const fill = $('.progress-bar-fill');
      const text = $('.progress-text');
      if (fill) fill.style.width = `${pct}%`;
      if (text) {
        text.textContent = pct === 100 ? '✓ All done!' : `${done} / ${total} done`;
        text.classList.toggle('done', pct === 100);
      }
    }

    // Update freq chip counts
    const chips = $$('.freq-chip');
    for (const chip of chips) {
      const text = chip.textContent;
      const match = text.match(/^\w+(?: \w+)?\s*\((\d+)/);
      if (match) {
        // This is a freq chip with count
        const freqName = text.replace(/\s*\(\d+\/\d+\)/, '').trim();
        const freqConfig = frequencies.find(f => f.label === freqName);
        if (freqConfig) {
          const tasksForFreq = allTasks.filter(t => t.frequency === freqConfig.value);
          const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
          const total = tasksForFreq.length;
          chip.textContent = `${freqName} (${done}/${total})`;
        }
      }
    }
  }

  // --- Toggle Task (targeted update, no full render) ---
  function toggleTask(taskId) {
    const taskState = loadTasks();
    const isCompleted = taskState[taskId]?.completed || false;
    const newCompleted = !isCompleted;
    saveTaskState(taskId, { completed: newCompleted });

    // Update streak + calendar
    updateStreak();
    const allTasks = getAllTasks();
    const done = allTasks.filter(t => loadTasks()[t.id]?.completed).length;
    recordCalendarDay(today(), done, allTasks.length);

    // Sound
    if (newCompleted) {
      playCompletionSound();
      const foundTask = getAllTasks().find(t => t.id === taskId);
      showToast(`${foundTask?.icon || '✓'} ${foundTask?.name || ''} ✓`);
      checkAchievements();
    } else {
      playUncheckSound();
    }

    // Update the task item DOM directly
    const taskItem = $(`.task-item[data-task-id="${taskId}"]`);
    if (taskItem) {
      taskItem.classList.toggle('completed', newCompleted);
      taskItem.setAttribute('aria-checked', newCompleted);
      const checkbox = taskItem.querySelector('.task-checkbox');
      if (checkbox) checkbox.classList.toggle('checked', newCompleted);

      // Trigger animation
      justCheckedTaskId = taskId;
      taskItem.classList.add('just-checked');
      requestAnimationFrame(() => {
        if (taskItem) taskItem.classList.remove('just-checked');
      });
    }

    // Update progress bars
    updateProgressBars();

    // Update streak display
    const streak = loadStreak();
    const currentStreakEl = $('.streak-card .streak-stat:first-child .streak-number');
    if (currentStreakEl) currentStreakEl.textContent = String(streak.current);
    const bestStreakEl = $('.streak-card .streak-stat:last-child .streak-number');
    if (bestStreakEl) bestStreakEl.textContent = String(streak.best);

    // Check if current frequency group is fully done → confetti
    if (newCompleted) {
      const freq = activeFreqFilter === 'all' ? null : activeFreqFilter;
      const tasksToCheck = freq ? allTasks.filter(t => t.frequency === freq) : allTasks;
      const allDone = tasksToCheck.every(t => loadTasks()[t.id]?.completed);
      if (allDone && tasksToCheck.length > 0) {
        burstConfetti();
      }
    }
  }

  // --- Render Achievements Section ---
  function renderAchievements() {
    const unlocked = loadAchievements();
    if (unlocked.length === 0) return null;

    const section = el('div', { class: 'achievements-section' });
    section.appendChild(el('h3', { class: 'section-title' }, ['Achievements']));

    const grid = el('div', { class: 'achievement-grid' });
    for (const ach of ACHIEVEMENTS) {
      const isUnlocked = unlocked.includes(ach.id);
      const badge = el('div', {
        class: ['achievement-badge', { unlocked: isUnlocked }],
        title: isUnlocked ? ach.desc : '???'
      });
      badge.appendChild(el('div', { class: 'ach-icon' }, [isUnlocked ? ach.icon : '🔒']));
      badge.appendChild(el('div', { class: 'ach-name' }, [isUnlocked ? ach.name : '???']));
      grid.appendChild(badge);
    }
    section.appendChild(grid);
    return section;
  }

    // Checklist Tab
  function renderChecklist() {
    const container = el('div', { class: 'checklist-tab', id: 'panel-checklist', role: 'tabpanel', 'aria-labelledby': 'tab-checklist' });
    const allTasks = getAllTasks();
    const taskState = loadTasks();

    // Header
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['Keeping it Clean']),
      el('p', { class: 'subtitle' }, ['Cleaning made simple'])
    ]));

    // Global Timer Display (if timer is running)
    if (activeTimer) {
      const timerBar = el('div', { class: 'timer-bar' });
      const timerTaskName = getAllTasks().find(t => t.id === activeTimer.taskId);
      timerBar.appendChild(el('div', { class: 'timer-bar-info' }, [
        el('span', { class: 'timer-bar-task' }, [timerTaskName ? timerTaskName.icon + ' ' + timerTaskName.name : 'Timer running...'])
      ]));
      timerBar.appendChild(el('div', { class: 'timer-bar-time', id: 'timer-display' }, [formatTime(getTimerElapsed())]));
      container.appendChild(timerBar);
    }

    // Frequency filter chips
    const freqContainer = el('div', { class: 'frequency-filters' });
    freqContainer.appendChild(el('button', {
      class: ['freq-chip', { active: activeFreqFilter === 'all' }],
      textContent: 'All',
      onClick: () => { activeFreqFilter = 'all'; render(); }
    }));
    for (const freq of frequencies) {
      const tasksForFreq = allTasks.filter(t => t.frequency === freq.value);
      const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
      const total = tasksForFreq.length;
      freqContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeFreqFilter === freq.value }],
        textContent: `${freq.label} (${done}/${total})`,
        onClick: () => { activeFreqFilter = freq.value; render(); }
      }));
    }
    container.appendChild(freqContainer);

    // Room filter chips
    const roomContainer = el('div', { class: 'frequency-filters' });
    roomContainer.appendChild(el('button', {
      class: ['freq-chip', { active: activeRoomFilter === 'all' }],
      textContent: '🏠 All Rooms',
      onClick: () => { activeRoomFilter = 'all'; render(); }
    }));
    for (const room of rooms) {
      roomContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeRoomFilter === room.value }],
        textContent: room.label,
        onClick: () => { activeRoomFilter = room.value; render(); }
      }));
    }
    container.appendChild(roomContainer);

    // Progress section
    const progressSection = el('div', { class: 'progress-section' });
    if (activeFreqFilter === 'all') {
      for (const freq of frequencies) {
        const tasksForFreq = allTasks.filter(t => t.frequency === freq.value);
        const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
        const total = tasksForFreq.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        progressSection.appendChild(el('div', { class: 'progress-card' }, [
          el('div', { class: 'freq-label' }, [freq.label]),
          el('div', { class: 'progress-bar-track' }, [el('div', { class: 'progress-bar-fill', style: `width: ${pct}%` })]),
          el('div', { class: ['progress-text', { done: pct === 100 }] }, [pct === 100 ? '✓ All done!' : `${done} / ${total} done`])
        ]));
      }
    } else {
      const tasksForFreq = allTasks.filter(t => t.frequency === activeFreqFilter);
      const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
      const total = tasksForFreq.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const freqLabel = frequencies.find(f => f.value === activeFreqFilter)?.label || '';
      progressSection.appendChild(el('div', { class: 'progress-card' }, [
        el('div', { class: 'freq-label' }, [freqLabel]),
        el('div', { class: 'progress-bar-track' }, [el('div', { class: 'progress-bar-fill', style: `width: ${pct}%` })]),
        el('div', { class: ['progress-text', { done: pct === 100 }] }, [pct === 100 ? '✓ All done!' : `${done} / ${total} done`])
      ]));
    }
    container.appendChild(progressSection);

    // Streak + Calendar
    const streak = loadStreak();
    const streakCard = el('div', { class: 'streak-card' });
    streakCard.appendChild(el('div', { class: 'streak-stats' }, [
      el('div', { class: 'streak-stat' }, [
        el('div', { class: 'streak-number' }, [String(streak.current)]),
        el('div', { class: 'streak-label' }, ['Current 🔥'])
      ]),
      el('div', { class: 'streak-stat' }, [
        el('div', { class: 'streak-number' }, [String(streak.best)]),
        el('div', { class: 'streak-label' }, ['Best ⭐'])
      ])
    ]));
    container.appendChild(streakCard);

    // Mini Calendar
    container.appendChild(renderMiniCalendar());

    // Achievements
    const achievements = renderAchievements();
    if (achievements) container.appendChild(achievements);

    // Task groups (filter by frequency + room)
    let filteredTasks = allTasks;
    if (activeFreqFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.frequency === activeFreqFilter);
    if (activeRoomFilter !== 'all') filteredTasks = filteredTasks.filter(t => t.room === activeRoomFilter);
    const groups = {};
    for (const task of filteredTasks) {
      if (!groups[task.frequency]) groups[task.frequency] = [];
      groups[task.frequency].push(task);
    }

    const freqOrder = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual'];
    const freqLabels = { 'daily': 'Daily Tasks', 'weekly': 'Weekly Tasks', 'bi-weekly': 'Bi-Weekly Tasks', 'monthly': 'Monthly Tasks', 'quarterly': 'Quarterly Tasks', 'annual': 'Annual Tasks' };

    for (const freq of freqOrder) {
      if (!groups[freq]) continue;
      const group = el('div', { class: 'task-group' });
      group.appendChild(el('h3', { class: 'task-group-title' }, [freqLabels[freq] || freq]));

      for (const task of groups[freq]) {
        const isCompleted = taskState[task.id]?.completed || false;
        const isUserTask = task.isUserTask || false;
        const recipe = findRecipeForTask(task);

        const item = el('div', {
          class: ['task-item', { completed: isCompleted }],
          role: 'checkbox',
          'aria-checked': isCompleted,
          'aria-label': task.name + (isCompleted ? ' (completed)' : ' (not completed)'),
          'data-task-id': task.id,
          tabindex: '0',
        onClick: () => {
            toggleTask(task.id);
        },
        onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTask(task.id); }
        }
        });

        // Checkbox
        item.appendChild(el('div', { class: 'task-checkbox' }, [checkmarkSvg()]));
        // Icon
        item.appendChild(el('div', { class: 'task-icon' }, [task.icon]));
        // Info
        const info = el('div', { class: 'task-info' });
        info.appendChild(el('div', { class: 'task-name' }, [task.name]));
        if (task.note) info.appendChild(el('div', { class: 'task-note' }, [task.note]));
        // Estimated time
        if (task.estimatedTime) {
          info.appendChild(el('div', { class: 'task-eta' }, ['⏱ ' + task.estimatedTime + ' min']));
        }
        item.appendChild(info);
        // Freq badge
        item.appendChild(el('span', { class: ['freq-badge', task.frequency] }, [task.frequency]));
        // Timer button
        const isTimerActive = activeTimer && activeTimer.taskId === task.id;
        item.appendChild(el('button', {
          class: ['task-timer-btn', { active: isTimerActive }],
          title: isTimerActive ? 'Stop timer' : 'Start timer',
          onClick: (e) => { e.stopPropagation(); toggleTimer(task.id); }
        }, [isTimerActive ? pauseIcon() : playIcon()]));

        // Recipe recommendation link
        if (recipe) {
          const recBtn = el('button', {
            class: 'task-recipe-link',
            title: `Recommended: ${recipe.name}`,
            onClick: (e) => {
              e.stopPropagation();
              activeTab = 'recipes';
              expandedRecipeId = recipe.id;
              activeRecipeFilter = 'all';
              render();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, [recipeLinkIcon(), document.createTextNode(` ${recipe.emoji} ${recipe.name}`)]);
          item.appendChild(recBtn);
        }

        // User task: edit + delete buttons
        if (isUserTask) {
          const actions = el('div', { class: 'task-actions' });
          actions.appendChild(el('button', {
            class: 'task-action-btn edit-btn',
            title: 'Edit task',
            onClick: (e) => { e.stopPropagation(); editingTaskId = task.id; showTaskModal = true; render(); }
          }, [editIcon()]));
          actions.appendChild(el('button', {
            class: 'task-action-btn delete-btn',
            title: 'Delete task',
            onClick: async (e) => {
              e.stopPropagation();
              if (await showConfirm(`Delete "${task.name}"?`)) {
                deleteUserTask(task.id);
                showToast('Task deleted');
                render();
              }
            }
          }, [trashIcon()]));
          item.appendChild(actions);

          // Reorder buttons
          const userTasks = loadUserTasks();
          const taskIdx = userTasks.findIndex(t => t.id === task.id);
          const reorderDiv = el('div', { class: 'task-reorder' });
          reorderDiv.appendChild(el('button', {
            class: 'reorder-btn',
            title: 'Move up',
            disabled: taskIdx === 0,
            onClick: (e) => { e.stopPropagation(); reorderUserTask(task.id, 'up'); }
          }, [upArrowIcon()]));
          reorderDiv.appendChild(el('button', {
            class: 'reorder-btn',
            title: 'Move down',
            disabled: taskIdx === userTasks.length - 1,
            onClick: (e) => { e.stopPropagation(); reorderUserTask(task.id, 'down'); }
          }, [downArrowIcon()]));
          item.appendChild(reorderDiv);
        }

        group.appendChild(item);
      }

      // Add task button per group
      group.appendChild(el('button', {
        class: 'add-task-btn',
        onClick: () => {
          editingTaskId = null;
          newTaskFreq = freq;
          showTaskModal = true;
          render();
        }
      }, [plusIcon(), document.createTextNode(` Add ${freqLabels[freq]?.replace(' Tasks','') || 'task'}`)]));

      container.appendChild(group);
    }

    // Reset button
    container.appendChild(el('div', { class: 'reset-section' }, [
      el('button', {
        class: 'btn-reset',
        onClick: async () => {
          if (await showConfirm('Reset all daily tasks?')) {
            const dailyIds = allTasks.filter(task => task.frequency === 'daily').map(task => task.id);
            resetTodayTasks(dailyIds);
            showToast('Daily tasks reset');
            render();
          }
        }
      }, [resetIcon(), document.createTextNode(' Reset Daily Tasks')])
    ]));

    // Task modal
    if (showTaskModal) {
      container.appendChild(renderTaskModal());
    }

    return container;
  }

  // --- Task Modal (Add/Edit) ---
  function renderTaskModal() {
    const overlay = el('div', {
      class: 'modal-overlay',
      onClick: (e) => { if (e.target === overlay) { showTaskModal = false; render(); } }
    });
    const sheet = el('div', { class: 'modal-sheet' });
    sheet.appendChild(el('div', { class: 'modal-handle' }));

    const editingTask = editingTaskId ? loadUserTasks().find(t => t.id === editingTaskId) : null;
    sheet.appendChild(el('h2', { class: 'modal-title' }, [editingTask ? 'Edit Task' : 'Add New Task']));

    const fields = [
      { key: 'tmName', label: 'Task Name', type: 'text', required: true, default: editingTask?.name || '' },
      { key: 'tmIcon', label: 'Emoji Icon', type: 'text', required: true, default: editingTask?.icon || '🧹' },
      { key: 'tmNote', label: 'Note (optional)', type: 'textarea', default: editingTask?.note || '' },
    ];

    // Frequency select
    const freqGroup = el('div', { class: 'form-group' });
    freqGroup.appendChild(el('label', { class: 'form-label' }, ['Frequency']));
    const freqSelect = el('select', { class: 'form-input', id: 'tmFreq' });
    for (const freq of frequencies) {
      const opt = el('option', { value: freq.value }, [freq.label]);
      if ((editingTask?.frequency || newTaskFreq || 'daily') === freq.value) opt.selected = true;
      freqSelect.appendChild(opt);
    }
    freqGroup.appendChild(freqSelect);
    sheet.appendChild(freqGroup);

    // Room select
    const roomGroup = el('div', { class: 'form-group' });
    roomGroup.appendChild(el('label', { class: 'form-label' }, ['Room']));
    const roomSelect = el('select', { class: 'form-input', id: 'tmRoom' });
    for (const room of rooms) {
      const opt = el('option', { value: room.value }, [room.label]);
      if ((editingTask?.room || 'general') === room.value) opt.selected = true;
      roomSelect.appendChild(opt);
    }
    roomGroup.appendChild(roomSelect);
    sheet.appendChild(roomGroup);

    for (const field of fields) {
      const group = el('div', { class: 'form-group' });
      group.appendChild(el('label', { class: 'form-label' }, [field.label]));
      if (field.type === 'textarea') {
        group.appendChild(el('textarea', { class: 'form-textarea', id: field.key, placeholder: field.placeholder || '', textContent: field.default || '' }));
      } else {
        const input = el('input', { class: 'form-input', type: field.type || 'text', id: field.key, placeholder: field.placeholder || '', required: field.required || false });
        input.value = field.default || '';
        group.appendChild(input);
      }
      sheet.appendChild(group);
    }

    // Error message
    sheet.appendChild(el('div', { class: 'form-error', id: 'tmError', style: 'display:none' }, ['']));

    // Submit
    sheet.appendChild(el('button', {
      class: 'btn-primary',
      onClick: () => {
        const name = ($('#tmName')?.value || '').trim();
        const icon = ($('#tmIcon')?.value || '').trim();
        if (!name || !icon) { const err = $('#tmError'); if (err) err.textContent = 'Please fill in name and icon.'; return; }
        const task = {
          id: editingTask ? editingTask.id : 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
          name, icon,
          note: ($('#tmNote')?.value || '').trim(),
          frequency: ($('#tmFreq')?.value || 'daily'),
          room: ($('#tmRoom')?.value || 'general'),
          isUserTask: true
        };
        saveUserTask(task);
        showTaskModal = false;
        editingTaskId = null;
        showToast(`${icon} ${editingTask ? 'Updated' : 'Added'}: ${name}`);
        render();
      }
    }, [editingTask ? 'Update Task' : 'Add Task']));

    // Cancel
    sheet.appendChild(el('button', {
      class: 'btn-secondary',
      onClick: () => { showTaskModal = false; editingTaskId = null; render(); }
    }, ['Cancel']));

    overlay.appendChild(sheet);
    return overlay;
  }

  // --- Recipes Tab ---
  function renderRecipes() {
    const container = el('div', { class: 'recipes-tab', id: 'panel-recipes', role: 'tabpanel', 'aria-labelledby': 'tab-recipes' });
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['DIY Recipes']),
      el('p', { class: 'subtitle' }, ['Eco-Friendly DIY Cleaners'])
    ]));

    // Search
    const searchInput = el('input', {
      class: 'form-input', type: 'search', placeholder: 'Search recipes...',
      style: 'margin-bottom: var(--space-md);'
    });
    searchInput.id = 'recipe-search';
    if (recipeSearchTerm) searchInput.value = recipeSearchTerm;
    searchInput.addEventListener('input', (e) => { recipeSearchTerm = e.target.value; expandedRecipeId = null; render(); });
    container.appendChild(searchInput);

    // Filter chips
    const filterContainer = el('div', { class: 'frequency-filters' });
    for (const tag of recipeFilterTags) {
      filterContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeRecipeFilter === tag.value }],
        textContent: tag.label,
        onClick: () => { activeRecipeFilter = tag.value; expandedRecipeId = null; recipeSearchTerm = ''; render(); }
      }));
    }
    container.appendChild(filterContainer);

    // All recipes
    const allRecipes = [...cleaningRecipes];
    const customRecipes = loadCustomRecipes();
    for (const cr of customRecipes) allRecipes.push({ ...cr, isCustom: true });
    const favorites = loadFavorites();

    let filtered = allRecipes;
    if (activeRecipeFilter !== 'all') filtered = filtered.filter(r => r.tags && r.tags.includes(activeRecipeFilter));
    if (recipeSearchTerm) {
      const q = recipeSearchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || (r.tags && r.tags.some(t => t.includes(q))));
    }

    if (filtered.length === 0) {
      container.appendChild(el('div', { class: 'empty-state' }, [
        el('div', { class: 'empty-state-icon' }, ['🔍']),
        el('div', { class: 'empty-state-text' }, ['No recipes found. Try a different filter or search term.'])
      ]));
    } else {
      for (const recipe of filtered) {
        const isExpanded = expandedRecipeId === recipe.id;
        const isFav = favorites.includes(recipe.id);
        const card = el('div', { class: 'recipe-card' });
        const header = el('div', { class: 'recipe-header', onClick: () => { expandedRecipeId = isExpanded ? null : recipe.id; render(); } });
        header.appendChild(el('div', { class: 'recipe-emoji' }, [recipe.emoji || '🧴']));
        const titleArea = el('div', { class: 'recipe-title-area' });
        titleArea.appendChild(el('div', { class: 'recipe-name' }, [recipe.name]));
        header.appendChild(titleArea);
        header.appendChild(el('button', { class: ['recipe-fav-btn', { active: isFav }], onClick: (e) => { e.stopPropagation(); toggleFavorite(recipe.id); render(); } }, [heartIcon(isFav)]));
        if (recipe.isCustom) {
          header.appendChild(el('button', { class: 'recipe-fav-btn', style: 'color: var(--color-danger);', onClick: async (e) => { e.stopPropagation(); if (await showConfirm('Delete this recipe?')) { deleteCustomRecipe(recipe.id); showToast('Recipe deleted'); render(); } } }, [closeIcon()]));
        }
        header.appendChild(chevronIcon(isExpanded));
        card.appendChild(header);

        if (isExpanded) {
          const detail = el('div', { class: 'recipe-detail' });
          if (recipe.tags && recipe.tags.length) {
            const tagsDiv = el('div', { class: 'recipe-tags' });
            for (const tag of recipe.tags) tagsDiv.appendChild(el('span', { class: ['recipe-tag', { 'pet-safe': tag === 'cat-safe' }] }, [tag]));
            detail.appendChild(tagsDiv);
          }
          if (recipe.ingredients && recipe.ingredients.length) {
            detail.appendChild(el('h4', { class: 'recipe-section-title' }, ['Ingredients']));
            const ul = el('ul', { class: 'recipe-ingredients' });
            for (const ing of recipe.ingredients) ul.appendChild(el('li', {}, [ing]));
            detail.appendChild(ul);
          }
          if (recipe.steps && recipe.steps.length) {
            detail.appendChild(el('h4', { class: 'recipe-section-title' }, ['Steps']));
            const ol = el('ol', { class: 'recipe-steps' });
            for (const step of recipe.steps) ol.appendChild(el('li', {}, [step]));
            detail.appendChild(ol);
          }
          if (recipe.note) detail.appendChild(el('div', { class: 'recipe-note-box' }, [recipe.note]));
          card.appendChild(detail);
        }
        container.appendChild(card);
      }
    }

    // FAB
    container.appendChild(el('button', { class: 'fab', onClick: () => { showCustomRecipeModal = true; render(); } }, [plusIcon()]));

    // Custom recipe modal
    if (showCustomRecipeModal) {
      const overlay = el('div', { class: 'modal-overlay', onClick: (e) => { if (e.target === overlay) { showCustomRecipeModal = false; render(); } } });
      const sheet = el('div', { class: 'modal-sheet' });
      sheet.appendChild(el('div', { class: 'modal-handle' }));
      sheet.appendChild(el('h2', { class: 'modal-title' }, ['Add Custom Recipe']));
      const fields = [
        { key: 'crName', label: 'Recipe Name', type: 'text', required: true },
        { key: 'crEmoji', label: 'Emoji Icon', type: 'text', placeholder: '🧴' },
        { key: 'crIngredients', label: 'Ingredients (one per line)', type: 'textarea', required: true },
        { key: 'crSteps', label: 'Steps (one per line)', type: 'textarea', required: true },
        { key: 'crNote', label: 'Notes', type: 'textarea' },
        { key: 'crTags', label: 'Tags (comma separated)', type: 'text', placeholder: 'kitchen, cat-safe' }
      ];
      for (const field of fields) {
        const group = el('div', { class: 'form-group' });
        group.appendChild(el('label', { class: 'form-label' }, [field.label]));
        if (field.type === 'textarea') group.appendChild(el('textarea', { class: 'form-textarea', id: field.key, placeholder: field.placeholder || '' }));
        else group.appendChild(el('input', { class: 'form-input', type: field.type || 'text', id: field.key, placeholder: field.placeholder || '', required: field.required || false }));
        sheet.appendChild(group);
      }
      sheet.appendChild(el('div', { class: 'form-error', id: 'crError', style: 'display:none' }, ['']));

      sheet.appendChild(el('button', { class: 'btn-primary', onClick: () => {
        const name = ($('#crName')?.value || '').trim();
        const ingredients = ($('#crIngredients')?.value || '').trim();
        const steps = ($('#crSteps')?.value || '').trim();
        if (!name || !ingredients || !steps) { const err = $('#crError'); if (err) err.textContent = 'Please fill in name, ingredients, and steps.'; return; }
        const recipe = { id: 'custom_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), name, emoji: ($('#crEmoji')?.value || '').trim() || '🧴', ingredients: ingredients.split('\n').map(s => s.trim()).filter(Boolean), steps: steps.split('\n').map(s => s.trim()).filter(Boolean), note: ($('#crNote')?.value || '').trim() || '', tags: ($('#crTags')?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), isPetSafe: true };
        saveCustomRecipe(recipe); showCustomRecipeModal = false; showToast(`${recipe.emoji} Recipe added!`); render();
      } }, ['Save Recipe']));
      sheet.appendChild(el('button', { class: 'btn-secondary', onClick: () => { showCustomRecipeModal = false; render(); } }, ['Cancel']));
      overlay.appendChild(sheet);
      container.appendChild(overlay);
    }

    return container;
  }

  // --- Dark Mode ---
  function setDarkMode(pref) {
    saveDarkMode(pref);
    const isDark = pref === 'dark' || (pref === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', pref === 'auto' ? (isDark ? 'dark' : 'light') : pref);
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.content = isDark ? '#1a1a2e' : '#F5F2EB';
  }

  // --- Settings Tab ---
  function renderSettings() {
    const container = el('div', { class: 'settings-container', id: 'panel-settings', role: 'tabpanel', 'aria-labelledby': 'tab-settings' });

    // Dark Mode Card
    const darkModeCard = el('div', { class: 'settings-card' });
    darkModeCard.appendChild(el('h3', { class: 'settings-card-title' }, ['Dark Mode']));
    const darkModePrefs = ['light', 'dark', 'auto'];
    const darkModeLabels = { light: 'Light', dark: 'Dark', auto: 'Follow System' };
    const currentDarkMode = loadDarkMode();
    for (const pref of darkModePrefs) {
      const radio = el('input', { type: 'radio', name: 'dark-mode', value: pref, checked: currentDarkMode === pref });
      const label = el('label', { class: 'settings-radio-label' }, [radio, el('span', {}, [darkModeLabels[pref]])]);
      radio.addEventListener('change', () => {
        setDarkMode(pref);
        render();
      });
      darkModeCard.appendChild(label);
    }

    // Sound Card
    const soundCard = el('div', { class: 'settings-card' });
    soundCard.appendChild(el('h3', { class: 'settings-card-title' }, ['Sound Effects']));
    const soundToggle = el('label', { class: 'settings-toggle-label' });
    const soundCheckbox = el('input', { type: 'checkbox', checked: soundEnabled });
    soundCheckbox.addEventListener('change', () => {
      soundEnabled = soundCheckbox.checked;
      saveSoundEnabled(soundEnabled);
    });
    soundToggle.appendChild(soundCheckbox);
    soundToggle.appendChild(el('span', { class: 'toggle-switch' }, [el('span', { class: 'toggle-knob' })]));
    soundToggle.appendChild(el('span', { class: 'settings-toggle-text' }, ['Enable completion sounds']));
    soundCard.appendChild(soundToggle);

    // Data Sync Card
    const dataCard = el('div', { class: 'settings-card' });
    dataCard.appendChild(el('h3', { class: 'settings-card-title' }, ['Data & Sync']));
    const lastExport = loadLastExport();
    let exportText = 'Never exported';
    let exportClass = 'export-status overdue';
    if (lastExport) {
      const daysAgo = Math.floor((Date.now() - Number(lastExport)) / 86400000);
      if (daysAgo === 0) exportText = 'Exported today';
      else if (daysAgo === 1) exportText = 'Exported yesterday';
      else if (daysAgo < 7) exportText = `Exported ${daysAgo} days ago`;
      else { exportText = `⚠️ ${daysAgo} days since last export`; exportClass = 'export-status overdue'; }
    }
    dataCard.appendChild(el('div', { class: exportClass }, [exportText]));

    // Export button
    const exportBtn = el('button', { class: 'settings-btn', onClick: () => {
      const data = exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `keeping-it-clean-${today()}.json`;
      a.click(); URL.revokeObjectURL(url);
      showToast('📦 Data exported');
    }}, ['Export Data']);
    dataCard.appendChild(exportBtn);

    // Import button
    const importBtn = el('button', { class: 'settings-btn', onClick: () => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (importAllData(data)) { showToast('📥 Data imported'); render(); }
            else { showToast('❌ Invalid file'); }
          } catch(err) { showToast('❌ Failed to parse file'); }
        };
        reader.readAsText(file);
      });
      input.click();
    }}, ['Import Data']);
    dataCard.appendChild(importBtn);

    // Reset button
    const resetBtn = el('button', { class: 'settings-btn settings-btn-danger', onClick: async () => {
      if (await showConfirm('Reset all data? This cannot be undone.')) {
        localStorage.clear();
        location.reload();
      }
    }}, ['Reset All Data']);
    dataCard.appendChild(resetBtn);

    container.appendChild(darkModeCard);
    container.appendChild(soundCard);
    container.appendChild(dataCard);
    return container;
  }

  // --- Tab Bar ---
  function renderTabBar() {
    return el('nav', { class: 'tab-bar', role: 'tablist', 'aria-label': 'Main navigation' }, [
      el('button', { class: ['tab-item', { active: activeTab === 'checklist' }], role: 'tab', 'aria-selected': activeTab === 'checklist', 'aria-controls': 'panel-checklist', id: 'tab-checklist', onClick: () => { scrollPositions[activeTab] = window.scrollY; activeTab = 'checklist'; render(); requestAnimationFrame(() => window.scrollTo(0, scrollPositions.checklist)); } }, [checklistTabIcon(activeTab === 'checklist'), el('span', {}, ['Tasks'])]),
      el('button', { class: ['tab-item', { active: activeTab === 'recipes' }], role: 'tab', 'aria-selected': activeTab === 'recipes', 'aria-controls': 'panel-recipes', id: 'tab-recipes', onClick: () => { scrollPositions[activeTab] = window.scrollY; activeTab = 'recipes'; render(); requestAnimationFrame(() => window.scrollTo(0, scrollPositions.recipes)); } }, [recipeTabIcon(activeTab === 'recipes'), el('span', {}, ['Recipes'])]),
      el('button', { class: ['tab-item', { active: activeTab === 'settings' }], role: 'tab', 'aria-selected': activeTab === 'settings', 'aria-controls': 'panel-settings', id: 'tab-settings', onClick: () => { scrollPositions[activeTab] = window.scrollY; activeTab = 'settings'; render(); requestAnimationFrame(() => window.scrollTo(0, scrollPositions.settings)); } }, [settingsIcon(activeTab === 'settings'), el('span', {}, ['Settings'])])
    ]);
  }

  // --- Toast ---
  function renderToast() {
    if (!toastVisible) return null;
    return el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }, [toastMessage]);
  }

  // --- Main Render ---
  function render() {
    const app = document.getElementById('app');
    if (!app) return;
    requestAnimationFrame(() => {
      const frag = document.createDocumentFragment();
      if (activeTab === 'checklist') frag.appendChild(renderChecklist());
      else if (activeTab === 'recipes') frag.appendChild(renderRecipes());
      else frag.appendChild(renderSettings());
      frag.appendChild(renderTabBar());
      const toast = renderToast();
      if (toast) frag.appendChild(toast);
      while (app.firstChild) app.removeChild(app.firstChild);
      app.appendChild(frag);
    });
  }

  // --- Init ---
  function init() {
    checkDailyReset();
    // Restore active timer from storage (clear if stale >24h)
    const savedTimer = loadActiveTimer();
    if (savedTimer) {
      const elapsed = (Date.now() - savedTimer.startTime) / 1000;
      if (elapsed > 86400) {
        saveActiveTimer(null); // stale — discard
      } else {
        activeTimer = savedTimer;
        startTimer(savedTimer.taskId);
      }
    }
    // Alert on localStorage quota exceeded
    window.addEventListener('storage-quota-exceeded', () => {
      showToast('⚠️ Storage full — please export and clear old data');
    });

    // Pause timer interval when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseTimerInterval();
      else resumeTimerInterval();
    });

    // Apply saved dark mode preference
    setDarkMode(loadDarkMode());

    // Update theme-color meta on dark mode change
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const updateThemeColor = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (themeColorMeta) themeColorMeta.content = isDark ? '#141821' : '#F7F4EE';
    };
    updateThemeColor();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      setDarkMode(loadDarkMode());
      updateThemeColor();
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }


    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

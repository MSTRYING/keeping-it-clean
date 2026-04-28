// ============================================
// Keeping it Clean · 片付け Katazuke
// Vanilla JS App - No Framework Dependencies
// ============================================

(function () {
  'use strict';

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

  function startTimer(taskId) {
    const saved = loadActiveTimer();
    if (saved && saved.taskId === taskId) {
      // Resume
      activeTimer = { taskId: saved.taskId, startTime: saved.startTime, elapsed: saved.elapsed + (Date.now() - saved.lastTick), lastTick: Date.now() };
    } else {
      // New
      activeTimer = { taskId, startTime: Date.now(), elapsed: 0, lastTick: Date.now() };
    }
    saveActiveTimer(activeTimer);
    if (!timerInterval) {
      timerInterval = setInterval(() => {
        if (activeTimer) {
          activeTimer.lastTick = Date.now();
          saveActiveTimer(activeTimer);
          const timerDisplay = $('#timer-display');
          if (timerDisplay) {
            timerDisplay.textContent = formatTime(getTimerElapsed());
          }
        }
      }, 1000);
    }
  }

  function stopTimer() {
    if (activeTimer) {
      activeTimer.elapsed += Date.now() - activeTimer.lastTick;
      activeTimer.lastTick = Date.now();
      saveActiveTimer(activeTimer);
    }
    activeTimer = null;
    clearActiveTimer();
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
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
  function showToast(msg) {
    toastMessage = msg; toastVisible = true; render();
    setTimeout(() => { toastVisible = false; render(); }, 2500);
  }

  // --- Daily Reset Check ---
  function checkDailyReset() {
    const lastVisit = loadLastVisit();
    const t = today();
    if (lastVisit && lastVisit !== t) {
      const allTasks = getAllTasks();
      const dailyIds = allTasks.filter(task => task.frequency === 'daily').map(task => task.id);
      resetTodayTasks(dailyIds);
    }
    saveLastVisit(t);
  }

  // --- Merge built-in + user tasks ---
  function getAllTasks() {
    const userTasks = loadUserTasks();
    return [...cleaningTasks, ...userTasks];
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

   // --- Checklist Tab ---
  function renderChecklist() {
    const container = el('div', { class: 'checklist-tab' });
    const allTasks = getAllTasks();
    const taskState = loadTasks();

    // Header
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['Keeping it Clean']),
      el('p', { class: 'subtitle' }, ['片付け · Katazuke'])
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
        onClick: () => {
            const newCompleted = !isCompleted;
            saveTaskState(task.id, { completed: newCompleted });
            if (newCompleted) {
                // Update streak + calendar
                updateStreak();
                const allT = getAllTasks();
                const done = allT.filter(t => loadTasks()[t.id]?.completed).length;
                recordCalendarDay(today(), done, allT.length);
                showToast(`${task.icon} ${task.name} ✓`);
                // Check achievements
                checkAchievements();
            }
            render();
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
            onClick: (e) => {
              e.stopPropagation();
              if (confirm(`Delete "${task.name}"?`)) {
                deleteUserTask(task.id);
                showToast('Task deleted');
                render();
              }
            }
          }, [trashIcon()]));
          item.appendChild(actions);
        }

        group.appendChild(item);
      }

      // Add task button per group
      group.appendChild(el('button', {
        class: 'add-task-btn',
        onClick: () => {
          editingTaskId = null;
          window._newTaskFreq = freq;
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
        onClick: () => {
          if (confirm('Reset all daily tasks?')) {
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
      if ((editingTask?.frequency || window._newTaskFreq || 'daily') === freq.value) opt.selected = true;
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

    // Submit
    sheet.appendChild(el('button', {
      class: 'btn-primary',
      onClick: () => {
        const name = ($('#tmName')?.value || '').trim();
        const icon = ($('#tmIcon')?.value || '').trim();
        if (!name || !icon) { alert('Please fill in name and icon.'); return; }
        const task = {
          id: editingTask ? editingTask.id : 'user_' + Date.now(),
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
    const container = el('div', { class: 'recipes-tab' });
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['DIY Recipes']),
      el('p', { class: 'subtitle' }, ['エコレシピ · Eco-Friendly'])
    ]));

    // Search
    const searchInput = el('input', {
      class: 'form-input', type: 'search', placeholder: 'Search recipes...',
      style: 'margin-bottom: var(--space-md);'
    });
    searchInput.id = 'recipe-search';
    if (window._recipeSearchTerm) searchInput.value = window._recipeSearchTerm;
    searchInput.addEventListener('input', (e) => { window._recipeSearchTerm = e.target.value; expandedRecipeId = null; render(); });
    container.appendChild(searchInput);

    // Filter chips
    const filterContainer = el('div', { class: 'frequency-filters' });
    for (const tag of recipeFilterTags) {
      filterContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeRecipeFilter === tag.value }],
        textContent: tag.label,
        onClick: () => { activeRecipeFilter = tag.value; expandedRecipeId = null; window._recipeSearchTerm = ''; render(); }
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
    if (window._recipeSearchTerm) {
      const q = window._recipeSearchTerm.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || (r.tags && r.tags.some(t => t.includes(q))) || (r.jpName && r.jpName.includes(q)));
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
        if (recipe.jpName) titleArea.appendChild(el('div', { class: 'recipe-jp-name' }, [recipe.jpName]));
        header.appendChild(titleArea);
        header.appendChild(el('button', { class: ['recipe-fav-btn', { active: isFav }], onClick: (e) => { e.stopPropagation(); toggleFavorite(recipe.id); render(); } }, [heartIcon(isFav)]));
        if (recipe.isCustom) {
          header.appendChild(el('button', { class: 'recipe-fav-btn', style: 'color: var(--color-danger);', onClick: (e) => { e.stopPropagation(); if (confirm('Delete this recipe?')) { deleteCustomRecipe(recipe.id); showToast('Recipe deleted'); render(); } } }, [closeIcon()]));
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
        { key: 'crJpName', label: 'Japanese Name (optional)', type: 'text' },
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
      sheet.appendChild(el('button', { class: 'btn-primary', onClick: () => {
        const name = ($('#crName')?.value || '').trim();
        const ingredients = ($('#crIngredients')?.value || '').trim();
        const steps = ($('#crSteps')?.value || '').trim();
        if (!name || !ingredients || !steps) { alert('Please fill in name, ingredients, and steps.'); return; }
        const recipe = { id: 'custom_' + Date.now(), name, jpName: ($('#crJpName')?.value || '').trim() || '', emoji: ($('#crEmoji')?.value || '').trim() || '🧴', ingredients: ingredients.split('\n').map(s => s.trim()).filter(Boolean), steps: steps.split('\n').map(s => s.trim()).filter(Boolean), note: ($('#crNote')?.value || '').trim() || '', tags: ($('#crTags')?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), isPetSafe: true };
        saveCustomRecipe(recipe); showCustomRecipeModal = false; showToast(`${recipe.emoji} Recipe added!`); render();
      } }, ['Save Recipe']));
      sheet.appendChild(el('button', { class: 'btn-secondary', onClick: () => { showCustomRecipeModal = false; render(); } }, ['Cancel']));
      overlay.appendChild(sheet);
      container.appendChild(overlay);
    }

    return container;
  }

  // --- Tab Bar ---
  function renderTabBar() {
    return el('nav', { class: 'tab-bar' }, [
      el('button', { class: ['tab-item', { active: activeTab === 'checklist' }], onClick: () => { activeTab = 'checklist'; window.scrollTo({ top: 0, behavior: 'smooth' }); render(); } }, [checklistTabIcon(activeTab === 'checklist'), el('span', {}, ['Tasks'])]),
      el('button', { class: ['tab-item', { active: activeTab === 'recipes' }], onClick: () => { activeTab = 'recipes'; window.scrollTo({ top: 0, behavior: 'smooth' }); render(); } }, [recipeTabIcon(activeTab === 'recipes'), el('span', {}, ['Recipes'])])
    ]);
  }

  // --- Toast ---
  function renderToast() {
    if (!toastVisible) return null;
    return el('div', { class: 'toast' }, [toastMessage]);
  }

  // --- Main Render ---
  function render() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';
    if (activeTab === 'checklist') app.appendChild(renderChecklist());
    else app.appendChild(renderRecipes());
    app.appendChild(renderTabBar());
    const toast = renderToast();
    if (toast) app.appendChild(toast);
  }

  // --- Init ---
  function init() {
    checkDailyReset();
    // Restore active timer from storage
    const savedTimer = loadActiveTimer();
    if (savedTimer) {
      activeTimer = savedTimer;
      startTimer(savedTimer.taskId);
    }
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

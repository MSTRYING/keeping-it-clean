// localStorage Wrapper - All keys prefixed with 'kic_' (Keeping it Clean)
const PREFIX = 'kic_';

function _get(key) {
  try { return localStorage.getItem(PREFIX + key); } catch(e) { return null; }
}
function _set(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch(e) {
    if (e.name === 'QuotaExceededError') {
      window.dispatchEvent(new CustomEvent('storage-quota-exceeded'));
    }
  }
}
function _remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch(e) {}
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// --- Task State ---
function loadTasks() {
  const raw = _get('tasks');
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch(e) { return {}; }
}

function saveTaskState(taskId, state) {
  const tasks = loadTasks();
  tasks[taskId] = { completed: state.completed, lastDone: today() };
  _set('tasks', tasks);
}

function resetTodayTasks(dailyTaskIds) {
  const tasks = loadTasks();
  if (dailyTaskIds) {
    for (const id of dailyTaskIds) {
      if (tasks[id]) tasks[id].completed = false;
    }
  } else {
    for (const id in tasks) {
      tasks[id].completed = false;
    }
  }
  _set('tasks', tasks);
}

// --- User Tasks (Add/Edit/Delete) ---
function loadUserTasks() {
  const raw = _get('user-tasks');
  if (!raw) return [];
  try {
    const tasks = JSON.parse(raw);
    const order = loadUserTaskOrder();
    if (order && Array.isArray(tasks)) {
      tasks.sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }
    return tasks;
  } catch(e) { return []; }
}

function saveUserTask(task) {
  const tasks = loadUserTasks();
  const idx = tasks.findIndex(t => t.id === task.id);
  if (idx > -1) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  _set('user-tasks', tasks);
  _set('user-task-order', tasks.map(t => t.id));
}

function deleteUserTask(id) {
  let tasks = loadUserTasks();
  tasks = tasks.filter(t => t.id !== id);
  _set('user-tasks', tasks);
  _set('user-task-order', tasks.map(t => t.id));
}

function updateUserTask(id, updates) {
  const tasks = loadUserTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx > -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    _set('user-tasks', tasks);
  }
}

// --- User Task Order ---
function loadUserTaskOrder() {
  const raw = _get('user-task-order');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function saveUserTaskOrder(order) {
  _set('user-task-order', order);
}

// --- Custom Recipes ---
function loadCustomRecipes() {
  const raw = _get('custom-recipes');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}

function saveCustomRecipe(recipe) {
  const recipes = loadCustomRecipes();
  recipes.push(recipe);
  _set('custom-recipes', recipes);
}

function deleteCustomRecipe(id) {
  let recipes = loadCustomRecipes();
  recipes = recipes.filter(r => r.id !== id);
  _set('custom-recipes', recipes);
}

// --- Favorites ---
function loadFavorites() {
  const raw = _get('favorites');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}

function toggleFavorite(recipeId) {
  let favs = loadFavorites();
  const idx = favs.indexOf(recipeId);
  if (idx > -1) favs.splice(idx, 1);
  else favs.push(recipeId);
  _set('favorites', favs);
  return favs;
}

// --- Last Visit Tracking ---
function loadLastVisit() {
  try { return localStorage.getItem(PREFIX + 'last-visit'); } catch(e) { return null; }
}

function saveLastVisit(dateStr) {
  try { localStorage.setItem(PREFIX + 'last-visit', dateStr); } catch(e) {}
}

// --- Task Timer ---
function loadActiveTimer() {
  const raw = _get('active-timer');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function saveActiveTimer(timer) {
  _set('active-timer', timer);
}

function clearActiveTimer() {
  _remove('active-timer');
}

// --- Streak Tracking ---
function loadStreak() {
  const raw = _get('streak');
  if (!raw) return { current: 0, best: 0, lastDate: null };
  try { return JSON.parse(raw); } catch(e) { return { current: 0, best: 0, lastDate: null }; }
}

function updateStreak() {
  const streak = loadStreak();
  const t = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
  if (streak.lastDate === t) return streak;
  if (streak.lastDate === yesterdayStr) {
    streak.current++;
  } else if (streak.lastDate !== t && streak.lastDate !== yesterdayStr) {
    streak.current = 1;
  }
  streak.lastDate = t;
  streak.best = Math.max(streak.best, streak.current);
  _set('streak', streak);
  return streak;
}

// --- Completion Calendar ---
function loadCalendar() {
  const raw = _get('calendar');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch(e) { return {}; }
}

function recordCalendarDay(date, tasksCompleted, tasksTotal) {
  const cal = loadCalendar();
  cal[date] = {
    completed: tasksCompleted,
    total: tasksTotal,
    done: tasksCompleted,
    pct: tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0
  };
  _set('calendar', cal);
}

// --- Achievements ---
function loadAchievements() {
  const raw = _get('achievements');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}

function unlockAchievement(id) {
  const achs = loadAchievements();
  if (!achs.includes(id)) {
    achs.push(id);
    _set('achievements', achs);
    return true;
  }
  return false;
}

// --- Last Export Tracking ---
function loadLastExport() {
  try { return localStorage.getItem(PREFIX + 'last-export'); } catch(e) { return null; }
}

function saveLastExport(ts) {
  try { localStorage.setItem(PREFIX + 'last-export', String(ts)); } catch(e) {}
}

// --- Dark Mode Preference ---
function loadDarkMode() {
  const raw = _get('dark-mode');
  if (raw === null) return 'auto';
  try { return JSON.parse(raw); } catch(e) { return 'auto'; }
}

function saveDarkMode(pref) {
  _set('dark-mode', pref);
}

// --- Sound Preference ---
function loadSoundEnabled() {
  const raw = _get('sound');
  if (raw === null) return true;
  try { return JSON.parse(raw); } catch(e) { return true; }
}

function saveSoundEnabled(val) {
  _set('sound', val);
}

// --- Export / Import ---
const EXPORT_VERSION = 2;

function exportAllData() {
  saveLastExport(Date.now());
  return {
    version: EXPORT_VERSION,
    exported: new Date().toISOString(),
    tasks: loadTasks(),
    userTasks: loadUserTasks(),
    customRecipes: loadCustomRecipes(),
    favorites: loadFavorites(),
    streak: loadStreak(),
    calendar: loadCalendar(),
    achievements: loadAchievements(),
    darkMode: loadDarkMode(),
    sound: loadSoundEnabled()
  };
}

function migrateImport(data) {
  /* v1 → v2: no schema change yet, but reserved for future migrations */
  if (data.version === 1) {
    data.version = EXPORT_VERSION;
  }
  return data;
}

function importAllData(data) {
  if (!data || !data.version) return false;
  if (typeof data.tasks !== 'object' || data.tasks === null || Array.isArray(data.tasks)) return false;
  if (typeof data.calendar !== 'object' || data.calendar === null) return false;
  data = migrateImport(data);
  // Note: confirm() is used here since this is called from app.js which handles the modal
  if (data.tasks) _set('tasks', data.tasks);
  if (data.userTasks) _set('user-tasks', data.userTasks);
  if (data.customRecipes) _set('custom-recipes', data.customRecipes);
  if (data.favorites) _set('favorites', data.favorites);
  if (data.streak) _set('streak', data.streak);
  if (data.calendar) _set('calendar', data.calendar);
  if (data.achievements) _set('achievements', data.achievements);
  if (data.darkMode !== undefined) _set('dark-mode', data.darkMode);
  if (data.sound !== undefined) _set('sound', data.sound);
  if (data.userTaskOrder) _set('user-task-order', data.userTaskOrder);
  return true;
}

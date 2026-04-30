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
  try { return JSON.parse(raw); } catch(e) { return []; }
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
}

function deleteUserTask(id) {
  let tasks = loadUserTasks();
  tasks = tasks.filter(t => t.id !== id);
  _set('user-tasks', tasks);
}

function updateUserTask(id, updates) {
  const tasks = loadUserTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx > -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    _set('user-tasks', tasks);
  }
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
  if (!Array.isArray(data.tasks) || typeof data.calendar !== 'object') return false;
  data = migrateImport(data);
  if (!confirm('Import data? This will overwrite your current data.')) return false;
  if (data.tasks) _set('tasks', data.tasks);
  if (data.userTasks) _set('user-tasks', data.userTasks);
  if (data.customRecipes) _set('custom-recipes', data.customRecipes);
  if (data.favorites) _set('favorites', data.favorites);
  if (data.streak) _set('streak', data.streak);
  if (data.calendar) _set('calendar', data.calendar);
  if (data.achievements) _set('achievements', data.achievements);
  if (data.darkMode !== undefined) _set('dark-mode', data.darkMode);
  if (data.sound !== undefined) _set('sound', data.sound);
  return true;
}

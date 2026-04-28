// localStorage Wrapper - All keys prefixed with 'kic_' (Keeping it Clean)
const PREFIX = 'kic_';

function _get(key) {
  try { return localStorage.getItem(PREFIX + key); } catch(e) { return null; }
}
function _set(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch(e) {}
}
function _remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch(e) {}
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

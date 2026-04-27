// localStorage Wrapper - All keys prefixed with 'kic_' (Keeping it Clean)
const PREFIX = 'kic_';

function _get(key) {
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
}
function _set(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
}
function _remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch {}
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

// --- Task State ---
export function loadTasks() {
  const raw = _get('tasks');
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch { return {}; }
}

export function saveTaskState(taskId, state) {
  const tasks = loadTasks();
  tasks[taskId] = { completed: state.completed, lastDone: today() };
  _set('tasks', tasks);
}

export function resetTodayTasks() {
  const tasks = loadTasks();
  const t = today();
  for (const id in tasks) {
    if (tasks[id].lastDone === t) {
      tasks[id].completed = false;
    }
  }
  _set('tasks', tasks);
}

// --- Custom Recipes ---
export function loadCustomRecipes() {
  const raw = _get('custom-recipes');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function saveCustomRecipe(recipe) {
  const recipes = loadCustomRecipes();
  recipes.push(recipe);
  _set('custom-recipes', recipes);
}

export function deleteCustomRecipe(id) {
  let recipes = loadCustomRecipes();
  recipes = recipes.filter(r => r.id !== id);
  _set('custom-recipes', recipes);
}

// --- Favorites ---
export function loadFavorites() {
  const raw = _get('favorites');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function toggleFavorite(recipeId) {
  let favs = loadFavorites();
  const idx = favs.indexOf(recipeId);
  if (idx > -1) favs.splice(idx, 1);
  else favs.push(recipeId);
  _set('favorites', favs);
  return favs;
}

// --- Last Visit Tracking ---
export function loadLastVisit() {
  try { return localStorage.getItem(PREFIX + 'last-visit'); } catch { return null; }
}

export function saveLastVisit(dateStr) {
  try { localStorage.setItem(PREFIX + 'last-visit', dateStr); } catch {}
}
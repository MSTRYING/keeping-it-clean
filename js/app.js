// ============================================
// Keeping it Clean · 片付け Katazuke
// Vanilla JS App - No Framework Dependencies
// ============================================

(function () {
  'use strict';

  // --- State ---
  let activeTab = 'checklist';
  let activeFreqFilter = 'all';
  let activeRecipeFilter = 'all';
  let expandedRecipeId = null;
  let showCustomRecipeModal = false;
  let toastMessage = '';
  let toastVisible = false;

  // --- DOM Helpers ---
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

  function el(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'class') {
        if (Array.isArray(val)) element.className = val.filter(Boolean).join(' ');
        else element.className = val;
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
    for (const [key, val] of Object.entries(attrs)) {
      svg.setAttribute(key, val);
    }
    for (const child of children) {
      if (typeof child === 'object') svg.appendChild(child);
    }
    return svg;
  }

  function svgPath(d, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    for (const [key, val] of Object.entries(attrs)) {
      path.setAttribute(key, val);
    }
    return path;
  }

  function svgPolyline(points, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const pl = document.createElementNS(ns, 'polyline');
    pl.setAttribute('points', points);
    for (const [key, val] of Object.entries(attrs)) {
      pl.setAttribute(key, val);
    }
    return pl;
  }

  function svgLine(x1, y1, x2, y2, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    for (const [key, val] of Object.entries(attrs)) {
      line.setAttribute(key, val);
    }
    return line;
  }

  function svgRect(x, y, w, h, attrs = {}) {
    const ns = 'http://www.w3.org/2000/svg';
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    for (const [key, val] of Object.entries(attrs)) {
      rect.setAttribute(key, val);
    }
    return rect;
  }

  // --- Checkmark SVG ---
  function checkmarkSvg() {
    return svgIcon(
      { viewBox: '0 0 24 24', width: '14', height: '14', fill: 'none', stroke: 'white', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      [svgPath('M6 12l4 4 8-8', {})]
    );
  }

  // --- Tab Bar Icons ---
  function checklistTabIcon(active) {
    const sw = active ? '2.5' : '2';
    return svgIcon(
      { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: '24', height: '24' },
      [
        svgRect('3', '3', '18', '18', { rx: '2', ry: '2' }),
        svgPolyline('9 11 12 14 22 4', {})
      ]
    );
  }

  function recipeTabIcon(active) {
    const sw = active ? '2.5' : '2';
    return svgIcon(
      { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', width: '24', height: '24' },
      [
        svgPath('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', {}),
        svgPolyline('14 2 14 8 20 8', {}),
        svgLine('16', '13', '8', '13', {}),
        svgLine('16', '17', '8', '17', {})
      ]
    );
  }

  // --- Heart Icon ---
  function heartIcon(active) {
    return svgIcon(
      {
        viewBox: '0 0 24 24', width: '20', height: '20',
        stroke: active ? 'var(--color-danger)' : 'var(--color-text-light)',
        fill: active ? 'var(--color-danger)' : 'none',
        'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      },
      [svgPath('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.83l-1.06-1.22a5.5 5.5 0 0 0-7.78 7.78l1.06 1.22L12 21.29l7.78-7.78 1.06-1.22a5.5 5.5 0 0 0 0-7.78z', {})]
    );
  }

  // --- Chevron Icon ---
  function chevronIcon(expanded) {
    return svgIcon(
      {
        viewBox: '0 0 24 24', width: '20', height: '20',
        fill: 'none', stroke: 'var(--color-text-muted)', 'stroke-width': '2',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        style: `transition: transform 0.2s ease; transform: rotate(${expanded ? 180 : 0}deg);`
      },
      [svgPath('M6 9l6 6 6-6', {})]
    );
  }

  // --- Plus Icon ---
  function plusIcon() {
    return svgIcon(
      { viewBox: '0 0 24 24', width: '24', height: '24', fill: 'none', stroke: 'white', 'stroke-width': '2.5', 'stroke-linecap': 'round' },
      [svgPath('M12 5v14M5 12h14', {})]
    );
  }

  // --- Close Icon ---
  function closeIcon() {
    return svgIcon(
      { viewBox: '0 0 24 24', width: '20', height: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' },
      [svgPath('M18 6L6 18M6 6l12 12', {})]
    );
  }

  // --- Reset Icon ---
  function resetIcon() {
    return svgIcon(
      { viewBox: '0 0 24 24', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
      [svgPath('M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', {}), svgPath('M3 3v5h5', {})]
    );
  }

  // --- Toast ---
  function showToast(msg) {
    toastMessage = msg;
    toastVisible = true;
    render();
    setTimeout(() => {
      toastVisible = false;
      render();
    }, 2500);
  }

  // --- Daily Reset Check ---
  function checkDailyReset() {
    const lastVisit = loadLastVisit();
    const t = today();
    if (lastVisit && lastVisit !== t) {
      resetTodayTasks();
    }
    saveLastVisit(t);
  }

  // --- Checklist Tab ---
  function renderChecklist() {
    const container = el('div', { class: 'checklist-tab' });

    // Header
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['Keeping it Clean']),
      el('p', { class: 'subtitle' }, ['片付け · Katazuke'])
    ]));

    // Frequency filter chips
    const taskState = loadTasks();
    const freqContainer = el('div', { class: 'frequency-filters' });

    // "All" chip
    freqContainer.appendChild(el('button', {
      class: ['freq-chip', { active: activeFreqFilter === 'all' }],
      textContent: 'All',
      onClick: () => { activeFreqFilter = 'all'; render(); }
    }));

    // Frequency chips
    for (const freq of frequencies) {
      const tasksForFreq = cleaningTasks.filter(t => t.frequency === freq.value);
      const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
      const total = tasksForFreq.length;
      const label = `${freq.label} (${done}/${total})`;

      freqContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeFreqFilter === freq.value }],
        textContent: label,
        onClick: () => { activeFreqFilter = freq.value; render(); }
      }));
    }

    container.appendChild(freqContainer);

    // Progress section
    const progressSection = el('div', { class: 'progress-section' });

    if (activeFreqFilter === 'all') {
      // Show progress for each frequency
      for (const freq of frequencies) {
        const tasksForFreq = cleaningTasks.filter(t => t.frequency === freq.value);
        const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
        const total = tasksForFreq.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        progressSection.appendChild(el('div', { class: 'progress-card' }, [
          el('div', { class: 'freq-label' }, [freq.label]),
          el('div', { class: 'progress-bar-track' }, [
            el('div', { class: 'progress-bar-fill', style: `width: ${pct}%` })
          ]),
          el('div', { class: ['progress-text', { done: pct === 100 }] }, [
            pct === 100 ? '✓ All done!' : `${done} / ${total} done`
          ])
        ]));
      }
    } else {
      // Show progress for selected frequency only
      const tasksForFreq = cleaningTasks.filter(t => t.frequency === activeFreqFilter);
      const done = tasksForFreq.filter(t => taskState[t.id]?.completed).length;
      const total = tasksForFreq.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const freqLabel = frequencies.find(f => f.value === activeFreqFilter)?.label || '';

      progressSection.appendChild(el('div', { class: 'progress-card' }, [
        el('div', { class: 'freq-label' }, [freqLabel]),
        el('div', { class: 'progress-bar-track' }, [
          el('div', { class: 'progress-bar-fill', style: `width: ${pct}%` })
        ]),
        el('div', { class: ['progress-text', { done: pct === 100 }] }, [
          pct === 100 ? '✓ All done!' : `${done} / ${total} done`
        ])
      ]));
    }

    container.appendChild(progressSection);

    // Task groups
    const filteredTasks = activeFreqFilter === 'all'
      ? cleaningTasks
      : cleaningTasks.filter(t => t.frequency === activeFreqFilter);

    // Group by frequency
    const groups = {};
    for (const task of filteredTasks) {
      if (!groups[task.frequency]) groups[task.frequency] = [];
      groups[task.frequency].push(task);
    }

    const freqOrder = ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual'];
    const freqLabels = {
      'daily': 'Daily Tasks',
      'weekly': 'Weekly Tasks',
      'bi-weekly': 'Bi-Weekly Tasks',
      'monthly': 'Monthly Tasks',
      'quarterly': 'Quarterly Tasks',
      'annual': 'Annual Tasks'
    };

    for (const freq of freqOrder) {
      if (!groups[freq]) continue;

      const group = el('div', { class: 'task-group' });
      group.appendChild(el('h3', { class: 'task-group-title' }, [freqLabels[freq] || freq]));

      for (const task of groups[freq]) {
        const isCompleted = taskState[task.id]?.completed || false;
        const item = el('div', {
          class: ['task-item', { completed: isCompleted }],
          onClick: () => {
            const newCompleted = !isCompleted;
            saveTaskState(task.id, { completed: newCompleted });
            if (newCompleted) showToast(`${task.icon} ${task.name} ✓`);
            render();
          }
        });

        // Checkbox
        item.appendChild(el('div', { class: 'task-checkbox' }, [
          checkmarkSvg()
        ]));

        // Icon
        item.appendChild(el('div', { class: 'task-icon' }, [task.icon]));

        // Info
        const info = el('div', { class: 'task-info' });
        info.appendChild(el('div', { class: 'task-name' }, [task.name]));
        if (task.note) {
          info.appendChild(el('div', { class: 'task-note' }, [task.note]));
        }
        item.appendChild(info);

        // Frequency badge
        item.appendChild(el('span', {
          class: ['freq-badge', task.frequency]
        }, [task.frequency]));

        group.appendChild(item);
      }

      container.appendChild(group);
    }

    // Reset button
    container.appendChild(el('div', { class: 'reset-section' }, [
      el('button', {
        class: 'btn-reset',
        onClick: () => {
          if (confirm('Reset all tasks for today?')) {
            resetTodayTasks();
            showToast('Tasks reset for today');
            render();
          }
        }
      }, [resetIcon(), document.createTextNode(' Reset Today\'s Tasks')])
    ]));

    return container;
  }

  // --- Recipes Tab ---
  function renderRecipes() {
    const container = el('div', { class: 'recipes-tab' });

    // Header
    container.appendChild(el('header', { class: 'app-header' }, [
      el('h1', {}, ['DIY Recipes']),
      el('p', { class: 'subtitle' }, ['エコレシピ · Eco-Friendly'])
    ]));

    // Search
    const searchInput = el('input', {
      class: 'form-input',
      type: 'search',
      placeholder: 'Search recipes...',
      style: 'margin-bottom: var(--space-md);',
      onInput: (e) => { /* handled via render */ }
    });
    // We need to store search term
    searchInput.id = 'recipe-search';
    if (window._recipeSearchTerm) {
      searchInput.value = window._recipeSearchTerm;
    }
    searchInput.addEventListener('input', (e) => {
      window._recipeSearchTerm = e.target.value;
      render();
    });
    container.appendChild(searchInput);

    // Filter chips
    const filterContainer = el('div', { class: 'frequency-filters' });

    for (const tag of recipeFilterTags) {
      filterContainer.appendChild(el('button', {
        class: ['freq-chip', { active: activeRecipeFilter === tag.value }],
        textContent: tag.label,
        onClick: () => { activeRecipeFilter = tag.value; expandedRecipeId = null; render(); }
      }));
    }

    container.appendChild(filterContainer);

    // Get all recipes (built-in + custom)
    const allRecipes = [...cleaningRecipes];
    const customRecipes = loadCustomRecipes();
    for (const cr of customRecipes) {
      allRecipes.push({
        ...cr,
        isCustom: true
      });
    }

    const favorites = loadFavorites();

    // Filter
    let filtered = allRecipes;
    if (activeRecipeFilter !== 'all') {
      filtered = filtered.filter(r => r.tags && r.tags.includes(activeRecipeFilter));
    }
    if (window._recipeSearchTerm) {
      const q = window._recipeSearchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.tags && r.tags.some(t => t.includes(q))) ||
        (r.jpName && r.jpName.includes(q))
      );
    }

    // Empty state
    if (filtered.length === 0) {
      container.appendChild(el('div', { class: 'empty-state' }, [
        el('div', { class: 'empty-state-icon' }, ['🔍']),
        el('div', { class: 'empty-state-text' }, ['No recipes found. Try a different filter or search term.'])
      ]));
    } else {
      // Recipe cards
      for (const recipe of filtered) {
        const isExpanded = expandedRecipeId === recipe.id;
        const isFav = favorites.includes(recipe.id);

        const card = el('div', { class: 'recipe-card' });

        // Header
        const header = el('div', {
          class: 'recipe-header',
          onClick: () => {
            expandedRecipeId = isExpanded ? null : recipe.id;
            render();
          }
        });

        header.appendChild(el('div', { class: 'recipe-emoji' }, [recipe.emoji || '🧴']));

        const titleArea = el('div', { class: 'recipe-title-area' });
        titleArea.appendChild(el('div', { class: 'recipe-name' }, [recipe.name]));
        if (recipe.jpName) {
          titleArea.appendChild(el('div', { class: 'recipe-jp-name' }, [recipe.jpName]));
        }
        header.appendChild(titleArea);

        // Favorite button
        const favBtn = el('button', {
          class: ['recipe-fav-btn', { active: isFav }],
          onClick: (e) => {
            e.stopPropagation();
            toggleFavorite(recipe.id);
            render();
          }
        }, [heartIcon(isFav)]);
        header.appendChild(favBtn);

        // Delete button for custom recipes
        if (recipe.isCustom) {
          const delBtn = el('button', {
            class: 'recipe-fav-btn',
            style: 'color: var(--color-danger);',
            onClick: (e) => {
              e.stopPropagation();
              if (confirm('Delete this recipe?')) {
                deleteCustomRecipe(recipe.id);
                showToast('Recipe deleted');
                render();
              }
            }
          }, [closeIcon()]);
          header.appendChild(delBtn);
        }

        // Chevron
        header.appendChild(chevronIcon(isExpanded));

        card.appendChild(header);

        // Detail (expanded)
        if (isExpanded) {
          const detail = el('div', { class: 'recipe-detail' });

          // Tags
          if (recipe.tags && recipe.tags.length) {
            const tagsDiv = el('div', { class: 'recipe-tags' });
            for (const tag of recipe.tags) {
              tagsDiv.appendChild(el('span', {
                class: ['recipe-tag', { 'pet-safe': tag === 'cat-safe' }]
              }, [tag]));
            }
            detail.appendChild(tagsDiv);
          }

          // Ingredients
          if (recipe.ingredients && recipe.ingredients.length) {
            detail.appendChild(el('h4', { class: 'recipe-section-title' }, ['Ingredients']));
            const ul = el('ul', { class: 'recipe-ingredients' });
            for (const ing of recipe.ingredients) {
              ul.appendChild(el('li', {}, [ing]));
            }
            detail.appendChild(ul);
          }

          // Steps
          if (recipe.steps && recipe.steps.length) {
            detail.appendChild(el('h4', { class: 'recipe-section-title' }, ['Steps']));
            const ol = el('ol', { class: 'recipe-steps' });
            for (const step of recipe.steps) {
              ol.appendChild(el('li', {}, [step]));
            }
            detail.appendChild(ol);
          }

          // Note
          if (recipe.note) {
            detail.appendChild(el('div', { class: 'recipe-note-box' }, [recipe.note]));
          }

          card.appendChild(detail);
        }

        container.appendChild(card);
      }
    }

    // FAB
    container.appendChild(el('button', {
      class: 'fab',
      onClick: () => { showCustomRecipeModal = true; render(); }
    }, [plusIcon()]));

    // Modal
    if (showCustomRecipeModal) {
      const overlay = el('div', {
        class: 'modal-overlay',
        onClick: (e) => { if (e.target === overlay) { showCustomRecipeModal = false; render(); } }
      });

      const sheet = el('div', { class: 'modal-sheet' });
      sheet.appendChild(el('div', { class: 'modal-handle' }));
      sheet.appendChild(el('h2', { class: 'modal-title' }, ['Add Custom Recipe']));

      // Form fields
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

        if (field.type === 'textarea') {
          group.appendChild(el('textarea', {
            class: 'form-textarea',
            id: field.key,
            placeholder: field.placeholder || ''
          }));
        } else {
          group.appendChild(el('input', {
            class: 'form-input',
            type: field.type || 'text',
            id: field.key,
            placeholder: field.placeholder || '',
            required: field.required || false
          }));
        }

        sheet.appendChild(group);
      }

      // Submit button
      sheet.appendChild(el('button', {
        class: 'btn-primary',
        onClick: () => {
          const name = ($('#crName')?.value || '').trim();
          const ingredients = ($('#crIngredients')?.value || '').trim();
          const steps = ($('#crSteps')?.value || '').trim();

          if (!name || !ingredients || !steps) {
            alert('Please fill in name, ingredients, and steps.');
            return;
          }

          const recipe = {
            id: 'custom_' + Date.now(),
            name,
            jpName: ($('#crJpName')?.value || '').trim() || '',
            emoji: ($('#crEmoji')?.value || '').trim() || '🧴',
            ingredients: ingredients.split('\n').map(s => s.trim()).filter(Boolean),
            steps: steps.split('\n').map(s => s.trim()).filter(Boolean),
            note: ($('#crNote')?.value || '').trim() || '',
            tags: ($('#crTags')?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
            isPetSafe: true
          };

          saveCustomRecipe(recipe);
          showCustomRecipeModal = false;
          showToast(`${recipe.emoji} Recipe added!`);
          render();
        }
      }, ['Save Recipe']));

      // Cancel button
      sheet.appendChild(el('button', {
        class: 'btn-secondary',
        onClick: () => { showCustomRecipeModal = false; render(); }
      }, ['Cancel']));

      overlay.appendChild(sheet);
      container.appendChild(overlay);
    }

    return container;
  }

  // --- Tab Bar ---
  function renderTabBar() {
    return el('nav', { class: 'tab-bar' }, [
      el('button', {
        class: ['tab-item', { active: activeTab === 'checklist' }],
        onClick: () => {
          activeTab = 'checklist';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          render();
        }
      }, [
        checklistTabIcon(activeTab === 'checklist'),
        el('span', {}, ['Tasks'])
      ]),
      el('button', {
        class: ['tab-item', { active: activeTab === 'recipes' }],
        onClick: () => {
          activeTab = 'recipes';
          window.scrollTo({ top: 0, behavior: 'smooth' });
          render();
        }
      }, [
        recipeTabIcon(activeTab === 'recipes'),
        el('span', {}, ['Recipes'])
      ])
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

    if (activeTab === 'checklist') {
      app.appendChild(renderChecklist());
    } else {
      app.appendChild(renderRecipes());
    }

    app.appendChild(renderTabBar());
    const toast = renderToast();
    if (toast) app.appendChild(toast);
  }

  // --- Init ---
  function init() {
    checkDailyReset();
    render();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
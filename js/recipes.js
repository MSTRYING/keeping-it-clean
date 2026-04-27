import { defineComponent, h, ref, computed, onMounted } from 'vue';
import { cleaningRecipes, recipeFilterTags } from './data-recipes.js';
import * as storage from './storage.js';

export const Recipes = defineComponent({
  name: 'Recipes',

  setup() {
    // --- State ---
    const activeTag = ref('all');
    const expandedId = ref(null);
    const showFavoritesOnly = ref(false);
    const favorites = ref(storage.loadFavorites());
    const customRecipes = ref([]);
    const showModal = ref(false);

    // New recipe form state
    const newRecipe = ref({
      name: '',
      jpName: '',
      emoji: '🧪',
      ingredients: '',
      steps: '',
      note: ''
    });

    const toastMsg = ref('');
    let toastTimer = null;

    function showToast(msg) {
      toastMsg.value = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastMsg.value = ''; }, 2000);
    }

    // --- Computed ---
    const allRecipes = computed(() => [
      ...cleaningRecipes,
      ...customRecipes.value.map(r => ({ ...r, isCustom: true }))
    ]);

    const filteredRecipes = computed(() => {
      let list = allRecipes.value;
      if (showFavoritesOnly.value) {
        list = list.filter(r => favorites.value.includes(r.id));
      }
      if (activeTag.value !== 'all') {
        list = list.filter(r => r.tags && r.tags.includes(activeTag.value));
      }
      return list;
    });

    // --- Actions ---
    function toggleExpand(id) {
      expandedId.value = expandedId.value === id ? null : id;
    }

    function toggleFav(recipeId, event) {
      if (event) event.stopPropagation();
      const newFavs = storage.toggleFavorite(recipeId);
      favorites.value = newFavs;
      showToast(newFavs.includes(recipeId) ? '♥ Added to favorites' : 'Removed from favorites');
    }

    function openModal() {
      showModal.value = true;
      newRecipe.value = { name: '', jpName: '', emoji: '🧪', ingredients: '', steps: '', note: '' };
    }

    function closeModal() {
      showModal.value = false;
    }

    function saveCustomRecipe() {
      if (!newRecipe.value.name.trim()) return;
      const recipe = {
        id: 'custom_' + Date.now(),
        name: newRecipe.value.name,
        jpName: newRecipe.value.jpName || '',
        emoji: newRecipe.value.emoji || '🧪',
        ingredients: newRecipe.value.ingredients.split('\n').filter(Boolean),
        steps: newRecipe.value.steps.split('\n').filter(Boolean),
        note: newRecipe.value.note,
        tags: ['custom'],
        isPetSafe: true,
        isCustom: true
      };
      storage.saveCustomRecipe(recipe);
      customRecipes.value = storage.loadCustomRecipes();
      closeModal();
      showToast('✓ Recipe saved!');
    }

    function deleteCustomRecipe(id) {
      storage.deleteCustomRecipe(id);
      customRecipes.value = storage.loadCustomRecipes();
      if (expandedId.value === id) expandedId.value = null;
      showToast('Recipe deleted');
    }

    onMounted(() => {
      customRecipes.value = storage.loadCustomRecipes();
    });

    // --- Render Helpers ---
    function renderRecipeCard(recipe) {
      const isExpanded = expandedId.value === recipe.id;
      const isFav = favorites.value.includes(recipe.id);

      return h('div', {
        key: recipe.id,
        class: 'recipe-card'
      }, [
        // Header (clickable to expand)
        h('div', {
          class: 'recipe-header',
          onClick: () => toggleExpand(recipe.id)
        }, [
          h('span', { class: 'recipe-emoji' }, [recipe.emoji]),
          h('div', { class: 'recipe-title-area' }, [
            h('div', { class: 'recipe-name' }, [recipe.name]),
            ...(recipe.jpName ? [h('div', { class: 'recipe-jp-name' }, [recipe.jpName])] : [])
          ]),
          // Favorite button
          h('button', {
            class: ['recipe-fav-btn', { active: isFav }],
            onClick: (e) => toggleFav(recipe.id, e)
          }, [
            h('svg', { viewBox: '0 0 24 24', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
              h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
            ])
          ]),
          // Expand indicator
          h('svg', {
            class: 'expand-arrow',
            style: { width: '16px', height: '16px', transition: 'transform 250ms', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', stroke: 'var(--color-text-muted)', fill: 'none', 'stroke-width': '2' },
            viewBox: '0 0 24 24'
          }, [h('polyline', { points: '6 9 12 15 18 9' })])
        ]),

        // Expanded detail
        ...(isExpanded ? [
          h('div', { class: 'recipe-detail' }, [
            // Tags
            ...(recipe.tags ? [
              h('div', { class: 'recipe-tags' },
                recipe.tags.map(tag =>
                  h('span', {
                    key: tag,
                    class: ['recipe-tag', { 'pet-safe': tag === 'cat-safe' }]
                  }, [tag === 'cat-safe' ? '🐱 ' : ''] + tag.replace(/-/g, ' ')))
              )
            ] : []),

            // Ingredients
            h('h4', { class: 'recipe-section-title' }, ['Ingredients']),
            h('ul', { class: 'recipe-ingredients' },
              (recipe.ingredients || []).map(ing => h('li', null, [ing]))
            ),

            // Steps
            h('h4', { class: 'recipe-section-title' }, ['Steps']),
            h('ol', { class: 'recipe-steps' },
              (recipe.steps || []).map(step => h('li', null, [step]))
            ),

            // Note
            ...(recipe.note ? [
              h('div', { class: 'recipe-note-box' }, [
                h('strong', null, ['Note: ']),
                h('span', null, [recipe.note])
              ])
            ] : []),

            // Delete button for custom recipes
            ...(recipe.isCustom ? [
              h('button', {
                class: 'btn-secondary',
                style: { color: 'var(--color-danger)', marginTop: '12px' },
                onClick: () => deleteCustomRecipe(recipe.id)
              }, ['🗑  Delete this recipe'])
            ] : [])
          ])
        ] : [])
      ]);
    }

    function renderModal() {
      if (!showModal.value) return null;

      return h('div', { class: 'modal-overlay', onClick: closeModal }, [
        h('div', { class: 'modal-sheet', onClick: (e) => e.stopPropagation() }, [
          // Handle bar
          h('div', { class: 'modal-handle' }),
          h('h3', { class: 'modal-title' }, ['Add Your Recipe']),

          // Name
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Recipe Name *']),
            h('input', {
              class: 'form-input',
              type: 'text',
              placeholder: 'e.g., Rice Water Cleaner',
              value: newRecipe.value.name,
              onInput: (e) => { newRecipe.value.name = e.target.value; }
            })
          ]),

          // Japanese name (optional)
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Japanese Name (optional)']),
            h('input', {
              class: 'form-input',
              type: 'text',
              placeholder: 'e.g., 米水クリーナー',
              value: newRecipe.value.jpName,
              onInput: (e) => { newRecipe.value.jpName = e.target.value; }
            })
          ]),

          // Emoji
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Emoji Icon']),
            h('input', {
              class: 'form-input',
              type: 'text',
              placeholder: '🧪',
              value: newRecipe.value.emoji,
              onInput: (e) => { newRecipe.value.emoji = e.target.value; },
              style: { width: '60px' }
            })
          ]),

          // Ingredients
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Ingredients (one per line)']),
            h('textarea', {
              class: 'form-textarea',
              placeholder: 'Baking soda — 3 tbsp\nWater — as needed\nVinegar — 1 cup',
              value: newRecipe.value.ingredients,
              onInput: (e) => { newRecipe.value.ingredients = e.target.value; }
            })
          ]),

          // Steps
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Steps (one per line)']),
            h('textarea', {
              class: 'form-textarea',
              placeholder: 'Mix baking soda with water\nApply to surface\nLet sit 5 minutes\nRinse clean',
              value: newRecipe.value.steps,
              onInput: (e) => { newRecipe.value.steps = e.target.value; }
            })
          ]),

          // Note
          h('div', { class: 'form-group' }, [
            h('label', { class: 'form-label' }, ['Note / Tips (optional)']),
            h('textarea', {
              class: 'form-textarea',
              style: { minHeight: '60px' },
              placeholder: 'Safe around cats. Use within 24 hours...',
              value: newRecipe.value.note,
              onInput: (e) => { newRecipe.value.note = e.target.value; }
            })
          ]),

          // Buttons
          h('button', {
            class: 'btn-primary',
            onClick: saveCustomRecipe
          }, ['Save Recipe']),

          h('button', {
            class: 'btn-secondary',
            onClick: closeModal
          }, ['Cancel'])
        ])
      ]);
    }

    // --- Main Render ---
    return () => h('div', { class: 'recipes-page' }, [
      // Header
      h('header', { class: 'app-header' }, [
        h('h1', null, ['DIY Recipes']),
        h('p', { class: 'subtitle' }, ['手作りの洗剤 · Handmade Cleaners'])
      ]),

      // Tag filter chips + favorites toggle
      h('div', { class: 'frequency-filters' }, [
        // Favorites toggle
        h('button', {
          class: ['freq-chip', { active: showFavoritesOnly.value }],
          onClick: () => { showFavoritesOnly.value = !showFavoritesOnly.value; }
        }, ['♥ Saved']),

        ...recipeFilterTags.map(tag =>
          h('button', {
            key: tag.value,
            class: ['freq-chip', { active: activeTag.value === tag.value && !showFavoritesOnly.value }],
            onClick: () => { activeTag.value = tag.value; showFavoritesOnly.value = false; }
          }, [tag.label])
        )
      ]),

      // Recipe list
      ...(filteredRecipes.value.length > 0 ? [
        h('div', null, filteredRecipes.value.map(renderRecipeCard))
      ] : [
        h('div', { class: 'empty-state' }, [
          h('div', { class: 'empty-state-icon' }, ['🍵']),
          h('p', { class: 'empty-state-text' }, [
            showFavoritesOnly.value
              ? 'No saved recipes yet.\nTap the ♥ on any recipe to save it.'
              : 'No recipes match this filter.'
          ])
        ])
      ]),

      // FAB (add recipe)
      h('button', {
        class: 'fab',
        onClick: openModal,
        title: 'Add your own recipe'
      }, [
        h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': '2.5', 'stroke-linecap': 'round' }, [
          h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
          h('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
        ])
      ]),

      // Modal
      renderModal(),

      // Toast
      ...(toastMsg.value ? [h('div', { class: 'toast' }, [toastMsg.value])] : [])
    ]);
  }
});
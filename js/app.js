import { createApp, defineComponent, h, ref } from 'vue';
import { Checklist } from './checklist.js';
import { Recipes } from './recipes.js';

const App = defineComponent({
  name: 'App',

  setup() {
    const activeTab = ref('checklist');

    // --- Tab Bar Icons (inline SVG) ---
    function checklistIcon(active) {
      return h('svg', {
        viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        'stroke-width': active ? '2.5' : '2',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }, [
        h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        h('polyline', { points: '9 11 12 14 22 4' }) // checkmark (adjusted)
      ]);
    }

    function recipeIcon(active) {
      return h('svg', {
        viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        'stroke-width': active ? '2.5' : '2',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }, [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
        h('line', { x1: '16', y1: '17', x2: '8', y2: '17' })
      ]);
    }

    return () => h('div', null, [
      // Active tab content
      activeTab.value === 'checklist' ? h(Checklist) : h(Recipes),

      // Bottom Tab Bar
      h('nav', { class: 'tab-bar' }, [
        h('button', {
          class: ['tab-item', { active: activeTab.value === 'checklist' }],
          onClick: () => { activeTab.value = 'checklist'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }, [
          checklistIcon(activeTab.value === 'checklist'),
          h('span', null, ['Tasks'])
        ]),

        h('button', {
          class: ['tab-item', { active: activeTab.value === 'recipes' }],
          onClick: () => { activeTab.value = 'recipes'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }, [
          recipeIcon(activeTab.value === 'recipes'),
          h('span', null, ['Recipes'])
        ])
      ])
    ]);
  }
});

const app = createApp(App);
app.mount('#app');

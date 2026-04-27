import { defineComponent, h, ref, computed, watch, onMounted } from 'vue';
import { cleaningTasks, FREQUENCIES } from './data-tasks.js';
import * as storage from './storage.js';

export const Checklist = defineComponent({
  name: 'Checklist',

  setup() {
    // --- State ---
    const activeFilter = ref('all');
    const taskStates = ref(storage.loadTasks());
    const toastMsg = ref('');
    let toastTimer = null;

    // --- Helpers ---
    function showToast(msg) {
      toastMsg.value = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastMsg.value = ''; }, 2000);
    }

    function todayStr() { return storage.today(); }

    // Check if a frequency should be shown today
    function isDue(freq) {
      const t = new Date(todayStr());
      switch (freq) {
        case 'daily': return true;
        case 'weekly': return t.getDay() === 1; // Monday
        case 'bi-weekly': return Math.floor(t.getDate() / 14) !== Math.floor((t.getDate() - 1) / 14); // every 2 weeks boundary
        case 'monthly': return t.getDate() <= 3; // first 3 days of month
        case 'quarterly': return [0, 1, 4, 7].includes(t.getMonth()) && t.getDate() <= 3; // Jan/Apr/Jul/Oct
        case 'annual': return t.getMonth() === 0 && t.getDate() <= 3; // January
        default: return true;
      }
    }

    function isDueOrAny(freq) {
      if (activeFilter.value === 'all') return true;
      return freq === activeFilter.value || isDue(freq);
    }

    // --- Computed ---
    const filteredTasks = computed(() => {
      if (activeFilter.value === 'all') return cleaningTasks;
      return cleaningTasks.filter(t => t.frequency === activeFilter.value);
    });

    function getTaskState(taskId) {
      return taskStates.value[taskId] || { completed: false, lastDone: null };
    }

    const groupedTasks = computed(() => {
      const groups = {};
      for (const task of filteredTasks.value) {
        if (!groups[task.category]) groups[task.category] = [];
        groups[task.category].push(task);
      }
      return groups;
    });

    // Progress per frequency
    const progressByFreq = computed(() => {
      const result = {};
      for (const freq of FREQUENCIES) {
        const tasks = cleaningTasks.filter(t => t.frequency === freq.value);
        const done = tasks.filter(t => getTaskState(t.id).completed).length;
        result[freq.value] = { total: tasks.length, done };
      }
      return result;
    });

    // Show progress only for frequencies due today (or all if filter is 'all')
    const visibleProgress = computed(() => {
      if (activeFilter.value !== 'all') {
        const p = progressByFreq.value[activeFilter.value];
        return p ? [{ ...FREQUENCIES.find(f => f.value === activeFilter.value), total: p.total, done: p.done }] : [];
      }
      return FREQUENCIES.map(f => ({
        ...f,
        total: progressByFreq.value[f.value]?.total || 0,
        done: progressByFreq.value[f.value]?.done || 0
      })).filter(f => f.total > 0);
    });

    const allDone = computed(() => {
      return filteredTasks.value.length > 0 && filteredTasks.value.every(t => getTaskState(t.id).completed);
    });

    // --- Actions ---
    function toggleTask(task) {
      const state = getTaskState(task.id);
      const newCompleted = !state.completed;
      taskStates.value[task.id] = { completed: newCompleted, lastDone: todayStr() };
      storage.saveTaskState(task.id, { completed: newCompleted, lastDone: todayStr() });

      if (newCompleted) {
        showToast(`✓ ${task.name}`);
        // Check if all done in current filter
        setTimeout(() => {
          if (allDone.value && filteredTasks.value.length > 0) {
            showToast('🎉 All tasks complete!');
          }
        }, 600);
      }
    }

    function resetToday() {
      storage.resetTodayTasks();
      taskStates.value = storage.loadTasks();
      showToast('Tasks reset for today');
    }

    // Check if returning from a previous day → auto-reset yesterday's completions
    onMounted(() => {
      const lastVisit = storage.loadLastVisit();
      if (lastVisit && lastVisit !== todayStr()) {
        // Only reset daily tasks from previous days
        const states = storage.loadTasks();
        let changed = false;
        for (const task of cleaningTasks) {
          const s = states[task.id];
          if (s && s.completed && s.lastDone !== todayStr() && task.frequency === 'daily') {
            states[task.id] = { ...s, completed: false };
            changed = true;
          }
        }
        if (changed) {
          storage.saveTaskState('__dummy__', {}); // trigger save via different path
          // Actually we need to rewrite the whole state
          try { localStorage.setItem('kic_tasks', JSON.stringify(states)); } catch {}
          taskStates.value = states;
        }
      }
      storage.saveLastVisit(todayStr());
    });

    // --- Render ---
    return () => h('div', { class: 'checklist-page' }, [
      // Header
      h('header', { class: 'app-header' }, [
        h('h1', null, ['Keeping it Clean']),
        h('p', { class: 'subtitle' }, ['片付け · Katazuke'])
      ]),

      // Frequency filter chips
      h('div', { class: 'frequency-filters' },
        [...{ value: 'all', label: 'All Tasks' }, ...FREQUENCIES].map(freq =>
          h('button', {
            key: freq.value,
            class: ['freq-chip', { active: activeFilter.value === freq.value }],
            onClick: () => { activeFilter.value = freq.value; }
          }, [freq.label])
        )
      ),

      // Progress bars
      h('div', { class: 'progress-section' },
        visibleProgress.value.map(freq => {
          const pct = freq.total > 0 ? Math.round((freq.done / freq.total) * 100) : 0;
          return h('div', { key: freq.value, class: 'progress-card' }, [
            h('div', { class: 'freq-label' }, [`${freq.label}`]),
            h('div', { class: 'progress-bar-track' }, [
              h('div', {
                class: 'progress-bar-fill',
                style: { width: `${pct}%` }
              })
            ]),
            h('span', {
              class: ['progress-text', { done: pct === 100 }]
            }, [`${freq.done} / ${freq.total}` + (pct === 100 ? ' ✓' : '')])
          ]);
        })
      ),

      // Task groups
      Object.entries(groupedTasks.value).map(([category, tasks]) =>
        h('section', { key: category, class: 'task-group' }, [
          h('h2', { class: 'task-group-title' }, [category]),
          ...tasks.map(task => {
            const state = getTaskState(task.id);
            return h('div', {
              key: task.id,
              class: ['task-item', { completed: state.completed }],
              onClick: () => toggleTask(task)
            }, [
              // Checkbox
              h('div', { class: 'task-checkbox' }, [
                h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'white', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
                  h('polyline', { points: '20 6 9 17 4 12' })
                ])
              ]),
              // Icon
              h('span', { class: 'task-icon' }, [task.icon]),
              // Info
              h('div', { class: 'task-info' }, [
                h('div', { class: 'task-name' }, [task.name]),
                ...(task.note ? [h('div', { class: 'task-note' }, [task.note])] : [])
              ]),
              // Frequency badge
              h('span', { class: ['freq-badge', task.frequency] }, [task.frequency])
            ]);
          })
        ])
      ),

      // Empty state when no tasks match filter
      ...(filteredTasks.value.length === 0 ? [
        h('div', { class: 'empty-state' }, [
          h('div', { class: 'empty-state-icon' }, ['🧹']),
          h('p', { class: 'empty-state-text' }, ['No tasks for this frequency.'])
        ])
      ] : []),

      // Reset button
      h('div', { class: 'reset-section' }, [
        h('button', {
          class: 'btn-reset',
          onClick: resetToday
        }, ['↺  Reset Today\'s Progress'])
      ]),

      // Toast notification
      ...(toastMsg.value ? [
        h('div', { class: 'toast' }, [toastMsg.value])
      ] : [])
    ]);
  }
});
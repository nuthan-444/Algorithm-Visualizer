import { state, complexityData, pseudoCodes, algoTitles, generateRandom, parseArray, stopAlgorithm, setRunning, resetStats, clearLog, log, updateLegend, renderBars, showWelcome, SPEEDS } from './globals.js';
import * as sorting from './sorting.js';
import * as searching from './searching.js';
import * as dp from './dp.js';
import * as graph from './graph.js';
import * as battle from './battle.js';
import { initQuiz } from './quiz.js';
import { initComplexityChart, runComplexityAnalysis } from './complexity.js';
import { toggleAI, sendAI, aiQuick, autoAIGreet, initAIConfig } from './ai.js';

const SEARCH_ALGOS = ['linear', 'binary', 'jump', 'interpolation', 'exponential'];
const DP_TABS = ['dp-concepts', 'dp-fib', 'dp-lcs', 'dp-mcm', 'dp-knapsack', 'dp-nqueens', 'dp-coloring'];
const GRAPH_TABS = ['g-bfs', 'g-dfs', 'g-topo', 'g-scc', 'g-floyd', 'g-flow'];

let currentMode = 'visualize';
let currentDpTab = 'dp-concepts';
let currentGraphTab = 'g-bfs';

// ---- Mode switching ----
function switchMode(mode) {
  currentMode = mode;
  // Hide all mode sections
  const allSections = ['visualize-section', 'battle-section', 'quiz-section', 'complexity-section', 'art-section', 'dp-section', 'graph-section'];
  allSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Deactivate all mode buttons
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-active'));
  const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
  if (activeBtn) activeBtn.classList.add('mode-active');

  if (mode === 'visualize') {
    document.getElementById('visualize-section').style.display = 'block';
    // Show DP/Graph if a dp/graph algo is selected
    if (DP_TABS.includes(currentDpTab) && state.currentAlgo.startsWith('dp-') === false) {
      // keep hidden unless explicitly navigated
    }
  } else if (mode === 'battle') {
    document.getElementById('battle-section').style.display = 'block';
    battle.initBattle();
  } else if (mode === 'quiz') {
    document.getElementById('quiz-section').style.display = 'block';
  } else if (mode === 'complexity') {
    document.getElementById('complexity-section').style.display = 'block';
    initComplexityChart();
  } else if (mode === 'art') {
    document.getElementById('art-section').style.display = 'block';
    initArtCanvas();
  }
}

// ---- Algorithm selection ----
function selectAlgo(name) {
  state.currentAlgo = name;
  // Update active button
  document.querySelectorAll('.algo-btn[data-algo]').forEach(b => b.classList.toggle('algo-active', b.dataset.algo === name));
  // Update title
  const title = document.getElementById('viz-title');
  if (title) title.textContent = algoTitles[name] || name.toUpperCase();
  // Update complexity panel
  const d = complexityData[name];
  if (d) {
    document.getElementById('c-best').textContent = d.best;
    document.getElementById('c-avg').textContent = d.avg;
    document.getElementById('c-worst').textContent = d.worst;
    document.getElementById('c-space').textContent = d.space;
    document.getElementById('c-stable').textContent = d.stable;
  }
  // Update pseudocode
  const pc = document.getElementById('pseudo-code');
  if (pc) pc.innerHTML = pseudoCodes[name] || '// No pseudocode available';
  // Show/hide search target input
  const isSearch = SEARCH_ALGOS.includes(name);
  const targetGroup = document.getElementById('target-group');
  if (targetGroup) targetGroup.style.display = isSearch ? 'flex' : 'none';
  // Update legend
  updateLegend(isSearch);
  // Switch to visualize mode if not already there
  if (currentMode !== 'visualize') switchMode('visualize');
  // Show visualize section, hide DP/Graph
  document.getElementById('dp-section').style.display = 'none';
  document.getElementById('graph-section').style.display = 'none';
  document.getElementById('visualize-section').style.display = 'block';
  // Re-render bars if we have an array — keeps the visualization visible
  const arr = parseArray();
  if (arr.length >= 2) {
    renderBars(arr);
  }
}

// ---- DP tab selection ----
function selectDpTab(tab) {
  currentDpTab = tab;
  // Update active sidebar button
  document.querySelectorAll('.algo-btn[data-dp-tab]').forEach(b => b.classList.toggle('algo-active', b.dataset.dpTab === tab));
  // Update tab bar
  document.querySelectorAll('#dp-tab-bar .tab-btn').forEach(b => b.classList.toggle('tab-active', b.dataset.tab === tab));
  // Show correct tab content
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  const tabEl = document.getElementById(tab);
  if (tabEl) tabEl.classList.add('active');
  // Show DP section, hide others
  document.getElementById('visualize-section').style.display = 'none';
  document.getElementById('graph-section').style.display = 'none';
  document.getElementById('dp-section').style.display = 'block';
  // Switch mode buttons to none active (or visualize)
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-active'));
  document.getElementById('mode-visualize').classList.add('mode-active');
  // Init canvases as needed
  if (tab === 'dp-concepts') dp.drawFibTree();
  if (tab === 'dp-coloring') dp.initGCCanvas();
}

// ---- Graph tab selection ----
function selectGraphTab(tab) {
  currentGraphTab = tab;
  document.querySelectorAll('.algo-btn[data-graph-tab]').forEach(b => b.classList.toggle('algo-active', b.dataset.graphTab === tab));
  document.querySelectorAll('#graph-tab-bar .tab-btn').forEach(b => b.classList.toggle('tab-active', b.dataset.gtab === tab));
  document.querySelectorAll('.graph-tab-content').forEach(el => el.classList.remove('active'));
  const tabEl = document.getElementById(tab);
  if (tabEl) tabEl.classList.add('active');
  document.getElementById('visualize-section').style.display = 'none';
  document.getElementById('dp-section').style.display = 'none';
  document.getElementById('graph-section').style.display = 'block';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-active'));
  document.getElementById('mode-visualize').classList.add('mode-active');
}

// ---- Run algorithm ----
async function runAlgorithm() {
  if (state.isRunning) return;
  const arr = parseArray();
  if (arr.length < 2) { log('Please enter at least 2 numbers.', 'warn'); return; }
  state.array = arr;
  state.stopFlag = false;
  setRunning(true);
  resetStats();
  clearLog();
  log('Starting ' + (algoTitles[state.currentAlgo] || state.currentAlgo) + '...');
  const a = [...arr];
  try {
    switch (state.currentAlgo) {
      case 'bubble': await sorting.bubbleSort(a); break;
      case 'selection': await sorting.selectionSort(a); break;
      case 'insertion': await sorting.insertionSort(a); break;
      case 'merge': await sorting.mergeSort(a); break;
      case 'quick': await sorting.quickSort(a); break;
      case 'heap': await sorting.heapSort(a); break;
      case 'shell': await sorting.shellSort(a); break;
      case 'linear': await searching.linearSearch(a); break;
      case 'binary': await searching.binarySearch(a); break;
      case 'jump': await searching.jumpSearch(a); break;
      case 'interpolation': await searching.interpolationSearch(a); break;
      case 'exponential': await searching.exponentialSearch(a); break;
      default: log('Unknown algorithm!', 'warn');
    }
  } catch (e) {
    log('Error: ' + e.message, 'warn');
  }
  setRunning(false);
}

// ---- Theme Toggle ----
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const knob = document.getElementById('theme-toggle-knob');
  const root = document.documentElement;

  // Load saved theme (default: dark)
  const savedTheme = localStorage.getItem('algoviz-theme') || 'dark';
  if (savedTheme === 'light') {
    root.setAttribute('data-theme', 'light');
    if (knob) knob.textContent = '☀️';
  } else {
    root.removeAttribute('data-theme');
    if (knob) knob.textContent = '🌙';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      if (isLight) {
        root.removeAttribute('data-theme');
        localStorage.setItem('algoviz-theme', 'dark');
        if (knob) knob.textContent = '🌙';
      } else {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('algoviz-theme', 'light');
        if (knob) knob.textContent = '☀️';
      }
    });
  }
}

// ---- DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme toggle first
  initThemeToggle();
  // Speed slider label
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');
  if (speedSlider && speedLabel) {
    speedSlider.addEventListener('input', () => { speedLabel.textContent = SPEEDS[speedSlider.value] + 'x'; });
  }

  // Sidebar group toggles
  document.querySelectorAll('.algo-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const groupId = header.dataset.group;
      const group = document.getElementById(groupId);
      if (group) group.classList.toggle('open');
    });
  });

  // Algorithm buttons
  document.querySelectorAll('.algo-btn[data-algo]').forEach(btn => {
    btn.addEventListener('click', () => selectAlgo(btn.dataset.algo));
  });

  // DP tab buttons (sidebar)
  document.querySelectorAll('.algo-btn[data-dp-tab]').forEach(btn => {
    btn.addEventListener('click', () => selectDpTab(btn.dataset.dpTab));
  });

  // Graph tab buttons (sidebar)
  document.querySelectorAll('.algo-btn[data-graph-tab]').forEach(btn => {
    btn.addEventListener('click', () => selectGraphTab(btn.dataset.graphTab));
  });

  // DP inline tab bar
  document.querySelectorAll('#dp-tab-bar .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => selectDpTab(btn.dataset.tab));
  });

  // Graph inline tab bar
  document.querySelectorAll('#graph-tab-bar .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => selectGraphTab(btn.dataset.gtab));
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Visualize controls
  document.getElementById('random-btn').addEventListener('click', generateRandom);
  document.getElementById('run-btn').addEventListener('click', runAlgorithm);
  document.getElementById('stop-btn').addEventListener('click', () => stopAlgorithm());

  // Battle controls
  document.getElementById('battle-start-btn')?.addEventListener('click', () => battle.startBattle());
  document.getElementById('battle-reset-btn')?.addEventListener('click', () => battle.resetBattle());

  // Complexity controls
  document.getElementById('complexity-run-btn')?.addEventListener('click', () => runComplexityAnalysis());
  document.getElementById('complexity-chart-btn')?.addEventListener('click', () => initComplexityChart());

  // Art controls
  document.getElementById('art-start-btn')?.addEventListener('click', () => startArt());
  document.getElementById('art-stop-btn')?.addEventListener('click', () => stopArt());
  document.getElementById('art-download-btn')?.addEventListener('click', () => downloadArt());

  // DP controls
  document.getElementById('fib-tree-btn')?.addEventListener('click', () => dp.drawFibTree());
  document.getElementById('fib-run-btn')?.addEventListener('click', () => dp.runFibDP());
  document.getElementById('lcs-run-btn')?.addEventListener('click', () => dp.runLCS());
  document.getElementById('mcm-run-btn')?.addEventListener('click', () => dp.runMCM());
  document.getElementById('ks-run-btn')?.addEventListener('click', () => dp.runKnapsack());
  document.getElementById('nq-run-btn')?.addEventListener('click', () => dp.runNQueens());
  document.getElementById('nq-stop-btn')?.addEventListener('click', () => dp.stopNQ());
  document.getElementById('gc-run-btn')?.addEventListener('click', () => dp.runGraphColoring());
  document.getElementById('gc-stop-btn')?.addEventListener('click', () => dp.stopGC());

  // Graph controls
  document.getElementById('bfs-run-btn')?.addEventListener('click', () => graph.runBFS());
  document.getElementById('dfs-run-btn')?.addEventListener('click', () => graph.runDFS());
  document.getElementById('topo-run-btn')?.addEventListener('click', () => graph.runTopo());
  document.getElementById('scc-run-btn')?.addEventListener('click', () => graph.runSCC());
  document.getElementById('floyd-run-btn')?.addEventListener('click', () => graph.runFloyd());
  document.getElementById('flow-run-btn')?.addEventListener('click', () => graph.runFordFulkerson());

  // AI controls
  document.getElementById('ai-toggle-btn')?.addEventListener('click', (e) => {
    // Don't toggle if clicking the edit button inside the toggle bar
    if (e.target.closest('#ai-edit-config-btn')) return;
    toggleAI();
  });
  document.getElementById('ai-send')?.addEventListener('click', () => sendAI());
  document.getElementById('ai-input')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendAI(); });
  document.getElementById('ai-q1')?.addEventListener('click', () => aiQuick('Explain ' + (algoTitles[state.currentAlgo] || state.currentAlgo) + ' in simple terms.'));
  document.getElementById('ai-q2')?.addEventListener('click', () => aiQuick('What is the best use case for ' + (algoTitles[state.currentAlgo] || state.currentAlgo) + '?'));
  document.getElementById('ai-q3')?.addEventListener('click', () => aiQuick('Compare ' + (algoTitles[state.currentAlgo] || state.currentAlgo) + ' with similar algorithms.'));
  document.getElementById('ai-q4')?.addEventListener('click', () => aiQuick('Explain my visualization results: ' + state.comparisons + ' comparisons, ' + state.swaps + ' swaps.'));

  // AI config panel wiring
  initAIConfig();

  // Hamburger sidebar toggle (mobile)
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('active');
    hamburgerBtn?.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent background scroll on mobile
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    hamburgerBtn?.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburgerBtn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close sidebar when clicking the overlay
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar when any sidebar button is clicked on mobile
  document.querySelectorAll('#sidebar .algo-btn, #sidebar .algo-group-header').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 700) {
        // Small delay so the click action fires first
        setTimeout(closeSidebar, 100);
      }
    });
  });


  // Quiz
  initQuiz();

  // Initialize
  generateRandom();
  selectAlgo('bubble');
  graph.initGraphCanvases();
  dp.drawFibTree();
  autoAIGreet();
});
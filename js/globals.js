// Shared state and utilities — all mutable state wrapped in an object so imports always read current values
export const state = {
  currentAlgo: 'bubble',
  isRunning: false,
  stopFlag: false,
  array: [],
  comparisons: 0,
  swaps: 0,
  stepCount: 0,
  lastLogMessages: []
};

export const complexityData = {
  bubble:        { best: 'O(n)',       avg: 'O(n²)',       worst: 'O(n²)',       space: 'O(1)',      stable: 'Yes' },
  selection:     { best: 'O(n²)',      avg: 'O(n²)',       worst: 'O(n²)',       space: 'O(1)',      stable: 'No'  },
  insertion:     { best: 'O(n)',       avg: 'O(n²)',       worst: 'O(n²)',       space: 'O(1)',      stable: 'Yes' },
  merge:         { best: 'O(n log n)', avg: 'O(n log n)',  worst: 'O(n log n)', space: 'O(n)',      stable: 'Yes' },
  quick:         { best: 'O(n log n)', avg: 'O(n log n)',  worst: 'O(n²)',       space: 'O(log n)', stable: 'No'  },
  heap:          { best: 'O(n log n)', avg: 'O(n log n)',  worst: 'O(n log n)', space: 'O(1)',      stable: 'No'  },
  shell:         { best: 'O(n log n)', avg: 'O(n log²n)',  worst: 'O(n²)',       space: 'O(1)',      stable: 'No'  },
  linear:        { best: 'O(1)',       avg: 'O(n)',        worst: 'O(n)',        space: 'O(1)',      stable: 'Yes' },
  binary:        { best: 'O(1)',       avg: 'O(log n)',    worst: 'O(log n)',   space: 'O(1)',      stable: 'N/A' },
  jump:          { best: 'O(1)',       avg: 'O(√n)',       worst: 'O(√n)',      space: 'O(1)',      stable: 'N/A' },
  interpolation: { best: 'O(1)',       avg: 'O(log log n)',worst: 'O(n)',       space: 'O(1)',      stable: 'N/A' },
  exponential:   { best: 'O(1)',       avg: 'O(log n)',    worst: 'O(log n)',   space: 'O(log n)', stable: 'N/A' },
};

export const pseudoCodes = {
  bubble: `<span class="kw">function</span> <span class="fn">bubbleSort</span>(arr):
  n = arr.length
  <span class="kw">for</span> i = 0 <span class="kw">to</span> n-1:
    <span class="kw">for</span> j = 0 <span class="kw">to</span> n-i-2:
      <span class="kw">if</span> arr[j] > arr[j+1]:
        swap(arr[j], arr[j+1])`,
  selection: `<span class="kw">function</span> <span class="fn">selectionSort</span>(arr):
  <span class="kw">for</span> i = 0 <span class="kw">to</span> n-1:
    minIdx = i
    <span class="kw">for</span> j = i+1 <span class="kw">to</span> n-1:
      <span class="kw">if</span> arr[j] < arr[minIdx]: minIdx = j
    swap(arr[i], arr[minIdx])`,
  insertion: `<span class="kw">function</span> <span class="fn">insertionSort</span>(arr):
  <span class="kw">for</span> i = 1 <span class="kw">to</span> n-1:
    key = arr[i]; j = i-1
    <span class="kw">while</span> j >= 0 <span class="kw">and</span> arr[j] > key:
      arr[j+1] = arr[j]; j--
    arr[j+1] = key`,
  merge: `<span class="kw">function</span> <span class="fn">mergeSort</span>(arr, l, r):
  <span class="kw">if</span> l < r:
    mid = (l+r)/2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)`,
  quick: `<span class="kw">function</span> <span class="fn">quickSort</span>(arr, lo, hi):
  <span class="kw">if</span> lo < hi:
    pivot = arr[hi]
    pi = partition(arr, lo, hi)
    quickSort(arr, lo, pi-1)
    quickSort(arr, pi+1, hi)`,
  heap: `<span class="kw">function</span> <span class="fn">heapSort</span>(arr):
  buildMaxHeap(arr)
  <span class="kw">for</span> i = n-1 <span class="kw">down to</span> 1:
    swap(arr[0], arr[i])
    heapify(arr, 0, i)`,
  shell: `<span class="kw">function</span> <span class="fn">shellSort</span>(arr):
  gap = n/2
  <span class="kw">while</span> gap > 0:
    <span class="kw">for</span> i = gap <span class="kw">to</span> n-1:
      temp=arr[i]; j=i
      <span class="kw">while</span> j>=gap <span class="kw">and</span> arr[j-gap]>temp:
        arr[j]=arr[j-gap]; j-=gap
      arr[j]=temp
    gap = floor(gap/2)`,
  linear: `<span class="kw">function</span> <span class="fn">linearSearch</span>(arr, target):
  <span class="kw">for</span> i = 0 <span class="kw">to</span> n-1:
    <span class="kw">if</span> arr[i] == target: <span class="kw">return</span> i
  <span class="kw">return</span> -1`,
  binary: `<span class="kw">function</span> <span class="fn">binarySearch</span>(arr, target):
  low=0; high=n-1
  <span class="kw">while</span> low<=high:
    mid=(low+high)/2
    <span class="kw">if</span> arr[mid]==target: <span class="kw">return</span> mid
    <span class="kw">if</span> arr[mid]<target: low=mid+1
    <span class="kw">else</span>: high=mid-1
  <span class="kw">return</span> -1`,
  jump: `<span class="kw">function</span> <span class="fn">jumpSearch</span>(arr,target):
  step=√n; prev=0
  <span class="kw">while</span> arr[min(step,n)-1]<target:
    prev=step; step+=√n
  <span class="kw">while</span> arr[prev]<target: prev++
  <span class="kw">if</span> arr[prev]==target: <span class="kw">return</span> prev
  <span class="kw">return</span> -1`,
  interpolation: `<span class="kw">function</span> <span class="fn">interpolationSearch</span>(arr,target):
  pos=low+(target-arr[low])*(high-low)/(arr[high]-arr[low])
  <span class="kw">if</span> arr[pos]==target: <span class="kw">return</span> pos
  <span class="kw">if</span> arr[pos]<target: low=pos+1
  <span class="kw">else</span>: high=pos-1`,
  exponential: `<span class="kw">function</span> <span class="fn">exponentialSearch</span>(arr,target):
  i=1
  <span class="kw">while</span> i<n <span class="kw">and</span> arr[i]<=target: i*=2
  binarySearch(arr, i/2, min(i,n-1), target)`,
};

export const algoTitles = {
  bubble: 'BUBBLE SORT', selection: 'SELECTION SORT', insertion: 'INSERTION SORT',
  merge: 'MERGE SORT', quick: 'QUICK SORT', heap: 'HEAP SORT', shell: 'SHELL SORT',
  linear: 'LINEAR SEARCH', binary: 'BINARY SEARCH', jump: 'JUMP SEARCH',
  interpolation: 'INTERPOLATION SEARCH', exponential: 'EXPONENTIAL SEARCH'
};

// Mapping array from slider index to exact "speed multiple" labels (12 steps)
export const SPEEDS = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Corresponding delays in MS for each speed index
export const DELAYS = [3000, 1500, 1000, 895, 790, 685, 580, 475, 370, 265, 160, 50];

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
export function getSpeedFloat() { return SPEEDS[parseInt(document.getElementById('speed-slider')?.value || 6)] || 5; }
export function getDelay() { return DELAYS[parseInt(document.getElementById('speed-slider')?.value || 6)] || 580; }


export function log(msg, type = '') {
  state.lastLogMessages.push(msg);
  if (state.lastLogMessages.length > 20) state.lastLogMessages.shift();
  const c = document.getElementById('log-entries');
  if (!c) return;
  const e = document.createElement('div');
  e.className = 'log-entry ' + type;
  e.textContent = '> ' + msg;
  c.appendChild(e);
  c.scrollTop = c.scrollHeight;
  while (c.children.length > 80) c.removeChild(c.firstChild);
}

export function clearLog() {
  const c = document.getElementById('log-entries');
  if (c) c.innerHTML = '';
  state.lastLogMessages = [];
}

export function resetStats() {
  state.comparisons = 0; state.swaps = 0; state.stepCount = 0;
  const cmpEl = document.getElementById('stat-cmp');
  const swpEl = document.getElementById('stat-swp');
  if (cmpEl) cmpEl.textContent = '0';
  if (swpEl) swpEl.textContent = '0';
  const stepInfo = document.getElementById('step-info');
  if (stepInfo) stepInfo.style.display = 'none';
}

export function updateStats() {
  const cmpEl = document.getElementById('stat-cmp');
  const swpEl = document.getElementById('stat-swp');
  if (cmpEl) cmpEl.textContent = state.comparisons;
  if (swpEl) swpEl.textContent = state.swaps;
}

export function incCmp() { state.comparisons++; updateStats(); }
export function incSwp() { state.swaps++; updateStats(); }
export function incStep() {
  state.stepCount++;
  const si = document.getElementById('step-info');
  if (si) {
    si.style.display = 'block';
    document.getElementById('step-num').textContent = state.stepCount;
  }
}

export function setRunning(r) {
  state.isRunning = r;
  const runBtn = document.getElementById('run-btn');
  if (runBtn) runBtn.disabled = r;
  const badge = document.getElementById('running-badge');
  if (badge) r ? badge.classList.add('active') : badge.classList.remove('active');
}

export function stopAlgorithm() {
  state.stopFlag = true;
  setRunning(false);
  log('Stopped.', 'warn');
}

export function parseArray() {
  const val = document.getElementById('array-input')?.value || '';
  return val.split(/[\s,]+/).filter(x => x).map(Number).filter(n => !isNaN(n));
}

export function generateRandom() {
  const size = parseInt(document.getElementById('size-select')?.value || 20);
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
  const input = document.getElementById('array-input');
  if (input) input.value = arr.join(',');
  renderBars(arr);
  resetStats();
  // Do NOT call showWelcome() here — renderBars() already hides the welcome screen
}

export function renderBars(arr, states = {}) {
  const c = document.getElementById('bar-container');
  if (!c) return;
  c.style.display = 'flex';
  const sc = document.getElementById('search-container');
  if (sc) sc.style.display = 'none';
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.style.display = 'none';
  const maxVal = Math.max(...arr);
  c.innerHTML = '';
  arr.forEach((val, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';
    wrap.id = 'bw-' + i;
    const bar = document.createElement('div');
    bar.className = 'bar' + (states[i] ? ' ' + states[i] : '');
    bar.id = 'bar-' + i;
    bar.style.height = ((val / maxVal) * 92) + '%';
    const lbl = document.createElement('div');
    lbl.className = 'bar-val';
    lbl.textContent = arr.length <= 25 ? val : '';
    wrap.appendChild(bar);
    wrap.appendChild(lbl);
    c.appendChild(wrap);
  });
}

export function renderSearchCells(arr, states = {}, pointers = {}) {
  const c = document.getElementById('search-container');
  if (!c) return;
  const bc = document.getElementById('bar-container');
  if (bc) bc.style.display = 'none';
  c.style.display = 'flex';
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.style.display = 'none';
  c.innerHTML = '';
  arr.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'search-cell' + (states[i] ? ' ' + states[i] : '');
    cell.id = 'cell-' + i;
    Object.entries(pointers).filter(([, idx]) => idx === i).forEach(([name]) => {
      const a = document.createElement('div');
      a.className = 'pointer-arrow ptr-' + name;
      a.textContent = '▼ ' + name.toUpperCase();
      cell.appendChild(a);
    });
    const s = document.createElement('span');
    s.textContent = val;
    cell.appendChild(s);
    const idx = document.createElement('div');
    idx.className = 'cell-idx';
    idx.textContent = i;
    cell.appendChild(idx);
    c.appendChild(cell);
  });
}

export function animateBar(i, cls) {
  const b = document.getElementById('bar-' + i);
  if (b) b.className = 'bar ' + cls;
}
export function clearBar(i) {
  const b = document.getElementById('bar-' + i);
  if (b) b.className = 'bar';
}
export function rebuildBar(idx, arr) {
  const bar = document.getElementById('bar-' + idx);
  const wrap = document.getElementById('bw-' + idx);
  if (!bar || !wrap) return;
  const maxVal = Math.max(...arr);
  if (typeof gsap !== 'undefined') {
    const dur = 0.14 * (5 / getSpeedFloat());
    gsap.to(bar, { height: ((arr[idx] / maxVal) * 92) + '%', duration: dur, ease: 'power2.out' });
  } else {
    bar.style.height = ((arr[idx] / maxVal) * 92) + '%';
  }
  const lbl = wrap.querySelector('.bar-val');
  if (lbl && arr.length <= 25) lbl.textContent = arr[idx];
}
export async function animateSwap(i, j, arr) {
  const maxVal = Math.max(...arr);
  const bi = document.getElementById('bar-' + i);
  const bj = document.getElementById('bar-' + j);
  if (!bi || !bj) return;
  if (typeof gsap !== 'undefined') {
    const dur = 0.16 * (5 / getSpeedFloat());
    gsap.to(bi, { height: ((arr[i] / maxVal) * 92) + '%', duration: dur, ease: 'power2.out' });
    gsap.to(bj, { height: ((arr[j] / maxVal) * 92) + '%', duration: dur, ease: 'power2.out' });
  } else {
    bi.style.height = ((arr[i] / maxVal) * 92) + '%';
    bj.style.height = ((arr[j] / maxVal) * 92) + '%';
  }
  const wi = document.getElementById('bw-' + i);
  const wj = document.getElementById('bw-' + j);
  if (wi) { const l = wi.querySelector('.bar-val'); if (l && arr.length <= 25) l.textContent = arr[i]; }
  if (wj) { const l = wj.querySelector('.bar-val'); if (l && arr.length <= 25) l.textContent = arr[j]; }
  
  // Wait proportional to the GSAP animation plus a tiny buffer, scaled by speed
  const waitMs = 160 * (5 / getSpeedFloat());
  return new Promise(r => setTimeout(r, waitMs));
}
export async function celebrateAll(n) {
  const dur = 0.28 * (5 / getSpeedFloat());
  for (let i = 0; i < n; i++) {
    const b = document.getElementById('bar-' + i);
    if (b && typeof gsap !== 'undefined') {
      gsap.fromTo(b, { scaleY: 1.08 }, { scaleY: 1, duration: dur, delay: i * .025, ease: 'elastic.out(1,0.5)', transformOrigin: 'bottom center' });
    }
  }
  await sleep(n * 25 + (dur * 1000 + 70));
}
export function showWelcome() {
  const welcome = document.getElementById('welcome');
  const barContainer = document.getElementById('bar-container');
  const searchContainer = document.getElementById('search-container');
  if (welcome) welcome.style.display = 'flex';
  if (barContainer) barContainer.style.display = 'none';
  if (searchContainer) searchContainer.style.display = 'none';
}
export function updateLegend(isSearch) {
  const l = document.getElementById('legend');
  if (!l) return;
  if (isSearch) {
    l.innerHTML = `<div class="legend-item"><div class="legend-dot" style="background:var(--bar-default)"></div>Default</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-compare)"></div>Checking</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--accent4)"></div>Mid</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-found)"></div>Found</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--muted)"></div>Eliminated</div>`;
  } else {
    l.innerHTML = `<div class="legend-item"><div class="legend-dot" style="background:var(--bar-default)"></div>Default</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-compare)"></div>Comparing</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-swap)"></div>Swapping</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-sorted)"></div>Sorted</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-pivot)"></div>Pivot</div>
      <div class="legend-item"><div class="legend-dot" style="background:var(--bar-found)"></div>Found</div>`;
  }
}
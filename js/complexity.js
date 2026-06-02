import { sleep } from './globals.js';

let complexityChart = null;
const CHART_ALGOS = {
  bubble: { label: 'Bubble Sort', color: '#ff6b35', fn: n => n * n },
  selection: { label: 'Selection Sort', color: '#bf5fff', fn: n => n * n },
  insertion: { label: 'Insertion Sort', color: '#ffd700', fn: n => n * n * 0.5 },
  merge: { label: 'Merge Sort', color: '#00d4ff', fn: n => n * Math.log2(n) },
  quick: { label: 'Quick Sort', color: '#39ff14', fn: n => n * Math.log2(n) * 1.1 },
  heap: { label: 'Heap Sort', color: '#ff69b4', fn: n => n * Math.log2(n) * 1.3 },
};

async function countComparisons(algo, arr) {
  let c = 0;
  const n = arr.length;
  if (algo === 'bubble') {
    for (let i = 0; i < n - 1; i++)
      for (let j = 0; j < n - i - 1; j++) {
        c++;
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let mi = i;
      for (let j = i + 1; j < n; j++) { c++; if (arr[j] < arr[mi]) mi = j; }
      [arr[i], arr[mi]] = [arr[mi], arr[i]];
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n; i++) {
      const key = arr[i]; let j = i - 1;
      while (j >= 0 && arr[j] > key) { c++; arr[j + 1] = arr[j]; j--; }
      c++; arr[j + 1] = key;
    }
  } else if (algo === 'merge') {
    function mh(a, l, r) {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      mh(a, l, m); mh(a, m + 1, r);
      const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) {
        c++;
        if (L[i] <= R[j]) a[k++] = L[i++];
        else a[k++] = R[j++];
      }
      while (i < L.length) a[k++] = L[i++];
      while (j < R.length) a[k++] = R[j++];
    }
    mh(arr, 0, n - 1);
  } else if (algo === 'quick') {
    function qh(a, lo, hi) {
      if (lo >= hi) return;
      const pv = a[hi];
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        c++;
        if (a[j] <= pv) { i++; [a[i], a[j]] = [a[j], a[i]]; }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      qh(a, lo, i); qh(a, i + 2, hi);
    }
    qh(arr, 0, n - 1);
  } else if (algo === 'heap') {
    function hfy(a, sz, i) {
      let lg = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < sz) { c++; if (a[l] > a[lg]) lg = l; }
      if (r < sz) { c++; if (a[r] > a[lg]) lg = r; }
      if (lg !== i) { [a[i], a[lg]] = [a[lg], a[i]]; hfy(a, sz, lg); }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) hfy(arr, n, i);
    for (let i = n - 1; i > 0; i--) { [arr[0], arr[i]] = [arr[i], arr[0]]; hfy(arr, i, 0); }
  }
  return c;
}

export function initComplexityChart() {
  const canvas = document.getElementById('complexity-chart-canvas');
  if (!canvas) return;
  if (complexityChart) complexityChart.destroy();
  const sizes = [5, 10, 20, 30, 50, 75, 100, 150, 200];
  const datasets = [];
  document.querySelectorAll('#chart-checks input:checked').forEach(cb => {
    const a = CHART_ALGOS[cb.value];
    if (!a) return;
    datasets.push({
      label: a.label,
      data: sizes.map(n => ({ x: n, y: Math.round(a.fn(n)) })),
      borderColor: a.color,
      backgroundColor: a.color + '33',
      fill: false,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 7
    });
  });
  complexityChart = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeInOutQuart' },
      plugins: {
        legend: { labels: { color: '#c9d5e0', font: { family: 'JetBrains Mono', size: 11 } } }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Array Size (n)', color: '#5a7080', font: { family: 'JetBrains Mono' } }, ticks: { color: '#5a7080' }, grid: { color: 'rgba(30,45,61,.6)' } },
        y: { title: { display: true, text: 'Comparisons (approx)', color: '#5a7080', font: { family: 'JetBrains Mono' } }, ticks: { color: '#5a7080' }, grid: { color: 'rgba(30,45,61,.6)' } }
      }
    }
  });
}

export async function runComplexityAnalysis() {
  const info = document.getElementById('chart-info');
  if (info) info.textContent = 'Running analysis... watch the curves grow!';
  const canvas = document.getElementById('complexity-chart-canvas');
  if (!canvas) return;
  if (complexityChart) complexityChart.destroy();
  const sizes = [5, 10, 15, 20, 30, 40, 50, 70, 100, 150, 200];
  const selectedAlgos = [];
  document.querySelectorAll('#chart-checks input:checked').forEach(cb => {
    const a = CHART_ALGOS[cb.value];
    if (a) selectedAlgos.push({ key: cb.value, ...a });
  });
  if (selectedAlgos.length === 0) {
    if (info) info.textContent = 'Select at least one algorithm!';
    return;
  }
  const datasets = selectedAlgos.map(a => ({
    label: a.label,
    data: [],
    borderColor: a.color,
    backgroundColor: a.color + '22',
    fill: false,
    tension: 0.4,
    pointRadius: 4,
    pointHoverRadius: 8,
    borderWidth: 2.5
  }));
  complexityChart = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { labels: { color: '#c9d5e0', font: { family: 'JetBrains Mono', size: 11 } } }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Array Size (n)', color: '#5a7080', font: { family: 'JetBrains Mono' } }, ticks: { color: '#5a7080' }, grid: { color: 'rgba(30,45,61,.5)' } },
        y: { title: { display: true, text: 'Comparisons', color: '#5a7080', font: { family: 'JetBrains Mono' } }, ticks: { color: '#5a7080' }, grid: { color: 'rgba(30,45,61,.5)' } }
      }
    }
  });
  for (const size of sizes) {
    for (let di = 0; di < selectedAlgos.length; di++) {
      const a = selectedAlgos[di];
      const arr = Array.from({ length: size }, () => Math.floor(Math.random() * size) + 1);
      const cmpCount = await countComparisons(a.key, [...arr]);
      datasets[di].data.push({ x: size, y: cmpCount });
    }
    complexityChart.update();
    if (info) info.textContent = 'Analyzing n=' + size + '... watch the O(n²) vs O(n log n) curves diverge!';
    await sleep(120);
  }
  if (info) info.textContent = 'Analysis complete! Notice how O(n²) algorithms explode while O(n log n) stay efficient at large sizes. This is why Merge/Quick Sort dominate real-world usage.';
}
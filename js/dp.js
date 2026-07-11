import { sleep, log } from './globals.js';

// Fibonacci Tree Drawing (Concepts Tab)
export function drawFibTree() {
  const n = parseInt(document.getElementById('fib-tree-n')?.value || 6);
  const canvas = document.getElementById('fib-tree-canvas');
  if (!canvas) return;
  const W = canvas.parentElement?.offsetWidth || 700;
  canvas.width = W;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, canvas.height);
  const calls = {};
  function countCalls(k) { if (k <= 1) return; calls[k] = (calls[k] || 0) + 1; countCalls(k - 1); countCalls(k - 2); }
  countCalls(n);
  function drawNode(k, x, y, spread) {
    const r = 20;
    const isDup = (calls[k] || 0) > 0;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isDup ? 'rgba(191,95,255,0.25)' : 'rgba(0,212,255,0.15)'; ctx.fill();
    ctx.strokeStyle = isDup ? '#bf5fff' : '#00d4ff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = isDup ? '#bf5fff' : '#00d4ff';
    ctx.font = `bold 13px JetBrains Mono,monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('f(' + k + ')', x, y);
    if (k <= 1) return;
    const newY = y + 56, ns = spread * 0.52;
    ctx.beginPath(); ctx.moveTo(x - r * 0.7, y + r * 0.7); ctx.lineTo(x - spread + r * 0.7, newY - r * 0.7);
    ctx.strokeStyle = 'rgba(0,212,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    drawNode(k - 1, x - spread, newY, ns);
    ctx.beginPath(); ctx.moveTo(x + r * 0.7, y + r * 0.7); ctx.lineTo(x + spread * 0.4 - r * 0.7, newY - r * 0.7);
    ctx.strokeStyle = 'rgba(191,95,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    drawNode(k - 2, x + spread * 0.4, newY, ns * 0.7);
  }
  drawNode(n, W / 2, 30, W * 0.28);
  ctx.font = '11px JetBrains Mono,monospace'; ctx.textAlign = 'left';
  ctx.fillStyle = '#bf5fff'; ctx.fillText('● Repeated subproblem', 12, canvas.height - 12);
  ctx.fillStyle = '#00d4ff'; ctx.fillText('● Unique call', W / 2, canvas.height - 12);
}

// Fibonacci DP Table
export async function runFibDP() {
  const n = parseInt(document.getElementById('fib-n')?.value || 10);
  const t = document.getElementById('fib-table');
  const info = document.getElementById('fib-info');
  if (!t || !info) return;
  t.innerHTML = '';
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; if (n > 0) dp[1] = 1;
  let html = '<thead><tr><th>Index</th>';
  for (let i = 0; i <= n; i++) html += '<th>' + i + '</th>';
  html += '</tr></thead><tbody><tr id="fib-row"><td style="color:var(--accent4)">fib(i)</td>';
  for (let i = 0; i <= n; i++) html += '<td>—</td>';
  html += '</tr></tbody>';
  t.innerHTML = html;
  const row = document.getElementById('fib-row');
  const getCells = () => row.querySelectorAll('td');
  const d = Math.max(180, 600 - n * 30);
  for (let i = 0; i <= n; i++) {
    if (i >= 2) dp[i] = dp[i - 1] + dp[i - 2];
    const cells = getCells();
    cells.forEach(c => c.classList.remove('active-cell'));
    cells[i + 1].classList.add('active-cell');
    cells[i + 1].textContent = dp[i];
    if (i > 0) cells[i].classList.add('done-cell');
    info.innerHTML = '<strong>dp[' + i + '] = ' + (i >= 2 ? 'dp[' + (i - 1) + '] + dp[' + (i - 2) + '] = ' + dp[i - 1] + ' + ' + dp[i - 2] + ' = ' : 'base case = ') + '</strong><span class="acc">' + dp[i] + '</span>';
    await sleep(d);
  }
  const cells = getCells();
  cells.forEach(c => { c.classList.remove('active-cell'); if (c.textContent !== '—' && c.textContent !== 'fib(i)') c.classList.add('done-cell'); });
  info.innerHTML = '<strong>Done!</strong> fib(' + n + ') = <span class="acc">' + dp[n] + '</span>';
}

// LCS
export async function runLCS() {
  const s1 = document.getElementById('lcs-s1')?.value.toUpperCase() || 'ABCBDAB';
  const s2 = document.getElementById('lcs-s2')?.value.toUpperCase() || 'BDCAB';
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const t = document.getElementById('lcs-table');
  const info = document.getElementById('lcs-info');
  if (!t || !info) return;
  let html = '<thead><tr><th></th><th>ε</th>';
  for (let c of s2) html += '<th>' + c + '</th>';
  html += '</tr></thead><tbody>';
  html += '<tr><th>ε</th>' + Array(n + 1).fill('<td class="done-cell">0</td>').join('') + '</tr>';
  for (let i = 1; i <= m; i++) {
    html += '<tr><th>' + s1[i - 1] + '</th>' + Array(n + 1).fill('<td>—</td>').join('') + '</tr>';
  }
  html += '</tbody>';
  t.innerHTML = html;
  const rows = t.querySelectorAll('tr');
  const getCell = (i, j) => rows[i + 1].querySelectorAll('td')[j];
  const d = Math.max(60, 350 - m * n * 2);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      t.querySelectorAll('.active-cell').forEach(c => c.classList.remove('active-cell'));
      const cell = getCell(i, j);
      cell.textContent = dp[i][j];
      cell.classList.add('active-cell');
      if (s1[i - 1] === s2[j - 1]) cell.classList.add('highlight-cell');
      info.innerHTML = `<strong>dp[${i}][${j}]</strong>: s1[${i}]='${s1[i - 1]}' ${s1[i - 1] === s2[j - 1] ? '==' : '≠'} s2[${j}]='${s2[j - 1]}' → <span class="acc">${dp[i][j]}</span>`;
      await sleep(d);
      cell.classList.remove('active-cell');
      cell.classList.add('done-cell');
    }
  }
  let lcs = '', i = m, j = n;
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) { lcs = s1[i - 1] + lcs; i--; j--; }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  info.innerHTML = '<strong>LCS length: <span class="acc">' + dp[m][n] + '</span></strong>  |  LCS string: <span style="color:var(--accent4)">' + lcs + '</span>';
}

// Matrix Chain Multiplication
export async function runMCM() {
  const dims = (document.getElementById('mcm-dims')?.value || '10,30,5,60,20').split(',').map(Number).filter(n => !isNaN(n) && n > 0);
  if (dims.length < 3) {
    const info = document.getElementById('mcm-info');
    if (info) info.textContent = 'Need at least 3 dimensions (for 2 matrices).';
    return;
  }
  const n = dims.length - 1;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  const t = document.getElementById('mcm-table');
  const info = document.getElementById('mcm-info');
  if (!t || !info) return;
  const names = Array.from({ length: n }, (_, i) => 'M' + (i + 1));
  let html = '<thead><tr><th></th>' + names.map(n => '<th>' + n + '</th>').join('') + '</tr></thead><tbody>';
  for (let i = 0; i < n; i++) {
    html += '<tr><th>' + names[i] + '</th>' + Array(n).fill('<td>—</td>').join('') + '</tr>';
  }
  html += '</tbody>';
  t.innerHTML = html;
  const rows = t.querySelectorAll('tr');
  const getCell = (i, j) => rows[i + 1].querySelectorAll('td')[j];
  const d = 300;
  for (let i = 0; i < n; i++) { dp[i][i] = 0; getCell(i, i).textContent = '0'; getCell(i, i).classList.add('done-cell'); }
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) dp[i][j] = cost;
      }
      t.querySelectorAll('.active-cell').forEach(c => c.classList.remove('active-cell'));
      const cell = getCell(i, j);
      cell.textContent = dp[i][j];
      cell.classList.add('active-cell');
      info.innerHTML = `<strong>dp[${i + 1}][${j + 1}]</strong> = min cost to multiply M${i + 1}..M${j + 1} = <span class="acc">${dp[i][j]}</span> scalar multiplications`;
      await sleep(d);
      cell.classList.remove('active-cell');
      cell.classList.add('done-cell');
    }
  }
  info.innerHTML = '<strong>Minimum cost:</strong> <span class="acc">' + dp[0][n - 1] + '</span> scalar multiplications for M1..M' + n;
}

// 0/1 Knapsack
export async function runKnapsack() {
  const W = Math.max(1, parseInt(document.getElementById('ks-cap')?.value || 10));
  const info = document.getElementById('ks-info');

  // Parse items from input field: "w,v w,v ..."
  const rawItems = (document.getElementById('ks-items')?.value || '2,6 2,10 3,12 5,13 7,15').trim();
  const items = rawItems.split(/\s+/).map(pair => {
    const [w, v] = pair.split(',').map(Number);
    return { w, v };
  }).filter(it => !isNaN(it.w) && !isNaN(it.v) && it.w > 0 && it.v > 0);

  if (items.length === 0) {
    if (info) info.textContent = '⚠ No valid items found. Format: w,v w,v (e.g. 2,6 3,10)';
    return;
  }

  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const t = document.getElementById('ks-table');
  if (!t || !info) return;
  let html = '<thead><tr><th>Item\\W</th>';
  for (let i = 0; i <= W; i++) html += '<th>' + i + '</th>';
  html += '</tr></thead><tbody>';
  html += '<tr><th>0 (none)</th>' + Array(W + 1).fill('<td class="done-cell">0</td>').join('') + '</tr>';
  for (let i = 1; i <= n; i++) {
    html += '<tr><th>' + i + ' (w=' + items[i - 1].w + ',v=' + items[i - 1].v + ')</th>' + Array(W + 1).fill('<td>—</td>').join('') + '</tr>';
  }
  html += '</tbody>';
  t.innerHTML = html;
  const rows = t.querySelectorAll('tr');
  const getCell = (i, j) => rows[i + 1].querySelectorAll('td')[j];
  const d = Math.max(40, 300 - W * 10);
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      const item = items[i - 1];
      if (item.w > w) dp[i][w] = dp[i - 1][w];
      else dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - item.w] + item.v);
      t.querySelectorAll('.active-cell').forEach(c => c.classList.remove('active-cell'));
      const cell = getCell(i, w);
      cell.textContent = dp[i][w];
      cell.classList.add('active-cell');
      info.innerHTML = `<strong>Item ${i}</strong> (w=${item.w},v=${item.v}) cap=${w}: dp=${dp[i][w]}`;
      await sleep(d);
      cell.classList.remove('active-cell');
      cell.classList.add('done-cell');
    }
  }
  info.innerHTML = '<strong>Max Value:</strong> <span class="acc">' + dp[n][W] + '</span> with capacity ' + W;
}


// N-Queens Backtracking
let nqStop = false;
export function stopNQ() { nqStop = true; }
function isConflict(queens, row, col) {
  for (let r = 0; r < row; r++) {
    if (queens[r] === col) return true;
    if (Math.abs(queens[r] - col) === Math.abs(r - row)) return true;
  }
  return false;
}
function buildBoard(n, queens, tryRow, tryCol, conflict) {
  const board = document.getElementById('nq-board');
  if (!board) return;
  board.innerHTML = '';
  for (let r = 0; r < n; r++) {
    const row = document.createElement('div'); row.className = 'nq-row';
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      const light = (r + c) % 2 === 0;
      cell.className = 'nq-cell ' + (light ? 'nq-light' : 'nq-dark');
      if (queens[r] === c) { cell.textContent = '♛'; cell.classList.add('nq-queen'); }
      else if (r === tryRow && c === tryCol) { cell.classList.add('nq-try'); }
      else if (conflict && isConflict(queens, r, c)) { cell.classList.add('nq-conflict'); }
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}
export async function runNQueens() {
  const n = parseInt(document.getElementById('nq-n')?.value || 6);
  nqStop = false;
  const info = document.getElementById('nq-info');
  if (info) info.textContent = 'Solving ' + n + '-Queens...';
  const queens = new Array(n).fill(-1);
  const d = Math.max(60, 500 - n * 30);
  async function solve(row) {
    if (nqStop) return false;
    if (row === n) { buildBoard(n, queens, [], [], false); return true; }
    for (let col = 0; col < n; col++) {
      if (nqStop) return false;
      if (!isConflict(queens, row, col)) {
        queens[row] = col; buildBoard(n, queens, row, col, false);
        if (info) info.textContent = 'Placing queen at row ' + row + ', col ' + col;
        await sleep(d);
        if (await solve(row + 1)) return true;
        queens[row] = -1; buildBoard(n, queens, row, col, true);
        if (info) info.textContent = 'Backtrack from row ' + row + ', col ' + col;
        await sleep(d * 0.7);
      }
    }
    return false;
  }
  const solved = await solve(0);
  if (info) info.innerHTML = solved ? '<strong style="color:var(--accent3)">Solved! ' + n + '-Queens placed successfully.</strong>' : '<span style="color:var(--accent2)">No solution found.</span>';
}

// Graph Coloring Backtracking
let gcStop = false;
export function stopGC() { gcStop = true; }
const GC_COLORS_LIST = ['#ff6b35', '#00d4ff', '#39ff14', '#bf5fff', '#ffd700'];
const gcAdj = [[1, 2, 3], [0, 4, 5], [0, 4, 6], [0, 5, 6], [1, 2], [1, 3], [2, 3]];
const gcPos = [[260, 50], [80, 130], [440, 130], [150, 260], [380, 260], [80, 260], [440, 260]];
export function initGCCanvas() {
  const canvas = document.getElementById('gc-canvas');
  if (!canvas) return;
  const W = canvas.parentElement?.offsetWidth || 520;
  canvas.width = W;
  drawGCGraph(new Array(gcAdj.length).fill(-1));
}
function drawGCGraph(colors) {
  const canvas = document.getElementById('gc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = 300;
  ctx.clearRect(0, 0, W, H);
  const scaleX = W / 520;
  for (let u = 0; u < gcAdj.length; u++) {
    for (const v of gcAdj[u]) {
      if (v > u) {
        ctx.beginPath();
        ctx.moveTo(gcPos[u][0] * scaleX, gcPos[u][1]);
        ctx.lineTo(gcPos[v][0] * scaleX, gcPos[v][1]);
        ctx.strokeStyle = 'rgba(90,112,128,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  for (let i = 0; i < gcAdj.length; i++) {
    const x = gcPos[i][0] * scaleX, y = gcPos[i][1];
    const col = colors[i] >= 0 ? GC_COLORS_LIST[colors[i]] : '#1a3a5c';
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = colors[i] >= 0 ? col : '#3a4a5c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px JetBrains Mono,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(i, x, y);
    if (colors[i] >= 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '10px JetBrains Mono,monospace';
      ctx.fillText('C' + (colors[i] + 1), x, y + 14);
    }
  }
}
function gcIsSafe(colors, node, color) {
  for (const nb of gcAdj[node]) if (colors[nb] === color) return false;
  return true;
}
export async function runGraphColoring() {
  const numColors = parseInt(document.getElementById('gc-colors')?.value || 3);
  gcStop = false;
  const colors = new Array(gcAdj.length).fill(-1);
  const info = document.getElementById('gc-info');
  if (info) info.textContent = 'Graph coloring with ' + numColors + ' colors...';
  async function solve(node) {
    if (gcStop) return false;
    if (node === gcAdj.length) return true;
    for (let c = 0; c < numColors; c++) {
      if (gcStop) return false;
      if (gcIsSafe(colors, node, c)) {
        colors[node] = c; drawGCGraph([...colors]);
        if (info) info.innerHTML = 'Trying node ' + node + ' with <span style="color:' + GC_COLORS_LIST[c] + '">Color ' + (c + 1) + '</span>';
        await sleep(400);
        if (await solve(node + 1)) return true;
        colors[node] = -1; drawGCGraph([...colors]);
        if (info) info.innerHTML = 'Backtrack node ' + node;
        await sleep(250);
      }
    }
    return false;
  }
  const ok = await solve(0);
  drawGCGraph([...colors]);
  if (info) info.innerHTML = ok ? '<strong style="color:var(--accent3)">Solved with ' + numColors + ' colors!</strong>' : '<span style="color:var(--accent2)">Not colorable with ' + numColors + ' colors.</span>';
}
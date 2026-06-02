import { sleep, log } from './globals.js';

// Shared graph data
const GRAPH_NODES = 7;
const GRAPH_ADJ_UD = [[1, 2], [0, 3, 4], [0, 4, 5], [1, 6], [1, 2, 6], [2], [3, 4]];
const GRAPH_POS_UD = [[300, 50], [140, 140], [460, 140], [80, 260], [300, 240], [540, 240], [300, 360]];

const DAG_ADJ = [[1, 2], [3], [3, 4], [5], [5], [], []];
const DAG_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const DAG_POS = [[80, 50], [40, 160], [200, 160], [80, 280], [300, 280], [170, 370], [380, 370]];

const SCC_ADJ = [[1], [2], [0, 3], [4], [5], [3], [7], [6]];
const SCC_POS = [[60, 70], [180, 70], [300, 70], [420, 70], [420, 200], [300, 200], [180, 200], [60, 200]];

const NODE_COLORS = { default: '#1a3a5c', visited: 'rgba(0,212,255,0.25)', current: 'rgba(255,107,53,0.3)', done: 'rgba(57,255,20,0.2)', source: 'rgba(191,95,255,0.25)', sink: 'rgba(255,215,0,0.2)' };
const NODE_STROKES = { default: '#3a4a5c', visited: '#00d4ff', current: '#ff6b35', done: '#39ff14', source: '#bf5fff', sink: '#ffd700' };

// Floyd-Warshall
const FW_N = 5;
const FW_INF = 999;
const FW_GRAPH = [
  [0, 3, FW_INF, 7, FW_INF],
  [8, 0, 2, FW_INF, FW_INF],
  [5, FW_INF, 0, 1, FW_INF],
  [2, FW_INF, FW_INF, 0, 4],
  [FW_INF, FW_INF, FW_INF, 1, 0]
];

// Ford-Fulkerson
const FF_N = 6;
const FF_CAP = [
  [0, 16, 13, 0, 0, 0],
  [0, 0, 10, 12, 0, 0],
  [0, 4, 0, 0, 14, 0],
  [0, 0, 9, 0, 0, 20],
  [0, 0, 0, 7, 0, 4],
  [0, 0, 0, 0, 0, 0]
];
const FF_POS = [[60, 150], [180, 60], [180, 240], [320, 60], [320, 240], [440, 150]];
const FF_LABELS = ['S', '1', '2', '3', '4', 'T'];

let ffFlow = [];

function drawGraphBase(ctx, W, H, positions, adj, nodeStates, edgeHighlight, directed = false, labels = null) {
  ctx.clearRect(0, 0, W, H);
  const scX = W / 600, scY = H / 400;
  const scP = pos => [pos[0] * scX, pos[1] * scY + (H - 400 * scY) / 2 + 10];
  for (let u = 0; u < adj.length; u++) {
    for (const v of adj[u]) {
      if (!directed && v < u) continue;
      const [x1, y1] = scP(positions[u]);
      const [x2, y2] = scP(positions[v]);
      const isHL = edgeHighlight.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u && !directed));
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHL ? '#00d4ff' : 'rgba(90,112,128,0.4)';
      ctx.lineWidth = isHL ? 2.5 : 1.5;
      ctx.stroke();
      if (directed) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const r = 22;
        const ax = x2 - r * Math.cos(angle), ay = y2 - r * Math.sin(angle);
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fillStyle = isHL ? '#00d4ff' : 'rgba(90,112,128,0.4)'; ctx.fill();
      }
    }
  }
  for (let i = 0; i < positions.length; i++) {
    const [x, y] = scP(positions[i]);
    const st = nodeStates[i] || 'default';
    ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = NODE_COLORS[st] || '#1a3a5c'; ctx.fill();
    ctx.strokeStyle = NODE_STROKES[st] || '#3a4a5c'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = NODE_STROKES[st] || '#c9d5e0';
    ctx.font = 'bold 13px JetBrains Mono,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(labels ? labels[i] : i, x, y);
  }
}

function drawGraphUD(canvasId, states, edgeHL, statusText) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  drawGraphBase(ctx, W, H, GRAPH_POS_UD, GRAPH_ADJ_UD, states, edgeHL, false);
  if (statusText) {
    ctx.fillStyle = 'rgba(90,112,128,0.8)';
    ctx.font = '12px JetBrains Mono,monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(statusText, 10, 10);
  }
}

function drawDAG(canvasId, states, edgeHL) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  drawGraphBase(ctx, W, H, DAG_POS, DAG_ADJ, states, edgeHL, true, DAG_LABELS);
}

function drawSCCGraph(canvasId, states, edgeHL, sccColors) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const scX = W / 500, scY = H / 320;
  const scP = pos => [pos[0] * scX + 20, pos[1] * scY + 20];
  const compCols = ['rgba(0,212,255,0.25)', 'rgba(57,255,20,0.2)', 'rgba(191,95,255,0.2)', 'rgba(255,215,0,0.15)', 'rgba(255,107,53,0.2)'];
  const compStr = ['#00d4ff', '#39ff14', '#bf5fff', '#ffd700', '#ff6b35'];
  ctx.clearRect(0, 0, W, H);
  for (let u = 0; u < SCC_ADJ.length; u++) {
    for (const v of SCC_ADJ[u]) {
      const [x1, y1] = scP(SCC_POS[u]);
      const [x2, y2] = scP(SCC_POS[v]);
      const isHL = edgeHL.some(e => e[0] === u && e[1] === v);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = isHL ? '#00d4ff' : 'rgba(90,112,128,0.4)';
      ctx.lineWidth = isHL ? 2.5 : 1.5; ctx.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1), r = 20;
      const ax = x2 - r * Math.cos(angle), ay = y2 - r * Math.sin(angle);
      ctx.beginPath(); ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
      ctx.closePath(); ctx.fillStyle = isHL ? '#00d4ff' : 'rgba(90,112,128,0.35)'; ctx.fill();
    }
  }
  for (let i = 0; i < SCC_POS.length; i++) {
    const [x, y] = scP(SCC_POS[i]);
    const comp = sccColors && sccColors[i];
    ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = comp !== undefined ? compCols[comp % 5] : (NODE_COLORS[states[i]] || '#1a3a5c');
    ctx.fill();
    ctx.strokeStyle = comp !== undefined ? compStr[comp % 5] : (NODE_STROKES[states[i]] || '#3a4a5c');
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = comp !== undefined ? compStr[comp % 5] : (NODE_STROKES[states[i]] || '#c9d5e0');
    ctx.font = 'bold 12px JetBrains Mono,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(i, x, y);
  }
}

function drawFlowGraph(edgeHL) {
  const canvas = document.getElementById('flow-canvas');
  if (!canvas) return;
  const W = canvas.parentElement?.offsetWidth || 600;
  canvas.width = W;
  const ctx = canvas.getContext('2d');
  const H = 340;
  ctx.clearRect(0, 0, W, H);
  const scX = W / 520, scY = H / 330;
  const scP = pos => [pos[0] * scX + 10, pos[1] * scY + 20];
  for (let u = 0; u < FF_N; u++) {
    for (let v = 0; v < FF_N; v++) {
      if (FF_CAP[u][v] > 0) {
        const [x1, y1] = scP(FF_POS[u]);
        const [x2, y2] = scP(FF_POS[v]);
        const isHL = edgeHL.some(e => e[0] === u && e[1] === v);
        const cap = FF_CAP[u][v], fl = ffFlow[u][v] || 0;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = isHL ? '#00d4ff' : (fl > 0 ? 'rgba(57,255,20,0.5)' : 'rgba(90,112,128,0.4)');
        ctx.lineWidth = isHL ? 3 : (fl > 0 ? 2.5 : 1.5); ctx.stroke();
        const angle = Math.atan2(y2 - y1, x2 - x1), r = 22;
        const ax = x2 - r * Math.cos(angle), ay = y2 - r * Math.sin(angle);
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 9 * Math.cos(angle - 0.4), ay - 9 * Math.sin(angle - 0.4));
        ctx.lineTo(ax - 9 * Math.cos(angle + 0.4), ay - 9 * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fillStyle = isHL ? '#00d4ff' : (fl > 0 ? 'rgba(57,255,20,0.6)' : 'rgba(90,112,128,0.4)'); ctx.fill();
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.fillStyle = isHL ? '#fff' : '#ffd700';
        ctx.font = 'bold 11px JetBrains Mono,monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(fl + '/' + cap, mx, my - 10);
      }
    }
  }
  for (let i = 0; i < FF_N; i++) {
    const [x, y] = scP(FF_POS[i]);
    const isS = i === 0, isT = i === FF_N - 1;
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = isS ? 'rgba(191,95,255,0.25)' : isT ? 'rgba(255,215,0,0.2)' : 'rgba(0,212,255,0.1)';
    ctx.fill();
    ctx.strokeStyle = isS ? '#bf5fff' : isT ? '#ffd700' : '#00d4ff';
    ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = isS ? '#bf5fff' : isT ? '#ffd700' : '#00d4ff';
    ctx.font = 'bold 13px JetBrains Mono,monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(FF_LABELS[i], x, y);
  }
}

function initFlow() {
  ffFlow = FF_CAP.map(r => r.map(() => 0));
}

function ffBFS(source, sink, parent) {
  const visited = new Array(FF_N).fill(false);
  const q = [source];
  visited[source] = true;
  while (q.length) {
    const u = q.shift();
    for (let v = 0; v < FF_N; v++) {
      if (!visited[v] && FF_CAP[u][v] - ffFlow[u][v] > 0) {
        parent[v] = u;
        visited[v] = true;
        if (v === sink) return true;
        q.push(v);
      }
    }
  }
  return false;
}

// Public functions
export function initGraphCanvases() {
  const resizeCanvas = (id) => {
    const c = document.getElementById(id);
    if (c) c.width = c.parentElement?.offsetWidth || 600;
  };
  resizeCanvas('bfs-canvas');
  resizeCanvas('dfs-canvas');
  resizeCanvas('topo-canvas');
  resizeCanvas('scc-canvas');
  resizeCanvas('flow-canvas');
  drawGraphUD('bfs-canvas', new Array(GRAPH_NODES).fill('default'), [], 'BFS — Click Run to start');
  drawGraphUD('dfs-canvas', new Array(GRAPH_NODES).fill('default'), [], 'DFS — Click Run to start');
  drawDAG('topo-canvas', new Array(DAG_LABELS.length).fill('default'), []);
  drawSCCGraph('scc-canvas', new Array(8).fill('default'), [], null);
  initFlow();
  drawFlowGraph([]);
  initFloydTable();
}

function initFloydTable() {
  const t = document.getElementById('floyd-table');
  if (!t) return;
  const labs = ['A', 'B', 'C', 'D', 'E'];
  let html = '<thead><tr><th></th>' + labs.map(l => '<th>' + l + '</th>').join('') + '</tr></thead><tbody>';
  for (let i = 0; i < FW_N; i++) {
    html += '<tr><th>' + labs[i] + '</th>' + FW_GRAPH[i].map(v => '<td style="color:var(--text-dim)">' + (v === FW_INF ? '∞' : v) + '</td>').join('') + '</tr>';
  }
  html += '</tbody>';
  t.innerHTML = html;
}

// BFS
export async function runBFS() {
  const start = parseInt(document.getElementById('bfs-start')?.value || 0);
  const states = new Array(GRAPH_NODES).fill('default');
  const visited = new Array(GRAPH_NODES).fill(false);
  const edgeHL = [];
  const info = document.getElementById('bfs-info');
  const queue = [start];
  visited[start] = true;
  states[start] = 'current';
  drawGraphUD('bfs-canvas', states, edgeHL, 'BFS from node ' + start);
  const order = [];
  const d = 400;
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    states[u] = 'current';
    drawGraphUD('bfs-canvas', [...states], edgeHL, 'Processing node ' + u);
    if (info) info.innerHTML = '<strong>BFS Queue:</strong> [' + queue.join(', ') + ']  |  <strong>Visited:</strong> [' + order.join(' → ') + ']';
    await sleep(d);
    for (const v of GRAPH_ADJ_UD[u]) {
      if (!visited[v]) {
        visited[v] = true;
        states[v] = 'visited';
        queue.push(v);
        edgeHL.push([u, v]);
        drawGraphUD('bfs-canvas', [...states], [...edgeHL], 'Found neighbor ' + v + ' from ' + u);
        await sleep(d * 0.6);
      }
    }
    states[u] = 'done';
    drawGraphUD('bfs-canvas', [...states], [...edgeHL], 'Node ' + u + ' done');
    await sleep(d * 0.4);
  }
  if (info) info.innerHTML = '<strong>BFS Order:</strong> <span style="color:var(--accent3)">' + order.join(' → ') + '</span>';
}

// DFS
export async function runDFS() {
  const start = parseInt(document.getElementById('dfs-start')?.value || 0);
  const states = new Array(GRAPH_NODES).fill('default');
  const visited = new Array(GRAPH_NODES).fill(false);
  const edgeHL = [];
  const info = document.getElementById('dfs-info');
  const order = [];
  const d = 450;
  async function dfs(u) {
    visited[u] = true;
    states[u] = 'current';
    order.push(u);
    drawGraphUD('dfs-canvas', [...states], [...edgeHL], 'Visiting node ' + u);
    if (info) info.innerHTML = '<strong>DFS Stack exploring:</strong> ' + u + '  |  <strong>Order:</strong> [' + order.join(' → ') + ']';
    await sleep(d);
    for (const v of GRAPH_ADJ_UD[u]) {
      if (!visited[v]) {
        edgeHL.push([u, v]);
        states[v] = 'visited';
        drawGraphUD('dfs-canvas', [...states], [...edgeHL], 'Go deep: ' + u + ' → ' + v);
        await sleep(d * 0.5);
        await dfs(v);
      }
    }
    states[u] = 'done';
    drawGraphUD('dfs-canvas', [...states], [...edgeHL], 'Backtrack from ' + u);
    await sleep(d * 0.4);
  }
  await dfs(start);
  if (info) info.innerHTML = '<strong>DFS Order:</strong> <span style="color:var(--accent3)">' + order.join(' → ') + '</span>';
}

// Topological Sort (Kahn)
export async function runTopo() {
  const n = DAG_LABELS.length;
  const states = new Array(n).fill('default');
  const inDeg = new Array(n).fill(0);
  for (let u = 0; u < n; u++) for (const v of DAG_ADJ[u]) inDeg[v]++;
  const queue = [];
  for (let i = 0; i < n; i++) if (inDeg[i] === 0) queue.push(i);
  const order = [];
  const info = document.getElementById('topo-info');
  const d = 500;
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    states[u] = 'current';
    drawDAG('topo-canvas', [...states], []);
    if (info) info.innerHTML = '<strong>Processing:</strong> ' + DAG_LABELS[u] + '  |  <strong>Order so far:</strong> ' + order.map(i => DAG_LABELS[i]).join(' → ');
    await sleep(d);
    for (const v of DAG_ADJ[u]) {
      inDeg[v]--;
      if (inDeg[v] === 0) {
        queue.push(v);
        states[v] = 'visited';
      }
    }
    states[u] = 'done';
    drawDAG('topo-canvas', [...states], []);
    await sleep(d * 0.4);
  }
  if (info) info.innerHTML = '<strong>Topological Order:</strong> <span style="color:var(--accent3)">' + order.map(i => DAG_LABELS[i]).join(' → ') + '</span>';
}

// SCC (Kosaraju)
export async function runSCC() {
  const n = SCC_ADJ.length;
  const info = document.getElementById('scc-info');
  const visited = new Array(n).fill(false);
  const finish = [];
  const states = new Array(n).fill('default');
  async function dfs1(u) {
    visited[u] = true;
    states[u] = 'visited';
    drawSCCGraph('scc-canvas', [...states], [], null);
    await sleep(300);
    for (const v of SCC_ADJ[u]) if (!visited[v]) await dfs1(v);
    finish.push(u);
    states[u] = 'done';
  }
  if (info) info.textContent = 'Pass 1: DFS finish order...';
  for (let i = 0; i < n; i++) if (!visited[i]) await dfs1(i);
  const trans = Array.from({ length: n }, () => []);
  for (let u = 0; u < n; u++) for (const v of SCC_ADJ[u]) trans[v].push(u);
  const comp = new Array(n).fill(-1);
  let compId = 0;
  const visited2 = new Array(n).fill(false);
  async function dfs2(u, c) {
    visited2[u] = true;
    comp[u] = c;
    for (const v of trans[u]) if (!visited2[v]) await dfs2(v, c);
  }
  if (info) info.textContent = 'Pass 2: DFS on transposed graph...';
  for (let i = finish.length - 1; i >= 0; i--) {
    const u = finish[i];
    if (!visited2[u]) {
      await dfs2(u, compId);
      drawSCCGraph('scc-canvas', new Array(n).fill('default'), [], [...comp]);
      await sleep(400);
      compId++;
    }
  }
  const groups = {};
  for (let i = 0; i < n; i++) {
    if (!groups[comp[i]]) groups[comp[i]] = [];
    groups[comp[i]].push(i);
  }
  const sccList = Object.values(groups).map(g => '{ ' + g.join(', ') + ' }').join(' | ');
  drawSCCGraph('scc-canvas', new Array(n).fill('default'), [], [...comp]);
  if (info) info.innerHTML = '<strong>SCCs Found (' + compId + '):</strong> <span style="color:var(--accent3)">' + sccList + '</span>';
}

// Floyd-Warshall
export async function runFloyd() {
  const dist = FW_GRAPH.map(r => [...r]);
  const labs = ['A', 'B', 'C', 'D', 'E'];
  const t = document.getElementById('floyd-table');
  const info = document.getElementById('floyd-info');
  if (!t || !info) return;
  const d = 200;
  function rebuildTable(ki, ii, jj) {
    let html = '<thead><tr><th></th>' + labs.map(l => '<th>' + l + '</th>').join('') + '</tr></thead><tbody>';
    for (let i = 0; i < FW_N; i++) {
      html += '<tr><th>' + labs[i] + '</th>' + dist[i].map((v, j) => {
        let cls = '';
        if (i === ii && j === jj) cls = 'active-cell';
        else if (i === ki || j === ki) cls = 'highlight-cell';
        return '<td class="' + cls + '">' + (v === FW_INF ? '∞' : v) + '</td>';
      }).join('') + '</tr>';
    }
    html += '</tbody>';
    t.innerHTML = html;
  }
  for (let k = 0; k < FW_N; k++) {
    for (let i = 0; i < FW_N; i++) {
      for (let j = 0; j < FW_N; j++) {
        const through = dist[i][k] + dist[k][j];
        if (dist[i][j] > through) dist[i][j] = through;
        rebuildTable(k, i, j);
        info.innerHTML = `<strong>k=${labs[k]}, i=${labs[i]}, j=${labs[j]}:</strong> dist[${labs[i]}][${labs[j]}] via ${labs[k]} = ${dist[i][k] === FW_INF ? '∞' : dist[i][k]}+${dist[k][j] === FW_INF ? '∞' : dist[k][j]} = <span class="acc">${dist[i][j] === FW_INF ? '∞' : dist[i][j]}</span>`;
        await sleep(d);
      }
    }
  }
  info.innerHTML = '<strong>All-pairs shortest paths computed.</strong> Matrix shows minimum distances between every pair of vertices.';
}

// Ford-Fulkerson
export async function runFordFulkerson() {
  initFlow();
  let maxFlow = 0;
  const info = document.getElementById('flow-info');
  drawFlowGraph([]);
  if (info) info.textContent = 'Finding augmenting paths...';
  const d = 600;
  const parent = new Array(FF_N).fill(-1);
  while (ffBFS(0, FF_N - 1, parent)) {
    let pathFlow = Infinity, v = FF_N - 1;
    while (v !== 0) {
      const u = parent[v];
      pathFlow = Math.min(pathFlow, FF_CAP[u][v] - ffFlow[u][v]);
      v = u;
    }
    const hl = [];
    v = FF_N - 1;
    while (v !== 0) {
      const u = parent[v];
      hl.push([u, v]);
      v = u;
    }
    drawFlowGraph(hl);
    if (info) info.innerHTML = '<strong>Augmenting path found, bottleneck = ' + pathFlow + '</strong>';
    await sleep(d);
    v = FF_N - 1;
    while (v !== 0) {
      const u = parent[v];
      ffFlow[u][v] += pathFlow;
      ffFlow[v][u] -= pathFlow;
      v = u;
    }
    maxFlow += pathFlow;
    drawFlowGraph([]);
    if (info) info.innerHTML = '<strong>Max Flow so far: <span style="color:var(--accent3)">' + maxFlow + '</span></strong>';
    await sleep(d * 0.6);
    parent.fill(-1);
  }
  drawFlowGraph([]);
  if (info) info.innerHTML = '<strong>Max Flow = <span style="color:var(--accent3)">' + maxFlow + '</span></strong> (by Max-Flow Min-Cut Theorem, minimum cut capacity = ' + maxFlow + ')';
}
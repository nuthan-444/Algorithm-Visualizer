import { sleep, algoTitles, DELAY_MAP } from './globals.js';

let battleRunning = false;
let battleStop = false;
let b1cmp = 0, b1swp = 0, b2cmp = 0, b2swp = 0;

function renderBattleBars(containerId, arr, states) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const maxVal = Math.max(...arr);
  c.innerHTML = '';
  arr.forEach((val, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'battle-bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'battle-bar' + (states[i] ? ' ' + states[i] : '');
    bar.id = containerId + '-bar-' + i;
    bar.style.height = ((val / maxVal) * 92) + '%';
    wrap.appendChild(bar);
    c.appendChild(wrap);
  });
}

function setBattleBar(containerId, i, cls) {
  const b = document.getElementById(containerId + '-bar-' + i);
  if (b) b.className = 'battle-bar ' + (cls || '');
}

function rebuildBattleBar(containerId, i, arr) {
  const b = document.getElementById(containerId + '-bar-' + i);
  if (!b) return;
  const maxVal = Math.max(...arr);
  b.style.height = ((arr[i] / maxVal) * 92) + '%';
}

async function runBattleSort(algo, cid, arr, delay, onUpdate) {
  let cmp = 0, swp = 0;
  const n = arr.length;
  const bd = s => { const b = document.getElementById(cid + '-bar-' + s); if (b) b.className = 'battle-bar comparing'; };
  const bs = s => { const b = document.getElementById(cid + '-bar-' + s); if (b) b.className = 'battle-bar swapping'; };
  const bsort = s => { const b = document.getElementById(cid + '-bar-' + s); if (b) b.className = 'battle-bar sorted'; };
  const bclr = s => { const b = document.getElementById(cid + '-bar-' + s); if (b) b.className = 'battle-bar'; };
  const brb = (i) => { const b = document.getElementById(cid + '-bar-' + i); if (b) { const mx = Math.max(...arr); b.style.height = ((arr[i] / mx) * 92) + '%'; } };
  const bswap = async (i, j) => { const mx = Math.max(...arr); const bi = document.getElementById(cid + '-bar-' + i); const bj = document.getElementById(cid + '-bar-' + j); if (bi && bj) { bi.style.height = ((arr[i] / mx) * 92) + '%'; bj.style.height = ((arr[j] / mx) * 92) + '%'; } };

  if (algo === 'bubble') {
    for (let i = 0; i < n - 1 && !battleStop; i++) {
      for (let j = 0; j < n - i - 1 && !battleStop; j++) {
        cmp++; bd(j); bd(j + 1); await sleep(delay * 0.5);
        if (arr[j] > arr[j + 1]) {
          swp++; [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          bs(j); bs(j + 1); await bswap(j, j + 1); await sleep(delay * 0.4);
        }
        bclr(j); bclr(j + 1); onUpdate({ cmp, swp });
      }
      bsort(n - 1 - i);
    }
    bsort(0);
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1 && !battleStop; i++) {
      let mi = i;
      for (let j = i + 1; j < n && !battleStop; j++) {
        cmp++; bd(j); await sleep(delay * 0.4);
        if (arr[j] < arr[mi]) { bclr(mi); mi = j; } else bclr(j);
        onUpdate({ cmp, swp });
      }
      if (mi !== i) {
        swp++; [arr[i], arr[mi]] = [arr[mi], arr[i]];
        bs(i); bs(mi); await bswap(i, mi); await sleep(delay * 0.4);
      }
      bclr(mi); bsort(i);
    }
    bsort(n - 1);
  } else if (algo === 'insertion') {
    bsort(0);
    for (let i = 1; i < n && !battleStop; i++) {
      const key = arr[i]; let j = i - 1;
      while (j >= 0 && arr[j] > key && !battleStop) {
        cmp++; swp++; arr[j + 1] = arr[j]; brb(j + 1); await sleep(delay * 0.5);
        j--; onUpdate({ cmp, swp });
      }
      arr[j + 1] = key; brb(j + 1);
      for (let k = 0; k <= i; k++) bsort(k);
    }
  } else if (algo === 'merge') {
    async function mh(l, r) {
      if (l >= r || battleStop) return;
      const m = Math.floor((l + r) / 2);
      await mh(l, m); await mh(m + 1, r);
      const L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length && !battleStop) {
        cmp++;
        if (L[i] <= R[j]) arr[k] = L[i++];
        else arr[k] = R[j++];
        swp++; brb(k); bs(k); await sleep(delay * 0.5); bclr(k); k++;
        onUpdate({ cmp, swp });
      }
      while (i < L.length) { arr[k] = L[i++]; brb(k); k++; }
      while (j < R.length) { arr[k] = R[j++]; brb(k); k++; }
      for (let x = l; x <= r; x++) bsort(x);
    }
    await mh(0, n - 1);
  } else if (algo === 'quick') {
    async function qh(lo, hi) {
      if (lo >= hi || battleStop) return;
      const pv = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi && !battleStop; j++) {
        cmp++; bd(j); await sleep(delay * 0.4);
        if (arr[j] <= pv) {
          i++; [arr[i], arr[j]] = [arr[j], arr[i]]; swp++; await bswap(i, j);
        }
        bclr(j); onUpdate({ cmp, swp });
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]]; swp++; await bswap(i + 1, hi);
      bsort(i + 1);
      await qh(lo, i); await qh(i + 2, hi);
    }
    await qh(0, n - 1);
    for (let i = 0; i < n; i++) bsort(i);
  } else if (algo === 'heap') {
    async function hfy(sz, i) {
      let lg = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < sz) { cmp++; if (arr[l] > arr[lg]) lg = l; }
      if (r < sz) { cmp++; if (arr[r] > arr[lg]) lg = r; }
      if (lg !== i) {
        [arr[i], arr[lg]] = [arr[lg], arr[i]]; swp++; await bswap(i, lg); await sleep(delay * 0.3);
        onUpdate({ cmp, swp }); await hfy(sz, lg);
      }
    }
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await hfy(n, i);
    for (let i = n - 1; i > 0 && !battleStop; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]]; swp++; await bswap(0, i); bsort(i); await hfy(i, 0);
      onUpdate({ cmp, swp });
    }
    bsort(0);
  } else if (algo === 'shell') {
    let gap = Math.floor(n / 2);
    while (gap > 0 && !battleStop) {
      for (let i = gap; i < n && !battleStop; i++) {
        const tmp = arr[i]; let j = i;
        while (j >= gap && arr[j - gap] > tmp && !battleStop) {
          cmp++; swp++; arr[j] = arr[j - gap]; brb(j); bd(j - gap); await sleep(delay * 0.4);
          bclr(j - gap); j -= gap; onUpdate({ cmp, swp });
        }
        arr[j] = tmp; brb(j);
      }
      gap = Math.floor(gap / 2);
    }
    for (let i = 0; i < n; i++) bsort(i);
  }
  onUpdate({ cmp, swp });
}

function showBattleWinner(a1, a2, t1, t2) {
  const w = document.getElementById('battle-winner');
  if (!w) return;
  w.style.display = 'block';
  const name1 = algoTitles[a1] || a1.toUpperCase();
  const name2 = algoTitles[a2] || a2.toUpperCase();
  let winnerName, desc;
  if (t1 < t2) { winnerName = name1; desc = name1 + ' finished ' + Math.round(t2 - t1) + 'ms faster with ' + b1cmp + ' comparisons vs ' + b2cmp + '!'; }
  else if (t2 < t1) { winnerName = name2; desc = name2 + ' finished ' + Math.round(t1 - t2) + 'ms faster with ' + b2cmp + ' comparisons vs ' + b1cmp + '!'; }
  else { winnerName = 'TIE'; desc = 'Both algorithms finished at the same time!'; }
  document.getElementById('winner-title').innerHTML = '🏆 ' + winnerName + ' WINS!';
  document.getElementById('winner-desc').textContent = desc;
  document.getElementById('w-b1-cmp').textContent = b1cmp;
  document.getElementById('w-b2-cmp').textContent = b2cmp;
  document.getElementById('w-b1-swp').textContent = b1swp;
  document.getElementById('w-b2-swp').textContent = b2swp;
  if (typeof gsap !== 'undefined') gsap.fromTo('#battle-winner', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, ease: 'back.out(1.5)' });
}

export async function startBattle() {
  if (battleRunning) return;
  battleStop = false;
  battleRunning = true;
  const a1 = document.getElementById('battle-algo1').value;
  const a2 = document.getElementById('battle-algo2').value;
  const size = parseInt(document.getElementById('battle-size').value);
  const spd = parseInt(document.getElementById('battle-speed').value);
  const baseArr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
  const arr1 = [...baseArr], arr2 = [...baseArr];
  document.getElementById('b1-name').textContent = algoTitles[a1] || a1.toUpperCase();
  document.getElementById('b2-name').textContent = algoTitles[a2] || a2.toUpperCase();
  document.getElementById('battle-winner').style.display = 'none';
  b1cmp = 0; b1swp = 0; b2cmp = 0; b2swp = 0;
  renderBattleBars('b1-bars', arr1, {});
  renderBattleBars('b2-bars', arr2, {});
  const delay = DELAY_MAP(spd);
  let b1time = 0, b2time = 0;
  const t0 = Date.now();
  await Promise.all([
    runBattleSort(a1, 'b1-bars', arr1, delay, stats => {
      b1cmp = stats.cmp; b1swp = stats.swp;
      document.getElementById('b1-cmp').textContent = stats.cmp;
      document.getElementById('b1-swp').textContent = stats.swp;
    }).then(() => { b1time = Date.now() - t0; }),
    runBattleSort(a2, 'b2-bars', arr2, delay, stats => {
      b2cmp = stats.cmp; b2swp = stats.swp;
      document.getElementById('b2-cmp').textContent = stats.cmp;
      document.getElementById('b2-swp').textContent = stats.swp;
    }).then(() => { b2time = Date.now() - t0; })
  ]);
  battleRunning = false;
  if (!battleStop) showBattleWinner(a1, a2, b1time, b2time);
}

export function resetBattle() {
  battleStop = true;
  battleRunning = false;
  setTimeout(() => { battleStop = false; initBattle(); }, 100);
}

export function initBattle() {
  const size = parseInt(document.getElementById('battle-size')?.value || 40);
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
  renderBattleBars('b1-bars', arr, {});
  renderBattleBars('b2-bars', arr, {});
  const winnerDiv = document.getElementById('battle-winner');
  if (winnerDiv) winnerDiv.style.display = 'none';
  b1cmp = 0; b1swp = 0; b2cmp = 0; b2swp = 0;
  const cmp1 = document.getElementById('b1-cmp'), cmp2 = document.getElementById('b2-cmp');
  const swp1 = document.getElementById('b1-swp'), swp2 = document.getElementById('b2-swp');
  if (cmp1) cmp1.textContent = '0'; if (swp1) swp1.textContent = '0';
  if (cmp2) cmp2.textContent = '0'; if (swp2) swp2.textContent = '0';
}
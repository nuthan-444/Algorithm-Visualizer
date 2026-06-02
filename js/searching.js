import {
  state, incCmp, incStep, getDelay, sleep, log, renderSearchCells
} from './globals.js';

function getTarget() {
  const t = parseInt(document.getElementById('target-input')?.value);
  return isNaN(t) ? null : t;
}

export async function linearSearch(arr) {
  const target = getTarget();
  if (target === null) { log('Enter target!', 'warn'); return; }
  renderSearchCells(arr, {}, {});
  log('Linear search for ' + target);
  for (let i = 0; i < arr.length && !state.stopFlag; i++) {
    incCmp(); incStep();
    renderSearchCells(arr, { [i]: 'checking' }, { target: i });
    await sleep(getDelay());
    if (arr[i] === target) {
      renderSearchCells(arr, { [i]: 'found-cell' }, {});
      log('Found at ' + i + '!', 'success');
      if (typeof gsap !== 'undefined') gsap.fromTo('#cell-' + i, { scale: 1 }, { scale: 1.3, duration: .3, yoyo: true, repeat: 3 });
      return;
    }
    const st = {}; for (let k = 0; k <= i; k++) st[k] = 'eliminated';
    renderSearchCells(arr, st, {});
    await sleep(getDelay() * 0.3);
  }
  if (!state.stopFlag) log('Not found.', 'warn');
}

export async function binarySearch(arr) {
  const target = getTarget();
  if (target === null) { log('Enter target!', 'warn'); return; }
  arr.sort((a, b) => a - b);
  document.getElementById('array-input').value = arr.join(',');
  renderSearchCells(arr, {}, {});
  log('Binary search for ' + target);
  let low = 0, high = arr.length - 1;
  while (low <= high && !state.stopFlag) {
    const mid = Math.floor((low + high) / 2);
    incCmp(); incStep();
    const st = {};
    for (let i = 0; i < arr.length; i++) {
      if (i < low || i > high) st[i] = 'eliminated';
      else if (i === mid) st[i] = 'mid-cell';
      else st[i] = 'range-cell';
    }
    renderSearchCells(arr, st, { low, mid, high });
    await sleep(getDelay());
    if (arr[mid] === target) {
      const s = {}; for (let i = 0; i < arr.length; i++) s[i] = 'eliminated'; s[mid] = 'found-cell';
      renderSearchCells(arr, s, {});
      log('Found at ' + mid + '!', 'success');
      if (typeof gsap !== 'undefined') gsap.fromTo('#cell-' + mid, { scale: 1 }, { scale: 1.3, duration: .3, yoyo: true, repeat: 3 });
      return;
    } else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
    await sleep(getDelay() * 0.4);
  }
  if (!state.stopFlag) log('Not found.', 'warn');
}

export async function jumpSearch(arr) {
  const target = getTarget();
  if (target === null) { log('Enter target!', 'warn'); return; }
  arr.sort((a, b) => a - b);
  document.getElementById('array-input').value = arr.join(',');
  const n = arr.length, step = Math.floor(Math.sqrt(n));
  let prev = 0;
  renderSearchCells(arr, {}, {});
  while (arr[Math.min(step, n) - 1] < target && !state.stopFlag) {
    const blk = Math.min(step, n) - 1;
    const st = {}; for (let i = 0; i < n; i++) st[i] = 'eliminated'; st[blk] = 'checking';
    renderSearchCells(arr, st, {});
    incCmp(); incStep(); await sleep(getDelay());
    prev = step; if (prev >= n) { log('Not found.', 'warn'); return; }
  }
  while (arr[prev] < target && prev < Math.min(step, n) && !state.stopFlag) {
    incCmp(); incStep();
    const st = {}; for (let i = 0; i < prev; i++) st[i] = 'eliminated'; st[prev] = 'checking';
    renderSearchCells(arr, st, { target: prev });
    await sleep(getDelay()); prev++;
  }
  if (!state.stopFlag && arr[prev] === target) {
    const st = {}; for (let i = 0; i < n; i++) st[i] = 'eliminated'; st[prev] = 'found-cell';
    renderSearchCells(arr, st, {}); log('Found at ' + prev + '!', 'success');
  } else if (!state.stopFlag) log('Not found.', 'warn');
}

export async function interpolationSearch(arr) {
  const target = getTarget();
  if (target === null) { log('Enter target!', 'warn'); return; }
  arr.sort((a, b) => a - b);
  document.getElementById('array-input').value = arr.join(',');
  const n = arr.length;
  renderSearchCells(arr, {}, {});
  let low = 0, high = n - 1;
  while (low <= high && target >= arr[low] && target <= arr[high] && !state.stopFlag) {
    if (arr[high] === arr[low]) {
      if (arr[low] === target) {
        const s = {}; for (let i = 0; i < n; i++) s[i] = 'eliminated'; s[low] = 'found-cell';
        renderSearchCells(arr, s, {}); log('Found!', 'success');
      }
      return;
    }
    const pos = low + Math.floor((target - arr[low]) * (high - low) / (arr[high] - arr[low]));
    incCmp(); incStep();
    const st = {};
    for (let i = 0; i < n; i++) {
      if (i < low || i > high) st[i] = 'eliminated';
      else if (i === pos) st[i] = 'mid-cell';
      else st[i] = 'range-cell';
    }
    renderSearchCells(arr, st, { low, pos, high });
    await sleep(getDelay());
    if (arr[pos] === target) {
      const s = {}; for (let i = 0; i < n; i++) s[i] = 'eliminated'; s[pos] = 'found-cell';
      renderSearchCells(arr, s, {});
      log('Found at ' + pos + '!', 'success');
      if (typeof gsap !== 'undefined') gsap.fromTo('#cell-' + pos, { scale: 1 }, { scale: 1.3, duration: .3, yoyo: true, repeat: 3 });
      return;
    } else if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
    await sleep(getDelay() * 0.4);
  }
  if (!state.stopFlag) log('Not found.', 'warn');
}

export async function exponentialSearch(arr) {
  const target = getTarget();
  if (target === null) { log('Enter target!', 'warn'); return; }
  arr.sort((a, b) => a - b);
  document.getElementById('array-input').value = arr.join(',');
  const n = arr.length;
  renderSearchCells(arr, {}, {});
  if (arr[0] === target) {
    const s = {}; for (let i = 0; i < n; i++) s[i] = 'eliminated'; s[0] = 'found-cell';
    renderSearchCells(arr, s, {}); log('Found at 0!', 'success'); return;
  }
  let i = 1;
  while (i < n && arr[i] <= target && !state.stopFlag) {
    incCmp(); incStep();
    const st = {}; for (let k = 0; k < n; k++) st[k] = 'eliminated'; st[i] = 'checking';
    renderSearchCells(arr, st, {}); await sleep(getDelay()); i *= 2;
  }
  if (state.stopFlag) return;
  let low = Math.floor(i / 2), high = Math.min(i, n - 1);
  while (low <= high && !state.stopFlag) {
    const mid = Math.floor((low + high) / 2);
    incCmp(); incStep();
    const st = {};
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) st[k] = 'eliminated';
      else if (k === mid) st[k] = 'mid-cell';
      else st[k] = 'range-cell';
    }
    renderSearchCells(arr, st, { low, mid, high });
    await sleep(getDelay());
    if (arr[mid] === target) {
      const s = {}; for (let k = 0; k < n; k++) s[k] = 'eliminated'; s[mid] = 'found-cell';
      renderSearchCells(arr, s, {});
      log('Found at ' + mid + '!', 'success');
      if (typeof gsap !== 'undefined') gsap.fromTo('#cell-' + mid, { scale: 1 }, { scale: 1.3, duration: .3, yoyo: true, repeat: 3 });
      return;
    } else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
    await sleep(getDelay() * 0.4);
  }
  if (!state.stopFlag) log('Not found.', 'warn');
}
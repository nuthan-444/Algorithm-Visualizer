import {
  state, incCmp, incSwp, incStep, log, getDelay, sleep,
  renderBars, animateBar, clearBar, rebuildBar, animateSwap, celebrateAll
} from './globals.js';

export async function bubbleSort(arr) {
  const n = arr.length; renderBars(arr);
  for (let i = 0; i < n - 1 && !state.stopFlag; i++) {
    for (let j = 0; j < n - i - 1 && !state.stopFlag; j++) {
      incCmp(); incStep();
      animateBar(j, 'comparing'); animateBar(j + 1, 'comparing');
      await sleep(getDelay());
      if (arr[j] > arr[j + 1]) {
        incSwp(); [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        animateBar(j, 'swapping'); animateBar(j + 1, 'swapping');
        await animateSwap(j, j + 1, arr);
        await sleep(getDelay() * 0.5);
      }
      clearBar(j); clearBar(j + 1);
    }
    animateBar(n - 1 - i, 'sorted');
  }
  animateBar(0, 'sorted');
  log('Sorted!', 'success');
  await celebrateAll(arr.length);
}

export async function selectionSort(arr) {
  const n = arr.length; renderBars(arr);
  for (let i = 0; i < n - 1 && !state.stopFlag; i++) {
    let minIdx = i; animateBar(i, 'pivot');
    for (let j = i + 1; j < n && !state.stopFlag; j++) {
      incCmp(); incStep(); animateBar(j, 'comparing');
      await sleep(getDelay() * 0.6);
      if (arr[j] < arr[minIdx]) {
        if (minIdx !== i) clearBar(minIdx);
        minIdx = j; animateBar(minIdx, 'pivot');
      } else clearBar(j);
      await sleep(getDelay() * 0.4);
    }
    if (minIdx !== i) {
      incSwp(); [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      animateBar(i, 'swapping'); animateBar(minIdx, 'swapping');
      await animateSwap(i, minIdx, arr);
      await sleep(getDelay());
    }
    clearBar(minIdx); animateBar(i, 'sorted');
  }
  animateBar(arr.length - 1, 'sorted');
  log('Sorted!', 'success');
  await celebrateAll(arr.length);
}

export async function insertionSort(arr) {
  const n = arr.length; renderBars(arr); animateBar(0, 'sorted');
  for (let i = 1; i < n && !state.stopFlag; i++) {
    const key = arr[i]; let j = i - 1; animateBar(i, 'pivot');
    await sleep(getDelay());
    while (j >= 0 && arr[j] > key && !state.stopFlag) {
      incCmp(); incStep(); animateBar(j, 'comparing');
      arr[j + 1] = arr[j]; incSwp();
      await animateSwap(j, j + 1, arr);
      await sleep(getDelay() * 0.7);
      clearBar(j + 1); animateBar(j + 1, 'sorted');
      j--;
    }
    arr[j + 1] = key; clearBar(j + 1); animateBar(j + 1, 'sorted');
    rebuildBar(j + 1, arr);
    await sleep(getDelay() * 0.5);
    for (let k = 0; k <= i; k++) animateBar(k, 'sorted');
  }
  log('Sorted!', 'success');
  await celebrateAll(arr.length);
}

export async function mergeSort(arr) {
  renderBars(arr);
  await mergeSortH(arr, 0, arr.length - 1);
  if (!state.stopFlag) {
    for (let i = 0; i < arr.length; i++) animateBar(i, 'sorted');
    log('Sorted!', 'success');
    await celebrateAll(arr.length);
  }
}
async function mergeSortH(arr, l, r) {
  if (l >= r || state.stopFlag) return;
  const mid = Math.floor((l + r) / 2);
  for (let i = l; i <= r; i++) animateBar(i, 'comparing');
  await sleep(getDelay() * 0.6);
  for (let i = l; i <= r; i++) clearBar(i);
  await mergeSortH(arr, l, mid);
  await mergeSortH(arr, mid + 1, r);
  await doMerge(arr, l, mid, r);
}
async function doMerge(arr, l, mid, r) {
  if (state.stopFlag) return;
  const left = arr.slice(l, mid + 1), right = arr.slice(mid + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length && !state.stopFlag) {
    incCmp(); incStep(); animateBar(k, 'swapping');
    await sleep(getDelay() * 0.7);
    if (left[i] <= right[j]) arr[k] = left[i++];
    else arr[k] = right[j++];
    incSwp(); rebuildBar(k, arr); clearBar(k); animateBar(k, 'pivot');
    k++; await sleep(getDelay() * 0.3);
  }
  while (i < left.length && !state.stopFlag) {
    arr[k] = left[i++]; rebuildBar(k, arr); animateBar(k, 'pivot'); k++;
    await sleep(getDelay() * 0.25);
  }
  while (j < right.length && !state.stopFlag) {
    arr[k] = right[j++]; rebuildBar(k, arr); animateBar(k, 'pivot'); k++;
    await sleep(getDelay() * 0.25);
  }
  for (let x = l; x <= r; x++) { clearBar(x); animateBar(x, 'sorted'); }
}

export async function quickSort(arr) {
  renderBars(arr);
  await quickSortH(arr, 0, arr.length - 1);
  if (!state.stopFlag) {
    for (let i = 0; i < arr.length; i++) animateBar(i, 'sorted');
    log('Sorted!', 'success');
    await celebrateAll(arr.length);
  }
}
async function quickSortH(arr, low, high) {
  if (low >= high || state.stopFlag) return;
  const pi = await partition(arr, low, high);
  await quickSortH(arr, low, pi - 1);
  await quickSortH(arr, pi + 1, high);
}
async function partition(arr, low, high) {
  const pivot = arr[high]; animateBar(high, 'pivot');
  let i = low - 1;
  for (let j = low; j < high && !state.stopFlag; j++) {
    incCmp(); incStep(); animateBar(j, 'comparing');
    await sleep(getDelay() * 0.8);
    if (arr[j] <= pivot) {
      i++; [arr[i], arr[j]] = [arr[j], arr[i]]; incSwp();
      if (i !== j) {
        animateBar(i, 'swapping'); animateBar(j, 'swapping');
        await animateSwap(i, j, arr);
        await sleep(getDelay() * 0.4);
      }
    }
    clearBar(j);
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; incSwp();
  animateBar(high, 'swapping'); animateBar(i + 1, 'swapping');
  await animateSwap(i + 1, high, arr);
  await sleep(getDelay() * 0.4);
  animateBar(i + 1, 'sorted');
  return i + 1;
}

export async function heapSort(arr) {
  const n = arr.length; renderBars(arr);
  for (let i = Math.floor(n / 2) - 1; i >= 0 && !state.stopFlag; i--)
    await heapify(arr, n, i);
  for (let i = n - 1; i > 0 && !state.stopFlag; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]; incSwp(); incStep();
    animateBar(0, 'swapping'); animateBar(i, 'swapping');
    await animateSwap(0, i, arr);
    await sleep(getDelay() * 0.5);
    animateBar(i, 'sorted');
    await heapify(arr, i, 0);
  }
  animateBar(0, 'sorted');
  log('Sorted!', 'success');
  await celebrateAll(arr.length);
}
async function heapify(arr, n, i) {
  let largest = i, l = 2 * i + 1, r = 2 * i + 2;
  if (l < n) { incCmp(); if (arr[l] > arr[largest]) largest = l; }
  if (r < n) { incCmp(); if (arr[r] > arr[largest]) largest = r; }
  if (largest !== i && !state.stopFlag) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]]; incSwp();
    animateBar(i, 'comparing'); animateBar(largest, 'comparing');
    await animateSwap(i, largest, arr);
    await sleep(getDelay() * 0.4);
    clearBar(i); clearBar(largest);
    await heapify(arr, n, largest);
  }
}

export async function shellSort(arr) {
  const n = arr.length; renderBars(arr);
  let gap = Math.floor(n / 2);
  while (gap > 0 && !state.stopFlag) {
    for (let i = gap; i < n && !state.stopFlag; i++) {
      const temp = arr[i]; let j = i; animateBar(i, 'pivot');
      await sleep(getDelay() * 0.4);
      while (j >= gap && arr[j - gap] > temp && !state.stopFlag) {
        incCmp(); incStep(); animateBar(j - gap, 'comparing');
        arr[j] = arr[j - gap]; incSwp(); rebuildBar(j, arr);
        await sleep(getDelay() * 0.55);
        clearBar(j - gap); j -= gap;
      }
      arr[j] = temp; rebuildBar(j, arr); clearBar(j);
    }
    gap = Math.floor(gap / 2);
  }
  for (let i = 0; i < n; i++) animateBar(i, 'sorted');
  log('Sorted!', 'success');
  await celebrateAll(arr.length);
}
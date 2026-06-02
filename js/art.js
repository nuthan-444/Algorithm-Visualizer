import { sleep, algoTitles } from './globals.js';

let artStop = false;
const PALETTES = {
  neon: i => `hsl(${(i * 3.6) % 360},100%,55%)`,
  fire: i => `hsl(${i % 60},100%,${40 + i % 40}%)`,
  ocean: i => `hsl(${180 + i % 60},80%,${40 + i % 30}%)`,
  aurora: i => `hsl(${120 + i % 160},90%,${45 + i % 30}%)`,
  candy: i => `hsl(${(i * 7) % 360},90%,65%)`,
};

function drawArtFrame(arr, palette, canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = 400;
  const maxVal = Math.max(...arr);
  const n = arr.length;
  const barW = W / n;
  arr.forEach((val, i) => {
    const h = (val / maxVal) * (H - 20);
    const palFn = PALETTES[palette] || PALETTES.neon;
    const color = palFn(Math.round(val / maxVal * 100));
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillRect(i * barW, H - h, barW - 1, h);
  });
}

async function runArtSort(algo, arr, palette, canvas) {
  const n = arr.length;
  const delay = Math.max(8, 40 - Math.floor(n / 10));
  const repaint = (highlight = []) => {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = 400;
    const maxVal = Math.max(...arr);
    const bw = W / n;
    ctx.fillStyle = 'rgba(8,11,16,0.25)';
    ctx.fillRect(0, 0, W, H);
    arr.forEach((val, i) => {
      const h = (val / maxVal) * (H - 10);
      const palFn = PALETTES[palette] || PALETTES.neon;
      const isHL = highlight.includes(i);
      ctx.fillStyle = isHL ? '#ffffff' : palFn(Math.round(val / maxVal * 100));
      ctx.shadowColor = isHL ? '#ffffff' : palFn(Math.round(val / maxVal * 100));
      ctx.shadowBlur = isHL ? 18 : 6;
      ctx.fillRect(i * bw, H - h, bw - 1, h);
    });
  };
  if (algo === 'bubble') {
    for (let i = 0; i < n - 1 && !artStop; i++) {
      for (let j = 0; j < n - i - 1 && !artStop; j++) {
        if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        repaint([j, j + 1]);
        await sleep(delay);
      }
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1 && !artStop; i++) {
      let mi = i;
      for (let j = i + 1; j < n && !artStop; j++) {
        if (arr[j] < arr[mi]) mi = j;
        repaint([i, j, mi]);
        await sleep(delay * 0.5);
      }
      [arr[i], arr[mi]] = [arr[mi], arr[i]];
      repaint([i, mi]);
      await sleep(delay);
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n && !artStop; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j] > key && !artStop) {
        arr[j + 1] = arr[j];
        repaint([j, j + 1]);
        await sleep(delay);
        j--;
      }
      arr[j + 1] = key;
      repaint([j + 1]);
    }
  } else if (algo === 'merge') {
    async function mh(l, r) {
      if (l >= r || artStop) return;
      const m = Math.floor((l + r) / 2);
      await mh(l, m);
      await mh(m + 1, r);
      const L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length && !artStop) {
        if (L[i] <= R[j]) arr[k] = L[i++];
        else arr[k] = R[j++];
        repaint([k]);
        await sleep(delay);
        k++;
      }
      while (i < L.length) { arr[k] = L[i++]; repaint([k++]); }
      while (j < R.length) { arr[k] = R[j++]; repaint([k++]); }
    }
    await mh(0, n - 1);
  } else if (algo === 'quick') {
    async function qh(lo, hi) {
      if (lo >= hi || artStop) return;
      const pv = arr[hi];
      let i = lo - 1;
      for (let j = lo; j < hi && !artStop; j++) {
        if (arr[j] <= pv) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          repaint([i, j, hi]);
          await sleep(delay);
        } else {
          repaint([j, hi]);
          await sleep(delay * 0.5);
        }
      }
      [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
      repaint([i + 1, hi]);
      await sleep(delay);
      await qh(lo, i);
      await qh(i + 2, hi);
    }
    await qh(0, n - 1);
  } else if (algo === 'shell') {
    let gap = Math.floor(n / 2);
    while (gap > 0 && !artStop) {
      for (let i = gap; i < n && !artStop; i++) {
        const tmp = arr[i];
        let j = i;
        while (j >= gap && arr[j - gap] > tmp && !artStop) {
          arr[j] = arr[j - gap];
          repaint([j, j - gap]);
          await sleep(delay);
          j -= gap;
        }
        arr[j] = tmp;
        repaint([j]);
      }
      gap = Math.floor(gap / 2);
    }
  }
  repaint([]);
}

export function initArtCanvas() {
  const canvas = document.getElementById('art-canvas');
  if (!canvas) return;
  canvas.width = canvas.parentElement?.offsetWidth || 800;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080b10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const arr = Array.from({ length: 60 }, (_, i) => i + 1);
  drawArtFrame(arr, 'neon', canvas);
}

export async function startArt() {
  artStop = false;
  const algo = document.getElementById('art-algo').value;
  const palette = document.getElementById('art-palette').value;
  const size = parseInt(document.getElementById('art-size').value);
  const canvas = document.getElementById('art-canvas');
  canvas.width = canvas.parentElement?.offsetWidth || 800;
  const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080b10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const info = document.getElementById('art-info');
  if (info) info.textContent = '▶ Running ' + algoTitles[algo] + ' with ' + palette + ' palette...';
  await runArtSort(algo, arr, palette, canvas);
  if (!artStop && info) info.textContent = '✅ Done! Click "Generate Art" again for a new masterpiece. Save with the ⬇ button.';
}

export function stopArt() {
  artStop = true;
  const info = document.getElementById('art-info');
  if (info) info.textContent = '⏹ Stopped.';
}

export function downloadArt() {
  const canvas = document.getElementById('art-canvas');
  const link = document.createElement('a');
  link.download = 'algoviz-art-' + Date.now() + '.png';
  link.href = canvas.toDataURL();
  link.click();
}
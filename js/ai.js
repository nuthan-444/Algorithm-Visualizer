import { state, algoTitles } from './globals.js';

// ─── Config ───────────────────────────────────────────────────────────────────
// Uses Groq API. Falls back to local smart responses if the API
// fails, so the chat always works.
const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

let aiCollapsed = true;
let aiConversationHistory = [];

// ─── Local knowledge base (always works, no API needed) ───────────────────────
const LOCAL_ANSWERS = {
  bubble: {
    explain: "Bubble Sort repeatedly compares adjacent elements and swaps them if they're in the wrong order. It 'bubbles' the largest unsorted element to its correct position each pass. Simple but slow at O(n²) — good only for tiny arrays or nearly-sorted data.",
    usecase: "Best used for educational purposes or very small arrays (n < 20). It's intuitive to understand and requires no extra memory. In practice, Insertion Sort is almost always better.",
    compare: "Compared to other O(n²) sorts: Selection Sort always does n²/2 comparisons but fewer swaps; Insertion Sort is faster on nearly sorted data. Merge Sort and Quick Sort at O(n log n) are far superior for large datasets."
  },
  selection: {
    explain: "Selection Sort finds the minimum element from the unsorted part and places it at the beginning each pass. It always does exactly n(n-1)/2 comparisons regardless of input order.",
    usecase: "Useful when write operations are expensive (e.g., flash memory), since it makes at most O(n) swaps — the minimum possible for comparison-based sorts.",
    compare: "Does fewer swaps than Bubble Sort but the same comparisons. Not stable — equal elements may be reordered. Insertion Sort beats it on nearly-sorted data."
  },
  insertion: {
    explain: "Insertion Sort builds the sorted array one element at a time, inserting each new element into its correct position among the already-sorted elements. Like sorting playing cards in your hand.",
    usecase: "Excellent for small arrays (n < 50) and nearly-sorted data where it approaches O(n). Used as the base case in Timsort (Python's built-in sort) and hybrid algorithms.",
    compare: "Faster than Bubble and Selection Sort on partially sorted data. O(n²) worst case but O(n) best case. Better cache performance than Merge Sort for small arrays."
  },
  merge: {
    explain: "Merge Sort divides the array in half recursively, then merges the sorted halves. Guaranteed O(n log n) in all cases. Stable and predictable — no worst-case surprises like Quick Sort.",
    usecase: "Best for linked lists (no random access needed), external sorting (large files on disk), and when stability is required. Used in Python's Timsort and Java's Arrays.sort for objects.",
    compare: "More memory than Quick Sort (O(n) vs O(log n)). Stable unlike Heap Sort. Always O(n log n) unlike Quick Sort's O(n²) worst case. Preferred when memory isn't a constraint."
  },
  quick: {
    explain: "Quick Sort picks a pivot, partitions elements around it (smaller left, larger right), then recursively sorts each partition. Average O(n log n) with excellent cache performance.",
    usecase: "The most widely used sort in practice. Used in C's qsort, C++'s std::sort, and many databases. Best for in-memory sorting when average-case performance matters more than worst-case guarantees.",
    compare: "Faster in practice than Merge Sort due to better cache locality. Worst case O(n²) with bad pivots (randomized pivots fix this). Not stable. Uses only O(log n) extra space."
  },
  heap: {
    explain: "Heap Sort builds a max-heap from the array, then repeatedly extracts the maximum. Guaranteed O(n log n) in all cases with O(1) extra space — the best theoretical combination.",
    usecase: "Used when you need guaranteed O(n log n) time and O(1) space. Often used in priority queue implementations and real-time systems where worst-case guarantees matter.",
    compare: "Same time complexity as Merge Sort but O(1) space. Not stable. Slower than Quick Sort in practice due to poor cache locality (non-sequential memory access patterns)."
  },
  shell: {
    explain: "Shell Sort is a generalization of Insertion Sort that compares elements far apart (the 'gap'), reducing the gap over time until it equals 1 (becoming Insertion Sort). Dramatically faster than basic Insertion Sort.",
    usecase: "Good middle ground when you need better than O(n²) but can't use O(n) extra space. Used in embedded systems with limited memory. Performance depends heavily on the gap sequence.",
    compare: "Better than Insertion Sort in most cases. Simpler than Merge/Quick Sort. Gap sequence choice dramatically affects performance — Knuth's sequence (1,4,13,40...) gives O(n^1.5) time."
  },
  linear: {
    explain: "Linear Search checks each element one by one until the target is found. Simple and works on unsorted arrays — no preprocessing required.",
    usecase: "Use when the array is unsorted and small, or when you search rarely. If you search frequently, sort first and use Binary Search instead.",
    compare: "O(n) vs Binary Search O(log n) — but Linear Search works on unsorted data while Binary Search requires sorting. For n=1000, Linear is up to 1000 checks vs Binary's 10."
  },
  binary: {
    explain: "Binary Search repeatedly halves the search space by comparing the target to the middle element. Requires a sorted array. Extremely efficient at O(log n) — finds any element in 1000-item array in ≤10 comparisons.",
    usecase: "The go-to search for sorted arrays. Used in databases, autocomplete systems, and game AI. Even for a million elements, it takes at most 20 comparisons!",
    compare: "O(log n) vs Linear O(n). Requires sorted array (Interpolation Search can be faster for uniformly distributed data). Jump Search is a hybrid at O(√n)."
  },
  jump: {
    explain: "Jump Search jumps forward in steps of √n, then does a linear search backward. A middle ground between Linear O(n) and Binary O(log n) searches.",
    usecase: "Useful when jumping back (like in Binary Search) is costly — for example on magnetic tapes or disk seeks where forward jumps are cheaper than backward ones.",
    compare: "O(√n) — worse than Binary Search O(log n) but better than Linear O(n). Only works on sorted arrays. For n=100, takes ~10 steps vs Binary's 7, but fewer comparisons than linear's 50 on average."
  },
  interpolation: {
    explain: "Interpolation Search estimates the target's position using a formula based on the value range, like guessing where 'M' is in a dictionary by jumping to the middle.",
    usecase: "Best when data is uniformly distributed — achieves O(log log n) which is faster than Binary Search! Phone books, ZIP code lookups, and uniformly distributed numerical data.",
    compare: "O(log log n) average for uniform data vs Binary O(log n) — much faster! But degrades to O(n) for skewed data. More complex to implement than Binary Search."
  },
  exponential: {
    explain: "Exponential Search first finds a range where the target might be (by doubling the index: 1, 2, 4, 8...), then uses Binary Search within that range.",
    usecase: "Great for unbounded/infinite sorted arrays where you don't know the size. Also faster than Binary Search when the target is near the beginning of the array.",
    compare: "O(log n) like Binary Search, but finds the range first before applying Binary Search. Particularly efficient when the target is at position k — takes O(log k) time, which can be much less than O(log n)."
  }
};

function getLocalAnswer(algo, questionType) {
  const kb = LOCAL_ANSWERS[algo];
  if (!kb) return null;
  if (questionType === 'explain') return kb.explain;
  if (questionType === 'usecase') return kb.usecase;
  if (questionType === 'compare') return kb.compare;
  return null;
}

function detectQuestionType(text) {
  const t = text.toLowerCase();
  if (t.includes('explain') || t.includes('how does') || t.includes('what is') || t.includes('describe')) return 'explain';
  if (t.includes('use case') || t.includes('when') || t.includes('best for') || t.includes('purpose')) return 'usecase';
  if (t.includes('compare') || t.includes('vs') || t.includes('difference') || t.includes('better')) return 'compare';
  if (t.includes('result') || t.includes('comparison') || t.includes('swap') || t.includes('efficient')) return 'results';
  return 'general';
}

function generateLocalResponse(text) {
  const algo = state.currentAlgo;
  const qtype = detectQuestionType(text);
  const t = text.toLowerCase();

  // Try to get a specific answer first
  if (qtype !== 'general' && qtype !== 'results') {
    const ans = getLocalAnswer(algo, qtype);
    if (ans) return ans;
  }

  // Results explanation
  if (qtype === 'results') {
    const { comparisons, swaps, array } = state;
    const n = array.length;
    const expected = algo.includes('merge') || algo.includes('quick') || algo.includes('heap')
      ? Math.round(n * Math.log2(n))
      : Math.round(n * n / 2);
    const efficiency = comparisons <= expected * 1.5 ? 'very efficient' : comparisons <= expected * 3 ? 'somewhat expected' : 'higher than ideal';
    return `Your ${algoTitles[algo] || algo} run: ${comparisons} comparisons and ${swaps} swaps on ${n} elements. This is ${efficiency} for this algorithm and array size. ${comparisons <= expected * 1.5 ? '✅ Great performance!' : 'Consider using a faster algorithm for larger arrays.'}`;
  }

  // Fallback general responses
  const generals = [
    `${algoTitles[algo] || algo} is a classic algorithm! ${getLocalAnswer(algo, 'explain') || 'Try clicking Visualize to see it in action.'}`,
    `Great question about ${algoTitles[algo] || algo}! ${getLocalAnswer(algo, 'usecase') || 'Explore the visualization to understand the pattern.'}`,
    `For ${algoTitles[algo] || algo}: ${getLocalAnswer(algo, 'compare') || 'Each algorithm has strengths — try the Battle mode to compare!'}`,
  ];
  return generals[Math.floor(Math.random() * generals.length)];
}

// ─── Groq API call ────────────────────────────────────────────────────────────
async function callGroq(userMessage) {
  try {
    const history = aiConversationHistory.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    const payload = {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert algorithm tutor inside AlgoViz Ultimate, an interactive algorithm visualizer. 
Current algorithm: ${algoTitles[state.currentAlgo] || state.currentAlgo}.
Array size: ${state.array.length}. Comparisons: ${state.comparisons}. Swaps: ${state.swaps}.
Be concise (2-4 sentences), educational, and encouraging. Use simple language.`
        },
        ...history,
        { role: 'user', content: userMessage }
      ],
      max_tokens: 200,
      temperature: 0.7
    };

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
export function toggleAI() {
  aiCollapsed = !aiCollapsed;
  const panel = document.getElementById('ai-panel');
  if (panel) panel.classList.toggle('collapsed', aiCollapsed);
}

window._toggleAI = toggleAI;

function addAIMessage(text, role = 'ai') {
  const msgs = document.getElementById('ai-messages');
  if (!msgs) return null;
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function setStatus(text) {
  const s = document.getElementById('ai-status');
  if (s) s.textContent = text;
}

// ─── Main chat handler ─────────────────────────────────────────────────────────
async function processMessage(userText, isAuto = false) {
  const sendBtn = document.getElementById('ai-send');
  if (sendBtn) sendBtn.disabled = true;
  const thinking = addAIMessage('🤔 Thinking...', 'ai thinking');
  setStatus('AI THINKING...');

  try {
    // 1. Try Groq API
    let reply = await callGroq(userText);

    // 2. Fall back to local smart responses
    if (!reply) {
      // Small delay so the "Thinking..." message feels real
      await new Promise(r => setTimeout(r, 600));
      reply = generateLocalResponse(userText);
    }

    if (thinking) thinking.remove();
    const msgEl = addAIMessage(reply, 'ai');
    aiConversationHistory.push({ role: 'assistant', content: reply });
    if (aiConversationHistory.length > 20) aiConversationHistory = aiConversationHistory.slice(-16);
    if (msgEl && typeof gsap !== 'undefined') {
      gsap.fromTo(msgEl, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 });
    }
  } catch (e) {
    if (thinking) thinking.remove();
    addAIMessage('⚠ Something went wrong: ' + e.message, 'ai');
  }

  if (sendBtn) sendBtn.disabled = false;
  setStatus('AI READY');
  if (aiCollapsed && !isAuto) toggleAI();
}

// ─── Public exports ────────────────────────────────────────────────────────────
export function aiQuick(text) {
  const input = document.getElementById('ai-input');
  if (input) input.value = text;
  sendAI();
}

export function autoAIGreet() {
  const algo = algoTitles[state.currentAlgo] || state.currentAlgo;
  const greet = `Hi! I'm your AI algorithm tutor in AlgoViz Ultimate. 🤖 You're exploring ${algo}. ${getLocalAnswer(state.currentAlgo, 'explain') || 'Click Visualize to see it in action, then ask me anything!'} Ask me to explain, compare, or find the best use case!`;
  if (typeof gsap === 'undefined') {
    // Wait for DOM to be ready
    setTimeout(() => {
      const msg = addAIMessage(greet, 'ai');
      if (msg) aiConversationHistory.push({ role: 'assistant', content: greet });
    }, 500);
  } else {
    const msg = addAIMessage(greet, 'ai');
    if (msg) {
      gsap.fromTo(msg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      aiConversationHistory.push({ role: 'assistant', content: greet });
    }
  }
}

export function aiExplainCompletion() {
  if (aiCollapsed) toggleAI();
  const { comparisons, swaps, array, currentAlgo } = state;
  const text = `Explain my ${algoTitles[currentAlgo] || currentAlgo} result: ${comparisons} comparisons, ${swaps} swaps on ${array.length} elements. Was this efficient?`;
  addAIMessage(text, 'user');
  aiConversationHistory.push({ role: 'user', content: text });
  processMessage(text);
}

export function aiExplainBattle(a1, a2, c1, c2, winner) {
  if (aiCollapsed) toggleAI();
  const text = `Compare ${algoTitles[a1] || a1} (${c1} comparisons) vs ${algoTitles[a2] || a2} (${c2} comparisons). ${algoTitles[winner] || winner} won. Why?`;
  addAIMessage(text, 'user');
  aiConversationHistory.push({ role: 'user', content: text });
  processMessage(text);
}

export async function sendAI() {
  const input = document.getElementById('ai-input');
  const text = input?.value.trim();
  if (!text) return;
  if (input) input.value = '';
  addAIMessage(text, 'user');
  aiConversationHistory.push({ role: 'user', content: text });
  await processMessage(text);
}
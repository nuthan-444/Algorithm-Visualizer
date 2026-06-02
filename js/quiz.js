// ─── Groq config (same as ai.js) ─────────────────────────────────────────────
const GROQ_API_KEY = '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';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// ─── Fallback local question bank ─────────────────────────────────────────────
const FALLBACK_QUESTIONS = [
  { q: 'What is the worst-case time complexity of Bubble Sort?',           opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],                               ans: 2, exp: 'Bubble Sort compares adjacent pairs—takes O(n²) passes in the worst case.' },
  { q: 'Which sorting algorithm has O(n log n) in all cases?',            opts: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],              ans: 1, exp: 'Merge Sort always divides and merges in O(n log n) regardless of input.' },
  { q: 'Which algorithm is best for nearly-sorted arrays?',               opts: ['Heap Sort', 'Merge Sort', 'Insertion Sort', 'Quick Sort'],                ans: 2, exp: 'Insertion Sort is optimal for nearly sorted data because it shifts very few elements.' },
  { q: 'Binary Search requires the array to be:',                         opts: ['Shuffled', 'Sorted', 'Reversed', 'Unique'],                              ans: 1, exp: 'Binary Search only works on sorted arrays—it halves the search space each step.' },
  { q: 'What is the space complexity of Merge Sort?',                     opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],                                     ans: 2, exp: 'Merge Sort needs O(n) extra space for the temporary merge arrays.' },
  { q: 'Which is NOT a stable sorting algorithm?',                        opts: ['Merge Sort', 'Bubble Sort', 'Heap Sort', 'Insertion Sort'],               ans: 2, exp: 'Heap Sort is not stable; it can change the relative order of equal elements.' },
  { q: 'Quick Sort average case time complexity is:',                     opts: ['O(n)', 'O(n²)', 'O(n log n)', 'O(log n)'],                               ans: 2, exp: 'Quick Sort averages O(n log n) with random pivots, though worst case is O(n²).' },
  { q: 'What data structure does BFS use?',                               opts: ['Stack', 'Queue', 'Heap', 'Tree'],                                        ans: 1, exp: 'BFS uses a Queue (FIFO) to explore layer by layer.' },
  { q: 'DFS uses which data structure internally?',                       opts: ['Queue', 'Stack', 'Heap', 'Linked List'],                                 ans: 1, exp: 'DFS uses a Stack (LIFO), either explicitly or via the call stack (recursion).' },
  { q: 'What is the best case for Linear Search?',                        opts: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'],                                    ans: 2, exp: 'If the target is the first element, Linear Search returns immediately—O(1).' },
  { q: 'Dynamic Programming solves subproblems:',                         opts: ['Randomly', 'Only once (memoized)', 'Multiple times', 'Never'],           ans: 1, exp: 'DP stores subproblem results (memoization) to avoid redundant computation.' },
  { q: 'Floyd-Warshall solves which problem?',                            opts: ['Max flow', 'All-pairs shortest paths', 'Minimum spanning tree', 'Topological sort'], ans: 1, exp: 'Floyd-Warshall runs three nested loops over all vertex pairs through each intermediate.' },
  { q: 'The 0/1 Knapsack problem is solved using:',                       opts: ['Greedy', 'Dynamic Programming', 'Brute Force only', 'Graph traversal'],  ans: 1, exp: '0/1 Knapsack overlapping subproblems make DP the standard approach.' },
  { q: 'Shell Sort is an extension of which sort?',                       opts: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort'],         ans: 2, exp: 'Shell Sort generalizes Insertion Sort using a gap sequence.' },
  { q: 'Ford-Fulkerson algorithm solves:',                                opts: ['Shortest path', 'Maximum flow', 'Minimum cut only', 'Graph coloring'],  ans: 1, exp: 'Ford-Fulkerson finds augmenting paths to push flow from source to sink.' },
  { q: 'Topological Sort applies to which type of graph?',                opts: ['Undirected', 'Weighted', 'Directed Acyclic Graph (DAG)', 'Complete'],    ans: 2, exp: 'Topological Sort requires a DAG—cycles would make ordering impossible.' },
  { q: "Kosaraju's algorithm finds:",                                      opts: ['BFS order', 'Strongly Connected Components', 'Minimum spanning tree', 'Shortest paths'], ans: 1, exp: 'Kosaraju does two DFS passes: one on original, one on transposed graph.' },
  { q: 'Jump Search time complexity is:',                                 opts: ['O(n)', 'O(log n)', 'O(√n)', 'O(n²)'],                                   ans: 2, exp: 'Jump Search jumps in √n steps then does linear search in a block.' },
  { q: 'Which sort uses a max-heap?',                                     opts: ['Merge Sort', 'Heap Sort', 'Quick Sort', 'Shell Sort'],                   ans: 1, exp: 'Heap Sort builds a max-heap then extracts the maximum n times.' },
  { q: 'Selection Sort always makes how many swaps?',                     opts: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],                                  ans: 2, exp: 'Selection Sort makes exactly n−1 swaps regardless of input—one per pass.' },
];

// ─── State ────────────────────────────────────────────────────────────────────
let qIdx      = 0;
let score     = 0;
let streak    = 0;
let answered  = false;
let shuffledQ = [];
const TOTAL   = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Groq: generate fresh quiz questions ─────────────────────────────────────
async function fetchQuestionsFromGroq() {
  const prompt = `Generate exactly ${TOTAL} multiple-choice quiz questions about Data Structures and Algorithms (sorting algorithms, searching algorithms, graph algorithms, dynamic programming, time/space complexity). 

STRICT rules:
- Each question must be DIFFERENT and cover a UNIQUE topic.
- Do NOT repeat questions from previous runs — randomize topic coverage.
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- Format: an array of exactly ${TOTAL} objects, each with:
  {
    "q": "Question text?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "ans": <0-indexed correct answer integer>,
    "exp": "One-sentence explanation of the correct answer."
  }
- Options must have exactly 4 items.
- "ans" must be the 0-based index of the correct option inside "opts".
- Vary difficulty: mix easy, medium, and hard questions.
- Topics to pull from (vary each call): Big-O notation, sorting stability, in-place algorithms, recursion, greedy algorithms, divide and conquer, graph traversal, shortest path, minimum spanning tree, dynamic programming, hashing, tree structures, space complexity, amortized analysis.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a computer science quiz generator. Always respond with raw JSON only — no markdown, no code fences, no extra text.' },
          { role: 'user',   content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.9   // higher temp = more variety
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    // Strip accidental markdown fences if model disobeys
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed  = JSON.parse(cleaned);

    // Validate structure
    if (!Array.isArray(parsed) || parsed.length < TOTAL) return null;
    const valid = parsed.filter(q =>
      typeof q.q === 'string' &&
      Array.isArray(q.opts) && q.opts.length === 4 &&
      typeof q.ans === 'number' && q.ans >= 0 && q.ans <= 3 &&
      typeof q.exp === 'string'
    );
    if (valid.length < TOTAL) return null;
    return valid.slice(0, TOTAL);
  } catch {
    return null;
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setLoadingState(loading) {
  const startBtn   = document.getElementById('quiz-start-btn');
  const questionEl = document.getElementById('quiz-question');
  const optsEl     = document.getElementById('quiz-options');

  if (loading) {
    if (startBtn)   { startBtn.disabled = true; startBtn.textContent = '⏳ Generating...'; }
    if (questionEl) questionEl.innerHTML = `
      <div style="text-align:center;padding:1.5rem">
        <div class="quiz-spinner"></div>
        <div style="margin-top:1rem;color:var(--text-dim);font-size:.9rem">
          🤖 AI is crafting unique questions for you…
        </div>
      </div>`;
    if (optsEl) optsEl.innerHTML = '';
  } else {
    if (startBtn) { startBtn.disabled = false; }
  }
}

function renderProgress() {
  const prog = document.getElementById('quiz-progress');
  if (!prog) return;
  prog.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const dot = document.createElement('div');
    dot.className = 'progress-dot';
    if (i < qIdx)       dot.classList.add(shuffledQ[i]._result === 'correct' ? 'dot-correct' : 'dot-wrong');
    else if (i === qIdx) dot.classList.add('dot-current');
    prog.appendChild(dot);
  }
}

function showQuestion() {
  if (qIdx >= TOTAL) { showResults(); return; }
  answered = false;
  const q = shuffledQ[qIdx];
  document.getElementById('quiz-q-num').textContent   = qIdx + 1;
  document.getElementById('quiz-q-total').textContent = TOTAL;
  document.getElementById('quiz-score').textContent   = score;
  document.getElementById('quiz-streak').textContent  = streak;
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className  = 'quiz-feedback';
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) nextBtn.style.display = 'none';

  const opts = document.getElementById('quiz-options');
  opts.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className  = 'quiz-option-btn';
    btn.textContent = String.fromCharCode(65 + i) + '. ' + opt;
    btn.id = 'qopt-' + i;
    btn.addEventListener('click', () => selectAnswer(i, q));
    opts.appendChild(btn);
  });
  renderProgress();
}

function selectAnswer(selected, q) {
  if (answered) return;
  answered = true;
  const correct  = q.ans;
  const feedback = document.getElementById('quiz-feedback');
  const allBtns  = document.querySelectorAll('.quiz-option-btn');

  allBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct-opt');
    else if (i === selected) btn.classList.add('wrong-opt');
  });

  if (selected === correct) {
    score++;
    streak++;
    q._result = 'correct';
    feedback.textContent = '✅ Correct! ' + (q.exp || '');
    feedback.className   = 'quiz-feedback feedback-correct';
  } else {
    streak = 0;
    q._result = 'wrong';
    feedback.textContent = '❌ Wrong! Correct: ' + q.opts[correct] + '. ' + (q.exp || '');
    feedback.className   = 'quiz-feedback feedback-wrong';
  }

  document.getElementById('quiz-score').textContent  = score;
  document.getElementById('quiz-streak').textContent = streak;
  renderProgress();
  const nextBtn = document.getElementById('quiz-next-btn');
  if (nextBtn) nextBtn.style.display = 'inline-block';
}

function showResults() {
  const pct   = Math.round((score / TOTAL) * 100);
  const grade = pct >= 90 ? '🏆 Expert!' : pct >= 70 ? '🥈 Proficient!' : pct >= 50 ? '🥉 Learning!' : '📚 Keep Practicing!';
  document.getElementById('quiz-question').innerHTML = `
    <div style="text-align:center;padding:1rem">
      <div style="font-size:3rem;margin-bottom:.5rem">${grade}</div>
      <div style="font-size:1.5rem;color:var(--accent3);margin-bottom:.5rem">${score} / ${TOTAL} correct</div>
      <div style="font-size:1rem;color:var(--text-dim)">${pct}% accuracy</div>
      <div style="font-size:.8rem;color:var(--text-dim);margin-top:.5rem">🤖 Questions were AI-generated — every run is unique!</div>
    </div>`;
  document.getElementById('quiz-options').innerHTML  = '';
  document.getElementById('quiz-feedback').textContent = '';
  const nextBtn  = document.getElementById('quiz-next-btn');
  if (nextBtn)  nextBtn.style.display = 'none';
  const startBtn = document.getElementById('quiz-start-btn');
  if (startBtn) startBtn.textContent = '↺ New AI Quiz';
  renderProgress();
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function initQuiz() {
  const startBtn = document.getElementById('quiz-start-btn');
  const nextBtn  = document.getElementById('quiz-next-btn');

  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      score = 0; streak = 0; qIdx = 0;

      // Show loading while LLM generates questions
      setLoadingState(true);

      let questions = await fetchQuestionsFromGroq();

      // Graceful fallback if API fails
      if (!questions) {
        console.warn('[Quiz] Groq API failed — falling back to local questions.');
        questions = shuffle(FALLBACK_QUESTIONS).slice(0, TOTAL);
      }

      shuffledQ = questions.map(q => ({ ...q, _result: null }));
      setLoadingState(false);

      startBtn.textContent = '↺ New AI Quiz';
      showQuestion();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      qIdx++;
      showQuestion();
    });
  }
}

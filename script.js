// Elements
const inputValue = document.getElementById('inputValue');
const fromBase = document.getElementById('fromBase');
const toBase = document.getElementById('toBase');
const convertBtn = document.getElementById('convertBtn');
const swapBtn = document.getElementById('swapBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const resultText = document.getElementById('resultText');
const historyList = document.getElementById('historyList');
const message = document.getElementById('message');

const history = [];

// Parse string in given base to BigInt (supports 0-9, A-Z)
function parseToBigInt(str, base) {
  if (!str || str.trim() === '') throw new Error('Empty input');
  let s = str.trim().toUpperCase();
  let negative = false;
  if (s[0] === '-') { negative = true; s = s.slice(1); }
  if (s === '') throw new Error('Empty after removing sign');

  let val = 0n;
  const bigBase = BigInt(base);
  for (let ch of s) {
    let digit;
    if (ch >= '0' && ch <= '9') digit = BigInt(ch.charCodeAt(0) - 48);
    else if (ch >= 'A' && ch <= 'Z') digit = BigInt(ch.charCodeAt(0) - 55); // A => 10
    else throw new Error(`Invalid character: ${ch}`);
    if (digit >= bigBase) throw new Error(`Digit ${ch} not valid for base ${base}`);
    val = val * bigBase + digit;
  }
  return negative ? -val : val;
}

// Convert BigInt to string in target base
function bigIntToBaseStr(n, base) {
  if (n === 0n) return '0';
  let negative = n < 0n;
  let num = negative ? -n : n;
  const bigBase = BigInt(base);
  let out = '';
  while (num > 0n) {
    const rem = num % bigBase;
    let ch;
    if (rem < 10n) ch = String(Number(rem));
    else ch = String.fromCharCode(Number(rem - 10n) + 65); // 10 -> 'A'
    out = ch + out;
    num = num / bigBase;
  }
  return negative ? '-' + out : out;
}

function showMessage(txt, isError=false) {
  message.textContent = txt;
  message.style.color = isError ? 'crimson' : 'green';
  setTimeout(()=> { message.textContent = ''; }, 2200);
}

function addHistory(entry) {
  history.unshift(entry);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = history.map(h => 
    `<li>${h.time}: <strong>${h.input}</strong> (base ${h.from}) → <strong>${h.output}</strong> (base ${h.to})</li>`
  ).join('');
}

function convert() {
  const val = inputValue.value.trim();
  const from = Number(fromBase.value);
  const to = Number(toBase.value);

  if (!val) { showMessage('Please enter a number', true); return; }

  try {
    const parsed = parseToBigInt(val, from);
    const out = bigIntToBaseStr(parsed, to);
    resultText.textContent = out;
    addHistory({ input: val, from, to, output: out, time: new Date().toLocaleString() });
    showMessage('Converted');
  } catch (err) {
    resultText.textContent = '—';
    showMessage(err.message, true);
  }
}

// Event listeners
convertBtn.addEventListener('click', convert);
inputValue.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });

swapBtn.addEventListener('click', () => {
  const tmp = fromBase.value;
  fromBase.value = toBase.value;
  toBase.value = tmp;
  // optionally set input to last result
  if (resultText.textContent && resultText.textContent !== '—') {
    inputValue.value = resultText.textContent;
    resultText.textContent = '—';
  }
});

clearBtn.addEventListener('click', () => {
  inputValue.value = '';
  resultText.textContent = '—';
  history.length = 0;
  renderHistory();
  showMessage('Cleared');
});

copyBtn.addEventListener('click', async () => {
  const text = resultText.textContent;
  if (!text || text === '—') { showMessage('Nothing to copy', true); return; }
  try {
    await navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard');
  } catch {
    showMessage('Copy failed', true);
  }
});

const symbols = ['🍒','🍋','🔔','⭐','💎','7️⃣'];
let balance = parseInt(localStorage.getItem('demoBalance')) || 1000;
let transactions = JSON.parse(localStorage.getItem('demoTx')) || [];

const reels = [];
for (let i = 0; i < 5; i++) reels.push(document.getElementById('reel' + i));

const spinBtn = document.getElementById('spinBtn');
const betSelect = document.getElementById('bet');
const messageEl = document.getElementById('message');

document.addEventListener('DOMContentLoaded', () => {
  buildReels();
  updateAllBalances();
  renderTx();
  spinBtn.addEventListener('click', spin);
});

function buildReels() {
  for (let i = 0; i < 5; i++) {
    const reel = document.getElementById('reel' + i);
    reel.innerHTML = '';
    for (let j = 0; j < 3; j++) {
      const div = document.createElement('div');
      div.className = 'symbol';
      div.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      reel.appendChild(div);
    }
  }
}

function getRandomSymbol() { return symbols[Math.floor(Math.random() * symbols.length)]; }
function getReelSymbols(reel) { return Array.from(reel.querySelectorAll('.symbol')).map(d => d.textContent); }
function setReelSymbols(reel, syms) {
  const divs = reel.querySelectorAll('.symbol');
  syms.forEach((s, i) => divs[i].textContent = s);
}

function spin() {
  const bet = parseInt(betSelect.value);
  if (balance < bet) { messageEl.textContent = 'Insufficient coins!'; return; }
  balance -= bet;
  addTx('bet', bet, 'Spin Bet');
  updateAllBalances();
  spinBtn.disabled = true;
  messageEl.textContent = 'Spinning...';
  document.querySelectorAll('.symbol').forEach(s => s.classList.remove('win'));

  reels.forEach((reel, index) => {
    reel.classList.add('spinning');
    const interval = setInterval(() => {
      setReelSymbols(reel, [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 50);
    const stopTime = 700 + index * 180 + Math.random() * 300;
    setTimeout(() => {
      clearInterval(interval);
      reel.classList.remove('spinning');
      setReelSymbols(reel, [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      if (index === reels.length - 1) { checkWins(bet); spinBtn.disabled = false; }
    }, stopTime);
  });
}

function checkWins(bet) {
  const grid = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let r = 0; r < 5; r++) grid[row].push(getReelSymbols(reels[r])[row]);
  }
  let totalWin = 0, maxMatch = 0;
  for (let row = 0; row < 3; row++) {
    const line = grid[row];
    let count = 1;
    for (let i = 1; i < 5; i++) { if (line[i] === line[0]) count++; else break; }
    if (count >= 3) {
      let mult = count === 3 ? 2 : count === 4 ? 5 : 10;
      const win = bet * mult;
      totalWin += win;
      if (count > maxMatch) maxMatch = count;
      for (let i = 0; i < count; i++) reels[i].querySelectorAll('.symbol')[row].classList.add('win');
    }
  }
  if (totalWin > 0) {
    balance += totalWin;
    addTx('win', totalWin, 'Slot Win');
    updateAllBalances();
    messageEl.textContent = `You won ${totalWin} coins! 🎉`;
    showToast(maxMatch === 5 ? `💥 BIG WIN! +${totalWin}` : `+${totalWin} coins!`);
  } else { messageEl.textContent = 'Try again!'; }
}

function updateAllBalances() {
  const navBal = document.getElementById('navBalance');
  if (navBal) navBal.textContent = balance;
  const slotBal = document.getElementById('slotBalance');
  if (slotBal) slotBal.textContent = balance;
  const walletBal = document.getElementById('walletBalance');
  if (walletBal) walletBal.textContent = balance;
  localStorage.setItem('demoBalance', balance);
}
function addTx(type, amount, note = '') {
  transactions.unshift({ type, amount, note, time: new Date().toLocaleTimeString() });
  transactions = transactions.slice(0, 30);
  localStorage.setItem('demoTx', JSON.stringify(transactions));
  renderTx();
}
function renderTx() {
  const box = document.getElementById('txHistory');
  if (!box) return;
  if (transactions.length === 0) {
    box.innerHTML = '<div style="padding:0.5rem;color:#666;text-align:center;">No transactions yet</div>';
    return;
  }
  box.innerHTML = transactions.map(tx => {
    const sign = (tx.type === 'add' || tx.type === 'win') ? '+' : '-';
    return `<div class="tx-item"><span>${tx.note}</span><span class="tx-${tx.type}">${sign}${tx.amount}</span></div>`;
  }).join('');
}
function openWallet() { document.getElementById('walletModal').classList.remove('hidden'); updateAllBalances(); renderTx(); }
function closeWallet() { document.getElementById('walletModal').classList.add('hidden'); }
function addCoins() { balance += 1000; updateAllBalances(); addTx('add', 1000, 'Coins Added'); showToast('+1000 Coins added! 🪙'); }
function withdrawCoins() {
  if (balance <= 0) { showToast('No coins to withdraw!'); return; }
  const amount = Math.min(balance, 500);
  balance -= amount;
  updateAllBalances();
  addTx('withdraw', amount, 'Withdrawn to Vault');
  showToast(`${amount} coins moved to Vault 🔒`);
}
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2500);
}

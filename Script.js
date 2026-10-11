// ========================
// SHARED WALLET + MENU
// ========================
let balance = parseInt(localStorage.getItem('demoBalance')) || 1000;
let transactions = JSON.parse(localStorage.getItem('demoTx')) || [];
let lastDailyBonus = localStorage.getItem('lastDailyBonus') || '';
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

document.addEventListener('DOMContentLoaded', () => {
  updateAllBalances();
  renderTx();
  setupSoundToggle();
  checkDailyBonus();
});

function setupSoundToggle() {
  const btn = document.getElementById('soundToggle');
  if (!btn) return;
  btn.textContent = soundEnabled ? '🔊' : '🔇';
  btn.onclick = () => {
    soundEnabled = !soundEnabled;
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    localStorage.setItem('soundEnabled', soundEnabled);
  };
}

function updateAllBalances() {
  const navBal = document.getElementById('navBalance');
  if (navBal) navBal.textContent = balance;
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
    return `<div class="tx-item"><span>${tx.note || tx.type}</span><span class="tx-${tx.type}">${sign}${tx.amount}</span></div>`;
  }).join('');
}

function openWallet() {
  document.getElementById('walletModal').classList.remove('hidden');
  updateAllBalances();
  renderTx();
}
function closeWallet() {
  document.getElementById('walletModal').classList.add('hidden');
}
function addCoins() {
  balance += 1000;
  updateAllBalances();
  addTx('add', 1000, 'Coins Added');
  showToast('+1000 Coins added! 🪙');
}
function withdrawCoins() {
  if (balance <= 0) { showToast('No coins to withdraw!'); return; }
  const amount = Math.min(balance, 500);
  balance -= amount;
  updateAllBalances();
  addTx('withdraw', amount, 'Withdrawn to Vault');
  showToast(`${amount} coins moved to Vault 🔒`);
}
function checkDailyBonus() {
  const today = new Date().toDateString();
  if (lastDailyBonus !== today) {
    balance += 500;
    lastDailyBonus = today;
    localStorage.setItem('lastDailyBonus', today);
    updateAllBalances();
    addTx('add', 500, 'Daily Bonus');
    setTimeout(() => showToast('Daily bonus: +500 🎁'), 800);
  }
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

class SumManager {
  constructor() {
    this.entries = [];
    this.service = 0; // проценты
    this._nextId = 1;
  }

  addMultiply(price, qty) {
    const value = Number(price) * Number(qty);
    if (!isFinite(value)) throw new Error('Невалидная сумма');
    this.entries.push({ id: this._nextId++, type: 'mul', price: Number(price), qty: Number(qty), value });
  }

  addDivideThenSum(price, qty) {
    if (Number(qty) === 0) throw new Error('Количество не может быть 0');
    const value = Number(price) / Number(qty);
    if (!isFinite(value)) throw new Error('Невалидная сумма');
    this.entries.push({ id: this._nextId++, type: 'div', price: Number(price), qty: Number(qty), value });
  }

  setService(percent) {
    this.service = Number(percent) || 0;
  }

  remove(id) {
    this.entries = this.entries.filter(e => e.id !== id);
  }

  clear() {
    this.entries = [];
    this._nextId = 1;
  }

  getSum() {
    return this.entries.reduce((s, e) => s + e.value, 0);
  }

  getServiceAmount() {
    return this.getSum() * (this.service / 100);
  }

  calculate() {
    const sum = this.getSum();
    const serviceAmount = this.getServiceAmount();
    const total = sum + serviceAmount; // ПРИБАВЛЯЕМ
    return { sum, serviceAmount, total };
  }
}

const mgr = new SumManager();

const el = id => document.getElementById(id);
const priceIn = el('price');
const qtyIn = el('qty');
const btnMul = el('btn-mul');
const btnDiv = el('btn-div');
const historyEl = el('history');
const sumEl = el('sum');
const serviceIn = el('service');
const serviceAmountEl = el('serviceAmount');
const totalEl = el('total');
const btnCalc = el('btn-calc');
const btnApplyService = el('btn-apply-service');
const btnResetService = el('btn-reset-service');
const btnClear = el('btn-clear');

function fmt(n){
  return Number(n).toLocaleString('ru-RU', {maximumFractionDigits:2,minimumFractionDigits: n % 1 === 0 ? 0 : 2});
}

function renderHistory(){
  historyEl.innerHTML = '';
  if (mgr.entries.length === 0) {
    historyEl.innerHTML = '<div style="padding:12px;color:var(--muted)">История пуста</div>';
    return;
  }

  mgr.entries.slice().reverse().forEach(entry => {
    const div = document.createElement('div');
    div.className = 'entry';
    const badge = document.createElement('div');
    badge.className = 'badge ' + (entry.type === 'mul' ? 'mul' : 'div');
    badge.textContent = entry.type === 'mul' ? 'x' : '/';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const p = document.createElement('div');
    p.innerHTML = `<div style="font-weight:600">${fmt(entry.value)}</div><div class="small">цена ${fmt(entry.price)} • кол-во ${entry.qty}</div>`;
    meta.appendChild(badge);
    meta.appendChild(p);

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    const del = document.createElement('button');
    del.textContent = 'Удалить';
    del.className = 'secondary';
    del.onclick = () => { mgr.remove(entry.id); renderAll(); };
    right.appendChild(del);

    div.appendChild(meta);
    div.appendChild(right);
    historyEl.appendChild(div);
  });
}

function renderSummary(){
  const { sum, serviceAmount, total } = mgr.calculate();
  sumEl.textContent = fmt(sum);
  serviceAmountEl.textContent = fmt(serviceAmount);
  totalEl.textContent = fmt(total);
}

function renderAll(){
  renderHistory();
  renderSummary();
}

btnMul.addEventListener('click', () => {
  const price = Number(priceIn.value);
  const qty = Number(qtyIn.value);
  if (!price || price <= 0 || !qty || qty <= 0){ alert('Введите корректную цену и количество'); return }
  mgr.addMultiply(price, qty);
  renderAll();
});

btnDiv.addEventListener('click', () => {
  const price = Number(priceIn.value);
  const qty = Number(qtyIn.value);
  if (!price || price <= 0 || !qty || qty <= 0){ alert('Введите корректную цену и количество'); return }
  mgr.addDivideThenSum(price, qty);
  renderAll();
});

btnApplyService.addEventListener('click', () => {
  const p = Number(serviceIn.value);
  if (isNaN(p) || p < 0 || p > 100){ alert('Введите корректный процент (0–100)'); return }
  mgr.setService(p);
  renderAll();
});

btnResetService.addEventListener('click', () => {
  serviceIn.value = '';
  mgr.setService(0);
  renderAll();
});

btnClear.addEventListener('click', () => {
  if (!confirm('Очистить все записи?')) return;
  mgr.clear(); mgr.setService(0);
  priceIn.value = qtyIn.value = serviceIn.value = '';
  renderAll();
});

btnCalc.addEventListener('click', () => {
  renderAll();
  alert('Рассчитано — смотрите правую панель');
});

[priceIn, qtyIn].forEach(i => i.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { btnMul.click(); }
}));

renderAll();
window.mgr = mgr;
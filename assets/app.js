/* Thông Điệp Của Thượng Đế — mỗi ngày một lá */
(() => {
'use strict';

const KEY = 'tdtd.v1';
const TOTAL_HINT = 100;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const { ymd, addDays, mulberry32, shuffle, deckOf, nextCardId: pickNext, streakOf } = self.TDTD;
const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const prettyDate = (s) => { const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1, d);
  return `${THU[t.getDay()]}, ngày ${d} tháng ${m} năm ${y}`; };

/* ---------- trạng thái ---------- */
const blank = () => ({ v: 1, seed: (Math.random() * 2 ** 31) | 0, draws: [], fav: [], notes: {}, since: ymd() });
let S = blank(), CARDS = [], byId = new Map();

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return save(S);
    const o = JSON.parse(raw);
    if (o && typeof o === 'object' && Array.isArray(o.draws)) {
      S = Object.assign(blank(), o);
      S.fav = Array.isArray(S.fav) ? S.fav : [];
      S.notes = (S.notes && typeof S.notes === 'object') ? S.notes : {};
      S.since = S.since || (S.draws[0] && S.draws[0].d) || ymd();
    }
  } catch (e) { /* dữ liệu hỏng -> bắt đầu lại */ }
  save(S);
};
const save = (s = S) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} return s; };

/* ---------- chọn lá ---------- */
const nextCardId = () => pickNext(CARDS.map(c => c.id), S.seed, S.draws.length);
const todayDraw = () => { const t = ymd(); return S.draws.find(d => d.d === t) || null; };

const streak = () => streakOf(S.draws, ymd());

/* ---------- giao diện ---------- */
const greet = () => { const h = new Date().getHours();
  return h < 5 ? 'Đêm an lành, con' : h < 11 ? 'Chào buổi sáng, con' : h < 14 ? 'Chào buổi trưa, con'
       : h < 18 ? 'Chào buổi chiều, con' : 'Chào buổi tối, con'; };

let toastT;
const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200); };

const openSheet = (title, html) => {
  $('#sheet-title').textContent = title; $('#sheet-body').innerHTML = html;
  $('#sheet-wrap').hidden = false; document.body.style.overflow = 'hidden';
};
const closeSheet = () => { $('#sheet-wrap').hidden = true; document.body.style.overflow = ''; };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- màn Hôm nay ---------- */
let shownDate = null;

function renderToday(justFlipped = false) {
  const t = ymd();
  shownDate = t;
  $('#greeting').textContent = greet();
  $('#today-date').textContent = prettyDate(t);

  const drawn = todayDraw();
  const card = $('#card');
  if (drawn) {
    const c = byId.get(drawn.id);
    $('#card-no').textContent = `Lá số ${String(c.id).padStart(2, '0')}`;
    $('#message').textContent = c.thong_diep;
    $('#meaning').textContent = c.y_nghia;
    if (justFlipped) {
      card.classList.add('is-flipped');
    } else {                                  // khôi phục lá đã rút: hiện ngay, không animation
      card.style.transition = 'none';
      card.classList.add('is-flipped');
      void card.offsetHeight;                 // ép trình duyệt tính lại layout
      card.style.transition = '';
    }
    $('#cta').hidden = true; $('#after').hidden = false;
    const isFav = S.fav.includes(c.id);
    $('#btn-fav').setAttribute('aria-pressed', isFav ? 'true' : 'false');
    $('#btn-fav .ico').textContent = isFav ? '♥' : '♡';
    $('#fav-label').textContent = isFav ? 'Đã thích' : 'Yêu thích';
    tickCountdown();
  } else {
    card.classList.remove('is-flipped');
    $('#cta').hidden = false; $('#after').hidden = true;
  }
  const st = streak(), n = S.draws.length;
  $('#streak').textContent = n === 0 ? '' :
    `Con đã đồng hành ${n} ngày · chuỗi hiện tại ${st} ngày${st >= 3 ? ' 🔥' : ''}`;
}

function drawToday() {
  if (todayDraw()) return;
  const id = nextCardId();
  S.draws.push({ d: ymd(), id }); save();
  renderToday(true);
  setTimeout(() => { $('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 950);
}

function tickCountdown() {
  const el = $('#countdown'); if (!el || $('#after').hidden) return;
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  let s = Math.max(0, Math.floor((mid - now) / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  el.textContent = `Lá tiếp theo mở ra sau ${h}:${m}:${ss}`;
}

/* ---------- Bộ sưu tập ---------- */
let filter = 'all';
function renderDeck() {
  const opened = new Map(S.draws.map(d => [d.id, d.d]));
  $('#deck-sub').textContent = `Con đã nhận ${opened.size}/${CARDS.length} thông điệp.`;
  const list = CARDS.filter(c => filter === 'all' ? true : filter === 'opened' ? opened.has(c.id) : S.fav.includes(c.id));
  const g = $('#grid');
  if (!list.length) {
    g.innerHTML = `<p class="empty">${filter === 'fav' ? 'Chưa có lá nào được yêu thích.<br>Chạm vào trái tim ở lá hôm nay để lưu lại.' : 'Chưa có lá nào được mở.'}</p>`;
    g.style.display = 'block'; return;
  }
  g.style.display = 'grid';
  g.innerHTML = list.map(c => {
    if (!opened.has(c.id)) return `<div class="cell locked"><span class="n">${String(c.id).padStart(2, '0')}</span><span class="t">✦</span></div>`;
    const short = c.thong_diep.split(/[.!?]/)[0].slice(0, 40);
    return `<div class="cell${S.fav.includes(c.id) ? ' fav' : ''}" data-id="${c.id}">
      <span class="n">${String(c.id).padStart(2, '0')}${S.fav.includes(c.id) ? ' ♥' : ''}</span>
      <span class="t">${esc(short)}…</span></div>`;
  }).join('');
  $$('.cell[data-id]', g).forEach(el => el.onclick = () => openCard(+el.dataset.id));
}

function openCard(id) {
  const c = byId.get(id), d = S.draws.find(x => x.id === id), note = S.notes[id] || '';
  openSheet(`Lá số ${String(id).padStart(2, '0')}`, `
    <p class="quote">${esc(c.thong_diep)}</p>
    <p>${esc(c.y_nghia)}</p>
    <p style="font-size:12px;opacity:.65">Nhận ngày ${d ? prettyDate(d.d).toLowerCase() : '—'}</p>
    ${note ? `<p style="border-top:1px solid var(--line);padding-top:12px;white-space:pre-wrap">${esc(note)}</p>` : ''}`);
}

/* ---------- Nhật ký ---------- */
function renderJournal() {
  const items = S.draws.slice().reverse().filter(d => (S.notes[d.id] || '').trim());
  $('#journal').innerHTML = items.length ? items.map(d => {
    const c = byId.get(d.id);
    return `<div class="entry"><div class="meta">${prettyDate(d.d)}</div>
      <p class="msg">${esc(c.thong_diep)}</p><p class="note">${esc(S.notes[d.id])}</p></div>`;
  }).join('') : `<p class="empty">Chưa có ghi chép nào.<br>Sau khi rút lá, chạm “Nhật ký” để viết lại điều con cảm nhận.</p>`;
}

function editNote() {
  const d = todayDraw(); if (!d) return;
  const c = byId.get(d.id);
  openSheet('Viết cho hôm nay', `
    <p class="quote">${esc(c.thong_diep)}</p>
    <textarea id="note-input" placeholder="Thông điệp này gợi cho con điều gì?">${esc(S.notes[d.id] || '')}</textarea>
    <button class="primary wide" id="note-save">Lưu lại</button>`);
  const ta = $('#note-input'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  $('#note-save').onclick = () => {
    const v = ta.value.trim();
    if (v) S.notes[d.id] = v; else delete S.notes[d.id];
    save(); closeSheet(); renderJournal(); toast(v ? 'Đã lưu vào nhật ký' : 'Đã xoá ghi chép');
  };
}

/* ---------- Chia sẻ ---------- */
function shareCard() {
  const d = todayDraw(); if (!d) return;
  const c = byId.get(d.id);
  const text = `“${c.thong_diep}”\n\n${c.y_nghia}\n\n— Thông điệp của Thượng Đế, ${prettyDate(d.d).toLowerCase()}`;
  const done = () => toast('Đã sao chép thông điệp');
  if (navigator.share) {
    navigator.share({ title: 'Thông điệp hôm nay', text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('Không sao chép được'); }
  document.body.removeChild(ta);
}

/* ---------- Giới thiệu ---------- */
function about() {
  openSheet('Giới thiệu', `
    <p>Mỗi ngày, một thông điệp. Không hơn. Con mở ứng dụng, hít một hơi thật sâu, rồi lật lá bài dành riêng cho hôm nay.</p>
    <p>Bộ bài gồm ${CARDS.length} thông điệp, được xáo theo một thứ tự riêng của con. Mỗi thông điệp chỉ đến một lần cho tới khi con đi hết trọn bộ.</p>
    <p>Nội dung lấy cảm hứng từ bộ sách <em>Đối thoại với Thượng đế</em> của Neale Donald Walsch.</p>
    <p style="font-size:12px;opacity:.6">Mọi dữ liệu chỉ nằm trên thiết bị này. Không tài khoản, không thu thập gì cả.</p>
    <button class="ghost" id="btn-reset" style="margin-top:6px">Xoá toàn bộ dữ liệu</button>`);
  $('#btn-reset').onclick = () => {
    if (!confirm('Xoá toàn bộ lịch sử, yêu thích và nhật ký trên thiết bị này?')) return;
    localStorage.removeItem(KEY); S = blank(); save();
    closeSheet(); renderAll(); toast('Đã xoá dữ liệu');
  };
}

/* ---------- điều hướng ---------- */
function go(view) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
  $$('.tab').forEach(t => t.classList.toggle('is-on', t.dataset.view === view));
  if (view === 'deck') renderDeck();
  if (view === 'journal') renderJournal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
const renderAll = () => { renderToday(); renderDeck(); renderJournal(); };

/* ---------- nền sao ---------- */
function stars() {
  const cv = $('#stars'), ctx = cv.getContext('2d');
  const draw = () => {
    const w = cv.width = innerWidth, h = cv.height = innerHeight;
    ctx.clearRect(0, 0, w, h);
    const rnd = mulberry32(20260908);
    for (let i = 0; i < Math.round(w * h / 5200); i++) {
      const x = rnd() * w, y = rnd() * h, r = rnd() * 1.25 + .25, a = rnd() * .55 + .12;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.284);
      ctx.fillStyle = `rgba(${230 + rnd() * 25 | 0},${225 + rnd() * 25 | 0},255,${a})`; ctx.fill();
    }
  };
  draw();
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 200); });
}

/* ---------- khởi động ---------- */
async function init() {
  try {
    const res = await fetch('data/cards.json', { cache: 'no-cache' });
    CARDS = await res.json();
  } catch (e) {
    document.querySelector('main').innerHTML = '<p class="empty">Không tải được dữ liệu thông điệp.</p>';
    return;
  }
  byId = new Map(CARDS.map(c => [c.id, c]));
  load(); stars(); renderAll();

  $('#card').onclick = () => { if (!todayDraw()) drawToday(); };
  $('#card').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!todayDraw()) drawToday(); } };
  $('#btn-draw').onclick = drawToday;
  $('#btn-note').onclick = editNote;
  $('#btn-share').onclick = shareCard;
  $('#btn-about').onclick = about;
  $('#btn-fav').onclick = () => {
    const d = todayDraw(); if (!d) return;
    const i = S.fav.indexOf(d.id);
    if (i < 0) S.fav.push(d.id); else S.fav.splice(i, 1);
    save(); renderToday(); renderDeck(); toast(i < 0 ? 'Đã lưu vào yêu thích' : 'Đã bỏ yêu thích');
  };
  $$('.tab').forEach(t => t.onclick = () => go(t.dataset.view));
  $$('.chip').forEach(c => c.onclick = () => {
    filter = c.dataset.filter;
    $$('.chip').forEach(x => x.classList.toggle('is-on', x === c));
    renderDeck();
  });
  $$('[data-close]').forEach(el => el.onclick = closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  // đếm ngược + tự đổi ngày khi app đang mở
  setInterval(() => {
    tickCountdown();
    if (ymd() !== shownDate) { renderAll(); toast('Một ngày mới đã bắt đầu'); }
  }, 1000);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();
})();

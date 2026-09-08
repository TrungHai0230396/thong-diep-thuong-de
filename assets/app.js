/* Thông Điệp Của Thượng Đế — mỗi ngày một lá, không lưu lại gì. */
(() => {
'use strict';

const { ymd, cardForDate } = self.TDTD;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const prettyDate = (s) => { const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1, d);
  return `${THU[t.getDay()]}, ngày ${d} tháng ${m} năm ${y}`; };
const greet = () => { const h = new Date().getHours();
  return h < 5 ? 'Đêm an lành, con' : h < 11 ? 'Chào buổi sáng, con' : h < 14 ? 'Chào buổi trưa, con'
       : h < 18 ? 'Chào buổi chiều, con' : 'Chào buổi tối, con'; };

let CARDS = [], IDS = [], today = null, revealed = false;   // toàn bộ trạng thái, chỉ trong bộ nhớ

const cardOfToday = () => CARDS.find(c => c.id === cardForDate(IDS, today));

let toastT;
const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200); };

const openSheet = (title, html) => {
  $('#sheet-title').textContent = title; $('#sheet-body').innerHTML = html;
  $('#sheet-wrap').hidden = false; document.body.style.overflow = 'hidden';
};
const closeSheet = () => { $('#sheet-wrap').hidden = true; document.body.style.overflow = ''; };

function render() {
  today = ymd();
  $('#greeting').textContent = greet();
  $('#today-date').textContent = prettyDate(today);
  const c = cardOfToday();
  $('#message').textContent = c.thong_diep;
  $('#meaning').textContent = c.y_nghia;
  $('#card').classList.toggle('is-flipped', revealed);
  $('#cta').hidden = revealed;
  $('#after').hidden = !revealed;
  tick();
}

function reveal() {
  if (revealed) return;
  revealed = true;
  render();
  setTimeout(() => $('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 950);
}

function tick() {
  if (!revealed) return;
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((mid - now) / 1000));
  const p = (n) => String(n).padStart(2, '0');
  $('#countdown').textContent = `Thông điệp mới sau ${p(s / 3600 | 0)}:${p((s % 3600) / 60 | 0)}:${p(s % 60)}`;
}

function copyText() {
  const c = cardOfToday();
  const text = `“${c.thong_diep}”\n\n${c.y_nghia}\n\n— Thông điệp của Thượng Đế, ${prettyDate(today).toLowerCase()}`;
  const done = () => toast('Đã chép vào bộ nhớ tạm');
  if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
  if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, () => fallback(text, done)); return; }
  fallback(text, done);
}
function fallback(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('Không chép được'); }
  document.body.removeChild(ta);
}

function about() {
  openSheet('Giới thiệu', `
    <p>Mỗi ngày, một thông điệp. Con mở ứng dụng, hít một hơi thật sâu, rồi lật lá bài dành cho hôm nay.</p>
    <p>Ứng dụng không lưu lại bất cứ điều gì: không lịch sử, không bộ sưu tập, không tài khoản. Đóng lại là thông điệp đi qua. Ngày mai sẽ có lá khác.</p>
    <p>Bộ bài gồm ${CARDS.length} thông điệp. Lá của mỗi ngày do chính ngày hôm đó quyết định, nên ai mở cùng ngày cũng nhận cùng một thông điệp. Đi hết ${CARDS.length} ngày mới trọn một vòng.</p>
    <p>Nội dung lấy cảm hứng từ bộ sách <em>Đối thoại với Thượng đế</em> của Neale Donald Walsch.</p>`);
}

function stars() {
  const cv = $('#stars'), ctx = cv.getContext('2d'), rndSeed = self.TDTD.mulberry32;
  const draw = () => {
    const w = cv.width = innerWidth, h = cv.height = innerHeight;
    ctx.clearRect(0, 0, w, h);
    const rnd = rndSeed(20260908);
    for (let i = 0; i < Math.round(w * h / 5200); i++) {
      const x = rnd() * w, y = rnd() * h, r = rnd() * 1.25 + .25, a = rnd() * .55 + .12;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.284);
      ctx.fillStyle = `rgba(${230 + rnd() * 25 | 0},${225 + rnd() * 25 | 0},255,${a})`; ctx.fill();
    }
  };
  draw();
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 200); });
}

async function init() {
  try {
    CARDS = await (await fetch('data/cards.json', { cache: 'no-cache' })).json();
  } catch (e) {
    $('main').innerHTML = '<p class="ephemeral">Không tải được dữ liệu thông điệp.</p>';
    return;
  }
  IDS = CARDS.map(c => c.id);
  stars(); render();

  $('#card').onclick = reveal;
  $('#card').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } };
  $('#btn-draw').onclick = reveal;
  $('#btn-share').onclick = copyText;
  $('#btn-about').onclick = about;
  $$('[data-close]').forEach(el => el.onclick = closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  setInterval(() => {                       // qua nửa đêm khi app đang mở: úp lá lại
    tick();
    if (ymd() !== today) { revealed = false; render(); toast('Một ngày mới đã bắt đầu'); }
  }, 1000);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();
})();

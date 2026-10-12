/* Ngôi sao Thiền luân xa: một buổi thiền đi qua bảy luân xa từ gốc lên đỉnh. Ở mỗi luân xa: hoa sen vẽ
   theo kinh văn, chữ chủng tử để tụng, nhịp thở 4 – 6, tiếng đàn tanpura cùng nốt và chuông xoay.

   Âm thanh tạo trên máy (luanxa.js, chạy ở luồng riêng). Cả buổi — bảy đoạn đàn nối nhau, mọi tiếng
   chuông, lúc nhỏ dần và tắt — hẹn trước trên đồng hồ của luồng âm thanh ngay khi bấm Bắt đầu, nên
   nhắm mắt, tắt màn hình, JS có bị bóp cũng không lệch nhịp. Giữ chạy khi khoá màn hình: cùng cách
   với nhạc ngủ (xem đầu nhacngu.js).

   Chỉ lưu hai lựa chọn: mấy phút mỗi luân xa, âm lượng. */
(function () {
'use strict';

const L = () => self.TDTD_LUANXA_AM;
const KEY = 'tdtd.luanxa';
const nav = self.navigator || {};
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const UA = nav.userAgent || '';
const iOS = /iPad|iPhone|iPod/.test(UA) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1 && !/Android/.test(UA));
const iOSCu = iOS && (() => {
  if (!nav.audioSession) return true;
  const m = /OS (\d+)_(\d+)/.exec(UA);
  return !!m && (+m[1] < 17 || (+m[1] === 17 && +m[2] < 5));
})();

let tam = null;
let chon = { phut: 2, am: 70 };
let ac = null, gAm = null, t0 = 0, lich = null, nut = [];
let trangThai = 'nghi';                     // nghi · chuanBi · phat · dung (tạm dừng) · tat (đang tắt)
let daTao = null, dangTao = null, tho = null, thoHong = false, tienTao = 0;
let khung = 0, khoaMan = null, vuaXong = false;
let veCu = { chang: -2, chu: '', dem: '', tho: '' };

/* ---------- lựa chọn đã lưu ---------- */

function docChon() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o && L().PHUT.includes(o.phut)) chon.phut = o.phut;
    if (o && o.am >= 5 && o.am <= 100) chon.am = Math.round(o.am);
  } catch (e) {}
}
function luuChon() { try { localStorage.setItem(KEY, JSON.stringify(chon)); } catch (e) {} }

/* ---------- tạo âm: luồng riêng nếu được ---------- */

function taoAm() {
  if (daTao) return Promise.resolve(daTao);
  if (dangTao) return dangTao;
  const trenLuongChinh = () => new Promise((xong, hong) => setTimeout(() => {
    try { xong(L().taoTatCa()); } catch (e) { hong(e); }
  }, 30));
  let p;
  if (!thoHong && typeof Worker !== 'undefined') {
    p = new Promise((xong, hong) => {
      try { tho = tho || new Worker('assets/luanxa.js'); } catch (e) { thoHong = true; trenLuongChinh().then(xong, hong); return; }
      const thoi = () => { tho.removeEventListener('message', nghe); tho.removeEventListener('error', loi); };
      const nghe = (e) => {
        const d = e.data || {};
        if (typeof d.tien === 'number') { tienTao = d.tien; veTien(); return; }
        thoi();
        d.xong ? xong({ nen: d.nen, chuong: d.chuong }) : hong(new Error(d.loi || 'không tạo được âm'));
      };
      const loi = () => { thoi(); thoHong = true; tho = null; trenLuongChinh().then(xong, hong); };   // worker không chạy thì làm trên luồng chính
      tho.addEventListener('message', nghe); tho.addEventListener('error', loi);
      tho.postMessage({ tao: true });
    });
  } else p = trenLuongChinh();
  dangTao = p.then(kq => { dangTao = null; daTao = kq; return kq; }, e => { dangTao = null; throw e; });
  return dangTao;
}

/* ---------- phát ---------- */

const heSo = (am) => (am / 100) ** 2;                    // thanh trượt theo tai nghe, không theo biên độ
const viTri = () => (ac ? Math.max(0, ac.currentTime - t0) : 0);
const dangPhat = () => ['chuanBi', 'phat', 'dung', 'tat'].includes(trangThai);
const MUC_NEN = 0.55, MUC_CHUONG = 0.5;                  // đàn làm nền, chuông nổi lên trên một chút

function batDau() {
  if (trangThai !== 'nghi') return;
  const AC = self.AudioContext || self.webkitAudioContext;
  if (!AC) { baoLoi('Trình duyệt này không phát được âm thanh.'); return; }
  try { if (nav.audioSession) nav.audioSession.type = 'playback'; } catch (e) {}
  try {
    if (!ac || ac.state === 'closed') ac = new AC();
    ac.resume();
    const im = ac.createBufferSource();                  // một mẫu lặng phát NGAY trong lúc chạm: iPhone mới chịu mở tiếng
    im.buffer = ac.createBuffer(1, 1, 22050); im.connect(ac.destination); im.start(0);
  } catch (e) { baoLoi('Không mở được âm thanh trên máy này.'); return; }
  trangThai = 'chuanBi'; vuaXong = false; ve();
  taoAm().then(kq => { if (trangThai === 'chuanBi' && ac) phat(kq); })
    .catch(() => { trangThai = 'nghi'; dongAc(); ve(); baoLoi('Tạo âm thanh không được, thử lại nhé.'); });
}

function datLich(param, ds) {
  for (const e of ds) {
    const t = t0 + e.luc;
    if (e.kieu === 'dat') param.setValueAtTime(e.gt, t);
    else if (e.kieu === 'thang') param.linearRampToValueAtTime(e.gt, t);
    else param.exponentialRampToValueAtTime(e.gt, t);
  }
}

function phat(kq) {
  const X = L();
  lich = X.lichBuoi(chon.phut);
  gAm = ac.createGain(); gAm.gain.value = heSo(chon.am); gAm.connect(ac.destination);
  t0 = ac.currentTime + 0.1;
  const dem = (x) => { const b = ac.createBuffer(1, x.length, X.SR); b.getChannelData(0).set(x); return b; };
  const bufChuong = kq.chuong.map(dem);
  nut = [];
  lich.nen.forEach((n, i) => {                           // bảy đoạn đàn, mỗi đoạn chỉ chạy trong khoảng của nó
    const src = ac.createBufferSource(), g = ac.createGain(), m = ac.createGain();
    src.buffer = dem(kq.nen[i]); src.loop = true;
    g.gain.value = 0; m.gain.value = MUC_NEN;            // gain mặc định là 1: đặt 0 trước, kẻo kêu một nhịp ở mức đủ
    datLich(g.gain, n.ds);
    src.connect(g); g.connect(m); m.connect(gAm);
    src.start(t0 + n.chay); src.stop(t0 + n.dung);
    nut.push(src);
  });
  for (const c of lich.chuong) {
    const src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = bufChuong[c.i]; g.gain.value = MUC_CHUONG * c.to;
    src.connect(g); g.connect(gAm);
    src.start(t0 + c.luc);
    nut.push(src);
  }
  /* Mốc hết buổi: một mẫu lặng đặt đúng giây cuối, phát xong là biết buổi đã hết — hẹn trên luồng âm thanh. */
  const moc = ac.createBufferSource();
  moc.buffer = ac.createBuffer(1, 1, X.SR); moc.connect(gAm);
  moc.onended = () => { if (nut.includes(moc)) { vuaXong = true; het(); } };
  moc.start(t0 + lich.tong);
  nut.push(moc);
  trangThai = 'phat';
  phienMedia(); giuMan(true); ve(); chay();
}

function tamDung() {
  if (trangThai !== 'phat' || !ac) return;
  ac.suspend();                                          // đồng hồ âm thanh đứng lại, cả lịch đứng theo
  trangThai = 'dung'; trangThaiMedia(); veNut();
}
function tiepTuc() {
  if (trangThai !== 'dung' || !ac) return;
  ac.resume(); trangThai = 'phat'; trangThaiMedia(); veNut(); chay();
}

function tat(ngay) {
  if (trangThai === 'chuanBi') { trangThai = 'nghi'; dongAc(); ve(); return; }
  if (!['phat', 'dung'].includes(trangThai) || !ac) return;
  if (ngay || trangThai === 'dung') { het(); return; }
  const bay = ac.currentTime, giay = 1.5;
  gAm.gain.cancelScheduledValues(bay);
  gAm.gain.setValueAtTime(gAm.gain.value, bay);
  gAm.gain.linearRampToValueAtTime(0, bay + giay);
  trangThai = 'tat'; veNut();
  setTimeout(() => { if (trangThai === 'tat') het(); }, giay * 1000 + 100);
}

function het() {
  const ds = nut;
  nut = [];
  for (const s of ds) { s.onended = null; try { s.stop(); } catch (e) {} }
  dongAc();
  trangThai = 'nghi'; lich = null;
  giuMan(false);
  try { nav.mediaSession.playbackState = 'none'; } catch (e) {}
  try { self.dispatchEvent(new Event('tdtd-ngu-het')); } catch (e) {}   // app.js đợi nhạc tắt mới tự cập nhật bản mới
  if (tam && tam.classList.contains('hien')) ve();
}

function dongAc() {
  if (ac) { try { ac.close(); } catch (e) {} }
  ac = null; gAm = null;
  try { if (nav.audioSession) nav.audioSession.type = 'auto'; } catch (e) {}
}

function datAm() { if (gAm && ac && trangThai !== 'tat') gAm.gain.setTargetAtTime(heSo(chon.am), ac.currentTime, 0.05); }

/* ---------- khoá màn hình, nút nhạc trên màn hình khoá ---------- */

function phienMedia() {
  const ms = nav.mediaSession;
  if (!ms) return;
  try { ms.metadata = new MediaMetadata({ title: 'Thiền luân xa', artist: `${chon.phut} phút mỗi luân xa`, album: 'Thông Điệp Của Thượng Đế' }); } catch (e) {}
  const dat = (a, f) => { try { ms.setActionHandler(a, f); } catch (e) {} };
  dat('play', tiepTuc); dat('pause', tamDung); dat('stop', () => tat());
  trangThaiMedia();
}
function trangThaiMedia() { try { nav.mediaSession.playbackState = trangThai === 'dung' ? 'paused' : 'playing'; } catch (e) {} }

function giuMan(bat) {                                   // chỉ iPhone đời iOS trước 17.5 mới cần giữ màn hình
  if (!iOSCu || !nav.wakeLock) return;
  if (bat) nav.wakeLock.request('screen').then(l => { khoaMan = l; }).catch(() => {});
  else if (khoaMan) { khoaMan.release().catch(() => {}); khoaMan = null; }
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !['phat', 'dung'].includes(trangThai)) return;
    if (iOSCu && !khoaMan) giuMan(true);
    if (trangThai === 'phat' && ac && ac.state !== 'running') { try { ac.resume(); } catch (e) {} }
    chay();
  });
}

/* ---------- hình: hoa sen theo kinh văn, thân người ngồi thiền ---------- */

/* Màu nền dưới chữ chủng tử sáng hay tối, để chọn chữ đen hay trắng. */
function sang(hex) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
}

function canhSen(n, r0, r1, w, xoay0 = 0) {
  const d = `M0 ${-r0 + 6} C ${w} ${-r0} ${w} ${-r1 * 0.72} 0 ${-r1} C ${-w} ${-r1 * 0.72} ${-w} ${-r0} 0 ${-r0 + 6}Z`;
  let s = '';
  for (let k = 0; k < n; k++) s += `<path d="${d}" transform="rotate(${(xoay0 + 360 * k / n).toFixed(2)})"/>`;
  return s;
}

function veSen(lx) {
  const S = lx.sen, r0 = 34;
  let canh;
  if (lx.canh === 1000) {                                // nghìn cánh: vẽ ba vòng, đầu cánh quay xuống theo kinh văn thì không vẽ được trên mặt phẳng
    canh = [[40, 97, 8, 0], [32, 82, 9.5, 4.5], [24, 66, 11, 0]].map(([n, r1, w, x]) => canhSen(n, 28, r1, w, x)).join('');
  } else if (lx.canh === 2) {
    canh = canhSen(2, r0, 96, 36, 90);                   // hai cánh lớn hai bên, như hình Ājñā quen vẽ
  } else {
    canh = canhSen(lx.canh, r0, 92, Math.min(30, Math.PI * (r0 + 22) / lx.canh * 1.05));
  }
  const m = S.mauGiua;
  const giua = {
    vuong: `<rect x="-21" y="-21" width="42" height="42" fill="${m}"/>`,
    liem: `<path d="M-23 -4 A23 23 0 0 0 23 -4 A18 18 0 0 1 -23 -4Z" fill="${m}"/>`,
    tamGiac: `<path d="M-27 -15 L27 -15 L0 30Z" fill="${m}"/>`,
    sao6: `<g fill="${m}" opacity=".9"><path d="M0 -28 L24 14 L-24 14Z"/><path d="M0 28 L24 -14 L-24 -14Z"/></g>`,
    tamGiacTrang: `<path d="M-28 -16 L28 -16 L0 32Z" fill="${m}"/><circle cy="-2" r="12.5" fill="#f4f1ea"/>`,
    tamGiacVien: `<path d="M-24 -13 L24 -13 L0 27Z" fill="none" stroke="${m}" stroke-width="2"/>`,
    tron: `<circle r="24" fill="${m}"/>`,
  }[S.giua] || '';
  const nhuy = S.nhuy ? Array.from({ length: 24 }, (_, k) => {
    const a = k / 24 * 2 * Math.PI;
    return `<circle cx="${(29 * Math.cos(a)).toFixed(1)}" cy="${(29 * Math.sin(a)).toFixed(1)}" r="1.8" fill="${S.nhuy}"/>`;
  }).join('') : '';
  const nenChu = S.giua === 'tamGiacTrang' ? '#f4f1ea' : S.giua === 'tamGiacVien' ? '#141022' : m;
  /* chữ nằm gọn trong hình: trong vòng trăng của Viśuddha, trong lòng tam giác của Ājñā */
  const [yChu, coChu] = { tamGiacTrang: [6, 15], tamGiacVien: [4, 15] }[S.giua] || [9, 24];
  const chu = lx.deva ? `<text y="${yChu}" text-anchor="middle" font-size="${coChu}"
    fill="${sang(nenChu) ? '#2a1a20' : '#fff'}">${lx.deva}</text>` : '';
  return `<svg class="lx-sen" viewBox="-100 -100 200 200" aria-hidden="true">
    <g class="lx-canh" fill="${S.canh}" stroke="rgba(255,255,255,.28)" stroke-width=".8">${canh}</g>
    <circle r="${lx.canh === 1000 ? 28 : r0}" fill="#141022" stroke="rgba(255,255,255,.22)"/>
    ${nhuy}${giua}${chu}
  </svg>`;
}

/* Thân người ngồi thiền, bảy chấm ở bảy vị trí; chấm đang tới sáng lên theo màu cầu vồng. */
const CHAM = [[50, 96], [50, 85], [50, 75], [50, 59], [50, 41], [50, 20], [50, 8]];
function veThan(i) {
  const cham = L().LUAN_XA.map((lx, k) => {
    const [x, y] = CHAM[k];
    const op = k === i ? 1 : k < i ? 0.55 : 0.25;
    return (k === i ? `<circle cx="${x}" cy="${y}" r="9" fill="${lx.mau}" opacity=".3"/>` : '') +
      `<circle cx="${x}" cy="${y}" r="${k === i ? 4.6 : 3.2}" fill="${lx.mau}" opacity="${op}"/>`;
  }).join('');
  return `<svg class="lx-than" viewBox="0 0 100 120" aria-hidden="true">
    <g fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.2)" stroke-width="1">
      <circle cx="50" cy="20" r="12"/>
      <path d="M45 31 L55 31 L56 38 L44 38Z"/>
      <path d="M29 44 Q50 36 71 44 Q77 62 68 92 L32 92 Q23 62 29 44Z"/>
      <path d="M29 46 Q17 72 14 99 L22 100 Q28 76 34 60Z"/>
      <path d="M71 46 Q83 72 86 99 L78 100 Q72 76 66 60Z"/>
      <ellipse cx="50" cy="103" rx="44" ry="11"/>
    </g>${cham}
  </svg>`;
}

/* ---------- giao diện ---------- */

function baoLoi(s) { const o = tam && tam.querySelector('.lx-loi'); if (o) { o.textContent = s; o.hidden = false; } }

function ve() {
  if (!tam) return;
  const dangNghe = dangPhat();
  tam.querySelector('.lx-chon').hidden = dangNghe;
  tam.querySelector('.lx-nghe').hidden = !dangNghe;
  tam.classList.toggle('dang-nghe', dangNghe);
  if (dangNghe) veNghe(); else veChon();
  tam.querySelector('.xn-trong').scrollTop = 0;
}

function veChon() {
  const X = L(), o = tam.querySelector('.lx-chon'), tong = 7 * chon.phut + X.KET / 60;
  o.innerHTML = `
    <p class="xn-tieude">Thiền luân xa</p>
    ${vuaXong ? '<p class="lx-xong">Buổi thiền vừa xong. Ngồi yên thêm chút nữa nếu bạn muốn.</p>' : ''}
    <p class="lx-mo">Một buổi thiền đi qua bảy luân xa, từ đáy cột sống lên đỉnh đầu. Ở mỗi luân xa: đặt sự chú ý vào đúng chỗ,
      thở chậm, tụng âm chủng tử theo tiếng đàn tanpura; chuông xoay ngân mỗi ba hơi thở. Âm thanh tạo ngay trên máy, không cần mạng.</p>

    <section class="xn-khoi">
      <p class="xn-tieu">Bảy luân xa</p>
      ${X.LUAN_XA.map(lx => `
      <details class="lx-mot">
        <summary><i style="background:${lx.mau}"></i><span class="lx-mot-ten"><b>${lx.so} · ${esc(lx.ten)}</b>
          <small>${esc(lx.goi)} · ${lx.bija ? esc(lx.bija) : 'im lặng'} · ${esc(lx.viTri)}</small></span></summary>
        <div class="lx-mot-than">
          <div class="lx-mot-sen">${veSen(lx)}</div>
          <p><b>${esc(lx.ten)}</b> nghĩa là “${esc(lx.nghia)}”. Yếu tố: ${esc(lx.yeuTo)}. ${lx.canh === 1000 ? 'Nghìn' : lx.canh} cánh.</p>
          <p>${esc(lx.kinh)}</p>
          <p>Chủng tử: ${lx.bija ? `<b>${esc(lx.bija)}</b> (${lx.deva}) — ${esc(lx.doc)}` : esc(lx.doc)}.</p>
          <p class="lx-mot-hz">Chuông ${lx.hz} Hz, đàn Sa ${X.goc(lx.hz).toFixed(1).replace('.', ',')} Hz — bảng tần số thời nay, xem “Nói cho đúng”.</p>
        </div>
      </details>`).join('')}
    </section>

    <section class="xn-khoi">
      <p class="xn-tieu">Mỗi luân xa</p>
      <div class="ng-gio lx-gio" role="radiogroup" aria-label="Số phút cho mỗi luân xa">${X.PHUT.map(p => `
        <button type="button" role="radio" aria-checked="${p === chon.phut}" class="${p === chon.phut ? 'chon' : ''}" data-phut="${p}">${p}<small> phút</small></button>`).join('')}
      </div>
      <p class="xn-ghi">Cả buổi ${tong} phút: bảy luân xa, mỗi luân xa ${chon.phut} phút, rồi một phút ngồi yên.</p>
      <p class="xn-tieu">Âm lượng</p>
      <input class="ng-am lx-am" type="range" min="5" max="100" step="1" value="${chon.am}" aria-label="Âm lượng">
    </section>

    <button class="ng-batdau lx-batdau" type="button">Bắt đầu</button>
    <p class="ng-loi lx-loi" hidden></p>
    ${iOSCu ? `<p class="ng-canh">iPhone chạy iOS cũ hơn 17.5 sẽ dừng tiếng khi khoá màn hình, nên trong lúc thiền trang giữ màn hình sáng
      — hạ độ sáng xuống thấp nhất. Không nghe tiếng thì gạt tắt chế độ im lặng.</p>` : ''}

    <section class="xn-khoi ng-vi">
      <p class="xn-tieu">Cách ngồi</p>
      <p><b>Ngồi thẳng lưng</b>, trên đệm hay trên ghế đều được, vai thả lỏng, nhắm mắt. Đeo tai nghe hoặc để loa vừa đủ nghe.</p>
      <p><b>Thở bằng mũi: hít vào 4 giây, thở ra 6 giây</b> — sáu hơi mỗi phút. Chữ trên màn hình nhắc nhịp; nhắm mắt rồi thì cứ thở chậm theo ý mình.</p>
      <p><b>Tụng khi thở ra</b>, kéo dài hết hơi, cao độ theo tiếng đàn — giọng trầm hay cao hơn một quãng tám đều được. Không tiện ra tiếng thì tụng thầm.</p>
      <p><b>Đặt sự chú ý</b> vào vùng của luân xa đang tới. Ý nghĩ trôi đi đâu thì nhẹ nhàng đưa về.</p>
      <p><b>Thấy chóng mặt hay khó chịu</b> thì thở bình thường lại, mở mắt; dừng lúc nào cũng được.</p>
    </section>

    <section class="xn-khoi ng-vi">
      <p class="xn-tieu">Nói cho đúng</p>
      <p><b>Luân xa là khái niệm của thiền yoga – tantra.</b> Hệ bảy luân xa quen thuộc ngày nay dựa trên sách Ṣaṭ-cakra-nirūpaṇa của
        Pūrṇānanda (năm 1577), được Arthur Avalon dịch ra tiếng Anh năm 1919. Khoa học chưa tìm thấy luân xa như một bộ phận của cơ thể,
        nên “kích hoạt” ở đây là luyện sự chú ý, hơi thở và âm thanh — không phải một tác động vật lý.</p>
      <p><b>Màu cầu vồng</b> (đỏ ở gốc tới tím ở đỉnh) là quy ước thời nay: Leadbeater đưa ra năm 1927, phổ biến từ cuối thập niên 1970.
        Hoa sen trong app vẽ theo lời kinh văn tả — vì thế luân xa rốn có cánh xanh thẫm, luân xa tim có cánh đỏ.</p>
      <p><b>Các tần số 396 – 963 Hz</b> (“solfeggio”) do Joseph Puleo tính ra từ số câu trong Kinh Thánh khoảng thập niên 1970, Leonard
        Horowitz phổ biến sau đó. Không có trong kinh sách cổ nào, và không có bằng chứng tần số nào chữa được bệnh. App dùng chúng làm cao
        độ chuông cho mỗi luân xa vì đây là bảng người ta hay gặp; đàn lấy cùng nốt, hạ vài quãng tám cho vừa giọng tụng.</p>
      <p><b>Điều có bằng chứng:</b> thở chậm dưới 10 hơi mỗi phút làm tăng hoạt động của hệ phó giao cảm, phần thần kinh giúp cơ thể dịu
        lại (tổng hợp 223 nghiên cứu, Laborde và cs. 2022). Sau một giờ ngồi nghe chuông xoay, 62 người thấy bớt căng thẳng, bớt mệt
        (Goldsby và cs. 2017 — chưa có nhóm đối chứng; tổng quan năm 2020 cho rằng còn quá ít nghiên cứu để coi đây là liệu pháp). Tụng OM:
        chụp cộng hưởng từ 12 người thấy giảm hoạt động ở hạnh nhân và hồi hải mã, vùng xử lý cảm xúc (Kalyani và cs. 2011, nghiên cứu thí điểm).</p>
    </section>

    <section class="xn-khoi ng-vi">
      <p class="xn-tieu">Âm thanh làm thế nào</p>
      <p><b>Đàn tanpura</b>, tiếng nền của nhạc Ấn Độ: bốn dây lên Pa – Sa – Sa – Sa thấp, gảy lần lượt thành vòng. Cầu đàn jawari làm bồi âm
        dâng lên rồi lắng xuống trong mỗi lần gảy; app mô phỏng gần đúng điều đó.</p>
      <p><b>Chuông xoay</b>: năm tần số riêng theo đúng tỉ lệ đo trên một chuông thật (472 – 1329 – 2448 – 3738 – 5165 Hz). Chuông không tròn
        tuyệt đối nên mỗi tần số tách đôi cách nhau vài Hz, nghe ngân rung như chuông thật.</p>
    </section>
    <p class="xn-nguon">Nguồn: Pūrṇānanda, Ṣaṭ-cakra-nirūpaṇa (1577), bản dịch Arthur Avalon 1919 (wisdomlib.org); Wikipedia các mục Chakra,
      Muladhara, Svadhishthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara, Tanpura; Science Feedback về tần số solfeggio; Laborde và cs.
      2022 (thở chậm và nhịp tim); Zaccaro và cs., Frontiers in Human Neuroscience 2018; Goldsby và cs., Journal of Evidence-Based
      Complementary & Alternative Medicine 2017; Stanhope & Weinstein, Complementary Therapies in Medicine 2020; Kalyani và cs.,
      International Journal of Yoga 2011; Gołaś & Filipek, Archives of Acoustics 2016; Inácio và cs., Acta Acustica 2006; Terwagne & Bush,
      Tibetan Singing Bowls (2011). Đây là bài thiền tham khảo, không thay lời khuyên của bác sĩ.</p>`;

  o.querySelectorAll('.lx-gio button').forEach(n => { n.onclick = () => { chon.phut = +n.dataset.phut; luuChon(); veChon(); }; });
  const am = o.querySelector('.lx-am');
  am.oninput = () => { chon.am = +am.value; luuChon(); };
  o.querySelector('.lx-batdau').onclick = batDau;
  taoAm().catch(() => {});                                // tạo sẵn trong lúc người dùng còn đọc
}

function veNghe() {
  const o = tam.querySelector('.lx-nghe');
  o.innerHTML = `
    <button class="ng-lui lx-lui" type="button" aria-label="Dừng buổi thiền, quay lại">‹ Quay lại</button>
    <div class="lx-hoa"><div class="lx-hoa-trong"></div></div>
    <div class="lx-hang">
      <div class="lx-than-o"></div>
      <div class="lx-chu">
        <p class="lx-so"></p>
        <p class="lx-ten"></p>
        <p class="lx-bija"></p>
        <p class="lx-doc"></p>
        <p class="lx-chuy"></p>
      </div>
    </div>
    <p class="lx-tho" aria-live="off"></p>
    <p class="lx-dem"></p>
    <div class="ng-nut lx-nut">
      <button class="lx-dung" type="button"></button>
      <button class="lx-tat" type="button">Tắt</button>
    </div>
    <label class="ng-am-nhan">Âm lượng <input class="ng-am lx-am" type="range" min="5" max="100" step="1" value="${chon.am}"></label>
    <p class="xn-ghi ng-giua">${iOSCu ? 'Màn hình được giữ sáng trong lúc thiền. Hạ độ sáng thấp nhất rồi nhắm mắt.'
      : 'Nhắm mắt, tắt màn hình đều được: chuông và đàn vẫn đi đúng nhịp tới hết buổi.'} Đóng trang này là dừng.</p>`;
  o.querySelector('.lx-dung').onclick = () => (trangThai === 'dung' ? tiepTuc() : tamDung());
  o.querySelector('.lx-tat').onclick = () => tat();
  o.querySelector('.lx-lui').onclick = () => tat(true);
  const am = o.querySelector('.lx-am');
  am.oninput = () => { chon.am = +am.value; luuChon(); datAm(); };
  veCu = { chang: -2, chu: '', dem: '', tho: '' };
  veNut(); capNhat();
}

function veNut() {
  if (!tam) return;
  const d = tam.querySelector('.lx-dung'), t = tam.querySelector('.lx-tat');
  if (!d) return;
  d.textContent = trangThai === 'dung' ? 'Tiếp tục' : 'Tạm dừng';
  d.disabled = ['chuanBi', 'tat'].includes(trangThai);
  t.disabled = trangThai === 'tat';
  capNhat();
}

function veTien() {
  const o = tam && tam.querySelector('.lx-tho');
  if (o && trangThai === 'chuanBi') o.textContent = `Đang chuẩn bị âm thanh… ${Math.round(tienTao * 100)}%`;
}

/* Gọi mỗi khung hình: chỉ viết lại phần chữ nào đổi, hoa sen chỉ vẽ lại khi sang luân xa mới. */
function capNhat() {
  if (!tam || tam.querySelector('.lx-nghe').hidden) return;
  const X = L(), lx7 = X.LUAN_XA;
  const hoa = tam.querySelector('.lx-hoa-trong');
  if (trangThai === 'chuanBi' || !lich) {
    if (veCu.chang !== -1) {
      veCu.chang = -1;
      hoa.innerHTML = veSen(lx7[0]); tam.querySelector('.lx-than-o').innerHTML = veThan(0);
      tam.querySelector('.lx-so').textContent = 'Luân xa 1 / 7'; tam.querySelector('.lx-ten').textContent = lx7[0].ten;
      tam.querySelector('.lx-bija').textContent = lx7[0].bija;
      tam.querySelector('.lx-doc').textContent = ''; tam.querySelector('.lx-chuy').textContent = '';
    }
    veTien();
    return;
  }
  const t = viTri(), o = X.dangO(t, lich), i = o.ket ? 7 : o.i;
  if (veCu.chang !== i) {
    veCu.chang = i;
    const lx = lx7[Math.min(i, 6)];
    hoa.innerHTML = veSen(lx);
    tam.querySelector('.lx-than-o').innerHTML = veThan(o.ket ? 7 : i);
    tam.style.setProperty('--lx-mau', lx.mau);
    tam.querySelector('.lx-so').textContent = o.ket ? 'Xong bảy luân xa' : `Luân xa ${lx.so} / 7 · ${lx.goi}`;
    tam.querySelector('.lx-ten').textContent = o.ket ? '' : lx.ten;
    tam.querySelector('.lx-bija').textContent = o.ket ? '' : (lx.bija || 'Im lặng');
    tam.querySelector('.lx-doc').textContent = o.ket ? '' : lx.doc;
    tam.querySelector('.lx-chuy').textContent = o.ket ? 'Ngồi yên thêm một lúc. Mở mắt khi bạn sẵn sàng.' : `Đặt sự chú ý ở ${lx.viTri}.`;
  }
  const h = X.hoiTho(t), lx = lx7[Math.min(i, 6)];
  const cauTho = trangThai === 'dung' ? 'Đang tạm dừng' : trangThai === 'tat' ? 'Đang dừng…' : o.ket ? ''
    : h.pha === 'hit' ? 'Hít vào…' : lx.bija ? `Thở ra, tụng ${lx.bija}` : 'Thở ra, lặng yên';
  if (cauTho !== veCu.tho) { veCu.tho = cauTho; tam.querySelector('.lx-tho').textContent = cauTho; }
  const dem = o.ket ? `còn ${X.dongHo(o.con)}` : `còn ${X.dongHo(o.conChang)} ở luân xa này · cả buổi còn ${X.dongHo(o.con)}`;
  if (dem !== veCu.dem) { veCu.dem = dem; tam.querySelector('.lx-dem').textContent = dem; }
  /* hoa sen phồng lên khi hít vào, thu lại khi thở ra; lúc kết thì mờ dần theo tiếng đàn */
  const em = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
  const co = o.ket ? 0.94 : h.pha === 'hit' ? 0.9 + 0.12 * em(h.tien) : 1.02 - 0.12 * em(h.tien);
  const mo = o.ket ? Math.max(0.15, X.muc(t, lich.nen[6].ds)) : 1;
  hoa.style.transform = `scale(${co.toFixed(3)})`;
  hoa.style.opacity = mo.toFixed(3);
}

function chay() {
  cancelAnimationFrame(khung);
  const buoc = () => {
    if (!tam || !tam.classList.contains('hien') || !['phat', 'tat', 'dung', 'chuanBi'].includes(trangThai)) return;
    if (typeof document !== 'undefined' && document.hidden) return;   // trang ẩn thì thôi vẽ; hiện lại sẽ chạy tiếp
    capNhat();
    khung = requestAnimationFrame(buoc);
  };
  khung = requestAnimationFrame(buoc);
}

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'luanxa';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="xn-trong">
      <div class="lx-chon"></div>
      <div class="lx-nghe" hidden></div>
    </div>`;
  document.body.appendChild(tam);
  tam.querySelector('.xn-dong').onclick = dong;
}

function mo() {
  dungKhung();
  docChon();
  vuaXong = false;
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  ve();
  if (dangPhat()) chay();
}

function dong() {
  tat(true);                                             // đóng trang là dừng: không để âm chạy ngầm không ai thấy
  cancelAnimationFrame(khung);
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong();
});

self.TDTD_LUANXA = { mo, dong, dangPhat,
  _trangThai: () => trangThai, _lich: () => lich, _viTri: () => viTri(), _ac: () => ac && ac.state,
  _tamDung: tamDung, _tiepTuc: tiepTuc, _tat: tat, _batDau: batDau,
  _veSen: (i) => veSen(L().LUAN_XA[i]), _veThan: veThan, _soNut: () => nut.length };
})();

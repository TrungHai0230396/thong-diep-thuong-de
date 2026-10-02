/* Ngôi sao Nhạc ngủ: chọn một âm, hẹn giờ, tắt màn hình. Âm nhỏ dần rồi tự tắt.

   Âm thanh tạo ngay trên máy (rungu.js), không tải gì về. Toàn bộ lịch nhỏ dần và lúc tắt được hẹn
   trước trên đồng hồ của luồng âm thanh ngay khi bấm Bắt đầu, nên khoá màn hình rồi JS có bị bóp
   cũng không sao.

   Giữ chạy khi khoá màn hình:
   - iPhone: Web Audio mặc định đi đường "ambient" — bị nút im lặng tắt tiếng, và bị dừng khi khoá máy.
     Từ iOS 17 có navigator.audioSession.type = 'playback' (WebKit bug 237322) để đi đường như app nhạc;
     lỗi vẫn bị dừng khi khoá máy dù đã đặt 'playback' được sửa ở iOS 17.5 (WebKit bug 261554).
     iOS cũ hơn: giữ màn hình sáng (nền đen) trong lúc phát, và báo cho người dùng biết.
   - Android: Chrome không dừng trang đang phát tiếng khi tắt màn hình.

   Chỉ lưu ba lựa chọn (âm nào, hẹn bao lâu, âm lượng) để tối sau mở ra là sẵn. */
(function () {
'use strict';

const R = () => self.TDTD_RUNGU;
const KEY = 'tdtd.ngu';
const nav = self.navigator || {};
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const UA = nav.userAgent || '';
const iOS = /iPad|iPhone|iPod/.test(UA) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1 && !/Android/.test(UA));   // iPad đời mới tự xưng là Mac
const iOSCu = iOS && (() => {
  if (!nav.audioSession) return true;
  const m = /OS (\d+)_(\d+)/.exec(UA);
  return !!m && (+m[1] < 17 || (+m[1] === 17 && +m[2] < 5));
})();

let tam = null;
let chon = { bai: 'nhacRu', phut: 30, am: 60 };
let ac = null, nguon = null, nhanh = null, gAm = null, t0 = 0, hg = null;
let trangThai = 'nghi';                     // nghi · chuanBi · phat · dung (tạm dừng)
let daTao = null, dangTao = null, tho = null, thoHong = false;
let khung = 0, giayCu = -1, khoaMan = null;

/* ---------- lựa chọn đã lưu ---------- */

function docChon() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o && R().BAI.some(b => b.id === o.bai)) chon.bai = o.bai;
    if (o && R().PHUT.includes(o.phut)) chon.phut = o.phut;
    if (o && o.am >= 5 && o.am <= 100) chon.am = Math.round(o.am);
  } catch (e) {}
}
function luuChon() { try { localStorage.setItem(KEY, JSON.stringify(chon)); } catch (e) {} }

/* ---------- tạo âm: luồng riêng nếu được ---------- */

function taoAm(id) {
  if (daTao && daTao.id === id) return Promise.resolve(daTao);
  if (dangTao && dangTao.id === id) return dangTao.p;
  const trenLuongChinh = () => new Promise((xong, hong) => setTimeout(() => {
    try { const kq = R().tao(id); kq ? xong({ id, ...kq }) : hong(new Error('không có âm ' + id)); } catch (e) { hong(e); }
  }, 30));
  let p;
  if (!thoHong && typeof Worker !== 'undefined') {
    p = new Promise((xong, hong) => {
      try { tho = tho || new Worker('assets/rungu.js'); } catch (e) { thoHong = true; trenLuongChinh().then(xong, hong); return; }
      const nghe = (e) => {
        if (!e.data || e.data.id !== id) return;
        tho.removeEventListener('message', nghe); tho.removeEventListener('error', loi);
        e.data.loi ? hong(new Error('không có âm ' + id)) : xong(e.data);
      };
      const loi = () => {                                // worker không chạy được thì làm ngay trên luồng chính
        tho.removeEventListener('message', nghe); tho.removeEventListener('error', loi);
        thoHong = true; tho = null; trenLuongChinh().then(xong, hong);
      };
      tho.addEventListener('message', nghe); tho.addEventListener('error', loi);
      tho.postMessage({ id });
    });
  } else p = trenLuongChinh();
  dangTao = { id, p };
  return p.then(kq => {
    if (dangTao && dangTao.id === id) dangTao = null;
    daTao = kq;                                          // chỉ giữ một âm trong bộ nhớ (~15 MB)
    return kq;
  }, e => { if (dangTao && dangTao.id === id) dangTao = null; throw e; });
}

/* ---------- phát ---------- */

const heSo = (am) => (am / 100) ** 2;                    // thanh trượt theo tai nghe, không theo biên độ
const viTri = () => (ac ? Math.max(0, ac.currentTime - t0) : 0);
const baiDangChon = () => R().BAI.find(b => b.id === chon.bai) || R().BAI[0];

/* Một "nhánh" = gain theo lịch hẹn giờ, nối sau nó một gain để cắt êm. Lúc kéo dài thời gian thì
   KHÔNG huỷ lịch cũ (huỷ một đường đang dốc dở làm âm lượng nhảy, nghe "bụp"), mà mở nhánh mới với lịch
   mới và chuyển êm 0,3 giây từ nhánh cũ sang. Cùng một nguồn nên cộng lại vẫn đúng mức. */
function moNhanh(ds, vao) {
  const g = ac.createGain(), cat = ac.createGain();
  g.gain.value = ds[0].gt; cat.gain.value = vao ? 0 : 1;   // mặc định của gain là 1: đặt trước, kẻo kịp kêu một nhịp ở mức đủ
  for (const e of ds) {
    const t = t0 + e.luc;
    if (e.kieu === 'dat') g.gain.setValueAtTime(e.gt, t);
    else if (e.kieu === 'thang') g.gain.linearRampToValueAtTime(e.gt, t);
    else g.gain.exponentialRampToValueAtTime(e.gt, t);
  }
  if (vao) { const bay = ac.currentTime; cat.gain.setValueAtTime(0, bay); cat.gain.linearRampToValueAtTime(1, bay + 0.3); }
  nguon.connect(g); g.connect(cat); cat.connect(gAm);
  return { g, cat };
}
function boNhanh(n, giay) {
  const bay = ac.currentTime;
  n.cat.gain.setValueAtTime(1, bay); n.cat.gain.linearRampToValueAtTime(0, bay + giay);
  setTimeout(() => { try { n.cat.disconnect(); n.g.disconnect(); } catch (e) {} }, giay * 1000 + 200);
}

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
  trangThai = 'chuanBi'; ve();
  taoAm(chon.bai).then(kq => { if (trangThai === 'chuanBi' && ac) phat(kq); })
    .catch(() => { trangThai = 'nghi'; dongAc(); ve(); baoLoi('Tạo âm thanh không được, thử lại nhé.'); });
}

function phat(kq) {
  const X = R(), n = kq.L.length, buf = ac.createBuffer(2, n, X.SR);
  buf.getChannelData(0).set(kq.L); buf.getChannelData(1).set(kq.R);
  nguon = ac.createBufferSource(); nguon.buffer = buf; nguon.loop = true;
  gAm = ac.createGain(); gAm.gain.value = heSo(chon.am); gAm.connect(ac.destination);
  hg = X.henGio(chon.phut);
  t0 = ac.currentTime + 0.08;
  nhanh = moNhanh(X.lich(hg), false);
  const ng = nguon;
  ng.onended = () => { if (nguon === ng) het(); };
  ng.start(t0);
  ng.stop(t0 + hg.tong + 0.05);                          // tự tắt, hẹn trên luồng âm thanh
  trangThai = 'phat';
  phienMedia(); giuMan(true); ve(); chay();
}

function tamDung() {
  if (trangThai !== 'phat' || !ac) return;
  ac.suspend();                                          // đồng hồ âm thanh đứng lại, lịch hẹn giờ đứng theo
  trangThai = 'dung'; trangThaiMedia(); veDieuKhien();
}
function tiepTuc() {
  if (trangThai !== 'dung' || !ac) return;
  ac.resume(); trangThai = 'phat'; trangThaiMedia(); veDieuKhien(); chay();
}

function themGio(phut = 15) {
  if (!['phat', 'dung'].includes(trangThai) || !ac) return;
  const X = R(), t = viTri(), g = X.amLuong(t, hg);
  hg = X.keoDai(hg, phut);
  const cu = nhanh, dung = trangThai === 'dung';
  nhanh = moNhanh(X.lich(hg, t, g), !dung);
  if (dung) { try { cu.cat.disconnect(); cu.g.disconnect(); } catch (e) {} }   // đang lặng, đổi thẳng không ai nghe
  else boNhanh(cu, 0.3);
  try { nguon.stop(t0 + hg.tong + 0.05); } catch (e) {}  // gọi stop lần nữa: lần sau cùng mới tính
  veDem(true);
}

function tat(ngay) {
  if (trangThai === 'chuanBi') { trangThai = 'nghi'; dongAc(); ve(); return; }
  if (!['phat', 'dung'].includes(trangThai) || !ac || !nguon) return;
  if (ngay || trangThai === 'dung') { het(); return; }
  const giay = 1.5, ng = nguon;
  boNhanh(nhanh, giay);
  try { ng.stop(ac.currentTime + giay + 0.05); } catch (e) {}
  trangThai = 'tat'; veDieuKhien();
}

function het() {
  const ng = nguon;
  nguon = null; nhanh = null;
  if (ng) { ng.onended = null; try { ng.stop(); } catch (e) {} }
  dongAc();
  trangThai = 'nghi';
  giuMan(false);
  try { nav.mediaSession.playbackState = 'none'; } catch (e) {}
  try { self.dispatchEvent(new Event('tdtd-ngu-het')); } catch (e) {}   // app.js đợi lúc này mới tự cập nhật bản mới
  if (tam && tam.classList.contains('hien')) ve();
}

function dongAc() {
  if (ac) { try { ac.close(); } catch (e) {} }
  ac = null;
  try { if (nav.audioSession) nav.audioSession.type = 'auto'; } catch (e) {}
}

/* ---------- khoá màn hình, nút nhạc trên màn hình khoá ---------- */

function phienMedia() {
  const ms = nav.mediaSession;
  if (!ms) return;
  try { ms.metadata = new MediaMetadata({ title: baiDangChon().ten, artist: 'Nhạc ngủ', album: 'Thông Điệp Của Thượng Đế' }); } catch (e) {}
  const dat = (a, f) => { try { ms.setActionHandler(a, f); } catch (e) {} };
  dat('play', tiepTuc); dat('pause', tamDung); dat('stop', () => tat());
  trangThaiMedia();
}
function trangThaiMedia() { try { nav.mediaSession.playbackState = trangThai === 'dung' ? 'paused' : 'playing'; } catch (e) {} }

/* Chỉ iPhone đời iOS trước 17.5 mới cần giữ màn hình: máy khác khoá màn hình vẫn phát. */
function giuMan(bat) {
  if (!iOSCu || !nav.wakeLock) return;
  if (bat) nav.wakeLock.request('screen').then(l => { khoaMan = l; }).catch(() => {});
  else if (khoaMan) { khoaMan.release().catch(() => {}); khoaMan = null; }
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (['phat', 'dung'].includes(trangThai)) {
      if (iOSCu && !khoaMan) giuMan(true);              // khoá màn hình bị nhả khi trang ẩn, xin lại
      if (trangThai === 'phat' && ac && ac.state !== 'running') { try { ac.resume(); } catch (e) {} }   // vd. vừa có cuộc gọi
      chay();
    }
  });
}

/* ---------- giao diện ---------- */

function baoLoi(s) { const o = tam && tam.querySelector('.ng-loi'); if (o) { o.textContent = s; o.hidden = false; } }

function ve() {
  if (!tam) return;
  const dangNghe = ['phat', 'dung', 'tat', 'chuanBi'].includes(trangThai);
  tam.querySelector('.ng-chon').hidden = dangNghe;
  tam.querySelector('.ng-nghe').hidden = !dangNghe;
  tam.classList.toggle('dang-nghe', dangNghe);
  if (dangNghe) veNghe(); else veChon();
  tam.querySelector('.xn-trong').scrollTop = 0;
}

function veChon() {
  const X = R(), o = tam.querySelector('.ng-chon'), b = baiDangChon(), hgThu = X.henGio(chon.phut);
  o.innerHTML = `
    <p class="xn-tieude">Nhạc ngủ</p>
    <p class="ng-mo">Chọn một âm, hẹn giờ, rồi tắt màn hình. Âm nhỏ dần rồi tự tắt. Âm thanh tạo ngay trên máy, không cần mạng.</p>

    <section class="xn-khoi">
      <p class="xn-tieu">Âm thanh</p>
      <div class="ng-ds" role="radiogroup" aria-label="Chọn âm thanh">${X.BAI.map(x => `
        <button class="ng-bai${x.id === b.id ? ' chon' : ''}" type="button" role="radio" aria-checked="${x.id === b.id}" data-bai="${x.id}">
          <b>${esc(x.ten)}</b><span>${esc(x.mo)}</span>${x.taiNghe ? '<i>cần tai nghe</i>' : ''}
        </button>`).join('')}
      </div>
      <p class="ng-bc">${esc(b.bc)}</p>
    </section>

    <section class="xn-khoi">
      <p class="xn-tieu">Tự tắt sau</p>
      <div class="ng-gio" role="radiogroup" aria-label="Hẹn giờ tắt">${X.PHUT.map(p => `
        <button type="button" role="radio" aria-checked="${p === chon.phut}" class="${p === chon.phut ? 'chon' : ''}" data-phut="${p}">${p}<small> phút</small></button>`).join('')}
      </div>
      <p class="xn-ghi">Nhỏ dần trong ${Math.round(hgThu.giam / 60)} phút cuối rồi tắt hẳn. Không có chế độ mở cả đêm — vì sao thì xem ở dưới.</p>
      <p class="xn-tieu">Âm lượng</p>
      <input class="ng-am" type="range" min="5" max="100" step="1" value="${chon.am}" aria-label="Âm lượng">
      <p class="xn-ghi">Để nhỏ, vừa đủ nghe. Chỉnh thêm bằng nút âm lượng của máy.</p>
    </section>

    <button class="ng-batdau" type="button">Bắt đầu</button>
    <p class="ng-loi" hidden></p>
    ${iOSCu ? `<p class="ng-canh">iPhone chạy iOS cũ hơn 17.5 sẽ dừng nhạc khi khoá màn hình, nên trong lúc phát trang sẽ giữ màn hình sáng
      (nền đen) — hạ độ sáng xuống thấp nhất. Nếu không nghe tiếng, gạt tắt chế độ im lặng. Cập nhật iOS thì tắt màn hình thoải mái.</p>` : ''}

    <section class="xn-khoi ng-vi">
      <p class="xn-tieu">Để dễ ngủ hơn</p>
      <p><b>Hẹn 30–45 phút là vừa.</b> Các nghiên cứu cho nghe 25–50 phút trước khi ngủ, đều đặn mỗi tối từ vài ngày tới ba tháng. Tác dụng đến từ thói quen, không phải một đêm.</p>
      <p><b>Đừng mở suốt đêm.</b> Một thử nghiệm năm 2026 ở Đại học Pennsylvania thấy tiếng ồn hồng 50 dB (cỡ tiếng mưa vừa) mở cả đêm làm bớt gần 19 phút giấc ngủ mơ (REM). Vì vậy app luôn tự tắt. Đừng mở máy tạo tiếng ồn cả đêm cho trẻ nhỏ.</p>
      <p><b>Nhỏ thôi.</b> Nghiên cứu nào ghi âm lượng thì thường để 50–60 dB, cỡ tiếng nói chuyện khẽ. Dùng tai nghe thì chọn loại êm, để thật nhỏ.</p>
      <p><b>Nằm 20 phút vẫn tỉnh thì dậy.</b> Ra khỏi giường, làm gì đó nhẹ nhàng dưới đèn mờ, buồn ngủ mới quay lại. Đây là cách "kiểm soát kích thích" mà Hội Y học Giấc ngủ Hoa Kỳ khuyên dùng (2021). Nằm cố chỉ làm giường thành chỗ để lo.</p>
      <p><b>Tối màn hình.</b> Trang này để nền đen; bắt đầu rồi thì tắt màn hình luôn.</p>
      <p><b>Mất ngủ từ ba đêm mỗi tuần, kéo dài hơn ba tháng</b> thì nên gặp bác sĩ. Liệu pháp nhận thức – hành vi cho mất ngủ (CBT-I) là cách được khuyên dùng trước tiên; nhạc chỉ là phần phụ.</p>
    </section>
    <p class="xn-nguon">Nguồn: Jespersen và cs., Cochrane 2022 (nhạc cho người mất ngủ); Pan và cs., Frontiers in Sleep 2025 (nét chung của
      nhạc giúp ngủ); Riedy và cs., Sleep Medicine Reviews 2021 (tiếng ồn nền); Basner và cs., tạp chí Sleep 2026 (tiếng ồn hồng và giấc REM);
      Jirakittayakorn & Wongsawat, Frontiers in Human Neuroscience 2018 (nhịp hai tai 3 Hz); Calamassi và cs., Acta Biomedica 2020 (432 Hz);
      Scientific Reports 2020 (thở chậm trước khi ngủ); hướng dẫn điều trị mất ngủ của AASM 2021. Đây là thông tin tham khảo, không thay lời khuyên của bác sĩ.</p>`;

  o.querySelectorAll('.ng-bai').forEach(n => { n.onclick = () => {
    chon.bai = n.dataset.bai; luuChon(); veChon();
    taoAm(chon.bai).catch(() => {});                   // tạo sẵn trong lúc người dùng còn chọn giờ
  }; });
  o.querySelectorAll('.ng-gio button').forEach(n => { n.onclick = () => { chon.phut = +n.dataset.phut; luuChon(); veChon(); }; });
  const am = o.querySelector('.ng-am');
  am.oninput = () => { chon.am = +am.value; luuChon(); };
  o.querySelector('.ng-batdau').onclick = batDau;
}

function veNghe() {
  const o = tam.querySelector('.ng-nghe'), b = baiDangChon();
  o.innerHTML = `
    <div class="ng-vong" aria-hidden="true"><span></span></div>
    <p class="ng-ten">${esc(b.ten)}</p>
    <p class="ng-dem" aria-live="off">${trangThai === 'chuanBi' ? '…' : R().dongHo(hg ? hg.tong : chon.phut * 60)}</p>
    <p class="ng-trangthai"></p>
    <p class="ng-tho" hidden></p>
    <div class="ng-nut">
      <button class="ng-dung" type="button"></button>
      <button class="ng-them" type="button">+15 phút</button>
      <button class="ng-tat" type="button">Tắt</button>
    </div>
    <label class="ng-am-nhan">Âm lượng <input class="ng-am" type="range" min="5" max="100" step="1" value="${chon.am}"></label>
    <p class="xn-ghi ng-giua">${iOSCu ? 'Màn hình được giữ sáng trong lúc phát. Hạ độ sáng thấp nhất rồi úp máy xuống.'
      : 'Tắt màn hình được rồi: nhạc vẫn chạy, nhỏ dần rồi tự tắt.'} Đóng trang này là tắt nhạc.</p>`;
  o.querySelector('.ng-dung').onclick = () => (trangThai === 'dung' ? tiepTuc() : tamDung());
  o.querySelector('.ng-them').onclick = () => themGio(15);
  o.querySelector('.ng-tat').onclick = () => tat();
  const am = o.querySelector('.ng-am');
  am.oninput = () => {
    chon.am = +am.value; luuChon();
    if (gAm && ac) gAm.gain.setTargetAtTime(heSo(chon.am), ac.currentTime, 0.05);
  };
  giayCu = -1;
  veDieuKhien(); veDem(true);
}

function veDieuKhien() {
  if (!tam) return;
  const d = tam.querySelector('.ng-dung'), them = tam.querySelector('.ng-them'), t = tam.querySelector('.ng-tat');
  if (!d) return;
  d.textContent = trangThai === 'dung' ? 'Tiếp tục' : 'Tạm dừng';
  const khoa = ['chuanBi', 'tat'].includes(trangThai);
  d.disabled = khoa; them.disabled = khoa; t.disabled = trangThai === 'tat';
  veDem(true);
}

function veDem(ep) {
  if (!tam || !hg && trangThai !== 'chuanBi') return;
  const X = R(), dem = tam.querySelector('.ng-dem'), tt = tam.querySelector('.ng-trangthai');
  if (!dem) return;
  if (trangThai === 'chuanBi') { tt.textContent = 'Đang tạo âm thanh…'; return; }
  const t = viTri(), giay = Math.ceil(hg.tong - t);
  if (ep || giay !== giayCu) {
    giayCu = giay;
    dem.textContent = X.dongHo(hg.tong - t);
    tt.textContent = trangThai === 'dung' ? 'Đang tạm dừng — giờ tắt cũng dừng theo'
      : trangThai === 'tat' ? 'Đang tắt…'
      : t < hg.batDauGiam ? `Bắt đầu nhỏ dần lúc còn ${Math.round(hg.giam / 60)} phút` : 'Đang nhỏ dần…';
  }
  /* vòng tròn: mờ theo âm lượng; với sóng biển thì phồng xẹp theo đúng con sóng đang phát */
  const vong = tam.querySelector('.ng-vong span'), tho = tam.querySelector('.ng-tho');
  const g = X.amLuong(t, hg), nhip = daTao && daTao.id === chon.bai && daTao.nhip;
  let co = 0.86;
  if (nhip && trangThai !== 'tat') {
    const vt = ((t % X.DAI) + X.DAI) % X.DAI, i = Math.floor(vt * 20) % nhip.length, j = (i + 4) % nhip.length;
    co = 0.7 + 0.3 * nhip[i];
    tho.hidden = false;
    tho.textContent = nhip[j] > nhip[i] ? 'Sóng dâng — hít vào' : 'Sóng rút — thở ra';
  } else if (tho) tho.hidden = true;
  if (vong) { vong.style.transform = `scale(${co.toFixed(3)})`; vong.style.opacity = (0.25 + 0.75 * Math.pow(g, 0.3)).toFixed(3); }
}

function chay() {
  cancelAnimationFrame(khung);
  const buoc = () => {
    if (!tam || !tam.classList.contains('hien') || !['phat', 'tat', 'dung'].includes(trangThai)) return;
    if (typeof document !== 'undefined' && document.hidden) return;   // trang ẩn thì thôi vẽ; hiện lại sẽ chạy tiếp
    veDem(false);
    khung = requestAnimationFrame(buoc);
  };
  khung = requestAnimationFrame(buoc);
}

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'nhacngu';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="xn-trong">
      <div class="ng-chon"></div>
      <div class="ng-nghe" hidden></div>
    </div>`;
  document.body.appendChild(tam);
  tam.querySelector('.xn-dong').onclick = dong;
}

function mo() {
  dungKhung();
  docChon();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  ve();
  if (['phat', 'dung'].includes(trangThai)) chay();
}

function dong() {
  tat(true);                                             // đóng trang là tắt nhạc: không để âm chạy ngầm không ai thấy
  cancelAnimationFrame(khung);
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong();
});

self.TDTD_NGU = { mo, dong,
  dangPhat: () => ['chuanBi', 'phat', 'dung', 'tat'].includes(trangThai),
  _trangThai: () => trangThai,
  _hg: () => hg,
  _viTri: () => viTri(),
  _ac: () => ac && ac.state,
  _them: themGio, _tamDung: tamDung, _tiepTuc: tiepTuc, _tat: tat,
};
})();

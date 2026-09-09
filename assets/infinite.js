/* Bức tranh của Thượng Đế — phóng vào mãi, mỗi tầng một cảnh khác,
   rồi tới tầng thứ bảy lại quay về cảnh đầu.
   Bảy cảnh: mạng vũ trụ, mạng nơ-ron, mạch máu, rễ cây, sông ngòi, tia sét, bông tuyết.
   Trông khác nhau mà cấu trúc y hệt. Đó là cả nội dung của trò này.

   Vòng lặp liền mạch: mỗi tầng nhỏ hơn tầng ngoài đúng K lần và xoay thêm GOC.
   Sau đúng 7 tầng, khung hình trùng khít với lúc đầu. */
(() => {
'use strict';

const K = 0.42, GOC = Math.PI / 9;
const NGOAI_CUNG = -2, TRONG_CUNG = 6;   // khoảng các vòng được vẽ, tính theo độ sâu tương đối
const TRONG = 0.30;              // chừa lỗ giữa cho cảnh tầng sau chui ra

const CANH = [
  { id: 'vu-tru',     ten: 'mạng vũ trụ',  loai: 'mang',  mau: '#aac4f0', hat: 3.4, day: .85,
    chu: 'Các thiên hà nối nhau thành sợi, khoảng giữa là những khoảng trống mênh mông.' },
  { id: 'no-ron',     ten: 'mạng nơ-ron',  loai: 'nhanh', mau: '#e8c37a', goc: 7, chia: .52, run: .55, day: 1.5, hat: 1.9,
    chu: 'Tế bào thần kinh trong não người. Năm 2020 có nghiên cứu đo và thấy nó xếp giống hệt mạng vũ trụ.' },
  { id: 'mach-mau',   ten: 'mạch máu',     loai: 'nhanh', mau: '#e0656f', goc: 5, chia: .56, run: .38, day: 2.1, hat: 0 },
  { id: 're-cay',     ten: 'rễ cây',       loai: 'nhanh', mau: '#c9a473', goc: 6, chia: .48, run: .34, day: 1.7, hat: 0 },
  { id: 'song',       ten: 'sông ngòi',    loai: 'nhanh', mau: '#6fc3e8', goc: 4, chia: .52, run: .46, day: 2.6, hat: 0,
    chu: 'Nhìn từ trên cao, một vùng châu thổ.' },
  { id: 'tia-set',    ten: 'tia sét',      loai: 'nhanh', mau: '#e6dcff', goc: 3, chia: .3,  run: .85, day: 1.3, hat: 0, thang: true },
  { id: 'bong-tuyet', ten: 'bông tuyết',   loai: 'nhanh', mau: '#d8ecfa', goc: 6, chia: .42, run: .14, day: 1.4, hat: 1.4, doiXung: 6,
    chu: 'Rồi lại về mạng vũ trụ. Cùng một hình vẽ, ở mọi cỡ.' },
];
const N = CANH.length;

const LOI = [
  [14,  'Bảy tầng rồi lại từ đầu.'],
  [30,  'Cùng một hình vẽ, ở mọi cỡ.'],
  [56,  'Con đang đi vòng quanh chứ không đi vào trong.'],
  [90,  'Không có đáy. Cũng không cần có đáy.'],
  [140, 'Con dừng lúc nào cũng được. Không ai chấm điểm.'],
];

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let sau = 0, toc = 0.22, keo = null, moc = -1, tangTruoc = -1, nen = [];

const nn = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- dựng hình riêng cho từng cảnh ----------
   Mỗi cảnh có nét vẽ riêng chứ không dùng chung một hàm mọc nhánh,
   vì như vậy cảnh nào cũng ra một kiểu cây, nhìn không nhận ra là gì.
   Hình vẽ nằm trong hình tròn bán kính 1, chừa lỗ giữa cho tầng sau. */

const T2 = Math.PI * 2;
const NGOAI = 1.0;   // không nhánh nào được mọc ra ngoài vòng này, kẻo tầng nọ đè tầng kia
const raNgoai = (p) => Math.hypot(p[0], p[1]) > NGOAI;


const diNguoc = (p, a, d) => [p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d];

/* Mạng vũ trụ: cụm thiên hà sáng nối nhau bằng sợi mảnh, giữa là khoảng trống. */
function canhVuTru(rnd) {
  const duong = [], dom = [], hao = [];
  const cum = [];
  for (let k = 0; k < 15; k++) {
    const a = rnd() * T2, r = TRONG + .08 + Math.pow(rnd(), .7) * (.9 - TRONG);
    cum.push([Math.cos(a) * r, Math.sin(a) * r, .018 + Math.pow(rnd(), 2) * .055]);
  }
  for (let a = 0; a < cum.length; a++) {
    const gan = cum.map((p, b) => [b, Math.hypot(p[0] - cum[a][0], p[1] - cum[a][1])])
      .filter(([b]) => b !== a).sort((x, y) => x[1] - y[1]).slice(0, 2);
    for (const [b] of gan) {
      if (b < a) continue;
      const pts = [];
      for (let s = 0; s <= 7; s++) {                  // sợi hơi cong, không thẳng đơ
        const t = s / 7;
        const x = cum[a][0] + (cum[b][0] - cum[a][0]) * t;
        const y = cum[a][1] + (cum[b][1] - cum[a][1]) * t;
        const w = Math.sin(t * Math.PI) * .05;
        pts.push([x + (rnd() - .5) * w, y + (rnd() - .5) * w]);
      }
      duong.push({ pts, day: .7, mo: .34 });
      for (let s = 0; s < 9; s++) {                   // thiên hà lẻ nằm rải trên sợi
        const t = rnd(), k2 = Math.min(6, Math.floor(t * 7));
        dom.push([pts[k2][0] + (rnd() - .5) * .05, pts[k2][1] + (rnd() - .5) * .05, .0035 + rnd() * .004, .5]);
      }
    }
  }
  for (const [x, y, r] of cum) {
    hao.push([x, y, r * 3.2, .5]);
    dom.push([x, y, r * .5, .95]);
    for (let k = 0; k < 7; k++) {
      const a = rnd() * T2, d = r * (.7 + rnd() * 1.8);
      dom.push([x + Math.cos(a) * d, y + Math.sin(a) * d, .004 + rnd() * .005, .7]);
    }
  }
  return { duong, dom, hao, bang: [], hinh: [] };
}

/* Nơ-ron: thân tế bào tròn có nhân, tua ngắn toả ra, một sợi trục dài kết thúc bằng chấm. */
function canhNoRon(rnd) {
  const duong = [], dom = [], hao = [], hinh = [];
  const than = [];
  for (let k = 0; k < 4; k++) {
    const a = k * T2 / 4 + rnd() * .6, r = TRONG + .14 + rnd() * .3;
    than.push([Math.cos(a) * r, Math.sin(a) * r, .045 + rnd() * .02, a]);
  }
  for (const [x, y, R, huong] of than) {
    const vien = [];                                   // thân hơi méo, không tròn đều
    for (let k = 0; k < 14; k++) {
      const a = k * T2 / 14;
      const rr = R * (.82 + rnd() * .38);
      vien.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
    }
    hinh.push({ pts: vien, mo: .5 });
    hao.push([x, y, R * 2.2, .3]);
    dom.push([x, y, R * .34, .75]);                    // nhân

    const soTua = 6;
    for (let k = 0; k < soTua; k++) {
      const a0 = k * T2 / soTua + rnd() * .5;
      const tua = (p, a, d, dai_, cap) => {            // tua ngắn, chẻ nhiều, thon nhanh
        if (cap > 3 || d < .1 || raNgoai(p)) return;
        const pts = [p];
        let cur = p, ang = a;
        for (let s = 0; s < 5; s++) { ang += (rnd() - .5) * .5; cur = diNguoc(cur, ang, dai_ / 5); pts.push(cur); }
        duong.push({ pts, day: d, mo: .55 });
        if (rnd() < .75) {
          tua(cur, ang - .45 - rnd() * .3, d * .6, dai_ * .68, cap + 1);
          tua(cur, ang + .45 + rnd() * .3, d * .6, dai_ * .68, cap + 1);
        } else dom.push([cur[0], cur[1], .004, .6]);
      };
      tua([x + Math.cos(a0) * R, y + Math.sin(a0) * R], a0, 1.5, .13 + rnd() * .07, 0);
    }
    // sợi trục: dài, thẳng hơn hẳn, cuối có cúc tận cùng
    let cur = [x + Math.cos(huong) * R, y + Math.sin(huong) * R], ang = huong;
    const pts = [cur];
    for (let s = 0; s < 16; s++) { ang += (rnd() - .5) * .16; const t2 = diNguoc(cur, ang, .038); if (raNgoai(t2)) break; cur = t2; pts.push(cur); }
    duong.push({ pts, day: 1.15, mo: .5 });
    dom.push([cur[0], cur[1], .011, .85]);
  }
  return { duong, dom, hao, bang: [], hinh };
}

/* Mạch máu: ống to chẻ dần thành ống nhỏ, vẽ bằng dải có bề dày thon, không bao giờ nhập lại. */
function canhMachMau(rnd) {
  const bang = [];
  const chay = (p, a, w, cap) => {
    if (cap > 6 || w < .0016 || raNgoai(p)) return;
    const pts = [p]; let cur = p, ang = a;
    const khuc = 5 + Math.floor(rnd() * 3);
    for (let s = 0; s < khuc; s++) { ang += (rnd() - .5) * .34; const t2 = diNguoc(cur, ang, .020 + rnd() * .012); if (raNgoai(t2)) break; cur = t2; pts.push(cur); }
    bang.push({ pts, w0: w, w1: w * .86 });
    const t = .3 + rnd() * .18;
    chay(cur, ang - t, w * .76, cap + 1);
    chay(cur, ang + t, w * .76, cap + 1);
  };
  for (let k = 0; k < 3; k++) {
    const a = k * T2 / 3 + rnd() * .5;
    chay([Math.cos(a) * TRONG, Math.sin(a) * TRONG], a, .055, 0);
  }
  return { duong: [], dom: [], hao: [], bang, hinh: [] };
}

/* Rễ cây: nhánh thon, cong đều, và điểm nhận ra là có lông rễ tua tủa hai bên. */
function canhReCay(rnd) {
  const duong = [], dom = [];
  const re = (p, a, d, cap) => {
    if (cap > 5 || d < .18 || raNgoai(p)) return;
    const pts = [p]; let cur = p, ang = a;
    for (let s = 0; s < 7; s++) {
      ang += (rnd() - .5) * .26; const truoc = cur; const t2 = diNguoc(cur, ang, .022); if (raNgoai(t2)) break; cur = t2; pts.push(cur);
      if (cap < 4) for (let h = 0; h < 2; h++) {       // lông rễ
        const b = ang + (h ? 1.4 : -1.4) + (rnd() - .5) * .5;
        duong.push({ pts: [truoc, diNguoc(truoc, b, .012 + rnd() * .016)], day: .35, mo: .3 });
      }
    }
    duong.push({ pts, day: d, mo: .55 });
    if (rnd() < .72) { re(cur, ang - .3 - rnd() * .25, d * .68, cap + 1); re(cur, ang + .3 + rnd() * .25, d * .68, cap + 1); }
    else { re(cur, ang + (rnd() - .5) * .3, d * .8, cap + 1); dom.push([cur[0], cur[1], .005, .5]); }
  };
  for (let k = 0; k < 5; k++) {
    const a = k * T2 / 5 + rnd() * .5;
    re([Math.cos(a) * TRONG, Math.sin(a) * TRONG], a, 2.1, 0);
  }
  return { duong, dom, hao: [], bang: [], hinh: [] };
}

/* Sông ngòi: lòng sông uốn lượn, có chỗ tách ra rồi nhập lại, giữa dòng có cồn cát. */
function canhSong(rnd) {
  const bang = [], hinh = [];
  const chay = (p, a, w, cap) => {
    if (cap > 5 || w < .003 || raNgoai(p)) return;
    const pts = [p]; let cur = p, ang = a;
    const khuc = 8;
    for (let s = 0; s < khuc; s++) {
      ang += Math.sin(s * 1.1 + cap) * .3 + (rnd() - .5) * .2;   // uốn lượn kiểu sông
      const t2 = diNguoc(cur, ang, .019); if (raNgoai(t2)) break; cur = t2; pts.push(cur);
      if (rnd() < .3 && w > .008) {                              // cồn cát giữa dòng
        const b = ang + Math.PI / 2, d = w * .35;
        hinh.push({ pts: [diNguoc(cur, ang, .022), diNguoc(diNguoc(cur, b, d), ang, 0),
                          diNguoc(cur, ang, -.022), diNguoc(diNguoc(cur, b, -d), ang, 0)], mo: .35 });
      }
    }
    bang.push({ pts, w0: w, w1: w * .82 });
    if (rnd() < .8) {
      const t = .3 + rnd() * .25;
      chay(cur, ang - t, w * .7, cap + 1);
      chay(cur, ang + t, w * .7, cap + 1);
      if (rnd() < .35 && pts.length > 2) {                        // một nhánh nhỏ tách ra rồi nhập lại
        const giua = pts[Math.floor(pts.length / 2)];
        bang.push({ pts: [giua, diNguoc(giua, ang + 1.1, .05), diNguoc(cur, ang + .4, .03), cur], w0: w * .3, w1: w * .3 });
      }
    }
  };
  for (let k = 0; k < 2; k++) {
    const a = k * Math.PI + rnd() * .8;
    chay([Math.cos(a) * TRONG, Math.sin(a) * TRONG], a, .052, 0);
  }
  return { duong: [], dom: [], hao: [], bang, hinh };
}

/* Tia sét: gãy khúc sắc cạnh, rất ít nhánh, nhánh phụ tắt nhanh. Lõi trắng, quầng tím. */
function canhTiaSet(rnd) {
  const duong = [];
  const set = (p, a, d, cap) => {
    if (cap > 3 || d < .25 || raNgoai(p)) return;
    let cur = p, ang = a;
    const pts = [cur];
    const khuc = cap === 0 ? 11 : 5;
    for (let s = 0; s < khuc; s++) {
      ang = a + (rnd() - .5) * 1.25;                    // đổi hướng đột ngột, không làm mượt
      const t2 = diNguoc(cur, ang, .035 + rnd() * .035); if (raNgoai(t2)) break; cur = t2; pts.push(cur);
      if (rnd() < .22 && cap < 3) set(cur, ang + (rnd() < .5 ? -1 : 1) * (.6 + rnd() * .5), d * .5, cap + 1);
    }
    duong.push({ pts, day: d * 3.2, mo: .12 });         // quầng
    duong.push({ pts, day: d, mo: .85 });               // lõi
  };
  for (let k = 0; k < 3; k++) {
    const a = k * T2 / 3 + rnd() * .7;
    set([Math.cos(a) * TRONG, Math.sin(a) * TRONG], a, 1.1, 0);
  }
  return { duong, dom: [], hao: [], bang: [], hinh: [] };
}

/* Bông tuyết: sáu cánh giống hệt nhau, nhánh phụ đúng 60 độ, giữa là tấm lục giác. */
function canhBongTuyet(rnd) {
  const duong = [], hinh = [];
  const luc = (x, y, r) => {
    const p = []; for (let k = 0; k < 6; k++) { const a = k * T2 / 6 + Math.PI / 6; p.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
    return p;
  };
  const canh = [], hinhCanh = [];
  const A = 0;                                          // dựng một cánh dọc trục x rồi nhân bản
  let x = TRONG;
  const dai = .96 - TRONG;
  canh.push({ pts: [[TRONG, 0], [.96, 0]], day: 2.2, mo: .75 });
  const soNhanh = 5;
  for (let k = 1; k <= soNhanh; k++) {
    const t = k / (soNhanh + 1);
    const px = TRONG + dai * t;
    const L = dai * (.34 - t * .2);
    for (const dau of [1, -1]) {
      const a = dau * Math.PI / 3;
      const q = [px + Math.cos(a) * L, Math.sin(a) * L];
      canh.push({ pts: [[px, 0], q], day: 1.4, mo: .6 });
      for (const d2 of [1, -1]) {                       // nhánh con cũng 60 độ
        const a2 = a + d2 * Math.PI / 3, L2 = L * .42;
        canh.push({ pts: [q, [q[0] + Math.cos(a2) * L2, q[1] + Math.sin(a2) * L2]], day: .8, mo: .45 });
      }
    }
    if (k % 2 === 1) hinhCanh.push({ pts: luc(px, 0, dai * .028), mo: .3 });
  }
  hinhCanh.push({ pts: luc(.96, 0, dai * .05), mo: .35 });
  for (let k = 0; k < 6; k++) {
    const a = k * T2 / 6, ca = Math.cos(a), sa = Math.sin(a);
    const q = ([X, Y]) => [X * ca - Y * sa, X * sa + Y * ca];
    for (const d of canh) duong.push({ pts: d.pts.map(q), day: d.day, mo: d.mo });
    for (const h of hinhCanh) hinh.push({ pts: h.pts.map(q), mo: h.mo });
  }
  return { duong, dom: [], hao: [], bang: [], hinh };
}

const XUONG = { 'vu-tru': canhVuTru, 'no-ron': canhNoRon, 'mach-mau': canhMachMau,
                're-cay': canhReCay, 'song': canhSong, 'tia-set': canhTiaSet, 'bong-tuyet': canhBongTuyet };
const kho = CANH.map((c, i) => XUONG[c.id](nn(9176 + i * 7919)));

/* ---------- vẽ một tầng ---------- */
function veTang(R, xoay, mo, chiSo) {
  if (R < 3 || mo <= .006) return;
  const c = CANH[chiSo], h = kho[chiSo];
  ctx.save();
  ctx.rotate(xoay);
  ctx.strokeStyle = c.mau; ctx.fillStyle = c.mau;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  for (const { x, y, r, a } of h.hao.map(([x, y, r, a]) => ({ x, y, r, a }))) {
    const g = ctx.createRadialGradient(x * R, y * R, 0, x * R, y * R, r * R);
    g.addColorStop(0, c.mau); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = mo * a * .5; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x * R, y * R, r * R, 0, T2); ctx.fill();
  }
  ctx.fillStyle = c.mau;

  for (const { pts, mo: m } of h.hinh) {
    ctx.globalAlpha = mo * m;
    ctx.beginPath(); ctx.moveTo(pts[0][0] * R, pts[0][1] * R);
    for (const p of pts) ctx.lineTo(p[0] * R, p[1] * R);
    ctx.closePath(); ctx.fill();
  }

  for (const { pts, w0, w1 } of h.bang) {               // dải có bề dày thon dần
    ctx.globalAlpha = mo * .55;
    for (let s = 0; s < pts.length - 1; s++) {
      const t = s / (pts.length - 1);
      ctx.lineWidth = Math.max(.4, (w0 + (w1 - w0) * t) * R);
      ctx.beginPath();
      ctx.moveTo(pts[s][0] * R, pts[s][1] * R);
      ctx.lineTo(pts[s + 1][0] * R, pts[s + 1][1] * R);
      ctx.stroke();
    }
  }

  for (const { pts, day, mo: m } of h.duong) {
    ctx.globalAlpha = mo * m;
    ctx.lineWidth = Math.max(.3, day * R * .0026);
    ctx.beginPath(); ctx.moveTo(pts[0][0] * R, pts[0][1] * R);
    for (let s = 1; s < pts.length; s++) ctx.lineTo(pts[s][0] * R, pts[s][1] * R);
    ctx.stroke();
  }

  for (const [x, y, r, a] of h.dom) {
    ctx.globalAlpha = mo * a;
    ctx.beginPath(); ctx.arc(x * R, y * R, Math.max(.35, r * R), 0, T2); ctx.fill();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

/* ---------- khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'butranh';
  tam.innerHTML = `
    <canvas class="bt-cv"></canvas>
    <button class="bt-dong" aria-label="Đóng">✕</button>
    <div class="bt-tren">
      <p class="bt-sau"><span class="bt-so">0</span><span class="bt-nhan">tầng</span></p>
      <p class="bt-canh"></p>
    </div>
    <p class="bt-loi"></p>
    <p class="bt-nhac">Kéo lên để đi sâu hơn, kéo xuống để lùi ra</p>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.bt-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.bt-dong').onclick = dong;

  const y = (e) => e.clientY - cv.getBoundingClientRect().top;
  cv.addEventListener('pointerdown', e => { keo = { y: y(e), toc0: toc }; cv.setPointerCapture(e.pointerId);
    tam.querySelector('.bt-nhac').classList.add('mo'); });
  cv.addEventListener('pointermove', e => { if (keo) toc = Math.max(-1.2, Math.min(1.2, keo.toc0 + (keo.y - y(e)) * .0055)); });
  const tha = () => { keo = null; };
  cv.addEventListener('pointerup', tha);
  cv.addEventListener('pointercancel', tha);
  cv.addEventListener('wheel', e => { e.preventDefault();
    toc = Math.max(-1.2, Math.min(1.2, toc - e.deltaY * .001)); }, { passive: false });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nen = Array.from({ length: Math.round(W * H / 7000) }, () => ({
    x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.1 + .3, a: Math.random() * .3 + .06,
  }));
}

function vong(t) { raf = requestAnimationFrame(vong); buoc(t); }

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  sau += toc * dt / 1000;
  if (sau < 0) { sau = 0; toc = Math.max(0, toc); }

  const g = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * .8);
  g.addColorStop(0, '#141130'); g.addColorStop(.55, '#0e0c24'); g.addColorStop(1, '#06050e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (const s of nen) { ctx.globalAlpha = s.a; ctx.fillStyle = '#ded9ff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.284); ctx.fill(); }
  ctx.globalAlpha = 1;

  const le = sau - Math.floor(sau), goc = Math.floor(sau);
  const R0 = Math.min(W, H) * .48;    // vòng ở độ sâu 0 rộng đúng bằng bề ngang màn hình
  ctx.save();
  ctx.translate(W / 2, H / 2);
  /* Độ sâu tương đối của một vòng là (i - le), KHÔNG phải (i + le).
     Sai dấu ở đây làm hình co lại trong khi số tầng tăng lên, tức là phóng ngược chiều. */
  for (let i = NGOAI_CUNG; i <= TRONG_CUNG; i++) {
    const b = i - le;
    const R = R0 * Math.pow(K, b);
    let mo = 1;
    if (b < -.6) mo = Math.max(0, (b + 1.4) / .8) * .55;      // vòng ngoài phình to rồi tan dần
    else if (b < 0) mo = .55 + (1 + b / .6) * .45;            // đang lớn lên thì rõ dần
    else if (b > 3.4) mo = Math.max(0, (4.4 - b));            // vòng trong nhỏ quá thì mờ đi
    veTang(R, GOC * b, mo, ((goc + i) % N + N) % N);
  }
  ctx.restore();

  const n = Math.round(sau);   // vòng đang nhìn rõ nhất là vòng gần độ sâu 0
  tam.querySelector('.bt-so').textContent = n;
  if (n !== tangTruoc) {
    tangTruoc = n;
    const c = CANH[((n % N) + N) % N];
    const el = tam.querySelector('.bt-canh');
    el.textContent = c.ten;
    el.classList.remove('hien'); void el.offsetWidth; el.classList.add('hien');
    if (c.chu) {
      const l = tam.querySelector('.bt-loi');
      l.textContent = c.chu;
      l.classList.remove('hien'); void l.offsetWidth; l.classList.add('hien');
      moc = -2;
    }
  }
  let m = -1;
  for (let i = 0; i < LOI.length; i++) if (n >= LOI[i][0]) m = i;
  if (m >= 0 && m !== moc && moc !== -2) {
    moc = m;
    const el = tam.querySelector('.bt-loi');
    el.textContent = LOI[m][1];
    el.classList.remove('hien'); void el.offsetWidth; el.classList.add('hien');
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  sau = 0; toc = .22; moc = -1; tangTruoc = -1; keo = null;
  tam.querySelector('.bt-loi').textContent = '';
  tam.querySelector('.bt-loi').classList.remove('hien');
  tam.querySelector('.bt-nhac').classList.remove('mo');
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_BUCTRANH = { mo, dong, _buoc: (t) => buoc(t), _canh: CANH,
  _dat: (s, v) => { sau = s; if (v !== undefined) toc = v; },
  _anh: () => cv.toDataURL('image/jpeg', .6),
  _debug: () => ({ sau: +sau.toFixed(3), tang: Math.round(sau), canh: CANH[((Math.round(sau) % N) + N) % N].ten, toc, N }) };
})();

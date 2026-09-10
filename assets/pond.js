/* Hồ nước — chạm vào rồi nó tự sống. Không điểm, không thắng thua, không kết thúc. */
(() => {
'use strict';

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let song = [], la = [], ech = [], tMua = 0;

const rnd = (a, b) => a + Math.random() * (b - a);

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'ho';
  tam.innerHTML = `
    <canvas class="ho-cv"></canvas>
    <button class="ho-tieng"></button>
    <button class="ho-dong" aria-label="Đóng">✕</button>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.ho-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.ho-dong').onclick = dong;
  const loa = tam.querySelector('.ho-tieng');
  loa.innerHTML = tiengBat ? LOA_MO : LOA_TAT;
  loa.classList.toggle('tat', !tiengBat);
  loa.setAttribute('aria-label', tiengBat ? 'Tắt tiếng' : 'Mở tiếng');
  loa.onclick = batTat;

  const cham = (e) => {
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (!ac && tiengBat) moTieng();
    themSong(x, y, 1);
    const con = echTai(x, y);
    if (con) giatMinh(con, x, y);
    for (const n of nong) if (Math.hypot(n.x - x, n.y - y) < 72) {   // nòng nọc vọt đi tránh ngón tay
      n.huong = Math.atan2(n.y - y, n.x - x); n.vot = 620;
    }
  };
  cv.addEventListener('pointerdown', cham);
  cv.addEventListener('pointermove', e => {
    if (e.buttons || e.pointerType === 'touch') { if (Math.random() < .28) cham(e); return; }
    const r = cv.getBoundingClientRect();                 // rê chuột không bấm: đổi con trỏ khi đi qua con ếch
    cv.classList.toggle('tro', !!echTai(e.clientX - r.left, e.clientY - r.top));
  });
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  /* Thẻ bọc đang ẩn thì clientWidth bằng 0, mọi toạ độ tính từ đó thành vô định
     rồi canvas ném lỗi. Lấy tạm kích thước cửa sổ cho tới khi trang bày xong. */
  W = tam.clientWidth || innerWidth || 360;
  H = tam.clientHeight || innerHeight || 640;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  // rải lá cho thưa ra, không đè nhau, để nhìn rõ ếch nhảy từ lá này sang lá kia
  la = [];
  for (let n = 0; n < 5; n++) {
    const rMax = n === 0 ? rnd(44, 50) : R_LA();        // chắc chắn có một lá đủ rộng cho cả đàn
    for (let thu = 0; thu < 40; thu++) {
      const l = coLa(rnd(W * .12, W * .88), rnd(H * .18, H * .88), rMax,
                     rnd(.1, .55) * 420000, null);      // tuổi lệch nhau nên không tàn cùng lúc
      l.r = Math.min(rMax, R_MAM + (rMax - R_MAM) * Math.min(1, l.tuoi / LON));
      const de = la.some(k => Math.hypot(k.x - l.x, k.y - l.y) < (k.r + l.r) * .95);
      if (!de || thu === 39) { la.push(l); break; }
    }
  }
  datEch();
}

/* Mỗi gợn sóng mang theo loại tiếng của nó: 'nuoc' là chạm nước thật, 'dap' là đạp chân rời lá,
   'dapXuong' là đáp xuống lá, còn 'im' là chỉ có sóng chứ không có tiếng. */
const themSong = (x, y, manh, am = 'nuoc') => {
  if (song.length > 60) song.shift();
  song.push({ x, y, t: 0, manh, doi: rnd(2600, 3400) });
  if (am === 'nuoc') tum(x, manh);
  else if (am === 'dap') dap(x, manh + .25, false);
  else if (am === 'dapXuong') dap(x, manh + .3, true);
};

function veSong(s) {
  const p = s.t / s.doi;
  if (p >= 1) return false;
  const rMax = Math.max(W, H) * .42 * s.manh;
  for (let i = 0; i < 3; i++) {
    const tre = i * .13;
    const q = p - tre;
    if (q <= 0) continue;
    const r = q * rMax;
    const a = (1 - q) * (1 - q) * .5 * s.manh / (1 + i * .8);
    if (a <= .002) continue;
    ctx.strokeStyle = `rgba(190,225,240,${a})`;
    ctx.lineWidth = Math.max(.5, 2.4 * (1 - q));
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.284); ctx.stroke();
  }
  // đốm sáng ngay chỗ vừa chạm
  if (p < .3) {
    const a = (1 - p / .3) * .32 * s.manh;
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 34);
    g.addColorStop(0, `rgba(220,245,255,${a})`); g.addColorStop(1, 'rgba(220,245,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 34, 0, 6.284); ctx.fill();
  }
  return true;
}

function veLa(l, t) {
  // lá nhún khi sóng đi qua
  let nhun = 0;
  for (const s of song) {
    const d = Math.hypot(l.x - s.x, l.y - s.y);
    const rSong = (s.t / s.doi) * Math.max(W, H) * .42 * s.manh;
    const lech = Math.abs(d - rSong);
    if (lech < 40) nhun += (1 - lech / 40) * (1 - s.t / s.doi) * 5;
  }
  l.nhun += (nhun - l.nhun) * .18;
  l.lun *= .9;                                          // cú đạp chân của ếch, dập xuống rồi nổi lên
  const tan = l.chet === null ? 0 : Math.min(1, l.chet / TAN);
  const ua = Math.max(tan, Math.max(0, l.tuoi / l.doiSong - .78) / .22 * .7);   // sắp hết tuổi thì úa dần
  const dan = soEch(l), qua = dan > suc(l);
  const deo = Math.min(4, dan) * 1.5;                   // chở càng nhiều ếch thì lá càng thấp
  l.chim += ((qua ? 1 : 0) - l.chim) * (qua ? .014 : .05);   // quá sức thì lún dần, vãn bớt thì nổi lên
  const y = l.y + Math.sin(t / 2600 + l.goc) * 2.5 + l.nhun + l.lun + deo + l.chim * 10;
  l.yVe = y;

  ctx.save(); ctx.globalAlpha = 1 - tan * .85;
  ctx.translate(l.x, y + tan * 7); ctx.rotate(l.goc + l.nhun * .012);
  const co = (1 - l.chim * .07) * (1 - tan * .16);
  ctx.scale(co, co);
  const tron = (a, b) => Math.round(a + (b - a) * ua);
  const g = ctx.createRadialGradient(-l.r * .3, -l.r * .3, l.r * .1, 0, 0, l.r);
  g.addColorStop(0, `rgba(${tron(70,146)},${tron(120,124)},${tron(96,62)},.9)`);
  g.addColorStop(1, `rgba(${tron(32,86)},${tron(68,64)},${tron(58,34)},.9)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, l.r, .42, 6.284); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(150,200,170,.22)'; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = .55 + i * (5.6 / 6);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l.r * .9, Math.sin(a) * l.r * .9); ctx.stroke();
  }
  if (l.chim > .01) {                                   // nước loang lên mặt lá
    ctx.fillStyle = `rgba(12,26,42,${.55 * l.chim})`;
    ctx.beginPath(); ctx.arc(0, 0, l.r, .42, 6.284); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/* ---- đời của chiếc lá: nhú ra từ nhánh của lá lớn, lớn dần, già rồi tàn ----
   Lá không nhích chỗ bao giờ, nên bỏ một chiếc là mọi chỉ số lá của ếch phải dời theo. */

const SO_LA = 8;                                        // đông hơn nữa thì kín mặt nước
/* Dòng nước: hướng gió **quay đều** cộng một cái xoáy quanh giữa hồ.
   Chỗ này tôi làm sai hai lần rồi nên ghi lại cho rõ:
   - Gió thổi một chiều thì trước sau gì lá cũng dồn hết vào một góc, đo được 80% thời gian.
   - Chữa bằng cách hút lá về giữa hồ thì lại thành dồn cục ở giữa, chỉ phủ 13% mặt nước.
   Cách đúng là để hướng gió quay đều: chạy hết một vòng thì lá cũng đi hết một vòng rồi về gần
   chỗ cũ, nên **không tích luỹ dạt về phía nào cả** mà chẳng cần ai kéo về. Bán kính vòng đi
   bằng sức gió chia tốc độ quay, cỡ 50–130 px. */
const luong = { goc: 0, toc: 1, quay: .03, xoay: 0, tocDich: 1, quayDich: .03, xoayDich: 0, t: 0 };

function buocLuong(dt) {
  luong.t -= dt;
  if (luong.t <= 0) {                                   // nửa phút một phút lại đổi sức và chiều quay
    luong.tocDich = rnd(.4, 2.4);
    luong.quayDich = (Math.random() < .5 ? -1 : 1) * rnd(.018, .05);
    luong.xoayDich = rnd(-1.2, 1.2);
    luong.t = rnd(25000, 60000);
  }
  luong.toc += (luong.tocDich - luong.toc) * Math.min(1, dt / 6000);
  luong.quay += (luong.quayDich - luong.quay) * Math.min(1, dt / 9000);
  luong.xoay += (luong.xoayDich - luong.xoay) * Math.min(1, dt / 8000);
  luong.goc += luong.quay * dt / 1000;
}
const DOI_LA = () => rnd(240000, 420000);               // một chiếc lá sống 4–7 phút
const R_LA = () => rnd(26, 50);                         // lớn hết thì được chừng đó
const R_MAM = 13;                                       // lúc mới nhú
const LON = 80000;                                      // 80 giây thì lớn hết cỡ
const TAN = 5000;                                       // tàn trong 5 giây

const coLa = (x, y, rMax, tuoi, cuong) => ({
  x, y, rMax, r: R_MAM, goc: rnd(0, 6.28), nhun: 0, lun: 0, chim: 0,
  vx: 0, vy: 0, quay: rnd(-.03, .03),                   // trôi theo dòng, và quay rất chậm
  wGoc: rnd(0, 6.284), wToc: rnd(.45, 1.5),             // mỗi chiếc còn tự lượn theo ý nó
  tuoi, doiSong: DOI_LA(), tNhanh: rnd(30000, 70000), chet: null, cuong,
});

/* Lá trôi: dòng nước đẩy chung một hướng, lá nào đè lá nào thì đẩy nhau ra, và dạt tới mép thì
   bị đẩy vào. Nhờ vế đẩy nhau mà đám lá tụ lại rồi lại giãn ra, không dính chùm mãi. */
function troiLa(l, dt) {
  const g = dt / 1000;
  const nhe = 1 + (1 - l.r / 50) * .6;                  // lá nhỏ nhẹ hơn nên trôi nhanh hơn một chút
  let ax = Math.cos(luong.goc) * luong.toc * nhe, ay = Math.sin(luong.goc) * luong.toc * nhe;

  const qx = l.x - W / 2, qy = l.y - H / 2, qr = Math.hypot(qx, qy) || 1;   // cái xoáy quanh giữa hồ
  ax += -qy / qr * luong.xoay * nhe;
  ay += qx / qr * luong.xoay * nhe;

  /* Lòng hồ là một hình bầu dục theo khung, **bên trong không kéo gì cả** nên lá tha hồ tản ra;
     chỉ khi dạt ra ngoài vành đó mới bị kéo về, càng ra xa càng kéo mạnh. Lần trước tôi kéo ở
     mọi chỗ nên cả đám co lại giữa hồ, chỉ phủ 13% mặt nước; không kéo gì thì 50% thời gian cả
     đám nằm dạt ngoài vành, tới mép là bị tường chặn rồi nằm luôn đó. */
  const ex = qx / (W * .4), ey = qy / (H * .4), er = Math.hypot(ex, ey);
  if (er > 1) { const f = (er - 1) * 6; ax -= ex / er * f; ay -= ey / er * f; }


  l.wGoc += rnd(-1, 1) * .7 * g;                        // đường lượn riêng của từng chiếc
  ax += Math.cos(l.wGoc) * l.wToc;
  ay += Math.sin(l.wGoc) * l.wToc;

  for (const k of la) {                                 // giữ khoảng cách nhau, chứ để chạm mới đẩy thì kết bè
    if (k === l) continue;
    const dx = l.x - k.x, dy = l.y - k.y, d = Math.hypot(dx, dy) || 1, cham = (l.r + k.r) * 1.7;
    if (d < cham) { const f = (cham - d) * .12; ax += dx / d * f; ay += dy / d * f; }   // lực mềm ngang sức gió: cơn gió mạnh dồn được chúng lại một lúc
  }
  const t = W * .06, ph = W * .94, tr = H * .1, du = H * .94;    // mép hồ
  if (l.x < t) ax += (t - l.x) * .5;
  if (l.x > ph) ax += (ph - l.x) * .5;
  if (l.y < tr) ay += (tr - l.y) * .5;
  if (l.y > du) ay += (du - l.y) * .5;
  l.vx += (ax - l.vx) * Math.min(1, dt / 800);
  l.vy += (ay - l.vy) * Math.min(1, dt / 800);
  l.x += l.vx * g; l.y += l.vy * g;
  l.goc += l.quay * g;
}

/* Chỗ nhú lá con: cách mép lá mẹ một quãng, không đè lá nào, không lọt ra ngoài. */
function choNhu(me) {
  for (let thu = 0; thu < 24; thu++) {
    const a = rnd(0, 6.284), d = me.r + rnd(32, 74);      // mầm nhú ra xa lá mẹ một chút cho khỏi kết bè
    const x = me.x + Math.cos(a) * d, y = me.y + Math.sin(a) * d;
    if (x < W * .1 || x > W * .9 || y < H * .14 || y > H * .9) continue;
    if (la.some(k => Math.hypot(k.x - x, k.y - y) < (k.r + R_MAM) * .95)) continue;
    return [x, y];
  }
  return null;
}

/* Bỏ một chiếc lá khỏi mảng, rồi dời chỉ số lá của mọi con ếch cho khớp.
   Con nào đang ngồi, đang bay tới hay đang bơi tới chiếc lá vừa mất thì cho xuống nước bơi tiếp,
   nếu không nó sẽ đáp xuống chỗ trống rồi ngồi trên mặt nước. */
function boLa(i) {
  const mat = ech.filter(e => e.la === i || e.dich === i);
  const laMat = la[i];
  for (const k of la) if (k.cuong && k.cuong.me === laMat) k.cuong = null;   // lá mẹ mất thì cuống rụng
  la.splice(i, 1);
  for (const e of ech) {
    if (e.la > i) e.la--;
    if (e.dich > i) e.dich--;
  }
  for (const e of mat) {
    if (e.la === i) e.la = -1;
    if (e.dich === i) e.dich = -1;
    if (e.tan !== null) continue;                       // con đang tan thì để nó tan
    e.boi = true; e.dich = laConCho(-1, e.x, e.y);
  }
}

/* Lá bắt đầu tàn: con nào đang ngồi thì nhảy sang lá khác, không còn lá thì xuống nước. */
function donKhachTro(l, i) {
  for (const e of ech) {
    if (!nguoi(e) || la[e.la] !== l) continue;
    const dich = laConCho(i, e.x, e.y);
    if (dich >= 0 && dich !== i) nhaySang(e, dich);
    else tuotXuongNuoc(e, i);
  }
}

function buocLa(dt) {
  buocLuong(dt);
  for (let i = la.length - 1; i >= 0; i--) {
    const l = la[i];
    troiLa(l, dt);
    l.tuoi += dt;
    l.r = Math.min(l.rMax, R_MAM + (l.rMax - R_MAM) * Math.min(1, l.tuoi / LON));   // lớn dần
    if (l.cuong) { l.cuong.t += dt; if (l.cuong.t > 20000) l.cuong = null; }        // cuống nhánh rụng đi

    if (l.chet !== null) {                              // đang tàn
      l.chet += dt;
      if (l.chet >= TAN) { themSong(l.x, yLa(l), .3); boLa(i); }
      continue;
    }
    if (l.tuoi >= l.doiSong) { l.chet = 0; donKhachTro(l, i); continue; }

    l.tNhanh -= dt;                                     // đủ lớn thì đẻ nhánh ra một lá con
    if (l.tNhanh <= 0) {
      l.tNhanh = rnd(50000, 100000);
      if (l.r >= 34 && la.length < SO_LA) {
        const cho = choNhu(l);
        if (cho) {
          la.push(coLa(cho[0], cho[1], R_LA(), 0, { me: l, t: 0 }));
          themSong(cho[0], cho[1], .16);
        }
      }
    }
  }
  if (!la.length) {                                     // hồ trắng: một mầm mọc lên từ gốc dưới đáy
    la.push(coLa(rnd(W * .2, W * .8), rnd(H * .25, H * .8), R_LA(), 0, null));
    themSong(la[0].x, la[0].y, .2);
  }
}

function veCuong() {                                    // cuống nối lá mẹ với lá con, nhạt dần rồi mất
  for (const l of la) {
    if (!l.cuong) continue;
    const a = (1 - l.cuong.t / 20000) * .3;
    if (a <= .01) continue;
    const m = l.cuong.me, mx = m.x, my = yLa(m);
    ctx.strokeStyle = `rgba(120,170,130,${a})`;
    ctx.lineWidth = Math.max(1, l.r * .07);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    const gx = (mx + l.x) / 2, gy = (my + l.y) / 2;
    ctx.quadraticCurveTo(gx + (l.y - my) * .12, gy - (l.x - mx) * .12, l.x, yLa(l));
    ctx.stroke();
  }
}

/* Đàn ếch: mỗi con ngồi một chỗ trên lá. Chạm đúng vào con nào thì con đó giật mình phóng sang
   chiếc lá xa ngón tay nhất — nên chạm bên này là đẩy nó qua bên kia. Thỉnh thoảng chúng tự nhảy,
   và con nào đang ngồi cùng lá với bạn bè thì nhảy lười hơn, nên dồn được mấy con vào một lá thì
   giữ được một lúc. Không điểm, không nhiệm vụ, không thắng thua — chơi cho vui thôi. */

const SO_ECH = 4;

const yLa = (l) => l.yVe ?? l.y;
const nguoi = (e) => !e.nhay && !e.boi && e.tan === null;   // đang ngồi trên lá, không bay không bơi không tan
const DOI_SONG = () => rnd(210000, 360000);             // sống được 3,5–6 phút thì già, mỗi con một số riêng
const CHU_KY = () => rnd(35000, 60000);                 // 35–60 giây một lần xét chuyện đẻ
const MUC_BO = () => rnd(.35, 1.9);                     // hồ có mùa nhiều mùa ít con trùng
const KIET = 220000;                                    // no đầy mà không ăn gì thì gần 4 phút là kiệt
const BU_MOI = .4;                                      // một con mồi bù được bốn phần mười mức no
const DU_DE = .6, TON_DE = .3;                          // no hơn 0,6 mới đẻ, đẻ một ổ tốn 0,3
const soEch = (l) => ech.reduce((n, e) => n + (nguoi(e) && la[e.la] === l ? 1 : 0), 0);
const suc = (l) => l.r < 22 ? 1                          // mầm mới nhú chỉ chở nổi một con
  : Math.max(2, Math.min(5, 2 + Math.floor((l.r - 26) / 6)));   // 22–31 px chịu 2 con, rồi 3, 4, và từ 44 px là 5

function datEch() {
  ech = [];
  if (!la.length) return;
  const s = Math.max(18, Math.min(28, Math.min(W, H) * .066));
  const thu = la.map((_, i) => i).sort(() => Math.random() - .5);   // mở lên thì mỗi con một lá
  for (let n = 0; n < Math.min(SO_ECH, la.length); n++) {
    const i = thu[n], l = la[i], a = rnd(0, 6.284), b = rnd(0, l.r * .3);
    const doiSong = DOI_SONG();
    ech.push({ la: i, dx: Math.cos(a) * b, dy: Math.sin(a) * b,
               doiSong, tuoi: rnd(0, .45) * doiSong, tan: null,   // bốn con mở màn già không đều nhau
               chuKy: CHU_KY(), tChuKy: 0, nl: rnd(.55, .9),
               x: l.x + Math.cos(a) * b, y: l.y + Math.sin(a) * b, goc: rnd(0, 6.284), s,
               nhay: false, boi: false, dich: -1, tDap: 0,
               t: 0, doi: 0, cung: 0, x0: 0, y0: 0, x1: 0, y1: 0, song: 0,
               nghi: 0, nhamMat: 0, tuNhay: rnd(5000, 15000),
               giong: Math.floor(Math.random() * 4), tocGiong: .88 + Math.random() * .26,
               henKeu: 0, nghiKeu: rnd(3000, 15000),
               an: 0, luoi: null, nghiLuoi: 0, nhaiT: 0, deT: 0 });
  }
}

/* Chỗ đáp trên chiếc lá: thử vài điểm, lấy điểm xa mấy con đang ngồi đó nhất, để cả đàn dồn
   vào một lá cũng không đè lên nhau. */
function choDap(i) {
  const l = la[i], y0 = yLa(l);
  const dang = ech.filter(e => nguoi(e) && la[e.la] === l);
  let tot = [l.x, y0], xa = -1;
  for (let thu = 0; thu < 12; thu++) {
    const a = rnd(0, 6.284), b = rnd(l.r * .12, l.r * .52);
    const x = l.x + Math.cos(a) * b, y = y0 + Math.sin(a) * b;
    const d = dang.reduce((m, e) => Math.min(m, Math.hypot(e.x - x, e.y - y)), 1e9);
    if (d > xa) { xa = d; tot = [x, y]; }
  }
  return tot;
}

function nhaySang(e, i, tx, ty) {
  const l = la[i];
  if (!e || e.nhay || !l) return;
  if (tx === undefined) [tx, ty] = choDap(i);
  e.x0 = e.x; e.y0 = e.y; e.x1 = tx; e.y1 = ty;
  const d = Math.hypot(tx - e.x0, ty - e.y0);
  if (d > 1) e.goc = Math.atan2(ty - e.y0, tx - e.x0);
  e.doi = Math.min(920, 300 + d * 1.5);
  e.cung = Math.max(.42, Math.min(1, d / 240));
  e.t = 0; e.nhay = true; e.boi = false;
  if (e.luoi) { if (e.luoi.con) e.luoi.con.dinh = null; e.luoi = null; }   // nhảy thì nhả lưỡi, con bọ thoát
  if (la[e.la]) la[e.la].lun += 4;                      // lá vừa bị đạp chân
  themSong(e.x0, e.y0, .4, la[e.la] ? 'dap' : 'nuoc');  // đạp trên lá thì tiếng bẹt, đang bơi thì tiếng nước
  e.la = i; e.dx = tx - l.x; e.dy = ty - yLa(l);        // nhớ chỗ đậu so với tâm lá
}

/* Ngón tay to hơn con ếch nên vùng chạm nới rộng ra một chút, chạm sát bên cũng tính. */
function echTai(x, y) {
  let gan = null, dGan = Infinity;
  for (const e of ech) {
    if (e.nhay || e.tan !== null) continue;             // con đang bay hay đang tan thì chạm không ăn
    const d = Math.hypot(x - e.x, y - e.y);
    if (d < dGan) { dGan = d; gan = e; }
  }
  return gan && dGan < Math.max(gan.s * 1.5, 40) ? gan : null;
}

function giatMinh(e, x, y) {
  if (!e || e.nhay || e.nghi > 0 || !la.length) return;
  if (e.boi) { const i = laConCho(-1, e.x, e.y); if (i >= 0) { nhaySang(e, i); return; } }   // đang bơi thì phóng lên lá gần nhất
  const gx = e.x - x, gy = e.y - y, cx = Math.hypot(gx, gy) || 1;   // hướng tránh ngón tay
  const cu = e.la;
  let diem = -Infinity, dich = -1;
  la.forEach((l, i) => {
    if (i === cu) return;
    const dx = l.x - e.x, dy = yLa(l) - e.y, d = Math.hypot(dx, dy) || 1;
    const hop = (dx * gx + dy * gy) / (d * cx);         // 1 là đúng hướng tránh, -1 là quay về phía ngón tay
    const p = hop * 2 - d / Math.max(W, H);             // tránh cho đúng hướng trước, gần thì hơn
    if (p > diem) { diem = p; dich = i; }
  });
  if (dich < 0) {                                       // cả hồ chỉ có một chiếc lá: nhích ra mép xa tay
    const l = la[cu], g = Math.atan2(gy, gx);
    nhaySang(e, cu, l.x + Math.cos(g) * l.r * .5, yLa(l) + Math.sin(g) * l.r * .5);
  } else nhaySang(e, dich);
  e.doi *= .82; e.cung = Math.min(1.25, e.cung * 1.3);  // giật mình thì phóng nhanh hơn và cao hơn
  if (la[cu]) la[cu].lun += 3;                          // đạp mạnh nên lá dập sâu hơn
  themSong(e.x0, e.y0, .75, 'im');                      // sóng to hơn, còn tiếng đạp đã kêu ở nhaySang
}

/* Lá gần nhất còn chỗ. Không lá nào còn chỗ thì đành lấy lá gần nhất. */
const laConCho = (tru, x, y) => {
  let cho = -1, dCho = Infinity, gan = -1, dGan = Infinity;
  la.forEach((l, i) => {
    if (i === tru) return;
    const d = Math.hypot(l.x - x, yLa(l) - y);
    if (d < dGan) { dGan = d; gan = i; }
    if (l.chet === null && soEch(l) < suc(l) && d < dCho) { dCho = d; cho = i; }
  });
  return cho >= 0 ? cho : gan;
};

function tuotXuongNuoc(e, tru) {                        // lá lún quá, con này tuột xuống nước
  e.boi = true; e.la = -1; e.dich = laConCho(tru, e.x, e.y);
  e.nghi = 200; e.song = 0;
  themSong(e.x, e.y, .5);
}

function chetGia(e) {                                   // hết tuổi hoặc hết cái ăn: nhắm mắt, lịm xuống nước
  e.tan = 0; e.nhamMat = 4000;
  if (e.luoi) { if (e.luoi.con) e.luoi.con.dinh = null; e.luoi = null; }
  themSong(e.x, e.y, .32);
}

function buocMotCon(e, dt) {
  e.tuoi += dt;
  if (e.tan !== null) {                                 // đang tan thì chỉ chìm xuống rồi mờ đi
    e.tan += dt;
    e.y += dt * .0023;
    if (e.tan >= 2600) { e.xong = true; themSong(e.x, e.y, .18); }
    return;
  }
  e.nl -= dt / KIET;                                    // sống là tiêu, không ăn thì mức no cứ rút
  const het = e.nl <= 0, giaRoi = e.tuoi >= e.doiSong;
  if ((het || giaRoi) && nguoi(e) && !e.luoi) { chetGia(e); return; }   // hồ có quyền tuyệt chủng, không đỡ

  e.tChuKy += dt;
  if (e.tChuKy >= e.chuKy) {                            // tới lần xét chuyện đẻ
    if (e.nl > DU_DE) {                                 // đủ no thì đẻ một ổ, và trả giá bằng mức no
      e.tChuKy = 0; e.chuKy = CHU_KY(); e.nl -= TON_DE;
      if (!deTrung(e)) e.deT = 8000;
    } else e.tChuKy = e.chuKy - 12000;                  // còn đói thì khoan, mươi giây nữa xét lại
  }
  e.nghi = Math.max(0, e.nghi - dt);
  e.nhamMat = Math.max(0, e.nhamMat - dt);
  e.nghiLuoi = Math.max(0, e.nghiLuoi - dt);
  e.nhaiT = Math.max(0, e.nhaiT - dt);
  if (e.luoi) buocLuoi(e, dt);
  if (e.deT > 0) { e.deT -= dt; if (e.deT <= 0 && !deTrung(e)) e.deT = 8000; }   // hồ đông thì giữ bụng, lát thử lại
  if (!e.nhay && e.nhamMat <= 0 && Math.random() < dt / 3000) e.nhamMat = 140;

  if (e.nhay) {
    e.t += dt;
    const p = Math.min(1, e.t / e.doi);
    e.x = e.x0 + (e.x1 - e.x0) * p;
    e.y = e.y0 + (e.y1 - e.y0) * p;
    if (p >= 1) {
      e.nhay = false; e.nghi = 240; e.tuNhay = rnd(5000, 15000); e.tDap = tTruoc;
      if (la[e.la]) la[e.la].lun += 5;
      themSong(e.x, e.y, .5, 'dapXuong');               // đáp xuống lá, sóng lan ra từ chỗ đáp
    }
    return;
  }
  if (e.boi) {                                          // bơi sang lá khác rồi bám lên
    e.tBoi = (e.tBoi || 0) + dt;
    if (!la[e.dich] || e.tBoi > 18000) {                 // lá nhắm tới mất rồi, hoặc bơi lâu quá: nhắm lại
      const i = laConCho(-1, e.x, e.y);
      if (i >= 0) { e.dich = i; e.tBoi = 0; }
    }
    const d0 = la[e.dich];
    if (!d0) return;
    const dx = d0.x - e.x, dy = yLa(d0) - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < d0.r * .9) { e.tBoi = 0; nhaySang(e, e.dich); return; }   // tới mép lá thì trèo lên, đầy cũng trèo
    const v = 54 * dt / 1000;                            // bơi chậm, chừng 54 px mỗi giây
    e.x += dx / d * v; e.y += dy / d * v;
    e.goc = Math.atan2(dy, dx);
    e.song -= dt;
    if (e.song <= 0) { themSong(e.x, e.y, .13); e.song = 420; }   // vệt nước sau lưng
    return;
  }

  const l = la[e.la];
  if (l) { e.x = l.x + e.dx; e.y = yLa(l) + e.dy; }     // ngồi yên thì nhún theo lá
  e.nghiKeu = Math.max(0, e.nghiKeu - dt);              // thỉnh thoảng lên tiếng, và đáp lời con bên cạnh
  if (e.henKeu > 0) { e.henKeu -= dt; if (e.henKeu <= 0 && e.nghiKeu <= 0) keu(e); }
  else if (e.nghiKeu <= 0 && Math.random() < dt / 210000) keu(e);   // thưa thôi, hồ để thư giãn chứ không phải cái chợ
  ngamVaPhong(e, dt);                                   // ngồi trên lá thì để ý con bọ nào bay gần
  if (e.luoi) return;                                   // đang phóng lưỡi thì chưa nhảy đi đâu
  const gia = Math.min(1, e.tuoi / e.doiSong);
  e.tuNhay -= dt * (l && soEch(l) > 1 ? .5 : 1) * (1 - gia * .45);   // ngồi cùng bạn, hoặc già rồi, thì nhảy lười hơn
  if (e.tuNhay <= 0) {                                  // đến giờ thì tự nhảy sang lá bất kỳ
    let i = e.la;
    if (la.length > 1) while (i === e.la) i = Math.floor(Math.random() * la.length);
    nhaySang(e, i);
  }
}

function buocEch(dt) {
  for (const e of ech) buocMotCon(e, dt);
  if (ech.some(e => e.xong)) ech = ech.filter(e => !e.xong);
  la.forEach((l, i) => {                                // lún quá nửa thì con lên sau cùng tuột xuống
    if (l.chim < .55 || soEch(l) <= suc(l)) return;
    let sau = null;
    for (const e of ech) if (nguoi(e) && la[e.la] === l && (!sau || e.tDap > sau.tDap)) sau = e;
    if (sau) { tuotXuongNuoc(sau, i); l.chim = .3; }     // hạ mức chìm để con kế tiếp không tuột theo ngay
  });
}

function veEch(e, t) {
  const tan = e.tan === null ? 0 : Math.min(1, e.tan / 2600);
  if (tan >= 1) return;
  const doi = Math.max(0, 1 - e.nl / .55) * .92;        // càng đói càng xuống sắc
  const gia = Math.max(Math.min(1, e.tuoi / e.doiSong), doi);
  const p = e.nhay ? Math.min(1, e.t / e.doi) : 0;
  const bay = e.nhay ? Math.sin(Math.PI * p) : 0;       // 0 lúc rời lá và lúc đáp, 1 lúc cao nhất
  const cao = bay * e.cung;
  const dap = e.boi ? .3 + .38 * (Math.sin(t / 165) * .5 + .5) : 0;   // nhịp đạp chân khi bơi
  const chan = Math.max(bay, dap);                     // chân duỗi ra bao nhiêu
  const s = e.s * (1 + cao * .18);
  const tho = e.nhay ? 1 : 1 + Math.sin(t / 620) * .035 + (e.nhaiT > 0 ? Math.sin(t / 55) * .055 : 0);

  // bóng trên mặt nước, nhạt và tách ra khi ếch lên cao
  const ab = e.boi ? 0 : (1 - cao * .72) * .28 * (1 - tan);   // đang bơi hoặc đang tan thì bóng nhạt dần
  if (ab > .01) {
    ctx.fillStyle = `rgba(4,12,18,${ab})`;
    ctx.beginPath(); ctx.ellipse(e.x, e.y + cao * 4, s * .48, s * .32, e.goc, 0, 6.284); ctx.fill();
  }

  ctx.save();
  ctx.globalAlpha = 1 - tan;                             // tan vào nước thì mờ dần
  ctx.translate(e.x, e.y - cao * 24);
  ctx.rotate(e.goc);
  ctx.scale(1, tho);

  // chân sau: ngồi thì gập hình chữ Z, giữa không trung thì duỗi hết ra sau
  ctx.lineCap = 'round';
  for (const ben of [-1, 1]) {
    ctx.strokeStyle = '#43804f';
    ctx.lineWidth = s * .16;                              // bắp chân
    ctx.beginPath();
    ctx.moveTo(-s * .1, ben * s * .16);
    ctx.lineTo(-s * (.28 + chan * .16), ben * s * (.4 - chan * .2));
    ctx.stroke();
    ctx.lineWidth = s * .1;                               // cẳng chân
    ctx.beginPath();
    ctx.moveTo(-s * (.28 + chan * .16), ben * s * (.4 - chan * .2));
    ctx.lineTo(-s * (.52 + chan * .6), ben * s * (.26 - chan * .14));
    ctx.stroke();
    ctx.fillStyle = '#39734a';                             // bàn chân có màng
    ctx.save();
    ctx.translate(-s * (.58 + chan * .66), ben * s * (.25 - chan * .14));
    ctx.rotate(ben * .5 - chan * ben * .4);
    ctx.beginPath(); ctx.ellipse(0, 0, s * .13, s * .07, 0, 0, 6.284); ctx.fill();
    ctx.restore();
  }

  // thân và đầu
  const g = ctx.createRadialGradient(s * .04, -s * .12, s * .05, 0, 0, s * .62);
  g.addColorStop(0, '#7cb96c'); g.addColorStop(.55, '#4f8f57'); g.addColorStop(1, '#2e5f42');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(-s * .04, 0, s * .5, s * .33, 0, 0, 6.284); ctx.fill();
  ctx.beginPath(); ctx.ellipse(s * .32, 0, s * .28, s * .25, 0, 0, 6.284); ctx.fill();

  veLuoi(e, s);

  // chân trước: ngồi thì chống hai bên mõm, nhảy thì với ra trước
  ctx.strokeStyle = '#4a8a57'; ctx.lineWidth = s * .1;
  for (const ben of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * .12, ben * s * .22);
    ctx.quadraticCurveTo(s * (.34 + chan * .1), ben * s * (.34 + chan * .04),
                         s * (.52 + chan * .26), ben * s * (.24 - chan * .06));
    ctx.stroke();
    ctx.fillStyle = '#3f7f4e';
    ctx.beginPath(); ctx.arc(s * (.55 + chan * .28), ben * s * (.23 - chan * .06), s * .075, 0, 6.284); ctx.fill();
  }

  if (gia > .7) {                                       // càng già màu càng bạc
    ctx.fillStyle = `rgba(170,174,152,${(gia - .7) / .3 * .3})`;
    ctx.beginPath(); ctx.ellipse(-s * .04, 0, s * .5, s * .34, 0, 0, 6.284); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * .32, 0, s * .28, s * .25, 0, 0, 6.284); ctx.fill();
  }

  // sống lưng và mấy đốm
  ctx.fillStyle = 'rgba(198,230,158,.18)';
  ctx.beginPath(); ctx.ellipse(-s * .06, 0, s * .34, s * .07, 0, 0, 6.284); ctx.fill();
  ctx.fillStyle = 'rgba(24,52,36,.5)';
  for (const [dx, dy] of [[-.3, .16], [-.14, -.19], [-.36, -.1], [-.02, .2]]) {
    ctx.beginPath(); ctx.arc(s * dx, s * dy, s * .045, 0, 6.284); ctx.fill();
  }

  // mắt
  for (const ben of [-1, 1]) {
    const mx = s * .34, my = ben * s * .19;
    ctx.fillStyle = '#16281f';
    ctx.beginPath(); ctx.arc(mx, my, s * .12, 0, 6.284); ctx.fill();
    if (e.nhamMat > 0) {
      ctx.fillStyle = '#4f8f57';
      ctx.beginPath(); ctx.arc(mx, my, s * .095, 0, 6.284); ctx.fill();
    } else {
      ctx.fillStyle = '#e8c37a';
      ctx.beginPath(); ctx.arc(mx, my, s * .095, 0, 6.284); ctx.fill();
      ctx.fillStyle = '#101d16';
      ctx.beginPath(); ctx.ellipse(mx + s * .02, my, s * .05, s * .035, 0, 0, 6.284); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.6)';
      ctx.beginPath(); ctx.arc(mx + s * .06, my - s * .04, s * .022, 0, 6.284); ctx.fill();
    }
  }
  if (e.boi) {                                          // thân ngập trong nước, chỉ còn cái đầu nhô lên
    ctx.fillStyle = 'rgba(12,26,42,.44)';
    ctx.beginPath(); ctx.ellipse(-s * .08, 0, s * .48, s * .33, 0, 0, 6.284); ctx.fill();
  }
  ctx.restore();
}

/* Vòng đời trong hồ: ruồi muỗi bay qua, ếch ngồi trên lá phóng lưỡi bắt từ xa, ăn xong thì đẻ
   một ổ trứng bên mép lá, trứng nở ra nòng nọc, nòng nọc lớn dần rồi thành ếch con, bơi tới
   chiếc lá còn chỗ mà bám lên. Ngồi chơi lâu thì thấy trọn cả vòng. */

const TOI_DA_ECH = 9;                                   // chặn cho khỏi chật màn hình, thường thì cái ăn giới hạn trước
let bo = [], trung = [], nong = [], ca = [], tBo = 0, tCa = 0, mucBo = 1, tDan = 0;

const demCon = () => ech.length + nong.length + trung.reduce((n, o) => n + o.n, 0);

/* ---- ruồi và muỗi ---- */

function themBo(so) {
  if (so === undefined) { so = 1; while (so < 4 && Math.random() < .34 * mucBo) so++; }   // vào theo tốp, mùa rộ thì tốp đông
  const tran = Math.max(1, Math.round(mucBo * 2));      // mùa rộ thì cùng lúc có tới bốn con
  for (let n = 0; n < so && bo.length < tran; n++) {
    const muoi = Math.random() < .45;
    const ben = Math.random() < .5;
    bo.push({ muoi, x: ben ? -18 - n * 14 : W + 18 + n * 14, y: rnd(H * .16, H * .9),
              huong: ben ? rnd(-.5, .5) : Math.PI + rnd(-.5, .5),
              toc: muoi ? rnd(30, 46) : rnd(40, 62),
              cao: rnd(11, 20), pha: rnd(0, 6.28), to: muoi ? 1.05 : 1.45,
              t: 0, doi: rnd(24000, 32000), dinh: null });
  }
}

function buocBo(dt) {
  const g = dt / 1000;
  for (let i = bo.length - 1; i >= 0; i--) {
    const b = bo[i];
    b.t += dt;
    if (b.t > b.doi || b.x < -60 || b.x > W + 60 || b.y < -60 || b.y > H + 60) { bo.splice(i, 1); continue; }
    if (b.dinh) continue;                               // đang dính lưỡi ếch thì nằm im chờ bị kéo về
    b.huong += rnd(-1, 1) * 3.4 * g;                    // bay lượn không theo đường nào
    let gan = null, dGan = Infinity;                    // ruồi muỗi hay quẩn quanh mấy chiếc lá
    for (const l of la) { const d = Math.hypot(l.x - b.x, yLa(l) - b.y); if (d < dGan) { dGan = d; gan = l; } }
    if (gan && dGan > 90) {
      const ve = Math.atan2(yLa(gan) - b.y, gan.x - b.x);
      b.huong += Math.atan2(Math.sin(ve - b.huong), Math.cos(ve - b.huong)) * .05;
    }
    if (b.x < 34 || b.x > W - 34 || b.y < H * .1 || b.y > H * .94) {
      const vao = Math.atan2(H * .5 - b.y, W * .5 - b.x);   // ra sát mép thì vòng lại vào giữa hồ
      b.huong += Math.atan2(Math.sin(vao - b.huong), Math.cos(vao - b.huong)) * .08;
    }
    b.x += Math.cos(b.huong) * b.toc * g;
    b.y += Math.sin(b.huong) * b.toc * g;
    b.cao += Math.sin(b.t / 700 + b.pha) * 6 * g;
  }
}

function veBo(t) {
  for (const b of bo) {
    const a = Math.min(1, b.t / 500, (b.doi - b.t) / 900);
    if (a <= 0) continue;
    const y = b.y - b.cao, to = b.to;
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(4,12,18,.4)';                 // bóng nhỏ dưới mặt nước
    ctx.beginPath(); ctx.ellipse(b.x, b.y, to * 2.2, to * 1.2, 0, 0, 6.284); ctx.fill();
    const v = Math.sin(t / 24 + b.pha) * .5 + .5;       // cánh vỗ nhoè đi
    ctx.fillStyle = `rgba(214,238,248,${.26 + v * .22})`;
    for (const ben of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(b.x - to * .8, y + ben * to * 1.5, to * 2.5, to * .95, ben * .55, 0, 6.284);
      ctx.fill();
    }
    ctx.fillStyle = b.muoi ? '#42525b' : '#20262a';
    ctx.beginPath(); ctx.ellipse(b.x, y, to * 1.9, to * 1.05, b.huong, 0, 6.284); ctx.fill();
    if (b.muoi) {                                       // muỗi thì chân dài lêu nghêu
      ctx.strokeStyle = 'rgba(130,150,160,.45)'; ctx.lineWidth = .6;
      for (const ben of [-1, 1]) for (const k of [-1, .5]) {
        ctx.beginPath(); ctx.moveTo(b.x + k * to, y);
        ctx.lineTo(b.x + k * to * 2.6, y + ben * to * 3.2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}

const boGan = (e) => {
  let gan = null, dGan = Infinity;
  for (const b of bo) {
    if (b.dinh) continue;
    const d = Math.hypot(b.x - e.x, b.y - b.cao - e.y);
    if (d < dGan) { dGan = d; gan = b; }
  }
  return gan && dGan < e.s * 4.2 ? gan : null;
};

/* ---- lưỡi ếch: ngắm, phóng ra, kéo con bọ về ---- */

function ngamVaPhong(e, dt) {
  if (e.luoi || e.nghiLuoi > 0 || e.nl > .92) return;   // no gần đầy thì nó chẳng thèm, để dành cho con đói
  const b = boGan(e);
  if (!b) return;
  const g = Math.atan2(b.y - b.cao - e.y, b.x - e.x);
  const lech = Math.atan2(Math.sin(g - e.goc), Math.cos(g - e.goc));
  e.goc += lech * Math.min(1, dt / 90) * .45;           // quay đầu nhìn theo con bọ
  const d = Math.hypot(b.x - e.x, b.y - b.cao - e.y);
  if (d < e.s * 2.5 && Math.abs(lech) < .6) {           // vào tầm và đang nhìn đúng hướng thì phóng lưỡi
    e.luoi = { t: 0, doi: 300, dai: d, con: b, f: 0 };
    b.dinh = e; tach(e.x);
  }
}

function buocLuoi(e, dt) {
  const L = e.luoi;
  L.t += dt;
  const p = Math.min(1, L.t / L.doi);
  L.f = p < .42 ? p / .42 : 1 - (p - .42) / .58;        // phóng ra rất nhanh, thu về chậm hơn
  if (L.con) {                                          // con bọ dính đầu lưỡi, bị lôi về miệng
    const d = e.s * .45 + L.dai * L.f;
    L.con.x = e.x + Math.cos(e.goc) * d;
    L.con.y = e.y + Math.sin(e.goc) * d + L.con.cao;
  }
  if (p >= 1) {
    if (L.con) {
      const i = bo.indexOf(L.con);
      if (i >= 0) bo.splice(i, 1);
      e.an++; e.nhaiT = 420;
      e.nl = Math.min(1, e.nl + BU_MOI);                // ăn thì bù mức no, chuyện đẻ để tới hẹn mới xét
    }
    e.luoi = null; e.nghiLuoi = 1400;
  }
}

function veLuoi(e, s) {
  const L = e.luoi;
  if (!L || L.f <= 0) return;
  const dai = s * .45 + L.dai * L.f;
  ctx.strokeStyle = 'rgba(228,138,146,.92)'; ctx.lineWidth = s * .08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(s * .4, 0); ctx.lineTo(dai, 0); ctx.stroke();
  ctx.fillStyle = '#eb989f';
  ctx.beginPath(); ctx.arc(dai, 0, s * .085, 0, 6.284); ctx.fill();
}

/* ---- cá: bơi dưới mặt nước, rượt nòng nọc ---- */

const SO_CA = 3;                                        // đông hơn nữa thì hồ thành cái chậu cá

function themCa(so) {
  if (so === undefined) so = Math.random() < .58 ? 1 : (Math.random() < .8 ? 2 : 3);   // phần lớn một con, thỉnh thoảng hai, đôi khi ba
  for (let n = 0; n < so && ca.length < SO_CA; n++) {
    const ben = Math.random() < .5;
    ca.push({ x: ben ? -30 : W + 30, y: rnd(H * .2, H * .9),
              huong: ben ? rnd(-.4, .4) : Math.PI + rnd(-.4, .4),
              toc: rnd(46, 66), s: rnd(13, 19), noi: 0, nghi: 0,
              t: 0, doi: rnd(24000, 44000), pha: rnd(0, 6.28) });
  }
}

function buocCa(dt) {
  const g = dt / 1000;
  for (let i = ca.length - 1; i >= 0; i--) {
    const c = ca[i];
    c.t += dt; c.nghi = Math.max(0, c.nghi - dt);
    if (c.x < -70 || c.x > W + 70 || c.y < -70 || c.y > H + 70) { ca.splice(i, 1); continue; }

    let dM = Infinity;
    if (c.t > c.doi) {                                  // hết giờ thì tìm mép gần nhất mà đi
      const ra = Math.atan2(c.y < H / 2 ? -H : H, c.x < W / 2 ? -W : W);
      c.huong += Math.atan2(Math.sin(ra - c.huong), Math.cos(ra - c.huong)) * .04;
      c.noi += (0 - c.noi) * .03;
    } else {
      let mieng = null;                                 // con nòng nọc gần nhất
      for (const n of nong) { const d = Math.hypot(n.x - c.x, n.y - c.y); if (d < dM) { dM = d; mieng = n; } }
      if (mieng && dM < 130 && c.nghi <= 0) {           // thấy con mồi thì nổi lên rượt
        const nh = Math.atan2(mieng.y - c.y, mieng.x - c.x);
        const k = Math.min(2, dt / 16.7);              // xoay và nổi theo thời gian thật, không theo số khung hình
        c.huong += Math.atan2(Math.sin(nh - c.huong), Math.cos(nh - c.huong)) * (dM < 70 ? .3 : .11) * k;
        c.noi += (Math.min(1, (130 - dM) / 90) - c.noi) * .12 * k;
        if (dM < 33) {                                  // đớp
          nong.splice(nong.indexOf(mieng), 1);
          themSong(mieng.x, mieng.y, .6); thup(mieng.x);
          c.nghi = rnd(5000, 11000); c.noi = 1;         // đớp xong thì lặn xuống nghỉ một lúc
        }
      } else {
        c.huong += rnd(-1, 1) * 1.3 * g;
        c.noi += (0 - c.noi) * .02;
        if (c.x < 40 || c.x > W - 40 || c.y < H * .1 || c.y > H * .94) {
          const vao = Math.atan2(H * .5 - c.y, W * .5 - c.x);
          c.huong += Math.atan2(Math.sin(vao - c.huong), Math.cos(vao - c.huong)) * .07;
        }
      }
    }
    /* Cú phóng phải bắt đầu XA hơn khoảng nòng nọc cong đuôi chạy (62), nếu không
       thì có một vành đai mà nòng nọc nhanh hơn cá, nó cứ thoát ra rồi vào, không ai bắt được ai. */
    const toc = c.toc * (1 + c.noi * .5) * (dM < 95 ? 2.3 : 1);
    c.x += Math.cos(c.huong) * toc * g;
    c.y += Math.sin(c.huong) * toc * g;
  }
}

function veCa(t) {
  for (const c of ca) {
    const a = .16 + c.noi * .34, s = c.s * (.88 + c.noi * .22);
    const dao = Math.sin(t / 190 + c.pha);
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.huong);
    ctx.fillStyle = `rgba(9,24,32,${a})`;
    ctx.beginPath(); ctx.ellipse(0, 0, s, s * .36, 0, 0, 6.284); ctx.fill();
    ctx.beginPath();                                    // đuôi ve theo nhịp bơi
    ctx.moveTo(-s * .75, 0);
    ctx.lineTo(-s * 1.55, dao * s * .4 + s * .3);
    ctx.lineTo(-s * 1.55, dao * s * .4 - s * .3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();                                    // vây lưng
    ctx.moveTo(s * .1, 0); ctx.lineTo(-s * .3, -s * .55); ctx.lineTo(-s * .45, 0);
    ctx.closePath(); ctx.fill();
    if (c.noi > .35) {                                  // gần mặt nước thì lưng bắt sáng
      ctx.fillStyle = `rgba(180,215,230,${(c.noi - .35) * .16})`;
      ctx.beginPath(); ctx.ellipse(s * .1, -s * .06, s * .62, s * .16, 0, 0, 6.284); ctx.fill();
    }
    ctx.restore();
  }
}

/* ---- trứng và nòng nọc ---- */

function deTrung(e) {
  if (demCon() >= 18) return false;                     // đông quá mức chịu được thì để đó, chưa đẻ
  const l = la[e.la], g = rnd(0, 6.284);
  const gx = l ? l.x : e.x, gy = l ? yLa(l) : e.y, b = (l ? l.r : 20) + rnd(12, 24);
  const x = Math.max(16, Math.min(W - 16, gx + Math.cos(g) * b));
  const y = Math.max(16, Math.min(H - 16, gy + Math.sin(g) * b));
  trung.push({ x, y, t: 0, doi: rnd(20000, 26000), n: 3 + Math.floor(Math.random() * 5), pha: rnd(0, 6.28) });
  themSong(x, y, .22);
  return true;
}

function buocTrung(dt) {
  for (let i = trung.length - 1; i >= 0; i--) {
    const o = trung[i];
    o.t += dt;
    if (o.t < o.doi) continue;
    for (let k = 0; k < o.n; k++) themNong(o.x + rnd(-9, 9), o.y + rnd(-9, 9));
    themSong(o.x, o.y, .18);
    trung.splice(i, 1);
  }
}

function veTrung(t) {
  for (const o of trung) {
    const p = o.t / o.doi, day = Math.min(1, o.t / 900);
    const nhun = Math.sin(t / 1400 + o.pha) * 1.6;
    for (let k = 0; k < o.n; k++) {
      const a = o.pha + k * 2.399, r = 4 + k * .95;
      const x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r + nhun;
      ctx.fillStyle = `rgba(198,224,222,${.2 * day})`;  // màng trứng trong
      ctx.beginPath(); ctx.arc(x, y, 6.2, 0, 6.284); ctx.fill();
      ctx.fillStyle = `rgba(22,36,32,${.62 * day})`;    // cái mầm đen bên trong
      ctx.beginPath(); ctx.arc(x, y, 2.1 + p * 1.1, 0, 6.284); ctx.fill();
      if (p > .6) {                                     // sắp nở thì mọc cái đuôi con
        ctx.strokeStyle = `rgba(22,36,32,${.5 * day})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x - 3 - (p - .6) * 8, y + Math.sin(t / 200 + k) * 1.6); ctx.stroke();
      }
    }
  }
}

function themNong(x, y) {
  nong.push({ x, y, huong: rnd(0, 6.284), toc: rnd(20, 30), s: 4.4, cho: 0,
              t: 0, doi: rnd(40000, 55000), pha: rnd(0, 6.28), vot: 0, moi: 0 });
}

function buocNong(dt) {
  const g = dt / 1000;
  for (let i = nong.length - 1; i >= 0; i--) {
    const n = nong[i];
    n.t += dt;
    n.vot = Math.max(0, n.vot - dt);
    n.moi = Math.max(0, n.moi - dt);                    // vọt xong thì mỏi, phải lấy hơi mới vọt tiếp
    n.s = 4.4 + (n.t / n.doi) * 4.2;                    // lớn dần lên
    n.huong += rnd(-1, 1) * 2.2 * g;
    if (n.x < 24 || n.x > W - 24 || n.y < H * .08 || n.y > H * .96) {
      const vao = Math.atan2(H * .5 - n.y, W * .5 - n.x);
      n.huong += Math.atan2(Math.sin(vao - n.huong), Math.cos(vao - n.huong)) * .1;
    }
    for (const c of ca) if (Math.hypot(c.x - n.x, c.y - n.y) < 62) {   // thấy cá tới gần thì cong đuôi chạy
      n.huong = Math.atan2(n.y - c.y, n.x - c.x);
      if (n.moi <= 0) { n.vot = 340; n.moi = 340 + 620; }
    }
    const toc = n.toc * (n.vot > 0 ? 2.2 : 1);          // vọt được một quãng rồi mỏi, không thắng nổi cú phóng của cá
    n.x += Math.cos(n.huong) * toc * g;
    n.y += Math.sin(n.huong) * toc * g;
    if (n.t >= n.doi) {
      if (ech.length >= TOI_DA_ECH && n.cho < 3) { n.doi += 12000; n.cho++; continue; }   // hồ chật thì chờ, mỗi lần 12 giây
      if (ech.length >= TOI_DA_ECH) { themSong(n.x, n.y, .14); nong.splice(i, 1); continue; }   // chờ hết một phút mà vẫn chật thì không qua được
      thanhEch(n); nong.splice(i, 1);
    }
  }
}

function veNong(t) {
  for (const n of nong) {
    const s = n.s, dao = Math.sin(t / 130 + n.pha);
    ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(n.huong);
    ctx.strokeStyle = 'rgba(26,42,36,.75)'; ctx.lineWidth = Math.max(1, s * .22); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * .5, 0);            // cái đuôi ve vẩy
    ctx.quadraticCurveTo(-s * 1.2, dao * s * .5, -s * 2, dao * s * .9);
    ctx.stroke();
    const gr = ctx.createRadialGradient(-s * .2, -s * .2, s * .1, 0, 0, s);
    gr.addColorStop(0, 'rgba(70,104,84,.95)'); gr.addColorStop(1, 'rgba(24,44,38,.95)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(0, 0, s * .78, s * .58, 0, 0, 6.284); ctx.fill();
    if (n.t / n.doi > .62) {                            // gần thành ếch thì nhú hai chân sau
      ctx.strokeStyle = 'rgba(60,96,74,.85)'; ctx.lineWidth = Math.max(.8, s * .16);
      for (const ben of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(-s * .4, ben * s * .25);
        ctx.lineTo(-s * .95, ben * s * (.5 + dao * .1)); ctx.stroke();
      }
    }
    ctx.restore();
  }
}

function thanhEch(n) {
  ech.push({ la: -1, dich: laConCho(-1, n.x, n.y), dx: 0, dy: 0, x: n.x, y: n.y, goc: n.huong,
             s: Math.max(18, Math.min(28, Math.min(W, H) * .066)),
             doiSong: DOI_SONG(), tuoi: 0, tan: null, chuKy: CHU_KY(), tChuKy: 0, nl: .45,
             nhay: false, boi: true, tDap: 0, t: 0, doi: 0, cung: 0,
             x0: 0, y0: 0, x1: 0, y1: 0, nghi: 0, nhamMat: 0, tuNhay: rnd(5000, 15000),
             song: 0, giong: Math.floor(Math.random() * 4), tocGiong: .88 + Math.random() * .26,
             henKeu: 0, nghiKeu: rnd(3000, 15000),
             an: 0, luoi: null, nghiLuoi: 0, nhaiT: 0, deT: 0 });
  themSong(n.x, n.y, .4);
}

/* ---- Tiếng hồ ----
   Không nhúng file âm thanh nào. Mỗi tiếng được **tính ra mẫu đúng một lần** lúc mở tiếng, sau đó
   phát lại chỉ tốn hai node. Bản trước tôi dựng cả chuỗi lọc cho từng tiếng, mỗi gợn sóng là 6–10
   node mới, máy yếu gánh không nổi nên thấy lag.

   Công thức lấy theo tài liệu, không phải mò:
   - Giọt nước: van den Doel 2005 mô hình bong bóng `A·sin(2πf(t)t)·e^(−βt)`, `f(t)=f0(1+ξt)`, ξ≈0,1.
     Cao độ **nhích lên** chứ không tụt, và gần như thuần âm — cho nhiễu vào là ra tiếng rào.
     f0 theo cộng hưởng Minnaert `f0 ≈ 3,26/R`: bong bóng 2 mm ra ~1600 Hz, 5 mm ra ~650 Hz.
   - Tiếng dế: carrier 4,5–4,8 kHz gần như hình sin thuần, xung 15–20 ms, nghỉ 15–20 ms, 3–5 xung.
   - Tiếng ếch: sóng hài bị băm biên độ 40–130 nhịp mỗi giây, dải trội 400–4000 Hz.

   **Không có tiếng nền.** Bản đầu tôi cho một vòng nhiễu lọc trầm chạy liên tục, nghe ra tiếng
   quạt rì rì chứ không ra hồ nước, và nghe lâu thì mệt. Hồ đêm thật thì im, chỉ có tiếng nước lẻ,
   tiếng ếch và tiếng dế — chỗ im giữa hai tiếng mới là phần làm nó dịu.

   Người bật nút gạt im lặng của iPhone sẽ không nghe gì, đó là cách iOS chặn Web Audio. */

const MUC = .34;                                        // mức chung
const TIENG_KEY = 'tdtd.tieng';                         // nhớ lựa chọn tắt hay mở, mặc định tắt
const LOA_MO = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15 9.2a4.3 4.3 0 010 5.6"/><path d="M17.9 6.7a8 8 0 010 10.6"/></svg>';
const LOA_TAT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.4 9.6l5 4.8M20.4 9.6l-5 4.8"/></svg>';

let ac = null, chung = null, mau = null, dangVang = 0, phanTich = null;
let lanTum = 0, lanDap = 0, demTum = 0, demDap = 0, demKeu = 0, tConTrung = 0;
let tiengBat = false;
try { tiengBat = localStorage.getItem(TIENG_KEY) === '1'; } catch (e) {}   // mặc định tắt

/* --- tính mẫu --- */

const dungMau = (a) => {                                // chuẩn hoá rồi bỏ vào AudioBuffer
  let d = 0;
  for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i]));
  const k = d > 0 ? .92 / d : 1;
  const b = ac.createBuffer(1, a.length, ac.sampleRate), o = b.getChannelData(0);
  for (let i = 0; i < a.length; i++) o[i] = a[i] * k;
  return b;
};

function mauGiot(f0) {
  const sr = ac.sampleRate, beta = .043 * f0, n = Math.floor(sr * Math.min(.45, 8 / beta));
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    a[i] = Math.exp(-beta * t) * Math.sin(2 * Math.PI * f0 * (t + .05 * t * t));   // ∫f0(1+0,1t)dt
  }
  return dungMau(a);
}

function mauOp(f0, fp, so) {
  const sr = ac.sampleRate, dot = .19, nghi = .075;
  const n = Math.floor(sr * (so * dot + (so - 1) * nghi + .04));
  const a = new Float32Array(n);
  for (let k = 0; k < so; k++) {
    const bd = Math.floor(k * (dot + nghi) * sr), m = Math.floor(dot * sr);
    for (let i = 0; i < m && bd + i < n; i++) {
      const t = i / sr, tt = (bd + i) / sr;
      let v = 0;
      for (let h = 1; h <= 7; h++) v += Math.sin(2 * Math.PI * f0 * h * tt) / h;   // xấp xỉ sóng cưa
      const bam = Math.pow(.5 + .5 * Math.sin(2 * Math.PI * fp * t), 2.2);         // băm biên độ
      const vo = Math.min(1, t / .018) * Math.min(1, (dot - t) / .05);
      a[bd + i] += v * bam * vo;
    }
  }
  return dungMau(a);
}

function mauDe(f) {
  const sr = ac.sampleRate, xung = .017, ke = .018, so = 4;
  const n = Math.floor(sr * so * (xung + ke)), a = new Float32Array(n), m = Math.floor(sr * xung);
  for (let k = 0; k < so; k++) {
    const bd = Math.floor(k * (xung + ke) * sr);
    for (let i = 0; i < m && bd + i < n; i++) {
      const cua = Math.sin(Math.PI * i / m);            // cửa sổ mềm, khỏi cạch hai đầu
      a[bd + i] = Math.sin(2 * Math.PI * f * i / sr) * cua * cua;
    }
  }
  return dungMau(a);
}

function mauBet(xuong) {                                // bẹt ướt trên mặt lá, đục, có cái sột nhẹ
  const sr = ac.sampleRate, n = Math.floor(sr * (xuong ? .17 : .13)), a = new Float32Array(n);
  const k1 = 1 - Math.exp(-2 * Math.PI * (xuong ? 250 : 380) / sr);
  const k2 = 1 - Math.exp(-2 * Math.PI * 1700 / sr);
  let y = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, x = Math.random() * 2 - 1;
    y += (x - y) * k1; y2 += (x - y2) * k2;
    const vo = Math.exp(-t * (xuong ? 32 : 44)) * Math.min(1, t / .003);
    a[i] = (y * 2.6 + (x - y2) * .1) * vo;
  }
  return dungMau(a);
}

function mauThup() {                                    // cá đớp
  const sr = ac.sampleRate, n = Math.floor(sr * .18), a = new Float32Array(n);
  const k = 1 - Math.exp(-2 * Math.PI * 190 / sr);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    y += ((Math.random() * 2 - 1) - y) * k;
    a[i] = y * Math.exp(-t * 26) * Math.min(1, t / .002);
  }
  return dungMau(a);
}

function mauTach() {                                    // lưỡi ếch phóng ra
  const sr = ac.sampleRate, n = Math.floor(sr * .045), a = new Float32Array(n);
  const k = 1 - Math.exp(-2 * Math.PI * 2600 / sr);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, x = Math.random() * 2 - 1;
    y += (x - y) * k;
    a[i] = (x - y) * Math.exp(-t * 170);
  }
  return dungMau(a);
}

/* --- phát --- */

function phat(b, muc, toc) {
  if (tua) return false;                                // tua thì câm, kẻo dồn cả nghìn tiếng vào một lúc
  if (!ac || !tiengBat || ac.state !== 'running' || !b || dangVang > 8) return false;
  const s = ac.createBufferSource(); s.buffer = b;
  if (toc) s.playbackRate.value = toc;
  const g = ac.createGain(); g.gain.value = muc;
  s.connect(g); g.connect(chung);
  dangVang++;
  s.onended = () => { dangVang--; try { s.disconnect(); g.disconnect(); } catch (e) {} };
  s.start();
  return true;
}

function moTieng() {
  if (ac) { if (tiengBat && ac.state === 'suspended') ac.resume(); return; }
  const AC = self.AudioContext || self.webkitAudioContext;
  if (!AC) return;
  try { ac = new AC(); } catch (e) { ac = null; return; }

  chung = ac.createGain();
  chung.gain.setValueAtTime(.0001, ac.currentTime);
  chung.gain.linearRampToValueAtTime(tiengBat ? MUC : .0001, ac.currentTime + 2);   // vào từ từ
  chung.connect(ac.destination);

  mau = {                                               // tính một lần, dùng mãi
    giot: [mauGiot(640), mauGiot(820), mauGiot(1150), mauGiot(1650)],
    bet: [mauBet(false), mauBet(false), mauBet(true), mauBet(true)],
    op: [mauOp(420, 46, 2), mauOp(520, 58, 1), mauOp(640, 52, 3), mauOp(780, 68, 2)],
    de: [mauDe(4500), mauDe(4800)],
    thup: mauThup(), tach: mauTach(),
  };
}

function dongTieng() {
  if (!ac) return;
  try {
    chung.gain.cancelScheduledValues(ac.currentTime);
    chung.gain.setValueAtTime(Math.max(.0001, chung.gain.value), ac.currentTime);
    chung.gain.linearRampToValueAtTime(.0001, ac.currentTime + .35);
    setTimeout(() => { if (ac && ac.state === 'running') ac.suspend(); }, 420);
  } catch (e) {}
}

function batTat() {
  tiengBat = !tiengBat;
  try { localStorage.setItem(TIENG_KEY, tiengBat ? '1' : '0'); } catch (e) {}
  const n = tam && tam.querySelector('.ho-tieng');
  if (n) {
    n.classList.toggle('tat', !tiengBat);
    n.setAttribute('aria-label', tiengBat ? 'Tắt tiếng' : 'Mở tiếng');
    n.innerHTML = tiengBat ? LOA_MO : LOA_TAT;
  }
  if (!ac) { if (tiengBat) moTieng(); return; }
  if (tiengBat) {
    if (ac.state === 'suspended') ac.resume();
    chung.gain.cancelScheduledValues(ac.currentTime);
    chung.gain.setValueAtTime(Math.max(.0001, chung.gain.value), ac.currentTime);
    chung.gain.linearRampToValueAtTime(MUC, ac.currentTime + .5);
  } else dongTieng();
}

/* Chạm mạnh thì bong bóng to nên tiếng trầm, hạt mưa nhỏ thì cao — đúng chiều của Minnaert. */
function tum(x, manh) {
  if (!ac || !tiengBat || manh < .15) return;
  const t0 = ac.currentTime;
  if (t0 - lanTum < .11) return;
  const v = Math.min(1, manh);
  const i = Math.min(3, Math.max(0, Math.round((1 - v) * 3.4)));
  if (phat(mau.giot[i], .3 * v, .93 + Math.random() * .16)) { lanTum = t0; demTum++; }
}

function dap(x, manh, xuong) {
  if (!ac || !tiengBat) return;
  const t0 = ac.currentTime;
  if (t0 - lanDap < .025) return;
  const i = (xuong ? 2 : 0) + (Math.random() < .5 ? 0 : 1);
  if (phat(mau.bet[i], .34 * Math.min(1, manh), .92 + Math.random() * .18)) { lanDap = t0; demDap++; }
}

function keu(e) {
  if (!ac || !tiengBat) return;
  if (!phat(mau.op[e.giong], .3, e.tocGiong)) return;
  demKeu++;
  e.nghiKeu = rnd(9000, 22000); e.henKeu = 0;
  for (const k of ech) {                                // một con bên cạnh đáp lời cho thành câu đối đáp
    if (k === e || !nguoi(k) || k.henKeu > 0 || k.nghiKeu > 0) continue;
    if (Math.hypot(k.x - e.x, k.y - e.y) < 220 && Math.random() < .4) { k.henKeu = rnd(300, 900); break; }
  }
}

const thup = (x) => { if (ac && tiengBat) phat(mau.thup, .3, .9 + Math.random() * .25); };
const tach = (x) => { if (ac && tiengBat) phat(mau.tach, .16, .9 + Math.random() * .3); };
const conTrung = () => { if (ac && tiengBat) phat(mau.de[Math.random() < .5 ? 0 : 1], .1, .96 + Math.random() * .09); };

let tua = false;        // đang chạy bù thời gian: tính đủ, nhưng không vẽ và không kêu
let tAn = 0;            // lúc trang bị ẩn đi

function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

/* Chạy bù quãng thời gian trang bị ẩn, để hồ vẫn sống trong lúc mình nhìn chỗ khác.
   Không lưu gì xuống máy: chỉ nhớ mốc thời gian trong bộ nhớ, đóng app là mất.
   Chạy từng bước 33 mili giây cho vật lý y như lúc chạy thật, chỉ bỏ phần vẽ và tiếng.
   Chặn trên 20 phút, ẩn lâu hơn nữa thì coi như 20 phút, kẻo tua cả đêm. */
const TUA_TOI_DA = 20 * 60 * 1000;

function buTru(ms) {
  ms = Math.min(ms, TUA_TOI_DA);
  if (ms < 1200) return 0;
  const BUOC = 33, n = Math.floor(ms / BUOC);
  tua = true;
  song = [];                                            // gợn sóng chỉ để nhìn, tua thì bỏ
  let t = tTruoc;
  for (let i = 0; i < n; i++) { t += BUOC; buoc(t); }
  tua = false;
  song = [];
  tTruoc = performance.now();
  return n;
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;

  if (!tua) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0e2430'); g.addColorStop(.5, '#0d1c2c'); g.addColorStop(1, '#080f1c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // vệt trăng loang trên mặt nước
    const m = ctx.createRadialGradient(W * .5, H * .2, 10, W * .5, H * .2, Math.max(W, H) * .7);
    m.addColorStop(0, 'rgba(150,200,230,.10)'); m.addColorStop(1, 'rgba(150,200,230,0)');
    ctx.fillStyle = m; ctx.fillRect(0, 0, W, H);
  }

  tMua -= dt;
  if (tMua <= 0) { themSong(rnd(0, W), rnd(0, H), rnd(.28, .5)); tMua = rnd(1400, 3800); }

  tDan -= dt;
  if (tDan <= 0) { mucBo = MUC_BO(); tDan = rnd(50000, 110000); }   // chừng một hai phút lại đổi mùa
  tBo -= dt;
  if (tBo <= 0) { themBo(); tBo = rnd(16000, 34000) / mucBo; }      // mùa rộ 8–18 giây một con, mùa vắng gần hai phút
  tConTrung -= dt;
  if (tConTrung <= 0) { conTrung(); tConTrung = rnd(18000, 45000); }
  tCa -= dt;
  if (tCa <= 0) { themCa(); tCa = rnd(45000, 110000); }
  buocBo(dt); buocCa(dt); buocTrung(dt); buocNong(dt);

  if (tua) { song.length = 0; } else {
    for (let i = song.length - 1; i >= 0; i--) { song[i].t += dt; if (!veSong(song[i])) song.splice(i, 1); }
  }
  buocLa(dt);
  if (!tua) {
    veCa(t);                                            // cá ở sâu nhất, vẽ dưới cùng
    veTrung(t); veNong(t);                              // trứng với nòng nọc ở dưới nước, vẽ trước lá
    veCuong();
    for (const l of la) veLa(l, t);
  }
  buocEch(dt);
  if (!tua) {
    for (const e of [...ech].sort((a, b) => (a.nhay - b.nhay) || (a.y - b.y))) veEch(e, t);
    veBo(t);                                            // ruồi muỗi bay trên tất cả
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  song = []; tMua = 900;
  bo = []; trung = []; nong = []; ca = []; tBo = rnd(4000, 9000); tCa = rnd(20000, 45000);
  mucBo = MUC_BO(); tDan = rnd(50000, 110000);
  luong.goc = rnd(0, 6.284); luong.toc = luong.tocDich = rnd(.4, 2.4);
  luong.quay = luong.quayDich = (Math.random() < .5 ? -1 : 1) * rnd(.018, .05);
  luong.xoay = luong.xoayDich = rnd(-1.2, 1.2); luong.t = rnd(25000, 60000);
  tConTrung = rnd(8000, 20000);
  if (tiengBat) moTieng();
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  dongTieng();
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  song = [];
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
addEventListener('visibilitychange', () => {
  const dangMo = !!(tam && tam.classList.contains('hien'));
  if (document.hidden) {
    if (dangMo) tAn = Date.now();                       // nhớ lúc rời đi, chỉ trong bộ nhớ
    if (ac && ac.state === 'running') ac.suspend();     // chuyển tab thì ngưng tiếng, đỡ tốn pin
  } else {
    if (dangMo && tAn) { buTru(Date.now() - tAn); tAn = 0; }
    if (ac && tiengBat && dangMo && ac.state === 'suspended') ac.resume();
  }
});
self.TDTD_HO = { mo, dong, _buoc: (t) => buoc(t), _buTru: (ms) => buTru(ms),
  _cham: (x, y) => { themSong(x, y, 1); const con = echTai(x, y); if (con) giatMinh(con, x, y); },
  _trungEch: (x, y) => !!echTai(x, y),
  _ech: () => ech.map(e => ({ la: e.la, nhay: e.nhay, boi: e.boi, dich: e.dich,
                              tan: e.tan === null ? null : Math.round(e.tan),
                              x: Math.round(e.x), y: Math.round(e.y), goc: +e.goc.toFixed(2) })),
  _la: () => la.map(l => ({ x: Math.round(l.x), y: Math.round(l.y), yVe: Math.round(yLa(l)), r: Math.round(l.r), rMax: Math.round(l.rMax),
                            ech: soEch(l), suc: suc(l), chim: +l.chim.toFixed(2),
                            tuoi: Math.round(l.tuoi / 1000), doiSong: Math.round(l.doiSong / 1000),
                            tan: l.chet === null ? null : Math.round(l.chet), cuong: !!l.cuong })),
  _bo: () => bo.map(b => ({ muoi: b.muoi, x: Math.round(b.x), y: Math.round(b.y), dinh: !!b.dinh })),
  _ca: () => ca.map(c => ({ x: Math.round(c.x), y: Math.round(c.y), noi: +c.noi.toFixed(2) })),
  _themNong: (x, y, n = 1) => { for (let i = 0; i < n; i++) themNong(x + rnd(-8, 8), y + rnd(-8, 8)); return nong.length; },
  _nong: () => nong.map(n => ({ x: Math.round(n.x), y: Math.round(n.y), s: +n.s.toFixed(1), vot: Math.round(n.vot) })),
  _themCa: (x, y, so = 1) => { ca = []; themCa(so); const c = ca[0]; if (c && x !== undefined) { c.x = x; c.y = y; } return !!c; },
  _themBo: (x, y) => { themBo(1); const b = bo[bo.length - 1]; if (b && x !== undefined) { b.x = x; b.y = y; } return !!b; },
  _pho: () => {                                         // gắn máy phân tích để đo phổ lúc kiểm thử
    if (!ac) return null;
    if (!phanTich) { phanTich = ac.createAnalyser(); phanTich.fftSize = 2048; phanTich.smoothingTimeConstant = 0; chung.connect(phanTich); }
    const d = new Float32Array(phanTich.frequencyBinCount);
    phanTich.getFloatFrequencyData(d);
    return { rate: ac.sampleRate, bins: Array.from(d) };
  },
  _keu: () => { const e = ech.find(nguoi); if (!e) return false; e.nghiKeu = 0; keu(e); return true; },
  _de: () => conTrung(),
  _tieng: () => ({ co: !!ac, trangThai: ac ? ac.state : null, bat: tiengBat,
                   muc: ac ? +chung.gain.value.toFixed(3) : null, vang: dangVang,
                   soMau: mau ? Object.keys(mau).length : 0,
                   tum: demTum, dap: demDap, keu: demKeu }),
  _batTat: () => batTat(),
  _luong: () => ({ goc: +luong.goc.toFixed(2), toc: +luong.toc.toFixed(2), quay: +luong.quay.toFixed(3), xoay: +luong.xoay.toFixed(2) }),
  _dam: () => ({ trung: trung.length, nong: nong.length, an: ech.reduce((n, e) => n + e.an, 0),
                 no: ech.map(e => +e.nl.toFixed(2)), mucBo: +mucBo.toFixed(2) }),
  _giaDi: (ms) => { for (const e of ech) { e.tuoi += ms; e.tChuKy += ms; } return ech.length; },
  _tuoi: () => ech.map(e => ({ tuoi: `${Math.round(e.tuoi / 1000)}/${Math.round(e.doiSong / 1000)}s`,
                               hen: `${Math.round(e.tChuKy / 1000)}/${Math.round(e.chuKy / 1000)}s`,
                               no: +e.nl.toFixed(2), an: e.an, tan: e.tan === null ? null : Math.round(e.tan) })),
  _debug: () => ({ song: song.length, la: la.length, ech: ech.length,
                   bay: ech.filter(e => e.nhay).length, boi: ech.filter(e => e.boi).length,
                   bo: bo.length, ca: ca.length, trung: trung.length, nong: nong.length,
                   laTan: la.filter(l => l.chet !== null).length, mam: la.filter(l => l.r < 22).length,
                   luoi: ech.filter(e => e.luoi).length, W, H }) };
})();

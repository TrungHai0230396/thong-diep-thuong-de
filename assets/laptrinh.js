/* Robot thắp sao — 100 bài lập trình cho trẻ 6–10 tuổi.

   Tìm hiểu trước khi làm (người dùng dặn):
   - Dạng trò như Lightbot: robot đi trên các khối hộp nhìn nghiêng ba chiều, trẻ xếp ô lệnh để đưa robot thắp sáng
     ô đích. Ô cao hơn một nấc thì phải Nhảy — chiều cao là phần "3D" của câu đố, không chỉ để trang trí.
   - Thứ tự dạy theo Code.org CS Fundamentals (code.org/csf): làm theo thứ tự → vòng lặp → hàm → điều kiện; sửa lỗi
     xen suốt (tài liệu của họ: phần lớn thời gian "lập trình" thật ra là sửa lỗi).
   - Trẻ nhỏ học được bằng khối lệnh có hình, không cần đọc nhiều (ScratchJr — MIT Media Lab, Tufts). Nghiên cứu thử
     ScratchJr của Joan Ganz Cooney Center: trẻ nhỏ không hiểu biểu tượng trừu tượng, nên dùng hình cụ thể → mỗi ô lệnh
     có hình mũi tên, ngôi sao… kèm một chữ ngắn.
   - Chương trình Tin học 2018 của Việt Nam đưa lập trình trực quan vào từ lớp 4: điều khiển một nhân vật chuyển động.
   Người dùng chọn: 6–10 tuổi, 3D nhìn nghiêng xoay được, robot thắp sáng ngôi sao; hình minh hoạ kiểu 3D.

   Bài học ở assets/baicode.js. Mỗi bài có lời giải mẫu: bài kiểm (scripts/test-laptrinh.js) chạy lời giải để chắc bài
   giải được, và với chương vòng lặp, hàm, điều kiện thì chắc là KHÔNG giải nổi nếu chỉ xếp lệnh từng bước (số ô lệnh
   tối đa nhỏ hơn số bước ít nhất) — tức bài buộc trẻ dùng đúng điều đang học. */
(function () {
'use strict';

const HUONG = [[0, -1], [1, 0], [0, 1], [-1, 0]];                  // Bắc, Đông, Nam, Tây
const CAO_TOI_DA = 6;
let maNut = 0;
const nutMoi = (o) => Object.assign({ id: ++maNut }, o);

/* ---------- cú pháp gọn để viết bài ----------
   d đi · t thắp · L rẽ trái · R rẽ phải · j nhảy lên một nấc · x nhảy xuống một nấc · X nhảy xuống hai nấc
   F gọi hàm ★ · 3(...) lặp 3 lần · w(...) lặp đến khi thắp hết sao
   ?d(...)(...) nếu có đường phía trước thì … không thì … · ?l bên trái · ?r bên phải · ?s(...) nếu đứng trên sao chưa thắp
   (x, X chỉ để vẽ bản đồ; trong chương trình của trẻ chỉ có một ô Nhảy) */
function docMa(s) {
  let i = 0;
  const boTrong = () => { while (i < s.length && /\s/.test(s[i])) i++; };
  const moNgoac = () => { boTrong(); if (s[i++] !== '(') throw new Error(`thiếu "(" ở vị trí ${i - 1}`); };
  function day(trongNgoac) {
    const ra = [];
    for (;;) {
      boTrong();
      if (i >= s.length) { if (trongNgoac) throw new Error('thiếu ")"'); return ra; }
      if (s[i] === ')') { if (!trongNgoac) throw new Error('thừa ")"'); i++; return ra; }
      ra.push(mot());
    }
  }
  function mot() {
    const c = s[i++];
    switch (c) {
      case 'd': return nutMoi({ k: 'di' });
      case 't': return nutMoi({ k: 'thap' });
      case 'L': return nutMoi({ k: 'trai' });
      case 'R': return nutMoi({ k: 'phai' });
      case 'j': return nutMoi({ k: 'nhay', dh: 1 });
      case 'x': return nutMoi({ k: 'nhay', dh: -1 });
      case 'X': return nutMoi({ k: 'nhay', dh: -2 });
      case 'F': return nutMoi({ k: 'ham' });
      case 'w': moNgoac(); return nutMoi({ k: 'den', than: day(true) });
      case '?': {
        const dk = { d: 'truoc', l: 'trai', r: 'phai', s: 'sao' }[s[i++]];
        if (!dk) throw new Error(`điều kiện lạ ở vị trí ${i - 1}`);
        moNgoac();
        const thi = day(true);
        boTrong();
        let khac = [];
        if (s[i] === '(') { i++; khac = day(true); }
        return nutMoi({ k: 'neu', dk, thi, khac });
      }
      default:
        if (/[2-9]/.test(c)) { moNgoac(); return nutMoi({ k: 'lap', n: +c, than: day(true) }); }
        throw new Error(`không hiểu "${c}" ở vị trí ${i - 1}`);
    }
  }
  return day(false);
}

/* số ô lệnh: mỗi ô một, kể cả ô chứa (lặp, nếu) và các ô bên trong */
const soO = (ds) => ds.reduce((s, n) => s + 1 + (n.than ? soO(n.than) : 0) + (n.thi ? soO(n.thi) + soO(n.khac) : 0), 0);
/* các loại ô có trong một chương trình — để kiểm bài chỉ dùng ô được phép */
function loaiO(ds, ra = new Set()) {
  for (const n of ds) {
    ra.add(n.k === 'neu' ? 'neu-' + n.dk : n.k);
    if (n.than) loaiO(n.than, ra);
    if (n.thi) { loaiO(n.thi, ra); loaiO(n.khac, ra); }
  }
  return ra;
}

/* ---------- dựng bản đồ từ đường đi mẫu ----------
   Đi theo đường mẫu từ ô (0,0), hướng Đông: Đi thì đặt ô cùng độ cao phía trước, Nhảy thì đặt ô cao hơn / thấp hơn,
   Thắp thì ô đó là sao. Bản đồ thế nào cũng đi được theo đúng đường mẫu. "them" là các ô thêm cho bản đồ đỡ trống. */
function dungBan(bai) {
  const o = new Map(), khoa = (x, y) => x + ',' + y;
  let x = 0, y = 0, h = 0, hg = bai.huong == null ? 1 : bai.huong, sau = 0;
  o.set('0,0', { x: 0, y: 0, h: 0, sao: false });
  const dat = (nx, ny, nh) => {
    if (nh < 0 || nh > CAO_TOI_DA) throw new Error(`ô ${nx},${ny} cao ${nh}, ngoài 0–${CAO_TOI_DA}`);
    const c = o.get(khoa(nx, ny));
    if (c && c.h !== nh) throw new Error(`ô ${nx},${ny} đã cao ${c.h} mà đường mẫu cần ${nh}`);
    if (!c) o.set(khoa(nx, ny), { x: nx, y: ny, h: nh, sao: false });
  };
  const ham = docMa(bai.ham || '');
  const di = (ds) => {
    for (const n of ds) {
      if (n.k === 'di' || n.k === 'nhay') { x += HUONG[hg][0]; y += HUONG[hg][1]; if (n.k === 'nhay') h += n.dh; dat(x, y, h); }
      else if (n.k === 'trai') hg = (hg + 3) % 4;
      else if (n.k === 'phai') hg = (hg + 1) % 4;
      else if (n.k === 'thap') o.get(khoa(x, y)).sao = true;
      else if (n.k === 'lap') for (let k = 0; k < n.n; k++) di(n.than);
      else if (n.k === 'ham') { if (++sau > 40) throw new Error('hàm gọi hàm quá sâu'); di(ham); sau--; }
      else throw new Error('đường vẽ bản đồ không được có điều kiện — dùng "duong" riêng');
    }
  };
  di(docMa(bai.duong || bai.giai));
  for (const [tx, ty, th] of bai.them || []) dat(tx, ty, th);
  const ds = [...o.values()];
  const mx = Math.min(...ds.map(c => c.x)), my = Math.min(...ds.map(c => c.y));
  ds.forEach(c => { c.x -= mx; c.y -= my; });
  return {
    o: ds, robot: { x: -mx, y: -my, huong: bai.huong == null ? 1 : bai.huong },
    rong: Math.max(...ds.map(c => c.x)) + 1, sau: Math.max(...ds.map(c => c.y)) + 1,
  };
}

/* ---------- chạy chương trình ----------
   Đi: ô phía trước cùng độ cao. Nhảy: ô phía trước cao hơn đúng một nấc, hoặc thấp hơn. Không được thì robot khựng lại
   tại chỗ và chạy tiếp lệnh sau (như Lightbot — trẻ thấy rõ chỗ sai mà không bị dừng phắt). Thắp: chỉ ô sao chưa thắp.
   Thắp xong ngôi sao cuối là thắng ngay. Trả về từng bước để vẽ lại. */
function chay(ban, ct, ham, toiBuoc = 800) {
  const o = new Map(ban.o.map(c => [c.x + ',' + c.y, c]));
  const sao = ban.o.filter(c => c.sao).map(c => c.x + ',' + c.y);
  const sang = new Set(), buoc = [];
  let { x, y, huong } = ban.robot, thang = false, het = false, sau = 0;
  const oTai = (a, b) => o.get(a + ',' + b);
  const xong = () => sao.length > 0 && sao.every(k => sang.has(k));
  const coDuong = (hg) => { const c = oTai(x + HUONG[hg][0], y + HUONG[hg][1]); return !!c && c.h === oTai(x, y).h; };
  const dung = (dk) => dk === 'truoc' ? coDuong(huong) : dk === 'trai' ? coDuong((huong + 3) % 4)
    : dk === 'phai' ? coDuong((huong + 1) % 4) : (oTai(x, y).sao && !sang.has(x + ',' + y));
  function lam(ds) {
    for (const n of ds) {
      if (thang || het) return;
      if (buoc.length >= toiBuoc) { het = true; return; }
      if (n.k === 'di' || n.k === 'nhay') {
        const c0 = oTai(x, y), nx = x + HUONG[huong][0], ny = y + HUONG[huong][1], c1 = oTai(nx, ny);
        const duoc = !!c1 && (n.k === 'di' ? c1.h === c0.h : (c1.h === c0.h + 1 || c1.h < c0.h));
        buoc.push({ k: n.k, id: n.id, x0: x, y0: y, h0: c0.h, x1: duoc ? nx : x, y1: duoc ? ny : y, h1: duoc ? c1.h : c0.h, huong, ok: duoc });
        if (duoc) { x = nx; y = ny; }
      } else if (n.k === 'trai' || n.k === 'phai') {
        const truoc = huong;
        huong = (huong + (n.k === 'trai' ? 3 : 1)) % 4;
        buoc.push({ k: n.k, id: n.id, x0: x, y0: y, h0: oTai(x, y).h, huong0: truoc, huong, ok: true });
      } else if (n.k === 'thap') {
        const c = oTai(x, y), k = x + ',' + y, duoc = c.sao && !sang.has(k);
        if (duoc) sang.add(k);
        buoc.push({ k: 'thap', id: n.id, x0: x, y0: y, h0: c.h, huong, ok: duoc, sang: duoc ? k : null });
        if (duoc && xong()) thang = true;
      } else if (n.k === 'lap') {
        for (let i = 0; i < n.n && !thang && !het; i++) lam(n.than);
      } else if (n.k === 'ham') {
        if (sau >= 40) { het = true; return; }
        sau++; lam(ham || []); sau--;
      } else if (n.k === 'den') {
        let lan = 0;
        while (!xong() && !thang && !het) {
          const truoc = buoc.length;
          lam(n.than);
          if (buoc.length === truoc || ++lan > 400) { het = true; break; }   // vòng lặp không làm gì: dừng, kẻo treo máy
        }
      } else if (n.k === 'neu') {
        lam(dung(n.dk) ? n.thi : n.khac);
      }
    }
  }
  lam(ct);
  return { buoc, thang: thang || xong(), het, conLai: sao.filter(k => !sang.has(k)).length };
}

/* số lệnh từng bước ít nhất để thắp hết sao (tìm theo chiều rộng) — để biết bài có buộc dùng vòng lặp, hàm, điều
   kiện không: nếu số ô tối đa nhỏ hơn số này thì xếp từng bước không đủ chỗ */
function itNhat(ban) {
  const o = new Map(ban.o.map(c => [c.x + ',' + c.y, c]));
  const sao = ban.o.filter(c => c.sao), so = new Map(sao.map((c, i) => [c.x + ',' + c.y, i])), du = (1 << sao.length) - 1;
  const dau = [ban.robot.x, ban.robot.y, ban.robot.huong, 0], da = new Set([dau.join()]);
  let lop = [dau], buoc = 0;
  while (lop.length && buoc < 200) {
    const sau = [];
    for (const [x, y, hg, m] of lop) {
      if (m === du) return buoc;
      const c0 = o.get(x + ',' + y), nx = x + HUONG[hg][0], ny = y + HUONG[hg][1], c1 = o.get(nx + ',' + ny);
      const moi = [[x, y, (hg + 3) % 4, m], [x, y, (hg + 1) % 4, m]];
      if (c1 && (c1.h === c0.h || c1.h === c0.h + 1 || c1.h < c0.h)) moi.push([nx, ny, hg, m]);
      if (so.has(x + ',' + y)) moi.push([x, y, hg, m | (1 << so.get(x + ',' + y))]);
      for (const s of moi) { const k = s.join(); if (!da.has(k)) { da.add(k); sau.push(s); } }
    }
    lop = sau; buoc++;
  }
  return Infinity;
}

/* ---------- bài học ---------- */
const CHUONG = (self.TDTD_BAICODE || []);
const BAI = [];
CHUONG.forEach((ch, ci) => ch.bai.forEach((b, bi) => BAI.push(Object.assign({ chuong: ci, trongChuong: bi }, b, {
  lenh: b.lenh || ch.lenh,
  toiDa: b.toiDa || soO(docMa(b.giai)) + soO(docMa(b.ham || '')) + (ch.du == null ? 0 : ch.du),
}))));
const banCua = new Map();
const banBai = (i) => { if (!banCua.has(i)) banCua.set(i, dungBan(BAI[i])); return banCua.get(i); };

/* ---------- ô lệnh: hình, chữ, màu ---------- */
const O = {
  di:          { chu: 'Đi',      mau: 'xanh', hinh: '<path d="M12 19V6M6.5 11.5L12 6l5.5 5.5"/>' },
  trai:        { chu: 'Rẽ trái', mau: 'xanh', hinh: '<path d="M16 19v-6a4 4 0 0 0-4-4H6M9.5 5.5L6 9l3.5 3.5"/>' },
  phai:        { chu: 'Rẽ phải', mau: 'xanh', hinh: '<path d="M8 19v-6a4 4 0 0 1 4-4h6M14.5 5.5L18 9l-3.5 3.5"/>' },
  nhay:        { chu: 'Nhảy',    mau: 'xanh', hinh: '<path d="M4 19h5v-5h5V9h6"/><path d="M8 11c1-4 4-6 8-6M13.5 3.5L16 5l-1.5 2.5"/>' },
  thap:        { chu: 'Thắp',    mau: 'vang', hinh: '<path d="M12 3.5l2.4 5 5.4.6-4 3.7 1.1 5.4L12 15.5l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>' },
  ham:         { chu: 'Hàm ★',   mau: 'tim',  hinh: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1L12 14.5l-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z"/>' },
  lap:         { chu: 'Lặp',     mau: 'cam',  hinh: '<path d="M5 12a7 7 0 0 1 12-5l2 2M19 4v5h-5M19 12a7 7 0 0 1-12 5l-2-2M5 20v-5h5"/>' },
  den:         { chu: 'Lặp đến khi hết sao', mau: 'cam', hinh: '<path d="M5 12a7 7 0 0 1 12-5l2 2M19 4v5h-5M19 12a7 7 0 0 1-12 5l-2-2M5 20v-5h5"/><circle cx="12" cy="12" r="2.2"/>' },
  'neu-truoc': { chu: 'Nếu có đường phía trước', mau: 'ngoc', hinh: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 15V9M9.8 11.2L12 9l2.2 2.2"/>' },
  'neu-trai':  { chu: 'Nếu có đường bên trái',   mau: 'ngoc', hinh: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M15 12H9M11.2 9.8L9 12l2.2 2.2"/>' },
  'neu-phai':  { chu: 'Nếu có đường bên phải',   mau: 'ngoc', hinh: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M9 12h6M12.8 9.8L15 12l-2.2 2.2"/>' },
  'neu-sao':   { chu: 'Nếu đứng trên sao',       mau: 'ngoc', hinh: '<path d="M12 3l9 9-9 9-9-9z"/><circle cx="12" cy="12" r="2.4"/>' },
};
const hinhO = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${O[k].hinh}</svg>`;

/* ---------- trạng thái ---------- */
const KHOA = 'tdtd.code';                                               // chuỗi 100 ký tự 0/1: bài nào đã xong
let tam = null, cv = null, ctx = null, W = 360, H = 300, DPR = 1, raf = 0;
let bai = 0, ban = null, chinh = [], ham = [], dich = 'chinh';
let goc = Math.PI / 4, gocDen = Math.PI / 4;                             // góc xoay cảnh (nhìn nghiêng 45°)
let ve = null;                                                           // trạng thái vẽ: robot, sao đã thắp, bước đang chạy
let dangChay = null, nhanh = false;

const docXong = () => { try { return (localStorage.getItem(KHOA) || '').padEnd(BAI.length, '0').slice(0, BAI.length); } catch (e) { return '0'.repeat(BAI.length); } };
const ghiXong = (i) => { try { const s = docXong().split(''); s[i] = '1'; localStorage.setItem(KHOA, s.join('')); } catch (e) {} };
const moToi = () => { const s = docXong(), i = s.indexOf('0'); return i < 0 ? BAI.length - 1 : i; };   // bài xa nhất được mở
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- vẽ cảnh 3D nhìn nghiêng ---------- */
const NEN = 0.5, NAC = 0.42, DAY = -0.34;                                // độ cao mặt ô: NEN + h·NAC; đáy khối
const zMat = (h) => NEN + h * NAC;
let toa = { cx: 0, cy: 0, s: 40, tx: 0, ty: 0 };
function chieu(x, y, z) {
  const dx = x - toa.tx, dy = y - toa.ty, c = Math.cos(goc), s = Math.sin(goc);
  const X = dx * c - dy * s, Y = dx * s + dy * c;
  return { x: toa.cx + X * toa.s, y: toa.cy + Y * toa.s * 0.56 - z * toa.s * 0.86, d: Y };
}
function canhKhung() {
  if (!ban) return;
  toa.tx = (ban.rong - 1) / 2; toa.ty = (ban.sau - 1) / 2; toa.s = 1; toa.cx = 0; toa.cy = 0;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const c of ban.o) for (const [a, b] of [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]]) for (const z of [DAY, zMat(c.h) + .9]) {
    const p = chieu(c.x + a, c.y + b, z); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
  }
  const s = Math.min((W - 24) / (x1 - x0), (H - 30) / (y1 - y0), 86);
  toa.s = s; toa.cx = W / 2 - (x0 + x1) / 2 * s; toa.cy = H / 2 - (y0 + y1) / 2 * s + 6;
}
const tron = (a, b, t) => a + (b - a) * t;
function mau(h, sang) {                                                  // màu đá theo độ cao, sáng tối theo mặt
  const t = h / CAO_TOI_DA, r = tron(88, 142, t), g = tron(110, 162, t), b = tron(196, 238, t);
  return `rgb(${Math.round(r * sang)},${Math.round(g * sang)},${Math.round(b * sang)})`;
}
function da(p) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y); ctx.closePath(); }
function veKhoi(c, sangSao) {
  const r = .47, zt = zMat(c.h), c4 = [[-r, -r], [r, -r], [r, r], [-r, r]];
  const tren = c4.map(([a, b]) => chieu(c.x + a, c.y + b, zt)), duoi = c4.map(([a, b]) => chieu(c.x + a, c.y + b, DAY));
  const sn = Math.sin(goc), cs = Math.cos(goc);
  [[0, -1, 0, 1], [1, 0, 1, 2], [0, 1, 2, 3], [-1, 0, 3, 0]].forEach(([nx, ny, a, b]) => {
    const Yn = nx * sn + ny * cs;
    if (Yn <= .01) return;
    const anh = .52 + .3 * Math.max(0, -nx * .6 - ny * .8 + .4) + .12 * (nx * cs - ny * sn > 0 ? 1 : 0);   // ánh sáng từ phía tây bắc
    da([tren[a], tren[b], duoi[b], duoi[a]]);
    const g = ctx.createLinearGradient(0, tren[a].y, 0, duoi[a].y);
    g.addColorStop(0, mau(c.h, anh)); g.addColorStop(1, mau(c.h, anh * .62));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.stroke();
  });
  da(tren);
  const g = ctx.createLinearGradient(tren[0].x, tren[0].y, tren[2].x, tren[2].y);
  g.addColorStop(0, mau(c.h, 1.18)); g.addColorStop(1, mau(c.h, .95));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(220,230,255,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
  if (c.sao) {                                                           // ô đích: vòng tròn khắc trên mặt đá
    const vong = [];
    for (let k = 0; k < 20; k++) { const a = k / 20 * 6.2832; vong.push(chieu(c.x + Math.cos(a) * .3, c.y + Math.sin(a) * .3, zt + .002)); }
    da(vong); ctx.fillStyle = sangSao ? 'rgba(255,214,110,.42)' : 'rgba(20,28,60,.35)'; ctx.fill();
    ctx.strokeStyle = sangSao ? 'rgba(255,226,150,.9)' : 'rgba(190,205,255,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
  }
}
function saoNam(x, y, R, r) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r : R; ctx[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * q, y + Math.sin(a) * q); }
  ctx.closePath();
}
function veSao(c, sang, t, no) {
  const p = chieu(c.x, c.y, zMat(c.h) + .34 + Math.sin(t / 600 + c.x + c.y) * .04), R = toa.s * (sang ? .2 : .15) * (1 + no * .6);
  if (sang) {
    const hao = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 3.2);
    hao.addColorStop(0, 'rgba(255,220,120,.55)'); hao.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = hao; ctx.beginPath(); ctx.arc(p.x, p.y, R * 3.2, 0, 6.2832); ctx.fill();
    saoNam(p.x, p.y, R, R * .45);
    const g = ctx.createLinearGradient(p.x, p.y - R, p.x, p.y + R);
    g.addColorStop(0, '#fff6c8'); g.addColorStop(1, '#f2b640');
    ctx.fillStyle = g; ctx.fill();
  } else {
    saoNam(p.x, p.y, R, R * .45);
    ctx.fillStyle = 'rgba(150,165,215,.35)'; ctx.fill();
    ctx.strokeStyle = 'rgba(205,215,255,.6)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
}
/* robot: thân tròn bóng, đầu có kính, mắt nhìn theo hướng đi; quay lưng thì không thấy mắt */
function veRobot(r, t) {
  const p = chieu(r.x, r.y, r.z), s = toa.s, fx = Math.cos(r.hg), fy = Math.sin(r.hg);
  const tr = chieu(r.x + fx * .3, r.y + fy * .3, r.z), vx = (tr.x - p.x) / s, vy = (tr.y - p.y) / s;   // hướng nhìn trên màn
  const nhin = Math.max(-1, Math.min(1, fx * Math.sin(goc) + fy * Math.cos(goc)));                      // > 0: quay về phía người xem
  const nay = Math.abs(Math.sin(t / 260)) * s * .025 * (dangChay ? 1 : .4);
  ctx.fillStyle = 'rgba(0,0,10,.35)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, s * .26, s * .13, 0, 0, 6.2832); ctx.fill();
  const muiTen = [chieu(r.x + fx * .44, r.y + fy * .44, r.z), chieu(r.x + fx * .3 - fy * .1, r.y + fy * .3 + fx * .1, r.z), chieu(r.x + fx * .3 + fy * .1, r.y + fy * .3 - fx * .1, r.z)];
  da(muiTen); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill();
  const bx = p.x, by = p.y - s * .32 - nay;
  ctx.fillStyle = '#2b3150';
  ctx.beginPath(); ctx.ellipse(bx - s * .12, p.y - s * .05, s * .06, s * .04, 0, 0, 6.2832); ctx.ellipse(bx + s * .12, p.y - s * .05, s * .06, s * .04, 0, 0, 6.2832); ctx.fill();
  const than = ctx.createRadialGradient(bx - s * .08, by - s * .1, s * .02, bx, by, s * .3);
  than.addColorStop(0, '#ffffff'); than.addColorStop(.45, '#cfdcf5'); than.addColorStop(1, '#6f82b8');
  ctx.fillStyle = than; ctx.beginPath(); ctx.ellipse(bx, by, s * .24, s * .26, 0, 0, 6.2832); ctx.fill();
  const hx = bx, hy = by - s * .34;
  ctx.strokeStyle = '#9fb0dc'; ctx.lineWidth = Math.max(1.5, s * .025);
  ctx.beginPath(); ctx.moveTo(hx, hy - s * .14); ctx.lineTo(hx + vx * s * .06, hy - s * .3); ctx.stroke();
  const den = r.den || 0, dau = ctx.createRadialGradient(hx + vx * s * .06, hy - s * .31, 0, hx + vx * s * .06, hy - s * .31, s * (.06 + den * .14));
  dau.addColorStop(0, den ? '#fff2b0' : '#ffd36e'); dau.addColorStop(1, den ? 'rgba(255,210,100,0)' : 'rgba(255,180,80,.2)');
  ctx.fillStyle = dau; ctx.beginPath(); ctx.arc(hx + vx * s * .06, hy - s * .31, s * (.06 + den * .14), 0, 6.2832); ctx.fill();
  const dg = ctx.createRadialGradient(hx - s * .06, hy - s * .06, s * .02, hx, hy, s * .2);
  dg.addColorStop(0, '#ffffff'); dg.addColorStop(.5, '#dbe5fa'); dg.addColorStop(1, '#7d90c4');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(hx, hy, s * .2, s * .17, 0, 0, 6.2832); ctx.fill();
  if (nhin > -.35) {                                                     // mặt: kính tối, hai mắt sáng
    const kx = hx + vx * s * .32 * (1 - nhin * .3), ky = hy + vy * s * .2 + s * .01, kr = s * .14 * (.55 + .45 * Math.max(0, nhin));
    ctx.fillStyle = '#1b2240'; ctx.beginPath(); ctx.ellipse(kx, ky, kr, s * .09, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#7ff0ff';
    const cach = kr * .45;
    ctx.beginPath(); ctx.ellipse(kx - cach, ky, s * .028, s * .036, 0, 0, 6.2832); ctx.ellipse(kx + cach, ky, s * .028, s * .036, 0, 0, 6.2832); ctx.fill();
  }
}
function veNen() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d0b22'); g.addColorStop(1, '#1b1840');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(230,236,255,.55)';
  for (let k = 0; k < 60; k++) { const x = (k * 97.13) % W, y = (k * 53.71) % H, r = k % 7 ? .7 : 1.3; ctx.fillRect(x, y, r, r); }
}
function veCanh(t) {
  if (!ctx || !ban) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  veNen();
  canhKhung();
  const r = viTriRobot(t);
  const ds = ban.o.map(c => ({ c, d: chieu(c.x, c.y, 0).d }));
  ds.sort((a, b) => a.d - b.d || a.c.h - b.c.h);
  const oRobot = ban.o.reduce((m, c) => { const k = Math.abs(c.x - r.x) + Math.abs(c.y - r.y); return k < m.k ? { c, k } : m; }, { c: null, k: 9 }).c;
  const dRobot = Math.max(chieu(r.x, r.y, 0).d, oRobot ? chieu(oRobot.x, oRobot.y, 0).d : -9);
  let daVeRobot = false;
  for (const { c, d } of ds) {
    if (!daVeRobot && d > dRobot + .01) { veRobot(r, t); daVeRobot = true; }
    const k = c.x + ',' + c.y, sang = ve.sang.has(k);
    veKhoi(c, sang);
    if (c.sao) veSao(c, sang, t, ve.no && ve.no.k === k ? Math.max(0, 1 - (t - ve.no.t) / 500) : 0);
  }
  if (!daVeRobot) veRobot(r, t);
}

/* ---------- chuyển động ---------- */
function viTriRobot(t) {
  const b = ve.dang, p = b ? Math.min(1, (t - ve.tBuoc) / ve.lau) : 1, em = p * p * (3 - 2 * p);
  const goc_ = (hg) => Math.atan2(HUONG[hg][1], HUONG[hg][0]);
  if (!b) return { x: ve.x, y: ve.y, z: zMat(ve.h), hg: goc_(ve.huong), den: 0 };
  if (b.k === 'di' || b.k === 'nhay') {
    if (!b.ok) {                                                         // khựng: nhích tới rồi lùi lại
      const k = Math.sin(p * Math.PI) * .18;
      return { x: b.x0 + HUONG[b.huong][0] * k, y: b.y0 + HUONG[b.huong][1] * k, z: zMat(b.h0) + (b.k === 'nhay' ? Math.sin(p * Math.PI) * .25 : 0), hg: goc_(b.huong) };
    }
    const cung = b.k === 'nhay' ? Math.sin(p * Math.PI) * (.45 + Math.max(0, b.h1 - b.h0) * NAC) : 0;
    return { x: tron(b.x0, b.x1, em), y: tron(b.y0, b.y1, em), z: tron(zMat(b.h0), zMat(b.h1), em) + cung, hg: goc_(b.huong) };
  }
  if (b.k === 'trai' || b.k === 'phai') {
    let a0 = goc_(b.huong0), a1 = goc_(b.huong);
    if (a1 - a0 > Math.PI) a1 -= 6.2832; if (a0 - a1 > Math.PI) a1 += 6.2832;
    return { x: b.x0, y: b.y0, z: zMat(b.h0), hg: tron(a0, a1, em) };
  }
  return { x: b.x0, y: b.y0, z: zMat(b.h0) + Math.sin(p * Math.PI) * .08, hg: goc_(b.huong), den: Math.sin(p * Math.PI) };
}
function vong(t) {
  raf = 0;
  if (!tam || !tam.classList.contains('hien')) return;
  if (Math.abs(gocDen - goc) > .001) goc += (gocDen - goc) * .18; else goc = gocDen;
  if (dangChay && ve) buocTiep(t);
  veCanh(t);
  raf = requestAnimationFrame(vong);
}
function datLai() {                                                       // robot về chỗ xuất phát, sao tắt hết
  ban = banBai(bai);
  ve = { x: ban.robot.x, y: ban.robot.y, h: ban.o.find(c => c.x === ban.robot.x && c.y === ban.robot.y).h, huong: ban.robot.huong, sang: new Set(), dang: null, no: null, tBuoc: 0, lau: 400 };
}
function buocTiep(t) {
  const d = dangChay;
  if (ve.dang && t - ve.tBuoc < ve.lau) return;
  if (ve.dang) {                                                         // xong bước trước: chốt vị trí
    const b = ve.dang;
    if (b.k === 'di' || b.k === 'nhay') { ve.x = b.x1; ve.y = b.y1; ve.h = b.h1; }
    if (b.k === 'trai' || b.k === 'phai') ve.huong = b.huong;
    ve.dang = null;
  }
  if (d.i >= d.kq.buoc.length) { ketThuc(); return; }
  const b = d.kq.buoc[d.i++];
  ve.dang = b; ve.tBuoc = t; ve.lau = nhanh ? 170 : 400;
  if (b.k === 'thap' && b.ok) { ve.sang.add(b.sang); ve.no = { k: b.sang, t }; }
  sangO(b.id);
}

/* ---------- giao diện ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'laptrinh';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="lt-dau">
      <button class="lt-dsnut" type="button" aria-label="Danh sách bài">☰</button>
      <p class="lt-ten"></p>
      <button class="lt-hoi" type="button" aria-label="Bài này học gì">?</button>
    </div>
    <div class="lt-canh">
      <canvas class="lt-cv"></canvas>
      <p class="lt-muc"></p>
      <div class="lt-xoay"><button type="button" data-xoay="-1" aria-label="Xoay trái">⟲</button><button type="button" data-xoay="1" aria-label="Xoay phải">⟳</button></div>
      <p class="lt-bao" hidden></p>
    </div>
    <div class="lt-ma">
      <div class="lt-khung" data-chon="chinh"><p class="lt-nhan">Chương trình <span class="lt-dem"></span></p><div class="lt-o lt-o-chinh"></div></div>
      <div class="lt-khung lt-khung-ham" data-chon="ham" hidden><p class="lt-nhan">Hàm ★</p><div class="lt-o lt-o-ham"></div></div>
    </div>
    <div class="lt-bang"></div>
    <div class="lt-nut">
      <button class="lt-chay" type="button">▶ Chạy</button>
      <button class="lt-lai" type="button" aria-label="Robot về chỗ cũ">↺</button>
      <button class="lt-nhanh" type="button" aria-label="Chạy nhanh">»</button>
      <button class="lt-xoa" type="button">Xoá hết</button>
    </div>
    <div class="lt-tin" hidden><div class="lt-tin-trong"></div></div>
    <div class="lt-ds" hidden><div class="lt-ds-trong"></div></div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.lt-cv'); ctx = cv.getContext && cv.getContext('2d');
  tam.addEventListener('click', bam);
  addEventListener('resize', doCo);
  /* khung cảnh đổi cỡ (xoay máy, bàn phím…) thì tấm vẽ đổi theo, kẻo lòi ra ngoài */
  if (typeof ResizeObserver === 'function') new ResizeObserver(doCo).observe(tam.querySelector('.lt-canh'));
}

function doCo() {
  if (!tam || !cv) return;
  const k = tam.querySelector('.lt-canh').getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2); W = Math.max(200, k.width || 360); H = Math.max(160, k.height || 300);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
}

/* danh sách đang nhận ô mới: 'chinh', 'ham', hoặc thân của một ô chứa ('12.than', '12.thi', '12.khac') */
function timNut(id, ds = chinh.concat(ham)) {
  for (const n of ds) {
    if (n.id === id) return n;
    const c = (n.than && timNut(id, n.than)) || (n.thi && (timNut(id, n.thi) || timNut(id, n.khac)));
    if (c) return c;
  }
  return null;
}
function dsTheoTen(ten) {
  if (ten === 'chinh') return chinh;
  if (ten === 'ham') return ham;
  const [id, phan] = ten.split('.'), n = timNut(+id);
  return n ? n[phan] : null;
}
function xoaNut(id, ds) {
  for (let i = 0; i < ds.length; i++) {
    const n = ds[i];
    if (n.id === id) { ds.splice(i, 1); return true; }
    if ((n.than && xoaNut(id, n.than)) || (n.thi && (xoaNut(id, n.thi) || xoaNut(id, n.khac)))) return true;
  }
  return false;
}
const tongO = () => soO(chinh) + soO(ham);

function htmlDs(ds, ten) {
  return ds.map(n => {
    const k = n.k === 'neu' ? 'neu-' + n.dk : n.k, o = O[k];
    if (n.k === 'lap' || n.k === 'den' || n.k === 'neu') {
      const dau = n.k === 'lap'
        ? `<span class="lt-chip lt-${o.mau}" data-nut="${n.id}" data-maid="${n.id}">${hinhO(k)}<b>Lặp</b><i class="lt-solan" data-solan="${n.id}">${n.n}</i><b>lần</b></span>`
        : `<span class="lt-chip lt-${o.mau}" data-nut="${n.id}" data-maid="${n.id}">${hinhO(k)}<b>${o.chu}</b>${n.k === 'neu' ? '<b>thì</b>' : ''}</span>`;
      const than = (phan, nhan) => `${nhan ? `<span class="lt-nhanphu">${nhan}</span>` : ''}<div class="lt-than${dich === n.id + '.' + phan ? ' lt-dich' : ''}" data-chon="${n.id}.${phan}">${htmlDs(n[phan], n.id + '.' + phan)}<span class="lt-cho">+</span></div>`;
      return `<div class="lt-hop lt-hop-${o.mau}">${dau}${n.k === 'neu' ? than('thi') + than('khac', 'không thì') : than('than')}</div>`;
    }
    return `<span class="lt-chip lt-${o.mau}" data-nut="${n.id}" data-maid="${n.id}">${hinhO(k)}<b>${o.chu}</b></span>`;
  }).join('');
}
function veMa() {
  if (!tam) return;
  const b = BAI[bai];
  tam.querySelector('.lt-o-chinh').innerHTML = htmlDs(chinh, 'chinh') + `<span class="lt-cho">+</span>`;
  tam.querySelector('.lt-o-ham').innerHTML = htmlDs(ham, 'ham') + `<span class="lt-cho">+</span>`;
  tam.querySelector('.lt-khung-ham').hidden = !b.lenh.includes('ham');
  tam.querySelectorAll('[data-chon]').forEach(k => k.classList.toggle('lt-dich', k.dataset.chon === dich));
  const dem = tam.querySelector('.lt-dem'), n = tongO();
  dem.textContent = `${n}/${b.toiDa} ô`;
  dem.classList.toggle('lt-day', n >= b.toiDa);
  const cho = tam.querySelector('.lt-dich > .lt-cho, .lt-dich > .lt-o > .lt-cho');
  if (cho && cho.scrollIntoView) cho.scrollIntoView({ block: 'nearest' });
}
function veBang() {
  const b = BAI[bai];
  tam.querySelector('.lt-bang').innerHTML = b.lenh.map(k => `<button type="button" class="lt-chip lt-${O[k].mau}" data-them="${k}">${hinhO(k)}<b>${O[k].chu}</b></button>`).join('');
}
function sangO(id) {
  if (!tam) return;
  tam.querySelectorAll('.lt-chay-day').forEach(n => n.classList.remove('lt-chay-day'));
  const n = id && tam.querySelector(`[data-maid="${id}"]`);
  if (n && n.classList) n.classList.add('lt-chay-day');
}
function bao(chu, lau = 2600) {
  const p = tam.querySelector('.lt-bao');
  p.textContent = chu; p.hidden = false;
  clearTimeout(bao.t); bao.t = setTimeout(() => { p.hidden = true; }, lau);
}

function moBai(i, hoi) {
  dungChay();
  bai = Math.max(0, Math.min(BAI.length - 1, i));
  const b = BAI[bai], ch = CHUONG[b.chuong];
  chinh = b.san ? docMa(b.san).map(n => n) : []; ham = b.sanHam ? docMa(b.sanHam) : [];
  dich = 'chinh';
  datLai();
  goc = gocDen = Math.PI / 4;                                           // bài mới: về góc nhìn quen, khỏi lẫn trái phải
  clearTimeout(bao.t); tam.querySelector('.lt-bao').hidden = true;      // lời báo của bài trước không dính sang
  tam.querySelector('.lt-ten').innerHTML = `<b>Bài ${bai + 1}</b> · Chương ${b.chuong + 1}<span>${esc(b.ten)}</span>`;
  const soSao = ban.o.filter(c => c.sao).length;
  tam.querySelector('.lt-muc').textContent = b.san ? `Chương trình có lỗi — sửa để thắp ${soSao} ngôi sao` : `Thắp sáng ${soSao} ngôi sao`;
  veBang(); veMa(); doCo();
  if (hoi !== false && b.trongChuong === 0 && docXong()[bai] !== '1') moTin('chuong');
}

function moTin(loai, them) {
  const b = BAI[bai], ch = CHUONG[b.chuong], hop = tam.querySelector('.lt-tin');
  let html = '';
  if (loai === 'chuong') {
    html = `<p class="lt-tin-nho">Chương ${b.chuong + 1}</p><h2>${esc(ch.ten)}</h2>${ch.gioiThieu.map(p => `<p>${esc(p)}</p>`).join('')}
      <div class="lt-tin-o">${ch.lenhMoi.map(k => `<span class="lt-chip lt-${O[k].mau}">${hinhO(k)}<b>${O[k].chu}</b></span>`).join('')}</div>
      ${b.goiY ? `<p class="lt-tin-goiy">Bài này: ${esc(b.goiY)}</p>` : ''}
      <button type="button" class="lt-tin-dong">Bắt đầu</button>`;
  } else if (loai === 'thang') {
    const gon = them.so < soO(docMa(b.giai)) + soO(docMa(b.ham || ''));
    html = `<div class="lt-tin-sao">${'<span>★</span>'.repeat(3)}</div><h2>Thắp sáng hết rồi!</h2>
      <p>Em dùng ${them.so} ô lệnh.${gon ? ' Còn gọn hơn cả lời giải mẫu — giỏi quá!' : ''}</p>
      ${bai + 1 < BAI.length ? '<button type="button" class="lt-tin-tiep">Bài tiếp →</button>' : '<p>Em đã làm xong cả 100 bài. Robot cảm ơn em!</p>'}
      <button type="button" class="lt-tin-dong lt-phu">Xem lại bài này</button>`;
  }
  tam.querySelector('.lt-tin-trong').innerHTML = html;
  hop.hidden = false;
}

function moDs() {
  const xong = docXong(), toi = moToi();
  tam.querySelector('.lt-ds-trong').innerHTML = `<h2>Robot thắp sao</h2><p class="lt-ds-phu">100 bài lập trình. Làm xong bài này thì mở bài sau.</p>` +
    CHUONG.map((ch, ci) => {
      const cacBai = BAI.map((b, i) => [b, i]).filter(([b]) => b.chuong === ci);
      return `<h3>Chương ${ci + 1} · ${esc(ch.ten)}</h3><div class="lt-ds-luoi">${cacBai.map(([b, i]) =>
        `<button type="button" data-bai="${i}" class="${xong[i] === '1' ? 'lt-xong' : ''}${i === bai ? ' lt-dang' : ''}"${i > toi ? ' disabled' : ''}>${i + 1}</button>`).join('')}</div>`;
    }).join('') + `<button type="button" class="lt-ds-dong">Đóng</button>`;
  tam.querySelector('.lt-ds').hidden = false;
}

function themO(k) {
  if (dangChay) return;
  const b = BAI[bai];
  if (tongO() >= b.toiDa) { bao(`Bài này chỉ cho ${b.toiDa} ô lệnh. Thử dùng ít ô hơn${b.lenh.includes('lap') ? ' — vòng lặp giúp được đấy' : ''}.`); return; }
  const ds = dsTheoTen(dich) || chinh;
  let n;
  if (k === 'lap') n = nutMoi({ k: 'lap', n: 2, than: [] });
  else if (k === 'den') n = nutMoi({ k: 'den', than: [] });
  else if (k.startsWith('neu-')) n = nutMoi({ k: 'neu', dk: k.slice(4), thi: [], khac: [] });
  else n = nutMoi({ k });
  ds.push(n);
  if (n.than) dich = n.id + '.than'; else if (n.thi) dich = n.id + '.thi';   // ô chứa mới: ô tiếp theo vào bên trong
  veMa();
}

function bam(e) {
  const t = e.target && e.target.closest ? e.target : null;
  if (!t) return;
  const q = (sel) => t.closest(sel);
  if (q('.xn-dong')) { dong(); return; }
  let n;
  if ((n = q('[data-them]'))) { themO(n.dataset.them); return; }
  if ((n = q('[data-solan]'))) {                                         // bấm số lần: 2 → 3 → … → 9 → 2
    if (dangChay) return;
    const nut = timNut(+n.dataset.solan); if (nut) { nut.n = nut.n >= 9 ? 2 : nut.n + 1; veMa(); }
    return;
  }
  if ((n = q('[data-nut]'))) {                                           // bấm ô đã xếp: bỏ ô đó
    if (dangChay) return;
    const id = +n.dataset.nut;
    xoaNut(id, chinh) || xoaNut(id, ham);
    if (!dsTheoTen(dich)) dich = 'chinh';
    datLai(); veMa();
    return;
  }
  if ((n = q('[data-chon]'))) { if (!dangChay) { dich = n.dataset.chon; veMa(); } return; }
  if ((n = q('[data-xoay]'))) { gocDen += (+n.dataset.xoay) * Math.PI / 2; return; }
  if (q('.lt-chay')) { dangChay ? dungChay() : batDauChay(); return; }
  if (q('.lt-lai')) { dungChay(); datLai(); return; }
  if (q('.lt-nhanh')) { nhanh = !nhanh; tam.querySelector('.lt-nhanh').classList.toggle('lt-bat', nhanh); return; }
  if (q('.lt-xoa')) { if (dangChay) return; chinh = []; ham = []; dich = 'chinh'; datLai(); veMa(); return; }
  if (q('.lt-hoi')) { moTin('chuong'); return; }
  if (q('.lt-dsnut')) { moDs(); return; }
  if ((n = q('[data-bai]'))) { tam.querySelector('.lt-ds').hidden = true; moBai(+n.dataset.bai); return; }
  if (q('.lt-ds-dong')) { tam.querySelector('.lt-ds').hidden = true; return; }
  if (q('.lt-tin-tiep')) { tam.querySelector('.lt-tin').hidden = true; moBai(bai + 1); return; }
  if (q('.lt-tin-dong')) { tam.querySelector('.lt-tin').hidden = true; return; }
}

function batDauChay() {
  if (!chinh.length) { bao('Xếp vài ô lệnh vào Chương trình rồi bấm Chạy nhé.'); return; }
  datLai();
  const kq = chay(ban, chinh, ham);
  dangChay = { kq, i: 0 };
  tam.querySelector('.lt-chay').textContent = '■ Dừng';
  tam.classList.add('lt-dangchay');
}
function dungChay() {
  dangChay = null;
  if (!tam) return;
  tam.querySelector('.lt-chay').textContent = '▶ Chạy';
  tam.classList.remove('lt-dangchay');
  sangO(null);
}
function ketThuc() {
  const kq = dangChay.kq;
  dungChay();
  if (kq.thang) {
    ghiXong(bai);
    setTimeout(() => moTin('thang', { so: tongO() }), 450);
  } else if (kq.het) bao('Robot chạy mãi không dừng. Xem lại vòng lặp nhé.', 3600);
  else bao(`Chưa thắp hết — còn ${kq.conLai} ngôi sao. Xem robot đi lạc ở đâu rồi sửa nhé.`, 3600);
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  if (BAI.length) moBai(moToi());
  if (!raf) raf = requestAnimationFrame(vong);
}
function dong() {
  dungChay();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}
addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_LAPTRINH = { mo, dong, BAI, CHUONG, HUONG, docMa, soO, loaiO, dungBan, chay, itNhat, banBai, O,
  _moBai: (i) => moBai(i, false), _themO: themO, _ct: () => ({ chinh, ham, dich }), _ve: () => ve, _chayNgay: batDauChay };
})();

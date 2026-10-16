/* Buôn lậu phố cổ — trốn tìm có dấu vết trên bản đồ thật của phố cổ Hà Nội. Một người làm tay buôn đi bí mật qua phố,
   qua ngõ, giao 3 kiện hàng ở 3 mối rồi trốn ra bến; người kia làm hải quan, điều 3 lính ai cũng thấy, mỗi khắc lục
   soát một chỗ: trúng chỗ hắn đang đứng là bắt được, trúng chỗ hắn từng qua thì hiện dấu chân. Tay buôn có hai lá tin
   đồn để rải dấu chân giả. Hai hiệp đổi vai, ai được nhiều điểm hơn thì thắng. Bốn người thì hai tay buôn đấu hai hải
   quan. Điện thoại giữ bí mật vị trí — thứ mà bản giấy làm rất cực.

   Tìm hiểu trước khi làm:
   - Khuôn luật là kiểu "trốn có dấu vết" của Letters from Whitechapel (Gabriele Mari, Gianluca Santopierto): kẻ trốn đi
     từng ô, cảnh sát đứng ở ngã tư, đi tối đa 2 bước, mỗi người hoặc tìm dấu (hắn từng qua thì phải nói) hoặc bắt (đoán
     đúng chỗ hắn đứng); kẻ trốn không được đi xuyên qua cảnh sát, hết đường là thua; có lối tắt qua ngõ (alley) và đi
     xe ngựa. Cách "làm nhiệm vụ rồi thoát" giống Specter Ops (Plaid Hat): làm xong 3 mục tiêu rồi ra lối thoát trong số
     lượt có hạn, làm mục tiêu nào thì lộ chỗ đó.
   - Bản đồ là 51 ngã phố thật ở nửa đông phố cổ, lấy từ OpenStreetMap (© những người đóng góp OpenStreetMap, giấy
     phép ODbL): từ trục Hàng Đào – Hàng Ngang – Hàng Đường – Đồng Xuân ra tới đê Trần Nhật Duật, từ Cầu Đông xuống Cầu
     Gỗ, Hàng Thùng. Ngã sát nhau dưới 18 m thì gộp; phố nối hai ngã theo đúng đường thật; bảy ngõ thật (Ngõ Gạch, Ngõ
     Phất Lộc, Ngõ Trung Yên, Ngõ Cầu Gỗ, Ngõ Đào Duy Từ, Ngõ Đồng Xuân, Ngõ Nguyễn Hữu Huân) là lối riêng của tay buôn.
     Ô Quan Chưởng (Đông Hà Môn, xây năm 1749) là cửa ô duy nhất còn lại, đầu phố Hàng Chiếu, thông ra bến sông; bến
     Chương Dương là đầu mối buôn bán lớn bên sông Hồng (nhà nghiên cứu Nguyễn Ngọc Tiến). Bản đồ xoay 20° cho bờ sông
     gần thẳng đứng, vừa màn hình dọc.
   - Cân hai phe bằng máy đấu máy hàng nghìn ván (README kể từng bước): bản đầu tiên hải quan bắt được gần hết; mối Hàng Đào
     sát cửa vào nên kiện đầu giao ngay khắc 1–2 — dời mối, đặt bảy cửa vào ngoài rìa; tin giao hàng lộ ngay thì khắc
     sau là ván bài một ăn ba — cho tin lộ chậm một khắc; dấu giả buộc gần chỗ thật thì chính nó tố chỗ thật — cho rải
     ở đâu cũng được; hải quan dồn hết vào chỗ đáng ngờ nhất thì tay buôn khôn né được — máy hải quan bốc chỗ soát theo
     tỉ lệ. Đo lại bằng bộ sinh số chuẩn (bản trước rơi vào vòng lặp 10466 số) thì lộ máy Khó yếu hơn Vừa — sửa lại ba mức. */
(function () {
'use strict';

/* ======================================================================================================
   LÕI
   ====================================================================================================== */
function LOI() {
'use strict';
/* ---------- BẢN ĐỒ: 51 ngã phố ở nửa đông phố cổ (OpenStreetMap), toạ độ mét từ góc tây bắc; 7 cửa vào ngoài rìa ---------- */
const DINH = [
  ['dx', 535, 326, 'Đồng Xuân – Cầu Đông'], ['cd', 593, 301, 'Cầu Đông – ngõ Đồng Xuân'], ['ct', 684, 247, 'Cầu Đông – Nguyễn Thiện Thuật'],
  ['hc', 621, 390, 'Hàng Chiếu – ngõ Đồng Xuân'], ['hg1', 700, 377, 'Hàng Chiếu', 'moi'], ['th', 694, 318, 'Nguyễn Thiện Thuật – Thanh Hà'],
  ['oqc', 842, 352, 'Ô Quan Chưởng'], ['b1', 922, 331, 'Bến Ô Quan Chưởng', 'ben'], ['dx2', 567, 400, 'Hàng Chiếu – Hàng Đường'],
  ['ng', 586, 456, 'Hàng Đường – ngõ Gạch'], ['ns', 710, 460, 'Hàng Giấy – Nguyễn Siêu'], ['cg', 890, 417, 'Chợ Gạo', 'moi'],
  ['b2', 964, 408, 'Bến Chợ Gạo', 'ben'], ['mm1', 922, 492, 'Hàng Buồm – Mã Mây'], ['hb', 810, 510, 'Hàng Buồm', 'moi'],
  ['hg2', 722, 539, 'Hàng Buồm – Hàng Giấy'], ['lo', 626, 572, 'Hàng Đường – Lãn Ông'], ['mm2', 975, 551, 'Mã Mây', 'moi'],
  ['hch', 1061, 536, 'Hàng Chĩnh – Trần Nhật Duật'], ['th1', 832, 581, 'Tạ Hiện – ngõ Đào Duy Từ'], ['ddt', 932, 566, 'Đào Duy Từ – ngõ Đào Duy Từ'],
  ['hg3', 758, 628, 'Hàng Giấy – Lương Ngọc Quyến'], ['th2', 846, 655, 'Tạ Hiện – Lương Ngọc Quyến'], ['ddt2', 946, 625, 'Đào Duy Từ – Lương Ngọc Quyến'],
  ['mm3', 981, 624, 'Mã Mây – Lương Ngọc Quyến'], ['pl1', 1047, 624, 'Lương Ngọc Quyến – ngõ Phất Lộc'], ['nhh1', 1090, 625, 'Nguyễn Hữu Huân – Hàng Muối'],
  ['b3', 1109, 574, 'Bến Hàng Muối', 'ben'], ['pl', 1048, 683, 'Ngõ Phất Lộc'], ['nhh2', 1079, 682, 'Nguyễn Hữu Huân – ngõ Phất Lộc'],
  ['nhh3', 1082, 741, 'Nguyễn Hữu Huân – Hàng Mắm'], ['hbe1', 1021, 742, 'Hàng Bạc – Hàng Bè'], ['mm4', 976, 738, 'Hàng Bạc', 'moi'],
  ['hbac', 836, 727, 'Hàng Bạc – Tạ Hiện'], ['hd1', 694, 710, 'Hàng Bạc – Hàng Đào'], ['hm', 1119, 738, 'Hàng Mắm', 'moi'],
  ['hmb', 1177, 731, 'Hàng Mắm – Trần Nhật Duật'], ['dl1', 829, 774, 'Đinh Liệt – ngõ Trung Yên'], ['dl2', 820, 821, 'Đinh Liệt – Gia Ngư'],
  ['hd2', 745, 829, 'Hàng Đào – Gia Ngư'], ['gn', 937, 825, 'Gia Ngư – ngõ Cầu Gỗ'], ['hbe2', 1019, 826, 'Hàng Bè', 'moi'],
  ['nhh4', 1087, 825, 'Nguyễn Hữu Huân – ngõ Nguyễn Hữu Huân'], ['ht1', 1158, 811, 'Hàng Tre – ngõ Nguyễn Hữu Huân'], ['hgai', 762, 907, 'Hàng Gai – Cầu Gỗ'],
  ['cg1', 822, 910, 'Cầu Gỗ – Đinh Liệt'], ['cg2', 940, 916, 'Cầu Gỗ – ngõ Cầu Gỗ'], ['cg3', 1022, 919, 'Cầu Gỗ – Hàng Bè'],
  ['hth1', 1094, 919, 'Hàng Thùng – Nguyễn Hữu Huân'], ['hth2', 1196, 880, 'Hàng Thùng – Hàng Tre'], ['b5', 1238, 866, 'Bến Chương Dương', 'ben'],
  /* cửa vào: ngoài rìa bản đồ; khắc 0 tay buôn đứng đó, khắc 1 bước vào phố; không ai vào lại được */
  ['vdx', 545, 252, 'Chợ Đồng Xuân', 'vao'], ['vlo', 552, 585, 'Hàng Cân', 'vao'], ['vhd', 618, 724, 'Hàng Bồ', 'vao'], ['vhg', 690, 922, 'Hàng Gai', 'vao'],
  ['vct', 690, 175, 'Hàng Khoai', 'vao'], ['vng', 512, 462, 'Hàng Cá', 'vao'], ['vho', 946, 985, 'Hồ Gươm', 'vao'],
];
/* [ngã, ngã, tên phố, loại]: loại 1 là ngõ (chỉ tay buôn đi được), 2 là lối từ cửa vào */
const CANH = [
  ['dx', 'dx2', 'Đồng Xuân'], ['dx', 'cd', 'Cầu Đông'], ['cd', 'hc', 'Ngõ Đồng Xuân', 1], ['cd', 'ct', 'Cầu Đông'], ['ct', 'th', 'Nguyễn Thiện Thuật'],
  ['hc', 'hg1', 'Hàng Chiếu'], ['hc', 'dx2', 'Hàng Chiếu'], ['hg1', 'th', 'Nguyễn Thiện Thuật'], ['hg1', 'oqc', 'Hàng Chiếu'], ['hg1', 'ns', 'Hàng Giấy'],
  ['th', 'oqc', 'Thanh Hà'], ['oqc', 'cg', 'Đào Duy Từ'], ['oqc', 'b1', 'Ô Quan Chưởng'], ['b1', 'b2', 'Trần Nhật Duật'], ['dx2', 'ng', 'Hàng Đường'],
  ['ng', 'lo', 'Hàng Đường'], ['ng', 'ns', 'Ngõ Gạch', 1], ['ns', 'cg', 'Nguyễn Siêu'], ['ns', 'hg2', 'Hàng Giấy'], ['cg', 'b2', 'Chợ Gạo'],
  ['cg', 'mm1', 'Đào Duy Từ'], ['b2', 'hch', 'Trần Nhật Duật'], ['b2', 'mm1', 'Đông Thái'], ['mm1', 'hb', 'Hàng Buồm'], ['mm1', 'ddt', 'Đào Duy Từ'],
  ['mm1', 'mm2', 'Mã Mây'], ['hb', 'hg2', 'Hàng Buồm'], ['hb', 'th1', 'Tạ Hiện'], ['hg2', 'lo', 'Hàng Buồm'], ['hg2', 'hg3', 'Hàng Giấy'],
  ['lo', 'hd1', 'Hàng Ngang'], ['mm2', 'mm3', 'Mã Mây'], ['mm2', 'hch', 'Hàng Chĩnh'], ['hch', 'b3', 'Trần Nhật Duật'], ['th1', 'ddt', 'Ngõ Đào Duy Từ', 1],
  ['th1', 'th2', 'Tạ Hiện'], ['ddt', 'ddt2', 'Đào Duy Từ'], ['hg3', 'th2', 'Lương Ngọc Quyến'], ['th2', 'ddt2', 'Lương Ngọc Quyến'], ['th2', 'hbac', 'Tạ Hiện'],
  ['ddt2', 'mm3', 'Lương Ngọc Quyến'], ['mm3', 'mm4', 'Mã Mây'], ['mm3', 'pl1', 'Lương Ngọc Quyến'], ['pl1', 'nhh1', 'Lương Ngọc Quyến'], ['pl1', 'pl', 'Ngõ Phất Lộc', 1],
  ['nhh1', 'nhh2', 'Nguyễn Hữu Huân'], ['nhh1', 'b3', 'Hàng Muối'], ['nhh1', 'hm', 'Hàng Muối'], ['b3', 'hmb', 'Trần Nhật Duật'], ['pl', 'nhh2', 'Ngõ Phất Lộc', 1],
  ['pl', 'hbe1', 'Ngõ Phất Lộc', 1], ['nhh2', 'nhh3', 'Nguyễn Hữu Huân'], ['nhh3', 'hm', 'Hàng Mắm'], ['nhh3', 'hbe1', 'Hàng Mắm'], ['nhh3', 'nhh4', 'Nguyễn Hữu Huân'],
  ['hbe1', 'mm4', 'Hàng Bạc'], ['hbe1', 'hbe2', 'Hàng Bè'], ['mm4', 'hbac', 'Hàng Bạc'], ['hbac', 'dl1', 'Đinh Liệt'], ['hbac', 'hd1', 'Hàng Bạc'],
  ['hd1', 'hd2', 'Hàng Đào'], ['hm', 'hmb', 'Hàng Mắm'], ['hm', 'ht1', 'Hàng Tre'], ['hmb', 'b5', 'Trần Quang Khải'], ['dl1', 'dl2', 'Đinh Liệt'],
  ['dl1', 'gn', 'Ngõ Trung Yên', 1], ['dl2', 'hd2', 'Gia Ngư'], ['dl2', 'gn', 'Gia Ngư'], ['dl2', 'cg1', 'Đinh Liệt'], ['hd2', 'hgai', 'Hàng Đào'],
  ['gn', 'cg2', 'Ngõ Cầu Gỗ', 1], ['gn', 'hbe2', 'Gia Ngư'], ['hbe2', 'cg3', 'Hàng Bè'], ['nhh4', 'ht1', 'Ngõ Nguyễn Hữu Huân', 1], ['nhh4', 'hth1', 'Nguyễn Hữu Huân'],
  ['ht1', 'hth2', 'Hàng Tre'], ['hgai', 'cg1', 'Cầu Gỗ'], ['cg1', 'cg2', 'Cầu Gỗ'], ['cg2', 'cg3', 'Cầu Gỗ'], ['cg3', 'hth1', 'Hàng Thùng'],
  ['hth1', 'hth2', 'Hàng Thùng'], ['hth2', 'b5', 'Hàng Thùng'],
  ['vdx', 'dx', 'Đồng Xuân', 2], ['vlo', 'lo', 'Lãn Ông', 2], ['vhd', 'hd1', 'Hàng Bồ', 2], ['vhg', 'hgai', 'Hàng Gai', 2],
  ['vct', 'ct', 'Nguyễn Thiện Thuật', 2], ['vng', 'ng', 'Hàng Cá', 2], ['vho', 'cg2', 'Hồ Hoàn Kiếm', 2],
];
const N = DINH.length, SO = {};
DINH.forEach((d, i) => { SO[d[0]] = i; });
const KHOA = DINH.map(d => d[0]), TEN = DINH.map(d => d[3]), LOAI = DINH.map(d => d[4] || ''), X = DINH.map(d => d[1]), Y = DINH.map(d => d[2]);
const MOI = [], BEN = [], VAO = [];
LOAI.forEach((l, i) => { if (l === 'moi') MOI.push(i); else if (l === 'ben') BEN.push(i); else if (l === 'vao') VAO.push(i); });
const KE = Array.from({ length: N }, () => []), KP = Array.from({ length: N }, () => []);
const NGO = new Set(), LOI_VAO = new Array(N).fill(-1);
for (const [a, b, , loai] of CANH) {
  const i = SO[a], j = SO[b];
  if (loai === 2) { LOI_VAO[i] = j; continue; }
  KE[i].push(j); KE[j].push(i);
  if (loai === 1) NGO.add(i * N + j).add(j * N + i); else { KP[i].push(j); KP[j].push(i); }
}
const laNgo = (a, b) => NGO.has(a * N + b);
const keDi = (o) => (LOI_VAO[o] >= 0 ? [LOI_VAO[o]] : KE[o]);
const bfs = (ke) => {
  const d = new Int8Array(N * N).fill(99);
  for (let s = 0; s < N; s++) {
    d[s * N + s] = 0;
    const h = [s];
    for (let q = 0; q < h.length; q++) { const u = h[q]; for (const v of ke[u]) if (d[s * N + v] === 99) { d[s * N + v] = d[s * N + u] + 1; h.push(v); } }
  }
  return d;
};
const DH = bfs(KE), DP = bfs(KP);
/* lính đi phố, tối đa BUOC bước; lục soát chỗ mình đứng hay sát bên (kể cả qua ngõ) */
const BUOC = 2, TOI = [], SOAT = [], SOAT3 = [];
for (let o = 0; o < N; o++) {
  TOI[o] = []; if (LOAI[o] !== 'vao') for (let v = 0; v < N; v++) if (DP[o * N + v] <= BUOC) TOI[o].push(v);
  SOAT[o] = LOAI[o] === 'vao' ? [] : [o, ...KE[o]];
}
for (let o = 0; o < N; o++) { const s = new Set(); for (const w of TOI[o]) for (const v of SOAT[w]) s.add(v); SOAT3[o] = [...s]; }

/* ---------- CẤU HÌNH ----------
   1v1: một tay buôn (3 kiện, 2 tin đồn) đấu một hải quan (3 lính, mỗi khắc soát 1 chỗ).
   2v2: hai tay buôn cùng phe (mỗi người 2 kiện, 1 tin đồn) đấu hai hải quan (mỗi người 2 lính, mỗi người soát 1 chỗ). */
const CHE = {
  '1v1': { soTB: 1, soHQ: 1, can: 3, R: 2, T: 18, tre: 1, khamTu: 1, linh: ['oqc', 'mm3', 'hth1'], chu: [0, 0, 0] },
  '2v2': { soTB: 2, soHQ: 2, can: 2, R: 1, T: 18, tre: 1, khamTu: 1, luanSoat: true, linh: ['oqc', 'mm3', 'th2', 'hth1'], chu: [0, 0, 1, 1] },
};
function cauHinh(kieu = '1v1', them) {
  const ch = Object.assign({ kieu }, CHE[kieu] || CHE['1v1'], them || {});
  const so = (k) => (typeof k === 'number' ? k : SO[k]);
  ch.linh = ch.linh.map(so); ch.moi = (ch.moi || MOI).map(so); ch.ben = (ch.ben || BEN).map(so); ch.vao = (ch.vao || VAO).map(so);
  if (!ch.chu || ch.chu.length !== ch.linh.length) ch.chu = ch.linh.map(() => 0);
  return ch;
}

/* ---------- PHẦN AI CŨNG BIẾT ----------
   Mỗi khắc: các tay buôn lần lượt đi (bí mật), rồi từng hải quan dời lính của mình và lục soát một chỗ; hết khắc thì
   tin giao hàng của khắc đó lộ ra. Sau khắc T thì trời sáng, hết hiệp. */
function congMoi(ch) {
  const c = { ch, khac: 1, buoc: 0, linh: ch.linh.slice(), linhLuc: [null, ch.linh.slice()], soat: [], giao: [], xong: false,
    tb: Array.from({ length: ch.soTB }, () => ({ thoat: -1, bat: -1, vay: false, giao: 0 })) };
  chinhLuot(c);
  return c;
}
const conChoi = (cong, i) => cong.tb[i].thoat < 0 && cong.tb[i].bat < 0;
/* hải quan j có được lục soát ở khắc này không: luanSoat thì cả phe một lần mỗi khắc, hai người thay phiên */
const duocSoat = (cong, j) => cong.khac >= (cong.ch.khamTu || 1) && (!cong.ch.luanSoat || (cong.khac - 1) % cong.ch.soHQ === j);
/* thứ tự trong một khắc: tb 0..soTB−1 rồi hq 0..soHQ−1; bỏ qua tay buôn đã xong */
function luotCua(cong, b) {
  const ch = cong.ch;
  return b < ch.soTB ? { ai: 'tb', i: b } : b < ch.soTB + ch.soHQ ? { ai: 'hq', i: b - ch.soTB } : null;
}
function chinhLuot(cong) {
  const ch = cong.ch;
  for (;;) {
    if (cong.xong) { cong.luot = null; return; }
    if (cong.tb.every((_, i) => !conChoi(cong, i))) { cong.xong = true; cong.luot = null; return; }
    const l = luotCua(cong, cong.buoc);
    if (!l) { cong.luot = { ai: 'het' }; return; }                    // chờ báo tin cuối khắc
    if (l.ai === 'tb' && !conChoi(cong, l.i)) { cong.buoc++; continue; }
    cong.luot = l; return;
  }
}
/* nước của tay buôn (phần công khai): thoat — bến nếu vừa lên thuyền; vay — không còn đường đi, bị bắt */
function apTB(cong, r) {
  if (!cong.luot || cong.luot.ai !== 'tb' || cong.luot.i !== r.i) return false;
  const t = cong.tb[r.i];
  if (r.vay) { t.bat = cong.khac; t.vay = true; }
  else if (r.thoat >= 0) {
    if (!cong.ch.ben.includes(r.thoat) || cong.linh.includes(r.thoat)) return false;
    t.thoat = cong.khac; t.ben = r.thoat;
  }
  cong.buoc++; chinhLuot(cong);
  return true;
}
/* nước của hải quan j: lính mới (chỉ lính của j đổi chỗ) và chỗ lục soát; kq[i]: kết quả theo từng tay buôn */
function nuocHQHopLe(cong, j, n) {
  const ch = cong.ch;
  if (!n || !Array.isArray(n.linh) || n.linh.length !== cong.linh.length || new Set(n.linh).size !== n.linh.length) return false;
  for (let o = 0; o < n.linh.length; o++) {
    const v = n.linh[o];
    if (!(v >= 0 && v < N) || LOAI[v] === 'vao') return false;
    if (ch.chu[o] !== j) { if (v !== cong.linh[o]) return false; continue; }
    if (DP[cong.linh[o] * N + v] > BUOC) return false;
  }
  if (!duocSoat(cong, j)) return n.soat === -1;                          // khắc này người kia soát (hay chưa tới khắc được soát)
  return n.linh.some((o, k) => ch.chu[k] === j && SOAT[o].includes(n.soat));
}
function apHQ(cong, r) {
  if (!cong.luot || cong.luot.ai !== 'hq' || cong.luot.i !== r.j || !nuocHQHopLe(cong, r.j, r)) return false;
  cong.linh = r.linh.slice();
  if (r.soat < 0) { cong.buoc++; chinhLuot(cong); return true; }
  const kq = cong.tb.map((_, i) => (conChoi(cong, i) ? (r.kq && r.kq[i]) || { loai: 'trong' } : null));
  cong.soat.push({ k: cong.khac, j: r.j, z: r.soat, kq });
  kq.forEach((x, i) => { if (x && x.loai === 'bat') cong.tb[i].bat = cong.khac; });
  cong.buoc++; chinhLuot(cong);
  return true;
}
/* hết khắc: giao[i] — mối tay buôn i vừa giao trong khắc này (−1: không) */
function hetKhac(cong, giao) {
  if (!cong.luot || cong.luot.ai !== 'het') return false;
  const ch = cong.ch, t = cong.khac;
  (giao || []).forEach((m, i) => { if (m >= 0 && ch.moi.includes(m)) { cong.giao.push({ i, m, k: t - (ch.tre || 0) }); cong.tb[i].giao++; } });
  cong.khac = t + 1; cong.buoc = 0;
  cong.linhLuc[t + 1] = cong.linh.slice();
  if (t >= ch.T) cong.xong = true;
  chinhLuot(cong);
  return true;
}
/* điểm của tay buôn i: kiện thật đã giao (kin, lộ hết lúc hết hiệp) cộng 1 nếu thoát. Tin giao hàng lộ chậm một khắc,
   nên kiện giao ngay trước lúc bị bắt hay lên thuyền chưa kịp lộ mà vẫn tính; chưa có bí mật thì đếm theo tin đã lộ */
const diemTB = (cong, i, kin) => (kin ? kin.giao.length : cong.tb[i].giao) + (cong.tb[i].thoat >= 0 ? 1 : 0);
const soatLuc = (cong, k) => cong.soat.filter(r => r.k === k).map(r => r.z);

/* ---------- PHẦN BÍ MẬT CỦA TAY BUÔN ---------- */
function kinMoi(ch, i, vao) {
  const k = { i, o: vao, duong: [vao], dau: new Int16Array(N).fill(-1), gia: new Uint8Array(N), giaDung: [], tinDon: ch.R, giao: [], giaoKhac: -1, ke: null };
  return k;
}
const daGiao = (kin, m) => kin.giao.some(g => g.m === m);
/* dấu giả rải đầu khắc t, mang số khắc t−1, ở ngã nào cũng được, trừ chỗ mình đứng khắc t−1, chỗ dưới chân lính và chỗ
   hải quan vừa soát ở khắc t−1 (soát rồi mà không thấy thì dấu mới mọc ra là lộ). Không giới hạn xa gần: dấu giả bắt
   buộc gần chỗ thật thì chính nó tố chỗ thật (thật hay giả thì hắn cũng ở quanh đó) — đo thử, tin đồn khi ấy không giúp
   gì. Muốn lừa được thì phải rải chỗ họ còn tin là hắn có thể từng đứng. */
function giaHopLe(cong, kin, z) {
  const t = cong.khac, cu = kin.duong[t - 1];
  return kin.tinDon > 0 && t > 1 && z >= 0 && z < N && LOAI[z] !== 'vao' && z !== cu && cu !== undefined &&
    !cong.linh.includes(z) && !soatLuc(cong, t - 1).includes(z);
}
const biVay = (cong, kin) => !keDi(kin.o).some(v => !cong.linh.includes(v));
function nuocTBHopLe(cong, kin, n) {
  const ch = cong.ch;
  if (!cong.luot || cong.luot.ai !== 'tb' || cong.luot.i !== kin.i || !n) return false;
  if (!keDi(kin.o).includes(n.toi) || cong.linh.includes(n.toi)) return false;
  if (n.gia >= 0 && !giaHopLe(cong, kin, n.gia)) return false;
  if (n.giao && (!ch.moi.includes(n.toi) || daGiao(kin, n.toi) || kin.giao.length >= ch.can)) return false;
  if (n.thoat && !ch.ben.includes(n.toi)) return false;
  return true;
}
/* tay buôn đi: cập nhật bí mật, trả phần công khai để apTB */
function kinDi(cong, kin, n) {
  const t = cong.khac;
  if (n.gia >= 0) { kin.dau[n.gia] = t - 1; kin.gia[n.gia] = 1; kin.tinDon--; kin.giaDung.push({ o: n.gia, k: t - 1 }); }
  kin.o = n.toi; kin.duong[t] = n.toi; kin.dau[n.toi] = t; kin.gia[n.toi] = 0;
  kin.giaoKhac = -1;
  if (n.giao) { kin.giao.push({ m: n.toi, k: t }); kin.giaoKhac = n.toi; }
  return { i: kin.i, thoat: n.thoat ? n.toi : -1 };
}
/* trả lời một lần lục soát ở z */
function traLoi(kin, z) {
  if (kin.o === z) return { loai: 'bat' };
  if (kin.dau[z] >= 0) return { loai: 'dau', dau: kin.dau[z] };
  return { loai: 'trong' };
}
/* mối vừa giao trong khắc này (để báo tin cuối khắc) */
const giaoTrongKhac = (cong, kin) => { const k = cong.khac - (cong.ch.tre || 0), g = kin.giao.find(x => x.k === k); return g ? g.m : -1; };

/* ---------- ĐOÁN VỊ TRÍ (chỉ từ phần ai cũng biết) ----------
   Mỗi giả thuyết: vài dấu chân đã lộ được coi là giả (không quá R dấu, mỗi khắc tối đa một). Với mỗi giả thuyết, đếm
   các đường đi hợp mọi ràng buộc theo từng khắc: khắc 0 ở một cửa vào, mỗi khắc đi một bước (qua phố hay ngõ), không bước
   vào chỗ có lính, khắc giao hàng thì ở đúng mối, chỗ soát trống thì chưa từng qua tới khắc đó, dấu thật khắc d thì khắc d
   ở đúng chỗ ấy và sau đó không quay lại trước lần soát, dấu giả khắc d thì (rải ở đâu cũng được) khắc d không đứng đó và
   không qua chỗ ấy từ khắc d tới lần soát. Cộng các giả thuyết theo trọng số: số đường × HE_GIA^số dấu giả. Đếm xuôi rồi ngược để
   có phân bố ở từng khắc. Trả P (khắc s), Q (đã qua trong vài khắc gần — tìm dấu thì có ích), so (số chỗ có thể). */
const HE_GIA = 0.15;
function niemTin(cong, i, s, heGia) {
  const ch = cong.ch;
  if (s === undefined) s = cong.khac;
  const soat = [], dau = [];
  /* một dấu (chỗ z, khắc d) có thể bị soát trúng nhiều lần: gộp lại, giữ lần soát sau cùng */
  for (const r of cong.soat) {
    if (r.k > s || !r.kq[i]) continue;
    soat.push(r);
    const x = r.kq[i];
    if (x.loai !== 'dau') continue;
    const cu = dau.find(u => u.z === r.z && u.d === x.dau);
    if (cu) cu.k = Math.max(cu.k, r.k); else dau.push({ z: r.z, d: x.dau, k: r.k });
  }
  const giao = cong.giao.filter(g => g.i === i && g.k <= s);
  const hopGia = (u) => {
    const { z, d } = u;
    if (d >= u.k || d < 1) return false;
    for (const q of soat) {
      if (q.z !== z) continue;
      if (q.k === d) return false;                                     // chỗ vừa soát ở khắc d thì không rải được
      if (q.k > d) { const x = q.kq[i]; if (x.loai === 'trong' || (x.loai === 'dau' && x.dau < d)) return false; }
    }
    const L1 = cong.linhLuc[d + 1];
    return !(L1 && L1.includes(z));
  };
  const ung = dau.map(hopGia), gt = [];
  const de = (bd, ds, dung) => {
    gt.push(ds.slice());
    if (ds.length >= ch.R) return;
    for (let j = bd; j < dau.length; j++) {
      if (!ung[j]) continue;
      const d = dau[j].d;
      if (dung.has(d)) continue;
      dung.add(d); ds.push(j); de(j + 1, ds, dung); ds.pop(); dung.delete(d);
    }
  };
  de(0, [], new Set());
  const P = new Float64Array(N), Q = new Float64Array(N), cho = new Uint8Array((s + 1) * N), lan = [];
  for (let t = 0; t <= s; t++) lan.push(new Float64Array(N));
  let tong = 0;
  for (const ds of gt) {
    const gia = new Set(ds.map(j => dau[j]));
    cho.fill(1);
    for (let v = 0; v < N; v++) if (!ch.vao.includes(v)) cho[v] = 0;
    for (let t = 1; t <= s; t++) { for (const v of ch.vao) cho[t * N + v] = 0; const L = cong.linhLuc[t] || cong.linh; for (const o of L) cho[t * N + o] = 0; }
    for (const g of giao) for (let v = 0; v < N; v++) if (v !== g.m) cho[g.k * N + v] = 0;
    let hong = false;
    for (const r of soat) {
      const x = r.kq[i], z = r.z;
      cho[r.k * N + z] = 0;                                  // không bị bắt ở đó lúc soát
      if (x.loai === 'trong') for (let t = 0; t <= r.k; t++) cho[t * N + z] = 0;
    }
    for (const u of dau) {
      const { z, d, k } = u;
      if (!gia.has(u)) {
        if (d >= k) { hong = true; break; }
        for (let v = 0; v < N; v++) if (v !== z) cho[d * N + v] = 0;
        for (let t = d + 1; t <= k; t++) cho[t * N + z] = 0;
      } else for (let t = d; t <= k; t++) cho[t * N + z] = 0;          // dấu giả: từ khắc d tới lần soát hắn không qua đó
    }
    if (hong) continue;
    const a = [];
    let a0 = new Float64Array(N), log = 0, s0 = 0;
    for (let v = 0; v < N; v++) if (cho[v]) { a0[v] = 1; s0++; }
    if (!s0) continue;
    for (let v = 0; v < N; v++) a0[v] /= s0;
    log += Math.log(s0);
    a.push(a0);
    let chet = false;
    for (let t = 1; t <= s; t++) {
      const b = new Float64Array(N), tr = a[t - 1]; let sum = 0;
      for (let v = 0; v < N; v++) {
        if (!cho[t * N + v]) continue;
        let x = 0; for (const u of KE[v]) x += tr[u];
        if (t === 1) for (const u of ch.vao) if (LOI_VAO[u] === v) x += tr[u];
        b[v] = x; sum += x;
      }
      if (sum <= 0) { chet = true; break; }
      for (let v = 0; v < N; v++) b[v] /= sum;
      log += Math.log(sum);
      a.push(b);
    }
    if (chet) continue;
    const w = Math.exp(log) * Math.pow(heGia !== undefined ? heGia : ch.heGia !== undefined ? ch.heGia : HE_GIA, ds.length);
    let be = new Float64Array(N).fill(1);
    for (let t = s; t >= 0; t--) {
      let sum = 0; const m = new Float64Array(N);
      for (let v = 0; v < N; v++) { m[v] = a[t][v] * be[v]; sum += m[v]; }
      if (sum > 0) for (let v = 0; v < N; v++) lan[t][v] += w * m[v] / sum;
      if (t > 0) {
        const nb = new Float64Array(N); let s2 = 0;
        for (let u = 0; u < N; u++) {
          if (!cho[(t - 1) * N + u]) continue;
          let x = 0; for (const v of keDi(u)) if (cho[t * N + v]) x += be[v];
          nb[u] = x; s2 += x;
        }
        if (s2 > 0) for (let u = 0; u < N; u++) nb[u] /= s2;
        be = nb;
      }
    }
    tong += w;
  }
  if (tong > 0) for (let t = 0; t <= s; t++) for (let v = 0; v < N; v++) lan[t][v] /= tong;
  for (let v = 0; v < N; v++) P[v] = lan[s][v];
  for (let t = Math.max(0, s - 4); t < s; t++) { const he = 1 - (s - t) * 0.18; for (let v = 0; v < N; v++) Q[v] += lan[t][v] * he; }
  let so = 0; for (let v = 0; v < N; v++) if (P[v] > 1e-9) so++;
  return { P, Q, so, lan, coThe: tong > 0 };
}

/* ---------- MÁY HẢI QUAN ----------
   Thử mọi cách dời lính của mình (mỗi lính tối đa 2 bước phố), chấm: chỗ soát tốt nhất trong tầm (khả năng bắt được + khả
   năng thấy dấu mới), khối niềm tin bị kẹt không còn đường, khắc sau với tới đâu, đứng gần khối niềm tin, giữ các mối hắn
   có thể sắp tới. Chỗ soát bốc theo tỉ lệ độ đáng ngờ, không dồn hẳn vào chỗ đáng ngờ nhất (đo ra dồn hẳn thì tay buôn
   khôn né được). Dễ: chấm có nhiễu, một nửa số lần soát bừa; Vừa: một phần ba số lần soát bừa; Khó: không soát bừa. */
/* trọng số theo mức. G: soát để thấy dấu (chứ không chỉ để bắt) — đo ra chỉ làm yếu đi, nên mức nào cũng 0; A: nghĩ tới khắc
   sau (với tới đâu, đứng gần khối niềm tin); GD: giữ các mối hắn sắp tới; NHIEU: nhiễu khi chấm cách dời lính; mu: bốc chỗ
   soát theo độ đáng ngờ mũ mu (0: bốc đều trong các chỗ còn khả nghi); bua: phần soát bừa, bốc đều mọi chỗ trong tầm */
const MUC_HQ = [
  { G: 0, A: 0.4, GD: 0, NHIEU: 0.7, mu: 0, bua: 0.5 },
  { G: 0, A: 0.5, GD: 0.2, NHIEU: 0.3, mu: 1, bua: 0.35 },
  { G: 0, A: 0.5, GD: 0.2, NHIEU: 0.3, mu: 1, bua: 0 },
];
function mayHQ(cong, j, muc, rnd = Math.random) {
  const ch = cong.ch;
  const c = new Float64Array(N), q = new Float64Array(N);
  const W = Object.assign({}, MUC_HQ[muc], ch.hqThu && ch.hqThu[muc] ? ch.hqThu[muc] : {});
  cong.tb.forEach((_, i) => {
    if (!conChoi(cong, i)) return;
    const x = niemTin(cong, i, undefined, W.hg);
    for (let v = 0; v < N; v++) { c[v] += x.P[v]; q[v] += x.Q[v]; }
  });
  const daSoat = new Set(soatLuc(cong, cong.khac));          // đồng đội vừa soát khắc này
  const minh = [], lua = [];
  ch.chu.forEach((u, o) => { if (u === j) { minh.push(o); lua.push(TOI[cong.linh[o]]); } });
  const khac = new Set(cong.linh.filter((_, o) => ch.chu[o] !== j));
  const { G, A, GD, NHIEU } = W;
  const conMoi = ch.moi.filter(m => !cong.giao.some(g => g.m === m)), wm = new Float64Array(N);
  { let sw = 0; for (const m of conMoi) { let w = 0; for (let v = 0; v < N; v++) if (c[v] > 0) w += c[v] * Math.exp(-DH[v * N + m] / 1.5); wm[m] = w; sw += w; }
    if (sw > 0) for (const m of conMoi) wm[m] /= sw; }
  const soat = duocSoat(cong, j);
  const giaTri = (z) => (!soat ? 0 : daSoat.has(z) ? -1 : c[z] + G * q[z]);
  let tot = null, totDiem = -1e9;
  const ds = [];
  const thu = () => {
    const dat = new Set(ds); for (const o of khac) dat.add(o);
    let bs = -1, bz = ds[0];
    for (const o of ds) for (const z of SOAT[o]) { const g = giaTri(z); if (g > bs) { bs = g; bz = z; } }
    let ket = 0, gan = 0, maxNext = 0;
    const b1 = new Float64Array(N);
    for (let u = 0; u < N; u++) {
      if (c[u] <= 0) continue;
      let k = 0; for (const v of KE[u]) if (!dat.has(v)) k++;
      if (!k) { ket += c[u]; continue; }
      for (const v of KE[u]) if (!dat.has(v)) b1[v] += c[u] / k;
    }
    for (let v = 0; v < N; v++) {
      if (b1[v] <= 0) continue;
      let dm = 99; for (const o of dat) dm = Math.min(dm, DP[o * N + v]);
      gan += b1[v] * Math.exp(-dm / 2);
    }
    for (const o of ds) for (const z of SOAT3[o]) if (b1[z] > maxNext) maxNext = b1[z];
    let giu = 0;
    for (const m of conMoi) for (const o of dat) if (DP[o * N + m] <= 2) { giu += wm[m]; break; }
    return { d: bs + 0.9 * ket + A * (0.6 * maxNext + 0.5 * gan) + GD * giu, z: bz };
  };
  const lap = (k) => {
    if (k === lua.length) {
      const r = thu();
      const d = r.d + (NHIEU ? (rnd() - 0.5) * NHIEU * (r.d + 0.05) : rnd() * 1e-6);
      if (d > totDiem) { totDiem = d; tot = { ds: ds.slice(), z: r.z }; }
      return;
    }
    for (const v of lua[k]) { if (ds.includes(v) || khac.has(v)) continue; ds.push(v); lap(k + 1); ds.pop(); }
  };
  lap(0);
  if (!tot) tot = { ds: minh.map(o => cong.linh[o]), z: cong.linh[minh[0]] };
  const linh = cong.linh.slice(); minh.forEach((o, k) => { linh[o] = tot.ds[k]; });
  if (!soat) return { j, linh, soat: -1 };
  const ung = [];
  for (const o of tot.ds) for (const z of SOAT[o]) if (!ung.some(u => u.z === z)) ung.push({ z, g: giaTri(z) });
  ung.sort((a, b) => b.g - a.g);
  /* bốc chỗ soát theo tỉ lệ độ đáng ngờ (soát dồn hẳn vào một chỗ thì tay buôn khôn né được); Dễ thì bốc đều trong mấy
     chỗ còn khả nghi */
  if (W.bua && rnd() < W.bua) return { j, linh, soat: ung[Math.floor(rnd() * ung.length)].z };
  const coNghi = ung.some(u => u.g > 1e-6), mu = ch.muHQ !== undefined ? ch.muHQ : W.mu;
  let tw = 0; for (const u of ung) { u.w = coNghi && u.g <= 1e-6 ? 0 : Math.pow(Math.max(0, u.g) + 1e-6, mu); tw += u.w; }
  let r = rnd() * tw, z = ung[0].z;
  for (const u of ung) { r -= u.w; if (r <= 0) { z = u.z; break; } }
  return { j, linh, soat: z };
}

/* ---------- MÁY TAY BUÔN ---------- */
const dmLinh = (cong, v) => { let d = 99; for (const o of cong.linh) d = Math.min(d, DP[o * N + v]); return d; };
const conMoiCua = (ch, kin) => ch.moi.filter(m => !daGiao(kin, m));
/* số bước ít nhất để giao nốt `can` kiện (mỗi mối một lần) rồi ra bến */
function conPhai(ch, kin, v, can) {
  const moi = conMoiCua(ch, kin);
  let tot = 99;
  const ben = (u) => { let b = 99; for (const x of ch.ben) b = Math.min(b, DH[u * N + x]); return b; };
  const lap = (u, con, da, dai) => {
    if (dai >= tot) return;
    if (!con) { tot = Math.min(tot, dai + ben(u)); return; }
    for (const m of moi) if (!da.includes(m)) { da.push(m); lap(m, con - 1, da, dai + DH[u * N + m]); da.pop(); }
  };
  lap(v, Math.max(0, can), [], 0);
  return tot;
}
/* kế hoạch: thứ tự các mối sẽ giao rồi ra bến nào — bốc ngẫu nhiên trong các đường ngắn, mối càng gần lính càng ít được chọn */
function lapKe(cong, kin, muc, rnd, phat, tauDat) {
  const ch = cong.ch, can = ch.can - kin.giao.length, moi = conMoiCua(ch, kin), ds = [];
  const lap = (u, con, da, dai, gia) => {
    if (!con) {
      let b = -1, bd = 99;
      for (const x of ch.ben) { const d = DH[u * N + x] + phat[x] * 0.5; if (d < bd) { bd = d; b = x; } }
      ds.push({ ke: da.concat([b]), dai: dai + DH[u * N + b], gia }); return;
    }
    for (const m of moi) if (!da.includes(m)) { da.push(m); lap(m, con - 1, da, dai + DH[u * N + m], gia + phat[m]); da.pop(); }
  };
  const goc = LOI_VAO[kin.o] >= 0 ? LOI_VAO[kin.o] : kin.o;
  lap(goc, Math.max(0, can), [], LOI_VAO[kin.o] >= 0 ? 1 : 0, 0);
  if (!ds.length) return [];
  const con = ch.T - cong.khac + 1;
  for (const d of ds) d.diem = d.dai + 0.8 * d.gia + (d.dai > con ? 3 * (d.dai - con) : 0);
  ds.sort((x, y) => x.diem - y.diem);
  const tau = tauDat || [3, 1.6, 1.1][muc], top = ds.slice(0, 12);
  let tw = 0; for (const d of top) { d.w = Math.exp(-(d.diem - top[0].diem) / tau); tw += d.w; }
  let r = rnd() * tw; for (const d of top) { r -= d.w; if (r <= 0) return d.ke; }
  return top[0].ke;
}
/* một nước: chấm từng chỗ đi được — họ có hay soát đó không (theo cái họ tin), đứng gần lính, tiến tới đích theo kế hoạch,
   còn kịp giờ không; tới mối thì giao nếu đủ an toàn; tới bến thì lên thuyền khi đã giao đủ hay không kịp giao thêm. Họ đã
   khoanh vùng hẹp thì tung tin đồn: rải dấu giả (mang khắc vừa rồi) đúng chỗ họ sắp soát mà vẫn tin là hắn từng đứng. */
/* trọng số của máy tay buôn theo mức (rui: sợ bị soát trúng khắc này; tin: sợ chỗ họ đang ngờ mà gần lính; gan: sợ đứng
   gần lính; nh: nhiễu; tau: độ tuỳ hứng khi lập kế hoạch; ng: chấp nhận độ nguy khi giao hàng; ph: ngại mối gần lính;
   tin đồn dùng khi họ còn ngờ ≤ so1 chỗ (khắc trước) hay ≤ so2 chỗ (khắc này)) */
const MUC_TB = [
  { rui: 0, tin: 0, gan: 0.5, nh: 1.5, tau: 3, ng: 1, ph: 0.3, so1: 0, so2: 0 },
  { rui: 4, tin: 0.6, gan: 0.3, nh: 1, tau: 2.2, ng: 0.5, ph: 0.7, so1: 3, so2: 4 },
  { rui: 9, tin: 3, gan: 0.4, nh: 0.3, tau: 0.6, ng: 0.45, ph: 0.9, so1: 6, so2: 9 },
];
function mayTB(cong, kin, muc, rnd = Math.random) {
  const ch = cong.ch, i = kin.i, t = cong.khac, con = ch.T - t, W = Object.assign({ q: 0.25 }, MUC_TB[muc], muc === 2 && ch.tbThu ? ch.tbThu : {}, ch.tbMuc && ch.tbMuc[muc] ? ch.tbMuc[muc] : {});
  const tin = niemTin(cong, i, t), P = tin.P, Q = tin.Q;
  const tam = new Set(); if (t >= (ch.khamTu || 1) && W.rui > 0) for (const o of cong.linh) for (const z of SOAT3[o]) tam.add(z);
  /* họ bốc chỗ soát theo độ đáng ngờ, trong tầm với */
  const sig = new Float64Array(N); let tw = 0;
  const muTB = ch.muTB !== undefined ? ch.muTB : 1;
  for (const z of tam) { sig[z] = Math.pow(P[z] + W.q * Q[z] + 1e-4, muTB); tw += sig[z]; }
  const soLan = ch.luanSoat ? 1 : ch.soHQ;
  if (tw > 0) for (let z = 0; z < N; z++) sig[z] = Math.min(1, sig[z] / tw * soLan);
  const can = ch.can - kin.giao.length;
  const ung = keDi(kin.o).filter(v => !cong.linh.includes(v));
  if (!ung.length) return null;
  const phat = new Float64Array(N);
  for (const m of ch.moi) phat[m] = Math.max(0, 5 - dmLinh(cong, m)) * W.ph;
  for (const x of ch.ben) phat[x] = Math.max(0, 4 - dmLinh(cong, x)) * W.ph;
  if (!kin.ke || !kin.ke.length || (kin.ke.length > 1 && daGiao(kin, kin.ke[0])) || kin.ke.length !== can + 1 ||
      phat[kin.ke[0]] > 2.5 || rnd() < 0.08) kin.ke = lapKe(cong, kin, Math.min(2, muc), rnd, phat, W.tau);
  const dich = kin.ke[0];
  const nguyGiao = (v) => {
    const F = KE[v].filter(u => !cong.linh.includes(u));
    if (!F.length) return 1;
    let toi = 0; for (const u of F) if (dmLinh(cong, u) <= 5) toi++;
    return (toi / F.length) / F.length + 0.2 / F.length;
  };
  let tot = null, totD = -1e9;
  for (const v of ung) {
    let giao = false, thoat = false, d = 0;
    d -= W.rui * sig[v];
    const dm = dmLinh(cong, v);
    d -= W.tin * P[v] * Math.exp(-dm / 2) + W.gan * Math.exp(-dm / 1.2);
    let canSau = can;
    if (ch.moi.includes(v) && can > 0 && !daGiao(kin, v)) {
      const ng = nguyGiao(v), gap = con < conPhai(ch, kin, v, can - 1) + 2;
      if ((v === dich || ng < 0.25) && (ng < W.ng || gap)) { giao = true; canSau = can - 1; d += 2.5 - 3 * ng; }
    }
    const sau = giao && v === dich ? (kin.ke[1] !== undefined ? kin.ke[1] : dich) : dich;
    if (sau >= 0) d -= 0.55 * DH[v * N + sau];
    const kin2 = giao ? { giao: kin.giao.concat([{ m: v }]) } : kin;
    const du = con - conPhai(ch, kin2, v, canSau);
    if (du < 0) d -= 2 + 0.5 * -du; else if (du < 2) d -= 0.5 * (2 - du);
    if (ch.ben.includes(v) && (canSau === 0 || con - conPhai(ch, kin2, v, 1) < 0)) { thoat = true; d += 6; }
    d += (rnd() - 0.5) * W.nh;
    if (d > totD) { totD = d; tot = { toi: v, gia: -1, giao, thoat }; }
  }
  if (tot.giao && kin.ke[0] === tot.toi) kin.ke = kin.ke.slice(1);
  if (kin.tinDon > 0 && !tot.thoat && (W.so1 || W.so2) && t > 1) {
    const truoc = niemTin(cong, i, t - 1);
    if (truoc.so <= W.so1 || tin.so <= W.so2) {
      let gz = -1, gd = 0.02;
      for (let z = 0; z < N; z++) {
        if (!giaHopLe(cong, kin, z) || truoc.P[z] <= 1e-6) continue;
        const g = Math.pow(Math.min(DH[tot.toi * N + z], 6), 2) * Math.sqrt(truoc.P[z]) * (dmLinh(cong, z) <= 4 ? 1 : 0.3);
        if (g > gd) { gd = g; gz = z; }
      }
      if (gz >= 0) tot.gia = gz;
    }
  }
  return tot;
}
/* chọn cửa vào: bốc đều trong các cửa mà khắc đầu lính chưa với tới (ngã đầu cửa cách mọi lính từ 3 bước phố) — người
   chơi thật vào đủ cửa, máy vào một cửa quen thì hải quan đoán ra */
function chonVao(ch, rnd = Math.random, tranh = []) {
  const con = ch.vao.filter(v => !tranh.includes(v));
  const xa = con.filter(v => { const u = LOI_VAO[v]; return ch.linh.every(o => DP[o * N + u] >= 3); });
  const ds = xa.length ? xa : con;
  return ds.length ? ds[Math.floor(rnd() * ds.length) % ds.length] : ch.vao[0];
}

/* ---------- CHẠY MỘT HIỆP TRÊN MỘT MÁY (đấu với máy, bài kiểm, mô phỏng) ---------- */
function hiepMoi(ch, vao) {
  const cong = congMoi(ch);
  const kin = vao.map((v, i) => kinMoi(ch, i, v));
  return { cong, kin };
}
/* đi giùm tới khi tới lượt một người thật (nguoi(luot) trả true) hay hết hiệp; may(luot) trả mức máy */
function chayMay(h, laNguoi, mucCua, rnd = Math.random) {
  const { cong, kin } = h;
  for (let k = 0; k < 500 && !cong.xong; k++) {
    const l = cong.luot;
    if (!l) break;
    if (l.ai === 'het') { hetKhac(cong, kin.map(x => giaoTrongKhac(cong, x))); continue; }
    if (laNguoi(l)) return l;
    if (l.ai === 'tb') {
      const kn = kin[l.i];
      if (biVay(cong, kn)) { apTB(cong, { i: l.i, vay: true }); continue; }
      const n = mayTB(cong, kn, mucCua(l), rnd);
      apTB(cong, kinDi(cong, kn, n));
    } else {
      const n = mayHQ(cong, l.i, mucCua(l), rnd);
      if (n.soat >= 0) n.kq = kin.map(x => traLoi(x, n.soat));
      apHQ(cong, n);
    }
  }
  return null;
}

return {
  DINH, CANH, N, SO, KHOA, TEN, LOAI, X, Y, MOI, BEN, VAO, KE, KP, LOI_VAO, DH, DP, BUOC, TOI, SOAT, SOAT3, CHE,
  laNgo, keDi, cauHinh, congMoi, conChoi, duocSoat, chinhLuot, apTB, nuocHQHopLe, apHQ, hetKhac, diemTB, soatLuc,
  MUC_TB, kinMoi, daGiao, giaHopLe, biVay, nuocTBHopLe, kinDi, traLoi, giaoTrongKhac, niemTin, mayHQ, mayTB, conPhai, lapKe, chonVao,
  hiepMoi, chayMay,
};
}

const L = LOI();
const { N, KHOA, TEN, LOAI, KE, KP, LOI_VAO, DP, SOAT, TOI } = L;

/* ======================================================================================================
   MÁY NGHĨ Ở LUỒNG RIÊNG: dựng Web Worker từ chính mã lõi (LOI viết tự chứa), không tải tệp nào thêm, chạy được khi
   mất mạng. Không tạo được Worker thì nghĩ ngay trên luồng chính.
   ====================================================================================================== */
let tho = null, viec = 0;
const choViec = new Map();
function taoTho() {
  if (tho || typeof Worker !== 'function' || typeof Blob !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  try {
    const ma = `const LOI=${LOI.toString()};const L=LOI();onmessage=e=>{const d=e.data;let r=null;try{r=d.loai==='tb'?L.mayTB(d.cong,d.kin,d.muc):L.mayHQ(d.cong,d.j,d.muc);}catch(x){}postMessage({so:d.so,r,ke:d.kin?d.kin.ke:null});};`;
    tho = new Worker(URL.createObjectURL(new Blob([ma], { type: 'text/javascript' })));
    tho.onmessage = (e) => { const f = choViec.get(e.data.so); choViec.delete(e.data.so); if (f) f(e.data); };
    tho.onerror = () => { tho = null; };
  } catch (e) { tho = null; }
}
function boViec() {
  viec++;
  if (choViec.size && tho) { tho.terminate(); tho = null; choViec.clear(); taoTho(); }
}
/* máy nghĩ: loai 'tb' (kin là bí mật của tay buôn máy) hay 'hq' (j là hải quan); xong(r) sau ít nhất `cho` ms */
let NHANH = 1;                                   // bài kiểm đặt 0: máy đi ngay, không chờ cho người xem
function mayNghi(loai, x, xong, cho = 520) {
  cho *= NHANH;
  const so = ++viec, batDau = Date.now();
  const tra = (d) => setTimeout(() => {
    if (so !== viec) return;
    if (loai === 'tb' && d.ke && x.kin) x.kin.ke = d.ke;
    xong(d.r);
  }, Math.max(0, cho - (Date.now() - batDau)));
  const goi = { so, loai, cong: x.cong, kin: x.kin, j: x.j, muc: x.muc };
  if (tho) { choViec.set(so, tra); try { tho.postMessage(goi); return; } catch (e) { choViec.delete(so); } }
  setTimeout(() => {
    let r = null;
    try { r = loai === 'tb' ? L.mayTB(x.cong, x.kin, x.muc) : L.mayHQ(x.cong, x.j, x.muc); } catch (e) {}
    tra({ r, ke: x.kin ? x.kin.ke : null });
  }, 30);
}

/* ======================================================================================================
   BỐ CỤC BẢN ĐỒ: toạ độ thật xoay 20° (bờ sông gần thẳng đứng), co về khung rộng 1000, rồi giãn các ngã sát nhau cho
   cách nhau ít nhất 93 đơn vị (chừng 33 px trên màn hình rộng 375 px) — đủ để chạm. Sinh một lần bằng đoạn mã trong
   README (mục Buôn lậu phố cổ), giữ nguyên thứ tự DINH của lõi.
   ====================================================================================================== */
const BX = [132, 247, 437, 240, 383, 410, 642, 792, 141, 139, 349, 684, 816, 692, 489, 320, 135, 752, 903, 482, 657, 326, 460, 636, 725, 816, 904, 961, 771, 860, 799, 709, 624, 402, 165, 889, 982, 357, 308, 178, 510, 650, 767, 897, 159, 260, 458, 597, 720, 912, 1007, 196, 0, 26, 26, 492, 8, 426];
const BY = [162, 155, 120, 325, 352, 247, 398, 412, 309, 417, 501, 539, 570, 688, 649, 644, 640, 822, 850, 784, 821, 818, 920, 926, 955, 989, 1023, 945, 1088, 1117, 1211, 1180, 1140, 1030, 919, 1236, 1257, 1113, 1194, 1155, 1268, 1320, 1361, 1381, 1299, 1341, 1425, 1482, 1526, 1523, 1526, 41, 616, 896, 1280, 0, 381, 1547];
const VB = { x: -70, y: -80, w: 1210, h: 1730 };
const SO = L.SO;
const BEN_THUYEN = { b1: [70, -10], b2: [70, 20], b3: [70, 0], b5: [10, 70] };      // thuyền đậu cạnh bến, lệch ra sông

/* ======================================================================================================
   GIAO DIỆN
   ====================================================================================================== */
const KHOA_LUU = 'tdtd.buonlau';
const docLuu = () => { try { return JSON.parse(localStorage.getItem(KHOA_LUU)) || {}; } catch (e) { return {}; } };
const ghiLuu = (o) => { try { const c = docLuu(); for (const k of Object.keys(o)) { if (o[k] === undefined) delete c[k]; else c[k] = o[k]; } localStorage.setItem(KHOA_LUU, JSON.stringify(c)); } catch (e) {} };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KHO = ['Dễ', 'Vừa', 'Khó'];
const TEN_MAY_TB = ['Bà Tám', 'Cô Ba', 'Chú Tư'];          // máy làm tay buôn (ghế máy thứ 1, 2…)
const TEN_MAY_HQ = ['Đội Hai', 'Đội Năm', 'Đội Bảy'];      // máy làm hải quan
const MAU_TB = ['#f2b84b', '#f08a5a'], MAU_HQ = ['#5aa7f0', '#5fd0c0'];
const CANH_TEN = { 0: 'trống canh một', 4: 'canh hai', 8: 'canh ba', 12: 'canh tư', 16: 'canh năm' };

let tam = null, banEl = null, dongEl = null, raf = 0;
let van = null;              // trận đang chơi (hai hiệp)
let ui = null;               // việc đang làm trên bản đồ
let hoat = null;             // hình động lính đi
let coTieng = true, am = null;

/* ---------- trận, hiệp ---------- */
/* ghế: 1v1 hai ghế (0, 1); 2v2 bốn ghế: 0, 1 một phe, 2, 3 phe kia. Hiệp 0 phe của ghế 0 làm tay buôn (hay ngược lại nếu
   chọn làm hải quan trước), hiệp 1 đổi vai. Trong một hiệp: tay buôn i là ghế thứ i của phe buôn, hải quan j là ghế thứ j
   của phe kia. */
const pheCua = (P) => (van.kieu === '2v2' ? (P < 2 ? 0 : 1) : P);
const ghePhe = (phe) => (van.kieu === '2v2' ? [phe * 2, phe * 2 + 1] : [phe]);
const pheBuon = (hiep) => (hiep === 0 ? van.buonTruoc : 1 - van.buonTruoc);
const gheTB = (i) => ghePhe(pheBuon(van.hiep))[i];
const gheHQ = (j) => ghePhe(1 - pheBuon(van.hiep))[j];
const gheLuot = (l) => (!l || l.ai === 'het' ? -1 : l.ai === 'tb' ? gheTB(l.i) : gheHQ(l.i));
const laMinh = (P) => !!van && van.ghe[P] && van.ghe[P].minh;
const laMay = (P) => !!van && van.ghe[P] && van.ghe[P].may;
const minhLaTB = () => !!van && van.h && [0, 1].slice(0, van.h.cong.ch.soTB).some(i => laMinh(gheTB(i)));
const tbCuaMinh = () => (van && van.h ? [0, 1].slice(0, van.h.cong.ch.soTB).filter(i => laMinh(gheTB(i))) : []);
const hqCuaMinh = () => (van && van.h ? [0, 1].slice(0, van.h.cong.ch.soHQ).filter(j => laMinh(gheHQ(j))) : []);
function tenGhe(P) {
  const g = van.ghe[P];
  if (!g) return '';
  if (g.minh) return 'Bạn';
  return g.ten;
}
const tenTB = (i) => tenGhe(gheTB(i));
const tenHQ = (j) => tenGhe(gheHQ(j));
const tenPhe = (phe) => (van.kieu === '2v2' ? ghePhe(phe).map(tenGhe).join(' & ') : tenGhe(phe));

function vanMoi(ch) {
  boViec(); dungHoat();
  const kieu = ch.kieu === '2v2' ? '2v2' : '1v1';
  van = { cheDo: ch.cheDo || 'may', kieu, muc: [0, 1, 2].includes(ch.muc) ? ch.muc : 1, buonTruoc: ch.buonTruoc === 1 ? 1 : 0,
    hiep: 0, diem: [0, 0], khacXong: [0, 0], ketHiep: [], ghe: ch.ghe, h: null, nhat: [], xong: false };
  if (van.cheDo === 'may' && !van.ghe) {
    /* đấu với máy: bạn ghế 0, máy ghế 1; tên máy theo vai hiệp đầu */
    van.ghe = [{ minh: true, ten: 'Bạn' }, { may: true, muc: van.muc, ten: van.buonTruoc === 0 ? TEN_MAY_HQ[0] : TEN_MAY_TB[0] }];
  }
  tatTin();
  batDauHiep();
}
function batDauHiep() {
  boViec(); dungHoat();
  const ch = L.cauHinh(van.kieu);
  van.h = { cong: L.congMoi(ch), kin: [], vao: [] };
  van.nhat = [];
  ui = { che: '', chon: -1, gia: -1, giao: true, thoat: true, linhChon: -1, linhMoi: null, soat: -1, xem: -1, soatVua: null, lo: false };
  if (van.cheDo === 'may') {
    /* máy đặt tên theo vai trong hiệp này */
    for (let P = 0; P < van.ghe.length; P++) if (van.ghe[P].may) {
      const tb = ghePhe(pheBuon(van.hiep)).indexOf(P);
      van.ghe[P].ten = tb >= 0 ? TEN_MAY_TB[tb] : TEN_MAY_HQ[ghePhe(1 - pheBuon(van.hiep)).indexOf(P)];
    }
  }
  /* máy tay buôn chọn cửa vào ngay; người thì chọn trên bản đồ */
  for (let i = 0; i < ch.soTB; i++) {
    const P = gheTB(i);
    if (laMay(P)) { const v = L.chonVao(ch, Math.random, van.h.vao); van.h.vao[i] = v; van.h.kin[i] = L.kinMoi(ch, i, v); }
  }
  them(`Hiệp ${van.hiep + 1}: ${tenPhe(pheBuon(van.hiep))} làm tay buôn, ${tenPhe(1 - pheBuon(van.hiep))} làm hải quan.`);
  capNhatChu(); veDong();
  tiep();
}
/* cửa vào của tay buôn i (người chọn) */
function chonCua(i, v) {
  const ch = van.h.cong.ch;
  if (!ch.vao.includes(v) || van.h.vao.includes(v)) return false;
  if (van.cheDo === 'phong') {
    phong.bm[`${van.hiep}-${i}`] = { kin: L.kinMoi(ch, i, v), muoi: muoiMoi() };
    luuBiMat(); ui.che = ''; tiengBuoc(); chayPhong();
    return true;
  }
  van.h.vao[i] = v; van.h.kin[i] = L.kinMoi(ch, i, v);
  them(`Bạn lẻn tới cửa ${TEN[v]}.`, 'minh');
  ui.che = ''; tiep();
  return true;
}
const canChonCua = () => tbCuaMinh().find(i => !van.h.kin[i]);

/* chạy lượt tiếp theo: máy thì nghĩ rồi đi, người thì chờ chạm */
function tiep() {
  if (!van || !van.h || van.xong) return;
  const { cong, kin } = van.h;
  if (hoat) return;
  if (canChonCua() !== undefined) { ui.che = 'cua'; capNhatChu(); veDong(); return; }
  if (cong.xong || !cong.luot) { hetHiep(); return; }
  const l = cong.luot;
  if (l.ai === 'het') { hetKhacNay(); return; }
  const P = gheLuot(l);
  if (l.ai === 'tb') {
    const kn = kin[l.i];
    if (L.biVay(cong, kn)) {
      L.apTB(cong, { i: l.i, vay: true });
      them(`${laMinh(P) ? 'Bạn' : tenTB(l.i)} không còn đường đi — lính chặn hết lối, bị vây bắt ở ${TEN[kn.o]}!`, 'bat');
      tiengBat();
      tiep(); return;
    }
    if (laMinh(P)) { batLuotTB(l.i); return; }
    ui.che = 'cho'; capNhatChu(); veDong();
    mayNghi('tb', { cong, kin: kn, muc: van.ghe[P].muc }, (n) => {
      if (!van || van.h.cong !== cong) return;
      if (!n || !L.nuocTBHopLe(cong, kn, n)) n = nuocDuPhong(cong, kn);
      diTB(l.i, n);
    }, 650);
    return;
  }
  /* hải quan */
  if (laMinh(P)) { batLuotHQ(l.i); return; }
  ui.che = 'cho'; capNhatChu(); veDong();
  mayNghi('hq', { cong, j: l.i, muc: van.ghe[P].muc }, (n) => {
    if (!van || van.h.cong !== cong) return;
    if (!n || !L.nuocHQHopLe(cong, l.i, n)) n = { j: l.i, linh: cong.linh.slice(), soat: L.duocSoat(cong, l.i) ? cong.linh[cong.ch.chu.indexOf(l.i)] : -1 };
    diHQ(l.i, n);
  }, 450);
}
const nuocDuPhong = (cong, kn) => ({ toi: L.keDi(kn.o).find(v => !cong.linh.includes(v)), gia: -1, giao: false, thoat: false });

/* tay buôn i đi (người hay máy): bí mật cập nhật trong kin, phần công khai áp vào cong */
function diTB(i, n) {
  const { cong, kin } = van.h, kn = kin[i], P = gheTB(i), minh = laMinh(P);
  const khac = cong.khac;
  const r = L.kinDi(cong, kn, n);
  L.apTB(cong, r);
  tiengBuoc();
  if (minh) {
    them(`Khắc ${khac} · Bạn đi tới ${TEN[n.toi]}${n.giao ? ` — giao một kiện cho mối ${TEN[n.toi]}` : ''}${n.gia >= 0 ? `; tin đồn: rải dấu giả ở ${TEN[n.gia]}` : ''}.`, 'minh');
    if (n.giao) tiengGiao();
  } else if (!r.thoat || r.thoat < 0) them(`Khắc ${khac} · ${tenTB(i)} đã đi một bước, không ai biết đi đâu.`, 'mo');
  if (r.thoat >= 0) {
    them(`Khắc ${khac} · ${minh ? 'Bạn' : tenTB(i)} lên thuyền ở ${TEN[r.thoat]} — thoát!`, 'thoat');
    tiengThuyen();
  }
  ui.che = ''; ui.chon = -1; ui.gia = -1;
  capNhatChu(); veDong();
  tiep();
}
/* hải quan j: dời lính (có hình động), rồi lục soát */
function diHQ(j, n) {
  const { cong, kin } = van.h, P = gheHQ(j), minh = laMinh(P), khac = cong.khac;
  const cu = cong.linh.slice();
  if (n.soat >= 0) n.kq = kin.map(k => (k ? L.traLoi(k, n.soat) : null));
  ui.che = 'cho';
  chayLinh(cu, n.linh, () => {
    if (!van || van.h.cong !== cong) return;
    L.apHQ(cong, n);
    if (n.soat >= 0) {
      ui.soatVua = { z: n.soat, k: khac, t: Date.now() };
      tiengSoat();
      const ai = minh ? 'Bạn' : tenHQ(j);
      const kq = cong.soat[cong.soat.length - 1].kq;
      const bat = kq.map((x, i) => (x && x.loai === 'bat' ? i : -1)).filter(i => i >= 0);
      const dau = kq.map((x, i) => (x && x.loai === 'dau' ? i : -1)).filter(i => i >= 0);
      if (bat.length) {
        them(`Khắc ${khac} · ${ai} lục soát ${TEN[n.soat]}: BẮT ĐƯỢC ${bat.map(i => (laMinh(gheTB(i)) ? 'bạn' : tenTB(i))).join(' và ')}!`, 'bat');
        tiengBat();
      } else if (dau.length) {
        them(`Khắc ${khac} · ${ai} lục soát ${TEN[n.soat]}: thấy ${dau.map(i => `dấu chân khắc ${kq[i].dau}${cong.ch.soTB > 1 ? ` của ${laMinh(gheTB(i)) ? 'bạn' : tenTB(i)}` : ''}`).join(', ')}!`, 'dau');
        tiengDau();
      } else them(`Khắc ${khac} · ${ai} lục soát ${TEN[n.soat]}: không thấy gì.`, 'trong');
    } else them(`Khắc ${khac} · ${minh ? 'Bạn' : tenHQ(j)} dời lính${L.duocSoat(cong, j) ? '' : ' (khắc này đồng đội soát)'}.`, 'mo');
    ui.che = ''; ui.linhChon = -1; ui.linhMoi = null; ui.soat = -1;
    capNhatChu(); veDong();
    tiep();
  });
}
/* hết khắc: tin giao hàng của khắc trước lộ ra; trống điểm canh */
function hetKhacNay() {
  const { cong, kin } = van.h, t = cong.khac, ch = cong.ch;
  const giao = kin.map(k => (k ? L.giaoTrongKhac(cong, k) : -1));
  L.hetKhac(cong, giao);
  giao.forEach((m, i) => {
    if (m < 0) return;
    const ai = ch.soTB > 1 ? (laMinh(gheTB(i)) ? 'bạn' : tenTB(i)) : laMinh(gheTB(i)) ? 'bạn' : 'tay buôn';
    them(`Có tin: khắc ${t - (ch.tre || 0)}, ${ai} đã giao một kiện ở mối ${TEN[m]}.`, 'giao');
    tiengTin();
  });
  if (!cong.xong && CANH_TEN[cong.khac - 1] !== undefined && cong.khac > 1) tiengCanh();
  capNhatChu(); veDong();
  tiep();
}

/* ---------- lượt của người ---------- */
function batLuotTB(i) {
  ui.che = 'tb'; ui.tb = i; ui.chon = -1; ui.gia = -1; ui.giao = true; ui.thoat = true; ui.dangGia = false;
  capNhatChu(); veDong();
  tiengToiLuot();
}
function batLuotHQ(j) {
  const cong = van.h.cong;
  ui.che = 'hq'; ui.hq = j; ui.linhMoi = cong.linh.slice(); ui.linhChon = -1; ui.soat = -1; ui.buocHQ = 'linh';
  /* lính đầu tiên của mình được chọn sẵn */
  ui.linhChon = cong.ch.chu.indexOf(j);
  capNhatChu(); veDong();
  tiengToiLuot();
}
const choDiTB = () => { const { cong, kin } = van.h, kn = kin[ui.tb]; return L.keDi(kn.o).filter(v => !cong.linh.includes(v)); };
const choGiaTB = () => { const { cong, kin } = van.h, kn = kin[ui.tb]; const ds = []; for (let z = 0; z < N; z++) if (L.giaHopLe(cong, kn, z) && z !== ui.chon) ds.push(z); return ds; };
const choLinhToi = (o) => { const cong = van.h.cong, ds = []; for (const v of TOI[cong.linh[o]]) if (!ui.linhMoi.some((x, k) => k !== o && x === v)) ds.push(v); return ds; };
const choSoat = () => {
  const cong = van.h.cong, j = ui.hq, s = new Set();
  if (!L.duocSoat(cong, j)) return [];
  ui.linhMoi.forEach((o, k) => { if (cong.ch.chu[k] === j) for (const z of SOAT[o]) s.add(z); });
  return [...s];
};
function xongTB() {
  const { cong, kin } = van.h, kn = kin[ui.tb], ch = cong.ch;
  if (ui.chon < 0) return;
  const v = ui.chon;
  const n = { toi: v, gia: ui.gia,
    giao: ch.moi.includes(v) && !L.daGiao(kn, v) && kn.giao.length < ch.can && ui.giao,
    thoat: ch.ben.includes(v) && ui.thoat };
  if (!L.nuocTBHopLe(cong, kn, n)) { bao('Nước này không được — chọn lại nhé.'); return; }
  if (van.cheDo === 'phong') { guiTB(ui.tb, n); return; }
  diTB(ui.tb, n);
}
function xongHQ() {
  const cong = van.h.cong, j = ui.hq;
  const soat = L.duocSoat(cong, j) ? ui.soat : -1;
  if (L.duocSoat(cong, j) && soat < 0) { bao('Chạm một chỗ sáng để lục soát.'); return; }
  const n = { j, linh: ui.linhMoi.slice(), soat };
  if (!L.nuocHQHopLe(cong, j, n)) { bao('Lính chưa đứng đúng chỗ — mỗi lính tối đa 2 bước theo phố.'); return; }
  if (van.cheDo === 'phong') { const cu = cong.linh.slice(); chayLinh(cu, n.linh, () => {}); guiHQ(j, n); return; }
  diHQ(j, n);
}

/* ---------- hết hiệp, hết trận ---------- */
function diemPheBuon() {
  const { cong, kin } = van.h;
  return kin.reduce((s, k, i) => s + L.diemTB(cong, i, k || { giao: [] }), 0);
}
function hetHiep() {
  if (ui.che === 'het') return;
  boViec();
  const { cong, kin } = van.h, phe = pheBuon(van.hiep), d = diemPheBuon();
  van.diem[phe] += d;
  van.khacXong[phe] += Math.min(cong.ch.T, cong.khac);
  const dong = kin.map((k, i) => {
    const t = cong.tb[i], ten = laMinh(gheTB(i)) ? 'Bạn' : tenTB(i);
    const ket = t.bat >= 0 ? (t.vay ? `bị vây bắt ở khắc ${t.bat}` : `bị bắt ở khắc ${t.bat}`) : t.thoat >= 0 ? `lên thuyền ở ${TEN[t.ben]} (khắc ${t.thoat})` : 'trời sáng mà chưa ra được bến';
    return `${ten}: giao ${k.giao.length}/${cong.ch.can} kiện${k.giao.length ? ` (${k.giao.map(g => TEN[g.m]).join(', ')})` : ''}, ${ket}${k.giaDung.length ? `; rải ${k.giaDung.length} dấu giả` : ''}.`;
  });
  van.ketHiep[van.hiep] = { phe, d, dong };
  ui.che = 'het'; ui.lo = true;
  them(`Hết hiệp ${van.hiep + 1}: phe buôn được ${d} điểm.`, 'het');
  capNhatChu(); veDong();
  if (van.hiep === 0) tiengHet(); else tiengThangThua();
  setTimeout(() => { if (van && ui.che === 'het') moTinHetHiep(); }, 1300 * NHANH);
}
function sangHiepSau() {
  if (!van) return;
  if (van.hiep === 0) { van.hiep = 1; tatTin(); batDauHiep(); return; }
  van.xong = true; moTinHetHiep();
}

/* ---------- nhật ký ---------- */
function them(chu, loai = '') {
  if (!van) return;
  van.nhat.push({ chu, loai, t: Date.now() });
  if (van.nhat.length > 80) van.nhat.shift();
}
let baoHen = 0;
function bao(chu) {
  if (!tam) return;
  const b = tam.querySelector('.bl-bao');
  b.textContent = chu; b.hidden = false;
  clearTimeout(baoHen); baoHen = setTimeout(() => { b.hidden = true; }, 3200);
}

/* ======================================================================================================
   VẼ BẢN ĐỒ (SVG): lớp tĩnh vẽ một lần (sông, hồ, chợ, phố, ngõ, mối, bến, cửa vào), lớp động vẽ lại mỗi khi đổi
   (dấu chân, lính, tay buôn, chỗ chạm được).
   ====================================================================================================== */
const XY = (v) => [BX[v], BY[v]];
const ke2 = (a, b) => KE[a].includes(b);
const laNgo = (a, b) => L.laNgo(a, b);
/* nhãn đặt về phía ít đường nhất quanh ngã */
function huongNhan(v) {
  let dx = 0, dy = 0;
  const ds = LOAI[v] === 'vao' ? [LOI_VAO[v]] : KE[v];
  for (const u of ds) { const l = Math.hypot(BX[u] - BX[v], BY[u] - BY[v]) || 1; dx += (BX[u] - BX[v]) / l; dy += (BY[u] - BY[v]) / l; }
  const l = Math.hypot(dx, dy);
  return l < 0.2 ? [0, -1] : [-dx / l, -dy / l];
}
const BIEU = {
  den: '<symbol id="bl-s-den" viewBox="-20 -30 40 60"><path d="M-3-28h6v5h-6z" fill="#3a2a1c"/><ellipse cy="0" rx="17" ry="21" fill="#e2492f"/><ellipse cy="0" rx="17" ry="21" fill="url(#bl-g-den)"/><path d="M-17 0h34M-12-14h24M-12 14h24" stroke="#ffcf6a" stroke-opacity=".55" stroke-width="2"/><path d="M-9-21h18v-3h-18zM-9 21h18v3h-18z" fill="#3a2a1c"/><path d="M-1 24v6M1 24v6" stroke="#ffcf6a" stroke-width="2"/></symbol>',
  thuyen: '<symbol id="bl-s-thuyen" viewBox="-34 -30 68 44"><path d="M-30 4h60l-9 10h-42z" fill="#6b4a2c"/><path d="M-30 4h60" stroke="#c99a5a" stroke-width="2"/><path d="M0-27v31" stroke="#c9b48a" stroke-width="2.5"/><path d="M2-25c12 6 15 17 14 27h-14z" fill="#d9c79a"/><path d="M-2-20c-9 5-12 14-12 22h12z" fill="#bfa77a"/></symbol>',
  cong: '<symbol id="bl-s-cong" viewBox="-30 -30 60 60"><path d="M-26 26v-30h52v30" fill="#4a3e33" stroke="#c9a462" stroke-width="2.5"/><path d="M-11 26v-14a11 11 0 0 1 22 0v14z" fill="#151827"/><path d="M-30-4l30-22 30 22z" fill="#6b5340" stroke="#c9a462" stroke-width="2.5"/><path d="M-18-12h36" stroke="#c9a462" stroke-width="2"/></symbol>',
  cho: '<symbol id="bl-s-cho" viewBox="-60 -40 120 70"><path d="M-56 28v-30h112v30z" fill="#4c4033" stroke="#c9a462" stroke-width="2.5"/><path d="M-44 28v-16a10 10 0 0 1 20 0v16zM-10 28v-20a10 10 0 0 1 20 0v20zM24 28v-16a10 10 0 0 1 20 0v16z" fill="#151827"/><path d="M-60-2l60-34 60 34z" fill="#6b5340" stroke="#c9a462" stroke-width="2.5"/><circle cy="-14" r="6" fill="#f2d38a"/></symbol>',
  linh: '<symbol id="bl-s-linh" viewBox="-30 -30 60 60"><path d="M-17 2a17 9 0 0 1 34 0z" fill="#fff" fill-opacity=".95"/><path d="M-23 4h46" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cy="12" r="8" fill="#fff" fill-opacity=".9"/><path d="M-7-6h14" stroke="#1c2b48" stroke-width="3"/></symbol>',
  buon: '<symbol id="bl-s-buon" viewBox="-30 -30 60 60"><path d="M-25-6h50" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M-21-6v9M21-6v9" stroke="#fff" stroke-width="2"/><path d="M-27 3h12l-2 9h-8zM15 3h12l-2 9h-8z" fill="#fff"/><path d="M-12-14l12-9 12 9z" fill="#fff"/><circle cy="-3" r="5" fill="#fff"/><path d="M0 2v14M0 16l-5 10M0 16l5 10" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></symbol>',
  dau: '<symbol id="bl-s-dau" viewBox="-14 -16 28 32"><ellipse cx="-5" cy="-3" rx="4.2" ry="7" transform="rotate(-12 -5 -3)"/><ellipse cx="-6.5" cy="8" rx="3.2" ry="3.4"/><ellipse cx="6" cy="-7" rx="4.2" ry="7" transform="rotate(12 6 -7)"/><ellipse cx="7.5" cy="4" rx="3.2" ry="3.4"/></symbol>',
  kien: '<symbol id="bl-s-kien" viewBox="-16 -16 32 32"><path d="M-13-6l13-7 13 7v13l-13 7-13-7z" fill="#c9924f" stroke="#4a2e14" stroke-width="2"/><path d="M-13-6l13 7 13-7M0 1v13" fill="none" stroke="#4a2e14" stroke-width="2"/></symbol>',
};
function veBanTinh() {
  const nen = [], pho = [], vien = [], ngo = [], loi = [], ten = [], cho = [], nhan = [];
  /* sông Hồng: dải nước bên phải đê Trần Nhật Duật (bờ cách các bến 40 đơn vị) */
  const bo = [[750, -80], [796, 210], [836, 412], [860, 570], [946, 850], [1004, 945], [1024, 1257], [1050, 1526], [1066, 1650]];
  nen.push(`<path d="M${bo.map(p => p.join(' ')).join('L')}L1140 1650L1140 -80Z" fill="url(#bl-g-nuoc)"/>`);
  for (let k = 0; k < 9; k++) {
    const y = 40 + k * 190, x = 830 + y * 0.15;
    nen.push(`<path d="M${x + 60} ${y}q14-8 28 0t28 0" fill="none" stroke="#7ab6d8" stroke-opacity=".25" stroke-width="3"/>`);
  }
  nen.push(`<text class="bl-song" x="1100" y="760" transform="rotate(80 1100 760)">Sông Hồng</text>`);
  /* Hồ Gươm, Tháp Rùa ở góc dưới */
  nen.push(`<ellipse cx="236" cy="1690" rx="250" ry="112" fill="url(#bl-g-ho)" stroke="#7ab6d8" stroke-opacity=".35" stroke-width="3"/>`,
    `<path d="M226 1614v-14h22v14zM222 1600l15-9 15 9z" fill="#c9b48a" fill-opacity=".7"/>`, `<text class="bl-ho" x="150" y="1630">Hồ Gươm</text>`);
  /* phố: viền tối rồi nét sáng; ngõ: nét đứt; lối từ cửa vào: chấm mờ */
  for (const [a, b, tp, loai] of L.CANH) {
    const i = SO[a], j = SO[b], d = `M${BX[i]} ${BY[i]}L${BX[j]} ${BY[j]}`;
    if (loai === 2) loi.push(`<path d="${d}"/>`);
    else if (loai === 1) ngo.push(`<path d="${d}"/>`);
    else { vien.push(`<path d="${d}"/>`); pho.push(`<path d="${d}"/>`); }
  }
  /* tên phố dọc theo đường */
  const TEN_PHO = [['hbac', 'mm4', 'Hàng Bạc'], ['hg2', 'hb', 'Hàng Buồm'], ['th1', 'th2', 'Tạ Hiện'], ['mm2', 'mm3', 'Mã Mây'], ['hd1', 'hd2', 'Hàng Đào'],
    ['ng', 'lo', 'Hàng Đường'], ['hg1', 'oqc', 'Hàng Chiếu'], ['b2', 'hch', 'Trần Nhật Duật'], ['cg1', 'cg2', 'Cầu Gỗ'], ['cg3', 'hth1', 'Hàng Thùng'],
    ['nhh3', 'nhh4', 'Nguyễn Hữu Huân'], ['dl1', 'dl2', 'Đinh Liệt'], ['ns', 'hg2', 'Hàng Giấy'], ['th2', 'ddt2', 'Lương Ngọc Quyến'], ['ddt', 'ddt2', 'Đào Duy Từ'],
    ['hbe1', 'hbe2', 'Hàng Bè'], ['dl2', 'gn', 'Gia Ngư'], ['hm', 'hmb', 'Hàng Mắm'], ['ht1', 'hth2', 'Hàng Tre'], ['ns', 'cg', 'Nguyễn Siêu'], ['lo', 'hd1', 'Hàng Ngang'],
    ['dx', 'cd', 'Cầu Đông'], ['th', 'oqc', 'Thanh Hà'], ['hc', 'dx2', 'Hàng Chiếu'], ['dx', 'dx2', 'Đồng Xuân'], ['hch', 'b3', 'Trần Nhật Duật'],
    ['ng', 'ns', 'Ngõ Gạch'], ['pl', 'nhh2', 'Ngõ Phất Lộc'], ['dl1', 'gn', 'Ngõ Trung Yên'], ['gn', 'cg2', 'Ngõ Cầu Gỗ'], ['th1', 'ddt', 'Ngõ Đào Duy Từ'],
    ['nhh4', 'ht1', 'Ngõ Nguyễn Hữu Huân'], ['cd', 'hc', 'Ngõ Đồng Xuân'], ['b3', 'hmb', 'Trần Nhật Duật'], ['ct', 'th', 'Nguyễn Thiện Thuật'], ['nhh1', 'hm', 'Hàng Muối']];
  const choNhan = [];                                   // chỗ đã có nhãn hay hình (mối, bến, cửa, Ô Quan Chưởng)
  for (let v = 0; v < N; v++) if (LOAI[v] || KHOA[v] === 'oqc') { const [hx, hy] = huongNhan(v); choNhan.push([BX[v], BY[v]], [BX[v] + hx * 60, BY[v] + hy * 60]); }
  for (const [a, b, t] of TEN_PHO) {
    const i = SO[a], j = SO[b];
    if (choNhan.some(([x, y]) => Math.hypot(x - (BX[i] + BX[j]) / 2, y - (BY[i] + BY[j]) / 2) < 78)) continue;
    let x1 = BX[i], y1 = BY[i], x2 = BX[j], y2 = BY[j];
    if (x2 < x1) { [x1, x2] = [x2, x1]; [y1, y2] = [y2, y1]; }
    const g = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, ngoN = /^Ngõ/.test(t);
    ten.push(`<text class="bl-tp${ngoN ? ' bl-tp-ngo' : ''}" x="${mx.toFixed(0)}" y="${(my - 9).toFixed(0)}" transform="rotate(${g.toFixed(1)} ${mx.toFixed(0)} ${my.toFixed(0)})">${esc(t)}</text>`);
  }
  /* ngã, mối, bến, cửa vào */
  const ch = L.cauHinh('1v1');
  for (let v = 0; v < N; v++) {
    const [x, y] = XY(v), l = LOAI[v], [hx, hy] = huongNhan(v);
    if (l === 'vao') {
      const u = LOI_VAO[v], dx = BX[u] - x, dy = BY[u] - y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
      const ex = x + ux * 46, ey = y + uy * 46;
      if (KHOA[v] === 'vdx') cho.push(`<use href="#bl-s-cho" x="${x - 60}" y="${y - 46}" width="120" height="70" opacity=".9"/>`);
      cho.push(`<path d="M${(x + ux * 14).toFixed(0)} ${(y + uy * 14).toFixed(0)}L${ex.toFixed(0)} ${ey.toFixed(0)}M${(ex - ux * 14 - uy * 10).toFixed(0)} ${(ey - uy * 14 + ux * 10).toFixed(0)}L${ex.toFixed(0)} ${ey.toFixed(0)}L${(ex - ux * 14 + uy * 10).toFixed(0)} ${(ey - uy * 14 - ux * 10).toFixed(0)}" class="bl-mui"/><circle cx="${x}" cy="${y}" r="12" class="bl-cua"/>`);
      nhan.push(nhanTai(v, TEN[v], 'bl-n-cua', hx, hy, 34));
      continue;
    }
    if (l === 'moi') { cho.push(`<use href="#bl-s-den" x="${x - 17}" y="${y - 52}" width="34" height="51"/>`); nhan.push(nhanTai(v, TEN[v], 'bl-n-moi', hx, hy, 40)); }
    else if (l === 'ben') {
      const [ox, oy] = BEN_THUYEN[KHOA[v]] || [60, 0];
      cho.push(`<use href="#bl-s-thuyen" x="${x + ox - 34}" y="${y + oy - 30}" width="68" height="44"/>`);
      nhan.push(`<text class="bl-n-ben" x="${x + ox + (ox > 30 ? -6 : 0)}" y="${y + oy + 34}">${esc(TEN[v].replace('Bến ', 'Bến '))}</text>`);
    } else if (KHOA[v] === 'oqc') { cho.push(`<use href="#bl-s-cong" x="${x - 30}" y="${y - 64}" width="60" height="60"/>`); nhan.push(nhanTai(v, 'Ô Quan Chưởng', 'bl-n-oqc', 0.2, -1, 78)); }
    cho.push(`<circle cx="${x}" cy="${y}" r="${l === 'ben' ? 14 : 11}" class="bl-nga${l ? ' bl-nga-' + l : ''}${!KP[v].length ? ' bl-nga-ngo' : ''}"/>`);
  }
  void ch;
  return `<defs>
      <radialGradient id="bl-g-nen" cx="45%" cy="45%" r="75%"><stop offset="0" stop-color="#1a2038"/><stop offset="1" stop-color="#0b0e1c"/></radialGradient>
      <linearGradient id="bl-g-nuoc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#16364f"/><stop offset="1" stop-color="#0c2134"/></linearGradient>
      <radialGradient id="bl-g-ho" cx="50%" cy="30%" r="70%"><stop offset="0" stop-color="#1d4a5e"/><stop offset="1" stop-color="#0f2a3a"/></radialGradient>
      <radialGradient id="bl-g-den" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset=".55" stop-color="#ff7a3a" stop-opacity=".25"/><stop offset="1" stop-color="#5a0f05" stop-opacity=".55"/></radialGradient>
      <radialGradient id="bl-g-sang" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      ${Object.values(BIEU).join('')}
    </defs>
    <rect x="${VB.x}" y="${VB.y}" width="${VB.w}" height="${VB.h}" fill="url(#bl-g-nen)"/>
    ${nen.join('')}
    <g class="bl-loi">${loi.join('')}</g>
    <g class="bl-vien">${vien.join('')}</g><g class="bl-pho">${pho.join('')}</g><g class="bl-ngo">${ngo.join('')}</g>
    <g class="bl-ten-pho">${ten.join('')}</g>
    <g class="bl-cho">${cho.join('')}</g>
    <g class="bl-nhan">${nhan.join('')}</g>
    <g class="bl-dong"></g>`;
}
function nhanTai(v, chu, lop, hx, hy, xa) {
  let x = BX[v] + hx * xa, y = BY[v] + hy * xa + 10;
  const rong = chu.length * 15;
  let neo = Math.abs(hx) < 0.35 ? 'middle' : hx > 0 ? 'start' : 'end';
  if (neo === 'start' && x + rong > VB.x + VB.w - 8) { neo = 'end'; x = BX[v] - 20; }
  if (neo === 'end' && x - rong < VB.x + 8) { neo = 'start'; x = BX[v] + 20; }
  if (neo === 'middle') x = Math.max(VB.x + rong / 2 + 6, Math.min(VB.x + VB.w - rong / 2 - 6, x));
  return `<text class="${lop}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" text-anchor="${neo}">${esc(chu)}</text>`;
}

/* ---------- lớp động ---------- */
/* ai đang xem: trong đấu với máy là mình; hết hiệp thì lộ hết */
function xemTB(i) { return !!van && van.h && (ui.lo || laMinh(gheTB(i))); }
function dauLo(cong, i) {
  /* dấu đã lộ của tay buôn i: lần soát gần nhất ở mỗi chỗ */
  const m = new Map();
  for (const r of cong.soat) {
    const x = r.kq[i];
    if (!x) continue;
    if (x.loai === 'dau') m.set(r.z, x.dau); else if (x.loai === 'trong') m.delete(r.z);
  }
  return m;
}
function soatTrong(cong) {
  const m = new Map();
  for (const r of cong.soat) m.set(r.z, r.kq.every(x => !x || x.loai === 'trong') ? r.k : -1);
  return m;
}
function vungTu(v, buoc) {
  const d = new Map([[v, 0]]), h = [v];
  for (let q = 0; q < h.length; q++) { const u = h[q]; if (d.get(u) >= buoc) continue; for (const w of KE[u]) if (!d.has(w)) { d.set(w, d.get(u) + 1); h.push(w); } }
  return d;
}
function vongCham(v, lop, r = 30) { const [x, y] = XY(v); return `<circle cx="${x}" cy="${y}" r="${r}" class="${lop}"/>`; }
function viTriLinh() {
  const cong = van.h.cong;
  if (hoat) return hoat.vt;
  if (van.h.choLinh) return van.h.choLinh.map(XY);
  if (ui.che === 'hq' && ui.linhMoi) return ui.linhMoi.map(XY);
  return cong.linh.map(XY);
}
function veDong() {
  if (!dongEl || !van || !van.h) { if (dongEl) dongEl.innerHTML = ''; return; }
  const { cong, kin } = van.h, ch = cong.ch, ra = [];
  /* gợi ý vùng nghi (chỗ hắn có thể đang đứng) cho hải quan là người */
  if (ui.nghi && !minhLaTB() && cong.khac >= 1 && !ui.lo) {
    for (let i = 0; i < ch.soTB; i++) {
      if (!L.conChoi(cong, i)) continue;
      const P = L.niemTin(cong, i).P; let mx = 0; for (let v = 0; v < N; v++) mx = Math.max(mx, P[v]);
      for (let v = 0; v < N; v++) if (P[v] > 1e-9) ra.push(`<circle cx="${BX[v]}" cy="${BY[v]}" r="${(22 + 26 * Math.sqrt(P[v] / mx)).toFixed(0)}" class="bl-nghi"/>`);
    }
  }
  /* vùng hắn đi được từ một dấu chân đang xem */
  if (ui.xemDau) {
    const { z, k } = ui.xemDau, d = vungTu(z, Math.max(0, cong.khac - k));
    for (const [v, b] of d) ra.push(`<circle cx="${BX[v]}" cy="${BY[v]}" r="${b ? 26 : 34}" class="bl-tam"/>`);
  }
  /* chỗ soát trống */
  for (const [z, k] of soatTrong(cong)) if (k >= 0) { const [x, y] = XY(z); ra.push(`<path d="M${x - 10} ${y - 10}l20 20m0-20l-20 20" class="bl-x"/>`); }
  /* tin giao hàng đã lộ, và kiện mình giao mà chưa lộ */
  const daBao = new Set(cong.giao.map(g => g.i + ':' + g.m));
  for (const g of cong.giao) { const [x, y] = XY(g.m); ra.push(`<use href="#bl-s-kien" x="${x + 6}" y="${y - 2}" width="30" height="30"/><text class="bl-k" x="${x + 21}" y="${y + 44}">k${g.k}</text>`); }
  kin.forEach((k, i) => {
    if (!k || !xemTB(i)) return;
    for (const g of k.giao) if (!daBao.has(i + ':' + g.m)) { const [x, y] = XY(g.m); ra.push(`<use href="#bl-s-kien" x="${x + 6}" y="${y - 2}" width="30" height="30" opacity=".7"/><text class="bl-k bl-k-kin" x="${x + 21}" y="${y + 44}">k${g.k}</text>`); }
  });
  /* đường đi của tay buôn mình xem được (của mình, hay lúc lộ): nét đứt nối các khắc theo thứ tự */
  kin.forEach((k, i) => {
    if (!k || !xemTB(i)) return;
    const d = k.duong.filter(v => v !== undefined && LOAI[v] !== 'vao');
    if (d.length > 1) ra.push(`<path class="bl-vet" d="M${d.map(v => `${BX[v]} ${BY[v]}`).join('L')}" stroke="${MAU_TB[i]}"/>`);
  });
  /* dấu chân: của mình thì thấy hết (dấu giả có viền đứt), của người khác thì chỉ dấu đã lộ */
  for (let i = 0; i < ch.soTB; i++) {
    const lo = dauLo(cong, i), mau = MAU_TB[i], lech = ch.soTB > 1 ? (i ? 14 : -14) : 0;
    const ve = (z, d, gia, daLo) => {
      const [x, y] = XY(z);
      ra.push(`<g class="bl-dau${gia ? ' bl-dau-gia' : ''}${daLo ? ' bl-dau-lo' : ''}" data-dau="${z}:${d}"><use href="#bl-s-dau" x="${x - 34 + lech}" y="${y - 16}" width="24" height="28" fill="${mau}"/>` +
        `<text x="${x - 22 + lech}" y="${y + 30}">${d}${gia ? '?' : ''}</text></g>`);
    };
    if (kin[i] && xemTB(i)) {
      const k = kin[i];
      for (let z = 0; z < N; z++) if (k.dau[z] >= 0 && LOAI[z] !== 'vao') ve(z, k.dau[z], !!k.gia[z] && ui.lo === false ? true : !!k.gia[z], lo.has(z));
    } else for (const [z, d] of lo) ve(z, d, false, true);
  }
  /* chỗ chạm được */
  if (ui.che === 'cua') for (const v of ch.vao) if (!van.h.vao.includes(v)) ra.push(vongCham(v, 'bl-cham bl-cham-cua', 34));
  if (ui.che === 'tb') {
    if (ui.dangGia) { for (const z of choGiaTB()) ra.push(vongCham(z, 'bl-cham bl-cham-gia', 26)); }
    else for (const v of choDiTB()) ra.push(vongCham(v, 'bl-cham bl-cham-di'));
    if (ui.chon >= 0) ra.push(vongCham(ui.chon, 'bl-chon-di', 36));
    if (ui.gia >= 0) ra.push(vongCham(ui.gia, 'bl-chon-gia', 30));
  }
  if (ui.che === 'hq') {
    if (ui.buocHQ === 'soat') { for (const z of choSoat()) ra.push(vongCham(z, 'bl-cham bl-cham-soat', 28)); if (ui.soat >= 0) ra.push(vongCham(ui.soat, 'bl-chon-soat', 38)); }
    else if (ui.linhChon >= 0) for (const v of choLinhToi(ui.linhChon)) if (v !== ui.linhMoi[ui.linhChon]) ra.push(vongCham(v, 'bl-cham bl-cham-linh', 28));
  }
  /* lần soát vừa rồi */
  if (ui.soatVua && Date.now() - ui.soatVua.t < 2600) ra.push(vongCham(ui.soatVua.z, 'bl-soat-sung', 30));
  /* tay buôn (của mình, hay lúc lộ) */
  kin.forEach((k, i) => {
    if (!k || !xemTB(i)) return;
    const t = cong.tb[i];
    if (LOAI[k.o] === 'vao' && cong.khac === 1 && !ui.lo && ui.che === 'cua') return;
    const [x, y] = XY(k.o);
    ra.push(`<g class="bl-tb${t.bat >= 0 ? ' bl-tb-bat' : ''}${t.thoat >= 0 ? ' bl-tb-thoat' : ''}" transform="translate(${x} ${y})"><circle r="30" fill="${MAU_TB[i]}"/><use href="#bl-s-buon" x="-24" y="-24" width="48" height="48"/></g>`);
  });
  /* lính */
  const vt = viTriLinh();
  vt.forEach(([x, y], o) => {
    const chu = ch.chu[o], chon = ui.che === 'hq' && ui.linhChon === o, cuaMinh = ui.che === 'hq' && chu === ui.hq;
    ra.push(`<g class="bl-linh${chon ? ' bl-linh-chon' : ''}${cuaMinh ? ' bl-linh-minh' : ''}" data-linh="${o}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="31" fill="${MAU_HQ[chu]}"/><use href="#bl-s-linh" x="-24" y="-26" width="48" height="48"/><text y="45">${o + 1}</text></g>`);
  });
  if (ui.che === 'hq' && ui.linhMoi) cong.linh.forEach((v, o) => { if (ui.linhMoi[o] !== v) { const [x, y] = XY(v); ra.push(`<circle cx="${x}" cy="${y}" r="24" class="bl-linh-cu"/>`); } });
  dongEl.innerHTML = ra.join('');
}

/* ---------- lính đi: hình động theo đường phố ---------- */
function duongPho(a, b) {
  if (a === b) return [a];
  const truoc = new Map([[a, -1]]), h = [a];
  for (let q = 0; q < h.length; q++) { const u = h[q]; if (u === b) break; for (const w of KP[u]) if (!truoc.has(w)) { truoc.set(w, u); h.push(w); } }
  if (!truoc.has(b)) return [a, b];
  const d = []; for (let v = b; v !== -1; v = truoc.get(v)) d.unshift(v);
  return d;
}
function chayLinh(cu, moi, xong) {
  const ds = cu.map((v, o) => duongPho(v, moi[o]));
  const dai = Math.max(...ds.map(d => d.length - 1));
  if (!dai || typeof requestAnimationFrame !== 'function' || (typeof document !== 'undefined' && document.hidden) || !tam || !tam.classList.contains('hien')) { xong(); return; }
  hoat = { t0: 0, lau: 340 * dai, ds, dai, xong, vt: cu.map(XY) };
  const buoc = (t) => {
    if (!hoat) return;
    if (!hoat.t0) hoat.t0 = t;
    const u = Math.min(1, (t - hoat.t0) / hoat.lau);
    hoat.vt = hoat.ds.map(d => {
      if (d.length < 2) return XY(d[0]);
      const s = u * (d.length - 1), k = Math.min(d.length - 2, Math.floor(s)), f = s - k, e = f * f * (3 - 2 * f);
      return [BX[d[k]] + (BX[d[k + 1]] - BX[d[k]]) * e, BY[d[k]] + (BY[d[k + 1]] - BY[d[k]]) * e];
    });
    datViTriLinh(hoat.vt);
    if (u < 1) { hoat.raf = requestAnimationFrame(buoc); return; }
    const f = hoat.xong; hoat = null; f();
  };
  veDong();
  hoat.raf = requestAnimationFrame(buoc);
}
function datViTriLinh(vt) {
  if (!dongEl || !dongEl.querySelectorAll) return;
  for (const g of dongEl.querySelectorAll('[data-linh]')) { const p = vt[+g.getAttribute('data-linh')]; if (p) g.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`); }
}
function dungHoat() { if (hoat) { if (hoat.raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(hoat.raf); const f = hoat.xong; hoat = null; void f; } }
/* bài kiểm thử: chạy hết hình động ngay */
function tuaHet() { for (let k = 0; k < 50 && hoat; k++) { const f = hoat.xong; hoat = null; f(); } }

/* ---------- chạm trên bản đồ ---------- */
function toaDoBan(e) {
  const r = banEl.getBoundingClientRect(), s = Math.min(r.width / VB.w, r.height / VB.h);
  const ox = r.left + (r.width - VB.w * s) / 2, oy = r.top + (r.height - VB.h * s) / 2;
  return [(e.clientX - ox) / s + VB.x, (e.clientY - oy) / s + VB.y];
}
function ganNhat(x, y, ds, tam_ = 70) {
  let tot = -1, td = tam_;
  for (const v of ds) { const d = Math.hypot(BX[v] - x, BY[v] - y); if (d < td) { td = d; tot = v; } }
  return tot;
}
const moiCho = () => Array.from({ length: N }, (_, v) => v);
function chamBan(e) {
  if (!van || !van.h || hoat) return;
  const [x, y] = toaDoBan(e);
  chamTai(x, y);
}
function chamTai(x, y) {
  const { cong } = van.h, ch = cong.ch;
  ui.xemDau = null;
  if (ui.che === 'cua') {
    const v = ganNhat(x, y, ch.vao.filter(u => !van.h.vao.includes(u)), 80);
    if (v >= 0) { chonCua(canChonCua(), v); return; }
  } else if (ui.che === 'tb') {
    if (ui.dangGia) {
      const z = ganNhat(x, y, choGiaTB(), 60);
      if (z >= 0) { ui.gia = ui.gia === z ? -1 : z; ui.dangGia = false; capNhatChu(); veDong(); return; }
    } else {
      const v = ganNhat(x, y, choDiTB(), 75);
      if (v >= 0) {
        if (ui.chon === v) { xongTB(); return; }               // chạm lần nữa là đi
        ui.chon = v; ui.giao = true; ui.thoat = canTB() === 0 || ch.T - cong.khac < 2;
        if (ui.gia === v) ui.gia = -1;
        capNhatChu(); veDong(); return;
      }
    }
  } else if (ui.che === 'hq') {
    if (ui.buocHQ === 'soat') {
      const z = ganNhat(x, y, choSoat(), 60);
      if (z >= 0) { if (ui.soat === z) { xongHQ(); return; } ui.soat = z; capNhatChu(); veDong(); return; }
    } else {
      /* chạm lính của mình thì chọn lính đó; chạm chỗ sáng thì lính đang chọn tới đó */
      const minh = ch.chu.map((u, o) => (u === ui.hq ? o : -1)).filter(o => o >= 0);
      let o = -1, td = 46;
      for (const k of minh) { const d = Math.hypot(BX[ui.linhMoi[k]] - x, BY[ui.linhMoi[k]] - y); if (d < td) { td = d; o = k; } }
      if (o >= 0) { ui.linhChon = o; capNhatChu(); veDong(); return; }
      if (ui.linhChon >= 0) {
        const v = ganNhat(x, y, choLinhToi(ui.linhChon), 60);
        if (v >= 0) {
          ui.linhMoi[ui.linhChon] = v;
          /* sang lính kế chưa dời */
          const sau = minh.find(k => k !== ui.linhChon && ui.linhMoi[k] === cong.linh[k]);
          if (sau !== undefined) ui.linhChon = sau;
          tiengBuoc(); capNhatChu(); veDong(); return;
        }
      }
    }
  }
  /* chạm dấu chân đã thấy: tô chỗ hắn có thể đã tới từ đó */
  const dauMoi = [];
  for (let i = 0; i < ch.soTB; i++) for (const [z, d] of dauLo(cong, i)) dauMoi.push({ z, d });
  let tot = null, td = 40;
  for (const u of dauMoi) { const dd = Math.hypot(BX[u.z] - 22 - x, BY[u.z] - y); if (dd < td) { td = dd; tot = u; } }
  if (tot) { ui.xemDau = { z: tot.z, k: tot.d }; ui.xem = tot.z; capNhatChu(); veDong(); return; }
  /* chạm chỗ khác: xem tên ngã */
  const v = ganNhat(x, y, moiCho(), 60);
  ui.xem = v; capNhatChu();
  veDong();
}
const canTB = () => { const { cong, kin } = van.h, k = kin[ui.tb]; return cong.ch.can - k.giao.length - (ui.chon >= 0 && ui.giao && cong.ch.moi.includes(ui.chon) && !L.daGiao(k, ui.chon) ? 1 : 0); };

/* ======================================================================================================
   CHỮ, NÚT, BẢNG
   ====================================================================================================== */
const canhCua = (k, T) => ['một', 'hai', 'ba', 'tư', 'năm'][Math.min(4, Math.floor((k - 1) * 5 / T))];
const cham3 = (co, can) => Array.from({ length: can }, (_, k) => `<i class="${k < co ? 'bl-co' : ''}"></i>`).join('');
function capNhatChu() {
  if (!tam) return;
  const ten = tam.querySelector('.bl-ten span'), nguoi = tam.querySelector('.bl-nguoi'), dem = tam.querySelector('.bl-dem i');
  const luot = tam.querySelector('.bl-luot'), chip = tam.querySelector('.bl-chip'), nut = tam.querySelector('.bl-nut'), nhat = tam.querySelector('.bl-nhat');
  if (!van || !van.h) {
    ten.textContent = 'Trốn tìm có dấu vết trên phố cổ Hà Nội';
    nguoi.innerHTML = ''; dem.style.width = '0%';
    luot.innerHTML = 'Bấm <b>Ván mới</b> để bắt đầu.'; chip.innerHTML = '';
    nut.innerHTML = '<button type="button" class="bl-moi">Ván mới</button>'; nhat.hidden = true;
    return;
  }
  const { cong, kin } = van.h, ch = cong.ch, k = Math.min(cong.khac, ch.T);
  ten.textContent = `Hiệp ${van.hiep + 1}/2 · ${cong.xong ? 'trời sáng' : `khắc ${k}/${ch.T} · canh ${canhCua(k, ch.T)}`}`;
  dem.style.width = `${Math.min(100, (cong.xong ? 1 : (k - 1) / ch.T) * 100).toFixed(0)}%`;
  /* hai phe: tên, vai, điểm; tay buôn: số kiện (của mình thì thật, của người thì theo tin đã lộ), tin đồn còn */
  const pb = pheBuon(van.hiep);
  nguoi.innerHTML = [pb, 1 - pb].map(phe => {
    const buon = phe === pb, mau = buon ? MAU_TB[0] : MAU_HQ[0];
    let them_ = '';
    if (buon) them_ = ghePhe(phe).map((P, i) => {
      const t = cong.tb[i], kn = kin[i], minh = laMinh(P) || ui.lo;
      const co = minh && kn ? kn.giao.length : t.giao;
      const trang = t.bat >= 0 ? '<b class="bl-xau">bị bắt</b>' : t.thoat >= 0 ? '<b class="bl-tot">đã thoát</b>' : '';
      return `<em>${cham3(co, ch.can)}${minh && kn ? `<small>tin đồn ${kn.tinDon}</small>` : ''}${trang}</em>`;
    }).join('');
    else them_ = `<em><small>${ch.soHQ > 1 ? '4 lính · 1 lần soát/khắc' : '3 lính · soát 1 chỗ/khắc'}</small></em>`;
    return `<div class="bl-the${phe === pheCua(Math.max(0, gheLuot(cong.luot))) && ui.che !== 'het' ? ' bl-dang' : ''}" style="--mau:${mau}"><b><i class="bl-vai">${buon ? '🧺' : '🎩'}</i>${esc(tenPhe(phe))}</b>` +
      `<span>${buon ? 'tay buôn' : 'hải quan'} · ${van.diem[phe]} điểm${van.hiep ? '' : ''}</span>${them_}</div>`;
  }).join('');
  /* dòng hướng dẫn và nút */
  let chu = '', chips = '', nuts = '';
  const tenXem = ui.xem >= 0 ? `<span class="bl-xem">${esc(TEN[ui.xem])}</span>` : '';
  if (ui.che === 'cua') {
    chu = `Chọn <b>cửa vào phố</b> ở rìa bản đồ — bí mật, hải quan chỉ biết bạn vào từ một trong ${ch.vao.length} cửa.`;
  } else if (ui.che === 'tb') {
    const kn = kin[ui.tb], t = cong.khac;
    if (ui.dangGia) chu = `Tin đồn: chạm một ngã để rải <b>dấu chân giả mang số khắc ${t - 1}</b> — ai soát trúng sẽ tưởng khắc ${t - 1} bạn đứng đó. Bấm Tin đồn lần nữa để thôi.`;
    else if (ui.chon < 0) chu = `Lượt bạn · khắc ${t}: chạm chỗ sáng để đi một bước — phố, hay ngõ (nét đứt, lính không vào được).`;
    else chu = `Đi tới <b>${esc(TEN[ui.chon])}</b>${ui.gia >= 0 ? `, rải dấu giả ở <b>${esc(TEN[ui.gia])}</b>` : ''}? Chạm lần nữa hay bấm <b>Đi</b>.`;
    if (ui.chon >= 0 && ch.moi.includes(ui.chon)) {
      if (L.daGiao(kn, ui.chon)) chips += '<span class="bl-ghi">Mối này bạn giao rồi</span>';
      else if (kn.giao.length < ch.can) chips += `<button type="button" class="bl-chon-chip${ui.giao ? ' bl-bat' : ''}" data-chip="giao">${ui.giao ? '✓ ' : ''}Giao kiện ở mối này</button>`;
    }
    if (ui.chon >= 0 && ch.ben.includes(ui.chon)) {
      const con = ch.can - kn.giao.length - (ui.giao && ch.moi.includes(ui.chon) ? 1 : 0);
      chips += `<button type="button" class="bl-chon-chip${ui.thoat ? ' bl-bat' : ''}" data-chip="thoat">${ui.thoat ? '✓ ' : ''}Lên thuyền thoát${con > 0 ? ` (còn ${con} kiện chưa giao)` : ' (+1 điểm)'}</button>`;
    }
    if (kn.tinDon > 0 && t > 1) nuts += `<button type="button" class="bl-gia${ui.dangGia || ui.gia >= 0 ? ' bl-bat' : ''}">Tin đồn (${kn.tinDon})</button>`;
    nuts += `<button type="button" class="bl-di bl-chinh"${ui.chon < 0 ? ' disabled' : ''}>Đi</button>`;
  } else if (ui.che === 'hq') {
    const duoc = L.duocSoat(cong, ui.hq);
    if (ui.buocHQ === 'soat') {
      chu = ui.soat < 0 ? `Chạm <b>chỗ đỏ</b> để lục soát — chỗ lính đứng hay sát bên.`
        : `Lục soát <b>${esc(TEN[ui.soat])}</b>? Chạm lần nữa hay bấm <b>Soát</b>.`;
      nuts += '<button type="button" class="bl-lui-linh">‹ Dời lính</button>';
      nuts += `<button type="button" class="bl-soat bl-chinh"${ui.soat < 0 ? ' disabled' : ''}>Soát</button>`;
    } else {
      const doi = ui.linhMoi.filter((v, o) => v !== cong.linh[o]).length;
      chu = `Lượt bạn · khắc ${cong.khac}: chạm lính rồi chạm chỗ sáng để dời (tối đa 2 bước phố). Không dời cũng được.${duoc ? '' : ' Khắc này đồng đội lục soát.'}`;
      if (doi) nuts += '<button type="button" class="bl-dat-lai">Đặt lại</button>';
      nuts += duoc ? '<button type="button" class="bl-toi-soat bl-chinh">Lục soát ›</button>' : '<button type="button" class="bl-soat bl-chinh">Xong</button>';
    }
    nuts += `<button type="button" class="bl-nghi-nut${ui.nghi ? ' bl-bat' : ''}" aria-label="Tô chỗ hắn có thể đang đứng">Gợi ý</button>`;
  } else if (ui.che === 'cho') {
    const P = gheLuot(cong.luot), dap = van.h.choDap;
    if (dap) chu = `<span class="bl-nghi-chu">Chờ máy của ${esc(dap.i.map(tenTB).join(', '))} trả lời lần soát ${esc(TEN[dap.z])}…</span>`;
    else chu = P >= 0 ? `<span class="bl-nghi-chu">${esc(tenGhe(P))} đang ${cong.luot.ai === 'tb' ? 'đi' : 'dời lính'}…</span>` : '';
    if (van.cheDo === 'phong' && phong) {
      const x = viecVang();
      if (x) nuts += `<button type="button" class="bl-vang bl-chinh">${x.loai === 'tudi' ? 'Tự đi tiếp' : x.loai === 'thay' ? `Cho máy đi thay ${esc(tenGhe(x.P))}` : `Cho ${esc(tenGhe(x.P))} bỏ cuộc`}</button>`;
      if (phong.rot) chu += ' <span class="bl-xau">Đang mất mạng…</span>';
    }
  } else if (ui.che === 'het') {
    chu = `Hết hiệp ${van.hiep + 1}.`;
    nuts += `<button type="button" class="bl-ket bl-chinh">Xem kết quả</button>`;
  }
  if (ui.xemDau) chu = `Dấu chân khắc ${ui.xemDau.k} ở <b>${esc(TEN[ui.xemDau.z])}</b>: vùng sáng là chỗ hắn có thể đã tới sau ${Math.max(0, cong.khac - ui.xemDau.k)} khắc (nếu dấu là thật).`;
  luot.innerHTML = chu + (tenXem && !ui.xemDau ? ' ' + tenXem : '');
  chip.innerHTML = chips;
  nut.innerHTML = nuts + `<button type="button" class="bl-moi">${van.cheDo === 'phong' ? 'Phòng' : 'Ván mới'}</button>`;
  const cuoi = van.nhat.slice(-2);
  nhat.hidden = !cuoi.length;
  nhat.innerHTML = cuoi.map(x => `<span class="bl-nk-${x.loai}">${esc(x.chu)}</span>`).join('');
}

function moTin(html, loai) {
  const h = tam.querySelector('.bl-tin'), t = h.querySelector('.bl-tin-trong');
  const cuon = loai && !h.hidden && h.dataset.loai === loai ? t.scrollTop : 0;
  t.innerHTML = html; t.scrollTop = cuon; h.dataset.loai = loai || ''; h.hidden = false;
  tam.classList.add('bl-co-tin');
}
function tatTin() { if (tam) { tam.querySelector('.bl-tin').hidden = true; tam.classList.remove('bl-co-tin'); } }

let manDang = 'chinh';
function moMan(man) {
  manDang = man;
  const l = docLuu(), muc = [0, 1, 2].includes(l.muc) ? l.muc : 1, truoc = l.truoc === 1 ? 1 : 0;
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="bl-chon${bat ? ' bl-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const lui = '<button type="button" class="bl-lui" data-man="chinh">‹ Quay lại</button>';
  let html;
  if (man === 'may') html = `${lui}<p class="bl-tin-nho">Đấu với máy</p><h2>Hai hiệp, đổi vai</h2>
    <p class="bl-nhan">Hiệp đầu bạn làm</p><div class="bl-hang">${nut('🧺 Tay buôn<small>giao 3 kiện rồi trốn ra bến</small>', 0, truoc === 0, 'truoc')}${nut('🎩 Hải quan<small>3 lính, soát 1 chỗ mỗi khắc</small>', 1, truoc === 1, 'truoc')}</div>
    <p class="bl-nhan">Máy chơi</p><div class="bl-hang">${KHO.map((k, i) => nut(k, i, i === muc, 'muc')).join('')}</div>
    <p class="bl-meo">${['Dễ: tay buôn máy đi liều, hải quan máy soát bừa một nửa số lần — để làm quen.', 'Vừa: máy suy ra được bạn có thể ở đâu, nhưng còn soát bừa chừng một phần ba số lần, đi chưa chắc.', 'Khó: máy tính đủ mọi đường bạn có thể đã đi, kể cả khả năng dấu chân là giả; không soát bừa, tay buôn né chỗ bị ngờ.'][muc]}</p>
    <button type="button" class="bl-batdau">Bắt đầu</button>`;
  else {
    manDang = 'chinh';
    html = `<div class="bl-chao">${CHAO}</div><p class="bl-tin-nho">Ván mới</p><h2>Buôn lậu phố cổ</h2>
      <p class="bl-meo">Một người làm tay buôn lẻn qua phố cổ giao 3 kiện hàng rồi trốn ra bến sông; người kia làm hải quan, điều 3 lính lục soát. Hai hiệp đổi vai.</p>
      <button type="button" class="bl-lua" data-man="may"><b>Đấu với máy</b><i>Bạn và máy, mỗi người một hiệp làm tay buôn</i></button>
      ${MANG ? `<button type="button" class="bl-lua" data-man="tao"><b>Tạo phòng, mời bạn</b><i>Mỗi người một máy — 2 người, hay 4 người chia hai phe</i></button>
        <button type="button" class="bl-lua" data-man="vao"><b>Vào phòng của bạn</b><i>Có mã 6 ký tự, hay link bạn gửi</i></button>
        <button type="button" class="bl-lua" data-man="nhanh"><b>Tìm phòng nhanh</b><i>Vào ngay phòng đang thiếu người, không có thì tự tạo phòng mở</i></button>
        <button type="button" class="bl-lua" data-man="tim"><b>Xem phòng đang chờ</b><i>Chọn phòng trong danh sách — không cần mã</i></button>` : ''}
      <button type="button" class="bl-lua" data-man="huong"><b>Cách chơi</b><i>Luật, mẹo, ý nghĩa các dấu trên bản đồ</i></button>
      <button type="button" class="bl-chu bl-tieng">${coTieng ? '🔊 Âm thanh đang bật' : '🔇 Âm thanh đang tắt'}</button>`;
  }
  moTin(html);
}
const CHAO = '<svg viewBox="-70 -40 140 80" aria-hidden="true"><use href="#bl-s-cong" x="-26" y="-34" width="52" height="52"/><circle cx="-46" cy="18" r="13" fill="#f2b84b"/><use href="#bl-s-buon" x="-56" y="8" width="20" height="20"/><circle cx="46" cy="18" r="13" fill="#5aa7f0"/><use href="#bl-s-linh" x="36" y="7" width="20" height="20"/><use href="#bl-s-dau" x="-20" y="22" width="12" height="14" fill="#f2b84b"/><use href="#bl-s-dau" x="-2" y="26" width="12" height="14" fill="#f2b84b" opacity=".6"/></svg>';
function moHuongDan() {
  moTin(`<p class="bl-tin-nho">Cách chơi</p><h2>Buôn lậu phố cổ</h2>
    <p>Bản đồ là nửa đông phố cổ Hà Nội thật (OpenStreetMap): từ Hàng Đào, Hàng Đường ra tới đê Trần Nhật Duật. Mỗi chấm là một ngã phố; nét liền là phố, nét đứt là ngõ.</p>
    <p><b>Tay buôn</b> 🧺 lẻn vào từ một trong bảy cửa ở rìa (bí mật). Mỗi khắc đi <b>một bước</b>, theo phố hay ngõ, không bước vào chỗ có lính. Giao <b>3 kiện</b> ở 3 mối khác nhau (đèn lồng đỏ) rồi tới một <b>bến</b> (thuyền) lên thuyền. Đi tới đâu cũng để lại dấu chân mang số khắc.</p>
    <p><b>Hải quan</b> 🎩 có 3 lính, ai cũng thấy. Mỗi khắc dời mỗi lính <b>tối đa 2 bước theo phố</b> (lính không đi ngõ), rồi <b>lục soát một chỗ</b>: chỗ lính đứng hay sát bên. Trúng chỗ tay buôn đang đứng là <b>bắt được</b>; trúng chỗ hắn từng qua thì hiện <b>dấu chân và số khắc</b> — biết khắc đó hắn đứng đây.</p>
    <p><b>Tin giao hàng</b> lọt ra chậm một khắc: giao ở mối nào, khắc nào, khắc sau ai cũng biết.</p>
    <p><b>Tin đồn</b>: tay buôn có 2 lá. Đầu một khắc rải một <b>dấu chân giả</b> mang số khắc vừa rồi, ở ngã nào cũng được (trừ chỗ có lính, chỗ vừa bị soát). Ai soát trúng sẽ thấy như dấu thật.</p>
    <p><b>Bị vây</b>: tới lượt mà mọi chỗ sát bên đều có lính là bị bắt. <b>Trời sáng</b> sau khắc 18 thì hết hiệp.</p>
    <p><b>Điểm</b>: mỗi kiện giao được 1 điểm, lên thuyền thoát thêm 1. Bị bắt vẫn giữ điểm các kiện đã giao. Hai hiệp đổi vai, ai nhiều điểm hơn thì thắng.</p>
    <p><b>Bốn người</b> (chơi qua mạng): hai tay buôn (mỗi người 2 kiện, 1 tin đồn) đấu hai hải quan (mỗi người 2 lính); cả phe hải quan mỗi khắc chỉ soát một chỗ, hai người thay phiên.</p>
    <p class="bl-meo">Mẹo hải quan: chạm vào một dấu chân để xem từ đó hắn có thể đã tới đâu; nút <b>Gợi ý</b> tô mọi chỗ hắn có thể đang đứng. Mẹo tay buôn: giao hàng lúc lính còn xa, đi ngõ để cắt đuôi, rải dấu giả ở chỗ họ còn tin được.</p>
    <button type="button" class="bl-dongtin">Chơi</button>`);
}
function moTinHetHiep() {
  if (!van) return;
  const kh = van.ketHiep[van.hiep];
  const dong = kh ? kh.dong.map(d => `<p>${esc(d)}</p>`).join('') : '';
  if (van.hiep === 0 && !van.xong) {
    moTin(`<p class="bl-tin-nho">Hết hiệp 1</p><h2>Phe buôn được ${kh.d} điểm</h2>${dong}
      <p class="bl-meo">Trên bản đồ là toàn bộ đường đi của tay buôn (dấu có dấu hỏi là dấu giả). Hiệp 2 đổi vai.</p>
      <button type="button" class="bl-xem-lai">Xem bản đồ</button><button type="button" class="bl-hiep2 bl-chinh">Hiệp 2: đổi vai</button>`);
    return;
  }
  van.xong = true;
  const [a, b] = van.diem, pheMinh = van.cheDo === 'may' ? 0 : pheCua(Math.max(0, van.ghe.findIndex(g => g && g.minh)));
  const tieuDe = a === b ? `Hoà ${a}–${b}` : `${esc(tenPhe(a > b ? 0 : 1))} thắng ${Math.max(a, b)}–${Math.min(a, b)}`;
  const minhThang = (a > b ? 0 : 1) === pheMinh && a !== b;
  moTin(`<p class="bl-tin-nho">Hết trận</p><h2>${tieuDe}</h2>${dong}
    <p>${esc(tenPhe(0))}: ${a} điểm · ${esc(tenPhe(1))}: ${b} điểm.</p>
    <p class="bl-meo">${a === b ? 'Ngang tài ngang sức.' : minhThang ? 'Bạn giao hàng giỏi hơn — hay bắt người giỏi hơn.' : 'Lần sau gỡ lại nhé.'}</p>
    <button type="button" class="bl-xem-lai">Xem bản đồ</button><button type="button" class="bl-lai bl-chinh">Ván mới, như cũ</button><button type="button" class="bl-moi">Đổi cách chơi</button>`);
  if (minhThang) tiengThangThua(true);
}
function moNhatKy() {
  if (!van) return;
  moTin(`<p class="bl-tin-nho">Nhật ký hiệp ${van.hiep + 1}</p><h2>Chuyện đêm nay</h2><div class="bl-nk">${van.nhat.map(x => `<p class="bl-nk-${x.loai}">${esc(x.chu)}</p>`).join('')}</div><button type="button" class="bl-dongtin">Đóng</button>`);
}

/* ---------- bấm ---------- */
function bam(e) {
  const t = e.target, q = (s) => t.closest && t.closest(s);
  let n;
  if (q('.xn-dong')) { dong(); return; }
  if (q('.bl-bao')) { t.hidden = true; return; }
  if (q('.bl-hoi')) { moHuongDan(); return; }
  if ((n = q('[data-man]'))) {
    const m = n.dataset.man;
    if (m === 'huong') { moHuongDan(); return; }
    if (m === 'nhanh') { amThanh(); if (MANG) timNhanh(); return; }
    if (MANG && ['tao', 'vao', 'tim'].includes(m)) { moManMang(m); return; }
    moMan(m); return;
  }
  if ((n = q('[data-truoc]'))) { ghiLuu({ truoc: +n.dataset.truoc }); moMan(manDang); return; }
  if ((n = q('[data-muc]'))) { ghiLuu({ muc: +n.dataset.muc }); moMan(manDang); return; }
  if (q('.bl-batdau')) { amThanh(); const c = docLuu(); vanMoi({ cheDo: 'may', kieu: '1v1', muc: [0, 1, 2].includes(c.muc) ? c.muc : 1, buonTruoc: c.truoc === 1 ? 1 : 0 }); if (!c.h) { ghiLuu({ h: 1 }); } return; }
  if (q('.bl-dongtin')) { tatTin(); if (!van && !(phong && phong.cay && !phong.cay.batDau)) moMan('chinh'); else if (phong && phong.cay && !phong.cay.batDau) veSanh(); return; }
  if (q('.bl-tieng')) { coTieng = !coTieng; ghiLuu({ tieng: coTieng ? 1 : 0 }); if (!coTieng && am) am.suspend(); moMan(manDang); return; }
  if (q('.bl-moi')) { if (van && van.cheDo === 'phong' && phong) moPhongTT(); else moMan('chinh'); return; }
  if (q('.bl-nhat')) { moNhatKy(); return; }
  if (q('.bl-ket')) { if (van && van.cheDo === 'phong') moTinHetHiepPhong(); else moTinHetHiep(); return; }
  if (q('.bl-xem-lai')) { tatTin(); return; }
  if (q('.bl-hiep2')) { if (van && van.cheDo === 'phong') sangHiepPhong(); else sangHiepSau(); return; }
  if (q('.bl-lai')) { if (van && van.cheDo === 'phong') vanNua(); else if (van) vanMoi({ cheDo: 'may', kieu: van.kieu, muc: van.muc, buonTruoc: van.buonTruoc }); return; }
  if (MANG && bamMang(t, q)) return;
  if (!van || !van.h) return;
  if ((n = q('[data-chip]'))) { if (n.dataset.chip === 'giao') ui.giao = !ui.giao; else ui.thoat = !ui.thoat; capNhatChu(); return; }
  if (q('.bl-gia')) { if (ui.gia >= 0 && !ui.dangGia) { ui.gia = -1; } else ui.dangGia = !ui.dangGia; capNhatChu(); veDong(); return; }
  if (q('.bl-di')) { xongTB(); return; }
  if (q('.bl-dat-lai')) { ui.linhMoi = van.h.cong.linh.slice(); ui.linhChon = van.h.cong.ch.chu.indexOf(ui.hq); capNhatChu(); veDong(); return; }
  if (q('.bl-toi-soat')) { ui.buocHQ = 'soat'; capNhatChu(); veDong(); return; }
  if (q('.bl-lui-linh')) { ui.buocHQ = 'linh'; ui.soat = -1; capNhatChu(); veDong(); return; }
  if (q('.bl-soat')) { xongHQ(); return; }
  if (q('.bl-nghi-nut')) { ui.nghi = !ui.nghi; ghiLuu({ nghi: ui.nghi ? 1 : 0 }); capNhatChu(); veDong(); return; }
}

/* ======================================================================================================
   ÂM THANH (Web Audio, tạo bằng toán): bước chân, còi soát, thấy dấu, bắt được, chuông giao hàng, tù và thuyền, mõ canh
   ====================================================================================================== */
function amThanh() {
  if (!coTieng || typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') return null;
  try { if (!am) am = new (self.AudioContext || self.webkitAudioContext)(); if (am.state === 'suspended') am.resume(); } catch (e) { am = null; }
  return am;
}
function not(f, luc, lau, to, kieu = 'sine', f2) {
  const o = am.createOscillator(), g = am.createGain();
  o.type = kieu; o.frequency.setValueAtTime(f, luc); if (f2) o.frequency.exponentialRampToValueAtTime(f2, luc + lau);
  g.gain.setValueAtTime(0.0001, luc); g.gain.exponentialRampToValueAtTime(to, luc + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, luc + lau);
  o.connect(g); g.connect(am.destination); o.start(luc); o.stop(luc + lau + 0.02);
}
const tieng = (f) => () => { if (!amThanh()) return; try { f(am.currentTime + 0.01); } catch (e) {} };
const tiengBuoc = tieng(t => { not(180, t, 0.07, 0.05, 'triangle', 120); });
const tiengSoat = tieng(t => { not(1400, t, 0.12, 0.04, 'sine', 1900); not(1900, t + 0.13, 0.16, 0.035, 'sine', 1500); });
const tiengDau = tieng(t => { not(330, t, 0.22, 0.07, 'triangle'); not(247, t + 0.18, 0.32, 0.07, 'triangle'); });
const tiengBat = tieng(t => { not(98, t, 1.6, 0.18, 'sine'); not(196, t, 0.9, 0.06, 'triangle'); not(147, t + 0.05, 1.2, 0.05, 'sine'); });
const tiengGiao = tieng(t => { not(1318.5, t, 0.5, 0.05); not(1975.5, t + 0.08, 0.6, 0.035); });
const tiengTin = tieng(t => { not(880, t, 0.35, 0.04); not(1174.7, t + 0.12, 0.45, 0.035); });
const tiengThuyen = tieng(t => { not(110, t, 1.1, 0.09, 'sawtooth', 104); not(165, t + 0.02, 1.0, 0.04, 'sine'); });
const tiengCanh = tieng(t => { not(620, t, 0.06, 0.08, 'triangle', 420); not(620, t + 0.22, 0.06, 0.08, 'triangle', 420); });
const tiengToiLuot = tieng(t => { not(659.25, t, 0.14, 0.04); not(987.77, t + 0.12, 0.22, 0.04); if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30); });
const tiengHet = tieng(t => { [523.25, 659.25, 783.99].forEach((f, k) => not(f, t + k * 0.12, 0.5, 0.06, 'triangle')); });
function tiengThangThua(thang) { if (!amThanh()) return; const t = am.currentTime + 0.02; (thang ? [523.25, 659.25, 783.99, 1046.5] : [392, 349.23, 329.63]).forEach((f, k) => not(f, t + k * 0.12, 0.5, 0.08, 'triangle')); }

/* ======================================================================================================
   KHUNG, MỞ, ĐÓNG
   ====================================================================================================== */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'buonlau';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="bl-dau">
      <p class="bl-ten"><b>Buôn lậu phố cổ</b><span></span></p>
      <button class="bl-hoi" type="button" aria-label="Cách chơi">?</button>
    </div>
    <div class="bl-nguoi"></div>
    <div class="bl-dem" aria-hidden="true"><i></i></div>
    <div class="bl-canh">
      <svg class="bl-ban" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Bản đồ nửa đông phố cổ Hà Nội: chạm vào ngã phố để đi, dời lính hay lục soát">${veBanTinh()}</svg>
      <p class="bl-bao" hidden></p>
    </div>
    <div class="bl-duoi">
      <p class="bl-luot" aria-live="polite"></p>
      <div class="bl-chip"></div>
      <div class="bl-nut"></div>
      <button class="bl-nhat" type="button" hidden aria-label="Mở nhật ký"></button>
    </div>
    <div class="bl-tin" hidden><div class="bl-tin-trong"></div></div>`;
  document.body.appendChild(tam);
  banEl = tam.querySelector('.bl-ban');
  dongEl = banEl.querySelector('.bl-dong');
  tam.addEventListener('click', bam);
  banEl.addEventListener('pointerdown', (e) => { if (e.button === 0 || e.pointerType !== 'mouse') chamBan(e); });
  tam.addEventListener('input', (e) => { if (MANG) nhapMang(e); });
  tam.addEventListener('keydown', (e) => { if (MANG && e.key === 'Enter') phimMang(e); });
  addEventListener('keydown', (e) => {
    if (!tam || !tam.classList.contains('hien')) return;
    if (e.key === 'Escape') { if (!tam.querySelector('.bl-tin').hidden && van) tatTin(); else dong(); }
  });
  if (MANG) {
    document.addEventListener('visibilitychange', () => { if (!document.hidden && phong) { phong.nhipCuoi = 0; kiemPhong(); } });
    addEventListener('hashchange', theoMaTrenDiaChi);
  }
}
function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  taoTho();
  const l = docLuu();
  coTieng = l.tieng !== 0;
  if (!ui) ui = { che: '', chon: -1, gia: -1, linhChon: -1, linhMoi: null, soat: -1, xem: -1, lo: false };
  ui.nghi = l.nghi === 1;
  if (MANG && moPhongLucMo()) { capNhatChu(); veDong(); return; }
  if (!van) {
    if (!l.h) { ghiLuu({ h: 1 }); moHuongDan(); } else moMan('chinh');
  }
  capNhatChu(); veDong();
}
function dong() {
  if (MANG) dongMang();
  if (tam) tam.classList.remove('hien');
  if (am && am.state === 'running') am.suspend();
  if (typeof document !== 'undefined') document.body.classList.remove('khoa-cuon');
}

/* ======================================================================================================
   CHƠI QUA MẠNG — như Cờ vua ba người, Bida lỗ: mỗi người một máy, vào chung phòng bằng link, mã QR hay mã 6 ký tự
   (assets/phong.js nói chuyện với Firebase; luật ở firebase-rules.json, nhánh buonlau và sanhbuonlau). Khác hai trò kia
   ở chỗ có bí mật: chỗ tay buôn đứng không bao giờ lên máy chủ khi hiệp còn chơi — ai có mã phòng cũng đọc được phòng,
   nên ghi lên là lộ. Máy chủ chỉ giữ:
   - nuoc/<n>: nước đi công khai theo thứ tự — tay buôn: { l:'tb', k, c } với c là mã cam kết (16 chữ số đầu của SHA-256
     của muối bí mật, hiệp, khắc, chỗ đứng, dấu giả, có giao hàng không), t: bến nếu lên thuyền, v: 1 nếu bị vây, b: 1 nếu
     bỏ cuộc; hải quan: { l:'hq', k, o: chỗ mọi lính, s: chỗ soát hay −1 };
   - dap/<hiệp>-<khắc>-<i>: máy của tay buôn i tự trả lời lần soát của khắc đó (b bắt, t trống, số là dấu chân khắc đó; g:
     mối vừa giao ở khắc trước, vì tin giao hàng lộ chậm một khắc) — mỗi chỗ ghi một lần, người khác ghi trước (x: bỏ cuộc,
     khi tay buôn vắng quá lâu) thì thôi;
   - mo/<hiệp>-<i>: hết hiệp thì lộ hết (muối, đường đi, dấu giả, các lần giao), mọi máy tính lại từng mã cam kết, từng câu
     trả lời — sai một chỗ là báo "không khớp" và hiệp đó tay buôn ấy 0 điểm.
   Máy nào cũng đọc lần lượt từ đầu và tự dựng lại cả trận bằng chính lõi luật. Bí mật của mình (và của máy mình chạy giùm)
   cất trong tdtd.buonlau để tải lại trang vẫn chơi tiếp; hết trận thì xoá.
   ====================================================================================================== */
const MANG = self.TDTD_PHONG || null;
let phong = null;
const VANG = 60000, NHIP = 20000, VANG_TB = 120000;
const gheCua = (P) => (phong && phong.cay && phong.cay.ghe ? phong.cay.ghe[P] : null);
const mayCua = (P) => !!(phong && phong.cay && phong.cay.may && phong.cay.may[P]);
const gioMay = () => Date.now() + (phong ? phong.lech : 0);
const kieuPhong = (cay) => (cay && cay.kieu === '2v2' ? '2v2' : '1v1');
const soGhePhong = () => (phong && phong.cay && phong.cay.kieu === '2v2' ? 4 : 2);
const cacGhe = () => Array.from({ length: soGhePhong() }, (_, P) => P);
function conO(P) { const g = gheCua(P); return !!g && (P === phong.P || (!!g.thay && gioMay() - g.thay < VANG)); }
const mayPhong = (P) => !!phong && (mayCua(P) || !gheCua(P));
const tenMinhLuu = () => String(docLuu().ten || '').trim().slice(0, 20);
/* thư mục app: index.html gắn thẻ <base> về đó (trò khác có thể đổi thanh địa chỉ sang trang riêng của nó) */
const gocApp = () => { try { if (typeof document !== 'undefined' && document.baseURI) return new URL('.', document.baseURI).href; } catch (e) {} return location.origin + location.pathname.replace(/[^/]*$/, ''); };
const linkMoi = (ma) => gocApp() + 'buon-lau-pho-co/?phong=' + ma;
/* Mã phòng trên địa chỉ: …/buon-lau-pho-co/?phong=MÃ, chép thanh địa chỉ là ra đúng link mời (người dùng: "các trò chơi
   bạn xóa # hết đi, để copy có ghi chú"). app.js đổi #buon-lau/MÃ của link cũ, của trang riêng chuyển vào, thành
   ?phong=MÃ trước khi mở trò; #buon-lau/MÃ vẫn đọc được, có cả hai thì # là cái mới gõ vào. */
const MA_DIA_CHI = /^#buon-lau\/([A-HJ-NP-Z2-9]{6})$/, MA_TIM = /[?&]phong=([A-HJ-NP-Z2-9]{6})(?:&|$)/;
const maTrenDiaChi = () => (typeof location === 'undefined' ? null : MA_DIA_CHI.exec(location.hash || '') || MA_TIM.exec(location.search || ''));
function datDiaChi(ma) {                           // đổi ?phong, phần ?… còn lại (?tro, ?ngay) để y nguyên
  try {
    const q = (location.search || '').replace(/[?&]phong=[^&]*/g, '').replace(/^&/, '?');
    history.replaceState(history.state, '', location.pathname + (ma ? (q ? q + '&' : '?') + 'phong=' + ma : q));
  } catch (e) {}
}

/* ---------- SHA-256 (đồng bộ, tự viết theo FIPS 180-4 — crypto.subtle thì chỉ có kiểu bất đồng bộ) ---------- */
const K256 = (() => {
  const k = []; let n = 2;
  while (k.length < 64) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) k.push((Math.cbrt(n) % 1) * 4294967296 >>> 0); n++; }
  return k;
})();
function sha256(chu) {
  const b = typeof TextEncoder !== 'undefined' ? Array.from(new TextEncoder().encode(chu)) : Array.from(unescape(encodeURIComponent(chu)), c => c.charCodeAt(0));
  const l = b.length * 8;
  b.push(0x80); while (b.length % 64 !== 56) b.push(0);
  for (let i = 7; i >= 0; i--) b.push(i >= 4 ? 0 : (l >>> (i * 8)) & 255);
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], w = new Array(64);
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < b.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + w[i]) | 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
const camKet = (muoi, h, i, t, p0, p, gia, giao) => sha256(`${muoi}|${h}|${i}|${t}|${t === 1 ? p0 + '>' : ''}${p}|${gia}|${giao ? 1 : 0}`).slice(0, 16);
const muoiMoi = () => MANG.idMoi() + MANG.idMoi();

/* ---------- bí mật mình giữ: phong.bm['h-i'] = { kin, muoi } ---------- */
function bmCat(x) { return { muoi: x.muoi, i: x.kin.i, o: x.kin.o, duong: x.kin.duong, dau: Array.from(x.kin.dau), gia: Array.from(x.kin.gia), giaDung: x.kin.giaDung, tinDon: x.kin.tinDon, giao: x.kin.giao, ke: x.kin.ke }; }
function bmMo(c) {
  const kin = { i: c.i, o: c.o, duong: c.duong.slice(), dau: Int16Array.from(c.dau), gia: Uint8Array.from(c.gia), giaDung: c.giaDung || [], tinDon: c.tinDon, giao: c.giao || [], giaoKhac: -1, ke: c.ke || null };
  return { kin, muoi: c.muoi };
}
function luuBiMat() {
  if (!phong) return;
  const ds = {}; for (const k of Object.keys(phong.bm)) ds[k] = bmCat(phong.bm[k]);
  ghiLuu({ bm: { ma: phong.ma, ds } });
}
function docBiMat(ma) {
  const b = docLuu().bm, ra = {};
  if (b && b.ma === ma && b.ds) for (const k of Object.keys(b.ds)) { try { ra[k] = bmMo(b.ds[k]); } catch (e) {} }
  return ra;
}
const chepKin = (k) => bmMo(bmCat({ muoi: '', kin: k })).kin;

/* ---------- tạo, vào, rời phòng ---------- */
async function taoPhong(ch) {
  if (!MANG) return false;
  const id = MANG.idMoi(), ten = ch.ten || 'Người 1';
  moTin('<p class="bl-tin-nho">Chơi qua mạng</p><h2>Đang tạo phòng…</h2>');
  for (let lan = 0; lan < 4; lan++) {
    const ma = ch.ma || MANG.maMoi();
    const r = await MANG.goi(`buonlau/${ma}`, 'PUT', { tao: MANG.GIO, chu: 0, kieu: ch.kieu, kho: ch.kho, truoc: ch.truoc ? 1 : 0, ghe: { 0: { id, ten, thay: MANG.GIO } } });
    if (r.ok) { vaoPhong(ma, { id, P: 0, mo: !!ch.mo }); return true; }
    if (r.ma !== 401 || ch.ma) break;
  }
  moTin('<p class="bl-tin-nho">Chơi qua mạng</p><h2>Chưa tạo được phòng</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="bl-moi">Quay lại</button>');
  return false;
}
function vaoPhong(ma, minh, muonNgoi = -1, tuMo = false) {
  if (!MANG || !MANG.laMa(ma)) return;
  const cu = docLuu().cu;
  if (!minh && cu && cu.ma === ma) minh = { id: cu.id, P: cu.P };
  dungLuong();
  boViec(); dungHoat();
  if (van && van.cheDo === 'phong') van = null;
  const daLuu = docLuu().phong, mo = minh ? (minh.mo !== undefined ? !!minh.mo : !!(daLuu && daLuu.ma === ma && daLuu.id === minh.id && daLuu.mo)) : false;
  phong = { ma, id: minh ? minh.id : MANG.idMoi(), P: minh ? minh.P : -1, cay: undefined, lech: 0, nhipCuoi: 0, muonNgoi, tuMo, choTiep: 0, sanhCu: '',
    mo, daDang: false, sanhKhoa: '', tuSanh: false, qr: false, bm: docBiMat(ma), daGui: new Set(), song: false, daAp: 0, kiemMo: {}, ganLuot: 0, luotCu: '' };
  if (phong.P >= 0) ghiLuu({ phong: { ma, id: phong.id, P: phong.P, mo: phong.mo || undefined } });
  datDiaChi(ma);
  noiPhong();
  if (!tuMo) moTin(`<p class="bl-tin-nho">Phòng ${ma}</p><h2>Đang vào phòng…</h2>`);
}
function noiPhong() {
  if (!phong || phong.luong) return;
  phong.luong = MANG.nghe(`buonlau/${phong.ma}`, khiPhongDoi, () => { if (phong) { phong.rot = true; capNhatChu(); } });
  phong.kiem = setInterval(kiemPhong, 5000);
}
function dungLuong() {
  if (!phong) return;
  if (phong.luong) { phong.luong.dung(); phong.luong = null; }
  if (phong.kiem) { clearInterval(phong.kiem); phong.kiem = 0; }
}
function roiPhong() {
  if (!phong) return;
  const cay = phong.cay, ma = phong.ma;
  dungLuong();
  if (phong.daDang) MANG.goi(`sanhbuonlau/${ma}`, 'DELETE');
  if (cay && cay.xong && gioMay() - cay.xong > 300000) MANG.goi(`buonlau/${ma}`, 'DELETE');
  const cu = cay && !cay.xong && phong.P >= 0 ? { ma, id: phong.id, P: phong.P } : undefined;
  phong = null;
  ghiLuu({ phong: undefined, cu, bm: cay && cay.xong ? undefined : docLuu().bm });
  if (van && van.cheDo === 'phong') { boViec(); dungHoat(); van = null; }
  datDiaChi('');
  capNhatChu(); veDong();
}
function khiPhongDoi(cay) {
  if (!phong) return;
  const truoc = phong.cay;
  phong.cay = cay; phong.rot = false;
  if (cay == null) {
    if (phong.choTiep && Date.now() - phong.choTiep < 20000) return;
    const ma = phong.ma, tuMo = phong.tuMo;
    roiPhong();
    if (tuMo) moMan('chinh');
    else moTin(`<p class="bl-tin-nho">Phòng ${ma}</p><h2>Không thấy phòng này</h2><p>Mã sai, hoặc phòng đã đóng sau khi chơi xong.</p><button type="button" class="bl-moi">Quay lại</button>`);
    return;
  }
  phong.choTiep = 0;
  const g = gheCua(phong.P), gCu = truoc && truoc.ghe && truoc.ghe[phong.P];
  if (phong.P >= 0 && g && g.id === phong.id && g.thay && !(gCu && gCu.thay === g.thay)) phong.lech = g.thay - Date.now();
  if (phong.P >= 0 && g && g.id !== phong.id) { phong.P = -1; ghiLuu({ phong: undefined }); bao('Ghế đó vừa có người khác ngồi trước.'); }
  if ((cay.tao && gioMay() - cay.tao > 86400000) || (phong.tuMo && cay.xong)) {
    const tuMo = phong.tuMo;
    if (cay.tao && gioMay() - cay.tao > 86400000) MANG.goi(`buonlau/${phong.ma}`, 'DELETE');
    roiPhong();
    if (tuMo) moMan('chinh'); else moTin('<p class="bl-tin-nho">Chơi qua mạng</p><h2>Phòng này đã đóng</h2><p>Phòng chỉ giữ trong một ngày.</p><button type="button" class="bl-moi">Quay lại</button>');
    return;
  }
  phong.tuMo = false;
  capNhatSanh();
  if (!cay.batDau) { veSanh(); return; }
  chayPhong();
}

/* ---------- phòng chờ ---------- */
const vaiGhe = (cay, P) => {
  const phe = kieuPhong(cay) === '2v2' ? (P < 2 ? 0 : 1) : P, buonDau = (cay.truoc ? 1 : 0) === 0 ? 0 : 1;
  return phe === buonDau ? 'tay buôn hiệp đầu' : 'hải quan hiệp đầu';
};
function hangGhe(cay, minh, trongVan) {
  return `<div class="bl-ghe-hang bl-ghe-${soGhePhong()}">` + cacGhe().map(P => {
    const g = gheCua(P), may = trongVan && mayPhong(P);
    const ten = may && !g ? 'Máy' : g ? esc(P === minh ? 'Bạn' : (g.ten || `Người ${P + 1}`)) : 'Chờ bạn';
    const phu = [`Ghế ${P + 1}`, vaiGhe(cay, P), may ? 'máy chơi' : '', g && P === cay.chu && !may ? 'chủ phòng' : '', g && !may && !conO(P) ? 'vắng' : '', !g && !may ? 'ghế trống' : ''].filter(Boolean).join(' · ');
    return `<div class="bl-ghe-o${g || may ? '' : ' bl-ghe-trong'}${P === minh ? ' bl-ghe-minh' : ''}"><b>${ten}</b><small>${phu}</small></div>`;
  }).join('') + '</div>';
}
const kieuChu = (cay) => (kieuPhong(cay) === '2v2' ? '4 người, hai phe' : '2 người');
const dongMa = () => `<div class="bl-ma-dong"><span class="bl-ma-to">${phong.ma}</span><button type="button" class="bl-chep-ma">Chép mã</button></div>`;
const khungQR = () => (phong.qr && self.TDTD_MAQR ? `<div class="bl-qr">${self.TDTD_MAQR.svg(linkMoi(phong.ma))}</div><p class="bl-meo">Bạn ngồi cạnh mở camera điện thoại, quét mã này là vào phòng.</p>` : '');
const nutQR = () => (self.TDTD_MAQR ? `<button type="button" class="bl-qr-bat">${phong.qr ? 'Ẩn mã QR' : 'Hiện mã QR cho bạn ngồi cạnh'}</button>` : '');
const coChiaSe = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
function nutMoiBan(nhanGui, nhanChep, chinh) {
  return coChiaSe()
    ? `<div class="bl-hai"><button type="button" class="${chinh ? 'bl-chinh ' : ''}bl-moi-ban">${nhanGui}</button><button type="button" class="bl-chep-link">Chép link</button></div>`
    : `<button type="button" class="${chinh ? 'bl-chinh ' : ''}bl-chep-link">${nhanChep}</button>`;
}
function veSanh() {
  const cay = phong.cay, minh = phong.P, chu = cay.chu;
  if (minh < 0 && phong.muonNgoi >= 0 && !gheCua(phong.muonNgoi)) { const P = phong.muonNgoi; phong.muonNgoi = -1; ngoiGhe(P); }
  const trong = cacGhe().filter(P => !gheCua(P)), ban_ = cacGhe().filter(P => gheCua(P) && P !== minh).length;
  const tenChu = gheCua(chu) ? esc(gheCua(chu).ten || `Người ${chu + 1}`) : 'Bạn bè';
  let html;
  if (minh < 0) {
    html = `<p class="bl-tin-nho">${phong.tuSanh ? 'Phòng mở' : 'Lời mời'} · ${kieuChu(cay)}</p><h2>${phong.tuSanh ? `Phòng của ${tenChu}` : `${tenChu} mời bạn chơi Buôn lậu phố cổ`}</h2>${hangGhe(cay, minh)}
      ${trong.length ? `<p class="bl-nhan">Tên của bạn</p><input class="bl-o-ten" maxlength="20" value="${esc(tenMinhLuu())}" placeholder="Để trống thì gọi theo số ghế" autocomplete="nickname">
      <p class="bl-nhan">Chọn ghế để vào chơi</p>${trong.map(P => `<button type="button" class="bl-vaochoi" data-ngoi="${P}">Vào ghế ${P + 1} — ${vaiGhe(cay, P)}</button>`).join('')}`
      : '<p class="bl-meo">Phòng đã đủ người. Bạn vẫn ở đây xem ván khi bắt đầu (chỉ thấy những gì hải quan thấy).</p>'}
      <p class="bl-meo">Phòng ${phong.ma}</p>
      <button type="button" class="bl-chu bl-roi">Không vào nữa</button>`;
  } else {
    const laChu = minh === chu, chuVang = !laChu && !conO(chu), batDauChinh = laChu && ban_ > 0;
    const nutBatDau = laChu || chuVang ? `<button type="button" class="${batDauChinh ? 'bl-chinh ' : ''}bl-batdau-phong">Bắt đầu${trong.length ? ` — máy chơi thay ${trong.length} ghế trống` : ''}</button>` : '';
    const nutMoi = trong.length ? nutMoiBan(laChu ? 'Gửi link mời' : 'Mời thêm bạn', 'Chép link mời', laChu && !ban_) + nutQR() + khungQR() : '';
    const loi = !laChu ? (chuVang ? `${tenChu} đang vắng. Muốn chơi luôn thì bấm Bắt đầu, khỏi chờ.` : `Chờ ${tenChu} bấm Bắt đầu…`)
      : !trong.length ? 'Đủ người rồi.'
      : `${ban_ ? `${ban_} bạn đã vào, còn ${trong.length} ghế trống. ` : 'Chưa ai vào. '}${phong.mo ? 'Phòng đang mở cho mọi người: ai bấm "Tìm phòng nhanh" hay "Xem phòng đang chờ" cũng vào được.' : 'Bạn bè mở link, quét mã QR, hay nhập mã ở mục "Vào phòng của bạn".'}`;
    const nutMo = laChu && trong.length ? `<button type="button" class="bl-chu bl-doi-mo">${phong.mo ? 'Thôi cho người lạ vào' : 'Cho người lạ tìm thấy phòng này'}</button>` : '';
    html = `<p class="bl-tin-nho">${phong.mo || phong.tuSanh ? 'Phòng mở' : 'Phòng chờ'} · ${kieuChu(cay)}</p>${dongMa()}${hangGhe(cay, minh)}
      <p class="bl-meo">${loi}</p>
      ${batDauChinh ? nutBatDau + nutMoi : nutMoi + nutBatDau}
      ${nutMo}
      <button type="button" class="bl-chu bl-roi">Rời phòng</button>`;
  }
  if (html !== phong.sanhCu || tam.querySelector('.bl-tin').hidden) { phong.sanhCu = html; moTin(html, 'sanh'); }
}
/* phòng mở: dòng ngắn trong sanhbuonlau/<mã> cho người tìm phòng */
function capNhatSanh(ep) {
  if (!phong || !phong.cay || phong.P < 0 || phong.P !== phong.cay.chu) return;
  const cay = phong.cay, trong = cacGhe().filter(P => !gheCua(P)).length, can = phong.mo && !cay.batDau && trong > 0, ma = phong.ma;
  if (!can) { if (phong.daDang) { phong.daDang = false; phong.sanhKhoa = ''; MANG.goi(`sanhbuonlau/${ma}`, 'DELETE'); } return; }
  const g = gheCua(cay.chu), dong_ = { ten: String((g && g.ten) || `Người ${cay.chu + 1}`).slice(0, 20), trong, kieu: kieuPhong(cay), thay: MANG.GIO };
  const khoa = `${dong_.ten}|${trong}`;
  if (!ep && phong.daDang && khoa === phong.sanhKhoa) return;
  phong.daDang = true; phong.sanhKhoa = khoa;
  MANG.goi(`sanhbuonlau/${ma}`, 'PATCH', dong_).then(r => {
    if (!r.ok && r.ma === 401 && phong && phong.ma === ma && phong.daDang) MANG.goi(`sanhbuonlau/${ma}`, 'PUT', Object.assign({ tao: MANG.GIO }, dong_));
  });
}
function doiPhongMo() {
  if (!phong || !phong.cay || phong.P !== phong.cay.chu) return;
  phong.mo = !phong.mo;
  ghiLuu({ phong: { ma: phong.ma, id: phong.id, P: phong.P, mo: phong.mo || undefined } });
  capNhatSanh(true);
  bao(phong.mo ? 'Phòng đã mở cho mọi người — ai tìm phòng cũng vào được.' : 'Phòng thôi hiện cho người lạ; bạn bè vẫn vào bằng link, mã.');
  veSanh();
}
let timPhong = null;
function batTimPhong() { if (timPhong) return; timPhong = { ds: [], xong: false, loi: false, hen: setInterval(taiDsPhong, 4000) }; taiDsPhong(); }
function tatTimPhong() { if (timPhong) { clearInterval(timPhong.hen); timPhong = null; } }
async function taiDsPhong() {
  if (!timPhong || !MANG) return;
  const r = await MANG.goi('sanhbuonlau', 'GET');
  if (!timPhong) return;
  if (manDang !== 'tim' || !tam || tam.querySelector('.bl-tin').hidden) { tatTimPhong(); return; }
  Object.assign(timPhong, { ds: locPhongMo(r.ok && r.du).sort((a, b) => b.tao - a.tao), xong: true, loi: !r.ok });
  const k = tam.querySelector('.bl-tin .bl-ds-phong');
  if (k) k.innerHTML = dsPhongHtml();
}
function locPhongMo(du) {
  const nay = Date.now(), ds = [];
  for (const [ma, d] of Object.entries((du && typeof du === 'object' && du) || {})) {
    if (!MANG.laMa(ma) || !d || typeof d.thay !== 'number') continue;
    if (nay - d.thay > 600000) { MANG.goi(`sanhbuonlau/${ma}`, 'DELETE'); continue; }
    if (nay - d.thay > 90000 || !(d.trong >= 1)) continue;
    ds.push({ ma, ten: String(d.ten || 'Ai đó').slice(0, 20), trong: Math.min(3, d.trong), kieu: d.kieu === '2v2' ? '2v2' : '1v1', tao: typeof d.tao === 'number' ? d.tao : d.thay, thay: d.thay });
  }
  return ds;
}
function dsPhongHtml() {
  if (!timPhong || !timPhong.xong) return '<p class="bl-meo">Đang tìm phòng…</p>';
  if (timPhong.loi) return '<p class="bl-meo">Chưa tải được danh sách — kiểm tra mạng, máy tự thử lại.</p>';
  if (!timPhong.ds.length) return '<p class="bl-meo">Chưa có phòng nào đang chờ. Tạo một phòng mở để người khác vào chơi cùng.</p>';
  const tuoi = (t) => { const p = Math.floor((Date.now() - t) / 60000); return p < 1 ? 'vừa tạo' : `${p} phút trước`; };
  return timPhong.ds.map(d => `<button type="button" class="bl-lua" data-phongmo="${d.ma}"><b>Phòng của ${esc(d.ten)}</b><i>${d.kieu === '2v2' ? '4 người' : '2 người'} · còn ${d.trong} ghế · ${tuoi(d.tao)}</i></button>`).join('');
}
async function timNhanh() {
  if (!MANG) return;
  tatTimPhong();
  const o = tam && tam.querySelector('.bl-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  moTin('<p class="bl-tin-nho">Tìm phòng nhanh</p><h2>Đang tìm phòng…</h2>');
  const r = await MANG.goi('sanhbuonlau', 'GET');
  if (!r.ok) { moTin('<p class="bl-tin-nho">Tìm phòng nhanh</p><h2>Chưa tìm được</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="bl-moi">Quay lại</button>'); return; }
  for (const d of locPhongMo(r.du).sort((a, b) => a.trong - b.trong || b.thay - a.thay).slice(0, 4)) {
    const p = await MANG.goi(`buonlau/${d.ma}`, 'GET'), cay = p.ok ? MANG.chuan(p.du) : null;
    if (!cay || cay.batDau) continue;
    const so = kieuPhong(cay) === '2v2' ? 4 : 2, P = Array.from({ length: so }, (_, Q) => Q).find(Q => !(cay.ghe && cay.ghe[Q]));
    if (P === undefined) continue;
    const id = MANG.idMoi(), g = await MANG.goi(`buonlau/${d.ma}/ghe/${P}`, 'PATCH', { id, ten: tenMinhLuu() || `Người ${P + 1}`, thay: MANG.GIO });
    if (!g.ok) continue;
    vaoPhong(d.ma, { id, P });
    if (phong && phong.ma === d.ma) phong.tuSanh = true;
    return;
  }
  const c = docLuu();
  await taoPhong(Object.assign(cauHinhTao(c), { mo: true }));
  if (phong && phong.mo) bao('Chưa có phòng nào đang chờ — đã tạo phòng mở, chờ người vào.');
}
const cauHinhTao = (c) => ({ kieu: c.kieuPhong === '2v2' ? '2v2' : '1v1', kho: [0, 1, 2].includes(c.kho) ? c.kho : 1, ten: tenMinhLuu(), truoc: c.truocPhong === 1 ? 1 : 0 });
function vaoPhongMo(ma) {
  if (!MANG || !MANG.laMa(ma)) return;
  tatTimPhong();
  const t = tam && tam.querySelector('.bl-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  vaoPhong(ma);
  if (phong && phong.ma === ma) phong.tuSanh = true;
}
async function ngoiGhe(P) {
  if (!phong || phong.P >= 0) return;
  const o = tam && tam.querySelector('.bl-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  const r = await MANG.goi(`buonlau/${phong.ma}/ghe/${P}`, 'PATCH', { id: phong.id, ten: tenMinhLuu() || `Người ${P + 1}`, thay: MANG.GIO });
  if (!phong) return;
  if (r.ok) {
    phong.P = P; phong.nhipCuoi = Date.now();
    ghiLuu({ phong: { ma: phong.ma, id: phong.id, P } });
    if (phong.cay) khiPhongDoi(phong.cay);
  } else bao(r.ma === 401 ? (phong.cay && phong.cay.batDau ? 'Ván đã bắt đầu, không vào ghế được nữa.' : 'Ghế này vừa có người ngồi.') : 'Mất mạng, chưa vào được ghế.');
}
async function batDauPhong() {
  if (!phong || !phong.cay || phong.cay.batDau) return;
  const them_ = { batDau: MANG.GIO };
  for (const P of cacGhe()) if (!gheCua(P)) them_['may/' + P] = true;
  const r = await MANG.goi(`buonlau/${phong.ma}`, 'PATCH', them_);
  if (!r.ok && r.ma !== 401) bao('Mất mạng, chưa bắt đầu được.');
}

/* ---------- dựng lại trận từ danh sách nước đi ----------
   Mỗi lần máy chủ báo tin là dựng lại từ đầu (một trận chỉ chừng trăm nước, lõi tính rất nhanh): hai hiệp, mỗi hiệp một
   cong mới; nước sai lượt, sai luật thì máy nào cũng bỏ qua như nhau; tới lần soát mà còn thiếu câu trả lời của tay buôn
   nào thì dừng, chờ. Trả về chỗ đang dừng (ai cần làm gì). */
const dsNuoc = (cay) => { const o = (cay && cay.nuoc) || {}, ds = []; for (let n = 0; o[n]; n++) ds.push(o[n]); return ds; };
const khoaDap = (h, k, i) => `${h}-${k}-${i}`;
function docDap(x) {
  if (!x || typeof x !== 'object') return null;
  const g = typeof x.g === 'number' && x.g >= 0 && x.g < N ? x.g : -1;
  if (x.r === 'b') return { loai: 'bat', g };
  if (x.r === 't') return { loai: 'trong', g };
  if (x.r === 'x') return { loai: 'bo', g };
  if (typeof x.r === 'number' && x.r >= 0 && x.r < 40) return { loai: 'dau', dau: x.r, g };
  return null;
}
function dungVanPhong() {
  const cay = phong.cay, kieu = kieuPhong(cay), ch = L.cauHinh(kieu);
  const ghe = cacGhe().map(P => {
    const g = gheCua(P);
    return { minh: P === phong.P, may: mayPhong(P), ten: g ? (g.ten || `Người ${P + 1}`) : `Máy ${P + 1}`, muc: [0, 1, 2].includes(cay.kho) ? cay.kho : 1 };
  });
  const v = { cheDo: 'phong', kieu, muc: cay.kho || 1, buonTruoc: cay.truoc ? 1 : 0, hiep: 0, diem: [0, 0], khacXong: [0, 0], ketHiep: [], ghe, h: null, nhat: [], xong: false, hieps: [] };
  const ds = dsNuoc(cay), dap = cay.dap || {};
  let n = 0, cho = null;
  const vanCu = van; van = v;                                     // các hàm gheTB/tenGhe… đọc van
  for (let h = 0; h < 2; h++) {
    v.hiep = h;
    const cong = L.congMoi(ch), gDap = {};
    const hiep = { cong, chung: [] };
    v.hieps[h] = hiep;
    v.h = { cong, kin: [], vao: [] };
    them(`Hiệp ${h + 1}: ${tenPhe(pheBuon(h))} làm tay buôn, ${tenPhe(1 - pheBuon(h))} làm hải quan.`);
    for (; !cong.xong && cong.luot;) {
      const l = cong.luot;
      if (l.ai === 'het') {
        const t = cong.khac, giao = cong.tb.map((_, i) => (gDap[t] && gDap[t][i] !== undefined ? gDap[t][i] : -1));
        L.hetKhac(cong, giao);
        giao.forEach((m, i) => { if (m >= 0) them(`Có tin: khắc ${t - (ch.tre || 0)}, ${ch.soTB > 1 ? tenTB(i) : 'tay buôn'} đã giao một kiện ở mối ${TEN[m]}.`, 'giao'); });
        continue;
      }
      const r = ds[n];
      if (!r) { cho = { h, ai: l.ai, i: l.i }; break; }
      if (r.h !== h) { n++; continue; }                            // nước của hiệp khác ở giữa: bỏ qua
      if (l.ai === 'tb') {
        if (r.l !== 'tb' || r.k !== cong.khac || r.P !== gheTB(l.i)) { n++; continue; }
        n++;
        if (r.b) { L.apTB(cong, { i: l.i, vay: true }); cong.tb[l.i].bo = true; them(`Khắc ${cong.khac} · ${tenTB(l.i)} bỏ cuộc.`, 'bat'); continue; }
        if (r.v) { const k_ = cong.khac; L.apTB(cong, { i: l.i, vay: true }); them(`Khắc ${k_} · ${tenTB(l.i)} không còn đường đi — bị vây bắt!`, 'bat'); continue; }
        const thoat = typeof r.t === 'number' && r.t >= 0 ? r.t : -1, k_ = cong.khac;
        if (!L.apTB(cong, { i: l.i, thoat })) { cong.tb[l.i].bat = k_; cong.tb[l.i].bo = true; L.chinhLuot(cong); continue; }
        hiep.chung.push({ k: k_, i: l.i, c: r.c });
        if (thoat >= 0) them(`Khắc ${k_} · ${tenTB(l.i)} lên thuyền ở ${TEN[thoat]} — thoát!`, 'thoat');
        else them(`Khắc ${k_} · ${tenTB(l.i)} đã đi một bước.`, 'mo');
        continue;
      }
      /* hải quan */
      if (r.l !== 'hq' || r.k !== cong.khac || r.P !== gheHQ(l.i)) { n++; continue; }
      const linh = String(r.o || '').split(',').map(Number), nuoc = { j: l.i, linh, soat: typeof r.s === 'number' ? r.s : -1 };
      if (!L.nuocHQHopLe(cong, l.i, nuoc)) { n++; continue; }
      if (nuoc.soat >= 0) {
        const kq = [], thieu = [];
        cong.tb.forEach((_, i) => {
          if (!L.conChoi(cong, i)) { kq[i] = null; return; }
          const x = docDap(dap[khoaDap(h, cong.khac, i)]);
          if (!x) { thieu.push(i); return; }
          kq[i] = x;
        });
        if (thieu.length) { cho = { h, ai: 'dap', i: thieu, k: cong.khac, j: l.i, linh, z: nuoc.soat, n }; v.h.choLinh = linh; v.h.choDap = { i: thieu, z: nuoc.soat }; break; }
        n++;
        const k_ = cong.khac;
        gDap[k_] = kq.map(x => (x ? x.g : -1));
        const kqLoi = kq.map(x => (!x ? null : x.loai === 'bo' ? { loai: 'bat' } : x.loai === 'dau' ? { loai: 'dau', dau: x.dau } : { loai: x.loai }));
        L.apHQ(cong, Object.assign(nuoc, { kq: kqLoi }));
        kq.forEach((x, i) => { if (x && x.loai === 'bo') { cong.tb[i].bo = true; them(`Khắc ${k_} · ${tenTB(i)} bỏ cuộc.`, 'bat'); } });
        const ai = tenHQ(l.i), bat = kq.map((x, i) => (x && x.loai === 'bat' ? i : -1)).filter(i => i >= 0), dauT = kq.map((x, i) => (x && x.loai === 'dau' ? i : -1)).filter(i => i >= 0);
        if (bat.length) them(`Khắc ${k_} · ${ai} lục soát ${TEN[nuoc.soat]}: BẮT ĐƯỢC ${bat.map(tenTB).join(' và ')}!`, 'bat');
        else if (dauT.length) them(`Khắc ${k_} · ${ai} lục soát ${TEN[nuoc.soat]}: thấy ${dauT.map(i => `dấu chân khắc ${kq[i].dau}${ch.soTB > 1 ? ` của ${tenTB(i)}` : ''}`).join(', ')}!`, 'dau');
        else them(`Khắc ${k_} · ${ai} lục soát ${TEN[nuoc.soat]}: không thấy gì.`, 'trong');
        hiep.soatCuoi = { z: nuoc.soat, k: k_ };
      } else { n++; L.apHQ(cong, nuoc); them(`Khắc ${cong.khac} · ${tenHQ(l.i)} dời lính.`, 'mo'); }
    }
    if (!cong.xong) break;                                          // hiệp này còn chơi
    /* hết hiệp: điểm theo bản lộ (có thì kiểm từng mã cam kết, từng câu trả lời) */
    hiep.xong = true;
    const phe = pheBuon(h);
    let d = 0;
    const dong_ = cong.tb.map((t, i) => {
      const mo = kiemMoPhong(h, i), ten = tenTB(i);
      if (mo && mo.ok) (hiep.kinLo = hiep.kinLo || [])[i] = mo.kin;
      const soKien = mo && mo.ok ? mo.giao.length : t.giao;
      const diemI = mo && !mo.ok ? 0 : soKien + (t.thoat >= 0 ? 1 : 0);
      d += diemI;
      const ket = t.bo ? 'bỏ cuộc' : t.bat >= 0 ? (t.vay ? `bị vây bắt ở khắc ${t.bat}` : `bị bắt ở khắc ${t.bat}`) : t.thoat >= 0 ? `lên thuyền ở ${TEN[t.ben]} (khắc ${t.thoat})` : 'trời sáng mà chưa ra được bến';
      return `${ten}: ${mo ? (mo.ok ? `giao ${soKien}/${ch.can} kiện${soKien ? ` (${mo.giao.map(g => TEN[g.m]).join(', ')})` : ''}` : `KHÔNG KHỚP (${mo.loi}) — 0 điểm`) : `giao ${t.giao} kiện (chờ máy tay buôn lộ đường đi)`}, ${ket}.`;
    });
    v.diem[phe] += d;
    v.ketHiep[h] = { phe, d, dong: dong_ };
    them(`Hết hiệp ${h + 1}: phe buôn được ${d} điểm.`, 'het');
  }
  v.xong = v.hieps.length === 2 && v.hieps[1].xong;
  van = vanCu;
  return { v, cho, n };
}
/* bản lộ của tay buôn i hiệp h: kiểm lại từ đầu bằng chính lõi luật — từng bước đi, từng dấu giả, từng mã cam kết, từng câu
   trả lời, từng tin giao hàng. Trả null nếu chưa có bản lộ; { ok, loi, giao, kin } nếu có. */
function kiemMoPhong(h, i) {
  const cay = phong.cay, x = cay.mo && cay.mo[`${h}-${i}`];
  if (!x) return null;
  const khoa = JSON.stringify(x) + '|' + dsNuoc(cay).length + '|' + JSON.stringify(cay.dap || {}).length;
  const c = phong.kiemMo[`${h}-${i}`];
  if (c && c.khoa === khoa) return c.kq;
  const kq = kiemMo(cay, h, i, x);
  phong.kiemMo[`${h}-${i}`] = { khoa, kq };
  return kq;
}
function kiemMo(cay, h, i, x) {
  const ch = L.cauHinh(kieuPhong(cay));
  const so = (s) => String(s || '').split(',').filter(Boolean);
  const duong = so(x.d).map(Number), gia = new Map(so(x.f).map(s => { const [z, k] = s.split(':').map(Number); return [k + 1, z]; }));
  const giao = so(x.g).map(s => { const [m, k] = s.split(':').map(Number); return { m, k }; }), giaoTai = new Map(giao.map(g => [g.k, g.m]));
  if (!duong.length || !ch.vao.includes(duong[0])) return { ok: false, loi: 'cửa vào', giao: [] };
  const cong = L.congMoi(ch), kin = L.kinMoi(ch, i, duong[0]), ds = dsNuoc(cay), dap = cay.dap || {}, kh = [];
  const vanCu = van; van = { kieu: kieuPhong(cay), buonTruoc: cay.truoc ? 1 : 0, hiep: h, ghe: [] };
  const pTB = (j) => gheTB(j), pHQ = (j) => gheHQ(j);
  van = vanCu;
  let n = 0;
  const loi = (s) => ({ ok: false, loi: s, giao: [] });
  /* dựng lại hiệp h; nước của tay buôn khác chỉ áp phần công khai */
  const vv = { kieu: kieuPhong(cay), buonTruoc: cay.truoc ? 1 : 0, hiep: h, ghe: [] };
  const gtb = (j) => { const c_ = van; van = vv; const P = pTB.call(null, j); van = c_; return P; };
  void gtb; void pHQ; void kh;
  const vanTam = van; van = vv;
  try {
    for (let lap = 0; lap < 2000 && !cong.xong && cong.luot; lap++) {
      const l = cong.luot;
      if (l.ai === 'het') {
        const t = cong.khac, g = cong.tb.map((_, j) => { const y = docDap(dap[khoaDap(h, t, j)]); return y ? y.g : -1; });
        const giaoThat = giaoTai.get(t - (ch.tre || 0));
        if (L.conChoi(cong, i) || (cong.tb[i].bat === t)) { if ((giaoThat === undefined ? -1 : giaoThat) !== g[i] && docDap(dap[khoaDap(h, t, i)])) return loi(`tin giao hàng khắc ${t}`); }
        L.hetKhac(cong, g);
        continue;
      }
      const r = ds[n];
      if (!r) break;
      if (r.h !== h) { n++; continue; }
      if (l.ai === 'tb') {
        if (r.l !== 'tb' || r.k !== cong.khac || r.P !== gheTB(l.i)) { n++; continue; }
        n++;
        if (l.i !== i) {
          if (r.b || r.v) L.apTB(cong, { i: l.i, vay: true }); else if (!L.apTB(cong, { i: l.i, thoat: typeof r.t === 'number' ? r.t : -1 })) { cong.tb[l.i].bat = cong.khac; L.chinhLuot(cong); }
          continue;
        }
        const t = cong.khac;
        if (r.b) { L.apTB(cong, { i, vay: true }); break; }
        if (r.v) { if (!L.biVay(cong, kin)) return loi(`khắc ${t} chưa bị vây`); L.apTB(cong, { i, vay: true }); break; }
        const toi = duong[t];
        if (toi === undefined) return loi(`thiếu khắc ${t}`);
        const nuoc = { toi, gia: gia.has(t) ? gia.get(t) : -1, giao: giaoTai.get(t) === toi, thoat: typeof r.t === 'number' && r.t >= 0 };
        if (nuoc.thoat && r.t !== toi) return loi(`bến khắc ${t}`);
        if (!L.nuocTBHopLe(cong, kin, nuoc)) return loi(`nước khắc ${t}`);
        if (camKet(x.m, h, i, t, duong[0], toi, nuoc.gia, nuoc.giao) !== r.c) return loi(`mã cam kết khắc ${t}`);
        L.apTB(cong, L.kinDi(cong, kin, nuoc));
        continue;
      }
      if (r.l !== 'hq' || r.k !== cong.khac || r.P !== gheHQ(l.i)) { n++; continue; }
      const nuoc = { j: l.i, linh: String(r.o || '').split(',').map(Number), soat: typeof r.s === 'number' ? r.s : -1 };
      if (!L.nuocHQHopLe(cong, l.i, nuoc)) { n++; continue; }
      n++;
      if (nuoc.soat >= 0) {
        const kq = cong.tb.map((_, j) => {
          if (!L.conChoi(cong, j)) return null;
          const y = docDap(dap[khoaDap(h, cong.khac, j)]);
          if (!y) return { loai: 'trong' };
          return y.loai === 'bo' ? { loai: 'bat' } : y.loai === 'dau' ? { loai: 'dau', dau: y.dau } : { loai: y.loai };
        });
        if (L.conChoi(cong, i)) {
          const y = docDap(dap[khoaDap(h, cong.khac, i)]);
          if (y && y.loai !== 'bo') {
            const dung = L.traLoi(kin, nuoc.soat);
            if (dung.loai !== y.loai || (dung.loai === 'dau' && dung.dau !== y.dau)) return loi(`câu trả lời khắc ${cong.khac}`);
          }
        }
        L.apHQ(cong, Object.assign(nuoc, { kq }));
      } else L.apHQ(cong, nuoc);
    }
  } finally { van = vanTam; }
  return { ok: true, loi: '', giao: kin.giao.slice(), kin };
}

/* ---------- chạy phòng: dựng lại, rồi làm việc của mình ---------- */
function chayPhong() {
  if (!phong || !phong.cay || !phong.cay.batDau) return;
  const { v, cho, n } = dungVanPhong();
  const cu = van, daApCu = phong.daAp;
  /* giữ việc đang làm dở trên bản đồ khi máy chủ báo tin (nhịp "còn ở đây" của ai đó): cùng lượt thì không đặt lại */
  const luotMoi = cho ? `${cho.h}|${v.hieps[cho.h].cong.khac}|${cho.ai}|${cho.i}` : 'xong';
  const cungLuot = luotMoi === phong.luotCu;
  phong.luotCu = luotMoi;
  van = v;
  /* bí mật của mình gắn vào hiệp đang chơi */
  for (let i = 0; i < v.h.cong.ch.soTB; i++) {
    const b = phong.bm[`${v.hiep}-${i}`], lo = v.hieps[v.hiep].kinLo && v.hieps[v.hiep].kinLo[i];
    if (b) { v.h.kin[i] = b.kin; v.h.vao[i] = b.kin.duong[0]; } else if (lo) v.h.kin[i] = lo;
  }
  if (v.h.choLinh) v.h.cong.linhCho = v.h.choLinh;
  phong.daAp = n;
  /* lính người khác vừa dời: cho thấy lính đi (đang chơi, trang đang hiện) */
  if (phong.song && cu && cu.h && cu.cheDo === 'phong' && n > daApCu && !hoat) {
    const cuLinh = cu.h.cong.linh, moiLinh = v.h.choLinh || v.h.cong.linh;
    if (cuLinh.join() !== moiLinh.join() && cu.hiep === v.hiep) { chayLinh(cuLinh, moiLinh, () => { capNhatChu(); veDong(); }); }
  }
  phong.song = true;
  if (!cungLuot || !ui || ui.che === 'cho' || ui.che === '') {
    const giuNghi = ui && ui.nghi;
    if (!cungLuot || !ui) ui = { che: '', chon: -1, gia: -1, giao: true, thoat: true, linhChon: -1, linhMoi: null, soat: -1, xem: -1, soatVua: null, lo: false, nghi: giuNghi };
  }
  ui.lo = v.h.cong.xong;
  const soatCuoi = v.hieps[v.hiep] && v.hieps[v.hiep].soatCuoi;
  if (soatCuoi && (!phong.soatDaBao || phong.soatDaBao !== `${v.hiep}-${soatCuoi.k}`)) { phong.soatDaBao = `${v.hiep}-${soatCuoi.k}`; ui.soatVua = { z: soatCuoi.z, k: soatCuoi.k, t: Date.now() }; if (phong.daAp > 0 && cu) tiengSoat(); }
  lamViec(cho);
  capNhatChu(); veDong();
  if (v.xong || (v.hieps[0] && v.hieps[0].xong)) ketThucPhong();
}
/* việc của máy mình ở chỗ đang dừng: tới lượt mình thì mở lượt; trả lời lần soát cho tay buôn mình giữ; máy mình chạy giùm
   thì nghĩ rồi ghi; hết hiệp thì lộ đường đi */
function lamViec(cho) {
  const v = van, cong = v.h.cong, ch = cong.ch;
  /* lộ đường đi khi hiệp đã xong */
  for (let h = 0; h < 2; h++) {
    const hp = v.hieps[h];
    if (!hp || !hp.xong) continue;
    for (let i = 0; i < ch.soTB; i++) {
      const b = phong.bm[`${h}-${i}`];
      if (!b || (phong.cay.mo && phong.cay.mo[`${h}-${i}`])) continue;
      ghiMot(`mo/${h}-${i}`, { m: b.muoi, d: b.kin.duong.join(','), f: b.kin.giaDung.map(x => `${x.o}:${x.k}`).join(','), g: b.kin.giao.map(x => `${x.m}:${x.k}`).join(',') });
    }
  }
  if (!cho || phong.P < 0) { ui.che = cong.xong ? 'het' : 'cho'; return; }
  const chay = toiChayMay();
  if (cho.ai === 'dap') {
    for (const i of cho.i) {
      const b = phong.bm[`${cho.h}-${i}`], P = gheTB(i);
      const khoa = `dap/${khoaDap(cho.h, cho.k, i)}`;
      if (b) {
        const x = L.traLoi(b.kin, cho.z), gk = b.kin.giao.find(g => g.k === cho.k - (ch.tre || 0));
        ghiMot(khoa, { r: x.loai === 'bat' ? 'b' : x.loai === 'trong' ? 't' : x.dau, g: gk ? gk.m : -1 });
      } else if (chay && mayPhong(P)) ghiMot(khoa, { r: 'x', g: -1 });         // máy chạy giùm đã rời phòng: bí mật mất theo
    }
    ui.che = 'cho';
    return;
  }
  const P = cho.ai === 'tb' ? gheTB(cho.i) : gheHQ(cho.i);
  if (P === phong.P && !mayCua(P)) {
    if (cho.ai === 'tb') {
      if (!phong.bm[`${cho.h}-${cho.i}`]) { if (ui.che !== 'cua') { ui.che = 'cua'; ui.tb = cho.i; tiengToiLuot(); } return; }
      const kn = phong.bm[`${cho.h}-${cho.i}`].kin;
      if (L.biVay(cong, kn)) { guiTB(cho.i, null, { v: 1 }); return; }
      if (ui.che !== 'tb' || ui.tb !== cho.i) batLuotTB(cho.i);
    } else if (ui.che !== 'hq' || ui.hq !== cho.i) batLuotHQ(cho.i);
    return;
  }
  ui.che = 'cho';
  if (!chay || !mayPhong(P)) return;
  /* máy mình chạy giùm ghế P */
  const viecKhoa = `${cho.h}|${cong.khac}|${cho.ai}|${cho.i}`;
  if (phong.dangNghi === viecKhoa) return;
  phong.dangNghi = viecKhoa;
  const muc = [0, 1, 2].includes(phong.cay.kho) ? phong.cay.kho : 1;
  if (cho.ai === 'tb') {
    let b = phong.bm[`${cho.h}-${cho.i}`];
    if (!b) {
      if (cong.khac > 1) { guiTB(cho.i, null, { b: 1 }); return; }               // bí mật của máy này ở máy khác đã rời
      const daChon = [];
      for (let j = 0; j < ch.soTB; j++) { const bj = phong.bm[`${cho.h}-${j}`]; if (bj) daChon.push(bj.kin.duong[0]); }
      const vv = L.chonVao(ch, Math.random, daChon);
      b = phong.bm[`${cho.h}-${cho.i}`] = { kin: L.kinMoi(ch, cho.i, vv), muoi: muoiMoi() };
      v.h.kin[cho.i] = b.kin; luuBiMat();
    }
    if (L.biVay(cong, b.kin)) { guiTB(cho.i, null, { v: 1 }); return; }
    mayNghi('tb', { cong, kin: b.kin, muc }, (nuoc) => {
      if (!phong || phong.dangNghi !== viecKhoa) return;
      if (!nuoc || !L.nuocTBHopLe(cong, b.kin, nuoc)) nuoc = nuocDuPhong(cong, b.kin);
      guiTB(cho.i, nuoc);
    }, 700);
  } else {
    mayNghi('hq', { cong, j: cho.i, muc }, (nuoc) => {
      if (!phong || phong.dangNghi !== viecKhoa) return;
      if (!nuoc || !L.nuocHQHopLe(cong, cho.i, nuoc)) nuoc = { j: cho.i, linh: cong.linh.slice(), soat: L.duocSoat(cong, cho.i) ? cong.linh[ch.chu.indexOf(cho.i)] : -1 };
      guiHQ(cho.i, nuoc);
    }, 500);
  }
}
/* máy chơi thay do ai chạy: người ngồi ghế số nhỏ nhất còn ở đây */
function toiChayMay() {
  if (!phong || phong.P < 0) return false;
  let ds = cacGhe().filter(P => gheCua(P) && !mayCua(P) && conO(P));
  if (!ds.length) ds = cacGhe().filter(P => gheCua(P) && conO(P));
  return ds.length > 0 && ds[0] === phong.P;
}
/* ghi một chỗ ghi-một-lần (dap, mo): mỗi chỗ chỉ gửi một lần từ máy này */
function ghiMot(duong, gt) {
  if (phong.daGui.has(duong)) return;
  phong.daGui.add(duong);
  const ma = phong.ma;
  MANG.goi(`buonlau/${ma}/${duong}`, 'PUT', gt).then(r => { if (!r.ok && r.ma === 0 && phong && phong.ma === ma) phong.daGui.delete(duong); });
}
/* ghi một nước vào ô kế tiếp của danh sách; ô đó có người ghi trước thì máy chủ từ chối — dựng lại theo máy chủ */
function ghiNuoc(rec, khiHong) {
  const ma = phong.ma, n = dsNuoc(phong.cay).length;
  MANG.goi(`buonlau/${ma}/nuoc/${n}`, 'PUT', rec).then(r => {
    if (!phong || phong.ma !== ma) return;
    if (!r.ok) { if (khiHong) khiHong(); bao(r.ma === 401 ? 'Nước vừa rồi không được tính — máy khác đã ghi trước.' : 'Mất mạng, nước vừa rồi chưa gửi được.'); phong.dangNghi = ''; if (phong.cay) chayPhong(); }
  });
}
/* tay buôn i (mình hay máy mình chạy) đi: cập nhật bí mật, cất, ghi mã cam kết lên máy chủ */
function guiTB(i, nuoc, dacBiet) {
  const cong = van.h.cong, h = van.hiep, P = gheTB(i), b = phong.bm[`${h}-${i}`], k = cong.khac;
  if (dacBiet) { ghiNuoc(Object.assign({ P, h, l: 'tb', k }, dacBiet)); return; }
  const cu = chepKin(b.kin);
  const r = L.kinDi(cong, b.kin, nuoc);
  luuBiMat();
  const c = camKet(b.muoi, h, i, k, b.kin.duong[0], nuoc.toi, nuoc.gia, !!nuoc.giao);
  const rec = { P, h, l: 'tb', k, c };
  if (r.thoat >= 0) rec.t = r.thoat;
  if (laMinh(P)) { tiengBuoc(); if (nuoc.giao) tiengGiao(); }
  ui.che = 'cho';
  ghiNuoc(rec, () => { phong.bm[`${h}-${i}`].kin = cu; luuBiMat(); });
  capNhatChu(); veDong();
}
function guiHQ(j, nuoc) {
  const cong = van.h.cong, P = gheHQ(j);
  ui.che = 'cho';
  ghiNuoc({ P, h: van.hiep, l: 'hq', k: cong.khac, o: nuoc.linh.join(','), s: nuoc.soat });
  capNhatChu(); veDong();
}
/* hết trận (hay hết hiệp 1): bảng kết quả */
function ketThucPhong() {
  if (!van) return;
  if (van.xong && phong.cay && !phong.cay.xong) MANG.goi(`buonlau/${phong.ma}/xong`, 'PUT', MANG.GIO);
  const khoa = `${van.xong ? 2 : 1}|${(van.ketHiep[van.xong ? 1 : 0] || {}).dong}`;
  if (phong.ketDaHien === khoa) return;
  phong.ketDaHien = khoa;
  if (van.xong) { ghiLuu({ bm: undefined }); tiengHet(); }
  setTimeout(() => { if (van && van.cheDo === 'phong') moTinHetHiepPhong(); }, 900);
}
function moTinHetHiepPhong() {
  const kh = van.ketHiep[van.xong ? 1 : 0];
  if (!kh) return;
  if (!van.xong) {
    moTin(`<p class="bl-tin-nho">Hết hiệp 1 · phòng ${phong.ma}</p><h2>Phe buôn được ${kh.d} điểm</h2>${kh.dong.map(d => `<p>${esc(d)}</p>`).join('')}
      <p class="bl-meo">Hiệp 2 đổi vai, bắt đầu ngay.</p><button type="button" class="bl-dongtin bl-chinh">Chơi hiệp 2</button>`);
    return;
  }
  const [a, b] = van.diem, tieuDe = a === b ? `Hoà ${a}–${b}` : `${esc(tenPhe(a > b ? 0 : 1))} thắng ${Math.max(a, b)}–${Math.min(a, b)}`;
  const tiep = phong.cay && phong.cay.tiep;
  moTin(`<p class="bl-tin-nho">Hết trận · phòng ${phong.ma}</p><h2>${tieuDe}</h2>${van.ketHiep.map(k => k.dong.map(d => `<p>${esc(d)}</p>`).join('')).join('')}
    <p>${esc(tenPhe(0))}: ${a} điểm · ${esc(tenPhe(1))}: ${b} điểm.</p>
    <button type="button" class="bl-xem-lai">Xem bản đồ</button>
    ${tiep ? '<p class="bl-meo">Có người mời chơi ván nữa.</p><button type="button" class="bl-vaotiep bl-chinh">Vào ván mới</button>' : '<button type="button" class="bl-vannua bl-chinh">Chơi ván nữa</button>'}
    <button type="button" class="bl-roi">Rời phòng</button>`);
}
function sangHiepPhong() { tatTin(); }

/* người vắng: tới lượt hải quan vắng quá một phút thì cho máy đi thay; tay buôn vắng quá hai phút thì cho bỏ cuộc (bí mật
   chỉ ở máy người đó, máy khác không đi thay được) */
function viecVang() {
  if (!van || van.cheDo !== 'phong' || !phong || phong.P < 0) return null;
  if (mayCua(phong.P)) return { loai: 'tudi' };
  const cong = van.h.cong, l = cong.luot;
  if (!l || cong.xong) return null;
  const P = l.ai === 'tb' ? gheTB(l.i) : l.ai === 'hq' ? gheHQ(l.i) : -1;
  if (P >= 0 && P !== phong.P && !mayPhong(P) && !conO(P)) {
    if (l.ai === 'hq') return { loai: 'thay', P };
    const g = gheCua(P);
    if (g && gioMay() - g.thay > VANG_TB) return { loai: 'bo', P, i: l.i };
  }
  return null;
}
function choMayThay() { const x = viecVang(); if (x && x.loai === 'thay') MANG.goi(`buonlau/${phong.ma}/may/${x.P}`, 'PUT', true); }
function tuDiTiep() { if (viecVang() && viecVang().loai === 'tudi') MANG.goi(`buonlau/${phong.ma}/may/${phong.P}`, 'DELETE'); }
function choBoCuoc() { const x = viecVang(); if (x && x.loai === 'bo') ghiNuoc({ P: x.P, h: van.hiep, l: 'tb', k: van.h.cong.khac, b: 1 }); }
function kiemPhong() {
  if (!phong) return;
  if (phong.P >= 0 && Date.now() - phong.nhipCuoi > NHIP && !(typeof document !== 'undefined' && document.hidden)) {
    phong.nhipCuoi = Date.now();
    MANG.goi(`buonlau/${phong.ma}/ghe/${phong.P}/thay`, 'PUT', MANG.GIO);
    capNhatSanh(true);
  }
  if (phong.luong) phong.luong.noiLai();
  if (!phong.cay) return;
  if (!phong.cay.batDau) veSanh();
  else if (van && van.cheDo === 'phong' && !hoat) { phong.dangNghi = ''; chayPhong(); }
}

/* ---------- mời, chép, ván nữa ---------- */
function chepChu(chu) {
  const cachCu = () => {
    try { const o = document.createElement('textarea'); o.value = chu; o.setAttribute('readonly', ''); o.style.position = 'fixed'; o.style.opacity = '0'; document.body.appendChild(o); o.select(); const ok = document.execCommand('copy'); o.remove(); return !!ok; } catch (e) { return false; }
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(chu).then(() => true, () => cachCu());
  return Promise.resolve(cachCu());
}
function chepMa() { if (!phong) return; const ma = phong.ma; chepChu(ma).then(ok => bao(ok ? `Đã chép mã phòng ${ma}` : `Mã phòng: ${ma}`)); }
function chepLinkMoi() {
  if (!phong) return;
  const ma = phong.ma, url = linkMoi(ma);
  chepChu(url).then(ok => {
    if (ok) { bao(`Đã chép link mời phòng ${ma} — dán vào Zalo, Messenger để gửi.`); return; }
    moTin(`<p class="bl-tin-nho">Phòng ${ma}</p><h2>Chép link mời</h2><p>Máy chưa cho chép tự động. Chạm giữ vào link rồi chọn Sao chép:</p>
      <input class="bl-o-ten bl-o-link" readonly value="${esc(url)}"><button type="button" class="bl-dongtin">Xong</button>`);
  });
}
function moiBan() {
  if (!phong) return;
  const url = linkMoi(phong.ma);
  if (coChiaSe()) { navigator.share({ title: 'Buôn lậu phố cổ', text: `Vào phòng ${phong.ma} chơi Buôn lậu phố cổ`, url }).catch(() => {}); return; }
  chepLinkMoi();
}
function moPhongTT() {
  moTin(`<p class="bl-tin-nho">Đang chơi qua mạng · ${kieuChu(phong.cay)}</p>${dongMa()}${hangGhe(phong.cay, phong.P, true)}
    <p class="bl-meo">Tới lượt hải quan vắng quá một phút thì người khác bấm được "Cho máy đi thay"; tay buôn vắng quá hai phút thì cho bỏ cuộc được (đường đi bí mật chỉ nằm trên máy người đó).</p>
    <button type="button" class="bl-dongtin bl-chinh">Chơi tiếp</button>
    ${nutMoiBan('Gửi link xem ván', 'Chép link xem ván', false)}${nutQR()}${khungQR()}
    <button type="button" class="bl-chu bl-roi">Rời phòng</button>`);
}
function xacNhanRoi() {
  moTin(`<p class="bl-tin-nho">Phòng ${phong.ma}</p><h2>Rời phòng giữa trận?</h2>
    <p>Ghế của bạn đứng yên; mở lại link phòng là vào lại đúng ghế. Bạn đang làm tay buôn thì đường đi bí mật vẫn cất trên máy này — đừng xoá dữ liệu trang.</p>
    <button type="button" class="bl-dongtin bl-chinh">Ở lại chơi tiếp</button>
    <button type="button" class="bl-roi-that">Rời phòng</button>`);
}
async function vanNua() {
  if (!phong || !phong.cay) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }
  const cu = phong.ma, cay = phong.cay, ma = MANG.maMoi();
  const r = await MANG.goi(`buonlau/${cu}/tiep`, 'PUT', ma);
  if (!phong || phong.ma !== cu) return;
  if (!r.ok) { bao(r.ma === 401 ? 'Có người vừa mời ván nữa — bấm Vào ván mới.' : 'Mất mạng, thử lại nhé.'); return; }
  /* ván nữa: phe kia làm tay buôn trước */
  await taoPhong({ kieu: kieuPhong(cay), kho: cay.kho || 1, ten: tenMinhLuu() || 'Người 1', ma, truoc: cay.truoc ? 0 : 1 });
}
function theoTiep(ma) { const P = phong && phong.P >= 0 ? phong.P : -1; vaoPhong(ma, null, P); if (phong) phong.choTiep = Date.now(); }
function trichMa(chu) {
  const s = String(chu || '').trim();
  const m = /[?&]phong=([A-Za-z0-9]{6})/.exec(s) || /#buon-lau\/([A-Za-z0-9]{6})/.exec(s);
  const ma = (m ? m[1] : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return MANG && MANG.laMa(ma) ? ma : '';
}
function vaoBangMa() {
  const o = tam && tam.querySelector('.bl-o-ma'), t = tam && tam.querySelector('.bl-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  const ma = trichMa(o ? o.value : '');
  if (ma) vaoPhong(ma); else bao('Mã phòng gồm 6 chữ và số, như trong tin nhắn mời.');
}
function theoMaTrenDiaChi() {
  if (!tam || !tam.classList.contains('hien') || !MANG) return;
  const m = maTrenDiaChi();
  if (m && (!phong || phong.ma !== m[1])) { const l = docLuu().phong; vaoPhong(m[1], l && l.ma === m[1] ? { id: l.id, P: l.P } : null); }
}
function moPhongLucMo() {
  if (!MANG) return false;
  const m = maTrenDiaChi(), luu = docLuu().phong;
  if (m) { if (!phong || phong.ma !== m[1]) vaoPhong(m[1], luu && luu.ma === m[1] ? { id: luu.id, P: luu.P } : null); else noiPhong(); return true; }
  if (phong) { noiPhong(); datDiaChi(phong.ma); return true; }
  if (!van && luu && MANG.laMa(luu.ma)) { vaoPhong(luu.ma, { id: luu.id, P: luu.P }, -1, true); return true; }
  return false;
}
function dongMang() { tatTimPhong(); dungLuong(); }

/* ---------- màn chọn của chơi qua mạng ---------- */
function moManMang(man) {
  manDang = man;
  const l = docLuu(), kieu = l.kieuPhong === '2v2' ? '2v2' : '1v1', kho = [0, 1, 2].includes(l.kho) ? l.kho : 1, moCho = l.mo === 1, truoc = l.truocPhong === 1 ? 1 : 0;
  if (man === 'tim') batTimPhong(); else tatTimPhong();
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="bl-chon${bat ? ' bl-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const lui = '<button type="button" class="bl-lui" data-man="chinh">‹ Quay lại</button>';
  const oTen = (goiY) => `<p class="bl-nhan">Tên của bạn</p><input class="bl-o-ten" maxlength="20" value="${esc(l.ten || '')}" placeholder="${goiY}" autocomplete="nickname">`;
  let html;
  if (man === 'tao') html = `${lui}<p class="bl-tin-nho">Tạo phòng</p><h2>${moCho ? 'Phòng mở cho mọi người' : 'Mời bạn chơi cùng'}</h2>
    ${oTen(moCho ? 'Người khác thấy tên này trong danh sách' : 'Để bạn bè biết là ai')}
    <p class="bl-nhan">Số người</p><div class="bl-hang">${nut('2 người<small>một tay buôn, một hải quan</small>', '1v1', kieu === '1v1', 'kieuphong')}${nut('4 người<small>hai phe, mỗi phe hai người</small>', '2v2', kieu === '2v2', 'kieuphong')}</div>
    <p class="bl-nhan">Hiệp đầu bạn làm</p><div class="bl-hang">${nut('🧺 Tay buôn', 0, truoc === 0, 'truocphong')}${nut('🎩 Hải quan', 1, truoc === 1, 'truocphong')}</div>
    <p class="bl-nhan">Ai được vào</p><div class="bl-hang">${nut('Bạn bè có link', 0, !moCho, 'mo')}${nut('Mọi người', 1, moCho, 'mo')}</div>
    <p class="bl-nhan">Ghế không ai vào thì máy chơi</p><div class="bl-hang">${KHO.map((k, i) => nut(k, i, i === kho, 'kho')).join('')}</div>
    <button type="button" class="bl-tao bl-chinh">Tạo phòng</button>
    <p class="bl-meo">Tạo xong có link và mã QR để mời. Bạn ngồi ghế 1.</p>`;
  else if (man === 'tim') html = `${lui}<p class="bl-tin-nho">Tìm phòng</p><h2>Phòng đang chờ người</h2>
    ${oTen('Để trống thì gọi theo số ghế')}
    <button type="button" class="bl-tim-nhanh bl-chinh">Tìm phòng nhanh</button>
    <p class="bl-meo">Vào ngay phòng sắp đủ người; không có thì tự tạo phòng mở, chờ người vào. Hay chọn một phòng:</p>
    <div class="bl-ds-phong">${dsPhongHtml()}</div>
    <button type="button" class="bl-tao-mo">Tạo phòng mở</button>`;
  else html = `${lui}<p class="bl-tin-nho">Vào phòng</p><h2>Nhập mã phòng</h2>
    <input class="bl-o-ma" maxlength="400" placeholder="VD: BMVZVJ" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
    <p class="bl-meo">6 chữ và số trong tin nhắn mời — dán cả link vào đây cũng được.</p>
    ${oTen('Để trống thì gọi theo số ghế')}
    <button type="button" class="bl-vao bl-chinh" disabled>Vào phòng</button>`;
  moTin(html);
  if (man === 'vao') { const o = tam.querySelector('.bl-o-ma'); if (o && o.focus) setTimeout(() => o.focus(), 60); }
}
function bamMang(t, q) {
  let n;
  if ((n = q('[data-kieuphong]'))) { ghiLuu({ kieuPhong: n.dataset.kieuphong }); moManMang(manDang); return true; }
  if ((n = q('[data-truocphong]'))) { ghiLuu({ truocPhong: +n.dataset.truocphong }); moManMang(manDang); return true; }
  if ((n = q('[data-mo]'))) { ghiLuu({ mo: +n.dataset.mo }); moManMang(manDang); return true; }
  if ((n = q('[data-kho]'))) { ghiLuu({ kho: +n.dataset.kho }); moManMang(manDang); return true; }
  if ((n = q('[data-ngoi]'))) { ngoiGhe(+n.dataset.ngoi); return true; }
  if ((n = q('[data-phongmo]'))) { amThanh(); vaoPhongMo(n.dataset.phongmo); return true; }
  if (q('.bl-tao')) { amThanh(); const c = docLuu(); taoPhong(Object.assign(cauHinhTao(c), { mo: c.mo === 1 })); return true; }
  if (q('.bl-tao-mo')) { ghiLuu({ mo: 1 }); moManMang('tao'); return true; }
  if (q('.bl-tim-nhanh')) { amThanh(); timNhanh(); return true; }
  if (q('.bl-doi-mo')) { doiPhongMo(); return true; }
  if (q('.bl-vao')) { amThanh(); vaoBangMa(); return true; }
  if (q('.bl-batdau-phong')) { amThanh(); batDauPhong(); return true; }
  if (q('.bl-moi-ban')) { moiBan(); return true; }
  if (q('.bl-roi')) { if (van && van.cheDo === 'phong' && !van.xong && phong) xacNhanRoi(); else { roiPhong(); moMan('chinh'); } return true; }
  if (q('.bl-roi-that')) { roiPhong(); moMan('chinh'); return true; }
  if (q('.bl-chep-ma')) { chepMa(); return true; }
  if (q('.bl-chep-link')) { chepLinkMoi(); return true; }
  if (q('.bl-qr-bat')) { if (phong) { phong.qr = !phong.qr; if (phong.cay && !phong.cay.batDau) veSanh(); else moPhongTT(); } return true; }
  if (q('.bl-vannua')) { vanNua(); return true; }
  if (q('.bl-vaotiep')) { if (phong && phong.cay && phong.cay.tiep) theoTiep(phong.cay.tiep); return true; }
  if ((n = q('.bl-vang'))) { const x = viecVang(); if (x && x.loai === 'thay') choMayThay(); else if (x && x.loai === 'tudi') tuDiTiep(); else if (x && x.loai === 'bo') choBoCuoc(); return true; }
  return false;
}
function nhapMang(e) {
  const o = e.target;
  if (!o || !o.classList) return;
  if (o.classList.contains('bl-o-ten')) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  if (o.classList.contains('bl-o-ma')) {
    const ma = trichMa(o.value), nt = tam.querySelector('.bl-vao');
    if (ma && /phong=|#buon-lau\//i.test(o.value)) o.value = ma;
    if (nt) nt.disabled = !ma;
  }
}
function phimMang(e) { if (e.target && e.target.classList && e.target.classList.contains('bl-o-ma')) vaoBangMa(); }

self.TDTD_BUONLAU = {
  L, LOI, mo, dong,
  _van: () => van, _ui: () => ui, _vanMoi: (ch) => vanMoi(ch), _tiep: () => tiep(), _tuaHet: () => tuaHet(),
  _chamTai: (x, y) => chamTai(x, y), _cham: (v) => chamTai(BX[v], BY[v]), _xongTB: () => xongTB(), _xongHQ: () => xongHQ(), _bam: (e) => bam(e),
  _chonCua: (i, v) => chonCua(i, v), _moMan: (m) => moMan(m), _moHuongDan: () => moHuongDan(), _capNhatChu: () => capNhatChu(), _veDong: () => veDong(),
  _sangHiepSau: () => sangHiepSau(), _BX: BX, _BY: BY, _VB: VB, _dauLo: (i) => dauLo(van.h.cong, i), _tam: () => tam, _boViec: () => boViec(),
  _nhanh: (x) => { NHANH = x; }, _phong: () => phong, _taoPhong: (ch) => taoPhong(ch), _vaoPhong: (ma, minh, muon) => vaoPhong(ma, minh, muon), _ngoiGhe: (P) => ngoiGhe(P),
  _batDauPhong: () => batDauPhong(), _roiPhong: () => roiPhong(), _chayPhong: () => chayPhong(), _kiemPhong: () => kiemPhong(), _vanNua: () => vanNua(),
  _theoTiep: (ma) => theoTiep(ma), _timNhanh: () => timNhanh(), _toiChayMay: () => toiChayMay(), _viecVang: () => viecVang(), _choMayThay: () => choMayThay(),
  _tuDiTiep: () => tuDiTiep(), _choBoCuoc: () => choBoCuoc(), _sha256: (s) => sha256(s), _camKet: camKet, _kiemMo: (cay, h, i, x) => kiemMo(cay, h, i, x),
  _dungVanPhong: () => dungVanPhong(), _linkMoi: (ma) => linkMoi(ma), _trichMa: (s) => trichMa(s), _capNhatSanh: (ep) => capNhatSanh(ep),
};
})();

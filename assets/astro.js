/* Thiên văn thuần: đưa vào một mốc thời gian và một chỗ đứng trên Trái Đất, trả về
   Mặt Trời, Mặt Trăng và tám hành tinh đang ở đâu trên bầu trời chỗ đó (bầu trời đêm chỉ vẽ năm
   hành tinh mắt thường thấy; cảnh Hệ Mặt Trời vẽ đủ tám).

   Không mạng, không thư viện, không bảng tra sẵn — tính bằng công thức.

   Nguồn công thức:
   - Mặt Trời và Mặt Trăng: Jean Meeus, "Astronomical Algorithms" (ấn bản 2, 1998),
     chương 25 và 47, lấy các số hạng lớn nhất. Sai số Mặt Trời chừng 0,01 độ, Mặt Trăng
     trung bình 0,1 độ, có lúc tới 0,3 độ (đối chiếu JPL Horizons 2026–2044) — tức có lúc
     ngang bán kính của chính Mặt Trăng trên trời (0,25 độ).
   - Hành tinh: bảng phần tử Kepler của JPL, "Approximate Positions of the Planets",
     https://ssd.jpl.nasa.gov/planets/approx_pos.html — bảng 1 cho 1800–2050 (sai số vài
     phút cung), ngoài khoảng đó dùng bảng 2a + 2b (3000 TCN – 3000) cho lúc tua nhanh.
   - Giờ sao và phép đổi sang độ cao/phương vị: công thức chuẩn, xem Meeus chương 12–13.

   Mọi góc vào ra đều tính bằng **độ**, trừ chỗ nào ghi rõ khác. */
(() => {
'use strict';

const RAD = Math.PI / 180;
const sin = (d) => Math.sin(d * RAD);
const cos = (d) => Math.cos(d * RAD);
const chuan = (d) => ((d % 360) + 360) % 360;        // đưa góc về 0–360
const quanh = (d) => { const x = chuan(d); return x > 180 ? x - 360 : x; };   // về -180–180

/* Ngày Julius từ mốc thời gian của máy (mili giây UTC kể từ 1970). */
const ngayJulius = (ms) => ms / 86400000 + 2440587.5;

/* Độ nghiêng trục Trái Đất tại thời điểm đó. */
const nghieng = (d) => 23.439291 - 0.0000003563 * d;   // d = ngày kể từ J2000

/* Hoàng đạo (kinh, vĩ) -> xích đạo (xích kinh, xích vĩ). */
function sangXichDao(kinh, vi, eps) {
  const ra = Math.atan2(sin(kinh) * cos(eps) - Math.tan(vi * RAD) * sin(eps), cos(kinh));
  const dec = Math.asin(sin(vi) * cos(eps) + cos(vi) * sin(eps) * sin(kinh));
  return { ra: chuan(ra / RAD), dec: dec / RAD };
}

/* ---------- Mặt Trời ---------- */

function matTroi(JD) {
  const d = JD - 2451545.0;
  const L = chuan(280.460 + 0.9856474 * d);            // kinh độ trung bình
  const g = chuan(357.528 + 0.9856003 * d);            // dị thường trung bình
  const kinh = chuan(L + 1.915 * sin(g) + 0.020 * sin(2 * g));   // kinh độ hoàng đạo thật
  const kc = 1.00014 - 0.01671 * cos(g) - 0.00014 * cos(2 * g);  // khoảng cách, đơn vị thiên văn
  const { ra, dec } = sangXichDao(kinh, 0, nghieng(d));
  return { ra, dec, kinh, kc, gocNhin: 0.533 / kc };   // gocNhin: bề rộng nhìn thấy, độ
}

/* ---------- Mặt Trăng ---------- */

function matTrang(JD) {
  const d = JD - 2451545.0;
  const L = chuan(218.316 + 13.176396 * d);            // kinh độ trung bình
  const M = chuan(134.963 + 13.064993 * d);            // dị thường trung bình của Trăng
  const F = chuan(93.272 + 13.229350 * d);             // đối số vĩ độ
  const D = chuan(297.850 + 12.190749 * d);            // ly giác trung bình Trăng–Trời
  const Ms = chuan(357.529 + 0.98560028 * d);          // dị thường trung bình của Trời

  const kinh = chuan(L
    + 6.289 * sin(M)          + 1.274 * sin(2 * D - M)   + 0.658 * sin(2 * D)
    + 0.214 * sin(2 * M)      - 0.186 * sin(Ms)          - 0.114 * sin(2 * F)
    - 0.059 * sin(2 * D - 2 * M) - 0.057 * sin(2 * D - Ms - M)
    + 0.053 * sin(2 * D + M)  + 0.046 * sin(2 * D - Ms)
    + 0.041 * sin(M - Ms)     - 0.035 * sin(D)          - 0.031 * sin(M + Ms));

  const vi = 5.128 * sin(F)   + 0.281 * sin(M + F)      - 0.278 * sin(F - M)
    - 0.173 * sin(F - 2 * D)  + 0.055 * sin(2 * D + F - M)
    - 0.046 * sin(2 * D - F - M) + 0.033 * sin(2 * D + F) + 0.017 * sin(2 * M + F);

  const kc = 385001 - 20905 * cos(M) - 3699 * cos(2 * D - M) - 2956 * cos(2 * D)
    - 570 * cos(2 * M) + 246 * cos(2 * M - 2 * D);      // km

  const { ra, dec } = sangXichDao(kinh, vi, nghieng(d));

  /* Pha: góc Trời–Trăng nhìn từ Trái Đất, rồi suy ra phần đĩa được chiếu sáng.
     Dấu của ly giác cho biết đang khuyết bên nào — quan trọng lúc vẽ lưỡi liềm. */
  const troi = matTroi(JD);
  const ly = quanh(kinh - troi.kinh);                  // ly giác, -180..180
  const gocPha = 180 - Math.abs(ly);                   // 0 là trăng tròn, 180 là trăng mới
  const sang = (1 + cos(gocPha)) / 2;                  // phần đĩa sáng, 0 tới 1
  const tuoi = chuan(ly) / 360 * 29.530588853;         // tuổi trăng, ngày kể từ mùng một

  return { ra, dec, kinh, vi, kc, sang, ly, tuoi, gocNhin: 2 * Math.atan(1737.4 / kc) / RAD };
}

/* ---------- Hành tinh ----------
   Bảng JPL: a, e, I, L, kinh độ cận nhật, kinh độ nút lên — và tốc độ đổi mỗi thế kỷ. */

const BANG = {
  //            a           ȧ          e          ė          I         İ
  //            L           L̇          ϖ          ϖ̇          Ω         Ω̇
  thuy:  [0.38709927,  0.00000037, 0.20563593,  0.00001906,  7.00497902, -0.00594749,
          252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
  kim:   [0.72333566,  0.00000390, 0.00677672, -0.00004107,  3.39467605, -0.00078890,
          181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
  dat:   [1.00000261,  0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668,
          100.46457166, 35999.37244981, 102.93768193, 0.32327364,  0.0,        0.0],
  hoa:   [1.52371034,  0.00001847, 0.09339410,  0.00007882,  1.84969142, -0.00813131,
          -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
  moc:   [5.20288700, -0.00011607, 0.04838624, -0.00013253,  1.30439695, -0.00183714,
          34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
  tho:   [9.53667594, -0.00125060, 0.05386179, -0.00050991,  2.48599187,  0.00193609,
          49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794],
  /* Thiên Vương, Hải Vương: hai hàng cuối của cùng bảng 1 (1800–2050). Bản trước bỏ hai hàng này nên
     cảnh "Hệ Mặt Trời" dừng ở Sao Thổ — người dùng hỏi "hệ mặt trời đầy đủ chưa hay thiếu". */
  thien: [19.18916464, -0.00196176, 0.04725744, -0.00004397,  0.77263783, -0.00242939,
          313.23810451, 428.48202785, 170.95427630, 0.40805281, 74.01692503, 0.04240589],
  hai:   [30.06992276,  0.00026291, 0.00859048,  0.00005105,  1.77004347,  0.00035372,
          -55.12002969, 218.45945325, 44.96476227, -0.32241464, 131.78422574, -0.00508664],
};

/* Bảng 2a (3000 TCN – 3000), cùng thứ tự cột với BANG, và bảng 2b: các số hạng b, c, s, f phải cộng thêm vào
   dị thường trung bình M của Sao Mộc tới Hải Vương. Chỉ dùng khi ngày đang xem ra ngoài 1800–2050 — tức lúc tua
   nhanh ở cảnh Hệ Mặt Trời: tua 100 ngày mỗi giây thì tám mươi giây là quá năm 2050, mà bản trước tới đó là quay
   về hôm nay, nên không bao giờ xem hết một vòng Sao Thổ, Thiên Vương hay Hải Vương. */
const BANG2 = {
  thuy:  [0.38709843,  0.00000000, 0.20563661,  0.00002123,  7.00559432, -0.00590158,
          252.25166724, 149472.67486623, 77.45771895, 0.15940013, 48.33961819, -0.12214182],
  kim:   [0.72332102, -0.00000026, 0.00676399, -0.00005107,  3.39777545,  0.00043494,
          181.97970850, 58517.81560260, 131.76755713, 0.05679648, 76.67261496, -0.27274174],
  dat:   [1.00000018, -0.00000003, 0.01673163, -0.00003661, -0.00054346, -0.01337178,
          100.46691572, 35999.37306329, 102.93005885, 0.31795260, -5.11260389, -0.24123856],
  hoa:   [1.52371243,  0.00000097, 0.09336511,  0.00009149,  1.85181869, -0.00724757,
          -4.56813164, 19140.29934243, -23.91744784, 0.45223625, 49.71320984, -0.26852431],
  moc:   [5.20248019, -0.00002864, 0.04853590,  0.00018026,  1.29861416, -0.00322699,
          34.33479152, 3034.90371757, 14.27495244, 0.18199196, 100.29282654, 0.13024619],
  tho:   [9.54149883, -0.00003065, 0.05550825, -0.00032044,  2.49424102,  0.00451969,
          50.07571329, 1222.11494724, 92.86136063, 0.54179478, 113.63998702, -0.25015002],
  thien: [19.18797948, -0.00020455, 0.04685740, -0.00001550,  0.77298127, -0.00180155,
          314.20276625, 428.49512595, 172.43404441, 0.09266985, 73.96250215, 0.05739699],
  hai:   [30.06952752,  0.00006447, 0.00895439,  0.00000818,  1.77005520,  0.00022400,
          304.22289287, 218.46515314, 46.68158724, 0.01009938, 131.78635853, -0.00606302],
};
const THEM2 = { moc: [-0.00012452, 0.06064060, -0.35635438, 38.35125000], tho: [0.00025899, -0.13434469, 0.87320147, 38.35125000],
                thien: [0.00058331, -0.97731848, 0.17689245, 7.67025000], hai: [-0.00041348, 0.68346318, -0.10162547, 7.67025000] };
const bangCho = (T) => (T < -2 || T > .5 ? BANG2 : BANG);   // T: thế kỷ Julius kể từ 2000; bảng 1 cho 1800–2050

/* Giải phương trình Kepler bằng Newton, như JPL mô tả: lặp tới khi chênh dưới 1e-6 độ. */
function keplerE(M, e) {
  let E = M + (e / RAD) * sin(M);
  for (let i = 0; i < 40; i++) {
    const dM = M - (E - (e / RAD) * sin(E));
    const dE = dM / (1 - e * cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/* Toạ độ hoàng đạo nhật tâm của một hành tinh, đơn vị thiên văn. */
function nhatTam(ten, T) {
  const B = bangCho(T), b = B[ten];
  const a = b[0] + b[1] * T, e = b[2] + b[3] * T, I = b[4] + b[5] * T;
  const L = b[6] + b[7] * T, vp = b[8] + b[9] * T, On = b[10] + b[11] * T;
  const w = vp - On;                                   // đối số cận nhật
  const t2 = B === BANG2 && THEM2[ten];
  const M = quanh(L - vp + (t2 ? t2[0] * T * T + t2[1] * cos(t2[3] * T) + t2[2] * sin(t2[3] * T) : 0));
  const E = keplerE(M, e);
  return xoayQuyDao(a * (cos(E) - e), a * Math.sqrt(1 - e * e) * sin(E), w, On, I);
}

/* Từ mặt phẳng quỹ đạo sang hệ hoàng đạo: quay theo đối số cận nhật, độ nghiêng, kinh độ nút lên. */
function xoayQuyDao(x, y, w, On, I) {
  return {
    x: (cos(w) * cos(On) - sin(w) * sin(On) * cos(I)) * x + (-sin(w) * cos(On) - cos(w) * sin(On) * cos(I)) * y,
    y: (cos(w) * sin(On) + sin(w) * cos(On) * cos(I)) * x + (-sin(w) * sin(On) + cos(w) * cos(On) * cos(I)) * y,
    z: (sin(w) * sin(I)) * x + (cos(w) * sin(I)) * y,
  };
}

/* Cho mô hình Hệ Mặt Trời: vị trí nhật tâm lúc JD, và cả vòng quỹ đạo (n điểm đều theo dị thường lệch tâm). */
const nhatTamJD = (ten, JD) => nhatTam(ten, (JD - 2451545.0) / 36525);
function quyDao(ten, JD, n = 120) {
  const T = (JD - 2451545.0) / 36525, b = bangCho(T)[ten];
  const a = b[0] + b[1] * T, e = b[2] + b[3] * T, I = b[4] + b[5] * T, vp = b[8] + b[9] * T, On = b[10] + b[11] * T;
  const ds = [];
  for (let k = 0; k < n; k++) {
    const E = k * 360 / n;
    ds.push(xoayQuyDao(a * (cos(E) - e), a * Math.sqrt(1 - e * e) * sin(E), vp - On, On, I));
  }
  return ds;
}

/* Bảng JPL cho toạ độ theo hoàng đạo và xuân phân J2000. Còn Mặt Trời, Mặt Trăng (công thức Meeus ở
   trên) và sao (đã tính tuế sai) thì theo xuân phân CỦA NGÀY đang xem. Bản trước để nguyên hành tinh ở
   J2000 nên lệch đúng một lượng tuế sai — 0,37° năm 2026 — so với sao nền, Mặt Trời và Mặt Trăng: phóng
   to là thấy hành tinh đứng sai chỗ giữa các sao, và góc Trăng–hành tinh lệch theo. Giờ đổi sang xích đạo
   J2000 (độ nghiêng của năm 2000) rồi tính tuế sai về ngày đó, y như sao; kinh độ hoàng đạo thì cộng tuế
   sai theo kinh độ (5029″ mỗi thế kỷ) để so được với kinh độ Mặt Trời. */
const EPS_J2000 = 23.4392911;
function hanhTinh(ten, JD) {
  const T = (JD - 2451545.0) / 36525;
  const p = nhatTam(ten, T), e = nhatTam('dat', T);
  const x = p.x - e.x, y = p.y - e.y, z = p.z - e.z;   // đổi sang nhìn từ Trái Đất
  const kc = Math.hypot(x, y, z);
  const kinh2000 = Math.atan2(y, x) / RAD;
  const vi = Math.asin(z / kc) / RAD;
  const q = sangXichDao(kinh2000, vi, EPS_J2000);
  const { ra, dec } = tueSai(q.ra, q.dec, JD);
  return { ra, dec, kinh: chuan(kinh2000 + 1.396971 * T), vi, kc, kcTroi: Math.hypot(p.x, p.y, p.z) };
}

/* ---------- từ bầu trời xuống chỗ mình đứng ---------- */

/* Giờ sao Greenwich, tính bằng độ. */
const gioSao = (JD) => chuan(280.46061837 + 360.98564736629 * (JD - 2451545.0));

/* Thị sai chỗ đứng, Meeus chương 40. Mặt Trăng chỉ cách 60 lần bán kính Trái Đất, nên đứng trên mặt đất
   nhìn nó lệch đi so với nhìn từ tâm Trái Đất — tới gần 1° lúc nó sát chân trời (gấp đôi bề rộng của chính
   Mặt Trăng), gần 0 lúc nó ở đỉnh đầu. Bản trước vẽ Trăng theo toạ độ tính từ tâm Trái Đất nên luôn cao hơn
   thật, và câu "đang nấp sau Mặt Trăng" hiện sai giờ. kcKm: khoảng cách tới tâm Trái Đất, km. Bỏ độ cao so
   với mặt biển. Đối chiếu JPL Horizons: cùng đầu vào thì ra khớp tới 0,3 giây cung. */
function thiSai(ra, dec, kcKm, viDo, kinhDo, JD) {
  const u = Math.atan(0.99664719 * Math.tan(viDo * RAD));
  const rs = 0.99664719 * Math.sin(u), rc = Math.cos(u);   // ρ·sin φ′ và ρ·cos φ′ (Trái Đất hơi dẹt)
  const sp = 6378.14 / kcKm;                                // sin của thị sai chân trời
  const H = gioSao(JD) + kinhDo - ra;
  const mau = cos(dec) - rc * sp * cos(H);
  const dRa = Math.atan2(-rc * sp * sin(H), mau);
  const dec2 = Math.atan2((sin(dec) - rs * sp) * Math.cos(dRa), mau);
  return { ra: chuan(ra + dRa / RAD), dec: dec2 / RAD };
}

/* Đưa một điểm trên thiên cầu về độ cao so với chân trời và phương vị tính từ hướng Bắc. */
function docCao(ra, dec, viDo, kinhDo, JD) {
  const H = chuan(gioSao(JD) + kinhDo - ra);           // góc giờ
  const cao = Math.asin(sin(dec) * sin(viDo) + cos(dec) * cos(viDo) * cos(H)) / RAD;
  const az = Math.atan2(-sin(H) * cos(dec),
                        sin(dec) * cos(viDo) - cos(dec) * sin(viDo) * cos(H)) / RAD;
  return { cao, huong: chuan(az) };                    // huong: 0 Bắc, 90 Đông, 180 Nam, 270 Tây
}

/* Khúc xạ khí quyển nâng vật thể lên một chút khi nó gần chân trời — công thức Bennett,
   Meeus chương 16. Không có nó thì giờ mọc lặn lệch mấy phút. */
function khucXa(cao) {
  if (cao < -1) return 0;
  return 1.02 / Math.tan((cao + 10.3 / (cao + 5.11)) * RAD) / 60;
}

/* ---------- mọc, lặn, và trời tối tới đâu ---------- */

/* Tìm mốc thời gian trong ngày mà độ cao của vật thể cắt qua một ngưỡng.
   Quét từng phút rồi nội suy — thô nhưng chắc, và một ngày chỉ có 1440 bước. */
function timNguong(hamViTri, nguong, msDauNgay, viDo, kinhDo, len) {
  let truoc = null;
  for (let p = 0; p <= 1440; p++) {
    const ms = msDauNgay + p * 60000;
    const v = hamViTri(ngayJulius(ms));
    const c = docCao(v.ra, v.dec, viDo, kinhDo, ngayJulius(ms)).cao - nguong;
    if (truoc !== null && ((len && truoc < 0 && c >= 0) || (!len && truoc > 0 && c <= 0))) {
      const t = truoc / (truoc - c);                   // nội suy tuyến tính giữa hai phút
      return ms - 60000 + t * 60000;
    }
    truoc = c;
  }
  return null;
}

/* Mọc và lặn. Ngưỡng độ cao khác nhau giữa hai thiên thể:
   - Mặt Trời -0,833 độ: gồm bán kính đĩa và khúc xạ khí quyển.
   - Mặt Trăng +0,125 độ: Trăng ở gần nên có thị sai chân trời chừng 0,95 độ, trừ đi khúc xạ
     0,57 và bán kính đĩa 0,26 thì còn dương — nên Trăng mọc muộn hơn là chỉ tính khúc xạ. */
const NGUONG = { troi: -0.833, trang: 0.125 };
/* Cùng mốc mọc lặn đó, nhưng so với độ cao ĐÃ trừ thị sai (thiSai): 0,125 trừ đi thị sai chân trời. Thị sai đổi
   theo khoảng cách (0,90° lúc Trăng xa nhất tới 1,02° lúc gần nhất), nên ngưỡng tính theo kc chứ không đặt cứng
   — đặt cứng thì quanh lúc mọc, lặn, dòng chữ trạng thái cãi giờ mọc lặn in ngay bên cạnh. */
const nguongTrangTaiCho = (kcKm) => NGUONG.trang - Math.asin(6378.14 / kcKm) / RAD;
function mocLan(msDauNgay, viDo, kinhDo, thienThe) {
  const trang = thienThe === 'trang';
  const f = (JD) => (trang ? matTrang(JD) : matTroi(JD));
  const nguong = trang ? NGUONG.trang : NGUONG.troi;
  return {
    moc: timNguong(f, nguong, msDauNgay, viDo, kinhDo, true),
    lan: timNguong(f, nguong, msDauNgay, viDo, kinhDo, false),
  };
}

/* Máy đang chĩa về đâu, tính từ ba góc cảm biến của trình duyệt.

   Vì sao phải dựng cả ma trận quay chứ không lấy alpha làm hướng và beta làm độ cao:
   cách rời rạc ấy ĐÚNG TUYỆT ĐỐI khi máy cầm thẳng không nghiêng (gamma = 0), nhưng nó bỏ hẳn
   gamma, mà ngửa máy lên nhìn vật trên cao thì tay luôn nghiêng ít nhiều. Đo được: ngửa 50 độ
   mà nghiêng 20 độ thì sai hướng 30 độ; chĩa gần thẳng đứng mà nghiêng có 5 độ thì sai 68 độ.
   Bầu trời bị quăng đi hàng chục độ theo từng rung tay, và bộ làm mượt cứ đuổi theo một cái
   đích đang nhảy — nhìn ra thì tưởng máy lag, thật ra là toạ độ sai.

   Đặc tả W3C: R = Rz(alpha)·Rx(beta)·Ry(gamma), trục của máy là +X sang phải, +Y lên đỉnh màn
   hình, +Z hướng ra phía người dùng. Mặt lưng máy — chỗ người ta chĩa vào bầu trời — là -Z. */
function huongMay(alpha, beta, gamma) {
  if (typeof beta !== 'number') return null;
  const a = (alpha || 0) * RAD, b = beta * RAD, g = (gamma || 0) * RAD;
  const cA = Math.cos(a), sA = Math.sin(a), cB = Math.cos(b), sB = Math.sin(b);
  const cG = Math.cos(g), sG = Math.sin(g);
  /* Cột thứ ba của R là +Z của máy; lấy âm của nó ra được -Z. */
  const dong = -(cA * sG + sA * sB * cG);
  const bac  = -(sA * sG - cA * sB * cG);
  const len  = -(cB * cG);
  const cao = Math.asin(Math.max(-1, Math.min(1, len))) / RAD;
  let huong = Math.atan2(dong, bac) / RAD;
  if (huong < 0) huong += 360;
  return { huong, cao };
}

/* Đổi qua lại giữa (hướng, độ cao) và vector đơn vị. Cần cặp này để LÀM MƯỢT TRÊN VECTOR.

   Lý do đo được chứ không phải cho đẹp: làm mượt trên góc thì gần thiên đỉnh nó vỡ. Với cùng
   một bàn tay rung như nhau, con số "hướng" nhảy 3,1 độ mỗi khung lúc nhìn ngang nhưng vọt lên
   12,3 độ lúc chĩa gần thẳng đứng — trong khi VECTOR hướng chỉ nhảy đều 3,9 độ ở cả ba tư thế.
   Tức 12,3 độ kia không phải tay rung mạnh hơn, mà là méo mó của hệ toạ độ: chĩa thẳng lên thì
   "hướng la bàn" gần như vô nghĩa, cổ tay xoay tí là nó quay cả vòng. Làm mượt trên vector thì
   một cử động nhỏ của tay luôn ra một thay đổi nhỏ trên màn, bất kể đang nhìn đâu. */
function vecHuong(huong, cao) {
  const c = Math.cos(cao * RAD);
  return { x: c * Math.sin(huong * RAD), y: c * Math.cos(huong * RAD), z: Math.sin(cao * RAD) };
}
function gocHuong(v) {
  const d = Math.hypot(v.x, v.y, v.z) || 1;
  const x = v.x / d, y = v.y / d, z = v.z / d;
  let huong = Math.atan2(x, y) / RAD;
  if (huong < 0) huong += 360;
  return { huong, cao: Math.asin(Math.max(-1, Math.min(1, z))) / RAD };
}

/* Một thiên thể không ở trên trời thì có HAI lý do khác hẳn nhau: chưa mọc, hoặc đã lặn rồi.
   Trả về cái QUYẾT ĐỊNH, còn câu chữ để chỗ hiển thị tự lo — tách ra thì kiểm thử được bằng
   Node, mà chính vì trước đây nó nằm lẫn trong phần vẽ chữ nên không ai canh: dòng chữ gộp cả
   hai thành "chưa lên khỏi chân trời", thành thử mười một giờ đêm mà Trăng lặn từ chín giờ thì
   app vẫn bảo nó chưa lên.

   nguong: độ cao lúc mọc/lặn, đúng ngưỡng mocLan dùng (NGUONG). Bản trước lấy 0 cho mọi thứ, nên
   Mặt Trời mọc lúc 5:42 mà tới 5:45 dòng chữ vẫn bảo "đang ở dưới chân trời" — giờ mọc tính cả khúc
   xạ, còn phép so "trên 0 độ" thì không.

   Trăng mọc muộn hơn mỗi ngày chừng 50 phút, nên nhiều hôm nó mọc tối nay và lặn SÁNG MAI. Bản trước
   chỉ nhìn giờ lặn của hôm nay — đã qua — nên đêm đó không ghi giờ lặn, sáng ra thấy trăng còn treo
   trên trời thì tưởng app tính sai. Giờ lặn của hôm nay đã qua thì lấy giờ lặn ngày mai (mai: true). */
function trangThaiMocLan(cao, ml, mlMai, luc, nguong = 0) {
  ml = ml || { moc: null, lan: null };
  if (cao > nguong) {
    if (ml.lan !== null && ml.lan > luc) return { tinh: 'tren', lan: ml.lan };
    if (mlMai && mlMai.lan !== null && mlMai.lan > luc) return { tinh: 'tren', lan: mlMai.lan, mai: true };
    return { tinh: 'tren', lan: null };
  }
  if (ml.moc !== null && ml.moc > luc) return { tinh: 'chuaMoc', moc: ml.moc };
  if (ml.lan !== null && ml.lan <= luc)
    return { tinh: 'daLan', lan: ml.lan, maiMoc: mlMai && mlMai.moc !== null ? mlMai.moc : null };
  return { tinh: 'khongRo' };
}

/* Tên tuần trăng theo tuổi trăng (ngày kể từ mùng một). Đặt ở đây cho cả bầu trời lẫn cảnh nhìn từ vũ trụ
   cùng dùng: bản trước mỗi bên một cách gọi (bên theo tuổi trăng, bên theo phần trăm đĩa sáng), nên cùng
   một lúc bên này ghi "lưỡi liềm", bên kia ghi "khuyết". */
function tenTrang(tuoi) {
  if (tuoi < 1.5 || tuoi > 28.0) return 'trăng non';
  if (tuoi < 6.5) return 'trăng lưỡi liềm đầu tháng';
  if (tuoi < 8.5) return 'trăng thượng huyền';
  if (tuoi < 13.5) return 'trăng khuyết đầu tháng';
  if (tuoi < 16.5) return 'trăng tròn';
  if (tuoi < 21.5) return 'trăng khuyết cuối tháng';
  if (tuoi < 23.5) return 'trăng hạ huyền';
  return 'trăng lưỡi liềm cuối tháng';
}

/* Trời tối tới mức nào: theo độ cao Mặt Trời dưới chân trời.
   Mốc chạng vạng là quy ước thiên văn chuẩn: -6 dân dụng, -12 hàng hải, -18 thiên văn. */
function doToi(caoMatTroi) {
  if (caoMatTroi > -0.833) return { muc: 'ngay', ten: 'ban ngày' };
  if (caoMatTroi > -6) return { muc: 'chang-vang', ten: 'chạng vạng, sao sáng nhất bắt đầu hiện' };
  if (caoMatTroi > -12) return { muc: 'nhap-nhoang', ten: 'nhá nhem, đã thấy nhiều sao' };
  if (caoMatTroi > -18) return { muc: 'gan-toi', ten: 'gần tối hẳn' };
  return { muc: 'toi', ten: 'tối hẳn, thấy cả sao mờ' };
}

/* ---------- sao, Ngân Hà, khí quyển ---------- */

/* Tuế sai: trục Trái Đất lắc chậm như con quay, nên toạ độ trong danh mục sao (gốc J2000) trôi chừng
   50 giây cung mỗi năm — tới 2026 là 0,36 độ, đủ để đường nối chòm lệch khỏi sao khi phóng to.
   Công thức chặt của Meeus chương 21 (hằng số IAU 1976), từ J2000 tới ngày JD. */
function tueSai(ra, dec, JD) {
  const t = (JD - 2451545.0) / 36525, g = 1 / 3600;
  const zeta = (2306.2181 * t + 0.30188 * t * t + 0.017998 * t * t * t) * g;
  const z = (2306.2181 * t + 1.09468 * t * t + 0.018203 * t * t * t) * g;
  const th = (2004.3109 * t - 0.42665 * t * t - 0.041833 * t * t * t) * g;
  const A = cos(dec) * sin(ra + zeta);
  const B = cos(th) * cos(dec) * cos(ra + zeta) - sin(th) * sin(dec);
  const C = sin(th) * cos(dec) * cos(ra + zeta) + cos(th) * sin(dec);
  return { ra: chuan(Math.atan2(A, B) / RAD + z), dec: Math.asin(Math.max(-1, Math.min(1, C))) / RAD };
}

/* Toạ độ thiên hà (l, b) -> xích đạo J2000. Cực Bắc thiên hà và kinh độ thiên hà của cực Bắc trời
   theo hệ J2000 (bài "Galactic coordinate system" trên Wikipedia: 12h51,4m, +27,13°, 122,93°). */
const CUC_THIEN_HA = { ra: 192.85948, dec: 27.12825, l: 122.93192 };
function tuThienHa(l, b) {
  const G = CUC_THIEN_HA;
  const dec = Math.asin(sin(G.dec) * sin(b) + cos(G.dec) * cos(b) * cos(G.l - l)) / RAD;
  const y = cos(b) * sin(G.l - l), x = cos(G.dec) * sin(b) - sin(G.dec) * cos(b) * cos(G.l - l);
  return { ra: chuan(G.ra + Math.atan2(y, x) / RAD), dec };
}

/* Khối khí quyển ánh sao phải xuyên qua, so với lúc ở đỉnh đầu (= 1). Kasten & Young (1989):
   ở độ cao 10° là 5,6 lần — vì vậy sao sát chân trời mờ hẳn đi. */
function khoiKhi(cao) {
  if (cao <= 0) return 40;
  return 1 / (sin(cao) + 0.50572 * Math.pow(cao + 6.07995, -1.6364));
}

/* Màu sao. Chỉ số màu B−V ra nhiệt độ bề mặt theo Ballesteros (2012); nhiệt độ ra màu RGB theo
   cách xấp xỉ màu vật đen của Tanner Helland. Rồi pha nửa phần với trắng: mắt người nhìn sao ban đêm
   thấy màu rất nhạt, chỉ sao thật đỏ (Tâm Đại Hoả) hay thật xanh (Chức Nữ) mới nhận ra. */
const nhietDoSao = (bv) => 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
function mauSao(bv) {
  const t = nhietDoSao(bv) / 100, kep = (x) => Math.max(0, Math.min(255, x));
  const r = t <= 66 ? 255 : kep(329.698727446 * Math.pow(t - 60, -0.1332047592));
  const g = t <= 66 ? kep(99.4708025861 * Math.log(t) - 161.1195681661) : kep(288.1221695283 * Math.pow(t - 60, -0.0755148492));
  const b = t >= 66 ? 255 : t <= 19 ? 0 : kep(138.5177312231 * Math.log(t - 10) - 305.0447927307);
  return [r, g, b].map(c => Math.round((c + 255) / 2));
}

/* Giải chuỗi sao trong saosang.js (xem scripts/lam-saosang.py): 8 ký tự cơ số 36 mỗi sao. */
function giaiSao(du, dem) {
  const ra = new Float64Array(dem), dec = new Float64Array(dem), v = new Float32Array(dem), bv = new Float32Array(dem);
  for (let i = 0; i < dem; i++) {
    const o = i * 8;
    ra[i] = parseInt(du.substr(o, 3), 36) / 100;
    dec[i] = parseInt(du.substr(o + 3, 3), 36) / 100 - 90;
    v[i] = parseInt(du[o + 6], 36) / 4 - 1.5;
    bv[i] = parseInt(du[o + 7], 36) / 10 - 0.4;
  }
  return { ra, dec, v, bv };
}

const API = { ngayJulius, matTroi, matTrang, hanhTinh, docCao, gioSao, khucXa, thiSai, tenTrang, nguongTrangTaiCho,
              mocLan, NGUONG, trangThaiMocLan, huongMay, vecHuong, gocHuong, doToi, timNguong, chuan, quanh, TEN_HANH_TINH: Object.keys(BANG),
              tueSai, tuThienHa, CUC_THIEN_HA, khoiKhi, nhietDoSao, mauSao, giaiSao, nhatTamJD, quyDao, nghieng };

if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_ASTRO = API;
})();

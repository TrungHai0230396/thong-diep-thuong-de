/* Lịch vạn niên thuần: âm lịch, can chi, ngày hoàng đạo hắc đạo, trực, giờ hoàng đạo,
   ngày Tam nương Nguyệt kỵ, tuổi xung — và gợi ý ngày tốt cho một việc định làm.

   Không tự đặt ra luật nào. Nguồn:
   - Âm lịch và can chi: thuật toán của Hồ Ngọc Đức, "Thuật toán tính âm lịch",
     https://www.xemamlich.uhm.vn/calrules.html — chép lại từng dòng, giữ nguyên mọi hệ số.
     Múi giờ 7.0, tính theo kinh tuyến 105° Đông, nên có tháng lệch một ngày so với lịch
     Trung Quốc tính theo 120° Đông.
   - Mười hai thần hoàng đạo hắc đạo và chỗ khởi Thanh Long theo tháng âm:
     saptet.com/hoang-dao, khớp với xemlicham.com, lichvannien365.com, lichngaytot.com.
   - Mười hai trực: tính theo **tháng tiết khí** chứ không theo tháng âm — ja.wikipedia 十二直
     và zh.wikipedia 建除十二神 (dẫn Hiệp kỷ biện phương thư: "mỗi tháng giao tiết thì trùng
     hai trực"). Bốn trang lịch vạn niên kể trên đều ra đúng như vậy.
   - Danh sách nên làm, không nên làm của từng trực: theo **một nguồn duy nhất** là
     lichvannien365.com. Các trang cãi nhau ở đây — trực Khai trang này nói nên động thổ,
     trang kia nói kỵ — nên không trộn, lấy một nguồn và ghi rõ.
   - Giờ hoàng đạo theo chi của ngày: bảng của saptet.com, khớp với ba trang còn lại.
     (Trang viettopreview tra theo can của ngày — sai với mọi ngày đã đối chiếu, không dùng.)
   - Tam nương mùng 3, 7, 13, 18, 22, 27; Nguyệt kỵ mùng 5, 14, 23 âm lịch.
   - Tuổi xung: lục xung, hai chi đối nhau trên vòng mười hai (Tý–Ngọ, Sửu–Mùi...).

   Không có luật nào trong lịch vạn niên dùng tên người, nên ở đây không hỏi tên. */
(() => {
'use strict';

const INT = Math.floor;
const PI = Math.PI;
const TZ = 7.0;

/* ---------- Hồ Ngọc Đức: ngày Julius ---------- */

function jdFromDate(dd, mm, yy) {
  const a = INT((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
  if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
  return jd;
}

function jdToDate(jd) {
  let a, b, c;
  if (jd > 2299160) { a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT((b * 146097) / 4); }
  else { b = 0; c = jd + 32082; }
  const d = INT((4 * c + 3) / 1461);
  const e = c - INT((1461 * d) / 4);
  const m = INT((5 * e + 2) / 153);
  return [e - INT((153 * m + 2) / 5) + 1, m + 3 - 12 * INT(m / 10), b * 100 + d - 4800 + INT(m / 10)];
}

/* ---------- Hồ Ngọc Đức: trăng non và kinh độ Mặt Trời ---------- */

function getNewMoonDay(k, timeZone) {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return INT(Jd1 + C1 - deltat + 0.5 + timeZone / 24);
}

/* Kinh độ Mặt Trời, độ, theo đúng công thức của trang. Hồ Ngọc Đức chia nó ra mười hai
   cung để tìm trung khí; ở đây giữ nguyên số thực vì trực cần mốc tiết, lệch 15 độ. */
function kinhDoTroi(jdTho, timeZone) {
  const T = (jdTho - 2451545.5 - timeZone / 24) / 36525, T2 = T * T, dr = PI / 180;
  const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
  const L = (L0 + DL) % 360;
  return L < 0 ? L + 360 : L;
}

function getSunLongitude(jdn, timeZone) {
  return INT(kinhDoTroi(jdn, timeZone) / 30);
}

function getLunarMonth11(yy, timeZone) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  if (getSunLongitude(nm, timeZone) >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

function getLeapMonthOffset(a11, timeZone) {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0, i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc; i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/* Trang gốc thiếu câu return ở hàm này; thêm vào, còn lại giữ nguyên. */
function convertSolar2Lunar(dd, mm, yy, timeZone) {
  let lunarYear, lunarLeap = 0;
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  let a11 = getLunarMonth11(yy, timeZone), b11 = a11;
  if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, timeZone); }
  else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, timeZone); }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) lunarLeap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap, timeZone) {
  let a11, b11;
  if (lunarMonth < 11) { a11 = getLunarMonth11(lunarYear - 1, timeZone); b11 = getLunarMonth11(lunarYear, timeZone); }
  else { a11 = getLunarMonth11(lunarYear, timeZone); b11 = getLunarMonth11(lunarYear + 1, timeZone); }
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap !== 0 && lunarMonth !== leapMonth) return [0, 0, 0];
    else if (lunarLeap !== 0 || off >= leapOff) off += 1;
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  return jdToDate(getNewMoonDay(k + off, timeZone) + lunarDay - 1);
}

/* ---------- can chi ---------- */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CON = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];

const canChiNam = (Y) => ({ can: (Y + 6) % 10, chi: (Y + 8) % 12 });
const canChiThang = (Y, M) => ({ can: (Y * 12 + M + 3) % 10, chi: (M + 1) % 12 });
const canChiNgay = (N) => ({ can: (N + 9) % 10, chi: (N + 1) % 12 });
const tenCC = (cc) => `${CAN[cc.can]} ${CHI[cc.chi]}`;

/* ---------- tiết khí ---------- */

const TIET = ['Xuân phân', 'Thanh minh', 'Cốc vũ', 'Lập hạ', 'Tiểu mãn', 'Mang chủng',
  'Hạ chí', 'Tiểu thử', 'Đại thử', 'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ',
  'Sương giáng', 'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn',
  'Lập xuân', 'Vũ thủy', 'Kinh trập'];

/* Tháng tiết khí mà một ngày rơi vào, xét lúc giữa trưa giờ Việt Nam.
   Vì sao giữa trưa: ngày 7/9/2026 tiết Bạch lộ bắt đầu lúc 21 giờ 41. Ba trong bốn trang
   lịch vạn niên coi hôm đó vẫn thuộc tháng Thân (trực Kiến), một trang coi là đã sang tháng
   Dậu (trực Bế). Xét lúc giữa trưa thì ra đúng như ba trang đông hơn, và cũng khớp ngày
   4/2/2026, Lập xuân lúc 3 giờ 02, cả bốn trang đều coi là đã sang tháng mới. */
function kinhDoTrua(N) { return kinhDoTroi(N + 0.5, TZ); }
const chiThangTiet = (N) => (2 + INT((((kinhDoTrua(N) - 315) % 360) + 360) % 360 / 30)) % 12;
const tenTiet = (N) => TIET[INT(kinhDoTrua(N) / 15) % 24];

/* ---------- mười hai thần: ngày hoàng đạo, hắc đạo ---------- */

const THAN = [
  { ten: 'Thanh Long', tot: true,  y: 'ngày đại cát, làm gì cũng thuận' },
  { ten: 'Minh Đường', tot: true,  y: 'ngày sáng sủa, gặp quý nhân giúp đỡ' },
  { ten: 'Thiên Hình', tot: false, y: 'dễ vướng thị phi, kiện cáo' },
  { ten: 'Chu Tước',   tot: false, y: 'dễ sinh cãi cọ, lời qua tiếng lại' },
  { ten: 'Kim Quỹ',    tot: true,  y: 'ngày của tiền của, cưới hỏi' },
  { ten: 'Kim Đường',  tot: true,  y: 'việc gì cũng dễ thành', khac: 'Bảo Quang' },
  { ten: 'Bạch Hổ',    tot: false, y: 'nên tránh việc lớn, dễ gặp trắc trở' },
  { ten: 'Ngọc Đường', tot: true,  y: 'tốt cho giấy tờ, học hành, gặp gỡ' },
  { ten: 'Thiên Lao',  tot: false, y: 'việc dễ bị trói buộc, kéo dài' },
  { ten: 'Nguyên Vũ',  tot: false, y: 'dễ mất mát, bị lừa', khac: 'Huyền Vũ' },
  { ten: 'Tư Mệnh',    tot: true,  y: 'ngày tốt, ban ngày làm việc thuận hơn' },
  { ten: 'Câu Trần',   tot: false, y: 'việc dễ dây dưa, vướng víu', khac: 'Câu Trận' },
];

/* Thanh Long khởi ở chi nào tuỳ tháng âm: tháng 1 và 7 ở Tý, 2 và 8 ở Dần, 3 và 9 ở Thìn,
   4 và 10 ở Ngọ, 5 và 11 ở Thân, 6 và 12 ở Tuất. Tháng nhuận dùng số của tháng nó lặp lại. */
const thanNgay = (thangAm, chiNgay) => (chiNgay - ((thangAm - 1) % 6) * 2 + 12) % 12;

/* Giờ Thanh Long theo chi ngày: Tý Ngọ khởi Thân, Sửu Mùi khởi Tuất, Dần Thân khởi Tý,
   Mão Dậu khởi Dần, Thìn Tuất khởi Thìn, Tỵ Hợi khởi Ngọ. */
const thanGio = (chiNgay, chiGio) => (chiGio - (8 + 2 * (chiNgay % 6)) % 12 + 12) % 12;
const KHUNG_GIO = ['23–1h', '1–3h', '3–5h', '5–7h', '7–9h', '9–11h',
                   '11–13h', '13–15h', '15–17h', '17–19h', '19–21h', '21–23h'];

/* ---------- mười hai trực ----------
   Nên, không nên: nguyên văn lichvannien365.com, "Tốt cho các việc / Xấu cho các việc". */

const TRUC = [
  { ten: 'Kiến',  nen: ['thi ơn huệ', 'trồng cây cối'], kieng: ['chôn cất', 'đào giếng', 'lợp nhà'] },
  { ten: 'Trừ',   nen: ['trừ phục', 'cúng giải', 'cạo đầu'], kieng: ['xuất vốn', 'hội họp', 'châm chích'] },
  { ten: 'Mãn',   nen: ['xuất hành', 'sửa kho', 'dựng nhà', 'mở tiệm'], kieng: ['chôn cất', 'thưa kiện', 'xuất vốn', 'nhậm chức'] },
  { ten: 'Bình',  nen: ['rời bếp', 'thượng lương', 'làm chuồng lục súc'], kieng: ['khai trương', 'xuất nhập tài vật', 'giá thú', 'động thổ'] },
  { ten: 'Định',  nen: ['giao dịch', 'buôn bán', 'làm chuồng lục súc', 'thi ơn huệ'], kieng: ['xuất hành', 'thưa kiện', 'châm chích', 'an sàng'] },
  { ten: 'Chấp',  nen: ['tạo tác', 'sửa giếng', 'thu người làm'], kieng: ['xuất nhập vốn liếng', 'khai kho', 'an sàng'] },
  { ten: 'Phá',   nen: ['dỡ nhà', 'phá vách', 'ra đi'], kieng: ['mở cửa hàng', 'may mặc', 'sửa kho', 'hội họp'] },
  { ten: 'Nguy',  nen: ['cúng lễ', 'may mặc', 'từ tụng'], kieng: ['hội họp', 'châm chích', 'giá thú', 'làm chuồng lục súc', 'khai trương'] },
  { ten: 'Thành', nen: ['nhập học', 'giá thú', 'may mặc', 'thượng lương'], kieng: ['kiện tụng', 'mai táng', 'châm chích', 'di cư'] },
  { ten: 'Thu',   nen: ['khai trương', 'lập kho vựa', 'giao dịch', 'may mặc'], kieng: ['an táng', 'giá thú', 'nhậm chức', 'xuất nhập tài vật'] },
  { ten: 'Khai',  nen: ['làm nhà', 'động thổ', 'làm chuồng gia súc', 'giá thú', 'đào giếng'], kieng: ['giao dịch', 'châm chích', 'trồng tỉa'] },
  { ten: 'Bế',    nen: ['làm cửa', 'thượng lương', 'giá thú', 'trị bệnh'], kieng: ['nhậm chức', 'châm chích', 'đào giếng', 'kiện thưa'] },
];

/* Chữ cổ trong mấy danh sách trên, giảng ra cho người đọc bây giờ. */
const GIANG = {
  'thi ơn huệ': 'làm việc thiện', 'thượng lương': 'cất nóc nhà', 'lục súc': 'gia súc',
  'an sàng': 'kê giường', 'châm chích': 'châm cứu, tiêm chích', 'giá thú': 'cưới hỏi',
  'trừ phục': 'bỏ tang', 'rời bếp': 'dời bếp', 'từ tụng': 'thưa kiện', 'tạo tác': 'xây dựng',
  'xuất nhập tài vật': 'đưa tiền của ra vào', 'xuất nhập vốn liếng': 'đưa vốn ra vào',
};

const TRUC_CHI = (chiThang, chiNgay) => (chiNgay - chiThang + 12) % 12;

/* ---------- ngày kiêng theo ngày âm ---------- */

const TAM_NUONG = [3, 7, 13, 18, 22, 27];
const NGUYET_KY = [5, 14, 23];

/* ---------- việc định làm ----------
   Mỗi việc có: những chữ trong danh sách nên/kiêng của trực mà nó ứng với, những từ người
   dùng hay gõ để nhận ra nó, và có kiêng ngày Tam nương Nguyệt kỵ không.
   Chỗ ứng việc hiện đại với chữ cổ là phần biên soạn của app, không phải của nguồn. */
const VIEC = [
  { ma: 'khai-truong', ten: 'Khai trương, mở cửa hàng', chu: ['khai trương', 'mở tiệm', 'mở cửa hàng'],
    go: ['khai trương', 'mở quán', 'mở cửa hàng', 'mở tiệm', 'mở shop', 'mở công ty', 'kinh doanh'], kiengTN: true },
  { ma: 'cuoi-hoi', ten: 'Cưới hỏi', chu: ['giá thú'],
    go: ['cưới', 'đám cưới', 'ăn hỏi', 'dạm ngõ', 'kết hôn', 'lấy vợ', 'lấy chồng', 'đính hôn'], kiengTN: true },
  { ma: 'dong-tho', ten: 'Động thổ, làm nhà', chu: ['động thổ', 'dựng nhà', 'làm nhà', 'tạo tác', 'thượng lương', 'lợp nhà', 'làm cửa'],
    go: ['động thổ', 'xây nhà', 'làm nhà', 'sửa nhà', 'cất nóc', 'đổ móng', 'xây dựng', 'khởi công'], kiengTN: true },
  { ma: 'chuyen-nha', ten: 'Chuyển nhà, nhập trạch', chu: ['di cư', 'an sàng'],
    go: ['chuyển nhà', 'dọn nhà', 'nhập trạch', 'về nhà mới', 'dời nhà', 'chuyển văn phòng'], kiengTN: true },
  { ma: 'giao-dich', ten: 'Ký hợp đồng, mua bán', chu: ['giao dịch', 'buôn bán', 'xuất nhập tài vật', 'xuất vốn', 'xuất nhập vốn liếng'],
    go: ['ký hợp đồng', 'ký kết', 'ký giấy', 'hợp đồng', 'giao dịch', 'mua bán', 'đầu tư', 'mua nhà', 'mua xe', 'mua đất', 'vay tiền'], kiengTN: true },
  { ma: 'xuat-hanh', ten: 'Đi xa, xuất hành', chu: ['xuất hành', 'ra đi'],
    go: ['đi xa', 'xuất hành', 'du lịch', 'công tác', 'đi chơi', 'lên đường', 'đi nước ngoài'], kiengTN: true },
  { ma: 'chua-benh', ten: 'Khám chữa bệnh', chu: ['trị bệnh', 'châm chích'],
    go: ['khám bệnh', 'đi khám', 'khám sức khỏe', 'khám sức khoẻ', 'khám răng', 'chữa bệnh', 'phẫu thuật', 'mổ', 'tiêm', 'nhổ răng', 'châm cứu', 'nhập viện'], kiengTN: false },
  { ma: 'nham-chuc', ten: 'Nhận việc, nhậm chức', chu: ['nhậm chức'],
    go: ['nhậm chức', 'đi làm', 'nhận việc', 'phỏng vấn', 'thăng chức', 'việc mới', 'xin việc'], kiengTN: false },
  { ma: 'nhap-hoc', ten: 'Nhập học, thi cử', chu: ['nhập học'],
    go: ['nhập học', 'đi học', 'đi thi', 'thi cử', 'thi đại học', 'thi tuyển', 'khai giảng'], kiengTN: false },
  { ma: 'kien-tung', ten: 'Kiện tụng', chu: ['thưa kiện', 'kiện tụng', 'kiện thưa', 'từ tụng'],
    go: ['kiện tụng', 'khởi kiện', 'đi kiện', 'thưa kiện', 'tranh chấp', 'toà án', 'tòa án', 'hầu toà', 'hầu tòa'], kiengTN: false },
  { ma: 'an-tang', ten: 'An táng', chu: ['chôn cất', 'mai táng', 'an táng'],
    go: ['an táng', 'chôn', 'mai táng', 'đám tang', 'cải táng', 'bốc mộ'], kiengTN: false },
  { ma: 'cung-le', ten: 'Cúng lễ', chu: ['cúng lễ', 'cúng giải'],
    go: ['cúng', 'đi lễ', 'cúng lễ', 'lễ chùa', 'giỗ', 'cầu an', 'đi chùa'], kiengTN: false },
  { ma: 'hoi-hop', ten: 'Họp mặt, gặp gỡ', chu: ['hội họp'],
    go: ['họp', 'họp mặt', 'gặp mặt', 'tiệc', 'gặp gỡ', 'liên hoan'], kiengTN: false },
  { ma: 'cat-toc', ten: 'Cắt tóc', chu: ['cạo đầu'], go: ['cắt tóc', 'cạo đầu', 'làm tóc'], kiengTN: false },
  { ma: 'trong-cay', ten: 'Trồng cây', chu: ['trồng cây cối', 'trồng tỉa'], go: ['trồng'], kiengTN: false },
];

/* Nhận ra việc định làm từ câu người dùng gõ. Không khớp thì trả về null.
   Dò theo **chữ trọn vẹn**, không theo chuỗi con: lúc đầu dò chuỗi con thì "tổ chức sự kiện"
   ra kiện tụng, "đi khám phá hang động" ra khám bệnh, "thiết kế lại phòng" ra thi cử (vì
   "thiết" chứa "thi"), "đăng ký tài khoản" ra ký hợp đồng. Tiếng Việt viết mỗi tiếng cách
   nhau một khoảng trắng, nên bọc cả câu lẫn từ khoá trong khoảng trắng là đủ ranh giới. */
/* Từ ghép trùng chữ với từ khoá nhưng nghĩa khác hẳn. Gỡ ra khỏi câu trước khi dò, kẻo
   "đi khám phá hang động" vẫn khớp trọn hai chữ "đi khám". */
const TU_GHEP_NHAM = ['khám phá', 'sự kiện', 'đăng ký', 'lễ hội', 'khoa học', 'thiết kế'];

function nhanViec(cau) {
  let s = ' ' + (cau || '').toLowerCase().normalize('NFC')
    .replace(/[.,;:!?()"'“”‘’\-–—\/]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  for (const g of TU_GHEP_NHAM) s = s.split(' ' + g + ' ').join(' ');
  let tot = null, dai = 0;
  for (const v of VIEC) for (const g of v.go) {
    if (s.includes(' ' + g + ' ') && g.length > dai) { tot = v; dai = g.length; }   // khớp cụm dài nhất
  }
  return tot;
}

/* ---------- tuổi ---------- */

/* Tuổi tính theo năm âm: sinh trước Tết thì thuộc năm âm trước. */
function tuoi(dd, mm, yy) {
  const [, , Y] = convertSolar2Lunar(dd, mm, yy, TZ);
  const cc = canChiNam(Y);
  return { namAm: Y, can: cc.can, chi: cc.chi, ten: tenCC(cc), con: CON[cc.chi] };
}

const xung = (chiTuoi, chiNgay) => chiNgay === (chiTuoi + 6) % 12;

/* ---------- xem một ngày ---------- */

function xemNgay(dd, mm, yy, sinh) {
  const N = jdFromDate(dd, mm, yy);
  const [ad, am, ay, nhuan] = convertSolar2Lunar(dd, mm, yy, TZ);
  const ngay = canChiNgay(N), thang = canChiThang(ay, am), nam = canChiNam(ay);
  const th = THAN[thanNgay(am, ngay.chi)];
  const tr = TRUC[TRUC_CHI(chiThangTiet(N), ngay.chi)];
  const gio = [];
  for (let h = 0; h < 12; h++) {
    const t = THAN[thanGio(ngay.chi, h)];
    if (t.tot) gio.push({ chi: CHI[h], khung: KHUNG_GIO[h], than: t.ten });
  }
  const r = {
    duong: { dd, mm, yy, thu: (N + 1) % 7 },            // thứ: 0 là Chủ nhật
    am: { ngay: ad, thang: am, nam: ay, nhuan: !!nhuan },
    canChi: { ngay: tenCC(ngay), thang: tenCC(thang), nam: tenCC(nam) },
    chiNgay: ngay.chi,
    than: th, hoangDao: th.tot,
    truc: tr,
    tiet: tenTiet(N),
    gio,
    tamNuong: TAM_NUONG.includes(ad),
    nguyetKy: NGUYET_KY.includes(ad),
  };
  if (sinh) r.xungTuoi = xung(sinh.chi, ngay.chi);
  return r;
}

/* ---------- chấm một ngày cho một việc ---------- */

const khop = (ds, chu) => ds.filter(x => chu.some(c => x.includes(c) || c.includes(x)));

function cham(ng, viec) {
  let diem = 0;
  const vi = [], canh = [];
  if (ng.hoangDao) { diem += 2; vi.push(`hoàng đạo ${ng.than.ten}`); }
  else { diem -= 2; canh.push(`hắc đạo ${ng.than.ten}`); }
  const nen = khop(ng.truc.nen, viec.chu), kieng = khop(ng.truc.kieng, viec.chu);
  if (nen.length) { diem += 3; vi.push(`trực ${ng.truc.ten} nên ${nen.join(', ')}`); }
  if (kieng.length) { diem -= 4; canh.push(`trực ${ng.truc.ten} kỵ ${kieng.join(', ')}`); }
  if (viec.kiengTN && ng.tamNuong) { diem -= 4; canh.push('ngày Tam nương'); }
  if (viec.kiengTN && ng.nguyetKy) { diem -= 4; canh.push('ngày Nguyệt kỵ'); }
  if (ng.xungTuoi) { diem -= 5; canh.push('xung tuổi'); }
  return { diem, vi, canh };
}

/* Tìm mấy ngày tốt nhất cho một việc, từ một ngày cho trước, trong số ngày cho trước.
   Chỉ lấy ngày điểm dương; ngày bằng điểm thì ngày gần hơn đứng trước. */
function timNgay(viec, tu, soNgay, sinh, lay = 5) {
  const N0 = jdFromDate(tu.dd, tu.mm, tu.yy);
  const ds = [];
  for (let i = 0; i < soNgay; i++) {
    const [dd, mm, yy] = jdToDate(N0 + i);
    const ng = xemNgay(dd, mm, yy, sinh);
    const c = cham(ng, viec);
    if (c.diem > 0) ds.push({ ng, ...c, cach: i });
  }
  ds.sort((a, b) => b.diem - a.diem || a.cach - b.cach);
  return ds.slice(0, lay);
}

const API = {
  jdFromDate, jdToDate, convertSolar2Lunar, convertLunar2Solar, getNewMoonDay,
  canChiNam, canChiThang, canChiNgay, tenCC, chiThangTiet, tenTiet, kinhDoTrua,
  thanNgay, thanGio, xemNgay, cham, timNgay, nhanViec, tuoi, xung,
  CAN, CHI, CON, THAN, TRUC, TIET, VIEC, GIANG, TAM_NUONG, NGUYET_KY, KHUNG_GIO, TZ,
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_LICH = API;
})();

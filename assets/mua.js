/* Đọc dự báo mưa theo giờ thành câu tiếng Việt. Hàm THUẦN, không đụng mạng, không đụng DOM —
   phần đi xin dữ liệu nằm ở nightsky.js. Tách ra để kiểm thử được bằng Node, vì đây là chỗ dễ
   sai nhất mà sai thì không để lại dấu vết gì trên màn hình.

   MỐC GIỜ ỨNG VỚI GIỜ LIỀN TRƯỚC. Open-Meteo trả lượng mưa tại mốc 15:00 là tổng của khoảng
   14:00–15:00. Hiểu ngược là sai 100% số trường hợp, sai đúng một lượng cố định, và nhìn vào
   giao diện không tài nào thấy được. Tôi đã kiểm bằng thực nghiệm chứ không tin trí nhớ: lấy
   dữ liệu 15 phút gốc ở Berlin rồi cộng bốn mốc lại — cộng bốn mốc TRƯỚC thì khớp 0,00mm suốt
   22 giờ, cộng bốn mốc SAU thì lệch 5,4mm.

   Ba chỗ cố ý KHÔNG làm, vì làm là nói dối:
   - Không bao giờ viết "không mưa", chỉ viết "bản dự báo không thấy mưa".
   - Không viết "mưa lúc 15:20". Dữ liệu chỉ mịn tới từng giờ và ô lưới rộng chừng 27km, viết
     giờ phút là bịa ra hai chữ số cuối.
   - Không viết "30%", và cũng không kể "máy chạy 30 lần" cho người dùng nghe: họ chỉ cần biết
     khi nào mưa, mưa cỡ nào, còn bao lâu. Con số ấy vẫn được dùng bên trong để quyết định một giờ
     có tính là giờ mưa hay không. */
(function (root) {
'use strict';

const GIO = 3600000;
const MM_CO_MUA = .2;          // từ đây trở lên thì tính là giờ có mưa
const LAN_CO_MUA = 15;         // hoặc từ 15 trên 30 lần chạy trở lên
const SO_LAN_CHAY = 30;        // Open-Meteo chạy 30 lần mô phỏng để ra xác suất
const MA_DONG = [95, 96, 99];  // mã thời tiết WMO: dông

/* Ngưỡng WMO cho mm mỗi giờ, tả bằng việc người ta làm chứ không bằng tính từ.
   KHÔNG dùng chữ "mưa phùn": mưa phùn định nghĩa bằng cỡ hạt, mà API chỉ trả về mm. */
const NANG = [
  [.5,  'lất phất vài hạt, chưa ướt áo'],
  [2.5, 'mưa nhẹ, đi bộ mươi phút thì ẩm vai'],
  [7.5, 'mưa vừa, ra đường là ướt, nên mặc áo mưa'],
  [20,  'mưa to, nặng hạt, chạy xe khó nhìn'],
  [50,  'mưa rất to, nên đợi cho ngớt'],
  [1e9, 'mưa như trút, đừng ra đường'],
];
const taNang = (mm) => (NANG.find(n => mm < n[0]) || NANG[NANG.length - 1])[1];

/* Lấy số giờ THẲNG TỪ CHUỖI, không đi qua Date. Open-Meteo trả chuỗi không mang múi giờ
   ("2026-09-16T17:00"); đưa vào new Date() thì trình duyệt hiểu theo múi của MÁY, nên máy ở
   múi khác là hiện lệch giờ mà không có dấu hiệu gì. Cắt chuỗi thì con số hiện ra luôn đúng
   bằng con số dịch vụ nói, bất kể máy đang ở đâu. */
const gioChu = (s) => +String(s).slice(11, 13);

/* Đọc mảng theo giờ thành một quyết định. Trả về vật, câu chữ để hàm cau() lo. */
function doc(gio, luc) {
  if (!gio || !gio.time || !gio.time.length) return { tinh: 'chuaBiet' };
  const n = gio.time.length;
  const mmCua = (i) => {
    const r = (gio.rain && gio.rain[i]) || 0, ra = (gio.showers && gio.showers[i]) || 0;
    const p = gio.precipitation ? gio.precipitation[i] : r + ra;
    return Math.max(p || 0, r + ra);
  };
  const lanCua = (i) => Math.round(((gio.precipitation_probability || [])[i] || 0) / 100 * SO_LAN_CHAY);
  const lucCua = (i) => new Date(gio.time[i]).getTime();

  /* Một giờ tính là có mưa khi đủ lượng, HOẶC khi quá nửa số lần chạy thấy có mưa. */
  const co = [];
  for (let i = 0; i < n; i++) co.push(mmCua(i) >= MM_CO_MUA || lanCua(i) >= LAN_CO_MUA);

  /* Gom các giờ liền nhau thành một đợt; hai đợt cách nhau đúng một giờ khô thì nối làm một,
     vì nói "mưa 15–16 giờ rồi lại 17–18 giờ" thì đúng mà vô dụng. */
  const dot = [];
  for (let i = 0; i < n; i++) {
    if (!co[i]) continue;
    const cuoi = dot[dot.length - 1];
    if (cuoi && i - cuoi.den <= 2) cuoi.den = i;
    else dot.push({ tu: i, den: i });
  }
  const d = dot.find(x => lucCua(x.den) > luc);
  if (!d) return { tinh: 'khong', soGio: n };
  /* Bỏ phần đợt đã trôi qua. Đợt 14–16 giờ mà lúc này đã 15 giờ thì không được nói "khoảng
     14–16 giờ": người đọc lúc 15 giờ thấy số 14 là tưởng app báo sai. Tính từ giờ mưa đầu tiên
     chưa hết (mốc còn ở phía trước), và nếu giờ đó đang diễn ra thì nói là "từ giờ tới...". */
  while (d.tu < d.den && !(lucCua(d.tu) > luc && co[d.tu])) d.tu++;

  let mm = 0, lan = 0, dong = false;
  for (let i = d.tu; i <= d.den; i++) {
    mm = Math.max(mm, mmCua(i));
    lan = Math.max(lan, lanCua(i));
    if (MA_DONG.includes((gio.weather_code || [])[i])) dong = true;
  }
  /* Mốc ứng với giờ liền TRƯỚC, nên đợt bắt đầu từ một tiếng trước mốc đầu tiên. Lấy luôn
     chuỗi của mốc liền trước nếu có, khỏi phải tự trừ giờ rồi lại lo chuyện múi giờ. */
  const batDau = lucCua(d.tu) - GIO, ketThuc = lucCua(d.den);
  /* Trừ thẳng một tiếng từ chính mốc đầu đợt, KHÔNG đọc mốc đứng trước nó trong mảng. Đọc mốc
     trước là ngầm tin rằng mảng luôn đủ giờ liền nhau — API thật thì đúng vậy, nhưng chỉ cần
     một giờ bị khuyết là ra số sai mà không có gì báo. Trừ một tiếng thì luôn đúng nghĩa. */
  const gioTu = (gioChu(gio.time[d.tu]) + 23) % 24;
  const gioDen = gioChu(gio.time[d.den]);
  return {
    tinh: 'co', batDau, ketThuc, gioTu, gioDen, mm, lan, dong,
    dangDien: batDau <= luc,
    gioBayGio: new Date(luc).getHours(),
    conBaoLau: Math.max(0, (batDau - luc) / GIO),
    conLai: Math.max(0, (ketThuc - luc) / GIO),          // mấy tiếng nữa thì hết đợt
    dai: Math.round((ketThuc - batDau) / GIO),           // đợt dài mấy tiếng, tính bằng thời gian thật
    soGio: n,
  };
}

/* Dựng câu. Ba dòng, không hơn: KHI NÀO, NẶNG CỠ NÀO, CÒN BAO LÂU VÀ CHẮC TỚI ĐÂU. */
function cau(kq) {
  if (!kq || kq.tinh === 'chuaBiet') return [];
  if (kq.tinh === 'khong')
    return [`Bản dự báo không thấy mưa trong ${Math.round(kq.soGio)} giờ tới.`];

  const d = [];
  const tuG = kq.gioTu, denG = kq.gioDen;
  const xa = kq.conBaoLau;

  /* Quá mười hai tiếng thì KHÔNG nêu giờ nữa. Ở tầm đó con số giờ chỉ là vẻ ngoài chính xác. */
  const gi = kq.dong ? 'dông' : 'mưa';
  /* Độ dài đợt lấy từ thời gian thật, KHÔNG lấy hiệu hai con số giờ. Bản trước lấy hiệu giờ,
     nên đợt 24 tiếng (14 giờ chiều nay tới 14 giờ chiều mai) ra độ dài 0 và bị đọc thành
     "Khoảng 14 giờ chiều có dông" — người dùng nhìn thấy câu đó lúc 15 giờ. */
  const dai = kq.dai;
  const quaDem = tuG + dai >= 24;              // vắt qua nửa đêm
  if (kq.dangDien) {
    const mai = denG <= kq.gioBayGio && kq.conLai > 0 ? ' mai' : '';
    /* Đợt dài thì không nói như một trận liền, và có dông ở đâu đó trong đợt không có nghĩa là
       dông suốt: "mưa rải rác, có lúc dông". Hết đợt còn quá mười hai tiếng thì không nêu giờ
       tạnh, cùng lý do không nêu giờ bắt đầu khi còn xa: con số giờ chỉ là vẻ ngoài chính xác. */
    const raiRac = kq.dong ? 'mưa rải rác, có lúc dông' : 'mưa rải rác';
    if (kq.conLai > 12) d.push(`Từ giờ tới ${buoi(denG)}${mai} còn ${raiRac}.`);
    else if (kq.conLai >= 6) d.push(`Từ giờ tới khoảng ${denG} giờ ${buoi(denG)}${mai} có ${raiRac}.`);
    else d.push(`Từ giờ tới khoảng ${denG} giờ ${buoi(denG)}${mai} có ${gi}.`);
  }
  else if (xa > 12) d.push(`Muộn hơn trong ngày có thể có ${gi}.`);
  /* Vắt qua nửa đêm thì tuyệt đối không viết "14–1 giờ": đọc lên là vô nghĩa. */
  else if (quaDem)
    d.push(`Từ khoảng ${tuG} giờ ${buoi(tuG)} tới ${denG} giờ ${buoi(denG)} mai có ${gi}${dai >= 6 ? ', rải rác' : ''}.`);
  /* Đợt dài thì phải nói "rải rác": nói như một trận mưa liền mạch là tả sai cái đang xảy ra. */
  else if (dai >= 6)
    d.push(`Có ${gi} rải rác từ khoảng ${tuG} giờ tới ${denG} giờ ${buoi(denG)}.`);
  else d.push(`Khoảng ${tuG}–${denG} giờ ${buoi(denG)} có ${gi}.`);

  d.push(`Lúc nặng nhất chừng ${so1(kq.mm)} mm một tiếng — ${taNang(kq.mm)}.`);

  d.push(kq.dangDien ? (kq.conLai <= 3 ? 'Dự báo ở tầm gần thế này khá sát.'
                        : kq.conLai <= 12 ? 'Giờ tạnh có thể xê dịch một hai tiếng.'
                        : 'Còn xa, chưa chốt được giờ tạnh.')
       : xa <= 3 ? 'Còn dưới ba tiếng nữa, dự báo ở tầm này khá sát.'
       : xa <= 12 ? `Còn chừng ${Math.round(xa)} tiếng nữa, giờ giấc có thể xê dịch một hai tiếng.`
       : 'Còn xa, chưa chốt được giờ.');
  return d;
}

const so1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
/* Buổi trong ngày theo cách người Việt nói, để câu đọc lên nghe như người nói chứ không
   như bảng giờ tàu. */
const buoi = (h) => h < 4 ? 'khuya' : h < 11 ? 'sáng' : h < 13 ? 'trưa' : h < 18 ? 'chiều' : 'tối';

const API = { doc, cau, taNang, MM_CO_MUA, LAN_CO_MUA, SO_LAN_CHAY, MA_DONG, NANG };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_MUA = API;
})(typeof self !== 'undefined' ? self : this);

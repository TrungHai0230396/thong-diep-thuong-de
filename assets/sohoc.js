/* Thần số học Pythagoras — phần tính. Hàm THUẦN: nhận ngày sinh, trả về các con số; không đụng
   giao diện, kiểm thử được bằng Node (scripts/test-sohoc.js).

   Theo phương pháp đang phổ biến ở Việt Nam: sách của David A. Phillips, bản tiếng Việt "Thay đổi
   cuộc sống với Nhân số học" của Lê Đỗ Quỳnh Hương. Không có sách gốc trong tay, nên mọi quy tắc
   dưới đây lấy từ chỗ các nguồn đối chiếu được NHẤT TRÍ, và chỗ nào các nguồn lệch nhau thì ghi ra:

   - Số chủ đạo: cộng THẲNG mọi chữ số của ngày tháng năm sinh dương lịch, rút gọn tới khi được
     một số từ 2 tới 11; tổng đúng bằng 22 thì ghi "22/4". Không có số chủ đạo 1. Có trang rút gọn
     riêng ngày, tháng, năm rồi mới cộng — hai cách ra cùng kết quả gần như mọi ngày, chỉ lệch ở
     22/4: sinh 20/2/1971, cộng thẳng là 2+0+2+1+9+7+1 = 22, rút gọn từng phần thì ra 4. Các trang
     định nghĩa 22/4 theo "số tổng" của các chữ số ngày sinh bằng 22, nên cộng thẳng.
   - Biểu đồ ngày sinh: lưới 3×3, hàng trên 3-6-9, giữa 2-5-8, dưới 1-4-7; chữ số 0 không vào lưới.
   - Mũi tên: ba ô thẳng hàng đều có số là mũi tên đầy, đều trống là mũi tên trống. Tên theo số
     đông các trang tiếng Việt; tám cặp đầy/trống khớp với 16 mũi tên Phillips mô tả.
   - Năm cá nhân: ngày sinh + tháng sinh + năm cần xem, rút gọn về 1–9 (chu kỳ 9 năm).
   - Bốn đỉnh cao: rút gọn ngày, tháng, năm sinh về một chữ số; đỉnh 1 = tháng + ngày, đỉnh 2 =
     ngày + năm (hai đỉnh này rút về một chữ số), đỉnh 3 = đỉnh 1 + đỉnh 2, đỉnh 4 = tháng + năm
     (hai đỉnh này giữ 10 và 11). Tuổi đỉnh 1 = 36 trừ số chủ đạo, mỗi đỉnh sau thêm 9 tuổi. Các
     trang ghi rõ số chủ đạo 11 thì đỉnh đầu ở 25 tuổi (36 − 11). Với 22/4 thì không trang nào nói
     trừ 22 hay trừ 4 — app trừ 22 như với 11, và giao diện nói ra chỗ chưa rõ này. */
(function (root) {
'use strict';

const congSo = (s) => String(s).split('').reduce((t, c) => t + (c >= '0' && c <= '9' ? +c : 0), 0);
const chuSo = (dd, mm, yy) => `${dd}${mm}${yy}`.split('').map(Number);
const veMot = (n) => { while (n > 9) n = congSo(n); return n; };            // rút về 1–9
const veMuoiMot = (n) => { while (n > 11) n = congSo(n); return n; };       // rút về 1–11, giữ 10 và 11

/* Số chủ đạo, kèm các bước cộng để giao diện viết ra cho người dùng tự kiểm. */
function soChuDao(dd, mm, yy) {
  const ds = chuSo(dd, mm, yy);
  const tong = ds.reduce((a, b) => a + b, 0);
  const buoc = [`${ds.join(' + ')} = ${tong}`];
  if (tong === 22) return { so: 22, ten: '22/4', tong, buoc };
  let n = tong;
  while (n > 11) { const m = congSo(n); buoc.push(`${String(n).split('').join(' + ')} = ${m}`); n = m; }
  return { so: n, ten: String(n), tong, buoc };
}

/* Biểu đồ ngày sinh: mỗi ô 1–9 có bao nhiêu chữ số đó. */
function bieuDo(dd, mm, yy) {
  const dem = Array(10).fill(0);
  for (const c of chuSo(dd, mm, yy)) if (c) dem[c]++;
  return dem;                                        // dem[0] bỏ trống, không dùng
}

/* Tám hàng của lưới. Hàng 1-2-3 không bao giờ trống cả ba với người sinh từ năm 1000 tới 2999
   (năm nào cũng có chữ số 1 hoặc 2), nên không có mũi tên trống 1-2-3. */
const MUI_TEN = [
  { so: [1, 2, 3], day: 'Kế hoạch', trong: null,
    yDay: 'Thích sắp xếp, nghĩ trước các bước rồi mới bắt tay làm.' },
  { so: [4, 5, 6], day: 'Ý chí', trong: 'Uất giận',
    yDay: 'Bền bỉ, đã quyết thì theo tới cùng dù gặp trở ngại.',
    yTrong: 'Dễ thất vọng, bực bội khi mọi việc không như mình kỳ vọng. Đặt kỳ vọng vừa phải sẽ nhẹ lòng hơn.' },
  { so: [7, 8, 9], day: 'Hoạt động', trong: 'Thụ động',
    yDay: 'Năng động, học nhanh nhất khi được bắt tay vào làm.',
    yTrong: 'Dễ thiếu động lực, chần chừ trước việc mới. Bắt đầu từ một việc nhỏ thường gỡ được.' },
  { so: [1, 4, 7], day: 'Thực tế', trong: 'Thiếu trật tự',
    yDay: 'Khéo tay, thực tế, giỏi biến ý tưởng thành việc cụ thể.',
    yTrong: 'Khó sắp xếp những việc cụ thể, chân tay; dễ rối khi phải lo nhiều việc vặt cùng lúc.' },
  { so: [2, 5, 8], day: 'Cân bằng cảm xúc', trong: 'Nhạy cảm',
    yDay: 'Hiểu và điều hoà được cảm xúc của mình, dễ đồng cảm với người khác.',
    yTrong: 'Dễ tổn thương, hay giữ cảm xúc trong lòng. Nói ra điều mình cảm thấy sẽ giúp nhiều.' },
  { so: [3, 6, 9], day: 'Trí tuệ', trong: 'Trí nhớ ngắn hạn',
    yDay: 'Trí nhớ tốt, suy nghĩ mạch lạc và sắc bén.',
    yTrong: 'Hay quên việc vừa xảy ra. Ghi chép lại là cách đỡ đơn giản nhất.' },
  { so: [1, 5, 9], day: 'Quyết tâm', trong: 'Trì hoãn',
    yDay: 'Kiên định với mục tiêu, không dễ bỏ cuộc.',
    yTrong: 'Hay để việc lại sau, khó dứt khoát. Chia việc thật nhỏ và đặt hạn sẽ dễ bắt đầu hơn.' },
  { so: [3, 5, 7], day: 'Tâm linh', trong: 'Hoài nghi',
    yDay: 'Trực giác nhạy, sống có niềm tin vào những giá trị tinh thần.',
    yTrong: 'Hay nghi ngờ, cần thấy bằng chứng rõ ràng mới tin.' },
];

function muiTen(dem) {
  const day = [], trong = [];
  for (const m of MUI_TEN) {
    if (m.so.every(s => dem[s] > 0)) day.push(m);
    else if (m.trong && m.so.every(s => dem[s] === 0)) trong.push(m);
  }
  return { day, trong };
}

/* Năm cá nhân của một năm dương lịch. */
function namCaNhan(dd, mm, nam) {
  const ds = chuSo(dd, mm, nam), tong = ds.reduce((a, b) => a + b, 0);
  const buoc = [`${ds.join(' + ')} = ${tong}`];
  let n = tong;
  while (n > 9) { n = congSo(n); buoc.push(String(n)); }       // ghi đủ từng bước: 28 → 10 → 1
  return { so: n, tong, buoc: buoc.join(' → ') };
}

/* Bốn đỉnh cao, với tuổi và năm dương lịch của từng đỉnh. */
function dinhCao(dd, mm, yy) {
  const T = veMot(mm), N = veMot(dd), Y = veMot(congSo(yy));
  const d1 = veMot(T + N), d2 = veMot(N + Y), d3 = veMuoiMot(d1 + d2), d4 = veMuoiMot(T + Y);
  const cd = soChuDao(dd, mm, yy).so;
  const t1 = 36 - cd;
  return {
    chan: { thang: T, ngay: N, nam: Y },
    dinh: [d1, d2, d3, d4].map((so, i) => ({ so, tuoi: t1 + 9 * i, nam: yy + t1 + 9 * i })),
    chuaRo22: cd === 22,
  };
}

/* ---------- lời giảng ----------
   Viết lại bằng lời của app, ngắn, nói cả điểm mạnh lẫn điều nên để ý, và không phán chắc. */
const Y_CHU_DAO = {
  2: { ten: 'Người kết nối', manh: 'Nhạy cảm, trực giác tốt, giỏi lắng nghe và hoà giải; làm việc nhóm rất hợp.',
       yeu: 'Dễ tổn thương, ngại va chạm, hay để cảm xúc người khác chi phối mình.' },
  3: { ten: 'Người sáng tạo', manh: 'Óc sáng tạo, tư duy nhanh, hài hước, học được nhiều thứ.',
       yeu: 'Dễ chán khi việc lặp lại; nghĩ nhiều quá thì hay phân tích mà chậm làm.' },
  4: { ten: 'Người xây dựng', manh: 'Thực tế, ngăn nắp, đáng tin; làm tới đâu chắc tới đó.',
       yeu: 'Có thể cứng nhắc, cầu toàn, ngại thay đổi cách làm quen thuộc.' },
  5: { ten: 'Người tự do', manh: 'Yêu tự do, thích trải nghiệm, giàu cảm xúc và tình thương.',
       yeu: 'Dễ bồn chồn, nóng vội; bị gò bó lâu thì khó chịu.' },
  6: { ten: 'Người chăm lo', manh: 'Giàu trách nhiệm, sáng tạo, thương người thân, thích giúp đỡ.',
       yeu: 'Hay lo âu, ôm đồm việc của người khác, dễ muốn kiểm soát.' },
  7: { ten: 'Người tìm hiểu', manh: 'Thích đào sâu, độc lập, học nhiều nhất qua trải nghiệm của chính mình.',
       yeu: 'Dễ thu mình, hoài nghi; bài học hay đến qua những lần vấp ngã.' },
  8: { ten: 'Người tổ chức', manh: 'Độc lập, có óc tổ chức và quản lý, trọng sự công bằng.',
       yeu: 'Có thể cứng rắn, khó bày tỏ cảm xúc, dễ bị coi là lạnh lùng.' },
  9: { ten: 'Người lý tưởng', manh: 'Có trách nhiệm, tầm nhìn xa, muốn làm điều có ích cho nhiều người.',
       yeu: 'Đặt kỳ vọng cao, dễ mơ mộng, khó buông những gì đã qua.' },
  10: { ten: 'Người thích nghi', manh: 'Thích nghi nhanh, tự tin, hoà đồng, có sức hút với người xung quanh.',
        yeu: 'Hay bắt đầu nhiều việc cùng lúc mà khó theo tới cùng.' },
  11: { ten: 'Người truyền cảm hứng', manh: 'Trực giác và đời sống tinh thần mạnh, dễ truyền cảm hứng cho người khác.',
        yeu: 'Nhạy cảm quá mức, dễ căng thẳng, đặt tiêu chuẩn quá cao cho mình.' },
  22: { ten: 'Người kiến tạo', manh: 'Tầm nhìn lớn của số 11 đi cùng khả năng làm tới nơi của số 4.',
        yeu: 'Dễ tự tạo áp lực, đặt tiêu chuẩn quá cao rồi kiệt sức.' },
};

const Y_NAM = {
  1: 'Năm khởi đầu: hợp để bắt đầu việc mới, chủ động gieo những hạt giống cho chín năm tới.',
  2: 'Năm chậm lại: kiên nhẫn, vun đắp các mối quan hệ, hợp tác; kết quả thường chưa đến ngay.',
  3: 'Năm sáng tạo: học hỏi, giao lưu, thể hiện bản thân; niềm vui đến từ những điều mới.',
  4: 'Năm xây nền: làm việc chăm chỉ, sắp xếp lại mọi thứ cho vững, chăm lo sức khoẻ.',
  5: 'Năm thay đổi: nhiều biến động và cơ hội mới, đi lại nhiều; hợp để thử điều khác.',
  6: 'Năm gia đình: trách nhiệm, yêu thương, chăm lo nhà cửa và những người gắn bó.',
  7: 'Năm suy ngẫm: học sâu, nghỉ ngơi, nhìn lại bản thân; hợp đi chậm hơn là lao nhanh.',
  8: 'Năm thành quả: tài chính, sự nghiệp; hợp để quyết đoán và gặt những gì đã gieo.',
  9: 'Năm khép lại: tổng kết, buông bỏ điều cũ, cho đi; dọn chỗ cho chu kỳ mới.',
};

const Y_DINH = {
  1: 'tự lập, nỗ lực bằng sức mình', 2: 'hợp tác, kiên nhẫn, vun đắp quan hệ', 3: 'sáng tạo, học hỏi, thể hiện bản thân',
  4: 'xây nền móng, làm việc chăm chỉ', 5: 'thay đổi, tự do, trải nghiệm mới', 6: 'gia đình, trách nhiệm, yêu thương',
  7: 'tìm hiểu sâu, trưởng thành qua trải nghiệm', 8: 'sự nghiệp, tài chính, quyền tự chủ', 9: 'lý tưởng, cống hiến, bao dung',
  10: 'khởi đầu mới ở tầm cao hơn, dễ được giúp đỡ', 11: 'trực giác, đời sống tinh thần, truyền cảm hứng',
};

const TANG = { 3: 'trí não', 2: 'tinh thần', 1: 'thể chất' };   // tên ba hàng của lưới, theo Phillips

const API = { soChuDao, bieuDo, muiTen, namCaNhan, dinhCao, congSo, veMot, veMuoiMot,
              MUI_TEN, Y_CHU_DAO, Y_NAM, Y_DINH, TANG };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.TDTD_SOHOC = API;
})(typeof self !== 'undefined' ? self : this);

/* 100 bài của Robot thắp sao (assets/laptrinh.js), 10 chương theo thứ tự của Code.org CS Fundamentals: làm theo thứ tự →
   sửa lỗi → vòng lặp → hàm → điều kiện → thử thách.

   Mỗi bài viết bằng cú pháp gọn (xem docMa trong laptrinh.js):
     d đi · t thắp · L rẽ trái · R rẽ phải · j nhảy lên · x / X nhảy xuống một / hai nấc · F gọi hàm ★
     3(...) lặp 3 lần · w(...) lặp đến khi hết sao · ?d / ?l / ?r (...)(...) nếu có đường trước / trái / phải · ?s(...) nếu đứng trên sao
   giai: lời giải mẫu — bản đồ dựng từ chính đường đi này nên chắc chắn đi được (bài kiểm chạy lại để chắc).
   duong: đường vẽ bản đồ riêng (chương điều kiện: lời giải là "tự nhìn đường", không vẽ được bản đồ).
   san / sanHam: chương trình có lỗi cho sẵn (bài sửa lỗi). them: ô thêm cho đỡ trống. huong: hướng xuất phát (0 Bắc, 1 Đông…).
   Số ô tối đa = số ô của lời giải mẫu + "du" của chương. */
(function () {
'use strict';
const DI = ['di', 'trai', 'phai', 'nhay', 'thap'];
const CHUONG = [
  {
    ten: 'Đi và Thắp', du: 3, lenh: ['di', 'thap'], lenhMoi: ['di', 'thap'],
    gioiThieu: ['Robot chỉ làm đúng những gì em bảo, theo đúng thứ tự từ trái sang phải.',
      'Bấm vào ô lệnh bên dưới để xếp vào Chương trình, rồi bấm ▶ Chạy. Không biết bắt đầu từ đâu thì bấm 💡 Gợi ý.',
      'Dùng càng ít ô lệnh càng được nhiều sao: gọn nhất thì 3 sao.'],
    bai: [
      { ten: 'Bước đầu tiên', giai: 'd t', goiY: 'xếp ô Đi rồi ô Thắp, bấm Chạy.' },
      { ten: 'Ba bước', giai: 'd d d t' },
      { ten: 'Hai ngôi sao', giai: 'd t d t' },
      { ten: 'Sao dưới chân', giai: 't d d t', goiY: 'robot đang đứng ngay trên một ngôi sao.' },
      { ten: 'Ba ngôi sao', giai: 'd t d d t d t' },
      { ten: 'Đường xa', giai: 'd d d d d t' },
    ],
  },
  {
    ten: 'Rẽ trái, rẽ phải', du: 3, lenh: ['di', 'trai', 'phai', 'thap'], lenhMoi: ['trai', 'phai'],
    gioiThieu: ['Rẽ là quay người tại chỗ, chưa đi bước nào. Quay xong muốn đi thì thêm ô Đi.',
      'Trái, phải tính theo hướng robot đang nhìn — mũi tên trắng dưới chân robot chỉ hướng đó. Bấm ⟲ ⟳ để xoay cảnh cho dễ nhìn.'],
    bai: [
      { ten: 'Rẽ trái', giai: 'L d t', goiY: 'rẽ trái trước, rồi mới Đi.' },
      { ten: 'Rẽ phải', giai: 'R d d t' },
      { ten: 'Góc vuông', giai: 'd L d t' },
      { ten: 'Góc bên phải', giai: 'd d R d d t' },
      { ten: 'Sao ở góc', giai: 'd t L d t' },
      { ten: 'Bậc thang phẳng', giai: 'd R d L d t' },
      { ten: 'Ngoằn ngoèo', giai: 'd L d R d L d t' },
      { ten: 'Quay đầu', giai: 'd d L d d L d d t' },
      { ten: 'Sao phía sau', giai: 'R R d d t', goiY: 'rẽ hai lần là quay hẳn ra sau.' },
      { ten: 'Ba góc', giai: 'd t L d d t L d d t' },
      { ten: 'Chữ S', giai: 'd d L t d L d t' },
      { ten: 'Vòng quanh', giai: 'd d R d d R d d t', them: [[0, 1, 1]] },
    ],
  },
  {
    ten: 'Nhảy lên bậc', du: 3, lenh: DI, lenhMoi: ['nhay'],
    gioiThieu: ['Khối cao hơn một nấc thì Đi không lên được, phải Nhảy.',
      'Nhảy xuống khối thấp hơn thì được, nhưng không nhảy lên nổi khối cao hơn hai nấc. Bấm ⟲ ⟳ để xem khối nào cao.'],
    bai: [
      { ten: 'Bậc thềm', giai: 'j t', goiY: 'khối phía trước cao hơn một nấc.' },
      { ten: 'Lên rồi đi', giai: 'd j d t' },
      { ten: 'Cầu thang', giai: 'j j j t' },
      { ten: 'Nhảy xuống', giai: 'j d x t', goiY: 'xuống thấp cũng dùng ô Nhảy.' },
      { ten: 'Rẽ trên bậc', giai: 'd j L j t' },
      { ten: 'Xuống hai nấc', giai: 'j j X t' },
      { ten: 'Lên xuống', giai: 'j t x d j t' },
      { ten: 'Cầu thang xoắn', giai: 'j R j L j t' },
      { ten: 'Ngọn đồi', giai: 'd j d j d x d x t' },
      { ten: 'Tháp cao', giai: 'j L j L j R j t' },
    ],
  },
  {
    ten: 'Sửa lỗi', du: 2, lenh: DI, lenhMoi: [],
    gioiThieu: ['Chương trình đã có sẵn nhưng sai một chỗ. Bấm Chạy, xem robot đi lạc ở đâu, rồi sửa: chạm vào ô sai rồi bấm × để bỏ, thêm ô đúng (ô mới chèn ngay sau ô đang chọn).',
      'Lập trình viên thật cũng dành rất nhiều thời gian sửa lỗi. Tìm ra lỗi là một kỹ năng!'],
    bai: [
      { ten: 'Thiếu một bước', san: 'd d t', giai: 'd d d t', goiY: 'chạy thử, đếm xem robot dừng trước ngôi sao mấy ô.' },
      { ten: 'Rẽ nhầm', san: 'L d t', giai: 'R d t' },
      { ten: 'Quên thắp', san: 'd d', giai: 'd d t' },
      { ten: 'Rẽ nhầm hướng', san: 'd t R d t', giai: 'd t L d t' },
      { ten: 'Đi hay nhảy?', san: 'd d t', giai: 'j d t' },
      { ten: 'Thừa một bước', san: 'd d d L d t', giai: 'd d L d t', them: [[3, 0, 0]] },
      { ten: 'Đổi chỗ hai ô', san: 'R d d t', giai: 'd R d t', them: [[0, 1, 0]] },
      { ten: 'Hai lỗi', san: 'd d L d', giai: 'j d L d t', goiY: 'chương trình này sai hai chỗ.' },
    ],
  },
  {
    ten: 'Vòng lặp', du: 1, lenh: DI.concat('lap'), lenhMoi: ['lap'],
    gioiThieu: ['Thay vì xếp Đi, Đi, Đi, Đi — xếp một ô Lặp rồi đặt Đi vào trong. Bấm vào con số để đổi số lần lặp.',
      'Bài nào cũng giới hạn số ô lệnh, nên phải dùng vòng lặp mới đủ chỗ.'],
    bai: [
      { ten: 'Lặp 4 lần', giai: '4(d) t', goiY: 'một ô Lặp, bên trong một ô Đi, đổi số thành 4.' },
      { ten: 'Năm ngôi sao', giai: '5(d t)' },
      { ten: 'Leo cầu thang', giai: '4(j) t' },
      { ten: 'Sao ở hai đầu', giai: 't 5(d) t' },
      { ten: 'Nhịp ba', giai: '3(d d t)' },
      { ten: 'Chữ L dài', giai: '3(d) L 5(d) t' },
      { ten: 'Bậc và sân', giai: '3(j d) t' },
      { ten: 'Hàng sao gãy', giai: '3(d t) L 4(d t)' },
      { ten: 'Bốn góc', giai: '3(d d t L)' },
      { ten: 'Bậc thang dài', giai: '4(d j) t' },
      { ten: 'Răng cưa', giai: '3(d R d L) t' },
      { ten: 'Đường dài có góc', giai: '6(d) L 2(d) t' },
    ],
  },
  {
    ten: 'Lặp trong lặp', du: 1, lenh: DI.concat('lap'), lenhMoi: ['lap'],
    gioiThieu: ['Trong một vòng lặp có thể đặt nhiều lệnh: chúng chạy lần lượt, hết lượt thì quay lại từ đầu.',
      'Có thể đặt cả một vòng lặp vào trong vòng lặp khác.',
      'Muốn xếp tiếp ra ngoài vòng lặp thì bấm dấu + ở dòng Chương trình.'],
    bai: [
      { ten: 'Đi một vòng', giai: '4(d d t L)', goiY: 'đi hai bước, thắp, rẽ trái — lặp 4 lần.' },
      { ten: 'Lên, đi, xuống', giai: '3(j d x) t' },
      { ten: 'Hai cạnh', giai: '2(3(d) t L)', goiY: 'đặt một vòng lặp vào trong vòng lặp khác.' },
      { ten: 'Ba cạnh', giai: '3(2(d) t R)' },
      { ten: 'Hai hàng sao', giai: '2(4(d t) L)' },
      { ten: 'Cầu thang có chiếu nghỉ', giai: '3(2(j) d) t' },
      { ten: 'Sóng', giai: '2(2(d L d R) d t)' },
      { ten: 'Ô vuông sao', giai: '4(2(d t) L)' },
      { ten: 'Bậc xoắn', giai: '3(d L d R t)' },
      { ten: 'Tháp sao', giai: '5(j t)' },
    ],
  },
  {
    ten: 'Hàm ★', du: 1, lenh: DI.concat('ham'), lenhMoi: ['ham'],
    gioiThieu: ['Hàm ★ là một chương trình nhỏ có tên. Xếp lệnh vào khung Hàm ★ một lần, rồi mỗi lần đặt ô Hàm ★ vào Chương trình là robot làm hết các lệnh đó.',
      'Thấy một đoạn lặp lại ở nhiều chỗ thì đưa nó vào hàm. Bấm vào khung Hàm ★ để xếp lệnh vào đó.'],
    bai: [
      { ten: 'Gọi hàm', ham: 'd d L t', giai: 'F F F', goiY: 'hàm: Đi, Đi, Rẽ trái, Thắp. Chương trình chỉ cần gọi hàm ba lần.' },
      { ten: 'Ba tầng', ham: 'j j t', giai: 'F F F' },
      { ten: 'Gấp khúc', ham: 'd t d R t', giai: 'F F F' },
      { ten: 'Ngoằn ngoèo bằng hàm', ham: 'd L d R', giai: 'F F F t' },
      { ten: 'Bậc có sao', ham: 'j d t', giai: 'F F F F' },
      { ten: 'Chữ U', ham: 'd d d R t', giai: 'F F F' },
      { ten: 'Hàm có rẽ', ham: 'd R d t L', giai: 'F F F' },
      { ten: 'Bậc so le', ham: 'd j t', giai: 'F L F R F' },
      { ten: 'Bậc thang sao', ham: 'd t L d t R', giai: 'F F F' },
      { ten: 'Cầu thang lớn', ham: 'd d R d d L', giai: 'F F F t' },
    ],
  },
  {
    ten: 'Hàm và vòng lặp', du: 1, lenh: DI.concat('lap', 'ham'), lenhMoi: ['ham', 'lap'],
    gioiThieu: ['Gọi hàm trong vòng lặp, hay đặt vòng lặp trong hàm — chương trình ngắn mà làm được rất nhiều việc.',
      'Khi một đoạn lặp lại nhưng chen giữa là những chỗ rẽ khác nhau, vòng lặp không gói được — đưa đoạn đó vào hàm.'],
    bai: [
      { ten: 'Hàm trong vòng lặp', ham: 'd d t', giai: 'F R 3(F)', goiY: 'gọi hàm một lần, rẽ phải, rồi đặt ô Hàm ★ vào trong ô Lặp.' },
      { ten: 'Vòng lặp trong hàm', ham: '3(d) t', giai: 'F R F L F', goiY: 'trong hàm có một vòng lặp. Rẽ phải rồi rẽ trái xen kẽ nên vòng lặp ngoài không gói được.' },
      { ten: 'Tháp xoắn', ham: '2(j) t', giai: 'F R F L F' },
      { ten: 'Tăng dần', ham: 'd t', giai: 'F R 2(F) R 3(F)' },
      { ten: 'Bậc thang lặp', ham: '2(d j) t', giai: 'F L F R F' },
      { ten: 'Chữ Z sao', ham: '2(d t)', giai: 'F R F L F' },
      { ten: 'Đồi và thung lũng', ham: 'j d x t', giai: 'F L F R F' },
      { ten: 'Đường gấp khúc', ham: '2(d) t', giai: 'F R F R F L F' },
      { ten: 'Hàm có nhảy', ham: 'd j t', giai: 'F R F L F' },
      { ten: 'Thang và sân', ham: '2(j) d t', giai: 'F R F L F' },
    ],
  },
  {
    ten: 'Nếu… thì…', du: 1, lenh: ['di', 'trai', 'phai', 'thap', 'lap', 'den', 'neu-truoc', 'neu-trai', 'neu-phai', 'neu-sao'],
    lenhMoi: ['den', 'neu-truoc', 'neu-trai', 'neu-phai', 'neu-sao'],
    gioiThieu: ['Robot biết nhìn đường! Với ô "Nếu trước có đường": phía trước có đường thì robot làm các lệnh trong phần "thì", không thì làm phần "không thì".',
      '"Lặp tới hết sao" lặp mãi cho tới khi thắp sáng hết sao. Ghép hai ô này, robot tự tìm đường dù đường ngoằn ngoèo.'],
    bai: [
      { ten: 'Lặp đến khi', duong: '7(d t)', giai: 'w(d t)', goiY: 'ô nào cũng có sao. Bên trong ô "Lặp tới hết sao": Đi, Thắp.' },
      { ten: 'Gặp sao thì thắp', duong: 'd t d d t d t d d t', giai: 'w(d ?s(t))' },
      { ten: 'Gặp tường thì rẽ phải', duong: '4(d) t R 4(d) R 3(d) t', giai: 'w(?d(d)(R) ?s(t))', goiY: 'nếu có đường phía trước thì Đi, không thì Rẽ phải.' },
      { ten: 'Gặp tường thì rẽ trái', duong: '3(d) L 4(d) t L 4(d) t', giai: 'w(?d(d)(L) ?s(t))' },
      { ten: 'Bên nào có đường?', duong: 'd d L d d R d d R d d L d t', giai: 'w(?d(d)(?l(L)(R)) ?s(t))', goiY: 'không có đường phía trước thì xem bên trái.' },
      { ten: 'Ba sao đường vòng', duong: 'd d t R d d L d d t L d d R d d t', giai: 'w(?d(d)(?l(L)(R)) ?s(t))' },
      { ten: 'Nhìn bên phải trước', duong: 'd d L d d R d d R d t d L d d t', giai: 'w(?s(t) ?d(d)(?r(R)(L)))' },
      { ten: 'Xoắn ốc', duong: '4(d) R 4(d) t R 3(d) R 2(d) R 2(d) t', giai: 'w(?d(d)(R) ?s(t))' },
      { ten: 'Sao dọc đường gấp', duong: '3(d t) R 4(d t) R 3(d t)', giai: 'w(d t ?r(R))', goiY: 'ô nào cũng có sao: Đi, Thắp, rồi nhìn bên phải.' },
      { ten: 'Chữ U ngược', huong: 0, duong: '3(d) t R 4(d) R 3(d) t', giai: 'w(?d(d)(R) ?s(t))' },
      { ten: 'Lặp trong lặp đến khi', duong: '3(3(d) t R)', giai: 'w(3(d) t R)' },
      { ten: 'Mê cung', duong: 'd d R d d L d d R d t d R d d L d d L d d t', giai: 'w(?d(d)(?l(L)(R)) ?s(t))' },
    ],
  },
  {
    ten: 'Thử thách', du: 1, lenh: DI.concat('lap', 'ham', 'den', 'neu-truoc', 'neu-trai', 'neu-phai', 'neu-sao'), lenhMoi: [],
    gioiThieu: ['Dùng tất cả những gì em đã học. Có bài phải sửa lỗi, có bài phải tự nghĩ ra cách ngắn nhất.'],
    bai: [
      { ten: 'Sửa vòng lặp', san: '3(d) t', giai: '5(d) t', goiY: 'vòng lặp lặp chưa đủ số lần.' },
      { ten: 'Sửa hàm', ham: 'd d t', sanHam: 'd d t', san: 'F R F R F', giai: 'F L F L F' },
      { ten: 'Kim tự tháp', duong: '3(j) d d 3(x) t', giai: '8(?d(d)(j)) t', toiDa: 8, goiY: 'có cách rất gọn: nếu trước có đường (bằng chỗ đang đứng) thì Đi, không thì Nhảy.' },
      { ten: 'Xoắn ốc lên trời', giai: '3(j j R) t' },
      { ten: 'Hai tầng sao', giai: '2(4(d t) L j)', goiY: 'hai tầng giống nhau — một vòng lặp lồng là đủ.' },
      { ten: 'Sửa điều kiện', duong: '3(d) R 2(d) R 3(d) t', san: 'w(?d(d)(L) ?s(t))', giai: 'w(?d(d)(R) ?s(t))', goiY: 'robot rẽ sai bên ở góc đầu tiên.' },
      { ten: 'Thang lên sân thượng', giai: '3(j d) R 3(d) t' },
      { ten: 'Bậc thang đôi', giai: '2(2(j d t) R)' },
      { ten: 'Vòng sao lớn', giai: '4(4(d) t R)' },
      { ten: 'Robot tự đi', duong: 'd d L d t d R d d R d d L d t d L d d R d d t', giai: 'w(?d(d)(?l(L)(R)) ?s(t))', goiY: 'mê cung lớn nhất: robot tự nhìn đường, gặp sao thì thắp.' },
    ],
  },
];
if (typeof module !== 'undefined' && module.exports) module.exports = CHUONG; else self.TDTD_BAICODE = CHUONG;
})();

/* Kiểm thử lịch vạn niên: node scripts/test-lich.js

   Không tự chấm điểm mình. Mọi con số đối chiếu với lịch vạn niên đã công bố —
   xemlicham.com, lichvannien365.com, lichngaytot.com, saptet.com — cho các ngày năm 2026. */
const L = require('../assets/lich.js');

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };

console.log('\n— Bảy ngày đối chiếu với lịch vạn niên đã công bố —');
/* [ngày, âm lịch, can chi ngày/tháng/năm, thần, trực, giờ hoàng đạo] */
const MAU = [
  ['04/02', '17/12/2025', 'Kỷ Dậu', 'Kỷ Sửu', 'Ất Tỵ',    'Câu Trần',   'Nguy', 'Tý Dần Mão Ngọ Mùi Dậu'],
  ['10/02', '23/12/2025', 'Ất Mão', 'Kỷ Sửu', 'Ất Tỵ',    'Kim Đường',  'Trừ',  'Tý Dần Mão Ngọ Mùi Dậu'],
  ['15/06', '1/5/2026',   'Canh Thân', 'Giáp Ngọ', 'Bính Ngọ', 'Thanh Long', 'Mãn', 'Tý Sửu Thìn Tỵ Mùi Tuất'],
  ['07/09', '26/7/2026',  'Giáp Thân', 'Bính Thân', 'Bính Ngọ', 'Thiên Lao', 'Kiến', 'Tý Sửu Thìn Tỵ Mùi Tuất'],
  ['09/09', '28/7/2026',  'Bính Tuất', 'Bính Thân', 'Bính Ngọ', 'Tư Mệnh',   'Trừ',  'Dần Thìn Tỵ Thân Dậu Hợi'],
  ['23/09', '13/8/2026',  'Canh Tý',  'Đinh Dậu', 'Bính Ngọ', 'Tư Mệnh',   'Bình', 'Tý Sửu Mão Ngọ Thân Dậu'],
  ['01/12', '23/10/2026', 'Kỷ Dậu',   'Kỷ Hợi',  'Bính Ngọ', 'Chu Tước',  'Khai', 'Tý Dần Mão Ngọ Mùi Dậu'],
];
for (const [d, am, ngay, thang, nam, than, truc, gio] of MAU) {
  const [dd, mm] = d.split('/').map(Number);
  const r = L.xemNgay(dd, mm, 2026);
  const amTinh = `${r.am.ngay}/${r.am.thang}/${r.am.nam}`;
  const gioTinh = r.gio.map(g => g.chi).join(' ');
  const sai = [];
  if (amTinh !== am) sai.push(`âm ${amTinh}≠${am}`);
  if (r.canChi.ngay !== ngay) sai.push(`ngày ${r.canChi.ngay}≠${ngay}`);
  if (r.canChi.thang !== thang) sai.push(`tháng ${r.canChi.thang}≠${thang}`);
  if (r.canChi.nam !== nam) sai.push(`năm ${r.canChi.nam}≠${nam}`);
  if (r.than.ten !== than) sai.push(`thần ${r.than.ten}≠${than}`);
  if (r.truc.ten !== truc) sai.push(`trực ${r.truc.ten}≠${truc}`);
  if (gioTinh !== gio) sai.push(`giờ ${gioTinh}≠${gio}`);
  ok(`${d}/2026 · ${am} âm · ${ngay} · ${than} · trực ${truc}`, sai.length === 0, sai.join('; '));
}

console.log('\n— Cả tháng 9/2026, đối chiếu từng ngày với saptet.com —');
/* Ngày 7/9: tiết Bạch lộ bắt đầu 21 giờ 41. Ba trang ghi trực Kiến, saptet ghi Bế. Lấy theo
   ba trang đông hơn — cách xét tiết lúc giữa trưa của lich.js cho ra Kiến. */
const THANG9 = {
  1: ['Thiên Hình', 'Phá'], 2: ['Chu Tước', 'Nguy'], 3: ['Kim Quỹ', 'Thành'],
  4: ['Kim Đường', 'Thu'], 5: ['Bạch Hổ', 'Khai'], 6: ['Ngọc Đường', 'Bế'],
  7: ['Thiên Lao', 'Kiến'], 8: ['Nguyên Vũ', 'Kiến'], 9: ['Tư Mệnh', 'Trừ'],
  10: ['Câu Trần', 'Mãn'], 11: ['Tư Mệnh', 'Bình'], 13: ['Thanh Long', 'Chấp'],
  19: ['Bạch Hổ', 'Bế'], 25: ['Thanh Long', 'Chấp'], 30: ['Kim Đường', 'Khai'],
};
let sai9 = [];
for (const [d, [than, truc]] of Object.entries(THANG9)) {
  const r = L.xemNgay(+d, 9, 2026);
  if (r.than.ten !== than || r.truc.ten !== truc)
    sai9.push(`${d}/9: ra ${r.than.ten}/${r.truc.ten}, nguồn ${than}/${truc}`);
}
ok(`${Object.keys(THANG9).length} ngày tháng 9 khớp cả thần lẫn trực`, sai9.length === 0, sai9.slice(0, 3).join('; '));

console.log('\n— Trực lặp hai ngày khi giao tiết —');
{
  const a = L.xemNgay(7, 9, 2026).truc.ten, b = L.xemNgay(8, 9, 2026).truc.ten;
  ok('7/9 và 8/9 cùng trực Kiến (Bạch lộ giao tiết giữa hai ngày)', a === 'Kiến' && b === 'Kiến', `${a}, ${b}`);
  /* Thu phân 23/9 là trung khí, không phải tiết, nên không làm trực lặp. */
  const x = ['22', '23', '24'].map(d => L.xemNgay(+d, 9, 2026).truc.ten);
  ok('Thu phân (trung khí) không làm trực lặp: 22–24/9 là Mãn, Bình, Định',
     x.join(',') === 'Mãn,Bình,Định', x.join(', '));
}

console.log('\n— Mùng một Tết âm lịch —');
for (const [nam, d, m] of [[2024, 10, 2], [2025, 29, 1], [2026, 17, 2]]) {
  const [ad, am, ay] = L.convertSolar2Lunar(d, m, nam, L.TZ);
  ok(`Tết ${nam} rơi vào ${d}/${m}/${nam}`, ad === 1 && am === 1 && ay === nam, `ra ${ad}/${am}/${ay}`);
}

console.log('\n— Đổi qua đổi lại dương ↔ âm —');
{
  let sai = [], dem = 0;
  const N0 = L.jdFromDate(1, 1, 2000);
  for (let i = 0; i < 365 * 30; i += 3) {
    const [dd, mm, yy] = L.jdToDate(N0 + i);
    const [ad, am, ay, nh] = L.convertSolar2Lunar(dd, mm, yy, L.TZ);
    const [d2, m2, y2] = L.convertLunar2Solar(ad, am, ay, nh, L.TZ);
    dem++;
    if (d2 !== dd || m2 !== mm || y2 !== yy) sai.push(`${dd}/${mm}/${yy}→${ad}/${am}/${ay}${nh ? 'n' : ''}→${d2}/${m2}/${y2}`);
  }
  ok(`${dem} ngày từ 2000 tới 2029 đổi đi đổi lại vẫn đúng`, sai.length === 0, sai.slice(0, 3).join('; '));
}

console.log('\n— Tuổi —');
{
  /* Tết Canh Ngọ 1990 là 27/1/1990: sinh trước đó thuộc năm Kỷ Tỵ. */
  const a = L.tuoi(20, 1, 1990), b = L.tuoi(1, 3, 1990);
  ok('sinh 20/1/1990, trước Tết, là tuổi Kỷ Tỵ', a.ten === 'Kỷ Tỵ', a.ten);
  ok('sinh 1/3/1990, sau Tết, là tuổi Canh Ngọ', b.ten === 'Canh Ngọ', b.ten);
  ok('tuổi Tý xung ngày Ngọ', L.xung(0, 6) && !L.xung(0, 5));
  ok('xung là hai chiều: tuổi Ngọ xung ngày Tý', L.xung(6, 0));
}

console.log('\n— Nhận ra việc định làm —');
for (const [cau, ma] of [
  ['tôi muốn khai trương quán cà phê', 'khai-truong'],
  ['Cưới vợ', 'cuoi-hoi'],
  ['định sửa nhà', 'dong-tho'],
  ['chuyển nhà sang quận 7', 'chuyen-nha'],
  ['ký hợp đồng thuê mặt bằng', 'giao-dich'],
  ['đi du lịch Đà Lạt', 'xuat-hanh'],
  ['nhổ răng khôn', 'chua-benh'],
  ['xin việc mới', 'nham-chuc'],
]) {
  const v = L.nhanViec(cau);
  ok(`"${cau}" → ${ma}`, v && v.ma === ma, v ? v.ma : 'không nhận ra');
}
ok('câu vô nghĩa thì không nhận bừa', L.nhanViec('xyz abc') === null);
/* Lúc đầu dò theo chuỗi con nên năm câu này bị hiểu sai hết. */
for (const cau of ['tổ chức sự kiện', 'đi khám phá hang động', 'thiết kế lại phòng khách',
                   'đăng ký tài khoản', 'lễ hội hoa'])
  ok(`"${cau}" không bị nhận nhầm`, L.nhanViec(cau) === null, L.nhanViec(cau)?.ten || '');
ok('"đi khám bệnh" vẫn nhận đúng', L.nhanViec('đi khám bệnh')?.ma === 'chua-benh');
ok('dấu câu không cản việc nhận', L.nhanViec('Cưới vợ!')?.ma === 'cuoi-hoi');

console.log('\n— Gợi ý ngày tốt —');
{
  const kt = L.VIEC.find(v => v.ma === 'khai-truong');
  const ds = L.timNgay(kt, { dd: 23, mm: 9, yy: 2026 }, 60);
  ok('tìm được ngày tốt để khai trương trong 60 ngày', ds.length > 0, `${ds.length} ngày`);
  ok('không gợi ý ngày Tam nương hay Nguyệt kỵ để khai trương',
     ds.every(x => !x.ng.tamNuong && !x.ng.nguyetKy));
  ok('không gợi ý ngày trực kỵ khai trương', ds.every(x => !x.ng.truc.kieng.some(k => k.includes('khai trương'))));
  ok('ngày gợi ý đều có điểm dương', ds.every(x => x.diem > 0));

  const sinh = L.tuoi(15, 6, 1990);                   // tuổi Canh Ngọ, xung ngày Tý
  const ds2 = L.timNgay(kt, { dd: 23, mm: 9, yy: 2026 }, 60, sinh);
  ok('nhập tuổi Ngọ thì không gợi ý ngày Tý (ngày xung)', ds2.every(x => x.ng.chiNgay !== 0),
     ds2.map(x => L.CHI[x.ng.chiNgay]).join(', '));

  const hom = L.xemNgay(23, 9, 2026, sinh);
  ok('23/9/2026 (ngày Canh Tý) xung tuổi Canh Ngọ', hom.xungTuoi === true);
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

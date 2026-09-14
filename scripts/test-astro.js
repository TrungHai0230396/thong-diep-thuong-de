/* Kiểm thử phần thiên văn: node scripts/test-astro.js

   Không tự chấm điểm mình. Mọi con số ở đây đối chiếu với nguồn ngoài:
   - giờ Mặt Trời mọc, lặn, chạng vạng: api.sunrise-sunset.org cho TP.HCM ngày 14/9/2026
   - ngày giờ trăng non và trăng tròn năm 2026: lunaf.com, giờ UTC
   - vị trí hành tinh: đối chiếu chéo bằng những tính chất phải đúng về mặt hình học
     (Sao Kim không bao giờ rời xa Mặt Trời quá 47 độ, Sao Thuỷ quá 28 độ...) */
const A = require('../assets/astro.js');

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };

const HCM = { vi: 10.8231, kinh: 106.6297, ten: 'TP.HCM' };
/* Cửa sổ quét phải trùng với **một ngày ở chỗ mình đứng**, không phải một ngày UTC.
   Việt Nam là UTC+7 nên ngày 14/9 chạy từ 13/9 17:00 UTC. Lúc đầu tôi quét từ 12:00 UTC
   nên mốc chạng vạng thiên văn 12:05 UTC hôm sau rơi ra ngoài cửa sổ 1440 phút, và hàm
   trả về lần cắt của hôm trước — lệch đúng một ngày. */
const DAU_NGAY = Date.UTC(2026, 8, 13, 17, 0, 0);
const gioUTC = (ms) => new Date(ms).toISOString().slice(11, 16);
const lech = (a, b) => Math.abs(a - b) / 60000;        // chênh nhau mấy phút

console.log('\n— Mặt Trời mọc lặn, đối chiếu api.sunrise-sunset.org —');
console.log('  TP.HCM, ngày 14 tháng 9 năm 2026');
{
  const { moc, lan } = A.mocLan(DAU_NGAY, HCM.vi, HCM.kinh);
  const thatMoc = Date.parse('2026-09-13T22:42:03Z');
  const thatLan = Date.parse('2026-09-14T10:56:14Z');
  ok(`mọc ${gioUTC(moc)} UTC, nguồn ghi ${gioUTC(thatMoc)}`, lech(moc, thatMoc) <= 2,
     `lệch ${lech(moc, thatMoc).toFixed(1)} phút`);
  ok(`lặn ${gioUTC(lan)} UTC, nguồn ghi ${gioUTC(thatLan)}`, lech(lan, thatLan) <= 2,
     `lệch ${lech(lan, thatLan).toFixed(1)} phút`);
}

console.log('\n— Ba mốc chạng vạng, cùng nguồn —');
for (const [ten, nguong, khi, that] of [
  ['dân dụng  (-6°) ', -6,  false, '2026-09-14T11:16:15Z'],
  ['hàng hải  (-12°)', -12, false, '2026-09-14T11:40:47Z'],
  ['thiên văn (-18°)', -18, false, '2026-09-14T12:05:23Z'],
]) {
  const t = A.timNguong((JD) => A.matTroi(JD), nguong, DAU_NGAY, HCM.vi, HCM.kinh, khi);
  const th = Date.parse(that);
  ok(`${ten} ${gioUTC(t)} UTC, nguồn ghi ${gioUTC(th)}`, lech(t, th) <= 3,
     `lệch ${lech(t, th).toFixed(1)} phút`);
}

console.log('\n— Trăng non và trăng tròn 2026, đối chiếu lunaf.com (giờ UTC) —');
/* Trăng non là lúc ly giác Trời–Trăng bằng 0, trăng tròn là lúc bằng 180.
   Quét từng phút quanh mốc nguồn ghi, tìm chỗ ly giác đổi dấu. */
function timPha(quanhMs, mucTieu) {
  const f = (ms) => {
    const l = A.matTrang(A.ngayJulius(ms)).ly;
    return A.quanh(l - mucTieu);
  };
  let truoc = f(quanhMs - 12 * 3600000);
  for (let p = -720; p <= 720; p++) {
    const ms = quanhMs + p * 60000;
    const c = f(ms);
    if (truoc < 0 && c >= 0 && Math.abs(c - truoc) < 180) {
      return ms - 60000 + (truoc / (truoc - c)) * 60000;
    }
    truoc = c;
  }
  return null;
}
const PHA = [
  ['trăng non  18/01', '2026-01-18T19:52:00Z', 0],
  ['trăng non  16/05', '2026-05-16T20:01:00Z', 0],
  ['trăng non  11/09', '2026-09-11T03:27:00Z', 0],
  ['trăng non  09/12', '2026-12-09T00:52:00Z', 0],
  ['trăng tròn 03/01', '2026-01-03T10:03:00Z', 180],
  ['trăng tròn 01/05', '2026-05-01T17:23:00Z', 180],
  ['trăng tròn 26/09', '2026-09-26T16:49:00Z', 180],
  ['trăng tròn 24/12', '2026-12-24T01:28:00Z', 180],
];
let phaXau = 0;
for (const [ten, that, muc] of PHA) {
  const th = Date.parse(that);
  const t = timPha(th, muc);
  const d = t === null ? 999 : lech(t, th);
  if (d > 90) phaXau++;
  console.log(`  ${d <= 90 ? '✓' : '✗'} ${ten}: tính ra ${t === null ? 'không thấy' : gioUTC(t) + ' UTC'}`
    + `, nguồn ${gioUTC(th)} — lệch ${d === 999 ? '?' : d.toFixed(0) + ' phút'}`);
}
ok(`cả 8 mốc trăng lệch dưới 90 phút`, phaXau === 0, `${phaXau} mốc sai`);

console.log('\n— Phần đĩa sáng của Trăng —');
{
  const tron = A.matTrang(A.ngayJulius(Date.parse('2026-09-26T16:49:00Z')));
  const non = A.matTrang(A.ngayJulius(Date.parse('2026-09-11T03:27:00Z')));
  ok('lúc trăng tròn đĩa sáng gần hết', tron.sang > .99, `${(tron.sang * 100).toFixed(1)}%`);
  ok('lúc trăng non đĩa gần như tối', non.sang < .01, `${(non.sang * 100).toFixed(2)}%`);
}

console.log('\n— Mấy tính chất hình học buộc phải đúng —');
{
  /* Sao Kim và Sao Thuỷ nằm trong quỹ đạo Trái Đất nên không bao giờ rời xa Mặt Trời
     quá một góc nhất định: Kim khoảng 47 độ, Thuỷ khoảng 28 độ. Đây là phép thử rất
     chặt — sai một dấu trong phép đổi toạ độ là lộ ra ngay. */
  let xaKim = 0, xaThuy = 0;
  for (let d = 0; d < 365 * 4; d += 3) {
    const JD = A.ngayJulius(Date.UTC(2024, 0, 1) + d * 86400000);
    const t = A.matTroi(JD);
    for (const [ten, giu] of [['kim', 'k'], ['thuy', 't']]) {
      const p = A.hanhTinh(ten, JD);
      const g = Math.abs(A.quanh(p.kinh - t.kinh));
      if (giu === 'k') xaKim = Math.max(xaKim, g); else xaThuy = Math.max(xaThuy, g);
    }
  }
  ok('Sao Kim không rời Mặt Trời quá 48°', xaKim < 48 && xaKim > 40, `xa nhất ${xaKim.toFixed(1)}°`);
  ok('Sao Thuỷ không rời Mặt Trời quá 29°', xaThuy < 29 && xaThuy > 22, `xa nhất ${xaThuy.toFixed(1)}°`);

  /* Hành tinh phải nằm sát mặt phẳng hoàng đạo — vĩ độ hoàng đạo luôn nhỏ. */
  let viMax = 0;
  for (const ten of A.TEN_HANH_TINH) {
    if (ten === 'dat') continue;
    for (let d = 0; d < 365 * 3; d += 5) {
      const p = A.hanhTinh(ten, A.ngayJulius(Date.UTC(2024, 0, 1) + d * 86400000));
      viMax = Math.max(viMax, Math.abs(p.vi));
    }
  }
  /* Ngưỡng 9,5 chứ không phải 8. Nhìn từ Trái Đất, vĩ độ hoàng đạo có thể LỚN HƠN độ
     nghiêng quỹ đạo: Sao Kim nghiêng 3,39 độ, cách Mặt Trời 0,723 đvtv nên lệch khỏi mặt
     phẳng hoàng đạo nhiều nhất 0,0428 đvtv — nhưng lúc giao hội dưới nó chỉ còn cách Trái
     Đất 0,28 đvtv, nhìn ra thành asin(0,0428/0,28) = 8,8 độ. Đo được 8,56 đúng lúc nó cách
     0,283 đvtv, khớp hình học. Lúc đầu tôi đặt 8 nên phép thử báo sai oan. */
  ok('hành tinh luôn nằm sát hoàng đạo (dưới 9,5°)', viMax < 9.5, `xa nhất ${viMax.toFixed(2)}°`);

  /* Khoảng cách tới các hành tinh phải nằm trong khoảng hình học cho phép. */
  const kc = { thuy: [.5, 1.5], kim: [.25, 1.75], hoa: [.35, 2.7], moc: [3.9, 6.5], tho: [7.9, 11.1] };
  let kcXau = [];
  for (const ten of Object.keys(kc)) {
    for (let d = 0; d < 365 * 3; d += 7) {
      const p = A.hanhTinh(ten, A.ngayJulius(Date.UTC(2024, 0, 1) + d * 86400000));
      if (p.kc < kc[ten][0] || p.kc > kc[ten][1]) kcXau.push(`${ten} ${p.kc.toFixed(2)}`);
    }
  }
  ok('khoảng cách tới hành tinh nằm trong khoảng cho phép', kcXau.length === 0, kcXau.slice(0, 3).join(', '));

  /* Trái Đất cách Mặt Trời 0,983 tới 1,017 đơn vị thiên văn, gần nhất đầu tháng Giêng. */
  const kcT = [];
  for (let d = 0; d < 365; d++) kcT.push(A.matTroi(A.ngayJulius(Date.UTC(2026, 0, 1) + d * 86400000)).kc);
  ok('khoảng cách tới Mặt Trời trong khoảng 0,983–1,017',
     Math.min(...kcT) > .982 && Math.max(...kcT) < 1.018,
     `${Math.min(...kcT).toFixed(4)}–${Math.max(...kcT).toFixed(4)}`);
  ok('gần Mặt Trời nhất vào đầu tháng Giêng', kcT.indexOf(Math.min(...kcT)) < 10,
     `ngày thứ ${kcT.indexOf(Math.min(...kcT)) + 1}`);
}

console.log('\n— Độ cao và phương vị —');
{
  /* Giữa trưa mặt trời phải ở gần hướng Nam khi đứng ở Bắc bán cầu phía trên chí tuyến,
     và độ cao lúc trưa phải khớp công thức đơn giản 90 - |vĩ độ - xích vĩ|. */
  const trua = Date.parse('2026-09-14T04:49:08Z');     // giờ Mặt Trời qua kinh tuyến, theo nguồn
  const JD = A.ngayJulius(trua);
  const t = A.matTroi(JD);
  const v = A.docCao(t.ra, t.dec, HCM.vi, HCM.kinh, JD);
  const caoLyThuyet = 90 - Math.abs(HCM.vi - t.dec);
  ok(`trưa: độ cao ${v.cao.toFixed(2)}°, công thức cho ${caoLyThuyet.toFixed(2)}°`,
     Math.abs(v.cao - caoLyThuyet) < .2);
  ok(`trưa: hướng ${v.huong.toFixed(0)}° (Bắc hoặc Nam, không phải Đông Tây)`,
     v.huong < 5 || v.huong > 355 || Math.abs(v.huong - 180) < 5);

  /* Sao Bắc Đẩu — đúng hơn là sao Bắc Cực — phải đứng gần như bất động ở phương Bắc,
     và độ cao của nó bằng đúng vĩ độ nơi đứng. Đây là phép thử kinh điển. */
  const RA_BAC_CUC = 37.9529, DEC_BAC_CUC = 89.2641;   // Polaris, J2000
  let caoMin = 99, caoMax = -99, huongLech = 0;
  for (let h = 0; h < 24; h++) {
    const ms = Date.UTC(2026, 8, 14, h);
    const p = A.docCao(RA_BAC_CUC, DEC_BAC_CUC, HCM.vi, HCM.kinh, A.ngayJulius(ms));
    caoMin = Math.min(caoMin, p.cao); caoMax = Math.max(caoMax, p.cao);
    huongLech = Math.max(huongLech, Math.min(p.huong, 360 - p.huong));
  }
  ok(`sao Bắc Cực đứng ở độ cao bằng vĩ độ (${HCM.vi.toFixed(1)}°)`,
     Math.abs((caoMin + caoMax) / 2 - HCM.vi) < 1, `${caoMin.toFixed(2)}–${caoMax.toFixed(2)}°`);
  ok('sao Bắc Cực gần như không nhúc nhích suốt đêm', caoMax - caoMin < 1.6,
     `xê dịch ${(caoMax - caoMin).toFixed(2)}°`);
  ok('sao Bắc Cực luôn ở phương Bắc', huongLech < 1.5, `lệch nhiều nhất ${huongLech.toFixed(2)}°`);
}

console.log('\n— Trời tối tới đâu —');
{
  const m = (h, p) => A.doToi(A.docCao(A.matTroi(A.ngayJulius(Date.UTC(2026, 8, 14, h, p))).ra,
    A.matTroi(A.ngayJulius(Date.UTC(2026, 8, 14, h, p))).dec, HCM.vi, HCM.kinh,
    A.ngayJulius(Date.UTC(2026, 8, 14, h, p))).cao).muc;
  ok('giữa trưa là ban ngày', m(4, 49) === 'ngay');
  ok('nửa đêm là tối hẳn', m(17, 0) === 'toi');
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

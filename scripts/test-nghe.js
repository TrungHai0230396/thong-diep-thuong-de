/* Kiểm thử bộ so khớp câu nói: node scripts/test-nghe.js

   Câu hỏi phải trả lời được bằng số, không phải bằng cảm giác:
   1. Nghe chuẩn thì có phân biệt sạch ba câu trong mỗi lượt không?
   2. Nghe méo kiểu người Việt (rụng phụ âm cuối, th→t, rụng mạo từ, rụng hẳn một từ) thì còn
      nhận đúng bao nhiêu phần trăm, và có bao giờ nhận NHẦM sang câu khác không?
   Nhận nhầm nguy hiểm hơn nhiều so với không nhận ra: không nhận ra thì chỉ nói lại,
   còn nhận nhầm là dạy sai. */
const fs = require('fs');
const path = require('path');
const N = require(path.join(__dirname, '..', 'assets', 'nghe.js'));

/* Câu mẫu: 27 lượt, mỗi lượt ba câu gần nhau, tách ra từ trò Tập nói tiếng Anh trước khi
   gỡ trò đó. Trò Tập nói không còn, nhưng hàm chonCau vẫn là thứ trò Luyện phát âm dùng để
   nghe người dùng nói, nên phép thử độ bền của nó vẫn phải giữ — chỉ đổi nguồn câu mẫu. */
const MAU = JSON.parse(fs.readFileSync(path.join(__dirname, 'cau-mau-nghe.json'), 'utf8'));
const CANH = MAU.map(c => ({ luot: c.map(ba => ({ chon: ba.map(en => ({ en })) })) }));

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Chuẩn hoá —');
ok('bung viết tắt', N.chuanHoa("I'm fine") === 'i am fine');
ok('bỏ dấu câu và hạ chữ thường', N.chuanHoa('A Coffee, Please!') === 'a coffee please');
ok('đổi chữ số thành chữ', N.chuanHoa('A table for 2') === 'a table for two');
ok('tiền bạc đúng thứ tự', N.chuanHoa("That's $3.") === 'that is three dollars');
ok('nháy cong cũng bung được', N.chuanHoa('I’m here') === 'i am here');

/* Méo giọng kiểu người Việt, mô phỏng đúng mấy lỗi hay gặp nhất. */
const runPhuAmCuoi = (t) => t.replace(/([a-z])(s|t|d|k|l|p)\b/g, '$1');
const thThanhT = (t) => t.replace(/\bth/g, 't');
const rungMaoTu = (t) => t.replace(/\b(a|an|the)\s/g, '');
const rungMotTu = (t, i) => { const w = t.split(' '); if (w.length < 4) return t; w.splice(i % w.length, 1); return w.join(' '); };

function meo(cau, muc, i) {
  let t = N.chuanHoa(cau);
  if (muc >= 1) t = runPhuAmCuoi(t);
  if (muc >= 2) t = thThanhT(t);
  if (muc >= 3) t = rungMaoTu(t);
  if (muc >= 4) t = rungMotTu(t, i);
  return t;
}

const luot = CANH.flatMap(c => c.luot);
console.log(`\n— Nghe chuẩn (${luot.length} lượt, ${luot.length * 3} câu) —`);
let sachSe = 0, nhamChuan = 0;
luot.forEach(l => {
  const cau = l.chon.map(o => o.en);
  const dung = cau.every((c, i) => { const r = N.chonCau([c], cau); return r.chi === i; });
  if (dung) sachSe++;
  cau.forEach((c, i) => { const r = N.chonCau([c], cau); if (r.chi >= 0 && r.chi !== i) nhamChuan++; });
});
ok('nghe chuẩn: lượt nào cũng phân biệt sạch ba câu', sachSe === luot.length, `${sachSe}/${luot.length}`);
ok('nghe chuẩn: không lượt nào nhận nhầm sang câu khác', nhamChuan === 0, `${nhamChuan} lần nhầm`);

for (const [ten, muc] of [['rụng phụ âm cuối', 1], ['thêm th→t', 2], ['thêm rụng mạo từ', 3], ['thêm rụng hẳn một từ', 4]]) {
  let nhan = 0, nham = 0, truot = 0, tong = 0;
  luot.forEach((l, k) => {
    const cau = l.chon.map(o => o.en);
    cau.forEach((c, i) => {
      tong++;
      const r = N.chonCau([meo(c, muc, k + i)], cau);
      if (r.chi === i) nhan++; else if (r.chi >= 0) nham++; else truot++;
    });
  });
  console.log(`\n— Méo giọng: ${ten} —`);
  ok(`nhận đúng ít nhất 80%`, nhan / tong >= .8, `${(nhan / tong * 100).toFixed(1)}% (${nhan}/${tong})`);
  ok(`không nhận NHẦM sang câu khác`, nham === 0, `${nham} lần nhầm, ${truot} lần nghe lại`);
}

console.log('\n— Câu lạc đề thì phải không khớp gì —');
const lac = ['hello my friend how are you today', 'xin chao ban khoe khong', 'the weather is very nice today'];
let sai = 0;
luot.slice(0, 12).forEach(l => {
  const cau = l.chon.map(o => o.en);
  lac.forEach(x => { if (N.chonCau([x], cau).chi >= 0) sai++; });
});
ok('câu lạc đề không bị ép vào câu nào', sai === 0, `${sai} lần ép nhầm`);

console.log('\n— Nhiều phương án từ máy nhận giọng —');
const l0 = CANH[1].luot[0].chon.map(o => o.en);
ok('một phương án đúng trong năm là đủ',
   N.chonCau(['a coffee peas', 'a copy please', 'a coffee please'], l0).chi === l0.findIndex(c => /coffee/.test(c)));

console.log(`\n${fail === 0 ? '✓ Tất cả' : '✗ Có lỗi'}: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail === 0 ? 0 : 1);

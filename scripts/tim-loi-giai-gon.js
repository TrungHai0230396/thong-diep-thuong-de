/* Tìm lời giải gọn hơn lời giải mẫu: node scripts/tim-loi-giai-gon.js [từ bài] [tới bài] [giây mỗi bài]
   Chấm sao theo số ô (3 sao = gọn bằng lời giải mẫu) chỉ công bằng khi lời giải mẫu thật sự gọn nhất. Tệp này thử MỌI
   chương trình ngắn hơn lời giải mẫu (tăng dần từng ô, chỉ dùng ô có trong bảng của bài), báo bài nào có cách gọn hơn.
   Bài lớn có thể hết giờ trước khi thử hết — khi đó ghi "chưa thử hết", không kết luận. Không chạy trong bộ kiểm thử
   thường ngày vì lâu; chạy tay mỗi khi sửa bài. */
const fs = require('fs');
const path = require('path');
global.self = global; global.window = global; global.addEventListener = () => {};
global.TDTD_BAICODE = require('../assets/baicode.js');
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8'))();
const L = global.TDTD_LAPTRINH;

const [tu = 1, toi = 100, giay = 6] = process.argv.slice(2).map(Number);
const HET_GIO = {};

function* day(n, sau, ctx) {                                             // các dãy ô có đúng n ô
  if (n === 0) { yield []; return; }
  for (let s1 = 1; s1 <= n; s1++) {
    for (const dau of mot(s1, sau, ctx)) {
      for (const duoi of day(n - s1, sau, ctx)) {
        const kt = duoi[0];
        if (kt && ((dau.k === 'trai' && kt.k === 'phai') || (dau.k === 'phai' && kt.k === 'trai'))) continue;   // rẽ rồi rẽ ngược: vô ích
        if (Date.now() > ctx.han) throw HET_GIO;
        yield [dau, ...duoi];
      }
    }
  }
}
function* mot(n, sau, ctx) {                                             // một ô (kể cả ô chứa) dùng đúng n ô
  if (n === 1) { for (const k of ctx.don) yield { k }; return; }
  if (sau >= 2) return;
  if (ctx.lap) for (const than of day(n - 1, sau + 1, ctx)) for (let k = 2; k <= 9; k++) {
    if (than.length === 1 && than[0].k === 'lap' && k * than[0].n <= 9) continue;   // lặp k (lặp m X) = lặp k·m X: khỏi thử
    yield { k: 'lap', n: k, than };
  }
  if (ctx.den) for (const than of day(n - 1, sau + 1, ctx)) yield { k: 'den', than };
  for (const dk of ctx.neu) for (let a = 1; a <= n - 1; a++) for (const thi of day(a, sau + 1, ctx)) for (const khac of day(n - 1 - a, sau + 1, ctx)) yield { k: 'neu', dk, thi, khac };
}

function tim(b, i) {
  const ban = L.banBai(i), mau = L.soO(L.docMa(b.giai)) + L.soO(L.docMa(b.ham || ''));
  const coHam = b.lenh.includes('ham');
  const ctxGoc = {
    han: Date.now() + giay * 1000,
    don: ['di', 'trai', 'phai', 'nhay', 'thap'].filter(k => b.lenh.includes(k)),
    lap: b.lenh.includes('lap'), den: b.lenh.includes('den'),
    neu: ['truoc', 'trai', 'phai', 'sao'].filter(k => b.lenh.includes('neu-' + k)),
  };
  try {
    for (let tong = 1; tong < mau; tong++) {
      /* không hàm: cả tong ô cho chương trình chính */
      for (const ct of day(tong, 0, ctxGoc)) if (L.chay(ban, ct, []).thang) return { mau, gon: tong, ct };
      if (!coHam) continue;
      /* có hàm: chia tong ô cho chương trình chính (phải gọi hàm) và hàm */
      const ctxH = Object.assign({}, ctxGoc, { don: ctxGoc.don.concat('ham') });
      for (let h = 1; h < tong; h++) {
        for (const hm of day(h, 0, ctxGoc)) {
          for (const ct of day(tong - h, 0, ctxH)) {
            if ((JSON.stringify(ct).match(/"ham"/g) || []).length < 2) continue;   // gọi hàm một lần thì viết thẳng ra cũng gọn bằng
            if (L.chay(ban, ct, hm).thang) return { mau, gon: tong, ct, hm };
          }
        }
      }
    }
    return { mau, xong: true };
  } catch (e) { if (e === HET_GIO) return { mau, hetGio: true }; throw e; }
}

const viet = (ds) => ds.map(n => n.k === 'lap' ? `${n.n}(${viet(n.than)})` : n.k === 'den' ? `w(${viet(n.than)})`
  : n.k === 'neu' ? `?${n.dk}(${viet(n.thi)})(${viet(n.khac)})` : { di: 'd', thap: 't', trai: 'L', phai: 'R', nhay: 'j', ham: 'F' }[n.k]).join(' ');
let gon = 0, chua = 0;
for (let i = tu - 1; i < toi; i++) {
  const b = L.BAI[i], r = tim(b, i);
  if (r.gon) { gon++; console.log(`✗ bài ${i + 1} (${b.ten}): mẫu ${r.mau} ô, có cách ${r.gon} ô: ${viet(r.ct)}${r.hm ? ' | hàm: ' + viet(r.hm) : ''}`); }
  else if (r.hetGio) { chua++; console.log(`… bài ${i + 1} (${b.ten}): mẫu ${r.mau} ô, chưa thử hết trong ${giay} giây`); }
}
console.log(`\n${gon} bài có cách gọn hơn mẫu, ${chua} bài chưa thử hết, còn lại lời giải mẫu là gọn nhất.`);

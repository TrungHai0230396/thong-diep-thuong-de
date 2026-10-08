/* Kiểm thử đếm lượt truy cập: node scripts/test-thongke.js
   Mỗi lần mở trang gửi đúng một lượt, mang đúng nhãn (trình duyệt / app / cài mới), lượt cài chỉ đếm một lần. */
const fs = require('fs');
const path = require('path');
const T = require('../assets/thongke.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Nhãn cho mỗi lượt mở —');
ok('mở bằng trình duyệt: /', T.nhan(false, null).duong === '/' && T.nhan(false, null).tt === null);
ok('mở bằng trình duyệt dù đã từng cài: vẫn là /', T.nhan(false, { moApp: true }).duong === '/');
ok('lần đầu mở từ màn hình chính: /app/moi', T.nhan(true, null).duong === '/app/moi');
ok('lần đầu mở app thì ghi mốc đã mở và đã cài, giữ nguyên số lần gợi ý',
   JSON.stringify(T.nhan(true, { lan: 2, luc: 5 }).tt) === JSON.stringify({ lan: 2, luc: 5, moApp: true, daCai: true }));
ok('từ lần thứ hai: /app, không ghi gì thêm', T.nhan(true, { moApp: true }).duong === '/app' && T.nhan(true, { moApp: true }).tt === null);

console.log('\n— Mỗi lần mở trang chỉ gửi một lượt (gói miễn phí 50.000 lượt/tháng) —');
const kho = { tt: null, ghi: 0 };
const CA = { docTT: () => kho.tt, ghiTT: (t) => { kho.tt = t; kho.ghi++; } };
const loc = T.locGui('https://x.vercel.app', true, CA);
const a = loc({ type: 'pageview', url: 'https://x.vercel.app/#ho-sen' });
ok('lượt đầu: đổi địa chỉ thật thành nhãn, bỏ phần sau dấu #', a && a.url === 'https://x.vercel.app/app/moi', a && a.url);
ok('giữ các trường khác của lượt gửi', a && a.type === 'pageview');
ok('ghi mốc đã mở app đúng một lần', kho.ghi === 1 && kho.tt.moApp === true);
ok('đổi sang sao khác (đổi dấu #): không gửi thêm', loc({ type: 'pageview', url: 'https://x.vercel.app/#troi-dem' }) === null);
ok('sự kiện tuỳ chọn (gói Hobby không có): bỏ', T.locGui('https://x.vercel.app', false, CA)({ type: 'event', url: 'https://x.vercel.app/' }) === null);
const lan2 = T.locGui('https://x.vercel.app', true, CA)({ type: 'pageview', url: 'https://x.vercel.app/' });
ok('mở app lần sau: /app, lượt cài không đếm lại', lan2.url === 'https://x.vercel.app/app' && kho.ghi === 1, lan2.url);
ok('mở bằng trình duyệt: /', T.locGui('https://x.vercel.app', false, CA)({ type: 'pageview', url: 'https://x.vercel.app/?a=1#b' }).url === 'https://x.vercel.app/');

console.log('\n— Chạy trong trang —');
function chay(protocol, standalone) {
  const the = [];
  const g = { navigator: { standalone }, location: { protocol, origin: 'https://x.vercel.app' },
    matchMedia: () => ({ matches: false }),
    document: { createElement: () => ({}), head: { appendChild: (s) => the.push(s) } } };
  g.self = g;
  const ma = fs.readFileSync(path.join(__dirname, '..', 'assets', 'thongke.js'), 'utf8');
  new Function('self', 'document', 'location', 'navigator', 'matchMedia', 'module', ma)(g, g.document, g.location, g.navigator, g.matchMedia, undefined);
  return { g, the };
}
const that = chay('https:', false);
ok('trang thật: chèn đúng một tệp đếm của Vercel, tải hoãn', that.the.length === 1 && that.the[0].src === '/_vercel/insights/script.js' && that.the[0].defer === true);
ok('đặt hàng chờ va và bộ lọc beforeSend trước khi tệp đếm tải xong',
   Array.isArray(that.g.vaq) && that.g.vaq[0][0] === 'beforeSend' && typeof that.g.vaq[0][1] === 'function');
ok('bộ lọc trong trang gửi nhãn /', that.g.vaq[0][1]({ type: 'pageview', url: 'https://x.vercel.app/#a' }).url === 'https://x.vercel.app/');
ok('mở từ màn hình chính iPhone (navigator.standalone): nhãn /app/moi',
   chay('https:', true).g.vaq[0][1]({ type: 'pageview', url: 'https://x.vercel.app/' }).url === 'https://x.vercel.app/app/moi');
const may = chay('http:', false);
ok('chạy thử ở máy (http): không chèn gì, không đếm', may.the.length === 0 && !may.g.vaq);

console.log('\n— Service worker không chặn bộ đếm —');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
ok('đường /_vercel/ đi thẳng ra mạng, không cất, không trả index.html', /pathname\.startsWith\('\/_vercel\/'\)\) return;/.test(sw));
ok('thongke.js có trong danh sách tải sẵn', sw.includes("'assets/thongke.js'"));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
ok('index.html nạp thongke.js sau caiapp.js (cần mẩu tdtd.caiApp)', html.indexOf('assets/caiapp.js') > 0 && html.indexOf('assets/thongke.js') > html.indexOf('assets/caiapp.js'));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

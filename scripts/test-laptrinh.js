/* Kiểm thử Robot thắp sao: node scripts/test-laptrinh.js
   Cả 100 bài: bản đồ dựng được, lời giải mẫu thắp hết sao, chỉ dùng ô được phép, không quá số ô tối đa; chương vòng lặp,
   hàm, điều kiện thì xếp từng bước KHÔNG đủ chỗ (buộc dùng điều đang học); bài sửa lỗi thì chương trình cho sẵn sai thật.
   Thêm luật chạy: khựng khi vướng, nhảy lên một nấc, nhảy xuống bao nhiêu cũng được, thắp chỉ ô sao, vòng lặp vô tận
   tự dừng. */
const fs = require('fs');
const path = require('path');
global.self = global; global.window = global;
global.addEventListener = () => {};
global.TDTD_BAICODE = require('../assets/baicode.js');
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8'))();
const L = global.TDTD_LAPTRINH;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Cấu trúc —');
ok('đúng 100 bài, 10 chương', L.BAI.length === 100 && L.CHUONG.length === 10, `${L.BAI.length} bài, ${L.CHUONG.length} chương`);
ok('chương nào cũng có lời giới thiệu, và ô mới giới thiệu đều có trong bảng ô của chương', L.CHUONG.every(c => c.gioiThieu.length && c.lenhMoi.every(k => c.lenh.includes(k))));
ok('mọi loại ô dùng trong bài đều có hình và chữ', L.BAI.every(b => b.lenh.every(k => L.O[k] && L.O[k].chu && L.O[k].hinh)));

console.log('\n— Từng bài —');
const loi = { ban: [], giai: [], o: [], toiDa: [], co: [], buoc: [], san: [], sao: [] };
const CHUONG_KHAI_NIEM = new Set([4, 5, 6, 7, 8, 9]);                 // vòng lặp, lặp lồng, hàm, hàm + lặp, điều kiện, thử thách
L.BAI.forEach((b, i) => {
  const so = `bài ${i + 1}`;
  let ban;
  try { ban = L.dungBan(b); } catch (e) { loi.ban.push(`${so}: ${e.message}`); return; }
  if (ban.rong > 10 || ban.sau > 10) loi.co.push(`${so}: ${ban.rong}×${ban.sau}`);
  if (!ban.o.some(c => c.sao)) loi.sao.push(so);
  const giai = L.docMa(b.giai), ham = L.docMa(b.ham || '');
  const kq = L.chay(ban, giai, ham);
  if (!kq.thang) loi.giai.push(`${so}: còn ${kq.conLai} sao${kq.het ? ', chạy mãi' : ''}`);
  const dung = [...L.loaiO(giai.concat(ham))].filter(k => !b.lenh.includes(k));
  if (dung.length) loi.o.push(`${so}: dùng ${dung.join(', ')}`);
  const n = L.soO(giai) + L.soO(ham);
  if (n > b.toiDa) loi.toiDa.push(`${so}: ${n} > ${b.toiDa}`);
  if (CHUONG_KHAI_NIEM.has(b.chuong)) {
    const it = L.itNhat(ban);
    if (!(b.toiDa < it)) loi.buoc.push(`${so} (${b.ten}): tối đa ${b.toiDa} ô, xếp từng bước chỉ cần ${it}`);
  }
  if (b.san) {
    const san = L.docMa(b.san), sanHam = L.docMa(b.sanHam || '');
    const ks = L.chay(ban, san, sanHam);
    if (ks.thang) loi.san.push(`${so}: chương trình cho sẵn lại chạy đúng`);
    const ds = [...L.loaiO(san.concat(sanHam))].filter(k => !b.lenh.includes(k));
    if (ds.length) loi.san.push(`${so}: cho sẵn ô ${ds.join(', ')}`);
    if (L.soO(san) + L.soO(sanHam) > b.toiDa) loi.san.push(`${so}: cho sẵn quá số ô`);
  }
});
ok('bản đồ bài nào cũng dựng được (đường mẫu không tự cắt mình ở độ cao khác)', !loi.ban.length, loi.ban.join('; '));
ok('bản đồ vừa màn điện thoại: không quá 10 × 10 ô', !loi.co.length, loi.co.join('; '));
ok('bài nào cũng có sao', !loi.sao.length, loi.sao.join('; '));
ok('lời giải mẫu của cả 100 bài đều thắp hết sao', !loi.giai.length, loi.giai.join('; '));
ok('lời giải mẫu chỉ dùng ô có trong bảng ô của bài', !loi.o.length, loi.o.join('; '));
ok('lời giải mẫu không quá số ô tối đa', !loi.toiDa.length, loi.toiDa.join('; '));
ok('chương vòng lặp, hàm, điều kiện, thử thách: xếp từng bước không đủ chỗ — buộc dùng điều đang học', !loi.buoc.length, loi.buoc.join('; '));
const soSua = L.BAI.filter(b => b.san).length;
ok(`bài sửa lỗi (${soSua} bài): chương trình cho sẵn sai thật, chỉ dùng ô được phép, không quá số ô`, soSua >= 8 && !loi.san.length, loi.san.join('; '));
ok('chương Sửa lỗi bài nào cũng cho sẵn chương trình', L.BAI.filter(b => b.chuong === 3).every(b => b.san));

console.log('\n— Luật chạy —');
{
  /* bản đồ thử: một hàng, độ cao 0 1 3 1 0, sao ở ô cuối */
  const ban = { o: [0, 1, 3, 1, 0].map((h, x) => ({ x, y: 0, h, sao: x === 4 })), robot: { x: 0, y: 0, huong: 1 } };
  const ct = (s) => L.chay(ban, L.docMa(s), []);
  const k1 = ct('d');
  ok('Đi vào khối cao hơn: robot khựng tại chỗ', !k1.buoc[0].ok && k1.buoc[0].x1 === 0);
  const k2 = ct('j j');
  ok('Nhảy lên đúng một nấc thì được, cao hơn hai nấc thì khựng', k2.buoc[0].ok && k2.buoc[0].h1 === 1 && !k2.buoc[1].ok);
  const ban2 = { o: [3, 1, 0].map((h, x) => ({ x, y: 0, h, sao: x === 2 })), robot: { x: 0, y: 0, huong: 1 } };
  const k3 = L.chay(ban2, L.docMa('j j t'), []);
  ok('Nhảy xuống thấp hơn bao nhiêu cũng được', k3.buoc[0].ok && k3.buoc[0].h1 === 1 && k3.buoc[1].ok && k3.thang);
  const k4 = ct('t');
  ok('Thắp ở ô không có sao: không có gì sáng', !k4.buoc[0].ok && !k4.thang);
  ok('đi ra ngoài bản đồ: khựng, không rơi', !L.chay(ban, L.docMa('R d'), []).buoc[1].ok);
  const k5 = ct('w(R)');
  ok('vòng lặp đến khi hết sao mà không bao giờ thắp được: tự dừng, báo chạy mãi', k5.het && !k5.thang && k5.buoc.length <= 800);
  const k6 = ct('w()');
  ok('vòng lặp rỗng: dừng ngay, không treo máy', k6.het && k6.buoc.length === 0);
  const k7 = L.chay(ban, L.docMa('F'), L.docMa('R F'));
  ok('hàm tự gọi mình mãi: tự dừng', k7.het);
  const phang = { o: [[0, 0], [1, 0], [1, 1]].map(([x, y]) => ({ x, y, h: 0, sao: x === 1 && y === 1 })), robot: { x: 0, y: 0, huong: 1 } };
  const k8 = L.chay(phang, L.docMa('w(?d(d)(?r(R)(L)) ?s(t))'), []);
  ok('nếu có đường phía trước / bên phải: robot tự đi tới sao', k8.thang);
  ok('thắp xong ngôi sao cuối là dừng ngay, lệnh sau không chạy', L.chay(phang, L.docMa('d R d t d d d'), []).buoc.length === 4);
  ok('đếm ô: mỗi ô một, kể cả ô chứa và ô bên trong', L.soO(L.docMa('3(d t) w(?d(d)(R))')) === 3 + 4);
}

console.log('\n— Gợi ý từng bước —');
{
  const b = (i) => L.BAI[i - 1], gy = (i, s, h = '') => L.goiYBuoc(L.docMa(s), L.docMa(h), b(i));
  ok('chưa xếp gì: gợi ý ô đầu tiên của lời giải, vào Chương trình', (r => r.loai === 'them' && r.k === 'di' && r.ds === 'chinh')(gy(1, '')));
  ok('đúng một nửa: gợi ý ô tiếp theo', (r => r.loai === 'them' && r.k === 'thap')(gy(1, 'd')));
  ok('đã giống lời giải: bảo bấm Chạy', gy(1, 'd t').loai === 'xong');
  ok('xếp sai ô: chỉ ra đúng ô sai', (r => r.loai === 'sai')(gy(1, 'L t')));
  ok('thừa một ô: chỉ ra ô thừa', (r => r.loai === 'thua')(gy(1, 'd t t')) && (r => r.loai === 'thua')(gy(1, 'd d t')));
  const s29 = L.docMa(b(29).san), r29 = L.goiYBuoc(s29, [], b(29));
  ok('bài sửa lỗi "thiếu một bước": bảo chèn ô Đi ngay trước ô Thắp, không bảo ô Thắp sai', r29.loai === 'chen' && r29.k === 'di' && r29.truoc === s29[2].id);
  const k54 = L.docMa('3(2(j))'), r54 = L.goiYBuoc(k54, [], b(54));
  ok('vòng lặp lồng: thiếu ô Đi trong vòng ngoài → bảo thêm vào đúng thân vòng ngoài', r54.loai === 'them' && r54.k === 'di' && r54.ds === k54[0].id + '.than');
  const k2 = L.docMa('2(2(j) d) t');
  ok('sai số lần lặp: bảo đổi đúng con số', (r => r.loai === 'solan' && r.n === 3 && r.id === k2[0].id)(L.goiYBuoc(k2, [], b(54))));
  ok('có hàm: chương trình chính đúng rồi thì gợi ý tiếp vào Hàm ★', (r => r.loai === 'them' && r.ds === 'ham' && r.k === 'di')(gy(59, 'F F F')));
  ok('chương điều kiện: gợi ý ô nằm trong phần "không thì"', (r => r.loai === 'them' && r.k === 'neu-trai')(gy(83, 'w(?d(d)())')));
}

console.log('\n— Âm thanh; bài nào cũng mở —');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('thắp sao có tiếng chuông, sao sau cao hơn sao trước', /ve\.sang\.add\(b\.sang\);[^\n]*tingSao\(ve\.sang\.size - 1\)/.test(src) && /const BAC = \[523\.25, 659\.25, 783\.99/.test(src));
  ok('thắng có nhạc mừng, vướng có tiếng bộp nhỏ', /setTimeout\(nhacThang, 250\)/.test(src) && /if \(!b\.ok\) \{[^}]*tiengVuong\(\)/.test(src));
  ok('tắt được âm thanh; mở âm thanh ngay lúc bấm Chạy (iPhone đòi), đóng trò thì ngắt', /coTieng = !coTieng/.test(src) && /function batDauChay\(tungBuoc\) \{\s*amThanh\(\);/.test(src) && /am\.suspend\(\)/.test(src));
  /* Người dùng: "mở full hết đi, ai muốn chơi màn nào thì chơi" — không còn khoá bài nào */
  ok('danh sách bài không khoá bài nào (bản trước: chỉ mở tới bài chưa xong đầu tiên)', !/disabled/.test(src.slice(src.indexOf('function moDs'), src.indexOf('function themO'))) && !/moToi/.test(src));
  ok('chế độ thử (?mohet, hay chạm 7 lần vào tên trò) giờ chỉ thêm nút điền lời giải mẫu', /\[\?&\]mohet/.test(src) && /bamBi\.n >= 7/.test(src) && /cheDoThu \? `[^`]*data-dien/.test(src));
  ok('có nút chuyển sang bài trước, bài sau ngay trên cảnh', /data-chuyen="-1"/.test(src) && /data-chuyen="1"/.test(src) && /moBai\(bai \+ \(\+n\.dataset\.chuyen\)\)/.test(src));
  ok('danh sách bài: có nút "Làm tiếp bài chưa xong", đóng bằng ✕ hay chạm ra ngoài, tự cuộn tới bài đang chơi',
     /Làm tiếp bài chưa xong/.test(src) && /lt-ds-x/.test(src) && /t === tam\.querySelector\('\.lt-ds'\)/.test(src) && /\.lt-ds-luoi \.lt-dang/.test(src));
}

{
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('đếm ô ghi rõ "tối đa" (bản cũ "6/7 ô" bị đọc thành cần 7 ô), và có Hàm ★ thì nói là tính cả hàm',
     /`\$\{n\} ô \(cả Hàm ★\) · tối đa \$\{b\.toiDa\}` : `\$\{n\} ô · tối đa \$\{b\.toiDa\}`/.test(src));
  ok('thắng rồi thì nói so với cách gọn nhất: gọn hơn / bằng (3 sao) / dài hơn bao nhiêu ô', /Còn gọn hơn cả lời giải gọn nhất/.test(src) && /Gọn nhất rồi — đủ 3 sao!/.test(src) && /Cách gọn nhất chỉ cần \$\{mau\} ô\. Bớt/.test(src));
}

console.log('\n— Chấm sao theo số ô —');
{
  ok('bằng hoặc gọn hơn lời giải gọn nhất: 3 sao; dư 1–2 ô: 2 sao; dư nhiều hơn: 1 sao',
     L.soSao(6, 6) === 3 && L.soSao(5, 6) === 3 && L.soSao(7, 6) === 2 && L.soSao(8, 6) === 2 && L.soSao(9, 6) === 1);
  ok('giải đúng bằng cách gọn nhất là đủ 3 sao, ở mọi bài (người dùng giải bài 69 bằng đúng số ô gọn nhất mà tưởng thiếu)', L.BAI.every(b => L.soSao(L.mauBai(b), L.mauBai(b)) === 3));
  /* lời giải mẫu phải là cách gọn nhất (bài kiểm này không tìm kiếm — scripts/tim-loi-giai-gon.js mới tìm) — ít nhất
     không dài hơn mọi cách giải từng bước, và không quá số ô tối đa */
  ok('số ô tối đa chừa chỗ cho 2 sao: tối đa ≥ lời giải gọn nhất', L.BAI.every(b => b.toiDa >= L.mauBai(b)));
  const kho = {};
  global.localStorage = { getItem: (k) => (k in kho ? kho[k] : null), setItem: (k, v) => { kho[k] = String(v); } };
  ok('chuỗi tiến độ cũ chỉ có 0/1 (trước khi có sao) vẫn đọc được: 1 = đã xong, 1 sao', (() => { kho['tdtd.code'] = '1' + '0'.repeat(99); return L._baiTiep() === 1; })());
  /* Mở trò: về bài đang chơi dở lần trước (kể cả bài nhảy cóc tới), không thì bài chưa xong đầu tiên */
  ok('chưa nhớ bài nào thì mở bài chưa xong đầu tiên', L._baiMo() === 1);
  kho['tdtd.code.nho'] = JSON.stringify({ bai: 57 });
  ok('mở lại trò thì về đúng bài đang chơi dở (bài 58), không bị kéo về bài chưa xong đầu tiên', L._baiMo() === 57);
  kho['tdtd.code.nho'] = JSON.stringify({ bai: 500 }); const a1 = L._baiMo();
  kho['tdtd.code.nho'] = '{hỏng'; const a2 = L._baiMo();
  ok('chỗ nhớ hỏng hay sai thì lùi về bài chưa xong đầu tiên, không nổ lỗi', a1 === 1 && a2 === 1);
  /* Bảng giới thiệu chương: lần đầu vào chương, dù nhảy vào giữa chương */
  kho['tdtd.code.nho'] = JSON.stringify({ chuong: '0000001000' });
  ok('chương đã xem giới thiệu thì không hiện lại; chương có bài đã xong (người chơi từ bản cũ) cũng coi như đã xem',
     L._daXemChuong(6) && L._daXemChuong(0) && !L._daXemChuong(8));
  delete global.localStorage;
}

console.log('\n— Kiểm trước khi chạy —');
{
  /* Người dùng ở bài 69: "bấm chạy mà còn dấu + xong đứng luôn" — Lặp 3 lần còn trống, Hàm ★ có lệnh mà chưa gọi.
     Chương trình chạy hết phần trước rồi đứng im, lời báo vài giây rồi tắt. */
  const k = (c, h = '') => L.kiemChuongTrinh(L.docMa(c), L.docMa(h));
  const r = k('d d R t 3()', 'd d t');
  ok('ô Lặp trống: không chạy, chỉ ra đúng ô trống', r && r.loai === 'trong');
  ok('ô Nếu trống cả hai phần, Lặp tới hết sao trống: cũng báo', k('w(?d()())').loai === 'trong' && k('w()').loai === 'trong');
  ok('Nếu chỉ có phần "không thì" là hợp lệ', k('w(?d()(R) d)') === null);
  ok('Hàm ★ có lệnh mà Chương trình không gọi: báo', k('d d R t', 'd d t').loai === 'hamChuaGoi');
  ok('gọi Hàm ★ mà Hàm ★ trống: báo', k('F F').loai === 'hamTrong');
  ok('chương trình đủ: cho chạy (kể cả gọi hàm nằm trong vòng lặp)', k('F R 3(F)', 'd d t') === null);
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('lời báo sau khi chạy đứng yên tới khi sửa hay chạm vào, không tự tắt', /bao\(`Chạy hết chương trình rồi mà còn \$\{kq\.conLai\} ngôi sao chưa thắp\.[^`]*`, 0\)/.test(src) && /function daSua\(\) \{\s*tatBao\(\);/.test(src));
  ok('đang chạy thì ẩn dấu +', /\.lt-dangchay \.lt-cho\{visibility:hidden\}/.test(fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8')));
}

console.log('\n— Gắn vào app —');
const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8');
ok('là một ngôi sao trong app', /id: 'sao-laptrinh'[\s\S]*?khung: '\.laptrinh'[\s\S]*?mun: 'TDTD_LAPTRINH'/.test(app));
const vt = (t) => html.indexOf(`src="assets/${t}"`);
ok('nạp bài học trước, rồi tới trò, rồi app', vt('baicode.js') > 0 && vt('baicode.js') < vt('laptrinh.js') && vt('laptrinh.js') < vt('app.js'));
ok('chạy được khi mất mạng: hai tệp có trong bộ nhớ đệm cài sẵn', /'assets\/baicode\.js'/.test(sw) && /'assets\/laptrinh\.js'/.test(sw));
const z = (lop) => +((css.match(new RegExp(`\\.${lop}\\{[^}]*z-index:(\\d+)`)) || [])[1] || 0);
ok('màn trò phủ lên trang chính', z('laptrinh') >= 30);
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('chỉ nhớ hai chuỗi nhỏ: sao từng bài, và bài đang chơi + chương đã xem giới thiệu', (src.match(/localStorage\.setItem/g) || []).length === 2
     && /localStorage\.setItem\(KHOA,/.test(src) && /localStorage\.setItem\(KHOA_NHO,/.test(src));
}
console.log('\n— Dễ dùng trên điện thoại —');
{
  /* Người dùng: "trên ipad hay điện thoại bấm nhanh button đi 2 lần là bị phóng to màn hình" */
  ok('chạm nhanh hai lần vào nút không làm Safari phóng to trang (touch-action: manipulation cho mọi phần tử)', /^\*\{touch-action:manipulation\}/m.test(css));
  ok('…mà các tấm vẽ tự lo việc chạm vẫn giữ touch-action: none (class thắng quy tắc chung)', /\.lt-cv\{[^}]*touch-action:none/.test(css) && /\.td-cv\{[^}]*touch-action:none/.test(css));
  ok('bấm liên tục vào ô lệnh không bôi đen chữ, giữ lâu không bật bảng sao chép', /\.laptrinh\{[^}]*user-select:none[^}]*-webkit-touch-callout:none/.test(css));
  ok('cảnh 3D co được để nút ▶ Chạy luôn nằm trong màn (bản trước giữ tối thiểu 34% chiều cao — màn thấp thì nút Chạy bị đẩy ra ngoài)',
     /\.lt-canh\{[^}]*flex:1 1 0;min-height:120px/.test(css) && !/\.lt-canh\{[^}]*34vh/.test(css));
  ok('bảng ô lệnh xếp lưới đều, ô hẹp, chữ tối đa hai dòng (chương Nếu… thì… vừa hai hàng)', /\.lt-bang\{[^}]*display:grid;grid-template-columns:repeat\(auto-fill,minmax\(54px,1fr\)\)/.test(css));
  /* Chương trình gọn: phần "không thì" trống thu thành nút nhỏ; khung không phải chỗ đang xếp mà đã có ô thì không thêm dấu + */
  const ds = L.docMa('w(?d(d)() ?s(t))'), h = L._htmlDs(ds, 'thu');
  ok('phần "không thì" còn trống thu lại thành một nút "+ không thì"', (h.match(/lt-khac-gon/g) || []).length === 2 && !/không thì<\/span><div class="lt-than/.test(h));
  ok('khung đã có ô mà không phải chỗ đang xếp thì không chừa dấu + thừa; khung trống thì vẫn có', !/data-chon="thu">\+/.test(h) && /data-chon="thu">\+/.test(L._htmlDs([], 'thu')));
  /* Đang chạy: sáng ô đang làm và cả các ô chứa nó (Lặp, Nếu, ô gọi Hàm ★) */
  const phang = L.dungBan({ giai: 'd d d d' });
  const ct = L.docMa('F 2(F)'), hm = L.docMa('d'), kq = L.chay(phang, ct, hm);
  ok('mỗi bước chạy biết mình đang nằm trong ô gọi hàm nào, vòng lặp nào',
     kq.buoc[0].ngan.join() === String(ct[0].id) && kq.buoc[1].ngan.join() === [ct[1].id, ct[1].than[0].id].join() && kq.buoc[2].ngan.join() === [ct[1].id, ct[1].than[0].id].join());
}

console.log('\n— Kéo thả ô lệnh —');
{
  /* Người dùng: "chèn thêm 1 ô hơi khó khăn, cho kéo thả hoặc kéo di chuyển qua lại được không" */
  const tom = (ds) => ds.map(n => n.k + (n.than ? '(' + tom(n.than) + ')' : n.thi ? '(' + tom(n.thi) + '|' + tom(n.khac) + ')' : '')).join(' ');
  const dat = (ma, h) => { const c = L.docMa(ma), hm = L.docMa(h || ''); L._datCt(c, hm); return c; };
  let c = dat('d t L');
  L._diChuyen(c[1].id, 'chinh', 0);
  ok('kéo ô ra trước: Đi Thắp Rẽ trái → Thắp Đi Rẽ trái', tom(L._ct().chinh) === 'thap di trai', tom(L._ct().chinh));
  c = dat('d t L');
  L._diChuyen(c[0].id, 'chinh', 3);
  ok('kéo ô ra sau cùng: vị trí tính theo trước khi nhấc ô lên', tom(L._ct().chinh) === 'thap trai di', tom(L._ct().chinh));
  c = dat('d t L');
  L._diChuyen(c[0].id, 'chinh', 2);
  ok('kéo ô tới giữa hai ô phía sau nó (thả vào chỗ giữa Thắp và Rẽ trái)', tom(L._ct().chinh) === 'thap di trai', tom(L._ct().chinh));
  c = dat('d t L');
  ok('thả lại đúng chỗ cũ (ngay trước hay ngay sau chính nó) thì không đổi gì', L._diChuyen(c[1].id, 'chinh', 1) === false && L._diChuyen(c[1].id, 'chinh', 2) === false && tom(L._ct().chinh) === 'di thap trai');
  c = dat('d 3(d t) L');
  L._diChuyen(c[2].id, c[1].id + '.than', 2);
  ok('kéo ô vào trong vòng lặp', tom(L._ct().chinh) === 'di lap(di thap trai)', tom(L._ct().chinh));
  c = dat('d 3(d t) L');
  L._diChuyen(c[1].than[1].id, 'chinh', 0);
  ok('kéo ô từ trong vòng lặp ra ngoài', tom(L._ct().chinh) === 'thap di lap(di) trai', tom(L._ct().chinh));
  c = dat('d 3(d t) L');
  L._diChuyen(c[1].id, 'chinh', 0);
  ok('kéo cả ô Lặp: các ô bên trong đi theo', tom(L._ct().chinh) === 'lap(di thap) di trai', tom(L._ct().chinh));
  c = dat('w(?d(d)(R))');
  ok('không thả được ô chứa vào thân của chính nó, hay của ô con nó', L._diChuyen(c[0].id, c[0].than[0].id + '.thi', 0) === false && L._diChuyen(c[0].id, c[0].id + '.than', 0) === false
     && L._trongCay(c[0].id, c[0].than[0].id) && !L._trongCay(c[0].than[0].id, c[0].id) && tom(L._ct().chinh) === 'den(neu(di|phai))');
  c = dat('w(?d(d)(R))');
  L._diChuyen(c[0].than[0].khac[0].id, c[0].than[0].id + '.thi', 1);
  ok('kéo ô từ phần "không thì" sang phần "thì"', tom(L._ct().chinh) === 'den(neu(di phai|))', tom(L._ct().chinh));
  c = dat('F F t', 'd d');
  L._diChuyen(c[2].id, 'ham', 2);
  ok('kéo ô từ Chương trình sang Hàm ★', tom(L._ct().chinh) === 'ham ham' && tom(L._ct().ham) === 'di di thap');
  L._hoanTac();
  ok('kéo nhầm thì ↶ Hoàn tác được', tom(L._ct().chinh) === 'ham ham thap' && tom(L._ct().ham) === 'di di');
  /* chỗ chèn tính theo hàng ô (xếp ngang, tràn thì xuống dòng) */
  const o = (x, y, w = 50, h = 50) => ({ matches: (s) => s.includes('[data-nut]'), getBoundingClientRect: () => ({ left: x, top: y, right: x + w, bottom: y + h, width: w, height: h }) });
  const hang = { children: [o(0, 0), o(60, 0), o(120, 0), o(0, 60)] };
  const vt = (x, y) => L._viTriTha(hang, x, y);
  ok('chỗ chèn: trái giữa ô đầu → 0; giữa ô 1 và 2 → 2; cuối hàng trên → 3 (trước ô hàng dưới); dưới cùng → 4',
     vt(10, 25) === 0 && vt(100, 25) === 2 && vt(170, 25) === 3 && vt(40, 85) === 4 && vt(10, 85) === 3, [vt(10, 25), vt(100, 25), vt(170, 25), vt(40, 85), vt(10, 85)].join(','));
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('kéo về bảng ô bên dưới là bỏ ô; thả ra ngoài thì thôi', /if \(keo\.id != null && el\.closest\('\.lt-bang'\)\) return \{ xoa: true \}/.test(src) && /if \(!d\) return;/.test(src) && /if \(d\.xoa\) \{ boO\(k\.id\); return; \}/.test(src));
  ok('chạm rồi nhả (không rê quá 8px) vẫn là bấm như cũ', /const NGUONG_KEO = 8/.test(src) && /if \(!k\.dang\) return;\s+\/\/ chỉ là chạm/.test(src));
  ok('chỉ bỏ đúng cú "bấm" sinh ra lúc nhả tay sau khi kéo, chạm mới là bấm thật', /boQuaBam = 0;\s+\/\/ một lần chạm mới/.test(src) && /Date\.now\(\) - boQuaBam < 300/.test(src));
  ok('ô bóng nổi phía trên điểm thả (không che vạch xanh), điểm thả cao hơn đầu ngón tay', /keo\.p\.y - keo\.h - 12/.test(src) && /keo\.cham \? 26 : 0/.test(src));
  ok('kéo tới mép trên/dưới khung chương trình thì khung tự cuộn', /function tuCuon\(\)/.test(src) && /ma\.scrollTop \+= v/.test(src));
  ok('chạm vào ô để kéo không làm cuộn trang (touch-action: none cho ô ở bảng và trong chương trình)', /\.lt-bang \.lt-chip,\.lt-ma \.lt-chip\{touch-action:none\}/.test(css));
  ok('có vạch xanh chỉ chỗ thả, và bảng ô thành vùng "thả để bỏ" khi kéo ô đã xếp', /\.lt-vach\{/.test(css) && /\.lt-bang\.lt-xoa-vung::after\{content:"🗑  Thả vào đây để bỏ ô"/.test(css));
  ok('bảng giới thiệu chương dặn cách kéo thả', /Kéo ô ở bảng dưới thả vào đúng chỗ muốn chèn\. Kéo ô đã xếp để đổi chỗ, kéo về bảng dưới để bỏ\./.test(src));
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

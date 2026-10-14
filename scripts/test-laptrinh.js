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
  ok('có hàm: chương trình chính đúng rồi thì gợi ý tiếp vào Hàm ★', (r => r.loai === 'them' && r.ds === 'ham' && r.k === 'di')(gy(59, 'F L F L F')));
  ok('chương điều kiện: gợi ý ô nằm trong phần "không thì"', (r => r.loai === 'them' && r.k === 'neu-trai')(gy(83, 'w(?d(d)())')));
}

console.log('\n— Âm thanh, mở hết để thử —');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8');
  ok('thắp sao có tiếng chuông, sao sau cao hơn sao trước', /ve\.sang\.add\(b\.sang\);[^\n]*tingSao\(ve\.sang\.size - 1\)/.test(src) && /const BAC = \[523\.25, 659\.25, 783\.99/.test(src));
  ok('thắng có nhạc mừng, vướng có tiếng bộp nhỏ', /setTimeout\(nhacThang, 250\)/.test(src) && /if \(!b\.ok\) \{[^}]*tiengVuong\(\)/.test(src));
  ok('tắt được âm thanh; mở âm thanh ngay lúc bấm Chạy (iPhone đòi), đóng trò thì ngắt', /coTieng = !coTieng/.test(src) && /function batDauChay\(tungBuoc\) \{\s*amThanh\(\);/.test(src) && /am\.suspend\(\)/.test(src));
  L._moHet(false);
  const thuong = L._moToi();
  L._moHet(true);
  ok('chế độ thử mở tới bài 100; bình thường chỉ tới bài chưa xong đầu tiên', thuong === 0 && L._moToi() === 99, `${thuong} → ${L._moToi()}`);
  L._moHet(false);
  ok('mở hết bằng ?mohet trên link, hoặc chạm 7 lần vào tên trò — không ghi gì xuống máy', /\[\?&\]mohet/.test(src) && /bamBi\.n >= 7/.test(src));
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
ok('chỉ nhớ một chuỗi nhỏ: bài nào đã xong', (fs.readFileSync(path.join(__dirname, '..', 'assets', 'laptrinh.js'), 'utf8').match(/localStorage\.setItem/g) || []).length === 1);

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

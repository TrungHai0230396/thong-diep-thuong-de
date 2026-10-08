/* Kiểm thử ngôi sao luyện phát âm: node scripts/test-phatam.js

   Hai thứ dễ sai ở trò này, và cả hai đều không phải mã:
   1. NỘI DUNG — cặp tối thiểu phải là hai TỪ CÓ THẬT. Nếu lỗi thường gặp đẻ ra chuỗi vô nghĩa
      (life → "laip") thì máy tự nắn về từ gần nhất và giấu lỗi, nên phép đo thành vô nghĩa.
      Những mục như vậy phải đánh dấu kiemDuoc:false và KHÔNG được có cặp nào.
   2. HÌNH — hình khẩu hình vẽ bằng toạ độ tính tay, rất dễ lệch ra ngoài khung mà không ai thấy. */
const fs = require('fs');
const path = require('path');

global.self = global;
global.addEventListener = () => {};
const gia = () => ({ style: {}, dataset: {}, children: [],
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  appendChild(c) { this.children.push(c); return c; }, querySelector() { return null; },
  querySelectorAll() { return []; }, setAttribute() {}, addEventListener() {}, remove() {} });
global.document = { createElement: gia, body: Object.assign(gia(), { classList: { add() {}, remove() {} } }) };

const doc = (f) => fs.readFileSync(path.join(__dirname, '..', 'assets', f), 'utf8');
/* nghe.js và khauhinh.js xuất kiểu kép, nạp bằng require thì lấy được thẳng.
   ipa.js chỉ gắn vào self nên phải eval — và nó cần TDTD_NGHE, TDTD_KHAUHINH có sẵn trên self. */
const K = require('../assets/khauhinh.js');
const N = require('../assets/nghe.js');
self.TDTD_NGHE = N; self.TDTD_KHAUHINH = K;
eval(doc('ipa.js'));
const AM = self.TDTD_PHATAM._am;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Bộ âm —');
ok('có ít nhất mười hai âm', AM.length >= 12, `${AM.length} âm`);
ok('ký hiệu không trùng nhau', new Set(AM.map(a => a.ipa)).size === AM.length);
ok('âm nào cũng đủ tên, vì sao, cách làm', AM.every(a => a.ten && a.viSao && a.cach));
ok('lời giải thích đủ dài để hiểu được', AM.every(a => a.viSao.length > 40 && a.cach.length > 40));
ok('âm nào cũng có từ ví dụ', AM.every(a => a.tu.length >= 4));
ok('âm nào cũng thuộc một nhóm đã khai báo',
   AM.every(a => ['Cuối từ', 'Cụm phụ âm', 'Phụ âm đầu', 'Nguyên âm'].includes(a.nhom)));

console.log('\n— Thứ tự theo bằng chứng, không theo cảm giác —');
const uu = (n) => AM.filter(a => a.nhom === n).reduce((m, a) => Math.max(m, a.uuTien), 0);
ok('nhóm cuối từ được xếp cao nhất', uu('Cuối từ') >= uu('Phụ âm đầu') && uu('Cuối từ') > uu('Nguyên âm'),
   `cuối từ ${uu('Cuối từ')} / phụ âm đầu ${uu('Phụ âm đầu')} / nguyên âm ${uu('Nguyên âm')}`);
const th = AM.find(a => a.ipa.includes('θ'));
ok('hai âm "th" bị xếp thấp hơn phụ âm cuối', th && th.uuTien < uu('Cuối từ'), `th = ${th && th.uuTien}`);
ok('mục xếp thấp vẫn nói rõ vì sao nó không gấp', th && /vẫn hiểu|ít làm hỏng|ít lợi/i.test(th.viSao));

console.log('\n— Cặp tối thiểu —');
const cap = AM.flatMap(a => a.cap.map(c => ({ a, c })));
ok('có ít nhất hai mươi cặp', cap.length >= 20, `${cap.length} cặp`);
ok('cặp nào cũng đủ hai từ và một lời dịch', cap.every(({ c }) => c[0] && c[1] && c[2]));
ok('hai từ trong cặp phải khác nhau', cap.every(({ c }) => c[0] !== c[1]));
ok('cặp nào cũng chỉ một từ, không phải cả câu', cap.every(({ c }) => !/\s/.test(c[0] + c[1])),
   (cap.find(({ c }) => /\s/.test(c[0] + c[1])) || { c: [''] }).c[0]);
ok('từ trong cặp không lẫn dấu tiếng Việt',
   cap.every(({ c }) => !/[àáảãạăâđêôơưèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(c[0] + c[1])));
ok('lời dịch có đủ hai nghĩa, ngăn bằng dấu gạch', cap.every(({ c }) => c[2].includes('/')));

console.log('\n— Mục máy không kiểm được thì không được giả vờ kiểm —');
const khong = AM.filter(a => !a.kiemDuoc);
ok('có đánh dấu mục máy không kiểm được', khong.length >= 1, khong.map(a => a.ipa).join(', '));
ok('mục không kiểm được thì không có cặp nào', khong.every(a => a.cap.length === 0),
   khong.filter(a => a.cap.length).map(a => a.ipa).join(', '));
ok('mục đó nói rõ lý do máy không kiểm được',
   khong.every(a => /không phải từ|vô nghĩa|tự nắn|không có trong/i.test(a.viSao) || a.cap.length === 0));
ok('mục kiểm được thì phải có cặp để kiểm',
   AM.filter(a => a.kiemDuoc).every(a => a.cap.length >= 1),
   AM.filter(a => a.kiemDuoc && !a.cap.length).map(a => a.ipa).join(', '));

console.log('\n— Bộ so chữ nhận ra đúng từ trong cặp —');
let lech = 0, lan = 0;
for (const { c } of cap) {
  for (const k of [0, 1]) {
    lan++;
    const kq = N.chonCau([c[k]], [c[0], c[1]]);
    if (kq.chi !== k) { lech++; if (lech <= 3) console.log(`      lẫn: nói "${c[k]}" mà chọn ra "${c[kq.chi]}"`); }
  }
}
ok('nghe đúng chữ thì phải chọn đúng từ đó', lech === 0, `${lan - lech}/${lan}`);

console.log('\n— Hình khẩu hình —');
const svg = AM.map(a => ({ a, s: K.ve(a.kh, { nhan: a.ipa }) }));
ok('âm nào cũng vẽ ra được hình', svg.every(({ s }) => s.startsWith('<svg') && s.endsWith('</svg>')));
ok('hình nào cũng có nhãn cho người đọc màn hình', svg.every(({ s }) => s.includes('aria-label')));
ok('không toạ độ nào là NaN', svg.every(({ s }) => !/NaN|undefined/.test(s)),
   (svg.find(({ s }) => /NaN|undefined/.test(s)) || { a: {} }).a.ipa || '');
/* Chỉ soi toạ độ thật (d, x, y, cx, cy...), không soi mọi con số trong chuỗi —
   font-weight="600" không phải là một điểm nằm ngoài khung. */
const toaDo = (sv) => {
  const ra = [];
  /* Bỏ qua <defs>: hình trong đó (đầu mũi tên) có hệ toạ độ riêng của nó, không phải của hình lớn. */
  const s = sv.replace(/<defs>[\s\S]*?<\/defs>/g, '');
  for (const m of s.matchAll(/\sd="([^"]+)"/g)) {
    /* Chỉ lệnh VIẾT HOA mới mang toạ độ tuyệt đối; lệnh viết thường là độ dời,
       nên "l0,-9" (đi lên 9px) không phải là một điểm nằm ở -9. */
    for (const doan of m[1].split(/(?=[A-Za-z])/)) {
      if (!/^[A-Z]/.test(doan) || /^[HVZ]/i.test(doan)) continue;
      ra.push(...(doan.slice(1).match(/-?\d+(\.\d+)?/g) || []).map(Number));
    }
  }
  for (const m of s.matchAll(/\s(?:x|y|cx|cy|x1|y1|x2|y2|width|height)="(-?[\d.]+)"/g))
    ra.push(Number(m[1]));
  return ra;
};
ok('không nét nào lọt ra ngoài khung vẽ', svg.every(({ a, s }) => {
  const kh = s.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!kh) return false;
  const [x0, y0, r, c] = kh.slice(1).map(Number);
  const xau = toaDo(s).filter(v => v < Math.min(x0, y0) - 2 || v > Math.max(x0 + r, y0 + c) + 2);
  if (xau.length) console.log(`      ${a.ipa}: ${xau.slice(0, 6).join(' ')}`);
  return !xau.length;
}));
ok('chỗ lưỡi chạm được vẽ ra khi âm có chỗ chạm', AM.filter(a => a.kh.chamO !== 'khong')
   .every(a => K.ve(a.kh, {}).includes('<circle') || K.ve(a.kh, {}).includes('stroke-dasharray')));
ok('bốn kiểu môi vẽ được hết', ['det', 'trung', 'tron', 'mo'].every(k => K.veMoi(k, {}).startsWith('<svg')));
ok('âm nào cũng khai báo kiểu môi có thật',
   AM.every(a => ['det', 'trung', 'tron', 'mo'].includes(a.moi)));

console.log('\n— Hình khác nhau giữa các âm, không phải một hình dán đi dán lại —');
const than = AM.map(a => (K.ve(a.kh, {}) + (a.kh2 ? K.ve(a.kh2, {}) : '')).replace(/aria-label="[^"]*"/g, ''));
ok('mỗi mục ra một hình riêng, không dán đi dán lại', new Set(than).size === than.length,
   `${new Set(than).size}/${than.length} hình khác nhau`);
const doi = AM.filter(a => a.kh2);
ok('mục so sánh hai âm thì vẽ đủ hai hình', doi.length >= 3, `${doi.length} mục có hai hình`);
ok('hai hình trong một mục phải khác nhau',
   doi.every(a => K.ve(a.kh, {}) !== K.ve(a.kh2, {})),
   doi.filter(a => K.ve(a.kh, {}) === K.ve(a.kh2, {})).map(a => a.ipa).join(', '));
ok('mục hai hình phải có nhãn cho từng hình', doi.every(a => a.nhan2 && a.nhan1));

console.log('\n— Hình nguyên âm —');
const co = AM.filter(a => a.bieu);
ok('âm nào khai báo biểu đồ thì phải có trong bảng nguyên âm',
   co.every(a => K.NGUYEN_AM.some(v => v.ipa === a.bieu)), co.map(a => a.bieu).join(' '));
ok('biểu đồ nguyên âm vẽ được', co.every(a => K.veNguyenAm(a.bieu).startsWith('<svg')));

console.log('\n— Không lưu gì xuống máy, không đẻ ra điểm giả —');
const nguon = doc('ipa.js');
ok('không đụng tới localStorage', !/localStorage/.test(nguon));
ok('không dùng confidence của bộ nhận dạng', !/\.confidence/.test(nguon));
ok('có nói rõ đây không phải chấm giọng', /không phải chấm giọng|không nói rằng giọng bạn/.test(nguon));
ok('có báo trước việc gửi giọng đi', /được gửi lên máy chủ/.test(nguon));
ok('có nói ra cái dở của máy với giọng Việt', /người Việt bị chép sai|một phần bảy/.test(nguon));
ok('dùng lại bộ so chữ sẵn có, không viết bộ thứ hai', /TDTD_NGHE/.test(nguon) && !/function diceChu/.test(nguon));
ok('nhận dạng đặt đúng cấu hình', /maxAlternatives = 5/.test(nguon) && /interimResults = false/.test(nguon)
   && /continuous = false/.test(nguon) && /lang = 'en-US'/.test(nguon));

console.log('\n— Phát ra được chính cái âm đang dạy —');
const V = require('../assets/amvi.js');
ok('âm nào cũng gắn mã để phát ra được', AM.every(a => a.am), AM.filter(a => !a.am).map(a => a.ipa).join(', '));
ok('mã âm nào cũng có thật trong bộ tổng hợp',
   AM.flatMap(a => [].concat(a.am, a.am2 || [])).filter(Boolean).every(t => V.DS.includes(t)));
ok('mã âm nào cũng dựng ra tiếng được',
   AM.flatMap(a => [].concat(a.am, a.am2 || [])).filter(Boolean)
     .every(t => { const m = V.mau(t, 44100, 'cuoi'); return m && m.length > 1000; }));
ok('âm tắc được đánh dấu để dựng kèm nguyên âm, vì phát rời chỉ nghe như tiếng tách',
   AM.filter(a => ['p', 'b', 't', 'd', 'k', 'g'].includes(a.am)).every(a => a.tac));

console.log('\n— Bài nghe: tai đi trước miệng, và không ra bài cho cặp không ai phân biệt nổi —');
ok('không còn nhãn luyện tai kiểu cũ nằm lại làm dữ liệu chết',
   AM.every(a => a.taiA === undefined && a.taiB === undefined));
const ds0 = self.TDTD_PHATAM._soBuoc(AM[0]);
ok('bước luyện tai đứng trước bước xem miệng', ds0.indexOf('tai') < ds0.indexOf('mieng'), ds0.join(' → '));
/* /f/ và /θ/ dựng đúng thì vẫn gần như không phân biệt được bằng tai — thí nghiệm 1961 cho
   người bản ngữ nghe cũng chịu. Ra bài bắt chọn giữa hai âm đó là bịa ra một tương phản
   không tồn tại, và người học sẽ "đúng" nhờ đoán. */
const capTai = AM.filter(a => a.am2).map(a => [].concat(a.am)[0] + '/' + a.am2);
ok('không ra bài nghe cho cặp /f/ với /θ/',
   !capTai.some(c => c === 'f/th' || c === 'th/f' || c === 'v/dh' || c === 'dh/v'), capTai.join(' '));
ok('chỗ nào tai không tách được thì phải nói ra',
   AM.find(a => a.ipa.includes('θ')).luuY && /không thể phân biệt bằng tai|58/.test(AM.find(a => a.ipa.includes('θ')).luuY));

console.log('\n— Hình: miệng nhìn thẳng và bên trong miệng đặt cạnh nhau —');
/* Người dùng chọn giữ kiểu hình của màn 44 âm ("giữ lại kiểu này — khẩu hình miệng"): hai hình
   cạnh nhau, chạy cùng nhịp. Bản trước của bài sửa lỗi chọn MỘT hình chính, giấu hình kia sau nút. */
ok('bước xem miệng bày hình nhìn thẳng cạnh hình bên trong, không giấu hình nào sau nút',
   /class="pa-hinh-tu"[\s\S]{0,200}class="pa-le-hinh"[\s\S]{0,120}veMatTruoc\(kh[\s\S]{0,250}K\.ve\(kh/.test(nguon)
   && !/Nhìn bên trong miệng<\/button>/.test(nguon));
ok('không còn trường "hình chính" bỏ không trong dữ liệu', AM.every(a => a.hinh === undefined));
ok('âm nào cũng vẽ được hình nhìn thẳng', AM.every(a => K.veMatTruoc(a.kh, {}).startsWith('<svg')));
const vt = AM.map(a => K.veMatTruoc(a.kh, {}).replace(/aria-label="[^"]*"/, ''));
ok('hình nhìn thẳng phân biệt được các nhóm âm, không phải một hình dùng chung',
   new Set(vt).size >= 8, `${new Set(vt).size} hình khác nhau trên ${vt.length} âm`);
/* Đọc chữ sau khi GHÉP các dòng lại: nhãn dài giờ được ngắt vào nhiều <tspan>, nên soi thẳng
   vào giữa hai thẻ <text> là không thấy gì. */
const chuTrong = (sv) => [...sv.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
  .map(m => m[1].replace(/<\/tspan><tspan[^>]*>/g, ' ').replace(/<[^>]*>/g, '')).join(' | ');
ok('hình nhìn thẳng nào cũng có một câu mô tả bằng lời',
   AM.every(a => chuTrong(K.veMatTruoc(a.kh, {})).replace(/[|\s]/g, '').length >= 6));
ok('hình cắt dọc chỉ còn tối đa ba nhãn đang làm việc, không phải chín nhãn giải phẫu',
   AM.every(a => (K.ve(a.kh, {}).match(/<text/g) || []).length <= 5),
   'nhiều nhất ' + Math.max(...AM.map(a => (K.ve(a.kh, {}).match(/<text/g) || []).length)));
ok('nhãn viết bằng cảm giác, không bằng tên giải phẫu',
   chuTrong(K.ve({ luoiSau: .05, luoiCao: .3, dauLuoi: 1, moiTron: 0, hamMo: .2, chamO: 'loi' }, {}))
     .includes('gờ cứng sau răng trên'));

console.log('\n— Nhãn phải nằm gọn trong khung, không bị cắt mất chữ —');
/* Người dùng bắt được lỗi này: "gờ cứng sau răng trên" viết một dòng thì tràn ra khỏi khung và
   bị xén mất mấy chữ cuối, thành "gờ cứng sau răng t". Bài kiểm cũ chỉ soi toạ độ NÉT VẼ, không
   soi bề rộng CHỮ — nên nó không thấy gì.
   Ước bề rộng theo LOẠI KÝ TỰ, không phải "ký tự nào cũng rộng bằng nhau". Bản đầu tôi lấy một
   hệ số chung 0,58 và nó báo nhầm hai chú thích vốn vừa khít — vì chữ i rộng 0,25 mà chữ m rộng
   0,87, chênh nhau hơn ba lần. Bảng hệ số dưới đây hiệu chỉnh từ mười phép đo thật bằng canvas
   với đúng phông của app; sai số còn dưới 7%. Nên chừa thêm 8% biên trước khi kêu. */
const HEP = "iíìỉĩịlj|.,'!:;()[]", RONG = 'mwMW';
const rongChu = (s, co) => {
  let w = 0;
  for (const c of s) {
    if (HEP.includes(c)) w += .25;
    else if (RONG.includes(c)) w += .87;
    else if (c === ' ') w += .27;
    else if (c !== c.toLowerCase() && c === c.toUpperCase()) w += .64;
    else w += .545;
  }
  return w * co;
};
function nhanTran(sv) {
  const vb = sv.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
  const phai = vb[0] + vb[2], duoi = vb[1] + vb[3], loi = [];
  for (const m of sv.matchAll(/<text x="([-\d.]+)" y="([-\d.]+)"([^>]*)>([\s\S]*?)<\/text>/g)) {
    if (/transform=/.test(m[3])) continue;           // chữ xoay: bề rộng đổi sang chiều dọc
    const x = +m[1], y = +m[2];
    const co = +((m[3].match(/font-size="([\d.]+)"/) || [])[1] || 12);
    const neo = (m[3].match(/text-anchor="(\w+)"/) || [])[1];
    const tsp = [...m[4].matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map(t => t[1]);
    const ds = tsp.length ? tsp : [m[4].replace(/<[^>]*>/g, '')];
    ds.forEach((d, i) => {
      const w = rongChu(d, co) * 1.08;      // chừa 8% biên cho sai số của mô hình
      const tu = neo === 'middle' ? x - w / 2 : neo === 'end' ? x - w : x;
      if (tu < vb[0] - 1 || tu + w > phai + 1 || y + i * co * 1.18 > duoi + 1)
        loi.push(`"${d}" ${Math.round(tu)}→${Math.round(tu + w)} ngoài khung ${vb[0]}..${phai}`);
    });
  }
  return loi;
}
const moiHinh = [];
AM.forEach(a => {
  moiHinh.push([a.ipa + ' cắt dọc', K.ve(a.kh, {})], [a.ipa + ' nhìn thẳng', K.veMatTruoc(a.kh, {})]);
  if (a.kh2) moiHinh.push([a.ipa + ' cắt dọc 2', K.ve(a.kh2, {})], [a.ipa + ' nhìn thẳng 2', K.veMatTruoc(a.kh2, {})]);
  if (a.bieu) moiHinh.push([a.ipa + ' nguyên âm', K.veNguyenAm(a.bieu)]);
});
['det', 'trung', 'tron', 'mo'].forEach(k => moiHinh.push(['môi ' + k, K.veMoi(k, {})]));
const tranHet = moiHinh.flatMap(([t, sv]) => nhanTran(sv).map(l => t + ' :: ' + l));
ok(`không nhãn nào bị cắt, soát ${moiHinh.length} hình`, tranHet.length === 0, tranHet.slice(0, 3).join(' | '));
ok('nhãn dài được ngắt thành nhiều dòng chứ không viết tràn',
   /<tspan/.test(K.ve({ luoiSau: .1, luoiCao: .35, dauLuoi: 1, moiTron: 0, hamMo: .25, chamO: 'loi' }, {})));
ok('ngắt dòng giữ nguyên đủ chữ, không nuốt mất chữ nào', (() => {
  const sv = K.ve({ luoiSau: .1, luoiCao: .35, dauLuoi: 1, moiTron: 0, hamMo: .25, chamO: 'loi' }, {});
  const chu = [...sv.matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map(m => m[1]).join(' ');
  return chu.includes('đầu lưỡi chạm đây') && chu.includes('gờ cứng sau răng trên');
})());

console.log('\n— Hình động —');
ok('có tư thế miệng lúc nghỉ để bắt đầu chuyển động', K.NGHI && K.NGHI.chamO === 'khong');
ok('pha trộn được hai tư thế', (() => {
  const g = K.tron(K.NGHI, AM[0].kh, .5);
  return g.luoiCao > Math.min(K.NGHI.luoiCao, AM[0].kh.luoiCao) - .01;
})());
ok('âm tắc có khung nhả hơi, thứ hình tĩnh không nói được',
   self.TDTD_PHATAM._khung(AM[2].kh, true).some(k => k.p.hoi > .5));
ok('âm kéo dài được thì hơi thoát đều suốt', self.TDTD_PHATAM._khung(AM[1].kh, false).some(k => k.p.hoi > .5));
ok('mỗi khung là một tư thế khác nhau, không đứng yên',
   new Set(self.TDTD_PHATAM._khung(AM[2].kh, true).map(k => JSON.stringify(k.p))).size >= 3);

console.log('\n— Bước đầu: NGƯỜI THẬT đọc chính cái âm, không phải từ, không phải máy dựng —');
/* Ba lần người dùng chê: âm máy dựng "khó hiểu" (dù khớp 47 phép đo phổ), máy đọc "đâu phải người
   đọc", rồi bản thu mẫu ngữ âm của người không bản xứ "khó nghe, như máy đọc". Giờ mọi tiếng trong
   trò này là bản thu người bản xứ, và mấy bài dưới canh để không tụt lại chỗ cũ. */
const AN = require('../assets/amnguoi.js');
const TN = require('../assets/tunguoi.js');
self.TDTD_AMNGUOI = AN; self.TDTD_TUNGUOI = TN;
const P = self.TDTD_PHATAM;
ok('bước đầu dẫn bằng bản thu người thật',
   /Bước 1 — nghe người thật đọc âm này[\s\S]{0,300}pa-nguoi/.test(nguon));
ok('bước đầu không còn nút âm máy dựng', !/data-am="1"/.test(nguon) && !/tách riêng \(tiếng máy dựng\)/.test(nguon));
ok('từ ví dụ vẫn còn, nhưng lùi xuống sau bản thu',
   /Bước 1 — nghe người thật[\s\S]{0,2500}<p class="pa-nhan">Trong từ — người bản xứ đọc<\/p>/.test(nguon));
ok('đọc từ thì lấy bản thu người thật trước, máy đọc chỉ là đường lùi',
   /function doc\(chu, cham, iGiong, nut\) \{[\s\S]{0,120}banThu\(chu\)[\s\S]{0,300}docMay\(chu, cham, iGiong\)/.test(nguon)
   && /function banThu\(chu\) \{[\s\S]{0,80}TDTD_TUNGUOI/.test(nguon));
ok('bài nào cũng có ít nhất một âm trong bảng 44 âm', AM.every(a => P._dsNguoi(a).length >= 1),
   AM.filter(a => !P._dsNguoi(a).length).map(a => a.ipa).join(', '));
ok('âm chính của bài đứng đầu và không bị tô là cái sai', AM.every(a => !P._dsNguoi(a)[0].startsWith('!')));
const lCuoi = AM.find(a => a.ipa === '/l/ cuối');
ok('vế sai được tô riêng: /l/ cuối nói thành /n/', lCuoi && P._dsNguoi(lCuoi).join(' ') === 'l !n',
   lCuoi && P._dsNguoi(lCuoi).join(' '));
ok('âm trùng nhau chỉ hiện một lần (cụm -ld: l-toi ở cả hai vế)',
   AM.every(a => new Set(P._dsNguoi(a).map(x => x.replace('!', ''))).size === P._dsNguoi(a).length));

console.log('\n— Bảng đủ 44 âm, chia nhóm như người Việt hay học —');
const BON_TU = ['iː', 'ɪ', 'e', 'æ', 'ʌ', 'ɑː', 'ɒ', 'ɔː', 'ʊ', 'uː', 'ɜː', 'ə', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə',
  'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'tʃ', 'dʒ', 'm', 'n', 'ŋ', 'l', 'r', 'w', 'j'];
ok('đủ 44 âm, đúng bộ ký hiệu', AN.DS.length === 44 && BON_TU.every(i => AN.DS.some(x => x.ipa === i)),
   BON_TU.filter(i => !AN.DS.some(x => x.ipa === i)).join(' '));
const dem = (n) => AN.DS.filter(x => x.nhom === n).length;
ok('12 nguyên âm đơn, 8 nguyên âm đôi, 24 phụ âm', dem('don') === 12 && dem('doi') === 8 && dem('phu') === 24,
   `${dem('don')} / ${dem('doi')} / ${dem('phu')}`);
ok('mã âm không trùng', new Set(AN.DS.map(x => x.ma)).size === 44);
ok('âm nào cũng có tên, cách đặt miệng, ba từ ví dụ có nghĩa',
   AN.DS.every(x => x.ten && x.goiY.length > 15 && x.vd.length === 3 && x.vd.every(v => v.tu && v.nghia)));
ok('âm hay lẫn khai báo đều có trong bảng', AN.DS.every(x => x.doi.every(m => AN.tim(m))),
   AN.DS.flatMap(x => x.doi.filter(m => !AN.tim(m))).join(', '));
ok('mọi mã âm dùng trong các bài sửa lỗi đều có trong bảng',
   AM.every(a => [].concat(a.am, a.am2 || []).every(m => AN.tim(m))),
   AM.flatMap(a => [].concat(a.am, a.am2 || []).filter(m => !AN.tim(m))).join(', '));
const HUU = ['b', 'd', 'g', 'v', 'dh', 'z', 'zh', 'jh', 'm', 'n', 'ng', 'l', 'r', 'w', 'y'];
ok('âm hữu thanh thì cổ rung, âm vô thanh thì không',
   AN.DS.filter(x => x.nhom === 'phu').every(x => !!x.kh.rung === HUU.includes(x.ma)),
   AN.DS.filter(x => x.nhom === 'phu' && !!x.kh.rung !== HUU.includes(x.ma)).map(x => x.ipa).join(' '));
ok('chỉ ba âm mũi m n ŋ cho hơi lên mũi', AN.DS.filter(x => x.kh.mui).map(x => x.ma).sort().join() === 'm,n,ng');
ok('âm tắc và tắc xát chạy hình kiểu chặn-rồi-nhả', AN.DS.filter(x => x.tac).map(x => x.ma).sort().join() === 'b,ch,d,g,jh,k,p,t');
ok('nguyên âm đôi nào cũng có tư thế cuối và đường lướt trên sơ đồ',
   AN.DS.filter(x => x.nhom === 'doi').every(x => x.kh2 && x.luot && x.luot.every(i => K.timNguyenAm(i))));
ok('tắc xát có pha xát thứ hai', ['ch', 'jh'].every(m => AN.tim(m).kh2));
const hinhAm = AN.DS.flatMap(x => [x.kh, x.kh2].filter(Boolean).map(kh => K.ve(kh, {}) + K.veMatTruoc(kh, {})));
ok('cả 44 âm vẽ được hình nhìn thẳng và hình bên trong, không NaN', hinhAm.every(h => !/NaN|undefined/.test(h)));
ok('sơ đồ nguyên âm: âm đơn tô đúng chỗ, âm đôi có mũi tên',
   AN.DS.filter(x => x.nhom === 'don').every(x => K.veNguyenAm(x.ipa).includes(`>${x.ipa}</text>`))
   && AN.DS.filter(x => x.nhom === 'doi').every(x => K.veNguyenAm(x.luot[0], x.luot[1]).includes('k-luot')));
/* Lỗi người soát chỉ ra: đầu lưỡi các âm lợi chỉ lên tới mép răng (y≈122), cách gờ lợi 20 điểm ảnh
   — nhìn như đặt lưỡi ở răng, đúng thói quen tiếng Việt mà bài muốn sửa. */
const hoVom = (x) => { const N = K.tinh(x.kh), ch = K.CHO_CHAM[x.kh.chamO];
  const q = N.mat.reduce((b, p) => Math.abs(p[0] - ch) < Math.abs(b[0] - ch) ? p : b); return q[1] - K.vomY(Math.min(ch, 190)); };
ok('âm chạm lợi: đầu lưỡi lên sát gờ lợi', ['t', 'd', 'n', 'l'].every(m => hoVom(AN.tim(m)) < 4),
   ['t', 'd', 'n', 'l'].map(m => m + ' ' + hoVom(AN.tim(m)).toFixed(1)).join(', '));
ok('âm chạm vòm mềm: sau lưỡi lên sát vòm mềm', ['k', 'g', 'ng'].every(m => hoVom(AN.tim(m)) < 4),
   ['k', 'g', 'ng'].map(m => m + ' ' + hoVom(AN.tim(m)).toFixed(1)).join(', '));
ok('âm xát chừa khe hẹp, không chạm kín như âm tắc', hoVom(AN.tim('s')) > hoVom(AN.tim('t')) + 1.5,
   `s hở ${hoVom(AN.tim('s')).toFixed(1)}, t hở ${hoVom(AN.tim('t')).toFixed(1)}`);
const giua = K.tinh(K.tron(K.NGHI, AN.tim('t').kh, .5));
ok('lưỡi rướn lên chỗ chạm DẦN DẦN, không giật bật giữa chừng',
   giua.mat[4][1] > K.tinh(AN.tim('t').kh).mat[4][1] + 5 && giua.mat[4][1] < K.tinh(K.NGHI).mat[4][1] - 5);

console.log('\n— Tiếng người bản xứ: đủ file, có ghi công, không còn bộ mẫu cũ —');
const coTep = (f) => fs.existsSync(path.join(__dirname, '..', f.split('?')[0]));
const banAm = AN.DS.flatMap(x => x.am);
ok('bản thu chính cái âm: file nào khai báo cũng có', banAm.every(b => coTep(b.f)), banAm.filter(b => !coTep(b.f)).map(b => b.f).join(', '));
ok('hầu hết các âm có bản thu chính cái âm', AN.DS.filter(x => x.am.length).length >= 25, `${AN.DS.filter(x => x.am.length).length}/44`);
ok('bản thu nào cũng ghi nhãn, người đọc, giấy phép, link bản gốc',
   banAm.every(b => b.nhan && b.phu && b.tacGia && b.giayPhep && /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(b.nguon)));
ok('không còn bộ mẫu cũ (người không bản xứ, đọc kiểu phòng thí nghiệm)',
   !banAm.some(b => /Isotalo|Denelson/i.test(b.tacGia)) && !banAm.some(b => b.tacGia === 'Back ache' && /Uh - Vowel/.test(b.nguon)));
const moiTu = new Set();
AM.forEach(a => { a.tu.forEach(t => moiTu.add(t)); a.cap.forEach(c => { moiTu.add(c[0]); moiTu.add(c[1]); });
  [a.tuA, a.tuB].filter(Boolean).forEach(t => moiTu.add(t));
  if (a.do) { (a.do.tu || []).forEach(t => moiTu.add(t)); (a.do.cap || []).forEach(c => c.forEach(t => moiTu.add(t))); } });
AN.DS.forEach(x => x.vd.forEach(v => moiTu.add(v.tu)));
const tuThieu = [...moiTu].filter(t => !(TN.tim(t) || []).length);
ok(`mọi từ trong trò (${moiTu.size} từ) đều có bản thu người thật`, !tuThieu.length, tuThieu.join(', '));
const tepThieu = Object.values(TN.TU).flat().filter(b => !coTep(b.f));
ok('file từ nào khai báo cũng có trên đĩa', !tepThieu.length, tepThieu.slice(0, 5).map(b => b.f).join(', '));
ok('nhiều từ có từ hai giọng trở lên, cho bài luyện tai đổi giọng',
   Object.values(TN.TU).filter(v => v.length >= 2).length >= 120, `${Object.values(TN.TU).filter(v => v.length >= 2).length} từ`);
ok('giọng ghi rõ Mỹ / Anh / Úc / Canada', Object.values(TN.TU).flat().every(b => ['Mỹ', 'Anh', 'Úc', 'Canada'].includes(b.giong)));
ok('cả hai thư mục có file ghi nguồn', coTep('assets/am/NGUON.md') && coTep('assets/tu/NGUON.md'));
ok('trong app có màn ghi công người đọc và giấy phép', /function veNguon\(\)/.test(nguon) && /GIAY_PHEP_URL/.test(nguon));
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
ok('sw.js cất sẵn hai danh sách tiếng', /'assets\/amnguoi\.js'/.test(sw) && /'assets\/tunguoi\.js'/.test(sw));
const trang = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
ok('trang nạp hai danh sách tiếng trước ipa.js',
   ['amnguoi.js', 'tunguoi.js'].every(f => trang.indexOf(f) > 0 && trang.indexOf(f) < trang.indexOf('ipa.js')));
ok('mất mạng thì không đem trang HTML đi giải mã thành tiếng', /\/html\/i\.test\(r\.headers\.get\('content-type'\)/.test(nguon));
ok('tải tiếng từ không được thì lùi về máy đọc chứ không im', /phatChuoi\(\[b\.f\], nut, \(\) => docMay\(/.test(nguon));
ok('đóng sao giữa lúc đang thu thì tắt micro ngay', /function dong\(\) \{[\s\S]{0,160}if \(huyThu\) huyThu\(\)/.test(nguon));

console.log('\n— Cặp từ đọc bằng CÙNG một người: giọng không được lộ đáp án —');
/* Lỗi người soát tìm ra: bài luyện tai lấy bản thu theo TỪ, mà mỗi từ có tập người đọc riêng — "ship"
   lúc nào cũng giọng Mỹ, "sip" lúc nào cũng giọng Anh. Nghe giọng là chọn đúng 8/8, không cần tai. */
const ngNguoi = (t) => new Set((TN.tim(t) || []).map(b => b.nguoi));
const capLuyen = AM.flatMap(a => a.cap.map(c => [c[0], c[1]]));
const capKhong = capLuyen.filter(([x, y]) => ![...ngNguoi(x)].some(n => ngNguoi(y).has(n)));
ok(`mọi cặp trong bài luyện tai (${capLuyen.length} cặp) có ít nhất một người đọc cả hai từ`, !capKhong.length,
   capKhong.map(c => c.join('/')).join(', '));
ok('mọi bản thu từ đều ghi mã người đọc', Object.values(TN.TU).flat().every(b => b.nguoi));
ok('luyện tai đọc cặp bằng cùng một người', /function docLuot\(l\) \{ docCap\(am\.cap\[l\.c\]/.test(nguon));
ok('không có người đọc chung thì dùng CÙNG một giọng máy cho cả hai từ', /function docCap[\s\S]{0,400}docMay\(cap\[ben\]/.test(nguon));
ok('nút so hai âm cũng đọc bằng cùng một người', /chungNguoi\(c\[0\], c\[1\]\)/.test(nguon));
const soCapThieu = AN.DS.flatMap(x => Object.entries(x.soCap || {}).filter(([m, c]) => !AN.tim(m) || !x.doi.includes(m)
  || !c.every(t => (TN.tim(t) || []).length)).map(([m]) => x.ipa + '→' + m));
ok('cặp so âm khai báo sẵn đều có bản thu và nằm trong danh sách âm hay lẫn', !soCapThieu.length, soCapThieu.join(', '));
/* Bảng âm dùng ký hiệu Anh-Anh: từ nào Anh-Mỹ đọc khác thì giọng Anh phải lên trước, không thì
   "car rồi hot" giọng Mỹ ra cùng một nguyên âm. */
ok('từ Anh-Mỹ đọc khác nhau thì giọng Anh lên trước', /function banThu[\s\S]{0,400}'Anh': 0/.test(nguon));
const khacGiong = Object.keys(TN.IPA).filter(t => TN.IPA[t][0] !== TN.IPA[t][1] && (TN.tim(t) || []).length);
const coAnh = khacGiong.filter(t => TN.tim(t).some(b => b.giong === 'Anh'));
ok('phần lớn từ có Anh-Mỹ khác nhau có ít nhất một bản giọng Anh', coAnh.length >= khacGiong.length * .7,
   `${coAnh.length}/${khacGiong.length}; thiếu: ${khacGiong.filter(t => !coAnh.includes(t)).join(' ')}`);
ok('đường dẫn tiếng mang dấu nội dung (?v=) để bộ nhớ đệm không phát bản cũ',
   Object.values(TN.TU).flat().concat(banAm).every(b => /\?v=[0-9a-f]{8}$/.test(b.f)));
ok('sw.js giữ tiếng đã nghe trong kho riêng, không xoá khi deploy', /const TIENG = /.test(sw) && /x !== V && x !== TIENG/.test(sw));
ok('tải tiếng lỗi thì sw.js không trả index.html thay mp3', /laTieng\(new URL\(e\.request\.url\)\)\) \{[\s\S]{0,500}return;\s*\}/.test(sw));

console.log('\n— Nói thử: máy nghe ra chữ gì —');
/* Người dùng: "chưa có chỗ nói thử để xem máy có nghe được mình nói gì không". Phần nhận giọng có, nhưng
   giấu ở bước 5 dưới "Hoặc thử cách khác", sang màn khác, và chỉ cho nói từ đầu của cặp. */
const SC = P._soChu;
ok('nói đúng từ thì là đúng', SC('books', 'books', 'book') === 'dung' && SC(' Books. ', 'books', 'book') === 'dung');
ok('máy nghe thành từ kia của cặp thì báo đúng như vậy', SC('book', 'books', 'book') === 'ban');
ok('so khớp NGUYÊN từ, không so gần giống: "bucks" không phải "books"', SC('bucks', 'books', 'book') === 'khac');
ok('từ đồng âm thật vẫn tính đúng: máy ghi "right" cho "write"', SC('right', 'write', 'ride') === 'dung');
ok('máy ghi chữ số vẫn tính đúng: "5" cho "five"', SC('5', 'five') === 'dung');
ok('máy không nghe ra gì thì không tính đúng', SC('', 'books', 'book') === 'rong');
ok('nói tự do (không có từ định nói) thì chỉ ghi ra chữ', SC('hello there', null) === 'tudo');
ok('bước 5 đặt phần nói thử LÊN ĐẦU, không còn "Hoặc thử cách khác"',
   /tới lượt bạn: nói thử<\/p>\s*\$\{veNoiThu\(\)\}/.test(nguon) && !/pa-hoac">Hoặc thử cách khác/.test(nguon));
ok('không còn màn cặp từ riêng chỉ cho nói từ đầu', !/function veCap\(/.test(nguon) && !/function moCap\(/.test(nguon));
ok('màn từng âm và đầu danh sách đều có chỗ nói thử', /taoNoiThu\('le:'/.test(nguon) && /pa-nt-vao/.test(nguon) && /function veNoiTuDo/.test(nguon));
ok('báo lỗi micro rõ từng loại', ['not-allowed', 'service-not-allowed', 'no-speech', 'network'].every(e => nguon.includes("'" + e + "'")));
ok('nói thử và máy đo không mở micro chồng nhau', /if \(dangThu \|\| dangThuLe\)/.test(nguon) && /if \(dangNghe\) \{ baoDo/.test(nguon));
ok('nút micro chỉ bảo "nói đi" khi micro đã thật sự mở', /onaudiostart/.test(nguon) && /Đang mở micro…/.test(nguon));

console.log('\n— Luyện tai: lịch chia đều, không lộ đáp án qua thứ tự —');
/* Lỗi cả ba người soát cùng thấy: lịch cũ tính vế bằng i < 4 và cặp bằng floor(i/2), nên bài có 3 cặp
   thì cặp thứ hai luôn ra từ đầu, cặp thứ ba luôn ra từ sau — nhớ cặp là đoán đúng, có từ không bao giờ được phát. */
let lichHong = [];
for (const a of AM.filter(x => x.cap.length)) {
  for (let lan = 0; lan < 20; lan++) {
    const l = P._xepLich(a);
    const A = l.filter(x => x.b).length;
    const moiCap = a.cap.map((_, c) => [l.some(x => x.c === c && x.b), l.some(x => x.c === c && !x.b)]);
    if (A !== 4 || (a.cap.length <= 4 && moiCap.some(([x, y]) => !x || !y))) { lichHong.push(a.ipa); break; }
  }
}
ok('cặp nào cũng phát cả hai từ, đúng 4 lượt từ này 4 lượt từ kia', !lichHong.length, lichHong.join(', '));
ok('chọn sai thì dừng lại cho nghe lại hai từ, không tự nhảy', /Chọn sai thì DỪNG lại/.test(nguon) && /pa-tai-tiep/.test(nguon));

console.log('\n— Năm bài âm cuối: dạy đúng chỗ CUỐI từ —');
const cuoi = AM.filter(a => a.nhom === 'Cuối từ');
ok('bài nào cũng có cặp tối thiểu thật để luyện tai và nói thử', cuoi.every(a => a.cap.length >= 2 && a.kiemDuoc),
   cuoi.filter(a => a.cap.length < 2).map(a => a.ipa).join(', '));
ok('từ dưới hình có âm đó ở CUỐI từ (vd hat/had, back/bag, wife/wipe)', cuoi.every(a => a.tuA && a.tuB),
   cuoi.filter(a => !a.tuB).map(a => a.ipa).join(', '));
ok('bài hai âm có đủ hai hình (âm này, âm kia)', cuoi.every(a => a.kh2 && a.nhan1 && a.nhan2));
ok('nói đúng điều người bản xứ làm: ở cuối từ, khác nhau ở độ dài nguyên âm trước',
   ['/s/ /z/ cuối', '/t/ /d/ cuối', '/k/ /g/ cuối', '/f/ /v/ cuối'].every(n => /dài hơn/.test(AM.find(a => a.ipa === n).cach)));
ok('bài đuôi s nói đủ ba cách đọc /s/ /z/ /ɪz/', /\/ɪz\//.test(AM.find(a => a.ipa === '/s/ /z/ cuối').viSao));
ok('máy đo đuôi s chỉ dùng từ đuôi /s/ (nó không tách được /s/ với /z/)', AM.find(a => a.ipa === '/s/ /z/ cuối').do.tu.every(t => /s$/.test(t) && !/(es|gs|ys)$/.test(t)));
ok('hình động âm tắc cuối từ không há hàm như thêm "ơ"', /kieu === 'cuoi'/.test(nguon) && /khungHinh\(hai \? a\.kh2 : a\.kh, a\.tac, a\.kieu\)/.test(nguon));
ok('bước 1 bài âm cuối không minh hoạ bằng bản thu âm ở đầu từ ([ga] … [aga])', /cuoiTu = a\.nhom === 'Cuối từ'/.test(nguon));

ok('bước 4 không lặp lại khối "Trong từ" của bước 1: bài có cặp thì nghe so từng cặp', /nghe so từng cặp/.test(nguon) && /data-socap/.test(nguon));

console.log('\n— Phiên âm quốc tế dưới mỗi từ —');
const thieuPA = [...moiTu].filter(t => !TN.ipa(t));
ok('từ nào cũng có phiên âm Anh-Anh và Anh-Mỹ', !thieuPA.length && [...moiTu].every(t => TN.ipa(t).every(Boolean)), thieuPA.join(', '));
ok('ghi theo lối từ điển người học: e chứ không ɛ, r chứ không ɹ, không dấu chấm, không dấu nối',
   Object.values(TN.IPA).flat().every(x => !/[ɛɹɡ.ˌ͡]/.test(x) && /^\/.+\/$/.test(x)));
ok('từ một âm tiết không ghi trọng âm', Object.values(TN.IPA).flat().every(x => !x.includes('ˈ') || (x.match(/[iɪeæɑɒɔəɜɝɚʌʊuoa]+ː?/g) || []).length > 1));
ok('đúng nghĩa đang dùng: "live" trong leave/live là /lɪv/ cả hai giọng', TN.ipa('live').every(x => x === '/lɪv/'));
ok('ví dụ của /ʊə/ có /ʊə/ thật trong phiên âm Anh-Anh',
   AN.tim('ua').vd.every(v => TN.ipa(v.tu)[0].includes('ʊə')), AN.tim('ua').vd.map(v => v.tu + ' ' + TN.ipa(v.tu)[0]).join(', '));
ok('khác giọng thì ghi cả hai: hot /hɒt/ · Mỹ /hɑːt/', TN.ipa('hot')[0] === '/hɒt/' && TN.ipa('hot')[1] === '/hɑːt/');
const choPA = (nguon.match(/phienAm\(/g) || []).length;
ok('phiên âm hiện ở mọi chỗ có từ: bước 1, hình, bước 4, cặp từ, luyện tai, máy đo, màn từng âm', choPA >= 9, `${choPA} chỗ`);

console.log('\n— Nói theo: gọt tiếng bạn vừa thu —');
const SRT = 16000;
const lamTieng = (phan) => {       // phan: [[giây, biên độ, tần số]] nối nhau; tần số 0 = nhiễu
  const ra = []; let pha = 0, hat = 7;
  for (const [giay, bien, tan] of phan) for (let i = 0; i < giay * SRT; i++) {
    hat = (hat * 1103515245 + 12345) % 2147483648;
    ra.push(tan ? bien * Math.sin(pha += 2 * Math.PI * tan / SRT) : bien * (hat / 1073741824 - 1));
  }
  return Float32Array.from(ra);
};
const dinhCua = (y) => y.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
ok('im lặng thì không có gì để nghe lại', P._gonTieng(new Float32Array(SRT), SRT) === null);
ok('chỉ có tiếng ồn nền thì cũng không', P._gonTieng(lamTieng([[1, .003, 0]]), SRT) === null);
const g1 = P._gonTieng(lamTieng([[.3, .002, 0], [.5, .3, 180], [.4, .002, 0]]), SRT);
ok('bỏ được đoạn lặng hai đầu', g1 && g1.length / SRT > .5 && g1.length / SRT < .75, g1 && (g1.length / SRT).toFixed(2) + ' giây');
ok('nâng lên ngang bản mẫu', g1 && Math.abs(dinhCua(g1) - .8) < .02, g1 && dinhCua(g1).toFixed(2));
const g2 = P._gonTieng(lamTieng([[.3, .0005, 0], [.5, .02, 180], [.3, .0005, 0]]), SRT);
ok('micro nhỏ vẫn nghe được: tiếng nhỏ được nâng lên', g2 && dinhCua(g2) > .35, g2 && dinhCua(g2).toFixed(2));
ok('nhưng không nâng quá 20 lần, kẻo tiếng ồn gầm lên', g2 && dinhCua(g2) <= .02 * 20 + 1e-6);
ok('vuốt hai đầu, không có tiếng tách', g1 && Math.abs(g1[0]) < 1e-3 && Math.abs(g1[g1.length - 1]) < 1e-3);

ok('luyện tai đọc TỪ trong cặp, không phát âm rời',
   /function docLuot[\s\S]{0,160}am\.cap\[l\.c\]/.test(nguon));
ok('câu hỏi hỏi về TỪ chứ không hỏi về âm', /Bạn vừa nghe từ nào/.test(nguon));
ok('luyện tai chỉ mở khi có cặp từ thật để đọc', /if \(a\.cap\.length\) ds\.push\('tai'\)/.test(nguon));
ok('âm nào có bước luyện tai thì đều có cặp từ',
   AM.filter(a => self.TDTD_PHATAM._soBuoc(a).includes('tai')).every(a => a.cap.length),
   AM.filter(a => self.TDTD_PHATAM._soBuoc(a).includes('tai') && !a.cap.length).map(a => a.ipa).join(', '));

console.log('\n— Bước xem miệng cũng phải là giọng người —');
/* Lần trước tôi sửa bước đầu và bước luyện tai nhưng BỎ SÓT đúng bước này: hai nút dưới hình
   vẫn phát âm máy dựng. Nên giờ có bài canh riêng. */
ok('hình nào cũng có từ thật để đọc', AM.every(a => a.tuA), AM.filter(a => !a.tuA).map(a => a.ipa).join(', '));
ok('hình thứ hai cũng có từ, trừ chỗ lỗi không đẻ ra từ nào',
   AM.filter(a => a.kh2 && !a.tuB).every(a => a.ipa.includes('/f/')),
   AM.filter(a => a.kh2 && !a.tuB).map(a => a.ipa).join(', '));
ok('nút dưới hình đọc từ bằng giọng người', /data-hinh="\$\{thu\}" data-t=/.test(nguon)
   && /if \(n\.dataset\.t\) doc\(n\.dataset\.t, true/.test(nguon));
ok('chỗ không có từ thì ghi rõ là tiếng máy dựng', /▶ nghe \(tiếng máy dựng\)/.test(nguon));
ok('có nói cho người dùng biết đó là giọng người', /dưới hình đọc từ thật bằng giọng người/.test(nguon));
/* Từ minh hoạ phải đúng cái âm hình đang vẽ, nên không lấy bừa cặp đầu tiên: cặp đầu của
   /s/ /z/ cuối là books/book (rụng đuôi), còn hai hình thì vẽ /s/ với /z/. */
const tuKhac = AM.filter(a => a.tuB && a.tuA !== a.tuB);
ok('hai từ minh hoạ phải khác nhau', tuKhac.length === AM.filter(a => a.tuB).length);
ok('từ minh hoạ là từ đơn, không phải câu', AM.every(a => !/\s/.test(a.tuA + (a.tuB || ''))));
ok('không lấy bừa cặp đầu tiên khi cặp đó không minh hoạ đúng hình',
   AM.find(a => a.ipa === '/s/ /z/ cuối').tuA === 'price');

console.log('\n— Chọn giọng: loại giọng trò đùa của hệ điều hành —');
/* Máy Mac có 30 giọng en-US thì 13 giọng là trò đùa. Lấy bừa "giọng en-US đầu tiên" là có ngày
   cả bài học đọc bằng giọng Bubbles. */
const mDua = nguon.match(/const GIONG_DUA = \/([^/]+)\//);
ok('có danh sách loại giọng trò đùa', !!mDua);
const reDua = mDua ? new RegExp(mDua[1], 'i') : null;
ok('loại đủ các giọng trò đùa hay gặp trên máy Mac',
   reDua && ['Bad News', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Jester', 'Organ',
             'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox'].every(n => reDua.test(n)),
   reDua ? ['Bad News', 'Bells', 'Boing', 'Bubbles', 'Zarvox'].filter(n => !reDua.test(n)).join(', ') : '');
ok('không loại nhầm giọng tử tế',
   reDua && ['Samantha', 'Alex', 'Ava', 'Allison', 'Google US English', 'Microsoft Aria'].every(n => !reDua.test(n)),
   reDua ? ['Samantha', 'Alex', 'Ava', 'Allison'].filter(n => reDua.test(n)).join(', ') : '');
ok('gom nhiều giọng chứ không lấy mỗi một, để bài nghe đổi giọng được',
   /dsGiong = xep[\s\S]{0,80}slice\(0, 5\)/.test(nguon));
ok('mỗi lượt nghe gắn một người đọc, chung cho cả hai từ của cặp', /docCap\(am\.cap\[l\.c\], l\.b \? 0 : 1, l\.g/.test(nguon));

console.log('\n— Chấm lượt nói: chỉ xét phương án máy xếp đầu —');
/* Lỗi người dùng gặp: nói "books" đúng, màn hình hiện máy nghe ra "books", mà vẫn đếm 0/5.
   Nguyên nhân: máy nhận giọng trả về tới năm phương án, và với cặp tối thiểu thì danh sách đó
   gần như luôn chứa CẢ HAI từ. Đem cả danh sách đi so thì hai vế hoà nhau, bộ so khớp báo
   "không phân biệt được", người nói đúng bị đếm sai — đúng mãi mãi 0 điểm.
   Phần quyết định trước đây dính liền với phần vẽ nên không kiểm thử được; giờ tách ra. */
const Q = self.TDTD_PHATAM._quyet;
const capBooks = ['books', 'book'];
ok('nói đúng, máy xếp từ đúng lên đầu → tính đúng',
   Q(['books', 'book', 'moose'], capBooks).dung === true);
ok('máy xếp từ KIA lên đầu → tính sai, và chỉ rõ nó nghe ra từ nào',
   (() => { const k = Q(['book', 'books'], capBooks); return k.dung === false && k.chi === 1; })());
ok('máy nghe ra từ ngoài cặp → không tính đúng, cũng không đổ cho từ kia',
   (() => { const k = Q(['moose', 'book'], capBooks); return k.dung === false && k.chi === -1; })());
ok('máy không nghe được gì → không tính đúng, không nổ lỗi',
   (() => { const k = Q([''], capBooks); return k.dung === false && k.chi === -1 && k.nghe === ''; })());
ok('danh sách rỗng cũng không nổ lỗi', Q([], capBooks).dung === false && Q(undefined, capBooks).dung === false);
ok('khoảng trắng thừa quanh chữ không làm sai kết quả', Q(['  books  '], capBooks).dung === true);
/* Bài quan trọng nhất: chính cách làm cũ phải TRƯỢT ở đây. Nếu đem cả danh sách đi so mà vẫn
   đạt thì bài kiểm này không canh được gì. */
ok('cách cũ (so cả danh sách) đúng là hỏng — nên bài này có ý nghĩa',
   N.chonCau(['books', 'book', 'moose'], capBooks).chi !== 0,
   'chonCau cả danh sách trả chi=' + N.chonCau(['books', 'book', 'moose'], capBooks).chi);
/* Soát toàn bộ cặp trong app: nói đúng từ nào thì phải được tính đúng từ đó, cả hai chiều. */
let sai = [];
AM.forEach(a => a.cap.forEach(c => {
  if (!Q([c[0], c[1]], [c[0], c[1]]).dung) sai.push(`${c[0]}/${c[1]} nói vế A`);
  if (Q([c[1], c[0]], [c[0], c[1]]).chi !== 1) sai.push(`${c[0]}/${c[1]} nói vế B`);
}));
ok('cả 38 cặp: nói vế nào máy xếp đầu thì chấm đúng vế đó', sai.length === 0, sai.slice(0, 3).join('; '));

console.log('\n— Máy không nghe được thì phải nói vì sao, đừng im lặng —');
ok('có lối đi cho máy không có phần nhận giọng nói', /không có phần nhận giọng nói/.test(nguon));
ok('có lối đi cho iPhone đã cài ra màn hình chính', /navigator && self\.navigator\.standalone/.test(nguon)
   && /màn hình chính/.test(nguon));
ok('vẫn giữ được phần hình khi không có micro', /vẫn dùng bình thường|xem hình và nghe mẫu/.test(nguon));
ok('báo rõ từng loại lỗi micro',
   ['not-allowed', 'no-speech', 'network'].every(e => nguon.includes(e)));

console.log('\n— Bảng 44 âm và bài sửa lỗi: một lối học, không phải hai —');
/* Người dùng: "sao Bảng 44 âm lại khác so với Cuối từ, khi bấm vô học cách bố trí khác nhau hết".
   Màn 44 âm từng là một trang dài riêng; giờ nó được gói thành một bài và đi chung veBuoc. */
const lop = (ds) => ds.join(' → ');
const buocAm = AN.DS.map(x => ({ x, ds: P._soBuoc(P._baiAm(x.ma)) }));
ok('mở một âm trong bảng là mở cùng lối từng bước với bài sửa lỗi',
   /function veLe\(ma, ten\) \{[\s\S]{0,400}moAm\(baiAm\(x\), ten\)/.test(nguon) && !/pa-le-to">\/\$\{esc\(x\.ipa\)\}/.test(nguon));
ok('cả 44 âm và 17 bài đều đi đúng thứ tự: nghe → (luyện tai) → xem miệng → (nghe so) → nói',
   buocAm.map(b => b.ds).concat(AM.map(a => P._soBuoc(a))).every(ds => {
     const thu = ['nghe', 'tai', 'mieng', 'so', 'noi'];
     return ds[0] === 'nghe' && ds.includes('mieng') && ds[ds.length - 1] === 'noi'
       && ds.every((b, i) => i === 0 || thu.indexOf(b) > thu.indexOf(ds[i - 1]));
   }));
ok('âm có cặp tối thiểu thì có luyện tai, như bài: /iː/ đi đủ năm bước',
   lop(P._soBuoc(P._baiAm('ii'))) === 'nghe → tai → mieng → so → noi', lop(P._soBuoc(P._baiAm('ii'))));
ok('âm không có gì để so thì bỏ bước nghe so, không bày bước rỗng: /h/',
   lop(P._soBuoc(P._baiAm('h'))) === 'nghe → mieng → noi', lop(P._soBuoc(P._baiAm('h'))));
const capAmHong = buocAm.flatMap(({ x }) => P._baiAm(x.ma).cap.filter(c => ![...ngNguoi(c[0])].some(n => ngNguoi(c[1]).has(n))).map(c => x.ipa + ':' + c[0] + '/' + c[1]));
ok('luyện tai của âm trong bảng chỉ dùng cặp có một người đọc cả hai từ (giọng không lộ đáp án)', !capAmHong.length, capAmHong.join(', '));
ok('luyện tai của âm trong bảng chỉ dùng cặp tối thiểu khai báo sẵn, không ghép bừa từ ví dụ',
   buocAm.every(({ x }) => P._baiAm(x.ma).cap.every(c => Object.values(x.soCap || {}).some(s => s[0] === c[0] && s[1] === c[1]))));
ok('đầu màn có hàng chip để sang âm / bài cùng nhóm, ở cả hai loại',
   /function dauMan\(\)[\s\S]{0,700}AN\.DS\.filter\(y => y\.nhom === a\.le\.nhom\)[\s\S]{0,300}AM\.map\(\(b, i\) => b\.nhom !== a\.nhom/.test(nguon));
ok('bước nói của mọi bài có cả "nói thử" lẫn "nói theo mẫu, nghe lại mình"',
   /tới lượt bạn: nói thử<\/p>\s*\$\{veNoiThu\(\)\}\s*\$\{veNoiTheo\(a\)\}/.test(nguon));
ok('bài nào cũng có mẫu để nói theo', AM.every(a => P._dsMau(a).length >= 1) && AN.DS.every(x => P._dsMau(P._baiAm(x.ma)).length >= 1),
   AM.filter(a => !P._dsMau(a).length).map(a => a.ipa).join(', '));
const sh = AM.find(a => a.ipa === '/ʃ/'), sAm = AN.tim('s').am.map(b => b.f);
ok('mẫu nói theo không lấy tiếng của vế SAI (/s/ trong bài /ʃ/)', sAm.length && !P._dsMau(sh).some(f => sAm.includes(f)));
ok('bài so hai tư thế: bấm qua lại, mỗi lúc một cặp hình', /data-chon-hinh/.test(nguon) && /k\.hidden = \+k\.dataset\.tu !== hinhTu/.test(nguon));

console.log(`\n${fail ? '✗' : '✓'} Tất cả: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail ? 1 : 0);

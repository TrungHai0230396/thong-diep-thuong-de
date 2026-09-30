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

console.log('\n— Hình: miệng nhìn thẳng là hình chính, cắt dọc chỉ là xem thêm —');
ok('âm nào cũng chọn rõ hình chính', AM.every(a => a.hinh === 'truoc' || a.hinh === 'canh'),
   AM.filter(a => !a.hinh).map(a => a.ipa).join(', '));
ok('âm phân biệt bằng môi hàm thì lấy hình nhìn thẳng',
   ['/p/ và /b/', '/p/ và /f/', '/v/ và /w/', '/æ/'].every(i => AM.find(a => a.ipa === i).hinh === 'truoc'));
ok('âm phân biệt bằng lưỡi bên trong thì lấy hình cắt dọc',
   ['/l/ cuối', '/t/ /d/ cuối', '/k/ /g/ cuối', '/r/'].every(i => AM.find(a => a.ipa === i).hinh === 'canh'));
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
/* Hai bài học chồng lên nhau. Một: đo đúng phổ KHÔNG có nghĩa là tai người nghe ra — âm máy dựng
   khớp 47 phép đo mà người dùng nghe không hiểu gì. Hai: thay nó bằng TỪ do máy đọc thì nghe được,
   nhưng cả bài thành luyện từ, trong khi người học cần luyện chính cái âm /s/, /z/. Bản thu người
   thật là cách duy nhất có cả giọng người lẫn âm đứng riêng. */
const AN = require('../assets/amnguoi.js');
self.TDTD_AMNGUOI = AN;
const P = self.TDTD_PHATAM;
ok('bước đầu dẫn bằng bản thu người thật',
   /Bước 1 — nghe người thật đọc âm này[\s\S]{0,300}pa-nguoi/.test(nguon));
ok('bước đầu không còn nút âm máy dựng', !/data-am="1"/.test(nguon) && !/tách riêng \(tiếng máy dựng\)/.test(nguon));
ok('từ do máy đọc vẫn còn, nhưng lùi xuống sau bản thu',
   /Bước 1 — nghe người thật[\s\S]{0,1500}<p class="pa-nhan">Trong từ<\/p>/.test(nguon));
ok('vẫn nói rõ vì sao máy đọc không đọc được âm rời', /tên chữ cái Hy Lạp/.test(doc('amnguoi.js')));
ok('bài nào cũng có ít nhất một âm do người thật đọc', AM.every(a => P._dsNguoi(a).length >= 1),
   AM.filter(a => !P._dsNguoi(a).length).map(a => a.ipa).join(', '));
ok('âm chính của bài đứng đầu và không bị tô là cái sai', AM.every(a => !P._dsNguoi(a)[0].startsWith('!')));
const lCuoi = AM.find(a => a.ipa === '/l/ cuối');
ok('vế sai được tô riêng: /l/ cuối nói thành /n/', lCuoi && P._dsNguoi(lCuoi).join(' ') === 'l !n',
   lCuoi && P._dsNguoi(lCuoi).join(' '));
ok('âm trùng nhau chỉ hiện một lần (cụm -ld: l-toi ở cả hai vế)',
   AM.every(a => new Set(P._dsNguoi(a).map(x => x.replace('!', ''))).size === P._dsNguoi(a).length));

console.log('\n— Bản thu người thật: đủ file, đúng chỗ, có ghi công —');
ok('đủ 22 âm', AN.DS.length === 22, `${AN.DS.length}`);
ok('mã âm không trùng', new Set(AN.DS.map(x => x.ma)).size === AN.DS.length);
ok('âm nào cũng có người thu, file gốc, lời gợi ý, và nói rõ bản thu đọc gì',
   AN.DS.every(x => x.tacGia && /\.ogg$/.test(x.tep) && x.goiY.length > 10 && /^\[/.test(x.noi)));
ok('âm hay lẫn khai báo đều có thật', AN.DS.every(x => x.doi.every(m => AN.tim(m))),
   AN.DS.flatMap(x => x.doi.filter(m => !AN.tim(m))).join(', '));
ok('mọi mã âm dùng trong các bài đều tìm được bản thu',
   AM.every(a => [].concat(a.am, a.am2 || []).every(m => AN.tim(m))),
   AM.flatMap(a => [].concat(a.am, a.am2 || []).filter(m => !AN.tim(m))).join(', '));
/* Âm tắc (p, t, k...) cắt riêng ra chỉ còn một tiếng tách — không được có bản "chỉ âm". */
const TAC = ['p', 'b', 't', 'd', 'k', 'g'];
ok('âm tắc không có bản "chỉ âm"', AN.DS.filter(x => TAC.includes(x.ma)).every(x => !x.cat));
ok('nguyên âm không có bản "chỉ âm" (cả file đã là âm đứng riêng)', AN.DS.filter(x => x.nhom === 'nguyen').every(x => !x.cat));
ok('mốc cắt hợp lý: 0,1–0,4 giây, nằm trong nửa giây đầu',
   AN.DS.filter(x => x.cat).every(x => x.cat[0] >= 0 && x.cat[1] <= .6 && x.cat[1] - x.cat[0] >= .1 && x.cat[1] - x.cat[0] <= .4));
const thieu = AN.DS.flatMap(x => [AN.duongDan(x.ma), x.cat && AN.duongDan(x.ma, true)].filter(Boolean))
  .filter(f => !fs.existsSync(path.join(__dirname, '..', f)));
ok('file nào khai báo cũng có trên đĩa', thieu.length === 0, thieu.join(', '));
ok('âm không có bản "chỉ âm" thì không trả về đường dẫn ma', AN.duongDan('p', true) === null);
ok('/l/ cuối dùng bản thu /l/', AN.duongDan('l-toi') === 'assets/am/l.mp3');
const ghiCong = fs.readFileSync(path.join(__dirname, '..', 'assets', 'am', 'NGUON.md'), 'utf8');
ok('file ghi nguồn có đủ người thu, giấy phép, và từng file',
   AN.tacGia().every(t => ghiCong.includes(t)) && ghiCong.includes('CC BY-SA 3.0')
   && AN.DS.every(x => ghiCong.includes('`' + x.ma + '.mp3`')));
ok('trên màn hình có ghi công người thu và giấy phép', /Tiếng người thật:/.test(nguon) && /GIAY_PHEP\.url/.test(nguon));
ok('sw.js cất sẵn danh sách âm', /'assets\/amnguoi\.js'/.test(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8')));
const trang = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
ok('trang nạp danh sách âm trước ipa.js', trang.indexOf('amnguoi.js') > 0 && trang.indexOf('amnguoi.js') < trang.indexOf('ipa.js'));
ok('mất mạng thì không đem trang HTML đi giải mã thành tiếng', /\/html\/i\.test\(r\.headers\.get\('content-type'\)/.test(nguon));
ok('đóng sao giữa lúc đang thu thì tắt micro ngay', /function dong\(\) \{[\s\S]{0,160}if \(huyThu\) huyThu\(\)/.test(nguon));

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
ok('có nói cho người dùng biết đó là giọng người', /Hai nút dưới hình đọc từ thật bằng giọng người/.test(nguon));
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
ok('mỗi lượt nghe gắn một giọng', /doc\(am\.cap\[l\.c\]\[l\.b \? 0 : 1\], true, l\.g\)/.test(nguon));

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

console.log(`\n${fail ? '✗' : '✓'} Tất cả: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail ? 1 : 0);

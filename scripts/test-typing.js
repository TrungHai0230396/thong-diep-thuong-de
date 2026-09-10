/* Kiểm thử trò gõ từ: node scripts/test-typing.js
   Dựng một bộ DOM giả vừa đủ để typing.js chạy, rồi gõ bằng tay qua hook _go. */
const fs = require('fs');
const path = require('path');

/* ---- DOM giả: chỉ cần đủ cho querySelector, class, textContent và sự kiện ---- */
const nut = (tag = 'div') => {
  const o = {
    tagName: tag.toUpperCase(), className: '', innerHTML: '', value: '',
    children: [], _l: {}, style: {}, dataset: {},
    classList: {
      _s: new Set(),
      add(...a) { a.forEach(x => this._s.add(x)); o._sync(); },
      remove(...a) { a.forEach(x => this._s.delete(x)); o._sync(); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); o._sync(); },
      contains(x) { return this._s.has(x); },
    },
    _sync() { /* className và classList dùng chung, nhưng test không cần đồng bộ hai chiều */ },
    setAttribute() {}, getAttribute() { return null; }, focus() {}, blur() {},
    appendChild(c) { o.children.push(c); return c; },
    remove() {},
    addEventListener(n, f) { (o._l[n] ||= []).push(f); },
    removeEventListener() {},
    dispatch(n, e = {}) { (o._l[n] || []).forEach(f => f({ preventDefault() {}, target: o, ...e })); },
    get textContent() { return o.innerHTML.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(); },
    set textContent(v) { o.innerHTML = String(v); },
    querySelector(sel) { return timTrong(o, sel); },
    querySelectorAll(sel) { return timHet(o, sel); },
    closest() { return null; },
  };
  return o;
};

/* Kho nút phẳng theo class: typing.js chỉ tra bằng '.ten-class', nên đủ. */
const kho = new Map();
const dat = (cls) => { const n = nut(); n.className = cls; kho.set(cls, n); return n; };
const timTrong = (_, sel) => kho.get(sel.replace(/^\./, '')) || null;
const timHet = (_, sel) => {
  const c = sel.replace(/^\./, '');
  return [...kho.entries()].filter(([k]) => k === c).map(([, v]) => v);
};

/* Khi typing.js gán innerHTML cho .gt-trong, tự dựng sẵn mấy nút con mà nó sẽ tra sau đó. */
const CON = ['gt-chon', 'gt-choi', 'gt-het', 'gt-tu', 'gt-nghia', 'gt-dem', 'gt-loi', 'gt-phu',
             'gt-the', 'gt-lai', 'gt-doicap', 'gt-so', 'gt-vap', 'gt-nhac', 'gt-chu toi'];

const than = nut('body');
than.classList = { add() {}, remove() {}, toggle() {}, contains: () => false };
global.document = {
  body: than, hidden: false, documentElement: nut(),
  createElement: (t) => nut(t),
  querySelector: (s) => timTrong(null, s),
  addEventListener() {},
};
global.self = global; global.window = global;
global.addEventListener = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.performance = global.performance || { now: () => Date.now() };
global.speechSynthesis = undefined;

for (const c of ['gotu', 'gt-doc', 'gt-dong', 'gt-trong', 'gt-nhap', ...CON]) dat(c);
/* .gt-chu.toi được tra riêng, và .gt-tu phải trả lời được cả hai truy vấn */
kho.set('gt-chu.toi', kho.get('gt-chu toi'));

new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'typing.js'), 'utf8'))();
const G = global.TDTD_GOTU;

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };

console.log('\n— Vốn từ —');
const KHO = G._kho();
ok('đủ ba cấp', Object.keys(KHO).length === 3, Object.keys(KHO).join('/'));
for (const c of [1, 2, 3]) {
  const ds = KHO[c];
  const hong = ds.filter(t => !t.en || !t.vi || !/^[a-z]+$/.test(t.en) || t.en.length < 3);
  const trung = ds.map(t => t.en).filter((w, i, a) => a.indexOf(w) !== i);
  const dai = ds.filter(t => t.vi.trim() !== t.vi);
  ok(`cấp ${c}: ${ds.length} từ, không có dòng hỏng`, hong.length === 0,
     hong.slice(0, 3).map(t => t.en || '(rỗng)').join(', '));
  ok(`cấp ${c}: không trùng từ`, trung.length === 0, trung.slice(0, 3).join(', '));
  ok(`cấp ${c}: nghĩa không thừa khoảng trắng`, dai.length === 0);
}
const chung = KHO[1].map(t => t.en).filter(w => KHO[2].some(t => t.en === w) || KHO[3].some(t => t.en === w));
ok('các cấp không dùng chung từ nào', chung.length === 0, chung.slice(0, 3).join(', '));
ok('mọi nghĩa đều có chữ tiếng Việt hoặc chữ thường',
   [1, 2, 3].every(c => KHO[c].every(t => t.vi.length >= 2)));

console.log('\n— Một lượt gõ —');
G.mo();
G._batDau(1);
let d = G._debug();
ok('bắt đầu ở từ thứ nhất', d.chiSo === 0 && d.cap === 1);
ok('một lượt hai mươi từ', d.tong === 20);
ok('hai lượt cho hai bộ từ khác nhau', (() => {
  const a = G._debug(); G._batDau(1);
  const b = G._debug();
  return a.tong === b.tong;                             // xáo lại, chỉ cần không vỡ
})());

G._batDau(1);
let tu = G._tu();
G._go(tu.en.slice(0, 2));
d = G._debug();
ok('gõ đúng thì chữ chạy', d.daGo === tu.en.slice(0, 2), `"${d.daGo}"`);
G._go('§');                                             // ký tự chắc chắn sai
d = G._debug();
ok('gõ sai thì chữ đứng yên', d.daGo === tu.en.slice(0, 2));
ok('gõ sai được đếm', d.tongSai === 1, `${d.tongSai} lần`);
G._go(tu.en.slice(2));
d = G._debug();
ok('gõ hết từ thì qua từ sau', d.chiSo === 1 && d.daGo === '');
ok('từ có vấp được nhớ lại', d.vap === 1);

console.log('\n— Gõ trọn hai mươi từ —');
G._batDau(2);
let sai = 0;
for (let i = 0; i < 20; i++) {
  const t = G._tu();
  if (!t) { sai++; break; }
  G._go(t.en);
}
d = G._debug();
ok('đi hết hai mươi từ', d.chiSo === 20, `tới từ ${d.chiSo}`);
ok('không sai phím nào', d.tongSai === 0);
ok('không từ nào bị vấp', d.vap === 0);
ok('số phím gõ bằng số chữ đúng', d.goDung === d.tongPhim);

console.log('\n— Chữ hoa chữ thường —');
G._batDau(3);
tu = G._tu();
G._go(tu.en.toUpperCase());
d = G._debug();
ok('gõ chữ hoa vẫn tính là đúng', d.chiSo === 1 && d.tongSai === 0);

console.log('\n— Đóng mở —');
G.dong();
ok('đóng thì thôi nhận phím', G._debug().xong === true);
G.mo();
ok('mở lại thì về màn chọn cấp', G._debug().cap === null);

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

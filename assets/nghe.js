/* So câu nghe được với mấy câu đã biết trước. Thuần, không đụng DOM — kiểm thử được bằng Node.

   Vì sao không cần AI: trong mỗi lượt chỉ có đúng ba câu người học có thể nói. Việc của máy
   không phải "hiểu", chỉ là xem câu nghe được giống câu nào nhất. Máy nhận giọng nói nghe
   người Việt sai nhiều (tài liệu đo được MER 0,143 so với 0,007 của người bản ngữ, tức sai
   gấp hai chục lần), nên phải so nới tay, và phải nói thẳng ra rằng trò này KHÔNG chấm phát âm.
   Nó chỉ giúp dám mở miệng nói. */
(function (root) {
'use strict';

const VIET_TAT = [
  [/\bi'?m\b/g, 'i am'], [/\bit'?s\b/g, 'it is'], [/\bthat'?s\b/g, 'that is'],
  [/\bhere'?s\b/g, 'here is'], [/\bthere'?s\b/g, 'there is'], [/\bwhat'?s\b/g, 'what is'],
  [/\bhow'?s\b/g, 'how is'], [/\blet'?s\b/g, 'let us'], [/\bdon'?t\b/g, 'do not'],
  [/\bdoesn'?t\b/g, 'does not'], [/\bdidn'?t\b/g, 'did not'], [/\bcan'?t\b/g, 'cannot'],
  [/\bwon'?t\b/g, 'will not'], [/\bisn'?t\b/g, 'is not'], [/\baren'?t\b/g, 'are not'],
  [/\bi'?ll\b/g, 'i will'], [/\bi'?d\b/g, 'i would'], [/\bi'?ve\b/g, 'i have'],
  [/\byou'?re\b/g, 'you are'], [/\bwe'?re\b/g, 'we are'], [/\bthey'?re\b/g, 'they are'],
  [/\bhe'?s\b/g, 'he is'], [/\bshe'?s\b/g, 'she is'], [/\bo'?clock\b/g, 'oclock'],
];

/* Máy nhận giọng hay trả về chữ số, còn kịch bản viết bằng chữ. Quy về một mối. */
const SO = [[/\$\s*(\d+)/g, '$1 dollars'],                  // "$3" phải thành "three dollars", không phải "dollars three"
            [/\b1\b/g, 'one'], [/\b2\b/g, 'two'], [/\b3\b/g, 'three'], [/\b4\b/g, 'four'],
            [/\b5\b/g, 'five'], [/\b6\b/g, 'six'], [/\b7\b/g, 'seven'], [/\b8\b/g, 'eight'],
            [/\b9\b/g, 'nine'], [/\b10\b/g, 'ten'], [/\b20\b/g, 'twenty']];

function chuanHoa(s) {
  let t = String(s || '').toLowerCase()
    .replace(/[‘’ʼ]/g, "'")               // nháy cong thành nháy thẳng
    .replace(/[“”]/g, '"');
  for (const [r, v] of VIET_TAT) t = t.replace(r, v);
  for (const [r, v] of SO) t = t.replace(r, v);
  return t.replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

const tu = (s) => chuanHoa(s).split(' ').filter(Boolean);

/* Hệ số Dice trên cặp ký tự: chịu được sai một hai chữ cái, đúng kiểu lỗi của máy nhận giọng. */
function diceChu(a, b) {
  const cap = (s) => {
    const m = new Map();
    const x = ' ' + s.replace(/\s+/g, ' ') + ' ';
    for (let i = 0; i < x.length - 1; i++) {
      const k = x.slice(i, i + 2);
      m.set(k, (m.get(k) || 0) + 1);
    }
    return m;
  };
  const A = cap(a), B = cap(b);
  let chung = 0, tongA = 0, tongB = 0;
  for (const [k, n] of A) { tongA += n; if (B.has(k)) chung += Math.min(n, B.get(k)); }
  for (const [, n] of B) tongB += n;
  return tongA + tongB === 0 ? 0 : 2 * chung / (tongA + tongB);
}

/* Trùng từ: câu ngắn kiểu A1 thì một từ khoá sai là đổi hẳn nghĩa, nên phải tính cả mặt này. */
function trungTu(a, b) {
  const A = tu(a), B = tu(b);
  if (!A.length || !B.length) return 0;
  const con = B.slice();
  let chung = 0;
  for (const t of A) {
    const i = con.indexOf(t);
    if (i >= 0) { chung++; con.splice(i, 1); }
  }
  return 2 * chung / (A.length + B.length);
}

const diem = (a, b) => {
  const x = chuanHoa(a), y = chuanHoa(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  return .58 * diceChu(x, y) + .42 * trungTu(x, y);
};

const RO = .75;        // giống tới mức này thì nhận ngay
const MO = .60;        // giống mờ thì chỉ nhận khi bỏ xa câu đứng nhì
const CACH = .08;      // khoảng cách tối thiểu với câu nhì

/* nghe: mảng các phương án máy nghe được (maxAlternatives), cacCau: các câu đang chờ chọn.
   Trả về chỉ số câu khớp, điểm, và có chắc chắn không. chi = -1 nghĩa là không khớp câu nào. */
function chonCau(nghe, cacCau) {
  const ds = (Array.isArray(nghe) ? nghe : [nghe]).filter(Boolean);
  if (!ds.length || !cacCau.length) return { chi: -1, diem: 0, chac: false };
  const d = cacCau.map(c => Math.max(...ds.map(n => diem(n, c))));
  let nhat = 0, nhi = -1;
  d.forEach((v, i) => { if (v > d[nhat]) nhat = i; });
  d.forEach((v, i) => { if (i !== nhat && (nhi < 0 || v > d[nhi])) nhi = i; });
  const cao = d[nhat], sau = nhi >= 0 ? d[nhi] : 0;
  if (cao >= RO && cao - sau >= CACH) return { chi: nhat, diem: cao, chac: true };
  if (cao >= MO && cao - sau >= CACH) return { chi: nhat, diem: cao, chac: false };
  return { chi: -1, diem: cao, chac: false };
}

const API = { chuanHoa, diceChu, trungTu, diem, chonCau, NGUONG: { RO, MO, CACH } };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_NGHE = API;
})(typeof self !== 'undefined' ? self : this);

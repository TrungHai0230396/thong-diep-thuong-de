/* Lõi thuần: ngày tháng, xáo bài có hạt giống, chọn lá, chuỗi ngày.
   Không đụng DOM để có thể kiểm thử bằng Node. */
(function (root) {
'use strict';

const pad = (n) => String(n).padStart(2, '0');
/** Ngày địa phương dạng YYYY-MM-DD (không dùng toISOString để tránh lệch UTC). */
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Cộng/trừ n ngày vào chuỗi YYYY-MM-DD, tự xử lý cuối tháng và năm nhuận. */
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d + n)); };

const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** Fisher–Yates có hạt giống: cùng seed luôn cho cùng thứ tự. */
const shuffle = (arr, seed) => {
  const a = arr.slice(), rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Bộ bài của vòng thứ `round` (mỗi vòng xáo lại bằng một hạt giống dẫn xuất). */
const deckOf = (ids, seed, round) => shuffle(ids, (seed + round * 7919) | 0);

/** Lá kế tiếp: phụ thuộc hoàn toàn vào số lá đã rút, không random lại khi mở app. */
const nextCardId = (ids, seed, drawCount) => {
  const n = ids.length;
  return deckOf(ids, seed, Math.floor(drawCount / n))[drawCount % n];
};

/** Chuỗi ngày liên tiếp tính tới hôm nay (hoặc hôm qua, nếu hôm nay chưa rút). */
const streakOf = (draws, today) => {
  if (!draws.length) return 0;
  const days = new Set(draws.map(d => d.d));
  let cur = days.has(today) ? today : (days.has(addDays(today, -1)) ? addDays(today, -1) : null);
  if (!cur) return 0;
  let n = 0;
  while (days.has(cur)) { n++; cur = addDays(cur, -1); }
  return n;
};

const API = { ymd, addDays, mulberry32, shuffle, deckOf, nextCardId, streakOf };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD = API;
})(typeof self !== 'undefined' ? self : this);

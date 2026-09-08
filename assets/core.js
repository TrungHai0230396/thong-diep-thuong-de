/* Lõi thuần: ngày tháng, xáo bài có hạt giống, chọn lá của ngày.
   Không đụng DOM, không lưu trữ — kiểm thử được bằng Node. */
(function (root) {
'use strict';

const pad = (n) => String(n).padStart(2, '0');
/** Ngày địa phương dạng YYYY-MM-DD (không dùng toISOString để tránh lệch UTC). */
const ymd = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Cộng/trừ n ngày, tự xử lý cuối tháng và năm nhuận. */
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return ymd(new Date(y, m - 1, d + n)); };

const EPOCH = [2026, 0, 1];  // mốc đếm ngày
/** Số ngày kể từ mốc, tính bằng ngày lịch địa phương nên không lệch vì giờ giấc. */
const dayIndex = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  const a = Date.UTC(y, m - 1, d), b = Date.UTC(EPOCH[0], EPOCH[1], EPOCH[2]);
  return Math.round((a - b) / 86400000);
};

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

const SEED = 0x54444344;  // hạt giống cố định của bộ bài

/**
 * Bộ bài của vòng thứ `round` (mỗi vòng 100 ngày).
 * Mỗi vòng là một hoán vị đủ 100 lá, và được sắp lại sao cho nửa cuối của vòng trước
 * luôn rơi vào nửa sau của vòng này. Nhờ vậy hai lần gặp cùng một lá cách nhau ít nhất 51 ngày,
 * không bao giờ có chuyện nhận trùng thông điệp hai hôm liền lúc giao vòng.
 */
const _deckCache = new Map();
const deckOf = (ids, round) => {
  const n = ids.length, key = round + 'x' + n;
  if (_deckCache.has(key)) return _deckCache.get(key);
  let deck = shuffle(ids, (SEED + round * 7919) | 0);
  if (round > 0) {
    const half = Math.floor(n / 2);
    const tail = new Set(deckOf(ids, round - 1).slice(half));   // nửa cuối vòng trước
    deck = [...deck.filter(x => !tail.has(x)), ...deck.filter(x => tail.has(x))];
  }
  _deckCache.set(key, deck);
  return deck;
};

/**
 * Lá của một ngày — suy ra hoàn toàn từ ngày đó.
 * Không lưu gì cả: đóng app, xoá dữ liệu trình duyệt hay đổi máy vẫn ra cùng một lá trong cùng ngày.
 * Mỗi vòng 100 ngày đi hết trọn bộ 100 thông điệp, không lá nào lặp lại trong vòng đó.
 */
const cardForDate = (ids, dateStr) => {
  const n = ids.length, i = dayIndex(dateStr);
  const round = Math.floor(i / n);
  return deckOf(ids, round)[((i % n) + n) % n];
};

const API = { ymd, addDays, dayIndex, mulberry32, shuffle, deckOf, cardForDate };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD = API;
})(typeof self !== 'undefined' ? self : this);

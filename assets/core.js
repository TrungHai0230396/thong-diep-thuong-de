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

const BASE = 0x54444344;  // hằng số trộn, không phải bí mật

/**
 * Bộ bài của vòng thứ `round` cho một hạt giống riêng.
 * Mỗi vòng là một hoán vị đủ 100 lá, và được sắp lại sao cho nửa cuối của vòng trước
 * luôn rơi vào nửa sau của vòng này. Nhờ vậy hai lần gặp cùng một lá cách nhau ít nhất 51 ngày,
 * không bao giờ trùng thông điệp hai hôm liền lúc giao vòng.
 */
const _cache = new Map();
const deckOf = (ids, round, seed) => {
  const n = ids.length, key = seed + '|' + round + '|' + n;
  if (_cache.has(key)) return _cache.get(key);
  let deck = shuffle(ids, (BASE + (seed | 0) * 2654435761 + round * 7919) | 0);
  if (round > 0) {
    const half = Math.floor(n / 2);
    const tail = new Set(deckOf(ids, round - 1, seed).slice(half));   // nửa cuối vòng trước
    deck = [...deck.filter(x => !tail.has(x)), ...deck.filter(x => tail.has(x))];
  }
  _cache.set(key, deck);
  return deck;
};

/**
 * Lá của một ngày, cho một người.
 * `seed` là hạt giống riêng của từng máy, nên hai người mở cùng ngày nhận hai thông điệp khác nhau.
 * Cùng một người trong cùng một ngày thì luôn ra cùng một lá, dù tải lại trang hay đóng mở app.
 * Mỗi vòng 100 ngày đi trọn bộ 100 thông điệp, không lá nào lặp lại trong vòng đó.
 */
const cardFor = (ids, dateStr, seed) => {
  const n = ids.length, i = dayIndex(dateStr);
  return deckOf(ids, Math.floor(i / n), seed)[((i % n) + n) % n];
};

/** Sinh hạt giống mới, ngẫu nhiên thật. */
const newSeed = () => {
  const c = (typeof crypto !== 'undefined' && crypto.getRandomValues) ? crypto : null;
  if (c) { const a = new Uint32Array(1); c.getRandomValues(a); return a[0] | 0; }
  return (Math.random() * 2 ** 32) | 0;
};

const API = { ymd, addDays, dayIndex, mulberry32, shuffle, deckOf, cardFor, newSeed };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD = API;
})(typeof self !== 'undefined' ? self : this);

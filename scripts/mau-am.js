/* Giọng mẫu để hiệu chỉnh và kiểm thử bộ đo phát âm (assets/dophatam.js).

   Tạo bằng máy đọc của macOS (lệnh `say`), tám giọng tiếng Anh khác vùng, lưu vào thư mục tạm
   rồi dùng lại. Không bỏ file âm thanh vào kho mã: 60 từ × 8 giọng là hơn chục MB.
   Máy không có `say` (không phải macOS) thì trả về null, bài kiểm phần giọng mẫu tự bỏ qua. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const GIONG = ['Samantha', 'Daniel', 'Karen', 'Moira', 'Tessa', 'Rishi',
               'Reed (English (US))', 'Flo (English (US))'];
const KHO = path.join(os.tmpdir(), 'tdtd-mau-am');
const SR = 22050;

let coSay = null;
function sayDuoc() {
  if (coSay === null) {
    try { execFileSync('which', ['say'], { stdio: 'ignore' }); coSay = true; } catch (e) { coSay = false; }
  }
  return coSay;
}

/* Đọc WAV PCM 16 bit một kênh. Đi qua từng khối vì `say` chèn khối FLLR trước khối data. */
function docWav(tep) {
  const b = fs.readFileSync(tep);
  let o = 12, sr = SR, du = null;
  while (o + 8 <= b.length) {
    const id = b.toString('ascii', o, o + 4), dai = b.readUInt32LE(o + 4);
    if (id === 'fmt ') sr = b.readUInt32LE(o + 12);
    if (id === 'data') { du = b.subarray(o + 8, o + 8 + dai); break; }
    o += 8 + dai + (dai & 1);
  }
  const x = new Float32Array(du.length >> 1);
  for (let i = 0; i < x.length; i++) x[i] = du.readInt16LE(i * 2) / 32768;
  return { x, sr };
}

/* Một từ do một giọng đọc, có thêm 0,3 giây lặng ở đầu và cuối như lúc bấm nút rồi mới nói.
   File của `say` im TUYỆT ĐỐI (toàn số 0), ngoài đời thì micro nào cũng có tiếng ồn nền. Không
   trộn thì "nền ồn" đo ra −120 dB và mọi ngưỡng tương đối đều hiệu chỉnh sai. Mặc định trộn
   tiếng ồn giống một phòng yên: tiếng ù trầm thấp hơn đỉnh giọng 45 dB, cộng tiếng xì của chính
   micro thấp hơn 70 dB. Truyền dbOn thì trộn nhiễu TRẮNG ở mức đó — gắt hơn phòng thật nhiều ở
   dải cao, dùng cho bài kiểm chỗ ồn. */
function mau(tu, giong, dbOn = null) {
  if (!sayDuoc()) return null;
  fs.mkdirSync(KHO, { recursive: true });
  const tep = path.join(KHO, `${giong.replace(/[^\w]+/g, '_')}__${tu.replace(/[^\w]+/g, '_')}.wav`);
  if (!fs.existsSync(tep))
    execFileSync('say', ['-v', giong, '-o', tep, '--file-format=WAVE', `--data-format=LEI16@${SR}`, tu]);
  const { x, sr } = docWav(tep);
  const dem = Math.round(.3 * sr), y = new Float32Array(x.length + 2 * dem);
  y.set(x, dem);
  const hat = tu.length * 7 + giong.length;
  return { x: dbOn === null ? tronOn(tronPhong(y, 45, hat), 70, hat + 1) : tronOn(y, dbOn, hat), sr };
}

/* Trộn nhiễu trắng ở mức cho trước (dB dưới đỉnh tiếng nói), hạt giống cố định để lặp lại được. */
function tronOn(x, dbDuoiDinh, hat = 1) {
  let dinh = 0;
  for (const v of x) dinh = Math.max(dinh, Math.abs(v));
  const muc = dinh * Math.pow(10, -dbDuoiDinh / 20);
  let s = hat >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; };
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) y[i] = x[i] + muc * r();
  return y;
}
/* Tiếng ồn trầm kiểu trong phòng (quạt, máy lạnh, xe ngoài đường): nhiễu trắng qua lọc thông
   thấp 400 Hz, cộng một chút nhiễu trắng yếu hơn 20 dB. */
function tronPhong(x, dbDuoiDinh, hat = 1, sr = SR) {
  let dinh = 0;
  for (const v of x) dinh = Math.max(dinh, Math.abs(v));
  let s = hat >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; };
  const k = 1 - Math.exp(-2 * Math.PI * 400 / sr), n = new Float32Array(x.length);
  let y = 0, e = 0;
  for (let i = 0; i < x.length; i++) { y += (r() - y) * k; n[i] = y + .1 * r(); e = Math.max(e, Math.abs(n[i])); }
  const muc = dinh * Math.pow(10, -dbDuoiDinh / 20) / e;
  return x.map((v, i) => v + n[i] * muc);
}
const nhan = (x, k) => x.map(v => v * k);

module.exports = { GIONG, mau, tronOn, tronPhong, nhan, sayDuoc, docWav };

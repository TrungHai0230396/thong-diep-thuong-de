/* Đo phát âm bằng âm học, ngay trên máy. Hàm THUẦN: nhận mẫu âm thanh, trả về kết quả; không
   đụng micro, không đụng giao diện, không gửi gì đi đâu. Tách ra để kiểm thử được bằng Node.

   Vì sao không dùng máy nhận giọng: nó trả về CHỮ, và gặp tiếng nói sai thì tự nắn về từ gần
   nhất, nên che mất đúng cái lỗi cần bắt. Ở đây đo thẳng vào tiếng, nhưng chỉ đo những thứ âm
   học có dấu hiệu rõ và đo được ổn định:

   - duoiS   đuôi /s/ /z/ (books, eyes): sau nguyên âm có một đoạn tiếng rít dải cao hay không.
   - bat     /t/ /d/ /k/ /g/ cuối: sau nguyên âm có tiếng bật nhỏ (nhả hơi) hay bị nuốt mất.
   - cumS    st- sp- sk- đầu: có tiếng /s/ trước âm bật không, và có chen âm "ơ" vào giữa không.
   - xuyt    /ʃ/ và /s/: tiếng rít của "she" phải trầm hơn rõ tiếng rít của "see".
   - vot     /p/ và /b/: từ lúc bật môi tới lúc cổ rung, "pat" phải chờ lâu hơn rõ "bat".
   - doDai   /iː/ và /ɪ/: nguyên âm của "sheep" phải dài hơn rõ của "ship".

   Ba phép sau so HAI từ do chính người đó nói, chứ không so với một con số cố định: tiếng rít
   của giọng nữ cao hơn giọng nam cả nghìn Hz, người nói nhanh nói chậm khác nhau, nên chỉ có
   sự khác nhau giữa hai từ của cùng một người mới đáng tin.

   Mọi ngưỡng đã hiệu chỉnh trên tám giọng đọc tiếng Anh (Mỹ, Anh, Úc, Ireland, Nam Phi, Ấn Độ):
   từ đúng phải đạt, từ còn lại trong cặp phải trượt, kể cả khi trộn thêm tiếng ồn. Xem
   scripts/test-dophatam.js. */
(function (root) {
'use strict';

const HOP = .005, CUA = .02;                       // bước 5 ms (đủ mịn để đo VOT), cửa sổ 20 ms

/* ---------- tính toán nền ---------- */

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const g = -2 * Math.PI / len, wr = Math.cos(g), wi = Math.sin(g), h = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let j = 0; j < h; j++) {
        const a = i + j, b = a + h;
        const br = re[b] * cr - im[b] * ci, bi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - br; im[b] = im[a] - bi; re[a] += br; im[a] += bi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

const db = (p) => 10 * Math.log10(p + 1e-12);
const phanVi = (a, q) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };

/* Tách tiếng thành từng khung 5 ms, mỗi khung đo: độ to, độ to dải trầm (giọng), dải cao (tiếng
   rít), tỉ lệ dải cao, trọng tâm phổ phần trên 1,5 kHz, và độ tuần hoàn (có rung cổ hay không). */
function phanTich(x, sr) {
  const n = x.length;
  /* bỏ lệch một chiều và tiếng ù dưới 60 Hz (quạt, xe chạy ngoài đường) */
  const y = new Float32Array(n);
  { const k = Math.exp(-2 * Math.PI * 60 / sr); let px = 0, py = 0;
    for (let i = 0; i < n; i++) { py = k * (py + x[i] - px); px = x[i]; y[i] = py; } }

  /* bản thông thấp rồi hạ mẫu xuống ~8 kHz, dùng riêng để dò rung cổ */
  const d = Math.max(1, Math.floor(sr / 8000)), srT = sr / d;
  const nT = Math.floor(n / d), yt = new Float32Array(nT);
  { const k = 1 - Math.exp(-2 * Math.PI * 1000 / sr); let a = 0, b = 0;
    for (let i = 0, j = 0; i < n; i++) { a += (y[i] - a) * k; b += (a - b) * k; if (i % d === 0 && j < nT) yt[j++] = b; } }

  const hop = Math.round(HOP * sr), w = Math.round(CUA * sr);
  let nfft = 1; while (nfft < w) nfft <<= 1;
  const han = new Float32Array(w);
  let hh = 0;
  for (let i = 0; i < w; i++) { han[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (w - 1)); hh += han[i] * han[i]; }
  const quy = 2 / (nfft * hh);                      // quy về dBFS: sóng sin to hết cỡ ra −3 dB
  const re = new Float64Array(nfft), im = new Float64Array(nfft);
  const bin = sr / nfft, nyq = sr / 2;
  const b = (f) => Math.min(nfft / 2, Math.max(1, Math.round(f / bin)));
  const [t0, t1, c0, c1, g0, u0] = [b(80), b(900), b(4000), b(Math.min(10000, nyq * .95)), b(1500), b(300)];

  const wT = Math.round(.04 * srT), lag0 = Math.floor(srT / 400), lag1 = Math.ceil(srT / 50);
  const khung = [];
  for (let s = 0; s + w <= n; s += hop) {
    re.fill(0); im.fill(0);
    for (let i = 0; i < w; i++) re[i] = y[s + i] * han[i];
    fft(re, im);
    let tong = 0, thap = 0, cao = 0, tu = 0, mau = 0, tren300 = 0;
    for (let k = 1; k <= nfft / 2; k++) {
      const p = re[k] * re[k] + im[k] * im[k];
      tong += p;
      if (k >= u0) tren300 += p;
      if (k >= t0 && k < t1) thap += p;
      if (k >= c0 && k <= c1) cao += p;
      if (k >= g0 && k <= c1) { tu += p * k * bin; mau += p; }
    }
    /* rung cổ: tự tương quan chuẩn hoá lớn nhất trong dải cao độ giọng người 50–400 Hz (giọng nam
       trầm cuối câu hay tụt dưới 70 Hz, bỏ sót thì mất luôn cả nguyên âm) */
    let r = 0;
    const cT = Math.floor((s + w / 2) / d) - (wT >> 1);
    if (cT >= 0 && cT + wT + lag1 < nT) {
      let e0 = 0;
      for (let i = 0; i < wT; i++) e0 += yt[cT + i] * yt[cT + i];
      if (e0 > 0) for (let L = lag0; L <= lag1; L++) {
        let c = 0, e1 = 0;
        for (let i = 0; i < wT; i++) { const v = yt[cT + i + L]; c += yt[cT + i] * v; e1 += v * v; }
        const q = c / Math.sqrt(e0 * e1 + 1e-12);
        if (q > r) r = q;
      }
    }
    khung.push({ t: s / sr + CUA / 2, db: db(tong * quy), thap: db(thap * quy), cao: db(cao * quy),
                 /* tỉ lệ tính trên phần từ 300 Hz trở lên: tiếng ù trầm của phòng (quạt, máy lạnh, xe
                    ngoài đường) nằm dưới đó, tính cả vào thì nó kéo tụt tỉ lệ của mọi tiếng rít */
                 tile: cao / (tren300 + 1e-12), tren: mau / (tren300 + 1e-12), tam: mau > 0 ? tu / mau : 0, huu: r });
  }

  let dinh = 0, vo = 0;
  for (let i = 0; i < n; i++) { const a = Math.abs(x[i]); if (a > dinh) dinh = a; if (a > .985) vo++; }
  const dbs = khung.map(k => k.db);
  return {
    sr, khung, hop: HOP, dinh, vo: vo / Math.max(1, n),
    nen: dbs.length ? phanVi(dbs, .1) : -120,          // nền ồn: 10% khung êm nhất
    nenThap: khung.length ? phanVi(khung.map(k => k.thap), .1) : -120,
    nenCao: khung.length ? phanVi(khung.map(k => k.cao), .1) : -120,
    to: dbs.length ? Math.max(...dbs) : -120,
  };
}

/* ---------- chia đoạn ---------- */

const ms = (p, soKhung) => Math.round(soKhung * p.hop * 1000);

/* Nguyên âm chính: dải khung có rung cổ dài nhất (cho phép hụt hai khung), và đủ to. Lấy
   theo cả độ to lẫn rung cổ: chỉ rung cổ thì dính cả tiếng ù, chỉ độ to thì dính cả tiếng rít. */
const rung = (p, k) => k.huu > .45 && k.thap - k.cao > 8 && k.thap > p.nenThap + 15;

function nguyenAm(p) {
  /* Rung cổ nhận bằng hai dấu hiệu cùng lúc: tiếng tuần hoàn, VÀ dải trầm lấn hẳn dải cao. Chỉ
     dùng độ tuần hoàn thì giọng nam trầm (chỉ đo ra 0,5–0,6 ngay giữa nguyên âm) bị cắt vụn; dải
     trầm lấn dải cao cả 25 dB ở nguyên âm, còn ở tiếng rít thì ngược lại. */
  const K = p.khung, dat = K.map(k => rung(p, k) && k.db > p.nen + 15);
  let tot = null, dau = -1, hut = 0;
  for (let i = 0; i <= K.length; i++) {
    if (i < K.length && dat[i]) { if (dau < 0) dau = i; hut = 0; continue; }
    if (dau >= 0 && i < K.length && hut < 2) { hut++; continue; }
    if (dau >= 0) {
      const cuoi = i - 1 - hut;
      if (!tot || cuoi - dau > tot.cuoi - tot.dau) tot = { dau, cuoi };
      dau = -1; hut = 0;
    }
  }
  if (!tot) return null;
  /* đỉnh của nguyên âm, rồi thu hai đầu về chỗ còn cách đỉnh dưới 18 dB: phần đuôi rung cổ
     yếu (thanh đới của /d/, /g/, /z/) không tính là nguyên âm */
  let dinh = -200;
  for (let i = tot.dau; i <= tot.cuoi; i++) dinh = Math.max(dinh, K[i].db);
  let a = tot.dau, z = tot.cuoi;
  while (a < z && K[a].db < dinh - 18) a++;
  while (z > a && K[z].db < dinh - 18) z--;
  return { dau: a, cuoi: z, dinh, dai: ms(p, z - a + 1), rungDau: tot.dau, rungCuoi: tot.cuoi };
}

/* Tiếng xát vô thanh (s, sh, f...): không rung cổ, năng lượng dồn lên trên 1,5 kHz. Giọng nam
   nói "sh" thì tiếng rít nằm ở 2–4 kHz, nên không được đòi phải có dải trên 4 kHz. */
const xat = (p, k) => k.huu < .5 && k.tren > .6 && k.db > p.nen + 12;
/* Tiếng rít của /s/ /z/: như trên nhưng cao hơn; /z/ vừa rít vừa rung cổ, nên nhận thêm khung có
   dải trên 4 kHz đủ mạnh dù có rung. */
const rit = (p, k) => (xat(p, k) && k.tam > 3200) || (k.cao > p.nenCao + 14 && k.tile > .2 && k.tam > 3200);

function doanRit(p, tu, den, loai = rit) {          // đoạn rít dài nhất trong [tu, den]
  const K = p.khung;
  let tot = null, dau = -1, hut = 0;
  for (let i = Math.max(0, tu); i <= Math.min(K.length, den + 1); i++) {
    const co = i <= den && i < K.length && loai(p, K[i]);
    if (co) { if (dau < 0) dau = i; hut = 0; continue; }
    if (dau >= 0 && hut < 2 && i <= den) { hut++; continue; }
    if (dau >= 0) {
      const cuoi = i - 1 - hut;
      if (!tot || cuoi - dau > tot.cuoi - tot.dau) tot = { dau, cuoi };
      dau = -1; hut = 0;
    }
  }
  if (!tot) return null;
  let tu2 = 0, mau = 0;
  for (let i = tot.dau; i <= tot.cuoi; i++) { const w = Math.pow(10, K[i].cao / 10); tu2 += K[i].tam * w; mau += w; }
  return { ...tot, dai: ms(p, tot.cuoi - tot.dau + 1), tam: tu2 / mau };
}

/* ---------- kiểm chất lượng bản thu ---------- */

function chatLuong(p) {
  if (p.vo > .002) return { loi: 'vo', chu: 'Tiếng bị rè vì to quá. Để máy xa miệng hơn một gang tay rồi nói lại.' };
  /* Tiếng nói phải nổi hẳn trên tiếng ồn. Ồn mà nói to vẫn được, nên xét độ chênh chứ không xét
     riêng mức ồn; mức ồn chỉ dùng để chọn câu nhắc cho đúng. */
  if (p.to - p.nen < 25) return p.nen > -50
    ? { loi: 'on', chu: 'Chỗ này ồn quá, tiếng bạn chưa nổi lên trên tiếng ồn. Tìm chỗ yên hơn, hoặc nói to và gần máy hơn.' }
    : { loi: 'nho', chu: 'Tiếng nhỏ quá. Nói to hơn, hoặc cầm máy gần miệng hơn.' };
  const v = nguyenAm(p);
  if (!v || v.dai < 50) return { loi: 'khong', chu: 'Chưa nghe thấy tiếng nói. Bấm nút rồi nói một từ, rõ và to.' };
  return null;
}

/* ---------- các phép đo ---------- */

/* Đuôi /s/ /z/: đoạn rít dài từ 50 ms, nằm sau nguyên âm (tính từ giữa nguyên âm, vì /z/ cuối
   hay rung cổ nối liền vào nguyên âm). */
/* Tiếng rít thật của /s/: gần như toàn bộ năng lượng dồn lên trên 4 kHz (0,9–0,99). Tiếng nhả
   hơi của /t/ /k/ cuối cũng là tiếng xì, có giọng (tiếng Anh Ireland) còn kéo dài cả 100 ms,
   nhưng chỉ chiếm 0,4–0,7 — bản đầu không xét tỉ lệ này nên "cat", "book" cũng thành có đuôi s.
   /z/ vừa rít vừa rung cổ nên tỉ lệ thấp hơn, nhận riêng khi có rung. */
const ritS = (p, k) => k.cao > p.nenCao + 14 && (k.tile > .7 || (k.tile > .35 && k.huu > .45));

function duoiS(p) {
  const v = nguyenAm(p);
  const r = doanRit(p, Math.floor((v.dau + v.cuoi) / 2), p.khung.length - 1, ritS);
  const dai = r && r.cuoi > v.cuoi - 4 ? r.dai : 0;
  let coRung = 0;
  if (dai) for (let i = r.dau; i <= r.cuoi; i++) if (p.khung[i].huu > .45) coRung++;
  const laZ = dai > 0 && coRung / (r.cuoi - r.dau + 1) >= .4;
  /* 80 ms: /s/ cuối từ đứng một mình dài 125–215 ms ở cả tám giọng mẫu, còn tiếng xì khi nhả /t/
     của giọng Úc chỉ 60–65 ms mà tỉ lệ dải cao cũng lên tới 0,9 — chỉ còn độ dài để tách. /z/ vốn
     ngắn hơn /s/ (đo được 85 ms), mà tiếng xì của /t/ thì không rung cổ, nên /z/ dùng ngưỡng 65. */
  const dat = dai >= (laZ ? 65 : 80);
  return { dat, giaTri: dai,
    chu: dat ? `Có đuôi rít ở cuối từ, dài ${dai} ms.`
             : dai > 0 ? `Đuôi rít ngắn quá (${dai} ms), nghe như bị cắt. Kéo "sss" dài ra một chút.`
             : 'Chưa nghe thấy đuôi /s/. Cuối từ phải có tiếng rít "sss" hoặc "zzz".' };
}

/* Tiếng nhả ở cuối: sau khi nguyên âm tắt, âm cuối có được NHẢ ra không. Người Việt quen ngậm
   luôn không nhả hơi, nên sau nguyên âm là im bặt. Nhả thì có hai kiểu, tính cả hai:
   - ngậm (lặng hẳn đi) rồi bật một tiếng ngắn — /d/ /g/ thì tiếng bật có rung cổ, không được đòi
     tiếng bật phải vô thanh như bản đầu, kẻo "made" trượt ở cả tám giọng mẫu;
   - nhả thành một tiếng xì ngay sau nguyên âm, không ngậm (giọng Úc, Ireland hay nói /t/ thế). */
function bat(p) {
  const K = p.khung, v = nguyenAm(p);
  const tu = v.cuoi + 1, den = Math.min(K.length - 1, v.cuoi + Math.round(.45 / p.hop));
  /* Chỗ ngậm phải lặng liền từ 15 ms: giọng trầm cuối từ hay rung giật từng khung, một khung tụt
     xuống rồi vọt lên không phải là ngậm rồi bật. Tiếng bật nhận theo độ to HOẶC theo dải trên
     4 kHz: /d/ ngậm mà vẫn rung cổ khá to, nên lúc bật độ to chỉ nhích 4 dB, còn dải cao vọt 12 dB. */
  let ngam = 0, daNgam = false, dbNgam = Infinity, caoNgam = Infinity, tim = null, xi = 0;
  let ngamCao = 0, daNgamCao = false, caoNgamCao = Infinity;
  /* kiểu thứ ba: nhả mà vẫn rung cổ, không ngậm (/d/ của giọng Nam Phi): nguyên âm đang tắt thì
     dải trên 4 kHz lại vọt lên hẳn so với lúc cuối nguyên âm */
  let caoCuoi = Infinity;
  for (let i = Math.max(v.dau, v.cuoi - 3); i <= v.cuoi; i++) caoCuoi = Math.min(caoCuoi, K[i].cao);
  for (let i = tu; i <= den; i++) {
    const k = K[i];
    if (k.cao > caoCuoi + 15 && k.cao > p.nenCao + 15 && k.db > p.nen + 15) { tim = i; break; }
    if (k.db < v.dinh - 22) {
      ngam++;
      if (ngam >= 3) { daNgam = true; dbNgam = Math.min(dbNgam, k.db); caoNgam = Math.min(caoNgam, k.cao); }
    } else ngam = 0;
    if (daNgam && (k.db > dbNgam + 9 || k.cao > caoNgam + 10) && k.db > p.nen + 12 && k.tren > .3) { tim = i; break; }
    /* cùng phép đó nhưng chỉ nhìn dải trên 4 kHz: ở phòng có tiếng ù trầm, độ to tổng không bao giờ
       lặng xuống nên chỗ ngậm biến mất, còn dải cao thì vẫn im lúc ngậm và vọt lên lúc bật */
    if (k.cao < p.nenCao + 6) { ngamCao++; if (ngamCao >= 3) { daNgamCao = true; caoNgamCao = Math.min(caoNgamCao, k.cao); } }
    else ngamCao = 0;
    if (daNgamCao && k.cao > caoNgamCao + 12 && k.cao > p.nenCao + 12) { tim = i; break; }
    xi = xat(p, k) && k.db > p.nen + 15 ? xi + 1 : 0;
    if (xi * p.hop >= .025) { tim = i - xi + 1; break; }
  }
  const dat = tim !== null;
  const cach = dat ? ms(p, tim - v.cuoi) : 0;
  return { dat, giaTri: cach,
    chu: dat ? `Có tiếng bật ở cuối, sau nguyên âm ${cach} ms.`
             : 'Chưa nghe tiếng bật ở cuối — âm cuối bị ngậm luôn. Chặn lưỡi rồi NHẢ nhẹ cho hơi bật ra.' };
}

/* st- sp- sk-: có đoạn rít đứng TRƯỚC nguyên âm, và giữa tiếng rít với nguyên âm không có một
   đoạn rung cổ chen vào (người Việt hay nói "sờ-top", thêm hẳn một âm tiết). */
function cumS(p) {
  const K = p.khung, v = nguyenAm(p);
  /* /s/ thật thì sau nó là một lúc NGẬM (lặng hẳn) rồi mới bật /t/ /p/ /k/ và vào nguyên âm.
     Luồng hơi bật của "top" cũng là tiếng xát, nhưng nối thẳng vào nguyên âm, không có chỗ lặng
     nào sau nó — bản đầu không xét chỗ này nên "top" cũng được tính là có /s/. */
  const r = doanRit(p, 0, v.rungDau - 1);
  let coS = false, ngam = -1;
  if (r && r.dai >= 50) {
    let dinhS = -200;
    for (let i = r.dau; i <= r.cuoi; i++) dinhS = Math.max(dinhS, K[i].db);
    /* tìm từ giữa tiếng rít: đoạn rít được phép hụt vài khung, nên có lúc nó nối vắt qua chỗ ngậm
       sang luôn tiếng bật phía sau, tìm từ cuối đoạn thì trượt mất chỗ ngậm */
    /* chỗ ngậm phải lặng liền từ 15 ms: lúc chuyển từ /s/ sang âm "ơ" chen vào ("sờ-pin") cũng có
       một chỗ tụt ngắn chừng 5–10 ms, lấy nó làm chỗ ngậm thì âm "ơ" lọt ra ngoài phép kiểm */
    for (let i = Math.floor((r.dau + r.cuoi) / 2), lien = 0; i < v.rungDau; i++) {
      lien = K[i].db < Math.min(dinhS, v.dinh) - 12 ? lien + 1 : 0;
      if (lien >= 3) { ngam = i - 2; break; }
    }
    coS = ngam >= 0;
  }
  /* âm "ơ" chen giữa: khúc rung cổ nằm giữa tiếng rít và chỗ ngậm */
  let chen = 0;
  if (coS) {
    let dau = -1;
    for (let i = Math.min(r.cuoi, ngam) + 1; i <= ngam; i++) {
      const co = rung(p, K[i]) && K[i].db > p.nen + 15;
      if (co && dau < 0) dau = i;
      if ((!co || i === ngam) && dau >= 0) { chen = Math.max(chen, ms(p, i - dau)); dau = -1; }
    }
  }
  const dat = coS && chen < 40;
  return { dat, giaTri: coS ? r.dai : 0, chen,
    chu: !coS ? 'Chưa nghe thấy /s/ ở đầu. Rít "sss" trước rồi mới vào âm sau, đừng bỏ.'
      : chen >= 40 ? `Có /s/, nhưng chen thêm một âm "ơ" vào giữa (${chen} ms) — thành hai âm tiết. Nối thẳng "s" vào âm sau.`
      : `Có /s/ ở đầu (${r.dai} ms), nối thẳng vào âm sau.` };
}

/* Các phép so hai từ. Mỗi từ đo riêng, rồi so. */

function doXuyt(p) {                                 // tiếng rít đầu từ
  const v = nguyenAm(p);
  const r = doanRit(p, 0, v.rungDau - 1, xat);
  return r && r.dai >= 30 ? { tam: r.tam, dai: r.dai } : null;
}
function xuyt(pSh, pS) {
  const a = doXuyt(pSh), b = doXuyt(pS);
  if (!a || !b) return { dat: false, giaTri: null,
    chu: `Chưa bắt được tiếng rít ở đầu ${!a ? 'từ thứ nhất' : 'từ thứ hai'}. Rít cho rõ rồi mới vào nguyên âm.` };
  const lech = Math.round(b.tam - a.tam), kA = (a.tam / 1000).toFixed(1).replace('.', ','), kB = (b.tam / 1000).toFixed(1).replace('.', ',');
  const dat = lech >= 700;
  return { dat, giaTri: lech, tamSh: Math.round(a.tam), tamS: Math.round(b.tam),
    chu: dat ? `Tiếng "sh" của bạn trầm hơn "s" rõ rệt (${kA} kHz so với ${kB} kHz).`
      : lech > 0 ? `Tiếng "sh" chỉ trầm hơn "s" một chút (${kA} so với ${kB} kHz) — nghe còn giống nhau. Tròn môi, đẩy môi ra trước khi nói "sh".`
      : `Tiếng "sh" của bạn không trầm hơn "s" (${kA} so với ${kB} kHz) — hai từ đang nghe như một. Tròn môi, lưỡi lùi vào trong khi nói "sh".` };
}

/* Thời gian từ tiếng bật môi tới lúc cổ bắt đầu rung. Âm bật tìm ở đoạn trước nguyên âm: khung
   vọt lên từ chỗ lặng. Rung cổ trước cả tiếng bật (kiểu "b" tiếng Việt) thì ra số âm. */
function doVot(p) {
  const K = p.khung, v = nguyenAm(p);
  let batI = -1;
  for (let i = Math.max(1, v.rungDau - Math.round(.25 / p.hop)); i <= v.rungDau + 2 && i < K.length; i++) {
    const truoc = Math.min(K[i - 1].db, i > 1 ? K[i - 2].db : K[i - 1].db);
    if (K[i].db > truoc + 8 && K[i].db > p.nen + 14) { batI = i; break; }
  }
  if (batI < 0) return null;
  let rungTruoc = 0;                                  // rung cổ ngay trước tiếng bật
  for (let i = batI - 1; i >= 0 && K[i].huu > .45 && K[i].thap - K[i].cao > 8 && K[i].db > p.nen + 8; i--) rungTruoc++;
  if (rungTruoc >= 4) return { vot: -ms(p, rungTruoc) };
  /* cổ bắt đầu rung thật: tuần hoàn rõ (từ 0,7). Luồng hơi bật của /p/ có lúc "khàn", đo ra độ
     tuần hoàn quanh 0,5 — lấy ngưỡng thấp như chỗ nhận nguyên âm thì luồng hơi bị tính là giọng */
  let rungI = batI;
  while (rungI < K.length && !(K[rungI].huu > .7 && rung(p, K[rungI]))) rungI++;
  return { vot: ms(p, rungI - batI) };
}
function vot(pP, pB) {
  const a = doVot(pP), b = doVot(pB);
  if (!a || !b) return { dat: false, giaTri: null,
    chu: `Chưa bắt được tiếng bật môi ở ${!a ? 'từ thứ nhất' : 'từ thứ hai'}. Mím môi lại rồi bật mạnh.` };
  const dat = a.vot >= 35 && a.vot - b.vot >= 25;
  return { dat, giaTri: a.vot - b.vot, votP: a.vot, votB: b.vot,
    chu: dat ? `"p" của bạn có luồng hơi bật ra trước khi giọng vào (${a.vot} ms, "b" chỉ ${Math.max(0, b.vot)} ms) — đúng kiểu tiếng Anh.`
      : a.vot < 35 ? `"p" của bạn chưa bật hơi (chỉ ${Math.max(0, a.vot)} ms trước khi giọng vào) — tiếng Anh cần một luồng hơi "ph" rõ. Để tờ giấy trước miệng, nói "pat", giấy phải bay.`
      : `"p" và "b" của bạn còn gần nhau (${a.vot} và ${b.vot} ms). "b" nói nhẹ, giọng vào ngay; "p" thì bật hơi mạnh.` };
}

function doDai(pDai, pNgan) {
  const a = nguyenAm(pDai), b = nguyenAm(pNgan);
  const ti = a.dai / Math.max(1, b.dai);
  const dat = ti >= 1.15;
  return { dat, giaTri: +ti.toFixed(2), daiA: a.dai, daiB: b.dai,
    chu: dat ? `Nguyên âm của từ thứ nhất dài hơn rõ (${a.dai} ms so với ${b.dai} ms).`
      : `Hai nguyên âm còn dài gần bằng nhau (${a.dai} ms và ${b.dai} ms). Kéo "iii" của từ thứ nhất dài ra, từ thứ hai nói gọn.` };
}

const MOT = { duoiS, bat, cumS };                     // phép đo một từ
const HAI = { xuyt, vot, doDai };                     // phép so hai từ

/* Tiếng rít và tiếng bật nằm ở dải cao, và tiếng bật cuối từ thì rất nhỏ. Chỗ ồn thì chúng chìm
   hẳn: thử với nhiễu trắng chỉ thấp hơn đỉnh giọng 35 dB, "made" nói đúng mà chỉ 3/48 lần được
   chấm đạt. Chấm trượt người nói đúng là tệ nhất, nên đo xem tiếng ồn ở dải trên 4 kHz thấp hơn
   nguyên âm bao nhiêu, dưới ngưỡng thì báo chỗ ồn chứ không chấm.
   Ngưỡng đo trên 431 bản thu có trộn ồn (nhiễu trắng và tiếng ù kiểu trong phòng, nhiều mức):
   tiếng rít từ 40 dB thì chấm đúng 95–98%; tiếng bật nhỏ hơn nhiều, từ 46 dB mới đúng 89%.
   Bản đầu lấy "đỉnh dải cao của chính từ đó" làm thước, nên "made", "pat" (ít tiếng cao) bị chặn
   ngay trong phòng yên. Thước phải là tiếng ồn so với GIỌNG, không phụ thuộc từ. */
const CHENH_CAO = { duoiS: 40, cumS: 40, xuyt: 40, bat: 46, vot: 46 };
const TEN_DO = { duoiS: 'tiếng rít ở cuối từ', cumS: 'tiếng /s/ ở đầu từ', xuyt: 'tiếng rít ở đầu từ',
                 bat: 'tiếng bật nhỏ ở cuối từ', vot: 'luồng hơi bật ra ở đầu từ' };
const chenhCao = (p) => { const v = nguyenAm(p); return v ? v.dinh - p.nenCao : 0; };

/* Cửa chính. Một từ: cham('duoiS', [x], sr). Hai từ: cham('xuyt', [x1, x2], sr). */
function cham(kieu, ds, sr) {
  const ps = ds.map(x => phanTich(x, sr));
  for (let i = 0; i < ps.length; i++) {
    const l = chatLuong(ps[i]);
    if (l) return { ...l, thu: i };
    if (CHENH_CAO[kieu] && chenhCao(ps[i]) < CHENH_CAO[kieu])
      return { loi: 'on', thu: i, chu: `Chỗ này hơi ồn nên máy không nghe rõ ${TEN_DO[kieu]}. Tìm chỗ yên hơn, hoặc cầm máy gần miệng hơn rồi nói lại.` };
  }
  if (MOT[kieu]) return MOT[kieu](ps[0]);
  if (HAI[kieu]) return HAI[kieu](ps[0], ps[1]);
  return { loi: 'kieu', chu: 'Âm này chưa đo được.' };
}

const API = { cham, phanTich, nguyenAm, doanRit, chatLuong, doXuyt, doVot, fft, chenhCao, CHENH_CAO,
              soTu: (kieu) => (HAI[kieu] ? 2 : MOT[kieu] ? 1 : 0) };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else root.TDTD_DOAM = API;
})(typeof self !== 'undefined' ? self : this);

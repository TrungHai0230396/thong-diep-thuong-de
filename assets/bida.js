/* Bida lỗ — 8 bi và 9 bi trên bàn 9 feet (thêm bida bài, bida 3 bi): đấu với máy, chơi chung một máy, hay mỗi người một
   máy ở quán bida 16 bàn qua mạng.

   Tìm hiểu trước khi làm:
   - Bàn, bi theo quy cách của Hiệp hội Bida Thế giới (WPA): mặt bàn 9 feet 100" × 50" (2,54 × 1,27 m, đo giữa mũi băng),
     bi 2¼" (57,15 mm). Miệng lỗ góc 4½"–4⅝", lỗ giữa 5"–5⅛" (đo giữa hai mỏm băng); hàm lỗ cắt 142° ở lỗ góc, 104° ở lỗ
     giữa — hàm khép dần vào trong nên bi vào lệch là va hàm, lắc rồi bật ra. App lấy cỡ lỗ rộng nhất trong quy cách.
   - Vật lý theo các số đo của Dr. Dave Alciatore (Đại học Colorado State): ma sát trượt bi–nỉ 0,2, cản lăn 0,01, va
     chạm bi–bi hồi 0,95. Bi vừa bị đánh thì trượt; ma sát nỉ kéo dần tới lúc lăn tròn, đúng lúc đó tốc độ còn 5/7 — nên
     đánh kéo (xoáy ngược) bi chủ chạy giật lùi, đánh đẩy (xoáy xuôi) thì bi chủ bám theo, đánh đâm (không xoáy) thì
     bi chủ đứng lại hay chạy vuông góc ("quy tắc 90°"), bi chủ lăn tròn ăn nửa bi thì lệch chừng 30° ("quy tắc 30°").
     Bi–bi coi như trơn: xoáy của bi chủ giữ nguyên lúc chạm.
   - Băng: mô hình Han (2005) như bộ mô phỏng pooltool — mũi băng cao 0,64 đường kính bi nên chạm phía trên tâm bi, lực
     băng ăn bớt xoáy xuôi, xoáy ngang (đánh lệch phải, trái) làm bi bật lệch về cùng phía.
   - Luật 8 bi, 9 bi theo WPA, bớt vài chỗ cho dễ chơi trên điện thoại (xem moHuongDan): phạm lỗi nào thì người kế cũng
     được đặt bi chủ ở đâu cũng được; bàn mở (chưa chia nhóm) thì chạm bi 8 trước là lỗi; vào bi cả hai nhóm khi bàn mở
     thì nhận nhóm của bi vào trước; không gọi lỗ, trừ bi 8 (WPA bắt gọi mọi bi); 9 bi không có push out và không xử
     thua ba lỗi liền.
   - Máy chơi qua mạng phải ra cùng một kết quả: lõi chỉ dùng cộng, trừ, nhân, chia, căn bậc hai (IEEE 754 làm tròn đúng
     như nhau trên mọi máy, khác sin, cos, mũ — mỗi trình duyệt tự viết); bước thời gian cố định; va chạm tính đúng lúc
     chạm (giải phương trình bậc hai), không đợi bi lún vào nhau. Dù vậy mỗi cú vẫn ghi kèm kết quả cuối (vị trí từng bi,
     bi nào vào lỗ nào), nên hai máy chạy hai bản app khác nhau vẫn giữ cùng một thế bàn. */
(function () {
'use strict';

/* ======================================================================================================
   LÕI: bàn, bi, vật lý, luật, máy đánh. Viết tự chứa (không dùng biến bên ngoài) để chạy được trong Web Worker: máy
   nghĩ ở luồng riêng, màn hình không đứng.
   ====================================================================================================== */
function LOI(ch) {
  'use strict';
  /* bida 3 bi (bida phăng, người dùng: "chế độ chơi bida 3 bi nữa"): LOI({ phang: true }) là bàn không lỗ theo quy cách UMB —
     mặt bàn 2,84 × 1,42 m, bi 61,5 mm, mũi băng cao 37 mm; vật lý y hệt, chỉ khác số đo và không có lỗ */
  const PHANG = !!(ch && ch.phang);
  /* ---------- số đo: mét, giây ---------- */
  const R = PHANG ? 0.03075 : 0.028575, D = 2 * R, D2 = D * D, R2 = R * R;      // bi 57,15 mm (phăng 61,5 mm)
  const DAI = PHANG ? 2.84 : 2.54, RONG = PHANG ? 1.42 : 1.27;  // mặt bàn 9 feet, đo giữa mũi băng (phăng: bàn 10 feet UMB)
  const G = 9.81;
  const A_TRUOT = 0.2 * G;                                     // ma sát trượt bi–nỉ
  const A_LAN = 0.01 * G;                                      // cản lăn
  const A_XOAY = 5 * (0.4444 * R) * G / (2 * R);               // hãm xoáy ngang (rad/s²), như pooltool: u_sp = 0,444·R
  const E_BI = 0.95;                                           // hồi bi–bi
  const E_BANG = 0.9, MU_BANG = 0.2;                           // hồi, ma sát bi–băng
  const SIN_BANG = PHANG ? 0.037 / R - 1 : 0.28, COS_BANG = Math.sqrt(1 - SIN_BANG * SIN_BANG);   // mũi băng cao 0,64·D: h/R − 1 = 0,28
  const DT = 1 / 120;                                          // bước thời gian
  /* bi bay (người dùng: "trong thực tế có đánh bi bay ra ngoài nữa, bạn mô phỏng cách đánh đó đc ko"). Nâng cơ thì cơ chúc
     xuống, thọc bi chủ vào mặt đá: đá đẩy lại, bi nảy lên (hồi bi–bàn 0,6, Dr. Dave TP B.10). Bi đang bay chạm băng khi tâm
     cao hơn mũi băng (0,64·D) thì bị hất lên, qua thành bàn; mặt băng với mặt gỗ thành bàn coi như phẳng cao 44 mm, rộng
     42 + 92 mm (như hình vẽ); qua hết là rơi xuống sàn. Bi rơi lên gỗ rồi lăn lại vào bàn thì vẫn trong cuộc (WPA 2.6). */
  const E_DA = 0.6, MU_NI = 0.2, MUI = PHANG ? 0.037 : 0.64 * D, H_GO = 0.044, RONG_GO = 0.134, E_GO = 0.35, MU_GO = 0.25;
  const E_MEP = 0.3;                                           // bi bay đập vào mép băng cao su: lún, ăn lực (dùng 0,9 như mặt băng thì bi vọt cả mét)
  const H_BAY = 1 / 2400, V_NAY = 0.1, NANG_MAX = 0.866;       // bước nhỏ khi có bi bay; nảy yếu hơn thì nằm lại; cơ nâng tới 60°
  const MIENG_GOC = 0.117475, MIENG_GIUA = 0.130175;           // 4⅝", 5⅛"
  const KE_DAU = DAI / 4;                                      // vạch đầu bàn (đặt bi chủ lúc phá)
  const CHAM_CHAN = [DAI * 3 / 4, RONG / 2];                   // chấm chân bàn: đỉnh tam giác bi
  const VMAX = 9;                                              // m/s, cú phá mạnh nhất

  /* ---------- sáu lỗ ----------
     Lỗ 0 ở góc (0, 0), đi ngược chiều kim đồng hồ: 1 giữa cạnh dưới, 2 góc (DAI, 0), 3 góc (DAI, RONG), 4 giữa cạnh
     trên, 5 góc (0, RONG). Mỗi lỗ có hai mỏm băng (moi), hai mặt hàm từ mỏm khép vào trong, và một hố tròn: tâm bi vào
     tới hố là rơi. Mặt hàm đi từ mỏm theo hướng f = −cosθ·r − sinθ·n (r: dọc băng hướng ra xa lỗ, n: vào lòng bàn),
     θ = 38° ở lỗ góc (cắt 142°), 76° ở lỗ giữa (cắt 104°) — hằng số viết sẵn, khỏi gọi cos, sin. */
  const C38 = 0.788010753606722, S38 = 0.6156614753256583, C76 = 0.24192189559966773, S76 = 0.9702957262759965;
  const p = MIENG_GOC / Math.sqrt(2), w = MIENG_GIUA / 2, CAN = Math.sqrt(0.5);
  const LO = [], BANG = [];
  function doan(ax, ay, bx, by, nx, ny) {                      // đoạn băng: pháp tuyến n hướng về phía bi
    const dx = bx - ax, dy = by - ay, dai = Math.sqrt(dx * dx + dy * dy);
    return { ax, ay, bx, by, ex: dx / dai, ey: dy / dai, dai, nx, ny };
  }
  function themLo(goc, mx, my, ax, ay, moi) {
    const keHo = goc ? 0.03 : 0.01, rHo = goc ? 0.06 : 0.065;   // gờ trước hố (WPA: lỗ góc 1–2¼", lỗ giữa 0–⅜")
    const hx = mx + ax * (keHo + rHo), hy = my + ay * (keHo + rHo);
    const lo = { goc, mx, my, ax, ay, hx, hy, rHo, moi: [], ham: [], diem: [], rong: 0 };
    for (const [lx, ly, rx, ry, nx, ny] of moi) {
      const c = goc ? C38 : C76, s = goc ? S38 : S76;
      const fx = -c * rx - s * nx, fy = -c * ry - s * ny;
      /* mặt hàm dài tới chỗ gặp vành hố */
      const ox = lx - hx, oy = ly - hy, b = ox * fx + oy * fy, cc = ox * ox + oy * oy - rHo * rHo;
      const k = -b - Math.sqrt(Math.max(0, b * b - cc));
      const ex = lx + fx * k, ey = ly + fy * k;
      let qx = -fy, qy = fx;                                   // pháp tuyến mặt hàm, quay về phía trục lỗ
      if (qx * (mx - lx) + qy * (my - ly) < 0) { qx = -qx; qy = -qy; }
      lo.moi.push([lx, ly]);
      lo.ham.push(doan(lx, ly, ex, ey, qx, qy));
      lo.diem.push([lx, ly], [ex, ey]);
    }
    lo.rong = Math.sqrt((lo.moi[0][0] - lo.moi[1][0]) ** 2 + (lo.moi[0][1] - lo.moi[1][1]) ** 2);
    LO.push(lo);
  }
  if (PHANG) BANG.push(doan(0, 0, DAI, 0, 0, 1), doan(DAI, 0, DAI, RONG, -1, 0), doan(DAI, RONG, 0, RONG, 0, -1), doan(0, RONG, 0, 0, 1, 0));
  else {
  themLo(true, p / 2, p / 2, -CAN, -CAN, [[p, 0, 1, 0, 0, 1], [0, p, 0, 1, 1, 0]]);
  themLo(false, DAI / 2, 0, 0, -1, [[DAI / 2 - w, 0, -1, 0, 0, 1], [DAI / 2 + w, 0, 1, 0, 0, 1]]);
  themLo(true, DAI - p / 2, p / 2, CAN, -CAN, [[DAI - p, 0, -1, 0, 0, 1], [DAI, p, 0, 1, -1, 0]]);
  themLo(true, DAI - p / 2, RONG - p / 2, CAN, CAN, [[DAI, RONG - p, 0, -1, -1, 0], [DAI - p, RONG, -1, 0, 0, -1]]);
  themLo(false, DAI / 2, RONG, 0, 1, [[DAI / 2 + w, RONG, 1, 0, 0, -1], [DAI / 2 - w, RONG, -1, 0, 0, -1]]);
  themLo(true, p / 2, RONG - p / 2, -CAN, CAN, [[p, RONG, 1, 0, 0, -1], [0, RONG - p, 0, -1, 1, 0]]);
  BANG.push(doan(p, 0, DAI / 2 - w, 0, 0, 1), doan(DAI / 2 + w, 0, DAI - p, 0, 0, 1), doan(DAI, p, DAI, RONG - p, -1, 0),
    doan(DAI - p, RONG, DAI / 2 + w, RONG, 0, -1), doan(DAI / 2 - w, RONG, p, RONG, 0, -1), doan(0, RONG - p, 0, p, 1, 0));
  }

  /* ---------- bi ----------
     tt: −3 bay khỏi bàn trong cú này, −2 không có trên bàn, −1 vừa rơi lỗ trong cú này, 0 nằm yên, 1 trượt, 2 lăn, 3 đang bay.
     (x, y) tâm bi, (vx, vy) vận tốc, (wx, wy, wz) vận tốc góc: wx, wy là xoáy dọc (xuôi/ngược), wz là xoáy ngang. z: đáy bi
     cao hơn mặt nỉ, vz: vận tốc lên xuống (chỉ bi đang bay). */
  function taoBi(viTri) {
    const bi = [];
    for (let i = 0; i < 16; i++) {
      const q = viTri[i];
      bi.push({ so: i, x: q ? q[0] : 0, y: q ? q[1] : 0, vx: 0, vy: 0, wx: 0, wy: 0, wz: 0, tt: q ? 0 : -2, lo: -1, z: 0, vz: 0, tren: false });
    }
    return bi;
  }
  /* cú đánh: hướng (dx, dy), tốc độ bi chủ v (m/s), chỗ đầu cơ chạm bi a (lệch phải +), b (cao +), tính theo bán kính.
     Xung lực của cơ ở chỗ lệch tâm cho vận tốc góc ω = 5v/(2R²)·(r × d): chạm cao 2/5 bán kính là lăn tròn ngay. */
  function moPhong(viTri, cu, dungKhiCham) {
    const ca = cu.ca > 0 ? cu.ca : 0, bi = taoBi(viTri), c = bi[ca];   // bi chủ: bida lỗ luôn bi 0; bida 3 bi là bi của người đánh
    let dx = cu.dx, dy = cu.dy;
    const n = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= n; dy /= n;
    const v = Math.max(0, Math.min(VMAX, cu.v)), k = 2.5 * v / R;
    const sn = cu.nang > 0 ? Math.min(NANG_MAX, cu.nang) : 0;
    if (c.tt === 0 && v > 0 && !sn) {
      c.vx = v * dx; c.vy = v * dy;
      c.wx = -k * cu.b * dy; c.wy = k * cu.b * dx; c.wz = k * cu.a;
      c.tt = 1;
    } else if (c.tt === 0 && v > 0) {
      /* cơ nâng góc θ (sn = sinθ): bi chạy theo hướng cơ, phần chúc xuống bị mặt đá đẩy lại (nayDa). Xoáy ω = k·(a·u′ − b·s),
         s = (dy, −dx, 0) bên phải, u′ = (sn·dx, sn·dy, cs) là "phía trên" của mặt bi nhìn từ đầu cơ — cơ ngang thì y như trên.
         Cơ dựng mà đánh lệch trái phải thì trục xoáy nghiêng về hướng đánh: bi chạy cong (massé) */
      const cs = Math.sqrt(1 - sn * sn);
      c.vx = v * cs * dx; c.vy = v * cs * dy;
      c.wx = k * (cu.a * sn * dx - cu.b * dy); c.wy = k * (cu.a * sn * dy + cu.b * dx); c.wz = k * cu.a * cs;
      c.tt = 1;
      nayDa(c, v * sn);
    }
    return { bi, ca, t: 0, dau: -1, bangSau: false, chamBang: bi.map(() => false), vao: [], ra: [], sk: [], xong: false, dungKhiCham: !!dungKhiCham, cham: null };
  }

  /* ma sát nỉ trong một bước: đang trượt thì chỗ bi chạm nỉ trượt với vận tốc u = v − R·(ω × z); ma sát kéo u về 0 với
     gia tốc 7/2·μg — hết trượt thì lăn, tốc độ còn v − 2/7·u. Lăn thì chỉ còn cản lăn. */
  function maSat(b, dt) {
    const ux = b.vx - R * b.wy, uy = b.vy + R * b.wx, u2 = ux * ux + uy * uy;
    if (u2 > 1e-14) {
      const u = Math.sqrt(u2), giam = 3.5 * A_TRUOT * dt;
      if (giam >= u) {
        b.vx -= ux * (2 / 7); b.vy -= uy * (2 / 7);
        b.wx = -b.vy / R; b.wy = b.vx / R;
        b.tt = b.vx === 0 && b.vy === 0 ? 0 : 2;
      } else {
        const k = A_TRUOT * dt / u, kw = 2.5 * A_TRUOT * dt / (R * u);
        b.vx -= ux * k; b.vy -= uy * k;
        b.wx -= uy * kw; b.wy += ux * kw;
        b.tt = 1;
      }
    } else {
      const v2 = b.vx * b.vx + b.vy * b.vy;
      if (v2 > 0) {
        const v = Math.sqrt(v2), giam = A_LAN * dt;
        if (giam >= v) { b.vx = 0; b.vy = 0; } else { const k = (v - giam) / v; b.vx *= k; b.vy *= k; }
      }
      b.wx = -b.vy / R; b.wy = b.vx / R;
      b.tt = b.vx === 0 && b.vy === 0 ? 0 : 2;
    }
    if (b.wz !== 0) { const g = A_XOAY * dt; b.wz = b.wz > g ? b.wz - g : b.wz < -g ? b.wz + g : 0; }
    if (b.tt === 0) { b.wx = 0; b.wy = 0; b.wz = 0; }
  }

  /* bi bị ép xuống mặt đá với vận tốc vXuong: đá đẩy lại, bi nảy lên E_DA·vXuong. Ma sát nỉ lúc nảy (xung tối đa μ·(1+e)·vXuong)
     kéo chỗ bi chạm nỉ về hết trượt — đổi bớt vận tốc ngang thành xoáy xuôi (Dr. Dave: bi chủ thêm xoáy xuôi mỗi lần nảy).
     Nảy yếu thì nằm lại trên nỉ, trượt tiếp */
  function nayDa(b, vXuong) {
    const pn = (1 + E_DA) * vXuong, ux = b.vx - R * b.wy, uy = b.vy + R * b.wx, u = Math.sqrt(ux * ux + uy * uy);
    if (u > 1e-12 && pn > 0) {
      const p = Math.min(MU_NI * pn, u * (2 / 7)), k = p / u, kw = 2.5 * p / (R * u);
      b.vx -= ux * k; b.vy -= uy * k; b.wx -= uy * kw; b.wy += ux * kw;
    }
    const len = E_DA * vXuong;
    b.z = 0;
    if (len > V_NAY) { b.vz = len; b.tt = 3; } else { b.vz = 0; b.tt = 1; }
  }

  /* ---------- thời điểm chạm (0 ≤ t < tMax), Infinity nếu không chạm ---------- */
  function tBiBi(a, b, tMax) {
    const dx = b.x - a.x, dy = b.y - a.y, dvx = b.vx - a.vx, dvy = b.vy - a.vy;
    const bb = dx * dvx + dy * dvy;
    if (bb >= 0) return Infinity;                              // đang rời nhau
    const c = dx * dx + dy * dy - D2;
    if (c <= 0) return 0;                                      // đã chạm mà còn lao vào nhau
    const aa = dvx * dvx + dvy * dvy, ds = bb * bb - aa * c;
    if (ds < 0) return Infinity;
    const t = c / (-bb + Math.sqrt(ds));                       // dạng này không mất chính xác khi c rất nhỏ
    return t < tMax ? t : Infinity;
  }
  function tBiDiem(b, qx, qy, r, tMax) {                       // tâm bi tới cách điểm q đúng r
    const dx = b.x - qx, dy = b.y - qy, bb = dx * b.vx + dy * b.vy;
    if (bb >= 0) return Infinity;
    const c = dx * dx + dy * dy - r * r;
    if (c <= 0) return 0;
    const aa = b.vx * b.vx + b.vy * b.vy, ds = bb * bb - aa * c;
    if (ds < 0) return Infinity;
    const t = c / (-bb + Math.sqrt(ds));
    return t < tMax ? t : Infinity;
  }
  function tBiDoan(b, s, tMax) {
    const vn = b.vx * s.nx + b.vy * s.ny;
    if (vn >= 0) return Infinity;
    const kc = (b.x - s.ax) * s.nx + (b.y - s.ay) * s.ny;
    if (kc < -R) return Infinity;                              // phía sau băng: không thể có
    const t = kc <= R ? 0 : (kc - R) / -vn;
    if (t >= tMax) return Infinity;
    const u = (b.x + b.vx * t - s.ax) * s.ex + (b.y + b.vy * t - s.ay) * s.ey;
    return u >= 0 && u <= s.dai ? t : Infinity;                 // chạm ngoài hai đầu đoạn thì để điểm mỏm lo
  }

  /* ---------- va chạm ---------- */
  function vaBi(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || D, nx = dx / d, ny = dy / d;
    const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (rel <= 0) return 0;
    const J = (1 + E_BI) / 2 * rel;                            // hai bi nặng bằng nhau
    a.vx -= J * nx; a.vy -= J * ny; b.vx += J * nx; b.vy += J * ny;
    a.tt = 1; b.tt = 1;
    return rel;
  }
  /* bi chạm băng, n: hướng từ tâm bi tới chỗ chạm (trong mặt bàn). Mô hình Han 2005: chỗ chạm ở trên tâm bi (góc θ,
     sinθ = 0,28); xung pháp tuyến cho hồi E_BANG, xung ma sát chặn trượt ở chỗ chạm, tối đa MU_BANG lần xung pháp tuyến. */
  function vaBang(b, nx, ny) {
    const tx = -ny, ty = nx;
    const vn = b.vx * nx + b.vy * ny;
    if (vn <= 0) return 0;
    const vt = b.vx * tx + b.vy * ty, wn = b.wx * nx + b.wy * ny, wt = b.wx * tx + b.wy * ty;
    const c = vn * COS_BANG;
    const s1 = -vn * SIN_BANG - R * wt, s2 = vt + R * (b.wz * COS_BANG - wn * SIN_BANG);
    const pn = (1 + E_BANG) * c, truot = Math.sqrt(s1 * s1 + s2 * s2);
    let p1, p2;
    if (truot * (2 / 7) <= MU_BANG * pn) { p1 = -s1 * (2 / 7); p2 = -s2 * (2 / 7); }
    else { const k = MU_BANG * pn / truot; p1 = -s1 * k; p2 = -s2 * k; }
    const dvn = -pn * COS_BANG - p1 * SIN_BANG, dvt = p2, k5 = 2.5 / R;
    const dwn = -k5 * p2 * SIN_BANG, dwt = -k5 * p1, dwz = k5 * p2 * COS_BANG;
    b.vx += dvn * nx + dvt * tx; b.vy += dvn * ny + dvt * ty;
    b.wx += dwn * nx + dwt * tx; b.wy += dwn * ny + dwt * ty;
    b.wz += dwz;
    b.tt = 1;
    return vn;
  }

  /* ---------- chùm bi khít nhau: va chạm mềm ----------
     Va chạm tức thời từng cặp không chia lực được cho chùm bi đang khít (đo thử: phá tam giác 15 bi thì hai bi chạy 5,8 và
     2,9 m/s, mười ba bi kia gần như đứng — lực đi như con lắc Newton). Thật ra bi nén vào nhau chừng 0,3 ms, lâu hơn
     nhiều so với lúc sóng lực chạy qua khe 0,2 mm, nên cả chùm cùng nén một lúc. Bi chạm một bi đang có bi khác sát bên
     (khe dưới 0,5 mm) thì chuyển sang bước 4 µs, lực nén Hertz F = k·δ^1,5 (k cho bi nhựa phenol), lúc nhả lực nhân e²
     cho hồi đúng E_BI, tới khi cả chùm tách ra. Bi đứng một mình vẫn va tức thời như cũ, đường ngắm vẫn đúng tuyệt đối. */
  const K_HERTZ = 4.4e8 / 0.17, DT_CUM = 4e-6, KHE_CUM = 0.0005, GAN_CUM = (D + KHE_CUM) * (D + KHE_CUM);
  function coCum(bi, i, j) {
    for (const a of [bi[i], bi[j]]) for (let k = 0; k < 16; k++) {
      const b = bi[k];
      if (k === i || k === j || b.tt < 0) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      if (dx * dx + dy * dy < GAN_CUM) return true;
    }
    return false;
  }
  /* bi chạm băng, mỏm lỗ, hố lỗ ngay tại chỗ (dùng trong chùm, bước rất nhỏ nên xét chồng lấn là đủ) */
  function kiemTinh(mp, a) {
    if (a.tt < 0 || a.tt === 3 || (a.vx === 0 && a.vy === 0)) return;
    const bang = (nx, ny) => { const v = vaBang(a, nx, ny); if (v > 0) { mp.chamBang[a.so] = true; if (mp.dau >= 0) mp.bangSau = true; mp.sk.push({ t: mp.t, k: 2, a: a.so, v }); } };
    for (const s of BANG) {
      const kc = (a.x - s.ax) * s.nx + (a.y - s.ay) * s.ny;
      if (kc >= R || kc < -R || a.vx * s.nx + a.vy * s.ny >= 0) continue;
      const u = (a.x - s.ax) * s.ex + (a.y - s.ay) * s.ey;
      if (u >= 0 && u <= s.dai) bang(-s.nx, -s.ny);
    }
    for (let k = 0; k < LO.length; k++) {
      const lo = LO[k];
      if (Math.abs(a.x - lo.mx) > 0.25 || Math.abs(a.y - lo.my) > 0.25) continue;
      if ((a.x - lo.hx) * (a.x - lo.hx) + (a.y - lo.hy) * (a.y - lo.hy) <= lo.rHo * lo.rHo) {
        a.tt = -1; a.lo = k; a.vx = a.vy = a.wx = a.wy = a.wz = 0;
        mp.vao.push([a.so, k]); mp.sk.push({ t: mp.t, k: 3, a: a.so, lo: k, v: 0 });
        return;
      }
      for (const s of lo.ham) {
        const kc = (a.x - s.ax) * s.nx + (a.y - s.ay) * s.ny;
        if (kc >= R || kc < -R || a.vx * s.nx + a.vy * s.ny >= 0) continue;
        const u = (a.x - s.ax) * s.ex + (a.y - s.ay) * s.ey;
        if (u >= 0 && u <= s.dai) bang(-s.nx, -s.ny);
      }
      for (const q of lo.diem) {
        const dx = q[0] - a.x, dy = q[1] - a.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && dx * a.vx + dy * a.vy > 0) { const d = Math.sqrt(d2) || R; bang(dx / d, dy / d); }
      }
    }
  }
  function chayCum(mp) {
    const bi = mp.bi, e2 = E_BI * E_BI, cham = new Array(256).fill(false);
    let t = 0;
    for (let n = 0; n < 6000; n++) {                           // tối đa 24 ms
      let ep = false, sap = false;
      for (let i = 0; i < 16; i++) {
        const a = bi[i];
        if (a.tt < 0 || a.tt === 3) continue;
        for (let j = i + 1; j < 16; j++) {
          const b = bi[j];
          if (b.tt < 0 || b.tt === 3) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 >= GAN_CUM) { cham[i * 16 + j] = false; continue; }
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (d < D) {
            ep = true;
            const del = D - d;
            let f = K_HERTZ * del * Math.sqrt(del) * DT_CUM;
            if (vr > 0) f *= e2;                               // đang nhả
            a.vx -= f * nx; a.vy -= f * ny; b.vx += f * nx; b.vy += f * ny;
            a.tt = 1; b.tt = 1;
            if (!cham[i * 16 + j]) {
              cham[i * 16 + j] = true;
              if (mp.dau < 0 && (i === mp.ca || j === mp.ca)) mp.dau = i === mp.ca ? j : i;
              mp.sk.push({ t: mp.t + t, k: 1, a: i, b: j, v: -vr });
            }
          } else if (vr < 0 && (d - D) < -vr * 5e-5) sap = true;   // sắp chạm trong 50 µs
        }
      }
      for (const b of bi) if (b.tt >= 0 && (b.vx !== 0 || b.vy !== 0)) { b.x += b.vx * DT_CUM; b.y += b.vy * DT_CUM; }
      for (const b of bi) if (b.tt === 3) { b.z += (b.vz - 0.5 * G * DT_CUM) * DT_CUM; b.vz -= G * DT_CUM; }
      t += DT_CUM;
      mp.t += DT_CUM;
      for (const b of bi) kiemTinh(mp, b);
      if (!ep && !sap) break;
    }
    return t;
  }

  /* ---------- đi một bước: ma sát rồi di chuyển, dừng đúng lúc chạm để xử lý từng va chạm theo thứ tự ---------- */
  function buoc(mp) {
    if (mp.xong) return;
    const bi = mp.bi;
    for (const b of bi) if (b.tt === 1 || b.tt === 2) maSat(b, DT);
    let con = DT, lan = 0;
    while (con > 0) {
      /* có bi đang bay thì đi từng bước nhỏ, xuLyBay xét bi bay; các bi nằm trên nỉ vẫn tính đúng lúc chạm như cũ */
      const coBay = bi.some(b => b.tt === 3);
      let tMin = coBay && con > H_BAY ? H_BAY : con, loai = 0, i0 = -1, j0 = -1, vat = null;
      for (let i = 0; i < 16; i++) {
        const a = bi[i];
        if (a.tt < 0 || a.tt === 3) continue;
        const dongA = a.vx !== 0 || a.vy !== 0;
        for (let j = i + 1; j < 16; j++) {
          const b = bi[j];
          if (b.tt < 0 || b.tt === 3 || (!dongA && b.vx === 0 && b.vy === 0)) continue;
          const t = tBiBi(a, b, tMin);
          if (t < tMin) { tMin = t; loai = 1; i0 = i; j0 = j; }
        }
        if (!dongA) continue;
        for (const s of BANG) { const t = tBiDoan(a, s, tMin); if (t < tMin) { tMin = t; loai = 2; i0 = i; vat = s; } }
        const tam = Math.abs(a.vx) + Math.abs(a.vy);
        for (let k = 0; k < LO.length; k++) {
          const lo = LO[k];
          if (Math.abs(a.x - lo.mx) > 0.25 + tam * tMin || Math.abs(a.y - lo.my) > 0.25 + tam * tMin) continue;
          const t = tBiDiem(a, lo.hx, lo.hy, lo.rHo, tMin);
          if (t < tMin) { tMin = t; loai = 4; i0 = i; j0 = k; }
          for (const s of lo.ham) { const t2 = tBiDoan(a, s, tMin); if (t2 < tMin) { tMin = t2; loai = 2; i0 = i; vat = s; } }
          for (const q of lo.diem) { const t2 = tBiDiem(a, q[0], q[1], R, tMin); if (t2 < tMin) { tMin = t2; loai = 3; i0 = i; vat = q; } }
        }
      }
      for (const b of bi) if (b.tt >= 0 && (b.vx !== 0 || b.vy !== 0)) { b.x += b.vx * tMin; b.y += b.vy * tMin; }
      if (coBay) for (const b of bi) if (b.tt === 3) { b.z += (b.vz - 0.5 * G * tMin) * tMin; b.vz -= G * tMin; }
      con -= tMin;
      mp.t += tMin;
      if (coBay) { xuLyBay(mp); if (mp.xong) return; }
      if (!loai) { if (con > 0) continue; break; }
      const a = bi[i0];
      let sk = null;
      if (loai === 1) {
        if (mp.dau < 0 && (i0 === mp.ca || j0 === mp.ca)) mp.dau = i0 === mp.ca ? j0 : i0;
        if (!mp.dungKhiCham && coCum(bi, i0, j0)) {            // chạm vào chùm bi khít: va chạm mềm
          con -= chayCum(mp);
          if (con < 0) con = 0;
          if (++lan > 400) break;
          continue;
        }
        const b = bi[j0], v = vaBi(a, b);
        sk = { t: mp.t, k: 1, a: i0, b: j0, v };
      } else if (loai === 4) {
        a.tt = -1; a.lo = j0; a.vx = a.vy = a.wx = a.wy = a.wz = 0;
        mp.vao.push([i0, j0]);
        sk = { t: mp.t, k: 3, a: i0, lo: j0, v: 0 };
      } else {
        let nx, ny;
        if (loai === 2) { nx = -vat.nx; ny = -vat.ny; }
        else { const dx = vat[0] - a.x, dy = vat[1] - a.y, d = Math.sqrt(dx * dx + dy * dy) || R; nx = dx / d; ny = dy / d; }
        const v = vaBang(a, nx, ny);
        mp.chamBang[i0] = true;
        if (mp.dau >= 0) mp.bangSau = true;
        sk = { t: mp.t, k: 2, a: i0, v };
      }
      mp.sk.push(sk);
      if (mp.dungKhiCham) { mp.cham = sk; mp.xong = true; return; }
      if (++lan > 400) {                                        // chùm bi kẹt nhau (rất hiếm): đi nốt, bỏ qua va chạm
        for (const b of bi) if (b.tt >= 0 && (b.vx !== 0 || b.vy !== 0)) { b.x += b.vx * con; b.y += b.vy * con; }
        mp.t += con;
        break;
      }
    }
    let dong = false;
    for (const b of bi) if (b.tt > 0) { dong = true; break; }
    if (!dong || mp.t > 90) mp.xong = true;
  }
  function chayHet(mp) { while (!mp.xong) buoc(mp); return mp; }

  /* ---------- bi đang bay: xét chồng lấn sau mỗi bước nhỏ (bay thì hiếm và ngắn, khỏi giải phương trình) ---------- */
  function raKhoiBan(mp, a) {
    mp.ra.push(a.so);
    mp.sk.push({ t: mp.t, k: 5, a: a.so, v: Math.sqrt(a.vx * a.vx + a.vy * a.vy), x: a.x, y: a.y, z: a.z, vx: a.vx, vy: a.vy, vz: a.vz });
    a.tt = -3; a.vx = a.vy = a.vz = a.wx = a.wy = a.wz = 0; a.tren = false;
  }
  function suKien(mp, sk) {                                    // ghi va chạm; dự đoán đường ngắm thì dừng ở lần chạm đầu
    mp.sk.push(sk);
    if (mp.dungKhiCham && sk.k <= 3) { mp.cham = sk; mp.xong = true; }
  }
  /* bi bay chạm mép (mũi băng, mặt hàm, mỏm lỗ — đều cao MUI): kc là khoảng cách ngang từ tâm bi tới mép, hướng vào bàn
     (nx, ny). Tâm còn thấp hơn mép: chạm như bi trên nỉ (vaBang); cao hơn: va vào mép theo hướng từ mép tới tâm bi — tâm càng
     cao thì mép càng hất bi lên, ít đẩy lại (bi vọt qua thành bàn); mép cao su lún nên hồi chỉ E_MEP. */
  function bayChamMep(mp, a, kc, nx, ny) {
    const dz = R + a.z - MUI;
    if (dz <= 0) {
      if (kc >= R || a.vx * nx + a.vy * ny >= 0) return false;
      const v = vaBang(a, -nx, -ny);
      a.tt = 3;
      if (v <= 0) return false;
      mp.chamBang[a.so] = true; if (mp.dau >= 0) mp.bangSau = true;
      suKien(mp, { t: mp.t, k: 2, a: a.so, v });
      return true;
    }
    const L = Math.sqrt(kc * kc + dz * dz);
    if (L >= R || L === 0) return false;
    const n1 = nx * kc / L, n2 = ny * kc / L, n3 = dz / L, vn = a.vx * n1 + a.vy * n2 + a.vz * n3;
    if (vn >= 0) return false;
    const J = (1 + E_MEP) * vn;
    a.vx -= J * n1; a.vy -= J * n2; a.vz -= J * n3;
    mp.chamBang[a.so] = true; if (mp.dau >= 0) mp.bangSau = true;
    suKien(mp, { t: mp.t, k: 2, a: a.so, v: -vn });
    return true;
  }
  function xuLyBay(mp) {
    const bi = mp.bi;
    for (const a of bi) {
      if (a.tt !== 3) continue;
      /* bi khác: va chạm ba chiều. Bi đang nằm trên nỉ bị ép xuống thì mặt đá đẩy lại — có khi nảy lên luôn (bi bay đập
         xuống chùm bi lúc phá: bi bị đập nảy lên, tới băng khi đang bay là văng ra ngoài) */
      for (const b of bi) {
        if (b === a || b.tt < 0 || (b.tt === 3 && b.so < a.so)) continue;
        const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 >= D2) continue;
        const d = Math.sqrt(d2) || D, nx = dx / d, ny = dy / d, nz = dz / d;
        const rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny + (a.vz - b.vz) * nz;
        if (rel <= 0) continue;
        const J = (1 + E_BI) / 2 * rel;
        a.vx -= J * nx; a.vy -= J * ny; a.vz -= J * nz;
        b.vx += J * nx; b.vy += J * ny; b.vz += J * nz;
        if (b.tt !== 3) { const xuong = -b.vz; b.vz = 0; if (xuong > 0) nayDa(b, xuong); else b.tt = 1; }
        if (mp.dau < 0 && (a.so === mp.ca || b.so === mp.ca)) mp.dau = a.so === mp.ca ? b.so : a.so;
        suKien(mp, { t: mp.t, k: 1, a: a.so, b: b.so, v: rel });
        if (mp.xong) return;
      }
      if (a.tt !== 3) continue;
      /* lỗ: bay ngang miệng hố khi còn thấp thì rơi vào */
      let roi = -1;
      for (let k = 0; k < LO.length && roi < 0; k++) {
        const lo = LO[k], hx = a.x - lo.hx, hy = a.y - lo.hy;
        if (hx * hx + hy * hy <= lo.rHo * lo.rHo && a.z < 1.5 * R) roi = k;
      }
      if (roi >= 0) {
        a.tt = -1; a.lo = roi; a.vx = a.vy = a.vz = a.wx = a.wy = a.wz = 0; a.z = 0; a.tren = false;
        mp.vao.push([a.so, roi]);
        suKien(mp, { t: mp.t, k: 3, a: a.so, lo: roi, v: 0 });
        if (mp.xong) return;
        continue;
      }
      const ngoai = Math.max(-a.x, a.x - DAI, -a.y, a.y - RONG);   // tâm bi ra ngoài mũi băng bao xa (âm: còn trong bàn)
      if (ngoai >= RONG_GO) { raKhoiBan(mp, a); continue; }        // qua hết thành gỗ: rơi xuống sàn
      if (ngoai > 0) {                                             // trên mặt băng, mặt gỗ thành bàn
        if (a.tren) {                                              // đang lăn trên gỗ
          const v2 = a.vx * a.vx + a.vy * a.vy, giam = MU_GO * G * H_BAY;
          if (v2 <= giam * giam) { raKhoiBan(mp, a); continue; }   // nằm lại trên thành bàn: tính là bay khỏi bàn (WPA 2.6)
          const v = Math.sqrt(v2), k = (v - giam) / v;
          a.vx *= k; a.vy *= k; a.z = H_GO; a.vz = 0;
          continue;
        }
        if (a.z <= H_GO && a.vz < 0) {                              // rơi lên mặt gỗ: nảy, ma sát ăn bớt vận tốc ngang
          const vin = -a.vz, v2 = a.vx * a.vx + a.vy * a.vy;
          a.z = H_GO; a.vz = E_GO * vin;
          if (v2 > 0) { const v = Math.sqrt(v2), k = Math.max(0, v - MU_GO * (1 + E_GO) * vin) / v; a.vx *= k; a.vy *= k; }
          mp.sk.push({ t: mp.t, k: 4, a: a.so, v: vin, go: true });
          if (a.vz < V_NAY) {
            a.vz = 0;
            const ra = (a.x < 0 ? -a.vx : 0) + (a.x > DAI ? a.vx : 0) + (a.y < 0 ? -a.vy : 0) + (a.y > RONG ? a.vy : 0);
            if (ra >= 0) raKhoiBan(mp, a);                        // còn chạy ra ngoài (hay đứng yên): lăn khỏi thành bàn
            else a.tren = true;                                    // lăn ngược vào: tới mép thì rơi lại xuống bàn
          }
        }
        continue;
      }
      a.tren = false;
      /* trong lòng bàn: băng, hàm lỗ, mỏm lỗ khi bi bay thấp hơn mép */
      if (a.z < MUI) {
        for (const s of BANG) {
          const kc = (a.x - s.ax) * s.nx + (a.y - s.ay) * s.ny;
          if (kc >= R) continue;
          const u = (a.x - s.ax) * s.ex + (a.y - s.ay) * s.ey;
          if (u >= 0 && u <= s.dai && bayChamMep(mp, a, kc, s.nx, s.ny) && mp.xong) return;
        }
        for (let k = 0; k < LO.length; k++) {
          const lo = LO[k];
          if (Math.abs(a.x - lo.mx) > 0.25 || Math.abs(a.y - lo.my) > 0.25) continue;
          for (const s of lo.ham) {
            const kc = (a.x - s.ax) * s.nx + (a.y - s.ay) * s.ny;
            if (kc >= R) continue;
            const u = (a.x - s.ax) * s.ex + (a.y - s.ay) * s.ey;
            if (u >= 0 && u <= s.dai && bayChamMep(mp, a, kc, s.nx, s.ny) && mp.xong) return;
          }
          for (const q of lo.diem) {
            const dx = a.x - q[0], dy = a.y - q[1], h = Math.sqrt(dx * dx + dy * dy);
            if (h >= R || h === 0) continue;
            if (bayChamMep(mp, a, h, dx / h, dy / h) && mp.xong) return;
          }
        }
      }
      /* rơi xuống mặt bàn: nảy (hay nằm lại). Bi vừa bị đập nảy lên thì z = 0 mà đang đi lên — chưa phải chạm bàn */
      if (a.z <= 0 && a.vz < 0) {
        const xuong = -a.vz;
        a.z = 0; a.vz = 0;
        nayDa(a, xuong > 0 ? xuong : 0);
        mp.sk.push({ t: mp.t, k: 4, a: a.so, v: xuong, x: a.x, y: a.y });
      }
    }
  }

  /* ---------- kết quả cú đánh: thứ luật cần, và vị trí cuối (làm tròn 0,1 mm cho mọi máy giữ y hệt) ---------- */
  const tron4 = (x) => Math.round(x * 10000) / 10000;
  function ketQua(mp) {
    let soBang = 0;
    for (let i = 1; i < 16; i++) if (mp.chamBang[i] && mp.bi[i].tt !== -2) soBang++;
    const kq = { dau: mp.dau, bang: mp.bangSau, soBang, vao: mp.vao.map(v => [v[0], v[1]]), ra: mp.ra.slice(), cuoi: mp.bi.map(b => (b.tt >= 0 ? [tron4(b.x), tron4(b.y)] : null)) };
    if (PHANG) {
      /* bi chủ chạm bi nào, theo thứ tự; số lần chạm băng trước khi chạm bi thứ hai (1 băng, 3 băng tính theo số này) */
      const gap = [];
      let bang = 0;
      kq.bangHai = -1;
      for (const e of mp.sk) {
        if (e.k === 2 && e.a === mp.ca) bang++;
        else if (e.k === 1 && (e.a === mp.ca || e.b === mp.ca)) {
          const o = e.a === mp.ca ? e.b : e.a;
          if (!gap.includes(o)) { gap.push(o); if (gap.length === 2) { kq.bangHai = bang; break; } }
        }
      }
      kq.hai = gap.length === 2;
    }
    return kq;
  }
  function danh(viTri, cu) { return ketQua(chayHet(moPhong(viTri, cu))); }

  /* ---------- mã hoá để ghi lên máy chủ: chỉ số nguyên, đọc ra đúng từng bit trên mọi máy ---------- */
  const so = (x, k) => String(Math.round(x * k));
  /* nâng cơ (sinθ, phần nghìn) là trường thứ chín, chỉ có khi cơ nâng: cú cơ ngang giữ đúng tám trường như bản cũ */
  function maCu(cu) {
    const m = [so(cu.dx, 1e6), so(cu.dy, 1e6), so(cu.v, 1e3), so(cu.a, 1e3), so(cu.b, 1e3),
      cu.cx != null ? so(cu.cx, 1e4) : '', cu.cy != null ? so(cu.cy, 1e4) : '', cu.lo != null && cu.lo >= 0 ? String(cu.lo) : ''];
    if (cu.nang > 0) m.push(so(Math.min(NANG_MAX, cu.nang), 1e3));
    return m.join(',');
  }
  const soNguyen = (s) => (/^-?\d{1,9}$/.test(s) ? +s : NaN);
  function docCu(chu) {
    const m = String(chu || '').split(',');
    if (m.length !== 8 && m.length !== 9) return null;
    const [dx, dy, v, a, b] = m.slice(0, 5).map(soNguyen);
    if (![dx, dy, v, a, b].every(Number.isFinite) || (dx === 0 && dy === 0)) return null;
    const cu = { dx: dx / 1e6, dy: dy / 1e6, v: v / 1e3, a: a / 1e3, b: b / 1e3 };
    if (Math.abs(cu.dx) > 1 || Math.abs(cu.dy) > 1 || cu.v <= 0 || cu.v > VMAX || Math.abs(cu.a) > 0.6 || Math.abs(cu.b) > 0.6) return null;
    if (m[5] !== '' || m[6] !== '') {
      const cx = soNguyen(m[5]), cy = soNguyen(m[6]);
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
      cu.cx = cx / 1e4; cu.cy = cy / 1e4;
    }
    if (m[7] !== '') { const lo = soNguyen(m[7]); if (!(lo >= 0 && lo <= 5)) return null; cu.lo = lo; }
    if (m.length === 9) { const n = soNguyen(m[8]); if (!(n > 0 && n <= NANG_MAX * 1000)) return null; cu.nang = n / 1e3; }
    return cu;
  }
  /* bi bay khỏi bàn là phần thứ sáu, chỉ có khi có bi bay ra */
  function maKq(kq) {
    const m = [kq.dau, kq.bang ? 1 : 0, kq.soBang, kq.vao.map(v => v[0] + '.' + v[1]).join(','),
      kq.cuoi.map(q => (q ? so(q[0], 1e4) + ':' + so(q[1], 1e4) : '')).join(',')];
    if (kq.ra && kq.ra.length) m.push(kq.ra.join(','));
    if (kq.hai !== undefined) { m[5] = (kq.ra || []).join(','); m.push(`${kq.hai ? 1 : 0},${kq.bangHai}`); }   // bida 3 bi: phần thứ bảy
    return m.join(';');
  }
  function docKq(chu) {
    const m = String(chu || '').split(';');
    if (m.length < 5 || m.length > 7) return null;
    const dau = soNguyen(m[0]), bang = soNguyen(m[1]), soBang = soNguyen(m[2]);
    /* bi đầu tiên bi chủ chạm: bàn lỗ thì không thể là bi 0 (chính bi chủ); bida 3 bi thì bi vàng đánh trúng bi trắng trước là chuyện thường */
    if (!(dau >= -1 && dau <= 15 && (dau !== 0 || PHANG)) || !(bang === 0 || bang === 1) || !(soBang >= 0 && soBang <= 15)) return null;
    const vao = [], da = new Set();
    if (m[3] !== '') for (const x of m[3].split(',')) {
      const k = /^(\d{1,2})\.(\d)$/.exec(x);
      if (!k || +k[1] > 15 || +k[2] > 5 || da.has(+k[1])) return null;
      da.add(+k[1]); vao.push([+k[1], +k[2]]);
    }
    const ds = m[4].split(',');
    if (ds.length !== 16) return null;
    const cuoi = [];
    for (let i = 0; i < 16; i++) {
      if (ds[i] === '') { cuoi.push(null); continue; }
      const k = /^(-?\d{1,6}):(-?\d{1,6})$/.exec(ds[i]);
      if (!k || da.has(i)) return null;
      const x = +k[1] / 1e4, y = +k[2] / 1e4;
      if (x < -0.1 || x > DAI + 0.1 || y < -0.1 || y > RONG + 0.1) return null;
      cuoi.push([x, y]);
    }
    const ra = [];
    if (m.length >= 6 && m[5] !== '') for (const x of m[5].split(',')) {
      const s = /^\d{1,2}$/.test(x) ? +x : -1;
      if (!(s >= 0 && s <= 15) || da.has(s) || cuoi[s]) return null;
      da.add(s); ra.push(s);
    }
    const kq = { dau, bang: bang === 1, soBang, vao, ra, cuoi };
    if (m.length === 7) { const h = /^([01]),(-1|\d{1,2})$/.exec(m[6]); if (!h) return null; kq.hai = h[1] === '1'; kq.bangHai = +h[2]; }
    return kq;
  }

  /* ---------- xếp bi ---------- */
  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const xao = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /* tam giác (8 bi) hay hình thoi (9 bi), đỉnh trên chấm chân bàn; bi cách nhau 0,2 mm và xê dịch chút ít theo hạt giống
     (bi xếp thật không bao giờ khít đều), để mỗi ván phá ra một kiểu */
  function xepBi(kieu, hat) {
    const r = mulberry32(hat | 0), K = D + 0.0002, CAO = K * Math.sqrt(3) / 2, cho = [];
    const hang = kieu === 9 ? [1, 2, 3, 2, 1] : [1, 2, 3, 4, 5];
    hang.forEach((n, h) => { for (let i = 0; i < n; i++) cho.push([CHAM_CHAN[0] + h * CAO, CHAM_CHAN[1] + (i - (n - 1) / 2) * K, h, i, n]); });
    const viTri = new Array(16).fill(null);
    let bi;
    if (kieu === 9) {
      const giua = cho.findIndex(c => c[2] === 2 && c[3] === 1);
      const con = xao([2, 3, 4, 5, 6, 7, 8], r);
      bi = cho.map((c, k) => (k === 0 ? 1 : k === giua ? 9 : con.pop()));
    } else {
      /* WPA: bi 8 ở giữa hàng ba, hai góc hàng cuối một bi trơn một bi sọc, còn lại tuỳ */
      const giua = cho.findIndex(c => c[2] === 2 && c[3] === 1), g1 = cho.findIndex(c => c[2] === 4 && c[3] === 0), g2 = cho.findIndex(c => c[2] === 4 && c[3] === 4);
      const tron = xao([1, 2, 3, 4, 5, 6, 7], r), soc = xao([9, 10, 11, 12, 13, 14, 15], r);
      const a = tron.pop(), b = soc.pop(), doi = r() < 0.5;
      const con = xao(tron.concat(soc), r);
      bi = cho.map((c, k) => (k === giua ? 8 : k === g1 ? (doi ? a : b) : k === g2 ? (doi ? b : a) : con.pop()));
    }
    cho.forEach((c, k) => { viTri[bi[k]] = [tron4(c[0] + (r() - 0.5) * 0.0001), tron4(c[1] + (r() - 0.5) * 0.0001)]; });
    viTri[0] = [tron4(KE_DAU - 0.06), RONG / 2];
    return viTri;
  }

  /* ---------- luật ---------- */
  const nhomCua = (s) => (s >= 1 && s <= 7 ? 1 : s >= 9 && s <= 15 ? 2 : 0);   // 1 bi trơn, 2 bi sọc
  /* bida bài (người dùng: "cho chế độ chơi bài nữa"; luật ở quán mỗi nơi một kiểu, app lấy phần chung): bộ 52 lá, lá số r ứng
     với bi r (A 1, J 11, Q 12, K 13), bi 14, 15 là bi mồi. Xào theo hạt giống, chia mỗi người la lá; còn lại là nọc để rút lá
     phạt. Mã lá c: số = c % 13 + 1, chất = floor(c / 13) (♠ ♣ ♦ ♥) */
  const soLa = (c) => c % 13 + 1;
  function chiaBai(the, hat, la) {
    const r = mulberry32((hat ^ 0x2545F491) | 0), bo = xao(Array.from({ length: 52 }, (_, i) => i), r), n = [3, 5, 7].includes(la) ? la : 5;
    the.la = n;
    the.bai = Array.from({ length: the.so }, (_, P) => bo.slice(P * n, P * n + n).sort((a, b) => soLa(a) - soLa(b) || a - b));
    the.noc = bo.slice(the.so * n);
  }
  /* lá phạt: rút từ nọc lá đầu tiên mà bi của nó còn trên bàn (lá của bi đã xuống lỗ thì bỏ — không bao giờ hạ được) */
  function rutPhat(the) {
    while (the.noc.length) { const c = the.noc.shift(); if (the.bi[soLa(c)]) return c; }
    return -1;
  }
  /* bida 3 bi: chỗ đặt khai cuộc theo UMB — bi đỏ (2) ở chấm chân bàn, bi của đối thủ ở chấm đầu bàn, bi người khai cuộc trên
     vạch đầu bàn cách chấm đó 18,25 cm. Ghế 1 bi trắng (0), ghế 2 bi vàng (1); tập một mình thì đánh bi trắng */
  const caCua = (the) => (the.kieu === 3 && the.so > 1 ? the.luot : 0);
  function xepPhang(pha) {
    const v = new Array(16).fill(null), kia = pha === 1 ? 0 : 1, minh = pha === 1 ? 1 : 0;
    v[2] = [CHAM_CHAN[0], CHAM_CHAN[1]];
    v[kia] = [KE_DAU, RONG / 2];
    v[minh] = [KE_DAU, tron4(RONG / 2 - 0.1825)];
    return v;
  }
  /* bi bay khỏi bàn (bida 3 bi) thì đặt lại: bi đỏ về chấm chân bàn, bi chủ về chấm đầu bàn; chấm bận thì chấm giữa, rồi chấm kia */
  function datLaiPhang(the, s) {
    const cham = s === 2 ? [CHAM_CHAN, [DAI / 2, RONG / 2], [KE_DAU, RONG / 2]] : [[KE_DAU, RONG / 2], [DAI / 2, RONG / 2], CHAM_CHAN];
    for (const [x, y] of cham) if (the.bi.every((q, i) => !q || i === s || (q[0] - x) ** 2 + (q[1] - y) ** 2 >= D2)) { the.bi[s] = [tron4(x), tron4(y)]; return; }
    datLai(the, s);
  }
  /* bida 3 bi, một cú: bi chủ chạm cả hai bi kia là ăn một điểm, đánh tiếp; luật 1 băng: chạm băng ít nhất một lần trước khi
     chạm bi thứ hai, 3 băng: ít nhất ba lần (UMB). Khai cuộc phải chạm bi đỏ trước. Bi bay khỏi bàn: lỗi, mất lượt, bi đặt lại.
     Đủ điểm trước thì thắng; tập một mình chỉ đếm điểm. */
  function apCuPhang(truoc, cu, kq) {
    const the = chepThe(truoc), P = truoc.luot, n = truoc.so, ca = caCua(truoc);
    the.bi = kq.cuoi.map(q => (q ? [q[0], q[1]] : null));
    const ra = kq.ra || [];
    const bao = { P, loi: '', vao: [], ra: ra.slice(), tiep: false, ket: false, nhomMoi: false, datLai: 0, datLaiRa: false, lyDo: '', diem: false, hai: !!kq.hai, bangHai: kq.bangHai, datLaiDs: [] };
    let loi = '';
    if (ra.length) loi = ra.includes(ca) ? 'caiRa' : 'ra';
    else if (truoc.pha && n > 1 && kq.dau !== 2) loi = 'do';
    for (const s of ra) { datLaiPhang(the, s); bao.datLaiDs.push(s); }
    const can = truoc.luat === 3 ? 3 : truoc.luat === 1 ? 1 : 0;
    bao.diem = !loi && !!kq.hai && kq.bangHai >= can;
    bao.loi = loi;
    the.pha = false; the.soCu++; the.tuDo = 0;
    if (bao.diem) {
      the.diem[P]++;
      if (n > 1 && the.diem[P] >= the.dich) { the.thang = P; the.lyDo = 'du'; bao.ket = true; bao.lyDo = 'du'; return { the, bao }; }
    }
    bao.tiep = bao.diem;
    the.luot = n > 1 && !bao.diem ? (P + 1) % n : P;
    return { the, bao };
  }
  /* thế bàn: kieu 8/9 (52: bida bài, 3: bida 3 bi), so người, bi[16] vị trí hay null, luot ghế đang đánh, pha (cú sắp tới là phá), tuDo (0 không,
     1 đặt bi chủ ở đâu cũng được, 2 đặt sau vạch đầu bàn), nhom[ghế] (8 bi: 0 chưa có, 1 trơn, 2 sọc), thang ghế thắng */
  /* tuy: bida bài là số lá (3, 5, 7); bida 3 bi là { luat: 0 tự do | 1 | 3 băng, dich: số điểm thắng } */
  function theMoi(kieu, soNguoi, hat, pha, tuy) {
    const k = kieu === 9 || kieu === 52 || kieu === 3 ? kieu : 8;
    const the = { kieu: k, so: soNguoi, bi: k === 3 ? xepPhang(pha || 0) : xepBi(k, hat), luot: pha || 0, pha: true, tuDo: k === 3 ? 0 : 2,
      nhom: new Array(soNguoi).fill(0), thang: -1, lyDo: '', soCu: 0, loiLien: new Array(soNguoi).fill(0) };
    if (k === 52) chiaBai(the, hat, tuy && typeof tuy === 'object' ? tuy.la : tuy);
    if (k === 3) {
      const t = tuy && typeof tuy === 'object' ? tuy : {};
      the.luat = [0, 1, 3].includes(t.luat) ? t.luat : 0;
      the.dich = [5, 10, 15, 25].includes(t.dich) ? t.dich : 10;
      the.diem = new Array(soNguoi).fill(0);
    }
    return the;
  }
  const chepThe = (t) => JSON.parse(JSON.stringify(t));
  function datDuoc(the, x, y, bo) {                            // đặt bi chủ ở (x, y) được không (bo: bi bỏ qua)
    if (!(x >= R && x <= DAI - R && y >= R && y <= RONG - R)) return false;
    if (the.tuDo === 2 && x > KE_DAU) return false;
    for (let i = 1; i < 16; i++) {
      const q = the.bi[i];
      if (q && i !== bo && (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y) < D2 - 1e-9) return false;
    }
    return true;
  }
  /* bi 8 / bi 9 vào sai lúc: đặt lại ở chấm chân bàn, bận thì lùi dần về băng chân dọc đường giữa bàn, hết chỗ thì tiến về
     phía đầu bàn */
  function datLai(the, s) {
    const trong = (x, y) => the.bi.every((q, i) => !q || i === s || (q[0] - x) ** 2 + (q[1] - y) ** 2 >= D2);
    for (let k = 0; k < 400; k++) {
      const x = CHAM_CHAN[0] + (k < 200 ? k : 199 - k) * 0.002;
      if (x > R && x < DAI - R && trong(x, RONG / 2)) { the.bi[s] = [tron4(x), RONG / 2]; return; }
    }
    the.bi[s] = [CHAM_CHAN[0], RONG / 2];
  }
  const thapNhat = (the) => { for (let s = 1; s < 16; s++) if (the.bi[s]) return s; return -1; };
  const conNhom = (the, g) => the.bi.some((q, s) => q && nhomCua(s) === g);
  /* bi được chạm trước ở cú này (để máy và đường ngắm biết bi nào hợp lệ) */
  function biDich(the, P) {
    const ds = [];
    if (the.kieu === 9) { const s = thapNhat(the); if (s > 0) ds.push(s); return ds; }
    if (the.kieu === 52) { for (let s = 1; s < 16; s++) if (the.bi[s]) ds.push(s); return ds; }   // bida bài: chạm bi nào trước cũng được
    if (the.kieu === 3) {                                       // bida 3 bi: khai cuộc chạm bi đỏ trước, sau đó bi nào trước cũng được
      if (the.pha && the.so > 1 && the.bi[2]) return [2];
      const ca = caCua(the); for (let s = 0; s < 3; s++) if (s !== ca && the.bi[s]) ds.push(s); return ds;
    }
    const g = the.so > 1 ? the.nhom[P] : 0;
    if (the.pha || (g === 0 && the.so > 1)) { for (let s = 1; s < 16; s++) if (s !== 8 && the.bi[s]) ds.push(s); if (!ds.length && the.bi[8]) ds.push(8); return ds; }
    if (the.so === 1) { for (let s = 1; s < 16; s++) if (the.bi[s]) ds.push(s); return ds; }
    for (let s = 1; s < 16; s++) if (the.bi[s] && nhomCua(s) === g) ds.push(s);
    if (!ds.length && the.bi[8]) ds.push(8);
    return ds;
  }
  const denBi8 = (the, P) => the.kieu === 8 && the.so > 1 && the.nhom[P] > 0 && !conNhom(the, the.nhom[P]);
  /* bi nên đánh vào lỗ (máy nhắm, đường ngắm tô vòng): bida bài là bi trùng lá trên tay cùng bi mồi 14, 15; kiểu khác là bi đích */
  function biNen(the, P) {
    if (the.kieu !== 52 || !the.bai || the.so < 2) return biDich(the, P);
    const ds = [];
    for (let s = 1; s < 16; s++) if (the.bi[s] && (s >= 14 || the.bai[P].some(c => soLa(c) === s))) ds.push(s);
    return ds.length ? ds : biDich(the, P);
  }
  /* bida bài, một cú: chạm bi nào trước cũng được. Lỗi (bi chủ rơi lỗ hay bay ra, không chạm bi nào, đánh bi bay khỏi bàn): bi vào
     lỗ, bi bay ra đều đặt lại, người đánh rút một lá phạt, người kế đặt bi chủ. Không lỗi: bi số 1–13 vào lỗ thì ai cầm lá số đó
     hạ hết (bi đã xuống, lá đó không còn hạ được); hạ được lá của mình hay vào bi mồi thì đánh tiếp; ai hết bài trước thì thắng —
     người đánh trước, rồi lần lượt theo vòng (vào bi giúp người khác hết bài thì người đó thắng). */
  function apCuBai(truoc, cu, kq) {
    const the = chepThe(truoc), P = truoc.luot, n = truoc.so;
    the.bi = kq.cuoi.map(q => (q ? [q[0], q[1]] : null));
    const vao = kq.vao.map(v => v[0]), vaoBi = vao.filter(s => s > 0), caiRoi = vao.includes(0);
    const ra = kq.ra || [], caiRa = ra.includes(0), raBi = ra.filter(s => s > 0);
    const bao = { P, loi: '', vao: vaoBi, ra: raBi, tiep: false, ket: false, nhomMoi: false, datLai: 0, datLaiRa: false, lyDo: '', ha: [], phat: -1, datLaiDs: [] };
    const loi = caiRoi ? 'cai' : caiRa ? 'caiRa' : kq.dau < 0 ? 'khong' : raBi.length ? 'ra' : '';
    bao.loi = loi;
    the.pha = false; the.soCu++;
    if (loi) {
      for (const s of vaoBi.concat(raBi)) { datLai(the, s); bao.datLaiDs.push(s); }
      if (caiRoi || caiRa) the.bi[0] = null;
      const c = rutPhat(the);
      if (c >= 0) { the.bai[P].push(c); the.bai[P].sort((a, b) => soLa(a) - soLa(b) || a - b); bao.phat = c; }
      the.tuDo = 1; the.luot = (P + 1) % n;
      the.loiLien[P] = (the.loiLien[P] || 0) + 1;
      return { the, bao };
    }
    let haMinh = false, moi = false;
    for (const s of vaoBi) {
      if (s >= 14) { moi = true; continue; }
      for (let Q = 0; Q < n; Q++) {
        const con = the.bai[Q].filter(c => soLa(c) !== s);
        if (con.length !== the.bai[Q].length) { bao.ha.push([Q, s, the.bai[Q].length - con.length]); if (Q === P) haMinh = true; the.bai[Q] = con; }
      }
    }
    the.loiLien[P] = 0;
    for (let k = 0; k < n; k++) {
      const Q = (P + k) % n;
      if (!the.bai[Q].length) { the.thang = Q; the.lyDo = Q === P ? 'baiHet' : 'baiKe'; bao.ket = true; bao.lyDo = the.lyDo; return { the, bao }; }
    }
    const tiep = haMinh || moi;
    the.tuDo = 0; the.luot = tiep ? P : (P + 1) % n;
    bao.tiep = tiep;
    return { the, bao };
  }
  /* áp một cú: trả thế mới và lời báo (loi: '' hay mã lỗi, vao: các bi vào, tiep: đánh tiếp, ket: hết ván) */
  function apCu(truoc, cu, kq) {
    if (truoc.kieu === 52 && truoc.so > 1) return apCuBai(truoc, cu, kq);
    if (truoc.kieu === 3) return apCuPhang(truoc, cu, kq);
    const the = chepThe(truoc), P = truoc.luot, n = truoc.so, pha = truoc.pha;
    the.bi = kq.cuoi.map(q => (q ? [q[0], q[1]] : null));
    const vao = kq.vao.map(v => v[0]), vaoBi = vao.filter(s => s > 0), caiRoi = vao.includes(0);
    const ra = kq.ra || [], caiRa = ra.includes(0), raBi = ra.filter(s => s > 0);
    const bao = { P, loi: '', vao: vaoBi, ra: raBi, tiep: false, ket: false, nhomMoi: false, datLai: 0, datLaiRa: false, lyDo: '' };
    let loi = '';
    if (caiRoi) loi = 'cai';
    else if (caiRa) loi = 'caiRa';                             // WPA 3.1: bi chủ bay khỏi bàn
    else if (kq.dau < 0) loi = 'khong';
    else if (n > 1 && !pha) {
      if (truoc.kieu === 9) { if (kq.dau !== thapNhat(truoc)) loi = 'sai'; }
      else if (truoc.nhom[P] === 0) { if (kq.dau === 8) loi = 'dau8'; }
      else if (denBi8(truoc, P) ? kq.dau !== 8 : nhomCua(kq.dau) !== truoc.nhom[P]) loi = 'sai';
    } else if (n > 1 && pha && truoc.kieu === 9 && kq.dau !== thapNhat(truoc)) loi = 'sai';
    if (!loi && n > 1 && raBi.length) loi = 'ra';                // WPA 3.5: đánh bi bay khỏi bàn là lỗi
    if (!loi && n > 1 && !vaoBi.length && !kq.bang && !pha) loi = 'bang';
    if (!loi && n > 1 && pha && !vaoBi.length && kq.soBang < 4) loi = 'pha';
    bao.loi = loi;
    const ket = (thang, lyDo) => { the.thang = thang; the.lyDo = lyDo; bao.ket = true; bao.lyDo = lyDo; the.pha = false; the.soCu++; return { the, bao }; };
    if (n === 1) {                                             // tập một mình: không luật, rơi bi chủ thì đặt lại
      the.pha = false; the.soCu++;
      if (caiRoi || caiRa) the.bi[0] = null;
      the.tuDo = caiRoi || caiRa ? 1 : 0;
      if (!the.bi.some((q, s) => s > 0 && q)) { the.thang = 0; the.lyDo = 'het'; bao.ket = true; bao.lyDo = 'het'; }
      return { the, bao };
    }
    /* bi bay khỏi bàn thì ra khỏi cuộc (không đặt lại), trừ: 8 bi — bi 8 bay ra lúc phá thì đặt lại (WPA 4.3g), ngoài lúc phá là
       thua (WPA 4.8d); 9 bi — bi 9 bay ra thì đặt lại (WPA 5.6) */
    if (truoc.kieu === 8 && ra.includes(8)) {
      if (!pha) return ket((P + 1) % n, '8ra');
      datLai(the, 8); bao.datLai = 8; bao.datLaiRa = true;
    }
    if (truoc.kieu === 9 && ra.includes(9)) { datLai(the, 9); bao.datLai = 9; bao.datLaiRa = true; }
    if (truoc.kieu === 8 && vao.includes(8)) {
      const lo8 = kq.vao.find(v => v[0] === 8)[1];
      if (pha) { datLai(the, 8); bao.datLai = 8; }
      else if (!denBi8(truoc, P)) return ket((P + 1) % n, '8som');
      else if (loi) return ket((P + 1) % n, '8loi');
      else if (lo8 !== cu.lo) return ket((P + 1) % n, '8sai');
      else return ket(P, '8dung');
    }
    if (truoc.kieu === 9 && vao.includes(9)) {
      if (!loi) return ket(P, pha ? '9pha' : '9dung');
      datLai(the, 9); bao.datLai = 9;
    }
    if (truoc.kieu === 8 && !loi && !pha && truoc.nhom[P] === 0) {
      const s = vaoBi.find(x => x !== 8);
      if (s !== undefined) { const g = nhomCua(s); for (let Q = 0; Q < n; Q++) the.nhom[Q] = Q === P ? g : 3 - g; bao.nhomMoi = true; }
    }
    const g = the.nhom[P];
    const tiep = !loi && (truoc.kieu === 9 || pha ? vaoBi.length > 0 : vaoBi.some(s => s !== 8 && nhomCua(s) === g));
    the.pha = false;
    if (caiRoi || caiRa) the.bi[0] = null;
    the.tuDo = loi ? 1 : 0;
    the.luot = tiep ? P : (P + 1) % n;
    the.loiLien[P] = loi ? (the.loiLien[P] || 0) + 1 : 0;
    the.soCu++;
    bao.tiep = tiep;
    return { the, bao };
  }
  /* cú có hợp lệ với thế bàn không (ghi từ máy khác, hay người lạ ghi bừa): đặt bi chủ đúng lúc, đúng chỗ; bi 8 phải chọn lỗ */
  function cuHopLe(the, cu) {
    if (!cu || the.thang >= 0) return false;
    if (the.tuDo) {
      if (cu.cx == null) return !!the.bi[0] && datDuoc(the, the.bi[0][0], the.bi[0][1]);
      if (!datDuoc(the, cu.cx, cu.cy)) return false;
    } else if (cu.cx != null || !the.bi[caCua(the)]) return false;
    if (denBi8(the, the.luot) && cu.lo == null) return false;
    return true;
  }
  /* vị trí bi lúc bắt đầu cú (bi chủ đặt lại nếu có) */
  function viTriDanh(the, cu) {
    const v = the.bi.map(q => (q ? [q[0], q[1]] : null));
    if (cu && cu.cx != null) v[0] = [cu.cx, cu.cy];
    return v;
  }
  /* kết quả ghi từ máy khác có khớp thế bàn không: bi đã vào lỗ không sống lại, bi đang trên bàn thì hoặc còn, hoặc vào lỗ */
  function kqHopLe(the, cu, kq) {
    const v = viTriDanh(the, cu), vao = new Set(kq.vao.map(x => x[0])), ra = new Set(kq.ra || []);
    for (let s = 0; s < 16; s++) {
      if (!v[s]) { if (kq.cuoi[s] || vao.has(s) || ra.has(s)) return false; }
      else if (kq.cuoi[s] ? vao.has(s) || ra.has(s) : vao.has(s) === ra.has(s)) return false;   // còn trên bàn, vào lỗ, hay bay ra
    }
    return kq.dau < 0 || !!v[kq.dau];
  }

  /* ---------- dự đoán cho đường ngắm: bi chủ chạy tới lần chạm đầu (bi khác đứng yên), rồi hướng đi sau đó ----------
     Sau va chạm bi chủ còn xoáy nên trượt, ma sát nỉ bẻ cong đường đi tới lúc lăn tròn với vận tốc 5/7·v' + 2/7·R(ω × z):
     hướng cuối đó là thứ người chơi cần để tính chỗ bi chủ chạy về. */
  function duDoan(viTri, cu) {
    const mp = moPhong(viTri, cu, true), duong = [], ca = mp.ca;
    let k = 0, bay = mp.bi[ca].tt === 3;
    if (bay) duong.push([viTri[ca][0], viTri[ca][1], 0]);
    while (!mp.xong && k++ < 20000) {
      buoc(mp);
      const c = mp.bi[ca];
      if (c.tt === 3) bay = true;
      if (bay && duong.length < 600 && c.tt >= 0) duong.push([c.x, c.y, c.z]);
    }
    const c = mp.bi[ca], kq = { loai: 'khong', x: c.x, y: c.y };
    if (bay) {                                                   // bi chủ bay: vẽ cả đường bay, chỗ chạm bàn
      kq.duong = duong;
      kq.chamBan = mp.sk.filter(s => s.k === 4 && s.a === ca && !s.go).map(s => [s.x, s.y]);
      const ra = mp.sk.find(s => s.k === 5 && s.a === ca);
      if (ra) { kq.x = ra.x; kq.y = ra.y; kq.ra = true; }
    }
    if (!mp.cham) return kq;
    const sk = mp.cham;
    kq.x = c.x; kq.y = c.y;
    const cuoi = (b) => { const fx = 5 / 7 * b.vx + 2 / 7 * R * b.wy, fy = 5 / 7 * b.vy - 2 / 7 * R * b.wx, n = Math.sqrt(fx * fx + fy * fy); return n > 1e-9 ? [fx / n, fy / n, n] : [0, 0, 0]; };
    if (sk.k === 1) {
      const o = mp.bi[sk.a === ca ? sk.b : sk.a], n = Math.sqrt(o.vx * o.vx + o.vy * o.vy) || 1;
      kq.loai = 'bi'; kq.so = o.so; kq.ox = o.x; kq.oy = o.y; kq.huongBi = [o.vx / n, o.vy / n, n];
      kq.huongCai = cuoi(c);
      kq.vCham = sk.v;
    } else if (sk.k === 2) { kq.loai = 'bang'; kq.huongCai = cuoi(c); }
    else { kq.loai = 'lo'; kq.lo = sk.lo; }
    return kq;
  }

  /* ======================================================================================================
     MÁY ĐÁNH. Liệt kê các cú vào được (bi đích × lỗ × chỗ ngắm trong miệng lỗ): đường bi đích tới lỗ và đường bi chủ tới
     chỗ chạm phải trống, góc cắt không quá 78°. Mỗi cú thử vài lực, vài kiểu xoáy, chạy mô phỏng thật rồi chấm: vào bi và
     không lỗi được điểm lớn, cộng thêm thế bi chủ cho cú sau. Không có cú nào ổn thì đánh phòng thủ: chạm bi hợp lệ rồi
     để bi chủ ở chỗ người kế khó đánh nhất. Ba mức: Dễ ngắm lệch nhiều, không tính thế bi chủ; Khó ngắm chuẩn, thử kỹ.
     ====================================================================================================== */
  const MUC = [
    { lech: 1.6, luc: 0.12, xoay: [0], luc3: [1.5, 2.6], thu: 0, giu: false },
    { lech: 0.6, luc: 0.06, xoay: [0, 0.32, -0.32], luc3: [1.3, 2, 3], thu: 2, giu: true },
    { lech: 0.18, luc: 0.03, xoay: [0, 0.35, -0.38, 0.15], luc3: [1.15, 1.6, 2.3, 3.2], thu: 4, giu: true },
  ];
  function diemNgam(K, lech) {                                 // chỗ ngắm trong miệng lỗ K, lech ∈ [−1, 1]
    const lo = LO[K], sau = lo.goc ? 0.025 : 0.012, nua = Math.max(0, lo.rong / 2 - R) * 0.55;
    return [lo.mx + lo.ax * sau - lo.ay * nua * lech, lo.my + lo.ay * sau + lo.ax * nua * lech];
  }
  function kcDoan(px, py, ax, ay, bx, by) {                    // khoảng cách điểm tới đoạn AB
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = ax + dx * t - px, ey = ay + dy * t - py;
    return Math.sqrt(ex * ex + ey * ey);
  }
  function trong(viTri, ax, ay, bx, by, bo1, bo2, kc) {
    for (let s = 0; s < 16; s++) {
      const q = viTri[s];
      if (q && s !== bo1 && s !== bo2 && kcDoan(q[0], q[1], ax, ay, bx, by) < kc) return false;
    }
    return true;
  }
  const trongBan = (x, y, m) => x >= R + m && x <= DAI - R - m && y >= R + m && y <= RONG - R - m;
  /* các cú vào được từ chỗ bi chủ (cx, cy): { s, K, huong, cat (cos góc cắt), dCai, dBi, de (dễ, 0–1) } */
  function cuVao(viTri, cx, cy, dich) {
    const ds = [];
    for (const s of dich) {
      const q = viTri[s];
      if (!q) continue;
      for (let K = 0; K < LO.length; K++) for (const lech of [0, -0.6, 0.6]) {
        const [ax, ay] = diemNgam(K, lech);
        let ux = ax - q[0], uy = ay - q[1];
        const dBi = Math.sqrt(ux * ux + uy * uy);
        if (dBi < 1e-6) continue;
        ux /= dBi; uy /= dBi;
        const lo = LO[K];
        if ((lo.mx - q[0]) * lo.ax + (lo.my - q[1]) * lo.ay < -0.01) continue;   // bi đã lọt quá miệng lỗ
        if (lo.moi.some(m => kcDoan(m[0], m[1], q[0], q[1], ax, ay) < R + 0.004)) continue;
        if (!trong(viTri, q[0], q[1], ax, ay, 0, s, D * 0.98)) continue;
        const gx = q[0] - ux * D, gy = q[1] - uy * D;
        if (!trongBan(gx, gy, -0.002)) continue;
        let hx = gx - cx, hy = gy - cy;
        const dCai = Math.sqrt(hx * hx + hy * hy);
        if (dCai < 1e-6) continue;
        hx /= dCai; hy /= dCai;
        const cat = hx * ux + hy * uy;
        if (cat < 0.2) continue;
        if (!trong(viTri, cx, cy, gx, gy, 0, s, D * 0.98)) continue;
        /* đường bi chủ không quẹt bi đích trước chỗ chạm */
        if (kcDoan(q[0], q[1], cx, cy, gx - hx * 0.002, gy - hy * 0.002) < D * 0.995) continue;
        const goc = lo.goc ? 1 : Math.max(0.15, Math.abs(ux * lo.ax + uy * lo.ay));   // lỗ giữa: vào xiên khó
        const de = cat * cat * goc / (1 + 0.9 * dCai + 1.1 * dBi) * (lech ? 0.85 : 1);
        ds.push({ s, K, huong: [hx, hy], cat, dCai, dBi, de });
      }
    }
    return ds.sort((a, b) => b.de - a.de);
  }
  /* lực cần để bi đích tới lỗ: bi đích nhận v·cos(cắt)·(1+e)/2, trượt rồi lăn; thêm biên cho chắc */
  function lucCan(c) {
    const vBi = Math.sqrt(2 * A_LAN * (c.dBi + 0.15)) * 1.6 + 0.25;
    return Math.min(VMAX, (vBi / (c.cat * (1 + E_BI) / 2)) * 1.05 + Math.sqrt(2 * A_LAN * c.dCai) * 1.2);
  }
  /* thế bi chủ cho cú sau của ghế P: cú dễ nhất (và cú dễ nhì) từ chỗ bi chủ */
  function theBiChu(the, P) {
    if (the.thang >= 0) return the.thang === P ? 3 : -3;
    if (!the.bi[0]) return 1.2;                                // được đặt bi chủ
    const ds = cuVao(the.bi, the.bi[0][0], the.bi[0][1], biNen(the, P));
    if (!ds.length) return 0;
    return ds[0].de + (ds[1] ? ds[1].de * 0.3 : 0);
  }
  function chamDiem(the, P, cu, kq, muc) {
    const { the: sau, bao } = apCu(the, cu, kq);
    if (sau.thang >= 0) return sau.thang === P ? 1000 : -1000;
    let them = 0;                                              // bida bài: hạ lá mình thì tốt, vào bi giúp người khác hạ lá thì dở
    if (bao.ha) for (const h of bao.ha) them += h[0] === P ? 60 * h[2] : -140 * h[2];
    if (bao.loi) return -300 - theBiChu(sau, sau.luot) * 100 + them;
    if (sau.luot === P) return 200 + (MUC[muc].giu ? theBiChu(sau, P) * 120 : 0) + bao.vao.length * 5 + them;
    return -60 - theBiChu(sau, sau.luot) * 150 + them;         // hết lượt: người kế càng khó đánh càng tốt
  }
  function thuCu(the, P, viTri, cu, muc) { return chamDiem(the, P, cu, danh(viTri, cu), muc); }
  /* lo cho bi 8: lỗ gần đường bi 8 sẽ chạy nhất */
  function loGan(viTri, cu) {
    const d = duDoan(viTri, cu);
    if (d.loai !== 'bi' || !d.huongBi) return 0;
    let tot = 0, nho = Infinity;
    for (let K = 0; K < LO.length; K++) {
      const lo = LO[K], dx = lo.mx - d.ox, dy = lo.my - d.oy, t = dx * d.huongBi[0] + dy * d.huongBi[1];
      const lech = t > 0 ? Math.abs(dx * d.huongBi[1] - dy * d.huongBi[0]) : Infinity;
      if (lech < nho) { nho = lech; tot = K; }
    }
    return tot;
  }
  /* máy bida 3 bi chấm một cú: chạy mô phỏng thật tới hết (y như danh), nhớ thêm bi chủ chạm bi nào, mấy băng trước bi thứ hai,
     và — lúc mới chạm một bi, đã đủ số băng luật đòi — bi chủ lướt sát bi còn lại tới đâu (gan: khe hở nhỏ nhất, mét) */
  function thuPhang(the, cu, can) {
    const mp = moPhong(viTriDanh(the, cu), cu), ca = mp.ca;
    let k = 0, bang = 0, mot = -1, hai = false, gan = Infinity;
    while (!mp.xong) {
      buoc(mp);
      for (; k < mp.sk.length && !hai; k++) {
        const e = mp.sk[k];
        if (e.k === 2 && e.a === ca) bang++;
        else if (e.k === 1 && (e.a === ca || e.b === ca)) { const o = e.a === ca ? e.b : e.a; if (mot < 0) mot = o; else if (o !== mot) hai = true; }
      }
      if (mot >= 0 && !hai && bang >= can) {
        const c = mp.bi[ca], o = mp.bi[3 - ca - mot], dx = c.x - o.x, dy = c.y - o.y, d2 = dx * dx + dy * dy;
        if (d2 < gan) gan = d2;
      }
    }
    return { kq: ketQua(mp), gan: gan === Infinity ? Infinity : Math.sqrt(gan) - D };
  }
  /* máy đánh bida 3 bi. Hướng thử: ngắm thẳng vào từng bi với nhiều độ dày (ăn mỏng, ăn dày — như người ngắm), cộng một vòng quét
     đều mọi hướng (cho cú băng trước). Chạy mô phỏng thật, chấm: ăn điểm; chạm đủ hai bi mà thiếu băng; suýt ăn (chạm một bi rồi
     lướt sát bi kia, càng sát càng cao); chạm được bi. Dễ: ít hướng × vài lực × một xoáy, thử hết. Vừa, Khó tìm hai vòng (bản đầu
     thử mọi hướng × mọi lực × mọi xoáy — Khó 2 700 lần mô phỏng, nghĩ 3,5–4,8 giây một cú trên máy tính; giờ 800–1 100 lần, ăn điểm
     như cũ): vòng 1 mọi hướng với một lực, một xoáy (Khó chơi 3 băng: hai xoáy, trái và phải, vì đường 3 băng ăn theo xoáy ngang);
     vòng 2 các hướng cao điểm nhất thử đủ lực, đủ xoáy. Cú ăn điểm nằm trong khe rất hẹp, nên chưa ăn thì lấy mấy cú tốt nhất
     nhích thêm ±0,5°, ±1°; rồi tay lệch chút như người */
  function timCuPhang(the, P, muc, rnd) {
    const M = MUC[muc] || MUC[1], ca = caCua(the), can = the.luat === 3 ? 3 : the.luat === 1 ? 1 : 0, c = the.bi[ca];
    const soHuong = muc >= 2 ? 270 : muc === 1 ? 144 : 48, goc0 = rnd() * 6.2832 / soHuong;
    const lucs = can === 3 ? [3.4, 4.6, 5.8] : can === 1 ? [2.4, 3.4, 4.4] : [1.6, 2.4, 3.4];
    const xoays = muc >= 2 ? [[0, 0.2], [0.3, 0.1], [-0.3, 0.1], [0, -0.25]] : muc === 1 ? [[0, 0.2], [0.3, 0], [-0.3, 0]] : [[0, 0.15]];
    const huong = [];
    for (let k = 0; k < soHuong; k++) { const g = goc0 + k * 6.2832 / soHuong; huong.push([Math.cos(g), Math.sin(g)]); }
    for (let s = 0; s < 3; s++) {
      const q = the.bi[s];
      if (s === ca || !q) continue;
      const ux = q[0] - c[0], uy = q[1] - c[1], n = Math.sqrt(ux * ux + uy * uy);
      for (let f = -0.95; f <= 0.951; f += muc >= 1 ? 0.1 : 0.19) {
        const tx = q[0] - uy / n * f * D - c[0], ty = q[1] + ux / n * f * D - c[1], m = Math.sqrt(tx * tx + ty * ty);
        huong.push([tx / m, ty / m]);
      }
    }
    const thu = (dx, dy, v, a, b) => {
      const cu = { dx, dy, v, a, b, ca }, { kq, gan } = thuPhang(the, cu, can), { the: sau, bao } = apCu(the, cu, kq);
      const suyt = !kq.hai && gan < 0.3 ? 120 * (1 - Math.max(0, gan) / 0.3) : 0;
      return { cu, d: (sau.thang === P && the.so > 1 ? 2000 : 0) + (bao.diem ? 1000 : 0) - (bao.loi ? 400 : 0) + (kq.hai ? 100 + Math.min(can, kq.bangHai) * 30 : kq.dau >= 0 ? 10 + suyt : 0) + rnd() * 8 };
    };
    let ds = [];
    if (muc < 1) for (const [dx, dy] of huong) for (const v of lucs) for (const [a, b] of xoays) ds.push(thu(dx, dy, v, a, b));
    else {
      const v1 = lucs[1], x1 = can === 3 && muc >= 2 ? [xoays[1], xoays[2]] : [xoays[0]], K = muc >= 2 ? 36 : 20;
      for (const [dx, dy] of huong) for (const [a, b] of x1) ds.push(thu(dx, dy, v1, a, b));
      ds.sort((x, y) => y.d - x.d);
      const daCo = new Set(), chon = [];
      for (const g of ds) { const k = g.cu.dx + ',' + g.cu.dy; if (!daCo.has(k)) { daCo.add(k); chon.push(g); if (chon.length >= K) break; } }
      for (const g of chon) for (const v of lucs) for (const [a, b] of xoays) if (v !== v1 || !x1.some(x => x[0] === a && x[1] === b)) ds.push(thu(g.cu.dx, g.cu.dy, v, a, b));
    }
    ds.sort((x, y) => y.d - x.d);
    let tot = ds[0];
    const xoay = (x, lech) => { const r = lech * Math.PI / 180, cs = Math.cos(r), sn = Math.sin(r); return [x.dx * cs - x.dy * sn, x.dx * sn + x.dy * cs]; };
    if (tot.d < 1000) for (const g of ds.slice(0, muc >= 2 ? 8 : 4)) for (const lech of [0.5, -0.5, 1, -1]) {
      const [dx, dy] = xoay(g.cu, lech), k = thu(dx, dy, g.cu.v, g.cu.a, g.cu.b);
      if (k.d > tot.d) tot = k;
    }
    /* cú chắc tay: với mấy cú ăn điểm tốt nhất, thử lệch −0,8° … 0,8°; lấy cú có dải lệch liền nhau vẫn ăn dài nhất, ngắm vào giữa dải */
    if (tot.d >= 1000 && muc >= 1) {
      let chac = null;
      for (const g of ds.filter(x => x.d >= 1000).slice(0, muc >= 2 ? 6 : 3).concat(ds.includes(tot) ? [] : [tot])) {
        const an = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map(l => { const [dx, dy] = xoay(g.cu, l); return thu(dx, dy, g.cu.v, g.cu.a, g.cu.b).d >= 1000 ? l : null; });
        let dau = -1, dai = 0, tDau = -1, tDai = 0;
        an.forEach((l, k) => { if (l === null) { dau = -1; return; } if (dau < 0) dau = k; if (k - dau + 1 > tDai) { tDai = k - dau + 1; tDau = dau; } });
        if (tDai && (!chac || tDai > chac.dai)) { const giua = (an[tDau] + an[tDau + tDai - 1]) / 2, [dx, dy] = xoay(g.cu, giua); chac = { dai: tDai, cu: Object.assign({}, g.cu, { dx, dy }), d: g.d }; }
      }
      if (chac) tot = chac;
    }
    const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / Math.sqrt(0.5); };
    const lech = gauss() * M.lech * 0.6 * Math.PI / 180, cl = Math.cos(lech), sl = Math.sin(lech), cu = tot.cu;
    return Object.assign({}, cu, { dx: cu.dx * cl - cu.dy * sl, dy: cu.dx * sl + cu.dy * cl, v: Math.max(0.3, Math.min(VMAX, cu.v * (1 + gauss() * M.luc))) });
  }
  function timCu(the, P, muc, rnd) {
    rnd = rnd || Math.random;
    if (the.kieu === 3) return timCuPhang(the, P, muc, rnd);
    const M = MUC[muc] || MUC[1];
    const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / Math.sqrt(0.5); };
    const lamNhieu = (cu) => {                                 // tay người: lệch chút ít
      const g = gauss() * M.lech * Math.PI / 180, c = Math.cos(g), s = Math.sin(g);
      return Object.assign({}, cu, { dx: cu.dx * c - cu.dy * s, dy: cu.dx * s + cu.dy * c, v: Math.max(0.2, Math.min(VMAX, cu.v * (1 + gauss() * M.luc))) });
    };
    if (the.pha) {
      const y = RONG / 2 + (rnd() - 0.5) * 0.16, x = KE_DAU - 0.02 - rnd() * 0.1;
      const tx = CHAM_CHAN[0] - x, ty = CHAM_CHAN[1] + (rnd() - 0.5) * 0.004 - y, n = Math.sqrt(tx * tx + ty * ty);
      return lamNhieu({ dx: tx / n, dy: ty / n, v: 7.6 + rnd() * 1.2, a: 0, b: -0.18, cx: x, cy: y });
    }
    const dich = biNen(the, P), toi8 = denBi8(the, P);
    /* chỗ đặt bi chủ (được đặt tự do): sau mỗi cú vào được của bi đích, thẳng hay xiên chút */
    let cho = [];
    if (the.tuDo || !the.bi[0]) {
      for (const s of dich) {
        const q = the.bi[s];
        for (let K = 0; K < LO.length; K++) {
          const [ax, ay] = diemNgam(K, 0);
          let ux = ax - q[0], uy = ay - q[1];
          const n = Math.sqrt(ux * ux + uy * uy); ux /= n; uy /= n;
          if (!trong(the.bi, q[0], q[1], ax, ay, 0, s, D * 0.98)) continue;
          for (const [kc, xien] of [[0.22, 0], [0.32, 0.25], [0.32, -0.25], [0.45, 0.12]]) {
            const x = q[0] - ux * (D + kc) + uy * kc * xien, y = q[1] - uy * (D + kc) - ux * kc * xien;
            if (datDuoc(the, x, y)) cho.push([tron4(x), tron4(y)]);
          }
        }
      }
      if (!cho.length) for (let k = 0; k < 400 && cho.length < 6; k++) {
        const x = R + rnd() * ((the.tuDo === 2 ? KE_DAU : DAI) - 2 * R), y = R + rnd() * (RONG - 2 * R);
        if (datDuoc(the, x, y)) cho.push([tron4(x), tron4(y)]);
      }
      cho = cho.map(c => { const v = the.bi.slice(); v[0] = c; const ds = cuVao(v, c[0], c[1], dich); return { c, de: ds.length ? ds[0].de : 0 }; })
        .sort((a, b) => b.de - a.de).slice(0, muc >= 2 ? 5 : 3).map(x => x.c);
    } else cho = [the.bi[0]];
    let tot = null;
    for (const c of cho) {
      const viTri = the.bi.slice(); viTri[0] = c;
      const datBi = the.tuDo || !the.bi[0] ? { cx: c[0], cy: c[1] } : {};
      const ds = cuVao(viTri, c[0], c[1], dich).slice(0, muc >= 2 ? 10 : 6);
      for (const ca of ds) for (const lucK of M.luc3) for (const b of M.xoay) {
        const cu = Object.assign({ dx: ca.huong[0], dy: ca.huong[1], v: Math.min(VMAX, lucCan(ca) * lucK * 0.8), a: 0, b }, datBi, toi8 ? { lo: ca.K } : {});
        const d = thuCu(the, P, viTri, cu, muc) + ca.de * 40;
        if (!tot || d > tot.d) tot = { cu, d, de: ca.de };
      }
    }
    /* thử lại vài cú tốt nhất với tay lệch chút: cú nào lệch là trượt thì bớt điểm */
    if (tot && M.thu && tot.d > 100) {
      let lan = 0, truot = 0;
      for (const g of [0.25, -0.25, 0.5, -0.5].slice(0, M.thu)) {
        const c = Math.cos(g * Math.PI / 180), s = Math.sin(g * Math.PI / 180), cu = Object.assign({}, tot.cu, { dx: tot.cu.dx * c - tot.cu.dy * s, dy: tot.cu.dx * s + tot.cu.dy * c });
        lan++; if (thuCu(the, P, viTriDanh(the, cu.cx != null ? cu : null), cu, muc) < 100) truot++;
      }
      tot.d -= truot / lan * 250;
    }
    /* phòng thủ: chạm bi hợp lệ thật nhẹ rồi để bi chủ ở chỗ khó */
    if (!tot || tot.d < 120) {
      const c = cho[0], viTri = the.bi.slice(); viTri[0] = c;
      const datBi = the.tuDo || !the.bi[0] ? { cx: c[0], cy: c[1] } : {};
      for (const s of dich) {
        const q = viTri[s];
        let ux = q[0] - c[0], uy = q[1] - c[1];
        const n = Math.sqrt(ux * ux + uy * uy); ux /= n; uy /= n;
        for (const lech of [0, 0.5, -0.5, 0.85, -0.85]) {
          /* chạm bi đích ở chỗ lệch tâm lech·D: ngắm vào điểm cách tâm bi đích theo phương vuông góc */
          const tx = q[0] + uy * lech * D * 0.98 - c[0], ty = q[1] - ux * lech * D * 0.98 - c[1], m = Math.sqrt(tx * tx + ty * ty);
          for (const v of [0.7, 1.1, 1.7, 2.6]) {
            const cu = Object.assign({ dx: tx / m, dy: ty / m, v, a: 0, b: 0 }, datBi);
            if (toi8) cu.lo = loGan(viTri, cu);
            const d = thuCu(the, P, viTri, cu, muc);
            if (!tot || d > tot.d) tot = { cu, d, de: 0 };
          }
        }
      }
    }
    if (!tot) {                                                // không còn đường nào: đánh thẳng vào bi đích
      const c = cho[0] || the.bi[0], q = the.bi[dich[0]] || [DAI / 2, RONG / 2];
      const tx = q[0] - c[0], ty = q[1] - c[1], n = Math.sqrt(tx * tx + ty * ty) || 1;
      tot = { cu: Object.assign({ dx: tx / n, dy: ty / n, v: 2.5, a: 0, b: 0 }, the.tuDo || !the.bi[0] ? { cx: c[0], cy: c[1] } : {}, toi8 ? { lo: 0 } : {}) };
    }
    const cu = lamNhieu(tot.cu);
    if (toi8 && cu.lo == null) cu.lo = loGan(viTriDanh(the, cu.cx != null ? cu : null), cu);
    return cu;
  }

  return { PHANG, R, D, DAI, RONG, DT, VMAX, KE_DAU, CHAM_CHAN, LO, BANG, MIENG_GOC, MIENG_GIUA, E_BI, A_LAN, A_TRUOT, caCua,
    taoBi, moPhong, buoc, chayHet, ketQua, danh, maCu, docCu, maKq, docKq, xepBi, mulberry32, nhomCua, theMoi, chepThe,
    datDuoc, datLai, thapNhat, conNhom, biDich, biNen, soLa, denBi8, apCu, cuHopLe, kqHopLe, viTriDanh, duDoan, cuVao, timCu, loGan, maSat, vaBang, vaBi };
}

/* hai lõi: bàn lỗ (8 bi, 9 bi, bida bài) và bàn phăng (bida 3 bi); L là lõi của ván đang chơi */
const L15 = LOI(), L3 = LOI({ phang: true });
let L = L15;

/* ======================================================================================================
   MÁY NGHĨ Ở LUỒNG RIÊNG: dựng Web Worker từ chính mã lõi (LOI viết tự chứa), khỏi tải tệp nào thêm — chạy được cả khi
   mất mạng. Không tạo được Worker thì nghĩ ngay trên luồng chính.
   ====================================================================================================== */
let tho = null, viec = 0;
const choViec = new Map();
function taoTho() {
  if (tho || typeof Worker !== 'function' || typeof Blob !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  try {
    const ma = `const LOI=${LOI.toString()};const LS=[LOI(),LOI({phang:true})];onmessage=e=>{const d=e.data;postMessage({so:d.so,cu:LS[d.phang?1:0].timCu(d.the,d.P,d.muc)});};`;
    tho = new Worker(URL.createObjectURL(new Blob([ma], { type: 'text/javascript' })));
    tho.onmessage = (e) => { const f = choViec.get(e.data.so); choViec.delete(e.data.so); if (f) f(e.data.cu); };
    tho.onerror = () => { tho = null; };
  } catch (e) { tho = null; }
}
/* bỏ việc máy đang nghĩ (ván mới, rời phòng): luồng nghĩ đang bận thì dựng lại cho khỏi phải chờ */
function boViec() {
  viec++;
  if (van) van.doiMay = false;
  mayNgam = null;
  if (choViec.size && tho) { tho.terminate(); tho = null; choViec.clear(); taoTho(); }
}
function mayNghi(P, xong) {
  const so = ++viec, the = L.chepThe(van.the), muc = mucMay(P), batDau = Date.now();
  const tra = (cu) => setTimeout(() => { if (so === viec && cu) xong(cu); }, Math.max(0, 450 - (Date.now() - batDau)));
  if (tho) { choViec.set(so, tra); tho.postMessage({ so, the, P, muc, phang: L.PHANG }); }
  else setTimeout(() => tra(L.timCu(the, P, muc)), 30);
}

/* ======================================================================================================
   GIAO DIỆN
   ====================================================================================================== */
const TEN_MAY = ['Sóc', 'Cú', 'Cáo'];
/* bàn tặng: trang nào đặt self.TDTD_BIDA_CHU_DE trước khi nạp tệp này (xem bida-anh-bien/index.html) thì trò mang tên
   người chơi, tên máy, màu nỉ, ảnh in mờ trên nỉ, màu chấm bi chủ, lời trêu, pháo giấy khi thắng. Không
   đặt thì như cũ. { ten, goi (cách gọi trong câu), tieuDe, may: [ba tên], ni: [giữa, mép], bang: [ba màu băng], vienBang,
     anhNi, anhNiMo, anhNiCat, chuThayAnh (alt của ảnh ở bảng chào), chamBiChu: [r, g, b],
     loi: { vao, chuoi, tam, loi, truot, thang, thua } } */
const chuDe = () => (typeof self !== 'undefined' && self.TDTD_BIDA_CHU_DE) || null;
const tenMay = () => (chuDe() && chuDe().may) || TEN_MAY;
const tenBan = () => (chuDe() && chuDe().ten) || 'Bạn';
const goiBan = () => (chuDe() && chuDe().goi) || 'bạn';
const chon1 = (ds) => (ds && ds.length ? ds[Math.floor(Math.random() * ds.length)] : '');
const KHO = ['Dễ', 'Vừa', 'Khó'];
const KHOA = 'tdtd.bida';
const docLuu = () => { try { const o = JSON.parse(localStorage.getItem(KHOA) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const ghiLuu = (them) => { try { localStorage.setItem(KHOA, JSON.stringify(Object.assign(docLuu(), them))); } catch (e) {} };
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* màu bi theo bộ Aramith: 1 vàng, 2 xanh dương, 3 đỏ, 4 tím, 5 cam, 6 xanh lá, 7 nâu đỏ, 8 đen; 9–15 sọc cùng màu 1–7 */
const MAU_BI = ['#f4f1e8', '#f3bf12', '#1b4fb4', '#d4291e', '#56288c', '#f06c15', '#0d7a44', '#7b1e1a', '#151515',
  '#f3bf12', '#1b4fb4', '#d4291e', '#56288c', '#f06c15', '#0d7a44', '#7b1e1a'];
const NGA = [246, 243, 233];                                          // màu trắng ngà của bi
const VIEN = 0.092, BANG_DAY = 0.042;                                 // khung gỗ, băng cao su (m, chỉ để vẽ)
const TRAI = 36, PHAI = 46, LE = 6;                                    // dải tinh chỉnh (trái), thanh lực (phải), lề
const LY_DO = {
  '8dung': 'vào bi 8 đúng lỗ đã chọn', '8som': 'bi 8 vào khi nhóm bi chưa hết', '8loi': 'bi 8 vào cùng cú phạm lỗi',
  '8sai': 'bi 8 vào sai lỗ đã chọn', '9dung': 'vào bi 9', '9pha': 'bi 9 vào ngay cú phá', het: 'hết bi trên bàn',
  '8ra': 'đánh bi 8 bay khỏi bàn', baiHet: 'hạ hết bài', baiKe: 'hạ hết bài nhờ cú của người khác', du: 'đủ điểm', duoi: 'thắng vì đối thủ rời bàn',
};
const TEN_LOI = {
  cai: 'bi chủ rơi lỗ', khong: 'bi chủ không chạm bi nào', sai: 'chạm sai bi trước', dau8: 'bàn còn mở mà chạm bi 8 trước',
  bang: 'chạm bi xong không bi nào chạm băng hay vào lỗ', pha: 'phá chưa đạt — phải có bi vào lỗ hay ít nhất 4 bi chạm băng',
  caiRa: 'bi chủ bay khỏi bàn', ra: 'đánh bi bay khỏi bàn', do: 'khai cuộc phải chạm bi đỏ trước',
};
const TEN_LO = ['góc dưới trái', 'giữa dưới', 'góc dưới phải', 'góc trên phải', 'giữa trên', 'góc trên trái'];

let tam = null, canh = null, cv = null, ctx = null, W = 360, H = 520, DPR = 1, raf = 0, banAnh = null;
let ban = { k: 100, doc: true, x0: 0, y0: 0, w: 0, h: 0 };
let van = null;                                                       // ván đang chơi
let dang = null;                                                      // cú đang chạy (hình động)
let mayNgam = null;                                                   // máy (hay người ở máy khác) đang ngắm, kéo cơ
let ngam = { goc: 0, luc: 0, a: 0, b: 0, nang: 0, lo: -1, loTay: false, cx: 0, cy: 0, keo: null, du: null, duKhoa: '', tinh: 0 };
let coTieng = true, am = null, baoHen = 0;

/* ---------- toạ độ: bàn (mét, gốc ở góc lỗ 0) ↔ màn hình ----------
   Màn hình đứng thì bàn dựng dọc, đầu bàn (chỗ phá) ở dưới; màn hình ngang thì bàn nằm ngang, đầu bàn bên trái. Cả hai là
   phép quay (không lật), nhìn từ trên xuống: xoáy phải vẫn là phải. */
function doCo() {
  if (!tam || !cv) return;
  const k = canh.getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2.5); W = Math.max(240, k.width || 360); H = Math.max(240, k.height || 520);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  /* bàn dọc hay ngang: chiều nào cho bàn to hơn (khung gần vuông — như có dải bài bida bài — thì vẫn dọc nếu dọc to hơn) */
  const dai = L.DAI + 2 * VIEN, rong = L.RONG + 2 * VIEN, rongCho = W - TRAI - PHAI - 2 * LE;
  const kDoc = Math.min(rongCho / rong, (H - 2 * LE) / dai), kNgang = Math.min(rongCho / dai, (H - 2 * LE) / rong), doc = kDoc >= kNgang;
  const kk = doc ? kDoc : kNgang;
  const bw = (doc ? rong : dai) * kk, bh = (doc ? dai : rong) * kk;
  ban = { k: kk, doc, x0: TRAI + LE + (rongCho - bw) / 2, y0: (H - bh) / 2, w: bw, h: bh };
  banAnh = null; LUOI = null;
  for (const o of anhBi) o.kt = 0;
}
function raMH(x, y) {
  return ban.doc ? [ban.x0 + (VIEN + L.RONG - y) * ban.k, ban.y0 + (VIEN + L.DAI - x) * ban.k]
                 : [ban.x0 + (VIEN + x) * ban.k, ban.y0 + (VIEN + L.RONG - y) * ban.k];
}
function vaoBan(X, Y) {
  return ban.doc ? [L.DAI + VIEN - (Y - ban.y0) / ban.k, L.RONG + VIEN - (X - ban.x0) / ban.k]
                 : [(X - ban.x0) / ban.k - VIEN, L.RONG + VIEN - (Y - ban.y0) / ban.k];
}
function heBan(g) {                                                   // vẽ bằng toạ độ bàn (mét)
  const k = ban.k * DPR;
  if (ban.doc) g.setTransform(0, -k, -k, 0, (ban.x0 + (VIEN + L.RONG) * ban.k) * DPR, (ban.y0 + (VIEN + L.DAI) * ban.k) * DPR);
  else g.setTransform(k, 0, 0, -k, (ban.x0 + VIEN * ban.k) * DPR, (ban.y0 + (VIEN + L.RONG) * ban.k) * DPR);
}

/* ---------- bàn: vẽ một lần vào ảnh riêng, mỗi khung chỉ dán lại ---------- */
function moiTheo(lo, mx, my) {                                        // mặt hàm của lỗ có mỏm tại (mx, my)
  for (const lo2 of L.LO) for (const s of lo2.ham) if (Math.abs(s.ax - mx) < 1e-9 && Math.abs(s.ay - my) < 1e-9) return s;
  return null;
}
function veBanTinh() {
  if (!cv || typeof document === 'undefined') return;
  const c = document.createElement('canvas');
  c.width = cv.width; c.height = cv.height;
  const g = c.getContext && c.getContext('2d');
  if (!g || !g.setTransform) return;
  heBan(g);
  const D_ = L.DAI, R_ = L.RONG, B = BANG_DAY, V = VIEN, px = 1 / ban.k;
  const hcn = (x0, y0, x1, y1, r) => { g.beginPath(); g.moveTo(x0 + r, y0); g.lineTo(x1 - r, y0); g.quadraticCurveTo(x1, y0, x1, y0 + r); g.lineTo(x1, y1 - r); g.quadraticCurveTo(x1, y1, x1 - r, y1); g.lineTo(x0 + r, y1); g.quadraticCurveTo(x0, y1, x0, y1 - r); g.lineTo(x0, y0 + r); g.quadraticCurveTo(x0, y0, x0 + r, y0); g.closePath(); };
  /* bóng đổ của cả bàn */
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18 * DPR; g.shadowOffsetY = 0;
  hcn(-V, -V, D_ + V, R_ + V, 0.05); g.fillStyle = '#3b2212'; g.fill(); g.restore();
  /* khung gỗ */
  const go = g.createLinearGradient(0, -V, 0, R_ + V);
  go.addColorStop(0, '#6a3d22'); go.addColorStop(0.5, '#4d2b16'); go.addColorStop(1, '#6a3d22');
  hcn(-V, -V, D_ + V, R_ + V, 0.05); g.fillStyle = go; g.fill();
  g.lineWidth = 1.2 * px; g.strokeStyle = 'rgba(255,214,160,.28)'; hcn(-V + 0.008, -V + 0.008, D_ + V - 0.008, R_ + V - 0.008, 0.045); g.stroke();
  /* nỉ (cả phần dưới băng), sáng ở giữa */
  const cd = chuDe(), niMau = (cd && cd.ni) || (L.PHANG ? ['#2e6fb5', '#1c4a80'] : ['#1f8a5a', '#125c3b']);
  const bangMau = (cd && cd.bang) || (L.PHANG ? ['#2b67a8', '#22568f', '#163c66'] : ['#1d8456', '#166c46', '#0f5233']);
  const ni = g.createRadialGradient(D_ / 2, R_ / 2, 0.1, D_ / 2, R_ / 2, D_ * 0.62);
  ni.addColorStop(0, niMau[0]); ni.addColorStop(1, niMau[1]);
  g.fillStyle = ni; g.fillRect(-B, -B, D_ + 2 * B, R_ + 2 * B);
  if (cd && cd.anhNi) veAnhNi(g, cd);
  /* lỗ: khoét vào khung gỗ (không tràn ra ngoài khung), viền da tối, hố đen */
  g.save(); hcn(-V, -V, D_ + V, R_ + V, 0.05); g.clip();
  for (const lo of L.LO) {
    g.beginPath(); g.arc(lo.hx, lo.hy, lo.rHo + 0.016, 0, 6.2832); g.fillStyle = '#20140c'; g.fill();
    const gr = g.createRadialGradient(lo.hx, lo.hy, lo.rHo * 0.2, lo.hx, lo.hy, lo.rHo + 0.004);
    gr.addColorStop(0, '#000'); gr.addColorStop(0.8, '#050505'); gr.addColorStop(1, '#17100a');
    g.beginPath(); g.arc(lo.hx, lo.hy, lo.rHo + 0.004, 0, 6.2832); g.fillStyle = gr; g.fill();
  }
  g.restore();
  /* băng: từ mũi băng ra B, hai đầu cắt theo mặt hàm */
  for (const s of L.BANG) {
    const dau = (mx, my) => { const h = moiTheo(null, mx, my); if (!h) return [mx - s.nx * B, my - s.ny * B]; const fn = -(h.ex * s.nx + h.ey * s.ny), l = B / Math.max(0.2, fn); return [mx + h.ex * l, my + h.ey * l]; };
    const a2 = dau(s.ax, s.ay), b2 = dau(s.bx, s.by);
    g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.lineTo(b2[0], b2[1]); g.lineTo(a2[0], a2[1]); g.closePath();
    const gb = g.createLinearGradient(s.ax, s.ay, s.ax - s.nx * B, s.ay - s.ny * B);
    gb.addColorStop(0, bangMau[0]); gb.addColorStop(0.35, bangMau[1]); gb.addColorStop(1, bangMau[2]);
    g.fillStyle = gb; g.fill();
    g.beginPath(); g.moveTo(s.ax, s.ay); g.lineTo(s.bx, s.by); g.lineWidth = 1.4 * px; g.strokeStyle = (cd && cd.vienBang) || 'rgba(160,240,190,.35)'; g.stroke();
  }
  /* hàm lỗ: viền da ở hai mặt hàm */
  for (const lo of L.LO) for (const h of lo.ham) {
    g.beginPath(); g.moveTo(h.ax, h.ay); g.lineTo(h.bx, h.by); g.lineWidth = 2 * px; g.strokeStyle = 'rgba(0,0,0,.55)'; g.stroke();
  }
  /* chấm ngắm trên khung: mỗi cạnh dài 6 chấm (cách 1/8), cạnh ngắn 3 chấm */
  const cham = (x, y) => { g.beginPath(); g.moveTo(x, y + 0.009); g.lineTo(x + 0.006, y); g.lineTo(x, y - 0.009); g.lineTo(x - 0.006, y); g.closePath(); g.fillStyle = '#efe6cf'; g.fill(); };
  const xa = B + (V - B) / 2;
  for (const i of [1, 2, 3, 5, 6, 7]) { cham(D_ * i / 8, -xa); cham(D_ * i / 8, R_ + xa); }
  for (const j of [1, 2, 3]) { cham(-xa, R_ * j / 4); cham(D_ + xa, R_ * j / 4); }
  /* chấm chân bàn, chấm đầu bàn */
  for (const [x, y] of [L.CHAM_CHAN, [L.KE_DAU, R_ / 2]]) { g.beginPath(); g.arc(x, y, 0.006, 0, 6.2832); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); }
  banAnh = c;
}
/* bàn tặng: ảnh in mờ lên mặt nỉ như nỉ in hình thật — đứng thẳng trên màn hình dù bàn dọc hay ngang, lấy độ sáng của
   ảnh, giữ màu nỉ (hoà kiểu luminosity), chỉ trong mặt nỉ. Ảnh tải xong thì vẽ lại bàn. */
let anhNi = null;
function veAnhNi(g, cd) {
  if (!anhNi) {
    if (typeof Image !== 'function') return;
    anhNi = new Image();
    anhNi.onload = () => { banAnh = null; };
    anhNi.src = cd.anhNi;
    return;
  }
  if (!anhNi.complete || !anhNi.naturalWidth) return;
  const [x0, y0] = raMH(0, L.RONG), [x1, y1] = raMH(L.DAI, 0);
  const l = Math.min(x0, x1) * DPR, t = Math.min(y0, y1) * DPR, w = Math.abs(x1 - x0) * DPR, h = Math.abs(y1 - y0) * DPR;
  /* anhNiCat [x, y, rộng, cao] (phần của ảnh): chỉ in một khúc — như bỏ đáy ảnh có bi in sẵn, kẻo lẫn với bi thật */
  const [cx, cy, cw, ch] = cd.anhNiCat || [0, 0, 1, 1], sx = cx * anhNi.naturalWidth, sy = cy * anhNi.naturalHeight, sw = cw * anhNi.naturalWidth, sh = ch * anhNi.naturalHeight;
  const ti = Math.min(w / sw, h / sh), iw = sw * ti, ih = sh * ti;
  /* mép ảnh mờ dần vào nỉ (không thành một tấm dán có cạnh): vẽ ra ảnh riêng, khoét viền bằng dải trong suốt */
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(iw)); c.height = Math.max(1, Math.round(ih));
  const m = c.getContext && c.getContext('2d');
  if (!m || !m.drawImage) return;
  m.drawImage(anhNi, sx, sy, sw, sh, 0, 0, c.width, c.height);
  m.globalCompositeOperation = 'destination-in';
  const mo = (x0, y0, x1, y1) => { const gr = m.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.16, '#000'); gr.addColorStop(0.84, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); return gr; };
  m.fillStyle = mo(0, 0, 0, c.height); m.fillRect(0, 0, c.width, c.height);
  m.fillStyle = mo(0, 0, c.width, 0); m.fillRect(0, 0, c.width, c.height);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.beginPath(); g.rect(l, t, w, h); g.clip();
  g.globalAlpha = cd.anhNiMo || 0.25;
  g.globalCompositeOperation = 'luminosity';
  g.drawImage(c, l + (w - iw) / 2, t + (h - ih) / 2);
  g.restore();
}

/* ---------- bi vẽ từng điểm ảnh: cầu có xoay thật, số in hai mặt, sọc, bóng sáng ----------
   Mỗi bi giữ một hướng (quaternion), quay theo đúng vận tốc góc của vật lý: bi lăn thì số lăn theo, bi trượt (đánh đâm)
   thì số đứng yên trên mặt bi. Mỗi khung chỉ tô lại bi đang quay; ánh sáng, độ phủ mép tính sẵn theo cỡ bi. */
const anhBi = [];
let LUOI = null, MAT_SO = null;
const NS = 48, COS_SO = 0.9, SIN_SO = Math.sqrt(1 - COS_SO * COS_SO);
const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const RGB_BI = MAU_BI.map(hexRGB);
const RGB_PHANG = [NGA, [242, 196, 38], [204, 30, 34]], TEN_BI3 = ['trắng', 'vàng', 'đỏ'];
function quatNgauNhien(r) {
  const u1 = r(), u2 = r() * 6.2832, u3 = r() * 6.2832, a = Math.sqrt(1 - u1), b = Math.sqrt(u1);
  return [a * Math.sin(u2), a * Math.cos(u2), b * Math.sin(u3), b * Math.cos(u3)];
}
function khoiBi() {
  if (anhBi.length) return;
  const r = L.mulberry32(20261016);
  for (let i = 0; i < 16; i++) anhBi.push({ c: null, g: null, img: null, q: quatNgauNhien(r), kt: 0, ban: true });
}
function taoMatSo() {
  MAT_SO = [];
  if (typeof document === 'undefined') return;
  const c = document.createElement('canvas'); c.width = c.height = NS;
  const g = c.getContext && c.getContext('2d');
  for (let n = 1; n <= 15; n++) {
    const m = new Float32Array(NS * NS);
    MAT_SO[n] = m;
    if (!g || !g.getImageData) continue;
    g.clearRect(0, 0, NS, NS); g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `bold ${n >= 10 ? 27 : 33}px "Helvetica Neue", Arial, sans-serif`;
    g.fillText(String(n), NS / 2, NS / 2 + 2);
    if (n === 6 || n === 9) g.fillRect(NS / 2 - 7, NS / 2 + 15, 14, 3);   // gạch dưới cho khỏi nhầm 6 với 9
    const d = g.getImageData(0, 0, NS, NS).data;
    if (d) for (let i = 0; i < NS * NS; i++) m[i] = d[i * 4 + 3] / 255;
  }
}
/* lưới tính sẵn theo cỡ bi rp (điểm ảnh thiết bị): pháp tuyến theo toạ độ bàn, độ sáng, ánh bóng, độ phủ mép */
function taoLuoi(rp) {
  const S = Math.ceil(rp * 2) + 2, n = S * S, nb = new Float32Array(n * 3), sh = new Float32Array(n), sp = new Float32Array(n), al = new Uint8ClampedArray(n);
  const lx = -0.38, ly = 0.52, lz = 0.76, ln = Math.sqrt(lx * lx + ly * ly + lz * lz), Lx = lx / ln, Ly = ly / ln, Lz = lz / ln;
  const hx = Lx, hy = Ly, hz = Lz + 1, hn = Math.sqrt(hx * hx + hy * hy + hz * hz), Hx = hx / hn, Hy = hy / hn, Hz = hz / hn;
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const i = py * S + px, sx = (px + 0.5 - S / 2) / rp, sy = (py + 0.5 - S / 2) / rp, d2 = sx * sx + sy * sy;
    const dd = Math.sqrt(d2);
    al[i] = Math.max(0, Math.min(1, (1 - dd) * rp + 0.5)) * 255;
    if (!al[i]) continue;
    const z = Math.sqrt(Math.max(0, 1 - Math.min(1, d2))), U = sx, V = -sy;
    if (ban.doc) { nb[i * 3] = V; nb[i * 3 + 1] = -U; } else { nb[i * 3] = U; nb[i * 3 + 1] = V; }
    nb[i * 3 + 2] = z;
    const dif = Math.max(0, U * Lx + V * Ly + z * Lz);
    let s = Math.max(0, U * Hx + V * Hy + z * Hz); s *= s; s *= s; s *= s; s *= s; s *= s;
    sh[i] = 0.34 + 0.7 * dif - 0.12 * Math.pow(1 - z, 3);
    sp[i] = s * 0.9 + Math.pow(1 - z, 4) * 0.08;
  }
  LUOI = { rp, S, nb, sh, sp, al };
}
function laySo(m, u, v) {                                             // lấy mực của chữ số, nội suy song tuyến
  const x = (u * 0.5 + 0.5) * NS - 0.5, y = (v * 0.5 + 0.5) * NS - 0.5, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const at = (a, b) => (a < 0 || b < 0 || a >= NS || b >= NS ? 0 : m[b * NS + a]);
  return at(x0, y0) * (1 - fx) * (1 - fy) + at(x0 + 1, y0) * fx * (1 - fy) + at(x0, y0 + 1) * (1 - fx) * fy + at(x0 + 1, y0 + 1) * fx * fy;
}
function veAnhBi(i) {
  const o = anhBi[i], G = LUOI;
  if (!G || typeof document === 'undefined') return;
  if (!o.c || o.c.width !== G.S) {
    o.c = document.createElement('canvas'); o.c.width = o.c.height = G.S;
    o.g = o.c.getContext && o.c.getContext('2d');
    o.img = o.g && o.g.createImageData ? o.g.createImageData(G.S, G.S) : null;
  }
  if (!o.img || !o.img.data) { o.kt = G.S; return; }
  if (!MAT_SO) taoMatSo();
  const d = o.img.data, [qw, qx, qy, qz] = o.q;
  const m00 = 1 - 2 * (qy * qy + qz * qz), m01 = 2 * (qx * qy - qz * qw), m02 = 2 * (qx * qz + qy * qw);
  const m10 = 2 * (qx * qy + qz * qw), m11 = 1 - 2 * (qx * qx + qz * qz), m12 = 2 * (qy * qz - qx * qw);
  const m20 = 2 * (qx * qz - qy * qw), m21 = 2 * (qy * qz + qx * qw), m22 = 1 - 2 * (qx * qx + qy * qy);
  const phang = L.PHANG, nen = phang ? RGB_PHANG[i] || NGA : RGB_BI[i], soc = !phang && i >= 9, so = phang ? null : MAT_SO[i];
  const cham = phang && i === 1 ? [150, 40, 30] : (chuDe() && chuDe().chamBiChu) || [200, 36, 40];
  const n = G.S * G.S, nb = G.nb, sh = G.sh, sp = G.sp, al = G.al;
  for (let k = 0; k < n; k++) {
    const a = al[k], j = k * 4;
    if (!a) { d[j + 3] = 0; continue; }
    const nx = nb[k * 3], ny = nb[k * 3 + 1], nz = nb[k * 3 + 2];
    const lx = m00 * nx + m10 * ny + m20 * nz, ly = m01 * nx + m11 * ny + m21 * nz, lz = m02 * nx + m12 * ny + m22 * nz;
    let r, gg, b;
    if (i === 0 || (phang && i === 1)) {                              // bi chủ: sáu chấm cho thấy xoáy (bida 3 bi: cả bi vàng)
      const ax = lx < 0 ? -lx : lx, ay = ly < 0 ? -ly : ly, az = lz < 0 ? -lz : lz;
      if (ax > 0.986 || ay > 0.986 || az > 0.986) { r = cham[0]; gg = cham[1]; b = cham[2]; } else { r = nen[0]; gg = nen[1]; b = nen[2]; }
    } else if ((lx > COS_SO || lx < -COS_SO) && so) {                  // đĩa số ở hai đầu trục x
      const m = laySo(so, (lx > 0 ? ly : -ly) / SIN_SO, -lz / SIN_SO), t = 1 - m;
      r = NGA[0] * t + 20 * m; gg = NGA[1] * t + 20 * m; b = NGA[2] * t + 22 * m;
    } else if (soc && (lz > 0.5 || lz < -0.5)) { r = NGA[0]; gg = NGA[1]; b = NGA[2]; }
    else { r = nen[0]; gg = nen[1]; b = nen[2]; }
    const s = sh[k], e = sp[k] * 255;
    d[j] = r * s + e; d[j + 1] = gg * s + e; d[j + 2] = b * s + e; d[j + 3] = a;
  }
  o.g.putImageData(o.img, 0, 0);
  o.kt = G.S; o.ban = false;
}
/* quay hướng bi theo vận tốc góc (toạ độ bàn) trong dt giây */
function quayBi(o, wx, wy, wz, dt) {
  const [w, x, y, z] = o.q, h = 0.5 * dt;
  const nw = w + h * (-wx * x - wy * y - wz * z), nx = x + h * (wx * w + wy * z - wz * y), ny = y + h * (-wx * z + wy * w + wz * x), nz = z + h * (wx * y - wy * x + wz * w);
  const n = Math.sqrt(nw * nw + nx * nx + ny * ny + nz * nz) || 1;
  o.q = [nw / n, nx / n, ny / n, nz / n]; o.ban = true;
}

/* ---------- vẽ mỗi khung ---------- */
const lucRaV = (l) => 0.2 + (L.VMAX - 0.2) * l * l;                  // thanh lực → tốc độ bi chủ: nhẹ thì chỉnh được mịn
function viTriHien() {                                                // vị trí bi lúc đứng yên (bi chủ đang đặt thì theo tay)
  if (!van) return new Array(16).fill(null);
  const v = van.the.bi.map(q => (q ? [q[0], q[1]] : null));
  if (dangDat()) v[0] = [ngam.cx, ngam.cy];
  if (mayNgam && mayNgam.cu.cx != null) v[0] = [mayNgam.cu.cx, mayNgam.cu.cy];
  return v;
}
function veBong(X, Y, r, mo = 0.32) {
  ctx.beginPath(); ctx.ellipse(X + r * 0.2, Y + r * 0.3, r * 1.05, r * 0.95, 0, 0, 6.2832);
  ctx.fillStyle = `rgba(0,0,0,${mo.toFixed(3)})`; ctx.fill();
}
function veMotBi(i, X, Y, ti = 1, mo = 1) {
  const o = anhBi[i], G = LUOI;
  if (!G) return;
  if (o.ban || o.kt !== G.S) veAnhBi(i);
  if (!o.c || !ctx.drawImage) return;
  const s = G.S / DPR * ti;
  ctx.globalAlpha = mo;
  ctx.drawImage(o.c, X - s / 2, Y - s / 2, s, s);
  ctx.globalAlpha = 1;
}
/* số đứng thẳng trên bi đang đứng yên. Người dùng: "những lúc ko thấy số, ko biết bi số mấy luôn" — số in trên bi quay theo
   bi thật nên hay úp xuống, nằm nghiêng, mà bi trên điện thoại chỉ to chừng 12 px. Chữ trắng viền tối đọc được trên mọi màu
   bi; bi đang lăn thì thôi, để thấy bi quay */
function veSoDung(i, X, Y, rr) {
  const co = Math.max(8, rr * (i >= 10 ? 1.25 : 1.45)), y = Y + co * 0.05;
  ctx.font = `700 ${co}px system-ui,-apple-system,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, co * 0.24); ctx.strokeStyle = 'rgba(12,12,14,.78)';
  ctx.strokeText(String(i), X, y);
  ctx.fillStyle = '#fff'; ctx.fillText(String(i), X, y);
}
/* cơ: đầu cơ cách bi chủ (R + keo), dài 1,45 m, thon từ 30 mm xuống 13 mm; vẽ theo toạ độ bàn */
function veGay(x, y, goc, keo, mo = 1) {
  heBan(ctx);
  const c = Math.cos(goc), s = Math.sin(goc), px = -s, py = c, R = L.R;
  const pha = (t0, t1, mau) => {                                      // đoạn cơ từ t0 tới t1 tính từ đầu cơ
    const r0 = (0.0065 + 0.0085 * t0 / 1.45), r1 = (0.0065 + 0.0085 * t1 / 1.45), d0 = R + keo + t0, d1 = R + keo + t1;
    ctx.beginPath();
    ctx.moveTo(x - c * d0 + px * r0, y - s * d0 + py * r0); ctx.lineTo(x - c * d1 + px * r1, y - s * d1 + py * r1);
    ctx.lineTo(x - c * d1 - px * r1, y - s * d1 - py * r1); ctx.lineTo(x - c * d0 - px * r0, y - s * d0 - py * r0); ctx.closePath();
    ctx.fillStyle = mau; ctx.fill();
  };
  ctx.globalAlpha = 0.35 * mo;                                        // bóng cơ trên nỉ
  { const dx = 0.012, dy = -0.016; ctx.save(); ctx.translate(dx, dy); pha(0, 1.45, '#000'); ctx.restore(); }
  ctx.globalAlpha = mo;
  pha(0, 0.006, '#3d78c9'); pha(0.006, 0.026, '#f1ece0');
  const go = ctx.createLinearGradient(x + px * 0.015, y + py * 0.015, x - px * 0.015, y - py * 0.015);
  go.addColorStop(0, '#f6dfae'); go.addColorStop(0.5, '#e2c088'); go.addColorStop(1, '#b9935a');
  pha(0.026, 0.72, go); pha(0.72, 0.735, '#c9ccd2'); pha(0.735, 0.98, '#5b2f17'); pha(0.98, 1.24, '#1d1b1b'); pha(1.24, 1.44, '#3b1d0e'); pha(1.44, 1.45, '#0c0c0c');
  ctx.globalAlpha = 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
function duongDut(x0, y0, x1, y1, mau, rong, dut) {
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
  ctx.strokeStyle = mau; ctx.lineWidth = rong; if (ctx.setLineDash) ctx.setLineDash(dut || []); ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]);
}
/* đường ngắm: bi chủ tới chỗ chạm đầu tiên, bóng bi chủ ở đó; chạm bi thì thêm hướng bi đích (đậm) và hướng bi chủ sau
   khi xoáy bắt nhả (đứt nét); chạm băng thì hướng bật ra. Bi chạm sai thì vòng đỏ gạch chéo. */
function veNgam() {
  const d = ngam.du;
  if (!d || !van) return;
  const c0 = viTriHien()[caHien()];
  if (!c0) return;
  const [X0, Y0] = raMH(c0[0], c0[1]), [X1, Y1] = raMH(d.x, d.y), rr = L.R * ban.k;
  if (d.duong) {
    /* nâng cơ: đường bay của bi chủ (chấm nhỏ, cong được khi massé), vòng vàng là chỗ bi chạm bàn; bay ra ngoài thì gạch đỏ */
    ctx.beginPath();
    d.duong.forEach((p, k) => { const [X, Y] = raMH(p[0], p[1]); if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.6; if (ctx.setLineDash) ctx.setLineDash([2, 4]); ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]);
    for (const q of d.chamBan || []) { const [X, Y] = raMH(q[0], q[1]); ctx.beginPath(); ctx.arc(X, Y, 3.5, 0, 6.2832); ctx.strokeStyle = 'rgba(255,215,110,.95)'; ctx.lineWidth = 1.6; ctx.stroke(); }
    if (d.ra) { duongDut(X1 - 6, Y1 - 6, X1 + 6, Y1 + 6, '#ff6b5e', 2.2); duongDut(X1 - 6, Y1 + 6, X1 + 6, Y1 - 6, '#ff6b5e', 2.2); return; }
  } else duongDut(X0, Y0, X1, Y1, 'rgba(255,255,255,.75)', 1.5, [6, 5]);
  const hopLe = d.loai !== 'bi' || L.biDich(van.the, van.the.luot).includes(d.so);
  ctx.beginPath(); ctx.arc(X1, Y1, rr, 0, 6.2832);
  ctx.strokeStyle = hopLe ? 'rgba(255,255,255,.9)' : '#ff6b5e'; ctx.lineWidth = 1.5; ctx.stroke();
  if (!hopLe) { duongDut(X1 - rr * 0.7, Y1 - rr * 0.7, X1 + rr * 0.7, Y1 + rr * 0.7, '#ff6b5e', 2); duongDut(X1 - rr * 0.7, Y1 + rr * 0.7, X1 + rr * 0.7, Y1 - rr * 0.7, '#ff6b5e', 2); return; }
  const huong = (x, y, h, dai, mau, rong, dut) => { const [A, B] = raMH(x, y), [C, E] = raMH(x + h[0] * dai, y + h[1] * dai); duongDut(A, B, C, E, mau, rong, dut); };
  if (d.loai === 'bi') {
    const cos = Math.max(0, d.huongBi[0] * Math.cos(ngam.goc) + d.huongBi[1] * Math.sin(ngam.goc));
    huong(d.ox, d.oy, d.huongBi, 0.1 + 0.42 * cos, 'rgba(255,240,200,.95)', 2.2);
    if (d.huongCai[2] > 0.02) huong(d.x, d.y, d.huongCai, 0.06 + 0.3 * Math.min(1, d.huongCai[2] / Math.max(0.3, d.vCham || 1)), 'rgba(255,255,255,.55)', 1.4, [4, 4]);
  } else if (d.loai === 'bang' && d.huongCai) huong(d.x, d.y, d.huongCai, 0.3, 'rgba(255,255,255,.5)', 1.4, [4, 4]);
  else if (d.loai === 'lo') { ctx.beginPath(); ctx.arc(X1, Y1, rr * 0.9, 0, 6.2832); ctx.fillStyle = 'rgba(255,90,80,.5)'; ctx.fill(); }
}
/* bida bài: vòng vàng quanh bi trùng lá trên tay (bi mồi 14, 15 vòng mờ) — chỉ khi bài đang lật */
function veBiNen() {
  const the = van.the, rr = L.R * ban.k;
  for (const s of L.biNen(the, the.luot)) {
    const q = the.bi[s];
    if (!q) continue;
    const [X, Y] = raMH(q[0], q[1]);
    ctx.beginPath(); ctx.arc(X, Y, rr + 4, 0, 6.2832);
    ctx.strokeStyle = s >= 14 ? 'rgba(255,215,110,.45)' : 'rgba(255,215,110,.95)'; ctx.lineWidth = 2; ctx.stroke();
  }
}
/* lỗ cho bi 8: vòng sáng ở miệng mỗi lỗ, lỗ đã chọn có số 8 */
function veChonLo() {
  if (!van || !laMinh(van.the.luot) || !L.denBi8(van.the, van.the.luot) || dang) return;
  for (let K = 0; K < L.LO.length; K++) {
    const lo = L.LO[K], [X, Y] = raMH(lo.mx + lo.ax * 0.02, lo.my + lo.ay * 0.02), r = Math.max(9, L.R * ban.k * 1.1);
    ctx.beginPath(); ctx.arc(X, Y, r, 0, 6.2832);
    if (K === ngam.lo) {
      ctx.fillStyle = 'rgba(255,215,110,.9)'; ctx.fill();
      ctx.fillStyle = '#2a1a00'; ctx.font = `700 ${Math.round(r * 1.1)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('8', X, Y + 0.5);
    } else { ctx.strokeStyle = 'rgba(255,215,110,.55)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
}
/* thanh lực (phải): kéo xuống để kéo cơ, thả là đánh. Tinh chỉnh (trái): vuốt lên xuống xoay hướng thật chậm. */
function vungLuc() { return { x: W - PHAI + 8, y: ban.y0 + 6, w: PHAI - 14, h: Math.max(120, ban.h - 30) }; }
function vungTinh() { return { x: 6, y: ban.y0 + ban.h * 0.18, w: TRAI - 10, h: Math.max(100, ban.h * 0.64) }; }
function veDieuKhien() {
  const toi = van && laMinh(van.the.luot) && !dang && !mayNgam && van.the.thang < 0, mo = toi ? 1 : 0.35;
  const v = vungLuc(), bo = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  ctx.globalAlpha = mo;
  bo(v.x, v.y, v.w, v.h, v.w / 2); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.stroke();
  if (ngam.luc > 0) {
    const h = (v.h - 8) * ngam.luc, g = ctx.createLinearGradient(0, v.y, 0, v.y + v.h);
    g.addColorStop(0, '#7be495'); g.addColorStop(0.55, '#ffd36b'); g.addColorStop(1, '#ff6b4a');
    bo(v.x + 4, v.y + 4, v.w - 8, h, (v.w - 8) / 2); ctx.fillStyle = g; ctx.fill();
  }
  /* hình cơ nhỏ trong thanh, tụt xuống theo lực */
  const cx = v.x + v.w / 2, y0 = v.y + 10 + (v.h - 40) * ngam.luc;
  ctx.fillStyle = '#e8cf9c'; ctx.fillRect(cx - 2, y0, 4, 22); ctx.fillStyle = '#3d78c9'; ctx.fillRect(cx - 2, y0, 4, 3);
  ctx.fillStyle = 'rgba(238,241,255,.75)'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(ngam.luc > 0 ? Math.round(ngam.luc * 100) + '%' : 'Lực', cx, v.y + v.h + 4);
  const t = vungTinh();
  bo(t.x, t.y, t.w, t.h, 10); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.stroke();
  ctx.save(); bo(t.x, t.y, t.w, t.h, 10); ctx.clip();
  const buoc = 9, lech = ((ngam.tinh % buoc) + buoc) % buoc;
  for (let y = t.y - buoc + lech; y < t.y + t.h + buoc; y += buoc) {
    const gan = 1 - Math.abs((y - (t.y + t.h / 2)) / (t.h / 2));
    ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.32 * Math.max(0, gan)})`; ctx.fillRect(t.x + 5, y, t.w - 10, 2);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(238,241,255,.6)'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom'; ctx.fillText('▲', t.x + t.w / 2, t.y - 3); ctx.textBaseline = 'top'; ctx.fillText('▼', t.x + t.w / 2, t.y + t.h + 3);
  ctx.globalAlpha = 1;
}
function veCanh(t) {
  if (!ctx || !ctx.setTransform) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!banAnh) veBanTinh();
  if (banAnh && ctx.drawImage) ctx.drawImage(banAnh, 0, 0);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (!van) { veDieuKhien(); return; }
  if (!LUOI || Math.abs(LUOI.rp - L.R * ban.k * DPR) > 0.01) taoLuoi(L.R * ban.k * DPR);
  /* đặt bi chủ sau vạch đầu bàn: tô nhẹ vùng được đặt */
  if (van.the.tuDo === 2 && (dangDat() || (mayNgam && mayNgam.cu.cx != null))) {
    heBan(ctx); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0, 0, L.KE_DAU, L.RONG);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const [a, b] = raMH(L.KE_DAU, 0), [c, e] = raMH(L.KE_DAU, L.RONG); duongDut(a, b, c, e, 'rgba(255,255,255,.4)', 1.2, [5, 5]);
  }
  const ds = dang ? dang.mp.bi.map(b => (b.tt >= 0 ? [b.x, b.y, b.z] : null)) : viTriHien(), rr = L.R * ban.k;
  if (!dang && laMinh(van.the.luot) && !mayNgam && van.the.thang < 0) { veChonLo(); veNgam(); if (coBaiHien()) veBiNen(); }
  /* bi đang bay: nhìn từ trên xuống thì bi to ra và bóng in trên nỉ lệch đi, nhạt dần theo độ cao; vẽ sau cùng cho nằm trên */
  const ve = [];
  for (let i = 0; i < 16; i++) if (ds[i]) { const [X, Y] = raMH(ds[i][0], ds[i][1]); ve.push([i, X, Y, ds[i][2] || 0]); }
  ve.sort((p, q) => p[3] - q[3]);
  for (const [, X, Y, z] of ve) { const h = z * ban.k; veBong(X + h * 0.45, Y + h * 0.65, rr * (1 + z * 2), 0.32 / (1 + z * 9)); }
  for (const [i, X, Y, z] of ve) veMotBi(i, X, Y, 1 + z * 3.5);
  if (!dang && !L.PHANG) for (const [i, X, Y] of ve) if (i) veSoDung(i, X, Y, rr);
  if (dang) for (const r of dang.bay) {                               // bi bay khỏi bàn: vọt qua thành bàn, rơi xuống sàn
    const s = (t - r.t0) / 1000;
    if (s >= 0.7) continue;
    const z = r.z + r.vz * s - 4.905 * s * s, [X, Y] = raMH(r.x + r.vx * s, r.y + r.vy * s);
    veMotBi(r.i, X, Y, Math.max(0.35, 1 + z * 3.5), Math.max(0, 1 - s / 0.7));
  }
  if (dang) for (const r of dang.roi) {                               // bi đang rơi xuống lỗ
    const k = Math.min(1, (t - r.t0) / 260);
    if (k >= 1) continue;
    const [X, Y] = raMH(r.x + (r.hx - r.x) * k, r.y + (r.hy - r.y) * k);
    veMotBi(r.i, X, Y, 1 - 0.45 * k, 1 - k);
  }
  /* đặt bi chủ: vòng chỉ chỗ chạm để kéo */
  if (dangDat()) {
    const [X, Y] = raMH(ngam.cx, ngam.cy);
    ctx.beginPath(); ctx.arc(X, Y, rr + 7, 0, 6.2832); ctx.strokeStyle = ngam.keo === 'dat' ? 'rgba(255,215,110,.95)' : 'rgba(255,215,110,.55)';
    ctx.lineWidth = 2; if (ctx.setLineDash) ctx.setLineDash([4, 4]); ctx.stroke(); if (ctx.setLineDash) ctx.setLineDash([]);
  }
  /* cơ */
  const c0 = ds[caHien()];
  if (mayNgam && c0) {
    const k = Math.min(1, (t - mayNgam.t0) / mayNgam.lau), quay = Math.min(1, k / 0.55), em = quay * quay * (3 - 2 * quay);
    let g = mayNgam.goc0 + (mayNgam.goc1 - mayNgam.goc0) * em;
    const keo = k < 0.55 ? 0.012 : k < 0.9 ? 0.012 + 0.16 * mayNgam.luc * (k - 0.55) / 0.35 : 0.012 + 0.16 * mayNgam.luc * (1 - (k - 0.9) / 0.1);
    veGay(c0[0], c0[1], g, Math.max(0, keo));
  } else if (!dang && van.the.thang < 0 && c0 && laMinh(van.the.luot)) veGay(c0[0], c0[1], ngam.goc, 0.012 + 0.2 * ngam.luc);
  else if (dang && dang.cuMo > 0 && c0) { veGay(dang.x0, dang.y0, dang.goc, 0.004, dang.cuMo); }
  veDieuKhien();
  vePhaoGiay(t);
}
/* bàn tặng: pháo giấy màu các bi rơi xuống bàn khi thắng. Máy đặt "giảm chuyển động" thì thôi (hình động trang trí, như các
   chỗ khác của app) */
const giamChuyenDong = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let phao = null;
function batPhaoGiay() {
  const ds = [];
  for (let i = 0; i < 150; i++) ds.push({ x: W * (0.1 + 0.8 * Math.random()), y: -10 - Math.random() * H * 0.5, vx: (Math.random() - 0.5) * 140,
    vy: 40 + Math.random() * 150, g: Math.random() * 6.28, vg: (Math.random() - 0.5) * 14, w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
    mau: MAU_BI[1 + Math.floor(Math.random() * 15)] });
  phao = { t0: bay(), tTruoc: bay(), ds };
}
function vePhaoGiay(t) {
  if (!phao || !ctx) return;
  const qua = t - phao.t0, dt = Math.min(0.05, Math.max(0, (t - phao.tTruoc) / 1000));
  phao.tTruoc = t;
  if (qua > 6500) { phao = null; return; }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.globalAlpha = Math.max(0, Math.min(1, (6500 - qua) / 1500));
  for (const p of phao.ds) {
    p.vy += 240 * dt; p.vx *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt; p.g += p.vg * dt;
    const c = Math.cos(p.g), s = Math.sin(p.g), h = p.h * Math.abs(Math.cos(p.g * 1.7));
    ctx.setTransform(DPR * c, DPR * s, -DPR * s, DPR * c, DPR * p.x, DPR * p.y);
    ctx.fillStyle = p.mau; ctx.fillRect(-p.w / 2, -h / 2, p.w, h);
  }
  ctx.globalAlpha = 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

/* ---------- ngắm, đánh ---------- */
function cuDangNgam(luc) {
  const cu = { dx: Math.cos(ngam.goc), dy: Math.sin(ngam.goc), v: lucRaV(luc), a: ngam.a, b: ngam.b };
  if (ngam.nang > 0) cu.nang = Math.round(Math.sin(ngam.nang * Math.PI / 180) * 1000) / 1000;   // sinθ phần nghìn: mọi máy đọc y hệt
  if (caHien()) cu.ca = caHien();
  if (van.the.tuDo) { cu.cx = ngam.cx; cu.cy = ngam.cy; }
  if (L.denBi8(van.the, van.the.luot)) cu.lo = ngam.lo;
  return cu;
}
/* tính lại đường ngắm khi hướng, lực, xoáy hay chỗ bi chủ đổi (mỗi khung nhiều nhất một lần) */
function capNhatDuDoan() {
  if (!van || !laMinh(van.the.luot) || dang || mayNgam || van.the.thang >= 0) { ngam.du = null; return; }
  const v = viTriHien();
  if (!v[caHien()]) { ngam.du = null; return; }
  const luc = ngam.luc > 0 ? ngam.luc : 0.42;
  const khoa = [ngam.goc.toFixed(6), luc.toFixed(3), ngam.a, ngam.b, ngam.nang, v[0][0], v[0][1], van.the.soCu].join('|');
  if (khoa === ngam.duKhoa) return;
  ngam.duKhoa = khoa;
  ngam.du = L.duDoan(v, cuDangNgam(luc));
  /* bi 8: chưa tự chọn lỗ thì lấy lỗ bi 8 đang chạy tới */
  if (L.denBi8(van.the, van.the.luot) && !ngam.loTay && ngam.du.loai === 'bi' && ngam.du.so === 8) ngam.lo = L.loGan(v, cuDangNgam(luc));
}
function choDatBiChu() {                                              // chỗ đặt bi chủ hợp lệ gần chỗ cũ (hay chấm đầu bàn)
  const the = van.the, goc = the.bi[0] || [the.tuDo === 2 ? L.KE_DAU - 0.12 : L.KE_DAU, L.RONG / 2];
  const cx = Math.min(goc[0], the.tuDo === 2 ? L.KE_DAU : L.DAI), cy = goc[1];
  if (L.datDuoc(the, cx, cy)) return [cx, cy];
  for (let r = 0.01; r < 1.5; r += 0.01) for (let k = 0; k < 16; k++) {
    const x = cx + r * Math.cos(k * 0.3927), y = cy + r * Math.sin(k * 0.3927);
    if (L.datDuoc(the, x, y)) return [x, y];
  }
  return [L.KE_DAU - 0.1, L.RONG / 2];
}
function chuanBiNgam() {
  const the = van.the, P = the.luot;
  if (the.tuDo) { const [x, y] = choDatBiChu(); ngam.cx = x; ngam.cy = y; }
  ngam.luc = 0; ngam.keo = null; ngam.lo = -1; ngam.loTay = false; ngam.duKhoa = '';
  ngam.nang = 0; veNutXoay();                                       // lượt mới thì cơ về nằm ngang, khỏi lỡ tay nhảy
  /* hướng: giữ hướng cũ nếu vẫn chạm bi hợp lệ, không thì quay về bi hợp lệ gần nhất */
  const v = viTriHien(), c = v[caHien()], dich = L.biDich(the, P);
  if (!c) return;
  const thu = L.duDoan(v, { dx: Math.cos(ngam.goc), dy: Math.sin(ngam.goc), v: 2, a: 0, b: 0, ca: caHien() });
  if (!(thu.loai === 'bi' && dich.includes(thu.so)) || the.pha) {
    let tot = null, gan = Infinity;
    for (const s of dich) { const q = v[s]; if (!q) continue; const d = Math.hypot(q[0] - c[0], q[1] - c[1]); if (d < gan) { gan = d; tot = q; } }
    if (tot) ngam.goc = Math.atan2(tot[1] - c[1], tot[0] - c[0]);
  }
}
function banCu() {                                                    // người chơi bấm đánh
  if (!van || !laMinh(van.the.luot) || dang || mayNgam || van.the.thang >= 0) return;
  const luc = ngam.luc;
  if (luc < 0.02) { ngam.luc = 0; return; }
  if (L.denBi8(van.the, van.the.luot) && ngam.lo < 0) ngam.lo = L.loGan(viTriHien(), cuDangNgam(luc));
  if (!danhCu(cuDangNgam(luc), van.the.luot)) { ngam.luc = 0; bao('Chưa đánh được — kiểm tra chỗ đặt bi chủ.'); }
}
function danhCu(cu0, P) {
  if (!van || dang || van.the.luot !== P || van.the.thang >= 0) return false;
  if (van.cheDo === 'phong' && P !== van.minh) return false;          // quán: chỉ đánh ghế của mình (người ngồi sofa xem thì không ghế nào)
  const cu = L.docCu(L.maCu(cu0));                                    // đúng con số mọi máy sẽ đọc
  if (cu && cu0.ca) cu.ca = cu0.ca;                                    // bida 3 bi: bi chủ của người đánh (chỉ chơi trên một máy)
  if (!cu || !L.cuHopLe(van.the, cu)) return false;
  const viTri = L.viTriDanh(van.the, cu), kq = L.danh(viTri, cu);
  if (van.cheDo === 'phong' && !guiCu(cu, kq, P)) return false;
  if (typeof document !== 'undefined' && document.hidden) { apKetQua(cu, kq, P); return true; }   // trang ẩn: khỏi hình động
  batDauHoat(viTri, cu, kq, P);
  return true;
}
function batDauHoat(viTri, cu, kq, P) {
  dang = { mp: L.moPhong(viTri, cu), cu, kq, P, t: 0, du: 0, nhanh: 1, soSk: 0, roi: [], bay: [], x0: viTri[cu.ca || 0][0], y0: viTri[cu.ca || 0][1], goc: Math.atan2(cu.dy, cu.dx), cuMo: 1 };
  ngam.luc = 0; ngam.keo = null; ngam.du = null; ngam.duKhoa = '';
  tiengCo(cu.v);
  capNhatChu();
}
function chayHoat(t) {
  const d = dang;
  if (!d.t) d.t = t;
  /* cú dài thì tự tua dần (bi lăn chậm cuối cú chỉ làm người chờ sốt ruột): sau 2,5 giây nhanh 1,5 lần, sau 5 giây 2,2 lần */
  const nhanh = Math.max(d.nhanh, d.mp.t > 5 ? 2.2 : d.mp.t > 2.5 ? 1.5 : 1);
  let dt = Math.min(0.1, Math.max(0, (t - d.t) / 1000)) * nhanh;
  d.t = t;
  if (typeof document !== 'undefined' && document.hidden) dt = 1e6;    // trang đang ẩn: chạy hết luôn, khỏi dồn hình động
  d.du += dt;
  d.cuMo = Math.max(0, d.cuMo - dt * 5);
  let n = 0;
  while (d.du >= L.DT && !d.mp.xong && n++ < 20000) {
    L.buoc(d.mp);
    d.du -= L.DT;
    for (const b of d.mp.bi) if (b.tt > 0) quayBi(anhBi[b.so], b.wx, b.wy, b.wz, L.DT);
  }
  let am = 0;
  while (d.soSk < d.mp.sk.length) {
    const s = d.mp.sk[d.soSk++];
    if (am++ < 4) tiengVa(s);
    if (s.k === 3) { const b = d.mp.bi[s.a], lo = L.LO[s.lo]; d.roi.push({ i: s.a, x: b.x, y: b.y, hx: lo.hx, hy: lo.hy, t0: t }); }
    if (s.k === 5) d.bay.push({ i: s.a, x: s.x, y: s.y, z: s.z, vx: s.vx, vy: s.vy, vz: s.vz, t0: t });
  }
  if (d.mp.xong) xongHoat();
}
function xongHoat() {
  const d = dang;
  dang = null;
  if (van) apKetQua(d.cu, d.kq, d.P);
}
/* áp luật lên kết quả cú vừa xong, báo, rồi tới lượt kế (qua mạng thì đọc tiếp các cú đã tới) */
function apKetQua(cu, kq, P) {
  const { the, bao: b } = L.apCu(van.the, cu, kq);
  van.the = the;
  baoKetQua(b, P);
  if (van.cheDo === 'phong') { if (phong) chayPhong(); }
  else denLuot();
}

/* ---------- chạm, kéo ---------- */
function toaDo(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function trongVung(v, X, Y) { return X >= v.x - 8 && X <= v.x + v.w + 8 && Y >= v.y - 14 && Y <= v.y + v.h + 18; }
function chamXuong(e) {
  amThanh();
  const [X, Y] = toaDo(e);
  if (dang) { dang.nhanh = 4; return; }                               // đang chạy: chạm để tua nhanh
  if (!van || !laMinh(van.the.luot) || mayNgam || van.the.thang >= 0) return;
  if (cv.setPointerCapture && e.pointerId != null) { try { cv.setPointerCapture(e.pointerId); } catch (x) {} }
  ngam.y0 = Y; ngam.yTruoc = Y;
  if (X >= W - PHAI - 4 && trongVung(vungLuc(), X, Y)) { ngam.keo = 'luc'; ngam.luc0 = ngam.luc; return; }
  if (X <= TRAI + 4 && trongVung(vungTinh(), X, Y)) { ngam.keo = 'tinh'; return; }
  const rr = L.R * ban.k;
  if (dangDat()) {
    const [cX, cY] = raMH(ngam.cx, ngam.cy);
    if (Math.hypot(X - cX, Y - cY) <= Math.max(26, rr * 2.6)) { ngam.keo = 'dat'; return; }
  }
  if (L.denBi8(van.the, van.the.luot)) {
    for (let K = 0; K < L.LO.length; K++) {
      const lo = L.LO[K], [lX, lY] = raMH(lo.mx + lo.ax * 0.02, lo.my + lo.ay * 0.02);
      if (Math.hypot(X - lX, Y - lY) <= Math.max(20, rr * 1.8)) { ngam.lo = K; ngam.loTay = true; ngam.keo = null; tiengCham(); bao(`Bi 8 vào lỗ ${TEN_LO[K]}.`); return; }
    }
  }
  ngam.keo = 'ngam';
  ngamToi(X, Y);
}
function ngamToi(X, Y) {
  const c = viTriHien()[caHien()];
  if (!c) return;
  const [x, y] = vaoBan(X, Y);
  if (Math.hypot(x - c[0], y - c[1]) < L.R * 0.6) return;
  ngam.goc = Math.atan2(y - c[1], x - c[0]);
}
function chamKeo(e) {
  if (!ngam.keo || !van) return;
  const [X, Y] = toaDo(e);
  if (ngam.keo === 'luc') { const v = vungLuc(); ngam.luc = Math.max(0, Math.min(1, ngam.luc0 + (Y - ngam.y0) / (v.h * 0.85))); }
  else if (ngam.keo === 'tinh') { const dy = Y - ngam.yTruoc; ngam.goc -= dy * 0.0007; ngam.tinh -= dy; }
  else if (ngam.keo === 'dat') {
    let [x, y] = vaoBan(X, Y);
    x = Math.max(L.R, Math.min(van.the.tuDo === 2 ? L.KE_DAU : L.DAI - L.R, x)); y = Math.max(L.R, Math.min(L.RONG - L.R, y));
    if (L.datDuoc(van.the, x, y)) { ngam.cx = x; ngam.cy = y; }
  } else if (ngam.keo === 'ngam') ngamToi(X, Y);
  ngam.yTruoc = Y;
}
function chamLen() {
  const keo = ngam.keo;
  ngam.keo = null;
  if (keo === 'luc') banCu();
}
/* bàn phím (máy tính): ← → xoay, giữ Shift xoay nhanh; ↑ ↓ lực; cách hay Enter đánh */
function phim(e) {
  if (!tam || !tam.classList.contains('hien') || !tam.querySelector('.bd-tin').hidden || !van || !laMinh(van.the.luot) || dang || mayNgam) return false;
  const t = e.target && e.target.tagName;
  if (t === 'INPUT' || t === 'BUTTON') return false;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { ngam.goc += (e.key === 'ArrowLeft' ? 1 : -1) * (e.shiftKey ? 0.02 : 0.0015); ngam.tinh += e.key === 'ArrowLeft' ? 3 : -3; return true; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { ngam.luc = Math.max(0, Math.min(1, ngam.luc + (e.key === 'ArrowDown' ? 0.05 : -0.05))); return true; }
  if (e.key === ' ' || e.key === 'Enter') { if (ngam.luc < 0.02) ngam.luc = 0.4; banCu(); return true; }
  if (e.key === 'PageUp' || e.key === 'PageDown') { datNang(ngam.nang + (e.key === 'PageUp' ? 5 : -5)); return true; }
  return false;
}

/* ---------- chọn xoáy: chạm vào bi chủ to, chấm đỏ là chỗ đầu cơ chạm. Vòng đứt nét là nửa bán kính — ra ngoài là trượt cơ ---------- */
/* nâng cơ 0–60° (người dùng muốn mô phỏng cú đánh bi bay ra ngoài): cơ chúc xuống, bi chủ nảy lên */
function datNang(d) {
  ngam.nang = Math.max(0, Math.min(60, Math.round(+d || 0)));
  ngam.duKhoa = '';
  veNutXoay();
}
function veNutXoay() {
  if (!tam) return;
  const n = tam.querySelector('.bd-xoay i');
  if (n) n.style.transform = `translate(${ngam.a * 9}px, ${-ngam.b * 9}px)`;
  const nho = tam.querySelector('.bd-nang-nho'), o = tam.querySelector('.bd-nang-o'), so = tam.querySelector('.bd-nang-so');
  if (nho) nho.textContent = ngam.nang ? ` · ${ngam.nang}°` : '';
  if (o && +o.value !== ngam.nang) o.value = String(ngam.nang);
  if (so) so.textContent = `${ngam.nang}°${ngam.nang >= 25 ? ' — nhảy' : ''}`;
  const bang = tam.querySelector('.bd-xoay-bang');
  if (bang && !bang.hidden) {
    const c = bang.querySelector('.bd-xoay-cham'), chu = bang.querySelector('.bd-xoay-chu');
    if (c && c.setAttribute) { c.setAttribute('cx', (ngam.a * 100).toFixed(1)); c.setAttribute('cy', (-ngam.b * 100).toFixed(1)); }
    if (chu) chu.textContent = tenXoay();
  }
}
function tenXoay() {
  const a = ngam.a, b = ngam.b, p = [];
  if (b > 0.12) p.push(b > 0.3 ? 'đẩy mạnh' : 'đẩy'); else if (b < -0.12) p.push(b < -0.3 ? 'kéo mạnh' : 'kéo'); else p.push('đâm');
  if (a > 0.1) p.push('xoáy phải'); else if (a < -0.1) p.push('xoáy trái');
  if (ngam.nang >= 40 && (a > 0.1 || a < -0.1)) p.push('bi chạy cong');
  return p.join(', ').replace(/^./, c => c.toUpperCase());
}
function datXoay(e) {
  const svg = tam.querySelector('.bd-xoay-bang svg'), r = svg.getBoundingClientRect();
  let a = ((e.clientX - r.left) / r.width * 2 - 1) * 1.1, b = -((e.clientY - r.top) / r.height * 2 - 1) * 1.1;
  const m = Math.hypot(a, b);
  if (m > 0.5) { a *= 0.5 / m; b *= 0.5 / m; }
  ngam.a = Math.round(a * 100) / 100; ngam.b = Math.round(b * 100) / 100;
  ngam.duKhoa = '';
  veNutXoay();
}
function moXoay(mo) {
  const bang = tam.querySelector('.bd-xoay-bang');
  bang.hidden = !mo;
  tam.querySelector('.bd-xoay').classList.toggle('bd-bat', mo);
  veNutXoay();
}

/* ---------- ván ---------- */
function laMay(P) {
  if (!van) return false;
  if (van.cheDo === 'phong') return false;                            // quán bida: ghế nào cũng là người
  return !!(van.nguoi[P] && van.nguoi[P].may);
}
/* chơi chung một máy (người dùng: "cho chơi 3,4 người 1 bàn"): ghế nào cũng là người trên máy này, chuyền tay nhau */
const chung = () => !!van && van.cheDo === 'chung';
const laMinh = (P) => !!van && !laMay(P) && (van.cheDo === 'chung' ? P >= 0 && P < van.so : P === van.minh);
/* gọi người ở ghế P trong câu: máy này là "Bạn"/"bạn" (hay tên trong chủ đề bàn tặng); chơi chung thì gọi đúng tên */
const tenChu = (P) => (laMinh(P) && !chung() ? tenBan() : tenNguoi(P));
const tenGoi = (P) => (laMinh(P) && !chung() ? goiBan() : tenNguoi(P));
const dangDat = () => !!van && laMinh(van.the.luot) && van.the.tuDo > 0 && !dang && !mayNgam && van.the.thang < 0;
function mucMay(P) {
  if (van.cheDo === 'phong') return phong && phong.cay && [0, 1, 2].includes(phong.cay.kho) ? phong.cay.kho : 1;
  return van.nguoi[P] && [0, 1, 2].includes(van.nguoi[P].muc) ? van.nguoi[P].muc : 1;
}
function tenNguoi(P) {
  if (!van) return '';
  if (van.cheDo === 'phong') return tenGhe(P);
  return van.nguoi[P] ? van.nguoi[P].ten : '';
}
const TEN_NHOM = ['bàn mở', 'bi trơn', 'bi sọc'];
const tenKieu = (k) => (k === 52 ? 'Bida bài' : `${k} bi`);
const TEN_LUAT3 = ['tự do', '1 băng', '', '3 băng'];
const nhieuNguoi = (k) => k === 9 || k === 52;                       // 2–4 người; 8 bi chỉ hai
/* lá bài: số (A 2 … 10 J Q K) và chất; ♦ ♥ đỏ */
const SO_LA = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], CHAT = ['♠', '♣', '♦', '♥'];
const laHtml = (c) => `<span class="bd-la${c >= 26 ? ' bd-la-do' : ''}"><b>${SO_LA[L.soLa(c)]}</b><i>${CHAT[Math.floor(c / 13)]}</i>${L.soLa(c) > 10 ? `<small>bi ${L.soLa(c)}</small>` : ''}</span>`;
/* đổi lõi theo kiểu ván: bàn phăng khác cỡ bàn, cỡ bi, màu bi — vẽ lại bàn, ảnh bi */
function datLoi(kieu) {
  const moi = kieu === 3 ? L3 : L15;
  if (moi === L) return;
  L = moi; banAnh = null; LUOI = null;
  for (const o of anhBi) o.ban = true;
  if (tam) doCo();
}
const caHien = () => (van ? L.caCua(van.the) : 0);                     // bi chủ của lượt này (bida 3 bi: bi của người đánh)
/* ván đấu với máy, tập một mình, hay chơi chung một máy. ch: { che: 'may' | 'tap' | 'chung', kieu: 8 | 9, soMay (9 bi:
   1–3), kho, so + ten (chơi chung: 8 bi 2 người, 9 bi 2–4), pha (ghế phá) } */
function vanMoi(ch) {
  if (phong) roiPhong();
  boViec();
  dang = null; mayNgam = null;
  const kieu = [9, 52, 3].includes(ch.kieu) ? ch.kieu : 8, cheDo = ch.che === 'tap' ? 'tap' : ch.che === 'chung' ? 'chung' : 'may';
  datLoi(kieu);
  const so = cheDo === 'tap' ? 1 : cheDo === 'chung' ? (nhieuNguoi(kieu) ? Math.max(2, Math.min(4, ch.so || 2)) : 2)
    : nhieuNguoi(kieu) ? 1 + Math.max(1, Math.min(3, ch.soMay || 1)) : 2;
  const pha = ((ch.pha || 0) % so + so) % so, hat = Math.floor(Math.random() * 2147483647);
  van = { cheDo, kieu, so, kho: [0, 1, 2].includes(ch.kho) ? ch.kho : 1, soMay: so - 1, pha, hat, minh: 0,
    the: L.theMoi(kieu, so, hat, pha, kieu === 3 ? { luat: ch.luat, dich: ch.dich } : ch.la), nguoi: [{ ten: tenBan(), may: false }], hetVan: false, doiMay: false, ma: '', chuoi: 0, xemBai: -1 };
  if (cheDo === 'chung') van.nguoi = Array.from({ length: so }, (_, P) => ({ ten: tenChungMacDinh(ch.ten, P), may: false }));
  else for (let P = 1; P < so; P++) van.nguoi[P] = { ten: tenMay()[P - 1], may: true, muc: van.kho };
  tatTin();
  ngam.a = 0; ngam.b = 0;
  capNhatChu();
  denLuot();
  if (chuDe() && !docLuu().h) { ghiLuu({ h: 1 }); moHuongDan(); }     // bàn tặng: cách chơi lần đầu hiện lúc vào bàn (xem mo)
  else if (van.cheDo === 'tap') bao(kieu === 3 ? 'Tập bida 3 bi: đánh bi trắng chạm cả bi vàng lẫn bi đỏ là ăn điểm.' : `Tập một mình: ${kieu === 52 ? 15 : kieu} bi, đánh tuỳ thích. Rơi bi chủ thì đặt lại.`);
  else if (kieu === 3 && laMinh(van.the.luot)) bao(`${tenChu(van.the.luot)} khai cuộc bằng bi ${TEN_BI3[caHien()]}: phải chạm bi đỏ trước. Kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh.`);
  else if (laMinh(van.the.luot)) bao(`${tenChu(van.the.luot)} phá trước: kéo bi trắng để đặt, kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh.`);
}
/* tên người ở ghế P khi chơi chung: tên đã gõ, để trống thì "Người P+1" (bàn tặng: ghế đầu là người được tặng) */
function tenChungMacDinh(ds, P) {
  const t = String((ds && ds[P]) || '').trim().slice(0, 20);
  return t || (P === 0 && chuDe() ? tenBan() : `Người ${P + 1}`);
}
function denLuot() {
  if (!van || dang || mayNgam) return;
  const the = van.the;
  capNhatChu();
  if (the.thang >= 0) {
    if (!van.hetVan) {
      van.hetVan = true;
      /* bàn tặng: thắng (hay dọn sạch bàn lúc tập) thì pháo giấy rơi trên bàn một lúc rồi mới hiện bảng hết ván */
      if (chuDe() && (laMinh(the.thang) || van.so < 2) && !giamChuyenDong()) { batPhaoGiay(); const v0 = van; setTimeout(() => { if (van === v0) ketThucVan(); }, 2300); }
      else ketThucVan();
    }
    return;
  }
  const P = the.luot;
  if (laMay(P)) {
    if (van.doiMay) return;
    van.doiMay = true;
    const soCu = the.soCu;
    capNhatChu();
    mayNghi(P, (cu) => {
      if (!van) return;
      van.doiMay = false;
      if (van.the.soCu !== soCu || van.the.luot !== P || dang) { denLuot(); return; }
      /* trang đang ẩn (chuyển sang app khác): đánh luôn, khỏi đợi cơ quay */
      if (typeof document !== 'undefined' && document.hidden) { if (!danhCu(cu, P)) denLuot(); return; }
      batNgamMay(cu, P, 1150, () => { if (!danhCu(cu, P)) denLuot(); });
    });
    return;
  }
  /* chỉ chuẩn bị ngắm khi thật sự tới một lượt mới: phòng qua mạng gọi lại đây mỗi lần máy chủ báo tin (nhịp "còn ở đây"
     của ai đó cứ 20 giây một lần), bản đầu lần nào cũng đặt lại lực, hướng, chỗ đặt bi giữa lúc người ta đang kéo */
  if (laMinh(P)) {
    const khoa = [van.ma, van.hat, the.soCu, P].join('|');
    if (ngam.luotKhoa !== khoa) { ngam.luotKhoa = khoa; chuanBiNgam(); if (chung()) van.xemBai = -1; }
    capNhatChu();
  }
}
/* cơ quay dần tới hướng đánh, kéo lui rồi thọc (máy đánh, hay cú của người ở máy khác) */
function batNgamMay(cu, P, lau, xong) {
  const c = cu.cx != null ? [cu.cx, cu.cy] : van.the.bi[cu.ca || 0];
  const goc1 = Math.atan2(cu.dy, cu.dx);
  let goc0 = ngam.goc;
  if (!isFinite(goc0)) goc0 = goc1;
  while (goc0 - goc1 > Math.PI) goc0 -= 2 * Math.PI;
  while (goc1 - goc0 > Math.PI) goc0 += 2 * Math.PI;
  mayNgam = { cu, P, goc0, goc1, luc: Math.sqrt(Math.max(0, (cu.v - 0.2) / (L.VMAX - 0.2))), t0: bay(), lau, xong, c };
  ngam.goc = goc1;
  capNhatChu();
}
const bay = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/* ---------- lời báo ---------- */
function bao(chu) {
  const n = tam && tam.querySelector('.bd-bao');
  if (!n) return;
  n.textContent = chu; n.hidden = false;
  clearTimeout(baoHen);
  baoHen = setTimeout(() => { n.hidden = true; }, Math.min(6000, 2200 + chu.length * 35));
}
function baoKetQua(b, P) {
  if (!van) return;
  if (van.kieu === 3) { baoKetQua3(b, P); return; }
  if (b.ket) return;
  const ten = tenChu(P), sau = van.the.luot, tenSau = tenGoi(sau);
  const p = [];
  if (b.vao.length) p.push(`${b.vao.length > 1 ? 'Vào các bi' : 'Vào bi'} ${b.vao.join(', ')}.`);
  const raCon = (b.ra || []).filter(s => s !== b.datLai);
  if (raCon.length) p.push(`${raCon.length > 1 ? 'Các bi' : 'Bi'} ${raCon.join(', ')} bay khỏi bàn.`);
  if (b.nhomMoi) p.push(`${ten} nhận ${TEN_NHOM[van.the.nhom[P]]}.`);
  if (b.datLai) p.push(`Bi ${b.datLai} ${b.datLaiRa ? 'bay khỏi bàn' : b.datLai === 8 ? 'vào lúc phá' : 'vào cùng cú lỗi'} — đặt lại ở chấm chân bàn.`);
  /* bida bài: ai hạ lá nào; lỗi thì bi vào, bi bay ra đặt lại và rút lá phạt */
  if (b.ha) for (const [Q, s, k] of b.ha) p.push(`${tenChu(Q)} hạ ${k > 1 ? `${k} lá` : 'lá'} ${SO_LA[s]}${s > 10 ? ` (bi ${s})` : ''}.`);
  if (b.datLaiDs && b.datLaiDs.length) p.push(`Bi ${b.datLaiDs.join(', ')} đặt lại ở chấm chân bàn.`);
  if (b.phat >= 0) p.push(`${tenChu(P)} rút thêm một lá phạt.`);
  if (b.loi && van.so > 1) { p.push(`Lỗi: ${TEN_LOI[b.loi]}. ${tenChu(sau)} được đặt bi chủ.`); tiengLoi(); }
  else if (b.loi === 'cai') p.push('Bi chủ rơi lỗ — đặt lại rồi đánh tiếp.');
  else if (b.loi === 'caiRa') p.push('Bi chủ bay khỏi bàn — đặt lại rồi đánh tiếp.');
  else if (b.vao.length) tiengVao();
  /* chơi chung: hết lượt thì gọi tên người kế cầm máy (lỗi thì câu trên đã gọi) */
  if (chung() && sau !== P && van.the.thang < 0 && !(b.loi && van.so > 1)) { p.push(`Tới lượt ${tenNguoi(sau)}.`); tiengToiLuot(); }
  /* bàn tặng: lời trêu theo cú của người được tặng (chơi chung thì chỉ ghế đầu); vào bi liền ba cú trở lên thì câu riêng */
  const cd = chuDe();
  if (cd && cd.loi && laMinh(P) && (!chung() || P === 0)) {
    const l = cd.loi;
    van.chuoi = b.vao.length && !b.loi ? (van.chuoi || 0) + 1 : 0;
    if (b.loi === 'cai' || b.loi === 'caiRa') p.push(chon1(l.tam));
    else if (b.loi) p.push(chon1(l.loi));
    else if (b.vao.length) p.push(van.chuoi >= 3 && l.chuoi ? chon1(l.chuoi) : chon1(l.vao));
    else if (Math.random() < 0.6) p.push(chon1(l.truot));
    if (!b.tiep) van.chuoi = 0;
  }
  if (p.filter(Boolean).length) bao(p.filter(Boolean).join(' '));
}
/* bida 3 bi: ăn điểm hay trượt, vì sao (thiếu bi, thiếu băng); lỗi thì mất lượt, bi bay ra đặt lại — không đặt bi chủ */
function baoKetQua3(b, P) {
  const the = van.the, sau = the.luot, can = the.luat === 3 ? 3 : the.luat === 1 ? 1 : 0, p = [];
  if (b.loi) { p.push(`Lỗi: ${TEN_LOI[b.loi]}.`); tiengLoi(); }
  if (b.datLaiDs && b.datLaiDs.length) p.push(`Bi ${b.datLaiDs.map(s => TEN_BI3[s]).join(', ')} đặt lại.`);
  if (b.diem) { p.push(van.so > 1 ? `Ăn điểm! ${tenChu(P)} ${the.diem[P]}/${the.dich}.` : `Ăn điểm! ${the.diem[0]} điểm.`); tiengVao(); }
  else if (!b.loi) p.push(b.hai ? `Chạm đủ hai bi nhưng mới ${b.bangHai} băng — ${TEN_LUAT3[can]} cần ${can}.` : 'Trượt — bi chủ chưa chạm đủ hai bi.');
  if (b.ket) return;
  if (van.so > 1 && sau !== P) { p.push(`Tới lượt ${tenGoi(sau)} (bi ${TEN_BI3[L.caCua(the)]}).`); if (chung()) tiengToiLuot(); }
  bao(p.join(' '));
}
function soConNhom(the, g) { let n = 0; for (let s = 1; s < 16; s++) if (the.bi[s] && L.nhomCua(s) === g) n++; return n; }
function chuLuot() {
  if (!van) return '';
  const the = van.the, P = the.luot;
  if (the.thang >= 0) return van.so > 1 ? `Hết ván — ${tenGoi(the.thang)} thắng.` : 'Hết bi rồi! Bấm Ván mới để xếp lại.';
  if (dang) return dang.nhanh > 1 ? 'Đang tua nhanh…' : 'Chạm bàn để tua nhanh';
  if (mayNgam) return `${tenChu(mayNgam.P)} đánh…`;
  if (!laMinh(P)) {
    if (laMay(P)) return `${tenNguoi(P)} đang ngắm…`;
    return `${tenNguoi(P)} đang đánh…`;
  }
  let chu = van.so > 1 ? `Lượt ${tenGoi(P)}` : 'Tập một mình';
  if (the.kieu === 52 && van.so > 1 && the.bai) chu += ` · còn ${the.bai[P].length} lá`;    // bida bài: kể cả lượt phá
  if (the.kieu === 3) {                                                // bida 3 bi: bi nào, mấy điểm, khai cuộc chạm đỏ trước
    chu = van.so > 1 ? `Lượt ${tenGoi(P)} · bi ${TEN_BI3[caHien()]} · ${the.diem[P]}/${the.dich}` : `Tập 3 bi · ${the.diem[0]} điểm`;
    return chu + (the.pha && van.so > 1 ? ' · chạm bi đỏ trước' : ` · ${TEN_LUAT3[the.luat]}`);
  }
  if (the.pha) chu += ' · phá';
  else if (the.kieu === 9 && van.so > 1) chu += ` · chạm bi ${L.thapNhat(the)} trước`;
  else if (the.kieu === 8 && van.so > 1) {
    const g = the.nhom[P];
    chu += L.denBi8(the, P) ? ' · bi 8: chạm vòng ở miệng lỗ để chọn lỗ' : g ? ` · ${TEN_NHOM[g]}, còn ${soConNhom(the, g)}` : ' · bàn mở, vào bi nào nhận nhóm đó';
  } else if (the.kieu !== 52) chu += ` · còn ${the.bi.filter((q, s) => s > 0 && q).length} bi`;
  if (the.tuDo) chu += the.tuDo === 2 ? ' · kéo bi trắng, đặt sau vạch' : ' · được đặt bi trắng ở đâu cũng được';
  return chu;
}
function miniBi(s, mat) {
  const m = MAU_BI[s], nen = s >= 9 ? `linear-gradient(${NGA_CSS} 0 27%, ${m} 27% 73%, ${NGA_CSS} 73%)` : m;
  return `<i class="bd-mini${mat ? ' bd-mat' : ''}" style="background:${nen}"></i>`;
}
const NGA_CSS = `rgb(${NGA.join(',')})`;
function capNhatChu() {
  if (!tam) return;
  const luot = tam.querySelector('.bd-luot'), ten = tam.querySelector('.bd-ten span'), hang = tam.querySelector('.bd-nguoi');
  if (luot) luot.textContent = chuLuot() + demGioBan();
  const tieu = tam.querySelector('.bd-ten b');
  if (tieu) tieu.textContent = (chuDe() && chuDe().tieuDe) || (van && van.kieu === 3 ? 'Bida 3 bi' : 'Bida lỗ');
  if (ten) ten.textContent = !van ? '8 bi · 9 bi · bài' : van.cheDo === 'phong' && phong ? `Bàn ${(phong.cay && phong.cay.ban) || phong.ma} · ${tenKieu(van.kieu)}${phong.xem ? ' · bạn đang xem' : ''}` : van.cheDo === 'tap' ? `Tập một mình · ${van.kieu === 52 ? 15 : van.kieu} bi`
    : `${tenKieu(van.kieu)}${van.kieu === 52 && van.the.la ? ` · ${van.the.la} lá` : ''}${van.kieu === 3 ? ` · ${TEN_LUAT3[van.the.luat]}` : ''} · ${chung() ? `${van.so} người` : `máy ${KHO[van.kho]}`}`;
  if (hang) {
    if (!van || van.so < 2) hang.innerHTML = '';
    else {
      const the = van.the;
      hang.innerHTML = Array.from({ length: van.so }, (_, P) => {
        const g = the.kieu === 8 ? the.nhom[P] : 0, cac = g ? [1, 2, 3, 4, 5, 6, 7].map(s => (g === 2 ? s + 8 : s)) : [];
        const phu = [laMay(P) ? 'máy' : '', van.cheDo === 'phong' && gheCua(P) && !conO(P) ? 'vắng' : '',
          the.kieu === 8 ? (g ? TEN_NHOM[g] : 'chưa có nhóm') : '', the.kieu === 52 && the.bai ? `${the.bai[P].length} lá` : '',
          the.kieu === 3 ? `bi ${TEN_BI3[P]} · ${the.diem[P]}/${the.dich}` : '',
          the.luot === P && the.thang < 0 ? 'đang đánh' : '', the.thang === P ? 'thắng' : ''].filter(Boolean).join(' · ');
        return `<div class="bd-the${the.luot === P && the.thang < 0 ? ' bd-dang' : ''}${laMinh(P) && !chung() ? ' bd-minh' : ''}" data-p="${P}"><b>${esc(van.cheDo !== 'phong' ? tenChu(P) : tenNguoi(P))}</b><span>${esc(phu)}</span>${cac.length ? `<em>${cac.map(s => miniBi(s, !the.bi[s])).join('')}${miniBi(8, !the.bi[8])}</em>` : ''}</div>`;
      }).join('');
    }
  }
  veBaiTay();
  const moi = tam.querySelector('.bd-moi');
  if (moi) moi.textContent = van && van.cheDo === 'phong' && phong ? 'Bàn' : 'Ván mới';
  veNutXoay();
}

/* bida bài: dải bài trên tay. Đấu với máy thì luôn thấy bài của mình; chơi chung một máy thì bài người đang đánh úp lại, chạm
   mới lật (người khác ngồi cạnh khỏi thấy); máy và người ở xa thì chỉ thấy số lá trên thẻ */
const coBaiHien = () => !!van && van.kieu === 52 && van.so > 1 && !!van.the.bai && van.the.thang < 0 && (chung() ? van.xemBai === van.the.luot : van.cheDo === 'may');
function veBaiTay() {
  const d = tam && tam.querySelector('.bd-bai');
  if (!d) return;
  if (!van || van.kieu !== 52 || van.so < 2 || !van.the.bai || (van.cheDo !== 'may' && !chung())) { d.hidden = true; d.innerHTML = ''; return; }
  const the = van.the, P = chung() ? the.luot : 0;
  d.hidden = false;
  if (chung() && van.xemBai !== P) { d.innerHTML = `<button type="button" class="bd-xem-bai">${esc(tenNguoi(P))}: chạm để xem bài (${the.bai[P].length} lá)</button>`; return; }
  d.innerHTML = `<p>${chung() ? `Bài của ${esc(tenNguoi(P))}` : 'Bài của bạn'}</p><div>${the.bai[P].map(laHtml).join('')}</div>`;
}

/* ---------- âm thanh (Web Audio, không tải tệp) ---------- */
function amThanh() {
  if (!coTieng) return null;
  try { if (!am) { const AC = self.AudioContext || self.webkitAudioContext; if (!AC) return null; am = new AC(); } if (am.state === 'suspended') am.resume(); return am; } catch (e) { return null; }
}
function not(f, luc, lau, to, kieu = 'sine') {
  const o = am.createOscillator(), v = am.createGain();
  o.type = kieu; o.frequency.value = f;
  v.gain.setValueAtTime(0, luc); v.gain.linearRampToValueAtTime(to, luc + 0.003); v.gain.exponentialRampToValueAtTime(0.0001, luc + lau);
  o.connect(v); v.connect(am.destination); o.start(luc); o.stop(luc + lau + 0.05);
  return o;
}
function tiengCo(v) { if (!amThanh()) return; const t = am.currentTime + 0.01, to = Math.min(0.22, 0.05 + v * 0.02); not(420, t, 0.05, to, 'triangle'); not(1300, t, 0.02, to * 0.4); }
function tiengVa(s) {
  if (!amThanh() || !s) return;
  const t = am.currentTime + 0.005, v = Math.min(1, (s.v || 0) / 4);
  if (s.k === 1) { if (v < 0.01) return; not(2400 + 600 * v, t, 0.03 + 0.03 * v, 0.03 + 0.2 * v); not(3900, t, 0.015, 0.02 + 0.08 * v); }
  else if (s.k === 2) { if (v < 0.02) return; const o = not(150, t, 0.09, 0.05 + 0.18 * v, 'triangle'); o.frequency.exponentialRampToValueAtTime(90, t + 0.08); }
  else if (s.k === 3) { not(220, t + 0.02, 0.12, 0.12, 'triangle'); not(330, t + 0.09, 0.1, 0.08, 'triangle'); not(165, t + 0.16, 0.18, 0.1, 'triangle'); }
  else if (s.k === 4) { if (v < 0.02) return; not(s.go ? 230 : 105, t, 0.06, 0.05 + 0.18 * v, s.go ? 'triangle' : 'sine'); }   // nảy trên bàn, trên gỗ
  else if (s.k === 5) { not(190, t, 0.07, 0.14, 'triangle'); not(72, t + 0.32, 0.22, 0.22); }                                // qua thành bàn, rơi xuống sàn
}
function tiengCham() { if (amThanh()) not(880, am.currentTime + 0.01, 0.05, 0.03); }
function tiengVao() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(659.25, t, 0.16, 0.05); not(987.77, t + 0.11, 0.24, 0.05); }
function tiengLoi() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(196, t, 0.3, 0.08, 'triangle'); not(185, t + 0.16, 0.36, 0.07, 'triangle'); }
function tiengThang() { if (!amThanh()) return; const t = am.currentTime + 0.02; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => not(f, t + i * 0.11, 0.5, 0.12, 'triangle')); }
function tiengToiLuot() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(659.25, t, 0.16, 0.05); not(987.77, t + 0.13, 0.26, 0.05); if (navigator.vibrate) navigator.vibrate(40); }

/* ======================================================================================================
   CHƠI QUA MẠNG — chỉ ở quán bida 16 bàn (người dùng: "bỏ chức năng tạo phòng đi, vì tôi muốn giới hạn 16 bàn này thôi").
   Mỗi bàn là một phòng bida/<mã> có khoá ban, hai ghế, hai người; không còn phòng riêng, link mời, phòng mở, máy chơi thay
   (assets/phong.js nói chuyện với Firebase, luật bảo vệ ở firebase-rules.json, nhánh bida và quan).
   Máy chủ chỉ giữ danh sách cú đánh: mỗi cú ghi cả cú (d: hướng, lực, xoáy, chỗ đặt bi chủ, lỗ chọn cho bi 8) lẫn kết quả
   (kq: bi chạm đầu, có bi chạm băng, bi nào vào lỗ nào, vị trí cuối của từng bi). Máy nào cũng đọc lần lượt từ đầu, áp
   luật lên kết quả, nên thế bàn và lượt đi luôn như nhau; máy đang xem thì chạy lại cú đó cho thấy bi lăn (cùng phép tính
   nên ra y hệt), xong thì đặt bi đúng theo kết quả ghi. Luật Firebase chỉ cho thêm cú vào cuối, ai ghi trước vào ô số n
   thì cú đó được; cú không đúng lượt, không đúng luật thì máy nào cũng bỏ qua như nhau.
   ====================================================================================================== */
const MANG = self.TDTD_PHONG;
let phong = null;
const VANG = 60000, NHIP = 20000;                   // im lặng quá 60 giây là coi như đã rời; 20 giây báo "còn ở đây" một lần
const gheCua = (P) => (phong && phong.cay && phong.cay.ghe ? phong.cay.ghe[P] : null);
const gioMay = () => Date.now() + (phong ? phong.lech : 0);   // giờ máy chủ, đo lệch qua dấu giờ của chính mình
const soGhe = () => (phong && phong.cay ? Math.max(2, Math.min(4, phong.cay.so || 2)) : 2);
const cacGhe = () => Array.from({ length: soGhe() }, (_, P) => P);
function conO(P) { const g = gheCua(P); return !!g && (P === phong.P || (!!g.thay && gioMay() - g.thay < VANG)); }
function tenGhe(P) { const g = gheCua(P); return (g && g.ten) || `Người ${P + 1}`; }
const tenMinh = () => String(docLuu().ten || '').trim().slice(0, 20);
const MA_DIA_CHI = /^#bida\/([A-HJ-NP-Z2-9]{6})$/;
const dauThang = () => (typeof location !== 'undefined' && location.hash) || '';
function datDiaChi(ma) {
  try { history.replaceState(history.state, '', location.pathname + location.search + '#bida' + (ma ? '/' + ma : '')); } catch (e) {}
}
/* hạt giống xếp bi của phòng: lấy từ mã phòng, máy nào cũng ra cùng một cách xếp */
function hatPhong(ma) { let h = 2166136261; for (const c of String(ma)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 1; }
const khoaCu = (r) => `${r.P}|${r.d}|${r.kq}`;

async function taoPhong(ch) {
  if (!MANG) return false;
  const id = MANG.idMoi(), P = ch.P || 0, ten = ch.ten || `Người ${P + 1}`;
  moTin(`<p class="bd-tin-nho">Quán bida${ch.ban ? ' · bàn ' + ch.ban : ''}</p><h2>Đang mở bàn…</h2>`);
  for (let lan = 0; lan < 4; lan++) {
    const ma = ch.ma || MANG.maMoi();
    const gt = { tao: MANG.GIO, chu: P, kieu: ch.kieu, so: ch.so, kho: ch.kho, pha: ch.pha || 0, ghe: { [P]: { id, ten, thay: MANG.GIO } } };
    if (ch.kieu === 3) { gt.luat = [0, 1, 3].includes(ch.luat) ? ch.luat : 0; gt.dich = [5, 10, 15, 25].includes(ch.dich) ? ch.dich : 10; }
    if (ch.ban) gt.ban = ch.ban;
    const r = await MANG.goi(`bida/${ma}`, 'PUT', gt);
    if (r.ok) { vaoPhong(ma, { id, P }); if (phong && ch.ban) { phong.choTu = Date.now(); if (ch.hen) phong.henLai = Object.assign({ tu: Date.now() }, ch.hen); } return true; }
    if (r.ma !== 401 || ch.ma) break;               // mất mạng, hay mã định sẵn (ván nữa) đã có người dùng
  }
  moTin(`<p class="bd-tin-nho">Quán bida${ch.ban ? ' · bàn ' + ch.ban : ''}</p><h2>Chưa mở được bàn</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" data-man="quan">Về quán</button>`);
  return false;
}
/* vào phòng: minh = { id, P } khi đã có ghế (người tạo phòng, hay mở lại); muonNgoi: ghế muốn ngồi khi theo ván nữa */
function vaoPhong(ma, minh, muonNgoi = -1, tuMo = false, xem = false) {
  if (!MANG || !MANG.laMa(ma)) return;
  const cu = docLuu().cu;
  if (!minh && !xem && cu && cu.ma === ma) minh = { id: cu.id, P: cu.P };   // vừa rời phòng rồi mở lại link: vào lại đúng ghế
  dungLuong();
  if (van && van.cheDo === 'phong') { boViec(); van = null; dang = null; mayNgam = null; }
  phong = { ma, id: minh ? minh.id : MANG.idMoi(), P: minh ? minh.P : -1, cay: undefined, ke: 0, nhat: [], hop: [], daGui: null, lech: 0,
    song: false, nhipCuoi: 0, muonNgoi, tuMo, choTiep: 0, sanhCu: '', xem };          // xem: ngồi sofa xem, không chơi
  if (phong.P >= 0) ghiLuu({ phong: { ma, id: phong.id, P: phong.P } });
  datDiaChi(ma);
  noiPhong();
  capNhatChu();
  if (!tuMo) moTin('<p class="bd-tin-nho">Quán bida</p><h2>Đang vào bàn…</h2>');
}
function noiPhong() {
  if (!phong || phong.luong) return;
  phong.luong = MANG.nghe(`bida/${phong.ma}`, khiPhongDoi, () => { if (phong) { phong.rot = true; capNhatChu(); } });
  phong.kiem = setInterval(kiemPhong, 5000);
}
function dungLuong() {                               // tạm ngưng nghe (đóng trò), vẫn giữ chỗ trong phòng
  if (!phong) return;
  if (phong.luong) { phong.luong.dung(); phong.luong = null; }
  if (phong.kiem) { clearInterval(phong.kiem); phong.kiem = 0; }
}
function roiPhong() {                                // rời hẳn
  if (!phong) return;
  const cay = phong.cay, ma = phong.ma;
  dungLuong();
  if (cay && cay.xong && gioMay() - cay.xong > 300000) MANG.goi(`bida/${ma}`, 'DELETE');   // hết ván đủ 5 phút thì dọn
  /* nhớ ghế để mở lại link là ngồi lại đúng chỗ — ghế đã giành thì máy chủ không cho xoá, không nhớ thì ghế cũ chặn mình */
  const cu = cay && !cay.xong && phong.P >= 0 ? { ma, id: phong.id, P: phong.P } : undefined;
  phong = null;
  ghiLuu({ phong: undefined, cu });
  if (van && van.cheDo === 'phong') { boViec(); van = null; dang = null; mayNgam = null; }
  datDiaChi('');
  capNhatChu();
}
function khiPhongDoi(cay) {
  if (!phong) return;
  const truoc = phong.cay;
  phong.cay = cay; phong.rot = false;
  if (cay == null) {
    if (phong.choTiep && Date.now() - phong.choTiep < 20000) return;   // vừa theo "ván nữa": phòng mới đang được tạo
    const ma = phong.ma, tuMo = phong.tuMo, banCu = phong.banCu;
    roiPhong();
    if (banCu) { moMan('quan'); bao('Ván mới không mở được — chọn bàn trong quán nhé.'); return; }
    if (tuMo) moCaiDat();
    else moTin('<p class="bd-tin-nho">Quán bida</p><h2>Không thấy bàn này</h2><p>Ván đã xong, hay link cũ.</p><button type="button" data-man="quan">Về quán</button>');
    return;
  }
  phong.choTiep = 0;
  const g = gheCua(phong.P), gCu = truoc && truoc.ghe && truoc.ghe[phong.P];
  if (phong.P >= 0 && g && g.id === phong.id && g.thay && !(gCu && gCu.thay === g.thay)) phong.lech = g.thay - Date.now();
  if (phong.P >= 0 && g && g.id !== phong.id) { phong.P = -1; ghiLuu({ phong: undefined }); bao('Ghế đó vừa có người khác ngồi trước.'); }
  if ((cay.tao && gioMay() - cay.tao > 86400000) || (phong.tuMo && cay.xong)) {      // phòng đã cũ: dọn luôn, khỏi mở lại
    const tuMo = phong.tuMo;
    if (cay.tao && gioMay() - cay.tao > 86400000) MANG.goi(`bida/${phong.ma}`, 'DELETE');
    roiPhong();
    if (tuMo) moCaiDat(); else moTin('<p class="bd-tin-nho">Quán bida</p><h2>Ván này đã đóng</h2><p>Mỗi ván chỉ giữ trong một ngày.</p><button type="button" data-man="quan">Về quán</button>');
    return;
  }
  if (!cay.ban) {                                                     // phòng riêng kiểu cũ (trước khi chỉ còn quán): không vào nữa
    const tuMo = phong.tuMo;
    roiPhong();
    if (tuMo) moCaiDat(); else { moMan('quan'); bao('Phòng riêng không còn nữa — chơi qua mạng giờ ở quán bida, 16 bàn.'); }
    return;
  }
  phong.tuMo = false;
  if (!cay.batDau) { veSanhQuan(); return; }
  if (cay.ban && phong.P < 0 && !phong.xem) { roiPhong(); moMan('quan'); bao('Bàn vừa đủ người — chọn bàn khác nhé.'); return; }   // quán: xem thì ngồi sofa, không đứng xem
  if (!van || van.cheDo !== 'phong' || van.ma !== phong.ma) { batDauVanPhong(); return; }
  kiemNhat();
  const duoi = duoiNho();
  if (duoi && van && !van.hetVan && phong.ke > duoi.n) { dungLaiPhong(); return; }
  chayPhong();
  capNhatChu();
  if (van && van.hetVan && tam && tam.querySelector('.bd-tin .bd-vannua, .bd-tin .bd-vaotiep, .bd-tin .bd-het-xem')) ketThucVan(true);   // có lời mời ván nữa
}
/* hai ghế của bàn: ai ngồi, ai phá trước, ai vắng */
function hangGhe(cay, minh) {
  return `<div class="bd-ghe-hang bd-ghe-${soGhe()}">` + cacGhe().map(P => {
    const g = gheCua(P), ten = g ? esc(P === minh ? 'Bạn' : (g.ten || `Người ${P + 1}`)) : 'Chờ bạn';
    const phu = [`Ghế ${P + 1}`, P === (cay.pha || 0) ? 'phá trước' : '', g && !conO(P) ? 'vắng' : '', !g ? 'ghế trống' : ''].filter(Boolean).join(' · ');
    return `<div class="bd-ghe-o${g ? '' : ' bd-ghe-trong'}${P === minh ? ' bd-ghe-minh' : ''}"><b>${ten}</b><small>${phu}</small></div>`;
  }).join('') + '</div>';
}
const kieuChu = (cay) => `${cay && cay.kieu === 9 ? '9 bi' : cay && cay.kieu === 3 ? `3 bi · ${TEN_LUAT3[cay.luat || 0]}` : '8 bi'} · ${soGhe()} người`;
async function ngoiGhe(P) {
  if (!phong || phong.P >= 0) return;
  const o = tam && tam.querySelector('.bd-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  const r = await MANG.goi(`bida/${phong.ma}/ghe/${P}`, 'PATCH', { id: phong.id, ten: tenMinh() || `Người ${P + 1}`, thay: MANG.GIO });
  if (!phong) return;
  if (r.ok) {
    phong.P = P; phong.nhipCuoi = Date.now();
    ghiLuu({ phong: { ma: phong.ma, id: phong.id, P } });
    if (phong.cay && phong.cay.ban) MANG.goi(`quan/${phong.cay.ban}`, 'PATCH', { [`ten/${P}`]: tenMinh() || `Người ${P + 1}`, choi: cacGhe().every(Q => Q === P || gheCua(Q)), thay: MANG.GIO });
    if (phong.cay) khiPhongDoi(phong.cay);
  } else bao(r.ma === 401 ? (phong.cay && phong.cay.batDau ? 'Ván đã bắt đầu, không vào ghế được nữa.' : 'Ghế này vừa có người ngồi.') : 'Mất mạng, chưa vào được ghế.');
  return r;
}
async function batDauPhong() {
  if (!phong || !phong.cay || phong.cay.batDau) return;
  const r = await MANG.goi(`bida/${phong.ma}/batDau`, 'PUT', MANG.GIO);
  if (!r.ok && r.ma !== 401) bao('Mất mạng, chưa bắt đầu được.');
}
function batDauVanPhong() {
  boViec();
  dang = null; mayNgam = null;
  const cay = phong.cay, kieu = cay.kieu === 9 || cay.kieu === 3 ? cay.kieu : 8, so = soGhe(), pha = Math.max(0, Math.min(so - 1, cay.pha || 0)), hat = hatPhong(phong.ma);
  const tuy = kieu === 3 ? { luat: cay.luat, dich: cay.dich } : undefined;
  datLoi(kieu);                                                       // bida 3 bi: bàn phăng; còn lại bàn lỗ
  van = { cheDo: 'phong', kieu, so, kho: [0, 1, 2].includes(cay.kho) ? cay.kho : 1, pha, hat, tuy, minh: phong.P, ma: phong.ma,
    the: L.theMoi(kieu, so, hat, pha, tuy), nguoi: [], hetVan: false, doiMay: false };
  Object.assign(phong, { ke: 0, nhat: [], hop: [], daGui: null, song: false });
  ngam.a = 0; ngam.b = 0;
  tatTin();
  chayPhong();
  if (van && laMinh(van.the.luot) && van.the.pha) bao(kieu === 3 ? `Bạn khai cuộc bằng bi ${TEN_BI3[caHien()]}: phải chạm bi đỏ trước.` : 'Bạn phá trước: kéo bi trắng để đặt, kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh.');
}
/* áp các cú mới tới từ máy chủ, theo đúng thứ tự. Vào phòng (hay dựng lại) thì áp ngay hết; đang chơi thì cú mới nhất cho
   thấy cơ thọc rồi bi lăn, xong lại gọi tiếp (xongHoat → chayPhong). */
function chayPhong() {
  if (!phong || !van || van.cheDo !== 'phong' || dang || mayNgam) return;
  const ds = (phong.cay && phong.cay.cu) || {};
  for (;;) {
    const r = ds[phong.ke];
    if (!r) break;
    /* quán bida: người tới lượt bị mời ra (quá 3 phút không đánh) đúng sau cú thứ n — máy nào cũng dừng ván ở đó */
    const duoi = duoiTai(phong.ke);
    if (duoi >= 0 && van.the.thang < 0) { apDuoi(duoi); break; }
    const cu = L.docCu(r.d), kq = L.docKq(r.kq);
    if (cu && van.kieu === 3) cu.ca = L.caCua(van.the);             // bida 3 bi: bi chủ là bi của người tới lượt
    const hop = !!cu && !!kq && r.P === van.the.luot && L.cuHopLe(van.the, cu) && L.kqHopLe(van.the, cu, kq);
    phong.nhat.push(khoaCu(r)); phong.hop.push(hop);
    phong.ke++;
    if (!hop) continue;                              // cú sai lượt, sai luật: máy nào cũng bỏ qua như nhau
    if (van.doiMay) boViec();                        // máy khác đã đánh giùm trước
    /* trang đang ẩn (chuyển sang app khác) thì trình duyệt không chạy hình động: áp ngay cho khỏi dồn lại */
    if (!phong.song || ds[phong.ke] || (typeof document !== 'undefined' && document.hidden)) { van.the = L.apCu(van.the, cu, kq).the; continue; }
    const viTri = L.viTriDanh(van.the, cu), P = r.P;
    batNgamMay(cu, P, 700, () => batDauHoat(viTri, cu, kq, P));
    return;
  }
  const duoiCuoi = duoiTai(phong.ke);
  if (duoiCuoi >= 0 && van.the.thang < 0) apDuoi(duoiCuoi);
  phong.song = true;
  denLuot();
}
/* ghi cú của mình lên máy chủ */
function guiCu(cu, kq, P) {
  if (!phong || !MANG || van.the.luot !== P) return false;
  const n = phong.ke, rec = { P, d: L.maCu(cu), kq: L.maKq(kq) }, ma = phong.ma;
  phong.ke++; phong.nhat.push(khoaCu(rec)); phong.hop.push(true); phong.daGui = { n, P };
  MANG.goi(`bida/${ma}/cu/${n}`, 'PUT', rec).then((r) => {
    if (!phong || phong.ma !== ma || !phong.daGui || phong.daGui.n !== n || r.ok) return;
    phong.daGui = null;
    bao(r.ma === 401 ? 'Cú vừa rồi không được tính — máy khác đã ghi trước.' : 'Mất mạng, cú vừa rồi chưa gửi được.');
    dungLaiPhong();
  });
  return true;
}
/* các cú đã áp phải khớp danh sách trên máy chủ; lệch (hiếm: hai máy cùng ghi một ô) thì dựng lại từ đầu */
function kiemNhat() {
  const ds = (phong.cay && phong.cay.cu) || {};
  for (let i = 0; i < phong.nhat.length; i++) {
    const r = ds[i];
    if (!r) { if (phong.daGui && phong.daGui.n === i) continue; dungLaiPhong(); return; }
    if (khoaCu(r) !== phong.nhat[i]) { dungLaiPhong(); return; }
  }
  if (phong.daGui && ds[phong.daGui.n]) phong.daGui = null;
}
function dungLaiPhong() {
  if (!van || !phong) return;
  boViec();
  dang = null; mayNgam = null;
  van.the = L.theMoi(van.kieu, van.so, van.hat, van.pha, van.tuy);
  van.hetVan = false;
  Object.assign(phong, { ke: 0, nhat: [], hop: [], daGui: null, song: false });
  chayPhong();
}
/* mỗi 5 giây: báo mình còn ở đây, nối lại luồng nếu đã đóng, canh bàn trong quán */
function kiemPhong() {
  if (!phong) return;
  if (phong.P >= 0 && Date.now() - phong.nhipCuoi > NHIP && !(typeof document !== 'undefined' && document.hidden)) {
    phong.nhipCuoi = Date.now();
    MANG.goi(`bida/${phong.ma}/ghe/${phong.P}/thay`, 'PUT', MANG.GIO);
  }
  if (phong.luong) phong.luong.noiLai();
  if (!phong.cay) { if (phong.cay === null && phong.choTiep && Date.now() - phong.choTiep > 20000) khiPhongDoi(null); return; }   // ván nữa không thành
  kiemBanQuan();
  if (!phong) return;
  if (!phong.cay.batDau) veSanhQuan();
  else if (van && van.cheDo === 'phong' && !dang && !mayNgam) { capNhatChu(); denLuot(); }
}
/* bấm Bàn giữa ván: ai đang ở bàn, luật giữ bàn, Về quán (bỏ ngang) */
function moPhongTT() {
  const cay = phong.cay, xem = phong.P < 0;
  moTin(`<p class="bd-tin-nho">Quán bida · bàn ${cay.ban} · ${kieuChu(cay)}</p><h2>${xem ? 'Bạn đang ngồi sofa xem' : 'Đang chơi'}</h2>${hangGhe(cay, phong.P)}
    <p class="bd-meo">${xem ? 'Người xem chỉ xem, không đánh. Về quán thì chỗ trên sofa nhường cho người khác.' : 'Tới lượt mà 3 phút không đánh là bị mời khỏi bàn. Về quán giữa ván là bỏ ngang: người kia thắng.'}</p>
    <button type="button" class="bd-dongtin">${xem ? 'Xem tiếp' : 'Chơi tiếp'}</button>
    <button type="button" class="bd-phu bd-roiban">${xem ? 'Về quán' : 'Về quán (bỏ ngang)'}</button>`);
}
/* ván nữa: ai bấm trước thì giữ chỗ mã phòng mới trong phòng cũ (tiep, ghi một lần), rồi tạo phòng đó; người kế phá */
async function vanNua() {
  if (!phong || !phong.cay) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }
  const cu = phong.ma, cay = phong.cay, P = phong.P >= 0 ? phong.P : 0, ma = MANG.maMoi();
  const r = await MANG.goi(`bida/${cu}/tiep`, 'PUT', ma);
  if (!phong || phong.ma !== cu) return;
  if (!r.ok) { bao(r.ma === 401 ? 'Có người vừa mời ván nữa — bấm Vào ván mới.' : 'Mất mạng, thử lại nhé.'); return; }
  /* quán bida: ván nữa ở đúng bàn đó — bàn trỏ sang phòng mới (phòng cũ đã xong nên máy chủ cho ghi) và giữ chỗ cho người cùng
     bàn: cả quán thấy bàn đang chơi, khỏi có người lạ vào trước */
  let hen;
  if (cay.ban) {
    const Q = cacGhe().find(x => x !== P && gheCua(x) && !(cay.duoi && cay.duoi[x])), ten = { [P]: tenMinh() || `Người ${P + 1}` };
    if (Q !== undefined) { hen = { P: Q, ten: gheCua(Q).ten || `Người ${Q + 1}` }; ten[Q] = hen.ten; }
    const rq = await MANG.goi(`quan/${cay.ban}`, 'PUT', dongBanMoi(ma, cay.kieu, ten, !!hen, cay.luat, cay.dich));
    if (!phong || phong.ma !== cu) return;
    if (!rq.ok) {                                                     // bàn vừa đổi (người kia bấm Ở lại bàn trước): vào chờ cùng, hay về quán
      roiPhong(); moMan('quan');
      if (rq.ma === 401) vaoBanQuan(cay.ban); else bao('Mất mạng, thử lại nhé.');
      return;
    }
  }
  await taoPhong({ P, kieu: cay.kieu === 9 || cay.kieu === 3 ? cay.kieu : 8, so: soGhe(), kho: cay.kho || 0, ten: tenMinh() || `Người ${P + 1}`, ma, pha: ((cay.pha || 0) + 1) % soGhe(),
    luat: cay.luat, dich: cay.dich, ban: cay.ban, hen });
}
function theoTiep(ma) {
  const P = phong && phong.P >= 0 ? phong.P : -1, ban = (phong && phong.cay && phong.cay.ban) || '', xem = !!(phong && phong.xem);
  vaoPhong(ma, null, P, false, xem);
  if (phong) { phong.choTiep = Date.now(); phong.banCu = ban; }
}
function theoMaTrenDiaChi() {
  if (!tam || !tam.classList.contains('hien') || !MANG) return;
  const m = MA_DIA_CHI.exec(dauThang());
  if (m && (!phong || phong.ma !== m[1])) { const l = docLuu().phong; vaoPhong(m[1], l && l.ma === m[1] ? { id: l.id, P: l.P } : null); }
}

/* ======================================================================================================
   QUÁN BIDA — người dùng: "Cái chỗ vào phòng cho là có 8 bàn bida 3 bi, 8 bàn bida lỗ, như 1 quán thực tế á, làm 3d; full hết
   thì ko cho vô nữa; tính toán cách giữ bàn vd sao 3p ko đánh là bị kích ra để người khác vô".
   16 bàn cố định: L1–L8 bàn lỗ (8 bi, 9 bi), P1–P8 bàn phăng (bida 3 bi), hai người một bàn. Mỗi bàn là một dòng quan/<bàn>
   trên máy chủ: phòng đang chơi ở đó (ma), kiểu, tên người ngồi, đang chơi chưa, giờ "thay" người ngồi ghi lại mỗi 20 giây.
   Giữ bàn (luật máy chủ cùng canh):
   - tới lượt mà 3 phút không đánh: máy người kia ghi duoi/<ghế> kèm số cú lúc đó — mọi máy dừng ván đúng chỗ đó, người bị mời
     thua và thôi giữ bàn; người còn lại ở lại chờ người mới hay về quán. Người kia cũng đã đi (không ai mời giùm) thì 15 giây
     sau chính máy mình ghi. Bỏ ngang (Về quán giữa ván) cũng tính như bị mời ra;
   - hết ván: bàn giữ thêm 3 phút cho Chơi ván nữa, Ở lại bàn; không ai bấm gì thì tự nhường. Về quán khi người kia còn ở bàn
     thì để bàn lại cho người đó;
   - Chơi ván nữa: bàn giữ chỗ cho người cùng bàn một phút (cả quán thấy là đang chơi), quá thì mở cho người khác vào;
   - ngồi chờ một mình quá 5 phút chưa ai vào: tự nhường bàn;
   - bàn quá 3 phút không ai ghi "thay" (tắt app, mất mạng): coi như trống, ai ngồi cũng được.
   Kín bàn (không bàn trống, không bàn có người chờ) thì không vào được. Hai người cùng vào một ghế: người sau sang ghế còn
   trống, hết ghế thì về quán.
   ====================================================================================================== */
const BAN_QUAN = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const GIU_BAN = 180000, CHO_BAN = 300000, NHIP_QUAN = 20000, HEN_LAI = 60000, XEM_TOI_DA = 3, XEM_VANG = 60000;
let quan = null;                                                      // { ds: dòng từng bàn, luc, loi, hinh: chỗ bàn trên hình, ban, khoa }
const dongBan = (ban) => (quan && quan.ds && quan.ds[ban]) || null;
/* dòng mới của một bàn; bàn phăng ghi kèm luật, số điểm cho người trong quán biết bàn đánh gì trước khi vào */
const dongBanMoi = (ma, kieu, ten, choi, luat, dich) => Object.assign({ ma, kieu, so: 2, ten, thay: MANG.GIO }, choi ? { choi: true } : {},
  kieu === 3 ? { luat: [0, 1, 3].includes(luat) ? luat : 0, dich: [5, 10, 15, 25].includes(dich) ? dich : 10 } : {});
const kieuBanChu = (d, lo) => (lo ? (d.kieu === 9 ? '9 bi' : '8 bi') : `bida 3 bi, ${TEN_LUAT3[[0, 1, 3].includes(d.luat) ? d.luat : 0]}, tới ${[5, 10, 15, 25].includes(d.dich) ? d.dich : 10} điểm`);
const tenBanQuan = (d, P) => (d && d.ten && d.ten[P] ? String(d.ten[P]).slice(0, 20) : '');
/* "bây giờ" để xét bàn cũ: giờ máy mình, mà đồng hồ máy mình chậm hơn máy chủ thì lấy giờ "thay" mới nhất trong quán (giờ máy chủ,
   không thể ở tương lai) — khỏi thấy bàn bỏ quên còn người chỉ vì đồng hồ chậm */
const nayQuan = () => Math.max(Date.now(), (quan && quan.moc) || 0);
function trangBan(ban) {                                              // 'trong' | 'cho' (một người chờ) | 'choi'
  const d = dongBan(ban);
  if (!d || typeof d.thay !== 'number' || nayQuan() - d.thay > GIU_BAN) return 'trong';
  return d.choi ? 'choi' : 'cho';
}
/* người đang ngồi sofa xem bàn: mỗi người ghi quan/<bàn>/xem/<id> = giờ máy chủ 20 giây một lần; im quá 60 giây là đã đi */
function soXem(ban) {
  const d = dongBan(ban), x = d && d.xem, nay = nayQuan();
  return x && typeof x === 'object' ? Object.values(x).filter(t => typeof t === 'number' && nay - t < XEM_VANG).length : 0;
}
function demQuan() {
  const tk = { trong: 0, cho: 0, choi: 0 };
  for (const b of BAN_QUAN) tk[trangBan(b)]++;
  tk.kin = !tk.trong && !tk.cho;
  return tk;
}
function chuQuan() {
  if (!quan || !quan.luc) return 'Đang xem quán…';
  if (quan.loi) return quan.loi === 401 ? 'Máy chủ chưa cho xem quán — thử lại sau.' : 'Mất mạng — chưa xem được quán.';
  const tk = demQuan();
  return tk.kin ? `Quán kín bàn: cả ${tk.choi} bàn đang chơi. Đợi một lát rồi vào lại.` : `${tk.trong} bàn trống · ${tk.cho} bàn có người chờ · ${tk.choi} bàn đang chơi`;
}
async function taiQuan() {
  if (!MANG || !quan) return;
  const r = await MANG.goi('quan');
  if (!quan) return;
  if (r.ok) {
    quan.ds = r.du && typeof r.du === 'object' ? r.du : {}; quan.loi = 0;
    quan.moc = Math.max(0, ...Object.values(quan.ds).map(d => (d && typeof d.thay === 'number' ? d.thay : 0)));
  } else quan.loi = r.ma || -1;
  quan.luc = Date.now();
  if (manDang === 'quan') {
    veQuan();
    const p = tam && tam.querySelector('.bd-quan-tk'), l = tam && tam.querySelector('.bd-quan-ds'), h = dsQuan();
    if (p) p.textContent = chuQuan();
    if (l && h !== quan.dsCu) { quan.dsCu = h; l.innerHTML = h; }                // vẽ lại khi có bàn đổi (khỏi mất chỗ đang chọn bằng phím)
  }
  else if (manDang === 'ban' && quan.ban) {                           // bảng một bàn: vẽ lại khi bàn đổi trạng thái
    const khoa = trangBan(quan.ban) + JSON.stringify(dongBan(quan.ban) || {});
    if (khoa !== quan.khoa) moBanQuan(quan.ban);
  }
}
function batQuan() { if (!quan) quan = { ds: {}, luc: 0, loi: 0, hinh: [], ban: '', khoa: '' }; tatQuan(); quan.hen = setInterval(taiQuan, 4000); return taiQuan(); }
function tatQuan() { if (quan && quan.hen) { clearInterval(quan.hen); quan.hen = 0; } }

/* vẽ quán nhìn nghiêng từ trên cao: sàn gỗ, 16 bàn có đèn treo, người đứng ở bàn có người, nhãn trạng thái. Toạ độ thật (mét):
   x ngang, z vào sâu, y lên; khu bàn lỗ bên trái, khu bàn phăng bên phải, mỗi khu 2 cột × 4 hàng, bàn dọc theo chiều sâu.
   Chiếu phối cảnh (máy ảnh cao 17 m, lùi 1 m, chúc 64°: đủ nghiêng để thấy thân bàn, chân bàn, người đứng, đủ dốc để bàn xa không bé quá) rồi tự co cho vừa khung — điện thoại hay máy tính cũng đủ 16 bàn */
/* sofa của bàn (người dùng: "ý là ghế sofa ngồi chờ á, 1 ghế đc 3 4 người ngồi giống ngoài thật á"; "ai ngồi ghế sofa bàn
   nào thì có thể xem bàn đó, tất cả ngồi ghế sofa đi"): mỗi bàn một sofa bốn chỗ dọc cạnh dài, quay mặt vào bàn — dãy ngoài
   kê sát tường, dãy trong kê ở lối giữa hai khu. Chỗ đầu cho người ở bàn đang chờ (chờ bạn, hay chờ lượt), ba chỗ sau cho
   người xem. Trả [x tâm sofa, phía (−1 bên trái bàn, 1 bên phải)] */
const viTriSofa = (ban) => { const k = BAN_QUAN.indexOf(ban) % 8, sd = k % 2 ? 1 : -1, hx = ban[0] === 'P' ? 0.92 : 0.84; return [XEP_QUAN[ban][0] + sd * (hx + 0.8), sd]; };
const XEP_QUAN = (() => {
  const o = {};
  BAN_QUAN.forEach((b, i) => { const k = i % 8; o[b] = [(b[0] === 'P' ? 2.1 : -5.1) + (k % 2) * 3, 1.5 + Math.floor(k / 2) * 3.9]; });
  return o;
})();
function veQuan() {
  const cv = tam && tam.querySelector('.bd-quan-cv');
  if (!cv || !cv.getContext || !quan) return;
  const CY = 17, CZ = -1, A = 1.12, SA = Math.sin(A), CA = Math.cos(A);
  const tho = (x, y, z) => { const dy = y - CY, dz = z - CZ, sau = dz * CA - dy * SA, len = dy * CA + dz * SA; return [x / sau, -len / sau]; };
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const b of BAN_QUAN) {
    const [cx, cz] = XEP_QUAN[b], sx = viTriSofa(b)[0] - cx;
    for (const [dx, dz] of [[-1.5, -1.9], [1.5, -1.9], [-1.5, 1.9], [1.5, 1.9], [sx - 0.45, -1.2], [sx + 0.45, 1.2]]) for (const y of [0, 2.6]) {
      const [px, py] = tho(cx + dx, y, cz + dz); x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
    }
  }
  /* khung cao vừa đủ hình quán ở bề ngang đang có (không chừa khoảng tối), tối đa 56% màn hình, 460 px */
  const le = 10, tren = 16, w = cv.clientWidth || 340, dpr = Math.min(self.devicePixelRatio || 1, 2.5);
  const hMax = Math.min(460, Math.round((self.innerHeight || 800) * 0.56)), h = Math.max(220, Math.min(hMax, Math.ceil((y1 - y0) * (w - 2 * le) / (x1 - x0) + 2 * le + tren)));
  if (cv.style && cv.style.height !== h + 'px') cv.style.height = h + 'px';
  if (cv.width !== Math.round(w * dpr)) cv.width = Math.round(w * dpr);
  if (cv.height !== Math.round(h * dpr)) cv.height = Math.round(h * dpr);
  const g = cv.getContext('2d');
  if (!g || !g.setTransform) return;
  const s = Math.min((w - 2 * le) / (x1 - x0), (h - 2 * le - tren) / (y1 - y0)), ox = (w - (x1 - x0) * s) / 2 - x0 * s, oy = (h + tren - (y1 - y0) * s) / 2 - y0 * s;
  const chieu = (x, y, z) => { const [px, py] = tho(x, y, z); return [ox + px * s, oy + py * s]; };
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const nen = g.createLinearGradient(0, 0, 0, h); nen.addColorStop(0, '#120e0b'); nen.addColorStop(1, '#2b2018');
  g.fillStyle = nen; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,214,160,.07)'; g.lineWidth = 1;                                        // ván sàn
  for (let x = -8; x <= 8; x += 1) { const a = chieu(x, 0, -0.5), b = chieu(x, 0, 15.5); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.font = '600 11px system-ui,-apple-system,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,230,180,.55)';
  for (const [x, chu] of [[-3.6, 'BIDA LỖ'], [3.6, 'BIDA 3 BI']]) { const p = chieu(x, 2.4, 15.6); g.fillText(chu, p[0], p[1]); }
  quan.hinh = [];
  for (const b of BAN_QUAN.slice().sort((a, c) => XEP_QUAN[c][1] - XEP_QUAN[a][1])) veBanQuan(g, chieu, b);   // xa vẽ trước
}
const MAU_AO = ['#e08a3c', '#3fb5a5'], AO_XEM = '#9aa3b2', DA = '#f0d2b4', QUAN_AO = '#58627a', SO_CHO_SOFA = 4;   // áo ghế 1, ghế 2; áo người xem
function veBanQuan(g, chieu, ban) {
  const [cx, cz] = XEP_QUAN[ban], phang = ban[0] === 'P', st = trangBan(ban), d = dongBan(ban), Y = 0.8;
  const hx = phang ? 0.92 : 0.84, hz = phang ? 1.62 : 1.47;                // nửa bề ngang, nửa bề dài kể cả khung gỗ
  const tu = (ds, y) => ds.map(([x, z]) => chieu(cx + x, y, cz + z));
  const vuong = (x, z) => [[-x, -z], [x, -z], [x, z], [-x, z]];
  const to = (ds, mau) => { g.beginPath(); ds.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fillStyle = mau; g.fill(); };
  to(tu(vuong(hx + 0.3, hz + 0.3), 0), 'rgba(0,0,0,.38)');                // bóng trên sàn
  g.strokeStyle = '#24160d'; g.lineWidth = 2.5;                             // chân bàn
  for (const [x, z] of vuong(hx - 0.16, hz - 0.16)) { const a = chieu(cx + x, Y - 0.1, cz + z), b = chieu(cx + x, 0, cz + z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  to(tu([[-hx, -hz], [hx, -hz]], Y).concat(tu([[hx, -hz], [-hx, -hz]], Y - 0.2)), '#3a2215');   // mặt trước thân bàn
  const mat = tu(vuong(hx, hz), Y);
  to(mat, '#5e3621');
  const sang = st === 'trong';
  to(tu(vuong(hx - 0.13, hz - 0.13), Y + 0.004), phang ? (sang ? '#3f86d1' : '#285c98') : (sang ? '#2ea56c' : '#1b744b'));
  if (!phang) for (const [x, z] of [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]) {
    const p = chieu(cx + x * (hx - 0.13), Y + 0.01, cz + z * (hz - 0.13)); g.beginPath(); g.arc(p[0], p[1], 2, 0, 6.2832); g.fillStyle = '#070707'; g.fill();
  }
  /* đèn treo: ánh vàng loang trên mặt nỉ */
  const tam_ = chieu(cx, Y, cz), den = chieu(cx, 2.3, cz), rr = Math.abs(chieu(cx + hx, Y, cz)[0] - tam_[0]) * 1.4;
  const anh = g.createRadialGradient(tam_[0], tam_[1], 0, tam_[0], tam_[1], rr); anh.addColorStop(0, 'rgba(255,230,170,.22)'); anh.addColorStop(1, 'rgba(255,230,170,0)');
  g.fillStyle = anh; g.beginPath(); g.arc(tam_[0], tam_[1], rr, 0, 6.2832); g.fill();
  g.fillStyle = '#e9c27a'; g.fillRect(den[0] - rr * 0.35, den[1] - 2, rr * 0.7, 4);
  if (sang) { g.beginPath(); mat.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.strokeStyle = 'rgba(255,215,110,.95)'; g.lineWidth = 1.6; g.stroke(); }
  /* sofa của bàn, người ở bàn, người xem. Người cầm cơ đứng đánh; người ở bàn mà chưa tới lượt (hay đang chờ bạn vào) ngồi chỗ
     đầu sofa, áo màu ghế của mình; người xem ngồi ba chỗ sau, áo xám, không cầm cơ — nhìn là biết ai chơi, ai xem. Quán không
     biết lượt thật của ai, nên lúc đang chơi hai người đổi nhau (đứng đánh / ngồi chờ) mỗi 15 giây cho quán có không khí */
  const net = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  const be = (x, z, n = 0.34) => Math.max(3, Math.abs(chieu(x + n, 1, z)[0] - chieu(x - n, 1, z)[0]));   // người vẽ to hơn thật chút cho dễ thấy
  const [sx, sd] = viTriSofa(ban), sau = sx + sd * 0.3, truoc = sx - sd * 0.35, z0 = cz - 1.1, z1 = cz + 1.1;
  const khoi = (xa, xb, za, zb, y, mau) => to([[xa, za], [xb, za], [xb, zb], [xa, zb]].map(([a, b]) => chieu(a, y, b)), mau);
  to([chieu(sx - 0.42, 0, z0 - 0.05), chieu(sx + 0.42, 0, z0 - 0.05), chieu(sx + 0.42, 0, z1 + 0.05), chieu(sx - 0.42, 0, z1 + 0.05)], 'rgba(0,0,0,.32)');   // bóng
  to([chieu(truoc, 0.12, z0), chieu(truoc, 0.12, z1), chieu(truoc, 0.42, z1), chieu(truoc, 0.42, z0)], '#4a2119');      // mặt trước đệm ngồi
  khoi(truoc, sau, z0, z1, 0.42, '#7b3b2e');                                                                            // đệm ngồi
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1;
  for (let k = 1; k < SO_CHO_SOFA; k++) net(chieu(truoc, 0.425, z0 + k * 0.55), chieu(sau, 0.425, z0 + k * 0.55));   // đường chia bốn chỗ
  to([chieu(sau, 0.42, z0), chieu(sau, 0.42, z1), chieu(sau, 0.92, z1), chieu(sau, 0.92, z0)], '#5e2b22');              // tựa lưng
  for (const za of [z0 - 0.12, z1]) khoi(Math.min(truoc, sau + sd * 0.1), Math.max(truoc, sau + sd * 0.1), za, za + 0.12, 0.62, '#5e2b22');   // tay vịn
  const ngoi = (k, ao) => {                                                                // ngồi chỗ k của sofa, đùi ngang về phía bàn, cẳng chân thả
    const z = z0 + 0.275 + k * 0.55, b = be(sx, z, 0.26), hong = chieu(sx + sd * 0.05, 0.5, z);
    g.lineCap = 'round';
    g.strokeStyle = QUAN_AO; g.lineWidth = b * 0.55; net(hong, chieu(sx - sd * 0.4, 0.5, z)); net(chieu(sx - sd * 0.4, 0.5, z), chieu(sx - sd * 0.46, 0, z));
    g.strokeStyle = ao; g.lineWidth = b; net(hong, chieu(sx + sd * 0.12, 1.02, z));
    g.lineCap = 'butt';
    const dau = chieu(sx + sd * 0.12, 1.24, z);
    g.beginPath(); g.arc(dau[0], dau[1], b * 0.5, 0, 6.2832); g.fillStyle = DA; g.fill();
  };
  const dung = (P) => {                                                                    // đứng cạnh bàn, cúi vào, cơ thọc xuống mặt nỉ
    const ben = -sd, x = cx + ben * (hx + 0.3), z = cz + (P ? 0.35 : -0.35), b = be(x, z);   // đứng phía không có sofa
    const vai = chieu(x - ben * 0.14, 1.3, z), dau = chieu(x - ben * 0.22, 1.5, z);
    g.strokeStyle = '#e2bd86'; g.lineWidth = Math.max(1.8, b * 0.3);                        // cơ dài 1,45 m: đuôi sau lưng, đầu chạm mặt nỉ
    net(chieu(x + ben * 0.6, 1.08, z + 0.38), chieu(cx + ben * 0.05, Y + 0.05, cz - 0.05));
    g.lineCap = 'round';
    g.strokeStyle = QUAN_AO; g.lineWidth = b * 0.6; net(chieu(x, 0, z), chieu(x, 0.88, z));
    g.strokeStyle = MAU_AO[P]; g.lineWidth = b; net(chieu(x, 0.88, z), vai);
    g.lineCap = 'butt';
    g.beginPath(); g.arc(dau[0], dau[1], b * 0.5, 0, 6.2832); g.fillStyle = DA; g.fill();
  };
  if (st === 'cho') { const P = tenBanQuan(d, 0) ? 0 : 1; ngoi(0, MAU_AO[P]); }
  else if (st === 'choi') {
    const ai = (Math.floor(Date.now() / 15000) + BAN_QUAN.indexOf(ban)) % 2;                // ai đang cầm cơ lúc này
    ngoi(0, MAU_AO[1 - ai]); dung(ai);
  }
  const xem = st === 'trong' ? 0 : soXem(ban);
  for (let k = 0; k < Math.min(XEM_TOI_DA, xem); k++) ngoi(1 + k, AO_XEM);
  quan.hinh.push({ ban, da: [chieu(truoc, 0.42, z0), chieu(sau, 0.42, z0), chieu(sau, 0.42, z1), chieu(truoc, 0.42, z1)], tam: chieu(sx, 0.42, cz) });   // chạm sofa là chạm bàn
  /* nhãn nằm trên mặt nỉ (không đè bàn bên cạnh): mã bàn trong ô màu trạng thái — xanh trống, cam có người chờ, xám đang chơi —
     dưới là tên người ở bàn, mỗi người một dòng, dài quá bề ngang mặt nỉ thì cắt bớt (bàn trống: ô xanh, viền vàng là đủ) */
  const rongNi = Math.abs(chieu(cx + hx - 0.13, Y, cz)[0] - chieu(cx - hx + 0.13, Y, cz)[0]);
  const dong = st === 'trong' ? [] : st === 'cho' ? [tenBanQuan(d, 0) || 'có người', 'chờ'] : [tenBanQuan(d, 0) || '?', tenBanQuan(d, 1) || '?'];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 11px system-ui,-apple-system,sans-serif';
  const rongMa = (g.measureText ? g.measureText(ban).width : 14) + 10;
  g.fillStyle = st === 'trong' ? '#187a4b' : st === 'cho' ? '#a8650f' : 'rgba(34,34,40,.94)';   // chữ trắng đủ tương phản (≥ 4,5:1)
  g.fillRect(tam_[0] - rongMa / 2, tam_[1] - 15, rongMa, 15);
  g.fillStyle = '#fff'; g.fillText(ban, tam_[0], tam_[1] - 7);
  if (xem) {                                                                               // người dùng: "trên bàn có mắt xem nếu có người xem"
    const ex = tam_[0] + rongMa / 2 + 3, ey = tam_[1] - 15;
    g.fillStyle = 'rgba(20,20,26,.92)'; g.fillRect(ex, ey, 24, 15);
    g.beginPath(); g.moveTo(ex + 2.5, ey + 7.5); g.quadraticCurveTo(ex + 8.5, ey + 1.5, ex + 14.5, ey + 7.5); g.quadraticCurveTo(ex + 8.5, ey + 13.5, ex + 2.5, ey + 7.5);
    g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.arc(ex + 8.5, ey + 7.5, 2.2, 0, 6.2832); g.fillStyle = '#1b1b22'; g.fill();
    g.font = '700 10px system-ui,-apple-system,sans-serif'; g.fillStyle = '#fff'; g.fillText(String(xem), ex + 19.5, ey + 8);
    g.font = '700 11px system-ui,-apple-system,sans-serif';
  }
  g.font = '600 10px system-ui,-apple-system,sans-serif';
  dong.forEach((chu, k) => {
    let ten = chu;
    while (ten.length > 2 && g.measureText && g.measureText(ten).width > rongNi + 6) ten = ten.slice(0, ten.endsWith('…') ? -2 : -1).trimEnd() + '…';
    const y = tam_[1] + 7 + k * 12;
    g.fillStyle = 'rgba(0,0,0,.65)'; g.fillText(ten, tam_[0] + 0.8, y + 0.8);
    g.fillStyle = '#fff'; g.fillText(ten, tam_[0], y);
  });
  quan.hinh.push({ ban, da: mat, tam: tam_ });
}
function trongDa(da, X, Y) {
  let c = false;
  for (let i = 0, j = da.length - 1; i < da.length; j = i++) { const [xi, yi] = da[i], [xj, yj] = da[j]; if ((yi > Y) !== (yj > Y) && X < (xj - xi) * (Y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
/* bàn ở chỗ chạm: trên mặt bàn (bàn gần trước), không trúng thì bàn có tâm gần nhất trong 34 px (bàn xa nhỏ, khó chạm) */
function banTai(X, Y) {
  if (!quan || !quan.hinh) return '';
  for (let i = quan.hinh.length - 1; i >= 0; i--) if (trongDa(quan.hinh[i].da, X, Y)) return quan.hinh[i].ban;
  let gan = '', kc = 34;
  for (const h of quan.hinh) { const k = Math.hypot(h.tam[0] - X, h.tam[1] - Y); if (k < kc) { kc = k; gan = h.ban; } }
  return gan;
}
/* hàng nút 16 bàn dưới hình quán: chạm cho trúng trên điện thoại (bàn xa vẽ nhỏ), và cho người dùng bàn phím, trình đọc màn hình */
const TEN_TRANG = { trong: 'trống', cho: 'có người chờ', choi: 'đang chơi' };
function dsQuan() {
  return BAN_QUAN.map(b => {
    const st = trangBan(b), d = dongBan(b), ten = st === 'trong' ? '' : [tenBanQuan(d, 0), tenBanQuan(d, 1)].filter(Boolean).join(' và '), xem = st === 'trong' ? 0 : soXem(b);
    return `<button type="button" class="bd-quan-o bd-quan-${st}" data-quanban="${b}" aria-label="Bàn ${b}, ${b[0] === 'L' ? 'bida lỗ' : 'bida 3 bi'}, ${TEN_TRANG[st]}${ten ? ': ' + esc(ten) : ''}${xem ? `, ${xem} người xem` : ''}">${b}</button>`;
  }).join('');
}
function chamQuan(e, cv) {
  const r = cv.getBoundingClientRect(), ban = banTai(e.clientX - r.left, e.clientY - r.top);
  if (ban) moBanQuan(ban);
}
/* bảng một bàn: trống thì chọn kiểu rồi ngồi chờ; có người chờ thì vào chơi; đang chơi thì thôi */
function moBanQuan(ban) {
  if (!quan) quan = { ds: {}, luc: 0, loi: 0, hinh: [], ban: '', khoa: '' };
  if (!quan.hen) quan.hen = setInterval(taiQuan, 4000);
  quan.ban = ban; manDang = 'ban';
  const st = trangBan(ban), d = dongBan(ban) || {}, lo = ban[0] === 'L', l = docLuu();
  quan.khoa = st + JSON.stringify(dongBan(ban) || {});
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="bd-chon${bat ? ' bd-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const oTen = `<p class="bd-nhan">Tên của bạn</p><input class="bd-o-ten" maxlength="20" value="${esc(tenMinh())}" placeholder="Để người kia biết là ai" autocomplete="nickname">`;
  const ten0 = esc(tenBanQuan(d, 0) || 'Người chơi'), ten1 = esc(tenBanQuan(d, 1) || 'Người chơi');
  const kieuBan = l.kieuBan === 9 ? 9 : 8, luat = [0, 1, 3].includes(l.luat) ? l.luat : 0, dich = [5, 10, 15, 25].includes(l.dich) ? l.dich : 10;
  let html = `<button type="button" class="bd-lui" data-man="quan">‹ Về quán</button><p class="bd-tin-nho">Bàn ${ban} · ${lo ? 'bida lỗ' : 'bida 3 bi'}</p>`;
  if (st === 'choi') {
    const xem = soXem(ban), con = XEM_TOI_DA - xem;
    html += `<h2>Bàn đang chơi</h2><p class="bd-meo">${ten0} – ${ten1} đang đánh ${kieuBanChu(d, lo)}.${xem ? ` ${xem} người đang ngồi sofa xem.` : ''}</p>
      ${con > 0 ? `<button type="button" class="bd-xemban" data-ban="${ban}">Ngồi sofa xem ván này</button><p class="bd-meo">Sofa bàn này còn ${con} chỗ cho người xem. Người xem chỉ xem, không đánh.</p>`
        : '<p class="bd-meo">Sofa bàn này đã kín người xem. Chọn bàn khác, hay đợi một lát.</p>'}`;
  }
  else if (st === 'cho') html += `<h2>${ten0} đang chờ người</h2><p class="bd-meo">${kieuBanChu(d, lo).replace(/^b/, 'B')} — vào là bắt đầu ngay, ${ten0} đánh trước.</p>${oTen}
    <button type="button" class="bd-vaoban" data-ban="${ban}">Vào chơi với ${ten0}</button>`;
  else html += `<h2>Bàn trống</h2>${lo ? `<p class="bd-nhan">Kiểu chơi</p><div class="bd-hang">${nut('8 bi', 8, kieuBan === 8, 'kieuban')}${nut('9 bi', 9, kieuBan === 9, 'kieuban')}</div>`
    : `<p class="bd-nhan">Luật</p><div class="bd-hang">${nut('Tự do', 0, luat === 0, 'luat')}${nut('1 băng', 1, luat === 1, 'luat')}${nut('3 băng', 3, luat === 3, 'luat')}</div>
      <p class="bd-nhan">Chơi tới (điểm)</p><div class="bd-hang">${[5, 10, 15, 25].map(n => nut(`${n}`, n, n === dich, 'dich')).join('')}</div>`}
    ${oTen}<button type="button" class="bd-ngoiban" data-ban="${ban}">Ngồi bàn này, chờ người vào</button>
    <p class="bd-meo">Ngồi chờ quá 5 phút chưa ai vào thì bàn tự nhường cho người khác.</p>`;
  moTin(html);
}
const luuTenO = () => { const o = tam && tam.querySelector('.bd-o-ten'); if (o) ghiLuu({ ten: String(o.value || '').trim().slice(0, 20) }); };
async function ngoiBanQuan(ban) {
  if (!MANG) return;
  luuTenO();
  const l = docLuu(), lo = ban[0] === 'L', kieu = lo ? (l.kieuBan === 9 ? 9 : 8) : 3, ma = MANG.maMoi(), ten = tenMinh() || 'Người 1';
  tatQuan();
  moTin(`<p class="bd-tin-nho">Quán bida · bàn ${ban}</p><h2>Đang ngồi vào bàn…</h2>`);
  const r = await MANG.goi(`quan/${ban}`, 'PUT', dongBanMoi(ma, kieu, { 0: ten }, false, l.luat, l.dich));
  if (!r.ok) { await batQuan(); moBanQuan(ban); bao(r.ma === 401 ? 'Bàn vừa có người khác ngồi.' : 'Mất mạng, chưa ngồi được.'); return; }
  const ok = await taoPhong({ P: 0, kieu, so: 2, kho: 1, ten, ma, pha: 0, ban, luat: lo ? undefined : l.luat, dich: lo ? undefined : l.dich });
  if (!ok) MANG.goi(`quan/${ban}`, 'DELETE');                          // không tạo được phòng: trả bàn (phòng không có thì luật cho xoá)
}
async function vaoBanQuan(ban) {
  luuTenO();
  if (quan) await taiQuan();
  const d = dongBan(ban);
  if (!d || trangBan(ban) !== 'cho' || !MANG.laMa(d.ma)) { moBanQuan(ban); bao('Bàn vừa đổi — xem lại nhé.'); return; }
  tatQuan();
  vaoPhong(d.ma);                                                     // phòng tải xong thì tự ngồi ghế còn trống (veSanhQuan)
}
/* ngồi sofa xem bàn đang chơi (người dùng: "ai ngồi ghế sofa bàn nào thì có thể xem bàn đó"): vào phòng của bàn mà không ngồi
   ghế, ghi mình lên sofa (quan/<bàn>/xem/<id>, giờ máy chủ); sofa có ba chỗ cho người xem, kín thì thôi */
async function xemBanQuan(ban) {
  if (quan) await taiQuan();
  const d = dongBan(ban);
  if (!d || trangBan(ban) !== 'choi' || !MANG.laMa(d.ma)) { moBanQuan(ban); bao('Bàn vừa đổi — xem lại nhé.'); return; }
  if (soXem(ban) >= XEM_TOI_DA) { moBanQuan(ban); bao('Sofa bàn này vừa kín người xem.'); return; }
  tatQuan();
  vaoPhong(d.ma, null, -1, false, true);
  if (!phong) return;
  phong.nhipQuan = Date.now();
  MANG.goi(`quan/${ban}/xem/${phong.id}`, 'PUT', MANG.GIO);
}
/* phòng của bàn trong quán: chờ người (đủ hai người thì chủ bàn bắt đầu luôn) */
function veSanhQuan() {
  const cay = phong.cay, minh = phong.P, ban = cay.ban, du = cacGhe().every(P => gheCua(P)), ph = phong;
  if (minh < 0 && !phong.xem && !phong.dangNgoi) {                   // vào bàn: ghế muốn ngồi; ghế đó vừa có người thì ghế còn trống
    const muon = phong.muonNgoi, P = muon >= 0 && !gheCua(muon) ? muon : cacGhe().find(Q => !gheCua(Q));
    if (P === undefined) { roiPhong(); moMan('quan'); bao('Bàn vừa đủ người — chọn bàn khác nhé.'); return; }
    phong.muonNgoi = -1; phong.dangNgoi = true;
    ngoiGhe(P).then(r => { if (phong !== ph || ph.P >= 0) return; ph.dangNgoi = false; if (r && r.ma === 401 && ph.cay && !ph.cay.batDau) veSanhQuan(); });
  }
  if (du && minh >= 0 && !cay.batDau && !phong.dangBatDau) { phong.dangBatDau = true; batDauPhong(); }   // đủ người: ai ngồi rồi cũng bắt đầu được, batDau ghi một lần
  const con = phong.choTu ? Math.max(0, CHO_BAN - (Date.now() - phong.choTu)) : CHO_BAN, hen = phong.henLai;
  const meo = du || minh < 0 ? '' : hen ? `Bàn giữ chỗ cho ${esc(hen.ten)} một phút; quá thì ai trong quán cũng vào được.`
    : `Ai trong quán chạm vào bàn ${ban} là vào chơi với bạn. Chờ quá 5 phút chưa có ai thì bàn tự nhường (còn ${Math.ceil(con / 60000)} phút).`;
  const tieu = phong.xem ? 'Chờ ván mới bắt đầu' : du ? 'Đủ người — vào ván…' : minh < 0 ? 'Đang vào bàn…' : hen ? `Đang chờ ${esc(hen.ten)} vào ván mới` : 'Đang chờ người vào bàn';
  const html = `<p class="bd-tin-nho">Quán bida · bàn ${ban} · ${kieuChu(cay)}${phong.xem ? ' · bạn đang ngồi sofa xem' : ''}</p><h2>${tieu}</h2>${hangGhe(cay, minh)}
    ${meo ? `<p class="bd-meo">${meo}</p>` : ''}
    <button type="button" class="bd-phu bd-roiban">Về quán${minh >= 0 && !du ? ' (nhường bàn)' : ''}</button>`;
  if (html !== phong.sanhCu || tam.querySelector('.bd-tin').hidden) { phong.sanhCu = html; moTin(html, 'sanh'); }
}
/* mỗi 5 giây (cùng nhịp kiemPhong): ghi "thay" cho bàn (khi bàn còn trỏ về phòng mình), hết hẹn ván nữa thì mở bàn, nhường bàn
   khi chờ hay hết ván quá lâu, mời người quá 3 phút không đánh ra */
function kiemBanQuan() {
  const cay = phong && phong.cay;
  if (cay && cay.ban && phong.xem) {                                                     // ngồi sofa xem: giữ chỗ trên sofa
    const nay = Date.now(), ma = phong.ma, ban = cay.ban, id = phong.id;
    if (!phong.nhipQuan || nay - phong.nhipQuan > NHIP_QUAN) {
      phong.nhipQuan = nay;
      MANG.goi(`quan/${ban}/ma`).then(r => { if (r.ok && r.du === ma && phong && phong.ma === ma && phong.xem) MANG.goi(`quan/${ban}/xem/${id}`, 'PUT', MANG.GIO); });
    }
    return;
  }
  if (!cay || !cay.ban || phong.P < 0 || (cay.duoi && cay.duoi[phong.P])) return;      // đã bị mời ra: thôi giữ bàn
  const nay = Date.now(), ma = phong.ma, ban = cay.ban;
  if (!phong.nhipQuan || nay - phong.nhipQuan > NHIP_QUAN) {
    phong.nhipQuan = nay;
    MANG.goi(`quan/${ban}/ma`).then(r => { if (r.ok && r.du === ma && phong && phong.ma === ma) MANG.goi(`quan/${ban}/thay`, 'PUT', MANG.GIO); });
  }
  if (!cay.batDau) {
    const hen = phong.henLai;
    if (hen && (gheCua(hen.P) || nay - hen.tu > HEN_LAI)) {          // hẹn ván nữa: người kia đã vào, hay quá một phút chưa vào thì mở bàn
      phong.henLai = null;
      if (!gheCua(hen.P)) MANG.goi(`quan/${ban}`, 'PATCH', { [`ten/${hen.P}`]: null, choi: false, thay: MANG.GIO });
    }
    if (phong.P === cay.chu && phong.choTu && nay - phong.choTu > CHO_BAN) nhuongBan('Chờ quá 5 phút chưa có ai vào — bàn đã nhường cho người khác.');
    return;
  }
  if (!van || van.cheDo !== 'phong' || van.ma !== ma) return;
  if (cay.xong || van.the.thang >= 0) {                               // hết ván: giữ bàn thêm 3 phút cho Chơi ván nữa, Ở lại bàn
    if (!phong.hetTu) phong.hetTu = nay;
    else if (nay - phong.hetTu > GIU_BAN) nhuongBan('Hết ván đã 3 phút — bàn đã nhường cho người khác.');
    return;
  }
  const khoa = `${van.the.soCu}|${van.the.luot}`;
  if (phong.luotKhoa !== khoa) { phong.luotKhoa = khoa; phong.luotTu = nay; return; }
  const P = van.the.luot;
  /* máy người kia mời ra; tới lượt mình mà người kia đã đi (không ai mời giùm) thì 15 giây sau máy mình tự ghi */
  if (!(cay.duoi && cay.duoi[P]) && nay - phong.luotTu > GIU_BAN + (P === phong.P ? 15000 : 0) && !dang && !mayNgam)
    MANG.goi(`bida/${ma}/duoi/${P}`, 'PUT', { n: phong.ke, luc: MANG.GIO });
}
/* lời mời ra sớm nhất (ghế, số cú lúc đó) */
function duoiNho() {
  const d = phong && phong.cay && phong.cay.duoi;
  if (!d) return null;
  let tot = null;
  for (const k of Object.keys(d)) { const x = d[k]; if (x && typeof x.n === 'number' && (!tot || x.n < tot.n)) tot = { P: +k, n: x.n }; }
  return tot;
}
const duoiTai = (n) => { const d = duoiNho(); return d && d.n === n ? d.P : -1; };
function apDuoi(P) {
  if (!van || van.the.thang >= 0) return;
  van.the.thang = (P + 1) % van.so; van.the.lyDo = 'duoi'; van.duoi = P;
}
/* đếm ngược giờ giữ bàn ở dòng trạng thái khi tới lượt mình (phút cuối) */
function demGioBan() {
  if (!van || van.cheDo !== 'phong' || !phong || !phong.cay || !phong.cay.ban || !phong.luotTu || van.the.thang >= 0 || !laMinh(van.the.luot)) return '';
  const con = GIU_BAN - (Date.now() - phong.luotTu);
  return con < 60000 ? ` · còn ${Math.max(0, Math.ceil(con / 1000))} giây kẻo bị mời khỏi bàn` : '';
}
/* rời bàn: phòng thành xong, bàn còn trỏ về phòng này thì xoá cho người khác vào — trừ khi deLai: người cùng bàn còn ở đó thì
   phòng và bàn để lại cho người đó */
async function nhuongBan(lyDo, deLai) {
  if (!phong || !phong.cay) { moMan('quan'); return; }
  if (phong.dangNhuong) return;
  phong.dangNhuong = true;
  const ma = phong.ma, ban = phong.cay.ban;
  if (!deLai && !phong.cay.xong) await MANG.goi(`bida/${ma}/xong`, 'PUT', MANG.GIO);
  if (ban && !deLai) { const r = await MANG.goi(`quan/${ban}`); if (r.ok && r.du && r.du.ma === ma) await MANG.goi(`quan/${ban}`, 'DELETE'); }
  if (!phong || phong.ma !== ma) return;
  roiPhong();
  moMan('quan');
  if (lyDo) bao(lyDo);
}
async function roiBanQuan() {
  if (!phong) { moMan('quan'); return; }
  const P = phong.P;
  if (P < 0) {                                                        // chưa ngồi ghế, hay ngồi sofa xem: chỉ ra, không đụng tới bàn của người ta
    if (phong.xem && phong.cay && phong.cay.ban) await MANG.goi(`quan/${phong.cay.ban}/xem/${phong.id}`, 'DELETE');   // nhường chỗ trên sofa
    if (phong) roiPhong();
    moMan('quan'); return;
  }
  /* đã vào ván thì ghi duoi cho mình: giữa ván là bỏ ngang (như bị mời ra, người kia thắng), hết ván là để người kia biết mình đi */
  if (phong.cay && phong.cay.batDau && !(phong.cay.duoi && phong.cay.duoi[P])) await MANG.goi(`bida/${phong.ma}/duoi/${P}`, 'PUT', { n: phong.ke, luc: MANG.GIO });
  if (!phong) { moMan('quan'); return; }
  const cay = phong.cay, conAi = !!cay && cacGhe().some(Q => Q !== P && conO(Q) && !(cay.duoi && cay.duoi[Q]));
  await nhuongBan('', conAi);
}
/* hết ván: ở lại bàn, mở phòng mới chờ người mới (phòng cũ đã xong nên máy chủ cho bàn trỏ sang) */
async function olaiBan() {
  if (!phong || !phong.cay || !phong.cay.ban) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }          // người kia vừa mời ván nữa: vào luôn
  const cay = phong.cay, ban = cay.ban, ma = MANG.maMoi(), ten = tenMinh() || 'Người 1';
  if (!cay.xong) await MANG.goi(`bida/${phong.ma}/xong`, 'PUT', MANG.GIO);
  const r = await MANG.goi(`quan/${ban}`, 'PUT', dongBanMoi(ma, cay.kieu, { 0: ten }, false, cay.luat, cay.dich));
  roiPhong();
  if (!r.ok) { moMan('quan'); bao('Bàn vừa có người khác ngồi.'); return; }
  await taoPhong({ P: 0, kieu: cay.kieu, so: 2, kho: 1, ten, ma, pha: 0, ban, luat: cay.luat, dich: cay.dich });
}

/* ---------- bảng: ván mới, cách chơi, hết ván ---------- */
/* bảng mới mở từ đầu (trước đây đóng Cách chơi dài rồi mở bảng Ván mới thì bảng mới nằm ở chỗ cuộn cũ, mất ảnh và tiêu
   đề); bảng cùng loại vẽ lại tại chỗ (phòng chờ: có người vào ra) thì giữ chỗ đang xem */
function moTin(html, loai) {
  const h = tam.querySelector('.bd-tin'), t = h.querySelector('.bd-tin-trong');
  const cuon = loai && !h.hidden && h.dataset.loai === loai ? t.scrollTop : 0;
  t.innerHTML = html; t.scrollTop = cuon; h.dataset.loai = loai || ''; h.hidden = false;
  tam.classList.add('bd-co-tin');
  moXoay(false);
}
function tatTin() { tatQuan(); if (tam) { tam.querySelector('.bd-tin').hidden = true; tam.classList.remove('bd-co-tin'); } }
const HINH_LOI = {
  may: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="3"/><circle cx="9.5" cy="13.5" r="1.2"/><circle cx="14.5" cy="13.5" r="1.2"/><path d="M12 4.5V8M9 19v2M15 19v2"/></svg>',
  tap: '<svg viewBox="0 0 24 24"><circle cx="15" cy="9" r="4.2"/><path d="M3 20.5L11.5 12"/><circle cx="15" cy="9" r="1.3"/></svg>',
  quan: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 17v3.5M18 17v3.5M12 3v3.5M9 6.5h6"/><circle cx="12" cy="13" r="1.3"/></svg>',
  chung: '<svg viewBox="0 0 24 24"><circle cx="8" cy="8.5" r="2.6"/><circle cx="16" cy="8.5" r="2.6"/><path d="M3 19c.5-2.7 2.5-4.4 5-4.4s4.5 1.7 5 4.4M11 19c.5-2.7 2.5-4.4 5-4.4s4.5 1.7 5 4.4"/></svg>',
};
/* chơi chung: số người và tên từng người nhớ trong tdtd.bida (cài đặt, không phải lịch sử) */
const soChungLuu = (l) => ([2, 3, 4].includes(l.soChung) ? l.soChung : 3);
function luuTenChung() {
  if (!tam) return;
  const o = [...tam.querySelectorAll('[data-tenchung]')];
  if (!o.length) return;
  const ds = (docLuu().tenChung || []).slice(0, 4);
  for (const x of o) ds[+x.dataset.tenchung] = String(x.value || '').trim().slice(0, 20);
  ghiLuu({ tenChung: ds });
}
let manDang = 'chinh';
function moCaiDat() { moMan('chinh'); }
function moMan(man) {
  manDang = man;
  if (man !== 'quan') tatQuan();
  const l = docLuu(), kho = [0, 1, 2].includes(l.kho) ? l.kho : 1, soMay = [1, 2, 3].includes(l.soMay) ? l.soMay : 1;
  /* bida bài chỉ chơi trên một máy (quán bida qua mạng: 8 bi, 9 bi, 3 bi) */
  const coBai = man !== 'tap', kieu = l.kieu === 9 || l.kieu === 3 || (l.kieu === 52 && coBai) ? l.kieu : 8, soLaL = [3, 5, 7].includes(l.soLa) ? l.soLa : 5;
  const luat3 = [0, 1, 3].includes(l.luat) ? l.luat : 0, dich3 = [5, 10, 15, 25].includes(l.dich) ? l.dich : 10;
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="bd-chon${bat ? ' bd-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const dongKieu = `<p class="bd-nhan">Kiểu chơi</p><div class="bd-hang">${nut('8 bi<small>trơn, sọc, bi 8</small>', 8, kieu === 8, 'kieu')}${nut('9 bi<small>bi nhỏ nhất trước</small>', 9, kieu === 9, 'kieu')}${coBai ? nut('Bida bài<small>theo lá trên tay</small>', 52, kieu === 52, 'kieu') : ''}${nut('3 bi<small>bàn phăng</small>', 3, kieu === 3, 'kieu')}</div>
    <p class="bd-meo bd-trai">${kieu === 9 ? 'Luôn chạm bi số nhỏ nhất trước; ai đưa bi 9 vào lỗ trong một cú đúng luật thì thắng. Chơi được 2–4 người.'
      : kieu === 3 ? 'Bida phăng: bàn không lỗ, mỗi người một bi chủ (trắng, vàng) và bi đỏ. Bi chủ chạm cả hai bi kia là ăn điểm, đánh tiếp. 1 băng: chạm băng ít nhất một lần trước khi chạm bi thứ hai; 3 băng: ít nhất ba lần. Hai người.'
      : kieu === 52 ? 'Mỗi người được chia lá bài: A–K ứng với bi 1–13, bi 14, 15 là bi mồi. Đưa bi trùng lá mình vào lỗ thì hạ lá, đánh tiếp; ai hạ hết bài trước thì thắng. Lỗi thì rút thêm lá phạt. 2–4 người.'
      : 'Vào bi trơn (1–7) hay sọc (9–15) trước thì nhận nhóm đó; hết nhóm thì đánh bi 8 vào lỗ đã chọn. Hai người.'}</p>
    ${kieu === 52 ? `<p class="bd-nhan">Số lá mỗi người</p><div class="bd-hang">${[3, 5, 7].map(n => nut(`${n} lá`, n, n === soLaL, 'sola')).join('')}</div>` : ''}
    ${kieu === 3 ? `<p class="bd-nhan">Luật</p><div class="bd-hang">${nut('Tự do', 0, luat3 === 0, 'luat')}${nut('1 băng', 1, luat3 === 1, 'luat')}${nut('3 băng', 3, luat3 === 3, 'luat')}</div>
      ${man !== 'tap' ? `<p class="bd-nhan">Chơi tới (điểm)</p><div class="bd-hang">${[5, 10, 15, 25].map(n => nut(`${n}`, n, n === dich3, 'dich')).join('')}</div>` : ''}` : ''}`;
  const muc = KHO.map((k, i) => nut(k, i, i === kho, 'kho')).join('');
  const lui = '<button type="button" class="bd-lui" data-man="chinh">‹ Quay lại</button>';
  let html;
  if (man === 'may') html = `${lui}<p class="bd-tin-nho">Đấu với máy</p><h2>${nhieuNguoi(kieu) && soMay > 1 ? tenMay().slice(0, soMay).join(', ') : tenMay()[0]}</h2>${dongKieu}
    ${nhieuNguoi(kieu) ? `<p class="bd-nhan">Số máy cùng chơi</p><div class="bd-hang">${[1, 2, 3].map(n => nut(String(n), n, n === soMay, 'somay')).join('')}</div>` : ''}
    <p class="bd-nhan">Máy chơi</p><div class="bd-hang">${muc}</div>
    <p class="bd-meo">Dễ hay đánh lệch; Khó ngắm chuẩn, tính cả chỗ bi chủ dừng cho cú sau.</p>
    <button type="button" class="bd-batdau">Bắt đầu — bạn phá trước</button>`;
  else if (man === 'quan' && MANG) html = `${lui}<p class="bd-tin-nho">Quán bida · 16 bàn</p><h2>Chọn bàn</h2>
    <canvas class="bd-quan-cv" aria-hidden="true"></canvas>
    <div class="bd-quan-ds" role="group" aria-label="16 bàn trong quán">${quan ? (quan.dsCu = dsQuan()) : ''}</div>
    <p class="bd-meo bd-quan-tk">${chuQuan()}</p>
    <p class="bd-meo">Bên trái 8 bàn bida lỗ (8 bi, 9 bi), bên phải 8 bàn bida 3 bi. Chạm vào bàn, hay vào mã bàn ở hàng nút — xanh là bàn trống, cam là có người chờ, xám là đang chơi. Bàn đang chơi thì ngồi sofa xem được: mỗi sofa ba chỗ cho người xem, con mắt trên bàn là số người đang xem. Tới lượt mà 3 phút không đánh là bị mời khỏi bàn; ngồi chờ quá 5 phút chưa ai vào thì nhường bàn.</p>`;
  else if (man === 'chung') {
    const so = nhieuNguoi(kieu) ? soChungLuu(l) : 2, ds = l.tenChung || [];
    html = `${lui}<p class="bd-tin-nho">Chơi chung một máy</p><h2>${so} người, chuyền tay nhau</h2>${dongKieu}
    ${nhieuNguoi(kieu) ? `<p class="bd-nhan">Số người</p><div class="bd-hang">${[2, 3, 4].map(n => nut(String(n), n, n === so, 'sochung')).join('')}</div>` : ''}
    <p class="bd-nhan">Tên từng người, theo thứ tự đánh</p>
    ${Array.from({ length: so }, (_, i) => `<input class="bd-o-ten bd-o-chung" data-tenchung="${i}" maxlength="20" value="${esc(ds[i] || '')}" placeholder="${esc(tenChungMacDinh([], i))}" autocomplete="off">`).join('')}
    <p class="bd-meo">Tới lượt ai thì người đó cầm máy — lời báo gọi tên người kế. Ván sau người kế phá.${kieu === 52 ? ' Bài của ai thì người đó chạm để lật, xem xong đưa máy cho người kế.' : ''}</p>
    <button type="button" class="bd-batdau-chung">Bắt đầu — ${esc(tenChungMacDinh(ds, 0))} phá trước</button>`;
  }
  else if (man === 'tap') html = `${lui}<p class="bd-tin-nho">Tập một mình</p><h2>Đánh tuỳ thích</h2>${dongKieu}
    <p class="bd-meo">Không có lượt, không bắt lỗi; rơi bi chủ thì đặt lại. Hợp để làm quen lực và xoáy.</p>
    <button type="button" class="bd-tap">Xếp bi</button>`;
  else {
    manDang = 'chinh';
    const loi = (k, tieu, phu) => `<button type="button" class="bd-lua" data-man="${k}"><span class="bd-lua-hinh">${HINH_LOI[k]}</span><span class="bd-lua-chu"><b>${tieu}</b><i>${phu}</i></span></button>`;
    const cd = chuDe();
    html = `${cd ? `<div class="bd-chao"><img src="${esc(cd.anhNi)}" alt="${esc(cd.chuThayAnh || cd.tieuDe)}"></div>` : ''}<p class="bd-tin-nho">${cd ? 'Quà tặng' : 'Ván mới'}</p><h2>${esc((cd && cd.tieuDe) || 'Bida lỗ')}</h2>
    ${loi('may', 'Đấu với máy', `8 bi, 9 bi, bida bài, bida 3 bi — với ${tenMay()[0]} hay tới ba máy`)}
    ${loi('tap', 'Tập một mình', 'Làm quen lực, xoáy, không bắt lỗi')}
    ${loi('chung', 'Chơi chung một máy', '2–4 người chuyền tay nhau, mỗi người một lượt')}
    ${MANG ? loi('quan', 'Vào quán bida', 'Mỗi người một máy · 16 bàn: 8 bàn lỗ, 8 bàn 3 bi — ngồi bàn trống hay vào bàn có người chờ') : ''}
    <button type="button" class="bd-chu bd-tieng">${coTieng ? '🔊 Âm thanh đang bật' : '🔇 Âm thanh đang tắt'}</button>`;
  }
  moTin(html);
  if (manDang === 'quan') { batQuan(); veQuan(); }
}
function moHuongDan() {
  moTin(`<p class="bd-tin-nho">Cách chơi</p><h2>Bida lỗ</h2>
    <p><b>Ngắm:</b> kéo ngón tay trên bàn, cơ chĩa theo. Ngắm cho chuẩn thì vuốt lên xuống dải gân bên trái.</p>
    <p><b>Đánh:</b> kéo thanh <b>Lực</b> bên phải xuống — càng xa càng mạnh — rồi thả tay. Kéo ngược lên hết thì thôi không đánh. Bi đang lăn thì chạm bàn để tua nhanh.</p>
    <p><b>Xoáy:</b> nút Xoáy dưới bàn. Chấm đỏ là chỗ đầu cơ chạm bi chủ: cao là <b>đẩy</b> (bi chủ chạy theo), thấp là <b>kéo</b> (bi chủ giật lùi), giữa là <b>đâm</b> (bi chủ đứng lại); lệch trái, phải thì bi chủ bật băng lệch theo.</p>
    <p><b>Nâng cơ:</b> thanh Nâng cơ trong bảng Xoáy (0–60°, máy tính: PageUp, PageDown). Cơ chúc xuống thọc bi chủ vào mặt bàn, bi nảy lên — nâng 30–45°, đánh vừa tay là nhảy qua được bi chắn; cơ dựng mà đánh lệch trái phải thì bi chạy cong. Đường ngắm vẽ đường bay, vòng vàng là chỗ bi chạm bàn. Mỗi lượt cơ về nằm ngang.</p>
    <p><b>Đường ngắm:</b> vòng trắng là chỗ bi chủ chạm; vạch đậm là đường bi đích sẽ chạy, vạch đứt là đường bi chủ sau khi xoáy ăn.</p>
    <p><b>8 bi:</b> phá xong bàn còn mở — vào bi trơn (1–7) hay sọc (9–15) trước thì nhận nhóm đó. Mỗi cú phải chạm bi nhóm mình trước, chạm xong phải có bi vào lỗ hay chạm băng. Hết nhóm thì đánh bi 8, chạm vòng ở miệng lỗ để chọn lỗ. Bi 8 vào đúng lỗ là thắng; vào sớm, vào sai lỗ, hay vào cùng cú phạm lỗi là thua.</p>
    <p><b>9 bi:</b> luôn chạm bi số nhỏ nhất trên bàn trước; vào bi nào cũng được đánh tiếp; bi 9 vào lỗ trong một cú đúng luật là thắng — kể cả ăn ké, kể cả ngay cú phá. Hai tới bốn người đánh lần lượt.</p>
    <p><b>Bida 3 bi</b> (bida phăng, bàn không lỗ 2,84 × 1,42 m, bi 61,5 mm): người thứ nhất đánh bi trắng, người thứ hai bi vàng, cùng một bi đỏ. Bi chủ chạm cả hai bi kia là ăn một điểm, đánh tiếp; trượt thì mất lượt. Luật <b>1 băng</b>: bi chủ phải chạm băng ít nhất một lần trước khi chạm bi thứ hai; <b>3 băng</b>: ít nhất ba lần. Khai cuộc phải chạm bi đỏ trước. Đủ số điểm trước thì thắng.</p>
    <p><b>Bida bài:</b> mỗi người được chia 3, 5 hay 7 lá từ bộ 52 lá; lá A–K ứng với bi 1–13 (J bi 11, Q bi 12, K bi 13), bi 14, 15 là bi mồi. Chạm bi nào trước cũng được. Bi vào lỗ thì ai cầm lá cùng số cũng hạ hết lá đó — nên vào bi người khác là giúp họ. Hạ được lá của mình hay vào bi mồi thì đánh tiếp; ai hết bài trước thì thắng. Lỗi (bi chủ rơi lỗ, không chạm bi nào, đánh bi bay khỏi bàn): bi vừa vào đặt lại, người đánh rút thêm một lá phạt. Vòng vàng trên bàn là bi trùng lá của bạn.</p>
    <p><b>Phạm lỗi</b> (bi chủ rơi lỗ hay bay khỏi bàn, không chạm bi nào, chạm sai bi trước, chạm xong không bi nào chạm băng, đánh bi bay khỏi bàn): người kế được đặt bi chủ ở đâu cũng được. Cú phá phải có bi vào lỗ hay ít nhất bốn bi chạm băng.</p>
    <p><b>Bi bay khỏi bàn</b> thì ra khỏi cuộc, trừ bi 8 lúc phá và bi 9 thì đặt lại; bi 8 bay ra lúc khác là thua. Bi rơi lên thành gỗ rồi lăn lại vào bàn thì vẫn chơi tiếp.</p>
    <p class="bd-meo">Theo luật WPA, bớt vài chỗ cho dễ chơi: không phải gọi lỗ (trừ bi 8), không có push out, không xử thua ba lỗi liền.</p>
    <button type="button" class="bd-dongtin">Chơi</button>`);
}
function ketThucVan(capNhat) {
  if (!van) return;
  /* chơi chung: ai thắng cũng mừng; câu trêu của bàn tặng tính theo người được tặng (ghế đầu) */
  const the = van.the, ly = LY_DO[the.lyDo] || '', minhThang = chung() ? the.thang === 0 : laMinh(the.thang) || (van.cheDo !== 'phong' && the.thang === 0);
  const thua = the.lyDo && the.lyDo[0] === '8' && the.lyDo !== '8dung';
  const tieuDe = van.so < 2 ? 'Hết bi rồi!' : `${tenChu(the.thang)} thắng!`;
  const loi = (van.kieu === 3 ? `${tenChu(the.thang)} ${ly} (${the.diem[the.thang]}/${the.dich}).`
    : van.so < 2 ? `Dọn sạch bàn sau ${the.soCu} cú.`
    : thua ? `${tenChu((the.thang + 1) % 2)} thua: ${ly}.` : `${tenChu(the.thang)} ${ly}.`)
    + (chuDe() && chuDe().loi && van.so > 1 ? ' ' + chon1(minhThang ? chuDe().loi.thang : chuDe().loi.thua) : '');
  if (!capNhat && (minhThang || van.so < 2 || chung())) tiengThang();
  if (van.cheDo === 'phong') {
    if (!capNhat && phong && phong.cay && !phong.cay.xong) MANG.goi(`bida/${phong.ma}/xong`, 'PUT', MANG.GIO);   // mốc để dọn phòng sau 5 phút
    const tiep = phong && phong.cay && phong.cay.tiep;
    if (phong && phong.cay && phong.cay.ban) {                       // quán bida: ván nữa, ở lại chờ người mới, về quán
      if (phong.P < 0) {                                              // ngồi sofa xem: xem tiếp ván nữa của hai người, hay về quán
        const lyDo = van.duoi >= 0 ? `${tenNguoi(van.duoi)} đã rời bàn.` : loi;
        moTin(`<p class="bd-tin-nho bd-het-xem">Hết ván · bàn ${phong.cay.ban} · ${the.soCu} cú · bạn đang xem</p><h2>${esc(tieuDe)}</h2><p>${esc(lyDo)}</p>
          ${tiep ? '<p class="bd-meo">Hai người chơi tiếp ván nữa.</p><button type="button" class="bd-vaotiep">Xem ván mới</button>' : ''}
          <button type="button" class="bd-phu bd-roiban">Về quán</button>`);
        return;
      }
      const biDuoi = van.duoi === phong.P, coDuoi = van.duoi >= 0, dq = phong.cay.duoi;
      const di = cacGhe().find(Q => Q !== phong.P && Q !== van.duoi && dq && dq[Q]);   // hết ván rồi người kia mới về quán
      const dong = (coDuoi ? `${tenNguoi(van.duoi)} đã rời bàn (tự rời, hay quá 3 phút không đánh).` : loi) + (di !== undefined ? ` ${tenNguoi(di)} đã về quán.` : '');
      moTin(`<p class="bd-tin-nho">Hết ván · bàn ${phong.cay.ban} · ${the.soCu} cú</p><h2>${esc(biDuoi ? 'Bạn đã rời bàn' : tieuDe)}</h2>
        <p>${esc(biDuoi ? 'Quá 3 phút không đánh (hay bỏ ngang) — bàn nhường cho người khác.' : dong)}</p>
        ${biDuoi ? '' : tiep ? '<p class="bd-meo">Có người mời chơi ván nữa.</p><button type="button" class="bd-vaotiep">Vào ván mới</button>' : coDuoi || di !== undefined ? '' : '<button type="button" class="bd-vannua">Chơi ván nữa</button>'}
        ${biDuoi ? '' : '<button type="button" class="bd-phu bd-olaiban">Ở lại bàn, chờ người mới</button>'}
        <button type="button" class="bd-phu bd-roiban">Về quán</button>`);
      return;
    }
    moTin(`<p class="bd-tin-nho">Hết ván · ${the.soCu} cú</p><h2>${esc(tieuDe)}</h2><p>${esc(loi)}</p><button type="button" data-man="quan">Về quán</button>`);   // đã rời bàn
    return;
  }
  moTin(`<p class="bd-tin-nho">Hết ván · ${the.soCu} cú</p><h2>${esc(tieuDe)}</h2><p>${esc(loi)}</p>
    <button type="button" class="bd-lai">${van.so < 2 ? 'Xếp lại' : 'Ván mới, như cũ'}</button><button type="button" class="bd-phu bd-moi">Đổi cách chơi</button>`);
}
function bam(e) {
  const t = e.target, q = (s) => t.closest && t.closest(s);
  let n;
  if (q('.xn-dong')) { dong(); return; }
  if (q('.bd-bao')) { t.hidden = true; return; }
  if (q('.bd-hoi')) { moHuongDan(); return; }
  if (q('.bd-xoay-giua')) { ngam.a = 0; ngam.b = 0; ngam.duKhoa = ''; veNutXoay(); return; }
  if (q('.bd-xoay-xong')) { moXoay(false); return; }
  if (q('.bd-xoay')) { moXoay(tam.querySelector('.bd-xoay-bang').hidden); return; }
  if (q('.bd-moi')) { if (van && van.cheDo === 'phong' && phong) moPhongTT(); else moCaiDat(); return; }
  if ((n = q('.bd-quan-cv'))) { chamQuan(e, n); return; }
  if ((n = q('[data-quanban]'))) { moBanQuan(n.dataset.quanban); return; }
  if ((n = q('[data-man]'))) { moMan(n.dataset.man); return; }
  if (q('.bd-dongtin')) { tatTin(); if (!van) { if (phong && phong.cay && !phong.cay.batDau) veSanhQuan(); else moCaiDat(); } return; }
  if ((n = q('[data-kieu]'))) { luuTenChung(); ghiLuu({ kieu: +n.dataset.kieu }); moMan(manDang); return; }
  if ((n = q('[data-sochung]'))) { luuTenChung(); ghiLuu({ soChung: +n.dataset.sochung }); moMan(manDang); return; }
  if ((n = q('[data-sola]'))) { luuTenChung(); ghiLuu({ soLa: +n.dataset.sola }); moMan(manDang); return; }
  const veLai = () => (manDang === 'ban' && quan && quan.ban ? (luuTenO(), moBanQuan(quan.ban)) : moMan(manDang));
  if ((n = q('[data-luat]'))) { luuTenChung(); ghiLuu({ luat: +n.dataset.luat }); veLai(); return; }
  if ((n = q('[data-dich]'))) { luuTenChung(); ghiLuu({ dich: +n.dataset.dich }); veLai(); return; }
  if ((n = q('[data-kieuban]'))) { ghiLuu({ kieuBan: +n.dataset.kieuban }); veLai(); return; }
  if ((n = q('.bd-ngoiban'))) { amThanh(); ngoiBanQuan(n.dataset.ban); return; }
  if ((n = q('.bd-vaoban'))) { amThanh(); vaoBanQuan(n.dataset.ban); return; }
  if ((n = q('.bd-xemban'))) { amThanh(); xemBanQuan(n.dataset.ban); return; }
  if (q('.bd-roiban')) { roiBanQuan(); return; }
  if (q('.bd-olaiban')) { olaiBan(); return; }
  if (q('.bd-xem-bai')) { if (van && chung()) { van.xemBai = van.the.luot; capNhatChu(); } return; }
  if ((n = q('[data-somay]'))) { ghiLuu({ soMay: +n.dataset.somay }); moMan(manDang); return; }
  if ((n = q('[data-kho]'))) { ghiLuu({ kho: +n.dataset.kho }); moMan(manDang); return; }
  if (q('.bd-batdau')) { amThanh(); const c = docLuu(); vanMoi({ che: 'may', kieu: c.kieu, soMay: c.soMay, kho: c.kho, la: c.soLa, luat: c.luat, dich: c.dich }); return; }
  if (q('.bd-tap')) { amThanh(); const c = docLuu(); vanMoi({ che: 'tap', kieu: c.kieu === 9 || c.kieu === 3 ? c.kieu : 8, luat: c.luat }); return; }
  if (q('.bd-batdau-chung')) {
    amThanh(); luuTenChung();
    const c = docLuu();
    vanMoi({ che: 'chung', kieu: c.kieu, so: nhieuNguoi(c.kieu) ? soChungLuu(c) : 2, ten: c.tenChung || [], la: c.soLa, luat: c.luat, dich: c.dich });
    return;
  }
  if (q('.bd-vannua')) { vanNua(); return; }
  if (q('.bd-vaotiep')) { if (phong && phong.cay && phong.cay.tiep) theoTiep(phong.cay.tiep); return; }
  if (q('.bd-tieng')) { coTieng = !coTieng; if (!coTieng && am) am.suspend(); moMan(manDang); return; }
  if (q('.bd-lai')) { if (van) vanMoi({ che: van.cheDo, kieu: van.kieu, soMay: van.soMay, kho: van.kho, pha: van.pha + 1, so: van.so, ten: van.nguoi.map(x => x.ten), la: van.the.la, luat: van.the.luat, dich: van.the.dich }); return; }
}

/* ---------- khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'bida';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="bd-dau">
      <p class="bd-ten"><b>${esc((chuDe() && chuDe().tieuDe) || 'Bida lỗ')}</b><span></span></p>
      <button class="bd-hoi" type="button" aria-label="Cách chơi">?</button>
    </div>
    <div class="bd-nguoi"></div>
    <div class="bd-bai" hidden></div>
    <div class="bd-canh">
      <canvas class="bd-cv" aria-label="Bàn bida: kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh"></canvas>
      <p class="bd-bao" hidden></p>
      <div class="bd-xoay-bang" hidden>
        <svg viewBox="-110 -110 220 220" aria-label="Chạm để chọn chỗ đầu cơ chạm bi chủ">
          <defs><radialGradient id="bd-xoay-bi" cx="-0.25" cy="-0.3" r="1.3" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece7da"/><stop offset="1" stop-color="#a9a396"/></radialGradient></defs>
          <circle r="100" fill="url(#bd-xoay-bi)"/>
          <circle r="50" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-dasharray="6 6"/>
          <path d="M-100 0H100M0 -100V100" stroke="rgba(0,0,0,.12)" stroke-width="2"/>
          <circle class="bd-xoay-cham" r="13" fill="#d42a20" stroke="#fff" stroke-width="3"/>
        </svg>
        <p class="bd-xoay-chu"></p>
        <label class="bd-nang"><span>Nâng cơ <b class="bd-nang-so">0°</b></span><input class="bd-nang-o" type="range" min="0" max="60" step="5" value="0" aria-label="Nâng cơ, độ"></label>
        <div class="bd-xoay-nut"><button type="button" class="bd-xoay-giua">Giữa</button><button type="button" class="bd-xoay-xong">Xong</button></div>
      </div>
    </div>
    <div class="bd-duoi">
      <p class="bd-luot" aria-live="polite"></p>
      <div class="bd-nut"><button class="bd-xoay" type="button" aria-label="Chọn xoáy: chỗ đầu cơ chạm bi chủ"><span><i></i></span>Xoáy<small class="bd-nang-nho"></small></button><button class="bd-moi" type="button">Ván mới</button></div>
    </div>
    <div class="bd-tin" hidden><div class="bd-tin-trong"></div></div>`;
  document.body.appendChild(tam);
  canh = tam.querySelector('.bd-canh');
  cv = tam.querySelector('.bd-cv'); ctx = cv.getContext && cv.getContext('2d');
  tam.addEventListener('click', bam);
  tam.addEventListener('input', (e) => {
    const o = e.target;
    if (!o || !o.classList) return;
    if (o.classList.contains('bd-o-ten')) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  });
  tam.addEventListener('input', (e) => { if (e.target && e.target.classList && e.target.classList.contains('bd-nang-o')) datNang(+e.target.value); });
  cv.addEventListener('pointerdown', chamXuong);
  cv.addEventListener('pointermove', chamKeo);
  cv.addEventListener('pointerup', chamLen);
  cv.addEventListener('pointercancel', () => { ngam.keo = null; });
  const svg = tam.querySelector('.bd-xoay-bang svg');
  let keoXoay = false;
  svg.addEventListener('pointerdown', (e) => { keoXoay = true; if (svg.setPointerCapture) try { svg.setPointerCapture(e.pointerId); } catch (x) {} datXoay(e); });
  svg.addEventListener('pointermove', (e) => { if (keoXoay) datXoay(e); });
  svg.addEventListener('pointerup', () => { keoXoay = false; });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && phong) { phong.nhipCuoi = 0; kiemPhong(); } });
  addEventListener('hashchange', theoMaTrenDiaChi);
  addEventListener('keydown', (e) => {
    if (!tam || !tam.classList.contains('hien')) return;
    if (e.key === 'Escape') {
      if (!tam.querySelector('.bd-xoay-bang').hidden) moXoay(false);
      else if (!tam.querySelector('.bd-tin').hidden && van) tatTin();
      else if (!chuDe()) dong();                                       // bàn tặng: trang chỉ có trò này, đóng là còn trang trống
      return;
    }
    if (phim(e)) e.preventDefault();
  });
  addEventListener('resize', doCo);
  if (typeof ResizeObserver === 'function') new ResizeObserver(doCo).observe(canh);
}
function vong(t) {
  raf = 0;
  if (!tam || !tam.classList.contains('hien')) return;
  if (dang) chayHoat(t);
  if (mayNgam && t - mayNgam.t0 >= mayNgam.lau) { const f = mayNgam.xong; mayNgam = null; f(); }
  capNhatDuDoan();
  veCanh(t);
  raf = requestAnimationFrame(vong);
}
function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  taoTho();
  khoiBi();
  const m = MANG && MA_DIA_CHI.exec(dauThang()), luu = docLuu().phong;
  if (m) {
    if (!phong || phong.ma !== m[1]) vaoPhong(m[1], luu && luu.ma === m[1] ? { id: luu.id, P: luu.P } : null);
    else noiPhong();
  } else if (phong) { noiPhong(); datDiaChi(phong.ma); }
  else if (!van && MANG && luu && MANG.laMa(luu.ma)) vaoPhong(luu.ma, { id: luu.id, P: luu.P }, -1, true);   // mở lại sau khi tải lại trang
  else if (!van) {
    /* lần đầu thì hiện cách chơi; bàn tặng thì món quà (ảnh, lời chào) ra trước, cách chơi đợi tới lúc vào bàn (vanMoi) */
    if (!docLuu().h && !chuDe()) { ghiLuu({ h: 1 }); moHuongDan(); }
    else moCaiDat();
  }
  capNhatChu();
  if (!raf) raf = requestAnimationFrame(vong);
}
function dong() {
  dungLuong();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (am && am.state === 'running') am.suspend();
  if (tam) tam.classList.remove('hien');
  if (typeof document !== 'undefined') document.body.classList.remove('khoa-cuon');
}
/* chạy hết cú đang chạy và lúc máy kéo cơ, ngay lập tức (bài kiểm thử) */
function tuaHet() {
  for (let k = 0; k < 200 && (dang || mayNgam); k++) {
    if (mayNgam) { const f = mayNgam.xong; mayNgam = null; f(); }
    if (dang) { while (!dang.mp.xong) L.buoc(dang.mp); xongHoat(); }
  }
}

self.TDTD_BIDA = {
  L, LOI, mo, dong,
  _van: () => van, _vanMoi: (ch) => vanMoi(ch), _ngam: () => ngam, _dang: () => dang, _mayNgam: () => mayNgam, _tuaHet: () => tuaHet(),
  _danhCu: (cu, P) => danhCu(cu, P), _banCu: () => banCu(), _chamXuong: (e) => chamXuong(e), _chamKeo: (e) => chamKeo(e), _chamLen: () => chamLen(),
  _raMH: (x, y) => raMH(x, y), _vaoBan: (X, Y) => vaoBan(X, Y), _ban: () => ban, _veCanh: (t) => veCanh(t), _doCo: () => doCo(), _capNhatDuDoan: () => capNhatDuDoan(),
  _moCaiDat: () => moCaiDat(), _moMan: (m) => moMan(m), _laMinh: (P) => laMinh(P), _denLuot: () => denLuot(), _bam: (e) => bam(e), _phim: (e) => phim(e),
  _phong: () => phong, _taoPhong: (ch) => taoPhong(ch), _vaoPhong: (ma, minh, muon) => vaoPhong(ma, minh, muon), _ngoiGhe: (P) => ngoiGhe(P),
  _batDauPhong: () => batDauPhong(), _roiPhong: () => roiPhong(), _vanNua: () => vanNua(), _theoTiep: (ma) => theoTiep(ma), _kiemPhong: () => kiemPhong(),
  _hatPhong: (ma) => hatPhong(ma),
  _datXoay: (a, b) => { ngam.a = a; ngam.b = b; ngam.duKhoa = ''; }, _chuLuot: () => chuLuot(), _viTriHien: () => viTriHien(), _anhBi: () => anhBi,
  _datNang: (d) => datNang(d), _L: () => L, L3, _caHien: () => caHien(),
  _quan: () => quan, _batQuan: () => batQuan(), _taiQuan: () => taiQuan(), _trangBan: (b) => trangBan(b), _demQuan: () => demQuan(), _moBanQuan: (b) => moBanQuan(b),
  _ngoiBanQuan: (b) => ngoiBanQuan(b), _vaoBanQuan: (b) => vaoBanQuan(b), _xemBanQuan: (b) => xemBanQuan(b), _soXem: (b) => soXem(b), _banTai: (x, y) => banTai(x, y), _veQuan: () => veQuan(), _kiemBanQuan: () => kiemBanQuan(),
  _roiBanQuan: () => roiBanQuan(), _olaiBan: () => olaiBan(), _chuQuan: () => chuQuan(), _demGioBan: () => demGioBan(), _phao: () => phao, _baoKetQua: (b, P) => baoKetQua(b, P), _ketThucVan: () => ketThucVan(),
};
})();

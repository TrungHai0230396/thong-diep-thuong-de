/* Bida lỗ — 8 bi và 9 bi trên bàn 9 feet, đấu với máy hay mỗi người một máy qua mạng (như Cờ vua ba người).

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
function LOI() {
  'use strict';
  /* ---------- số đo: mét, giây ---------- */
  const R = 0.028575, D = 2 * R, D2 = D * D, R2 = R * R;      // bi 57,15 mm
  const DAI = 2.54, RONG = 1.27;                               // mặt bàn 9 feet, đo giữa mũi băng
  const G = 9.81;
  const A_TRUOT = 0.2 * G;                                     // ma sát trượt bi–nỉ
  const A_LAN = 0.01 * G;                                      // cản lăn
  const A_XOAY = 5 * (0.4444 * R) * G / (2 * R);               // hãm xoáy ngang (rad/s²), như pooltool: u_sp = 0,444·R
  const E_BI = 0.95;                                           // hồi bi–bi
  const E_BANG = 0.9, MU_BANG = 0.2;                           // hồi, ma sát bi–băng
  const SIN_BANG = 0.28, COS_BANG = Math.sqrt(1 - SIN_BANG * SIN_BANG);   // mũi băng cao 0,64·D: h/R − 1 = 0,28
  const DT = 1 / 120;                                          // bước thời gian
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
  themLo(true, p / 2, p / 2, -CAN, -CAN, [[p, 0, 1, 0, 0, 1], [0, p, 0, 1, 1, 0]]);
  themLo(false, DAI / 2, 0, 0, -1, [[DAI / 2 - w, 0, -1, 0, 0, 1], [DAI / 2 + w, 0, 1, 0, 0, 1]]);
  themLo(true, DAI - p / 2, p / 2, CAN, -CAN, [[DAI - p, 0, -1, 0, 0, 1], [DAI, p, 0, 1, -1, 0]]);
  themLo(true, DAI - p / 2, RONG - p / 2, CAN, CAN, [[DAI, RONG - p, 0, -1, -1, 0], [DAI - p, RONG, -1, 0, 0, -1]]);
  themLo(false, DAI / 2, RONG, 0, 1, [[DAI / 2 + w, RONG, 1, 0, 0, -1], [DAI / 2 - w, RONG, -1, 0, 0, -1]]);
  themLo(true, p / 2, RONG - p / 2, -CAN, CAN, [[p, RONG, 1, 0, 0, -1], [0, RONG - p, 0, -1, 1, 0]]);
  BANG.push(doan(p, 0, DAI / 2 - w, 0, 0, 1), doan(DAI / 2 + w, 0, DAI - p, 0, 0, 1), doan(DAI, p, DAI, RONG - p, -1, 0),
    doan(DAI - p, RONG, DAI / 2 + w, RONG, 0, -1), doan(DAI / 2 - w, RONG, p, RONG, 0, -1), doan(0, RONG - p, 0, p, 1, 0));

  /* ---------- bi ----------
     tt: −2 không có trên bàn, −1 vừa rơi lỗ trong cú này, 0 nằm yên, 1 trượt, 2 lăn. (x, y) tâm bi, (vx, vy) vận tốc,
     (wx, wy, wz) vận tốc góc: wx, wy là xoáy dọc (xuôi/ngược), wz là xoáy ngang. */
  function taoBi(viTri) {
    const bi = [];
    for (let i = 0; i < 16; i++) {
      const q = viTri[i];
      bi.push({ so: i, x: q ? q[0] : 0, y: q ? q[1] : 0, vx: 0, vy: 0, wx: 0, wy: 0, wz: 0, tt: q ? 0 : -2, lo: -1 });
    }
    return bi;
  }
  /* cú đánh: hướng (dx, dy), tốc độ bi chủ v (m/s), chỗ đầu cơ chạm bi a (lệch phải +), b (cao +), tính theo bán kính.
     Xung lực của cơ ở chỗ lệch tâm cho vận tốc góc ω = 5v/(2R²)·(r × d): chạm cao 2/5 bán kính là lăn tròn ngay. */
  function moPhong(viTri, cu, dungKhiCham) {
    const bi = taoBi(viTri), c = bi[0];
    let dx = cu.dx, dy = cu.dy;
    const n = Math.sqrt(dx * dx + dy * dy) || 1;
    dx /= n; dy /= n;
    const v = Math.max(0, Math.min(VMAX, cu.v)), k = 2.5 * v / R;
    if (c.tt === 0 && v > 0) {
      c.vx = v * dx; c.vy = v * dy;
      c.wx = -k * cu.b * dy; c.wy = k * cu.b * dx; c.wz = k * cu.a;
      c.tt = 1;
    }
    return { bi, t: 0, dau: -1, bangSau: false, chamBang: bi.map(() => false), vao: [], sk: [], xong: false, dungKhiCham: !!dungKhiCham, cham: null };
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
    if (a.tt < 0 || (a.vx === 0 && a.vy === 0)) return;
    const bang = (nx, ny) => { const v = vaBang(a, nx, ny); if (v > 0) { mp.chamBang[a.so] = true; if (mp.dau >= 0) mp.bangSau = true; mp.sk.push({ t: mp.t, k: 2, a: a.so, v }); } };
    for (const s of BANG) {
      const kc = (a.x - s.ax) * s.nx + (a.y - s.ay) * s.ny;
      if (kc >= R || kc < -R || a.vx * s.nx + a.vy * s.ny >= 0) continue;
      const u = (a.x - s.ax) * s.ex + (a.y - s.ay) * s.ey;
      if (u >= 0 && u <= s.dai) bang(-s.nx, -s.ny);
    }
    for (let k = 0; k < 6; k++) {
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
        if (a.tt < 0) continue;
        for (let j = i + 1; j < 16; j++) {
          const b = bi[j];
          if (b.tt < 0) continue;
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
              if (mp.dau < 0 && i === 0) mp.dau = j;
              mp.sk.push({ t: mp.t + t, k: 1, a: i, b: j, v: -vr });
            }
          } else if (vr < 0 && (d - D) < -vr * 5e-5) sap = true;   // sắp chạm trong 50 µs
        }
      }
      for (const b of bi) if (b.tt >= 0 && (b.vx !== 0 || b.vy !== 0)) { b.x += b.vx * DT_CUM; b.y += b.vy * DT_CUM; }
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
    for (const b of bi) if (b.tt > 0) maSat(b, DT);
    let con = DT, lan = 0;
    while (con > 0) {
      let tMin = con, loai = 0, i0 = -1, j0 = -1, vat = null;
      for (let i = 0; i < 16; i++) {
        const a = bi[i];
        if (a.tt < 0) continue;
        const dongA = a.vx !== 0 || a.vy !== 0;
        for (let j = i + 1; j < 16; j++) {
          const b = bi[j];
          if (b.tt < 0 || (!dongA && b.vx === 0 && b.vy === 0)) continue;
          const t = tBiBi(a, b, tMin);
          if (t < tMin) { tMin = t; loai = 1; i0 = i; j0 = j; }
        }
        if (!dongA) continue;
        for (const s of BANG) { const t = tBiDoan(a, s, tMin); if (t < tMin) { tMin = t; loai = 2; i0 = i; vat = s; } }
        const tam = Math.abs(a.vx) + Math.abs(a.vy);
        for (let k = 0; k < 6; k++) {
          const lo = LO[k];
          if (Math.abs(a.x - lo.mx) > 0.25 + tam * tMin || Math.abs(a.y - lo.my) > 0.25 + tam * tMin) continue;
          const t = tBiDiem(a, lo.hx, lo.hy, lo.rHo, tMin);
          if (t < tMin) { tMin = t; loai = 4; i0 = i; j0 = k; }
          for (const s of lo.ham) { const t2 = tBiDoan(a, s, tMin); if (t2 < tMin) { tMin = t2; loai = 2; i0 = i; vat = s; } }
          for (const q of lo.diem) { const t2 = tBiDiem(a, q[0], q[1], R, tMin); if (t2 < tMin) { tMin = t2; loai = 3; i0 = i; vat = q; } }
        }
      }
      for (const b of bi) if (b.tt >= 0 && (b.vx !== 0 || b.vy !== 0)) { b.x += b.vx * tMin; b.y += b.vy * tMin; }
      con -= tMin;
      mp.t += tMin;
      if (!loai) break;
      const a = bi[i0];
      let sk = null;
      if (loai === 1) {
        if (mp.dau < 0 && (i0 === 0 || j0 === 0)) mp.dau = i0 === 0 ? j0 : i0;
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

  /* ---------- kết quả cú đánh: thứ luật cần, và vị trí cuối (làm tròn 0,1 mm cho mọi máy giữ y hệt) ---------- */
  const tron4 = (x) => Math.round(x * 10000) / 10000;
  function ketQua(mp) {
    let soBang = 0;
    for (let i = 1; i < 16; i++) if (mp.chamBang[i] && mp.bi[i].tt !== -2) soBang++;
    return { dau: mp.dau, bang: mp.bangSau, soBang, vao: mp.vao.map(v => [v[0], v[1]]), cuoi: mp.bi.map(b => (b.tt >= 0 ? [tron4(b.x), tron4(b.y)] : null)) };
  }
  function danh(viTri, cu) { return ketQua(chayHet(moPhong(viTri, cu))); }

  /* ---------- mã hoá để ghi lên máy chủ: chỉ số nguyên, đọc ra đúng từng bit trên mọi máy ---------- */
  const so = (x, k) => String(Math.round(x * k));
  function maCu(cu) {
    return [so(cu.dx, 1e6), so(cu.dy, 1e6), so(cu.v, 1e3), so(cu.a, 1e3), so(cu.b, 1e3),
      cu.cx != null ? so(cu.cx, 1e4) : '', cu.cy != null ? so(cu.cy, 1e4) : '', cu.lo != null && cu.lo >= 0 ? String(cu.lo) : ''].join(',');
  }
  const soNguyen = (s) => (/^-?\d{1,9}$/.test(s) ? +s : NaN);
  function docCu(chu) {
    const m = String(chu || '').split(',');
    if (m.length !== 8) return null;
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
    return cu;
  }
  function maKq(kq) {
    return [kq.dau, kq.bang ? 1 : 0, kq.soBang, kq.vao.map(v => v[0] + '.' + v[1]).join(','),
      kq.cuoi.map(q => (q ? so(q[0], 1e4) + ':' + so(q[1], 1e4) : '')).join(',')].join(';');
  }
  function docKq(chu) {
    const m = String(chu || '').split(';');
    if (m.length !== 5) return null;
    const dau = soNguyen(m[0]), bang = soNguyen(m[1]), soBang = soNguyen(m[2]);
    if (!(dau >= -1 && dau <= 15 && dau !== 0) || !(bang === 0 || bang === 1) || !(soBang >= 0 && soBang <= 15)) return null;
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
    return { dau, bang: bang === 1, soBang, vao, cuoi };
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
  /* thế bàn: kieu 8/9, so người, bi[16] vị trí hay null, luot ghế đang đánh, pha (cú sắp tới là phá), tuDo (0 không,
     1 đặt bi chủ ở đâu cũng được, 2 đặt sau vạch đầu bàn), nhom[ghế] (8 bi: 0 chưa có, 1 trơn, 2 sọc), thang ghế thắng */
  function theMoi(kieu, soNguoi, hat, pha) {
    return { kieu: kieu === 9 ? 9 : 8, so: soNguoi, bi: xepBi(kieu, hat), luot: pha || 0, pha: true, tuDo: 2, nhom: new Array(soNguoi).fill(0),
      thang: -1, lyDo: '', soCu: 0, loiLien: new Array(soNguoi).fill(0) };
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
    const g = the.so > 1 ? the.nhom[P] : 0;
    if (the.pha || (g === 0 && the.so > 1)) { for (let s = 1; s < 16; s++) if (s !== 8 && the.bi[s]) ds.push(s); if (!ds.length && the.bi[8]) ds.push(8); return ds; }
    if (the.so === 1) { for (let s = 1; s < 16; s++) if (the.bi[s]) ds.push(s); return ds; }
    for (let s = 1; s < 16; s++) if (the.bi[s] && nhomCua(s) === g) ds.push(s);
    if (!ds.length && the.bi[8]) ds.push(8);
    return ds;
  }
  const denBi8 = (the, P) => the.kieu === 8 && the.so > 1 && the.nhom[P] > 0 && !conNhom(the, the.nhom[P]);
  /* áp một cú: trả thế mới và lời báo (loi: '' hay mã lỗi, vao: các bi vào, tiep: đánh tiếp, ket: hết ván) */
  function apCu(truoc, cu, kq) {
    const the = chepThe(truoc), P = truoc.luot, n = truoc.so, pha = truoc.pha;
    the.bi = kq.cuoi.map(q => (q ? [q[0], q[1]] : null));
    const vao = kq.vao.map(v => v[0]), vaoBi = vao.filter(s => s > 0), caiRoi = vao.includes(0);
    const bao = { P, loi: '', vao: vaoBi, tiep: false, ket: false, nhomMoi: false, datLai: 0, lyDo: '' };
    let loi = '';
    if (caiRoi) loi = 'cai';
    else if (kq.dau < 0) loi = 'khong';
    else if (n > 1 && !pha) {
      if (truoc.kieu === 9) { if (kq.dau !== thapNhat(truoc)) loi = 'sai'; }
      else if (truoc.nhom[P] === 0) { if (kq.dau === 8) loi = 'dau8'; }
      else if (denBi8(truoc, P) ? kq.dau !== 8 : nhomCua(kq.dau) !== truoc.nhom[P]) loi = 'sai';
    } else if (n > 1 && pha && truoc.kieu === 9 && kq.dau !== thapNhat(truoc)) loi = 'sai';
    if (!loi && n > 1 && !vaoBi.length && !kq.bang && !pha) loi = 'bang';
    if (!loi && n > 1 && pha && !vaoBi.length && kq.soBang < 4) loi = 'pha';
    bao.loi = loi;
    const ket = (thang, lyDo) => { the.thang = thang; the.lyDo = lyDo; bao.ket = true; bao.lyDo = lyDo; the.pha = false; the.soCu++; return { the, bao }; };
    if (n === 1) {                                             // tập một mình: không luật, rơi bi chủ thì đặt lại
      the.pha = false; the.soCu++;
      if (caiRoi) the.bi[0] = null;
      the.tuDo = caiRoi ? 1 : 0;
      if (!the.bi.some((q, s) => s > 0 && q)) { the.thang = 0; the.lyDo = 'het'; bao.ket = true; bao.lyDo = 'het'; }
      return { the, bao };
    }
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
    if (caiRoi) the.bi[0] = null;
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
    } else if (cu.cx != null || !the.bi[0]) return false;
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
    const v = viTriDanh(the, cu), vao = new Set(kq.vao.map(x => x[0]));
    for (let s = 0; s < 16; s++) {
      if (!v[s]) { if (kq.cuoi[s] || vao.has(s)) return false; }
      else if (!!kq.cuoi[s] === vao.has(s)) return false;
    }
    return kq.dau < 0 || !!v[kq.dau];
  }

  /* ---------- dự đoán cho đường ngắm: bi chủ chạy tới lần chạm đầu (bi khác đứng yên), rồi hướng đi sau đó ----------
     Sau va chạm bi chủ còn xoáy nên trượt, ma sát nỉ bẻ cong đường đi tới lúc lăn tròn với vận tốc 5/7·v' + 2/7·R(ω × z):
     hướng cuối đó là thứ người chơi cần để tính chỗ bi chủ chạy về. */
  function duDoan(viTri, cu) {
    const mp = moPhong(viTri, cu, true);
    let k = 0;
    while (!mp.xong && k++ < 20000) buoc(mp);
    const c = mp.bi[0], kq = { loai: 'khong', x: c.x, y: c.y };
    if (!mp.cham) return kq;
    const sk = mp.cham;
    kq.x = c.x; kq.y = c.y;
    const cuoi = (b) => { const fx = 5 / 7 * b.vx + 2 / 7 * R * b.wy, fy = 5 / 7 * b.vy - 2 / 7 * R * b.wx, n = Math.sqrt(fx * fx + fy * fy); return n > 1e-9 ? [fx / n, fy / n, n] : [0, 0, 0]; };
    if (sk.k === 1) {
      const o = mp.bi[sk.a === 0 ? sk.b : sk.a], n = Math.sqrt(o.vx * o.vx + o.vy * o.vy) || 1;
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
      for (let K = 0; K < 6; K++) for (const lech of [0, -0.6, 0.6]) {
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
    const ds = cuVao(the.bi, the.bi[0][0], the.bi[0][1], biDich(the, P));
    if (!ds.length) return 0;
    return ds[0].de + (ds[1] ? ds[1].de * 0.3 : 0);
  }
  function chamDiem(the, P, cu, kq, muc) {
    const { the: sau, bao } = apCu(the, cu, kq);
    if (sau.thang >= 0) return sau.thang === P ? 1000 : -1000;
    if (bao.loi) return -300 - theBiChu(sau, sau.luot) * 100;
    if (sau.luot === P) return 200 + (MUC[muc].giu ? theBiChu(sau, P) * 120 : 0) + bao.vao.length * 5;
    return -60 - theBiChu(sau, sau.luot) * 150;                // hết lượt: người kế càng khó đánh càng tốt
  }
  function thuCu(the, P, viTri, cu, muc) { return chamDiem(the, P, cu, danh(viTri, cu), muc); }
  /* lo cho bi 8: lỗ gần đường bi 8 sẽ chạy nhất */
  function loGan(viTri, cu) {
    const d = duDoan(viTri, cu);
    if (d.loai !== 'bi' || !d.huongBi) return 0;
    let tot = 0, nho = Infinity;
    for (let K = 0; K < 6; K++) {
      const lo = LO[K], dx = lo.mx - d.ox, dy = lo.my - d.oy, t = dx * d.huongBi[0] + dy * d.huongBi[1];
      const lech = t > 0 ? Math.abs(dx * d.huongBi[1] - dy * d.huongBi[0]) : Infinity;
      if (lech < nho) { nho = lech; tot = K; }
    }
    return tot;
  }
  function timCu(the, P, muc, rnd) {
    rnd = rnd || Math.random;
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
    const dich = biDich(the, P), toi8 = denBi8(the, P);
    /* chỗ đặt bi chủ (được đặt tự do): sau mỗi cú vào được của bi đích, thẳng hay xiên chút */
    let cho = [];
    if (the.tuDo || !the.bi[0]) {
      for (const s of dich) {
        const q = the.bi[s];
        for (let K = 0; K < 6; K++) {
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

  return { R, D, DAI, RONG, DT, VMAX, KE_DAU, CHAM_CHAN, LO, BANG, MIENG_GOC, MIENG_GIUA, E_BI, A_LAN, A_TRUOT,
    taoBi, moPhong, buoc, chayHet, ketQua, danh, maCu, docCu, maKq, docKq, xepBi, mulberry32, nhomCua, theMoi, chepThe,
    datDuoc, datLai, thapNhat, conNhom, biDich, denBi8, apCu, cuHopLe, kqHopLe, viTriDanh, duDoan, cuVao, timCu, loGan, maSat, vaBang, vaBi };
}

const L = LOI();

/* ======================================================================================================
   MÁY NGHĨ Ở LUỒNG RIÊNG: dựng Web Worker từ chính mã lõi (LOI viết tự chứa), khỏi tải tệp nào thêm — chạy được cả khi
   mất mạng. Không tạo được Worker thì nghĩ ngay trên luồng chính.
   ====================================================================================================== */
let tho = null, viec = 0;
const choViec = new Map();
function taoTho() {
  if (tho || typeof Worker !== 'function' || typeof Blob !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  try {
    const ma = `const L=(${LOI.toString()})();onmessage=e=>{const d=e.data;postMessage({so:d.so,cu:L.timCu(d.the,d.P,d.muc)});};`;
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
  if (tho) { choViec.set(so, tra); tho.postMessage({ so, the, P, muc }); }
  else setTimeout(() => tra(L.timCu(the, P, muc)), 30);
}

/* ======================================================================================================
   GIAO DIỆN
   ====================================================================================================== */
const TEN_MAY = ['Sóc', 'Cú', 'Cáo'];
/* bàn tặng: trang nào đặt self.TDTD_BIDA_CHU_DE trước khi nạp tệp này (xem bida-anh-bien/index.html) thì trò mang tên
   người chơi, tên máy, màu nỉ, ảnh in mờ trên nỉ, màu chấm bi chủ, lời trêu, link mời riêng, pháo giấy khi thắng. Không
   đặt thì như cũ. { ten, goi (cách gọi trong câu), tieuDe, may: [ba tên], ni: [giữa, mép], bang: [ba màu băng], vienBang,
     anhNi, anhNiMo, anhNiCat, chuThayAnh (alt của ảnh ở bảng chào), chamBiChu: [r, g, b], link (link mời về chính trang này),
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
};
const TEN_LOI = {
  cai: 'bi chủ rơi lỗ', khong: 'bi chủ không chạm bi nào', sai: 'chạm sai bi trước', dau8: 'bàn còn mở mà chạm bi 8 trước',
  bang: 'chạm bi xong không bi nào chạm băng hay vào lỗ', pha: 'phá chưa đạt — phải có bi vào lỗ hay ít nhất 4 bi chạm băng',
};
const TEN_LO = ['góc dưới trái', 'giữa dưới', 'góc dưới phải', 'góc trên phải', 'giữa trên', 'góc trên trái'];

let tam = null, canh = null, cv = null, ctx = null, W = 360, H = 520, DPR = 1, raf = 0, banAnh = null;
let ban = { k: 100, doc: true, x0: 0, y0: 0, w: 0, h: 0 };
let van = null;                                                       // ván đang chơi
let dang = null;                                                      // cú đang chạy (hình động)
let mayNgam = null;                                                   // máy (hay người ở máy khác) đang ngắm, kéo cơ
let ngam = { goc: 0, luc: 0, a: 0, b: 0, lo: -1, loTay: false, cx: 0, cy: 0, keo: null, du: null, duKhoa: '', tinh: 0 };
let coTieng = true, am = null, baoHen = 0;

/* ---------- toạ độ: bàn (mét, gốc ở góc lỗ 0) ↔ màn hình ----------
   Màn hình đứng thì bàn dựng dọc, đầu bàn (chỗ phá) ở dưới; màn hình ngang thì bàn nằm ngang, đầu bàn bên trái. Cả hai là
   phép quay (không lật), nhìn từ trên xuống: xoáy phải vẫn là phải. */
function doCo() {
  if (!tam || !cv) return;
  const k = canh.getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2.5); W = Math.max(240, k.width || 360); H = Math.max(240, k.height || 520);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const doc = H >= W * 1.05, dai = L.DAI + 2 * VIEN, rong = L.RONG + 2 * VIEN, rongCho = W - TRAI - PHAI - 2 * LE;
  const kk = doc ? Math.min(rongCho / rong, (H - 2 * LE) / dai) : Math.min(rongCho / dai, (H - 2 * LE) / rong);
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
  const cd = chuDe(), niMau = (cd && cd.ni) || ['#1f8a5a', '#125c3b'], bangMau = (cd && cd.bang) || ['#1d8456', '#166c46', '#0f5233'];
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
  const nen = RGB_BI[i], soc = i >= 9, so = MAT_SO[i], cham = (chuDe() && chuDe().chamBiChu) || [200, 36, 40];
  const n = G.S * G.S, nb = G.nb, sh = G.sh, sp = G.sp, al = G.al;
  for (let k = 0; k < n; k++) {
    const a = al[k], j = k * 4;
    if (!a) { d[j + 3] = 0; continue; }
    const nx = nb[k * 3], ny = nb[k * 3 + 1], nz = nb[k * 3 + 2];
    const lx = m00 * nx + m10 * ny + m20 * nz, ly = m01 * nx + m11 * ny + m21 * nz, lz = m02 * nx + m12 * ny + m22 * nz;
    let r, gg, b;
    if (i === 0) {                                                    // bi chủ: trắng, sáu chấm đỏ cho thấy xoáy
      const ax = lx < 0 ? -lx : lx, ay = ly < 0 ? -ly : ly, az = lz < 0 ? -lz : lz;
      if (ax > 0.986 || ay > 0.986 || az > 0.986) { r = cham[0]; gg = cham[1]; b = cham[2]; } else { r = NGA[0]; gg = NGA[1]; b = NGA[2]; }
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
function veBong(X, Y, r) {
  ctx.beginPath(); ctx.ellipse(X + r * 0.2, Y + r * 0.3, r * 1.05, r * 0.95, 0, 0, 6.2832);
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fill();
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
  const c0 = viTriHien()[0];
  if (!c0) return;
  const [X0, Y0] = raMH(c0[0], c0[1]), [X1, Y1] = raMH(d.x, d.y), rr = L.R * ban.k;
  duongDut(X0, Y0, X1, Y1, 'rgba(255,255,255,.75)', 1.5, [6, 5]);
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
/* lỗ cho bi 8: vòng sáng ở miệng mỗi lỗ, lỗ đã chọn có số 8 */
function veChonLo() {
  if (!van || !laMinh(van.the.luot) || !L.denBi8(van.the, van.the.luot) || dang) return;
  for (let K = 0; K < 6; K++) {
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
  const ds = dang ? dang.mp.bi.map(b => (b.tt >= 0 ? [b.x, b.y] : null)) : viTriHien(), rr = L.R * ban.k;
  if (!dang && laMinh(van.the.luot) && !mayNgam && van.the.thang < 0) { veChonLo(); veNgam(); }
  const ve = [];
  for (let i = 0; i < 16; i++) if (ds[i]) { const [X, Y] = raMH(ds[i][0], ds[i][1]); ve.push([i, X, Y]); veBong(X, Y, rr); }
  for (const [i, X, Y] of ve) veMotBi(i, X, Y);
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
  const c0 = ds[0];
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
  if (van.the.tuDo) { cu.cx = ngam.cx; cu.cy = ngam.cy; }
  if (L.denBi8(van.the, van.the.luot)) cu.lo = ngam.lo;
  return cu;
}
/* tính lại đường ngắm khi hướng, lực, xoáy hay chỗ bi chủ đổi (mỗi khung nhiều nhất một lần) */
function capNhatDuDoan() {
  if (!van || !laMinh(van.the.luot) || dang || mayNgam || van.the.thang >= 0) { ngam.du = null; return; }
  const v = viTriHien();
  if (!v[0]) { ngam.du = null; return; }
  const luc = ngam.luc > 0 ? ngam.luc : 0.42;
  const khoa = [ngam.goc.toFixed(6), luc.toFixed(3), ngam.a, ngam.b, v[0][0], v[0][1], van.the.soCu].join('|');
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
  /* hướng: giữ hướng cũ nếu vẫn chạm bi hợp lệ, không thì quay về bi hợp lệ gần nhất */
  const v = viTriHien(), c = v[0], dich = L.biDich(the, P);
  if (!c) return;
  const thu = L.duDoan(v, { dx: Math.cos(ngam.goc), dy: Math.sin(ngam.goc), v: 2, a: 0, b: 0 });
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
  const cu = L.docCu(L.maCu(cu0));                                    // đúng con số mọi máy sẽ đọc
  if (!cu || !L.cuHopLe(van.the, cu)) return false;
  const viTri = L.viTriDanh(van.the, cu), kq = L.danh(viTri, cu);
  if (van.cheDo === 'phong' && !guiCu(cu, kq, P)) return false;
  if (typeof document !== 'undefined' && document.hidden) { apKetQua(cu, kq, P); return true; }   // trang ẩn: khỏi hình động
  batDauHoat(viTri, cu, kq, P);
  return true;
}
function batDauHoat(viTri, cu, kq, P) {
  dang = { mp: L.moPhong(viTri, cu), cu, kq, P, t: 0, du: 0, nhanh: 1, soSk: 0, roi: [], x0: viTri[0][0], y0: viTri[0][1], goc: Math.atan2(cu.dy, cu.dx), cuMo: 1 };
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
    for (let K = 0; K < 6; K++) {
      const lo = L.LO[K], [lX, lY] = raMH(lo.mx + lo.ax * 0.02, lo.my + lo.ay * 0.02);
      if (Math.hypot(X - lX, Y - lY) <= Math.max(20, rr * 1.8)) { ngam.lo = K; ngam.loTay = true; ngam.keo = null; tiengCham(); bao(`Bi 8 vào lỗ ${TEN_LO[K]}.`); return; }
    }
  }
  ngam.keo = 'ngam';
  ngamToi(X, Y);
}
function ngamToi(X, Y) {
  const c = viTriHien()[0];
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
  return false;
}

/* ---------- chọn xoáy: chạm vào bi chủ to, chấm đỏ là chỗ đầu cơ chạm. Vòng đứt nét là nửa bán kính — ra ngoài là trượt cơ ---------- */
function veNutXoay() {
  const n = tam && tam.querySelector('.bd-xoay i');
  if (n) n.style.transform = `translate(${ngam.a * 9}px, ${-ngam.b * 9}px)`;
  const bang = tam && tam.querySelector('.bd-xoay-bang');
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
  if (van.cheDo === 'phong') return mayPhong(P);
  return !!(van.nguoi[P] && van.nguoi[P].may);
}
const laMinh = (P) => !!van && P === van.minh && !laMay(P);
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
/* ván đấu với máy, hay tập một mình. ch: { che: 'may' | 'tap', kieu: 8 | 9, soMay (9 bi: 1–3), kho, pha (ghế phá) } */
function vanMoi(ch) {
  if (phong) roiPhong();
  boViec();
  dang = null; mayNgam = null;
  const kieu = ch.kieu === 9 ? 9 : 8, so = ch.che === 'tap' ? 1 : kieu === 9 ? 1 + Math.max(1, Math.min(3, ch.soMay || 1)) : 2;
  const pha = ((ch.pha || 0) % so + so) % so, hat = Math.floor(Math.random() * 2147483647);
  van = { cheDo: ch.che === 'tap' ? 'tap' : 'may', kieu, so, kho: [0, 1, 2].includes(ch.kho) ? ch.kho : 1, soMay: so - 1, pha, hat, minh: 0,
    the: L.theMoi(kieu, so, hat, pha), nguoi: [{ ten: tenBan(), may: false }], hetVan: false, doiMay: false, ma: '', chuoi: 0 };
  for (let P = 1; P < so; P++) van.nguoi[P] = { ten: tenMay()[P - 1], may: true, muc: van.kho };
  tatTin();
  ngam.a = 0; ngam.b = 0;
  capNhatChu();
  denLuot();
  if (chuDe() && !docLuu().h) { ghiLuu({ h: 1 }); moHuongDan(); }     // bàn tặng: cách chơi lần đầu hiện lúc vào bàn (xem mo)
  else if (van.cheDo === 'tap') bao(`Tập một mình: ${kieu} bi, đánh tuỳ thích. Rơi bi chủ thì đặt lại.`);
  else if (laMinh(van.the.luot)) bao(`${tenBan()} phá trước: kéo bi trắng để đặt, kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh.`);
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
    if (van.doiMay || (van.cheDo === 'phong' && !toiChayMay())) return;
    van.doiMay = true;
    const soCu = the.soCu;
    capNhatChu();
    mayNghi(P, (cu) => {
      if (!van) return;
      van.doiMay = false;
      if (van.the.soCu !== soCu || van.the.luot !== P || dang) { denLuot(); return; }
      /* trang đang ẩn (người chạy máy chơi thay chuyển sang app khác): đánh luôn, khỏi đợi cơ quay — cả phòng đang chờ */
      if (typeof document !== 'undefined' && document.hidden) { if (!danhCu(cu, P)) denLuot(); return; }
      batNgamMay(cu, P, 1150, () => { if (!danhCu(cu, P)) denLuot(); });
    });
    return;
  }
  /* chỉ chuẩn bị ngắm khi thật sự tới một lượt mới: phòng qua mạng gọi lại đây mỗi lần máy chủ báo tin (nhịp "còn ở đây"
     của ai đó cứ 20 giây một lần), bản đầu lần nào cũng đặt lại lực, hướng, chỗ đặt bi giữa lúc người ta đang kéo */
  if (laMinh(P)) {
    const khoa = [van.ma, van.hat, the.soCu, P].join('|');
    if (ngam.luotKhoa !== khoa) { ngam.luotKhoa = khoa; chuanBiNgam(); }
    capNhatChu();
  }
}
/* cơ quay dần tới hướng đánh, kéo lui rồi thọc (máy đánh, hay cú của người ở máy khác) */
function batNgamMay(cu, P, lau, xong) {
  const c = cu.cx != null ? [cu.cx, cu.cy] : van.the.bi[0];
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
  if (!van || b.ket) return;
  const ten = laMinh(P) ? tenBan() : tenNguoi(P), sau = van.the.luot, tenSau = laMinh(sau) ? goiBan() : tenNguoi(sau);
  const p = [];
  if (b.vao.length) p.push(`${b.vao.length > 1 ? 'Vào các bi' : 'Vào bi'} ${b.vao.join(', ')}.`);
  if (b.nhomMoi) p.push(`${ten} nhận ${TEN_NHOM[van.the.nhom[P]]}.`);
  if (b.datLai) p.push(`Bi ${b.datLai} ${b.datLai === 8 ? 'vào lúc phá' : 'vào cùng cú lỗi'} — đặt lại ở chấm chân bàn.`);
  if (b.loi && van.so > 1) { p.push(`Lỗi: ${TEN_LOI[b.loi]}. ${laMinh(sau) ? tenBan() : tenSau} được đặt bi chủ.`); tiengLoi(); }
  else if (b.loi === 'cai') p.push('Bi chủ rơi lỗ — đặt lại rồi đánh tiếp.');
  else if (b.vao.length) tiengVao();
  /* bàn tặng: lời trêu theo cú của người chơi trên máy này; vào bi liền ba cú trở lên thì câu riêng */
  const cd = chuDe();
  if (cd && cd.loi && laMinh(P)) {
    const l = cd.loi;
    van.chuoi = b.vao.length && !b.loi ? (van.chuoi || 0) + 1 : 0;
    if (b.loi === 'cai') p.push(chon1(l.tam));
    else if (b.loi) p.push(chon1(l.loi));
    else if (b.vao.length) p.push(van.chuoi >= 3 && l.chuoi ? chon1(l.chuoi) : chon1(l.vao));
    else if (Math.random() < 0.6) p.push(chon1(l.truot));
    if (!b.tiep) van.chuoi = 0;
  }
  if (p.filter(Boolean).length) bao(p.filter(Boolean).join(' '));
}
function soConNhom(the, g) { let n = 0; for (let s = 1; s < 16; s++) if (the.bi[s] && L.nhomCua(s) === g) n++; return n; }
function chuLuot() {
  if (!van) return '';
  const the = van.the, P = the.luot;
  if (the.thang >= 0) return van.so > 1 ? `Hết ván — ${laMinh(the.thang) ? goiBan() : tenNguoi(the.thang)} thắng.` : 'Hết bi rồi! Bấm Ván mới để xếp lại.';
  if (dang) return dang.nhanh > 1 ? 'Đang tua nhanh…' : 'Chạm bàn để tua nhanh';
  if (mayNgam) return `${laMinh(mayNgam.P) ? tenBan() : tenNguoi(mayNgam.P)} đánh…`;
  if (!laMinh(P)) {
    if (laMay(P)) return van.cheDo === 'phong' && !toiChayMay() ? `${tenNguoi(P)} (máy) đang ngắm…` : `${tenNguoi(P)} đang ngắm…`;
    return `${tenNguoi(P)} đang đánh…`;
  }
  let chu = van.so > 1 ? `Lượt ${goiBan()}` : 'Tập một mình';
  if (the.pha) chu += ' · phá';
  else if (the.kieu === 9 && van.so > 1) chu += ` · chạm bi ${L.thapNhat(the)} trước`;
  else if (the.kieu === 8 && van.so > 1) {
    const g = the.nhom[P];
    chu += L.denBi8(the, P) ? ' · bi 8: chạm vòng ở miệng lỗ để chọn lỗ' : g ? ` · ${TEN_NHOM[g]}, còn ${soConNhom(the, g)}` : ' · bàn mở, vào bi nào nhận nhóm đó';
  } else chu += ` · còn ${the.bi.filter((q, s) => s > 0 && q).length} bi`;
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
  if (luot) luot.textContent = chuLuot();
  if (ten) ten.textContent = !van ? '8 bi · 9 bi' : van.cheDo === 'phong' && phong ? `Phòng ${phong.ma} · ${van.kieu} bi` : van.cheDo === 'tap' ? `Tập một mình · ${van.kieu} bi` : `${van.kieu} bi · máy ${KHO[van.kho]}`;
  if (hang) {
    if (!van || van.so < 2) hang.innerHTML = '';
    else {
      const the = van.the;
      hang.innerHTML = Array.from({ length: van.so }, (_, P) => {
        const g = the.kieu === 8 ? the.nhom[P] : 0, cac = g ? [1, 2, 3, 4, 5, 6, 7].map(s => (g === 2 ? s + 8 : s)) : [];
        const phu = [laMay(P) ? 'máy' : '', van.cheDo === 'phong' && !laMay(P) && gheCua(P) && !conO(P) ? 'vắng' : '',
          the.kieu === 8 ? (g ? TEN_NHOM[g] : 'chưa có nhóm') : '', the.luot === P && the.thang < 0 ? 'đang đánh' : '', the.thang === P ? 'thắng' : ''].filter(Boolean).join(' · ');
        return `<div class="bd-the${the.luot === P && the.thang < 0 ? ' bd-dang' : ''}${laMinh(P) ? ' bd-minh' : ''}" data-p="${P}"><b>${esc(laMinh(P) && van.cheDo !== 'phong' ? tenBan() : tenNguoi(P))}</b><span>${esc(phu)}</span>${cac.length ? `<em>${cac.map(s => miniBi(s, !the.bi[s])).join('')}${miniBi(8, !the.bi[8])}</em>` : ''}</div>`;
      }).join('');
    }
  }
  const thay = tam.querySelector('.bd-thay');
  if (thay) {
    const viec = van && van.cheDo === 'phong' ? viecPhong() : '';
    thay.hidden = !viec;
    thay.dataset.viec = viec;
    thay.textContent = viec === 'tudi' ? 'Tự đánh tiếp' : 'Cho máy đánh thay';
  }
  const moi = tam.querySelector('.bd-moi');
  if (moi) moi.textContent = van && van.cheDo === 'phong' && phong ? 'Phòng' : 'Ván mới';
  veNutXoay();
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
}
function tiengCham() { if (amThanh()) not(880, am.currentTime + 0.01, 0.05, 0.03); }
function tiengVao() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(659.25, t, 0.16, 0.05); not(987.77, t + 0.11, 0.24, 0.05); }
function tiengLoi() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(196, t, 0.3, 0.08, 'triangle'); not(185, t + 0.16, 0.36, 0.07, 'triangle'); }
function tiengThang() { if (!amThanh()) return; const t = am.currentTime + 0.02; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => not(f, t + i * 0.11, 0.5, 0.12, 'triangle')); }
function tiengToiLuot() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(659.25, t, 0.16, 0.05); not(987.77, t + 0.13, 0.26, 0.05); if (navigator.vibrate) navigator.vibrate(40); }

/* ======================================================================================================
   CHƠI QUA MẠNG — như Cờ vua ba người: mỗi người một máy, vào cùng một phòng bằng link, mã QR hay mã 6 ký tự
   (assets/phong.js nói chuyện với Firebase, luật bảo vệ ở firebase-rules.json, nhánh bida và sanhbida).
   Máy chủ chỉ giữ danh sách cú đánh: mỗi cú ghi cả cú (d: hướng, lực, xoáy, chỗ đặt bi chủ, lỗ chọn cho bi 8) lẫn kết quả
   (kq: bi chạm đầu, có bi chạm băng, bi nào vào lỗ nào, vị trí cuối của từng bi). Máy nào cũng đọc lần lượt từ đầu, áp
   luật lên kết quả, nên thế bàn và lượt đi luôn như nhau; máy đang xem thì chạy lại cú đó cho thấy bi lăn (cùng phép tính
   nên ra y hệt), xong thì đặt bi đúng theo kết quả ghi. Luật Firebase chỉ cho thêm cú vào cuối, ai ghi trước vào ô số n
   thì cú đó được; cú không đúng lượt, không đúng luật thì máy nào cũng bỏ qua như nhau. Ghế trống lúc bắt đầu thì máy
   chơi thay: máy của người ngồi ghế số nhỏ nhất còn ở đây nghĩ giùm rồi ghi cú lên.
   ====================================================================================================== */
const MANG = self.TDTD_PHONG;
let phong = null;
const VANG = 60000, NHIP = 20000;                   // im lặng quá 60 giây là coi như đã rời; 20 giây báo "còn ở đây" một lần
const gheCua = (P) => (phong && phong.cay && phong.cay.ghe ? phong.cay.ghe[P] : null);
const mayCua = (P) => !!(phong && phong.cay && phong.cay.may && phong.cay.may[P]);
const gioMay = () => Date.now() + (phong ? phong.lech : 0);   // giờ máy chủ, đo lệch qua dấu giờ của chính mình
const soGhe = () => (phong && phong.cay ? Math.max(2, Math.min(4, phong.cay.so || 2)) : 2);
const cacGhe = () => Array.from({ length: soGhe() }, (_, P) => P);
function conO(P) { const g = gheCua(P); return !!g && (P === phong.P || (!!g.thay && gioMay() - g.thay < VANG)); }
const mayPhong = (P) => !!phong && (mayCua(P) || !gheCua(P));
function tenGhe(P) {
  const g = gheCua(P);
  if (g && !mayCua(P)) return g.ten || `Người ${P + 1}`;
  if (g) return `${g.ten || `Người ${P + 1}`} (máy thay)`;
  let k = 0;
  for (let Q = 0; Q < P; Q++) if (!gheCua(Q)) k++;
  return tenMay()[k % tenMay().length];
}
const tenMinh = () => String(docLuu().ten || '').trim().slice(0, 20);
/* link mời đi qua trang chia sẻ riêng (bida-lo/), để Zalo, Messenger hiện tên và ảnh của trò */
const linkMoi = (ma) => (chuDe() && chuDe().link ? location.origin + location.pathname + '?phong=' + ma   // bàn tặng: mời về chính trang đó
  : location.origin + location.pathname.replace(/[^/]*$/, '') + 'bida-lo/?phong=' + ma);
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
  moTin('<p class="bd-tin-nho">Chơi qua mạng</p><h2>Đang tạo phòng…</h2>');
  for (let lan = 0; lan < 4; lan++) {
    const ma = ch.ma || MANG.maMoi();
    const r = await MANG.goi(`bida/${ma}`, 'PUT', { tao: MANG.GIO, chu: P, kieu: ch.kieu, so: ch.so, kho: ch.kho, pha: ch.pha || 0, ghe: { [P]: { id, ten, thay: MANG.GIO } } });
    if (r.ok) { vaoPhong(ma, { id, P, mo: !!ch.mo }); return true; }
    if (r.ma !== 401 || ch.ma) break;               // mất mạng, hay mã định sẵn (ván nữa) đã có người dùng
  }
  moTin('<p class="bd-tin-nho">Chơi qua mạng</p><h2>Chưa tạo được phòng</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="bd-moi">Quay lại</button>');
  return false;
}
/* vào phòng: minh = { id, P } khi đã có ghế (người tạo phòng, hay mở lại); muonNgoi: ghế muốn ngồi khi theo ván nữa */
function vaoPhong(ma, minh, muonNgoi = -1, tuMo = false) {
  if (!MANG || !MANG.laMa(ma)) return;
  const cu = docLuu().cu;
  if (!minh && cu && cu.ma === ma) minh = { id: cu.id, P: cu.P };     // vừa rời phòng rồi mở lại link: vào lại đúng ghế
  dungLuong();
  if (van && van.cheDo === 'phong') { boViec(); van = null; dang = null; mayNgam = null; }
  const daLuu = docLuu().phong, mo = minh ? (minh.mo !== undefined ? !!minh.mo : !!(daLuu && daLuu.ma === ma && daLuu.id === minh.id && daLuu.mo)) : false;
  phong = { ma, id: minh ? minh.id : MANG.idMoi(), P: minh ? minh.P : -1, cay: undefined, ke: 0, nhat: [], hop: [], daGui: null, lech: 0,
    song: false, nhipCuoi: 0, muonNgoi, tuMo, choTiep: 0, sanhCu: '', mo, daDang: false, sanhLuc: 0, sanhKhoa: '', tuSanh: false, qr: false };
  if (phong.P >= 0) ghiLuu({ phong: { ma, id: phong.id, P: phong.P, mo: phong.mo || undefined } });
  datDiaChi(ma);
  noiPhong();
  capNhatChu();
  if (!tuMo) moTin(`<p class="bd-tin-nho">Phòng ${ma}</p><h2>Đang vào phòng…</h2>`);
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
  if (phong.daDang) MANG.goi(`sanhbida/${ma}`, 'DELETE');           // chủ phòng mở rời đi: phòng thôi hiện trong Tìm phòng
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
    const ma = phong.ma, tuMo = phong.tuMo;
    roiPhong();
    if (tuMo) moCaiDat();
    else moTin(`<p class="bd-tin-nho">Phòng ${ma}</p><h2>Không thấy phòng này</h2><p>Mã sai, hoặc phòng đã đóng sau khi chơi xong.</p><button type="button" class="bd-moi">Quay lại</button>`);
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
    if (tuMo) moCaiDat(); else moTin('<p class="bd-tin-nho">Chơi qua mạng</p><h2>Phòng này đã đóng</h2><p>Phòng chỉ giữ trong một ngày.</p><button type="button" class="bd-moi">Quay lại</button>');
    return;
  }
  phong.tuMo = false;
  capNhatSanh();
  if (!cay.batDau) { veSanh(); return; }
  if (!van || van.cheDo !== 'phong' || van.ma !== phong.ma) { batDauVanPhong(); return; }
  kiemNhat();
  chayPhong();
  capNhatChu();
  if (van && van.hetVan && tam && tam.querySelector('.bd-tin .bd-vannua, .bd-tin .bd-vaotiep')) ketThucVan(true);   // có lời mời ván nữa
}
/* phòng chờ: chủ phòng chưa có ai vào thì Gửi link mời là nút chính, có bạn rồi thì Bắt đầu; người mở link bấm một nút là vào */
function hangGhe(cay, minh, trongVan) {
  return `<div class="bd-ghe-hang bd-ghe-${soGhe()}">` + cacGhe().map(P => {
    const g = gheCua(P), may = trongVan && mayPhong(P);
    const ten = may && !g ? tenGhe(P) : g ? esc(P === minh ? 'Bạn' : (g.ten || `Người ${P + 1}`)) : 'Chờ bạn';
    const phu = [`Ghế ${P + 1}`, P === (cay.pha || 0) ? 'phá trước' : '', may ? 'máy chơi' : '', g && P === cay.chu && !may ? 'chủ phòng' : '',
      g && !may && !conO(P) ? 'vắng' : '', !g && !may ? 'ghế trống' : ''].filter(Boolean).join(' · ');
    return `<div class="bd-ghe-o${g || may ? '' : ' bd-ghe-trong'}${P === minh ? ' bd-ghe-minh' : ''}"><b>${ten}</b><small>${phu}</small></div>`;
  }).join('') + '</div>';
}
const kieuChu = (cay) => `${cay && cay.kieu === 9 ? '9 bi' : '8 bi'} · ${soGhe()} người`;
const dongMa = () => `<div class="bd-ma-dong"><span class="bd-ma-to">${phong.ma}</span><button type="button" class="bd-chep-ma">Chép mã</button></div>`;
const khungQR = () => (phong.qr && self.TDTD_MAQR ? `<div class="bd-qr">${self.TDTD_MAQR.svg(linkMoi(phong.ma))}</div><p class="bd-meo">Bạn ngồi cạnh mở camera điện thoại, quét mã này là vào phòng.</p>` : '');
const nutQR = () => (self.TDTD_MAQR ? `<button type="button" class="bd-phu bd-qr-bat">${phong.qr ? 'Ẩn mã QR' : 'Hiện mã QR cho bạn ngồi cạnh'}</button>` : '');
function veSanh() {
  const cay = phong.cay, minh = phong.P, chu = cay.chu;
  if (minh < 0 && phong.muonNgoi >= 0 && !gheCua(phong.muonNgoi)) { const P = phong.muonNgoi; phong.muonNgoi = -1; ngoiGhe(P); }
  const trong = cacGhe().filter(P => !gheCua(P)), ban_ = cacGhe().filter(P => gheCua(P) && P !== minh).length;
  const tenChu = gheCua(chu) ? esc(gheCua(chu).ten || `Người ${chu + 1}`) : 'Bạn bè';
  let html;
  if (minh < 0) {
    html = `<p class="bd-tin-nho">${phong.tuSanh ? 'Phòng mở' : 'Lời mời'} · ${kieuChu(cay)}</p><h2>${phong.tuSanh ? `Phòng của ${tenChu}` : `${tenChu} mời bạn chơi bida`}</h2>${hangGhe(cay, minh)}
      ${trong.length ? `<p class="bd-nhan">Tên của bạn</p><input class="bd-o-ten" maxlength="20" value="${esc(tenMinh())}" placeholder="Để trống thì gọi theo số ghế" autocomplete="nickname">
      <p class="bd-nhan">Chọn ghế để vào chơi</p>${trong.map(P => `<button type="button" class="bd-vaochoi" data-ngoi="${P}">Vào chơi ghế ${P + 1}${P === (cay.pha || 0) ? ' (phá trước)' : ''}</button>`).join('')}`
      : '<p class="bd-meo">Phòng đã đủ người. Bạn vẫn ở đây xem ván khi bắt đầu.</p>'}
      <p class="bd-meo">Phòng ${phong.ma}</p>
      <button type="button" class="bd-chu bd-roi">Không vào nữa</button>`;
  } else {
    const laChu = minh === chu, chuVang = !laChu && !conO(chu), batDauChinh = laChu && ban_ > 0;
    const nutBatDau = laChu || chuVang ? `<button type="button" class="${batDauChinh ? '' : 'bd-phu '}bd-batdau-phong">Bắt đầu${trong.length ? `<small>máy chơi thay ${trong.length} ghế trống</small>` : ''}</button>` : '';
    const nutMoi = trong.length ? nutMoiBan(laChu ? 'Gửi link mời' : 'Mời thêm bạn', 'Chép link mời', laChu && !ban_) + nutQR() + khungQR() : '';
    const loi = !laChu ? (chuVang ? `${tenChu} đang vắng. Muốn chơi luôn thì bấm Bắt đầu, khỏi chờ.` : `Chờ ${tenChu} bấm Bắt đầu…`)
      : !trong.length ? 'Đủ người rồi.'
      : `${ban_ ? `${ban_} bạn đã vào, còn ${trong.length} ghế trống. ` : 'Chưa ai vào. '}${phong.mo ? 'Phòng đang mở cho mọi người: ai bấm "Tìm phòng nhanh" hay "Xem phòng đang chờ" cũng vào được; bạn bè vẫn vào bằng link, mã.' : 'Bạn bè mở link, quét mã QR, hay nhập mã ở mục "Vào phòng của bạn".'}`;
    const nutMo = laChu && trong.length ? `<button type="button" class="bd-chu bd-doi-mo">${phong.mo ? 'Thôi cho người lạ vào' : 'Cho người lạ tìm thấy phòng này'}</button>` : '';
    html = `<p class="bd-tin-nho">${phong.mo || phong.tuSanh ? 'Phòng mở' : 'Phòng chờ'} · ${kieuChu(cay)}</p>${dongMa()}${hangGhe(cay, minh)}
      <p class="bd-meo">${loi}</p>
      ${batDauChinh ? nutBatDau + nutMoi : nutMoi + nutBatDau}
      ${nutMo}
      <button type="button" class="bd-chu bd-roi">Rời phòng</button>`;
  }
  if (html !== phong.sanhCu || tam.querySelector('.bd-tin').hidden) { phong.sanhCu = html; moTin(html, 'sanh'); }
}
/* ---------- phòng mở: dòng ngắn trong /sanhbida/<mã> cho người tìm phòng (như sảnh cờ ba người) ---------- */
function capNhatSanh(ep) {
  if (!phong || !phong.cay || phong.P < 0 || phong.P !== phong.cay.chu) return;
  const cay = phong.cay, trong = cacGhe().filter(P => !gheCua(P)).length, can = phong.mo && !cay.batDau && trong > 0, ma = phong.ma;
  if (!can) {
    if (phong.daDang) { phong.daDang = false; phong.sanhKhoa = ''; MANG.goi(`sanhbida/${ma}`, 'DELETE'); }
    return;
  }
  const g = gheCua(cay.chu), dong = { ten: String((g && g.ten) || `Người ${cay.chu + 1}`).slice(0, 20), trong, kieu: cay.kieu === 9 ? 9 : 8, so: soGhe(), thay: MANG.GIO };
  const khoa = `${dong.ten}|${trong}`;
  if (!ep && phong.daDang && khoa === phong.sanhKhoa) return;
  phong.daDang = true; phong.sanhKhoa = khoa; phong.sanhLuc = Date.now();
  MANG.goi(`sanhbida/${ma}`, 'PATCH', dong).then(r => {
    if (!r.ok && r.ma === 401 && phong && phong.ma === ma && phong.daDang) MANG.goi(`sanhbida/${ma}`, 'PUT', Object.assign({ tao: MANG.GIO }, dong));
  });
}
function doiPhongMo() {
  if (!phong || !phong.cay || phong.P !== phong.cay.chu) return;
  phong.mo = !phong.mo;
  ghiLuu({ phong: { ma: phong.ma, id: phong.id, P: phong.P, mo: phong.mo || undefined } });
  capNhatSanh(true);
  bao(phong.mo ? 'Phòng đã mở cho mọi người — ai tìm phòng cũng vào được.' : 'Phòng thôi hiện cho người lạ; bạn bè vẫn vào bằng link, mã.');
  veSanh();
}
let timPhong = null;
function batTimPhong() {
  if (timPhong) return;
  timPhong = { ds: [], xong: false, loi: false, hen: setInterval(taiDsPhong, 4000) };
  taiDsPhong();
}
function tatTimPhong() { if (timPhong) { clearInterval(timPhong.hen); timPhong = null; } }
async function taiDsPhong() {
  if (!timPhong || !MANG) return;
  const r = await MANG.goi('sanhbida', 'GET');
  if (!timPhong) return;
  if (manDang !== 'tim' || !tam || tam.querySelector('.bd-tin').hidden) { tatTimPhong(); return; }
  Object.assign(timPhong, { ds: locPhongMo(r.ok && r.du).sort((a, b) => b.tao - a.tao), xong: true, loi: !r.ok });
  const k = tam.querySelector('.bd-tin .bd-ds-phong');
  if (k) k.innerHTML = dsPhongHtml();
}
/* các dòng còn sống: bỏ dòng im quá 90 giây, dọn giùm dòng im quá 10 phút */
function locPhongMo(du) {
  const nay = Date.now(), ds = [];
  for (const [ma, d] of Object.entries((du && typeof du === 'object' && du) || {})) {
    if (!MANG.laMa(ma) || !d || typeof d.thay !== 'number') continue;
    if (nay - d.thay > 600000) { MANG.goi(`sanhbida/${ma}`, 'DELETE'); continue; }
    if (nay - d.thay > 90000 || !(d.trong >= 1)) continue;
    ds.push({ ma, ten: String(d.ten || 'Ai đó').slice(0, 20), trong: Math.min(3, d.trong), kieu: d.kieu === 9 ? 9 : 8, so: Math.max(2, Math.min(4, d.so || 2)), tao: typeof d.tao === 'number' ? d.tao : d.thay, thay: d.thay });
  }
  return ds;
}
/* tìm phòng nhanh: vào phòng mở sắp đủ người nhất, ngồi ghế trống đầu tiên; không còn phòng nào thì tự tạo phòng mở */
async function timNhanh() {
  if (!MANG) return;
  tatTimPhong();
  const o = tam && tam.querySelector('.bd-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  moTin('<p class="bd-tin-nho">Tìm phòng nhanh</p><h2>Đang tìm phòng…</h2>');
  const r = await MANG.goi('sanhbida', 'GET');
  if (!r.ok) {
    moTin('<p class="bd-tin-nho">Tìm phòng nhanh</p><h2>Chưa tìm được</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="bd-moi">Quay lại</button>');
    return;
  }
  for (const d of locPhongMo(r.du).sort((a, b) => a.trong - b.trong || b.thay - a.thay).slice(0, 4)) {
    const p = await MANG.goi(`bida/${d.ma}`, 'GET'), cay = p.ok ? MANG.chuan(p.du) : null;
    if (!cay || cay.batDau) continue;
    const so = Math.max(2, Math.min(4, cay.so || 2)), P = Array.from({ length: so }, (_, Q) => Q).find(Q => !(cay.ghe && cay.ghe[Q]));
    if (P === undefined) continue;
    const id = MANG.idMoi(), g = await MANG.goi(`bida/${d.ma}/ghe/${P}`, 'PATCH', { id, ten: tenMinh() || `Người ${P + 1}`, thay: MANG.GIO });
    if (!g.ok) continue;
    vaoPhong(d.ma, { id, P });
    if (phong && phong.ma === d.ma) phong.tuSanh = true;
    return;
  }
  const c = docLuu();
  await taoPhong(Object.assign(cauHinhTao(c), { mo: true }));
  if (phong && phong.mo) bao('Chưa có phòng nào đang chờ — đã tạo phòng mở, chờ người vào.');
}
function cauHinhTao(c) {
  const kieu = c.kieu === 9 ? 9 : 8;
  return { P: 0, kieu, so: kieu === 9 ? Math.max(2, Math.min(4, c.soPhong || 2)) : 2, kho: [0, 1, 2].includes(c.kho) ? c.kho : 1, ten: tenMinh(), pha: 0 };
}
function dsPhongHtml() {
  if (!timPhong || !timPhong.xong) return '<p class="bd-meo">Đang tìm phòng…</p>';
  if (timPhong.loi) return '<p class="bd-meo">Chưa tải được danh sách — kiểm tra mạng, máy tự thử lại.</p>';
  if (!timPhong.ds.length) return '<p class="bd-meo">Chưa có phòng nào đang chờ. Tạo một phòng mở để người khác vào chơi cùng.</p>';
  const tuoi = (t) => { const p = Math.floor((Date.now() - t) / 60000); return p < 1 ? 'vừa tạo' : `${p} phút trước`; };
  return timPhong.ds.map(d => `<button type="button" class="bd-phong-mo" data-phongmo="${d.ma}"><b>Phòng của ${esc(d.ten)}</b><small>${d.kieu} bi · ${d.so} người · còn ${d.trong} ghế · ${tuoi(d.tao)}</small></button>`).join('');
}
function vaoPhongMo(ma) {
  if (!MANG || !MANG.laMa(ma)) return;
  tatTimPhong();
  const t = tam && tam.querySelector('.bd-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  vaoPhong(ma);
  if (phong && phong.ma === ma) phong.tuSanh = true;
}
async function ngoiGhe(P) {
  if (!phong || phong.P >= 0) return;
  const o = tam && tam.querySelector('.bd-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  const r = await MANG.goi(`bida/${phong.ma}/ghe/${P}`, 'PATCH', { id: phong.id, ten: tenMinh() || `Người ${P + 1}`, thay: MANG.GIO });
  if (!phong) return;
  if (r.ok) {
    phong.P = P; phong.nhipCuoi = Date.now();
    ghiLuu({ phong: { ma: phong.ma, id: phong.id, P } });
    if (phong.cay) khiPhongDoi(phong.cay);
  } else bao(r.ma === 401 ? (phong.cay && phong.cay.batDau ? 'Ván đã bắt đầu, không vào ghế được nữa.' : 'Ghế này vừa có người ngồi.') : 'Mất mạng, chưa vào được ghế.');
}
async function batDauPhong() {
  if (!phong || !phong.cay || phong.cay.batDau) return;
  const them = { batDau: MANG.GIO };
  for (const P of cacGhe()) if (!gheCua(P)) them['may/' + P] = true;
  const r = await MANG.goi(`bida/${phong.ma}`, 'PATCH', them);
  if (!r.ok && r.ma !== 401) bao('Mất mạng, chưa bắt đầu được.');
}
function batDauVanPhong() {
  boViec();
  dang = null; mayNgam = null;
  const cay = phong.cay, kieu = cay.kieu === 9 ? 9 : 8, so = soGhe(), pha = Math.max(0, Math.min(so - 1, cay.pha || 0)), hat = hatPhong(phong.ma);
  van = { cheDo: 'phong', kieu, so, kho: [0, 1, 2].includes(cay.kho) ? cay.kho : 1, pha, hat, minh: phong.P, ma: phong.ma,
    the: L.theMoi(kieu, so, hat, pha), nguoi: [], hetVan: false, doiMay: false };
  Object.assign(phong, { ke: 0, nhat: [], hop: [], daGui: null, song: false });
  ngam.a = 0; ngam.b = 0;
  tatTin();
  chayPhong();
  if (van && laMinh(van.the.luot) && van.the.pha) bao('Bạn phá trước: kéo bi trắng để đặt, kéo trên bàn để ngắm, kéo thanh Lực xuống rồi thả để đánh.');
}
/* áp các cú mới tới từ máy chủ, theo đúng thứ tự. Vào phòng (hay dựng lại) thì áp ngay hết; đang chơi thì cú mới nhất cho
   thấy cơ thọc rồi bi lăn, xong lại gọi tiếp (xongHoat → chayPhong). */
function chayPhong() {
  if (!phong || !van || van.cheDo !== 'phong' || dang || mayNgam) return;
  const ds = (phong.cay && phong.cay.cu) || {};
  for (;;) {
    const r = ds[phong.ke];
    if (!r) break;
    const cu = L.docCu(r.d), kq = L.docKq(r.kq);
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
  phong.song = true;
  denLuot();
}
/* ghi cú của mình (hay của máy chơi thay mà mình chạy) lên máy chủ */
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
  van.the = L.theMoi(van.kieu, van.so, van.hat, van.pha);
  van.hetVan = false;
  Object.assign(phong, { ke: 0, nhat: [], hop: [], daGui: null, song: false });
  chayPhong();
}
/* máy chơi thay do ai chạy: người ngồi ghế số nhỏ nhất còn ở đây (không ai thì người còn ở đây bất kỳ) */
function toiChayMay() {
  if (!phong || phong.P < 0) return false;
  let ds = cacGhe().filter(P => gheCua(P) && !mayCua(P) && conO(P));
  if (!ds.length) ds = cacGhe().filter(P => gheCua(P) && conO(P));
  return ds.length > 0 && ds[0] === phong.P;
}
function viecPhong() {
  if (!van || van.cheDo !== 'phong' || !phong || phong.P < 0 || van.the.thang >= 0) return '';
  if (mayCua(phong.P)) return 'tudi';
  const P = van.the.luot;
  return !mayPhong(P) && P !== phong.P && !conO(P) ? 'thay' : '';
}
function choMayThay() { if (viecPhong() === 'thay') MANG.goi(`bida/${phong.ma}/may/${van.the.luot}`, 'PUT', true); }
function tuDiTiep() { if (viecPhong() === 'tudi') MANG.goi(`bida/${phong.ma}/may/${phong.P}`, 'DELETE'); }
/* mỗi 5 giây: báo mình còn ở đây, nối lại luồng nếu đã đóng, xem có phải nhận chạy máy (người trước đã rời) */
function kiemPhong() {
  if (!phong) return;
  if (phong.P >= 0 && Date.now() - phong.nhipCuoi > NHIP && !(typeof document !== 'undefined' && document.hidden)) {
    phong.nhipCuoi = Date.now();
    MANG.goi(`bida/${phong.ma}/ghe/${phong.P}/thay`, 'PUT', MANG.GIO);
    capNhatSanh(true);
  }
  if (phong.luong) phong.luong.noiLai();
  if (!phong.cay) return;
  if (!phong.cay.batDau) veSanh();
  else if (van && van.cheDo === 'phong' && !dang && !mayNgam) { capNhatChu(); denLuot(); }
}
/* nút mời: máy có bảng chia sẻ (điện thoại) thì Gửi link mời mở bảng chia sẻ, cạnh đó Chép link; không có thì một nút chép */
const coChiaSe = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
function nutMoiBan(nhanGui, nhanChep, chinh) {
  return coChiaSe()
    ? `<div class="bd-hai"><button type="button" class="${chinh ? '' : 'bd-phu '}bd-moi-ban">${nhanGui}</button><button type="button" class="bd-phu bd-chep-link">Chép link</button></div>`
    : `<button type="button" class="${chinh ? '' : 'bd-phu '}bd-chep-link">${nhanChep}</button>`;
}
function chepChu(chu) {
  const cachCu = () => {
    try {
      const o = document.createElement('textarea');
      o.value = chu; o.setAttribute('readonly', ''); o.style.position = 'fixed'; o.style.opacity = '0';
      document.body.appendChild(o); o.select();
      const ok = document.execCommand('copy');
      o.remove();
      return !!ok;
    } catch (e) { return false; }
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(chu).then(() => true, () => cachCu());
  return Promise.resolve(cachCu());
}
function nutXong(sel, chu) {
  const b = tam && tam.querySelector(`.bd-tin ${sel}`);
  if (!b) return;
  const cu = b.textContent;
  b.textContent = chu;
  setTimeout(() => { if (b.textContent === chu) b.textContent = cu; }, 1800);
}
function chepMa() {
  if (!phong) return;
  const ma = phong.ma;
  chepChu(ma).then(ok => { nutXong('.bd-chep-ma', ok ? 'Đã chép ✓' : 'Chưa chép được'); bao(ok ? `Đã chép mã phòng ${ma}` : `Mã phòng: ${ma}`); });
}
function chepLink() {
  if (!phong) return;
  const ma = phong.ma, url = linkMoi(ma);
  chepChu(url).then(ok => {
    if (ok) { nutXong('.bd-chep-link', 'Đã chép ✓'); bao(`Đã chép link mời phòng ${ma} — dán vào Zalo, Messenger để gửi.`); return; }
    moTin(`<p class="bd-tin-nho">Phòng ${ma}</p><h2>Chép link mời</h2><p>Máy chưa cho chép tự động. Chạm giữ vào link rồi chọn Sao chép:</p>
      <input class="bd-o-ten bd-o-link" readonly value="${esc(url)}"><button type="button" class="bd-dongtin">Xong</button>`);
    const o = tam && tam.querySelector('.bd-o-link');
    if (o && o.select) setTimeout(() => { try { o.focus(); o.select(); } catch (e) {} }, 60);
  });
}
function moiBan() {
  if (!phong) return;
  const url = linkMoi(phong.ma);
  if (coChiaSe()) { navigator.share({ title: (chuDe() && chuDe().tieuDe) || 'Bida lỗ', text: `Vào phòng ${phong.ma} chơi bida`, url }).catch(() => {}); return; }
  chepLink();
}
function moPhongTT() {
  moTin(`<p class="bd-tin-nho">Đang chơi qua mạng · ${kieuChu(phong.cay)}</p>${dongMa()}${hangGhe(phong.cay, phong.P, true)}
    <p class="bd-meo">Ai có link cũng vào xem được. Tới lượt người vắng quá một phút thì người khác bấm được "Cho máy đánh thay".</p>
    <button type="button" class="bd-dongtin">Chơi tiếp</button>
    ${nutMoiBan('Gửi link xem ván', 'Chép link xem ván', false)}
    ${nutQR()}${khungQR()}
    <button type="button" class="bd-chu bd-roi">Rời phòng</button>`);
}
function xacNhanRoi() {
  moTin(`<p class="bd-tin-nho">Phòng ${phong.ma}</p><h2>Rời phòng giữa ván?</h2>
    <p>Ghế của bạn đứng yên; tới lượt bạn thì người khác bấm được "Cho máy đánh thay". Mở lại link phòng là vào lại đúng ghế.</p>
    <button type="button" class="bd-dongtin">Ở lại chơi tiếp</button>
    <button type="button" class="bd-phu bd-roi-that">Rời phòng</button>`);
}
/* ván nữa: ai bấm trước thì giữ chỗ mã phòng mới trong phòng cũ (tiep, ghi một lần), rồi tạo phòng đó; người kế phá */
async function vanNua() {
  if (!phong || !phong.cay) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }
  const cu = phong.ma, cay = phong.cay, P = phong.P >= 0 ? phong.P : 0, ma = MANG.maMoi();
  const r = await MANG.goi(`bida/${cu}/tiep`, 'PUT', ma);
  if (!phong || phong.ma !== cu) return;
  if (!r.ok) { bao(r.ma === 401 ? 'Có người vừa mời ván nữa — bấm Vào ván mới.' : 'Mất mạng, thử lại nhé.'); return; }
  await taoPhong({ P, kieu: cay.kieu === 9 ? 9 : 8, so: soGhe(), kho: cay.kho || 0, ten: tenMinh() || `Người ${P + 1}`, ma, pha: ((cay.pha || 0) + 1) % soGhe() });
}
function theoTiep(ma) {
  const P = phong && phong.P >= 0 ? phong.P : -1;
  vaoPhong(ma, null, P);
  if (phong) phong.choTiep = Date.now();
}
/* mã phòng từ chữ người dùng gõ hay dán: mã trần, hay cả link mời (…?phong=MÃ, …#bida/MÃ) */
function trichMa(chu) {
  const s = String(chu || '').trim();
  const m = /[?&]phong=([A-Za-z0-9]{6})/.exec(s) || /#bida\/([A-Za-z0-9]{6})/.exec(s);
  const ma = (m ? m[1] : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return MANG && MANG.laMa(ma) ? ma : '';
}
function vaoBangMa() {
  const o = tam && tam.querySelector('.bd-o-ma'), t = tam && tam.querySelector('.bd-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  const ma = trichMa(o ? o.value : '');
  if (ma) vaoPhong(ma); else bao('Mã phòng gồm 6 chữ và số, như trong tin nhắn mời.');
}
function theoMaTrenDiaChi() {
  if (!tam || !tam.classList.contains('hien') || !MANG) return;
  const m = MA_DIA_CHI.exec(dauThang());
  if (m && (!phong || phong.ma !== m[1])) { const l = docLuu().phong; vaoPhong(m[1], l && l.ma === m[1] ? { id: l.id, P: l.P } : null); }
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
function tatTin() { tatTimPhong(); if (tam) { tam.querySelector('.bd-tin').hidden = true; tam.classList.remove('bd-co-tin'); } }
const HINH_LOI = {
  may: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="3"/><circle cx="9.5" cy="13.5" r="1.2"/><circle cx="14.5" cy="13.5" r="1.2"/><path d="M12 4.5V8M9 19v2M15 19v2"/></svg>',
  tap: '<svg viewBox="0 0 24 24"><circle cx="15" cy="9" r="4.2"/><path d="M3 20.5L11.5 12"/><circle cx="15" cy="9" r="1.3"/></svg>',
  tao: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><path d="M18 7.5v6M15 10.5h6"/></svg>',
  vao: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15.5" r="3.5"/><path d="M10.5 13L19 4.5M16.2 7.3l2.4 2.4M14 9.5l1.9 1.9"/></svg>',
  tim: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5M10.5 8v5"/></svg>',
  nhanh: '<svg viewBox="0 0 24 24"><path d="M13.5 3L5.5 13.5h6l-1.5 7.5 8-10.5h-6z"/></svg>',
};
let manDang = 'chinh';
function moCaiDat() { moMan('chinh'); }
function moMan(man) {
  manDang = man;
  const l = docLuu(), kieu = l.kieu === 9 ? 9 : 8, kho = [0, 1, 2].includes(l.kho) ? l.kho : 1, soMay = [1, 2, 3].includes(l.soMay) ? l.soMay : 1;
  const soPhong = [2, 3, 4].includes(l.soPhong) ? l.soPhong : 2, moCho = l.mo === 1;
  if (man === 'tim') batTimPhong(); else tatTimPhong();
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="bd-chon${bat ? ' bd-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const dongKieu = `<p class="bd-nhan">Kiểu chơi</p><div class="bd-hang">${nut('8 bi<small>trơn, sọc, bi 8</small>', 8, kieu === 8, 'kieu')}${nut('9 bi<small>bi nhỏ nhất trước</small>', 9, kieu === 9, 'kieu')}</div>
    <p class="bd-meo bd-trai">${kieu === 9 ? 'Luôn chạm bi số nhỏ nhất trước; ai đưa bi 9 vào lỗ trong một cú đúng luật thì thắng. Chơi được 2–4 người.' : 'Vào bi trơn (1–7) hay sọc (9–15) trước thì nhận nhóm đó; hết nhóm thì đánh bi 8 vào lỗ đã chọn. Hai người.'}</p>`;
  const muc = KHO.map((k, i) => nut(k, i, i === kho, 'kho')).join('');
  const lui = '<button type="button" class="bd-lui" data-man="chinh">‹ Quay lại</button>';
  const oTen = (goiY) => `<p class="bd-nhan">Tên của bạn</p><input class="bd-o-ten" maxlength="20" value="${esc(l.ten || '')}" placeholder="${goiY}" autocomplete="nickname">`;
  let html;
  if (man === 'may') html = `${lui}<p class="bd-tin-nho">Đấu với máy</p><h2>${kieu === 9 && soMay > 1 ? tenMay().slice(0, soMay).join(', ') : tenMay()[0]}</h2>${dongKieu}
    ${kieu === 9 ? `<p class="bd-nhan">Số máy cùng chơi</p><div class="bd-hang">${[1, 2, 3].map(n => nut(String(n), n, n === soMay, 'somay')).join('')}</div>` : ''}
    <p class="bd-nhan">Máy chơi</p><div class="bd-hang">${muc}</div>
    <p class="bd-meo">Dễ hay đánh lệch; Khó ngắm chuẩn, tính cả chỗ bi chủ dừng cho cú sau.</p>
    <button type="button" class="bd-batdau">Bắt đầu — bạn phá trước</button>`;
  else if (man === 'tap') html = `${lui}<p class="bd-tin-nho">Tập một mình</p><h2>Đánh tuỳ thích</h2>${dongKieu}
    <p class="bd-meo">Không có lượt, không bắt lỗi; rơi bi chủ thì đặt lại. Hợp để làm quen lực và xoáy.</p>
    <button type="button" class="bd-tap">Xếp bi</button>`;
  else if (man === 'tao' && MANG) html = `${lui}<p class="bd-tin-nho">Tạo phòng</p><h2>${moCho ? 'Phòng mở cho mọi người' : 'Mời bạn chơi cùng'}</h2>
    ${oTen(moCho ? 'Người khác thấy tên này trong danh sách' : 'Để bạn bè biết là ai')}${dongKieu}
    ${kieu === 9 ? `<p class="bd-nhan">Số người</p><div class="bd-hang">${[2, 3, 4].map(n => nut(String(n), n, n === soPhong, 'sophong')).join('')}</div>` : ''}
    <p class="bd-nhan">Ai được vào</p><div class="bd-hang">${nut('Bạn bè có link', 0, !moCho, 'mo')}${nut('Mọi người', 1, moCho, 'mo')}</div>
    <p class="bd-meo bd-trai">${moCho ? 'Ai bấm "Tìm phòng nhanh" hay "Xem phòng đang chờ" cũng vào được, không cần mã.' : 'Chỉ ai có link hay mã mới vào được.'}</p>
    <p class="bd-nhan">Ghế không ai vào thì máy chơi</p><div class="bd-hang">${muc}</div>
    <button type="button" class="bd-tao">Tạo phòng</button>
    <p class="bd-meo">Tạo xong có link và mã QR để mời. Bạn ngồi ghế 1, phá trước.</p>`;
  else if (man === 'tim' && MANG) html = `${lui}<p class="bd-tin-nho">Tìm phòng</p><h2>Phòng đang chờ người</h2>
    ${oTen('Để trống thì gọi theo số ghế')}
    <button type="button" class="bd-tim-nhanh">Tìm phòng nhanh</button>
    <p class="bd-meo">Vào ngay phòng sắp đủ người; không có phòng nào thì tự tạo phòng mở, chờ người vào. Hay chọn một phòng:</p>
    <div class="bd-ds-phong">${dsPhongHtml()}</div>
    <p class="bd-meo">Phòng mở do người chơi tạo, ai cũng vào được. Danh sách tự làm mới.</p>
    <button type="button" class="bd-phu bd-tao-mo">Tạo phòng mở</button>`;
  else if (man === 'vao' && MANG) html = `${lui}<p class="bd-tin-nho">Vào phòng</p><h2>Nhập mã phòng</h2>
    <input class="bd-o-ma bd-o-ma-to" maxlength="400" placeholder="VD: BMVZVJ" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
    <p class="bd-meo">6 chữ và số trong tin nhắn mời — dán cả link vào đây cũng được.</p>
    ${oTen('Để trống thì gọi theo số ghế')}
    <button type="button" class="bd-vao" disabled>Vào phòng</button>`;
  else {
    manDang = 'chinh';
    const loi = (k, tieu, phu) => `<button type="button" class="bd-lua" data-man="${k}"><span class="bd-lua-hinh">${HINH_LOI[k]}</span><span class="bd-lua-chu"><b>${tieu}</b><i>${phu}</i></span></button>`;
    const cd = chuDe();
    html = `${cd ? `<div class="bd-chao"><img src="${esc(cd.anhNi)}" alt="${esc(cd.chuThayAnh || cd.tieuDe)}"></div>` : ''}<p class="bd-tin-nho">${cd ? 'Quà tặng' : 'Ván mới'}</p><h2>${esc((cd && cd.tieuDe) || 'Bida lỗ')}</h2>
    ${loi('may', 'Đấu với máy', `8 bi với ${tenMay()[0]}, hay 9 bi với tới ba máy`)}
    ${loi('tap', 'Tập một mình', 'Làm quen lực, xoáy, không bắt lỗi')}
    ${MANG ? loi('tao', 'Tạo phòng, mời bạn', 'Mỗi người một máy — gửi link hay cho quét mã QR') + loi('vao', 'Vào phòng của bạn', 'Có mã 6 ký tự, hay link bạn gửi') +
      loi('nhanh', 'Tìm phòng nhanh', 'Vào ngay phòng đang thiếu người, không có thì tự tạo phòng mở') +
      loi('tim', 'Xem phòng đang chờ', 'Chọn phòng trong danh sách — không cần mã') : ''}
    <button type="button" class="bd-chu bd-tieng">${coTieng ? '🔊 Âm thanh đang bật' : '🔇 Âm thanh đang tắt'}</button>`;
  }
  moTin(html);
  if (manDang === 'vao') { const o = tam.querySelector('.bd-o-ma'); if (o && o.focus) setTimeout(() => o.focus(), 60); }
}
function moHuongDan() {
  moTin(`<p class="bd-tin-nho">Cách chơi</p><h2>Bida lỗ</h2>
    <p><b>Ngắm:</b> kéo ngón tay trên bàn, cơ chĩa theo. Ngắm cho chuẩn thì vuốt lên xuống dải gân bên trái.</p>
    <p><b>Đánh:</b> kéo thanh <b>Lực</b> bên phải xuống — càng xa càng mạnh — rồi thả tay. Kéo ngược lên hết thì thôi không đánh. Bi đang lăn thì chạm bàn để tua nhanh.</p>
    <p><b>Xoáy:</b> nút Xoáy dưới bàn. Chấm đỏ là chỗ đầu cơ chạm bi chủ: cao là <b>đẩy</b> (bi chủ chạy theo), thấp là <b>kéo</b> (bi chủ giật lùi), giữa là <b>đâm</b> (bi chủ đứng lại); lệch trái, phải thì bi chủ bật băng lệch theo.</p>
    <p><b>Đường ngắm:</b> vòng trắng là chỗ bi chủ chạm; vạch đậm là đường bi đích sẽ chạy, vạch đứt là đường bi chủ sau khi xoáy ăn.</p>
    <p><b>8 bi:</b> phá xong bàn còn mở — vào bi trơn (1–7) hay sọc (9–15) trước thì nhận nhóm đó. Mỗi cú phải chạm bi nhóm mình trước, chạm xong phải có bi vào lỗ hay chạm băng. Hết nhóm thì đánh bi 8, chạm vòng ở miệng lỗ để chọn lỗ. Bi 8 vào đúng lỗ là thắng; vào sớm, vào sai lỗ, hay vào cùng cú phạm lỗi là thua.</p>
    <p><b>9 bi:</b> luôn chạm bi số nhỏ nhất trên bàn trước; vào bi nào cũng được đánh tiếp; bi 9 vào lỗ trong một cú đúng luật là thắng — kể cả ăn ké, kể cả ngay cú phá. Hai tới bốn người đánh lần lượt.</p>
    <p><b>Phạm lỗi</b> (bi chủ rơi lỗ, không chạm bi nào, chạm sai bi trước, chạm xong không bi nào chạm băng): người kế được đặt bi chủ ở đâu cũng được. Cú phá phải có bi vào lỗ hay ít nhất bốn bi chạm băng.</p>
    <p class="bd-meo">Theo luật WPA, bớt vài chỗ cho dễ chơi: không phải gọi lỗ (trừ bi 8), không có push out, không xử thua ba lỗi liền.</p>
    <button type="button" class="bd-dongtin">Chơi</button>`);
}
function ketThucVan(capNhat) {
  if (!van) return;
  const the = van.the, ly = LY_DO[the.lyDo] || '', minhThang = laMinh(the.thang) || (van.cheDo !== 'phong' && the.thang === 0);
  const thua = the.lyDo && the.lyDo[0] === '8' && the.lyDo !== '8dung';
  const tieuDe = van.so < 2 ? 'Hết bi rồi!' : minhThang ? `${tenBan()} thắng!` : `${tenNguoi(the.thang)} thắng!`;
  const loi = (van.so < 2 ? `Dọn sạch bàn sau ${the.soCu} cú.`
    : thua ? `${(the.thang + 1) % 2 === van.minh ? tenBan() : tenNguoi((the.thang + 1) % 2)} thua: ${ly}.` : `${minhThang ? tenBan() : tenNguoi(the.thang)} ${ly}.`)
    + (chuDe() && chuDe().loi && van.so > 1 ? ' ' + chon1(minhThang ? chuDe().loi.thang : chuDe().loi.thua) : '');
  if (!capNhat && (minhThang || van.so < 2)) tiengThang();
  if (van.cheDo === 'phong') {
    if (!capNhat && phong && phong.cay && !phong.cay.xong) MANG.goi(`bida/${phong.ma}/xong`, 'PUT', MANG.GIO);   // mốc để dọn phòng sau 5 phút
    const tiep = phong && phong.cay && phong.cay.tiep;
    moTin(`<p class="bd-tin-nho">Hết ván · ${the.soCu} cú · phòng ${van.ma}</p><h2>${esc(tieuDe)}</h2><p>${esc(loi)}</p>
      ${tiep ? '<p class="bd-meo">Có người mời chơi ván nữa.</p><button type="button" class="bd-vaotiep">Vào ván mới</button>' : '<button type="button" class="bd-vannua">Chơi ván nữa</button>'}
      <button type="button" class="bd-phu bd-roi">Rời phòng</button>`);
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
  if (q('.bd-tim-nhanh') || ((n = q('[data-man]')) && n.dataset.man === 'nhanh')) { amThanh(); timNhanh(); return; }
  if ((n = q('[data-man]'))) { moMan(n.dataset.man); return; }
  if (q('.bd-dongtin')) { tatTin(); if (!van) { if (phong && phong.cay && !phong.cay.batDau) veSanh(); else moCaiDat(); } return; }
  if ((n = q('[data-kieu]'))) { ghiLuu({ kieu: +n.dataset.kieu }); moMan(manDang); return; }
  if ((n = q('[data-somay]'))) { ghiLuu({ soMay: +n.dataset.somay }); moMan(manDang); return; }
  if ((n = q('[data-sophong]'))) { ghiLuu({ soPhong: +n.dataset.sophong }); moMan(manDang); return; }
  if ((n = q('[data-kho]'))) { ghiLuu({ kho: +n.dataset.kho }); moMan(manDang); return; }
  if ((n = q('[data-mo]'))) { ghiLuu({ mo: +n.dataset.mo }); moMan(manDang); return; }
  if ((n = q('[data-ngoi]'))) { ngoiGhe(+n.dataset.ngoi); return; }
  if ((n = q('[data-phongmo]'))) { amThanh(); vaoPhongMo(n.dataset.phongmo); return; }
  if (q('.bd-batdau')) { amThanh(); const c = docLuu(); vanMoi({ che: 'may', kieu: c.kieu, soMay: c.soMay, kho: c.kho }); return; }
  if (q('.bd-tap')) { amThanh(); vanMoi({ che: 'tap', kieu: docLuu().kieu }); return; }
  if (q('.bd-tao')) { amThanh(); const c = docLuu(); taoPhong(Object.assign(cauHinhTao(c), { mo: c.mo === 1 })); return; }
  if (q('.bd-tao-mo')) { ghiLuu({ mo: 1 }); moMan('tao'); return; }
  if (q('.bd-doi-mo')) { doiPhongMo(); return; }
  if (q('.bd-vao')) { amThanh(); vaoBangMa(); return; }
  if (q('.bd-batdau-phong')) { amThanh(); batDauPhong(); return; }
  if (q('.bd-moi-ban')) { moiBan(); return; }
  if (q('.bd-roi')) { if (van && van.cheDo === 'phong' && !van.hetVan && phong) xacNhanRoi(); else { roiPhong(); moCaiDat(); } return; }
  if (q('.bd-roi-that')) { roiPhong(); moCaiDat(); return; }
  if (q('.bd-chep-ma')) { chepMa(); return; }
  if (q('.bd-chep-link')) { chepLink(); return; }
  if (q('.bd-qr-bat')) { if (phong) { phong.qr = !phong.qr; if (phong.cay && !phong.cay.batDau) veSanh(); else moPhongTT(); } return; }
  if (q('.bd-vannua')) { vanNua(); return; }
  if (q('.bd-vaotiep')) { if (phong && phong.cay && phong.cay.tiep) theoTiep(phong.cay.tiep); return; }
  if ((n = q('.bd-thay'))) { if (n.dataset.viec === 'tudi') tuDiTiep(); else choMayThay(); return; }
  if (q('.bd-tieng')) { coTieng = !coTieng; if (!coTieng && am) am.suspend(); moMan(manDang); return; }
  if (q('.bd-lai')) { if (van) vanMoi({ che: van.cheDo, kieu: van.kieu, soMay: van.soMay, kho: van.kho, pha: van.pha + 1 }); return; }
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
        <div class="bd-xoay-nut"><button type="button" class="bd-xoay-giua">Giữa</button><button type="button" class="bd-xoay-xong">Xong</button></div>
      </div>
    </div>
    <div class="bd-duoi">
      <p class="bd-luot" aria-live="polite"></p>
      <div class="bd-nut"><button class="bd-xoay" type="button" aria-label="Chọn xoáy: chỗ đầu cơ chạm bi chủ"><span><i></i></span>Xoáy</button><button class="bd-thay" type="button" hidden></button><button class="bd-moi" type="button">Ván mới</button></div>
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
    if (o.classList.contains('bd-o-ma')) {
      const ma = trichMa(o.value), n = tam.querySelector('.bd-vao');
      if (ma && /phong=|#bida\//i.test(o.value)) o.value = ma;     // dán cả link: chỉ để lại mã cho dễ nhìn
      if (n) n.disabled = !ma;
    }
  });
  tam.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('bd-o-ma')) vaoBangMa(); });
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
  tatTimPhong();
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
  _toiChayMay: () => toiChayMay(), _viecPhong: () => viecPhong(), _choMayThay: () => choMayThay(), _tuDiTiep: () => tuDiTiep(), _timNhanh: () => timNhanh(),
  _taiDsPhong: () => taiDsPhong(), _timPhong: () => timPhong, _capNhatSanh: (ep) => capNhatSanh(ep), _trichMa: (s) => trichMa(s), _hatPhong: (ma) => hatPhong(ma),
  _datXoay: (a, b) => { ngam.a = a; ngam.b = b; ngam.duKhoa = ''; }, _chuLuot: () => chuLuot(), _viTriHien: () => viTriHien(), _anhBi: () => anhBi,
  _linkMoi: (ma) => linkMoi(ma), _phao: () => phao, _baoKetQua: (b, P) => baoKetQua(b, P), _ketThucVan: () => ketThucVan(),
};
})();

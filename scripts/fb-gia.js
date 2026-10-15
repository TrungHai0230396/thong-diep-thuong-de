/* Máy chủ giả của Firebase Realtime Database, chỉ đủ cho phòng cờ ba người — để scripts/test-phong.js chạy ba "máy"
   chơi chung một phòng mà không cần mạng. Làm đúng những gì đã đo trên Firebase thật (15/10/2026):
   - REST: GET/PUT/PATCH/DELETE <đường>.json; PATCH nhận khoá có dấu / (ghi nhiều chỗ một lần, được hết hay hỏng hết);
     { ".sv": "timestamp" } được thay bằng giờ máy chủ; luật từ chối thì trả 401 { "error": "Permission denied" }.
   - Luồng sự kiện (Accept: text/event-stream): mở ra là "put" cả cây ở "/", sau đó "put" / "patch" kèm đường dẫn
     tính từ chỗ đang nghe; khoá số liền nhau trả về thành mảng.
   - Luật: chép đúng firebase-rules.json, viết tay cho các đường phòng cờ dùng (chỗ nào khác thì từ chối).
   Chạy riêng: node scripts/fb-gia.js [cổng] */
'use strict';
const http = require('http');

const LA_MA = /^[A-HJ-NP-Z2-9]{6}$/;
function taoMay(cong = 0) {
  let goc = {}, lech = 0, tuChoi = 0;
  const bayGio = () => Date.now() + lech;
  const nghe = new Set();

  const tach = (d) => String(d || '').split('/').filter(Boolean);
  const lay = (k) => k.reduce((c, x) => (c && typeof c === 'object' ? c[x] : undefined), goc);
  function dat(k, gt) {
    if (!k.length) { goc = gt == null ? {} : gt; return; }
    let c = goc;
    for (let i = 0; i < k.length - 1; i++) { if (!c[k[i]] || typeof c[k[i]] !== 'object') c[k[i]] = {}; c = c[k[i]]; }
    if (gt == null) delete c[k[k.length - 1]]; else c[k[k.length - 1]] = gt;
    for (let i = k.length - 1; i > 0; i--) {                       // nhánh rỗng thì mất, như Firebase
      const cha = lay(k.slice(0, i));
      if (cha && typeof cha === 'object' && !Object.keys(cha).length) { const ong = i > 1 ? lay(k.slice(0, i - 1)) : goc; delete ong[k[i - 1]]; }
    }
  }
  const sao = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
  /* một yêu cầu dùng đúng một mốc giờ cho cả dấu giờ lẫn luật (như Firebase); lấy giờ hai lần thì có lúc lệch 1 ms */
  function giaiGio(v, nay) {
    if (v && typeof v === 'object') {
      if (v['.sv'] === 'timestamp' && Object.keys(v).length === 1) return nay;
      const o = Array.isArray(v) ? [] : {};
      for (const k of Object.keys(v)) o[k] = giaiGio(v[k], nay);
      return o;
    }
    return v;
  }
  /* khoá số liền nhau từ 0 thì trả mảng (Firebase làm vậy khi hơn nửa số chỗ có giá trị) */
  function thanhMang(v) {
    if (!v || typeof v !== 'object') return v;
    const k = Object.keys(v), o = {};
    for (const x of k) o[x] = thanhMang(v[x]);
    if (k.length && k.every(x => /^\d+$/.test(x))) {
      const lon = Math.max(...k.map(Number));
      if (k.length * 2 > lon + 1) { const a = []; for (let i = 0; i <= lon; i++) a.push(i in o ? o[i] : null); return a; }
    }
    return o;
  }

  /* ---------- luật (firebase-rules.json) ---------- */
  const so = (v, a, b) => typeof v === 'number' && v >= a && v <= b;
  function hopLePhong(r, nay) {
    if (!r || typeof r !== 'object') return false;
    for (const k of Object.keys(r)) if (!['tao', 'chu', 'kho', 'luat', 'ghe', 'batDau', 'may', 'nuoc', 'xong', 'tiep'].includes(k)) return false;
    if ('luat' in r && r.luat !== 'tq') return false;                // luật Tam quốc, chỉ ghi lúc tạo phòng
    if (r.tao !== nay || !so(r.chu, 0, 2) || !so(r.kho, 0, 2) || !r.ghe || typeof r.ghe !== 'object') return false;
    return Object.keys(r.ghe).every(P => /^[012]$/.test(P) && hopLeGhe(r.ghe[P], nay));
  }
  function hopLeGhe(g, nay) {
    if (!g || typeof g !== 'object' || typeof g.id !== 'string' || !/^[a-z0-9]{8,16}$/.test(g.id)) return false;
    for (const k of Object.keys(g)) if (!['id', 'ten', 'thay'].includes(k)) return false;
    if ('ten' in g && !(typeof g.ten === 'string' && g.ten.length >= 1 && g.ten.length <= 20)) return false;
    if ('thay' in g && g.thay !== nay) return false;
    return true;
  }
  /* một lần ghi ở đường k (đã bỏ "coba"), giá trị gt (null là xoá); r là phòng hiện có */
  function choGhi(ma, k, gt, nay) {
    if (!LA_MA.test(ma)) return false;
    const r = lay(['coba', ma]);
    if (!k.length) {
      if (!r) return gt != null && hopLePhong(gt, nay);
      return gt == null && (r.tao < nay - 86400000 || (typeof r.xong === 'number' && r.xong < nay - 300000));
    }
    if (!r) return false;
    const [a, b, c] = k;
    if (k.length === 1) {
      if (a === 'batDau' || a === 'xong') return !(a in r) && gt === nay;
      if (a === 'tiep') return !('tiep' in r) && typeof gt === 'string' && LA_MA.test(gt);
      return false;
    }
    if (a === 'may' && k.length === 2) return /^[012]$/.test(b) && (gt == null || gt === 'ho' || gt === 'rua');
    if (a === 'nuoc' && k.length === 2) {
      if (!/^[0-9]{1,4}$/.test(b) || (r.nuoc && b in r.nuoc) || !('batDau' in r) || !gt || typeof gt !== 'object') return false;
      const ks = Object.keys(gt);
      return ks.length === 5 && ['P', 'tu', 'toi', 'phong', 'nhap'].every(x => ks.includes(x)) && so(gt.P, 0, 2) && so(gt.tu, 0, 95) && so(gt.toi, 0, 95) && so(gt.phong, 0, 6) && so(gt.nhap, 0, 2);
    }
    if (a === 'ghe' && k.length === 3 && /^[012]$/.test(b)) {
      const g = (r.ghe && r.ghe[b]) || {};
      if (c === 'id') return !('id' in g) && !('batDau' in r) && typeof gt === 'string' && /^[a-z0-9]{8,16}$/.test(gt);
      if (c === 'ten') return typeof gt === 'string' && gt.length >= 1 && gt.length <= 20;
      if (c === 'thay') return gt === nay;
    }
    return false;
  }

  function guiSuKien(duongGhi, loai, du) {
    for (const n of nghe) {
      const L = tach(n.duong), W = tach(duongGhi);
      if (W.slice(0, L.length).join('/') === L.join('/')) {
        const rel = '/' + W.slice(L.length).join('/');
        n.viet(loai, { path: rel, data: loai === 'patch' ? du : thanhMang(sao(lay(W))) });
      } else if (L.slice(0, W.length).join('/') === W.join('/')) {
        n.viet('put', { path: '/', data: thanhMang(sao(lay(L))) });
      }
    }
  }

  const may = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': '*' };
    if (req.method === 'OPTIONS') { res.writeHead(204, cors); res.end(); return; }
    const duong = u.pathname.replace(/\.json$/, ''), k = tach(duong);
    let than = '';
    const tu = (ma, du) => { res.writeHead(ma, Object.assign({ 'Content-Type': 'application/json' }, cors)); res.end(JSON.stringify(du)); };
    const khong = () => { tuChoi++; if (process.env.FB_GIA_KE) console.log('  [từ chối]', req.method, duong, than.slice(0, 120)); tu(401, { error: 'Permission denied' }); };
    const doc = k[0] === 'coba' && k.length >= 2 && LA_MA.test(k[1]);
    if (req.method === 'GET') {
      if (!doc) return khong();
      if ((req.headers.accept || '').includes('text/event-stream')) {
        res.writeHead(200, Object.assign({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }, cors));
        const n = { duong, viet: (ev, du) => res.write(`event: ${ev}\ndata: ${JSON.stringify(du)}\n\n`) };
        nghe.add(n);
        n.viet('put', { path: '/', data: thanhMang(sao(lay(k))) });
        req.on('close', () => nghe.delete(n));
        return;
      }
      return tu(200, thanhMang(sao(lay(k))));
    }
    req.on('data', (c) => { than += c; });
    req.on('end', () => {
      let gt = null;
      if (req.method !== 'DELETE') { try { gt = JSON.parse(than); } catch (e) { return tu(400, { error: 'Invalid data' }); } }
      if (k[0] !== 'coba' || k.length < 2) return khong();
      const nay = bayGio(), ma = k[1], trong = k.slice(2);
      if (req.method === 'PATCH') {
        if (!gt || typeof gt !== 'object') return tu(400, { error: 'Invalid data' });
        const ghi = Object.keys(gt).map(x => ({ k: trong.concat(tach(x)), gt: giaiGio(gt[x], nay) }));
        /* từng chỗ phải qua luật; ghế (ghe/P) thì xét luôn điều kiện "phải có id" sau khi ghi */
        for (const g of ghi) if (!choGhi(ma, g.k, g.gt, nay)) return khong();
        for (const g of ghi) if (g.k[0] === 'ghe') {
          const cu = lay(['coba', ma, 'ghe', g.k[1]]) || {};
          if (!('id' in cu) && !ghi.some(x => x.k[0] === 'ghe' && x.k[1] === g.k[1] && x.k[2] === 'id')) return khong();
        }
        for (const g of ghi) dat(['coba', ma].concat(g.k), g.gt);
        const du = {}; for (const x of Object.keys(gt)) du[x] = giaiGio(gt[x], nay);
        guiSuKien(duong, 'patch', du);
        return tu(200, du);
      }
      if (req.method === 'PUT' || req.method === 'DELETE') {
        const v = req.method === 'DELETE' ? null : giaiGio(gt, nay);
        if (trong[0] === 'ghe' && trong.length === 3 && trong[2] !== 'id' && !(lay(['coba', ma, 'ghe', trong[1], 'id']))) return khong();
        if (!choGhi(ma, trong, v, nay)) return khong();
        dat(k, v);
        guiSuKien(duong, 'put');
        return tu(200, v);
      }
      tu(405, { error: 'Method not allowed' });
    });
  });
  return new Promise((ok) => may.listen(cong, '127.0.0.1', () => ok({
    cong: may.address().port,
    dongLai: () => new Promise((x) => { for (const n of nghe) n.viet('cancel', null); may.closeAllConnections && may.closeAllConnections(); may.close(() => x()); }),
    datLech: (ms) => { lech = ms; },                                // vặn đồng hồ máy chủ (thử phòng cũ, hết ván 5 phút)
    gieo: (k, gt) => dat(tach(k), gt),                              // đặt thẳng dữ liệu, bỏ qua luật (thử phòng quá hạn)
    lay: (k) => sao(lay(tach(k))),
    soNguoiNghe: () => nghe.size,
    soTuChoi: () => tuChoi,                                         // số lần luật từ chối (đi trùng, tranh ghế…)
  })));
}

module.exports = { taoMay };
if (require.main === module) taoMay(+process.argv[2] || 5181).then(m => console.log('máy chủ giả Firebase ở http://127.0.0.1:' + m.cong));

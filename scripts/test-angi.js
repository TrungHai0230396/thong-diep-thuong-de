/* Kiểm thử Ăn gì: node scripts/test-angi.js
   Dữ liệu món (đủ cột, đúng khuôn, mỗi bữa đủ món, đủ món chay); hoàn cảnh (bữa theo giờ, mùng 1 và rằm theo lịch âm
   của Xem ngày, đọc thời tiết Open-Meteo, miền theo toạ độ, né món mới chốt); chọn tám món (đúng lọc, đa dạng, món phổ
   biến ra nhiều hơn, trời mưa thì món nóng, nới lọc khi chặt quá, không bao giờ nới chay); vòng quay (lời giải đóng khớp
   tích phân từng bước, giải ngược đúng, công bằng theo diện tích miếng trên 40.000 lượt, vuốt tay không nhắm được món);
   cả nhóm (gạch là loại, tim là miếng to); mâm cơm (đúng loại, khoá, không trùng rau, cặp kinh điển, đi chợ); giao
   diện trên DOM giả (quay tới kết quả, chốt rồi lần sau né, bỏ, đổi, lọc, cả nhóm, mâm cơm, kho lưu hỏng). */
'use strict';
const fs = require('fs');
const path = require('path');
const M = require('../assets/monan.js');
const L = require('../assets/lich.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const hat = (s) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };   // số ngẫu nhiên có hạt giống

/* ======================================================================================================== */
console.log('\n— Dữ liệu món —');
{
  const tho = fs.readFileSync(path.join(__dirname, '..', 'assets', 'monan.js'), 'utf8');
  const khoi = (ten) => tho.slice(tho.indexOf(`const ${ten} = \``) + ten.length + 10, tho.indexOf('`;', tho.indexOf(`const ${ten} = \``)));
  const dongNgoai = khoi('NGOAI_THO').trim().split('\n'), dongNha = khoi('NHA_THO').trim().split('\n');
  ok(`món ăn ngoài: ${M.NGOAI.length} món, dòng nào cũng đủ 11 cột`, M.NGOAI.length >= 90 && dongNgoai.every(d => d.split('|').length === 11),
     dongNgoai.filter(d => d.split('|').length !== 11).join(' / '));
  ok(`món nấu ở nhà: ${M.NHA.length} món, dòng nào cũng đủ 8 cột`, M.NHA.length >= 45 && dongNha.every(d => d.split('|').length === 8),
     dongNha.filter(d => d.split('|').length !== 8).join(' / '));
  const ma = [...M.NGOAI, ...M.NHA].map(m => m.id);
  ok('mã món không trùng, viết thường không dấu', new Set(ma).size === ma.length && ma.every(id => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)),
     ma.filter((id, i) => ma.indexOf(id) !== i).join(', '));
  const sai = M.NGOAI.filter(m => !m.ten || m.ten !== m.ten.trim() || /\s\s/.test(m.ten) || m.ten[0] !== m.ten[0].toUpperCase()
    || !m.ngan || m.ngan.length > 16 || !(m.nhom in M.NHOM) || !m.bua || !/^[STCOK]+$/.test(m.bua) || new Set(m.bua).size !== m.bua.length
    || !/^[ncmtdg]*$/.test(m.dau) || !/^([bhgvcs]+|\*)?$/.test(m.dam) || ![1, 2, 3].includes(m.gia) || !['', 'B', 'T', 'N', 'Q'].includes(m.vung)
    || ![1, 2, 3].includes(m.pho) || m.mota.length < 20 || m.mota.length > 90);
  ok('mỗi món ăn ngoài đúng khuôn: tên, tên ngắn ≤ 16 chữ, nhóm, bữa, dấu, đạm, giá, vùng, độ phổ biến, mô tả 20–90 chữ', !sai.length, sai.map(m => m.id).join(', '));
  ok('món có thịt cá thì không đánh dấu chay, món chay thì không có đạm', M.NGOAI.every(m => !(m.chay && m.dam)) && M.NHA.every(m => !(m.chay && m.dam)));
  const saiNha = M.NHA.filter(m => !['man', 'canh', 'rau'].includes(m.loai) || !(m.phut >= 5 && m.phut <= 120)
    || !['kho', 'xao', 'chien', 'luoc', 'hap', 'sot', 'nuong', 'chua', 'thanh', 'dang'].includes(m.vi) || !m.can.length
    || (m.loai !== 'man' && !m.chinh.length) || !/^([bhgvcs]+)?$/.test(m.dam));
  ok('mỗi món nấu ở nhà đúng khuôn: loại, phút, cách nấu, thứ cần mua; canh và rau có nguyên liệu chính', !saiNha.length, saiNha.map(m => m.id).join(', '));
  for (const b of M.BUA) {
    const ds = M.NGOAI.filter(m => m.bua.includes(b)), chay = ds.filter(m => m.chay).length;
    ok(`bữa ${M.TEN_BUA[b]}: ${ds.length} món, ${chay} món chay — đủ cho vòng tám món, chay có ít nhất ${b === 'K' || b === 'C' ? 2 : 4}`,
       ds.length - chay >= 20 && chay >= (b === 'K' || b === 'C' ? 2 : 4));
  }
  for (const l of ['man', 'canh', 'rau']) {
    const ds = M.NHA.filter(m => m.loai === l);
    const chay = ds.filter(m => m.chay), nhanh = ds.filter(m => m.phut <= 30), ca = chay.filter(m => m.phut <= 30);
    ok(`${M.LOAI_NHA[l]}: ${ds.length} món, ${chay.length} chay, ${nhanh.length} nấu nhanh, ${ca.length} vừa chay vừa nhanh`,
       ds.length >= 10 && chay.length >= 3 && nhanh.length >= 5 && ca.length >= 3);
  }
  ok('cặp kinh điển trỏ đúng món mặn và món canh có thật', M.CAP.every(([a, b, c]) => {
    const x = M.NHA.find(m => m.id === a), y = M.NHA.find(m => m.id === b);
    return x && y && x.loai === 'man' && y.loai === 'canh' && c.length > 30;
  }));
  ok('món tên có chữ "chay" thì đúng là món chay', [...M.NGOAI, ...M.NHA].every(m => !/(^|\s)chay(\s|$)/i.test(m.ten) || m.chay));
  ok('mâm thường (không chay) vẫn đủ món: mặn, canh, rau mỗi loại từ 8 món', ['man', 'canh', 'rau'].every(l => M.NHA.filter(m => m.loai === l && M.hopNha(m, {})).length >= 8));
}

/* ======================================================================================================== */
console.log('\n— Hoàn cảnh: bữa, ngày âm, thời tiết, miền, món mới ăn —');
{
  const luc = (h, p) => new Date(2026, 9, 16, h, p);
  const bang = [[3, 59, 'K'], [4, 0, 'S'], [9, 59, 'S'], [10, 0, 'T'], [12, 0, 'T'], [13, 59, 'T'], [14, 0, 'C'], [16, 59, 'C'],
                [17, 0, 'O'], [20, 59, 'O'], [21, 0, 'K'], [0, 30, 'K']];
  const lech = bang.filter(([h, p, b]) => M.buaLuc(luc(h, p)) !== b);
  ok('bữa theo giờ: sáng 4–10 giờ, trưa 10–14, chiều 14–17, tối 17–21, khuya 21–4', !lech.length, lech.map(x => x.join(':')).join(', '));
  ok('câu hỏi theo bữa và thẻ', M.cauHoi('T', 'ngoai') === 'Trưa nay ăn gì?' && M.cauHoi('O', 'nha') === 'Tối nay nấu gì?'
     && M.cauHoi('K', 'ngoai') === 'Khuya rồi, ăn gì?' && M.cauHoi('S', 'ngoai') === 'Sáng nay ăn gì?' && M.cauHoi('C', 'ngoai') === 'Chiều nay ăn gì?');
  ok('ở nhà thì hỏi bữa chính kế tiếp: sáng hỏi trưa, chiều hỏi tối, khuya hỏi mai',
     M.cauHoi('S', 'nha') === 'Trưa nay nấu gì?' && M.cauHoi('T', 'nha') === 'Trưa nay nấu gì?' && M.cauHoi('C', 'nha') === 'Tối nay nấu gì?'
     && M.cauHoi('K', 'nha') === 'Mai nấu gì?');
  const c = (d, m, y) => { const r = M.ngayChay(d, m, y, L); return r ? r.ten : null; };
  ok('mùng 1 và rằm theo lịch âm của Xem ngày: 10/10/2026 mùng 1 tháng 9, 24/10/2026 rằm tháng 9, 16/10/2026 không phải',
     c(10, 10, 2026) === 'Mùng 1 tháng 9' && c(24, 10, 2026) === 'Rằm tháng 9' && c(16, 10, 2026) === null, `${c(10, 10, 2026)} / ${c(24, 10, 2026)}`);
  ok('Tết 2026 (17/2) là mùng 1 tháng Giêng, 3/3/2026 là rằm tháng Giêng, 23/6/2028 là mùng 1 tháng 5 nhuận',
     c(17, 2, 2026) === 'Mùng 1 tháng Giêng' && c(3, 3, 2026) === 'Rằm tháng Giêng' && c(23, 6, 2028) === 'Mùng 1 tháng 5 nhuận', c(23, 6, 2028));
  ok('không có lịch âm thì không đoán ngày chay', M.ngayChay(24, 10, 2026, null) === null);
  const tt = (o) => { const r = M.docThoiTiet(o === undefined ? undefined : { current: o }); return r ? `${r.loai}|${r.nhiet}` : null; };
  ok('trời mưa: có lượng mưa, hay mã WMO mưa phùn, mưa, mưa rào, dông',
     tt({ temperature_2m: 26.4, apparent_temperature: 29, precipitation: 1.2, weather_code: 63 }) === 'mua|26'
     && tt({ temperature_2m: 27, precipitation: 0, weather_code: 61 }) === 'mua|27' && tt({ temperature_2m: 27, precipitation: 0, weather_code: 81 }) === 'mua|27'
     && tt({ temperature_2m: 30, precipitation: 0, weather_code: 95 }) === 'mua|30' && tt({ temperature_2m: 29, precipitation: 0, weather_code: 51 }) === 'mua|29');
  ok('nắng nóng: nhiệt độ từ 33, hay cảm giác từ 34; lạnh: từ 20 độ trở xuống; còn lại bình thường',
     tt({ temperature_2m: 33.2, apparent_temperature: 31, precipitation: 0, weather_code: 1 }) === 'nong|33'
     && tt({ temperature_2m: 31, apparent_temperature: 35.5, precipitation: 0, weather_code: 0 }) === 'nong|31'
     && tt({ temperature_2m: 18, apparent_temperature: 16, precipitation: 0, weather_code: 3 }) === 'lanh|18'
     && tt({ temperature_2m: 27, apparent_temperature: 29, precipitation: 0, weather_code: 2 }) === '|27');
  ok('dữ liệu thời tiết lạ thì trả rỗng, không đoán', tt(undefined) === null && M.docThoiTiet(null) === null && M.docThoiTiet({}) === null
     && tt({ temperature_2m: '27' }) === null && tt({ temperature_2m: NaN }) === null);
  const mien = [[21.03, 105.85, 'B', 'Hà Nội'], [19.81, 105.78, 'B', 'Thanh Hoá'], [18.68, 105.68, 'T', 'Vinh'], [16.46, 107.59, 'T', 'Huế'],
                [16.05, 108.2, 'T', 'Đà Nẵng'], [12.24, 109.19, 'T', 'Nha Trang'], [11.94, 108.44, 'T', 'Đà Lạt'], [10.82, 106.63, 'N', 'TP.HCM'],
                [10.03, 105.78, 'N', 'Cần Thơ'], [10.22, 103.96, 'N', 'Phú Quốc'], [48.85, 2.35, '', 'Paris'], [13.75, 100.5, '', 'Bangkok']];
  const saiMien = mien.filter(([vi, kinh, m]) => M.mienTheoViTri(vi, kinh) !== m);
  ok('miền theo toạ độ (ngoài Việt Nam thì không đoán)', !saiMien.length && M.mienTheoViTri('21', 105) === '', saiMien.map(x => x[3]).join(', '));
  const chot = [{ id: 'a', ngay: '2026-10-16' }, { id: 'b', ngay: '2026-10-15' }, { id: 'c', ngay: '2026-10-14' }, { id: 'd', ngay: '2026-10-13' }, { id: 'e', ngay: '2026-10-17' }];
  const g = M.monGanDay(chot, '2026-10-16');
  ok('món đã chốt hôm nay, hôm qua, hôm kia thì né; ba hôm trước, ngày tương lai thì không', g.get('a') === 0 && g.get('b') === 1 && g.get('c') === 2 && !g.has('d') && !g.has('e'));
  ok('tính ngày qua ranh giới tháng, năm', M.monGanDay([{ id: 'x', ngay: '2026-10-31' }], '2026-11-01').get('x') === 1
     && M.monGanDay([{ id: 'y', ngay: '2026-12-31' }], '2027-01-02').get('y') === 2);
  const gon = M.gonChot([{ id: 'a', ngay: '2026-10-10' }, { id: 'a', ngay: '2026-10-15' }, { id: 'b', ngay: '2026-10-01' }, { id: 'c', ngay: 'hôm qua' },
                         null, { ngay: '2026-10-16' }, ...Array.from({ length: 20 }, (_, i) => ({ id: 'n' + i, ngay: '2026-10-16' }))], '2026-10-16');
  ok('danh sách chốt tự gọn: bỏ món quá 7 ngày, ngày sai khuôn, mỗi món giữ lần mới nhất, nhiều nhất 12 món',
     gon.length === 12 && !gon.some(x => x.id === 'b' || x.id === 'c') && gon.every(x => x && x.id));
  const gon2 = M.gonChot([{ id: 'a', ngay: '2026-10-10' }, { id: 'a', ngay: '2026-10-15' }], '2026-10-16');
  ok('món chốt hai lần thì giữ lần mới nhất', gon2.length === 1 && gon2[0].ngay === '2026-10-15');
}

/* ======================================================================================================== */
console.log('\n— Chọn tám món cho vòng quay —');
{
  const rnd = hat(7);
  const hop = (m, dk) => m.bua.includes(dk.bua) && (!dk.chay || m.chay) && m.gia <= (dk.tui || 3)
    && (dk.khong || []).every(k => (k === 'cay' ? !m.dau.includes('c') : k === 'mo' ? !m.dau.includes('d') : !m.dam.includes(k)));
  let saiLoc = 0, thieu = 0, trung = 0;
  const KHONG = ['b', 'h', 'g', 'v', 'c', 's', 'cay', 'mo'];
  for (let i = 0; i < 600; i++) {
    const dk = { bua: M.BUA[i % 5], chay: i % 11 === 0, tui: 1 + (i % 3), khong: KHONG.filter(() => rnd() < 0.18) };
    const r = M.vongNgoai(M.NGOAI, dk, 8, rnd);
    const ung = M.NGOAI.filter(m => hop(m, dk)).length;
    if (!r.noi.length && r.mon.some(m => !hop(m, dk))) saiLoc++;
    if (r.mon.length !== Math.min(8, Math.max(ung, r.du))) thieu++;
    if (new Set(r.mon.map(m => m.id)).size !== r.mon.length) trung++;
  }
  ok('600 bộ lọc ngẫu nhiên: món nào lên vòng cũng đúng bữa, chay, túi tiền, không ăn (khi không phải nới)', saiLoc === 0, `${saiLoc} lần sai`);
  ok('đủ tám món khi có đủ món hợp lọc, không món nào lên hai lần', thieu === 0 && trung === 0, `${thieu} lần thiếu, ${trung} lần trùng`);
  let quaBa = 0, nhom = 0;
  for (let i = 0; i < 400; i++) {
    const r = M.vongNgoai(M.NGOAI, { bua: 'T' }, 8, rnd), dem = {};
    for (const m of r.mon) dem[m.nhom] = (dem[m.nhom] || 0) + 1;
    if (Math.max(...Object.values(dem)) > 3) quaBa++;
    nhom += Object.keys(dem).length;
  }
  ok(`đa dạng: không nhóm nào quá ba món, trung bình ${(nhom / 400).toFixed(1)} nhóm trong tám món (buổi trưa có sáu nhóm)`, quaBa === 0 && nhom / 400 >= 4.5, `${quaBa} vòng quá ba`);
  const dem = (dk, n, loc) => { let k = 0; for (let i = 0; i < n; i++) k += M.vongNgoai(M.NGOAI, dk, 8, rnd).mon.filter(loc).length; return k / n; };
  const pho = dem({ bua: 'S' }, 3000, m => m.id === 'pho-bo'), thang = dem({ bua: 'S' }, 3000, m => m.id === 'bun-thang');
  ok(`món phổ biến lên vòng nhiều hơn: phở bò ${(pho * 100).toFixed(0)}% số vòng sáng, bún thang ${(thang * 100).toFixed(0)}%`, pho > 2 * thang);
  const mNong = (m) => m.dau.includes('m'), mMat = (m) => m.dau.includes('t');
  const thuong = dem({ bua: 'T' }, 2000, mNong), mua = dem({ bua: 'T', troi: 'mua' }, 2000, mNong);
  ok(`trời mưa thì món nóng hổi nhiều hơn: ${thuong.toFixed(2)} → ${mua.toFixed(2)} món mỗi vòng`, mua - thuong >= 0.7);
  const thuong2 = dem({ bua: 'T' }, 2000, mMat), nong = dem({ bua: 'T', troi: 'nong' }, 2000, mMat);
  ok(`nắng nóng thì món mát nhiều hơn: ${thuong2.toFixed(2)} → ${nong.toFixed(2)} món mỗi vòng`, nong - thuong2 >= 0.5);
  const bac = (m) => m.vung === 'B', khap = dem({ bua: 'T' }, 2000, bac), nam = dem({ bua: 'T', mien: 'N' }, 2000, bac);
  ok(`ở miền Nam thì món gốc miền Bắc ít hơn mà vẫn có: ${khap.toFixed(2)} → ${nam.toFixed(2)} món mỗi vòng`, nam < khap * 0.8 && nam > 0.4);
  const lau = (m) => m.dau.includes('g');
  const trua = dem({ bua: 'T' }, 2000, lau), toiNhom = dem({ bua: 'O', nhom: true }, 2000, lau);
  ok(`lẩu, ốc, đồ nướng: trưa đi làm ít khi (${trua.toFixed(2)}), tối đi nhóm thì nhiều (${toiNhom.toFixed(2)})`, toiNhom > 2 * trua);
  const chayThuong = dem({ bua: 'T' }, 2000, m => M.banChay(m));
  ok(`không ăn chay thì bản chay hiếm khi lên vòng (${chayThuong.toFixed(2)} món mỗi vòng)`, chayThuong < 0.5);
  let co = 0;
  for (let i = 0; i < 500; i++) if (M.vongNgoai(M.NGOAI, { bua: 'T', ganDay: new Set(['com-tam', 'pho-bo']) }, 8, rnd).mon.some(m => m.id === 'com-tam' || m.id === 'pho-bo')) co++;
  ok('món mới chốt mấy hôm nay không lên vòng (500 vòng)', co === 0, `${co} lần`);
  const r1 = M.vongNgoai(M.NGOAI, { bua: 'K', chay: true, ganDay: new Set(['che']) }, 8, rnd);
  ok('lọc chặt quá (khuya, chay, đã ăn chè): nới phần né món cũ và nói ra', r1.mon.length === 2 && r1.noi.some(x => x.ma === 'ne'), r1.noi.map(x => x.loi).join(', '));
  const r2 = M.vongNgoai(M.NGOAI, { bua: 'K', chay: true, tui: 1, khong: ['mo'] }, 8, rnd);
  ok('nới dần đúng thứ tự: món mới ăn, túi tiền, dầu mỡ, cay — chỉ ghi những lần nới có ích', r2.mon.length === 2 && r2.noi.length === 1 && r2.noi[0].ma === 'mo');
  const r3 = M.vongNgoai(M.NGOAI, { bua: 'K', chay: true, khong: ['b', 'h', 'g', 'v', 'c', 's', 'cay', 'mo'] }, 8, rnd);
  ok('không bao giờ nới chay', r3.mon.every(m => m.chay) && r3.mon.length >= 1);
  const a = M.vongNgoai(M.NGOAI, { bua: 'O' }, 8, hat(42)).mon.map(m => m.id).join(), b = M.vongNgoai(M.NGOAI, { bua: 'O' }, 8, hat(42)).mon.map(m => m.id).join();
  ok('cùng hạt giống thì cùng một vòng', a === b);
  const dangCo = M.vongNgoai(M.NGOAI, { bua: 'T' }, 8, rnd).mon.map(m => m.id);
  const thay = M.monThay(M.NGOAI, { bua: 'T' }, dangCo, rnd);
  ok('đổi một món: ra món hợp lọc mà chưa có trên vòng', thay && !dangCo.includes(thay.id) && thay.bua.includes('T'));
  ok('hết món để đổi thì trả rỗng', M.monThay(M.NGOAI, { bua: 'K', chay: true }, ['che', 'mi-xao-chay'], rnd) === null);
}

/* ======================================================================================================== */
console.log('\n— Vòng quay —');
{
  const V = M.VONG, eps = 1e-9;
  const m8 = M.cacMieng(Array(8).fill(1)), m3 = M.cacMieng([1, 2, 1]);
  ok('chia miếng theo trọng số; miếng cuối khép đúng 2π', m8.every((x, i) => Math.abs(x.dau - i * V / 8) < eps && Math.abs(x.cuoi - (i + 1) * V / 8) < eps)
     && Math.abs(m3[1].cuoi - m3[1].dau - V / 2) < eps && m3[2].cuoi === V);
  ok('kim ở đỉnh: bánh xe quay góc θ thì kim chỉ vào chỗ (−θ) của bánh xe',
     M.miengDuoiKim(m8, 0) === 0 && M.miengDuoiKim(m8, -V / 16) === 0 && M.miengDuoiKim(m8, -(V / 8 + 0.01)) === 1
     && M.miengDuoiKim(m8, 0.01) === 7 && M.miengDuoiKim(m8, 5 * V + V / 16) === 7 && M.miengDuoiKim(m8, 5 * V - V / 16) === 0 && M.miengDuoiKim(m8, -3 * V - 3.5 * V / 8) === 3);
  const ms = M.MA_SAT;
  let lechGoc = 0, lechGio = 0, lechGiua = 0;
  for (const w0 of [5, 12, 20, 28]) {                // tích phân từng bước dω/dt = −a − bω, bước 10 µs
    let w = w0, g = 0, t = 0, giua = null;
    const T = M.thoiGianQuay(w0), dt = 1e-5;
    while (w > 0) {
      const k = (x) => -ms.a - ms.b * x;
      const w2 = w + k(w + k(w) * dt / 2) * dt;          // trung điểm
      g += (w + Math.max(0, w2)) / 2 * dt; w = w2; t += dt;
      if (giua === null && t >= T / 2) giua = g;
    }
    lechGoc = Math.max(lechGoc, Math.abs(g - M.quangDuong(w0)));
    lechGio = Math.max(lechGio, Math.abs(t - T));
    lechGiua = Math.max(lechGiua, Math.abs(giua - M.gocSau(w0, T / 2)));
  }
  ok('lời giải đóng khớp tích phân từng bước: góc dừng, lúc dừng, góc giữa chừng', lechGoc < 1e-3 && lechGio < 1e-3 && lechGiua < 1e-3,
     `lệch ${lechGoc.toExponential(1)} rad, ${lechGio.toExponential(1)} s`);
  let lechNguoc = 0;
  const r = hat(5);
  for (let i = 0; i < 300; i++) { const S = 3 + r() * 70; lechNguoc = Math.max(lechNguoc, Math.abs(M.quangDuong(M.w0ChoQuangDuong(S)) - S)); }
  ok('giải ngược vận tốc đầu cho một góc dừng muốn có', lechNguoc < 1e-8, lechNguoc.toExponential(1));
  ok('góc tăng dần theo thời gian, dừng hẳn ở góc dừng; vận tốc từ ω0 về 0', (() => {
    let truoc = -1;
    for (let t = 0; t <= 6; t += 0.01) { const g = M.gocSau(20, t); if (g < truoc - eps) return false; truoc = g; }
    return Math.abs(M.gocSau(20, 99) - M.quangDuong(20)) < eps && M.vanTocSau(20, 0) === 20 && M.vanTocSau(20, M.thoiGianQuay(20)) < 1e-9;
  })());
  const quay = (w, n, hg) => {
    const rnd = hat(hg), dem = Array(w.length).fill(0);
    let goc = 0, saiO = 0, sat = 0, vong = [9, 0], lau = [9, 0];
    const mieng = M.cacMieng(w);
    for (let i = 0; i < n; i++) {
      const cu = M.cuQuay(w, goc, rnd);
      dem[cu.chiSo]++;
      if (M.miengDuoiKim(mieng, cu.gocCuoi) !== cu.chiSo) saiO++;
      const p = M.quyGoc(-cu.gocCuoi), { dau, cuoi } = mieng[cu.chiSo];
      if ((p - dau) / (cuoi - dau) < 0.149 || (p - dau) / (cuoi - dau) > 0.851) sat++;
      vong = [Math.min(vong[0], cu.quangDuong / V), Math.max(vong[1], cu.quangDuong / V)];
      lau = [Math.min(lau[0], cu.thoiGian), Math.max(lau[1], cu.thoiGian)];
      goc = M.quyGoc(cu.gocCuoi);
    }
    return { tile: dem.map(d => d / n), saiO, sat, vong, lau };
  };
  const q8 = quay(Array(8).fill(1), 40000, 11), lech8 = Math.max(...q8.tile.map(p => Math.abs(p - 1 / 8)));
  ok(`công bằng: 40.000 lượt quay tám món đều, mỗi món ra 12,5% ± ${(lech8 * 100).toFixed(2)}%`, lech8 < 0.01, q8.tile.map(p => (p * 100).toFixed(1)).join(' '));
  ok('kim dừng đúng miếng đã rút, không bao giờ dừng sát mép miếng', q8.saiO === 0 && q8.sat === 0, `${q8.saiO} sai miếng, ${q8.sat} sát mép`);
  ok(`mỗi cú quay ${q8.vong[0].toFixed(1)}–${q8.vong[1].toFixed(1)} vòng, mất ${q8.lau[0].toFixed(1)}–${q8.lau[1].toFixed(1)} giây`,
     q8.vong[0] >= 3 && q8.vong[1] <= 6 && q8.lau[0] >= 3.4 && q8.lau[1] <= 5.5);
  const w = [1, 4, 1, 2], qw = quay(w, 40000, 12), lechW = Math.max(...qw.tile.map((p, i) => Math.abs(p - w[i] / 8)));
  ok(`vòng của nhóm: miếng to theo số tim, ra đúng theo diện tích (1:4:1:2 → ${qw.tile.map(p => (p * 100).toFixed(1)).join(', ')}%)`, lechW < 0.01 && qw.saiO === 0);
  const nhanh = M.cuQuay(Array(8).fill(1), 0, hat(3), M.MA_SAT_NHANH, [1, 1]);
  ok(`người chọn giảm chuyển động: dừng sau ${nhanh.thoiGian.toFixed(2)} giây`, nhanh.thoiGian < 1.6 && M.miengDuoiKim(m8, nhanh.gocCuoi) === nhanh.chiSo);
  const rv = hat(9), demV = Array(8).fill(0);
  let saiV = 0, nguoc = 0;
  for (let i = 0; i < 20000; i++) {
    const cu = M.cuVuot(i % 2 ? 15 : -15, 0, Array(8).fill(1), rv);
    demV[cu.chiSo]++;
    if (M.miengDuoiKim(m8, cu.gocCuoi) !== cu.chiSo || cu.w0 < 12 * 0.88 - eps || cu.w0 > 28 * 1.12 + eps) saiV++;
    if (cu.huong !== (i % 2 ? 1 : -1)) nguoc++;
  }
  ok(`vuốt tay: đúng chiều vuốt, vật lý thật; vuốt y hệt nhau 20.000 lần vẫn ra đủ tám món (nhiều nhất ${(Math.max(...demV) / 200).toFixed(0)}%)`,
     saiV === 0 && nguoc === 0 && Math.max(...demV) / 20000 < 0.3 && Math.min(...demV) > 0);
  const yeu = M.cuVuot(2, 0, Array(8).fill(1), () => 0.5), manh = M.cuVuot(400, 0, Array(8).fill(1), () => 0.5);
  ok('vuốt nhẹ cũng quay ra hồn, vuốt cực mạnh cũng không quay mãi', yeu.quangDuong / V > 1.5 && manh.thoiGian < 5.5);
}

/* ======================================================================================================== */
console.log('\n— Cả nhóm: tim và gạch —');
{
  const g = M.gopPhieu(8, [{ tim: [0, 1], khong: [2] }, { tim: [1], khong: [] }, { tim: [1, 3], khong: [4] }]);
  ok('món bị ai gạch thì loại; món còn lại miếng to bằng 1 + số tim',
     JSON.stringify(g.con) === '[0,1,3,5,6,7]' && JSON.stringify(g.trongSo) === '[2,4,2,1,1,1]' && g.tim[1] === 3 && g.khong[2] === 1 && !g.hetSach);
  const g2 = M.gopPhieu(3, [{ tim: [1, 1, 1, 9, -1], khong: [2, 2] }]);
  ok('một người tim một món nhiều lần chỉ tính một; chỉ số lạ bỏ qua', g2.tim[1] === 1 && g2.khong[2] === 1 && g2.con.length === 2);
  const g3 = M.gopPhieu(2, [{ tim: [], khong: [0] }, { tim: [], khong: [0, 1] }]);
  ok('món nào cũng bị gạch thì giữ món bị gạch ít nhất', JSON.stringify(g3.con) === '[1]' && g3.hetSach);
  const g4 = M.gopPhieu(5, []);
  ok('chưa ai chọn gì thì cả năm món, miếng đều nhau', g4.con.length === 5 && g4.trongSo.every(x => x === 1));
}

/* ======================================================================================================== */
console.log('\n— Nấu ở nhà: mâm ba món —');
{
  const rnd = hat(21), NHA = M.NHA;
  let saiLoai = 0, trung = 0, saiChay = 0, saiNhanh = 0, saiKhong = 0, banChay = 0;
  for (let i = 0; i < 2000; i++) {
    const dk = { chay: i % 4 === 0, nhanh: i % 3 === 0, khong: i % 5 === 0 ? ['c', 's'] : [] };
    const m = M.chonMam(NHA, dk, {}, {}, rnd);
    if (m.man.loai !== 'man' || m.canh.loai !== 'canh' || m.rau.loai !== 'rau') saiLoai++;
    if (M.trungRau(m.canh, m.rau)) trung++;
    const ba = [m.man, m.canh, m.rau];
    if (dk.chay && ba.some(x => !x.chay)) saiChay++;
    if (dk.nhanh && ba.some(x => x.phut > 30)) saiNhanh++;
    if (dk.khong.length && ba.some(x => /[cs]/.test(x.dam))) saiKhong++;
    if (!dk.chay && ba.some(x => M.banChay(x))) banChay++;
  }
  ok('2000 mâm: đúng một mặn, một canh, một rau', saiLoai === 0);
  ok('canh và rau không bao giờ trùng thứ rau (canh rau củ thì rau không phải rau củ luộc)', trung === 0, `${trung} lần`);
  ok('ăn chay thì cả mâm chay; nấu nhanh thì món nào cũng ≤ 30 phút; không ăn cá, hải sản thì không có', saiChay === 0 && saiNhanh === 0 && saiKhong === 0);
  ok('mâm thường không có "canh chua chay" khi đã có canh chua cá', banChay === 0);
  const ca = NHA.find(m => m.id === 'ca-kho-to'), tom = NHA.find(m => m.id === 'tom-rim');
  let demCap = 0, demTom = 0;
  for (let i = 0; i < 6000; i++) {
    if (M.chonMam(NHA, {}, { man: ca }, {}, rnd).canh.id === 'canh-chua-ca') demCap++;
    if (/s/.test(M.chonMam(NHA, {}, { man: tom }, {}, rnd).canh.dam)) demTom++;
  }
  ok(`khoá cá kho tộ thì canh chua cá ra ${(demCap / 60).toFixed(0)}% số lần (đều tay thì chừng 9%)`, demCap / 6000 > 0.14);
  const deu = M.NHA.filter(m => m.loai === 'canh' && M.hopNha(m, {})), deuTom = deu.filter(m => /s/.test(m.dam)).length / deu.length;
  ok(`tôm rim thì canh nấu tôm, cua, ngao ít hẳn: ${(demTom / 60).toFixed(0)}% (chọn đều tay thì ${(deuTom * 100).toFixed(0)}%)`, demTom / 6000 < deuTom / 2);
  const cu = M.chonMam(NHA, {}, {}, {}, rnd);
  let lap = 0, giu = 0;
  for (let i = 0; i < 500; i++) {
    const m = M.chonMam(NHA, {}, { canh: cu.canh }, cu, rnd);
    if (m.man.id === cu.man.id || m.rau.id === cu.rau.id) lap++;
    if (m.canh !== cu.canh) giu++;
  }
  ok('quay lại: món đang khoá giữ nguyên, món không khoá luôn đổi sang món khác', lap === 0 && giu === 0, `${lap} lần lặp, ${giu} lần mất khoá`);
  const lay = (id) => NHA.find(m => m.id === id);
  ok('nói ra cặp kinh điển, và cặp kho với canh chua',
     M.loiCap({ man: lay('ca-kho-to'), canh: lay('canh-chua-ca') }).startsWith('Cá kho tộ với canh chua')
     && M.loiCap({ man: lay('thit-kho-tieu'), canh: lay('canh-ngao-chua') }) === 'Món kho mặn đi với canh chua cho cân vị.'
     && M.loiCap({ man: lay('trung-chien'), canh: lay('canh-bi-do') }) === '');
  const cho = M.diCho({ man: lay('bo-xao-hanh-tay'), canh: lay('canh-ca-chua-trung'), rau: lay('rau-muong-xao-toi') });
  ok('đi chợ: gộp ba món, mỗi thứ một lần, giữ thứ tự', cho.join(', ') === 'thịt bò thăn, hành tây, cần tây, tỏi, cà chua, trứng gà, hành lá, rau muống', cho.join(', '));
}

/* ======================================================================================================== */
console.log('\n— Nhãn, link tìm quán, món của tôi —');
{
  const u = M.linkTimQuan('Bún bò Huế');
  ok('link tìm quán trên Google Maps, mã hoá đúng tiếng Việt', u.startsWith('https://www.google.com/maps/search/?api=1&query=')
     && decodeURIComponent(u.split('query=')[1]) === 'Bún bò Huế' && !/\s/.test(u));
  const bbh = M.NGOAI.find(m => m.id === 'bun-bo-hue'), goi = M.NGOAI.find(m => m.id === 'goi-cuon');
  const n1 = M.nhanMon(bbh, { troi: 'mua' }), n2 = M.nhanMon(bbh, {}), n3 = M.nhanMon(goi, { troi: 'nong' });
  ok('nhãn món: món nước, cay, giá, miền; lý do hợp trời chỉ khi đúng trời',
     ['Món nước', 'Cay', 'Khoảng 40–80k', 'Món Trung', 'Hợp trời mưa'].every(x => n1.includes(x)) && !n2.includes('Hợp trời mưa')
     && n3.includes('Mát, hợp trời nóng') && n3.includes('Dưới 40k'));
  const r = M.monRieng('  Cơm   gà cô  Ba  ');
  ok('món của tôi: gọn khoảng trắng, mã theo chữ, dài nhất 40 chữ, rỗng thì bỏ',
     r.ten === 'Cơm gà cô Ba' && r.id === 'r:cơm gà cô ba' && r.rieng && M.monRieng('x'.repeat(60)).ten.length === 40 && M.monRieng('   ') === null);
}

/* ======================================================================================================== */
console.log('\n— Giao diện (DOM giả) —');
(async () => {
  const nut = (cls = '') => {
    const o = {
      className: cls, innerHTML: '', textContent: '', style: { setProperty() {} }, children: [], _q: {}, dataset: {}, hidden: false,
      disabled: false, value: '', scrollTop: 0,
      classList: {
        _s: new Set(String(cls).split(' ').filter(Boolean)),
        add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
        toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
      },
      _attr: {}, setAttribute(k, v) { this._attr[k] = String(v); }, getAttribute(k) { return this._attr[k] ?? null; },
      addEventListener() {}, removeEventListener() {}, remove() {}, focus() {}, select() {}, setPointerCapture() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 340, height: 340 }),
      appendChild(c) { o.children.push(c); return c; }, removeChild() {}, contains: () => true, closest: () => null,
      querySelector(sel) { const k = String(sel); return o._q[k] || (o._q[k] = nut(k.replace(/^[.#]/, ''))); },
      querySelectorAll() { return []; },
    };
    return o;
  };
  let kho = {}, hongDoc = false, hongGhi = false;
  global.document = { body: nut('body'), createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
                      execCommand() {} };
  global.self = global; global.window = global;
  global.addEventListener = () => {}; global.removeEventListener = () => {};
  global.localStorage = {
    getItem: (k) => { if (hongDoc) throw new Error('chặn'); return k in kho ? kho[k] : null; },
    setItem: (k, v) => { if (hongGhi) throw new Error('đầy'); kho[k] = String(v); }, removeItem: (k) => { delete kho[k]; },
  };
  let khungCho = null;
  global.requestAnimationFrame = (f) => { khungCho = f; return 1; };
  global.cancelAnimationFrame = () => { khungCho = null; };
  global.matchMedia = () => ({ matches: false });
  let goiFetch = [];
  global.fetch = (u) => { goiFetch.push(u); return Promise.reject(new Error('không mạng')); };
  for (const t of ['lich.js', 'monan.js', 'angi.js']) new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', t), 'utf8'))();
  const A = global.TDTD_ANGI, MM = global.TDTD_MONAN, ss = A._ss();
  const homNay = MM.ngayCua(new Date());

  A.mo();
  const tam = global.document.body.children.find(c => c.className === 'angi');
  ok('mở: dựng khung, vòng có tám món đúng bữa lúc này, tiêu đề là câu hỏi của bữa',
     !!tam && tam.classList.contains('hien') && ss.vong.length === 8 && ss.vong.every(x => x.mon.bua.includes(ss.bua))
     && tam.querySelector('.ag-tieude').textContent === MM.cauHoi(ss.bua, 'ngoai'));
  ok('chưa có nơi ở thì không gọi mạng xin thời tiết', goiFetch.length === 0);

  /* quay tới kết quả: rút cú quay có hạt giống, chạy khung hình đầu và một khung sau lúc dừng */
  const cu = MM.cuQuay(ss.vong.map(x => x.w), ss.goc, hat(77));
  A._quay(cu);
  ok('bấm quay: nút QUAY khoá lại trong lúc quay', !!ss.quay && tam.querySelector('.ag-quay').disabled === true);
  khungCho(1000); khungCho(1000 + cu.thoiGian * 400);
  ok('giữa chừng: vẫn đang quay, chưa có kết quả', !!ss.quay && !ss.kq);
  khungCho(1000 + cu.thoiGian * 1000 + 5);
  ok('dừng: ra đúng món đã rút, hiện bảng kết quả mang tên món', !ss.quay && ss.kq && ss.kq.chiSo === cu.chiSo
     && tam.querySelector('.ag-kq').hidden === false && tam.querySelector('.ag-kq').innerHTML.includes(ss.vong[cu.chiSo].mon.ten.replace(/&/g, '&amp;')));
  ok('quay xong nút QUAY mở lại, góc bánh xe về trong một vòng', tam.querySelector('.ag-quay').disabled === false && ss.goc >= 0 && ss.goc < MM.VONG);
  const daChot = ss.kq.mon;
  A._chot();
  const luu = JSON.parse(kho['tdtd.angi'] || '{}');
  ok('chốt: lưu đúng mã món và ngày hôm nay, bảng kết quả có link tìm quán', (luu.chot || [])[0] && luu.chot[0].id === daChot.id && luu.chot[0].ngay === homNay
     && tam.querySelector('.ag-kq').innerHTML.includes('google.com/maps/search'));
  A._dongKetQua();
  let lai = 0;
  for (let i = 0; i < 40; i++) { A._lapVong(); if (ss.vong.some(x => x.mon.id === daChot.id)) lai++; }
  ok('món vừa chốt không lên lại vòng (40 lần dựng vòng)', lai === 0, `${lai} lần`);
  ok('dòng hoàn cảnh nói đang né món vừa chốt', tam.querySelector('.ag-bc').innerHTML.includes('né '));

  A._lapVong();
  const truoc = ss.vong.map(x => x.mon.id);
  A._doiMieng(0);
  ok('đổi một món: miếng đó thành món khác, chưa có trên vòng', ss.vong.length === 8 && !truoc.includes(ss.vong[0].mon.id));
  A._boMieng(0);
  ok('bỏ một món: vòng còn bảy món', ss.vong.length === 7);
  while (ss.vong.length > 2) A._boMieng(0);
  ok('bỏ tới khi còn hai món thì thôi, vòng cần ít nhất hai món', A._boMieng(0) === false && ss.vong.length === 2);
  A._lam('doi-bo');
  ok('đổi bộ khác: đủ tám món mới', ss.vong.length === 8);

  A._moBang('loc'); A._bamLoc('khong', 'b'); A._bamLoc('khong', 'cay'); A._dongBang();
  const luu2 = JSON.parse(kho['tdtd.angi']);
  ok('lọc không ăn bò, không cay: vòng mới không còn món bò, món cay; lựa chọn được lưu',
     ss.vong.every(x => !x.mon.dam.includes('b') && !x.mon.dau.includes('c')) && luu2.khong.includes('b') && luu2.khong.includes('cay'));
  A._moBang('loc'); A._bamLoc('khong', 'b'); A._bamLoc('khong', 'cay'); A._dongBang();

  A._lam('chay-hom');
  ok('rằm, mùng 1: bấm "Quay món chay" thì cả vòng là món chay', ss.chayHom && ss.vong.length >= 2 && ss.vong.every(x => x.mon.chay));
  A._doiTab('nha');
  ok('chay hôm nay áp cho cả thẻ Nấu ở nhà: mâm cũng chay', ss.mam && ['man', 'canh', 'rau'].every(l => ss.mam[l].chay));
  A._doiTab('ngoai');
  A._lam('chay-hom');
  ok('bấm lại thì về món thường', !ss.chayHom && ss.vong.length === 8);

  /* cả nhóm: ba người, chuyền máy */
  A._moNhom(); A._lam('bat-dau-nhom');
  ok('cả nhóm: mặc định ba người, bắt đầu ở lượt người thứ nhất', ss.nhom.so === 3 && ss.nhom.buoc === 'bau' && ss.nhom.luot === 0);
  A._lam('tim', { i: '1' }); A._lam('gach', { i: '2' }); A._lam('gach', { i: '3' }); A._lam('gach', { i: '4' });
  ok('mỗi người gạch tối đa hai món', ss.nhom.phieu[0].khong.length === 2 && ss.nhom.phieu[0].tim.includes(1));
  A._lam('gach', { i: '1' });
  ok('gạch món đã tim thì bỏ tim (nếu còn quyền gạch)', ss.nhom.phieu[0].tim.includes(1));
  A._lam('xong-luot');
  ok('xong lượt: màn chuyền máy, không lộ phiếu người trước', ss.nhom.buoc === 'chuyen');
  A._lam('nhan-may'); A._lam('tim', { i: '1' }); A._lam('tim', { i: '5' }); A._lam('xong-luot');
  A._lam('nhan-may'); A._lam('tim', { i: '1' }); A._lam('xong-luot');
  ok('người cuối xong: ra bảng kết quả', ss.nhom.buoc === 'kq');
  const monNhom = ss.nhom.mon.slice();
  A._lam('nhom-quay');
  const t1 = ss.vong.find(x => x.mon.id === monNhom[1].id);
  ok('vòng của nhóm: bỏ hai món bị gạch, món được ba tim có miếng gấp bốn', ss.nhomVong === 3 && ss.vong.length === 6
     && !ss.vong.some(x => x.mon.id === monNhom[2].id || x.mon.id === monNhom[3].id) && t1 && t1.w === 4 && t1.tim === 3);
  A._lam('ve-vong-thuong');
  ok('về vòng thường: lại tám món, miếng đều', !ss.nhomVong && ss.vong.length === 8 && ss.vong.every(x => x.w === 1));

  /* nấu ở nhà */
  A._doiTab('nha');
  ok('thẻ Nấu ở nhà: có mâm ba món, tiêu đề hỏi nấu gì', ss.mam && ss.mam.man.loai === 'man' && ss.mam.canh.loai === 'canh' && ss.mam.rau.loai === 'rau'
     && tam.querySelector('.ag-tieude').textContent.endsWith('nấu gì?'));
  const man = ss.mam.man;
  A._lam('khoa-o', { loai: 'man' });
  A._lapMam(false);
  ok('khoá món mặn rồi quay: món mặn giữ nguyên', ss.khoa.man && ss.mam.man === man);
  const chu = A._chuMam();
  ok('gửi cả nhà: đủ ba món và danh sách đi chợ', chu.includes(ss.mam.man.ten) && chu.includes(ss.mam.canh.ten) && chu.includes(ss.mam.rau.ten) && chu.includes('Đi chợ:'));
  A._lam('khoa-o', { loai: 'canh' }); A._lam('khoa-o', { loai: 'rau' });
  const mamKhoa = ss.mam;
  A._lapMam(true);
  ok('khoá cả ba thì không quay, báo mở khoá một món', ss.mam === mamKhoa && tam.querySelector('.ag-bao').textContent.includes('khoá'));
  A._lam('khoa-o', { loai: 'rau' });
  A._lapMam(true);
  ok('quay có hoạt cảnh: hàng không khoá chạy, hàng khoá đứng yên', !!ss.quayMam && ss.quayMam.cuon.length === 1);
  const q = ss.quayMam;
  khungCho(500); khungCho(500 + 5000);
  ok('hoạt cảnh xong thì ra mâm mới, giữ hai món đang khoá', !ss.quayMam && ss.mam === q.moi && ss.mam.man === man && ss.mam.canh === mamKhoa.canh);
  A._doiTab('ngoai');
  A.dong();
  ok('đóng: gỡ lớp hien, mở khoá cuộn trang', !tam.classList.contains('hien') && !global.document.body.classList.contains('khoa-cuon'));

  /* đóng giữa lúc đang quay, mở lại: không treo */
  A.mo();
  const cu2 = MM.cuQuay(ss.vong.map(x => x.w), ss.goc, hat(5));
  A._quay(cu2); khungCho(10);
  A.dong(); A.mo();
  ok('đóng giữa lúc quay rồi mở lại: bánh xe ở chỗ dừng, nút QUAY bấm được', !ss.quay && tam.querySelector('.ag-quay').disabled === false);

  /* kho lưu hỏng */
  kho['tdtd.angi'] = '{hỏng';
  A.dong(); A.mo();
  ok('kho lưu hỏng thì dùng mặc định, vẫn mở được', ss.vong.length === 8 && A._cd().tui === 3);
  kho['tdtd.angi'] = JSON.stringify({ tui: 9, khong: ['x', 'b'], troi: 'bão', soNguoi: 99, rieng: ['', '  Phở Thìn  ', 7], chot: [{ id: 1 }] });
  A.dong(); A.mo();
  const cd = A._cd();
  ok('giá trị lạ trong kho bị gạt: túi tiền, không ăn, trời, số người, món của tôi, món đã chốt',
     cd.tui === 3 && JSON.stringify(cd.khong) === '["b"]' && cd.troi === 'tu' && cd.soNguoi === 12 && JSON.stringify(cd.rieng) === '["Phở Thìn"]' && cd.chot.length === 0);
  hongDoc = true; hongGhi = true;
  let loi = null;
  try { A.dong(); A.mo(); A._lapVong(); const c3 = MM.cuQuay(ss.vong.map(x => x.w), ss.goc, hat(8)); A._quay(c3); khungCho(1); khungCho(1 + c3.thoiGian * 1000 + 1); A._chot(); }
  catch (e) { loi = e.message; }
  ok('trình duyệt chặn kho lưu (ẩn danh): vẫn mở, quay, chốt được', loi === null && ss.kq && ss.kq.daChot, loi || '');
  hongDoc = false; hongGhi = false;

  /* món của tôi */
  kho = { 'tdtd.angi': JSON.stringify({ rieng: ['Cơm gà cô Ba', 'Bún riêu bà Tư', 'Phở cuối hẻm'], chiRieng: true }) };
  A.dong(); A.mo(); A._lapVong();
  ok('chỉ quay món của tôi: vòng toàn món của bạn', ss.vong.length === 3 && ss.vong.every(x => x.mon.rieng));
  kho = { 'tdtd.angi': JSON.stringify({ rieng: ['Cơm gà cô Ba', 'Bún riêu bà Tư', 'Phở cuối hẻm'] }) };
  A.dong(); A.mo(); A._lapVong();
  ok('không bật quay riêng: món của bạn lên vòng hai món, còn lại sáu món gợi ý', ss.vong.length === 8 && ss.vong.filter(x => x.mon.rieng).length === 2);
  A._lam('chay-hom');
  ok('đang chay thì không trộn món của bạn (app không biết "Cơm gà cô Ba" chay hay mặn)', ss.vong.length >= 2 && ss.vong.every(x => x.mon.chay && !x.mon.rieng));
  A._lam('chay-hom');

  /* thời tiết: có nơi ở (chọn trong Bầu trời đêm) thì xin Open-Meteo; trời mưa thì dựng lại vòng nếu chưa đụng tới */
  kho = { 'tdtd.troi.noi': JSON.stringify({ ten: 'Hà Nội', vi: 21.0285, kinh: 105.8542 }) };
  goiFetch = [];
  global.fetch = (u) => { goiFetch.push(u); return Promise.resolve({ ok: true, headers: { get: () => 'application/json; charset=utf-8' },
    json: async () => ({ current: { temperature_2m: 24.6, apparent_temperature: 27, precipitation: 2.1, weather_code: 63 } }) }); };
  A.dong(); A.mo();
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  ok('có nơi ở: xin thời tiết một lần, toạ độ làm tròn hai số lẻ', goiFetch.length === 1 && goiFetch[0].includes('latitude=21.03') && goiFetch[0].includes('longitude=105.85')
     && goiFetch[0].startsWith('https://api.open-meteo.com/v1/forecast?'));
  ok('trời mưa: ghi vào hoàn cảnh, dòng trên vòng nói "trời mưa 25°"', ss.troiTu && ss.troiTu.loai === 'mua' && tam.querySelector('.ag-bc').innerHTML.includes('trời mưa 25°'));
  ok('ở Hà Nội thì đoán là miền Bắc', A._cd().mien === 'tu' && MM.mienTheoViTri(21.0285, 105.8542) === 'B');
  A.dong(); A.mo();
  for (let i = 0; i < 3; i++) await new Promise(r => setImmediate(r));
  ok('mở lại trong vòng 30 phút thì không xin lại', goiFetch.length === 1);
  ss.troiTu = null;
  global.fetch = () => Promise.resolve({ ok: true, headers: { get: () => 'text/html' }, json: async () => { throw new Error('html'); } });
  A.dong(); A.mo();
  for (let i = 0; i < 5; i++) await new Promise(r => setImmediate(r));
  ok('mất mạng (service worker trả trang HTML): bỏ qua, không hỏng', ss.troiTu === null && ss.vong.length === 8);
  A.dong();

  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });

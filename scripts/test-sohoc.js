/* Kiểm thử thần số học: node scripts/test-sohoc.js

   Không tự chấm điểm mình: các ví dụ lấy đúng từ những trang đã công bố lời giải, và các tính chất
   mà phương pháp đòi hỏi (không có số chủ đạo 1, 22/4 chỉ khi tổng đúng bằng 22...). */
const S = require('../assets/sohoc.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Số chủ đạo: ví dụ có lời giải trong nguồn —');
for (const [d, m, y, mong, nguon] of [
  [19, 8, 1991, '11', 'thansohoconline.com'],
  [29, 11, 1994, '9', 'viettopreview.vn'],
  [11, 2, 1985, '9', 'viettopreview.vn'],
]) {
  const r = S.soChuDao(d, m, y);
  ok(`${d}/${m}/${y} → ${mong} (${nguon})`, r.ten === mong, `${r.ten}: ${r.buoc.join(' → ')}`);
}

console.log('\n— Số chủ đạo: đúng luật —');
{
  const r = S.soChuDao(20, 2, 1971);
  ok('tổng các chữ số đúng bằng 22 thì ghi 22/4 (20/2/1971: 2+0+2+1+9+7+1 = 22)', r.ten === '22/4' && r.so === 22);
  ok('tổng 19 giữ là 10, không rút về 1 (19/8/1990: tổng 37 → 10)', S.soChuDao(19, 8, 1990).ten === '10');
  let ngay33 = null;
  for (let y = 1980; y <= 2000 && !ngay33; y++) for (let m = 1; m <= 12 && !ngay33; m++) for (let d = 1; d <= 28 && !ngay33; d++)
    if (S.soChuDao(d, m, y).tong === 33) ngay33 = [d, m, y];
  ok(`tổng 33 rút về 6, không giữ 33 như trường phái phương Tây (${ngay33 && ngay33.join('/')})`,
     ngay33 && S.soChuDao(...ngay33).ten === '6');
  let co1 = 0, ngoai = 0, sai22 = 0, dem = {};
  for (let y = 1920; y <= 2030; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) {
    const r = S.soChuDao(d, m, y);
    dem[r.ten] = (dem[r.ten] || 0) + 1;
    if (r.so === 1) co1++;
    if (!((r.so >= 2 && r.so <= 11) || r.so === 22)) ngoai++;
    if ((r.so === 22) !== (r.tong === 22)) sai22++;
  }
  ok('40.542 ngày từ 1920 tới 2030: không ngày nào ra số chủ đạo 1', co1 === 0);
  ok('mọi ngày đều ra 2–11 hoặc 22/4', ngoai === 0);
  ok('22/4 khi và chỉ khi tổng các chữ số đúng bằng 22', sai22 === 0);
  /* Có trang nói 22/4 "chỉ khoảng 1–2%". Đếm thật trên mọi ngày 1920–2030 thì ra 3,4% — con số
     ước lượng đó không đúng, nên không đem nó ra làm chuẩn kiểm. */
  ok('có đủ các số 10 và 11', dem['10'] > 0 && dem['11'] > 0);
}

console.log('\n— Biểu đồ ngày sinh và mũi tên —');
{
  const dem = S.bieuDo(20, 2, 1971);
  ok('số 0 không vào lưới; 20/2/1971 có hai số 1, hai số 2, một số 7, một số 9',
     dem[1] === 2 && dem[2] === 2 && dem[7] === 1 && dem[9] === 1 && dem.slice(3, 7).every(x => x === 0) && dem[8] === 0);
  const mt = S.muiTen(dem);
  ok('20/2/1971: trống cả 4-5-6 là mũi tên Uất giận, không có mũi tên đầy', mt.trong.map(m => m.trong).join() === 'Uất giận' && !mt.day.length);
  const mt2 = S.muiTen(S.bieuDo(15, 9, 1987));      // 1,5,9,1,9,8,7 → đủ 1-5-9 và 7-8-9
  ok('15/9/1987: đầy 1-5-9 (Quyết tâm) và 7-8-9 (Hoạt động)',
     mt2.day.some(m => m.day === 'Quyết tâm') && mt2.day.some(m => m.day === 'Hoạt động'), mt2.day.map(m => m.day).join(', '));
  let co123 = 0;
  for (let y = 1920; y <= 2030; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++)
    if (S.muiTen(S.bieuDo(d, m, y)).trong.some(x => x.so.join() === '1,2,3')) co123++;
  ok('không bao giờ có mũi tên trống 1-2-3 (năm sinh luôn có số 1 hoặc 2)', co123 === 0);
  ok('đủ 8 mũi tên đầy, 7 mũi tên trống có tên', S.MUI_TEN.length === 8 && S.MUI_TEN.filter(m => m.trong).length === 7);
}

console.log('\n— Năm cá nhân: ví dụ có lời giải trong nguồn —');
{
  const r = [2022, 2023, 2024, 2025, 2026].map(n => S.namCaNhan(31, 1, n).so);
  ok('sinh 31/1: năm 2022–2026 là 2, 3, 4, 5, 6 (tracuuthansohoc.com)', r.join() === '2,3,4,5,6', r.join());
  const f = [2018, 2019, 2020].map(n => S.namCaNhan(27, 2, n).so);
  ok('sinh 27/2: năm 2018 là 4, 2019 là 5, 2020 là 6 (arena.fpt.edu.vn)', f.join() === '4,5,6', f.join());
  ok('năm cá nhân chỉ dùng ngày và tháng sinh, không dùng năm sinh', S.namCaNhan(31, 1, 2026).so === 6);
  let ngoai = 0;
  for (let n = 2000; n < 2040; n++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) { const x = S.namCaNhan(d, m, n).so; if (x < 1 || x > 9) ngoai++; }
  ok('luôn từ 1 tới 9 (chu kỳ 9 năm)', ngoai === 0);
}

console.log('\n— Bốn đỉnh cao —');
{
  const a = S.dinhCao(1, 5, 1974);
  ok('1/5/1974: chân là tháng 5, ngày 1, năm 3 (1+9+7+4 = 21 → 3) — như ví dụ của thansohoconline.com',
     a.chan.thang === 5 && a.chan.ngay === 1 && a.chan.nam === 3);
  ok('đỉnh 6, 4, 10, 8: đỉnh 3 giữ nguyên 10 như luật hai đỉnh cuối', a.dinh.map(d => d.so).join() === '6,4,10,8', a.dinh.map(d => d.so).join());
  ok('số chủ đạo 9 thì đỉnh đầu ở 27 tuổi, rồi 36, 45, 54', a.dinh.map(d => d.tuoi).join() === '27,36,45,54');
  const b = S.dinhCao(10, 5, 2001);
  ok('10/5/2001: ngày 10 rút về 1, chân 5 · 1 · 3 — như ví dụ của vietnamworks.com', b.chan.ngay === 1 && b.chan.nam === 3);
  const c = S.dinhCao(19, 8, 1991);                // số chủ đạo 11
  ok('số chủ đạo 11 thì đỉnh đầu ở 25 tuổi, rồi 34, 43, 52 (tracuuthansohoc.com, tinhte.vn)', c.dinh.map(d => d.tuoi).join() === '25,34,43,52');
  ok('22/4: đánh dấu chỗ các nguồn chưa nói rõ', S.dinhCao(20, 2, 1971).chuaRo22 === true && !c.chuaRo22);
  let sai = 0;
  for (let y = 1950; y <= 2020; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) {
    const x = S.dinhCao(d, m, y).dinh;
    if (!(x[0].so <= 9 && x[1].so <= 9 && x[2].so <= 11 && x[3].so <= 11 && x.every(v => v.so >= 1))) sai++;
  }
  ok('đỉnh 1, 2 luôn một chữ số; đỉnh 3, 4 không quá 11', sai === 0);
}

console.log('\n— Theo họ tên —');
{
  const t = S.chiSoTen('Nguyễn Thị Hòa');
  ok('Nguyễn Thị Hòa: linh hồn 6, nhân cách 6, sứ mệnh 3 — tên 8, 9, 7 như ví dụ của trathanso.com',
     t.linhHon.so === 6 && t.nhanCach.so === 6 && t.suMenh.so === 3, `${t.linhHon.so} ${t.nhanCach.so} ${t.suMenh.so}`);
  ok('cộng cả tên rồi mới rút gọn: nguyên âm 3 + 5 + 9 + 6 + 1 = 24 → 6', t.linhHon.tong === 24);
  const n = S.chiSoTen('Nguyên');
  ok('Nguyên: nguyên âm U + E = 3 + 5 = 8, phụ âm N G Y N = 24 → 6 (tracuuthansohoc.net)',
     n.linhHon.so === 8 && n.nhanCach.tong === 24 && n.nhanCach.so === 6);
  ok('Đ đổi thành D (4), bỏ dấu: "Đỗ" ra D O', S.chiSoTen('Đỗ').tu[0].chu.map(x => x.c + x.so).join(' ') === 'D4 O6');
  const y = (tu) => S.tachChu(S.tachTu(tu)[0]).find(x => x.c === 'Y').nguyenAm;
  ok('chữ Y đứng riêng hay sát phụ âm là nguyên âm: Mỹ, Ý, Vy, Thy',
     ['Mỹ', 'Ý', 'Vy', 'Thy'].every(y), ['Mỹ', 'Ý', 'Vy', 'Thy'].map(y).join());
  const phuAm = ['Yến', 'Duyên', 'Huy', 'Nguyễn', 'Thủy', 'Quỳnh'];
  ok('chữ Y sát một nguyên âm là phụ âm: ' + phuAm.join(', '), phuAm.every(w => !y(w)), phuAm.map(y).join());
  ok('Tuấn: sứ mệnh 2 + 3 + 1 + 5 = 11, giữ nguyên 11', S.chiSoTen('Tuấn').suMenh.so === 11);
  ok('Hương: sứ mệnh 29 → 11, dừng ở 11 chứ không rút tiếp về 2', S.chiSoTen('Hương').suMenh.so === 11);
  const h = S.chiSoTen('Hạnh').suMenh;
  ok('Hạnh: sứ mệnh 8 + 1 + 5 + 8 = 22, ghi 22/4', h.so === 22 && h.ten === '22/4');
  ok('không có nguyên âm nào thì báo, không bịa ra số', S.chiSoTen('Nhg').linhHon.co === false);
  ok('không đọc được chữ nào thì trả rỗng', S.chiSoTen('123 !!').tu.length === 0);
  ok('biểu đồ tên "Phong": P 7, H 8, O 6, N 5, G 7', S.bieuDoTen('Phong').join() === '0,0,0,0,0,1,1,2,1,0');
  ok('biểu đồ tổng hợp cộng từng ô', S.tongHop([0, 1, 2, 0, 0, 0, 0, 0, 0, 1], S.bieuDoTen('Phong')).join() === '0,1,2,0,0,1,1,2,1,1');
  ok('mọi số tên có thể ra đều có lời giảng', [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22].every(k => S.NET[k]));
}

console.log('\n— Ý nghĩa từng ô, và tên bù cho ngày sinh —');
{
  ok('đủ ý nghĩa cho chín ô của lưới', [1, 2, 3, 4, 5, 6, 7, 8, 9].every(k => typeof S.Y_O[k] === 'string' && S.Y_O[k].length > 10));
  /* Người dùng hỏi "1 8 9 là gì, ở đâu ra": tên "Hải" đổi từng chữ ra số H 8, A 1, I 9 — không cộng */
  ok('biểu đồ tên "Hải": đúng ba ô 8 (H), 1 (A), 9 (I)', S.bieuDoTen('Hải').join('') === '0100000011');
  const ngay = S.bieuDo(19, 8, 1991);                    // 1, 9, 8, 1, 9, 9, 1
  ok('ngày sinh 19/8/1991 đã có sẵn 1, 8, 9 nên tên "Hải" không bù thêm ô nào', S.tenBu(ngay, S.bieuDoTen('Hải')).length === 0);
  ok('tên "Phong" (P 7, H 8, O 6, N 5, G 7) bù cho ngày sinh đó ba ô 5, 6, 7', S.tenBu(ngay, S.bieuDoTen('Phong')).join() === '5,6,7');
  const r = S.chiSoTen('Hồ Trung Hải');
  ok('còn ba chỉ số Linh hồn, Nhân cách, Sứ mệnh tính trên CẢ họ tên: 1, 3, 4', r.linhHon.so === 1 && r.nhanCach.so === 3 && r.suMenh.so === 4,
     `${r.linhHon.buoc} | ${r.nhanCach.buoc} | ${r.suMenh.buoc}`);
}

console.log('\n— Lời giảng có đủ —');
ok('mỗi số chủ đạo có tên, thế mạnh và điều nên để ý', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22].every(n => S.Y_CHU_DAO[n] && S.Y_CHU_DAO[n].manh && S.Y_CHU_DAO[n].yeu));
ok('mỗi năm cá nhân 1–9 có lời giảng', [1, 2, 3, 4, 5, 6, 7, 8, 9].every(n => S.Y_NAM[n]));
ok('mỗi số đỉnh cao 1–11 có lời giảng', Array.from({ length: 11 }, (_, i) => i + 1).every(n => S.Y_DINH[n]));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

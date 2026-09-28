/* Xem ngày — hôm nay tốt hay xấu, nên và không nên làm gì, và gợi ý ngày tốt cho một việc.
   Bốn thẻ: Ngày (một ngày, tìm ngày tốt, tuổi), Tháng (lịch cả tháng), Ngày lễ (lễ, mùng 1 và rằm
   sắp tới, thêm vào lịch điện thoại), Đổi ngày (âm ↔ dương, và ngày âm lặp lại hằng năm).

   Mọi phép tính nằm ở assets/lich.js, đã đối chiếu với lịch vạn niên công bố. File này chỉ
   dựng giao diện. Tuổi là tuỳ chọn, chỉ giữ trong máy; không hỏi tên vì lịch vạn niên không
   có luật nào dùng tên người. */
(() => {
'use strict';

const L = () => self.TDTD_LICH;
const SINH_KEY = 'tdtd.lich.sinh';
const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const SO_NGAY_TIM = 60;
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tam, lech = 0, sinh = null, ngaySinh = null;
let the = 'ngay', thangXem = null, locLe = 'le';

try {
  const v = JSON.parse(localStorage.getItem(SINH_KEY) || 'null');
  if (v && v.dd) ngaySinh = v;
} catch (e) {}

/* ---------- ngày ---------- */

function homNay(them = 0) {
  const t = new Date(); t.setHours(12, 0, 0, 0); t.setDate(t.getDate() + them);
  return { dd: t.getDate(), mm: t.getMonth() + 1, yy: t.getFullYear() };
}

/* Giờ bắt đầu tiết tính ra còn sai chừng 5 phút so với các trang lịch, nên làm tròn tới 10 phút
   và nói "khoảng", không ghi tới từng phút cho có vẻ chính xác. */
function gioTron(hhmm) {
  const [h, m] = hhmm.split(':').map(Number), p = Math.round((h * 60 + m) / 10) * 10;
  const gh = Math.floor(p / 60) % 24, gm = p % 60;
  return gm ? `${gh} giờ ${gm}` : `${gh} giờ`;
}

const chuDuong = (r) => `${THU[r.duong.thu]}, ${r.duong.dd}/${r.duong.mm}/${r.duong.yy}`;
const chuAm = (r) => `${r.am.ngay}/${r.am.thang}${r.am.nhuan ? ' nhuận' : ''} âm lịch`;

/* Chữ cổ thì kèm lời giảng nhỏ, cho người đọc bây giờ hiểu. */
function giang(ds) {
  return ds.map(x => {
    const g = L().GIANG[x] || Object.entries(L().GIANG).find(([k]) => x.includes(k))?.[1];
    return g ? `${esc(x)} <i>(${esc(g)})</i>` : esc(x);
  }).join(', ');
}

function capNhatTuoi() {
  sinh = ngaySinh ? L().tuoi(ngaySinh.dd, ngaySinh.mm, ngaySinh.yy) : null;
}

/* ---------- phần 1: một ngày ---------- */

function veNgay() {
  const d = homNay(lech);
  const r = L().xemNgay(d.dd, d.mm, d.yy, sinh);
  const canh = [];
  if (r.tamNuong) canh.push('Ngày Tam nương — dân gian kiêng khai trương, cưới hỏi, động thổ, đi xa.');
  if (r.nguyetKy) canh.push('Ngày Nguyệt kỵ — dân gian kiêng việc lớn và đi xa.');
  if (r.xungTuoi) canh.push(`Ngày ${esc(L().CHI[r.chiNgay])} xung tuổi ${esc(sinh.ten)} của bạn — nên tránh việc quan trọng.`);

  const nhan = lech === 0 ? 'Hôm nay' : lech === 1 ? 'Ngày mai' : lech === -1 ? 'Hôm qua'
    : lech > 0 ? `${lech} ngày nữa` : `${-lech} ngày trước`;

  tam.querySelector('.xn-ngay').innerHTML = `
    <div class="xn-dieu">
      <button class="xn-lui" type="button" aria-label="Ngày trước">‹</button>
      <p class="xn-nhan">${nhan}</p>
      <button class="xn-toi" type="button" aria-label="Ngày sau">›</button>
    </div>
    <p class="xn-duong">${chuDuong(r)} · ${chuAm(r)}</p>
    <p class="xn-cc">Ngày ${esc(r.canChi.ngay)} · tháng ${esc(r.canChi.thang)} · năm ${esc(r.canChi.nam)} · tiết ${esc(r.tiet)}${
      r.tietGio ? ` <span>(bắt đầu hôm nay, khoảng ${gioTron(r.tietGio)})</span>` : ''}</p>
    <div class="xn-phan ${r.hoangDao ? 'tot' : 'xau'}">
      <p class="xn-loai">${r.hoangDao ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'}</p>
      <p class="xn-than">${esc(r.than.ten)}${r.than.khac ? ` <span>(còn gọi ${esc(r.than.khac)})</span>` : ''} — ${esc(r.than.y)}</p>
    </div>
    ${canh.map(c => `<p class="xn-canh">${c}</p>`).join('')}
    <div class="xn-truc">
      <p class="xn-truc-ten">Trực ${esc(r.truc.ten)}${r.truc.khac ? ` <span>(còn gọi ${esc(r.truc.khac)})</span>` : ''}</p>
      <p class="xn-nen"><b>Nên</b> ${giang(r.truc.nen)}</p>
      <p class="xn-kieng"><b>Không nên</b> ${giang(r.truc.kieng)}</p>
    </div>
    <p class="xn-tieu">Giờ hoàng đạo</p>
    <div class="xn-gio">${r.gio.map(g => `<span><b>${esc(g.chi)}</b> ${esc(g.khung)}</span>`).join('')}</div>
    <p class="xn-tieu">Hướng xuất hành</p>
    <p class="xn-huong">Đón Hỷ thần ở hướng <b>${esc(r.huong.hy)}</b> · Tài thần ở hướng <b>${esc(r.huong.tai)}</b></p>
    <p class="xn-huong xn-tranh">${r.huong.hac ? `Tránh hướng <b>${esc(r.huong.hac)}</b> vì gặp Hạc thần`
      : 'Hôm nay Hạc thần "lên trời", không phải tránh hướng nào'}</p>`;

  tam.querySelector('.xn-lui').onclick = () => { lech--; veNgay(); };
  tam.querySelector('.xn-toi').onclick = () => { lech++; veNgay(); };
}

/* ---------- phần 2: bạn muốn làm gì ---------- */

function veChonViec() {
  const o = tam.querySelector('.xn-viec');
  o.innerHTML = L().VIEC.map(v => `<button type="button" data-ma="${v.ma}">${esc(v.ten)}</button>`).join('');
  o.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      const v = L().VIEC.find(x => x.ma === b.dataset.ma);
      tam.querySelector('.xn-hoi').value = v.ten;
      timCho(v);
    };
  });
}

function tim() {
  const cau = tam.querySelector('.xn-hoi').value.trim();
  const kq = tam.querySelector('.xn-kq');
  if (!cau) { kq.innerHTML = '<p class="xn-rong">Gõ việc bạn định làm, hoặc chọn một mục bên dưới.</p>'; return; }
  const v = L().nhanViec(cau);
  if (!v) {
    kq.innerHTML = `<p class="xn-rong">Chưa hiểu "${esc(cau)}" là việc gì. Chọn một mục gần nhất bên dưới nhé.</p>`;
    return;
  }
  timCho(v);
}

function timCho(v) {
  const kq = tam.querySelector('.xn-kq');
  const ds = L().timNgay(v, homNay(0), SO_NGAY_TIM, sinh, 5);
  if (!ds.length) {
    kq.innerHTML = `<p class="xn-rong">Trong ${SO_NGAY_TIM} ngày tới không có ngày nào thật tốt cho việc ${esc(v.ten.toLowerCase())}.</p>`;
    return;
  }
  kq.innerHTML = `
    <p class="xn-tieu">Ngày tốt để ${esc(v.ten.toLowerCase())}, trong ${SO_NGAY_TIM} ngày tới${sinh ? `, hợp tuổi ${esc(sinh.ten)}` : ''}</p>
    ${ds.map((x, i) => `
      <div class="xn-mot${i === 0 ? ' dau' : ''}">
        <p class="xn-mot-ngay">${chuDuong(x.ng)} <span>${x.cach === 0 ? 'hôm nay' : x.cach === 1 ? 'ngày mai' : `còn ${x.cach} ngày`}</span></p>
        <p class="xn-mot-am">${chuAm(x.ng)} · ngày ${esc(x.ng.canChi.ngay)}</p>
        <p class="xn-mot-vi">${x.vi.map(esc).join(' · ')}</p>
        ${x.canh.length ? `<p class="xn-mot-canh">Lưu ý: ${x.canh.map(esc).join(' · ')}</p>` : ''}
        <p class="xn-mot-gio">Giờ tốt: ${x.ng.gio.map(g => `${esc(g.chi)} ${esc(g.khung)}`).join(', ')}</p>
      </div>`).join('')}`;
}

/* ---------- phần 3: tuổi ---------- */

function veTuoi() {
  const o = tam.querySelector('.xn-tuoi');
  if (sinh) {
    o.innerHTML = `
      <p class="xn-tuoi-co">Tuổi <b>${esc(sinh.ten)}</b> (${esc(sinh.con)}) — tránh ngày ${esc(L().CHI[(sinh.chi + 6) % 12])} vì xung tuổi.</p>
      <button class="xn-xoa" type="button">Xoá ngày sinh</button>`;
    o.querySelector('.xn-xoa').onclick = () => {
      ngaySinh = null; capNhatTuoi();
      try { localStorage.removeItem(SINH_KEY); } catch (e) {}
      veTuoi(); veNgay(); tam.querySelector('.xn-kq').innerHTML = '';
    };
    return;
  }
  /* Ba ô chọn và nút Xong, không dùng <input type="date">: bản cũ lưu ngay ở sự kiện change đầu
     tiên, mà trình duyệt điện thoại điền sẵn một ngày ngay khi mở bảng chọn, nên người dùng chưa
     kịp chọn thì app đã lưu và vẽ lại khung. Giờ chỉ lưu khi bấm Xong. */
  const namNay = new Date().getFullYear();
  const chon = (lop, nhan, ds) => `<select class="${lop}" aria-label="${nhan} sinh">
      <option value="">${nhan}</option>${ds.map(n => `<option value="${n}">${n}</option>`).join('')}</select>`;
  const dem = (a, b) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => a < b ? a + i : a - i);
  o.innerHTML = `
    <p class="xn-tuoi-hoi">Nhập ngày sinh để tránh ngày xung tuổi <span>(không bắt buộc)</span></p>
    <div class="xn-chon-sinh">
      ${chon('xn-s-ngay', 'Ngày', dem(1, 31))}
      ${chon('xn-s-thang', 'Tháng', dem(1, 12))}
      ${chon('xn-s-nam', 'Năm', dem(namNay, 1920))}
      <button class="xn-luu" type="button" disabled>Xong</button>
    </div>
    <p class="xn-loi" hidden></p>
    <p class="xn-ghi">Chỉ lưu trong máy này. Tuổi tính theo năm âm, sinh trước Tết thì thuộc năm trước.
      Lịch vạn niên không có luật nào dùng tên người, nên ở đây không hỏi tên.</p>`;
  const [sNgay, sThang, sNam] = ['.xn-s-ngay', '.xn-s-thang', '.xn-s-nam'].map(s => o.querySelector(s));
  const nut = o.querySelector('.xn-luu'), loi = o.querySelector('.xn-loi');
  const doc = () => [+sNgay.value, +sThang.value, +sNam.value];
  [sNgay, sThang, sNam].forEach(s => s.onchange = () => {
    nut.disabled = doc().some(n => !n);
    loi.hidden = true;
  });
  nut.onclick = () => {
    const [dd, mm, yy] = doc();
    if (!dd || !mm || !yy) return;
    const t = new Date(yy, mm - 1, dd);
    if (t.getDate() !== dd) { loi.textContent = `Tháng ${mm}/${yy} không có ngày ${dd}.`; loi.hidden = false; return; }
    if (t > new Date()) { loi.textContent = 'Ngày sinh không thể ở tương lai.'; loi.hidden = false; return; }
    ngaySinh = { dd, mm, yy }; capNhatTuoi();
    try { localStorage.setItem(SINH_KEY, JSON.stringify(ngaySinh)); } catch (e) {}
    veTuoi(); veNgay();
    const cau = tam.querySelector('.xn-hoi').value.trim();
    if (cau && L().nhanViec(cau)) tim();
  };
}

/* ---------- ngày đổi qua lại ---------- */

const TEN_THANG_AM = (m) => L().TEN_THANG[m];
const soNgay = (d) => L().jdFromDate(d.dd, d.mm, d.yy);
const cachHomNay = (d) => soNgay(d) - soNgay(homNay(0));
const conBaoLau = (n) => n === 0 ? 'hôm nay' : n === 1 ? 'ngày mai' : `còn ${n} ngày`;
function xemNgayNay(d) { lech = cachHomNay(d); doiThe('ngay'); veNgay(); tam.querySelector('.xn-trong').scrollTop = 0; }

/* ---------- thẻ Tháng: lịch cả tháng ---------- */

function veThang() {
  const o = tam.querySelector('.xn-thang');
  const nay = homNay(0);
  if (!thangXem) thangXem = { mm: nay.mm, yy: nay.yy };
  const { mm, yy } = thangXem;
  const soNgayThang = new Date(yy, mm, 0).getDate();
  const thuDau = (new Date(yy, mm - 1, 1).getDay() + 6) % 7;          // tuần bắt đầu từ thứ hai
  const le = {};
  for (const e of L().leSapToi({ dd: 1, mm, yy }, soNgayThang)) if (e.loai !== 'ram') (le[e.dd] = le[e.dd] || []).push(e.ten);
  const o1 = L().xemNgay(1, mm, yy), oN = L().xemNgay(soNgayThang, mm, yy);
  const amThang = o1.am.thang === oN.am.thang ? `tháng ${TEN_THANG_AM(o1.am.thang)} âm lịch`
    : `tháng ${TEN_THANG_AM(o1.am.thang)}${o1.am.nhuan ? ' nhuận' : ''} – ${TEN_THANG_AM(oN.am.thang)}${oN.am.nhuan ? ' nhuận' : ''} âm lịch`;
  let o2 = '';
  for (let i = 0; i < thuDau; i++) o2 += '<span class="xn-o-trong"></span>';
  for (let d = 1; d <= soNgayThang; d++) {
    const r = L().xemNgay(d, mm, yy);
    const am = r.am.ngay === 1 ? `${r.am.ngay}/${r.am.thang}${r.am.nhuan ? 'n' : ''}` : r.am.ngay;
    const lop = [r.hoangDao ? 'hd' : 'hk', (r.am.ngay === 1 || r.am.ngay === 15) ? 'ram' : '',
                 le[d] ? 'le' : '', d === nay.dd && mm === nay.mm && yy === nay.yy ? 'nay' : ''].join(' ');
    o2 += `<button class="xn-o-ngay ${lop}" data-d="${d}" type="button"
      aria-label="${d}/${mm}: ${r.hoangDao ? 'hoàng đạo' : 'hắc đạo'}, ${r.am.ngay}/${r.am.thang} âm lịch${le[d] ? ', ' + esc(le[d].join(', ')) : ''}">
      <b>${d}</b><i>${am}</i></button>`;
  }
  o.innerHTML = `
    <div class="xn-dieu">
      <button class="xn-lui" type="button" aria-label="Tháng trước">‹</button>
      <p class="xn-nhan">Tháng ${mm}/${yy}</p>
      <button class="xn-toi" type="button" aria-label="Tháng sau">›</button>
    </div>
    <p class="xn-duong">${amThang} · năm ${esc(o1.canChi.nam)}</p>
    <div class="xn-luoi">
      ${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(t => `<span class="xn-thu">${t}</span>`).join('')}
      ${o2}
    </div>
    <p class="xn-chu-giai"><span class="hd">hoàng đạo</span><span class="hk">hắc đạo</span>
      <span class="ram">mùng 1, rằm</span><span class="le">ngày lễ</span></p>
    ${Object.keys(le).length ? `<div class="xn-le-thang">${Object.entries(le).map(([d, ts]) =>
      `<p><b>${d}/${mm}</b> ${ts.map(esc).join(', ')}</p>`).join('')}</div>` : ''}
    <p class="xn-ghi">Bấm vào một ngày để xem chi tiết.</p>`;
  o.querySelector('.xn-lui').onclick = () => { thangXem = mm === 1 ? { mm: 12, yy: yy - 1 } : { mm: mm - 1, yy }; veThang(); };
  o.querySelector('.xn-toi').onclick = () => { thangXem = mm === 12 ? { mm: 1, yy: yy + 1 } : { mm: mm + 1, yy }; veThang(); };
  o.querySelectorAll('.xn-o-ngay').forEach(b => { b.onclick = () => xemNgayNay({ dd: +b.dataset.d, mm, yy }); });
}

/* ---------- thẻ Ngày lễ, và thêm vào lịch điện thoại ---------- */

/* Tệp .ics theo RFC 5545: mỗi sự kiện là một ngày trọn (không giờ), nhắc lúc 9 giờ sáng hôm trước
   (TRIGGER -PT15H tính từ 0 giờ của ngày đó). Dòng dài quá 75 byte phải gập, mà tiếng Việt thì
   một chữ có dấu chiếm hai ba byte, nên đếm theo byte chứ không đếm theo chữ. */
const escIcs = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function gap(dong) {
  const ma = new TextEncoder();
  let ra = '', hang = '', dai = 0;
  for (const c of dong) {
    const n = ma.encode(c).length;
    if (dai + n > 75) { ra += hang + '\r\n '; hang = ''; dai = 1; }
    hang += c; dai += n;
  }
  return ra + hang;
}
function bamChu(t) { let h = 5381; for (const c of t) h = (h * 33 + c.codePointAt(0)) >>> 0; return h.toString(36); }
function taoIcs(ds) {
  const z = (n) => String(n).padStart(2, '0');
  const ngay = (e) => `${e.yy}${z(e.mm)}${z(e.dd)}`;
  const sau = (e) => { const t = new Date(e.yy, e.mm - 1, e.dd + 1); return `${t.getFullYear()}${z(t.getMonth() + 1)}${z(t.getDate())}`; };
  const dau = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const d = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Thong Diep Cua Thuong De//Xem ngay//VI', 'CALSCALE:GREGORIAN'];
  for (const e of ds) {
    const am = `Ngày ${e.am.ngay}/${e.am.thang}${e.am.nhuan ? ' nhuận' : ''} âm lịch`;
    d.push('BEGIN:VEVENT', `UID:${ngay(e)}-${bamChu(e.ten)}@thong-diep-thuong-de`, `DTSTAMP:${dau}`,
      `DTSTART;VALUE=DATE:${ngay(e)}`, `DTEND;VALUE=DATE:${sau(e)}`, `SUMMARY:${escIcs(e.ten)}`,
      `DESCRIPTION:${escIcs(am)}`, 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escIcs(e.ten)}`, 'TRIGGER:-PT15H', 'END:VALARM',
      'END:VEVENT');
  }
  d.push('END:VCALENDAR');
  return d.map(gap).join('\r\n') + '\r\n';
}

/* Mở tệp lịch cho máy thêm vào ứng dụng Lịch. iPhone mở app từ màn hình chính thì tải tệp là mở
   một trang không có đường quay lại, nên ở đó đưa qua bảng chia sẻ. */
async function moLich(ds, ten) {
  if (!ds.length) return;
  const blob = new Blob([taoIcs(ds)], { type: 'text/calendar;charset=utf-8' });
  const tep = new File([blob], ten, { type: 'text/calendar' });
  if (navigator.standalone && navigator.canShare && navigator.canShare({ files: [tep] })) {
    try { await navigator.share({ files: [tep] }); } catch (e) {}
    return;
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = ten;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function veLe() {
  const o = tam.querySelector('.xn-le');
  const tat = L().leSapToi(homNay(0), 366);
  /* "Mùng 1 và rằm" phải đủ cả những ngày trùng lễ (rằm tháng Giêng, Vu lan, mùng 1 Tết...): người
     cúng mùng 1, rằm cần đủ các ngày đó. Bản đầu chỉ lấy mục loại 'ram' nên rơi mất sáu ngày. */
  const le = tat.filter(e => e.loai !== 'ram');
  const ram = tat.filter(e => e.loai !== 'duong' && (e.am.ngay === 1 || e.am.ngay === 15));
  const ds = locLe === 'ram' ? ram : locLe === 'tat' ? tat : le;
  o.innerHTML = `
    <div class="xn-loc">
      ${[['le', 'Ngày lễ'], ['ram', 'Mùng 1 và rằm'], ['tat', 'Tất cả']].map(([k, t]) =>
        `<button type="button" data-loc="${k}" class="${k === locLe ? 'dang' : ''}">${t}</button>`).join('')}
    </div>
    <div class="xn-ds-le">${ds.slice(0, 40).map((e, i) => `
      <div class="xn-mot-le ${e.loai}">
        <div class="xn-mot-le-chu">
          <p class="xn-mot-le-ten">${esc(e.ten)}</p>
          <p class="xn-mot-le-ngay">${THU[new Date(e.yy, e.mm - 1, e.dd).getDay()]}, ${e.dd}/${e.mm}/${e.yy}
            · ${e.am.ngay}/${e.am.thang}${e.am.nhuan ? ' nhuận' : ''} âm lịch</p>
        </div>
        <span class="xn-mot-le-con">${conBaoLau(e.cach)}</span>
        <button class="xn-them" type="button" data-i="${i}" aria-label="Thêm ${esc(e.ten)} vào lịch điện thoại">＋ Lịch</button>
      </div>`).join('')}</div>
    <div class="xn-them-het">
      <button type="button" data-het="le">Thêm các ngày lễ 12 tháng tới vào lịch</button>
      <button type="button" data-het="ram">Thêm mùng 1 và rằm 12 tháng tới vào lịch</button>
    </div>
    <p class="xn-ghi">Lịch điện thoại sẽ nhắc lúc 9 giờ sáng hôm trước. App không gửi gì đi đâu: tệp lịch được
      tạo ngay trên máy rồi mở bằng ứng dụng Lịch của bạn.</p>`;
  o.querySelectorAll('[data-loc]').forEach(b => { b.onclick = () => { locLe = b.dataset.loc; veLe(); }; });
  o.querySelectorAll('.xn-them').forEach(b => { b.onclick = () => { const e = ds[+b.dataset.i]; moLich([e], `${e.yy}-${e.mm}-${e.dd}.ics`); }; });
  o.querySelectorAll('[data-het]').forEach(b => {
    b.onclick = () => b.dataset.het === 'le' ? moLich(le, 'ngay-le-12-thang.ics') : moLich(ram, 'mung-1-va-ram-12-thang.ics');
  });
}

/* ---------- thẻ Đổi ngày ---------- */

function veDoi() {
  const o = tam.querySelector('.xn-doi');
  const nay = homNay(0), amNay = L().xemNgay(nay.dd, nay.mm, nay.yy).am;
  const chon = (lop, nhan, ds, chonSan, ten = (x) => x) => `<select class="${lop}" aria-label="${nhan}">
      ${ds.map(n => `<option value="${n}"${n === chonSan ? ' selected' : ''}>${ten(n)}</option>`).join('')}</select>`;
  const dem = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  o.innerHTML = `
    <p class="xn-hoi-nhan">Dương lịch sang âm lịch</p>
    <div class="xn-chon-sinh">
      ${chon('xn-d-ngay', 'Ngày dương', dem(1, 31), nay.dd)}
      ${chon('xn-d-thang', 'Tháng dương', dem(1, 12), nay.mm, m => `tháng ${m}`)}
      <input class="xn-d-nam" type="number" inputmode="numeric" min="1900" max="2199" value="${nay.yy}" aria-label="Năm dương">
    </div>
    <div class="xn-doi-kq xn-kq-duong"></div>

    <p class="xn-hoi-nhan xn-cach">Âm lịch sang dương lịch</p>
    <div class="xn-chon-sinh">
      ${chon('xn-a-ngay', 'Ngày âm', dem(1, 30), amNay.ngay)}
      ${chon('xn-a-thang', 'Tháng âm', dem(1, 12), amNay.thang, m => `tháng ${TEN_THANG_AM(m)}`)}
      <input class="xn-a-nam" type="number" inputmode="numeric" min="1900" max="2199" value="${amNay.nam}" aria-label="Năm âm">
    </div>
    <label class="xn-nhuan"><input class="xn-a-nhuan" type="checkbox"> tháng nhuận</label>
    <div class="xn-doi-kq xn-kq-am"></div>`;

  const q = (s2) => o.querySelector(s2);
  const tinhDuong = () => {
    const dd = +q('.xn-d-ngay').value, mm = +q('.xn-d-thang').value, yy = +q('.xn-d-nam').value;
    const kq = q('.xn-kq-duong');
    if (!(yy >= 1900 && yy <= 2199)) { kq.innerHTML = '<p class="xn-rong">Năm phải từ 1900 tới 2199.</p>'; return; }
    if (new Date(yy, mm - 1, dd).getDate() !== dd) { kq.innerHTML = `<p class="xn-rong">Tháng ${mm}/${yy} không có ngày ${dd}.</p>`; return; }
    const r = L().xemNgay(dd, mm, yy);
    kq.innerHTML = `<p class="xn-doi-to">${r.am.ngay}/${r.am.thang}${r.am.nhuan ? ' nhuận' : ''}/${r.am.nam} âm lịch</p>
      <p class="xn-doi-phu">Ngày ${esc(r.canChi.ngay)} · tháng ${esc(r.canChi.thang)} · năm ${esc(r.canChi.nam)} · ${r.hoangDao ? 'hoàng đạo' : 'hắc đạo'}</p>
      <button class="xn-xem" type="button">Xem ngày này</button>`;
    kq.querySelector('.xn-xem').onclick = () => xemNgayNay({ dd, mm, yy });
  };
  const tinhAm = () => {
    const d = +q('.xn-a-ngay').value, m = +q('.xn-a-thang').value, y = +q('.xn-a-nam').value;
    const nhuan = q('.xn-a-nhuan').checked;
    const kq = q('.xn-kq-am');
    if (!(y >= 1900 && y <= 2199)) { kq.innerHTML = '<p class="xn-rong">Năm phải từ 1900 tới 2199.</p>'; return; }
    const tn = L().thangNhuan(y);
    q('.xn-nhuan').classList.toggle('co', tn === m);
    if (nhuan && tn !== m) {
      kq.innerHTML = `<p class="xn-rong">Năm ${y} ${tn ? `chỉ nhuận tháng ${TEN_THANG_AM(tn)}` : 'không có tháng nhuận'}, không có tháng ${TEN_THANG_AM(m)} nhuận.</p>`;
      return;
    }
    const r = L().amSangDuong(d, m, y, nhuan);
    if (!r) {
      kq.innerHTML = `<p class="xn-rong">Tháng ${TEN_THANG_AM(m)}${nhuan ? ' nhuận' : ''} năm ${y} chỉ có 29 ngày, không có ngày 30.</p>`;
      return;
    }
    const namAmNay = amNay.nam;
    const lap = L().amHangNam(d, m, namAmNay, 3);
    kq.innerHTML = `<p class="xn-doi-to">${THU[new Date(r.yy, r.mm - 1, r.dd).getDay()]}, ${r.dd}/${r.mm}/${r.yy}</p>
      <button class="xn-xem" type="button">Xem ngày này</button>
      ${nhuan ? '' : `<p class="xn-tieu">Nếu đây là ngày giỗ hay sinh nhật âm lịch</p>
      <div class="xn-lap">${lap.map(x => `<p><b>${x.dd}/${x.mm}/${x.yy}</b> <span>năm âm ${x.namAm}${
        x.lui ? ` — tháng này thiếu, lấy ngày 29` : ''} · ${conBaoLau(cachHomNay(x))}</span></p>`).join('')}</div>
      <input class="xn-ten-su" type="text" placeholder="Tên, ví dụ: Giỗ ông nội" autocomplete="off" aria-label="Tên sự kiện">
      <button class="xn-them-lap" type="button">Thêm ${lap.length} năm này vào lịch điện thoại</button>`}`;
    kq.querySelector('.xn-xem').onclick = () => xemNgayNay(r);
    const nut = kq.querySelector('.xn-them-lap');
    if (nut) nut.onclick = () => {
      const ten = (kq.querySelector('.xn-ten-su').value || '').trim() || `Ngày ${d}/${m} âm lịch`;
      moLich(lap.filter(x => cachHomNay(x) >= 0).map(x => ({ ...x, ten, am: { ngay: x.lui ? 29 : d, thang: m, nhuan: false } })),
             'ngay-am-hang-nam.ics');
    };
  };
  ['.xn-d-ngay', '.xn-d-thang', '.xn-d-nam'].forEach(k => { q(k).oninput = tinhDuong; q(k).onchange = tinhDuong; });
  ['.xn-a-ngay', '.xn-a-thang', '.xn-a-nam', '.xn-a-nhuan'].forEach(k => { q(k).oninput = tinhAm; q(k).onchange = tinhAm; });
  tinhDuong(); tinhAm();
}

/* ---------- các thẻ ---------- */

function doiThe(ten) {
  the = ten;
  tam.querySelectorAll('.xn-the button').forEach(b => {
    const dang = b.dataset.the === ten;
    b.classList.toggle('dang', dang); b.setAttribute('aria-selected', dang ? 'true' : 'false');
  });
  tam.querySelectorAll('[data-nhom]').forEach(s2 => { s2.hidden = s2.dataset.nhom !== ten; });
  if (ten === 'thang') veThang();
  if (ten === 'le') veLe();
  if (ten === 'doi') veDoi();
}

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'xemngay';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="xn-trong">
      <p class="xn-tieude">Xem ngày</p>
      <div class="xn-the" role="tablist">
        ${[['ngay', 'Ngày'], ['thang', 'Tháng'], ['le', 'Ngày lễ'], ['doi', 'Đổi ngày']].map(([k, t]) =>
          `<button type="button" role="tab" data-the="${k}">${t}</button>`).join('')}
      </div>
      <section class="xn-ngay" data-nhom="ngay"></section>
      <section class="xn-khoi xn-thang" data-nhom="thang" hidden></section>
      <section class="xn-khoi xn-le" data-nhom="le" hidden></section>
      <section class="xn-khoi xn-doi" data-nhom="doi" hidden></section>
      <section class="xn-khoi" data-nhom="ngay">
        <p class="xn-hoi-nhan">Bạn muốn làm gì?</p>
        <div class="xn-o">
          <input class="xn-hoi" type="text" placeholder="ví dụ: khai trương quán, chuyển nhà…" autocomplete="off">
          <button class="xn-tim" type="button">Tìm ngày</button>
        </div>
        <div class="xn-viec"></div>
        <div class="xn-kq"></div>
      </section>
      <section class="xn-khoi xn-tuoi" data-nhom="ngay"></section>
      <p class="xn-nguon">Theo lịch vạn niên dân gian, để tham khảo. Âm lịch theo thuật toán Hồ Ngọc Đức;
        danh sách nên và không nên của từng trực theo lichvannien365.com; hướng xuất hành theo số đông
        của bốn nguồn đối chiếu; ngày lễ âm lịch theo Wikipedia tiếng Việt.</p>
    </div>`;
  document.body.appendChild(tam);
  tam.querySelector('.xn-dong').onclick = dong;
  tam.querySelectorAll('.xn-the button').forEach(b => { b.onclick = () => doiThe(b.dataset.the); });
  tam.querySelector('.xn-tim').onclick = tim;
  tam.querySelector('.xn-hoi').addEventListener('keydown', e => { if (e.key === 'Enter') tim(); });
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  lech = 0; thangXem = null;
  capNhatTuoi();
  veNgay(); veChonViec(); veTuoi();
  doiThe('ngay');
  tam.querySelector('.xn-trong').scrollTop = 0;
}

function dong() {
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && tam && tam.classList.contains('hien') && !['INPUT', 'SELECT'].includes(document.activeElement?.tagName)) dong();
});

self.TDTD_XEMNGAY = { mo, dong,
  _lech: (n) => { lech = n; veNgay(); return lech; },
  _hoi: (cau) => { tam.querySelector('.xn-hoi').value = cau; tim(); return tam.querySelector('.xn-kq').textContent; },
  _the: (t) => { doiThe(t); return the; },
  _thang: (mm, yy) => { thangXem = { mm, yy }; doiThe('thang'); return tam.querySelector('.xn-thang').textContent; },
  _ics: (ds) => taoIcs(ds),
  _sinh: (dd, mm, yy) => { ngaySinh = dd ? { dd, mm, yy } : null; capNhatTuoi(); veTuoi(); veNgay(); return sinh; },
};
})();

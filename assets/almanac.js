/* Xem ngày — hôm nay tốt hay xấu, nên và không nên làm gì, và gợi ý ngày tốt cho một việc.

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

try {
  const v = JSON.parse(localStorage.getItem(SINH_KEY) || 'null');
  if (v && v.dd) ngaySinh = v;
} catch (e) {}

/* ---------- ngày ---------- */

function homNay(them = 0) {
  const t = new Date(); t.setHours(12, 0, 0, 0); t.setDate(t.getDate() + them);
  return { dd: t.getDate(), mm: t.getMonth() + 1, yy: t.getFullYear() };
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
    <p class="xn-cc">Ngày ${esc(r.canChi.ngay)} · tháng ${esc(r.canChi.thang)} · năm ${esc(r.canChi.nam)} · tiết ${esc(r.tiet)}</p>
    <div class="xn-phan ${r.hoangDao ? 'tot' : 'xau'}">
      <p class="xn-loai">${r.hoangDao ? 'Ngày hoàng đạo' : 'Ngày hắc đạo'}</p>
      <p class="xn-than">${esc(r.than.ten)}${r.than.khac ? ` <span>(còn gọi ${esc(r.than.khac)})</span>` : ''} — ${esc(r.than.y)}</p>
    </div>
    ${canh.map(c => `<p class="xn-canh">${c}</p>`).join('')}
    <div class="xn-truc">
      <p class="xn-truc-ten">Trực ${esc(r.truc.ten)}</p>
      <p class="xn-nen"><b>Nên</b> ${giang(r.truc.nen)}</p>
      <p class="xn-kieng"><b>Không nên</b> ${giang(r.truc.kieng)}</p>
    </div>
    <p class="xn-tieu">Giờ hoàng đạo</p>
    <div class="xn-gio">${r.gio.map(g => `<span><b>${esc(g.chi)}</b> ${esc(g.khung)}</span>`).join('')}</div>`;

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

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'xemngay';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="xn-trong">
      <p class="xn-tieude">Xem ngày</p>
      <section class="xn-ngay"></section>
      <section class="xn-khoi">
        <p class="xn-hoi-nhan">Bạn muốn làm gì?</p>
        <div class="xn-o">
          <input class="xn-hoi" type="text" placeholder="ví dụ: khai trương quán, chuyển nhà…" autocomplete="off">
          <button class="xn-tim" type="button">Tìm ngày</button>
        </div>
        <div class="xn-viec"></div>
        <div class="xn-kq"></div>
      </section>
      <section class="xn-khoi xn-tuoi"></section>
      <p class="xn-nguon">Theo lịch vạn niên dân gian, để tham khảo. Âm lịch theo thuật toán Hồ Ngọc Đức;
        danh sách nên và không nên của từng trực theo lichvannien365.com.</p>
    </div>`;
  document.body.appendChild(tam);
  tam.querySelector('.xn-dong').onclick = dong;
  tam.querySelector('.xn-tim').onclick = tim;
  tam.querySelector('.xn-hoi').addEventListener('keydown', e => { if (e.key === 'Enter') tim(); });
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  lech = 0;
  capNhatTuoi();
  veNgay(); veChonViec(); veTuoi();
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
  _sinh: (dd, mm, yy) => { ngaySinh = dd ? { dd, mm, yy } : null; capNhatTuoi(); veTuoi(); veNgay(); return sinh; },
};
})();

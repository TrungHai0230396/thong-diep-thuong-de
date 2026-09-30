/* Thần số học — giao diện. Mọi phép tính nằm ở assets/sohoc.js (hàm thuần, có bài kiểm).
   Ngày sinh dùng chung khoá với Xem ngày, chỉ lưu trong máy, bấm "Xem" mới lưu. */
(() => {
'use strict';

const S = () => self.TDTD_SOHOC;
const SINH_KEY = 'tdtd.lich.sinh';                   // cùng khoá với Xem ngày: nhập một lần dùng cả hai
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tam, sinh = null, dangNhap = false;

function docSinh() {
  try { const v = JSON.parse(localStorage.getItem(SINH_KEY) || 'null'); return v && v.dd ? v : null; } catch (e) { return null; }
}

/* ---------- nhập ngày sinh ---------- */

function veNhap() {
  const o = tam.querySelector('.ts-nhap');
  const namNay = new Date().getFullYear();
  const chon = (lop, nhan, ds, san) => `<select class="${lop}" aria-label="${nhan} sinh">
      <option value="">${nhan}</option>${ds.map(n => `<option value="${n}"${n === san ? ' selected' : ''}>${n}</option>`).join('')}</select>`;
  const dem = (a, b) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => a < b ? a + i : a - i);
  const s = sinh || {};
  o.innerHTML = `
    <p class="xn-tuoi-hoi">Ngày sinh dương lịch <span>(như trên giấy khai sinh)</span></p>
    <div class="xn-chon-sinh">
      ${chon('ts-ngay', 'Ngày', dem(1, 31), s.dd)}
      ${chon('ts-thang', 'Tháng', dem(1, 12), s.mm)}
      ${chon('ts-nam', 'Năm', dem(namNay, 1920), s.yy)}
      <button class="xn-luu" type="button"${s.dd ? '' : ' disabled'}>Xem các con số</button>
    </div>
    <p class="xn-loi" hidden></p>
    <p class="xn-ghi">Chỉ lưu trong máy này, dùng chung với trang Xem ngày. Thần số học tính theo ngày dương
      lịch, không dùng ngày âm.</p>`;
  const q = (k) => o.querySelector(k);
  const doc = () => [+q('.ts-ngay').value, +q('.ts-thang').value, +q('.ts-nam').value];
  ['.ts-ngay', '.ts-thang', '.ts-nam'].forEach(k => { q(k).onchange = () => { q('.xn-luu').disabled = doc().some(n => !n); q('.xn-loi').hidden = true; }; });
  q('.xn-luu').onclick = () => {
    const [dd, mm, yy] = doc();
    if (!dd || !mm || !yy) return;
    const t = new Date(yy, mm - 1, dd), loi = q('.xn-loi');
    if (t.getDate() !== dd) { loi.textContent = `Tháng ${mm}/${yy} không có ngày ${dd}.`; loi.hidden = false; return; }
    if (t > new Date()) { loi.textContent = 'Ngày sinh không thể ở tương lai.'; loi.hidden = false; return; }
    sinh = { dd, mm, yy };
    try { localStorage.setItem(SINH_KEY, JSON.stringify(sinh)); } catch (e) {}
    dangNhap = false; ve();
  };
}

/* ---------- kết quả ---------- */

function veKetQua() {
  const { dd, mm, yy } = sinh;
  const X = S(), cd = X.soChuDao(dd, mm, yy), y = X.Y_CHU_DAO[cd.so];
  const dem = X.bieuDo(dd, mm, yy), mt = X.muiTen(dem);
  const namNay = new Date().getFullYear();
  const nc = [namNay, namNay + 1].map(n => ({ n, ...X.namCaNhan(dd, mm, n) }));
  const dc = X.dinhCao(dd, mm, yy);
  const tuoi = namNay - yy;
  const dinhNay = dc.dinh.reduce((k, d, i) => (tuoi >= d.tuoi ? i : k), -1);   // đỉnh gần nhất đã qua

  const o = (s) => (dem[s] ? String(s).repeat(dem[s]) : '');
  const hang = [[3, 6, 9], [2, 5, 8], [1, 4, 7]];

  tam.querySelector('.ts-kq').innerHTML = `
    <section class="xn-khoi">
      <div class="ts-dau">
        <p class="ts-sinh">Sinh ${dd}/${mm}/${yy}</p>
        <button class="xn-xoa ts-doi" type="button">Đổi ngày sinh</button>
      </div>
      <p class="xn-tieu">Số chủ đạo</p>
      <p class="ts-so">${esc(cd.ten)}</p>
      <p class="ts-ten">${esc(y.ten)}</p>
      <p class="ts-buoc">${cd.buoc.map(esc).join(' → ')}${cd.so === 22 ? ' — tổng đúng bằng 22 nên ghi là 22/4' : ''}</p>
      <p class="ts-manh"><b>Thế mạnh</b> ${esc(y.manh)}</p>
      <p class="ts-yeu"><b>Nên để ý</b> ${esc(y.yeu)}</p>
    </section>

    <section class="xn-khoi">
      <p class="xn-tieu">Biểu đồ ngày sinh</p>
      <div class="ts-luoi">${hang.map(h => `
        <span class="ts-tang">${X.TANG[h[0]]}</span>
        ${h.map(s => `<span class="ts-o${dem[s] ? '' : ' trong'}" aria-label="số ${s}: ${dem[s]} lần">${dem[s] ? o(s) : s}</span>`).join('')}`).join('')}
      </div>
      <p class="xn-ghi ts-giua">Mỗi chữ số trong ngày sinh vào đúng ô của nó; số 0 không vào lưới. Ô mờ là số không có.</p>
      ${mt.day.length ? `<p class="ts-nhom">Mũi tên đầy</p>${mt.day.map(m => `
        <p class="ts-mt day"><b>${esc(m.day)}</b> <i>${m.so.join('-')}</i> — ${esc(m.yDay)}</p>`).join('')}` : ''}
      ${mt.trong.length ? `<p class="ts-nhom">Mũi tên trống</p>${mt.trong.map(m => `
        <p class="ts-mt trong"><b>${esc(m.trong)}</b> <i>trống ${m.so.join('-')}</i> — ${esc(m.yTrong)}</p>`).join('')}
        <p class="xn-ghi">Mũi tên trống không phải điều xấu định sẵn, chỉ là chỗ nên để ý.</p>` : ''}
      ${!mt.day.length && !mt.trong.length ? '<p class="xn-rong">Biểu đồ này không có hàng nào đầy hay trống cả ba ô, nên không có mũi tên nào.</p>' : ''}
    </section>

    <section class="xn-khoi">
      <p class="xn-tieu">Năm cá nhân</p>
      ${nc.map(x => `
        <div class="ts-nam-mot">
          <p class="ts-nam-dau"><b>${x.n}</b> là năm cá nhân số <b>${x.so}</b></p>
          <p class="ts-nam-y">${esc(X.Y_NAM[x.so])}</p>
          <p class="ts-buoc">${esc(x.buoc)} (ngày sinh + tháng sinh + năm ${x.n})</p>
        </div>`).join('')}
    </section>

    <section class="xn-khoi">
      <p class="xn-tieu">Bốn đỉnh cao</p>
      ${dc.dinh.map((d, i) => `
        <div class="ts-dinh${i === dinhNay ? ' nay' : ''}">
          <span class="ts-dinh-so">${d.so}</span>
          <div>
            <p class="ts-dinh-dau">Đỉnh ${i + 1} · ${d.tuoi} tuổi <span>(năm ${d.nam})</span>${i === dinhNay ? ' <em>đang ở đây</em>' : ''}</p>
            <p class="ts-dinh-y">${esc(X.Y_DINH[d.so])}</p>
          </div>
        </div>`).join('')}
      <p class="xn-ghi">Chân kim tự tháp: tháng ${dc.chan.thang}, ngày ${dc.chan.ngay}, năm ${dc.chan.nam} (đã rút gọn).
        Đỉnh 1 = tháng + ngày, đỉnh 2 = ngày + năm, đỉnh 3 = đỉnh 1 + đỉnh 2, đỉnh 4 = tháng + năm.
        Tuổi đỉnh 1 = 36 − số chủ đạo, mỗi đỉnh sau thêm 9 tuổi.</p>
      ${dc.chuaRo22 ? `<p class="xn-canh">Với số chủ đạo 22/4, các nguồn chỉ ghi "36 trừ số chủ đạo" mà không nói trừ 22 hay
        trừ 4. App trừ 22, như các nguồn làm với số 11 (đỉnh đầu ở 25 tuổi). Nếu trừ 4 thì bốn đỉnh sẽ ở
        ${[32, 41, 50, 59].join(', ')} tuổi.</p>` : ''}
    </section>`;
  tam.querySelector('.ts-doi').onclick = () => { dangNhap = true; ve(); };
}

function ve() {
  const nhap = !sinh || dangNhap;
  tam.querySelector('.ts-nhap').hidden = !nhap;
  if (nhap) { veNhap(); tam.querySelector('.ts-kq').innerHTML = ''; }
  else veKetQua();
  tam.querySelector('.xn-trong').scrollTop = 0;
}

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'thanso';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="xn-trong">
      <p class="xn-tieude">Thần số học</p>
      <section class="xn-khoi ts-nhap"></section>
      <div class="ts-kq"></div>
      <p class="xn-nguon">Theo thần số học Pythagoras, phương pháp của David A. Phillips mà bản tiếng Việt
        "Thay đổi cuộc sống với Nhân số học" (Lê Đỗ Quỳnh Hương) giới thiệu. Cách tính lấy theo chỗ các nguồn
        đối chiếu được nhất trí. Thần số học không có cơ sở khoa học — hãy xem như một gợi ý để tự ngẫm về
        mình, đừng để nó quyết định thay bạn.</p>
    </div>`;
  document.body.appendChild(tam);
  tam.querySelector('.xn-dong').onclick = dong;
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  sinh = docSinh(); dangNhap = false;
  ve();
}

function dong() {
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && tam && tam.classList.contains('hien') && !['INPUT', 'SELECT'].includes(document.activeElement?.tagName)) dong();
});

self.TDTD_THANSO = { mo, dong,
  _sinh: (dd, mm, yy) => { sinh = dd ? { dd, mm, yy } : null; dangNhap = false; ve(); return tam.querySelector('.ts-kq').textContent; },
};
})();

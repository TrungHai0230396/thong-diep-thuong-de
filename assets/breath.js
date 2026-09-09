/* Hộp thở — năm kiểu thở, mỗi kiểu cho một hoàn cảnh.
   Số giây lấy theo tài liệu, nguồn ghi trong phần Lưu ý của màn hình này. */
(() => {
'use strict';

/* tu/den: vòng tròn co giãn từ đâu tới đâu (0.52 là nhỏ nhất, 1 là lớn nhất) */
const NHO = .52, TO = 1;

const KIEU = [
  {
    id: 'tho-ra-dai',
    ten: 'Thở ra dài',
    khiNao: 'Khi chỉ cần dịu lại một chút',
    nhip: '4 vào · 6 ra',
    goiY: 'Thở 2–3 phút',
    moTa: 'Thở ra lâu hơn hít vào là cách đơn giản nhất để hệ thần kinh dịu xuống. Dễ làm, không nín thở, hợp cho người mới.',
    chuKy: [
      { ten: 'Hít vào bằng mũi', giay: 4, tu: NHO, den: TO },
      { ten: 'Thở ra bằng miệng', giay: 6, tu: TO, den: NHO },
    ],
  },
  {
    id: 'tho-dai-hoi',
    ten: 'Thở hai nhịp vào',
    khiNao: 'Khi đang lo lắng, cần dịu nhanh',
    nhip: '2 vào · 1 vào thêm · 6 ra',
    goiY: 'Thở 5 phút',
    moTa: 'Hít một hơi bằng mũi, hít thêm một hơi ngắn nữa cho phổi nở hết, rồi thở ra thật chậm bằng miệng. Đây là kiểu được nghiên cứu năm 2023 của Đại học Stanford ghi nhận cải thiện tâm trạng tốt nhất trong các kiểu thở đem so.',
    chuKy: [
      { ten: 'Hít vào bằng mũi', giay: 2, tu: NHO, den: .84 },
      { ten: 'Hít thêm một hơi ngắn', giay: 1, tu: .84, den: TO },
      { ten: 'Thở ra thật chậm bằng miệng', giay: 6, tu: TO, den: NHO },
    ],
  },
  {
    id: 'tho-vuong',
    ten: 'Thở vuông',
    khiNao: 'Khi cần bình tĩnh và tập trung',
    nhip: '4 · 4 · 4 · 4',
    goiY: 'Thở 3–5 phút',
    moTa: 'Bốn nhịp bằng nhau, có nín thở. Hợp lúc cần lấy lại bình tĩnh trước khi làm việc gì đó quan trọng.',
    chuKy: [
      { ten: 'Hít vào bằng mũi', giay: 4, tu: NHO, den: TO },
      { ten: 'Giữ hơi', giay: 4, tu: TO, den: TO },
      { ten: 'Thở ra bằng miệng', giay: 4, tu: TO, den: NHO },
      { ten: 'Giữ, chưa hít vội', giay: 4, tu: NHO, den: NHO },
    ],
  },
  {
    id: 'tho-cong-huong',
    ten: 'Thở cộng hưởng',
    khiNao: 'Khi muốn ngồi yên lâu một chút',
    nhip: '5,5 vào · 5,5 ra',
    goiY: 'Thở 5–10 phút',
    moTa: 'Khoảng năm hơi rưỡi mỗi phút, vào ra bằng nhau, đều bằng mũi, không nín. Nhịp này được ghi nhận làm nhịp tim biến thiên nhiều nhất, tức là cơ thể đang ở trạng thái dễ chịu.',
    chuKy: [
      { ten: 'Hít vào bằng mũi', giay: 5.5, tu: NHO, den: TO },
      { ten: 'Thở ra bằng mũi', giay: 5.5, tu: TO, den: NHO },
    ],
  },
  {
    id: 'tho-478',
    ten: 'Thở 4–7–8',
    khiNao: 'Khi khó ngủ',
    nhip: '4 vào · 7 giữ · 8 ra',
    goiY: 'Chỉ 4 vòng',
    canhBao: 'Kiểu này nín thở lâu. Tài liệu gốc khuyên tháng đầu chỉ làm tối đa 4 vòng mỗi lần, nên ứng dụng tự dừng sau 4 vòng.',
    moTa: 'Đặt đầu lưỡi chạm nướu ngay sau hai răng cửa trên và giữ nguyên suốt bài. Hít vào bằng mũi thật êm, giữ hơi, rồi thở ra bằng miệng thành tiếng nhẹ.',
    chuKy: [
      { ten: 'Hít vào bằng mũi', giay: 4, tu: NHO, den: TO },
      { ten: 'Giữ hơi', giay: 7, tu: TO, den: TO },
      { ten: 'Thở ra bằng miệng', giay: 8, tu: TO, den: NHO },
    ],
    toiDaVong: 4,
  },
];

let tam, cv, ctx, W, H, DPR, raf = null, tTruoc = 0;
let kieu = null, chay = false, troi = 0, vongSo = 0, nhipTruoc = -1, xong = false;

const tongChuKy = (k) => k.chuKy.reduce((s, n) => s + n.giay, 0) * 1000;
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'hopho';
  tam.innerHTML = `
    <canvas class="ht-cv"></canvas>
    <button class="ht-dong" aria-label="Đóng">✕</button>
    <div class="ht-giua">
      <p class="ht-nhip"></p>
      <p class="ht-dem"></p>
    </div>
    <p class="ht-vong"></p>
    <button class="ht-thoat" hidden>Chọn kiểu khác</button>
    <div class="ht-chon">
      <h2>Hộp thở</h2>
      <p class="ht-phu">Chọn kiểu hợp với lúc này.</p>
      <div class="ht-ds">${KIEU.map(k => `
        <button class="ht-the" data-id="${k.id}">
          <span class="ht-the-ten">${esc(k.ten)}</span>
          <span class="ht-the-khi">${esc(k.khiNao)}</span>
          <span class="ht-the-nhip">${esc(k.nhip)}</span>
        </button>`).join('')}</div>
      <button class="ht-luuy-nut">Lưu ý an toàn</button>
    </div>
    <div class="ht-tin" hidden>
      <div class="ht-tin-trong">
        <h3 class="ht-tin-ten"></h3>
        <p class="ht-tin-mota"></p>
        <p class="ht-tin-canh" hidden></p>
        <p class="ht-tin-goi"></p>
        <button class="primary ht-batdau">Bắt đầu</button>
        <button class="ghost ht-quay">Quay lại</button>
      </div>
    </div>
    <div class="ht-luuy" hidden>
      <div class="ht-tin-trong">
        <h3>Lưu ý an toàn</h3>
        <p>Thấy chóng mặt, choáng hay tê tay thì dừng lại và thở bình thường. Đó là dấu hiệu thở quá sâu chứ không phải bạn làm sai.</p>
        <p>Đừng tập khi đang lái xe. Ngồi hoặc nằm ở chỗ yên tĩnh.</p>
        <p>Các kiểu có nín thở, nhất là 4–7–8, không hợp với người đang mang thai, có bệnh hô hấp hoặc huyết áp thấp. Hỏi bác sĩ trước khi tập.</p>
        <p>Đây là bài thở để thư giãn, không thay thế điều trị y tế.</p>
        <p class="ht-nguon">Số giây tham khảo từ: nghiên cứu của Balban và cộng sự đăng trên Cell Reports Medicine năm 2023 về thở hai nhịp vào; hướng dẫn 4–7–8 của bác sĩ Andrew Weil; các tài liệu về thở cộng hưởng quanh mức năm hơi rưỡi mỗi phút.</p>
        <button class="ghost ht-quay2">Quay lại</button>
      </div>
    </div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.ht-cv');
  ctx = cv.getContext('2d');

  tam.querySelector('.ht-dong').onclick = dong;
  tam.querySelector('.ht-thoat').onclick = veChon;
  tam.querySelector('.ht-quay').onclick = veChon;
  tam.querySelector('.ht-quay2').onclick = veChon;
  tam.querySelector('.ht-luuy-nut').onclick = () => { an(); tam.querySelector('.ht-luuy').hidden = false; };
  tam.querySelector('.ht-batdau').onclick = batDau;
  tam.querySelectorAll('.ht-the').forEach(b => b.onclick = () => gioiThieu(b.dataset.id));
  addEventListener('resize', doCo);
}

function doCo() {
  if (!cv) return;
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = tam.clientWidth; H = tam.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

const an = () => ['.ht-chon', '.ht-tin', '.ht-luuy'].forEach(q => tam.querySelector(q).hidden = true);

function veChon() {
  chay = false; xong = false; kieu = null;
  an();
  tam.querySelector('.ht-chon').hidden = false;
  tam.querySelector('.ht-giua').classList.remove('hien');
  tam.querySelector('.ht-vong').textContent = '';
  tam.querySelector('.ht-thoat').hidden = true;
}

function gioiThieu(id) {
  kieu = KIEU.find(k => k.id === id);
  an();
  const t = tam.querySelector('.ht-tin');
  t.querySelector('.ht-tin-ten').textContent = kieu.ten + ' · ' + kieu.nhip;
  t.querySelector('.ht-tin-mota').textContent = kieu.moTa;
  const c = t.querySelector('.ht-tin-canh');
  c.hidden = !kieu.canhBao;
  if (kieu.canhBao) c.textContent = kieu.canhBao;
  t.querySelector('.ht-tin-goi').textContent = kieu.goiY;
  t.hidden = false;
}

function batDau() {
  an();
  chay = true; xong = false; troi = 0; vongSo = 0; nhipTruoc = -1;
  tam.querySelector('.ht-giua').classList.add('hien');
  tam.querySelector('.ht-thoat').hidden = false;
  tTruoc = performance.now();
}

function ketThuc() {
  chay = false; xong = true;
  tam.querySelector('.ht-nhip').textContent = 'Đủ rồi';
  tam.querySelector('.ht-dem').textContent = 'Thở lại bình thường';
  tam.querySelector('.ht-vong').textContent = `đã xong ${kieu.toiDaVong} vòng`;
}

function vong(t) {
  raf = requestAnimationFrame(vong);
  buoc(t);
}

function buoc(t) {
  const dt = Math.max(0, Math.min(34, t - tTruoc)); tTruoc = t;
  if (chay) troi += dt;

  const R = Math.min(W, H) * .30, cx = W / 2, cy = H / 2;
  const nen = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * .75);
  nen.addColorStop(0, '#221b46'); nen.addColorStop(1, '#0c0a1c');
  ctx.fillStyle = nen; ctx.fillRect(0, 0, W, H);

  let co = NHO, tienDo = 0;
  if (kieu && (chay || xong)) {
    const TONG = tongChuKy(kieu);
    if (chay) {
      const trong = troi % TONG;
      vongSo = Math.floor(troi / TONG);
      if (kieu.toiDaVong && vongSo >= kieu.toiDaVong) { ketThuc(); }
      else {
        let m = 0;
        for (let i = 0; i < kieu.chuKy.length; i++) {
          const n = kieu.chuKy[i], d = n.giay * 1000;
          if (trong < m + d) {
            const p = (trong - m) / d;
            co = n.tu + (n.den - n.tu) * (p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
            if (i !== nhipTruoc) {
              nhipTruoc = i;
              tam.querySelector('.ht-nhip').textContent = n.ten;
              tam.querySelector('.ht-vong').textContent = `vòng ${vongSo + 1}` +
                (kieu.toiDaVong ? ` / ${kieu.toiDaVong}` : ` · ${Math.floor(troi / 60000)}:${String(Math.floor(troi / 1000) % 60).padStart(2, '0')}`);
              if (navigator.vibrate) { try { navigator.vibrate(18); } catch (e) {} }
            }
            tam.querySelector('.ht-dem').textContent = Math.ceil(n.giay - p * n.giay);
            tienDo = trong / TONG;
            break;
          }
          m += d;
        }
      }
    }
  }

  const r = R * co;
  const g = ctx.createRadialGradient(cx, cy, r * .2, cx, cy, r);
  g.addColorStop(0, 'rgba(184,168,232,.30)'); g.addColorStop(1, 'rgba(184,168,232,.05)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.284); ctx.fill();
  ctx.strokeStyle = 'rgba(200,186,240,.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.284); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,186,240,.14)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.284); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * NHO, 0, 6.284); ctx.stroke();

  if (chay) {
    ctx.strokeStyle = 'rgba(232,195,122,.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, -Math.PI / 2, -Math.PI / 2 + tienDo * 6.283); ctx.stroke();
    const a = -Math.PI / 2 + tienDo * 6.283;
    ctx.fillStyle = '#e8c37a';
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 1.28, cy + Math.sin(a) * R * 1.28, 5, 0, 6.284); ctx.fill();
  }
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  veChon();
  tTruoc = performance.now();
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  chay = false;
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
self.TDTD_THO = { mo, dong, _buoc: (t) => buoc(t), _kieu: KIEU,
  _chon: (id) => { gioiThieu(id); batDau(); },
  _debug: () => ({ chay, xong, kieu: kieu && kieu.id, troi: Math.round(troi), vong: vongSo,
                   nhip: tam && tam.querySelector('.ht-nhip').textContent,
                   dem: tam && tam.querySelector('.ht-dem').textContent }) };
})();

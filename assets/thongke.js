/* Đếm lượt truy cập bằng Vercel Web Analytics — để biết có bao nhiêu người dùng, bao nhiêu người đã cài app.
   Không cookie, không gắn mã nào vào máy để đếm: Vercel nhận ra người xem bằng một mã băm tạo từ chính lượt
   truy cập, phiên tự bỏ sau 24 giờ, chỉ thống kê gộp. Phải bật trong bảng điều khiển Vercel (thẻ
   Analytics → Enable) thì đường /_vercel/insights/ mới có; chưa bật thì tệp đếm báo 404, trang vẫn chạy.

   Gói Hobby miễn phí 50.000 lượt một tháng, vượt thì Vercel ngừng đếm tới kỳ sau — nên mỗi lần mở trang
   chỉ gửi đúng MỘT lượt; đổi qua lại giữa các sao (đổi dấu #) không gửi thêm.

   Địa chỉ gửi đi không phải địa chỉ thật mà là một trong ba nhãn, để bảng Analytics tách sẵn:
     /          mở bằng trình duyệt
     /app       mở từ biểu tượng app ngoài màn hình chính
     /app/moi   lần đầu mở app trên máy đó — tức một lượt cài mới
   iPhone không báo cho trang biết lúc cài xong (Android cũng chỉ báo khi cài bằng hộp cài), nên đếm lượt
   cài bằng lần mở đầu tiên từ màn hình chính. Mốc "đã mở app" ghi chung vào mẩu tdtd.caiApp. */
(function (root) {
'use strict';

/* Nhãn cho lượt mở này, và mẩu tdtd.caiApp mới cần ghi (null: không ghi gì). */
function nhan(daCai, tt) {
  if (!daCai) return { duong: '/', tt: null };
  if (tt && tt.moApp) return { duong: '/app', tt: null };
  return { duong: '/app/moi', tt: { ...(tt || {}), moApp: true, daCai: true } };
}

/* Bộ lọc trước khi gửi: lượt đầu đổi địa chỉ thành nhãn, các lượt sau bỏ. */
function locGui(origin, daCai, CA) {
  let daGui = false;
  return (ev) => {
    if (daGui || !ev || ev.type === 'event') return null;
    daGui = true;
    const n = nhan(daCai, CA && CA.docTT());
    if (n.tt && CA) CA.ghiTT(n.tt);
    return { ...ev, url: origin + n.duong };
  };
}

/* Chỉ chạy trên trang thật (https). Chạy thử ở máy (http://127.0.0.1) thì thôi. */
if (typeof document !== 'undefined' && typeof location !== 'undefined' && location.protocol === 'https:') {
  const daCai = !!navigator.standalone || (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches);
  root.va = root.va || function () { (root.vaq = root.vaq || []).push(arguments); };
  root.va('beforeSend', locGui(location.origin, daCai, root.TDTD_CAIAPP));
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
}

const API = { nhan, locGui };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_THONGKE = API;
})(typeof self !== 'undefined' ? self : this);

/* Gõ từ — vừa luyện gõ mười ngón vừa học tiếng Anh.

   Vốn từ không tự bịa. Lấy từ **NGSL 1.2** (New General Service List, Browne–Culligan–Phillips,
   bản tháng 4/2023): 2 801 từ gốc rút từ 273 triệu từ của Cambridge English Corpus, phủ hơn 92%
   văn bản tiếng Anh thông thường. Danh sách chia sẵn ba dải tần suất 1000 / 2000 / 3000 nên ba
   cấp ở đây chính là ba dải đó, giữ nguyên thứ tự tần suất — cấp 1 là những từ hay gặp nhất.
   Bỏ đi từ chức năng (the, of, to...) vì dịch lẻ ra thì vô nghĩa mà gõ cũng chẳng học được gì,
   bỏ từ dưới ba chữ cái, và bỏ vài từ không hợp giọng một app tĩnh tâm.
   Nghĩa tiếng Việt lấy nghĩa thông dụng nhất; từ nào hai nghĩa hay dùng như nhau thì ghi cả hai,
   ngăn bằng dấu chấm phẩy. Nguồn: https://www.newgeneralservicelist.com/

   Mỗi dòng là một từ: chữ tiếng Anh, một dấu cách, rồi nghĩa. */
(() => {
'use strict';

const VON_TU = {
  1: `know biết
like thích
think nghĩ
see thấy, nhìn
good tốt
people người ta, mọi người
year năm
take lấy, cầm
well tốt, giỏi
because bởi vì
come đến
work làm việc; công việc
use dùng
look nhìn
want muốn
give cho, đưa
first đầu tiên
way cách; đường
find tìm thấy
over qua; hơn
day ngày
thing thứ, việc
need cần
right đúng; bên phải
back lưng; trở lại
mean nghĩa là
last cuối cùng; kéo dài
child đứa trẻ
tell kể, bảo
really thật sự
call gọi
before trước
company công ty
through xuyên qua
down xuống
show cho xem; chương trình
life cuộc sống
change thay đổi
place nơi chốn
long dài, lâu
between ở giữa
feel cảm thấy
problem vấn đề
write viết
lot nhiều
great tuyệt; lớn lao
try thử, cố gắng
leave rời đi; để lại
number con số
part phần
point điểm; chỉ tay
help giúp
ask hỏi
meet gặp
start bắt đầu
talk nói chuyện
something điều gì đó
put đặt, để
another một cái khác
become trở thành
interest sự quan tâm; tiền lãi
country đất nước
old cũ; già
school trường học
late muộn
high cao
different khác nhau
off tắt; rời khỏi
next kế tiếp
end kết thúc
live sống
while trong khi
world thế giới
week tuần
play chơi
might có thể
home nhà
include bao gồm
course khoá học; lộ trình
house ngôi nhà
report báo cáo
group nhóm
case trường hợp; cái hộp
woman phụ nữ
around quanh
book quyển sách
family gia đình
seem có vẻ
kind loại; tử tế
keep giữ
hear nghe
system hệ thống
every mỗi
question câu hỏi
during trong lúc
big to
set bộ; đặt
small nhỏ
study học
follow đi theo
begin bắt đầu
important quan trọng
since từ khi; bởi vì
run chạy
under ở dưới
turn quay; lượt
bring mang tới
early sớm
hand bàn tay
move di chuyển
money tiền
fact sự thật
however tuy nhiên
area khu vực
provide cung cấp
name tên
read đọc
friend bạn
month tháng
large lớn`,

  2: `announce thông báo
unless trừ khi
independent độc lập
recommend khuyên dùng, giới thiệu
survey khảo sát
majority đa số
stick cái que; dính
request yêu cầu
rich giàu
wind gió
none không cái nào
exchange trao đổi
budget ngân sách
famous nổi tiếng
blood máu
appropriate thích hợp
block khối; chặn lại
warm ấm
count đếm
scene cảnh
writer người viết
content nội dung; hài lòng
prevent ngăn ngừa
safe an toàn
invite mời
mix trộn
element yếu tố; nguyên tố
effective hiệu quả
correct đúng; sửa lại
medical thuộc y tế
admit thừa nhận
beat đánh; nhịp đập
telephone điện thoại
copy bản sao; chép lại
committee uỷ ban
aware nhận biết, ý thức được
advice lời khuyên
handle xử lý; tay cầm
glass thuỷ tinh; cái ly
trial cuộc thử nghiệm; phiên toà
stress căng thẳng
radio đài phát thanh
administration sự quản lý; chính quyền
complex phức tạp
text văn bản
context bối cảnh
ride cưỡi, đi xe
directly trực tiếp
heavy nặng
remove bỏ đi
conduct tiến hành; cách cư xử
equipment thiết bị
otherwise nếu không thì
title tựa đề
extra thêm
executive người điều hành
chair cái ghế
expensive đắt
sample mẫu
deliver giao tới
video video
connection sự kết nối
primary chính yếu, cơ bản
weather thời tiết
collect thu thập
inform báo cho biết
principle nguyên tắc
straight thẳng
appeal kêu gọi; sức hút
highly rất, cao độ
trust tin tưởng
wonderful tuyệt vời
flat phẳng; căn hộ
absolutely hoàn toàn
flow chảy; dòng chảy
fair công bằng; hội chợ
additional thêm vào
responsible có trách nhiệm
farm nông trại
collection bộ sưu tập
hang treo
negative tiêu cực; âm
band ban nhạc; dải
relative họ hàng; tương đối
tour chuyến đi
alternative lựa chọn khác
software phần mềm
pair cặp, đôi
ship con tàu
attitude thái độ
cheap rẻ
double gấp đôi
leg cái chân
observe quan sát
sentence câu
print in ra
progress tiến bộ
truth sự thật
nobody không ai
examine xem xét kỹ
lay đặt nằm xuống
speed tốc độ
politics chính trị
reply trả lời
display trưng bày; màn hình
transfer chuyển
perfect hoàn hảo
slightly hơi, một chút
overall nhìn chung
intend dự định
user người dùng
respond hồi đáp
dinner bữa tối
slow chậm
regular đều đặn, thường lệ
physical thuộc thể chất
apart tách rời
suit bộ vest; hợp với
federal thuộc liên bang
reveal hé lộ`,

  3: `supplier nhà cung cấp
prize giải thưởng
typically thường thì
peer người ngang hàng
pension lương hưu
wing cánh
acquisition sự mua lại; sự thu nhận
laughter tiếng cười
deeply sâu sắc
recognition sự nhận ra; sự công nhận
electricity điện
assistance sự trợ giúp
roof mái nhà
retirement sự nghỉ hưu
respectively theo thứ tự đó
variation sự biến thiên
ultimately rốt cuộc
proof bằng chứng
soil đất
smart thông minh
layer lớp
upset buồn bực; làm đảo lộn
tooth cái răng
representation sự đại diện
preparation sự chuẩn bị
dispute tranh chấp
agenda chương trình nghị sự
emphasis sự nhấn mạnh
edition ấn bản
silver bạc
entertainment sự giải trí
honest trung thực
undertake đảm nhận
retail bán lẻ
wire dây
unlikely khó xảy ra
publication ấn phẩm; sự công bố
slight nhẹ, không đáng kể
unknown chưa biết
framework khung sườn
zone vùng
restrict hạn chế
trace dấu vết; lần theo
inch inch, 2,54 cm
equivalent tương đương
solid rắn chắc
enterprise doanh nghiệp
elderly cao tuổi
owe nợ
governor thống đốc
uniform đồng phục; đồng đều
port cảng
pitch sân bóng; cao độ
arrival sự đến nơi
contemporary đương thời
gate cổng
ease sự thoải mái; làm dịu
beer bia
specialist chuyên gia
assure cam đoan
profile hồ sơ; mặt nghiêng
mood tâm trạng
episode tập phim; sự việc
crack vết nứt; làm nứt
numerous nhiều
submit nộp
symptom triệu chứng
virtually hầu như
era thời đại
coverage phạm vi phủ; sự đưa tin
tension sự căng thẳng
cable dây cáp
sensitive nhạy cảm
nervous hồi hộp, lo lắng
input đầu vào
isolate cô lập
eliminate loại bỏ
tight chặt, chật
wet ướt
secondary thứ cấp; bậc trung học
welfare phúc lợi
recruit tuyển
exclude loại trừ
string sợi dây; chuỗi
cloud đám mây
persuade thuyết phục
inspire truyền cảm hứng
grand lớn lao, hoành tráng
crew tổ, đội
phenomenon hiện tượng
pupil học trò; con ngươi
false sai, giả
assist hỗ trợ
restore khôi phục
formula công thức
alter thay đổi
perceive nhận thấy
routine lệ thường
sink chìm; bồn rửa
stare nhìn chằm chằm
anymore không còn nữa
hero anh hùng
supporter người ủng hộ
convert chuyển đổi
steady vững, đều
meter mét; đồng hồ đo
truck xe tải
nose cái mũi
beside bên cạnh
sail buồm; đi thuyền
pace nhịp độ
heavily nặng nề, nhiều
devote dành hết cho
justify biện minh
vital thiết yếu
fascinate làm mê hoặc
external bên ngoài
spare dư ra; dành ra
whenever bất cứ khi nào
underlie nằm bên dưới`,
};

/* Tách mỗi dòng làm hai ở dấu cách đầu tiên: phần trước là từ, phần sau là nghĩa
   (nghĩa có dấu cách nên không cắt được bằng split thường). */
const doc = (s) => s.trim().split('\n').map(d => {
  const k = d.indexOf(' ');
  return { en: d.slice(0, k), vi: d.slice(k + 1) };
});
const KHO = { 1: doc(VON_TU[1]), 2: doc(VON_TU[2]), 3: doc(VON_TU[3]) };

const CAP = [
  { so: 1, ten: 'Cấp một', mo: 'Nghìn từ hay gặp nhất' },
  { so: 2, ten: 'Cấp hai', mo: 'Nghìn từ kế tiếp' },
  { so: 3, ten: 'Cấp ba', mo: 'Tám trăm từ sau nữa' },
];

const MOT_LUOT = 20;                                    // một lượt hai mươi từ, xong thì xem lại
const NGHI = 380;                                       // nghỉ giữa hai từ, để kịp thấy từ vừa xong sáng xanh
const NOI_KEY = 'tdtd.gotu.doc';                        // có đọc tiếng Anh lên hay không

let tam, oKhung, oNhap, cap = null, bo = [], chiSo = 0, goDung = 0;
let daGo = '', saiTu = 0, tongSai = 0, tongPhim = 0, tMoDau = 0, tCuoi = 0, xong = false;
let nhoSai = [];                                        // từ nào gõ vấp, để nhắc lại lúc cuối
let doc_ = true;

try { doc_ = localStorage.getItem(NOI_KEY) !== '0'; } catch (e) {}

const LOA_MO = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const LOA_TAT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9.5l4 5M20 9.5l-4 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

/* ---------- đọc từ lên ---------- */

function noi(tu) {
  if (!doc_ || !self.speechSynthesis || !self.SpeechSynthesisUtterance) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(tu);
    u.lang = 'en-US'; u.rate = .85;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------- dựng khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'gotu';
  tam.innerHTML = `
    <button class="gt-doc" type="button"></button>
    <button class="gt-dong" type="button" aria-label="Đóng">✕</button>
    <div class="gt-trong"></div>
    <input class="gt-nhap" type="text" autocomplete="off" autocorrect="off"
           autocapitalize="off" spellcheck="false" aria-label="Gõ từ tiếng Anh">`;
  document.body.appendChild(tam);
  oKhung = tam.querySelector('.gt-trong');
  oNhap = tam.querySelector('.gt-nhap');
  tam.querySelector('.gt-dong').onclick = dong;
  const loa = tam.querySelector('.gt-doc');
  veLoa(loa);
  loa.onclick = () => {
    doc_ = !doc_;
    try { localStorage.setItem(NOI_KEY, doc_ ? '1' : '0'); } catch (e) {}
    veLoa(loa);
    if (doc_ && bo[chiSo]) noi(bo[chiSo].en);
    else if (self.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
    oNhap.focus();
  };

  /* Một ô nhập ẩn hứng phím: trên điện thoại thì đây là thứ gọi bàn phím lên,
     trên máy tính thì chỉ cần nó giữ tiêu điểm. Không đọc giá trị của ô, chỉ nghe phím. */
  oNhap.addEventListener('keydown', phim);
  /* Nhận **cả chuỗi** chứ không chỉ chữ cuối: bàn phím điện thoại gõ vuốt hay chọn gợi ý
     thì chèn nguyên một từ trong một lần, lấy mỗi chữ cuối là mất sạch phần đầu. */
  oNhap.addEventListener('input', () => {
    const v = oNhap.value; oNhap.value = '';
    for (const c of v) goPhim(c);
  });
  oNhap.addEventListener('blur', () => { if (!xong && cap) setTimeout(() => oNhap.focus(), 40); });
  tam.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (!xong && cap) { e.preventDefault(); oNhap.focus(); }
  });
}

const veLoa = (n) => {
  n.innerHTML = doc_ ? LOA_MO : LOA_TAT;
  n.classList.toggle('tat', !doc_);
  n.setAttribute('aria-label', doc_ ? 'Tắt đọc' : 'Đọc từ lên');
};

/* ---------- chọn cấp ---------- */

function veChon() {
  cap = null; xong = false;
  oKhung.innerHTML = `
    <div class="gt-chon">
      <p class="gt-loi">Gõ từ tiếng Anh</p>
      <p class="gt-phu">Mỗi lượt hai mươi từ. Gõ đúng chữ nào thì chữ đó sáng lên.</p>
      ${CAP.map(c => `
        <button class="gt-the" type="button" data-cap="${c.so}">
          <span class="gt-the-ten">${c.ten}</span>
          <span class="gt-the-mo">${c.mo} · ${KHO[c.so].length} từ</span>
          <span class="gt-the-vd">${KHO[c.so].slice(0, 3).map(t => t.en).join(' · ')} …</span>
        </button>`).join('')}
      <p class="gt-nguon">Từ lấy theo bảng tần suất NGSL, xếp từ hay gặp nhất trở đi.</p>
    </div>`;
  oKhung.querySelectorAll('.gt-the').forEach(b => {
    b.onclick = () => batDau(+b.dataset.cap);
  });
}

/* ---------- một lượt ---------- */

function xaoBai(a) {                                    // Fisher–Yates, xáo tại chỗ
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function batDau(so) {
  cap = so; xong = false;
  bo = xaoBai(KHO[so].slice()).slice(0, MOT_LUOT);
  chiSo = 0; daGo = ''; goDung = 0; saiTu = 0; tongSai = 0; tongPhim = 0; tCuoi = 0;
  nhoSai = [];
  tMoDau = 0;                                           // bấm giờ từ phím đầu tiên, không tính lúc đọc đề
  oKhung.innerHTML = `
    <div class="gt-choi">
      <p class="gt-dem"></p>
      <p class="gt-tu"></p>
      <p class="gt-nghia"></p>
      <p class="gt-nhac">Gõ đi. Sai thì chữ không chạy, gõ lại chữ đúng là qua.</p>
    </div>`;
  veTu();
  oNhap.focus();
}

function veTu() {
  const t = bo[chiSo];
  if (!t) return;
  const o = oKhung.querySelector('.gt-tu');
  o.classList.remove('trot');                           // bỏ màu xanh của từ vừa xong, kẻo từ mới hiện ra đã xanh sẵn
  o.innerHTML = [...t.en].map((c, i) => {
    const l = i < daGo.length ? ' xong' : (i === daGo.length ? ' toi' : '');
    return `<span class="gt-chu${l}">${c === ' ' ? '&nbsp;' : c}</span>`;
  }).join('');
  oKhung.querySelector('.gt-nghia').textContent = t.vi;
  oKhung.querySelector('.gt-dem').textContent = `${chiSo + 1} / ${bo.length}`;
}

function phim(e) {
  if (e.key === 'Escape') { dong(); return; }
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (daGo) { daGo = daGo.slice(0, -1); veTu(); }
    return;
  }
  if (e.key.length === 1) { e.preventDefault(); goPhim(e.key); }
}

function goPhim(c) {
  if (!c || xong || !bo[chiSo]) return;
  if (!tMoDau) tMoDau = performance.now();
  const t = bo[chiSo], dung = t.en[daGo.length];
  tongPhim++;
  if (c.toLowerCase() !== dung.toLowerCase()) {         // gõ sai: chữ không chạy, chỉ rung một cái
    tongSai++; saiTu++;
    const o = oKhung.querySelector('.gt-chu.toi');
    if (o) { o.classList.remove('sai'); void o.offsetWidth; o.classList.add('sai'); }
    return;
  }
  daGo += dung;
  goDung++;
  tCuoi = performance.now();
  veTu();
  if (daGo.length < t.en.length) return;

  if (saiTu) nhoSai.push({ ...t, sai: saiTu });         // từ nào vấp thì nhớ lại để nhắc cuối lượt
  saiTu = 0;
  const o = oKhung.querySelector('.gt-tu');
  if (o) o.classList.add('trot');
  chiSo++; daGo = '';
  if (chiSo >= bo.length) { setTimeout(veTongKet, 420); return; }
  setTimeout(() => { veTu(); noi(bo[chiSo].en); }, NGHI);
}

/* ---------- xem lại ---------- */

function veTongKet() {
  xong = true;
  /* Bấm giờ từ phím đầu tiên tới phím cuối cùng, rồi **trừ đi** mấy quãng nghỉ giữa các từ:
     quãng đó là tôi chèn vào cho kịp nhìn, tính vào thì hoá ra chê người ta gõ chậm. */
  const tho = tMoDau && tCuoi ? tCuoi - tMoDau - NGHI * (bo.length - 1) : 0;
  const giay = Math.max(tho, 0) / 1000;
  const phut = Math.max(giay / 60, 1 / 60);
  /* Ghi thẳng cái đo được, không mượn quy ước "năm ký tự là một từ" của mấy bài test gõ tiếng
     Anh — mượn thì con số không khớp với cái tên tiếng Việt bên dưới nó. */
  const kyTuMoiPhut = Math.round(goDung / phut);
  const tuMoiPhut = Math.round(bo.length / phut);
  const dung = tongPhim ? Math.round(goDung / tongPhim * 100) : 100;
  const vap = nhoSai.slice().sort((a, b) => b.sai - a.sai).slice(0, 6);
  oKhung.innerHTML = `
    <div class="gt-het">
      <p class="gt-loi">Xong hai mươi từ</p>
      <div class="gt-so">
        <div><b>${kyTuMoiPhut}</b><span>ký tự mỗi phút</span></div>
        <div><b>${tuMoiPhut}</b><span>từ mỗi phút</span></div>
        <div><b>${dung}%</b><span>gõ đúng</span></div>
      </div>
      ${vap.length ? `<p class="gt-phu">Mấy từ vấp nhiều nhất, ngó lại một lượt:</p>
        <ul class="gt-vap">${vap.map(t =>
          `<li><b>${t.en}</b> <i>${t.vi}</i></li>`).join('')}</ul>`
        : `<p class="gt-phu">Không vấp chữ nào.</p>`}
      <div class="gt-nut">
        <button class="gt-lai" type="button">Gõ tiếp cấp ${cap}</button>
        <button class="gt-doicap" type="button">Đổi cấp</button>
      </div>
    </div>`;
  oKhung.querySelector('.gt-lai').onclick = () => batDau(cap);
  oKhung.querySelector('.gt-doicap').onclick = veChon;
}

/* ---------- mở đóng ---------- */

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  veChon();
}

function dong() {
  if (self.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  cap = null; xong = true;
  if (oNhap) oNhap.blur();
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong();
});

self.TDTD_GOTU = { mo, dong,
  _kho: () => KHO,
  _batDau: (so) => batDau(so),
  _go: (chuoi) => { for (const c of chuoi) goPhim(c); return daGo; },
  _tu: () => bo[chiSo] || null,
  _debug: () => ({ cap, chiSo, tong: bo.length, daGo, xong,
                   goDung, tongPhim, tongSai, vap: nhoSai.length,
                   hienTu: tam && tam.querySelector('.gt-tu') ? tam.querySelector('.gt-tu').textContent : null,
                   hienNghia: tam && tam.querySelector('.gt-nghia') ? tam.querySelector('.gt-nghia').textContent : null }) };
})();

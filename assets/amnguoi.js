/* Tiếng NGƯỜI THẬT đọc từng âm — bản thu của các bài IPA trên Wikipedia, không phải máy dựng.

   Vì sao phải có file này: máy đọc của hệ điều hành chỉ đọc được TỪ — đưa nó "θ" thì nó đọc
   tên chữ cái Hy Lạp; còn âm tự dựng bằng toán (assets/amvi.js) thì đúng phổ mà tai không nghe ra.
   Muốn nghe riêng một âm /s/ bằng giọng người thì chỉ có một cách: một người thật thu âm nó.

   Mỗi bản thu đọc âm đó trong âm tiết với nguyên âm "a" — [sa] rồi [asa] — vì phụ âm đứng trơ trọi
   thì nhiều âm (p, t, k) chỉ còn là một tiếng tách. Âm nào kéo dài được (s, z, m, l...) thì có thêm
   bản "chỉ âm", cắt đúng đoạn phụ âm ở đầu [sa], để nghe riêng cái âm đó.

   Bản quyền: CC BY-SA 3.0 — phải ghi tên người thu, nguồn, giấy phép, và nói rõ đã sửa gì.
   Bản trong assets/am/ là bản ĐÃ SỬA nên cũng mang CC BY-SA 3.0. Danh sách đầy đủ ở assets/am/NGUON.md.

   Nhãn của từng file đã được đo lại chứ không tin mô tả trên Commons (mô tả của file /z/ ở đó ghi
   nhầm thành "voiceless bilabial"): xem scripts/kiem-am-nguoi.py. */
(function (root) {
'use strict';

const THU_MUC = 'assets/am/';
const GIAY_PHEP = { ten: 'CC BY-SA 3.0', url: 'https://creativecommons.org/licenses/by-sa/3.0/' };
const DA_SUA = 'đã cắt khoảng lặng, chỉnh âm lượng, đổi sang MP3; bản "chỉ âm" cắt từ đầu âm tiết';

/* noi: bản thu đọc gì — đo ra từ đường năng lượng của từng file, không đoán theo tên.
   cat: đoạn phụ âm ở đầu âm tiết (giây, tính trên file đã cắt lặng), chỉ với âm kéo dài được.
   doi: âm hay bị lẫn với nó, để nghe so. */
const DS = [
  { ma: 's',  ipa: 's', nhom: 'phu', noi: '[sa] … [asa]', cat: [.05, .24], tep: 'Voiceless alveolar sibilant.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Xì như rắn. Cổ không rung.', doi: ['z', 'sh'] },
  { ma: 'z',  ipa: 'z', nhom: 'phu', noi: '[za] … [aza]', cat: [.09, .31], tep: 'Voiced alveolar sibilant.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Như /s/ nhưng bật giọng — tiếng ong bay, đặt tay lên cổ thấy rung.', doi: ['s'] },
  { ma: 'sh', ipa: 'ʃ', nhom: 'phu', noi: '[ʃa] … [aʃa]', cat: [.05, .31], tep: 'Voiceless palato-alveolar sibilant.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Suỵt — môi chu ra trước, lưỡi lùi hơn /s/, nên nghe trầm hơn.', doi: ['s'] },
  { ma: 'f',  ipa: 'f', nhom: 'phu', noi: '[afa]', cat: [.20, .50], tep: 'Voiceless labiodental fricative.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Răng trên đặt nhẹ lên môi dưới, thổi hơi qua khe. Không mím hai môi.', doi: ['p', 'v'] },
  { ma: 'v',  ipa: 'v', nhom: 'phu', noi: '[ava]', cat: [.28, .45], tep: 'Voiced labiodental fricative.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Như /f/ nhưng cổ rung — môi dưới tê tê.', doi: ['w', 'f'] },
  { ma: 'th', ipa: 'θ', nhom: 'phu', noi: '[θa] … [aθa]', cat: [.08, .27], tep: 'Voiceless dental fricative.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Đầu lưỡi thò ra giữa hai hàm răng, thổi hơi. Âm rất nhỏ, đó là bình thường.', doi: ['t', 's', 'dh'] },
  { ma: 'dh', ipa: 'ð', nhom: 'phu', noi: '[ða] … [aða]', cat: [.04, .24], tep: 'Voiced dental fricative.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Như /θ/ nhưng cổ rung.', doi: ['d', 'z', 'th'] },
  { ma: 'p',  ipa: 'p', nhom: 'phu', noi: '[pa] … [apa]', tep: 'Voiceless bilabial plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Mím môi rồi bật ra kèm một luồng hơi phụt. Để tờ giấy trước miệng thì giấy phải bay.', doi: ['b', 'f'] },
  { ma: 'b',  ipa: 'b', nhom: 'phu', noi: '[ba] … [aba]', tep: 'Voiced bilabial plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Mím môi rồi bật nhẹ, không phụt hơi.', doi: ['p'] },
  { ma: 't',  ipa: 't', nhom: 'phu', noi: '[ta] … [ata]', tep: 'Voiceless alveolar plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Đầu lưỡi chặn ở lợi sau răng trên rồi bật, có hơi phụt ra — gần "th" tiếng Việt hơn là "t".', doi: ['d', 'th'] },
  { ma: 'd',  ipa: 'd', nhom: 'phu', noi: '[da] … [ada]', tep: 'Voiced alveolar plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Như /t/ nhưng nhẹ, không phụt hơi.', doi: ['t', 'dh'] },
  { ma: 'k',  ipa: 'k', nhom: 'phu', noi: '[ka] … [aka]', tep: 'Voiceless velar plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Cuống lưỡi chặn ở vòm mềm rồi bật, có hơi phụt ra.', doi: ['g'] },
  { ma: 'g',  ipa: 'g', nhom: 'phu', noi: '[aga]', tep: 'Voiced velar plosive.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Như /k/ nhưng cổ rung, không phụt hơi.', doi: ['k'] },
  { ma: 'm',  ipa: 'm', nhom: 'phu', noi: '[ma] … [ama]', cat: [.20, .36], tep: 'Bilabial nasal.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Ngậm môi, ngân tiếng lên mũi.', doi: ['n'] },
  { ma: 'n',  ipa: 'n', nhom: 'phu', noi: '[na] … [ana]', cat: [.04, .28], tep: 'Alveolar nasal.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Đầu lưỡi chạm lợi, ngân tiếng lên mũi. Bịt mũi thì tắc tiếng.', doi: ['l', 'm'] },
  { ma: 'l',  ipa: 'l', nhom: 'phu', noi: '[la] … [ala]', cat: [.05, .32], tep: 'Alveolar lateral approximant.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Đầu lưỡi chạm lợi, hơi ra hai bên lưỡi. Bịt mũi vẫn kêu được — khác /n/.', doi: ['n', 'r'] },
  { ma: 'r',  ipa: 'r', nhom: 'phu', noi: '[ɹa] … [aɹa]', tep: 'Alveolar approximant.ogg', tacGia: 'Erutuon',
    goiY: 'Lưỡi cong lên nhưng KHÔNG chạm đâu cả, môi hơi tròn. Không rung lưỡi như "r" tiếng Việt.', doi: ['l'] },
  { ma: 'w',  ipa: 'w', nhom: 'phu', noi: '[wa] … [awa]', tep: 'Voiced labio-velar approximant.ogg', tacGia: 'Peter Isotalo',
    goiY: 'Chúm tròn môi như "u" rồi mở ra. Răng không chạm môi — khác /v/.', doi: ['v'] },
  { ma: 'ii', ipa: 'iː', nhom: 'nguyen', noi: '[i]', tep: 'Close front unrounded vowel.ogg', tacGia: 'Denelson83',
    goiY: 'I căng, miệng bẹt sang hai bên. Trong từ thật nó còn DÀI hơn /ɪ/ rõ rệt; bản thu này đọc hai âm dài bằng nhau để nghe riêng chất giọng.', doi: ['i'] },
  { ma: 'i',  ipa: 'ɪ', nhom: 'nguyen', noi: '[ɪ]', tep: 'Near-close near-front unrounded vowel.ogg', tacGia: 'Denelson83',
    goiY: 'I lỏng, ngắn, hơi ngả về "ê". Không phải "i" tiếng Việt.', doi: ['ii'] },
  { ma: 'ae', ipa: 'æ', nhom: 'nguyen', noi: '[æ]', tep: 'Near-open front unrounded vowel.ogg', tacGia: 'Denelson83',
    goiY: 'Mở hàm to hẳn, lưỡi hạ thấp — nghe giữa "a" và "e".', doi: ['uh'] },
  { ma: 'uh', ipa: 'ə', nhom: 'nguyen', noi: '[ə]', tep: 'Mid-central vowel.ogg', tacGia: 'Denelson83',
    goiY: 'Ơ nhẹ, lướt qua, không nhấn. Là âm hay gặp nhất trong tiếng Anh.', doi: ['ae'] },
];

/* Mã âm trong bài sửa lỗi có khi khác mã bản thu: "l-toi" là /l/ cuối từ, nhưng bản thu chỉ có
   /l/ đầu và giữa âm tiết. Dùng tạm bản đó — tư thế lưỡi giống nhau, chỉ khác chỗ đứng. */
const DOI_MA = { 'l-toi': 'l' };

const BANG = {};
for (const a of DS) BANG[a.ma] = a;

function tim(ma) { return BANG[DOI_MA[ma] || ma] || null; }
function duongDan(ma, rieng) {
  const a = tim(ma);
  if (!a || (rieng && !a.cat)) return null;
  return THU_MUC + a.ma + (rieng ? '-rieng' : '') + '.mp3';
}
function nguon(ma) {
  const a = tim(ma);
  return a ? 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(a.tep.replace(/ /g, '_')) : null;
}
function tacGia() { return [...new Set(DS.map(a => a.tacGia))]; }

const api = { DS, BANG, DOI_MA, THU_MUC, GIAY_PHEP, DA_SUA, tim, duongDan, nguon, tacGia };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.TDTD_AMNGUOI = api;
})(typeof self !== 'undefined' ? self : this);

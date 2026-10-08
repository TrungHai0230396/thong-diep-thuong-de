/* Kiểm thử gợi ý cài app: node scripts/test-caiapp.js
   Nhận dạng đúng loại máy (mỗi loại một cách cài), và tự gợi ý đúng lúc, không làm phiền. */
const C = require('../assets/caiapp.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Nhận dạng máy —');
const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneSafari26: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
  ipadMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1',
  iphoneZalo: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/585 ZaloTheme/light ZaloLanguage/vi',
  iphoneFacebook: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.104;FBBV/612345678;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBLC/vi_VN]',
  iphoneMessenger: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/MessengerForiOS;FBAV/470.0.0.40.104]',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  androidFacebook: 'Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0.0.0.0;]',
  androidZalo: 'Mozilla/5.0 (Linux; Android 13; Redmi Note 12; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.0.0 Mobile Safari/537.36 Zalo android/12345 ZaloTheme/dark ZaloLanguage/vi',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};
const CA = [
  ['iPhone, Safari', UA.iphoneSafari, {}, 'iosSafari'],
  ['iPhone, Safari iOS 26 (chuỗi nhận dạng vẫn ghi 18_6)', UA.iphoneSafari26, {}, 'iosSafari'],
  ['iPad đời mới (tự xưng là Mac, màn cảm ứng)', UA.ipadMac, { chamDuoc: true }, 'iosSafari'],
  ['máy Mac thật (không cảm ứng) không bị nhầm là iPad', UA.ipadMac, { chamDuoc: false }, 'mayTinh'],
  ['iPhone, Chrome', UA.iphoneChrome, {}, 'iosKhac'],
  ['iPhone, mở link trong Zalo', UA.iphoneZalo, {}, 'trongAppIos'],
  ['iPhone, mở link trong Facebook', UA.iphoneFacebook, {}, 'trongAppIos'],
  ['iPhone, mở link trong Messenger', UA.iphoneMessenger, {}, 'trongAppIos'],
  ['Android, Chrome có hộp cài', UA.androidChrome, { coNhacCai: true }, 'nhacCai'],
  ['Android, trình duyệt chưa đưa hộp cài: hướng dẫn qua menu', UA.androidChrome, {}, 'androidTay'],
  ['Android, mở link trong Facebook (dù trình duyệt nhúng có hộp cài cũng không tính)', UA.androidFacebook, { coNhacCai: true }, 'trongAppAndroid'],
  ['Android, mở link trong Zalo', UA.androidZalo, {}, 'trongAppAndroid'],
  ['máy tính', UA.macChrome, {}, 'mayTinh'],
  ['máy tính Chrome có hộp cài', UA.macChrome, { coNhacCai: true }, 'nhacCai'],
  ['đã mở từ biểu tượng ngoài màn hình chính', UA.iphoneSafari, { standalone: true }, 'daCai'],
];
for (const [ten, ua, o, mong] of CA) ok(ten, C.loaiMay(ua, o) === mong, C.loaiMay(ua, o));

console.log('\n— Tự gợi ý đúng lúc, không làm phiền —');
const NGAY = 864e5, nay = Date.UTC(2026, 9, 8);
ok('lần đầu trên điện thoại: gợi ý', C.nenTuHien('iosSafari', null, nay));
ok('vừa gợi ý 3 ngày trước: thôi', !C.nenTuHien('iosSafari', { lan: 1, luc: nay - 3 * NGAY }, nay));
ok('gợi ý lần trước đã hơn 7 ngày: gợi ý lại', C.nenTuHien('nhacCai', { lan: 1, luc: nay - 8 * NGAY }, nay));
ok('đã gợi ý 3 lần: thôi hẳn', !C.nenTuHien('nhacCai', { lan: 3, luc: nay - 60 * NGAY }, nay));
ok('đã cài: không gợi ý nữa', !C.nenTuHien('iosSafari', { daCai: true }, nay));
ok('đang mở từ màn hình chính, hay đang ở máy tính: không tự gợi ý', !C.nenTuHien('daCai', null, nay) && !C.nenTuHien('mayTinh', null, nay));
ok('mở trong Zalo: vẫn gợi ý (để hướng dẫn mở bằng trình duyệt)', C.nenTuHien('trongAppIos', null, nay) && C.nenTuHien('trongAppAndroid', null, nay));

console.log('\n— Mở bằng Chrome từ Zalo, Facebook trên Android —');
const l = C.linkChrome('https://thong-diep-thuong-de.vercel.app/#ho-sen');
ok('link intent mở thẳng trang trong Chrome, bỏ phần sau dấu #', l.startsWith('intent://thong-diep-thuong-de.vercel.app/#Intent;scheme=https;package=com.android.chrome;'), l);
ok('máy không có Chrome thì quay về mở link thường', l.includes('S.browser_fallback_url=https%3A%2F%2Fthong-diep-thuong-de.vercel.app%2F;end'));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

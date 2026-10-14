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
  ['iPhone, Chrome (iOS 18): Chrome tự thêm vào màn hình chính được', UA.iphoneChrome, {}, 'iosKhac'],
  ['iPhone, Chrome trên iOS 16.3: chưa được, phải mở bằng Safari', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/112.0.5615.46 Mobile/15E148 Safari/604.1', {}, 'iosKhacCu'],
  ['iPhone, Chrome trên iOS 16.4: đã được', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/112.0.5615.46 Mobile/15E148 Safari/604.1', {}, 'iosKhac'],
  ['iPhone, Firefox trên iOS 15: phải mở bằng Safari', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/110.0 Mobile/15E148 Safari/605.1.15', {}, 'iosKhacCu'],
  ['iPhone, mở link trong Zalo', UA.iphoneZalo, {}, 'trongAppIos'],
  ['iPhone, mở link trong Facebook', UA.iphoneFacebook, {}, 'trongAppIos'],
  ['iPhone, mở link trong Messenger', UA.iphoneMessenger, {}, 'trongAppIos'],
  ['Android, Chrome có hộp cài', UA.androidChrome, { coNhacCai: true }, 'nhacCai'],
  ['Android, trình duyệt chưa đưa hộp cài: hướng dẫn qua menu', UA.androidChrome, {}, 'androidTay'],
  ['Android, mở link trong Facebook (dù trình duyệt nhúng có hộp cài cũng không tính)', UA.androidFacebook, { coNhacCai: true }, 'trongAppAndroid'],
  ['Android, mở link trong Zalo', UA.androidZalo, {}, 'trongAppAndroid'],
  ['máy tính', UA.macChrome, {}, 'mayTinh'],
  ['máy tính Chrome có hộp cài: vẫn là máy tính, không gợi ý (chỉ cho điện thoại)', UA.macChrome, { coNhacCai: true }, 'mayTinh'],
  ['máy tính Windows Edge có hộp cài: không gợi ý', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0', { coNhacCai: true }, 'mayTinh'],
  ['đã mở từ biểu tượng ngoài màn hình chính', UA.iphoneSafari, { standalone: true }, 'daCai'],
];
for (const [ten, ua, o, mong] of CA) ok(ten, C.loaiMay(ua, o) === mong, C.loaiMay(ua, o));

console.log('\n— Không tự bật —');
ok('không còn luật tự gợi ý: bảng chỉ mở khi người dùng bấm nút', !('nenTuHien' in C));

console.log('\n— Mở bằng Chrome từ Zalo, Facebook trên Android —');
const l = C.linkChrome('https://thong-diep-thuong-de.vercel.app/#ho-sen');
ok('link intent mở thẳng trang trong Chrome, bỏ phần sau dấu #', l.startsWith('intent://thong-diep-thuong-de.vercel.app/#Intent;scheme=https;package=com.android.chrome;'), l);
ok('máy không có Chrome thì quay về mở link thường', l.includes('S.browser_fallback_url=https%3A%2F%2Fthong-diep-thuong-de.vercel.app%2F;end'));


console.log('\n— Nút Chia sẻ ở đâu, "Thêm vào MH chính" nằm đâu — giống hệt Nhớ Nha —');
/* Người dùng: "làm giống project Nhớ Nha". Cùng chuỗi nhận dạng, cùng đáp án với nho-nha/src/lib/pwa.test.ts. */
const SAFARI_26 = UA.iphoneSafari26;
const SAFARI_18 = UA.iphoneSafari;
const CHROME_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.41 Mobile/15E148 Safari/604.1';
const FIREFOX_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/143.0 Mobile/15E148 Safari/605.1.15';
const EDGE_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/140.0.3485.94 Mobile/15E148 Safari/605.1.15';
const IPAD_26 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
const bang = (o) => JSON.stringify(o);
ok('Safari 26: Chia sẻ nằm trong ⋯, mục cài nằm sau "Xem thêm"', bang(C.cachChiaSe(SAFARI_26, false)) === bang({ nut: 'baCham', bang: 'xemThem' }), bang(C.cachChiaSe(SAFARI_26, false)));
ok('Safari cũ hơn 26: Chia sẻ ngay trên thanh dưới, kéo xuống tìm mục cài', bang(C.cachChiaSe(SAFARI_18, false)) === bang({ nut: 'thanhDuoi', bang: 'keo' }));
ok('Chrome: Chia sẻ ở góc trên, iOS nào cũng vậy; bảng có thể là kiểu nào', bang(C.cachChiaSe(CHROME_IOS, false)) === bang({ nut: 'tren', bang: 'caHai' }));
ok('trình duyệt khác: menu riêng của nó, kể cả Edge cũng ghi Version/', bang(C.cachChiaSe(FIREFOX_IOS, false)) === bang({ nut: 'menu', bang: 'caHai' }) &&
   bang(C.cachChiaSe(EDGE_IOS, false)) === bang({ nut: 'menu', bang: 'caHai' }));
ok('iPad: Chia sẻ ở góc trên', bang(C.cachChiaSe(IPAD_26, true)) === bang({ nut: 'tren', bang: 'xemThem' }));
ok('Safari không ghi phiên bản: theo kiểu mới nhất', bang(C.cachChiaSe('Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', false)) === bang({ nut: 'baCham', bang: 'caHai' }));
ok('nhận ra iPad tự xưng là Mac nhờ màn cảm ứng; máy Mac thật thì không', C.laIpad(IPAD_26, true) && !C.laIpad(IPAD_26, false) && C.laIpad('Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X)', false));

console.log('\n— Đang ở trong app nào, và lối ra trình duyệt thật —');
const TA = {
  facebookIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/FBIOS;FBDV/iPhone14,3;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBID/phone;FBLC/vi_VN]',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 13; SM-A536E Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/446.0.0.27.352;]',
  messengerIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/MessengerForiOS;FBAV/458.0.0.38.108;FBBV/586212345;FBDV/iPhone14,3]',
  messengerAndroid: 'Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.144 Mobile Safari/537.36 [FB_IAB/Orca-Android;FBAV/440.0.0.31.105;]',
  instagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 312.0.0.32.112 (iPhone14,3; iOS 17_5; vi_VN; vi; scale=3.00; 1170x2532; 548375166)',
  tiktok: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_34.1.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/vi Region/VN',
  zaloIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/507 ZaloTheme/light ZaloLanguage/vi',
  zaloAndroid: 'Mozilla/5.0 (Linux; Android 12; V2134) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/108.0.5359.128 Mobile Safari/537.36 Zalo/23.09.01 ZaloTheme/light',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
};
ok('gọi đúng tên Facebook trên cả hai loại máy', C.tenTrongApp(TA.facebookIos) === 'Facebook' && C.tenTrongApp(TA.facebookAndroid) === 'Facebook');
ok('gọi đúng Messenger dù chuỗi của nó mang dấu hiệu Facebook', C.tenTrongApp(TA.messengerIos) === 'Messenger' && C.tenTrongApp(TA.messengerAndroid) === 'Messenger');
ok('gọi đúng Instagram, TikTok, Zalo', C.tenTrongApp(TA.instagram) === 'Instagram' && C.tenTrongApp(TA.tiktok) === 'TikTok' && C.tenTrongApp(TA.zaloIos) === 'Zalo' && C.tenTrongApp(TA.zaloAndroid) === 'Zalo');
ok('để yên trình duyệt thật', C.tenTrongApp(SAFARI_26) === null && C.tenTrongApp(TA.chromeAndroid) === null && C.tenTrongApp(CHROME_IOS) === null);
ok('Messenger Android (Orca) cũng là trong app: không cài được, hướng dẫn mở bằng Chrome', C.loaiMay(TA.messengerAndroid, { coNhacCai: true }) === 'trongAppAndroid');
ok('iPhone: lối ra Safari là địa chỉ x-safari-https://, giữ nguyên địa chỉ', C.linkSafari('https://thong-diep-thuong-de.vercel.app/') === 'x-safari-https://thong-diep-thuong-de.vercel.app/' &&
   C.linkSafari('https://a.dev/luyen-phat-am/') === 'x-safari-https://a.dev/luyen-phat-am/');
ok('trang không phải https thì không có lối ra Safari', C.linkSafari('http://127.0.0.1:5179/') === null);

console.log('\n— Nhớ là máy đã cài —');
/* Đã cài thì Chrome thôi đưa hộp cài; bày các bước cài tay lúc đó là bắt đi tìm một mục menu không còn. */
ok('Android đã cài mà mở bằng Chrome: báo đã cài, không bày bước cài tay', C.loaiMay(TA.chromeAndroid, { daCaiNho: true }) === 'daCaiTrinhDuyet');
ok('Chrome lại đưa hộp cài (app đã bị gỡ): mời cài như thường', C.loaiMay(TA.chromeAndroid, { daCaiNho: true, coNhacCai: true }) === 'nhacCai');
console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);

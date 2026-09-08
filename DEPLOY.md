# Đưa lên Vercel

App là web tĩnh thuần, không cần build. Vercel chỉ việc phục vụ file.

Cấu hình đã có sẵn trong `vercel.json`: tắt cache cho `index.html`, `sw.js`, `data/` và `assets/` để mỗi lần deploy người dùng nhận ngay bản mới, cache dài cho `icons/`, cùng vài header bảo mật cơ bản.

## Cách 1 — Kéo thả, nhanh nhất, không cần cài gì

1. Mở https://vercel.com/new
2. Đăng nhập, chọn **Deploy** rồi kéo cả thư mục `thong-diep-thuong-de` thả vào ô upload.
3. Đợi khoảng 20 giây là có link dạng `ten-du-an.vercel.app`.

Hợp khi muốn xem thử ngay. Nhược điểm: lần sau sửa code lại phải kéo thả lại.

## Cách 2 — Dùng dòng lệnh (khuyến nghị)

Cần Node 18 trở lên. Máy này để mặc định Node 16 nên phải trỏ sang Node 24 trước.

```bash
export PATH=/Users/haiht1/.nvm/versions/node/v24.14.1/bin:$PATH
npm i -g vercel
```

Đăng nhập một lần:

```bash
vercel login
```

Deploy bản nháp để xem thử:

```bash
cd ~/Documents/Project/thong-diep-thuong-de
vercel
```

Lần đầu nó hỏi vài câu, trả lời như sau:

| Câu hỏi | Trả lời |
|---|---|
| Set up and deploy? | `y` |
| Which scope? | chọn tài khoản của bạn |
| Link to existing project? | `n` |
| What's your project's name? | `thong-diep-thuong-de` |
| In which directory is your code located? | `./` |
| Want to modify these settings? | `n` |

Ưng rồi thì đẩy lên bản chính thức:

```bash
vercel --prod
```

Từ lần sau, mỗi khi sửa code chỉ cần chạy lại `vercel --prod`.

## Cách 3 — Nối GitHub, tự deploy mỗi lần push

Hợp khi làm lâu dài, có lịch sử thay đổi rõ ràng.

1. Tạo một repository rỗng trên GitHub, ví dụ `thong-diep-thuong-de`, để trống, không thêm README.
2. Đẩy code lên:

```bash
cd ~/Documents/Project/thong-diep-thuong-de
git remote add origin https://github.com/<tên-của-bạn>/thong-diep-thuong-de.git
git branch -M main
git push -u origin main
```

3. Vào https://vercel.com/new, chọn **Import Git Repository**, chọn repo vừa tạo.
4. Ở phần Framework Preset chọn **Other**, để trống Build Command và Output Directory, bấm **Deploy**.

Từ đó mỗi lần `git push` là Vercel tự deploy lại.

## Sau khi deploy

- Mở link trên điện thoại, bấm Chia sẻ rồi **Thêm vào màn hình chính**. App chạy toàn màn hình và dùng được cả khi mất mạng.
- Muốn gắn tên miền riêng: vào Vercel, mở dự án, tab **Settings → Domains**, thêm tên miền rồi trỏ DNS theo hướng dẫn hiện ra.

## Lưu ý về service worker

`sw.js` cache toàn bộ app để chạy offline. Cấu hình đã đặt `must-revalidate` nên bản mới sẽ tới tay người dùng, nhưng thường phải **mở lại app một lần nữa** thì bản mới mới có hiệu lực. Đó là cách service worker hoạt động, không phải lỗi.

Nếu đổi nội dung 100 lá, nhớ đổi luôn số phiên bản ở dòng đầu `sw.js`:

```js
const V = 'tdtd-v2';   // đang là tdtd-v1
```

Đổi số này buộc trình duyệt bỏ cache cũ và tải lại toàn bộ.

## Những gì không được đẩy lên

`.vercelignore` loại `content/`, `scripts/` và các file hướng dẫn ra khỏi bản deploy. Chúng chỉ dùng lúc phát triển, không cần nằm trên máy chủ. Bản chạy thật chỉ gồm `index.html`, `assets/`, `data/`, `icons/`, `sw.js` và `manifest.webmanifest`, tổng cộng khoảng 60 KB.

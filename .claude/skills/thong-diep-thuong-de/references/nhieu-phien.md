# Nhiều phiên cùng sửa một thư mục: báo nhau, commit chỉ phần mình, nâng V, push, kiểm Vercel

Repo này thường có vài phiên Claude cùng làm trong đúng một thư mục (không worktree — máy hay thiếu chỗ đĩa để tạo
worktree, cần ≥ 5,4 GB trống). Tệp chung vì thế chứa hunk chưa commit của nhiều phiên cùng lúc.

## Báo vùng tệp

- Liệt kê phiên (`ListAgents`; không có thì công cụ list_sessions của app, gửi tới id `local_…`) → nhắn
  (`SendMessage`) các phiên đang **bận** có thể cùng repo: tệp mới của mình, và trong tệp chung thì
  chèn gì ở đâu. Trả lời tin họ gửi. Đã thống nhất thứ tự chèn (ai thêm trước, ai thêm ngay sau) thì giữ đúng.
- Tệp chung hay đụng nhau: `assets/app.js` (SAO, HINH_SAO), `index.html` (thẻ script), `sw.js` (dòng V, SHELL),
  `assets/app.css` (khối cuối), `scripts/test-sao.js` (TEP), `scripts/lam-trang-chia-se.py` (hàm vẽ, dòng TRO),
  `README.md` (mục trước `## Cấu trúc`, dòng trong Cấu trúc và Lệnh), `firebase-rules.json`, `scripts/fb-gia.js`.
- Đừng bao giờ `git add` nguyên một tệp chung, đừng `git checkout` / `git stash` tệp có phần của người khác.

## Chỉ commit, push khi người dùng bảo

Người dùng duyệt từng bước (commit một lần, push một lần). Không tự commit, không tự push.

## Stage chỉ phần của mình

1. `git fetch origin`, xem `git log --oneline -3`, `git log origin/main -1`, `git diff -U0 -- <tệp>` từng tệp chung để
   biết hunk nào của ai (`ban-do.py` in danh sách tệp chưa commit).
2. Tệp chỉ có phần mình (kiểm diff không có gì lạ) → dùng nguyên bản thư mục làm việc.
3. Tệp lẫn → dựng nội dung cần commit bằng một kịch bản Python, một trong hai cách:
   - **HEAD + dòng của mình**: `git show HEAD:<tệp>`, chèn đúng các dòng của mình (chép nguyên văn từ thư mục làm việc)
     vào sau một mốc duy nhất (assert `s.count(mốc) == 1`).
   - **Thư mục làm việc − dòng của người khác**: bỏ đúng các dòng/chuỗi của họ (ví dụ mọi dòng chứa `buonlau`,
     chuỗi `'assets/buonlau.js', ` trong SHELL).
   Rồi kiểm hai chiều bằng `difflib`: HEAD → bản sẽ commit chỉ có dòng của mình (không chữ nào của trò khác); bản sẽ
   commit → thư mục làm việc chỉ còn dòng của người khác (không sót dòng nào của mình). Với tệp chỉ có phần mình, bản
   dựng phải trùng từng byte với thư mục làm việc — phép đối chiếu miễn phí.
4. Stage nội dung đã dựng mà không đụng thư mục làm việc:
   `sha=$(git hash-object -w --stdin < bản_dựng)` rồi `git update-index --cacheinfo 100644,$sha,<tệp>` (trong Python:
   `subprocess.run(['git','hash-object','-w','--stdin'], input=…)`). Tệp mới: `git add <tệp>`. Tệp xoá:
   `git rm --cached <tệp>` — chỉ làm ngay trước khi commit; để lệnh xoá treo trong index thì phiên khác commit sẽ cuốn
   theo.
5. **V của sw.js**: số mới = lớn hơn cả `git show HEAD:sw.js` lẫn `git show origin/main:sw.js`, và chưa phiên nào báo
   đã nhận (đọc tin nhắn các phiên gửi; tìm được trong bản ghi các phiên thì tìm "tdtd-v<số>"). Ghi V mới vào **cả** bản stage **lẫn** sw.js ở thư mục làm việc (giữ nguyên phần SHELL của người khác) — không
   thì sau commit ai cũng thấy V "lùi" trong `git diff`. Không tăng V thì service worker cache-first không bao giờ đưa
   bản mới tới máy người dùng.
6. **Kiểm bản stage tự đứng được**:
   `git ls-files | grep -vE '^assets/(am|tu|traidat)/' > <scratchpad>/ds.txt` rồi
   `git checkout-index --prefix=<scratchpad>/ban-stage/ --stdin < <scratchpad>/ds.txt` (chừng 5 MB; mọi tệp tạm để
   trong scratchpad, đừng để rơi vào repo), vào đó chạy
   `scripts/test-sao.js` và bài kiểm của trò bằng Node 24. Bản stage không có trò dở dang của phiên khác nên test-sao
   phải qua hết.

## Lời commit

Viết vào một tệp (scratchpad) rồi `git commit -F <tệp>`. Dòng tiêu đề, **một dòng trống**, rồi thân — thiếu dòng
trống thì git gộp cả đoạn đầu vào tiêu đề.

```
Ngôi sao mới: <Tên> — <một vế nói trò làm gì>          ← hay "<Tên trò>: <đổi gì>" cho lần sửa

Người dùng: "<câu người dùng nói, nguyên văn>".

- <điểm chính 1>
- <điểm chính 2>
- <bài kiểm: N bài; thử phá N chỗ, bắt M>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

(Dòng `Co-Authored-By` theo hướng dẫn ghi công hiện hành của phiên; đổi nếu nhắc nhở hệ thống nói khác.)

Commit đã lên origin thì không amend, không rebase. Commit còn ở máy (chưa push) mà sai lời thì `git commit --amend
-F …` được, khi index đang trống.

## Push

1. `git fetch origin`. Mọi phiên dùng chung một nhánh `main` ở máy, nên origin hiếm khi đi trước HEAD (chỉ khi ai đó
   push từ chỗ khác). Nếu có: dừng lại, hỏi người dùng — đừng `rebase`, `pull`, `stash` trên thư mục làm việc đang lẫn
   hunk của người khác (rebase đòi cây sạch, `--autostash` cuốn cả phần của họ).
2. `git log --oneline origin/main..<sha>` chỉ được có commit của mình. Có commit của phiên khác nằm bên dưới (họ đã
   commit mà chưa được duyệt push) thì hỏi phiên đó và người dùng trước — push `<sha>` là đẩy cả chúng.
3. Push đúng commit của mình: `git push origin <sha>:main` (không phải `git push`, phòng khi có phiên vừa commit chồng
   lên trên).

## Kiểm Vercel sau khi push

Chừng một phút sau:

```bash
U=https://thong-diep-thuong-de.vercel.app
curl -s "$U/sw.js?t=$(date +%s)" | head -1                     # đúng V mới
for f in assets/app.js index.html <tệp của mình>; do
  a=$(curl -s "$U/$f?t=$(date +%s)" | shasum | cut -c1-12); b=$(git show <sha>:$f | shasum | cut -c1-12)
  echo "$f: $([ "$a" = "$b" ] && echo khớp || echo KHÁC)"; done
curl -s "$U/<thu-muc>/" | grep -o '<title>[^<]*</title>\|og:image" content="[^"]*"'
```

Dùng curl, đừng mở trang thật trong trình duyệt chỉ để kiểm (bộ đếm lượt truy cập sẽ đếm).

## Báo lại

Nhắn các phiên đang làm: mã commit, số V đã dùng, origin giờ ở đâu, số V tiếp theo, và chỗ nào trong tệp chung của họ
mình đã chừa nguyên. Nếu đổi một thứ dùng chung (thẻ `<base>`, cách định tuyến…), nói luôn có ảnh hưởng gì tới họ.

## Luật Firebase

`firebase-rules.json` là một văn bản duy nhất cho mọi nhánh (cờ, bida, buôn lậu…). Muốn đổi thì lấy bản đang chạy (hay
bản trong tệp, đã gồm phần của các phiên khác) cộng phần của mình — không bao giờ dán một bản cũ hơn. Người dùng xuất
bản (Firebase Console → Realtime Database → Rules); README ghi rõ "còn phải xuất bản" cho tới khi xong. Bài kiểm chạy
trên `scripts/fb-gia.js`, nên sửa luật thì sửa cả máy chủ giả.

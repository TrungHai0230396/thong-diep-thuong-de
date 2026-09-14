# Ghi chú: vẽ hình khẩu hình IPA (chưa làm xong)

Rút từ mã nguồn SVG thật trên Wikimedia, ngày 14/09/2026. Dùng cho lần làm tiếp theo.

## Năm lỗi của bản nháp cũ (đã bị chê "nhìn không hiểu gì")

1. **Lưỡi quá ít điểm neo.** File chuẩn dùng **27–30 điểm neo** cho riêng cái lưỡi
   (`Places_of_articulation.svg` path3143: ~30 đoạn Bézier bậc ba; `VocalTract.svg` path3015:
   đúng 27 điểm, đọc từ `sodipodi:nodetypes`). Dưới 15 điểm thì nhìn ra cục bột.
2. **Lưỡi quá bé so với đầu.** Chuẩn: khối lưỡi + hàm dưới chiếm **~37% bề rộng × ~46% chiều cao**
   của cả đầu.
3. **Tương phản màu quá yếu.** File gốc dùng #e6e6e6 cho lưỡi vs #ececec cho mô — chênh 6 bậc xám,
   quá ít cho người mới học. Phải cho lưỡi một màu riêng hẳn.
4. **Thiếu nhãn "alveolar ridge" (lợi).** Danh sách 17 nhãn chuẩn của Tavin KHÔNG có nó, phải tự thêm —
   mà với người Việt đây là chỗ quan trọng nhất (/t d s z n l/ đều ở đó).
5. Mặt phải **quay sang TRÁI** (đã xác minh trên cả hai file chuẩn).

## Bố cục chuẩn

- Vẽ trọn profile đầu–cổ, mặt cắt giữa. Không vẽ tai, tóc, mắt. Viền đầu chỉ một path kín.
- `VocalTract.svg` (378×400): đỉnh đầu y≈11, đáy cổ y≈390, môi ở x≈18 y≈185 (5% rộng, 47% cao).
- Khoang mũi dài gần bằng khoang miệng, không phải một khe nhỏ.
- Các bộ phận khác rất rẻ: vòm trên 12 điểm, viền đầu 18, vòm mềm 8, nắp thanh quản 4, dây thanh 6.

## Nhãn tối thiểu cho người Việt mới học (9 nhãn)

Lips · Teeth · **Alveolar ridge** · Hard palate · Soft palate (Velum) · Tongue tip · Tongue blade ·
Nasal cavity · Vocal cords.
Bỏ được ở mức A1: uvula, epiglottis, trachea, larynx, glottis, pharynx.

## Cách đánh dấu chỗ cấu âm — tài liệu chuẩn làm thế nào

- Cách áp đảo: **đánh số lên hình + chú giải bên ngoài**. `Places_of_articulation.svg` không có
  một mũi tên, chấm tròn hay vùng tô nào — chỉ 18 con số. Ưu điểm: dịch chú giải sang tiếng Việt
  mà không phải sửa SVG.
- `Plosives-t-d.svg` có sẵn marker mũi tên trong `<defs>` nhưng **không path nào dùng** — tác giả
  cân nhắc rồi bỏ. Chỗ tắc được thể hiện bằng **hình học chạm nhau**, không bằng ký hiệu.
- Huy hiệu tròn ghi **+ / −** để phân biệt hữu thanh / vô thanh trong cùng một hình.
- **Vùng trắng "âm bản"**: tô khoang khí màu trắng trên nền mô hồng — chỗ trắng hẹp lại chính là
  chỗ bị chặn. Đây là cách làm chỗ hẹp đọc được.
- Màu thật: mô `#e47872`, khoang khí `#ffffff`, viền `#000000` width 3 trên canvas 800×1000.

## Hình chính diện khuôn miệng — cần, và vì sao

**Sơ đồ nguyên âm về nguyên tắc KHÔNG thể hiện được độ tròn môi** (Wikipedia Vowel diagram: các
phân nhóm độ tròn "have no conventional mapping"). Muốn dạy /uː/ vs /iː/ thì **bắt buộc** phải có
hình chính diện hoặc mô tả riêng.

Chỉ cần **ba icon môi**, không cần 12: *spread* (/iː/) — *relaxed* (/ɜː/) — *rounded* (/ɔː/).

- Cần chính diện: /uː/ /ʊ/ /ɔː/ /ɒ/ (tròn) và /iː/ /ɪ/ (dẹt) — mặt cắt dọc của chúng gần giống nhau.
- Cần mặt cắt dọc: /t d s z n l/ (chạm lợi), /θ ð/ (lưỡi giữa răng), /k g/ (sau lưỡi chạm vòm mềm).
- Cần cả hai: /w/, /r/, /ʃ ʒ/.

Lưu ý dạy học: ship/sheep **không phân biệt bằng độ dài** mà bằng hai vị trí miệng khác hẳn nhau.

## Hình thang nguyên âm — mã public domain, dùng luôn

```xml
<svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
  <path stroke="#000" fill="none" stroke-width="4"
        d="M100,50H900V650H500zM500,50 700,650M233.333,250H900M366.667,450H900"/>
</svg>
```
Bốn góc: close-front (100,50) · close-back (900,50) · open-back (900,650) · open-front (500,650).
Cạnh trên 800, cạnh dưới 400 (đúng tỉ lệ 1:2), cao 600. Đường close-mid y=250, open-mid y=450.

Công thức dựng ở kích thước bất kỳ, `t` = độ mở 0→1:
`x_front = 100 + 400t` · `x_back = 900` · `y = 50 + 600t`

## Toạ độ 12 nguyên âm tiếng Anh (chuẩn hoá, X trước→sau, Y cao→thấp)

Nguồn: `RP_English_monophthongs_chart.svg`, dữ liệu Roach, Journal of the IPA tr. 242.

| IPA | X | Y |   | IPA | X | Y |
|---|---|---|---|---|---|---|
| iː | 0.055 | 0.044 | | ɔː | 0.971 | 0.417 |
| ɪ  | 0.303 | 0.191 | | ʊ  | 0.721 | 0.196 |
| e  | 0.008 | 0.566 | | uː | 0.829 | 0.046 |
| æ  | 0.029 | 0.864 | | ɜː | 0.497 | 0.499 |
| ʌ  | 0.475 | 0.790 | | ə  | 0.497 | 0.499 |
| ɑː | 0.861 | 0.967 | | ɒ  | 0.957 | 0.866 |

Dựng lại: `y = 50 + 600·Y` · `xL = 100 + 400·Y` · `x = xL + X·(900 − xL)`

**Bốn điều bất ngờ, đáng làm nội dung dạy:**
1. /ə/ và /ɜː/ nằm **đúng cùng một điểm** — chỉ khác độ dài và trọng âm, không khác chất âm.
2. /ə/ nằm **chính giữa** hình thang, là "nguyên âm trung tính" — dạy đầu tiên: thả lỏng hoàn toàn.
3. /e/ dính cạnh trước nhưng **thấp hơn hẳn** cardinal /e/ (Y=0.566), gần /ɛ/. Tài liệu Việt hay vẽ quá cao.
4. /ʌ/ ở X=0.475 tức **nằm giữa, không nằm sau**, dù tên IPA là "open-mid back".

## Giấy phép — chỗ này phải cẩn thận

| File | Giấy phép | Dùng lại |
|---|---|---|
| `Blank_vowel_trapezoid.svg` | **Public domain** (PD shape) | tự do tuyệt đối |
| `VocalTract.svg` | **CC BY 3.0** (Tavin) | được, chỉ cần ghi công |
| `Places_of_articulation.svg` | GFDL / CC BY-SA 3.0 | **share-alike** — bản phái sinh phải cùng giấy phép |

→ Đừng phái sinh từ `Places_of_articulation.svg` nếu không muốn nghĩa vụ share-alike lan vào app.
Dùng `VocalTract.svg` làm khung (chỉ ghi công), hoặc vẽ mới theo các con số trong ghi chú này.

## Chưa trả lời được

- Có nghiên cứu nào đo hình nào giúp người học hơn không — **không tìm ra**, đừng coi là đã có bằng chứng.
- BBC Learning English bị chặn, soundsofspeech.uiowa.edu là app JS nên không đọc được.

## Việc còn lại của phần luyện phát âm

- Chốt cách chấm điểm. Phép thử cho thấy Gemini nghe audio **bỏ sót phụ âm cuối bị rụng** —
  đúng lỗi số một của người Việt. Workflow tra Azure / cặp tối thiểu chưa kịp chạy xong.
- Vẽ lại khẩu hình theo ghi chú này (bản nháp v5 chỉ nằm ở thư mục tạm, đã mất).

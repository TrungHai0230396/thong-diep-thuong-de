#!/usr/bin/env python3
"""Kiểm các file tiếng người trong assets/am/ — nghe bằng máy đo, vì không ai ngồi nghe lại 32 file
mỗi lần sửa.

Dùng:  python3 scripts/kiem-am-nguoi.py              # kiểm assets/am/
       python3 scripts/kiem-am-nguoi.py <thư mục>    # kiểm một thư mục khác
Cần:   ffmpeg, numpy, node.   Thoát mã 1 nếu có mục trượt.

Vì sao có script này: lần chuyển đổi đầu tiên ra 22 file MP3 thì 18 file CÂM HẲN — bộ lọc chỉnh
âm lượng cần khoảng 3 giây tín hiệu, gặp file ngắn thì trả về im lặng — mà nhìn danh sách file thì
kích cỡ vẫn bình thường. Phép kiểm "file có tiếng không" ở dưới bắt đúng lỗi đó.

Mọi phép đo ở đây viết riêng, không dùng lại mã của scripts/lam-am-nguoi.py. Và mỗi phép đo đã được
thử trên một trường hợp BIẾT TRƯỚC đáp án (đo /s/ với /z/ phải ra /z/ rung hơn) trước khi được tin.

Hai chỗ đo không được, nói thẳng ra thay vì cho qua: /p/ với /b/, và /θ/ với /ð/ — khác biệt hữu
thanh của hai cặp này quá nhỏ trong bản thu, máy đo của tôi không tách được. Nhãn của chúng dựa vào
việc đây là file chuẩn của bài IPA trên Wikipedia, được nhiều người nghe qua.
"""
import json, os, subprocess, sys
import numpy as np
np.seterr(all='ignore')   # file câm cho ra 0/0; để phép kiểm báo trượt chứ đừng in cảnh báo

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THU_MUC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(GOC, 'assets', 'am')
SR = 16000
dat = truot = 0

def ok(ten, dung, them=''):
    global dat, truot
    if dung: dat += 1
    else: truot += 1
    print(('  ✓ ' if dung else '  ✗ ') + ten + (' — ' + them if them else ''))

def doc(duong):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)

def khung(x, ms=20):
    n = int(SR * ms / 1000)
    return [x[i:i + n] for i in range(0, len(x) - n + 1, n)]

def db(v): return 10 * np.log10(np.mean(v ** 2) + 1e-12)

def rung(seg):
    """Độ tuần hoàn: đỉnh tự tương quan chuẩn hoá ở chu kỳ giọng 80–300 Hz, sau khi lọc bỏ phần
    trên 1 kHz (nhiễu xát ở trên đó làm loãng phép đo). Hữu thanh: dây thanh rung đều nên sóng lặp."""
    X = np.fft.rfft(seg); f = np.fft.rfftfreq(len(seg), 1 / SR); X[f > 1000] = 0
    s = np.fft.irfft(X, len(seg)); s = s - s.mean()
    if np.sum(s ** 2) < 1e-12: return 0.0
    ac = np.correlate(s, s, 'full')[len(s) - 1:]; ac = ac / ac[0]
    return float(ac[SR // 300:SR // 80].max())

def trong_tam(seg):
    X = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) ** 2; f = np.fft.rfftfreq(len(seg), 1 / SR)
    return float((X * f).sum() / (X.sum() + 1e-12))

def formant(duong):
    """LPC (Levinson–Durbin) trên 120 ms giữa nguyên âm, rồi lấy các đỉnh của đường bao phổ.
    Đo ở 10 kHz với bậc 12 (quy tắc quen: bậc = số kHz + 2). Chạy ở 16 kHz mà giữ bậc 12 thì đường
    bao thiếu bậc, đỉnh giả chen vào: lần đầu nó đo F1 của /ɪ/ ra 2260 Hz."""
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', '10000', '-f', 'f32le', '-'],
                       capture_output=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64); SR = 10000; P = 12
    g = len(x) // 2; n = int(SR * .12); s = x[max(0, g - n // 2):g + n // 2]
    s = s * np.hamming(len(s)); s = np.append(s[0], s[1:] - .63 * s[:-1])
    r = np.array([np.dot(s[:len(s) - k], s[k:]) for k in range(P + 1)])
    a = np.zeros(P + 1); a[0] = 1; e = r[0]
    for i in range(1, P + 1):
        k = (r[i] - np.dot(a[1:i], r[i - 1:0:-1])) / e
        a2 = a.copy(); a2[i] = k; a2[1:i] = a[1:i] - k * a[i - 1:0:-1]; a = a2; e *= (1 - k * k)
    f = np.arange(150, 3600, 10); w = 2 * np.pi * f / SR
    env = 1 / np.abs(np.array([1 - np.sum(a[1:] * np.exp(-1j * wi * np.arange(1, P + 1))) for wi in w]))
    return [int(f[i]) for i in range(1, len(env) - 1) if env[i] > env[i - 1] and env[i] >= env[i + 1]][:3]

DS = json.loads(subprocess.run(['node', '-e', "console.log(JSON.stringify(require('./assets/amnguoi.js').DS))"],
                               cwd=GOC, capture_output=True, text=True, check=True).stdout)
BANG = {a['ma']: a for a in DS}

print('\n— Đủ file, không thừa file —')
can = {a['ma'] + '.mp3' for a in DS} | {a['ma'] + '-rieng.mp3' for a in DS if a.get('cat')}
co = {f for f in os.listdir(THU_MUC) if f.endswith('.mp3')} if os.path.isdir(THU_MUC) else set()
ok('mỗi âm đăng ký đều có file', can <= co, ', '.join(sorted(can - co)))
ok('không có file nào nằm đó mà không đăng ký', co <= can, ', '.join(sorted(co - can)))
ok('có ghi nguồn và giấy phép cạnh file', os.path.exists(os.path.join(THU_MUC, 'NGUON.md')) or THU_MUC != os.path.join(GOC, 'assets', 'am'))
if not can <= co:
    print(f'\n{dat} đạt, {truot} trượt'); sys.exit(1)

X = {f[:-4]: doc(os.path.join(THU_MUC, f)) for f in sorted(can)}

print('\n— File nào cũng có tiếng, không vỡ tiếng —')
cam = [k for k, x in X.items() if len(x) == 0 or max(db(v) for v in khung(x)) < -30]
ok('không file nào câm', not cam, ', '.join(cam))
vo = [k for k, x in X.items() if len(x) and np.mean(np.abs(x) > .99) > .001]
ok('không file nào bị cắt đỉnh', not vo, ', '.join(vo))
dai = [k for k, x in X.items() if not ((.1 <= len(x) / SR <= .5) if k.endswith('-rieng') else (.4 <= len(x) / SR <= 3))]
ok('độ dài hợp lý (âm tiết 0,4–3 giây, "chỉ âm" 0,1–0,5 giây)', not dai,
   ', '.join(f'{k} {len(X[k]) / SR:.2f}s' for k in dai))

print('\n— Bản "chỉ âm" cắt đúng chỗ —')
for a in DS:
    if not a.get('cat'): continue
    m, d, c = a['ma'], *a['cat']
    x, y = X[m], X[m + '-rieng']
    # 1. bản cắt phải KHỚP với đúng đoạn [d, c] của file đầy đủ — bắt lỗi cắt nhầm file, nhầm chỗ
    i0 = int(d * SR); best, lech = -1.0, 0
    for s in range(-int(.05 * SR), int(.05 * SR) + 1, 8):
        j = i0 + s
        if j < 0 or j + len(y) > len(x): continue
        z = x[j:j + len(y)]
        r = float(np.dot(z, y) / (np.linalg.norm(z) * np.linalg.norm(y) + 1e-12))
        if r > best: best, lech = r, s
    # 2. đoạn đó là PHỤ ÂM chứ không lấn vào nguyên âm, và ngay sau mốc cắt thì nguyên âm bật lên.
    #    Âm rít (s, z, ʃ) to gần bằng nguyên âm nên không so độ to được; nhận nó bằng phổ: năng
    #    lượng dồn trên 2,5 kHz, trong khi nguyên âm [a] dồn dưới 1,5 kHz.
    lon = np.percentile([db(v) for v in khung(x)], 95)
    doan = x[int(d * SR):int(c * SR)]
    ben = db(doan)
    sau = max(db(v) for v in khung(x[int(c * SR):int((c + .08) * SR)], 10))
    P = np.abs(np.fft.rfft(doan * np.hanning(len(doan)))) ** 2; fq = np.fft.rfftfreq(len(doan), 1 / SR)
    cao = float(P[fq > 2500].sum() / (P.sum() + 1e-12))
    phu = cao > .6 if m in ('s', 'z', 'sh') else ben < lon - 3
    ok(f'/{a["ipa"]}/ cắt đúng chỗ, chỉ có phụ âm', best > .8 and phu and sau > ben + 4,
       f'khớp {best:.2f} lệch {lech / SR * 1000:+.0f}ms, đoạn cắt {ben:.0f} dB'
       + (f' ({cao:.0%} năng lượng trên 2,5 kHz)' if m in ('s', 'z', 'sh') else f', nguyên âm {lon:.0f} dB')
       + f', ngay sau mốc {sau:.0f} dB')

print('\n— Nhãn của file đúng là âm đó: đo lại, không tin mô tả trên Commons —')
R = {m: rung(X[m + '-rieng']) for m in ('s', 'z', 'sh', 'f', 'v', 'th', 'dh', 'm', 'n', 'l')}
for vo_, huu in (('s', 'z'), ('f', 'v')):
    ok(f'/{BANG[huu]["ipa"]}/ rung dây thanh, /{BANG[vo_]["ipa"]}/ thì không', R[huu] > R[vo_] + .2,
       f'độ tuần hoàn {R[vo_]:.2f} với {R[huu]:.2f}')
ok('âm mũi và /l/ đều rung', all(R[m] > .5 for m in ('m', 'n', 'l')), ' '.join(f'{m} {R[m]:.2f}' for m in ('m', 'n', 'l')))
ok('/s/ và /ʃ/ không rung', R['s'] < .4 and R['sh'] < .4, f"s {R['s']:.2f}, ʃ {R['sh']:.2f}")
ts, tsh = trong_tam(X['s-rieng']), trong_tam(X['sh-rieng'])
ok('/s/ rít cao hơn /ʃ/ (lưỡi ở trước hơn)', ts > tsh + 1000, f'trọng tâm phổ /s/ {ts:.0f} Hz, /ʃ/ {tsh:.0f} Hz')
F = {m: formant(os.path.join(THU_MUC, m + '.mp3')) for m in ('ii', 'i', 'ae', 'uh')}
f1 = {m: (F[m] + [0, 0])[0] for m in F}; f2 = {m: (F[m] + [0, 0])[1] for m in F}   # file câm: không có đỉnh nào
ok('nguyên âm: F2 giảm dần iː > ɪ > æ > ə (lưỡi lùi dần)', f2['ii'] > f2['i'] > f2['ae'] > f2['uh'],
   ' '.join(f'{BANG[m]["ipa"]} {f2[m]}' for m in F))
ok('nguyên âm: F1 thấp nhất ở iː, cao nhất ở æ (hàm mở nhất)',
   f1['ii'] < min(f1[m] for m in f1 if m != 'ii') and f1['ae'] > max(f1[m] for m in f1 if m != 'ae'), ' '.join(f'{BANG[m]["ipa"]} {f1[m]}' for m in F))
print('  · không đo được, không tính: /p/ với /b/, /θ/ với /ð/ — xem đầu file')

print(f'\n{dat} đạt, {truot} trượt')
sys.exit(1 if truot else 0)

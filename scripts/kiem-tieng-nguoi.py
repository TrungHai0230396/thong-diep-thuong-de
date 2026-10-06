#!/usr/bin/env python3
"""Kiểm mọi file tiếng người của ngôi sao luyện phát âm — bằng máy đo, vì không ai ngồi nghe lại
~700 file mỗi lần sửa.

Dùng:  python3 scripts/kiem-tieng-nguoi.py            # kiểm assets/am và assets/tu
       python3 scripts/kiem-tieng-nguoi.py --nghe     # thêm: cho máy nghe lại từng file từ (cần faster-whisper)
       python3 scripts/kiem-tieng-nguoi.py --thu-muc X # kiểm một bản sao ở chỗ khác (để thử bộ kiểm)
Cần:   ffmpeg, numpy, node.  Thoát mã 1 nếu có mục trượt.

Vì sao có script này: lần chuyển đổi đầu tiên ra 22 file MP3 thì 18 file CÂM HẲN, mà nhìn danh sách
thì kích cỡ file vẫn bình thường. Phép "file có tiếng không" ở dưới bắt đúng lỗi đó.
Mọi phép đo viết riêng ở đây, không dùng lại mã của scripts/lam-tieng-nguoi.py — dùng chung mã thì
làm sai chỗ nào, kiểm cũng sai y chỗ đó. Và mỗi phép đo đã thử trên chỗ biết trước đáp án: tráo file
/iː/ với /ɑː/, /ʃ/ với /m/, thay một file bằng im lặng — bộ kiểm phải trượt, và nó trượt.
"""
import json, os, re, subprocess, sys
import numpy as np
np.seterr(all='ignore')

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = sys.argv[1:]
THU_MUC = args[args.index('--thu-muc') + 1] if '--thu-muc' in args else GOC
NGHE = '--nghe' in args
SR = 16000
dat = truot = 0

def ok(ten, dung, them=''):
    global dat, truot
    if dung: dat += 1
    else: truot += 1
    print(('  ✓ ' if dung else '  ✗ ') + ten + (' — ' + them if them else ''))

def doc(duong, sr=SR):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)

def khung_db(x, ms=20):
    n = int(SR * ms / 1000); m = len(x) // n
    if m == 0: return np.array([-120.0])
    return 10 * np.log10(np.mean(x[:m * n].reshape(m, n) ** 2, axis=1) + 1e-12)

def rung(seg):
    """Độ tuần hoàn ở chu kỳ giọng 80–300 Hz, sau khi lọc bỏ trên 1 kHz. Hữu thanh thì sóng lặp lại."""
    X = np.fft.rfft(seg); f = np.fft.rfftfreq(len(seg), 1 / SR); X[f > 1000] = 0
    s = np.fft.irfft(X, len(seg)); s = s - s.mean()
    if np.sum(s ** 2) < 1e-12: return 0.0
    ac = np.correlate(s, s, 'full')[len(s) - 1:]; ac = ac / ac[0]
    return float(ac[SR // 300:SR // 80].max())

def formant(duong):
    """F1, F2 ở khung to nhất (giữa nguyên âm). LPC bậc 12 ở 10 kHz — đã thử: chạy 16 kHz mà giữ bậc 12
    thì đường bao thiếu bậc, đo F1 của /ɪ/ ra 2260 Hz."""
    sr, P = 10000, 12
    x = doc(duong, sr)
    H = int(sr * .02); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
    if not len(e) or e.max() < 1e-4: return [0, 0]
    g = int(np.argmax(e)) * H + H // 2; n = int(sr * .06)
    s = x[max(0, g - n // 2):g + n // 2]
    s = s * np.hamming(len(s)); s = np.append(s[0], s[1:] - .63 * s[:-1])
    r = np.array([np.dot(s[:len(s) - k], s[k:]) for k in range(P + 1)])
    a = np.zeros(P + 1); a[0] = 1; ee = r[0]
    for i in range(1, P + 1):
        k = (r[i] - np.dot(a[1:i], r[i - 1:0:-1])) / ee
        a2 = a.copy(); a2[i] = k; a2[1:i] = a[1:i] - k * a[i - 1:0:-1]; a = a2; ee *= (1 - k * k)
    f = np.arange(150, 3600, 10); w = 2 * np.pi * f / sr
    env = 1 / np.abs(np.array([1 - np.sum(a[1:] * np.exp(-1j * wi * np.arange(1, P + 1))) for wi in w]))
    dinh = [int(f[i]) for i in range(1, len(env) - 1) if env[i] > env[i - 1] and env[i] >= env[i + 1]]
    return (dinh + [0, 0])[:2]

nap = "const A=require('./assets/amnguoi.js'),T=require('./assets/tunguoi.js');console.log(JSON.stringify({am:A.DS,tu:T.TU,ipa:T.IPA}))"
R = json.loads(subprocess.run(['node', '-e', nap], cwd=GOC, capture_output=True, text=True, check=True).stdout)
AM = {a['ma']: a for a in R['am']}
duong = lambda f: os.path.join(THU_MUC, f.split('?')[0])     # bỏ dấu nội dung ?v=... của đường dẫn

print('\n— Đủ file, không thừa, có ghi công —')
can = {b['f'].split('?')[0] for a in R['am'] for b in a['am']} | {b['f'].split('?')[0] for v in R['tu'].values() for b in v}
co = {f'assets/{d}/{f}' for d in ('am', 'tu') if os.path.isdir(duong('assets/' + d)) for f in os.listdir(duong('assets/' + d)) if f.endswith('.mp3')}
ok('mọi file khai báo đều có', can <= co, ', '.join(sorted(can - co))[:300])
ok('không có file nào nằm đó mà không khai báo', co <= can, ', '.join(sorted(co - can))[:300])
ok('có file ghi nguồn cạnh mỗi thư mục', all(os.path.exists(duong(f'assets/{d}/NGUON.md')) for d in ('am', 'tu')))
ok('mỗi bản thu đều ghi người đọc, giấy phép, link bản gốc',
   all(b.get('tacGia') and b.get('giayPhep') and b.get('nguon', '').startswith('https://commons.wikimedia.org/wiki/File:')
       for a in R['am'] for b in a['am']) and
   all(b.get('tacGia') and b.get('giayPhep') and b.get('nguon', '').startswith('https://commons.wikimedia.org/wiki/File:')
       for v in R['tu'].values() for b in v))
CHO_PHEP = {'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY 3.0 us', 'CC BY 2.5', 'CC BY-SA 2.5', 'CC0', 'Public domain'}
xau = sorted(({b['giayPhep'] for a in R['am'] for b in a['am']} | {b['giayPhep'] for v in R['tu'].values() for b in v}) - CHO_PHEP)
ok('không giấy phép nào cấm sửa hay cấm dùng thương mại', not xau, ', '.join(xau))
if not can <= co:
    print(f'\n{dat} đạt, {truot} trượt'); sys.exit(1)

print('\n— File nào cũng có tiếng, không vỡ, độ dài hợp lý —')
X = {f: doc(duong(f)) for f in sorted(can)}
import hashlib
dau = {}
for a in R['am']:
    for b in a['am']: dau.setdefault(hashlib.md5(open(duong(b['f']), 'rb').read()).hexdigest(), set()).add(b['nguon'])
for v in R['tu'].values():
    for b in v: dau.setdefault(hashlib.md5(open(duong(b['f']), 'rb').read()).hexdigest(), set()).add(b['nguon'])
trung = [sorted(v) for v in dau.values() if len(v) > 1]
ok('hai bản gốc khác nhau không ra cùng một file (lỗi tên hoa/thường trên macOS)', not trung, str(trung[:3]))
dauf = [b['f'] for a in R['am'] for b in a['am']] + [b['f'] for v in R['tu'].values() for b in v]
saiDau = [f for f in dauf if '?v=' not in f or hashlib.md5(open(duong(f), 'rb').read()).hexdigest()[:8] != f.split('?v=')[1]]
ok('đường dẫn mang đúng dấu nội dung của file (để bộ nhớ đệm không phát bản cũ)', not saiDau, ', '.join(saiDau[:5]))
cam = [f for f, x in X.items() if not len(x) or khung_db(x).max() < -30]
ok(f'không file nào câm ({len(X)} file)', not cam, ', '.join(cam[:8]))
vo = [f for f, x in X.items() if len(x) and np.mean(np.abs(x) > .99) > .002]
ok('không file nào bị cắt đỉnh', not vo, ', '.join(vo[:8]))
dai = [f for f, x in X.items() if not (.2 <= len(x) / SR <= (7 if '/am/' in f else 3.5))]
ok('độ dài hợp lý (từ 0,2–3,5 giây; âm 0,2–7 giây)', not dai, ', '.join(f'{f} {len(X[f]) / SR:.2f}s' for f in dai[:8]))
to = {f: float(np.percentile(khung_db(x), 95)) for f, x in X.items()}
lech = [f for f, v in to.items() if abs(v - np.median(list(to.values()))) > 9]
ok('các file to ngang nhau (lệch dưới 9 dB so với trung vị)', not lech, ', '.join(f'{f} {to[f]:.0f} dB' for f in lech[:8]))

print('\n— Nhãn đúng là âm đó: đo lại, không tin mô tả trên Commons —')
F = {m: formant(duong(AM[m]['am'][0]['f'])) for m in ('ii', 'e', 'aa', 'o', 'oo', 'er') if AM.get(m) and AM[m]['am']}
f1 = {m: v[0] for m, v in F.items()}; f2 = {m: v[1] for m, v in F.items()}
thu = ['ii', 'e', 'er', 'aa', 'o', 'oo']
ok('F2 giảm dần iː > e > ɜː > ɑː > ɒ > ɔː (lưỡi lùi dần về sau)', all(f2[a] > f2[b] for a, b in zip(thu, thu[1:])),
   ' '.join(f"{AM[m]['ipa']} {f2[m]}" for m in thu))
ok('F1 tăng dần iː < e < ɑː (hàm mở dần), ɔː thấp hơn ɑː', f1['ii'] < f1['e'] < f1['aa'] and f1['oo'] < f1['aa'] and f1['ii'] > 0,
   ' '.join(f"{AM[m]['ipa']} {f1[m]}" for m in thu))
def dai_phe(x):
    """Từng khung 20 ms đủ to (trong 30 dB so với khung to nhất): tỉ lệ năng lượng dưới 500 Hz
    (dây thanh rung thì dồn ở đây) và trên 2,5 kHz (tiếng xát dồn ở đây).
    Bản đầu đo bằng độ tuần hoàn trên CẢ file thì trượt: đoạn lặng hai đầu có tiếng ù điện 120 Hz,
    tuần hoàn rất đều, làm /ʃ/ đo ra "rung" 0,61."""
    H = int(SR * .02); ra = []
    for i in range(0, len(x) - H, H):
        s = x[i:i + H]; P = np.abs(np.fft.rfft(s * np.hanning(H))) ** 2; fq = np.fft.rfftfreq(H, 1 / SR)
        ra.append((10 * np.log10(np.mean(s ** 2) + 1e-12), P[(fq > 80) & (fq < 500)].sum() / (P.sum() + 1e-12), P[fq > 2500].sum() / (P.sum() + 1e-12)))
    mx = max(r[0] for r in ra)
    return [r for r in ra if r[0] > mx - 30]
k_sh, k_m, k_s = (dai_phe(X[AM[m]['am'][0]['f'].split('?')[0]]) for m in ('sh', 'm', 's'))
xat_sh = [r for r in k_sh if r[2] > .3]
ok('/ʃ/ ("shh") là tiếng xát không rung', len(xat_sh) >= 5 and np.mean([r[1] for r in xat_sh]) < .03,
   f"{len(xat_sh)} khung xát, dải thấp {np.mean([r[1] for r in xat_sh]) if xat_sh else -1:.2f}")
ok('/m/ ("mmm") rung, năng lượng dồn dưới 500 Hz', np.mean([r[1] for r in k_m]) > .8, f"dải thấp {np.mean([r[1] for r in k_m]):.2f}")
xat_s = [r for r in k_s if r[2] > .5]
ok('/s/ ("hiss") có đoạn rít không rung', len(xat_s) >= 5 and np.mean([r[1] for r in xat_s]) < .05,
   f"{len(xat_s)} khung rít, dải thấp {np.mean([r[1] for r in xat_s]) if xat_s else -1:.2f}")

print('\n— Phiên âm —')
thieu = [w for w in R['tu'] if w not in R['ipa']]
ok('từ nào có tiếng cũng có phiên âm', not thieu, ', '.join(thieu))
la = [(w, p) for w, v in R['ipa'].items() for p in v if not re.fullmatch(r'/[a-zæɑɒɔəɜɝɚʌɪʊθðʃʒŋː ˈ]+/', p or '') or re.search('[ɛɹɡ.ˌ͡]', p or '')]
ok('phiên âm theo lối từ điển người học (e không ɛ, r không ɹ, không dấu chấm, không dấu nối)', not la, str(la[:5]))
mot = [(w, p) for w, v in R['ipa'].items() for p in v if 'ˈ' in p and len(re.findall('[iɪeæɑɒɔəɜɝɚʌʊuoa]+ː?', p)) <= 1]
ok('từ một âm tiết không ghi dấu trọng âm', not mot, str(mot[:5]))

if NGHE:
    print('\n— Máy nghe lại từng file từ (faster-whisper small.en) —')
    from faster_whisper import WhisperModel
    mo = WhisperModel('small.en', device='cpu', compute_type='int8')
    # Chỉ nhận đúng từ đó, hoặc từ đồng âm THẬT trong content/dong-am.json. Bản trước nhận luôn chữ
    # mà máy nghe ra lúc chọn — nên một bản "ship" mà máy nghe thành "sheep" vẫn lọt qua.
    DONG = {k: set(v) for k, v in json.load(open(os.path.join(GOC, 'content', 'dong-am.json'))).items() if k != '_'}
    # bản giọng Anh máy nghe sai vì không đọc r cuối, đã kiểm bằng đo formant: xem content/chap-nhan.json
    CHAP = {k for k in json.load(open(os.path.join(GOC, 'content', 'chap-nhan.json'))) if k != '_'}
    sai = []
    for w, v in R['tu'].items():
        for b in v:
            # temperature=0: tắt chế độ "chưa chắc thì đoán ngẫu nhiên lại" — để cùng một file lần nào
            # chạy cũng ra cùng một chữ (có lúc nó nghe "box" thành "bux" chỉ vì lượt đoán ngẫu nhiên)
            seg, _ = mo.transcribe(duong(b['f']), language='en', beam_size=5, condition_on_previous_text=False, temperature=0)
            nghe = re.sub(r'[^a-z0-9 ]', '', ' '.join(s.text for s in seg).lower()).strip()
            tep = b['nguon'].split('File:', 1)[-1].replace('_', ' ')
            if nghe != w and nghe not in DONG.get(w, set()) and tep not in CHAP: sai.append(f'{b["f"]} nghe "{nghe}"')
    ok('mọi file từ sau khi cắt gọt vẫn nghe ra đúng từ', not sai, '; '.join(sai[:6]))

print(f'\n{dat} đạt, {truot} trượt')
sys.exit(1 if truot else 0)

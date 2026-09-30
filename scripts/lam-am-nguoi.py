#!/usr/bin/env python3
"""Làm ra assets/am/*.mp3 từ bản thu gốc trên Wikimedia Commons.

Dùng:  python3 scripts/lam-am-nguoi.py <thư mục chứa file .ogg gốc>
       (file gốc đặt tên theo mã âm — s.ogg, sh.ogg... — hoặc giữ nguyên tên trên Commons)
Cần:   ffmpeg, numpy, node

Những gì script này SỬA so với bản gốc (giấy phép CC BY-SA 3.0 bắt phải nói rõ):
  1. cắt khoảng lặng ở hai đầu, trộn về một kênh
  2. chỉnh âm lượng: đỉnh về -3 dBFS, để mọi âm to ngang nhau
  3. đổi sang MP3 96 kbps (một file .ogg gốc có khi 130 KB, MP3 còn khoảng 25 KB, và Safari cũ
     không phát được .ogg)
  4. bản "-rieng": cắt đúng đoạn phụ âm ở đầu âm tiết (mốc `cat` trong assets/amnguoi.js), vuốt
     15 ms ở hai đầu cho khỏi tiếng tách, rồi nâng âm lượng — âm /θ/ gốc nhỏ hơn /s/ tới 25 dB,
     để nguyên thì không nghe thấy gì.

Script này chỉ LÀM. Kiểm tra là việc của scripts/kiem-am-nguoi.py, viết riêng và không dùng lại
mã ở đây — dùng chung mã thì làm sai chỗ nào, kiểm cũng sai y chỗ đó.
"""
import json, os, subprocess, sys, tempfile
import numpy as np

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RA = os.path.join(GOC, 'assets', 'am')
SR = 44100

def so_dang_ky():
    ma = "const A=require('./assets/amnguoi.js');console.log(JSON.stringify(A.DS))"
    return json.loads(subprocess.run(['node', '-e', ma], cwd=GOC, capture_output=True, text=True, check=True).stdout)

def doc_pcm(duong, loc=None):
    lenh = ['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', str(SR)]
    if loc: lenh += ['-af', loc]
    lenh += ['-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(lenh, capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)

def ghi_mp3(x, duong):
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        t.write(x.astype(np.float32).tobytes()); t.flush()
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', t.name,
                        '-c:a', 'libmp3lame', '-b:a', '96k', duong], check=True)

def vuot(x, ms=15):
    n = min(len(x) // 2, int(SR * ms / 1000))
    if n:
        w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
        x = x.copy(); x[:n] *= w; x[-n:] *= w[::-1]
    return x

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    thu_muc = sys.argv[1]
    os.makedirs(RA, exist_ok=True)
    CAT_LANG = ('silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05,areverse,'
                'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,areverse')
    for a in so_dang_ky():
        goc = next((p for p in (os.path.join(thu_muc, a['ma'] + '.ogg'), os.path.join(thu_muc, a['tep']))
                    if os.path.exists(p)), None)
        if not goc:
            print('THIẾU bản gốc:', a['ma'], a['tep']); sys.exit(1)
        x = doc_pcm(goc, CAT_LANG)
        x = x * (10 ** (-3 / 20) / np.abs(x).max())                    # đỉnh về -3 dBFS
        ghi_mp3(vuot(x, 5), os.path.join(RA, a['ma'] + '.mp3'))
        dong = f"{a['ma']:3} {len(x) / SR:.2f}s"
        if a.get('cat'):
            d, c = a['cat']
            y = vuot(x[int(d * SR):int(c * SR)])
            rms = np.sqrt(np.mean(y ** 2))
            g = min(10 ** (-20 / 20) / rms, 10.0)                        # RMS về -20 dBFS, nâng tối đa 20 dB
            g = min(g, 0.89 / np.abs(y).max())                           # nhưng đỉnh không quá -1 dBFS
            ghi_mp3(y * g, os.path.join(RA, a['ma'] + '-rieng.mp3'))
            dong += f"  chỉ âm {c - d:.2f}s, nâng {20 * np.log10(g):+.1f} dB"
        print(dong)

if __name__ == '__main__':
    main()

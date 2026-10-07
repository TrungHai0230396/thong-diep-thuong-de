#!/usr/bin/env python3
"""Thêm bản thu NGƯỜI THẬT cho những từ mới vào content/tu-nguoi.json (và phiên âm vào content/tu-ipa.json).

Dùng:  python3 scripts/them-tu-nguoi.py leap wife wipe --cap leaf/leap wife/wipe cuff/cup
       rồi chạy python3 scripts/lam-tieng-nguoi.py để dựng mp3.
Cần:   ffmpeg, numpy, và faster-whisper (pip install faster-whisper) để máy nghe lại từng bản thu.
       Thiếu faster-whisper thì script dừng: không có máy nghe lại thì không biết bản thu đọc đúng từ.

Cách chọn (đúng như lần dựng bộ hiện có — trước đây nằm ở thư mục tạm và đã mất khi máy khởi động lại):
  1. ứng viên: các tệp {{audio|en|...}} trên trang Wiktionary của từ, cộng tên tệp của những người đọc
     Lingua Libre đã biết giọng (Back ache, Vealhurl, Wodencafe...), cộng En-uk-/En-us- trên Commons
  2. giấy phép phải cho sửa và dùng lại (CC0, PD, CC BY, CC BY-SA); loại tệp trong content/loai.json
  3. đo: không vỡ tiếng, đủ to so với ồn nền, dài 0,25–4 giây; máy nghe lại (faster-whisper, temperature 0)
     phải ra đúng từ, hoặc từ đồng âm thật trong content/dong-am.json, hoặc tệp đã kiểm tay ở content/chap-nhan.json
  4. mỗi từ giữ tối đa 4 người đọc khác nhau; ưu tiên người cũng đọc từ kia của cặp (--cap) — bài luyện
     tai phải đọc hai từ của một cặp bằng CÙNG một người, không thì giọng lộ đáp án
"""
import hashlib, json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.parse
import numpy as np

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'ThongDiepThuongDe/1.0 (https://thong-diep-thuong-de.vercel.app; educational)'
TAM = os.path.join(tempfile.gettempdir(), 'tdtd-them-tu')
DUOC = {'CC BY-SA 3.0', 'CC BY-SA 4.0', 'CC BY 3.0', 'CC BY 4.0', 'CC BY 3.0 us', 'CC BY 2.5', 'CC BY-SA 2.5', 'CC0', 'Public domain'}
# người đọc Lingua Libre đã biết giọng (học từ nhãn a=... trên Wiktionary)
LL = {'Back ache': 'Anh', 'Vealhurl': 'Anh', 'Wodencafe': 'Mỹ', 'Naomi Persephone Amethyst (NaomiAmethyst)': 'Mỹ',
      'Persent101': 'Mỹ', 'Grendelkhan': 'Mỹ', 'Flame, not lame': 'Mỹ', 'AnotherFriendlyHuman': 'Mỹ'}
NHOM_GIONG = {'us': 'Mỹ', 'ga': 'Mỹ', 'genam': 'Mỹ', 'general american': 'Mỹ', 'california': 'Mỹ',
              'uk': 'Anh', 'rp': 'Anh', 'ssb': 'Anh', 'southern england': 'Anh', 'london': 'Anh', 'received pronunciation': 'Anh',
              'au': 'Úc', 'ca': 'Canada'}

def hoi(url, params, lan=0):
    q = url + '?' + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(urllib.request.Request(q, headers={'User-Agent': UA}), timeout=40) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 429 and lan < 6: time.sleep(4 + 4 * lan); return hoi(url, params, lan + 1)
        raise

def doc_json(ten, mac_dinh=None):
    p = os.path.join(GOC, 'content', ten)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else mac_dinh

def chuan_tep(t):
    t = t.replace('_', ' ').strip()
    return t[:1].upper() + t[1:]

def nguoi_cua(tep, tac_gia):
    m = re.match(r'LL-Q1860 \(eng\)-(.+)-[^-]+\.(wav|ogg|flac)$', tep)
    if m: return re.sub(r'\s*\([^)]*\)$', '', m.group(1)).strip()
    if tep.lower().startswith('en-uk-') and 'Shtooka' in (tac_gia or ''): return 'Judith Franck'
    return tac_gia

def sach_tac_gia(s):
    m = re.search(r'Speaker:\s*([^\n]+?)(?:\s*Recorder:|$)', s or '')
    s = m.group(1) if m else (s or '')
    m2 = re.search(r'No machine-readable author provided\. (.+?) assumed', s)
    if m2: s = m2.group(1)
    s = re.sub(r'~commonswiki$', '', s.strip())
    return re.sub(r'\s*\(([^)]+)\)\s*$', '', re.sub(r'\s+', ' ', s)).strip()[:80]

def ung_vien(tu):
    """{từ: {tệp: nhãn giọng}} — từ Wiktionary và từ tên tệp của người đọc đã biết."""
    ra = {w: {} for w in tu}
    for i in range(0, len(tu), 40):
        d = hoi('https://en.wiktionary.org/w/api.php', {'action': 'query', 'prop': 'revisions', 'rvprop': 'content',
                 'rvslots': 'main', 'titles': '|'.join(tu[i:i + 40]), 'format': 'json', 'formatversion': 2})
        for p in d['query']['pages']:
            txt = p.get('revisions', [{}])[0].get('slots', {}).get('main', {}).get('content', '')
            m = re.search(r'==English==(.*?)(?:\n==[^=]|\Z)', txt, re.S)
            for t in re.finditer(r'\{\{audio\|en\|([^|}]+)(?:\|([^}]*))?\}\}', m.group(1) if m else ''):
                if 'text=' in (t.group(2) or ''): continue            # vd "a sheep": không phải đọc riêng từ đó
                a = re.search(r'a=([^|}]+)', t.group(2) or '')
                g = NHOM_GIONG.get(a.group(1).split(',')[0].strip().lower()) if a else None
                ra.setdefault(p['title'], {})[chuan_tep(t.group(1))] = g
        time.sleep(1)
    for w in tu:
        for sp, g in LL.items(): ra[w].setdefault(f'LL-Q1860 (eng)-{sp}-{w}.wav', g)
        ra[w].setdefault(chuan_tep(f'En-uk-{w}.ogg'), 'Anh'); ra[w].setdefault(chuan_tep(f'En-us-{w}.ogg'), 'Mỹ')
    return ra

def thong_tin(teps):
    meta = {}
    teps = sorted(teps)
    for i in range(0, len(teps), 45):
        d = hoi('https://commons.wikimedia.org/w/api.php', {'action': 'query', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|user',
                 'titles': '|'.join('File:' + t for t in teps[i:i + 45]), 'format': 'json', 'formatversion': 2})
        for p in d['query']['pages']:
            if 'missing' in p or 'imageinfo' not in p: continue
            ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
            g = lambda k: re.sub('<[^>]+>', '', m.get(k, {}).get('value', '')).strip()
            meta[p['title'][5:]] = {'url': ii['url'], 'giayPhep': g('LicenseShortName'), 'tacGia': sach_tac_gia(g('Artist')) or ii.get('user', '')}
        time.sleep(1)
    return meta

def do(duong):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', duong, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True)
    x = np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)
    if len(x) < 1600: return None
    H = 320; e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)]) + 1e-9
    db = 20 * np.log10(e)
    return {'giay': len(x) / 16000, 'snr': float(np.percentile(db, 95) - np.percentile(db, 10)), 'vo': float(np.mean(np.abs(x) > .985))}

def main():
    if '--' in ' '.join(sys.argv[1:2]) or len(sys.argv) < 2: print(__doc__); sys.exit(2)
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print('Cần faster-whisper để máy nghe lại bản thu: pip install faster-whisper'); sys.exit(2)
    a = sys.argv[1:]
    cap = [c.split('/') for c in a[a.index('--cap') + 1:]] if '--cap' in a else []
    tu = [w.lower() for w in (a[:a.index('--cap')] if '--cap' in a else a)]
    M = doc_json('tu-nguoi.json', {})
    dong = {k: set(v) for k, v in doc_json('dong-am.json', {}).items() if k != '_'}
    loai = {chuan_tep(k) for k in doc_json('loai.json', {}) if k != '_'}
    chap = {chuan_tep(k) for k in doc_json('chap-nhan.json', {}) if k != '_'}
    os.makedirs(TAM, exist_ok=True)
    mo = WhisperModel('small.en', device='cpu', compute_type='int8')
    uv = ung_vien(tu)
    meta = thong_tin({t for v in uv.values() for t in v})
    dat = {}
    for w in tu:
        for t, g in uv[w].items():
            k = meta.get(t)
            if not k or k['giayPhep'] not in DUOC or t in loai: continue
            nguoi = nguoi_cua(t, k['tacGia'])
            if not g: g = LL.get(next((sp for sp in LL if t.startswith(f'LL-Q1860 (eng)-{sp}-')), ''), None)
            if not g: continue                                       # không biết giọng gì thì bỏ
            duong = os.path.join(TAM, hashlib.sha1(k['url'].encode()).hexdigest()[:12] + '-' + re.sub(r'[^A-Za-z0-9._-]', '_', t))
            if not os.path.exists(duong):
                with urllib.request.urlopen(urllib.request.Request(k['url'], headers={'User-Agent': UA}), timeout=60) as r:
                    open(duong, 'wb').write(r.read())
                time.sleep(.5)
            d = do(duong)
            if not d or d['snr'] < 18 or d['vo'] > .003 or not (.25 <= d['giay'] <= 4): continue
            seg, _ = mo.transcribe(duong, language='en', beam_size=5, condition_on_previous_text=False, temperature=0)
            nghe = ' '.join(s.text for s in seg).strip()
            n = re.sub(r'[^a-z0-9 ]', '', nghe.lower()).strip()
            if n != w and n not in dong.get(w, set()) and t not in chap:
                print(f'  loại {t}: máy nghe ra "{nghe}"'); continue
            dat.setdefault(w, []).append({'tep': t, 'url': k['url'], 'giayPhep': k['giayPhep'], 'tacGia': k['tacGia'] or nguoi,
                                          'giong': g, 'nghe': nghe, 'snr': round(d['snr'], 1), 'nguoi': nguoi})
    # chọn: ưu tiên người cũng đọc từ kia của cặp
    ban = {}
    for x, y in cap: ban.setdefault(x, set()).add(y); ban.setdefault(y, set()).add(x)
    nguoi_tu = lambda w: {b['nguoi'] for b in dat.get(w, []) + M.get(w, [])}
    for w, ds in dat.items():
        ds.sort(key=lambda u: (-sum(u['nguoi'] in nguoi_tu(p) for p in ban.get(w, ())),
                               {'Mỹ': 0, 'Anh': 1, 'Úc': 2, 'Canada': 3}[u['giong']], -u['snr']))
        chon, da = [], set()
        for u in ds:
            if u['nguoi'] not in da: chon.append(u); da.add(u['nguoi'])
        M[w] = chon[:4]
        print(w, [(b['nguoi'], b['giong']) for b in M[w]])
    for x, y in cap:
        chung = {b['nguoi'] for b in M.get(x, [])} & {b['nguoi'] for b in M.get(y, [])}
        print(f'  cặp {x}/{y}: người đọc chung {sorted(chung) or "KHÔNG CÓ"}')
    thieu = [w for w in tu if not M.get(w)]
    if thieu: print('KHÔNG có bản thu đạt cho:', thieu)
    json.dump(dict(sorted(M.items())), open(os.path.join(GOC, 'content', 'tu-nguoi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    them_ipa([w for w in tu if M.get(w)])

def them_ipa(tu):
    """Phiên âm: Anh-Anh theo Britfone, Anh-Mỹ theo CMUdict — cùng cách với bộ hiện có. Từ nào hai từ điển
    không có thì in ra để thêm tay."""
    I = doc_json('tu-ipa.json', {})
    can = [w for w in tu if w not in I]
    if not can: return
    bf = os.path.join(TAM, 'britfone.csv'); cm = os.path.join(TAM, 'cmudict.dict')
    for url, p in [('https://raw.githubusercontent.com/JoseLlarena/Britfone/master/britfone.main.3.0.1.csv', bf),
                   ('https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict', cm)]:
        if not os.path.exists(p): open(p, 'wb').write(urllib.request.urlopen(url, timeout=60).read())
    NGUYEN = ['iː', 'ɪ', 'e', 'æ', 'ʌ', 'ɑː', 'ɒ', 'ɔː', 'ʊ', 'uː', 'ɜː', 'ə', 'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə',
              'i', 'u', 'oʊ', 'ɝː', 'ɚ']
    ONSET = set('p b t d k g f v θ ð s z ʃ ʒ h tʃ dʒ m n l r w j'.split()) | {
        'pl', 'pr', 'pj', 'bl', 'br', 'tr', 'tw', 'dr', 'kl', 'kr', 'kw', 'gl', 'gr', 'fl', 'fr', 'θr', 'sl', 'sm', 'sn',
        'sp', 'st', 'sk', 'sw', 'spl', 'spr', 'str', 'skr', 'skw'}
    def trong_am(ph):
        vt = [i for i, (p, n) in enumerate(ph) if p in NGUYEN]
        if len(vt) <= 1: return ''.join(p for p, _ in ph)
        chen = {}
        for k, i in enumerate(vt):
            if ph[i][1] not in (1, 2): continue
            dau = vt[k - 1] + 1 if k else 0; phu = [p for p, _ in ph[dau:i]]; j = 0
            while j < len(phu) and ''.join(phu[j:]) not in ONSET: j += 1
            chen[dau + j] = 'ˈ' if ph[i][1] == 1 else 'ˌ'
        return ''.join(chen.get(i, '') + p for i, (p, _) in enumerate(ph))
    anh = {}
    for ln in open(bf, encoding='utf-8'):
        if ',' not in ln: continue
        w, pr = ln.split(',', 1); w = w.strip().lower()
        if w in anh or '(' in w: continue
        ph, nhan = [], None
        for t in pr.split():
            if t[0] in 'ˈˌ': nhan = 1 if t[0] == 'ˈ' else 2; t = t[1:]
            if not t: continue
            t = {'ɛ': 'e', 'ɛə': 'eə', 'ɐ': 'ʌ', 'ɛː': 'eə'}.get(t, t).replace('ɹ', 'r').replace('ɡ', 'g')
            ph.append((t, nhan if t in NGUYEN else None))
            if t in NGUYEN: nhan = None
        anh[w] = '/' + trong_am(ph) + '/'
    A = {'AA': 'ɑː', 'AE': 'æ', 'AO': 'ɔː', 'AW': 'aʊ', 'AY': 'aɪ', 'EH': 'e', 'EY': 'eɪ', 'IH': 'ɪ', 'IY': 'iː', 'OW': 'oʊ',
         'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'uː', 'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'F': 'f', 'G': 'g', 'HH': 'h', 'JH': 'dʒ',
         'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r', 'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v',
         'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ'}
    my = {}
    for ln in open(cm, encoding='utf-8'):
        p = ln.split('#')[0].split()
        if not p or '(' in p[0] or p[0] in my: continue
        ph = []
        for t in p[1:]:
            m = re.match(r'([A-Z]+)(\d)?$', t); g, n = m.group(1), m.group(2)
            v = ('ə' if n == '0' else 'ʌ') if g == 'AH' else ('ɚ' if n == '0' else 'ɝː') if g == 'ER' else A[g]
            ph.append((v, int(n) if n else None))
        my[p[0].lower()] = '/' + trong_am(ph) + '/'
    for w in can:
        if w in anh and w in my: I[w] = {'anh': anh[w], 'my': my[w]}; print('phiên âm', w, I[w])
        else: print('THIẾU phiên âm, thêm tay vào content/tu-ipa.json:', w)
    json.dump(dict(sorted(I.items())), open(os.path.join(GOC, 'content', 'tu-ipa.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()

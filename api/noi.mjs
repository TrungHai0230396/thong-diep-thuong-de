/* Hàm cho chế độ "nói tự do" của trò tập nói tiếng Anh.

   Vì sao có file này: khoá Gemini KHÔNG được nằm trong mã chạy ở trình duyệt. Repo này công khai,
   trang web cũng công khai, nhét khoá vào JS là ai mở trang cũng đọc được. Từ tháng 9/2026 Google
   còn chặn thẳng: khoá mới đều gắn với service account và request từ khoá Standard bị từ chối.
   Khoá nằm ở biến môi trường GEMINI_API_KEY trên Vercel, chỉ hàm này đọc được.

   Đuôi .mjs là bắt buộc: dự án này không có framework và không có package.json, mà tài liệu Vercel
   ghi rõ khi đó phải dùng .mjs hoặc khai "type":"module". Giữ .mjs để khỏi phải thêm package.json —
   thêm vào là Vercel chạy npm install mỗi lần deploy, mất tính "không build" của app.

   Chưa đặt khoá thì trả 503 kèm mã 'chua-cau-hinh', app tự lui về hai cách chơi kia. */

const MODEL = 'gemini-3.5-flash-lite';   // đo được 1,1 giây một lượt, rẻ nhất trong nhóm đủ tốt
const API = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const TOI_DA_CHU = 240;        // câu người học nói dài nhất nhận
const TOI_DA_LUOT = 14;        // chỉ gửi lại chừng này lượt gần nhất, khỏi phình token
const TOI_DA_PHUT = 20;        // mỗi IP chừng này lượt một phút

/* Đếm thô theo IP. Hàm serverless hay bị dựng lại nên bộ đếm này không chắc chắn, chỉ để chặn
   bấm liên tục. Hàng rào thật thì Hobby không có, nên phần đắt nhất đã chặn sẵn bằng maxOutputTokens. */
const dem = new Map();
function quaTay(ip) {
  const nay = Math.floor(Date.now() / 60000);
  const o = dem.get(ip);
  if (!o || o.phut !== nay) { dem.set(ip, { phut: nay, so: 1 }); return false; }
  o.so++;
  if (dem.size > 500) dem.clear();
  return o.so > TOI_DA_PHUT;
}

const LOI = {
  type: 'object',
  properties: {
    say: { type: 'string' },   // câu người kia nói, tiếng Anh
    vi:  { type: 'string' },   // bản dịch tiếng Việt
    fix: { type: 'string' },   // câu người học vừa nói, viết lại cho đúng; đúng rồi thì để trống
    tip: { type: 'string' },   // một mẹo ngắn bằng tiếng Việt, không có thì để trống
    xong: { type: 'boolean' }, // đã tới chỗ kết thúc tự nhiên chưa
  },
  required: ['say', 'vi', 'fix', 'tip', 'xong'],
};

/* Lời dặn cho model để ở đây chứ không ở trình duyệt: người dùng không sửa được thành chuyện khác,
   và muốn đổi cách dạy thì chỉ sửa một chỗ. */
const loiDan = (canh) => [
  `You are ${canh.ai || 'a friendly person'} in this situation: ${canh.canh || 'a simple everyday conversation'}.`,
  'You are talking with a Vietnamese beginner learning English at CEFR A1 level.',
  'Rules you must never break:',
  '- Use only A1 vocabulary and simple present or simple past. No idioms, no phrasal verbs, no slang.',
  '- Every reply is ONE sentence, at most 10 words.',
  '- Almost always end with a simple question so the learner can answer.',
  '- Stay in the situation. Never talk about being an AI. Never write Vietnamese in the "say" field.',
  '- If the learner\'s sentence has a mistake, put the natural corrected sentence in "fix". If it was fine, leave "fix" empty.',
  '- "tip" is at most one short sentence in Vietnamese explaining the mistake, or empty when there is none.',
  '- Never scold. Keep the tone warm and slow.',
  '- Set "xong" to true only when the conversation has reached a natural goodbye.',
].join('\n');

const dap = (o, ma = 200) => new Response(JSON.stringify(o), {
  status: ma,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function POST(request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return dap({ loi: 'chua-cau-hinh' }, 503);

  // Chỉ nhận lời gọi từ chính trang này. Không phải hàng rào thật (header giả được), nhưng chặn được người lười.
  const goc = request.headers.get('origin');
  const chu = request.headers.get('host') || '';
  if (goc && chu && !goc.endsWith(chu)) return dap({ loi: 'khac-nguon' }, 403);

  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'khong-ro';
  if (quaTay(ip)) return dap({ loi: 'nhanh-qua' }, 429);

  let than;
  try { than = await request.json(); } catch (e) { return dap({ loi: 'than-hong' }, 400); }
  if (!than || typeof than !== 'object') return dap({ loi: 'than-hong' }, 400);

  const noi = String(than.noi || '').slice(0, TOI_DA_CHU).trim();
  const canh = than.canh && typeof than.canh === 'object' ? than.canh : {};
  const truoc = Array.isArray(than.truoc) ? than.truoc.slice(-TOI_DA_LUOT) : [];

  const contents = truoc
    .filter(l => l && typeof l.chu === 'string')
    .map(l => ({ role: l.vai === 'minh' ? 'user' : 'model', parts: [{ text: String(l.chu).slice(0, TOI_DA_CHU) }] }));
  contents.push({ role: 'user', parts: [{ text: noi || '(the learner said nothing)' }] });

  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: loiDan(canh) }] },
        contents,
        generationConfig: {
          temperature: 0.8, maxOutputTokens: 300,
          responseMimeType: 'application/json', responseSchema: LOI,
        },
        safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH',
          'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']
          .map(category => ({ category, threshold: 'BLOCK_MEDIUM_AND_ABOVE' })),
      }),
    });

    if (!r.ok) return dap({ loi: 'google-tu-choi', ma: r.status, chiTiet: (await r.text()).slice(0, 300) }, 502);

    const d = await r.json();
    const chuTraLoi = d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let o;
    try { o = JSON.parse(chuTraLoi); } catch (e) { return dap({ loi: 'tra-loi-hong' }, 502); }

    return dap({
      say: String(o.say || '').slice(0, 300),
      vi: String(o.vi || '').slice(0, 300),
      fix: String(o.fix || '').slice(0, 300),
      tip: String(o.tip || '').slice(0, 300),
      xong: !!o.xong,
    });
  } catch (e) {
    return dap({ loi: 'khong-goi-duoc' }, 502);
  }
}

export function GET() { return dap({ loi: 'chi-nhan-post' }, 405); }

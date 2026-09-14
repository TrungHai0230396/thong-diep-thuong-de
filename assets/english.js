/* Học nói tiếng Anh A1 — mỗi cảnh là một việc thật ngoài đời: người ta nói trước, bạn chọn câu
   đáp trong ba câu. Chọn sai thì được nói cho biết vì sao sai rồi chọn lại — không điểm, không
   đếm giờ, không lưu gì xuống máy.

   Mức A1 theo khung CEFR: chào hỏi, tự giới thiệu, hỏi đáp thông tin cá nhân đơn giản, mua bán,
   hỏi đường, gọi món. Câu ngắn, thì hiện tại, từ vựng thông dụng.

   Giọng đọc lấy từ bộ đọc có sẵn của trình duyệt (Web Speech), không nhúng file tiếng nào.
   Thêm cảnh mới chỉ cần thêm một mục vào mảng CANH, không phải sửa gì khác. */
(() => {
'use strict';

const CANH = [
  { id: 'gap-lan-dau', ten: 'Gặp lần đầu', ai: 'Anna', moTa: 'Chào hỏi, hỏi tên, hỏi quê', hinh: '👋',
    boi: 'You just met the learner at a language club. Small talk: names, where you are from, job, age.',
    luot: [
      { ho: "Hi! My name is Anna. What's your name?", hoVi: 'Chào! Mình tên Anna. Bạn tên gì?',
        meo: '"My name is…" là câu tự giới thiệu tên, dùng được ở mọi chỗ.',
        chon: [
          { en: "Hi Anna. My name is Nam.", vi: 'Chào Anna. Mình tên Nam.', dung: true },
          { en: "I'm fine, thank you.", vi: 'Mình khỏe, cảm ơn.', viSao: 'Câu này để đáp "How are you?", không phải để nói tên.' },
          { en: "Yes, please.", vi: 'Vâng, làm ơn.', viSao: 'Câu này để nhận lời mời, ở đây người ta đang hỏi tên bạn.' } ] },
      { ho: "Where are you from, Nam?", hoVi: 'Nam từ đâu tới?',
        meo: '"I\'m from + tên nước / tên thành phố".',
        chon: [
          { en: "I'm from Vietnam.", vi: 'Mình từ Việt Nam.', dung: true },
          { en: "I'm twenty-two years old.", vi: 'Mình hai mươi hai tuổi.', viSao: 'Đó là trả lời câu hỏi tuổi, không phải hỏi quê.' },
          { en: "I live in a big house.", vi: 'Mình sống trong một căn nhà to.', viSao: 'Người ta hỏi bạn từ đâu tới, không hỏi nhà bạn thế nào.' } ] },
      { ho: "Nice to meet you!", hoVi: 'Rất vui được gặp bạn!',
        meo: 'Người kia nói "Nice to meet you", bạn đáp lại thêm chữ "too".',
        chon: [
          { en: "Nice to meet you too.", vi: 'Mình cũng rất vui được gặp bạn.', dung: true },
          { en: "You're welcome.", vi: 'Không có gì.', viSao: 'Câu này chỉ dùng khi ai đó cảm ơn bạn.' },
          { en: "I'm sorry.", vi: 'Mình xin lỗi.', viSao: 'Không có gì để xin lỗi ở đây cả.' } ] },
      { ho: "What do you do?", hoVi: 'Bạn làm nghề gì?',
        meo: '"What do you do?" là hỏi **nghề nghiệp**, không phải hỏi bạn đang làm gì lúc này.',
        chon: [
          { en: "I'm a student.", vi: 'Mình là sinh viên.', dung: true },
          { en: "I'm doing my homework.", vi: 'Mình đang làm bài tập.', viSao: 'Đó là trả lời "What are you doing?" — đang làm gì lúc này.' },
          { en: "It's ten o'clock.", vi: 'Mười giờ rồi.', viSao: 'Đó là trả lời giờ giấc.' } ] },
      { ho: "I have to go now. See you tomorrow!", hoVi: 'Mình phải đi rồi. Mai gặp nhé!',
        meo: '"See you" là câu chào tạm biệt thân mật, ngắn gọn.',
        chon: [
          { en: "See you tomorrow. Bye!", vi: 'Mai gặp nhé. Tạm biệt!', dung: true },
          { en: "Good morning.", vi: 'Chào buổi sáng.', viSao: 'Đó là câu chào lúc mới gặp, không phải lúc chia tay.' },
          { en: "How much is it?", vi: 'Cái này bao nhiêu tiền?', viSao: 'Câu hỏi giá tiền, không liên quan.' } ] } ] },

  { id: 'ca-phe', ten: 'Mua cà phê', ai: 'Người bán', moTa: 'Gọi đồ uống, hỏi giá, trả tiền', hinh: '☕',
    boi: 'You work at the counter of a small cafe. The learner is ordering a drink and paying.',
    luot: [
      { ho: "Good morning! What can I get you?", hoVi: 'Chào buổi sáng! Bạn dùng gì ạ?',
        meo: 'Gọi đồ chỉ cần "A + món + please". Thêm "please" cho lịch sự.',
        chon: [
          { en: "A coffee, please.", vi: 'Cho mình một cà phê.', dung: true },
          { en: "I'm from Vietnam.", vi: 'Mình từ Việt Nam.', viSao: 'Người ta hỏi bạn muốn uống gì.' },
          { en: "See you later.", vi: 'Hẹn gặp lại.', viSao: 'Bạn vừa mới vào quán mà.' } ] },
      { ho: "Small or large?", hoVi: 'Cỡ nhỏ hay cỡ lớn?',
        meo: 'Câu hỏi chọn một trong hai thì đáp thẳng lựa chọn, không đáp "yes" hay "no".',
        chon: [
          { en: "Small, please.", vi: 'Cỡ nhỏ ạ.', dung: true },
          { en: "Yes, I do.", vi: 'Vâng, có.', viSao: 'Câu hỏi cho hai lựa chọn thì không trả lời "yes" được.' },
          { en: "At seven o'clock.", vi: 'Lúc bảy giờ.', viSao: 'Đó là trả lời câu hỏi mấy giờ.' } ] },
      { ho: "Anything else?", hoVi: 'Bạn dùng gì thêm không?',
        meo: '"That\'s all" = hết rồi, chỉ vậy thôi.',
        chon: [
          { en: "No, thank you. That's all.", vi: 'Không, cảm ơn. Vậy thôi ạ.', dung: true },
          { en: "You're welcome.", vi: 'Không có gì.', viSao: 'Câu này chỉ dùng để đáp lại lời cảm ơn.' },
          { en: "I don't know.", vi: 'Mình không biết.', viSao: 'Bạn biết mình muốn gì mà, câu này nghe lạ.' } ] },
      { ho: "That's three dollars.", hoVi: 'Hết ba đô ạ.',
        meo: '"Here you are" là câu nói khi đưa tiền hay đưa đồ cho ai đó.',
        chon: [
          { en: "Here you are.", vi: 'Của bạn đây.', dung: true },
          { en: "How are you?", vi: 'Bạn khỏe không?', viSao: 'Người ta đang chờ bạn trả tiền.' },
          { en: "Nice to meet you.", vi: 'Rất vui được gặp bạn.', viSao: 'Câu này để làm quen, không dùng lúc trả tiền.' } ] },
      { ho: "Thank you. Have a nice day!", hoVi: 'Cảm ơn bạn. Chúc một ngày tốt lành!',
        meo: '"You too" = chúc bạn cũng vậy. Ngắn mà rất hay dùng.',
        chon: [
          { en: "Thank you. You too!", vi: 'Cảm ơn. Bạn cũng vậy nhé!', dung: true },
          { en: "I'm sorry.", vi: 'Mình xin lỗi.', viSao: 'Không có gì để xin lỗi.' },
          { en: "Excuse me.", vi: 'Cho mình hỏi.', viSao: '"Excuse me" dùng để bắt chuyện hoặc xin đi nhờ.' } ] } ] },

  { id: 'hoi-duong', ten: 'Hỏi đường', ai: 'Người đi đường', moTa: 'Hỏi chỗ, nghe chỉ đường, cảm ơn', hinh: '🚏',
    boi: 'You are a passer-by on the street. The learner asks you the way to a bus stop or a station.',
    luot: [
      { ho: "Hello!", hoVi: 'Chào bạn!',
        meo: 'Muốn hỏi người lạ thì mở đầu bằng "Excuse me" cho lịch sự.',
        chon: [
          { en: "Excuse me, where is the bus stop?", vi: 'Cho mình hỏi, trạm xe buýt ở đâu ạ?', dung: true },
          { en: "How much is it?", vi: 'Cái này bao nhiêu tiền?', viSao: 'Bạn đang cần hỏi đường chứ không mua gì.' },
          { en: "A coffee, please.", vi: 'Cho mình một cà phê.', viSao: 'Đây không phải quán nước.' } ] },
      { ho: "Go straight, then turn left.", hoVi: 'Đi thẳng, rồi rẽ trái.',
        meo: 'Nhắc lại lời chỉ đường là cách kiểm tra mình nghe đúng chưa.',
        chon: [
          { en: "Go straight and turn left. OK, thank you.", vi: 'Đi thẳng rồi rẽ trái. Vâng, cảm ơn ạ.', dung: true },
          { en: "Yes, I am.", vi: 'Vâng, đúng vậy.', viSao: 'Người ta đang chỉ đường chứ không hỏi bạn câu nào.' },
          { en: "It's ten dollars.", vi: 'Hết mười đô.', viSao: 'Không liên quan tới chuyện đường đi.' } ] },
      { ho: "It's next to the bank.", hoVi: 'Nó nằm cạnh ngân hàng.',
        meo: '"Is it far?" = có xa không. Câu cực ngắn mà đi đâu cũng dùng được.',
        chon: [
          { en: "Is it far?", vi: 'Có xa không ạ?', dung: true },
          { en: "How old are you?", vi: 'Bạn bao nhiêu tuổi?', viSao: 'Hỏi tuổi người lạ giữa đường là chuyện khác hẳn.' },
          { en: "I'm from Hanoi.", vi: 'Mình từ Hà Nội.', viSao: 'Người ta không hỏi bạn từ đâu tới.' } ] },
      { ho: "No, five minutes on foot.", hoVi: 'Không, đi bộ năm phút thôi.',
        meo: 'Thêm "very much" để lời cảm ơn thành thật hơn.',
        chon: [
          { en: "Thank you very much.", vi: 'Cảm ơn bạn nhiều.', dung: true },
          { en: "You're welcome.", vi: 'Không có gì.', viSao: 'Người vừa giúp bạn mới là người nói câu này.' },
          { en: "See you tomorrow.", vi: 'Mai gặp lại.', viSao: 'Bạn có hẹn gặp lại người lạ này đâu.' } ] } ] },

  { id: 'quan-an', ten: 'Ở quán ăn', ai: 'Người phục vụ', moTa: 'Xin bàn, gọi món, tính tiền', hinh: '🍚',
    boi: 'You are a waiter in a small restaurant. The learner asks for a table, orders food, and asks for the bill.',
    luot: [
      { ho: "Good evening. A table for how many?", hoVi: 'Chào buổi tối. Bàn cho mấy người ạ?',
        meo: '"A table for two" = bàn cho hai người. Đổi số là dùng được mọi lúc.',
        chon: [
          { en: "A table for two, please.", vi: 'Cho bàn hai người ạ.', dung: true },
          { en: "Two o'clock.", vi: 'Hai giờ.', viSao: 'Người ta hỏi mấy người chứ không hỏi mấy giờ.' },
          { en: "I'm very hungry, thank you.", vi: 'Mình đói lắm, cảm ơn.', viSao: 'Câu này không trả lời được câu hỏi.' } ] },
      { ho: "Here is the menu.", hoVi: 'Thực đơn của bạn đây.',
        meo: '"Can I have…?" là cách gọi món lịch sự và dễ nhớ nhất.',
        chon: [
          { en: "Thank you. Can I have the chicken rice, please?", vi: 'Cảm ơn. Cho mình một phần cơm gà nhé?', dung: true },
          { en: "Where is the station?", vi: 'Nhà ga ở đâu ạ?', viSao: 'Đang trong quán ăn mà.' },
          { en: "How old is it?", vi: 'Nó bao nhiêu tuổi?', viSao: 'Câu này không dùng cho món ăn.' } ] },
      { ho: "Something to drink?", hoVi: 'Bạn uống gì không ạ?',
        meo: '"A glass of water" = một ly nước. "A glass of…" dùng cho đồ uống trong ly.',
        chon: [
          { en: "A glass of water, please.", vi: 'Cho mình một ly nước.', dung: true },
          { en: "No, I'm from Vietnam.", vi: 'Không, mình từ Việt Nam.', viSao: 'Chẳng liên quan gì tới đồ uống.' },
          { en: "Yes, it's delicious.", vi: 'Vâng, ngon lắm.', viSao: 'Bạn chưa ăn gì mà, và đây là câu hỏi bạn muốn uống gì.' } ] },
      { ho: "How is your food?", hoVi: 'Món ăn thế nào ạ?',
        meo: 'Khen món ăn: "It\'s very good" hoặc "It\'s delicious".',
        chon: [
          { en: "It's very good, thank you.", vi: 'Ngon lắm, cảm ơn bạn.', dung: true },
          { en: "The bill, please.", vi: 'Cho mình tính tiền.', viSao: 'Câu này đúng nhưng để dành lúc ăn xong, giờ người ta đang hỏi món có ngon không.' },
          { en: "I'm twenty-two.", vi: 'Mình hai mươi hai tuổi.', viSao: 'Không ai hỏi tuổi bạn cả.' } ] },
      { ho: "Do you need anything else?", hoVi: 'Bạn cần gì thêm không ạ?',
        meo: '"The bill, please" = cho tôi tính tiền. Ở Mỹ người ta hay nói "the check".',
        chon: [
          { en: "The bill, please.", vi: 'Cho mình tính tiền ạ.', dung: true },
          { en: "Turn right.", vi: 'Rẽ phải.', viSao: 'Đó là câu chỉ đường.' },
          { en: "Nice to meet you.", vi: 'Rất vui được gặp bạn.', viSao: 'Câu làm quen, không dùng lúc gọi tính tiền.' } ] } ] },

  { id: 'mua-do', ten: 'Mua quần áo', ai: 'Người bán hàng', moTa: 'Hỏi giá, hỏi cỡ, mặc thử', hinh: '👕',
    boi: 'You are a shop assistant in a clothes shop. The learner asks the price, asks for another size, tries it on and buys it.',
    luot: [
      { ho: "Hello! Can I help you?", hoVi: 'Chào bạn! Bạn cần gì không?',
        meo: '"How much is this?" là câu hỏi giá gọn nhất, chỉ vào món đồ là xong.',
        chon: [
          { en: "Yes, how much is this T-shirt?", vi: 'Vâng, cái áo này bao nhiêu tiền ạ?', dung: true },
          { en: "Yes, I'm from Vietnam.", vi: 'Vâng, mình từ Việt Nam.', viSao: 'Người ta hỏi bạn cần giúp gì, không hỏi quê quán.' },
          { en: "It's ten o'clock.", vi: 'Mười giờ rồi.', viSao: 'Không liên quan.' } ] },
      { ho: "It's ten dollars.", hoVi: 'Mười đô ạ.',
        meo: 'Hỏi cỡ: "Do you have a bigger size?" hoặc "a smaller size".',
        chon: [
          { en: "Do you have a bigger size?", vi: 'Bạn có cỡ lớn hơn không?', dung: true },
          { en: "I'm sorry, I'm late.", vi: 'Xin lỗi, mình trễ rồi.', viSao: 'Chẳng ai chờ bạn cả, câu này lạc chỗ.' },
          { en: "See you tomorrow.", vi: 'Mai gặp lại.', viSao: 'Bạn đang mua đồ mà.' } ] },
      { ho: "Yes, here you are.", hoVi: 'Có, của bạn đây.',
        meo: '"Try it on" = mặc thử. Nhớ nguyên cụm này.',
        chon: [
          { en: "Can I try it on?", vi: 'Mình mặc thử được không?', dung: true },
          { en: "How are you?", vi: 'Bạn khỏe không?', viSao: 'Người ta vừa đưa áo cho bạn.' },
          { en: "Where are you from?", vi: 'Bạn từ đâu tới?', viSao: 'Câu làm quen, không hợp lúc này.' } ] },
      { ho: "Of course. How is it?", hoVi: 'Được chứ. Mặc thấy sao ạ?',
        meo: '"I\'ll take it" = tôi lấy cái này. Câu chốt đơn quen thuộc nhất.',
        chon: [
          { en: "It's good. I'll take it.", vi: 'Vừa lắm. Mình lấy cái này.', dung: true },
          { en: "I don't have money.", vi: 'Mình không có tiền.', viSao: 'Đúng ngữ pháp nhưng nói vậy là hết chuyện mua bán.' },
          { en: "Turn left, please.", vi: 'Làm ơn rẽ trái.', viSao: 'Đó là câu chỉ đường.' } ] } ] },

  { id: 'hoi-tham', ten: 'Hỏi thăm bạn', ai: 'Minh', moTa: 'Hỏi khỏe, hỏi nghề, rủ đi chơi', hinh: '🙂',
    boi: "You are the learner's friend. You ask how they are, what they do and what they like, then make a plan for the weekend.",
    luot: [
      { ho: "Hi! How are you?", hoVi: 'Chào! Bạn khỏe không?',
        meo: 'Đáp xong nhớ hỏi lại "And you?" cho thành cuộc nói chuyện.',
        chon: [
          { en: "I'm fine, thank you. And you?", vi: 'Mình khỏe, cảm ơn. Còn bạn?', dung: true },
          { en: "I'm twenty-two.", vi: 'Mình hai mươi hai tuổi.', viSao: 'Đó là trả lời tuổi.' },
          { en: "My name is Nam.", vi: 'Mình tên Nam.', viSao: 'Người ta hỏi bạn khỏe không, chứ không hỏi tên.' } ] },
      { ho: "I'm good, thanks. What do you like doing?", hoVi: 'Mình khỏe, cảm ơn. Bạn thích làm gì?',
        meo: 'Sau "like" thì động từ thêm **-ing**: like listening, like reading, like cooking.',
        chon: [
          { en: "I like listening to music.", vi: 'Mình thích nghe nhạc.', dung: true },
          { en: "I like a coffee.", vi: 'Mình thích một cà phê.', viSao: 'Nói sở thích thì dùng "I like coffee", không có "a".' },
          { en: "Yes, I do.", vi: 'Vâng, có.', viSao: 'Câu hỏi "what" thì phải trả lời nội dung, không trả lời "yes".' } ] },
      { ho: "Me too! Are you free on Sunday?", hoVi: 'Mình cũng vậy! Chủ nhật bạn rảnh không?',
        meo: 'Câu hỏi bắt đầu bằng "Are you…" thì đáp "Yes, I am" hoặc "No, I\'m not".',
        chon: [
          { en: "Yes, I am. Why?", vi: 'Rảnh. Có chuyện gì vậy?', dung: true },
          { en: "Yes, I do.", vi: 'Vâng, có.', viSao: 'Hỏi bằng "are" thì đáp bằng "am", không đáp bằng "do".' },
          { en: "It's Sunday.", vi: 'Hôm nay chủ nhật.', viSao: 'Người ta hỏi bạn có rảnh không.' } ] },
      { ho: "Let's go to the cinema.", hoVi: 'Đi xem phim đi.',
        meo: '"Let\'s…" là rủ rê. Nhận lời thì "Great!", "Sure!" hoặc "Good idea!".',
        chon: [
          { en: "Great! See you on Sunday.", vi: 'Hay đó! Chủ nhật gặp nhé.', dung: true },
          { en: "No, thank you. I'm full.", vi: 'Không, cảm ơn. Mình no rồi.', viSao: '"I\'m full" là no bụng, dùng khi người ta mời ăn.' },
          { en: "How much is it?", vi: 'Bao nhiêu tiền?', viSao: 'Bạn của bạn đang rủ đi chơi, không bán gì cả.' } ] } ] },
];

/* ---- máy đọc: dùng giọng có sẵn của trình duyệt, không tải file tiếng nào ---- */

let giong = null, docBat = true;

function timGiong() {
  if (!self.speechSynthesis) return;
  const ds = speechSynthesis.getVoices() || [];
  giong = ds.find(v => /^en[-_]us/i.test(v.lang)) || ds.find(v => /^en/i.test(v.lang)) || null;
}
if (self.speechSynthesis) {
  timGiong();
  speechSynthesis.addEventListener('voiceschanged', timGiong);
}

function doc(chu, cham, xong) {
  const thoi = () => { if (xong) { const f = xong; xong = null; f(); } };
  if (!docBat || !self.speechSynthesis || !chu) { setTimeout(thoi, 120); return; }
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(chu);
    u.lang = 'en-US';
    u.rate = cham ? .72 : .85;                          // chậm hơn giọng thường, cho người mới nghe kịp
    if (giong) u.voice = giong;
    u.onend = thoi;
    u.onerror = thoi;
    setTimeout(thoi, 1200 + chu.length * 85);           // vài máy không bắn onend, phải có đường lui
    speechSynthesis.speak(u);
  } catch (e) { setTimeout(thoi, 120); }
}

/* ---- khung ---- */

let tam, oTrong, canh = null, chiLuot = 0, daNoi = [], henChuyen = 0;
let che = 'bam';   // 'bam' bấm chọn | 'noi' nói theo cảnh | 'tudo' nói tự do với AI

const LOA_MO = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15 9.2a4.3 4.3 0 010 5.6"/><path d="M17.9 6.7a8 8 0 010 10.6"/></svg>';
const LOA_TAT = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 9.5h3.2L11.5 6v12L7.2 14.5H4z" fill="currentColor" stroke="none"/><path d="M15.4 9.6l5 4.8M20.4 9.6l-5 4.8"/></svg>';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'anhngu';
  tam.innerHTML = `
    <button class="an-loa" aria-label="Tắt giọng đọc">${LOA_MO}</button>
    <button class="an-dong" aria-label="Đóng">✕</button>
    <div class="an-trong"></div>`;
  document.body.appendChild(tam);
  oTrong = tam.querySelector('.an-trong');
  tam.querySelector('.an-dong').onclick = dong;
  tam.querySelector('.an-loa').onclick = batTatDoc;
}

function batTatDoc() {
  docBat = !docBat;
  const n = tam.querySelector('.an-loa');
  n.innerHTML = docBat ? LOA_MO : LOA_TAT;
  n.classList.toggle('tat', !docBat);
  n.setAttribute('aria-label', docBat ? 'Tắt giọng đọc' : 'Mở giọng đọc');
  if (!docBat && self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
}

/* ---- màn chọn cảnh ---- */

function veDanhSach() {
  canh = null;
  clearTimeout(henChuyen);
  oTrong.innerHTML = `
    <div class="an-man">
      <p class="an-tua">Tập nói tiếng Anh</p>
      <p class="an-phu">${
        che === 'noi' ? 'Người ta nói trước, bạn <b>nói ra miệng</b> câu đáp. Bí thì bấm xem gợi ý.'
        : che === 'tudo' ? 'Bạn nói gì cũng được, người kia đáp lại và sửa câu cho bạn. Cần mạng.'
        : 'Người ta nói trước, bạn <b>chọn câu đáp</b>. Chọn sai thì được chỉ chỗ sai rồi chọn lại.'}</p>
      <div class="an-che">
        <button class="${che === 'bam' ? 'dang' : ''}" data-che="bam">Bấm chọn</button>
        <button class="${che === 'noi' ? 'dang' : ''}" data-che="noi">Nói</button>
        <button class="${che === 'tudo' ? 'dang' : ''}" data-che="tudo">Nói tự do</button>
      </div>
      ${che === 'bam' ? '' : `<p class="an-thua">${che === 'tudo'
        ? 'Chế độ này gửi câu bạn nói lên Google để lấy câu đáp. Muốn khỏi gửi gì thì dùng Bấm chọn.'
        : 'Trình duyệt gửi tiếng của bạn tới Google hoặc Apple để nhận ra chữ. Muốn khỏi gửi gì thì dùng Bấm chọn.'}</p>`}
      <div class="an-ds">
        ${CANH.map((c, i) => `
          <button class="an-the" data-i="${i}">
            <span class="an-the-hinh">${c.hinh}</span>
            <span class="an-the-chu">
              <b>${esc(c.ten)}</b>
              <i>${esc(c.moTa)}</i>
            </span>
            <span class="an-the-so">${c.luot.length} câu</span>
          </button>`).join('')}
      </div>
    </div>`;
  oTrong.querySelectorAll('.an-the').forEach(n => {
    n.onclick = () => (che === 'tudo' ? moTuDo : moCanh)(CANH[+n.dataset.i]);
  });
  oTrong.querySelectorAll('.an-che button').forEach(n => {
    n.onclick = () => { che = n.dataset.che; veDanhSach(); };
  });
}

/* ---- màn chơi ---- */

function moCanh(c) {
  canh = c; chiLuot = 0; daNoi = [];
  oTrong.innerHTML = `
    <div class="an-man an-choi">
      <div class="an-dau">
        <button class="an-quay" aria-label="Quay lại">‹</button>
        <span class="an-ten">${esc(c.ten)}</span>
        <span class="an-cham"></span>
      </div>
      <div class="an-thoai"></div>
      <div class="an-day"></div>
    </div>`;
  oTrong.querySelector('.an-quay').onclick = () => { thoiNghe(); veDanhSach(); };
  (che === 'noi' ? veLuotNoi : veLuot)();
}

const veCham = () => {
  const n = oTrong.querySelector('.an-cham');
  if (n) n.innerHTML = canh.luot.map((_, i) => `<i class="${i < chiLuot ? 'roi' : ''}"></i>`).join('');
};

function themBong(lop, en, vi) {
  const t = oTrong.querySelector('.an-thoai');
  const b = document.createElement('button');
  b.className = 'an-bong ' + lop;
  b.innerHTML = `<span class="an-en">${esc(en)}</span><span class="an-vi">${esc(vi)}</span>`;
  b.onclick = () => doc(en, true);                      // chạm vào bong bóng thì nghe lại, chậm hơn
  b.setAttribute('aria-label', 'Nghe lại: ' + en);
  t.appendChild(b);
  t.scrollTop = t.scrollHeight;
  return b;
}

function veLuot() {
  const l = canh.luot[chiLuot];
  veCham();
  themBong('an-ho', l.ho, l.hoVi);
  doc(l.ho);

  const day = oTrong.querySelector('.an-day');
  const tron = l.chon.map((o, i) => ({ o, i })).sort(() => Math.random() - .5);
  day.innerHTML = `<p class="an-nhac">Bạn đáp sao?</p>` + tron.map(({ i }) =>
    `<button class="an-dap" data-i="${i}">
       <span class="an-en">${esc(l.chon[i].en)}</span>
       <span class="an-vi">${esc(l.chon[i].vi)}</span>
       <span class="an-visao"></span>
     </button>`).join('');
  day.querySelectorAll('.an-dap').forEach(n => { n.onclick = () => dap(l.chon[+n.dataset.i], n); });
}

function dap(o, nut) {
  if (nut.classList.contains('sai') || nut.classList.contains('dung')) return;
  doc(o.en);
  if (!o.dung) {                                        // sai thì chỉ chỗ sai rồi cho chọn lại
    nut.classList.add('sai');
    nut.querySelector('.an-visao').textContent = o.viSao || '';
    if (navigator.vibrate) { try { navigator.vibrate(14); } catch (e) {} }
    return;
  }
  nut.classList.add('dung');
  daNoi.push(o);
  themBong('an-minh', o.en, o.vi);
  const l = canh.luot[chiLuot];
  const day = oTrong.querySelector('.an-day');
  day.querySelectorAll('.an-dap').forEach(n => { n.disabled = true; });
  if (l.meo) {
    const m = document.createElement('p');
    m.className = 'an-meo';
    m.innerHTML = esc(l.meo).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    day.appendChild(m);
  }
  chiLuot++;
  veCham();
  henChuyen = setTimeout(() => { if (!canh) return; chiLuot < canh.luot.length ? (che === 'noi' ? veLuotNoi : veLuot)() : veXong(); }, l.meo ? 2100 : 1200);
}

/* ---- màn hết cảnh ---- */

function veXong() {
  const ds = daNoi.map(o => `
    <button class="an-cau">
      <span class="an-en">${esc(o.en)}</span>
      <span class="an-vi">${esc(o.vi)}</span>
    </button>`).join('');
  oTrong.innerHTML = `
    <div class="an-man">
      <p class="an-tua">Xong cảnh "${esc(canh.ten)}"</p>
      <p class="an-phu">Mấy câu bạn vừa nói. Chạm vào câu nào để nghe lại câu đó.</p>
      <div class="an-ds">${ds}</div>
      <div class="an-nut">
        <button class="an-tudo">Giờ nói tự do trong cảnh này</button>
      </div>
      <div class="an-nut">
        <button class="an-lai">Tập lại cảnh này</button>
        <button class="an-khac">Chọn cảnh khác</button>
      </div>
    </div>`;
  const cau = oTrong.querySelectorAll('.an-cau');
  cau.forEach((n, i) => { n.onclick = () => doc(daNoi[i].en, true); });
  const c = canh;
  oTrong.querySelector('.an-tudo').onclick = () => { che = 'tudo'; moTuDo(c); };
  oTrong.querySelector('.an-lai').onclick = () => moCanh(c);
  oTrong.querySelector('.an-khac').onclick = veDanhSach;
}


/* ---- Chế độ NÓI: vẫn ba câu của kịch bản, nhưng người học nói ra miệng thay vì bấm.
   Máy chỉ việc so câu nghe được với ba câu đã biết (assets/nghe.js), nên không cần AI.

   Ba điều cố ý:
   - Bong bóng của người học luôn hiện CÂU CHUẨN trong kịch bản, không hiện chữ máy nghe ra.
     Cho người mới học nhìn lại "ai am from viet nahm" là dạy họ rằng họ dở.
   - Khớp mờ thì vẫn nhận, nhưng kèm một dòng xám "máy nghe thành…" — để người học thấy
     khoảng cách chứ app không giả vờ rằng phát âm đã chuẩn. Trò này không chấm phát âm.
   - Nói trượt hai lần thì tự bung ba nút ra. Mô tả A1 của CEFR có hẳn vế "người kia giúp
     mình đặt câu", nên nhìn câu mà đọc theo là đúng mức, không phải gian lận. ---- */

let mayNghe = null, truotLuot = 0;   // dangNghe khai báo chung ở khối nói tự do bên dưới

const IOS_CAI = !!(self.navigator && self.navigator.standalone);   // đang chạy kiểu app đã cài trên iPhone

function veLuotNoi() {
  const l = canh.luot[chiLuot];
  truotLuot = 0;
  veCham();
  themBong('an-ho', l.ho, l.hoVi);
  const day = oTrong.querySelector('.an-day');
  day.innerHTML = `<p class="an-nhac">Nghe câu trên đã…</p>`;
  doc(l.ho, false, () => {
    if (!canh || canh.luot[chiLuot] !== l) return;       // đã sang lượt khác thì thôi
    setTimeout(() => { if (canh && canh.luot[chiLuot] === l) moiNoi(); }, 250);
  });
}

function moiNoi() {
  const day = oTrong.querySelector('.an-day');
  if (!day) return;
  day.innerHTML = `
    <p class="an-loi" hidden></p>
    <p class="an-nhac">Đến lượt bạn nói</p>
    <div class="an-mic-hang"><button class="an-mic">Nhấn rồi nói</button></div>
    <button class="an-goiy">Chưa biết nói gì?</button>`;
  day.querySelector('.an-mic').onclick = ngheMotCau;
  day.querySelector('.an-goiy').onclick = bungGoiY;
}

function bungGoiY() {
  const day = oTrong.querySelector('.an-day');
  if (!day || day.querySelector('.an-dap')) return;
  const l = canh.luot[chiLuot];
  const tron = l.chon.map((o, i) => i).sort(() => Math.random() - .5);
  const hop = document.createElement('div');
  hop.className = 'an-goi-hop';
  hop.innerHTML = `<p class="an-nhac">Nói theo một trong mấy câu này</p>` + tron.map(i =>
    `<button class="an-dap" data-i="${i}">
       <span class="an-en">${esc(l.chon[i].en)}</span>
       <span class="an-vi">${esc(l.chon[i].vi)}</span>
       <span class="an-visao"></span>
     </button>`).join('');
  day.appendChild(hop);
  hop.querySelectorAll('.an-dap').forEach(n => {
    const o = l.chon[+n.dataset.i];
    n.onclick = () => { doc(o.en, true); dap(o, n); };   // chạm để nghe mẫu, và tính luôn là chọn
  });
  const g = day.querySelector('.an-goiy');
  if (g) g.remove();
}

function baoNoi(chu, nang) {
  const n = oTrong.querySelector('.an-day .an-loi');
  if (!n) return;
  n.hidden = !chu; n.textContent = chu || '';
  n.classList.toggle('nang', !!nang);
}

function ngheMotCau() {
  if (dangNghe) return;
  const RS = self.SpeechRecognition || self.webkitSpeechRecognition;
  const nut = oTrong.querySelector('.an-day .an-mic');
  if (!RS) { baoNoi('Trình duyệt này không nghe được. Bấm "Chưa biết nói gì?" để chọn câu.', true); bungGoiY(); return; }
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }

  try { if (mayNghe) mayNghe.abort(); } catch (e) {}
  mayNghe = new RS();
  mayNghe.lang = 'en-US';
  mayNghe.continuous = false;        // Chrome Android không hỗ trợ continuous, Safari cũ chỉ một phần
  mayNghe.interimResults = true;     // chỉ để hiện chữ chạy cho vui mắt, không dùng để chấm
  mayNghe.maxAlternatives = 5;       // người Việt nói thì phương án thứ hai thứ ba hay mới là câu đúng

  let cuoi = [];
  dangNghe = true;
  nut.classList.add('dang');
  nut.textContent = 'Đang nghe… nói đi';
  baoNoi('');

  mayNghe.onresult = (e) => {
    let dang = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) { for (let k = 0; k < r.length; k++) cuoi.push(r[k].transcript); }
      else dang += r[0].transcript;
    }
    if (dang) nut.textContent = '…' + dang.trim().slice(-38);
  };
  mayNghe.onerror = (e) => {
    dangNghe = false;
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      baoNoi(IOS_CAI
        ? 'iPhone không cho app đã cài lên màn hình chính dùng micro. Mở trang này trong Safari thì nói được, còn ở đây thì bấm chọn câu nhé.'
        : 'Máy chưa cho phép dùng micro. Bật quyền micro cho trang này rồi thử lại.', true);
      bungGoiY();
    } else if (e.error === 'no-speech') baoNoi('Không nghe thấy gì. Nhấn nút rồi nói to hơn chút.');
    else if (e.error === 'network') baoNoi('Nhận giọng nói cần mạng, mà mạng đang trục trặc. Bấm chọn câu cũng được.', true);
    else if (e.error !== 'aborted') baoNoi('Nghe không được (' + e.error + ').');
  };
  mayNghe.onend = () => {
    dangNghe = false;
    const n = oTrong.querySelector('.an-day .an-mic');
    if (n) { n.classList.remove('dang'); n.textContent = 'Nhấn rồi nói'; }
    if (cuoi.length) xetCauNoi(cuoi);
  };

  try { mayNghe.start(); } catch (e) { dangNghe = false; baoNoi('Không mở được micro.', true); }
}

function xetCauNoi(nghe) {
  const l = canh.luot[chiLuot];
  const cau = l.chon.map(o => o.en);
  const kq = TDTD_NGHE.chonCau(nghe, cau);
  const day = oTrong.querySelector('.an-day');

  if (kq.chi < 0) {                                     // không khớp câu nào
    truotLuot++;
    baoNoi('Mình chưa nghe rõ. Nói lại nhé. Máy nghe thành: “' + nghe[0] + '”');
    if (truotLuot >= 2) bungGoiY();
    return;
  }

  const o = l.chon[kq.chi];
  if (!o.dung) {                                        // nói trúng một câu SAI, đây là chỗ dạy được
    baoNoi('Câu đó nói được, nhưng không hợp lúc này: ' + (o.viSao || ''), true);
    truotLuot++;
    if (truotLuot >= 2) bungGoiY();
    return;
  }

  daNoi.push(o);
  const bong = themBong('an-minh', o.en, o.vi);
  if (!kq.chac) {                                       // nhận nhưng chưa rõ: nói thật cho người học biết
    const s = document.createElement('span');
    s.className = 'an-mo';
    s.textContent = 'Máy nghe thành: “' + nghe[0] + '”';
    bong.appendChild(s);
  }
  if (day) day.innerHTML = '';
  if (l.meo) {
    const m = document.createElement('p');
    m.className = 'an-meo';
    m.innerHTML = esc(l.meo).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    oTrong.querySelector('.an-thoai').appendChild(m);
  }
  chiLuot++;
  veCham();
  henChuyen = setTimeout(() => {
    if (!canh) return;
    chiLuot < canh.luot.length ? veLuotNoi() : veXong();
  }, l.meo ? 1800 : 1100);
}

/* ---- Nói tự do: người học NÓI, máy nghe bằng SpeechRecognition, câu trả lời do Gemini viết
   qua hàm /api/noi (khoá nằm ở máy chủ, không có trong mã này).

   Máy nào không nghe được thì có ô gõ chữ thay thế. Chưa cấu hình khoá, hay mất mạng, thì
   chế độ này báo rõ và lui về phần kịch bản chứ không hỏng. ---- */

const NGHE_DUOC = !!(self.SpeechRecognition || self.webkitSpeechRecognition);
let may = null, dangNghe = false, choMay = false, apiSong = null;   // apiSong: null chưa biết, true/false đã thử

const lichSu = [];                                    // các lượt đã nói trong phiên tự do

function moTuDo(c) {
  canh = c; chiLuot = 0; daNoi = []; lichSu.length = 0;
  oTrong.innerHTML = `
    <div class="an-man an-choi">
      <div class="an-dau">
        <button class="an-quay" aria-label="Quay lại">‹</button>
        <span class="an-ten">${esc(c.ten)} · nói tự do</span>
      </div>
      <div class="an-thoai"></div>
      <div class="an-day">
        <p class="an-loi" hidden></p>
        <div class="an-mic-hang">
          <button class="an-mic">${NGHE_DUOC ? 'Nhấn rồi nói' : 'Gõ câu của bạn'}</button>
        </div>
        <input class="an-go" type="text" placeholder="…hoặc gõ câu tiếng Anh rồi Enter"
               autocomplete="off" autocapitalize="off" spellcheck="false">
      </div>
    </div>`;
  oTrong.querySelector('.an-quay').onclick = () => { thoiNghe(); veDanhSach(); };
  oTrong.querySelector('.an-mic').onclick = NGHE_DUOC ? batNghe : () => oTrong.querySelector('.an-go').focus();
  const go = oTrong.querySelector('.an-go');
  go.onkeydown = (e) => { if (e.key === 'Enter' && go.value.trim()) { const v = go.value.trim(); go.value = ''; guiCau(v); } };
  if (!NGHE_DUOC) go.classList.add('ro');

  themBong('an-ho', c.luot[0].ho, c.luot[0].hoVi);
  doc(c.luot[0].ho);
  lichSu.push({ vai: 'ho', chu: c.luot[0].ho });
}

function bao(chu, nang) {
  const n = oTrong.querySelector('.an-loi');
  if (!n) return;
  n.hidden = !chu;
  n.textContent = chu || '';
  n.classList.toggle('nang', !!nang);
}

/* ---- nghe ---- */

function batNghe() {
  if (dangNghe || choMay) return;
  const RS = self.SpeechRecognition || self.webkitSpeechRecognition;
  if (!RS) return;
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }   // tắt loa kẻo mic nghe lại chính nó

  may = new RS();
  may.lang = 'en-US';
  may.interimResults = true;
  may.maxAlternatives = 1;
  may.continuous = false;

  const nut = oTrong.querySelector('.an-mic');
  let daCo = '';
  dangNghe = true;
  nut.classList.add('dang');
  nut.textContent = 'Đang nghe… nói đi';
  bao('');

  may.onresult = (e) => {
    let xong = '', dang = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) xong += r[0].transcript; else dang += r[0].transcript;
    }
    if (dang) nut.textContent = '…' + dang.trim().slice(-40);
    if (xong) daCo += xong;
  };
  may.onerror = (e) => {
    dangNghe = false;
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') bao('Máy chưa cho phép dùng micro. Bật quyền micro cho trang này rồi thử lại.', true);
    else if (e.error === 'no-speech') bao('Không nghe thấy gì. Nhấn nút rồi nói to hơn một chút.');
    else if (e.error === 'network') bao('Nhận giọng nói cần mạng, mà mạng đang trục trặc. Gõ chữ cũng được.');
    else if (e.error !== 'aborted') bao('Nghe không được (' + e.error + '). Gõ chữ cũng được.');
  };
  may.onend = () => {
    dangNghe = false;
    nut.classList.remove('dang');
    nut.textContent = NGHE_DUOC ? 'Nhấn rồi nói' : 'Gõ câu của bạn';
    const chu = daCo.trim();
    if (chu) guiCau(chu);
  };

  try { may.start(); } catch (e) { dangNghe = false; bao('Không mở được micro.', true); }
}

function thoiNghe() {
  for (const m of [may, mayNghe]) { if (m) { try { m.abort(); } catch (e) {} } }
  may = null; mayNghe = null; dangNghe = false;
}

/* ---- một lượt: gửi câu người học lên, nhận câu đáp ---- */

async function guiCau(chu) {
  if (choMay) return;
  choMay = true;
  bao('');
  const nut = oTrong.querySelector('.an-mic');
  if (nut) { nut.disabled = true; nut.textContent = 'Đang nghĩ…'; }

  const bongMinh = themBong('an-minh', chu, '');
  lichSu.push({ vai: 'minh', chu });

  try {
    const r = await fetch('api/noi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noi: chu,
        canh: { ai: canh.ai, canh: canh.boi || canh.moTa },
        truoc: lichSu.slice(0, -1),
      }),
    });
    const d = await r.json().catch(() => ({}));

    if (r.status === 503 && d.loi === 'chua-cau-hinh') {
      apiSong = false;
      bao('Phần nói tự do chưa bật: chủ app chưa đặt khoá Gemini trên máy chủ. Phần theo kịch bản vẫn chơi bình thường.', true);
      return;
    }
    if (r.status === 429) { bao('Nhanh quá, nghỉ một chút rồi nói tiếp nhé.'); return; }
    if (!r.ok) { bao('Máy chủ trả lời lỗi. Thử lại sau một chút.', true); return; }

    apiSong = true;
    if (d.fix && d.fix.trim() && d.fix.trim().toLowerCase() !== chu.trim().toLowerCase()) {
      const s = document.createElement('span');
      s.className = 'an-sua';
      s.textContent = 'Nói vầy tự nhiên hơn: ' + d.fix.trim();
      s.onclick = (e) => { e.stopPropagation(); doc(d.fix, true); };
      bongMinh.appendChild(s);
    }
    themBong('an-ho', d.say, d.vi);
    lichSu.push({ vai: 'ho', chu: d.say });
    doc(d.say);
    if (d.tip && d.tip.trim()) {
      const m = document.createElement('p');
      m.className = 'an-meo';
      m.textContent = d.tip.trim();
      oTrong.querySelector('.an-thoai').appendChild(m);
    }
    if (d.xong) bao('Cuộc nói chuyện tới đây là trọn. Nói tiếp cũng được, hoặc quay ra chọn cảnh khác.');
  } catch (e) {
    bao('Không gọi được máy chủ. Kiểm tra mạng rồi thử lại.', true);
  } finally {
    choMay = false;
    if (nut) { nut.disabled = false; nut.textContent = NGHE_DUOC ? 'Nhấn rồi nói' : 'Gõ câu của bạn'; }
    const t = oTrong.querySelector('.an-thoai');
    if (t) t.scrollTop = t.scrollHeight;
  }
}

/* ---- mở đóng ---- */

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  timGiong();
  if (che === 'bam' && NGHE_DUOC) che = 'noi';          // máy nghe được thì mặc định là nói, đó mới là cái đáng tập
  veDanhSach();
}

function dong() {
  clearTimeout(henChuyen);
  thoiNghe();
  canh = null;
  if (self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });
addEventListener('visibilitychange', () => { if (document.hidden && self.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} } });

self.TDTD_ANHNGU = { mo, dong, _canh: CANH,
  _dsCanh: () => CANH.map(c => ({ id: c.id, ten: c.ten, luot: c.luot.length })),
  _choi: (i) => moCanh(CANH[i]),
  _trangThai: () => ({ canh: canh ? canh.id : null, luot: chiLuot, tong: canh ? canh.luot.length : 0,
                       daNoi: daNoi.length, doc: docBat, coGiong: !!giong }),
  _che: (c) => { che = c; },
  _tuDo: (i) => moTuDo(CANH[i]),
  _xetNoi: (ds) => xetCauNoi(ds),
  _goiY: () => bungGoiY(),
  _nghe: () => ({ ngheDuoc: NGHE_DUOC, dangNghe, choMay, apiSong, luot: lichSu.length }),
  _noiThu: (chu) => guiCau(chu),
  _dapDung: () => {                                     // chọn đúng câu, dùng khi kiểm thử
    const nut = [...oTrong.querySelectorAll('.an-dap')];
    const l = canh.luot[chiLuot];
    const n = nut.find(x => l.chon[+x.dataset.i].dung);
    if (n) n.click();
    return !!n;
  },
  _dapSai: () => {
    const nut = [...oTrong.querySelectorAll('.an-dap')];
    const l = canh.luot[chiLuot];
    const n = nut.find(x => !l.chon[+x.dataset.i].dung);
    if (n) n.click();
    return !!n;
  } };
})();

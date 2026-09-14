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

function doc(chu, cham) {
  if (!docBat || !self.speechSynthesis || !chu) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(chu);
    u.lang = 'en-US';
    u.rate = cham ? .72 : .85;                          // chậm hơn giọng thường, cho người mới nghe kịp
    if (giong) u.voice = giong;
    speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---- khung ---- */

let tam, oTrong, canh = null, chiLuot = 0, daNoi = [], henChuyen = 0;

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
      <p class="an-phu">Người ta nói trước, bạn chọn câu đáp. Chọn sai thì được chỉ chỗ sai rồi chọn lại — không điểm, không đếm giờ.</p>
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
    n.onclick = () => moCanh(CANH[+n.dataset.i]);
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
  oTrong.querySelector('.an-quay').onclick = veDanhSach;
  veLuot();
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
  henChuyen = setTimeout(() => { if (!canh) return; chiLuot < canh.luot.length ? veLuot() : veXong(); }, l.meo ? 2100 : 1200);
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
        <button class="an-lai">Tập lại cảnh này</button>
        <button class="an-khac">Chọn cảnh khác</button>
      </div>
    </div>`;
  const cau = oTrong.querySelectorAll('.an-cau');
  cau.forEach((n, i) => { n.onclick = () => doc(daNoi[i].en, true); });
  const c = canh;
  oTrong.querySelector('.an-lai').onclick = () => moCanh(c);
  oTrong.querySelector('.an-khac').onclick = veDanhSach;
}

/* ---- mở đóng ---- */

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  timGiong();
  veDanhSach();
}

function dong() {
  clearTimeout(henChuyen);
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

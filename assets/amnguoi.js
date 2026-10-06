/* SINH TỰ ĐỘNG bởi scripts/lam-tieng-nguoi.py từ content/am44.json và content/am-nguoi.json — đừng sửa tay.

   44 âm tiếng Anh theo bảng người Việt hay học (ký hiệu Anh-Anh): 12 nguyên âm đơn, 8 nguyên âm đôi,
   24 phụ âm. Mỗi âm có: cách đặt miệng, lỗi người Việt hay mắc, ba từ ví dụ, tham số khẩu hình cho
   assets/khauhinh.js, và `am` — các bản thu NGƯỜI THẬT của chính cái âm đó.

   Vì sao bản thu lại khác nhau giữa các âm: không có ai, ở bất cứ đâu với giấy phép mở, thu riêng đủ 44
   âm bằng giọng bản xứ (đã lùng Commons, Lingua Libre, Freesound, Openverse, GitHub, Hugging Face).
   Nên mỗi âm lấy cái gần nhất có được, theo thứ tự ưu tiên:
     1. âm đứng riêng do người bản xứ đọc: "ah", "or", "uh", "oh", "eye", "ear", "air", "shh", "mmm"...
        — nhiều từ tiếng Anh vốn CHỈ gồm một nguyên âm (giọng Anh không đọc r ở cuối: "or" là /ɔː/)
     2. âm đứng riêng do một nhà ngữ âm người Anh đọc (GS Peter Roach): [e] [ʌ] [ɒ], [fa] … [afa]
     3. một từ mà âm đó đứng đầu hoặc gần như chiếm trọn: "he", "who", "how", "it", "egg"
   Âm nào không có thứ nào ở trên thì `am` rỗng, và màn học dùng từ ví dụ do người bản xứ đọc. Lần dựng
   này: 27 âm có bản thu riêng; 17 âm nghe qua từ ví dụ: ʊ p b t d k θ ð z ʒ tʃ dʒ n ŋ l w j. Âm tắc p t k b d g thì tách riêng
   ra chỉ còn một tiếng tách; các âm còn lại đơn giản là không ai thu.

   Bộ cũ (Peter Isotalo đọc [sa] … [asa], Denelson83 đọc nguyên âm chuẩn IPA) đã bỏ: người dùng nghe
   thấy "khó nghe, như máy đọc" — người đọc không phải người bản xứ, và đọc kiểu mẫu phòng thí nghiệm.

   Ghi công từng file: assets/am/NGUON.md, và màn "Nguồn tiếng đọc" trong app. */
(function (root) {
'use strict';
const DS = [
 {
  "ma": "ii",
  "ipa": "iː",
  "nhom": "don",
  "ten": "i dài",
  "goiY": "Kéo hai khoé môi sang ngang như cười nhẹ, lưỡi đẩy cao ra trước, gần chạm vòm trên. Kéo dài gấp đôi \"i\" trong \"ít\": \"siii\".",
  "loi": "Đọc ngắn cụt như \"i\" trong \"ít\" và đọc /ɪ/ y hệt, nên \"sheep\" (con cừu) với \"ship\" (con tàu) nghe như một.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "see",
    "nghia": "nhìn thấy"
   },
   {
    "tu": "eat",
    "nghia": "ăn"
   },
   {
    "tu": "tea",
    "nghia": "trà"
   }
  ],
  "doi": [
   "i"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.05,
   "luoiCao": 0.95,
   "dauLuoi": 0.2,
   "moiTron": 0,
   "hamMo": 0.15
  },
  "tac": false,
  "soCap": {
   "i": [
    "sheep",
    "ship"
   ]
  },
  "am": [
   {
    "f": "assets/am/ii-1.mp3?v=baa83caa",
    "giong": "Anh",
    "tacGia": "Association Shtooka, Judith Franck",
    "giayPhep": "CC BY 3.0 us",
    "nguon": "https://commons.wikimedia.org/wiki/File:En-uk-he.ogg",
    "nhan": "he",
    "phu": "gần như chỉ còn /iː/, h rất nhẹ"
   }
  ]
 },
 {
  "ma": "i",
  "ipa": "ɪ",
  "nhom": "don",
  "ten": "i ngắn",
  "goiY": "I lỏng và ngắn, lưng chừng giữa \"i\" và \"ê\": không cười, không căng lưỡi. Tự kiểm: đặt miệng như nói \"i\" rồi thả lỏng, hạ hàm xuống một chút.",
  "loi": "Đọc căng như \"i\" tiếng Việt, nên \"ship\" nghe thành \"sheep\", \"sit\" nghe thành \"seat\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "it",
    "nghia": "nó"
   },
   {
    "tu": "sit",
    "nghia": "ngồi"
   },
   {
    "tu": "big",
    "nghia": "to, lớn"
   }
  ],
  "doi": [
   "ii",
   "e"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.25,
   "luoiCao": 0.72,
   "dauLuoi": 0.15,
   "moiTron": 0.35,
   "hamMo": 0.3
  },
  "tac": false,
  "soCap": {
   "ii": [
    "ship",
    "sheep"
   ]
  },
  "am": [
   {
    "f": "assets/am/i-1.mp3?v=86664696",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-it.wav",
    "nhan": "it",
    "phu": "/ɪ/ đứng đầu từ"
   }
  ]
 },
 {
  "ma": "e",
  "ipa": "e",
  "nhom": "don",
  "ten": "e ngắn",
  "goiY": "Gần \"e\" tiếng Việt nhưng hàm khép hơn một chút, ngả về \"ê\". Ngắn, gọn, môi thả lỏng.",
  "loi": "Mở miệng rộng như \"e\" tiếng Việt nên lẫn với /æ/: \"bed\" nghe ra \"bad\", \"men\" nghe ra \"man\".",
  "ghiChu": "Sách và từ điển Mỹ hay ghi âm này là /ɛ/ (bed /bɛd/) — vẫn là cùng một âm.",
  "vd": [
   {
    "tu": "bed",
    "nghia": "cái giường"
   },
   {
    "tu": "red",
    "nghia": "màu đỏ"
   },
   {
    "tu": "ten",
    "nghia": "số mười"
   }
  ],
  "doi": [
   "ae",
   "ei"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.12,
   "luoiCao": 0.5,
   "dauLuoi": 0.15,
   "moiTron": 0.15,
   "hamMo": 0.5
  },
  "tac": false,
  "soCap": {
   "ae": [
    "bed",
    "bad"
   ]
  },
  "am": [
   {
    "f": "assets/am/e-1.mp3?v=e06d12ec",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-egg.wav",
    "nhan": "egg",
    "phu": "/e/ đứng đầu từ"
   },
   {
    "f": "assets/am/e-2.mp3?v=1f570326",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-open-mid_front_unrounded_vowel.ogg",
    "nhan": "âm /e/",
    "phu": "đứng riêng · GS ngữ âm Peter Roach"
   }
  ]
 },
 {
  "ma": "ae",
  "ipa": "æ",
  "nhom": "don",
  "ten": "a bẹt",
  "goiY": "Há hàm to hẳn, lưỡi vẫn ở phía trước nhưng hạ thật thấp, khoé môi hơi kéo ngang — nghe giữa \"a\" và \"e\". Soi gương: miệng phải há rộng hơn hẳn khi nói \"e\".",
  "loi": "Đọc thành \"e\" tiếng Việt nên \"bad\" nghe thành \"bed\", \"man\" nghe thành \"men\".",
  "ghiChu": "Các từ như bath, ask, fast, can't: Anh-Anh đọc /ɑː/ (a dài, lùi sâu), Anh-Mỹ đọc /æ/.",
  "vd": [
   {
    "tu": "cat",
    "nghia": "con mèo"
   },
   {
    "tu": "bad",
    "nghia": "tệ, xấu"
   },
   {
    "tu": "man",
    "nghia": "người đàn ông"
   }
  ],
  "doi": [
   "e",
   "ah"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.15,
   "luoiCao": 0.05,
   "dauLuoi": 0.05,
   "moiTron": 0,
   "hamMo": 1
  },
  "tac": false,
  "soCap": {
   "e": [
    "bad",
    "bed"
   ]
  },
  "am": [
   {
    "f": "assets/am/ae-1.mp3?v=0dbb7868",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-at.wav",
    "nhan": "at",
    "phu": "/æ/ đứng đầu từ"
   }
  ]
 },
 {
  "ma": "ah",
  "ipa": "ʌ",
  "nhom": "don",
  "ten": "ă ngắn",
  "goiY": "Gần \"ă\" tiếng Việt: hàm hé vừa, lưỡi thả nằm giữa, bật ra gọn rồi dứt. Không kéo dài.",
  "loi": "Đọc thành \"a\" dài tiếng Việt nên \"cut\" lẫn với \"cart\", \"hut\" lẫn với \"heart\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "cup",
    "nghia": "cái tách"
   },
   {
    "tu": "sun",
    "nghia": "mặt trời"
   },
   {
    "tu": "bus",
    "nghia": "xe buýt"
   }
  ],
  "doi": [
   "aa",
   "ae"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.5,
   "luoiCao": 0.25,
   "dauLuoi": 0.05,
   "moiTron": 0.25,
   "hamMo": 0.65
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/ah-1.mp3?v=36d16ee9",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-open-mid_back_unrounded_vowel.ogg",
    "nhan": "âm /ʌ/",
    "phu": "đứng riêng · GS ngữ âm Peter Roach"
   }
  ]
 },
 {
  "ma": "aa",
  "ipa": "ɑː",
  "nhom": "don",
  "ten": "a dài",
  "goiY": "A dài, há to như khi bác sĩ bảo \"nói aaa\", lưỡi kéo lùi về phía cổ. Môi không tròn, kéo dài ra.",
  "loi": "Đọc ngắn và nông như \"a\" thường, hoặc thêm \"r\" rung kiểu tiếng Việt vào \"car\", \"park\".",
  "ghiChu": "Anh-Mỹ đọc rõ r sau âm này (car /kɑːr/), Anh-Anh thì không. Anh-Anh còn dùng /ɑː/ cho bath, ask, fast (Mỹ đọc /æ/); ngược lại Anh-Mỹ dùng /ɑː/ cho hot, stop (Anh đọc /ɒ/).",
  "vd": [
   {
    "tu": "car",
    "nghia": "xe hơi"
   },
   {
    "tu": "park",
    "nghia": "công viên"
   },
   {
    "tu": "father",
    "nghia": "bố"
   }
  ],
  "doi": [
   "ah",
   "o"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.85,
   "luoiCao": 0.05,
   "dauLuoi": 0.05,
   "moiTron": 0.25,
   "hamMo": 0.95
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/aa-1.mp3?v=d56a196e",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-ah.wav",
    "nhan": "ah",
    "phu": "chính là /ɑː/ đứng riêng"
   },
   {
    "f": "assets/am/aa-2.mp3?v=1f8897ca",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-are.wav",
    "nhan": "are",
    "phu": "giọng Anh không đọc r: chỉ còn /ɑː/"
   }
  ]
 },
 {
  "ma": "o",
  "ipa": "ɒ",
  "nhom": "don",
  "ten": "o ngắn",
  "goiY": "O ngắn, há khá to, môi chỉ hơi tròn — mở hơn \"o\" tiếng Việt. Dứt ngay, không kéo.",
  "loi": "Chu môi quá thành \"ô\", hoặc kéo dài thành /ɔː/ nên \"pot\" lẫn với \"port\".",
  "ghiChu": "Anh-Mỹ không có âm này: hot, stop, box đọc thành /ɑː/ (há to, không tròn môi); dog, long thường thành /ɔː/.",
  "vd": [
   {
    "tu": "hot",
    "nghia": "nóng"
   },
   {
    "tu": "dog",
    "nghia": "con chó"
   },
   {
    "tu": "box",
    "nghia": "cái hộp"
   }
  ],
  "doi": [
   "oo",
   "ah"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.95,
   "luoiCao": 0.12,
   "dauLuoi": 0.05,
   "moiTron": 0.45,
   "hamMo": 0.8
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/o-1.mp3?v=3e674d92",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-open_back_rounded_vowel.ogg",
    "nhan": "âm /ɒ/",
    "phu": "đứng riêng · GS ngữ âm Peter Roach"
   },
   {
    "f": "assets/am/o-2.mp3?v=e0a93706",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-on.wav",
    "nhan": "on",
    "phu": "/ɒ/ đứng đầu từ"
   }
  ]
 },
 {
  "ma": "oo",
  "ipa": "ɔː",
  "nhom": "don",
  "ten": "o dài",
  "goiY": "O dài, môi chu tròn hẳn, nằm giữa \"o\" và \"ô\" tiếng Việt. Kéo dài gấp đôi /ɒ/.",
  "loi": "Đọc ngắn như \"o\" tiếng Việt nên \"short\" lẫn với \"shot\", \"sport\" lẫn với \"spot\".",
  "ghiChu": "Anh-Mỹ đọc rõ r ở more, door (/mɔːr/). Nhiều vùng ở Mỹ đọc law, saw gần như /ɑː/.",
  "vd": [
   {
    "tu": "ball",
    "nghia": "quả bóng"
   },
   {
    "tu": "saw",
    "nghia": "đã nhìn thấy"
   },
   {
    "tu": "more",
    "nghia": "nhiều hơn"
   }
  ],
  "doi": [
   "o",
   "ou"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.95,
   "luoiCao": 0.5,
   "dauLuoi": 0.05,
   "moiTron": 0.85,
   "hamMo": 0.45
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/oo-1.mp3?v=d632b851",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-or.wav",
    "nhan": "or",
    "phu": "giọng Anh không đọc r: chỉ còn /ɔː/"
   }
  ]
 },
 {
  "ma": "u",
  "ipa": "ʊ",
  "nhom": "don",
  "ten": "u ngắn",
  "goiY": "U lỏng, ngắn: môi tròn nhưng lỏng, không chu căng như \"u\" tiếng Việt hay /uː/. Dứt nhanh.",
  "loi": "Chu môi căng và kéo dài như \"u\" tiếng Việt, nên \"full\" (đầy) nghe thành \"fool\" (kẻ ngốc).",
  "ghiChu": "Chữ oo lúc đọc /ʊ/ (book, good, look), lúc đọc /uː/ (food, moon) — phải nhớ theo từng từ. Chữ u trong put, full, pull cũng là /ʊ/, không phải /ʌ/ như cup.",
  "vd": [
   {
    "tu": "book",
    "nghia": "quyển sách"
   },
   {
    "tu": "good",
    "nghia": "tốt"
   },
   {
    "tu": "look",
    "nghia": "nhìn"
   }
  ],
  "doi": [
   "uu"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.7,
   "luoiCao": 0.72,
   "dauLuoi": 0.05,
   "moiTron": 0.65,
   "hamMo": 0.3
  },
  "tac": false,
  "am": []
 },
 {
  "ma": "uu",
  "ipa": "uː",
  "nhom": "don",
  "ten": "u dài",
  "goiY": "U dài, chu môi tròn và căng như sắp thổi nến, kéo dài ra. Căng hơn hẳn /ʊ/.",
  "loi": "Đọc ngắn quá nên \"pool\" (bể bơi) nghe thành \"pull\" (kéo).",
  "ghiChu": "Sau t, d, n: Anh-Anh có thêm /j/ (new /njuː/, tube /tjuːb/), Anh-Mỹ thường bỏ (/nuː/, /tuːb/).",
  "vd": [
   {
    "tu": "food",
    "nghia": "thức ăn"
   },
   {
    "tu": "moon",
    "nghia": "mặt trăng"
   },
   {
    "tu": "blue",
    "nghia": "màu xanh dương"
   }
  ],
  "doi": [
   "u"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.9,
   "luoiCao": 0.92,
   "dauLuoi": 0.05,
   "moiTron": 1,
   "hamMo": 0.15
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/uu-1.mp3?v=94e4dd02",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-who.wav",
    "nhan": "who",
    "phu": "gần như chỉ còn /uː/, h rất nhẹ"
   }
  ]
 },
 {
  "ma": "er",
  "ipa": "ɜː",
  "nhom": "don",
  "ten": "ơ dài",
  "goiY": "Ơ dài như khi đang ngập ngừng \"ờờ…\", môi thả lỏng không tròn, lưỡi nằm giữa. Kéo dài và có nhấn.",
  "loi": "Tròn môi thành \"o\" nên \"work\" (làm việc) nghe thành \"walk\" (đi bộ), hoặc đọc ngắn như ơ nhẹ.",
  "ghiChu": "Anh-Mỹ cong lưỡi suốt cả âm, thành một âm ơ nhuốm r (bird /bɝːd/); Anh-Anh chỉ là ơ dài, không có r.",
  "vd": [
   {
    "tu": "bird",
    "nghia": "con chim"
   },
   {
    "tu": "her",
    "nghia": "cô ấy"
   },
   {
    "tu": "turn",
    "nghia": "quay, rẽ"
   }
  ],
  "doi": [
   "uh",
   "oo"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.52,
   "dauLuoi": 0.1,
   "moiTron": 0.15,
   "hamMo": 0.32
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/er-1.mp3?v=70ec64cf",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-earth.wav",
    "nhan": "earth",
    "phu": "/ɜː/ đứng đầu từ"
   }
  ]
 },
 {
  "ma": "uh",
  "ipa": "ə",
  "nhom": "don",
  "ten": "ơ nhẹ (schwa)",
  "goiY": "Thả lỏng hết: môi không kéo không chu, lưỡi nằm giữa, hàm hé nhẹ — như \"ơ\" tiếng Việt nhưng rất ngắn và nhẹ. Không bao giờ mang trọng âm; là âm hay gặp nhất trong tiếng Anh.",
  "loi": "Đọc rõ từng chữ cái theo mặt chữ (\"a-bao\", \"ba-na-na\"), nên câu nghe cứng và sai nhịp.",
  "ghiChu": "Ở cuối các từ -er, -or (teacher, doctor), Anh-Mỹ đọc thành ơ có r cong lưỡi (/ˈtiːtʃɚ/); Anh-Anh chỉ là ơ nhẹ (/ˈtiːtʃə/).",
  "vd": [
   {
    "tu": "about",
    "nghia": "về, khoảng"
   },
   {
    "tu": "sofa",
    "nghia": "ghế sô-pha"
   },
   {
    "tu": "banana",
    "nghia": "quả chuối"
   }
  ],
  "doi": [
   "er",
   "ah"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.45,
   "dauLuoi": 0.1,
   "moiTron": 0.4,
   "hamMo": 0.4
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/uh-1.mp3?v=d1b996c3",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-uh.wav",
    "nhan": "uh",
    "phu": "chính là /ə/ đứng riêng: ơ ngắn, thả lỏng"
   }
  ]
 },
 {
  "ma": "ei",
  "ipa": "eɪ",
  "nhom": "doi",
  "ten": "ê-i",
  "goiY": "Bắt đầu ở \"ê\" rồi trượt lên \"i\", liền một hơi. Đuôi i phải nghe ra, không thì thành /e/.",
  "loi": "Bỏ mất đuôi \"i\" nên \"late\" (muộn) thành \"let\" (để), \"main\" thành \"men\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "day",
    "nghia": "ngày"
   },
   {
    "tu": "name",
    "nghia": "tên"
   },
   {
    "tu": "make",
    "nghia": "làm"
   }
  ],
  "doi": [
   "e"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.12,
   "luoiCao": 0.5,
   "dauLuoi": 0.15,
   "moiTron": 0.15,
   "hamMo": 0.5
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.25,
   "luoiCao": 0.72,
   "dauLuoi": 0.15,
   "moiTron": 0.35,
   "hamMo": 0.3
  },
  "tac": false,
  "luot": [
   "e",
   "ɪ"
  ],
  "am": [
   {
    "f": "assets/am/ei-1.mp3?v=cb1d655b",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-A.wav",
    "nhan": "A",
    "phu": "tên chữ A: chính là /eɪ/ đứng riêng"
   }
  ]
 },
 {
  "ma": "ai",
  "ipa": "aɪ",
  "nhom": "doi",
  "ten": "a-i",
  "goiY": "Như \"ai\" tiếng Việt: há to ở \"a\" rồi trượt lên \"i\". Phần \"a\" dài và rõ hơn phần \"i\".",
  "loi": "Gần \"ai\" tiếng Việt nên ít sai; lỗi hay nằm ở phụ âm cuối, vì tiếng Việt không có vần \"ai\" kèm phụ âm cuối: \"five\" thành \"fai\", \"time\" thành \"tai\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "my",
    "nghia": "của tôi"
   },
   {
    "tu": "time",
    "nghia": "thời gian"
   },
   {
    "tu": "five",
    "nghia": "số năm"
   }
  ],
  "doi": [
   "ei",
   "au"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.4,
   "luoiCao": 0.05,
   "dauLuoi": 0.05,
   "moiTron": 0.1,
   "hamMo": 0.95
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.25,
   "luoiCao": 0.72,
   "dauLuoi": 0.15,
   "moiTron": 0.35,
   "hamMo": 0.3
  },
  "tac": false,
  "luot": [
   "a",
   "ɪ"
  ],
  "am": [
   {
    "f": "assets/am/ai-1.mp3?v=5ba4fe94",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-eye.wav",
    "nhan": "eye",
    "phu": "chính là /aɪ/ đứng riêng"
   }
  ]
 },
 {
  "ma": "oi",
  "ipa": "ɔɪ",
  "nhom": "doi",
  "ten": "o-i",
  "goiY": "Như \"oi\" tiếng Việt: môi tròn ở \"o\" rồi kéo ngang ra thành \"i\".",
  "loi": "Gần \"oi\" tiếng Việt nên ít sai; chỉ cần lướt đủ sang i và giữ phụ âm cuối: \"coin\" đừng thành \"coi\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "boy",
    "nghia": "con trai"
   },
   {
    "tu": "toy",
    "nghia": "đồ chơi"
   },
   {
    "tu": "coin",
    "nghia": "đồng xu"
   }
  ],
  "doi": [
   "ai",
   "oo"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.95,
   "luoiCao": 0.5,
   "dauLuoi": 0.05,
   "moiTron": 0.85,
   "hamMo": 0.45
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.25,
   "luoiCao": 0.72,
   "dauLuoi": 0.15,
   "moiTron": 0.35,
   "hamMo": 0.3
  },
  "tac": false,
  "luot": [
   "ɔː",
   "ɪ"
  ],
  "am": [
   {
    "f": "assets/am/oi-1.mp3?v=cbac6a00",
    "giong": "Anh",
    "tacGia": "Vealhurl",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-oy.wav",
    "nhan": "oy",
    "phu": "chính là /ɔɪ/ đứng riêng"
   }
  ]
 },
 {
  "ma": "au",
  "ipa": "aʊ",
  "nhom": "doi",
  "ten": "a-u",
  "goiY": "Như \"ao\" tiếng Việt: há to ở \"a\" rồi khép dần, chu tròn môi về \"u\".",
  "loi": "Gần \"ao\" tiếng Việt nên ít sai; lỗi hay gặp là nuốt phụ âm cuối, vì tiếng Việt không có vần \"ao\" kèm phụ âm cuối: \"house\" thành \"hao\", \"out\" thành \"ao\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "now",
    "nghia": "bây giờ"
   },
   {
    "tu": "out",
    "nghia": "ra ngoài"
   },
   {
    "tu": "house",
    "nghia": "ngôi nhà"
   }
  ],
  "doi": [
   "ou",
   "ai"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.4,
   "luoiCao": 0.05,
   "dauLuoi": 0.05,
   "moiTron": 0.1,
   "hamMo": 0.95
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.7,
   "luoiCao": 0.72,
   "dauLuoi": 0.05,
   "moiTron": 0.65,
   "hamMo": 0.3
  },
  "tac": false,
  "luot": [
   "a",
   "ʊ"
  ],
  "am": [
   {
    "f": "assets/am/au-1.mp3?v=7efcc832",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-how.wav",
    "nhan": "how",
    "phu": "gần như chỉ còn /aʊ/, h rất nhẹ"
   }
  ]
 },
 {
  "ma": "ou",
  "ipa": "əʊ",
  "nhom": "doi",
  "ten": "ơ-u",
  "goiY": "Bắt đầu từ \"ơ\" rồi chu môi trượt sang \"u\" — gần \"âu\" tiếng Việt. Không phải một chữ \"ô\" đứng yên.",
  "loi": "Đọc thành \"ô\" đứng yên, không lướt: \"home\" thành \"hôm\", \"coat\" (áo khoác) lẫn với \"caught\" (đã bắt).",
  "ghiChu": "Anh-Mỹ ghi /oʊ/: bắt đầu từ \"ô\" tròn môi chứ không từ \"ơ\" (go /goʊ/), nghe như \"âu\" tròn môi hơn.",
  "vd": [
   {
    "tu": "go",
    "nghia": "đi"
   },
   {
    "tu": "no",
    "nghia": "không"
   },
   {
    "tu": "home",
    "nghia": "nhà"
   }
  ],
  "doi": [
   "oo",
   "o",
   "au"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.45,
   "dauLuoi": 0.1,
   "moiTron": 0.4,
   "hamMo": 0.4
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.7,
   "luoiCao": 0.72,
   "dauLuoi": 0.05,
   "moiTron": 0.65,
   "hamMo": 0.3
  },
  "tac": false,
  "luot": [
   "ə",
   "ʊ"
  ],
  "am": [
   {
    "f": "assets/am/ou-1.mp3?v=6bf9b4a9",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-oh.wav",
    "nhan": "oh",
    "phu": "chính là /əʊ/ đứng riêng"
   }
  ]
 },
 {
  "ma": "ia",
  "ipa": "ɪə",
  "nhom": "doi",
  "ten": "i-ơ",
  "goiY": "Như \"ia\" tiếng Việt: từ \"i\" lỏng trượt xuống \"ơ\" nhẹ. Đầu nhấn, đuôi ơ mờ dần.",
  "loi": "Bỏ đuôi ơ nên \"here\" thành \"hi\", hoặc thêm \"r\" rung kiểu tiếng Việt ở cuối.",
  "ghiChu": "Anh-Mỹ không có nguyên âm đôi này: đọc /ɪ/ rồi r cong lưỡi (near /nɪr/, here /hɪr/).",
  "vd": [
   {
    "tu": "near",
    "nghia": "gần"
   },
   {
    "tu": "here",
    "nghia": "ở đây"
   },
   {
    "tu": "ear",
    "nghia": "cái tai"
   }
  ],
  "doi": [
   "ea",
   "ii"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.25,
   "luoiCao": 0.72,
   "dauLuoi": 0.15,
   "moiTron": 0.35,
   "hamMo": 0.3
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.45,
   "dauLuoi": 0.1,
   "moiTron": 0.4,
   "hamMo": 0.4
  },
  "tac": false,
  "luot": [
   "ɪ",
   "ə"
  ],
  "am": [
   {
    "f": "assets/am/ia-1.mp3?v=d8d7288a",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-ear.wav",
    "nhan": "ear",
    "phu": "giọng Anh không đọc r: chỉ còn /ɪə/"
   }
  ]
 },
 {
  "ma": "ea",
  "ipa": "eə",
  "nhom": "doi",
  "ten": "e-ơ",
  "goiY": "Từ \"e\" trượt nhẹ về \"ơ\", như \"e-ơ\" nói liền một hơi. Hàm gần như không đổi.",
  "loi": "Lẫn với /ɪə/ nên \"hair\" (tóc) nghe thành \"here\" (ở đây), hoặc thêm \"r\" rung ở cuối.",
  "ghiChu": "Anh-Mỹ đọc /e/ rồi r cong lưỡi (hair /her/). Nhiều người Anh trẻ nay đọc thành một âm e dài, gần như không lướt sang ơ.",
  "vd": [
   {
    "tu": "care",
    "nghia": "chăm sóc"
   },
   {
    "tu": "chair",
    "nghia": "cái ghế"
   },
   {
    "tu": "air",
    "nghia": "không khí"
   }
  ],
  "doi": [
   "ia",
   "e"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.12,
   "luoiCao": 0.5,
   "dauLuoi": 0.15,
   "moiTron": 0.15,
   "hamMo": 0.5
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.45,
   "dauLuoi": 0.1,
   "moiTron": 0.4,
   "hamMo": 0.4
  },
  "tac": false,
  "luot": [
   "e",
   "ə"
  ],
  "am": [
   {
    "f": "assets/am/ea-1.mp3?v=ca564d1a",
    "giong": "Anh",
    "tacGia": "Back ache",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-air.wav",
    "nhan": "air",
    "phu": "giọng Anh không đọc r: chỉ còn /eə/"
   }
  ]
 },
 {
  "ma": "ua",
  "ipa": "ʊə",
  "nhom": "doi",
  "ten": "u-ơ",
  "goiY": "Từ \"u\" lỏng, môi hơi tròn, trượt về \"ơ\" nhẹ — như \"ua\" tiếng Việt nói lỏng môi.",
  "loi": "Chu môi căng và kéo dài phần u như \"u\" tiếng Việt, đuôi ơ bị mất.",
  "ghiChu": "Âm đang mất dần: nhiều người Anh nay đọc sure, poor, tour bằng /ɔː/ (/ʃɔː/), Anh-Mỹ thì đọc /ʊ/ rồi r cong lưỡi (tour /tʊr/). Trong các bản thu người thật tìm được, chỉ còn bản đọc riêng ở trên (giọng Úc) và \"tourist\" (giọng Anh) giữ đúng /ʊə/; \"tour\" và \"sure\" ở đây chủ yếu là giọng Mỹ.",
  "vd": [
   {
    "tu": "tour",
    "nghia": "chuyến du lịch"
   },
   {
    "tu": "tourist",
    "nghia": "khách du lịch"
   },
   {
    "tu": "sure",
    "nghia": "chắc chắn"
   }
  ],
  "doi": [
   "oo",
   "uu"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.7,
   "luoiCao": 0.72,
   "dauLuoi": 0.05,
   "moiTron": 0.65,
   "hamMo": 0.3
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.45,
   "luoiCao": 0.45,
   "dauLuoi": 0.1,
   "moiTron": 0.4,
   "hamMo": 0.4
  },
  "tac": false,
  "luot": [
   "ʊ",
   "ə"
  ],
  "am": [
   {
    "f": "assets/am/ua-1.mp3?v=8a8b0303",
    "giong": "Úc",
    "tacGia": "Pvanp7",
    "giayPhep": "CC0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Pvanp7-ʊə_(diphthong).wav",
    "nhan": "âm /ʊə/",
    "phu": "đứng riêng — bản thu riêng duy nhất tìm được"
   }
  ]
 },
 {
  "ma": "p",
  "ipa": "p",
  "nhom": "phu",
  "ten": "p bật hơi",
  "goiY": "Mím hai môi rồi bật mạnh, kèm một luồng hơi phụt. Tự kiểm: cầm tờ giấy trước miệng nói \"pen\", giấy phải bay (hơi phụt rõ nhất ở đầu từ).",
  "loi": "Tiếng Việt gần như không có \"p\" đứng đầu từ nên hay trượt thành \"b\": \"pen\" nghe như \"ben\", \"pig\" như \"big\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "pen",
    "nghia": "cây bút"
   },
   {
    "tu": "pig",
    "nghia": "con lợn"
   },
   {
    "tu": "cup",
    "nghia": "cái tách"
   }
  ],
  "doi": [
   "b",
   "f"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "moi",
   "luoiSau": 0.2,
   "luoiCao": 0.2,
   "dauLuoi": 0.1,
   "moiTron": 0,
   "hamMo": 0
  },
  "tac": true,
  "soCap": {
   "b": [
    "pat",
    "bat"
   ],
   "f": [
    "pat",
    "fat"
   ]
  },
  "am": []
 },
 {
  "ma": "b",
  "ipa": "b",
  "nhom": "phu",
  "ten": "b",
  "goiY": "Mím môi rồi bật nhẹ, không phụt hơi, cổ rung. Tờ giấy trước miệng đứng yên.",
  "loi": "Ở cuối từ hay bị nuốt hoặc ngậm câm như \"p\" tiếng Việt: \"job\" nghe thành \"jóp\", \"cab\" thành \"cáp\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "bed",
    "nghia": "cái giường"
   },
   {
    "tu": "big",
    "nghia": "to, lớn"
   },
   {
    "tu": "bus",
    "nghia": "xe buýt"
   }
  ],
  "doi": [
   "p",
   "v"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "moi",
   "luoiSau": 0.2,
   "luoiCao": 0.2,
   "dauLuoi": 0.1,
   "moiTron": 0,
   "hamMo": 0
  },
  "tac": true,
  "soCap": {
   "p": [
    "bat",
    "pat"
   ]
  },
  "am": []
 },
 {
  "ma": "t",
  "ipa": "t",
  "nhom": "phu",
  "ten": "t bật hơi",
  "goiY": "Đầu lưỡi chạm gờ lợi sau răng trên (không chạm răng), chặn rồi bật. Ở đầu từ có hơi phụt ra — gần \"th\" tiếng Việt hơn là \"t\".",
  "loi": "Đọc như \"t\" tiếng Việt, không bật hơi, nên \"ten\" nghe gần \"den\"; ở cuối từ thì ngậm luôn không nhả.",
  "ghiChu": "Anh-Mỹ: t nằm giữa hai nguyên âm (water, better) đọc lướt nhẹ gần như \"đ\" rất nhanh; Anh-Anh giữ /t/ rõ.",
  "vd": [
   {
    "tu": "ten",
    "nghia": "số mười"
   },
   {
    "tu": "time",
    "nghia": "thời gian"
   },
   {
    "tu": "cat",
    "nghia": "con mèo"
   }
  ],
  "doi": [
   "d",
   "th"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "loi",
   "luoiSau": 0.05,
   "luoiCao": 0.3,
   "dauLuoi": 1,
   "moiTron": 0.2,
   "hamMo": 0.2
  },
  "tac": true,
  "soCap": {
   "d": [
    "hat",
    "had"
   ]
  },
  "am": []
 },
 {
  "ma": "d",
  "ipa": "d",
  "nhom": "phu",
  "ten": "d (gần đ)",
  "goiY": "Đầu lưỡi chạm gờ lợi như /t/ nhưng bật nhẹ, không phụt hơi, cổ rung — gần \"đ\" tiếng Việt.",
  "loi": "Ở cuối từ hay bị nuốt hoặc thành \"t\" câm: \"bed\" nghe như \"bét\", \"played\" như \"play\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "day",
    "nghia": "ngày"
   },
   {
    "tu": "dog",
    "nghia": "con chó"
   },
   {
    "tu": "bed",
    "nghia": "cái giường"
   }
  ],
  "doi": [
   "t",
   "dh"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "loi",
   "luoiSau": 0.05,
   "luoiCao": 0.3,
   "dauLuoi": 1,
   "moiTron": 0.2,
   "hamMo": 0.2
  },
  "tac": true,
  "soCap": {
   "t": [
    "had",
    "hat"
   ]
  },
  "am": []
 },
 {
  "ma": "k",
  "ipa": "k",
  "nhom": "phu",
  "ten": "k bật hơi",
  "goiY": "Phần sau lưỡi nâng lên chặn kín chỗ mềm tít trong miệng rồi bật. Ở đầu từ có hơi phụt: cầm giấy trước miệng nói \"key\", giấy phải bay.",
  "loi": "Không bật hơi ở đầu từ, và ngậm mất ở cuối từ: \"book\" nghe như \"búc\" không nhả.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "cat",
    "nghia": "con mèo"
   },
   {
    "tu": "key",
    "nghia": "chìa khoá"
   },
   {
    "tu": "book",
    "nghia": "quyển sách"
   }
  ],
  "doi": [
   "g"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "vom-mem",
   "luoiSau": 1,
   "luoiCao": 1,
   "dauLuoi": 0,
   "moiTron": 0.2,
   "hamMo": 0.1
  },
  "tac": true,
  "soCap": {
   "g": [
    "back",
    "bag"
   ]
  },
  "am": []
 },
 {
  "ma": "g",
  "ipa": "g",
  "nhom": "phu",
  "ten": "g cứng",
  "goiY": "Chặn kín như /k/ rồi bật, nhưng cổ rung và không phụt hơi. Phải chặn kín hẳn, đừng để hơi lọt xát ra như \"g\" trong \"ga\" tiếng Việt.",
  "loi": "Ở cuối từ hay thành \"k\" câm hoặc mất hẳn: \"big\" nghe như \"bích\", \"bag\" như \"back\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "go",
    "nghia": "đi"
   },
   {
    "tu": "good",
    "nghia": "tốt"
   },
   {
    "tu": "big",
    "nghia": "to, lớn"
   }
  ],
  "doi": [
   "k"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "vom-mem",
   "luoiSau": 1,
   "luoiCao": 1,
   "dauLuoi": 0,
   "moiTron": 0.2,
   "hamMo": 0.1
  },
  "tac": true,
  "soCap": {
   "k": [
    "bag",
    "back"
   ]
  },
  "am": [
   {
    "f": "assets/am/g-1.mp3?v=2b6cb205",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-voiced_velar_stop.ogg",
    "nhan": "[ga] … [aga]",
    "phu": "trong âm tiết · GS ngữ âm Peter Roach"
   }
  ]
 },
 {
  "ma": "f",
  "ipa": "f",
  "nhom": "phu",
  "ten": "f (ph)",
  "goiY": "Răng trên đặt nhẹ lên môi dưới, thổi hơi qua khe — giống \"ph\" tiếng Việt. Không mím hai môi.",
  "loi": "Ở cuối từ hay thành \"p\" hoặc mất hẳn: \"life\" thành \"laip\", \"leaf\" thành \"líp\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "fish",
    "nghia": "con cá"
   },
   {
    "tu": "five",
    "nghia": "số năm"
   },
   {
    "tu": "leaf",
    "nghia": "chiếc lá"
   }
  ],
  "doi": [
   "p",
   "v",
   "th"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "rang",
   "luoiSau": 0.2,
   "luoiCao": 0.25,
   "dauLuoi": 0.1,
   "moiTron": 0,
   "hamMo": 0.15
  },
  "tac": false,
  "soCap": {
   "p": [
    "fat",
    "pat"
   ],
   "v": [
    "safe",
    "save"
   ]
  },
  "am": [
   {
    "f": "assets/am/f-1.mp3?v=057da78f",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-voiceless_labiodental_fricative.ogg",
    "nhan": "[fa] … [afa]",
    "phu": "trong âm tiết · GS ngữ âm Peter Roach"
   }
  ]
 },
 {
  "ma": "v",
  "ipa": "v",
  "nhom": "phu",
  "ten": "v",
  "goiY": "Như /f/ nhưng cổ rung — gần \"v\" giọng Bắc; môi dưới thấy tê tê.",
  "loi": "Giọng Nam hay đọc thành \"d/gi\": \"very\" thành \"gia-ry\". Quên rung cổ thì thành /f/: \"save\" (cứu) thành \"safe\" (an toàn).",
  "ghiChu": "",
  "vd": [
   {
    "tu": "very",
    "nghia": "rất"
   },
   {
    "tu": "van",
    "nghia": "xe tải nhỏ"
   },
   {
    "tu": "five",
    "nghia": "số năm"
   }
  ],
  "doi": [
   "f",
   "w"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "rang",
   "luoiSau": 0.2,
   "luoiCao": 0.25,
   "dauLuoi": 0.1,
   "moiTron": 0,
   "hamMo": 0.15
  },
  "tac": false,
  "soCap": {
   "w": [
    "vine",
    "wine"
   ],
   "f": [
    "save",
    "safe"
   ]
  },
  "am": [
   {
    "f": "assets/am/v-1.mp3?v=1000b3dc",
    "giong": "Anh",
    "tacGia": "Peter Roach",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:PR-voiced_labiodental_fricative.ogg",
    "nhan": "[va] … [ava]",
    "phu": "trong âm tiết · GS ngữ âm Peter Roach"
   }
  ]
 },
 {
  "ma": "th",
  "ipa": "θ",
  "nhom": "phu",
  "ten": "th không rung",
  "goiY": "Đầu lưỡi thò ra giữa hai hàm răng, thổi hơi liên tục — không bật như \"th\" tiếng Việt. Âm rất nhỏ, đó là bình thường.",
  "loi": "Đọc thành \"th\" tiếng Việt hoặc /s/: \"think\" nghe thành \"tink\" hay \"sink\" (chìm).",
  "ghiChu": "",
  "vd": [
   {
    "tu": "think",
    "nghia": "nghĩ"
   },
   {
    "tu": "thank",
    "nghia": "cảm ơn"
   },
   {
    "tu": "mouth",
    "nghia": "cái miệng"
   }
  ],
  "doi": [
   "t",
   "s",
   "dh"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "rang",
   "luoiSau": 0.2,
   "luoiCao": 0.45,
   "dauLuoi": 1,
   "moiTron": 0,
   "hamMo": 0.2
  },
  "tac": false,
  "am": []
 },
 {
  "ma": "dh",
  "ipa": "ð",
  "nhom": "phu",
  "ten": "th có rung",
  "goiY": "Như /θ/ nhưng cổ rung — đầu lưỡi kẹp giữa răng thấy tê tê.",
  "loi": "Đọc thành \"đ\" hoặc \"d\" tiếng Việt: \"they\" nghe thành \"day\" (ngày), \"this\" thành \"đis\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "this",
    "nghia": "cái này"
   },
   {
    "tu": "they",
    "nghia": "họ"
   },
   {
    "tu": "mother",
    "nghia": "mẹ"
   }
  ],
  "doi": [
   "d",
   "z",
   "th"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "rang",
   "luoiSau": 0.2,
   "luoiCao": 0.45,
   "dauLuoi": 1,
   "moiTron": 0,
   "hamMo": 0.2
  },
  "tac": false,
  "am": []
 },
 {
  "ma": "s",
  "ipa": "s",
  "nhom": "phu",
  "ten": "s rít",
  "goiY": "Đầu lưỡi đưa sát gờ lợi sau răng trên nhưng không chạm hẳn, răng gần khít, thổi hơi xì như rắn — như \"x\" tiếng Việt. Cổ không rung.",
  "loi": "Bỏ /s/ ở cuối từ nên mất số nhiều (\"two books\" thành \"two book\"), hoặc lẫn với /ʃ/ nên \"see\" và \"she\" nghe như nhau.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "see",
    "nghia": "nhìn thấy"
   },
   {
    "tu": "sun",
    "nghia": "mặt trời"
   },
   {
    "tu": "bus",
    "nghia": "xe buýt"
   }
  ],
  "doi": [
   "sh",
   "z"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "loi",
   "luoiSau": 0.05,
   "luoiCao": 0.5,
   "dauLuoi": 0.85,
   "moiTron": 0,
   "hamMo": 0.18,
   "khe": 4
  },
  "tac": false,
  "soCap": {
   "sh": [
    "see",
    "she"
   ],
   "z": [
    "price",
    "prize"
   ]
  },
  "am": [
   {
    "f": "assets/am/s-1.mp3?v=43291e38",
    "giong": "Mỹ",
    "tacGia": "Wodencafe",
    "giayPhep": "CC0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-hiss.wav",
    "nhan": "hiss",
    "phu": "/s/ kéo dài ở cuối từ"
   }
  ]
 },
 {
  "ma": "z",
  "ipa": "z",
  "nhom": "phu",
  "ten": "z rung",
  "goiY": "Như /s/ nhưng bật giọng — tiếng ong bay, đặt tay lên cổ thấy rung.",
  "loi": "Ở đầu từ thì quên rung cổ, \"zero\" thành \"sero\". Ở cuối từ thì đọc nguyên âm đứng trước ngắn cụt như trước /s/, nên \"eyes\" (đôi mắt) nghe thành \"ice\" (nước đá).",
  "ghiChu": "Ở cuối từ (eyes, size, dogs), người bản xứ đọc /z/ gần như không rung — đo trên bản thu thấy rõ. Cái làm \"eyes\" khác \"ice\" lúc đó là nguyên âm đứng TRƯỚC: trước /z/ thì kéo dài hơn. Nên khi luyện: rung cổ ở /z/ đầu từ (zebra, zero), còn ở cuối từ thì kéo dài nguyên âm trước nó.",
  "vd": [
   {
    "tu": "zebra",
    "nghia": "ngựa vằn"
   },
   {
    "tu": "zero",
    "nghia": "số không"
   },
   {
    "tu": "size",
    "nghia": "kích cỡ"
   }
  ],
  "doi": [
   "s",
   "jh"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "loi",
   "luoiSau": 0.05,
   "luoiCao": 0.5,
   "dauLuoi": 0.85,
   "moiTron": 0,
   "hamMo": 0.18,
   "khe": 4
  },
  "tac": false,
  "soCap": {
   "s": [
    "prize",
    "price"
   ]
  },
  "am": []
 },
 {
  "ma": "sh",
  "ipa": "ʃ",
  "nhom": "phu",
  "ten": "sh suỵt",
  "goiY": "Như khi bảo người khác im lặng: \"suỵt\". Môi chu ra trước, lưỡi lùi sau chỗ /s/ một chút nên tiếng trầm và dày hơn; cổ không rung.",
  "loi": "Đọc thành /s/ với môi bẹt: \"she\" nghe thành \"see\", \"ship\" thành \"sip\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "she",
    "nghia": "cô ấy"
   },
   {
    "tu": "ship",
    "nghia": "con tàu"
   },
   {
    "tu": "fish",
    "nghia": "con cá"
   }
  ],
  "doi": [
   "s",
   "ch"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.4,
   "luoiCao": 0.72,
   "dauLuoi": 0.6,
   "moiTron": 0.75,
   "hamMo": 0.2,
   "khe": 4
  },
  "tac": false,
  "soCap": {
   "s": [
    "she",
    "see"
   ]
  },
  "am": [
   {
    "f": "assets/am/sh-1.mp3?v=2d89b8a9",
    "giong": "Mỹ",
    "tacGia": "Wodencafe",
    "giayPhep": "CC0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-shh.wav",
    "nhan": "shh",
    "phu": "chính là /ʃ/ đứng riêng (suỵt)"
   }
  ]
 },
 {
  "ma": "zh",
  "ipa": "ʒ",
  "nhom": "phu",
  "ten": "zh rung",
  "goiY": "Như /ʃ/ nhưng cổ rung — môi chu, tiếng dày và trầm hơn /z/.",
  "loi": "Đọc thành /z/ hoặc \"gi\" tiếng Việt với môi bẹt, hoặc quên rung thành /ʃ/, nên mất độ dày và độ trầm của âm.",
  "ghiChu": "Âm hiếm, gần như không bao giờ đứng đầu từ tiếng Anh; hay gặp ở -sure, -sion, -sual (measure, television, usually).",
  "vd": [
   {
    "tu": "measure",
    "nghia": "đo"
   },
   {
    "tu": "usually",
    "nghia": "thường thường"
   },
   {
    "tu": "television",
    "nghia": "ti vi"
   }
  ],
  "doi": [
   "z",
   "sh",
   "jh"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.4,
   "luoiCao": 0.72,
   "dauLuoi": 0.6,
   "moiTron": 0.75,
   "hamMo": 0.2,
   "khe": 4
  },
  "tac": false,
  "am": []
 },
 {
  "ma": "h",
  "ipa": "h",
  "nhom": "phu",
  "ten": "h hà hơi",
  "goiY": "Hà hơi như thổi vào kính cho mờ — giống \"h\" tiếng Việt: miệng hé, không chạm đâu, cổ không rung.",
  "loi": "Gần \"h\" tiếng Việt nên ít sai; chỉ cần nhớ vài từ có chữ h câm: hour, honest.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "he",
    "nghia": "anh ấy"
   },
   {
    "tu": "hat",
    "nghia": "cái mũ"
   },
   {
    "tu": "house",
    "nghia": "ngôi nhà"
   }
  ],
  "doi": [],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.4,
   "luoiCao": 0.3,
   "dauLuoi": 0.1,
   "moiTron": 0.1,
   "hamMo": 0.4
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/h-1.mp3?v=5e797893",
    "giong": "Mỹ",
    "tacGia": "Mova2016",
    "giayPhep": "CC BY-SA 4.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:American_English_sound_\"h\"_(female).wav",
    "nhan": "âm /h/",
    "phu": "đứng riêng và trong âm tiết"
   }
  ]
 },
 {
  "ma": "ch",
  "ipa": "tʃ",
  "nhom": "phu",
  "ten": "ch bật",
  "goiY": "Đầu lưỡi chặn sát sau lợi, môi chu, rồi nhả thành một tiếng \"suỵt\" ngắn — như \"t\" và \"sh\" dính liền. Cổ không rung.",
  "loi": "Đọc thành \"ch\" tiếng Việt (gọn, không có tiếng xì) hoặc thành /ʃ/: \"chip\" nghe thành \"ship\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "chair",
    "nghia": "cái ghế"
   },
   {
    "tu": "cheap",
    "nghia": "rẻ"
   },
   {
    "tu": "watch",
    "nghia": "xem; đồng hồ đeo tay"
   }
  ],
  "doi": [
   "sh",
   "jh"
  ],
  "kh": {
   "rung": false,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.2,
   "luoiCao": 1,
   "dauLuoi": 1,
   "moiTron": 0.75,
   "hamMo": 0.1
  },
  "kh2": {
   "rung": false,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.4,
   "luoiCao": 0.72,
   "dauLuoi": 0.6,
   "moiTron": 0.75,
   "hamMo": 0.2,
   "khe": 4
  },
  "tac": true,
  "am": []
 },
 {
  "ma": "jh",
  "ipa": "dʒ",
  "nhom": "phu",
  "ten": "j (jam)",
  "goiY": "Như /tʃ/ nhưng cổ rung: chặn rồi nhả thành /ʒ/, môi chu ra.",
  "loi": "Đọc thành \"gi\" tiếng Việt (miền Bắc ra /z/, miền Nam ra /j/), mất cú chặn ở đầu: \"job\" nghe như \"gióp\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "job",
    "nghia": "công việc"
   },
   {
    "tu": "jam",
    "nghia": "mứt"
   },
   {
    "tu": "jump",
    "nghia": "nhảy"
   }
  ],
  "doi": [
   "ch",
   "z",
   "y"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.2,
   "luoiCao": 1,
   "dauLuoi": 1,
   "moiTron": 0.75,
   "hamMo": 0.1
  },
  "kh2": {
   "rung": true,
   "mui": false,
   "chamO": "sau-loi",
   "luoiSau": 0.4,
   "luoiCao": 0.72,
   "dauLuoi": 0.6,
   "moiTron": 0.75,
   "hamMo": 0.2,
   "khe": 4
  },
  "tac": true,
  "am": []
 },
 {
  "ma": "m",
  "ipa": "m",
  "nhom": "phu",
  "ten": "m",
  "goiY": "Ngậm hai môi, ngân tiếng lên mũi — giống \"m\" tiếng Việt. Ở cuối từ phải khép môi lại hẳn.",
  "loi": "Ở cuối từ sau nguyên âm đôi hay bị nuốt, vì tiếng Việt không có vần kiểu \"aim\": \"time\" thành \"tai\".",
  "ghiChu": "",
  "vd": [
   {
    "tu": "me",
    "nghia": "tôi"
   },
   {
    "tu": "man",
    "nghia": "người đàn ông"
   },
   {
    "tu": "home",
    "nghia": "nhà"
   }
  ],
  "doi": [
   "n",
   "ng"
  ],
  "kh": {
   "rung": true,
   "mui": true,
   "chamO": "moi",
   "luoiSau": 0.2,
   "luoiCao": 0.2,
   "dauLuoi": 0.1,
   "moiTron": 0,
   "hamMo": 0
  },
  "tac": false,
  "am": [
   {
    "f": "assets/am/m-1.mp3?v=a7f5422b",
    "giong": "Mỹ",
    "tacGia": "Grendelkhan",
    "giayPhep": "CC0",
    "nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-mmm.wav",
    "nhan": "mmm",
    "phu": "chính là /m/ đứng riêng"
   }
  ]
 },
 {
  "ma": "n",
  "ipa": "n",
  "nhom": "phu",
  "ten": "n",
  "goiY": "Đầu lưỡi chạm lợi, ngân tiếng lên mũi. Bịt mũi thì tắc tiếng.",
  "loi": "Một số vùng miền Bắc lẫn với /l/ (\"night\" thành \"light\"); giọng miền Nam hay đọc \"n\" cuối thành \"ng\" (\"ten\" thành \"teng\").",
  "ghiChu": "",
  "vd": [
   {
    "tu": "no",
    "nghia": "không"
   },
   {
    "tu": "name",
    "nghia": "tên"
   },
   {
    "tu": "ten",
    "nghia": "số mười"
   }
  ],
  "doi": [
   "l",
   "ng"
  ],
  "kh": {
   "rung": true,
   "mui": true,
   "chamO": "loi",
   "luoiSau": 0.2,
   "luoiCao": 0.4,
   "dauLuoi": 1,
   "moiTron": 0.2,
   "hamMo": 0.2
  },
  "tac": false,
  "soCap": {
   "l": [
    "night",
    "light"
   ]
  },
  "am": []
 },
 {
  "ma": "ng",
  "ipa": "ŋ",
  "nhom": "phu",
  "ten": "ng",
  "goiY": "Như \"ng\" cuối tiếng Việt: sau lưỡi chạm chỗ mềm tít trong, ngân lên mũi. Đừng bật thêm \"g\" sau nó.",
  "loi": "Lẫn \"ng\" với \"n\" ở cuối từ (nhất là giọng miền Nam), nên \"sing\" và \"sin\" nghe như nhau.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "sing",
    "nghia": "hát"
   },
   {
    "tu": "king",
    "nghia": "nhà vua"
   },
   {
    "tu": "long",
    "nghia": "dài"
   }
  ],
  "doi": [
   "n"
  ],
  "kh": {
   "rung": true,
   "mui": true,
   "chamO": "vom-mem",
   "luoiSau": 1,
   "luoiCao": 1,
   "dauLuoi": 0,
   "moiTron": 0.2,
   "hamMo": 0.1
  },
  "tac": false,
  "soCap": {
   "n": [
    "sing",
    "sin"
   ]
  },
  "am": []
 },
 {
  "ma": "l",
  "ipa": "l",
  "nhom": "phu",
  "ten": "l",
  "goiY": "Đầu lưỡi chạm lợi, hơi ra hai bên lưỡi. Bịt mũi vẫn kêu được — khác /n/.",
  "loi": "Ở cuối từ bị nuốt hoặc thành \"n\": \"tell\" nghe thành \"ten\", \"call\" thành \"co\".",
  "ghiChu": "Ở cuối từ (tell, call, feel) là \"l tối\": sau lưỡi nâng lên, nghe hơi như có \"ô\" chen vào. Đầu lưỡi vẫn phải chạm lợi.",
  "vd": [
   {
    "tu": "leg",
    "nghia": "cái chân"
   },
   {
    "tu": "like",
    "nghia": "thích"
   },
   {
    "tu": "tell",
    "nghia": "kể, bảo"
   }
  ],
  "doi": [
   "n",
   "r"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "loi",
   "luoiSau": 0.55,
   "luoiCao": 0.45,
   "dauLuoi": 1,
   "moiTron": 0.2,
   "hamMo": 0.25
  },
  "tac": false,
  "soCap": {
   "n": [
    "tell",
    "ten"
   ],
   "r": [
    "light",
    "right"
   ]
  },
  "am": []
 },
 {
  "ma": "r",
  "ipa": "r",
  "nhom": "phu",
  "ten": "r cong lưỡi",
  "goiY": "Đầu lưỡi cong lên lơ lửng, KHÔNG chạm vòm hay lợi, môi hơi chu tròn. Không rung đầu lưỡi, không xì thành tiếng \"z\".",
  "loi": "Miền Bắc đọc thành \"z\" (\"rice\" thành \"zai\"), miền Nam rung đầu lưỡi; cả hai đều xa /r/ tiếng Anh.",
  "ghiChu": "Anh-Anh chỉ đọc r khi ngay sau nó là nguyên âm (red, very); r cuối từ hoặc trước phụ âm thì câm (car /kɑː/). Anh-Mỹ đọc mọi chữ r (car /kɑːr/).",
  "vd": [
   {
    "tu": "red",
    "nghia": "màu đỏ"
   },
   {
    "tu": "run",
    "nghia": "chạy"
   },
   {
    "tu": "right",
    "nghia": "đúng; bên phải"
   }
  ],
  "doi": [
   "l",
   "z"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.7,
   "luoiCao": 0.65,
   "dauLuoi": 0.7,
   "moiTron": 0.75,
   "hamMo": 0.3
  },
  "tac": false,
  "soCap": {
   "l": [
    "right",
    "light"
   ]
  },
  "am": [
   {
    "f": "assets/am/r-1.mp3?v=cb73f870",
    "giong": "Mỹ",
    "tacGia": "Erutuon",
    "giayPhep": "CC BY-SA 3.0",
    "nguon": "https://commons.wikimedia.org/wiki/File:Alveolar_approximant.ogg",
    "nhan": "[ra] … [ara]",
    "phu": "trong âm tiết"
   }
  ]
 },
 {
  "ma": "w",
  "ipa": "w",
  "nhom": "phu",
  "ten": "w (u lướt)",
  "goiY": "Chúm tròn môi như sắp nói \"u\" rồi mở nhanh ra nguyên âm sau — như \"u\" lướt trong \"quê\", \"tuy\". Răng không chạm môi — khác /v/.",
  "loi": "Tách thành một tiếng \"u\" riêng (\"we\" thành \"u-i\" hai tiếng), hoặc để răng chạm môi thành /v/.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "we",
    "nghia": "chúng tôi"
   },
   {
    "tu": "wet",
    "nghia": "ướt"
   },
   {
    "tu": "way",
    "nghia": "con đường; cách"
   }
  ],
  "doi": [
   "v"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.9,
   "luoiCao": 0.92,
   "dauLuoi": 0.05,
   "moiTron": 1,
   "hamMo": 0.15
  },
  "tac": false,
  "soCap": {
   "v": [
    "wine",
    "vine"
   ]
  },
  "am": []
 },
 {
  "ma": "y",
  "ipa": "j",
  "nhom": "phu",
  "ten": "y (i lướt)",
  "goiY": "Như \"i\" lướt thật nhanh sang nguyên âm sau — lưng lưỡi nâng sát vòm trên mà không chạm. Không tách thành tiếng \"i\" riêng.",
  "loi": "Tách thành tiếng \"i\" riêng (\"yes\" thành \"i-ét\"), bỏ hẳn nên \"year\" (năm) nghe thành \"ear\" (tai), hoặc đọc như \"d/gi\" miền Bắc thành /z/.",
  "ghiChu": "",
  "vd": [
   {
    "tu": "yes",
    "nghia": "vâng, có"
   },
   {
    "tu": "you",
    "nghia": "bạn"
   },
   {
    "tu": "yellow",
    "nghia": "màu vàng"
   }
  ],
  "doi": [
   "jh"
  ],
  "kh": {
   "rung": true,
   "mui": false,
   "chamO": "khong",
   "luoiSau": 0.15,
   "luoiCao": 1,
   "dauLuoi": 0.2,
   "moiTron": 0,
   "hamMo": 0.1
  },
  "tac": false,
  "am": []
 }
];
const NHOM = [['don', 'Nguyên âm đơn'], ['doi', 'Nguyên âm đôi'], ['phu', 'Phụ âm']];
/* Mã âm trong bài sửa lỗi có khi khác: 'l-toi' là /l/ cuối từ — cùng âm /l/, chỉ khác chỗ đứng. */
const DOI_MA = { 'l-toi': 'l' };
const BANG = {};
for (const a of DS) BANG[a.ma] = a;
function tim(ma) { return BANG[DOI_MA[ma] || ma] || null; }
const api = { DS, NHOM, DOI_MA, BANG, tim };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.TDTD_AMNGUOI = api;
})(typeof self !== 'undefined' ? self : this);

/* SINH TỰ ĐỘNG bởi scripts/lam-tieng-nguoi.py từ content/tu-nguoi.json và content/tu-ipa.json — đừng sửa tay.
   TU: mỗi từ vài bản thu người thật trên Wiktionary (Wikimedia Commons), kèm giọng, người đọc, giấy phép.
       Mỗi bản đã được máy nghe lại (faster-whisper) và phải nghe ra đúng từ đó mới được chọn.
   IPA: phiên âm theo lối từ điển cho người học — Anh-Anh theo Britfone, Anh-Mỹ theo CMUdict, đối chiếu
        với Wiktionary; chỗ các nguồn lệch nhau đã soát tay.
   Ghi công đầy đủ: assets/tu/NGUON.md, và màn "Nguồn tiếng đọc" trong app. */
(function (root) {
'use strict';
const TU = {
"about": [
{
"f": "assets/tu/about-1.mp3?v=2b621e14",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-about.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/about-2.mp3?v=47afabca",
"giayPhep": "CC BY 4.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-about_(improved).ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/about-3.mp3?v=17080b3e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-about.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/about-4.mp3?v=e8cb0a8e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-about.wav",
"tacGia": "Wodencafe"
}
],
"air": [
{
"f": "assets/tu/air-1.mp3?v=3176041d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-air.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/air-2.mp3?v=3d651412",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-air.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/air-3.mp3?v=54edcd6c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-air.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/air-4.mp3?v=ca564d1a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-air.wav",
"tacGia": "Back ache"
}
],
"apple": [
{
"f": "assets/tu/apple-1.mp3?v=0808ef79",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-apple.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/apple-2.mp3?v=ea9df0a4",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-apple.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/apple-3.mp3?v=5fce2765",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-apple.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/apple-4.mp3?v=7f2d7bae",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-apple.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"back": [
{
"f": "assets/tu/back-1.mp3?v=6fff5f48",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-back.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/back-2.mp3?v=35be31de",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-back.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/back-3.mp3?v=c7e62b9a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-back.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/back-4.mp3?v=ee95cd04",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-back.ogg",
"tacGia": "Dvortygirl"
}
],
"bad": [
{
"f": "assets/tu/bad-1.mp3?v=db253b4f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-bad.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/bad-2.mp3?v=db791680",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-bad.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/bad-3.mp3?v=681ceca5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-bad.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/bad-4.mp3?v=79ac1e0a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bad.ogg",
"tacGia": "Dvortygirl"
}
],
"bag": [
{
"f": "assets/tu/bag-1.mp3?v=b38d35b2",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-bag.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/bag-2.mp3?v=ba3c9213",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-bag.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/bag-3.mp3?v=e522f0ce",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-bag.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/bag-4.mp3?v=9c1a7615",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bag.ogg",
"tacGia": "Dvortygirl"
}
],
"ball": [
{
"f": "assets/tu/ball-1.mp3?v=f1379d41",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-ball.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/ball-2.mp3?v=78f9dd1d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ball.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ball-3.mp3?v=a365e7a4",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-ball.wav",
"tacGia": "Wodencafe"
}
],
"banana": [
{
"f": "assets/tu/banana-1.mp3?v=2628b0a2",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-banana.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/banana-2.mp3?v=d3eccba9",
"giayPhep": "Public domain",
"giong": "Anh",
"nguoi": "D3VIL",
"nguon": "https://commons.wikimedia.org/wiki/File:en-uk-banana.ogg",
"tacGia": "D3VIL"
}
],
"bat": [
{
"f": "assets/tu/bat-1.mp3?v=2505f4cb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bat.ogg",
"tacGia": "Dvortygirl"
}
],
"bed": [
{
"f": "assets/tu/bed-1.mp3?v=601dd627",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-bed.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/bed-2.mp3?v=4b7fcbb9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-bed.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/bed-3.mp3?v=21d584a6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-bed.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/bed-4.mp3?v=1550ad2e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-bed.wav",
"tacGia": "Grendelkhan"
}
],
"bee": [
{
"f": "assets/tu/bee-1.mp3?v=17e82bcd",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bee.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/bee-2.mp3?v=3714de2a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-bee.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/bee-3.mp3?v=0f60caf1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-bee.wav",
"tacGia": "Grendelkhan"
}
],
"big": [
{
"f": "assets/tu/big-1.mp3?v=4c4170ba",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-big.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/big-2.mp3?v=a3b2314b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-big.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/big-3.mp3?v=21215fe9",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-big.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/big-4.mp3?v=4e62def8",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-big.wav",
"tacGia": "Back ache"
}
],
"bird": [
{
"f": "assets/tu/bird-1.mp3?v=a34a2096",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-bird.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/bird-2.mp3?v=d0aab66f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bird.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/bird-3.mp3?v=02485b4b",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-bird.wav",
"tacGia": "Back ache"
}
],
"blue": [
{
"f": "assets/tu/blue-1.mp3?v=d9b39e42",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-blue.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/blue-2.mp3?v=8b467359",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-blue.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/blue-3.mp3?v=785cdb50",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-blue.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/blue-4.mp3?v=5ff0ed78",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-blue.ogg",
"tacGia": "Dvortygirl"
}
],
"book": [
{
"f": "assets/tu/book-1.mp3?v=6d39ef67",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-book.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/book-2.mp3?v=d7f612aa",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-book.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/book-3.mp3?v=142f2c16",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-book.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/book-4.mp3?v=9ee1d652",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-book.ogg",
"tacGia": "Dvortygirl"
}
],
"books": [
{
"f": "assets/tu/books-1.mp3?v=10037a3a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-books.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/books-2.mp3?v=d865cc73",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-books.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/books-3.mp3?v=2f3a2e10",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-books.ogg",
"tacGia": "Dvortygirl"
}
],
"box": [
{
"f": "assets/tu/box-1.mp3?v=15c4132e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-box.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/box-2.mp3?v=747eebe7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-box.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/box-3.mp3?v=61a4c7c2",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-box.wav",
"tacGia": "Vealhurl"
},
{
"f": "assets/tu/box-4.mp3?v=3b528c13",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:EN-AU_ck1_box.ogg",
"tacGia": "Commander Keane"
}
],
"boy": [
{
"f": "assets/tu/boy-1.mp3?v=04d3cdb7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-boy.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/boy-2.mp3?v=07ff4034",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-boy.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/boy-3.mp3?v=851e1946",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-boy.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/boy-4.mp3?v=c0a162f7",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Paul2520",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-boy.oga",
"tacGia": "Paul2520"
}
],
"bus": [
{
"f": "assets/tu/bus-1.mp3?v=a8950eeb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-bus.ogg",
"tacGia": "Dvortygirl"
}
],
"buy": [
{
"f": "assets/tu/buy-1.mp3?v=7d6772ea",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-buy.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/buy-2.mp3?v=8e01b412",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-buy.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/buy-3.mp3?v=6c6d35b7",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-buy.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/buy-4.mp3?v=1ff58878",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-buy.wav",
"tacGia": "Back ache"
}
],
"call": [
{
"f": "assets/tu/call-1.mp3?v=0ea30065",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-call.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/call-2.mp3?v=3605770b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-call.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/call-3.mp3?v=737f6d58",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-call.ogg",
"tacGia": "Dvortygirl"
}
],
"car": [
{
"f": "assets/tu/car-1.mp3?v=68bc43df",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-car.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/car-2.mp3?v=9bf0bc24",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-car.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/car-3.mp3?v=30f99ad4",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-car.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/car-4.mp3?v=1db6adc6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-car.wav",
"tacGia": "Back ache"
}
],
"care": [
{
"f": "assets/tu/care-1.mp3?v=7e74cd3f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-care.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/care-2.mp3?v=10606ec5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-care.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/care-3.mp3?v=4b807a75",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-care.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/care-4.mp3?v=3411a2ce",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-care.wav",
"tacGia": "Back ache"
}
],
"cat": [
{
"f": "assets/tu/cat-1.mp3?v=503521ea",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-cat.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/cat-2.mp3?v=99086c4c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-cat.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/cat-3.mp3?v=8e01cad9",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-cat.ogg",
"tacGia": "Dvortygirl"
}
],
"cats": [
{
"f": "assets/tu/cats-1.mp3?v=337839c6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-cats.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/cats-2.mp3?v=416cfa2e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Persent101",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Persent101-cats.wav",
"tacGia": "Persent101"
}
],
"chair": [
{
"f": "assets/tu/chair-1.mp3?v=f0a68a8b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-chair.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/chair-2.mp3?v=5182bc90",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-chair.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/chair-3.mp3?v=54ed20e2",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-chair.ogg",
"tacGia": "Association Shtooka, Judith Franck"
},
{
"f": "assets/tu/chair-4.mp3?v=7c495344",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-chair.wav",
"tacGia": "Grendelkhan"
}
],
"cheap": [
{
"f": "assets/tu/cheap-1.mp3?v=cd7f5380",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-cheap.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/cheap-2.mp3?v=fc74a15a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-cheap.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/cheap-3.mp3?v=68bc357e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-cheap.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/cheap-4.mp3?v=6a4e115d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-cheap.wav",
"tacGia": "Back ache"
}
],
"chip": [
{
"f": "assets/tu/chip-1.mp3?v=9d65619b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-chip.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/chip-2.mp3?v=f65d9a00",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-chip.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/chip-3.mp3?v=f0d1a9ba",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:EN-AU_ck1_chip.ogg",
"tacGia": "Commander Keane"
}
],
"coal": [
{
"f": "assets/tu/coal-1.mp3?v=2cb1de5a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-coal.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/coal-2.mp3?v=5e3d1c9d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-coal.ogg",
"tacGia": "Dvortygirl"
}
],
"coin": [
{
"f": "assets/tu/coin-1.mp3?v=a4bb1fec",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-coin.ogg",
"tacGia": "Dvortygirl"
}
],
"cold": [
{
"f": "assets/tu/cold-1.mp3?v=5571b514",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-cold.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/cold-2.mp3?v=4444c57d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-cold.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/cold-3.mp3?v=2a1fbd65",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-cold.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/cold-4.mp3?v=c8358233",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-cold.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"cool": [
{
"f": "assets/tu/cool-1.mp3?v=59120205",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-cool.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/cool-2.mp3?v=896922e6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-cool.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/cool-3.mp3?v=a6d05fa5",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-cool.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/cool-4.mp3?v=4f6bf63d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-cool.wav",
"tacGia": "Vealhurl"
}
],
"cup": [
{
"f": "assets/tu/cup-1.mp3?v=de904578",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-cup.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/cup-2.mp3?v=7b2d72d1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-cup.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/cup-3.mp3?v=c7358720",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-cup.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/cup-4.mp3?v=fccbcc62",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-cup.wav",
"tacGia": "Back ache"
}
],
"day": [
{
"f": "assets/tu/day-1.mp3?v=db885c89",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-day.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/day-2.mp3?v=3746474b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-day.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/day-3.mp3?v=8e05db58",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-Day.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/day-4.mp3?v=715144a7",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-day.ogg",
"tacGia": "Dvortygirl"
}
],
"dog": [
{
"f": "assets/tu/dog-1.mp3?v=b41b6043",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Tharthan",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-ne-dog.ogg",
"tacGia": "Tharthan"
},
{
"f": "assets/tu/dog-2.mp3?v=fe604529",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-dog.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/dog-3.mp3?v=5758d945",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-dog.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/dog-4.mp3?v=f2bedb7a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-dog.wav",
"tacGia": "Back ache"
}
],
"dogs": [
{
"f": "assets/tu/dogs-1.mp3?v=e5b1178c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-dogs.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/dogs-2.mp3?v=c416e0d7",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-dogs.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/dogs-3.mp3?v=68c76c4a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-dogs.wav",
"tacGia": "Wodencafe"
}
],
"ear": [
{
"f": "assets/tu/ear-1.mp3?v=bd083505",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ear.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ear-2.mp3?v=5ce0d6ec",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-ear.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/ear-3.mp3?v=dc23b55c",
"giayPhep": "Public domain",
"giong": "Anh",
"nguoi": "Chris Melville",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-ear.ogg",
"tacGia": "Chris Melville"
}
],
"eat": [
{
"f": "assets/tu/eat-1.mp3?v=3370b3a1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-eat.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/eat-2.mp3?v=18a6a4fe",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-eat.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/eat-3.mp3?v=3012b5ac",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-eat.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/eat-4.mp3?v=72069aa2",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-eat.wav",
"tacGia": "Back ache"
}
],
"eyes": [
{
"f": "assets/tu/eyes-1.mp3?v=5c448b06",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-eyes.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/eyes-2.mp3?v=9a9b1272",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-eyes.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/eyes-3.mp3?v=cce5bfc5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-eyes.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/eyes-4.mp3?v=a587d20b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-eyes.ogg",
"tacGia": "Dvortygirl"
}
],
"famous": [
{
"f": "assets/tu/famous-1.mp3?v=9630f4b4",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-famous.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/famous-2.mp3?v=aa549603",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-famous.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/famous-3.mp3?v=0c7af0e1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-famous.ogg",
"tacGia": "Dvortygirl"
}
],
"fat": [
{
"f": "assets/tu/fat-1.mp3?v=7286f604",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-fat.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/fat-2.mp3?v=f87d2ac9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-fat.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/fat-3.mp3?v=51fd0338",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-fat.wav",
"tacGia": "Back ache"
}
],
"father": [
{
"f": "assets/tu/father-1.mp3?v=04ff7ed6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-father.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/father-2.mp3?v=59ff4956",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-father.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/father-3.mp3?v=73555785",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-father.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/father-4.mp3?v=deb4b0a1",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-father.wav",
"tacGia": "Back ache"
}
],
"fee": [
{
"f": "assets/tu/fee-1.mp3?v=07aab2a1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-fee.ogg",
"tacGia": "Dvortygirl"
}
],
"feel": [
{
"f": "assets/tu/feel-1.mp3?v=bf545cfc",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-feel.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/feel-2.mp3?v=f190cd7e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-feel.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/feel-3.mp3?v=7b82dc5d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-feel.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/feel-4.mp3?v=cab7afba",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-feel.wav",
"tacGia": "Back ache"
}
],
"feet": [
{
"f": "assets/tu/feet-1.mp3?v=905808b7",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-feet.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/feet-2.mp3?v=cc27c6d6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-feet.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/feet-3.mp3?v=d5da5462",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-feet.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/feet-4.mp3?v=d52c26cf",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-feet.wav",
"tacGia": "Back ache"
}
],
"find": [
{
"f": "assets/tu/find-1.mp3?v=edd1ba2e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-find.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/find-2.mp3?v=f64948c1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-find.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/find-3.mp3?v=978730bf",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-find.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/find-4.mp3?v=6dd7c3f4",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-find.wav",
"tacGia": "Back ache"
}
],
"fine": [
{
"f": "assets/tu/fine-1.mp3?v=bba137ab",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-fine.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/fine-2.mp3?v=0e56acd8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-fine.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/fine-3.mp3?v=ea2a2d74",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-fine.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/fine-4.mp3?v=de08a472",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-fine.wav",
"tacGia": "Back ache"
}
],
"fish": [
{
"f": "assets/tu/fish-1.mp3?v=7f4cff4a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-fish.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/fish-2.mp3?v=7d3eb37b",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-fish.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/fish-3.mp3?v=e02a5a87",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-fish.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/fish-4.mp3?v=e8a765f0",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-fish.wav",
"tacGia": "Wodencafe"
}
],
"fit": [
{
"f": "assets/tu/fit-1.mp3?v=afc2974a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-fit.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/fit-2.mp3?v=75755cca",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-fit.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/fit-3.mp3?v=a3614544",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-fit.ogg",
"tacGia": "Dvortygirl"
}
],
"five": [
{
"f": "assets/tu/five-1.mp3?v=4ede770b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-five.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/five-2.mp3?v=986b3fe5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-five.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/five-3.mp3?v=f40117e1",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-five.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/five-4.mp3?v=7725d397",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-five.wav",
"tacGia": "Back ache"
}
],
"food": [
{
"f": "assets/tu/food-1.mp3?v=44221ab6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-food.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/food-2.mp3?v=b1f98cb9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-food.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/food-3.mp3?v=c5c291a9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-food.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/food-4.mp3?v=04539d14",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-Food.wav",
"tacGia": "Back ache"
}
],
"full": [
{
"f": "assets/tu/full-1.mp3?v=e8771916",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-full.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/full-2.mp3?v=c03f4b0b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-full.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/full-3.mp3?v=4c0d12a0",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-full.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/full-4.mp3?v=95fa8416",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-full.wav",
"tacGia": "Back ache"
}
],
"funny": [
{
"f": "assets/tu/funny-1.mp3?v=1fab6eed",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-funny.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/funny-2.mp3?v=b7f59fbc",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-funny.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/funny-3.mp3?v=818ce06e",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-funny.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/funny-4.mp3?v=37be1753",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-funny.wav",
"tacGia": "Back ache"
}
],
"glass": [
{
"f": "assets/tu/glass-1.mp3?v=864e09e4",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-glass.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/glass-2.mp3?v=84fe4b61",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-glass.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/glass-3.mp3?v=f0e676bf",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-glass.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/glass-4.mp3?v=47731e17",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-glass.ogg",
"tacGia": "Dvortygirl"
}
],
"go": [
{
"f": "assets/tu/go-1.mp3?v=40b6c4df",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-go.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/go-2.mp3?v=e106cbf7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-go.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/go-3.mp3?v=cd837111",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-go.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/go-4.mp3?v=b9d31ffd",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-go.wav",
"tacGia": "Back ache"
}
],
"good": [
{
"f": "assets/tu/good-1.mp3?v=3eba9234",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-good.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/good-2.mp3?v=e7cc9102",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-good.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/good-3.mp3?v=e7838837",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-good.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/good-4.mp3?v=75523ca3",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-good.ogg",
"tacGia": "Dvortygirl"
}
],
"grass": [
{
"f": "assets/tu/grass-1.mp3?v=10251d83",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-grass.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/grass-2.mp3?v=63076136",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-grass.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/grass-3.mp3?v=deafbfa4",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-grass.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/grass-4.mp3?v=8c645909",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-grass.wav",
"tacGia": "Back ache"
}
],
"had": [
{
"f": "assets/tu/had-1.mp3?v=cc048cb1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-had.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/had-2.mp3?v=9cfa6c39",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-had.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/had-3.mp3?v=69c680c0",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-had.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/had-4.mp3?v=bd7d370f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-had.wav",
"tacGia": "Back ache"
}
],
"hand": [
{
"f": "assets/tu/hand-1.mp3?v=bee12c21",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-hand.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/hand-2.mp3?v=d0d162f8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-hand.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/hand-3.mp3?v=f651c1c4",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-hand.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/hand-4.mp3?v=a6d5acb8",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-hand.wav",
"tacGia": "Back ache"
}
],
"hat": [
{
"f": "assets/tu/hat-1.mp3?v=1d038244",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-hat.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/hat-2.mp3?v=619fee2e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-hat.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/hat-3.mp3?v=3c5b5ca1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-hat.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/hat-4.mp3?v=7402b31e",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:en-uk-hat.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"he": [
{
"f": "assets/tu/he-1.mp3?v=3b8bd8ea",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-he.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/he-2.mp3?v=20394b40",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-he.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/he-3.mp3?v=e26b3a30",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-he.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/he-4.mp3?v=49a42200",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-he.ogg",
"tacGia": "Dvortygirl"
}
],
"her": [
{
"f": "assets/tu/her-1.mp3?v=2e862043",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-her.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/her-2.mp3?v=d6b5cd56",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-her.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/her-3.mp3?v=9b4609cc",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-her.wav",
"tacGia": "Back ache"
}
],
"here": [
{
"f": "assets/tu/here-1.mp3?v=010ad33a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-here.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/here-2.mp3?v=343c1e54",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-here.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/here-3.mp3?v=e302f60f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-here.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/here-4.mp3?v=81af52c7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-Here.wav",
"tacGia": "Back ache"
}
],
"home": [
{
"f": "assets/tu/home-1.mp3?v=e0227c7f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-home.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/home-2.mp3?v=4c81ef12",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Flame, not lame",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Flame,_not_lame-Home.wav",
"tacGia": "Flame, not lame"
},
{
"f": "assets/tu/home-3.mp3?v=5bff52ee",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-home.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/home-4.mp3?v=9aa1ff9d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-home.wav",
"tacGia": "Back ache"
}
],
"hot": [
{
"f": "assets/tu/hot-1.mp3?v=987f16e6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-hot.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/hot-2.mp3?v=8677d412",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-hot.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/hot-3.mp3?v=ebb75210",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-hot.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/hot-4.mp3?v=c9282d82",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-hot.wav",
"tacGia": "Back ache"
}
],
"house": [
{
"f": "assets/tu/house-1.mp3?v=1f7f9bf7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-house.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/house-2.mp3?v=313475e0",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-house.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/house-3.mp3?v=4a359aea",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-House.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/house-4.mp3?v=4322b987",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-house-noun.ogg",
"tacGia": "Dvortygirl"
}
],
"ice": [
{
"f": "assets/tu/ice-1.mp3?v=680e159d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ice.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ice-2.mp3?v=153cca5d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-ice.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/ice-3.mp3?v=a6b1e271",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-ice.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"it": [
{
"f": "assets/tu/it-1.mp3?v=860809fd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-it.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/it-2.mp3?v=385c2c06",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-it.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/it-3.mp3?v=76d81558",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-it.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/it-4.mp3?v=86664696",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-it.wav",
"tacGia": "Back ache"
}
],
"jam": [
{
"f": "assets/tu/jam-1.mp3?v=beb66dc1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-jam.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/jam-2.mp3?v=24906416",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-jam.ogg",
"tacGia": "Dvortygirl"
}
],
"job": [
{
"f": "assets/tu/job-1.mp3?v=bb4b592c",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-job.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/job-2.mp3?v=a274bbb5",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-job.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/job-3.mp3?v=b68fb04c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-job.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/job-4.mp3?v=a2b303a9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-job.wav",
"tacGia": "Grendelkhan"
}
],
"jump": [
{
"f": "assets/tu/jump-1.mp3?v=2767f447",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-jump.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/jump-2.mp3?v=0d397299",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-jump.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/jump-3.mp3?v=0ebc9040",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-jump.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/jump-4.mp3?v=a994b0fe",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "TreeMama",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-jump.ogg",
"tacGia": "TreeMama"
}
],
"key": [
{
"f": "assets/tu/key-1.mp3?v=05a89936",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-key.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/key-2.mp3?v=229f7d73",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-key.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/key-3.mp3?v=1dd9ecbd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-key.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/key-4.mp3?v=b9088708",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-key.ogg",
"tacGia": "Dvortygirl"
}
],
"king": [
{
"f": "assets/tu/king-1.mp3?v=417b1ad2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-king.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/king-2.mp3?v=718d0e23",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-king.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/king-3.mp3?v=a5a767eb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-king.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/king-4.mp3?v=28e98708",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-king.wav",
"tacGia": "Back ache"
}
],
"last": [
{
"f": "assets/tu/last-1.mp3?v=3ccf1771",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-last.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/last-2.mp3?v=cd6a2368",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-last.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/last-3.mp3?v=cc6ff187",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-last.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/last-4.mp3?v=0b4faefe",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-last.wav",
"tacGia": "Back ache"
}
],
"leaf": [
{
"f": "assets/tu/leaf-1.mp3?v=070645d0",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-leaf.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/leaf-2.mp3?v=01915195",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-leaf.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/leaf-3.mp3?v=ca1b12a1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-leaf.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/leaf-4.mp3?v=77440eac",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-leaf.wav",
"tacGia": "Back ache"
}
],
"leave": [
{
"f": "assets/tu/leave-1.mp3?v=42d87306",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-leave.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/leave-2.mp3?v=6a2466af",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-leave.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/leave-3.mp3?v=6046e8fc",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-leave.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/leave-4.mp3?v=67a9e014",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-leave.wav",
"tacGia": "Grendelkhan"
}
],
"leg": [
{
"f": "assets/tu/leg-1.mp3?v=a7930b37",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-leg.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/leg-2.mp3?v=1aff4219",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-leg.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/leg-3.mp3?v=d242a8ae",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-leg.ogg",
"tacGia": "Association Shtooka, Judith Franck"
},
{
"f": "assets/tu/leg-4.mp3?v=9850114d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-leg.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"life": [
{
"f": "assets/tu/life-1.mp3?v=1d11c454",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-life.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/life-2.mp3?v=8404874e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-life.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/life-3.mp3?v=e344a713",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Neskaya",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-life.ogg",
"tacGia": "Neskaya"
},
{
"f": "assets/tu/life-4.mp3?v=34a6e2db",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-life.wav",
"tacGia": "Back ache"
}
],
"light": [
{
"f": "assets/tu/light-1.mp3?v=cb128cf6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-light.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/light-2.mp3?v=77f75069",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-light.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/light-3.mp3?v=1f966284",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-light.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/light-4.mp3?v=2cbea77e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-light.wav",
"tacGia": "Back ache"
}
],
"like": [
{
"f": "assets/tu/like-1.mp3?v=31d84fec",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-like.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/like-2.mp3?v=744da6d2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-like.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/like-3.mp3?v=872e2862",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-like.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/like-4.mp3?v=9a349baf",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-like.ogg",
"tacGia": "Dvortygirl"
}
],
"live": [
{
"f": "assets/tu/live-1.mp3?v=32670376",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-live.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/live-2.mp3?v=d85bea3d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-live-verb.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/live-3.mp3?v=5d2c85e6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-live.wav",
"tacGia": "Back ache"
}
],
"long": [
{
"f": "assets/tu/long-1.mp3?v=a796371c",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Muke",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-long.ogg",
"tacGia": "Muke"
},
{
"f": "assets/tu/long-2.mp3?v=8339ce06",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-long.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/long-3.mp3?v=6d150c32",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-long.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/long-4.mp3?v=bddaa284",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-long.wav",
"tacGia": "Back ache"
}
],
"look": [
{
"f": "assets/tu/look-1.mp3?v=efc34c07",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-look.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/look-2.mp3?v=d6bea22d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-look.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/look-3.mp3?v=ccf82435",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-look.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/look-4.mp3?v=1357d8ac",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-look.wav",
"tacGia": "Back ache"
}
],
"love": [
{
"f": "assets/tu/love-1.mp3?v=6990ccfb",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-love.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/love-2.mp3?v=86c9154c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-love.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/love-3.mp3?v=d6ada8fe",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-love.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/love-4.mp3?v=68da5d37",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-love.ogg",
"tacGia": "Dvortygirl"
}
],
"low": [
{
"f": "assets/tu/low-1.mp3?v=fe20e994",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-low.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/low-2.mp3?v=0eabfa3f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-low.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/low-3.mp3?v=ca8c1a21",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-low.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/low-4.mp3?v=1789b8a6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-low.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"made": [
{
"f": "assets/tu/made-1.mp3?v=d6a42401",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-made.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/made-2.mp3?v=7f10e542",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-made.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/made-3.mp3?v=caa4f90f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-made.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/made-4.mp3?v=25d425ba",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-made.wav",
"tacGia": "Back ache"
}
],
"make": [
{
"f": "assets/tu/make-1.mp3?v=86265240",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-make.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/make-2.mp3?v=6092b26b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-make.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/make-3.mp3?v=d8d8c491",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-make.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/make-4.mp3?v=8116fc9d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-make.ogg",
"tacGia": "Dvortygirl"
}
],
"man": [
{
"f": "assets/tu/man-1.mp3?v=b65925e2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-man.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/man-2.mp3?v=abf77e1f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-man.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/man-3.mp3?v=8598646a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-man.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/man-4.mp3?v=859a96c9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-man.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"me": [
{
"f": "assets/tu/me-1.mp3?v=6d14c3b2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-me.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/me-2.mp3?v=aea85e43",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-me.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/me-3.mp3?v=8b006a89",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-me.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/me-4.mp3?v=81e63418",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-me.ogg",
"tacGia": "Dvortygirl"
}
],
"measure": [
{
"f": "assets/tu/measure-1.mp3?v=0aa4427d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-measure.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/measure-2.mp3?v=ed8a28e8",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Muke",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-measure.ogg",
"tacGia": "Muke"
},
{
"f": "assets/tu/measure-3.mp3?v=ecd71181",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "I learned some phrases",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-I_learned_some_phrases-measure.wav",
"tacGia": "I learned some phrases"
}
],
"men": [
{
"f": "assets/tu/men-1.mp3?v=0e7e4d52",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-men.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/men-2.mp3?v=07a016a6",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-men.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/men-3.mp3?v=80dab2b5",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-men.wav",
"tacGia": "Back ache"
}
],
"moon": [
{
"f": "assets/tu/moon-1.mp3?v=d7b146cf",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-moon.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/moon-2.mp3?v=4d1d773b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-moon.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/moon-3.mp3?v=93cdbb76",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-moon.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/moon-4.mp3?v=60168de6",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-moon.ogg",
"tacGia": "Dvortygirl"
}
],
"more": [
{
"f": "assets/tu/more-1.mp3?v=2e019259",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-more.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/more-2.mp3?v=6d0a46cd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-more.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/more-3.mp3?v=3ea7d34c",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-more.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/more-4.mp3?v=2632db6a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-More.wav",
"tacGia": "Back ache"
}
],
"mother": [
{
"f": "assets/tu/mother-1.mp3?v=517bf466",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-mother.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/mother-2.mp3?v=0f63b542",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-mother.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/mother-3.mp3?v=4615e00c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-mother.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/mother-4.mp3?v=e8784fd9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-mother.wav",
"tacGia": "Back ache"
}
],
"mouth": [
{
"f": "assets/tu/mouth-1.mp3?v=fffc5564",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-mouth.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/mouth-2.mp3?v=b6f3b25b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-mouth.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/mouth-3.mp3?v=b8fc829d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-mouth.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/mouth-4.mp3?v=2b6d303a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-mouth.ogg",
"tacGia": "Dvortygirl"
}
],
"my": [
{
"f": "assets/tu/my-1.mp3?v=53a77d21",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-my.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/my-2.mp3?v=b8924b82",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-my.wav",
"tacGia": "Wodencafe"
}
],
"name": [
{
"f": "assets/tu/name-1.mp3?v=b3d15ea0",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-name.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/name-2.mp3?v=40359aa3",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-name.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/name-3.mp3?v=9568bf9b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-name.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/name-4.mp3?v=426229e8",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-name.ogg",
"tacGia": "Dvortygirl"
}
],
"near": [
{
"f": "assets/tu/near-1.mp3?v=456e9865",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-near.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/near-2.mp3?v=ed88fdb4",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-near.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/near-3.mp3?v=dcf50e78",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-near.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/near-4.mp3?v=cb4a6c9e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-near.wav",
"tacGia": "Back ache"
}
],
"night": [
{
"f": "assets/tu/night-1.mp3?v=3926ba6f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-night.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/night-2.mp3?v=e5a5bdd9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-night.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/night-3.mp3?v=5d7104c1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-night.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/night-4.mp3?v=66dfb73c",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-night.wav",
"tacGia": "Back ache"
}
],
"no": [
{
"f": "assets/tu/no-1.mp3?v=cb8d3a93",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-no.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/no-2.mp3?v=b6012a62",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-no.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/no-3.mp3?v=b4b8bf54",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-no.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/no-4.mp3?v=352b95bf",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-no.wav",
"tacGia": "Wodencafe"
}
],
"now": [
{
"f": "assets/tu/now-1.mp3?v=215336e0",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-now.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/now-2.mp3?v=20c6beeb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-now.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/now-3.mp3?v=997bfa02",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-now.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/now-4.mp3?v=7b3a3ee2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-now.wav",
"tacGia": "Grendelkhan"
}
],
"out": [
{
"f": "assets/tu/out-1.mp3?v=0bfbaf17",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-out.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/out-2.mp3?v=a566c112",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-out.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/out-3.mp3?v=8c598f0e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-out.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/out-4.mp3?v=64b49ac1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-out.ogg",
"tacGia": "Dvortygirl"
}
],
"pack": [
{
"f": "assets/tu/pack-1.mp3?v=3d2712db",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pack.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pack-2.mp3?v=8166d7fe",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-pack.wav",
"tacGia": "Wodencafe"
}
],
"park": [
{
"f": "assets/tu/park-1.mp3?v=c5d3a5ae",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-park.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/park-2.mp3?v=fd9302ee",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-park.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/park-3.mp3?v=dbe7bf1b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-park.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/park-4.mp3?v=3b32dc21",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:en-au-park.ogg",
"tacGia": "Commander Keane"
}
],
"pat": [
{
"f": "assets/tu/pat-1.mp3?v=45510b66",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pat.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pat-2.mp3?v=c58af29d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-pat.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/pat-3.mp3?v=10d981b7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:en-au-pat.ogg",
"tacGia": "Commander Keane"
}
],
"pea": [
{
"f": "assets/tu/pea-1.mp3?v=30d9c9a6",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-pea.ogg",
"tacGia": "Dvortygirl"
}
],
"pen": [
{
"f": "assets/tu/pen-1.mp3?v=bd92e2be",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-pen.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/pen-2.mp3?v=bb4a371d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pen.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pen-3.mp3?v=e9701d31",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-pen.ogg",
"tacGia": "Dvortygirl"
}
],
"people": [
{
"f": "assets/tu/people-1.mp3?v=07feb602",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-people.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/people-2.mp3?v=4e49b098",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-people.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/people-3.mp3?v=f010a942",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-people.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/people-4.mp3?v=9ea197e3",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-People.wav",
"tacGia": "Back ache"
}
],
"pick": [
{
"f": "assets/tu/pick-1.mp3?v=ae5bf413",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pick.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pick-2.mp3?v=ce88e0c0",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-pick.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/pick-3.mp3?v=01a6ff2a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-pick.ogg",
"tacGia": "Dvortygirl"
}
],
"pie": [
{
"f": "assets/tu/pie-1.mp3?v=ceb7ccac",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pie.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pie-2.mp3?v=464ab240",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-pie.ogg",
"tacGia": "Dvortygirl"
}
],
"pig": [
{
"f": "assets/tu/pig-1.mp3?v=83bfa540",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pig.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pig-2.mp3?v=91ed69b8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-pig.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/pig-3.mp3?v=367f79f3",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-pig.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/pig-4.mp3?v=deced9fd",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-pig.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"pin": [
{
"f": "assets/tu/pin-1.mp3?v=9566ffca",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-pin.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/pin-2.mp3?v=d91e00c1",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Muke",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-pin.ogg",
"tacGia": "Muke"
},
{
"f": "assets/tu/pin-3.mp3?v=e0f61112",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-pin.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/pin-4.mp3?v=28f5d77f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Canada",
"nguoi": "Tawker",
"nguon": "https://commons.wikimedia.org/wiki/File:En-ca-pin.ogg",
"tacGia": "Tawker"
}
],
"played": [
{
"f": "assets/tu/played-1.mp3?v=1dfc9925",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-played.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/played-2.mp3?v=b7e0a27c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-played.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/played-3.mp3?v=ce679dfc",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-played.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/played-4.mp3?v=c6a2ef37",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-played.wav",
"tacGia": "Back ache"
}
],
"price": [
{
"f": "assets/tu/price-1.mp3?v=094be955",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-price.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/price-2.mp3?v=cc88aacb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-price.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/price-3.mp3?v=75ffc5ac",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-price.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/price-4.mp3?v=afa9486f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-price.wav",
"tacGia": "Wodencafe"
}
],
"prize": [
{
"f": "assets/tu/prize-1.mp3?v=928faca2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-prize.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/prize-2.mp3?v=11d75763",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-prize.ogg",
"tacGia": "Dvortygirl"
}
],
"problem": [
{
"f": "assets/tu/problem-1.mp3?v=d4397f79",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-problem.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/problem-2.mp3?v=96501d1b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-problem.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/problem-3.mp3?v=83a50042",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-problem.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/problem-4.mp3?v=2cb085a2",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-problem.wav",
"tacGia": "Vealhurl"
}
],
"pull": [
{
"f": "assets/tu/pull-1.mp3?v=6a961bf6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-pull.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/pull-2.mp3?v=6339d65a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-pull.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/pull-3.mp3?v=05634494",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:En-au-pull.ogg",
"tacGia": "Commander Keane"
}
],
"red": [
{
"f": "assets/tu/red-1.mp3?v=1b51392b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-red.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/red-2.mp3?v=fee3fea8",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-RED.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/red-3.mp3?v=f9ea4f1e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-red.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/red-4.mp3?v=993a2141",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-red.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"rice": [
{
"f": "assets/tu/rice-1.mp3?v=44836677",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-rice.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/rice-2.mp3?v=7318f264",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-rice.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/rice-3.mp3?v=b240a97f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-rice.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/rice-4.mp3?v=7f83dc20",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:en-uk-rice.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"ride": [
{
"f": "assets/tu/ride-1.mp3?v=57b7a38b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-ride.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/ride-2.mp3?v=0621c17c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ride.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ride-3.mp3?v=bb26513a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-ride.ogg",
"tacGia": "Dvortygirl"
}
],
"right": [
{
"f": "assets/tu/right-1.mp3?v=b6d0f433",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-right.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/right-2.mp3?v=bd4855e8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-right.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/right-3.mp3?v=817310be",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-right.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/right-4.mp3?v=726ee04f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-right.wav",
"tacGia": "Back ache"
}
],
"room": [
{
"f": "assets/tu/room-1.mp3?v=bf509a6d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-room.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/room-2.mp3?v=510edc2d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-room.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/room-3.mp3?v=ecb68624",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-room.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/room-4.mp3?v=7ee88900",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-room.ogg",
"tacGia": "Dvortygirl"
}
],
"run": [
{
"f": "assets/tu/run-1.mp3?v=1c510b4f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-run.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/run-2.mp3?v=946cff9e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-run.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/run-3.mp3?v=f8d72722",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-run.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/run-4.mp3?v=d89b9adf",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-run.ogg",
"tacGia": "Dvortygirl"
}
],
"safe": [
{
"f": "assets/tu/safe-1.mp3?v=39cb2e73",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-safe.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/safe-2.mp3?v=aad13e96",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-safe.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/safe-3.mp3?v=eea75ddc",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-safe.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/safe-4.mp3?v=94bad533",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-safe.wav",
"tacGia": "Back ache"
}
],
"save": [
{
"f": "assets/tu/save-1.mp3?v=89871076",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-save.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/save-2.mp3?v=e51573a1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-save.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/save-3.mp3?v=e67d147e",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-save.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/save-4.mp3?v=d3defa95",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-save.wav",
"tacGia": "Back ache"
}
],
"saw": [
{
"f": "assets/tu/saw-1.mp3?v=59247184",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-saw.wav",
"tacGia": "Wodencafe"
}
],
"school": [
{
"f": "assets/tu/school-1.mp3?v=893f1a71",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-school.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/school-2.mp3?v=d7e965e1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-school.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/school-3.mp3?v=aee08969",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-school.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/school-4.mp3?v=5c9a256a",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-school.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"sea": [
{
"f": "assets/tu/sea-1.mp3?v=5d7cd05f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sea.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/sea-2.mp3?v=a74574c8",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-sea.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/sea-3.mp3?v=9e34cd66",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sea.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sea-4.mp3?v=dda20f16",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-sea.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"seat": [
{
"f": "assets/tu/seat-1.mp3?v=ff5ca36b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-seat.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/seat-2.mp3?v=c727870d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-seat.wav",
"tacGia": "Wodencafe"
}
],
"see": [
{
"f": "assets/tu/see-1.mp3?v=91b48e91",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-see.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/see-2.mp3?v=e92bdbb9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-see.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/see-3.mp3?v=a1d4f849",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-see.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/see-4.mp3?v=42326c8d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-see.wav",
"tacGia": "Grendelkhan"
}
],
"she": [
{
"f": "assets/tu/she-1.mp3?v=1a8958a9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-she.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/she-2.mp3?v=ba3f6d16",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-she.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/she-3.mp3?v=cd61ef60",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-she.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/she-4.mp3?v=721f5f3a",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-she.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"sheep": [
{
"f": "assets/tu/sheep-1.mp3?v=5937be43",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-sheep.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/sheep-2.mp3?v=2033f8e1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sheep.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sheep-3.mp3?v=4cf3a8ca",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-sheep.ogg",
"tacGia": "Dvortygirl"
}
],
"sheet": [
{
"f": "assets/tu/sheet-1.mp3?v=c1134314",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-sheet.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/sheet-2.mp3?v=aa367cff",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-sheet.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"ship": [
{
"f": "assets/tu/ship-1.mp3?v=68bbedab",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-ship.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/ship-2.mp3?v=2f05fd3d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ship.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ship-3.mp3?v=abfc87ea",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-ship.ogg",
"tacGia": "Dvortygirl"
}
],
"shoe": [
{
"f": "assets/tu/shoe-1.mp3?v=dff41b08",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-shoe.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/shoe-2.mp3?v=f9c59032",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-shoe.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/shoe-3.mp3?v=8602c742",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-shoe.ogg",
"tacGia": "Dvortygirl"
}
],
"sin": [
{
"f": "assets/tu/sin-1.mp3?v=851fd5cd",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Muke",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-sin.ogg",
"tacGia": "Muke"
},
{
"f": "assets/tu/sin-2.mp3?v=676a5a5e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sin.wav",
"tacGia": "Grendelkhan"
}
],
"sing": [
{
"f": "assets/tu/sing-1.mp3?v=4df55366",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sing.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/sing-2.mp3?v=99163f83",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-sing.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/sing-3.mp3?v=8ee46de5",
"giayPhep": "Public domain",
"giong": "Anh",
"nguoi": "Celestianpower",
"nguon": "https://commons.wikimedia.org/wiki/File:en-uk-sing.ogg",
"tacGia": "Celestianpower"
}
],
"sink": [
{
"f": "assets/tu/sink-1.mp3?v=09b560af",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sink.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sink-2.mp3?v=4088cc8b",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-sink.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/sink-3.mp3?v=cd351937",
"giayPhep": "Public domain",
"giong": "Anh",
"nguoi": "Celestianpower",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-sink.ogg",
"tacGia": "Celestianpower"
}
],
"sip": [
{
"f": "assets/tu/sip-1.mp3?v=1a0d7fe6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-sip.wav",
"tacGia": "Vealhurl"
}
],
"sit": [
{
"f": "assets/tu/sit-1.mp3?v=143bb4f8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sit.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/sit-2.mp3?v=daba780a",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-sit.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/sit-3.mp3?v=18551e07",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sit.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sit-4.mp3?v=a56c098c",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-sit.wav",
"tacGia": "Back ache"
}
],
"size": [
{
"f": "assets/tu/size-1.mp3?v=3fcbcc4c",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-size.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/size-2.mp3?v=7de37236",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-size.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/size-3.mp3?v=7e4e6892",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-size.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/size-4.mp3?v=48a32905",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-size.ogg",
"tacGia": "Dvortygirl"
}
],
"sky": [
{
"f": "assets/tu/sky-1.mp3?v=cede558e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-sky.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/sky-2.mp3?v=ce2b6abd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sky.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sky-3.mp3?v=837273c5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sky.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/sky-4.mp3?v=03345832",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-sky.ogg",
"tacGia": "Dvortygirl"
}
],
"sofa": [
{
"f": "assets/tu/sofa-1.mp3?v=30fdc8a1",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-sofa.ogg",
"tacGia": "Dvortygirl"
}
],
"spin": [
{
"f": "assets/tu/spin-1.mp3?v=7209cf92",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-spin.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/spin-2.mp3?v=2dfd1a1d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-spin.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/spin-3.mp3?v=7bcd8c94",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:en-au-spin.ogg",
"tacGia": "Commander Keane"
}
],
"star": [
{
"f": "assets/tu/star-1.mp3?v=4e28eb44",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-star.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/star-2.mp3?v=fd9c1cf6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-star.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/star-3.mp3?v=c3880413",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-star.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/star-4.mp3?v=b4cbede2",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-star.wav",
"tacGia": "Back ache"
}
],
"stop": [
{
"f": "assets/tu/stop-1.mp3?v=4ea97abb",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-stop.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/stop-2.mp3?v=49ce636d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-stop.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/stop-3.mp3?v=2001a875",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-stop.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/stop-4.mp3?v=7e087d5f",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-stop.wav",
"tacGia": "Back ache"
}
],
"street": [
{
"f": "assets/tu/street-1.mp3?v=24bfc14b",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-street.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/street-2.mp3?v=832a9ec1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-street.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/street-3.mp3?v=cdb31d53",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-street.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/street-4.mp3?v=fe673f60",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-street.ogg",
"tacGia": "Dvortygirl"
}
],
"sue": [
{
"f": "assets/tu/sue-1.mp3?v=4a278c0b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sue.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sue-2.mp3?v=2f587a79",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Neskaya",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-sue.ogg",
"tacGia": "Neskaya"
}
],
"sun": [
{
"f": "assets/tu/sun-1.mp3?v=f1ad9510",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-sun.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/sun-2.mp3?v=1273d5df",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Persent101",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Persent101-sun.wav",
"tacGia": "Persent101"
},
{
"f": "assets/tu/sun-3.mp3?v=73b3de88",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sun.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sun-4.mp3?v=6bddebb6",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sun.wav",
"tacGia": "Wodencafe"
}
],
"sure": [
{
"f": "assets/tu/sure-1.mp3?v=0582fbe8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-sure.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/sure-2.mp3?v=33f88c73",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-sure.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/sure-3.mp3?v=c170ab7c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Whomping Walrus",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-sure2.ogg",
"tacGia": "Whomping Walrus"
},
{
"f": "assets/tu/sure-4.mp3?v=3782deb4",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-sure.wav",
"tacGia": "Back ache"
}
],
"tea": [
{
"f": "assets/tu/tea-1.mp3?v=6037e31c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-tea.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/tea-2.mp3?v=e0e3dafc",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-tea.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/tea-3.mp3?v=349b15d8",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-tea.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/tea-4.mp3?v=00daafb1",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-tea.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"teacher": [
{
"f": "assets/tu/teacher-1.mp3?v=df325b77",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-teacher.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/teacher-2.mp3?v=5dfc383a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-teacher.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/teacher-3.mp3?v=c528977d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-teacher.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/teacher-4.mp3?v=efcf4607",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-teacher.wav",
"tacGia": "Vealhurl"
}
],
"television": [
{
"f": "assets/tu/television-1.mp3?v=1861b9b2",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-television.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/television-2.mp3?v=d3468ebc",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-television.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/television-3.mp3?v=aedec1c0",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-television.ogg",
"tacGia": "Association Shtooka, Judith Franck"
},
{
"f": "assets/tu/television-4.mp3?v=cd00e112",
"giayPhep": "CC BY-SA 4.0",
"giong": "Canada",
"nguoi": "Ajshul",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Ajshul-television.wav",
"tacGia": "Ajshul"
}
],
"tell": [
{
"f": "assets/tu/tell-1.mp3?v=4bfd788c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-tell.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/tell-2.mp3?v=d43bb47f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-tell.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/tell-3.mp3?v=b6aaa1a6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-tell.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/tell-4.mp3?v=fbcb62ab",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "recorded by Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-tell.ogg",
"tacGia": "recorded by Dvortygirl"
}
],
"ten": [
{
"f": "assets/tu/ten-1.mp3?v=0923d028",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-ten.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/ten-2.mp3?v=cd43e3b9",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-ten.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/ten-3.mp3?v=671d5cf9",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-ten.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/ten-4.mp3?v=8718ebf0",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "TheDaveRoss",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-ten.ogg",
"tacGia": "TheDaveRoss"
}
],
"thank": [
{
"f": "assets/tu/thank-1.mp3?v=1092ddbf",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-thank.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/thank-2.mp3?v=398a8f15",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-thank.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/thank-3.mp3?v=da362631",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-thank.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/thank-4.mp3?v=ecdc5749",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-thank.wav",
"tacGia": "Back ache"
}
],
"they": [
{
"f": "assets/tu/they-1.mp3?v=9950f72b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-they.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/they-2.mp3?v=1740ae6e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-they.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/they-3.mp3?v=cae0dea2",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-they.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/they-4.mp3?v=08409fd7",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-they.wav",
"tacGia": "Back ache"
}
],
"think": [
{
"f": "assets/tu/think-1.mp3?v=a42aa508",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-think.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/think-2.mp3?v=78261fab",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-think.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/think-3.mp3?v=6345f6bf",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-think.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/think-4.mp3?v=93495873",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-think.ogg",
"tacGia": "Dvortygirl"
}
],
"this": [
{
"f": "assets/tu/this-1.mp3?v=7ec455be",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-this.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/this-2.mp3?v=b0fb7bac",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-this.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/this-3.mp3?v=1ba7625f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-this.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/this-4.mp3?v=a153e2b1",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-this.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"three": [
{
"f": "assets/tu/three-1.mp3?v=f7999b58",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-three.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/three-2.mp3?v=1e4cf8fe",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-three.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/three-3.mp3?v=554ea9a8",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-three.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/three-4.mp3?v=6ac98da3",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-three.ogg",
"tacGia": "Dvortygirl"
}
],
"time": [
{
"f": "assets/tu/time-1.mp3?v=adc9cc9c",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-time.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/time-2.mp3?v=f913d93d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-time.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/time-3.mp3?v=2166327d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-time.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/time-4.mp3?v=934007b0",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-time.ogg",
"tacGia": "Dvortygirl"
}
],
"top": [
{
"f": "assets/tu/top-1.mp3?v=8455b865",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-top.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/top-2.mp3?v=be7c16e5",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-top.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/top-3.mp3?v=2aba7291",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-top.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/top-4.mp3?v=32d419e1",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-top.wav",
"tacGia": "Back ache"
}
],
"tour": [
{
"f": "assets/tu/tour-1.mp3?v=c301ed29",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-tour.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/tour-2.mp3?v=36fada8f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-tour.ogg",
"tacGia": "Dvortygirl"
}
],
"tourist": [
{
"f": "assets/tu/tourist-1.mp3?v=aca962a3",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Vealhurl",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Vealhurl-tourist.wav",
"tacGia": "Vealhurl"
}
],
"toy": [
{
"f": "assets/tu/toy-1.mp3?v=e054e2e3",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-toy.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/toy-2.mp3?v=61edc00a",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-toy.ogg",
"tacGia": "Dvortygirl"
}
],
"tree": [
{
"f": "assets/tu/tree-1.mp3?v=9ab0a624",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-tree.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/tree-2.mp3?v=844c9746",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-tree.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/tree-3.mp3?v=7db37397",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-tree.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/tree-4.mp3?v=316ac821",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-tree.wav",
"tacGia": "Naomi Persephone Amethyst"
}
],
"turn": [
{
"f": "assets/tu/turn-1.mp3?v=fb110ab6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-turn.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/turn-2.mp3?v=b46b9c2e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-turn.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/turn-3.mp3?v=7f573dba",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-turn.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/turn-4.mp3?v=8b005e51",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-turn.wav",
"tacGia": "Back ache"
}
],
"usually": [
{
"f": "assets/tu/usually-1.mp3?v=4fb1fe43",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-usually.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/usually-2.mp3?v=df2a4088",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-usually.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/usually-3.mp3?v=02325dbe",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-usually.ogg",
"tacGia": "Dvortygirl"
}
],
"van": [
{
"f": "assets/tu/van-1.mp3?v=d2901208",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-van.ogg",
"tacGia": "Dvortygirl"
}
],
"very": [
{
"f": "assets/tu/very-1.mp3?v=bc6d18cd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-very.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/very-2.mp3?v=ff896340",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-very.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/very-3.mp3?v=c6c17962",
"giayPhep": "Public domain",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-very.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/very-4.mp3?v=658d4223",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-very.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"vest": [
{
"f": "assets/tu/vest-1.mp3?v=fb61d625",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-vest.ogg",
"tacGia": "Dvortygirl"
}
],
"vine": [
{
"f": "assets/tu/vine-1.mp3?v=45e53f33",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-vine.ogg",
"tacGia": "Dvortygirl"
}
],
"vote": [
{
"f": "assets/tu/vote-1.mp3?v=a4103319",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-vote.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/vote-2.mp3?v=e523a641",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-vote.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/vote-3.mp3?v=6d0db73d",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-vote.ogg",
"tacGia": "Dvortygirl"
}
],
"wash": [
{
"f": "assets/tu/wash-1.mp3?v=1ffeb312",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-wash.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/wash-2.mp3?v=655e6575",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-wash.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/wash-3.mp3?v=0f4afa7c",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-wash.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/wash-4.mp3?v=db501935",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-wash.ogg",
"tacGia": "Dvortygirl"
}
],
"watch": [
{
"f": "assets/tu/watch-1.mp3?v=a0650ece",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-watch.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/watch-2.mp3?v=2d97047d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-watch.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/watch-3.mp3?v=fabc099f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-watch.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/watch-4.mp3?v=00a403d7",
"giayPhep": "Public domain",
"giong": "Anh",
"nguoi": "SeanCollins and Emily",
"nguon": "https://commons.wikimedia.org/wiki/File:en-gb-watch.ogg",
"tacGia": "SeanCollins and Emily"
}
],
"way": [
{
"f": "assets/tu/way-1.mp3?v=034b7e58",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-way.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/way-2.mp3?v=c41d142e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-way.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/way-3.mp3?v=34b0a54f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-way.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/way-4.mp3?v=006d2d72",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-way.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"we": [
{
"f": "assets/tu/we-1.mp3?v=0ad5cb3e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-we.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/we-2.mp3?v=49e492d1",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-we.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/we-3.mp3?v=0f11f0e8",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-we.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/we-4.mp3?v=bbad82c8",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-we.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"week": [
{
"f": "assets/tu/week-1.mp3?v=12ada1a6",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-week.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/week-2.mp3?v=327b2bfd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-week.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/week-3.mp3?v=a457f199",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-week.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/week-4.mp3?v=fdb7cd97",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-week.ogg",
"tacGia": "Dvortygirl"
}
],
"well": [
{
"f": "assets/tu/well-1.mp3?v=725acc61",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-well.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/well-2.mp3?v=f7aefca4",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-well.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/well-3.mp3?v=0b3a5a9e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-well.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/well-4.mp3?v=06ddd17a",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-well.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"west": [
{
"f": "assets/tu/west-1.mp3?v=edfe0ceb",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-west.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/west-2.mp3?v=606ad90e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-west.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/west-3.mp3?v=a27411cd",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-west.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/west-4.mp3?v=eb06cd29",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-west.wav",
"tacGia": "Wodencafe"
}
],
"wet": [
{
"f": "assets/tu/wet-1.mp3?v=0dc8e39d",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-wet.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/wet-2.mp3?v=fb5aa30d",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-wet.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/wet-3.mp3?v=66916f61",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-wet.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/wet-4.mp3?v=8b1a654e",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-wet.ogg",
"tacGia": "Dvortygirl"
}
],
"when": [
{
"f": "assets/tu/when-1.mp3?v=830e969b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-when.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/when-2.mp3?v=5c517182",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-when.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/when-3.mp3?v=7cc2a332",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-When.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/when-4.mp3?v=3229e27d",
"giayPhep": "CC BY 3.0 us",
"giong": "Anh",
"nguoi": "Judith Franck",
"nguon": "https://commons.wikimedia.org/wiki/File:En-uk-when.ogg",
"tacGia": "Association Shtooka, Judith Franck"
}
],
"wife": [
{
"f": "assets/tu/wife-1.mp3?v=11ea4a58",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-wife.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/wife-2.mp3?v=a48f7da4",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-wife.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/wife-3.mp3?v=fc7f812e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-wife.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/wife-4.mp3?v=879e28e1",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-wife.wav",
"tacGia": "Back ache"
}
],
"wine": [
{
"f": "assets/tu/wine-1.mp3?v=2318866e",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-wine.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/wine-2.mp3?v=78e88e46",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-wine.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/wine-3.mp3?v=a8ba2c6f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-wine.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/wine-4.mp3?v=740ac63a",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-wine.wav",
"tacGia": "Wodencafe"
}
],
"wipe": [
{
"f": "assets/tu/wipe-1.mp3?v=b9adb81f",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-wipe.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/wipe-2.mp3?v=b92c632f",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-wipe.ogg",
"tacGia": "Dvortygirl"
}
],
"work": [
{
"f": "assets/tu/work-1.mp3?v=a3314992",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-work.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/work-2.mp3?v=c85583c0",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-work.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/work-3.mp3?v=206e6e9e",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-work.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/work-4.mp3?v=6bd8e69e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-Work.wav",
"tacGia": "Back ache"
}
],
"write": [
{
"f": "assets/tu/write-1.mp3?v=eb023249",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-write.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/write-2.mp3?v=83088c20",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-write.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/write-3.mp3?v=e0e087a8",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-write.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/write-4.mp3?v=95d1abd4",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-write.wav",
"tacGia": "Back ache"
}
],
"yellow": [
{
"f": "assets/tu/yellow-1.mp3?v=204ea9fc",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-yellow.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/yellow-2.mp3?v=d04ea3d8",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-yellow.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/yellow-3.mp3?v=3c6048cb",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-yellow.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/yellow-4.mp3?v=c07ef014",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-yellow.wav",
"tacGia": "Back ache"
}
],
"yes": [
{
"f": "assets/tu/yes-1.mp3?v=32c30712",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-yes.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/yes-2.mp3?v=43381095",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-yes.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/yes-3.mp3?v=271ff801",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-yes.ogg",
"tacGia": "Dvortygirl"
},
{
"f": "assets/tu/yes-4.mp3?v=6b927a0e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-yes.wav",
"tacGia": "Back ache"
}
],
"you": [
{
"f": "assets/tu/you-1.mp3?v=17f1d69e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Mỹ",
"nguoi": "Naomi Persephone Amethyst",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Naomi_Persephone_Amethyst_(NaomiAmethyst)-you.wav",
"tacGia": "Naomi Persephone Amethyst"
},
{
"f": "assets/tu/you-2.mp3?v=6a05d556",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-you.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/you-3.mp3?v=0691039b",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Wodencafe",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Wodencafe-you.wav",
"tacGia": "Wodencafe"
},
{
"f": "assets/tu/you-4.mp3?v=158651ac",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:En-us-you.ogg",
"tacGia": "Dvortygirl"
}
],
"zebra": [
{
"f": "assets/tu/zebra-1.mp3?v=3dfa8759",
"giayPhep": "CC BY-SA 4.0",
"giong": "Anh",
"nguoi": "Back ache",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Back_ache-Zebra.wav",
"tacGia": "Back ache"
},
{
"f": "assets/tu/zebra-2.mp3?v=13d79215",
"giayPhep": "CC BY-SA 3.0",
"giong": "Mỹ",
"nguoi": "Dvortygirl",
"nguon": "https://commons.wikimedia.org/wiki/File:en-us-zebra.ogg",
"tacGia": "Dvortygirl"
}
],
"zero": [
{
"f": "assets/tu/zero-1.mp3?v=9817a656",
"giayPhep": "CC0",
"giong": "Mỹ",
"nguoi": "Grendelkhan",
"nguon": "https://commons.wikimedia.org/wiki/File:LL-Q1860_(eng)-Grendelkhan-zero.wav",
"tacGia": "Grendelkhan"
},
{
"f": "assets/tu/zero-2.mp3?v=4f2f236e",
"giayPhep": "CC BY-SA 4.0",
"giong": "Úc",
"nguoi": "Commander Keane",
"nguon": "https://commons.wikimedia.org/wiki/File:En-au-zero.ogg",
"tacGia": "Commander Keane"
}
]
};
const IPA = {"about": ["/əˈbaʊt/", "/əˈbaʊt/"], "air": ["/eə/", "/er/"], "apple": ["/ˈæpəl/", "/ˈæpəl/"], "back": ["/bæk/", "/bæk/"], "bad": ["/bæd/", "/bæd/"], "bag": ["/bæg/", "/bæg/"], "ball": ["/bɔːl/", "/bɔːl/"], "banana": ["/bəˈnɑːnə/", "/bəˈnænə/"], "bat": ["/bæt/", "/bæt/"], "bed": ["/bed/", "/bed/"], "bee": ["/biː/", "/biː/"], "big": ["/bɪg/", "/bɪg/"], "bird": ["/bɜːd/", "/bɝːd/"], "blue": ["/bluː/", "/bluː/"], "book": ["/bʊk/", "/bʊk/"], "books": ["/bʊks/", "/bʊks/"], "box": ["/bɒks/", "/bɑːks/"], "boy": ["/bɔɪ/", "/bɔɪ/"], "bus": ["/bʌs/", "/bʌs/"], "buy": ["/baɪ/", "/baɪ/"], "call": ["/kɔːl/", "/kɔːl/"], "car": ["/kɑː/", "/kɑːr/"], "care": ["/keə/", "/ker/"], "cat": ["/kæt/", "/kæt/"], "cats": ["/kæts/", "/kæts/"], "chair": ["/tʃeə/", "/tʃer/"], "cheap": ["/tʃiːp/", "/tʃiːp/"], "chip": ["/tʃɪp/", "/tʃɪp/"], "coal": ["/kəʊl/", "/koʊl/"], "coin": ["/kɔɪn/", "/kɔɪn/"], "cold": ["/kəʊld/", "/koʊld/"], "cool": ["/kuːl/", "/kuːl/"], "cup": ["/kʌp/", "/kʌp/"], "day": ["/deɪ/", "/deɪ/"], "dog": ["/dɒg/", "/dɔːg/"], "dogs": ["/dɒgz/", "/dɔːgz/"], "ear": ["/ɪə/", "/ɪr/"], "eat": ["/iːt/", "/iːt/"], "eyes": ["/aɪz/", "/aɪz/"], "famous": ["/ˈfeɪməs/", "/ˈfeɪməs/"], "fat": ["/fæt/", "/fæt/"], "father": ["/ˈfɑːðə/", "/ˈfɑːðɚ/"], "fee": ["/fiː/", "/fiː/"], "feel": ["/fiːl/", "/fiːl/"], "feet": ["/fiːt/", "/fiːt/"], "find": ["/faɪnd/", "/faɪnd/"], "fine": ["/faɪn/", "/faɪn/"], "fish": ["/fɪʃ/", "/fɪʃ/"], "fit": ["/fɪt/", "/fɪt/"], "five": ["/faɪv/", "/faɪv/"], "food": ["/fuːd/", "/fuːd/"], "full": ["/fʊl/", "/fʊl/"], "funny": ["/ˈfʌni/", "/ˈfʌni/"], "glass": ["/glɑːs/", "/glæs/"], "go": ["/gəʊ/", "/goʊ/"], "good": ["/gʊd/", "/gʊd/"], "grass": ["/grɑːs/", "/græs/"], "had": ["/hæd/", "/hæd/"], "hand": ["/hænd/", "/hænd/"], "hat": ["/hæt/", "/hæt/"], "he": ["/hiː/", "/hiː/"], "her": ["/hɜː/", "/hɝː/"], "here": ["/hɪə/", "/hɪr/"], "home": ["/həʊm/", "/hoʊm/"], "hot": ["/hɒt/", "/hɑːt/"], "house": ["/haʊs/", "/haʊs/"], "ice": ["/aɪs/", "/aɪs/"], "it": ["/ɪt/", "/ɪt/"], "jam": ["/dʒæm/", "/dʒæm/"], "job": ["/dʒɒb/", "/dʒɑːb/"], "jump": ["/dʒʌmp/", "/dʒʌmp/"], "key": ["/kiː/", "/kiː/"], "king": ["/kɪŋ/", "/kɪŋ/"], "last": ["/lɑːst/", "/læst/"], "leaf": ["/liːf/", "/liːf/"], "leave": ["/liːv/", "/liːv/"], "leg": ["/leg/", "/leg/"], "life": ["/laɪf/", "/laɪf/"], "light": ["/laɪt/", "/laɪt/"], "like": ["/laɪk/", "/laɪk/"], "live": ["/lɪv/", "/lɪv/"], "long": ["/lɒŋ/", "/lɔːŋ/"], "look": ["/lʊk/", "/lʊk/"], "love": ["/lʌv/", "/lʌv/"], "low": ["/ləʊ/", "/loʊ/"], "made": ["/meɪd/", "/meɪd/"], "make": ["/meɪk/", "/meɪk/"], "man": ["/mæn/", "/mæn/"], "me": ["/miː/", "/miː/"], "measure": ["/ˈmeʒə/", "/ˈmeʒɚ/"], "men": ["/men/", "/men/"], "moon": ["/muːn/", "/muːn/"], "more": ["/mɔː/", "/mɔːr/"], "mother": ["/ˈmʌðə/", "/ˈmʌðɚ/"], "mouth": ["/maʊθ/", "/maʊθ/"], "my": ["/maɪ/", "/maɪ/"], "name": ["/neɪm/", "/neɪm/"], "near": ["/nɪə/", "/nɪr/"], "night": ["/naɪt/", "/naɪt/"], "no": ["/nəʊ/", "/noʊ/"], "now": ["/naʊ/", "/naʊ/"], "out": ["/aʊt/", "/aʊt/"], "pack": ["/pæk/", "/pæk/"], "park": ["/pɑːk/", "/pɑːrk/"], "pat": ["/pæt/", "/pæt/"], "pea": ["/piː/", "/piː/"], "pen": ["/pen/", "/pen/"], "people": ["/ˈpiːpəl/", "/ˈpiːpəl/"], "pick": ["/pɪk/", "/pɪk/"], "pie": ["/paɪ/", "/paɪ/"], "pig": ["/pɪg/", "/pɪg/"], "pin": ["/pɪn/", "/pɪn/"], "played": ["/pleɪd/", "/pleɪd/"], "price": ["/praɪs/", "/praɪs/"], "prize": ["/praɪz/", "/praɪz/"], "problem": ["/ˈprɒbləm/", "/ˈprɑːbləm/"], "pull": ["/pʊl/", "/pʊl/"], "red": ["/red/", "/red/"], "rice": ["/raɪs/", "/raɪs/"], "ride": ["/raɪd/", "/raɪd/"], "right": ["/raɪt/", "/raɪt/"], "room": ["/ruːm/", "/ruːm/"], "run": ["/rʌn/", "/rʌn/"], "safe": ["/seɪf/", "/seɪf/"], "save": ["/seɪv/", "/seɪv/"], "saw": ["/sɔː/", "/sɔː/"], "school": ["/skuːl/", "/skuːl/"], "sea": ["/siː/", "/siː/"], "seat": ["/siːt/", "/siːt/"], "see": ["/siː/", "/siː/"], "she": ["/ʃiː/", "/ʃiː/"], "sheep": ["/ʃiːp/", "/ʃiːp/"], "sheet": ["/ʃiːt/", "/ʃiːt/"], "ship": ["/ʃɪp/", "/ʃɪp/"], "shoe": ["/ʃuː/", "/ʃuː/"], "sin": ["/sɪn/", "/sɪn/"], "sing": ["/sɪŋ/", "/sɪŋ/"], "sink": ["/sɪŋk/", "/sɪŋk/"], "sip": ["/sɪp/", "/sɪp/"], "sit": ["/sɪt/", "/sɪt/"], "size": ["/saɪz/", "/saɪz/"], "sky": ["/skaɪ/", "/skaɪ/"], "sofa": ["/ˈsəʊfə/", "/ˈsoʊfə/"], "spin": ["/spɪn/", "/spɪn/"], "star": ["/stɑː/", "/stɑːr/"], "stop": ["/stɒp/", "/stɑːp/"], "street": ["/striːt/", "/striːt/"], "sue": ["/suː/", "/suː/"], "sun": ["/sʌn/", "/sʌn/"], "sure": ["/ʃʊə/", "/ʃʊr/"], "tea": ["/tiː/", "/tiː/"], "teacher": ["/ˈtiːtʃə/", "/ˈtiːtʃɚ/"], "television": ["/ˈtelɪvɪʒən/", "/ˈteləvɪʒən/"], "tell": ["/tel/", "/tel/"], "ten": ["/ten/", "/ten/"], "thank": ["/θæŋk/", "/θæŋk/"], "they": ["/ðeɪ/", "/ðeɪ/"], "think": ["/θɪŋk/", "/θɪŋk/"], "this": ["/ðɪs/", "/ðɪs/"], "three": ["/θriː/", "/θriː/"], "time": ["/taɪm/", "/taɪm/"], "top": ["/tɒp/", "/tɑːp/"], "tour": ["/tʊə/", "/tʊr/"], "tourist": ["/ˈtʊərɪst/", "/ˈtʊrəst/"], "toy": ["/tɔɪ/", "/tɔɪ/"], "tree": ["/triː/", "/triː/"], "turn": ["/tɜːn/", "/tɝːn/"], "usually": ["/ˈjuːʒʊəli/", "/ˈjuːʒuəli/"], "van": ["/væn/", "/væn/"], "very": ["/ˈveri/", "/ˈveri/"], "vest": ["/vest/", "/vest/"], "vine": ["/vaɪn/", "/vaɪn/"], "vote": ["/vəʊt/", "/voʊt/"], "wash": ["/wɒʃ/", "/wɑːʃ/"], "watch": ["/wɒtʃ/", "/wɑːtʃ/"], "way": ["/weɪ/", "/weɪ/"], "we": ["/wiː/", "/wiː/"], "week": ["/wiːk/", "/wiːk/"], "well": ["/wel/", "/wel/"], "west": ["/west/", "/west/"], "wet": ["/wet/", "/wet/"], "when": ["/wen/", "/wen/"], "wife": ["/waɪf/", "/waɪf/"], "wine": ["/waɪn/", "/waɪn/"], "wipe": ["/waɪp/", "/waɪp/"], "work": ["/wɜːk/", "/wɝːk/"], "write": ["/raɪt/", "/raɪt/"], "yellow": ["/ˈjeləʊ/", "/ˈjeloʊ/"], "yes": ["/jes/", "/jes/"], "you": ["/juː/", "/juː/"], "zebra": ["/ˈzebrə/", "/ˈziːbrə/"], "zero": ["/ˈzɪərəʊ/", "/ˈzɪroʊ/"]};
const GIAY_PHEP_URL = {"CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/", "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/", "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/", "CC BY 3.0 us": "https://creativecommons.org/licenses/by/3.0/us/", "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/", "CC BY 2.5": "https://creativecommons.org/licenses/by/2.5/", "CC BY-SA 2.5": "https://creativecommons.org/licenses/by-sa/2.5/", "CC0": "https://creativecommons.org/publicdomain/zero/1.0/", "Public domain": ""};
/* Từ đồng âm thật và chữ số: phần nói thử chấm khớp nguyên từ, mà máy nhận giọng hay ghi "five" thành "5", "see" thành "sea". */
const DONG = {"bee": ["b", "be"], "buy": ["by", "bye"], "eye": ["i", "aye"], "feet": ["feat"], "five": ["5"], "hear": ["here"], "here": ["hear"], "know": ["no"], "made": ["maid"], "night": ["knight"], "no": ["know"], "pea": ["p", "pee"], "red": ["read"], "right": ["write", "rite"], "sea": ["c", "see"], "see": ["c", "sea"], "shoe": ["shoo"], "sun": ["son"], "tea": ["t", "tee"], "ten": ["10"], "three": ["3"], "too": ["two", "to", "2"], "way": ["weigh"], "week": ["weak"], "whale": ["wail"], "wine": ["whine"], "write": ["right", "rite"], "zero": ["0"]};
const chuan = (chu) => String(chu || '').toLowerCase().trim();
function tim(chu) { return TU[chuan(chu)] || null; }
function ipa(chu) { return IPA[chuan(chu)] || null; }
const api = { TU, IPA, GIAY_PHEP_URL, DONG, tim, ipa };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.TDTD_TUNGUOI = api;
})(typeof self !== 'undefined' ? self : this);

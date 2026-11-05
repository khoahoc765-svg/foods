const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Shipper = require('./models/Shipper');
const Recipe = require('./models/Recipe');
const Order = require('./models/Order');

const ALL_DISHES = [
  { id: 'pho-bo', name: 'Phở bò', cuisine: 'viet', price: 55000 },
  { id: 'banh-mi', name: 'Bánh mì', cuisine: 'viet', price: 25000 },
  { id: 'bun-cha', name: 'Bún chả', cuisine: 'viet', price: 45000 },
  { id: 'com-tam', name: 'Cơm tấm', cuisine: 'viet', price: 45000 },
  { id: 'banh-xeo', name: 'Bánh xèo', cuisine: 'viet', price: 60000 },
  { id: 'sushi', name: 'Sushi', cuisine: 'nhat', price: 95000 },
  { id: 'ramen', name: 'Ramen', cuisine: 'nhat', price: 89000 },
  { id: 'com-ca-ri', name: 'Cơm cà ri Nhật', cuisine: 'nhat', price: 75000 },
  { id: 'onigiri', name: 'Onigiri', cuisine: 'nhat', price: 30000 },
  { id: 'udon', name: 'Udon', cuisine: 'nhat', price: 85000 },
  { id: 'bibimbap', name: 'Bibimbap', cuisine: 'han', price: 69000 },
  { id: 'tteokbokki', name: 'Tteokbokki', cuisine: 'han', price: 55000 },
  { id: 'ga-ran', name: 'Gà rán Hàn Quốc', cuisine: 'han', price: 115000 },
  { id: 'kimbap', name: 'Kimbap', cuisine: 'han', price: 40000 },
  { id: 'canh-kim-chi', name: 'Canh kim chi', cuisine: 'han', price: 65000 },
  { id: 'dimsum', name: 'Dimsum', cuisine: 'trung', price: 75000 },
  { id: 'mi-hoanh-thanh', name: 'Mì hoành thánh', cuisine: 'trung', price: 50000 },
  { id: 'vit-quay', name: 'Vịt quay Bắc Kinh', cuisine: 'trung', price: 160000 },
  { id: 'mapo-tofu', name: 'Đậu phụ Tứ Xuyên', cuisine: 'trung', price: 75000 },
  { id: 'com-chien-duong-chau', name: 'Cơm chiên Dương Châu', cuisine: 'trung', price: 50000 },
  { id: 'pad-thai', name: 'Pad Thai', cuisine: 'thai', price: 75000 },
  { id: 'tom-yum', name: 'Tom Yum', cuisine: 'thai', price: 95000 },
  { id: 'ca-ri-xanh', name: 'Cà ri xanh', cuisine: 'thai', price: 85000 },
  { id: 'pad-kra-pao', name: 'Gà xào húng quế', cuisine: 'thai', price: 69000 },
  { id: 'xoi-xoai', name: 'Xôi xoài', cuisine: 'thai', price: 45000 },
  { id: 'pizza-margherita', name: 'Pizza Margherita', cuisine: 'y', price: 150000 },
  { id: 'mi-y-carbonara', name: 'Mì Ý Carbonara', cuisine: 'y', price: 115000 },
  { id: 'lasagna', name: 'Lasagna', cuisine: 'y', price: 130000 },
  { id: 'risotto-nam', name: 'Risotto nấm', cuisine: 'y', price: 125000 },
  { id: 'bruschetta', name: 'Bruschetta', cuisine: 'y', price: 59000 }
];

const INITIAL_RECIPES = [
  {
    dishId: 'pho-bo',
    dishName: 'Phở bò',
    prepTime: '45 phút',
    difficulty: 'Trung bình',
    calories: '480 kcal',
    ingredients: [
      '500g bánh phở tươi sợi nhỏ',
      '300g thịt bò thăn / tái + 300g nạm gầu bò',
      '1kg xương ống bò ninh nước dùng',
      'Quế, hồi, thảo quả, đinh hương, gừng nướng, hành tím nướng',
      'Hành lá, ngò gai, giá đỗ, chanh, ớt tươi, tương ớt Đà Nẵng'
    ],
    steps: [
      'Chần xương bò qua nước sôi 5 phút với gừng đập dập và muối để khử mùi, rửa sạch.',
      'Nướng thơm hành tím, gừng cùng hoa hồi, thảo quả, quế rồi cho vào túi vải thả vào nồi ninh xương 2-3 tiếng.',
      'Nêm nước mắm ngon, đường phèn, muối vừa ăn cho nước dùng trong và ngọt thanh.',
      'Trụng bánh phở qua nước sôi, xếp thịt bò thái mỏng lên trên, chan nước dùng đang sôi sùng sục và rắc hành ngò.'
    ],
    tips: 'Nướng cháy xém gừng và hành tím trước khi ninh giúp nước phở dậy mùi thơm đặc trưng.'
  },
  {
    dishId: 'banh-mi',
    dishName: 'Bánh mì',
    prepTime: '15 phút',
    difficulty: 'Dễ',
    calories: '390 kcal',
    ingredients: [
      '2 ổ bánh mì vỏ giòn nóng kiểu Đà Nẵng (như Bánh mì Bà Lan)',
      '50g pate gan heo béo ngậy, 30g sốt bơ trứng gà tươi',
      '100g thịt nguội, chả bò Đà Nẵng, thịt xíu hoặc chả heo',
      'Đồ chua (đu đủ, cà rốt ngâm chua ngọt), dưa leo',
      'Rau răm, hành ngò, ớt xanh Đà Nẵng, muối tiêu hoặc nước sốt thịt'
    ],
    steps: [
      'Nướng nóng giòn ổ bánh mì trên lò than hoặc nồi chiên không dầu 2 phút.',
      'Rạch dọc bụng bánh, phết đều một lớp sốt bơ trứng vàng óng và pate gan thơm béo.',
      'Xếp đầy đặn thịt nguội, chả bò Đà Nẵng, dưa leo thái dọc và đồ chua vào giữa.',
      'Thêm rau răm, vài lát ớt xanh, rắc nhẹ chút muối tiêu hoặc nước sốt chan rồi thưởng thức.'
    ],
    tips: 'Bánh mì Đà Nẵng ngon nhất khi kết hợp sốt bơ trứng đánh tay cùng chả bò và rau răm tươi.'
  },
  {
    dishId: 'bun-cha',
    dishName: 'Bún chả',
    prepTime: '35 phút',
    difficulty: 'Trung bình',
    calories: '520 kcal',
    ingredients: [
      '500g bún rối sợi nhỏ tươi',
      '300g thịt ba chỉ thái mỏng + 300g nạc vai băm viên',
      'Gia vị ướp: nước hàng, nước mắm Nam Ô, mật ong, hành tỏi băm, tiêu',
      'Đu đủ xanh, cà rốt ngâm giấm đường giòn ngọt',
      'Rau sống ăn kèm: xà lách, tía tô, kinh giới, húng thơm'
    ],
    steps: [
      'Ướp thịt ba chỉ và thịt viên với hành tỏi, nước mắm, mật ong, nước màu ít nhất 30 phút.',
      'Xếp thịt lên vỉ nướng trên bếp than hoa hoặc nồi chiên không dầu ở 200°C trong 15 phút cho vàng xém cạnh.',
      'Pha nước mắm chua ngọt ấm theo tỷ lệ 1 mắm : 1 đường : 1 giấm : 4 nước ấm, thả đu đủ cà rốt vào.',
      'Cho chả nướng nóng hổi vào bát nước chấm, ăn kèm bún tươi và rổ rau sống xanh mát.'
    ],
    tips: 'Phết một lớp dầu điều mật ong khi nướng giúp viên chả bóng mềm, không bị khô.'
  },
  {
    dishId: 'com-tam',
    dishName: 'Cơm tấm',
    prepTime: '40 phút',
    difficulty: 'Trung bình',
    calories: '620 kcal',
    ingredients: [
      '2 chén gạo tấm thơm dẻo',
      '2 miếng sườn cốt lết heo bản dày',
      'Bì heo trộn thính, chả trứng hấp vân vàng, 1 quả trứng ốp la',
      'Hành lá phi mỡ hành, tóp mỡ giòn rụm',
      'Nước mắm kẹo chua ngọt, đồ chua, dưa leo, cà chua'
    ],
    steps: [
      'Ướp sườn cốt lết với sả băm, tỏi, nước mắm, sữa đặc và mật ong khoảng 45 phút để thịt mềm.',
      'Nướng sườn trên than hồng hoặc áp chảo lửa vừa cho chín vàng thơm phức hai mặt.',
      'Nấu cơm tấm chín tơi, xới ra dĩa cùng sườn nướng, bì, chả trứng và trứng ốp la lòng đào.',
      'Rưới mỡ hành tóp mỡ lên mặt cơm và ăn kèm bát nước mắm kẹo tỏi ớt.'
    ],
    tips: 'Ướp sườn với chút sữa đặc hoặc nước cốt cam giúp thớ thịt mềm mọng và lên màu cánh gián đẹp mắt.'
  },
  {
    dishId: 'banh-xeo',
    dishName: 'Bánh xèo',
    prepTime: '30 phút',
    difficulty: 'Trung bình',
    calories: '510 kcal',
    ingredients: [
      '250g bột gạo pha sẵn + 100ml nước cốt dừa + chút bột nghệ (kiểu Bánh xèo Bà Dưỡng Đà Nẵng)',
      '200g tôm đất tươi, 150g thịt ba chỉ thái mỏng',
      '150g giá đỗ, hành lá cắt nhỏ',
      'Nguyên liệu nước tương đặc trưng: gan heo, đậu phộng rang xay, mè rang, tương đậu',
      'Bánh tráng mỏng, xoài chua, dưa leo, cải bẹ xanh, rau sống Đà Nẵng'
    ],
    steps: [
      'Hòa bột bánh xèo với nước cốt dừa, bột nghệ, hành lá và chút bia để vỏ bánh vừa giòn rụm vừa béo.',
      'Làm nóng khuôn/chảo nhỏ với dầu, cho tôm đất và thịt ba chỉ vào đảo săn rồi múc một vá bột tráng đều.',
      'Rải giá đỗ vào giữa, đậy nắp 1-2 phút rồi mở nắp chiên cho viền bánh vàng giòn rụm, gập đôi lại.',
      'Nấu sốt nước tương gan đậu phộng sánh mịn béo bùi, cuốn bánh xèo với bánh tráng, rau sống và chấm ngập sốt.'
    ],
    tips: 'Linh hồn của bánh xèo Đà Nẵng (như quán Bà Dưỡng) nằm ở bát nước chấm gan heo xay nhuyễn nấu cùng đậu phộng bùi béo.'
  },
  {
    dishId: 'sushi',
    dishName: 'Sushi',
    prepTime: '35 phút',
    difficulty: 'Trung bình',
    calories: '380 kcal',
    ingredients: [
      '2 chén gạo Nhật dẻo (Koshihikari)',
      '200g cá hồi & cá ngừ đại dương tươi chuẩn Sashimi',
      '3 muỗng giấm trộn cơm sushi (giấm gạo, đường, muối)',
      'Lá rong biển Nori, bơ sáp, dưa leo, trứng ngọt Tamago',
      'Nước tương Nhật, mù tạt Wasabi, gừng hồng ngâm chua'
    ],
    steps: [
      'Nấu chín cơm Nhật, lúc cơm còn ấm trộn đều với giấm sushi và quạt nhẹ cho hạt cơm bóng dẻo.',
      'Trải lá rong biển lên mành tre, dàn lớp cơm mỏng rồi xếp cá hồi, bơ, dưa leo vào giữa và cuộn chặt tay.',
      'Với sushi nắm (Nigiri), thoa chút nước giấm lên tay, nắm khối cơm nhỏ và đặt lát cá hồi tươi lên trên.',
      'Cắt cuộn sushi thành từng khoanh vừa ăn, bày ra đĩa kèm gừng hồng, wasabi và nước tương.'
    ],
    tips: 'Dùng dao thật sắc và lau lưỡi dao bằng khăn ẩm sau mỗi nhát cắt để khoanh sushi phẳng đẹp.'
  },
  {
    dishId: 'ramen',
    dishName: 'Ramen',
    prepTime: '40 phút',
    difficulty: 'Trung bình',
    calories: '540 kcal',
    ingredients: [
      '2 vắt mì Ramen tươi sợi vàng dai',
      '200g thịt ba chỉ cuộn làm xá xíu Nhật (Chashu)',
      '2 quả trứng gà ngâm tương lòng đào (Ajitsuke Tamago)',
      '1 lít nước dùng xương heo ninh trắng sữa (Tonkotsu) hoặc tương Miso',
      'Rong biển Nori, măng khô Menma, hành baro thái nhỏ, bắp ngọt'
    ],
    steps: [
      'Áp chảo cuộn thịt ba chỉ cho vàng mặt rồi om cùng nước tương Nhật, rượu Mirin, đường, gừng tỏi 30 phút.',
      'Luộc trứng đúng 6 phút 30 giây, ngâm ngay vào nước đá, bóc vỏ và ngâm vào nước sốt tương.',
      'Đun sôi nước dùng xương đậm đà, luộc mì Ramen vừa chín tới (khoảng 2 phút) rồi vớt ra tô.',
      'Chan nước dùng nóng, xếp lát thịt Chashu, nửa quả trứng lòng đào, măng, hành baro và lá rong biển.'
    ],
    tips: 'Trứng luộc đúng 6 phút rưỡi rồi ngâm nước đá lạnh sẽ cho lòng đào dẻo sánh chuẩn tiệm Ramen Nhật.'
  }
];

// Bổ sung công thức chuẩn cho toàn bộ 30 món trong vòng quay
for (const d of ALL_DISHES) {
  if (!INITIAL_RECIPES.some((r) => r.dishId === d.id)) {
    INITIAL_RECIPES.push({
      dishId: d.id,
      dishName: d.name,
      prepTime: '25 phút',
      difficulty: 'Dễ',
      calories: '460 kcal',
      ingredients: [
        `Nguyên liệu chính tươi ngon trong ngày cho món ${d.name}`,
        '250g thịt / hải sản tươi sơ chế sạch tại chợ Hàn hoặc siêu thị Đà Nẵng',
        'Rau thơm, hành tím, tỏi Lý Sơn, gia vị ướp truyền thống',
        'Nước sốt pha chuẩn công thức đầu bếp'
      ],
      steps: [
        `Bước 1: Sơ chế sạch các nguyên liệu chính của món ${d.name}, để ráo nước và cắt miếng vừa ăn.`,
        'Bước 2: Ướp nguyên liệu với gia vị đặc trưng trong 15 phút cho thấm đều hương vị.',
        `Bước 3: Chế biến trên lửa vừa đến khi ${d.name} dậy mùi thơm lừng và chín đều màu sắc hấp dẫn.`,
        'Bước 4: Bày ra đĩa/tô nóng, trang trí thêm rau thơm và thưởng thức ngay khi còn nóng.'
      ],
      tips: `Chọn nguyên liệu tươi mới trong ngày và canh lửa vừa phải giúp món ${d.name} giữ trọn vị ngọt tự nhiên.`
    });
  }
}

// DANH SÁCH 12 QUÁN ĂN THẬT & NỔI TIẾNG TẠI ĐÀ NẴNG (Đầy đủ địa chỉ thật ở Hải Châu, Sơn Trà, Thanh Khê, Ngũ Hành Sơn)
const INITIAL_RESTAURANTS = [
  {
    name: 'Bánh Xèo Bà Dưỡng — Đặc Sản Đà Nẵng',
    address: 'K280/23 Hoàng Diệu, P. Bình Hiên, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3873 168',
    category: 'Việt Nam',
    priceRange: '40k - 85k',
    rating: 4.9,
    openTime: '09:30 - 21:30',
    isPartner: true,
    commissionRate: 15,
    dishes: ['banh-xeo', 'bun-cha'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Phở Hồng & Bún Chả Hà Nội Xưa Đà Nẵng',
    address: '10 Lý Tự Trọng, P. Thạch Thang, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3827 222',
    category: 'Việt Nam',
    priceRange: '45k - 70k',
    rating: 4.8,
    openTime: '06:00 - 22:00',
    isPartner: true,
    commissionRate: 12,
    dishes: ['pho-bo', 'bun-cha'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Bánh Mì Bà Lan & Cơm Tấm Nhà Gỗ Đà Nẵng',
    address: '62 Trưng Nữ Vương, P. Bình Hiên, Q. Hải Châu, Đà Nẵng',
    phone: '0905 321 678',
    category: 'Việt Nam',
    priceRange: '20k - 55k',
    rating: 4.9,
    openTime: '06:00 - 22:30',
    isPartner: true,
    commissionRate: 14,
    dishes: ['banh-mi', 'com-tam', 'pho-bo', 'banh-xeo'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood']
  },
  {
    name: 'Bếp Việt Đà Thành — Cơm Tấm, Phở & Bún Chả',
    address: '154 Nguyễn Văn Linh, P. Nam Dương, Q. Hải Châu, Đà Nẵng',
    phone: '0905 889 112',
    category: 'Việt Nam',
    priceRange: '35k - 65k',
    rating: 4.7,
    openTime: '06:30 - 22:00',
    isPartner: true,
    commissionRate: 15,
    dishes: ['pho-bo', 'banh-mi', 'bun-cha', 'com-tam', 'banh-xeo'],
    shippers: ['GrabFood', 'ShopeeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Sushi World Đà Nẵng — Hải Sản Nhật Tươi Sống',
    address: '10 Phan Bội Châu, P. Thạch Thang, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3898 484',
    category: 'Nhật Bản',
    priceRange: '60k - 180k',
    rating: 4.9,
    openTime: '10:00 - 22:30',
    isPartner: true,
    commissionRate: 16,
    dishes: ['sushi', 'ramen', 'com-ca-ri', 'onigiri', 'udon'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Kyoto Ramen & Cơm Cà Ri Nhật Bản — Sơn Trà',
    address: '186 Trần Phú, P. Phước Ninh, Q. Hải Châu, Đà Nẵng',
    phone: '0935 224 668',
    category: 'Nhật Bản',
    priceRange: '45k - 110k',
    rating: 4.7,
    openTime: '10:00 - 22:00',
    isPartner: false,
    commissionRate: 0,
    dishes: ['ramen', 'com-ca-ri', 'onigiri', 'udon', 'sushi'],
    shippers: ['GrabFood', 'ShopeeFood']
  },
  {
    name: 'Veteran Korean Restaurant & Tteokbokki Đà Nẵng',
    address: '08 Dương Đình Nghệ, P. An Hải Bắc, Q. Sơn Trà, Đà Nẵng',
    phone: '0905 771 234',
    category: 'Hàn Quốc',
    priceRange: '50k - 140k',
    rating: 4.9,
    openTime: '10:00 - 23:00',
    isPartner: true,
    commissionRate: 15,
    dishes: ['bibimbap', 'tteokbokki', 'ga-ran', 'kimbap', 'canh-kim-chi'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Papa Chicken & Bếp Hàn Quốc — Phạm Văn Đồng',
    address: '89 Phạm Văn Đồng, P. An Hải Bắc, Q. Sơn Trà, Đà Nẵng',
    phone: '0236 3939 115',
    category: 'Hàn Quốc',
    priceRange: '45k - 135k',
    rating: 4.8,
    openTime: '09:30 - 23:30',
    isPartner: true,
    commissionRate: 15,
    dishes: ['ga-ran', 'tteokbokki', 'kimbap', 'bibimbap', 'canh-kim-chi'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood']
  },
  {
    name: 'Cửu Ngư Lầu — Dimsum & Vịt Quay Trung Hoa Đà Nẵng',
    address: '61B Nguyễn Chí Thanh, P. Thạch Thang, Q. Hải Châu, Đà Nẵng',
    phone: '0905 616 161',
    category: 'Trung Hoa',
    priceRange: '45k - 170k',
    rating: 4.9,
    openTime: '06:30 - 22:00',
    isPartner: true,
    commissionRate: 15,
    dishes: ['dimsum', 'mi-hoanh-thanh', 'vit-quay', 'mapo-tofu', 'com-chien-duong-chau'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Tiệm Ăn Chợ Lớn — Mì Hoành Thánh & Cơm Chiên Đà Nẵng',
    address: '232 Hoàng Diệu, P. Nam Dương, Q. Hải Châu, Đà Nẵng',
    phone: '0236 3582 999',
    category: 'Trung Hoa',
    priceRange: '40k - 95k',
    rating: 4.8,
    openTime: '07:00 - 22:30',
    isPartner: true,
    commissionRate: 14,
    dishes: ['mi-hoanh-thanh', 'com-chien-duong-chau', 'dimsum', 'mapo-tofu', 'vit-quay'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood']
  },
  {
    name: 'Thai Market Restaurant — Chuẩn Vị Thái Tại Đà Nẵng',
    address: '04 Trần Quốc Toản, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng',
    phone: '0905 992 888',
    category: 'Thái Lan',
    priceRange: '49k - 135k',
    rating: 4.9,
    openTime: '10:00 - 22:30',
    isPartner: true,
    commissionRate: 15,
    dishes: ['pad-thai', 'tom-yum', 'ca-ri-xanh', 'pad-kra-pao', 'xoi-xoai'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  },
  {
    name: 'Pizza 4P’s Indochina Đà Nẵng — Bạch Đằng',
    address: '74 Bạch Đằng, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng',
    phone: '1900 6043',
    category: 'Ý',
    priceRange: '65k - 210k',
    rating: 4.9,
    openTime: '10:00 - 23:00',
    isPartner: true,
    commissionRate: 15,
    dishes: ['pizza-margherita', 'mi-y-carbonara', 'lasagna', 'risotto-nam', 'bruschetta'],
    shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ']
  }
];

// DANH SÁCH TÀI XẾ SHIPPER ĐÀ NẴNG (Biển số 43 Đà Nẵng, đầu số 0905/0935 đặc trưng)
const INITIAL_SHIPPERS = [
  {
    name: 'Nguyễn Văn Hùng (Khu vực Hải Châu)',
    phone: '0905 123 456',
    provider: 'GrabFood',
    vehiclePlate: '43-C1 688.99',
    status: 'available',
    rating: 4.9,
    completedOrders: 412
  },
  {
    name: 'Trần Quốc Tuấn (Khu vực Sơn Trà - Mỹ Khê)',
    phone: '0905 765 432',
    provider: 'ShopeeFood',
    vehiclePlate: '43-E1 452.11',
    status: 'available',
    rating: 4.9,
    completedOrders: 358
  },
  {
    name: 'Lê Hoàng Phúc (Khu vực Thanh Khê)',
    phone: '0935 998 877',
    provider: 'BeFood',
    vehiclePlate: '43-D1 119.05',
    status: 'available',
    rating: 5.0,
    completedOrders: 245
  },
  {
    name: 'Phạm Minh Khoa (Shipper Nhanh Đà Nẵng)',
    phone: '0905 334 411',
    provider: 'Shipper Nội Bộ',
    vehiclePlate: '43-G1 888.68',
    status: 'available',
    rating: 4.9,
    completedOrders: 510
  },
  {
    name: 'Võ Thành Đạt (Khu vực Ngũ Hành Sơn - Hòa Xuân)',
    phone: '0935 221 100',
    provider: 'Ahamove',
    vehiclePlate: '43-H1 304.77',
    status: 'delivering',
    rating: 4.8,
    completedOrders: 196
  }
];

async function ensureRichSeedData() {
  // 1. Seed Users
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('123456', 10);

    await User.insertMany([
      {
        username: 'Admin Đà Nẵng',
        email: 'admin@homnayangi.vn',
        password: adminPassword,
        role: 'admin',
        isActive: true
      },
      {
        username: 'Trần Lê Anh Quang',
        email: 'user@homnayangi.vn',
        password: userPassword,
        role: 'user',
        isActive: true
      },
      {
        username: 'Nguyễn Thị Mai Hương (Hải Châu)',
        email: 'huong.nguyen@danang.vn',
        password: userPassword,
        role: 'user',
        isActive: true
      },
      {
        username: 'Lê Văn Hoàng (Sơn Trà)',
        email: 'hoang.le@danang.vn',
        password: userPassword,
        role: 'user',
        isActive: true
      }
    ]);
  }

  // 2. Cập nhật Quán ăn thực tế tại Đà Nẵng (Kiểm tra nếu chưa phải dữ liệu Đà Nẵng thì làm mới ngay)
  const existingRests = await Restaurant.find();
  const hasDaNangData = existingRests.some((r) => r.address && r.address.includes('Đà Nẵng'));

  if (!hasDaNangData) {
    await Restaurant.deleteMany({});
    await Restaurant.insertMany(INITIAL_RESTAURANTS);
    console.log('✅ Đã cập nhật 12 Quán ăn thực tế nổi tiếng tại Đà Nẵng (Hải Châu, Sơn Trà...)!');

    await Shipper.deleteMany({});
    await Shipper.insertMany(INITIAL_SHIPPERS);
    console.log('✅ Đã cập nhật đội ngũ Tài xế Shipper Đà Nẵng (biển số 43-xx)!');

    await Recipe.deleteMany({});
    await Recipe.insertMany(INITIAL_RECIPES);
    console.log('✅ Đã cập nhật 30 Công thức nấu ăn chuẩn vị Đà Nẵng!');

    await Order.deleteMany({});
    await Order.insertMany([
      {
        orderCode: 'DN-8821',
        customerName: 'Trần Lê Anh Quang',
        customerPhone: '0905 888 999',
        customerAddress: '54 Nguyễn Lương Bằng, Q. Liên Chiểu, Đà Nẵng',
        dishId: 'banh-xeo',
        dishName: 'Bánh xèo',
        restaurantName: 'Bánh Xèo Bà Dưỡng — Đặc Sản Đà Nẵng',
        restaurantAddress: 'K280/23 Hoàng Diệu, P. Bình Hiên, Q. Hải Châu, Đà Nẵng',
        quantity: 2,
        itemPrice: 60000,
        shippingFee: 15000,
        totalAmount: 135000,
        shipperProvider: 'GrabFood',
        shipperName: 'Nguyễn Văn Hùng (Khu vực Hải Châu)',
        shipperPhone: '0905 123 456',
        shipperPlate: '43-C1 688.99',
        note: 'Xin thêm chén nước chấm gan đậu phộng và rau sống',
        status: 'delivering'
      },
      {
        orderCode: 'DN-8820',
        customerName: 'Nguyễn Thị Mai Hương',
        customerPhone: '0905 444 555',
        customerAddress: '36 Bạch Đằng, Q. Hải Châu, Đà Nẵng',
        dishId: 'pad-thai',
        dishName: 'Pad Thai',
        restaurantName: 'Thai Market Restaurant — Chuẩn Vị Thái Tại Đà Nẵng',
        restaurantAddress: '04 Trần Quốc Toản, P. Hải Châu 1, Q. Hải Châu, Đà Nẵng',
        quantity: 1,
        itemPrice: 75000,
        shippingFee: 15000,
        totalAmount: 90000,
        shipperProvider: 'ShopeeFood',
        shipperName: 'Trần Quốc Tuấn (Khu vực Sơn Trà - Mỹ Khê)',
        shipperPhone: '0905 765 432',
        shipperPlate: '43-E1 452.11',
        note: 'Ít cay, thêm đậu phộng rang',
        status: 'completed'
      },
      {
        orderCode: 'DN-8819',
        customerName: 'Lê Văn Hoàng',
        customerPhone: '0935 112 233',
        customerAddress: '120 Võ Nguyên Giáp, Q. Sơn Trà, Đà Nẵng',
        dishId: 'banh-mi',
        dishName: 'Bánh mì',
        restaurantName: 'Bánh Mì Bà Lan & Cơm Tấm Nhà Gỗ Đà Nẵng',
        restaurantAddress: '62 Trưng Nữ Vương, P. Bình Hiên, Q. Hải Châu, Đà Nẵng',
        quantity: 3,
        itemPrice: 25000,
        shippingFee: 15000,
        totalAmount: 90000,
        shipperProvider: 'BeFood',
        shipperName: 'Lê Hoàng Phúc (Khu vực Thanh Khê)',
        shipperPhone: '0935 998 877',
        shipperPlate: '43-D1 119.05',
        note: 'Nhiều bơ pate, ớt xanh để riêng',
        status: 'completed'
      }
    ]);
    console.log('✅ Đã khởi tạo các đơn đặt món thực tế tại Đà Nẵng!');
  }
}

module.exports = { ALL_DISHES, ensureRichSeedData };

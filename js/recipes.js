/* Công thức tham khảo cho toàn bộ món trong FOOD.DISHES. */
const RECIPES = {
  'pho-bo': {
    time: '3 giờ 30 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['1 kg xương bò', '500 g bánh phở', '400 g thịt bò tái và nạm', '1 củ hành tây, 1 củ gừng', 'Hoa hồi, quế, thảo quả', 'Hành lá, rau thơm, chanh và gia vị'],
    steps: ['Chần xương, rửa sạch rồi ninh với 3 lít nước trong khoảng 3 giờ; thường xuyên hớt bọt.', 'Nướng thơm gừng, hành tây và rang các gia vị khô; cho vào nồi nước dùng trong 45 phút cuối.', 'Nêm nước mắm, muối và đường phèn vừa ăn. Trụng bánh phở, xếp thịt, chan nước dùng sôi và thêm rau thơm.'],
    tip: 'Ninh lửa nhỏ và không đậy kín nồi để nước dùng trong.'
  },
  'banh-mi': {
    time: '25 phút', difficulty: 'Dễ', servings: 2,
    ingredients: ['2 ổ bánh mì', '150 g thịt nguội hoặc thịt xíu', '2 thìa pate', '1 quả dưa leo', 'Đồ chua cà rốt, củ cải', 'Ngò, ớt, nước tương và sốt mayonnaise'],
    steps: ['Làm nóng bánh mì trong lò hoặc chảo đến khi vỏ giòn.', 'Rạch bánh, phết pate và sốt; lần lượt cho thịt, dưa leo, đồ chua và ngò.', 'Nêm chút nước tương, thêm ớt tùy khẩu vị rồi dùng khi bánh còn nóng.'],
    tip: 'Để đồ chua ráo nước trước khi cho vào bánh để vỏ không bị mềm.'
  },
  'bun-cha': {
    time: '50 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['500 g thịt ba chỉ', '300 g thịt vai xay', '800 g bún tươi', 'Đu đủ xanh, cà rốt', 'Nước mắm, giấm, đường', 'Tỏi, hành tím, rau sống'],
    steps: ['Ướp thịt thái lát và thịt xay với nước mắm, đường, hành tỏi trong 30 phút; nặn thịt xay thành viên.', 'Nướng thịt lát và viên thịt trên vỉ hoặc áp chảo đến khi chín vàng.', 'Pha nước chấm chua ngọt, thêm đu đủ cà rốt ngâm; ăn cùng bún và rau sống.'],
    tip: 'Phết nhẹ mật ong lên thịt ở cuối thời gian nướng để thịt lên màu đẹp.'
  },
  'com-tam': {
    time: '1 giờ', difficulty: 'Trung bình', servings: 2,
    ingredients: ['300 g gạo tấm', '2 miếng sườn cốt lết', '2 quả trứng', '100 g bì heo thái sợi', 'Thính gạo, hành lá', 'Nước mắm, tỏi, đường và dưa leo'],
    steps: ['Vo gạo tấm, nấu với lượng nước vừa đủ cho hạt cơm tơi mềm.', 'Ướp sườn với nước mắm, mật ong, tỏi và tiêu 30 phút rồi nướng hoặc áp chảo chín.', 'Chiên trứng, trộn bì với thính; pha nước mắm chua ngọt và bày tất cả cùng mỡ hành.'],
    tip: 'Để sườn nghỉ vài phút sau khi nướng để giữ nước ngọt trong thịt.'
  },
  'banh-xeo': {
    time: '45 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['200 g bột bánh xèo', '250 ml nước cốt dừa pha nước', '200 g tôm bóc vỏ', '200 g thịt ba chỉ thái mỏng', 'Giá, hành lá, rau sống', 'Nước mắm, tỏi và chanh'],
    steps: ['Pha bột với nước cốt dừa, hành lá và chút muối; để bột nghỉ 20 phút.', 'Xào sơ tôm và thịt. Làm nóng chảo có dầu, tráng lớp bột mỏng rồi thêm nhân và giá.', 'Đậy nắp đến khi bánh chín, mở nắp chiên giòn mép; gập đôi và dùng với rau, nước mắm.'],
    tip: 'Chảo thật nóng và lớp bột mỏng giúp bánh giòn đều.'
  },
  sushi: {
    time: '50 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['300 g gạo Nhật', '4 thìa giấm gạo', '200 g cá hồi hoặc cá ngừ đạt chuẩn ăn sống', '4 lá rong biển', 'Dưa leo và bơ', 'Nước tương, wasabi và gừng ngâm'],
    steps: ['Nấu gạo Nhật, trộn nhẹ với giấm gạo, đường và muối rồi để nguội.', 'Đặt rong biển lên mành tre, dàn cơm mỏng và xếp cá cùng rau củ thành hàng.', 'Cuộn chặt tay, làm ẩm dao rồi cắt khoanh; dùng kèm nước tương.'],
    tip: 'Giữ cá lạnh và dùng dao sắc, lau ẩm giữa các lần cắt.'
  },
  ramen: {
    time: '2 giờ', difficulty: 'Khó', servings: 4,
    ingredients: ['400 g mì ramen', '1.5 lít nước dùng gà', '400 g ba chỉ heo', '4 quả trứng', 'Gừng, tỏi, hành lá', 'Nước tương, mirin và mè rang'],
    steps: ['Kho ba chỉ với nước tương, mirin, gừng và chút nước đến khi mềm; luộc trứng lòng đào rồi ướp trong phần nước kho.', 'Đun nước dùng gà với tỏi và gừng, nêm nước tương vừa miệng.', 'Luộc mì riêng, chia vào tô, chan nước dùng rồi thêm thịt, trứng, hành lá và mè.'],
    tip: 'Luộc mì ngay trước khi ăn để sợi không hút hết nước dùng.'
  },
  'com-ca-ri': {
    time: '45 phút', difficulty: 'Dễ', servings: 4,
    ingredients: ['400 g thịt gà', '2 củ khoai tây', '1 củ cà rốt', '1 củ hành tây', '4 viên cà ri Nhật', '300 g gạo và dầu ăn'],
    steps: ['Nấu cơm. Cắt gà và rau củ thành miếng vừa ăn.', 'Xào hành tây, cho gà vào đảo săn rồi thêm cà rốt, khoai tây và nước ngập mặt.', 'Nấu mềm khoảng 20 phút, tắt lửa hòa viên cà ri, đun nhỏ thêm đến khi sốt sánh; ăn với cơm.'],
    tip: 'Hòa viên cà ri khi đã hạ lửa để sốt mịn và không vón.'
  },
  onigiri: {
    time: '30 phút', difficulty: 'Dễ', servings: 4,
    ingredients: ['300 g gạo Nhật', '120 g cá hồi chín hoặc cá ngừ', '2 thìa mayonnaise', '4 lá rong biển', 'Muối và mè rang'],
    steps: ['Nấu cơm dẻo và để nguội bớt. Trộn cá với mayonnaise; nêm nhẹ.', 'Làm ướt tay, rắc ít muối, đặt cơm vào lòng bàn tay, cho nhân vào giữa và nắm thành tam giác.', 'Bọc rong biển bên ngoài ngay trước khi ăn, rắc mè nếu thích.'],
    tip: 'Giữ cơm ấm khi nắm để hạt cơm kết dính tốt.'
  },
  udon: {
    time: '35 phút', difficulty: 'Dễ', servings: 4,
    ingredients: ['600 g mì udon', '1.2 lít nước dùng dashi', '4 thìa nước tương', '2 thìa mirin', 'Nấm và hành lá', 'Tempura hoặc đậu hũ chiên'],
    steps: ['Đun dashi với nước tương và mirin, nêm vừa vị.', 'Luộc mì udon theo hướng dẫn, trụng qua nước nóng rồi chia vào tô.', 'Chan nước dùng, thêm nấm, hành lá và tempura hoặc đậu hũ.'],
    tip: 'Cho tempura lên tô ngay trước khi ăn nếu muốn giữ độ giòn.'
  },
  bibimbap: {
    time: '40 phút', difficulty: 'Trung bình', servings: 2,
    ingredients: ['2 bát cơm nóng', '200 g thịt bò thái mỏng', '1 quả trứng', 'Cà rốt, bí ngòi, giá và rau bina', '2 thìa tương gochujang', 'Dầu mè, tỏi, mè rang'],
    steps: ['Ướp bò với tỏi, nước tương và chút đường; xào chín. Xào riêng từng loại rau củ với chút muối.', 'Chiên trứng lòng đào. Pha gochujang với dầu mè và chút nước.', 'Xếp cơm, rau, thịt và trứng vào tô; rưới sốt rồi trộn đều trước khi ăn.'],
    tip: 'Xào riêng từng loại rau giúp giữ màu và độ giòn.'
  },
  tteokbokki: {
    time: '30 phút', difficulty: 'Dễ', servings: 3,
    ingredients: ['400 g bánh gạo Hàn Quốc', '150 g chả cá', '2 thìa gochujang', '1 thìa ớt bột Hàn', '2 thìa nước tương và đường', 'Hành lá, mè rang'],
    steps: ['Ngâm bánh gạo nếu đang đông lạnh. Hòa gochujang, ớt bột, nước tương và đường với 500 ml nước.', 'Đun sốt sôi, cho bánh gạo và chả cá vào, đảo thường xuyên.', 'Nấu 10–15 phút đến khi bánh mềm và sốt sánh; thêm hành lá và mè.'],
    tip: 'Thêm nước từng ít một nếu sốt đặc trước khi bánh gạo mềm.'
  },
  'ga-ran': {
    time: '55 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['800 g cánh hoặc đùi gà', '150 g bột chiên giòn', '1 thìa bột bắp', '3 thìa gochujang', 'Tỏi, mật ong và nước tương', 'Dầu ăn'],
    steps: ['Ướp gà với muối, tiêu và tỏi 20 phút; áo đều bột chiên.', 'Chiên gà ở lửa vừa đến chín, vớt ra nghỉ rồi chiên lần hai đến khi giòn.', 'Đun gochujang với mật ong, tỏi và nước tương; đảo gà nhanh trong sốt.'],
    tip: 'Chiên hai lần giúp lớp vỏ giòn lâu hơn.'
  },
  kimbap: {
    time: '45 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['3 bát cơm dẻo', '4 lá rong biển', '2 quả trứng', 'Cà rốt, dưa leo và củ cải vàng', '4 thanh xúc xích hoặc thanh cua', 'Dầu mè, mè rang và muối'],
    steps: ['Trộn cơm với dầu mè và chút muối. Chiên trứng thành lớp mỏng rồi cắt sợi.', 'Xào sơ cà rốt; cắt dưa leo, củ cải và xúc xích thành thanh dài.', 'Trải cơm mỏng lên rong biển, xếp nhân, cuộn chặt và phết dầu mè; cắt khoanh.'],
    tip: 'Chừa mép rong biển trống một đoạn để cuộn được kín.'
  },
  'canh-kim-chi': {
    time: '35 phút', difficulty: 'Dễ', servings: 3,
    ingredients: ['300 g kim chi cải thảo', '200 g thịt ba chỉ', '1 bìa đậu phụ', '1 thìa gochujang', '500 ml nước hoặc nước dùng cá cơm', 'Hành lá và nấm'],
    steps: ['Xào thịt ba chỉ, thêm kim chi cắt miếng và đảo đến khi thơm.', 'Cho nước dùng và gochujang vào, nấu sôi nhỏ 15 phút.', 'Thêm đậu phụ và nấm, nấu thêm 5 phút; nêm lại và rắc hành lá.'],
    tip: 'Kim chi chua vừa sẽ giúp nước canh đậm vị; thêm chút nước kim chi nếu cần.'
  },
  dimsum: {
    time: '50 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['250 g tôm bóc vỏ', '200 g thịt heo xay', '1 gói vỏ hoành thánh', 'Nấm mèo và hành lá', 'Dầu mè, nước tương, tiêu', 'Cà rốt thái lát lót xửng'],
    steps: ['Băm tôm, trộn với thịt xay, nấm mèo, hành lá, nước tương và dầu mè.', 'Cho một thìa nhân vào giữa vỏ, túm mép hoặc gấp thành viên xíu mại.', 'Xếp lên cà rốt trong xửng, hấp 10–12 phút đến khi nhân chín.'],
    tip: 'Đừng cho quá nhiều nhân để vỏ không bị bục khi hấp.'
  },
  'mi-hoanh-thanh': {
    time: '50 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['250 g mì trứng', '200 g tôm', '200 g thịt heo xay', 'Vỏ hoành thánh', '1.5 lít nước dùng gà', 'Hẹ, hành lá và nước tương'],
    steps: ['Trộn tôm băm với thịt, tiêu và chút nước tương; gói nhân trong vỏ hoành thánh.', 'Đun nước dùng gà, nêm vừa ăn; luộc hoành thánh riêng đến khi nổi.', 'Trụng mì, chia tô, thêm hoành thánh và chan nước dùng; rắc hẹ, hành lá.'],
    tip: 'Luộc hoành thánh riêng để nước dùng không bị đục bởi bột áo.'
  },
  'vit-quay': {
    time: '2 giờ 30 phút', difficulty: 'Khó', servings: 4,
    ingredients: ['1 con vịt khoảng 1.8 kg', '2 thìa mật ong', '1 thìa giấm', 'Ngũ vị hương, gừng và tỏi', 'Bánh tráng mỏng', 'Hành lá, dưa leo và sốt hoisin'],
    steps: ['Làm sạch vịt, thấm thật khô; xát muối, gừng và ngũ vị hương cả trong lẫn ngoài.', 'Phết hỗn hợp mật ong pha giấm lên da, hong khô trong tủ mát vài giờ nếu có thời gian.', 'Nướng 180°C khoảng 80–100 phút đến khi chín, tăng nhiệt cuối để da giòn; chặt miếng và cuốn ăn.'],
    tip: 'Da vịt càng khô trước khi nướng thì càng dễ giòn.'
  },
  'mapo-tofu': {
    time: '30 phút', difficulty: 'Trung bình', servings: 3,
    ingredients: ['400 g đậu phụ non', '200 g thịt heo xay', '1 thìa doubanjiang', '1 thìa nước tương', 'Tỏi, gừng và hành lá', 'Tiêu Tứ Xuyên, dầu mè và bột bắp'],
    steps: ['Cắt đậu phụ thành khối, chần nước muối 2 phút rồi để ráo.', 'Phi thơm tỏi gừng, xào thịt đến tơi; thêm doubanjiang và nước tương.', 'Thêm ít nước, cho đậu phụ vào đun nhẹ; làm sánh bằng bột bắp pha loãng, rắc tiêu và hành.'],
    tip: 'Lắc nhẹ chảo thay vì đảo mạnh để đậu phụ không vỡ.'
  },
  'com-chien-duong-chau': {
    time: '25 phút', difficulty: 'Dễ', servings: 3,
    ingredients: ['3 bát cơm nguội', '2 quả trứng', '100 g tôm', '1 cây lạp xưởng', 'Đậu Hà Lan và cà rốt', 'Hành lá, nước tương và dầu ăn'],
    steps: ['Tách cơm nguội cho tơi. Cắt lạp xưởng và cà rốt hạt lựu; luộc sơ rau củ.', 'Đảo trứng vừa chín, cho tôm và lạp xưởng vào xào.', 'Cho cơm và rau củ vào chảo lớn, nêm nước tương; đảo lửa lớn đến khi cơm săn, thêm hành.'],
    tip: 'Cơm để lạnh qua đêm giúp hạt cơm tơi, không bị nhão.'
  },
  'pad-thai': {
    time: '35 phút', difficulty: 'Trung bình', servings: 2,
    ingredients: ['200 g bánh phở khô', '200 g tôm', '2 quả trứng', '2 thìa me, 2 thìa nước mắm', 'Đường thốt nốt, giá và hẹ', 'Đậu phộng rang, chanh và dầu ăn'],
    steps: ['Ngâm bánh phở đến mềm vừa. Pha sốt me với nước mắm và đường thốt nốt.', 'Xào tôm chín, gạt sang bên, tráng trứng trong chảo rồi thêm bánh phở và sốt.', 'Đảo nhanh đến khi sợi mềm thấm sốt, cho giá và hẹ vào; ăn với đậu phộng, chanh.'],
    tip: 'Nếu bánh phở còn cứng, thêm một ít nước thay vì ngâm quá lâu.'
  },
  'tom-yum': {
    time: '35 phút', difficulty: 'Dễ', servings: 4,
    ingredients: ['300 g tôm', '200 g nấm rơm', '1.2 lít nước dùng', 'Sả, riềng và lá chanh', 'Ớt, nước mắm và nước cốt chanh', 'Rau mùi và sữa đặc không đường tùy chọn'],
    steps: ['Đập dập sả, thái riềng; đun cùng nước dùng và lá chanh 10 phút.', 'Cho nấm vào nấu mềm, thêm tôm và nấu đến khi tôm chuyển hồng.', 'Nêm nước mắm, ớt và nước cốt chanh; thêm rau mùi, có thể pha chút sữa để dịu vị.'],
    tip: 'Cho nước cốt chanh sau khi tắt bếp để giữ vị thơm tươi.'
  },
  'ca-ri-xanh': {
    time: '45 phút', difficulty: 'Trung bình', servings: 4,
    ingredients: ['400 g đùi gà lọc xương', '2 thìa cà ri xanh Thái', '400 ml nước cốt dừa', 'Cà tím, ớt chuông và húng quế', 'Nước mắm và đường thốt nốt', 'Cơm nóng'],
    steps: ['Đun một phần nước cốt dừa đến khi sánh, xào cà ri xanh cho dậy mùi.', 'Cho gà vào đảo săn, thêm phần nước cốt dừa còn lại và chút nước; nấu 15 phút.', 'Thêm cà tím và ớt chuông, nấu mềm; nêm nước mắm, đường rồi rắc húng quế.'],
    tip: 'Nếm cà ri trước khi thêm ớt vì mức cay của từng loại cà ri khác nhau.'
  },
  'pad-kra-pao': {
    time: '25 phút', difficulty: 'Dễ', servings: 2,
    ingredients: ['300 g thịt gà xay', '2 tép tỏi', '1–2 quả ớt', '1 thìa nước mắm', '1 thìa dầu hào và nước tương', 'Húng quế Thái, trứng và cơm'],
    steps: ['Giã tỏi với ớt; pha nước mắm, dầu hào và nước tương.', 'Phi thơm tỏi ớt, cho gà xay vào đảo lửa lớn đến khi chín.', 'Cho sốt vào đảo nhanh, tắt bếp trộn húng quế; ăn với cơm và trứng ốp la.'],
    tip: 'Cho húng quế sau cùng để lá thơm và không bị thâm.'
  },
  'xoi-xoai': {
    time: '1 giờ', difficulty: 'Dễ', servings: 4,
    ingredients: ['300 g nếp', '2 quả xoài chín', '250 ml nước cốt dừa', '3 thìa đường', 'Muối và mè rang'],
    steps: ['Ngâm nếp 4 giờ hoặc qua đêm, để ráo rồi hấp khoảng 25 phút đến khi dẻo.', 'Đun nước cốt dừa với đường và nhúm muối; rưới một phần vào xôi, ủ 10 phút.', 'Xới xôi ra đĩa, ăn cùng xoài cắt miếng và rưới phần nước cốt dừa còn lại.'],
    tip: 'Chọn xoài chín thơm nhưng còn chắc để món ăn có vị ngọt thanh.'
  },
  'pizza-margherita': {
    time: '1 giờ 30 phút', difficulty: 'Trung bình', servings: 2,
    ingredients: ['250 g bột mì làm bánh', '160 ml nước ấm', '3 g men khô', '150 g sốt cà chua', '180 g mozzarella', 'Lá húng quế, dầu olive và muối'],
    steps: ['Trộn bột, men, nước và muối; nhào 8 phút, ủ đến khi nở gấp đôi.', 'Cán bột mỏng, phết sốt cà chua và xếp mozzarella lên mặt.', 'Nướng lò đã làm nóng ở 240°C khoảng 8–12 phút; thêm húng quế và dầu olive.'],
    tip: 'Làm nóng khay nướng trước giúp đế bánh giòn hơn.'
  },
  'mi-y-carbonara': {
    time: '30 phút', difficulty: 'Trung bình', servings: 2,
    ingredients: ['200 g mì spaghetti', '100 g thịt xông khói hoặc pancetta', '2 lòng đỏ trứng và 1 quả trứng', '50 g phô mai parmesan', 'Tiêu đen xay', 'Muối và nước luộc mì'],
    steps: ['Luộc mì trong nước muối đến al dente, giữ lại một cốc nước luộc.', 'Áp chảo thịt xông khói đến vàng. Đánh trứng cùng parmesan và tiêu.', 'Tắt bếp, trộn mì nóng với thịt rồi rót hỗn hợp trứng, thêm nước luộc từng ít đến khi sốt mượt.'],
    tip: 'Trộn trứng khi chảo đã tắt lửa để sốt không biến thành trứng bác.'
  },
  lasagna: {
    time: '1 giờ 30 phút', difficulty: 'Khó', servings: 6,
    ingredients: ['9 lá mì lasagna', '400 g thịt bò xay', '500 g sốt cà chua', '300 ml sốt béchamel', '200 g mozzarella', 'Hành tây, tỏi và parmesan'],
    steps: ['Xào hành tây, tỏi và thịt bò; thêm sốt cà chua, nấu nhỏ 20 phút.', 'Xếp lần lượt sốt thịt, lá mì và béchamel vào khay; lặp lại, phủ mozzarella và parmesan.', 'Nướng 190°C khoảng 35–40 phút đến khi mặt vàng; để nghỉ 10 phút rồi cắt.'],
    tip: 'Để lasagna nghỉ sau khi nướng giúp các lớp đứng form khi cắt.'
  },
  'risotto-nam': {
    time: '40 phút', difficulty: 'Trung bình', servings: 3,
    ingredients: ['250 g gạo arborio', '250 g nấm', '900 ml nước dùng rau củ nóng', '1 củ hành tím', '60 ml rượu vang trắng tùy chọn', 'Bơ, parmesan và tiêu'],
    steps: ['Xào nấm với bơ đến vàng, để riêng. Phi hành tím, cho gạo vào đảo đến khi hạt trong.', 'Rót vang nếu dùng; sau đó thêm nước dùng nóng từng vá, khuấy đến khi gạo hút nước rồi mới thêm tiếp.', 'Khi gạo chín mềm nhưng còn lõi nhẹ, trộn nấm, bơ và parmesan; nêm tiêu.'],
    tip: 'Giữ nước dùng nóng để quá trình nấu không bị gián đoạn.'
  },
  bruschetta: {
    time: '20 phút', difficulty: 'Dễ', servings: 4,
    ingredients: ['1 ổ bánh mì baguette', '3 quả cà chua chín', '2 tép tỏi', 'Lá húng quế tươi', 'Dầu olive', 'Muối và tiêu'],
    steps: ['Cắt bánh thành lát xéo, nướng hai mặt đến vàng giòn.', 'Bỏ hạt cà chua, thái hạt lựu rồi trộn với húng quế, dầu olive, muối và tiêu.', 'Chà nhẹ tỏi lên mặt bánh nóng, múc hỗn hợp cà chua lên và dùng ngay.'],
    tip: 'Chỉ đặt nhân lên bánh ngay trước khi ăn để bánh giữ độ giòn.'
  }
};

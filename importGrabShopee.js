// importGrabShopee.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, disconnectDB } = require('./config/db');
const Restaurant = require('./models/Restaurant');
const grabShopeeDanangData = require('./data/seedData');
const { seedDatabase } = require('./utils/seeder');

async function runImport() {
  try {
    const { fallback } = await connectDB();
    if (!fallback) {
      console.log('✅ Đã kết nối MongoDB (mongodb://127.0.0.1:27017/hom_nay_an_gi)!');
    } else {
      console.log('✅ Đã kết nối bộ lưu trữ Hybrid JSON (data/restaurants.json)!');
    }

    let finalRestaurants = [...grabShopeeDanangData];

    // Nếu người dùng copy file grab_raw.json từ DevTools trình duyệt (GrabFood / ShopeeFood)
    // vào thư mục dự án, tự động bóc tách các quán từ file đó gộp chung vào luôn!
    const rawFilePath = path.join(__dirname, 'grab_raw.json');
    if (fs.existsSync(rawFilePath)) {
      console.log('🔍 Phát hiện file grab_raw.json! Đang tự động bóc tách dữ liệu GrabFood/ShopeeFood...');
      const rawContent = fs.readFileSync(rawFilePath, 'utf-8').trim();
      if (rawContent) {
        const rawJson = JSON.parse(rawContent);

        // Hỗ trợ cả cấu trúc JSON của GrabFood, ShopeeFood hoặc mảng trực tiếp
        const rawList =
          rawJson?.searchResult?.searchMerchants ||
          rawJson?.reply?.delivery_infos ||
          (Array.isArray(rawJson) ? rawJson : []);

        const parsedFromRaw = rawList.map((item) => {
          const name = item.address?.name || item.name || 'Quán Ngon Đà Nẵng';
          const address =
            (typeof item.address === 'string' ? item.address : item.address?.street) ||
            'Hải Châu, Đà Nẵng';
          const image =
            item.merchantBrief?.photoHref ||
            item.photos?.[0]?.value ||
            item.image ||
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';

          return {
            name,
            address,
            district: item.district || 'Hải Châu',
            category: item.merchantBrief?.cuisine?.[0] || item.category || 'Món Nước',
            cuisine: item.cuisine || 'viet',
            image,
            rating: Number(item.merchantBrief?.rating || item.rating?.avg || item.rating || 4.7),
            reviewCount: item.merchantBrief?.vote_count
              ? `${item.merchantBrief.vote_count}+`
              : item.reviewCount || '200+',
            deliveryTime: item.estimatedDeliveryTime
              ? `${item.estimatedDeliveryTime} phút`
              : item.deliveryTime || '15 phút',
            distance: item.merchantBrief?.distanceInKm
              ? `${Number(item.merchantBrief.distanceInKm).toFixed(1)} km`
              : item.distance || '1.5 km',
            isPreferred: item.isPreferred !== undefined ? Boolean(item.isPreferred) : true,
            promoTag:
              item.merchantBrief?.promo?.description ||
              item.promoTag ||
              'Freeship 15k',
            priceRange: item.priceRange || '25.000đ - 60.000đ',
            openingHours: item.openingHours || '06:30 - 22:00',
            mealTime: item.mealTime || ['Sáng', 'Trưa', 'Chiều', 'Tối'],
            mapUrl:
              item.mapUrl ||
              'https://www.google.com/maps/search/?api=1&query=' +
                encodeURIComponent(`${name}, ${address}`),
            menu: Array.isArray(item.menu) && item.menu.length > 0
              ? item.menu
              : [
                  {
                    name: `Phần Đặc Biệt - ${name}`,
                    description: 'Món bán chạy nhất của quán trên GrabFood / ShopeeFood',
                    price: 45000,
                    image,
                    isBestSeller: true
                  },
                  {
                    name: `Combo Tiết Kiệm (Món chính + Nước)`,
                    description: 'Đầy đủ dinh dưỡng, đóng gói cẩn thận giao tận nơi',
                    price: 59000,
                    image,
                    isBestSeller: false
                  }
                ]
          };
        });

        console.log(`📦 Đã bóc tách thêm ${parsedFromRaw.length} quán từ grab_raw.json!`);
        finalRestaurants = [...finalRestaurants, ...parsedFromRaw];
      }
    }

    await Restaurant.deleteMany({});
    const inserted = await Restaurant.insertMany(finalRestaurants);

    // Đảm bảo tài khoản Admin & User mặc định luôn sẵn sàng
    await seedDatabase({ seedUsers: true, seedRestaurants: false });

    console.log(
      `🎉 Đã nạp thành công ${inserted.length} quán ăn chuẩn giao diện GrabFood/ShopeeFood (kèm Menu chi tiết) vào hệ thống!`
    );
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

runImport();

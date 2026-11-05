// models/Restaurant.js
const mongoose = require('mongoose');
const { createHybridModel } = require('../utils/hybridModel');

// Schema cho từng món ăn bên trong quán (Menu của quán chuẩn GrabFood / ShopeeFood)
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },         // VD: Mì Quảng Đặc Biệt
  description: { type: String, default: '' },     // VD: Tôm, thịt, trứng, chả, sườn
  price: { type: Number, required: true },        // VD: 45000
  image: { type: String, default: '' },           // Ảnh thật của món
  isBestSeller: { type: Boolean, default: false } // Nhãn "Bán chạy" giống ShopeeFood
});

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  district: { type: String, default: 'Hải Châu' }, // Hải Châu, Thanh Khê, Sơn Trà, Ngũ Hành Sơn...
  category: { type: String, default: 'Món Nước' },  // Món Nước, Cơm, Đặc Sản, Ăn Vặt & Chè...
  cuisine: {
    type: String,
    enum: ['viet', 'nhat', 'han', 'trung', 'thai', 'y'],
    default: 'viet'
  },
  mealTime: {
    type: [String],
    default: ['Sáng', 'Trưa', 'Chiều', 'Tối']
  },

  // --- CÁC TRƯỜNG CHUẨN GRABFOOD / SHOPEEFOOD ---
  image: { type: String, required: true },             // Ảnh bìa quán
  rating: { type: Number, default: 4.8 },              // Điểm sao (VD: 4.8)
  reviewCount: { type: String, default: '999+' },      // Số lượt đánh giá (VD: "500+", "999+")
  deliveryTime: { type: String, default: '15 phút' },  // Thời gian giao dự kiến
  distance: { type: String, default: '1.2 km' },       // Khoảng cách
  isPreferred: { type: Boolean, default: true },       // Nhãn "Yêu thích+" (ShopeeFood) / "Partner" (Grab)
  promoTag: { type: String, default: 'Giảm 15k' },     // Nhãn mã giảm giá hiện trên card
  priceRange: { type: String, default: '25.000đ - 55.000đ' },
  openingHours: { type: String, default: '06:00 - 22:00' },

  // Tọa độ & Link bản đồ
  lat: { type: Number, default: 16.0678 },
  lng: { type: Number, default: 108.2208 },
  mapUrl: { type: String, default: '' },

  // Liên kết với các mã món ăn trong kho 30 món (nếu có)
  dishes: { type: [String], default: [] },

  // Thực đơn món ăn của quán
  menu: { type: [menuItemSchema], default: [] }
}, { timestamps: true });

restaurantSchema.pre('save', function fillMapUrl(next) {
  if (!this.mapUrl) {
    this.mapUrl =
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(`${this.name}, ${this.address}`);
  }
  next();
});

restaurantSchema.index({ category: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ district: 1 });
restaurantSchema.index({ mealTime: 1 });

const MongooseRestaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

module.exports = createHybridModel('Restaurant', MongooseRestaurant, {
  defaults: {
    district: 'Hải Châu',
    category: 'Món Nước',
    cuisine: 'viet',
    mealTime: ['Sáng', 'Trưa', 'Chiều', 'Tối'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    rating: 4.8,
    reviewCount: '999+',
    deliveryTime: '15 phút',
    distance: '1.2 km',
    isPreferred: true,
    promoTag: 'Giảm 15k',
    priceRange: '25.000đ - 55.000đ',
    openingHours: '06:00 - 22:00',
    lat: 16.0678,
    lng: 108.2208,
    mapUrl: '',
    dishes: [],
    menu: []
  }
});

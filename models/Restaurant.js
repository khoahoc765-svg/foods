const mongoose = require('mongoose');
const { createHybridModel } = require('./dbHelper');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, default: '0901 234 567' },
  category: { type: String, default: 'Việt Nam' },
  priceRange: { type: String, default: '35k - 65k' },
  rating: { type: Number, default: 4.8 },
  openTime: { type: String, default: '06:30 - 22:00' },
  isPartner: { type: Boolean, default: true },
  commissionRate: { type: Number, default: 15 },
  dishes: { type: [String], default: [] },
  shippers: { type: [String], default: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ'] },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseRestaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

module.exports = createHybridModel('Restaurant', MongooseRestaurant, {
  phone: '0901 234 567',
  category: 'Việt Nam',
  priceRange: '35k - 65k',
  rating: 4.8,
  openTime: '06:30 - 22:00',
  isPartner: true,
  commissionRate: 15,
  dishes: [],
  shippers: ['GrabFood', 'ShopeeFood', 'BeFood', 'Shipper Nội Bộ'],
  image: ''
});

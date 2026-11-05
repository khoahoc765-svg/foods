const mongoose = require('mongoose');
const { createHybridModel } = require('./dbHelper');

const shipperSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  provider: { type: String, default: 'GrabFood' }, // GrabFood, ShopeeFood, BeFood, Ahamove, Nội bộ
  vehiclePlate: { type: String, default: '59-X1 123.45' },
  status: { type: String, enum: ['available', 'delivering', 'offline'], default: 'available' },
  rating: { type: Number, default: 4.9 },
  completedOrders: { type: Number, default: 120 },
  createdAt: { type: Date, default: Date.now }
});

const MongooseShipper = mongoose.models.Shipper || mongoose.model('Shipper', shipperSchema);

module.exports = createHybridModel('Shipper', MongooseShipper, {
  provider: 'GrabFood',
  vehiclePlate: '59-X1 123.45',
  status: 'available',
  rating: 4.9,
  completedOrders: 120
});

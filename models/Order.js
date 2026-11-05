const mongoose = require('mongoose');
const { createHybridModel } = require('./dbHelper');

const orderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerAddress: { type: String, required: true },
  dishId: { type: String, required: true },
  dishName: { type: String, required: true },
  restaurantId: { type: String, default: '' },
  restaurantName: { type: String, required: true },
  restaurantAddress: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  itemPrice: { type: Number, default: 55000 },
  shippingFee: { type: Number, default: 15000 },
  totalAmount: { type: Number, default: 70000 },
  shipperProvider: { type: String, default: 'GrabFood' },
  shipperId: { type: String, default: '' },
  shipperName: { type: String, default: 'Đang điều phối' },
  shipperPhone: { type: String, default: '' },
  shipperPlate: { type: String, default: '' },
  note: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'delivering', 'completed', 'cancelled'],
    default: 'delivering'
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = createHybridModel('Order', MongooseOrder, {
  quantity: 1,
  itemPrice: 55000,
  shippingFee: 15000,
  totalAmount: 70000,
  shipperProvider: 'GrabFood',
  status: 'delivering',
  note: ''
});

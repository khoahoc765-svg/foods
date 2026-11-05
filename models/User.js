const mongoose = require('mongoose');
const { createHybridModel } = require('./dbHelper');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user' // Mặc định khi đăng ký là user thường
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = createHybridModel('User', MongooseUser, {
  role: 'user',
  isActive: true
});

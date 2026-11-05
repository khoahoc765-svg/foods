const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createHybridModel } = require('../utils/hybridModel');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng'],
      trim: true,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = createHybridModel('User', MongooseUser, {
  defaults: {
    role: 'user',
    isActive: true,
    favoriteRestaurants: []
  }
});

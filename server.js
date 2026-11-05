require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { ensureRichSeedData } = require('./seedData');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình View Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hom-nay-an-gi-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 ngày
  })
);

// Khai báo Routes cho Auth, API (Quay món -> Quán đối tác, Công thức, Shipper) và Admin
app.use('/', authRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Phục vụ các file tĩnh gốc của dự án (index.html, cuisines.html, dishes.html, result.html, css, js...)
app.use(express.static(path.join(__dirname)));

// Kết nối MongoDB (Nếu máy chưa bật MongoDB local thì tự động dùng Local JSON DB để chạy ngay)
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hom_nay_an_gi';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1500 });
    global.USE_MONGODB = true;
    console.log('✅ Đã kết nối MongoDB tại:', mongoUri);
  } catch (err) {
    global.USE_MONGODB = false;
    console.log('ℹ️ MongoDB local chưa bật -> Tự động sử dụng kho dữ liệu JSON cục bộ (data/*.json).');
  }

  await ensureRichSeedData();

  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🎰 Trang Quay Món & Đặt Shipper: http://localhost:${PORT}/result.html?mode=any`);
    console.log(`🔑 Trang Đăng nhập Admin: http://localhost:${PORT}/login`);
    console.log(`📊 Trang Admin Dashboard v2.0: http://localhost:${PORT}/admin`);
  });
}

connectDB();

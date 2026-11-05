require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const { connectDB } = require('./config/db');
const { seedIfEmpty } = require('./utils/seeder');
const { attachUser } = require('./middlewares/auth');
const flash = require('./middlewares/flash');

const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/homeRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const BASE_PORT = Number(process.env.PORT) || 3000;

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware chung ----------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname), { index: false }));

app.use(
  session({
    name: 'hnag.sid',
    secret: process.env.SESSION_SECRET || 'hom-nay-an-gi-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 ngày
    }
  })
);

app.use(flash);
app.use(attachUser);

// Biến dùng chung cho mọi view
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// ---------- Routes ----------
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/admin', adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Không tìm thấy API.' });
  }
  return res.status(404).render('error', {
    title: 'Không tìm thấy trang',
    status: 404,
    message: 'Trang bạn tìm không tồn tại hoặc đã bị di chuyển.'
  });
});

// ---------- Xử lý lỗi tập trung ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ error: 'Lỗi máy chủ, vui lòng thử lại sau.' });
  }
  return res.status(status).render('error', {
    title: 'Có lỗi xảy ra',
    status,
    message: 'Đã có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau.'
  });
});

function startListening(port, fallback, fallbackCount = 0) {
  const server = app.listen(port, () => {
    console.log(`🚀 Hôm Nay Ăn Gì? đang chạy tại: http://localhost:${port}`);
    console.log(`🍜 Quán ăn Đà Nẵng (Grab/Shopee): http://localhost:${port}/restaurants`);
    console.log(`📊 Admin Dashboard: http://localhost:${port}/admin  (admin@gmail.com / 123456)`);
    if (fallback) console.log('ℹ️  Đang sử dụng dữ liệu JSON cục bộ (data/*.json).');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (fallbackCount < 10 && port < 65535) {
        const nextPort = port + 1;
        console.warn(`⚠️  Cổng ${port} đang được sử dụng, thử cổng ${nextPort}...`);
        startListening(nextPort, fallback, fallbackCount + 1);
        return;
      }
      console.error(`❌ Không thể khởi động server: không tìm được cổng trống gần ${BASE_PORT}.`);
      process.exitCode = 1;
      return;
    }
    console.error('❌ Không thể khởi động server:', err.message);
    process.exit(1);
  });
}

// ---------- Khởi động ----------
(async () => {
  try {
    const { fallback } = await connectDB();
    await seedIfEmpty();
    startListening(BASE_PORT, fallback);
  } catch (err) {
    console.error('❌ Không thể khởi động server:', err.message);
    process.exit(1);
  }
})();

const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/hom_nay_an_gi';

async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
    global.USE_MONGODB = true;
    console.log('✅ MongoDB đã kết nối thành công.');
    return { uri, fallback: false };
  } catch (err) {
    if (process.env.USE_MEMORY_DB_FALLBACK === 'false') {
      throw err;
    }

    global.USE_MONGODB = false;
    console.warn(`⚠️  Không thể kết nối MongoDB (${err.message}).`);
    console.warn('ℹ️  Đang dùng dữ liệu JSON cục bộ trong data/*.json.');
    return { uri: 'local-json-storage', fallback: true };
  }
}

async function disconnectDB() {
  if (global.USE_MONGODB) {
    await mongoose.disconnect();
  }
}

module.exports = { connectDB, disconnectDB };

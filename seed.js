require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seeder');

(async () => {
  try {
    await connectDB();
    const result = await seedDatabase();
    console.log(`🌱 Đã bổ sung dữ liệu mẫu: ${result.users} user, ${result.restaurants} quán ăn Đà Nẵng.`);
    console.log('   Admin: admin@gmail.com / 123456');
    console.log('   User : minhanh@gmail.com / 123456, thuha@gmail.com / 123456');
  } catch (err) {
    console.error('❌ Seed thất bại:', err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { RESTAURANTS, USERS } = require('../data/seedData');

/** Nạp dữ liệu mẫu còn thiếu mà không xóa hoặc ghi đè dữ liệu hiện có. */
async function seedDatabase({ seedUsers = true, seedRestaurants = true } = {}) {
  let insertedUsers = 0;
  let insertedRestaurants = 0;
  const restaurants = [];

  if (seedRestaurants) {
    for (const data of RESTAURANTS) {
      let restaurant = await Restaurant.findOne({ name: data.name, address: data.address });
      if (!restaurant) {
        restaurant = await Restaurant.create(data);
        insertedRestaurants += 1;
      }
      restaurants.push(restaurant);
    }
  } else {
    restaurants.push(...(await Restaurant.find().sort({ createdAt: 1 }).limit(3)));
  }

  const users = [];
  if (seedUsers) {
    for (const data of USERS) {
      let user = await User.findOne({ email: data.email });
      if (!user) {
        user = await User.create(data);
        insertedUsers += 1;
      }
      users.push(user);
    }
  }

  const sampleUser = users.find((user) => user.role === 'user');
  if (sampleUser && !(sampleUser.favoriteRestaurants || []).length && restaurants.length) {
    sampleUser.favoriteRestaurants = restaurants.slice(0, 3).map((restaurant) => restaurant._id);
    await sampleUser.save();
  }

  return { users: insertedUsers, restaurants: insertedRestaurants };
}

/** Chỉ nạp collection còn trống khi khởi động server. */
async function seedIfEmpty() {
  const [userCount, restaurantCount] = await Promise.all([
    User.countDocuments(),
    Restaurant.countDocuments()
  ]);
  if (userCount === 0 || restaurantCount === 0) {
    const result = await seedDatabase({
      seedUsers: userCount === 0,
      seedRestaurants: restaurantCount === 0
    });
    console.log(`🌱 Đã nạp dữ liệu còn thiếu: ${result.users} user, ${result.restaurants} quán ăn.`);
  }
}

module.exports = { seedDatabase, seedIfEmpty };

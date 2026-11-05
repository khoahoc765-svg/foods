const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { CATEGORIES, MEAL_TIMES, CATEGORY_EMOJI } = require('../utils/constants');
const { getCurrentMealTime, MEAL_GREETINGS } = require('../utils/mealTime');
const { resolveRestaurantFilter } = require('../utils/filters');

/** Trang chủ: lời chào theo khung giờ, máy quay chọn món, bộ lọc và danh sách quán */
async function index(req, res, next) {
  try {
    const currentMeal = getCurrentMealTime();
    const { filter, applied } = await resolveRestaurantFilter(Restaurant, req.query);

    const restaurants = await Restaurant.find(filter).sort({ rating: -1, name: 1 }).lean();

    const favoriteIds = req.user
      ? (req.user.favoriteRestaurants || []).map((id) => String(id))
      : [];

    res.render('home', {
      title: 'Hôm nay ăn gì?',
      currentMeal,
      greeting: MEAL_GREETINGS[currentMeal],
      categories: CATEGORIES,
      mealTimes: MEAL_TIMES,
      categoryEmoji: CATEGORY_EMOJI,
      restaurants,
      applied,
      favoriteIds
    });
  } catch (err) {
    next(err);
  }
}

/** Trang quán yêu thích của user đang đăng nhập */
async function favorites(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('favoriteRestaurants').lean();
    const restaurants = (user.favoriteRestaurants || []).filter(Boolean);

    res.render('favorites', {
      title: 'Quán yêu thích',
      restaurants,
      categoryEmoji: CATEGORY_EMOJI,
      favoriteIds: restaurants.map((r) => String(r._id))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { index, favorites };

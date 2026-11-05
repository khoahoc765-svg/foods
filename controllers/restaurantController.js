const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const { CATEGORIES, MEAL_TIMES } = require('../utils/constants');
const { getCurrentMealTime } = require('../utils/mealTime');
const { resolveRestaurantFilter } = require('../utils/filters');

/** GET /api/restaurants?category=&mealTime=&q= */
async function list(req, res, next) {
  try {
    const { filter, applied } = await resolveRestaurantFilter(Restaurant, req.query);
    const restaurants = await Restaurant.find(filter).sort({ rating: -1, name: 1 }).lean();
    res.json({ total: restaurants.length, filters: applied, restaurants });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/restaurants/random?category=&mealTime=
 * Trả về 1 quán ngẫu nhiên thỏa điều kiện + danh sách tên để chạy hiệu ứng máy quay.
 * mealTime=now  → tự dùng buổi ăn theo giờ hiện tại.
 */
async function random(req, res, next) {
  try {
    const query = { ...req.query };
    if (query.mealTime === 'now') query.mealTime = getCurrentMealTime();

    const { filter, applied } = await resolveRestaurantFilter(Restaurant, query);

    const [picked] = await Restaurant.aggregate([{ $match: filter }, { $sample: { size: 1 } }]);

    if (!picked) {
      return res.status(404).json({
        error: 'Không có quán nào khớp bộ lọc. Thử bỏ bớt điều kiện nhé!',
        filters: applied
      });
    }

    // Tên các quán khác để làm "cuộn" cho máy quay (không lộ kết quả trước)
    const reel = await Restaurant.aggregate([
      { $match: { ...filter, _id: { $ne: picked._id } } },
      { $sample: { size: 12 } },
      { $project: { _id: 0, name: 1 } }
    ]);

    res.json({
      filters: applied,
      restaurant: picked,
      reel: reel.map((r) => r.name)
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/restaurants/meta — danh mục, buổi ăn và buổi hiện tại */
function meta(req, res) {
  res.json({ categories: CATEGORIES, mealTimes: MEAL_TIMES, currentMeal: getCurrentMealTime() });
}

/** GET /api/restaurants/:id */
async function detail(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ.' });
    }
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy quán ăn.' });
    res.json({ restaurant });
  } catch (err) {
    next(err);
  }
}

/** POST /api/restaurants/:id/favorite — bật/tắt quán yêu thích (cần đăng nhập) */
async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'ID quán không hợp lệ.' });
    }
    if (!(await Restaurant.exists({ _id: id }))) {
      return res.status(404).json({ error: 'Không tìm thấy quán ăn.' });
    }

    const isFavorite = (req.user.favoriteRestaurants || []).some((fid) => String(fid) === id);
    const update = isFavorite
      ? { $pull: { favoriteRestaurants: id } }
      : { $addToSet: { favoriteRestaurants: id } };

    await User.updateOne({ _id: req.user._id }, update);
    res.json({ favorite: !isFavorite });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, random, meta, detail, toggleFavorite };

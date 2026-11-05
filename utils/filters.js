const { CATEGORIES, MEAL_TIMES } = require('./constants');
const CUISINES = ['viet', 'nhat', 'han', 'trung', 'thai', 'y'];

/** Escape ký tự đặc biệt để dùng chuỗi người dùng nhập trong RegExp an toàn */
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tạo điều kiện truy vấn MongoDB từ query string.
 * Chỉ chấp nhận category/mealTime có trong danh sách hợp lệ (bỏ qua giá trị lạ).
 */
function buildRestaurantFilter({ category, mealTime, q, dish, dishName, cuisine } = {}) {
  const filter = {};
  const applied = { category: '', mealTime: '', q: '', dish: '', dishName: '', cuisine: '', dishFallback: false };

  if (category && CATEGORIES.includes(category)) {
    filter.category = category;
    applied.category = category;
  }
  if (mealTime && MEAL_TIMES.includes(mealTime)) {
    filter.mealTime = mealTime; // mảng chứa phần tử này
    applied.mealTime = mealTime;
  }
  if (q && String(q).trim()) {
    const keyword = String(q).trim().slice(0, 60);
    const regex = new RegExp(escapeRegex(keyword), 'i');
    filter.$or = [{ name: regex }, { address: regex }];
    applied.q = keyword;
  }
  if (typeof dish === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(dish) && dish.length <= 60) {
    filter.dishes = dish;
    applied.dish = dish;
    applied.dishName = typeof dishName === 'string' ? dishName.trim().slice(0, 80) : '';
  }
  if (typeof cuisine === 'string' && CUISINES.includes(cuisine)) {
    filter.cuisine = cuisine;
    applied.cuisine = cuisine;
  }

  return { filter, applied };
}

async function resolveRestaurantFilter(Restaurant, query) {
  const result = buildRestaurantFilter(query);
  if (result.applied.dish && result.applied.cuisine) {
    const matchingCount = await Restaurant.countDocuments(result.filter);
    if (matchingCount === 0) {
      delete result.filter.dishes;
      result.applied.dishFallback = true;
    }
  }
  return result;
}

module.exports = { buildRestaurantFilter, resolveRestaurantFilter };

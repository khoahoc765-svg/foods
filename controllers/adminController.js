const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { CATEGORIES, MEAL_TIMES, CATEGORY_EMOJI } = require('../utils/constants');

const CUISINES = [
  { key: 'viet', name: 'Việt Nam' },
  { key: 'nhat', name: 'Nhật Bản' },
  { key: 'han', name: 'Hàn Quốc' },
  { key: 'trung', name: 'Trung Hoa' },
  { key: 'thai', name: 'Thái Lan' },
  { key: 'y', name: 'Ý' }
];

function parseMenuText(menuText, defaultImage) {
  if (!menuText || !String(menuText).trim()) return null;
  const lines = String(menuText)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, index) => {
    const parts = line.split('|').map((p) => p.trim());
    return {
      name: parts[0] || `Món số ${index + 1}`,
      price: Number(String(parts[1] || '45000').replace(/[^\d]/g, '')) || 45000,
      description: parts[2] || 'Món ngon chuẩn vị Đà Nẵng',
      isBestSeller: parts[3] ? parts[3] === '1' || parts[3].toLowerCase() === 'true' : index < 2,
      image: parts[4] || defaultImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300'
    };
  });
}

function parseRestaurantForm(body) {
  let mealTime = body.mealTime || [];
  if (!Array.isArray(mealTime)) mealTime = [mealTime];
  mealTime = MEAL_TIMES.filter((m) => mealTime.includes(m));
  if (mealTime.length === 0) mealTime = ['Sáng', 'Trưa', 'Chiều', 'Tối'];

  const rating = Number(body.rating);
  const validCuisines = ['viet', 'nhat', 'han', 'trung', 'thai', 'y'];
  const cuisine = validCuisines.includes(body.cuisine) ? body.cuisine : 'viet';
  const image =
    String(body.image || '').trim() ||
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600';

  const parsed = {
    name: String(body.name || '').trim(),
    address: String(body.address || '').trim(),
    district: String(body.district || 'Hải Châu').trim(),
    category: String(body.category || CATEGORIES[0]).trim(),
    cuisine,
    mealTime,
    priceRange: String(body.priceRange || '30.000đ - 65.000đ').trim(),
    promoTag: String(body.promoTag || 'Freeship 15k').trim(),
    deliveryTime: String(body.deliveryTime || '15 phút').trim(),
    distance: String(body.distance || '1.2 km').trim(),
    reviewCount: String(body.reviewCount || '999+').trim(),
    openingHours: String(body.openingHours || '06:30 - 22:00').trim(),
    isPreferred: body.isPreferred === 'on' || body.isPreferred === 'true' || body.isPreferred === true,
    mapUrl: String(body.mapUrl || '').trim(),
    image,
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 4.8
  };

  const parsedMenu = parseMenuText(body.menuText, image);
  if (parsedMenu) {
    parsed.menu = parsedMenu;
  }
  return parsed;
}

function validationMessage(err) {
  if (err && err.name === 'ValidationError') return Object.values(err.errors)[0].message;
  return null;
}

async function dashboard(req, res, next) {
  try {
    const [totalUsers, totalRestaurants, totalAdmins, lockedUsers, byCategory, users, restaurants] =
      await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isActive: false }),
        Restaurant.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
          { $sort: { count: -1 } }
        ]),
        User.find().select('-password').sort({ createdAt: -1 }).lean(),
        Restaurant.find().sort({ createdAt: -1 }).lean()
      ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalUsers, totalRestaurants, totalAdmins, lockedUsers },
      storageStatus: Restaurant.isUsingMongo() ? 'MongoDB trực tuyến' : 'JSON dự phòng trên máy',
      byCategory,
      users,
      restaurants,
      categories: CATEGORIES,
      mealTimes: MEAL_TIMES,
      cuisines: CUISINES,
      categoryEmoji: CATEGORY_EMOJI,
      tab: ['users', 'restaurants'].includes(req.query.tab) ? req.query.tab : 'overview'
    });
  } catch (err) {
    next(err);
  }
}

async function findTargetUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    req.flash('error', 'ID người dùng không hợp lệ.');
    res.redirect('/admin?tab=users');
    return null;
  }
  if (String(req.user._id) === id) {
    req.flash('error', 'Bạn không thể tự đổi quyền, khóa hoặc xóa chính tài khoản của mình.');
    res.redirect('/admin?tab=users');
    return null;
  }
  const user = await User.findById(id);
  if (!user) {
    req.flash('error', 'Không tìm thấy người dùng.');
    res.redirect('/admin?tab=users');
    return null;
  }
  return user;
}

async function toggleRole(req, res, next) {
  try {
    const user = await findTargetUser(req, res);
    if (!user) return;

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    req.flash('success', `Đã đổi quyền ${user.username} thành ${user.role === 'admin' ? 'Admin' : 'User'}.`);
    res.redirect('/admin?tab=users');
  } catch (err) {
    next(err);
  }
}

async function toggleActive(req, res, next) {
  try {
    const user = await findTargetUser(req, res);
    if (!user) return;

    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `Đã ${user.isActive ? 'mở khóa' : 'khóa'} tài khoản ${user.username}.`);
    res.redirect('/admin?tab=users');
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await findTargetUser(req, res);
    if (!user) return;

    await user.deleteOne();
    req.flash('success', `Đã xóa tài khoản ${user.username}.`);
    res.redirect('/admin?tab=users');
  } catch (err) {
    next(err);
  }
}

async function createRestaurant(req, res, next) {
  try {
    const data = parseRestaurantForm(req.body);
    const restaurant = new Restaurant(data);
    await restaurant.save();
    req.flash('success', `Đã thêm quán "${restaurant.name}".`);
    res.redirect('/admin?tab=restaurants');
  } catch (err) {
    const msg = validationMessage(err);
    if (msg) {
      req.flash('error', msg);
      return res.redirect('/admin?tab=restaurants');
    }
    next(err);
  }
}

async function updateRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash('error', 'ID quán không hợp lệ.');
      return res.redirect('/admin?tab=restaurants');
    }
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      req.flash('error', 'Không tìm thấy quán ăn.');
      return res.redirect('/admin?tab=restaurants');
    }

    restaurant.set(parseRestaurantForm(req.body));
    await restaurant.save();
    req.flash('success', `Đã cập nhật quán "${restaurant.name}".`);
    res.redirect('/admin?tab=restaurants');
  } catch (err) {
    const msg = validationMessage(err);
    if (msg) {
      req.flash('error', msg);
      return res.redirect('/admin?tab=restaurants');
    }
    next(err);
  }
}

async function deleteRestaurant(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      req.flash('error', 'ID quán không hợp lệ.');
      return res.redirect('/admin?tab=restaurants');
    }
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (restaurant) {
      await User.updateMany({}, { $pull: { favoriteRestaurants: restaurant._id } });
      req.flash('success', `Đã xóa quán "${restaurant.name}".`);
    } else {
      req.flash('error', 'Không tìm thấy quán ăn.');
    }
    res.redirect('/admin?tab=restaurants');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
  toggleRole,
  toggleActive,
  deleteUser,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};

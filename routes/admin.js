const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Shipper = require('../models/Shipper');
const Order = require('../models/Order');
const Recipe = require('../models/Recipe');
const isAdmin = require('../middlewares/isAdmin');
const { ALL_DISHES } = require('../seedData');

// 1. Trang tổng quan Admin (Dashboard)
router.get('/', isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalRestaurants,
      totalShippers,
      totalOrders,
      totalRecipes,
      users,
      restaurants,
      shippers,
      orders,
      recipes
    ] = await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Shipper.countDocuments(),
      Order.countDocuments(),
      Recipe.countDocuments(),
      User.find().sort({ createdAt: -1 }),
      Restaurant.find().sort({ createdAt: -1 }),
      Shipper.find().sort({ createdAt: -1 }),
      Order.find().sort({ createdAt: -1 }),
      Recipe.find().sort({ createdAt: -1 })
    ]);

    const partnerCount = restaurants.filter((r) => r.isPartner).length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    res.render('admin/dashboard', {
      totalUsers,
      totalRestaurants,
      partnerCount,
      totalShippers,
      totalOrders,
      totalRecipes,
      totalRevenue,
      users,
      restaurants,
      shippers,
      orders,
      recipes,
      allDishes: ALL_DISHES,
      currentUser: req.session.user,
      activeTab: req.query.tab || 'overview'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi Server khi tải trang Admin');
  }
});

// ================= QUẢN LÝ QUÁN ĂN & ĐỐI TÁC =================

// Thêm quán ăn mới (kèm danh sách món bán, đối tác hợp tác, shipper hỗ trợ)
router.post('/restaurants/add', isAdmin, async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      category,
      priceRange,
      openTime,
      isPartner,
      commissionRate,
      dishes,
      shippers
    } = req.body;

    const dishArray = Array.isArray(dishes)
      ? dishes
      : dishes
      ? [dishes]
      : [];

    const shipperArray = Array.isArray(shippers)
      ? shippers
      : shippers
      ? [shippers]
      : ['GrabFood', 'ShopeeFood'];

    await Restaurant.create({
      name,
      address,
      phone: phone || '0901 234 567',
      category: category || 'Việt Nam',
      priceRange: priceRange || '35k - 75k',
      openTime: openTime || '07:00 - 22:00',
      isPartner: isPartner === 'on' || isPartner === 'true' || isPartner === true,
      commissionRate: Number(commissionRate) || 15,
      dishes: dishArray,
      shippers: shipperArray
    });

    res.redirect('/admin?tab=restaurants');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi thêm quán ăn');
  }
});

// Bật / Tắt trạng thái Quán Hợp Tác (Đối tác cung cấp món)
router.post('/restaurants/:id/toggle-partner', isAdmin, async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id);
    if (rest) {
      rest.isPartner = !rest.isPartner;
      await rest.save();
    }
    res.redirect('/admin?tab=restaurants');
  } catch (error) {
    res.status(500).send('Lỗi khi cập nhật trạng thái đối tác của quán');
  }
});

// Cập nhật danh sách món ăn & Shipper của quán
router.post('/restaurants/:id/update-dishes', isAdmin, async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id);
    if (rest) {
      const { dishes, shippers } = req.body;
      rest.dishes = Array.isArray(dishes) ? dishes : dishes ? [dishes] : [];
      if (shippers) {
        rest.shippers = Array.isArray(shippers) ? shippers : [shippers];
      }
      await rest.save();
    }
    res.redirect('/admin?tab=restaurants');
  } catch (error) {
    res.status(500).send('Lỗi khi cập nhật thực đơn quán');
  }
});

// Xóa quán ăn
router.post('/restaurants/:id/delete', isAdmin, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.redirect('/admin?tab=restaurants');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa quán ăn');
  }
});

// ================= QUẢN LÝ CÔNG THỨC NẤU ĂN =================

router.post('/recipes/save', isAdmin, async (req, res) => {
  try {
    const { dishId, prepTime, difficulty, calories, ingredientsText, stepsText, tips } = req.body;
    const dishInfo = ALL_DISHES.find((d) => d.id === dishId);
    const dishName = dishInfo ? dishInfo.name : dishId;

    const ingredients = (ingredientsText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const steps = (stepsText || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const existing = await Recipe.findOne({ dishId });
    if (existing) {
      existing.dishName = dishName;
      existing.prepTime = prepTime || '25 phút';
      existing.difficulty = difficulty || 'Dễ';
      existing.calories = calories || '450 kcal';
      existing.ingredients = ingredients;
      existing.steps = steps;
      existing.tips = tips || '';
      await existing.save();
    } else {
      await Recipe.create({
        dishId,
        dishName,
        prepTime: prepTime || '25 phút',
        difficulty: difficulty || 'Dễ',
        calories: calories || '450 kcal',
        ingredients,
        steps,
        tips: tips || ''
      });
    }

    res.redirect('/admin?tab=recipes');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lưu công thức nấu ăn');
  }
});

router.post('/recipes/:id/delete', isAdmin, async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.redirect('/admin?tab=recipes');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa công thức');
  }
});

// ================= QUẢN LÝ ĐỐI TÁC SHIPPER & ĐƠN HÀNG =================

router.post('/shippers/add', isAdmin, async (req, res) => {
  try {
    const { name, phone, provider, vehiclePlate } = req.body;
    await Shipper.create({
      name,
      phone,
      provider: provider || 'GrabFood',
      vehiclePlate: vehiclePlate || '59-X1 686.88',
      status: 'available',
      rating: 4.9,
      completedOrders: 1
    });
    res.redirect('/admin?tab=shippers');
  } catch (error) {
    res.status(500).send('Lỗi khi thêm Shipper');
  }
});

router.post('/shippers/:id/toggle-status', isAdmin, async (req, res) => {
  try {
    const shipper = await Shipper.findById(req.params.id);
    if (shipper) {
      shipper.status = shipper.status === 'available' ? 'delivering' : 'available';
      await shipper.save();
    }
    res.redirect('/admin?tab=shippers');
  } catch (error) {
    res.status(500).send('Lỗi khi đổi trạng thái Shipper');
  }
});

router.post('/shippers/:id/delete', isAdmin, async (req, res) => {
  try {
    await Shipper.findByIdAndDelete(req.params.id);
    res.redirect('/admin?tab=shippers');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa Shipper');
  }
});

router.post('/orders/:id/status', isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || 'completed';
      await order.save();
    }
    res.redirect('/admin?tab=orders');
  } catch (error) {
    res.status(500).send('Lỗi khi cập nhật trạng thái đơn hàng');
  }
});

router.post('/orders/:id/delete', isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.redirect('/admin?tab=orders');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa đơn hàng');
  }
});

// ================= QUẢN LÝ NGƯỜI DÙNG (USERS) =================

router.post('/users/add', isAdmin, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      isActive: true
    });
    res.redirect('/admin?tab=users');
  } catch (error) {
    res.status(500).send('Lỗi khi thêm người dùng');
  }
});

router.post('/users/:id/toggle-active', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role !== 'admin') {
      user.isActive = !user.isActive;
      await user.save();
    }
    res.redirect('/admin?tab=users');
  } catch (error) {
    res.status(500).send('Lỗi khi cập nhật trạng thái người dùng');
  }
});

router.post('/users/:id/delete', isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin?tab=users');
  } catch (error) {
    res.status(500).send('Lỗi khi xóa người dùng');
  }
});

module.exports = router;

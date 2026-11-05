const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Recipe = require('../models/Recipe');
const Shipper = require('../models/Shipper');
const Order = require('../models/Order');
const { ALL_DISHES } = require('../seedData');

// Helper: Chuẩn hóa dữ liệu 1 quán ăn kèm chi tiết thực đơn (menuItems) và đường dẫn API riêng
function enrichRestaurant(r) {
  const menuItems = (r.dishes || []).map((dId) => {
    const found = ALL_DISHES.find((d) => d.id === dId);
    return found
      ? { id: found.id, name: found.name, cuisine: found.cuisine, price: found.price }
      : { id: dId, name: dId, cuisine: 'viet', price: 50000 };
  });

  return {
    ...r,
    apiEndpoint: `/api/restaurants/${r._id}`,
    menuEndpoint: `/api/restaurants/${r._id}/menu`,
    orderEndpoint: `/api/restaurants/${r._id}/orders`,
    menuItems
  };
}

// 1. GET /api/restaurants — Lấy danh sách toàn bộ các quán ăn tại Đà Nẵng (hỗ trợ lọc ?partner=true, ?category=...)
router.get('/restaurants', async (req, res) => {
  try {
    let list = await Restaurant.find().sort({ createdAt: -1 });
    if (req.query.partner === 'true') {
      list = list.filter((r) => r.isPartner);
    }
    if (req.query.category) {
      list = list.filter((r) => r.category.toLowerCase() === req.query.category.toLowerCase());
    }
    res.json({
      total: list.length,
      city: 'Đà Nẵng',
      restaurants: list.map(enrichRestaurant)
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải danh sách quán ăn Đà Nẵng.' });
  }
});

// 2. GET /api/restaurants/:id — API riêng của TỪNG QUÁN ĂN (Thông tin quán, thực đơn, shipper liên kết, lịch sử đơn của quán)
router.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Không tìm thấy quán ăn này.' });
    }

    const [allShippers, allOrders] = await Promise.all([
      Shipper.find(),
      Order.find()
    ]);

    const enriched = enrichRestaurant(restaurant);
    const availableShippers = allShippers.filter(
      (s) => (restaurant.shippers || []).includes(s.provider)
    );
    const restaurantOrders = allOrders.filter(
      (o) => String(o.restaurantId) === String(restaurant._id) || o.restaurantName === restaurant.name
    );

    res.json({
      restaurant: enriched,
      availableShippers,
      stats: {
        totalMenuDishes: enriched.menuItems.length,
        totalOrders: restaurantOrders.length,
        totalRevenue: restaurantOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)
      },
      recentOrders: restaurantOrders.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải API chi tiết của quán.' });
  }
});

// 3. GET /api/restaurants/:id/menu — API lấy riêng Thực đơn (Menu + Công thức) của 1 quán cụ thể
router.get('/restaurants/:id/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Không tìm thấy quán ăn.' });
    }
    const recipes = await Recipe.find();
    const enriched = enrichRestaurant(restaurant);

    const detailedMenu = enriched.menuItems.map((item) => ({
      ...item,
      recipe: recipes.find((rc) => rc.dishId === item.id) || null
    }));

    res.json({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      address: restaurant.address,
      isPartner: restaurant.isPartner,
      menuCount: detailedMenu.length,
      menu: detailedMenu
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tải thực đơn của quán.' });
  }
});

// 4. POST /api/restaurants/:id/orders — API đặt món trực tiếp vào 1 quán cụ thể kèm gọi Shipper
router.post('/restaurants/:id/orders', async (req, res) => {
  req.body.restaurantId = req.params.id;
  return createOrderHandler(req, res);
});

// 5. GET /api/dish-details/:dishId — Lấy thông tin chi tiết của 1 món ăn sau khi quay:
//    - Danh sách các quán tại Đà Nẵng đang bán món này (ưu tiên quán đối tác lên đầu)
//    - Công thức nấu món này tại nhà
//    - Danh sách các Shipper bên thứ 3 đang sẵn sàng nhận đơn
router.get('/dish-details/:dishId', async (req, res) => {
  try {
    const { dishId } = req.params;
    const dishInfo = ALL_DISHES.find((d) => d.id === dishId);

    const [allRestaurants, recipe, shippers] = await Promise.all([
      Restaurant.find(),
      Recipe.findOne({ dishId }),
      Shipper.find()
    ]);

    let matchedRestaurants = allRestaurants
      .filter((r) => Array.isArray(r.dishes) && r.dishes.includes(dishId))
      .map(enrichRestaurant);

    // Sắp xếp quán đối tác (isPartner = true) lên đầu
    matchedRestaurants.sort((a, b) => Number(b.isPartner) - Number(a.isPartner));

    res.json({
      dishId,
      dishName: dishInfo ? dishInfo.name : dishId,
      defaultPrice: dishInfo ? dishInfo.price : 55000,
      restaurants: matchedRestaurants,
      recipe: recipe || null,
      shippers: shippers.filter((s) => s.status !== 'offline')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Không thể tải dữ liệu quán ăn và công thức.' });
  }
});

// 6. GET /api/recipes & /api/recipes/:dishId — API Công thức nấu ăn
router.get('/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.json({ total: recipes.length, recipes });
});

router.get('/recipes/:dishId', async (req, res) => {
  const recipe = await Recipe.findOne({ dishId: req.params.dishId });
  if (!recipe) return res.status(404).json({ error: 'Chưa có công thức cho món này.' });
  res.json({ recipe });
});

// 7. GET /api/shippers — API Danh sách đối tác vận chuyển (Shipper bên thứ 3 tại Đà Nẵng)
router.get('/shippers', async (req, res) => {
  const shippers = await Shipper.find();
  res.json({ total: shippers.length, city: 'Đà Nẵng', shippers });
});

// 8. POST /api/orders & GET /api/orders — Đặt món trực tiếp & điều phối Shipper bên thứ 3
async function createOrderHandler(req, res) {
  try {
    const {
      customerName,
      customerPhone,
      customerAddress,
      dishId,
      dishName,
      restaurantId,
      quantity,
      shipperProvider,
      note
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !dishId) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận món!' });
    }

    const restaurant = restaurantId ? await Restaurant.findById(restaurantId) : null;
    const dishInfo = ALL_DISHES.find((d) => d.id === dishId);
    const itemPrice = dishInfo ? dishInfo.price : 60000;
    const qty = Math.max(1, Number(quantity) || 1);
    const shippingFee = 15000;
    const totalAmount = itemPrice * qty + shippingFee;

    const allShippers = await Shipper.find();
    let assignedShipper =
      allShippers.find((s) => s.provider === shipperProvider && s.status === 'available') ||
      allShippers.find((s) => s.provider === shipperProvider) ||
      allShippers[0];

    const orderCode = 'DN-' + Math.floor(1000 + Math.random() * 9000);

    const newOrder = await Order.create({
      orderCode,
      customerName,
      customerPhone,
      customerAddress,
      dishId,
      dishName: dishName || (dishInfo ? dishInfo.name : dishId),
      restaurantId: restaurant ? String(restaurant._id) : '',
      restaurantName: restaurant ? restaurant.name : 'Quán Đối Tác Đà Nẵng',
      restaurantAddress: restaurant ? restaurant.address : 'Q. Hải Châu, Đà Nẵng',
      quantity: qty,
      itemPrice,
      shippingFee,
      totalAmount,
      shipperProvider: shipperProvider || 'GrabFood',
      shipperId: assignedShipper ? String(assignedShipper._id) : '',
      shipperName: assignedShipper ? assignedShipper.name : 'Nguyễn Văn Hùng (Khu vực Hải Châu)',
      shipperPhone: assignedShipper ? assignedShipper.phone : '0905 123 456',
      shipperPlate: assignedShipper ? assignedShipper.vehiclePlate : '43-C1 688.99',
      note: note || '',
      status: 'delivering'
    });

    res.json({
      success: true,
      message: 'Đặt món & kết nối Shipper Đà Nẵng thành công!',
      order: newOrder
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi tạo đơn đặt hàng Shipper.' });
  }
}

router.post('/orders', createOrderHandler);

router.get('/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ total: orders.length, orders });
});

router.get('/orders/:orderCode', async (req, res) => {
  try {
    const order = await Order.findOne({ orderCode: req.params.orderCode });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi tra cứu đơn hàng' });
  }
});

module.exports = router;

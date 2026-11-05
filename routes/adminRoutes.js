const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middlewares/auth');

const router = express.Router();

// Toàn bộ /admin đều yêu cầu quyền admin
router.use(verifyAdmin);

router.get('/', adminController.dashboard);

// Quản lý User
router.post('/users/:id/role', adminController.toggleRole);
router.post('/users/:id/toggle-active', adminController.toggleActive);
router.post('/users/:id/delete', adminController.deleteUser);

// Quản lý Quán ăn (CRUD)
router.post('/restaurants', adminController.createRestaurant);
router.post('/restaurants/:id/update', adminController.updateRestaurant);
router.post('/restaurants/:id/delete', adminController.deleteRestaurant);

module.exports = router;

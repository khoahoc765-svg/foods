const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const { verifyUser } = require('../middlewares/auth');

const router = express.Router();

// Lưu ý: các route cố định (/random, /meta) phải đặt TRƯỚC /:id
router.get('/', restaurantController.list);
router.get('/random', restaurantController.random);
router.get('/meta', restaurantController.meta);
router.get('/:id', restaurantController.detail);
router.post('/:id/favorite', verifyUser, restaurantController.toggleFavorite);

module.exports = router;

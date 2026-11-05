const path = require('path');
const express = require('express');
const homeController = require('../controllers/homeController');
const { verifyUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/', (req, res, next) => {
  if (req.query.category || req.query.mealTime || req.query.q) {
    return homeController.index(req, res, next);
  }
  return res.sendFile(path.join(__dirname, '..', 'index.html'));
});

router.get('/restaurants', homeController.index);
router.get('/favorites', verifyUser, homeController.favorites);

module.exports = router;

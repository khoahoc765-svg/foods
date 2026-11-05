const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Trang đăng nhập
router.get('/login', (req, res) => {
  res.render('login', { error: null, currentUser: req.session.user || null });
});

// Xử lý đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('login', { error: 'Email hoặc mật khẩu không đúng!', currentUser: null });
    }

    if (!user.isActive) {
      return res.render('login', { error: 'Tài khoản của bạn đã bị khóa!', currentUser: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Email hoặc mật khẩu không đúng!', currentUser: null });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Đã xảy ra lỗi khi đăng nhập.', currentUser: null });
  }
});

// Trang đăng ký
router.get('/register', (req, res) => {
  res.render('register', { error: null, currentUser: req.session.user || null });
});

// Xử lý đăng ký
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('register', { error: 'Email này đã được sử dụng!', currentUser: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    req.session.user = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Đã xảy ra lỗi khi đăng ký.', currentUser: null });
  }
});

// Đăng xuất
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// API lấy thông tin phiên đăng nhập hiện tại (cho frontend tĩnh gọi hiển thị nút trên Header)
router.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

module.exports = router;

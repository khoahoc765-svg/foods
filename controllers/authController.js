const User = require('../models/User');

function renderLogin(req, res) {
  if (req.user) return res.redirect('/');
  return res.render('auth/login', { title: 'Đăng nhập', form: { email: '' }, error: null });
}

function renderRegister(req, res) {
  if (req.user) return res.redirect('/');
  return res.render('auth/register', {
    title: 'Đăng ký',
    form: { username: '', email: '' },
    error: null
  });
}

async function login(req, res, next) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const fail = (message) =>
    res.status(400).render('auth/login', { title: 'Đăng nhập', form: { email }, error: message });

  if (!email || !password) return fail('Vui lòng nhập email và mật khẩu.');

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return fail('Email hoặc mật khẩu không đúng.');
    }
    if (!user.isActive) {
      return fail('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    const returnTo = req.session.returnTo;
    // Tạo session mới để chống tấn công session fixation
    return req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = String(user._id);
      req.flash('success', `Chào mừng ${user.username} quay lại! 👋`);
      const fallback = user.role === 'admin' ? '/admin' : '/';
      const target = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : fallback;
      return req.session.save(() => res.redirect(target));
    });
  } catch (err) {
    return next(err);
  }
}

async function register(req, res, next) {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  const fail = (message) =>
    res.status(400).render('auth/register', {
      title: 'Đăng ký',
      form: { username, email },
      error: message
    });

  if (!username || !email || !password) return fail('Vui lòng điền đầy đủ thông tin.');
  if (password.length < 6) return fail('Mật khẩu phải có ít nhất 6 ký tự.');
  if (password !== confirmPassword) return fail('Mật khẩu nhập lại không khớp.');

  try {
    const existed = await User.exists({ email });
    if (existed) return fail('Email này đã được sử dụng.');

    // role luôn là 'user' khi tự đăng ký, không lấy từ form
    const user = await User.create({ username, email, password, role: 'user' });

    return req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = String(user._id);
      req.flash('success', 'Đăng ký thành công! Cùng chọn món nào 🎉');
      return req.session.save(() => res.redirect('/'));
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(Object.values(err.errors)[0].message);
    }
    return next(err);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('hnag.sid');
    return res.redirect('/');
  });
}

module.exports = { renderLogin, renderRegister, login, register, logout };

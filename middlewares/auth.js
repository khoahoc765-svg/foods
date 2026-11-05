const User = require('../models/User');

/**
 * Nạp user hiện tại từ DB ở MỌI request (không tin dữ liệu cũ trong session).
 * Nhờ vậy khi Admin khóa tài khoản hoặc đổi quyền, thay đổi có hiệu lực ngay lập tức.
 */
async function attachUser(req, res, next) {
  res.locals.currentUser = null;
  req.user = null;

  if (!req.session || !req.session.userId) return next();

  try {
    const user = await User.findById(req.session.userId).select('-password').lean();
    if (!user || !user.isActive) {
      delete req.session.userId;
      return next();
    }
    req.user = user;
    res.locals.currentUser = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

function wantsJson(req) {
  return req.originalUrl.startsWith('/api/') || req.xhr || (req.get('accept') || '').includes('application/json');
}

/** Bắt buộc đăng nhập */
function verifyUser(req, res, next) {
  if (req.user) return next();

  if (wantsJson(req)) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để dùng chức năng này.' });
  }
  req.session.returnTo = req.originalUrl;
  req.flash('info', 'Vui lòng đăng nhập để tiếp tục.');
  return res.redirect('/auth/login');
}

/** Chỉ cho phép role === 'admin', ngược lại trả về trang lỗi 403 */
function verifyAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();

  if (wantsJson(req)) {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập.' });
  }
  return res.status(403).render('error', {
    title: 'Không có quyền truy cập',
    status: 403,
    message: req.user
      ? 'Tài khoản của bạn không có quyền vào trang Quản trị viên.'
      : 'Bạn cần đăng nhập bằng tài khoản Admin để vào trang này.'
  });
}

module.exports = { attachUser, verifyUser, verifyAdmin };

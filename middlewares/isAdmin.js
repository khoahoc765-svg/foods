// middlewares/isAdmin.js
module.exports = (req, res, next) => {
  // Lưu thông tin user sau khi đăng nhập vào req.user (JWT) hoặc req.session.user
  const currentUser = req.user || (req.session && req.session.user);

  if (currentUser && currentUser.role === 'admin') {
    return next();
  }

  // Nếu chưa đăng nhập, gợi ý đăng nhập trên trang lỗi 403
  return res.status(403).render('error', {
    message: 'Bạn không có quyền truy cập trang Quản trị viên!',
    currentUser: currentUser || null
  });
};

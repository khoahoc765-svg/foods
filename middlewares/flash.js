/**
 * Flash message tối giản dựa trên session (không cần thư viện connect-flash).
 * Dùng: req.flash('success' | 'error' | 'info', 'Nội dung');
 * Trong view: biến `flash` = { type, message } hoặc null.
 */
module.exports = function flash(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  req.flash = (type, message) => {
    req.session.flash = { type, message };
  };

  next();
};

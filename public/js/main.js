/* JS dùng chung cho các trang EJS: đồng bộ với thiết kế gốc TonyLikeDev/hom_nay_an_gi */
(function () {
  // Menu mobile chuẩn .site-header.is-open
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Đóng' : 'Menu';
    });
  }

  // Đóng flash message
  document.querySelectorAll('[data-flash]').forEach(function (box) {
    const close = function () { box.remove(); };
    const btn = box.querySelector('[data-flash-close]');
    if (btn) btn.addEventListener('click', close);
    setTimeout(close, 5000);
  });

  // Form cần xác nhận trước khi gửi (xóa user/quán)
  document.querySelectorAll('form[data-confirm]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // Cập nhật giao diện nút Lưu yêu thích
  window.HNAGRenderFavorite = function (btn, isFav) {
    btn.dataset.favorite = String(isFav);
    btn.setAttribute('aria-pressed', String(isFav));
    btn.textContent = isFav ? 'Đã lưu' : 'Lưu';
  };

  // Bật/tắt yêu thích
  document.addEventListener('click', async function (e) {
    const btn = e.target.closest('[data-favorite-id]');
    if (!btn || !btn.dataset.favoriteId) return;

    btn.disabled = true;
    try {
      const res = await fetch('/api/restaurants/' + encodeURIComponent(btn.dataset.favoriteId) + '/favorite', {
        method: 'POST',
        headers: { Accept: 'application/json' }
      });
      if (res.status === 401) {
        window.location.href = '/auth/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không cập nhật được yêu thích.');

      document.querySelectorAll('[data-favorite-id="' + btn.dataset.favoriteId + '"]').forEach(function (b) {
        window.HNAGRenderFavorite(b, data.favorite);
      });
    } catch (err) {
      window.alert(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // ================= HỘP THOẠI THỰC ĐƠN CHUẨN .slot =================
  window.HNAGOpenMenuModal = function (item) {
    if (!item) return;
    let dlg = document.getElementById('menu-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'slot menu-dialog';
      dlg.id = 'menu-dialog';
      dlg.setAttribute('aria-labelledby', 'menu-dialog-title');
      document.body.appendChild(dlg);
    }
    if (item.cuisine) dlg.dataset.cuisine = item.cuisine;
    else delete dlg.dataset.cuisine;

    const menu = Array.isArray(item.menu) ? item.menu : [];
    const qty = menu.length ? { 0: 1 } : {};
    const vnd = function (n) { return Number(n || 0).toLocaleString('vi-VN') + 'đ'; };

    function renderBody() {
      let totalCount = 0;
      let totalAmount = 0;
      menu.forEach(function (f, i) {
        const q = qty[i] || 0;
        totalCount += q;
        totalAmount += q * Number(f.price || 0);
      });

      dlg.innerHTML =
        '<div class="slot__body">' +
          '<button class="btn slot__close" type="button" data-close-menu>Đóng</button>' +
          '<h2 id="menu-dialog-title">' + (item.name || '') + '</h2>' +
          '<p class="slot__status">' +
            (item.address || '') + ' · ' +
            (item.deliveryTime || '15 phút') + ' (' + (item.distance || '1.2 km') + ') · ★ ' +
            Number(item.rating || 4.8).toFixed(1) + ' (' + (item.reviewCount || '999+') + ')' +
          '</p>' +
          '<div class="rest-card__tags">' +
            (item.isPreferred !== false ? '<span class="rest-tag rest-tag--promo">Yêu thích+</span>' : '') +
            (item.promoTag ? '<span class="rest-tag rest-tag--promo">' + item.promoTag + '</span>' : '') +
            (item.priceRange ? '<span class="rest-tag">' + item.priceRange + '</span>' : '') +
            (item.openingHours ? '<span class="rest-tag">Mở cửa: ' + item.openingHours + '</span>' : '') +
          '</div>' +
          '<div class="menu-dialog__list">' +
            (menu.length
              ? menu.map(function (f, i) {
                  return (
                    '<div class="menu-item">' +
                      '<img src="' + (f.image || item.image || '') + '" alt="" width="76" height="76">' +
                      '<div>' +
                        (f.isBestSeller ? '<span class="menu-item__badge">Bán chạy</span>' : '') +
                        '<div class="menu-item__name">' + f.name + '</div>' +
                        (f.description ? '<p class="menu-item__desc">' + f.description + '</p>' : '') +
                        '<div class="menu-item__price">' + vnd(f.price) + '</div>' +
                      '</div>' +
                      '<div class="menu-item__qty">' +
                        (qty[i] ? '<button class="btn" type="button" data-idx="' + i + '" data-delta="-1">−</button><strong>' + qty[i] + '</strong>' : '') +
                        '<button class="btn btn--primary" type="button" data-idx="' + i + '" data-delta="1">+</button>' +
                      '</div>' +
                    '</div>'
                  );
                }).join('')
              : '<p class="slot__status">Quán đang cập nhật thực đơn chi tiết.</p>') +
          '</div>' +
          '<div class="menu-dialog__footer">' +
            '<div>' +
              '<span style="color:var(--muted);font-size:.875rem;">Tạm tính (' + totalCount + ' món):</span>' +
              '<strong style="font:800 1.25rem/1 var(--font-display);color:var(--accent);margin-left:.375rem;">' + vnd(totalAmount) + '</strong>' +
            '</div>' +
            '<div style="display:flex;gap:.5rem;">' +
              '<a class="btn" href="' + (item.mapUrl || '#') + '" target="_blank" rel="noopener noreferrer">Chỉ đường</a>' +
              '<button class="btn btn--primary" type="button" data-order-confirm>Đặt món</button>' +
            '</div>' +
          '</div>' +
        '</div>';

      dlg.querySelector('[data-close-menu]').addEventListener('click', function () { dlg.close(); });
      dlg.querySelectorAll('[data-delta]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const i = Number(btn.getAttribute('data-idx'));
          const d = Number(btn.getAttribute('data-delta'));
          qty[i] = Math.max(0, (qty[i] || 0) + d);
          renderBody();
        });
      });
      const orderBtn = dlg.querySelector('[data-order-confirm]');
      if (orderBtn) {
        orderBtn.addEventListener('click', function () {
          const chosen = menu.map(function (f, i) { return qty[i] ? qty[i] + 'x ' + f.name : null; }).filter(Boolean);
          if (!chosen.length) {
            window.alert('Bạn hãy bấm (+) để chọn ít nhất 1 món nhé.');
            return;
          }
          window.alert(
            'Đã ghi nhận đơn tại ' + item.name + ':\n• ' +
            chosen.join('\n• ') +
            '\nTổng tạm tính: ' + vnd(totalAmount) +
            '\nDự kiến giao: ' + (item.deliveryTime || '15 phút')
          );
          dlg.close();
        });
      }
    }

    dlg.onclick = function (e) { if (e.target === dlg) dlg.close(); };
    renderBody();
    if (!dlg.open) dlg.showModal();
  };

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-open-menu-btn]');
    if (!btn) return;
    const card = btn.closest('[data-restaurant-json]');
    if (card) {
      try {
        window.HNAGOpenMenuModal(JSON.parse(card.getAttribute('data-restaurant-json')));
      } catch (err) {
        console.error(err);
      }
    }
  });
})();

/* Dùng chung cho mọi trang: header và các hàm chọn món. */
const App = (() => {
  const LAST_KEY = 'hnag:last-dish';
  const CART_KEY = 'hnag:cart';
  const NAV = [
    { href: 'cuisines.html', label: 'Ẩm thực' },
    { href: 'dishes.html', label: 'Tất cả món ăn' },
    { href: '/restaurants', label: 'Quán Đà Nẵng' },
    { href: '/recipes.html', label: 'Công thức' },
    { href: '/cart.html', label: 'Giỏ hàng', cart: true },
    { href: 'about.html', label: 'Giới thiệu' },
  ];

  /** Bữa ăn theo giờ: 05:00 sáng, 10:30 trưa, 16:00 tối, 22:00 khuya. */
  function getMeal(date = new Date()) {
    const h = date.getHours() + date.getMinutes() / 60;
    if (h >= 5 && h < 10.5) return 'sang';
    if (h >= 10.5 && h < 16) return 'trua';
    if (h >= 16 && h < 22) return 'toi';
    return 'khuya';
  }

  const randomItem = (list) => list[Math.floor(Math.random() * list.length)];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const safeUrl = (value) => {
    try {
      const url = new URL(value || '#', location.origin);
      return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : '#';
    } catch {
      return '#';
    }
  };

  // Trình duyệt chặn lưu trữ thì chỉ mất tính năng "không lặp món", trang vẫn chạy.
  const getLast = () => { try { return sessionStorage.getItem(LAST_KEY); } catch { return null; } };
  const setLast = (id) => { try { sessionStorage.setItem(LAST_KEY, id); } catch { /* bỏ qua */ } };

  function getCart() {
    let raw;
    try {
      raw = localStorage.getItem(CART_KEY);
    } catch {
      throw new Error('Trình duyệt không cho phép truy cập bộ nhớ giỏ hàng.');
    }
    if (!raw) return [];
    try {
      const cart = JSON.parse(raw);
      if (!Array.isArray(cart)) throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
      return cart.filter((item) =>
        item && typeof item.key === 'string' &&
        typeof item.name === 'string' &&
        Number.isFinite(Number(item.price)) &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0
      );
    } catch {
      throw new Error('Không đọc được giỏ hàng đã lưu. Hãy xóa dữ liệu trang web rồi thử lại.');
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      throw new Error('Không thể lưu giỏ hàng. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.');
    }
    document.dispatchEvent(new CustomEvent('hnag:cart-change', { detail: { cart } }));
    updateCartCount(cart);
  }

  function updateCartCount(cart) {
    const count = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count === 0;
    });
  }

  function addToCart(restaurant, menuItems) {
    const cart = getCart();
    menuItems.forEach(({ item, quantity }) => {
      const name = String(item.name || '').trim();
      const price = Number(item.price);
      if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error('Thông tin món trong giỏ hàng không hợp lệ.');
      }

      const key = `${restaurant._id || restaurant.name}:${item._id || item.id || name}`;
      const existing = cart.find((line) => line.key === key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          key,
          name,
          price,
          quantity,
          image: item.image || restaurant.image || '',
          restaurantName: String(restaurant.name || 'Quán ăn'),
          restaurantAddress: String(restaurant.address || ''),
          mapUrl: String(restaurant.mapUrl || '')
        });
      }
    });
    saveCart(cart);
    return cart;
  }

  function updateCartItem(key, quantity) {
    const cart = getCart();
    const updated = cart
      .map((item) => item.key === key ? { ...item, quantity } : item)
      .filter((item) => item.quantity > 0);
    saveCart(updated);
    return updated;
  }

  function removeFromCart(key) {
    const cart = getCart().filter((item) => item.key !== key);
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    saveCart([]);
    return [];
  }

  /** Ưu tiên món hợp bữa hiện tại, không lặp lại món vừa ra. */
  function pickDish(pool) {
    const last = getLast();
    const meal = getMeal();
    const fit = pool.filter((d) => d.meals.includes(meal));
    const tiers = [fit.filter((d) => d.id !== last), pool.filter((d) => d.id !== last), pool];
    return randomItem(tiers.find((t) => t.length));
  }

  const photo = (dish, w, h) =>
    `https://images.unsplash.com/${dish.photo}?auto=format&fit=crop&w=${w}&h=${h}&q=70${dish.crop || ''}`;
  const dishUrl = (dish) => `result.html?dish=${dish.id}`;
  const mapsUrl = (dish) =>
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${dish.name} gần đây`);

  function renderChrome() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const header = document.querySelector('[data-header]');
    if (!header) return;
    header.innerHTML = `
      <a class="logo" href="/index.html">Hôm nay ăn gì?</a>
      <button class="btn nav-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav class="nav" id="nav" aria-label="Menu chính">
        <ul>${NAV.map((n) => {
          const current = n.href === page || location.pathname === n.href;
          const label = n.cart
            ? `${n.label} <span class="cart-count" data-cart-count hidden>0</span>`
            : n.label;
          return `<li><a href="${n.href}"${current ? ' aria-current="page"' : ''}>${label}</a></li>`;
        }).join('')}</ul>
      </nav>`;
    const toggle = header.querySelector('.nav-toggle');
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? 'Đóng' : 'Menu';
    });
    try {
      updateCartCount(getCart());
    } catch (error) {
      console.error(error);
    }
    window.addEventListener('storage', (event) => {
      if (event.key !== CART_KEY) return;
      try {
        updateCartCount(getCart());
      } catch (error) {
        console.error(error);
      }
    });
  }

  /** Mở hộp thoại thực đơn chuẩn thiết kế .slot */
  function openMenuDialog(item) {
    if (!item) return;
    let dlg = document.getElementById('menu-dialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'slot menu-dialog';
      dlg.id = 'menu-dialog';
      dlg.setAttribute('aria-labelledby', 'menu-dialog-title');
      document.body.appendChild(dlg);
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    }
    if (item.cuisine) dlg.dataset.cuisine = item.cuisine;
    else delete dlg.dataset.cuisine;

    const menu = Array.isArray(item.menu) ? item.menu : [];
    const qty = menu.length ? { 0: 1 } : {};
    const vnd = (n) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

    function renderBody() {
      let totalCount = 0;
      let totalAmount = 0;
      menu.forEach((f, i) => {
        const q = qty[i] || 0;
        totalCount += q;
        totalAmount += q * Number(f.price || 0);
      });

      dlg.innerHTML = `
        <div class="slot__body">
          <button class="btn slot__close" type="button" data-close-menu>Đóng</button>
          <h2 id="menu-dialog-title">${escapeHtml(item.name)}</h2>
          <p class="slot__status">${escapeHtml(item.address)} · ${escapeHtml(item.deliveryTime || '15 phút')} (${escapeHtml(item.distance || '1.2 km')}) · ★ ${Number(item.rating || 4.8).toFixed(1)} (${escapeHtml(item.reviewCount || '999+')})</p>
          <div class="rest-card__tags">
            ${item.isPreferred !== false ? '<span class="rest-tag rest-tag--promo">Yêu thích+</span>' : ''}
            ${item.promoTag ? `<span class="rest-tag rest-tag--promo">${escapeHtml(item.promoTag)}</span>` : ''}
            ${item.priceRange ? `<span class="rest-tag">${escapeHtml(item.priceRange)}</span>` : ''}
            ${item.openingHours ? `<span class="rest-tag">Mở cửa: ${escapeHtml(item.openingHours)}</span>` : ''}
          </div>
          <div class="menu-dialog__list">
            ${menu.length ? menu.map((f, i) => `
              <div class="menu-item">
                <img src="${safeUrl(f.image || item.image)}" alt="${escapeHtml(f.name)}" width="76" height="76">
                <div>
                  ${f.isBestSeller ? '<span class="menu-item__badge">Bán chạy</span>' : ''}
                  <div class="menu-item__name">${escapeHtml(f.name)}</div>
                  ${f.description ? `<p class="menu-item__desc">${escapeHtml(f.description)}</p>` : ''}
                  <div class="menu-item__price">${vnd(f.price)}</div>
                </div>
                <div class="menu-item__qty">
                  ${qty[i] ? `<button class="btn" type="button" data-idx="${i}" data-delta="-1">−</button><strong>${qty[i]}</strong>` : ''}
                  <button class="btn btn--primary" type="button" data-idx="${i}" data-delta="1">+</button>
                </div>
              </div>
            `).join('') : '<p class="slot__status">Quán đang cập nhật thực đơn chi tiết.</p>'}
          </div>
          <div class="menu-dialog__footer">
            <div>
              <span style="color:var(--muted);font-size:.875rem;">Tạm tính (${totalCount} món):</span>
              <strong style="font:800 1.25rem/1 var(--font-display);color:var(--accent);margin-left:.375rem;">${vnd(totalAmount)}</strong>
            </div>
            <div style="display:flex;gap:.5rem;">
              <a class="btn" href="${safeUrl(item.mapUrl)}" target="_blank" rel="noopener noreferrer">Chỉ đường</a>
              <button class="btn btn--primary" type="button" data-add-to-cart ${menu.length ? '' : 'disabled'}>Thêm vào giỏ</button>
            </div>
          </div>
          <p class="cart-feedback" data-cart-feedback role="status" aria-live="polite"></p>
        </div>`;

      dlg.querySelector('[data-close-menu]').addEventListener('click', () => dlg.close());
      dlg.querySelectorAll('[data-delta]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = Number(btn.dataset.idx);
          const d = Number(btn.dataset.delta);
          qty[i] = Math.max(0, (qty[i] || 0) + d);
          renderBody();
        });
      });
      const addButton = dlg.querySelector('[data-add-to-cart]');
      if (addButton) {
        addButton.addEventListener('click', () => {
          const selected = menu
            .map((food, i) => ({ item: food, quantity: qty[i] || 0 }))
            .filter((entry) => entry.quantity > 0);
          if (!selected.length) return;
          const feedback = dlg.querySelector('[data-cart-feedback]');
          try {
            addToCart(item, selected);
            feedback.innerHTML = `Đã thêm ${selected.reduce((sum, entry) => sum + entry.quantity, 0)} món vào giỏ. <a href="/cart.html">Xem giỏ hàng</a>`;
          } catch (error) {
            feedback.textContent = error.message;
          }
        });
      }
    }

    renderBody();
    if (!dlg.open) dlg.showModal();
  }

  renderChrome();

  return {
    getMeal, randomItem, wait, reduceMotion, getLast, setLast, pickDish, photo, dishUrl, mapsUrl,
    getCart, addToCart, updateCartItem, removeFromCart, clearCart, openMenuDialog
  };
})();

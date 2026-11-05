(function () {
  const content = document.getElementById('cart-content');
  const message = document.getElementById('cart-message');
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
  const money = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`;

  function render() {
    let cart;
    try {
      cart = App.getCart();
    } catch (error) {
      message.textContent = error.message;
      content.replaceChildren();
      return;
    }
    message.textContent = '';
    App.updateCartCount(cart);

    if (!cart.length) {
      content.innerHTML = `
        <section class="cart-empty">
          <span aria-hidden="true">🛒</span>
          <h2>Giỏ hàng đang trống</h2>
          <p>Mở thực đơn ở một quán và thêm món bạn muốn đặt vào đây.</p>
          <a class="btn btn--primary" href="/restaurants">Khám phá quán ăn Đà Nẵng</a>
        </section>`;
      return;
    }

    const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    content.innerHTML = `
      <section class="cart-list" aria-label="Món trong giỏ">
        ${cart.map((item) => `
          <article class="cart-item">
            <img class="cart-item__image" src="${safeUrl(item.image)}" alt="">
            <div class="cart-item__details">
              <p class="cart-item__restaurant">${escapeHtml(item.restaurantName)}</p>
              <h2>${escapeHtml(item.name)}</h2>
              <p class="cart-item__address">${escapeHtml(item.restaurantAddress)}</p>
              <p class="cart-item__price">${money(item.price)} / phần</p>
              <div class="cart-item__actions">
                <div class="cart-quantity" aria-label="Số lượng">
                  <button type="button" data-cart-delta="-1" data-cart-key="${escapeHtml(item.key)}" aria-label="Giảm số lượng">−</button>
                  <span>${Number(item.quantity)}</span>
                  <button type="button" data-cart-delta="1" data-cart-key="${escapeHtml(item.key)}" aria-label="Tăng số lượng">+</button>
                </div>
                ${item.mapUrl ? `<a class="cart-map" href="${safeUrl(item.mapUrl)}" target="_blank" rel="noopener noreferrer">Chỉ đường</a>` : ''}
                <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(item.key)}">Bỏ món</button>
              </div>
            </div>
            <strong class="cart-item__subtotal">${money(Number(item.price) * Number(item.quantity))}</strong>
          </article>
        `).join('')}
      </section>
      <section class="cart-summary">
        <div>
          <p class="cart-summary__label">Tổng tạm tính</p>
          <p class="cart-summary__note">Chưa gồm phí giao hàng. Đơn chưa được gửi tới quán.</p>
        </div>
        <strong>${money(total)}</strong>
        <button class="btn" type="button" data-cart-clear>Xóa giỏ</button>
      </section>`;

    content.querySelectorAll('[data-cart-delta]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-cart-key');
        const item = cart.find((entry) => entry.key === key);
        if (!item) return;
        try {
          App.updateCartItem(key, Math.max(0, Number(item.quantity) + Number(button.dataset.cartDelta)));
          render();
        } catch (error) {
          message.textContent = error.message;
        }
      });
    });

    content.querySelectorAll('[data-cart-remove]').forEach((button) => {
      button.addEventListener('click', () => {
        try {
          App.removeFromCart(button.getAttribute('data-cart-remove'));
          render();
        } catch (error) {
          message.textContent = error.message;
        }
      });
    });

    const clearButton = content.querySelector('[data-cart-clear]');
    clearButton.addEventListener('click', () => {
      if (!window.confirm('Xóa tất cả món trong giỏ hàng?')) return;
      try {
        App.clearCart();
        render();
      } catch (error) {
        message.textContent = error.message;
      }
    });
  }

  document.addEventListener('hnag:cart-change', render);
  window.addEventListener('storage', (event) => {
    if (event.key === 'hnag:cart') render();
  });
  render();
})();

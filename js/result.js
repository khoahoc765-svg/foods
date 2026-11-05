/* Trang Kết quả: ?mode=any, ?cuisine=viet (có quay) và ?dish=pho-bo (hiện thẳng).
   Tích hợp Quán ăn đối tác, Đặt Shipper trực tiếp và Công thức nấu ăn. */
(() => {
  const SCHEDULE = [...Array(12).fill(60), 120, 120, 120, 200, 320];

  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const qDish = params.get('dish');
  const qCuisine = params.get('cuisine');
  const card = $('result');
  const meal = App.getMeal();

  let pool = FOOD.DISHES;
  let spinId = 0;
  let currentDish = null;
  let currentDishDetails = null;

  const formatVND = (num) => Number(num || 0).toLocaleString('vi-VN') + 'đ';

  function switchHubTab(tabName) {
    const isRest = tabName === 'restaurants';
    $('tab-btn-restaurants').classList.toggle('is-active', isRest);
    $('tab-btn-recipe').classList.toggle('is-active', !isRest);
    $('panel-restaurants').hidden = !isRest;
    $('panel-recipe').hidden = isRest;
  }

  function renderRestaurants(dish, data) {
    const listEl = $('restaurant-list');
    const restaurants = data.restaurants || [];
    const defaultPrice = data.defaultPrice || 60000;

    $('tab-count-rest').textContent = restaurants.length;
    $('badge-restaurant-count').textContent = `🏪 ${restaurants.length} quán đang bán`;
    $('hub-rest-title').textContent = `Các quán đang có món "${dish.name}"`;

    if (restaurants.length === 0) {
      listEl.innerHTML = `
        <div class="rest-empty">
          <p>Hiện chưa có quán đối tác nào đăng ký món <strong>${dish.name}</strong> trên hệ thống.</p>
          <a class="btn btn--primary" href="${App.mapsUrl(dish)}" target="_blank" rel="noopener">📍 Tìm quán ${dish.name} trên Google Maps</a>
        </div>`;
      return;
    }

    listEl.innerHTML = restaurants
      .map((r) => {
        const shippers =
          Array.isArray(r.shippers) && r.shippers.length
            ? r.shippers
            : ['GrabFood', 'ShopeeFood'];

        const partnerBadge = r.isPartner
          ? `<span class="rest-badge rest-badge--partner">🤝 Quán Hợp Tác Chính Thức</span>`
          : `<span class="rest-badge rest-badge--normal">📍 Quán Gợi Ý</span>`;

        const shipperPills = shippers
          .map((s) => `<span class="shipper-pill">🛵 ${s}</span>`)
          .join('');

        return `
        <div class="rest-card ${r.isPartner ? 'rest-card--partner' : ''}">
          <div class="rest-card__main">
            <div class="rest-card__top">
              ${partnerBadge}
              <span class="rest-card__rating">⭐ ${r.rating || '4.8'}</span>
              <span class="rest-card__time">🕒 ${r.openTime || '07:00 - 22:00'}</span>
            </div>
            <h3 class="rest-card__name">${r.name}</h3>
            <p class="rest-card__addr">📍 ${r.address}</p>
            <div class="rest-card__meta">
              <span>💰 Mức giá: <strong>${r.priceRange || formatVND(defaultPrice)}</strong></span>
              <span>📞 Hotline: <strong>${r.phone || '0905 123 456'}</strong></span>
              <a href="/api/restaurants/${r._id}" target="_blank" style="font-size:0.8rem;color:var(--accent);font-weight:700;text-decoration:underline;">🔗 Xem API & Menu của quán ↗</a>
            </div>
            <div class="rest-card__shippers">
              <span class="rest-card__shipper-label">Liên kết Shipper:</span>
              ${shipperPills}
            </div>
          </div>
          <div class="rest-card__cta">
            <div class="rest-card__price-box">
              <span class="rest-card__price-label">Giá đặt ngay</span>
              <strong class="rest-card__price-val">${formatVND(defaultPrice)}</strong>
            </div>
            ${
              r.isPartner
                ? `<button type="button" class="btn btn--primary btn-order-now"
                    data-rest-id="${r._id}"
                    data-rest-name="${r.name}"
                    data-rest-addr="${r.address}"
                    data-shippers="${shippers.join(',')}"
                    data-price="${defaultPrice}">
                    🛵 Đặt món & Gọi Shipper
                  </button>`
                : `<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    r.name + ' ' + r.address
                  )}" target="_blank" rel="noopener">
                    📍 Xem đường đi
                  </a>`
            }
          </div>
        </div>`;
      })
      .join('');

    listEl.querySelectorAll('.btn-order-now').forEach((btn) => {
      btn.addEventListener('click', () => {
        openOrderModal({
          dish,
          restId: btn.dataset.restId,
          restName: btn.dataset.restName,
          restAddr: btn.dataset.restAddr,
          shippers: (btn.dataset.shippers || 'GrabFood,ShopeeFood').split(','),
          price: Number(btn.dataset.price) || defaultPrice
        });
      });
    });
  }

  function renderRecipe(dish, recipe) {
    const container = $('recipe-container');
    if (!recipe) {
      container.innerHTML = `<p>Đang cập nhật công thức cho món ${dish.name}.</p>`;
      return;
    }

    $('badge-recipe-time').textContent = `📖 Tự nấu: ${recipe.prepTime || '25 phút'}`;

    const ingredientsHtml = (recipe.ingredients || [])
      .map((ing) => `<li><span class="ing-dot">✓</span> ${ing}</li>`)
      .join('');

    const stepsHtml = (recipe.steps || [])
      .map(
        (step, idx) => `
        <li class="recipe-step">
          <span class="recipe-step__num">${idx + 1}</span>
          <div class="recipe-step__text">${step.replace(/^Bước\s*\d+\s*:\s*/i, '')}</div>
        </li>`
      )
      .join('');

    container.innerHTML = `
      <div class="recipe-header">
        <div>
          <span class="recipe-tag">👩‍🍳 Công thức chuẩn tại nhà</span>
          <h2>Cách nấu món ${dish.name}</h2>
          <p class="recipe-desc">${dish.desc}</p>
        </div>
        <div class="recipe-stats">
          <div class="recipe-stat">
            <span>⏱ Thời gian</span>
            <strong>${recipe.prepTime || '30 phút'}</strong>
          </div>
          <div class="recipe-stat">
            <span>🔥 Độ khó</span>
            <strong>${recipe.difficulty || 'Dễ'}</strong>
          </div>
          <div class="recipe-stat">
            <span>⚡ Năng lượng</span>
            <strong>${recipe.calories || '450 kcal'}</strong>
          </div>
        </div>
      </div>

      <div class="recipe-body">
        <div class="recipe-col recipe-col--ing">
          <h3>🛒 Nguyên liệu cần chuẩn bị</h3>
          <ul class="recipe-ing-list">${ingredientsHtml}</ul>
          ${
            recipe.tips
              ? `<div class="recipe-tip">
                  <strong>💡 Bí quyết đầu bếp:</strong>
                  <p>${recipe.tips}</p>
                </div>`
              : ''
          }
        </div>
        <div class="recipe-col recipe-col--steps">
          <h3>🍳 Các bước thực hiện chi tiết</h3>
          <ol class="recipe-steps-list">${stepsHtml}</ol>
        </div>
      </div>
    `;
  }

  async function loadDishHub(dish) {
    try {
      const res = await fetch(`/api/dish-details/${encodeURIComponent(dish.id)}`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      currentDishDetails = data;

      $('dish-quick-badges').hidden = false;
      $('hub-section').hidden = false;

      renderRestaurants(dish, data);
      renderRecipe(dish, data.recipe);
    } catch (err) {
      console.error('Lỗi tải dữ liệu quán & công thức:', err);
    }
  }

  // ================= MODAL ĐẶT MÓN & SHIPPER =================
  const dialog = $('order-dialog');
  const orderForm = $('order-form');
  const qtyInput = $('cust-qty');
  const unitPriceInput = $('form-unit-price');

  function updateOrderSummary() {
    const qty = Math.max(1, Number(qtyInput.value) || 1);
    const unitPrice = Number(unitPriceInput.value) || 60000;
    const itemTotal = qty * unitPrice;
    const shipFee = 15000;
    $('summary-qty').textContent = qty;
    $('summary-item-price').textContent = formatVND(itemTotal);
    $('summary-total').textContent = formatVND(itemTotal + shipFee);
  }

  qtyInput.addEventListener('input', updateOrderSummary);

  function openOrderModal({ dish, restId, restName, restAddr, shippers, price }) {
    $('order-success-box').hidden = true;
    orderForm.hidden = false;

    $('modal-dish-title').textContent = `Đặt món: ${dish.name}`;
    $('modal-rest-subtitle').textContent = `🏪 Quán cung cấp: ${restName} (${restAddr})`;
    $('form-dish-id').value = dish.id;
    $('form-dish-name').value = dish.name;
    $('form-rest-id').value = restId;
    unitPriceInput.value = price;
    qtyInput.value = 1;

    const shipperSelect = $('cust-shipper');
    shipperSelect.innerHTML = shippers
      .map((s) => `<option value="${s}">🛵 ${s} — Giao siêu tốc 20 phút</option>`)
      .join('');

    updateOrderSummary();
    dialog.showModal();
  }

  $('close-order-modal').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = $('submit-order-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Đang kết nối quán & gọi Shipper...';

    const payload = {
      dishId: $('form-dish-id').value,
      dishName: $('form-dish-name').value,
      restaurantId: $('form-rest-id').value,
      customerName: $('cust-name').value,
      customerPhone: $('cust-phone').value,
      customerAddress: $('cust-address').value,
      quantity: Number(qtyInput.value) || 1,
      shipperProvider: $('cust-shipper').value,
      note: $('cust-note').value
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đặt món thất bại');

      const o = data.order;
      orderForm.hidden = true;
      const successBox = $('order-success-box');
      successBox.hidden = false;
      successBox.innerHTML = `
        <div class="order-success__icon">🎉</div>
        <h3>Đặt món thành công! Shipper đang tới quán</h3>
        <p class="order-success__code">Mã đơn hàng: <strong>#${o.orderCode}</strong></p>
        <div class="order-success__details">
          <div><span>🍜 Món ăn:</span> <strong>${o.dishName} (x${o.quantity})</strong></div>
          <div><span>🏪 Quán chuẩn bị:</span> <strong>${o.restaurantName}</strong></div>
          <div><span>🛵 Đơn vị vận chuyển:</span> <strong class="text-accent">${o.shipperProvider}</strong></div>
          <div><span>👨‍✈️ Tài xế nhận đơn:</span> <strong>${o.shipperName} (${o.shipperPhone})</strong></div>
          <div><span>🏍 Biển số xe:</span> <strong>${o.shipperPlate}</strong></div>
          <div><span>📍 Giao đến:</span> <strong>${o.customerAddress}</strong></div>
          <div><span>💰 Tổng thanh toán:</span> <strong>${formatVND(o.totalAmount)}</strong></div>
        </div>
        <button type="button" class="btn btn--primary" id="btn-done-order" style="margin-top:1.25rem;width:100%;">
          Hoàn tất & Tiếp tục khám phá
        </button>
      `;
      document.getElementById('btn-done-order').addEventListener('click', () => dialog.close());
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🚀 Xác nhận đặt món & Gọi Shipper ngay';
    }
  });

  // ================= HIỂN THỊ & QUAY MÓN =================
  function show(dish) {
    currentDish = dish;
    const mealKey = dish.meals.includes(meal) ? meal : dish.meals[0];
    document.body.dataset.cuisine = dish.cuisine;
    document.title = `${dish.name} | Hôm nay ăn gì?`;
    $('dish-photo').src = App.photo(dish, 1200, 900);
    $('dish-photo').alt = dish.name;
    $('dish-meta').textContent = `${FOOD.CUISINES[dish.cuisine].name} · ${FOOD.MEALS[mealKey].label}`;
    $('dish-name').textContent = dish.name;
    $('dish-desc').textContent = dish.desc;
    $('btn-maps').href = App.mapsUrl(dish);
    $('result-live').textContent = `Hôm nay ăn: ${dish.name}`;
    App.setLast(dish.id);

    loadDishHub(dish);
  }

  function showEmpty(title, text) {
    card.hidden = true;
    $('empty-title').textContent = title;
    $('empty-text').textContent = text;
    $('empty').hidden = false;
  }

  async function spin() {
    const id = ++spinId;
    const dish = App.pickDish(pool);
    $('hub-section').hidden = true;
    $('dish-quick-badges').hidden = true;

    if (App.reduceMotion()) return show(dish);

    new Image().src = App.photo(dish, 1200, 900);
    card.classList.remove('is-bounce');
    card.classList.add('is-spinning');
    $('dish-meta').textContent = 'Đang quay chọn món...';
    $('dish-desc').textContent = 'Hệ thống đang tìm món ngon kèm quán đối tác & công thức cho bạn...';

    for (const ms of SCHEDULE) {
      $('dish-name').textContent = App.randomItem(
        pool.filter((d) => d.name !== $('dish-name').textContent)
      ).name;
      await App.wait(ms);
      if (id !== spinId) return;
    }

    card.classList.remove('is-spinning');
    show(dish);
    void card.offsetWidth;
    card.classList.add('is-bounce');
  }

  function init() {
    $('tab-btn-restaurants').addEventListener('click', () => switchHubTab('restaurants'));
    $('tab-btn-recipe').addEventListener('click', () => switchHubTab('recipe'));

    $('btn-show-recipe').addEventListener('click', () => {
      switchHubTab('recipe');
      $('hub-section').scrollIntoView({ behavior: 'smooth' });
    });

    $('btn-scroll-restaurants').addEventListener('click', (e) => {
      e.preventDefault();
      switchHubTab('restaurants');
      $('hub-section').scrollIntoView({ behavior: 'smooth' });
    });

    if (qDish) {
      const dish = FOOD.DISHES.find((d) => d.id === qDish);
      if (!dish)
        return showEmpty(
          'Món này chưa có trong thực đơn',
          'Có thể đường dẫn bị sai. Để tụi mình chọn cho bạn món khác nhé.'
        );
      show(dish);
    } else if (qCuisine) {
      if (!Object.hasOwn(FOOD.CUISINES, qCuisine))
        return showEmpty('Chưa có nền ẩm thực này', 'Trong lúc chờ, bạn thử chọn bất kỳ món nào nhé.');
      document.body.dataset.cuisine = qCuisine;
      pool = FOOD.DISHES.filter((d) => d.cuisine === qCuisine);
      spin();
    } else {
      spin();
    }
    $('btn-again').addEventListener('click', spin);
  }

  init();
})();

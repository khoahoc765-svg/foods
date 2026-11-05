/* Trang Kết quả: ?mode=any, ?cuisine=viet (có quay) và ?dish=pho-bo (hiện thẳng). */
(() => {
  // 12 x 60 + 3 x 120 + 200 + 320 = 1600ms: tên món đổi nhanh rồi chậm dần
  const SCHEDULE = [...Array(12).fill(60), 120, 120, 120, 200, 320];

  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const qDish = params.get('dish');
  const qCuisine = params.get('cuisine');
  const card = $('result');
  const meal = App.getMeal();

  let pool = FOOD.DISHES;
  let spinId = 0;
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

  function show(dish) {
    const mealKey = dish.meals.includes(meal) ? meal : dish.meals[0];
    document.body.dataset.cuisine = dish.cuisine;
    document.title = `${dish.name} | Hôm nay ăn gì?`;
    $('dish-photo').src = App.photo(dish, 1200, 900);
    $('dish-photo').alt = dish.name;
    $('dish-meta').textContent = `${FOOD.CUISINES[dish.cuisine].name} · ${FOOD.MEALS[mealKey].label}`;
    $('dish-name').textContent = dish.name;
    $('dish-desc').textContent = dish.desc;
    $('btn-maps').href = App.mapsUrl(dish);
    $('btn-recipe').href = `/recipes.html?dish=${encodeURIComponent(dish.id)}`;
    $('result-live').textContent = `Hôm nay ăn: ${dish.name}`;
    App.setLast(dish.id);
    const allRestaurantsLink = $('all-restaurants-link');
    if (allRestaurantsLink) {
      const restaurantParams = new URLSearchParams({
        dish: dish.id,
        dishName: dish.name,
        cuisine: dish.cuisine
      });
      allRestaurantsLink.href = `/restaurants?${restaurantParams.toString()}`;
    }
    loadGrabShopeeForDish(dish);
  }

  async function loadGrabShopeeForDish(dish) {
    const sec = $('grab-section');
    const grid = $('grab-cards');
    const sectionStatus = $('grab-section-status');
    if (!sec || !grid) return;
    try {
      const query = new URLSearchParams({ dish: dish.id, cuisine: dish.cuisine });
      const res = await fetch('/api/restaurants?' + query.toString(), { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách quán.');
      const shown = (data.restaurants || []).slice(0, 3);
      $('grab-section-title').textContent = `Quán ${dish.name} tại Đà Nẵng`;
      if (sectionStatus) {
        sectionStatus.textContent = data.filters && data.filters.dishFallback
          ? `Chưa có quán được gắn trực tiếp với món ${dish.name}; đây là các quán cùng nền ẩm thực.`
          : shown.length
            ? `Các quán này được lấy từ trang Quán Đà Nẵng${data.total > shown.length ? ` · ${data.total} quán phù hợp` : ''}.`
            : `Hiện chưa có quán nào phù hợp với món ${dish.name}.`;
      }
      grid.innerHTML = shown.map((item, idx) => {
        const menuList = Array.isArray(item.menu) ? item.menu : [];
        const preview = menuList.slice(0, 2).map((f) => `
          <div class="rest-menu-preview__row">
            <span class="rest-menu-preview__name">${escapeHtml(f.name)}</span>
            <span class="rest-menu-preview__price">${Number(f.price || 0).toLocaleString('vi-VN')}đ</span>
          </div>
        `).join('');

        return `
          <article class="rest-card" data-cuisine="${escapeHtml(item.cuisine || dish.cuisine)}">
            <div class="rest-card__photo">
              <img src="${safeUrl(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy">
              ${item.isPreferred !== false ? '<span class="rest-badge">Yêu thích+</span>' : ''}
              <span class="rest-meta-pill">${escapeHtml(item.deliveryTime || '15 phút')} · ${escapeHtml(item.distance || '1.2 km')}</span>
            </div>
            <div class="rest-card__body">
              <div class="rest-card__top">
                <span class="rest-card__cat">${escapeHtml(item.category || 'Quán ăn')}</span>
                <span class="rest-card__rating">★ ${Number(item.rating || 4.8).toFixed(1)} <span>(${escapeHtml(item.reviewCount || '999+')})</span></span>
              </div>
              <h3 class="rest-card__name">${escapeHtml(item.name)}</h3>
              <p class="rest-card__addr">${escapeHtml(item.address)}</p>
              <div class="rest-card__tags">
                ${item.promoTag ? `<span class="rest-tag rest-tag--promo">${escapeHtml(item.promoTag)}</span>` : ''}
                ${item.priceRange ? `<span class="rest-tag">${escapeHtml(item.priceRange)}</span>` : ''}
              </div>
              ${preview ? `<div class="rest-menu-preview"><span class="rest-menu-preview__title">Thực đơn nổi bật</span>${preview}</div>` : ''}
              <div class="rest-card__actions">
                <a class="btn" href="${safeUrl(item.mapUrl)}" target="_blank" rel="noopener noreferrer">Bản đồ</a>
                <button class="btn btn--primary" type="button" data-open-idx="${idx}">Thực đơn (${menuList.length})</button>
              </div>
            </div>
          </article>`;
      }).join('');

      grid.querySelectorAll('[data-open-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = shown[Number(btn.dataset.openIdx)];
          if (item && App.openMenuDialog) App.openMenuDialog(item);
        });
      });

      sec.hidden = false;
    } catch (err) {
      sec.hidden = false;
      if (sectionStatus) sectionStatus.textContent = err.message;
      grid.replaceChildren();
    }
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
    if (App.reduceMotion()) return show(dish);

    new Image().src = App.photo(dish, 1200, 900);   // tải sẵn để ảnh hiện ngay khi dừng
    card.classList.remove('is-bounce');
    card.classList.add('is-spinning');
    $('dish-meta').textContent = 'Đang quay...';
    $('dish-desc').textContent = 'Chờ một chút nhé.';

    for (const ms of SCHEDULE) {
      $('dish-name').textContent = App.randomItem(pool.filter((d) => d.name !== $('dish-name').textContent)).name;
      await App.wait(ms);
      if (id !== spinId) return;
    }

    card.classList.remove('is-spinning');
    show(dish);
    void card.offsetWidth;
    card.classList.add('is-bounce');
  }

  function init() {
    if (qDish) {
      const dish = FOOD.DISHES.find((d) => d.id === qDish);
      if (!dish) return showEmpty('Món này chưa có trong thực đơn', 'Có thể đường dẫn bị sai. Để tụi mình chọn cho bạn món khác nhé.');
      show(dish);
    } else if (qCuisine) {
      if (!Object.hasOwn(FOOD.CUISINES, qCuisine)) return showEmpty('Chưa có nền ẩm thực này', 'Trong lúc chờ, bạn thử chọn bất kỳ món nào nhé.');
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

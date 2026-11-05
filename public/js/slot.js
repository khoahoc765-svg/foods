/* Máy quay xèng chọn quán Đà Nẵng: đồng bộ 100% cơ chế 2 cuộn quay của cuisines.js */
(function () {
  const SPIN_MS = 1500;
  const BLINK_MS = 450;
  const REPEATS = 5;
  const TARGET_ROUND = 3;

  const slot = document.getElementById('slot');
  const reelCategory = document.getElementById('reel-category');
  const reelRestaurant = document.getElementById('reel-restaurant');
  const btnSpin = document.getElementById('slot-spin');
  const btnClose = document.getElementById('slot-close');
  const status = document.getElementById('slot-status');
  if (!slot || !reelCategory || !reelRestaurant) return;

  const CATEGORIES = ['Món Nước', 'Cơm', 'Đặc Sản', 'Ăn Vặt & Chè', 'Hải Sản', 'Đồ Uống', 'Món Quốc Tế'];
  const DEFAULT_NAMES = ['Mì Quảng Bà Mua', 'Cơm Gà A Hải', 'Chè Liên', 'Bún Chả Cá Hờn', 'Bánh Xèo Bà Dưỡng'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let spinning = false;

  function fillReel(reel, labels) {
    const repeated = [];
    for (let i = 0; i < REPEATS; i += 1) repeated.push.apply(repeated, labels);
    reel.innerHTML = repeated.map(function (label) { return '<li>' + label + '</li>'; }).join('');
  }

  function moveReel(reel, index, animate) {
    const first = reel.firstElementChild;
    const row = first ? first.offsetHeight : 68;
    reel.style.transition = animate ? 'transform ' + SPIN_MS + 'ms cubic-bezier(.15, .85, .25, 1)' : 'none';
    reel.style.transform = 'translateY(' + (-(index - 1) * row) + 'px)';
  }

  function stopIndex(labels, label) {
    const idx = labels.indexOf(label);
    return TARGET_ROUND * labels.length + (idx !== -1 ? idx : 0);
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function resetSlot() {
    delete slot.dataset.cuisine;
    slot.classList.remove('is-blinking');
    fillReel(reelCategory, CATEGORIES);
    fillReel(reelRestaurant, DEFAULT_NAMES);
    moveReel(reelCategory, 1, false);
    moveReel(reelRestaurant, 1, false);
    status.textContent = 'Bấm Quay để máy chọn giúp bạn.';
    btnSpin.disabled = false;
    btnClose.disabled = false;
  }

  async function spin() {
    if (spinning) return;
    spinning = true;
    btnSpin.disabled = true;
    btnClose.disabled = true;
    delete slot.dataset.cuisine;
    slot.classList.remove('is-blinking');

    try {
      const params = new URLSearchParams();
      if (window.HNAG && window.HNAG.appliedCategory) params.set('category', window.HNAG.appliedCategory);
      if (window.HNAG && window.HNAG.appliedMeal) params.set('mealTime', window.HNAG.appliedMeal);
      if (window.HNAG && window.HNAG.appliedDish) params.set('dish', window.HNAG.appliedDish);
      if (window.HNAG && window.HNAG.appliedCuisine) params.set('cuisine', window.HNAG.appliedCuisine);

      const res = await fetch('/api/restaurants/random?' + params.toString(), { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chưa tìm được quán phù hợp.');

      const winner = data.restaurant;
      const catName = winner.category || CATEGORIES[0];
      const catLabels = CATEGORIES.indexOf(catName) !== -1 ? CATEGORIES : [catName].concat(CATEGORIES.slice(0, 5));
      const restLabels = Array.isArray(data.reel) && data.reel.length >= 3
        ? (data.reel.indexOf(winner.name) !== -1 ? data.reel : [winner.name].concat(data.reel))
        : [winner.name].concat(DEFAULT_NAMES.filter(function (n) { return n !== winner.name; }));

      fillReel(reelCategory, catLabels);
      moveReel(reelCategory, 1, false);

      if (reduceMotion) {
        slot.dataset.cuisine = winner.cuisine || 'viet';
        moveReel(reelCategory, stopIndex(catLabels, catName), false);
        fillReel(reelRestaurant, restLabels);
        moveReel(reelRestaurant, stopIndex(restLabels, winner.name), false);
        status.textContent = 'Hôm nay ăn tại ' + winner.name + '!';
        if (window.HNAG && window.HNAG.appliedDishName) {
          status.textContent += ' (quán phù hợp với ' + window.HNAG.appliedDishName + ')';
        }
        await wait(BLINK_MS);
        slot.close();
        spinning = false;
        if (window.HNAGOpenMenuModal) window.HNAGOpenMenuModal(winner);
        return;
      }

      status.textContent = 'Đang quay phân loại món...';
      void reelCategory.offsetHeight;
      moveReel(reelCategory, stopIndex(catLabels, catName), true);
      await wait(SPIN_MS);

      slot.dataset.cuisine = winner.cuisine || 'viet';
      status.textContent = catName + '! Đang chọn quán tại Đà Nẵng...';
      fillReel(reelRestaurant, restLabels);
      moveReel(reelRestaurant, 1, false);
      void reelRestaurant.offsetHeight;
      moveReel(reelRestaurant, stopIndex(restLabels, winner.name), true);
      await wait(SPIN_MS);

      status.textContent = 'Hôm nay ăn tại ' + winner.name + '!';
      slot.classList.add('is-blinking');
      await wait(BLINK_MS);
      slot.close();
      spinning = false;
      if (window.HNAGOpenMenuModal) window.HNAGOpenMenuModal(winner);
    } catch (err) {
      status.textContent = err.message;
      btnSpin.disabled = false;
      btnClose.disabled = false;
      spinning = false;
    }
  }

  ['open-slot', 'open-slot-top'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function () {
        slot.showModal();
        resetSlot();
        btnSpin.focus();
      });
    }
  });

  btnSpin.addEventListener('click', spin);
  btnClose.addEventListener('click', function () { if (!spinning) slot.close(); });
  slot.addEventListener('click', function (e) { if (e.target === slot && !spinning) slot.close(); });
  slot.addEventListener('cancel', function (e) { if (spinning) e.preventDefault(); });
})();

/* Admin: mở modal thêm / sửa quán ăn */
(function () {
  const search = document.getElementById('restaurant-search');
  if (search) {
    const rows = Array.from(document.querySelectorAll('[data-restaurant-row]'));
    search.addEventListener('input', function () {
      const query = search.value.trim().toLocaleLowerCase('vi');
      rows.forEach(function (row) {
        row.hidden = !row.textContent.toLocaleLowerCase('vi').includes(query);
      });
    });
  }

  const modal = document.getElementById('restaurant-modal');
  const form = document.getElementById('restaurant-form');
  const title = document.getElementById('restaurant-modal-title');
  const submit = document.getElementById('restaurant-submit');
  if (!modal || !form) return;

  function resetForm() {
    form.reset();
    form.action = '/admin/restaurants';
    title.textContent = '➕ Thêm quán mới';
    submit.textContent = '💾 Lưu quán';
    if (form.elements.cuisine) form.elements.cuisine.value = 'viet';
  }

  function fillForm(r) {
    form.reset();
    form.action = '/admin/restaurants/' + encodeURIComponent(r._id) + '/update';
    title.textContent = '✏️ Sửa quán: ' + r.name;
    submit.textContent = '💾 Cập nhật';

    form.elements.name.value = r.name || '';
    form.elements.address.value = r.address || '';
    if (form.elements.district) form.elements.district.value = r.district || 'Hải Châu';
    form.elements.category.value = r.category || form.elements.category.options[0].value;
    if (form.elements.cuisine) form.elements.cuisine.value = r.cuisine || 'viet';
    form.elements.priceRange.value = r.priceRange || '';
    if (form.elements.promoTag) form.elements.promoTag.value = r.promoTag || 'Freeship 15k';
    if (form.elements.deliveryTime) form.elements.deliveryTime.value = r.deliveryTime || '15 phút';
    if (form.elements.distance) form.elements.distance.value = r.distance || '1.2 km';
    if (form.elements.reviewCount) form.elements.reviewCount.value = r.reviewCount || '999+';
    if (form.elements.openingHours) form.elements.openingHours.value = r.openingHours || '06:30 - 22:00';
    if (form.elements.isPreferred) form.elements.isPreferred.checked = r.isPreferred !== false;
    form.elements.rating.value = r.rating != null ? r.rating : 4.8;
    form.elements.image.value = r.image || '';
    form.elements.mapUrl.value = r.mapUrl || '';
    if (form.elements.menuText) {
      const menuArr = Array.isArray(r.menu) ? r.menu : [];
      form.elements.menuText.value = menuArr
        .map(function (m) {
          return [m.name, m.price || 45000, m.description || '', m.isBestSeller ? '1' : '0'].join(' | ');
        })
        .join('\n');
    }

    const meals = r.mealTime || [];
    form.querySelectorAll('input[name="mealTime"]').forEach(function (cb) {
      cb.checked = meals.indexOf(cb.value) !== -1;
    });
  }

  document.querySelectorAll('[data-open-restaurant-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      resetForm();
      modal.showModal();
      form.elements.name.focus();
    });
  });

  document.querySelectorAll('[data-edit-restaurant]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      try {
        fillForm(JSON.parse(btn.getAttribute('data-edit-restaurant')));
        modal.showModal();
        form.elements.name.focus();
      } catch (err) {
        window.alert('Không đọc được dữ liệu quán.');
      }
    });
  });

  modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () { modal.close(); });
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.close();
  });
})();

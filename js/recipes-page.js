(function () {
  const content = document.getElementById('recipe-content');
  const title = document.getElementById('recipe-title');
  const intro = document.getElementById('recipe-intro');
  const message = document.getElementById('recipe-message');
  const selectedId = new URLSearchParams(location.search).get('dish');
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function render() {
    const dishes = FOOD.DISHES.filter((dish) => RECIPES[dish.id]);
    if (selectedId) {
      const dish = dishes.find((entry) => entry.id === selectedId);
      const recipe = RECIPES[selectedId];
      if (!dish || !recipe) {
        title.textContent = 'Chưa có công thức này';
        intro.textContent = 'Món ăn không nằm trong danh sách công thức.';
        message.innerHTML = '<a class="btn" href="/recipes.html">Xem tất cả công thức</a>';
        content.replaceChildren();
        return;
      }

      document.body.dataset.cuisine = dish.cuisine;
      document.title = `Công thức ${dish.name} | Hôm nay ăn gì?`;
      title.textContent = `Cách nấu ${dish.name}`;
      intro.textContent = dish.desc;
      const image = App.photo(dish, 1000, 700);
      content.innerHTML = `
        <article class="recipe-detail">
          <img class="recipe-detail__image" src="${escapeHtml(image)}" alt="${escapeHtml(dish.name)}">
          <div class="recipe-detail__body">
            <p class="recipe-meta">${escapeHtml(FOOD.CUISINES[dish.cuisine].name)} · ${escapeHtml(recipe.difficulty)} · ${escapeHtml(recipe.time)} · ${Number(recipe.servings)} phần</p>
            <h2>Nguyên liệu</h2>
            <ul class="recipe-ingredients">${recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join('')}</ul>
            <h2>Cách làm</h2>
            <ol class="recipe-steps">${recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
            <p class="recipe-tip"><strong>Mẹo nhỏ:</strong> ${escapeHtml(recipe.tip)}</p>
            <div class="recipe-actions">
              <a class="btn btn--primary" href="/result.html?dish=${encodeURIComponent(dish.id)}">Quay lại món này</a>
              <a class="btn" href="/recipes.html">Tất cả công thức</a>
            </div>
          </div>
        </article>`;
      return;
    }

    intro.textContent = 'Đủ 30 công thức tương ứng với 30 món trên vòng quay.';
    content.innerHTML = `
      <label class="recipe-search">
        <span>Tìm công thức</span>
        <input id="recipe-search" type="search" placeholder="Tên món hoặc nền ẩm thực">
      </label>
      <div class="recipe-grid" id="recipe-grid">
        ${dishes.map((dish) => `
          <a class="recipe-card" data-recipe-card href="/recipes.html?dish=${encodeURIComponent(dish.id)}" data-search="${escapeHtml(`${dish.name} ${FOOD.CUISINES[dish.cuisine].name}`.toLocaleLowerCase('vi'))}">
            <img src="${escapeHtml(App.photo(dish, 600, 400))}" alt="" loading="lazy">
            <div>
              <span>${escapeHtml(FOOD.CUISINES[dish.cuisine].name)} · ${escapeHtml(RECIPES[dish.id].time)}</span>
              <h2>${escapeHtml(dish.name)}</h2>
              <p>${escapeHtml(dish.desc)}</p>
            </div>
          </a>
        `).join('')}
      </div>`;
    const search = document.getElementById('recipe-search');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase('vi');
      document.querySelectorAll('[data-recipe-card]').forEach((card) => {
        card.hidden = !card.dataset.search.includes(query);
      });
    });
  }

  render();
})();

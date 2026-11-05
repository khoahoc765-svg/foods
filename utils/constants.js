// Danh mục quán ăn dùng chung cho Model, bộ lọc và form Admin (Chuẩn GrabFood / ShopeeFood Đà Nẵng)
const CATEGORIES = [
  'Món Nước',
  'Cơm',
  'Đặc Sản',
  'Ăn Vặt & Chè',
  'Hải Sản',
  'Đồ Uống',
  'Món Quốc Tế'
];

// Các buổi ăn theo đúng thứ tự trong ngày
const MEAL_TIMES = ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Khuya'];

const CATEGORY_EMOJI = {
  'Món Nước': '🍜',
  'Món nước': '🍜',
  'Cơm': '🍚',
  'Đặc Sản': '🌯',
  'Đặc sản': '🌯',
  'Ăn Vặt & Chè': '🍧',
  'Ăn vặt': '🥢',
  'Chè & Tráng miệng': '🍧',
  'Hải Sản': '🦐',
  'Hải sản': '🦐',
  'Đồ Uống': '🧋',
  'Đồ uống': '🧋',
  'Món Quốc Tế': '🍱',
  'Quán Ăn': '🍽️'
};

module.exports = { CATEGORIES, MEAL_TIMES, CATEGORY_EMOJI };

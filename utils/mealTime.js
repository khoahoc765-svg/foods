/**
 * Nhận diện buổi ăn theo giờ Việt Nam (Asia/Ho_Chi_Minh), không phụ thuộc múi giờ của server.
 *   Sáng  05:00 - 10:29
 *   Trưa  10:30 - 13:59
 *   Chiều 14:00 - 16:59
 *   Tối   17:00 - 20:59
 *   Khuya 21:00 - 04:59
 */
function getVietnamHourDecimal(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === 'hour').value) % 24;
  const minute = Number(parts.find((p) => p.type === 'minute').value);
  return hour + minute / 60;
}

function getCurrentMealTime(date = new Date()) {
  const h = getVietnamHourDecimal(date);
  if (h >= 5 && h < 10.5) return 'Sáng';
  if (h >= 10.5 && h < 14) return 'Trưa';
  if (h >= 14 && h < 17) return 'Chiều';
  if (h >= 17 && h < 21) return 'Tối';
  return 'Khuya';
}

const MEAL_GREETINGS = {
  'Sáng': { emoji: '🌅', text: 'Chào buổi sáng! Nạp năng lượng cho ngày mới nhé.' },
  'Trưa': { emoji: '☀️', text: 'Trưa rồi, đi ăn gì cho chắc bụng nào!' },
  'Chiều': { emoji: '🌤️', text: 'Xế chiều rồi, làm chút ăn vặt hay ly nước mát nhé?' },
  'Tối': { emoji: '🌙', text: 'Buổi tối vui vẻ! Cùng chọn món cho bữa tối nào.' },
  'Khuya': { emoji: '🌌', text: 'Khuya rồi mà còn đói hả? Để tụi mình tìm quán còn mở nhé.' }
};

module.exports = { getCurrentMealTime, MEAL_GREETINGS };

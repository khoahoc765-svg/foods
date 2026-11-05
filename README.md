# Hôm nay ăn gì?

Website chọn món với trang quán ăn Đà Nẵng, dùng HTML/CSS/JavaScript, Node.js, Express, EJS và MongoDB.

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên. Để dùng MongoDB local, khởi động MongoDB rồi chạy:

```sh
npm install
cp .env.example .env
npm start
```

Mặc định MongoDB dùng URI `mongodb://127.0.0.1:27017/hom_nay_an_gi`. Nếu MongoDB chưa chạy, ứng dụng dùng dữ liệu JSON cục bộ trong `data/`.

## Luồng chọn món và quán ăn

- Trang chính (`/`) giữ vòng quay món đang có; kết quả gọi `/api/restaurants` theo mã món và nền ẩm thực để gợi ý quán ở Đà Nẵng.
- Nút **Xem tất cả quán** mở `/restaurants` với bộ lọc món vừa quay.
- Vòng quay quán trên `/restaurants` dùng cùng bộ lọc đó; nếu chưa có quán được gắn trực tiếp với món, hệ thống gợi ý quán cùng nền ẩm thực.
- API quán ăn: `/api/restaurants`, `/api/restaurants/random`, `/api/restaurants/meta`.

## Công thức và giỏ hàng

- Mỗi món trong vòng quay có công thức tại `/recipes.html?dish=<ma-mon>`; `/recipes.html` hiển thị danh mục đủ 30 công thức.
- Chọn món trong thực đơn quán rồi bấm **Thêm vào giỏ** để lưu món và số lượng vào `localStorage` của trình duyệt. Mở `/cart.html` hoặc chọn **Giỏ hàng** trên menu để xem, sửa số lượng hay bỏ món.
- Giỏ hàng được lưu theo trình duyệt hiện tại; chưa gửi đơn hoặc thanh toán tới nhà hàng.

## Trang và dữ liệu

- `index.html`, `js/data.js`, `js/result.js`: vòng quay món chính và trang kết quả.
- `views/home.ejs`, `public/js/slot.js`: danh sách quán Đà Nẵng và vòng quay quán.
- `data/seedData.js`: dữ liệu mẫu quán, gồm mã món liên quan.
- `models/Restaurant.js`, `controllers/restaurantController.js`: dữ liệu và API quán ăn.
- `views/admin/dashboard.ejs`: Admin Dashboard tại `/admin`.

Khi cơ sở dữ liệu còn trống, server tự nạp dữ liệu mẫu. Tài khoản kiểm tra: `admin@gmail.com` / `123456`. Đổi mật khẩu mẫu và `SESSION_SECRET` trước khi triển khai công khai.

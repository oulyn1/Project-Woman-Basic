# Dự án Woman Basic

Project-Woman-Basic là giải pháp Thương mại điện tử toàn diện được thiết kế riêng cho ngành thời trang. Dự án nhằm mục đích nâng cao trải nghiệm người dùng cho shop thời trang **Woman Basic** thông qua việc tối ưu hóa hệ thống, cải thiện hiệu suất và thiết kế UI/UX hiện đại.

---

## 🚀 Tính năng chính

### 👤 Cổng thông tin khách hàng
- **Trang chủ & Mua sắm**: Duyệt sản phẩm với bộ lọc và sắp xếp linh hoạt.
- **Giỏ hàng & Thanh toán**: Trải nghiệm mua sắm liền mạch với quản lý giỏ hàng thông minh.
- **Quản lý tài khoản**: Cá nhân hóa hồ sơ và theo dõi tình trạng đơn hàng.
- **Đánh giá sản phẩm**: Xem và gửi nhận xét cho các sản phẩm đã mua.

### 🛡️ Trang quản trị (Admin Dashboard)
- **Sản phẩm & Danh mục**: Quản lý toàn diện (CRUD) kho hàng và danh mục.
- **Quản lý đơn hàng**: Theo dõi và xử lý đơn hàng từ khách hàng.
- **Kiểm soát tài khoản**: Quản lý người dùng hệ thống, phân quyền và hiển thị trạng thái hoạt động (Online/Offline) theo thời gian thực.
- **Khuyến mãi**: Tạo và quản lý các chiến dịch giảm giá.
- **Giám sát đánh giá**: Theo dõi và kiểm duyệt phản hồi từ khách hàng.

### 🤖 Năng lực ứng dụng AI
- **Phân tích sản phẩm AI**: Tự động tạo chi tiết sản phẩm (tên, danh mục, mô tả, tags) từ ảnh tải lên sử dụng Groq (Llama-4).
- **Phân tích bảng size AI**: Trích xuất bảng size từ hình ảnh và chuyển đổi sang Markdown để tư vấn kích cỡ tự động.
- **Trợ lý Stylist AI (Khách hàng)**: Trợ lý chat thời gian thực cung cấp gợi ý sản phẩm và tư vấn size cá nhân hóa.
- **Admin AI Copilot**: Trợ lý bảng điều khiển thông minh giúp phân tích kinh doanh, hỗ trợ tra cứu dữ liệu. Hỗ trợ phân quyền chặt chẽ giữa vai trò **Admin** (đầy đủ quyền hạn, mở Mini-UI tự động) và **Nhân viên (Employee)** (bị giới hạn quyền truy cập mục Khuyến mãi, Quản trị tài khoản; chặn kích hoạt Mini-UI của Đơn hàng và Khách hàng).
- **Lightweight RAG**: Triển khai Retrieval-Augmented Generation sử dụng MongoDB Text Search để cung cấp các phản hồi AI chính xác dựa trên dữ liệu thực tế của cửa hàng.
- **Hệ thống Giám sát Hoạt động (Heartbeat Keep-Alive)**: Theo dõi trạng thái hoạt động thông qua cơ chế gửi tín hiệu Nhịp tim (Heartbeat) định kỳ từ client và tiến trình tự động ngoại tuyến hoá (Status Monitor) ngầm ở backend.

---

## 🛠️ Công nghệ sử dụng

### Frontend
- **Framework**: React.js (v19)
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **State Management**: React Context API
- **Routing**: React Router (v7)
- **Icons**: Material Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (sử dụng MongoDB Atlas)
- **AI Engine**: Groq (Llama-4 Scout)
- **Authentication**: JWT (JSON Web Tokens)
- **Utilities**: Joi (Validation), Bcrypt (Mã hóa mật khẩu), Nodemailer, Axios.

---

## 📂 Cấu trúc dự án

Dự án được tổ chức theo mô hình **Monorepo** để dễ dàng quản lý cả mã nguồn client và server.

```text
Project-Woman-Basic/
├── backend/                # Server Express.js
│   ├── src/
│   │   ├── config/         # Cấu hình ứng dụng (DB, Môi trường)
│   │   ├── controllers/    # Xử lý yêu cầu (Request handlers)
│   │   ├── models/         # Schema cơ sở dữ liệu
│   │   ├── routes/         # Các đầu cuối API (v1, v2)
│   │   ├── services/       # Logic nghiệp vụ
│   │   └── server.js       # Điểm khởi chạy (Entry point)
├── frontend/               # Ứng dụng React
│   ├── src/
│   │   ├── apis/           # Lớp dịch vụ gọi API
│   │   ├── components/     # Các thành phần UI dùng chung
│   │   ├── layouts/        # Layout bao ngoài (Admin, Customer)
│   │   ├── pages/          # Các thành phần màn hình riêng biệt
│   │   └── main.jsx        # Điểm khởi chạy (Entry point)
├── package.json            # Cấu hình gốc (Workspaces)
└── README.md               # Bạn đang ở đây!
```

---

## 🚦 Bắt đầu

### 1. Yêu cầu hệ thống
- **Node.js**: v18.x trở lên
- **npm**: v7.x trở lên
- **MongoDB**: Quyền truy cập vào cơ sở dữ liệu MongoDB (Local hoặc Atlas)

### 2. Cấu hình môi trường

#### Backend
Tạo file `.env` trong thư mục `backend/`:
```env
MONGODB_URI=chuoi_ket_noi_mongodb_cua_ban
DATABASE_NAME=WomanBasic
APP_HOST=localhost
APP_PORT=8017
JWT_SECRET=ma_bi_mat_jwt_cua_ban
```

#### Frontend
Cấu hình kết nối API trong `frontend/src/util/constants.js`:
```javascript
export const API_ROOT = 'http://localhost:8017'
```

### 3. Cài đặt
Tại **thư mục gốc**, chạy lệnh sau để cài đặt các thư viện cho cả Frontend và Backend:
```bash
npm install
```

### 4. Chạy môi trường phát triển (Development)
Để khởi chạy cả hai ứng dụng cùng lúc:
```bash
npm run dev
```

---

## 🛠 Lệnh dự án

| Lệnh | Mô tả |
| :--- | :--- |
| `npm run dev` | Chạy cả Frontend và Backend trong chế độ phát triển. |
| `npm run backend` | Chỉ chạy server Express. |
| `npm run frontend` | Chỉ chạy server React/Vite. |
| `npm install` | Cài đặt tất cả các phụ thuộc cho toàn bộ dự án. |

---

## 📝 Bản quyền
Dự án này được sử dụng nội bộ. Mọi quyền được bảo lưu.

# 🛍️ Woman Basic — E-Commerce Platform

**Woman Basic** là nền tảng thương mại điện tử toàn diện được thiết kế riêng cho ngành thời trang nữ. Hệ thống tích hợp trí tuệ nhân tạo (AI) để hỗ trợ phân tích sản phẩm, tư vấn style và vận hành cửa hàng.

---

## 🚀 Tính năng chính

### 👤 Cổng thông tin khách hàng
- **Trang chủ & Mua sắm**: Duyệt sản phẩm với bộ lọc và sắp xếp linh hoạt.
- **Giỏ hàng & Thanh toán**: Trải nghiệm mua sắm liền mạch với quản lý giỏ hàng thông minh.
- **Quản lý tài khoản**: Cá nhân hóa hồ sơ và theo dõi tình trạng đơn hàng.
- **Đánh giá sản phẩm**: Xem và gửi nhận xét cho các sản phẩm đã mua.
- **Gợi ý cá nhân hóa**: Hệ thống đề xuất sản phẩm dựa trên hành vi duyệt web.

### 🛡️ Trang quản trị (Admin Dashboard)
- **Sản phẩm & Danh mục**: Quản lý toàn diện (CRUD) kho hàng và danh mục.
- **Quản lý đơn hàng**: Theo dõi và xử lý đơn hàng từ khách hàng.
- **Kiểm soát tài khoản**: Quản lý người dùng hệ thống, phân quyền và hiển thị trạng thái hoạt động (Online/Offline) theo thời gian thực.
- **Khuyến mãi**: Tạo và quản lý các chiến dịch giảm giá.
- **Giám sát đánh giá**: Theo dõi và kiểm duyệt phản hồi từ khách hàng.

### 🤖 Năng lực AI
- **Phân tích sản phẩm AI**: Tự động tạo chi tiết sản phẩm từ ảnh tải lên (Groq – Llama-4).
- **Phân tích bảng size AI**: Trích xuất bảng size từ hình ảnh, chuyển đổi sang Markdown.
- **Trợ lý Stylist AI (Khách hàng)**: Chat thời gian thực, gợi ý sản phẩm và tư vấn size.
- **Admin AI Copilot**: Trợ lý phân tích kinh doanh, báo cáo tuần, tra cứu dữ liệu nhanh.
- **Lightweight RAG**: Truy vấn AI dựa trên dữ liệu thực tế của cửa hàng qua MongoDB Text Search.
- **Heartbeat Keep-Alive**: Theo dõi trạng thái người dùng Online/Offline theo thời gian thực.

---

## 🛠️ Công nghệ sử dụng

| Phần | Công nghệ |
|------|-----------|
| **Frontend** | React 19, Vite, Material UI (MUI), React Router v7 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **AI Engine** | Groq API (Llama-4 Scout) |
| **Auth** | JWT (JSON Web Tokens) |
| **Email** | Nodemailer |
| **Validation** | Joi |
| **Bảo mật** | Bcrypt |
| **Deploy** | Render (backend + frontend static) |

---

## 📂 Cấu trúc dự án

```text
Project-Woman-Basic/
├── backend/                  # Server Express.js
│   ├── src/
│   │   ├── config/           # Cấu hình (DB, môi trường)
│   │   ├── controllers/      # Xử lý request
│   │   ├── jobs/             # Background jobs (heartbeat, weekly insight)
│   │   ├── middlewares/      # Auth, role, CORS
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API endpoints (v1)
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   └── server.js         # Entry point
│   ├── .env                  # Biến môi trường (tạo thủ công, xem bên dưới)
│   └── package.json
├── frontend/                 # Ứng dụng React/Vite
│   ├── src/
│   │   ├── apis/             # Lớp gọi API
│   │   ├── components/       # UI components dùng chung
│   │   ├── layouts/          # Layout (Admin, Customer)
│   │   ├── pages/            # Màn hình (Admin, Customer, Auth)
│   │   ├── util/             # Constants, helpers
│   │   └── main.jsx          # Entry point
│   ├── .env                  # Biến môi trường Vite (tạo thủ công, xem bên dưới)
│   └── package.json
├── package.json              # Monorepo root (npm workspaces)
├── render.yaml               # Cấu hình deploy lên Render
└── README.md
```

---

## ⚙️ Cài đặt & Chạy ở Local

### Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | v18.x |
| npm | v8.x |
| Git | Bất kỳ |
| MongoDB | Atlas (cloud) hoặc local v6+ |

---

### Bước 1 — Clone repository

```bash
git clone https://github.com/<your-username>/Project-Woman-Basic.git
cd Project-Woman-Basic
```

---

### Bước 2 — Tạo file biến môi trường

#### `backend/.env`

```env
# Kết nối MongoDB (Atlas Connection String hoặc local)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
DATABASE_NAME=WomanBasic

# Server
APP_HOST=localhost
APP_PORT=8017
BUILD_MODE=dev

# JWT — đặt chuỗi bí mật ngẫu nhiên, dài ít nhất 32 ký tự
JWT_SECRET=your_super_secret_jwt_key_here

# Groq AI API Key — lấy tại https://console.groq.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Nodemailer — tài khoản Gmail dùng để gửi OTP / xác nhận đơn hàng
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

> **Lưu ý `MAIL_PASSWORD`:** Đây phải là **App Password** của Gmail (không phải mật khẩu đăng nhập thông thường).  
> Tạo tại: Google Account → Bảo mật → Xác minh 2 bước → **Mật khẩu ứng dụng**.

#### `frontend/.env`

```env
# Địa chỉ backend API khi chạy local
VITE_API_ROOT=http://localhost:8017
```

---

### Bước 3 — Cài đặt dependencies

Tại **thư mục gốc** của dự án, chạy:

```bash
npm install && npm install --workspaces
```

Lệnh này sẽ cài đặt dependencies cho cả `backend/` và `frontend/` nhờ npm Workspaces.

---

### Bước 4 — Chạy ứng dụng

```bash
npm run dev
```

Lệnh này khởi chạy đồng thời cả hai server:

| Service | Địa chỉ |
|---------|---------|
| Backend API | `http://localhost:8017` |
| Frontend | `http://localhost:5173` |

Hoặc chạy riêng từng phần:

```bash
npm run backend    # Chỉ chạy Express server
npm run frontend   # Chỉ chạy Vite dev server
```

---

### Bước 5 — Khởi tạo tài khoản Admin (lần đầu)

Sau khi server chạy, tạo tài khoản admin đầu tiên bằng cách **đăng ký thông thường**, rồi vào MongoDB Atlas / MongoDB Compass, tìm collection `users`, cập nhật trường `role` từ `"customer"` → `"admin"` cho tài khoản vừa tạo.

---

## 🌐 Deploy lên Render

Dự án đã có sẵn file `render.yaml` hỗ trợ **Blueprint Deploy** một lệnh:

### Các bước

1. Đăng nhập [render.com](https://render.com) → **New → Blueprint**.
2. Kết nối GitHub repository của bạn.
3. Render tự đọc `render.yaml` và tạo 2 services:
   - `woman-basic-backend` — Node.js Web Service
   - `womanbasic` — Static Site (React build)
4. Vào **Environment Variables** của service `woman-basic-backend`, thêm thủ công các biến **bí mật** (Render không sync từ file):

| Biến | Ghi chú |
|------|---------|
| `MONGODB_URI` | Connection string MongoDB Atlas |
| `GROQ_API_KEY` | Lấy từ console.groq.com |
| `MAIL_USER` | Email Gmail |
| `MAIL_PASSWORD` | Gmail App Password |

5. Deploy và chờ build hoàn tất (~3-5 phút).

---

## 🛠 Lệnh tham khảo

| Lệnh | Mô tả |
|------|-------|
| `npm run dev` | Chạy cả Frontend + Backend (development) |
| `npm run backend` | Chỉ chạy Express server |
| `npm run frontend` | Chỉ chạy Vite dev server |
| `npm install && npm install --workspaces` | Cài đặt toàn bộ dependencies |

---

## 🔑 Biến môi trường — Tổng hợp

### Backend (`backend/.env`)

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `DATABASE_NAME` | ✅ | Tên database (mặc định: `WomanBasic`) |
| `APP_PORT` | ❌ | Port server (mặc định: `8017`) |
| `BUILD_MODE` | ✅ | `dev` hoặc `production` |
| `JWT_SECRET` | ✅ | Chuỗi bí mật ký JWT |
| `GROQ_API_KEY` | ✅ | Key Groq AI (tính năng AI) |
| `MAIL_USER` | ✅ | Gmail gửi email |
| `MAIL_PASSWORD` | ✅ | Gmail App Password |

### Frontend (`frontend/.env`)

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `VITE_API_ROOT` | ✅ | URL backend API (local: `http://localhost:8017`) |

---

## 📝 Bản quyền

Dự án này được sử dụng nội bộ. Mọi quyền được bảo lưu.

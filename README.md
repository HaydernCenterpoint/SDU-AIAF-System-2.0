<!--
  SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
  SPDX-License-Identifier: Apache-2.0
-->

# Hệ thống trợ lý trí tuệ nhân tạo hỗ trợ toàn diện cho sinh viên

Project này là một hệ thống trợ lý AI dành cho sinh viên, hỗ trợ học tập, công việc cá nhân, sức khỏe, tài chính, thông báo và quản trị hệ thống. Hệ thống gồm 3 phần chính:

- **Backend API**: xử lý đăng nhập, dữ liệu sinh viên, AI chat, nhắc nhở, thống kê và admin.
- **Web frontend**: giao diện sinh viên và trang quản trị admin.
- **Mobile app**: ứng dụng Expo/React Native cho sinh viên.

Tài liệu này viết theo hướng đơn giản để sinh viên có thể cài đặt, chạy thử và phát triển tiếp.

---

## 1. Giới thiệu project

Hệ thống giúp sinh viên quản lý việc học và cuộc sống hằng ngày trong một ứng dụng:

- Hỏi trợ lý AI về học tập, báo cáo, CV, lập trình, nghề nghiệp, sức khỏe và tài chính.
- Theo dõi môn học, bài tập, deadline, task và lịch nhắc nhở.
- Ghi nhận dữ liệu sức khỏe như BMI, cân nặng, giấc ngủ, bữa ăn, tập luyện và tâm trạng.
- Xem dashboard thống kê học tập, công việc, sức khỏe và tài chính.
- Nhận thông báo khi có reminder/deadline/task quá hạn.
- Admin quản lý người dùng, log AI, trạng thái tài khoản và dữ liệu hệ thống.

---

## 2. Chức năng chính

### Sinh viên

- Đăng ký, đăng nhập, hoàn thiện hồ sơ.
- Chat với AI theo nhiều nhóm trợ lý.
- Quản lý nhắc nhở và thông báo.
- Theo dõi sức khỏe cá nhân.
- Xem thống kê tổng quan.
- Sử dụng web app hoặc mobile app.

### Admin

- Đăng nhập admin.
- Xem dashboard tổng quan hệ thống.
- Quản lý người dùng.
- Khóa/mở khóa tài khoản.
- Xem thống kê số lượng user và sử dụng AI.
- Xem lịch sử truy vấn AI.
- Xem log hoạt động admin.
- Quản lý mẫu CV, mẫu báo cáo, thông báo hệ thống và danh mục.

---

## 3. Công nghệ sử dụng

### Backend

- Node.js
- HTTP server / Express-compatible service code
- Prisma ORM
- PostgreSQL
- JWT authentication
- Zod validation
- AI provider adapter

### Web frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- React Hook Form + Zod

### Mobile app

- Expo
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Expo Notifications
- Axios

---

## 4. Cấu trúc thư mục

```text
NemoClaw/
├── packages/
│   └── backend/              # Backend API, auth, AI, statistics, admin
│       ├── src/              # Source code backend
│       ├── prisma/           # Prisma schema và seed
│       └── test/             # Test backend
├── apps/
│   ├── client-react/         # Web frontend Next.js
│   │   ├── src/app/          # App routes
│   │   ├── src/components/   # UI components
│   │   ├── src/lib/          # API clients
│   │   └── test/             # Test frontend
│   └── mobile/               # Mobile app Expo
│       ├── src/screens/      # Mobile screens
│       ├── src/services/     # Mobile API services
│       ├── src/navigation/   # Navigation
│       └── test/             # Test mobile foundation
├── docker-compose.saodo.yml  # Chạy backend demo bằng Docker
└── README.md                 # Tài liệu hướng dẫn
```

---

## 5. Yêu cầu môi trường

Cài trước các công cụ sau:

- Node.js 22 trở lên
- npm 10 trở lên
- PostgreSQL 15 trở lên
- Git
- Expo CLI qua `npx expo`
- Android Studio hoặc Expo Go nếu chạy mobile trên điện thoại

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

---

## 6. Cài đặt backend

Di chuyển vào thư mục backend:

```bash
cd packages/backend
```

Cài dependencies:

```bash
npm install
```

Tạo file `.env` từ mẫu ở phần cấu hình bên dưới.

Chạy backend ở chế độ dev:

```bash
npm run dev
```

Backend mặc định chạy ở:

```text
http://localhost:9191
```

---

## 7. Cài đặt web frontend

Di chuyển vào thư mục web:

```bash
cd apps/client-react
```

Cài dependencies:

```bash
npm install
```

Chạy web app:

```bash
npm run dev
```

Web mặc định chạy ở:

```text
http://localhost:3000
```

---

## 8. Cài đặt mobile app

Di chuyển vào thư mục mobile:

```bash
cd apps/mobile
```

Cài dependencies:

```bash
npm install
```

Chạy Expo:

```bash
npx expo start
```

Sau đó chọn một cách chạy:

- Nhấn `a` để chạy Android emulator.
- Nhấn `i` để chạy iOS simulator nếu dùng macOS.
- Quét QR bằng Expo Go trên điện thoại.

---

## 9. Cấu hình database

Tạo database PostgreSQL, ví dụ:

```sql
CREATE DATABASE saodo_assistant;
```

Chuỗi kết nối mẫu:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saodo_assistant?schema=public"
```

Nếu dùng Docker/PostgreSQL riêng, hãy thay username, password, host, port và database cho đúng máy của bạn.

---

## 10. Cấu hình file `.env`

Tạo file `.env` trong `packages/backend/`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saodo_assistant?schema=public"
JWT_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
AI_API_KEY="your-ai-api-key"
AI_MODEL="your-ai-model"
UPLOAD_DIR="uploads"

PORT=9191
CORS_ALLOW_ORIGIN="http://localhost:3000"
```

Nếu web frontend cần gọi backend khác URL mặc định, tạo file `.env.local` trong `apps/client-react/`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:9191/api"
```

Nếu mobile app chạy trên điện thoại thật, không dùng `localhost`. Hãy dùng IP máy tính trong cùng mạng Wi-Fi:

```env
EXPO_PUBLIC_API_BASE_URL="http://192.168.1.10:9191/api"
```

---

## 11. Chạy migration

Trong thư mục `packages/backend`:

```bash
npx prisma migrate dev
```

Nếu cần generate Prisma Client:

```bash
npx prisma generate
```

---

## 12. Chạy seed dữ liệu mẫu

Trong thư mục `packages/backend`:

```bash
npx prisma db seed
```

Hoặc dùng script có sẵn:

```bash
npm run prisma:seed
```

Seed giúp tạo dữ liệu mẫu như user demo, dữ liệu học tập, sức khỏe, thống kê hoặc admin tùy nội dung file seed.

---

## 13. Chạy backend

Trong thư mục `packages/backend`:

```bash
npm run dev
```

Kiểm tra backend:

```bash
curl http://localhost:9191/api/health
```

Nếu chạy production:

```bash
npm start
```

---

## 14. Chạy web app

Trong thư mục `apps/client-react`:

```bash
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

Build production:

```bash
npm run build
npm start
```

---

## 15. Chạy mobile app

Trong thư mục `apps/mobile`:

```bash
npm install
npx expo start
```

Lưu ý khi gọi backend từ mobile:

- Android emulator thường dùng `10.0.2.2` để trỏ về máy host.
- Điện thoại thật cần dùng IP LAN của máy chạy backend.
- Backend và điện thoại phải cùng mạng nếu chạy local.

Ví dụ `.env` mobile:

```env
EXPO_PUBLIC_API_BASE_URL="http://192.168.1.10:9191/api"
```

---

## 16. Tài khoản demo

Tài khoản demo phụ thuộc dữ liệu seed. Có thể dùng mẫu sau nếu seed đã tạo sẵn:

### Sinh viên

```text
Mã sinh viên: SV001
Mật khẩu: secret123
```

### Admin

```text
Tài khoản: ADMIN
Mật khẩu: admin123
```

Nếu chưa có tài khoản, bạn có thể đăng ký trực tiếp trên web app hoặc thêm user trong seed.

---

## 17. API documentation

Base URL backend:

```text
http://localhost:9191/api
```

### Auth

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/register` | Đăng ký bước đầu |
| POST | `/auth/complete-profile` | Hoàn thiện hồ sơ |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Lấy thông tin user hiện tại |

### AI

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/ai/chat` | Chat với trợ lý AI theo assistant type |
| POST | `/chat/send` | Gửi tin nhắn chat trong conversation |
| GET | `/conversations` | Danh sách hội thoại |
| GET | `/conversations/:id` | Chi tiết hội thoại |

### Health

| Method | Endpoint | Mô tả |
|---|---|---|
| PUT | `/health/profile` | Cập nhật hồ sơ sức khỏe |
| POST | `/health/weight-logs` | Thêm cân nặng |
| POST | `/health/sleep-logs` | Thêm giấc ngủ |
| POST | `/health/meal-logs` | Thêm bữa ăn |
| POST | `/health/workout-logs` | Thêm tập luyện |
| POST | `/health/mood-logs` | Thêm tâm trạng |
| POST | `/health/bmi` | Tính BMI |
| GET | `/health/statistics` | Thống kê sức khỏe |
| POST | `/health/ai-suggestions` | Gợi ý sức khỏe bằng AI |

### Reminder và Notification

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/reminders` | Danh sách reminder |
| POST | `/reminders` | Tạo reminder |
| PUT | `/reminders/:id` | Cập nhật reminder |
| DELETE | `/reminders/:id` | Xóa reminder |
| POST | `/reminders/run-due-job` | Chạy job kiểm tra reminder đến hạn |
| GET | `/notifications` | Danh sách notification |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc |
| POST | `/notifications/push-token` | Lưu push token |

### Statistics

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/statistics/dashboard` | Dashboard tổng hợp |
| GET | `/statistics/study` | Thống kê học tập |
| GET | `/statistics/tasks` | Thống kê công việc |
| GET | `/statistics/health` | Thống kê sức khỏe |
| GET | `/statistics/finance` | Thống kê tài chính |

Các API statistics hỗ trợ query:

```text
?period=day
?period=week
?period=month
?period=year
```

### Admin

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/users` | Danh sách user |
| GET | `/admin/users/:id` | Chi tiết user |
| PUT | `/admin/users/:id/status` | Khóa/mở khóa user |
| GET | `/admin/statistics` | Thống kê hệ thống |
| GET | `/admin/ai-logs` | Log truy vấn AI |
| GET | `/admin/logs` | Log hoạt động admin |
| GET | `/admin/catalog` | Danh mục, mẫu CV, mẫu báo cáo |

Admin API bắt buộc có JWT của user role `admin`.

---

## 18. Lỗi thường gặp

### 1. Backend không kết nối được database

Kiểm tra `DATABASE_URL` trong `.env`:

```bash
npx prisma migrate dev
```

Nếu lỗi authentication, kiểm tra username/password PostgreSQL.

### 2. Web gọi API bị CORS

Kiểm tra backend `.env`:

```env
CORS_ALLOW_ORIGIN="http://localhost:3000"
```

Sau đó restart backend.

### 3. Mobile không gọi được backend

Không dùng `localhost` trên điện thoại thật. Dùng IP LAN:

```env
EXPO_PUBLIC_API_BASE_URL="http://192.168.1.10:9191/api"
```

### 4. Prisma Client lỗi hoặc chưa generate

Chạy:

```bash
npx prisma generate
```

### 5. AI không trả lời

Kiểm tra:

```env
AI_API_KEY=
AI_MODEL=
```

Nếu chưa có API key, hệ thống có thể dùng fallback nội bộ tùy cấu hình backend.

### 6. Admin không truy cập được

Kiểm tra tài khoản có `role=admin` và token đăng nhập là token admin.

---

## 19. Hướng dẫn deploy

### Deploy backend

1. Tạo PostgreSQL production.
2. Cấu hình `.env` production.
3. Cài dependencies:

```bash
cd packages/backend
npm install
```

4. Chạy migration:

```bash
npx prisma migrate deploy
```

5. Chạy backend:

```bash
npm start
```

### Deploy web frontend

1. Cấu hình `NEXT_PUBLIC_API_BASE_URL` trỏ đến backend production.
2. Build:

```bash
cd apps/client-react
npm install
npm run build
npm start
```

### Deploy mobile app

1. Cấu hình `EXPO_PUBLIC_API_BASE_URL` trỏ đến backend production.
2. Kiểm tra app bằng Expo:

```bash
cd apps/mobile
npm install
npx expo start
```

3. Khi cần build file cài đặt, dùng quy trình build Expo phù hợp với Android/iOS.

### Deploy bằng Docker demo

Có thể chạy backend demo bằng Docker Compose:

```bash
docker compose -f docker-compose.saodo.yml up --build
```

---

## 20. Ghi chú bảo mật

- Không commit file `.env` lên Git.
- Không chia sẻ `JWT_SECRET`, `JWT_REFRESH_SECRET`, `AI_API_KEY`.
- Đổi toàn bộ secret mặc định trước khi deploy.
- Admin API chỉ dùng JWT của tài khoản role `admin`.
- User thường không được truy cập route `/api/admin/*`.
- Không log mật khẩu, token, API key hoặc dữ liệu nhạy cảm.
- Khi dùng AI, không gửi thông tin cá nhân nhạy cảm nếu không cần thiết.
- Bật HTTPS khi deploy production.
- Cấu hình CORS chỉ cho domain frontend thật.
- Sao lưu database định kỳ.
- Kiểm tra log admin để phát hiện hành động bất thường.

---

## Lệnh nhanh

### Backend

```bash
cd packages/backend
npm install
npm run dev
```

### Frontend

```bash
cd apps/client-react
npm install
npm run dev
```

### Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

### Database

```bash
cd packages/backend
npx prisma migrate dev
npx prisma db seed
```

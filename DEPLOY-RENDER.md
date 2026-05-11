# Deploy Backend lên Render

## Cách 1: Deploy nhanh (khuyến nghị)

### Bước 1: Push code lên GitHub

```bash
# Tạo git repo mới (nếu chưa có)
cd "c:\Users\datmk\OneDrive\Desktop\Workspace\SDU-AIAF-System-main"
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Tạo repo trên GitHub trước, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/SDU-AIAF-System.git
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render

1. Truy cập [dashboard.render.com](https://dashboard.render.com)
2. Đăng nhập → Click **"New +"** → Chọn **"Web Service"**
3. Connect GitHub repo của bạn
4. Cấu hình:

| Setting | Value |
|---------|-------|
| **Name** | `saodo-assistant-backend` |
| **Region** | Singapore (gần nhất) |
| **Branch** | `main` |
| **Root Directory** | (để trống) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node packages/backend/src/server.mjs` |
| **Plan** | `Free` |

5. Click **"Create Web Service"**

### Bước 3: Cấu hình Environment Variables

Trong phần **"Environment"** của Web Service, thêm:

```env
PORT=10000
CORS_ALLOW_ORIGIN=https://your-frontend.vercel.app
JWT_SECRET=your-secure-random-string-here
JWT_REFRESH_SECRET=another-secure-random-string-here

# KRouter AI (lấy từ .env hiện tại)
SAODO_AGENT_MODE=krouter
KROUTER_API_KEY=sk-9aa9be1d95d96de8-9es736-8a47a8a8
KROUTER_API_URL=https://sv1.krouter.net/v1
KROUTER_MODEL=cx/gpt-5.4
AI_API_KEY=
AI_MODEL=gpt-4o-mini
```

> **Lưu ý**: Thay `https://your-frontend.vercel.app` bằng domain thực của frontend sau khi deploy.

### Bước 4: Deploy

Render sẽ tự động chạy `npm install` và khởi động server.

Sau khi deploy xong, backend sẽ có URL dạng:
```
https://saodo-assistant-backend.onrender.com
```

### Bước 5: Cập nhật Frontend API URL

Sau khi backend lên mạng, cập nhật file `apps/client-react/src/lib/api-client.ts`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL 
  || 'https://saodo-assistant-backend.onrender.com/api';
```

---

## Kiểm tra backend

```bash
curl https://saodo-assistant-backend.onrender.com/api/health
```

Response mong đợi:
```json
{
  "ok": true,
  "service": "saodo-assistant-backend",
  "assistant": { ... }
}
```

---

## Tài khoản test (đã có sẵn trong seed)

| Email | Password |
|-------|----------|
| `admin@example.com` | `Password123!` |
| `student@example.com` | `Password123!` |

---

## Lưu ý quan trọng

### Cold Start
- Render Free tier: server ngủ sau **15 phút** không dùng
- Request đầu tiên sau khi ngủ sẽ mất ~30-50 giây (cold boot)
- Các request tiếp theo nhanh bình thường

### Data Persistence
- Backend dùng **file JSON** để lưu dữ liệu (trong `packages/backend/data/`)
- Dữ liệu sẽ bị mất khi Render khởi động lại instance
- **Giải pháp**: Dùng Render **Disk** (Persistent Disk) hoặc chuyển sang PostgreSQL

### Nếu cần PostgreSQL
Nếu muốn dữ liệu persist (không mất khi restart), dùng thêm **Render PostgreSQL**:

1. Dashboard → New → PostgreSQL
2. Copy **Internal Connection String**
3. Thêm vào Environment Variables:

```env
DATABASE_URL=postgresql://xxx:xxx@xxx:5432/saodo_assistant
```

4. Đổi Start Command thành:

```bash
npx prisma migrate deploy && node packages/backend/src/server.js
```

---

## Troubleshooting

### Lỗi "Module not found"
Kiểm tra `Root Directory` trong Render settings — để trống nếu repo root chứa `packages/backend/`.

### Lỗi CORS
Đảm bảo `CORS_ALLOW_ORIGIN` trong Environment Variables khớp chính xác với frontend URL (bao gồm `https://`).

### Lỗi 503 Service Unavailable
Thường do server crash. Kiểm tra **Logs** trong Render dashboard.

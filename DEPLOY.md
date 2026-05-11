# Deploy lên Web

## Tổng quan

Dự án SDU-AI-AF gồm 2 phần:
- **Frontend**: Next.js 15 (React) - deploy lên Vercel
- **Backend**: Node.js/Express - deploy lên Railway

---

## 1. Deploy Backend lên Railway

### Bước 1: Tạo project Railway
1. Vào [railway.app](https://railway.app)
2. Login > New Project > Deploy from GitHub
3. Chọn repo `SDU-AIAF-System-main`
4. Root directory: `packages/backend`

### Bước 2: Cấu hình Environment Variables
Thêm trong Railway dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | PostgreSQL connection string (Railway tự tạo plugin PostgreSQL) |
| `JWT_SECRET` | Random string 64+ ký tự |
| `JWT_REFRESH_SECRET` | Random string 64+ ký tự |
| `PORT` | `9191` |
| `CORS_ALLOW_ORIGIN` | `https://your-app.vercel.app` |
| `SAODO_AGENT_MODE` | `krouter` |
| `KROUTER_API_KEY` | API key của bạn |
| `KROUTER_API_URL` | `https://sv1.krouter.net/v1` |
| `KROUTER_MODEL` | `cx/gpt-5.4` |

### Bước 3: Deploy
- Railway tự nhận diện Node.js và deploy
- Copy **public domain** của Railway (VD: `saodo-backend.railway.app`)

---

## 2. Deploy Frontend lên Vercel

### Bước 1: Kết nối GitHub
1. Vào [vercel.com](https://vercel.com)
2. New Project > Import từ GitHub
3. Chọn repo `SDU-AIAF-System-main`

### Bước 2: Cấu hình
- **Root Directory**: `apps/client-react`
- **Build Command**: `npm install && npm run build`
- **Environment Variables** thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://saodo-backend.railway.app/api` |

### Bước 3: Deploy
- Vercel tự deploy sau mỗi push lên main branch
- Domain: `your-app.vercel.app`

---

## 3. Backend API URL cho Frontend

Sau khi backend deploy xong, cập nhật `NEXT_PUBLIC_API_BASE_URL` ở Vercel:
```
https://saodo-backend.railway.app/api
```

---

## Cấu trúc Production

```
Browser
  └── https://your-app.vercel.app (Vercel - Next.js)
        │
        └── https://saodo-backend.railway.app/api (Railway - Node.js)
              │
              └── https://sv1.krouter.net/v1 (KRouter AI)
              │
              └── PostgreSQL (Railway plugin)
```

---

## Database Migration

Backend dùng JSON file (SQLite) cho development.
Production nên dùng PostgreSQL. Đảm bảo:
- Plugin PostgreSQL được bật trên Railway
- `DATABASE_URL` đúng format PostgreSQL

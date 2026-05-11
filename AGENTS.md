# SDU-AI-AF System - Agent Instructions

## Project Overview

**SDU-AI-AF** (Sao Đỏ University AI Assistant Framework) là hệ thống trợ lý học tập AI cho sinh viên Trường Đại học Sao Đỏ và THPT Nguyễn Thị Duệ.

### Schools Supported
- **SDU** (Sao Đỏ) - Trường Đại học Sao Đỏ
- **NTD** (Nguyễn Thị Duệ) - Trường THPT Nguyễn Thị Duệ

## Architecture

| Path | Language | Purpose |
|------|----------|---------|
| `apps/client-react/` | TypeScript/React | Web client (Next.js 15) |
| `apps/client-react/src/lib/` | TypeScript | API clients, utilities |
| `apps/client-react/src/components/` | React/TSX | UI components |
| `apps/client-react/src/sites/` | React/TSX | School-specific pages (sdu, ntd) |
| `apps/mobile/` | React Native/Expo | Mobile app |

## Key Features

### AI Personalization
- **Student Learning Profile** - Lưu trữ thông tin học tập cá nhân
- **AI Reasoning Engine** - Suy luận dựa trên dữ liệu học sinh
- **KRouter Integration** - Kết nối GPT-5.4 qua KRouter API

### Core Modules
- Authentication với school-specific sessions
- Dashboard với personalized widgets
- Schedule management
- Document management
- Chat/AI assistant
- Health tracking (mobile)

## API Integration

Backend API: `http://localhost:9191/api`

Key endpoints:
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `GET /api/schedule` - Lịch học
- `GET /api/grades` - Điểm số
- `POST /api/ai-reasoning` - AI reasoning (mới)

## Quick Reference

```bash
# Start web client
cd apps/client-react && npm run dev

# Start mobile
cd apps/mobile && npx expo start

# Build web
cd apps/client-react && npm run build
```

## Code Style

- TypeScript strict mode
- React 19 with App Router
- Tailwind CSS for styling
- Zustand for state management
- shadcn/ui components (khi cần)

## AI Configuration

KRouter API credentials (user config):
```json
{
  "models": {
    "providers": {
      "krouter": {
        "baseUrl": "https://api.krouter.net/v1",
        "apiKey": "sk-..."
      }
    }
  }
}
```

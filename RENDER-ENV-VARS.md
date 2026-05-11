# Render Environment Variables - Quick Copy
# Copy all variables below và paste vào Render Dashboard

PORT=10000
CORS_ALLOW_ORIGIN=*

# JWT Secrets - thay bằng chuỗi ngẫu nhiên bảo mật
JWT_SECRET=saodo-jwt-secret-prod-2024-change-this
JWT_REFRESH_SECRET=saodo-refresh-secret-prod-2024-change-this

# KRouter AI Configuration
SAODO_AGENT_MODE=krouter
KROUTER_API_KEY=sk-9aa9be1d95d96de8-9es736-8a47a8a8
KROUTER_API_URL=https://api.krouter.net/v1/chat/completions
KROUTER_MODEL=cx/gpt-5.4

# Optional: Timeout cho AI requests
NEMOCLAW_TIMEOUT_MS=60000

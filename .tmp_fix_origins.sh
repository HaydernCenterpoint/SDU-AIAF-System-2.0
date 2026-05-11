#!/bin/bash
export PATH=/home/datmk/.local/bin:/home/datmk/.nvm/versions/node/v22.22.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Copy sandbox config to writable home dir
cp /sandbox/.openclaw/openclaw.json ~/.openclaw/openclaw.json 2>/dev/null || true

# Set allowed origins using openclaw config CLI
openclaw config set gateway.controlUi.allowedOrigins '["http://127.0.0.1:18800","http://localhost:18800","http://127.0.0.1:18789","http://localhost:18789"]' 2>&1

# Verify
echo "=== CURRENT allowedOrigins ==="
openclaw config get gateway.controlUi.allowedOrigins 2>&1

# Restart gateway on 18800
openclaw gateway stop 2>&1 || true
sleep 3
openclaw gateway run --port 18800 &
sleep 5
openclaw dashboard 2>&1 | grep -E "token=|Dashboard URL"
echo "=== DONE ==="

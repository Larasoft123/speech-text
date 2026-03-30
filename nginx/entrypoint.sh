#!/bin/sh
set -e

echo ""
echo "=========================================="
echo "  speech-text is running!"
echo ""
echo "  Local:  → http://localhost"

# Container network IP
CONTAINER_IP=$(hostname -i 2>/dev/null)
if [ -n "$CONTAINER_IP" ] && [ "$CONTAINER_IP" != "127.0.0.1" ]; then
  echo "  LAN:    → http://$CONTAINER_IP"
fi

# Public IP (only works on VPS with outbound internet)
if command -v wget >/dev/null 2>&1; then
  PUBLIC_IP=$(wget -qO- --timeout=2 https://api.ipify.org 2>/dev/null || true)
  if echo "$PUBLIC_IP" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
    if [ "$PUBLIC_IP" != "$CONTAINER_IP" ]; then
      echo "  Public: → http://$PUBLIC_IP"
    fi
  fi
fi

echo ""
echo "  HTTPS:  docker compose logs tunnel"
echo "          → *.trycloudflare.com URL"
echo ""
echo "=========================================="
echo ""

# Start nginx in foreground
exec nginx -g 'daemon off;'

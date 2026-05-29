#!/bin/sh
# Gera config.js em runtime para injetar a URL do backend no frontend estático.
# - Localmente (docker compose): API_GATEWAY_URL não setado → usa http://localhost:3000
# - Na AWS (ECS): Task Definition seta API_GATEWAY_URL com a Invoke URL do API Gateway.
echo "window.API_BASE_URL = '${API_GATEWAY_URL:-http://localhost:3000}';" > /app/config.js
exec serve -s . -l 8080

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker не запущен" >&2
  exit 1
fi

if [[ "${1:-}" == "down" ]]; then
  docker compose --profile quick --profile named --profile ngrok down
  exit 0
fi

if [[ $# -gt 0 ]]; then
  echo "Неизвестная команда: $1" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Нет файла .env" >&2
  exit 1
fi

echo "Собираю и поднимаю приложение"
docker compose --profile quick --profile named stop tunnel tunnel-named >/dev/null 2>&1 || true
docker compose up -d --build --wait --wait-timeout 180 app

lan=""
for iface in en0 en1; do
  lan="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
  if [[ -n "$lan" ]]; then
    break
  fi
done

echo
if [[ -n "$lan" ]]; then
  echo "В локальной сети: http://${lan}:8787"
fi

ngrok_token="$(sed -n 's/^NGROK_AUTHTOKEN=//p' .env | head -n 1 | tr -d '"' | tr -d "'")"
if [[ -z "$ngrok_token" ]]; then
  echo "Для ссылки из интернета добавьте NGROK_AUTHTOKEN в .env и снова выполните npm run deploy."
  echo "Токен: https://dashboard.ngrok.com/get-started/your-authtoken"
  exit 0
fi

docker compose --profile ngrok up -d ngrok

public_url=""
for _attempt in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  public_url="$(
    curl -fsS --max-time 2 http://127.0.0.1:4040/api/tunnels 2>/dev/null | node -e '
      let raw = "";
      process.stdin.on("data", (chunk) => {
        raw += chunk;
      });
      process.stdin.on("end", () => {
        try {
          const data = JSON.parse(raw);
          const tunnels = data.tunnels || [];
          const https = tunnels.find((item) => item.proto === "https");
          process.stdout.write((https || tunnels[0] || {}).public_url || "");
        } catch {
          process.stdout.write("");
        }
      });
    ' || true
  )"
  if [[ -n "$public_url" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$public_url" ]]; then
  echo "ngrok не получил ссылку." >&2
  docker compose logs --tail 30 ngrok 2>&1 | sed -E 's/[A-Za-z0-9]{20,}/[скрыто]/g' >&2
  exit 1
fi

echo "Из интернета: ${public_url}"
echo "На бесплатном ngrok браузер один раз просит нажать Visit Site."

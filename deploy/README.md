# Запуск

На этой машине:

```bash
npm run deploy
npm run deploy:down
```

`npm run deploy` собирает образ, поднимает MongoDB и приложение и печатает адрес. Порт `8787` открыт на всех интерфейсах. Пароль сайта не спрашивается, пока `APP_PASSWORD` в `.env` пустой. Игроки хранятся в MongoDB. При первом запуске файлы `player_*` из этой папки переносятся в базу. Первый вошедший аккаунт получает эти данные. Вход — email или логин, без пароля: новое имя создаёт аккаунт.

Из интернета сайт открывается через ngrok. В `.env` нужен `NGROK_AUTHTOKEN` с https://dashboard.ngrok.com/get-started/your-authtoken. Скрипт печатает `https://…` адрес и адрес в локальной сети. На бесплатном плане браузер один раз показывает страницу ngrok с кнопкой Visit Site.

Профили `quick` и `named` в `compose.yaml` оставляют Cloudflare Tunnel для кластера. На этой машине `npm run deploy` их не запускает.

## Кластер

Образ в манифестах — `dota-data:local`. Реестра нет. Когда появится провайдер, подменяются три вещи:

- имя образа в `deploy/k8s/deployment.yaml`
- класс диска в `deploy/k8s/pvc.yaml`
- вход: туннель `deploy/k8s/tunnel.yaml` либо Ingress из `deploy/k8s/examples/ingress.example.yaml`

Секреты — из `deploy/k8s/examples/secret.example.yaml`. В кластере origin туннеля — `http://dota-data:8787`.

Реплика одна. Обновление игрока хранится в памяти процесса. Снимки игроков — в MongoDB (`deploy/k8s/mongo.yaml`), кэш справочников — на диске.

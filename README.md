# KeyKurs Frontend

React + Vite SPA. Версия адаптирована для деплоя на Timeweb Cloud Apps (без Supabase).

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

| Переменная | Описание |
|-----------|----------|
| `VITE_API_URL` | URL бэкенда, например `https://your-api.twc1.net` |
| `VITE_VK_CLIENT_ID` | ID приложения ВКонтакте (если используется VK OAuth) |

## Локальная разработка

```bash
npm install
cp .env.example .env
# Заполните .env
npm run dev
```

## Сборка и деплой через Docker

```bash
docker build --build-arg VITE_API_URL=https://your-api.twc1.net -t keykurs-frontend .
docker run -p 80:80 keykurs-frontend
```

## Деплой на Timeweb Cloud Apps

1. Создайте приложение типа **Docker** или **Node.js**
2. Подключите этот репозиторий
3. Добавьте переменные окружения из `.env.example`
4. Timeweb автоматически пересоберёт при каждом push в main

### Проверка деплоя

После успешного деплоя проверьте:
- Главная страница: `https://keykurs.ru/`
- Информация о сборке: `https://keykurs.ru/version.html`

Если `version.html` показывает белую страницу:
1. Проверьте логи сборки в Timeweb
2. Убедитесь, что переменные окружения установлены
3. Пересоберите образ без кеша (Build Settings → Clear cache)

## Отличия от оригинала (Supabase-версии)

- `@supabase/supabase-js` удалён — все запросы идут через `src/lib/api.ts` к REST API бэкенда
- Аутентификация через JWT-токены в `localStorage` вместо Supabase sessions
- `AuthContext` переписан под JWT-логику
- `TelegramLogin` вызывает `/api/auth/telegram` вместо Supabase Edge Function
- `OAuthButtons` перенаправляет на `/api/auth/oauth` вместо Supabase Edge Function
- `FileUpload` загружает файлы через `/api/media/upload` вместо Supabase Storage SDK
- Все медиа-файлы из Telegram скачиваются в S3 на этапе импорта — `getMediaUrl` всегда возвращает S3-путь

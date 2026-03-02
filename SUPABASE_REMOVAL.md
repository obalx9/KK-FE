# Supabase Frontend Removal - Completed

## Резюме

Все прямые обращения к Supabase из фронтенда успешно удалены. Фронтенд теперь общается **только** с бэкенд API.

## Что изменено

### 1. Создан централизованный API клиент

**Файл:** `src/lib/api.ts`

Основные методы:
- `get()`, `post()`, `put()`, `patch()`, `delete()` - стандартные HTTP методы
- `uploadFile()` - загрузка файлов
- `getMediaUrl()` - получение URL медиафайлов
- `telegramAuth()` - авторизация через Telegram
- `oauthCreateSession()` - создание OAuth сессии
- `updateUserRoles()` - обновление ролей пользователя
- `generateMediaToken()` - генерация токенов для медиа
- `registerTelegramWebhook()` - регистрация Telegram webhook
- `getTelegramChats()` - получение списка чатов
- `linkTelegramChat()` / `unlinkTelegramChat()` - привязка/отвязка чатов
- `getOAuthUrl()` - получение URL для OAuth
- `getWebhookUrl()` - получение URL webhook

### 2. Supabase клиент заменен заглушкой

**Файл:** `src/lib/supabase.ts`

Теперь содержит только:
- TypeScript интерфейсы (для обратной совместимости)
- Заглушку `SupabaseStub`, которая выбрасывает ошибки при попытке использования

### 3. Обновленные компоненты

Все компоненты переведены на использование API клиента:

#### Компоненты аутентификации
- `TelegramLogin.tsx` - использует `api.telegramAuth()`
- `OAuthButtons.tsx` - использует `api.getOAuthUrl()`
- `RoleSelectionPage.tsx` - использует `api.oauthCreateSession()`
- `SellerRegistrationPage.tsx` - использует `api.updateUserRoles()`

#### Компоненты Telegram
- `TelegramBotConfig.tsx` - использует API для управления ботами и чатами

#### Медиа компоненты
- `MediaGallery.tsx` - использует `api.getMediaUrl()` и `api.generateMediaToken()`
- `MediaGroupEditor.tsx` - использует `api.patch()` и `api.getMediaUrl()`
- `CourseFeed.tsx` - использует `api.getMediaUrl()`
- `CourseEdit.tsx` - использует `api.getMediaUrl()`

## Требования к бэкенду

Бэкенд должен реализовать следующие API endpoints:

### Аутентификация
- `POST /api/auth/telegram` - авторизация через Telegram
- `POST /api/auth/oauth/create-session` - создание OAuth сессии
- `POST /api/auth/update-roles` - обновление ролей пользователя
- `GET /api/auth/oauth/vk` - OAuth VK
- `GET /api/auth/oauth/yandex` - OAuth Yandex

### Курсы и боты
- `GET /api/courses/:courseId/bot` - получить бота курса
- `POST /api/courses/:courseId/bot` - создать бота для курса
- `GET /api/telegram/bots/:botId` - получить бота по ID
- `PUT /api/telegram/bots/:botId` - обновить бота
- `DELETE /api/telegram/bots/:botId` - удалить бота

### Telegram чаты
- `GET /api/telegram/chats?bot_id=X&action=Y` - получить чаты
- `POST /api/telegram/link-chat` - привязать чат к курсу
- `DELETE /api/telegram/unlink-chat` - отвязать чат от курса
- `GET /api/telegram/main-bot-username` - получить username главного бота

### Telegram webhook
- `POST /api/telegram/register-webhook` - зарегистрировать webhook
- `POST /api/telegram/webhook` - обработчик webhook

### Медиа
- `GET /api/media/:path` - получить медиафайл
- `GET /api/media/token?file_id=X` - генерация токена доступа к медиа
- `POST /api/media/upload` - загрузка медиафайла

### Посты и медиа постов
- `PATCH /api/posts/:postId` - обновить пост
- `POST /api/post-media` - создать медиа для поста
- `DELETE /api/courses/:courseId/posts/:postId` - удалить пост

### Продавцы
- `POST /api/sellers/register` - регистрация продавца

### Админ
- `POST /api/admin/generate-link` - генерация админ-ссылки

## Переменные окружения

### Удалено из фронтенда
- ❌ `VITE_SUPABASE_URL`
- ❌ `VITE_SUPABASE_ANON_KEY`

### Добавлено
- ✅ `VITE_API_URL` - URL бэкенд API (по умолчанию: `http://localhost:3000`)
- ✅ `VITE_VK_CLIENT_ID` - VK OAuth Client ID (опционально)

## Проверка

Убедитесь, что:

```bash
# Не должно быть ссылок на VITE_SUPABASE_*
grep -r "import.meta.env.VITE_SUPABASE_" src/
# Результат: (пусто)

# Не должно быть прямого импорта supabase-js
grep -r "from '@supabase/supabase-js'" src/
# Результат: (пусто)

# Все компоненты используют api клиент
grep -r "from.*lib/api" src/ -l | wc -l
# Результат: 11+ файлов
```

## Следующие шаги

1. **Реализовать все API endpoints в бэкенде** согласно списку выше
2. **Настроить переменные окружения:**
   - `.env.local` для разработки
   - `.env.production` для продакшена
3. **Протестировать все функции:**
   - Авторизация через Telegram
   - OAuth (VK, Yandex)
   - Управление ботами
   - Загрузка и отображение медиа
   - Создание и редактирование постов

## Архитектурные преимущества

✅ **Единая точка входа** - все HTTP запросы через `api` клиент
✅ **Централизованная аутентификация** - токены управляются в одном месте
✅ **Безопасность** - секреты и ключи не экспонируются на фронтенде
✅ **Гибкость** - легко сменить бэкенд или добавить новые endpoints
✅ **Типобезопасность** - TypeScript интерфейсы для всех API вызовов
✅ **Удобство разработки** - четкое разделение фронтенда и бэкенда

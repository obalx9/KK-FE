import { useState } from 'react';
import { Check, Copy, ChevronDown, ChevronRight, Terminal, Database, Cloud, Server, Globe, MessageCircle, Shield, AlertTriangle } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

function CodeBlock({ code, lang = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-gray-700">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400 font-mono">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <pre className="bg-gray-900 p-4 overflow-x-auto text-sm text-gray-200 font-mono leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Step({ number, title, icon, children, defaultOpen = false }: StepProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 bg-gray-800/50 hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Шаг {number}</span>
          </div>
          <h3 className="text-white font-semibold text-lg leading-tight">{title}</h3>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>
      {open && (
        <div className="px-6 py-6 bg-gray-900/50 space-y-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-300 leading-relaxed">{children}</p>;
}

function H4({ children }: { children: React.ReactNode }) {
  return <h4 className="text-white font-semibold mt-5 mb-2">{children}</h4>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-amber-200 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-teal-400" />
      </div>
      <span className="text-gray-300 text-sm leading-relaxed">{children}</span>
    </li>
  );
}

const envBackend = `DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your_very_long_random_secret_at_least_64_chars
S3_ENDPOINT=https://s3.twcstorage.ru
S3_REGION=ru-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
APP_URL=https://your-frontend.twc1.net
BACKEND_URL=https://your-backend.twc1.net
VK_CLIENT_ID=your_vk_client_id
VK_CLIENT_SECRET=your_vk_client_secret
YANDEX_CLIENT_ID=your_yandex_client_id
YANDEX_CLIENT_SECRET=your_yandex_client_secret
PORT=3000`;

const envFrontend = `VITE_API_URL=https://your-backend.twc1.net
VITE_VK_CLIENT_ID=your_vk_client_id`;

const setWebhookCmd = `curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://your-backend.twc1.net/api/webhook/{BOT_ID}"}'`;

const schemaApply = `psql $DATABASE_URL -f deploy/backend/database/schema.sql`;

const insertSuperAdmin = `-- 1. Создаём пользователя (заполни свой telegram_id)
INSERT INTO users (telegram_id, first_name, telegram_username)
VALUES (YOUR_TELEGRAM_ID, 'Admin', 'yourusername')
ON CONFLICT (telegram_id) DO NOTHING;

-- 2. Назначаем роль super_admin
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin' FROM users WHERE telegram_id = YOUR_TELEGRAM_ID
ON CONFLICT DO NOTHING;

-- 3. Добавляем основного бота для авторизации
INSERT INTO telegram_main_bot (bot_token, bot_username, is_active)
VALUES ('YOUR_BOT_TOKEN', 'yourbotusername', true);`;

const generateJwtSecret = `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`;

export default function DeployPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6">
            <Server className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-teal-300 font-medium">Инструкция по деплою</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Деплой на Timeweb Cloud
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Пошаговое руководство по переносу платформы KeyKurs с Supabase на Timeweb Cloud Apps, DBaaS и Object Storage
          </p>
        </div>

        <div className="mb-10 p-6 bg-gray-800/40 border border-gray-700 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            Что вам понадобится
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            <CheckItem>Аккаунт на Timeweb Cloud (timeweb.cloud)</CheckItem>
            <CheckItem>Два GitHub-репозитория (frontend и backend)</CheckItem>
            <CheckItem>Telegram-бот для авторизации пользователей</CheckItem>
            <CheckItem>Приложение VK ID (для VK OAuth)</CheckItem>
            <CheckItem>Приложение Яндекс OAuth (для Яндекс OAuth)</CheckItem>
            <CheckItem>Исходный код из папки deploy/ данного проекта</CheckItem>
          </ul>
        </div>

        <div className="space-y-4">

          <Step number={1} title="PostgreSQL — создание базы данных" icon={<Database className="w-5 h-5" />} defaultOpen={true}>
            <P>В Timeweb Cloud перейдите в раздел <strong className="text-white">DBaaS</strong> и создайте новый кластер PostgreSQL. Выберите версию 15 или 16.</P>
            <H4>После создания кластера:</H4>
            <P>Скопируйте строку подключения вида <code className="bg-gray-800 px-1.5 py-0.5 rounded text-teal-300 text-sm">postgres://user:pass@host:5432/dbname</code></P>
            <H4>Применение схемы базы данных:</H4>
            <CodeBlock code={schemaApply} />
            <Note>Схема находится в <code>deploy/backend/database/schema.sql</code>. Запустите этот файл один раз после создания базы. Повторный запуск безопасен.</Note>
            <H4>Создание первого суперадмина:</H4>
            <CodeBlock code={insertSuperAdmin} lang="sql" />
          </Step>

          <Step number={2} title="S3-хранилище — Object Storage" icon={<Cloud className="w-5 h-5" />}>
            <P>В Timeweb Cloud перейдите в раздел <strong className="text-white">Object Storage</strong> и создайте новый бакет.</P>
            <H4>Настройки бакета:</H4>
            <ul className="space-y-2 ml-4">
              <CheckItem>Имя бакета: например <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">keykurs-media</code></CheckItem>
              <CheckItem>Тип доступа: <strong className="text-white">Приватный</strong> — доступ через API, не напрямую</CheckItem>
            </ul>
            <H4>CORS настройки бакета:</H4>
            <P>В настройках бакета добавьте CORS-правило для разрешения запросов с вашего фронтенда.</P>
            <CodeBlock code={`[
  {
    "AllowedOrigins": ["https://your-frontend.twc1.net"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]`} lang="json" />
            <H4>Получение ключей доступа:</H4>
            <P>В разделе <strong className="text-white">Object Storage → Ключи доступа</strong> создайте новую пару ключей. Сохраните Access Key и Secret Key — они понадобятся для бэкенда.</P>
          </Step>

          <Step number={3} title="Бэкенд — деплой Express.js сервера" icon={<Server className="w-5 h-5" />}>
            <P>Код бэкенда находится в папке <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">deploy/backend/</code>. Создайте отдельный GitHub-репозиторий и скопируйте туда содержимое этой папки (корень репо = корень backend/).</P>

            <H4>Шаги в Timeweb Cloud Apps:</H4>
            <ul className="space-y-2 ml-4">
              <CheckItem>Создайте новое приложение типа <strong className="text-white">Docker</strong></CheckItem>
              <CheckItem>Подключите ваш GitHub-репозиторий с бэкендом</CheckItem>
              <CheckItem>Timeweb автоматически найдёт Dockerfile и соберёт контейнер</CheckItem>
              <CheckItem>Задайте переменные окружения (см. ниже)</CheckItem>
            </ul>

            <H4>Переменные окружения бэкенда:</H4>
            <CodeBlock code={envBackend} lang=".env" />

            <H4>Генерация JWT_SECRET:</H4>
            <CodeBlock code={generateJwtSecret} />
            <Note>
              JWT_SECRET должен быть длинной случайной строкой. Никогда не передавайте его в frontend и не публикуйте в репозитории.
            </Note>

            <H4>Проверка работы:</H4>
            <CodeBlock code={`curl https://your-backend.twc1.net/health
# Ожидаемый ответ: {"ok":true,"ts":"2026-..."}
`} />
          </Step>

          <Step number={4} title="Фронтенд — деплой React SPA" icon={<Globe className="w-5 h-5" />}>
            <P>Код фронтенда находится в папке <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">deploy/frontend/</code>. Создайте отдельный GitHub-репозиторий и скопируйте туда содержимое этой папки.</P>

            <H4>Шаги в Timeweb Cloud Apps:</H4>
            <ul className="space-y-2 ml-4">
              <CheckItem>Создайте новое приложение типа <strong className="text-white">Docker</strong></CheckItem>
              <CheckItem>Подключите GitHub-репозиторий с фронтендом</CheckItem>
              <CheckItem>Задайте переменные окружения (см. ниже)</CheckItem>
            </ul>

            <H4>Переменные окружения фронтенда:</H4>
            <CodeBlock code={envFrontend} lang=".env" />

            <Note>
              Переменные VITE_* встраиваются в сборку на этапе docker build. Задайте их как build-аргументы в настройках Timeweb Apps или передайте через Dockerfile ARG.
            </Note>
          </Step>

          <Step number={5} title="Telegram — регистрация webhook" icon={<MessageCircle className="w-5 h-5" />}>
            <P>Для каждого Telegram-бота нужно зарегистрировать webhook, чтобы Telegram отправлял обновления на ваш бэкенд.</P>

            <H4>Получение BOT_ID:</H4>
            <P>После деплоя бэкенда и применения схемы БД, найдите ID бота в таблице <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">telegram_bots</code>:</P>
            <CodeBlock code={`SELECT id, bot_username FROM telegram_bots;`} lang="sql" />

            <H4>Регистрация webhook:</H4>
            <CodeBlock code={setWebhookCmd} />

            <Note>
              Замените {'{BOT_TOKEN}'} на токен бота из BotFather, а {'{BOT_ID}'} на UUID из таблицы telegram_bots. Webhook URL должен быть HTTPS.
            </Note>

            <H4>Проверка webhook:</H4>
            <CodeBlock code={`curl "https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"`} />

            <H4>Ключевое отличие от Supabase-версии:</H4>
            <P>При получении медиафайла через webhook, бэкенд <strong className="text-white">немедленно скачивает файл из Telegram и загружает его в S3</strong>. В базу данных сохраняется <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">storage_path</code>, а не <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">telegram_file_id</code>. Это делает платформу независимой от Telegram: файлы хранятся постоянно в S3 и не исчезнут.</P>
          </Step>

          <Step number={6} title="OAuth — обновление Redirect URI" icon={<Shield className="w-5 h-5" />}>
            <H4>ВКонтакте (VK ID):</H4>
            <P>В кабинете разработчика VK перейдите в настройки вашего приложения и обновите Redirect URI:</P>
            <CodeBlock code={`https://your-backend.twc1.net/api/auth/oauth/callback?provider=vk`} lang="URI" />

            <H4>Яндекс OAuth:</H4>
            <P>В OAuth-приложении Яндекса обновите Callback URI:</P>
            <CodeBlock code={`https://your-backend.twc1.net/api/auth/oauth/callback?provider=yandex`} lang="URI" />

            <Note>
              OAuth callback всегда указывает на бэкенд, а не на фронтенд. После успешной авторизации бэкенд перенаправит пользователя на фронтенд с параметром user_id.
            </Note>
          </Step>

          <Step number={7} title="Миграция существующих медиафайлов" icon={<Terminal className="w-5 h-5" />}>
            <P>Если вы переносите данные из работающей Supabase-инсталляции, в базе могут остаться старые записи с <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">telegram_file_id</code> вместо <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">storage_path</code>. Для их миграции используйте скрипт:</P>
            <CodeBlock code={`# Установите зависимости бэкенда
cd deploy/backend && npm install

# Задайте переменные окружения
export DATABASE_URL="postgres://..."
export S3_ENDPOINT="https://s3.twcstorage.ru"
export S3_BUCKET="keykurs-media"
export S3_ACCESS_KEY="..."
export S3_SECRET_KEY="..."

# Запустите миграцию
npx ts-node scripts/migrate-media.ts`} />
            <Note>
              Скрипт скачает файлы из Telegram и загрузит в S3. Telegram хранит файлы ограниченное время — запустите миграцию как можно скорее после переезда. Файлы &gt;20 MB недоступны через Bot API — они будут помечены как ошибка.
            </Note>
          </Step>

        </div>

        <div className="mt-12 p-6 bg-gray-800/40 border border-teal-500/30 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Check className="w-6 h-6 text-teal-400" />
            Чеклист финальной проверки
          </h2>
          <ul className="space-y-3">
            <CheckItem>Бэкенд отвечает на <code className="bg-gray-800 px-1.5 rounded text-teal-300 text-xs">/health</code> со статусом 200</CheckItem>
            <CheckItem>Схема БД применена, таблицы созданы</CheckItem>
            <CheckItem>Суперадмин создан в таблицах users + user_roles</CheckItem>
            <CheckItem>Telegram main bot добавлен в таблицу telegram_main_bot</CheckItem>
            <CheckItem>Telegram-виджет на странице входа отображает кнопку авторизации</CheckItem>
            <CheckItem>VK и Яндекс OAuth перенаправляют на бэкенд и возвращают пользователя</CheckItem>
            <CheckItem>Webhook Telegram зарегистрирован и проверен через getWebhookInfo</CheckItem>
            <CheckItem>При пересылке медиа боту файл скачивается в S3 (проверьте в бакете)</CheckItem>
            <CheckItem>Видео воспроизводится со стримингом (Range-запросы из S3)</CheckItem>
            <CheckItem>Загрузка файлов вручную через интерфейс работает и файлы появляются в S3</CheckItem>
            <CheckItem>CORS настроен: фронтенд может делать запросы к бэкенду</CheckItem>
            <CheckItem>HTTPS работает на обоих сервисах (Timeweb выдаёт сертификаты автоматически)</CheckItem>
          </ul>
        </div>

        <p className="text-center text-gray-600 text-sm mt-12">
          KeyKurs Deploy Guide — Timeweb Cloud Edition
        </p>
      </div>
    </div>
  );
}

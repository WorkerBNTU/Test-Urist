# Юрист CRM — Прототип

Веб-приложение для юриста: управление клиентами, статусы дел, счётчики и Telegram-уведомления.

## Функции

- Таблица клиентов (имя, телефон, статус, дата)
- Добавление нового клиента
- Изменение статуса: **Новый** → **В работе** → **Закрыт**
- Счётчики по каждому статусу + общее количество
- Telegram-уведомление при добавлении клиента

## Стек

- **Frontend:** React + Vite + TypeScript
- **База данных:** Supabase (PostgreSQL)
- **Уведомления:** Telegram Bot API (Vercel Serverless Function)
- **Деплой:** Vercel

---

## Быстрый старт (локально)

### 1. Установка

```bash
npm install
```

### 2. Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в **SQL Editor** и выполните содержимое файла `supabase/schema.sql`
3. Скопируйте **Project URL** и **anon public key** из Settings → API

### 3. Telegram-бот

1. Напишите [@BotFather](https://t.me/BotFather) → `/newbot` → получите **токен бота**
2. Напишите своему боту `/start` (обязательно!)
3. Откройте `https://api.telegram.org/bot<TOKEN>/getUpdates` — найдите `"chat":{"id": ...}` — это ваш **chat_id**

### 4. Edge Function для Telegram (обязательно для уведомлений)

Уведомления отправляются через **Supabase Edge Function** в облаке (локально Telegram API часто недоступен).

```bash
npx supabase login
npx supabase link --project-ref ВАШ_PROJECT_REF
npx supabase secrets set TELEGRAM_BOT_TOKEN=ваш_токен TELEGRAM_CHAT_ID=ваш_chat_id
npx supabase functions deploy notify-telegram
```

`PROJECT_REF` — это часть URL: `https://XXXX.supabase.co` → `XXXX`.

Либо через Dashboard: **Edge Functions → Deploy new** → код из `supabase/functions/notify-telegram/index.ts` → **Secrets** добавить `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.

### 5. Переменные окружения

```bash
cp .env.example .env
```

Заполните `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
```

> `TELEGRAM_*` в `.env` нужны для локального `/api/notify` (запасной путь). Основной путь — Edge Function с секретами в Supabase.

### 6. Запуск

```bash
npm run dev
```

Откройте http://localhost:5173

---

## Деплой на Vercel

1. Загрузите проект на GitHub (или подключите напрямую)
2. Импортируйте репозиторий на [vercel.com](https://vercel.com)
3. Framework Preset: **Vite** (определяется автоматически)
4. В **Environment Variables** добавьте все 4 переменные из `.env.example`
5. Deploy

Vercel автоматически соберёт Vite-проект и подхватит `api/notify.js` как serverless-функцию. Файл `vercel.json` не нужен.

---

## Структура проекта

```
├── api/
│   └── notify.js          # Telegram webhook (Vercel)
├── src/
│   ├── components/        # UI-компоненты
│   ├── lib/supabase.ts    # CRUD операции
│   ├── App.tsx            # Главная страница
│   └── types.ts           # Типы и статусы
├── supabase/
│   └── schema.sql         # SQL-схема
└── .env.example
```

---

## Что нужно предоставить

| Переменная | Где взять |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `TELEGRAM_BOT_TOKEN` | @BotFather после создания бота |
| `TELEGRAM_CHAT_ID` | getUpdates после сообщения боту |

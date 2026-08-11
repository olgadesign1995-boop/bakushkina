import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadPayload = {
  name?: unknown;
  contact?: unknown;
  message?: unknown;
  /** honeypot — реальные люди его не заполняют */
  company?: unknown;
};

function asText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Простейший in-memory лимит: защищает от случайного спама одного клиента. */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, code: "bad_request", error: "Не удалось прочитать данные формы." },
      { status: 400 },
    );
  }

  // Honeypot: тихо отвечаем ошибкой валидации, ничего не отправляя.
  if (asText(payload.company, 100)) {
    return NextResponse.json(
      { ok: false, code: "invalid", error: "Проверьте поля формы." },
      { status: 400 },
    );
  }

  const name = asText(payload.name, 120);
  const contact = asText(payload.contact, 200);
  const message = asText(payload.message, 2000);

  if (contact.length < 3) {
    return NextResponse.json(
      { ok: false, code: "invalid", error: "Укажите контакт, куда ответить." },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate_limited",
        error: "Слишком много отправок подряд. Попробуйте через минуту.",
      },
      { status: 429 },
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Честность: без серверных ключей никакого «успешно отправлено».
  if (!token || !chatId) {
    return NextResponse.json(
      {
        ok: false,
        code: "not_configured",
        error:
          "Приём заявок ещё не подключён. Напишите напрямую — контакты указаны на странице.",
      },
      { status: 503 },
    );
  }

  const text = [
    "Новая заявка с сайта",
    name && `Имя: ${name}`,
    `Контакт: ${contact}`,
    message && `Сообщение: ${message}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: "delivery_failed",
          error:
            "Не получилось доставить заявку. Напишите напрямую — контакты указаны на странице.",
        },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "delivery_failed",
        error:
          "Сеть недоступна, заявка не ушла. Напишите напрямую — контакты указаны на странице.",
      },
      { status: 502 },
    );
  }

  // Успех только после подтверждения от сервера Telegram.
  return NextResponse.json({ ok: true });
}

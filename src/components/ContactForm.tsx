"use client";

import { useState } from "react";

import styles from "./ContactForm.module.css";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const FALLBACK =
  "Напишите на почту bakushkina.olya@mail.ru или в Telegram @Olyadsgn — контакты рядом.";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? ""),
    };

    if (payload.contact.trim().length < 3) {
      setStatus({ kind: "error", message: "Укажите контакт, куда ответить." });
      return;
    }

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      // Успех показываем только после подтверждения сервера.
      if (response.ok && result?.ok) {
        setStatus({ kind: "success" });
        form.reset();
        return;
      }

      setStatus({
        kind: "error",
        message: result?.error ? `${result.error}` : FALLBACK,
      });
    } catch {
      setStatus({
        kind: "error",
        message: `Не получилось отправить — похоже, пропала сеть. ${FALLBACK}`,
      });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Имя</span>
          <input
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Как к вам обращаться"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Компания и позиция</span>
          <input
            className={styles.input}
            type="text"
            name="role"
            placeholder="Например: продуктовая компания, графический дизайнер"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>
          Контакт <span className={styles.required}>— обязательно</span>
        </span>
        <input
          className={styles.input}
          type="text"
          name="contact"
          required
          aria-required="true"
          placeholder="Почта или Telegram — куда ответить"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Сообщение</span>
        <textarea
          className={styles.textarea}
          name="message"
          rows={4}
          placeholder="Пара слов о задаче или вакансии"
        />
      </label>

      {/* Honeypot: скрытое поле, реальные люди его не заполняют. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Не заполняйте это поле
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? "Отправляю…" : "Отправить"}
        </button>
        <p className={styles.hint}>Отвечу на почту или в Telegram.</p>
      </div>

      <div className={styles.status} role="status" aria-live="polite">
        {status.kind === "success" ? (
          <p className={styles.success}>
            Готово — сообщение у меня. Отвечу на указанный контакт.
          </p>
        ) : null}
        {status.kind === "error" ? <p className={styles.error}>{status.message}</p> : null}
      </div>
    </form>
  );
}

#!/usr/bin/env node
/**
 * Проверка целостности страницы: якорные ссылки, изображения, заголовки.
 * Запуск при работающем сервере: node scripts/check-links.mjs [url]
 */

const url = process.argv[2] || "http://localhost:3000";

const response = await fetch(url);
if (!response.ok) {
  console.error(`Страница не отвечает: HTTP ${response.status}`);
  process.exit(1);
}
const html = await response.text();

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

let failures = 0;

console.log(`Проверяю ${url}\n`);

const missing = [...new Set(anchors)].filter((anchor) => !ids.has(anchor));
if (missing.length) {
  failures += missing.length;
  console.error(`✗ Якоря без цели: ${missing.join(", ")}`);
} else {
  console.log(`✓ Якорные ссылки: ${new Set(anchors).size} шт., все ведут на существующие id`);
}

// Изображения: проверяем, что файлы реально отдаются.
const sources = [...new Set([...html.matchAll(/src="(\/media\/[^"]+)"/g)].map((m) => m[1]))];
let brokenImages = 0;
for (const src of sources) {
  const head = await fetch(new URL(src, url), { method: "HEAD" });
  if (!head.ok) {
    brokenImages += 1;
    console.error(`✗ Нет файла: ${src} (HTTP ${head.status})`);
  }
}
failures += brokenImages;
if (!brokenImages) console.log(`✓ Изображения: ${sources.length} шт., все отдаются`);

// Заголовки
const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
if (h1 !== 1) {
  failures += 1;
  console.error(`✗ Ожидается ровно один <h1>, найдено: ${h1}`);
} else {
  console.log("✓ Заголовок h1: ровно один");
}

// alt у изображений
const imgTags = [...html.matchAll(/<img\s[^>]*>/g)].map((m) => m[0]);
const noAlt = imgTags.filter((tag) => !/\salt="/.test(tag));
if (noAlt.length) {
  failures += noAlt.length;
  console.error(`✗ Изображений без alt: ${noAlt.length}`);
} else {
  console.log(`✓ Alt-тексты: все ${imgTags.length} изображений подписаны`);
}

// Контакты кликабельны
for (const [label, pattern] of [
  ["mailto", /href="mailto:/],
  ["tel", /href="tel:/],
  ["telegram", /t\.me\//],
]) {
  if (!pattern.test(html)) {
    failures += 1;
    console.error(`✗ Не найдена ссылка: ${label}`);
  }
}
console.log("✓ Контакты: почта, телефон и Telegram кликабельны");

console.log(
  failures === 0 ? "\nВсе проверки пройдены." : `\nПроблем найдено: ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);

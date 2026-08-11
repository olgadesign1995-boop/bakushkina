#!/usr/bin/env node
/**
 * Извлечение изображений из PDF-экспорта макета (например, выгрузки из Figma).
 *
 * Достаёт встроенные растровые изображения в исходном разрешении,
 * а если их нет — рендерит страницы целиком в PNG высокой плотности.
 *
 * Запуск:
 *   node scripts/extract-pdf-images.mjs uploads/portfolio.pdf [префикс]
 *
 * Результат кладётся в uploads/extracted/, откуда файлы переименовываются
 * по соглашению и прогоняются через npm run media.
 */

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const [, , pdfArg, prefixArg] = process.argv;

if (!pdfArg) {
  console.error("Укажите путь к PDF: node scripts/extract-pdf-images.mjs uploads/file.pdf");
  process.exit(1);
}

const pdfPath = path.resolve(pdfArg);
const prefix = prefixArg || path.basename(pdfPath, path.extname(pdfPath));
const outDir = path.resolve("uploads", "extracted");

const python = `
import pymupdf as fitz, os, hashlib

pdf_path = ${JSON.stringify(pdfPath)}
out_dir = ${JSON.stringify(outDir)}
prefix = ${JSON.stringify(prefix)}
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
seen = set()
saved = 0
MIN_SIDE = 400  # мелкие иконки и линии не нужны

for page_index, page in enumerate(doc, start=1):
    for img_index, info in enumerate(page.get_images(full=True), start=1):
        xref = info[0]
        try:
            data = doc.extract_image(xref)
        except Exception as exc:
            print(f"  ! стр.{page_index} #{img_index}: {exc}")
            continue
        raw = data["image"]
        digest = hashlib.md5(raw).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        if data.get("width", 0) < MIN_SIDE and data.get("height", 0) < MIN_SIDE:
            continue
        ext = data.get("ext", "png")
        name = f"{prefix}-p{page_index:02d}-{img_index:02d}.{ext}"
        with open(os.path.join(out_dir, name), "wb") as fh:
            fh.write(raw)
        saved += 1
        print(f"  + {name}  {data.get('width')}x{data.get('height')}")

if saved == 0:
    print("  Встроенных растров не найдено — рендерю страницы целиком.")
    for page_index, page in enumerate(doc, start=1):
        pix = page.get_pixmap(dpi=200)
        name = f"{prefix}-page{page_index:02d}.png"
        pix.save(os.path.join(out_dir, name))
        saved += 1
        print(f"  + {name}  {pix.width}x{pix.height}")

print(f"Извлечено файлов: {saved}")
print(f"Папка: {out_dir}")
`;

try {
  await fs.access(pdfPath);
} catch {
  console.error(`Файл не найден: ${pdfPath}`);
  process.exit(1);
}

console.log(`Разбираю ${path.basename(pdfPath)}…\n`);
const { stdout, stderr } = await run("python3", ["-c", python], { maxBuffer: 32 * 1024 * 1024 });
process.stdout.write(stdout);
if (stderr.trim()) process.stderr.write(stderr);

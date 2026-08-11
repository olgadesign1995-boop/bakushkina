#!/usr/bin/env node
/**
 * Подготовка медиа для сайта-портфолио.
 *
 * Читает оригиналы из uploads/ и раскладывает оптимизированные версии
 * в public/media/<проект>/, попутно записывая манифест с размерами —
 * он нужен, чтобы страница не «прыгала» во время загрузки.
 *
 * Запуск:  npm run media
 *
 * Соглашение об именах файлов:
 *   <проект>-cover.<ext>          → обложка проекта
 *   <проект>-NN-<описание>.<ext>  → кадр внутри проекта
 *   <проект>-loop-<описание>.mp4  → короткая беззвучная петля
 *   portret.jpg, logo.svg         → служебные, попадают в public/media/common
 */

import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "uploads");
const OUTPUT_DIR = path.join(ROOT, "public", "media");
const MANIFEST = path.join(ROOT, "src", "data", "media-manifest.json");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".gif"]);
const PASSTHROUGH_EXT = new Set([".svg"]);

/** Ширины по назначению кадра. */
const WIDTH_PRESETS = {
  cover: [1200, 800, 480],
  frame: [1600, 1200, 800],
  portrait: [800, 560, 400],
  poster: [1200, 800],
};

function classify(baseName) {
  if (/-cover$/i.test(baseName)) return "cover";
  if (/^portret|^portrait|^avatar/i.test(baseName)) return "portrait";
  return "frame";
}

/** Имя проекта = префикс до первого дефиса. */
function projectOf(baseName) {
  const [prefix] = baseName.split("-");
  if (!prefix || /^(portret|portrait|avatar|logo)$/i.test(baseName)) return "common";
  return prefix.toLowerCase();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listSources() {
  try {
    const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function processImage(fileName, results) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const project = projectOf(base);
  const kind = classify(base);
  const outDir = path.join(OUTPUT_DIR, project);
  await ensureDir(outDir);

  const input = path.join(SOURCE_DIR, fileName);
  const image = sharp(input, { failOn: "none" });
  const meta = await image.metadata();
  const sourceWidth = meta.width ?? 0;
  const sourceHeight = meta.height ?? 0;

  if (sourceWidth < 900) {
    console.warn(
      `  ! ${fileName}: ширина ${sourceWidth}px — маловато, на крупном экране будет мылить`,
    );
  }

  const widths = WIDTH_PRESETS[kind].filter((w) => w <= sourceWidth);
  if (widths.length === 0) widths.push(sourceWidth);

  const variants = [];

  for (const width of widths) {
    const resized = sharp(input, { failOn: "none" }).resize({
      width,
      withoutEnlargement: true,
    });

    const avifName = `${base}-${width}.avif`;
    const webpName = `${base}-${width}.webp`;
    const jpgName = `${base}-${width}.jpg`;

    await resized.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(outDir, avifName));
    await resized.clone().webp({ quality: 78 }).toFile(path.join(outDir, webpName));
    await resized
      .clone()
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(outDir, jpgName));

    variants.push({
      width,
      avif: `/media/${project}/${avifName}`,
      webp: `/media/${project}/${webpName}`,
      jpg: `/media/${project}/${jpgName}`,
    });
  }

  results.images.push({
    id: base,
    project,
    kind,
    width: sourceWidth,
    height: sourceHeight,
    aspectRatio: sourceHeight ? +(sourceWidth / sourceHeight).toFixed(4) : null,
    variants: variants.sort((a, b) => b.width - a.width),
  });

  console.log(`  ✓ ${fileName} → ${variants.length} размера × 3 формата (${project})`);
}

async function processVideo(fileName, results) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const project = projectOf(base);
  const isLoop = /-loop(-|$)/i.test(base);
  const outDir = path.join(OUTPUT_DIR, project);
  await ensureDir(outDir);

  const input = path.join(SOURCE_DIR, fileName);
  const mp4Out = path.join(outDir, `${base}.mp4`);
  const webmOut = path.join(outDir, `${base}.webm`);
  const posterRaw = path.join(outDir, `${base}-poster-src.png`);

  // Чётные размеры обязательны для H.264.
  const scale = "scale='min(1600,iw)':-2";

  const mp4Args = [
    "-y",
    "-i",
    input,
    "-vf",
    scale,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-crf",
    "24",
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  ];
  // Петля идёт без звука: браузеры разрешают автоплей только беззвучному видео.
  mp4Args.push(...(isLoop ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"]));
  mp4Args.push(mp4Out);

  const webmArgs = [
    "-y",
    "-i",
    input,
    "-vf",
    scale,
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "34",
    "-b:v",
    "0",
    "-row-mt",
    "1",
  ];
  webmArgs.push(...(isLoop ? ["-an"] : ["-c:a", "libopus", "-b:a", "96k"]));
  webmArgs.push(webmOut);

  console.log(`  … ${fileName}: кодирую MP4`);
  await run(ffmpegPath, mp4Args);
  console.log(`  … ${fileName}: кодирую WebM`);
  await run(ffmpegPath, webmArgs);

  // Постер: кадр на первой секунде.
  await run(ffmpegPath, ["-y", "-i", input, "-ss", "00:00:01", "-frames:v", "1", posterRaw]);

  const posterMeta = await sharp(posterRaw).metadata();
  const posterVariants = [];
  for (const width of WIDTH_PRESETS.poster.filter((w) => w <= (posterMeta.width ?? 0))) {
    const avifName = `${base}-poster-${width}.avif`;
    const webpName = `${base}-poster-${width}.webp`;
    const resized = sharp(posterRaw).resize({ width, withoutEnlargement: true });
    await resized.clone().avif({ quality: 55, effort: 4 }).toFile(path.join(outDir, avifName));
    await resized.clone().webp({ quality: 78 }).toFile(path.join(outDir, webpName));
    posterVariants.push({
      width,
      avif: `/media/${project}/${avifName}`,
      webp: `/media/${project}/${webpName}`,
    });
  }
  await fs.rm(posterRaw, { force: true });

  const [mp4Stat, webmStat] = await Promise.all([fs.stat(mp4Out), fs.stat(webmOut)]);

  results.videos.push({
    id: base,
    project,
    mode: isLoop ? "loop" : "player",
    width: posterMeta.width ?? null,
    height: posterMeta.height ?? null,
    aspectRatio:
      posterMeta.width && posterMeta.height
        ? +(posterMeta.width / posterMeta.height).toFixed(4)
        : null,
    mp4: `/media/${project}/${base}.mp4`,
    webm: `/media/${project}/${base}.webm`,
    poster: posterVariants.sort((a, b) => b.width - a.width),
  });

  console.log(
    `  ✓ ${fileName} → mp4 ${(mp4Stat.size / 1024).toFixed(0)} КБ, webm ${(
      webmStat.size / 1024
    ).toFixed(0)} КБ, режим: ${isLoop ? "петля" : "плеер"}`,
  );
}

async function processPassthrough(fileName, results) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const project = projectOf(base);
  const outDir = path.join(OUTPUT_DIR, project);
  await ensureDir(outDir);
  await fs.copyFile(path.join(SOURCE_DIR, fileName), path.join(outDir, fileName));
  results.vectors.push({ id: base, project, src: `/media/${project}/${fileName}` });
  console.log(`  ✓ ${fileName} → скопирован как есть`);
}

async function main() {
  const files = await listSources();
  const media = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext) || PASSTHROUGH_EXT.has(ext);
  });

  if (media.length === 0) {
    console.log("В uploads/ нет медиафайлов — нечего готовить.");
    return;
  }

  console.log(`Найдено файлов: ${media.length}\n`);
  await ensureDir(OUTPUT_DIR);

  const results = { generatedAt: new Date().toISOString(), images: [], videos: [], vectors: [] };

  for (const fileName of media.sort()) {
    const ext = path.extname(fileName).toLowerCase();
    try {
      if (IMAGE_EXT.has(ext)) await processImage(fileName, results);
      else if (VIDEO_EXT.has(ext)) await processVideo(fileName, results);
      else if (PASSTHROUGH_EXT.has(ext)) await processPassthrough(fileName, results);
    } catch (error) {
      console.error(`  ✗ ${fileName}: ${error.message}`);
    }
  }

  await ensureDir(path.dirname(MANIFEST));
  await fs.writeFile(MANIFEST, `${JSON.stringify(results, null, 2)}\n`);

  console.log(
    `\nГотово: ${results.images.length} изображений, ${results.videos.length} видео, ${results.vectors.length} векторов.`,
  );
  console.log(`Манифест: ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { chromium } from "playwright";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";

// Record the actual production UI, with its full effects and real interactions.
// No changes to effect settings, shader quality, or animation timing are made.
const root = resolve(import.meta.dirname, "..");
const temporary = resolve(root, "test-results/walkthrough");
const output = resolve(root, "public/films/portfolio-walkthrough.mp4");
mkdirSync(temporary, { recursive: true });
mkdirSync(resolve(root, "public/films"), { recursive: true });
const port = 4176;
const url = `http://127.0.0.1:${port}/mzazimhengaportifolio/`;
const server = spawn(
  process.execPath,
  [
    resolve(root, "node_modules/vite/bin/vite.js"),
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
    "--base=/mzazimhengaportifolio/",
  ],
  { cwd: root, stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {}
    await delay(100);
  }
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  // Warm the shader cache so the recording starts with the finished interface.
  const warm = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  await warm.goto(url);
  await warm
    .locator('.spatial-scene[data-scene-state="ready"]')
    .waitFor({ timeout: 45000 });
  await warm.waitForTimeout(1500);
  await warm.close();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: temporary,
      size: { width: 1920, height: 1080 },
      fps: 30,
    },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.text().startsWith("Walkthrough:")) console.log(message.text());
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator('.spatial-scene[data-scene-state="ready"]')
    .waitFor({ timeout: 45000 });
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }),
    ),
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
  const started = performance.now();
  console.log("Walkthrough: recording the full-quality 90-second tour.");
  const scroll = page.evaluate(async () => {
    const top = (selector) => {
      let element = document.querySelector(selector),
        sum = 0;
      while (element) {
        sum += element.offsetTop;
        element = element.offsetParent;
      }
      return sum;
    };
    const centered = (selector) =>
      top(selector) +
      (document.querySelector(selector).offsetHeight - innerHeight) / 2;
    const hero = document.querySelector("#home");
    const story = document.querySelector(".project-journey");
    const span = story.offsetHeight - innerHeight;
    const scene = (p) => top(".project-journey") + span * p;
    const reel = (hero.offsetHeight - innerHeight) * 0.8;
    const work = top("#work") - 24,
      about = top("#about") - 24;
    const lens = centered(".lens-area"),
      field = centered(".field-theatre"),
      desk = centered(".project-preview-desk");
    const footer = top("#contact"),
      end = document.documentElement.scrollHeight - innerHeight;
    const frames = [
      [0, 0],
      [4, 0],
      [12, reel],
      [14, reel],
      [19, work],
      [26, work],
      [30, about],
      [32, about],
      [35, lens],
      [39, lens],
      [44, scene(0.1)],
      [48, scene(0.1)],
      [51, scene(0.35)],
      [55, scene(0.35)],
      [57.5, scene(0.6)],
      [61.5, scene(0.6)],
      [64, scene(0.9)],
      [68, scene(0.9)],
      [73, field],
      [78, field],
      [80, desk],
      [82, desk],
      [85, footer],
      [
        86.5,
        Math.min(
          end,
          top(".footer-projects") +
            document.querySelector(".footer-projects").offsetHeight +
            50,
        ),
      ],
      [88.5, end],
      [90, end],
    ].map(([time, y]) => [time, Math.max(0, Math.min(end, y))]);
    window.__walkthroughPositions = frames;
    let index = 0,
      lastPhase = -1;
    const started = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        const t = (now - started) / 1000;
        while (index < frames.length - 2 && t > frames[index + 1][0]) index++;
        const [a, y1] = frames[index],
          [b, y2] = frames[index + 1];
        const linear = Math.max(0, Math.min(1, (t - a) / (b - a)));
        const ease = linear * linear * (3 - 2 * linear);
        window.scrollTo({ top: y1 + (y2 - y1) * ease, behavior: "instant" });
        const phase = Math.floor(t / 10);
        if (phase !== lastPhase) {
          lastPhase = phase;
          console.log(`Walkthrough: ${Math.min(90, phase * 10)} / 90 seconds`);
        }
        if (t < 90) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
    return {
      positions: frames,
      finalScroll: scrollY,
      pageBottom: document.documentElement.scrollHeight - innerHeight,
      thread: document.querySelector(".spatial-scene").dataset.renderThread,
    };
  });
  const at = async (seconds) => {
    const wait = seconds * 1000 - (performance.now() - started);
    if (wait > 0) await delay(wait);
  };
  const interactions = (async () => {
    await at(1);
    const badge = await page
      .getByRole("button", { name: "Drag or swing Mzazi's identity badge" })
      .boundingBox();
    await page.mouse.move(
      badge.x + badge.width / 2,
      badge.y + badge.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      badge.x + badge.width / 2 - 45,
      badge.y + badge.height / 2 + 35,
      { steps: 8 },
    );
    await page.mouse.up();
    await at(21);
    await page
      .locator(".archive-row")
      .nth(1)
      .evaluate((e) => e.click());
    await at(23);
    await page
      .locator(".archive-row")
      .nth(2)
      .evaluate((e) => e.click());
    await at(25);
    await page
      .locator(".archive-row")
      .nth(3)
      .evaluate((e) => e.click());
    await at(35.2);
    const lens = await page.locator(".lens-area").boundingBox();
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(
        lens.x + lens.width * (0.15 + i * 0.09),
        lens.y + lens.height * (0.5 + Math.sin(i * 0.8) * 0.15),
        { steps: 3 },
      );
      await delay(320);
    }
    await at(39);
    await page.mouse.move(1900, 20);
    await at(73.4);
    const field = await page.locator(".particle-canvas").boundingBox();
    await page.mouse.move(
      field.x + field.width * 0.55,
      field.y + field.height * 0.5,
      { steps: 8 },
    );
    await at(74.3);
    await page.mouse.down();
    await page.mouse.move(
      field.x + field.width * 0.47,
      field.y + field.height * 0.42,
      { steps: 8 },
    );
    await at(75.3);
    await page.mouse.up();
    await page
      .getByRole("button", { name: "Set field to Wave", exact: true })
      .evaluate((e) => e.click());
    await at(76.7);
    await page
      .getByRole("button", { name: "Set field to Scatter", exact: true })
      .evaluate((e) => e.click());
    await at(78);
    await page.mouse.move(1900, 20);
  })();
  const [coverage] = await Promise.all([scroll, interactions]);
  if (errors.length) throw new Error(`Page errors: ${errors.join("; ")}`);
  if (Math.abs(coverage.finalScroll - coverage.pageBottom) > 3)
    throw new Error("The walkthrough did not reach the bottom.");
  await page.waitForTimeout(350);
  const video = page.video();
  await context.close();
  const raw = await video.path();
  const info = JSON.parse(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "json", raw],
      { encoding: "utf8" },
    ),
  );
  // The recorder starts timestamps at its first received frame, which can be
  // later than its creation_time tag. Anchor the trim to the recorded end.
  const offset = Math.max(0, Number(info.format.duration) - 90.5);
  writeFileSync(
    resolve(temporary, "coverage.json"),
    JSON.stringify({ ...coverage, offset, errors, raw }, null, 2),
  );
  console.log("Walkthrough: encoding 1080p MP4.");
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "warning",
      "-y",
      "-ss",
      String(offset),
      "-i",
      raw,
      "-t",
      "90",
      "-vf",
      "tpad=stop_mode=clone:stop_duration=2,fps=30",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "20",
      "-threads",
      "2",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      "-map_metadata",
      "-1",
      output,
    ],
    { stdio: "inherit" },
  );
  const result = JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration,size:stream=width,height,r_frame_rate,nb_frames",
        "-of",
        "json",
        output,
      ],
      { encoding: "utf8" },
    ),
  );
  if (Math.abs(Number(result.format.duration) - 90) > 0.05)
    throw new Error(`Unexpected video duration ${result.format.duration}`);
  writeFileSync(
    resolve(temporary, "coverage.json"),
    JSON.stringify({ ...coverage, offset, errors, output, result }, null, 2),
  );
  console.log(JSON.stringify({ output, ...result }));
} finally {
  await browser?.close();
  server.kill();
}

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = "http://127.0.0.1:4173/mzazimhengaportifolio/";
let browser;
let server;
let serverOutput = "";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

before(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      "4173",
      "--strictPort",
      "--base=/mzazimhengaportifolio/",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (d) => {
    serverOutput += d;
  });
  server.stderr.on("data", (d) => {
    serverOutput += d;
  });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    if (server.exitCode !== null) break;
    await sleep(100);
  }
  assert.ok(ready, `Preview server did not start: ${serverOutput}`);
  const executablePath =
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  mkdirSync("test-results", { recursive: true });
});

after(async () => {
  await browser?.close();
  server?.kill();
});

async function pageFor(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...options,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return { page, context, errors };
}

async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Page has horizontal overflow",
  );
}

test("Pages build loads from its repository subpath with local assets", async () => {
  const { page, context, errors } = await pageFor();
  try {
    await page.waitForTimeout(1200);
    assert.match(await page.title(), /Mzazi/);
    assert.equal(
      await page.locator("h1").getAttribute("aria-label"),
      "Beyond the expected.",
    );
    for (const path of [
      "favicon.svg",
      "fonts/space-grotesk.ttf",
      "fonts/dm-mono.ttf",
      "images/mountain.jpg",
      "images/ridge.jpg",
      "images/sneaker.jpg",
      "images/still-life.jpg",
      "images/WhatsApp%20Image%202026-11-16%20at%2012.08.32.jpeg",
    ]) {
      const response = await page.request.get(new URL(path, url).href);
      assert.equal(response.status(), 200, `${path} failed to load`);
      assert.ok((await response.body()).length > 100, `${path} is empty`);
    }
    assert.ok(
      await page
        .locator(".work-section")
        .evaluate((e) => e.classList.contains("is-horizontal")),
    );
    await noOverflow(page);
    await page.screenshot({ path: "test-results/desktop.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("scrolling drives the horizontal gallery and project dialogs work with keyboard", async () => {
  const { page, context, errors } = await pageFor();
  try {
    await page
      .locator("#work")
      .evaluate((e) =>
        window.scrollTo({ top: e.offsetTop, behavior: "instant" }),
      );
    await page.waitForTimeout(300);
    const beforeX = await page
      .locator(".project-track")
      .evaluate((e) => e.getBoundingClientRect().x);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(500);
    const afterX = await page
      .locator(".project-track")
      .evaluate((e) => e.getBoundingClientRect().x);
    assert.ok(
      afterX < beforeX - 100,
      `Gallery did not move: ${beforeX} -> ${afterX}`,
    );
    await page.getByRole("button", { name: "Go to visual concept 03" }).click();
    await page.waitForTimeout(900);
    const project = page.getByRole("button", {
      name: "Explore Extra / Ordinary, visual concept 03",
    });
    await project.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "Extra / Ordinary — visual concept",
    });
    await dialog.waitFor({ state: "visible" });
    assert.match(await dialog.innerText(), /REAL PROJECTS ARE COMING SOON/);
    assert.equal(
      await page.locator("body").evaluate((e) => e.style.overflow),
      "hidden",
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.ok(
      await project.evaluate((e) => e === document.activeElement),
      "Focus was not restored",
    );
    assert.notEqual(
      await page.locator("body").evaluate((e) => e.style.overflow),
      "hidden",
    );
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("word reveal, mountain zoom, and 3D sculpture respond to scroll", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const word = page.locator(".reveal-copy > span > span").last();
    const initialOpacity = Number(
      await word.evaluate((e) => getComputedStyle(e).opacity),
    );
    await page.locator(".reveal-copy").evaluate((e) =>
      window.scrollTo({
        top: e.getBoundingClientRect().bottom + scrollY - innerHeight * 0.35,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(300);
    assert.ok(
      Number(await word.evaluate((e) => getComputedStyle(e).opacity)) >
        initialOpacity,
    );
    const zoom = page.locator(".zoom-section");
    await zoom.evaluate((e) =>
      window.scrollTo({ top: e.offsetTop, behavior: "instant" }),
    );
    await page.waitForTimeout(300);
    const firstScale = await page
      .locator(".zoom-frame")
      .evaluate((e) => getComputedStyle(e).transform);
    await zoom.evaluate((e) =>
      window.scrollTo({
        top: e.offsetTop + (e.offsetHeight - innerHeight) * 0.9,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(300);
    assert.notEqual(
      await page
        .locator(".zoom-frame")
        .evaluate((e) => getComputedStyle(e).transform),
      firstScale,
    );
    await page.locator(".zoom-image").evaluate((e) => e.decode());
    await page.screenshot({ path: "test-results/zoom.png" });
    await page.locator("#play").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const startRotation = await page
      .locator(".spiral-object")
      .evaluate((e) => getComputedStyle(e).transform);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);
    assert.notEqual(
      await page
        .locator(".spiral-object")
        .evaluate((e) => getComputedStyle(e).transform),
      startRotation,
    );
    await page.getByRole("button", { name: "Change sculpture color" }).click();
    assert.match(
      await page.locator(".experiment").getAttribute("class"),
      /palette-1/,
    );
    assert.match(await page.getByRole("status").innerText(), /ultraviolet/);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("mobile menu, vertical projects, accordion and contact preview are usable", async () => {
  const { page, context, errors } = await pageFor({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const menu = page.getByRole("button", { name: "Menu +" });
    await menu.click();
    assert.equal(
      await page
        .getByRole("button", { name: "Close −" })
        .getAttribute("aria-expanded"),
      "true",
    );
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Work" })
      .click();
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert.ok(
      !(await page.locator("#work").getAttribute("class")).includes(
        "is-horizontal",
      ),
    );
    await page
      .getByRole("button", { name: "Explore Off Script, visual concept 01" })
      .click();
    await page
      .getByRole("dialog", { name: "Off Script — visual concept" })
      .waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Close preview" }).first().click();
    const capability = page.locator(".capability").nth(1);
    await capability.locator("summary").click();
    assert.ok(await capability.evaluate((e) => e.open));
    await page.getByRole("button", { name: "Say hello", exact: true }).click();
    const contact = page.getByRole("dialog", { name: "Let’s connect" });
    await contact.waitFor({ state: "visible" });
    assert.match(await contact.innerText(), /Contact details/);
    await contact.getByRole("button", { name: "Explore the studies" }).click();
    await contact.waitFor({ state: "hidden" });
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("system reduced motion removes pinned scrolling and remains fully readable", async () => {
  const { page, context, errors } = await pageFor({ reducedMotion: "reduce" });
  try {
    assert.equal(
      await page.locator(".portfolio").getAttribute("data-motion"),
      "paused",
    );
    assert.ok(
      !(await page.locator("#work").getAttribute("class")).includes(
        "is-horizontal",
      ),
    );
    assert.equal(
      await page
        .locator(".ticker-loop")
        .evaluate((e) => getComputedStyle(e).animationName),
      "none",
    );
    assert.equal(
      await page
        .locator(".zoom-sticky")
        .evaluate((e) => getComputedStyle(e).position),
      "relative",
    );
    assert.equal(
      Number(
        await page
          .locator(".reveal-copy > span > span")
          .last()
          .evaluate((e) => getComputedStyle(e).opacity),
      ),
      1,
    );
    assert.ok(
      await page.getByRole("button", { name: "REDUCED MOTION" }).isDisabled(),
    );
    for (const id of ["work", "about", "play", "contact"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await noOverflow(page);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: "test-results/reduced-motion.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("manual pause persists after reload and can be resumed", async () => {
  const { page, context, errors } = await pageFor();
  try {
    await page.getByRole("button", { name: "PAUSE MOTION" }).click();
    assert.equal(
      await page.locator(".portfolio").getAttribute("data-motion"),
      "paused",
    );
    await page.reload();
    assert.equal(
      await page.locator(".portfolio").getAttribute("data-motion"),
      "paused",
    );
    await page.getByRole("button", { name: "RESUME MOTION" }).click();
    assert.equal(
      await page.locator(".portfolio").getAttribute("data-motion"),
      "active",
    );
    assert.ok(
      (await page.locator("#work").getAttribute("class")).includes(
        "is-horizontal",
      ),
    );
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("portrait badge follows a drag, bends its rope, and springs back", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const badge = page.getByRole("button", {
      name: "Drag or swing Mzazi's identity badge",
    });
    await page.waitForTimeout(2700);
    await page.locator(".badge-photo img").evaluate((image) => image.decode());
    assert.ok(
      await page
        .locator(".badge-photo img")
        .evaluate((image) => image.naturalWidth === 1200),
    );
    const initial = await badge.boundingBox();
    const rope = page.locator(".badge-rope path").first();
    const originalPath = await rope.getAttribute("d");
    await page.mouse.move(
      initial.x + initial.width / 2,
      initial.y + initial.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      initial.x + initial.width / 2 - 80,
      initial.y + initial.height / 2 + 45,
      { steps: 10 },
    );
    assert.notEqual(
      await rope.getAttribute("d"),
      originalPath,
      "Rope did not follow the card",
    );
    await page.mouse.up();
    await page.waitForTimeout(2200);
    const returned = await badge.boundingBox();
    assert.ok(
      Math.abs(returned.x - initial.x) < 15,
      "Badge did not settle after release",
    );
    await badge.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    assert.notEqual(
      await rope.getAttribute("d"),
      originalPath,
      "Keyboard interaction did not swing the badge",
    );
    await page.screenshot({ path: "test-results/portrait-badge.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("each section enters with a distinct treatment and the work stage opens on approach", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const work = page.locator("#work");
    const initial = await work.evaluate((e) => getComputedStyle(e).clipPath);
    await work.evaluate((e) =>
      window.scrollTo({ top: e.offsetTop - 100, behavior: "instant" }),
    );
    await page.waitForTimeout(350);
    const opened = await work.evaluate((e) => getComputedStyle(e).clipPath);
    assert.notEqual(opened, initial, "Work stage did not expand on entry");
    const entrances = await page
      .locator("[data-entrance]")
      .evaluateAll((elements) => elements.map((e) => e.dataset.entrance));
    assert.equal(entrances.length, 6);
    assert.equal(new Set(entrances).size, 6);
    await page.locator("#about").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    assert.match(
      await page
        .locator(".about-grid")
        .evaluate((e) => getComputedStyle(e).clipPath),
      /^inset\(0(?:px|%)? 0(?:px|%)? 0(?:px|%)? 0(?:px|%)?\)$/,
    );
    await page.screenshot({ path: "test-results/about.png" });
    await page.locator("#play").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1400);
    assert.equal(
      Number(
        await page
          .locator(".experiment")
          .evaluate((e) => getComputedStyle(e).opacity),
      ),
      1,
    );
    await page.screenshot({ path: "test-results/playground.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("3D hero renders and stays usable when WebGL is unavailable", async () => {
  const { page, context, errors } = await pageFor();
  try {
    await page
      .locator('.spatial-scene[data-scene-state="ready"]')
      .waitFor({ timeout: 20000 });
    assert.equal(await page.locator(".scene-canvas canvas").count(), 1);
    await page
      .getByRole("button", { name: "PAUSE SCULPTURE", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "RESUME SCULPTURE", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page
      .getByRole("button", { name: "RESUME SCULPTURE", exact: true })
      .click();
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
  const fallback = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  try {
    await fallback.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (
          type === "webgl2" ||
          type === "webgl" ||
          type === "experimental-webgl"
        )
          return null;
        return original.call(this, type, ...args);
      };
    });
    const p = await fallback.newPage();
    await p.goto(url);
    await p.locator('.spatial-scene[data-scene-state="fallback"]').waitFor();
    assert.equal(
      Number(
        await p
          .locator(".spatial-fallback")
          .evaluate((e) => getComputedStyle(e).opacity),
      ),
      1,
    );
    await p.getByRole("button", { name: "Menu +" }).click();
    assert.ok(
      await p
        .getByRole("navigation")
        .getByRole("link", { name: "About", exact: true })
        .isVisible(),
    );
    await noOverflow(p);
  } finally {
    await fallback.close();
  }
});

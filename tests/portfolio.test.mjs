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

async function pageFor(options = {}, suffix = "") {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...options,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url + suffix);
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
    assert.equal(
      await page.getByRole("button", { name: /^Preview / }).count(),
      4,
    );
    assert.equal(
      await page.locator(".archive-print-caption strong").innerText(),
      "Jeff’s Concepts",
    );
    await noOverflow(page);
    await page.screenshot({ path: "test-results/desktop.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("contact sheet changes previews on hover and focus, with keyboard project dialogs", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const second = page.getByRole("button", {
      name: "Preview R. K. Njogu Advocates",
    });
    await second.hover();
    assert.equal(await second.getAttribute("aria-pressed"), "true");
    assert.equal(
      await page.locator(".archive-print-caption strong").innerText(),
      "R. K. Njogu Advocates",
    );
    const third = page.getByRole("button", {
      name: "Preview NetflixPro / TV",
    });
    await third.focus();
    assert.equal(await third.getAttribute("aria-pressed"), "true");
    const project = page.getByRole("button", {
      name: "Explore NetflixPro / TV",
    });
    await project.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "NetflixPro / TV — project",
    });
    await dialog.waitFor({ state: "visible" });
    assert.match(await dialog.innerText(), /native Kotlin app/);
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
    await page.screenshot({ path: "test-results/contact-sheet.png" });
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("scroll reveal and the slower landscape tell all three chapters to completion", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const word = page.locator(".reveal-copy > span > span").last();
    const initial = Number(
      await word.evaluate((e) => getComputedStyle(e).opacity),
    );
    await page.locator(".reveal-copy").evaluate((e) =>
      window.scrollTo({
        top: e.getBoundingClientRect().bottom + scrollY - innerHeight * 0.35,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(350);
    assert.ok(
      Number(await word.evaluate((e) => getComputedStyle(e).opacity)) > initial,
    );
    const story = page.locator(".perspective-section");
    assert.ok(
      await story.evaluate((e) => e.offsetHeight >= innerHeight * 4),
      "Story has too little scroll space",
    );
    async function progress(value) {
      await story.evaluate(
        (e, p) =>
          window.scrollTo({
            top: e.offsetTop + (e.offsetHeight - innerHeight) * p,
            behavior: "instant",
          }),
        value,
      );
      await page.waitForTimeout(350);
    }
    await progress(0.15);
    assert.ok(
      Number(
        await page
          .locator('[data-passage="look"]')
          .evaluate((e) => getComputedStyle(e).opacity),
      ) > 0.95,
    );
    const imageStart = await page
      .locator(".perspective-image")
      .evaluate((e) => e.style.transform);
    await progress(0.52);
    assert.ok(
      Number(
        await page
          .locator('[data-passage="closer"]')
          .evaluate((e) => getComputedStyle(e).opacity),
      ) > 0.95,
    );
    assert.ok(
      Number(
        await page
          .locator('[data-passage="look"]')
          .evaluate((e) => getComputedStyle(e).opacity),
      ) < 0.01,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Read landscape chapter 2: LOOK CLOSER" })
        .getAttribute("aria-current"),
      "step",
    );
    await progress(0.92);
    assert.ok(
      Number(
        await page
          .locator('[data-passage="carry"]')
          .evaluate((e) => getComputedStyle(e).opacity),
      ) > 0.95,
    );
    assert.notEqual(
      await page
        .locator(".perspective-image")
        .evaluate((e) => e.style.transform),
      imageStart,
    );
    assert.match(
      await page.locator('[data-passage="carry"]').innerText(),
      /END OF FIELD NOTE/,
    );
    await page.locator(".perspective-image").evaluate((e) => e.decode());
    await page.screenshot({ path: "test-results/perspective-ending.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("mobile menu, contact sheet, touch reveal, accordion and contact preview are usable", async () => {
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
    await page.getByRole("button", { name: "Explore Jeff’s Concepts" }).click();
    await page
      .getByRole("dialog", { name: "Jeff’s Concepts — project" })
      .waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Close preview" }).first().click();
    const capability = page.locator(".capability").nth(1);
    await capability.locator("summary").click();
    assert.ok(await capability.evaluate((e) => e.open));
    const reveal = page.getByRole("button", { name: "REVEAL THE OTHER SIDE" });
    await reveal.click();
    assert.equal(
      await page
        .getByRole("button", { name: "RETURN TO THE TEXT" })
        .getAttribute("aria-expanded"),
      "true",
    );
    assert.equal(
      await page.locator(".lens-overlay").getAttribute("aria-hidden"),
      "false",
    );
    await page.getByRole("button", { name: "RETURN TO THE TEXT" }).click();
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
        .locator(".perspective-stage")
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
      !(
        await page.locator(".perspective-section").getAttribute("class")
      ).includes("is-still"),
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

test("sections have distinct entrances and the contact sheet opens on approach", async () => {
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
    await page.waitForFunction(
      () =>
        Number(
          getComputedStyle(document.querySelector(".field-theatre")).opacity,
        ) >= 0.999,
    );
    assert.ok(
      Number(
        await page
          .locator(".field-theatre")
          .evaluate((e) => getComputedStyle(e).opacity),
      ) >= 0.999,
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

test("pointer lens uncovers the hidden manifesto and has a keyboard alternative", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const lens = page.locator(".lens-area");
    await lens.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    const before = await page
      .locator(".lens-overlay")
      .evaluate((e) => getComputedStyle(e).maskImage);
    const box = await lens.boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, {
      steps: 8,
    });
    await page.waitForTimeout(600);
    const after = await page
      .locator(".lens-overlay")
      .evaluate((e) => getComputedStyle(e).maskImage);
    assert.notEqual(after, before, "Pointer did not open the lens");
    assert.match(after, /radial-gradient/);
    await page.screenshot({ path: "test-results/pointer-lens.png" });
    const reveal = page.getByRole("button", { name: "REVEAL THE OTHER SIDE" });
    await reveal.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator(".lens-overlay").getAttribute("aria-hidden"),
      "false",
    );
    assert.equal(
      await page
        .locator(".lens-overlay")
        .evaluate((e) => getComputedStyle(e).maskImage),
      "none",
    );
    assert.match(await page.locator(".lens-overlay").innerText(), /Instinct/);
    await page.getByRole("button", { name: "RETURN TO THE TEXT" }).click();
    assert.equal(
      await page.locator(".lens-base").getAttribute("aria-hidden"),
      "false",
    );
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("particle room responds to pointer and hold, and shape controls work without motion", async () => {
  const { page, context, errors } = await pageFor();
  try {
    const field = page.locator(".particle-canvas");
    await field.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1600);
    const box = await field.boundingBox();
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await page.waitForTimeout(150);
    assert.equal(await field.getAttribute("data-interaction"), "repelling");
    await page.mouse.down();
    await page.waitForTimeout(200);
    assert.equal(await field.getAttribute("data-interaction"), "gathering");
    await page.mouse.up();
    await page.getByRole("button", { name: "PULSE THE FIELD" }).click();
    await page
      .getByRole("button", { name: "Set field to Wave", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("button", { name: "Set field to Wave", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.match(await page.getByRole("status").innerText(), /landscape/);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: "test-results/experiment-room.png" });
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
  const still = await pageFor({ reducedMotion: "reduce" });
  try {
    const field = still.page.locator(".particle-canvas");
    await field.scrollIntoViewIfNeeded();
    await still.page.waitForFunction(
      () =>
        document.querySelector(".particle-canvas")?.dataset.fieldState ===
        "still",
    );
    const first = await field.evaluate((e) => e.toDataURL());
    await still.page
      .getByRole("button", { name: "Set field to Wave", exact: true })
      .click();
    await still.page.waitForTimeout(250);
    const second = await field.evaluate((e) => e.toDataURL());
    assert.notEqual(second, first, "Static shape did not change");
    await still.page.waitForTimeout(250);
    assert.equal(
      await field.evaluate((e) => e.toDataURL()),
      second,
      "Reduced motion field keeps animating",
    );
    assert.ok(
      await still.page
        .getByRole("button", { name: "PULSE THE FIELD" })
        .isDisabled(),
    );
    assert.deepEqual(still.errors, []);
  } finally {
    await still.context.close();
  }
});

test("four real projects expose website or React-preview actions with loaded artwork", async () => {
  const { page, context, errors } = await pageFor({ reducedMotion: "reduce" });
  try {
    const entries = [
      ["Jeff’s Concepts", "https://jeffsconcepts.co.ke/"],
      [
        "R. K. Njogu Advocates",
        "https://alitrial2025.github.io/rk-njogu-advocates/",
      ],
      ["NetflixPro / TV", "#/preview/netflix-tv"],
      ["NetflixPro / Mobile", "#/preview/netflix-mobile"],
    ];
    for (const [name, destination] of entries) {
      await page
        .getByRole("button", { name: `Preview ${name}`, exact: true })
        .click();
      await page
        .getByRole("button", { name: `Explore ${name}`, exact: true })
        .click();
      const dialog = page.getByRole("dialog", {
        name: `${name} — project`,
        exact: true,
      });
      await dialog.waitFor({ state: "visible" });
      await dialog
        .locator(".real-project-art img")
        .evaluate((image) => image.decode());
      assert.ok(
        await dialog
          .locator(".real-project-art img")
          .evaluate((image) => image.naturalWidth > 300),
      );
      assert.equal(
        await dialog.locator(".project-primary-action").getAttribute("href"),
        destination,
      );
      assert.ok(
        await dialog
          .getByRole("list", { name: "Project technologies" })
          .isVisible(),
      );
      assert.ok(
        !(await dialog.innerText()).includes("REAL PROJECTS ARE COMING SOON"),
      );
      await page.keyboard.press("Escape");
    }
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("TV recreation supports D-pad focus, details, personal list, search and media tabs", async () => {
  const { page, context, errors } = await pageFor({}, "#/preview/netflix-tv");
  try {
    await page.locator(".native-tv").waitFor();
    const nav = page.getByRole("navigation", { name: "TV navigation" });
    await nav.getByRole("button", { name: "Home", exact: true }).focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "Play",
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.evaluate(() => document.activeElement.textContent.trim()),
      "More Info",
    );
    await page.keyboard.press("Enter");
    const details = page.getByRole("dialog", {
      name: "Squid Game",
      exact: true,
    });
    await details.waitFor({ state: "visible" });
    await details
      .getByRole("button", { name: "Add to My List", exact: true })
      .click();
    assert.equal(
      await details
        .getByRole("button", { name: "Remove from My List", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.keyboard.press("Escape");
    await nav.getByRole("button", { name: "My Netflix", exact: true }).click();
    assert.match(await page.locator(".native-my-list").innerText(), /My List/);
    assert.ok(
      await page
        .locator(".native-my-list")
        .getByRole("button", { name: "Details for Squid Game", exact: true })
        .first()
        .isVisible(),
    );
    await nav.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("searchbox", { name: "Search catalog" })
      .fill("Interstellar");
    assert.equal(
      await page.locator(".native-search-results button").count(),
      1,
    );
    assert.match(
      await page.locator(".native-search-results").innerText(),
      /Interstellar/,
    );
    await page
      .getByRole("searchbox", { name: "Search catalog" })
      .fill("no-such-film-92831");
    assert.match(
      await page.locator(".native-empty").innerText(),
      /No matching titles/,
    );
    await nav.getByRole("button", { name: "Films", exact: true }).click();
    assert.equal(
      await nav
        .getByRole("button", { name: "Films", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(
      await page
        .locator(
          '.native-media-strip button[aria-label="Details for Squid Game"]',
        )
        .count(),
      0,
    );
    await page.screenshot({ path: "test-results/netflix-tv.png" });
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("mobile reconstruction preserves Compose geometry, list persistence and playback UI", async () => {
  const { page, context, errors } = await pageFor(
    { viewport: { width: 500, height: 1150 } },
    "#/preview/netflix-mobile",
  );
  try {
    await page.locator(".native-mobile").waitFor();
    const geometry = await page.locator(".native-hero").evaluate((e) => ({
      width: e.offsetWidth,
      height: e.offsetHeight,
      radius: getComputedStyle(e).borderRadius,
    }));
    assert.equal(geometry.width, 360);
    assert.ok(Math.abs(geometry.height - 540) <= 1);
    assert.equal(geometry.radius, "12px");
    const save = page
      .locator(".native-hero")
      .getByRole("button", { name: "My List", exact: true });
    await save.click();
    assert.equal(await save.getAttribute("aria-pressed"), "true");
    await page.reload();
    await page.locator(".native-mobile").waitFor();
    assert.equal(
      await page
        .locator(".native-hero")
        .getByRole("button", { name: "My List", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("button", { name: "My Netflix", exact: true })
      .click();
    const savedTitle = page
      .locator(".native-my-list")
      .getByRole("button", { name: "Details for Squid Game", exact: true })
      .first();
    await savedTitle.click();
    const detail = page.getByRole("dialog", {
      name: "Squid Game",
      exact: true,
    });
    await detail.getByRole("button", { name: "Play", exact: true }).click();
    assert.match(
      await page.locator(".native-player-notice").innerText(),
      /No video stream/,
    );
    await page
      .getByRole("button", { name: "Pause preview", exact: true })
      .click();
    assert.ok(
      await page
        .getByRole("button", { name: "Resume preview", exact: true })
        .isVisible(),
    );
    await page
      .getByRole("slider", { name: "Preview playback position" })
      .focus();
    await page.keyboard.press("End");
    assert.match(
      await page.locator(".native-player-controls").innerText(),
      /2:00/,
    );
    await page.keyboard.press("Escape");
    await page.screenshot({ path: "test-results/netflix-mobile.png" });
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("mobile filters, categories, reminder and browser utility panels are functional", async () => {
  const { page, context, errors } = await pageFor(
    { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    "#/preview/netflix-mobile",
  );
  try {
    await page.locator(".native-mobile").waitFor();
    await page
      .getByRole("navigation", { name: "Filter titles" })
      .getByRole("button", { name: "Films", exact: true })
      .click();
    assert.equal(
      await page.locator(".native-hero").getAttribute("aria-label"),
      "Featured: Inception",
    );
    await page
      .getByRole("button", { name: "Choose category", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Romance", exact: true })
      .click();
    assert.match(
      await page.locator(".native-empty").innerText(),
      /No matching titles/,
    );
    await page
      .getByRole("button", { name: "Clear filter", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Filter titles" })
      .getByRole("button", { name: "New & Hot", exact: true })
      .click();
    const panel = page.getByRole("dialog");
    await panel
      .getByRole("button", { name: "Remind me", exact: true })
      .first()
      .click();
    assert.ok(
      await panel
        .getByRole("button", { name: "Reminder set", exact: true })
        .isVisible(),
    );
    await page
      .getByRole("button", { name: "Close app panel", exact: true })
      .click();
    await page.getByRole("button", { name: "Cast", exact: true }).click();
    assert.match(await page.getByRole("dialog").innerText(), /No cast device/);
    await page
      .getByRole("button", { name: "Keep watching here", exact: true })
      .click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("button", { name: "Search", exact: true })
      .click();
    await page
      .getByRole("searchbox", { name: "Search catalog" })
      .fill("Matrix");
    assert.equal(
      await page.locator(".native-search-results button").count(),
      1,
    );
    await noOverflow(page);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});

test("preview hash routes switch platforms and return to the real portfolio without CSS leakage", async () => {
  const { page, context, errors } = await pageFor(
    { reducedMotion: "reduce" },
    "#/preview/netflix-tv",
  );
  try {
    await page.locator(".native-tv").waitFor();
    await page
      .getByRole("navigation", { name: "Preview platform" })
      .getByRole("link", { name: "Mobile", exact: true })
      .click();
    await page.locator(".native-mobile").waitFor();
    assert.match(page.url(), /#\/preview\/netflix-mobile$/);
    await page
      .getByRole("link", { name: "Back to portfolio", exact: true })
      .click();
    await page.locator(".portfolio").waitFor();
    assert.equal(
      await page.getByRole("button", { name: /^Preview / }).count(),
      4,
    );
    assert.match(
      await page.locator(".archive-index h2").innerText(),
      /Selected/,
    );
    assert.match(
      await page
        .locator(".archive-index h2")
        .evaluate((e) => getComputedStyle(e).fontFamily),
      /Space Grotesk/,
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

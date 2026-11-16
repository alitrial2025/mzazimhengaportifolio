import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Publish only built files. A separate temporary index leaves the working
// checkout and its staging area untouched; every push is a fast-forward.
const root = resolve(import.meta.dirname, "..");
const git = (args, options = {}) =>
  (execFileSync("git", args, { cwd: root, encoding: "utf8", ...options }) ?? "").trim();
const dist = join(root, "dist");
if (!existsSync(join(dist, "index.html")))
  throw new Error("Run npm run build:pages first.");
const gitDir = git(["rev-parse", "--absolute-git-dir"]);
const remoteRef = git(["ls-remote", "origin", "refs/heads/gh-pages"]);
let parent;
if (remoteRef) {
  git(["fetch", "origin", "refs/heads/gh-pages"]);
  parent = git(["rev-parse", "FETCH_HEAD"]);
}
const temporary = mkdtempSync(join(tmpdir(), "mzazi-pages-"));
try {
  const env = {
    ...process.env,
    GIT_DIR: gitDir,
    GIT_WORK_TREE: dist,
    GIT_INDEX_FILE: join(temporary, "index"),
  };
  const builtGit = (args) => git(args, { cwd: dist, env });
  builtGit(["read-tree", "--empty"]);
  builtGit(["add", "--all", "."]);
  const tree = builtGit(["write-tree"]);
  const source = git(["rev-parse", "--short", "HEAD"]);
  const commit = git([
    "commit-tree",
    tree,
    ...(parent ? ["-p", parent] : []),
    "-m",
    `Publish portfolio (${source})`,
  ]);
  git(["push", "origin", `${commit}:refs/heads/gh-pages`], {
    stdio: "inherit",
  });
  console.log(
    "Published build to gh-pages. In GitHub Settings > Pages, use Deploy from a branch: gh-pages / (root).",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}

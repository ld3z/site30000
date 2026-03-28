import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { updateGlobalCss } from "./generate-icon-sources.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const nextBin = path.join(
  rootDir,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);
const watchDirs = ["app", "components", "content", "lib"];
const watchFiles = ["source.config.ts"];

let timer = null;
const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});

function refresh() {
  try {
    updateGlobalCss();
  } catch (error) {
    console.error(error);
  }
}

function scheduleRefresh() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(refresh, 100);
}

refresh();

const watchers = [
  ...watchDirs
    .filter((entry) => fs.existsSync(path.join(rootDir, entry)))
    .map((entry) => {
      const target = path.join(rootDir, entry);
      return fs.watch(target, { recursive: true }, (_eventType, filename) => {
        if (!filename) return;

        const normalized = String(filename).replaceAll("\\", "/");
        if (normalized.includes("/.git/") || normalized.startsWith(".git/"))
          return;
        scheduleRefresh();
      });
    }),
  ...watchFiles
    .filter((entry) => fs.existsSync(path.join(rootDir, entry)))
    .map((entry) => {
      const target = path.join(rootDir, entry);
      return fs.watch(target, (_eventType) => {
        scheduleRefresh();
      });
    }),
];

let cleanedUp = false;

function cleanupAndExit(code = 0) {
  if (cleanedUp) return;
  cleanedUp = true;
  for (const watcher of watchers) watcher.close();
  if (timer) clearTimeout(timer);
  if (child && !child.killed) child.kill();
  if (code === 0) return;
  process.exit(code);
}

process.on("SIGINT", () => cleanupAndExit(0));
process.on("SIGTERM", () => cleanupAndExit(0));

child.on("exit", (code) => cleanupAndExit(code ?? 0));

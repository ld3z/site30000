import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const cssPath = path.join(rootDir, "app", "global.css");
const ignoredDirs = new Set([
  ".git",
  ".next",
  ".source",
  "build",
  "coverage",
  "node_modules",
  "out",
]);

const allowedExtensions = new Set([".md", ".mdx"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (allowedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function iconClassFromShortcut(shortcut) {
  let hyphenIndex = shortcut.indexOf("-");
  if (hyphenIndex === -1) return null;

  let prefix = shortcut.slice(0, hyphenIndex);
  let name = shortcut.slice(hyphenIndex + 1);

  const knownPrefixes = [
    'simple-icons',
    'material-symbols',
    'heroicons-solid',
    'heroicons-outline',
    'line-md',
    'flat-color-icons',
    'fluent-emoji',
    'skill-icons',
    'vscode-icons',
    'hugeicons',
    'icon-park',
    'icon-park-outline',
    'icon-park-solid',
    'icon-park-twotone',
    'streamline-stickies-color'
  ];

  for (const kp of knownPrefixes) {
    if (shortcut.startsWith(`${kp}-`)) {
      prefix = kp;
      name = shortcut.slice(kp.length + 1);
      break;
    }
  }

  return `icon-[${prefix}--${name}]`;
}

function collectIcons() {
  const icons = new Set();
  const shortcutPattern = /:([a-z0-9]+(?:-[a-z0-9]+)+):/gi;
  const directPattern = /icon-\[([^\]]+)\]/g;

  for (const filePath of walk(rootDir)) {
    if (filePath === cssPath) continue;

    const content = fs.readFileSync(filePath, "utf8");

    for (const match of content.matchAll(shortcutPattern)) {
      const className = iconClassFromShortcut(match[1].toLowerCase());
      if (className) icons.add(className);
    }

    for (const match of content.matchAll(directPattern)) {
      icons.add(`icon-[${match[1]}]`);
    }
  }

  return [...icons].sort();
}

export function updateGlobalCss() {
  const icons = collectIcons();
  const nextSource = `@source inline("${icons.join(" ")}");`;
  const current = fs.readFileSync(cssPath, "utf8");
  const updated = current.replace(/^@source inline\(".*?"\);$/m, nextSource);

  if (updated !== current) {
    fs.writeFileSync(cssPath, updated);
    return true;
  }

  return false;
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? "")) {
  updateGlobalCss();
}

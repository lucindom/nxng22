/**
 * Generates the design-system color CSS (Tailwind 4 `@theme` blocks) from
 * libs/builderkit/src/styles/config/themes.config.mjs, the single source of truth for colors.
 * It replaces the ems22 Tailwind 3 `theming` plugin, but writes plain CSS so every app imports
 * only its own theme (no `.theme-*` classes, no unused themes, no dark scheme).
 *
 * Output (libs/builderkit/src/styles/generated/):
 *   colors.css         material palettes + light scheme (`--app-*`), shared by every theme
 *   theme-<name>.css   one file per entry of `themes`
 *
 * Usage:
 *   node tools/scripts/generate-themes.mjs          # rewrite the generated files
 *   node tools/scripts/generate-themes.mjs --check  # exit 1 when a file is stale (CI)
 */
import chroma from "chroma-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const CONFIG = "libs/builderkit/src/styles/config/themes.config.mjs";
const OUTPUT = path.join(ROOT, "libs/builderkit/src/styles/generated");
const check = process.argv.includes("--check");

const { materialPalettes, scheme, staticPalettes, themes } = await import(
  pathToFileURL(path.join(ROOT, CONFIG)).href
);

/**
 * Port of ems22 `fusev2/src/@fuse/tailwind/utils/generate-contrasts.js`: for every hue, picks
 * white or the darkest color of the palette, whichever contrasts more.
 */
function generateContrasts(palette) {
  const light = "#ffffff";
  const dark = Object.values(palette).reduce((darkest, color) =>
    chroma.contrast(color, light) > chroma.contrast(darkest, light)
      ? color
      : darkest,
  );

  return Object.fromEntries(
    Object.entries(palette).map(([hue, color]) => [
      hue,
      chroma.contrast(color, dark) > chroma.contrast(color, light)
        ? dark
        : light,
    ]),
  );
}

function withDefault(palette) {
  return { ...palette, DEFAULT: palette.DEFAULT ?? palette[500] };
}

/**
 * Palettes of a theme with their `on-` counterpart. A palette the theme does not define is
 * inherited from `default` (like ems22 `_.defaults`), always together with its own `on-`.
 */
function resolvePalettes(theme) {
  const names = Object.keys({ ...themes.default, ...theme }).filter(
    (name) => !name.startsWith("on-"),
  );

  return names.map((name) => {
    const source = name in theme ? theme : themes.default;
    const palette = withDefault(source[name]);
    const on = source[`on-${name}`];

    return {
      name,
      palette,
      on: on ? withDefault(on) : generateContrasts(palette),
    };
  });
}

function declarations(name, palette) {
  return Object.entries(palette).map(([hue, color]) =>
    hue === "DEFAULT"
      ? `  --color-${name}: ${color};`
      : `  --color-${name}-${hue}: ${color};`,
  );
}

function themeBlock(directive, palettes) {
  if (palettes.length === 0) {
    return [];
  }

  const groups = palettes.map(({ name, palette, on }) =>
    [
      `  /* ${name} */`,
      ...declarations(name, palette),
      ...(on ? declarations(`on-${name}`, on) : []),
    ].join("\n"),
  );

  return [`${directive} {\n${groups.join("\n\n")}\n}`];
}

/** Material palettes go in `@theme static`; the rest are emitted only when a class uses them. */
function themeBlocks(palettes) {
  const isStatic = ({ name }) => staticPalettes.includes(name);

  return [
    ...themeBlock("@theme static", palettes.filter(isStatic)),
    ...themeBlock("@theme", palettes.filter((palette) => !isStatic(palette))),
  ];
}

function file(description, blocks) {
  const header = [
    "/*",
    ` * GENERADO por tools/scripts/generate-themes.mjs desde ${CONFIG}.`,
    " * No editar: cambiar la config y correr `npm run themes`.",
    " *",
    ...description.map((line) => ` * ${line}`),
    " */",
  ];

  return `${[header.join("\n"), ...blocks].join("\n\n")}\n`;
}

function colorsFile() {
  const palettes = Object.entries(materialPalettes).map(([name, palette]) => ({
    name,
    palette,
    on: null,
  }));
  const schemeVariables = Object.entries(scheme.light).map(
    ([name, value]) => `    --app-${name}: ${value};`,
  );

  return file(
    [
      "Paletas Material y esquema light, comunes a todos los temas.",
      "Lo importa libs/builderkit/src/styles/tailwind/design-system.css.",
    ],
    [
      ...themeBlocks(palettes),
      `@layer theme {\n  :root {\n${schemeVariables.join("\n")}\n  }\n}`,
    ],
  );
}

function themeFile(name) {
  return file(
    [
      `Tema "${name}". Lo importa desde su src/styles.css la app que usa este tema.`,
    ],
    themeBlocks(resolvePalettes(themes[name])),
  );
}

const outputs = new Map([
  ["colors.css", colorsFile()],
  ...Object.keys(themes).map((name) => [`theme-${name}.css`, themeFile(name)]),
]);

fs.mkdirSync(OUTPUT, { recursive: true });

let stale = 0;

for (const name of fs.readdirSync(OUTPUT)) {
  if (outputs.has(name)) {
    continue;
  }

  stale++;

  if (check) {
    console.error(`stale (no longer generated): ${name}`);
  } else {
    fs.rmSync(path.join(OUTPUT, name));
    console.log(`removed: ${name}`);
  }
}

for (const [name, content] of outputs) {
  const target = path.join(OUTPUT, name);
  const current = fs.existsSync(target)
    ? fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n")
    : null;

  if (current === content) {
    continue;
  }

  stale++;

  if (check) {
    console.error(`stale: ${name}`);
  } else {
    fs.writeFileSync(target, content);
    console.log(`updated: ${name}`);
  }
}

if (check && stale > 0) {
  process.exit(1);
}

console.log(
  stale === 0
    ? "Theme files up to date"
    : `${stale} files ${check ? "stale" : "updated"}`,
);

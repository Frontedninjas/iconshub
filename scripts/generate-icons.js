import fs from "fs";
import path from "path";
import { optimize } from "svgo";
import * as svgoConfig from "./svgo.config.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const svgr = require("@svgr/core");
// svgr may export different shapes depending on version/packaging. Prefer transformSync when available.
let transformSync = svgr && svgr.transformSync ? svgr.transformSync : svgr && svgr.default && svgr.default.transformSync ? svgr.default.transformSync : null;

const srcDir = "src/icons";
const reactDir = "src/react";
const vueDir = "src/vue";
const svelteDir = "src/svelte";
const rawDir = "src/raw";
const dirs = [reactDir, vueDir, svelteDir, rawDir];
dirs.forEach((d) => !fs.existsSync(d) && fs.mkdirSync(d, { recursive: true }));

const icons = fs.readdirSync(srcDir).filter((f) => f.endsWith(".svg"));
let indexContent = "";

const pascal = (s) => s.split(/[-_\s]+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
for (const file of icons) {
  const name = file.replace(".svg", "");
  const comp = pascal(name) + "Icon";
  const svg = fs.readFileSync(path.join(srcDir, file), "utf8");
  const optimized = optimize(svg, svgoConfig).data;

  // React component (ESM + JSX)
  if (typeof transformSync === "function") {
    const reactCode = transformSync(optimized, { icon: true, jsxRuntime: "automatic" }, { componentName: comp });
    fs.writeFileSync(`${reactDir}/${comp}.jsx`, reactCode);
  } else {
    // Fallback: parse the optimized SVG and create a React component that spreads `props` onto the <svg>
    const svgMatch = optimized.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/i);
    const attrsStr = svgMatch ? svgMatch[1] : "";
    const inner = svgMatch ? svgMatch[2] : optimized;

    // Parse simple key="value" attributes from attrsStr
    const attrs = {};
    const attrRe = /([:\w-]+)=("|')(.*?)\2/g;
    let m;
    while ((m = attrRe.exec(attrsStr))) {
      const key = m[1];
      const value = m[3];
      attrs[key] = value;
    }

    // Build JS object literal for attrs (keys quoted to preserve hyphens)
    const attrsEntries = Object.keys(attrs).map((k) => `"${k}": ${JSON.stringify(attrs[k])}`);
    const attrsObjectLiteral = `{ ${attrsEntries.join(", ")} }`;

    const reactFallback = `import React from "react";\n\nexport default function ${comp}(props) {\n  return React.createElement(\n    'svg',\n    Object.assign({}, ${attrsObjectLiteral}, props, { dangerouslySetInnerHTML: { __html: ${JSON.stringify(inner)} } })\n  );\n}\n`;
    fs.writeFileSync(`${reactDir}/${comp}.jsx`, reactFallback);
  }

  // Vue
  fs.writeFileSync(`${vueDir}/${name}.vue`, `<template>${optimized}</template>`);

  // Svelte
  fs.writeFileSync(`${svelteDir}/${name}.svelte`, `<script>export let size = 24;</script>\\n${optimized}`);

  // Raw (SVG string)
  fs.writeFileSync(`${rawDir}/${name}.js`, `export default ${JSON.stringify(optimized)}`);

  // Index exports: named React component and named raw export
  indexContent += `export { default as ${comp} } from "./react/${comp}.jsx";\n`;
  indexContent += `export { default as ${pascal(name)}Raw } from "./raw/${name}.js";\n`;
}
// default export: map of name -> SVG string
let mapContent = "const icons = {};\n";
for (const file of icons) {
  const name = file.replace(".svg", "");
  const svg = fs.readFileSync(path.join(srcDir, file), "utf8");
  const optimized = optimize(svg, svgoConfig).data;
  mapContent += `icons[${JSON.stringify(name)}] = ${JSON.stringify(optimized)};\n`;
}
mapContent += "export default icons;\n";
fs.writeFileSync("src/index.js", indexContent + "\n" + mapContent);

console.log("✨ Icons generated! React components created in src/react, raw in src/raw, vue/svelte files created, and src/index.js exports updated.");

/**
 * يقرأ design-system/tokens.json ويولّد src/app/tokens.css
 * القاعدة: لا تُكتب قيمة لون أو مقاس يدوياً في أي ملف CSS — كلها تأتي من هنا.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(resolve(root, "design-system/tokens.json"), "utf8"));

const themes = tokens.color.themes.map((t) => t.id);
const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t.value]));

/** بعض القيم في tokens.json تشير لاسم token آخر (مثل border-focus) بدل قيمة hex. */
function resolveColor(value, theme) {
  const v = value[theme];
  return v.startsWith("#") ? v : byName[v][theme];
}

const lines = [];
lines.push("/* مولَّد آلياً من design-system/tokens.json — لا تعدّل هذا الملف يدوياً. */");
lines.push("/* أعد التوليد عبر: npm run tokens */");
lines.push("");

for (const theme of themes) {
  const selector = theme === "dark" ? ':root,\n[data-theme="dark"]' : `[data-theme="${theme}"]`;
  lines.push(`${selector} {`);
  for (const token of tokens.color.tokens) {
    lines.push(`  --${token.name}: ${resolveColor(token.value, theme)};`);
  }
  for (const shadow of tokens.shadow.tokens) {
    lines.push(`  --${shadow.name}: ${shadow.value[theme]};`);
  }
  lines.push("}");
  lines.push("");
}

lines.push(":root {");
for (const [role, stack] of Object.entries(tokens.type.families)) {
  lines.push(`  --font-${role}: ${stack};`);
}
for (const group of tokens.type.groups) {
  for (const style of group.styles) {
    lines.push(
      `  --fs-${style.name}: ${style.fontSize}; --lh-${style.name}: ${style.lineHeight}; --fw-${style.name}: ${style.fontWeight};`
    );
  }
}
for (const key of ["spacing", "radius", "zIndex"]) {
  for (const token of tokens[key].tokens) {
    lines.push(`  --${token.name}: ${token.value};`);
  }
}
lines.push("}");
lines.push("");

const out = resolve(root, "src/app/tokens.css");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"), "utf8");

const count =
  tokens.color.tokens.length * themes.length +
  tokens.shadow.tokens.length * themes.length +
  Object.keys(tokens.type.families).length +
  tokens.spacing.tokens.length +
  tokens.radius.tokens.length +
  tokens.zIndex.tokens.length;

console.log(`tokens.css مولَّد — ${count} متغيّراً من tokens.json`);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { codeToHtml } from "shiki";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");
const COMPONENTS_DIR = path.join(ROOT_DIR, "packages/core/src/components");
const OUTPUT_DIR = path.join(ROOT_DIR, "apps/web/src/lib/registry/sources");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const entries = fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true });
let generatedCount = 0;

for (const entry of entries) {
  if (!entry.isDirectory()) continue;

  const slug = entry.name;
  const compDir = path.join(COMPONENTS_DIR, slug);
  const indexPath = path.join(compDir, "index.tsx");

  if (!fs.existsSync(indexPath)) {
    console.warn(`[generate-source-map] Warning: No index.tsx found for slug "${slug}". Skipping.`);
    continue;
  }

  const rawSource = fs.readFileSync(indexPath, "utf8");

  // Pre-render syntax-highlighted HTML using Shiki
  const highlightedHtml = await codeToHtml(rawSource, {
    lang: "tsx",
    theme: "vesper",
  });

  // Check for any .glsl files in component directory
  const filesInDir = fs.readdirSync(compDir);
  const glslFiles = filesInDir.filter((f) => f.endsWith(".glsl"));
  let glslExport = "";

  if (glslFiles.length > 0) {
    const glslParts = glslFiles.map((f) => {
      const content = fs.readFileSync(path.join(compDir, f), "utf8");
      return `// --- ${f} ---\n${content}`;
    }).join("\n\n");

    const highlightedGlsl = await codeToHtml(glslParts, {
      lang: "glsl",
      theme: "vesper",
    });

    glslExport = `\nexport const glslSource = ${JSON.stringify(glslParts)};\nexport const glslHtml = ${JSON.stringify(highlightedGlsl)};\n`;
  }

  const fileContent = `// AUTO-GENERATED. Do not edit. Run \`node scripts/generate-source-map.mjs\` to regenerate.
export const source = ${JSON.stringify(rawSource)};
export const html = ${JSON.stringify(highlightedHtml)};
${glslExport}`;

  const outPath = path.join(OUTPUT_DIR, `${slug}.ts`);
  fs.writeFileSync(outPath, fileContent, "utf8");
  generatedCount++;
}

console.log(`[generate-source-map] Successfully generated sources with syntax highlighting for ${generatedCount} components in ${OUTPUT_DIR}`);

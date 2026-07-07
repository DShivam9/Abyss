import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const type = searchParams.get("type"); // 'tsx' | 'glsl'

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // Resolve placeholder slugs to their actual implementation folders
  const SLUG_TO_FOLDER: Record<string, string> = {
    // Medieval placeholders mapping to static-image
    "apparatus-hdhd": "static-image",



    // Placeholders mapping to merlin-knights
    "apparatus-fblf": "merlin-knights",
    "apparatus-ll": "merlin-knights",
    "stippled-dark": "merlin-knights",
    "apparatus-dajd": "merlin-knights",
    "apparatus-jjjj": "merlin-knights",
    "apparatus-hoqnl": "merlin-knights",
    "apparatus-ljbfaf": "merlin-knights",
    "apparatus-underscore": "merlin-knights",
    "apparatus-stshsh": "merlin-knights",
    "apparatus-merged-v3": "merlin-knights",
    "apparatus-ldhad": "merlin-knights",
  };

  const resolvedSlug = SLUG_TO_FOLDER[slug] || slug;

  // Resolve packages/core path depending on whether process.cwd() is the monorepo root or apps/web
  const baseCorePath = fs.existsSync(path.join(process.cwd(), "packages/core"))
    ? path.join(process.cwd(), "packages/core")
    : path.resolve(process.cwd(), "../../packages/core");

  const componentPath = path.join(baseCorePath, "src/components", resolvedSlug);

  try {
    if (type === "tsx") {
      const tsxFilePath = path.join(componentPath, "index.tsx");
      if (!fs.existsSync(tsxFilePath)) {
        return NextResponse.json({ error: "Component file not found" }, { status: 404 });
      }
      const tsxContent = fs.readFileSync(tsxFilePath, "utf8");
      return new NextResponse(tsxContent, {
        headers: { "Content-Type": "text/plain" },
      });
    } else {
      const vertPath = path.join(componentPath, "shader.vert.glsl");
      const fragPath = path.join(componentPath, "shader.frag.glsl");
      
      if (!fs.existsSync(vertPath) || !fs.existsSync(fragPath)) {
        if (resolvedSlug === "static-image") {
          return new NextResponse("// Static image component - no custom shaders required.", {
            headers: { "Content-Type": "text/plain" },
          });
        }
        return NextResponse.json({ error: "Shader files not found" }, { status: 404 });
      }
      
      const vertContent = fs.readFileSync(vertPath, "utf8");
      const fragContent = fs.readFileSync(fragPath, "utf8");

      const glslContent = `// Vertex Shader\n${vertContent}\n\n// Fragment Shader\n${fragContent}`;
      return new NextResponse(glslContent, {
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (err) {
    console.error("API Code Loader failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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

  // Resolve merlin-knights to instagram-overlay (Issue 3 resolution)
  let resolvedSlug = slug;
  if (slug === "merlin-knights") {
    resolvedSlug = "instagram-overlay";
  }

  // Process path relative to the apps/web directory
  const componentPath = path.join(
    process.cwd(),
    "../../packages/core/src/components",
    resolvedSlug
  );

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

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  const { success, remaining } = await checkRateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const type = searchParams.get("type"); // 'tsx' | 'glsl' | 'story'

  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const VALID_TYPES = ["tsx", "glsl", "story"] as const;
  if (type && !VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const resolvedSlug = slug;

  const baseCorePath = fs.existsSync(path.join(process.cwd(), "packages/core"))
    ? path.join(process.cwd(), "packages/core")
    : path.resolve(process.cwd(), "../../packages/core");

  const allowedBase = path.resolve(baseCorePath, "src/components");
  const componentPath = path.resolve(allowedBase, resolvedSlug);

  if (!componentPath.startsWith(allowedBase)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    if (type === "story") {
      const docsPath = fs.existsSync(path.join(process.cwd(), "docs/component-breakdowns.md"))
        ? path.join(process.cwd(), "docs/component-breakdowns.md")
        : path.resolve(process.cwd(), "../../docs/component-breakdowns.md");

      if (fs.existsSync(docsPath)) {
        const fullContent = fs.readFileSync(docsPath, "utf8");
        const sections = fullContent.split(/(?=\n## )/);
        const match = sections.find((sec) => sec.includes(resolvedSlug));
        if (match) {
          return new NextResponse(match.trim(), {
            headers: { "Content-Type": "text/plain" },
          });
        }
      }
      return new NextResponse("", { status: 404 });
    } else if (type === "tsx") {
      const tsxFilePath = path.join(componentPath, "index.tsx");
      if (!fs.existsSync(tsxFilePath)) {
        return NextResponse.json({ error: "Component file not found" }, { status: 404 });
      }
      const tsxContent = fs.readFileSync(tsxFilePath, "utf8");
      return new NextResponse(JSON.stringify({ code: tsxContent }), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const vertPath = path.join(componentPath, "shader.vert.glsl");
      const fragPath = path.join(componentPath, "shader.frag.glsl");
      
      if (!fs.existsSync(vertPath) || !fs.existsSync(fragPath)) {
        if (fs.existsSync(componentPath)) {
          return new NextResponse(JSON.stringify({ code: "// Standard Three.js / GSAP interaction component. No custom GLSL shaders required." }), {
            headers: { "Content-Type": "application/json" },
          });
        }
        return NextResponse.json({ error: "Shader files not found" }, { status: 404 });
      }
      
      const vertContent = fs.readFileSync(vertPath, "utf8");
      const fragContent = fs.readFileSync(fragPath, "utf8");

      const glslContent = `// Vertex Shader\n${vertContent}\n\n// Fragment Shader\n${fragContent}`;
      return new NextResponse(JSON.stringify({ code: glslContent }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("API Source Loader failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

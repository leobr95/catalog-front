import { NextResponse } from "next/server";

type Ctx = { params: { path: string[] } | Promise<{ path: string[] }> };

async function forward(req: Request, ctx: Ctx) {
  const base = process.env.CATALOG_API_BASE_URL;
  if (!base) return NextResponse.json({ errors: ["CATALOG_API_BASE_URL missing"] }, { status: 500 });

  const { path } = await ctx.params;
  const url = new URL(req.url);

  const cleanBase = base.replace(/\/+$/, "");
  const target = new URL(`${cleanBase}/api/${path.join("/")}`);
  target.search = url.search;

  const method = req.method.toUpperCase();
  const auth = req.headers.get("authorization") ?? "";
  const contentType = req.headers.get("content-type") ?? "";

  let body: BodyInit | undefined;

  if (method !== "GET" && method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      const out = new FormData();
      fd.forEach((v, k) => out.append(k, v));
      body = out;
    } else if (contentType.includes("application/json")) {
      body = JSON.stringify(await req.json());
    } else {
      body = await req.text();
    }
  }

  const headers: Record<string, string> = {};
  if (auth) headers["Authorization"] = auth;
  if (contentType && !contentType.includes("multipart/form-data")) headers["Content-Type"] = contentType;

  const r = await fetch(target.toString(), { method, headers, body });

  const buf = await r.arrayBuffer();
  return new NextResponse(buf, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;

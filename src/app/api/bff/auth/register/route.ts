import { NextResponse } from "next/server";

async function handler(req: Request) {
  const base = process.env.AUTH_API_BASE_URL;
  if (!base) return NextResponse.json({ errors: ["AUTH_API_BASE_URL missing"] }, { status: 500 });

  const url = new URL(req.url);
  const target = new URL(`${base.replace(/\/+$/, "")}/api/Auth/register`);
  target.search = url.search;

  const contentType = req.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? JSON.stringify(await req.json()) : await req.text();

  const r = await fetch(target.toString(), {
    method: "POST",
    headers: { "Content-Type": contentType || "application/json" },
    body,
  });

  const buf = await r.arrayBuffer();
  return new NextResponse(buf, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}

export const POST = handler;

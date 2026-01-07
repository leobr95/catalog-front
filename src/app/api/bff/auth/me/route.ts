import { NextResponse } from "next/server";

async function handler(req: Request) {
  const base = process.env.AUTH_API_BASE_URL;
  if (!base) return NextResponse.json({ errors: ["AUTH_API_BASE_URL missing"] }, { status: 500 });

  const url = new URL(req.url);
  const target = new URL(`${base.replace(/\/+$/, "")}/api/Auth/me`);
  target.search = url.search;

  const auth = req.headers.get("authorization") ?? "";

  const r = await fetch(target.toString(), {
    method: "GET",
    headers: auth ? { Authorization: auth } : {},
  });

  const buf = await r.arrayBuffer();
  return new NextResponse(buf, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = handler;

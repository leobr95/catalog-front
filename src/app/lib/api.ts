export class ApiError extends Error {
  status: number;
  messages: string[];
  payload: unknown;

  constructor(status: number, messages: string[], payload: unknown) {
    super(messages.join("\n"));
    this.status = status;
    this.messages = messages;
    this.payload = payload;
  }
}

type ErrorShape = {
  errors?: unknown;
  message?: unknown;
  title?: unknown;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function extractMessages(payload: unknown): string[] {
  if (!payload) return ["Unknown error"];

  if (isObject(payload)) {
    const p = payload as ErrorShape;

    if (Array.isArray(p.errors)) return p.errors.map((x) => String(x));
    if (typeof p.message === "string") return [p.message];
    if (typeof p.title === "string") return [p.title];
  }

  return ["Request failed"];
}

export type RequestOptions = RequestInit & {
  token?: string | null;
  baseUrl?: string; 
};

export async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const base = (opts.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");

  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isForm && opts.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  const res = await fetch(url, { ...opts, headers, cache: "no-store" });

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return (await res.text()) as unknown as T;
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = { message: await res.text() };
  }

  throw new ApiError(res.status, extractMessages(payload), payload);
}

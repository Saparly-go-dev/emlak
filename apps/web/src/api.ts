import type { ApiErrorBody, Session } from "@mekan/contracts";
let csrf: string | null = null;
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public requestId?: string,
    public fields?: Record<string, string[]>,
  ) {
    super(code);
  }
}
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    version?: number;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api/v1" + path, {
      method: options.method || "GET",
      credentials: "same-origin",
      signal: options.signal,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...(options.version ? { "If-Match": String(options.version) } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError("networkError", 0);
  }
  const body = await response.json();
  if (!response.ok) {
    const { error } = body as ApiErrorBody;
    if (error?.code === "unauthorized")
      window.dispatchEvent(new Event("session-expired"));
    throw new ApiError(
      error?.code || "serverError",
      response.status,
      error?.requestId,
      error?.fields,
    );
  }
  if (path.startsWith("/auth/") && "csrf" in body)
    csrf = (body as Session).csrf;
  if (path === "/auth/logout") csrf = null;
  return body as T;
}
export function queryString(
  params: Record<string, string | number | undefined>,
) {
  return new URLSearchParams(
    Object.entries(params)
      .filter(
        (entry): entry is [string, string | number] => entry[1] !== undefined,
      )
      .map(([key, value]) => [key, String(value)]),
  ).toString();
}

// the dev server (vite.config.mts) and nginx (nginx.conf) proxy /backend/* to the Go server, so every call is same-origin
export const BACKEND_PREFIX = "/backend";

// keeps the status so callers can tell failures apart, eg a taken username (409) or a rate limit (429)
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    // seconds from the Retry-After header, set on 429s when the backend sends one
    readonly retryAfter?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// every call authenticates with the httpOnly session cookie the backend set at login, so no token is
// ever handled here. Resolves to the parsed body, or undefined for an empty (204) response
export async function request<T = void>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_PREFIX}${path}`, init);
  if (!response.ok) {
    const { error } = await response.json().catch(() => ({ error: undefined }));
    const retryAfter = Number(response.headers.get("Retry-After"));
    throw new ApiError(
      response.status,
      error ?? `request failed: ${response.status}`,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined
    );
  }
  const text = await response.text();
  return (text === "" ? undefined : JSON.parse(text)) as T;
}

export const json = (method: "POST" | "PUT" | "DELETE", body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: { "Content-Type": "application/json" },
});

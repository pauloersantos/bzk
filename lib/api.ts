const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100/api/v1";
let token: string | undefined;

async function getToken() {
  if (token) return token;
  const response = await fetch(`${API_URL}/auth/dev-token`, { method: "POST" });
  if (!response.ok) throw new Error("Não foi possível autenticar no ambiente local.");
  token = (await response.json() as { accessToken: string }).accessToken;
  return token;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...init.headers },
  });
  if (response.status === 401 && retry) { token = undefined; return api<T>(path, init, false); }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string; message?: string | string[]; title?: string };
    const message = Array.isArray(body.message) ? body.message.join("; ") : body.detail ?? body.message ?? body.title;
    throw new Error(message || `Falha na operação (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

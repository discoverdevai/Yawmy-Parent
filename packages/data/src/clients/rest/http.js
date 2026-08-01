// Shared fetch wrapper for every real REST client (auth today; children,
// attendance, chat, … as they come online). Centralizes the base URL, JSON
// encoding, bearer-token attachment, empty-body (204) handling, and error
// shaping so individual client methods stay thin.
//
// `getToken` is a lazy getter — it is read at call time, not at construction —
// because the access token only exists after sign-in, whereas the clients are
// built up front (see ApiContext's token seam). `onUnauthorized`, when given,
// fires on a 401/403 for an authenticated request so the app can end the
// session (the backend revokes access by disabling the user, so a 401 on a
// previously-valid token means "session no longer valid").

/** Error carrying the HTTP status and raw response body for callers to map. */
export class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body ?? '';
  }
}

/** Thrown when the request never reached the server (DNS/refused/offline). */
export class NetworkError extends Error {
  constructor(cause) {
    super('Cannot reach the server.');
    this.name = 'NetworkError';
    this.code = 'network';
    if (cause) this.cause = cause;
  }
}

export function createHttp(baseUrl, { getToken, onUnauthorized } = {}) {
  const root = String(baseUrl).replace(/\/+$/, '');

  async function request(path, opts = {}) {
    const { method = 'GET', body, headers = {}, auth = true, signal } = opts;
    const token = auth && typeof getToken === 'function' ? getToken() : null;

    let res;
    try {
      res = await fetch(`${root}${path}`, {
        method,
        headers: {
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (e) {
      console.warn(`[api] ${method} ${path} failed to reach ${root}: ${e?.message}`);
      throw new NetworkError(e);
    }

    if (auth && (res.status === 401 || res.status === 403) && typeof onUnauthorized === 'function') {
      // Let the app decide (usually: end the session). We still throw so the
      // caller's catch runs, but the handler has already been notified.
      try {
        onUnauthorized();
      } catch {
        /* ignore handler errors */
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new HttpError(res.status, text);
    }

    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  return {
    root,
    request,
    get: (path, opts) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
    patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
    del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
  };
}

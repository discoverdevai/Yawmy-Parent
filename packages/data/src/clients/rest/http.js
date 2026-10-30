// Shared fetch wrapper for every real REST client (auth, parent data, chat).
// Centralizes the base URL, JSON encoding, bearer-token attachment, empty-body
// (204) handling, error shaping and session renewal so individual client
// methods stay thin.
//
// `getToken` is a lazy getter — it is read at call time, not at construction —
// because the access token only exists after sign-in, whereas the clients are
// built up front (see ApiContext's token seam).
//
// Session renewal: on a 401/403 for an authenticated request we call
// `refreshAuth()` once (it is single-flight in AuthProvider) and replay the
// request with the new token. The backend answers 403 both for a dead token and
// for business rules (e.g. "outside the geofence"), so the replay is what tells
// them apart: a 403 that survives a successful refresh is a real "forbidden"
// and is returned to the caller without ending the session. Only when the
// refresh itself fails do we call `onUnauthorized` to sign the user out.

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/** Best-effort extraction of the human-readable reason from a Spring error body. */
function messageFromBody(body) {
  if (!body) return null;
  try {
    const parsed = JSON.parse(body);
    const msg = parsed?.message ?? parsed?.detail ?? parsed?.error;
    return typeof msg === 'string' && msg.trim() ? msg.trim() : null;
  } catch {
    return null;
  }
}

/** Error carrying the HTTP status and raw response body for callers to map. */
export class HttpError extends Error {
  constructor(status, body) {
    super(messageFromBody(body) ?? `Request failed (${status})`);
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

export function createHttp(baseUrl, { getToken, onUnauthorized, refreshAuth } = {}) {
  const root = String(baseUrl).replace(/\/+$/, '');

  // Runs `send(token)`; on an auth failure renews the session once and retries.
  async function withAuth(auth, send, label) {
    const token = auth && typeof getToken === 'function' ? getToken() : null;
    let res;
    try {
      res = await send(token);
    } catch (e) {
      if (isDev) console.warn(`[api] ${label} failed to reach the server: ${e?.message}`);
      throw new NetworkError(e);
    }

    if (auth && token && (res.status === 401 || res.status === 403)) {
      let fresh = null;
      let transient = false;
      if (typeof refreshAuth === 'function') {
        try {
          fresh = await refreshAuth();
        } catch {
          // Offline, timeout or a 5xx (e.g. a server cold start): the session
          // may still be valid, so keep it and just report this request failed.
          transient = true;
        }
      }
      if (!fresh && !transient) {
        // The backend refused the refresh token: the session is over.
        try {
          onUnauthorized?.();
        } catch {
          /* ignore handler errors */
        }
      } else {
        try {
          res = await send(fresh);
        } catch (e) {
          throw new NetworkError(e);
        }
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

  function request(path, opts = {}) {
    const { method = 'GET', body, headers = {}, auth = true, signal } = opts;
    return withAuth(
      auth,
      (token) =>
        fetch(`${root}${path}`, {
          method,
          headers: {
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        }),
      `${method} ${path}`,
    );
  }

  /**
   * POST a multipart body (chat attachments, voice notes).
   *
   * Separate from `request` because that one JSON-encodes everything and sets
   * Content-Type itself. A FormData body must be passed through untouched and
   * without an explicit Content-Type — the runtime supplies it along with the
   * multipart boundary, and overriding it leaves the server unable to find the
   * parts.
   */
  function postForm(path, form, opts = {}) {
    const { headers = {}, auth = true, signal } = opts;
    return withAuth(
      auth,
      (token) =>
        fetch(`${root}${path}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
          body: form,
          signal,
        }),
      `POST ${path}`,
    );
  }

  return {
    root,
    request,
    get: (path, opts) => request(path, { ...opts, method: 'GET' }),
    post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
    patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
    del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
    postForm,
  };
}

// ============================================================
// Chat realtime — STOMP over the backend's /ws-chat endpoint.
//
// Two subscriptions, two jobs:
//   /topic/threads/{id}  — the conversation currently on screen
//   /user/queue/chat     — everything else, so the chat list can move a row to
//                          the top and bump its badge without that conversation
//                          being open. Topics are per-thread, so a list screen
//                          would otherwise need one subscription per row.
//
// The socket only ever *receives*. Sending goes over REST, which persists the
// message and then broadcasts it — so a message cannot reach anyone without
// having been saved, and there is no second write path to keep correct.
//
// `@stomp/stompjs` is imported lazily: in mock mode there is no server to talk
// to, and a hard import would make the package require a dependency the app
// only needs when it is pointed at a real backend.
// ============================================================

/**
 * Open a chat socket.
 *
 * @param {object} params
 * @param {string} params.baseUrl                    the REST base, e.g. "https://host/api"
 * @param {() => string|null} params.getToken        lazy access-token getter
 * @param {(msg: object) => void} [params.onThreadMessage]
 * @param {(msg: object) => void} [params.onInboxMessage]
 * @param {(connected: boolean) => void} [params.onConnectionChange]
 * @returns {{ subscribeToThread, unsubscribeFromThread, disconnect, isConnected }}
 */
export function connectChatSocket({
  baseUrl,
  getToken,
  onThreadMessage,
  onInboxMessage,
  onConnectionChange,
} = {}) {
  let client = null;
  let threadSub = null;
  let inboxSub = null;
  let currentThreadId = null;
  let disposed = false;

  const parse = (frame, handler) => {
    try {
      handler?.(JSON.parse(frame.body));
    } catch (e) {
      console.warn('[chatSocket] unreadable frame:', e.message);
    }
  };

  // "https://host/api" → "wss://host/ws-chat?access_token=…"
  //
  // The handshake is a plain GET the WebSocket API builds itself, so there is no
  // way to set an Authorization header on it — the backend reads the token from
  // the query string instead (WebSocketConfig.JwtHandshakeInterceptor).
  const wsUrl = (token) => {
    const origin = String(baseUrl).replace(/\/api\/?$/, '');
    return `${origin.replace(/^http/, 'ws')}/ws-chat?access_token=${encodeURIComponent(token)}`;
  };

  (async () => {
    const token = typeof getToken === 'function' ? getToken() : null;
    if (!baseUrl || !token) {
      // Mock mode, or no session yet. The screens fall back to polling, so this
      // is quiet rather than fatal.
      onConnectionChange?.(false);
      return;
    }

    let Client;
    try {
      ({ Client } = await import('@stomp/stompjs'));
    } catch {
      console.warn('[chatSocket] @stomp/stompjs is not installed — falling back to polling.');
      onConnectionChange?.(false);
      return;
    }
    if (disposed) return;

    client = new Client({
      brokerURL: wsUrl(token),
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}, // switch to console.log when diagnosing
    });

    client.onConnect = () => {
      onConnectionChange?.(true);
      inboxSub = client.subscribe('/user/queue/chat', (f) => parse(f, onInboxMessage));
      // Reconnects land here too, so a thread opened before the drop is
      // resubscribed without the screen having to notice the socket bounced.
      if (currentThreadId) {
        threadSub = client.subscribe(`/topic/threads/${currentThreadId}`, (f) =>
          parse(f, onThreadMessage),
        );
      }
    };

    client.onWebSocketClose = () => {
      threadSub = null;
      inboxSub = null;
      onConnectionChange?.(false);
    };

    client.onStompError = (frame) => {
      console.warn('[chatSocket] STOMP error:', frame.headers?.message);
    };

    client.activate();
  })();

  return {
    /** Listen to one conversation. Replaces any previous thread subscription. */
    subscribeToThread(threadId) {
      currentThreadId = threadId;
      if (!client?.connected || !threadId) return;
      threadSub?.unsubscribe();
      threadSub = client.subscribe(`/topic/threads/${threadId}`, (f) => parse(f, onThreadMessage));
    },

    unsubscribeFromThread() {
      currentThreadId = null;
      try {
        threadSub?.unsubscribe();
      } catch {
        /* socket already gone */
      }
      threadSub = null;
    },

    disconnect() {
      disposed = true;
      try {
        threadSub?.unsubscribe();
        inboxSub?.unsubscribe();
        client?.deactivate();
      } catch {
        /* nothing to close */
      }
      client = null;
    },

    isConnected() {
      return !!client?.connected;
    },
  };
}

import { persistQueryClient } from '@tanstack/react-query-persist-client';

let mmkv = null;
try {
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV({ id: 'nms.query' });
} catch {
  mmkv = null;
}

const mmkvPersister = {
  persistClient: async (client) => {
    if (!mmkv) return;
    mmkv.set('cache', JSON.stringify(client));
  },
  restoreClient: async () => {
    if (!mmkv) return undefined;
    const raw = mmkv.getString('cache');
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    if (!mmkv) return;
    mmkv.delete('cache');
  },
};

/**
 * Wires the QueryClient cache to MMKV. Idempotent: safe to call multiple times.
 *
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function attachPersistence(queryClient) {
  if (!mmkv) return;
  persistQueryClient({
    queryClient,
    persister: mmkvPersister,
    maxAge: 1000 * 60 * 60 * 24,
  });
}

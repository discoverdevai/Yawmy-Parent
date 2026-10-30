// The query cache is deliberately NOT persisted to disk.
//
// It holds children's medical notes, allergies, emergency contacts, incidents
// and chat. Earlier builds wrote it unencrypted to MMKV for 24h, kept it after
// sign-out and shared it between accounts on the same phone. Until an encrypted,
// per-user store exists, the cache lives in memory only; this module just
// removes any copy an older build left behind.

let mmkv = null;
try {
  const { MMKV } = require('react-native-mmkv');
  mmkv = new MMKV({ id: 'nms.query' });
} catch {
  mmkv = null;
}

/** Deletes the query cache an older build may have written to disk. Safe to call anytime. */
export function purgePersistedCache() {
  try {
    mmkv?.clearAll();
  } catch {
    /* nothing persisted or storage unavailable */
  }
}

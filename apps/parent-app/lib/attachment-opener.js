import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Open a chat attachment in whatever app the device uses for that file type.
 *
 * `Linking.openURL` cannot be used here. It hands the URL to the OS browser,
 * which has no session — and every `/api/files/**` path requires
 * authentication, so the parent would get a login wall or a blank 403 page
 * instead of their document, with nothing to explain why.
 *
 * So: download it with the bearer token, cache it under its real filename (the
 * share sheet shows that name, and a UUID would tell the reader nothing), then
 * hand the local copy to the OS.
 *
 * @param {{uri: string, filename?: string, id?: string}} attachment
 * @param {Record<string,string>|undefined} authHeaders
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function openAttachment(attachment, authHeaders) {
  const remote = attachment?.uri;
  if (!remote) return { ok: false, reason: 'This attachment has no file.' };

  // A local file — an optimistic bubble whose upload has not finished — is
  // already on disk and needs no download.
  if (!/^https?:/i.test(remote)) return shareLocal(remote);

  const safeName = sanitize(attachment.filename) || `attachment-${attachment.id ?? Date.now()}`;
  const target = `${FileSystem.cacheDirectory}${safeName}`;

  try {
    const result = await FileSystem.downloadAsync(remote, target, { headers: authHeaders });
    if (result.status !== 200) {
      return { ok: false, reason: `The file could not be downloaded (${result.status}).` };
    }
    return shareLocal(result.uri);
  } catch (e) {
    return { ok: false, reason: e?.message || 'The file could not be downloaded.' };
  }
}

async function shareLocal(uri) {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, reason: 'This device cannot open attachments.' };
    }
    await Sharing.shareAsync(uri);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e?.message || 'The file could not be opened.' };
  }
}

/** Keep the extension — the OS picks the opening app from it — but nothing that could escape the cache directory. */
function sanitize(name) {
  if (!name) return null;
  return String(name).replace(/[/\\?%*:|"<>]/g, '_').slice(-120);
}

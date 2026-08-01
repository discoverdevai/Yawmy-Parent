// Resolve the API base URL the same way app/_layout.jsx does, for code that
// needs to build absolute URLs to backend file endpoints (/api/files/**).
import Constants from 'expo-constants';

export function getApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.trim()) return fromExtra.trim();
  return null;
}

// Turn a backend fileUrl (often relative like "/api/files/media/{id}") into an
// absolute URL. Absolute http(s) URLs (e.g. mock picsum links) pass through.
export function resolveFileUrl(fileUrl) {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const base = getApiBaseUrl();
  return base ? `${base.replace(/\/+$/, '')}${fileUrl}` : fileUrl;
}

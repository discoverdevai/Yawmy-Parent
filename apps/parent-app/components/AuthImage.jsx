// Image that attaches the session bearer token when loading a backend file
// endpoint (/api/files/**), which requires Authorization. Absolute non-backend
// URLs (e.g. mock picsum links) load without a header.
import React from 'react';
import { Image } from 'react-native';
import { useAuth } from '@nms/data';
import { resolveFileUrl } from '../lib/apiBase';

export function AuthImage({ uri, style, resizeMode = 'cover', ...rest }) {
  const { session } = useAuth();
  const token = session?.accessToken;
  const full = resolveFileUrl(uri);
  if (!full) return null;

  const needsAuth = /\/api\/files\//.test(full);
  const source =
    needsAuth && token ? { uri: full, headers: { Authorization: `Bearer ${token}` } } : { uri: full };

  return <Image source={source} style={style} resizeMode={resizeMode} {...rest} />;
}

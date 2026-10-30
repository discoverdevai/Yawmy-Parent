// Image that attaches the session bearer token when loading a file from our own
// backend (/api/files/** requires Authorization). Any other host — including a
// URL that merely contains "/api/files/" — loads without the token.
import React from 'react';
import { Image } from 'react-native';
import { useAuthHeadersFor } from '@nms/data';
import { resolveFileUrl } from '../lib/apiBase';

export function AuthImage({ uri, style, resizeMode = 'cover', ...rest }) {
  const headersFor = useAuthHeadersFor();
  const full = resolveFileUrl(uri);
  if (!full) return null;

  const headers = headersFor(full);
  const source = headers ? { uri: full, headers } : { uri: full };

  return <Image source={source} style={style} resizeMode={resizeMode} {...rest} />;
}

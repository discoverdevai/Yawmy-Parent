// Renders a child's real photo from the backend (GET /api/files/children/{id}/photo,
// which requires the bearer token) and falls back to the bundled avatar when
// there is no photoUrl or the fetch fails (e.g. the file was wiped by a Render
// redeploy, so the endpoint 404s).
import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { useAuthHeadersFor } from '@nms/data';
import { resolveFileUrl } from '../lib/apiBase';

const FALLBACK = require('../assets/home/avatar.png');

export function ChildAvatar({ photoUrl, size = 48, style }) {
  const headersFor = useAuthHeadersFor();
  const [failed, setFailed] = useState(false);

  // Reset the failure flag if the child (photoUrl) changes.
  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const full = photoUrl ? resolveFileUrl(photoUrl) : null;
  const base = { width: size, height: size, borderRadius: size / 2, backgroundColor: '#E7ECDD' };

  if (!full || failed) {
    return <Image source={FALLBACK} style={[base, style]} />;
  }

  const headers = headersFor(full);
  const source = headers ? { uri: full, headers } : { uri: full };

  return <Image source={source} style={[base, style]} onError={() => setFailed(true)} />;
}

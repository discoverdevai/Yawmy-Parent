import { QueryClient, focusManager } from '@tanstack/react-query';

let focusWired = false;

// React Native has no window focus event, so TanStack never learns the app came
// back to the foreground. Wire it to AppState once, so stale screens (e.g. a
// "Check In" button after the teacher already checked the child in) refetch.
function wireAppFocus() {
  if (focusWired) return;
  focusWired = true;
  try {
    const { AppState, Platform } = require('react-native');
    if (Platform.OS === 'web') return; // the browser's own focus events already work
    focusManager.setEventListener((setFocused) => {
      const sub = AppState.addEventListener('change', (state) => setFocused(state === 'active'));
      return () => sub.remove();
    });
  } catch {
    /* not running under React Native */
  }
}

/** Retry network failures and 5xx; a 4xx is a real answer and retrying it only delays the error. */
function shouldRetry(failureCount, error) {
  const status = error?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) return false;
  return failureCount < 2;
}

export function createQueryClient() {
  wireAppFocus();
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

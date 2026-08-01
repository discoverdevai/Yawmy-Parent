// Deep-link entry point for the emailed parent invitation. The backend sends
// `nurseryparent://invitation?token=…` (a query param), whereas the in-app path
// is `/invite/[token]` (a path param). `InviteLanding` reads `token` from
// `useLocalSearchParams()` either way, so we reuse it verbatim rather than
// duplicating the screen.
export { default } from './invite/[token]';

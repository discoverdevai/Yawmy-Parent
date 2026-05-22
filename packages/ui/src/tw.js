import clsx from 'clsx';

// Plain class join. We deliberately do NOT run tailwind-merge here:
// tailwind-merge is built for web Tailwind and groups classes like
// `text-base` (font size) and `text-neutral-600` (text color) under the
// same `text-*` namespace, then drops all but the last one. NativeWind
// has its own resolver that handles last-wins per *style property*, so
// passing the raw, joined class string straight through is safer.
export function cn(...inputs) {
  return clsx(inputs);
}

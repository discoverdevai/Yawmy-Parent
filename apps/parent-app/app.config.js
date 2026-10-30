/* eslint-disable */
module.exports = ({ config }) => ({
  ...config,
  name: 'NMS Parent',
  slug: 'nms-parent-app',
  owner: 'bora15',
  // `nms-parent` is our own scheme; `nurseryparent` matches the deep link the
  // backend emails in parent invitations (nurseryparent://invitation?token=…),
  // so those links open this app straight onto the invite screen.
  scheme: ['nms-parent', 'nurseryparent'],
  version: '1.0.0',
  // Fingerprint ties OTA updates to the exact native build they are compatible
  // with; a fixed string let a JS update reach a binary missing its native code.
  runtimeVersion: { policy: 'fingerprint' },
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  icon: './assets/illustrations/invite-welcome-card.png',
  splash: {
    image: './assets/illustrations/invite-welcome-card.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: 'com.nms.parent',
    supportsTablet: false,
  },
  android: {
    package: 'com.nms.parent',
    // The app holds children's medical notes and chat; keep its data out of
    // Google auto-backup so it isn't restored onto another device.
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/illustrations/invite-welcome-card.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/illustrations/invite-welcome-card.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-location',
      {
        // Check-in only reads location while the app is open; "Always" was
        // never needed and is a store-review red flag.
        locationWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location to confirm you are at the nursery when you check your child in or out.',
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    [
      'expo-audio',
      {
        // Without this the iOS build has no microphone usage text and recording
        // a voice note in chat crashes the app.
        microphonePermission:
          'Allow $(PRODUCT_NAME) to use the microphone to record voice messages to the nursery.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Allow $(PRODUCT_NAME) to access your photos to send them to the nursery in chat.',
        cameraPermission:
          'Allow $(PRODUCT_NAME) to use the camera to take photos to send to the nursery in chat.',
        microphonePermission: false,
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.NMS_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? null,
    sentryDsn: process.env.NMS_SENTRY_DSN ?? null,
    defaultLocale: process.env.NMS_DEFAULT_LOCALE ?? 'en',
    eas: {
      projectId: '82a61b48-801a-47ac-a5c3-c72fd85b420e',
    },
  },
  experiments: {
    typedRoutes: false,
  },
});

/* eslint-disable */
module.exports = ({ config }) => ({
  ...config,
  name: 'NMS Parent',
  slug: 'nms-parent-app',
  scheme: 'nms-parent',
  version: '0.0.0',
  runtimeVersion: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.nms.parent',
    supportsTablet: false,
  },
  android: {
    package: 'com.nms.parent',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location to verify nursery check-ins.',
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.NMS_API_BASE_URL ?? null,
    useMocks: process.env.NMS_USE_MOCKS !== 'false',
    sentryDsn: process.env.NMS_SENTRY_DSN ?? null,
    defaultLocale: process.env.NMS_DEFAULT_LOCALE ?? 'en',
  },
  experiments: {
    typedRoutes: false,
  },
});

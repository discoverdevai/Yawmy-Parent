/* eslint-disable */
module.exports = ({ config }) => ({
  ...config,
  name: 'NMS Staff',
  slug: 'nms-staff-app',
  scheme: 'nms-staff',
  version: '0.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'com.nms.staff',
    supportsTablet: false,
    config: {
      googleMapsApiKey: process.env.NMS_GOOGLE_MAPS_KEY ?? '',
    },
  },
  android: {
    package: 'com.nms.staff',
    config: {
      googleMaps: {
        apiKey: process.env.NMS_GOOGLE_MAPS_KEY ?? '',
      },
    },
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
    googleMapsKey: process.env.NMS_GOOGLE_MAPS_KEY ?? null,
    sentryDsn: process.env.NMS_SENTRY_DSN ?? null,
    defaultLocale: process.env.NMS_DEFAULT_LOCALE ?? 'en',
  },
  experiments: {
    typedRoutes: false,
  },
});

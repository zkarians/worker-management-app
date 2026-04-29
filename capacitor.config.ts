import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workermanagement.app',
  appName: '웅동물류센터',
  webDir: 'public',  // Not used in server mode, but required

  // Server configuration for WebView
  server: {
    // Production server URL
    url: 'https://worker-management-app.vercel.app',

    // For local development, uncomment below:
    // url: 'http://192.168.0.124:3000',
    // cleartext: true,

    // Allow navigation to external URLs
    allowNavigation: [
      'localhost',
      '*.cloudtype.app',
      '192.168.*.*',
      '10.0.*.*',
    ],
  },

  android: {
    // Allow HTTP connections for development
    allowMixedContent: true,
  },
};

export default config;

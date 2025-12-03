import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.workermanagement.app',
  appName: '웅동야간출하',
  webDir: 'public',  // Not used in server mode, but required

  // Server configuration for WebView
  server: {
    // Production server URL
    url: 'https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app',

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

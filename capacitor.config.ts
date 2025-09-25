import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.hiremebuddy.mobile',
  appName: 'HireMeBuddy',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      requestPermissionOnLoad: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#007B6A",
      overlaysWebView: false
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    backgroundColor: "#F5F5F5"
  }
};

export default config;
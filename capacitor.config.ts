import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.hiremebuddy.mobile',
  appName: 'HireMeBuddy',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#00A693",
      showSpinner: false,
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
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
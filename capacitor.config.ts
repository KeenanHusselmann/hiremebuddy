import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.hiremebuddy.mobile',
  appName: 'HireMeBuddy',
  webDir: 'dist',
  server: {
    url: 'https://hiremebuddy.app',
    cleartext: false
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#00A693",
      showSpinner: false,
      launchAutoHide: false
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#00A693"
    }
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;
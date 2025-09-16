import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.hiremebuddy.mobile.dev',
  appName: 'HireMeBuddy Dev',
  webDir: 'dist',
  server: {
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: "#f97316",
      showSpinner: true
    },
    StatusBar: {
      style: "DEFAULT",
      backgroundColor: "#f97316"
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
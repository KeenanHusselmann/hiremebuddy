import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.14b47211b3034860bc73b25e391a98e0',
  appName: 'hiremebuddy',
  webDir: 'dist',
  server: {
    url: 'https://14b47211-b303-4860-bc73-b25e391a98e0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
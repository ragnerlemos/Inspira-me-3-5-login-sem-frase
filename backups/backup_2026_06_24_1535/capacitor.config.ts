import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inspireme2.app',
  appName: 'InspireMe',
  webDir: 'out',
  server: {
    url: 'https://inspira-me3-0.vercel.app/',
    cleartext: true
  },
  plugins: {
    Clipboard: {
      webAuth: {
        blockRobots: true,
        blockPartialBotDetection: true
      }
    }
  }
};

export default config;

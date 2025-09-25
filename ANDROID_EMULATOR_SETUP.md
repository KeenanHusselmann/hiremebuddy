# Android Emulator Setup Guide for HireMeBuddy

## Current Status
- ✅ Android Studio: Installed
- ✅ Android SDK: Available 
- ✅ Capacitor: Configured (v7.4.2)
- ✅ VS Code Extensions: Installed (Android iOS Emulator, AVD Manager)
- ⚠️ AVD: Needs to be created

## Steps to Create and Start an Android Emulator

### Option 1: Using Android Studio (Recommended)
1. **Android Studio should be opening now** with your HireMeBuddy project
2. Once loaded, go to `Tools` → `AVD Manager`
3. Click `Create Virtual Device`
4. Choose a device (recommended: Pixel 4 or Pixel 7)
5. Select a system image (recommended: API 33 or 34)
6. Name your AVD (e.g., "HireMeBuddy_Test")
7. Click `Finish`
8. Start the emulator by clicking the ▶️ play button

### Option 2: Using VS Code Extension
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "AVD Manager" or "Emulate"
3. Follow the extension prompts to create/start an emulator

### Option 3: Command Line (After creating AVD)
Once you have an AVD created, you can start it from VS Code terminal:
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" @YOUR_AVD_NAME
```

## Testing the App
After the emulator starts:
1. Run: `npx cap run android`
2. Or manually install the APK we built earlier

## Troubleshooting
- If emulator doesn't start: Check virtualization is enabled in BIOS
- If app doesn't install: Try `npx cap clean android && npx cap sync android`
- If push notifications don't work: Make sure Firebase is configured

## Quick Commands Reference
```powershell
# List AVDs (after creation)
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -list-avds

# Start specific AVD
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" @AVD_NAME

# Run app on emulator
npx cap run android

# Open in Android Studio
npx cap open android
```
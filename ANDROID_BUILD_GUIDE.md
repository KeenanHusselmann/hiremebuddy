# HireMeBuddy Android Build Guide

## Overview
This guide will help you build the HireMeBuddy Android application from the PWA using Capacitor.

## Prerequisites
- Android Studio (latest version)
- Android SDK with API level 34+
- Node.js and npm installed
- **Java Development Kit (JDK) 17** (Important: JDK 24 is too new and causes build errors)

## Java Version Setup
⚠️ **Critical**: Use JDK 17 for Android development. JDK 24 causes "Unsupported class file major version 68" errors.

### Install JDK 17:
1. Download JDK 17 from Oracle or OpenJDK
2. Install and set JAVA_HOME environment variable
3. Or use Android Studio's embedded JDK

### If you have multiple Java versions:
```bash
# Check current version
java -version

# Set JAVA_HOME to JDK 17 path
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

## Build Steps

### 1. Initial Setup (Already Completed)
```bash
# Add Android platform
npx cap add android

# Build web assets
npm run build

# Sync with Android
npx cap sync android
```

### 2. Open in Android Studio
```bash
npx cap open android
```

### 3. Build APK in Android Studio

#### Debug Build:
1. Open Android Studio
2. Select "Build" → "Build Bundle(s) / APK(s)" → "Build APK(s)"
3. Wait for build to complete
4. APK will be in: `android/app/build/outputs/apk/debug/`

#### Release Build:
1. Generate signed APK: "Build" → "Generate Signed Bundle / APK"
2. Create new keystore or use existing
3. Select release build variant
4. APK will be in: `android/app/build/outputs/apk/release/`

### 4. Install on Device
```bash
# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or use Android Studio's "Run" button
```

## App Configuration

### Theme Colors (Applied)
- Primary: #00A693 (Teal)
- Primary Dark: #007B6A 
- Accent: #00D4B5
- Background: #F5F5F5

### App Details
- **Package Name**: app.hiremebuddy.mobile
- **App Name**: HireMeBuddy
- **Version**: 1.0 (Build 1)
- **Target SDK**: Latest Android API
- **Min SDK**: API 24 (Android 7.0)

### Features Included
- ✅ Professional launch screen with animations
- ✅ Teal theme throughout the app
- ✅ Push notifications support
- ✅ Full PWA functionality
- ✅ Responsive design for mobile

## Testing Checklist
- [ ] Launch screen displays correctly
- [ ] App theme matches web version
- [ ] All navigation works
- [ ] Push notifications function
- [ ] Camera/location permissions work
- [ ] Performance is smooth

## Next Steps
1. Test the app thoroughly on physical device
2. Generate release-signed APK for distribution
3. Prepare for Google Play Store submission
4. Add app store assets (screenshots, descriptions)

## Troubleshooting
- **Build errors with Java 24**: Install JDK 17 and set JAVA_HOME correctly
- **"Unsupported class file major version 68"**: Use JDK 17 instead of JDK 24
- **Gradle daemon issues**: Run `.\gradlew --stop` then retry build
- **Sync issues**: Run `npx cap sync android` again
- **Theme not applied**: Check colors.xml and rebuild
- **Launch screen issues**: Verify framer-motion animations

### Common Solutions:
```bash
# Clean Gradle cache
.\gradlew clean

# Stop Gradle daemon
.\gradlew --stop

# Rebuild project
.\gradlew assembleDebug
```

## File Locations
- **Android Project**: `android/`
- **APK Outputs**: `android/app/build/outputs/apk/`
- **Assets**: `android/app/src/main/assets/public/`
- **Resources**: `android/app/src/main/res/`
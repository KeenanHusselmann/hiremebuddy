# HireMeBuddy - Service Marketplace Platform

## Project info

**Live URL**: https://hiremebuddy.app
**GitHub**: https://github.com/KeenanHusselmann/hiremebuddy

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/14b47211-b303-4860-bc73-b25e391a98e0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What is HireMeBuddy?

HireMeBuddy is a comprehensive service marketplace platform that connects service providers with clients in Namibia. Built with modern web technologies and designed for both web and mobile platforms.

### Key Features
- 🔍 Location-based service discovery
- 💬 Real-time messaging between clients and providers
- 📱 Native mobile app support (Android & iOS)
- 🌍 Multi-language support
- ⭐ Rating and review system
- 📍 Google Maps integration
- 🔔 Push notifications
- 💳 Secure booking and payment system

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database & Backend)
- Capacitor (Mobile App Framework)
- Google Maps API

## Mobile App Development

### Prerequisites
- Node.js 18+ and npm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup Mobile Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add mobile platforms**
   ```bash
   # Add Android platform
   npm run cap:add:android
   
   # Add iOS platform (macOS only)
   npm run cap:add:ios
   ```

3. **Development with live reload**
   ```bash
   # Run on Android with development server
   npm run cap:run:android:dev
   
   # Run on iOS with development server
   npm run cap:run:ios:dev
   ```

4. **Production builds**
   ```bash
   # Build for Android
   npm run cap:build:android
   
   # Build for iOS
   npm run cap:build:ios
   ```

### Configuration

- **Production**: Uses `capacitor.config.ts` pointing to `https://hiremebuddy.app`
- **Development**: Uses `capacitor.config.dev.ts` pointing to `http://localhost:8080`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/14b47211-b303-4860-bc73-b25e391a98e0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

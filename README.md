# Panda Music Streamer 🐼

Stream your OneDrive music collection on your iPhone — built entirely on Windows, no Mac required.

Featuring a vibrant gradient UI with glass-morphism design, purple-to-pink accent palette, and smooth animations throughout.

## What You Get

- Browse your OneDrive Music folder organized by Artist/Album
- **Classic iPod-style Cover Flow** — 3D perspective album carousel
- Stream MP3, FLAC, M4A, and more directly from OneDrive
- Background playback (music continues when app is minimized)
- Lock screen controls (play/pause/skip from Control Center)
- Search across your entire library
- Offline caching (download tracks for offline listening)
- **Vibrant gradient theme** with purple/pink/cyan accents
- **Dark glass-morphism** design language

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Windows PC** | You have this ✓ |
| **Node.js 18+** | Installed on your PC |
| **npm or yarn** | Comes with Node.js |
| **Microsoft Account** | Your OneDrive personal account |
| **Expo Account** | Free - sign up at [expo.dev/signup](https://expo.dev/signup) |
| **iPhone with iOS 16+** | Your device |
| **Apple ID** | Free or paid (see below) |

### Apple Developer Program - Do You Need It?

| Option | Cost | Certificate Valid | Best For |
|--------|------|-------------------|----------|
| **Free Apple ID** | $0 | 7 days | Testing - reinstall weekly |
| **Apple Developer Program** | $99/year | 12 months | Permanent personal use |

**Without a paid account**: The app works perfectly but expires after 7 days. You just reinstall via the same link. For personal use, this is totally fine.

## Step 1: Register Azure AD Application

This app needs access to your OneDrive via Microsoft Graph API.

1. Go to https://entra.microsoft.com
2. Sign in with your Microsoft account
3. Navigate to **Identity** → **Applications** → **App registrations**
4. Click **+ New registration**
5. Enter:
   - **Name**: `Panda Music Streamer`
   - **Supported account types**: **Personal Microsoft accounts only**
   - **Redirect URI (optional)**: Leave blank for now
6. Click **Register**

### Configure Redirect URI

After registration:
1. On the app's **Overview** page, copy the **Application (client) ID** - you'll need this
2. Go to **Manage** → **Authentication**
3. Click **+ Add a platform**
4. Select **iOS / macOS**
5. Enter Bundle ID: `com.pandamusic.streamer`
6. Click **Configure** - this generates a redirect URI like `msauth.com.pandamusic.streamer://auth`

Also add a mobile redirect URI:
1. Click **+ Add a platform** again
2. Select **Mobile and desktop applications**
3. Check the box for `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. Add a **Custom redirect URI**: `pandamusicstreamer://` 
5. Click **Configure**

### Set API Permissions

1. Go to **Manage** → **API permissions**
2. Click **+ Add a permission**
3. Select **Microsoft Graph** → **Delegated permissions**
4. Search and add:
   - `Files.Read` (read your files)
   - `User.Read` (read your profile)
5. Click **Add permissions**
6. Click **Grant admin consent** (for your account only - this is fine for personal use)

## Step 2: Configure the App

1. Open `panda-music-streamer` in your code editor
2. Edit `src/services/auth.ts`:
   - Replace `YOUR_AZURE_CLIENT_ID` on line 9 with the Application (client) ID from Azure
3. Edit `src/hooks/useAuth.ts`:
   - Replace `YOUR_AZURE_CLIENT_ID` on line 13 with the same Application (client) ID

## Step 3: Install Dependencies

```bash
# Open terminal in the project folder
cd J:\Source\PandaMusicStream

# Install all dependencies
npm install

# Install EAS CLI globally
npm install -g eas-cli
```

## Step 4: Log In to Expo & Configure

```bash
# Log in to Expo
eas login
# (follow prompts to enter your expo.dev credentials)

# Configure the project for EAS Build
eas build:configure
```

## Step 5: Build for iOS (Cloud Build - No Mac Needed!)

EAS Build compiles your app on Apple's macOS servers in the cloud.

### Option A: Development Build (for testing)

```bash
# Build for iOS Simulator (runs on Mac - skip this)
# Instead, build directly for device:
eas build --platform ios --profile preview
```

This takes about 15-20 minutes. EAS Build will:
1. Upload your code to Expo's servers
2. Run a macOS build environment in the cloud
3. Compile, sign, and package your app
4. Return a downloadable `.ipa` file

### Option B: Free Developer Account (7-day expiry)

When the build prompts for Apple credentials:
- Select **"I will provide all the credentials"** (not "Let EAS handle")
- OR choose **"Enter your Apple Developer credentials manually"**

EAS will create a free 7-day certificate for you.

### Option C: Paid Developer Account ($99/year)

EAS Build handles everything automatically:
- Distribution certificates
- Provisioning profiles
- App IDs

Just enter your Apple Developer credentials when prompted.

## Step 6: Install on Your iPhone

### After the build completes:

1. Visit the build URL provided by EAS (or check https://expo.dev/builds)
2. Download the `.ipa` file on your iPhone
3. The build page also shows a QR code - scan it on your iPhone

### Install via Safari on iPhone:

1. Go to the build download URL in Safari
2. Tap **Download**
3. Go to **Settings** → **General** → **VPN & Device Management**
4. Tap the developer profile and tap **Trust**

### Enable Developer Mode (iOS 16+):

1. Go to **Settings** → **Privacy & Security**
2. Scroll to **Developer Mode**
3. Toggle **On** and follow prompts to restart

### Install the app:

1. On the build page, tap **Install**
2. The app installs on your home screen
3. Open **Panda Music Streamer**
4. Sign in with your Microsoft account
5. Grant permissions (Files.Read, User.Read)
6. Your music library loads automatically!

## Step 7: Organize Your Music on OneDrive

The app looks for music in your OneDrive under:

```
OneDrive/
  Music/
    Artist Name/
      Album Name/
        song1.mp3
        song2.flac
        ...
```

- Create a `Music` folder at the root of your OneDrive if you don't have one
- Organize as: `Music/Artist/Album/tracks`
- You can add loose songs directly in artist folders too
- Supported formats: MP3, FLAC, M4A, WAV, AAC, OGG, ALAC

## Rebuilding After Updates

```bash
# Make your code changes, then rebuild
eas build --platform ios --profile preview --message "Bug fix"

# View all builds
eas build:list
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `YOUR_AZURE_CLIENT_ID` not replaced | Edit `src/services/auth.ts` and `src/hooks/useAuth.ts` with your real client ID |
| Build fails on iOS | Make sure `eas build:configure` ran successfully |
| Login redirects but doesn't complete | Check the redirect URI in Azure matches `pandamusicstreamer://` |
| "Not Authenticated" error | Sign out and sign in again |
| No music shows up | Make sure you have a `Music` folder at the root of your OneDrive |
| Background playback stops | Verify `enableBackgroundPlayback: true` in `app.json` plugins |
| App expires after 7 days | Free Apple ID limitation - reinstall or get paid developer account |
| App crashes on startup | Run `npx expo doctor` to check for issues |
| Cache issues | Delete the app and reinstall, or clear cache from queue screen |

## Project Structure

```
panda-music-streamer/
├── app/                    # Screens (Expo Router)
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Splash screen
│   ├── login.tsx           # Microsoft sign-in
│   └── (tabs)/             # Main tab screens
│       ├── _layout.tsx     # Tab bar + MiniPlayer
│       ├── library.tsx     # Music browser
│       ├── carousel.tsx    # Cover Flow 3D album carousel
│       ├── search.tsx      # Search
│       ├── player.tsx      # Now playing
│       ├── queue.tsx       # Queue management
│       ├── settings.tsx    # Settings + 12-band EQ
│       └── album-detail.tsx# Album detail / track list
├── src/
│   ├── services/           # Business logic
│   │   ├── auth.ts         # Microsoft OAuth2
│   │   ├── onedrive.ts     # Graph API client
│   │   ├── audio.ts        # Audio playback
│   │   └── cache.ts        # Offline caching
│   ├── hooks/              # React hooks + context
│   │   ├── useAuth.ts
│   │   ├── useOneDrive.ts
│   │   ├── usePlayer.ts
│   │   ├── useQueue.ts
│   │   ├── AuthContext.tsx
│   │   └── PlayerContext.tsx
│   ├── components/         # UI components
│   ├── lib/               # Utilities
│   └── types/             # TypeScript types
├── app.json               # Expo configuration
├── eas.json               # EAS Build profiles
├── global.css             # Tailwind base styles
└── tailwind.config.js     # Panda color theme
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | React Native + Expo SDK 57 |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS) + expo-linear-gradient |
| Auth | Microsoft OAuth2 (expo-auth-session) |
| API | Microsoft Graph API |
| Audio | expo-audio (background playback, lock screen) |
| Storage | expo-secure-store, expo-file-system |
| iOS Build | EAS Build (cloud, no Mac needed) |

## Version History

- **1.0.0** - Initial release

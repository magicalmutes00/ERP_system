# CampusERP - React Native Mobile App

A bare React Native (TypeScript + Redux Toolkit) port of the Flutter `mobile/` app, talking to the existing NestJS backend at `campus-erp/backend/`.

## Stack

- **React Native** 0.75.4 (bare, no Expo)
- **TypeScript** strict mode
- **Redux Toolkit** + **react-redux** for state
- **TanStack Query** for server state caching
- **React Navigation 6** (native stack + bottom tabs)
- **Axios** with auth-token refresh interceptor
- **react-native-keychain** for secure token storage
- **@react-native-async-storage/async-storage** for non-sensitive cache
- **react-native-linear-gradient** for gradient hero/UI
- **lucide-react-native** for icons
- **react-native-vector-icons** fallback

## Project Structure

```
mobile-rn/
  src/
    api/           # Axios client + all endpoint modules
    components/    # Reusable: AppShell, StatCard, ActivityRow, InsightCard, icons
    navigation/    # AppNavigator (auth gate + tabs + stack)
    screens/       # 15+ feature screens
    services/      # storage, cache, sync
    store/         # Redux store + slices (auth, init, dashboard)
    theme/         # colors, spacing, typography
    types/         # Shared TS types
  android/         # Native Android project
  index.js         # RN entry
  App.tsx          # Root with Providers
  package.json
```

## Backend Connection

The app expects the NestJS backend running on `http://localhost:4000` (your dev machine).
On Android emulator, `localhost` refers to the emulator itself — so the API client uses
`http://10.0.2.2:4000/api/v1` (Android emulator's host loopback alias).

If you're on a physical device, change `API_BASE_URL` in `src/api/client.ts` to your
machine's LAN IP (e.g. `http://192.168.1.50:4000/api/v1`).

## Setup

### 1. Install dependencies
```powershell
cd campus-erp\mobile-rn
npm install
```

### 2. Configure Android SDK
Make sure `ANDROID_HOME` is set, or create `android/local.properties`:
```
sdk.dir=C:\\Users\\<YOU>\\AppData\\Local\\Android\\Sdk
```

### 3. Run Metro bundler
```powershell
npm start
```

### 4. Build & run on Android (separate terminal)
```powershell
npm run android
```

## Default Admin Login
- **Email:** `admin@campus.edu`
- **Password:** `admin123`

(Seeded by `backend/prisma/seed.ts` against MySQL `campus_erp` database.)

## Features

- Splash → Login → Auth gate
- Bottom tabs: Home / Students / Faculty / Courses / More
- Stack: Attendance, Exams, Assignments, Fees, Notifications, Chat, AI, Settings
- Dashboard with AI insights, stat cards, recent activity
- Secure token storage via Keychain
- Token refresh interceptor on 401
- Optimistic-ready React Query caching
- Logout from More / Settings

## Notes

- This is a **bare RN** project. The `android/` folder is fully set up; iOS is not scaffolded (user is on Android only).
- `usesCleartextTraffic="true"` is enabled for `http://10.0.2.2` dev. For production use HTTPS.
- Cleartext domains can be restricted via `network_security_config.xml` later.
- `MainApplication.kt` already auto-links `react-native-keychain` package — no manual `getPackages().add(...)` needed for most libs (autolinking handles it).
- Some screens use mock data when the backend endpoint is empty — fall through to placeholder.

## Troubleshooting

### Gradle / Kotlin build cache corruption
On Windows, if you hit Kotlin incremental cache errors, run:
```powershell
cd android
.\gradlew --stop
rd /s /q .gradle
rd /s /q app\build
cd ..
npm run android
```

### Metro can't connect
Make sure `adb reverse tcp:8081 tcp:8081` is set, or use `npx react-native start --reset-cache`.

### White screen / no JS bundle
The emulator needs to reach Metro. Use `10.0.2.2` for host, not `localhost`. If you're testing on a real device, enable `adb reverse tcp:8081 tcp:8081`.

# Expo Workflow Reference

## What is Expo?

Expo is a framework and toolchain built on top of React Native. It provides:
- Managed build system (no Xcode / Android Studio needed for most work)
- Pre-built native modules (camera, notifications, location, etc.)
- Expo Go app for testing on device without building
- EAS (Expo Application Services) for cloud builds and OTA updates

---

## Starting the Dev Server

```bash
bun start           # Start Expo dev server (equivalent to npx expo start)
bun run ios         # Open in iOS Simulator
bun run android     # Open in Android Emulator
```

In the Expo CLI terminal, press:
- `i` — open iOS Simulator
- `a` — open Android Emulator
- `w` — open in web browser
- `r` — reload app
- `m` — toggle menu

---

## Installing Packages

**Always use `npx expo install` for native packages:**

```bash
npx expo install expo-image          # Expo module
npx expo install expo-async-storage  # Async storage
npx expo install @react-navigation/bottom-tabs  # Navigation
```

This ensures the package version is compatible with your Expo SDK (54 in this project).

For pure JS packages (no native code), `bun add` / `npm install` is fine:
```bash
bun add date-fns           # Date utilities
bun add zustand            # State management
```

---

## app.json — App Configuration

```json
{
  "expo": {
    "name": "todo-app",
    "slug": "todo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.yourname.todoapp",
      "supportsTablet": false
    },
    "android": {
      "package": "com.yourname.todoapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## Expo SDK Modules (Available Without Install)

These come with Expo SDK 54:

| Module | Import | Use |
|--------|--------|-----|
| StatusBar | `expo-status-bar` | System status bar styling |
| Asset | `expo-asset` | Load static assets |
| Constants | `expo-constants` | App version, device info |
| Linking | `expo-linking` | Deep links, open URLs |

---

## Common Expo Packages to Install

```bash
# Persistent storage
npx expo install @react-native-async-storage/async-storage

# Image picker (camera/gallery)
npx expo install expo-image-picker

# Notifications
npx expo install expo-notifications

# Haptic feedback
npx expo install expo-haptics

# Better Image component
npx expo install expo-image

# Secure storage (for tokens)
npx expo install expo-secure-store

# File system access
npx expo install expo-file-system
```

---

## Using AsyncStorage (Persisting Todos)

```bash
npx expo install @react-native-async-storage/async-storage
```

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const TODOS_KEY = '@todos';

// Save
async function saveTodos(todos: Todo[]): Promise<void> {
  await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

// Load
async function loadTodos(): Promise<Todo[]> {
  const raw = await AsyncStorage.getItem(TODOS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Delete
async function clearTodos(): Promise<void> {
  await AsyncStorage.removeItem(TODOS_KEY);
}
```

Custom hook with persistence:
```tsx
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);

  // Load on mount
  useEffect(() => {
    loadTodos().then(setTodos);
  }, []);

  // Save whenever todos change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // ... addTodo, toggleTodo, deleteTodo
}
```

---

## Expo Router vs React Navigation

This project uses **React Navigation** (manually configured). Expo Router is an alternative file-based routing system (like Next.js) — it's not used here. Don't install or configure it unless migrating the entire navigation setup.

---

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Configure
eas build:configure

# Build for iOS / Android
eas build --platform ios
eas build --platform android

# Submit to App Store / Play Store
eas submit
```

---

## Debugging Tips

- **Expo Go**: Scan the QR code with the Expo Go app (iOS/Android) to test on a real device without a build
- **Shake device** or press `Cmd+D` (iOS sim) / `Cmd+M` (Android) to open dev menu
- **React DevTools**: Run `npx react-devtools` to inspect component tree
- **Network requests**: Use Reactotron or Flipper for network inspection
- **Console logs**: Appear in the Expo CLI terminal and browser console (web)
- **Metro bundler**: If builds fail, try `bun start --clear` to clear the cache

---

## Environment Variables

Expo uses a `.env` file with the `EXPO_PUBLIC_` prefix for client-accessible variables:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com
```

```tsx
// Access in code
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

Never put secrets in `.env` — these are bundled into the app binary.

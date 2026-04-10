---
name: react-native
description: 'React Native crash course and standards guide for this Expo + TypeScript todo app. Use when: building screens, adding components, styling UI, setting up navigation, writing hooks, managing state, or following RN best practices. Covers core primitives, StyleSheet layout, React Navigation v7, Expo workflow, and TypeScript patterns.'
argument-hint: 'Topic to focus on (e.g., navigation, styling, hooks, components)'
---

# React Native — Crash Course & Standards

This is the reference guide for this project: an Expo-managed React Native app using TypeScript, React Navigation v7, and React 19.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React Native | 0.81.5 | Core framework |
| Expo | ~54 | Build toolchain & native APIs |
| React | 19.1.0 | UI library |
| TypeScript | ~5.9.2 | Type safety |
| @react-navigation/native | ^7 | Navigation |
| @react-navigation/native-stack | ^7 | Stack navigator |

---

## 1. The Mental Model

React Native renders **native** UI components — not HTML. `<View>` → `UIView` (iOS) / `android.view.View` (Android). There is no DOM, no CSS, no browser APIs.

```
Your React Code
     ↓
React Native Bridge / JSI
     ↓
Native Platform (iOS / Android)
```

Key differences from React web:
- No `div`, `span`, `p` — use `View`, `Text`, `ScrollView`
- No CSS files — use `StyleSheet.create({})`
- All layout is **Flexbox**, default `flexDirection: 'column'`
- Text **must** be wrapped in `<Text>` — naked strings crash the app
- `onPress` instead of `onClick`

---

## 2. Core Components

See [full components reference](./references/components.md).

| Component | Use for |
|-----------|---------|
| `View` | Containers, layout boxes |
| `Text` | All text — headings, labels, body copy |
| `TextInput` | Form inputs |
| `TouchableOpacity` | Pressable elements with opacity feedback |
| `Pressable` | Flexible press target (recommended over Touchable*) |
| `ScrollView` | Scrollable content of known size |
| `FlatList` | Long or dynamic lists (virtualized) |
| `Image` | Local or remote images |
| `Modal` | Overlay dialogs |
| `ActivityIndicator` | Loading spinner |
| `Switch` | Boolean toggle |
| `StatusBar` | System status bar (Expo-managed) |

---

## 3. StyleSheet & Layout

See [styling reference](./references/styling.md).

```tsx
import { StyleSheet, View, Text } from 'react-native';

function Card({ title }: { title: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    // Flexbox defaults: flexDirection: 'column', alignItems: 'stretch'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
});
```

**Rules:**
- Always use `StyleSheet.create` (validates props + minor perf benefit)
- Units are density-independent pixels (dp) — no `px`, `em`, `rem`
- No shorthand like `margin: '8px 16px'` — use `marginHorizontal`, `marginVertical`
- `flex: 1` makes a child fill available space

---

## 4. Navigation (React Navigation v7 Static API)

See [navigation reference](./references/navigation.md).

This project uses the **static configuration API** (`createStaticNavigation`). Screens are declared in one place — no `<Stack.Screen>` JSX needed.

```tsx
// App.tsx — the pattern used in this project
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: HomeScreen,
    About: AboutScreen,
    TodoDetail: TodoDetailScreen,
  },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
  return <Navigation />;
}
```

**Navigating between screens:**
```tsx
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();
  return (
    <Pressable onPress={() => navigation.navigate('About')}>
      <Text>Go to About</Text>
    </Pressable>
  );
}
```
```tsx
navigation.navigate('TodoDetail', { id: '123' });

// In TodoDetailScreen:
const route = useRoute();
const { id } = route.params;
```

---

## 5. Hooks — The Standard Toolkit

```tsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Local state
const [todos, setTodos] = useState<Todo[]>([]);

// Side effects (data fetching, subscriptions)
useEffect(() => {
  loadTodos().then(setTodos);
}, []); // [] = run once on mount

// Stable function references (pass to children / lists)
const handleDelete = useCallback((id: string) => {
  setTodos(prev => prev.filter(t => t.id !== id));
}, []);

// Expensive computations
const completedCount = useMemo(
  () => todos.filter(t => t.done).length,
  [todos]
);

// Mutable value that doesn't trigger re-render
const inputRef = useRef<TextInput>(null);
```

---

## 6. TypeScript Patterns

See full guide in [typescript patterns](./references/typescript.md).

```tsx
// Define your data shapes as interfaces
interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
}

// Type component props explicitly
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <View>
      <Text>{todo.title}</Text>
      <Pressable onPress={() => onToggle(todo.id)}>
        <Text>{todo.done ? '✓' : '○'}</Text>
      </Pressable>
    </View>
  );
}
```

---

## 7. Project Architecture (Recommended)

```
todo-app/
├── App.tsx              # Navigation root only
├── index.ts             # Entry point (don't edit)
├── assets/              # Images, fonts
└── src/
    ├── screens/         # One file per screen
    │   ├── HomeScreen.tsx
    │   ├── AboutScreen.tsx
    │   └── TodoDetailScreen.tsx
    ├── components/      # Reusable UI pieces
    │   ├── TodoItem.tsx
    │   └── TodoList.tsx
    ├── hooks/           # Custom hooks (useTodos, useForm, etc.)
    ├── types/           # Shared TypeScript interfaces
    │   └── index.ts
    └── utils/           # Pure helper functions
```

**Rules:**
- `App.tsx` should only contain navigation setup
- Each screen gets its own file in `src/screens/`
- Shared UI pieces go in `src/components/`
- Business logic goes in `src/hooks/` as custom hooks

---

## 8. Lists — FlatList Pattern

Use `FlatList` for any list that might grow. Never use `.map()` inside `ScrollView` for long lists.

```tsx
import { FlatList, View, Text, StyleSheet } from 'react-native';

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No todos yet!</Text>}
      contentContainerStyle={styles.list}
    />
  );
}
```

---

## 9. Platform-Specific Code

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    // iOS shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 4,
  },
});

// Runtime branching
if (Platform.OS === 'ios') {
  // iOS-only logic
}

// Inline
const paddingTop = Platform.select({ ios: 44, android: 24, default: 0 });
```

---

## 10. Expo Dev Workflow

See [Expo reference](./references/expo.md).

```bash
# Start dev server (opens QR code)
bun start            # or: npx expo start

# Run on simulator
bun run ios          # iOS Simulator
bun run android      # Android Emulator

# Install a native package (expo-managed)
npx expo install <package-name>   # Always use this, not npm/bun install
```

**Why `npx expo install`?** It picks the version compatible with your Expo SDK version. Using `npm install` can install incompatible versions and break native modules.

---

## Quick Reference Cheatsheet

| Task | Code |
|------|------|
| Navigate to screen | `navigation.navigate('ScreenName')` |
| Go back | `navigation.goBack()` |
| Local state | `const [val, setVal] = useState(init)` |
| Side effect | `useEffect(() => { ... }, [deps])` |
| Conditional render | `{condition && <Component />}` |
| List rendering | `<FlatList data={} keyExtractor={} renderItem={} />` |
| Style object | `StyleSheet.create({ ... })` |
| Pressable button | `<Pressable onPress={fn}><Text>Label</Text></Pressable>` |
| Platform check | `Platform.OS === 'ios'` |

---

## References

- [Core Components Deep Dive](./references/components.md)
- [Styling & Flexbox Layout](./references/styling.md)
- [React Navigation Patterns](./references/navigation.md)
- [TypeScript in React Native](./references/typescript.md)
- [Expo Workflow & APIs](./references/expo.md)

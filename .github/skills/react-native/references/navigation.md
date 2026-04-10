# React Navigation v7 Reference

This project uses React Navigation v7 with the **Static API** (`createStaticNavigation`).

## Installed Packages

```json
"@react-navigation/native": "^7.2.2",
"@react-navigation/native-stack": "^7.14.10",
"react-native-screens": "~4.16.0",
"react-native-safe-area-context": "~5.6.0"
```

---

## Static API vs Dynamic API

This project uses the **Static API** (v7+), which is recommended for new projects.

| Static API | Dynamic API (older) |
|-----------|---------------------|
| `createStaticNavigation` | `NavigationContainer` |
| Config object | JSX `<Stack.Screen>` elements |
| TypeScript types inferred automatically | Manual type declarations |

---

## Setting Up the Navigator (App.tsx)

```tsx
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import TodoDetailScreen from './src/screens/TodoDetailScreen';

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

---

## Screen Options (Headers, Titles, Appearance)

Options can be set per-screen or globally.

```tsx
const RootStack = createNativeStackNavigator({
  // Global defaults for all screens
  screenOptions: {
    headerStyle: { backgroundColor: '#007AFF' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'My Todos',        // Header title
        headerShown: true,        // Show/hide header
        headerLargeTitle: true,   // iOS large title style
      },
    },
    About: {
      screen: AboutScreen,
      options: {
        title: 'About',
      },
    },
    TodoDetail: {
      screen: TodoDetailScreen,
      options: {
        title: 'Todo Detail',
        presentation: 'modal',    // Slides up as modal on iOS
      },
    },
  },
});
```

---

## Navigation Hooks

### useNavigation

```tsx
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View>
      {/* Navigate to a screen */}
      <Pressable onPress={() => navigation.navigate('About')}>
        <Text>About</Text>
      </Pressable>

      {/* Navigate with params */}
      <Pressable onPress={() => navigation.navigate('TodoDetail', { id: '123' })}>
        <Text>View Todo</Text>
      </Pressable>

      {/* Go back */}
      <Pressable onPress={() => navigation.goBack()}>
        <Text>Back</Text>
      </Pressable>

      {/* Replace current screen (no back button) */}
      <Pressable onPress={() => navigation.replace('Home')}>
        <Text>Replace</Text>
      </Pressable>

      {/* Go to root of stack */}
      <Pressable onPress={() => navigation.popToTop()}>
        <Text>Home</Text>
      </Pressable>
    </View>
  );
}
```

### useRoute

```tsx
import { useRoute } from '@react-navigation/native';

function TodoDetailScreen() {
  const route = useRoute();
  const { id } = route.params as { id: string };

  return <Text>Todo: {id}</Text>;
}
```

---

## Setting Header Options from Inside a Screen

```tsx
import { useNavigation, useLayoutEffect } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'My Todos',
      headerRight: () => (
        <Pressable onPress={handleAdd}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>+ Add</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (/* ... */);
}
```

---

## Link Component (Declarative Navigation)

```tsx
import { Link } from '@react-navigation/native';

// Navigate using the screen name from your navigator config
<Link screen="About">
  <Text>Go to About</Text>
</Link>

// Link with params
<Link screen="TodoDetail" params={{ id: '123' }}>
  <Text>View Todo</Text>
</Link>
```

> **Common mistake:** If a screen referenced in `Link` or `navigation.navigate` is `undefined` in your navigator config (e.g. not imported), you'll get: *"You need to specify a name when calling navigate with an object as the argument."* Always ensure the screen component is imported before adding it to the `screens` config.

---

## Nested Navigators

When you need tabs + stack navigation:

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// npx expo install @react-navigation/bottom-tabs

const TabNavigator = createBottomTabNavigator({
  screens: {
    Home: HomeStack,   // a stack navigator
    Settings: SettingsScreen,
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    Main: TabNavigator,
    Modal: ModalScreen,
  },
});
```

---

## TypeScript: Typed Navigation

The Static API infers types automatically from your navigator config. To get full type safety on `navigation.navigate()`:

```tsx
import { StaticParamList } from '@react-navigation/native';

// Declare params for screens that need them
const RootStack = createNativeStackNavigator({
  screens: {
    Home: HomeScreen,
    TodoDetail: {
      screen: TodoDetailScreen,
      // Params are typed via the screen's prop definition
    },
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

// Now navigation.navigate() will be type-checked
```

---

## Common Patterns

### Back Button in Header
Native stack automatically adds a back button when there's a screen to go back to. To customize:

```tsx
options={{
  headerBackTitle: 'Back',       // iOS only
  headerBackVisible: true,
}}
```

### Hiding the Header for the First Screen
```tsx
screens: {
  Home: {
    screen: HomeScreen,
    options: { headerShown: false },
  },
}
```

### Modal Presentation
```tsx
screens: {
  AddTodo: {
    screen: AddTodoScreen,
    options: { presentation: 'modal' },
  },
}
```

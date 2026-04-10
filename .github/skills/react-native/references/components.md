# Core Components Reference

## View

The fundamental layout container. Equivalent to `div` in web.

```tsx
import { View } from 'react-native';

// Basic container
<View style={{ flex: 1, padding: 16 }}>
  {/* children */}
</View>

// Row layout
<View style={{ flexDirection: 'row', gap: 8 }}>
  <View style={{ flex: 1 }} />
  <View style={{ flex: 1 }} />
</View>
```

**Never put text directly in a View.** Always wrap in `<Text>`.

---

## Text

All text must live inside `<Text>`. Supports nested `<Text>` for mixed styles.

```tsx
import { Text } from 'react-native';

<Text style={{ fontSize: 16, color: '#333' }}>Hello</Text>

// Nested styles
<Text style={{ fontSize: 16 }}>
  Normal text <Text style={{ fontWeight: 'bold' }}>bold part</Text>
</Text>

// numberOfLines for truncation
<Text numberOfLines={2} ellipsizeMode="tail">
  Long text that will be truncated...
</Text>
```

---

## TextInput

```tsx
import { TextInput, useState } from 'react-native';

function SearchBar() {
  const [text, setText] = useState('');

  return (
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
      }}
      value={text}
      onChangeText={setText}          // called on every keystroke
      onSubmitEditing={() => search(text)}
      placeholder="Search todos..."
      placeholderTextColor="#999"
      returnKeyType="search"           // changes keyboard return key
      autoCorrect={false}
      autoCapitalize="none"
      clearButtonMode="while-editing"  // iOS only: shows X button
    />
  );
}
```

**Common `returnKeyType` values:** `done`, `go`, `next`, `search`, `send`

---

## Pressable (recommended over TouchableOpacity)

```tsx
import { Pressable, Text } from 'react-native';

// Basic usage
<Pressable onPress={handlePress} style={styles.button}>
  <Text>Press me</Text>
</Pressable>

// Dynamic style based on press state
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed,
  ]}
>
  {({ pressed }) => (
    <Text style={{ opacity: pressed ? 0.7 : 1 }}>Press me</Text>
  )}
</Pressable>
```

---

## ScrollView

Use for content that needs scrolling but fits in memory (not for long lists).

```tsx
import { ScrollView } from 'react-native';

<ScrollView
  contentContainerStyle={{ padding: 16, gap: 12 }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"  // allows taps while keyboard is open
>
  {/* content */}
</ScrollView>

// Horizontal scroll
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {/* horizontal items */}
</ScrollView>
```

---

## FlatList

Virtualized list — only renders items visible on screen. Use for any list with more than ~20 items.

```tsx
import { FlatList, View, Text } from 'react-native';

interface Todo { id: string; title: string; done: boolean; }

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      )}
      // Optional enhancements:
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={<Text style={styles.header}>My Todos</Text>}
      ListEmptyComponent={<Text>No items yet</Text>}
      contentContainerStyle={{ padding: 16 }}
      onEndReached={() => loadMore()}       // pagination
      onEndReachedThreshold={0.5}           // trigger at 50% from bottom
      refreshing={isRefreshing}
      onRefresh={handleRefresh}             // pull-to-refresh
    />
  );
}
```

---

## Image

```tsx
import { Image } from 'react-native';

// Local image (require resolves at build time)
<Image
  source={require('../assets/icon.png')}
  style={{ width: 100, height: 100 }}
/>

// Remote image (always specify dimensions for remote)
<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  style={{ width: 200, height: 150 }}
  resizeMode="cover"    // cover | contain | stretch | center
/>
```

---

## Modal

```tsx
import { Modal, View, Text, Pressable } from 'react-native';

function ConfirmModal({ visible, onConfirm, onCancel }: Props) {
  return (
    <Modal
      visible={visible}
      transparent         // overlay style requires this
      animationType="fade"  // none | slide | fade
      onRequestClose={onCancel}  // Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text>Are you sure?</Text>
          <Pressable onPress={onConfirm}><Text>Yes</Text></Pressable>
          <Pressable onPress={onCancel}><Text>No</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Overlay style
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
});
```

---

## KeyboardAvoidingView

Prevents keyboard from overlapping input fields.

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>
  {/* screen content with TextInputs */}
</KeyboardAvoidingView>
```

---

## SafeAreaView

Respects device notches and home indicators (iOS) or system bars (Android).
This project uses `react-native-safe-area-context` (already installed via Expo).

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

function Screen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      {/* content is inset from notches/bars */}
    </SafeAreaView>
  );
}
```

Note: React Navigation's Stack navigator already handles safe areas for the header. You only need `SafeAreaView` for custom screens without a navigation header.

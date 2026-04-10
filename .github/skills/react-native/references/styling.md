# Styling & Flexbox Layout Reference

## StyleSheet.create

Always use `StyleSheet.create({})` — it validates property names at dev time and provides a slight performance benefit by sending styles to the native side once.

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

// Usage
<View style={styles.container}>
  <View style={styles.card}>
    <Text style={styles.title}>Hello</Text>
  </View>
</View>
```

---

## Combining Styles

Use an array to merge styles. Later entries override earlier ones.

```tsx
// Array merge — second overrides first
<View style={[styles.base, styles.variant]} />

// Conditional styles
<View style={[styles.button, isActive && styles.buttonActive]} />

// Inline override (use sparingly)
<View style={[styles.card, { marginBottom: 24 }]} />
```

---

## Units & Values

| Value type | Example | Notes |
|------------|---------|-------|
| Number | `16` | Density-independent pixels (dp). Automatically scales. |
| Percentage string | `'50%'` | Relative to parent. Only supported on some properties. |
| `'auto'` | `margin: 'auto'` | Supported on margin properties |

**No `px`, `rem`, `em`, `vh`, `vw`.**

For screen-relative sizing:
```tsx
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

// Or with a hook that updates on rotation:
import { useWindowDimensions } from 'react-native';
function Component() {
  const { width, height } = useWindowDimensions();
}
```

---

## Flexbox (React Native defaults differ from web)

| Property | RN Default | Web Default |
|----------|-----------|-------------|
| `flexDirection` | `'column'` | `'row'` |
| `alignContent` | `'flex-start'` | `'stretch'` |
| `flexShrink` | `0` | `1` |

```tsx
// Full-screen container with centered child
const styles = StyleSheet.create({
  screen: {
    flex: 1,                    // fill parent height
    justifyContent: 'center',   // vertical center (main axis = column)
    alignItems: 'center',       // horizontal center (cross axis)
  },
});

// Row of equal-width items
const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,    // each item shares space equally
  },
});

// Space between items
<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

### Key Flex Properties

| Property | Values | Effect |
|----------|--------|--------|
| `flex` | number | Grow/shrink ratio within parent |
| `flexDirection` | `row` \| `column` | Main axis direction |
| `justifyContent` | `flex-start` \| `center` \| `flex-end` \| `space-between` \| `space-around` \| `space-evenly` | Alignment along main axis |
| `alignItems` | `flex-start` \| `center` \| `flex-end` \| `stretch` | Alignment along cross axis |
| `alignSelf` | same as alignItems | Override for individual child |
| `flexWrap` | `wrap` \| `nowrap` | Whether items wrap to next line |
| `gap` | number | Space between flex/grid children |

---

## Spacing Properties

```tsx
// All sides
padding: 16
margin: 8

// Axis shortcuts
paddingHorizontal: 16    // paddingLeft + paddingRight
paddingVertical: 8       // paddingTop + paddingBottom
marginHorizontal: 16
marginVertical: 8

// Individual sides
paddingTop: 16
paddingRight: 16
paddingBottom: 16
paddingLeft: 16
```

---

## Text Styling

```tsx
const textStyles = StyleSheet.create({
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',    // '100'–'900' or 'normal'|'bold'
    lineHeight: 36,
    letterSpacing: -0.5,
    color: '#1a1a1a',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  caption: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});
```

---

## Borders & Shadows

```tsx
const cardStyle = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Android shadow (elevation also affects z-order)
    elevation: 4,

    // Required for shadow to show on Android
    backgroundColor: '#fff',
  },
});
```

---

## Colors

React Native supports all CSS color formats:

```tsx
color: '#FF5733'          // hex
color: '#FF573380'        // hex with alpha
color: 'rgb(255, 87, 51)' // rgb
color: 'rgba(0, 0, 0, 0.5)' // rgba
color: 'hsl(9, 100%, 60%)' // hsl
color: 'red'              // named colors
```

---

## Absolute Positioning

```tsx
const styles = StyleSheet.create({
  parent: {
    position: 'relative',   // default, can omit
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // or use: ...StyleSheet.absoluteFillObject
  },
});
```

---

## Common Patterns

### Centered full-screen layout
```tsx
container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
```

### List item with left icon and right chevron
```tsx
row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }
icon: { width: 32, height: 32, marginRight: 12 }
label: { flex: 1, fontSize: 16 }
chevron: { color: '#ccc' }
```

### Full-width button at bottom of screen
```tsx
footer: { padding: 16, paddingBottom: 32 } // extra bottom for home indicator
button: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, alignItems: 'center' }
buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
```

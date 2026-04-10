# TypeScript in React Native

## Core Types You'll Use Daily

```tsx
// Primitives
string, number, boolean, null, undefined

// Arrays
string[]
Todo[]
Array<Todo>

// Objects — prefer interface for component props & data shapes
interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: Date;
}

// Union types
type Status = 'pending' | 'completed' | 'deleted';

// Optional properties
interface CreateTodoInput {
  title: string;
  dueDate?: Date;    // ? = optional
}
```

---

## Typing Component Props

```tsx
// Simple props
interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

function Button({ label, onPress, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={styles[variant]}>
      <Text>{label}</Text>
    </Pressable>
  );
}

// Props with children
interface CardProps {
  children: React.ReactNode;
  style?: import('react-native').ViewStyle;
}

function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}
```

---

## Typing useState

```tsx
// TypeScript infers from initial value
const [text, setText] = useState('');           // string
const [count, setCount] = useState(0);          // number

// When initial value is null/undefined, specify the type
const [todo, setTodo] = useState<Todo | null>(null);
const [todos, setTodos] = useState<Todo[]>([]);

// Functional update (safe for derived state)
setTodos(prev => [...prev, newTodo]);
setTodos(prev => prev.filter(t => t.id !== id));
setTodos(prev => prev.map(t => t.id === id ? { ...t, done: true } : t));
```

---

## Typing useRef

```tsx
import { useRef } from 'react';
import { TextInput } from 'react-native';

// Ref to a component
const inputRef = useRef<TextInput>(null);

// Focus programmatically
inputRef.current?.focus();

// Ref to a value (doesn't trigger re-render)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

## Typing useCallback and useMemo

```tsx
// Return type is inferred
const handleToggle = useCallback((id: string) => {
  setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
}, []);

const completedTodos = useMemo(
  () => todos.filter(t => t.done),
  [todos]
);
// completedTodos is inferred as Todo[]
```

---

## Custom Hooks — Pattern

```tsx
// src/hooks/useTodos.ts
import { useState, useCallback } from 'react';

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

interface UseTodosReturn {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

export function useTodos(): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback((title: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: title.trim(),
      done: false,
    };
    setTodos(prev => [...prev, newTodo]);
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, deleteTodo };
}
```

Usage:
```tsx
function HomeScreen() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  // ...
}
```

---

## Typing StyleSheet

```tsx
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  image: ImageStyle;
}

const styles = StyleSheet.create<Styles>({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  image: { width: 100, height: 100 },
});

// Usually you can just let TypeScript infer it:
const styles = StyleSheet.create({
  container: { flex: 1 },  // inferred as ViewStyle
});
```

---

## Avoiding `any`

```tsx
// Bad
function handleData(data: any) { ... }

// Good — be specific
function handleData(data: Todo[]) { ... }

// When you genuinely don't know the shape (e.g., API response)
function parseResponse(data: unknown): Todo[] {
  if (!Array.isArray(data)) return [];
  return data as Todo[];   // narrow the type
}
```

---

## Type Assertions — Use Sparingly

```tsx
// Only when you know more than TypeScript about the type
const id = (route.params as { id: string }).id;

// Prefer type guards when possible
function isTodo(val: unknown): val is Todo {
  return typeof val === 'object' && val !== null && 'id' in val;
}
```

---

## Common Utility Types

```tsx
// Make all properties optional (e.g., update payload)
type TodoUpdate = Partial<Todo>;

// Make specific properties required
type RequiredTitle = Required<Pick<Todo, 'title'>>;

// Exclude null/undefined
type NonNullTodo = NonNullable<Todo | null>;  // → Todo

// Pick specific keys
type TodoPreview = Pick<Todo, 'id' | 'title'>;

// Omit specific keys
type CreateTodoPayload = Omit<Todo, 'id' | 'createdAt'>;
```

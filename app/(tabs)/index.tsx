import { createHomeStyles } from "@/assets/styles/home.styles";
import DeadlinePicker from "@/components/DeadlinePicker";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useTheme from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">;

export default function Index() {
  const { colors } = useTheme();

  const [editingId, setEditingId] = useState<Id<"todos"> | null>(null);
  const [editText, setEditText] = useState("");
  const [deadlinePickerId, setDeadlinePickerId] = useState<Id<"todos"> | null>(
    null,
  );

  const homeStyles = useMemo(() => createHomeStyles(colors), [colors]);

  const todos = useQuery(api.todos.getTodos);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.updateTodo);

  const handleToggleTodo = useCallback(
    async (id: Id<"todos">) => {
      try {
        await toggleTodo({ id });
      } catch (error) {
        console.log("Error toggling todo", error);
        Alert.alert("Error", "Failed to toggle todo");
      }
    },
    [toggleTodo],
  );

  const handleDeleteTodo = useCallback(
    async (id: Id<"todos">) => {
      Alert.alert(
        "Delete Todo",
        "Are you sure you want to delete this todo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteTodo({ id }),
          },
        ],
      );
    },
    [deleteTodo],
  );

  const handleEditTodo = useCallback((todo: Todo) => {
    setEditText(todo.text);
    setEditingId(todo._id);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingId) {
      try {
        await updateTodo({ id: editingId, text: editText.trim() });
        setEditingId(null);
        setEditText("");
      } catch (error) {
        console.log("Error updating todo", error);
        Alert.alert("Error", "Failed to update todo");
      }
    }
  }, [editingId, editText, updateTodo]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText("");
  }, []);

  const deadlineColourIndicator = useCallback(
    (deadline: number | undefined) => {
      if (deadline) {
        if (deadline < Date.now()) {
          return colors.danger;
        } else {
          return colors.success;
        }
      } else {
        return colors.textMuted;
      }
    },
    [colors],
  );

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => {
    const isEditing = editingId === item._id;

    return (
      <View style={homeStyles.todoItemWrapper}>
        <LinearGradient
          colors={colors.gradients.surface}
          style={homeStyles.todoItem}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={homeStyles.checkbox}
            activeOpacity={0.7}
            onPress={() => handleToggleTodo(item._id)}
          >
            <LinearGradient
              colors={
                item.isCompleted
                  ? colors.gradients.success
                  : colors.gradients.muted
              }
              style={[
                homeStyles.checkboxInner,
                {
                  borderColor: item.isCompleted ? "transparent" : colors.border,
                },
              ]}
            >
              {item.isCompleted && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          {isEditing ? (
            <View style={homeStyles.editContainer}>
              <TextInput
                style={homeStyles.editInput}
                value={editText}
                onChangeText={setEditText}
                autoFocus
                multiline
                placeholder="Edit your todo..."
                placeholderTextColor={colors.textMuted}
              />
              <View style={homeStyles.editButtons}>
                <TouchableOpacity onPress={handleSaveEdit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.success}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={homeStyles.editButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancelEdit}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.muted}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={homeStyles.editButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={homeStyles.todoTextContainer}>
              <Text
                style={[
                  homeStyles.todoText,
                  item.isCompleted && {
                    textDecorationLine: "line-through",
                    color: colors.textMuted,
                    opacity: 0.6,
                  },
                ]}
              >
                {item.text}
              </Text>
              {item.deadline && (
                <View style={homeStyles.deadlineRow}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={deadlineColourIndicator(item.deadline)}
                  />
                  <Text
                    style={
                      item.deadline < Date.now()
                        ? homeStyles.deadlineTextOverdue
                        : homeStyles.deadlineText
                    }
                  >
                    {new Date(item.deadline).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}

              <View style={homeStyles.todoActionsWrapper}>
                <View style={homeStyles.todoActions}>
                  <TouchableOpacity
                    onPress={() => handleEditTodo(item)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradients.warning}
                      style={homeStyles.actionButton}
                    >
                      <Ionicons name="pencil" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteTodo(item._id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradients.danger}
                      style={homeStyles.actionButton}
                    >
                      <Ionicons name="trash" size={14} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => setDeadlinePickerId(item._id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="time-outline"
                    size={36}
                    color={deadlineColourIndicator(item.deadline)}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }, [
    editingId,
    editText,
    homeStyles,
    colors,
    deadlineColourIndicator,
    handleToggleTodo,
    handleEditTodo,
    handleSaveEdit,
    handleCancelEdit,
    handleDeleteTodo,
  ]);

  const isLoading = todos === undefined;

  if (isLoading) return <LoadingSpinner />;

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <StatusBar barStyle={colors.statusBarStyle} />
      {deadlinePickerId && (
        <DeadlinePicker
          todoId={deadlinePickerId}
          todoText={todos?.find((t) => t._id === deadlinePickerId)?.text ?? ""}
          currentDeadline={
            todos?.find((t) => t._id === deadlinePickerId)?.deadline
          }
          onClose={() => setDeadlinePickerId(null)}
        />
      )}
      <SafeAreaView style={homeStyles.safeArea}>
        <Header />

        <TodoInput />

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          extraData={editingId}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent}
          ListEmptyComponent={<EmptyState />}
          // showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

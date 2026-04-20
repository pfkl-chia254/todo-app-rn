import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useMutation } from "convex/react";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

interface DeadlinePickerProps {
  todoId: Id<"todos">;
  todoText: string;
  currentDeadline: number | undefined;
  onClose: () => void;
}

async function requestPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("todo-deadlines", {
        name: "Todo Deadlines",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3b82f6",
      });
    }
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return status === "granted";
  } catch {
    return false;
  }
}

async function scheduleDeadlineNotification(
  todoId: string,
  todoText: string,
  deadline: number
) {
  try {
    await Notifications.cancelScheduledNotificationAsync(todoId).catch(
      () => {}
    );
    await Notifications.scheduleNotificationAsync({
      identifier: todoId,
      content: {
        title: "Todo Deadline Reached",
        body: todoText,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(deadline),
        channelId: "todo-deadlines",
      },
    });
  } catch (e) {
    console.warn("Could not schedule notification:", e);
  }
}

async function cancelDeadlineNotification(todoId: string) {
  await Notifications.cancelScheduledNotificationAsync(todoId).catch(() => {});
}

export default function DeadlinePicker({
  todoId,
  todoText,
  currentDeadline,
  onClose,
}: DeadlinePickerProps) {
  const setDeadline = useMutation(api.todos.setDeadline);

  const [date, setDate] = useState(
    currentDeadline ? new Date(currentDeadline) : new Date()
  );
  const [androidPhase, setAndroidPhase] = useState<"date" | "time">("date");

  useEffect(() => {
    requestPermissions().then((granted) => {
      if (!granted) {
        Alert.alert(
          "Notifications Disabled",
          "Enable notifications in Settings to receive deadline reminders."
        );
      }
    });
  }, []);

  // ── Android ────────────────────────────────────────────────────────────────
  if (Platform.OS === "android") {
    const handleAndroidChange = async (
      event: DateTimePickerEvent,
      selected?: Date
    ) => {
      if (event.type !== "set" || !selected) {
        if (androidPhase === "date") onClose();
        else setAndroidPhase("date");
        return;
      }

      if (androidPhase === "date") {
        const merged = new Date(date);
        merged.setFullYear(
          selected.getFullYear(),
          selected.getMonth(),
          selected.getDate()
        );
        setDate(merged);
        setAndroidPhase("time");
      } else {
        const merged = new Date(date);
        merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        const ts = merged.getTime();
        await setDeadline({ id: todoId, deadline: ts });
        await scheduleDeadlineNotification(todoId, todoText, ts);
        onClose();
      }
    };

    return (
      <DateTimePicker
        value={date}
        mode={androidPhase}
        minimumDate={androidPhase === "date" ? new Date() : undefined}
        onChange={handleAndroidChange}
      />
    );
  }

  // ── iOS ────────────────────────────────────────────────────────────────────
  const handleDateChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      const merged = new Date(date);
      merged.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );
      setDate(merged);
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      const merged = new Date(date);
      merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setDate(merged);
    }
  };

  const handleConfirm = async () => {
    const ts = date.getTime();
    await setDeadline({ id: todoId, deadline: ts });
    await scheduleDeadlineNotification(todoId, todoText, ts);
    onClose();
  };

  const handleClear = async () => {
    await setDeadline({ id: todoId, deadline: undefined });
    await cancelDeadlineNotification(todoId);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>Set Deadline</Text>

          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            minimumDate={new Date()}
            onChange={handleDateChange}
            style={styles.datePicker}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Time</Text>
          <DateTimePicker
            value={date}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            style={styles.timePicker}
          />

          <View style={styles.buttons}>
            <Pressable style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>Confirm</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "92%",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1e293b",
  },
  datePicker: {
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    width: "100%",
    marginVertical: 8,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timePicker: {
    width: "100%",
    height: 120,
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    width: "100%",
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  clearText: {
    color: "#ef4444",
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});

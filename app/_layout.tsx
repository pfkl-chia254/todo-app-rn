import { Stack } from "expo-router";
import { ThemeProvider } from "../hooks/useTheme";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Show notification banner + play sound even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register Android notification channel at startup (required for Android 8+)
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("todo-deadlines", {
    name: "Todo Deadlines",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#3b82f6",
  });
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
        </Stack>
      </ThemeProvider>
    </ConvexProvider>
  );
}

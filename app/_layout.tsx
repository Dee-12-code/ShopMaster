import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" options={{ animation: "none" }} />
          <Stack.Screen
            name="(auth)"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen
            name="product/[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="success"
            options={{ animation: "slide_from_bottom" }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

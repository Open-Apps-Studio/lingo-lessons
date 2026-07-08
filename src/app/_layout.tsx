import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { View } from "react-native";

import { useProgress } from "@/lib/store";
import { useThemeColors, useThemeMode } from "@/lib/theme";

export default function RootLayout() {
  const onboardingDone = useProgress((s) => s.onboardingDone);
  const segments = useSegments();
  const colors = useThemeColors();
  const themeMode = useThemeMode();

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";
    const state = useProgress.getState();
    const hasProgress = Object.values(state.courses).some(
      (c) => c.xp > 0 || Object.keys(c.completedLessons).length > 0
    );
    const shouldShowOnboarding = !onboardingDone && !hasProgress;

    if (shouldShowOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (!shouldShowOnboarding && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [onboardingDone, segments]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="courses" options={{ presentation: "modal" }} />
        <Stack.Screen name="lesson/[id]" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="guidebook/[unitId]" options={{ presentation: "modal" }} />
      </Stack>
    </View>
  );
}

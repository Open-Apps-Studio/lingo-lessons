import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect } from "react";

import { useProgress } from "@/lib/store";
import { useResolvedScheme, useThemeColors } from "@/lib/theme";

export default function RootLayout() {
  const onboardingDone = useProgress((s) => s.onboardingDone);
  const segments = useSegments();
  const scheme = useResolvedScheme();
  const colors = useThemeColors();

  useEffect(() => {
    // Root window color, so transitions and overscroll never flash white.
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

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
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="courses" options={{ presentation: "modal" }} />
        <Stack.Screen name="lesson/[id]" options={{ presentation: "fullScreenModal" }} />
        <Stack.Screen name="guidebook/[unitId]" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}

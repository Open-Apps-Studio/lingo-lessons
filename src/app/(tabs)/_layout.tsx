import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { useResolvedScheme, useThemeColors } from "@/lib/theme";

export default function TabsLayout() {
  const colors = useThemeColors();
  const scheme = useResolvedScheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: scheme === "dark" ? colors.green : colors.greenDark,
        tabBarInactiveTintColor: colors.neutral400,
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 2,
          borderTopColor: colors.neutral200,
          height: 84,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { colors } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.greenDark,
        tabBarInactiveTintColor: colors.neutral400,
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: { fontWeight: "800", fontSize: 11 },
        tabBarStyle: {
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

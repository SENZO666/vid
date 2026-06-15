import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, type Href } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { palette } from "@/src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href={"/(auth)/login" as Href} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarTestID: "tab-home",
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
          tabBarTestID: "tab-expenses",
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: palette.primary,
                alignItems: "center",
                justifyContent: "center",
                marginTop: Platform.OS === "ios" ? 0 : -6,
              }}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
          tabBarTestID: "tab-add",
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
          tabBarTestID: "tab-analytics",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
          tabBarTestID: "tab-settings",
        }}
      />
    </Tabs>
  );
}

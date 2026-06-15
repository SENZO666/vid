import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/src/auth/context";
import { palette } from "@/src/theme";

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.bg }}
        testID="auth-loading"
      >
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }
  if (session) return <Redirect href={"/(tabs)" as Href} />;
  return <Redirect href={"/(auth)/login" as Href} />;
}

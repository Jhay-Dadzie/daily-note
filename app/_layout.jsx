import { Stack, Tabs } from "expo-router";
import { Drawer } from "expo-router/drawer"
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerTitleStyle: {
          fontWeight: 'bold'
        }
    }}>
      <Stack.Screen name="index" options={{
        title: 'Daily Notes',
      }}/>
      <Stack.Screen name="createNote" options={{
        presentation: 'modal',
        title: "Create Note",
      }}/>
    </Stack>
  )
}

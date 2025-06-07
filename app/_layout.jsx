import { Stack, Tabs } from "expo-router";
import { Drawer } from "expo-router/drawer"
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        title: 'Daily Notes',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      }}/>
    </Stack>
  )
}

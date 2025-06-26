import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerTitleStyle: {
          fontWeight: 'bold'
        }
    }}>
      <Stack.Screen name="(tabs)" options={{
        headerShown: false,
      }}/>
      <Stack.Screen name="createNote" options={{
        presentation: 'modal',
        title: "Create Note",
      }}/>
      
      <Stack.Screen name="note/[id]" options={{
        presentation: 'modal',
        title: "My Note",
      }}/>
      
      
    </Stack>
  )
}

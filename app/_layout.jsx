import { Stack } from "expo-router";
export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{
          headerShown: false,
          presentation: 'modal'
        }}/>
        <Stack.Screen name="createNote" options={{
          title: "Create Note",
        }}/>
        <Stack.Screen name="createReminder" options={{
          title: "Create Reminder",
        }}/>
        <Stack.Screen name="createToDo" options={{
          title: "Create Todo",
        }}/>
        
        <Stack.Screen name="dynamics/noteRoute/[notesId]" options={{
          title: "My Note",
        }}/>
        <Stack.Screen name="dynamics/todoRoute/[todosId]" options={{
          title: "My Todo",
        }}/>
        <Stack.Screen name="dynamics/reminderRoute/[remindersId]" options={{
          title: "My Reminder",
        }}/>
  
      </Stack>
  )
}

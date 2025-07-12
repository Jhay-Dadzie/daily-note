import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{
        headerShown: false,
      }}/>
      <Stack.Screen name="createNote" options={{
        presentation: 'modal',
        title: "Create Note",
      }}/>
      <Stack.Screen name="createReminder" options={{
        presentation: 'modal',
        title: "Create Reminder",
      }}/>
      <Stack.Screen name="createToDo" options={{
        presentation: 'modal',
        title: "Create Todo",
      }}/>
      
      <Stack.Screen name="dynamics/noteRoute/[notesId]" options={{
        presentation: 'modal',
        title: "My Note",
      }}/>
      <Stack.Screen name="dynamics/todoRoute/[todosId]" options={{
        presentation: 'modal',
        title: "My Todo",
      }}/>
      <Stack.Screen name="dynamics/reminderRoute/[remindersId]" options={{
        presentation: 'modal',
        title: "My Reminder",
      }}/>
 
    </Stack>
  )
}

import { Stack } from "expo-router";
import { View } from "react-native"
import { ThemeProvider } from "@/context/ThemeContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

function InnerLayout() {
  const { theme, colorScheme } = useContext(ThemeContext);

  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerStyle: {
          backgroundColor: colorScheme === 'light' ? 'white' : '#000000' ,
        },
        headerTintColor: theme.title,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="createNote" options={{ title: "Create Note" }} />
      <Stack.Screen name="createReminder" options={{ title: "Create Reminder" }} />
      <Stack.Screen name="createToDo" options={{ title: "Create Todo" }} />
      <Stack.Screen name="dynamics/noteRoute/[notesId]" options={{ title: "My Note" }} />
      <Stack.Screen name="dynamics/todoRoute/[todosId]" options={{ title: "My Todo" }} />
      <Stack.Screen name="dynamics/reminderRoute/[remindersId]" options={{ title: "My Reminder" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <InnerLayout />
    </ThemeProvider>
  );
}

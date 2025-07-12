import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';

export default function RemindersScreen() {
  const { remindersId } = useLocalSearchParams()
  const isEditing = remindersId !== 'new';

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [reminders, setReminders] = useState([])

  useEffect(() => {
    const loadReminders = async (id) => {
      const savedReminders = await AsyncStorage.getItem('reminders')
      const parsedReminders = savedReminders ? JSON.parse(savedReminders) : []
      setReminders(parsedReminders)

      if(isEditing) {
        const reminder = parsedReminders.find(reminder => reminder.id == remindersId)
        if(reminder) {
          setBody(reminder.body)
          setTitle(reminder.title)
        }
      }
    };

    loadReminders()
  }, [remindersId])

  const saveReminder =async () => {
    if(body.trim()) {
      let updatedReminders = []
      
      if (isEditing) {
        updatedReminders = reminders.map(reminder => (
          reminder.id == remindersId ? 
          {...reminder, title: title || "No title", body} : 
          reminder
        ))
      } else {
        const newReminder = {
          id: Date.now(),
          title: title || "No title",
          body
        }
        updatedReminders = [newReminder, ...reminders]
      }

      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders))
      router.replace({pathname: "/(tabs)/reminder", params: { refresh: Date.now()}});
    } else {
      alert("Please type in something before you can update your reminder")
    }
  }


  return (
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={createPageStyles.inputFieldContainer}>
        <TextInput
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            cursorColor='#ffa400'
            style={[createPageStyles.inputField, createPageStyles.titleInput]}
        />
        <TextInput
            placeholder="Write your note here"
            value={body}
            onChangeText={setBody}
            cursorColor='#ffa400'
            multiline
            style={[createPageStyles.inputField, createPageStyles.bodyInput]}
        />
        <Pressable
            onPress={saveReminder}
            style={[createPageStyles.saveButton, {paddingVertical: 15, paddingHorizontal: 15} ]}
        >
            <View style={{ alignItems: 'center' }}>
                <FontAwesome name='save' size={22} color="white" />
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Update
                </Text>
            </View>
        </Pressable>
        <StatusBar style='dark' />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
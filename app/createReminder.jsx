import { router } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Reminders } from '@/components/reminder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';


export default function createReminder(){
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [reminders, setReminders] = useState(Reminders.sort((a,b) => b.id - a.id))

  const addReminder = async () => {
    if(body.trim()) {
      try {
        const savedReminders = await AsyncStorage.getItem('reminders')
        const existingReminders = savedReminders ? JSON.parse(savedReminders) : []
        const newReminder = {
          id: Date.now(),
          title: title || "No title",
          body
        }

        const updatedReminders = [newReminder, ...existingReminders]
        await AsyncStorage.setItem("reminders", JSON.stringify(updatedReminders))
        setReminders(updatedReminders)

        router.replace({pathname: '/(tabs)/reminder', params: {refresh: Date.now()}})
      } catch(error) {
        console.error("Error", error)
      }
            
    } else {
      Alert.alert("Empty", "Please enter a note before you can save")
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        entering={SlideInDown}
        style={createPageStyles.container}
      >
        <SafeAreaView style={createPageStyles.inputFieldContainer}>
          <TextInput placeholder='Enter title' style={[createPageStyles.inputField, createPageStyles.titleInput]}
            autoFocus
            cursorColor={'#ffa400'}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput placeholder='Write your reminder here'
            style={[createPageStyles.inputField, createPageStyles.bodyInput]}
            cursorColor={'#ffa400'}
            multiline
            value={body}
            onChangeText={setBody}
          />
          <Pressable style={createPageStyles.saveButton} onPress={addReminder}>
            <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
              <FontAwesome name='plus' size={25} color={'white'}/>
              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Save</Text>
            </View>
          </Pressable>

        </SafeAreaView>
        <StatusBar style='dark'/>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}
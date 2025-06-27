import { router } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Notes } from '@/components/note';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';

export default function createNote() {
    
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [notes, setNotes] = useState(Notes.sort((a,b) => b.id - a.id)|| [])

    const addNote = async () => {
        if (body.trim()) {
            try {
                const savedNotes = await AsyncStorage.getItem('notes');
                const existingNotes = savedNotes ? JSON.parse(savedNotes) : [];
                const newNote = {
                    id: Date.now(),
                    title: title || "No title",
                    body
                };
                const updatedNotes = [newNote, ...existingNotes];
                await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
                setNotes(updatedNotes);
            
                router.replace({ pathname: '/', params: { refresh: Date.now() } });
            } catch (error) {
                console.error('Failed to save note', error);
            }
        } else {
            alert("Please type your notes before you save");
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
                <TextInput placeholder='Write your note here'
                    style={[createPageStyles.inputField, createPageStyles.bodyInput]}
                    cursorColor={'#ffa400'}
                    multiline
                    value={body}
                    onChangeText={setBody}
                />
                <Pressable style={createPageStyles.saveButton} onPress={addNote}>
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
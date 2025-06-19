import { router } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Notes } from '@/components/note';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';


export default function createNote() {
    
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [notes, setNotes] = useState(Notes.sort((a,b) => b.id - a.id)|| [])

    const addNote = async () => {
        if (body.trim()) {
            try {
                const savedNotes = await AsyncStorage.getItem('notes');
                const existingNotes = savedNotes ? JSON.parse(savedNotes) : [];
                
                const newId = existingNotes.length > 0 
                    ? Math.max(...existingNotes.map(note => note.id)) + 1 : 1;

                const newNote = {
                    id: newId,
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
    <Animated.View
        entering={SlideInDown}
        style={styles.container}
    >
        <SafeAreaView style={styles.inputFieldContainer}>
            <TextInput placeholder='Enter title' style={[styles.inputField, styles.titleInput]}
                autoFocus
                cursorColor={'#ffa400'}
                value={title}
                onChangeText={setTitle}
            />
            <TextInput placeholder='Write your note here'
                style={[styles.inputField, styles.bodyInput]}
                cursorColor={'#ffa400'}
                multiline
                value={body}
                onChangeText={setBody}
            />
            <Pressable style={styles.saveButton} onPress={addNote}>
                <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    <FontAwesome name='plus' size={25} color={'white'}/>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Save Note</Text>
                </View>
     
            </Pressable>

        </SafeAreaView>
        <StatusBar style='dark'/>
    </Animated.View>
  )    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputFieldContainer: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative'
    },
    inputField: {
        padding: 15,
        pointerEvents: 'auto'
    },
    titleInput: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#656768'
    },
    bodyInput: {
        fontSize: 16,
        color: '#717272',
        flex: 1,
        textAlignVertical: 'top'
    },
    saveButton: {
        backgroundColor: '#ffa400',
        width: 70,
        paddingVertical: 10,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100%',
        position: 'absolute',
        bottom: 70,
        right: 40
    }

})
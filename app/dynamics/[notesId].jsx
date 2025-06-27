import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';

export default function NoteScreen() {
  const { notesId } = useLocalSearchParams();
  const isEditing = notesId !== 'new';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      const stored = await AsyncStorage.getItem('notes');
      const parsed = stored ? JSON.parse(stored) : [];
      setNotes(parsed);

      if (isEditing) {
        const note = parsed.find(note => note.id == notesId);
        if (note) {
          setTitle(note.title);
          setBody(note.body);
        }
      }
    };
    loadNotes();
  }, [notesId]);

  const saveNote = async () => {
    if (body.trim()) {
        let updatedNotes = [];

        if (isEditing) {
            updatedNotes = notes.map(note =>
                note.id == notesId ? { ...note, title: title || 'No title', body } : note
            );
        } else {
            const newId = notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1;
            const newNote = { id: newId, title: title || 'No title', body };
            updatedNotes = [newNote, ...notes];
        }

        await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
        router.replace({ pathname: '/', params: { refresh: Date.now() } });      
    } else {
        alert('Please edit your notes by typing before you update')
    }

  };

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
            onPress={saveNote}
            style={createPageStyles.updateButton}
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


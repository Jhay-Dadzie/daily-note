import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function NoteScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = id !== 'new';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const loadNotes = async () => {
      const stored = await AsyncStorage.getItem('notes');
      const parsed = stored ? JSON.parse(stored) : [];
      setNotes(parsed);

      if (isEditing) {
        const note = parsed.find(note => note.id == id);
        if (note) {
          setTitle(note.title);
          setBody(note.body);
        }
      }
    };
    loadNotes();
  }, [id]);

  const saveNote = async () => {
    if (body.trim()) {
        let updatedNotes = [];

        if (isEditing) {
            updatedNotes = notes.map(note =>
            note.id == id ? { ...note, title: title || 'No title', body } : note
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
        <SafeAreaView style={styles.inputFieldContainer}>
        <TextInput
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
            cursorColor='#ffa400'
            style={[styles.inputField, styles.titleInput]}
        />
        <TextInput
            placeholder="Write your note here"
            value={body}
            onChangeText={setBody}
            cursorColor='#ffa400'
            multiline
            style={[styles.inputField, styles.bodyInput]}
        />
        <Pressable
            onPress={saveNote}
            style={styles.updateButton}
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
    updateButton: {
        backgroundColor: '#ffa400',
        paddingVertical: 15,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '100%',
        position: 'absolute',
        marginBottom: 40,
        bottom: 70,
        right: 40

    }

})
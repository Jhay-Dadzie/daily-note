import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Note from '@/components/note.json'

export default function createNote() {
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
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
            <Pressable style={styles.saveButton}>
                <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                    <FontAwesome name='plus' size={25} color={'white'}/>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Save Note</Text>
                </View>
                
            </Pressable>

        </SafeAreaView>
        <StatusBar />
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
        overflow: 'hidden',
        position: 'absolute',
        bottom: 70,
        right: 40
    }

})
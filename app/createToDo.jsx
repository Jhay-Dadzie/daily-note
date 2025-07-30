import { router } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Todos } from '@/components/toDo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { themeColor } from '@/components/constants/themeColor';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import createPageStyleSheet from '@/components/styles/createPageStyles';

export default function createToDo() {
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [todos, setTodos] = useState(Todos.sort((a,b) => b.id - a.id)|| [])

    const {colorScheme, theme} = useContext(ThemeContext)
    const createPageStyles = createPageStyleSheet()

    const addTodo = async () => {
        if (body.trim()) {
            try {
                const savedTodos = await AsyncStorage.getItem('todos');
                const existingTodos = savedTodos ? JSON.parse(savedTodos) : [];
                const newTodo = {
                    id: Date.now(),
                    title: title || "No title",
                    body
                };
                const updatedTodo = [newTodo, ...existingTodos];
                await AsyncStorage.setItem('todos', JSON.stringify(updatedTodo));
                setTodos(updatedTodo);
            
                router.replace({ pathname: '/toDo', params: { refresh: Date.now() } });
            } catch (error) {
                console.error('Failed to save todo', error);
            }
        } else {
            Alert.alert("Empty", "Please type your todos before you save");
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
                    placeholderTextColor={colorScheme === "light" ? '#656768' : '#f2f2f2'}
                    autoFocus
                    cursorColor={themeColor.colorTheme.color}
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput placeholder='Write your note here'
                    style={[createPageStyles.inputField, createPageStyles.bodyInput]}
                    cursorColor={themeColor.colorTheme.color}
                    multiline
                    value={body}
                    onChangeText={setBody}
                    placeholderTextColor={colorScheme === "light" ? '#717272' : '#ffffff'}
                />
                <Pressable style={createPageStyles.saveButton} onPress={addTodo}>
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

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { themeColor } from '@/components/constants/themeColor';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import createPageStyleSheet from '@/components/styles/createPageStyles';

export default function TodoScreen() {
    const { todosId, title: initialTitle, body: initialBody } = useLocalSearchParams()

    const isEditing = todosId !== 'new'

    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [todos, setTodos] = useState([])
    const [isEditable, setIsEditable] = useState(false)
    const createPageStyles = createPageStyleSheet()
    const {colorScheme, theme} = useContext(ThemeContext)

    useEffect(() => {
        const loadTodos = async () => {
            const getSavedTodos = await AsyncStorage.getItem('todos')
            const parsedTodos = getSavedTodos ? JSON.parse(getSavedTodos) : []
            setTodos(parsedTodos)

            if(isEditing && !initialTitle) { // Only load from storage if params weren't passed
                const findTodo = parsedTodos.find(todo => todo.id == todosId)
                setTitle(findTodo?.title || "")
                setBody(findTodo?.body || "") 
            }
        };
        loadTodos();
    }, [todosId]);

    const saveTodo = async() => {
        let updatedTodos = []
        if(body.trim()) {
            try {
                if(isEditing) {
                    updatedTodos = todos.map(todo => 
                        todo.id == todosId ? {...todo, title : title || "No title", body} : todo   
                    )
                    
                } else {
                    const newTodo = {
                        id: Date.now(),
                        title: title || "No title",
                        body
                    }
                    updatedTodos = [newTodo, ...todos]
                }
                await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos))
                setTodos(updatedTodos)
                router.replace({pathname: '../../(tabs)/toDo', params: {refresh: Date.now()}})
            } catch (error) {
                console.error("Error", error)
            }
            
        } else {
            alert("Please enter todo before you save")
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <SafeAreaView style={createPageStyles.inputFieldContainer}>
            <View style={{backgroundColor: theme.background}}>
                <TouchableOpacity 
                style={[createPageStyles.viewMode, isEditable && {backgroundColor: themeColor.colorTheme.color}]} 
                onPress={() => setIsEditable((previous) => previous = !previous)}
                >
                <Text style={[{fontWeight: 600, color: colorScheme === 'light' ? 'black' : themeColor.colorTheme.color}, isEditable && {color: 'white'}]}>
                    {isEditable ? "Edit mode" : "Read mode"}
                </Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Enter title"
                placeholderTextColor={colorScheme === "light" ? '#656768' : '#f2f2f2'}
                value={title}
                onChangeText={setTitle}
                cursorColor={themeColor.colorTheme.color}
                editable={isEditable} 
                style={[createPageStyles.inputField, createPageStyles.titleInput]}
            />
            <TextInput
                placeholder="Write your note here"
                placeholderTextColor={colorScheme === "light" ? '#717272' : '#ffffff'}
                value={body}
                onChangeText={setBody}
                cursorColor={themeColor.colorTheme.color}
                multiline
                editable={isEditable}
                style={[createPageStyles.inputField, createPageStyles.bodyInput]}
            />
            <Pressable
                onPress={saveTodo}
                style={[createPageStyles.saveButton, {paddingVertical: 15, paddingHorizontal: 15},!isEditable && {opacity: 0}]}
                disabled={!isEditable}
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
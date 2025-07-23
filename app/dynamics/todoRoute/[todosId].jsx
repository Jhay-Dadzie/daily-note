import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';

export default function TodoScreen() {
    const { todosId, title: initialTitle, body: initialBody } = useLocalSearchParams()

    const isEditing = todosId !== 'new'

    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [todos, setTodos] = useState([])
    const [isReading, setIsReading] = useState(false)

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
            <View>
                <TouchableOpacity 
                style={[createPageStyles.viewMode, isReading && {backgroundColor: '#ffa400'}]} 
                onPress={() => setIsReading((previous) => previous = !previous)}
                >
                <Text style={[{fontWeight: 600}, isReading && {color: 'white'}]}>
                    {isReading ? "Edit mode" : "Read mode"}
                </Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
                cursorColor='#ffa400'
                editable={isReading} 
                style={[createPageStyles.inputField, createPageStyles.titleInput]}
            />
            <TextInput
                placeholder="Write your note here"
                value={body}
                onChangeText={setBody}
                cursorColor='#ffa400'
                multiline
                editable={isReading}
                style={[createPageStyles.inputField, createPageStyles.bodyInput]}
            />
            <Pressable
                onPress={saveTodo}
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
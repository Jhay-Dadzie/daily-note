import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, Platform, Alert, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from "expo-router";
import Animated, { LinearTransition} from "react-native-reanimated";
import { StatusBar } from 'expo-status-bar';
import viewPageStyles from "@/components/styles/styles";
import CheckBox from 'expo-checkbox';
import { themeColor } from "@/components/constants/themeColor";

export default function ToDo() {
  const { refresh } = useLocalSearchParams()
  const [todos, setTodos] = useState([])
  const styles = viewPageStyles()
  const deleteTodo = async (id) => {
    Alert.alert("DELETE", "Are you sure you want to delete?",
      [
        {
          text: "NO",
          onPress: () => null,
          style: 'cancel'
        },
        {
          text: "DELETE",
          onPress: async () => {
            const filteredTodo = todos.filter(todo => todo.id !== id)
            setTodos(filteredTodo)
            try {
              await AsyncStorage.setItem('todos', JSON.stringify(filteredTodo))
            } catch(error) {
              console.error("Cannot delete todo", error)
            }
          },
          style: 'destructive'
        }
      ],
      {
        cancelable: true,
        onPress: () => null
      }
    )
    
  }

  const renderItem = ({item}) => {
    return (
      <View style={[styles.noteView, item.isChecked && {opacity: 0.5}]}>
        <Link href={`dynamics/todoRoute/${item.id}`} asChild>
          <TouchableOpacity style={{flex: 1}}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  style={{
                    marginRight: 10
                  }}
                  value={item.isChecked || false}
                  onValueChange={(newValue) => {
                    const updatedTodos = todos.map(todo => 
                      todo.id === item.id ? {...todo, isChecked: newValue} : todo
                    );
                    setTodos(updatedTodos);
                    AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
                  }}
                  color={item.isChecked ? themeColor.colorTheme.color : undefined}
                />
                <Text style={[styles.title, item.isChecked && {textDecorationLine: 'line-through'}]}>
                  {item.title.length > 50 ? item.title.slice(0, 50) + '.....' : item.title}
                </Text>

              </View>
              <Text style={[styles.body, item.isChecked && {textDecorationLine: 'line-through'}]}>
                {item.body.length > 100 ? item.body.slice(0, 100) + '.....' : item.body}
              </Text>
              {
                item.isChecked && (
                  <View>
                    <Text style={{color: 'red'}}>Completed</Text>
                  </View>
                )
              }
            </View>
          </TouchableOpacity>
        </Link>

        <Pressable style={{
            marginRight: 15,
          }}
          onPress={() => deleteTodo(item.id)}
        >
          <FontAwesome name="trash" size={22} color={themeColor.colorTheme.color}/>
        </Pressable>
      </View>
    )
  }

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodos = await AsyncStorage.getItem('todos')
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos).sort((a, b) => b.id - a.id))
        } else {
          setTodos([])
        }

      } catch (error) {
        console.error('Cant load todos:', error)
      }
    }
    loadTodos()
  }, [refresh])

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.FlatList 
        data={todos}
        contentContainerStyle={todos.length === 0 ? styles.emptyListContainer : null}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        itemLayoutAnimation={LinearTransition}
        ItemSeparatorComponent={() => <View style={{height: 5}} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/check.png')} 
              style={styles.emptyImage}
            />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No to-dos</Text>
              <Text style={styles.emptySubtitle}>To-dos created will appear here</Text>
            </View>
            <Link href={'/createToDo'} asChild>
              <Pressable style={styles.createNoteButton}>
                <FontAwesome name="plus" size={18} color={'white'}/>
                <Text style={styles.createButtonText}>Create TO-DO</Text>
              </Pressable>
            </Link>
          </View>
        )}  
      />

      {
        todos.length > 0 && (
          <Link href={"/createToDo"} asChild>
            <Pressable style={styles.addNoteButton}>
              <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                  <FontAwesome name='plus' size={25} color={'white'}/>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Add To-do</Text>
              </View>
            </Pressable>
          </Link>
        
        )
      }
      <StatusBar style='dark'/>
    </SafeAreaView>
  );
}
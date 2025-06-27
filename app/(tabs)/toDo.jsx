import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, Platform } from "react-native";
import { Link, useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from "expo-router";
import Animated, { LinearTransition} from "react-native-reanimated";
import { StatusBar } from 'expo-status-bar';
import styles from "@/components/styles/styles";

export default function Reminder() {
  const { refresh } = useLocalSearchParams()
  const [notes, setNotes] = useState([]);

  const deleteNote = async (id) => {
    const filteredNotes = notes.filter(note => note.id !== id);
    setNotes(filteredNotes);
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(filteredNotes))
    } catch(error) {
      console.error("Notes cannot be deleted", error )
    }
  }

  const renderItem = ({item}) => {
    return (
      <View style={styles.noteView}>
        <Link href={`/note/${item.id}`} asChild>
          <Pressable>
            <View style={styles.noteViewContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </Pressable>
        </Link>

        <Pressable style={{
            marginRight: 15,
          }}
          onPress={() => deleteNote(item.id)}
        >
          <FontAwesome name="trash" size={22} color={'#ffa400'}/>
        </Pressable>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.FlatList 
        data={notes}
        contentContainerStyle={notes.length === 0 ? styles.emptyListContainer : null}
        renderItem={renderItem}
        keyExtractor={(notes) => notes.id.toString()}
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
            <Link href={'/createNote'} asChild>
              <Pressable style={styles.createNoteButton}>
                <FontAwesome name="plus" size={18} color={'white'}/>
                <Text style={styles.createButtonText}>Create TO-DO</Text>
              </Pressable>
            </Link>
          </View>
        )}  
      />

      {
        notes.length > 0 && (
          <Link href={"/createNote"} asChild>
            <Pressable style={styles.addNoteButton}>
              <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                  <FontAwesome name='plus' size={25} color={'white'}/>
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Create Note</Text>
              </View>
            </Pressable>
          </Link>
        
        )
      }
      <StatusBar style='dark'/>
    </SafeAreaView>
  );
}
import { StyleSheet, Text, View, SafeAreaView, Image, Pressable } from "react-native";
import { Link, useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from "expo-router";
import Animated, { LinearTransition} from "react-native-reanimated";
import { StatusBar } from 'expo-status-bar';
import styles from "@/components/styles/styles";

export default function Index() {
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
        <Link href={`/dynamics/${item.id}`} asChild>
          <Pressable style={{flex: 1}}>
            <View>
              <Text style={styles.title}>
                {item.title.length > 50 ? item.title.slice(0, 50) + '.....' : item.title}
              </Text>
              <Text style={styles.body}>
                {item.body.length > 200 ? item.body.slice(0, 200) + '.....' : item.body}
              </Text>
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
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes).sort((a, b) => b.id - a.id));
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error('Failed to load notes', error);
      }
    };

    loadNotes();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.FlatList 
        data={notes}
        contentContainerStyle={notes.length === 0 ? styles.emptyListContainer : null}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        itemLayoutAnimation={LinearTransition}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{height: 5}} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/writing.png')} 
              style={styles.emptyImage}
            />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No notes</Text>
              <Text style={styles.emptySubtitle}>Notes created will appear here</Text>
            </View>
            <Link href={'/createNote'} asChild>
              <Pressable style={styles.createNoteButton}>
                <FontAwesome name="plus" size={18} color={'white'}/>
                <Text style={styles.createButtonText}>Create Note</Text>
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

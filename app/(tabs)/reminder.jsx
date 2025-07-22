import { StyleSheet, Text, View, SafeAreaView, Image, Pressable, Platform, Alert, TouchableHighlight } from "react-native";
import { Link, useRouter } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from "expo-router";
import Animated, { LinearTransition} from "react-native-reanimated";
import { StatusBar } from 'expo-status-bar';
import styles from "@/components/styles/styles";
import {PushNotification} from '@/components/pushNotification'

export default function Reminder() {
  const { refresh } = useLocalSearchParams()
  const [reminders, setReminders] = useState([]);

  const deleteNote = async (id) => {
    Alert.alert("Delete", "Are you sure you want to delete?", 
      [
        {
          text: "NO",
          onPress: () => null,
          style: "cancel"
        },
        {
          text: "DELETE",
          onPress: async () => {
            const reminderToDelete = reminders.find(reminder => reminder.id === id);
          
            if (reminderToDelete?.notificationId) {
              await PushNotification.cancel(reminderToDelete.notificationId);
            }
            const filteredReminders = reminders.filter(reminder => reminder.id !== id)
            setReminders(filteredReminders)
            try {
              await AsyncStorage.setItem('reminders', JSON.stringify(filteredReminders))
            } catch(error) {
              console.error("Reminder could not be deleted", error)
            }
          },
          style: "destructive"
        }

      ],
      {cancelable: true}
    )
    
  }

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const savedReminders = await AsyncStorage.getItem('reminders');
        if (savedReminders) {
          setReminders(JSON.parse(savedReminders).sort((a, b) => b.id - a.id));
        } else {
          setReminders([]);
        }
      } catch (error) {
        console.error('Failed to load notes', error);
      }
    };

    loadReminders();
  }, [refresh]);


  const renderItem = ({item}) => {
    return (
      <View style={styles.noteView}>
        <Link href={`/dynamics/reminderRoute/${item.id}`} asChild>
          <TouchableHighlight underlayColor={"#faf2e2ff"} style={{flex: 1}}>
            <View style={styles.noteViewContainer}>
              <Text style={styles.title}>
                {item.title.length > 50 ? item.title.slice(0, 50) + '....' : item.title}
              </Text>
              <Text style={styles.body}>
                {item.body.length > 150 ? item.body.slice(0, 150) + '....' : item.body}
              </Text>
              <View style={reminderStyles.scheduleContainer}>
                <Text style={reminderStyles.schedule}>
                  {
                    item.schedule ? new Date(item.schedule).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'}) : 'No date set'
                  }
                </Text>
              </View>
            </View>
          </TouchableHighlight>
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
        data={reminders}
        contentContainerStyle={reminders.length === 0 ? styles.emptyListContainer : null}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        layoutAnimation={LinearTransition}
        ItemSeparatorComponent={() => <View style={{height: 5}} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/notification-bell.png')} 
              style={styles.emptyImage}
            />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No reminders</Text>
              <Text style={styles.emptySubtitle}>Reminders created will appear here</Text>
            </View>
            <Link href={'/createReminder'} asChild>
              <Pressable style={styles.createNoteButton}>
                <FontAwesome name="plus" size={18} color={'white'}/>
                <Text style={styles.createButtonText}>Create Reminder</Text>
              </Pressable>
            </Link>
          </View>
        )}  
      />

      {
        reminders.length > 0 && (
          <Link href={"/createReminder"} asChild>
            <Pressable style={styles.addNoteButton}>
              <View style={{marginHorizontal: 'auto', height: 50, justifyContent: 'center', alignItems: 'center'}}>
                  <FontAwesome name='plus' size={25} color={'white'}/>
                  <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Add</Text>
                    <Text style={{color: 'white', fontWeight: 'bold', fontSize: 12}}>Reminder</Text>
                    
                  </View>
                  
              </View>
            </Pressable>
          </Link>
        
        )
      }
      <StatusBar style='dark'/>
    </SafeAreaView>
  );
}

const reminderStyles = StyleSheet.create({
  scheduleContainer: {
    backgroundColor: "#d8d8d6ff",
    display: "flex",
    borderRadius: 9,
    opacity: 0.5,
    padding: 8,
    marginTop: 15,
    width: "45%",
    alignItems: 'center'
  },
})
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text, TextInput, SafeAreaView, Platform, Modal, KeyboardAvoidingView, Alert  } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Reminders } from '@/components/reminder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import createPageStyles from '@/components/styles/createPageStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import DatePicker, { useDefaultStyles } from 'react-native-ui-datepicker';
import DateTimePicker from '@react-native-community/datetimepicker'

export default function createReminder(){

  let today = new Date();
  let timeToRemind = new Date(today.getTime() + 60 * 1000)
  const defaultStyles = useDefaultStyles();
  

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [reminders, setReminders] = useState(Reminders.sort((a,b) => b.id - a.id))

  const [alarm, setAlarm] = useState("Set Reminder")
  const [showReminderOptions, setShowReminderOptions] = useState(false)
  const [showMode, setShowMode] = useState('date')
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedTime, setSelectedTime] = useState(timeToRemind)

  const isTodaySelected = selectedDate.toDateString() === today.toDateString();
  const minimumTime = isTodaySelected ? new Date(today.getTime() + 60 * 1000) : undefined;

  const selectDateTimeReminder = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(selectedTime.getHours());
    finalDate.setMinutes(selectedTime.getMinutes());
    finalDate.setSeconds(0);

    const now = new Date();
    const isToday = finalDate.toDateString() === now.toDateString();
    const isPastTime = finalDate.getTime() <= now.getTime();
    
    if (isToday && isPastTime) {
      Alert.alert("Invalid Time", "Please select a future time for today's reminder");
      return;
    }
    
    setSelectedDate(finalDate);
    setAlarm(finalDate.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'}));
    setShowReminderOptions(false);
    setShowMode('date');
  }


  const addReminder = async () => {
    if(body.trim()) {
      try {
        const savedReminders = await AsyncStorage.getItem('reminders')
        const existingReminders = savedReminders ? JSON.parse(savedReminders) : []
        const newReminder = {
          id: Date.now(),
          title: title || "No title",
          body
        }

        const updatedReminders = [newReminder, ...existingReminders]
        await AsyncStorage.setItem("reminders", JSON.stringify(updatedReminders))
        setReminders(updatedReminders)

        router.replace({pathname: '/(tabs)/reminder', params: {refresh: Date.now()}})
      } catch(error) {
        console.error("Error", error)
      }
            
    } else {
      Alert.alert("Empty", "Please enter a note before you can save")
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={'padding'}
    >
      <Animated.View
        entering={SlideInDown}
        style={createPageStyles.container}
      >
        <Pressable style={styles.setReminderContainer} onPress={() => {
          setShowReminderOptions(true)
          setShowMode('date')
        }}
          >
          <View style={styles.setReminderBox}>
            <Ionicons name="alarm" size={16}/>
            <Text style={{marginLeft: 10, fontWeight: "600"}}>{alarm}</Text>
          </View>
        </Pressable>

        {showReminderOptions && (
          <Pressable 
            onPress={() => setShowReminderOptions(false)} 
            style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0, right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <Pressable 
              onPress={(e) => e.stopPropagation()}
              style={{
                borderRadius: 20,
                padding: 20,
                width: '90%',
              }}
            >
              {showMode === 'date' ? (
                <>
                  <DatePicker
                    mode='single'
                    date={selectedDate}
                    onChange={({date}) => setSelectedDate(date)}
                    minDate={today}
                    styles={{
                      ...defaultStyles,
                      today: {backgroundColor: '#ffa400'},
                      selected: {backgroundColor: '#f3e1c0ff'},
                    }}
                  />
                  <View>
                    <Pressable 
                      onPress={() => setShowMode('time')}
                      style={{
                        marginTop: 15,
                        backgroundColor: '#ffa400',
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Select Time</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => setShowReminderOptions(false)}
                      style={{
                        marginTop: 15,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#ffa400',
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: '#ffa400', fontWeight: 'bold'}}>Cancel</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <DateTimePicker 
                    mode='time'
                    value={selectedTime}
                    display='spinner'
                    minimumDate={isTodaySelected ? today : undefined}
                    minimumTime={minimumTime}
                    onChange={(event, date) => {
                      if (event.type === 'dismissed') {
                        setShowMode('date');
                        return;
                      }
                      if (date) {
                        const now = new Date();
                        if (isTodaySelected && date.getTime() <= now.getTime()) {
                          Alert.alert("Invalid Time", "Please select a future time for today's reminder");
                          setShowMode('date')
                          return;
                        }
                        setSelectedTime(date);
                      }
                    }}
                  />
                  <View>
                    <Pressable
                      onPress={selectDateTimeReminder}
                      style={{
                        marginTop: 15,
                        backgroundColor: '#ffa400',
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Confirm Time</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => setShowMode('date')}
                      style={{
                        marginTop: 15,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#ffa400',
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: '#ffa400', fontWeight: 'bold'}}>Back to Date</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        )}


        <SafeAreaView style={createPageStyles.inputFieldContainer}>
          <TextInput placeholder='Enter title' style={[createPageStyles.inputField, createPageStyles.titleInput]}
            cursorColor={'#ffa400'}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput placeholder='Write your reminder here'
            style={[createPageStyles.inputField, createPageStyles.bodyInput]}
            cursorColor={'#ffa400'}
            multiline
            value={body}
            onChangeText={setBody}
          />
          <Pressable style={createPageStyles.saveButton} onPress={addReminder}>
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

const styles = StyleSheet.create({
  setReminderContainer: {
    borderRadius: 10,
    
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center'
    
  },
  setReminderBox: {
    display: 'flex',
    flexDirection: 'row'
  }
})
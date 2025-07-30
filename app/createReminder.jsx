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
import DateTimePicker from '@react-native-community/datetimepicker';
import { PushNotification } from '@/components/pushNotification'
import { themeColor } from '@/components/constants/themeColor';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import createPageStyleSheet from '@/components/styles/createPageStyles';

export default function createReminder(){

  let today = new Date();
  let timeToRemind = new Date(today.getTime() + 60 * 1000)
  const defaultStyles = useDefaultStyles();
  const {colorScheme, theme} = useContext(ThemeContext)
  const createPageStyles = createPageStyleSheet()
  const styles = reminderStyles(colorScheme, theme)

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [reminders, setReminders] = useState(Reminders.sort((a,b) => b.id - a.id))

  const [alarm, setAlarm] = useState(null)
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
    finalDate.setMilliseconds(0)

    const now = new Date();
    const isToday = finalDate.toDateString() === now.toDateString();
    const isPastTime = finalDate.getTime() <= now.getTime();
    
    if (isToday && isPastTime) {
      Alert.alert("Invalid Time", "Please select a future time for today's reminder");
      return;
    }
    
    setSelectedDate(finalDate);
    setAlarm(finalDate);
    setShowReminderOptions(false);
    setShowMode('date');
  }

  const addReminder = async () => {
    if(body.trim()) {
      try {

        if (!alarm || alarm.getTime() <= new Date().getTime()) {
          Alert.alert("Empty Reminder Time", "Please set a future time for your reminder");
          return;
        }

        const savedReminders = await AsyncStorage.getItem('reminders')
        const existingReminders = savedReminders ? JSON.parse(savedReminders) : []
        const newReminder = {
          id: Date.now(),
          title: title || "No title",
          body,
          schedule: alarm.getTime(),
          notificationId: null
        }

        const notificationId = await PushNotification.schedule({
          ...newReminder,
          schedule: alarm
        });

        if (!notificationId) {
          Alert.alert("Error", "Failed to schedule notification");
          return;
        }
      
        newReminder.notificationId = notificationId;

        const updatedReminders = [newReminder, ...existingReminders]
        await AsyncStorage.setItem("reminders", JSON.stringify(updatedReminders))
        setReminders(updatedReminders)

        router.replace({pathname: '/(tabs)/reminder', params: {refresh: Date.now()}})
        console.log('Scheduling notification for:', alarm);
        console.log('Current time is:', new Date());
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
            <Ionicons name="alarm" size={16} color={colorScheme === "light" ? '#000000' : '#ffffff'}/>
            <Text style={{
              marginLeft: 10,
              fontWeight: "600",
              color: colorScheme === "light" ? '#000000' : '#ffffff'
            }}
            
            >
              {
                alarm ? alarm.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'}) :
                "Set Reminder"
              }
            </Text>
          </View>
        </Pressable>

        {showReminderOptions && (
          <Pressable 
            onPress={() => setShowReminderOptions(false)} 
            style={{
              position: 'absolute',
              top: 0, bottom: 0, left: 0, right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Pressable 
              onPress={(e) => e.stopPropagation()}
              style={{
                borderRadius: 20,
                padding: 20,
                width: '90%',
                backgroundColor: colorScheme === 'dark' ? "#0c0f01" : null
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
                      today: {backgroundColor: themeColor.colorTheme.color},
                      selected: {backgroundColor: '#f3e1c0'},
                      month: {
                        color: colorScheme === 'light' ? "black" : "white"
                      },
                      day: {
                        color: colorScheme === 'light' ? "black" : "white"
                      },
                      weekday_label: {
                        color: themeColor.colorTheme.color
                      }
                    }}
                  />
                  <View>
                    <Pressable 
                      onPress={() => setShowMode('time')}
                      style={{
                        marginTop: 15,
                        backgroundColor: themeColor.colorTheme.color,
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
                        borderColor: themeColor.colorTheme.color,
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: themeColor.colorTheme.color, fontWeight: 'bold'}}>Cancel</Text>
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
                    is24Hour={false}
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
                        backgroundColor: themeColor.colorTheme.color,
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>Set Reminder</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => setShowMode('date')}
                      style={{
                        marginTop: 15,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: themeColor.colorTheme.color,
                        padding: 12,
                        borderRadius: 10,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{color: themeColor.colorTheme.color, fontWeight: 'bold'}}>Back to Date</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        )}


        <SafeAreaView style={createPageStyles.inputFieldContainer}>
          <TextInput placeholder='Enter title' style={[createPageStyles.inputField, createPageStyles.titleInput]}
            cursorColor={themeColor.colorTheme.color}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colorScheme === "light" ? '#656768' : '#f2f2f2'}
          />
          <TextInput placeholder='Write your reminder here'
            placeholderTextColor={colorScheme === "light" ? '#717272' : '#fffff'}
            style={[createPageStyles.inputField, createPageStyles.bodyInput]}
            cursorColor={themeColor.colorTheme.color}
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

function reminderStyles(colorScheme, theme) {
  return StyleSheet.create({
    setReminderContainer: {
      borderRadius: 10,
      backgroundColor: colorScheme === 'light' ? "#f2f2f2" : themeColor.colorTheme.color,
      padding: 10,
      display: 'flex',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 15
      
    },
    setReminderBox: {
      display: 'flex',
      flexDirection: 'row',

    }
  })
}
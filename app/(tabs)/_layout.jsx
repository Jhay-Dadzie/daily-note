import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { themeColor } from "@/components/constants/themeColor";

export default function TabLayout() {
    return(
            <Tabs screenOptions={{
                fontWeight: 'bold',
                tabBarActiveTintColor: themeColor.colorTheme.color,
                tabBarInactiveTintColor: '#656768',
                headerBackVisible: false,
            }}>
                <Tabs.Screen name="index" options={{
                    title: 'Daily Notes',
                    tabBarLabel: 'All Notes',
                    tabBarIcon: ({color}) => {
                        return(
                            <FontAwesome name="clipboard" size={24} color={color}/>
                        )
                    }
                }}/>
                <Tabs.Screen name="reminder" options={{
                    title: 'Reminders',
                    tabBarLabel: 'Reminders',
                    tabBarIcon: ({color}) => {
                        return(
                            <FontAwesome name="bell" size={24} color={color}/>
                        )
                    }
                }}/>
                <Tabs.Screen name="toDo" options={{
                    title: 'To Dos',
                    tabBarLabel: 'To Dos',
                    tabBarIcon: ({color}) => {
                        return(
                            <FontAwesome name="check-square-o" size={24} color={color}/>
                        )
                    }
                }}/>
            </Tabs>
    )
}
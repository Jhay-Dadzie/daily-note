import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { themeColor } from "@/components/constants/themeColor";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";
import { Appearance, View, Text } from "react-native";
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption} from "react-native-popup-menu"
export default function TabLayout() {
    const {colorScheme, setColorScheme, theme} = useContext(ThemeContext)
    return(
        <MenuProvider>
            <Tabs screenOptions={{
                fontWeight: 'bold',
                tabBarActiveTintColor: themeColor.colorTheme.color,
                tabBarInactiveTintColor: theme.icon,
                headerBackVisible: false,
                tabBarStyle: {
                    backgroundColor: theme.background
                },
                headerStyle: {
                    backgroundColor: colorScheme === 'light' ? "white" : "black"
                },
                headerTintColor: theme.title,
                headerRight: () => (
                    <Menu>
                        <MenuTrigger style={{padding: 3}}>
                            <View>
                                <FontAwesome name="bars" size={20} color={colorScheme === 'light' ? "black" : "white"}
                                    style={{marginRight: 15}}
                                />
                            </View>
                        </MenuTrigger>
                        <MenuOptions style={{padding: 10, backgroundColor: theme.background}}>
                            <MenuOption onSelect={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}>
                                <Text style={{color: theme.title}}>Change to {colorScheme === 'light' ? "dark" : "light"} mode</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                )
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

        </MenuProvider>
    )
}
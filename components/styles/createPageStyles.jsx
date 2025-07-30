import { StyleSheet } from "react-native";
import { themeColor } from "../constants/themeColor";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function createPageStyleSheet() {
    const {colorScheme, theme} = useContext(ThemeContext)
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background
        },
        inputFieldContainer: {
            flex: 1,
            flexDirection: 'column',
            position: 'relative'
        },
        inputField: {
            padding: 15,
            pointerEvents: 'auto',
            backgroundColor: theme.background
        },
        titleInput: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.title
        },
        bodyInput: {
            fontSize: 16,
            color: theme.body,
            flex: 1,
            textAlignVertical: 'top'
        },
        placeholderTitle: {
            color: theme.title
        },
        placeholderBody: {
            color: theme.body
        },
        saveButton: {
            backgroundColor: themeColor.colorTheme.color,
            paddingVertical: 10,
            paddingHorizontal: 18,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '100%',
            position: 'absolute',
            marginBottom: 40,
            bottom: 70,
            right: 40
        },
        viewMode: {
            borderRadius: 8,
            borderWidth: 2,
            borderColor: themeColor.colorTheme.color,
            padding: 8,
            width: '25%',
            alignItems: 'center',
            alignSelf: 'center',
            marginVertical: 10,
        }
    })
}
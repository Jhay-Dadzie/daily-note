import { Appearance } from "react-native";
import { children, createContext, useState } from "react";
import { themeColor } from "@/components/constants/themeColor";

export const ThemeContext = createContext({})

export const ThemeProvider = ({children}) => {
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const theme = colorScheme === 'light' ? themeColor.lightMode : themeColor.darkMode

    return(
        <ThemeContext.Provider value={{colorScheme, setColorScheme, theme}}>
            {children}
        </ThemeContext.Provider>
    )
}
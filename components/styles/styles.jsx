import {StyleSheet, Platform } from 'react-native'
import { themeColor } from '../constants/themeColor';
import { ThemeContext } from '@/context/ThemeContext';
import { useContext } from 'react';

export default function viewPageStyles() {
  const { colorScheme, theme } = useContext(ThemeContext);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 10
    },
    emptyListContainer: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: -50,
    },
    emptyImage: {
      width: 80,
      height: 80,
      marginBottom: 20,
    },
    emptyTextContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.emptyTitle,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.body,
      marginTop: 5,
    },
    noteView: {
      padding: 10,
      borderWidth: 2,
      borderRadius: 10,
      borderColor: themeColor.colorTheme.color,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.title
    },
    body: {
      fontSize: 16,
      color: theme.body
    },
    createNoteButton: {
      flexDirection: 'row',
      backgroundColor: themeColor.colorTheme.color,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignItems: 'center',
      gap: 10
    },
    createButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold'
    },
    addNoteButton: {
      backgroundColor: themeColor.colorTheme.color,
      width: 70,
      paddingVertical: 10,
      paddingHorizontal: 5,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '100%',
      overflow: 'hidden',
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 90 : 70,
      right: 40
    }
  });
}
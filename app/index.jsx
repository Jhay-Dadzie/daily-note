import { StyleSheet, Text, View, SafeAreaView, Image, TextInput, FlatList, Pressable } from "react-native";
import Notes from "../components/note.json"
import { Link, router } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"

export default function Index() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList 
        data={Notes}
        contentContainerStyle={Notes.length === 0 ? styles.emptyListContainer : null}
        renderItem={({item}) => (
          <View style={styles.noteView}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{height: 5}} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../assets/writing.png')} 
              style={styles.emptyImage}
            />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyTitle}>No notes</Text>
              <Text style={styles.emptySubtitle}>Notes created will appear here</Text>
            </View>
            <Pressable style={styles.createNoteButton}
              onPress={() => {router.push('/createNote')}}
            >
              <FontAwesome name="plus" size={18} color={'white'}/>
              <Text style={styles.createButtonText}>Create Note</Text>
            </Pressable>
          </View>
        )}  
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
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
    color: 'black',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#717272',
    marginTop: 5,
  },
  noteView: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#ffa400'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#656768'
  },
  body: {
    fontSize: 16,
    color: '#717272'
  },
  createNoteButton: {
    flexDirection: 'row',
    backgroundColor: '#ffa400',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 10
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
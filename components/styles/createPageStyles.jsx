import { StyleSheet } from "react-native";

const createPageStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputFieldContainer: {
        flex: 1,
        flexDirection: 'column',
        position: 'relative'
    },
    inputField: {
        padding: 15,
        pointerEvents: 'auto'
    },
    titleInput: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#656768'
    },
    bodyInput: {
        fontSize: 16,
        color: '#717272',
        flex: 1,
        textAlignVertical: 'top'
    },
    saveButton: {
        backgroundColor: '#ffa400',
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
        borderColor: '#ffa400',
        padding: 8,
        width: '25%',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 10,
    }
})

export default createPageStyles
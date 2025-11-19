import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';
import { Send } from 'lucide-react-native';

const RequestChatScreen = ({ route, navigation }) => {
    const { matchId } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [matchData, setMatchData] = useState(null);
    const flatListRef = useRef(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        loadMatchData();
        loadMessages();
    }, []);

    const loadMatchData = async () => {
        try {
            const matchDoc = await getDoc(doc(db, 'matches', matchId));
            if (matchDoc.exists()) {
                setMatchData({ id: matchDoc.id, ...matchDoc.data() });
            }
        } catch (error) {
            console.error('Error loading match:', error);
        }
    };

    const loadMessages = () => {
        const messagesRef = collection(db, 'matches', matchId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);

            // Scroll to bottom when new messages arrive
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return unsubscribe;
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messagesRef = collection(db, 'matches', matchId, 'messages');
            await addDoc(messagesRef, {
                text: newMessage.trim(),
                senderId: currentUser.uid,
                senderName: currentUser.displayName || 'Anonymous',
                createdAt: serverTimestamp()
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId === currentUser.uid;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.theirMessage
            ]}>
                {!isMyMessage && (
                    <Text style={styles.senderName}>{item.senderName}</Text>
                )}
                <Text style={[
                    styles.messageText,
                    isMyMessage ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    if (!matchData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isGiver = matchData.giverId === currentUser.uid;
    const otherPersonName = isGiver ? matchData.seekerUsername : matchData.giverUsername;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Header with food info */}
                <View style={styles.header}>
                    <Image source={{ uri: matchData.foodImage }} style={styles.foodImage} />
                    <View style={styles.headerText}>
                        <Text style={styles.foodTitle}>{matchData.foodTitle}</Text>
                        <Text style={styles.chatWith}>Chat with {otherPersonName}</Text>
                    </View>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                        disabled={!newMessage.trim()}
                    >
                        <Send
                            size={20}
                            color={newMessage.trim() ? COLORS.primary : COLORS.textLight}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
    },
    foodImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: SPACING.m,
    },
    headerText: {
        flex: 1,
    },
    foodTitle: {
        fontSize: FONT_SIZE.m,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    chatWith: {
        fontSize: FONT_SIZE.s,
        color: COLORS.textLight,
        marginTop: 2,
    },
    messagesList: {
        padding: SPACING.m,
    },
    messageContainer: {
        maxWidth: '75%',
        marginBottom: SPACING.m,
        padding: SPACING.m,
        borderRadius: 12,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.white,
    },
    senderName: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        marginBottom: 4,
    },
    messageText: {
        fontSize: FONT_SIZE.m,
    },
    myMessageText: {
        color: COLORS.white,
    },
    theirMessageText: {
        color: COLORS.text,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        marginRight: SPACING.s,
        maxHeight: 100,
        fontSize: FONT_SIZE.m,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RequestChatScreen;

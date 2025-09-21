import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { ref, push, onValue, off, serverTimestamp, get, update } from 'firebase/database';
import db from '../../utils/firebase';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ONESIGNAL_DRIVER_APP_API_KEY, ONESIGNAL_DRIVER_APP_ID } from '@env';
import { theme } from '../../theme/palette';

const ChatModal = ({ visible, onClose, requestId, driverName , driverData }) => {
  const { t } = useTranslation();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

 
  // Listen to Firebase chat messages
  useEffect(() => {
    if (!visible || !requestId) return;

    const chatRef = ref(db, `rideRequests/${requestId}/chat`);
    
    const handleMessages = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        // Check if there are new messages from driver while modal is open
        const newDriverMessages = messagesList.filter(msg => 
          msg.senderType === 'driver' && 
          msg.senderId !== currentUser?.id &&
          !messages.find(existingMsg => existingMsg.id === msg.id)
        );
        
        // Reset unread count if there are new driver messages and modal is open
        if (newDriverMessages.length > 0 && visible && currentUser?.documentId) {
          const resetUnreadCount = async () => {
            try {
              await update(ref(db, `users/${currentUser.documentId}`), {
                unreadCount: 0
              });
            } catch (error) {
              console.log('Error resetting unread count:', error);
            }
          };
          resetUnreadCount();
        }
        
        setMessages(messagesList);
        
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        setMessages([]);
      }
    };

    onValue(chatRef, handleMessages);

    return () => {
      off(chatRef, 'value', handleMessages);
    };
  }, [visible, requestId]);

  // Send OneSignal notification to user and increment their unread count
  const sendNotificationToUser = async (messageText) => {
    try {
    

      // Increment unread count for driver
     

      const notificationData = {
        app_id: ONESIGNAL_DRIVER_APP_ID,
        include_aliases: {
          external_id: [String(driverData?.id)]
        },
        target_channel: "push",
        headings: { en: `Message from ${currentUser?.firstName || 'User'}` },
        contents: { en: messageText },
        data: {
          type: "chat_message",
          requestId: requestId,
          senderId: currentUser?.id,
          senderName: currentUser?.firstName || 'User'
        },
        priority: 10
      };

      const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${ONESIGNAL_DRIVER_APP_API_KEY}`
        }
      });
      console.log("response", response.data);
    } catch (error) {
      console.error('Error sending notification:', error.response);
      // Don't show error to user, notification failure shouldn't block messaging
    }
  };

  const sendMessage = async (messageText = inputText.trim()) => {
    if (!messageText || !requestId || isLoading) return;

    setIsLoading(true);
    try {
      const userUnreadRef = ref(db, `drivers/${driverData?.documentId}/unreadCount`);
      const userSnapshot = await get(userUnreadRef);
      const currentCount = userSnapshot.val() || 0;
      await update(ref(db, `drivers/${driverData?.documentId}`), {
        unreadCount: currentCount + 1
      });
      const chatRef = ref(db, `rideRequests/${requestId}/chat`);
      const newMessage = {
        text: messageText,
        senderId: currentUser?.id,
        senderType: 'user',
        senderName: currentUser?.firstName || 'User',
        timestamp: serverTimestamp(),
        createdAt: Date.now(),
      };

      await push(chatRef, newMessage);
      
      // Send push notification to user
      await sendNotificationToUser(messageText);
      
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (replyText) => {
    sendMessage(replyText);
  };

  const renderMessage = ({ item }) => {
    const isFromDriver = item.senderType === 'driver';
    const isFromCurrentUser = item.senderId === currentUser?.id;

    return (
      <View style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.sentMessage : styles.receivedMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.sentText : styles.receivedText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isFromCurrentUser ? styles.sentTime : styles.receivedTime
          ]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : ''}
          </Text>
        </View>
      </View>
    );
  };

  const renderQuickReply = ({ item }) => (
    <TouchableOpacity
      style={styles.quickReplyButton}
      onPress={() => handleQuickReply(item.text)}
      disabled={isLoading}
    >
      <Text style={styles.quickReplyText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{driverName}</Text>
          <View style={styles.callButton}>
           
          </View>
        </View>

        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
         

          {/* Messages List */}
          <FlatList
            showsVerticalScrollIndicator={false}
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          

<View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor={'#6B7280'}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              <Icon 
                name="send" 
                size={20} 
                color={(!inputText.trim() || isLoading) ?'#9CA3AF' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  callButton: {
    padding: 4,
  },
  chatContainer: {
    flex: 1,
  },
  safetyMessage: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  safetyText: {
    color: '#666',
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sentBubble: {
    backgroundColor: '#000',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: '#666',
  },
  quickRepliesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickRepliesContent: {
    paddingHorizontal: 16,
  },
  quickReplyButton: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickReplyText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
 
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 4 : 12,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: theme.buttonBgMuted,
    color: theme.text,
  },
  sendButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: theme.buttonBg,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.buttonBgMuted,
  },
});

export default ChatModal;

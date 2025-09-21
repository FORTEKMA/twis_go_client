import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import  { ref, onValue, off, update } from 'firebase/database';
import db from '../utils/firebase';  
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const ChatButton = ({ onPress, style }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = useSelector(state => state.user.currentUser);
const { t } = useTranslation();
  

  useEffect(() => {
    if (!currentUser?.documentId) return;

    const unreadRef = ref(db, `users/${currentUser.documentId}/unreadCount`);

    const handleUnreadCount = (snapshot) => {
      const count = snapshot.val() || 0;
      setUnreadCount(count);
    };

    onValue(unreadRef, handleUnreadCount);

    return () => {
      off(unreadRef, 'value', handleUnreadCount);
    };
  }, [currentUser?.documentId]);


  const handlePress = async () => {
    // Reset unread count when opening chat
    if (currentUser?.documentId && unreadCount > 0) {
      try {
        await update(ref(db, `users/${currentUser.documentId}`), {
          unreadCount: 0
        });
      } catch (error) {
        console.log('Error resetting unread count:', error);
      }
    }
    
    if (onPress) {
      onPress();
    }
  };

  return (

    <TouchableOpacity 
    style={styles.chatButton}
    onPress={handlePress}
  >
    <MaterialCommunityIcons name="message-text" size={20} color="#fff" />
    <Text style={styles.actionButtonText}>{t('order.chat')}</Text>
    {unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}
  </TouchableOpacity>)

  //   <TouchableOpacity 
  //     style={[styles.chatButton, style]} 
  //     onPress={handlePress}
  //     activeOpacity={0.7}
  //   >
  //     <Icon name="chat" size={24} color="#007AFF" />
     
  //   </TouchableOpacity>
  // );
};

const styles = StyleSheet.create({
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatButton;

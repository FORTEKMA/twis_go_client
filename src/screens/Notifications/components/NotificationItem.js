import React from 'react';
import { Image, Text, Pressable,View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'processing':
      return require('../../../assets/processing.png');
    case 'completed':
      return require('../../../assets/booking.png');
    case 'created':
      return require('../../../assets/check.png');
    case 'arrived':
      return require('../../../assets/fast-delivery.png');
    case 'updated':
      return require('../../../assets/updated.png');
    case 'canceled':
      return require('../../../assets/not-availablee.png');
    case 'dispatched':
      return require('../../../assets/dispatch.png');
    case 'expired':
      return require('../../../assets/expired.png');
    case 'accepted':
      return require('../../../assets/clock.png');
    case 'delivered':
      return require('../../../assets/delivered.png');
    case 'picked-up':
      return require('../../../assets/picked-up.png');
    case 'maintenance':
      return require('../../../assets/maintenace.png');
    case 'help':
      return require('../../../assets/help.png');
    case 'confirmed':
      return require('../../../assets/confirm.png');
    case 'payment ':
      return require('../../../assets/credit-card.png');
    case 'failed-payment':
      return require('../../../assets/failed-payment.png');
    case 'tracking':
      return require('../../../assets/real-time-tracking.png');
    default:
      return require('../../../assets/notifications.png');
  }
};

const NotificationItem = ({ notification }) => {
  const navigation = useNavigation();

  return (
    <Pressable
      // onPress={() => {
      //   navigation.navigate('OrderStack', {
      //     id: notification?.command?.documentId,
      //   });
      // }}
      style={styles.notificationContainer}
    >
      <Image
        source={getNotificationIcon(notification?.notification_type)}
        style={styles.notificationImage}
      />

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>
          {notification?.title.replace(/\s+/g, ' ')}
        </Text>
        <Text style={styles.notificationDescription}>
          {notification?.description?.replace(/\s+/g, ' ')}
        </Text>
      </View>
    </Pressable>
  );
};

export default NotificationItem; 
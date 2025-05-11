import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import NotificationItem from './NotificationItem';

const getDayLabel = (date, t) => {
  const today = new Date();
  const notificationDate = new Date(date);

  if (
    notificationDate.getDate() === today.getDate() &&
    notificationDate.getMonth() === today.getMonth() &&
    notificationDate.getFullYear() === today.getFullYear()
  ) {
    return t('notifications.today');
  } else {
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (
      notificationDate.getDate() === yesterday.getDate() &&
      notificationDate.getMonth() === yesterday.getMonth() &&
      notificationDate.getFullYear() === yesterday.getFullYear()
    ) {
      return t('notifications.yesterday');
    }
  }

  return notificationDate.toLocaleDateString('fr-FR');
};

const NotificationGroup = ({ date, notifications }) => {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text style={styles.date}>{getDayLabel(date, t)}</Text>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </View>
  );
};

export default NotificationGroup; 
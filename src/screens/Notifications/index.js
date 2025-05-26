import React, { useEffect } from 'react';
import { ScrollView, SafeAreaView, View, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { getNotification } from '../../store/notificationSlice/notificationSlice';
import { colors } from '../../utils/colors';
import { styles } from './styles';
import NotificationGroup from './components/NotificationGroup';

// Fake data for testing
const fakeNotifications = [
  {
    id: '1',
    title: 'new_ride',
    description: 'Une nouvelle course est disponible dans votre zone',
    createdAt: new Date().toISOString(),
    type: 'new_ride'
  },
  {
    id: '2',
    title: 'payment',
    description: 'Vous avez reçu un paiement de 150 MAD',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    type: 'payment'
  },
  {
    id: '3',
    title: 'update',
    description: 'Une nouvelle version de l\'application est disponible',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    type: 'update'
  }
];

const EmptyState = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="notifications-off" 
        size={80} 
        color={colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>{t('notifications.empty.title')}</Text>
      <Text style={styles.emptyDescription}>
        {t('notifications.empty.description')}
      </Text>
    </View>
  );
};

const Notifications = () => {
  const { t } = useTranslation();
  const currentId = useSelector((state) => state?.user?.currentUser?.documentId);
  const notifications = useSelector((state) => state?.notifications?.notifications);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentId) {
      dispatch(getNotification({ id: currentId }));
    }
  }, []);

  // Use fake data for testing
  const displayNotifications =notifications;

  // Group notifications by date
  const groupedNotifications = displayNotifications?.reduce((acc, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    acc[date] = acc[date] || [];
    acc[date].push(notification);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
      </View>
      {displayNotifications?.length !== 0 ? (
        <ScrollView style={styles.container}>
          {groupedNotifications &&
            Object.entries(groupedNotifications).map(([date, notifications]) => (
              <NotificationGroup
                key={date}
                date={date}
                notifications={notifications.map(notification => ({
                  ...notification,
                  title: t(`notifications.types.${notification.type}`)
                }))}
              />
            ))}
        </ScrollView>
      ) : (
        <EmptyState />
      )}
    </SafeAreaView>
  );
};

export default Notifications; 
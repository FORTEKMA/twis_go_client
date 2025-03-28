// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   Platform,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import React, {useEffect} from 'react';
// import {useDispatch, useSelector} from 'react-redux';
// import {getNotification} from '../store/notificationSlice/notificationSlice';
// import {colors} from '../utils/colors';
// import {Pressable} from 'native-base';
// import {useNavigation} from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from 'react-native-responsive-screen';
// const Notifications = () => {
//   const currentId = useSelector(state => state?.user?.currentUser?.id);
//   const notifications = useSelector(
//     state => state?.notifications?.notifications?.data,
//   );
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   useEffect(() => {
//     if (currentId) {
//       dispatch(getNotification({id: currentId}));
//     }
//   }, []);

//   // Helper function to get the day label
//   const getDayLabel = date => {
//     const today = new Date();
//     const notificationDate = new Date(date);

//     if (
//       notificationDate.getDate() === today.getDate() &&
//       notificationDate.getMonth() === today.getMonth() &&
//       notificationDate.getFullYear() === today.getFullYear()
//     ) {
//       return "aujourd'hui";
//     } else {
//       const yesterday = new Date();
//       yesterday.setDate(today.getDate() - 1);
//       if (
//         notificationDate.getDate() === yesterday.getDate() &&
//         notificationDate.getMonth() === yesterday.getMonth() &&
//         notificationDate.getFullYear() === yesterday.getFullYear()
//       ) {
//         return 'hier';
//       }
//     }

//     // Return the formatted date if it's not today or yesterday
//     return notificationDate.toLocaleDateString('fr-FR');
//   };

//   // Group notifications by date
//   const groupedNotifications = notifications?.reduce((acc, notification) => {
//     const date = new Date(notification.attributes.createdAt).toDateString();
//     const dayLabel = getDayLabel(date);

//     acc[dayLabel] = acc[dayLabel] || [];
//     acc[dayLabel].push(notification);
//     return acc;
//   }, {});
//   console.log(notifications);
//   const icons = type => {
//     switch (type) {
//       case 'accepted':
//         return 'thumbs-up-outline';
//         break;
//       case 'completed':
//         return 'checkmark-done-circle-outline';
//         break;
//       case 'arrived':
//         return 'location-outline';
//         break;
//       default:
//         return 'notifications-circle-outline';
//         break;
//     }
//   };

//   return (
//     <SafeAreaView style={{flex: 1}}>
//       {notifications?.length !== 0 ? (
//         <ScrollView style={styles.container}>
//           {groupedNotifications &&
//             Object.entries(groupedNotifications).map(
//               ([date, notifications]) => (
//                 <View key={date}>
//                   <Text style={styles.date}>{date}</Text>
//                   {notifications.map(notification => (
//                     <Pressable
//                       onPress={() => {
//                         navigation.navigate('details', {
//                           id: notification?.attributes?.sendFrom?.command,
//                         });
//                       }}
//                       key={notification.id}
//                       style={{
//                         flexDirection: 'row',
//                         alignItems: 'center',
//                         justifyContent: 'space-between',
//                         paddingLeft: 15,
//                         paddingRight: 15,
//                         paddingVertical: 30,
//                         marginTop: 10,
//                         marginBottom: 10,
//                         borderRadius: 14,
//                         shadowColor: '#000',
//                         shadowOffset: {
//                           width: 0,
//                           height: 1, // Adjust the height to move the shadow below the view
//                         },
//                         shadowOpacity: 0.1, // Adjust the opacity for a lighter shadow
//                         shadowRadius: 1.84,
//                         elevation: 5,
//                         backgroundColor: 'white', // Set a background color to prevent overlapping shadows
//                       }}>
//                       <Ionicons
//                         style={{paddingRight: 10}}
//                         name={icons(
//                           notification?.attributes?.notification_type,
//                         )}
//                         size={20}
//                         color={colors.secondary}
//                       />
//                       <Text
//                         style={{
//                           color: colors.primary,
//                           textAlign: 'left',
//                           width: '90%',
//                           fontSize: hp(1.5),
//                         }}>
//                         {notification.attributes.title.replace(/\s+/g, ' ')}
//                       </Text>
//                     </Pressable>
//                   ))}
//                 </View>
//               ),
//             )}
//         </ScrollView>
//       ) : (
//         <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
//           <Text style={{color: colors.primary}}>Aucune notification</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default Notifications;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingLeft: 10,
//     paddingRight: 10,
//   },
//   date: {
//     fontWeight: 'bold',
//     marginTop: 10,
//     color: 'gray',
//     fontSize: hp(1),
//     alignSelf: 'flex-end',
//   },
// });
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { getNotification } from '../store/notificationSlice/notificationSlice'; // Adjust the import path as needed
import { colors } from '../utils/colors'; // Adjust the import path as needed
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Notifications = () => {
  const currentId = useSelector((state) => state?.user?.currentUser?.documentId);
  const notifications = useSelector(
    (state) => state?.notifications?.notifications || [] // Default to an empty array
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Fetch notifications when the component mounts or `currentId` changes
  useEffect(() => {
    if (currentId) {
      dispatch(getNotification({ id: currentId }));
    }
  }, [currentId, dispatch]);

  // Helper function to get the day label (e.g., "today", "yesterday", or a formatted date)
  const getDayLabel = (date) => {
    const today = new Date();
    const notificationDate = new Date(date);

    if (
      notificationDate.getDate() === today.getDate() &&
      notificationDate.getMonth() === today.getMonth() &&
      notificationDate.getFullYear() === today.getFullYear()
    ) {
      return "aujourd'hui";
    } else {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (
        notificationDate.getDate() === yesterday.getDate() &&
        notificationDate.getMonth() === yesterday.getMonth() &&
        notificationDate.getFullYear() === yesterday.getFullYear()
      ) {
        return 'hier';
      }
    }

    // Return the formatted date if it's not today or yesterday
    return notificationDate.toLocaleDateString('fr-FR');
  };

  // Group notifications by date
  const groupedNotifications = Array.isArray(notifications)
    ? notifications.reduce((acc, notification) => {
        const date = new Date(notification.createdAt).toDateString();
        const dayLabel = getDayLabel(date);

        acc[dayLabel] = acc[dayLabel] || [];
        acc[dayLabel].push(notification);
        return acc;
      }, {})
    : {};

  // Function to return the appropriate icon based on the notification type
  const icons = (type) => {
    switch (type) {
      case 'processing':
        return require('../assets/processing.png');
      case 'completed':
        return require('../assets/booking.png');
      case 'created':
        return require('../assets/check.png');
      case 'arrived':
        return require('../assets/fast-delivery.png');
      case 'updated':
        return require('../assets/updated.png');
      case 'canceled':
        return require('../assets/not-availablee.png');
      case 'dispatched':
        return require('../assets/dispatch.png');
      case 'expired':
        return require('../assets/expired.png');
      case 'accepted':
        return require('../assets/clock.png');
      case 'delivered':
        return require('../assets/delivered.png');
      case 'picked-up':
        return require('../assets/picked-up.png');
      case 'maintenance':
        return require('../assets/maintenace.png');
      case 'help':
        return require('../assets/help.png');
      case 'confirmed':
        return require('../assets/confirm.png');
      case 'payment':
        return require('../assets/credit-card.png');
      case 'failed-payment':
        return require('../assets/failed-payment.png');
      case 'tracking':
        return require('../assets/real-time-tracking.png');
      default:
        return require('../assets/notifications.png');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {notifications.length !== 0 ? (
        <ScrollView style={styles.container}>
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <View key={date}>
              <Text style={styles.date}>{date}</Text>
              {notifications.map((notification) => (
                <Pressable
                  onPress={() => {
                    navigation.navigate('details', {
                      id: notification?.sendFrom?.command,
                    });
                  }}
                  key={notification.id}
                  style={styles.notificationContainer}
                >
                  <Image
                    source={icons(notification?.notification_type)}
                    style={styles.icon}
                  />
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>
                      {notification?.title.replace(/\s+/g, ' ')}
                    </Text>
                    <Text style={styles.description}>
                      {notification?.description?.replace(/\s+/g, ' ')}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune notification</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Notifications;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  date: {
    fontWeight: 'bold',
    marginTop: 10,
    color: colors.secondary,
    fontSize: hp(1.5),
    alignSelf: 'flex-end',
  },
  notificationContainer: {
    width: '100%',
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
    marginBottom: 0,
    borderRadius: 14,
    backgroundColor: colors.general_1,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    justifyContent: 'flex-start',
    width: '85%',
  },
  title: {
    color: colors.primary,
    textAlign: 'left',
    width: '90%',
    fontSize: hp(1.8),
    fontWeight: '500',
  },
  description: {
    color: colors.secondary_2,
    textAlign: 'left',
    width: '90%',
    fontSize: hp(1.5),
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.primary,
  },
});
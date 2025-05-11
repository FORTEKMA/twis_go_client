import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

 
 
const getStatusColor = (status) => {
  switch (status) {
    case 'Driver_on_route_to_pickup':
      return '#3498db'; // Blue
    case 'Arrived_at_pickup':
      return '#2ecc71'; // Green
    case 'Picked_up':
      return '#f1c40f'; // Yellow
    case 'On_route_to_delivery':
      return '#3498db'; // Blue
    case 'Arrived_at_delivery':
      return '#2ecc71'; // Green
    case 'Delivered':
      return '#27ae60'; // Dark Green
    case 'Completed':
      return '#27ae60'; // Dark Green
    default:
      return '#E74C3C'; // Red (default)
  }
};

 

const OrderBottomCard = ({ order, timeToDestination, onCall, onEndTrip }) => {
  const { t } = useTranslation();
   const status = order?.status || 'Driver_on_route_to_pickup';
  const statusColor = getStatusColor(status);
  const statusText = t(`history.status.${status.toLowerCase()}`);
 

  return (
    <View style={localStyles.bottomCard}>
      <Text style={localStyles.timeToDest}>
        {t('history.card.time_to_destination')} : <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>{timeToDestination}</Text>
      </Text>
      <View style={localStyles.separator} />
      <View style={localStyles.infoRow}>
        <View style={[localStyles.infoItem, { alignItems: 'center' }]}>
          <Text style={localStyles.label}>{t('history.card.trip_id')}</Text>
          <Text style={localStyles.value}>{order?.refNumber || '-'}</Text>
        </View>
        <View style={localStyles.verticalSeparator} />
        <View style={[localStyles.infoItem, { alignItems: 'center' }]}>
          <Text style={localStyles.label}>{t('history.card.status')}</Text>
          <Text style={[localStyles.value, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>
      <View style={localStyles.separator} />
      <View style={localStyles.addressRow}>
        <Ionicons name="location-sharp" size={18} color="#27ae60" />
        <Text style={localStyles.addressText} numberOfLines={1}>{order?.pickUpAddress?.Address}</Text>
      </View>
      <View style={localStyles.addressRow}>
        <MaterialIcons name="location-on" size={18} color="#E74C3C" />
        <Text style={localStyles.addressText} numberOfLines={1}>{order?.dropOfAddress?.Address}</Text>
        <MaterialIcons name="navigation" size={18} color="#E74C3C" style={{ marginLeft: 8 }} />
        <Text style={localStyles.note}>{t('history.card.view_note')}</Text>
      </View>
      <View style={localStyles.separator} />
      <View style={localStyles.driverRow}>
        <Image
          source={{ uri: order?.driver?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={localStyles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={localStyles.driverName}>{order?.driver?.firstName} {order?.driver?.lastName}</Text>
          <View style={localStyles.ratingRow}>
            <Ionicons name="happy" size={16} color="#FFD700" />
            <Text style={localStyles.rating}>{order?.driver?.rating || '4.5'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Text style={localStyles.note}>{t('history.card.view_note')}</Text>
        </TouchableOpacity>
      </View>
      <View style={localStyles.separator} />
     
    </View>
  );
};

const localStyles = StyleSheet.create({
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  timeToDest: {
    textAlign: 'center',
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  value: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    color: '#222',
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  note: {
    color: '#595FE5',
    fontSize: 13,
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    marginLeft: 3,
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
  },
  endTripBtn: {
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  endTripText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  verticalSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  infoItem: {
    flex: 1,
  },
});

export default OrderBottomCard; 
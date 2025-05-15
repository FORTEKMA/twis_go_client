import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Modal, Alert, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';

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

const OrderBottomCard = ({ order, onCancel, onCallDriver }) => {
  const { t } = useTranslation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const status = order?.status || 'Driver_on_route_to_pickup';
  const statusColor = getStatusColor(status);
  const statusText = t(`history.status.${status.toLowerCase()}`);
  const subStatusText = t('history.card.arriving_in', { time: order?.duration || '3 min' });

  const handleCancel = () => {
    setShowCancelModal(false);
    onCancel && onCancel();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const renderMinimizedContent = () => (
    <View style={localStyles.minimizedContent}>
      <View style={localStyles.minimizedHeader}>
        <View style={[localStyles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[localStyles.statusText, { color: statusColor }]}>{statusText}</Text>
        <TouchableOpacity onPress={toggleMinimize} style={localStyles.minimizeButton}>
          <Ionicons name="chevron-up" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <Text style={localStyles.timeToDest}>
        {t('history.card.time_to_destination')}: <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>{order?.duration}</Text>
      </Text>
    </View>
  );

  const renderFullContent = () => (
    <>
      <View style={localStyles.statusBanner}>
        <View style={[localStyles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[localStyles.statusText, { color: statusColor }]}>{statusText}</Text>
        <TouchableOpacity onPress={toggleMinimize} style={localStyles.minimizeButton}>
          <Ionicons name="chevron-down" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={localStyles.timeToDest}>
        {t('history.card.time_to_destination')}: <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>{order?.duration}</Text>
      </Text>

      <View style={localStyles.separator} />

      <View style={localStyles.infoRow}>
        <View style={[localStyles.infoItem, { alignItems: 'center' }]}>
          <Text style={localStyles.label}>{t('history.card.trip_id')}</Text>
          <Text style={localStyles.value}>{order?.refNumber || '-'}</Text>
        </View>
        <View style={localStyles.verticalSeparator} />
        <View style={[localStyles.infoItem, { alignItems: 'center' }]}>
          <Text style={localStyles.label}>{t('history.card.price')}</Text>
          <Text style={[localStyles.value, { color: colors.secondary }]}>{formatPrice(order?.price || 0)}</Text>
        </View>
      </View>

      <View style={localStyles.separator} />

      <View style={localStyles.addressContainer}>
        <View style={localStyles.addressRow}>
          <View style={[localStyles.addressIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="location-sharp" size={16} color="#fff" />
          </View>
          <View style={localStyles.addressTextContainer}>
            <Text style={localStyles.addressLabel}>{t('history.card.pickup')}</Text>
            <Text style={localStyles.addressText} numberOfLines={2}>{order?.pickUpAddress?.Address}</Text>
          </View>
        </View>

        <View style={localStyles.addressRow}>
          <View style={[localStyles.addressIcon, { backgroundColor: '#E74C3C' }]}>
            <MaterialIcons name="location-on" size={16} color="#fff" />
          </View>
          <View style={localStyles.addressTextContainer}>
            <Text style={localStyles.addressLabel}>{t('history.card.delivery')}</Text>
            <Text style={localStyles.addressText} numberOfLines={2}>{order?.dropOfAddress?.Address}</Text>
          </View>
        </View>
      </View>

      <View style={localStyles.separator} />

      <View style={localStyles.driverSection}>
        <View style={localStyles.driverRow}>
          <Image
            source={{ uri: order?.driver?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={localStyles.avatar}
          />
          <View style={localStyles.driverInfo}>
            <Text style={localStyles.driverName}>{order?.driver?.firstName} {order?.driver?.lastName}</Text>
            <View style={localStyles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={localStyles.rating}>{order?.driver?.rating || '4.5'}</Text>
            </View>
          </View>
          <TouchableOpacity style={localStyles.contactButton}>
            <Ionicons name="call" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={localStyles.separator} />

      <View style={localStyles.paymentSection}>
        <View style={localStyles.paymentRow}>
          <Ionicons name="card-outline" size={20} color={colors.secondary} />
          <Text style={localStyles.paymentText}>{t(order?.payType) }</Text>
        </View>
       
      </View>

      <TouchableOpacity 
        style={localStyles.cancelButton}
        onPress={() => setShowCancelModal(true)}
      >
        <Text style={localStyles.cancelButtonText}>{t('history.card.cancel_order')}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[localStyles.bottomCard, isMinimized && localStyles.minimizedCard]}>
      {isMinimized ? renderMinimizedContent() : renderFullContent()}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCancelModal}
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContent}>
            <Text style={localStyles.modalTitle}>{t('history.card.cancel_confirmation')}</Text>
            <Text style={localStyles.modalMessage}>{t('history.card.cancel_message')}</Text>
            <View style={localStyles.modalButtons}>
              <TouchableOpacity 
                style={[localStyles.modalButton, localStyles.cancelModalButton]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={localStyles.modalButtonText}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[localStyles.modalButton, localStyles.confirmModalButton]}
                onPress={handleCancel}
              >
                <Text style={[localStyles.modalButtonText, { color: '#fff' }]}>{t('common.yes')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  addressContainer: {
    marginVertical: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  addressText: {
    color: '#222',
    fontSize: 14,
    lineHeight: 20,
  },
  driverSection: {
    marginVertical: 10,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rating: {
    marginLeft: 4,
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSection: {
    marginVertical: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#222',
  },
  itemsSection: {
    marginTop: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#f8f9fa',
  },
  confirmModalButton: {
    backgroundColor: '#E74C3C',
  },
  modalButtonText: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#E74C3C',
  },
  minimizedCard: {
    height: 80,
    padding: 15,
  },
  minimizedContent: {
    flex: 1,
  },
  minimizedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  minimizeButton: {
    padding: 4,
  },
});

export default OrderBottomCard; 
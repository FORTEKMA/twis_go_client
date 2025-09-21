import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';
import api from '../../../utils/api';
import db from '../../../utils/firebase';
import { ref as dbRef, update } from 'firebase/database';
 const OrderCancellationReasonSheet = ({
  visible,
  onClose,
  reasons,
  otherReason,
  setOtherReason,
  onSubmit,
  order
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleSubmit = async () => {

    if (!selectedReason || (selectedReason === 'Other' && !otherReason)) return;

    setIsLoading(true);
    try {
       await api.put(`commands/${order.documentId}`, {
           data: {commandStatus: 'Canceled_by_client',
            cancelReason: selectedReason === 'Other' ? otherReason : selectedReason}
            
        })
        if (order?.requestId) {
          await update(dbRef(db, `rideRequests/${order.requestId}`), { commandStatus: 'Canceled_by_client' });
        }
        onSubmit(selectedReason);
       
    }
    catch(err) {
      console.log(err)
    }
    finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{t('history.card.cancellation_reason_title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.reasonsList}>
            {reasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.reasonItemSelected
                ]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason && styles.reasonTextSelected
                ]}>{t(`history.card.cancellation_reasons.${reason}`)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedReason === 'Other' && (
            <View style={styles.otherReasonContainer}>
              <TextInput
                style={styles.otherReasonInput}
                placeholder={t('history.card.cancellation_other_placeholder')}
                value={otherReason}
                onChangeText={setOtherReason}
                multiline
              />
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || (selectedReason === 'Other' && !otherReason)) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedReason || (selectedReason === 'Other' && !otherReason) || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{t('common.confirm')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    width:"60%"
  },
  reasonsList: {
    maxHeight: '100%',
  },
  reasonItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  reasonItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: '#000',
  },
  reasonTextSelected: {
    color: '#fff',
  },
  otherReasonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  otherReasonInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    color: '#000',
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OrderCancellationReasonSheet; 
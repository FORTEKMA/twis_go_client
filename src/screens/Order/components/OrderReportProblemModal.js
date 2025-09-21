import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';
import api from '../../../utils/api';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { useSelector} from 'react-redux';

const OrderReportProblemModal = ({ visible, onClose, order }) => {
  const { t } = useTranslation();
  const [reportText, setReportText] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const navigation = useNavigation();
  const currentUser = useSelector(state => state?.user?.currentUser);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await api.put(`commands/${order.documentId}`, {
        data: { SpecificNote: reportText, }
      });
     
    const rep=await  api.post("tickets",{
        data:{
          description:reportText,
          client:currentUser.id,
          command:order.id,

        }
      })
    
      onClose();
      Toast.show({
        type: 'success',
        text1: t('history.card.report_success'),
        position: 'bottom',
      });
      setReportText('');
    } catch (error) {
      console.log(error.response);
      Toast.show({
        type: 'error',
        text1: t('history.card.report_error'),
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={() => {
        Keyboard.dismiss();
        onClose();
      }}
      onBackButtonPress={() => {
        Keyboard.dismiss();
        onClose();
      }}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('history.card.report_problem')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder={t('history.card.report_placeholder')}
            value={reportText}
            onChangeText={setReportText}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{t('history.card.submit_report')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#E5E5E5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 140,
    marginBottom: 12,
    color: '#000'
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OrderReportProblemModal; 
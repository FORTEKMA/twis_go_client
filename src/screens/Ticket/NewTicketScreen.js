import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  SafeAreaView,
  Modal,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  I18nManager,
 } from 'react-native';
import { colors } from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import ImagePickerModal from '../Profile/components/ImagePickerModal';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import PhoneInput from 'react-native-phone-input';
import CountryPicker from 'react-native-country-picker-modal';

const REASONS = [
  'payment_issue',
  'driver_behavior',
  'app_technical',
  'service_quality',
  'other',
];

const NewTicketScreen = ({ navigation, route }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [command, setCommand] = useState('');
  const [commands, setCommands] = useState([]);
  const [description, setDescription] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [file, setFile] = useState(null);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommandModalVisible, setIsCommandModalVisible] = useState(false);
  const [isFlagsVisible, setIsFlagsVisible] = useState(false);
  const { t } = useTranslation();
  const currentUser = useSelector(state => state?.user?.currentUser);
  const token = useSelector(state => state?.user?.token);

  const isGuest = !currentUser?.id || currentUser?.id === 'guest' || token === -1;

  const phoneInput = React.useRef(null);

  const onSelectCountry = React.useCallback((selectedCountry) => {
    if (phoneInput.current) {
      phoneInput.current.selectCountry(selectedCountry.cca2.toLowerCase());
    }
    setIsFlagsVisible(false);
  }, []);

  useEffect(() => {
    // Only fetch commands for authenticated users
    if (!isGuest) {
      fetchUserCommands();
    }
  }, [isGuest]);

  const fetchUserCommands = async () => {
    try {
      const response = await api.get('commands', {
        params: {
          'filters[client][$eq]': currentUser.id,
          sort: 'createdAt:desc'
        }
      });
      setCommands(response.data.data);
    } catch (error) {
      console.error('Error fetching commands:', error);
      Toast.show({
        type: 'error',
        text1: t('tickets.commands_fetch_error'),
        position: 'bottom',
      });
    }
  };

  const handleCameraPress = async () => {
    try {
      setTimeout(async () => {
        const result = await launchCamera({
          mediaType: 'photo',
          quality: 0.8,
        });

        if (result.assets && result.assets[0]) {
          setFile({
            uri: result.assets[0].uri,
            type: result.assets[0].type,
            name: result.assets[0].fileName || 'camera_image.jpg',
          });
        }
        setIsImagePickerVisible(false);
      }, 10);
    } catch (err) {
      console.error('Error taking photo:', err);
    } finally {
     
    }
  };

  const handleGalleryPress = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]) {
        setFile({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          name: result.assets[0].fileName || 'gallery_image.jpg',
        });
      }
    } catch (err) {
      console.error('Error picking image:', err);
    } finally {
      setIsImagePickerVisible(false);
    }
  };

  const handleAttachmentPress = () => {
    setIsImagePickerVisible(true);
  };

  const validateCommand = async (commandRef) => {
    try {
      const response = await api.get(`commands?filters[refNumber][$eq]=${commandRef}`);
      return response.data.data.length > 0 ? response.data.data[0] : null;
    } catch (error) {
      console.error('Error validating command:', error);
      return null;
    }
  };

  const uploadAttachment = async (file) => {
    try {
      const formData = new FormData();
      formData.append('files', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });

      const response = await api.post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data[0].id;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Guest contact validation
    if (isGuest) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!guestEmail.trim()) {
        Toast.show({
          type: 'error',
          text1: t('register.emailRequired'),
          placement: 'bottom',
        });
        return;
      }
      if (!emailRegex.test(guestEmail.trim())) {
        Toast.show({
          type: 'error',
          text1: t('register.invalidEmail'),
          placement: 'bottom',
        });
        return;
      }
      if (!guestPhone.trim()) {
        Toast.show({
          type: 'error',
          text1: t('register.phoneRequired'),
          placement: 'bottom',
        });
        return;
      }
    }
    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: t('tickets.description_required'),
        placement: "bottom",
      });
      return;
    }

    setIsLoading(true);
    let commandId = null;
    let attachmentId = null;

    try {
      // Validate command if provided (not for guest)
      if (!isGuest && command.trim()) {
        const commandData = await validateCommand(command.trim());
        if (!commandData) {
          Toast.show({
            type: 'error',
            text1: t('tickets.invalid_command'),
            position: 'bottom',
          });
          setIsLoading(false);
          return;
        }
        commandId = commandData.id;
      }

      // Upload attachment if provided
      if (file) {
        attachmentId = await uploadAttachment(file);
        if (!attachmentId) {
          Toast.show({
            type: 'error',
            text1: t('tickets.attachment_upload_error'),
            position: 'bottom',
          });
          setIsLoading(false);
          return;
        }
      }

      // Create ticket
      // For guest users, append contact info to description to avoid backend schema changes
      const finalDescription =  description.trim();

      const ticketData = {
        data: {
          title: t(`tickets.reasons.${reason}`),
          description: finalDescription,
          action: 'open',
          attachment: attachmentId,
          ...(isGuest
            ? {
                 
                email: guestEmail.trim(),
                phone: guestPhone.trim(),
              }
            : {
                client: currentUser.id,
                command: commandId,
              }),
        },
      };
      console.log(ticketData)

      const response = await api.post('tickets', ticketData);

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: t('tickets.submit_success'),
          position: 'bottom',
        });

        if (route.params?.onSubmit) {
          route.params.onSubmit(response.data);
        }

        navigation.goBack();
      }
    } catch (error) {
      console.error('Error submitting ticket:', error.response);
      Toast.show({
        type: 'error',
        text1: t('tickets.submit_error'),
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('tickets.new')}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  const renderReasonModal = () => (
    <Modal
      visible={isReasonModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsReasonModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsReasonModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('tickets.select_reason')}</Text>
            <TouchableOpacity
              onPress={() => setIsReasonModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.reasonList}>
            {REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.reasonItem,
                  reason === r && styles.reasonItemSelected,
                ]}
                onPress={() => {
                  setReason(r);
                  setIsReasonModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.reasonItemText,
                    reason === r && styles.reasonItemTextSelected,
                  ]}
                >
                  {t(`tickets.reasons.${r}`)}
                </Text>
                {reason === r && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderCommandModal = () => (
    <Modal
      visible={isCommandModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsCommandModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsCommandModalVisible(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('tickets.select_command')}</Text>
            <TouchableOpacity
              onPress={() => setIsCommandModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.reasonList}>
            {commands.map((cmd) => (
              <TouchableOpacity
                key={cmd.id}
                style={[
                  styles.reasonItem,
                  command === cmd.refNumber && styles.reasonItemSelected,
                ]}
                onPress={() => {
                  setCommand(cmd.refNumber);
                  setIsCommandModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.reasonItemText,
                    command === cmd.refNumber && styles.reasonItemTextSelected,
                  ]}
                >
                  {cmd.refNumber}
                </Text>
                {command === cmd.refNumber && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.general_1} />
      {renderHeader()}
      <KeyboardAvoidingView
      keyboardVerticalOffset={30}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >

  
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('tickets.reason')}</Text>
            <TouchableOpacity
              style={styles.reasonButton}
              onPress={() => setIsReasonModalVisible(true)}
            >
              <Text style={styles.reasonButtonText}>
                {t(`tickets.reasons.${reason}`)}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {!isGuest && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {t('tickets.command')}
              </Text>
              <TouchableOpacity
                style={styles.reasonButton}
                onPress={() => setIsCommandModalVisible(true)}
              >
                <Text style={styles.reasonButtonText}>
                  {command || t('tickets.select_command')}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {isGuest && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('profile.email')}</Text>
                <TextInput
                  style={styles.input}
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  placeholder={t('profile.email_placeholder')}
                  placeholderTextColor={colors.secondary_2}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('profile.phone')}</Text>
                <View style={styles.phoneInputWrapper}>
                  <PhoneInput
                    autoFormat
                    initialCountry="tn"
                    onPressFlag={() => setIsFlagsVisible(true)}
                    onChangePhoneNumber={setGuestPhone}
                    style={styles.phoneInput}
                    textComponent={TextInput}
                    textProps={{
                      placeholder: t('profile.phone_placeholder'),
                      placeholderTextColor: colors.secondary_2,
                      style: styles.phoneText,
                      keyboardType: 'phone-pad',
                    }}
                    ref={phoneInput}
                    value={guestPhone}
                  />
                </View>
              </View>

              <CountryPicker
                withFilter
                withFlag
                withAlphaFilter
                withCallingCode
                placeholder=""
                onSelect={onSelectCountry}
                visible={isFlagsVisible}
                translation="fra"
                filterProps={{ placeholder: t('login.search') }}
              />
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('tickets.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder={t('tickets.description_placeholder')}
              placeholderTextColor={colors.secondary_2}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={handleAttachmentPress}
            >
              <Ionicons name="image" size={20} color={colors.primary} />
              <Text style={styles.fileButtonText}>
                {file ? file.name : t('tickets.attach_image')}
              </Text>
            </TouchableOpacity>
          </View>

         

         
        </View>
      </ScrollView>
      <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.general_1} />
            ) : (
              <Text style={styles.submitButtonText}>{t('tickets.submit')}</Text>
            )}
          </TouchableOpacity>
      {renderReasonModal()}
      {renderCommandModal()}
      </KeyboardAvoidingView>
      <ImagePickerModal
        isVisible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onCameraPress={handleCameraPress}
        onGalleryPress={handleGalleryPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: colors.general_1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary_3,
    backgroundColor: colors.general_1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  reasonButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary_3,
    borderRadius: 12,
    padding: 16,
    backgroundColor: colors.general_2,
  },
  reasonButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary_3,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.primary,
    backgroundColor: colors.general_2,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  attachmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.general_2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.secondary_3,
  },
  fileButtonText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
   marginHorizontal:21,
  //  position:"absolute",
  //  bottom:0,
  //  width:"90%",
  //  alignSelf:"center"
  },
  submitButtonText: {
    color: colors.general_1,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.general_1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary_3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  closeButton: {
    padding: 8,
  },
  reasonList: {
    padding: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.general_2,
  },
  reasonItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  reasonItemText: {
    fontSize: 16,
    color: colors.primary,
  },
  reasonItemTextSelected: {
    fontWeight: '600',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.general_2,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  fileInfoText: {
    marginLeft: 8,
    color: colors.primary,
    fontSize: 14,
  },
  phoneInputWrapper: {
    borderWidth: 1,
    borderColor: colors.secondary_3,
    borderRadius: 12,
    backgroundColor: colors.general_2,
    overflow: 'hidden',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: I18nManager?.isRTL ? 'row-reverse' : 'row',
    textAlign: I18nManager?.isRTL ? 'right' : 'left',
  },
  phoneText: {
    color: colors.primary,
    flex: 1,
    paddingHorizontal: 10,
    height: 56,
    fontSize: 16,
    textAlign: I18nManager?.isRTL ? 'right' : 'left',
  },
});

export default NewTicketScreen; 
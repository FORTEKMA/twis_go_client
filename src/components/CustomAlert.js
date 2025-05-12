import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAlert = ({ visible, title, message, buttons, type = 'warning' }) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'alert-circle-outline';
      case 'error':
        return 'close-circle-outline';
      case 'success':
        return 'check-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#F9DC76';
      case 'error':
        return '#FF6B6B';
      case 'success':
        return '#4CAF50';
      default:
        return '#F9DC76';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.iconContainer}>
            <Icon name={getIcon()} size={40} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'confirm' && styles.confirmButton,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'confirm' && styles.confirmButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: wp(85),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: hp(2),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    marginBottom: hp(1),
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  message: {
    fontSize: hp(1.8),
    color: '#666',
    textAlign: 'center',
    marginBottom: hp(2),
    lineHeight: hp(2.5),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: wp(2),
  },
  button: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#F9DC76',
  },
  buttonText: {
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  confirmButtonText: {
    color: '#333',
  },
});

export default CustomAlert; 
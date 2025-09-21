import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

const UpdateBlockScreen = ({ storeUrl, maintenanceMessage, isMaintenance }) => {
  const { t } = useTranslation();
  const isMaint = !!isMaintenance;
  return (
    <View style={styles.container}>
      <Image source={require('../assets/TawsiletUpdate.png')} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>
        {isMaint
          ? t('maintenance_title') || 'Maintenance'
          : t('update_required_title') || 'Update Required'}
      </Text>
      <Text style={styles.subtitle}>
        {isMaint
          ? maintenanceMessage || t('maintenance_message') || 'The app is under maintenance. Please try again later.'
          : t('update_required_message') || 'A new version of the app is available. Please update to continue using TawsiGO Driver.'}
      </Text>
      {!isMaint && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL(storeUrl)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{t('update_now') || 'Update Now'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#F37A1D',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#F37A1D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateBlockScreen; 
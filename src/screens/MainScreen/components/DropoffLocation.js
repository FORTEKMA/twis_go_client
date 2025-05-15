import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { styles } from '../styles';
import ConfirmButton from './ConfirmButton';
import Geolocation from 'react-native-geolocation-service';
import { getAddressFromCoordinates } from '../../../utils/helpers/mapUtils';
import { Spinner, Toast } from 'native-base';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

const DropoffLocation = ({ formData, goNext, isMapDragging,  onBack }) => {
  const { t } = useTranslation();
  const [dropoffAddress, setDropoffAddress] = useState(formData?.dropoffAddress || {});
 
  useEffect(() => {
    if (formData?.dropAddress) {
      setDropoffAddress(formData.dropAddress);
    }
  }, [formData]);

 

  return (
    <View style={[styles.step1Wrapper, isMapDragging && { opacity: 0.5 }]}>
      <View style={localStyles.header}>
        <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#19191C" />
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>{t('location.where_to')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={localStyles.content}>
       

        <View style={[localStyles.container, localStyles.selectedContainer]}>
          <Text style={{ color: dropoffAddress.address ? '#888' : "#ddd" }}>
            {dropoffAddress.address ? dropoffAddress.address : t('location.dropOff')}
          </Text>
        </View>
      </View>

      <ConfirmButton
        onPress={() => goNext({ dropoffAddress })}
        text={t('location.continue')}
        disabled={!dropoffAddress.latitude}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
   // justifyContent: 'space-between',
 //   paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width:"100%",
    gap:10
  },
  backButton: {
      backgroundColor: '#fff', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 

  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
    width:"100%",
    paddingTop:10
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  container: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
   },
  selectedContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
 
});

export default DropoffLocation; 
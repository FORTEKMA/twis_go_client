import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View} from 'react-native';
import {styles} from '../styles';
import {colors} from '../../../utils/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTranslation} from 'react-i18next';

export const SubmitButton = ({onSubmit, isAlreadyRated, isLoading}) => {
  const {t} = useTranslation();

  if (isAlreadyRated) {
    return (
      <View
        style={[
          styles.alreadyRatedContainer,
          {
            backgroundColor: colors.lightGray,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 16,
          },
        ]}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <Icon name="checkmark-circle" size={24} color={colors.primary} />
          <Text style={[styles.alreadyRatedText, {color: colors.primary}]}>
            {t('rating.already_rated')}
          </Text>
        </View>
      </View>
    );
  }

  return (<TouchableOpacity
    onPress={onSubmit}
    style={ styles.nextButton}>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,}}>
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Icon name="star" size={20} color="white" />
          <Text style={[styles.text, {color: 'white', fontWeight: '600'}]}>
            {t('rating.rate')}
          </Text>
        </>
      )}
    </View>
  </TouchableOpacity>
);
}; 
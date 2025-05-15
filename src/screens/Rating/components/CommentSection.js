import React, {useState} from 'react';
import {TextInput, View, Text, StyleSheet} from 'react-native';
import {styles} from '../styles';
import {colors} from '../../../utils/colors';
import {useTranslation} from 'react-i18next';

export const CommentSection = ({messageText, setMessageText, existingMessage, placeholder}) => {
  const {t} = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 500;

  const handleTextChange = (text) => {
    if (text.length <= maxLength) {
      setMessageText(text);
    }
  };

  return (
    <View style={localStyles.container}>
      <TextInput
        style={[
          localStyles.input,
          {
            borderColor: colors.lightGray,
            minHeight: 88,
            backgroundColor: 'white',
            paddingHorizontal: 14,
            fontSize: 15,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        onChangeText={handleTextChange}
        defaultValue={existingMessage ?? ''}
        multiline
        textAlignVertical="top"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        fontSize={15}
      />
      <View style={localStyles.characterCountContainer}>
        <Text style={localStyles.characterCount}>
          {t('rating.characters', {current: messageText?.length || 0, max: maxLength})}
        </Text>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
  },
  characterCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  characterCount: {
    color: colors.gray,
    fontSize: 12,
  },
}); 
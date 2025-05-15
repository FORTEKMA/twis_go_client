import React from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import {colors} from '../../../utils/colors';
import {useTranslation} from 'react-i18next';

const TAGS = [
  'Very Professional',
  'Arrive On Time',
  'Package Handed Over gently',
  'Other',
];

export const FeedbackTags = ({selectedTags, setSelectedTags}) => {
  const {t} = useTranslation();

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags([]);
    } else {
      setSelectedTags([tag]);
    }
  };

  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 16}}>
      {TAGS.map((tag, idx) => (
        <TouchableOpacity
          key={tag}
          onPress={() => toggleTag(tag)}
          style={{
            width: '48%',
            marginBottom: 12,
            paddingVertical: 14,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selectedTags.includes(tag) ? colors.primary : colors.lightGray,
            backgroundColor: selectedTags.includes(tag) ? colors.lightGray : 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            color: selectedTags.includes(tag) ? colors.primary : colors.gray,
            fontWeight: selectedTags.includes(tag) ? 'bold' : 'normal',
            fontSize: 15,
            textAlign: 'center',
          }}>{t(`rating.feedback_tags.${tag.toLowerCase().replace(/\s+/g, '_')}`)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}; 
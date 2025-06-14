import React from 'react';
import {Text, View, Animated} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import {styles} from '../styles';
import {colors} from '../../../utils/colors';
import {Box, VStack} from 'native-base';
import {useTranslation} from 'react-i18next';

export const StarRatingSection = ({rating, setRating, existingRating}) => {
  const {t} = useTranslation();

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return t('rating.very_bad');
      case 2:
        return t('rating.bad');
      case 3:
        return t('rating.average');
      case 4:
        return t('rating.good');
      case 5:
        return t('rating.excellent');
      default:
        return t('rating.default');
    }
  };

  return (
    <VStack space={4} alignItems="center" py={4}>
      <Text style={[styles.titleText, {color: colors.primary}]}>
        {getRatingText(existingRating ?? rating)}
      </Text>
      <Box bg={colors.lightGray} p={4} borderRadius="xl" width="100%">
        <StarRating
          rating={existingRating ?? rating}
          onChange={setRating}
          maxStars={5}
          starSize={40}
          enableHalfStar={false}
          starStyle={{marginHorizontal: 4}}
          color={colors.primary}
          emptyColor={colors.gray}
        />
      </Box>
    </VStack>
  );
}; 
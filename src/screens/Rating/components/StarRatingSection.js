import React from 'react';
import {Text, View, Animated} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import {styles} from '../styles';
import {colors} from '../../../utils/colors';
import {Box, VStack} from 'native-base';

export const StarRatingSection = ({rating, setRating, existingRating}) => {
  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return 'Très mauvais';
      case 2:
        return 'Mauvais';
      case 3:
        return 'Moyen';
      case 4:
        return 'Bon';
      case 5:
        return 'Excellent';
      default:
        return 'Comment évalueriez-vous votre expérience ?';
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
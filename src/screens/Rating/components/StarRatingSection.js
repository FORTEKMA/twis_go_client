import React from 'react';
import {Text} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import {styles} from '../styles';

export const StarRatingSection = ({rating, setRating, existingRating}) => {
  return (
    <>
      <Text style={styles.titleText}>
        Comment évalueriez-vous votre expérience ?
      </Text>
      <StarRating
        rating={existingRating ?? rating}
        onChange={setRating}
      />
    </>
  );
}; 
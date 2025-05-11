import React from 'react';
import {TouchableOpacity, Text} from 'react-native';
import {styles} from '../styles';

export const SubmitButton = ({onSubmit, isAlreadyRated}) => {
  if (isAlreadyRated) {
    return <Text style={styles.alreadyRatedText}>Vous avez déjà noté</Text>;
  }

  return (
    <TouchableOpacity style={styles.nextButton} onPress={onSubmit}>
      <Text style={styles.text}>Évaluer</Text>
    </TouchableOpacity>
  );
}; 
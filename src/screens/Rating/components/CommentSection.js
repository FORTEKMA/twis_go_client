import React from 'react';
import {Input, Divider} from 'native-base';
import {styles} from '../styles';

export const CommentSection = ({messageText, setMessageText, existingMessage}) => {
  return (
    <>
      <Divider />
      <Input
        style={styles.input}
        placeholder="Laisser un commentaire..."
        onChangeText={setMessageText}
        defaultValue={existingMessage ?? ''}
      />
      <Divider />
    </>
  );
}; 
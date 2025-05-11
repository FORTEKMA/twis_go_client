import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  View,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {createReview} from '../../store/reviewSlice/reviewSlice';
import {StarRatingSection} from './components/StarRatingSection';
import {CommentSection} from './components/CommentSection';
import {SubmitButton} from './components/SubmitButton';
import {styles} from './styles';

const Rating = ({order}) => {
  const [rating, setRating] = useState(0);
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);

  const handleSubmit = () => {
    dispatch(
      createReview({
        body: {
          data: {
            message: messageText,
            score: rating,
            command: order?.id,
            driver: order?.driver_id,
            client: currentUser.id,
          },
        },
      }),
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <StarRatingSection
          rating={rating}
          setRating={setRating}
          existingRating={order?.review?.data?.score}
        />

        <CommentSection
          messageText={messageText}
          setMessageText={setMessageText}
          existingMessage={order?.review?.data?.message}
        />

        <SubmitButton
          onSubmit={handleSubmit}
          isAlreadyRated={order?.review !== null}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default Rating; 
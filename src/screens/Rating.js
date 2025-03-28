import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {colors} from '../utils/colors';
import StarRating from 'react-native-star-rating-widget';
import {Divider, Input} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {createReview} from '../store/reviewSlice/reviewSlice';

const Rating = ({order}) => {
  const [rating, setRating] = useState(0);
  const [messageText, setMessageText] = useState('');
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);

  // Use Platform API for correct API URL

  const profile = order?.attributes?.driver_id;
  console.log(profile);



  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingView}>
        <Text style={styles.titleText}>
          Comment évalueriez-vous votre expérience ?
        </Text>

        <StarRating
          rating={order?.review?.data?.score ?? rating}
          onChange={setRating}
        />

        <Divider />

        <Input
          style={styles.input}
          // variant="unstyled"
          placeholder="Laisser un commentaire..."
          onChangeText={setMessageText}
          defaultValue={order?.review?.data?.message ?? ''}
        />

        <Divider />

        {order?.review === null ? (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() =>
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
              )
            }>
            <Text style={styles.text}>Évaluer</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.alreadyRatedText}>Vous avez déjà noté</Text>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Rating;

const styles = StyleSheet.create({
  container: {
    height: hp(30),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avoidingView: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    height: hp(50),
  },

  titleText: {
    color: colors.primary,
    fontSize: hp(2.2),
    textAlign: 'center',
  },
  input: {
    color: 'black',
  },
  text: {
    color: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
    width: '20%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: hp(2),
    marginTop: hp(2),
  },
  alreadyRatedText: {
    color: 'red',
    fontWeight: '600',
    fontSize: 16,
  },
});

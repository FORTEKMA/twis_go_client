import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {colors} from '../../utils/colors';

export const styles = StyleSheet.create({
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
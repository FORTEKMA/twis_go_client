import {StyleSheet} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {colors} from '../../../utils/colors';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.secondary,
    fontSize: 12,
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay2: {
    position: 'absolute',
    bottom: hp(15),
    borderRadius: 20,
    width: '90%',
  },
  timerContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: 5,
  },
  timerText: {
    color: 'white',
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    bottom: 50,
    gap: 5,
  },
}); 
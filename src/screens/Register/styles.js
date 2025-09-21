import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {colors} from '../../utils/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  inputContainer: {
    width: wp('100%'),
    gap: 15,
  },
  input: {
    width: wp('100%'),
    marginBottom: 10,
  },
  btn: {
    padding: 20,
    backgroundColor: '#F37A1D',
    borderRadius: 20,
    marginTop: 30,
    shadowColor: '#F37A1D',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  }
  btnText: {
    color: 'black',
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 30,
  },
  title: {
    fontWeight: '900',
    color: 'white',
    fontSize: 24,
  },
  inputLabel: {
    fontWeight: '600',
    color: 'white',
    fontSize: 20,
  },
  errorText: {
    color: 'red',
  },
  buttonContainer: {
    alignSelf: 'center',
    width: wp('100%'),
  },
}); 
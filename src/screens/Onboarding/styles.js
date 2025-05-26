import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
  
    paddingTop: hp(4),
    paddingBottom: hp(4),
  },
  stepIndicatorWrapper: {
    paddingHorizontal: wp(5),  
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  stepIndicator: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),  
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'left',
    width: '100%',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: hp(2),
    color: '#888',
    textAlign: 'left',
    width: '100%',
    marginBottom: hp(3),
  },
  illustration: {
    width: wp(97),
    height: hp(52),
    alignSelf: 'center',
    marginTop: hp(2),

  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    paddingHorizontal: wp(5),  
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 14,
    paddingVertical: hp(2),
    marginRight: wp(2),
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#030303',
    borderRadius: 14,
    paddingVertical: hp(2),
    marginLeft: wp(2),
    alignItems: 'center',
  },
  skipText: {
    color: '#888',
    fontSize: hp(2),
    fontWeight: '500',
  },
  nextText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '500',
  },
  btnWrapper: {
    flex: 0.3,
    backgroundColor: '#000',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 15,
  },
  btn: {
    padding: 20,
    backgroundColor: '#0c0c0c',
    width: '100%',
    borderRadius: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: hp(1.5),
  },
  registerText: {
    color: '#8E92A8',
  },
  registerLink: {
    color: 'white',
  },
  registerContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
}); 
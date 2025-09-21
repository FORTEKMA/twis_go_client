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
    textAlign: 'center',
    width: '100%',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: hp(2),
    color: '#888',
    textAlign: 'center',
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
   
    paddingVertical: hp(2),
    marginRight: wp(2),
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#F37A1D',
    borderRadius: 44,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnWrapper: {
    flex: 0.3,
    backgroundColor: '#18365A',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 15,
  },
  btn: {
    padding: 20,
    backgroundColor: '#F37A1D',
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
  // Styles for pagination dots
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#F37A1D',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
}); 
import {StyleSheet} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {colors} from '../../utils/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: '600',
    color: colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(3),
    gap: hp(3),
  },
  titleText: {
    color: colors.primary,
    fontSize: hp(2.2),
    textAlign: 'center',
    marginBottom: hp(2),
  },
  input: {
    color: 'black',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: wp(3),
    marginTop: hp(1),
  },
  text: {
    color: colors.primary,
    fontSize: hp(1.8),
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: hp(1.5),
    borderRadius: 8,
    width: wp(40),
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: hp(3),
    
  },
  alreadyRatedText: {
    color: 'red',
    fontWeight: '600',
    fontSize: hp(1.8),
    textAlign: 'center',
    //marginTop: hp(2),
  },
}); 
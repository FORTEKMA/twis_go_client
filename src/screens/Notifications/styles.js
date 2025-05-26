import { StyleSheet } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { colors } from '../../utils/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 3,
    borderBottomColor: "#ccc",
    width:"90%",
    alignSelf:"center"
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    color: colors.text,
  },
  container: {
    flex: 1,
    padding: wp(4),
  },
  date: {
    fontWeight: '600',
    marginTop: hp(2),
    marginBottom: hp(1),
    color: colors.text,
    fontSize: hp(1.8),
    alignSelf: 'flex-start',
  },
  notificationContainer: {
    width: '100%',
    minHeight: hp(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: wp(4),
    marginBottom: hp(1),
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#ccc",
   
  },
  notificationImage: {
    width: wp(8),
    height: wp(8),
    marginRight: wp(3),
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'column',
    gap: hp(0.5),
  },
  notificationTitle: {
    color: colors.text,
    fontSize: hp(1.8),
    fontWeight: '600',
  },
  notificationDescription: {
    color: colors.textSecondary,
    fontSize: hp(1.6),
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(5),
  },
  emptyIcon: {
    marginBottom: hp(3),
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: hp(1),
  },
  emptyDescription: {
    fontSize: hp(1.8),
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 
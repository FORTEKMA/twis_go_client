import { StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
   // position: 'absolute',
   // top: 50,
  //  left: 20,
  //  zIndex: 1,
    padding: 8,
    marginTop:50
  },
  titleContainer: {
    marginTop: 100,
    alignItems: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#18365A',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    color: '#000',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#888',
    fontSize: 15,
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerIcon: {
    marginRight: 6,
  },
  timerText: {
    color: '#888',
    fontSize: 14,
  },
  timerCount: {
    color: '#18365A',
    fontWeight: 'bold',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resendIcon: {
    marginRight: 6,
  },
  resendButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  btn: {
    backgroundColor: "#030303",
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
}); 
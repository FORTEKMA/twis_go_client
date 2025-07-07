import { StyleSheet ,Dimensions} from 'react-native';
import { colors } from '../../utils/colors';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
const WIDTH=Dimensions.get("screen").width-90
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop:10
  },
  backButton: {
  
    padding: 8,
    
  },
  titleContainer: {
    marginTop: 15,
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
    textAlign: 'left',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 2,
  },
  phoneNumber: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 15,
  },
  editPhoneLinkContainer: {
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 8,
  },
  editPhoneLink: {
    color: '#007AFF',
    fontSize: 15,
    textAlign: 'left',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  otpInput: {
    width: WIDTH/4,
    height: WIDTH/4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    fontSize: 24,
    color: '#000',
  },
  otpInputError: {
    borderColor: '#D21313',
    backgroundColor: '#FFF0F0',
  },
  otpInputText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  helpText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 16,
    marginTop: 2,
  },
  resendContinueRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  resendButton: {
    borderColor: '#0c0c0c',
    flex: 1,
    borderWidth:1,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resendButtonDisabled: {
    opacity: 0.6,
    borderColor: '#0c0c0c60',
  },
  resendButtonText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#030303',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButtonsContainer: {
    
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
   
  },
  resendCountdown: {
    color: '#888',
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 
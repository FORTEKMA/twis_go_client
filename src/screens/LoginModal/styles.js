import { I18nManager, Platform, StyleSheet } from 'react-native';
import { colors } from '../../utils/colors';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
   
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: hp(9),
    paddingBottom: hp(2.5),
    gap: hp(1),
    width: wp('100%'),
    backgroundColor: 'red',
  },
  header: {
    width: '100%',
    paddingStart: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0c0c0c',
  },
  languageButton: {
    padding: 8,
   
    
    
    alignSelf:"flex-end",
    marginHorizontal:15,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagImage: {
    width: 30,
    height: 20,
    borderRadius: 2,
  },
  formContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  inputContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 0,
    
  },
  input: {
    width: '100%',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 14,
    color: '#222',
    marginBottom: 16,
    textAlign:I18nManager.isRTL? "right":"left"
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF4',
   // paddingHorizontal: 18,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    paddingVertical: 14,
    paddingHorizontal: 18,
    textAlign:I18nManager.isRTL? "right":"left"
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#8391A1',
    fontSize: 13,
    //marginBottom: 24,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#030303',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF4',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#8391A1',
    fontSize: 14,
    fontWeight: '500',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 32,
  },
  socialIcon: {
    width:Platform.OS=="ios"?"45%":"100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E8ECF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  registerLink: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 16,
    marginHorizontal:12
  },
  registerText: {
    color: '#222',
    fontSize: 14,
    textAlign: 'center',
  },
  registerNow: {
    color: '#d8b56c',
    fontWeight: '700',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
     width: '100%',
     marginVertical: 20,
    position: 'relative',
    height: 48,
    overflow: 'hidden',
  },
  switchIndicator: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: '#030303',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#030303',
  },
  switchButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderRadius: 10,
  },
  switchButtonActive: {
    backgroundColor: 'transparent',
  },
  switchText: {
    color: '#8391A1',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  switchTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  guestBtn: {
    width: '90%',
    paddingVertical: 16,
    backgroundColor: '#E8ECF4',
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  guestBtnText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
}); 
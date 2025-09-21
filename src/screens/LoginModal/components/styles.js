import {Dimensions, StyleSheet} from 'react-native';
import { colors } from '../../../utils/colors';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 32,
    textAlign: 'left',
    marginTop: 20,
    color: 'gray',
  },
  input: {
    height: 64,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#F7F8F9',
    color: '#000',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordContainer: {
    height: 64,
    borderWidth: 1,
    borderColor: '#E8ECF4',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#F7F8F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordContainerError: {
    borderColor: '#FF3B30',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    color: '#000',
  },
  forgotText: {
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 24,
    color: 'gray',
  },
  loginButton: {
    backgroundColor: '#F37A1D',
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F37A1D',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  }
  loginButtonDisabled: {
    backgroundColor: '#F37A1D80',
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  registerText: {
    color: colors.secondary,
    fontWeight: 'bold',
  },

  //-----------------
  recoveryContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: height * 0.15,
    shadowColor: '#4d6685',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.84,
    elevation: 5,
    gap: 20,
  },
  recoveryImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: -20,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18365A',
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#F37A1D',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#F37A1D',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  }
  btnText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  sentMessage: {
    color: '#18365A',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});
export default styles;

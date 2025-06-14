import { GoogleSignin } from '@react-native-google-signin/google-signin';
import api from '../utils/api';
import { appleAuth } from '@invertase/react-native-apple-authentication';

GoogleSignin.configure({
  iosClientId: '960462603456-vkbvlpur2nvg8t2uvo1d1dp2ja1vcoio.apps.googleusercontent.com',
  offlineAccess: false,
  "client_id":"960462603456-lea706mqdejqra584ckvd6guhi30pqmp.apps.googleusercontent.com"
  // webClientId: '960462603456-lea706mqdejqra584ckvd6guhi30pqmp.apps.googleusercontent.com',
});
// Settings.initializeSDK();

//Settings.setAppID('245483121678302');

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
 
    if (userInfo?.data?.user){
      const userData = await api.post('google-login', userInfo?.data?.user);
      return userData?.data;
    } else {
      throw new Error('User cancelled the login process');
    }
  } catch (error) {
     
    console.error('Google Sign-In Error:', error.response);
    throw error;
  }
};

export const appleSignIn = async () => {
  try {
    // Start the sign-in request
    const appleAuthResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }
 
    // Create a payload with the user's information
    const payload = {
      email: appleAuthResponse.email,
      givenName: appleAuthResponse.fullName?.givenName || '',
      familyName: appleAuthResponse.fullName?.familyName || '',
      id: appleAuthResponse.user,
      identityToken: appleAuthResponse.identityToken,

    };
  

    // Send the payload to your backend
    const userData = await api.post('apple-login', payload);
    return userData?.data;

  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
}; 
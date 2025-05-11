import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { API_URL } from '../config';

// Configure Google Sign In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // Get this from Google Cloud Console
});

export const googleSignIn = async () => {
  try {
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    
    // Get user data
    const user = userCredential.user;
    
    // Send the token to your backend
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: idToken,
        email: user.email,
        name: user.displayName,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const facebookSignIn = async () => {
  try {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      throw new Error('User cancelled the login process');
    }

    // Get the access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error('Something went wrong obtaining access token');
    }

    // Create a Firebase credential with the access token
    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    // Sign-in the user with the credential
    const userCredential = await auth().signInWithCredential(facebookCredential);
    
    // Get user data
    const user = userCredential.user;

    // Send the token to your backend
    const response = await fetch(`${API_URL}/api/auth/facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: data.accessToken,
        email: user.email,
        name: user.displayName,
      }),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Facebook Sign-In Error:', error);
    throw error;
  }
}; 
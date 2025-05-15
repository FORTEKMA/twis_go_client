import { GoogleSignin } from '@react-native-google-signin/google-signin';
 import api from '../utils/api';
 import { LoginManager,Settings,AccessToken,Profile } from "react-native-fbsdk-next";

GoogleSignin.configure({
  iosClientId: '960462603456-vkbvlpur2nvg8t2uvo1d1dp2ja1vcoio.apps.googleusercontent.com',
  offlineAccess: false,
  "client_id":"960462603456-lea706mqdejqra584ckvd6guhi30pqmp.apps.googleusercontent.com"
  // webClientId: '960462603456-lea706mqdejqra584ckvd6guhi30pqmp.apps.googleusercontent.com',
 });
// Settings.initializeSDK();

 Settings.setAppID('245483121678302');


 
export const googleSignIn = async () => {
  try {
  
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    if (userInfo?.data?.user){
   const userData= await api.post('google-login',userInfo?.data?.user)
 
    return userData?.data

   }
   else{
    throw new Error('User cancelled the login process');
   }
 


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
 
    // // Get the access token
  const token=await AccessToken.getCurrentAccessToken()


    const response = await fetch(`https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${token.accessToken}`);
    const currentProfile = await response.json();
    console.log('currentProfile',currentProfile)
     if (currentProfile){
      const payload={
      email:currentProfile?.email,
           givenName:currentProfile?.first_name, 
           familyName:currentProfile?.last_name,
            id:currentProfile?.id
      }
       const userData= await api.post('facebook-login',payload)
       return userData?.data
   
      }
      else{
       throw new Error('User cancelled the login process');
      }
 
  } catch (error) {
    console.error('Facebook Sign-In Error:', error.response);
    throw error;
  }
}; 
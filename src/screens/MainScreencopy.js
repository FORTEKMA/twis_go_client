import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Polygon} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {OneSignal} from 'react-native-onesignal';

import {setStep} from '../store/commandeSlice/commandeSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Estimation from '../components/Estimations';

const MainScreen = () => {
  const dispatch = useDispatch();
  const {width, height} = useWindowDimensions();
  const current = useSelector(state => state?.user?.currentUser);
  const step = useSelector(state => state?.commandes?.currentStep);
  const [currentStep, setCurrentStep] = useState(step);

  useEffect(() => {
    dispatch(setStep(currentStep));
  }, [currentStep]);

  useEffect(() => {
    if (current) {
      OneSignal.login(String(current.id));
    }
  }, [current]);

  const backStepper = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const grandTunisCoordinates = [
    {latitude: 36.8901, longitude: 10.1879}, // La Marsa (start)
    {latitude: 36.8651, longitude: 10.1992}, // Côté Sidi Daoud
    {latitude: 36.8222, longitude: 10.2243}, // Ariana côté nord
    {latitude: 36.81, longitude: 10.219}, // Ariana (northern boundary)
    {latitude: 36.796, longitude: 10.2065}, // Raoued
    {latitude: 36.7666, longitude: 10.1354}, // Kalaat Landlous
    {latitude: 36.7311, longitude: 10.1056}, // Sud Ariana
    {latitude: 36.698, longitude: 10.0831}, // Borj Touil
    {latitude: 36.665, longitude: 10.0785}, // Manouba
    {latitude: 36.6689, longitude: 10.0598}, // Manouba
    {latitude: 36.6503, longitude: 10.0801}, // Mornaguia
    {latitude: 36.6358, longitude: 10.1184}, // Djebel Oust
    {latitude: 36.6685, longitude: 10.2003}, // Fouchana
    {latitude: 36.7041, longitude: 10.2328}, // Ben Arous
    {latitude: 36.7406, longitude: 10.2679}, // Megrine
    {latitude: 36.7816, longitude: 10.2746}, // Tunis centre
    {latitude: 36.8109, longitude: 10.2833}, // Côté Lac
    {latitude: 36.8437, longitude: 10.2575}, // La Goulette
    {latitude: 36.8739, longitude: 10.2304}, // Gammarth
    {latitude: 36.8901, longitude: 10.1879}, // Retour à La Marsa (close loop)
  ];

  return (
    <View style={[styles.container, {width}]}>
      {/* Map Background */}
      <View style={[styles.mapContainer, {height: height / 1}]}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          region={{
            latitude: 36.7,
            longitude: 10.255,
            latitudeDelta: 0.58,
            longitudeDelta: 0.45,
          }}>
          <Polygon
            coordinates={grandTunisCoordinates}
            strokeColor="orange"
            strokeWidth={4}
            fillColor="transparent"
          />
        </MapView>
      </View>

      <View
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled={true}
        contentContainerStyle={{
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'flex-start',
        }}
        style={{marginTop: 0}}>
        <View style={{width: '90%'}}>
          {currentStep === 4 && (
            <TouchableOpacity onPress={backStepper} style={styles.backButton}>
              <Ionicons name={'arrow-back-outline'} size={24} color={'white'} />
            </TouchableOpacity>
          )}
          <Estimation
            setCurrentStep={setCurrentStep}
            currentStep={currentStep}
          />
        </View>
      </View>
    </View>
  );
};

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  text: {
    fontWeight: '500',
    fontSize: hp(3),
    color: '#fff',
    textTransform: 'uppercase',
  },
  textSm: {
    fontWeight: '400',
    fontSize: hp(1.5),
    color: '#fff',
  },
  backButton: {
    top: 55,
    left: 25,
    position: 'absolute',
    zIndex: 99999,
  },
});

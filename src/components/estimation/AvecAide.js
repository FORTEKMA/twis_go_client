import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import {colors} from '../../utils/colors';

const AvecAide = ({selectedCard}) => {
  const loader = require('../../assets/Loader.png');
  const truck = require('../../assets/TRUCK.png');
  const loaderGrey = require('../../assets/GreyLoader.png');
  const truckGrey = require('../../assets/GreyTruck.png');
  return (
    <View
      style={{
        backgroundColor: selectedCard === 1 ? colors.primary : 'white',
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
      }}>
      <Text
        style={{
          color: selectedCard === 1 ? colors.secondary : 'black',
          fontSize: 20,
          fontWeight: '800',
        }}>
        Avec Aide
      </Text>
      <View style={{width: '80%', gap: 10}}>
        <Text style={{color: selectedCard === 1 ? colors.secondary : 'black'}}>
          Choisissez cette option si vous avez des colis plus lourds ou
          encombrants qui nécessitent une assistance.
        </Text>
        <Text style={{color: selectedCard === 1 ? colors.secondary : 'black'}}>
          2 manutentionnaires sera disponible pour vous aider à
          charger/décharger vos colis en toute sécurité.
        </Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={selectedCard === 1 ? loader : loaderGrey}
          style={styles.pinIcon}
        />
        <Image
          source={selectedCard === 1 ? loader : loaderGrey}
          style={styles.pinIcon}
        />
        <Image
          source={selectedCard === 1 ? truck : truckGrey}
          style={styles.pinIcon}
        />
      </View>
    </View>
  );
};

export default AvecAide;

const styles = StyleSheet.create({});

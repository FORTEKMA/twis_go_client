import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import {colors} from '../../utils/colors';

const SansAide = ({selectedCard}) => {
  const loader = require('../../assets/Loader.png');
  const truck = require('../../assets/TRUCK.png');
  const loaderGrey = require('../../assets/GreyLoader.png');
  const truckGrey = require('../../assets/GreyTruck.png');
  return (
    <View
      style={{
        backgroundColor: selectedCard === 2 ? colors.primary : 'white',
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
      }}>
      <Text
        style={{
          color: selectedCard === 2 ? colors.secondary : 'black',
          fontSize: 20,
          fontWeight: '800',
        }}>
        Sans Aide
      </Text>
      <View style={{width: '80%', gap: 10}}>
        <Text style={{color: selectedCard === 2 ? colors.secondary : 'black'}}>
          Idéal pour les petits colis ou les boîtes que vous pouvez soulever
          seul sans aide.
        </Text>
        <Text style={{color: selectedCard === 2 ? colors.secondary : 'black'}}>
          À l'arrivée, le conducteur déposera les colis au pied du camion pour
          votre commodité.
        </Text>
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={selectedCard === 2 ? loader : loaderGrey}
          style={styles.pinIcon}
        />

        <Image
          source={selectedCard === 2 ? truck : truckGrey}
          style={styles.pinIcon}
        />
      </View>
    </View>
  );
};

export default SansAide;

const styles = StyleSheet.create({});

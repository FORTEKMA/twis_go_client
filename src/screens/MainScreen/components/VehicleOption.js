import React from 'react';
import {View, Text, Image, Pressable} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

const VehicleOption = ({onPress, vehicleType, price, distance}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 30,
        justifyContent: 'space-between',
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 15,
        }}>
        <Image source={require('../../../assets/car.png')} />
        <View
          style={{
            alignItems: 'start',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: hp(1.5),
              fontWeight: '700',
            }}>
            {vehicleType}
          </Text>
          <Text
            style={{
              color: '#9B9B9B',
              fontSize: hp(1.5),
              fontWeight: '400',
            }}>
            Near by you
          </Text>
        </View>
      </View>

      <View
        style={{
          alignItems: 'flex-end',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: hp(2),
            fontWeight: '700',
          }}>
          {price} DT
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: hp(1.5),
            fontWeight: '400',
          }}>
          {distance} km
        </Text>
      </View>
    </Pressable>
  );
};

export default VehicleOption; 
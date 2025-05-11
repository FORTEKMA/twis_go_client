import React from 'react';
import {View, Text, Image} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

const TripDetails = ({date, pickupAddress, dropoffAddress, vehicleType}) => {
  return (
    <View style={{flex: 0.5, paddingTop: 10}}>
      <View
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
            gap: 30,
            marginLeft: 10,
          }}>
          <Image source={require('../../../assets/from.png')} />
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
              Departure Date
            </Text>
            <Text
              style={{
                color: '#9B9B9B',
                fontSize: hp(1.5),
                fontWeight: '400',
              }}>
              {date}
            </Text>
          </View>
        </View>
      </View>

      <View
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
            gap: 30,
            marginLeft: 10,
          }}>
          <Image source={require('../../../assets/to.png')} />
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
              Departure Address
            </Text>
            <Text
              style={{
                color: '#9B9B9B',
                fontSize: hp(1.5),
                fontWeight: '400',
              }}>
              {pickupAddress}
            </Text>
          </View>
        </View>
      </View>

      <View
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
            gap: 30,
            marginLeft: 10,
          }}>
          <Image source={require('../../../assets/to.png')} />
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
              Arrival Address
            </Text>
            <Text
              style={{
                color: '#9B9B9B',
                fontSize: hp(1.5),
                fontWeight: '400',
              }}>
              {dropoffAddress}
            </Text>
          </View>
        </View>
      </View>

      <View
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
            gap: 30,
            marginLeft: 10,
          }}>
          <Image source={require('../../../assets/miniCar.png')} />
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
      </View>
    </View>
  );
};

export default TripDetails; 
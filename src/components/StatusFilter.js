/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {colors} from '../utils/colors';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const StatusFilter = ({setStatusFilter, statusFilter}) => {
  const {width} = useWindowDimensions();

  const handlePress = newFilter => {
    // Check if the statusFilter is changing
    if (statusFilter !== newFilter) {
      setStatusFilter(newFilter);
    }
  };

  return (
    <View
      style={{
        marginTop: 20,
        height: hp(7),
        backgroundColor: 'transparent',
        width: width,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
      <Pressable
        style={[styles.filterButton, !statusFilter?.length && styles.active]}
        onPress={() => handlePress(null)}>
        <Text
          style={{
            fontSize: hp(1.5),
            fontWeight: 500,
            padding: 7.5,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            color: statusFilter === null ? colors.general_1 : colors.primary,
            backgroundColor:
              statusFilter === null ? colors.secondary : 'rgb(227 239 253)',
          }}>
          Tout
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.filterButton,
          statusFilter?.includes('Assigned_to_driver') && styles.active,
        ]}
        onPress={() =>
          handlePress([
            'Assigned_to_driver',
            'Pending',
            'Dispatched_to_partner',
          ])
        }>
        <Text
          style={{
            fontSize: hp(1.5),
            fontWeight: 500,
            padding: 7.5,
            width: '100%',
            textAlign: 'center',
            // paddingLeft:0,
            // paddingRight:0,
            borderRadius: 10,
            color: statusFilter?.includes('Assigned_to_driver')
              ? colors.general_1
              : colors.primary,
            backgroundColor: statusFilter?.includes('Assigned_to_driver')
              ? colors.secondary
              : 'rgb(227 239 253)',
          }}>
          En attente
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.filterButton,
          statusFilter?.includes('Driver_on_route_to_pickup') && styles.active,
        ]}
        onPress={() =>
          handlePress([
            'Driver_on_route_to_pickup',
            'Arrived_at_pickup',
            'Picked_up',
            'On_route_to_delivery',
            'Arrived_at_delivery',
          ])
        }>
        <Text
          style={{
            fontSize: hp(1.5),
            fontWeight: 500,
            padding: 7.5,
            width: '100%',
            textAlign: 'center',
            // paddingLeft:0,
            // paddingRight:0,
            borderRadius: 10,
            color: statusFilter?.includes('Driver_on_route_to_pickup')
              ? colors.general_1
              : colors.primary,
            backgroundColor: statusFilter?.includes('Driver_on_route_to_pickup')
              ? colors.secondary
              : 'rgb(227 239 253)',
          }}>
          En cours
        </Text>
      </Pressable>
      <Pressable
        style={[
          styles.filterButton,
          statusFilter?.includes('Delivered') && styles.active,
        ]}
        onPress={() => handlePress(['Delivered', 'Completed'])}>
        <Text
          style={{
            fontSize: hp(1.5),
            fontWeight: 500,
            padding: 7.5,
            width: '100%',
            textAlign: 'center',
            // paddingLeft:0,
            // paddingRight:0,
            borderRadius: 10,
            color: statusFilter?.includes('Delivered')
              ? colors.general_1
              : colors.primary,
            backgroundColor: statusFilter?.includes('Delivered')
              ? colors.secondary
              : 'rgb(227 239 253)',
          }}>
          Livré
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.filterButton,
          statusFilter?.includes('Failed_delivery') && styles.active,
        ]}
        onPress={() =>
          handlePress([
            'Failed_delivery',
            'Failed_pickup',
            'Canceled_by_client',
            'Canceled_by_partner',
          ])
        }>
        <Text
          style={{
            fontSize: hp(1.5),
            fontWeight: 500,
            padding: 7.5,
            width: '100%',
            textAlign: 'center',
            // paddingLeft:0,
            // paddingRight:0,
            borderRadius: 10,
            color: statusFilter?.includes('Failed_delivery')
              ? colors.general_1
              : colors.primary,
            backgroundColor: statusFilter?.includes('Failed_delivery')
              ? colors.secondary
              : 'rgb(227 239 253)',
          }}>
          Annulé
        </Text>
      </Pressable>
    </View>
  );
};

export default StatusFilter;

const styles = StyleSheet.create({
  filterButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flexBasis: wp('20%'),
    color: colors.primary,
  },
  active: {
    borderBottomColor: colors.secondary,
    // borderBottomWidth: 2,
  },
});

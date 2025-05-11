import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {styles} from '../styles';

const MapControls = ({
  onDriverPosition,
  onDropPosition,
  onPickupPosition,
}) => {
  return (
    <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={onDriverPosition}>
        <Text style={styles.buttonText}>Position livreur</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onDropPosition}>
        <Text style={styles.buttonText}>Position dépot</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onPickupPosition}>
        <Text style={styles.buttonText}>Position ramassage</Text>
      </Pressable>
    </View>
  );
};

export default MapControls; 
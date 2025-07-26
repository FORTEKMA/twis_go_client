import React, { memo } from 'react';
import { StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { selectSettingsList } from '../store/utilsSlice/utilsSlice';

const DriverMarkerComponent = ({ angle = 0, type = 1 }) => {
 
  const settingsList = useSelector(selectSettingsList);
  // Find the settings entry for this type
  //console.log("settingsList",settingsList)
  const setting = settingsList.find(s => s.id === type);
  const iconUrl = setting?.map_icon?.url;
   if (!iconUrl) {
    // fallback to a local image if not found
    return (
      <Image
        source={require('../assets/eco.png')}
        style={[styles.icon, { transform: [{ rotate: `${angle}deg` }] }]}
      />
    );
  }

  return (
    <Image
      source={{ uri: iconUrl }}
      style={[styles.icon, { transform: [{ rotate: `${angle}deg` }] }]}
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

// Only re-render if angle or type changed
export default memo(DriverMarkerComponent, (prev, next) => prev.angle === next.angle && prev.type === next.type);

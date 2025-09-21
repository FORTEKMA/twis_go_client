import React, { memo, useMemo } from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { useSelector } from 'react-redux';
import { selectSettingsList } from '../store/utilsSlice/utilsSlice';

// Marker icon that resolves its image from Redux settings based on vehicle type.
// It finds the settings item whose id === type and uses its map_icon.url.
const DriverMarkerComponent = ({ type, onLoad = () => {} }) => {
  const settingsList = useSelector(selectSettingsList);

  const iconUrl = useMemo(() => {
    if (!Array.isArray(settingsList)) return undefined;
    const matched = settingsList.find((s) => s?.id === type);
    return matched?.map_icon?.url;
  }, [settingsList, type]);
 
  if (!iconUrl) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/eco.png')}
          style={styles.icon}
          onLoad={onLoad}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: iconUrl }}
        style={styles.icon}
        onLoad={onLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});

// Memoize component; internal useSelector will update when settingsList changes.
export default memo(DriverMarkerComponent);

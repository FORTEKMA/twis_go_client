/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import {Image, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {colors} from '../utils/colors';
import {formatDateTime} from '../utils/formatDateTime';
import {Divider} from 'native-base';
import Card from '../components/Card';
const Tracking = ({order, timer, setTimer}) => {
  const mapRef = useRef(null);

  const [pickupCoordinate, setPickupCoordinate] = useState([0, 0]);
  const [dropCoordinate, setDropCoordinateCoordinate] = useState([0, 0]);
  const [driverPosition, setDriverPosition] = useState([0, 0]);
  // const [origine, setOrigine] = useState();
  // const [destination, setDestination] = useState();
  // const [DriverCurrentPos, setDriverCurrentPos] = useState();
  const latitudeDelta = 0.4;
  const longitudeDelta = 0.4;
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });
  // const origin = {latitude: dropCoordinate[0], longitude: dropCoordinate[1]};
  // const destination = {
  //   latitude: pickupCoordinate[0],
  //   longitude: pickupCoordinate[1],
  // };
  // const DriverCurrentPos = {
  //   latitude: driverPosition[0],
  //   longitude: driverPosition[1],
  // };
  useEffect(() => {
    if (order) {
      setDriverPosition([
        order?.driver_id?.location?.latitude,
        order?.driver_id?.location?.longitude,
      ]);
      setDropCoordinateCoordinate([
        order?.attributes?.dropOfAddress?.coordonne?.latitude,
        order?.attributes?.dropOfAddress?.coordonne?.longitude,
      ]);
      setPickupCoordinate([
        order?.attributes?.pickUpAddress?.coordonne?.latitude,
        order?.attributes?.pickUpAddress?.coordonne?.longitude,
      ]);
      setRegion({
        latitude:
          order?.attributes?.driver_id?.data?.attributes?.accountOverview[0]
            ?.position?.coords?.latitude,
        longitude:
          order?.attributes?.driver_id?.data?.attributes?.accountOverview[0]
            ?.position?.coords?.longitude,
        latitudeDelta,
        longitudeDelta,
      });
    }
  }, [order]);

  const GOOGLE_MAPS_APIKEY = 'AIzaSyA8oEc5WKQqAXtSKpSH4igelH5wlPDaowE';
  const handleAnimateToDriverPosition = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: driverPosition[0],
          longitude: driverPosition[1],
          latitudeDelta,
          longitudeDelta,
        },
        1000,
      );
    }
  };
  const handleAnimateToPickupPosition = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: pickupCoordinate[0],
          longitude: pickupCoordinate[1],
          latitudeDelta,
          longitudeDelta,
        },
        1000,
      );
    }
  };

  const handleAnimateToDropPosition = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: dropCoordinate[0],
          longitude: dropCoordinate[1],
          latitudeDelta,
          longitudeDelta,
        },
        1000,
      );
    }
  };
  return (
    <>
      <View style={styles.container}>
        {pickupCoordinate[0] !== 0 &&
        dropCoordinate[0] !== 0 &&
        driverPosition[0] !== 0 ? (
          <MapView
            showsUserLocation={true}
            userLocationCalloutEnabled={true}
            onMapReady={() => {
              if (mapRef.current) {
                mapRef.current.animateToRegion(region, 1000); // 1000 is the duration in milliseconds
              }
            }}
            style={styles.map}
            region={region}
            ref={mapRef}
            provider={
              Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }>
            <MapViewDirections
              origin={{
                latitude: pickupCoordinate[0],
                longitude: pickupCoordinate[1],
              }}
              destination={{
                latitude: dropCoordinate[0],
                longitude: dropCoordinate[1],
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={5}
              strokeColor="#595FE5"
            />

            {driverPosition[0] !== 0 && driverPosition[1] !== 0 && (
              <>
                <Marker
                  coordinate={{
                    latitude: driverPosition[0],
                    longitude: driverPosition[1],
                  }}
                  title="drop Address">
                  <Image
                    source={require('../assets/TRUCK.png')}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain',
                    }} // Adjust the size as needed
                  />
                </Marker>
                {order?.attributes?.commandStatus === 'Pending' ? (
                  <MapViewDirections
                    precision="high"
                    origin={{
                      latitude: driverPosition[0],
                      longitude: driverPosition[1],
                    }}
                    destination={{
                      latitude: pickupCoordinate[0],
                      longitude: pickupCoordinate[1],
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={2}
                    strokeColor="#FF0000"
                  />
                ) : (
                  <MapViewDirections
                    precision="high"
                    origin={{
                      latitude: driverPosition[0],
                      longitude: driverPosition[1],
                    }}
                    destination={{
                      latitude: dropCoordinate[0],
                      longitude: dropCoordinate[1],
                    }}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={2}
                    strokeColor="#FF0000"
                  />
                )}
              </>
            )}
            {dropCoordinate[0] !== 0 && pickupCoordinate[0] !== 0 && (
              <>
                <Marker
                  coordinate={{
                    latitude: dropCoordinate[0],
                    longitude: dropCoordinate[1],
                  }}
                  title="Adresse de dépot"></Marker>
                <Marker
                  coordinate={{
                    latitude: pickupCoordinate[0],
                    longitude: pickupCoordinate[1],
                  }}
                  title="Adresse de ramassage"></Marker>
              </>
            )}
          </MapView>
        ) : null}
        <View style={styles.overlay2}>
          <Card order={order} />
        </View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            zIndex: 1000,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            left: 0,
            bottom: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            gap: 5,
          }}>
          <Text style={{color: 'white'}}>Refresh dans {timer} seconds</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            zIndex: 1000,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            left: 0,
            bottom: 50,

            gap: 5,
          }}>
          <Pressable
            style={styles.button}
            onPress={handleAnimateToDriverPosition}>
            <Text style={styles.buttonText}>Position livreur</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={handleAnimateToDropPosition}>
            <Text style={styles.buttonText}>Position dépot</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={handleAnimateToPickupPosition}>
            <Text style={styles.buttonText}>Position ramassage</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default Tracking;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    color: colors.secondary,
    fontSize: 12,
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay2: {
    position: 'absolute',
    bottom: hp(15),

    borderRadius: 20,

    width: '90%',
  },
});

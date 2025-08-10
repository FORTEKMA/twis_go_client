import React from 'react';
import {Image, Platform, View} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {styles} from '../styles';

const GOOGLE_MAPS_APIKEY = 'AIzaSyA0JbWwMvbJ7IYcL4_cagsFQLyLqXHA7xs';

const TrackingMap = ({
  mapRef,
  region,
  pickupCoordinate,
  dropCoordinate,
  driverPosition,
  order,
  onMapReady,
}) => {
  return (
    <MapView
      showsUserLocation={true}
      userLocationCalloutEnabled={true}
      onMapReady={onMapReady}
      style={styles.map}
      region={region}
      ref={mapRef}
      provider={PROVIDER_GOOGLE}>
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
              source={require('../../../assets/TRUCK.png')}
              style={{
                width: 40,
                height: 40,
                objectFit: 'contain',
              }}
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
            title="Adresse de dépot"
          />
          <Marker
            coordinate={{
              latitude: pickupCoordinate[0],
              longitude: pickupCoordinate[1],
            }}
            title="Adresse de ramassage"
          />
        </>
      )}
    </MapView>
  );
};

export default TrackingMap; 
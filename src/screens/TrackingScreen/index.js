import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { API_GOOGLE } from '@env';
import api from '../../utils/api';
import { colors } from '../../utils/colors'; // Assuming colors are defined here, will override
import db from '../../utils/firebase';
import DriverMarker from '../../components/DriverMarker';
import { RouteOptimizer, DriverMovementTracker, MapPerformanceUtils, NavigationRouteManager } from '../../utils/mapUtils';
import { getDistance } from 'geolib';

// Using Google provider via react-native-maps

const { width, height } = Dimensions.get('window');

// Camera animation duration
const CAMERA_ANIMATION_DURATION = 1000;

// Helper function to decode Google's polyline format
const decodePolyline = (encoded) => {
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let shift = 0, result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      let b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (result >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    poly.push([lng / 1E5, lat / 1E5]);
  }

  return poly;
};

// Enhanced route generation with street-level details
const generateEnhanced3DRoute = (origin, destination) => {
  const [originLat, originLng] = origin.split(',').map(Number);
  const [destLat, destLng] = destination.split(',').map(Number);
  
  // Generate more realistic curved route with street-level precision
  const numPoints = 25; // More points for smoother curves
  const coordinates = [];
  
  // Add some realistic street-level curves
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    
    // Add slight curves to simulate real street paths
    const curveFactor = Math.sin(ratio * Math.PI * 2) * 0.0005;
    const lat = originLat + (destLat - originLat) * ratio + curveFactor;
    const lng = originLng + (destLng - originLng) * ratio + curveFactor * 0.5;
    
    coordinates.push([lng, lat]);
  }
  
  return coordinates;
};

const TrackingScreen = ({ route }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  // Safe parameter extraction to prevent ReadableNativeMap casting error
  const orderId = route?.params?.id || route?.params || null;
  
  // Ensure orderId is a string
  const safeOrderId = typeof orderId === 'string' ? orderId : 
                     typeof orderId === 'object' && orderId?.id ? orderId.id :
                     String(orderId || '');
  
  // State management
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isFollowingDriver, setIsFollowingDriver] = useState(true);
  const [driverIsMoving, setDriverIsMoving] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeUpdateKey, setRouteUpdateKey] = useState(0);
  
  const [isFocusingOnAllCoordinates, setIsFocusingOnAllCoordinates] = useState(false);
  const [routeInstructions, setRouteInstructions] = useState([]);
  
  // Map refs
  const mapRef = useRef(null);
  
  const routeUpdateTimeoutRef = useRef(null);
  const driverMarkerRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Initialize utilities
  const routeOptimizer = useRef(new RouteOptimizer()).current;
  const driverTracker = useRef(new DriverMovementTracker()).current;
  const navigationManager = useRef(new NavigationRouteManager()).current;
  
  // Enhanced throttled camera update with 3D capabilities
  const throttledCameraUpdate = useRef(
    MapPerformanceUtils.throttle((center, options = {}) => {
      if (mapRef.current && mapReady && center) {
        const camera = {
          center,
          pitch: 0,
          heading: options.bearing || 0,
          zoom: 16,
        };
        mapRef.current.animateCamera(camera, { duration: CAMERA_ANIMATION_DURATION });
      }
    }, 500)
  ).current;

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (routeUpdateTimeoutRef.current) {
        clearTimeout(routeUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced route regeneration with 3D street style
  useEffect(() => {
    if (order && driverPosition) {
      generateRouteBasedOnStatus(order, driverPosition).catch(console.error);
    }
  }, [order?.commandStatus, driverPosition]);

  // Focus on all coordinates when map is ready and data is loaded
  useEffect(() => {
    if (mapReady && order && !loading) {
      // Small delay to ensure all data is properly loaded
      const timer = setTimeout(() => {
        focusOnAllCoordinates();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mapReady, order, driverPosition, loading, focusOnAllCoordinates]);

  // Focus on coordinates when driver position updates (if not following driver)
  useEffect(() => {
    if (mapReady && driverPosition && !isFollowingDriver) {
      // Only update focus if we're not following the driver
      const timer = setTimeout(() => {
        focusOnAllCoordinates();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [driverPosition, isFollowingDriver, mapReady, focusOnAllCoordinates]);

  // Listen to driver location updates from Firebase with enhanced tracking
  useEffect(() => {
    if (driver?.documentId) {
      const driverRef = db.ref(`drivers/${driver.documentId}`);
      const unsubscribe = driverRef.on('value', snapshot => {
        const data = snapshot.val();
        if (data?.latitude && data?.longitude) {
          const newPosition = {
            latitude: data.latitude,
            longitude: data.longitude,
            type: data.type,
            angle: data.angle || 0,
            speed: data.speed || 0,
            heading: data.heading || 0,
          };
          
          // Enhanced driver movement tracking
          const trackedPosition = driverTracker.addPosition(
            data.latitude,
            data.longitude,
            Date.now()
          );
          
          setDriverIsMoving(trackedPosition.isMoving);
          setDriverPosition(newPosition);
          
          // Update estimated arrival
          updateEstimatedArrival(newPosition);
          
          // Enhanced route regeneration with debouncing
          if (order) {
            if (routeUpdateTimeoutRef.current) {
              clearTimeout(routeUpdateTimeoutRef.current);
            }
            
            routeUpdateTimeoutRef.current = setTimeout(() => {
              generateRouteBasedOnStatus(order, newPosition).catch(console.error);
            }, 800);
          }
          
          // Camera follow
          if (isFollowingDriver && mapReady) {
            throttledCameraUpdate({ latitude: newPosition.latitude, longitude: newPosition.longitude }, {
              bearing: newPosition.heading || 0,
            });
          }
        }
      });
      return () => driverRef.off('value', unsubscribe);
    }
  }, [driver?.documentId, isFollowingDriver, mapReady, order, streetViewMode, cameraFollowBearing]);

  // Enhanced UI animations
  useEffect(() => {
    if (!loading && !error) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Show navigation panel if in navigation mode
      // Removed navigationPanelAnim animation
    }
  }, [loading, error]);

  const updateEstimatedArrival = useCallback((driverPos) => {
    if (!order?.pickUpAddress?.coordonne) return;
    
    const pickup = order.pickUpAddress.coordonne;
    const distance = getDistance(
      { latitude: driverPos.latitude, longitude: driverPos.longitude },
      { latitude: pickup.latitude, longitude: pickup.longitude }
    );
    
    // Enhanced time estimation based on traffic and speed
    const averageSpeed = driverPos.speed > 0 ? driverPos.speed : 30; // km/h
    const estimatedTimeMinutes = Math.round((distance / 1000) / (averageSpeed / 60));
    setEstimatedArrival(Math.max(1, estimatedTimeMinutes));
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
     
      const response = await api.get(`commands/${safeOrderId}?populate[0]=driver&populate[1]=pickUpAddress&populate[2]=dropOfAddress&populate[3]=pickUpAddress.coordonne&populate[4]=dropOfAddress.coordonne&populate[5]=driver.profilePicture&populate[6]=review&populate[7]=driver.vehicule`);
      
      if (response?.data?.data != undefined) {
        setOrder(response.data.data); 
        setDriver(response.data.data.driver);
        
        // Generate enhanced 3D route based on status
        generateEnhanced3DRouteBasedOnStatus(response.data.data, driverPosition).catch(console.error);
      } else {
        setError(t('tracking.order_not_found'));
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setError(t('tracking.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  // Enhanced 3D route generation with street-level details
  const generateEnhanced3DRouteBasedOnStatus = async (orderData, driverPos) => {
    const pickup = orderData?.pickUpAddress?.coordonne;
    const dropoff = orderData?.dropOfAddress?.coordonne;
    const status = orderData?.commandStatus;
    
    if (!pickup || !dropoff) return;
    
    const pickupCoord = [pickup.longitude, pickup.latitude];
    const dropoffCoord = [dropoff.longitude, dropoff.latitude];
    
    let routeCoordinates = [];
    let origin, destination;
    
    switch (status) {
      case 'Pending':
      case 'Canceled_by_client':
      case 'Canceled_by_partner':
      case 'Go_to_pickup':
        if (driverPos) {
          origin = `${driverPos.latitude},${driverPos.longitude}`;
          destination = `${pickup.latitude},${pickup.longitude}`;
        } else {
          origin = `${pickup.latitude},${pickup.longitude}`;
          destination = `${dropoff.latitude},${dropoff.longitude}`;
        }
        break;
        
      case 'Arrived_at_pickup':
      case 'Picked_up':
        if (driverPos) {
          origin = `${driverPos.latitude},${driverPos.longitude}`;
          destination = `${dropoff.latitude},${dropoff.longitude}`;
        } else {
          origin = `${pickup.latitude},${pickup.longitude}`;
          destination = `${dropoff.latitude},${dropoff.longitude}`;
        }
        break;
        
      default:
        origin = `${pickup.latitude},${pickup.longitude}`;
        destination = `${dropoff.latitude},${dropoff.longitude}`;
        break;
    }
    
    try {
      // Enhanced Google Directions API call with additional parameters
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&alternatives=false&avoid=tolls&traffic_model=best_guess&departure_time=now&key=${API_GOOGLE}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const points = route.overview_polyline.points;
        
        // Decode the polyline to get coordinates
        routeCoordinates = decodePolyline(points);
        
        // Calculate enhanced route metrics
        const distance = route.legs[0].distance.value;
        const duration = route.legs[0].duration.value;
        const durationInTraffic = route.legs[0].duration_in_traffic?.value || duration;
        
        setRouteDistance(distance);
        
        // Enhanced turn-by-turn instructions with maneuver types
        const steps = route.legs[0].steps.map((step, index) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text,
          maneuver: step.maneuver || 'straight',
          startLocation: step.start_location,
          endLocation: step.end_location,
          polyline: step.polyline.points,
          stepIndex: index,
        }));
        
        setRouteInstructions(steps);
        
        // Initialize navigation manager with enhanced route data
        if (navigationManager && typeof navigationManager.setRoute === 'function') {
          navigationManager.setRoute(routeCoordinates, steps);
        }
      } else {
        // Enhanced fallback route generation
        routeCoordinates = generateEnhanced3DRoute(origin, destination);
        
        // Initialize navigation manager with fallback route
        if (navigationManager && typeof navigationManager.setRoute === 'function') {
          navigationManager.setRoute(routeCoordinates, []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch enhanced route:', error);
      routeCoordinates = generateEnhanced3DRoute(origin, destination);
      
      // Initialize navigation manager with fallback route
      if (navigationManager && typeof navigationManager.setRoute === 'function') {
        navigationManager.setRoute(routeCoordinates, []);
      }
    }
    
    // Convert to enhanced GeoJSON with additional properties
    const routeShape = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: routeCoordinates
      },
      properties: {
        color: '#000000',
        width: streetViewMode ? STREET_STYLE_3D_CONFIG.routeWidth : 4,
        opacity: 0.8,
        style: streetViewMode ? '3d-street' : 'standard'
      }
    };
    
    setRouteCoordinates(routeShape);
    setRouteUpdateKey(prev => prev + 1);
  };

  // Get order status color and text
  const getOrderStatusInfo = useCallback((status) => {
    const statusConfig = {
      'Pending': { color: '#FFA500', text: t('order.status.pending', 'Pending') },
      'Assigned_to_driver': { color: '#007AFF', text: t('order.status.assigned', 'Assigned') },
      'Driver_on_route_to_pickup': { color: '#007AFF', text: t('order.status.on_route', 'On Route') },
      'Arrived_at_pickup': { color: '#FF9500', text: t('order.status.arrived', 'Arrived') },
      'Picked_up': { color: '#34C759', text: t('order.status.picked_up', 'Picked Up') },
      'On_route_to_delivery': { color: '#34C759', text: t('order.status.delivering', 'Delivering') },
      'Arrived_at_delivery': { color: '#34C759', text: t('order.status.delivered', 'Delivered') },
      'Completed': { color: '#34C759', text: t('order.status.completed', 'Completed') },
      'Canceled_by_client': { color: '#FF3B30', text: t('order.status.canceled', 'Canceled') },
      'Canceled_by_partner': { color: '#FF3B30', text: t('order.status.canceled', 'Canceled') },
    };
    
    return statusConfig[status] || { color: '#666666', text: status || 'Unknown' };
  }, [t]);

  const toggleFollowDriver = () => {
    setIsFollowingDriver(!isFollowingDriver);
    if (!isFollowingDriver && driverPosition && mapRef.current) {
      throttledCameraUpdate({ latitude: driverPosition.latitude, longitude: driverPosition.longitude });
    }
  };

  const focusOnDriver = () => {
    if (driverPosition && mapRef.current) {
      throttledCameraUpdate({ latitude: driverPosition.latitude, longitude: driverPosition.longitude });
    }
  };

  // Focus map on all coordinates (driver, pickup, dropoff)
  const focusOnAllCoordinates = useCallback(() => {
    if (!mapRef.current || !mapReady) return;
    
    setIsFocusingOnAllCoordinates(true);
    
    const coordinates = [];
    
    // Add driver position if available
    if (driverPosition) {
      coordinates.push([driverPosition.longitude, driverPosition.latitude]);
    }
    
    // Add pickup location
    if (order?.pickUpAddress?.coordonne) {
      coordinates.push([
        order.pickUpAddress.coordonne.longitude,
        order.pickUpAddress.coordonne.latitude
      ]);
    }
    
    // Add dropoff location
    if (order?.dropOfAddress?.coordonne) {
      coordinates.push([
        order.dropOfAddress.coordonne.longitude,
        order.dropOfAddress.coordonne.latitude
      ]);
    }
    
    // If we have coordinates, fit them to the map
    if (coordinates.length > 0) {
      if (coordinates.length === 1) {
        mapRef.current.animateCamera({
          center: coordinates[0],
          zoom: 16,
          pitch: 0,
          heading: 0,
        }, { duration: 1500 });
      } else {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
      }
    }
    
    // Reset the focusing state after animation
    setTimeout(() => {
      setIsFocusingOnAllCoordinates(false);
    }, 1600);
  }, [mapReady, driverPosition, order]);

 
  // Calculate route progress based on driver position
  const calculateRouteProgress = useCallback((routeCoords, driverPos) => {
    if (!routeCoords || !routeCoords.geometry || !driverPos) return 0;
    
    const coordinates = routeCoords.geometry.coordinates;
    if (coordinates.length < 2) return 0;
    
    let totalDistance = 0;
    let traveledDistance = 0;
    let closestPointIndex = 0;
    let minDistance = Infinity;
    
    // Find the closest point on the route to the driver
    for (let i = 0; i < coordinates.length; i++) {
      const distance = getDistance(
        { latitude: driverPos.latitude, longitude: driverPos.longitude },
        { latitude: coordinates[i][1], longitude: coordinates[i][0] }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
      }
    }
    
    // Calculate total route distance
    for (let i = 1; i < coordinates.length; i++) {
      totalDistance += getDistance(
        { latitude: coordinates[i-1][1], longitude: coordinates[i-1][0] },
        { latitude: coordinates[i][1], longitude: coordinates[i][0] }
      );
    }
    
    // Calculate traveled distance
    for (let i = 1; i <= closestPointIndex; i++) {
      traveledDistance += getDistance(
        { latitude: coordinates[i-1][1], longitude: coordinates[i-1][0] },
        { latitude: coordinates[i][1], longitude: coordinates[i][0] }
      );
    }
    
    return totalDistance > 0 ? traveledDistance / totalDistance : 0;
  }, []);

  // Get route color based on status and mode
  const getRouteColor = useCallback((status, is3D = false) => {
    if (is3D) {
      return '#000000'; // Black for 3D mode
    }
    
    switch (status) {
      case 'Go_to_pickup':
        return '#FF9500'; // Orange for going to pickup
      case 'Picked_up':
      case 'On_route_to_delivery':
        return '#34C759'; // Green for delivery route
      case 'Arrived_at_pickup':
        return '#007AFF'; // Blue for arrived at pickup
      default:
        return '#007AFF'; // Default blue
    }
  }, []);

  // Get route width based on mode
  const getRouteWidth = useCallback((is3D = false) => {
    return is3D ? STREET_STYLE_3D_CONFIG.routeWidth : 6;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>{t('tracking.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#000000" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrder}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('tracking.title')}
        </Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          onMapReady={() => setMapReady(true)}
          showsCompass={true}
          pitchEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
        >

          {/* Route polyline */}
          {Array.isArray(routeCoordinates) && routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={getRouteColor(order?.commandStatus)}
              strokeWidth={getRouteWidth()}
            />
          )}

          {/* Route progress indicator removed for simplicity */}

          {/* Driver Marker */}
          {driverPosition && (
            <Marker
              identifier="driverMarker"
              coordinate={{ latitude: driverPosition.latitude, longitude: driverPosition.longitude }}
            >
              <DriverMarker
                angle={driverPosition.angle || 0}
                type={driverPosition.type || 1}
                isMoving={driverIsMoving}
                is3D={false}
                onLoad={() => {}}
              />
            </Marker>
          )}

          {/* Pickup Location Marker */}
          {order?.pickUpAddress?.coordonne && (
            <Marker
              identifier="pickupMarker"
              coordinate={{
                latitude: order.pickUpAddress.coordonne.latitude,
                longitude: order.pickUpAddress.coordonne.longitude,
              }}
            >
              <View style={[styles.locationMarker, styles.pickupMarker]}>
                <MaterialCommunityIcons name="map-marker" size={30} color="#000000" />
              </View>
            </Marker>
          )}

          {/* Dropoff Location Marker */}
          {order?.dropOfAddress?.coordonne && (
            <Marker
              identifier="dropoffMarker"
              coordinate={{
                latitude: order.dropOfAddress.coordonne.latitude,
                longitude: order.dropOfAddress.coordonne.longitude,
              }}
            >
              <View style={[styles.locationMarker, styles.dropoffMarker]}>
                <MaterialCommunityIcons name="flag-checkered" size={30} color="#000000" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          
          <TouchableOpacity
            style={[styles.controlButton, isFollowingDriver && styles.controlButtonActive]}
            onPress={toggleFollowDriver}
          >
            <MaterialCommunityIcons 
              name="crosshairs-gps" 
              size={24} 
              color={isFollowingDriver ? '#000000' : '#666666'} 
            />
            {isFollowingDriver && (
              <View style={styles.controlButtonIndicator}>
                <Text style={styles.controlButtonIndicatorText}>{t('tracking.follow')}</Text>
              </View>
            )}
          </TouchableOpacity>
         
          
          <TouchableOpacity style={styles.controlButton} onPress={focusOnAllCoordinates}>
            <MaterialCommunityIcons name="map-marker-multiple" size={24} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
 
    

      {/* Status Indicator */}
      <View style={styles.statusIndicator}>
        <View style={[
          styles.statusDot,
          driverIsMoving ? styles.statusMoving : styles.statusStopped
        ]} />
        <Text style={styles.statusText}>
          {driverIsMoving ? t('tracking.driver_moving') : t('tracking.driver_stopped')}
        </Text>
        
        {isFocusingOnAllCoordinates && (
          <View style={styles.statusFocusIndicator}>
            <MaterialCommunityIcons name="map-marker-multiple" size={12} color="#007AFF" />
            <Text style={styles.statusFocusText}>{t('tracking.focusing')}</Text>
          </View>
        )}
        {order?.commandStatus && (
          <View style={[
            styles.statusOrderIndicator,
            { backgroundColor: getOrderStatusInfo(order.commandStatus).color + '20' }
          ]}>
            <View style={[
              styles.statusOrderDot,
              { backgroundColor: getOrderStatusInfo(order.commandStatus).color }
            ]} />
            <Text style={[
              styles.statusOrderText,
              { color: getOrderStatusInfo(order.commandStatus).color }
            ]}>
              {getOrderStatusInfo(order.commandStatus).text}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};



export default TrackingScreen;


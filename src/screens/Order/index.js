import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Linking,
  I18nManager,
} from "react-native";
import BackgroundTimer from 'react-native-background-timer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
 import { colors } from "../../utils/colors";
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { API_GOOGLE } from '@env';
 import OrderPlaceholder from '../../components/OrderPlaceholder';
import DriverMarker from '../../components/DriverMarker';
import CustomAlert from '../../components/CustomAlert';
import OrderCancelConfirmationModal from './components/OrderCancelConfirmationModal';
import OrderCancellationReasonSheet from './components/OrderCancellationReasonSheet';
import OrderReportProblemModal from './components/OrderReportProblemModal';
import { 
  trackScreenView, 
  trackOrderDetailsViewed,
  trackRideCancelled,
  trackRideCompleted
} from '../../utils/analytics';
import db from '../../utils/firebase';
import { ref as dbRef, onValue, off, remove } from 'firebase/database';
import ChatModal from '../Chat';
import ChatButton from '../../components/ChatButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Order = ({ route }) => {
  const { t } = useTranslation();
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelReasonSheet, setShowCancelReasonSheet] = useState(false);
  const [otherReason, setOtherReason] = useState('');
  const [showReportProblem, setShowReportProblem] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [chargeParams, setChargeParams] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [driverIsMoving, setDriverIsMoving] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isDangerMode, setIsDangerMode] = useState(false);
  const timerRef = useRef(null);
  const mapRef = useRef(null);
  const driverListenerRef = useRef({ ref: null, unsubscribe: null });
  const dangerListenerRef = useRef({ ref: null, unsubscribe: null });
  const backgroundTimerStarted = useRef(false);
  const timerStartTime = useRef(null);
 
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const hasAutoOpenedRating = useRef(false);

  // Track screen view on mount
  useEffect(() => {
    trackScreenView('OrderDetails', { order_id: id });
  }, []);

  // Recalculate time when screen comes into focus (fallback for background timer)
  useEffect(() => {
    if (isFocused && order?.commandStatus === 'Arrived_at_pickup' && chargeParams) {
      const { waitingTime: currentTime, charges: currentCharges } = calculateTimeAndCharges();
      setWaitingTime(currentTime);
      setAdditionalCharges(currentCharges);
    }
  }, [isFocused, order?.commandStatus]);



  // Realtime status listener for this order
  useEffect(() => {
    if (!order?.requestId) return;

    const excludedStatuses = ["Canceled_by_partner", "Completed", "Canceled_by_client","Canceled_by_admin"];
    if (excludedStatuses.includes(order.commandStatus)) {
      return;
    }

    const orderStatusRef = dbRef(db, `rideRequests/${order.requestId}/commandStatus`);
    const unsubscribe = onValue(orderStatusRef, async (snapshot) => {
      const status = snapshot.val();
      // Refresh order data to stay in sync
      fetchOrder();

      if (["Canceled_by_partner", "Completed"].includes(status)) {
         

        if (order.commandStatus === "Completed") {
          trackRideCompleted(id, {
            driver_id: order?.driver?.id,
            request_id: order.requestId,
          });
          // Only auto-open rating if there is no review yet
          if (!order?.review && !hasAutoOpenedRating.current&&order.commandStatus === "Completed") {
            hasAutoOpenedRating.current = true;
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'Rating',
                    params: { order },
                  },
                ],
              })
            );
          }
        }
       
      }
    });

    return () => {
      off(orderStatusRef, 'value', unsubscribe);
    };
  }, [order?.requestId, order?.commandStatus]);

  // Auto-open Rating screen if this screen is opened with an already completed order without review
  useEffect(() => {
    if (!order) return;
    if (!isFocused) return;
    if (hasAutoOpenedRating.current) return;
    if (order?.commandStatus === 'Completed' && !order?.review) {
      hasAutoOpenedRating.current = true;
      navigation.navigate('Rating', { order });
    }
  }, [order?.commandStatus, order?.review, isFocused]);

  // Cleanup any active driver listener, danger listener and background timer on unmount
  useEffect(() => {
    return () => {
      const current = driverListenerRef.current;
      if (current?.ref && current?.unsubscribe) {
        try { off(current.ref, 'value', current.unsubscribe); } catch (e) {}
        driverListenerRef.current = { ref: null, unsubscribe: null };
      }
      
      const dangerCurrent = dangerListenerRef.current;
      if (dangerCurrent?.ref && dangerCurrent?.unsubscribe) {
        try { off(dangerCurrent.ref, 'value', dangerCurrent.unsubscribe); } catch (e) {}
        dangerListenerRef.current = { ref: null, unsubscribe: null };
      }
      
      // Clean up background timer
      if (timerRef.current) {
        BackgroundTimer.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (backgroundTimerStarted.current) {
        backgroundTimerStarted.current = false;
      }
    };
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`commands/${id}?populate[0]=driver&populate[1]=pickUpAddress&populate[2]=dropOfAddress&populate[3]=pickUpAddress.coordonne&populate[4]=dropOfAddress.coordonne&populate[5]=driver.profilePicture&populate[6]=review&populate[7]=driver.vehicule`);
      const orderData = response.data.data;
      setOrder(orderData);
      
      // Check if danger field is true from API response
      if (orderData?.danger === true) {
        setIsDangerMode(true);
      }

      // Setup live driver location listener here (tied to freshly fetched order)
      // First, detach previous listener if any
      if (driverListenerRef.current?.ref && driverListenerRef.current?.unsubscribe) {
        try { off(driverListenerRef.current.ref, 'value', driverListenerRef.current.unsubscribe); } catch (e) {}
        driverListenerRef.current = { ref: null, unsubscribe: null };
      }

      // Determine if we can track for this fetched order
      const excluded = new Set(["Canceled_by_admin","Canceled_by_client", "Canceled_by_partner", "Completed"]);
      const localCanTrack = !excluded.has(orderData?.commandStatus);
      const driverDocId = orderData?.driver?.documentId;

      if (!localCanTrack || !driverDocId) {
        setDriverPosition(null);
        setDriverIsMoving(false);
        return;
      }

      try {
        // Optional debug
        console.log('driverDocId', driverDocId);
      } catch {}

      const driverRef = dbRef(db, `drivers/${driverDocId}`);
      const unsubscribe = onValue(driverRef, (snapshot) => {
        const data = snapshot.val();
        if (data?.latitude && data?.longitude) {
          setDriverPosition({
            latitude: data.latitude,
            longitude: data.longitude,
            angle: data.angle || 0,
            type: data.type || 1,
            speed: data.speed || 0,
          });
          setDriverIsMoving((data?.speed || 0) > 0.5);
        }
      });
      driverListenerRef.current = { ref: driverRef, unsubscribe };
      
      // Setup danger listener for this request
      if (orderData?.requestId) {
        // First, detach previous danger listener if any
        if (dangerListenerRef.current?.ref && dangerListenerRef.current?.unsubscribe) {
          try { off(dangerListenerRef.current.ref, 'value', dangerListenerRef.current.unsubscribe); } catch (e) {}
          dangerListenerRef.current = { ref: null, unsubscribe: null };
        }
        
        const dangerRef = dbRef(db, `rideRequests/${orderData.requestId}/danger`);
        const dangerUnsubscribe = onValue(dangerRef, (snapshot) => {
          const dangerValue = snapshot.val();
          setIsDangerMode(dangerValue === true);
        });
        dangerListenerRef.current = { ref: dangerRef, unsubscribe: dangerUnsubscribe };
      }
    } catch (error) {
      console.log('Error fetching order:', error);
      Alert.alert('Error', 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    
      fetchOrder();
 
  }, [id]);

  // Fetch charging parameters once
  useEffect(() => {
    const loadParams = async () => {
      try {
        const res = await api.get(`parameters`);
        setChargeParams(res.data.data[0]);
      } catch (e) {
        // silently ignore; we will fallback to zero charges
      }
    };
    loadParams();
  }, []);

  // Helper to format waiting time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate waiting time and charges based on elapsed time
  const calculateTimeAndCharges = () => {
    if (!order || order?.commandStatus !== 'Arrived_at_pickup' || !chargeParams) {
      return { waitingTime: 0, charges: 0 };
    }

    const startChargeAfterTimeInSeconds = Number(chargeParams?.START_CHARGE_AFTERT_TIME || 0) * 60;
    const gracePeriodInSeconds = Number(chargeParams?.WAITING_TIME_GRACE_PERIOD || 0) * 60;
    const unitCharge = Number(chargeParams?.WAITING_TIME_CHARGE || 0);

    // Determine baseline timestamp
    const baselineIso = order?.lastChargeTime || order?.updatedAt || order?.createdAt;
    const baselineMs = baselineIso ? new Date(baselineIso).getTime() : Date.now();

    const currentElapsed = Math.floor((Date.now() - baselineMs) / 1000);

    let charges = 0;
    if (currentElapsed > startChargeAfterTimeInSeconds && gracePeriodInSeconds > 0) {
      const elapsedGracePeriods = Math.floor((currentElapsed - startChargeAfterTimeInSeconds) / gracePeriodInSeconds);
      charges = elapsedGracePeriods * unitCharge;
    }

    return { waitingTime: currentElapsed, charges };
  };

  // Background timer that recalculates from baseline time
  useEffect(() => {
    // Clear any existing timer when status changes
    if (timerRef.current) {
      BackgroundTimer.clearInterval(timerRef.current);
      timerRef.current = null;
      backgroundTimerStarted.current = false;
    }

    if (order?.commandStatus !== 'Arrived_at_pickup') {
      setWaitingTime(0);
      setAdditionalCharges(0);
      timerStartTime.current = null;
      return;
    }

    // Load parameters first
    const startTimer = async () => {
      try {
        let params = chargeParams;
        if (!params) {
          const res = await api.get(`parameters`);
          params = res.data.data[0];
          setChargeParams(params);
        }

        // Set initial values
        const { waitingTime: initialTime, charges: initialCharges } = calculateTimeAndCharges();
        setWaitingTime(initialTime);
        setAdditionalCharges(initialCharges);
        timerStartTime.current = Date.now();

        // Start background timer that recalculates from baseline
        if (!backgroundTimerStarted.current) {
          backgroundTimerStarted.current = true;
          
          timerRef.current = BackgroundTimer.setInterval(() => {
            const { waitingTime: currentTime, charges: currentCharges } = calculateTimeAndCharges();
            setWaitingTime(currentTime);
            setAdditionalCharges(currentCharges);
          }, 1000);
        }
      } catch (e) {
        console.warn('Timer setup error:', e);
      }
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        BackgroundTimer.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (backgroundTimerStarted.current) {
        backgroundTimerStarted.current = false;
      }
      timerStartTime.current = null;
    };
  }, [order?.commandStatus, order?.lastChargeTime, order?.updatedAt, chargeParams]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': '#FFA500',
      'Assigned_to_driver': '#007AFF',
      'Driver_on_route_to_pickup': '#007AFF',
      'Arrived_at_pickup': '#FF9500',
      'Picked_up': '#34C759',
      'On_route_to_delivery': '#34C759',
      'Arrived_at_delivery': '#FF9500',
      'Completed': '#34C759',
      'Canceled_by_client': '#FF3B30',
      'Canceled_by_partner': '#FF3B30',
      'Canceled_by_admin': '#FF3B30',
    };
    return statusColors[status] || '#666';
  };

  const getStatusText = (status) => {
    return t(`order.status.${status.toLowerCase()}`, status.replace(/_/g, ' '));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price) => {
    // If danger mode is active, show 0.00
    if (isDangerMode) {
      return '0.00 TND';
    }
    return `${price?.toFixed(2) || '0.00'} TND`;
  };

  const handleTrackOrder = () => {
    navigation.navigate('TrackingScreen', { id });
  };

  const handleContactSupport = () => {
    setShowReportProblem(true);
  };

  const handleCallDriver = () => {
    const raw = (driverPhone || '').toString().trim();
    if (!raw) {
      Alert.alert(t('common.error'), t('order.driver_phone_unavailable'));
      return;
    }
    const cleaned = raw.startsWith('+')
      ? `+${raw.replace(/[^0-9]/g, '')}`
      : raw.replace(/\D/g, '');
    const url = `tel:${cleaned}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('order.unable_to_open_dialer'));
    });
  };

  const handleSmsDriver = () => {
    const raw = (driverPhone || '').toString().trim();
    if (!raw) {
      Alert.alert(t('common.error'), t('order.driver_phone_unavailable'));
      return;
    }
    const cleaned = raw.startsWith('+')
      ? `+${raw.replace(/[^0-9]/g, '')}`
      : raw.replace(/\D/g, '');
    const url = `sms:${cleaned}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('order.unable_to_open_sms'));
    });
  };

  // Fit map to coordinates when map is ready and required coords are available
  // Placed before early return to keep hook order stable across renders
  useEffect(() => {
    if (!mapRef.current) return;
    if (!order) return;
    const pickup = order?.pickUpAddress?.coordonne;
    const dropoff = order?.dropOfAddress?.coordonne;
    if (!pickup || !dropoff) return;

    const status = order?.commandStatus;
    const toPickupStatuses = new Set([
      'Pending',
      'Assigned_to_driver',
      'Driver_on_route_to_pickup',
      'Go_to_pickup',
      'Arrived_at_pickup',
    ]);
    const toDropoffStatuses = new Set([
      'Picked_up',
      'On_route_to_delivery',
      'Arrived_at_delivery',
    ]);

    let origin = pickup;
    let destination = dropoff;
    if (toPickupStatuses.has(status)) {
      origin = (driverPosition?.latitude && driverPosition?.longitude) ? driverPosition : pickup;
      destination = pickup;
    } else if (toDropoffStatuses.has(status)) {
      origin = (driverPosition?.latitude && driverPosition?.longitude) ? driverPosition : pickup;
      destination = dropoff;
    }

    const coords = [];
    if (origin?.latitude && origin?.longitude) {
      coords.push({ latitude: origin.latitude, longitude: origin.longitude });
    }
    if (destination?.latitude && destination?.longitude) {
      coords.push({ latitude: destination.latitude, longitude: destination.longitude });
    }
    if (driverPosition?.latitude && driverPosition?.longitude) {
      coords.push({ latitude: driverPosition.latitude, longitude: driverPosition.longitude });
    }

  
    if (coords.length >= 2) {
      try {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        });
      } catch (e) {}
    }
  }, [
    mapRef,
    order,
    
    driverPosition,
    driverPosition,
  ]);

  const handleAlertClose = () => {
    setShowCancelAlert(false);
    navigation.navigate('Home');
  };

  if (loading || !order) {
    return <OrderPlaceholder />;
  }

  const driver = order?.driver || {};
  const driverName = `${driver.firstName || ''} ${driver.lastName || ''}`.trim();
  const driverAvatar = driver?.profilePicture?.url || 'https://randomuser.me/api/portraits/men/1.jpg';
  const carModel = driver?.vehicule?.mark || 'N/A';
  const carPlate = driver?.vehicule?.matriculation || 'N/A';
  const driverRating = driver.rating || '5.0';
  const driverPhone = driver?.phoneNumber || driver?.phone || driver?.mobile || driver?.telephone || null;

  const canTrack = !["Canceled_by_admin","Canceled_by_client", "Canceled_by_partner", "Completed"].includes(order.commandStatus);
  const canCancel = ["Pending", "Arrived_at_pickup", "Go_to_pickup"].includes(order?.commandStatus);

  // Compute route endpoints based on status and driver position
  const getRouteEndpoints = () => {
    const pickup = order?.pickUpAddress?.coordonne;
    const dropoff = order?.dropOfAddress?.coordonne;
    const status = order?.commandStatus;
   
    if (!pickup || !dropoff) return { origin: pickup, destination: dropoff };
   
    const driverPos = canTrack ? driverPosition : null;

    const toPickupStatuses = new Set([
      'Pending',
      'Assigned_to_driver',
      'Driver_on_route_to_pickup',
      'Go_to_pickup',
      'Arrived_at_pickup',
    ]);

    const toDropoffStatuses = new Set([
      'Picked_up',
      'On_route_to_delivery',
      'Arrived_at_delivery',
    ]);

    if (toPickupStatuses.has(status)) {
      return {
        origin: driverPos || dropoff,
        destination: pickup,
      };
    }

    if (toDropoffStatuses.has(status)) {
      return {
        origin: driverPos || pickup,
        destination: dropoff,
      };
    }

    // Default: pickup to dropoff
    return { origin: pickup, destination: dropoff };
  };

  const { origin: routeOrigin, destination: routeDestination } = getRouteEndpoints();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }] }>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#18365A" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('order.title')}</Text>
          <Text style={styles.orderNumber}>#{order.id}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <MaterialCommunityIcons name="headset" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card - compact pill */}
        <View style={styles.statusCard}>
          <View style={styles.statusPill}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(order.commandStatus) }]} />
            <Text style={styles.statusTitle} numberOfLines={1}>
              {getStatusText(order.commandStatus)}
            </Text>
            <View style={styles.statusDotSep} />
            <MaterialCommunityIcons name="clock-outline" size={14} color="#999" />
            <Text style={styles.statusTimeCompact} numberOfLines={1}>
              {formatDate(order.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Embedded Map with Route Directions (replaces Track button) */}
        {(!["Canceled_by_admin","Canceled_by_client", "Canceled_by_partner", "Completed"].includes(order.commandStatus)) && (
          !!order?.pickUpAddress?.coordonne && !!order?.dropOfAddress?.coordonne ? (
            <View style={styles.mapCard}>
              <MapView
                ref={mapRef}
                style={styles.orderMap}
                provider={PROVIDER_GOOGLE}
                showsCompass
                zoomEnabled
                scrollEnabled
                pitchEnabled
                rotateEnabled
              >
                <MapViewDirections
                  origin={routeOrigin ? { latitude: routeOrigin.latitude, longitude: routeOrigin.longitude } : undefined}
                  destination={routeDestination ? { latitude: routeDestination.latitude, longitude: routeDestination.longitude } : undefined}
                  apikey={API_GOOGLE}
                  strokeWidth={4}
                  strokeColor={colors.primary}
                  mode="DRIVING"
                  onReady={(result) => {
                    // Prefer the route polyline, but include driver position if available to ensure visibility
                    const coords = Array.isArray(result?.coordinates) ? [...result.coordinates] : [];
                    if (driverPosition?.latitude && driverPosition?.longitude) {
                      coords.push({ latitude: driverPosition.latitude, longitude: driverPosition.longitude });
                    }
                    if (coords.length) {
                      try {
                        mapRef.current?.fitToCoordinates(coords, {
                          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                          animated: true,
                        });
                      } catch {}
                    }
                  }}
                  onError={(e) => {
                    console.warn('Map directions error on Order screen:', e);
                  }}
                />

                {/* Pickup Marker */}
                <Marker
                  identifier="pickupMarker"
                  coordinate={{
                    latitude: order.pickUpAddress.coordonne.latitude,
                    longitude: order.pickUpAddress.coordonne.longitude,
                  }}
                >
                  <View style={[styles.locationMarker]}>
                    <MaterialCommunityIcons name="map-marker" size={28} color={colors.primary} />
                  </View>
                </Marker>

                {/* Dropoff Marker */}
                <Marker
                  identifier="dropoffMarker"
                  coordinate={{
                    latitude: order.dropOfAddress.coordonne.latitude,
                    longitude: order.dropOfAddress.coordonne.longitude,
                  }}
                >
                  <View style={[styles.locationMarker]}>
                    <MaterialCommunityIcons name="flag-checkered" size={26} color="#18365A" />
                  </View>
                </Marker>

                {/* Driver Live Location Marker (only when canTrack) */}
                {canTrack && !!driverPosition && (
                  <Marker
                    identifier="driverMarker"
                    coordinate={{
                      latitude: driverPosition.latitude,
                      longitude: driverPosition.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                    flat
                  >
                    <DriverMarker
                      angle={driverPosition.angle || 0}
                      type={driverPosition.type || 1}
                      isMoving={driverIsMoving}
                      is3D={false}
                    />
                  </Marker>
                )}
              </MapView>
              {/* Tap overlay to open full tracking */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleTrackOrder}
                style={styles.mapOverlay}
                accessibilityRole="button"
                accessibilityLabel={t('order.track_order')}
              />
            </View>
          ) : null
        )}

        {/* Rating Button (Completed without review) */}
        {order?.commandStatus === 'Completed' && !order?.review && (
          <TouchableOpacity
            style={[styles.trackButton, { backgroundColor: colors.primary, marginTop: 12 }]}
            onPress={() => navigation.navigate('Rating', { order })}
          >
            <MaterialCommunityIcons name="star" size={22} color="#fff" />
            <Text style={styles.trackButtonText}>{t('history.card.rate_trip')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Cancel Ride Button moved to bottom */}

        {/* Unified Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('order.details')}</Text>

          {/* Driver Information */}
          {driverName && (
            <>
              <Text style={styles.sectionTitle}>{t('order.driver_info')}</Text>
              <View style={styles.driverContainer}>
                <Image source={{ uri: driverAvatar }} style={styles.driverAvatar} />
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{driverName}</Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.rating}>{driverRating}</Text>
                  </View>
                  <View style={styles.vehicleContainer}>
                    <MaterialCommunityIcons name="car" size={16} color="#666" />
                    <Text style={styles.vehicleText}>{carModel} • {carPlate}</Text>
                  </View>
                </View>
              </View>
              {canTrack && (
                <View style={styles.driverActionsContainer}>
                   <ChatButton 
                      onPress={() => setIsChatVisible(true)}
                      
                    />
                  <TouchableOpacity 
                    style={styles.callButton}
                    onPress={handleCallDriver}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>{t('order.call')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <View style={styles.paymentDivider} />

          {/* Trip Details */}
          <Text style={styles.sectionTitle}>{t('order.trip_details')}</Text>
          {/* Pickup Location */}
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <View style={styles.pickupDot} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>{t('order.pickup_location')}</Text>
              <Text style={styles.locationAddress}>
                {order.pickUpAddress?.Address || t('order.address_not_available')}
              </Text>
              <Text style={styles.locationTime}>
                {formatDate(order.createdAt)}
              </Text>
            </View>
          </View>
          {/* Route Line */}
          <View style={styles.routeLine} />
          {/* Dropoff Location */}
          <View style={styles.locationContainer}>
            <View style={styles.locationIcon}>
              <View style={styles.dropoffDot} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>{t('order.dropoff_location')}</Text>
              <Text style={styles.locationAddress}>
                {order.dropOfAddress?.Address || t('order.address_not_available')}
              </Text>
              {order.commandStatus === 'Completed' && (
                <Text style={styles.locationTime}>
                  {formatDate(order.updatedAt)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.paymentDivider} />

          {/* Payment Details */}
          <View style={styles.paymentSectionHeader}>
            <View style={styles.paymentIconWrap}>
              <MaterialCommunityIcons name="wallet" size={20} color={colors.primary} />
            </View>
            <View style={styles.paymentHeaderTexts}>
              <Text style={styles.paymentHeaderTitle}>{t('order.payment_details')}</Text>
              <Text style={styles.paymentHeaderHint}>{t('common.summary')}</Text>
            </View>
          </View>
          {order.commandStatus === 'Arrived_at_pickup' && (
            <View style={styles.chipContainer}>
              <View style={styles.chip}>
                <View style={{flexDirection:"row",alignItems:"center",gap:6 }}>
                <MaterialCommunityIcons name="timer-outline" size={14} color={colors.primary} />
                <Text style={styles.chipText}>{t('ride.waiting_time')}:</Text>
             
                </View>
                <Text style={[styles.chipText,{color:"red"}]}>{formatTime(waitingTime)}</Text>
              </View>
            </View>
          )}
           

          <View style={styles.amountRow}>
            <View style={styles.leftSide}>
              <MaterialCommunityIcons name="wallet-outline" size={18} color="#666" style={styles.rowIcon} />
              <Text style={styles.paymentLabel}>{t('order.base_fare')}</Text>
            </View>
            <Text style={styles.paymentValue}>{formatPrice(isDangerMode ? 0 : order.totalPrice)}</Text>
          </View>
          {(additionalCharges > 0 && !isDangerMode) && (
            <View>
              <View style={styles.amountRow}>
                <View style={styles.leftSide}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#666" style={styles.rowIcon} />
                  <Text style={styles.paymentLabel}>{t('ride.additional_charges')}</Text>
                </View>
                <Text style={styles.paymentValue}>{formatPrice(additionalCharges)}</Text>
              </View>
              <Text style={styles.extraHint}>{t('ride.waiting_time')}</Text>
            </View>
          )}

          <View style={styles.paymentDivider} />
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t('order.total_amount')}</Text>
            <Text style={styles.totalValue}>
              {formatPrice(isDangerMode ? 0 : (order.totalPrice || 0) + (additionalCharges || 0))}
            </Text>
          </View>
          {/* <View style={styles.methodPill}>
            <MaterialCommunityIcons name="cash" size={18} color="#1F7A1F" />
            <Text style={styles.methodPillText}>{t('order.payment_method_cash')}</Text>
          </View> */}

          <View style={styles.paymentDivider} />

          {/* Order Information */}
          <Text style={styles.sectionTitle}>{t('order.order_info')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('order.order_id')}</Text>
            <Text style={styles.infoValue}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('order.order_date')}</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          {order.duration && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order.estimated_duration')}</Text>
              <Text style={styles.infoValue}>{order.duration}</Text>
            </View>
          )}
          {order.distance && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('order.distance')}</Text>
              <Text style={styles.infoValue}>{order.distance} m</Text>
            </View>
          )}
        </View>

        {/* Cancel Ride Button (moved to bottom) */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelRideButton}
            onPress={() => setShowCancelConfirm(true)}
          >
            <MaterialCommunityIcons name="close-circle-outline" size={22} color="#fff" />
            <Text style={styles.cancelRideButtonText}>{t('history.card.cancel_order')}</Text>
          </TouchableOpacity>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Report Problem Modal */}
      <OrderReportProblemModal
        visible={showReportProblem}
        onClose={() => setShowReportProblem(false)}
        order={{ ...order, documentId: order?.documentId || order?.id }}
      />
      
      {/* Cancellation Confirm Modal */}
      <OrderCancelConfirmationModal
        visible={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          setShowCancelReasonSheet(true);
        }}
      />

      {/* Cancellation Reason Sheet */}
      <OrderCancellationReasonSheet
        visible={showCancelReasonSheet}
        onClose={() => setShowCancelReasonSheet(false)}
        reasons={[
          'Driver is taking too long',
          'Driver is not moving / stuck',
          "Can't reach the driver",
          'Driver is going the wrong way',
          'Driver asked to cancel',
          'Fare is too high / changed',
          'I no longer need a ride',
          'Waited too long at pickup',
          'Wrong pickup location',
          "Don't feel safe",
          'Emergency situation',
          'Other',
        ]}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        onSubmit={() => {
          setShowCancelReasonSheet(false);
          setOtherReason('');
          fetchOrder();
        }}
        order={{ ...order, documentId: order?.documentId || order?.id }}
      />
      <CustomAlert
        visible={showCancelAlert}
        title={t('common.order_canceled_title')}
        message={t('common.order_canceled_message')}
        buttons={[{
          text: t('common.ok'),
          style: 'confirm',
          onPress: handleAlertClose,
        }]}
        type="error"
      />
      
      {/* Chat Modal */}
      <ChatModal
        visible={isChatVisible}
        onClose={() => setIsChatVisible(false)}
        requestId={order?.requestId}
        driverName={driverName}
        driverData={driver}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18365A',
  },
  orderNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign:"left"
  },
  supportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  statusCard: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginTop: 8,
    borderWidth: 0,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#18365A',
  },
  statusDotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    marginHorizontal: 8,
  },
  statusTimeCompact: {
    fontSize: 12,
    color: '#666',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
 
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 12,
  },
  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  orderMap: {
    width: '100%',
    height: 240,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  locationMarker: {
    padding: 6,
    borderRadius: 12,
   // borderWidth: 1,
   // borderColor: '#E5E5E5',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',

  },
  cancelRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  cancelRideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth:1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18365A',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    marginTop: 4,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18365A',
    marginBottom: 4,
    textAlign:"left"
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    backgroundColor: '#18365A',
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
    lineHeight: 20,
  },
  locationTime: {
    fontSize: 12,
    color: '#999',
  },
  routeLine: {
    width: 0,
    height: 20,
    backgroundColor: '#E5E5E5',
    marginLeft: 11,
    marginVertical: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentLabel: {
    fontSize: 17,
    color: '#666',
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18365A',
  },
  paymentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EEFF',
  },
  paymentHeaderTexts: {
    flex: 1,
    marginHorizontal: 12,
  },
  paymentHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  paymentHeaderHint: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6E9FF',
    gap: 6,
    width:"100%",
    justifyContent:"space-between",
    
  },
  chipContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chipText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18365A',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFF',
    borderWidth: 1,
    borderColor: '#E6EEFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 8,
  },
  methodPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E9F7EF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CDEED9',
    marginTop: 8,
    gap: 8,
  },
  methodPillText: {
    fontSize: 15,
    color: '#1F7A1F',
    fontWeight: '600',
  },
  policyText: {
    fontSize: 13,
    color: '#55637A',
    marginTop: 4,
    marginBottom: 8,
  },
  extraHint: {
    fontSize: 12,
    color: '#8A95A6',
    marginTop: -6,
    marginBottom: 6,
    marginLeft: 26,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  bottomSpacing: {
    height: 32,
  },
  driverActionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  chatButtonWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  chatButtonCustom: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default Order;
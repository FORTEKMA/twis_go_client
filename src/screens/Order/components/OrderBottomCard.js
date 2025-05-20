import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, Modal, TextInput, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';
import OrderCancelConfirmationModal from './OrderCancelConfirmationModal';
import OrderCancellationReasonSheet from './OrderCancellationReasonSheet';
import OrderReportProblemModal from './OrderReportProblemModal';
import { useNavigation } from '@react-navigation/native';
import api from '../../../utils/api';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_HEIGHT = Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.45 : SCREEN_HEIGHT * 0.47;

const STATUS_COLORS = {
  Driver_on_route_to_pickup: '#3498db',
  Arrived_at_pickup: '#2ecc71',
  Picked_up: '#f1c40f',
  On_route_to_delivery: '#3498db',
  Arrived_at_delivery: '#2ecc71',
  Delivered: '#27ae60',
  Completed: '#27ae60',
  default: '#E74C3C',
};

const OrderBottomCard = ({ order, onCallDriver, refresh }) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReasonSheet, setShowReasonSheet] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [otherReason, setOtherReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
    const [waitingTime, setWaitingTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState(order?.additionalCharges || 0);
  const [lastChargeTime, setLastChargeTime] = useState(0);
  const [params, setParams] = useState({});
  const timerRef = useRef(null);
  const navigation = useNavigation();
  const cancellationReasons = [
    'Driver is taking too long',
    'Driver is not moving / stuck',
    'Can\'t reach the driver',
    'Driver is going the wrong way',
    'Driver asked to cancel',
    'Fare is too high / changed',
    'I no longer need a ride',
    'Waited too long at pickup',
    'Wrong pickup location',
    'Don\'t feel safe',
    'Emergency situation',
    'Other'
  ];

  // Memoized values
  const status = order?.commandStatus || 'Driver_on_route_to_pickup';
  console.log("status",status)
  const statusColor = useMemo(() => STATUS_COLORS[status] || STATUS_COLORS.default, [status]);
  const statusText = useMemo(() =>  t(`history.status.${status.toLowerCase()}`), [status, t]);

  // Driver info
  const driver = order?.driver || {};
 
  const driverName = useMemo(() => `${driver.firstName || ''} ${driver.lastName || ''}`.trim(), [driver.firstName, driver.lastName]);
  const driverAvatar = driver?.profilePicture?.url || 'https://randomuser.me/api/portraits/men/1.jpg';
  const carModel = driver?.vehicule?.mark || 'Toyota Camry';
  const carPlate = driver?.vehicule?.matriculation || 'DEF 456';
  const driverRating = driver.rating || '5.0';

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handleCancelPress = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
    setShowReasonSheet(true);
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'Other') {
      handleSubmitCancellation(reason);
    }
  };

  const handleSubmitCancellation = (reason) => {
    
    setShowReasonSheet(false);
    setSelectedReason(null);
    setOtherReason('');
    navigation.goBack();
    if(refresh){
      refresh();
    }

  };

  useEffect(() => {
    if(order?.commandStatus == "Arrived_at_pickup"){
      const getParams = async () => {
        const paramsRes = await api.get(`parameters`);
        setParams(paramsRes.data.data[0]);
        setTimeout(() => {
          startTimer();
        }, 30);
      }
      getParams();
     
    }else{
      if(isTimerRunning){
        stopTimer();
      }
    }
  }, [order?.commandStatus]);

  const startTimer = () => {
    setIsTimerRunning(true);
    setLastChargeTime(0); // lastChargeTime is in seconds
    timerRef.current = setInterval(() => {
      setWaitingTime((prevTime) => {
        const newTime = prevTime + 1; // newTime is in seconds

        const startChargeAfterTimeInSeconds =
          params.START_CHARGE_AFTERT_TIME * 60;
        const gracePeriodInSeconds = params.WAITING_TIME_GRACE_PERIOD * 60;

        if (newTime > startChargeAfterTimeInSeconds) {
          const timeSinceLastCharge = newTime - lastChargeTime;
         
          if (timeSinceLastCharge % gracePeriodInSeconds == 0) {
            setAdditionalCharges((prev) => prev + params.WAITING_TIME_CHARGE);
            setLastChargeTime(newTime); // update last charge time
          }
        }

        return newTime;
      });
    }, 1000);
  };


  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

 

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.handleContainer}>
          <View style={styles.handleBar} />
        </View>
        
        <View style={styles.statusBanner}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <View style={styles.driverSection}>
          <View style={styles.driverRow}>
            <Image source={{ uri: driverAvatar }} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{driverName}</Text>
                {!["Canceled_by_client", "Canceled_by_driver", "Completed"].includes(order?.commandStatus) && (
                  <TouchableOpacity 
                    style={styles.callButtonCircle}
                    onPress={onCallDriver}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <Text style={styles.rating}>{driverRating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.carSection}>
            <View style={styles.carInfoRow}>
              <View style={styles.carInfoItem}>
                <Ionicons name="car" size={20} color="#666" />
                <Text style={styles.carInfoText}>{carModel}</Text>
              </View>
              <View style={styles.carInfoDivider} />
              <View style={styles.carInfoItem}>
                <Ionicons name="card" size={20} color="#666" />
                <Text style={styles.carInfoText}>{carPlate}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressLine} />
          <View style={styles.addressRow}>
            <View style={styles.dotBlack} />
            <Text style={styles.addressText}>{order?.pickUpAddress?.Address || ''}</Text>
          </View>
          <View style={styles.addressRow}>
            <View style={styles.dotBlue} />
            <Text style={[styles.addressText, { color: colors.primary }]}>{order?.dropOfAddress?.Address || ''}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('ride.base_price')}:</Text>
            <Text style={styles.priceValue}>{parseFloat(order?.totalPrice || 0).toFixed(2)} DT</Text>
          </View>
          {additionalCharges > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('ride.additional_charges')}:</Text>
              <Text style={styles.priceValue}>{parseFloat(additionalCharges).toFixed(2)} DT</Text>
            </View>
          )}
          <View style={styles.totalPriceRow}>
            <Text style={styles.totalPriceLabel}>{t('ride.total_price')}:</Text>
            <Text style={styles.totalPriceValue}>
              {parseFloat((order?.totalPrice || 0) + additionalCharges).toFixed(2)} DT
            </Text>
          </View>
        </View>

        {order?.commandStatus == "Arrived_at_pickup" && (<View style={styles.timerContainer}>
                      <Text style={styles.timerLabel}>
                        {t("ride.waiting_time")}:
                      </Text>
                      <Text style={styles.timerText}>
                        {formatTime(waitingTime)}
                      </Text>
                      {additionalCharges > 0 && (
                        <Text style={styles.additionalCharges}>
                          {t("ride.additional_charges")}:{" "}
                          {parseFloat(additionalCharges).toFixed(2)}{" "}
                          {"DT"}
                        </Text>
                      )}
                      <View style={styles.chargingInfoContainer}>
                        <Text style={styles.chargingInfoText}>
                          {t(
                            "ride.charging_info",
                            {
                              time: params.START_CHARGE_AFTERT_TIME,
                            }
                          )}
                        </Text>
                        <Text style={styles.chargingInfoText}>
                          {t(
                            "ride.charging_period",
                            {
                              charge: params.WAITING_TIME_CHARGE,
                              period: params.WAITING_TIME_GRACE_PERIOD,
                            }
                          )}
                        </Text>
                      </View>
                    </View>)}

        {order?.commandStatus === "Completed" && (<View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:10,flex:1,width:"100%"}}>
     
          <TouchableOpacity 
            style={styles.reportButton}
            onPress={() => setShowReportModal(true)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.reportButtonText}>{t('history.card.report_problem')}</Text>
          </TouchableOpacity>
    

 
            <TouchableOpacity 
              style={[styles.submitReportButton, styles.rateButton]}
              onPress={()=>  navigation.navigate('Rating', { order })}
            >
              <Text style={styles.submitReportButtonText}>{t('history.card.rate_trip')}</Text>
            </TouchableOpacity>
        
          </View>  )}

        {"Pending" ==order?.commandStatus && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.cancelButtonText}>{t('history.card.cancel_order')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <OrderCancelConfirmationModal
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmCancel}
      />

      <OrderCancellationReasonSheet
        visible={showReasonSheet}
        order={order}
        onClose={() => setShowReasonSheet(false)}
        reasons={cancellationReasons}
        selectedReason={selectedReason}
        onSelectReason={handleReasonSelect}
        otherReason={otherReason}
        setOtherReason={setOtherReason}
        onSubmit={handleSubmitCancellation}
      />

      <OrderReportProblemModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        order={order}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },
  additionalCharges: {
    fontSize: 14,
    color: "#ff4444",
    marginTop: 4,
    fontWeight: "500",
  },
  chargingInfoContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    width: "100%",
  },
  chargingInfoText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginVertical: 2,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  //  height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 24,
  },
  handleContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    width: '100%',
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  driverSection: {
    marginBottom: 20,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#222',
    flex: 1,
  },
  callButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5B4',
    alignSelf: 'flex-start',
  },
  rating: {
    marginLeft: 4,
    color: '#B8860B',
    fontWeight: '600',
    fontSize: 14,
  },
  carSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  carInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  carInfoText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 8,
    fontWeight: '500',
  },
  carInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  addressContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  addressLine: {
    position: 'absolute',
    left: 8,
    top: 4,
    bottom: 15,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 4,
  },
  dotBlack: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#222',
    marginRight: 12,
    zIndex: 1,
  },
  dotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: 12,
    zIndex: 1,
  },
  addressText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontWeight: '600',
    fontSize: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f8f9fa',
  },
  reportButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,

    flex:1,
  },
  reportButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reportModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  reportTextArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
    marginBottom: 20,
  },
  submitReportButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,

    flex:1,
  },
  submitReportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  priceContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  totalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalPriceLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
  },
  totalPriceValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default React.memo(OrderBottomCard); 
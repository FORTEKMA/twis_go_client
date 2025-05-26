import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { colors } from "../../../utils/colors";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';

export const Card = ({ order ,refresh}) => {
  const { t } = useTranslation();
  const scaleValue = new Animated.Value(1);
  const navigation = useNavigation();
  

  console.log("order",order)

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return colors.warning;
      case "dispatched_to_partner":
        return "#4A90E2"; // Blue
      case "assigned_to_driver":
        return "#9B59B6"; // Purple
      case "driver_on_route_to_pickup":
        return "#3498DB"; // Light Blue
      case "arrived_at_pickup":
        return "#2ECC71"; // Green
      case "picked_up":
        return "#27AE60"; // Dark Green
      case "on_route_to_delivery":
        return "#3498DB"; // Light Blue
      case "arrived_at_delivery":
        return "#2ECC71"; // Green
      case "delivered":
        return "#27AE60"; // Dark Green
      case "completed":
        return "#27AE60"; // Dark Green
      case "canceled_by_client":
      case "canceled_by_partner":
        return "red"; // Red
      case "failed_pickup":
      case "failed_delivery":
        return "#C0392B"; // Dark Red
      case "go_to_pickup":
        return "#F1C40F"; // Yellow
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "time-outline";
      case "dispatched_to_partner":
        return "send-outline";
      case "assigned_to_driver":
        return "person-outline";
      case "driver_on_route_to_pickup":
        return "car-outline";
      case "arrived_at_pickup":
        return "location-outline";
      case "picked_up":
        return "cube-outline";
      case "on_route_to_delivery":
        return "car-outline";
      case "arrived_at_delivery":
        return "location-outline";
      case "delivered":
        return "checkmark-done-circle-outline";
      case "completed":
        return "checkmark-circle-outline";
      case "canceled_by_client":
        return "close-circle-outline";
      case "canceled_by_partner":
        return "close-circle-outline";
      case "failed_pickup":
        return "alert-circle-outline";
      case "failed_delivery":
        return "alert-circle-outline";
      case "go_to_pickup":
        return "navigate-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getStatusTranslation = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return t('history.status.pending');
      case "dispatched_to_partner":
        return t('history.status.dispatched_to_partner');
      case "assigned_to_driver":
        return t('history.status.assigned_to_driver');
      case "driver_on_route_to_pickup":
        return t('history.status.driver_on_route_to_pickup');
      case "arrived_at_pickup":
        return t('history.status.arrived_at_pickup');
      case "picked_up":
        return t('history.status.picked_up');
      case "on_route_to_delivery":
        return t('history.status.on_route_to_delivery');
      case "arrived_at_delivery":
        return t('history.status.arrived_at_delivery');
      case "delivered":
        return t('history.status.delivered');
      case "completed":
        return t('history.status.completed');
      case "canceled_by_client":
        return t('history.status.canceled_by_client');
      case "canceled_by_partner":
        return t('history.status.canceled_by_partner');
      case "failed_pickup":
        return t('history.status.failed_pickup');
      case "failed_delivery":
        return t('history.status.failed_delivery');
      case "go_to_pickup":
        return t('history.status.go_to_pickup');
      default:
        return t('history.status.unknown');
    }
  };
 
  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetails", { id: order.documentId,refresh })}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <Ionicons name="receipt-outline" size={hp(2.5)} color={colors.primary} />
            <Text style={styles.title}>#{order.refNumber}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.commandStatus) }]}>
            <Ionicons 
              name={getStatusIcon(order.commandStatus)} 
              size={hp(1.8)} 
              color={"#fff"} 
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{getStatusTranslation(order.commandStatus)}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={hp(2)} color={colors.primary} />
            <Text style={styles.label}>
              {order?.driver?.firstName} {order?.driver?.lastName}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={hp(2)} color={colors.primary} />
            <Text style={styles.label} numberOfLines={1}>
              {order?.dropOfAddress?.Address?.replace(/"/g, '')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={hp(2)} color={colors.primary} />
            <Text style={styles.label}>
              {t(order.payType)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={hp(1.8)} color={colors.primary} />
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: hp(2),
    padding: hp(2.5),
    marginVertical: hp(1),
    marginHorizontal: hp(2),
    borderWidth: 3,
    borderColor: "#ccc",
   
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: hp(1.5),
    gap: wp(1),
    width:100
  },
  statusIcon: {
    marginRight: wp(1),
  },
  statusText: {
    fontSize: hp(1.5),
    color: "#fff",
    textTransform: "capitalize",
    fontWeight: "600",
    maxWidth: wp(40),
  },
  body: {
    gap: hp(1.5),
    backgroundColor: colors.lightPrimary + '10',
    padding: hp(1.5),
    borderRadius: hp(1),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  label: {
    fontSize: hp(1.7),
    color: colors.darkGray,
    flex: 1,
  },
  footer: {
    borderTopWidth:3,
    borderTopColor: "#ccc",
   // marginTop: hp(1),
    paddingTop: hp(1.5),
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
  },
  date: {
    fontSize: hp(1.5),
    color: "#0c0c0c",
    fontWeight: "500",
  },
});
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { colors } from "../../../utils/colors";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';

export const Card = ({ order }) => {
  const { t } = useTranslation();
  const scaleValue = new Animated.Value(1);
  const navigation = useNavigation();
  
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
    switch (status?.toLowerCase()) {
      case "pending":
        return colors.warning;
      case "accepted":
        return colors.success;
      case "cancelled":
        return colors.danger;
      default:
        return colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "time-outline";
      case "accepted":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };
 
  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("OrderDetails", { id: order.documentId })}
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
            <Text style={styles.statusText}>{t(`history.status.${order.commandStatus.toLowerCase()}`)}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={hp(2)} color={colors.primary} />
            <Text style={styles.label}>
              {order?.client?.firstName} {order?.client?.lastName}
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
              {order.payType}
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
    borderWidth: 1,
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
    paddingHorizontal: wp(3),
    borderRadius: hp(1.5),
    gap: wp(1),
  },
  statusIcon: {
    marginRight: wp(1),
  },
  statusText: {
    fontSize: hp(1.5),
    color: "#fff",
    textTransform: "capitalize",
    fontWeight: "600",
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
    borderTopWidth: 1,
    borderTopColor: colors.lightPrimary,
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
    color: colors.gray,
    fontWeight: "500",
  },
});
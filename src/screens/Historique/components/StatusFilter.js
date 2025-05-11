import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { colors } from "../../../utils/colors";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";

export const StatusFilter = ({ setStatusFilter, statusFilter }) => {
  const { t } = useTranslation();
  
  const filters = [
    { label: t("history.status_filter.all"), value: null },
    { label: t("history.status_filter.active"), value: "active" },
    { label: t("history.status_filter.completed"), value: "completed" },
    { label: t("history.status_filter.cancelled"), value: "cancelled" },
  ];

  return (
    <View style={{  marginTop: hp(2), width: wp("90%"), }}>
     
      <View
        style={{
          flexDirection: "row",
           justifyContent: "space-between",
          gap: wp(2),
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setStatusFilter(filter.value)}
            style={{
              paddingHorizontal: wp(4),
              paddingVertical: hp(1.2),
              borderRadius: hp(2),
              backgroundColor:statusFilter === filter.value ? colors.primary : colors.gray,
             
              borderWidth: 1,
              borderColor: "#ccc",
            }}
          >
            <Text
              style={{
                color: statusFilter === filter.value ? "#fff" : "#000",
                fontSize: hp(1.6),
                fontWeight: statusFilter === filter.value ? "600" : "400",
              }}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}; 
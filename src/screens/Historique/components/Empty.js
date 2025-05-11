import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../utils/colors";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

export const Empty = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No orders found</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(5),
  },
  text: {
    fontSize: hp(2),
    color: colors.gray,
    textAlign: "center",
  },
}); 
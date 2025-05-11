import { StyleSheet, Platform } from "react-native";
import { colors } from "../../utils/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  clickableText: {
    color: colors.secondary,
    fontSize: hp(1.5),
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: hp(1),
   backgroundColor: "#fff",
   // position: "relative",
    paddingTop: Platform.OS === "ios" ? 50 : 0,
  },
  inputContainer: {
    marginTop: 20,
    width: wp("90%"),
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    height: hp(6),
    borderRadius: 11,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  headerContainer: 
    {width:'100%',alignItems:'flex-start',padding:wp(5),borderBottomWidth:1,borderBottomColor:"#ccc"},
  headerText: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#000",
    
  },
  
}); 
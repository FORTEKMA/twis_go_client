import { StyleSheet } from 'react-native';
import { colors } from "../../utils/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
 
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    height:"59%"
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    width: wp("80%"),
    flex: 0.27,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: hp(1.5),
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalHead: {
    flex: 0.7,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 15,
  },
  modalBottom: {
    width: "100%",
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: 0,
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.84,
    elevation: 5,
    gap: 15,
  },
  paymentIcon: {
    width: 24,
    height: 24,
  },
  paymentText: {
    color: "black",
    fontSize: 16,
  },
  paymentType: {
    color: "black",
    fontWeight: "500",
    fontSize: 18,
  },
  paymentAmount: {
    color: colors.secondary,
    fontWeight: "600",
    fontSize: 18,
  },
  itemsContainer: {
    padding: 15,
  },
  driverInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    gap: 10,
    marginBottom: 10,
    marginTop: 10,
    padding: 5,
  },
  driverInfoParent: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  profilePicture: {
    width: 42,
    height: 42,
    borderRadius: 35,
  },
  mape: {
    width: 130,
    height: 130,
    marginTop: 10,
  },
  driverDetails: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "60%",
  },
  driverName: {
    color: "black",
    textAlign: "left",
  },
  driverPhone: {
    color: "grey",
    textAlign: "left",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginTop: 5,
  },
  star: {
    marginHorizontal: 2,
  },
  phoneImage: {
    width: 30,
    height: 30,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  callout: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
  },
  calloutContainer: {
    padding: 5,
  },
  calloutText: {
    fontSize: 12,
  },
});

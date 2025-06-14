import { Dimensions, I18nManager, StyleSheet } from "react-native";
import { colors } from "../../utils/colors";
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    backgroundColor: "#fff",
  //  justifyContent: "center",
    
  },
  backButton: {
    marginHorizontal:28
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "left",
    marginTop: 20,
    color: "#0c0c0c",
  },
  input: {
    height: 64,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#F7F8F9",
    color: "#000",
    textAlign:I18nManager.isRTL?"right":"left"
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordContainer: {
    height: 64,
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#F7F8F9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passwordContainerError: {
    borderColor: "#FF3B30",
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    color: "#000",
    textAlign:I18nManager.isRTL?"right":"left"
  },
  forgotText: {
    textAlign: "right",
   // marginTop: 8,
  //  marginBottom: 24,
    color: "gray",
  },
  loginButton: {
    backgroundColor: "#0c0c0c",
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: "#0c0c0c80",
  },
  loginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  registerText: {
    color: colors.secondary,
    fontWeight: "bold",
  },

  //-----------------
  recoveryContainer: {
    width: width * 0.9,
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: height * 0.15,
    shadowColor: "#4d6685",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.84,
    elevation: 5,
    gap: 20,
  },
  recoveryImage: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: -20,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0c0c0c",
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#0c0c0c",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sentMessage: {
    color: "#0c0c0c",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  
});
export default styles;

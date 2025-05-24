import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Input } from "native-base";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "./styles";
import { forgetPassword, setEmailForgetPassword } from "../../../store/userSlice/userSlice";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const validEmail = () => {
    if (!email) {
      return "Email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      return "Veuillez saisir une adresse e-mail valide.";
    }
    return null;
  };
  const handleForgetPassword = async () => {
    const emailError = validEmail();
    if (!emailError) {
      setLoading(true);
      try {
        const res = await dispatch(forgetPassword(email));
        setSent(res?.ok); 
        dispatch(setEmailForgetPassword(email));
        // setEmail;
        navigation.navigate("ResetCodeScreen");
        setLoading(false);
        return true;
      } catch (error) {
        console.error("Password reset failed:", error);
        setErr(error);
        setLoading(false);
      }
    }
    return false;
  };
  return (
    <>
      <TouchableOpacity
        style={{ position: "absolute", top: "5%", left: "5%" }}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Ionicons name={"arrow-back-outline"} size={25} color={"black"} />
      </TouchableOpacity>

      <View style={styles.recoveryContainer}>
        <Image
          style={styles.recoveryImage}
          source={require("../../../assets/secure.png")}
        />
        <Text style={styles.recoveryTitle}>Email de Récupération</Text>
        <Input
          onChangeText={(text) => setEmail(text)}
          variant={"underlined"}
          placeholder="Email@example.com"
        />
        {validEmail() && <Text style={{ color: "red" }}>{validEmail()}</Text>}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleForgetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnText}>Envoyer</Text>
          )}
        </TouchableOpacity>
      </View>

      {sent && !err && (
        <Text style={styles.sentMessage}>{t("email.status.email_200")}</Text>
      )}
      {err &&  (
        <Text style={styles.sentMessage}>{t("email.status.email_err")}</Text>
      ) }
    </>
  );
};

export default ForgotPassword;

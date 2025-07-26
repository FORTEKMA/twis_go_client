import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "../stylesForgetPassword";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import api from "../../../utils/api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    validateEmail();
  }, [email]);

  const validateEmail = () => {
    if (!email) {
      setIsEmailValid(false);
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    setIsEmailValid(emailRegex.test(email) && email.length <= 254);
  };

  const validEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = t("auth.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
    } else if (email.length > 254) {
      newErrors.email = t("auth.emailTooLong");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgetPassword = async () => {
    if (!validEmail()) {
      return;
    }

    setLoading(true);
    setErr(false);
    setSent(false);

    try {
      const response = await api.post("codes/forgot-password", { email });
      setLoading(false);
      
      if (response.data.ok) {
        setSent(true);
        navigation.navigate("ResetCodeScreen", {...response.data,email});
      } else {
        setErr(true);
        Alert.alert(
          t("common.error"),
          t("auth.forgotPasswordError"),
          [{ text: t("common.ok") }]
        );
      }
    } catch (error) {
      setLoading(false);
      setErr(true);
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("auth.genericError"),
        [{ text: t("common.ok") }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingTop: 40 }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={25} color="black" />
            </TouchableOpacity>

            {/* <Image
              style={{ width: "100%", height: "44%" }}
              source={require("../../../assets/emailStep.png")}
              resizeMode="contain"
            /> */}

            <View style={{ paddingHorizontal: 24 }}>
              <Text style={styles.title}>{t("auth.forgotPassword")}</Text>
 
              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder={t("auth.enterEmail")}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: null });
                    setErr(false);
                    setSent(false);
                  }}
                  placeholderTextColor="#ccc"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  (!isEmailValid || loading) && styles.loginButtonDisabled
                ]}
                onPress={handleForgetPassword}
                disabled={!isEmailValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[
                    styles.loginText,
                    (!isEmailValid || loading) && styles.loginTextDisabled
                  ]}>
                    {t("common.confirm")}
                  </Text>
                )}
              </TouchableOpacity>

              {sent && !err && (
                <Text style={[styles.sentMessage, { color: "#4CAF50" }]}>
                  {t("email.status.email_200")}
                </Text>
              )}
              {err && (
                <Text style={[styles.sentMessage, { color: "#FF3B30" }]}>
                  {t("email.status.email_err")}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

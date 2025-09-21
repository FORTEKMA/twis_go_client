import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "../stylesForgetPassword";
import {
  resetPassword,
} from "../../../store/userSlice/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles as loginStyles } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ResetPassword = ({route}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sent, setSent] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
 
  const validatePassword = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.passwordLength");
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordsDoNotMatch");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    
    setLoading(true);
    try {
     
      const res = await dispatch(
        resetPassword({
          email: route.params.email,
          code: route?.params?.code,
          newPassword: password,

           role:"user"
        })
      );
      if (res) {
        setSent(res);
        setShowSuccessPopup(true);
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    setShowSuccessPopup(false);
    navigation.navigate("MainScreen");
  };

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1 }}
      >
        {/* Header with safe top padding */}
        <View style={{ paddingTop: insets.top }}>
          <View style={loginStyles.header}>
            <TouchableOpacity
              style={loginStyles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="close" size={24} color="#000000" />
            </TouchableOpacity>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
         // keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={loginStyles.content}>
            <Text style={styles.title}>{t("auth.resetPassword")}</Text>

            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword && styles.passwordContainerError,
                { marginTop: 15 },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder={t("auth.newPassword")}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: null });
                }}
                placeholderTextColor="#ccc"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={{
                  height: "100%",
                  width: 60,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={!showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword && styles.passwordContainerError,
                { marginTop: 15 },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder={t("auth.confirmPassword")}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: null });
                }}
                placeholderTextColor="#ccc"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={{
                  height: "100%",
                  width: 60,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={!showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {!sent && (
              <Text
                style={[
                  styles.sentMessage,
                  { color: "#FF3B30" },
                ]}
              >
                {t("email.reset_failed")}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Fixed Footer Submit Button with safe bottom padding */}
        <View
          style={[
            loginStyles.submitButtonContainer,
           
          ]}
        >
          <TouchableOpacity
            style={[
              loginStyles.btn,
              loading && loginStyles.btnDisabled,
            ]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.btnText}>{t("auth.reset")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showSuccessPopup}
        transparent={true}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={60}
              color="#4CAF50"
              style={{ marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {t("auth.passwordResetSuccess")}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#666",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {t("auth.passwordResetSuccessMessage")}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#F37A1D",
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 8,
              }}
              onPress={handleGoToLogin}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {t("auth.goToLogin")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ResetPassword;

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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../stylesForgetPassword";
import { useTranslation } from "react-i18next";
import { OtpInput } from "react-native-otp-entry";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles as loginStyles } from "../styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const ResetCodeScreen = ({ route }) => {
  const forgetpasswordCode = route.params;
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (code.length !== 6) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (forgetpasswordCode?.code === code) {
        setLoading(false);
        navigation.navigate("ResetPassword",{email:forgetpasswordCode?.email,code:code});
      } else {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView behavior={"height"} style={{ flex: 1 }}>
        {/* Header with safe top padding */}
        <View style={{ paddingTop: insets.top }}>
          <View style={loginStyles.header}>
            <TouchableOpacity style={loginStyles.closeButton} onPress={() => navigation.goBack()}>
              <Icon name="close" size={24} color="#18365A" />
            </TouchableOpacity>
            <View style={{ width: 40, height: 40 }} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={loginStyles.content}>
            <View>
              <Text style={styles.title}>{t("email.code.verification")}</Text>
              <Text style={[styles.subtitle, { marginBottom: 24, textAlign: "left" }]}>
                {t("email.code.enterCode")}
              </Text>

              <OtpInput
                numberOfDigits={6}
                onTextChange={(text) => setCode(text)}
                focusColor="#18365A"
                focusStickBlinkingDuration={500}
                textInputProps={{ style: { color: "#18365A" } }}
                theme={{
                  containerStyle: {
                    marginBottom: 32,
                  },
                  pinCodeContainerStyle: {
                    width: 45,
                    height: 50,
                    borderWidth: 1,
                    borderColor: "#18365A",
                    borderRadius: 8,
                  },
                  pinCodeTextStyle: {
                    fontSize: 20,
                    color: "#18365A",
                  },
                }}
              />
            </View>
          </View>
        </ScrollView>
        {/* Fixed Footer Submit Button with safe bottom padding */}
        <View style={[loginStyles.submitButtonContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={[loginStyles.btn, (code.length !== 6 || loading) && loginStyles.btnDisabled]}
            onPress={handleSubmit}
            disabled={code.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.btnText}>{t("common.verify")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetCodeScreen;

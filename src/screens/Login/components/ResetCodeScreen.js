import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../stylesForgetPassword";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { OtpInput } from "react-native-otp-entry";


const ResetCodeScreen = ({route}) => {
  const forgetpasswordCode =  route.params
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

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
    <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <KeyboardAvoidingView 
        behavior={ "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flex:1,
            justifyContent: 'space-between',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: 40 }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back-outline" size={25} color="black" />
            </TouchableOpacity>

            <Image
              style={{ width: "100%", height: "60%" }}
              source={require("../../../assets/otp.png")}
            />

            <View style={{ paddingHorizontal: 24, flex: 1, justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.title}>{t("email.code.verification")}</Text>
                <Text style={[styles.subtitle, { marginBottom: 24,textAlign:"left" }]}>
                  {t("email.code.enterCode")}
                </Text>

                <OtpInput
                  numberOfDigits={6}
                  onTextChange={(text) => setCode(text)}
                  focusColor="#18365A"
                  focusStickBlinkingDuration={500}
                  textInputProps={{style:{color:"#000"}}}
                  theme={{
                    
                    containerStyle: {
                      marginBottom: 32,
                    },
                    pinCodeContainerStyle: {
                      width: 45,
                      height: 50,
                      borderWidth: 1,
                      borderColor: '#18365A',
                      borderRadius: 8,
                    },
                    pinCodeTextStyle: {
                      fontSize: 20,
                      color: '#000',
                    },
                  }}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  (code.length !== 6 || loading) && styles.loginButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={code.length !== 6 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>{t("common.verify")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetCodeScreen;

import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert,SafeAreaView,StatusBar} from 'react-native';
import { styles } from '../styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const Help = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
 

  const handleCall = () => {
    const phoneNumber = `tel:${36848020}`;
    Linking.openURL(phoneNumber).catch((err) => {
      console.error('Failed to open phone call:', err);
      Alert.alert(t('errors.title'), t('errors.phone_call'));
    });
  };

  const handleEmail = () => {
    const email = 'mailto:support@tawsilet.com';
    Linking.openURL(email).catch((err) => {
      console.error('Failed to open email:', err);
      Alert.alert(t('errors.title'), t('help.errors.email'));
    });
  };

  const handleWhatsApp = () => {
    const whatsapp = 'whatsapp://send?phone=+21636848020';
    Linking.openURL(whatsapp).catch((err) => {
      console.error('Failed to open WhatsApp:', err);
      Alert.alert(t('errors.title'), t('help.errors.whatsapp'));
    });
  };

  return (
    <SafeAreaView
    style={[
      styles.container,
      { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
    ]}
  >


    <View style={styles.sectionContainer}>
     
      <Header title={t('help.title')} />
      <ScrollView>
        <View  style={{padding:20}}>

       

        <View style={styles.helpOptionsContainer}>
          <TouchableOpacity
            style={styles.helpOption}
            onPress={()=>navigation.navigate("TicketScreen")}
          >
            <Icon name="help-circle-outline" size={24} color="#fff" />
            <Text style={styles.helpOptionText}>{t('tickets.title')}</Text>
          </TouchableOpacity>

       
           
        </View>

        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>{t('help.faq.title')}</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('help.faq.personal_info.question')}</Text>
            <Text style={styles.faqAnswer}>
              {t('help.faq.personal_info.answer')}
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t('help.faq.password.question')}</Text>
            <Text style={styles.faqAnswer}>
              {t('help.faq.password.answer')}
            </Text>
          </View>
         
        </View>
        <View style={{height:100}}></View>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

export default Help; 
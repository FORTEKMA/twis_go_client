import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, I18nManager ,Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
const Header = ({ title }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={24} color={colors.black} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 3,
    borderBottomColor: '#eee',
    width:"90%",
    alignSelf:"center",
    paddingTop:Platform.OS=='ios'?hp(6):hp(2)
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 16,
  },
});

export default Header; 
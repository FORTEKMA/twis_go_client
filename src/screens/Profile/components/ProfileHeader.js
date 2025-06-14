import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { styles } from '../styles';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../utils/colors';

const ProfileHeader = ({ user, onImagePress, isUploading }) => {
  const { t } = useTranslation();
   return (
    <View style={styles.header}>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={onImagePress}>
            <Image
              style={styles.profileImage}
              source={
                user?.profilePicture?.url
                  ? { uri: user.profilePicture?.url }
                  : require("../../../assets/man.png")
              }
            />
            {isUploading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: 100,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#0c0c0c',
              borderRadius: 15,
              padding: 8,
              borderWidth: 2,
              borderColor: 'white'
            }}>
              <Ionicons
                name="pencil"
                size={20}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
           
          </View>
          <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
          
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;

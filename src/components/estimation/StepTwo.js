import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React from 'react';
import DropAdress from '../DropAdress';
import Divider from '../Divider';
import {Pressable, Switch} from 'native-base';
import {colors} from '../../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
const StepTwo = ({
  setNewreservation,
  newreservation,
  setInputErrors,
  setVisible,
  selectedOption,
  inputerrors,
  visible,
  handleDecreaseDrop,
  handleIncreaseDrop,
  hasElevator,
  setHasElevator,
  handleOptionSelectDrop,

  count,
}) => {
  const time = require('../../assets/Time.png');
  const arrow = require('../../assets/rightArrow.png');
  const access = require('../../assets/access.png');
  console.log(hasElevator, 'step 2');
  return (
    <ScrollView
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flexGrow: 1}}>
      <View style={{flex: 1, justifyContent: 'flex-start', gap: hp(1.5)}}>
        <View>
          <DropAdress
            setNewreservation={setNewreservation}
            newReservation={newreservation}
            setInputErrors={setInputErrors}
          />
          {inputerrors.dropOfAddress && (
            <Text
              style={{
                color: 'red',
                fontWeight: '300',
                fontStyle: 'italic',
                marginBottom: 3,
                fontSize: hp(1.5),
              }}>
              {inputerrors.dropOfAddress}
            </Text>
          )}
          <Divider />
        </View>
        <View style={{flex: 1, justifyContent: 'flex-start', gap: hp(1.5)}}>
          <View
            style={{
              paddingTop: 15,
              paddingBottom: 15,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap:10
            }}>
              <View
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: hp(1.5),
              flexDirection: 'row',
            }}>
            <Text style={styles.texte}>Accès</Text>
      

          </View>

      
          <View style={styles.containerBtn}>
            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'Au pied du camion'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelectDrop('Au pied du camion', 0);
                setVisible(false);
                setInputErrors(prev => ({
                  ...prev,
                  pickUpAcces: '',
                }));
              }}>
              
            
              <Text style={{ color: selectedOption === 'Au pied du camion' ? colors.primary : colors.text,
      fontWeight: selectedOption === 'Au pied du camion' ? '700' : '500', }}>Camion</Text>
            </Pressable>

            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'chez moi'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelectDrop('chez moi', count); // You can pass the count here
                setVisible(true);
                setInputErrors(prev => ({
                  ...prev,
                  pickUpAcces: '',
                }));
              }}>
             
              <Text style={{ color: selectedOption === 'chez moi' ? colors.primary : colors.text,
      fontWeight: selectedOption === 'chez moi' ? '700' : '500', }}>Chez moi</Text>
           
            </Pressable>
          </View>
          </View>
          {/* <View style={styles.containerBtn}>
            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'Au pied du camion'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelectDrop('Au pied du camion', 0);
                setVisible(false);
              }}>
              {selectedOption === 'Au pied du camion' && (
                <Ionicons
                  name="checkmark-outline"
                  size={20}
                  color="black"
                  style={styles.checkIcon}
                />
              )}
              <Text style={styles.text}>Au pieds de camion</Text>
            </Pressable>

            <Pressable
              style={{
                ...styles.option,
                ...(selectedOption === 'chez moi'
                  ? {backgroundColor: colors.secondary}
                  : 'gray'),
              }}
              onPress={() => {
                handleOptionSelectDrop('chez moi', count); // You can pass the count here
                setVisible(true);
              }}>
              {selectedOption === 'chez moi' && (
                <Ionicons
                  name="checkmark-outline"
                  size={20}
                  color="black"
                  style={styles.checkIcon}
                />
              )}
              <Text style={styles.text}>Chez moi</Text>
            </Pressable>
            {inputerrors.dropOfAcces && (
              <Text
                style={{
                  color: 'red',
                  fontWeight: '300',
                  fontStyle: 'italic',
                  marginBottom: 3,
                  fontSize: hp(1.5),
                }}>
                {inputerrors.dropOfAcces}
              </Text>
            )}
          </View> */}
          <View>
            {visible && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: hp(2),
                    marginBottom: 10,
                    marginTop: 10,
                  }}>
                  <TouchableOpacity
                    style={styles.yellowButton}
                    onPress={() => handleDecreaseDrop()}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.countValue}>
                    {count === 0 ? 'RDC' : count}
                  </Text>
                  <TouchableOpacity
                    style={styles.yellowButton}
                    onPress={() => handleIncreaseDrop()}>
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
                {count !== 0 && (
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Switch
                      size={Platform.OS === 'ios' ? 'sm' : 'md'}
                      value={hasElevator}
                      onValueChange={value => {
                        setHasElevator(value);
                        handleOptionSelectDrop(selectedOption, count, value);
                      }}
                      trackColor={{false: '#ccc', true: 'orange'}} // Gray when off, orange when on
                    thumbColor={hasElevator ? 'darkorange' : '#fff'} // Dark orange when active
                    />
                  
                  <Text
                    style={{
                      color: hasElevator ? colors.primary : 'grey', // Blue when switch is ON, Grey when OFF
                      fontWeight: hasElevator ? '800' : '600',
                    }}>
                    Avec Ascenseur
                  </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={{display:"flex", flexDirection:"row", gap:5,width:305, }}>
          <Image
        source={require('../../assets/poi.png')}  // Path to your image
        style={styles.image}
      />
         
          <Text style={{fontSize:12,paddingBottom:2}}>Emballez vos objets, nos chauffeurs les transportent avec soin dans le camion, protégés par sangles et couvertures.</Text>
         </View>
         </View>
      </View>
    </ScrollView>
  );
};

export default StepTwo;

const styles = StyleSheet.create({
  estimationContainer: {
    backgroundColor: '#fff',
    width: '90%',
    flex: 0.73,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  estimationContainerEs: {
    backgroundColor: '#fff',
    height: 370,
    width: '90%',
    flexGrow: 1,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 15,
  },

  header: {
    height: 50,
    backgroundColor: colors.secondary,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  headerInactive: {
    height: 50,
    backgroundColor: 'gray',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  nextButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,

    width: wp('80%'),
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  containerBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  option: {
    flexDirection: 'row',
    backgroundColor: colors.general_2,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },
  text: {
    textAlign:"center"
  },

  text: {
    fontWeight: '500',
    color: colors.primary,
    fontSize: hp(1.5),
  },
  yellowButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: hp(2),
    fontWeight: '700',
    color: 'black',
  },
  countValue: {
    fontSize: hp(2),
    marginHorizontal: 10,
    color: colors.primary,
  },
  texte: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: hp(2),
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: 'contain',  // To keep the aspect ratio
  },
});

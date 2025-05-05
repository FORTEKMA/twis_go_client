import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {colors} from '../utils/colors';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { useDispatch } from 'react-redux';
import { setAcceptRide, setDeclinedRide } from '../store/utilsSlice/utilsSlice';
const PopOver = ({setModalVisible, isModalVisible, notificationBody}) => {
  useEffect(() => {
    if (isModalVisible) {
      // Close modal after 10s
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isModalVisible]);
    const dispatch = useDispatch();
    useEffect(() => {
      if (notificationBody?.accept) {
        dispatch(setAcceptRide(notificationBody?.accept));
      }
      if (!notificationBody?.accept) {
        dispatch(setDeclinedRide(notificationBody?.raduis));
      }
    }, [dispatch]);
    

  return (
    <Modal animationType="slide" transparent={true} visible={isModalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHead}>
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                color: 'white',
              }}>
              Ride
            </Text>
            <Text
              style={{
                fontWeight: '500',
                fontSize: 16,
                color: notificationBody?.accept ? 'gold' : 'red',
                textAlign: 'center',
              }}>
              {notificationBody?.msg}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PopOver;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    zIndex: 9999,
  },
  modalView: {
    width: wp('80%'),
    flex: 0.27,
    margin: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalHead: {
    flex: 0.7,
    alignItems: 'center',

    justifyContent: 'space-evenly',
    paddingHorizontal: 15,
  },
  modalBottom: {
    flex: 0.3,
    backgroundColor: colors.primary,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  modalBottom2: {
    height: '100%',
    flex: 0.3,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

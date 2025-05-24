import React, {useEffect, useState} from 'react';
import NetInfo from '@react-native-community/netinfo';
import CustomAlert from './CustomAlert';

const CheckConnection = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setAlertTitle('No Internet');
        setAlertMessage('Please check your connection.');
        setShowAlert(true);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <CustomAlert
      visible={showAlert}
      onClose={handleAlertClose}
      title={alertTitle}
      message={alertMessage}
      buttons={[
        {
          text: 'OK',
          onPress: () => handleAlertClose(),
          style: 'confirm',
        },
      ]}
    />
  );
};

export default CheckConnection;

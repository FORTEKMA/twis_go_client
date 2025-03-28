import React, {useState} from 'react';
import Modal from 'react-native-modal';
import {Box, Button, HStack, Text, Divider} from 'native-base';
import DatePicker from 'react-native-date-picker';
import {Platform} from 'react-native';
const DatePickerModal = props => {
  const [date, setDate] = useState(new Date());

  const confirmDate = () => {
    props.setDate({date});
  };

  return (
    <Modal
      style={{
        justifyContent: 'flex-end',
        margin: 0,
        borderRadius: 8,
      }}
      avoidKeyboard
      isVisible={props.isOpen !== null}
      onBackdropPress={props.onClose}>
      <Box
        py="2"
        hideDragIndicator
        bg="#FFF"
        pb="8"
        borderRadius="8px"
        overflow={'hidden'}>
        <Text textAlign="center" fontSize="18px" fontWeight="600">
          Planifier l'heure de ramassage
        </Text>
        <Divider my="2" />
        <Box h="200px">
          <DatePicker
            date={date}
            onDateChange={newDate => setDate(newDate)}
            textColor="#26282b"
            androidVariant="iosClone"
          />
        </Box>
        <Button mx="5" onPress={confirmDate}>
          Définir l'heure de ramassage
        </Button>
      </Box>
    </Modal>
  );
};

export default DatePickerModal;

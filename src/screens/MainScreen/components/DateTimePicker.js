import React from 'react';
import {View, Text, Pressable} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {styles} from '../styles';

const DateTimePicker = ({
  isVisible,
  onConfirm,
  onCancel,
  selectedDate,
  onPress,
}) => {
  return (
    <View style={{alignItems: 'center', justifyContent: 'center'}}>
      <View
        style={{
          width: '80%',
          borderWidth: 1,
          borderColor: '#18365A',
          padding: 10,
          margin: -8,
          backgroundColor: '#18365A',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
          }}
          onPress={onPress}>
          {selectedDate}
        </Text>
      </View>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="datetime"
        display="spinner"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </View>
  );
};

export default DateTimePicker; 
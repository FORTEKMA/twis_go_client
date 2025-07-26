import React, {useState} from 'react';
import {Box, Popover, Button} from 'native-base';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {Dimensions} from 'react-native';

const WIDTH = Dimensions.get('window').width - 70;

const DatePopUp = ({date, newreservation, setNewreservation, setDate}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentDate = new Date();
 
  return (
    <Box w={`${WIDTH}px`} alignSelf={'center'} alignItems="center">
      <Popover
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        trigger={triggerProps => {
          return (
            <Button
              {...triggerProps}
              onPress={() => {
                setIsOpen(!isOpen);
              }}
              mt="0"
              variant={'underline'}
              h="0px"
              w="0px">
              {newreservation?.data?.departDate
                ? newreservation?.data?.departDate
                : ''}
            </Button>
          );
        }}>
        <Popover.Content w={`${WIDTH}px`}>
          <Calendar
            minDate={currentDate}
            onDayPress={day => {
              setIsOpen(false);
              setNewreservation({
                ...newreservation,
                data: {...newreservation.data, departDate: day.dateString},
              });
              setDate(day.dateString);
            }}
            markedDates={{
              [date]: {
                selected: true,
                disableTouchEvent: true,
                selectedDotColor: 'orange',
              },
            }}
          />
        </Popover.Content>
      </Popover>
    </Box>
  );
};

export default DatePopUp;

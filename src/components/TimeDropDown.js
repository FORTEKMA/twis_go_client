import React, {useState, useEffect} from 'react';
import {Select, CheckIcon} from 'native-base';
import axios from 'axios';
import {useDispatch} from 'react-redux';
import {fetchDate} from '../store/userSlice/userSlice';

const TimeDropDown = ({hour, setData, newreservation}) => {
  const [times, setTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState();

  const [currentTime, setCurrentTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedDate(newreservation?.data?.departDate);
  }, [newreservation]);
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', {month: 'short'});
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const timeZoneOffset = date.getTimezoneOffset() / 60;
    const newDate = new Date(date.getTime() + timeZoneOffset * 60 * 60 * 1000);
    const timeZoneName = newDate.toString().match(/\(([^)]+)\)$/)[1];
    const formattedDate = `${newDate
      .toString()
      .substr(
        0,
        3,
      )} ${month} ${day} ${year} ${hours}:${minutes}:${seconds} GMT${
      timeZoneOffset > 0 ? '-' : '+'
    }${Math.abs(timeZoneOffset)}00 (${timeZoneName})`;
    return formattedDate;
  }
  const fetchTime = async () => {
    try {
      const response = await fetch(
        `http://worldtimeapi.org/api/timezone/Europe/Paris`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const resData = await response.json();

      const formattedDateTime = formatDate(resData?.datetime);
      setCurrentTime(formattedDateTime);
    } catch (error) {
      console.error('Error fetching time:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTime();
  }, [selectedDate]);

  useEffect(() => {
    setTimes(createArrayOfStrings());
  }, [selectedDate, currentTime]); // Include currentTime in the dependency array

  // const createArrayOfStrings = () => {
  //   const arrayOfStrings = [];
  //   const selectedDateISOString = selectedDate
  //     ? new Date(selectedDate).toISOString().split('T')[0]
  //     : null;

  //   const currentTimeISOString = currentTime
  //     ? new Date(currentTime).toISOString().split('T')[0]
  //     : null;
  //   console.log(currentTimeISOString, 'selectedDateISOString');
  //   if (selectedDateISOString === currentTimeISOString) {
  //     const currentHour = new Date(currentTime).getHours();
  //     for (let i = currentHour + 2; i <= 19; i++) {
  //       const formattedNumber = i < 10 ? `0${i}` : `${i}`;
  //       arrayOfStrings.push(formattedNumber);
  //     }
  //   } else {
  //     for (let i = 7; i <= 19; i++) {
  //       const formattedNumber = i < 10 ? `0${i}` : `${i}`;
  //       arrayOfStrings.push(formattedNumber);
  //     }
  //   }

  //   return arrayOfStrings;
  // };

  const createArrayOfStrings = () => {
    let date = new Date(currentTime);
    const arrayOfStrings = [];
    // Extract year, month, and day
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    let day = date.getDate().toString().padStart(2, '0');

    // Format the date in 'YYYY-MM-DD' format
    let formattedDate = `${year}-${month}-${day}`;

    // Extract hours
    let hours = date.getHours();

    if (selectedDate > formattedDate) {
      for (let i = 7; i <= 19; i++) {
        const formattedNumber = i < 10 ? `0${i}` : `${i}`;
        arrayOfStrings.push(formattedNumber);
      }
    } else {
      for (let i = hours + 2; i <= 18; i++) {
        const formattedNumber = i < 10 ? `0${i}` : `${i}`;
        arrayOfStrings.push(formattedNumber);
      }
    }
    return arrayOfStrings;
  };
  return (
    <Select
      w="100%"
      flex={1}
      justifyContent="space-between"
      h="44px"
      variant={'unstyled'}
      selectedValue={hour}
      placeholder={'heure'}
      _selectedItem={{
        bg: 'teal.600',
        _stack: {justifyContent: 'space-between'},
        endIcon: <CheckIcon size="5" />,
      }}
      mt={1}
      onValueChange={value => setData(value)}>
      {times?.map(x => (
        <Select.Item label={x} value={x} key={x} />
      ))}
    </Select>
  );
};

export default TimeDropDown;

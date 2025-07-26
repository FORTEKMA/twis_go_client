import React, {useState, useEffect} from 'react';
import {Select, CheckIcon} from 'native-base';

const MinutesDropDown = ({minutes, setData}) => {
  const [times, setTimes] = useState([]);

  useEffect(() => {
    setTimes(createArrayOfStrings());
  }, []); // Empty dependency array to run the effect only once on mount

  const createArrayOfStrings = () => {
    const arrayOfStrings = [];

    for (let i = 0; i <= 59; i++) {
      // Use template literals to ensure leading zeros for single-digit numbers
      const formattedNumber = i < 10 ? `0${i}` : `${i}`;
      arrayOfStrings.push(formattedNumber);
    }

    return arrayOfStrings;
  };

  return (
    <Select
      w="100%"
      flex={1}
      h="54px"
      selectedValue={minutes}
      placeholder={'minutes'}
      variant={'unstyled'}
      _selectedItem={{
        bg: 'teal.600',
        _stack: {justifyContent: 'space-between'},
        endIcon: <CheckIcon size="5" />,
      }}
      mt={1}
      onValueChange={value => setData(value)}>
      {times.map(x => (
        <Select.Item label={x} value={x} key={x} />
      ))}
    </Select>
  );
};

export default MinutesDropDown;

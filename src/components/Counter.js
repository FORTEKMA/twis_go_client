import React from 'react';
import {View, Text, TouchableOpacity, Switch} from 'react-native';
import {colors} from '../utils/colors';

const Counter = ({
  visible,
  count,
  setCount,
  hasElevator,
  setHasElevator,
  handleOptionSelect,
}) => {
  const handleIncrease = () => {
    setCount(count + 1);
  };

  const handleDecrease = () => {
    setCount(count - 1);
  };

  return (
    <View>
      {visible && (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              marginBottom: 10,
              marginTop: 10,
            }}>
            <TouchableOpacity
              style={styles.yellowButton}
              onPress={() => handleDecrease()}>
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.countValue}>{count === 0 ? 'RDC' : count}</Text>
            <TouchableOpacity
              style={styles.yellowButton}
              onPress={() => handleIncrease()}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
          {count !== 0 && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Switch
                value={hasElevator}
                onValueChange={value => {
                  setHasElevator(value);
                  handleOptionSelect();
                }}
              />
              <Text>Avec Ascenseur</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = {
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
    fontSize: 24,
    fontWeight: '700',
  },
  countValue: {
    fontSize: 18,
    marginHorizontal: 10,
    color: 'black',
  },
};

export default Counter;

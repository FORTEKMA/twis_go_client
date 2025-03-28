import colors from 'native-base/lib/typescript/theme/base/colors';
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const DepartureCard = () => {
  const [departureAddress, setDepartureAddress] = useState('');
  const [isEarliest, setIsEarliest] = useState(false);
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('49');

  return (
    <View style={styles.stepContainer}>
            <Text style={styles.title}>DÉPART</Text>
            <SafeAreaView style={styles.container}>
              <KeyboardAvoidingView
                behavior="padding"
                style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <PickUpAdress />
                </View>
                <View
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 20,
                  }}>
                  {/* Date Picker */}
                  <View style={styles.dateContainer}>
                    <TouchableOpacity
                      onPress={showDatePicker}
                      style={styles.dateInput}>
                      <Text style={styles.dateText}>
                        {date.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="date"
                      onConfirm={handleDateConfirm}
                      onCancel={hideDatePicker}
                    />
                  </View>

                  {/* Time Inputs */}
                  <View style={styles.timeInputsContainer}>
                    <TextInput
                      style={styles.timeInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={hours}
                      onChangeText={text => setHours(text)}
                      placeholder="HH"
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      keyboardType="numeric"
                      maxLength={2}
                      value={minutes}
                      onChangeText={text => setMinutes(text)}
                      placeholder="MM"
                    />
                  </View>
                </View>
                {/* Switch for "2 hours at the earliest" */}
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>2 heures au plus tôt</Text>
                  <Switch
                    trackColor={{
                      false: '#767577',
                      true: 'rgba(243, 122, 29, 1)',
                    }}
                    thumbColor={
                      isSwitchOn ? 'rgba(243, 122, 29, 1)' : '#f4f3f4'
                    }
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isSwitchOn}
                  />
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>

            <Pressable
              style={{
                padding: 10,
                width: '50%',
                alignSelf: 'flex-end',
                backgroundColor: colors.secondary,
                borderRadius: 5,
                alignItems: 'center',
                // borderRadius: 5,
                borderWidth: 2,
                borderColor: colors.primary,
                // Add borders using negative margin trick
                borderRightWidth: 5,
                borderBottomWidth: 5,
                borderTopWidth: 2,
                borderLeftWidth: 2,
              }}
              onPress={() => setStep(2)}>
              <Text
                style={{
                  color: colors.general_2,
                  fontSize: hp(1.8),
                  fontWeight: '600',
                }}>
                Saisir l'arrivée
              </Text>
            </Pressable>
          </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,

    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',

    color: colors.primary,
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  autocompleteContainer: {
    flex: 1,
  },
  textInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  logo: {
    marginLeft: 10,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    width: 50,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
  },
  timeSeparator: {
    marginHorizontal: 5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

const placesStyles = {
  textInputContainer: {
    width: '100%',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  predefinedPlacesDescription: {
    color: '#1faadb',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  detailsContainer: {
    marginLeft: 24, // Indent under the checkbox
    marginVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  }

};

export default DepartureCard;

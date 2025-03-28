/* eslint-disable react-hooks/exhaustive-deps */
import React, {useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import {RadioButton} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import {formatDateTime} from '../utils/formatDateTime';
import {calculateDistanceAndTime} from '../utils/CalculateDistanceAndTime';
import {useDispatch, useSelector} from 'react-redux';
import {getObjetAll} from '../store/objectSlice/objectSlice';
import {setNewCommande} from '../store/commandeSlice/commandeSlice';
import {getCurrentUser} from '../store/userSlice/userSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import StepTwo from './estimation/StepTwo';
import StepOne from './estimation/StepOne';

const Estimation = ({currentStep, setCurrentStep}) => {
  const {width, height} = useWindowDimensions();
  const dispatch = useDispatch();
  const current = useSelector(state => state?.user?.currentUser);
  const objet = useSelector(state => state.objects?.objects?.data);
  const initialState = useSelector(state => state?.commandes?.newCommande);

  // State variables
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [selectedOption, setSelectedOption] = useState('Au pied du camion');
  const [selectedOption2, setSelectedOption2] = useState('Au pied du camion');
  const [date, setDate] = useState(new Date());
  const [switchChecked, setSwitchChecked] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [hasElevator2, setHasElevator2] = useState(false);
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);
  const [volume, setVolume] = useState(0);
  const [maxVolumeReached, setMaxVolumeReached] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const [newreservation, setNewreservation] = useState(initialState);

  // Fetch initial data
  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(getObjetAll());
  }, []);

  // Calculate distance and time when coordinates change
  useEffect(() => {
    if (
      newreservation?.data?.pickUpAddress?.coordonne?.latitude &&
      newreservation?.data?.pickUpAddress?.coordonne?.longitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.latitude &&
      newreservation?.data?.dropOfAddress?.coordonne?.longitude
    ) {
      calculateDistanceAndTime(
        `${newreservation?.data?.pickUpAddress?.coordonne?.latitude},${newreservation?.data?.pickUpAddress?.coordonne?.longitude}`,
        `${newreservation?.data?.dropOfAddress?.coordonne?.latitude},${newreservation?.data?.dropOfAddress?.coordonne?.longitude}`,
      ).then(result => {
        if (result) {
          setNewreservation(prevReservation => ({
            ...prevReservation,
            data: {
              ...prevReservation.data,
              distance: result.distance,
              duration: result.time,
            },
          }));
        }
      });
    }
  }, [
    newreservation?.data?.pickUpAddress?.coordonne?.latitude,
    newreservation?.data?.dropOfAddress?.coordonne?.latitude,
  ]);

  const headerTitle = currentStep => {
    switch (currentStep) {
      case 1:
        return 'Départ';
      case 2:
        return 'Arrivé';
      case 3:
        return ' Vos Objets';

      case 5:
        return 'Payemant';
      default:
        return '';
    }
  };
  const nextBtn = currentStep => {
    switch (currentStep) {
      case 1:
        return nextToArrival();
      case 2:
        return nextToObject();
      case 3:
        return nextToEstimation();
      case 4:
        return nextTofive();

      default:
        return '';
    }
  };
  const handleOptionSelect = (option, updatedCount, updatedHasElevator) => {
    setSelectedOption(option);
    let updatedPickUpAccess = {
      options: 'Camion',
      floor: 0,
    };

    if (option === 'chez moi') {
      if (updatedCount === 0) {
        updatedPickUpAccess = {
          options: 'Rez-de-chaussée',
          floor: 0,
        };
      } else {
        updatedPickUpAccess = {
          options: updatedHasElevator ? 'Ascenseur' : 'Monter',
          floor: updatedCount,
        };
      }
    }

    setNewreservation(prevReservation => ({
      ...prevReservation,
      data: {
        ...prevReservation.data,
        pickUpAcces: updatedPickUpAccess,
      },
    }));
  };
  const handleOptionSelectDrop = (option, updatedCount, updatedHasElevator) => {
    setSelectedOption2(option);

    let updatedDropUpAccess = {
      options: 'Camion',
      floor: 0,
    };

    if (option === 'chez moi') {
      if (updatedCount === 0) {
        updatedDropUpAccess = {
          options: 'Rez-de-chaussée',
          floor: 0,
        };
      } else {
        updatedDropUpAccess = {
          options: updatedHasElevator ? 'Ascenseur' : 'Monter',
          floor: updatedCount,
        };
      }
    }

    setNewreservation(prevReservation => ({
      ...prevReservation,
      data: {
        ...prevReservation.data,
        dropAcces: updatedDropUpAccess,
      },
    }));
  };
  const handleIncrease = () => {
    const updatedCount = count + 1;
    setCount(updatedCount);
    handleOptionSelect(selectedOption, updatedCount, hasElevator);
  };

  const handleDecrease = () => {
    const updatedCount = count - 1;
    setCount(updatedCount);
    handleOptionSelect(selectedOption, updatedCount, hasElevator);
  };
  const handleIncreaseDrop = () => {
    const updatedCount = count2 + 1;
    setCount2(updatedCount);
    handleOptionSelectDrop(selectedOption2, updatedCount, hasElevator);
  };

  const handleDecreaseDrop = () => {
    const updatedCount = count2 - 1;
    setCount2(updatedCount);
    handleOptionSelectDrop(selectedOption2, updatedCount, hasElevator);
  };
  // Helper functions
  const calculateTotalVolume = articles =>
    articles.reduce(
      (total, article) => total + article.item.volume * article.quant,
      0,
    );

  const handleSelectChange = value => {
    const findObject = objet?.find(el => el.attributes.objet.id === value.id);
    if (findObject) {
      setSelectedArticles(prevSelectedArticles => {
        const updatedArticles = [...prevSelectedArticles];
        const existingItemIndex = updatedArticles.findIndex(
          item => item.item.name === findObject.attributes.objet.name,
        );
        if (existingItemIndex !== -1) {
          updatedArticles[existingItemIndex].quant += 1;
        } else {
          const totalVolume = calculateTotalVolume(updatedArticles);
          if (totalVolume + findObject.attributes.objet.volume <= 20) {
            updatedArticles.push({
              item: {
                id: findObject.attributes.objet.id,
                name: findObject.attributes.objet.name,
                volume: findObject.attributes.objet.volume,
                category: findObject.attributes.objet.category,
                weight: findObject.attributes.objet.weight,
              },
              quant: 1,
            });
          }
        }
        const totalVolume = calculateTotalVolume(updatedArticles);
        setVolume(totalVolume);
        setMaxVolumeReached(totalVolume > 20);
        return updatedArticles;
      });
    }
  };

  const handleDecreaseQuant = index => {
    setSelectedArticles(prevSelectedArticles => {
      const updatedArticles = [...prevSelectedArticles];
      if (updatedArticles[index].quant > 0) {
        updatedArticles[index].quant -= 1;
        if (updatedArticles[index].quant === 0) {
          updatedArticles.splice(index, 1);
        }
      }
      const totalVolume = calculateTotalVolume(updatedArticles);
      setVolume(totalVolume);
      setMaxVolumeReached(totalVolume > 20);
      return updatedArticles;
    });
  };

  const handleIncreaseQuant = index => {
    setSelectedArticles(prevSelectedArticles => {
      const updatedArticles = [...prevSelectedArticles];
      updatedArticles[index].quant += 1;
      const totalVolume = calculateTotalVolume(updatedArticles);
      setVolume(totalVolume);
      setMaxVolumeReached(totalVolume > 20);
      return updatedArticles;
    });
  };

  const handleDate = selectedDate => {
    const currentDate = new Date();
    const twoHoursFromNow = new Date(
      currentDate.getTime() + 2 * 60 * 60 * 1000,
    );
    if (selectedDate < twoHoursFromNow) {
      setInputErrors(prev => ({
        ...prev,
        departDate: 'La date doit être au moins 2 heures après maintenant.',
      }));
    } else {
      setDate(selectedDate);
      const year = selectedDate.getUTCFullYear();
      const month = String(selectedDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getUTCDate()).padStart(2, '0');
      const hour = String(selectedDate.getUTCHours()).padStart(2, '0');
      const minute = String(selectedDate.getUTCMinutes()).padStart(2, '0');
      const second = String(selectedDate.getUTCSeconds()).padStart(2, '0');
      const departDate = `${year}-${month}-${day}`;
      const deparTime = `${hour}:${minute}:${second}`;
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          departDate,
          deparTime,
        },
      }));
      setInputErrors(prev => ({...prev, departDate: ''}));
    }
  };

  const isStepOneValid = () => {
    const {pickUpAddress, departDate} = newreservation.data;
    const errors = {};
    if (
      !pickUpAddress?.Address ||
      pickUpAddress.Address === 'Votre adresse de départ'
    ) {
      errors.pickUpAddress = "L'adresse de prise en charge est requise.";
    }
    if (!departDate) {
      errors.departDate = 'La date de départ est requise.';
    }
    return errors;
  };

  const isStepTwoValid = () => {
    const {dropOfAddress} = newreservation.data;
    const errors = {};
    if (
      !dropOfAddress?.Address ||
      dropOfAddress.Address === "Votre adresse d'arrivée"
    ) {
      errors.dropOfAddress = "L'adresse de destination est requise.";
    }
    return errors;
  };

  const isStepThreeValid = () => {
    const errors = {};
    if (selectedArticles.length === 0) {
      errors.item = 'Veuillez sélectionner des articles.';
    }
    return errors;
  };

  const nextToArrival = () => {
    const stepOneErrors = isStepOneValid();
    if (Object.keys(stepOneErrors).length === 0) {
      setCurrentStep(2);
    } else {
      setInputErrors(stepOneErrors);
    }
  };

  const nextToObject = () => {
    const stepTwoErrors = isStepTwoValid();
    if (Object.keys(stepTwoErrors).length === 0) {
      setCurrentStep(3);
    } else {
      setInputErrors(stepTwoErrors);
    }
  };

  const nextToEstimation = () => {
    const stepThreeErrors = isStepThreeValid();
    if (Object.keys(stepThreeErrors).length === 0) {
      setNewreservation(prevReservation => ({
        ...prevReservation,
        data: {
          ...prevReservation.data,
          items: selectedArticles,
        },
      }));
      setCurrentStep(4);
    } else {
      setInputErrors(stepThreeErrors);
    }
  };

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <View>
            <StepOne
              date={date}
              setDate={setDate}
              handleDate={handleDate}
              setNewreservation={setNewreservation}
              newreservation={newreservation}
              // setInputErrors={setInputErrors}
              // inputerrors={inputerrors}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              setSwitchChecked={setSwitchChecked}
              handleOptionSelect={handleOptionSelect}
              switchChecked={switchChecked}
              count={count}
              handleIncrease={handleIncrease}
              hasElevator={hasElevator}
              setHasElevator={setHasElevator}
              handleDecrease={handleDecrease}
              selectedOption={selectedOption}
              visible={visible}
              setVisible={setVisible}
            />
          </View>
        );
      case 2:
        return (
          <View>
            <StepTwo
              setNewreservation={setNewreservation}
              newreservation={newreservation}
              setInputErrors={setInputErrors}
              setVisible={setVisible2}
              selectedOption={selectedOption2}
              inputerrors={inputerrors}
              visible={visible2}
              handleDecreaseDrop={handleDecreaseDrop}
              handleIncreaseDrop={handleIncreaseDrop}
              hasElevator={hasElevator2}
              setHasElevator={setHasElevator2}
              handleOptionSelectDrop={handleOptionSelectDrop}
              count={count2}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <AutocompleteDropdown
              onSelectItem={item => handleSelectChange(item)}
              dataSet={objet?.map(item => ({
                id: item.attributes.objet.id,
                title: `${item.attributes.objet.name} (${item.attributes.objet.volume})m³`,
              }))}
            />
            {selectedArticles.length > 0 && (
              <View>
                {selectedArticles.map((selectedItem, index) => (
                  <View key={index}>
                    <Text>{selectedItem.item.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleDecreaseQuant(index)}>
                      -
                    </TouchableOpacity>
                    <Text>{selectedItem.quant}</Text>
                    <TouchableOpacity
                      onPress={() => handleIncreaseQuant(index)}>
                      +
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {maxVolumeReached && <Text>Maximum volume reached (20 m³).</Text>}
            {inputErrors.item && <Text>{inputErrors.item}</Text>}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.estimationContainer}>
      <KeyboardAwareScrollView>
        <View style={styles.header}>
          <Text>{headerTitle(currentStep)}</Text>
        </View>
        {renderStepContent(currentStep)}
        {currentStep !== 5 && (
          <TouchableOpacity
            onPress={() => nextBtn(currentStep)}
            style={styles.nextButton}>
            <Text style={styles.buttonText}>
              {currentStep === 5 ? 'Terminer' : 'Suivant'}
            </Text>
          </TouchableOpacity>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Estimation;

const styles = StyleSheet.create({
  estimationContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

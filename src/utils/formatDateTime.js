import {Text} from 'react-native';

export function formatDateTime(date, time) {
  if (!date || !time) {
    return (
      <Text style={{color: 'red'}}>
        Quelque chose a mal tourné. Veuillez réessayer.
      </Text>
    );
  }

  // Split the date and time components
  const dateComponents = date?.split('-');
  const timeComponents = time?.split(':');

  // Define the day names, month names, and construct the formatted string
  const dayNames = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
  ];
  const monthNames = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];

  const formattedDate = `${dayNames[new Date(date).getDay()]}, ${
    dateComponents[2]
  } ${monthNames[parseInt(dateComponents[1]) - 1]} ${dateComponents[0]}`;
  const formattedTime = `${timeComponents[0]}h:${timeComponents[1]}`;

  return `${formattedDate}, ${formattedTime}`;
}

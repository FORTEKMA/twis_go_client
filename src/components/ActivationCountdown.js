import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../screens/MainScreen/styles';
import { useTranslation } from 'react-i18next';

function getTimeLeft(targetDate) {
  const now = new Date();
  const diff = Math.max(0, new Date(targetDate) - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, finished: diff <= 0 };
}

const ActivationCountdown = ({ targetDate }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    if (timeLeft.finished) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate, timeLeft.finished]);

  if (timeLeft.finished) return null;

  return (
    <View style={styles.countdownOverlay}>
      <Text style={styles.countdownTitle}>
        {t('common.countdown_title')}
      </Text>
      <View style={styles.countdownRow}>
        <View style={styles.countdownBlock}>
          <Text style={styles.countdownNumber}>{timeLeft.days}</Text>
          <Text style={styles.countdownLabel}>{t('common.days')}</Text>
        </View>
        <Text style={styles.countdownColon}>:</Text>
        <View style={styles.countdownBlock}>
          <Text style={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t('common.hours')}</Text>
        </View>
        <Text style={styles.countdownColon}>:</Text>
        <View style={styles.countdownBlock}>
          <Text style={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t('common.minutes')}</Text>
        </View>
        <Text style={styles.countdownColon}>:</Text>
        <View style={styles.countdownBlock}>
          <Text style={styles.countdownNumber}>{String(timeLeft.seconds).padStart(2, '0')}</Text>
          <Text style={styles.countdownLabel}>{t('common.seconds')}</Text>
        </View>
      </View>
    </View>
  );
};

export default ActivationCountdown; 
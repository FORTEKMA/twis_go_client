// Test script to verify Sentry is working
// Run this in your app to test Sentry error reporting

import * as Sentry from '@sentry/react-native';

// Test Sentry initialization
const isSentryInitialized = Sentry.getCurrentHub().getClient() !== null;
console.log('Sentry initialized:', isSentryInitialized);

// Test error reporting
export const testSentryError = () => {
  if (!isSentryInitialized) {
    console.log('Sentry not initialized - skipping error test');
    return;
  }
  
  try {
    throw new Error('Test Sentry Error - This is a test error for production debugging');
  } catch (error) {
    Sentry.captureException(error);
    console.log('Test error sent to Sentry');
  }
};

// Test message reporting
export const testSentryMessage = () => {
  if (!isSentryInitialized) {
    console.log('Sentry not initialized - skipping message test');
    return;
  }
  
  Sentry.captureMessage('Test Sentry Message - This is a test message for production debugging', 'info');
  console.log('Test message sent to Sentry');
};

// Test performance monitoring
export const testSentryPerformance = () => {
  if (!isSentryInitialized) {
    console.log('Sentry not initialized - skipping performance test');
    return;
  }
  
  const transaction = Sentry.startTransaction({
    name: 'Test Transaction',
    op: 'test',
  });
  
  setTimeout(() => {
    transaction.finish();
    console.log('Test transaction finished and sent to Sentry');
  }, 1000);
}; 
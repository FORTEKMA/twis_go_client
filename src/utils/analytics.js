import * as amplitude from '@amplitude/analytics-react-native';

// Screen tracking
export const trackScreenView = (screenName, properties = {}) => {
  amplitude.track('Screen View', {
    screen_name: screenName,
    ...properties
  });
};

// Authentication events
export const trackLoginAttempt = (method, properties = {}) => {
  amplitude.track('Login Attempt', {
    login_method: method, // 'email', 'phone', 'google', 'apple'
    ...properties
  });
};

export const trackLoginSuccess = (method, properties = {}) => {
  amplitude.track('Login Success', {
    login_method: method,
    ...properties
  });
};

export const trackLoginFailure = (method, error, properties = {}) => {
  amplitude.track('Login Failure', {
    login_method: method,
    error_message: error,
    ...properties
  });
};

export const trackRegisterAttempt = (properties = {}) => {
  amplitude.track('Register Attempt', {
    ...properties
  });
};

export const trackRegisterSuccess = (properties = {}) => {
  amplitude.track('Register Success', {
    ...properties
  });
};

export const trackRegisterFailure = (error, properties = {}) => {
  amplitude.track('Register Failure', {
    error_message: error,
    ...properties
  });
};

export const trackOtpVerification = (success, properties = {}) => {
  amplitude.track('OTP Verification', {
    success,
    ...properties
  });
};

// Ride booking events
export const trackRideBookingStarted = (properties = {}) => {
  amplitude.track('Ride Booking Started', {
    ...properties
  });
};

export const trackPickupLocationSelected = (location, properties = {}) => {
  amplitude.track('Pickup Location Selected', {
    latitude: location?.latitude,
    longitude: location?.longitude,
    address: location?.address,
    ...properties
  });
};

export const trackDropoffLocationSelected = (location, properties = {}) => {
  amplitude.track('Dropoff Location Selected', {
    latitude: location?.latitude,
    longitude: location?.longitude,
    address: location?.address,
    ...properties
  });
};

export const trackVehicleSelected = (vehicleType, properties = {}) => {
  amplitude.track('Vehicle Selected', {
    vehicle_type: vehicleType,
    ...properties
  });
};

export const trackRideConfirmed = (rideDetails, properties = {}) => {
  amplitude.track('Ride Confirmed', {
    pickup_address: rideDetails?.pickupAddress?.address,
    dropoff_address: rideDetails?.dropoffAddress?.address,
    vehicle_type: rideDetails?.vehicleType,
    estimated_price: rideDetails?.estimatedPrice,
    estimated_distance: rideDetails?.estimatedDistance,
    ...properties
  });
};

export const trackRideCancelled = (reason, properties = {}) => {
  amplitude.track('Ride Cancelled', {
    cancellation_reason: reason,
    ...properties
  });
};

export const trackDriverFound = (driverId, properties = {}) => {
  amplitude.track('Driver Found', {
    driver_id: driverId,
    ...properties
  });
};

export const trackRideStarted = (rideId, properties = {}) => {
  amplitude.track('Ride Started', {
    ride_id: rideId,
    ...properties
  });
};

export const trackRideCompleted = (rideId, properties = {}) => {
  amplitude.track('Ride Completed', {
    ride_id: rideId,
    ...properties
  });
};

// Tracking events
export const trackLocationPermissionRequested = (properties = {}) => {
  amplitude.track('Location Permission Requested', {
    ...properties
  });
};

export const trackLocationPermissionGranted = (properties = {}) => {
  amplitude.track('Location Permission Granted', {
    ...properties
  });
};

export const trackLocationPermissionDenied = (properties = {}) => {
  amplitude.track('Location Permission Denied', {
    ...properties
  });
};

export const trackCurrentLocationUsed = (properties = {}) => {
  amplitude.track('Current Location Used', {
    ...properties
  });
};

// Profile events
export const trackProfileViewed = (properties = {}) => {
  amplitude.track('Profile Viewed', {
    ...properties
  });
};

export const trackProfileUpdated = (field, properties = {}) => {
  amplitude.track('Profile Updated', {
    updated_field: field,
    ...properties
  });
};

export const trackLanguageChanged = (language, properties = {}) => {
  amplitude.track('Language Changed', {
    new_language: language,
    ...properties
  });
};

export const trackLogout = (properties = {}) => {
  amplitude.track('Logout', {
    ...properties
  });
};

// History events
export const trackHistoryViewed = (properties = {}) => {
  amplitude.track('History Viewed', {
    ...properties
  });
};

export const trackRideHistoryItemClicked = (rideId, properties = {}) => {
  amplitude.track('Ride History Item Clicked', {
    ride_id: rideId,
    ...properties
  });
};

// Rating events
export const trackRatingSubmitted = (rating, rideId, properties = {}) => {
  amplitude.track('Rating Submitted', {
    rating,
    ride_id: rideId,
    ...properties
  });
};

export const trackRatingSkipped = (rideId, properties = {}) => {
  amplitude.track('Rating Skipped', {
    ride_id: rideId,
    ...properties
  });
};

// Notification events
export const trackNotificationReceived = (notificationType, properties = {}) => {
  amplitude.track('Notification Received', {
    notification_type: notificationType,
    ...properties
  });
};

export const trackNotificationOpened = (notificationType, properties = {}) => {
  amplitude.track('Notification Opened', {
    notification_type: notificationType,
    ...properties
  });
};

// Ticket events
export const trackTicketCreated = (ticketType, properties = {}) => {
  amplitude.track('Ticket Created', {
    ticket_type: ticketType,
    ...properties
  });
};

export const trackTicketViewed = (ticketId, properties = {}) => {
  amplitude.track('Ticket Viewed', {
    ticket_id: ticketId,
    ...properties
  });
};

// Onboarding events
export const trackOnboardingStarted = (properties = {}) => {
  amplitude.track('Onboarding Started', {
    ...properties
  });
};

export const trackOnboardingCompleted = (properties = {}) => {
  amplitude.track('Onboarding Completed', {
    ...properties
  });
};

export const trackOnboardingSkipped = (properties = {}) => {
  amplitude.track('Onboarding Skipped', {
    ...properties
  });
};

// Error tracking
export const trackError = (errorType, errorMessage, properties = {}) => {
  amplitude.track('App Error', {
    error_type: errorType,
    error_message: errorMessage,
    ...properties
  });
};

// User properties
export const setUserProperties = (properties) => {
  amplitude.setUserProperties(properties);
};

export const setUserId = (userId) => {
  amplitude.setUserId(userId);
};

// Custom event tracking
export const trackCustomEvent = (eventName, properties = {}) => {
  amplitude.track(eventName, properties);
};

// Ride booking step events
export const trackBookingStepViewed = (stepNumber, stepName, properties = {}) => {
  amplitude.track('Booking Step Viewed', {
    step_number: stepNumber,
    step_name: stepName,
    ...properties
  });
};

export const trackBookingStepCompleted = (stepNumber, stepName, properties = {}) => {
  amplitude.track('Booking Step Completed', {
    step_number: stepNumber,
    step_name: stepName,
    ...properties
  });
};

export const trackBookingStepSkipped = (stepNumber, stepName, properties = {}) => {
  amplitude.track('Booking Step Skipped', {
    step_number: stepNumber,
    step_name: stepName,
    ...properties
  });
};

export const trackBookingStepBack = (stepNumber, stepName, properties = {}) => {
  amplitude.track('Booking Step Back', {
    step_number: stepNumber,
    step_name: stepName,
    ...properties
  });
}; 
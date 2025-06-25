# Amplitude Analytics Tracking Implementation Summary

This document outlines all the Amplitude analytics events that have been implemented across the Tawsilet client mobile application screens.

## Analytics Utility File
**Location**: `src/utils/analytics.js`

This file contains all the tracking functions that wrap Amplitude's tracking API with standardized event names and properties.

## Screen-by-Screen Implementation

### 1. Login Screen (`src/screens/Login/index.js`)
**Events Tracked:**
- `Screen View` - When user views the login screen
- `Login Attempt` - When user attempts to login (email/phone switch, Google, Apple)
- `Login Success` - When login is successful
- `Login Failure` - When login fails (with error details)
- `Language Changed` - When user changes language

**Key Properties:**
- `login_method`: 'email', 'phone', 'google', 'apple'
- `incomplete_profile`: boolean
- `complete_profile`: boolean
- `error_message`: string

### 2. Register Screen (`src/screens/Register/index.js`)
**Events Tracked:**
- `Screen View` - When user views the register screen
- `Register Attempt` - When user attempts to register
- `Register Success` - When registration is successful
- `Register Failure` - When registration fails

**Key Properties:**
- `has_social_data`: boolean
- `social_provider`: string
- `error_message`: string

### 3. OTP Screen (`src/screens/Otp/index.js`)
**Events Tracked:**
- `Screen View` - When user views the OTP screen
- `OTP Verification` - When OTP is verified (success/failure)
- `Login Success` - When login via OTP is successful
- `Login Failure` - When login via OTP fails
- `Register Success` - When registration via OTP is successful
- `Register Failure` - When registration via OTP fails

**Key Properties:**
- `action_type`: 'update_profile', 'new_registration', 'login'
- `phone_number`: string
- `success`: boolean
- `error`: string

### 4. Main Screen (`src/screens/MainScreen/index.js`)
**Events Tracked:**
- `Screen View` - When user views the main screen
- `Booking Step Viewed` - When user views each booking step
- `Booking Step Completed` - When user completes each booking step
- `Booking Step Back` - When user goes back from a step
- `Ride Booking Started` - When user starts booking a ride
- `Pickup Location Selected` - When user selects pickup location
- `Dropoff Location Selected` - When user selects dropoff location
- `Vehicle Selected` - When user selects vehicle type
- `Ride Confirmed` - When user confirms the ride
- `Location Permission Requested` - When app requests location permission
- `Location Permission Granted` - When location permission is granted
- `Location Permission Denied` - When location permission is denied
- `Current Location Used` - When user uses current location

**Key Properties:**
- `step_number`: number (1-5)
- `step_name`: string
- `has_pickup`, `has_dropoff`, `has_vehicle`: boolean
- `latitude`, `longitude`, `address` for locations
- `vehicle_type`: string
- `estimated_price`, `estimated_distance` for ride details
- `platform`: 'ios' or 'android'

### 5. Profile Screen (`src/screens/Profile/index.js`)
**Events Tracked:**
- `Screen View` - When user views the profile screen
- `Profile Viewed` - When profile is viewed
- `Profile Updated` - When profile is updated
- `Language Changed` - When user changes language
- `Logout` - When user logs out

**Key Properties:**
- `updated_field`: string (e.g., 'profile_picture')
- `new_language`: string

### 6. History Screen (`src/screens/Historique/index.js`)
**Events Tracked:**
- `Screen View` - When user views the history screen
- `History Viewed` - When history is viewed

### 7. Rating Screen (`src/screens/Rating/index.js`)
**Events Tracked:**
- `Screen View` - When user views the rating screen
- `Rating Submitted` - When user submits a rating
- `Rating Skipped` - When user skips rating

**Key Properties:**
- `rating`: number (1-5)
- `ride_id`: string
- `feedback_tag`: string
- `has_custom_comment`: boolean
- `driver_id`: string

### 8. Notifications Screen (`src/screens/Notifications/index.js`)
**Events Tracked:**
- `Screen View` - When user views the notifications screen
- `Notification Received` - When notification is received

**Key Properties:**
- `notification_type`: string
- `notification_id`: string
- `created_at`: string

### 9. Ticket Screen (`src/screens/Ticket/index.js`)
**Events Tracked:**
- `Screen View` - When user views the tickets screen
- `Ticket Created` - When user creates a new ticket
- `Ticket Viewed` - When user views a ticket

**Key Properties:**
- `ticket_type`: string
- `ticket_id`: string

### 10. Onboarding Screen (`src/screens/Onboarding/index.js`)
**Events Tracked:**
- `Screen View` - When user views the onboarding screen
- `Onboarding Started` - When onboarding begins
- `Onboarding Completed` - When onboarding is completed
- `Onboarding Skipped` - When user skips onboarding

**Key Properties:**
- `total_slides`: number
- `current_slide`: number

### 11. Order Screen (`src/screens/Order/index.js`)
**Events Tracked:**
- `Screen View` - When user views the order screen
- `Driver Found` - When driver is assigned to order
- `Ride Completed` - When ride is completed
- `Ride Cancelled` - When ride is cancelled

**Key Properties:**
- `order_id`: string
- `driver_id`: string
- `request_id`: string
- `cancellation_reason`: string

### 12. Tracking Screen (`src/screens/Tracking/index.js`)
**Events Tracked:**
- `Screen View` - When user views the tracking screen
- `Ride Started` - When ride tracking begins

**Key Properties:**
- `order_id`: string
- `has_driver`: boolean
- `driver_id`: string
- `pickup_address`, `dropoff_address`: string

## Booking Flow Step Tracking

### Step 1: Pickup Location (`src/screens/MainScreen/components/PickupLocation.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Completed` - When step is completed
- `Pickup Location Selected` - When location is selected

**Key Properties:**
- `step_number`: 1
- `step_name`: 'Pickup Location'
- `address`, `latitude`, `longitude`: location details
- `is_in_tunisia`: boolean
- `source`: 'google_places' or 'map_drag'

### Step 2: Dropoff Location (`src/screens/MainScreen/components/DropoffLocation.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Completed` - When step is completed
- `Booking Step Back` - When user goes back
- `Dropoff Location Selected` - When location is selected

**Key Properties:**
- `step_number`: 2
- `step_name`: 'Dropoff Location'
- `address`, `latitude`, `longitude`: location details
- `is_in_tunisia`: boolean
- `source`: 'google_places' or 'map_drag'

### Step 3: Vehicle Selection (`src/screens/MainScreen/components/ChooseVehicle.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Completed` - When step is completed
- `Booking Step Back` - When user goes back
- `Vehicle Selected` - When vehicle is selected

**Key Properties:**
- `step_number`: 3
- `step_name`: 'Vehicle Selection'
- `vehicle_type`: string
- `vehicle_id`: number
- `has_scheduled_date`: boolean
- `distance`, `time`: trip details

### Step 4: Ride Confirmation (`src/screens/MainScreen/components/ConfirmRide.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Completed` - When step is completed
- `Booking Step Back` - When user goes back
- `Ride Confirmed` - When ride is confirmed

**Key Properties:**
- `step_number`: 4
- `step_name`: 'Ride Confirmation'
- `price`: number
- `distance`, `time`: trip details
- `vehicle_type`: string
- `has_scheduled_date`: boolean
- `reservation_id`: string

### Step 4.5: Login Required (`src/screens/MainScreen/components/LoginStep.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Completed` - When step is completed
- `Booking Step Back` - When user goes back
- `Login Attempt` - When login is attempted
- `Login Success` - When login is successful
- `Login Failure` - When login fails

**Key Properties:**
- `step_number`: 4.5
- `step_name`: 'Login Required'
- `method`: 'email', 'google', 'apple'
- `context`: 'booking_flow'
- `complete_profile`: boolean

### Step 5: Searching Drivers (`src/screens/MainScreen/components/SearchDrivers.js`)
**Events Tracked:**
- `Booking Step Viewed` - When step is viewed
- `Booking Step Back` - When user cancels search
- `Driver Found` - When driver accepts ride
- `Ride Cancelled` - When ride is cancelled

**Key Properties:**
- `step_number`: 5
- `step_name`: 'Searching Drivers'
- `search_duration`: number (milliseconds)
- `radius`: number
- `drivers_notified`: number
- `cancellation_reason`: 'user_cancelled', 'no_driver_found', 'search_error'

## Additional Utility Functions

### User Properties
- `setUserProperties(properties)` - Set user properties
- `setUserId(userId)` - Set user ID

### User Identification (userSlice.js)
The userSlice now includes comprehensive Amplitude user identification that automatically sets user properties when users log in, register, or update their profiles.

**User Properties Set:**
- `user_id` - Unique user identifier
- `email` - User's email address
- `phone_number` - User's phone number
- `first_name` - User's first name
- `last_name` - User's last name
- `username` - User's username
- `user_role` - User's role (client, driver, etc.)
- `is_blocked` - Whether user account is blocked
- `has_profile_picture` - Whether user has uploaded a profile picture
- `registration_date` - When user registered
- `last_login` - Last login timestamp
- `is_guest` - Whether user is a guest user
- `provider` - Login method (email, google, apple)
- `login_count` - Number of times user has logged in
- `total_sessions` - Total number of user sessions
- `profile_update_count` - Number of profile updates
- `profile_updated_at` - Last profile update timestamp

**Set Once Properties (only set on first login/registration):**
- `initial_login_method` - First login method used
- `initial_user_role` - Initial user role
- `registration_date` - Original registration date
- `first_login_date` - First login date

**Array Properties:**
- `login_methods_used` - Array of login methods user has used

**When User Properties Are Set:**
1. **User Registration** - When user successfully registers
2. **User Login** - When user successfully logs in
3. **OTP Verification** - When user verifies OTP
4. **Current User Fetch** - When app fetches current user data
5. **Profile Update** - When user updates their profile
6. **Guest User** - When user enters as guest

**When User Properties Are Cleared:**
- **User Logout** - All user properties are cleared and user ID is reset

### Custom Events
- `trackCustomEvent(eventName, properties)` - Track custom events
- `trackError(errorType, errorMessage, properties)` - Track errors

## Event Categories

### Authentication Events
- Login attempts, successes, failures
- Registration attempts, successes, failures
- OTP verification
- Logout

### Ride Booking Events
- Ride booking flow (start, location selection, vehicle selection, confirmation)
- Step-by-step tracking (view, complete, back navigation)
- Location permissions
- Driver assignment and tracking
- Ride completion and cancellation

### User Profile Events
- Profile views and updates
- Language changes
- Image uploads

### App Usage Events
- Screen views
- History views
- Rating submissions
- Notification interactions
- Ticket creation and viewing
- Onboarding flow

## Implementation Notes

1. **Consistent Naming**: All events follow a consistent naming convention
2. **Rich Properties**: Events include relevant properties for detailed analytics
3. **Error Tracking**: Failed operations are tracked with error details
4. **User Context**: User ID and relevant context are included where appropriate
5. **Performance**: Tracking calls are non-blocking and don't affect app performance
6. **Step Tracking**: Comprehensive tracking of user progress through booking flow
7. **Search Analytics**: Detailed tracking of driver search process and outcomes

## Usage Example

```javascript
import { trackScreenView, trackBookingStepCompleted } from '../../utils/analytics';

// Track screen view
useEffect(() => {
  trackScreenView('Login');
}, []);

// Track step completion
trackBookingStepCompleted(1, 'Pickup Location', {
  address: '123 Main St',
  latitude: 36.8055,
  longitude: 10.1806,
  is_in_tunisia: true
});
```

This implementation provides comprehensive analytics coverage for understanding user behavior, app performance, and business metrics across all major user interactions in the Tawsilet mobile application, with special emphasis on the ride booking flow and step-by-step user journey tracking. 
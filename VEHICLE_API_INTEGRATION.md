# Vehicle API Integration

## Overview
The vehicle selection functionality has been updated to fetch vehicle options from the API instead of using hardcoded data. This allows for dynamic vehicle management through the backend settings entity. The app now uses a loader approach and waits for the API response before showing the vehicle selection screen.

## Changes Made

### 1. ChooseVehicle Component (`src/screens/MainScreen/components/ChooseVehicle.js`)
- ✅ Added API call to fetch vehicle options from `/settings/vehicle-types`
- ✅ Removed fallback vehicle options - app now waits for API response
- ✅ Added proper localization support for vehicle names
- ✅ Updated animations to work with dynamic data
- ✅ Added loading state while fetching vehicles
- ✅ Added error state with retry functionality
- ✅ Added empty state when no vehicles are available

### 2. ConfirmRide Component (`src/screens/MainScreen/components/ConfirmRide.js`)
- ✅ Updated to use dynamic vehicle data from `formData.vehicleType`
- ✅ Removed fallback vehicle options
- ✅ Added error state when vehicle information is not available
- ✅ Improved localization support

### 3. DriverMarker Component (`src/components/DriverMarker.js`)
- ✅ Added default case for unknown vehicle types
- ✅ Improved error handling

### 4. OrderMapView Component (`src/screens/Order/components/MapView.js`)
- ✅ Added fallback for unknown vehicle types in `getVehicleIcon` function

### 5. Localization Files
- ✅ Added "retry" translation key to English, Arabic, and French locales

## API Endpoint

### GET `/settings/vehicle-types`

**Expected Response Format:**
```json
[
  {
    "id": 1,
    "name_ar": "سيارة اقتصادية",
    "name_fr": "Voiture Économique", 
    "name_en": "Economy Car",
    "places_numbers": 4,
    "icon": "https://example.com/eco-car.png",
    "key": "eco"
  },
  {
    "id": 2,
    "name_ar": "سيارة فاخرة",
    "name_fr": "Berline",
    "name_en": "Luxury Car",
    "places_numbers": 4,
    "icon": "https://example.com/berline-car.png",
    "key": "berline"
  },
  {
    "id": 3,
    "name_ar": "شاحنة نقل",
    "name_fr": "Fourgon",
    "name_en": "Van",
    "places_numbers": 7,
    "icon": "https://example.com/van-car.png",
    "key": "van"
  }
]
```

### Required Fields:
- `id`: Unique identifier for the vehicle type
- `name_ar`: Arabic name
- `name_fr`: French name  
- `name_en`: English name
- `places_numbers`: Number of passengers the vehicle can accommodate
- `icon`: URL to the vehicle icon image (optional)
- `key`: Unique key for the vehicle type (optional, will be auto-generated if not provided)

## Loading and Error States

### Loading State
- Shows a spinner with "Loading..." text while fetching vehicle data
- Prevents user interaction until data is loaded

### Error State
- Shows error message with retry button if API call fails
- User can retry the API call by tapping the retry button
- Displays user-friendly error message

### Empty State
- Shows when API returns empty array or no vehicles
- Displays "No vehicles available" message with car-off icon

## Localization

The app automatically selects the appropriate vehicle name based on the current language:
- Arabic: Uses `name_ar`
- French: Uses `name_fr`
- English: Uses `name_en` (default)

## Icon Handling

- If the API provides an `icon` URL, it will be used as a remote image
- If no icon is provided, the app will use default local icons based on the vehicle ID
- Unknown vehicle types will fall back to the economy car icon

## Testing

To test the integration:

1. Ensure the API endpoint `/settings/vehicle-types` is available and returns the expected format
2. Test with different languages to verify localization works correctly
3. Test with API errors to ensure error handling and retry functionality works
4. Test with empty API responses to verify empty state handling
5. Verify that vehicle selection and booking flow works as expected

## Error Handling

- API errors are logged to console and displayed to user
- Retry functionality allows users to attempt the API call again
- Loading states provide user feedback during API calls
- Empty states inform users when no vehicles are available
- The app will not proceed without valid vehicle data

## Important Notes

- **No Fallback Options**: The app no longer uses hardcoded fallback vehicle options
- **API Dependency**: The vehicle selection screen requires a successful API response to function
- **User Experience**: Users see appropriate loading, error, and empty states based on API response
- **Retry Mechanism**: Users can retry failed API calls without restarting the app 
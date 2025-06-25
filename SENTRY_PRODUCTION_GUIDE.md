# Sentry Production Issues - Fix Guide

## Issues Found and Fixed

### 1. **Incorrect Release/Distribution Configuration**
**Problem**: The Sentry configuration was using the bundle ID as release name instead of the version name.

**Fixed in `src/App.js`**:
```javascript
// Before
release: "com.fortekma.tawsilet", // Wrong - bundle ID
dist: "1.4.1", // Wrong - should be version code

// After  
release: "1.4.1", // Correct - matches versionName in build.gradle
dist: "5", // Correct - matches versionCode in build.gradle
```

### 2. **iOS Entitlements Configuration**
**Problem**: iOS entitlements had `aps-environment` set to `development`.

**Fixed in `ios/Tawsilet/Tawsilet.entitlements`**:
```xml
<!-- Before -->
<key>aps-environment</key>
<string>development</string>

<!-- After -->
<key>aps-environment</key>
<string>production</string>
```

### 3. **ProGuard Configuration**
**Problem**: No ProGuard rules to protect Sentry classes.

**Fixed in `android/app/proguard-rules.pro`**:
```proguard
# Sentry ProGuard rules
-keep class io.sentry.** { *; }
-keep class com.sentry.** { *; }
-dontwarn io.sentry.**
-dontwarn com.sentry.**
```

### 4. **ProGuard Enabled for Production**
**Problem**: ProGuard was disabled in release builds.

**Fixed in `android/app/build.gradle`**:
```gradle
// Before
def enableProguardInReleaseBuilds = false

// After
def enableProguardInReleaseBuilds = true
```

### 5. **Sentry Disabled in Debug Mode**
**Problem**: Sentry was running in both development and production modes.

**Fixed in `src/App.js`**:
```javascript
// Only initialize Sentry in production mode
if (!__DEV__) {
  Sentry.init({
    dsn: 'https://06ca632b0190704d22beae416f99b03e@o4509329011572736.ingest.de.sentry.io/4509329041588304',
    release: "1.4.1",
    dist: "5",
    enableNative: true,
    debug: false,
    environment: 'production',
  });
}

// Only wrap with Sentry in production mode
export default __DEV__ ? App : Sentry.wrap(App)
```

## Additional Configuration Added

### 1. **Environment Detection**
Sentry is now only initialized in production builds:
```javascript
if (!__DEV__) {
  // Sentry initialization only happens here
}
```

### 2. **Test Script**
Created `test-sentry.js` to help verify Sentry is working in production with proper initialization checks.

## Steps to Test

### 1. **Build Production App**
```bash
# For Android
cd android && ./gradlew assembleRelease

# For iOS
cd ios && xcodebuild -workspace Tawsilet.xcworkspace -scheme Tawsilet -configuration Release
```

### 2. **Test Sentry Integration**
Import and use the test functions from `test-sentry.js`:
```javascript
import { testSentryError, testSentryMessage, testSentryPerformance } from './test-sentry';

// Test error reporting
testSentryError();

// Test message reporting  
testSentryMessage();

// Test performance monitoring
testSentryPerformance();
```

### 3. **Verify in Sentry Dashboard**
1. Go to your Sentry project dashboard
2. Check the "Issues" tab for new errors
3. Verify the release version matches your app version
4. Check that errors appear with proper stack traces

## Development vs Production Behavior

### **Development Mode (`__DEV__ = true`)**
- ✅ Sentry is **NOT initialized**
- ✅ No errors sent to Sentry dashboard
- ✅ Faster app startup
- ✅ Clean development logs

### **Production Mode (`__DEV__ = false`)**
- ✅ Sentry is **fully initialized**
- ✅ All errors sent to Sentry dashboard
- ✅ Performance monitoring enabled
- ✅ Proper error tracking

## Common Issues to Check

### 1. **Network Connectivity**
- Ensure the production app has internet access
- Check if corporate firewalls are blocking Sentry endpoints

### 2. **Bundle ID Mismatch**
- Verify the bundle ID in your app matches the one configured in Sentry

### 3. **Release Version**
- Make sure the release version in Sentry matches your app version
- Check that you're looking at the correct project in Sentry

### 4. **Debug Symbols**
- Ensure debug symbols are being uploaded to Sentry
- Check the "Releases" section in Sentry for your version

## Troubleshooting Commands

### Check Sentry CLI
```bash
npx @sentry/cli info
```

### Test Sentry Upload
```bash
npx @sentry/cli upload-dif --include-sources
```

### Verify Configuration
```bash
npx @sentry/cli releases list
```

## Next Steps

1. **Rebuild your production app** with the fixes applied
2. **Test the app** using the provided test functions
3. **Monitor Sentry dashboard** for new issues
4. **Verify stack traces** are readable and complete
5. **Check performance monitoring** if enabled

## Important Notes

- **Sentry is now disabled in development** - you won't see development errors in Sentry
- **Always test in a staging environment** before deploying to production
- **Monitor Sentry quotas** to avoid hitting limits
- **Set up alerts** in Sentry for critical errors
- **Regularly review and clean up** old releases in Sentry 
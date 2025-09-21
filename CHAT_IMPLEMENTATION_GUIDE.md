# Chat Modal Implementation Guide for User App

## 📁 File Structure

```
src/
├── screens/
│   └── Chat/
│       └── index.js                 // Main chat modal component
├── components/
│   └── ChatButton.js               // Chat button with unread badge
└── utils/
    └── chatNotifications.js        // OneSignal notification helper
```

## 🏗️ Architecture Overview

### Firebase Data Structure
```
rideRequests/
└── {requestId}/
    └── chat/
        └── {messageId}/
            ├── text: "Hello driver"
            ├── senderId: "user123"
            ├── senderType: "user" | "driver"
            ├── senderName: "John Doe"
            ├── timestamp: serverTimestamp()
            └── createdAt: 1234567890
```

### Core Components
1. **ChatModal** - Full-screen modal with message history
2. **ChatButton** - Trigger button with unread count badge
3. **Message Rendering** - iOS-style bubbles with timestamps
4. **Quick Replies** - Pre-defined response buttons
5. **Push Notifications** - OneSignal integration

## 🚀 Implementation Requirements

### Core Features
- **Real-time messaging** using Firebase Realtime Database
- **Push notifications** via OneSignal when driver sends messages
- **Unread count badge** on chat button (optimized Firebase queries)
- **iOS-style UI** with message bubbles and timestamps
- **Quick reply buttons** for common responses

### Technical Specifications

#### Firebase Integration
- **Path**: `rideRequests/${requestId}/chat`
- **Message structure**:
```javascript
{
  text: "message content",
  senderId: currentUser.id,
  senderType: "user", // vs "driver"
  senderName: currentUser.firstName,
  timestamp: serverTimestamp(),
  createdAt: Date.now()
}
```

#### OneSignal Notifications
- **Target**: Driver app using `external_id` (driver.id)
- **Payload**:
```javascript
{
  app_id: ONESIGNAL_DRIVER_APP_ID,
  include_aliases: { external_id: [String(driverId)] },
  target_channel: "push",
  headings: { en: `Message from ${userName}` },
  contents: { en: messageText },
  data: { 
    type: "chat_message", 
    requestId, 
    senderId,
    senderName: currentUser.firstName
  }
}
```

#### Unread Count Management
- Store unread count as simple number: `users/{userId}/unreadCount`
- Listen to count changes with Firebase listener
- Increment when driver sends message, reset when user opens chat

#### UI Requirements
- **Header**: Driver name, close button, call button
- **Safety message**: "Please do not text and drive"
- **Message bubbles**: User (blue/black), Driver (gray)
- **Quick replies**: "I'm here", "5 minutes away", "Thank you"
- **Input area**: Text input + send button
- **Unread badge**: Red circle with count on chat button

#### Props Structure
```javascript
<ChatModal
  visible={isChatVisible}
  onClose={() => setIsChatVisible(false)}
  requestId={rideData?.requestId}
  driverName={rideData?.driver?.firstName}
  driverData={rideData?.driver}
/>
```

#### Environment Variables Needed
```env
ONESIGNAL_DRIVER_APP_ID=your_driver_app_id
ONESIGNAL_DRIVER_APP_API_KEY=your_driver_api_key
```

## 🔧 Key Implementation Points

### 1. Modal Presentation
- Use `presentationStyle="pageSheet"` for iOS
- Full-screen modal with proper navigation

### 2. Keyboard Handling
- `KeyboardAvoidingView` with proper offset
- Adjust for different screen sizes

### 3. Auto-scroll Behavior
- Scroll to bottom on new messages
- Smooth animation for better UX

### 4. Error Handling
- Silent notification failures
- Show message send errors to user
- Retry mechanisms for failed sends

### 5. Performance Optimization
- Efficient Firebase listeners with cleanup
- Minimize data transfer with targeted queries
- Proper memory management

### 6. Accessibility
- Proper labels and roles
- Screen reader support
- Keyboard navigation

## 📱 UI Styling Guidelines

### Color Scheme
- **Background**: White (`#fff`)
- **User messages**: Black (`#000`) with white text
- **Driver messages**: Light gray (`#f0f0f0`) with black text
- **Unread badge**: Red (`#E74C3C`)
- **Borders**: Light gray (`#f0f0f0`)

### Typography
- **Header title**: 18px, bold
- **Message text**: 16px, regular
- **Timestamps**: 12px, gray
- **Quick replies**: 14px, medium weight

### Layout
- **Message padding**: 16px horizontal, 10px vertical
- **Bubble radius**: 20px (4px for tail)
- **Badge size**: 20px minimum width, 20px height
- **Input height**: Auto-expanding up to 100px

## 🚀 Integration Steps

### Step 1: Create Chat Modal Component
```javascript
// src/screens/Chat/index.js
import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { ref, push, onValue, off, serverTimestamp } from 'firebase/database';
import axios from 'axios';

const ChatModal = ({ visible, onClose, requestId, driverName, driverData }) => {
  // Implementation here
};
```

### Step 2: Add Chat Button with Badge
```javascript
// In your ride tracking component
<TouchableOpacity onPress={() => setIsChatVisible(true)}>
  <Icon name="chat" size={24} />
  {unreadCount > 0 && (
    <View style={styles.unreadBadge}>
      <Text style={styles.unreadText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  )}
</TouchableOpacity>
```

### Step 3: Implement Firebase Listeners
```javascript
// Simple unread count listener
useEffect(() => {
  if (!currentUser?.documentId) return;

  const unreadRef = ref(db, `users/${currentUser.documentId}/unreadCount`);

  const handleUnreadCount = (snapshot) => {
    const count = snapshot.val() || 0;
    setUnreadCount(count);
  };

  onValue(unreadRef, handleUnreadCount);

  return () => off(unreadRef, 'value', handleUnreadCount);
}, [currentUser?.documentId]);
```

### Step 4: Add OneSignal Notifications with Unread Count
```javascript
const sendNotificationToDriver = async (messageText) => {
  // Increment driver's unread count
  const driverUnreadRef = ref(db, `drivers/${driverData.documentId}/unreadCount`);
  const driverSnapshot = await get(driverUnreadRef);
  const currentCount = driverSnapshot.val() || 0;
  await update(ref(db, `drivers/${driverData.documentId}`), {
    unreadCount: currentCount + 1
  });

  // Send push notification
  await axios.post('https://onesignal.com/api/v1/notifications', {
    app_id: ONESIGNAL_DRIVER_APP_ID,
    include_aliases: { external_id: [String(driverData.id)] },
    target_channel: "push",
    headings: { en: `Message from ${currentUser.firstName}` },
    contents: { en: messageText },
    data: { type: "chat_message", requestId, senderId: currentUser.id }
  }, {
    headers: {
      'Authorization': `Basic ${ONESIGNAL_DRIVER_APP_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};

// Reset unread count when opening chat
const handleChatOpen = async () => {
  if (currentUser?.documentId) {
    await update(ref(db, `users/${currentUser.documentId}`), {
      unreadCount: 0
    });
  }
  setIsChatVisible(true);
};
```

### Step 5: Style with Design System
- Use consistent spacing and colors
- Follow iOS design patterns
- Ensure accessibility compliance

## 🧪 Testing Checklist

- [ ] Real-time message sync between apps
- [ ] Push notifications delivery
- [ ] Unread count accuracy
- [ ] Keyboard behavior
- [ ] Message ordering
- [ ] Error handling
- [ ] Performance with large message history
- [ ] Accessibility features

## 📚 Dependencies Required

```json
{
  "firebase": "^10.x.x",
  "axios": "^1.x.x",
  "react-native-vector-icons": "^10.x.x"
}
```

## 🔐 Security Considerations

- Validate message content before sending
- Sanitize user input
- Rate limit message sending
- Secure OneSignal API keys
- Implement proper Firebase security rules

---

This implementation will create a seamless chat experience that matches the driver app functionality and provides real-time communication between users and drivers.

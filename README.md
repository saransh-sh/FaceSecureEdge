# Offline Facial Authentication Prototype

This project is a React Native (Expo) prototype for offline facial authentication, designed for future integration into Datalake 3.0. It utilizes `react-native-vision-camera`, MediaPipe, and MobileFaceNet (via TFLite) to perform face verification and liveness detection completely offline.

## Prerequisites

- **Node.js**: v18 or newer.
- **Physical Device**: Highly recommended! Emulators/Simulators do not fully support the camera hardware required by `react-native-vision-camera`.
- **Android Studio**: Installed with Android SDK (if testing on Android).
- **Xcode**: Installed (if testing on iOS; requires macOS).

## Setup & Installation

1. **Navigate to the project directory:**
   ```bash
   cd FaceAuthApp
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(Note: The required ML models (`mobilefacenet.tflite` and `face_landmarker.task`) are already downloaded into the `assets/models/` folder, and the native plugins are pre-configured in `app.json` and `metro.config.js`).*

## Running the App

Because this app uses custom native C++ modules (Vision Camera, Fast TFLite, and Reanimated Worklets), **you cannot run it in the standard Expo Go app**. You must build a custom native app (development build).

### Android
Connect your physical Android device via USB (ensure USB Debugging is enabled in Developer Options), then run:
```bash
npx expo run:android
```
*This command will compile the native Android code using Gradle and install the `.apk` directly onto your device.*

### iOS (macOS only)
Connect your physical iPhone via USB, then run:
```bash
npx expo run:ios
```
*Note: You may need to open the generated `ios` folder in Xcode and select your Apple Development Team in the Signing & Capabilities tab to sign the app before it can successfully install on a physical iPhone.*

---

## Testing the Application Flow

Once the app is running on your device, follow these steps to test the end-to-end authentication flow:

### 1. Dashboard
- You will see the main Dashboard upon opening the app.
- Enter a mock Employee ID. The offline SQLite database is automatically pre-seeded with dummy users: **`EMP001`**, **`EMP002`**, and **`EMP003`**.
- Enter `EMP001` into the text box and tap **Authenticate Face**.

### 2. Camera & ML Processing (CameraAuth Screen)
- Upon first launch, the app will request Camera permissions. Tap **Allow**.
- You will see the live camera feed with a green alignment box.
- The TFLite models (`face_landmarker` and `mobilefacenet`) will load into memory.
- The app intercepts the live camera frames and attempts to extract a 192-dimensional facial embedding.
- **Fallback:** If you are testing on an emulator without a camera, or if you want to bypass the frame processor, simply tap the **"Force Verify (Mock)"** button that appears.

### 3. Verification (Result Screen)
- Behind the scenes, the app calculates the **Cosine Similarity** between the live embedding vector (from the camera) and the stored embedding vector (from SQLite).
- You will be presented with a green **"SUCCESS"** screen or a red **"FAILED"** screen depending on whether the similarity score meets the threshold.
- Tap **Back to Dashboard** to return.

### 4. Offline Logs & Mock Sync (Logs Screen)
- On the Dashboard, tap **View Logs**.
- You will see a chronological list of all your authentication attempts, including the Employee ID, Success Status, Timestamp, and Sync Status.
- Notice the Sync Status says **NO**.
- Tap the **Mock Sync to Datalake** button at the top. The app will update all logs in the SQLite database, and the Sync Status will change to **YES**, simulating a successful batch upload to Datalake 3.0.

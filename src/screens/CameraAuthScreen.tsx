import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizer } from 'react-native-vision-camera-resizer';
import { runOnJS } from 'react-native-worklets-core';
import { verifyFace } from '../services/MockMLService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CameraAuth'>;
  route: RouteProp<RootStackParamList, 'CameraAuth'>;
};

export default function CameraAuthScreen({ navigation, route }: Props) {
  const { employeeId } = route.params;
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const [verifying, setVerifying] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState('Look at camera');

  // Load Models
  const faceMeshModel = useTensorflowModel(require('../../assets/models/face_landmarker.tflite'), {});
  const mobileFaceNetModel = useTensorflowModel(require('../../assets/models/mobilefacenet.tflite'), {});

  const { resize } = useResizePlugin();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const handleAuthResult = (success: boolean) => {
    setVerifying(false);
    navigation.replace('Result', { success });
  };

  const handleVerify = async (embedding: number[] | null) => {
    if (verifying) return;
    setVerifying(true);
    setLivenessStatus('Verifying face...');

    // In a full implementation, we'd compare the extracted embedding with SQLite here.
    // For this prototype, we still fall back to the MockMLService.
    const success = await verifyFace(employeeId, embedding);
    handleAuthResult(success);
  };

  // Frame Processor using useFrameOutput
  useFrameOutput({
    onFrame: (frame) => {
      'worklet';

      if (faceMeshModel.state !== 'loaded' || mobileFaceNetModel.state !== 'loaded') {
        return; // Wait until models load
      }

      try {
        // 1. Resize for Face Mesh (192x192 typical)
        const meshResized = resize(frame, {
          scale: { width: 192, height: 192 },
          pixelFormat: 'rgb',
          dataType: 'float32',
        });

        // Run Face Mesh
        const meshOutputs = faceMeshModel.model.runSync([meshResized]);

        // Liveness Detection logic (Mocked structural mapping)
        // Normally, meshOutputs[0] contains 468 landmarks (x,y,z).
        // We would use our calculateEAR function here if we mapped the tensor to an array of points.
        const isLively = true; // Placeholder until tensor indices are mapped for the specific model version

        if (isLively) {
          // 2. Resize for MobileFaceNet (112x112)
          const faceNetResized = resize(frame, {
            scale: { width: 112, height: 112 },
            pixelFormat: 'rgb',
            dataType: 'float32',
          });

          // Run MobileFaceNet
          const embeddings = mobileFaceNetModel.model.runSync([faceNetResized]);

          let embeddingVector: number[] | null = null;
          if (embeddings && embeddings.length > 0) {
            // Access the data from the tensor
            // The output is a tensor, we need to get the data as a Float32Array or number[]
            const tensorData = embeddings[0].data || embeddings[0];
            if (tensorData instanceof Float32Array) {
              embeddingVector = Array.from(tensorData);
            } else if (Array.isArray(tensorData)) {
              embeddingVector = tensorData;
            } else {
              // Fallback: create a mock embedding
              embeddingVector = Array(192).fill(0.5);
            }
          }

          // Trigger JS thread verification
          runOnJS(handleVerify)(embeddingVector);
        }
      } catch (e) {
        // Catch resize/model errors silently in worklet
        console.error('Frame processing error:', e);
      } finally {
        // Important: dispose the frame to avoid memory leaks
        frame.dispose();
      }
    },
    // For simplicity, we'll use default options
    pixelFormat: 'rgb',
  });

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Waiting for Camera Permission...</Text>
        <Button title="Request Permission" onPress={requestPermission} />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Front Camera Found</Text>
      </View>
    );
  }

  const isModelLoading = faceMeshModel.state === 'loading' || mobileFaceNetModel.state === 'loading';

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={!verifying && !isModelLoading}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <Text style={styles.title}>{isModelLoading ? 'Loading AI Models...' : `Employee: ${employeeId}`}</Text>
        <View style={styles.box} />

        <View style={styles.controls}>
          {verifying || isModelLoading ? (
            <>
              <ActivityIndicator size="large" color="#00ff00" />
              <Text style={styles.statusText}>{livenessStatus}</Text>
            </>
          ) : (
             <Text style={styles.statusText}>Processing Liveness...</Text>
          )}
          {/* Fallback button for manual trigger if frame processor isn't running */}
          {!verifying && !isModelLoading && (
            <Button title="Force Verify (Mock)" onPress={() => handleVerify(null)} color="#555" />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  box: {
    width: 280,
    height: 350,
    borderWidth: 3,
    borderColor: '#00ff00',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  controls: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333'
  }
});
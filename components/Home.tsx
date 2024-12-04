import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Button, Image, SafeAreaView, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Camera, CameraType } from 'expo-camera';
import * as Location from 'expo-location';

const Home: React.FC = () => {
  const [albums, setAlbums] = useState<MediaLibrary.Album[] | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Correct typing for the camera ref
  const cameraRef = useRef<Camera | null>(null);  // Use Camera directly instead of typeof Camera

  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
    };
    requestPermissions();
  }, []);

  const captureImage = async () => {
    if (!cameraRef.current) return;

    const { uri } = await cameraRef.current.takePictureAsync();  // Capture image
    setImageUri(uri);

    if (hasLocationPermission) {
      const loc = await Location.getCurrentPositionAsync({});  // Get current location
      setLocation(loc);
    }
  };

  const storeImage = async () => {
    if (imageUri && location) {
      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString();

      const metadata = {
        timestamp,
        latitude,
        longitude,
        uri: imageUri,
      };

      console.log('Image Metadata:', metadata);

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      const album = await MediaLibrary.getAlbumAsync('Camera');
      if (!album) {
        await MediaLibrary.createAlbumAsync('Camera', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }

      Alert.alert('Image Saved', 'Your image has been saved with metadata.');
    } else {
      Alert.alert('Error', 'No image or location data available.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {hasCameraPermission === null ? (
        <Text>Requesting camera permission...</Text>
      ) : hasCameraPermission === false ? (
        <Text>No access to camera</Text>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} type={CameraType.back} ref={cameraRef}>
            <View style={styles.captureButtonContainer}>
              <Button title="Capture Image" onPress={captureImage} />
            </View>
          </Camera>
        </View>
      )}

      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Button title="Save Image" onPress={storeImage} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F9',
    padding: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: 400,
  },
  captureButtonContainer: {
    marginBottom: 20,
  },
  imagePreview: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
});

export default Home;

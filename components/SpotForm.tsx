import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Image, Platform, Alert, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { storeImage, getImageUri } from '../utils/imageStorage';

export interface SpotData {
  id: string;
  spotName: string;
  description: string;
  photoKey: string; // This will store a key to retrieve the photo
}

interface SpotFormProps {
  initialData?: SpotData;
  onSave: () => void;
  onCancel: () => void;
}

const SpotForm: React.FC<SpotFormProps> = ({ initialData, onSave, onCancel }) => {
  const [spotData, setSpotData] = useState<SpotData>(
    initialData || {
      id: '',
      spotName: '',
      description: '',
      photoKey: '',
    }
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveSpotData = async () => {
    setIsSaving(true);
    try {
      const spots = JSON.parse(await AsyncStorage.getItem('spots') || '[]');
      let newSpotData = { ...spotData };

      if (photoUri) {
        const photoKey = `spot_photo_${Date.now()}`;
        await storeImage(photoKey, photoUri);
        newSpotData.photoKey = photoKey;
      }

      if (newSpotData.id) {
        const index = spots.findIndex((spot: SpotData) => spot.id === newSpotData.id);
        if (index !== -1) {
          spots[index] = newSpotData;
        }
      } else {
        newSpotData.id = Date.now().toString();
        spots.push(newSpotData);
      }

      await AsyncStorage.setItem('spots', JSON.stringify(spots));
      console.log('Spot data saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving spot data:', error);
      Alert.alert('Error', 'Failed to save spot data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SpotData, value: string) => {
    setSpotData({ ...spotData, [field]: value });
  };

  const pickImage = async (useCamera: boolean) => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    };

    if (useCamera && Platform.OS !== 'web') {
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Spot Name"
        value={spotData.spotName}
        onChangeText={(value) => handleInputChange('spotName', value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={spotData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        multiline
        numberOfLines={4}
      />
      <View style={styles.photoButtons}>
        <Pressable style={styles.button} onPress={() => pickImage(false)}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </Pressable>
        {Platform.OS !== 'web' && (
          <Pressable style={styles.button} onPress={() => pickImage(true)}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </Pressable>
        )}
      </View>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photo} />
      ) : spotData.photoKey ? (
        <Image source={{ uri: getImageUri(spotData.photoKey) }} style={styles.photo} />
      ) : (
        <Text style={styles.photoText}>No photo selected</Text>
      )}
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, isSaving && styles.disabledButton]} 
          onPress={saveSpotData} 
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>{isSaving ? "Saving..." : "Save Spot"}</Text>
        </Pressable>
        <Pressable 
          style={[styles.button, isSaving && styles.disabledButton]} 
          onPress={onCancel}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  photo: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginBottom: 10,
  },
  photoText: {
    marginVertical: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SpotForm;

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Image, Platform, Alert, Pressable, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { storeImage, getImageUri } from '../utils/imageStorage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AirbnbRating } from 'react-native-ratings';
import { parseISO, isValid, format } from 'date-fns';

export interface SpotData {
    id: string;
    spotName: string;
    description: string;
    photoKey: string;
    date: Date | null;
    rating: number;
    favoriteMenuItem: string;
}

interface SpotFormProps {
    initialData: SpotData;
    onSave: (data: SpotData) => void;
    onCancel: () => void;
    onDelete?: () => void; // New prop for delete functionality
}

const SpotForm: React.FC<SpotFormProps> = ({ initialData, onSave, onCancel, onDelete }) => {
    const colorScheme = useColorScheme();
    const [spotData, setSpotData] = useState<SpotData>(() => ({
        ...initialData,
        date: initialData.date instanceof Date && isValid(initialData.date) 
            ? initialData.date 
            : typeof initialData.date === 'string' && isValid(parseISO(initialData.date))
                ? parseISO(initialData.date)
                : new Date(),
    }));
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

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
            onSave(spotData);
        } catch (error) {
            console.error('Error saving spot data:', error);
            Alert.alert('Error', 'Failed to save spot data. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof SpotData, value: string | number | Date | null) => {
        if (field === 'date') {
            let parsedDate: Date | null = null;

            if (typeof value === 'string') {
                // Allow empty input
                if (value.trim() === '') {
                    parsedDate = null; // Set to null or handle as needed
                } else {
                    // Attempt to parse the date
                    parsedDate = parseISO(value);
                    // If the parsed date is invalid, we can choose to do nothing or log an error
                    if (!isValid(parsedDate)) {
                        console.error('Invalid date:', value);
                        return; // Do not update state if the date is invalid
                    }
                }
            } else if (value instanceof Date) {
                parsedDate = value;
            } else {
                return; // Invalid value, do nothing
            }

            // Update the state with the valid parsed date or null
            setSpotData({ ...spotData, [field]: parsedDate });
        } else {
            setSpotData({ ...spotData, [field]: value });
        }
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

    const inputStyle = [
        styles.input,
        colorScheme === 'dark' && styles.inputDark
    ];

    const photoTextStyle = [
        styles.photoText,
        colorScheme === 'dark' && styles.photoTextDark
    ];

    const handleDelete = () => {
        console.log('Delete button pressed in SpotForm');
        setDeleteMessage('Delete button was pressed. Deleting...');

        if (onDelete) {
            console.log('Calling onDelete prop');
            onDelete();
            setDeleteMessage('Delete function called. Check if item was removed from the list.');
        } else {
            console.log('onDelete prop is not defined');
            setDeleteMessage('Error: Delete function not available.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={inputStyle}
                placeholder="Spot Name"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                value={spotData.spotName}
                onChangeText={(value) => handleInputChange('spotName', value)}
            />
            <Text style={photoTextStyle}>Date</Text>
            {Platform.OS === 'web' ? (
                <TextInput
                    style={inputStyle}
                    placeholder="Date (YYYY-MM-DD)"
                    placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                    value={isValid(spotData.date) ? format(spotData.date, 'yyyy-MM-dd') : ''}
                    onChangeText={(value) => handleInputChange('date', value)}
                />
            ) : (
                <DateTimePicker
                    value={isValid(spotData.date) ? spotData.date : new Date()} // Ensure a Date is always passed
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (event.type === 'set' && selectedDate) {
                            handleInputChange('date', selectedDate);
                        }
                    }}
                />
            )}
            <TextInput
                style={inputStyle}
                placeholder="Description"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                value={spotData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
            />
            <Text style={photoTextStyle}>Rating</Text>
            <AirbnbRating
                count={5}
                reviews={["Terrible", "Bad", "OK", "Good", "Great"]}
                defaultRating={spotData.rating}
                size={20}
                onFinishRating={(rating) => handleInputChange('rating', rating)}
            />

            <TextInput
                style={inputStyle}
                placeholder="Favorite Menu Item"
                placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
                value={spotData.favoriteMenuItem}
                onChangeText={(value) => handleInputChange('favoriteMenuItem', value)}
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
                <Text style={photoTextStyle}>No photo selected</Text>
            )}
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={() => saveSpotData()}>
                    <Text style={styles.buttonText}>Save</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={onCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                {onDelete && (
                    <Pressable
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDelete}
                    >
                        <Text style={styles.buttonText}>Delete</Text>
                    </Pressable>
                )}
            </View>
            {deleteMessage && <Text style={styles.deleteMessage}>{deleteMessage}</Text>}
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
        color: '#000', // Default text color for light mode
    },
    inputDark: {
        color: '#fff', // Text color for dark mode
        borderColor: '#666', // Adjust border color for better visibility in dark mode
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
    photoTextDark: {
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
    deleteMessage: {
        color: 'red',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default SpotForm;

// Date, 1-5 star rating, multiple pics, name of favorite menu item, someone else's menu item and tag a friend, share with friends

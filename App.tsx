import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import SpotForm, { SpotData } from './components/SpotForm';
import SpotList from './components/SpotList';

const App: React.FC = () => {
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [editingSpot, setEditingSpot] = useState<SpotData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      const storedSpots = await AsyncStorage.getItem('spots');
      if (storedSpots) {
        setSpots(JSON.parse(storedSpots));
      }
    } catch (error) {
      console.error('Error loading spots:', error);
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    console.log('Deleting spot with ID:', spotId);
    try {
      const updatedSpots = spots.filter(spot => spot.id !== spotId);
      await AsyncStorage.setItem('spots', JSON.stringify(updatedSpots));
      setSpots(updatedSpots);
      setEditingSpot(null); // Close the form after deletion
      console.log('Spot deleted successfully');
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
  };

  const handleSaveSpot = useCallback(() => {
    setEditingSpot(null);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingSpot(null);
  }, []);

  const handleAddNewSpot = () => {
    setEditingSpot({ id: '', spotName: '', description: '', photoKey: '', date: new Date(), rating: 0, favoriteMenuItem: '' });
  };

  const handleEditSpot = (spot: SpotData) => {
    setEditingSpot(spot);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Welcome to FoodieSpot!</Text>
        </View>
      {editingSpot ? (
          <View style={styles.formContainer}>
        <SpotForm
          initialData={editingSpot}
          onSave={handleSaveSpot}
          onCancel={handleCancel}          
          onDelete={() => {
            if (editingSpot) {
              handleDeleteSpot(editingSpot.id);
            }
          }}
          />
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Pressable style={styles.addButton} onPress={handleAddNewSpot}>
              <Text style={styles.addButtonText}>Add New Spot</Text>
            </Pressable>
            <SpotList onEditSpot={handleEditSpot} refreshKey={refreshKey} />
          </View>
        )}
        <StatusBar style="auto" />
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    color: '#fff',
    fontSize: 25,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default React.memo(App);
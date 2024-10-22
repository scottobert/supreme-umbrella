import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import SpotForm, { SpotData } from './components/SpotForm';
import SpotList from './components/SpotList';

export default function App() {
  const [editingSpot, setEditingSpot] = useState<SpotData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditSpot = (spot: SpotData) => {
    setEditingSpot(spot);
  };

  const handleAddNewSpot = () => {
    setEditingSpot({ id: '', spotName: '', description: '', photoKey: '' });
  };

  const handleSaveSpot = useCallback(() => {
    setEditingSpot(null);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingSpot(null);
  }, []);

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

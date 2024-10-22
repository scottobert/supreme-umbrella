import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotData } from './SpotForm';
import { getImageUri } from '../utils/imageStorage';

interface SpotListProps {
  onEditSpot: (spot: SpotData) => void;
  refreshKey: number;
}

const SpotList: React.FC<SpotListProps> = ({ onEditSpot, refreshKey }) => {
  const [spots, setSpots] = useState<SpotData[]>([]);

  useEffect(() => {
    loadSpots();
  }, [refreshKey]);

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

  const renderSpotItem = ({ item }: { item: SpotData }) => (
    <Pressable 
      style={styles.spotItem} 
      onPress={() => onEditSpot(item)}
    >
      <Image source={{ uri: getImageUri(item.photoKey) }} style={styles.spotImage} />
      <Text style={styles.spotName}>{item.spotName}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        renderItem={renderSpotItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        extraData={refreshKey}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  spotItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  spotImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  spotName: {
    marginTop: 5,
    textAlign: 'center',
    color: '#fff',
  },
});

export default SpotList;

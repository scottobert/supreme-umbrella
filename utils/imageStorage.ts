import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

async function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const scaleFactor = Math.min(1, 800 / Math.max(img.width, img.height));
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });
}

export const storeImage = async (key: string, uri: string) => {
  if (Platform.OS === 'web') {
    const compressedUri = await compressImage(uri);
    const chunks = Math.ceil(compressedUri.length / CHUNK_SIZE);
    for (let i = 0; i < chunks; i++) {
      const chunk = compressedUri.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      localStorage.setItem(`${key}_${i}`, chunk);
    }
    localStorage.setItem(`${key}_chunks`, chunks.toString());
  } else {
    await AsyncStorage.setItem(key, uri);
  }
};

export const getImageUri = (key: string): string => {
  if (Platform.OS === 'web') {
    const chunks = parseInt(localStorage.getItem(`${key}_chunks`) || '0', 10);
    if (chunks === 0) return '';
    let dataUrl = '';
    for (let i = 0; i < chunks; i++) {
      dataUrl += localStorage.getItem(`${key}_${i}`) || '';
    }
    return dataUrl;
  } else {
    return key;
  }
};

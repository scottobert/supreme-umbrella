import { StyleSheet, Image, ImageSourcePropType } from 'react-native';

export interface IImageViewerProps {
    placeholderImageSource: ImageSourcePropType;
    selectedImage: string | null;
}

const ImageViewer: React.FC<IImageViewerProps> = ({ placeholderImageSource, selectedImage }) => {
    const imageSource = selectedImage ? { uri: selectedImage } : placeholderImageSource;
    return (
        <Image source={imageSource} style={styles.image} testID="image-viewer" />
    );
}

const styles = StyleSheet.create({
    image: {
        width: 320,
        height: 440,
        borderRadius: 18,
    },
});

export default ImageViewer;
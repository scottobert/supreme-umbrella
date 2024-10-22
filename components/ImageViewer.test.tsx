import React from 'react';
import { render } from '@testing-library/react-native';
import ImageViewer from './ImageViewer';

describe('ImageViewer', () => {
  const placeholderImage = { uri: 'placeholder.jpg' };

  it('renders placeholder image when no selected image', () => {
    const { getByTestId } = render(
      <ImageViewer placeholderImageSource={placeholderImage} selectedImage={null} />
    );

    const image = getByTestId('image-viewer');
    expect(image.props.source).toEqual(placeholderImage);
  });

  it('renders selected image when provided', () => {
    const selectedImage = 'selected.jpg';
    const { getByTestId } = render(
      <ImageViewer placeholderImageSource={placeholderImage} selectedImage={selectedImage} />
    );

    const image = getByTestId('image-viewer');
    expect(image.props.source).toEqual({ uri: selectedImage });
  });

  it('applies correct styles to the image', () => {
    const { getByTestId } = render(
      <ImageViewer placeholderImageSource={placeholderImage} selectedImage={null} />
    );

    const image = getByTestId('image-viewer');
    expect(image.props.style).toEqual({
      width: 320,
      height: 440,
      borderRadius: 18,
    });
  });
});
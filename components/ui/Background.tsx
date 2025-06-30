import React from 'react';
import { ImageBackground, View } from 'react-native';

interface BackgroundProps {
  className?: string;
}

export default function Background({ className = "" }: BackgroundProps) {
  return (
    <ImageBackground
      source={require('@/assets/images/back.jpg')}
      className={`absolute inset-0 ${className}`}
      resizeMode="cover"
    >
      {/* Optional overlay for better text readability */}
      <View className="absolute inset-0 bg-black/20" />
    </ImageBackground>
  );
}

import React from 'react';
import { View } from 'react-native';

interface BackgroundProps {
  className?: string;
}

export default function Background({ className = "" }: BackgroundProps) {
  return (
    <View 
      className={`absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 ${className}`}
    />
  );
}

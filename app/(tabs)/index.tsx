import Background from '@/components/ui/Background';
import React from 'react';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 relative">
      <Background />
      <View className="flex-1 justify-center items-center z-10">
        <Text className="text-2xl font-bold text-white">Home Screen</Text>
      </View>
    </View>
  );
}

import Background from '@/components/ui/Background';
import React from 'react';
import { View, Text } from 'react-native';

export default function Settings() {
  return (
    <View className="flex-1 relative">
      <Background />
      <View className="flex-1 justify-center items-center z-10 p-5">
        <Text className="text-2xl font-bold text-white mb-3">Settings Page</Text>
        <Text className="text-base text-white/80 text-center">
          App settings will go here
        </Text>
      </View>
    </View>
  );
}

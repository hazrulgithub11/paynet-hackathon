import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { InteractiveMenu, InteractiveMenuItem } from "@/components/ui/modern-mobile-menu";

const demoMenuItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: 'house.fill', screen: 'index' },
  { label: 'Account', icon: 'person.fill', screen: 'account' },
  { label: 'QR Code', icon: 'camera.fill', screen: 'qr' },
  { label: 'Expenses', icon: 'dollarsign.circle.fill', screen: 'expenses' },
  { label: 'Settings', icon: 'gearshape.fill', screen: 'settings' },
];

const customAccentColor = '#FF6B6B';

const Default = () => {
  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg font-semibold mb-4">Default InteractiveMenu</Text>
      </View>
      <InteractiveMenu />
    </View>
  );
};

const Customized = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg font-semibold mb-4">Customized InteractiveMenu</Text>
        <Text className="text-sm text-gray-600">
          Active: {demoMenuItems[activeIndex]?.label}
        </Text>
      </View>
      <InteractiveMenu 
        items={demoMenuItems} 
        accentColor={customAccentColor}
        activeIndex={activeIndex}
        onItemPress={(item, index) => {
          setActiveIndex(index);
          console.log('Pressed:', item.label);
        }}
      />
    </View>
  );
};

export { Default, Customized }; 
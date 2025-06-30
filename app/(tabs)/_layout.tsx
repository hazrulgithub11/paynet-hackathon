import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { InteractiveMenu } from '@/components/ui/modern-mobile-menu';
import Background from '@/components/ui/Background';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const customTabBar = ({ state, descriptors, navigation }: any) => {
    const menuItems = [
      { label: 'Home', icon: 'house.fill' as const, screen: 'index' },
      { label: 'Account', icon: 'person.fill' as const, screen: 'account' },
      { label: 'QR Code', icon: 'camera.fill' as const, screen: 'qr' },
      { label: 'Expenses', icon: 'dollarsign.circle.fill' as const, screen: 'expenses' },
      { label: 'Settings', icon: 'gearshape.fill' as const, screen: 'settings' },
    ];

    return (
      <InteractiveMenu
        items={menuItems}
        activeIndex={state.index}
        accentColor={Colors[colorScheme ?? 'light'].tint}
        onItemPress={(item, index) => {
          const route = state.routes[index];
          navigation.navigate(route.name);
        }}
      />
    );
  };

  return (
    <View className="flex-1">
      <Background />
      <Tabs
        tabBar={customTabBar}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {},
          }),
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr"
        options={{
          title: 'QR Code',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
          </Tabs>
    </View>
  );
}

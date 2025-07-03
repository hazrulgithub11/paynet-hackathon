import { IconSymbol } from '@/components/ui/IconSymbol';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, TouchableOpacity, View } from 'react-native';

type IconName = 'house.fill' | 'person.fill' | 'camera.fill' | 'dollarsign.circle.fill' | 'gearshape.fill';

export interface InteractiveMenuItem {
  label: string;
  icon: IconName;
  screen?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onItemPress?: (item: InteractiveMenuItem, index: number) => void;
  activeIndex?: number;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'Home', icon: 'house.fill', screen: 'index' },
  { label: 'Account', icon: 'person.fill', screen: 'account' },
  { label: 'QR Code', icon: 'camera.fill', screen: 'qr' },
  { label: 'Expenses', icon: 'dollarsign.circle.fill', screen: 'expenses' },
  { label: 'Settings', icon: 'gearshape.fill', screen: 'settings' },
];

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ 
  items, 
  accentColor = '#007AFF', 
  onItemPress,
  activeIndex: externalActiveIndex 
}) => {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const activeIndex = externalActiveIndex !== undefined ? externalActiveIndex : internalActiveIndex;
  
  const animatedValues = useRef(
    finalItems.map(() => new Animated.Value(0))
  ).current;

  const lineWidthAnimations = useRef(
    finalItems.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (activeIndex >= finalItems.length) {
      setInternalActiveIndex(0);
    }
  }, [finalItems, activeIndex]);

  useEffect(() => {
    // Animate icons
    animatedValues.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activeIndex ? 1 : 0,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
    });

    // Animate line width
    lineWidthAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === activeIndex ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [activeIndex, animatedValues, lineWidthAnimations]);

  const handleItemPress = (item: InteractiveMenuItem, index: number) => {
    if (externalActiveIndex === undefined) {
      setInternalActiveIndex(index);
    }
    onItemPress?.(item, index);
  };

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = screenWidth / finalItems.length;

  return (
    <View className="bg-transparent px-4 py-3">
      <BlurView
        intensity={80}
        tint="dark"
        className="flex-row rounded-full mx-2 px-2 py-2 overflow-hidden"
        style={{
          backgroundColor: 'rgba(0,0,0,255)', // Semi-transparent dark background
          borderWidth: 1,
          borderColor: 'rgba(255,255,241,255)', // Subtle light border for glass effect
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {finalItems.map((item, index) => {
          const isActive = index === activeIndex;
          
          const iconScale = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.2],
          });

          const iconTranslateY = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });

          const lineWidth = lineWidthAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, itemWidth * 0.4],
          });



                      return (
              <TouchableOpacity
                key={item.label}
                className="flex-1 items-center py-3 px-2"
                onPress={() => handleItemPress(item, index)}
                activeOpacity={0.7}
              >
              <Animated.View
                className="items-center"
                style={{
                  transform: [
                    { scale: iconScale },
                    { translateY: iconTranslateY }
                  ],
                }}
              >
                <IconSymbol 
                  name={item.icon} 
                  size={24} 
                  color={isActive ? accentColor : '#D1D5DB'} 
                />
              </Animated.View>
              

              
              <Animated.View
                className="mt-1 rounded-full"
                style={{
                  width: lineWidth,
                  height: 2,
                  backgroundColor: accentColor,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

export { InteractiveMenu };

import { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface PaymentCardProps {
  accountName: string;
  balance: string;
  icon?: string;
  backgroundColor?: string;
}

export default function PaymentCard({ 
  accountName, 
  balance, 
  backgroundColor = 'rgba(59, 130, 246, 1)' // Blue equivalent to bg-blue-500
}: PaymentCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View 
        style={{ transform: [{ scale: scaleAnim }] }}
        className="mx-4 mb-4"
      >
        <View 
          className="rounded-2xl p-6 shadow-lg"
          style={{ backgroundColor }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold mb-1">
                {accountName}
              </Text>
              <Text className="text-white/70 text-sm mb-2">
                Digital Wallet
              </Text>
              <Text className="text-white text-2xl font-light">
                {balance}
              </Text>
            </View>
            
            <View className="w-12 h-12 bg-white/20 rounded-full justify-center items-center">
              <Text className="text-white text-lg font-bold">
                {accountName.charAt(0)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function PurpleButton({ title, onPress, className = "" }: {
  title: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-yellow-400 px-6 py-3 rounded-full shadow-lg ${className}`}
      style={{
        shadowColor: '#fff345',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text className="text-black font-semibold text-center text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
}

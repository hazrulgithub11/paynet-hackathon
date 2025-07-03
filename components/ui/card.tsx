import { BlurView } from 'expo-blur';
import { useRef } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';

interface PaymentCardProps {
  accountName: string;
  balance: string;
  icon?: string;
}

export default function PaymentCard({ 
  accountName, 
  balance
}: PaymentCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        useNativeDriver: true,
        duration: 300,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 15,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        useNativeDriver: true,
        duration: 300,
      })
    ]).start();
  };

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1deg']
  });

  const Card = Platform.OS === 'web' ? WebCard : NativeCard;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      className="px-4 py-2"
    >
      <Animated.View 
        style={{ 
          transform: [
            { scale: scaleAnim },
            { rotateY: rotateInterpolation }
          ],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <Card accountName={accountName} balance={balance} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function NativeCard({ accountName, balance }: { accountName: string, balance: string }) {
  return (
    <View className="overflow-hidden rounded-3xl border border-white/10">
      <BlurView intensity={40} tint="dark" className="overflow-hidden">
        <View className="p-6 h-44 bg-black/70">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-white text-xl font-semibold">
                {accountName}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
            <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
            <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
            <View className="h-1 w-8 bg-white/15 rounded-full" />
          </View>
          
          <View className="flex-1 justify-end">
            <Text className="text-white/60 text-sm mb-1">Available Balance</Text>
            <Text className="text-white text-2xl font-semibold">
              {balance}
            </Text>
          </View>
        </View>
      </BlurView>

      {/* Shiny edge effect */}
      <View className="absolute top-0 left-0 w-full h-[1px] bg-white/15" />
      <View className="absolute top-0 right-0 w-[1px] h-full bg-white/5" />

      {/* Card chip */}
      <View className="absolute top-6 right-6 opacity-20">
        <View className="w-10 h-8 rounded-md border border-white/15 justify-center items-center">
          <View className="w-7 h-1 bg-white/15 rounded-full mb-1" />
          <View className="w-5 h-1 bg-white/15 rounded-full" />
        </View>
      </View>
    </View>
  );
}

function WebCard({ accountName, balance }: { accountName: string, balance: string }) {
  return (
    <View 
      className="rounded-3xl overflow-hidden border border-white/10"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <View className="p-6 h-44 bg-black/40">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-white text-xl font-semibold">
              {accountName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center mb-4">
          <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
          <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
          <View className="h-1 w-8 bg-white/15 rounded-full mr-1" />
          <View className="h-1 w-8 bg-white/15 rounded-full" />
        </View>
        
        <View className="flex-1 justify-end">
          <Text className="text-white/60 text-sm mb-1">Available Balance</Text>
          <Text className="text-white text-2xl font-semibold">
            {balance}
          </Text>
        </View>
      </View>
      
      {/* Shiny edge effects for web */}
      <View className="absolute top-0 left-0 w-full h-[1px] bg-white/15" />
      <View className="absolute top-0 right-0 w-[1px] h-full bg-white/5" />
      
      {/* Card chip */}
      <View className="absolute top-6 right-6 opacity-20">
        <View className="w-10 h-8 rounded-md border border-white/15 justify-center items-center">
          <View className="w-7 h-1 bg-white/15 rounded-full mb-1" />
          <View className="w-5 h-1 bg-white/15 rounded-full" />
        </View>
      </View>
    </View>
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

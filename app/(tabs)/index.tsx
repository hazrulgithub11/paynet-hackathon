import Background from '@/components/ui/Background';
import { PurpleButton } from '@/components/ui/card';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View className="flex-1 relative">
      <Background />
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden">
          {/* Profile picture */}
          <Image 
            source={require('@/assets/images/back.jpg')} // Replace with your profile image
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-white text-sm">Welcome back</Text>
          <Text className="text-white text-lg font-semibold">aizad</Text>
        </View>
        <View className="flex-row items-center ">
          {/* Search button */}
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm border border-gray-200">
            <Ionicons 
              name="search" 
              size={20} 
              color="black" 
            />
          </TouchableOpacity>
          
          {/* Notifications button */}
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm border border-gray-200 ml-4">
            <Ionicons 
              name="notifications" 
              size={20} 
              color="black" 
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1 justify-start items-center z-10 mt-40">
        <Text className="text-white text-base mb-2 text-">Available Balance</Text>
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-white text-4xl font-semibold mr-3">
            {isBalanceVisible ? 'RM 90,000.00' : '•••••••••'}
          </Text>
          <TouchableOpacity onPress={toggleBalanceVisibility} className="p-2">
            <Ionicons 
              name={isBalanceVisible ? 'eye' : 'eye-off'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Button now inside the same container */}
        <View className="mt-1">
          <PurpleButton
            title="View all account"
            onPress={() => console.log('Button pressed')}
          />
        </View>
      </View>
    </View>
  );
}

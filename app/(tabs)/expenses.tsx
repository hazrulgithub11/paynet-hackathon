import Background from '@/components/ui/Background';
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function Expenses() {
  return (
    <View className="flex-1 relative">
      <Background />
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden">
          {/* Profile picture */}
          <Image 
            source={require('@/assets/images/back.jpg')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-white text-sm">Welcome back</Text>
          <Text className="text-white text-lg font-semibold">aizad</Text>
        </View>
        <View className="flex-row items-center">
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
      <View className="flex-1 justify-center items-center z-10 p-5">
        <Text className="text-2xl font-bold text-black mb-3">Expenses Page</Text>
        <Text className="text-base text-gray-600 text-center">
          Track your expenses here
        </Text>
      </View>
    </View>
  );
}

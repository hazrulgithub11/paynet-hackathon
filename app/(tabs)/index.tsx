import Background from '@/components/ui/Background';
import PaymentCard, { PurpleButton } from '@/components/ui/card';
import { accounts } from '@/data/accounts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
            source={require('@/assets/images/profilepic.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="ml-4 flex-1">
          
          <Text className="text-black text-lg font-semibold">aizad</Text>
        </View>
        
      </View>
      <View className="flex-1 justify-start items-center z-10 mt-40">
        <Text className="text-black text-base mb-2 text-">Available Balance</Text>
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-black text-4xl font-semibold mr-3">
            {isBalanceVisible ? 'RM 90,000.00' : '•••••••••'}
          </Text>
          <TouchableOpacity onPress={toggleBalanceVisibility} className="p-2">
            <Ionicons 
              name={isBalanceVisible ? 'eye' : 'eye-off'} 
              size={24} 
              color="#FBBF24" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Account Cards  */}
        <View className="w-full px-5 mt-6">
          {accounts.slice(0, 1).map((account) => (
            <PaymentCard 
              key={account.id}
              accountName={account.accountName} 
              balance={account.balance} 
            />
          ))}
        </View>
        
        {/* Button now inside the same container */}
        <View className="mt-4">
          <PurpleButton
            title="View all account"
            onPress={() => router.push('/account')}
          />
        </View>
      </View>
    </View>
  );
}

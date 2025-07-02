import Background from '@/components/ui/Background';
import PaymentCard from '@/components/ui/card';
import { accounts } from '@/data/accounts';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  return (
    <View className="flex-1 relative">
      <Background />
      <View className="absolute top-16 left-5 z-20 w-12 h-12 rounded-full bg-orange-500 overflow-hidden">
        {/* Profile circle */}
      </View>
      <View className="flex-1 justify-start items-center z-10 mt-32">
        <Text className="text-white/80 text-base mb-2 text-center">Your Balance</Text>
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-white text-2xl font-light mr-3">
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
        
        <View className="flex-1 w-full">
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PaymentCard 
                accountName={item.accountName} 
                balance={item.balance} 
                backgroundColor={item.backgroundColor} 
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </View>
  );
}

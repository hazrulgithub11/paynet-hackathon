import Background from '@/components/ui/Background';
import { mockUsers, useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

export default function Account() {
  const { selectedUser, userCountry, setSelectedUser, getUserCurrency } = useUser();
  const currency = getUserCurrency();
  const availableUsers = mockUsers[userCountry] || [];

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* Header */}
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden">
          <Image 
            source={require('@/assets/images/profilepic.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-black text-lg font-semibold">
            {selectedUser?.name || 'Select User'}
          </Text>
          <Text className="text-gray-600 text-sm">
            {userCountry} Banking
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm border border-gray-200">
            <Ionicons name="search" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Main Content */}
      <View className="flex-1 justify-start items-center z-10 mt-32">
        <Text className="text-2xl font-bold text-black mb-2">Your Accounts</Text>
        <Text className="text-gray-600 mb-6">
          {userCountry} • {availableUsers.length} accounts available
        </Text>
        
        <View className="flex-1 w-full">
          <FlatList
            data={availableUsers}
            keyExtractor={(item) => item.userId}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleUserSelect(item)}
                className="mx-5 mb-4"
              >
                <View className={`${
                  selectedUser?.userId === item.userId 
                    ? 'bg-blue-50 border-2 border-blue-300' 
                    : 'bg-white'
                } rounded-xl p-4 shadow-sm`}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-semibold">{item.name}</Text>
                    {selectedUser?.userId === item.userId && (
                      <View className="bg-blue-600 rounded-full p-1">
                        <Ionicons name="checkmark" size={16} color="white" />
                      </View>
                    )}
                  </View>
                  
                  <Text className="text-gray-600 mb-1">{item.accountNumber}</Text>
                  <Text className="text-sm text-gray-500 mb-3">{item.email}</Text>
                  
                  <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-bold text-black">
                      {currency} {item.balance.toLocaleString()}
                    </Text>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-600 text-sm font-medium">Active</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </View>
  );
}

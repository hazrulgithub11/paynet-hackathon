import Background from '@/components/ui/Background';
import PaymentCard, { PurpleButton } from '@/components/ui/card';
import { mockUsers, useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { selectedUser, userCountry, setSelectedUser, setUserCountry, getUserCurrency } = useUser();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setIsUserModalVisible(false);
  };

  const handleCountrySelect = (country: string) => {
    setUserCountry(country);
    setSelectedUser(null); // Reset user selection when country changes
    setIsCountryModalVisible(false);
  };

  const handleQuickPay = () => {
    if (!selectedUser) {
      Alert.alert('No User Selected', 'Please select a user first to make payments');
      return;
    }
    router.push('/qr');
  };

  const availableUsers = mockUsers[userCountry] || [];
  const balance = selectedUser?.balance || 0;
  const currency = getUserCurrency();

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* Header */}
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <TouchableOpacity
          onPress={() => setIsUserModalVisible(true)}
          className="w-12 h-12 rounded-full bg-orange-500 overflow-hidden border-2 border-white"
        >
          <Image 
            source={require('@/assets/images/profilepic.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        <View className="ml-4 flex-1">
          <TouchableOpacity onPress={() => setIsUserModalVisible(true)}>
            <Text className="text-black text-lg font-semibold">
              {selectedUser?.name || 'Select User'}
            </Text>
            <Text className="text-gray-600 text-sm">
              {selectedUser?.accountNumber || 'No account selected'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Country selector */}
        <TouchableOpacity
          onPress={() => setIsCountryModalVisible(true)}
          className="bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200"
        >
          <Text className="text-sm font-medium">
            {userCountry === 'Thailand' ? '🇹🇭 TH' : '🇲🇾 MY'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <View className="flex-1 justify-start items-center z-10 mt-40">
        <Text className="text-black text-base mb-2">Available Balance</Text>
        <View className="flex-row items-center justify-center mb-8">
          <Text className="text-black text-4xl font-semibold mr-3">
            {isBalanceVisible ? `${currency} ${balance.toLocaleString()}` : '•••••••••'}
          </Text>
          <TouchableOpacity onPress={toggleBalanceVisibility} className="p-2">
            <Ionicons 
              name={isBalanceVisible ? 'eye' : 'eye-off'} 
              size={24} 
              color="#FBBF24" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Quick Actions */}
        <View className="flex-row justify-around w-full px-5 mb-6">
          <TouchableOpacity
            onPress={handleQuickPay}
            className="bg-blue-600 rounded-xl p-4 items-center flex-1 mr-2"
          >
            <Ionicons name="qr-code" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Scan & Pay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/merchant-qr')}
            className="bg-purple-600 rounded-xl p-4 items-center flex-1 mx-1"
          >
            <Ionicons name="qr-code-outline" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">QR Generator</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/expenses')}
            className="bg-green-600 rounded-xl p-4 items-center flex-1 ml-2"
          >
            <Ionicons name="receipt" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Transactions</Text>
          </TouchableOpacity>
        </View>
        
        {/* Account Card */}
        {selectedUser && (
          <View className="w-full px-5 mt-6">
            <PaymentCard 
              accountName={`${selectedUser.name} (${userCountry})`}
              balance={`${currency} ${balance.toLocaleString()}`}
            />
          </View>
        )}
        
        {/* View All Accounts Button */}
        <View className="mt-4">
          <PurpleButton
            title="View all accounts"
            onPress={() => router.push('/account')}
          />
        </View>
      </View>
      
      {/* User Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUserModalVisible}
        onRequestClose={() => setIsUserModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select User</Text>
              <TouchableOpacity onPress={() => setIsUserModalVisible(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableUsers}
              keyExtractor={(item) => item.userId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleUserSelect(item)}
                  className={`p-4 rounded-xl mb-2 ${
                    selectedUser?.userId === item.userId ? 'bg-blue-100' : 'bg-gray-50'
                  }`}
                >
                  <Text className="font-semibold text-lg">{item.name}</Text>
                  <Text className="text-gray-600">{item.accountNumber}</Text>
                  <Text className="text-sm text-gray-500">
                    Balance: {currency} {item.balance.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 300 }}
            />
          </View>
        </View>
      </Modal>
      
      {/* Country Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCountryModalVisible}
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Country</Text>
              <TouchableOpacity onPress={() => setIsCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={() => handleCountrySelect('Thailand')}
              className={`p-4 rounded-xl mb-2 ${
                userCountry === 'Thailand' ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              <Text className="font-semibold text-lg">🇹🇭 Thailand</Text>
              <Text className="text-gray-600">Thai Bank - THB</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => handleCountrySelect('Malaysia')}
              className={`p-4 rounded-xl ${
                userCountry === 'Malaysia' ? 'bg-blue-100' : 'bg-gray-50'
              }`}
            >
              <Text className="font-semibold text-lg">🇲🇾 Malaysia</Text>
              <Text className="text-gray-600">Maybank - MYR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

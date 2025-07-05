import Background from '@/components/ui/Background';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

// Define transaction item type
type TransactionItem = {
  id: string;
  name: string;
  type: 'payment' | 'income' | 'cross_border';
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  direction?: string;
  merchantId?: string;
  sessionId?: string;
  image?: any;
};

// Mock transaction data that would come from backend
const mockTransactions: TransactionItem[] = [
  {
    id: '1',
    name: 'KL Shopping Center',
    type: 'cross_border',
    amount: -150,
    currency: 'MYR',
    date: 'Today, 2:30 PM',
    status: 'completed',
    direction: 'THAILAND_TO_MALAYSIA',
    merchantId: 'merchant_malay_001',
    sessionId: 'session_001',
    image: require('@/assets/images/expense/expense3.jpeg'),
  },
  {
    id: '2',
    name: 'Bangkok Mall',
    type: 'cross_border',
    amount: -500,
    currency: 'THB',
    date: 'Yesterday, 10:15 AM',
    status: 'completed',
    direction: 'MALAYSIA_TO_THAILAND',
    merchantId: 'merchant_thai_001',
    sessionId: 'session_002',
    image: require('@/assets/images/expense/expense4.jpg'),
  },
  {
    id: '3',
    name: 'Penang Food Court',
    type: 'cross_border',
    amount: -75,
    currency: 'MYR',
    date: '15 July, 9:00 AM',
    status: 'pending',
    direction: 'THAILAND_TO_MALAYSIA',
    merchantId: 'merchant_malay_002',
    sessionId: 'session_003',
    image: require('@/assets/images/expense/shopee.png'),
  },
  {
    id: '4',
    name: 'Netflix Subscription',
    type: 'payment',
    amount: -54.90,
    currency: 'MYR',
    date: '14 July, 8:45 PM',
    status: 'completed',
    image: require('@/assets/images/expense/netflix.png'),
  },
];

// Transaction categories for the filter chips
const categories = [
  'All', 'Cross-Border', 'Local', 'Pending', 'Completed'
];

export default function Expenses() {
  const { selectedUser, userCountry, getUserCurrency } = useUser();
  const [transactions, setTransactions] = useState<TransactionItem[]>(mockTransactions);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const currency = getUserCurrency();

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Cross-Border') return transaction.type === 'cross_border';
    if (selectedCategory === 'Local') return transaction.type === 'payment';
    if (selectedCategory === 'Pending') return transaction.status === 'pending';
    if (selectedCategory === 'Completed') return transaction.status === 'completed';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, this would fetch from backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleTransactionPress = (transaction: TransactionItem) => {
    if (transaction.sessionId) {
      // Navigate to transaction details or payment status
      Alert.alert(
        'Transaction Details',
        `${transaction.name}\n\nAmount: ${transaction.currency} ${Math.abs(transaction.amount)}\nStatus: ${transaction.status}\nType: ${transaction.type}\nSession: ${transaction.sessionId}`,
        [
          { text: 'OK' },
          ...(transaction.sessionId ? [{ text: 'View Details', onPress: () => {
            // In a real app, this would navigate to transaction details
            console.log('Navigate to transaction details:', transaction.sessionId);
          }}] : [])
        ]
      );
    }
  };

  const renderTransactionItem = ({ item }: { item: TransactionItem }) => (
    <TouchableOpacity 
      className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
      onPress={() => handleTransactionPress(item)}
    >
      {/* Transaction image/icon */}
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 justify-center items-center relative">
        {item.image ? (
          <Image 
            source={item.image}
            className="w-10 h-10"
            resizeMode="cover"
          />
        ) : (
          <Ionicons 
            name={item.type === 'cross_border' ? 'globe' : 'card'} 
            size={24} 
            color="#6B7280" 
          />
        )}
        
        {/* Status indicator */}
        <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={12} 
            color={item.status === 'completed' ? '#10B981' : item.status === 'pending' ? '#F59E0B' : '#EF4444'}
          />
        </View>
      </View>
      
      {/* Transaction details */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-semibold text-black text-base flex-1">{item.name}</Text>
          {item.type === 'cross_border' && (
            <View className="bg-blue-100 px-2 py-1 rounded-full">
              <Text className="text-blue-600 text-xs font-medium">Cross-Border</Text>
            </View>
          )}
        </View>
        <Text className="text-gray-500 text-xs">{item.date}</Text>
        <Text className={`text-xs font-medium ${getStatusColor(item.status)}`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      
      {/* Amount */}
      <View className="items-end">
        <Text 
          className={`font-bold text-base ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          {item.amount < 0 ? '-' : '+'}{item.currency} {Math.abs(item.amount).toLocaleString()}
        </Text>
        {item.direction && (
          <Text className="text-xs text-gray-500">
            {item.direction.includes('THAILAND') ? 
              (item.direction.includes('TO') ? 'TH → MY' : 'MY → TH') : 
              ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      onPress={() => setSelectedCategory(category)}
      className={`px-4 py-2 rounded-full mr-3 ${
        selectedCategory === category 
          ? 'bg-blue-600' 
          : 'bg-gray-200'
      }`}
    >
      <Text className={`text-sm font-medium ${
        selectedCategory === category 
          ? 'text-white' 
          : 'text-gray-600'
      }`}>
        {category}
      </Text>
    </TouchableOpacity>
  );

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
            {userCountry} • {currency}
          </Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm"
          onPress={() => router.push('/qr')}
        >
          <Ionicons name="qr-code" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <View className="flex-1 pt-32 px-5 z-10">
        {/* Summary */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-gray-600 text-sm mb-2">Total Transactions</Text>
          <Text className="text-2xl font-bold text-black">{filteredTransactions.length}</Text>
          <View className="flex-row mt-2">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Completed</Text>
              <Text className="text-sm font-semibold text-green-600">
                {filteredTransactions.filter(t => t.status === 'completed').length}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Pending</Text>
              <Text className="text-sm font-semibold text-orange-600">
                {filteredTransactions.filter(t => t.status === 'pending').length}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Cross-Border</Text>
              <Text className="text-sm font-semibold text-blue-600">
                {filteredTransactions.filter(t => t.type === 'cross_border').length}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Category Filter */}
        <View className="mb-4">
          <FlatList
            data={categories}
            renderItem={({ item }) => renderCategoryChip(item)}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        {/* Transactions List */}
        <Text className="text-black font-semibold text-lg mb-4">
          {selectedCategory === 'All' ? 'All Transactions' : `${selectedCategory} Transactions`}
        </Text>
        
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center py-8">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 text-lg mt-4">No transactions found</Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                {selectedCategory === 'All' 
                  ? 'Start making payments to see them here' 
                  : `No ${selectedCategory.toLowerCase()} transactions found`}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

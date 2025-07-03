import Background from '@/components/ui/Background';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

// Define expense item type
type ExpenseItem = {
  id: string;
  name: string;
  amount: string;
  date: string;
  image: any; // Use any for the image require
};

// Sample expense data
const expenseData: ExpenseItem[] = [
  {
    id: '1',
    name: 'Netflix Subscription',
    amount: '-RM 54.90',
    date: 'Today, 2:30 PM',
    image: require('@/assets/images/expense/netflix.png'),
  },
  {
    id: '2',
    name: 'Shopee Purchase',
    amount: '-RM 129.00',
    date: 'Yesterday, 10:15 AM',
    image: require('@/assets/images/expense/shopee.png'),
  },
  {
    id: '3',
    name: 'Salary Deposit',
    amount: '+RM 4,500.00',
    date: '15 July, 9:00 AM',
    image: require('@/assets/images/expense/expense3.jpeg'),
  },
  {
    id: '4',
    name: 'Dinner Payment',
    amount: '-RM 85.50',
    date: '14 July, 8:45 PM',
    image: require('@/assets/images/expense/expense4.jpg'),
  },
];

// Expense categories for the filter chips
const categories = [
  'All', 'Income', 'Entertainment', 'Shopping', 'Food & Drinks'
];

export default function Expenses() {
  const renderExpenseItem = ({ item }: { item: ExpenseItem }) => (
    <TouchableOpacity 
      className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
    >
      {/* Circular image */}
      <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 justify-center items-center">
        <Image 
          source={item.image}
          className="w-9 h-9"
          resizeMode="cover"
        />
      </View>
      
      {/* Transaction details */}
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-black text-base">{item.name}</Text>
        <Text className="text-gray-500 text-xs">{item.date}</Text>
      </View>
      
      {/* Amount - determine color based on + or - prefix */}
      <Text 
        className={`font-bold text-base ${item.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}
      >
        {item.amount}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 relative">
      <Background />
      {/* Header */}
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
      
      {/* Content */}
      <View className="flex-1 pt-32 px-5 z-10">
        {/* Recent transactions */}
        <Text className="text-black font-semibold text-lg mb-5">Recent Transactions</Text>
        
        <FlatList
          data={expenseData}
          renderItem={renderExpenseItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

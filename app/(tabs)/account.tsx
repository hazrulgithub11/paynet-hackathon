import Background from '@/components/ui/Background';
import { mockUsers, useUser, type Account } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, Text, TouchableOpacity, View, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRef } from 'react';
import malaysiaData from '@/server/data/mydummy.json';
import thailandData from '@/server/data/thaidummy.json';

export default function Account() {
  const { selectedUser, userCountry, selectedAccount, setSelectedAccount, getUserCurrency, getUserAccounts } = useUser();
  const currency = getUserCurrency();
  
  // Get accounts from context
  const userAccounts: Account[] = getUserAccounts();

  const totalBalance = userAccounts.reduce((sum, account) => sum + account.balance, 0);

  const getAccountIcon = (type: string, provider: string) => {
    if (type === 'bank') {
      return 'card-outline';
    } else {
      switch (provider) {
        case 'Touch n Go':
          return 'phone-portrait-outline';
        case 'Shopee':
          return 'storefront-outline';
        case 'Grab':
          return 'car-outline';
        case 'BigPay':
          return 'wallet-outline';
        default:
          return 'wallet-outline';
      }
    }
  };

  const handleAccountSelect = (account: Account) => {
    console.log('Selecting account:', account.accountName, account.accountId);
    console.log('Previous selected account:', selectedAccount?.accountName, selectedAccount?.accountId);
    setSelectedAccount(account);
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
          <Text className="text-white text-lg font-semibold">
            {selectedUser?.name || 'John Doe'}
          </Text>
          <Text className="text-white text-sm">
            {userCountry} • {userAccounts.length} accounts
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm border border-gray-200">
            <Ionicons name="search" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      
     
      {/* Main Content */}
      <View className="flex-1 justify-start items-center z-10 mt-40">
        <Text className="text-2xl font-bold text-white mb-2">Your Accounts</Text>
        <Text className="text-white mb-6">
          Banks & Digital Wallets
        </Text>
        
        <View className="flex-1 w-full">
          <FlatList
            data={userAccounts}
            keyExtractor={(item) => item.accountId}
            renderItem={({ item }) => (
              <TouchableOpacity 
                className="mx-5 mb-4"
                onPress={() => handleAccountSelect(item)}
                activeOpacity={0.8}
              >
                <AnimatedAccountCard 
                  item={item} 
                  currency={currency} 
                  getAccountIcon={getAccountIcon}
                  isSelected={selectedAccount?.accountId === item.accountId}
                />
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

// Add AnimatedAccountCard component
function AnimatedAccountCard({ item, currency, getAccountIcon, isSelected }: { 
  item: Account; 
  currency: string; 
  getAccountIcon: (type: string, provider: string) => string;
  isSelected: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Remove the TouchableOpacity and handle animation differently
  const CardComponent = Platform.OS === 'web' ? WebAccountCard : NativeAccountCard;

  return (
    <Animated.View 
      style={{ 
        transform: [{ scale: scaleAnim }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <CardComponent 
        item={item} 
        currency={currency} 
        getAccountIcon={getAccountIcon}
        isSelected={isSelected}
      />
    </Animated.View>
  );
}

function NativeAccountCard({ item, currency, getAccountIcon, isSelected }: { 
  item: Account; 
  currency: string; 
  getAccountIcon: (type: string, provider: string) => string;
  isSelected: boolean;
}) {
  return (
    <View className={`overflow-hidden rounded-3xl ${isSelected ? 'border-2 border-blue-400' : 'border border-white/10'}`}>
      <BlurView intensity={40} tint="dark" className="overflow-hidden">
        <View className={`p-6 h-44 ${isSelected ? 'bg-blue-900/50' : 'bg-black/70'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className={`w-10 h-10 ${item.color} rounded-full justify-center items-center mr-3`}>
                <Ionicons 
                  name={getAccountIcon(item.type, item.provider) as any} 
                  size={20} 
                  color="white" 
                />
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold">{item.accountName}</Text>
                <Text className="text-white/60 text-sm">{item.provider}</Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-2">
              <View className="bg-white/10 px-3 py-1 rounded-full">
                <Text className="text-white/80 text-xs font-medium">
                  {item.type === 'bank' ? 'Bank' : 'Wallet'}
                </Text>
              </View>
              {isSelected && (
                <View className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </View>
          </View>


          
          <View className="flex-1 justify-end">
            <View className="flex-row justify-between items-end">
              <View className="flex-1">
                <Text className="text-white/60 text-sm mb-1">Available Balance</Text>
                <Text className="text-white text-2xl font-semibold">
                  {currency} {item.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              {isSelected && (
                <View className="bg-blue-500/20 px-2 py-1 rounded-full">
                  <Text className="text-blue-300 text-xs font-medium">Selected</Text>
                </View>
              )}
            </View>
            <Text className="text-white/40 text-xs mt-1">{item.accountNumber}</Text>
          </View>
        </View>
      </BlurView>

      {/* Shiny edge effect */}
      <View className={`absolute top-0 left-0 w-full h-[1px] ${isSelected ? 'bg-blue-400/50' : 'bg-white/15'}`} />
      <View className={`absolute top-0 right-0 w-[1px] h-full ${isSelected ? 'bg-blue-400/20' : 'bg-white/5'}`} />

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

function WebAccountCard({ item, currency, getAccountIcon, isSelected }: { 
  item: Account; 
  currency: string; 
  getAccountIcon: (type: string, provider: string) => string;
  isSelected: boolean;
}) {
  return (
    <View 
      className={`rounded-3xl overflow-hidden ${isSelected ? 'border-2 border-blue-400' : 'border border-white/10'}`}
      style={{
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <View className={`p-6 h-44 ${isSelected ? 'bg-blue-900/20' : 'bg-black/40'}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View className={`w-10 h-10 ${item.color} rounded-full justify-center items-center mr-3`}>
              <Ionicons 
                name={getAccountIcon(item.type, item.provider) as any} 
                size={20} 
                color="white" 
              />
            </View>
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">{item.accountName}</Text>
              <Text className="text-white/60 text-sm">{item.provider}</Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-2">
            <View className="bg-white/10 px-3 py-1 rounded-full">
              <Text className="text-white/80 text-xs font-medium">
                {item.type === 'bank' ? 'Bank' : 'Wallet'}
              </Text>
            </View>
            {isSelected && (
              <View className="w-6 h-6 bg-blue-500 rounded-full justify-center items-center">
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            )}
          </View>
        </View>

        
        
        <View className="flex-1 justify-end">
          <View className="flex-row justify-between items-end">
            <View className="flex-1">
              <Text className="text-white/60 text-sm mb-1">Available Balance</Text>
              <Text className="text-white text-2xl font-semibold">
                {currency} {item.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            {isSelected && (
              <View className="bg-blue-500/20 px-2 py-1 rounded-full">
                <Text className="text-blue-300 text-xs font-medium">Selected</Text>
              </View>
            )}
          </View>
          <Text className="text-white/40 text-xs mt-1">{item.accountNumber}</Text>
        </View>
      </View>
      
      {/* Shiny edge effects for web */}
      <View className={`absolute top-0 left-0 w-full h-[1px] ${isSelected ? 'bg-blue-400/50' : 'bg-white/15'}`} />
      <View className={`absolute top-0 right-0 w-[1px] h-full ${isSelected ? 'bg-blue-400/20' : 'bg-white/5'}`} />
      
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

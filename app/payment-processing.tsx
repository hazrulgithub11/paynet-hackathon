import Background from '@/components/ui/Background';
import { useUser } from '@/contexts/UserContext';
import apiService, { PaymentStatus } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PaymentProcessing() {
  const { sessionId, merchantName, direction, status } = useLocalSearchParams();
  const { selectedUser, userCountry, getCurrentBankId, getUserCurrency } = useUser();
  
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<'amount' | 'processing' | 'completed' | 'failed'>('amount');

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
      // Set initial step based on status
      const checkInitialStatus = async () => {
        try {
          const status = await apiService.getPaymentStatus(sessionId as string);
          if (status.status === 'verified') {
            setCurrentStep('amount');
          } else if (status.status === 'verification_failed') {
            setCurrentStep('failed');
          } else if (status.status === 'completed') {
            setCurrentStep('completed');
          }
        } catch (error) {
          console.error('Error checking initial status:', error);
        }
      };
      checkInitialStatus();
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    try {
      const status = await apiService.getPaymentStatus(sessionId as string);
      setPaymentStatus(status);
      
      if (status.status === 'verified') {
        setCurrentStep('amount');
      } else if (status.status === 'verification_failed') {
        setCurrentStep('failed');
      } else if (status.status === 'payment_processing') {
        setCurrentStep('processing');
      } else if (status.status === 'completed') {
        setCurrentStep('completed');
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
    }
  };



  const handleProcessPayment = async () => {
    if (!amount || !sessionId || !selectedUser) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    
    if (numAmount > selectedUser.balance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance for this transaction');
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep('processing');
    
    try {
      const result = await apiService.processPayment(sessionId as string, numAmount);
      
      // Poll for payment completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiService.getPaymentStatus(sessionId as string);
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setCurrentStep('completed');
            setIsProcessing(false);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setCurrentStep('failed');
            setIsProcessing(false);
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsProcessing(false);
        }
      }, 2000);
      
      // Clear interval after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsProcessing(false);
      }, 60000);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Failed', error.message);
      setCurrentStep('failed');
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'amount':
        return (
          <View className="w-full px-6">
            <Text className="text-2xl font-bold text-center mb-2">Enter Amount</Text>
            <Text className="text-gray-600 text-center mb-6">
              Pay to {merchantName}
            </Text>
            
            <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
              <Text className="text-sm text-gray-500 mb-2">Amount ({getUserCurrency()})</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                className="text-2xl font-bold text-center py-4"
              />
            </View>
            
            <View className="bg-blue-50 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-600 mb-2">Your Balance</Text>
              <Text className="text-lg font-semibold">
                {getUserCurrency()} {selectedUser?.balance.toLocaleString()}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleProcessPayment}
              disabled={!amount || isProcessing}
              className={`py-4 rounded-xl ${
                !amount || isProcessing ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Text>
            </TouchableOpacity>
          </View>
        );



      case 'processing':
        return (
          <View className="w-full px-6 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-xl font-bold mt-4 mb-2">Processing Payment</Text>
            <Text className="text-gray-600 text-center">
              Your payment of {getUserCurrency()} {amount} is being processed...
            </Text>
          </View>
        );

      case 'completed':
        return (
          <View className="w-full px-6 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark" size={40} color="#22C55E" />
            </View>
            <Text className="text-xl font-bold mb-2">Payment Successful!</Text>
            <Text className="text-gray-600 text-center mb-6">
              Your payment of {getUserCurrency()} {amount} to {merchantName} has been completed.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/expenses')}
              className="bg-blue-600 py-3 px-8 rounded-xl mb-3"
            >
              <Text className="text-white font-semibold">View Transaction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/')}
              className="py-3 px-8"
            >
              <Text className="text-blue-600 font-semibold">Back to Home</Text>
            </TouchableOpacity>
          </View>
        );

      case 'failed':
        return (
          <View className="w-full px-6 items-center">
            <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="close" size={40} color="#EF4444" />
            </View>
            <Text className="text-xl font-bold mb-2">Payment Failed</Text>
            <Text className="text-gray-600 text-center mb-6">
              We couldn't process your payment. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-600 py-3 px-8 rounded-xl"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View className="w-full px-6">
            <TouchableOpacity
              onPress={handleVerifyBanks}
              disabled={isProcessing}
              className={`py-4 rounded-xl ${
                isProcessing ? 'bg-gray-300' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {isProcessing ? 'Verifying...' : 'Start Verification'}
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* Header */}
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold ml-4">Payment Processing</Text>
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-center items-center z-10 mt-20">
        {renderStepContent()}
      </View>
    </View>
  );
} 
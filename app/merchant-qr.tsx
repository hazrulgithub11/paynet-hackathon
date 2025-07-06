import Background from '@/components/ui/Background';
import apiService from '@/services/api';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Share, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// Mock merchants data based on backend
const mockMerchants = {
  Thailand: [
    {
      merchantId: "merchant_thai_001",
      name: "Bangkok Mall",
      qrCode: "TH_QR_001_BANGKOK_MALL",
      balance: 50000,
      accountNumber: "TH001234567892"
    }
  ],
  Malaysia: [
    {
      merchantId: "merchant_malay_002",
      name: "Penang Food Court",
      qrCode: "MY_QR_002_PENANG_FOOD",
      balance: 3806.53,
      accountNumber: "MY001234567893"
    }
  ]
};

export default function MerchantQR() {
  const { userCountry, getUserCurrency } = useUser();
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQRData, setGeneratedQRData] = useState<string>('');

  const merchants = mockMerchants[userCountry as keyof typeof mockMerchants] || [];

  const handleGenerateQR = async (merchant: any) => {
    setIsGenerating(true);
    try {
      const result = await apiService.generateQR(merchant.merchantId);
      setSelectedMerchant(merchant);
      setGeneratedQRData(result.qrData.qrCode);
      setShowQRModal(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR code. Make sure the server is running.');
      setIsGenerating(false);
    }
  };



  const shareQRCode = async () => {
    try {
      await Share.share({
        message: `Scan this QR code to pay ${selectedMerchant?.name}: ${generatedQRData}`,
        title: 'Payment QR Code',
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const copyQRData = () => {
    // In a real app, this would copy to clipboard
    Alert.alert(
      'QR Data Copied',
      `QR Code data: ${generatedQRData}\n\nYou can manually enter this in the QR scanner for testing.`,
      [{ text: 'OK' }]
    );
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
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-start items-center z-10 mt-32 px-5">
        <Text className="text-2xl text-white font-bold text-center mb-2">Generate QR Code</Text>
        <Text className="text-white text-center mb-2">
          Select a merchant 
        </Text>
        
        {/* Country Indicator */}
        <View className="bg-blue-100 rounded-full px-4 py-2 mb-6">
          <Text className="text-blue-800 font-semibold text-center">
            {userCountry === 'Thailand' ? '🇹🇭 Thailand' : '🇲🇾 Malaysia'}
          </Text>
        </View>
        

        
        {/* Merchants List */}
        <View className="w-full space-y-6">
          {merchants.map((merchant) => (
            <View key={merchant.merchantId} className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100" style={{
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 12,
            }}>
              {/* Premium Header with Gradient Accent */}
              <View className="flex-row items-center mb-5">
                <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-lg" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundColor: '#667eea',
                  shadowColor: '#667eea',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                  <Ionicons name="storefront" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-900 mb-1">{merchant.name}</Text>
                  <View className="bg-gray-100 rounded-full px-3 py-1 self-start">
                    <Text className="text-gray-600 text-xs font-medium">ID: {merchant.merchantId}</Text>
                  </View>
                </View>
              </View>
              
              {/* Enhanced Account Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                <View className="flex-row items-center mb-2">
                  <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="card" size={14} color="#3B82F6" />
                  </View>
                  <Text className="text-gray-700 font-medium">Account Details</Text>
                </View>
                <Text className="text-gray-600 text-sm mb-1 ml-9">Account: {merchant.accountNumber}</Text>
                
              </View>
              
              {/* Premium Generate Button */}
              <TouchableOpacity
                onPress={() => handleGenerateQR(merchant)}
                disabled={isGenerating}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center ${
                  isGenerating ? 'bg-gray-300' : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                }`}
                style={{
                  shadowColor: isGenerating ? '#000' : '#F59E0B',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: isGenerating ? 0.1 : 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                  backgroundColor: isGenerating ? '#D1D5DB' : '#F59E0B',
                }}
              >
                <Ionicons 
                  name={isGenerating ? "hourglass" : "qr-code"} 
                  size={20} 
                  color="white" 
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-center font-bold text-lg">
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      
      </View>
      
      {/* QR Code Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showQRModal}
        onRequestClose={() => setShowQRModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-5">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Payment QR Code</Text>
              <TouchableOpacity onPress={() => setShowQRModal(false)}>
                <Ionicons name="close" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            
            {/* Merchant Info */}
            {selectedMerchant && (
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="storefront" size={32} color="#3B82F6" />
                </View>
                <Text className="text-lg font-semibold text-center">{selectedMerchant.name}</Text>
                <Text className="text-gray-600 text-sm">{userCountry}</Text>
              </View>
            )}
            
            {/* QR Code */}
            <View className="items-center mb-6">
              <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <QRCode
                  value={generatedQRData}
                  size={200}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </View>
            
            {/* QR Data */}
            <View className="bg-gray-50 rounded-xl p-3 mb-6">
              <Text className="text-xs text-gray-500 mb-1">QR Code Data:</Text>
              <Text className="text-sm font-mono text-gray-800">{generatedQRData}</Text>
            </View>
            
            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={shareQRCode}
                className="bg-blue-600 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="share" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Share QR Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={copyQRData}
                className="bg-gray-200 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="copy" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">Copy QR Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setShowQRModal(false);
                  router.push('/qr');
                }}
                className="bg-green-600 py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Open QR Scanner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 
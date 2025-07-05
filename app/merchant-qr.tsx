import Background from '@/components/ui/Background';
import apiService from '@/services/api';
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
      merchantId: "merchant_malay_001",
      name: "KL Shopping Center",
      qrCode: "MY_QR_001_KL_SHOPPING",
      balance: 17.94,
      accountNumber: "MY001234567892"
    },
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
  const [selectedCountry, setSelectedCountry] = useState<'Thailand' | 'Malaysia'>('Malaysia');
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [generatedQRData, setGeneratedQRData] = useState<string>('');

  const merchants = mockMerchants[selectedCountry];

  const handleGenerateQR = async (merchant: any) => {
    setIsGenerating(true);
    try {
      const result = await apiService.generateQR(merchant.merchantId);
      setSelectedMerchant(merchant);
      setGeneratedQRData(result.qrData.qrCode);
      setShowQRModal(true);
      setIsGenerating(false);
      
      Alert.alert(
        'QR Code Generated Successfully!',
        `Merchant: ${result.qrData.merchantName}\nCountry: ${result.qrData.country}\nCurrency: ${result.qrData.currency}`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR code. Make sure the server is running.');
      setIsGenerating(false);
    }
  };

  const simulateQRCode = (merchant: any) => {
    // This simulates what the QR code would contain
    setSelectedMerchant(merchant);
    setGeneratedQRData(merchant.qrCode);
    setShowQRModal(true);
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
        <Text className="text-xl font-bold ml-4">Merchant QR Generator</Text>
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-start items-center z-10 mt-32 px-5">
        <Text className="text-2xl font-bold text-center mb-2">Generate QR Code</Text>
        <Text className="text-gray-600 text-center mb-8">
          Select a merchant to generate QR code for testing
        </Text>
        
        {/* Country Selector */}
        <View className="flex-row w-full mb-6">
          <TouchableOpacity
            onPress={() => setSelectedCountry('Thailand')}
            className={`flex-1 p-4 rounded-l-xl ${
              selectedCountry === 'Thailand' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-center font-semibold ${
              selectedCountry === 'Thailand' ? 'text-white' : 'text-gray-600'
            }`}>
              🇹🇭 Thailand
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedCountry('Malaysia')}
            className={`flex-1 p-4 rounded-r-xl ${
              selectedCountry === 'Malaysia' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <Text className={`text-center font-semibold ${
              selectedCountry === 'Malaysia' ? 'text-white' : 'text-gray-600'
            }`}>
              🇲🇾 Malaysia
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Merchants List */}
        <View className="w-full space-y-4">
          {merchants.map((merchant) => (
            <View key={merchant.merchantId} className="bg-white rounded-xl p-4 shadow-sm">
              <View className="flex-row items-center mb-2">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="storefront" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold">{merchant.name}</Text>
                  <Text className="text-gray-600 text-sm">ID: {merchant.merchantId}</Text>
                </View>
              </View>
              
              <Text className="text-gray-600 mb-1">Account: {merchant.accountNumber}</Text>
              <Text className="text-sm text-gray-500 mb-4">
                Balance: {selectedCountry === 'Thailand' ? 'THB' : 'MYR'} {merchant.balance.toLocaleString()}
              </Text>
              
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleGenerateQR(merchant)}
                  disabled={isGenerating}
                  className={`flex-1 py-3 rounded-lg ${
                    isGenerating ? 'bg-gray-300' : 'bg-blue-600'
                  }`}
                >
                  <Text className="text-white text-center font-semibold">
                    {isGenerating ? 'Generating...' : 'Generate QR'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => simulateQRCode(merchant)}
                  className="flex-1 py-3 rounded-lg bg-green-600"
                >
                  <Text className="text-white text-center font-semibold">
                    Show QR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        {/* Instructions */}
        <View className="mt-8 bg-blue-50 rounded-xl p-4">
          <Text className="text-blue-800 font-semibold mb-2">How to Test:</Text>
          <Text className="text-blue-700 text-sm">
            1. Generate a QR code for a merchant{'\n'}
            2. Use "Show QR" to display the QR code{'\n'}
            3. Go to the QR scanner tab and scan the code{'\n'}
            4. Complete the payment flow{'\n'}
            5. Or copy QR data for manual testing
          </Text>
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
                <Text className="text-gray-600 text-sm">{selectedCountry}</Text>
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
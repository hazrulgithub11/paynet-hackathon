import Background from '@/components/ui/Background';
import { useUser } from '@/contexts/UserContext';
import apiService from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { selectedUser, userCountry } = useUser();

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setIsProcessing(true);
    
    try {
      if (!selectedUser) {
        Alert.alert('Error', 'Please select a user first');
        setScanned(false);
        setIsProcessing(false);
        return;
      }

      // Initiate payment with backend
      const result = await apiService.scanQR(data, selectedUser.userId, userCountry);
      
      setIsProcessing(false);
      
      // Navigate to payment processing screen
      router.push({
        pathname: '/payment-processing',
        params: {
          sessionId: result.sessionId,
          merchantName: result.merchantName,
          direction: result.direction,
          status: result.status
        }
      });
      
    } catch (error) {
      setIsProcessing(false);
      console.error('QR scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process QR code';
      Alert.alert(
        'Payment Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setScanned(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await requestPermission();
    return status === 'granted';
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View className="flex-1 relative">
        <Background />
        <View className="flex-1 justify-center items-center z-10 p-5">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-xl font-bold text-black mt-4">Loading camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 relative">
        <Background />
        <View className="flex-1 justify-center items-center z-10 p-5">
          <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="camera" size={40} color="#3B82F6" />
          </View>
          <Text className="text-xl font-bold text-black mb-4 text-center">
            Camera Access Required
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            We need camera access to scan QR codes for payments
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-8 py-4 rounded-xl"
            onPress={requestCameraPermission}
          >
            <Text className="text-white font-semibold text-lg">Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View className="flex-1 relative">
        <Background />
        <View className="flex-1 justify-center items-center z-10 p-5">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-xl font-bold text-black mt-4">Processing QR Code...</Text>
          <Text className="text-gray-600 text-center mt-2">
            Please wait while we connect to the merchant
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* User Info Header */}
      <View className="absolute top-16 left-5 right-5 z-20 bg-black/50 rounded-xl p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-lg font-semibold">
              {selectedUser?.name || 'No User Selected'}
            </Text>
            <Text className="text-white/80 text-sm">
              {userCountry} • {selectedUser?.accountNumber}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white text-sm">Balance</Text>
            <Text className="text-white text-lg font-bold">
              {userCountry === 'Thailand' ? 'THB' : 'MYR'} {selectedUser?.balance.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Camera View */}
      <View className="flex-1 z-10 mt-28">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
        />
        
        {/* Overlay UI */}
        <View className="flex-1 justify-center items-center">
          {/* Scanning Frame */}
          <View className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
            {/* Corner brackets */}
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />
            
            {/* Scanning line animation */}
            <View className="absolute top-1/2 left-4 right-4 h-0.5 bg-blue-500" />
          </View>
          
          {/* Instructions */}
          <View className="mt-8 bg-black/50 rounded-xl p-4 mx-4">
            <Text className="text-white text-center text-lg font-medium mb-2">
              {scanned ? 'QR Code Detected!' : 'Scan Merchant QR Code'}
            </Text>
            <Text className="text-white/80 text-center">
              {scanned 
                ? 'Processing payment...' 
                : 'Position the QR code within the frame to pay'
              }
            </Text>
          </View>
          
          {scanned && (
            <TouchableOpacity
              className="mt-6 bg-blue-600 px-8 py-4 rounded-xl"
              onPress={() => setScanned(false)}
            >
              <Text className="text-white font-semibold text-lg">Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Bottom Controls */}
      <View className="absolute bottom-10 left-5 right-5 z-20">
        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity
            className="bg-white/20 backdrop-blur-sm rounded-full p-4"
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-white/20 backdrop-blur-sm rounded-full p-4"
            onPress={() => router.push('/account')}
          >
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

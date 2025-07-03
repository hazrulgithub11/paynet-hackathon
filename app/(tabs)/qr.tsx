import Background from '@/components/ui/Background';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    setScannedData(data);
    Alert.alert(
      'QR Code Scanned!',
      `Type: ${type}\nData: ${data}`,
      [
        {
          text: 'Scan Again',
          onPress: () => setScanned(false),
        },
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
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
          <Text className="text-xl font-bold text-black">Loading camera permissions...</Text>
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
          <Text className="text-xl font-bold text-black mb-4 text-center">
            Camera access is required to scan QR codes
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-lg"
            onPress={requestCameraPermission}
          >
            <Text className="text-white font-semibold">Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* Camera View */}
      <View className="flex-1 z-10">
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
          <View className="w-64 h-64 border-2 border-white rounded-lg relative">
            <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
            <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
            <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
            <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
          </View>
          
          {/* Instructions */}
          <Text className="text-black text-center mt-8 px-4 text-lg font-medium">
            {scanned ? 'QR Code Scanned!' : 'Position QR code within the frame'}
          </Text>
          
          {scannedData && scanned && (
            <View className="mt-4 bg-black/50 p-4 rounded-lg mx-4">
              <Text className="text-black text-center font-medium">Scanned Data:</Text>
              <Text className="text-black text-center mt-2">{scannedData}</Text>
            </View>
          )}
          
          {scanned && (
            <TouchableOpacity
              className="mt-6 bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => setScanned(false)}
            >
              <Text className="text-white font-semibold">Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

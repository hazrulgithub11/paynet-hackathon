import Background from '@/components/ui/Background';
import { useUser } from '@/contexts/UserContext';
import apiService from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function Settings() {
  const { selectedUser, userCountry, setUserCountry, getCurrentBankId } = useUser();
  const [isTestMode, setIsTestMode] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    try {
      const contractInfo = await apiService.getContractInfo();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const handleTestConnection = async () => {
    try {
      const contractInfo = await apiService.getContractInfo();
      Alert.alert(
        'Connection Test',
        `✅ Backend Connected\n\nContract: ${contractInfo.contractAddress}\nNetwork: ${contractInfo.network}\nStatus: ${contractInfo.isConnected ? 'Connected' : 'Disconnected'}`,
        [
          { text: 'OK' }
        ]
      );
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      Alert.alert(
        'Connection Test',
        `❌ Backend Connection Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease make sure the server is running:\n1. Open terminal\n2. Navigate to server folder\n3. Run: node main.js`,
        [
          { text: 'Retry', onPress: checkServerStatus },
          { text: 'OK' }
        ]
      );
    }
  };

  const handleBankTest = async () => {
    const bankId = getCurrentBankId();
    if (!bankId) {
      Alert.alert('Error', 'No bank selected');
      return;
    }

    try {
      const result = await apiService.getBankPrivateKey(bankId);
      Alert.alert(
        'Bank Test',
        `✅ Bank Connection OK\n\nBank ID: ${bankId}\nPrivate Key: ${result.privateKey.substring(0, 50)}...`
      );
    } catch (error) {
      Alert.alert(
        'Bank Test',
        `❌ Bank Connection Failed\n\nBank ID: ${bankId}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleStartServerGuide = () => {
    Alert.alert(
      'Start Server Instructions',
      `To start the backend server:\n\n1. Open a new terminal/command prompt\n2. Navigate to your project folder\n3. Run: cd server\n4. Run: node main.js\n\nThe server should start on port 3000.\n\nYou can also run 'yarn start' in the server directory.`,
      [
        { text: 'Test Connection', onPress: checkServerStatus },
        { text: 'OK' }
      ]
    );
  };

  const getServerStatusColor = () => {
    switch (serverStatus) {
      case 'online': return '#10B981'; // green
      case 'offline': return '#EF4444'; // red
      case 'checking': return '#F59E0B'; // yellow
      default: return '#6B7280'; // gray
    }
  };

  const getServerStatusText = () => {
    switch (serverStatus) {
      case 'online': return 'Server Online';
      case 'offline': return 'Server Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const SettingsItem = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm flex-row items-center"
    >
      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
        <Ionicons name={icon as any} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-gray-600 text-sm">{subtitle}</Text>
        )}
      </View>
      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ))}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 relative">
      <Background />
      
      {/* Header */}
      <View className="absolute top-16 left-5 right-5 z-20 flex-row items-center">
        <Text className="text-2xl font-bold">Settings</Text>
        <View className="flex-1" />
        <View className="bg-white rounded-full px-3 py-1 shadow-sm">
          <Text className="text-sm font-medium">
            {userCountry === 'Thailand' ? '🇹🇭 TH' : '🇲🇾 MY'}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-start z-10 mt-32 px-5">
        {/* User Info */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-semibold">
                {selectedUser?.name || 'No User Selected'}
              </Text>
              <Text className="text-gray-600">
                {selectedUser?.email || 'Please select a user'}
              </Text>
            </View>
          </View>
        </View>

        {/* Server Status */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View 
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: getServerStatusColor() }}
              />
              <View>
                <Text className="font-semibold">{getServerStatusText()}</Text>
                <Text className="text-sm text-gray-600">Backend server status</Text>
              </View>
            </View>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={checkServerStatus}
                className="bg-blue-100 px-3 py-2 rounded-lg"
              >
                <Ionicons name="refresh" size={16} color="#3B82F6" />
              </TouchableOpacity>
              {serverStatus === 'offline' && (
                <TouchableOpacity
                  onPress={handleStartServerGuide}
                  className="bg-green-100 px-3 py-2 rounded-lg"
                >
                  <Ionicons name="play" size={16} color="#10B981" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        
        {/* Testing Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4">Testing & Development</Text>
          
          <SettingsItem
            icon="flask"
            title="Test Mode"
            subtitle="Enable testing features"
            showArrow={false}
            rightComponent={
              <Switch
                value={isTestMode}
                onValueChange={setIsTestMode}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={isTestMode ? '#FFFFFF' : '#9CA3AF'}
              />
            }
          />
          
          <SettingsItem
            icon="qr-code"
            title="Merchant QR Generator"
            subtitle="Generate QR codes for testing"
            onPress={() => router.push('/merchant-qr')}
          />
          
          <SettingsItem
            icon="pulse"
            title="Test Backend Connection"
            subtitle="Check server connectivity"
            onPress={handleTestConnection}
          />
          
          <SettingsItem
            icon="business"
            title="Test Bank Connection"
            subtitle="Check bank API connectivity"
            onPress={handleBankTest}
          />

          {serverStatus === 'offline' && (
            <SettingsItem
              icon="play-circle"
              title="Server Setup Guide"
              subtitle="How to start the backend server"
              onPress={handleStartServerGuide}
            />
          )}
        </View>
        
        {/* App Settings */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4">App Settings</Text>
          
          <SettingsItem
            icon="notifications"
            title="Notifications"
            subtitle="Payment alerts and updates"
            showArrow={false}
            rightComponent={
              <Switch
                value={isNotificationsEnabled}
                onValueChange={setIsNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={isNotificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            }
          />
          
          <SettingsItem
            icon="globe"
            title="Switch Country"
            subtitle={`Currently: ${userCountry}`}
            onPress={() => {
              const newCountry = userCountry === 'Thailand' ? 'Malaysia' : 'Thailand';
              setUserCountry(newCountry);
              Alert.alert('Country Changed', `Switched to ${newCountry}`);
            }}
          />
          
          <SettingsItem
            icon="card"
            title="Account Management"
            subtitle="View and manage accounts"
            onPress={() => router.push('/account')}
          />
        </View>
        
        {/* About */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-4">About</Text>
          
          <SettingsItem
            icon="information-circle"
            title="App Version"
            subtitle="PayNet Cross-Border v1.0.0"
            showArrow={false}
          />
          
          <SettingsItem
            icon="help-circle"
            title="How to Use"
            subtitle="Payment flow instructions"
            onPress={() => Alert.alert(
              'How to Use PayNet Cross-Border',
              '🚀 Quick Start:\n\n1. Make sure server is running (green status above)\n2. Select your country and user from home screen\n3. Go to Settings → Merchant QR Generator\n4. Generate a QR code for any merchant\n5. Use QR Scanner to scan the code\n6. Enter amount and complete payment\n\n💡 The app supports cross-border payments between Thailand (THB) and Malaysia (MYR) with real-time blockchain verification!'
            )}
          />
        </View>
      </View>
    </View>
  );
}

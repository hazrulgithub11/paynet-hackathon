import Background from '@/components/ui/Background';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function Dashboard() {
  return (
    <View className="flex-1 relative">
      <Background />
      <ScrollView className="flex-1 relative z-10">
      {/* Header */}
      <View className="pt-12 pb-6 px-6">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
        <Text className="text-white text-sm mt-1">Welcome back!</Text>
      </View>

      {/* Main Content */}
      <View className="p-6">
        {/* Test Message */}
        <View className="bg-white bg-opacity-80 rounded-lg shadow-sm p-6 mb-6">
          <Text className="text-3xl font-bold text-gray-800 text-center">
            hello test ajol
          </Text>
          
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-white bg-opacity-80 rounded-lg p-4 flex-1 mr-2">
            <Text className="text-gray-800 text-lg font-semibold">Active</Text>
            <Text className="text-gray-800 text-2xl font-bold">24</Text>
          </View>
          <View className="bg-white bg-opacity-80 rounded-lg p-4 flex-1 ml-2">
            <Text className="text-gray-800 text-lg font-semibold">Total</Text>
            <Text className="text-gray-800 text-2xl font-bold">156</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity className="bg-white bg-opacity-80 rounded-lg p-4">
            <Text className="text-gray-800 text-center font-semibold text-lg">
              Primary Action
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white bg-opacity-60 rounded-lg p-4">
            <Text className="text-gray-800 text-center font-semibold text-lg">
              Secondary Action
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="mt-6 bg-white bg-opacity-80 border border-white border-opacity-20 rounded-lg p-4">
          <Text className="text-gray-800 font-semibold mb-2">
            Testing Tailwind Classes:
          </Text>
          <Text className="text-gray-700 text-sm">
            • Colors: bg-blue-600, text-white, bg-blue-50
          </Text>
          <Text className="text-gray-700 text-sm">
            • Spacing: p-6, mt-2, mb-6
          </Text>
          <Text className="text-gray-700 text-sm">
            • Layout: flex-row, justify-between, rounded-lg
          </Text>
          <Text className="text-gray-700 text-sm">
            • Typography: text-2xl, font-bold, text-center
          </Text>
        </View>
              </View>
      </ScrollView>
    </View>
  );
} 
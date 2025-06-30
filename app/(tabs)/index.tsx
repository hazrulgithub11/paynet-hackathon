import Background from '@/components/ui/Background';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 relative">
      <Background />
      <View className="absolute top-10 left-5 z-20 w-12 h-12 rounded-full bg-yellow-200 overflow-hidden">
        {/* Profile circle */}
      </View>
      <View className="flex-1 justify-center items-center z-10">
        
      </View>
    </View>
  );
}

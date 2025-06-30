import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BackgroundProps {
  className?: string;
}

export default function Background({ className = "" }: BackgroundProps) {
  const { width, height } = Dimensions.get('window');
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
      });
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Base gradient */}
      <LinearGradient
        colors={['#6366f1', '#5539cc', '#4c31b9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      {/* Wave pattern 1 - Light purple with orange accent */}
      <Svg
        height={dimensions.height}
        width={dimensions.width}
        style={{ position: 'absolute', opacity: 0.4 }}
      >
        <Path
          d={`M0,${dimensions.height * 0.4} 
             Q${dimensions.width * 0.25},${dimensions.height * 0.2} 
             ${dimensions.width * 0.5},${dimensions.height * 0.3} 
             T${dimensions.width},${dimensions.height * 0.2}`}
          fill="none"
          stroke="#b8a6ff"
          strokeWidth="70"
          strokeLinecap="round"
        />
        
        {/* Orange accent on first wave */}
        <Path
          d={`M0,${dimensions.height * 0.38} 
             Q${dimensions.width * 0.25},${dimensions.height * 0.18} 
             ${dimensions.width * 0.5},${dimensions.height * 0.28} 
             T${dimensions.width},${dimensions.height * 0.18}`}
          fill="none"
          stroke="#FF9500"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>

      {/* Wave pattern 2 - Medium purple */}
      <Svg
        height={dimensions.height}
        width={dimensions.width}
        style={{ position: 'absolute', opacity: 0.35 }}
      >
        <Path
          d={`M0,${dimensions.height * 0.7} 
             C${dimensions.width * 0.2},${dimensions.height * 0.5} 
             ${dimensions.width * 0.4},${dimensions.height * 0.8} 
             ${dimensions.width * 0.65},${dimensions.height * 0.6} 
             S${dimensions.width * 0.8},${dimensions.height * 0.75} 
             ${dimensions.width},${dimensions.height * 0.6}`}
          fill="none"
          stroke="#9f87ff"
          strokeWidth="90"
          strokeLinecap="round"
        />
      </Svg>

      {/* Wave pattern 3 - Lighter purple with gradient and orange accent */}
      <Svg
        height={dimensions.height}
        width={dimensions.width}
        style={{ position: 'absolute', opacity: 0.25 }}
      >
        <Path
          d={`M0,${dimensions.height * 0.85} 
             Q${dimensions.width * 0.3},${dimensions.height * 0.65} 
             ${dimensions.width * 0.5},${dimensions.height * 0.85} 
             T${dimensions.width},${dimensions.height * 0.7}`}
          fill="none"
          stroke="#c8baff"
          strokeWidth="100"
          strokeLinecap="round"
        />
        
        {/* Orange accent on third wave */}
        <Path
          d={`M0,${dimensions.height * 0.83} 
             Q${dimensions.width * 0.3},${dimensions.height * 0.63} 
             ${dimensions.width * 0.5},${dimensions.height * 0.83} 
             T${dimensions.width},${dimensions.height * 0.68}`}
          fill="none"
          stroke="#FF9500"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

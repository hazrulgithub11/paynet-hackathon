import { ImageBackground } from 'react-native';

interface BackgroundProps {
  className?: string;
}

export default function Background({ className = "" }: BackgroundProps) {
  return (
    <ImageBackground 
      source={require('@/assets/images/wallpaper1.jpg')}
      className={`absolute inset-0 ${className}`}
      resizeMode="cover"
    />
  );
}

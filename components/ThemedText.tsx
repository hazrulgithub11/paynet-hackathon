import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'PoppinsRegular',
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 24,
  },
  link: {
    fontFamily: 'PoppinsRegular',
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

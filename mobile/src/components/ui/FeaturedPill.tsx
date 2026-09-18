import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

interface FeaturedPillProps {
  title: string;
  subtitle: string;
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export const FeaturedPill: React.FC<FeaturedPillProps> = ({
  title,
  subtitle,
  onPress,
  iconName = 'wallet-outline',
}) => {
  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={Gradients.raised}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.pill}
      >
        {/* Top hairline highlight */}
        <View style={styles.topHighlight} />

        {/* Leading 36px silver circular icon tile */}
        <LinearGradient
          colors={Gradients.silver}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.iconTile}
        >
          <Ionicons name={iconName} size={18} color={Colors.onSilver} />
        </LinearGradient>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        </View>

        {/* Trailing chevron */}
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...Shadow.md,
  },
  pill: {
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
});

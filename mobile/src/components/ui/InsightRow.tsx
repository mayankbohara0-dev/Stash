import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

interface InsightRowProps {
  title: string;
  subtitle: string;
  badgeCount?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const InsightRow: React.FC<InsightRowProps> = ({
  title,
  subtitle,
  badgeCount,
  iconName = 'information-circle-outline',
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 120, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${subtitle}`}
      >
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.row}
        >
          {/* Top hairline */}
          <View style={styles.topHighlight} />

          {/* Icon tile + badge */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconTile}>
              <Ionicons name={iconName} size={20} color={Colors.text} />
            </View>
            {badgeCount !== undefined && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
              </View>
            )}
          </View>

          {/* Text */}
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          </View>

          {/* Trailing chevron */}
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    height: 72,
    borderRadius: Radius.row,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  iconWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A0A0B', // near-black tile per spec
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.text, // white badge
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.bgBase,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Typography.bold,
    color: Colors.onSilver, // dark number
    lineHeight: 11,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: Typography.md,
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

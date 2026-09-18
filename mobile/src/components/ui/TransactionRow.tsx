import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors, Gradients, Typography, Spacing, Radius, Shadow,
} from '../../constants/theme';
import { formatIndian, TransactionType } from '../../data/mockData';

interface TransactionRowProps {
  merchant: string;
  category: string;
  method: string;
  amount: number;
  type: TransactionType;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  merchant,
  category,
  method,
  amount,
  type,
  iconName = 'receipt-outline',
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const brightnessAnim = useRef(new Animated.Value(1)).current;

  const isIncome = type === 'income';
  const amountStr = `${isIncome ? '+' : '−'}${formatIndian(amount)}`;
  const amountColor = isIncome ? Colors.income : Colors.text;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 120, useNativeDriver: true }),
      Animated.timing(brightnessAnim, { toValue: 0.85, duration: 120, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(brightnessAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${merchant}, ${amountStr}`}
      >
        <LinearGradient
          colors={Gradients.raised}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.row}
        >
          {/* Top hairline highlight */}
          <View style={styles.topHighlight} />

          {/* 44px circular icon tile */}
          <View style={styles.iconTile}>
            <Ionicons name={iconName} size={20} color={Colors.text} />
          </View>

          {/* Text */}
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>{merchant}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {category} · {method}
            </Text>
          </View>

          {/* Amount */}
          <Text style={[styles.amount, { color: amountColor }]}>{amountStr}</Text>
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
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  amount: {
    fontSize: Typography.md,
    fontWeight: Typography.semibold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
});

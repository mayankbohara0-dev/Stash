import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'layers-outline',
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  // Map any legacy emojis to Ionicons
  const resolvedIcon: keyof typeof Ionicons.glyphMap =
    icon !== 'layers-outline'
      ? icon
      : emoji === '📊'
      ? 'pie-chart-outline'
      : emoji === '🎯'
      ? 'flag-outline'
      : emoji === '🔄'
      ? 'repeat-outline'
      : emoji === '💳'
      ? 'card-outline'
      : 'layers-outline';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={resolvedIcon} size={34} color={Colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  button: {
    backgroundColor: Colors.silverTop,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: Radius.full,
  },
  buttonText: {
    color: Colors.onSilver,
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
  },
});

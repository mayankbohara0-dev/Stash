import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const containerStyle = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : undefined,
    (disabled || loading) ? styles.disabled : undefined,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#0A0A0B' : Colors.text}
          size="small"
        />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyle}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.full,
  },

  // Variants
  variant_primary: {
    backgroundColor: '#FAFAFB',
  },
  variant_secondary: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.3)',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Sizes
  size_sm: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md },
  size_md: { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.base },
  size_lg: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg },

  fullWidth: { width: '100%' },
  disabled: { opacity: 0.4 },

  // Text base
  text: {
    fontWeight: Typography.semibold,
    textAlign: 'center',
  },
  text_primary: { color: '#0A0A0B' },
  text_secondary: { color: Colors.text },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.error },
  text_outline: { color: Colors.textSecondary },

  // Text sizes
  textSize_sm: { fontSize: Typography.sm },
  textSize_md: { fontSize: Typography.base },
  textSize_lg: { fontSize: Typography.md },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { MOCK_CATEGORIES, addMockTransaction } from '../../data/mockData';

const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

function GlossyKey({ label, onPress }: { label: string; onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.timing(scaleAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={label === '⌫' ? 'Backspace' : label}
      >
        <LinearGradient
          colors={['#262629', '#1A1A1D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.key}
        >
          <View style={styles.keyHighlight} />
          <Text style={styles.keyLabel}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('cat-1');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setAmount(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
      setAmount(prev => prev + key);
    }
  };

  const handleSave = () => {
    const num = parseFloat(amount) || 0;
    if (num > 0) {
      const cat = MOCK_CATEGORIES.find(c => c.id === selectedCategory);
      addMockTransaction({
        merchant: cat?.label || (type === 'income' ? 'Salary' : 'General Expense'),
        category: cat?.label || 'General',
        amount: num,
        type: type,
        iconName: cat?.iconName || 'wallet-outline',
      });
    }
    navigation.goBack();
  };

  const displayAmount = `₹${amount}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.sheet, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <LinearGradient
            colors={Gradients.raised}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheetInner}
          >
            {/* Top highlight */}
            <View style={styles.topHighlight} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.closeBtn}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Transaction</Text>

              {/* Type toggle */}
              <View style={styles.typeToggle}>
                {(['expense', 'income'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  >
                    <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                      {t === 'expense' ? 'Expense' : 'Income'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Huge amount display */}
            <View style={styles.amountDisplay}>
              <Text
                style={[
                  styles.amountText,
                  { color: type === 'income' ? Colors.income : Colors.text },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {displayAmount}
              </Text>
            </View>

            {/* Category chips */}
            <View style={styles.categoryWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
                style={styles.categoryScroll}
              >
                {MOCK_CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={cat.label}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <LinearGradient
                        colors={isSelected ? Gradients.silver : ['#262629', '#1A1A1D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                      >
                        <Ionicons
                          name={cat.iconName as any}
                          size={14}
                          color={isSelected ? Colors.onSilver : Colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.categoryChipLabel,
                            isSelected && styles.categoryChipLabelActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Numeric keypad */}
            <View style={styles.keypad}>
              {KEYPAD.map((row, ri) => (
                <View key={ri} style={styles.keyRow}>
                  {row.map(key => (
                    <GlossyKey key={key} label={key} onPress={() => handleKey(key)} />
                  ))}
                </View>
              ))}
            </View>

            {/* Save button */}
            <View style={styles.saveWrapper}>
              <PrimaryButton
                label="Save Transaction"
                onPress={handleSave}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const KEY_WIDTH = 76;
const KEY_HEIGHT = 56;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  sheet: {
    flex: 1,
    overflow: 'hidden',
  },
  sheetInner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgInset,
    borderRadius: Radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  typeBtnActive: {
    backgroundColor: Colors.surface,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: Typography.medium,
    color: Colors.textMuted,
  },
  typeBtnTextActive: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },

  amountDisplay: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  amountText: {
    fontSize: 52,
    fontWeight: Typography.bold,
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },

  categoryWrap: {
    marginBottom: Spacing.sm,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 13,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    borderColor: Colors.borderAlt,
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  categoryChipLabelActive: {
    color: Colors.onSilver,
    fontWeight: Typography.semibold,
  },

  keypad: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
    marginBottom: Spacing.xs,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  key: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  keyHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  keyLabel: {
    fontSize: 22,
    fontWeight: Typography.medium,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },

  saveWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
});

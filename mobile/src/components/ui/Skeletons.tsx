import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

// Animated shimmer skeleton blocks matching TransactionRow and HeroInfoCard shapes

function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: object;
}) {
  return (
    <View
      style={[
        styles.block,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

export const SkeletonTransactionRow: React.FC = () => (
  <View style={styles.row}>
    {/* Icon tile */}
    <SkeletonBlock width={44} height={44} borderRadius={22} />
    {/* Text lines */}
    <View style={styles.textBlock}>
      <SkeletonBlock width="60%" height={14} borderRadius={7} />
      <SkeletonBlock width="40%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
    {/* Amount */}
    <SkeletonBlock width={60} height={14} borderRadius={7} />
  </View>
);

export const SkeletonHeroCard: React.FC = () => (
  <View style={styles.heroCard}>
    <View style={styles.heroLeft}>
      <SkeletonBlock width="80%" height={20} borderRadius={10} />
      <SkeletonBlock width="90%" height={14} borderRadius={7} style={{ marginTop: 10 }} />
      <SkeletonBlock width="50%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
      <SkeletonBlock width={80} height={36} borderRadius={18} style={{ marginTop: 12 }} />
    </View>
    <SkeletonBlock width={88} height={88} borderRadius={12} />
  </View>
);

export const SkeletonFeaturedPill: React.FC = () => (
  <View style={styles.pill}>
    <SkeletonBlock width={36} height={36} borderRadius={18} />
    <View style={{ flex: 1 }}>
      <SkeletonBlock width="50%" height={14} borderRadius={7} />
      <SkeletonBlock width="65%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.surfaceAlt,
    opacity: 0.6,
  },
  row: {
    height: 72,
    borderRadius: Radius.row,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  textBlock: {
    flex: 1,
  },
  heroCard: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  heroLeft: {
    flex: 1,
  },
  pill: {
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 12,
  },
});

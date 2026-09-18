import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radius.sm,
  style,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.cardAlt],
  });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
};

export const DashboardSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Balance card */}
    <View style={styles.card}>
      <Skeleton width={120} height={14} style={{ marginBottom: 12 }} />
      <Skeleton width={180} height={40} style={{ marginBottom: 16 }} />
      <View style={styles.row}>
        <Skeleton width={80} height={40} />
        <Skeleton width={80} height={40} />
      </View>
    </View>

    {/* Quick actions */}
    <View style={styles.row}>
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} width={70} height={70} borderRadius={Radius.lg} />
      ))}
    </View>

    {/* Chart */}
    <View style={styles.card}>
      <Skeleton width={140} height={18} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={160} borderRadius={Radius.md} />
    </View>

    {/* Transactions */}
    <View style={styles.card}>
      <Skeleton width={160} height={18} style={{ marginBottom: 16 }} />
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.row, { marginBottom: 12 }]}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Skeleton width="60%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={12} />
          </View>
          <Skeleton width={64} height={14} />
        </View>
      ))}
    </View>
  </View>
);

export const TransactionSkeleton: React.FC = () => (
  <View style={[styles.row, { padding: Spacing.base, marginBottom: 4 }]}>
    <Skeleton width={44} height={44} borderRadius={22} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Skeleton width="55%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="35%" height={12} />
    </View>
    <Skeleton width={70} height={14} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});

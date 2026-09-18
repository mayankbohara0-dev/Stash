import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Radius } from '../../constants/theme';

interface ProgressBarProps {
  value: number; // 0–100
  animated?: boolean;
  duration?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  animated = true,
  duration = 700,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: clampedValue,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(clampedValue);
    }
  }, [clampedValue, animated]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.barWrapper,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={Gradients.silver}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bar}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 20,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInset,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  barWrapper: {
    height: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: Radius.full,
  },
});

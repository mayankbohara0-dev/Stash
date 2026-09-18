import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius } from '../../constants/theme';

export type NavTab = 'home' | 'insights' | 'accounts';

interface FloatingNavProps {
  activeTab: NavTab;
  onTabPress: (tab: NavTab) => void;
  onAddPress?: () => void;
}

interface NavItem {
  tab: NavTab;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'home',     icon: 'home-outline',      iconActive: 'home',      label: 'Home' },
  { tab: 'insights', icon: 'bar-chart-outline', iconActive: 'bar-chart', label: 'Insights' },
  { tab: 'accounts', icon: 'layers-outline',    iconActive: 'layers',    label: 'Accounts' },
];

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeTab,
  onTabPress,
  onAddPress,
}) => {
  const insets = useSafeAreaInsets();
  // Fixed at bottom: 16px + safe area
  const bottomPosition = 16 + insets.bottom;

  return (
    <View
      style={[styles.container, { bottom: bottomPosition }]}
      pointerEvents="box-none"
    >
      {/* Floating pill container — bg-glass with 3 circular 44px buttons */}
      <View style={styles.pillShadowWrapper}>
        <View style={styles.pill}>
          {/* Top highlight hairline */}
          <View style={styles.topHighlight} />

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <TouchableOpacity
                key={item.tab}
                style={styles.navBtnWrapper}
                onPress={() => onTabPress(item.tab)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: isActive }}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#FAFAFB', '#C8C8CD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.navBtn}
                  >
                    <Ionicons name={item.iconActive} size={22} color="#0A0A0B" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.navBtn, styles.navBtnInactive]}>
                    <Ionicons name={item.icon} size={22} color="#A1A1A6" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Separate 52px silver "+" circle for Add Transaction */}
      <TouchableOpacity
        onPress={onAddPress}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Add Transaction"
        style={styles.addBtnWrapper}
      >
        <LinearGradient
          colors={['#FAFAFB', '#C8C8CD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={28} color="#0A0A0B" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9999,
    elevation: 25,
  },
  pillShadowWrapper: {
    flex: 1,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 14,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(30, 30, 33, 0.72)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 7,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  navBtnWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnInactive: {
    backgroundColor: '#232326',
  },
  addBtnWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 14,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
});

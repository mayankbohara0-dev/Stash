import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Text as SvgText, Line as SvgLine } from 'react-native-svg';

import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { AppLogo } from '../../components/ui/AppLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

// 32px faint grid pattern rendered as SVG lines
function GridOverlay() {
  const GRID = 32;
  const cols = Math.ceil(width / GRID) + 1;
  const rows = Math.ceil(height * 0.6 / GRID) + 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height * 0.6}>
        {/* Vertical lines */}
        {Array.from({ length: cols }).map((_, i) => (
          <SvgLine
            key={`v-${i}`}
            x1={i * GRID} y1={0} x2={i * GRID} y2={height * 0.6}
            stroke={Colors.gridLine} strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: rows }).map((_, i) => (
          <SvgLine
            key={`h-${i}`}
            x1={0} y1={i * GRID} x2={width} y2={i * GRID}
            stroke={Colors.gridLine} strokeWidth={1}
          />
        ))}
      </Svg>
    </View>
  );
}

// Ghost "₹" glyph at 8% opacity behind the text
function GhostRupee() {
  return (
    <View style={styles.ghostWrapper} pointerEvents="none">
      <Svg width={width * 1.1} height={width * 1.1} viewBox="0 0 400 400">
        <SvgText
          x="200"
          y="340"
          textAnchor="middle"
          fontSize={360}
          fontWeight="700"
          fill={Colors.text}
          fillOpacity={0.05}
        >
          ₹
        </SvgText>
      </Svg>
    </View>
  );
}

import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity } from 'react-native';

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { updateUser } = useAuth();

  // Entrance animations
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(48)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const btnAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(btnAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    // Instant frictionless entry per prompt specification (UI ONLY: no auth required)
    updateUser({
      id: 'demo-user-1',
      email: 'alex@stash.app',
      full_name: 'Alex Vance',
      is_active: true,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-bleed hero-fade gradient */}
      <LinearGradient
        colors={Gradients.heroFade}
        locations={Gradients.heroFadeLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* Faint grid overlay */}
      <GridOverlay />

      {/* Ghost ₹ glyph */}
      <GhostRupee />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* AppLogo top-left */}
        <Animated.View style={[styles.logoRow, { opacity: logoAnim }]}>
          <AppLogo />
        </Animated.View>

        {/* Spacer — pushes content toward bottom */}
        <View style={styles.spacer} />

        {/* Bottom-aligned content block */}
        <Animated.View
          style={[
            styles.bottomContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Headline — Display, two lines, two-tone */}
          <View style={styles.headlineBlock}>
            <Text style={styles.headlineSecondary}>Your Money,</Text>
            <View style={styles.headlineLine2}>
              <Text style={styles.headlineMuted}>Clearly </Text>
              <Text style={styles.headlinePrimary}>Tracked</Text>
            </View>
          </View>

          {/* Body */}
          <Text style={styles.body}>
            Track spending, set budgets and see where every rupee goes, all in one private, beautifully simple place.
          </Text>

          {/* CTA */}
          <Animated.View style={{ opacity: btnAnim, marginTop: Spacing.xl, gap: Spacing.md }}>
            <PrimaryButton
              label="Get Started"
              onPress={handleGetStarted}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.signInBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  logoRow: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  spacer: {
    flex: 1,
  },
  ghostWrapper: {
    position: 'absolute',
    top: height * 0.05,
    left: -width * 0.05,
    zIndex: 0,
  },
  bottomContent: {
    paddingBottom: Spacing.xl,
    gap: Spacing.base,
  },
  headlineBlock: {
    gap: 0,
  },
  headlineSecondary: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.display,
    lineHeight: Typography.displayLineHeight,
    color: Colors.textSecondary,
    letterSpacing: Typography.display * Typography.displayTracking,
  },
  headlineLine2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  headlineMuted: {
    fontFamily: Typography.fontSans,
    fontSize: Typography.display,
    lineHeight: Typography.displayLineHeight,
    color: Colors.textSecondary,
    letterSpacing: Typography.display * Typography.displayTracking,
  },
  headlinePrimary: {
    fontFamily: Typography.fontHighlight,
    fontSize: 42,
    lineHeight: 46,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: Typography.base,
    lineHeight: 20,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
  signInBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  signInText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  signInHighlight: {
    color: Colors.text,
    fontWeight: Typography.semibold,
  },
});

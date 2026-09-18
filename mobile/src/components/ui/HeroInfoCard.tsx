import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Rect, Circle, Line, Path, Polygon, Defs, LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Colors, Gradients, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { SecondaryPill } from './SecondaryPill';

interface HeroInfoCardProps {
  title: string;
  body: string;
  pillLabel?: string;
  onPillPress?: () => void;
}

// Monochrome SVG illustration — coin stack + rising chart on easel, slightly tilted
function MonochromeIllustration() {
  return (
    <View style={{ transform: [{ rotate: '-6deg' }] }}>
      <Svg width={88} height={88} viewBox="0 0 88 88" fill="none">
        {/* Easel panel — dark card */}
        <Rect x="12" y="8" width="64" height="52" rx="8" fill="#1F1F22" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Inner panel highlight */}
        <Rect x="12" y="8" width="64" height="1" rx="0.5" fill="rgba(255,255,255,0.15)" />

        {/* Chart grid lines — very subtle */}
        <Line x1="18" y1="46" x2="70" y2="46" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <Line x1="18" y1="38" x2="70" y2="38" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <Line x1="18" y1="30" x2="70" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Bar chart — monochrome shades */}
        <Rect x="20" y="34" width="10" height="12" rx="3" fill="#3A3A3E" />
        <Rect x="34" y="28" width="10" height="18" rx="3" fill="#4A4A4E" />
        <Rect x="48" y="20" width="10" height="26" rx="3" fill="#5A5A5E" />
        {/* Silver highlighted bar */}
        <Rect x="62" y="14" width="8" height="32" rx="3" fill="url(#silver_bar)" />

        {/* Rising trend line */}
        <Path
          d="M20 44 L30 36 L44 30 L58 22 L68 16"
          stroke="#FAFAFB"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="2,2"
        />
        {/* Line endpoint dot */}
        <Circle cx="68" cy="16" r="3" fill="#FAFAFB" />

        {/* Easel legs */}
        <Line x1="28" y1="60" x2="22" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="60" y1="60" x2="66" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="44" y1="60" x2="44" y2="78" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" />

        {/* Coin stack */}
        <Polygon points="8,78 20,74 32,78 20,82" fill="#2A2A2E" />
        <Polygon points="8,74 20,70 32,74 20,78" fill="#3A3A3E" />
        <Polygon points="8,70 20,66 32,70 20,74" fill="#4A4A4E" />
        <Polygon points="8,66 20,62 32,66 20,70" fill="#C8C8CD" />
        {/* Top coin highlight */}
        <Path d="M8,66 Q20,62 32,66" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />

        {/* SVG gradient def */}
        <Defs>
          <SvgLinearGradient id="silver_bar" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FAFAFB" />
            <Stop offset="100%" stopColor="#C8C8CD" />
          </SvgLinearGradient>
        </Defs>
      </Svg>
    </View>
  );
}

export const HeroInfoCard: React.FC<HeroInfoCardProps> = ({
  title,
  body,
  pillLabel,
  onPillPress,
}) => {
  return (
    <LinearGradient
      colors={Gradients.raised}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.card}
    >
      {/* Top hairline highlight */}
      <View style={styles.topHighlight} />

      {/* Left: text content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {pillLabel && (
          <View style={styles.pillWrapper}>
            <SecondaryPill label={pillLabel} onPress={onPillPress} />
          </View>
        )}
      </View>

      {/* Right: illustration */}
      <View style={styles.illustrationWrapper}>
        <MonochromeIllustration />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.md,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.highlightTop,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.semibold,
    color: Colors.text,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  body: {
    fontSize: Typography.base,
    fontWeight: Typography.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  pillWrapper: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  illustrationWrapper: {
    flexShrink: 0,
    marginLeft: -8,
  },
});

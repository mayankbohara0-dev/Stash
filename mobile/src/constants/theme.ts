// ─── Foundry Premium Monochrome Design Tokens ────────────────────────────────
// Single source of truth. No raw hex values inside components.

// ── Raw palette ──────────────────────────────────────────────────────────────
export const Palette = {
  // Canvas / surfaces
  bgBase:          '#0A0A0B',
  bgInset:         '#0F0F11',
  bgRaisedTop:     '#1F1F22',
  bgRaisedBottom:  '#151517',
  bgGlass:         'rgba(30,30,33,0.72)',
  bgRaisedAlt:     '#232326', // inactive nav button

  // Borders / highlights
  borderHairline:  'rgba(255,255,255,0.08)',
  highlightTop:    'rgba(255,255,255,0.12)', // inset 0 1px 0 — used as borderTop tint
  shadowLift:      'rgba(0,0,0,0.55)',

  // Text
  textPrimary:     '#F5F5F7',
  textSecondary:   '#A1A1A6',
  textMuted:       '#86868C',

  // Silver (CTA / active state)
  silverTop:       '#FAFAFB',
  silverBottom:    '#C8C8CD',
  onSilver:        '#0A0A0B',

  // Hero fade stops (for LinearGradient)
  heroFade0:       '#DADADD',
  heroFade1:       '#8A8A8F',
  heroFade2:       '#1C1C1E',
  heroFade3:       '#0A0A0B',

  // Semantic / financial
  income:          '#7CE0A6',
  warning:         '#F5B453',
  danger:          '#FF7A72',
  incomeAlpha:     'rgba(124,224,166,0.14)',
  warningAlpha:    'rgba(245,180,83,0.14)',
  dangerAlpha:     'rgba(255,122,114,0.14)',

  // Grid overlay
  gridLine:        'rgba(255,255,255,0.04)',
} as const;

// ── Semantic aliases (what components should import) ─────────────────────────
export const Colors = {
  // Backgrounds
  background:    Palette.bgBase,
  secondaryBg:   Palette.bgInset,
  surface:       Palette.bgRaisedTop,    // compat alias → top of raised gradient
  surfaceAlt:    Palette.bgRaisedAlt,
  surfaceHigh:   '#28282C',
  surfaceInput:  Palette.bgInset,
  bgBase:        Palette.bgBase,
  bgInset:       Palette.bgInset,
  bgGlass:       Palette.bgGlass,

  // Borders / highlights
  border:        Palette.borderHairline,
  borderAlt:     'rgba(255,255,255,0.12)',
  highlightTop:  Palette.highlightTop,

  // Primary accent — Foundry silver monochrome
  primary:       Palette.silverTop,
  primaryDark:   Palette.silverBottom,
  primaryLight:  'rgba(250, 250, 251, 0.12)',

  // Silver (used in new premium components via Gradients.silver directly)
  silverTop:     Palette.silverTop,
  silverBottom:  Palette.silverBottom,

  // Text
  text:          Palette.textPrimary,
  textSecondary: Palette.textSecondary,
  textMuted:     Palette.textMuted,
  textLight:     Palette.textSecondary,
  textInverse:   Palette.onSilver,
  onSilver:      Palette.onSilver,

  // Financial semantics
  income:        Palette.income,
  incomeLight:   Palette.incomeAlpha,
  expense:       Palette.danger,
  expenseLight:  Palette.dangerAlpha,
  warning:       Palette.warning,
  warningLight:  Palette.warningAlpha,
  danger:        Palette.danger,
  dangerLight:   Palette.dangerAlpha,
  success:       Palette.income,
  successLight:  Palette.incomeAlpha,
  error:         Palette.danger,
  errorLight:    Palette.dangerAlpha,

  // Overlays
  overlay:       'rgba(0, 0, 0, 0.7)',
  overlayLight:  'rgba(255, 255, 255, 0.04)',
  gridLine:      Palette.gridLine,

  // Legacy compat aliases
  card:          Palette.bgRaisedTop,
  cardAlt:       Palette.bgRaisedAlt,
  darkBackground: Palette.bgBase,
  darkCard:      Palette.bgRaisedTop,
  darkBorder:    Palette.borderHairline,
  darkText:      Palette.textPrimary,
  darkTextSecondary: Palette.textSecondary,
  primaryOverlay: 'rgba(250,250,251,0.10)',
  errorLight2:   Palette.dangerAlpha,
  successLight2: Palette.incomeAlpha,
  warningLight2: Palette.warningAlpha,
  shadow:        Palette.shadowLift,
  divider:       Palette.borderHairline,
  borderLight:   Palette.bgRaisedAlt,
} as const;

// Gradient arrays — pass directly to LinearGradient colors prop
export const Gradients = {
  raised:      [Palette.bgRaisedTop, Palette.bgRaisedBottom] as const,
  silver:      [Palette.silverTop,   Palette.silverBottom]   as const,
  heroFade:    [Palette.heroFade0, Palette.heroFade1, Palette.heroFade2, Palette.heroFade3] as const,
  heroFadeLocations: [0, 0.28, 0.62, 1] as const,
} as const;

// ── Typography ────────────────────────────────────────────────────────────────
export const Typography = {
  // Size scale (px)
  xs:    12,   // caption min size
  sm:    12,   // maps to caption
  base:  14,   // body
  md:    16,   // row title / button
  lg:    18,
  xl:    20,   // title
  '2xl': 26,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,   // display

  // Display / hero
  display: 40,
  displayLineHeight: 44,

  // Font weights
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,

  // Tracking
  displayTracking: -0.03,
  titleTracking:   -0.02,

  // Font families
  fontFamily: 'Manrope-SemiBold',
  fontFamilyFallback: 'System',
  fontSans: 'Manrope-SemiBold',
  fontSansBold: 'Manrope-Bold',
  fontSansRegular: 'Manrope-Regular',
  fontHighlight: 'PlayfairDisplay-Bold',
  fontHighlightItalic: 'PlayfairDisplay-Italic',
  fontSerif: 'InstrumentSerif-Regular',
  fontSerifItalic: 'InstrumentSerif-Italic',
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:    4,
  sm:    8,
  md:    12,
  base:  16,
  lg:    20,   // screen side padding
  xl:    24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ── Border radius ─────────────────────────────────────────────────────────────
export const Radius = {
  sm:    6,
  md:    10,
  lg:    16,
  xl:    20,
  '2xl': 28,   // cards
  row:   24,   // list rows
  full:  9999, // pills / circles
} as const;

// ── Shadows ───────────────────────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    elevation: 14,
  },
  // Compat: named "primary" kept for any existing callers
  primary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// ── Touch targets ─────────────────────────────────────────────────────────────
export const Touch = {
  min: 44,    // px — minimum touch target size
  gap: 8,     // px — minimum gap between targets
} as const;

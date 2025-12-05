// Ultra-minimalistic Design System for ZK-IoTChain
// Glassmorphism aesthetic with violet-indigo accent

export const colors = {
    // Monochrome palette
    white: '#FFFFFF',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    black: '#000000',

    // Violet-indigo accent (primary)
    primary: {
        main: '#6366F1',      // Violet-indigo
        light: '#818CF8',     // Lighter shade
        dark: '#4F46E5',      // Darker shade
        subtle: '#EEF2FF',    // Very light background
    },

    // Status colors (minimalist approach)
    status: {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
    },

    // Transparent overlays for glassmorphism
    glass: {
        white: 'rgba(255, 255, 255, 0.1)',
        whiteStrong: 'rgba(255, 255, 255, 0.2)',
        dark: 'rgba(0, 0, 0, 0.1)',
        darkStrong: 'rgba(0, 0, 0, 0.2)',
    },
};

// Typography system
export const typography = {
    fonts: {
        // React Native uses system fonts by default
        default: 'System',
        heading: 'System',
        mono: 'Courier New',
    },

    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },

    weights: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Spacing scale (4px base)
export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
};

// Border radius
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
};

// Shadow system (soft, minimal shadows)
export const shadows = {
    // Soft shadows for depth
    sm: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    xl: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },

    // Colored shadows for accent elements
    primaryGlow: {
        shadowColor: colors.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
};

// Glassmorphism styles
export const glassmorphism = {
    // Light glass card
    light: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...shadows.md,
    },

    // Dark glass card
    dark: {
        backgroundColor: 'rgba(31, 41, 55, 0.7)', // gray-800 with opacity
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...shadows.md,
    },

    // Primary accent glass
    primary: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
        ...shadows.md,
    },
};

// Common component styles
export const components = {
    // Card styles
    card: {
        base: {
            borderRadius: borderRadius.xl,
            padding: spacing[4],
            ...glassmorphism.dark,
        },
        elevated: {
            borderRadius: borderRadius.xl,
            padding: spacing[4],
            ...glassmorphism.dark,
            ...shadows.lg,
        },
    },

    // Button styles
    button: {
        primary: {
            backgroundColor: colors.primary.main,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[6],
            borderRadius: borderRadius.md,
            ...shadows.md,
        },
        secondary: {
            backgroundColor: colors.gray[700],
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[6],
            borderRadius: borderRadius.md,
            ...shadows.sm,
        },
        ghost: {
            backgroundColor: 'transparent',
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[6],
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: colors.primary.main,
        },
    },

    // Input styles
    input: {
        base: {
            backgroundColor: colors.gray[800],
            borderWidth: 1,
            borderColor: colors.gray[700],
            borderRadius: borderRadius.md,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            color: colors.white,
            fontSize: typography.sizes.base,
        },
        focused: {
            borderColor: colors.primary.main,
            ...shadows.primaryGlow,
        },
    },

    // Icon container (geometric)
    iconContainer: {
        base: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary.subtle,
        },
        primary: {
            backgroundColor: colors.primary.main,
        },
        glass: {
            ...glassmorphism.primary,
        },
    },
};

// Layout utilities
export const layout = {
    container: {
        flex: 1,
        backgroundColor: colors.gray[900],
    },

    contentPadding: {
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[4],
    },

    section: {
        marginBottom: spacing[6],
    },

    grid: {
        gap: spacing[4],
    },
};

// Export complete theme
export const minimalistTheme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    glassmorphism,
    components,
    layout,
};

export default minimalistTheme;

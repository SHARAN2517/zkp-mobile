// Cyberpunk Design System for ZK-IoTChain

// Neon Color Palette
export const colors = {
    // Backgrounds
    bg: {
        primary: '#0a0e27',      // Deep space blue
        secondary: '#0d1117',    // Darker background
        card: '#1a1f3a',         // Card background
        elevated: '#1e2443',     // Elevated elements
    },

    // Neon Accents
    neon: {
        cyan: '#00ffff',         // Bright cyan
        magenta: '#ff00ff',      // Hot magenta
        purple: '#b026ff',       // Neon purple
        green: '#39ff14',        // Radioactive green
        pink: '#ff1493',         // Hot pink
        blue: '#0080ff',         // Electric blue
        yellow: '#ffff00',       // Neon yellow
    },

    // Glow Colors (with alpha)
    glow: {
        cyan: 'rgba(0, 255, 255, 0.5)',
        magenta: 'rgba(255, 0, 255, 0.5)',
        purple: 'rgba(176, 38, 255, 0.5)',
        green: 'rgba(57, 255, 20, 0.5)',
        blue: 'rgba(0, 128, 255, 0.5)',
    },

    // Status Colors
    status: {
        success: '#39ff14',
        error: '#ff0055',
        warning: '#ffaa00',
        info: '#00ffff',
    },

    // Text
    text: {
        primary: '#ffffff',
        secondary: '#a0aec0',
        muted: '#718096',
        neon: '#00ffff',
    },
};

// Glowing Effects
export const glowEffects = {
    text: {
        cyan: {
            textShadowColor: colors.neon.cyan,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
        },
        magenta: {
            textShadowColor: colors.neon.magenta,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
        },
        purple: {
            textShadowColor: colors.neon.purple,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
        },
        green: {
            textShadowColor: colors.neon.green,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 10,
        },
    },

    box: {
        cyan: {
            shadowColor: colors.neon.cyan,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
        },
        magenta: {
            shadowColor: colors.neon.magenta,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
        },
        purple: {
            shadowColor: colors.neon.purple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 10,
        },
    },
};

// Typography
export const typography = {
    // Cyberpunk-style fonts (fallback to system)
    fonts: {
        heading: 'Orbitron, monospace',
        body: 'Rajdhani, sans-serif',
        mono: 'Courier New, monospace',
    },

    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
        huge: 48,
    },

    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Animations
export const animations = {
    glow: {
        duration: 2000,
        easing: 'ease-in-out',
    },
    pulse: {
        duration: 1500,
        easing: 'ease-in-out',
    },
    scan: {
        duration: 3000,
        easing: 'linear',
    },
};

// Grid Pattern
export const gridPattern = {
    color: colors.neon.cyan,
    opacity: 0.1,
    size: 20,
};

// Common Component Styles
export const commonStyles = {
    // Neon Border
    neonBorder: {
        borderWidth: 1,
        borderColor: colors.neon.cyan,
        ...glowEffects.box.cyan,
    },

    // Glass Effect
    glass: {
        backgroundColor: 'rgba(26, 31, 58, 0.6)',
        backdropFilter: 'blur(10px)',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 255, 0.2)',
    },

    // Holographic Card
    holoCard: {
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: colors.neon.cyan,
        borderRadius: borderRadius.lg,
        ...glowEffects.box.cyan,
    },

    // Terminal Style
    terminal: {
        backgroundColor: colors.bg.secondary,
        borderWidth: 1,
        borderColor: colors.neon.green,
        fontFamily: typography.fonts.mono,
        color: colors.neon.green,
    },
};

export default {
    colors,
    glowEffects,
    typography,
    spacing,
    borderRadius,
    animations,
    gridPattern,
    commonStyles,
};

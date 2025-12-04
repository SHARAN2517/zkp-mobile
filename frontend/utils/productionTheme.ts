// Design system based on zkp.pages.dev
export const productionTheme = {
    colors: {
        // Backgrounds - matching production site
        bg: {
            primary: '#212529',      // Dark blue-grey
            secondary: '#2c3135',    // Slightly lighter
            card: '#343a40',         // Card background
            elevated: '#495057',     // Elevated elements
        },

        // Primary colors from production
        primary: {
            main: '#0dcaf0',         // Bright cyan/blue
            light: '#31d2f2',        // Lighter cyan
            dark: '#0597b5',         // Darker cyan
        },

        // Accent colors
        success: '#20c997',        // Green for success
        warning: '#ffc107',        // Yellow/orange
        danger: '#dc3545',         // Red
        info: '#0dcaf0',           // Cyan

        // Text
        text: {
            primary: '#ffffff',
            secondary: '#adb5bd',
            muted: '#6c757d',
            accent: '#0dcaf0',
        },

        // Borders
        border: {
            light: 'rgba(255, 255, 255, 0.1)',
            medium: 'rgba(255, 255, 255, 0.2)',
            dark: 'rgba(0, 0, 0, 0.1)',
        },
    },

    typography: {
        fontFamily: {
            default: 'System',
            heading: 'System',
        },
        sizes: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
        },
        weights: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
        },
    },
};

export default productionTheme;

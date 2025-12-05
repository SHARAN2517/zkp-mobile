/**
 * WalletConnect Compatibility Polyfills
 * This file provides polyfills for web3-related functionality on React Native
 */

// Import polyfills in the correct order
import 'react-native-get-random-values';

// Polyfill for crypto.getRandomValues if needed
if (typeof global.crypto === 'undefined') {
    global.crypto = {
        getRandomValues: (arr: any) => {
            const randomBytes = require('react-native-get-random-values');
            return randomBytes.getRandomValues(arr);
        },
    } as any;
}

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('text-encoding');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Export for use
export { };

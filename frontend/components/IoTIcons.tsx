// IoT-themed SVG Icon Components
// Minimalistic, geometric icon designs

import React from 'react';
import Svg, { Path, Circle, Rect, Line, G, Polygon } from 'react-native-svg';
import { ViewStyle } from 'react-native';

interface IconProps {
    size?: number;
    color?: string;
    style?: ViewStyle;
}

// Temperature Sensor Icon
export const TemperatureIcon: React.FC<IconProps> = ({
    size = 24,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Path
            d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx="11.5" cy="18.5" r="1.5" fill={color} />
        <Path d="M11.5 3v12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

// Humidity Sensor Icon
export const HumidityIcon: React.FC<IconProps> = ({
    size = 24,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M8 15c0-1.38 1.12-2.5 2.5-2.5S13 13.62 13 15"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

// Motion Detector Icon
export const MotionIcon: React.FC<IconProps> = ({
    size = 24,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Circle cx="12" cy="12" r="2" fill={color} />
        <Path
            d="M12 5v-2M12 21v-2M5 12h-2M21 12h-2"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <Path
            d="M16.24 7.76l1.42-1.42M6.34 17.66l1.42-1.42M7.76 7.76l-1.42-1.42M17.66 17.66l-1.42-1.42"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
    </Svg>
);

// Gateway Device Icon
export const GatewayIcon: React.FC<IconProps> = ({
    size = 24,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            stroke={color}
            strokeWidth="1.5"
        />
        <Circle cx="7" cy="9" r="1.5" fill={color} />
        <Circle cx="12" cy="9" r="1.5" fill={color} />
        <Circle cx="17" cy="9" r="1.5" fill={color} />
        <Path
            d="M6 14h12M6 17h8"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

// Blockchain Node Icon
export const BlockchainNodeIcon: React.FC<IconProps> = ({
    size = 24,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Rect
            x="9"
            y="9"
            width="6"
            height="6"
            rx="1"
            stroke={color}
            strokeWidth="1.5"
        />
        <Circle cx="5" cy="5" r="2" stroke={color} strokeWidth="1.5" />
        <Circle cx="19" cy="5" r="2" stroke={color} strokeWidth="1.5" />
        <Circle cx="5" cy="19" r="2" stroke={color} strokeWidth="1.5" />
        <Circle cx="19" cy="19" r="2" stroke={color} strokeWidth="1.5" />
        <Path
            d="M7 5h2M15 5h2M5 7v2M5 15v2M12 7V5M12 19v-4M19 7v2M19 15v2M7 19h2M15 19h2"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </Svg>
);

// Merkle Tree Icon
export const MerkleTreeIcon: React.FC<IconProps> = ({
    size = 48,
    color = '#6366F1',
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
        {/* Root node */}
        <Circle cx="24" cy="8" r="4" stroke={color} strokeWidth="1.5" fill="none" />

        {/* Second level */}
        <Circle cx="12" cy="20" r="3" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="36" cy="20" r="3" stroke={color} strokeWidth="1.5" fill="none" />

        {/* Third level */}
        <Circle cx="6" cy="32" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="18" cy="32" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="30" cy="32" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />
        <Circle cx="42" cy="32" r="2.5" stroke={color} strokeWidth="1.5" fill="none" />

        {/* Leaf nodes */}
        <Rect x="3" y="40" width="6" height="4" rx="1" stroke={color} strokeWidth="1" fill={color} opacity="0.3" />
        <Rect x="15" y="40" width="6" height="4" rx="1" stroke={color} strokeWidth="1" fill={color} opacity="0.3" />
        <Rect x="27" y="40" width="6" height="4" rx="1" stroke={color} strokeWidth="1" fill={color} opacity="0.3" />
        <Rect x="39" y="40" width="6" height="4" rx="1" stroke={color} strokeWidth="1" fill={color} opacity="0.3" />

        {/* Connecting lines */}
        <Line x1="24" y1="12" x2="12" y2="17" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="24" y1="12" x2="36" y2="17" stroke={color} strokeWidth="1" strokeDasharray="2 2" />

        <Line x1="12" y1="23" x2="6" y2="29" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="12" y1="23" x2="18" y2="29" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="36" y1="23" x2="30" y2="29" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <Line x1="36" y1="23" x2="42" y2="29" stroke={color} strokeWidth="1" strokeDasharray="2 2" />

        <Line x1="6" y1="34.5" x2="6" y2="40" stroke={color} strokeWidth="1" />
        <Line x1="18" y1="34.5" x2="18" y2="40" stroke={color} strokeWidth="1" />
        <Line x1="30" y1="34.5" x2="30" y2="40" stroke={color} strokeWidth="1" />
        <Line x1="42" y1="34.5" x2="42" y2="40" stroke={color} strokeWidth="1" />
    </Svg>
);

// Circuit Board Pattern Component (decorative background)
export const CircuitPattern: React.FC<IconProps & { opacity?: number }> = ({
    size = 200,
    color = '#6366F1',
    opacity = 0.1,
    style
}) => (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={style}>
        <G opacity={opacity}>
            {/* Horizontal lines */}
            <Line x1="0" y1="40" x2="200" y2="40" stroke={color} strokeWidth="1" />
            <Line x1="0" y1="80" x2="200" y2="80" stroke={color} strokeWidth="1" />
            <Line x1="0" y1="120" x2="200" y2="120" stroke={color} strokeWidth="1" />
            <Line x1="0" y1="160" x2="200" y2="160" stroke={color} strokeWidth="1" />

            {/* Vertical lines */}
            <Line x1="40" y1="0" x2="40" y2="200" stroke={color} strokeWidth="1" />
            <Line x1="80" y1="0" x2="80" y2="200" stroke={color} strokeWidth="1" />
            <Line x1="120" y1="0" x2="120" y2="200" stroke={color} strokeWidth="1" />
            <Line x1="160" y1="0" x2="160" y2="200" stroke={color} strokeWidth="1" />

            {/* Connection nodes */}
            <Circle cx="40" cy="40" r="3" fill={color} />
            <Circle cx="80" cy="80" r="3" fill={color} />
            <Circle cx="120" cy="120" r="3" fill={color} />
            <Circle cx="160" cy="160" r="3" fill={color} />
            <Circle cx="80" cy="40" r="2" fill={color} />
            <Circle cx="120" cy="80" r="2" fill={color} />
            <Circle cx="160" cy="40" r="2" fill={color} />
        </G>
    </Svg>
);

// Export all icons
export default {
    TemperatureIcon,
    HumidityIcon,
    MotionIcon,
    GatewayIcon,
    BlockchainNodeIcon,
    MerkleTreeIcon,
    CircuitPattern,
};

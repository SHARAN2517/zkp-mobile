// WebSocket Hook for Real-Time Updates
// Connects to backend WebSocket for multi-device synchronization

import { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

export interface UseWebSocketReturn {
    connected: boolean;
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
    send: (message: WebSocketMessage) => void;
    lastMessage: WebSocketMessage | null;
}

export function useWebSocket(clientId: string, onMessage?: (message: WebSocketMessage) => void): UseWebSocketReturn {
    const ws = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout>();
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [clientId]);

    const connect = () => {
        try {
            const websocket = new WebSocket(`${WS_URL}/${clientId}`);

            websocket.onopen = () => {
                console.log('[WebSocket] Connected');
                setConnected(true);
                reconnectAttempts.current = 0;

                // Send ping every 30 seconds to keep connection alive
                const pingInterval = setInterval(() => {
                    if (websocket.readyState === WebSocket.OPEN) {
                        websocket.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);

                websocket.onclose = () => {
                    clearInterval(pingInterval);
                };
            };

            websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as WebSocketMessage;
                    setLastMessage(message);

                    if (onMessage) {
                        onMessage(message);
                    }
                } catch (error) {
                    console.error('[WebSocket] Error parsing message:', error);
                }
            };

            websocket.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };

            websocket.onclose = () => {
                console.log('[WebSocket] Disconnected');
                setConnected(false);
                ws.current = null;

                // Attempt to reconnect
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    console.log(`[WebSocket] Reconnecting in ${delay}ms...`);

                    reconnectTimeout.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        connect();
                    }, delay);
                } else {
                    console.error('[WebSocket] Max reconnection attempts reached');
                }
            };

            ws.current = websocket;
        } catch (error) {
            console.error('[WebSocket] Connection error:', error);
        }
    };

    const disconnect = () => {
        if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
        }

        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
    };

    const subscribe = (topic: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'subscribe',
                topic
            }));
        }
    };

    const unsubscribe = (topic: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                type: 'unsubscribe',
                topic
            }));
        }
    };

    const send = (message: WebSocketMessage) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message));
        } else {
            console.warn('[WebSocket] Cannot send message: not connected');
        }
    };

    return {
        connected,
        subscribe,
        unsubscribe,
        send,
        lastMessage
    };
}

export default useWebSocket;

// Push Notification Service for ZK-IoTChain
// Handles registration, permissions, and notification display

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export interface NotificationPermissionStatus {
    granted: boolean;
    canAskAgain: boolean;
    status: string;
}

export class NotificationService {
    private static expoPushToken: string | null = null;

    /**
     * Register device for push notifications
     * Returns the Expo push token
     */
    static async registerForPushNotifications(): Promise<string | null> {
        if (!Device.isDevice) {
            console.log('Push notifications only work on physical devices');
            return null;
        }

        try {
            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push notification permissions');
                return null;
            }

            // Get Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: 'your-project-id', // Replace with actual Expo project ID
            });

            this.expoPushToken = tokenData.data;

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#6366F1',
                });
            }

            return this.expoPushToken;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    }

    /**
     * Check notification permissions status
     */
    static async getPermissionStatus(): Promise<NotificationPermissionStatus> {
        const { status, canAskAgain } = await Notifications.getPermissionsAsync();
        return {
            granted: status === 'granted',
            canAskAgain,
            status,
        };
    }

    /**
     * Schedule a local notification
     */
    static async scheduleNotification(
        title: string,
        body: string,
        data?: Record<string, any>,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: data || {},
                sound: true,
            },
            trigger: trigger || null, // null = immediate
        });
    }

    /**
     * Cancel a scheduled notification
     */
    static async cancelNotification(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    /**
     * Cancel all scheduled notifications
     */
    static async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    /**
     * Get Expo push token
     */
    static getExpoPushToken(): string | null {
        return this.expoPushToken;
    }

    /**
     * Send notification for device event
     */
    static async notifyDeviceEvent(
        deviceId: string,
        eventType: 'registered' | 'data_submitted' | 'offline' | 'alert',
        message: string
    ): Promise<void> {
        const titles = {
            registered: '✅ Device Registered',
            data_submitted: '📊 Data Submitted',
            offline: '⚠️ Device Offline',
            alert: '🚨 Device Alert',
        };

        await this.scheduleNotification(
            titles[eventType],
            message,
            { deviceId, eventType }
        );
    }

    /**
     * Send notification for blockchain event
     */
    static async notifyBlockchainEvent(
        eventType: 'anchored' | 'verified' | 'failed',
        message: string,
        txHash?: string
    ): Promise<void> {
        const titles = {
            anchored: '⛓️ Data Anchored',
            verified: '✅ Proof Verified',
            failed: '❌ Transaction Failed',
        };

        await this.scheduleNotification(
            titles[eventType],
            message,
            { eventType, txHash }
        );
    }

    /**
     * Set up notification listeners
     */
    static setupNotificationListeners(
        onReceived?: (notification: Notifications.Notification) => void,
        onInteraction?: (response: Notifications.NotificationResponse) => void
    ): void {
        // Notification received while app is foregrounded
        if (onReceived) {
            Notifications.addNotificationReceivedListener(onReceived);
        }

        // User interacted with notification
        if (onInteraction) {
            Notifications.addNotificationResponseReceivedListener(onInteraction);
        }
    }
}

export default NotificationService;

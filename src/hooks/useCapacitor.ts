
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Clipboard } from '@capacitor/clipboard';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { SplashScreen } from '@capacitor/splash-screen';
import { Preferences } from '@capacitor/preferences';
import { Toast } from '@capacitor/toast';
import { Keyboard } from '@capacitor/keyboard';
import { ScreenReader } from '@capacitor/screen-reader';
import { useAppDispatch } from './redux';
import { setPushToken, addNotification } from '../store/slices/notificationSlice';

export const useCapacitor = () => {
  const dispatch = useAppDispatch();
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [appInfo, setAppInfo] = useState<any>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeCapacitor();
    } else {
      console.log('Running in web environment - Capacitor features disabled');
    }
  }, []);

  const initializeCapacitor = async () => {
    try {
      // Get device info
      const info = await Device.getInfo();
      setDeviceInfo(info);

      // Get app info
      const app = await App.getInfo();
      setAppInfo(app);

      // Setup push notifications
      await setupPushNotifications();

      // Setup local notifications
      await setupLocalNotifications();

      // Setup network monitoring
      await setupNetworkMonitoring();

      // Setup app state listeners
      await setupAppListeners();

      // Setup keyboard listeners
      await setupKeyboardListeners();

      // Hide splash screen
      await SplashScreen.hide();

    } catch (error) {
      console.error('Error initializing Capacitor:', error);
    }
  };

  const setupPushNotifications = async () => {
    try {
      // Request permission
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
      }

      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        dispatch(setPushToken(token.value));
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        dispatch(addNotification({
          id: Date.now().toString(),
          title: notification.title || 'Thông báo mới',
          body: notification.body || '',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: notification.data
        }));
      });

      // Listen for push notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
      });

    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  };

  const setupLocalNotifications = async () => {
    try {
      const permissions = await LocalNotifications.requestPermissions();
      console.log('Local notification permissions:', permissions);
    } catch (error) {
      console.error('Error setting up local notifications:', error);
    }
  };

  const setupNetworkMonitoring = async () => {
    try {
      const status = await Network.getStatus();
      setNetworkStatus(status);

      Network.addListener('networkStatusChange', (status) => {
        setNetworkStatus(status);
      });
    } catch (error) {
      console.error('Error setting up network monitoring:', error);
    }
  };

  const setupAppListeners = async () => {
    try {
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      App.addListener('appUrlOpen', (event) => {
        console.log('App opened via URL:', event.url);
      });

      App.addListener('backButton', ({ canGoBack }) => {
        console.log('Back button pressed. Can go back?', canGoBack);
      });
    } catch (error) {
      console.error('Error setting up app listeners:', error);
    }
  };

  const setupKeyboardListeners = async () => {
    try {
      Keyboard.addListener('keyboardWillShow', (info) => {
        console.log('Keyboard will show with height:', info.keyboardHeight);
      });

      Keyboard.addListener('keyboardDidShow', (info) => {
        console.log('Keyboard did show with height:', info.keyboardHeight);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('Keyboard will hide');
      });

      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard did hide');
      });
    } catch (error) {
      console.error('Error setting up keyboard listeners:', error);
    }
  };

  // Utility functions
  const hapticFeedback = (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      try {
        Haptics.impact({ style });
      } catch (error) {
        console.error('Error triggering haptic feedback:', error);
      }
    }
  };

  const openBrowser = async (url: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Browser.open({ url });
      } catch (error) {
        console.error('Error opening browser:', error);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.write({ string: text });
      await showToast('Đã sao chép vào clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    try {
      await Share.share({ title, text, url });
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const showToast = async (text: string) => {
    try {
      await Toast.show({ text, duration: 'short' });
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  };

  const scheduleNotification = async (title: string, body: string, scheduleAt: Date) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: scheduleAt },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const storeData = async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const getData = async (key: string) => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  };

  const removeData = async (key: string) => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing data:', error);
    }
  };

  const hideKeyboard = async () => {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  };

  const speak = async (text: string) => {
    try {
      await ScreenReader.speak({ value: text });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  };

  return {
    deviceInfo,
    networkStatus,
    appInfo,
    hapticFeedback,
    openBrowser,
    copyToClipboard,
    shareContent,
    showToast,
    scheduleNotification,
    storeData,
    getData,
    removeData,
    hideKeyboard,
    speak,
    isNative: Capacitor.isNativePlatform(),
  };
};

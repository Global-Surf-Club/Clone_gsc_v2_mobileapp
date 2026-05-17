import notifee, {
  AndroidBadgeIconType,
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import Profile from '../api/Profile';

const defaultChannelId = 'default';

const NotifeeUtility = () => {
  const createAndroidChannel = async () => {
    return await notifee.createChannel({
      id: defaultChannelId,
      name: 'Default',
      sound: 'default',
      importance: AndroidImportance.HIGH,
    });
  };

  const showNotification = async (id, title, message, data, option = {}) => {
    await createAndroidChannel();
    await notifee.requestPermission(); // required for IOS on every display

    await notifee.displayNotification({
      title: title || '',
      body: message || '',
      android: {
        channelId: defaultChannelId,
        badgeIconType: AndroidBadgeIconType.SMALL,
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
      data: {
        data,
      },
    });
  };

  // Notification Badge
  const getNotificationCount = async () => {
    const data = JSON.parse(await Profile.getNotificationCount());
    return data?.toString();
  };

  const getMessageNotificationCount = async () => {
    const data = JSON.parse(await Profile.getMessageNotificationCount());
    return data?.toString();
  };

  const updateNotificationBadge = async () => {
    let count = await getNotificationCount();
    await setNotificationBadge(count);
  };

  const setNotificationBadge = async (newCount = 0) => {
    if (Platform.OS !== 'ios') return;

    await notifee.requestPermission(); // required for IOS on every display
    const badgeCount = newCount > 0 ? newCount : 0; // validation
    await notifee.setBadgeCount(badgeCount);
  };

  const cancelAllLocalNotifications = () => {
    notifee.cancelAllNotifications();
  };

  const cancelAllDeliveredNotifications = () => {
    notifee.cancelDisplayedNotifications();
  };

  return {
    showNotification,
    cancelAllLocalNotifications,
    cancelAllDeliveredNotifications,
    setNotificationBadge,
    updateNotificationBadge,
  };
};

export default NotifeeUtility;

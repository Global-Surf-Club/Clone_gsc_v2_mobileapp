import {TransitionPresets} from '@react-navigation/stack';
import {Linking, Platform} from 'react-native';
import {userSkillLevel} from './Constants';

export const defaultNavigationOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  headerStyle: {
    backgroundColor: '',
    elevation: 0,
  },
  drawerStyle: {
    width: '100%',
  },
  headerBackTitle: 'Back',
  headerTintColor: '',
  headerTitleAlign: 'center',
  headerShown: false,
  swipeEnabled: false,
};

export const getBase64Url = data => {
  return `data:image/jpeg;base64, ${data}`;
};

export let NOTIFICATION_DATA = null;
export const setNotificationData = data => {
  NOTIFICATION_DATA = data;
};

export const openMap = (lat, long, label = '') => {
  const scheme = Platform.select({ios: 'maps:0,0?q=', android: 'geo:0,0?q='});
  const latLng = `${lat},${long}`;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`,
  });
  Linking.openURL(url);
};

export const getHighLow = data => {
  let high = 0;
  let highTime = null;
  let low = 0;
  let lowTime = null;
  data.forEach(item => {
    if (item.type === 'high') {
      if (high < item.height) {
        high = item.height;
        highTime = item.time;
      }
    } else {
      if (low > item.height) {
        low = item.height;
        lowTime = item.time;
      }
    }
  });

  return {high, low, highTime, lowTime};
};

export const directions = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

export const getWindDirection = deg => {
  let index = Math.round(deg / 22.5);
  return directions[index % 16] ?? '';
};

export const getSwellDirection = deg => {
  let index = Math.round(deg / 22.5);
  return directions[index % 16] ?? '';
};

export const getUserInfoText = item => {
  return `${
    (item?.city ?? item?.state ? (item?.city ?? item?.state) + ', ' : '') +
    (item?.country ?? '')
  }\n${userSkillLevel[item?.surferSkillLevel ?? 0]}, ${
    item?.carOwner ? 'Driver' : 'Passenger'
  }`;
};

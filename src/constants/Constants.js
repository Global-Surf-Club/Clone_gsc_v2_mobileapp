import { Dimensions, Platform, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { dynamicSize, getFontSize, getLineSize } from './Responsive';

export const SCREEN_HEIGHT = Dimensions.get('screen').height;
export const CURRENT_HEIGHT = Dimensions.get('window').height;
export const CURRENT_WIDTH = Dimensions.get('window').width;
export const STATUSBAR_HEIGHT =
  Platform.OS === 'ios' ? getStatusBarHeight() : StatusBar.currentHeight;

export const isIOS = Platform.OS === 'ios';

// export const fontFamily = {
//   poppinsM: 'Poppins-Medium',
//   poppinsR: Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
//   poppinsS: Platform.OS == 'android'
//     ? 'Proxima-Nova-Alt-Bold'
//     : 'Proxima Nova Alt Bold',
//   // ProximaAB: 'Poppins-SemiBold',
//   ProximaAB:
//     Platform.OS == 'android'
//       ? 'Proxima-Nova-Alt-Bold'
//       : 'Proxima Nova Alt Bold',
//   ProximaAL:
//     Platform.OS == 'android'
//       ? 'Proxima-Nova-Alt-Light'
//       : 'Proxima Nova Alt Light',
//   ProximaAT:
//     Platform.OS == 'android'
//       ? 'Proxima-Nova-Alt-Thin'
//       : 'Proxima Nova Alt Thin',
//   ProximaBlack:
//     Platform.OS == 'android' ? 'Proxima-Nova-Black' : 'Proxima Nova Black',
//   ProximaBold:   Platform.OS == 'android'
//   ? 'Proxima-Nova-Alt-Bold'
//   : 'Proxima Nova Alt Bold',
//   ProximaExtraBold:
//     Platform.OS == 'android'
//       ? 'Proxima-Nova-Extrabold'
//       : 'Proxima Nova Extrabold',
//   ProximaT:
//     Platform.OS == 'android' ? 'Proxima-Nova-Thin' : 'Proxima Nova Thin',
//   ProximaR:
//     Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
// };

export const fontFamily = {
  poppinsM:
    Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
  poppinsR:
    Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
  poppinsS:
    Platform.OS == 'android' ? 'Proxima-Nova-Bold' : 'Proxima Nova Bold',
  ProximaAB:
    Platform.OS == 'android' ? 'Proxima-Nova-Bold' : 'Proxima Nova Bold',
  ProximaAL:
    Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
  ProximaAT:
    Platform.OS == 'android' ? 'Proxima-Nova-Thin' : 'Proxima Nova Thin',
  ProximaBlack:
    Platform.OS == 'android' ? 'Proxima-Nova-Black' : 'Proxima Nova Black',
  ProximaBold:
    Platform.OS == 'android' ? 'Proxima-Nova-Bold' : 'Proxima Nova Bold',
  ProximaExtraBold:
    Platform.OS == 'android'
      ? 'Proxima-Nova-Extrabold'
      : 'Proxima Nova Extrabold',
  ProximaT:
    Platform.OS == 'android' ? 'Proxima-Nova-Thin' : 'Proxima Nova Thin',
  ProximaR:
    Platform.OS == 'android' ? 'ProximaNova-Regular' : 'Proxima Nova Regular',
};

// export const fontFamily = {
//   poppinsM:'ProximaNova-Regular',
//   poppinsR: 'ProximaNova-Regular',
//   poppinsS: 'Proxima-Nova-Bold',
//   ProximaAB:  'Proxima-Nova-Bold',
//   ProximaAL:'ProximaNova-Regular' ,
//   ProximaAT: 'Proxima-Nova-Thin',
//   ProximaBlack:  'Proxima-Nova-Black' ,
//   ProximaBold:  'Proxima-Nova-Bold',
//   ProximaExtraBold: 'Proxima-Nova-Extrabold',
//   ProximaT:  'Proxima-Nova-Thin' ,
//   ProximaR:'ProximaNova-Regular',
// }

export const NotInvitedMessage = `Welcome! We are working hard to get Global Surf Club ready for everyone. Members can join from existing members invitation and if you haven’t been invited please know an existing member can vouch for you when they see they know you.`;
export const NotPaidMessage = `Thank you for downloading Global Surf Club! We’re a community-powered ocean sports mobile app platform built on a vouch-for-a-member process. If you know a current member, or club please ask them to vouch for you to unlock more community access as this is how we are keeping the community truly safe and advertising-free.`;

export const Color = {
  black: '#192E3E',
  black0: '#000',
  yellow: '#D3F15A',
  white: '#FFFFFF',
  gray: '#9098A5',
  golden: '#ff5100',
  lightGray: '#E5E8EC',
  primary: '#1FBDCF',
  themeColor: '#192E3E',
  lightblue: '#1FBDCF',
  cardbg: '#E5E8EC',
  starbg: '#FFC107',
  tablebgblue: '#c5e9ed',
  reportcardbg: '#EFEFEF',
  cardgray: '#AFAFAF',
  lightpink: '#f5edf1',
  GSCbg: '#D1D1D6',
  green: '#41AF89',
  red: '#ff3d3d',
  switch: '#49daeb',
  notificationbg: '#1EBDCF26',
};

export const fontSize = {
  font8: getFontSize(8),
  font10: getFontSize(10),
  font11: getFontSize(11),
  font12: getFontSize(12),
  font13: getFontSize(13),
  font14: getFontSize(14),
  font16: getFontSize(16),
  font17: getFontSize(17),
  font21: getFontSize(21),
  font22: getFontSize(22),
  font24: getFontSize(24),
  font26: getFontSize(26),
  font30: getFontSize(30),
  font34: getFontSize(34),
};

export const resizeMode = {
  center: 'cover',
  background: Color.reportcardbg,
};

export const keyboardType = {
  default: 'default',
  numberPad: 'number-pad',
  decimalPad: 'decimal-pad',
  numeric: 'numeric',
  emailAddress: 'email-address',
  phonePad: 'phone-pad',
};
export const maxLength = {
  phoneNumber: 10,
  password: 21,
  name: 40,
  email: 40,
  address: 120,
  otp: 6,
  measurment: 150,
  quantity: 4,
};
export const text = {
  title: {
    fontSize: getFontSize(20),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaBold,
  },
  subtitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaBold,
    lineHeight: getLineSize(20),
  },
  smalltitle: {
    fontSize: getFontSize(14),
    color: Color.gray,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(14),
  },
  boxtext: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    lineHeight: 15,
  },
  tripitemtitle: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaBold,
  },
  tripdetail: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaBold,
    lineHeight: getLineSize(18),
  },
  usernametitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(19),
  },
  usernameboldtitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaBold,
    lineHeight: getLineSize(19),
  },
  usernamestatus: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    lineHeight: getLineSize(16),
  },
};
export const Userprofile = {
  profile: {
    height: dynamicSize(45),
    width: dynamicSize(45),
  },
};
export const Grid = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
};
export const Shadow = {
  boxShadow: {
    shadowColor: Platform.OS === 'android' ? Color.black : '#969696',
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
};
export const borderstyle = {
  botttomborder: {
    borderBottomWidth: 1,
    borderBottomColor: Color.gray,
  },
};

export const StorageKeys = {
  Token: 'access_token',
  UserName: 'user_name',
  userId: 'user_id',
  BadgeCount: 'BadgeCount',
  MeaageCount: 'MeaageCount',
  delete: 'delete',
  read: 'read',
  unread: 'unread',
};

export const triptype = [
  'Surf',
  'Wave Pool',
  'Kite Surfing',
  'BodyBoarding',
  'Paddle Boarding',
  'WakeBoarding',
  'Wind Surfing',
  'Body Surfing',
  'Skating',
  'Snowboarding',
];

export const skill = ['Beginner', 'Intermediate', 'Pro', 'Any'];
export const board = ['Short', 'Long', 'All'];
export const driverRating = ['Beginner', 'Intermediate', 'Pro'];
export const forecastRating = ['Flat', 'Poor', 'Fair', 'Good', 'Epic'];
export const userSkillLevel = ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
export const countryList = [
  'GB',
  'US',
  'FR',
  'ES',
  'BR',
  'BB',
  'CR',
  'DE',
  'EC',
  'SV',
  'JE',
  'IE',
  'ID',
  'IT',
  'DK',
  'IC', //
  'CA',
  'CO',
  'CR',
  'MV',
  'MX',
  'MA',
  'NL',
  'NZ',
  'NI',
  'PA',
  'PE',
  'PH',
  'PT',
  'PR',
  'SN',
  'ZA',
  'LK',
  'MF',
  'SE',
  'CH',
  'TR',
  'TC',
  'UM',
  'VI',
];
export const driverRatingReport = [
  'New to the area',
  'Some knowledge',
  'Local knowledge',
];

export const getSkillLevels = (count = 0) => {
  if (count < 5) {
    return [];
  } else if (count < 10 && count >= 5) {
    return ['Beginner', 'Intermediate'];
  } else if (count < 50 && count >= 10) {
    return ['Beginner', 'Intermediate', 'Advanced'];
  } else if (count >= 50) {
    return ['Beginner', 'Intermediate', 'Advanced', 'Pro'];
  }
};

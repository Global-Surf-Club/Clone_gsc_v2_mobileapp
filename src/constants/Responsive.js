import {Dimensions, NativeModules, Platform, StatusBar} from 'react-native';

const {StatusBarManager} = NativeModules;
export let STATUS_BAR_HEIGHT =
  Platform.OS == 'android' ? StatusBar.currentHeight : StatusBarManager.HEIGHT;

const {width, height} = Dimensions.get('window');
const STANDARD_WIDTH = 375;
export const CURRENT_WIDTH = width;
export const CURRENT_HEIGHT = height;
export const SCREN_HEIGHT = Dimensions.get('screen').height;
const K =
  CURRENT_WIDTH /
  (Platform.OS == 'android' ? 400 : CURRENT_WIDTH < 375 ? 350 : 390);

export function dynamicSize(size) {
  return K * size;
}

export function getFontSize(size) {
  if (CURRENT_WIDTH < STANDARD_WIDTH) {
    const newSize = dynamicSize(size);
    return newSize;
  }
  return size;
}

export function getLineSize(size) {
  if (CURRENT_WIDTH < STANDARD_WIDTH) {
    const newSize = dynamicSize(size);
    return newSize;
  }
  return size;
}

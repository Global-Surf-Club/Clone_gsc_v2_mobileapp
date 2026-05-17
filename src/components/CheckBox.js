import React, {memo} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {Color} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';

const CheckBox = ({isSelected = true, onPress}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {isSelected && <Entypo style={styles.dot} name={'check'} />}
    </Pressable>
  );
};

export default memo(CheckBox);

const styles = StyleSheet.create({
  container: {
    height: dynamicSize(16),
    width: dynamicSize(16),
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderRadius: dynamicSize(3),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dynamicSize(10),
    backgroundColor: Color.white,
  },
  dot: {
    color: Color.lightblue,
    fontSize: getFontSize(13),
  },
});

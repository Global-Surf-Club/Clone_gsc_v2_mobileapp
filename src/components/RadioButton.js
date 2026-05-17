import React, {memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Color} from '../constants/Constants';
import {dynamicSize} from '../constants/Responsive';

const RadioButton = ({isSelected = false, onPress}) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      {isSelected && <View style={styles.dot} />}
    </Pressable>
  );
};

export default memo(RadioButton);

const styles = StyleSheet.create({
  container: {
    height: dynamicSize(16),
    width: dynamicSize(16),
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderRadius: dynamicSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dynamicSize(10),
    backgroundColor: Color.white,
  },
  dot: {
    height: dynamicSize(8),
    width: dynamicSize(8),
    borderRadius: dynamicSize(8),
    backgroundColor: Color.lightblue,
  },
});

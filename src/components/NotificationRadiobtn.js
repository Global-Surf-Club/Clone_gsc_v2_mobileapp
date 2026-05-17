import React from 'react';
import { Pressable, StyleSheet, View, Image } from 'react-native';
import { Color, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';


const NotificationRadiobtn = props => {
  const { isSelected, onPress } = props;

  return (
    <Pressable
      android_ripple={{ color: Color.lightGray, borderless: false }}
      style={styles.container}
      onPress={onPress}>
      <View
        style={[
          styles.radioCircle,
          {
            borderColor: isSelected ? Color.lightblue : '#DDCACA',
            backgroundColor: isSelected ? Color.lightblue : 'transparent',
          },
        ]}>
        {isSelected && (
         <Ionicons name="checkmark-sharp" color={Color.white} size={getFontSize(12)} />
        )}
      </View>
    </Pressable>
  );
};

export default NotificationRadiobtn;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  radioCircle: {
    width: dynamicSize(20),
    height: dynamicSize(20),
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickIcon: {
    height: dynamicSize(12),
    width: dynamicSize(12),
    tintColor: Color.white, // tick ko white karne ke liye
    resizeMode: 'contain',
  },
});

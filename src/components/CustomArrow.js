import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {Color} from '../constants/Constants';

const CustomArrow = ({
  deg = 0,
  text = 'Swell',
  color = Color.lightblue,
  value = '',
}) => {
  return (
    <View
      style={[
        styles.container,
        {transform: [{rotateZ: `${90 + Number(deg)}deg`}]},
      ]}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text
            style={{
              color: 'white',
              fontSize: 8,
              transform: [{rotate: `${deg > 0 && deg < 180 ? 180 : 0}deg`}],
            }}>
            {text}
          </Text>
        </View>
        <View style={[styles.dataContainer, color && {backgroundColor: color}]}>
          <Text
            style={{
              color: 'black',
              fontSize: 8,
              transform: [{rotate: `${deg > 0 && deg < 180 ? 180 : 0}deg`}],
            }}>
            {value}
          </Text>
        </View>
        <Entypo name="triangle-right" color={color} style={styles.right} />
        <View style={styles.rightTr} />
      </View>
    </View>
  );
};

export default CustomArrow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    backgroundColor: 'black',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    height: 12,
    zIndex: 5,
    width: 30,
    marginLeft: 10,
    alignItems: 'flex-end',
    paddingRight: 2,
    justifyContent: 'center',
  },
  dataContainer: {
    height: 12,
    justifyContent: 'center',
    minWidth: 50,
    paddingLeft: 5,
    zIndex: 5,
  },
  right: {
    fontSize: 27,
    marginLeft: -10,
  },
  container: {
    position: 'absolute',
    // left: 2,
    // right: 0,
    // bottom: 80,
    zIndex: 99999,
  },
  rightTr: {
    width: 93,
  },
});

import React, {memo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Image} from 'react-native';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import FastImage from 'react-native-fast-image';

const Radiobtn = props => {
  const [value, setValue] = useState(
    props.isSelected ? props.isSelected : false,
  );
  const {PROP} = props;

  return (
    <View>
      {PROP.map(res => {
        return (
          <Pressable
            android_ripple={{color: Color.lightGray, borderless: false}}
            key={res.key}
            style={styles.container}
            onPress={() => {
              setValue(res.key);
              props.setValue && props.setValue(res.key);
            }}>
            <View style={[styles.row]}>
              <View style={styles.selectedRb}>
                {value == res.key && (
                  // <View style={styles.selectedRb} />
                  <FastImage
                    imageStyle={{borderRadius: 50}}
                    source={require('../assets/images/icon/CheckBox.png')}
                    style={styles.subproimg}
                  />
                )}
              </View>

              {res.text ? (
                <Text style={[styles.radioText]}>{res.text}</Text>
              ) : (
                <></>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default Radiobtn;
const styles = StyleSheet.create({
  subproimg: {
    height: dynamicSize(19),
    width: dynamicSize(19),
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '35%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    maxWidth: dynamicSize(50),
    marginRight: dynamicSize(20),
  },
  container: {
    paddingVertical: 4,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  radioText: {
    width: '90%',
    fontSize: getFontSize(15),
    color: Color.black0,
    fontWeight: '600',
    fontFamily: fontFamily.ProximaR,
  },
  radioCircle: {
    height: dynamicSize(19),
    width: dynamicSize(19),
    borderRadius: 100,
    borderWidth: 1,
    marginRight: dynamicSize(20),
    borderColor: Color.lightblue,
  },
  selectedRb: {
    width: dynamicSize(19),
    height: dynamicSize(19),
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Color.lightblue,
    overflow: 'hidden',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: {
    marginTop: dynamicSize(20),
    color: 'white',
    fontWeight: '600',
    backgroundColor: '#F3FBFE',
  },
});

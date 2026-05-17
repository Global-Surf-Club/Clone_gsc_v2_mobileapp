//import liraries
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Color, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import NotificationRadiobtn from './NotificationRadiobtn';

// create a component
export const NotificationHeader = props => {
  const {
    title,
    onPressLeft,
    isEditMode,
    onPressRight,
    isSelected,
    isDisabled,
  } = props;
  return (
    <View style={styles.container}>
      {!isEditMode ? (
        <Pressable onPress={onPressLeft} style={styles.itemContainer}>
          <MaterialCommunityIcons
            name={'chevron-left-circle'}
            size={dynamicSize(22)}
            color={Color.black}
          />
        </Pressable>
      ) : (
        <Pressable onPress={onPressLeft} style={styles.selectAllContainer}>
          <NotificationRadiobtn isSelected={isSelected} onPress={onPressLeft} />
          <Text style={styles.TextBtn}>Select All</Text>
        </Pressable>
      )}
      <Text style={styles.title}>{title}</Text>
      <Pressable
        onPress={onPressRight}
        style={styles.EditBtnContainer}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.TextBtn,
            { color: isDisabled ? Color.gray : Color.lightblue },
          ]}
        >
          {isEditMode ? 'Cancel' : 'Edit'}
        </Text>
      </Pressable>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    height: dynamicSize(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    // marginBottom: dynamicSize(5),
    marginHorizontal: dynamicSize(15),
  },
  itemContainer: {
    width: '10%',
    justifyContent: 'center',
  },
  title: {
    color: Color.black,
    fontSize: dynamicSize(14),
    lineHeight: dynamicSize(19),
    fontFamily: fontFamily.ProximaAB,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  EditBtnContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  TextBtn: {
    color: Color.lightblue,
    fontSize: dynamicSize(14),
    lineHeight: dynamicSize(19),
    fontFamily: fontFamily.ProximaR,
  },
});

//make this component available to the app

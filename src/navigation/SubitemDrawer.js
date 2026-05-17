import {DrawerContentScrollView} from '@react-navigation/drawer';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Divider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import {Color, fontFamily} from '../constants/Constants';
import {dynamicSize, getFontSize} from '../constants/Responsive';

const SubitemDrawer = props => {
  const navigation = props.navigation;
  const user = useSelector(state => state.auth.user);
  const backbutton = () => {
    navigation.goBack();
  };
  const Gotoprofile = () => {
    navigation.navigate('Profile', {userId: user?.id});
  };
  const gotoupdatepassword = () => {
    navigation.navigate('UpdatePassword');
  };
  return (
    <>
      <DrawerContentScrollView {...props} style={styles.maincontainer}>
        <Pressable style={styles.backbutton} onPress={backbutton}>
          <MaterialCommunityIcons
            name="chevron-left-circle"
            size={22}
            color={Color.black}
          />
        </Pressable>
        <Divider />
        <View style={styles.drawerContent}>
          <Pressable style={styles.drawerItemcontainer} onPress={Gotoprofile}>
            <Text style={styles.itemtext}>Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            style={styles.drawerItemcontainer}
            onPress={gotoupdatepassword}>
            <Text style={styles.itemtext}>Update Password</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            style={styles.drawerItemcontainer}
            onPress={() => {
              navigation.navigate('UpdateProfile');
            }}>
            <Text style={styles.itemtext}>Update Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
        </View>
      </DrawerContentScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  backbutton: {
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(15),
  },
  itemtext: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
  },
  drawerItemcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: dynamicSize(15),
  },
  drawerContent: {
    width: '100%',
  },
  maincontainer: {
    backgroundColor: Color.white,
    flex: 1,
  },
});
export default SubitemDrawer;

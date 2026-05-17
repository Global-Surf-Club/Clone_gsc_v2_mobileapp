import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { openComposer } from 'react-native-email-link';
import { Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import ApiService from '../api/AxiosInstance';
import {
  Color,
  fontFamily,
  NotInvitedMessage,
  NotPaidMessage,
} from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import NotifeeUtility from '../PushNotification/NotifeeUtility.js';
import ConfirmaionModel from '../components/ConfirmaionModel.js';
import { Logout } from '../store/authSlice.js';
import VersionCheck from 'react-native-version-check';

const DrawerContent = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const isInvited = useSelector(state => state.auth.isInvited);
  const isFullAccess = user?.isFullAccess;
  const localNotificationsService = new NotifeeUtility();
  const [visible, setVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  useEffect(() => {
    const version = VersionCheck.getCurrentVersion();
    setCurrentVersion(version);
  }, []);

  const backbutton = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SideDrower' }],
        }),
      );
    }
  };
  const gotosubsetting = () => {
    navigation.navigate('SubitemDrawer');
  };
  const gotoGSC = () => {
    if (isFullAccess) {
      navigation.navigate('GSCMembers');
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };
  const gotoappinvite = () => {
    if (isFullAccess) {
      navigation.navigate('AppInvite');
    } else {
      alert(isInvited ? NotPaidMessage : NotInvitedMessage);
    }
  };
  // const goToSignup = () => {
  //   navigation.navigate('Signup');
  // };

  // const logOut = async () => {
  //   setVisible(false);
  //   try {
  //     ApiService.setToken(null);
  //     messaging().deleteToken();
  //     AsyncStorage.clear();
  //     dispatch(Logout());
  //     localNotificationsService.setNotificationBadge(0);
  //   } catch (error) {}
  //   navigation.dispatch(
  //     CommonActions.reset({
  //       index: 0,
  //       routes: [{ name: 'Login' }],
  //     }),
  //   );
  // };

  const logOut = async () => {
    try {
      setVisible(false);
      ApiService.setToken(null);
      try {
        await messaging().deleteToken();
      } catch (e) {}

      await dispatch(Logout());
      localNotificationsService.setNotificationBadge(0);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    } catch (error) {}
  };

  //   export const Logout = () => async dispatch => {
  //   await resetDatabaseCompletely(); // SQLite (all tables)
  //   await AsyncStorage.clear();      // AsyncStorage
  //   dispatch({ type: 'auth/logout' });// Redux FULL RESET
  // };

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
          <Pressable
            style={styles.drawerItemcontainer}
            onPress={gotosubsetting}
          >
            <Text style={styles.itemtext}>Setting</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable style={styles.drawerItemcontainer} onPress={gotoappinvite}>
            <Text style={styles.itemtext}>Invite a Member</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable style={styles.drawerItemcontainer} onPress={gotoGSC}>
            <Text style={styles.itemtext}>All Members GSC</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            onPress={async () => {
              try {
                await openComposer({ to: 'info@globalsurfclub.com' });
              } catch (error) {
              }
              // Linking.openURL('mailto:info@globalsurfclub.com');
            }}
            style={styles.drawerItemcontainer}
          >
            <Text style={styles.itemtext}>Contact Us</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            onPress={() => {
              navigation.navigate('WebViewScreen', {
                name: 'Privacy Policy',
                key: 'privacy',
              });
            }}
            style={styles.drawerItemcontainer}
          >
            <Text style={styles.itemtext}>Privacy Policy</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            onPress={() => {
              navigation.navigate('WebViewScreen', {
                name: 'Terms & Conditions',
                key: 'terms',
              });
            }}
            style={styles.drawerItemcontainer}
          >
            <Text style={styles.itemtext}>Terms & Conditions</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            onPress={() => {
              navigation.navigate('WebViewScreen', {
                name: 'Help Center',
                key: 'help',
              });
            }}
            style={styles.drawerItemcontainer}
          >
            <Text style={styles.itemtext}>Help Center</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          {/* <Pressable style={styles.drawerItemcontainer} onPress={goToSignup}>
            <Text style={styles.itemtext}>Sign up</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Color.cardgray}
            />
          </Pressable>
  <Divider />*/}

          <Pressable
            style={styles.drawerItemcontainer}
            onPress={() => {
              navigation.navigate('DeleteMyData', {
                name: 'Delete My Account',
                key: 'delete',
              });
            }}
          >
            <Text style={styles.itemtext}>Delete My Account</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
          <Pressable
            onPress={() => {
              setVisible(true);
            }}
            style={styles.drawerItemcontainer}
          >
            <Text style={styles.itemtext}>Logout</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={dynamicSize(22)}
              color={Color.cardgray}
            />
          </Pressable>
          <Divider />
        </View>

        <ConfirmaionModel
          visible={visible}
          message={'Are you sure you want to log out?'}
          onCancel={() => {
            setVisible(false);
          }}
          onPressYes={logOut}
        />
      </DrawerContentScrollView>
      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Version {currentVersion}</Text>
      </View>
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
  versionSection: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
});
export default DrawerContent;

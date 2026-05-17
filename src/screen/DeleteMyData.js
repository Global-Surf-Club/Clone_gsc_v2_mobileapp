import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import Auth from '../api/Auth';
import { Header } from '../components/Header';
import { Color, fontFamily, Shadow } from '../constants/Constants';
import Loader from '../constants/Loader';
import { Text } from 'react-native-paper';
import ApiService from '../api/AxiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { ButtonRound, RoundButton } from '../components/Buttons';
import moment from 'moment';
import NotifeeUtility from '../PushNotification/NotifeeUtility.js';
import messaging from '@react-native-firebase/messaging';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logout } from '../store/authSlice.js';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';

const DeleteMyData = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);
  const [Message, setMessage] = useState(false);
  // const [Duration, setDuration] = useState(0);
  const dispatch = useDispatch();
  const [DeleteLoader, setDeleteLoader] = useState(false);
  const [timer, setTimer] = useState('0' + ' S');
  const route = useRoute();
  let duration = 0;
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const localNotificationService = new NotifeeUtility();

  const logOut = async () => {
    try {
      ApiService.setToken(null);
      messaging().deleteToken();
      // AsyncStorage.clear();
      await dispatch(Logout());
      localNotificationService.setNotificationBadge(0);
      setMessage(false);
    } catch (error) {}
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };
  const DeleteMyAccountData = async () => {
    if (user?.id) {
      setLoader(true);
      let data = {
        ID: 0,
        UserID: user?.id,
      };
      try {
        const deleteResponce = await Auth.deleteData(data);

        if (deleteResponce?.id > 0) {
          setLoader(false);
          setMessage(true);
          duration = moment.duration(10, 'seconds');
          setTimer(10 + 'S');
          messageTimer();
        } else {
          setLoader(false);
        }
      } catch (error) {
        alert(error.toString());
        setLoader(false);
      }
    }
  };
  const calculateTimeLeft = () => {
    duration = moment.duration(duration.asSeconds() - 1, 'seconds');

    messageTimer();
    return duration.seconds() + ' S';
  };
  const messageTimer = async () => {
    if (duration > 0) {
      setTimeout(() => {
        setTimer(calculateTimeLeft());
      }, 1000);
    } else {
      logOut();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loader || DeleteLoader} />
      <Header
        backbutton={'chevron-left-circle'}
        onPressLeft={() => {
          navigation.goBack();
        }}
        title={route.params?.name}
        textAlign={'center'}
      />
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -12 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      <View style={styles.subContainer}>
        {Message ? (
          <>
            <View
              style={{
                borderWidth: 2,
                borderColor: Color.lightblue,
                borderRadius: 100,
                height: 50,
                width: 50,
                justifyContent: 'center',
                alignSelf: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: Color.lightblue,
                  fontSize: 18,
                  textAlign: 'center',
                  fontFamily: fontFamily.ProximaAB,
                }}
              >
                {timer}
              </Text>
            </View>
            <Text style={styles.modaltext}>
              Thank you for confirming to delete your data within 30 days, you
              will get an email from Admin Team. We are logging out you now
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.modaltext}>
              We will delete your data within 30 days once you confirm by
              clicking on the button below
            </Text>
            <View style={styles.buttoncontainer}>
              <ButtonRound
                title={'Delete My Account'}
                disabled={!currentNetworkStatus}
                backgroundColor={Color.lightblue}
                onPress={() => {
                  Alert.alert(
                    'Alert',
                    'Are you sure, you want to delete your data?',
                    [
                      {
                        text: 'No',
                        onPress: async () => {},
                      },
                      {
                        text: 'Yes',
                        style: 'destructive',
                        onPress: async () => {
                          DeleteMyAccountData();
                          // setMessage(true)
                          // duration = moment.duration(10, 'seconds');
                          // setTimer(10 + 'S')
                          // messageTimer()
                        },
                      },
                    ],
                  );
                }}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DeleteMyData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  subContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  modaltext: {
    fontSize: 16,
    color: Color.black0,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: fontFamily.ProximaBold,
    lineHeight: 18,
  },
  buttoncontainer: {
    width: '40%',
    paddingHorizontal: 10,
    paddingVertical: 20,
    alignSelf: 'center',
  },
});

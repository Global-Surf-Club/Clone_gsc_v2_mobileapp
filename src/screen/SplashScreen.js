import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions, useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import {Color, StorageKeys} from '../constants/Constants';
import {dynamicSize} from '../constants/Responsive';
import {getUserData, setTokenAndApi, updateFCM} from '../store/authSlice';
import FastImage from 'react-native-fast-image';

const SplashScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  useEffect(() => {
    // navigation.navigate('CreateReport')
    // navigation.navigate('Login')
    getLogin();
  }, []);

  const getLogin = async () => {
    const token = await AsyncStorage.getItem(StorageKeys.Token);
    if (token === null) {
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000);
    } else {
      dispatch(setTokenAndApi(token));
      const userId = await AsyncStorage.getItem(StorageKeys.userId);

      dispatch(updateFCM(userId));
      dispatch(
        getUserData(userId, status => {
          // if (status) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'SideDrower'}],
            }),
          );
          // } else {
          //   setTimeout(() => {
          //     navigation.navigate('Login');
          //   }, 1000);
          // }
        }),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgbox}>
        <Animatable.View animation="zoomIn">
          <View style={styles.logocontainer}>
            <FastImage
              source={require('../assets/images/logo.png')}
              style={styles.profileimg}
            />
          </View>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileimg: {
    height: dynamicSize(120),
    width: dynamicSize(120),
    borderRadius: 100,
  },
  maintext: {
    color: Color.white,
    fontSize: 40,
    fontWeight: Platform.OS === 'android' ? 'bold' : 'bold',
    fontStyle: 'italic',
    color: Color.themeblue,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;

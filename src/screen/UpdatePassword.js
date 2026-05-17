//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import Auth from '../api/Auth';
import { Header } from '../components/Header';
import { Color, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';

const UpdatePassword = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [Current, setCurrent] = React.useState('');
  const [New, setNew] = React.useState('');
  const [firstHide, setFirstHide] = useState(true);
  const [secondHide, setSecondHide] = useState(true);
  const [thirdHide, setThirdHide] = useState(true);
  const [Confirm, setConfirm] = React.useState('');
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  const backButtonClick = () => {
    navigation.goBack();
  };
  const updatePassword = async () => {
    try {
      if (Current.length == 0) {
        alert('Please enter current password');
        return;
      } else if (New.length == 0) {
        alert('Please enter new password');
        return;
      } else if (Confirm.length == 0) {
        alert('Please enter confirm password');
        return;
      } else if (New != Confirm) {
        alert('New password and confirm password does not match');
        return;
      }
      SetshowLoading(true);
      const param = {
        oldPassword: Current,
        newPassword: New,
      };
      const data = await Auth.updatePassword(param);

      alert('Password updated successfully');
      setCurrent('');
      setNew('');
      setConfirm('');
    } catch (error) {
      alert(error?.detail);
    }
    SetshowLoading(false);
  };
  return (
    <>
      <Loader visible={showLoading} />
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          onPressLeft={backButtonClick}
          // notification={'6'}
          // messagenotification={'6'}
          title={''}
          textAlign={'center'}
        />
        {!currentNetworkStatus && (
          <View style={{ marginBottom: -12 }}>
            <ConnectionBanner isOnline={currentNetworkStatus} />
          </View>
        )}
        <KeyboardAwareScrollView>
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Current ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Current password"
                keyboardType="default"
                placeholder="Current password"
                value={Current}
                onChangeText={Current => setCurrent(Current)}
                right={
                  <TextInput.Icon
                    size={dynamicSize(25)}
                    color={Color.black}
                    style={{ marginTop: dynamicSize(25) }}
                    icon={firstHide ? 'eye-off' : 'eye'}
                    onPress={() => setFirstHide(!firstHide)}
                  />
                }
                secureTextEntry={firstHide}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: New ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="New password"
                keyboardType="default"
                placeholder="New password"
                value={New}
                right={
                  <TextInput.Icon
                    size={dynamicSize(25)}
                    color={Color.black}
                    style={{ marginTop: dynamicSize(25) }}
                    icon={secondHide ? 'eye-off' : 'eye'}
                    onPress={() => setSecondHide(!secondHide)}
                  />
                }
                secureTextEntry={secondHide}
                onChangeText={New => setNew(New)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Confirm ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                right={
                  <TextInput.Icon
                    size={dynamicSize(25)}
                    color={Color.black}
                    style={{ marginTop: dynamicSize(25) }}
                    icon={thirdHide ? 'eye-off' : 'eye'}
                    onPress={() => setThirdHide(!thirdHide)}
                  />
                }
                secureTextEntry={thirdHide}
                label="Confirm password"
                keyboardType="default"
                placeholder="Confirm password"
                value={Confirm}
                onChangeText={Confirm => setConfirm(Confirm)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <View style={styles.maincontainer}>
          <Pressable
            onPress={updatePassword}
            style={[
              styles.btncontainer,
              {
                backgroundColor: !currentNetworkStatus
                  ? Color.gray
                  : Color.lightblue,
              },
            ]}
            disabled={!currentNetworkStatus}
          >
            <Text style={[styles.text]}>Update</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingRight: dynamicSize(10),
    paddingVertical: 0,
    fontSize: getFontSize(16),
    height: dynamicSize(62),
  },
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  btncontainer: {
    height: dynamicSize(40),
    paddingHorizontal: dynamicSize(20),
    borderRadius: 10,
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  textinputcontainer: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default UpdatePassword;

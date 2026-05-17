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

const AppInvite = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [Email, setEmail] = React.useState('');
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
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Loader visible={showLoading} />

        <Header
          backbutton={'chevron-left-circle'}
          onPressLeft={backButtonClick}
          title={'App Invite'}
          textAlign={'center'}
        />
        {!currentNetworkStatus && (
          <View style={{ marginBottom: -12 }}>
            <ConnectionBanner isOnline={currentNetworkStatus} />
          </View>
        )}

        <KeyboardAwareScrollView>
          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.title}>
              Enter email of user you want to send invitation to:
            </Text>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Email ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                autoCorrect={false}
                underlineColor={Color.lightblue}
                label="Email"
                keyboardType="default"
                autoCapitalize={false}
                placeholder="Email"
                value={Email}
                onChangeText={Email => setEmail(Email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <View style={styles.maincontainer}>
          <Pressable
            onPress={async () => {
              SetshowLoading(true);
              try {
                const data = await Auth.inviteToApp({ email: Email });

                navigation.goBack();
                alert('Invitation sent successfully');
              } catch (error) {
                alert(error?.detail?.toString());
              }
              SetshowLoading(false);
            }}
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
            <Text style={[styles.text]}>Invite</Text>
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
    paddingVertical: 0,
    fontSize: getFontSize(16),
    height: dynamicSize(62),
  },
  title: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: dynamicSize(20),
    marginTop: dynamicSize(10),
  },
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: dynamicSize(10),
  },
  text: {
    color: Color.white,
    fontSize: getFontSize(13),
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
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },

  mt2: {
    marginTop: 10,
  },
  profileimg: {
    width: 50,
    height: 50,
    borderRadius: 100,
    marginRight: 10,
    alignSelf: 'center',
    backgroundColor: Color.gray,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    borderBottomColor: Color.cardbg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },

  searchbar: {
    borderRadius: 10,
    height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    paddingBottom: 10,
  },
});

//make this component available to the app
export default AppInvite;

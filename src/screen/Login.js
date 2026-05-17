//import liraries
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { RoundButton } from '../components/Buttons';
import { Color, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInUser } from '../store/authSlice';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(false);
  const [UserName, setUserName] = useState('');
  const [Password, setPassword] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const Gotoforgotscreen = () => {
    navigation.navigate('Forgotpassword');
  };
  const GotoHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'SideDrower' }],
      }),
    );
  };

  const signIn = () => {
    if (UserName.trim().length == 0) {
      alert('Enter User Name');
      return;
    } else if (Password.length == 0) {
      alert('Enter Password');
      return;
    }
    setShowLoading(true);
    dispatch(
      signInUser(UserName.trim(), Password, (status, error) => {
        setShowLoading(false);
        if (status) {
          GotoHome();
        } else {
          alert(error?.detail);
        }
      }),
    );
  };

  const GotoInvitationscreen = () => {
    navigation.navigate('Signup');
  };
  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={showLoading} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={'handled'}>
          <View style={styles.logocontainer}>
            <FastImage
              source={require('../assets/images/logo.png')}
              style={styles.profileimg}
            />
            <Text style={styles.apptitle}>Surf Share Save</Text>
          </View>
          <View style={styles.section2}>
            <View style={styles.logindetailcontainer}>
              <Text style={styles.containertitle}>Sign in </Text>
              <Text style={styles.containertext}>
                Enter your email and password to continue
              </Text>
              <View>
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: Password ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={UserName ? Color.lightblue : Color.gray}
                  label="Username"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Username"
                  value={UserName}
                  onChangeText={UserName => setUserName(UserName)}
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                />
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: Password ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  right={
                    <TextInput.Icon
                      size={dynamicSize(25)}
                      style={{ marginTop: dynamicSize(25) }}
                      color={Color.black}
                      icon={hidePass ? 'eye-off' : 'eye'}
                      onPress={() => setHidePass(!hidePass)}
                    />
                  }
                  underlineColor={Password ? Color.lightblue : Color.gray}
                  label="Password"
                  secureTextEntry={hidePass ? true : false}
                  keyboardType="default"
                  placeholder="Password"
                  value={Password}
                  onChangeText={Password => setPassword(Password)}
                  style={[styles.paperinput, { paddingRight: dynamicSize(10) }]}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                />
              </View>
              <Pressable
                style={{ alignSelf: 'flex-end' }}
                onPress={Gotoforgotscreen}
              >
                <Text style={[styles.forgottext, { textAlign: 'right' }]}>
                  Forgot your password?
                </Text>
              </Pressable>
              <View style={{ alignSelf: 'flex-start' }}>
                <Pressable onPress={GotoInvitationscreen}>
                  <Text style={[styles.forgottext]}>New here? Sign up</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
        <RoundButton title={'Sign in'} onPress={signIn} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  paperinput: {
    backgroundColor: Color.reportcardbg,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(16),
    height: dynamicSize(62),
  },
  apptitle: {
    fontSize: getFontSize(18),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    marginTop: dynamicSize(10),
  },
  forgottext: {
    fontSize: getFontSize(14),
    color: Color.black,
    marginTop: dynamicSize(15),
    fontFamily: fontFamily.ProximaR,
  },
  containertext: {
    fontSize: getFontSize(14),
    color: Color.black,
    textAlign: 'center',
    fontFamily: fontFamily.ProximaR,
    width: '50%',
    alignSelf: 'center',
  },
  containertitle: {
    fontSize: getFontSize(15),
    marginBottom: dynamicSize(10),
    fontFamily: 'Poppins-SemiBold',
    color: Color.black,
    textAlign: 'center',
  },
  section2: {
    backgroundColor: Color.reportcardbg,
    padding: dynamicSize(20),
    borderRadius: 10,
    marginHorizontal: dynamicSize(10),
    marginTop: '15%',
  },
  logocontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: dynamicSize(30),
  },
  profileimg: {
    height: dynamicSize(90),
    width: dynamicSize(90),
    borderRadius: 100,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default Login;

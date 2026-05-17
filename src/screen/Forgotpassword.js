//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Image} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Auth from '../api/Auth';
import {RoundButton} from '../components/Buttons';
import {Color, fontFamily} from '../constants/Constants';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
const Forgotpassword = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [UserName, setUserName] = React.useState('');
  const [code, setCode] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(0);
  const GotoHome = () => {
    navigation.navigate('SideDrower');
  };

  const forgotPassword = async () => {
    try {
      SetshowLoading(true);
      const param = {
        email: UserName,
      };
      const data = await Auth.forgotPassword(param);
      setStep(1);
      // navigation.goBack();
      SetshowLoading(false);
    } catch (error) {
      alert(error.toString());
      SetshowLoading(false);
    }
  };

  const validateCode = async () => {
    try {
      SetshowLoading(true);
      const param = {
        email: UserName.toLowerCase(),
        code: code,
      };

      const data = await Auth.validateCode(param);

      if (data) {
        setStep(2);
      } else {
        alert('Invalid Code');
      }
      // navigation.goBack();
      SetshowLoading(false);
    } catch (error) {
      alert(error.toString());
      SetshowLoading(false);
    }
  };

  const resetpassword = async () => {
    try {
      SetshowLoading(true);
      const param = {
        email: UserName,
        code,
        password,
      };
      const data = await Auth.resetPassword(param);

      setStep(2);
      navigation.goBack();
      alert('Password reset successful');
      SetshowLoading(false);
    } catch (error) {
      alert(error.toString());
      SetshowLoading(false);
    }
  };

  return (
    <>
      <Loader visible={showLoading} />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView>
          <ScrollView style={{flex: 1}}>
            <Pressable
              hitSlop={{bottom: 10, left: 10, right: 10, top: 10}}
              onPress={() => {
                if (step == 0) {
                  navigation.goBack();
                } else {
                  setStep(v => v - 1);
                }
              }}
              style={{
                position: 'absolute',
                top: dynamicSize(20),
                left: dynamicSize(20),
                zIndex: 5,
              }}>
              <MaterialCommunityIcons
                name={'chevron-left-circle'}
                size={dynamicSize(22)}
                color={Color.black}
              />
            </Pressable>
            <View style={styles.logocontainer}>
              <FastImage
                source={require('../assets/images/logo.png')}
                style={styles.profileimg}
              />
              <Text style={styles.apptitle}>Surf Share Save</Text>
            </View>
            <View style={styles.section2}>
              <View style={styles.logindetailcontainer}>
                <Text style={styles.containertitle}>Forgot Password</Text>
                {step == 0 ? (
                  <>
                    <Text style={styles.containertext}>
                      Enter your email to continue
                    </Text>
                    <View>
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: UserName
                              ? Color.lightblue
                              : Color.gray,
                            background: 'transparent',
                          },
                          fonts: {
                            regular: {
                              fontFamily: fontFamily.ProximaR,
                            },
                          },
                        }}
                        underlineColor={UserName ? Color.lightblue : Color.gray}
                        autoCapitalize={'none'}
                        label="Email"
                        placeholder="Email"
                        keyboardType="email-address"
                        value={UserName}
                        onChangeText={UserName => setUserName(UserName)}
                        style={styles.paperinput}
                        selectionColor={Color.lightblue}
                        activeUnderlineColor={Color.lightblue}
                      />
                    </View>
                  </>
                ) : step == 1 ? (
                  <>
                    <Text style={styles.containertext}>
                      Enter Recovery Code
                    </Text>
                    <View>
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: code ? Color.lightblue : Color.gray,
                            background: 'transparent',
                          },
                          fonts: {
                            regular: {
                              fontFamily: fontFamily.ProximaR,
                            },
                          },
                        }}
                        underlineColor={code ? Color.lightblue : Color.gray}
                        label="Code"
                        placeholder="Code"
                        keyboardType="default"
                        value={code}
                        onChangeText={code => setCode(code)}
                        style={styles.paperinput}
                        selectionColor={Color.lightblue}
                        activeUnderlineColor={Color.lightblue}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.containertext}>
                      Create your new password
                    </Text>
                    <View>
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: password
                              ? Color.lightblue
                              : Color.gray,
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
                            color={Color.black}
                            style={{marginTop: dynamicSize(25)}}
                            icon={hidePass ? 'eye-off' : 'eye'}
                            onPress={() => setHidePass(!hidePass)}
                          />
                        }
                        underlineColor={password ? Color.lightblue : Color.gray}
                        label="New Password"
                        secureTextEntry={hidePass ? true : false}
                        placeholder="New Password"
                        keyboardType="default"
                        value={password}
                        onChangeText={password => setPassword(password)}
                        style={[
                          styles.paperinput,
                          {paddingRight: dynamicSize(10)},
                        ]}
                        selectionColor={Color.lightblue}
                        activeUnderlineColor={Color.lightblue}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAwareScrollView>
        <RoundButton
          onPress={() => {
            if (step == 0) {
              forgotPassword();
            } else if (step == 1) {
              validateCode();
            } else {
              resetpassword();
            }
          }}
          title={'Continue'}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  paperinput: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(16),
    backgroundColor: Color.reportcardbg,
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
    padding: dynamicSize(10),
    borderRadius: 10,
    marginHorizontal: dynamicSize(20),
    marginTop: '20%',
    height: dynamicSize(200),
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
export default Forgotpassword;

//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { Image } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Auth from '../api/Auth';
import Profile from '../api/Profile';
import CheckBox from '../components/CheckBox';
import { Header } from '../components/Header';
import ImagePickerModal from '../components/ImagePickerModal';
import RadioButton from '../components/RadioButton';
import { Color, countryList, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const triptype = ['Male', 'Female', 'Other'];

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const Signup = () => {
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [isModalTripType, setisModalTripType] = useState();
  const [hidePass, setHidePass] = useState(true);
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [image, setImage] = useState(null);
  const [postCode, setPostCode] = useState('');
  const [userName, setUserName] = useState('');
  const [country, setCountry] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState(null);
  const [ownCar, setOwnCar] = useState(false);
  const [policychecked, setPolicychecked] = useState(false);
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [ethicsChecked, setEthicsChecked] = useState(false);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const validateEmail = email => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
  };

  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };
  const GotoInvitationscreen = () => {
    navigation.navigate('Forgotpassword');
  };
  const backButtonClick = () => {
    navigation.goBack();
  };
  const onTripTypeSelected = value => {
    setGender(value);
    toggleTripType();
  };

  const signUp = async () => {
    if (email?.trim() == '') {
      alert('Please enter email');
    } else if (validateEmail(email) == false) {
      alert('Please enter valid email');
    } else if (firstName?.trim() == '') {
      alert('Please enter first name');
    } else if (lastName?.trim() == '') {
      alert('Please enter last name');
    } else if (password?.trim() == '') {
      alert('Please enter password');
    } else if (gender == null) {
      alert('Please select gender');
    } else if (phonenumber?.trim() == '') {
      alert('Please enter mobile phone number');
    } else if (postCode?.trim() == '') {
      alert('Please enter postcode');
    } else if (country?.trim() == '') {
      alert('Please enter country');
    } else if (image == null) {
      alert('Please select image');
    } else {
      SetshowLoading(true);
      checkLocationData(true, async (status, newCity) => {
        if (status) {
          try {
            const params = {
              firstName: firstName,
              lastName: lastName,
              dateOfBirth: new Date(),
              gender: gender == 'Male' ? 0 : gender == 'Female' ? 1 : 2,
              username: userName,
              email: email,
              password: password,
              countryCode,
              aboutMe: null,
              phone: phonenumber,
              occupation: null,
              city: newCity,
              country: country,
              zipCode: postCode,
              carOwner: ownCar,
              carCapacity: 0,
              surferSkillLevel: 0,
              boardSize: 0,
              surferReefBreaks: true,
              surferStance: 0,
              state,
              privacyLevel: 0,
              lastKnownLocation: {
                latitude: 0,
                longitude: 0,
              },
            };

            const data = await Auth.signUp(params);
            const imageData = new FormData();
            imageData.append('profileImage', image);

            const imageRes = await Profile.postGalleryImageForSignUp(
              data?.id,
              imageData,
            );

            navigation.goBack();
            alert('Signup successfully');
          } catch (error) {
            alert(error?.detail?.toString());
          }
          SetshowLoading(false);
        } else {
          SetshowLoading(false);
        }
      });
    }
  };

  useEffect(() => {
    checkLocationData();
  }, [postCode, countryCode]);

  const checkLocationData = async (isAlert, callback) => {
    if (postCode?.length > 0 && countryCode?.length > 0) {
      try {
        const data = JSON.parse(
          await Profile.getLocationData(postCode, countryCode),
        );

        setCity(data?.city);
        callback && callback(true, data?.city);
      } catch (error) {
        if (isAlert) {
          alert('Invalid postcode for country');
        }
        callback && callback(false);
      }
    }
  };

  return (
    <>
      <Loader visible={showLoading} />
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          onPressLeft={backButtonClick}
          title={'Sign up'}
          textAlign={'center'}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={{ paddingBottom: getBottomSpace() }}
          >
            <View style={styles.profileContainer}>
              <TouchableOpacity
                onPress={() => {
                  setImagePickerModal(true);
                }}
                style={styles.profileImage}
              >
                {image ? (
                  <FastImage source={image} style={styles.profileImage} />
                ) : (
                  <FastImage
                    style={styles.profileImage}
                    source={require('../assets/images/icon/add-item.png')}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.name}>Profile Picture</Text>
            </View>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: email ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                autoCapitalize={'none'}
                underlineColor={Color.lightblue}
                label="Email*"
                keyboardType="email-address"
                placeholder="Email*"
                value={email}
                onChangeText={email => {
                  setEmail(email);
                  setUserName(email);
                }}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
            {/* <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: userName ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="User Name"
                keyboardType="default"
                placeholder="User Name"
                value={userName}
                onChangeText={email => setUserName(email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View> */}
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: firstName ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="First name*"
                keyboardType="default"
                placeholder="First name*"
                value={firstName}
                onChangeText={firstName => setFirstName(firstName)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
            <View style={styles.textinputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: lastName ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Last name*"
                keyboardType="default"
                placeholder="Last name*"
                value={lastName}
                onChangeText={lastName => setLastName(lastName)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: password ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Password*"
                keyboardType="default"
                placeholder="Password*"
                right={
                  <TextInput.Icon
                    size={dynamicSize(25)}
                    style={{ marginTop: dynamicSize(25) }}
                    color={Color.black}
                    icon={hidePass ? 'eye-off' : 'eye'}
                    onPress={() => setHidePass(!hidePass)}
                  />
                }
                value={password}
                secureTextEntry={hidePass ? true : false}
                onChangeText={password => setPassword(password)}
                style={[styles.paperinput, { paddingRight: dynamicSize(10) }]}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <Pressable onPress={toggleTripType}>
                <View pointerEvents="none">
                  <TextInput
                    pointerEvents="none"
                    label="Gender*"
                    theme={{
                      colors: {
                        text: Color.black0,
                        placeholder: gender ? Color.lightblue : Color.gray,
                        background: 'transparent',
                      },
                      fonts: {
                        regular: {
                          fontFamily: fontFamily.ProximaR,
                        },
                      },
                    }}
                    underlineColor={gender ? Color.lightblue : Color.gray}
                    placeholder="Gender*"
                    style={styles.paperinput}
                    selectionColor={Color.lightblue}
                    activeUnderlineColor={Color.lightblue}
                    editable={false}
                    value={gender}
                  />
                </View>
              </Pressable>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: phonenumber ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Phone number*"
                keyboardType="number-pad"
                placeholder="Phone number*"
                value={phonenumber}
                onChangeText={phonenumber => setPhonenumber(phonenumber)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: postCode ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="Post code*"
                keyboardType="default"
                placeholder="Post code*"
                value={postCode}
                onChangeText={postCode => setPostCode(postCode)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: state ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="State/Province (Optional)"
                keyboardType="default"
                placeholder="State/Province (Optional)"
                value={state}
                onChangeText={postCode => setState(postCode)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
              {/* <View pointerEvents="none">
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: city ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Color.lightblue}
                label="City"
                keyboardType="default"
                placeholder="City"
                value={city}
                onChangeText={() => {}}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View> */}
              <Pressable
                onPress={() => {
                  setShowCountryPicker(true);
                }}
              >
                <View pointerEvents="none">
                  <TextInput
                    pointerEvents="none"
                    theme={{
                      colors: {
                        text: Color.black0,
                        placeholder: country ? Color.lightblue : Color.gray,
                        background: 'transparent',
                      },
                      fonts: {
                        regular: {
                          fontFamily: fontFamily.ProximaR,
                        },
                      },
                    }}
                    underlineColor={Color.lightblue}
                    label="Country*"
                    keyboardType="default"
                    placeholder="Country*"
                    value={country}
                    onChangeText={country => setCountry(country)}
                    style={styles.paperinput}
                    selectionColor={Color.lightblue}
                    activeUnderlineColor={Color.lightblue}
                  />
                </View>
              </Pressable>
              {showCountryPicker && (
                <CountryPicker
                  visible
                  withAlphaFilter
                  countryCodes={countryList}
                  onClose={() => {
                    setShowCountryPicker(false);
                  }}
                  onSelect={data => {
                    setShowCountryPicker(false);
                    setCountryCode(data.cca2);
                    setCountry(data.name);
                    // checkLocationData();
                  }}
                />
              )}
              <View style={styles.mt2}>
                <TouchableOpacity
                  style={styles.radiobtn}
                  onPress={() => setOwnCar(true)}
                >
                  <RadioButton
                    onPress={() => {
                      setOwnCar(true);
                    }}
                    isSelected={ownCar}
                  />
                  <Text style={styles.radiobtntext}>
                    I am a driver with a license and car
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radiobtn}
                  onPress={() => setOwnCar(false)}
                >
                  <RadioButton
                    onPress={() => {
                      setOwnCar(false);
                    }}
                    isSelected={!ownCar}
                  />
                  <Text style={styles.radiobtntext}>
                    I am a passenger looking for a driver
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.mt2}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.radiobtn}
                  onPress={() => setEthicsChecked(v => !v)}
                >
                  <CheckBox
                    onPress={() => setEthicsChecked(v => !v)}
                    isSelected={ethicsChecked}
                  />
                  <Text style={styles.radiobtntext}>
                    Agree to code of ethics.
                    <Text
                      onPress={() => {
                        navigation.navigate('WebViewScreen', {
                          name: 'Terms & Conditions',
                          key: 'terms',
                        });
                      }}
                      style={{ color: Color.lightblue }}
                    >
                      {'( see code of ethic )'}
                    </Text>
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.radiobtn}
                  onPress={() => setPolicychecked(v => !v)}
                >
                  <CheckBox
                    onPress={() => setPolicychecked(v => !v)}
                    isSelected={policychecked}
                  />
                  <Text style={styles.radiobtntext}>
                    Agree to privacy policy.
                    <Text
                      onPress={() => {
                        navigation.navigate('WebViewScreen', {
                          name: 'Privacy Policy',
                          key: 'privacy',
                        });
                      }}
                      style={{ color: Color.lightblue }}
                    >
                      {' '}
                      {'( see privacy policy )'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.maincontainer}>
              <Pressable
                onPress={signUp}
                disabled={!(policychecked && ethicsChecked)}
                style={[
                  styles.btncontainer,
                  !(policychecked && ethicsChecked) && { opacity: 0.5 },
                ]}
              >
                <Text style={[styles.text]}>Sign up</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          isVisible={isModalTripType}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}
        >
          <View style={styles.modalcontainer}>
            <View style={styles.modalsubcontainer}>
              <View style={[styles.mx2, styles.modalheader]}>
                <Text style={styles.formtitle}>Gender</Text>
                <Pressable style={styles.close} onPress={toggleTripType}>
                  <Ionicons name="close-circle" size={26} color={Color.black} />
                </Pressable>
              </View>
              <View style={styles.modalflatlist}>
                <FlatList
                  data={triptype}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.listitem}
                      onPress={() => onTripTypeSelected(item)}
                    >
                      <Text style={styles.listitemtext}> {item || ''}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.bank}
                />
              </View>
            </View>
          </View>
        </Modal>
        <ImagePickerModal
          visible={imagePickerModal}
          onCancel={() => {
            setImagePickerModal(false);
          }}
          onSelect={photo => {
            setImagePickerModal(false);
            setImage(photo);
          }}
        />
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
  name: {
    fontSize: 15,
    color: 'black',
    lineHeight: 21,
    fontFamily: fontFamily.ProximaR,
    marginTop: 10,
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    height: dynamicSize(100),
    width: dynamicSize(100),
    borderRadius: 50,
  },
  radiobtntext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  radiobtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dynamicSize(3),
  },
  // modal
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  close: {
    position: 'absolute',
    right: -5,
    top: 4,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalcontainer: {
    // alignItems: 'center',
    justifyContent: 'center',
  },
  mx2: {
    marginHorizontal: 10,
  },
  mt2: {
    marginTop: 10,
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: dynamicSize(230),
    borderRadius: 8,
    paddingBottom: 10,
  },
  listitemtext: {
    fontSize: 16,
    color: Color.black0,
  },
  listitem: {
    paddingVertical: 15,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  // modal
  title: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(19),
    flex: 1,
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  maincontainer: {
    width: '60%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  text: {
    color: Color.white,
    fontSize: 13,
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
    paddingHorizontal: dynamicSize(20),
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default Signup;

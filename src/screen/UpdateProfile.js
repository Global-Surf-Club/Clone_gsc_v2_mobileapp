//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Profile from '../api/Profile';
import { Header } from '../components/Header';
import { Color, countryList, fontFamily } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfile } from '../store/profileSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const triptype = ['Male', 'Female', 'Other'];

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const UpdateProfile = () => {
  const user = useSelector(state => state.auth.user);
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [isModalTripType, setisModalTripType] = useState();
  const dispatch = useDispatch();
  const [city, setCity] = useState(user?.city);
  const [email, setEmail] = useState(user?.email);
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [phonenumber, setPhonenumber] = useState(user?.phone?.toString());
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countryCode, setCountryCode] = useState(user?.countryCode ?? 'GB');
  const [state, setState] = useState(user?.state ?? '');
  const [postCode, setPostCode] = useState(user?.zipCode);
  const [country, setCountry] = useState(user?.country);
  const [gender, setGender] = useState(
    user?.gender == 0 ? 'Male' : user?.gender == 1 ? 'Female' : 'Other',
  );
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };

  const backButtonClick = () => {
    navigation.goBack();
  };
  const onTripTypeSelected = value => {
    setGender(value);
    toggleTripType();
  };

  const GetProfile = () => {
    return new Promise((resolve, reject) => {
      dispatch(
        getProfile(
          user?.id,
          () => {
            resolve();
          },
          true,
        ),
      );
    });
  };

  const signUp = async () => {
    if (firstName?.trim() == '') {
      alert('Please enter first name');
    } else if (lastName?.trim() == '') {
      alert('Please enter last name');
    } else if (gender == null) {
      alert('Please select gender');
    } else if (phonenumber?.trim() == '') {
      alert('Please enter mobile phone number');
    } else if (country?.trim() == '') {
      alert('Please enter country');
    } else {
      SetshowLoading(true);
      checkLocationData(true, async status => {
        if (status) {
          try {
            const params = {
              firstName: firstName,
              lastName: lastName,
              dateOfBirth: null,
              gender: gender == 'Male' ? 0 : gender == 'Female' ? 1 : 2,
              city: city,
              phone: phonenumber,
              countryCode,
              country: country,
              state,
              zipCode: postCode,
              //   carOwner: checked === 'first',
            };

            const data = await Profile.updateProfile(params);

            await GetProfile();
            navigation.goBack();
            alert('Profile updated successfully');
          } catch (error) {
            alert(error?.detail?.toString());
          }
        }
        SetshowLoading(false);
      });
    }
  };

  useEffect(() => {
    checkLocationData();
  }, [postCode, countryCode]);

  const checkLocationData = async (isAlert, callback) => {
    if ((postCode?.length > 0 && countryCode?.length > 0) || isAlert) {
      try {
        const data = JSON.parse(
          await Profile.getLocationData(postCode, countryCode),
        );

        setCity(data?.city);
        callback && callback(true);
      } catch (error) {
        if (isAlert) {
          alert('Invalid postcode for country');
        }
        callback && callback(false);
      }
    } else {
      callback && callback(false);
    }
  };

  //   data

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={showLoading} />
      <Header
        backbutton={'chevron-left-circle'}
        onPressLeft={backButtonClick}
        // notification={'6'}
        // messagenotification={'6'}
        title={'Update Profile'}
        textAlign={'center'}
      />
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1 }}>
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
              underlineColor={Color.lightblue}
              label="Email"
              keyboardType="email-address"
              placeholder="Email"
              disabled
              value={email}
              onChangeText={email => setEmail(email)}
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
              label="First name"
              keyboardType="default"
              placeholder="First name"
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
              label="Last name"
              keyboardType="default"
              placeholder="Last name"
              value={lastName}
              onChangeText={lastName => setLastName(lastName)}
              style={styles.paperinput}
              selectionColor={Color.lightblue}
              activeUnderlineColor={Color.lightblue}
            />
            <Pressable onPress={toggleTripType}>
              <View pointerEvents="none">
                <TextInput
                  pointerEvents="none"
                  label="Gender"
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
                  placeholder="Gender"
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
              label="Phone number"
              keyboardType="number-pad"
              placeholder="Phone number"
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
              label="Post Code"
              keyboardType="default"
              placeholder="Post Code"
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
                onChangeText={postCode => setState(postCode)}
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
                  label="Country"
                  keyboardType="default"
                  placeholder="Country"
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
                countryCodes={countryList}
                onClose={() => {
                  setShowCountryPicker(false);
                }}
                onSelect={data => {
                  setShowCountryPicker(false);
                  setCountryCode(data.cca2);
                  setCountry(data.name);
                }}
              />
            )}
          </View>
          <View style={styles.maincontainer}>
            <Pressable
              onPress={signUp}
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
    </SafeAreaView>
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
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  radiobtntext: {
    fontSize: 15,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  radiobtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // modal
  formtitle: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  close: {
    position: 'absolute',
    right: -5,
    top: 4,
    height: 40,
    width: 40,
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
    fontSize: 15,
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 19,
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
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  btncontainer: {
    height: 40,
    paddingHorizontal: 20,
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
});

//make this component available to the app
export default UpdateProfile;

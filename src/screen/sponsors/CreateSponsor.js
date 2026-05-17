// CreateSponsor.js - Complete Offline-First Implementation
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  Keyboard,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { ButtonRound } from '../../components/Buttons';
import { Header } from '../../components/Header';
import {
  Color,
  fontFamily,
  keyboardType,
  text,
} from '../../constants/Constants';
import { dynamicSize, getFontSize } from '../../constants/Responsive';
import Loader from '../../constants/Loader';
import SuccessModal from '../../components/SuccessModal';
import ImagePickerModal from '../../components/ImagePickerModal';
import SearchPlaceModal from '../../components/SearchPlaceModal';
import Trip from '../../api/Trip';
import { useSelector, useDispatch } from 'react-redux';
import SearchPlaceModalBusiness from '../../components/SearchPlaceModalBusiness';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../../components/ConnectionBanner';
import { createBusiness, uploadBusinessImage } from '../../store/sponsorSlice';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const CreateSponsor = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [index, setIndex] = useState(props?.route?.params?.index);
  const user = useSelector(state => state.auth.user);
  const isOnline = useSelector(state => state.sponsors?.isOnline);

  const [showLoading, SetshowLoading] = useState(false);
  const [BusinessName, setBusinessName] = useState('');
  const [hours, sethours] = useState('');
  const [about, setabout] = useState('');
  const [address, setaddress] = useState('');
  const [addressModel, setaddressModel] = useState(false);
  const [businessModel, setbusinessModel] = useState(false);
  const [website, setwebsite] = useState('');
  const [businessType, setbusinessType] = useState('');
  const [email, setemail] = useState('');
  const [number, setnumber] = useState('');
  const [isbtnLoader, setIsbtnLoader] = useState(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [imageData, setimageData] = useState('');
  const [imageUploadData, setimageUploadData] = useState(null);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  // Monitor network status in real-time
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    // Check initial network status
    NetInfo.fetch().then(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const menuButtonClick = () => {
    navigation.goBack();
  };

  // Show offline alert with retry option
  const showOfflineAlert = () => {
    Alert.alert(
      'No Internet Connection',
      'Creating a business recommendation requires an active internet connection. Please check your connection and try again.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setIsbtnLoader(false);
            SetshowLoading(false);
          },
        },
        {
          text: 'Retry',
          onPress: () => {
            CreateSponsors();
          },
        },
      ],
    );
  };

  // ==================== CREATE BUSINESS - ONLINE REQUIRED ====================
  const CreateSponsors = async () => {
    // Validation
    if (!BusinessName) {
      setTimeout(() => {
        Alert.alert('Validation Error', 'Please enter business name');
      }, 300);
      return;
    }

    if (!address) {
      setTimeout(() => {
        Alert.alert('Validation Error', 'Please enter address');
      }, 300);
      return;
    }

    if (!website) {
      setTimeout(() => {
        Alert.alert('Validation Error', 'Please enter website URL');
      }, 300);
      return;
    }

    setIsbtnLoader(true);
    SetshowLoading(true);

    try {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        SetshowLoading(false);
        setTimeout(
          () => {
            showOfflineAlert();
          },
          Platform.OS === 'ios' ? 300 : 100,
        );
        return;
      }

      let addressAddressId = null;

      if (address) {
        try {
          let addressAddress = await Trip.createAddress(address);
          addressAddressId = addressAddress?.id;
        } catch (error) {}
      }

      const data = {
        id: 0,
        name: BusinessName,
        address: address?.address1,
        addressId: addressAddressId,
        email: email,
        website: website,
        phoneNumber: number,
        sponsirship: '',
        isSponsored: index == 0 ? true : false,
        isActivate: true,
        hours: hours,
        about: about,
        typename: businessType,
      };

      dispatch(
        createBusiness(data, async (success, response) => {
          if (success) {
            if (imageUploadData !== null && response?.data?.id) {
              dispatch(
                uploadBusinessImage(
                  response.data.id,
                  imageUploadData,
                  index == 0 ? true : false,
                  (imgSuccess, imgRes) => {
                    if (!imgSuccess) {
                    }
                  },
                ),
              );
            }

            setIsbtnLoader(false);
            SetshowLoading(false);
            setTimeout(
              () => {
                if (response.conflict) {
                  setSuccess(true);
                  setSuccessDescription(
                    `Thank you for Recommending${'\n'}${'\n'}This business has already been recommended by other members and may still be under review.`,
                  );
                } else {
                  setSuccess(true);
                  setSuccessDescription(
                    `Thank you for Recommending!${'\n'}${'\n'}Your business recommendation has been submitted successfully and will be reviewed by the club.`,
                  );
                }
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setIsbtnLoader(false);
            SetshowLoading(false);

            if (response?.requiresOnline) {
              setTimeout(
                () => {
                  showOfflineAlert();
                },
                Platform.OS === 'ios' ? 300 : 100,
              );
            } else if (response?.conflict) {
              setTimeout(
                () => {
                  setSuccess(true);
                  setSuccessDescription(
                    `Thank you for Recommending${'\n'}${'\n'}This business has already been recommended by other members and may still be under review.`,
                  );
                },
                Platform.OS === 'ios' ? 300 : 0,
              );
            } else {
              setTimeout(() => {
                Alert.alert(
                  'Error',
                  response?.message ||
                    'Failed to create business recommendation. Please try again.',
                );
              }, 300);
            }
          }
        }),
      );
    } catch (error) {
      setIsbtnLoader(false);
      SetshowLoading(false);

      setTimeout(() => {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }, 300);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../../assets/images/icon/chatting.png')}
        iconRight1={require('../../assets/images/icon/bell1.png')}
        iconRight2={require('../../assets/images/icon/home.png')}
        notification={'6'}
        title={'Recommend a Business'}
        textAlign={'center'}
        onPressLeft={menuButtonClick}
      />

      {/* Offline Indicator */}
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: 0 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      <Loader visible={showLoading} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.tabbartab1}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: dynamicSize(15),
            }}
          >
            <Pressable
              style={[styles.passengerimgcontainer, styles.mt2]}
              onPress={() => {}}
            >
              <Pressable onPress={() => {}}>
                <FastImage
                  source={
                    user?.thumbnailProfileImage
                      ? {
                          uri: user?.thumbnailProfileImage,
                          cache: FastImage.cacheControl.immutable,
                        }
                      : require('../../assets/images/logo.png')
                  }
                  style={styles.profileimg}
                />
              </Pressable>

              <View style={{ width: '75%' }}>
                <Text style={styles.nametext}>
                  {user?.firstName + ' ' + user?.lastName}
                </Text>
                <Text style={styles.status}>{user?.userRole}</Text>
              </View>
            </Pressable>

            <View style={styles.profileContainer}>
              {imageData ? (
                <FastImage
                  source={{
                    uri: imageData,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={styles.profileImage}
                />
              ) : (
                <View>
                  <FastImage
                    style={[styles.profileImage, { opacity: 0.5 }]}
                    tintColor={Color.gray}
                    source={require('../../assets/images/empty.png')}
                  />
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>Business</Text>
                    <Text style={styles.logoText}>Logo</Text>
                    <Text style={styles.logoOptional}>(optional)</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.addimgiconcontainer}
                onPress={() => {
                  setImagePickerModal(true);
                }}
              >
                <Ionicons name="camera" size={20} color={Color.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.TextContainer}>
              <Text style={styles.Textdescription}>
                Members can recommend a business that would be beneficial to our
                community and align with our ethos.
              </Text>
              {/* <Text style={[styles.Textdescription, styles.internetNote]}>
                Note: Internet connection is required to submit recommendations.
              </Text> */}
            </View>

            {/* Form Fields */}
            <Pressable
              onPress={() => setbusinessModel(true)}
              style={styles.inputcontainer}
            >
              <View>
                <TextInput
                  pointerEvents="none"
                  editable={false}
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: BusinessName ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={BusinessName ? Color.lightblue : Color.gray}
                  label="Business Name*"
                  value={BusinessName ?? ''}
                  placeholder="Business Name"
                  style={styles.paperinput}
                  activeUnderlineColor={Color.lightblue}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={() => setaddressModel(true)}
              style={styles.inputcontainer}
            >
              <View>
                <TextInput
                  pointerEvents="none"
                  editable={false}
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: address ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={address ? Color.lightblue : Color.gray}
                  label="Address*"
                  value={address?.address1 ?? ''}
                  placeholder="Enter Address"
                  style={styles.paperinput}
                  activeUnderlineColor={Color.lightblue}
                />
              </View>
            </Pressable>

            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: website ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={website ? Color.lightblue : Color.gray}
                label="Website*"
                value={website}
                onChangeText={website => setwebsite(website)}
                placeholder="Website"
                style={styles.paperinput}
                activeUnderlineColor={Color.lightblue}
              />
            </View>

            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: number ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={number ? Color.lightblue : Color.gray}
                label="Phone (optional)"
                keyboardType={keyboardType.numberPad}
                placeholder="Phone"
                value={number}
                onChangeText={number => setnumber(number)}
                style={styles.paperinput}
                activeUnderlineColor={Color.lightblue}
              />
            </View>

            <View style={styles.inputcontainer}>
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
                underlineColor={email ? Color.lightblue : Color.gray}
                label="Email (optional)"
                value={email}
                onChangeText={text => setemail(text)}
                placeholder="Enter email"
                style={styles.paperinput}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </ScrollView>

          <View style={styles.buttoncontainer}>
            <ButtonRound
              isProcessing={isbtnLoader}
              title={'Create'}
              onPress={CreateSponsors}
              disabled={!currentNetworkStatus}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          navigation.goBack();
        }}
        description={successdescription}
        iserror={iserror}
        isbusiness={true}
      />

      <ImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={async photo => {
          setImagePickerModal(false);
          setimageData(photo?.uri);
          setimageUploadData(photo);
        }}
      />

      <SearchPlaceModalBusiness
        visible={businessModel}
        onClose={text => {
          setBusinessName(text ? text : BusinessName ? BusinessName : text);
          setbusinessModel(false);
        }}
        onSubmit={(data, businesName) => {
          setaddress(data);
          setBusinessName(businesName);
          setbusinessModel(false);
        }}
      />

      <SearchPlaceModal
        visible={addressModel}
        onClose={text => {
          setaddressModel(false);
        }}
        onSubmit={data => {
          setaddress(data);
          setaddressModel(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },

  // Offline Indicator
  offlineIndicator: {
    backgroundColor: Color.lightblue,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    fontFamily: fontFamily.ProximaAB,
    textAlign: 'center',
  },

  // Logo Placeholder
  logoPlaceholder: {
    position: 'absolute',
    top: 5,
    padding: 10,
    left: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: fontFamily.ProximaBold,
    fontSize: dynamicSize(16),
    color: Color.black,
  },
  logoOptional: {
    fontFamily: fontFamily.ProximaR,
    fontSize: dynamicSize(14),
    color: Color.gray,
  },

  // Internet Note
  internetNote: {
    marginTop: 10,
    fontFamily: fontFamily.ProximaAB,
    color: Color.themeColor,
  },

  // Button Container
  buttoncontainer: {
    width: '35%',
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },

  // Profile Image Container
  addimgiconcontainer: {
    width: 35,
    height: 35,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Color.lightblue,
  },
  profileContainer: {
    height: 110,
    width: 110,
    justifyContent: 'center',
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.cardgray,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginTop: 15,
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },

  // Input Styles
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(14),
    minHeight: dynamicSize(62),
  },
  inputcontainer: {
    paddingHorizontal: 15,
    marginTop: 5,
  },

  // Tab Container
  tabbartab1: {
    flex: 1,
    paddingHorizontal: 10,
  },

  // Profile Section
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    borderRadius: 100,
    backgroundColor: Color.cardbg,
    marginRight: 10,
    alignSelf: 'center',
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 10,
    paddingHorizontal: 5,
  },
  nametext: {
    color: Color.black,
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaBold,
    flex: 1,
    flexWrap: 'wrap',
  },
  status: {
    color: Color.gray,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaR,
    marginTop: 2,
  },

  // Text Container
  TextContainer: {
    marginTop: 20,
    marginHorizontal: 10,
    // marginBottom: 15,
  },
  Textdescription: {
    fontSize: getFontSize(14),
    color: Color.themeColor,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(20),
  },

  // Utility
  mt2: {
    marginTop: 10,
  },

  // Legacy styles (keep for compatibility)
  suggestrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomColor: Color.lightGray,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestimgcontainer: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: 10,
  },
  suggestimg: {
    height: 40,
    borderRadius: 100,
    width: 40,
  },
  suggestcontainer: {
    marginVertical: 10,
    maxHeight: 300,
    marginHorizontal: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Color.white,
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  friendaddress: {
    color: Color.black,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  friendname: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
    color: 'black',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  friendimgcontainer: {
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: 10,
  },
  friendimg: {
    height: 50,
    borderRadius: 100,
    width: 50,
  },
  addimgicon: {
    width: 20,
    height: 20,
  },
  labelswitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  subBusinessName: {
    fontSize: 15,
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    width: '85%',
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 10,
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 20,
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
  modalheader: {},
  mx2: {
    marginHorizontal: 10,
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: 170,
    borderRadius: 8,
    paddingBottom: 10,
  },
  listitemtext: {
    fontSize: 16,
    color: Color.black0,
    fontFamily: fontFamily.ProximaR,
  },
  listitem: {
    paddingVertical: 15,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  modalcontainer: {
    justifyContent: 'center',
  },
  BusinessName: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaAB,
  },
  formBusinessName: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaAB,
    marginTop: 10,
  },
  textbtnstyle: {
    fontSize: 13,
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  input: {
    fontFamily: fontFamily.ProximaR,
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: 10,
    flex: 1,
  },
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaBold,
    marginTop: dynamicSize(10),
    width: '95%',
  },
});

export default CreateSponsor;

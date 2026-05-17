//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-native-modal';
import { Snackbar, TextInput } from 'react-native-paper';
import Animated, { Layout } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import ClubApi from '../api/ClubApi';
import { ButtonRound } from '../components/Buttons';
import { Header } from '../components/Header';
import {
  Color,
  fontFamily,
  countryList,
  keyboardType,
} from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import Loader from '../constants/Loader';
import SuccessModal from '../components/SuccessModal';
import ImagePickerModal from '../components/ImagePickerModal';
import SearchPlaceModal from '../components/SearchPlaceModal';
import Profile from '../api/Profile';
import CountryPicker from 'react-native-country-picker-modal';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { createClub, updateClubThunk } from '../store/clubSlice';
import ConnectionBanner from '../components/ConnectionBanner';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const CreateClub = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoading, SetshowLoading] = useState(false);
  const user = useSelector(state => state.auth.user);
  const isOffline = useSelector(state => state.club.isOffline);
  const lastSync = useSelector(state => state.club.lastSync);
  const { ClubsDetail } = props?.route?.params;
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  const [type, settype] = useState(
    ClubsDetail
      ? ClubsDetail?.isPublic === true
        ? 'Public'
        : ClubsDetail?.isPublic === false
        ? 'Private'
        : ''
      : '',
  );
  const [Title, setTitle] = useState(ClubsDetail ? ClubsDetail?.title : '');
  const [postcode, setpostcode] = useState(
    ClubsDetail ? ClubsDetail?.postcode : '',
  );
  const [country, setcountry] = useState(
    ClubsDetail ? ClubsDetail?.country : '',
  );
  const [countryCode, setCountryCode] = useState(
    ClubsDetail ? ClubsDetail?.countryCode : '',
  );

  const [city, setcity] = useState(ClubsDetail ? ClubsDetail?.city : '');
  const [number, setnumber] = useState(
    ClubsDetail ? ClubsDetail?.phoneNumber : '',
  );
  const [email, setemail] = useState(ClubsDetail ? ClubsDetail?.email : '');
  const [website, setwebsite] = useState(
    ClubsDetail ? ClubsDetail?.website : '',
  );
  const [address, setaddress] = useState(
    ClubsDetail ? ClubsDetail?.address : '',
  );

  const [invitefriends, setinvitefriends] = useState(
    ClubsDetail
      ? ClubsDetail?.inviteFriends === true
        ? 'Yes'
        : ClubsDetail?.inviteFriends === false
        ? 'No'
        : ''
      : '',
  );
  const [invitefriends1, setinvitefriends1] = useState();
  const [departureLocationModal, setDepartureLocationModal] = useState(false);
  const [clubLocation, setclubLocation] = useState();
  const [isModalTripType, setisModalTripType] = useState();
  const [isModalskillLevel, setisModalskillLevel] = useState();
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [imageData, setimageData] = useState(
    ClubsDetail ? ClubsDetail?.thumbnailLogoPath : '',
  );
  const isLocalImage = imageData?.startsWith('file://');
  const [imageUploadData, setimageUploadData] = useState(null);
  const triptype = ['Private', 'Public'];
  const invitetype = ['Yes', 'No'];
  const [isModalinvitetype, setisModalinvitetype] = useState();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isbtnLoader, setIsbtnLoader] = useState(false);

  const [visible, setVisible] = React.useState(false);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const onToggleSnackBar = () => setVisible(!visible);

  const onDismissSnackBar = () => setVisible(false);

  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };

  const onTripTypeSelected = value => {
    settype(value);
    toggleTripType();
  };
  const toggleInviteType = () => {
    setisModalinvitetype(!isModalinvitetype);
  };
  const onInviteTypeSelected = value => {
    setinvitefriends(value);
    toggleInviteType();
  };

  const toggleskillLevel = () => {
    setisModalskillLevel(!isModalskillLevel);
  };

  const menuButtonClick = () => {
    navigation.goBack();
  };

  const GotoOrganizetrip = () => {
    navigation.navigate('Organizetrip');
  };

  const submitclub = async () => {
    let ispublis = false;
    let isinvite = false;
    if (type === 'Public') {
      ispublis = true;
    }
    if (invitefriends === 'Yes') {
      isinvite = true;
    }
    if (!Title) {
      alert('Enter title');
      return;
    }
    if (!type) {
      alert('Select privacy type');
      return;
    }
    if (!postcode) {
      alert('Enter postcode');
      return;
    }
    if (!country) {
      alert('Select country');
      return;
    }
    setIsbtnLoader(true);
    SetshowLoading(true);
    checkLocationData(true, async (status, newCity) => {
      if (status) {
        try {
          const data = {
            id: 0,
            title: Title,
            // Privacy: type,
            inviteFriends: isinvite,
            address: address,
            postcode: postcode,
            country: country,
            countryCode: countryCode,
            city: city,
            phoneNumber: number,
            email: email,
            website: website,
            isPublic: ispublis,
            description: 'test',
          };

          dispatch(
            createClub(data, imageUploadData, (successFlag, message) => {
              if (successFlag) {
                setTimeout(
                  () => {
                    setSuccess(true);
                    setSuccessDescription(message);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
              }
              setIsbtnLoader(false);
              SetshowLoading(false);
            }),
          );
        } catch (error) {
          setIsbtnLoader(false);
          SetshowLoading(false);
        }
      } else {
        setIsbtnLoader(false);
        SetshowLoading(false);
      }
    });
    // navigation.goBack();
  };
  const updateClub = async () => {
    let ispublis = false;
    let isinvite = true;
    if (type === 'Public') {
      ispublis = true;
    }
    if (invitefriends === 'Yes') {
      isinvite = true;
    }
    if (!Title) {
      alert('Enter title');
      return;
    }
    if (!type) {
      alert('Select privacy type');
      return;
    }
    if (!postcode) {
      alert('Enter postcode');
      return;
    }
    if (!country) {
      alert('Select country');
      return;
    }

    setIsbtnLoader(true);
    SetshowLoading(true);
    checkLocationData(true, async (status, newCity) => {
      if (status) {
        try {
          const data = {
            id: ClubsDetail?.id,
            title: Title,
            // Privacy: type,
            inviteFriends: isinvite,
            address: address,
            postcode: postcode,
            country: country,
            countryCode: countryCode,
            city: city,
            phoneNumber: number,
            email: email,
            website: website,
            isPublic: ispublis,
            description: 'test',
          };

          dispatch(
            updateClubThunk(
              ClubsDetail?.id,
              data,
              imageUploadData,
              (successFlag, message) => {
                if (successFlag) {
                  setTimeout(
                    () => {
                      setSuccess(true);
                      setSuccessDescription(message);
                    },
                    Platform.OS === 'ios' ? 300 : 0,
                  );
                }
                setIsbtnLoader(false);
                SetshowLoading(false);
              },
            ),
          );
        } catch (error) {
          setIsbtnLoader(false);
          SetshowLoading(false);
        }
      } else {
        setIsbtnLoader(false);
        SetshowLoading(false);
      }
    });

    // navigation.goBack();
  };

  useEffect(() => {
    checkLocationData();
  }, [postcode, countryCode]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const checkLocationData = async (isAlert, callback) => {
    if (postcode?.length > 0 && countryCode?.length > 0) {
      try {
        const data = JSON.parse(
          await Profile.getLocationData(postcode, countryCode),
        );

        if (data) {
          setcity(data?.city);
          callback && callback(true, data?.city);
        }
      } catch (error) {
        if (isAlert) {
          alert('Invalid postcode for country');
        }
        callback && callback(false);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={menuButtonClick}
        notification={'6'}
        title={ClubsDetail ? 'Update Club' : 'Create Club'}
        // messagenotification={'6'}
        textAlign={'center'}
      />
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
            <View style={[styles.row, styles.mb2]}>
              <View style={styles.friendimgcontainer}>
                <FastImage
                  style={styles.friendimg}
                  source={{
                    uri: user?.thumbnailProfileImage,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              </View>
              <View style={{ width: '70%' }}>
                <Text style={styles.friendname}>
                  {user.firstName} {user?.lastName}
                </Text>
                <Text style={styles.friendaddress}>Admin</Text>
              </View>
            </View>
            <View style={styles.profileContainer}>
              {imageData ? (
                isLocalImage ? (
                  <Image
                    source={{ uri: imageData }}
                    style={styles.profileImage}
                  />
                ) : (
                  <FastImage
                    source={{
                      uri: imageData,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={styles.profileImage}
                  />
                )
              ) : (
                <FastImage
                  style={[styles.profileImage, { opacity: 0.5 }]}
                  source={require('../assets/images/empty.png')}
                />
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

            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Title ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Title ? Color.lightblue : Color.gray}
                label="Club Name*"
                value={Title}
                onChangeText={Title => setTitle(Title)}
                placeholder="Enter Club Name*"
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
            <View style={styles.inputcontainer}>
              <Pressable onPress={toggleTripType}>
                <View pointerEvents="none">
                  <TextInput
                    label="Choose privacy*"
                    theme={{
                      colors: {
                        text: Color.black0,
                        placeholder: type ? Color.lightblue : Color.gray,
                        background: 'transparent',
                      },
                      fonts: {
                        regular: {
                          fontFamily: fontFamily.ProximaR,
                        },
                      },
                    }}
                    underlineColor={type ? Color.lightblue : Color.gray}
                    placeholder="Choose privacy*"
                    style={styles.paperinput}
                    selectionColor={Color.lightblue}
                    activeUnderlineColor={Color.lightblue}
                    editable={false}
                    value={type}
                  />
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setDepartureLocationModal(true);
              }}
              style={styles.inputcontainer}
            >
              <View pointerEvents="none">
                <TextInput
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
                  label="Address (Optional)"
                  keyboardType={keyboardType.default}
                  placeholder="Enter Address (Optional)"
                  editable={false}
                  // value={address}
                  value={address ?? ''}
                  onChangeText={address => setaddress(address)}
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  // right={
                  //   <TextInput.Icon
                  //     name="map-marker"
                  //     size={22}
                  //     color={Color.lightblue}
                  //   />
                  // }
                />
              </View>
            </Pressable>
            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: postcode ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={postcode ? Color.lightblue : Color.gray}
                label="Region or Postcode*"
                keyboardType={keyboardType.default}
                placeholder="Enter Postcode*"
                value={postcode}
                onChangeText={postcode => setpostcode(postcode)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
                // right={
                //   <TextInput.Icon
                //     name="map-marker-radius"
                //     size={20}
                //     color={Color.lightblue}
                //   />
                // }
              />
            </View>
            <Pressable style={styles.inputcontainer}>
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
                // editable={false}
                underlineColor={city ? Color.lightblue : Color.gray}
                label="City (Optional)"
                keyboardType={keyboardType.default}
                placeholder="Enter City (Optional)"
                value={city}
                onChangeText={country => setcity(country)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
                // right={
                //   <TextInput.Icon
                //     name="earth"
                //     size={20}
                //     color={Color.lightblue}
                //   />
                // }
              />
            </Pressable>

            <Pressable
              onPress={() => {
                setShowCountryPicker(true);
              }}
              style={styles.inputcontainer}
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
                  // editable={false}
                  underlineColor={country ? Color.lightblue : Color.gray}
                  label="Country*"
                  keyboardType={keyboardType.default}
                  placeholder="Enter Country*"
                  value={country}
                  onChangeText={country => setcountry(country)}
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  // right={
                  //   <TextInput.Icon
                  //     name="earth"
                  //     size={20}
                  //     color={Color.lightblue}
                  //   />
                  // }
                />
              </View>
            </Pressable>

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
                label="Phone number (Optional)"
                keyboardType={keyboardType.numberPad}
                placeholder="Enter Phone number (Optional)"
                value={number}
                onChangeText={number => setnumber(number)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
                // right={
                //   <TextInput.Icon
                //     name="phone"
                //     size={20}
                //     color={Color.lightblue}
                //   />
                // }
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
                underlineColor={email ? Color.lightblue : Color.gray}
                label="Email address (Optional)"
                keyboardType={keyboardType.emailAddress}
                placeholder="Enter Email address (Optional)"
                value={email}
                onChangeText={email => setemail(email)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
                // right={
                //   <TextInput.Icon
                //     name="email"
                //     size={20}
                //     color={Color.lightblue}
                //   />
                // }
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
                underlineColor={website ? Color.lightblue : Color.gray}
                label="Website (Optional)"
                keyboardType={keyboardType.default}
                placeholder="Enter Website (Optional)"
                value={website}
                onChangeText={website => setwebsite(website)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
                // right={
                //   <TextInput.Icon name="web" size={20} color={Color.lightblue} />
                // }
              />
            </View>
            {ClubsDetail ? (
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  isProcessing={isbtnLoader}
                  title={'Update'}
                  onPress={updateClub}
                  disabled={!currentNetworkStatus}
                />
              </View>
            ) : (
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  isProcessing={isbtnLoader}
                  title={'Create'}
                  onPress={submitclub}
                  disabled={!currentNetworkStatus}
                />
              </View>
            )}
          </ScrollView>
          <Modal
            isVisible={isModalTripType}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
          >
            <View style={styles.modalcontainer}>
              <View style={styles.modalsubcontainer}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text style={styles.formtitle}>Trip Type</Text>
                  <Pressable style={styles.close} onPress={toggleTripType}>
                    <Ionicons
                      name="close-circle"
                      size={26}
                      color={Color.black}
                    />
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

          <Modal
            isVisible={isModalinvitetype}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
          >
            <View style={styles.modalcontainer}>
              <View style={styles.modalsubcontainer}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text style={styles.formtitle}>Invite Type</Text>
                  <Pressable style={styles.close} onPress={toggleInviteType}>
                    <Ionicons
                      name="close-circle"
                      size={26}
                      color={Color.black}
                    />
                  </Pressable>
                </View>
                <View style={styles.modalflatlist}>
                  <FlatList
                    data={invitetype}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={styles.listitem}
                        onPress={() => onInviteTypeSelected(item)}
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
        </View>
      </KeyboardAvoidingView>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: () => {
            // Do something
          },
        }}
      >
        Club information submitted successfully.
      </Snackbar>
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          navigation.goBack();
        }}
        description={successdescription}
        iserror={iserror}
      />
      <ImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={async photo => {
          setImagePickerModal(false);
          setimageData(photo.uri);
          setimageUploadData(photo);
        }}
      />

      <SearchPlaceModal
        visible={departureLocationModal}
        onClose={() => {
          setDepartureLocationModal(false);
        }}
        onSubmit={data => {
          // setcountry(data);
          setclubLocation(data);
          setaddress(data?.address1);
        }}
      />
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
            setcountry(data.name);
            // checkLocationData();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  addimgiconcontainer: {
    width: 35,
    height: 35,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    bottom: -0,
    backgroundColor: Color.lightblue,
  },
  addimgicon: {
    width: 20,
    height: 20,
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
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 100,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  buttoncontainer: {
    width: '35%',
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  labelswitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  subtitle: {
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
  mt2: {
    marginTop: 10,
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
    // alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaAB,
  },
  formtitle: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: fontFamily.ProximaAB,
    marginTop: 10,
  },
  paperinput: {
    backgroundColor: Color.white,
    // paddingHorizontal: 0,
    // paddingVertical: 0,
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(14),
    height: dynamicSize(62),
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
  inputcontainer: {
    paddingHorizontal: 15,
  },
  tabbartab1: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: 10,
    flex: 1,
  },
  //offline new style add
  offlineIndicator: {
    backgroundColor: Color.lightblue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontFamily: fontFamily.ProximaAB,
  },

  // Sync Info
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  syncInfoText: {
    fontSize: 11,
    color: Color.gray,
    marginLeft: 4,
    fontFamily: fontFamily.ProximaR,
  },
});
export default CreateClub;

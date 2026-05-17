//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Modal from 'react-native-modal';
import ModalDropdown from 'react-native-modal-dropdown';
import { Divider } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { BorderButton } from '../components/Buttons';
import { Header } from '../components/Header';
import WavesInfoItem from '../components/Item';
import MultipleImagePickerModal from '../components/MultipleImagePickerModal';
import PreviewModal from '../components/PreviewModal';
import SuccessModal from '../components/SuccessModal';
import ClubsAPi from '../api/ClubApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  board,
  Color,
  CURRENT_WIDTH,
  driverRatingReport,
  fontFamily,
  forecastRating,
  keyboardType,
  resizeMode,
  Shadow,
  skill,
  text,
  userSkillLevel,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const CreateClubReport = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clubid, routeItem } = route?.params;

  const dispatch = useDispatch();
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [verifiedForests, setVerifiedForests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isbtnLoader, setIsbtnLoader] = useState(false);
  const forecastData = useSelector(state => state.trip.averageForcast_trip);

  const needToRefresh = route.params?.needToRefresh;
  const trip = useSelector(state => state.trip.currentTrip);
  const [forecastLoader, setForecastLoader] = useState(false);

  useEffect(() => {
    if (!forecastData[trip?.id]) {
    }
    //getVerifiedForecast();
  }, []);
  const tideExtremesByday =
    useSelector(state => state.trip.tideExtremesByday_trip)[trip?.id] ?? [];
  const forecastByDay =
    useSelector(state => state.trip.forecastByDay_trip)[trip?.id] ?? {};
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const passengers = useSelector(state => state.trip.passengers);
  const expenses = useSelector(state => state.trip.expenses);
  const [description, setDescription] = useState('');
  // const [title, setTitle] = useState(trip?.title);
  const [title, setTitle] = useState(routeItem?.title);
  const [showLoading, SetshowLoading] = useState(false);
  const [select, setSelect] = useState(false);
  const [isModalTripType, setisModalTripType] = useState();
  const [isModalVerify, setisModalVerify] = useState(false);
  const currentSelectedDate = useRef(null);
  const [selection, setSelection] = useState(1);
  const [driverRate, setDriverRate] = useState('-1');
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [rating, setrating] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  const submitReport = async () => {
    try {
      // if (title.length == 0) {
      //   alert('Enter title');
      //   return;
      // }
      // if (description.length == 0) {
      //   alert('Enter description');
      //   return;
      // }
      // if (driverRate == -1) {
      //   alert('Select driver rating');
      //   return;
      // }
      // if (rating == null) {
      //   alert('Enter rating');
      //   return;
      // }
      if (title === null || title === undefined || title === '') {
        alert('Enter title');
        return false;
      }
      if (
        description === null ||
        description === undefined ||
        description === ''
      ) {
        alert('Enter description');
        return false;
      }

      if (rating === null || rating === undefined || rating === '') {
        alert('Enter rating');
        return false;
      }
      if (driverRate === '-1') {
        alert('Select driver rating');
        return false;
      }

      if (
        imageList.length < 3 ||
        imageList === null ||
        imageList === undefined ||
        imageList === ''
      ) {
        alert('please submit 3 trip photos');
        return false;
      }
      // if (title.length == 0) {
      //   alert('Enter title');
      //   return;
      // }
      // if (description.length == 0) {
      //   alert('Enter description');
      //   return;
      // }
      // if (rating == null) {
      //   alert('Enter rating');
      //   return;
      // }
      // if (driverRate == -1) {
      //   alert('Select driver rating');
      //   return;
      // }

      // if (imageList.length < 3) {
      //   alert('Select atleast 3 images');
      //   return;
      // }
      // if (imageList.length < 3) {
      //   alert('Select atleast 3 images');
      //   return;
      // }
      setIsbtnLoader(true);
      SetshowLoading(true);
      const data = {
        tripId: routeItem?.id,
        title: title,
        description: description,
        isPublic: selection == 1,
        rating: rating,
        driverRating: driverRate,
        clubId: clubid,
      };

      const retval = await ClubsAPi.postClubTripReport(data);

      const imageData = new FormData();
      for (let i = 0; i < imageList.length; i++) {
        const item = imageList[i];
        // const photo = {
        //   uri: item?.uri,
        //   type: item?.type,
        //   name: item?.fileName,
        // };
        imageData.append(i, item);
      }

      const imageRes = await Trip.postReportImage(retval?.id, imageData);

      setIsbtnLoader(false);
      SetshowLoading(false);
      setTimeout(
        () => {
          setSuccessModal(true);
        },
        Platform.OS == 'ios' ? 300 : 0,
      );
    } catch (error) {
      setIsbtnLoader(false);
      SetshowLoading(false);
    }
  };

  const getVerifiedForecast = async () => {
    try {
      setIsLoading(true);
      const data = JSON.parse(await Trip.getVerifiedForecast(trip?.id));

      setVerifiedForests(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const expenseAmount = expenses?.reduce((acc, cur) => acc + cur?.amount, 0);
  const accommodationAddress = trip?.accommodationAddress;
  const accAddress =
    (accommodationAddress?.address1 ?? '') +
    ' ' +
    // (accommodationAddress?.address2 ?? '') +
    // ' ' +
    (accommodationAddress?.city ? accommodationAddress?.city : '') +
    ' ' +
    (accommodationAddress?.state ? accommodationAddress?.state : '') +
    ' ' +
    (accommodationAddress?.country ? accommodationAddress?.country : '');
  const departureAddress = trip?.departureAddress;
  // const destinationAddress = trip?.destination?.address;
  const destinationAddress = trip?.destinationLocationAddress;
  const toAddress =
    (destinationAddress?.address1 ?? '') +
    ' ' +
    // (destinationAddress?.address2 ?? '') +
    // ' ' +
    (destinationAddress?.city ? destinationAddress?.city : '') +
    ' ' +
    (destinationAddress?.state ? destinationAddress?.state : '') +
    ' ' +
    (destinationAddress?.country ? destinationAddress?.country : '');
  const Gotosubtab = () => {
    // navigation.navigate('ClubsubForcastTabItem');
  };
  const menuButtonClick = () => {
    navigation.goBack();
  };
  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };
  const toggleVerify = () => {
    setisModalVerify(!isModalVerify);
  };
  const [Caption, setCaption] = useState('');

  // const handleImagePicker = async () => {
  //   try {
  //     const response = await launchImageLibrary();
  //     if (response.didCancel) {
  //       return;
  //     }
  //     if (response.error) {
  //       return;
  //     }
  //     if (response.assets[0].uri) {
  //       setImageList([...imageList, response.assets[0]]);
  //     }
  //   } catch (error) {}
  // };
  const passengersList = passengers?.filter(item => !item.isDriver) ?? [];
  const driverList = passengers?.filter(item => item?.isDriver) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        title="Club Trip Report"
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={menuButtonClick}
        // messagenotification={'6'}
        textAlign={'center'}
      />
      <Loader
        visible={showLoading || forecastLoader || isLoading}
        // visible={false}
      />
      <ScrollView
        bounces={true}
        alwaysBounceVertical={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getBottomSpace() }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={styles.viewContainer}>
          <View style={styles.selection1}>
            <Text style={styles.selection1title}>Log your Surf trip</Text>
            <Text style={styles.selection1text}>
              Here is where you will log your surf journey, verify each spots
              forecast, and share knowledge with other clubbers.
            </Text>
          </View>

          <View>
            <View style={[styles.inputcontainer, styles.mt2, { width: '60%' }]}>
              <Text style={styles.subtitle}>
                What trip do you want to write about?{' '}
              </Text>
            </View>
            <View style={styles.textinput}>
              <Pressable pointerEvents="none" style={[styles.aiiiconrow]}>
                <TextInput
                  pointerEvents="none"
                  onChangeText={setTitle}
                  value={title}
                  style={styles.inputstyles}
                  placeholder="Title"
                  placeholderTextColor={Color.cardgray}
                />
              </Pressable>
            </View>
          </View>
          <View>
            <Pressable
              style={[styles.inputcontainer, styles.mt2, styles.aiiiconrow]}
            >
              <Text style={styles.subtitle}>Surf Spot</Text>
            </Pressable>
            <View style={[styles.aiiiconrow]}>
              <Pressable
                style={[
                  styles.locationcontainer,
                  { width: CURRENT_WIDTH - 40, marginLeft: 20 },
                ]}
              >
                <Text
                  style={[
                    styles.InformationHeading,
                    { width: '100%', color: Color.black0 },
                  ]}
                >
                  {trip?.destination?.title}
                </Text>
              </Pressable>
            </View>
          </View>

          <View>
            <View style={[styles.inputcontainer, styles.mt2, { width: '70%' }]}>
              <Text style={styles.subtitle}>
                Share the stoke with a story about this surf trip?*
              </Text>
            </View>
            <View style={styles.grayinputcontainer}>
              <TextInput
                multiline
                style={[
                  styles.grayinput,
                  styles.textAlignVertical,
                  { height: dynamicSize(80), paddingVertical: 5 },
                ]}
                onChangeText={setDescription}
                value={description}
                // numberOfLines={6}
                // maxLength={300}
                placeholderTextColor={Color.cardgray}
                placeholder="This trip was awesome because..."
              />
            </View>
          </View>
          <View>
            <View style={[styles.inputcontainer, styles.mt2, { width: '70%' }]}>
              <View style={styles.raitingrow}>
                <Text
                  style={[styles.ratingtext, styles.pr10, { fontSize: 14 }]}
                >
                  Rating*
                </Text>
                <View style={styles.raitingrow}>
                  {[0, 1, 2, 3, 4].map(i => {
                    const isSelected = Number(rating) > Number(i);
                    return (
                      <MaterialCommunityIcons
                        onPress={() => {
                          setrating((i + 1).toString());
                        }}
                        name={isSelected ? 'star' : 'star-outline'}
                        size={dynamicSize(20)}
                        color={isSelected ? Color.starbg : Color.cardgray}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
            <View style={[styles.grayinputcontainer, {}]}>
              <TextInput
                multiline
                pointerEvents="none"
                style={styles.grayinput}
                onChangeText={setrating}
                value={rating ? rating + ' stars' : ''}
                keyboardType={'numeric'}
                // numberOfLines={6}
                placeholderTextColor={Color.cardgray}
                placeholder="1 to 5 stars"
              />
            </View>
          </View>
          <View style={[styles.inputcontainer, styles.mt2]}>
            <Text style={styles.subtitle}>Trip Type*</Text>
            <View style={styles.btnGroup}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  selection === 1
                    ? { backgroundColor: Color.lightblue, ...Shadow.boxShadow }
                    : null,
                ]}
                onPress={() => setSelection(1)}
              >
                <Text
                  style={[
                    styles.btnText,
                    selection === 1 ? { color: 'white' } : null,
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  selection === 2
                    ? { backgroundColor: Color.lightblue, ...Shadow.boxShadow }
                    : null,
                ]}
                onPress={() => setSelection(2)}
              >
                <Text
                  style={[
                    styles.btnText,
                    selection === 2 ? { color: 'white' } : null,
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <View style={[styles.inputcontainer, styles.mt2]}>
              <Text style={styles.subtitle}>Rate Driver*</Text>
            </View>
            <View style={styles.grayinputcontainer}>
              <View style={styles.Directions}>
                <ModalDropdown
                  defaultTextStyle={[styles.InformationHeading]}
                  textStyle={[
                    styles.InformationHeading,
                    { color: Color.black0 },
                  ]}
                  dropdownStyle={styles.dropdownStyle}
                  onSelect={index => {
                    setDriverRate(index);
                  }}
                  dropdownTextStyle={styles.InformationText}
                  options={driverRatingReport}
                  saveScrollPosition={false} // to fix items disappear on select
                />
                <TouchableOpacity style={styles.ml1}>
                  <FastImage
                    style={{ height: 8, width: 12 }}
                    tintColor={Color.cardgray}
                    source={require('../assets/images/icon/dropDownIcon.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View>
            <View style={[styles.inputcontainer, styles.mt2, { width: '70%' }]}>
              <Text style={styles.subtitle}>Verify this Forecast</Text>
            </View>
            <View>
              <FlatList
                horizontal={true}
                data={forecastData[trip?.id] ?? []}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <WavesInfoItem
                    onCardClick={() => {
                      currentSelectedDate.current = item?.time;
                      if (
                        new Date(currentSelectedDate.current).getTime() >
                        new Date().getTime()
                      ) {
                        alert('You can not validate future forecast');
                        return;
                      }
                      setisModalVerify(true);
                    }}
                    spotConfigration={spotConfigration}
                    tideExtremesByday={tideExtremesByday ?? []}
                    width={250}
                    marginHorizontal={5}
                    item={item}
                    key={index.toString()}
                  />
                )}
                keyExtractor={({ item }, index) => index.toString()}
              />
            </View>
          </View>
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.p2}
            >
              {verifiedForests.map((item, id) => {
                const date1 = Number(moment(item?.forecastDate).format('D'));
                const date2 = Number(moment(trip?.startDate).format('D'));
                const diffDays = date2 - date1 + 1;

                return (
                  <Pressable
                    key={id}
                    style={[styles.swellinfocard, { paddingBottom: 0 }]}
                    onPress={Gotosubtab}
                  >
                    <View style={styles.vfbtncontainer}>
                      <Text style={[styles.Swllinfotitle]}>{`day${diffDays} - ${
                        item?.forecastDate
                          ? moment(item?.forecastDate).format('MMM DD YYYY')
                          : ''
                      }`}</Text>
                      <TouchableOpacity disabled style={styles.vfbtn}>
                        <Text style={styles.vfbtntext}>VF</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.swellrow]}>
                      <Text style={[styles.swelllable]}>Forecast Rating</Text>
                      <Text style={[styles.swellinfo, styles.textAlignright]}>
                        {
                          forecastRating[
                            isNaN(Number(item?.rating))
                              ? 0
                              : Number(item?.rating ?? 0)
                          ]
                        }
                      </Text>
                    </View>
                    <Divider style={styles.lightdivider} />
                    <Text
                      style={[
                        styles.swellinfo,
                        { paddingBottom: dynamicSize(10) },
                      ]}
                    >
                      {item?.text}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <View style={[styles.inputcontainer, styles.mt2]}>
            <Text style={styles.subtitle}>Add Photos*</Text>
            <View style={styles.imgcontainer}>
              <ScrollView
                horizontal
                bounces={true}
                contentContainerStyle={{ alignItems: 'center' }}
                showsHorizontalScrollIndicator={false}
              >
                <Pressable
                  onPress={() => {
                    setImagePickerModal(true);
                  }}
                  style={styles.imgaddbtn}
                >
                  <FastImage
                    source={require('../assets/images/icon/AddImage.png')}
                    style={styles.addicon}
                    tintColor={Color.lightblue}
                  />
                </Pressable>
                <FlatList
                  scrollEnabled={false}
                  data={imageList}
                  horizontal
                  renderItem={({ item, index }) => {
                    return (
                      <View style={styles.gallerybox}>
                        <Pressable
                          onPress={() => {
                            setImagePreviewModal(true);
                            setImageUrl(item?.uri);
                          }}
                        >
                          <FastImage
                            resizeMode={resizeMode.center}
                            source={{
                              uri: item.uri,
                              cache: FastImage.cacheControl.immutable,
                            }}
                            style={[
                              styles.gallery,
                              { backgroundColor: resizeMode.background },
                            ]}
                          />
                        </Pressable>
                        <Entypo
                          onPress={() => {
                            const tempList = [...imageList];
                            tempList.splice(index, 1);
                            setImageList(tempList);
                          }}
                          name="circle-with-cross"
                          style={{
                            fontSize: getFontSize(18),
                            color: Color.lightblue,
                            marginLeft: dynamicSize(10),
                            position: 'absolute',
                            top: dynamicSize(10),
                            right: dynamicSize(10),
                          }}
                        />
                      </View>
                    );
                  }}
                />
              </ScrollView>
            </View>
          </View>

          <View>
            <View style={[styles.inputcontainer, styles.mt2]}>
              <Text style={styles.subtitle}>Trip Details</Text>
            </View>
            <View style={styles.detailsection2}>
              <View style={[styles.ph6]}>
                <View style={[styles.iconflex]}>
                  <FastImage
                    source={require('../assets/images/icon/vanLogo.png')}
                    style={styles.detailicon}
                    tintColor={Color.cardgray}
                  />
                  <Text style={styles.nametext}>Driver :</Text>
                </View>
                <View style={[styles.mt2]}>
                  {driverList?.map(item => (
                    <View style={[styles.passengerimgcontainer, styles.mt2]}>
                      <Pressable
                        onPress={() => {
                          navigation.navigate('Profile', {
                            userId: item?.passenger?.id,
                          });
                        }}
                      >
                        <FastImage
                          source={{
                            uri: item?.passenger?.thumbnailProfileImage,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.profileimg}
                        />
                      </Pressable>
                      <View style={{ width: '83%' }}>
                        <Text style={styles.usernametext}>
                          {item?.passenger?.firstName +
                            ' ' +
                            item?.passenger?.lastName}
                        </Text>
                        <Text
                          style={[
                            styles.status,
                            trip?.organizer?.id === item?.passenger?.id && {
                              maxWidth: CURRENT_WIDTH - dynamicSize(200),
                            },
                          ]}
                        >
                          {`${
                            (item?.passenger?.city ?? item?.passenger?.state) +
                            (', ' + item?.passenger?.country ?? '')
                          }\n${
                            userSkillLevel[
                              item?.passenger?.surferSkillLevel ?? 0
                            ]
                          }, ${
                            item?.passenger?.carOwner ? 'Driver' : 'Passenger'
                          }`}
                        </Text>
                      </View>
                      {trip?.organizer?.id === item?.passenger?.id && (
                        <Text
                          style={{
                            position: 'absolute',
                            right: 10,
                            fontSize: getFontSize(14),
                            color: 'black',
                            fontFamily: fontFamily.ProximaAB,
                          }}
                        >
                          Organizer
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={[styles.ph6]}>
                <View style={[styles.iconflex]}>
                  <FastImage
                    source={require('../assets/images/icon/surfingLogo.png')}
                    style={styles.detailicon}
                    tintColor={Color.cardgray}
                  />
                  <Text style={styles.nametext}>Passenger:</Text>
                </View>
                <View style={[styles.mt2]}>
                  {passengersList?.map(item => (
                    <View style={[styles.passengerimgcontainer, styles.mt2]}>
                      <Pressable
                        onPress={() => {
                          navigation.navigate('Profile', {
                            userId: item?.passenger?.id,
                          });
                        }}
                      >
                        <FastImage
                          source={{
                            uri: item?.passenger?.thumbnailProfileImage,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.profileimg}
                        />
                      </Pressable>
                      <View style={{ width: '83%' }}>
                        <Text style={styles.usernametext}>
                          {item?.passenger?.firstName +
                            ' ' +
                            item?.passenger?.lastName}
                        </Text>
                        <Text
                          style={[
                            styles.status,
                            trip?.organizer?.id === item?.passenger?.id && {
                              maxWidth: CURRENT_WIDTH - dynamicSize(200),
                            },
                          ]}
                        >
                          {getUserInfoText(item?.passenger)}
                        </Text>
                      </View>
                      {trip?.organizer?.id === item?.passenger?.id && (
                        <Text
                          style={{
                            position: 'absolute',
                            right: 10,
                            fontSize: getFontSize(14),
                            color: 'black',
                            fontFamily: fontFamily.ProximaAB,
                          }}
                        >
                          Organizer
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={[styles.flexrow, styles.ph6]}>
                <View style={[styles.iconflex, { width: '35%' }]}>
                  <FastImage
                    source={require('../assets/images/icon/vanLogo.png')}
                    style={styles.detailicon}
                    tintColor={Color.cardgray}
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.nametext}
                  >
                    Departed:
                  </Text>
                </View>
                <View style={[{ width: '65%' }]}>
                  <Text style={[styles.nametitle, styles.textAlignright]}>
                    {trip?.startDate
                      ? moment(trip?.startDate ?? '').format('HH:mm')
                      : ''}
                  </Text>
                  <Text style={[styles.nametitle, styles.textAlignright]}>
                    {' '}
                    {departureAddress?.address1 ?? ''}
                  </Text>
                  <Text style={[styles.nametitle, styles.textAlignright]}>
                    {(departureAddress?.city ? departureAddress?.city : '') +
                    ' ' +
                    (departureAddress?.state ? departureAddress?.state : '') +
                    +' ' +
                    departureAddress?.country
                      ? departureAddress?.country
                      : ''}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={[styles.flexrow, styles.ph6]}>
                <View style={[{ width: '50%' }]}>
                  <Text style={styles.nametext}>Arrived:</Text>
                  <Text style={[styles.nametitle, styles.textAlignleft]}>
                    {toAddress}
                  </Text>
                </View>
                <View style={[{ width: '50%' }]}>
                  <Text style={styles.nametext}>Duration:</Text>
                  <Text style={[styles.nametitle, styles.textAlignleft]}>
                    {(trip?.startDate
                      ? moment(trip?.startDate).format('DD/MM')
                      : '') +
                      ' - ' +
                      (trip?.endDate
                        ? moment(trip?.endDate).format('DD/MM')
                        : '')}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={[styles.flexrow, styles.ph6]}>
                <View style={[{ width: '50%' }]}>
                  <Text style={styles.nametext}>Skill Level:</Text>
                  <Text style={[styles.nametitle, styles.textAlignleft]}>
                    {' '}
                    {skill[trip?.skillLevel ?? 0]}
                  </Text>
                </View>
                <View style={[{ width: '50%' }]}>
                  <Text style={styles.nametext}>Board Size:</Text>
                  <Text style={[styles.nametitle, styles.textAlignleft]}>
                    {board[trip?.boardSize]}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View>
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Accomodations:</Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {trip?.accommodationAvailable ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={[styles.nametitle, styles.textAlignleft]}>
                    {accAddress}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View>
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Adaptive:</Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {trip?.isAdaptive ? 'Yes' : 'No'}
                    </Text>
                  </View>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View>
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Expenses:</Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {expenseAmount ? parseFloat(expenseAmount).toFixed(2) : 0}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.flexrow, styles.ph6]}>
                <View style={[{ width: '98%' }]}>
                  <Text style={styles.nametext}>Trip Caption</Text>
                  <View style={styles.textareabox}>
                    <TextInput
                      style={styles.input}
                      multiline
                      editable={false}
                      value={trip?.description}
                      // numberOfLines={6}
                      placeholder="useless placeholder"
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.buttoncontainer}>
            <BorderButton
              isProcessing={isbtnLoader}
              onPress={submitReport}
              color={Color.white}
              backgroundColor={Color.lightblue}
              title={'Submit'}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        isVisible={isModalTripType}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
      >
        <View style={styles.modalcontainer}>
          <View style={styles.modalsubcontainer}>
            <View style={[styles.mx2, styles.modalheader]}>
              <Text style={styles.formtitle}>Add A surf spot to this trip</Text>
            </View>
            <View style={styles.p2}>
              <Text style={styles.title}>Nearby Spots</Text>
              <Pressable
                style={styles.radiocontainer}
                onPress={() => setSelect(!select)}
              >
                <Text style={styles.radiosubtitle}>Towan</Text>
                {select === false ? (
                  <FastImage
                    source={require('../assets/images/icon/radio.png')}
                    style={styles.radiobtn}
                  />
                ) : (
                  <FastImage
                    source={require('../assets/images/icon/clickradio.png')}
                    style={styles.radiobtn}
                  />
                )}
              </Pressable>
              <Pressable
                style={styles.radiocontainer}
                onPress={() => setSelect(!select)}
              >
                <Text style={styles.radiosubtitle}>Towan</Text>
                {select === false ? (
                  <FastImage
                    source={require('../assets/images/icon/radio.png')}
                    style={styles.radiobtn}
                  />
                ) : (
                  <FastImage
                    source={require('../assets/images/icon/clickradio.png')}
                    style={styles.radiobtn}
                  />
                )}
              </Pressable>
              <Pressable
                style={styles.radiocontainer}
                onPress={() => setSelect(!select)}
              >
                <Text style={styles.radiosubtitle}>Towan</Text>
                {select === false ? (
                  <FastImage
                    source={require('../assets/images/icon/radio.png')}
                    style={styles.radiobtn}
                  />
                ) : (
                  <FastImage
                    source={require('../assets/images/icon/clickradio.png')}
                    style={styles.radiobtn}
                  />
                )}
              </Pressable>
            </View>
            <View style={styles.buttoncontainer}>
              <BorderButton
                color={Color.white}
                backgroundColor={Color.lightblue}
                title={'Confirm'}
                onPress={toggleTripType}
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={isModalVerify}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            keyboardShouldPersistTaps={'handled'}
          >
            <View style={styles.modalcontainer}>
              <View style={styles.modalsubcontainer}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text
                    style={[styles.formtitle, { textTransform: 'capitalize' }]}
                  >
                    Verify This FORECAST
                  </Text>
                </View>
                <Text
                  style={[
                    styles.InformationHeading,
                    { textAlign: 'center', marginTop: 10 },
                  ]}
                >
                  {currentSelectedDate?.current
                    ? moment(currentSelectedDate?.current).format('DD/MM/YYYY')
                    : ''}
                </Text>

                <Pressable
                  style={styles.modalinputcontainer}
                  onPress={toggleTripType}
                >
                  <Text style={[styles.InformationHeading]}>
                    {trip?.destination?.title}
                  </Text>
                  {/* <FastImage
                                    source={require('../assets/images/icon/Edit.png')}
                                    style={styles.editbtnimg}
                                /> */}
                </Pressable>
                <View style={styles.mt2}>
                  <Text style={styles.title}>How was the forecast ?</Text>
                  <Pressable style={styles.modalinputcontainer}>
                    <View style={styles.Directions}>
                      <ModalDropdown
                        textStyle={styles.InformationHeading}
                        onSelect={(index, value) => setSelectedIndex(index)}
                        dropdownStyle={styles.dropdownStyle}
                        dropdownTextStyle={styles.InformationText}
                        options={forecastRating}
                        saveScrollPosition={false} // to fix items disappear on select
                      />
                      <TouchableOpacity style={styles.ml1}>
                        <FastImage
                          style={{ height: 8, width: 12 }}
                          tintColor={Color.cardgray}
                          source={require('../assets/images/icon/dropDownIcon.png')}
                        />
                      </TouchableOpacity>
                    </View>
                  </Pressable>
                </View>
                <View>
                  <Text
                    style={[styles.formtitle, { textTransform: 'capitalize' }]}
                  >
                    Tell us why you are giving this rating?
                  </Text>
                  <TextInput
                    theme={{
                      colors: {
                        text: Color.black0,
                        placeholder: Caption ? Color.lightblue : Color.gray,
                        background: 'transparent',
                      },
                      fonts: {
                        regular: {
                          fontFamily: 'Poppins-Regular',
                        },
                      },
                    }}
                    underlineColor={Caption ? Color.lightblue : Color.gray}
                    mode="outlined"
                    numberOfLines={5}
                    keyboardType={keyboardType.default}
                    multiline={true}
                    placeholder="Type here..."
                    value={Caption}
                    onChangeText={Caption => setCaption(Caption)}
                    style={styles.paperinput}
                    selectionColor={Color.lightblue}
                    activeOutlineColor={Color.lightblue}
                  />
                </View>
                <View
                  style={[
                    styles.buttoncontainer,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      setisModalVerify(false);
                    }}
                    style={{
                      borderWidth: 1,
                      height: 40,
                      width: 100,
                      borderRadius: 40,
                      borderColor: Color.lightblue,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: Color.lightblue,
                        fontFamily: fontFamily.ProximaAB,
                      }}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      if (
                        new Date(currentSelectedDate.current).getTime() >
                        new Date().getTime()
                      ) {
                        alert('You can not validate future forecast');
                        return;
                      }
                      try {
                        if (selectedIndex == -1) {
                          alert('Select how the forecast was');
                          return;
                        }
                        if (Caption?.trim()?.length == 0) {
                          alert('Enter Feedback');
                          return;
                        }
                        setisModalVerify(false);
                        const param = {
                          tripId: trip?.id,
                          forecastDate: new Date(
                            currentSelectedDate.current,
                          ).toISOString(),
                          rating: selectedIndex.toString(),
                          text: Caption?.toString() ?? '',
                        };

                        const data = await Trip.verifyForecast(param);
                        setCaption('');
                        setSelectedIndex(-1);
                        getVerifiedForecast();
                      } catch (error) {
                        alert(error?.detail);
                      }
                    }}
                    style={{
                      height: 40,
                      width: 100,
                      borderRadius: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Color.lightblue,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: Color.white,
                        fontFamily: fontFamily.ProximaAB,
                      }}
                    >
                      Verify
                    </Text>
                  </Pressable>
                  {/* <BorderButton
                                    color={Color.white}
                                    backgroundColor={Color.lightblue}
                                    title={'Confirm'}
                                    onPress={toggleVerify}
                                /> */}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <SuccessModal
        visible={successModal}
        onClose={() => {
          setSuccessModal(false);
          //needToRefresh();
          navigation.navigate('ClubProfile', { clubid });
          //navigation.goBack();
        }}
        description={'Your trip report has been uploaded'}
      />
      {/* <ImagePickerModal
                    visible={true
                    }
                /> */}
      <MultipleImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={list => {
          setImagePickerModal(false);
          setImageList([...imageList, ...list]);
        }}
      />
      <PreviewModal
        visible={imagePreviewModal}
        onClose={() => {
          setImagePreviewModal(false);
        }}
        onOpen={() => {
          setImagePreviewModal(true);
        }}
        photoUrl={imageUrl}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalinputcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Color.reportcardbg,
    padding: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  usernametext: {
    color: Color.cardgray,
    ...text.usernameboldtitle,
    flex: 1,
    flexWrap: 'wrap',
  },
  paperinput: {
    backgroundColor: Color.reportcardbg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    height: 100,
  },
  radiocontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderTopColor:Color.reportcardbg,
    // borderTopWidth:1,
    borderBottomColor: Color.reportcardbg,
    borderBottomWidth: 1,
    paddingVertical: 13,
  },
  radiobtn: {
    height: 20,
    width: 20,
  },
  modaldivider: {
    // marginVertical: 13,
    marginBottom: 13,
    height: 0.8,
    backgroundColor: Color.cardbg,
  },
  radiosubtitle: {
    fontSize: getFontSize(14),
    color: Color.themeColor,
    paddingLeft: 20,
    lineHeight: getFontSize(20),
    fontFamily: fontFamily.ProximaAB,
  },
  title: {
    fontSize: getFontSize(14),
    color: Color.themeColor,
    lineHeight: getFontSize(20),
    fontFamily: fontFamily.ProximaAB,
  },
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaBold,
    marginTop: 10,
    textTransform: 'uppercase',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: 300,
    padding: 15,
    borderRadius: 20,
  },
  modalcontainer: {
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  p2: {
    padding: 10,
  },
  vfbtncontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  vfbtntext: {
    fontSize: getFontSize(10),
    color: Color.white,
    lineHeight: 17,
  },
  vfbtn2: {
    height: 25,
    width: 25,
    backgroundColor: Color.lightblue,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginRight: 5,
  },
  vfbtn: {
    height: dynamicSize(25),
    width: dynamicSize(25),
    backgroundColor: Color.lightblue,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    marginLeft: 7,
  },
  lightdivider: {
    marginVertical: 13,
    height: 0.8,
    backgroundColor: Color.cardbg,
  },
  swellrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  Swllinfotitle: {
    fontSize: getFontSize(12),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
    textTransform: 'uppercase',
    flexWrap: 'wrap',
  },
  swellinfo: {
    fontSize: getFontSize(16),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
  },
  swelllable: {
    fontSize: getFontSize(13),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
    flex: 1,
    flexWrap: 'wrap',
  },
  swellinfocard: {
    backgroundColor: Color.black,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 20,
    width: dynamicSize(280),
  },
  justifyContentcenter: {
    justifyContent: 'center',
  },
  InformationHeading: {
    paddingHorizontal: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(23),
    textAlign: 'left',
    flexWrap: 'wrap',
    marginVertical: 5,
    color: Color.cardgray,
  },
  Directions: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'center',
  },
  dropdownStyle: {
    width: 150,
    padding: 15,
    borderRadius: 10,
  },
  InformationText: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
    color: 'black',
  },
  editspottext: {
    color: Color.cardgray,
    fontSize: getFontSize(15),
    maxWidth: '85%',
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  editbtnimg: {
    width: '10%',
    resizeMode: 'contain',
    marginLeft: 5,
    height: 12,
  },
  aiiiconrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addspoticon: {
    width: 25,
    marginRight: 5,
    height: 25,
  },
  buttoncontainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  addicon: {
    height: dynamicSize(30),
    width: dynamicSize(30),
  },
  imgaddbtn: {
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderStyle: 'dashed',
    height: dynamicSize(120),
    width: dynamicSize(100),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pr10: {
    paddingRight: 10,
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grayinputcontainer: {
    backgroundColor: Color.reportcardbg,
    marginHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
  },
  grayinput: {
    minHeight: 30,
    padding: 0,
    paddingHorizontal: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(23),
    textAlign: 'left',
  },
  textAlignVertical: {
    textAlignVertical: 'top',
  },

  locationcontainer: {
    width: '55%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Color.reportcardbg,
    padding: 5,
    marginLeft: 30,
    marginRight: 5,
    marginVertical: 10,
    borderRadius: 10,
  },
  inputstyles: {
    minHeight: 30,
    padding: 0,
    paddingHorizontal: 10,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
    fontSize: 14,
    // textAlign: 'center',
  },
  textinput: {
    marginHorizontal: 20,
    borderBottomColor: Color.cardgray,
    borderBottomWidth: 1,
    marginVertical: 20,
    paddingVertical: 5,
    fontFamily: fontFamily.ProximaR,
  },
  selection1title: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaAB,
    textAlign: 'center',
    color: Color.black,
    marginBottom: 10,
  },
  selection1text: {
    fontSize: getFontSize(14),
    color: Color.black,
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    textAlign: 'center',
  },
  selection1: {
    backgroundColor: Color.reportcardbg,
    padding: 20,
    alignItems: 'center',
    margin: 20,
    borderRadius: 30,
  },
  input: {
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 15,
    backgroundColor: Color.white,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  textareabox: {
    marginVertical: 5,
  },
  passengerimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ph6: {
    paddingVertical: 6,
  },
  detailsection2: {
    backgroundColor: Color.reportcardbg,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 10,
  },
  divider: {
    marginVertical: 15,
    height: 1.5,
  },
  textAlignleft: {
    textAlign: 'left',
  },
  textAligncenter: {
    textAlign: 'center',
  },
  textAlignright: {
    textAlign: 'right',
  },
  flexrow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconflex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailicon: {
    height: 20,
    width: 20,
    marginRight: 5,
  },

  imgcontainer: {
    // paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  gallerybox: {
    height: dynamicSize(140),
    width: dynamicSize(120),
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
  },
  gallery: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  mt2: {
    marginTop: 10,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,

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
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(20),
  },
  ratingtext: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: getFontSize(14),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    width: '85%',
  },
  inputcontainer: {
    paddingHorizontal: dynamicSize(20),
  },
  nametitle: {
    fontSize: getFontSize(13),
    lineHeight: getFontSize(20),
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    textAlign: 'right',
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  nametext: {
    color: Color.cardgray,
    ...text.tripitemtitle,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  status: {
    ...text.usernamestatus,
    color: Color.cardgray,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default CreateClubReport;

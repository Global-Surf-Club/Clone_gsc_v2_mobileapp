// CreateEvent.js - Updated to use Redux config store instead of API calls

import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useCallback, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { Image } from 'react-native';
import Modal from 'react-native-modal';
import SearchPlaceModal from '../components/SearchPlaceModal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Snackbar, Switch, TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import { ButtonRound } from '../components/Buttons';
import { Header } from '../components/Header';
import {
  Color,
  fontFamily,
  keyboardType,
  Shadow,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import SuccessModal from '../components/SuccessModal';
import ImagePickerModal from '../components/ImagePickerModal';
import Trip from '../api/Trip';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { DatePickerModal } from '../../react-native-paper-dates';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import FastImage from 'react-native-fast-image';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  createEvent,
  updateEvent,
  uploadEventImage,
} from '../store/eventSlice';

import {
  fetchRecurringTypes,
  fetchStartWhenList,
  getStartWhenList,
} from '../store/configSlice';
import ConnectionBanner from '../components/ConnectionBanner';
import { mergeEvent } from '../database/eventDbHelper';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

const CreateEvent = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux selectors
  const user = useSelector(state => state.auth.user);
  const isOnline = useSelector(state => state.event.isOnline);
  const recurringTypeListTemp = useSelector(
    state => state.config.recurringTypes,
  );
  const configLoading = useSelector(state => state.config.loading);

  const { clubid, EventDetails, isPublish } = props?.route?.params;

  const [showLoading, SetshowLoading] = useState(false);
  const [isbtnLoader, setIsbtnLoader] = useState(false);
  const [openenddate, Setopenenddate] = useState(false);
  const [visiblestartTime, setvisiblestartTime] = useState(false);
  const [visibleEndTime, setvisibleEndTime] = useState(false);

  const [startTime, setstartTime] = useState(
    moment(new Date()).format('HH:mm'),
  );
  const [EndTime, setEndTime] = useState(moment(new Date()).format('HH:mm'));
  const [FinalEndTime, setFinalEndTime] = useState('');
  const [FinalStartTime, setFinalStartTime] = useState('');
  const [type, settype] = useState();
  const [Title, setTitle] = useState();
  const [address, setaddress] = useState();
  const [description, setdescription] = useState();
  const [capacity, setcapacity] = useState(null);

  const [isModalTripType, setisModalTripType] = useState();
  const [isModalrecurring, setisModalrecurring] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const [isSwitchOnGest, setisSwitchOnGest] = React.useState(false);
  const [startDate, setStartDate] = useState(
    moment(new Date()).format('DD-MM-YYYY'),
  );
  const [EndDate, setEndDate] = useState(
    moment(new Date().setDate(new Date().getDate() + 1)).format('DD-MM-YYYY'),
  );
  const [EndDateFinal, setEndDateFinal] = useState(
    moment(new Date().setDate(new Date().getDate() + 1)),
  );
  const [startDateFinal, setStartDateFinal] = useState(moment(new Date()));
  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
  const onToggleSwitchGest = () => setisSwitchOnGest(!isSwitchOnGest);

  const triptype = ['Inside Club'];

  const [visible, setVisible] = React.useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [imageData, setimageData] = useState(null);
  const [UplodedimageData, setUplodedimageData] = useState(null);
  const [departureLocationModal, setDepartureLocationModal] = useState(false);
  const [recurringTypeID, setRecurringTypeID] = useState(0);
  const [recurringTypeName, setrecurringTypeName] = useState('');
  const [isModalduration, setisModalduration] = useState();
  const [isModalstartwhen, setisModalstartwhen] = useState();
  const [durationlist, setdurationlist] = useState([]);
  const [startwhenList, setstartwhenList] = useState([]);
  const [durationName, setdurationName] = useState('1');
  const [startwhenName, setstartwhenName] = useState([]);
  const [repeatNumber, setrepeatNumber] = useState(0);
  const [DateError, setDateError] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [dates, setDates] = React.useState();
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useEffect(() => {
    if (recurringTypeListTemp || recurringTypeListTemp?.length == 0)
      dispatch(fetchRecurringTypes());
  }, []);

  const onDismiss = React.useCallback(() => {
    setDateError(null);
    setOpen(false);
  }, [setOpen]);

  const onConfirmMultiDates = React.useCallback(params => {
    if (params.dates?.length > 0) {
      setDateError(null);
      setOpen(false);
      setDates(params.dates);
      let temp = [];
      params.dates.map((item, index) => {
        let selectinputdate = moment(item).format('YYYY-MM-DD');
        temp?.push(selectinputdate);
      });
      setstartwhenName(temp);
    } else {
      setDateError('please select date');
    }
  }, []);

  const toggleTripType = () => setisModalTripType(!isModalTripType);
  const togglericurring = () => setisModalrecurring(!isModalrecurring);
  const toggleduration = () => setisModalduration(!isModalduration);
  const togglestartwhen = () => setisModalstartwhen(!isModalstartwhen);

  const onricurringSelected = async item => {
    togglericurring();
    setstartwhenList([]);
    setstartwhenName([]);
    setRecurringTypeID(item?.id);
    setrecurringTypeName(item?.name);

    if (item?.name?.toLowerCase() === 'weekly') {
      await GetStartWhen(item?.name?.toLowerCase());
    }
  };

  const onisdurationSelected = item => {
    setdurationName(item?.name);
    toggleduration();
  };

  const SaveSelectedDays = () => {
    let Temp = startwhenList?.filter(x => x.id == 1);
    let temp1 = [];
    if (Temp?.length > 0) {
      Temp?.map((item, i) => {
        temp1?.push(item?.name);
      });
      setstartwhenName(temp1);
    } else {
      setstartwhenName([]);
    }
    togglestartwhen();
  };

  const onisstartwhenSelected = (item, index) => {
    let StartwhenList = [...startwhenList];
    StartwhenList[index].id = 1;
    setstartwhenList(StartwhenList);
  };

  const onTripTypeSelected = value => {
    settype(value);
    toggleTripType();
  };

  useEffect(() => {
    if (
      EventDetails !== null &&
      EventDetails !== undefined &&
      EventDetails !== ''
    ) {
      let recurringTypevalue = recurringTypeListTemp.find(
        x => x.id == EventDetails?.recurringTypeID,
      );
      setrecurringTypeName(
        recurringTypevalue?.name ? recurringTypevalue?.name : '',
      );
      setRecurringTypeID(
        EventDetails?.recurringTypeID ? EventDetails?.recurringTypeID : 0,
      );
      EventUpdateDetails(EventDetails);
    }
  }, [EventDetails, recurringTypeListTemp]);

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

  const GetStartWhen = async name => {
    try {
      SetshowLoading(true);

      const startWhenData = await dispatch(getStartWhenList(name));

      if (startWhenData && startWhenData.length > 0) {
        setstartwhenList(startWhenData);
      } else {
        setstartwhenList([]);
      }

      SetshowLoading(false);
    } catch (error) {
      setstartwhenList([]);
      SetshowLoading(false);
    }
  };

  const onDismissstarttime = useCallback(() => {
    setvisiblestartTime(false);
  }, [setvisiblestartTime]);

  const onDismissEndTime = useCallback(() => {
    setvisibleEndTime(false);
  }, [setvisibleEndTime]);

  const onConfirmstarttime = date => {
    setvisiblestartTime(false);
    setstartTime(moment(date).format('HH:mm'));
    setFinalStartTime(date);
  };

  const onConfirmstEndtime = date => {
    setvisibleEndTime(false);
    setEndTime(moment(date).format('HH:mm'));
    setFinalEndTime(date);
  };

  const openDatePicker = () => setShowDatePicker(true);
  const openEndDatePicker = () => setShowEndDatePicker(true);
  const menuButtonClick = () => navigation.goBack();

  const EventUpdateDetails = EventDetails => {
    if (
      EventDetails !== null &&
      EventDetails !== undefined &&
      EventDetails !== ''
    ) {
      setTitle(EventDetails?.name);
      setStartDate(moment(EventDetails?.startDate).format('DD-MM-YYYY'));
      setstartTime(EventDetails?.startTime);
      setEndDate(moment(EventDetails?.endDate).format('DD-MM-YYYY'));
      setStartDateFinal(EventDetails?.startDate);
      setEndDateFinal(EventDetails?.endDate);
      setEndTime(EventDetails?.endTime);
      setFinalEndTime(
        new Date(
          moment(EventDetails?.endDate).format('YYYY-MM-DD') +
            'T' +
            EventDetails?.endTime,
        ),
      );
      setFinalStartTime(
        new Date(
          moment(EventDetails?.startDate).format('YYYY-MM-DD') +
            'T' +
            EventDetails?.startTime,
        ),
      );
      setaddress(EventDetails?.address);
      setdescription(EventDetails?.description);
      setisSwitchOnGest(EventDetails?.isShowGuestList);
      setIsSwitchOn(EventDetails?.onlyAdminCommentOnly);
      setcapacity(EventDetails?.capacity.toString());
      setimageData(EventDetails?.thumbnailCoverPhotoPath);
      if (EventDetails?.isPublic === true) {
        settype('Public');
      } else if (EventDetails?.isPublic === false) settype('Inside Club');
    }
  };

  const submitCreateEvent = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      alert(
        'No internet connection. Please check your connection and try again.',
      );
      return;
    }

    let addressAddressId = null;
    let ispublis = false;
    let StartDateFinal = moment(new Date(startDateFinal)).format('YYYY-MM-DD');
    let endDateFinal = moment(new Date(EndDateFinal)).format('YYYY-MM-DD');
    let currentDate = moment(new Date()).format('YYYY-MM-DD');
    let currentTime = moment(new Date()).format('HH:mm');
    let isRecurring = false;

    if (
      recurringTypeID !== 0 &&
      recurringTypeID !== null &&
      recurringTypeID !== undefined &&
      recurringTypeID !== ''
    ) {
      isRecurring = true;
    }
    if (isPublish === 'isPublish') {
      ispublis = true;
    }

    if (Title === null || Title === undefined || Title === '') {
      alert('Please enter event name');
      return false;
    }

    if (
      recurringTypeName !== null &&
      recurringTypeName !== undefined &&
      recurringTypeName !== '' &&
      recurringTypeName !== 0 &&
      recurringTypeName?.toLowerCase() !== 'daily'
    ) {
      if (
        startwhenName === null ||
        startwhenName === undefined ||
        startwhenName === '' ||
        startwhenName?.length == 0
      ) {
        alert('Please Select Start When');
        return false;
      }
    }

    if (recurringTypeName?.toLowerCase() == 'monthly') {
      if (startwhenName?.length > 0) {
        let StartwhenName = startwhenName?.filter(x => x == currentDate);
        if (StartwhenName?.length > 0) {
          if (StartwhenName <= currentDate) {
            if (startTime < currentTime) {
              alert('Your event date and time needs to be in the future');
              return false;
            }
          }
        }
      }
    } else {
      if (StartDateFinal <= currentDate) {
        if (startTime < currentTime) {
          alert('Your event date and time needs to be in the future');
          return false;
        }
      }
      if (StartDateFinal == endDateFinal) {
        if (EndTime <= startTime) {
          alert(
            'The Event end date and time must be later than event start date and time',
          );
          return false;
        }
      }
    }

    if (
      startDateFinal === null ||
      startDateFinal === undefined ||
      startDateFinal === ''
    ) {
      alert('Please enter startdate');
      return false;
    }

    if (startTime === null || startTime === undefined || startTime === '') {
      alert('Please enter starttime');
      return false;
    }

    if (address === null || address === undefined || address === '') {
      alert('Please enter address');
      return false;
    }

    if ((type === null || type === undefined || type === '') && !ispublis) {
      alert('Select privacy');
      return false;
    }

    if (
      capacity <= 0 ||
      capacity === 0 ||
      capacity === null ||
      capacity === undefined ||
      capacity === ''
    ) {
      alert('Please insert capacity more than 0');
      return false;
    }

    if (
      description === null ||
      description === undefined ||
      description === ''
    ) {
      alert('Please enter description');
      return false;
    }

    setIsbtnLoader(true);
    SetshowLoading(true);

    try {
      // Create address first (if online)
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected && address) {
        let addressAddress = await Trip.createAddress(address);
        addressAddressId = addressAddress?.id;
      }

      const data = {
        clubId: clubid,
        organizerId: user.id,
        name: Title,
        startDate: startDateFinal,
        startTime: startTime,
        endDate: EndDateFinal,
        endTime: EndTime,
        addressId: addressAddressId,
        isPublic: ispublis,
        description: description,
        isShowGuestList: isSwitchOnGest,
        onlyAdminCommentOnly: isSwitchOn,
        capacity: capacity,
        recurringTypeID: recurringTypeID,
        recurringStartWhen: startwhenName,
        isRecurring: isRecurring,
      };

      // Use offline-first createEvent action
      dispatch(
        createEvent(data, data.clubId, (success, response) => {
          if (success) {
            if (UplodedimageData !== null && response?.id) {
              const imageDataUpload = new FormData();
              imageDataUpload.append(0, UplodedimageData);

              dispatch(
                uploadEventImage(
                  response?.id,
                  imageDataUpload,
                  isRecurring,
                  (imgSuccess, imgRes) => {
                    dispatch(
                      mergeEvent({
                        id: response?.id,
                        data: {
                          ...response,
                          thumbnailCoverPhotoPath: UplodedimageData?.uri,
                          coverPhotoPath: UplodedimageData?.uri,
                        },
                      }),
                    );
                  },
                ),
              );
            }

            setIsbtnLoader(false);
            SetshowLoading(false);

            setTimeout(
              () => {
                if (response.offline) {
                  setSuccess(true);
                  setSuccessDescription(
                    'Event saved locally. Will be created when online.',
                  );
                } else {
                  setSuccess(true);
                  setSuccessDescription(
                    'You have created your event successfully',
                  );
                }
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setIsbtnLoader(false);
            SetshowLoading(false);
            alert('Failed to create event');
          }
        }),
      );
    } catch (error) {
      setIsbtnLoader(false);
      SetshowLoading(false);
      alert('An error occurred while creating the event');
    }
  };

  const UpdateCreateEvent = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      alert(
        'No internet connection. Please check your connection and try again.',
      );
      return;
    }

    let addressAddressId = null;
    let ispublis = false;
    let StartDateFinal = moment(new Date(startDateFinal)).format('YYYY-MM-DD');
    let endDateFinal = moment(new Date(EndDateFinal)).format('YYYY-MM-DD');
    let currentDate = moment(new Date()).format('YYYY-MM-DD');
    let currentTime = moment(new Date()).format('HH:mm');
    let isRecurring = false;

    if (
      recurringTypeID !== 0 &&
      recurringTypeID !== null &&
      recurringTypeID !== undefined &&
      recurringTypeID !== ''
    ) {
      isRecurring = true;
    }

    if (isPublish === 'isPublish') {
      ispublis = true;
    }

    // Validations
    if (Title === null || Title === undefined || Title === '') {
      alert('Please enter event name');
      return false;
    }

    if (StartDateFinal <= currentDate) {
      if (startTime < currentTime) {
        alert('Your event date and time needs to be in the future');
        return false;
      }
    }

    if (StartDateFinal == endDateFinal) {
      if (EndTime < startTime) {
        alert(
          'The Event end date and time must be later than event start date and time',
        );
        return false;
      }
    }

    if (
      startDateFinal === null ||
      startDateFinal === undefined ||
      startDateFinal === ''
    ) {
      alert('Please enter startdate');
      return false;
    }

    if (startTime === null || startTime === undefined || startTime === '') {
      alert('Please enter starttime');
      return false;
    }

    if (address === null || address === undefined || address === '') {
      alert('Please enter address');
      return false;
    }

    if (
      capacity <= 0 ||
      capacity === 0 ||
      capacity === null ||
      capacity === undefined ||
      capacity === ''
    ) {
      alert('Please insert capacity more than 0');
      return false;
    }

    if (
      description === null ||
      description === undefined ||
      description === ''
    ) {
      alert('Please enter description');
      return false;
    }

    setIsbtnLoader(true);
    SetshowLoading(true);

    try {
      // Handle address
      const netInfo = await NetInfo.fetch();
      if (address) {
        if (address?.id) {
          addressAddressId = address?.id;
        } else if (netInfo.isConnected) {
          let addressAddress = await Trip.createAddress(address);
          addressAddressId = addressAddress?.id;
        }
      }

      const data = {
        id: EventDetails?.id,
        clubId: clubid,
        organizerId: user.id,
        name: Title,
        startDate: startDateFinal,
        startTime: startTime,
        endDate: EndDateFinal,
        endTime: EndTime,
        addressId: addressAddressId,
        isPublic: ispublis,
        description: description,
        isShowGuestList: isSwitchOnGest,
        onlyAdminCommentOnly: isSwitchOn,
        capacity: capacity,
        recurringTypeID: recurringTypeID,
        recurringStartWhen: startwhenName,
        isRecurring: isRecurring,
      };

      // Use offline-first updateEvent action
      dispatch(
        updateEvent(
          data,
          EventDetails?.id,
          data?.clubId,
          (success, response) => {
            if (success) {
              // Upload image if exists
              if (UplodedimageData !== null) {
                const imageDataUpload = new FormData();
                imageDataUpload.append(0, UplodedimageData);

                dispatch(
                  uploadEventImage(
                    EventDetails?.id,
                    imageDataUpload,
                    false,
                    (imgSuccess, imgRes) => {
                      dispatch(
                        mergeEvent({
                          id: response?.id,
                          data: {
                            ...response,
                            thumbnailCoverPhotoPath: UplodedimageData?.uri,
                            coverPhotoPath: UplodedimageData?.uri,
                          },
                        }),
                      );
                    },
                  ),
                );
              }

              setIsbtnLoader(false);
              SetshowLoading(false);

              setTimeout(
                () => {
                  if (response.offline) {
                    setSuccess(true);
                    setSuccessDescription(
                      'Event saved locally. Will be updated when online.',
                    );
                  } else {
                    setSuccess(true);
                    setSuccessDescription('Event updated successfully');
                  }
                },
                Platform.OS === 'ios' ? 300 : 0,
              );
            } else {
              setIsbtnLoader(false);
              SetshowLoading(false);
              alert('Failed to update event');
            }
          },
        ),
      );
    } catch (error) {
      setIsbtnLoader(false);
      SetshowLoading(false);
      alert('An error occurred while updating the event');
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
        title={
          EventDetails !== null &&
          EventDetails !== undefined &&
          EventDetails !== ''
            ? 'Update Event'
            : 'Create Event'
        }
        textAlign={'center'}
      />

      {/* {!currentNetworkStatus && (
        <View style={styles.offlineIndicator}>
          <Ionicons name="cloud-offline" size={16} color="white" />
          <Text style={styles.offlineText}>
            No internet connection. Please go online to create your event.
          </Text>
        </View>
      )} */}
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: 0 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      <Loader visible={showLoading || configLoading} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.tabbartab1}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            enableOnAndroid={true}
            keyboardOpeningTime={0}
            contentContainerStyle={{
              paddingBottom: dynamicSize(15),
            }}
          >
            {/* Profile section */}
            <View style={[styles.row, styles.mb2]}>
              {user.thumbnailProfileImage !== null &&
              user.thumbnailProfileImage !== undefined &&
              user.thumbnailProfileImage !== '' ? (
                <View style={styles.friendimgcontainer}>
                  <FastImage
                    style={styles.friendimg}
                    source={{
                      uri: user?.thumbnailProfileImage,
                      cache: FastImage.cacheControl.immutable,
                    }}
                  />
                </View>
              ) : (
                <FastImage
                  style={styles.friendimg}
                  source={require('../assets/images/logo.png')}
                />
              )}
              <View style={{ width: '70%' }}>
                <Text style={styles.friendname}>
                  {(user?.firstName ?? '') + ' ' + (user?.lastName ?? '')}
                </Text>
                <Text style={styles.friendaddress}>{user?.username}</Text>
              </View>
            </View>

            {/* Event Name */}
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
                label="Event Name*"
                value={Title}
                onChangeText={Title => setTitle(Title)}
                placeholder="Enter Event Name"
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>

            {/* Recurring Type Dropdown */}
            {EventDetails === null ||
            EventDetails === undefined ||
            EventDetails === '' ? (
              <View style={styles.inputcontainer}>
                <Pressable onPress={togglericurring}>
                  <View pointerEvents="none">
                    <TextInput
                      label="Select Recurring Type"
                      theme={{
                        colors: {
                          text: Color.black0,
                          placeholder: recurringTypeName
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
                      underlineColor={
                        recurringTypeName ? Color.lightblue : Color.gray
                      }
                      placeholder="Select Recurring Type"
                      style={styles.paperinput}
                      selectionColor={Color.lightblue}
                      activeUnderlineColor={Color.lightblue}
                      editable={false}
                      value={recurringTypeName}
                    />
                  </View>
                </Pressable>
              </View>
            ) : (
              <></>
            )}
            {recurringTypeName !== null &&
            recurringTypeName !== undefined &&
            recurringTypeName !== '' &&
            recurringTypeName?.toLowerCase() !== 'daily' ? (
              <>
                <View style={styles.inputcontainer}>
                  <Pressable
                    onPress={() => {
                      recurringTypeName?.toLowerCase()?.trim() !== 'monthly'
                        ? togglestartwhen()
                        : setOpen(true);
                    }}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        label="Select Start When*"
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder:
                              startwhenName?.length > 0
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
                        multiline={true}
                        numberOfLines={2}
                        underlineColor={
                          startwhenName?.length > 0
                            ? Color.lightblue
                            : Color.gray
                        }
                        placeholder="Select Start When"
                        style={[styles.paperinput]}
                        selectionColor={Color.lightblue}
                        activeUnderlineColor={Color.lightblue}
                        editable={false}
                        value={
                          startwhenName?.length <= 4
                            ? startwhenName.join(', ')
                            : `${startwhenName[0]}, ${startwhenName[1]}, ${startwhenName[2]}, ${startwhenName[3]}` +
                              `(+ ${startwhenName?.length - 4} more)`
                        }
                      />
                    </View>
                  </Pressable>
                </View>
                <DatePickerModal
                  disableStatusBarPadding={true}
                  locale="en"
                  mode="multiple"
                  closeIcon={'close-circle'}
                  primaryContainer={Color.lightblue}
                  uppercase={false}
                  saveLabel={'Save'}
                  saveLabelError={DateError ? DateError : ''}
                  visible={open}
                  onDismiss={onDismiss}
                  dates={dates}
                  onConfirm={onConfirmMultiDates}
                  theme={{ colors: { text: 'red' } }}
                  onChange={() => {
                    setDateError(null);
                  }}
                />
              </>
            ) : (
              <></>
            )}
            <>
              {recurringTypeName?.toLowerCase()?.trim() !== 'monthly' ? (
                <View style={styles.inputcontainer}>
                  <Pressable onPress={openDatePicker}>
                    <View pointerEvents="none">
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: startDate
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
                        underlineColor={
                          startDate ? Color.lightblue : Color.gray
                        }
                        label="Start Date*"
                        style={styles.paperinput}
                        selectionColor={Color.lightblue}
                        editable={false}
                        value={startDate}
                        activeUnderlineColor={Color.lightblue}
                      />
                    </View>
                  </Pressable>

                  <DateTimePickerModal
                    date={new Date(startDateFinal)}
                    isVisible={showDatePicker}
                    is24Hour
                    locale="en_GB"
                    mode="date"
                    minimumDate={new Date()}
                    onConfirm={date => {
                      setShowDatePicker(false);
                      setStartDate(moment(date).format('DD-MM-YYYY'));
                      let myDate = new Date(date);
                      myDate.setDate(myDate.getDate() + 1);
                      setEndDateFinal(myDate);
                      setEndDate(moment(myDate).format('DD-MM-YYYY'));
                      setStartDateFinal(date);
                    }}
                    onCancel={() => {
                      setShowDatePicker(false);
                    }}
                  />
                </View>
              ) : (
                <></>
              )}
              <View style={styles.inputcontainer}>
                <Pressable onPress={() => setvisiblestartTime(true)}>
                  <View pointerEvents="none">
                    <TextInput
                      theme={{
                        colors: {
                          text: Color.black0,
                          placeholder: startTime ? Color.lightblue : Color.gray,
                          background: 'transparent',
                        },
                        fonts: {
                          regular: {
                            fontFamily: fontFamily.ProximaR,
                          },
                        },
                      }}
                      underlineColor={startTime ? Color.lightblue : Color.gray}
                      label="Start Time*"
                      style={styles.paperinput}
                      selectionColor={Color.lightblue}
                      editable={false}
                      value={startTime}
                      activeUnderlineColor={Color.lightblue}
                    />
                  </View>
                </Pressable>
                <DateTimePickerModal
                  isVisible={visiblestartTime}
                  date={FinalStartTime ? FinalStartTime : new Date()}
                  is24Hour
                  locale="en_GB"
                  mode="time"
                  onConfirm={date => {
                    onConfirmstarttime(date);
                  }}
                  onCancel={onDismissstarttime}
                />
              </View>
              <>
                {recurringTypeName?.toLowerCase()?.trim() !== 'monthly' ? (
                  <View style={styles.inputcontainer}>
                    <Pressable onPress={openEndDatePicker}>
                      <View pointerEvents="none">
                        <TextInput
                          theme={{
                            colors: {
                              text: Color.black0,
                              placeholder: EndDate
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
                          underlineColor={
                            EndDate ? Color.lightblue : Color.gray
                          }
                          label="End Date*"
                          style={styles.paperinput}
                          selectionColor={Color.lightblue}
                          editable={false}
                          value={EndDate}
                          activeUnderlineColor={Color.lightblue}
                        />
                      </View>
                    </Pressable>

                    <DateTimePickerModal
                      date={new Date(EndDateFinal)}
                      isVisible={showEndDatePicker}
                      is24Hour
                      locale="en_GB"
                      mode="date"
                      minimumDate={
                        startDateFinal ? new Date(startDateFinal) : new Date()
                      }
                      onConfirm={date => {
                        setShowEndDatePicker(false);
                        setEndDate(moment(date).format('DD-MM-YYYY'));
                        setEndDateFinal(date);
                      }}
                      onCancel={() => {
                        setShowEndDatePicker(false);
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}
                <View style={styles.inputcontainer}>
                  <Pressable onPress={() => setvisibleEndTime(true)}>
                    <View pointerEvents="none">
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: EndTime ? Color.lightblue : Color.gray,
                            background: 'transparent',
                          },
                          fonts: {
                            regular: {
                              fontFamily: fontFamily.ProximaR,
                            },
                          },
                        }}
                        underlineColor={EndTime ? Color.lightblue : Color.gray}
                        label="End Time*"
                        style={styles.paperinput}
                        selectionColor={Color.lightblue}
                        editable={false}
                        value={EndTime}
                        activeUnderlineColor={Color.lightblue}
                      />
                    </View>
                  </Pressable>
                  <DateTimePickerModal
                    isVisible={visibleEndTime}
                    date={FinalEndTime ? FinalEndTime : new Date()}
                    is24Hour
                    locale="en_GB"
                    mode="time"
                    onConfirm={date => {
                      onConfirmstEndtime(date);
                    }}
                    onCancel={onDismissEndTime}
                  />
                </View>
              </>
            </>
            <Pressable
              onPress={() => {
                setDepartureLocationModal(true);
              }}
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
                  label="Location*"
                  value={address?.address1 ?? ''}
                  onChangeText={address => setaddress(address)}
                  placeholder="Enter Location"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  right={
                    <TextInput.Icon
                      icon="map-marker"
                      size={20}
                      color={Color.lightblue}
                    />
                  }
                />
                <Text style={styles.inputsmalltext}>
                  Add a physical location for people to join your event
                </Text>
              </View>
            </Pressable>

            {isPublish !== 'isPublish' ? (
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
                      placeholder="Choose privacy"
                      style={styles.paperinput}
                      selectionColor={Color.lightblue}
                      activeUnderlineColor={Color.lightblue}
                      editable={false}
                      value={type}
                      right={
                        <TextInput.Icon
                          icon="account-lock"
                          size={20}
                          color={Color.lightblue}
                        />
                      }
                    />
                  </View>
                </Pressable>
              </View>
            ) : (
              <></>
            )}

            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: capacity ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={capacity ? Color.lightblue : Color.gray}
                label="Capacity*"
                keyboardType={keyboardType.numberPad}
                placeholder="Enter capacity"
                value={capacity}
                onChangeText={capacity =>
                  setcapacity(capacity.replace(/\D/, ''))
                }
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>

            <View style={styles.inputcontainer}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: description ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={description ? Color.lightblue : Color.gray}
                label="Description*"
                keyboardType={keyboardType.default}
                placeholder="Enter description"
                numberOfLines={4}
                multiline={true}
                value={description}
                onChangeText={description => setdescription(description)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>

            <View style={styles.addenddatetime}>
              <MaterialCommunityIcons
                name="image-area"
                size={18}
                color={Color.lightblue}
              />
              <Text style={styles.addtimetext}>Cover Photo</Text>
            </View>

            <View style={[styles.inputcontainer]}>
              <View style={styles.imgcontainer}>
                <Pressable
                  style={styles.imgaddbtn}
                  onPress={() => {
                    setImagePickerModal(true);
                  }}
                >
                  {imageData ? (
                    <FastImage
                      source={{
                        uri: imageData,
                        cache: FastImage.cacheControl.immutable,
                      }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <FastImage
                      style={styles.addicon}
                      source={require('../assets/images/icon/AddImage.png')}
                    />
                  )}
                </Pressable>
              </View>
            </View>

            <TouchableOpacity style={styles.addenddatetime}>
              <Ionicons name="settings" size={18} color={Color.lightblue} />
              <Text style={styles.addtimetext}>Event Setting</Text>
            </TouchableOpacity>

            <View
              style={[styles.inputcontainer, styles.labelswitch, styles.mt2]}
            >
              <Text style={styles.subtitle}>Show guest list</Text>
              <Switch
                trackColor={{ true: Color.switch }}
                thumbColor={isSwitchOnGest ? Color.lightblue : Color.white}
                value={isSwitchOnGest}
                onValueChange={onToggleSwitchGest}
              />
            </View>

            <View
              style={[styles.inputcontainer, styles.labelswitch, styles.mt2]}
            >
              <Text style={styles.subtitle}>
                Only Admin can comment in the event
              </Text>
              <Switch
                trackColor={{ true: Color.switch }}
                thumbColor={isSwitchOn ? Color.lightblue : Color.white}
                value={isSwitchOn}
                onValueChange={onToggleSwitch}
              />
            </View>

            {EventDetails !== null &&
            EventDetails !== undefined &&
            EventDetails !== '' ? (
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  title={'Update'}
                  onPress={UpdateCreateEvent}
                  isProcessing={isbtnLoader}
                  disabled={!currentNetworkStatus}
                />
              </View>
            ) : (
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  title={'Create'}
                  onPress={submitCreateEvent}
                  isProcessing={isbtnLoader}
                  disabled={!currentNetworkStatus}
                />
              </View>
            )}
          </ScrollView>

          {/* Recurring Type Modal */}
          <Modal
            isVisible={isModalrecurring}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
          >
            <View style={styles.modalcontainer}>
              <View style={[styles.modalsubcontainer]}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text style={styles.formtitle}>Choose Recurring Type</Text>
                  <Pressable style={styles.close} onPress={togglericurring}>
                    <Ionicons
                      name="close-circle"
                      size={26}
                      color={Color.black}
                    />
                  </Pressable>
                </View>
                <View style={styles.modalflatlist}>
                  <FlatList
                    data={recurringTypeListTemp}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={styles.listitem}
                        onPress={e => onricurringSelected(item)}
                      >
                        <Text style={styles.listitemtext}> {item?.name}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => `recurring-${index}`}
                  />
                </View>
              </View>
            </View>
          </Modal>

          {/* Start When Modal */}
          <Modal
            isVisible={isModalstartwhen}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
          >
            <View style={styles.modalcontainer}>
              <View style={[styles.modalsubcontainer]}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text style={styles.formtitle}>Choose Start When</Text>
                  <Pressable
                    style={styles.close}
                    onPress={() => {
                      SaveSelectedDays();
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={26}
                      color={Color.black}
                    />
                  </Pressable>
                </View>
                <View style={styles.modalflatlist}>
                  <FlatList
                    data={startwhenList}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={styles.listitem}
                        onPress={() => onisstartwhenSelected(item, index)}
                      >
                        <Text style={styles.listitemtext}> {item?.name}</Text>
                        {item?.id == 1 ? (
                          <Ionicons
                            name="checkmark-done-sharp"
                            size={18}
                            color={Color.lightblue}
                          />
                        ) : (
                          <></>
                        )}
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => `startwhen-${index}`}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            isVisible={isModalTripType}
            deviceWidth={deviceWidth}
            deviceHeight={deviceHeight}
          >
            <View style={styles.modalcontainer}>
              <View style={styles.modalsubcontainer}>
                <View style={[styles.mx2, styles.modalheader]}>
                  <Text style={styles.formtitle}>Choose privacy</Text>
                  <Pressable style={styles.close} onPress={toggleTripType}>
                    <Ionicons
                      name="close-circle"
                      size={18}
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

          {/* Other modals remain the same... */}
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: () => {},
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

      <SearchPlaceModal
        visible={departureLocationModal}
        onClose={() => {
          setDepartureLocationModal(false);
        }}
        onSubmit={data => {
          setaddress(data);
        }}
      />

      <ImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={async photo => {
          setImagePickerModal(false);
          setimageData(photo.uri);
          setUplodedimageData(photo);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listItemLabelStyle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  dropDownContainerStyle: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#DEE1E6',
    borderRadius: 7,
    marginTop: 10,
    backgroundColor: Color.white,
    ...Shadow.boxShadow,
  },
  pickercontainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Color.cardgray,
    borderRadius: 7,
    marginTop: 5,
    paddingVertical: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Color.white,
    ...Shadow.boxShadow,
  },
  textStyle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  inputsmalltext: {
    color: Color.gray,
    fontSize: getFontSize(10),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  gallerybox: {
    height: dynamicSize(130),
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: dynamicSize(10),
  },
  gallery: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  addicon: {
    height: dynamicSize(30),
    width: dynamicSize(30),
  },
  imgaddbtn: {
    borderWidth: 1,
    borderColor: Color.lightblue,
    borderStyle: 'dashed',
    height: dynamicSize(140),
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: dynamicSize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgcontainer: {
    marginTop: dynamicSize(10),
    marginBottom: dynamicSize(10),
  },
  addtimetext: {
    color: Color.lightblue,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
    marginLeft: 5,
  },
  addenddatetime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dynamicSize(15),
    marginTop: dynamicSize(15),
  },
  suggestrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomColor: Color.lightGray,
    paddingVertical: dynamicSize(10),
    borderBottomWidth: 1,
  },
  suggestimgcontainer: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: dynamicSize(10),
  },
  suggestimg: {
    height: dynamicSize(40),
    borderRadius: 100,
    width: dynamicSize(40),
  },
  suggestcontainer: {
    marginVertical: dynamicSize(10),
    maxHeight: dynamicSize(300),
    marginHorizontal: dynamicSize(10),
    paddingVertical: dynamicSize(15),
    paddingHorizontal: dynamicSize(10),
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
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  friendname: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
    color: 'black',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  friendimgcontainer: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: dynamicSize(10),
  },
  friendimg: {
    height: dynamicSize(50),
    borderRadius: 100,
    width: dynamicSize(50),
  },
  addimgiconcontainer: {
    width: dynamicSize(35),
    height: dynamicSize(35),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    bottom: -0,
    backgroundColor: Color.lightblue,
  },
  addimgicon: {
    width: dynamicSize(20),
    height: dynamicSize(20),
  },
  profileContainer: {
    height: dynamicSize(110),
    width: dynamicSize(110),
    justifyContent: 'center',
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.cardgray,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  profileImage: {
    height: dynamicSize(100),
    width: dynamicSize(100),
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  buttoncontainer: {
    width: '80%',
    paddingHorizontal: dynamicSize(10),
    alignSelf: 'center',
    marginVertical: dynamicSize(20),
  },
  labelswitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
    width: '85%',
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: dynamicSize(10),
    marginTop: dynamicSize(10),

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
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  close: {
    position: 'absolute',
    right: -5,
    top: 2,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalheader: {},
  mx2: {
    marginHorizontal: dynamicSize(10),
  },
  mt2: {
    marginTop: dynamicSize(10),
  },
  modalflatlist: {
    backgroundColor: Color.white,
    borderRadius: 8,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    borderRadius: 8,
    maxHeight: 200,

    paddingBottom: dynamicSize(10),
  },
  listitemtext: {
    fontSize: getFontSize(16),
    color: Color.black0,
    fontFamily: fontFamily.ProximaR,
  },
  listitem: {
    paddingVertical: dynamicSize(15),
    paddingLeft: dynamicSize(10),
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 15,
  },
  modalcontainer: {
    justifyContent: 'center',
  },
  title: {
    fontSize: dynamicSize(16),
    color: Color.themeColor,
    lineHeight: dynamicSize(23),
    fontFamily: fontFamily.ProximaBold,
  },
  formtitle: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaBold,
    marginTop: dynamicSize(10),
    width: '95%',
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(14),
    minHeight: dynamicSize(62),
  },
  textbtnstyle: {
    fontSize: getFontSize(13),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  input: {
    fontFamily: fontFamily.ProximaR,
  },
  inputcontainer: {
    paddingHorizontal: dynamicSize(15),
  },
  tabbartab1: {
    flex: 1,
    paddingVertical: dynamicSize(10),
    paddingHorizontal: dynamicSize(10),
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: dynamicSize(10),
    flex: 1,
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
});

export default CreateEvent;

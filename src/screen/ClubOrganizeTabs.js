//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

import moment from 'moment';
import Modal from 'react-native-modal';
import { Switch, TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import InputText from '../components/InputText';
import WavesInfoItem from '../components/Item';
import Radiobtn from '../components/Radiobtn';
import {
  board,
  Color,
  fontFamily,
  Grid,
  keyboardType,
  skill,
  triptype,
} from '../constants/Constants';
// import Animated, {
//     Layout,
//     LightSpeedOutLeft,
//     LightSpeedOutRight
// } from 'react-native-reanimated';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { ButtonRound } from '../components/Buttons';
import SearchPlaceModal from '../components/SearchPlaceModal';
import SuccessModal from '../components/SuccessModal';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { openMap } from '../constants/Utility';
import ClubsAPi from '../api/ClubApi';
import {
  getCurrentTrip,
  getForecase,
  getNearBySpots,
  setCurrentRegion,
  setCurrentRegionForForecast,
  setCurrentSpotIdForForecast,
} from '../store/tripSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

export const ClubInfotab = props => {
  const spotConfigration = useSelector(state => state.trip?.spotConfigration);
  const route = useRoute();
  const [clubid, setClubId] = useState(route?.params?.clubid);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const [showLoading, setShowLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);
  const [isbtnLoader, setIsbtnLoader] = useState(false);
  const [type, settype] = useState(
    `${route?.params?.item?.surfType ?? ''}` ?? null,
  );
  const [skillLevel, setskillLevel] = useState(
    `${route?.params?.item?.skillLevel ?? ''}` ?? null,
  );
  const [boardsize, setboardsize] = useState(
    `${route?.params?.item?.boardSize ?? ''}` ?? null,
  );
  const [Title, setTitle] = useState(route?.params?.item?.title ?? '');
  const [Seats, setSeats] = useState(
    `${route?.params?.item?.maxOccupancy ?? ''}` ?? '',
  );
  const [Caption, setCaption] = useState(
    `${route?.params?.item?.description ?? ''}` ?? '',
  );
  const [isModalTripType, setisModalTripType] = useState();
  const [isModalskillLevel, setisModalskillLevel] = useState();
  const [isModalboardsize, setisModalboardsize] = useState();
  const [isPublic, setIsPublic] = useState(
    route?.params?.item?.isPublic ?? true,
  );
  const [lookingForDriver, setLookingForDriver] = useState(
    route?.params?.item?.lookingForDriver ?? false,
  );
  const [isAdaptive, setIsAdaptive] = useState(
    route?.params?.item?.isAdaptive ?? false,
  );
  const [accommodationAvailable, setAccommodationAvailable] = useState(
    route?.params?.item?.accommodationAvailable ?? false,
  );
  const [success, setSuccess] = useState(false);
  const [departureLocationModal, setDepartureLocationModal] = useState(false);
  const [deparLocation, setDeparLocation] = useState(
    route?.params?.item?.departureAddress ?? null,
  );
  const [destinationLocationModal, setDestinationLocationModal] =
    useState(false);
  const [destinationLocation, setDestinationLocation] = useState(
    route?.params?.item?.destinationLocationAddress ?? null,
  );
  const [accLocation, setAccLocation] = useState(
    route?.params?.item?.accommodationAddress ?? null,
  );
  const [accLocationModal, setAccLocationModal] = useState(false);
  const NeatbySpotLocation = useRef([]);

  const withoutpropslist = [
    {
      key: '11',
      text: 'I am driver and looking for passengers',
    },
    {
      key: '22',
      text: 'I am passengers and looking for a driver',
    },
  ];
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  useEffect(() => {
    if (
      route?.params?.coordinate !== undefined &&
      route?.params?.coordinate !== null &&
      route?.params?.coordinate !== ''
    ) {
      // placeDetails(route?.params?.coordinate?.latitude, route?.params?.coordinate?.longitude)
      let address = NeatbySpotLocation.current?.find(
        x =>
          x.locationLat === route?.params?.coordinate?.latitude &&
          x.locationLng === route?.params?.coordinate?.longitude,
      );
      if (address) {
        const finalAddress = {
          address1: address?.formattedAddress,
          address2: null,
          city: null,
          country: null,
          destinationLocationLat: address?.locationLat,
          destinationLocationLng: address?.locationLng,
          locationLat: address?.locationLat,
          locationLng: address?.locationLng,
          placeId: address?.placeId,
          state: null,
          zipCode: null,
        };
        setDestinationLocation(finalAddress);
      }
    }
  }, [route?.params]);

  const placeDetails = async (lat, Lang) => {
    const place = await getPlaceByLatandLang(lat, Lang, GoogleApiKey);
    let PlaceDetails = JSON.parse(JSON.stringify(place.data));
    let PlaceId = '';
    let CountryName = '';
    let City = '';
    let State = '';
    let ZipCode = '';
    let Address1 = '';
    let Location = '';
    // place id Find
    if (PlaceDetails?.results?.length > 0) {
      if (PlaceDetails?.results[0]?.place_id) {
        PlaceId = PlaceDetails?.results[0]?.place_id;
      }
      // country Find
      const country = PlaceDetails?.results?.find(
        x => x?.types[0] == 'country',
      );
      if (country) {
        CountryName = country?.address_components[0]?.long_name;
      }
      // city Find
      const city = PlaceDetails?.results?.find(x => x?.types[0] == 'locality');
      if (city) {
        City = city?.address_components[0]?.long_name;
      }
      // State Find
      const state = PlaceDetails?.results?.find(
        x => x?.types[0] == 'administrative_area_level_1',
      );
      if (state) {
        State = state?.address_components[0]?.long_name;
      }
      // ZipCode Find
      const zipCode = PlaceDetails?.results?.find(
        x => x?.types[0] == 'postal_code',
      );
      if (zipCode) {
        ZipCode = zipCode?.address_components[0]?.long_name;
      }
      // Address1 Find
      const address1 = PlaceDetails?.results[0]?.formatted_address;
      if (address1) {
        Address1 = address1;
      }
    }
    const finalAddress = {
      address1: Address1,
      address2: null,
      city: City,
      country: CountryName,
      destinationLocationLat: lat,
      destinationLocationLng: Lang,
      locationLat: lat,
      locationLng: Lang,
      placeId: PlaceId,
      state: State,
      zipCode: ZipCode,
    };
    setDestinationLocation(finalAddress);
  };

  useEffect(() => {
    if (route?.params?.item?.destination?.regionId) {
      getCurrentSpot();
    }
  }, [route?.params]);

  useEffect(() => {
    if (route?.params?.item?.destination?.id) {
      getNearbyLocationOnSpot(route?.params?.item?.destination?.id);
    } else if (currentRegion?.spot?.id) {
      getNearbyLocationOnSpot(currentRegion?.spot?.id);
    }
  }, [route]);

  const getNearbyLocationOnSpot = async ID => {
    const data = JSON.parse(await Trip.getNeatbySpotLocation(ID));
    if (data?.length > 0) {
      NeatbySpotLocation.current = data;
    }
  };

  const getCurrentSpot = async () => {
    setShowLoading(true);
    try {
      const params = {
        regionId: route?.params?.item?.destination?.regionId,
      };
      const data = JSON.parse(await Trip.getSpot(params));
      dispatch(setCurrentRegionForForecast({ spot: data }));
      dispatch(setCurrentRegion({ spot: data }));
      dispatch(setCurrentSpotIdForForecast(data?.id));
      dispatch(getForecase(data?.id));
    } catch (error) {}
    setShowLoading(false);
  };

  const [startDate, setStartDate] = useState(
    route?.params?.item?.startDate
      ? new Date(route?.params?.item?.startDate ?? new Date()).toString()
      : '',
  );

  const [endDate, setEndDate] = useState(
    route?.params?.item?.endDate
      ? new Date(route?.params?.item?.endDate + '+00:00').toString()
      : null,
  );

  const onToggleSwitch = () => {
    setAccommodationAvailable(!accommodationAvailable);
  };

  const toggleTripType = () => {
    setisModalTripType(!isModalTripType);
  };

  const onTripTypeSelected = value => {
    settype(value);
    toggleTripType();
  };

  const toggleskillLevel = () => {
    setisModalskillLevel(!isModalskillLevel);
  };

  const onskillLevelSelected = value => {
    setskillLevel(value);
    toggleskillLevel();
  };

  const toggleboardsize = () => {
    setisModalboardsize(!isModalboardsize);
  };

  const onsboardsizeSelected = value => {
    setboardsize(value);
    toggleboardsize();
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onCancel = () => {
    setShowDatePicker(false);
  };

  const GotoOrganizetrip = () => {
    navigation.navigate('ClubProfile', { clubid });
    // navigation.navigate('Organizetrip');
  };

  const createTrip = async () => {
    if (startDate === null || startDate === undefined || startDate === '') {
      alert('Enter startDate');
      return false;
    }
    if (
      deparLocation === null ||
      deparLocation === undefined ||
      deparLocation === ''
    ) {
      alert('Enter departure location');
      return false;
    }
    if (
      destinationLocation === null ||
      destinationLocation === undefined ||
      destinationLocation === ''
    ) {
      alert('Enter destination location');
      return false;
    }
    if (Title === null || Title === undefined || Title === '') {
      alert('Enter title');
      return false;
    }
    if (type === null || type === undefined || type === '') {
      alert('Select trip type');
      return false;
    }
    if (skillLevel === null || skillLevel === undefined || skillLevel === '') {
      alert('Select skill level');
      return false;
    }
    if (boardsize === null || boardsize === undefined || boardsize === '') {
      alert('Select board size');
      return false;
    }
    if (accommodationAvailable) {
      if (!accLocation) {
        alert('Enter Accommodation Address');
        return;
      }
    }
    if (Seats === null || Seats === undefined || Seats === '') {
      alert('Enter seats');
      return false;
    }
    if (isNaN(Number(Seats))) {
      alert('Invalid number of seats');
      return;
    }
    if (Caption === null || Caption === undefined || Caption === '') {
      alert('Enter caption');
      return false;
    }
    setIsbtnLoader(true);
    setShowLoading(true);
    let departureAddressId = null;
    let accommodationAddressId = null;
    let destinationLocationAddressId = null;
    try {
      if (deparLocation) {
        if (deparLocation?.id) {
          departureAddressId = deparLocation;
        } else {
          departureAddressId = await Trip.createAddress(deparLocation);
        }
      }
    } catch (error) {}
    try {
      if (destinationLocation) {
        if (destinationLocation?.id) {
          destinationLocationAddressId = destinationLocation;
        } else {
          destinationLocationAddressId = await Trip.createAddress(
            destinationLocation,
          );
        }
      }
    } catch (error) {}
    try {
      if (accLocation) {
        if (accLocation?.id) {
          accommodationAddressId = accLocation;
        } else {
          accommodationAddressId = await Trip.createAddress(accLocation);
        }
      }
    } catch (error) {}

    const params = {
      title: Title,
      clubId: clubid,
      id: route?.params?.item?.id ?? 0,
      destinationId: currentRegion?.spot?.id,
      destinationPlaceId: currentRegion?.spot?.id,
      departureAddressId: departureAddressId?.id ?? null, //
      destinationLocationAddressId: destinationLocationAddressId?.id ?? null,
      startDate: new Date(startDate),
      endDate: endDate !== null ? new Date(endDate) : null,
      surfType: type,
      durationType: 1, //
      skillLevel: skillLevel,
      description: Caption,
      lookingForDriver: lookingForDriver,
      boardSize: boardsize,
      accommodationAvailable: accommodationAvailable,
      accommodationAddressId: accommodationAddressId?.id ?? null, //
      vehicleType: null, //
      transportType: null, //
      minOccupancy: null, //
      maxOccupancy: Seats, //
      isInviteOnly: null, //
      isPublic: isPublic,
      allowMemberInviteFriends: null, //
      specialConsideration: null, //
      chances: null, //
      isAdaptive: isAdaptive,
    };
    try {
      const data = await ClubsAPi.createClubTrip(params, clubid);
      setIsbtnLoader(false);
      setShowLoading(false);
      setTimeout(
        () => {
          setSuccess(true);
        },
        Platform.OS === 'ios' ? 300 : 0,
      );
    } catch (error) {
      setIsbtnLoader(false);
      setShowLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
    >
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      <View style={styles.tabbartab1}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          enableOnAndroid={true} // 👈 ye add karo
          keyboardOpeningTime={0}
          contentContainerStyle={{
            paddingBottom: dynamicSize(25),
          }}
        >
          {/* {!currentNetworkStatus && (
          <View style={{ marginBottom: -15, marginTop: 5 }}>
            <ConnectionBanner isOnline={currentNetworkStatus} />
          </View>
        )} */}
          <View style={styles.inputcontainer}>
            <InputText
              onPress={() => {
                if (route?.params?.item) {
                  // navigation.navigate('Organizetrip', { isEdit: true });
                } else {
                  navigation.goBack();
                }
              }}
              isEdit={false}
              placeholder="Spot"
              value={
                route?.params?.item?.destination?.title ??
                currentRegion?.spot?.title ??
                ''
              }
            />
            <Pressable
              onPress={() => {
                if (currentRegion?.spot?.address) {
                  openMap(
                    currentRegion?.spot?.address.destinationLocationLat,
                    currentRegion?.spot?.address.destinationLocationLng,
                    currentRegion?.spot?.title,
                  );
                }
                if (route?.params?.item?.destination?.address?.location) {
                  openMap(
                    route?.params?.item?.destination?.address?.location
                      ?.latitude,
                    route?.params?.item?.destination?.address?.location
                      ?.longitude,
                    route?.params?.item?.destination?.title,
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.textbtnstyle,
                  { textDecorationLine: 'underline', color: Color.lightblue },
                ]}
              >
                Show on map
              </Text>
            </Pressable>
          </View>
          <View style={styles.inputcontainer}>
            <Pressable onPress={openDatePicker}>
              <View pointerEvents="none">
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: startDate ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={startDate ? Color.lightblue : Color.gray}
                  label="Start Date*"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  // onFocus={openDatePicker}
                  editable={false}
                  value={
                    startDate
                      ? moment(startDate).format('DD-MM-YYYY HH:mm') ?? ''
                      : ''
                  }
                  activeUnderlineColor={Color.lightblue}
                />
              </View>
            </Pressable>

            <DateTimePickerModal
              date={startDate ? new Date(startDate) : new Date()}
              isVisible={showDatePicker}
              is24Hour
              locale="en_GB"
              mode="datetime"
              minimumDate={new Date()}
              onConfirm={date => {
                setStartDate(date.toString());
                setShowDatePicker(false);
              }}
              onCancel={onCancel}
            />
          </View>
          <View style={styles.inputcontainer}>
            <Pressable
              onPress={() => {
                setShowDatePickerEnd(true);
              }}
            >
              <View pointerEvents="none">
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: endDate ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={endDate ? Color.lightblue : Color.gray}
                  label="End Date (Optional)"
                  placeholder="Enter End Date"
                  style={styles.paperinput}
                  value={
                    endDate == null
                      ? ''
                      : moment(endDate).format('DD-MM-YYYY HH:mm')
                  }
                  editable={false}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                />
                <DateTimePickerModal
                  date={endDate ? new Date(endDate) : new Date()}
                  isVisible={showDatePickerEnd}
                  is24Hour
                  locale="en_GB"
                  mode="datetime"
                  minimumDate={startDate ? new Date(startDate) : new Date()}
                  onConfirm={date => {
                    setEndDate(date.toString());
                    setShowDatePickerEnd(false);
                  }}
                  onCancel={() => {
                    setShowDatePickerEnd(false);
                  }}
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
                pointerEvents="none"
                editable={false}
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: deparLocation ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={deparLocation ? Color.lightblue : Color.gray}
                label="Departure location*"
                placeholder="Departure location"
                value={deparLocation?.address1 ?? ''}
                style={[styles.paperinput, { minHeight: 80 }]}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </Pressable>
          <Pressable
            style={{ marginLeft: dynamicSize(15) }}
            onPress={() => {
              openMap(
                deparLocation?.destinationLocationLat,
                deparLocation?.destinationLocationLng,
                deparLocation?.address1,
              );
            }}
          >
            {deparLocation?.address1 ? (
              <Text
                style={[
                  styles.textbtnstyle,
                  { textDecorationLine: 'underline', color: Color.lightblue },
                ]}
              >
                Show on map
              </Text>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => {
              setDestinationLocationModal(true);
            }}
            style={styles.inputcontainer}
          >
            <View pointerEvents="none">
              <TextInput
                pointerEvents="none"
                editable={false}
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: deparLocation ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={
                  destinationLocation ? Color.lightblue : Color.gray
                }
                label="Destination location*"
                placeholder="Destination location"
                value={destinationLocation?.address1 ?? ''}
                style={[styles.paperinput, { minHeight: 80 }]}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </Pressable>
          {NeatbySpotLocation.current ? (
            <Pressable
              style={{ marginLeft: dynamicSize(15) }}
              onPress={() => {
                if (route?.params?.item?.destination?.address?.location) {
                  navigation.navigate('Map', {
                    Lat: route?.params?.item?.destination?.address?.location
                      ?.latitude,
                    Lang: route?.params?.item?.destination?.address?.location
                      ?.longitude,
                    latLongArray: NeatbySpotLocation?.current,
                    item: route?.params?.item,
                  });
                } else if (currentRegion?.spot?.address) {
                  navigation.navigate('Map', {
                    Lat: currentRegion?.spot?.address.destinationLocationLat,
                    Lang: currentRegion?.spot?.address.destinationLocationLng,
                    latLongArray: NeatbySpotLocation?.current,
                    item: route?.params?.item,
                  });
                }
              }}
            >
              <Text
                style={[
                  styles.textbtnstyle,
                  { textDecorationLine: 'underline', color: Color.lightblue },
                ]}
              >
                Nearby on map
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.inputcontainer}>
            <Text style={styles.formtitle}>Driver / Passengers</Text>
            <View style={styles.mt2}>
              <Radiobtn
                isSelected={lookingForDriver ? '22' : '11'}
                PROP={withoutpropslist}
                setValue={data => {
                  if (data == '22') {
                    setLookingForDriver(true);
                  } else {
                    setLookingForDriver(false);
                  }
                }}
              />
            </View>
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
              label="Title*"
              value={Title}
              onChangeText={Title => setTitle(Title)}
              placeholder="Enter Title"
              style={styles.paperinput}
              selectionColor={Color.lightblue}
              activeUnderlineColor={Color.lightblue}
            />
          </View>
          <View style={styles.inputcontainer}>
            <Pressable onPress={toggleTripType}>
              <View pointerEvents="none">
                <TextInput
                  label="Trip Type*"
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
                  placeholder="Trip Type"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  editable={false}
                  value={triptype[type]}
                />
              </View>
            </Pressable>
          </View>
          <View style={styles.inputcontainer}>
            <Pressable onPress={toggleskillLevel}>
              <View pointerEvents="none">
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: skillLevel ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={skillLevel ? Color.lightblue : Color.gray}
                  label="Skill Level*"
                  placeholder="Skill Level"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  editable={false}
                  value={skill[skillLevel]}
                />
              </View>
            </Pressable>
          </View>
          <View style={styles.inputcontainer}>
            <Pressable onPress={toggleboardsize}>
              <View pointerEvents="none">
                <TextInput
                  theme={{
                    colors: {
                      text: Color.black0,
                      placeholder: boardsize ? Color.lightblue : Color.gray,
                      background: 'transparent',
                    },
                    fonts: {
                      regular: {
                        fontFamily: fontFamily.ProximaR,
                      },
                    },
                  }}
                  underlineColor={boardsize ? Color.lightblue : Color.gray}
                  label="Board Size*"
                  placeholder="Board Size"
                  style={styles.paperinput}
                  selectionColor={Color.lightblue}
                  activeUnderlineColor={Color.lightblue}
                  editable={false}
                  value={board[boardsize]}
                />
              </View>
            </Pressable>
          </View>
          <View style={[styles.inputcontainer, styles.mt2]}>
            <Text style={styles.subtitle}>Trip Type</Text>
            <View style={styles.btnGroup}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  isPublic ? { backgroundColor: Color.lightblue } : null,
                ]}
                onPress={() => setIsPublic(true)}
              >
                <Text
                  style={[styles.btnText, isPublic ? { color: 'white' } : null]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  !isPublic ? { backgroundColor: Color.lightblue } : null,
                ]}
                onPress={() => setIsPublic(false)}
              >
                <Text
                  style={[
                    styles.btnText,
                    !isPublic ? { color: 'white' } : null,
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.inputcontainer, styles.labelswitch, styles.mt2]}>
            <Text style={styles.subtitle}>Accomodation</Text>
            <Switch
              // onTintColor={Color.lightblue}
              trackColor={{ true: Color.switch }}
              thumbColor={
                accommodationAvailable ? Color.lightblue : Color.white
              }
              // style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
              value={accommodationAvailable}
              onValueChange={onToggleSwitch}
            />
          </View>
          <Pressable
            disabled={!accommodationAvailable}
            onPress={() => {
              setAccLocationModal(true);
            }}
            style={styles.inputcontainer}
          >
            <View pointerEvents="none">
              <TextInput
                pointerEvents="none"
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: accLocation ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={accLocation ? Color.lightblue : Color.gray}
                label={`Accomodation Address${
                  accommodationAvailable ? '*' : ''
                }`}
                placeholder={`Accomodation location${
                  accommodationAvailable ? '*' : ''
                }`}
                value={accLocation?.address1}
                // onChangeText={Accomodation => setAccomodation(Accomodation)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeUnderlineColor={Color.lightblue}
              />
            </View>
          </Pressable>
          {accLocation?.location ? (
            <Pressable
              style={{ marginLeft: dynamicSize(15) }}
              onPress={() => {
                openMap(
                  accLocation?.location?.latitude,
                  accLocation?.location?.longitude,
                  accLocation?.address1,
                );
              }}
            >
              <Text
                style={[
                  styles.textbtnstyle,
                  { textDecorationLine: 'underline', color: Color.lightblue },
                ]}
              >
                Show on map
              </Text>
            </Pressable>
          ) : null}
          <View style={styles.inputcontainer}>
            <TextInput
              theme={{
                colors: {
                  text: Color.black0,
                  placeholder: Seats ? Color.lightblue : Color.gray,
                  background: 'transparent',
                },
                fonts: {
                  regular: {
                    fontFamily: fontFamily.ProximaR,
                  },
                },
              }}
              underlineColor={Seats ? Color.lightblue : Color.gray}
              label="Total Seats*"
              keyboardType={keyboardType.numberPad}
              placeholder="Total Seats*"
              value={Seats}
              onChangeText={Seats => setSeats(Seats)}
              style={styles.paperinput}
              selectionColor={Color.lightblue}
              activeUnderlineColor={Color.lightblue}
            />
          </View>
          <View style={[styles.inputcontainer, styles.labelswitch, styles.mt2]}>
            <Text style={styles.subtitle}>Adaptive?</Text>
            <Switch
              // onTintColor={Color.lightblue}
              trackColor={{ true: Color.switch }}
              thumbColor={isAdaptive ? Color.lightblue : Color.white}
              value={isAdaptive}
              onValueChange={() => {
                setIsAdaptive(v => !v);
              }}
            />
          </View>
          <View style={styles.inputcontainer}>
            <Text style={styles.formtitle}>Trip Caption*</Text>
            <View style={styles.mt2}>
              <TextInput
                theme={{
                  colors: {
                    text: Color.black0,
                    placeholder: Caption ? Color.lightblue : Color.gray,
                    background: 'transparent',
                  },
                  fonts: {
                    regular: {
                      fontFamily: fontFamily.ProximaR,
                    },
                  },
                }}
                underlineColor={Caption ? Color.lightblue : Color.gray}
                mode="outlined"
                label="Trip Caption*"
                numberOfLines={5}
                keyboardType={keyboardType.default}
                multiline={true}
                placeholder="Trip Caption"
                value={Caption}
                onChangeText={Caption => setCaption(Caption)}
                style={styles.paperinput}
                selectionColor={Color.lightblue}
                activeOutlineColor={Color.lightblue}
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {route?.params?.item?.id ? (
              <View style={styles.buttoncontainer}>
                <ButtonRound
                  title={'Cancel'}
                  onPress={() => {
                    Alert.alert(
                      'Alert',
                      'Are you sure you want to cancel this trip?',
                      [
                        {
                          text: 'No',
                        },
                        {
                          text: 'Yes',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              setShowLoading(true);
                              const data = await Trip.cancelTrip(
                                route?.params?.item?.id,
                              );
                              dispatch(
                                getCurrentTrip(
                                  route?.params?.item?.id,
                                  status => {
                                    alert('Trip successfully canceled');
                                    setShowLoading(false);
                                    // navigation.navigate('Mytrip');
                                    navigation.navigate('ClubProfile', {
                                      clubid,
                                      Selection: 1,
                                    });
                                  },
                                ),
                              );
                            } catch (error) {
                              setShowLoading(false);
                              if (
                                error
                                  ?.toString()
                                  ?.toLocaleLowerCase()
                                  ?.trim() != 'network error'
                              ) {
                                alert(error?.toString());
                              }
                            }
                          },
                        },
                      ],
                    );
                  }}
                />
              </View>
            ) : (
              <View />
            )}
            <View style={[styles.buttoncontainer]}>
              <ButtonRound
                isProcessing={isbtnLoader}
                // backgroundColor={Color.lightblue}
                title={route?.params?.item?.id ? 'Update' : 'Create'}
                onPress={createTrip}
                disabled={!currentNetworkStatus}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
        <SuccessModal
          visible={success}
          description={
            route?.params?.item
              ? 'Your trip has been updated successfully'
              : 'Your trip has been added'
          }
          onClose={() => {
            setSuccess(false);
            GotoOrganizetrip();
          }}
        />
        <SearchPlaceModal
          visible={departureLocationModal}
          onClose={() => {
            setDepartureLocationModal(false);
          }}
          onSubmit={data => {
            setDeparLocation(data);
          }}
        />
        <SearchPlaceModal
          visible={accLocationModal}
          onClose={() => {
            setAccLocationModal(false);
          }}
          onSubmit={data => {
            setAccLocation(data);
          }}
        />
        <SearchPlaceModal
          visible={destinationLocationModal}
          onClose={() => {
            setDestinationLocationModal(false);
          }}
          onSubmit={data => {
            setDestinationLocation(data);
          }}
        />

        <Loader visible={showLoading} />
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
                  <Ionicons name="close-circle" size={26} color={Color.black} />
                </Pressable>
              </View>
              <View style={styles.modalflatlist}>
                <FlatList
                  data={triptype}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.listitem}
                      onPress={() => onTripTypeSelected(index)}
                    >
                      <Text style={styles.listitemtext}> {item || ''}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          isVisible={isModalskillLevel}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}
        >
          <View style={styles.modalcontainer}>
            <View style={styles.modalsubcontainer}>
              <View style={styles.mx2}>
                <Text style={styles.formtitle}>Skill Level</Text>
                <Pressable style={styles.close} onPress={toggleskillLevel}>
                  <Ionicons name="close-circle" size={26} color={Color.black} />
                </Pressable>
              </View>
              <View style={styles.modalflatlist}>
                <FlatList
                  data={skill}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.listitem}
                      onPress={() => onskillLevelSelected(index)}
                    >
                      <Text style={styles.listitemtext}> {item || ''}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          isVisible={isModalboardsize}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}
        >
          <View style={styles.modalcontainer}>
            <View style={styles.modalsubcontainer}>
              <View style={styles.mx2}>
                <Text style={styles.formtitle}>Board Size</Text>
                <Pressable style={styles.close} onPress={toggleboardsize}>
                  <Ionicons name="close-circle" size={26} color={Color.black} />
                </Pressable>
              </View>
              <View style={styles.modalflatlist}>
                <FlatList
                  data={board}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.listitem}
                      onPress={() => onsboardsizeSelected(index)}
                    >
                      <Text style={styles.listitemtext}> {item || ''}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

// define your styles
const styles = StyleSheet.create({
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
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
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
    paddingVertical: dynamicSize(10),
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(20),
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
    minHeight: 300,
    borderRadius: 8,
    paddingBottom: 10,
  },
  listitemtext: {
    fontSize: getFontSize(16),
    color: Color.black0,
    fontFamily: fontFamily.ProximaR,
  },
  listitem: {
    paddingVertical: dynamicSize(15),
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  modalcontainer: {
    // alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  formtitle: {
    fontSize: getFontSize(15),
    color: Color.themeColor,
    lineHeight: getFontSize(23),
    fontFamily: fontFamily.ProximaAB,
    marginTop: dynamicSize(10),
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: getFontSize(14),
    height: dynamicSize(62),
  },
  textbtnstyle: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  input: {
    fontFamily: fontFamily.ProximaR,
  },
  inputcontainer: {
    paddingHorizontal: 15,
  },
  tabbartab1: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  tabcontainer: {
    marginHorizontal: '2%',
    marginTop: 10,
    flex: 1,
  },
});

//make this component available to the app
export const ClubForecast = ({
  data,
  forecastData,
  newIdForForecast,
  Map = null,
}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const nearBySpots = useSelector(state => state.trip.nearBySpots);
  spotConfigration = useSelector(state => state.trip?.spotConfigration);
  // getNearBySpots
  const currentRegion = useSelector(state => state.trip.currentRegion);
  const currentSpot = data ?? currentRegion?.spot ?? {};
  const tideExtremesByday =
    useSelector(state => state.trip.tideExtremesByday)[
      newIdForForecast ?? currentSpot?.id
    ] ?? [];
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);
  const GotoDetail = data => {
    dispatch(setCurrentRegionForForecast(data));
    dispatch(setCurrentSpotIdForForecast(currentSpot?.id));
    dispatch(setCurrentRegion({ spot: currentSpot }));
    navigation.navigate('WeatherDetail', { newIdForForecast });
  };

  useEffect(() => {
    if (!nearBySpots[currentSpot?.id]) {
      const location = currentSpot?.address;
      dispatch(
        getNearBySpots(
          location?.locationLat,
          location?.locationLng,
          currentSpot?.id,
        ),
      );
    }
  }, []);
  const nearSpots = nearBySpots[currentSpot?.id] ?? [];

  return (
    <View style={{ flex: 1 }}>
      {!currentNetworkStatus && (
        <View style={{ marginBottom: -15, marginTop: 5 }}>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: getBottomSpace() }}
      >
        <View style={tab2styles.botttomborder}>
          <Text style={tab2styles.title}>
            {data?.title ?? currentRegion?.spot?.title}
          </Text>
        </View>
        {Map}
        <View>
          <FlatList
            horizontal={true}
            data={forecastData ?? []}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tab2styles.flatlist}
            renderItem={({ item, index }) => (
              <WavesInfoItem
                onCardClick={() => GotoDetail(item)}
                spotConfigration={spotConfigration}
                tideExtremesByday={tideExtremesByday ?? []}
                width={250}
                marginHorizontal={5}
                item={item}
                key={index.toString()}
              />
            )}
            keyExtractor={(item, index) => index}
          />
        </View>
        <View style={tab2styles.botttomborder}>
          <Text style={tab2styles.title}>Spot Guide</Text>
        </View>
        <View style={tab2styles.detailcontainer}>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Surf Type:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {/* Wave Pool */}
                {(data?.title ?? currentRegion?.spot?.title) == 'The Wave'
                  ? 'Wave Pool'
                  : 'Surf'}
                {/* {currentSpot?.surfType
                  ? triptype[currentSpot?.surfType ?? 0]
                  : ''} */}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Experience:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.experience}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Frequency:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>{currentSpot?.frequency}</Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Quality:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.waveQuality}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Type:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>{currentSpot?.waveType}</Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Direction:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.waveDirection}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Power:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>{currentSpot?.wavePower}</Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Normal Length:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.waveNormalLength}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Wave Good day Length:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.waveGoodDayLength}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Sea Bottom:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>{currentSpot?.seaBottom}</Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Swell Size:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>{currentSpot?.swellSize}</Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Good Swell Direction:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.goodSwellDirection}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Good Wind Direction:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.goodWindDirection}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Best Tide Position:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.bestTidePosition}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Weekend Crowd:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.weekEndCrowed}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Week Crowd:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.weekCrowed}
              </Text>
            </View>
          </View>
          <View style={tab2styles.row}>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.label}>Additional Info:</Text>
            </View>
            <View style={tab2styles.box50}>
              <Text style={tab2styles.labeltaxt}>
                {currentSpot?.additionalInfo}
              </Text>
            </View>
          </View>
        </View>
        <View style={tab2styles.botttomborder}>
          <Text style={tab2styles.title}>Nearby Spots</Text>
        </View>
        <View style={tab2styles.detailcontainer}>
          {nearSpots.map((item, index) => {
            if (index == 0) {
              return null;
            }
            return (
              <View key={index?.toString()} style={tab2styles.row}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={tab2styles.label}>{item?.spot?.title}</Text>
                  <Text style={tab2styles.label}>
                    {Number(item?.distance ?? 0)?.toFixed(2) + ' mi.'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// define your styles
const tab2styles = StyleSheet.create({
  labeltaxt: {
    fontSize: getFontSize(14),
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    color: Color.lightblue,
  },
  detailcontainer: {
    paddingHorizontal: dynamicSize(10),
  },
  box50: {
    width: '50%',
  },
  row: {
    ...Grid.row,
    paddingVertical: dynamicSize(5),
  },
  title: {
    fontSize: getFontSize(18),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaAB,
  },
  label: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(21),
    color: Color.black,
    paddingHorizontal: 3,
  },
  botttomborder: {
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    marginVertical: dynamicSize(5),
    paddingVertical: dynamicSize(8),
    marginHorizontal: 10,
  },
});

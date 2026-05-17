//import liraries
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Platform,
} from 'react-native';

import { Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import { Header } from '../components/Header';
import PreviewModal from '../components/PreviewModal';
import Entypo from 'react-native-vector-icons/Entypo';
import ListModal from '../components/ListModal';
import FastImage from 'react-native-fast-image';

import {
  board,
  Color,
  driverRatingReport,
  fontFamily,
  forecastRating,
  skill,
  text,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import {
  CURRENT_WIDTH,
  dynamicSize,
  getFontSize,
} from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import Popover from 'react-native-popover-view';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getForecastForReport } from '../store/tripSlice';

const TripReport = () => {
  const navigation = useNavigation();
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };
  const route = useRoute();
  const user = useSelector(state => state.auth.user);
  const { item: reportItem } = route.params;
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectusersID, setselectusersID] = useState('');
  const [reportModal, setreportModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);

  const [reportimagePreviewModal, setreportimagePreviewModal] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportselectusersID, setreportselectusersID] = useState('');
  const isSelf = reportItem?.author.id === user?.id;
  const [successdescription, setSuccessDescription] = useState('');
  const onPressComment = () => {
    navigation.navigate('TripReportComments', {
      reportId: reportItem?.reportId,
    });
  };
  const [expenses, setExpenses] = useState(0);
  useEffect(() => {
    getExpenses();
  }, []);

  const getExpenses = async () => {
    try {
      const expenses = JSON.parse(
        await Trip.getExpencesSum(reportItem?.trip?.id),
      );
      setExpenses(expenses);
    } catch (error) {}
  };

  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(
      id => String(id) === String(reportItem?.author?.id),
    );

  const departureAddress = reportItem?.trip?.departureAddress;

  const deptAddress =
    (departureAddress?.address1 ?? '') +
    ' ' +
    // (departureAddress?.address2 ?? '') +
    // ' ' +
    (departureAddress?.city ?? '') +
    ' ' +
    (departureAddress?.state ?? '') +
    ' ' +
    (departureAddress?.country ?? '');

  // const destinationAddress = reportItem?.trip?.destination?.address;
  const destinationAddress = reportItem?.trip?.destinationLocationAddress;
  const accommodationAddress = reportItem?.trip?.accommodationAddress;
  const accAddress =
    (accommodationAddress?.address1 ?? '') +
    ' ' +
    // (accommodationAddress?.address2 ?? '') +
    // ' ' +
    (accommodationAddress?.city ?? '') +
    ' ' +
    (accommodationAddress?.state ?? '') +
    ' ' +
    (accommodationAddress?.country ?? '');
  const toAddress =
    (destinationAddress?.address1 ?? '') +
    ' ' +
    // (destinationAddress?.address2 ?? '') +
    // ' ' +
    (destinationAddress?.city ?? '') +
    ' ' +
    (destinationAddress?.state ?? '') +
    ' ' +
    (destinationAddress?.country ?? '');

  const dispatch = useDispatch();
  const [verifiedForests, setVerifiedForests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const forecastData = useSelector(state => state.trip.averageForcast_trip);
  const forecastByDay =
    useSelector(state => state.trip.forecastByDay_trip)[reportItem?.trip?.id] ??
    {};
  const [showLoading, SetshowLoading] = useState(false);
  // const trip =  useSelector(state => state.trip.currentTrip);
  const [forecastLoader, setForecastLoader] = useState(false);
  const getVerifiedForecast = async () => {
    try {
      setIsLoading(true);
      const data = JSON.parse(
        await Trip.getVerifiedForecast(reportItem?.trip?.id),
      );
      setVerifiedForests(data);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!forecastData[reportItem?.trip?.id]) {
      setForecastLoader(true);
      dispatch(
        getForecastForReport(reportItem?.trip?.id, () => {
          setForecastLoader(false);
        }),
      );
    }
    getVerifiedForecast();
  }, []);

  const menuButtonClick = () => {
    navigation.goBack();
  };
  const Gotosubtab = () => {
    // navigation.navigate('ClubsubForcastTabItem');
  };
  const organizer = reportItem?.trip?.organizer?.id;
  const passengersList =
    reportItem?.trip?.passengers?.filter(item => !item.isDriver) ?? [];
  const driverList =
    reportItem?.trip?.passengers?.filter(item => item?.isDriver) ?? [];

  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: targetType,
          RecordType: recordType,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            closePopover();
            // Alert.alert(userMessage + ' successfully');
            setSuccessDescription(userMessage + ' successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            // Alert.alert(userMessage + ' not successfully');
            setSuccessDescription(userMessage + ' not successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          }
        }
      } else {
        Alert.alert('Targetid null Trip Report Pag');
      }
    }
  };

  const blockreportImage = async () => {
    if (user !== null && user !== '') {
      if (
        selectusersID !== null &&
        selectusersID !== '' &&
        selectusersID !== undefined
      ) {
        const data = {
          SenderUserId: user.id,
          TargetId: selectusersID,
          TargetType: 'tripreportimage',
          RecordType: 'report',
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            setreportModal(false);
            // Alert.alert('Trip Report Image successfully');
            setSuccessDescription('reported successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            // Alert.alert('Trip Report Image Not successfully');
            setSuccessDescription('reported not successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          }
        }
      } else {
        Alert.alert('Targetid null Trip Report Pag');
      }
    }
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          title="Trip Report"
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={menuButtonClick}
          notification={'6'}
          // messagenotification={'6'}
          textAlign={'center'}
        />
        <Loader visible={showLoading || forecastLoader || isLoading} />
        <SuccessModal
          visible={success}
          onClose={() => {
            setSuccess(false);
            setIserror(false);
            setSuccessDescription('');
            setselectusersID('');
            setreportModal(false);
            closePopover();
          }}
          description={successdescription}
          iserror={iserror}
        />
        <ScrollView
          bounces={true}
          alwaysBounceVertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={styles.viewContainer}>
            <View style={[styles.detailcontainer, styles.mt2]}>
              <View style={styles.borderwithoutrow}>
                <Text style={styles.namesubtitle}>Author</Text>
                <Text style={styles.posttime}>
                  Posted{' '}
                  {reportItem?.createdAt
                    ? moment(reportItem?.createdAt).fromNow()
                    : ''}
                </Text>
              </View>
              <View style={styles.borderwithoutrow}>
                <View style={styles.profileimgcontainer}>
                  <Pressable
                    onPress={() => {
                      !isUserDeleted &&
                        navigation.navigate('Profile', {
                          userId: reportItem?.author?.id,
                        });
                    }}
                  >
                    <FastImage
                      source={
                        isUserDeleted
                          ? require('../assets/images/logo.png')
                          : {
                              uri: reportItem?.author?.thumbnailProfileImage,
                              cache: FastImage.cacheControl.immutable,
                            }
                      }
                      style={styles.profileimg}
                    />
                  </Pressable>
                  <View>
                    <Text style={styles.usernametext}>
                      {isUserDeleted
                        ? 'Deletion Requested'
                        : reportItem?.author?.firstName +
                          ' ' +
                          reportItem?.author?.lastName}
                    </Text>
                    {!isUserDeleted && (
                      <Text style={styles.status}>
                        {getUserInfoText(reportItem?.author)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.namesubtitle}>Title</Text>
                <Text style={styles.nametitle}>{reportItem?.title}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.namesubtitle}>Destination</Text>
                <Text style={styles.nametitle}>{toAddress}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.namesubtitle}>Spot</Text>
                <Text style={styles.nametitle}>
                  {reportItem?.trip?.destination?.title}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.namesubtitle}>Duration</Text>
                <Text style={styles.nametitle}>
                  {(reportItem?.trip?.startDate
                    ? moment(reportItem?.trip?.startDate).format('DD/MM/YYYY')
                    : '') +
                    '-' +
                    (reportItem?.trip?.endDate
                      ? moment(reportItem?.trip?.endDate).format('DD/MM/YYYY')
                      : '')}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.namesubtitle}>Rating</Text>

                <View style={styles.raitingrow}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <MaterialCommunityIcons
                      name={'star'}
                      size={dynamicSize(13)}
                      color={i < reportItem?.rating ? Color.starbg : 'grey'}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.imgcontainer}>
              <ScrollView
                horizontal
                bounces={true}
                // alwaysBounceVertical={true}
                showsHorizontalScrollIndicator={false}
              >
                {reportItem?.images.map((item, index) =>
                  reportItem?.author.id !== user.id ? (
                    <Pressable
                      ref={touchableRef}
                      // onLongPress={e => {
                      //   openPopover(e);
                      //   setselectusersID(item.id);
                      // }}
                      onPress={() => {
                        setImagePreviewModal(true);
                        setImageUrl(item?.imageUrl);
                        setselectusersID(item.id);
                      }}
                      style={styles.gallerybox}
                    >
                      <FastImage
                        source={{
                          uri: item?.thumbnailImageUrl,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.gallery}
                      />
                      <Pressable
                        style={styles.dotCont}
                        onPress={() => {
                          setreportModal(true);
                          setselectusersID(item.id);
                        }}
                      >
                        <Entypo
                          name="dots-three-vertical"
                          color={Color.black}
                          size={getFontSize(16)}
                        />
                      </Pressable>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => {
                        setreportimagePreviewModal(true);
                        setReportUrl(item?.imageUrl);
                        setreportselectusersID(item?.id);
                      }}
                      ref={touchableRef}
                      style={styles.gallerybox}
                    >
                      <FastImage
                        source={{
                          uri: item?.thumbnailImageUrl,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.gallery}
                      />
                    </Pressable>
                  ),
                )}
              </ScrollView>
            </View>
            <View style={styles.nulltextcontainer}>
              <Text style={styles.nulltext}>{reportItem?.description}</Text>
            </View>
            <View>
              <View style={[styles.inputcontainer, styles.mt2]}>
                <Text style={styles.subtitle}>Member Verified Forecast</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.p2}
              >
                {verifiedForests.map((item, id) => {
                  const date1 = Number(moment(item?.forecastDate).format('D'));
                  const date2 = Number(
                    moment(reportItem?.trip?.startDate).format('D'),
                  );
                  const diffDays = date2 - date1 + 1;
                  return (
                    <Pressable
                      key={id}
                      style={styles.swellinfocard}
                      onPress={Gotosubtab}
                    >
                      <View style={styles.vfbtncontainer}>
                        <Text
                          style={[styles.Swllinfotitle]}
                        >{`day${diffDays}-${moment(item?.forecastDate).format(
                          'MMM DD YYYY',
                        )}`}</Text>
                        <TouchableOpacity style={styles.vfbtn}>
                          <Text style={styles.vfbtntext}>VF</Text>
                        </TouchableOpacity>
                      </View>
                      {/* <Text
                        style={[
                          styles.swellinfo,
                          styles.textAligncenter,
                        ]}>{`${direction} ${
                        reportItem?.trip?.destination?.title ?? ''
                      }`}</Text>
                      <Divider style={styles.lightdivider} />
                      <View style={[styles.swellrow]}>
                        <Text style={[styles.swelllable]}>Swell Height</Text>
                        <Text style={[styles.swellinfo, styles.textAlignright]}>
                          {forecast?.swellHeight?.sg}m
                        </Text>
                      </View>
                      <Divider style={styles.lightdivider} />
                      <View style={[styles.swellrow]}>
                        <Text style={[styles.swelllable]}>Swell Direction</Text>
                        <Text style={[styles.swellinfo, styles.textAlignright]}>
                          {getWindDirection(forecast?.swellDirection?.sg)}
                        </Text>
                      </View>
                      <Divider style={styles.lightdivider} />
                      <View style={[styles.swellrow]}>
                        <Text style={[styles.swelllable]}>Wind Direction</Text>
                        <Text style={[styles.swellinfo, styles.textAlignright]}>
                          {direction}
                        </Text>
                      </View>
                      <Divider style={styles.lightdivider} />
                      <View style={[styles.swellrow]}>
                        <Text style={[styles.swelllable]}>Period</Text>
                        <Text style={[styles.swellinfo, styles.textAlignright]}>
                          {forecast?.swellPeriod?.sg}s
                        </Text>
                      </View>
                      <Divider style={styles.lightdivider} /> */}
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
                      <Text style={[styles.swellinfo]}>{item?.text}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
            <View>
              <View style={[styles.inputcontainer, styles.mt2]}>
                <Text style={styles.subtitle}>Trip Details</Text>
              </View>
              <View style={styles.detailsection2}>
                <View style={[styles.ph6]}>
                  <View style={[styles.iconflex, { width: '60%' }]}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />
                    <Text style={styles.nametext}>Driver:</Text>
                  </View>
                  <View style={[styles.mt2]}>
                    {driverList?.map((item, id) => {
                      const isUserDeletedDriver =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.passenger?.id),
                        );
                      return (
                        <>
                          <View
                            style={[styles.passengerimgcontainer, styles.mt2]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeletedDriver &&
                                  navigation.navigate('Profile', {
                                    userId: item?.passenger?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeletedDriver
                                    ? require('../assets/images/logo.png')
                                    : {
                                        uri: item?.passenger
                                          ?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                }
                                style={styles.profileimg}
                              />
                            </Pressable>
                            <View style={{ width: '83%' }}>
                              <Text style={styles.usernametext}>
                                {isUserDeletedDriver
                                  ? 'Deletion Requested'
                                  : item?.passenger?.firstName +
                                    ' ' +
                                    item?.passenger?.lastName}
                              </Text>
                              {!isUserDeletedDriver && (
                                <Text
                                  style={[
                                    styles.status,
                                    organizer === item?.passenger?.id && {
                                      maxWidth:
                                        CURRENT_WIDTH - dynamicSize(200),
                                    },
                                  ]}
                                >
                                  {getUserInfoText(item?.passenger)}
                                </Text>
                              )}
                              <Text style={styles.status}>
                                {`Rate: ${
                                  driverRatingReport[
                                    reportItem?.driverRating ?? 0
                                  ]
                                }`}
                              </Text>
                            </View>
                            {organizer === item?.passenger?.id && (
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
                          <Divider style={styles.divider} />
                        </>
                      );
                    })}
                  </View>
                </View>
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
                    {passengersList?.map((item, id) => {
                      const isUserDeletedPassanger =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.passenger?.id),
                        );
                      return (
                        <>
                          <View
                            style={[styles.passengerimgcontainer, styles.mt2]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeletedPassanger &&
                                  navigation.navigate('Profile', {
                                    userId: item?.passenger?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeletedPassanger
                                    ? require('../assets/images/logo.png')
                                    : {
                                        uri: item?.passenger
                                          ?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }
                                }
                                style={styles.profileimg}
                              />
                            </Pressable>
                            <View style={{ width: '83%' }}>
                              <Text style={styles.usernametext}>
                                {isUserDeletedPassanger
                                  ? 'Deletion Requested'
                                  : item?.passenger?.firstName +
                                    ' ' +
                                    item?.passenger?.lastName}
                              </Text>
                              {!isUserDeletedPassanger && (
                                <Text
                                  style={[
                                    styles.status,
                                    organizer === item?.passenger?.id && {
                                      maxWidth:
                                        CURRENT_WIDTH - dynamicSize(200),
                                    },
                                  ]}
                                >
                                  {getUserInfoText(item?.passenger)}
                                </Text>
                              )}
                            </View>
                            {organizer === item?.passenger?.id && (
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
                          <Divider style={styles.divider} />
                        </>
                      );
                    })}
                  </View>
                </View>
                {/* <Divider style={styles.divider} /> */}
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[styles.iconflex, { width: '40%' }]}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />
                    <Text style={styles.nametext}>Departed:</Text>
                  </View>
                  <View style={[{ width: '60%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {reportItem?.trip?.startDate
                        ? moment(reportItem?.trip?.startDate).format('HH:mm')
                        : ''}
                    </Text>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {deptAddress}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%', paddingRight: 10 }]}>
                    <Text style={styles.nametext}>Arrived:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
                      {toAddress}
                    </Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Duration:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
                      {(reportItem?.trip?.startDate
                        ? moment(reportItem?.trip?.startDate).format(
                            'DD/MM/YYYY',
                          )
                        : '') +
                        '-' +
                        (reportItem?.trip?.endDate
                          ? moment(reportItem?.trip?.endDate).format(
                              'DD/MM/YYYY',
                            )
                          : '')}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Skill Level:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
                      {skill[reportItem?.trip?.skillLevel ?? 0]}
                    </Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Board Size:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
                      {board[reportItem?.trip?.boardSize ?? 0]}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View>
                  <View style={[styles.flexrow, styles.ph6]}>
                    <View style={[{ width: '50%' }]}>
                      <Text style={styles.nametext}>Accomodations</Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                      <Text style={[styles.nametitle, styles.textAlignright]}>
                        {reportItem?.trip?.accommodationAvailable
                          ? 'YES'
                          : 'No'}
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
                      <Text style={styles.nametext}>Adaptive</Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                      <Text style={[styles.nametitle, styles.textAlignright]}>
                        {reportItem?.trip?.isAdaptive ? 'YES' : 'NO'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View>
                  <View style={[styles.flexrow, styles.ph6]}>
                    <View style={[{ width: '50%' }]}>
                      <Text style={styles.nametext}>Expenses</Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                      <Text style={[styles.nametitle, styles.textAlignright]}>
                        {expenses ? parseFloat(expenses).toFixed(2) : 0.0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <Popover
            isVisible={popoverVisible}
            popoverStyle={styles.content}
            from={touchableRef}
            onRequestClose={() => setPopoverVisible(false)}
          >
            <View style={styles.popupcontainer}>
              <TouchableOpacity
                style={styles.popupitem}
                onPress={e => {
                  blockreport(
                    selectusersID,
                    'tripreportimage',
                    'report',
                    'Reported',
                  );
                }}
              >
                <Text style={styles.popupitemtext}>Report</Text>
              </TouchableOpacity>
            </View>
          </Popover>
        </ScrollView>
        <PreviewModal
          // reportbutton={true}
          visible={reportimagePreviewModal}
          onClose={() => {
            setreportimagePreviewModal(false);
          }}
          onOpen={() => {
            setreportimagePreviewModal(true);
          }}
          selectimageID={reportselectusersID}
          photoUrl={reportUrl}
          pageName={'reportimage'}
        />
        <PreviewModal
          reportbutton={true}
          visible={imagePreviewModal}
          onClose={() => {
            setImagePreviewModal(false);
          }}
          onOpen={() => {
            setImagePreviewModal(true);
          }}
          selectimageID={selectusersID}
          photoUrl={imageUrl}
          pageName={'tripreportimage'}
        />
        <ListModal
          onCancel={() => {
            setreportModal(false);
          }}
          outheruser={!isSelf}
          isself={isSelf}
          visible={reportModal}
          onPressReport={() => {
            blockreportImage();
            // Alert.alert('Alert', 'Are you sure you want to delete this photo?');
          }}
        />
      </SafeAreaView>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(10),
    right: dynamicSize(10),
    zIndex: 5,
    shadowColor: 'black',
    elevation: 5,
    shadowOpacity: 1,
    shadowRadius: 5,
    backgroundColor: 'transparent',
  },
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 150,
  },

  backarrow: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 10,
    borderRadius: 8,
    marginRight: 5,
    height: 38,
    width: 38,
  },
  popupitemtext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    lineHeight: getFontSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(22),
    width: dynamicSize(22),
  },
  iconbtnrow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
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
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 23,
    textAlign: 'left',
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
    fontSize: 10,
    color: Color.white,
    lineHeight: 17,
  },
  vfbtn: {
    height: 25,
    width: 25,
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
    fontSize: 12,
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    textTransform: 'uppercase',
    flexWrap: 'wrap',
  },
  swellinfo: {
    fontSize: 16,
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    flex: 1,
    flexWrap: 'wrap',
  },
  swelllable: {
    fontSize: 13,
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 21,
    flex: 1,
    flexWrap: 'wrap',
  },
  swellinfocard: {
    backgroundColor: Color.black,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 20,
    width: 280,
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
    marginVertical: 10,
    height: 1.5,
  },
  textAlignleft: {
    textAlign: 'left',
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
  nulltextcontainer: {
    backgroundColor: Color.reportcardbg,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 100,
  },
  nulltext: {
    color: Color.cardgray,
    fontFamily: fontFamily.ProximaAB,
    color: Color.black,
    flex: 1,
  },
  boxtitle: {
    fontSize: 15,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 21,
    color: Color.black,
    marginVertical: 15,
  },
  imgcontainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  gallerybox: {
    height: 140,
    width: 120,
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
    fontSize: 14,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(21),
    width: '85%',
  },
  inputcontainer: {
    paddingHorizontal: 20,
  },
  borderwithoutrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: dynamicSize(10),
  },
  nametitle: {
    ...text.tripdetail,
    color: Color.black,
    textAlign: 'right',
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  usernametext: {
    color: Color.cardgray,
    ...text.usernameboldtitle,
    flex: 1,
    flexWrap: 'wrap',
  },
  nametext: {
    ...text.tripitemtitle,
    color: Color.cardgray,
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
  posttime: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(16),
    // width: '35%',
    textAlign: 'right',
    color: Color.cardgray,
  },
  namesubtitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
    width: '60%',
    color: Color.cardgray,
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  profileimgcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: Color.cardgray,
    paddingVertical: 15,
    borderTopWidth: 1,
  },
  detailcontainer: {
    backgroundColor: Color.reportcardbg,
    marginHorizontal: 20,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

//make this component available to the app
export default TripReport;

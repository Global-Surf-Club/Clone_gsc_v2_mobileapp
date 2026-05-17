//import liraries
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { memo, useEffect, useState, useCallback, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Image } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import Trip from '../api/Trip';
import {
  Color,
  fontFamily,
  resizeMode,
  Shadow,
  text,
} from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import Blockreport from '../api/Blockreport';
import ListModal from './ListModal';
import Entypo from 'react-native-vector-icons/Entypo';
import SuccessModal from './SuccessModal';
import ClubsAPi from '../api/ClubApi';
import { Divider } from 'react-native-paper';
import Popover from 'react-native-popover-view';
import FastImage from 'react-native-fast-image';

export const TripReport = props => {
  const {
    item,
    onCardClick,
    onPressRead,
    rbtnbackground,
    onPressdownload,
    onPressreportImage,
    onLayout,
    ReportID,
  } = props;
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const [likes, setLikes] = useState([]);
  const [likeData, LikeData] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectImageID, setselectImageID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.author?.id));

  useEffect(() => {
    getLikes();
  }, [item]);

  const getLikes = async () => {
    try {
      const like = JSON.parse(await ClubsAPi.getclubsTripsLikes(item?.id));
      setLikes(like);
    } catch (error) {}
  };

  useEffect(() => {
    let flag = 0;
    likes.forEach(item => {
      if (item?.userLikeId == user?.id) {
        flag = 1;
        LikeData(item);
      }
    });
    if (flag == 0) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  }, [likes]);

  // const destinationAddress = item?.trip?.destination?.address;
  const destinationAddress = item?.destinationLocationAddress;

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
  const accommodationAddress = item?.trip?.accommodationAddress;
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

  // const passengersNames = item?.trip?.memberList
  //   ?.map(item => item?.firstName)
  //   .join(', ');
  const passengersNames = item?.trip?.passengers
    ?.map(item => item?.passenger?.firstName + '' + item?.passenger?.lastName)
    .join(', ');

  const reportImage = async () => {
    if (user !== null && user !== '') {
      if (
        selectImageID !== null &&
        selectImageID !== '' &&
        selectImageID !== undefined
      ) {
        const data = {
          SenderUserId: user.id,
          TargetId: selectImageID,
          TargetType: 'clubtripreportimage',
          RecordType: 'report',
          ClubId: item?.clubId,
        };

        // const retval = await Blockreport.createblockreport(
        //   JSON.stringify(data),
        // );

        if (retval !== null) {
          if (retval?.id > 0) {
            setselectImageID('');
            setDeleteModal(false);
            setSuccessDescription('reported successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
            // Alert.alert('Tripreport image successfully');
          } else {
            setSuccessDescription('reported not successfully');
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
            // Alert.alert('Tripreport image Not successfully');
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };
  const blockreport = async (targetId, targetType, recordType, userMessage) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        const data = {
          SenderUserId: user.id,
          TargetId: targetId,
          TargetType: targetType,
          RecordType: recordType,
          ClubId: item?.clubId,
        };
        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );
        if (retval !== null) {
          if (retval?.id > 0) {
            setselectusersID('');
            setPopoverVisible(false);
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
            setSuccessDescription(userMessage + ' successfully');
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

  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [ReportID]);

  return (
    // isUserDeleted ? (
    //   <View
    //     style={[
    //       TripReportstyle.cardView,
    //       {
    //         borderColor: ReportID === item?.id ? heightlightColor : Color.white,
    //         borderWidth: 2,
    //       },
    //     ]}
    //   >
    //     <View style={TripReportstyle.box50}>
    //       <View>
    //         <Text style={TripReportstyle.title}>Trip Report</Text>
    //       </View>
    //     </View>
    //     <Text>Member requested to delete</Text>
    //   </View>
    // ) : (
    <Pressable
      style={[
        TripReportstyle.cardView,
        {
          borderColor: ReportID === item?.id ? heightlightColor : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={onCardClick}
      onLayout={onLayout}
    >
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          setSuccessDescription('');
          setPopoverVisible(false);
          setDeleteModal(false);
          setselectImageID('');
          setselectusersID('');
        }}
        description={successdescription}
        iserror={iserror}
      />
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          <View>
            <Text style={TripReportstyle.title}>Trip Report</Text>
          </View>
        </View>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.raitingrow}>
            <Text style={TripReportstyle.ratingtext}>Rating</Text>
            <View style={TripReportstyle.raitingrow}>
              {[0, 1, 2, 3, 4].map(i => (
                <MaterialCommunityIcons
                  name={'star'}
                  size={dynamicSize(13)}
                  color={i < item?.rating ? Color.starbg : 'grey'}
                />
              ))}
            </View>
          </View>
        </View>
      </View>
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          {item?.author?.id !== user.id ? (
            <TouchableOpacity
              style={TripReportstyle.dotCont}
              onPress={() => {
                setDeleteModal(true);
                setselectImageID(item?.images[0] && item?.images[0]?.id);
              }}
            >
              <Entypo
                name="dots-three-vertical"
                color={Color.black}
                size={getFontSize(16)}
              />
            </TouchableOpacity>
          ) : (
            <></>
          )}

          <Pressable
            style={TripReportstyle.mainimgcontainer}
            ref={touchableRef}
            // onLongPress={e => {
            //   setPopoverVisible(true);
            //   setselectusersID(item?.images[0] && item?.images[0]?.id);
            // }}
          >
            {/* {} */}
            {item?.images.length > 0 && item?.images ? (
              <Pressable onPress={onPressreportImage}>
                <FastImage
                  resizeMode={resizeMode.center}
                  source={{
                    uri: item?.images[0]?.thumbnailImageUrl,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={[
                    TripReportstyle.subproimg,
                    { backgroundColor: resizeMode.background },
                  ]}
                />
              </Pressable>
            ) : (
              <FastImage
                source={require('../assets/images/logo-removebg.png')}
                resizeMode="contain"
                style={[TripReportstyle.subproimg, { opacity: 0.9 }]}
              />
            )}
          </Pressable>
        </View>

        <View style={TripReportstyle.box50}>
          <View>
            <Text style={TripReportstyle.icontext}>{item?.trip?.title}</Text>
            {toAddress ? (
              <Text style={TripReportstyle.subtext}>{toAddress}</Text>
            ) : (
              <></>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/vanLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {item?.trip?.transportType ? (
              <Text style={TripReportstyle.icontext}>
                {item?.trip?.transportType}
              </Text>
            ) : (
              <Text style={TripReportstyle.icontext}> - </Text>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/surfingLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {passengersNames ? (
              <Text style={TripReportstyle.icontext}>{passengersNames}</Text>
            ) : (
              <Text style={TripReportstyle.icontext}> - </Text>
            )}
          </View>
          <View style={TripReportstyle.iconrow}>
            <View style={TripReportstyle.iconbox}>
              <FastImage
                source={require('../assets/images/icon/hostelLogo.png')}
                style={TripReportstyle.texttitleicon}
              />
            </View>
            {item?.trip?.accommodationAvailable ? (
              <Text style={TripReportstyle.icontext}>{accAddress}</Text>
            ) : (
              <Text style={TripReportstyle.icontext}>N/A</Text>
            )}
          </View>
        </View>
      </View>
      <ListModal
        onCancel={() => {
          setselectImageID('');
          setDeleteModal(false);
        }}
        outheruser
        // isself={isSelf}
        visible={deleteModal}
        onPressReport={() => {
          reportImage();
          // Alert.alert('Alert', 'Are you sure you want to delete this photo?');
        }}
      />
      <View style={TripReportstyle.row}>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.iconbtnrow}>
            {likes?.length > 0 && (
              <Text
                style={{ color: Color.black, fontFamily: fontFamily.ProximaR }}
              >
                {likes?.length}
              </Text>
            )}
            <Pressable
              onPress={async () => {
                setIsLiked(data => !data);
                try {
                  if (isLiked) {
                    const data = await Trip.deleteTripReportLike(likeData?.id);
                  } else {
                    const data = await Trip.likeTripReport(item?.id);
                  }
                  getLikes();
                } catch (error) {
                  getLikes();
                }
              }}
              style={TripReportstyle.iconbtn}
            >
              {/* <AntDesign name={isLiked ? 'like1' : 'like2'} color={'black'} size={20} /> */}
              <FastImage
                // source={require('../assets/images/icon/likeIcon.png')}
                source={
                  isLiked
                    ? require('../assets/images/NewIcons/like_selected.png')
                    : require('../assets/images/NewIcons/like.png')
                }
                style={TripReportstyle.iconimg}
              />
            </Pressable>
            {(item?.commentCount ?? item?.tripReportCommentCount ?? 0) > 0 && (
              <Text
                style={{ color: Color.black, fontFamily: fontFamily.ProximaR }}
              >
                {item?.commentCount ?? item?.tripReportCommentCount ?? 0}
              </Text>
            )}
            <Pressable
              style={TripReportstyle.iconbtn}
              onPress={() => {
                navigation.navigate('ClubTripReportComments', {
                  reportId: item?.id,
                });
              }}
            >
              <FastImage
                source={require('../assets/images/icon/commentIcon.png')}
                style={TripReportstyle.iconimg}
              />
            </Pressable>
            {onPressdownload ? (
              <Pressable
                style={TripReportstyle.iconbtn}
                onPress={onPressdownload}
              >
                <FastImage
                  source={require('../assets/images/icon/downloadIcon.png')}
                  style={TripReportstyle.iconimg}
                />
              </Pressable>
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={TripReportstyle.box50}>
          <View style={TripReportstyle.buttoncontainer}>
            <Pressable
              style={[
                TripReportstyle.readbtn,
                {
                  backgroundColor: rbtnbackground
                    ? rbtnbackground
                    : Color.black,
                },
              ]}
              onPress={onPressRead}
            >
              <Text style={TripReportstyle.readtext}>Read</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Popover
        isVisible={popoverVisible}
        popoverStyle={TripReportstyle.content}
        from={touchableRef}
        onRequestClose={() => setPopoverVisible(false)}
      >
        <View style={TripReportstyle.popupcontainer}>
          <TouchableOpacity
            style={TripReportstyle.popupitem}
            onPress={e => {
              blockreport(
                item.id,
                'clubtripreportcomment',
                'report',
                'Reported',
              );
            }}
          >
            <Text style={TripReportstyle.popupitemtext}>Report</Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </Pressable>
  );
};

// define your styles
const TripReportstyle = StyleSheet.create({
  dotCont: {
    position: 'absolute',
    top: dynamicSize(15),
    right: dynamicSize(10),
    zIndex: 99,
    shadowColor: '#fafafa',
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
  readtext: {
    fontSize: getFontSize(14),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(22),
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    borderRadius: 100,
  },
  mainimgcontainer: {
    borderRadius: 20,
    height: dynamicSize(130),
    overflow: 'hidden',
    width: '100%',
  },
  raitingrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  subtext: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    paddingVertical: 5,
  },
  ratingtext: {
    fontSize: getFontSize(13),
    lineHeight: getLineSize(18),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  icontext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
    textTransform: 'capitalize',
  },
  buttoncontainer: {
    paddingHorizontal: 10,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconbox: {
    height: dynamicSize(22),
    width: dynamicSize(22),
    marginRight: 5,
  },
  texttitleicon: {
    height: dynamicSize(18),
    width: dynamicSize(18),
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  title: {
    fontSize: getFontSize(16),
    color: Color.themeColor,
    lineHeight: getLineSize(23),
    fontFamily: fontFamily.ProximaAB,
    marginVertical: 5,
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
    height: dynamicSize(20),
    width: dynamicSize(20),
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subproimg: {
    height: '100%',
    width: '100%',
    backgroundColor: '#8cb4cf52',
  },
  box50: {
    width: '49%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 10,
    marginTop: 2,
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
});

// create a component
export const Communityinfo = memo(props => {
  const {
    item,
    onCardClick,
    onPresslike,
    isSended,
    showAll = false,
    onPressmessage,
    onPressshare,
    rbtnbackground,
    onPressinfobutton,
    onPressdownload,
    onPressAccept,
    onPressDecline,
    isProfile = false,
    TripID,
    onLayout,
  } = props;
  const departureAddress = item?.departureAddress;
  const navigation = useNavigation();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const startDate = new Date(item?.startDate);
  startDate.setDate(startDate.getDate() + 6);
  const expiryDateVar = new Date(item?.expiryDate).getTime();
  const currentDate = new Date().getTime();
  const isExpired = expiryDateVar < currentDate;
  const user = useSelector(state => state.auth.user);
  const [selectusersID, setselectusersID] = useState('');
  const [likeData, LikeData] = useState({});
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.organizer?.id));
  const getLikes = async () => {
    const like = JSON.parse(await Trip.getTripLikes(item?.id));
    setLikes(like);
  };

  useEffect(() => {
    getLikes();
  }, [item]);

  useEffect(() => {
    let flag = 0;
    likes.forEach(item => {
      if (item?.userLikeId == user?.id) {
        flag = 1;
        LikeData(item);
      }
    });
    if (flag == 0) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  }, [likes]);

  // const destination = item?.destination?.address;
  const destination = item?.destinationLocationAddress;
  const fromAddress =
    (departureAddress?.address1 ?? '') +
    ' ' +
    // (departureAddress?.address2 ?? '') +
    // ' ' +
    (departureAddress?.city ?? '') +
    ' ' +
    (departureAddress?.state ?? '') +
    ' ' +
    (departureAddress?.country ?? '');
  const toAddress =
    (destination?.address1 ?? '') +
    // ' ' +
    // (destination?.address2 ?? '') +
    ' ' +
    (destination?.city ?? '');
  ' ' + (destination?.state ?? '') + ' ' + (destination?.country ?? '');

  const isTripStarted =
    new Date(moment(item?.startDate).add(6, 'hours')).getTime() <
    new Date().getTime();

  // if (isExpired && !isProfile) {
  //   return null;
  // }
  const [heightlightColor, setheightlightColor] = useState(Color.lightblue);
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [TripID]);

  return (
    // isUserDeleted ? (
    //   <View
    //     style={[
    //       Communityinfostyle.cardView,
    //       {
    //         borderColor:
    //           TripID === (item?.id || item?.tripId)
    //             ? heightlightColor
    //             : Color.white,
    //         borderWidth: 2,
    //       },
    //     ]}
    //   >
    //     <View style={[Communityinfostyle.row, { paddingVertical: 10 }]}>
    //       <Pressable
    //         style={[
    //           Communityinfostyle.profileimgcontainer,
    //           { top: dynamicSize(0) },
    //         ]}
    //       >
    //         <FastImage
    //           source={require('../assets/images/logo.png')}
    //           style={Communityinfostyle.profileimg}
    //         />
    //       </Pressable>
    //       <View style={Communityinfostyle.profiletextcontainer}>
    //         <Text style={[Communityinfostyle.nametitle, Communityinfostyle.mt1]}>
    //           Deletion Requested
    //         </Text>
    //         <Text
    //           style={[
    //             Communityinfostyle.nametitle,
    //             { fontFamily: fontFamily.ProximaR },
    //           ]}
    //         >
    //           Member requested to delete
    //         </Text>
    //       </View>
    //     </View>
    //   </View>
    // ) : (
    <Pressable
      style={[
        Communityinfostyle.cardView,
        {
          borderColor: TripID === item?.id ? heightlightColor : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={() => {
        onCardClick && onCardClick({ ...item, isExpired });
      }}
      onLayout={onLayout}
    >
      <View
        pointerEvents="none"
        style={[Communityinfostyle.mapcontainer, { overflow: 'hidden' }]}
      >
        {item?.destination?.address?.destinationLocationLat &&
          item?.destination?.address?.destinationLocationLng && (
            <MapView
              key={item?.tripId?.toString()}
              style={StyleSheet.absoluteFill}
              // style={{position:'absolute'}}
              provider={PROVIDER_GOOGLE}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              zoomControlEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              initialRegion={{
                // ...item?.destination?.address?.destinationLocation,
                latitude: item?.destination?.address?.destinationLocationLat,
                longitude: item?.destination?.address?.destinationLocationLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={'standard'}
            >
              {item?.destination?.address?.destinationLocationLat &&
                item?.destination?.address?.destinationLocationLng && (
                  <Marker
                    // coordinate={item?.destination?.address?.destinationLocation}
                    coordinate={{
                      latitude:
                        item?.destination?.address?.destinationLocationLat,
                      longitude:
                        item?.destination?.address?.destinationLocationLng,
                    }}
                  />
                )}
            </MapView>
          )}
        <View style={Communityinfostyle.titlebuttoncontainer}>
          <Pressable style={Communityinfostyle.namebtn}>
            <Text style={Communityinfostyle.nametext} numberOfLines={1}>
              {item?.title ?? ''}
            </Text>
          </Pressable>
        </View>
      </View>
      <View>
        <View style={Communityinfostyle.row}>
          <Pressable
            onPress={() => {
              !isUserDeleted &&
                navigation.navigate('Profile', { userId: item?.organizer?.id });
            }}
            style={Communityinfostyle.profileimgcontainer}
          >
            <FastImage
              //source={require('../assets/images/icon/Surfboard.jpg')}
              source={
                isUserDeleted
                  ? require('../assets/images/logo.png')
                  : {
                      uri: item?.organizer?.thumbnailProfileImage,
                      cache: FastImage.cacheControl.immutable,
                    }
              }
              // source={item.profileimage}
              style={Communityinfostyle.profileimg}
            />
          </Pressable>
          <View style={Communityinfostyle.profiletextcontainer}>
            <Text
              style={[Communityinfostyle.nametitle, Communityinfostyle.mt1]}
            >
              {isUserDeleted
                ? 'Deletion Requested'
                : item?.organizer?.firstName + ' ' + item?.organizer?.lastName}
            </Text>
            <Text
              numberOfLines={1}
              style={[Communityinfostyle.namesubtitle, Communityinfostyle.mt1]}
            >
              From:{' '}
              <Text style={Communityinfostyle.nametitle}>{fromAddress}</Text>
            </Text>
            <Text numberOfLines={1} style={Communityinfostyle.namesubtitle}>
              To: <Text style={Communityinfostyle.nametitle}>{toAddress}</Text>
            </Text>
          </View>
        </View>

        <View style={Communityinfostyle.iconrowcontainer}>
          <View style={Communityinfostyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/users.png')}
              resizeMode={'contain'}
              style={[Communityinfostyle.iconimg, { width: dynamicSize(20) }]}
            />

            <Text style={Communityinfostyle.nametitle}>
              {item?.passengers?.length ?? 1}
            </Text>
          </View>
          <View style={Communityinfostyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/ic_calendar_black.png')}
              style={Communityinfostyle.iconimg}
            />

            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                Communityinfostyle.nametitle,
                { marginRight: dynamicSize(10) },
              ]}
            >
              {item?.startDate
                ? moment(item?.startDate ?? '').format('DD/MM/YYYY')
                : ''}
            </Text>
          </View>
          <View
            style={[Communityinfostyle.iconrow, { justifyContent: 'flex-end' }]}
          >
            <AntDesign
              name="clockcircle"
              color={'black'}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />
            <Text style={Communityinfostyle.nametitle}>
              {item?.startDate
                ? moment(item?.startDate ?? '').format('HH:mm')
                : ''}
            </Text>
          </View>
        </View>
        <View style={[Communityinfostyle.row]}>
          <View style={[Communityinfostyle.box50, { width: undefined }]}>
            <View style={[Communityinfostyle.iconbtnrow]}>
              {likes?.length > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {likes?.length}
                </Text>
              )}
              <Pressable
                style={[Communityinfostyle.iconbtn]}
                onPress={async () => {
                  setIsLiked(data => !data);
                  try {
                    if (isLiked) {
                      // const data = await Trip.deleteTripLike(likeData?.id);
                      const data = await Trip.deleteTripLike(item?.id);
                    } else {
                      const data = await Trip.likeTrip(item?.id);
                    }
                    getLikes();
                  } catch (error) {
                    getLikes();
                  }
                }}
              >
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={Communityinfostyle.iconimg}
                />
              </Pressable>
              {(item?.commentCount ?? item?.tripCommentCount ?? 0) > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {item?.commentCount ?? item?.tripCommentCount ?? 0}
                </Text>
              )}
              <Pressable
                style={Communityinfostyle.iconbtn}
                onPress={() => {
                  // const passengerList =
                  //   item?.passengers?.map(item => item?.passenger?.id) ?? [];
                  // const isJoined = passengerList.includes(user?.id);
                  // navigation.navigate('ClubTripdetail', {
                  //   ...item,
                  //   showAll: isJoined || user?.id == tripData?.organizer?.id,
                  //   isChat: isJoined || user?.id == tripData?.organizer?.id,
                  // });
                  navigation.navigate('TripComments', {
                    ...item,
                    isClub: true,
                  });
                }}
              >
                <FastImage
                  source={require('../assets/images/icon/commentIcon.png')}
                  style={Communityinfostyle.iconimg}
                />
              </Pressable>

              {item?.isAdaptive && (
                <View
                  style={[
                    Communityinfostyle.iconbtn,
                    {
                      height: dynamicSize(23),
                      width: dynamicSize(23),
                      borderRadius: 15,
                    },
                  ]}
                >
                  <FastImage
                    source={require('../assets/images/icon/adaptive.png')}
                    resizeMode="contain"
                    style={{ height: '100%', width: '100%' }}
                  />
                </View>
              )}
              {onPressdownload ? (
                <Pressable
                  style={Communityinfostyle.iconbtn}
                  onPress={onPressdownload}
                >
                  <FastImage
                    source={require('../assets/images/icon/downloadIcon.png')}
                    style={Communityinfostyle.iconimg}
                  />
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              flex: 1,
            }}
          >
            {isExpired ? (
              <View style={{}}>
                <View style={Communityinfostyle.buttoncontainer}>
                  <Pressable
                    style={[
                      Communityinfostyle.readbtn,
                      { backgroundColor: '#FF0000AA' },
                    ]}
                  >
                    <Text style={Communityinfostyle.readtext}>EXPIRED</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                {item?.organizer?.id !== user?.id ? (
                  item?.clubMemberStatus?.toLowerCase()?.split(' ')[0] ===
                  'invited' ? (
                    <View style={{}}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                        >
                          <Text style={Communityinfostyle.readtext}>
                            REQUESTED
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : item?.clubMemberStatus?.toLowerCase()?.split(' ')[0] ===
                    'pending' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pressable
                        style={[
                          Communityinfostyle.readbtn,
                          {
                            backgroundColor: Color.lightblue,
                            borderWidth: 1,
                            borderColor: Color.lightblue,
                            marginRight: 5,
                          },
                        ]}
                        onPress={() => {
                          if (isTripStarted) {
                            alert(
                              'You can not join a trip 6 hours after a trip has started',
                            );
                          } else {
                            onPressAccept && onPressAccept(item?.id);
                          }
                        }}
                      >
                        <Text
                          style={[
                            Communityinfostyle.readtext,
                            { color: Color.white },
                          ]}
                        >
                          Approve
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          Communityinfostyle.readbtn,
                          {
                            backgroundColor: Color.white,
                            borderWidth: 1,
                            borderColor: Color.lightblue,
                          },
                        ]}
                        onPress={() => {
                          onPressDecline && onPressDecline(item?.id);
                        }}
                      >
                        <Text
                          style={[
                            Communityinfostyle.readtext,
                            { color: Color.lightblue },
                          ]}
                        >
                          Decline
                        </Text>
                      </Pressable>
                    </View>
                  ) : item?.clubMemberStatus?.toLowerCase()?.split(' ')[0] ===
                    'join' ? (
                    <View style={{}}>
                      <View style={Communityinfostyle.buttoncontainer}>
                        <Pressable
                          style={[
                            Communityinfostyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                          onPress={() => {
                            onPressinfobutton && onPressinfobutton(item?.id);
                          }}
                        >
                          <Text style={Communityinfostyle.readtext}>JOIN</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : item?.clubMemberStatus?.toLowerCase()?.split(' ')[0] ===
                    'member' ? (
                    <></>
                  ) : (
                    <></>
                  )
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

// define your styles
const Communityinfostyle = StyleSheet.create({
  readtext: {
    fontSize: getFontSize(12),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 22,
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box50: {
    width: '49%',
  },
  iconrowcontainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderTopColor: Color.lightGray,
  },
  blank: {
    paddingVertical: dynamicSize(20),
  },
  mt1: {
    marginTop: 5,
  },
  mt2: {
    marginTop: 10,
  },
  titlebuttoncontainer: {
    paddingRight: 10,
  },
  nametitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  namesubtitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  profiletextcontainer: {
    width: '75%',
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '25%',
    height: dynamicSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: dynamicSize(-25),
  },
  profileimg: {
    width: dynamicSize(60),
    height: '100%',
    borderRadius: 100,
    backgroundColor: Color.gray,
  },
  nametext: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  namebtn: {
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    backgroundColor: 'rgba(37,87,102,0.8)',
    alignItems: 'flex-start',
    minWidth: dynamicSize(70),
    alignItems: 'center',
    position: 'absolute',
    top: dynamicSize(10),
    left: dynamicSize(10),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  buttoncontainer: {
    paddingRight: 5,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  mapcontainer: {
    height: dynamicSize(100),
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  iconimg: {
    height: dynamicSize(18),
    width: dynamicSize(18),
    marginRight: dynamicSize(7),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardView: {
    backgroundColor: Color.white,
    // marginVertical: 5,
    marginBottom: dynamicSize(15),
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
});

export const Eventlist = props => {
  const {
    item,
    onCardClick,
    onEventLikeClick,
    onEventCommentClick,
    userId,
    AttendClub,
    GoingTo,
    Maybe,
    EventIDH,
    onLayout,
  } = props;
  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const [measured, setMeasured] = useState(false);
  const user = useSelector(state => state.auth.user);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.organizerId));
  useEffect(() => {
    setheightlightColor(Color.lightblue);
    setTimeout(() => {
      setheightlightColor(Color.white);
    }, 15000);
  }, [props?.EventIDH]);

  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = useCallback(e => {
    if (Platform.OS === 'android') {
      setLengthMore(e.nativeEvent.lines.length > 3);
    } else {
      setLengthMore(e.nativeEvent.lines.length >= 3);
    }
    //to check the text is more than 4 lines or not
  }, []);

  return (
    // isUserDeleted ? (
    //   <View
    //     style={[
    //       eventstyle.cardView,
    //       {
    //         borderColor: EventIDH === item?.id ? heightlightColor : Color.white,
    //         borderWidth: 2,
    //         paddingVertical: 10,
    //       },
    //     ]}
    //   >
    //     <Text>Member requested to delete</Text>
    //   </View>
    // ) : (
    <Pressable
      style={[
        eventstyle.cardView,
        {
          borderColor: EventIDH === item?.id ? heightlightColor : Color.white,
          borderWidth: 2,
        },
      ]}
      onPress={() => {
        onCardClick(item?.id);
      }}
      onLayout={onLayout}
    >
      <View style={[eventstyle.mainrow, { alignItems: 'center' }]}>
        <View style={[eventstyle.width60]}>
          <View style={[eventstyle.row, {}]}>
            {item?.thumbnailCoverPhotoPath?.length > 0 ? (
              <View style={eventstyle.clubimgcontainer}>
                <FastImage
                  source={{
                    uri: item?.thumbnailCoverPhotoPath,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  style={eventstyle.clubprofileimg}
                />
              </View>
            ) : (
              <View style={eventstyle.clubimgcontainer}>
                <FastImage
                  style={eventstyle.clubprofileimg}
                  source={require('../assets/images/logo.png')}
                />
              </View>
            )}
            <View style={[eventstyle.box60, { justifyContent: 'center' }]}>
              <Text style={[eventstyle.clubicontext]}>{item?.name}</Text>
            </View>
          </View>
        </View>

        <View
          style={[
            eventstyle.width40,
            { alignItems: 'flex-end', justifyContent: 'center' },
          ]}
        >
          <View style={[eventstyle.datetimecontainer, { marginRight: 25 }]}>
            <Text style={[eventstyle.redcontainer]}>
              {moment(item.startDate).format('MMM')}
            </Text>
            <Text style={eventstyle.clubicontext}>
              {moment(item.startDate).format('DD/YY')}
            </Text>
          </View>
          <Text style={[eventstyle.clubicontext, { marginRight: 25 }]}>
            Time: {moment(item.startDate).format('hh:mm a')}
          </Text>
        </View>
      </View>
      <Text
        style={eventstyle.clubsubtext}
        onTextLayout={e => {
          if (!measured) {
            const lines = e.nativeEvent?.lines?.length ?? 0;
            setLengthMore(lines > 3);
            setMeasured(true);
          }
        }}
        numberOfLines={textShown || !measured ? undefined : 3}
      >
        {item?.description?.trim() || ''}
      </Text>

      {lengthMore ? (
        <TouchableOpacity
          onPress={() => {
            onCardClick(item?.id);
          }}
        >
          <Text style={eventstyle.clubicontext}>
            {textShown ? 'Read less..' : 'Read more..'}
          </Text>
        </TouchableOpacity>
      ) : null}
      <View style={{ marginTop: dynamicSize(10) }}></View>
      <View
        style={[
          eventstyle.iconrow,
          { marginBottom: dynamicSize(5), alignItems: 'flex-start', flex: 1 },
        ]}
      >
        <View style={eventstyle.iconcontainer}>
          <Ionicons name="location" size={17} color={Color.black} />
        </View>

        <Text style={[eventstyle.clubsubtext, { flex: 1 }]} numberOfLines={4}>
          {/* 92 Scarcroft Road, Port Mor, United Kingdom, PH42 6YL */}
          {item?.address?.address1 ? item?.address?.address1 : 'N/A'}
        </Text>
      </View>

      <View style={{ paddingTop: dynamicSize(10) }}></View>
      <View style={[eventstyle.rightposition]}>
        {item?.isShowGuestList == true ? (
          <View style={eventstyle.row}>
            <Pressable
              onPress={() => {
                GoingTo(item?.id);
              }}
            >
              <View style={[eventstyle.row, eventstyle.mr1]}>
                <Text style={eventstyle.datalable}>
                  Going{' '}
                  <Text style={eventstyle.dataitem}>{item.goingToCount}</Text>
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                Maybe(item?.id);
              }}
            >
              <View style={eventstyle.row}>
                <Text style={eventstyle.datalable}>
                  Maybe{' '}
                  <Text style={eventstyle.dataitem}>{item?.maybeCount}</Text>
                </Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={eventstyle.row}>
            <Pressable
              onPress={() => {
                item?.organizerId === userId ? GoingTo(item?.id) : '';
              }}
            >
              <View style={[eventstyle.row, eventstyle.mr1]}>
                <Text style={eventstyle.datalable}>
                  Going{' '}
                  <Text style={eventstyle.dataitem}>{item.goingToCount}</Text>
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => {
                item?.organizerId === userId ? Maybe(item?.id) : '';
              }}
            >
              <View style={eventstyle.row}>
                <Text style={eventstyle.datalable}>
                  Maybe{' '}
                  <Text style={eventstyle.dataitem}>{item?.maybeCount}</Text>
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
      <Divider style={eventstyle.divider} />
      <View
        style={[eventstyle.rightbox, { alignItems: 'center', marginBottom: 5 }]}
      >
        <View style={[eventstyle.iconbtnrow]}>
          <Pressable
            style={eventstyle.iconbtn}
            onPress={async () => {
              if (item?.isLike) {
                onEventLikeClick(item?.id, 'unlike');
              } else {
                onEventLikeClick(item?.id, 'like');
              }
            }}
          >
            <Text style={eventstyle.dataitem}>{item?.totalLikeCount}</Text>
            <FastImage
              source={
                item?.isLike
                  ? require('../assets/images/NewIcons/like_selected.png')
                  : require('../assets/images/NewIcons/like.png')
              }
              style={eventstyle.iconimg}
            />
          </Pressable>
          <Pressable
            style={[eventstyle.iconbtn]}
            onPress={() => {
              onEventCommentClick(
                item?.id,
                item?.onlyAdminCommentOnly,
                item?.organizerId,
              );
            }}
          >
            <Text style={eventstyle.dataitem}>{item?.totalCommentCount}</Text>
            <FastImage
              source={require('../assets/images/icon/commentIcon.png')}
              style={eventstyle.iconimg}
            />
          </Pressable>
        </View>
        <View>
          <Pressable
            onPress={() => {
              AttendClub(item?.id);
            }}
            style={[
              eventstyle.readbtn,
              {
                backgroundColor: Color.white,
                borderWidth: 1,
                borderColor: Color.lightblue,
              },
            ]}
            disabled={isUserDeleted}
          >
            <Text style={eventstyle.Unreadtext}>
              {item?.status === -1
                ? 'Attend'
                : item?.status === 0
                ? 'Attending'
                : item?.status === 1
                ? 'Maybe Attending'
                : item?.status === 2
                ? 'Not Attending'
                : ''}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

export const eventstyle = StyleSheet.create({
  divider: {
    marginTop: dynamicSize(7),
    height: 1.5,
  },
  namedesign: {
    ...text.usernameboldtitle,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  iconbtn: {
    height: 30,
    // paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconimg: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    marginLeft: 3,
  },
  iconbtnrow: {
    flexDirection: 'row',
    // alignItems: 'center',
    flex: 1,
    // width: 60
  },

  mainrow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  width60: {
    width: '60%',
    // backgroundColor: 'red',
  },
  width40: {
    width: '40%',
    // backgroundColor: 'blue',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  iconrowtext: {
    fontSize: getFontSize(13),
    color: 'black',
    // lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    flex: 1,
  },
  gusesttext: {
    fontSize: getFontSize(15),
    color: 'black',
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    flex: 1,
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  iconcontainer: {
    width: dynamicSize(25),
    height: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  redcontainertext: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  redcontainer: {
    height: dynamicSize(15),
    width: '100%',
    fontSize: getFontSize(10),
    borderTopLeftRadius: 3,
    textAlign: 'center',
    borderTopRightRadius: 3,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.white,
    backgroundColor: Color.lightblue,
  },
  datetimecontainer: {
    height: dynamicSize(35),
    width: dynamicSize(45),
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 3,
    backgroundColor: Color.white,
    shadowColor: Color.gray,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
    marginTop: 3,
    marginBottom: 5,
  },
  datetime: {
    fontSize: getFontSize(10),
    color: Color.black0,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
    // marginBottom: 5,
  },
  readtext: {
    fontSize: getFontSize(13),
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(17),
  },
  Unreadtext: {
    fontSize: getFontSize(12),
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getFontSize(17),
  },
  readbtn: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 100,
    // position: 'absolute',
    // bottom: 0,
    // right: 0,
    borderWidth: 1,
    // backgroundColor: Color.lightblue,
    borderColor: Color.lightblue,
  },
  Unreadbtn: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 100,
    // position: 'absolute',
    // bottom: 0,
    // right: 0,
    borderWidth: 1,
    backgroundColor: Color.white,
    borderColor: Color.lightblue,
  },
  mr1: {
    marginRight: dynamicSize(10),
  },
  rightposition: {
    alignSelf: 'flex-end',
    // position: 'absolute',
    // right: 20,
    // bottom: dynamicSize(40),
  },
  clubicontext: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  clubsubtext: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datalable: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
    // flex:1,
    flexWrap: 'wrap',
  },
  dataitem: {
    // width: '30%',
    flexWrap: 'wrap',
    marginLeft: 4,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  rowcontainer: {
    flexDirection: 'row',
    width: 70,
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  rightbox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: dynamicSize(10),
  },
  box45: {
    // width: '65%',
    // backgroundColor:Color.red,
  },
  box40: {
    width: '38%',
  },
  box60: {
    width: '70%',
  },
  clubimgcontainer: {
    // marginBottom: dynamicSize(10),
    marginRight: dynamicSize(10),
  },
  clubprofileimg: {
    height: dynamicSize(40),
    width: dynamicSize(40),
    borderRadius: 100,
  },

  cardView: {
    backgroundColor: Color.white,
    marginBottom: dynamicSize(10),
    marginTop: 2,
    paddingHorizontal: dynamicSize(15),
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },

  /* end Trip Report */
});

export const CommunityinfoForum = memo(props => {
  const {
    item,
    onCardClick,
    onPresslike,
    isSended,
    showAll = false,
    onPressmessage,
    onPressshare,
    rbtnbackground,
    onPressinfobutton,
    onPressdownload,
    onPressAccept,
    onPressDecline,
    isProfile = false,
  } = props;
  const departureAddress = item?.DepartureAddress;
  const navigation = useNavigation();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState([]);
  const startDate = new Date(item?.startDate);
  startDate.setDate(startDate.getDate() + 6);

  const expiryDateVar = new Date(item?.expiryDate).getTime();
  const currentDate = new Date().getTime();
  const isExpired = expiryDateVar < currentDate;

  const [selectusersID, setselectusersID] = useState('');
  const [likeData, LikeData] = useState({});

  const getLikes = async () => {
    //const like = JSON.parse(await Trip.getTripLikes(item?.id));
    //setLikes(like);
  };

  useEffect(() => {
    getLikes();
  }, [item]);

  useEffect(() => {
    let flag = 0;
    likes.forEach(item => {
      if (item?.userLikeId == user?.id) {
        flag = 1;
        LikeData(item);
      }
    });
    if (flag == 0) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
    }
  }, [likes]);

  const destination = item?.Destination?.Address;
  const user = useSelector(state => state.auth.user);
  const fromAddress =
    (departureAddress?.Address1 ?? '') +
    ' ' +
    // (departureAddress?.address2 ?? '') +
    // ' ' +
    (departureAddress?.City ?? '') +
    ' ' +
    (departureAddress?.State ?? '') +
    ' ' +
    (departureAddress?.Country ?? '');
  const toAddress =
    (destination?.Address1 ?? '') +
    // ' ' +
    // (destination?.address2 ?? '') +
    ' ' +
    (destination?.City ?? '') +
    ' ' +
    (destination?.State ?? '') +
    ' ' +
    (destination?.Country ?? '');

  const isTripStarted =
    new Date(moment(item?.startDate).add(6, 'hours')).getTime() <
    new Date().getTime();

  if (isExpired && !isProfile) {
    return null;
  }

  return (
    <Pressable
      style={[CommunityinfoForumstyle.cardView]}
      onPress={() => {
        onCardClick && onCardClick({ ...item, isExpired });
      }}
    >
      <View
        pointerEvents="none"
        style={[CommunityinfoForumstyle.mapcontainer, { overflow: 'hidden' }]}
      >
        {item?.Destination?.Address?.DestinationLocationLat &&
          item?.Destination?.Address?.DestinationLocationLng && (
            <MapView
              key={item?.id?.toString()}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              zoomControlEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              initialRegion={{
                // ...item?.destination?.address?.destinationLocation,
                latitude: item?.Destination?.Address?.DestinationLocationLat,
                longitude: item?.Destination?.Address?.DestinationLocationLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={'standard'}
            >
              {item?.Destination?.Address?.DestinationLocationLat &&
                item?.Destination?.Address?.DestinationLocationLng && (
                  <Marker
                    // coordinate={item?.destination?.address?.destinationLocation}
                    coordinate={{
                      latitude:
                        item?.Destination?.Address?.DestinationLocationLat,
                      longitude:
                        item?.Destination?.Address?.DestinationLocationLng,
                    }}
                  />
                )}
            </MapView>
          )}
        <View style={CommunityinfoForumstyle.titlebuttoncontainer}>
          <Pressable style={CommunityinfoForumstyle.namebtn}>
            <Text style={CommunityinfoForumstyle.nametext} numberOfLines={1}>
              {item?.title ?? ''}
            </Text>
          </Pressable>
        </View>
      </View>
      <View>
        <View style={CommunityinfoForumstyle.row}>
          <Pressable
            onPress={() => {
              navigation.navigate('Profile', { userId: item?.Organizer?.id });
            }}
            style={CommunityinfoForumstyle.profileimgcontainer}
          >
            <FastImage
              // source={require('../assets/images/icon/Surfboard.jpg')}
              source={{
                uri: item?.organizer?.thumbnailProfileImage,
                cache: FastImage.cacheControl.immutable,
              }}
              // source={item.profileimage}
              style={CommunityinfoForumstyle.profileimg}
            />
          </Pressable>
          <View style={CommunityinfoForumstyle.profiletextcontainer}>
            <Text
              style={[
                CommunityinfoForumstyle.nametitle,
                CommunityinfoForumstyle.mt1,
              ]}
            >
              {/* {item?.Organizer?.FirstName + ' ' + item?.organizer?.LastName} */}
              {item?.description}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                CommunityinfoForumstyle.namesubtitle,
                CommunityinfoForumstyle.mt1,
              ]}
            >
              From:{' '}
              <Text style={CommunityinfoForumstyle.nametitle}>
                {fromAddress}
              </Text>
            </Text>
            <Text
              numberOfLines={1}
              style={CommunityinfoForumstyle.namesubtitle}
            >
              To:{' '}
              <Text style={CommunityinfoForumstyle.nametitle}>{toAddress}</Text>
            </Text>
          </View>
        </View>
        <View style={CommunityinfoForumstyle.iconrowcontainer}>
          <View style={CommunityinfoForumstyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/users.png')}
              resizeMode={'contain'}
              style={[
                CommunityinfoForumstyle.iconimg,
                { width: dynamicSize(20) },
              ]}
            />

            <Text style={CommunityinfoForumstyle.nametitle}>
              {item?.passengers?.length ?? 1}
            </Text>
          </View>
          <View style={CommunityinfoForumstyle.iconrow}>
            <FastImage
              source={require('../assets/images/NewIcons/ic_calendar_black.png')}
              style={CommunityinfoForumstyle.iconimg}
            />

            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                CommunityinfoForumstyle.nametitle,
                { marginRight: dynamicSize(10) },
              ]}
            >
              {item?.startDate
                ? moment(item?.startDate ?? '').format('DD/MM/YYYY')
                : ''}
            </Text>
          </View>
          <View
            style={[
              CommunityinfoForumstyle.iconrow,
              { justifyContent: 'flex-end' },
            ]}
          >
            <AntDesign
              name="clockcircle"
              color={'black'}
              size={dynamicSize(18)}
              style={{ marginRight: 7 }}
            />
            <Text style={CommunityinfoForumstyle.nametitle}>
              {item?.startDate
                ? moment(item?.startDate ?? '').format('HH:mm')
                : ''}
            </Text>
          </View>
        </View>

        <View style={[CommunityinfoForumstyle.row]}>
          <View style={[CommunityinfoForumstyle.box50, { width: undefined }]}>
            <View style={[CommunityinfoForumstyle.iconbtnrow]}>
              {likes?.length > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {likes?.length}
                </Text>
              )}
              <Pressable
                style={[CommunityinfoForumstyle.iconbtn]}
                onPress={async () => {
                  setIsLiked(data => !data);
                  try {
                    if (isLiked) {
                      // const data = await Trip.deleteTripLike(likeData?.id);
                      const data = await Trip.deleteTripLike(item?.id);
                    } else {
                      const data = await Trip.likeTrip(item?.id);
                    }
                    getLikes();
                  } catch (error) {
                    getLikes();
                  }
                }}
              >
                {/* <AntDesign name={isLiked ? 'like1' : 'like2'} color={'black'} size={20} /> */}
                <FastImage
                  source={
                    isLiked
                      ? require('../assets/images/NewIcons/like_selected.png')
                      : require('../assets/images/NewIcons/like.png')
                  }
                  style={CommunityinfoForumstyle.iconimg}
                />
              </Pressable>
              {(item?.commentCount ?? item?.tripCommentCount ?? 0) > 0 && (
                <Text
                  style={{
                    color: Color.black,
                    fontFamily: fontFamily.ProximaR,
                  }}
                >
                  {item?.commentCount ?? item?.tripCommentCount ?? 0}
                </Text>
              )}
              <Pressable
                style={CommunityinfoForumstyle.iconbtn}
                onPress={() => {
                  navigation.navigate('TripComments', { ...item });
                }}
              >
                <FastImage
                  source={require('../assets/images/icon/commentIcon.png')}
                  style={CommunityinfoForumstyle.iconimg}
                />
              </Pressable>

              {item?.isAdaptive && (
                <View
                  style={[
                    Communityinfostyle.iconbtn,
                    {
                      height: dynamicSize(23),
                      width: dynamicSize(23),
                      borderRadius: 15,
                    },
                  ]}
                >
                  <FastImage
                    source={require('../assets/images/icon/adaptive.png')}
                    resizeMode="contain"
                    style={{ height: '100%', width: '100%' }}
                  />
                </View>
              )}
              {/* surfadaptive.png */}
              {onPressdownload ? (
                <Pressable
                  style={CommunityinfoForumstyle.iconbtn}
                  onPress={onPressdownload}
                >
                  <FastImage
                    source={require('../assets/images/icon/downloadIcon.png')}
                    style={CommunityinfoForumstyle.iconimg}
                  />
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              flex: 1,
            }}
          >
            {isExpired ? (
              <View style={{}}>
                <View style={CommunityinfoForumstyle.buttoncontainer}>
                  <Pressable
                    style={[
                      Communityinfostyle.readbtn,
                      { backgroundColor: '#FF0000AA' },
                    ]}
                  >
                    <Text style={CommunityinfoForumstyle.readtext}>
                      EXPIRED
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                {onPressDecline && (
                  <View
                    style={[
                      {},
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      },
                    ]}
                  >
                    <View>
                      <Pressable
                        style={[
                          CommunityinfoForumstyle.readbtn,
                          {
                            backgroundColor: Color.white,
                            borderWidth: 1,
                            borderColor: Color.lightblue,
                          },
                        ]}
                        onPress={() => {
                          onPressDecline && onPressDecline();
                        }}
                      >
                        <Text
                          style={[
                            CommunityinfoForumstyle.readtext,
                            { color: Color.lightblue },
                          ]}
                        >
                          REJECT
                        </Text>
                      </Pressable>
                    </View>
                    <View style={{}}>
                      <Pressable
                        style={[
                          CommunityinfoForumstyle.readbtn,
                          { backgroundColor: Color.lightblue },
                        ]}
                        onPress={() => {
                          if (isTripStarted) {
                            alert(
                              'You can not join a trip 6 hours after a trip has started',
                            );
                          } else {
                            onPressAccept && onPressAccept();
                          }
                        }}
                      >
                        <Text style={CommunityinfoForumstyle.readtext}>
                          ACCEPT
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
                {onPressinfobutton ? (
                  isSended ? (
                    <View style={{}}>
                      <View style={CommunityinfoForumstyle.buttoncontainer}>
                        <Pressable
                          style={[
                            CommunityinfoForumstyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                        >
                          <Text style={CommunityinfoForumstyle.readtext}>
                            REQUESTED
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={{}}>
                      <View style={CommunityinfoForumstyle.buttoncontainer}>
                        <Pressable
                          style={[
                            CommunityinfoForumstyle.readbtn,
                            { backgroundColor: Color.lightblue },
                          ]}
                          onPress={() => {
                            onPressinfobutton && onPressinfobutton();
                          }}
                        >
                          <Text style={CommunityinfoForumstyle.readtext}>
                            JOIN
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )
                ) : (
                  <></>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const CommunityinfoForumstyle = StyleSheet.create({
  readtext: {
    fontSize: getFontSize(12),
    color: Color.white,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 22,
  },
  readbtn: {
    backgroundColor: Color.black,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3,
    borderRadius: 100,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  box50: {
    width: '49%',
  },
  iconrowcontainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 15,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderTopColor: Color.lightGray,
  },
  blank: {
    paddingVertical: dynamicSize(20),
  },
  mt1: {
    marginTop: 5,
  },
  mt2: {
    marginTop: 10,
  },
  titlebuttoncontainer: {
    paddingRight: 10,
  },
  nametitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  namesubtitle: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  profiletextcontainer: {
    width: '75%',
  },
  iconrow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
  profileimgcontainer: {
    width: '25%',
    height: dynamicSize(60),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    top: dynamicSize(-25),
  },
  profileimg: {
    width: dynamicSize(60),
    height: '100%',
    borderRadius: 100,
    backgroundColor: Color.gray,
  },
  nametext: {
    color: Color.white,
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
  },
  namebtn: {
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(5),
    backgroundColor: 'rgba(37,87,102,0.8)',
    alignItems: 'flex-start',
    minWidth: dynamicSize(70),
    alignItems: 'center',
    position: 'absolute',
    top: dynamicSize(10),
    left: dynamicSize(10),
    marginRight: dynamicSize(10),
    borderRadius: 100,
  },
  buttoncontainer: {
    paddingRight: 5,
    alignSelf: 'flex-end',
    marginVertical: 10,
  },
  mapcontainer: {
    height: dynamicSize(100),
    backgroundColor: Color.lightblue,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  iconbtn: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
  },
  iconbtnrow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  iconimg: {
    height: dynamicSize(18),
    width: dynamicSize(18),
    marginRight: dynamicSize(7),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  cardView: {
    backgroundColor: Color.white,
    // marginVertical: 5,
    marginBottom: dynamicSize(15),
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
});

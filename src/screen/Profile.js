import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Modal as Modal2,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { Divider, Switch, TextInput } from 'react-native-paper';
import { PhotoGrid } from 'react-native-photo-grid-frame';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import ProfileApi from '../api/Profile';
import Trip from '../api/Trip';
import { ImageButton, ShowButton, TableButton } from '../components/Buttons';
import { Communityinfo, TripReport } from '../components/CommunityItems';
import { Header } from '../components/Header';
import ImagePickerModal from '../components/ImagePickerModal';
import ListModal from '../components/ListModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  board,
  Color,
  fontFamily,
  getSkillLevels,
  keyboardType,
  Shadow,
  text,
  userSkillLevel,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import { styles as style2 } from '../screen/Community';
import Popover from 'react-native-popover-view';
import Entypo from 'react-native-vector-icons/Entypo';
import ReportModal from '../components/ReportModal';
import Blockreport from '../api/Blockreport';
import SuccessModal from '../components/SuccessModal';
import {
  ReportBlocknotification,
  Unblocknotification,
} from '../components/ReportBlocknotification';
import ForReportModal from '../components/ForReportModal';
import PreviewModal from '../components/PreviewModal';
import NetInfo from '@react-native-community/netinfo';
import FastImage from 'react-native-fast-image';

// UPDATED IMPORT - include new thunks
import {
  getProfile as getProfileThunk,
  getProfileImages as getProfileImagesThunk,
  getProfileTripReports as getProfileTripReportsThunk,
  getFriendList as getFriendListThunk,
  getSendedRequests as getSendedRequestsThunk,
  getReceivedRequest as getReceivedRequestThunk,
  getProfileClubs as getProfileClubsThunk,
  getProfileTrips,
  updateProfileTripPassengersLocal,
  updateProfileTripPassengers,
  resetProfile,
  resetProfileState, // NEW
} from '../store/profileSlice';
import ConnectionBanner from '../components/ConnectionBanner';
import SyncInfo from '../components/SyncStatus';
import StatusMessage from '../components/StatusMessage';
import {
  addPendingAction,
  getJoinRequestsFromDB,
  saveJoinRequests,
} from '../database/tripDbHelper';
import {
  acceptInviteAction,
  deleteInvitedIdTrip,
  getInviteeTripsIdsAction,
  rejectInviteAction,
  removeInviteeTripId,
} from '../store/tripSlice';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? require('react-native').Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

let pageNo = 1;
let isFetching = false;
let isDataLoaded = false;

let pageNoTrip = 1;
let isFetchingTrip = false;
let isDataLoadedTrip = false;

// NEW: Pagination for clubs
let pageNoClub = 1;
let isFetchingClub = false;
let isDataLoadedClub = false;

const Profile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId = '' } = route.params ?? {};
  const user = useSelector(state => state.auth.user);
  const isSelf = userId === user?.id;
  const [profileLoader, setProfileLoader] = useState(false);
  const [tripReportLodaer, setTripReportLodaer] = useState(false);
  const [profileImagesLoader, setProfileImagesLoader] = useState(false);
  const [tripLoader, setTripLoader] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const profileData = useSelector(state => state.profile.data);
  const isPreviousSame = profileData && userId == profileData?.id;
  const [ownVehical, setOwnVehical] = useState(null);
  const imagesData = useSelector(state => state.profile.images);
  const tripReports = useSelector(state => state.profile.tripReports);
  const friendList = useSelector(state => state.profile.friendList);
  const profileClubs = useSelector(state => state.profile.profileClubs);
  const allTrips = useSelector(state => state?.profile.profileTrips);
  const trips = allTrips;
  const [clubsLoader, setClubsLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, SetshowLoading] = useState(false);
  const [tripCount, setTripCount] = useState('');
  const [reporttext, setreporttext] = React.useState('');
  const [selcterror, setselcterror] = React.useState('');
  const [selectusersID, setselectusersID] = useState('');
  const [reportimagePreviewModal, setreportimagePreviewModal] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportselectusersID, setreportselectusersID] = useState('');
  const [isreportmodal, setisreportmodal] = useState(false);
  const [isreportmodalBlock, setisreportmodalBlock] = useState(false);
  const [reasonValue, setreasonValue] = useState('');
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [iserror, setIserror] = useState(false);
  const touchableRef = useRef();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const openPopover = () => {
    setPopoverVisible(true);
  };
  const closePopover = () => {
    setPopoverVisible(false);
  };

  const sendedRequestsIds = useSelector(
    state => state.profile.sendedRequestsIds,
  );
  const originalFriendListIds = useSelector(
    state => state.profile.originalFriendListIds,
  );
  const receivedRequestsIds = useSelector(
    state => state.profile.receivedRequestsIds,
  );
  const [editAboutMe, setEditAboutMe] = useState(false);
  const [aboutMeText, setAboutMeText] = useState('');
  const [isModalboardsize, setisModalboardsize] = useState();
  const currentImage = useRef(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [skillLevelModal, setSkillLevelModal] = useState(false);
  const dispatch = useDispatch();
  const lastSyncTime = useSelector(state => state.profile?.lastSyncTime);
  const [selection, setSelection] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendListLoader, setFriendListLoader] = useState(false);
  const [friendStatus, setFriendStatus] = useState(null);
  const isInvite = useRef(false);
  const currentItem = useRef(null);
  const inviteIdList = useSelector(state => state.trip?.inviteeTripIds);
  const [joiinedList, setJoiinedList] = useState([]);
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [galleryImagePickerModa, setGalleryImagePickerModa] = useState(false);
  const [invitesListWithId, setInvitesListWithId] = useState([]);
  const [reasonList, setreasonList] = useState([]);
  const [selectImageID, setselectImageID] = useState('');
  const [selectImageType, setselectImageType] = useState('');
  const [userblockOrUnblock, setuserblockOrUnblock] = useState(false);
  const [isreportVisible, setisreportVisible] = useState(false);
  const [isUnblockVisible, setisUnblockVisible] = useState(false);
  const [reportVisibletext, setreportVisibletext] = useState('');
  const [bottomLodaer, setBottomLodaer] = useState(false);

  const getInvitedTrips = async () => {
    dispatch(getInviteeTripsIdsAction(user?.id));
  };

  const acceptInvite = async (id, isDriver) => {
    const item = inviteIdList?.find(
      i => i?.tripId?.toString() == id?.toString(),
    );
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'ACCEPT_INVITE',
        entityId: item,
        payload: { item, tripId: id, isDriver, userId: user?.id },
        timestamp: new Date().toISOString(),
      });

      dispatch(removeInviteeTripId(id));
      dispatch(updateProfileTripPassengers(id, user));
      dispatch(deleteInvitedIdTrip(id, user));
      dispatch(updateProfileTripPassengersLocal(id, user));
      return;
    }

    try {
      setIsLoading(true);

      if (item) {
        await Trip.acceptInviteInvite(item?.inviteId, isDriver);
      }
      dispatch(removeInviteeTripId(id));
      dispatch(updateProfileTripPassengers(id, user));
      dispatch(deleteInvitedIdTrip(id, user));
      dispatch(updateProfileTripPassengersLocal(id, user));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
      }
    }
  };

  const rejectInvite = async id => {
    const item = inviteIdList?.find(
      i => i?.tripId?.toString() == id?.toString(),
    );
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'REJECT_INVITE',
        entityId: item?.inviteId,
        payload: { inviteId: item?.inviteId, userId: user?.id },
        timestamp: new Date().toISOString(),
      });
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      return;
    }

    try {
      setIsLoading(true);
      if (item) {
        await Trip.rejectInviteInvite(item?.inviteId);
      }
      dispatch(removeInviteeTripId(id));
      dispatch(deleteInvitedIdTrip(id, user));
      setIsLoading(false);
    } catch (error) {
      if (error?.toString()?.toLowerCase()?.trim() !== 'network error') {
        alert(error?.toString());
      }
      setIsLoading(false);
    }
  };

  const onToggleSwitch = async () => {
    setOwnVehical(ownVehical == null ? !profileData?.carOwner : p => !p);
  };

  const backButtonClick = () => {
    navigation.goBack();
  };

  const goToEditabout = () => {
    setAboutMeText(profileData?.aboutMe ?? '');
    setEditAboutMe(true);
  };

  const GotoTripReport = item => {
    navigation.navigate('TripReport', { item });
  };

  const getFriendsList = () => {
    setFriendListLoader(true);
    dispatch(
      getFriendListThunk(userId, () => {
        setFriendListLoader(false);
      }),
    );
    dispatch(getFriendListThunk(user?.id, () => {}, true));
  };

  useEffect(() => {
    if (!isPreviousSame) {
      dispatch(resetProfileState());
    }
    getFriendStatus();
    setselcterror('');
    setreasonValue('');
    getProfile();
    getProfileImages();
    checkblockornot();
    GetuserReason();
    getmyTrips(true);
    getTripReports();
    getFriendsList();
    getSendedRequests();
    getReceivedRequests();
    getInvitedTrips();
    getJoinedTrips();
    getProfileClubsData(true);
  }, [userId]);

  useEffect(() => {
    // checkblockornot();
    // checkUserTripCount();
    const unsubscribe = navigation.addListener('focus', () => {
      getmyTrips(true);
      getTripReports();
      checkblockornot();
      checkUserTripCount();
    });
    return unsubscribe;
  }, []);

  const GotoClubProfile = clubid => {
    if (clubid !== null && clubid !== '' && clubid !== undefined) {
      navigation.navigate('ClubProfile', { clubid, Selection: 1 });
    }
  };

  const checkUserTripCount = async () => {
    if (user !== null && userId !== null) {
      let checkTripCount = await Blockreport.checkusertripcount(userId);
      if (checkTripCount >= 0) {
        setTripCount(checkTripCount);
      } else {
        setTripCount('0');
      }
    }
  };

  const sendInvite = async (id, isDriver) => {
    if (!currentNetworkStatus) {
      await addPendingAction({
        actionType: 'SEND_INVITE',
        entityId: id,
        payload: { isDriver },
        module: 'trip',
        timestamp: new Date().toISOString(),
      });
      setJoiinedList(prev => [...prev, Number(id)]);
      return;
    }

    SetshowLoading(true);
    try {
      const param = { tripId: id, isDriver };
      await Trip.sendJoin(param);
      getJoinedTrips();
      getInvitedTrips();
    } catch (error) {
      alert(error?.detail?.toString());
    } finally {
      SetshowLoading(false);
    }
  };

  const getJoinedTrips = async () => {
    try {
      const cachedRequests = await getJoinRequestsFromDB(user?.id);
      const temp = cachedRequests
        .filter(item => item.status === 0)
        .map(item => Number(item.trip?.id));
      setJoiinedList(temp);

      if (currentNetworkStatus) {
        const trips = JSON.parse(await Trip.getJoins(user?.id));
        await saveJoinRequests(user?.id, trips);
        const tempOnline = trips
          .filter(item => item.status === 0)
          .map(item => item.trip?.id);
        setJoiinedList(tempOnline);
      }
    } catch (error) {}
  };

  const getFriendStatus = async () => {
    if (isSelf) {
      return;
    }
    try {
      const data = JSON.parse(
        await ProfileApi.getFriendStatus(user?.id, userId),
      );
      setFriendStatus(data?.status ?? null);
    } catch (error) {}
  };

  const getTripReports = () => {
    setTripReportLodaer(true);
    dispatch(
      getProfileTripReportsThunk(userId, () => {
        setTripReportLodaer(false);
      }),
    );
  };

  const getSendedRequests = () => {
    dispatch(getSendedRequestsThunk(user?.id, () => {}));
  };

  const getReceivedRequests = () => {
    dispatch(getReceivedRequestThunk(user?.id, () => {}));
  };

  const getProfile = () => {
    setProfileLoader(true);
    dispatch(
      getProfileThunk(
        userId,
        () => {
          setProfileLoader(false);
        },
        isSelf,
      ),
    );
  };

  const GetuserReason = async () => {
    try {
      if (user !== null && userId !== null) {
        let ResonList = await Blockreport.getuserReason();
        if (ResonList !== null && ResonList?.length > 0) {
          const unique = await [
            ...new Set(JSON.parse(ResonList)?.map(item => item.name)),
          ];
          setreasonList(unique);
        } else {
          setreasonList([]);
        }
      }
    } catch (error) {}
  };

  const getProfileImages = () => {
    setProfileImagesLoader(true);
    dispatch(
      getProfileImagesThunk(userId, () => {
        setProfileImagesLoader(false);
      }),
    );
  };

  const getmyTrips = (isRefresh, isBottom) => {
    if (isBottom) {
      setBottomLodaer(true);
    } else if (isRefresh) {
      isDataLoadedTrip = false;
      pageNoTrip = 1;
      setTripLoader(true);
    }
    isFetchingTrip = true;
    dispatch(
      getProfileTrips(userId, pageNoTrip, 10, (status, isEnded, start) => {
        setTripLoader(false);
        setBottomLodaer(false);
        isFetchingTrip = false;
        if (isEnded && status) {
          isDataLoadedTrip = true;
        }
      }),
    );
  };

  const GotoTripDetail = item => {
    navigation.navigate('TripDetail', { ...item, showAll: isSelf });
  };

  const checkblockornot = async () => {
    if (user !== null && userId !== null) {
      let check = await Blockreport.checkblockuser('allgscmember', userId);
      setuserblockOrUnblock(check);
    }
  };

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
          TargetType:
            selectImageType === 'reportimage'
              ? 'tripreportimage'
              : selectImageType === 'galleryimage'
              ? 'gallery'
              : selectImageType,
          RecordType: 'report',
        };

        const retval = await Blockreport.createblockreport(
          JSON.stringify(data),
        );

        if (retval !== null) {
          if (retval?.id > 0) {
            setselectImageID('');
            setselectImageType('');
            setDeleteModal(false);
            setSuccessDescription('reported successfully');
            setTimeout(
              () => {
                setSuccess(true);
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
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
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };

  const blockreport = async () => {
    if (user !== null && user !== '') {
      if (
        reporttext !== null &&
        reporttext !== '' &&
        reporttext !== undefined
      ) {
        if (userId !== null && userId !== '' && userId !== undefined) {
          let check = false;
          if (check === false || check === 'false') {
            const data = {
              SenderUserId: user.id,
              TargetId: userId,
              TargetType: 'allgscmember',
              RecordType: 'report',
              userComment: reporttext,
            };

            const retval = await Blockreport.createblockreport(
              JSON.stringify(data),
            );

            if (retval !== null) {
              if (retval?.id > 0) {
                setreasonValue('');
                setselcterror('');
                setselectusersID('');
                setreporttext('');
                setisreportmodal(false);
                closePopover();
                setSuccessDescription('reported successfully');
                setTimeout(
                  () => {
                    setSuccess(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
              } else {
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
          }
        }
      } else {
        if (reasonValue === 'Other' || reasonValue === 'other') {
          setselcterror('Please Type Other Reason');
        } else {
          setselcterror('Please Select Reason');
        }
      }
    }
  };

  const blockreportBlock = async (
    targetId,
    targetType,
    recordType,
    userMessage,
  ) => {
    if (user !== null && user !== '') {
      if (targetId !== null && targetId !== '' && targetId !== undefined) {
        let check = false;

        if (check === false || check === 'false') {
          const data = {
            SenderUserId: user.id,
            TargetId: targetId,
            TargetType: targetType,
            RecordType: recordType,
            userComment: reporttext,
          };
          const retval = await Blockreport.createblockreport(
            JSON.stringify(data),
          );
          if (retval !== null) {
            if (retval?.id > 0) {
              setselectusersID('');
              closePopover();
              setisreportmodalBlock(false);
              await checkblockornot();
              setSuccessDescription(userMessage + ' successfully');
              setTimeout(
                () => {
                  setSuccess(true);
                },
                Platform.OS === 'ios' ? 300 : 0,
              );
            } else {
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
          if (check === true || check === 'true') {
            Alert.alert(
              'Alert',
              'User is already blocked. Are you want to un' + userMessage + '?',
              [
                {
                  text: 'No',
                  onPress: async () => {
                    setselectusersID('');
                    closePopover();
                  },
                },
                {
                  text: 'Yes',
                  style: 'destructive',
                  onPress: async () => {
                    let response = await Blockreport.unblockkuser(
                      targetType,
                      userId,
                    );

                    if (response !== null) {
                      if (response === true || response === 'true') {
                        await checkblockornot();
                        let usermessagenew = 'Unblocked successfully';
                        setisreportVisible(true);
                        setreportVisibletext(usermessagenew);
                        setselectusersID('');
                        closePopover();
                      } else {
                        let usermessagenew = 'Unblocked not successfully';
                        setisreportVisible(true);
                        setreportVisibletext(usermessagenew);
                      }
                    }
                  },
                },
              ],
            );
          } else {
            Alert.alert(check);
          }
        }
      } else {
        Alert.alert('Targetid null AllGSCMember Chat Pag');
      }
    }
  };

  const reportandBlock = async () => {
    if (user !== null && user !== '') {
      if (
        reporttext !== null &&
        reporttext !== '' &&
        reporttext !== undefined
      ) {
        if (userId !== null && userId !== '' && userId !== undefined) {
          let check = false;
          if (check === false || check === 'false') {
            const data = {
              SenderUserId: user.id,
              TargetId: userId,
              TargetType: 'allgscmember',
              RecordType: 'blockreport',
              userComment: reporttext,
            };
            const retval = await Blockreport.createblockreport(
              JSON.stringify(data),
            );
            if (retval !== null) {
              if (retval?.id > 0) {
                setreasonValue('');
                setselcterror('');
                setselectusersID('');
                closePopover();
                checkblockornot();
                setreporttext('');
                setisreportmodalBlock(false);
                setSuccessDescription('blocked & reported successfully');
                setTimeout(
                  () => {
                    setSuccess(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
              } else {
                setSuccessDescription('blocked & reported not successfully');
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
            if (check === true || check === 'true') {
              setisreportmodalBlock(false);
              Alert.alert(
                'Alert',
                'User is already blocked. Are you want to Unblocked & Reported ?',
                [
                  {
                    text: 'No',
                    onPress: async () => {
                      setselectusersID('');
                      closePopover();
                    },
                  },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                      let response = await Blockreport.unblockkuser(
                        'allgscmember',
                        userId,
                      );

                      if (response !== null) {
                        if (response === true || response === 'true') {
                          await checkblockornot();
                          let usermessagenew = 'Unblocked successfully';
                          setisreportVisible(true);
                          setreportVisibletext(usermessagenew);
                          setselectusersID('');
                          closePopover();
                        } else {
                          let usermessagenew = 'Unblocked not successfully';
                          setisreportVisible(true);
                          setreportVisibletext(usermessagenew);
                        }
                      }
                    },
                  },
                ],
              );
            } else {
              Alert.alert(check);
            }
          }
        }
      } else {
        if (reasonValue === 'Other' || reasonValue === 'other') {
          setselcterror('Please Type Other Reason');
        } else {
          setselcterror('Please Select Reason');
        }
      }
    }
  };

  const UserUnBlock = async () => {
    Alert.alert('Alert', 'Are you sure you want to unblock this user?', [
      {
        text: 'No',
        onPress: async () => {},
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          if (user !== null && user !== '') {
            const retval = await Blockreport.unblockkuser(
              'allgscmember',
              userId,
            );

            if (retval !== null) {
              if (retval === true || retval === 'true') {
                await checkblockornot();
                setisUnblockVisible(false);
                setisreportVisible(true);
                setTimeout(
                  () => {
                    setSuccess(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                setSuccessDescription('unblocked successfully');
              } else {
                setisUnblockVisible(false);
                setisreportmodalBlock(false);
                setTimeout(
                  () => {
                    setSuccess(true);
                    setIserror(true);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                setSuccessDescription('unblocked not successfully');
              }
            }
          }
        },
      },
    ]);
  };

  const selectReason = e => {
    if (e > -1) {
      setreporttext('');
      setselcterror('');
      let selectname = reasonList[e];
      setreasonValue(selectname);

      if (selectname === 'Other' || selectname === 'other') {
        setreporttext('');
      } else {
        setreporttext(selectname);
      }
    }
  };

  const Reportmodalopen = async () => {
    closePopover();
    setreasonValue('');
    setselcterror('');
    setTimeout(
      () => {
        setisreportmodal(true);
      },
      Platform.OS === 'ios' ? 900 : 0,
    );
  };

  const BlockReportmodalopen = async () => {
    closePopover();
    setreasonValue('');
    setselcterror('');
    setTimeout(
      () => {
        setisreportmodalBlock(true);
      },
      Platform.OS === 'ios' ? 900 : 0,
    );
  };

  const getProfileClubsData = async (isRefresh, isBottom) => {
    if (isBottom) {
      setBottomLodaer(true);
    } else if (isRefresh) {
      isDataLoadedClub = false;
      pageNoClub = 1;
      setClubsLoader(true);
    }
    isFetchingClub = true;

    dispatch(
      getProfileClubsThunk(userId, pageNoClub, 10, (success, isEnded) => {
        setClubsLoader(false);
        setBottomLodaer(false);
        isFetchingClub = false;
        if (isEnded && success) {
          isDataLoadedClub = true;
        }
      }),
    );
  };

  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const onRefreshByTab = () => {
    getFriendStatus();
    if (selection === 1) {
      getProfileImages();
    } else if (selection === 2) {
      getmyTrips(true);
    } else if (selection === 3) {
      getTripReports();
    } else if (selection === 4) {
      getFriendsList();
    } else if (selection === 5) {
      getProfileClubsData(true);
    } else if (selection === 6) {
      getProfile();
    } else {
      getProfile();
    }
  };

  const getLoaderForSelection = () => {
    switch (selection) {
      case 1:
        return (
          (imagesData?.length == 0 && profileImagesLoader) ||
          (!profileData && profileLoader)
        );
      case 2:
        return trips?.length == 0 && tripLoader;
      case 3:
        return tripReports?.length == 0 && tripReportLodaer;
      case 4:
        return friendList?.length == 0 && friendListLoader;
      case 5:
        return profileClubs?.length == 0 && clubsLoader;
      case 6:
        return !profileData && profileLoader;
      default:
        return !profileData && profileLoader;
    }
  };

  const isRefreshingForSelection = () => {
    switch (selection) {
      case 1:
        return (
          (imagesData?.length == 0 && profileImagesLoader) ||
          (!profileData && profileLoader)
        );
      case 2:
        return trips?.length == 0 && tripLoader;
      case 3:
        return tripReports?.length == 0 && tripReportLodaer;
      case 4:
        return friendList?.length == 0 && friendListLoader;
      case 5:
        return profileClubs?.length == 0 && clubsLoader;
      case 6:
        return !profileData && profileLoader;
      default:
        return false;
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        onRefreshByTab();
      }
    });
    return () => unsubscribe();
  }, [currentNetworkStatus, userId]);

  const gradientStop =
    scrollContentHeight > 0 ? 600 / scrollContentHeight : 0.2; // fallback

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        iconRight={require('../assets/images/icon/chatting.png')}
        iconRight1={require('../assets/images/icon/bell1.png')}
        iconRight2={require('../assets/images/icon/home.png')}
        onPressLeft={backButtonClick}
        title={'Profile'}
        textAlign={'center'}
      />
      <Loader removeModal visible={getLoaderForSelection() || isLoading} />
      {!currentNetworkStatus && (
        <View>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSyncTime && !showLoading && currentNetworkStatus && (
        <View>
          <SyncInfo
            lastSyncTime={lastSyncTime}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          setSuccessDescription('');
        }}
        description={successdescription}
        iserror={iserror}
      />
      <ScrollView
        onContentSizeChange={(width, height) => {
          setScrollContentHeight(height);
        }}
        bounces={true}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              onRefreshByTab();
            }}
            refreshing={isRefreshingForSelection()}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            if (selection === 6) {
              if (!isFetching && !isDataLoaded) {
                pageNo += 1;
              }
            }
            if (selection === 2) {
              if (!isFetchingTrip && !isDataLoadedTrip) {
                pageNoTrip += 1;
                getmyTrips(false, true);
              }
            }
          }
        }}
        alwaysBounceVertical={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={[styles.viewContainer, { flex: 1 }]}>
          {!isSelf && (
            <>
              <TouchableOpacity
                ref={touchableRef}
                onPress={() => {
                  openPopover();
                  setselectusersID(userId);
                }}
                style={{
                  height: 40,
                  width: 40,
                  backgroundColor: Color.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 100,
                  ...Shadow.boxShadow,
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  zIndex: 999,
                }}
              >
                <Entypo
                  name="dots-three-vertical"
                  color={'black'}
                  size={dynamicSize(18)}
                />
              </TouchableOpacity>
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
                      Reportmodalopen();
                      // setisreportmodal(true);
                    }}
                  >
                    <Text style={styles.popupitemtext}>Report</Text>
                  </TouchableOpacity>
                  {userblockOrUnblock === true ||
                  userblockOrUnblock === 'true' ? (
                    <TouchableOpacity
                      style={styles.popupitem}
                      onPress={e => {
                        closePopover();
                        UserUnBlock();
                      }}
                    >
                      <Text style={styles.popupitemtext}>Unblock</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.popupitem}
                      onPress={e => {
                        blockreportBlock(
                          userId,
                          'allgscmember',
                          'block',
                          'Blocked',
                        );
                      }}
                    >
                      <Text style={styles.popupitemtext}>Block</Text>
                    </TouchableOpacity>
                  )}
                  {userblockOrUnblock === false ||
                  userblockOrUnblock === 'false' ? (
                    <TouchableOpacity
                      style={styles.popupitem}
                      onPress={() => {
                        BlockReportmodalopen();
                      }}
                    >
                      <Text style={styles.popupitemtext}>Block & Report</Text>
                    </TouchableOpacity>
                  ) : (
                    <></>
                  )}
                </View>
              </Popover>
            </>
          )}
          <View
            style={[
              styles.profileContainer,
              { marginTop: lastSyncTime || currentNetworkStatus ? 5 : 20 },
            ]}
          >
            <View>
              <View style={styles.profileimgmain}>
                {profileData?.thumbnailProfileImage ? (
                  <FastImage
                    style={styles.profileImage}
                    source={{
                      uri: profileData?.thumbnailProfileImage,
                      cache: FastImage.cacheControl.immutable,
                    }}
                  />
                ) : (
                  <FastImage
                    style={[styles.profileImage, { height: 50, width: 50 }]}
                    source={require('../assets/images/icon/profile-user.png')}
                  />
                )}
              </View>
              {isSelf && (
                <View style={styles.Iconbg}>
                  <TouchableOpacity
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => {
                      setImagePickerModal(true);
                    }}
                    disabled={!currentNetworkStatus}
                  >
                    <Ionicons name="camera" size={20} color={Color.white} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.name}>
              {(profileData?.firstName ?? '') +
                ' ' +
                (profileData?.lastName ?? '')}
            </Text>
            <Text style={styles.address}>
              {(profileData?.city ?? profileData?.state
                ? (profileData?.city ?? profileData?.state) + ', '
                : '') + (profileData?.country ?? '')}
            </Text>
            <View style={styles.InlineButton}>
              <ShowButton
                title={`Trips ${tripCount}`}
                backgroundColor="white"
              />
              <ShowButton
                title={`Report ${tripReports?.length}`}
                backgroundColor="white"
              />
              <ShowButton
                title={`Result ${tripCount * 5 + tripReports?.length * 5}`}
                backgroundColor="white"
              />
            </View>
            <Text style={styles.passenger}>
              {userSkillLevel[profileData?.surferSkillLevel ?? 0] +
                ', ' +
                (profileData?.carOwner ? 'Driver' : 'Passenger')}
            </Text>
            <View style={styles.InlineButton}>
              {!isSelf && (
                <>
                  <ImageButton
                    title="Message"
                    onPress={() => {
                      navigation.navigate('PersonalChat', {
                        oppUserId: userId,
                      });
                    }}
                    icon={require('../assets/images/icon/message.png')}
                    backgroundColor={Color.lightblue}
                    color="white"
                  />

                  {friendStatus == 'friend' || friendStatus == 'requested' ? (
                    <ImageButton
                      title={
                        friendStatus == 'requested' ? 'Requested' : 'Friends'
                      }
                      icon={require('../assets/images/icon/right2.png')}
                      backgroundColor={Color.green}
                      color="white"
                      onPress={() => {
                        Alert.alert(
                          'Friends',
                          friendStatus == 'requested'
                            ? //  'Are you sure to delete friend request'
                              `Are you sure to delete ${profileData?.firstName}'s friend request`
                            : `Are you sure you want to remove ${profileData?.firstName} as a friend?`,
                          [
                            {
                              text: 'No',
                              onPress: () => {},
                              style: 'cancel',
                            },
                            {
                              text: 'Yes',
                              onPress: async () => {
                                try {
                                  const data = await ProfileApi.deleteFriend(
                                    user?.id,
                                    userId,
                                  );
                                } catch (error) {
                                  alert(error.toString());
                                }
                                getFriendStatus();
                                getFriendsList();
                              },
                              style: 'destructive',
                            },
                          ],
                        );
                      }}
                    />
                  ) : friendStatus == 'received' ? (
                    <ImageButton
                      title={'Accept Request'}
                      icon={require('../assets/images/icon/addFriendIcon.png')}
                      backgroundColor={Color.green}
                      color="white"
                      onPress={async () => {
                        try {
                          const data = await ProfileApi.acceptFriendRequest(
                            userId,
                            user?.id,
                          );
                        } catch (error) {
                          alert(error.toString());
                        }
                        getFriendStatus();
                        getFriendsList();
                      }}
                    />
                  ) : (
                    <ImageButton
                      title={'Add Friend'}
                      icon={require('../assets/images/icon/addFriendIcon.png')}
                      backgroundColor={Color.lightblue}
                      color="white"
                      onPress={async () => {
                        try {
                          const data = await ProfileApi.sendFriendRequest(
                            user?.id,
                            userId,
                          );
                        } catch (error) {
                          alert(error.toString());
                        }
                        getFriendsList();
                        getFriendStatus();
                      }}
                    />
                  )}
                </>
              )}
            </View>
          </View>
          <LinearGradient
            locations={[0, gradientStop]}
            colors={['#fff', '#1CB4CE']}
            style={{ paddingBottom: getBottomSpace() }}
          >
            <ImageBackground
              source={require('../assets/images/icon/profileBG.png')}
              imageStyle={{ resizeMode: 'stretch', height: 600 }}
              style={styles.backgroundImage}
            >
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  style={{ paddingTop: 20 }}
                >
                  <View style={styles.btnGroup}>
                    <Pressable
                      style={[
                        styles.btn,
                        selection === 1
                          ? { backgroundColor: Color.lightblue }
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
                        Gallery
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.btn,
                        selection === 2
                          ? { backgroundColor: Color.lightblue }
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
                        Trips
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.btn,
                        selection === 3
                          ? { backgroundColor: Color.lightblue }
                          : null,
                      ]}
                      onPress={() => setSelection(3)}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          selection === 3 ? { color: 'white' } : null,
                        ]}
                      >
                        Reports
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.btn,
                        selection === 4
                          ? { backgroundColor: Color.lightblue }
                          : null,
                      ]}
                      onPress={() => setSelection(4)}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          selection === 4 ? { color: 'white' } : null,
                        ]}
                      >
                        Friend
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.btn,
                        selection === 5
                          ? { backgroundColor: Color.lightblue }
                          : null,
                      ]}
                      onPress={() => {
                        // alert('Comming Soon');
                        setSelection(5);
                      }}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          selection === 5 ? { color: 'white' } : null,
                        ]}
                      >
                        Clubs
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.btn,
                        selection === 6
                          ? { backgroundColor: Color.lightblue }
                          : null,
                      ]}
                      onPress={() => setSelection(6)}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          selection === 6 ? { color: 'white' } : null,
                        ]}
                      >
                        About
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
              <View>
                {selection === 1 && (
                  <View
                    // key={selection.toString()}
                    style={{ minHeight: 500 }}
                  >
                    {isSelf && (
                      <Pressable
                        style={[styles.galleryimgcontainer]}
                        onPress={async () => {
                          setGalleryImagePickerModa(true);
                        }}
                        disabled={!currentNetworkStatus}
                      >
                        <FastImage
                          style={styles.icon}
                          source={require('../assets/images/icon/galleryCamera.png')}
                          tintColor={Color.white}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    <View>
                      {imagesData?.length == 0 ? (
                        !profileLoader && (
                          <StatusMessage
                            isOnline={currentNetworkStatus}
                            hasData={imagesData?.length > 0}
                            color={Color.white}
                            title={'No Images Available'}
                          />
                        )
                      ) : (
                        <PhotoGrid
                          Loginuser={user.id}
                          isSelf={isSelf}
                          onPressDot={url => {
                            const deleteItem = imagesData?.find(
                              item => item?.imageUrl == url,
                            );

                            setselectImageID(deleteItem.id);
                            setselectImageType(deleteItem.imageType);
                            setDeleteModal(true);
                            currentImage.current = deleteItem;
                          }}
                          PhotosList={imagesData}
                          borderRadius={10}
                          ClubId={'-999'}
                        />
                      )}
                    </View>
                  </View>
                )}
                {selection === 2 && (
                  <View
                    // key={selection.toString()}
                    style={{ minHeight: 500 }}
                  >
                    <View>
                      <FlatList
                        horizontal={false}
                        data={trips}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatlist}
                        ListFooterComponent={() => {
                          if (bottomLodaer) {
                            return (
                              <View
                                style={{
                                  height: dynamicSize(50),
                                  width: '100%',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <ActivityIndicator color={Color.black0} />
                              </View>
                            );
                          } else {
                            return null;
                          }
                        }}
                        renderItem={({ item, index }) => {
                          const passengerList =
                            item?.passengers?.map(
                              item => item?.passenger?.id,
                            ) ?? [];
                          const isJoined = passengerList.includes(user?.id);
                          if (isJoined || item?.organizer?.id == user?.id) {
                            return (
                              <Communityinfo
                                onCardClick={GotoTripDetail}
                                marginHorizontal={5}
                                item={item}
                                key={index}
                                isProfile
                              />
                            );
                          }
                          const isGotInvite = inviteIdList?.find(
                            i =>
                              i?.tripId?.toString() ==
                              (item?.id?.toString() ||
                                item?.tripId?.toString()),
                          );
                          if (isGotInvite) {
                            return (
                              <Communityinfo
                                onPressAccept={() => {
                                  if (user?.carOwner) {
                                    currentItem.current = item;
                                    isInvite.current = true;
                                    setModalVisible(true);
                                  } else {
                                    acceptInvite(inviteIdList[item?.id], false);
                                  }
                                }}
                                onPressDecline={() => {
                                  rejectInvite(item?.id);
                                }}
                                onCardClick={GotoTripDetail}
                                marginHorizontal={5}
                                isProfile
                                item={item}
                                key={index}
                              />
                            );
                          }
                          if (item?.isPublic) {
                            return (
                              <Communityinfo
                                onCardClick={GotoTripDetail}
                                marginHorizontal={5}
                                isProfile
                                item={item}
                                onPressinfobutton={() => {
                                  if (user?.carOwner) {
                                    currentItem.current = item;
                                    isInvite.current = false;
                                    setModalVisible(true);
                                  } else {
                                    sendInvite(item?.id, false);
                                  }
                                }}
                                isSended={joiinedList?.includes(
                                  Number(item?.id),
                                )}
                                key={index}
                              />
                            );
                          } else {
                            return null;
                          }
                        }}
                        keyExtractor={({ item }, index) => index.toString()}
                        ListEmptyComponent={() => (
                          // <Text
                          //   style={[
                          //     styles.friendname,
                          //     {
                          //       alignSelf: 'center',
                          //       marginTop: dynamicSize(15),
                          //       color: Color.white,
                          //     },
                          //   ]}
                          // >
                          //   No Trips Available
                          // </Text>
                          <StatusMessage
                            isOnline={currentNetworkStatus}
                            hasData={trips?.length > 0}
                            color={Color.white}
                            title={'No Trips Available'}
                          />
                        )}
                      />
                    </View>
                  </View>
                )}
                {selection === 3 && (
                  <View
                    // key={selection.toString()}
                    style={{ minHeight: 500 }}
                  >
                    <FlatList
                      horizontal={false}
                      data={tripReports}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.flatlist}
                      renderItem={({ item, index }) => (
                        <TripReport
                          onPressreportImage={() => {
                            setreportimagePreviewModal(true);
                            setReportUrl(item?.images[0]?.imageUrl);
                            setreportselectusersID(item?.id);
                          }}
                          onPressRead={() => {
                            GotoTripReport(item);
                          }}
                          item={item}
                          key={index}
                        />
                      )}
                      ListEmptyComponent={() => (
                        // <Text
                        //   style={[
                        //     styles.friendname,
                        //     {
                        //       alignSelf: 'center',
                        //       marginTop: dynamicSize(15),
                        //       color: Color.white,
                        //     },
                        //   ]}
                        // >
                        //   No Reports Available
                        // </Text>
                        <StatusMessage
                          isOnline={currentNetworkStatus}
                          hasData={tripReports?.length > 0}
                          color={Color.white}
                          title={'No Reports Available'}
                        />
                      )}
                      keyExtractor={({ item }, index) => index.toString()}
                    />
                  </View>
                )}
                {selection === 4 && (
                  <View
                    // key={selection.toString()}
                    style={{ minHeight: 500 }}
                  >
                    {friendList?.length == 0 ? (
                      // <Text
                      //   style={[
                      //     styles.friendname,
                      //     {
                      //       alignSelf: 'center',
                      //       marginTop: dynamicSize(15),
                      //       color: Color.white,
                      //     },
                      //   ]}
                      // >
                      //   No Friends Available
                      // </Text>
                      <StatusMessage
                        isOnline={currentNetworkStatus}
                        hasData={friendList?.length > 0}
                        color={Color.white}
                        title={'No Friends Available'}
                      />
                    ) : (
                      <View style={styles.friendsection}>
                        {friendList?.map((item, i) => {
                          const isUserDeleted =
                            Array.isArray(user?.inActiveUsers) &&
                            user.inActiveUsers.some(
                              id => String(id) === String(item?.id),
                            );
                          const isUserSelf = item?.id == user?.id;
                          const isFriend = originalFriendListIds?.includes(
                            item?.id,
                          );
                          const isSent = receivedRequestsIds?.includes(
                            item?.id,
                          );
                          const isRequested = sendedRequestsIds?.includes(
                            item?.id,
                          );
                          return (
                            <View key={i} style={styles.friendcontainer}>
                              <View style={[styles.row, { width: '55%' }]}>
                                <Pressable
                                  onPress={() => {
                                    navigation.navigate('Profile', {
                                      userId: item?.id,
                                    });
                                  }}
                                  style={styles.friendimgcontainer}
                                >
                                  {item?.thumbnailProfileImage &&
                                  !isUserDeleted ? (
                                    <FastImage
                                      style={styles.friendimg}
                                      source={{
                                        uri: item?.thumbnailProfileImage,
                                        cache: FastImage.cacheControl.immutable,
                                      }}
                                    />
                                  ) : (
                                    <FastImage
                                      style={[
                                        styles.friendimg,
                                        { height: 20, width: 20 },
                                      ]}
                                      source={require('../assets/images/icon/profile-user.png')}
                                    />
                                  )}
                                </Pressable>
                                <Pressable
                                  onPress={() => {}}
                                  style={{ width: '70%' }}
                                >
                                  <Text style={styles.friendname}>
                                    {isUserDeleted
                                      ? 'Deletion Requested'
                                      : item?.firstName + ' ' + item?.lastName}
                                  </Text>
                                  {!isUserDeleted && (
                                    <Text style={styles.friendstatus}>
                                      {getUserInfoText(item)}
                                    </Text>
                                  )}
                                </Pressable>
                              </View>
                              {isUserSelf || isUserDeleted ? null : (
                                <View
                                  style={{
                                    width: '40%',
                                    alignItems: 'flex-end',
                                  }}
                                >
                                  {isFriend ? (
                                    <TableButton
                                      title="UNFRIEND"
                                      backgroundColor="black"
                                      color="white"
                                      onPress={() => {
                                        Alert.alert(
                                          'Friends',
                                          `Are you sure you want to remove ${item?.firstName} as a friend?`,
                                          [
                                            {
                                              text: 'No',
                                              onPress: () => {},
                                              style: 'cancel',
                                            },
                                            {
                                              text: 'Yes',
                                              onPress: async () => {
                                                try {
                                                  const data =
                                                    await ProfileApi.deleteFriend(
                                                      item?.id,
                                                      user?.id,
                                                    );
                                                } catch (error) {
                                                  alert(error.toString());
                                                }
                                                getFriendsList();
                                                getSendedRequests();
                                                getReceivedRequests();
                                              },
                                              style: 'destructive',
                                            },
                                          ],
                                        );
                                      }}
                                    />
                                  ) : isRequested ? (
                                    <TableButton
                                      title="REQUESTED"
                                      backgroundColor={Color.green}
                                      color="white"
                                      onPress={() => {
                                        Alert.alert(
                                          'Friends',
                                          `Are you sure to delete ${item?.firstName}'s friend request`,
                                          [
                                            {
                                              text: 'No',
                                              onPress: () => {},
                                              style: 'cancel',
                                            },
                                            {
                                              text: 'Yes',
                                              onPress: async () => {
                                                try {
                                                  const data =
                                                    await ProfileApi.deleteFriend(
                                                      user?.id,
                                                      item?.id,
                                                    );
                                                } catch (error) {
                                                  alert(error.toString());
                                                }
                                                getFriendsList();
                                                getSendedRequests();
                                                getReceivedRequests();
                                              },
                                              style: 'destructive',
                                            },
                                          ],
                                        );
                                      }}
                                    />
                                  ) : isSent ? (
                                    <TableButton
                                      title="ACCEPT"
                                      backgroundColor={Color.green}
                                      color="white"
                                      onPress={async () => {
                                        try {
                                          const data =
                                            await ProfileApi.acceptFriendRequest(
                                              item?.id,
                                              user?.id,
                                            );
                                        } catch (error) {
                                          alert(error.toString());
                                        }
                                        getFriendsList();
                                        getSendedRequests();
                                        getReceivedRequests();
                                      }}
                                    />
                                  ) : (
                                    <TableButton
                                      title="FRIEND"
                                      backgroundColor={Color.green}
                                      color="white"
                                      onPress={async () => {
                                        try {
                                          const data =
                                            await ProfileApi.sendFriendRequest(
                                              user?.id,
                                              item?.id,
                                            );
                                        } catch (error) {
                                          alert(error.toString());
                                        }
                                        getFriendsList();
                                        getSendedRequests();
                                        getReceivedRequests();
                                      }}
                                    />
                                  )}
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}
                {selection === 5 && (
                  <View
                    // key={selection.toString()}
                    style={{ minHeight: 500 }}
                  >
                    <View>
                      {profileClubs?.length > 0 ? (
                        profileClubs?.map((item, i) => {
                          const isUserDeleted =
                            Array.isArray(user?.inActiveUsers) &&
                            user.inActiveUsers.some(
                              id => String(id) === String(item?.organizerId),
                            );
                          return isUserDeleted ? (
                            <View
                              style={[
                                styles.cardView,
                                {
                                  marginTop: dynamicSize(10),
                                  paddingVertical: 10,
                                },
                              ]}
                            >
                              <Text> Member requested to delete</Text>
                            </View>
                          ) : (
                            <Pressable
                              style={[styles.cardView]}
                              key={i}
                              onPress={e => {
                                if (userId === user?.id) {
                                  GotoClubProfile(item?.id);
                                }
                              }}
                            >
                              <View style={styles.gridrow}>
                                <View
                                  style={[
                                    styles.clubimgcontainer,
                                    { paddingTop: dynamicSize(10) },
                                  ]}
                                >
                                  {item.thumbnailLogoPath ? (
                                    <FastImage
                                      source={{
                                        uri: item?.thumbnailLogoPath,
                                        cache: FastImage.cacheControl.immutable,
                                      }}
                                      style={styles.clubprofileimg}
                                    />
                                  ) : (
                                    <FastImage
                                      source={require('../assets/images/logo.png')}
                                      style={[
                                        styles.clubprofileimg,
                                        { opacity: 0.5 },
                                      ]}
                                    />
                                  )}
                                </View>

                                <View style={{ flex: 1 }}>
                                  <View>
                                    <Text style={styles.clubicontext}>
                                      {item?.title}
                                    </Text>
                                    <Text style={styles.status}>
                                      {(item?.city ?? item?.state
                                        ? (item?.city ?? item?.state) + ', '
                                        : '') + (item?.country ?? '')}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <View style={styles.row}>
                                <View style={styles.rightbox}>
                                  <View style={styles.rowcontainer}>
                                    <Text style={styles.datalable}>
                                      Trips{' '}
                                      <Text style={styles.dataitem}>
                                        {item?.tripCount}
                                      </Text>
                                    </Text>
                                  </View>
                                  <View style={styles.rowcontainer}>
                                    <Text style={styles.datalable}>
                                      Reports{' '}
                                      <Text style={styles.dataitem}>
                                        {item?.tripReportsCount}
                                      </Text>{' '}
                                    </Text>
                                  </View>
                                  <View style={styles.rowcontainer}>
                                    <Text style={styles.datalable}>
                                      Members{' '}
                                      <Text style={styles.dataitem}>
                                        {' '}
                                        {item?.membersCount}
                                      </Text>
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ flex: 1 }}>
                                  <View style={styles.buttoncontainer}>
                                    <Pressable style={styles.readbtn}>
                                      <Text style={styles.readtext}>
                                        {item?.organizerId === userId
                                          ? 'Organiser'
                                          : 'Member'}
                                      </Text>
                                    </Pressable>
                                  </View>
                                </View>
                              </View>
                            </Pressable>
                          );
                          // }
                        })
                      ) : (
                        <StatusMessage
                          isOnline={currentNetworkStatus}
                          hasData={profileClubs?.length > 0}
                          color={Color.white}
                          title={'No Club Available'}
                        />
                      )}
                    </View>
                    {bottomLodaer ? (
                      <View
                        style={{
                          height: dynamicSize(50),
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ActivityIndicator color={Color.black0} />
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                )}
                {selection === 6 && (
                  <View
                    // key={selection.toString()}
                    style={[styles.aboutContainer, { minHeight: 500 }]}
                  >
                    <View style={[styles.Directions, { width: '100%' }]}>
                      <Text style={styles.AboutHeading}>About</Text>
                      {isSelf && (
                        <TouchableOpacity
                          onPress={goToEditabout}
                          disabled={!currentNetworkStatus}
                        >
                          <FastImage
                            style={styles.Editicon}
                            source={require('../assets/images/icon/Edit.png')}
                          />
                        </TouchableOpacity>
                      )}
                      <View style={{ flex: 1 }} />
                      {editAboutMe && (
                        <Pressable
                          onPress={async () => {
                            try {
                              setEditAboutMe(false);
                              setProfileLoader(true);
                              if (ownVehical == null) {
                                const data = await ProfileApi.updateProfile({
                                  aboutMe: aboutMeText,
                                });
                              } else {
                                const data = await ProfileApi.updateProfile({
                                  aboutMe: aboutMeText,
                                  carOwner: ownVehical,
                                });
                              }
                            } catch (error) {}
                            setProfileLoader(false);
                            getProfile();
                          }}
                          style={{
                            height: dynamicSize(30),
                            width: dynamicSize(80),
                            borderRadius: 40,
                            backgroundColor: Color.lightblue,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: getFontSize(15),
                              color: 'white',
                              fontFamily: fontFamily.ProximaAB,
                            }}
                          >
                            Save
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    <Text style={styles.name}>
                      {(profileData?.firstName ?? '') +
                        ' ' +
                        (profileData?.lastName ?? '')}
                    </Text>

                    {editAboutMe ? (
                      <TextInput
                        theme={{
                          colors: {
                            text: Color.black0,
                            placeholder: aboutMeText
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
                          aboutMeText ? Color.lightblue : Color.gray
                        }
                        mode="outlined"
                        numberOfLines={3}
                        keyboardType={keyboardType.default}
                        multiline={true}
                        placeholder="About me"
                        value={aboutMeText}
                        onChangeText={Caption => setAboutMeText(Caption)}
                        style={[styles.paperinput, { maxHeight: 150 }]}
                        selectionColor={Color.lightblue}
                        activeOutlineColor={Color.lightblue}
                      />
                    ) : (
                      <Text style={styles.AboutText}>
                        {profileData?.aboutMe}
                      </Text>
                    )}
                    <Text style={styles.name}>
                      Member Since{' '}
                      {profileData?.createdAt
                        ? moment(profileData?.createdAt).format('YYYY')
                        : ''}{' '}
                    </Text>
                    <View style={styles.Directions}>
                      <Text style={styles.InformationHeading}>Gender: </Text>
                      <Text style={styles.InformationText}>
                        {profileData?.gender == 0
                          ? 'Male'
                          : profileData?.gender == 1
                          ? 'Female'
                          : 'Other'}
                      </Text>
                    </View>
                    {isSelf && (
                      <View style={styles.Directions}>
                        <Text style={styles.InformationHeading}>
                          Post Code:{' '}
                        </Text>
                        <Text style={styles.InformationText}>
                          {profileData?.zipCode ?? ''}
                        </Text>
                      </View>
                    )}
                    {isSelf && (
                      <>
                        <View style={styles.Directions}>
                          <Text style={styles.InformationHeading}>Email: </Text>
                          <Text style={styles.InformationText}>
                            {profileData?.email}{' '}
                          </Text>
                        </View>
                        <View style={styles.Directions}>
                          <Text style={styles.InformationHeading}>
                            Phone Number:{' '}
                          </Text>
                          <Text style={styles.InformationText}>
                            {' '}
                            {profileData?.phone}
                          </Text>
                        </View>
                      </>
                    )}

                    <Divider style={styles.divider} />
                    <Text style={styles.name}>Board Quiver</Text>
                    <View style={styles.bg}>
                      <View style={styles.Directions}>
                        <Text style={styles.InformationHeading}>
                          Board type:{' '}
                        </Text>
                        <Text style={styles.InformationText}>
                          {board[profileData?.boardSize ?? 0]}
                        </Text>
                      </View>
                      {isSelf && (
                        <Pressable
                          style={styles.ButtonOntext}
                          onPress={() => setisModalboardsize(true)}
                        >
                          <Text style={styles.TextButton}>
                            Add Board Option
                          </Text>
                        </Pressable>
                      )}
                    </View>
                    {isSelf && (
                      <>
                        <Text style={styles.name}>Update Skill Level</Text>
                        <View style={styles.bg}>
                          <View style={styles.Directions}>
                            <Text style={styles.InformationHeading}>
                              Skill Level:{' '}
                            </Text>
                            <Text style={styles.InformationText}>
                              {
                                userSkillLevel[
                                  profileData?.surferSkillLevel ?? 0
                                ]
                              }
                            </Text>
                          </View>
                          <Pressable
                            style={styles.ButtonOntext}
                            onPress={() => {
                              if (allTrips?.length >= 5) {
                                setSkillLevelModal(true);
                              } else {
                                alert(
                                  'You need to complete 25 trips to update skill level',
                                );
                              }
                            }}
                          >
                            <Text style={styles.TextButton}>
                              Update Skill Option
                            </Text>
                          </Pressable>
                        </View>
                      </>
                    )}
                    <View style={styles.bg2}>
                      <View style={styles.radiobtn}>
                        <Text style={styles.InformationHeading}>
                          Owns a vehicle?
                        </Text>
                        <Switch
                          value={ownVehical ?? profileData?.carOwner ?? false}
                          disabled={!isSelf || !editAboutMe}
                          onValueChange={onToggleSwitch}
                        />
                      </View>
                      <View style={styles.Directions}>
                        <Text style={styles.InformationHeading}>
                          Car Type (if applicable) :
                        </Text>
                        <Text style={styles.InformationText}>
                          {' '}
                          {profileData?.carCapacity ?? 0} Seats
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ImageBackground>
          </LinearGradient>
        </View>
      </ScrollView>

      <PreviewModal
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

      <Modal
        isVisible={isModalboardsize}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        coverScreen={true}
      >
        <View style={styles.modalcontainer}>
          <View style={styles.modalsubcontainer}>
            <View style={styles.mx2}>
              <Text style={styles.formtitle}>Board Size</Text>
              <Pressable
                style={styles.close}
                onPress={() => {
                  setisModalboardsize(false);
                }}
              >
                <Ionicons name="close-circle" size={26} color={Color.black} />
              </Pressable>
            </View>
            <View style={styles.modalflatlist}>
              <FlatList
                data={board}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.listitem}
                    onPress={async () => {
                      setisModalboardsize(false);
                      try {
                        setProfileImagesLoader(true);
                        const data = await ProfileApi.updateProfile({
                          boardSize: index,
                        });
                        setProfileImagesLoader(false);
                      } catch (error) {
                        setProfileImagesLoader(false);
                      }
                      getProfile();
                    }}
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
        isVisible={skillLevelModal}
        deviceWidth={deviceWidth}
        deviceHeight={deviceHeight}
        coverScreen={true}
      >
        <View style={styles.modalcontainer}>
          <View style={[styles.modalsubcontainer, { height: 250 }]}>
            <View style={styles.mx2}>
              <Text style={styles.formtitle}>Skill Level</Text>
              <Pressable
                style={styles.close}
                onPress={() => {
                  setSkillLevelModal(false);
                }}
              >
                <Ionicons name="close-circle" size={26} color={Color.black} />
              </Pressable>
            </View>
            <View style={styles.modalflatlist}>
              <FlatList
                data={getSkillLevels(allTrips?.length)}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={styles.listitem}
                    onPress={async () => {
                      setSkillLevelModal(false);
                      try {
                        setProfileImagesLoader(true);
                        const data = await ProfileApi.updateProfile({
                          surferSkillLevel: index,
                        });
                        setProfileImagesLoader(false);
                      } catch (error) {
                        setProfileImagesLoader(false);
                      }
                      getProfile();
                    }}
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

      <Modal2 transparent animationType="slide" visible={modalVisible}>
        <View style={style2.bottommodal}>
          <View style={[style2.modalView]}>
            <Text style={style2.modaltitle}>Invite to Trip</Text>
            <Text style={style2.modaltext}>
              Do you want to Join as driver or passenger?{' '}
            </Text>
            <Divider style={style2.divider} />
            <Pressable
              style={style2.modalbutton}
              onPress={() => {
                setModalVisible(false);
                if (isInvite.current) {
                  acceptInvite(inviteIdList[currentItem.current?.id], true);
                } else {
                  sendInvite(currentItem.current?.id, true);
                }
              }}
            >
              <Text style={style2.modalbtntext}>Driver</Text>
            </Pressable>
            <Divider style={style2.divider} />
            <Pressable
              style={style2.modalbutton}
              onPress={() => {
                setModalVisible(false);
                if (isInvite.current) {
                  acceptInvite(inviteIdList[currentItem.current?.id], false);
                } else {
                  sendInvite(currentItem.current?.id, false);
                }
              }}
            >
              <Text style={style2.modalbtntext}>Passenger</Text>
            </Pressable>
            <Divider style={style2.divider} />
            <Pressable
              style={style2.modalbutton}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={[style2.modalbtntext, { color: 'red' }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal2>
      <ImagePickerModal
        visible={imagePickerModal}
        onCancel={() => {
          setImagePickerModal(false);
        }}
        onSelect={async photo => {
          try {
            const imageData = new FormData();
            setProfileImagesLoader(true);
            imageData.append('profileImage', photo);
            const imageRes = await ProfileApi.updateProfileImages(imageData);
            setProfileImagesLoader(false);
            getProfile();
          } catch (error) {
            setProfileImagesLoader(false);
          }
        }}
      />

      <ImagePickerModal
        visible={galleryImagePickerModa}
        onCancel={() => {
          setGalleryImagePickerModa(false);
        }}
        onSelect={async photo => {
          try {
            const imageData = new FormData();
            setProfileImagesLoader(true);
            imageData.append(0, photo);
            const imageRes = await ProfileApi.postGalleryImage(imageData);
            setProfileImagesLoader(false);
            getProfileImages();
          } catch (error) {
            setProfileImagesLoader(false);
          }
        }}
      />

      <ListModal
        onCancel={() => {
          setDeleteModal(false);
        }}
        outheruser={!isSelf}
        isself={isSelf}
        visible={deleteModal}
        onPressReport={() => {
          reportImage();
        }}
        onPressDelete={async () => {
          setDeleteModal(false);
          Alert.alert('Alert', 'Are you sure you want to delete this photo?', [
            {
              text: 'No',
            },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: async () => {
                try {
                  const data = await ProfileApi.deleteImage(
                    currentImage.current?.id,
                    currentImage.current?.imageType,
                  );

                  getProfileImages();
                } catch (error) {}
              },
            },
          ]);
        }}
      />

      <ForReportModal
        visible={open}
        onClose={() => {
          setOpen(false);
        }}
        description="hello"
      />

      <ReportModal
        setModalVisible={setisreportmodal}
        modalVisible={isreportmodal}
        onChange={reporttext => {
          setreporttext(reporttext);
          setselcterror('');
        }}
        blockreport={e => {
          blockreport();
        }}
        username={profileData?.firstName + ' ' + profileData?.lastName}
        reasonList={reasonList}
        reasonValue={reasonValue}
        selectReason={selectReason}
        selcterror={selcterror}
      />

      <ReportModal
        setModalVisible={setisreportmodalBlock}
        modalVisible={isreportmodalBlock}
        onChange={reporttext => {
          setreporttext(reporttext);
          setselcterror('');
        }}
        blockreport={e => {
          reportandBlock();
        }}
        reasonList={reasonList}
        reasonValue={reasonValue}
        username={profileData?.firstName + ' ' + profileData?.lastName}
        selectReason={selectReason}
        selcterror={selcterror}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  status: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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

  Iconbg: {
    backgroundColor: Color.lightblue,
    borderRadius: 50,
    width: dynamicSize(40),
    height: dynamicSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    position: 'absolute',
    right: dynamicSize(-5),
    bottom: dynamicSize(-5),
  },
  radiobtntext: {
    fontSize: 15,
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
  },
  radiobtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ml1: {
    marginLeft: 5,
  },
  dropdownStyle: {
    width: 100,
    borderRadius: 5,
  },
  divider: {
    marginVertical: 15,
    height: 1.5,
  },
  mh2: {
    marginHorizontal: 10,
  },
  membersbtn: {
    marginLeft: -20,
  },
  gridrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubimgcontainer: {
    overflow: 'hidden',
    marginRight: 30,
    justifyContent: 'center',
  },
  box60: {
    width: '70%',
  },
  clubprofileimg: {
    height: dynamicSize(70),
    width: dynamicSize(70),
    borderRadius: 100,
  },
  clubicontext: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  clubsubtext: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
  },
  box40: {
    width: '30%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: 5,
    marginTop: dynamicSize(10),
    paddingHorizontal: 15,
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: dynamicSize(10),
    borderRadius: 20,
  },
  friendstatus: {
    color: Color.gray,
    ...text.usernamestatus,
    flexWrap: 'wrap',
  },
  friendaddress: {
    color: Color.black,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  friendname: {
    ...text.usernameboldtitle,
    color: 'black',
    flexWrap: 'wrap',
  },
  buttoncontainer: {
    marginRight: -7,
    alignSelf: 'flex-end',
    marginVertical: 5,
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
    marginHorizontal: dynamicSize(10),
  },
  mt2: {
    marginTop: dynamicSize(10),
  },
  modalflatlist: {
    flex: 1,
    marginTop: 7,
  },
  modalsubcontainer: {
    backgroundColor: Color.white,
    minHeight: dynamicSize(200),
    borderRadius: 8,
    paddingBottom: dynamicSize(10),
  },
  listitemtext: {
    fontSize: getFontSize(16),
    color: Color.black0,
  },
  listitem: {
    paddingVertical: 15,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingLeft: 10,
  },
  modalcontainer: {
    justifyContent: 'center',
    width: '100%',
    flex: 1,
  },
  formtitle: {
    fontSize: 16,
    color: Color.themeColor,
    lineHeight: 23,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  paperinput: {
    backgroundColor: Color.white,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 10,
    fontSize: getFontSize(16),
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

  friendcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  friendsection: {
    backgroundColor: Color.white,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  friendimgcontainer: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    marginRight: dynamicSize(10),
    height: dynamicSize(45),
    borderRadius: 100,
    width: dynamicSize(45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendimg: {
    height: '100%',
    borderRadius: 100,
    width: '100%',
  },
  suggestedtext: {
    flex: 1,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(20),
    paddingVertical: 5,
    fontFamily: fontFamily.ProximaR,
    color: Color.white,
    textAlign: 'center',
  },
  suggestimgcontainer: {
    padding: 2,
    backgroundColor: Color.white,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberimgcontainer: {
    padding: 1,
    backgroundColor: Color.lightblue,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedbtn: {
    marginHorizontal: 5,
    alignItems: 'center',
    width: dynamicSize(70),
    paddingVertical: dynamicSize(10),
  },
  suggestedprofile: {
    height: dynamicSize(55),
    borderRadius: 100,
    width: dynamicSize(55),
  },
  containerlable: {
    paddingVertical: 5,
    paddingLeft: 10,
    fontSize: getFontSize(15),
    lineHeight: getFontSize(21),
    fontFamily: fontFamily.ProximaAB,
    color: Color.white,
  },
  logoimg: {
    height: dynamicSize(100),
    width: dynamicSize(100),
    borderRadius: 100,
    alignSelf: 'center',
  },
  background: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headline_text: {
    color: 'white',
    fontSize: getFontSize(30),
    fontWeight: 'bold',
    marginTop: dynamicSize(50),
    marginLeft: dynamicSize(20),
  },
  explore_text: {
    marginTop: dynamicSize(5),
    marginBottom: dynamicSize(10),
    color: 'white',
    marginLeft: dynamicSize(20),
    fontSize: 12,
    fontWeight: '600',
  },
  ImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: 10,
  },
  imgview: {},
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  profileimgmain: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: Color.lightblue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    height: '100%',
    width: '100%',
    borderRadius: 100,
  },
  name: {
    fontSize: getFontSize(15),
    color: 'black',
    marginVertical: 5,
    marginTop: 10,
    fontFamily: fontFamily.ProximaR,
  },
  address: {
    fontSize: getFontSize(15),
    color: 'black',
    fontFamily: fontFamily.ProximaAB,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  InlineButton: {
    flexDirection: 'row',
  },
  passenger: {
    fontSize: getFontSize(15),
    color: 'black',
    fontFamily: fontFamily.ProximaR,
  },
  backgroundImage: {
    paddingVertical: 40,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dynamicSize(20),
    marginHorizontal: dynamicSize(20),
  },
  btn: {
    borderRadius: 10,
    width: dynamicSize(85),
    alignItems: 'center',
    justifyContent: 'center',
    height: dynamicSize(45),
    borderWidth: 1,
    borderColor: Color.lightblue,
    marginHorizontal: 5,
    backgroundColor: Color.white,
  },
  Image: {
    marginVertical: 3,
    marginHorizontal: 3,
    borderRadius: 7,
    resizeMode: 'cover',
  },
  galleryimgcontainer: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    marginHorizontal: dynamicSize(15),
  },
  icon: {
    height: '100%',
    width: '100%',
    marginHorizontal: dynamicSize(15),
  },
  Editicon: {
    height: dynamicSize(15),
    width: dynamicSize(15),
    marginHorizontal: dynamicSize(10),
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 30,
    alignItems: 'center',
    ...Shadow.boxShadow,
  },
  buttonOpen: {
    alignSelf: 'center',
    backgroundColor: Color.lightblue,
    width: '50%',
    borderRadius: 10,
    paddingVertical: 10,
  },
  buttonClose: {
    backgroundColor: Color.lightblue,
    paddingHorizontal: 40,
    borderRadius: 10,
    paddingVertical: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13,
  },
  modalText: {
    marginVertical: 40,
    textAlign: 'center',
    color: 'black',
    fontWeight: '600',
  },
  aboutContainer: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  AboutHeading: {
    fontSize: getFontSize(22),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(27),
    color: 'black',
    marginVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: Color.lightblue,
  },
  AboutText: {
    color: Color.gray,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
  },
  InformationHeading: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
    color: Color.gray,
    maxWidth: '80%',
  },
  InformationText: {
    fontSize: getFontSize(13),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
    color: 'black',
  },
  LineHorizontal: {
    borderBottomWidth: 2,
    borderBottomColor: Color.lightGray,
    marginVertical: 20,
  },
  Directions: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  DirectionsSpaceBetween: {
    flexDirection: 'row',
    marginVertical: 2,
    justifyContent: 'space-between',
  },
  bg: {
    backgroundColor: Color.reportcardbg,
    padding: 20,
    borderRadius: 10,
  },
  bg2: {
    backgroundColor: Color.reportcardbg,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  TextButton: {
    color: Color.lightblue,
    fontSize: getFontSize(15),
    lineHeight: getFontSize(21),
    fontFamily: fontFamily.ProximaR,
    textDecorationLine: 'underline',
  },
  ButtonOntext: {
    width: '55%',
    paddingTop: 10,
  },
  opacity: {
    opacity: 0.4,
  },
  rowcontainer: {
    alignItems: 'center',
    marginRight: 5,
  },
  rightbox: {
    flexDirection: 'row',
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
    color: Color.lightblue,
  },
  datalable: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  dataitem: {
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(16),
    color: Color.black,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readbtn: {
    height: dynamicSize(30),
    paddingHorizontal: dynamicSize(13),
    backgroundColor: Color.white,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Color.lightblue,
    borderWidth: 1,
    paddingHorizontal: dynamicSize(20),
  },
  readtext: {
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(10),
    color: Color.lightblue,
  },
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

  syncInfoContainer: {
    backgroundColor: Color.lightGray,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncInfoText: {
    color: Color.gray,
    fontSize: getFontSize(12),
    fontFamily: fontFamily.ProximaR,
    marginLeft: 5,
  },
});

export default Profile;

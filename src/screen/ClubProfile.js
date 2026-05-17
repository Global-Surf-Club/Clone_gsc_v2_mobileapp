//import liraries
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import {
  Image,
  FlatList,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Pressable,
  //Switch,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from '../components/Header';
import { ShowButton, ImageButton } from '../components/Buttons';
import { Eventlist } from '../components/ClubComponentitem';
import { Communityinfo, TripReport } from '../components/ClubComponentitem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Blockreport from '../api/Blockreport';
import FastImage from 'react-native-fast-image';
import {
  Color,
  Shadow,
  text,
  Grid,
  fontFamily,
  board,
  userSkillLevel,
  keyboardType,
} from '../constants/Constants';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../constants/Loader';
import { Divider, TextInput, Switch } from 'react-native-paper';
import { ModalItem } from '../components/ModalItem';
import { PhotoGrid } from 'react-native-photo-grid-frame';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import ListModal from '../components/ListModal';
import ClubsAPi from '../api/ClubApi';
import SuccessModal from '../components/SuccessModal';
import AttendedModal from '../components/AttendedModal';
import EventMaybeGoingModel from '../components/EventMaybeGoingModal';
import ImagePickerModal from '../components/ImagePickerModal';
import { ClubPostCardItem } from '../components/ClubPostCardItem';
import Trip from '../api/Trip';
import PreviewModal from '../components/PreviewModal';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import ClubApi from '../api/ClubApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchClubEvents, likeEvent, mergeEvent } from '../store/eventSlice';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  fetchClubDetails,
  fetchClubGallery,
  fetchClubMembers,
  fetchClubActiveMembers,
  fetchClubForum,
  fetchClubTrips,
  fetchClubReports,
  deleteForum,
  rejectClubTrip,
  uploadGalleryImage,
  selectClubForumByClubId,
  selectClubTripsByClubId,
  selectClubReportsByClubId,
  acceptClubInvitation,
  rejectClubInvitation,
  removeClubMember,
  deleteGalleryImage,
} from '../store/clubSlice';
import ConnectionBanner from '../components/ConnectionBanner';
import SyncInfo from '../components/SyncStatus';
import StatusMessage from '../components/StatusMessage';

let pageNoForum = 1;
let pageNoForumTop = 1;
let pageNoForumBottom = 1;
let isFetchingForum = false;
let isDataLoadedForum = false;
let isDataLoadedForumTop = false;

let pageNoTrips = 1;
let pageNoTripsBottom = 1;
let pageNoTripsTop = 1;
let isFetchingTrips = false;
let isDataLoadedTrips = false;
let isDataLoadedTripsTop = false;

let pageNoReports = 1;
let pageNoReportsTop = 1;
let pageNoReportsBottom = 1;
let isFetchingReports = false;
let isDataLoadedReports = false;
let isDataLoadedReportsTop = false;

let pageNoEvent = 1;
let pageNoEventTop = 1;
let pageNoEventBottom = 1;
let isFetchingEvent = false;
let isDataLoadedEvent = false;
let isDataLoadedEventTop = false;

const ClubProfile = props => {
  const EMPTY_ARRAY = [];
  const EMPTY_OBJECT = {};
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { clubid } = props?.route?.params;
  const { Selection } = props?.route?.params;
  const [selection, setSelection] = useState(Selection ? Selection : 1);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const user = useSelector(state => state.auth.user);
  const ClubsDetail = useSelector(
    state => state.club?.clubDetails[clubid] ?? EMPTY_OBJECT,
  );
  const ClubMembers = useSelector(
    state => state.club?.clubMembers[clubid] ?? EMPTY_ARRAY,
  );
  const ClubGalleryImages = useSelector(
    state => state.club?.clubGallery[clubid] ?? EMPTY_ARRAY,
  );

  // REPLACE OLD REFS WITH REDUX SELECTORS
  const forumFromStore = useSelector(state =>
    selectClubForumByClubId(state, clubid),
  );
  const tripsFromStore = useSelector(state =>
    selectClubTripsByClubId(state, clubid),
  );
  const reportsFromStore = useSelector(state =>
    selectClubReportsByClubId(state, clubid),
  );
  const loading = useSelector(state => state.club.loading);
  const [ClubActiveMembers, setClubActiveMembers] = useState([]);
  const [ClubMembersLoader, setClubMembersLoader] = useState(false);
  const [ClubGallerymagesLoader, setClubGallerymagesLoader] = useState(false);
  const [ClubTripsLoader, setClubTripsLoader] = useState(false);
  const [ClubProfileLoader, setClubProfileLoader] = useState(false);
  const [TripCount, setTripCount] = useState('0');
  const clubEventsFromStore = useSelector(
    state => state.event.clubEvents?.[clubid] ?? EMPTY_ARRAY,
  );
  const loadingFromStore = useSelector(state => state.event.loading);
  const [ClubEventLoader, setClubEventLoader] = useState(false);
  const [ClubReportLoader, setClubReportLoader] = useState(false);
  const [ClubForumLoader, setClubForumLoader] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const isOffline = useSelector(state => state.club.isOffline);
  const lastSync = useSelector(state => state.club.lastSync);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [IsAttended, setIsAttended] = useState(false);
  const [MaybeGoing, setMaybeGoing] = useState(false);
  const [Maybe, setMaybe] = useState('');
  const [AttendClubEventID, setAttendClubEventID] = useState('');
  const [galleryImagePickerModa, setGalleryImagePickerModa] = useState(false);
  const [showLoading, SetshowLoading] = useState(false);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [TopLodaer, setTopLodaer] = useState(false);
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [reportimagePreviewModal, setreportimagePreviewModal] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [createbyID, setcreatebyID] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [selectImageID, setselectImageID] = useState('');
  const [reportselectusersID, setreportselectusersID] = useState('');
  const [selectImageType, setselectImageType] = useState('');
  const [isModalVisible, setisModalVisible] = useState(false);
  const [isInvited, setisInvited] = useState(false);
  const [isPublish, setisPublish] = useState(null);
  const [TripID, setTripID] = useState('');
  const currentImage = useRef(null);
  const scrollViewRef = useRef();
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(
      id => String(id) === String(ClubsDetail?.organizerId),
    );
  const ClubEvent = useRef([]);
  const scrollToIndex = useRef(0);
  const dataSourceCords = useRef([]);

  const ClubForum = useRef([]);
  const scrollToIndexForum = useRef(0);
  const dataSourceCordsForum = useRef([]);

  const ClubTrips = useRef([]);
  const scrollToIndexTrip = useRef(0);
  const dataSourceCordsTrip = useRef([]);

  const ClubReport = useRef([]);
  const scrollToIndexReports = useRef(0);
  const dataSourceCordsReports = useRef([]);

  const scrollToIndexMember = useRef(0);
  const dataSourceCordsMember = useRef([]);

  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);

  useEffect(() => {
    setSelection(
      props?.route?.params?.Selection ? props?.route?.params?.Selection : 1,
    );
  }, [props?.route?.params?.Selection]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        onRefreshByTab();
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkUserTripCount();
    const unsubscribe = navigation.addListener('focus', () => {
      getClubProfile();
      getClubGalleryImages();
      getClubMemeberList();
      // getClubActiveMemeberList();
      getClubReport(true);
      checkUserTripCount();
      if (Selection) {
        if (Selection == 1) {
          getClubForum(true);
          getClubTrips(true);
          getClubReport(true);
          getClubEvent(true);
        } else if (Selection == 4) {
          getClubForum(true);
          getClubReport(true);
          getClubEvent(true);
          getClubTrips(true);
        } else if (Selection == 5) {
          getClubForum(true);
          getClubTrips(true);
          getClubEvent(true);
          getClubReport(true);
        } else if (Selection == 6) {
          getClubForum(true);
          getClubTrips(true);
          getClubReport(true);
          getClubEvent(true);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      props?.route?.params?.ListIndex !== undefined &&
      props?.route?.params?.ListIndex !== null &&
      props?.route?.params?.ListIndex !== ''
    ) {
      if (Selection === 2) {
        scrollToIndexMember.current =
          parseInt(props?.route?.params?.ListIndex) > 0
            ? parseInt(props?.route?.params?.ListIndex) - 1
            : 0;
      }
      if (props?.route?.params?.ListIndex === -1) {
        if (Selection === 1) {
          alert('The Forum is Expird');
          getClubForum(true);
        } else if (Selection === 4) {
          alert('The trip is Expird');
          getClubTrips(true);
        } else if (Selection === 5) {
          alert('The trip is Expird');
          getClubReport(true);
        } else if (Selection === 6) {
          alert('The Event is Expird');
          getClubEvent(true);
        }
      } else {
        if (parseInt(props?.route?.params?.ListIndex) > 10) {
          let modules = parseInt(props?.route?.params?.ListIndex) % 10;
          if (modules == 0) {
            if (Selection === 1) {
              scrollToIndexForum.current = 0;
              pageNoForumTop = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoForumBottom = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoForum = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              getClubForum(false, false, false, true);
            } else if (Selection === 4) {
              scrollToIndexTrip.current = 0;
              pageNoTripsTop = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoTripsBottom = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoTrips = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              getClubTrips(false, false, false, true);
            } else if (Selection === 5) {
              scrollToIndexReports.current = 0;
              pageNoReportsTop = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoReportsBottom = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoReports = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              getAllclubtripreport(false, false, false, true);
            } else if (Selection === 6) {
              scrollToIndex.current = 0;
              pageNoEventTop = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoEventBottom = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              pageNoEvent = parseInt(
                parseInt(props?.route?.params?.ListIndex) / 10,
              );
              getClubEvent(false, false, false, true);
            }
          } else if (modules > 0) {
            if (Selection === 1) {
              scrollToIndexForum.current = modules - 1;
              pageNoForumTop =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoForumBottom =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoForum =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              getClubForum(false, false, false, true);
            } else if (Selection === 4) {
              scrollToIndexTrip.current = modules - 1;
              pageNoTripsTop =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoTripsBottom =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoTrips =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              getClubTrips(false, false, false, true);
            } else if (Selection === 5) {
              scrollToIndexReports.current = modules - 1;
              pageNoReportsTop =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoReportsBottom =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoReports =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              getClubReport(false, false, false, true);
            } else if (Selection === 6) {
              scrollToIndex.current = modules - 1;
              pageNoEventTop =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoEventBottom =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              pageNoEvent =
                parseInt(parseInt(props?.route?.params?.ListIndex) / 10) + 1;
              getClubEvent(false, false, false, true);
            }
          }
        } else {
          if (Selection === 1) {
            scrollToIndexForum.current =
              parseInt(props?.route?.params?.ListIndex) > 0
                ? parseInt(props?.route?.params?.ListIndex) - 1
                : 0;
            pageNoForumTop = 1;
            pageNoForumBottom = 1;
            pageNoForum = 1;
            getClubForum(false, false, false, true);
          } else if (Selection === 4) {
            scrollToIndexTrip.current =
              parseInt(props?.route?.params?.ListIndex) > 0
                ? parseInt(props?.route?.params?.ListIndex) - 1
                : 0;
            pageNoTripsTop = 1;
            pageNoTripsBottom = 1;
            pageNoTrips = 1;
            getClubTrips(false, false, false, true);
          } else if (Selection === 5) {
            scrollToIndexReports.current =
              parseInt(props?.route?.params?.ListIndex) > 0
                ? parseInt(props?.route?.params?.ListIndex) - 1
                : 0;
            pageNoReportsTop = 1;
            pageNoReportsBottom = 1;
            pageNoReports = 1;
            getClubReport(false, false, false, true);
          } else if (Selection === 6) {
            scrollToIndex.current =
              parseInt(props?.route?.params?.ListIndex) > 0
                ? parseInt(props?.route?.params?.ListIndex) - 1
                : 0;
            pageNoEventTop = 1;
            pageNoEventBottom = 1;
            pageNoEvent = 1;
            getClubEvent(false, false, false, true);
          }
        }
      }
    } else {
      scrollToIndexForum.current = 0;
      scrollToIndex.current = 0;
      scrollToIndexReports.current = 0;
      scrollToIndexTrip.current = 0;
      scrollToIndexMember.current = 0;
      getClubEvent(true);
      getClubForum(true);
      getClubTrips(true);
      getClubReport(true);
    }
  }, [props]);

  // Refresh forum data when screen comes back into focus (e.g., returning from comment page)
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (Selection === 4 || Selection === 5) {
  //       // Refresh forum data to show updated comment counts
  //       getClubForum(true);
  //     }
  //     if (Selection === 1 || Selection === 4) {
  //       // Refresh trips data
  //       getClubTrips(true);
  //     }
  //     if (Selection === 1 || Selection === 5) {
  //       // Refresh reports data
  //       getClubReport(true);
  //     }
  //     if (Selection === 6) {
  //       // Refresh events data
  //       getClubEvent(true);
  //     }
  //     return () => {};
  //   }, [Selection, clubid]),
  // );

  const backButtonClick = () => {
    navigation.goBack();
  };

  const gotoeventdetail = EventId => {
    navigation.navigate('EventViewDetail', { EventId, clubid });
  };

  const onEventCommentClick = (EventId, onlyAdminCommentOnly, organizerId) => {
    navigation.navigate('ClubEventComments', {
      EventId,
      clubid,
      isPublish,
      onlyAdminCommentOnly,
      organizerId,
    });
  };

  const GotoTripReport = item => {
    navigation.navigate('ClubTripReport', { item });
  };

  const gotoCreateEvent = () => {
    navigation.navigate('CreateEvent', { clubid });
  };

  const gotoClubOrganizetrip = () => {
    navigation.navigate('ClubOrganizetrip', { clubid });
  };

  const GotoTripDetail = item => {
    navigation.navigate('ClubTripdetail', { ...item });
  };

  const gotocomment = (id, postComments, ForumName) => {
    navigation.navigate('Postcomment', { id, data: postComments, ForumName });
  };

  const gotoClubChat = oppUserId => {
    if (oppUserId) {
      navigation.navigate('PersonalChat', {
        oppUserId,
      });
    }
  };

  const goToEditabout = () => {
    navigation.navigate('CreateClub', { ClubsDetail });
  };

  const checkUserTripCount = async () => {
    if (user !== null && clubid !== null) {
      let checkTripCount = await ClubsAPi.checkusertripcount(clubid);

      if (checkTripCount) {
        setTripCount(JSON.parse(checkTripCount));
      } else {
        setTripCount('0');
      }
    }
  };

  const getClubProfile = async () => {
    if (user !== null && clubid) {
      dispatch(
        fetchClubDetails(clubid, (success, data) => {
          if (!success) {
          }
        }),
      );
    }
  };

  const getClubGalleryImages = async () => {
    if (user !== null && clubid) {
      dispatch(
        fetchClubGallery(clubid, (success, data) => {
          if (!success) {
          }
        }),
      );
    }
  };

  const getClubMemeberList = async () => {
    if (user !== null && clubid) {
      dispatch(
        fetchClubMembers(clubid, (success, data) => {
          if (!success) {
          }
        }),
      );
    }
  };

  const getClubActiveMemeberList = async () => {
    try {
      if (user !== null) {
        setClubMembersLoader(true);
        const data = await dispatch(fetchClubActiveMembers(clubid));
        if (data) {
          setClubActiveMembers(data);
        } else {
          setClubActiveMembers([]);
        }
        setClubMembersLoader(false);
      }
    } catch (error) {
      setClubMembersLoader(false);
    }
  };

  const getClubForum = async (isRefresh, isBottom, isTop, isStart) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoadedForum = false;
        isDataLoadedForumTop = false;
        setClubForumLoader(true);
      } else if (isRefresh) {
        isDataLoadedForum = false;
        pageNoForumTop = 1;
        pageNoForumBottom = 1;
        pageNoForum = 1;
        setClubForumLoader(true);
      } else {
        setClubForumLoader(true);
      }
      isFetchingForum = true;

      const pageToFetch = isBottom
        ? pageNoForumBottom
        : isTop
        ? pageNoForumTop
        : pageNoForum;

      // Dispatch thunk and handle pagination
      dispatch(
        fetchClubForum(clubid, pageToFetch, 10, (success, data) => {
          isFetchingForum = false;

          if (!success) {
            setClubForumLoader(false);
            setBottomLodaer(false);
            setTopLodaer(false);
            return;
          }

          // Redux store is automatically updated by thunk
          // Scroll to position if needed
          if (isTop && dataSourceCordsForum.current?.length >= 10) {
            scrollViewRef.current.scrollTo({
              x: 0,
              y: dataSourceCordsForum.current[10] + 420,
              animated: true,
            });
            setTopLodaer(false);
          }

          if (data?.length !== 10) {
            isDataLoadedForum = true;
          }
          if (pageToFetch === 1) {
            isDataLoadedForumTop = true;
          }

          setClubForumLoader(false);
          setBottomLodaer(false);
        }),
      );
    } catch (error) {
      setBottomLodaer(false);
      setClubForumLoader(false);
      isDataLoadedForum = false;
      isDataLoadedForumTop = false;
      pageNoForum = 1;
      pageNoForumBottom = 1;
      pageNoForumTop = 1;
    }
  };

  const getClubTrips = async (isRefresh, isBottom, isTop, isStart) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoadedTrips = false;
        isDataLoadedTripsTop = false;
        setClubTripsLoader(true);
      } else if (isRefresh) {
        isDataLoadedTrips = false;
        pageNoTrips = 1;
        pageNoTripsBottom = 1;
        pageNoTripsTop = 1;
        setClubTripsLoader(true);
      } else {
        setClubTripsLoader(true);
      }
      isFetchingTrips = true;

      const pageToFetch = isBottom
        ? pageNoTripsBottom
        : isTop
        ? pageNoTripsTop
        : pageNoTrips;

      dispatch(
        fetchClubTrips(clubid, pageToFetch, 10, (success, data) => {
          isFetchingTrips = false;

          if (!success) {
            setClubTripsLoader(false);
            setBottomLodaer(false);
            setTopLodaer(false);
            return;
          }

          // Redux store is automatically updated
          if (isTop && dataSourceCordsTrip.current?.length >= 10) {
            scrollViewRef.current.scrollTo({
              x: 0,
              y: dataSourceCordsTrip.current[10] + 420,
              animated: true,
            });
            setTopLodaer(false);
          }

          if (data?.length !== 10) {
            isDataLoadedTrips = true;
          }
          if (pageToFetch === 1) {
            isDataLoadedTripsTop = true;
          }

          setClubTripsLoader(false);
          setBottomLodaer(false);
        }),
      );
    } catch (error) {
      setClubTripsLoader(false);
      setBottomLodaer(false);
      setTopLodaer(false);
      isDataLoadedTrips = false;
      isDataLoadedTripsTop = false;
      pageNoTrips = 1;
      pageNoTripsBottom = 1;
      pageNoTripsTop = 1;
    }
  };

  const getClubReport = async (isRefresh, isBottom, isTop, isStart) => {
    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoadedReports = false;
        isDataLoadedReportsTop = false;
        setClubReportLoader(true);
      } else if (isRefresh) {
        isDataLoadedReports = false;
        pageNoReports = 1;
        pageNoReportsBottom = 1;
        pageNoReportsTop = 1;
        setClubReportLoader(true);
      } else {
        setClubReportLoader(true);
      }
      isFetchingReports = true;

      const pageToFetch = isBottom
        ? pageNoReportsBottom
        : isTop
        ? pageNoReportsTop
        : pageNoReports;

      dispatch(
        fetchClubReports(clubid, pageToFetch, 10, (success, data) => {
          isFetchingReports = false;

          if (!success) {
            setClubReportLoader(false);
            setBottomLodaer(false);
            setTopLodaer(false);
            return;
          }

          // Redux store is automatically updated
          if (isTop && dataSourceCordsReports.current?.length >= 10) {
            scrollViewRef.current.scrollTo({
              x: 0,
              y: dataSourceCordsReports.current[10] + 420,
              animated: true,
            });
            setTopLodaer(false);
          }

          if (data?.length !== 10) {
            isDataLoadedReports = true;
          }
          if (pageToFetch === 1) {
            isDataLoadedReportsTop = true;
          }

          setClubReportLoader(false);
          setBottomLodaer(false);
        }),
      );
    } catch (error) {
      setBottomLodaer(false);
      setClubReportLoader(false);
      isDataLoadedReports = false;
      pageNoReports = 1;
    }
  };

  const getClubEvent = async (isRefresh, isBottom, isTop, isStart) => {
    isDataLoadedEventTop = false;
    isDataLoadedEvent = false;

    try {
      if (isBottom) {
        setBottomLodaer(true);
      } else if (isTop) {
        setTopLodaer(true);
      } else if (isStart) {
        isDataLoadedEvent = false;
        isDataLoadedEventTop = false;
        setClubEventLoader(true);
      } else if (isRefresh) {
        isDataLoadedEvent = false;
        pageNoEvent = 1;
        pageNoEventBottom = 1;
        pageNoEventTop = 1;
        setClubEventLoader(true);
      } else {
        setClubEventLoader(true);
      }

      isFetchingEvent = true;
      const pageToFetch = isBottom
        ? pageNoEventBottom
        : isTop
        ? pageNoEventTop
        : pageNoEvent;

      dispatch(
        fetchClubEvents(
          clubid,
          pageToFetch,
          10,
          (successFlag, isLastPageFlag) => {
            setBottomLodaer(false);
            setTopLodaer(false);
            setClubEventLoader(false);
            isFetchingEvent = false;

            if (!successFlag) {
              isDataLoadedEvent = false;
              isDataLoadedEventTop = false;
              pageNoEvent = 1;
              pageNoEventBottom = 1;
              pageNoEventTop = 1;
              return;
            }

            if (isLastPageFlag) {
              isDataLoadedEvent = true;
            }
            if (pageToFetch === 1 || pageNoEventTop === 1) {
              isDataLoadedEventTop = true;
            }

            // Scroll handling for isTop case
            if (isTop && dataSourceCords.current?.length >= 10) {
              scrollViewRef.current.scrollTo({
                x: 0,
                y: dataSourceCords.current[10] + 420,
                animated: true,
              });
            }
          },
        ),
      );
    } catch (error) {
      setBottomLodaer(false);
      setTopLodaer(false);
      setClubEventLoader(false);
      isDataLoadedEvent = false;
      isDataLoadedEventTop = false;
      isFetchingEvent = false;
      pageNoEvent = 1;
      pageNoEventBottom = 1;
      pageNoEventTop = 1;
    }
  };

  const ClubJoin = async ClubID => {
    dispatch(
      joinClub(ClubID, (success, message) => {
        if (success) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message || 'join successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        } else {
          setTimeout(
            () => {
              setSuccess(true);
              setIserror(true);
              setSuccessDescription(message || 'Failed to join club');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const AcceptInvitation = async (clubId, MemberId) => {
    dispatch(
      acceptClubInvitation(clubId, MemberId, (success, message) => {
        if (success) {
          getClubMemeberList();
          // getClubActiveMemeberList();
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message || 'accept successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        } else {
          setTimeout(
            () => {
              setSuccess(true);
              setIserror(true);
              setSuccessDescription(message || 'Failed to accept invitation');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const RejectInvitation = async (clubId, MemberId) => {
    dispatch(
      rejectClubInvitation(clubId, MemberId, (success, message) => {
        if (success) {
          getClubMemeberList();
          // getClubActiveMemeberList();
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message || 'decline successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        } else {
          setTimeout(
            () => {
              setSuccess(true);
              setIserror(true);
              setSuccessDescription(message || 'Failed to decline invitation');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const DeleteClubGallery = async (Clubid, targetId, targetType) => {
    if (user !== null) {
      dispatch(
        deleteGalleryImage(Clubid, targetId, targetType, (success, message) => {
          if (success) {
            setTimeout(
              () => {
                setSuccess(true);
                setSuccessDescription(message || 'deleted successfully');
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          } else {
            setTimeout(
              () => {
                setSuccess(true);
                setIserror(true);
                setSuccessDescription(message || 'Failed to delete image');
              },
              Platform.OS === 'ios' ? 300 : 0,
            );
          }
        }),
      );
    }
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

  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    return contentOffset.y <= 0;
  };

  const onEventLikeClick = async Id => {
    try {
      const payload = { eventId: Id };
      dispatch(
        likeEvent(payload, Id, (successFlag, res) => {
          if (successFlag) {
          }
        }),
      );
    } catch (err) {}
  };

  const DeleteClubMember = async (clubId, MemberId, self) => {
    dispatch(
      removeClubMember(clubId, MemberId, self, (success, message) => {
        if (success) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription(message || 'deleted successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        } else {
          setTimeout(
            () => {
              setSuccess(true);
              setIserror(true);
              setSuccessDescription(message || 'Failed to delete member');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      }),
    );
  };

  const OnGoingClick = async (id, status) => {
    try {
      let data = {
        eventId: id,
        memberId: user?.id,
        status: status,
      };
      let response = await ClubsAPi.clubEventMember(data);
      if (response) {
        try {
          const eventDetails = await ClubApi.getclubseventDetails(id);
          const updatedEvent = JSON.parse(eventDetails);
          dispatch(
            mergeEvent({
              id: id,
              data: updatedEvent,
            }),
          );
        } catch (e) {}
      }
    } catch (err) {}
  };

  const ClubTripAccept = async (id, isDriver) => {
    if (id !== null && id !== undefined && id !== '') {
      try {
        SetshowLoading(true);
        const response = await ClubsAPi.ClubTripAccept(id, isDriver);
        SetshowLoading(false);
        if (response) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription('accept successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      } catch (error) {
        SetshowLoading(false);
      }
    }
  };

  const ClubTripReject = async id => {
    if (id !== null && id !== undefined && id !== '') {
      try {
        SetshowLoading(true);
        const response = await dispatch(rejectClubTrip(id));
        SetshowLoading(false);
        if (response) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription('decline successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
          // refresh trips
          getClubTrips(true);
        }
      } catch (error) {
        SetshowLoading(false);
      }
    }
  };

  const ClubTripJoin = async (id, isDriver) => {
    SetshowLoading(true);
    let data = {
      tripId: id,
      isDriver: isDriver,
      clubId: clubid,
    };
    try {
      const response = await Trip.sendJoin(data);
      SetshowLoading(false);
      if (response) {
        setTimeout(
          () => {
            setSuccess(true);
            setSuccessDescription('join successfully');
          },
          Platform.OS === 'ios' ? 300 : 0,
        );
      }
    } catch (error) {
      SetshowLoading(false);
    } finally {
      SetshowLoading(false);
    }
  };

  const DeleteFourm = async forumId => {
    if (
      forumId !== null &&
      forumId !== undefined &&
      forumId !== '' &&
      forumId !== 0
    ) {
      setClubForumLoader(true);
      try {
        const response = await dispatch(deleteForum(forumId));
        setClubForumLoader(false);
        if (response) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription('deleted successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
          // refresh forum list if needed
          getClubForum(true);
        }
      } catch (error) {
        setClubForumLoader(false);
      }
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
              ? 'clubtripreportimage'
              : selectImageType === 'galleryimage'
              ? 'clubgallery'
              : selectImageType === 'forumimage'
              ? 'clubforumimage'
              : 'clubgallery',
          RecordType: 'report',
          clubId: clubid,
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

  // --- new helpers: per-tab loader & refresh handling (no other logic changed) ---
  const getLoaderForSelection = () => {
    // map the currently selected tab to its loader flag
    switch (selection) {
      case 1: // Forum
        return ClubForumLoader && forumFromStore?.length == 0;
      case 2: // Members
        return ClubMembersLoader && ClubMembers?.length == 0;
      case 3: // Gallery
        return ClubGallerymagesLoader && ClubGalleryImages?.length == 0;
      case 4: // Trips
        return ClubTripsLoader && tripsFromStore?.length == 0;
      case 5: // Reports
        return ClubReportLoader && reportsFromStore?.length == 0;
      case 6: // Event
        return ClubEventLoader && clubEventsFromStore?.length == 0;
      case 7: // About
        return ClubProfileLoader;
      default:
        return false;
    }
  };

  const isRefreshingForSelection = () => {
    // same mapping but used by RefreshControl 'refreshing' prop
    switch (selection) {
      case 1: // Forum
        return ClubForumLoader && forumFromStore?.length == 0;
      case 2: // Members
        return ClubMembersLoader && ClubMembers?.length == 0;
      case 3: // Gallery
        return ClubGallerymagesLoader && ClubGalleryImages?.length == 0;
      case 4: // Trips
        return ClubTripsLoader && tripsFromStore?.length == 0;
      case 5: // Reports
        return ClubReportLoader && reportsFromStore?.length == 0;
      case 6: // Event
        return ClubEventLoader && clubEventsFromStore?.length == 0;
      case 7: // About
        return ClubProfileLoader;
      default:
        return false;
    }
  };

  const onRefreshByTab = () => {
    if (selection === 1) {
      getClubForum(true);
    } else if (selection === 2) {
      getClubMemeberList();
      // getClubActiveMemeberList();
    } else if (selection === 3) {
      getClubGalleryImages();
    } else if (selection === 4) {
      getClubTrips(true);
    } else if (selection === 5) {
      getClubReport(true);
    } else if (selection === 6) {
      getClubEvent(true);
    } else if (selection === 7) {
      getClubProfile();
    } else {
      getClubProfile();
    }
  };

  // --- original return block with only Loader and RefreshControl wiring changed ---
  return (
    <>
      <SafeAreaView style={styles.container}>
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={backButtonClick}
          title={'Global Surf Club'}
          textAlign={'center'}
        />
        {!currentNetworkStatus && (
          <View>
            <ConnectionBanner isOnline={currentNetworkStatus} />
          </View>
        )}

        {lastSync && !showLoading && currentNetworkStatus && (
          <View>
            <SyncInfo
              lastSyncTime={lastSync}
              showLoading={showLoading}
              currentNetworkStatus={currentNetworkStatus}
            />
          </View>
        )}

        {/* Loader now shows only for the active tab */}
        <Loader visible={getLoaderForSelection()} />

        <ScrollView
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              if (selection === 1) {
                if (!isFetchingForum && !isDataLoadedForum) {
                  pageNoForumBottom += 1;
                  getClubForum(false, true);
                }
              } else if (selection === 4) {
                if (!isFetchingTrips && !isDataLoadedTrips) {
                  pageNoTripsBottom += 1;
                  getClubTrips(false, true);
                }
              } else if (selection === 5) {
                if (!isFetchingReports && !isDataLoadedReports) {
                  pageNoReportsBottom += 1;
                  getClubReport(false, true);
                }
              } else if (selection === 6) {
                if (!isFetchingEvent && !isDataLoadedEvent) {
                  pageNoEventBottom += 1;
                  getClubEvent(false, true);
                }
              }
            } else if (isCloseToTop(nativeEvent)) {
              if (selection == 1) {
                if (!isFetchingForum && !isDataLoadedForumTop) {
                  pageNoForumTop -= 1;
                  getClubForum(false, false, true);
                }
              } else if (selection == 4) {
                if (!isFetchingTrips && !isDataLoadedTripsTop) {
                  pageNoTripsTop -= 1;
                  getClubTrips(false, false, true);
                }
              } else if (selection == 5) {
                if (!isFetchingReports && !isDataLoadedReportsTop) {
                  pageNoReportsTop -= 1;
                  getClubReport(false, false, true);
                }
              } else if (selection == 6) {
                if (!isFetchingEvent && !isDataLoadedEventTop) {
                  pageNoEventTop -= 1;
                  getClubEvent(false, false, true);
                }
              }
            }
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
          alwaysBounceVertical={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          ref={scrollViewRef}
        >
          <View style={[styles.viewContainer, { flex: 1 }]}>
            <View
              style={[
                styles.profileContainer,
                {
                  marginTop:
                    lastSync || !currentNetworkStatus ? 0 : dynamicSize(15),
                },
              ]}
            >
              <View style={styles.profilemembercon}>
                <View style={{ width: '37%' }}>
                  <ShowButton
                    title={`${
                      ClubMembers?.filter(x => x?.statuString !== 'Pending')
                        ?.length + 1
                    } members`}
                    backgroundColor="white"
                  />
                </View>
                <View
                  style={{
                    width: '25%',
                    alignItems: 'center',
                    borderRadius: 100,
                  }}
                >
                  {ClubsDetail?.thumbnailLogoPath && !isUserDeleted ? (
                    <FastImage
                      style={styles.mainprofileImage}
                      source={{
                        uri: ClubsDetail?.thumbnailLogoPath,
                        cache: FastImage.cacheControl.immutable,
                      }}
                    />
                  ) : (
                    <FastImage
                      style={[styles.mainprofileImage, { opacity: 0.5 }]}
                      source={require('../assets/images/logo.png')}
                    />
                  )}
                </View>
                <View style={{ width: '37%' }}>
                  {ClubsDetail?.isPublic === 'true' ||
                  ClubsDetail?.isPublic === true ? (
                    <ShowButton title="public club" backgroundColor="white" />
                  ) : (
                    <ShowButton title="private club" backgroundColor="white" />
                  )}
                </View>
              </View>

              <Text style={styles.name}>
                {isUserDeleted
                  ? 'Inactive Club'
                  : ClubsDetail?.title?.length
                  ? ClubsDetail?.title
                  : 'N/A'}
              </Text>
              {!isUserDeleted && (
                <Text style={styles.address}>
                  {ClubsDetail?.city?.length ? ClubsDetail?.city : 'N/A'}
                  {', '}
                  {ClubsDetail?.country?.length ? ClubsDetail?.country : 'N/A'}
                </Text>
              )}
              <View style={styles.InlineButton}>
                <ShowButton
                  title={`Trips ${
                    TripCount?.tripCount ? TripCount?.tripCount : 0
                  }`}
                  backgroundColor="white"
                />
                <ShowButton
                  title={`Report ${
                    TripCount?.reportCount ? TripCount?.reportCount : 0
                  }`}
                  backgroundColor="white"
                />
                <ShowButton
                  title={`Result ${TripCount?.result ? TripCount?.result : 0}`}
                  backgroundColor="white"
                />
              </View>
              <Text style={styles.passenger}>
                Organiser,{' '}
                {isUserDeleted
                  ? 'Deletion Requested'
                  : ClubsDetail?.clubOrganizer?.firstName?.length > 0
                  ? ClubsDetail?.clubOrganizer?.firstName
                  : 'N/A'}{' '}
                {!isUserDeleted
                  ? ClubsDetail?.clubOrganizer?.lastName?.length > 0
                    ? ClubsDetail?.clubOrganizer?.lastName
                    : 'N/A'
                  : ''}
              </Text>
              <View style={styles.InlineButton}>
                {ClubsDetail?.organizerId !== user?.id ? (
                  <ImageButton
                    title="Contact"
                    icon={require('../assets/images/icon/message.png')}
                    backgroundColor={Color.lightblue}
                    color="white"
                    onPress={() => {
                      gotoClubChat(ClubsDetail?.organizerId);
                    }}
                    disabled={isUserDeleted}
                  />
                ) : (
                  <></>
                )}

                {ClubsDetail?.organizerId !== user?.id ? (
                  ClubsDetail?.status === 'Pending' ? (
                    <ImageButton
                      title="Requested"
                      backgroundColor={Color.lightblue}
                      color="white"
                      onPress={() => {}}
                      disabled={isUserDeleted}
                    />
                  ) : ClubsDetail?.status === 'InvitationSent' ? (
                    <>
                      <ImageButton
                        title="Accept"
                        backgroundColor={Color.lightblue}
                        color="white"
                        onPress={() => {
                          AcceptInvitation(clubid, user?.id);
                        }}
                        disabled={isUserDeleted}
                      />
                      <ImageButton
                        title="Reject"
                        backgroundColor={Color.lightblue}
                        color="white"
                        onPress={() => RejectInvitation(clubid, user?.id)}
                        disabled={isUserDeleted}
                      />
                    </>
                  ) : ClubsDetail?.status === 'Joined' ? (
                    <ImageButton
                      title="Member"
                      backgroundColor={Color.lightblue}
                      color="white"
                      disabled={isUserDeleted}
                    />
                  ) : (
                    <ImageButton
                      title="JOIN"
                      backgroundColor={Color.lightblue}
                      color="white"
                      onPress={() => {
                        ClubJoin(clubid);
                      }}
                      disabled={isUserDeleted}
                    />
                  )
                ) : (
                  <></>
                )}
              </View>
            </View>
            <LinearGradient
              locations={[0, 0.2]}
              colors={['#fff', '#399de6']}
              style={styles.linearGradient}
            >
              <ImageBackground
                source={require('../assets/images/icon/clubbg.png')}
                tintColor={'#399de6'}
                imageStyle={{
                  resizeMode: 'stretch',
                  height: 600,
                  tintColor: '#399de6',
                }}
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
                        onPress={() => {
                          setSelection(1);
                          getClubForum(true);
                        }}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            selection === 1 ? { color: 'white' } : null,
                          ]}
                        >
                          Forum
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
                          Members
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
                          Gallery
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
                          Trips
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.btn,
                          selection === 5
                            ? { backgroundColor: Color.lightblue }
                            : null,
                        ]}
                        onPress={() => setSelection(5)}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            selection === 5 ? { color: 'white' } : null,
                          ]}
                        >
                          Reports
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
                          Event
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.btn,
                          selection === 7
                            ? { backgroundColor: Color.lightblue }
                            : null,
                        ]}
                        onPress={() => setSelection(7)}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            selection === 7 ? { color: 'white' } : null,
                          ]}
                        >
                          About
                        </Text>
                      </Pressable>
                    </View>
                  </ScrollView>
                </View>
                <View>
                  {selection === 1 ? (
                    <>
                      <View style={{ minHeight: 500, flex: 1 }}>
                        <Pressable
                          style={styles.addmemberbtn}
                          onPress={e => {
                            navigation.navigate('CreateClubForumPost', {
                              clubid,
                            });
                          }}
                          disabled={isUserDeleted}
                          // disabled={!currentNetworkStatus}
                        >
                          <Text style={styles.addtext}>Create Forum</Text>
                        </Pressable>
                        {forumFromStore?.length === 0 ? (
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
                          //   No Forum Available
                          // </Text>
                          <StatusMessage
                            isOnline={currentNetworkStatus}
                            hasData={forumFromStore?.length > 0}
                            color={Color.white}
                            title={'No Forum Available'}
                          />
                        ) : (
                          <>
                            <ScrollView style={{ flex: 1 }}>
                              {TopLodaer ? (
                                <ViewforumFromStore
                                  style={{
                                    height: dynamicSize(50),
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <ActivityIndicator color={Color.black0} />
                                </ViewforumFromStore>
                              ) : (
                                <></>
                              )}
                              {forumFromStore?.length > 0 &&
                                forumFromStore?.map((item, index) => {
                                  return (
                                    <ClubPostCardItem
                                      onLayout={event => {
                                        const layout = event.nativeEvent.layout;
                                        dataSourceCordsForum.current[index] =
                                          layout.y;
                                        if (
                                          dataSourceCordsForum.current?.length >
                                            0 &&
                                          dataSourceCordsForum.current?.length <
                                            11
                                        ) {
                                          scrollViewRef.current.scrollTo({
                                            x: 0,
                                            y: dataSourceCordsForum.current[
                                              scrollToIndexForum.current
                                            ],
                                            animated: true,
                                          });
                                        }
                                      }}
                                      item={item}
                                      key={item.id || index}
                                      ForumID={props?.route?.params?.ForumID}
                                      onPressImage={(image, id, Id) => {
                                        setImagePreviewModal(true);
                                        setImageUrl(image);
                                        setselectusersID(id);
                                        setcreatebyID(Id);
                                      }}
                                      onclickcomment={() => {
                                        gotocomment(
                                          item?.id,
                                          item?.postComments,
                                          item?.title,
                                        );
                                      }}
                                      onPressUpdateForm={ForumDetails => {
                                        navigation.navigate(
                                          'CreateClubForumPost',
                                          {
                                            clubid,
                                            ForumDetails,
                                          },
                                        );
                                      }}
                                      onPressDeleteForm={FourmID => {
                                        Alert.alert(
                                          'Alert',
                                          'Are you sure you want to remove this forum post?',
                                          [
                                            {
                                              text: 'No',
                                            },
                                            {
                                              text: 'Yes',
                                              style: 'destructive',
                                              onPress: async () => {
                                                DeleteFourm(FourmID);
                                              },
                                            },
                                          ],
                                        );
                                      }}
                                      onCardClick={post => {
                                        navigation.navigate(
                                          'PostDetailScreen',
                                          { postId: post?.id, clubId: clubid },
                                        );
                                      }}
                                    />
                                  );
                                })}

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
                            </ScrollView>
                          </>
                        )}
                        <PreviewModal
                          visible={imagePreviewModal}
                          onClose={() => {
                            setImagePreviewModal(false);
                          }}
                          onOpen={() => {
                            setImagePreviewModal(true);
                          }}
                          selectimageID={selectusersID}
                          reportbutton={createbyID === user.id ? false : true}
                          photoUrl={imageUrl}
                          pageName={'forumimage'}
                        />
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 2 ? (
                    <>
                      <View style={{ minHeight: 500 }}>
                        {ClubsDetail?.organizerId === user?.id ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              paddingRight: 10,
                            }}
                          >
                            <Pressable
                              style={styles.addmemberbtn}
                              onPress={() => {
                                navigation.navigate('ClubInvite', { clubid });
                              }}
                              disabled={isUserDeleted}
                            >
                              <Text style={styles.addtext}>
                                GSC Member Invite
                              </Text>
                            </Pressable>
                            <Pressable
                              style={styles.addmemberbtn}
                              onPress={() => {
                                navigation.navigate('ClubAppInvite', {
                                  clubid,
                                });
                              }}
                              disabled={isUserDeleted}
                            >
                              <Text style={styles.addtext}>
                                Non GSC Member Invite
                              </Text>
                            </Pressable>
                          </View>
                        ) : (
                          <></>
                        )}

                        {ClubMembers.length === 0 ? (
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
                          //   No Member Available
                          // </Text>
                          <StatusMessage
                            isOnline={currentNetworkStatus}
                            hasData={ClubMembers?.length > 0}
                            color={Color.white}
                            title={'No Member Available'}
                          />
                        ) : (
                          <ScrollView style={{ flex: 1 }}>
                            <View style={styles.friendsection}>
                              {ClubMembers.map((item, index) => {
                                const isUserDeleted =
                                  Array.isArray(user?.inActiveUsers) &&
                                  user.inActiveUsers.some(
                                    id =>
                                      String(id) === String(item?.member.id),
                                  );
                                return (
                                  <Pressable
                                    key={index}
                                    style={[
                                      styles.friendcontainer,
                                      {
                                        alignItems: 'center',
                                        borderColor:
                                          props?.route?.params?.MemberID ==
                                          item?.member?.id
                                            ? heightlightColor
                                            : Color?.white,
                                        borderWidth: 2,
                                        borderRadius: 10,
                                        padding: 5,
                                      },
                                    ]}
                                    onLayout={event => {
                                      const layout = event.nativeEvent.layout;
                                      dataSourceCordsMember.current[index] =
                                        layout.y;
                                      dataSourceCordsMember.current =
                                        dataSourceCordsMember.current;
                                      if (
                                        dataSourceCordsMember.current?.length >
                                          0 &&
                                        dataSourceCordsMember.current?.length <
                                          11
                                      ) {
                                        scrollViewRef.current.scrollTo({
                                          x: 0,
                                          // y: dataSourceCordsMember.current[scrollToIndexMember.current] + scrollToIndexMember.current !== 0 && scrollToIndexMember.current !== '0' ? 420 : 0,
                                          y: dataSourceCordsMember.current[
                                            scrollToIndexMember.current
                                          ],
                                          animated: true,
                                        });
                                      }
                                    }}
                                  >
                                    <View style={styles.row}>
                                      <View style={styles.friendimgcontainer}>
                                        <Pressable
                                          ressable
                                          onPress={() => {
                                            !isUserDeleted &&
                                              navigation.navigate('Profile', {
                                                userId: item?.member.id,
                                              });
                                          }}
                                        >
                                          <FastImage
                                            style={styles.friendimg}
                                            source={
                                              isUserDeleted
                                                ? require('../assets/images/logo.png')
                                                : {
                                                    uri: item?.member
                                                      ?.thumbnailProfileImage,
                                                    cache:
                                                      FastImage.cacheControl
                                                        .immutable,
                                                  }
                                            }
                                          />
                                        </Pressable>
                                      </View>
                                      <View style={{ width: '70%' }}>
                                        <Text style={styles.friendname}>
                                          {isUserDeleted
                                            ? 'Deletion Requested'
                                            : item?.member?.firstName}{' '}
                                          {!isUserDeleted &&
                                            item?.member?.lastName}
                                        </Text>
                                        {!isUserDeleted && (
                                          <Text style={styles.friendaddress}>
                                            {(item?.member?.city ??
                                            item?.member?.state
                                              ? (item?.member?.city ??
                                                  item?.member?.state) + ', '
                                              : '') +
                                              (item?.member?.country ?? '')}
                                          </Text>
                                        )}
                                      </View>
                                    </View>
                                    {!isUserDeleted && (
                                      <View style={styles.smallbtnrow}>
                                        {ClubsDetail?.organizerId !==
                                        item?.memberId ? (
                                          ClubsDetail?.organizerId ===
                                          user?.id ? (
                                            item?.statuString === 'Pending' ? (
                                              <View
                                                style={{
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                }}
                                              >
                                                <Pressable
                                                  style={[
                                                    styles.smallbtn,
                                                    {
                                                      backgroundColor:
                                                        Color.lightblue,
                                                      borderWidth: 1,
                                                      borderColor:
                                                        Color.lightblue,
                                                      marginRight: 5,
                                                    },
                                                  ]}
                                                  onPress={() => {
                                                    AcceptInvitation(
                                                      item?.clubId,
                                                      item?.memberId,
                                                    );
                                                  }}
                                                  disabled={isUserDeleted}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.smalltext,
                                                      { color: Color.white },
                                                    ]}
                                                  >
                                                    Approve
                                                  </Text>
                                                </Pressable>
                                                <Pressable
                                                  style={[
                                                    styles.smallbtn,
                                                    {
                                                      backgroundColor:
                                                        Color.white,
                                                      borderWidth: 1,
                                                      borderColor:
                                                        Color.lightblue,
                                                    },
                                                  ]}
                                                  onPress={() => {
                                                    RejectInvitation(
                                                      item?.clubId,
                                                      item?.memberId,
                                                    );
                                                  }}
                                                  disabled={isUserDeleted}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.smalltext,
                                                      {
                                                        color: Color.lightblue,
                                                      },
                                                    ]}
                                                  >
                                                    Decline
                                                  </Text>
                                                </Pressable>
                                              </View>
                                            ) : item?.statuString ===
                                              'InvitationSent' ? (
                                              <Pressable
                                                onPress={() => {}}
                                                style={[
                                                  {
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                  },
                                                ]}
                                                disabled={isUserDeleted}
                                              >
                                                <View
                                                  style={{
                                                    flexDirection: 'row',
                                                  }}
                                                >
                                                  <MaterialCommunityIcons
                                                    size={15}
                                                    color={Color.cardgray}
                                                    name="clock-time-eight"
                                                  />
                                                  <Text
                                                    style={[
                                                      styles.friendaddress,
                                                      { left: 5 },
                                                    ]}
                                                  >
                                                    Pending
                                                  </Text>
                                                </View>
                                              </Pressable>
                                            ) : item?.statuString ===
                                              'Joined' ? (
                                              <Pressable
                                                onPress={() => {
                                                  Alert.alert(
                                                    'Alert',
                                                    'Are you sure you want to remove this member from the club?',
                                                    [
                                                      {
                                                        text: 'No',
                                                      },
                                                      {
                                                        text: 'Yes',
                                                        style: 'destructive',
                                                        onPress: async () => {
                                                          DeleteClubMember(
                                                            item?.clubId,
                                                            item?.memberId,
                                                            'organizer',
                                                          );
                                                        },
                                                      },
                                                    ],
                                                  );
                                                }}
                                                style={[
                                                  {
                                                    width: 30,
                                                    height: 30,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                  },
                                                ]}
                                                disabled={isUserDeleted}
                                              >
                                                <Entypo
                                                  size={18}
                                                  name="circle-with-cross"
                                                  style={{
                                                    color: Color.lightblue,
                                                  }}
                                                />
                                              </Pressable>
                                            ) : (
                                              <></>
                                            )
                                          ) : user?.id === item?.memberId ? (
                                            item?.statuString === 'Pending' ? (
                                              <Pressable
                                                onPress={() => {}}
                                                style={[
                                                  {
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                  },
                                                ]}
                                              >
                                                <View
                                                  style={{
                                                    flexDirection: 'row',
                                                  }}
                                                >
                                                  <MaterialCommunityIcons
                                                    size={15}
                                                    color={Color.cardgray}
                                                    name="clock-time-eight"
                                                  />
                                                  <Text
                                                    style={[
                                                      styles.friendaddress,
                                                      { left: 5 },
                                                    ]}
                                                  >
                                                    Pending
                                                  </Text>
                                                </View>
                                              </Pressable>
                                            ) : item?.statuString ===
                                              'InvitationSent' ? (
                                              <View
                                                style={{
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                }}
                                              >
                                                <Pressable
                                                  style={[
                                                    styles.smallbtn,
                                                    {
                                                      backgroundColor:
                                                        Color.lightblue,
                                                      borderWidth: 1,
                                                      borderColor:
                                                        Color.lightblue,
                                                      marginRight: 5,
                                                    },
                                                  ]}
                                                  onPress={() => {
                                                    AcceptInvitation(
                                                      item?.clubId,
                                                      item?.memberId,
                                                    );
                                                  }}
                                                  disabled={isUserDeleted}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.smalltext,
                                                      { color: Color.white },
                                                    ]}
                                                  >
                                                    Approve
                                                  </Text>
                                                </Pressable>
                                                <Pressable
                                                  style={[
                                                    styles.smallbtn,
                                                    {
                                                      backgroundColor:
                                                        Color.white,
                                                      borderWidth: 1,
                                                      borderColor:
                                                        Color.lightblue,
                                                    },
                                                  ]}
                                                  onPress={() => {
                                                    RejectInvitation(
                                                      item?.clubId,
                                                      item?.memberId,
                                                    );
                                                  }}
                                                  disabled={isUserDeleted}
                                                >
                                                  <Text
                                                    style={[
                                                      styles.smalltext,
                                                      {
                                                        color: Color.lightblue,
                                                      },
                                                    ]}
                                                  >
                                                    Decline
                                                  </Text>
                                                </Pressable>
                                              </View>
                                            ) : item?.statuString ===
                                              'Joined' ? (
                                              <Pressable
                                                onPress={() => {
                                                  Alert.alert(
                                                    'Alert',
                                                    'Are you sure you want to leave this club? ',
                                                    [
                                                      {
                                                        text: 'No',
                                                      },
                                                      {
                                                        text: 'Yes',
                                                        style: 'destructive',
                                                        onPress: async () => {
                                                          DeleteClubMember(
                                                            item?.clubId,
                                                            item?.memberId,
                                                            'self',
                                                          );
                                                        },
                                                      },
                                                    ],
                                                  );
                                                }}
                                                style={[
                                                  {
                                                    width: 30,
                                                    height: 30,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                  },
                                                ]}
                                                disabled={isUserDeleted}
                                              >
                                                <Entypo
                                                  size={18}
                                                  name="circle-with-cross"
                                                  style={{
                                                    color: Color.lightblue,
                                                  }}
                                                />
                                              </Pressable>
                                            ) : (
                                              <></>
                                            )
                                          ) : (
                                            <></>
                                          )
                                        ) : (
                                          <View style={styles.OrgniserText}>
                                            <Text style={styles.friendname}>
                                              Organiser
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    )}
                                  </Pressable>
                                );
                              })}
                            </View>
                          </ScrollView>
                        )}
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

                        <ModalItem
                          setModalVisible={setModalVisible}
                          modalVisible={modalVisible}
                          text={
                            'Coming soon,menbers will be alble to connect as friend'
                          }
                          btntext={'Okay'}
                        />
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 3 ? (
                    <>
                      <View style={{ minHeight: 500 }}>
                        {ClubsDetail?.organizerId === user?.id ? (
                          <Pressable
                            style={styles.galleryimgcontainer}
                            onPress={async () => {
                              setGalleryImagePickerModa(true);
                            }}
                            disabled={isUserDeleted}
                          >
                            <FastImage
                              style={styles.icon}
                              source={require('../assets/images/icon/galleryCamera.png')}
                              tintColor={Color.white}
                              resizeMode="contain"
                            />
                          </Pressable>
                        ) : (
                          <></>
                        )}
                        <View>
                          {ClubGalleryImages.length === 0 ? (
                            <StatusMessage
                              isOnline={currentNetworkStatus}
                              hasData={ClubGalleryImages?.length > 0}
                              color={Color.white}
                              title={'No Images Available'}
                            />
                          ) : (
                            <PhotoGrid
                              onPressDot={url => {
                                if (isUserDeleted) return;

                                const deleteItem = ClubGalleryImages?.find(
                                  item => item?.imageUrl === url,
                                );

                                setselectImageID(deleteItem?.id);
                                setselectImageType(deleteItem?.imageType);
                                setDeleteModal(true);
                                currentImage.current = deleteItem;
                              }}
                              PhotosList={ClubGalleryImages}
                              borderRadius={10}
                              ClubId={clubid}
                            />
                          )}
                        </View>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 4 ? (
                    <>
                      <View style={{ minHeight: 500, flex: 1 }}>
                        <Pressable
                          style={styles.addmemberbtn}
                          onPress={gotoClubOrganizetrip}
                          disabled={isUserDeleted}
                        >
                          <Text style={styles.addtext}>Organised Trip</Text>
                        </Pressable>
                        <>
                          <ScrollView style={{ flex: 1 }}>
                            {TopLodaer ? (
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

                            {tripsFromStore?.length > 0 ? (
                              tripsFromStore?.map((item, index) => {
                                return (
                                  <Communityinfo
                                    onLayout={event => {
                                      const layout = event.nativeEvent.layout;
                                      dataSourceCordsTrip.current[index] =
                                        layout.y;
                                      if (
                                        dataSourceCordsTrip.current?.length >
                                          0 &&
                                        dataSourceCordsTrip.current?.length < 11
                                      ) {
                                        scrollViewRef.current.scrollTo({
                                          x: 0,
                                          // y: dataSourceCordsTrip.current[scrollToIndexTrip.current] + scrollToIndexTrip.current !== 0 && scrollToIndexTrip.current !== '0' ? 420 : 0,
                                          y: dataSourceCordsTrip.current[
                                            scrollToIndexTrip.current
                                          ],
                                          animated: true,
                                        });
                                      }
                                    }}
                                    onCardClick={GotoTripDetail}
                                    onPressinfobutton={tripId => {
                                      setTripID(tripId),
                                        setisInvited(true),
                                        setisModalVisible(true);
                                    }}
                                    onPressAccept={tripId => {
                                      setTripID(tripId),
                                        setisInvited(false),
                                        setisModalVisible(true);
                                    }}
                                    onPressDecline={tripId => {
                                      ClubTripReject(tripId);
                                    }}
                                    marginHorizontal={5}
                                    item={item}
                                    key={item.id || index}
                                    TripID={props?.route?.params?.TripID}
                                  />
                                );
                              })
                            ) : (
                              <StatusMessage
                                isOnline={currentNetworkStatus}
                                hasData={tripsFromStore?.length > 0}
                                color={Color.white}
                                title={'No Trips Available'}
                              />
                            )}

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
                          </ScrollView>
                        </>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 5 ? (
                    <>
                      <View style={{ minHeight: 500 }}>
                        <ScrollView style={{ flex: 1 }}>
                          {TopLodaer ? (
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
                          {reportsFromStore?.length > 0 ? (
                            reportsFromStore?.map((item, index) => {
                              return (
                                <TripReport
                                  onLayout={event => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCordsReports.current[index] =
                                      layout.y;
                                    if (
                                      dataSourceCordsReports.current?.length >
                                        0 &&
                                      dataSourceCordsReports.current?.length <
                                        11
                                    ) {
                                      scrollViewRef.current.scrollTo({
                                        x: 0,
                                        y: dataSourceCordsReports.current[
                                          scrollToIndexReports.current
                                        ],
                                        animated: true,
                                      });
                                    }
                                  }}
                                  onPressreportImage={() => {
                                    setreportimagePreviewModal(true);
                                    setReportUrl(item?.images?.[0]?.imageUrl);
                                    setreportselectusersID(item?.id);
                                  }}
                                  onPressRead={() => {
                                    GotoTripReport(item);
                                  }}
                                  item={item}
                                  key={item.id || index}
                                  ReportID={props?.route?.params?.TripReportID}
                                />
                              );
                            })
                          ) : (
                            <StatusMessage
                              isOnline={currentNetworkStatus}
                              hasData={reportsFromStore?.length > 0}
                              color={Color.white}
                              title={'No Reports Available'}
                            />
                          )}
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
                        </ScrollView>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 6 ? (
                    <>
                      <View style={{ minHeight: 500, flex: 1 }}>
                        <Pressable
                          style={styles.addmemberbtn}
                          onPress={gotoCreateEvent}
                          disabled={!currentNetworkStatus || isUserDeleted}
                        >
                          <Text style={styles.addtext}>Create An Event</Text>
                        </Pressable>
                        <ScrollView style={{ flex: 1 }}>
                          {TopLodaer ? (
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
                          {clubEventsFromStore?.length > 0 ? (
                            clubEventsFromStore?.map((item, index) => {
                              return (
                                <Eventlist
                                  onLayout={event => {
                                    const layout = event.nativeEvent.layout;
                                    dataSourceCords.current[index] = layout.y;
                                    if (
                                      dataSourceCords.current?.length > 0 &&
                                      dataSourceCords.current?.length < 11
                                    ) {
                                      scrollViewRef.current.scrollTo({
                                        x: 0,
                                        y: dataSourceCords.current[
                                          scrollToIndex.current
                                        ],
                                        animated: true,
                                      });
                                    }
                                  }}
                                  onCardClick={Id => {
                                    gotoeventdetail(Id);
                                  }}
                                  onEventLikeClick={Id => {
                                    onEventLikeClick(Id);
                                  }}
                                  onEventCommentClick={(
                                    Id,
                                    onlyAdminCommentOnly,
                                    organizerId,
                                  ) => {
                                    onEventCommentClick(
                                      Id,
                                      onlyAdminCommentOnly,
                                      organizerId,
                                    );
                                  }}
                                  Maybe={item => {
                                    setAttendClubEventID(item);
                                    setMaybeGoing(true);
                                    setMaybe('Maybe');
                                  }}
                                  GoingTo={item => {
                                    setAttendClubEventID(item);
                                    setMaybeGoing(true);
                                    setMaybe('GoingTo');
                                  }}
                                  AttendClub={item => {
                                    setAttendClubEventID(item);
                                    setIsAttended(true);
                                  }}
                                  marginHorizontal={5}
                                  item={item}
                                  key={index}
                                  EventIDH={props?.route?.params?.EventIDH}
                                  userId={user?.id}
                                />
                              );
                            })
                          ) : (
                            <StatusMessage
                              isOnline={currentNetworkStatus}
                              hasData={clubEventsFromStore?.length > 0}
                              color={Color.white}
                              title={'No Events Available'}
                            />
                          )}
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
                        </ScrollView>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}

                  {selection === 7 ? (
                    <>
                      <View
                        // key={selection.toString()}
                        style={[{ minHeight: 500 }]}
                      >
                        <View style={[styles.aboutContainer]}>
                          <View style={[styles.Directions, { width: '100%' }]}>
                            <Text style={styles.AboutHeading}>About</Text>
                            {
                              //isSelf
                              ClubsDetail?.organizerId === user.id && (
                                <Pressable
                                  onPress={goToEditabout}
                                  style={{ marginTop: 5 }}
                                >
                                  <FastImage
                                    style={styles.Editicon}
                                    source={require('../assets/images/icon/Edit.png')}
                                  />
                                </Pressable>
                              )
                            }
                            <View style={{ flex: 1 }} />
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            {ClubsDetail?.thumbnailLogoPath &&
                            !isUserDeleted ? (
                              <FastImage
                                style={{
                                  height: 60,
                                  width: 60,
                                  borderRadius: 100,
                                }}
                                source={{
                                  uri: ClubsDetail?.thumbnailLogoPath,
                                  cache: FastImage.cacheControl.immutable,
                                }}
                              />
                            ) : (
                              <FastImage
                                style={[
                                  {
                                    height: 60,
                                    width: 60,
                                    opacity: 0.5,
                                    borderRadius: 100,
                                  },
                                ]}
                                source={require('../assets/images/logo.png')}
                              />
                            )}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={[styles.name, { marginTop: 0 }]}>
                                {isUserDeleted
                                  ? 'Inactive Club'
                                  : ClubsDetail?.title?.length
                                  ? ClubsDetail?.title
                                  : 'N/A'}
                              </Text>
                              {ClubsDetail?.isPublic === 'true' ||
                              ClubsDetail?.isPublic === true ? (
                                <Text style={styles.AboutText}>
                                  Public club
                                </Text>
                              ) : (
                                <Text style={styles.AboutText}>
                                  Private club
                                </Text>
                              )}
                            </View>
                          </View>

                          <Divider style={styles.divider} />
                          <View style={styles.Directions}>
                            <Text style={styles.InformationHeading}>
                              Organiser :{' '}
                              <Text style={styles.InformationText}>
                                Organiser,{' '}
                                {isUserDeleted
                                  ? 'Deletion Requested'
                                  : ClubsDetail?.clubOrganizer?.firstName
                                      ?.length > 0
                                  ? ClubsDetail?.clubOrganizer?.firstName
                                  : 'N/A'}{' '}
                                {!isUserDeleted
                                  ? ClubsDetail?.clubOrganizer?.lastName
                                      ?.length > 0
                                    ? ClubsDetail?.clubOrganizer?.lastName
                                    : 'N/A'
                                  : ''}
                              </Text>
                            </Text>
                          </View>
                          {!isUserDeleted && (
                            <>
                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Address :{' '}
                                  <Text style={styles.InformationText}>
                                    {ClubsDetail?.address}
                                  </Text>
                                </Text>
                              </View>

                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Postcode :{' '}
                                  <Text style={styles.InformationText}>
                                    {ClubsDetail?.postcode}
                                  </Text>
                                </Text>
                              </View>
                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  City :{' '}
                                  <Text style={styles.InformationText}>
                                    {ClubsDetail?.city}
                                  </Text>
                                </Text>
                              </View>
                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Country :{' '}
                                  <Text style={styles.InformationText}>
                                    {ClubsDetail?.country}
                                  </Text>
                                </Text>
                              </View>
                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Phone Number :{' '}
                                  <Text
                                    style={styles.InformationText}
                                    onPress={() => {
                                      Linking.openURL(
                                        Platform.OS === 'android'
                                          ? `tel:${ClubsDetail?.phoneNumber}`
                                          : `telprompt:${ClubsDetail?.phoneNumber}`,
                                      );
                                    }}
                                  >
                                    {' '}
                                    {ClubsDetail?.phoneNumber}
                                  </Text>
                                </Text>
                              </View>
                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Email :{' '}
                                  <Text
                                    style={styles.InformationText}
                                    onPress={() => {
                                      Linking.openURL(
                                        `mailto:${
                                          ClubsDetail?.email ? (
                                            ClubsDetail?.email
                                          ) : (
                                            <></>
                                          )
                                        }`,
                                      );
                                    }}
                                  >
                                    {ClubsDetail?.email}
                                  </Text>
                                </Text>
                              </View>

                              <View style={styles.Directions}>
                                <Text style={styles.InformationHeading}>
                                  Website :
                                  <Text
                                    style={styles.InformationText}
                                    onPress={() => {
                                      Linking.openURL(
                                        `${
                                          ClubsDetail?.website ? (
                                            ClubsDetail?.website.slice(0, 4) ===
                                            'http' ? (
                                              ClubsDetail?.website
                                            ) : (
                                              'https://' + ClubsDetail?.website
                                            )
                                          ) : (
                                            <></>
                                          )
                                        }`,
                                      );
                                    }}
                                  >
                                    {ClubsDetail?.website}
                                  </Text>
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </>
                  ) : (
                    <></>
                  )}
                </View>
              </ImageBackground>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ListModal
        onCancel={() => {
          setDeleteModal(false);
        }}
        isself={ClubsDetail?.organizerId === user?.id ? true : false}
        outheruser={ClubsDetail?.organizerId !== user?.id ? true : false}
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
                DeleteClubGallery(
                  clubid,
                  currentImage.current?.id,
                  currentImage.current?.imageType,
                );
              },
            },
          ]);
        }}
      />

      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          getClubProfile();
          if (selection === 1) {
            getClubForum(true);
          } else if (selection === 2) {
            getClubMemeberList();
            // getClubActiveMemeberList();
          } else if (selection === 3) {
            getClubGalleryImages();
          } else if (selection === 4) {
            getClubTrips(true);
          } else if (selection === 5) {
            getClubReport(true);
          } else if (selection === 6) {
            getClubEvent(true);
          }
        }}
        description={successdescription}
        iserror={iserror}
      />

      <AttendedModal
        visible={IsAttended}
        Yes={item => {
          setIsAttended(false);
          OnGoingClick(AttendClubEventID, item);
        }}
        No={item => {
          setIsAttended(false);
          OnGoingClick(AttendClubEventID, item);
        }}
        Maybe={item => {
          setIsAttended(false);
          OnGoingClick(AttendClubEventID, item);
        }}
        onPressClose={() => {
          setIsAttended(false);
        }}
      />

      <EventMaybeGoingModel
        visible={MaybeGoing}
        onPressClose={() => {
          setMaybeGoing(false);
        }}
        Maybe={Maybe}
        EventID={AttendClubEventID}
      />

      <ImagePickerModal
        visible={galleryImagePickerModa}
        onCancel={() => setGalleryImagePickerModa(false)}
        onSelect={photo => {
          setClubGallerymagesLoader(true);

          dispatch(
            uploadGalleryImage(
              clubid,
              photo, // ✅ RAW photo
              user?.id,
              (success, message) => {
                setClubGallerymagesLoader(false);

                if (success) {
                  // setTimeout(
                  //   () => {
                  //     setSuccess(true);
                  //     setSuccessDescription(message);
                  //   },
                  //   Platform.OS === 'ios' ? 300 : 0,
                  // );
                }
              },
            ),
          );
        }}
      />

      <Modal transparent animationType="slide" visible={isModalVisible}>
        <View
          style={{
            flex: 1,
            backgroundColor: Color.black0.concat('9'),
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: Color.white,
              marginHorizontal: dynamicSize(40),
              borderRadius: dynamicSize(10),
              padding: dynamicSize(10),
              alignItems: 'center',
            }}
          >
            <Text style={styles.modaltitle}>Invite to Trip</Text>
            <Text style={styles.modaltext1}>
              Do you want to Join as driver or passenger?{' '}
            </Text>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setTimeout(
                  () => {
                    setisModalVisible(false);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                if (isInvited === false) {
                  setisModalVisible(false);
                  ClubTripAccept(TripID, true);
                } else if (isInvited === true) {
                  setisModalVisible(false);
                  ClubTripJoin(TripID, true);
                }
              }}
            >
              <Text style={styles.modalbtntext}>Driver</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setTimeout(
                  () => {
                    setisModalVisible(false);
                  },
                  Platform.OS === 'ios' ? 300 : 0,
                );
                if (isInvited === false) {
                  setisModalVisible(false);
                  ClubTripAccept(TripID, false);
                } else if (isInvited === true) {
                  setisModalVisible(false);
                  ClubTripJoin(TripID, false);
                }
              }}
            >
              <Text style={styles.modalbtntext}>Passenger</Text>
            </Pressable>
            <Divider style={styles.divider} />
            <Pressable
              style={styles.modalbutton}
              onPress={() => {
                setisModalVisible(false);
              }}
            >
              <Text style={[styles.modalbtntext, { color: 'red' }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: dynamicSize(150),
  },

  backarrow: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 10,
    borderRadius: 8,
    marginRight: 5,
    height: dynamicSize(38),
    width: dynamicSize(38),
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
    borderBottomWidth: 1,
    borderBottomColor: Color.cardbg,
  },
  imagesstyleicon: {
    backgroundColor: Color.red,
    borderRadius: 100,
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: -5,
  },
  imagesstyle: {
    height: dynamicSize(110),
    width: dynamicSize(110),
    marginBottom: dynamicSize(10),
    marginHorizontal: 5,
    borderRadius: 5,
  },
  imagesrow: {
    flexDirection: 'row',

    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  addmemberbtn: {
    padding: 5,
    marginLeft: dynamicSize(10),
    marginVertical: 5,
  },
  addtext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 22,
    color: Color.white,
  },
  smallbtnrow: {
    // width: '40%',
  },
  smalltext: {
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(11),
    color: Color.white,
  },
  smallbtn: {
    height: dynamicSize(25),
    width: dynamicSize(60),
    backgroundColor: Color.lightblue,
    ...Shadow.boxShadow,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  OrgniserText: {
    // height: dynamicSize(30),
    // width: dynamicSize(70),
    // backgroundColor: Color.lightblue,
    // ...Shadow.boxShadow,
    // borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainprofileImage: {
    resizeMode: 'cover',
    width: dynamicSize(70),
    height: dynamicSize(70),
    borderRadius: 100,
  },
  profilemembercon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: dynamicSize(10),
    width: '100%',
  },
  ml1: {
    marginLeft: 5,
  },
  dropdownStyle: {
    width: 100,
    borderRadius: 5,
  },
  divider: {
    marginVertical: dynamicSize(15),
    height: 1.5,
  },
  mh2: {
    marginHorizontal: dynamicSize(10),
  },
  membersbtn: {
    marginLeft: dynamicSize(-20),
  },
  gridrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubimgcontainer: {
    borderRadius: 20,
    height: dynamicSize(110),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box60: {
    width: '58%',
  },
  clubprofileimg: {
    height: dynamicSize(80),
    resizeMode: 'contain',
    // width: 100,
    borderRadius: 100,
  },
  clubicontext: {
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 20,
    color: Color.black,
    flex: 1,
    flexWrap: 'wrap',
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
    width: '38%',
  },
  cardView: {
    backgroundColor: Color.white,
    marginBottom: dynamicSize(10),
    marginTop: 2,
    paddingHorizontal: dynamicSize(15),
    paddingVertical: 5,
    ...Shadow.boxShadow,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  friendstatus: {
    color: Color.gray,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(18),
    fontFamily: fontFamily.ProximaR,
    flexWrap: 'wrap',
  },
  friendaddress: {
    ...text.usernamestatus,
    color: Color.black0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  friendname: {
    // fontSize: getFontSize(13),
    // fontFamily: fontFamily.ProximaAB,
    // lineHeight: getFontSize(18),
    // color: 'black',
    flexWrap: 'wrap',
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(19),
    color: Color.black,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '60%',
  },
  friendcontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: dynamicSize(5),
  },
  friendsection: {
    backgroundColor: Color.white,
    padding: dynamicSize(15),
    marginHorizontal: dynamicSize(10),
    borderRadius: dynamicSize(10),
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
  suggestedtext: {
    flex: 1,
    fontSize: getFontSize(13),
    lineHeight: getFontSize(20),
    paddingVertical: 5,
    fontFamily: fontFamily.ProximaR,
    color: Color.white,
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
    width: dynamicSize(90),
    paddingVertical: dynamicSize(10),
  },
  suggestedprofile: {
    height: dynamicSize(55),
    borderRadius: 100,
    width: dynamicSize(55),
  },
  containerlable: {
    paddingVertical: 5,
    paddingLeft: dynamicSize(10),
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
    backgroundColor: 'black',
    // flex: 1,
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
    fontSize: getFontSize(12),
    fontWeight: '600',
  },
  ImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginVertical: dynamicSize(10),
  },
  imgview: {},
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: dynamicSize(15),
  },
  profileImage: {
    height: dynamicSize(90),
    width: dynamicSize(90),
    borderRadius: 50,
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
    textAlign: 'center',
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
    paddingVertical: dynamicSize(40),
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
  btnText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(20),
    color: Color.lightblue,
  },

  Image: {
    marginVertical: 3,
    marginHorizontal: 3,
    borderRadius: 7,
    resizeMode: 'cover',
  },
  icon: {
    height: dynamicSize(20),
    resizeMode: 'contain',
  },
  Editicon: {
    height: dynamicSize(15),
    width: dynamicSize(15),
    marginTop: dynamicSize(15),
    marginHorizontal: 10,
  },
  modalView: {
    margin: dynamicSize(20),
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: dynamicSize(20),
    paddingVertical: dynamicSize(10),
    paddingTop: dynamicSize(30),
    alignItems: 'center',
    ...Shadow.boxShadow,
    // opacity:0.5
  },
  buttonOpen: {
    alignSelf: 'center',
    backgroundColor: Color.lightblue,
    width: '50%',
    borderRadius: 10,
    paddingVertical: dynamicSize(10),
  },
  buttonClose: {
    backgroundColor: Color.lightblue,
    paddingHorizontal: dynamicSize(40),
    borderRadius: 10,
    paddingVertical: dynamicSize(10),
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: getFontSize(13),
  },
  modalText: {
    marginVertical: dynamicSize(40),
    textAlign: 'center',
    color: 'black',
    fontWeight: '600',
  },
  aboutContainer: {
    marginHorizontal: dynamicSize(10),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: dynamicSize(20),
    // ...Shadow.boxShadow,
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
    // alignItems: 'center',
    // flexWrap: 'wrap',
  },
  DirectionsSpaceBetween: {
    flexDirection: 'row',
    marginVertical: 2,
    justifyContent: 'space-between',
  },
  bg: {
    backgroundColor: Color.reportcardbg,
    padding: dynamicSize(20),
    borderRadius: 10,
  },
  bg2: {
    backgroundColor: Color.reportcardbg,
    padding: dynamicSize(10),
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
    paddingTop: dynamicSize(10),
  },
  opacity: {
    opacity: 0.4,
  },
  modalbutton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modaltext1: {
    fontSize: 13,
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
    // fontFamily: fontFamily.ProximaBold,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 18,
  },
  modaltitle: {
    color: Color.gray,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: 18,
  },
  bottommodal: {
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 10,
    borderRadius: 10,
    textAlign: 'center',
  },
  modalbtntext: {
    textAlign: 'center',
    fontFamily: fontFamily.ProximaBold,
    fontSize: 17,
    fontFamily: fontFamily.ProximaR,
    fontWeight: '400',
    color: Color.lightblue,
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

//make this component available to the app
export default ClubProfile;

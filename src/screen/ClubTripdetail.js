//import liraries
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';
import { Image } from 'react-native';
import {
  FlatList,
  ScrollView as ScrollGesture,
} from 'react-native-gesture-handler';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Modal from 'react-native-modal';
import { Divider } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Trip from '../api/Trip';
import Blockreport from '../api/Blockreport';
import { BorderButton, RoundButton } from '../components/Buttons';
import CommentItem from '../components/CommentItem';
import { TripReport } from '../components/ClubComponentitem';
import CustomMapView from '../components/CustomMapView';
import ScrollView from '../components/CustomScrollView';
import { Header } from '../components/Header';
import SuccessModal from '../components/SuccessModal';
import { board, Color, fontFamily, skill, text } from '../constants/Constants';
import Loader from '../constants/Loader';
import {
  CURRENT_WIDTH,
  dynamicSize,
  getFontSize,
  getLineSize,
} from '../constants/Responsive';
import { getUserInfoText } from '../constants/Utility';
import { Forecast } from '../screen/OrganizeTabs';
import { globlestyle } from '../styles/globlestyle';
import PreviewModal from '../components/PreviewModal';
import Hyperlink from 'react-native-hyperlink';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SectionList } from 'react-native';
import { MessageOptionsPopup } from '../components/MessageOptionsPopup';
import ImagePreviewModal from '../components/ImagePreviewWithTag';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  addChats,
  getChatsNew,
  getCurrentTrip,
  getExpenses,
  getForecase,
  getInterstedUser,
  getPassengers,
  getPendingList,
  getTripReports,
  setCurrentTrip,
  setPassengers,
  fetchTripUnreadCount,
  markTripChatAsRead,
} from '../store/tripSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import SyncInfo from '../components/SyncStatus';
import StatusMessage from '../components/StatusMessage';
import FastImage from 'react-native-fast-image';
import {
  addPendingAction,
  markChatAsSynced,
  saveChatMessages,
} from '../database/tripDbHelper';
import syncService from '../services/syncService';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

let pageNoComment = 1;
let pageNoCommentTop = 1;
let pageNoCommentBottom = 1;
let isFetchingComment = false;
let isDataLoadedComment = false;
let isDataLoadedCommentTop = false;

let pageNoExpense = 1;
let pageNoExpenseBottom = 1;
let pageNoExpenseTop = 1;
let isFetchingExpense = false;
let isDataLoadedExpense = false;
let isDataLoadedExpenseTop = false;

let pageNoReport = 1;
let isDataLoadedReport = false;
let isFetchingReport = false;

const ClubTripdetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  // const item = route?.params;
  const routeItem = route?.params;
  const trip = useSelector(state => state.trip.currentTrip);
  const user = useSelector(state => state.auth.user);
  const expenses = useSelector(state => state.trip.expenses);
  const pendingUsers = useSelector(state => state.trip.pendingUsers);
  const interstedUsers = useSelector(state => state.trip.interstedUsers);
  const passengers = useSelector(state => state.trip.passengers);
  const forecastData = useSelector(state => state.trip.averageForcast);
  const reports = useSelector(state => state.trip.reports);
  const lastSyncTime = useSelector(state => state.trip?.lastSyncTime);
  const [forecastLoader, setForecastLoader] = useState(false);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const chats = useSelector(state => state.trip.chats);
  const passengerList = passengers?.map(item => item?.passenger?.id) ?? [];
  const isJoined = passengerList.includes(user?.id);
  const isOrganisor = routeItem?.organizer?.id == user?.id;
  const isCanceled = trip?.status == false;
  const showEveryThing = isJoined || isOrganisor;
  const [textInputChatText, setTextInputChatText] = useState('');
  const [reportimagePreviewModal, setreportimagePreviewModal] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportselectusersID, setreportselectusersID] = useState('');
  const newIdForForecast = `${routeItem?.destination?.id}_${routeItem?.id}`;
  const [showLoading, SetshowLoading] = useState(false);
  const [isSendInProgress, setisSendInProgress] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedIndex, setselectedIndex] = useState(
    route.params?.isCrew
      ? 2
      : route.params?.isExpense
      ? 3
      : route.params?.isChat
      ? 6
      : route.params?.isComment
      ? 4
      : 0,
  );
  const [isExpensesVisible, setExpensesVisible] = useState(false);
  const scrollRef = useRef(null);
  const [textinput, settextinput] = React.useState('');
  const [timeStart, settimeStart] = React.useState('');
  const [Amountinput, setAmountinput] = React.useState('');
  const [tripLoader, setTripLoader] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [passengerLoader, setPassengerLoader] = useState(false);
  const [commentLoader, setCommentLoader] = useState(false);
  const [expensesLoader, setExpensesLoader] = useState(false);
  const [pendingListLoader, setPendingListLoader] = useState(false);
  const [interestedUsersLoader, setInterestedUsersLoader] = useState(false);
  const [expenseSuccess, setExpenseSuccess] = useState(false);
  const [chatLoader, setChatLoader] = useState(false);
  const [chatText, setChatText] = useState('');
  const [reporeLoader, setReporeLoader] = useState(false);
  const [passengerDeleteLoader, setPassengerDeleteLoader] = useState(false);
  const [number, onChangeNumber] = React.useState(
    'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.',
  );
  const [tripcheckedinallow, settripcheckedinallow] = React.useState('hide');
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [TopLodaer, setTopLodaer] = useState(false);
  const [bottomLodaerExpense, setBottomLodaerExpense] = useState(false);
  const [TopLodaerExpense, setTopLodaerExpense] = useState(false);
  const [bottomLodaerReport, setbottomLodaerReport] = useState(false);
  const scrollViewRef = useRef();
  const dataSourceCords = useRef([]);
  const scrollToIndex = useRef(0);
  const dataSourceCordsChat = useRef([]);
  const scrollToIndexChat = useRef(0);
  const scrollViewRefExpense = useRef();
  const dataSourceCordsExpense = useRef([]);
  const scrollToIndexExpense = useRef(0);
  const comments = useRef([]);
  const sectionListRef = useRef();
  const messageRefs = useRef({});
  const [showMessageOptions, setShowMessageOptions] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isReply, setIsReply] = useState(false);
  const [chatImagePreview, setChatImagePreview] = useState(false);
  const [chatImageUrl, setChatImageUrl] = useState(null);
  const [scrollToBottomOnLoad, setScrollToBottomOnLoad] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);
  const perPageRef = useRef(null);
  const hasScrolled = useRef(false);
  const flatListRef = useRef(null);
  // const unreadCount = useSelector(
  //   state =>
  //     state.trip.tripUnreadCounts[routeItem?.id || routeItem?.tripId] || 0,
  // );

  // const actualIndex = Number(unreadCount);

  // useEffect(() => {
  //   if (
  //     flatChatData.length > 0 &&
  //     actualIndex > 0 &&
  //     !hasScrolled.current &&
  //     selectedIndex === 6
  //   ) {
  //     setTimeout(() => {
  //       flatListRef.current?.scrollToIndex({
  //         index: actualIndex - 1,
  //         animated: true,
  //         viewPosition: 0.5,
  //       });
  //       hasScrolled.current = true;
  //     }, 300);
  //   }
  // }, [flatChatData, actualIndex, selectedIndex]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        refreshData();
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  useEffect(() => {
    setTripLoader(true);
    dispatch(
      getCurrentTrip(routeItem?.id, status => {
        setTripLoader(false);
      }),
    );
    getPendingUsers();
    getInterstedUsers();
    getPassenger();
    if (routeItem?.id) {
      setForecastLoader(true);
      dispatch(
        getForecase(
          routeItem?.destination?.id,
          () => {
            setForecastLoader(false);
          },
          true,
          routeItem?.id,
        ),
      );
    }
    getTripReport(true);
    if (routeItem?.isChat) {
      scrollToIndexChat.current =
        routeItem?.ListIndex !== 0 ? routeItem?.ListIndex - 1 : 0;
    }
    const interval = setInterval(() => {}, 10000);
    return () => {
      clearInterval(interval);
      dispatch(setCurrentTrip({}));
      dispatch(setPassengers([]));
    };
  }, [routeItem?.id]);

  useEffect(() => {
    if (
      routeItem?.ListIndex !== undefined &&
      routeItem?.ListIndex !== null &&
      routeItem?.ListIndex !== ''
    ) {
      if (routeItem?.ListIndex === -1) {
        alert('The Trip is Expird');
        if (selectedIndex === 3) {
          getExpense(true);
        }
      } else {
        if (parseInt(routeItem?.ListIndex) > 10) {
          let modules = parseInt(routeItem?.ListIndex) % 10;
          if (modules == 0) {
            if (selectedIndex === 3) {
              pageNoExpenseTop = parseInt(parseInt(routeItem?.ListIndex) / 10);
              pageNoExpenseBottom = parseInt(
                parseInt(routeItem?.ListIndex) / 10,
              );
              pageNoExpense = parseInt(parseInt(routeItem?.ListIndex) / 10);
              scrollToIndexExpense.current = 9;
              getExpense(false, false, false, true);
            }
          } else {
            if (selectedIndex === 3) {
              pageNoExpenseTop =
                parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
              pageNoExpenseBottom =
                parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
              pageNoExpense = parseInt(parseInt(routeItem?.ListIndex) / 10) + 1;
              scrollToIndexExpense.current = modules > 0 ? modules - 1 : 0;
              getExpense(false, false, false, true);
            }
          }
        } else {
          if (selectedIndex === 3) {
            pageNoExpenseTop = 1;
            pageNoExpenseBottom = 1;
            pageNoExpense = 1;
            getExpense(false, false, false, true);
            scrollToIndexExpense.current =
              parseInt(routeItem?.ListIndex) > 0
                ? parseInt(routeItem?.ListIndex) - 1
                : 0;
          }
        }
      }
    } else {
      getExpense(true);
    }
  }, [routeItem]);

  const refreshData = () => {
    setTripLoader(true);
    dispatch(
      getCurrentTrip(routeItem?.id, status => {
        setTripLoader(false);
      }),
    );
    getExpense(true);
    getPendingUsers();
    getInterstedUsers();
    getPassenger();
    loadChats(1, false, true);
    if (routeItem?.id) {
      setForecastLoader(true);
      dispatch(
        getForecase(
          routeItem?.destination?.id,
          () => {
            setForecastLoader(false);
          },
          true,
          routeItem?.id,
        ),
      );
    }
    getTripReport();
  };

  const isTripStarted =
    new Date(moment(trip?.startDate).add(6, 'hours')).getTime() <
    new Date().getTime();

  const removePassenger = async (id, uId) => {
    Alert.alert(
      'Alert',
      uId == user?.id
        ? 'Are you sure you want to leave this trip'
        : 'Are you sure you want to remove passenger',
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setPassengerDeleteLoader(true);
              if (!currentNetworkStatus) {
                alert(
                  'You can not leave the trip as you have no connection. Try again later.',
                );
                setPassengerDeleteLoader(false);
                getPassenger();
                return;
              }
              const data = await Trip.deletePassenger(
                id,
                isOrganisor ? 'user' : 'self',
              );
            } catch (error) {
              if (
                error?.toString()?.toLocaleLowerCase()?.trim() !=
                'network error'
              ) {
                alert(error?.toString());
              }
            }
            setPassengerDeleteLoader(false);
            getPassenger();
          },
        },
      ],
    );
  };

  const getExpense = (isRefresh, isBottom, isTop, isStart) => {
    isDataLoadedExpense = false;
    isDataLoadedExpenseTop = false;
    if (isBottom) {
      setBottomLodaerExpense(true);
    } else if (isTop) {
      setTopLodaerExpense(true);
    } else if (isStart) {
      setExpensesLoader(true);
    } else if (isRefresh) {
      isDataLoadedExpense = false;
      pageNoExpense = 1;
      pageNoExpenseBottom = 1;
      pageNoExpenseTop = 1;
      setExpensesLoader(true);
    } else {
      setExpensesLoader(true);
    }
    isFetchingExpense = true;
    dispatch(
      getExpenses(
        routeItem?.id,
        isBottom
          ? pageNoExpenseBottom
          : isTop
          ? pageNoExpenseTop
          : pageNoExpense,
        isBottom,
        isTop,
        isStart,
        (status, isEnded, start) => {
          setExpensesLoader(false);
          setBottomLodaerExpense(false);
          setTopLodaerExpense(false);
          isFetchingExpense = false;
          if (status && isEnded && start) {
            pageNoExpenseTop -= 1;
            getExpense(false, false, true);
          }
          if (isEnded && status) {
            isDataLoadedExpense = true;
          }
          if (pageNoExpense == 1 || pageNoExpenseTop == 1) {
            isDataLoadedExpenseTop = true;
          }
          if (isTop) {
            if (dataSourceCordsExpense.current?.length > 10) {
              scrollViewRefExpense.current?.scrollTo({
                x: 0,
                y: dataSourceCordsExpense.current[10],
                animated: true,
              });
            }
          }
        },
      ),
    );
  };

  const getTripReport = (isRefresh, isBottom) => {
    if (isBottom) {
      setbottomLodaerReport(true);
    } else if (isRefresh) {
      isDataLoadedReport = false;
      pageNoReport = 1;
      setReporeLoader(true);
    }
    isFetchingReport = true;
    dispatch(
      getTripReports(routeItem?.id, pageNoReport, (isEnded, status) => {
        setReporeLoader(false);
        setbottomLodaerReport(false);
        isFetchingReport = false;
        if (isEnded && status) {
          isDataLoadedReport = true;
        }
      }),
    );
  };

  const getPassenger = () => {
    setPassengerLoader(true);
    dispatch(
      getPassengers(routeItem?.id, () => {
        setPassengerLoader(false);
      }),
    );
  };

  const getPendingUsers = () => {
    setPendingListLoader(true);
    dispatch(
      getPendingList(routeItem?.id, () => {
        setPendingListLoader(false);
      }),
    );
  };

  const getInterstedUsers = () => {
    setInterestedUsersLoader(true);
    dispatch(
      getInterstedUser(routeItem?.id, () => {
        setInterestedUsersLoader(false);
      }),
    );
  };

  const menuButtonClick = () => {
    navigation.goBack();
  };

  const GotoTripReport = item => {
    navigation.navigate('ClubTripReport', { item });
  };

  const GotoInvite = () => {
    if (isTripStarted) {
      alert('You can not update your crew after 6 hr of trip started');
      return;
    }
    let clubid = routeItem?.clubId;
    navigation.navigate('Invite', { clubid });
  };

  const GotocreateReport = () => {
    if (new Date(trip?.startDate).getTime() > new Date().getTime()) {
      alert('this trip has not been started');
      return;
    }
    let clubid = routeItem?.clubId;
    navigation.navigate('CreateClubReport', {
      routeItem,
      clubid,
      needToRefresh: () => {},
    });
  };

  const toggleExpensesModal = () => {
    settextinput('');
    setAmountinput('');
    setExpensesVisible(!isExpensesVisible);
  };

  const checkInTrip = () => {
    requestLocationPermission();
  };

  const requestLocationPermission = async () => {
    SetshowLoading(true);
    if (Platform.OS === 'ios') {
      getOneTimeLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'GSC needs to access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          //To Check, If Permission is granted
          const enableResult = await promptForEnableLocationIfNeeded();

          if (enableResult == 'enabled' || enableResult == 'already-enabled') {
            setTimeout(() => {
              getOneTimeLocation();
            }, 1000);
          }
        } else {
          SetshowLoading(false);
        }
      } catch (err) {
        SetshowLoading(false);
      }
    }
  };

  const checkInTripFinal = async (lat, long) => {
    try {
      setIsChecking(true);
      const data = JSON.parse(await Trip.checkInTrip(routeItem?.id, lat, long));
      if (data) {
        alert('Successfully Checked in');
        setTripLoader(true);
        CheckusercheckedinOrNot();
        dispatch(
          getCurrentTrip(routeItem?.id, status => {
            setTripLoader(false);
          }),
        );
      } else {
        alert('You need to be within 25 miles of your destination to check-in');
      }
    } catch (error) {
      if (error?.toString()?.toLocaleLowerCase()?.trim() != 'network error') {
        alert(error?.toString());
      }
    }
    setIsChecking(false);
  };

  const getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        SetshowLoading(false);
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        checkInTripFinal(currentLatitude, currentLongitude);
      },
      error => {
        SetshowLoading(false);
        alert(error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  const btnHandler = () => {
    // alert('Keyboard');
  };

  const departureAddress = trip?.departureAddress;

  const destinationAddress = trip?.destinationLocationAddress;
  const accommodationAddress = trip?.accommodationAddress;
  const accAddress =
    (accommodationAddress?.address1 ?? '') +
    ' ' +
    (accommodationAddress?.city ?? '') +
    ' ' +
    (accommodationAddress?.state ?? '') +
    ' ' +
    (accommodationAddress?.country ?? '');
  const toAddress =
    (destinationAddress?.address1 ?? '') +
    ' ' +
    (destinationAddress?.city ?? '') +
    ' ' +
    (destinationAddress?.state ?? '') +
    ' ' +
    (destinationAddress?.country ?? '');
  const passengersList = passengers?.filter(item => !item.isDriver) ?? [];
  const driverList = passengers?.filter(item => item?.isDriver) ?? [];

  useEffect(() => {
    // CheckusercheckedinOrNot();
    const unsubscribe = navigation.addListener('focus', () => {
      CheckusercheckedinOrNot();
      if (selectedIndex === 5) {
        getTripReport();
      }
    });
    return unsubscribe;
  }, []);

  const CheckusercheckedinOrNot = async () => {
    if (routeItem !== null && routeItem !== undefined) {
      let checkusercheckedinOrnot = await Blockreport.checkusercheckedinOrNot(
        routeItem?.id,
      );

      setTimeout(
        () => {
          settripcheckedinallow(JSON.parse(checkusercheckedinOrnot));
        },
        Platform.OS === 'ios' ? 300 : 0,
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

  const [heightlightColor, setheightlightColor] = useState(Color?.lightblue);
  const [heightlightColorBottom, setheightlightColorBottom] = useState(
    Color?.lightblue,
  );

  useEffect(() => {
    setTimeout(() => {
      setheightlightColor(Color.reportcardbg);
      setheightlightColorBottom(Color.lightGray);
    }, 10000);
  }, []);

  //Chat Sectoion

  const handleTextChange = text => {
    setTextInputChatText(text);
    if (!text.endsWith('@')) {
      const oldText = textInputChatText;
      const diff = text.slice(oldText.length);
      if (diff.length > 0 && !diff.startsWith('@')) {
        setChatText(prev => prev + diff);
      }
    }
    const lastWord = text.split(/\s/).pop();
    if (lastWord?.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      const filtered =
        query.length > 0
          ? passengersList.filter(
              m =>
                m.passenger?.firstName?.toLowerCase().includes(query) ||
                m.passenger?.lastName?.toLowerCase().includes(query),
            )
          : passengersList;
      setFilteredMembers(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMember = member => {
    const uiWords = textInputChatText.split(/\s/);
    uiWords[
      uiWords.length - 1
    ] = `@${member.passenger?.firstName} ${member.passenger?.lastName}`;

    const backendWords = chatText.split(/\s/);
    backendWords[
      backendWords.length - 1
    ] = `@[${member.passenger?.firstName} ${member.passenger?.lastName}](${member.passenger?.id})`;

    setTextInputChatText(uiWords.join(' ') + ' ');
    setChatText(backendWords.join(' ') + ' ');

    // Delay hide to allow FlatList press to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 0);
  };

  const parseMentions = text => {
    const regex = /@\[(.+?)\]\((.+?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex)
        parts.push({
          text: text.substring(lastIndex, match.index),
          isMention: false,
        });
      parts.push({ text: match[1], isMention: true, userId: match[2] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length)
      parts.push({ text: text.substring(lastIndex), isMention: false });
    return parts;
  };

  const renderMessageText = text => {
    const parts = parseMentions(text);
    return parts.map((part, index) =>
      part.isMention ? (
        <Text
          key={index}
          style={{ color: 'blue' }}
          onPress={() =>
            navigation.navigate('Profile', { userId: part.userId })
          }
        >
          {part.text}
        </Text>
      ) : (
        <Text key={index}>{part.text}</Text>
      ),
    );
  };

  // useEffect(() => {
  //   loadChats();
  // }, []);

  useEffect(() => {
    perPageRef.current = null;
    hasScrolled.current = false;
    initChatLoad(routeItem?.id || routeItem?.tripId);
  }, [routeItem?.id || routeItem?.tripId]);

  useEffect(() => {
    if (selectedIndex === 6) {
      dispatch(markTripChatAsRead(routeItem?.id || routeItem?.tripId));
    }
  }, [selectedIndex]);

  const initChatLoad = async tripId => {
    // const unreadCount = await dispatch(fetchTripUnreadCount(tripId));
    // console.log('unreadCountdfgdgf===>', unreadCount);
    let perPage = 10;
    // if (unreadCount > 8) {
    //   perPage = Number(unreadCount) + 2;
    // }
    perPageRef.current = perPage;
    loadChats();
  };

  const loadChats = async (
    pageNo = 1,
    isLoadMore = false,
    isSilentRefresh = false,
    isRefresh = false,
  ) => {
    if (isLoadMore) setIsLoadingMore(true);
    if (!isSilentRefresh && pageNo === 1 && !isRefresh) setChatLoader(true);
    if (isRefresh) setRefreshLoader(true);
    await dispatch(
      getChatsNew(
        routeItem?.id,
        pageNo,
        perPageRef.current,
        (success, hashMore) => {
          setRefreshLoader(false);
          setIsLoadingMore(false);
          setChatLoader(false);
          setIsInitialLoading(false);
          if (success) {
            setPage(pageNo);
          }
          if (hashMore && success) {
            setHasMore(true);
          } else {
            setHasMore(false);
          }
        },
      ),
    );
  };

  const loadMoreChats = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await dispatch(
      getChatsNew(
        routeItem?.id,
        nextPage,
        perPageRef.current,
        (success, hashMore) => {
          setIsLoadingMore(false);
          if (success) setPage(nextPage);
          if (hashMore && success) {
            setHasMore(true);
          } else {
            setHasMore(false);
          }
        },
      ),
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 10,
        includeBase64: true,
      },
      response => {
        if (response?.assets?.length > 0) {
          setSelectedImages(prev => {
            const isFirstImageAlreadyAdded = prev.length > 0;

            const imgs = response.assets.map((asset, index) => ({
              uri: asset.uri,
              base64: `data:image/jpeg;base64,${asset.base64}`,
              tag:
                !isFirstImageAlreadyAdded && index === 0
                  ? chatText?.trim() || ''
                  : '',
            }));

            return [...prev, ...imgs];
          });

          setShowPreview(true);
        }
      },
    );
  };

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      response => {
        if (response?.assets?.length > 0) {
          const asset = response.assets[0];
          setSelectedImages(prev => [
            ...prev,
            {
              uri: asset.uri,
              base64: `data:image/jpeg;base64,${asset.base64}`,
              tag: chatText?.trim() || '',
            },
          ]);
          setShowPreview(true);
        }
      },
    );
  };

  const updateTag = (index, newTag) => {
    const updated = [...selectedImages];
    updated[index].tag = newTag;
    setSelectedImages(updated);
  };

  const handleSend = async () => {
    try {
      Keyboard.dismiss();
      setisSendInProgress(true);
      if (!currentNetworkStatus) {
        resetImageInput();
        Alert.alert(
          'Offline',
          'Image messages can only be sent when you are online.',
        );
        return;
      }
      const requestData = selectedImages.map(img => ({
        tripId: routeItem?.id,
        text: img.tag || '',
        ClubId: routeItem?.clubId,
        ParentId: selectedMessage?.id,
        ImageFile: img.base64,
      }));

      const data = await Trip.sendChatNew(requestData);
      resetImageInput();
      perPageRef.current = 10;
      loadChats(1, false, true, false);
    } catch (error) {
      resetImageInput();
    }
  };

  const resetChatInput = () => {
    setChatText('');
    setTextInputChatText('');
    setSelectedImages([]);
    setCurrentIndex(0);
    setSelectedMessage(null);
    setIsReply(false);
    setisSendInProgress(false);
  };

  const resetImageInput = () => {
    setChatText('');
    setTextInputChatText('');
    setSelectedImages([]);
    setCurrentIndex(0);
    setSelectedMessage(null);
    setIsReply(false);
    setisSendInProgress(false);
    setShowPreview(false);
  };

  const sendChat = async () => {
    if (!chatText.trim() && selectedImages.length === 0) return;

    try {
      Keyboard.dismiss();
      setisSendInProgress(true);

      const tripId = routeItem?.id;
      const localId = `temp-${Date.now()}`;

      const optimisticMessage = {
        id: localId,
        localId: localId,
        tripId: tripId,
        text: chatText,
        author: user,
        quoteChat: selectedMessage || null,
        createdAt: new Date().toISOString(),
        sync_status: 'pending',
        isPending: true,
      };

      dispatch(
        addChats({ payload: [optimisticMessage], pageNo: 1, isSend: true }),
      );

      await saveChatMessages(tripId, [optimisticMessage], true);

      if (currentNetworkStatus) {
        try {
          const requestData = [
            {
              tripId: tripId,
              text: chatText,
              ClubId: routeItem?.clubId,
              ParentId: selectedMessage?.id,
              ImageFile: '',
            },
          ];
          const response = await Trip.sendChatNew(requestData);
          if (response && response[0]?.id) {
            await markChatAsSynced(localId, response[0].id);
            await dispatch(
              getChatsNew(tripId, 1, perPageRef.current, () => {}),
            );
          }
          resetChatInput();
        } catch (apiError) {
          console.warn('Send failed, queued for sync:', apiError);
          await addPendingAction({
            actionType: 'SEND_CHAT',
            entityId: tripId,
            payload: [
              {
                tripId: tripId,
                text: chatText,
                ClubId: routeItem?.clubId,
                ParentId: selectedMessage?.id,
                ImageFile: '',
              },
            ],
            module: 'trip',
            timestamp: new Date().toISOString(),
          });

          resetChatInput();
        }
      } else {
        await addPendingAction({
          actionType: 'SEND_CHAT',
          entityId: tripId,
          payload: [
            {
              tripId: tripId,
              text: chatText,
              ClubId: routeItem?.clubId,
              ParentId: selectedMessage?.id,
              ImageFile: '',
            },
          ],
          module: 'trip',
          timestamp: new Date().toISOString(),
        });

        resetChatInput();
      }
    } catch (error) {
      console.error('sendChat error:', error);
      // Alert.alert('Error', 'Failed to send message. Please try again.');
      setisSendInProgress(false);
    }
  };

  const groupChatsByRelativeDate = chats => {
    const groups = {};
    chats.forEach(item => {
      let dateLabel = 'Unknown';
      if (item?.createdAt) {
        const created = moment(item.createdAt);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'day').startOf('day');
        if (created.isSame(today, 'd')) {
          dateLabel = 'Today';
        } else if (created.isSame(yesterday, 'd')) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = created.format('DD MMM YYYY');
        }
      }
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });

    // Sort by date ascending (oldest at top, Today at bottom)
    const sortedLabels = Object.keys(groups).sort((a, b) => {
      if (a === 'Today') return 1;
      if (b === 'Today') return -1;
      if (a === 'Yesterday') return 1;
      if (b === 'Yesterday') return -1;
      return (
        moment(a, 'DD MMM YYYY').valueOf() - moment(b, 'DD MMM YYYY').valueOf()
      );
    });

    return sortedLabels.map(label => ({
      title: label,
      data: groups[label],
    }));
  };

  const flattenChatsWithHeaders = chats => {
    const grouped = groupChatsByRelativeDate(chats); // Your existing function
    const flatData = [];

    grouped.forEach(section => {
      flatData.push({
        type: 'header',
        id: `header-${section.title}`,
        title: section.title,
      });
      section.data.forEach(item => {
        flatData.push({ type: 'message', ...item });
      });
    });

    return flatData;
  };

  const flatChatData = flattenChatsWithHeaders(chats)?.reverse();

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 10, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={Color.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <Header
          backbutton={'chevron-left-circle'}
          iconRight={require('../assets/images/icon/chatting.png')}
          iconRight1={require('../assets/images/icon/bell1.png')}
          title="Club Trip Detail"
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={menuButtonClick}
          notification={'6'}
          // messagenotification={'6'}
          textAlign={'center'}
        />
        {!currentNetworkStatus && (
          <View style={{ marginBottom: -12, marginTop: -5 }}>
            <ConnectionBanner isOnline={currentNetworkStatus} />
          </View>
        )}

        {lastSyncTime && !showLoading && currentNetworkStatus && (
          <View style={{ marginBottom: -12, marginTop: -5 }}>
            <SyncInfo
              lastSyncTime={lastSyncTime}
              showLoading={showLoading}
              currentNetworkStatus={currentNetworkStatus}
            />
          </View>
        )}
        <Loader
          removeModal
          visible={
            showLoading ||
            passengerDeleteLoader ||
            expensesLoader ||
            tripLoader ||
            forecastLoader ||
            passengerLoader ||
            pendingListLoader ||
            interestedUsersLoader ||
            commentLoader ||
            reporeLoader ||
            chatLoader ||
            isInitialLoading
          }
        />
        {/* <StickyParallaxHeader headerType="TabbedHeader" /> */}
        <View style={styles.editnamecontainer}>
          <Text style={styles.editnametext}>{trip?.title}</Text>
          {user?.id == trip?.organizer?.id && (
            <Pressable
              onPress={() => {
                if (trip?.isCheckedIn) {
                  alert('You can not update after check-in');
                  return;
                }
                if (
                  new Date(trip?.startDate).getTime() < new Date().getTime()
                ) {
                  alert('You can not update your trip once it has started');
                  return;
                }
                let clubid = routeItem?.clubId;
                navigation.navigate('ClubOrganizeForm', { item: trip, clubid });
              }}
              style={styles.editbutton}
            >
              {/*<FastImage
              source={require('../assets/images/icon/Edit.png')}
              style={styles.editbuttonimg}
              tintColor={Color.lightblue}
         />*/}
              <MaterialCommunityIcons
                name="square-edit-outline"
                size={18}
                color={Color.lightblue}
              />
            </Pressable>
          )}
        </View>
        <View>
          <ScrollGesture
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.buttonscrollview}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            <TouchableOpacity
              style={[
                styles.btn,
                selectedIndex === 0
                  ? { backgroundColor: Color.lightblue }
                  : null,
              ]}
              onPress={() => setselectedIndex(0)}
            >
              <Text
                style={[
                  styles.btnText,
                  selectedIndex === 0 ? { color: 'white' } : null,
                ]}
              >
                Info
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                selectedIndex === 1
                  ? { backgroundColor: Color.lightblue }
                  : null,
              ]}
              onPress={() => setselectedIndex(1)}
            >
              <Text
                style={[
                  styles.btnText,
                  selectedIndex === 1 ? { color: 'white' } : null,
                ]}
              >
                Forecast
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                selectedIndex === 2
                  ? { backgroundColor: Color.lightblue }
                  : null,
              ]}
              onPress={() => setselectedIndex(2)}
            >
              <Text
                style={[
                  styles.btnText,
                  selectedIndex === 2 ? { color: 'white' } : null,
                ]}
              >
                Crew
              </Text>
            </TouchableOpacity>

            {showEveryThing && (
              <>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    selectedIndex === 3
                      ? { backgroundColor: Color.lightblue }
                      : null,
                  ]}
                  onPress={() => setselectedIndex(3)}
                >
                  <Text
                    style={[
                      styles.btnText,
                      selectedIndex === 3 ? { color: 'white' } : null,
                    ]}
                  >
                    Expenses
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    selectedIndex === 6
                      ? { backgroundColor: Color.lightblue }
                      : null,
                  ]}
                  onPress={() => setselectedIndex(6)}
                >
                  <Text
                    style={[
                      styles.btnText,
                      selectedIndex === 6 ? { color: 'white' } : null,
                    ]}
                  >
                    Chat
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    selectedIndex === 5
                      ? { backgroundColor: Color.lightblue }
                      : null,
                  ]}
                  onPress={() => setselectedIndex(5)}
                >
                  <Text
                    style={[
                      styles.btnText,
                      selectedIndex === 5 ? { color: 'white' } : null,
                    ]}
                  >
                    Report
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollGesture>
        </View>
        <View style={styles.viewContainer}>
          {selectedIndex === 0 && (
            <ScrollView
              bounces={true}
              onRefresh={refreshData}
              refreshing={showLoading}
              contentContainerStyle={{ paddingBottom: getBottomSpace() }}
              key={selectedIndex.toString()}
              alwaysBounceVertical={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <View style={styles.detailsection2}>
                {tripcheckedinallow === 'checkin' ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: Color.lightblue,
                      borderRadius: dynamicSize(50),
                      height: dynamicSize(30),
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      width: dynamicSize(120),
                    }}
                  >
                    <AntDesign
                      name="checkcircle"
                      color={Color.lightblue}
                      size={getFontSize(16)}
                    />
                    <Text
                      style={{
                        fontSize: getFontSize(14),
                        marginLeft: dynamicSize(5),
                        color: Color.lightblue,
                      }}
                    >
                      Checked In
                    </Text>
                  </View>
                ) : tripcheckedinallow === 'show' ? (
                  <Pressable
                    onPress={checkInTrip}
                    style={{
                      borderWidth: 1,
                      borderColor: Color.lightblue,
                      borderRadius: dynamicSize(50),
                      height: dynamicSize(30),
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: dynamicSize(120),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: getFontSize(14),
                        color: Color.lightblue,
                      }}
                    >
                      Check In Trip
                    </Text>
                  </Pressable>
                ) : (
                  <></>
                )}

                {isCanceled && (
                  <Text style={styles.cancel1}>Trip has been Cancelled</Text>
                )}
                <View style={[styles.ph6, styles.mt2]}>
                  <View style={[styles.iconflex]}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />
                    <Text style={styles.nametext}>Driver:</Text>
                  </View>
                  {driverList.length == 0 ? (
                    <View style={{ height: 80 }}>
                      <Text
                        style={[
                          styles.nametitle,
                          styles.textAlignleft,
                          styles.mt2,
                        ]}
                      >
                        Trip has no driver members yet.
                      </Text>
                      {/* <StatusMessage
                        isOnline={currentNetworkStatus}
                        hasData={driverList?.length > 0}
                        color={Color.white}
                        title={'Trip has no driver members yet.'}
                      /> */}
                    </View>
                  ) : (
                    driverList.map((item, index) => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.passenger?.id),
                        );
                      return (
                        <View key={index} style={[styles.crewrow, styles.mt2]}>
                          <View style={[styles.passengerimgcontainer]}>
                            <Pressable
                              onPress={() => {
                                !isUserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.passenger?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeleted
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
                            <View>
                              <Text style={styles.subnametext}>
                                {isUserDeleted
                                  ? 'Deletion Requested'
                                  : item?.passenger?.firstName +
                                    ' ' +
                                    item?.passenger?.lastName}
                              </Text>
                              {!isUserDeleted && (
                                <Text style={styles.status}>
                                  {getUserInfoText(item?.passenger)}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[styles.iconflex, { width: '50%' }]}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />
                    <Text style={styles.nametext}>Seats Available:</Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {(routeItem?.maxOccupancy ?? 1) -
                        (passengers?.length ?? 0) <
                      0
                        ? 0
                        : (routeItem?.maxOccupancy ?? 1) -
                          (passengers?.length ?? 0)}
                    </Text>
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
                  {passengersList?.map(item => {
                    const isUserDeleted =
                      Array.isArray(user?.inActiveUsers) &&
                      user.inActiveUsers.some(
                        id => String(id) === String(item?.passenger?.id),
                      );
                    return (
                      <View key={item?.id} style={[styles.crewrow, styles.mt2]}>
                        <View style={[styles.passengerimgcontainer]}>
                          <Pressable
                            onPress={() => {
                              !isUserDeleted &&
                                navigation.navigate('Profile', {
                                  userId: item?.passenger?.id,
                                });
                            }}
                          >
                            <FastImage
                              source={
                                isUserDeleted
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
                          <View>
                            <Text style={styles.subnametext}>
                              {isUserDeleted
                                ? 'Deletion Requested'
                                : item?.passenger?.firstName +
                                  ' ' +
                                  item?.passenger?.lastName}
                            </Text>
                            {!isUserDeleted && (
                              <Text style={styles.status}>
                                {getUserInfoText(item?.passenger)}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[styles.iconflex, { width: '30%' }]}>
                    <FastImage
                      source={require('../assets/images/icon/vanLogo.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />
                    <Text style={styles.nametext}>Depart:</Text>
                  </View>
                  <View style={[{ width: '70%' }]}>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {trip?.startDate
                        ? moment(trip?.startDate ?? '').format('HH:mm')
                        : ''}
                    </Text>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {departureAddress?.address1 ?? ''}
                    </Text>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {
                        // (departureAddress?.address2 ?? '') +
                        //   ' ' +
                        (departureAddress?.city ?? '') +
                          ' ' +
                          (departureAddress?.state ?? '')
                      }
                    </Text>
                    <Text style={[styles.nametitle, styles.textAlignright]}>
                      {departureAddress?.country ?? ''}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <Text
                    style={[
                      styles.nametext,
                      {
                        flex: 0,
                        flexWrap: 'nowrap',
                      },
                    ]}
                  >
                    {'Spot:'}
                  </Text>
                  <Text style={[styles.nametitle]}>
                    {`${trip?.destination?.title ?? ''}`}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Destination:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
                      {toAddress}
                    </Text>
                  </View>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Duration:</Text>
                    <Text
                      style={[
                        styles.nametitle,
                        styles.textAlignleft,
                        { paddingLeft: 5 },
                      ]}
                    >
                      {trip?.startDate
                        ? moment(trip?.startDate).format('DD/MM/YYYY')
                        : ''}{' '}
                      -{' '}
                      {trip?.endDate
                        ? moment(trip?.endDate).format('DD/MM/YYYY')
                        : ''}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '50%' }]}>
                    <Text style={styles.nametext}>Skill Level:</Text>
                    <Text style={[styles.nametitle, styles.textAlignleft]}>
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
                      <Text style={styles.nametext}>Accomodations</Text>
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
                      <Text style={styles.nametext}>Adaptive</Text>
                    </View>
                    <View style={[{ width: '50%' }]}>
                      <Text style={[styles.nametitle, styles.textAlignright]}>
                        {trip?.isAdaptive ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.flexrow, styles.ph6]}>
                  <View style={[{ width: '98%' }]}>
                    <Text style={styles.nametext}>Trip Caption</Text>
                    <View style={styles.textareabox}>
                      <TextInput
                        style={styles.input}
                        pointerEvents={'none'}
                        multiline
                        onChangeText={onChangeNumber}
                        value={trip?.description ?? ''}
                        // numberOfLines={6}
                        placeholder=" "
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          {selectedIndex === 1 && (
            <ScrollView
              bounces={true}
              onRefresh={refreshData}
              refreshing={showLoading}
              key={selectedIndex.toString()}
              alwaysBounceVertical={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: getBottomSpace() }}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <Forecast
                data={trip?.destination}
                Map={
                  <View
                    style={[
                      styles.detailsection2,
                      {
                        height: 170,
                        overflow: 'hidden',
                        paddingHorizontal: 0,
                        paddingVertical: 0,
                      },
                    ]}
                  >
                    {trip?.destination?.address?.locationLat &&
                    trip?.destination?.address?.locationLng ? (
                      <CustomMapView
                        currentForcast={
                          (forecastData[newIdForForecast] ?? [])?.length > 0 &&
                          (forecastData[newIdForForecast][0] ?? null)
                        }
                        location={{
                          latitude: trip?.destination?.address?.locationLat,
                          longitude: trip?.destination?.address?.locationLng,
                        }}
                        // location={trip?.destination?.address?.location}
                      />
                    ) : // <MapView
                    //   provider={PROVIDER_GOOGLE}
                    //   style={StyleSheet.absoluteFillObject}
                    //   mapType={'satellite'}
                    //   onPress={() => {}}
                    //   region={{
                    //     ...trip?.destination?.address?.location,
                    //     latitudeDelta: 0.01,
                    //     longitudeDelta: 0.01,
                    //   }}>
                    //   <Marker
                    //     anchor={
                    //       Platform.OS == 'android'
                    //         ? {y: 0.5}
                    //         : {x: 0.5, y: 0.5}
                    //     }
                    //     coordinate={trip?.destination?.address?.location}>
                    //     <CustomMarker
                    //       currentForcast={
                    //         (forecastData[newIdForForecast] ?? [])?.length >
                    //           0 &&
                    //         (forecastData[newIdForForecast][0] ?? null)
                    //       }
                    //     />
                    //   </Marker>
                    // </MapView>
                    null}
                  </View>
                }
                newIdForForecast={newIdForForecast}
                forecastData={forecastData[newIdForForecast] ?? []}
              />
            </ScrollView>
          )}
          {selectedIndex === 2 && (
            <>
              <ScrollView
                bounces={true}
                onRefresh={refreshData}
                refreshing={showLoading}
                key={selectedIndex.toString()}
                alwaysBounceVertical={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 + getBottomSpace() }}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
              >
                <View style={styles.detailsection2}>
                  <View style={[styles.ph6, styles.mt2]}>
                    <View style={[styles.iconflex]}>
                      <FastImage
                        source={require('../assets/images/icon/vanLogo.png')}
                        style={styles.detailicon}
                        tintColor={Color.cardgray}
                      />
                      <Text style={styles.nametext}>Driver :</Text>
                    </View>
                    {driverList?.map((item, index) => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.passenger?.id),
                        );
                      return (
                        <View style={[styles.crewrow, styles.mt2]}>
                          <View
                            style={[
                              styles.passengerimgcontainer,
                              { width: '55%' },
                            ]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.passenger?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeleted
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
                            <View>
                              <Text style={styles.subnametext}>
                                {isUserDeleted
                                  ? 'Deletion Requested'
                                  : item?.passenger?.firstName +
                                    ' ' +
                                    item?.passenger?.lastName}
                              </Text>
                              {!isUserDeleted && (
                                <Text
                                  style={[
                                    styles.status,
                                    trip?.organizer?.id ===
                                      item?.passenger?.id && {
                                      maxWidth:
                                        CURRENT_WIDTH - dynamicSize(200),
                                    },
                                  ]}
                                >
                                  {getUserInfoText(item?.passenger)}
                                </Text>
                              )}
                            </View>
                          </View>
                          {trip?.organizer?.id === item?.passenger?.id &&
                          !isUserDeleted ? (
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
                          ) : (
                            (isOrganisor || user?.id == item?.passenger?.id) &&
                            !isUserDeleted && (
                              <Entypo
                                onPress={() => {
                                  if (isTripStarted) {
                                    alert(
                                      'You can not update your crew after 6 hr of trip started',
                                    );
                                    return;
                                  }
                                  removePassenger(
                                    item?.id,
                                    item?.passenger?.id,
                                  );
                                }}
                                name="circle-with-cross"
                                style={{
                                  fontSize: getFontSize(18),
                                  color: Color.lightblue,
                                  position: 'absolute',
                                  right: 0,
                                }}
                              />
                            )
                          )}
                        </View>
                      );
                    })}
                  </View>
                  <View style={[styles.ph6, styles.mt2]}>
                    <View style={[styles.iconflex]}>
                      <FastImage
                        source={require('../assets/images/icon/surfingLogo.png')}
                        style={styles.detailicon}
                        tintColor={Color.cardgray}
                      />
                      <Text style={styles.nametext}>Passenger (s)</Text>
                    </View>
                    {passengersList?.map(item => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.passenger?.id),
                        );
                      return (
                        <View
                          key={item?.id}
                          style={[styles.crewrow, styles.mt2]}
                        >
                          <View
                            style={[
                              styles.passengerimgcontainer,
                              isOrganisor && { width: '40%' },
                            ]}
                          >
                            <Pressable
                              onPress={() => {
                                !isUserDeleted &&
                                  navigation.navigate('Profile', {
                                    userId: item?.passenger?.id,
                                  });
                              }}
                            >
                              <FastImage
                                source={
                                  isUserDeleted
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
                            <View>
                              <Text style={styles.subnametext}>
                                {isUserDeleted
                                  ? 'Deletion Requested'
                                  : item?.passenger?.firstName +
                                    ' ' +
                                    item?.passenger?.lastName}
                              </Text>
                              {!isUserDeleted && (
                                <Text
                                  style={[
                                    styles.status,
                                    trip?.organizer?.id ===
                                      item?.passenger?.id && {
                                      maxWidth:
                                        CURRENT_WIDTH - dynamicSize(200),
                                    },
                                  ]}
                                >
                                  {getUserInfoText(item?.passenger)}
                                </Text>
                              )}
                            </View>
                          </View>
                          {trip?.organizer?.id === item?.passenger?.id &&
                          isUserDeleted ? (
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
                          ) : (
                            (isOrganisor || user?.id == item?.passenger?.id) &&
                            !isUserDeleted && (
                              <Entypo
                                onPress={() => {
                                  if (isTripStarted) {
                                    alert(
                                      'You can not update your crew after 6 hr of trip started',
                                    );
                                    return;
                                  }
                                  removePassenger(
                                    item?.id,
                                    item?.passenger?.id,
                                  );
                                }}
                                name="circle-with-cross"
                                style={{
                                  fontSize: getFontSize(18),
                                  color: Color.lightblue,
                                  position: 'absolute',
                                  right: 0,
                                }}
                              />
                            )
                          )}
                        </View>
                      );
                    })}
                  </View>
                  <View style={[styles.ph6, styles.mt2]}>
                    <View style={[styles.iconflex]}>
                      {/*   <FastImage
                      source={require('../assets/images/icon/Search.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    /> */}
                      <MaterialIcons
                        name="remove-red-eye"
                        color={Color.cardgray}
                        size={21}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.nametext}>Interested </Text>
                    </View>
                    {interstedUsers.map(item => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.sender?.id),
                        );
                      if (item?.status == 0)
                        return (
                          <View
                            key={item?.id}
                            style={[styles.crewrow, styles.mt2]}
                          >
                            <View
                              style={[
                                styles.passengerimgcontainer,
                                isOrganisor && { width: '40%' },
                              ]}
                            >
                              <Pressable
                                onPress={() => {
                                  !isUserDeleted &&
                                    navigation.navigate('Profile', {
                                      userId: item?.sender?.id,
                                    });
                                }}
                              >
                                <FastImage
                                  source={
                                    isUserDeleted
                                      ? require('../assets/images/logo.png')
                                      : {
                                          uri: item?.sender
                                            ?.thumbnailProfileImage,
                                          cache:
                                            FastImage.cacheControl.immutable,
                                        }
                                  }
                                  style={styles.profileimg}
                                />
                              </Pressable>
                              <View>
                                <Text style={styles.subnametext}>
                                  {isUserDeleted
                                    ? 'Deletion Requested'
                                    : item?.sender?.firstName +
                                      ' ' +
                                      item?.sender?.lastName}
                                </Text>
                                {!isUserDeleted && (
                                  <Text style={styles.status}>
                                    {getUserInfoText(item?.sender)}
                                  </Text>
                                )}
                              </View>
                            </View>
                            {showEveryThing &&
                              user.id == routeItem?.organizer?.id &&
                              !isUserDeleted && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Pressable
                                    onPress={async () => {
                                      if (isTripStarted) {
                                        alert(
                                          'You can not update your crew after 6 hr of trip started',
                                        );
                                        return;
                                      }
                                      try {
                                        const data = await Trip.declineInvite(
                                          item?.id,
                                        );

                                        getInterstedUsers();
                                        getPassenger();
                                      } catch (error) {}
                                    }}
                                  >
                                    <View
                                      style={{
                                        backgroundColor: 'white',
                                        borderWidth: 1,
                                        borderColor: Color.lightblue,
                                        borderRadius: dynamicSize(50),
                                        height: dynamicSize(25),
                                        width: dynamicSize(60),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color: Color.lightblue,
                                          fontSize: getFontSize(12),
                                        }}
                                      >
                                        {'Decline'}
                                      </Text>
                                    </View>
                                  </Pressable>
                                  <View style={{ width: dynamicSize(8) }} />
                                  <Pressable
                                    onPress={async () => {
                                      if (isTripStarted) {
                                        alert(
                                          'You can not update your crew after 6 hr of trip started',
                                        );
                                        return;
                                      }
                                      try {
                                        const data = await Trip.acceptInvite(
                                          item?.id,
                                        );

                                        getInterstedUsers();
                                        getPassenger();
                                      } catch (error) {}
                                    }}
                                  >
                                    <View
                                      style={{
                                        backgroundColor: Color.lightblue,
                                        borderRadius: dynamicSize(50),
                                        height: dynamicSize(25),
                                        width: dynamicSize(60),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Text
                                        style={{
                                          color: 'white',
                                          fontSize: getFontSize(12),
                                        }}
                                      >
                                        {'Approve'}
                                      </Text>
                                    </View>
                                  </Pressable>
                                </View>
                              )}
                          </View>
                        );
                    })}
                  </View>
                  <View style={[styles.ph6, styles.mt2]}>
                    <View style={[styles.iconflex]}>
                      {/*<FastImage
                      source={require('../assets/images/icon/Search.png')}
                      style={styles.detailicon}
                      tintColor={Color.cardgray}
                    />*/}
                      <MaterialCommunityIcons
                        name="clock-time-eight"
                        color={Color.cardgray}
                        size={21}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.nametext}>Pending</Text>
                    </View>
                    {pendingUsers?.map(item => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.invitedUser?.id),
                        );
                      if (item?.status == 0)
                        return (
                          <View
                            key={item?.id}
                            style={[styles.crewrow, styles.mt2]}
                          >
                            <View
                              style={[
                                styles.passengerimgcontainer,
                                isOrganisor && { width: '40%' },
                              ]}
                            >
                              <Pressable
                                onPress={() => {
                                  !isUserDeleted &&
                                    navigation.navigate('Profile', {
                                      userId: item?.invitedUser?.id,
                                    });
                                }}
                              >
                                <FastImage
                                  source={
                                    isUserDeleted
                                      ? require('../assets/images/logo.png')
                                      : {
                                          uri: item?.invitedUser
                                            ?.thumbnailProfileImage,
                                          cache:
                                            FastImage.cacheControl.immutable,
                                        }
                                  }
                                  style={styles.profileimg}
                                />
                              </Pressable>
                              <View>
                                <Text style={styles.subnametext}>
                                  {isUserDeleted
                                    ? 'Deletion Requested'
                                    : item?.invitedUser?.firstName +
                                      ' ' +
                                      item?.invitedUser?.lastName}
                                </Text>
                                {!isUserDeleted && (
                                  <Text style={styles.status}>
                                    {getUserInfoText(item?.invitedUser)}
                                  </Text>
                                )}
                              </View>
                            </View>
                            {showEveryThing &&
                              user.id == routeItem?.organizer?.id &&
                              !isUserDeleted && (
                                <View
                                  style={[
                                    styles.iconflex,
                                    styles.justifyend,
                                    { width: '40%' },
                                  ]}
                                >
                                  <Pressable
                                    style={styles.deleticonbtn}
                                    onPress={async () => {
                                      if (isTripStarted) {
                                        alert(
                                          'You can not update your crew after 6 hr of trip started',
                                        );
                                        return;
                                      }
                                      Alert.alert(
                                        'Alert',
                                        'Are you sure you want to delete this invite',
                                        [
                                          {
                                            text: 'Cancel',
                                          },
                                          {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: async () => {
                                              try {
                                                const data =
                                                  await Trip.deleteInvite(
                                                    item.id,
                                                  );
                                                getPendingUsers();
                                              } catch (error) {}
                                            },
                                          },
                                        ],
                                      );
                                    }}
                                  >
                                    <FastImage
                                      source={require('../assets/images/icon/AddClub.png')}
                                      style={[
                                        styles.deleteicon,
                                        {
                                          transform: [{ rotate: '45deg' }],
                                        },
                                      ]}
                                    />
                                  </Pressable>
                                </View>
                              )}
                          </View>
                        );
                    })}
                  </View>
                </View>
                {/* {!isOrganisor && isJoined && (
                  <Pressable
                    onPress={() => {
                      for (let index = 0; index < passengers.length; index++) {
                        const item = passengers[index];
                        if (item?.passenger?.id == user?.id) {
                          removePassenger(item?.id);
                          return;
                        }
                      }
                    }}
                    style={styles.cancelBtn}>
                    <Text style={styles.cancel}>{'Leave Trip'}</Text>
                  </Pressable>
                )} */}
              </ScrollView>
              {showEveryThing && user.id == routeItem?.organizer?.id && (
                <RoundButton title={'Invite'} onPress={GotoInvite} />
              )}
            </>
          )}
          {selectedIndex === 3 && (
            <>
              <ScrollView
                refs={scrollViewRefExpense}
                onScroll={({ nativeEvent }) => {
                  if (isCloseToBottom(nativeEvent)) {
                    if (!isFetchingExpense && !isDataLoadedExpense) {
                      pageNoExpenseBottom += 1;
                      getExpense(false, true);
                    }
                  } else if (isCloseToTop(nativeEvent)) {
                    if (!isFetchingExpense && !isDataLoadedExpenseTop) {
                      if (pageNoExpenseTop > 1) {
                        pageNoExpenseTop -= 1;
                        getExpense(false, false, true);
                      }
                    }
                  }
                }}
                key={selectedIndex.toString()}
                onRefresh={refreshData}
                refreshing={showLoading}
                bounces={true}
                alwaysBounceVertical={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 50 + getBottomSpace() }}
                style={{ flex: 1 }}
              >
                {TopLodaerExpense ? (
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
                {expenses?.length > 0 ? (
                  <View style={styles.detailsection2}>
                    {expenses?.map((item, index) => {
                      const isUserDeleted =
                        Array.isArray(user?.inActiveUsers) &&
                        user.inActiveUsers.some(
                          id => String(id) === String(item?.paidBy?.id),
                        );

                      return (
                        <View
                          style={{
                            borderBottomWidth: 2,
                            borderBottomColor:
                              routeItem?.ExpenseID === item?.id
                                ? heightlightColorBottom
                                : Color.lightGray,
                            borderTopColor:
                              routeItem?.ExpenseID === item?.id
                                ? heightlightColor
                                : Color.reportcardbg,
                            borderRightColor:
                              routeItem?.ExpenseID === item?.id
                                ? heightlightColor
                                : Color.reportcardbg,
                            borderLeftColor:
                              routeItem?.ExpenseID === item?.id
                                ? heightlightColor
                                : Color.reportcardbg,
                            borderTopWidth:
                              routeItem?.ExpenseID === item?.id ? 2 : 0,
                            borderRightWidth:
                              routeItem?.ExpenseID === item?.id ? 2 : 0,
                            borderLeftWidth:
                              routeItem?.ExpenseID === item?.id ? 2 : 0,
                            borderRadius: 10,
                            paddingHorizontal:
                              routeItem?.ExpenseID === item?.id ? 5 : 0,
                          }}
                          onLayout={event => {
                            const layout = event.nativeEvent.layout;
                            dataSourceCordsExpense.current[index] = layout.y;
                            dataSourceCords.current =
                              dataSourceCordsExpense.current;
                            if (
                              dataSourceCordsExpense.current?.length > 0 &&
                              dataSourceCordsExpense.current?.length < 11
                            ) {
                              scrollViewRefExpense?.current?.scrollTo({
                                x: 0,
                                y: dataSourceCordsExpense.current[
                                  scrollToIndexExpense.current
                                ],
                                animated: true,
                              });
                            }
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginVertical: dynamicSize(10),
                            }}
                          >
                            <Text style={styles.nametext}>{item?.title}</Text>
                            <Text style={styles.darknametext}>
                              {item?.amount
                                ? parseFloat(item?.amount).toFixed(2)
                                : 0.0}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: dynamicSize(10),
                            }}
                          >
                            <Text style={styles.nametext}>
                              Paid By{' '}
                              <Text style={{ color: Color.black }}>
                                {isUserDeleted
                                  ? 'Deletion Requested'
                                  : item?.paidBy?.firstName +
                                    ' ' +
                                    item?.paidBy?.lastName}
                              </Text>
                            </Text>
                            <Text style={styles.darknametext}>
                              {item?.createdAt
                                ? moment(item?.createdAt).format('DD/MM/YYYY')
                                : ''}
                            </Text>
                            {(isOrganisor || item?.paidBy?.id == user?.id) && (
                              <Entypo
                                onPress={() => {
                                  Alert.alert(
                                    'Are you sure you want to remove this expense',
                                    '',
                                    [
                                      {
                                        text: 'No',
                                        onPress: () => {},
                                      },
                                      {
                                        text: 'Yes',
                                        style: 'destructive',
                                        onPress: async () => {
                                          try {
                                            setExpensesLoader(true);
                                            const data =
                                              await Trip.deleteExpense(
                                                item?.id,
                                              );
                                            getExpense(true);
                                          } catch (error) {
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
                                    { cancelable: false },
                                  );
                                }}
                                name="circle-with-cross"
                                style={{
                                  fontSize: getFontSize(18),
                                  color: Color.lightblue,
                                  marginLeft: dynamicSize(10),
                                }}
                              />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <StatusMessage
                    isOnline={currentNetworkStatus}
                    hasData={expenses?.length > 0}
                    color={Color.gray}
                    title={'No Expence Available'}
                  />
                )}
              </ScrollView>
              {bottomLodaerExpense ? (
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
              <Modal isVisible={isExpensesVisible} style={styles.bottommodal}>
                <KeyboardAvoidingView
                  style={{ flex: 1, justifyContent: 'center' }}
                  behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
                >
                  <View style={[styles.modalView]}>
                    <Text style={styles.modaltitle}>Add Expense</Text>
                    <Pressable
                      style={styles.close}
                      onPress={toggleExpensesModal}
                    >
                      <Ionicons
                        name="close-circle"
                        size={26}
                        color={Color.lightblue}
                      />
                    </Pressable>
                    <View style={styles.pv20}>
                      <View style={styles.textinput}>
                        <TextInput
                          style={styles.inputstyles}
                          onChangeText={settextinput}
                          value={textinput}
                          // numberOfLines={6}
                          placeholderTextColor={Color.black}
                          placeholder="Expense Name"
                        />
                      </View>
                      <View style={styles.textinput}>
                        <TextInput
                          style={styles.inputstyles}
                          onChangeText={setAmountinput}
                          keyboardType={'decimal-pad'}
                          value={Amountinput}
                          // numberOfLines={6}
                          placeholderTextColor={Color.black}
                          placeholder="Amount Paid"
                        />
                      </View>
                    </View>
                    <View style={styles.btnrow}>
                      <View style={styles.buttoncontainer}>
                        <BorderButton
                          color={Color.lightblue}
                          backgroundColor={Color.white}
                          title={'Cancel'}
                          onPress={() => {
                            toggleExpensesModal();
                          }}
                        />
                      </View>
                      <View style={styles.buttoncontainer}>
                        <BorderButton
                          isProcessing={isProcessing}
                          borderColor={
                            !currentNetworkStatus ? Color.gray : Color.lightblue
                          }
                          color={Color.white}
                          backgroundColor={
                            !currentNetworkStatus ? Color.gray : Color.lightblue
                          }
                          title={'Add'}
                          onPress={async () => {
                            if (textinput?.length == 0) {
                              alert('Enter expense name');
                              return;
                            }
                            if (Amountinput) {
                              if (isNaN(Number(Amountinput))) {
                                alert('Invalid Amount');
                                return;
                              }
                            } else {
                              alert('Enter expense amount');
                              return;
                            }
                            try {
                              setIsProcessing(true);
                              const data = {
                                tripId: trip.id,
                                title: textinput,
                                amount: parseFloat(Amountinput).toFixed(2),
                              };
                              const res = await Trip.addExpences(data);
                              setIsProcessing(false);
                              toggleExpensesModal();
                              setTimeout(
                                () => {
                                  setExpenseSuccess(true);
                                },
                                Platform.OS == 'ios' ? 300 : 0,
                              );
                              settextinput('');
                              setAmountinput('');
                            } catch (error) {}
                          }}
                          disabled={!currentNetworkStatus}
                        />
                      </View>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </Modal>
              <RoundButton
                title={'Add Expense'}
                onPress={toggleExpensesModal}
                disabled={!currentNetworkStatus}
                backgroundColor={
                  !currentNetworkStatus ? Color.gray : Color.lightblue
                }
              />
            </>
          )}
          {selectedIndex === 5 && (
            <>
              <View key={selectedIndex.toString()} style={{ flex: 1 }}>
                <FlatList
                  horizontal={false}
                  data={reports}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 100 }}
                  onEndReachedThreshold={0.5}
                  onEndReached={event => {
                    if (!isFetchingReport && !isDataLoadedReport) {
                      pageNoReport += 1;
                      getTripReport(false, true);
                    }
                  }}
                  ListFooterComponent={() => {
                    if (bottomLodaerReport) {
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
                  keyExtractor={({ item }, index) => index.toString()}
                  ListEmptyComponent={
                    <StatusMessage
                      isOnline={currentNetworkStatus}
                      hasData={reports?.length > 0}
                      color={Color.gray}
                      title={'No Reports Available'}
                    />
                  }
                />
                <RoundButton
                  title={'Write A Report'}
                  onPress={GotocreateReport}
                  disabled={!currentNetworkStatus}
                  backgroundColor={
                    !currentNetworkStatus ? Color.gray : Color.lightblue
                  }
                />
              </View>
            </>
          )}

          {selectedIndex === 6 && !isInitialLoading && (
            <View style={{ flex: 1 }} key={selectedIndex.toString()}>
              <FlatList
                ref={flatListRef}
                data={flatChatData || []}
                keyExtractor={(item, index) => item.id?.toString() + index}
                inverted={true}
                renderItem={({ item, index }) => {
                  const isUserDeleted =
                    Array.isArray(user?.inActiveUsers) &&
                    user.inActiveUsers.some(
                      id => String(id) === String(item?.author?.id),
                    );

                  const isUserDeletedquatedata =
                    Array.isArray(user?.inActiveUsers) &&
                    user.inActiveUsers.some(
                      id => String(id) === String(item?.quoteChat?.author?.id),
                    );
                  // const isFirstUnread =
                  //   (index + 1)?.toString() === actualIndex?.toString() &&
                  //   unreadCount > 0;
                  if (item.type === 'header') {
                    // Render Date Header
                    return (
                      <View
                        style={{ alignItems: 'center', paddingVertical: 8 }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: Color.primary,
                            fontFamily: fontFamily.ProximaR,
                          }}
                        >
                          {item.title}
                        </Text>
                      </View>
                    );
                  }

                  // Render Message
                  return (
                    <>
                      <View
                        key={item?.id}
                        onLayout={event => {
                          if (selectedMessage?.id === item.id) {
                            const { x, y, width, height } =
                              event.nativeEvent.layout;
                            setPopupPosition({ x, y, width, height });
                          }
                        }}
                        style={{ position: 'relative' }}
                      >
                        <Pressable
                          ref={ref => {
                            if (ref) messageRefs.current[item.id] = ref;
                          }}
                          style={[
                            styles.chatcontainer,
                            item?.author?.id !== user?.id && {
                              flexDirection: 'row-reverse',
                              alignSelf: 'flex-start',
                              justifyContent: 'flex-start',
                            },
                            {
                              marginLeft:
                                item?.author?.id !== user?.id
                                  ? dynamicSize(Platform.OS == 'ios' ? 50 : 10)
                                  : dynamicSize(Platform.OS == 'ios' ? 50 : 50),
                              marginRight:
                                item?.author?.id !== user?.id
                                  ? dynamicSize(Platform.OS == 'ios' ? 10 : 50)
                                  : dynamicSize(Platform.OS == 'ios' ? 10 : 10),
                            },
                          ]}
                          onLongPress={() => {
                            if (!isReply) {
                              setSelectedMessage(item);
                              setTimeout(() => {
                                messageRefs.current[item.id]?.measure(
                                  (fx, fy, width, height, px, py) => {
                                    setPopupPosition({
                                      x: px,
                                      y: py,
                                      width,
                                      height,
                                    });
                                    setShowMessageOptions(item.id);
                                  },
                                );
                              }, 80);
                            }
                          }}
                        >
                          {/* Message content: text, image, quote, time */}
                          <View
                            style={[
                              item?.author?.id !== user?.id && {
                                alignItems: 'flex-start',
                              },
                            ]}
                          >
                            <View
                              style={{
                                backgroundColor:
                                  item?.text || isUserDeleted
                                    ? item?.author?.id === user?.id
                                      ? '#B5EAF0'
                                      : Color.GSCbg
                                    : 'transparent',
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderTopLeftRadius:
                                  item?.author?.id === user?.id ? 20 : 1,
                                borderTopRightRadius:
                                  item?.author?.id === user?.id ? 0 : 20,
                                borderBottomLeftRadius: 20,
                                borderBottomRightRadius: 20,
                                marginLeft:
                                  item?.author?.id === user?.id ? 20 : 0,
                                marginRight:
                                  item?.author?.id === user?.id ? 0 : 20,
                              }}
                            >
                              {item?.quoteChat && (
                                <View
                                  style={{
                                    padding: 5,
                                    borderRadius: 10,
                                    borderLeftColor: Color.primary,
                                    borderLeftWidth: 4,
                                    backgroundColor: Color.cardgray,
                                    marginTop: 5,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontFamily: fontFamily.ProximaBold,
                                      color: Color.black,
                                    }}
                                  >
                                    {isUserDeletedquatedata
                                      ? 'Deletion Requested'
                                      : item?.quoteChat?.author?.firstName +
                                        ' ' +
                                        item?.quoteChat?.author?.lastName}
                                  </Text>
                                  <Text
                                    style={{
                                      fontFamily: fontFamily.ProximaAL,
                                      fontSize: 14,
                                      color: Color.black,
                                    }}
                                    numberOfLines={2}
                                  >
                                    {isUserDeletedquatedata
                                      ? 'Member requested to delete'
                                      : item?.quoteChat?.text}
                                  </Text>
                                </View>
                              )}
                              {isUserDeleted ? (
                                <Text
                                  style={{
                                    fontFamily: fontFamily.ProximaAL,
                                    fontSize: 14,
                                    color: Color.black,
                                  }}
                                >
                                  {' '}
                                  Member requested to delete
                                </Text>
                              ) : (
                                <>
                                  {item?.thumbnailImagePath && (
                                    <Pressable
                                      onPress={() => {
                                        setChatImageUrl(item?.imagePath);
                                        setChatImagePreview(true);
                                      }}
                                    >
                                      <FastImage
                                        source={{
                                          uri: `${item?.thumbnailImagePath}`,
                                          cache:
                                            FastImage.cacheControl.immutable,
                                        }}
                                        style={{
                                          height: 100,
                                          width: 200,
                                          borderRadius: 20,
                                        }}
                                      />
                                    </Pressable>
                                  )}
                                  {item?.text && (
                                    <Hyperlink
                                      onPress={url => Linking.openURL(url)}
                                      linkStyle={{ color: Color.primary }}
                                    >
                                      <Text
                                        style={{
                                          fontFamily: fontFamily.ProximaAL,
                                          fontSize: 14,
                                          color: Color.black,
                                        }}
                                      >
                                        {item?.text}
                                      </Text>
                                    </Hyperlink>
                                  )}
                                </>
                              )}
                            </View>

                            <Text style={styles.chattime}>
                              {item?.createdAt
                                ? moment(item?.createdAt).format('hh:mm A')
                                : ''}
                            </Text>
                          </View>
                          <Pressable
                            onPress={() =>
                              !isUserDeleted &&
                              navigation.navigate('Profile', {
                                userId: item?.author?.id,
                              })
                            }
                          >
                            <FastImage
                              source={
                                isUserDeleted
                                  ? require('../assets/images/logo.png')
                                  : {
                                      uri: item?.author?.thumbnailProfileImage,
                                      cache: FastImage.cacheControl.immutable,
                                    }
                              }
                              style={styles.chatprofileimg}
                            />
                          </Pressable>
                        </Pressable>
                      </View>
                      {/* {isFirstUnread && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginVertical: 10,
                            paddingHorizontal: 10,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              height: 1,
                              backgroundColor: Color.primary, // 👈 your theme color
                              opacity: 0.4,
                            }}
                          />

                         <Text
                            style={{
                              marginHorizontal: 10,
                              fontSize: 12,
                              color: Color.primary,
                              fontWeight: '600',
                            }}
                          >
                            {'Last read'}
                          </Text>

                         <View
                            style={{
                              flex: 1,
                              height: 1,
                              backgroundColor: Color.primary,
                              opacity: 0.4,
                            }}
                          />
                        </View>
                      )} */}
                    </>
                  );
                }}
                ListFooterComponent={renderFooter}
                contentContainerStyle={{ paddingBottom: getBottomSpace() }}
                onEndReached={loadMoreChats}
                onEndReachedThreshold={0.5}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshLoader}
                    onRefresh={() => loadChats(1, false, false, true)}
                  />
                }
              />
              {flatChatData?.length === 0 && (
                <View
                  style={{ top: 10, position: 'absolute', alignSelf: 'center' }}
                >
                  <StatusMessage
                    isOnline={currentNetworkStatus}
                    hasData={flatChatData?.length > 0}
                    color={Color.gray}
                    title={'No Chat Available'}
                  />
                </View>
              )}

              {isReply && selectedMessage && (
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: Color.GSCbg,
                    paddingHorizontal: 5,
                  }}
                >
                  <View style={{ flex: 1, marginVertical: 5 }}>
                    <Text
                      style={{
                        fontFamily: fontFamily.ProximaBold,
                        color: Color.black,
                      }}
                    >
                      {selectedMessage?.author?.firstName +
                        ' ' +
                        selectedMessage?.author?.lastName}
                    </Text>
                    <Text
                      style={[globlestyle.allcommenttext, { marginTop: 0 }]}
                      numberOfLines={1}
                    >
                      {!selectedImages?.thumbnailImagePath &&
                      selectedMessage?.text
                        ? selectedMessage?.text
                        : // renderMessageText(selectedMessage?.text)
                          'Photo'}
                    </Text>
                  </View>
                  {selectedMessage?.thumbnailImagePath && (
                    <View>
                      <FastImage
                        source={{
                          uri: `${selectedMessage?.thumbnailImagePath}`,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={{
                          height: 50,
                          width: 50,
                          borderRadius: 10,
                          marginRight: 30,
                        }}
                      />
                    </View>
                  )}
                  <Pressable
                    onPress={() => {
                      setIsReply(false);
                      setSelectedMessage(null);
                    }}
                    style={{ position: 'absolute', right: 10, top: 0 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={25}
                      color={Color.lightblue}
                    />
                  </Pressable>
                </View>
              )}
              <View style={styles.commentinputcontainer}>
                <Pressable
                  onPress={async () => {
                    openGallery();
                  }}
                  style={[styles.sendbtn]}
                  disabled={isSendInProgress || !currentNetworkStatus}
                >
                  <Entypo name="attachment" size={18} color={Color.cardgray} />
                </Pressable>
                <View style={styles.ChatTextInputContainer}>
                  <TextInput
                    multiline
                    style={styles.ChatTextInput}
                    onChangeText={setChatText}
                    value={chatText}
                    placeholderTextColor={Color.cardgray}
                    placeholder="Send Message...."
                    editable={!isSendInProgress}
                  />
                </View>

                <Pressable
                  onPress={async () => {
                    openCamera();
                  }}
                  style={[styles.sendbtn]}
                  disabled={isSendInProgress || !currentNetworkStatus}
                >
                  <FontAwesome name="camera" size={18} color={Color.cardgray} />
                </Pressable>
                <Pressable
                  onPress={sendChat}
                  style={[styles.sendbtn]}
                  disabled={
                    isSendInProgress ||
                    (!chatText && selectedImages.length === 0)
                  }
                >
                  {isSendInProgress ? (
                    <ActivityIndicator size="small" color={Color.cardgray} />
                  ) : (
                    <FontAwesome name="send" size={20} color={Color.cardgray} />
                  )}
                </Pressable>
              </View>

              {showSuggestions && (
                <View style={styles.suggestionBox}>
                  <FlatList
                    data={filteredMembers}
                    keyExtractor={item => item.id.toString()}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => selectMember(item)}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.subnametext}>
                          {item?.passenger?.firstName +
                            ' ' +
                            item?.passenger?.lastName}
                        </Text>
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          )}
        </View>
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
        <SuccessModal
          visible={expenseSuccess}
          description={'Trip expense added successfully'}
          onClose={() => {
            getExpense(true);
            setExpenseSuccess(false);
          }}
        />

        <ImagePreviewModal
          visible={showPreview}
          images={selectedImages}
          onClose={() => {
            setShowPreview(false);
            setSelectedImages([]);
            setCurrentIndex(0);
          }}
          onSend={() => {
            handleSend();
            setSelectedImages([]);
            setCurrentIndex(0);
          }}
          updateTag={updateTag}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />

        {showMessageOptions && selectedMessage && (
          <MessageOptionsPopup
            visible={showMessageOptions && selectedMessage}
            position={{
              y: popupPosition.y,
              x: popupPosition.x,
              width: popupPosition.width,
              height: popupPosition.height,
            }}
            messageContent={
              <View
                style={{
                  backgroundColor:
                    selectedMessage?.author?.id === user?.id
                      ? '#B5EAF0'
                      : Color.GSCbg,
                  borderTopLeftRadius:
                    selectedMessage?.author?.id === user?.id ? 20 : 1,
                  borderTopRightRadius:
                    selectedMessage?.author?.id === user?.id ? 0 : 20,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                {selectedMessage?.thumbnailImagePath && (
                  <FastImage
                    source={{
                      uri: selectedMessage?.thumbnailImagePath,
                      cache: FastImage.cacheControl.immutable,
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      marginRight: 8,
                      backgroundColor: '#eee',
                    }}
                  />
                )}
                {selectedMessage?.text && (
                  <Text
                    style={{
                      fontFamily: fontFamily.ProximaAL,
                      fontSize: 14,
                      color: Color.black0,
                    }}
                  >
                    {selectedMessage?.text}
                  </Text>
                )}
              </View>
            }
            onClose={() => {
              setShowMessageOptions(null);
              setSelectedMessage(null);
              setIsReply(false);
            }}
            onReply={() => {
              setIsReply(true);
              setShowMessageOptions(null);
            }}
            onLike={() => {
              setShowMessageOptions(null);
            }}
            isCurrentUser={selectedMessage?.author?.id === user?.id}
            chatId={selectedMessage?.id}
            user={user}
            tripId={routeItem?.id}
          />
        )}

        <PreviewModal
          visible={chatImagePreview}
          onClose={() => {
            setChatImagePreview(false);
            setChatImageUrl(null);
          }}
          photoUrl={chatImageUrl}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
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
    lineHeight: getLineSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
  },
  commentreply: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: 16,
  },
  cancelBtn: {
    backgroundColor: Color.red,
    height: dynamicSize(30),
    marginRight: dynamicSize(20),
    marginBottom: dynamicSize(20),
    width: dynamicSize(100),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: dynamicSize(10),
    alignSelf: 'flex-end',
  },
  cancel: {
    fontSize: getFontSize(12),
    color: Color.white,
    fontFamily: fontFamily.ProximaExtraBold,
    lineHeight: 16,
  },
  cancel1: {
    fontSize: getFontSize(14),
    color: Color.red,
    fontFamily: fontFamily.ProximaExtraBold,
  },
  commenttimr: {
    fontSize: getFontSize(12),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(16),
  },
  sendbtn: {
    alignItems: 'center',
    paddingHorizontal: dynamicSize(10),
    paddingVertical: dynamicSize(10),
  },
  pr10: {
    paddingRight: dynamicSize(10),
  },
  chattext: {
    fontSize: getFontSize(14),
    lineHeight: getFontSize(19),
    color: Color.black,
    textAlign: 'right',
    fontFamily: fontFamily.ProximaR,
  },
  chattime: {
    fontSize: 11,
    fontWeight: '600',
    color: Color.black,
    textAlign: 'right',
    marginTop: 5,
    fontFamily: fontFamily.ProximaAB,
  },
  chatmsg: {},
  chatcontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: dynamicSize(50),
    marginRight: dynamicSize(10),
    alignItems: 'flex-start',
    marginVertical: 5,
  },

  commentinputcontainer: {
    borderTopColor: Color.lightGray,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: Color.white,
    paddingVertical: 10,
  },

  coomentinput: {
    flex: 1,
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    lineHeight: getFontSize(21),
    maxHeight: dynamicSize(300),
  },
  coomentinput: {
    // width: '75%',
    flex: 1,
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    lineHeight: getFontSize(21),
    maxHeight: dynamicSize(300),
  },
  justifyCenter: {
    alignSelf: 'auto',
  },
  // comment input
  ImageContainer: {
    paddingHorizontal: 10,
  },
  replybutton: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replycontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  commenttext: {
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    lineHeight: getLineSize(21),
  },
  userNametext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(21),
    color: Color.black,
  },
  likeicon: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    alignSelf: 'baseline',
  },
  close: {
    height: 35,
    width: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
  },
  pv20: {
    paddingVertical: 20,
  },
  btnrow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttoncontainer: {
    width: '40%',
    marginHorizontal: 5,
  },
  inputstyles: {
    height: 30,
    padding: 0,
    paddingHorizontal: 10,
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    lineHeight: 21,
  },
  textinput: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightblue,
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  modalbtntext: {
    textAlign: 'center',
    fontSize: getFontSize(17),
    fontWeight: '400',
    color: Color.lightblue,
  },
  divider: {
    marginVertical: 13,
    height: 1.5,
    backgroundColor: Color.cardbg,
  },
  modalbutton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  modaltext: {
    fontSize: getFontSize(13),
    fontWeight: '400',
    color: Color.gray,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  modaltitle: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getLineSize(21),
    color: Color.black,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  bottommodal: {},
  modalView: {
    backgroundColor: Color.white,
    paddingVertical: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  viewContainer: {
    flex: 1,
  },
  deleteicon: {
    height: dynamicSize(20),
    width: dynamicSize(20),
  },
  deleticonbtn: {
    height: dynamicSize(35),
    width: dynamicSize(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  justifyend: {
    justifyContent: 'flex-end',
  },
  crewtext: {
    fontSize: getFontSize(15),
    fontWeight: '600',
    color: Color.black,

    alignItems: 'center',
  },
  crewrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonscrollview: {
    paddingHorizontal: 5,
    marginBottom: 20,
    height: 60,
  },
  editnametext: {
    fontSize: getFontSize(18),
    fontFamily: fontFamily.ProximaAB,
    color: Color.lightblue,
    lineHeight: 25,
  },
  editbutton: {
    height: dynamicSize(30),
    width: dynamicSize(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editbuttonimg: {
    height: dynamicSize(15),
    width: dynamicSize(15),
    marginLeft: dynamicSize(10),
    resizeMode: 'cover',
  },
  editnamecontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  btnGroup: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginTop: 10,

    backgroundColor: Color.lightGray,
    borderRadius: 10,
  },
  btn: {
    // flex: 1,
    borderRadius: 10,
    width: dynamicSize(85),
    alignItems: 'center',
    justifyContent: 'center',
    height: dynamicSize(45),
    borderWidth: 1,
    borderColor: Color.lightblue,
    marginHorizontal: dynamicSize(5),
  },
  btnText: {
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: getFontSize(15),
    lineHeight: getLineSize(21),
    fontFamily: fontFamily.ProximaR,
    color: Color.lightblue,
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
  passengerimgcontainer2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    height: dynamicSize(20),
    // height: 20,
    width: dynamicSize(20),
    marginRight: 5,
  },
  mt2: {
    marginTop: 10,
  },
  subtitle: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontWeight: '600',
    width: '85%',
  },
  inputcontainer: {
    paddingHorizontal: 20,
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
  nametext: {
    ...text.tripitemtitle,
    color: Color.cardgray,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  darknametext: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    color: Color.black0,
  },
  subnametext: {
    ...text.usernameboldtitle,
    color: Color.black,
  },
  status: {
    ...text.usernamestatus,
    color: Color.black,
  },
  profileimg: {
    width: dynamicSize(45),
    height: dynamicSize(45),
    marginRight: 10,
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  chatprofileimg: {
    width: dynamicSize(40),
    height: dynamicSize(40),
    marginHorizontal: 10,
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  suggestionBox: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 999,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  ChatTextInput: {
    // borderRadius: 20,
    // backgroundColor: Color.lightGray,
    // width: '60%',
    // padding: 10,
  },
  ChatTextInputContainer: {
    borderRadius: 20,
    backgroundColor: Color.lightGray,
    width: '60%',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    // paddingBottom: 15,
  },
});

//make this component available to the app
export default ClubTripdetail;

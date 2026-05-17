//import liraries
import { CommonActions, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { SectionList } from 'react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useDispatch, useSelector } from 'react-redux';
import {
  Color,
  fontFamily,
  NotInvitedMessage,
  NotPaidMessage,
  StorageKeys,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import Trip from '../api/Trip';
import ListIndex from '../api/ListIndex';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationRadiobtn from '../components/NotificationRadiobtn';
import { NotificationHeader } from '../components/NotificationHeader';
import { Swipeable } from 'react-native-gesture-handler';
import Profile from '../api/Profile';
import {
  deleteNotificationAction,
  getNotificationCount,
  getNotifications,
  getReceivedRequest,
  notificationModificationThunk,
  readNotification,
} from '../store/profileSlice';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from '../components/ConnectionBanner';
import StatusMessage from '../components/StatusMessage';
import SyncInfo from '../components/SyncStatus';
import FastImage from 'react-native-fast-image';

let pageNo = 1;
let isFetching = false;
let isDataLoaded = false;
const Notification = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const receivedRequests = useSelector(state => state.profile.receivedRequests);
  const [showLoading, SetshowLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [requestLoader, setRequestLoader] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notifiactionIdList, setNotificationIdList] = useState([]);
  const notificationList = useSelector(state => state.profile.notificationList);
  const lastSync = useSelector(state => state.profile.lastSyncTime);
  const user = useSelector(state => state.auth.user);
  const isInvited = useSelector(state => state.auth.isInvited);
  const isFullAccess = user?.isFullAccess;
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        GetNotifications(true);
      } else {
        setIsEditMode(false);
      }
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const BackButtonClick = () => {
    const { routes } = navigation.getState();
    if (routes?.length == 2) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SideDrower' }],
        }),
      );
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    GetNotifications(true);
    dispatch(getNotificationCount());
    getRequests();
    return navigation.addListener('focus', async () => {});
  }, []);

  const GetNotifications = async (isRefresh, isBottom) => {
    if (isBottom) {
      setBottomLodaer(true);
    } else if (isRefresh) {
      isDataLoaded = false;
      pageNo = 1;
      setRefreshing(true);
    }
    isFetching = true;

    await new Promise(resolve => {
      dispatch(
        getNotifications(pageNo, (status, isEnded) => {
          setRefreshing(false);
          setBottomLodaer(false);
          SetshowLoading(false);
          isFetching = false;
          if (isEnded && status) {
            isDataLoaded = true;
          }
        }),
      );
    });
  };

  const ReadNotification = async id => {
    dispatch(readNotification(id));
  };

  const handleNotification = async item => {
    try {
      if (!isFullAccess) {
        alert(isInvited ? NotPaidMessage : NotInvitedMessage);
        return;
      }
      if (item?.isDelete) {
        alert('Member requested to delete');
        return;
      }
      let tripData = {};
      let listIndex = 0;
      ReadNotification(item?.id);
      switch (item?.targetType) {
        case 'TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          SetshowLoading(false);
          navigation.navigate('TripDetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
          });
          break;
        case 'CREW_TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          SetshowLoading(false);
          navigation.navigate('TripDetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isCrew: true,
          });
          break;
        case 'FRIEND_REQUEST':
          navigation.navigate('Profile', {
            userId: item?.targetId,
          });
          break;
        case 'NEW_FRIEND':
          navigation.navigate('Profile', {
            userId: item?.targetId,
          });
          break;
        case 'TRIP_COMMENT':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          // navigation.navigate('TripDetail', {
          //   ...tripData,
          //   showAll: user?.id == tripData?.organizer?.id,
          //   isComment: true,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('TripComments', {
            ...tripData,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'TRIP_COMMENT_LIKE':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          // navigation.navigate('TripDetail', {
          //   ...tripData,
          //   showAll: user?.id == tripData?.organizer?.id,
          //   isComment: true,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('TripComments', {
            ...tripData,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'TRIP_CARD':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getMyTripListIndex(item?.targetId),
          );

          SetshowLoading(false);
          navigation.navigate('Mytrip', {
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'TRIP_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getInviteTripListIndex(item?.mainId, user?.id),
          );
          SetshowLoading(false);
          navigation.navigate('Mytrip', {
            isInvite: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'FORUM':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'FORUM_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'FORUM_UPDATE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'FORUM_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          // navigation.navigate('Postcomment', {
          //   id: item?.targetId,
          //   data: [],
          //   ForumName: item?.sectionName,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('PostDetailScreen', {
            postId: item?.targetId,
            ListIndex: listIndex,
            CommentID: item?.mainId,
            clubId: '-999',
          });
          break;

        case 'FORUM_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          // navigation.navigate('Postcomment', {
          //   id: item?.targetId,
          //   data: [],
          //   ForumName: item?.sectionName,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('PostDetailScreen', {
            postId: item?.targetId,
            ListIndex: listIndex,
            CommentID: item?.mainId,
            clubId: '-999',
          });
          break;
        case 'TRIP_CARD_COMMUNITY':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
              'trip',
            ),
          );

          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: false,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'TRIP_REPORT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
              'tripreport',
            ),
          );
          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: false,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'TRIP_REPORT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('TripReportComments', {
            reportId: item?.targetId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'TRIP_REPORT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('TripReportComments', {
            reportId: item?.targetId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'TRIP_REPORT_LIKED':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
              'tripreport',
            ),
          );
          SetshowLoading(false);
          navigation.navigate('Community', {
            isForum: false,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TargetID: item?.targetId,
          });
          break;
        case 'CHAT':
          navigation.navigate('PersonalChat', {
            oppUserId: item?.targetId,
          });
          break;
        case 'TRIP_CHAT':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          SetshowLoading(false);
          navigation.navigate('TripDetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isChat: true,
          });
          break;
        case 'TRIP_EXPENSE':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripExpense(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('TripDetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isExpense: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ExpenseID: item?.mainId,
          });
          break;
        case 'CLUB':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubListIndex(item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubHomeMain', {
            isIndex: false,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ClubID: item?.targetId,
          });
          break;
        case 'CLUB_UPDATE':
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 7,
          });
          break;
        case 'CLUB_MEMBER_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubListIndex(item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubHomeMain', {
            isIndex: false,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ClubID: item?.targetId,
          });
          break;
        case 'CLUB_MEMBER':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubMemberListIndex(item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 2,
            ListIndex: listIndex > 0 ? listIndex : 0,
            MemberID: item?.mainId,
          });
          break;
        case 'CLUB_FORUM':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.mainId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 1,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ForumID: item?.mainId,
          });
          break;
        case 'CLUB_FORUM_UPDATE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.mainId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 1,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ForumID: item?.mainId,
          });
          break;
        case 'CLUB_FORUM_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              item?.mainId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 1,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ForumID: item?.mainId,
          });
          break;
        case 'CLUB_FORUM_COMMENT':
          // navigation.navigate('ClubForumcomment', { id: item?.targetId, data: [], ForumName: item?.sectionName });
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          // navigation.navigate('Postcomment', {
          //   id: item?.targetId,
          //   data: [],
          //   ForumName: item?.sectionName,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('PostDetailScreen', {
            postId: item?.targetId,
            ListIndex: listIndex,
            CommentID: item?.mainId,
            clubId: item?.clubId,
          });
          break;
        case 'CLUB_FORUM_COMMENT_LIKE':
          // navigation.navigate('ClubForumcomment', { id: item?.targetId, data: [], ForumName: item?.sectionName });
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          // navigation.navigate('Postcomment', {
          //   id: item?.targetId,
          //   data: [],
          //   ForumName: item?.sectionName,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('PostDetailScreen', {
            postId: item?.targetId,
            ListIndex: listIndex,
            CommentID: item?.mainId,
            clubId: item?.clubId,
          });

          break;
        case 'CLUB_TRIP':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(item?.mainId, item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 4,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TripID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_CARD':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(item?.mainId, item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 4,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TripID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(item?.targetId, item?.clubId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 4,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TripID: item?.targetId,
          });
          break;
        case 'CLUB_TRIP_EXPENSE':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripExpense(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubTripdetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isExpense: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ExpenseID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_REPORT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripReportListIndex(
              item?.mainId,
              item?.targetId,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 5,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TripReportID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_REPORT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubTripReportComments', {
            reportId: item?.targetId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_REPORT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubTripReportComments', {
            reportId: item?.targetId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_REPORT_LIKED':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripReportListIndex(
              item?.mainId,
              item?.targetId,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 5,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            TripReportID: item?.mainId,
          });
          break;
        case 'CLUB_CREW_TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          SetshowLoading(false);
          navigation.navigate('ClubTripdetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isCrew: true,
          });
          break;
        case 'CLUB_TRIP_CHAT':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.gettripChatListIndex(item?.mainId, item?.targetId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubTripdetail', {
            ...tripData,
            showAll: user?.id == tripData?.organizer?.id,
            isChat: true,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            ChatID: item?.mainId,
          });
          break;
        case 'CLUB_TRIP_COMMENT':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          // navigation.navigate('ClubTripdetail', {
          //   ...tripData,
          //   showAll: user?.id == tripData?.organizer?.id,
          //   isComment: true,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('TripComments', {
            ...tripData,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
            isClub: true,
          });
          break;
        case 'CLUB_TRIP_COMMENT_LIKE':
          SetshowLoading(true);
          tripData = JSON.parse(await Trip.getCurrentTrip(item?.targetId));
          listIndex = JSON.parse(
            await ListIndex.getTripComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          // navigation.navigate('ClubTripdetail', {
          //   ...tripData,
          //   showAll: user?.id == tripData?.organizer?.id,
          //   isComment: true,
          //   ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          //   CommentID: item?.mainId,
          // });
          navigation.navigate('TripComments', {
            ...tripData,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
            CommentID: item?.mainId,
            isClub: true,
          });
          break;
        //Event Notification
        case 'EVENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventListIndex(
              item?.targetId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('EventHomeMain', {
            index: item?.receiverUserId == item?.senderUserId ? 1 : 0,
            EventIDH: item?.targetId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'EVENT_LIKE':
          navigation.navigate('EventViewDetail', {
            EventId: item?.targetId,
            clubid: '-999',
            isPublish: 'isPublish',
          });
          break;
        case 'EVENT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubEventComments', {
            EventId: item?.targetId,
            clubid: '-999',
            isPublish: 'isPublish',
            CommentID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'EVENT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubEventComments', {
            EventId: item?.targetId,
            clubid: '-999',
            isPublish: 'isPublish',
            CommentID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'EVENT_ATTEND':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventAttendListIndex(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('EventViewDetail', {
            EventId: item?.targetId,
            clubid: '-999',
            isPublish: 'isPublish',
            MemberID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'CLUB_EVENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventListIndex(
              item?.mainId,
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('ClubProfile', {
            clubid: item?.clubId,
            Selection: 6,
            EventIDH: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'CLUB_EVENT_LIKE':
          // navigation.navigate('ClubProfile', { clubid: item?.clubId, Selection: 6 });
          navigation.navigate('EventViewDetail', {
            EventId: item?.targetId,
            clubid: item?.clubId,
          });
          break;
        case 'CLUB_EVENT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubEventComments', {
            EventId: item?.targetId,
            clubid: item?.clubId,
            CommentID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'CLUB_EVENT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(item?.targetId, item?.mainId),
          );
          SetshowLoading(false);
          navigation.navigate('ClubEventComments', {
            EventId: item?.targetId,
            clubid: item?.clubId,
            CommentID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        case 'CLUB_EVENT_ATTEND':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventAttendListIndex(
              item?.targetId,
              item?.mainId,
            ),
          );
          SetshowLoading(false);
          navigation.navigate('EventViewDetail', {
            EventId: item?.targetId,
            clubid: item?.clubId,
            MemberID: item?.mainId,
            ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      alert(error?.toString() ?? 'Try again');
    }
    SetshowLoading(false);
  };

  const getRequests = () => {
    setRequestLoader(true);
    dispatch(
      getReceivedRequest(user?.id, () => {
        setRequestLoader(false);
      }),
    );
  };

  const SelectNotification = Id => {
    setNotificationIdList(prevList => {
      if (prevList.includes(Id)) {
        return prevList.filter(item => item !== Id);
      } else {
        return [...prevList, Id];
      }
    });
  };

  const SelectAllNotification = () => {
    if (notificationList?.length > 0) {
      const allIds = notificationList.map(item => item.id);
      setNotificationIdList(allIds);
    }
  };

  const DeselectAllNotification = () => {
    setNotificationIdList([]); // sab hata do
  };

  const groupNotificationsByRelativeDate = notifications => {
    const groups = {};

    notifications.forEach(item => {
      let dateLabel = 'Unknown';

      if (item?.createdAt) {
        const created = moment(item.createdAt);
        const today = moment(new Date()).startOf('day');
        const yesterday = moment(new Date()).subtract(1, 'day').startOf('day');
        if (created.isSame(today, 'd')) {
          dateLabel = 'Today';
        } else if (created.isSame(yesterday, 'd')) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = created.clone().startOf('day').format('DD MMM YYYY');
        }
      }

      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });

    // Sort by date descending
    const sortedLabels = Object.keys(groups).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return (
        moment(b, 'DD MMM YYYY').valueOf() - moment(a, 'DD MMM YYYY').valueOf()
      );
    });

    return sortedLabels.map(label => ({
      title: label,
      data: groups[label],
    }));
  };

  const handleDelete = async item => {
    try {
      SetshowLoading(true);
      const data = await Profile.deleteNotification(item?.id);
      dispatch(deleteNotificationAction(item?.id));
    } catch (error) {
      alert(`${error?.toString()}`);
    }
    SetshowLoading(false);
  };

  const renderRightActions = (item, i) => (
    <Pressable
      onPress={() => handleDelete(item, i)}
      style={{
        backgroundColor: '#F33055',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginVertical: 4,
        borderRadius: 8,
      }}
    >
      <Feather name="trash" color={'#FFFFFF'} size={25} />
    </Pressable>
  );

  const handlemodifynotification = async targetType => {
    try {
      const data = {
        ids: notifiactionIdList,
        targetType: targetType,
      };
      SetshowLoading(true);
      const response = await Profile.modifyNodifications(data);
      if (response?.trim()?.toLowerCase() === 'success') {
        if (
          targetType == 'delete' &&
          notifiactionIdList?.length >= notificationList?.length
        ) {
          dispatch(notificationModificationThunk(data));
          GetNotifications();
        } else {
          dispatch(notificationModificationThunk(data));
        }
        setNotificationIdList([]);
        setIsEditMode(false);
        SetshowLoading(false);
      } else {
        SetshowLoading(false);
      }
    } catch (error) {
      alert(`${error?.toString()}`);
      SetshowLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NotificationHeader
        onPressLeft={() => {
          isEditMode
            ? notifiactionIdList?.length === notificationList?.length
              ? DeselectAllNotification()
              : SelectAllNotification()
            : BackButtonClick();
        }}
        onPressRight={() => {
          setIsEditMode(!isEditMode);
          setNotificationIdList([]);
        }}
        title={
          isEditMode ? `${notifiactionIdList?.length} Selected` : 'Notification'
        }
        isEditMode={isEditMode}
        isSelected={notifiactionIdList?.length === notificationList?.length}
        isDisabled={!currentNetworkStatus}
      />
      <Loader
        visible={
          (notificationList?.length == 0 && showLoading) ||
          requestLoader ||
          (receivedRequests.length == 0 && requestLoader) ||
          (notificationList?.length == 0 && refreshing)
        }
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
      {notificationList?.length == 0 &&
      !showLoading &&
      !requestLoader &&
      !refreshing ? (
        !currentNetworkStatus ? (
          <View style={styles.content}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={notificationList?.length > 0}
              title={'No User Available'}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <FastImage
              source={require('../assets/images/icon/empty.png')} // Put your icon here
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.title}>No Notifications</Text>
            <Text style={styles.subText}>
              You’re all caught up! We’ll let you know when there’s something
              new
            </Text>
          </View>
        )
      ) : (
        <SectionList
          sections={groupNotificationsByRelativeDate(notificationList)}
          keyExtractor={(item, index) => item.id?.toString() + index}
          refreshing={refreshing || requestLoader}
          onRefresh={() => {
            getRequests();
            GetNotifications(true);
            dispatch(getNotificationCount());
          }}
          contentContainerStyle={{ paddingBottom: getBottomSpace() }}
          style={styles.viewContainer}
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
          ListHeaderComponent={() => {
            if (receivedRequests?.length > 0) {
              receivedRequests?.map((item, i) => {
                return (
                  <View key={i} style={styles.SendRequestSection}>
                    <View style={styles.row}>
                      <View style={styles.profileimgcontainer}>
                        <FastImage
                          source={{
                            uri: item?.thumbnailProfileImage,
                            cache: FastImage.cacheControl.immutable,
                          }}
                          style={styles.profileimg}
                        />
                      </View>
                      <View style={styles.profiletextcontainer}>
                        <Text style={styles.sendRequest}>
                          {item?.firstName +
                            ' ' +
                            item?.lastName +
                            ' Sended friend request'}
                        </Text>
                        <Text style={styles.sendRequestDate}>{item?.time}</Text>
                      </View>
                    </View>
                    <View style={[styles.row, { justifyContent: 'flex-end' }]}>
                      <Pressable
                        onPress={async () => {
                          try {
                            setAcceptOrRejectLoader(true);
                            const data = await Profile.acceptFriendRequest(
                              item?.id,
                              user?.id,
                            );
                            alert(
                              'You are now friends with ' + item?.firstName,
                            );
                          } catch (error) {
                            alert(error.toString());
                          }
                          setAcceptOrRejectLoader(false);
                          getRequests();
                        }}
                        style={[styles.ButtonContainer, { marginRight: 10 }]}
                      >
                        <Text style={styles.Buttontext}>Accept</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Alert.alert(
                            'Friends',
                            `Are you sure you want to decline ${item?.firstName}’s friend request?`,
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
                                    setAcceptOrRejectLoader(true);
                                    const data = await Profile.deleteFriend(
                                      item?.id,
                                      user?.id,
                                    );
                                  } catch (error) {
                                    alert(error.toString());
                                  }
                                  setAcceptOrRejectLoader(false);
                                  getRequests();
                                },
                                style: 'destructive',
                              },
                            ],
                          );
                        }}
                        style={styles.ButtonContainer}
                      >
                        <Text style={styles.Buttontext}>Reject</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              });
            } else {
              return null;
            }
          }}
          onEndReached={() => {
            if (!isFetching && !isDataLoaded) {
              pageNo += 1;
              GetNotifications(false, true);
            }
          }}
          onEndReachedThreshold={0.5}
          renderSectionHeader={({ section: { title } }) =>
            title ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            ) : null
          }
          renderItem={({ item, index: i }) => (
            <Swipeable renderRightActions={() => renderRightActions(item, i)}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingHorizontal: isEditMode ? 0 : 8,
                }}
              >
                {isEditMode && (
                  <NotificationRadiobtn
                    isSelected={notifiactionIdList.includes(item?.id)}
                    onPress={() => SelectNotification(item?.id)}
                  />
                )}
                <Pressable
                  onPress={() => {
                    isEditMode
                      ? SelectNotification(item?.id)
                      : handleNotification(item);
                  }}
                  key={i}
                  style={
                    item?.isRead
                      ? styles.SendRequestSection
                      : styles.SendRequestSectionunread
                  }
                  disabled={!currentNetworkStatus}
                >
                  <View style={styles.row}>
                    <Pressable
                      onPress={() => {
                        navigation.navigate('Profile', {
                          userId: item?.senderUser?.id,
                        });
                      }}
                      style={styles.profileimgcontainer}
                    >
                      <FastImage
                        source={{
                          uri: item?.senderUser?.thumbnailProfileImage,
                          cache: FastImage.cacheControl.immutable,
                        }}
                        style={styles.profileimg}
                      />
                    </Pressable>
                    <View style={styles.profiletextcontainer}>
                      <Text style={styles.sendRequest}>{item?.title}</Text>
                      <Text style={styles.sendRequestDate}>
                        {item?.message}
                      </Text>
                      <Text style={styles.sendRequestDate}>
                        {item?.createdAt
                          ? moment(item.createdAt).fromNow()
                          : ''}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                      }}
                    >
                      {!item?.isRead && (
                        <View style={styles.countContainer}>
                          <Text style={styles.countText}>1</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              </View>
            </Swipeable>
          )}
        />
      )}
      {isEditMode && (
        <View style={styles.bottomButtonContainer}>
          <Pressable
            onPress={() => {
              handlemodifynotification(StorageKeys.read);
            }}
          >
            <Text style={styles.textbtn}>Mark As Read</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handlemodifynotification(StorageKeys.unread);
            }}
          >
            <Text style={styles.textbtn}> Mark As Unread</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              handlemodifynotification(StorageKeys.delete);
            }}
          >
            <Text style={[styles.textbtn, { color: Color.red }]}>Delete</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  viewContainer: {
    paddingHorizontal: dynamicSize(10),
  },
  sendRequest: {
    fontSize: getFontSize(16),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
  },
  sendRequestDate: {
    fontSize: getFontSize(14),
    marginTop: 5,
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
  },
  profiletextcontainer: {
    width: '85%',
    paddingLeft: dynamicSize(8),
    marginTop: dynamicSize(3),
  },
  profileimgcontainer: {
    width: dynamicSize(50),
    height: dynamicSize(50),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginTop: dynamicSize(5),
  },
  profileimg: {
    width: dynamicSize(50),
    height: '100%',
    borderRadius: 100,
    backgroundColor: 'grey',
  },
  row: {
    flexDirection: 'row',
  },
  SendRequestSection: {
    paddingVertical: dynamicSize(10),
    borderBottomWidth: 1,
    borderBottomColor: '#DCDEF9',
    paddingVertical: dynamicSize(16),
    paddingHorizontal: dynamicSize(14),
    flex: 1,
  },
  SendRequestSectionunread: {
    paddingVertical: dynamicSize(10),
    borderWidth: 1,
    backgroundColor: Color.notificationbg,
    borderColor: '#DCDEF9',
    paddingVertical: dynamicSize(16),
    paddingHorizontal: dynamicSize(14),
    marginVertical: dynamicSize(6),
    borderRadius: 16,
    flex: 1,
  },
  ButtonContainer: {
    alignSelf: 'flex-end',
    height: dynamicSize(35),
    paddingHorizontal: dynamicSize(20),
    borderRadius: 12,
    backgroundColor: Color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Buttontext: {
    color: Color.white,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaAB,
    lineHeight: getFontSize(18),
  },
  countContainer: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: Color.lightblue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: getFontSize(8),
    color: Color.white,
  },
  sectionHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: dynamicSize(8),
    backgroundColor: Color.white,
  },
  sectionHeaderText: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    // color: Color.primary,
    textAlign: 'center',
  },
  bottomButtonContainer: {
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 0,
    backgroundColor: Color.white,
    paddingHorizontal: 16,
  },
  textbtn: {
    fontFamily: fontFamily.ProximaAB,
    fontSize: dynamicSize(14),
    color: Color.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 20,
    tintColor: '#DCDEF9',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c3448',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
});

//make this component available to the app
export default Notification;

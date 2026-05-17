import messaging from '@react-native-firebase/messaging';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setNotificationData } from '../constants/Utility';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  Color,
  NotInvitedMessage,
  NotPaidMessage,
  StorageKeys,
} from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize } from '../constants/Responsive';
import NotifeeUtility from './NotifeeUtility';
import notifee, { EventType } from '@notifee/react-native';
import { getUserData, setTokenAndApi, updateFCM } from '../store/authSlice';
import { fetchTripUnreadCount, getChatsNew } from '../store/tripSlice';
import FastImage from 'react-native-fast-image';
import {
  getConversions,
  getNotificationCount,
  getMessageNotificationCount,
  readNotification,
} from '../store/profileSlice';
import Trip from '../api/Trip';
import { getChatMessages } from '../store/chatSlice';
import ListIndex from '../api/ListIndex';

const NotificationsService = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showLoading, SetshowLoading] = useState(false);
  const user = useSelector(state => state.auth.user);
  const isInvited = useSelector(state => state.auth.isInvited);
  const notificationService = NotifeeUtility();

  const getLoginRef = useRef();
  const notificationServiceRef = useRef(notificationService);
  const initialNotifHandledRef = useRef(false);

  const ReadNotification = async id => {
    dispatch(readNotification(id));
  };

  const getLogin = async item => {
    const token = await AsyncStorage.getItem(StorageKeys.Token);
    if (token === null) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        }),
      );
    } else {
      dispatch(setTokenAndApi(token));
      const userId = await AsyncStorage.getItem(StorageKeys.userId);
      dispatch(updateFCM(userId));
      const userData = await dispatch(getUserData(userId));
      handleNavigation(item, userData);
    }
  };

  const handleNavigation = async (item, resolvedUser) => {
    const effectiveUser = resolvedUser ?? user;
    const effectiveIsFullAccess = effectiveUser?.isFullAccess;
    if (!item) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SideDrower' }],
        }),
      );
      return;
    }
    try {
      if (!effectiveIsFullAccess) {
        alert(isInvited ? NotPaidMessage : NotInvitedMessage);
        return;
      }
      if (item?.isDelete) {
        alert('Member requested to delete');
        return;
      }
      let tripData = {};
      let listIndex = 0;
      ReadNotification(item?.notificationId);
      switch (item?.targetType) {
        case 'TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripDetail',
                  params: {
                    ...tripData,
                    showAll: effectiveUser?.id == tripData?.organizer?.id,
                  },
                },
              ],
            }),
          );
          break;

        case 'CREW_TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripDetail',
                  params: {
                    ...tripData,
                    showAll: effectiveUser?.id == tripData?.organizer?.id,
                    isCrew: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'FRIEND_REQUEST':
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                { name: 'Profile', params: { userId: Number(item?.targetId) } },
              ],
            }),
          );
          break;

        case 'NEW_FRIEND':
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                { name: 'Profile', params: { userId: Number(item?.targetId) } },
              ],
            }),
          );
          break;

        case 'TRIP_COMMENT':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripComments',
                  params: {
                    ...tripData,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_COMMENT_LIKE':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripComments',
                  params: {
                    ...tripData,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_CARD':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getMyTripListIndex(Number(item?.targetId)),
          );

          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Mytrip',
                  params: {
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getInviteTripListIndex(
              Number(item?.mainId),
              effectiveUser?.id,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Mytrip',
                  params: {
                    isInvite: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'FORUM':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'FORUM_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'FORUM_UPDATE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'FORUM_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: true,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'PostDetailScreen',
                  params: {
                    postId: Number(item?.targetId),
                    ListIndex: listIndex,
                    CommentID: Number(item?.mainId),
                    clubId: '-999',
                  },
                },
              ],
            }),
          );
          break;

        case 'FORUM_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: true,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'PostDetailScreen',
                  params: {
                    postId: Number(item?.targetId),
                    ListIndex: listIndex,
                    CommentID: Number(item?.mainId),
                    clubId: '-999',
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_CARD_COMMUNITY':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
              'trip',
            ),
          );

          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_REPORT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
              'tripreport',
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_REPORT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripReportComments',
                  params: {
                    reportId: Number(item?.targetId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_REPORT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripReportComments',
                  params: {
                    reportId: Number(item?.targetId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_REPORT_LIKED':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
              'tripreport',
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TargetID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CHAT':
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'GSCMembers',
                  params: { isMessage: true },
                },
                {
                  name: 'PersonalChat',
                  params: {
                    oppUserId: Number(item?.targetId),
                    fromNotification: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_CHAT':
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );

          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripDetail',
                  params: {
                    ...tripData,
                    showAll: true,
                    isChat: true,
                    fromNotification: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'TRIP_EXPENSE':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripExpense(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'Community',
                  params: {
                    isForum: false,
                    ListIndex: 'ForHome',
                  },
                },
                {
                  name: 'TripDetail',
                  params: {
                    ...tripData,
                    showAll: effectiveUser?.id == tripData?.organizer?.id,
                    isExpense: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ExpenseID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubListIndex(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: false,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ClubID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_UPDATE':
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 7,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_MEMBER_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubListIndex(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: false,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ClubID: Number(item?.targetId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_MEMBER':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubMemberListIndex(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 2,
                    ListIndex: listIndex > 0 ? listIndex : 0,
                    MemberID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_FORUM':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.mainId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 1,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ForumID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_FORUM_UPDATE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.mainId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 1,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ForumID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_FORUM_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostListIndex(
              Number(item?.mainId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 1,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ForumID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_FORUM_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 1,
                  },
                },
                {
                  name: 'PostDetailScreen',
                  params: {
                    postId: Number(item?.targetId),
                    ListIndex: listIndex,
                    CommentID: Number(item?.mainId),
                    clubId: item?.clubId,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_FORUM_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getPostCommentListIndexNew(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 1,
                  },
                },
                {
                  name: 'PostDetailScreen',
                  params: {
                    postId: Number(item?.targetId),
                    ListIndex: listIndex,
                    CommentID: Number(item?.mainId),
                    clubId: item?.clubId,
                  },
                },
              ],
            }),
          );

          break;

        case 'CLUB_TRIP':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(
              Number(item?.mainId),
              Number(item?.targetId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TripID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_CARD':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(
              Number(item?.mainId),
              Number(item?.targetId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TripID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_INVITE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripListIndex(
              Number(item?.targetId),
              item?.clubId,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TripID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_EXPENSE':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripExpense(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                  },
                },
                {
                  name: 'ClubTripdetail',
                  params: {
                    ...tripData,
                    showAll: effectiveUser?.id == tripData?.organizer?.id,
                    isExpense: true,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    ExpenseID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_REPORT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripReportListIndex(
              Number(item?.mainId),
              Number(item?.targetId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 5,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TripReportID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_REPORT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 5,
                  },
                },
                {
                  name: 'ClubTripReportComments',
                  params: {
                    reportId: Number(item?.targetId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_REPORT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getTripReportComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 5,
                  },
                },
                {
                  name: 'ClubTripReportComments',
                  params: {
                    reportId: Number(item?.targetId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_REPORT_LIKED':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getClubtripReportListIndex(
              Number(item?.mainId),
              Number(item?.targetId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 5,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    TripReportID: Number(item?.mainId),
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_CREW_TRIP':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                  },
                },
                {
                  name: 'ClubTripdetail',
                  params: {
                    ...tripData,
                    showAll: effectiveUser?.id == tripData?.organizer?.id,
                    isCrew: true,
                  },
                },
              ],
            }),
          );

          break;

        case 'CLUB_TRIP_CHAT':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                  },
                },
                {
                  name: 'ClubTripdetail',
                  params: {
                    ...tripData,
                    showAll: true,
                    isChat: true,
                    fromNotification: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_COMMENT':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                  },
                },
                {
                  name: 'TripComments',
                  params: {
                    ...tripData,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                    isClub: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_TRIP_COMMENT_LIKE':
          SetshowLoading(true);
          tripData = JSON.parse(
            await Trip.getCurrentTrip(Number(item?.targetId)),
          );
          listIndex = JSON.parse(
            await ListIndex.getTripComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 4,
                  },
                },
                {
                  name: 'TripComments',
                  params: {
                    ...tripData,
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                    CommentID: Number(item?.mainId),
                    isClub: true,
                  },
                },
              ],
            }),
          );
          break;

        case 'EVENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventListIndex(
              Number(item?.targetId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'EventHomeMain',
                  params: {
                    index: item?.receiverUserId == item?.senderUserId ? 1 : 0,
                    EventIDH: Number(item?.targetId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'EVENT_LIKE':
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                { name: 'EventHomeMain', params: { index: 1 } },
                {
                  name: 'EventViewDetail',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: '-999',
                    isPublish: 'isPublish',
                  },
                },
              ],
            }),
          );
          break;

        case 'EVENT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          console.log('listIndex===>', listIndex);
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'EventHomeMain',
                  params: {
                    index: item?.receiverUserId == item?.senderUserId ? 1 : 0,
                  },
                },
                {
                  name: 'ClubEventComments',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: '-999',
                    isPublish: 'isPublish',
                    CommentID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'EVENT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'EventHomeMain',
                  params: {
                    index: item?.receiverUserId == item?.senderUserId ? 1 : 0,
                  },
                },
                {
                  name: 'ClubEventComments',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: '-999',
                    isPublish: 'isPublish',
                    CommentID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'EVENT_ATTEND':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventAttendListIndex(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                { name: 'EventHomeMain', params: { isIndex: true } },
                {
                  name: 'EventViewDetail',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: '-999',
                    isPublish: 'isPublish',
                    MemberID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_EVENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventListIndex(
              Number(item?.mainId),
              item?.clubId !== 0 ? item?.clubId : -999,
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 2,
              routes: [
                { name: 'SideDrower' },
                {
                  name: 'ClubHomeMain',
                  params: {
                    isIndex: true,
                  },
                },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 6,
                    EventIDH: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_EVENT_LIKE':
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 6,
                  },
                },
                {
                  name: 'EventViewDetail',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: item?.clubId,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_EVENT_COMMENT':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 6,
                  },
                },
                {
                  name: 'ClubEventComments',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: item?.clubId,
                    CommentID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_EVENT_COMMENT_LIKE':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventComment(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 6,
                  },
                },
                {
                  name: 'ClubEventComments',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: item?.clubId,
                    CommentID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        case 'CLUB_EVENT_ATTEND':
          SetshowLoading(true);
          listIndex = JSON.parse(
            await ListIndex.getEventAttendListIndex(
              Number(item?.targetId),
              Number(item?.mainId),
            ),
          );
          SetshowLoading(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 3,
              routes: [
                { name: 'SideDrower' },
                { name: 'ClubHomeMain', params: { isIndex: true } },
                {
                  name: 'ClubProfile',
                  params: {
                    clubid: item?.clubId,
                    Selection: 6,
                  },
                },
                {
                  name: 'EventViewDetail',
                  params: {
                    EventId: Number(item?.targetId),
                    clubid: item?.clubId,
                    MemberID: Number(item?.mainId),
                    ListIndex: listIndex >= 0 ? listIndex + 1 : listIndex,
                  },
                },
              ],
            }),
          );
          break;

        default:
          break;
      }
    } catch (error) {
      alert(error?.toString() ?? 'Try again');
    }
    SetshowLoading(false);
  };

  getLoginRef.current = getLogin;
  notificationServiceRef.current = notificationService;

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (!initialNotifHandledRef.current) {
      initialNotifHandledRef.current = true;
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            setNotificationData(remoteMessage?.data);
            getLoginRef.current(remoteMessage?.data);
            messaging().onDeletedMessages(() => {});
          } else {
            getLoginRef.current();
          }
        });
    }

    messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        await notificationServiceRef.current.showNotification(
          remoteMessage.messageId,
          remoteMessage.notification.title,
          remoteMessage.notification.body,
          remoteMessage.data,
          {},
        );
        if (
          remoteMessage.data?.targetType == 'TRIP_CHAT' ||
          remoteMessage.data?.targetType == 'CLUB_TRIP_CHAT'
        ) {
          // const unreadCount = await dispatch(
          //   fetchTripUnreadCount(remoteMessage?.data?.targetId),
          // );
          let perPage = 10;
          // if (unreadCount > 8) {
          //   perPage = Number(unreadCount) + 2;
          // }
          await dispatch(
            getChatsNew(
              remoteMessage?.data?.targetId,
              1,
              perPage,
              success => {},
            ),
          );
          dispatch(fetchTripUnreadCount(remoteMessage?.data?.targetId));
        } else if (remoteMessage.data?.targetType == 'CHAT') {
          const userId = await AsyncStorage.getItem(StorageKeys.userId);
          await dispatch(getMessageNotificationCount());
          // await dispatch(
          //   getChatMessages(remoteMessage?.data?.targetId, userId),
          // );
          // await dispatch(getConversions(userId, 1,success => {}));
        }
        await dispatch(getNotificationCount());
        await notificationServiceRef.current.updateNotificationBadge();
      }
    });

    // Foreground Banner Presses
    notifee.onForegroundEvent(({ type, detail }) => {
      if (detail.notification.data.data) {
        switch (type) {
          case EventType.PRESS:
            getLoginRef.current(detail.notification.data.data);
            break;
        }
      } else if (detail.notification.data) {
        switch (type) {
          case EventType.PRESS:
            getLoginRef.current(detail.notification.data);
            break;
        }
      }
    });
  }, []);

  // Background
  useEffect(() => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (remoteMessage) {
        console.log('remoteMessage====>', remoteMessage);
        if (!remoteMessage.notification) {
          await notificationServiceRef.current.showNotification(
            remoteMessage.messageId,
            remoteMessage.notification.title,
            remoteMessage.notification.body,
            remoteMessage.data,
            {},
          );
        }
        await dispatch(getNotificationCount());
        await dispatch(getMessageNotificationCount());
        await notificationServiceRef.current.updateNotificationBadge();
      }
    });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        getLoginRef.current(remoteMessage?.data);
        messaging().onDeletedMessages(() => {});
      }
    });
  }, []);

  const getFCMToken = async () => {
    try {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }
      const token = await messaging().getToken();
      if (token) {
      }
    } catch (error) {}
  };

  async function requestPermission() {
    try {
      await messaging().requestPermission();
      getFCMToken();
    } catch (error) {
      throw error;
    }
  }

  async function checkPermission() {
    const enabled = await messaging().hasPermission();
    if (
      enabled === messaging.AuthorizationStatus.AUTHORIZED ||
      enabled === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      getFCMToken();
    } else {
      requestPermission();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <Loader visible={showLoading} /> */}
      <View style={styles.bgbox}>
        <Animatable.View animation="zoomIn">
          <View style={styles.logocontainer}>
            <FastImage
              source={require('../assets/images/logo.png')}
              style={styles.profileimg}
            />
          </View>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  profileimg: {
    height: dynamicSize(120),
    width: dynamicSize(120),
    borderRadius: 100,
  },
  maintext: {
    // color: Color.white,
    fontSize: 40,
    fontWeight: Platform.OS === 'android' ? 'bold' : 'bold',
    fontStyle: 'italic',
    color: Color.themeblue,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsService;

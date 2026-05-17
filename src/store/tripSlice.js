// src/store/tripSlice.js
import moment from 'moment';
import { createSlice } from '@reduxjs/toolkit';
import Trip from '../api/Trip';
import Auth from '../api/Auth';
import NetInfo from '@react-native-community/netinfo';

// Import DB Helpers
import {
  saveRegions,
  getRegionsFromDB,
  saveSpot,
  getSpotFromDB,
  getFavouriteSpotsFromDB,
  saveTrips,
  getTripsPaginated,
  getCurrentTripFromDB,
  saveCurrentTrip,
  saveExpenses,
  getExpensesFromDB,
  saveComments,
  getCommentsFromDB,
  savePassengers,
  getPassengersFromDB,
  savePendingUsers,
  getPendingUsersFromDB,
  saveInterestedUsers,
  getInterestedUsersFromDB,
  saveForecastData,
  getForecastFromDB,
  saveCommunityList,
  getCommunityListFromDB,
  saveTripReports,
  getTripReportsFromDB,
  saveChatMessages,
  getChatMessagesFromDB,
  addOptimisticLike,
  removeOptimisticLike,
  saveTripReportLikes,
  getTripReportLikesFromDB,
  getTripLikesFromDB,
  saveSpotReasons,
  getSpotReasonsFromDB,
  saveSpotsByReason,
  getSpotsByReasonFromDB,
  saveTripLikes,
  addPendingAction,
  addOptimisticComment,
  saveInvitedTrips,
  getInvitedTripsFromDB,
  updateInviteStatusLocally,
  saveSuggestedTrips,
  getSuggestedTripsFromDB,
  saveJoinRequests,
  addJoinRequestOptimistic,
  saveForecastProcessedData,
  getForecastProcessedDataFromDB,
  saveInvitedTripId,
  getInvitedTripIdsFromDB,
  getInvitedIdTripFromDB,
  saveInvitedIdTrip,
  getCommunityListDemoFromDB,
  getLastCommunityTripSyncTime,
  setLastCommunityTripSyncTime,
  addOptimisticReportComment,
  getTripReportCommentsFromDB,
  saveTripReportComments,
  clearInvitedTripIds,
  debugCommunityTable,
  upsertTripUnread,
  resetTripUnread,
  getTripUnread,
  markTripMessagesRead,
} from '../database/tripDbHelper';
import { getDatabase } from '../database/schema';

const initialState = {
  tripLikes: {}, // { [tripId]: [likes] }
  reportLikes: {},
  regions: [],
  spot: {},
  trips: [],
  currentTrip: {},
  expenses: [],
  comments: [],
  pendingUsers: [],
  interstedUsers: [],
  passengers: [],
  currentRegion: {},
  forecastData: {},
  invitedTrips: [],
  inviteeTripIds: [],
  chat: [],
  chats: [],
  currentPage: 1,
  reports: [],
  tideExtremes: [],
  tideExtremesByday: [],
  forecastByDay: {},
  averageForcast: {},
  currentRegionForForecast: {},
  currentSpotIdForForecast: '',
  astornomyByDay: {},
  suggestedTrips: [],
  suggestedTripsbyPostCode: [],
  nearBySpots: {},
  reportComments: [],
  nearBySpotsForHome: {},
  tideExtremes_trip: [],
  tideExtremesByday_trip: [],
  forecastByDay_trip: {},
  spotConfigration: {},
  averageForcast_trip: {},
  forecastData_trip: {},
  astornomyByDay_trip: {},
  communityList: [],
  favouriteSpots: [],
  favouriteSpotsIds: [],
  ReasonInner: [],
  ReasonInnerInner: [],
  ModifiedResons: [],
  SpotByReasonId: [],
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  personalChats: {},
  joinedTripIds: [],
  tripUnreadCounts: {},
};

const mergeMessages = (existing = [], incoming = []) => {
  const map = {};
  existing.forEach(m => (map[m.id] = m));
  incoming.forEach(m => (map[m.id] = m));
  return Object.values(map).sort((a, b) => a.createdAt - b.createdAt);
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setTripLikes(state, action) {
      const { tripId, likes } = action.payload;
      state.tripLikes[tripId] = likes;
    },

    addOptimisticTripLike(state, action) {
      const { tripId, like } = action.payload;
      if (!state.tripLikes[tripId]) {
        state.tripLikes[tripId] = [];
      }
      state.tripLikes[tripId].push(like);
    },

    removeOptimisticTripLike(state, action) {
      const { tripId, userId } = action.payload;
      if (state.tripLikes[tripId]) {
        state.tripLikes[tripId] = state.tripLikes[tripId].filter(
          like => like.userLikeId !== userId,
        );
      }
    },

    setTripReportLikes(state, action) {
      const { reportId, likes } = action.payload;
      state.reportLikes[reportId] = likes;
    },

    addOptimisticTripReportLike(state, action) {
      const { reportId, like } = action.payload;
      if (!state.reportLikes[reportId]) {
        state.reportLikes[reportId] = [];
      }
      state.reportLikes[reportId].push(like);
    },

    removeOptimisticTripReportLike(state, action) {
      const { reportId, userId } = action.payload;
      if (state.reportLikes[reportId]) {
        state.reportLikes[reportId] = state.reportLikes[reportId].filter(
          like => like.userLikeId !== userId,
        );
      }
    },

    AddOptimisticComment(state, action) {
      state.comments = [...state.comments, action.payload];
    },

    removeOptimisticComment(state, action) {
      state.comments = state.comments.filter(
        comment => comment.id !== action.payload,
      );
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setSyncStatus(state, action) {
      state.isSyncing = action.payload;
    },
    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },
    setRegions(state, action) {
      state.regions = action.payload;
    },
    setSpot(state, action) {
      const { id, data } = action.payload;
      state.spot = { ...state.spot, [id]: data };
    },
    setCommunityList(state, action) {
      const incomingList = action.payload || [];

      const existingMap = new Map();

      const getKey = item => {
        if (item?.tripId > 0) {
          return `trip_${item.tripId}`;
        }
        if (item?.tripReportId > 0) {
          return `report_${item.tripReportId}`;
        }
        return null;
      };

      // 1️⃣ Add incoming
      incomingList.forEach(item => {
        const key = getKey(item);
        if (!key) return;
        existingMap.set(key, item);
      });

      // 2️⃣ Merge old if not replaced
      state.communityList.forEach(oldItem => {
        const key = getKey(oldItem);
        if (!key) return;

        if (!existingMap.has(key)) {
          existingMap.set(key, oldItem);
        }
      });

      // 3️⃣ Sort
      state.communityList = Array.from(existingMap.values()).sort(
        (a, b) =>
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime(),
      );
    },
    updateCommunityList(state, action) {
      const { tripId, user } = action.payload;

      if (state.communityList?.length) {
        state.communityList = state.communityList.map(t => {
          if (t.tripId === tripId) {
            return {
              ...t,
              passengers: [...(t.passengers || []), user],
            };
          }
          return t;
        });
      }
    },
    addMoreCommunity(state, action) {
      state.communityList = [...state.communityList, ...action.payload];
    },
    addMoreCommunityTop(state, action) {
      state.communityList = [...action.payload, ...state.communityList];
    },
    updateTripCommentCount(state, action) {
      const { tripId, count } = action.payload;
      const trip = state.communityList.find(
        t => t.id === tripId || t.tripId === tripId,
      );
      if (trip) {
        trip.tripCommentCount = (trip?.tripCommentCount || 0) + count;
      }
    },
    setTrips(state, action) {
      state.trips = action.payload;
    },
    updateTrip(state, action) {
      const { tripId, user } = action.payload;

      if (state.trips?.length) {
        state.trips = state.trips.map(t => {
          if (t.tripId === tripId) {
            return {
              ...t,
              passengers: [...(t.passengers || []), user],
            };
          }
          return t;
        });
      }
    },
    addMoreTrips(state, action) {
      state.trips = [...state.trips, ...action.payload];
    },
    addMoreTripsTop(state, action) {
      state.trips = [...action.payload, ...state.trips];
    },
    setFavouriteSpots(state, action) {
      state.favouriteSpots = action.payload;
    },
    setFavouriteSpotIds(state, action) {
      state.favouriteSpotsIds = action.payload;
    },
    setCurrentTrip(state, action) {
      state.currentTrip = action.payload;
    },
    setCurrentRegionForForecast(state, action) {
      state.currentRegionForForecast = action.payload;
    },
    setCurrentSpotIdForForecast(state, action) {
      state.currentSpotIdForForecast = action.payload;
    },
    setExpenses(state, action) {
      state.expenses = action.payload;
    },
    addMoreExpenses(state, action) {
      state.expenses = [...state.expenses, ...action.payload];
    },
    addMoreExpensesTop(state, action) {
      state.expenses = [...action.payload, ...state.expenses];
    },
    setComments(state, action) {
      // state.comments = action.payload;
      const merged = action.payload;

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.comments = uniqueList;
    },
    addMoreCommentsTop(state, action) {
      // state.comments = [...action.payload, ...state.comments];
      const merged = [...action.payload, ...state.comments];

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.comments = uniqueList;
    },
    addMoreComments(state, action) {
      const merged = [...state.comments, ...action.payload];

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.comments = uniqueList;
    },
    setPendingUsers(state, action) {
      state.pendingUsers = action.payload;
    },
    setInterstedUsers(state, action) {
      state.interstedUsers = action.payload;
    },
    setReportComments(state, action) {
      const merged = action.payload;

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.reportComments = uniqueList;
    },
    setSuggestedTrips(state, action) {
      state.suggestedTrips = action.payload;
    },
    updateSuggestedTrips(state, action) {
      const { tripId, user } = action.payload;

      if (state.suggestedTrips?.length) {
        state.suggestedTrips = state.suggestedTrips.map(t => {
          if (t.tripId === tripId) {
            return {
              ...t,
              passengers: [...(t.passengers || []), user],
            };
          }
          return t;
        });
      } else if (state.suggestedTripsbyPostCode?.length) {
        state.suggestedTripsbyPostCode = state.suggestedTripsbyPostCode.map(
          t => {
            if (t.tripId === tripId) {
              return {
                ...t,
                passengers: [...(t.passengers || []), user],
              };
            }
            return t;
          },
        );
      }
    },
    setSuggestedTripsByPostCode(state, action) {
      state.suggestedTripsbyPostCode = action.payload;
    },
    setNearBySpotsForHome(state, action) {
      state.nearBySpotsForHome = action.payload;
    },
    setPassengers(state, action) {
      state.passengers = action.payload;
    },
    setCurrentRegion(state, action) {
      state.currentRegion = action.payload;
    },
    setForecast(state, action) {
      const { id, data } = action.payload;
      state.forecastData = { ...state.forecastData, [id]: data };
    },
    setForecastTrip(state, action) {
      const { id, data } = action.payload;
      state.forecastData_trip = { ...state.forecastData_trip, [id]: data };
    },
    setForecastByDay(state, action) {
      const { id, data } = action.payload;
      state.forecastByDay = { ...state.forecastByDay, [id]: data };
    },
    setForecastByDayTrip(state, action) {
      const { id, data } = action.payload;
      state.forecastByDay_trip = { ...state.forecastByDay_trip, [id]: data };
    },
    setSpotConfiguration(state, action) {
      const { id, data } = action.payload;
      state.spotConfigration = data;
    },
    setAverageForecastByDay(state, action) {
      const { id, data } = action.payload;
      state.averageForcast = { ...state.averageForcast, [id]: data };
    },
    setAverageForecastByDayTrip(state, action) {
      const { id, data } = action.payload;
      state.averageForcast_trip = { ...state.averageForcast_trip, [id]: data };
    },
    setTideExtremes(state, action) {
      const { id, data } = action.payload;
      state.tideExtremes = { ...state.tideExtremes, [id]: data };
    },
    setTideExtremesTrip(state, action) {
      const { id, data } = action.payload;
      state.tideExtremes_trip = { ...state.tideExtremes_trip, [id]: data };
    },
    setTideExtremesByDay(state, action) {
      const { id, data } = action.payload;
      state.tideExtremesByday = { ...state.tideExtremesByday, [id]: data };
    },
    setTideExtremesByDayTrip(state, action) {
      const { id, data } = action.payload;
      state.tideExtremesByday_trip = {
        ...state.tideExtremesByday_trip,
        [id]: data,
      };
    },
    setAstronomyByDay(state, action) {
      const { id, data } = action.payload;
      state.astornomyByDay = { ...state.astornomyByDay, [id]: data };
    },
    setAstronomyByDayTrip(state, action) {
      const { id, data } = action.payload;
      state.astornomyByDay_trip = { ...state.astornomyByDay_trip, [id]: data };
    },
    setInvitedTrips(state, action) {
      state.invitedTrips = action.payload;
    },
    setInviteeTripIds(state, action) {
      state.inviteeTripIds = action.payload;
    },
    removeInviteeTripId(state, action) {
      state.inviteeTripIds = state.inviteeTripIds.filter(
        item => item?.tripId?.toString() !== action.payload?.toString(),
      );
    },
    setChat(state, action) {
      state.chat = action.payload;
    },
    setNearBySpots(state, action) {
      const { id, data } = action.payload;
      state.nearBySpots = { ...state.nearBySpots, [id]: data };
    },
    setTripReports(state, action) {
      state.reports = action.payload;
    },
    addMoreTripReports(state, action) {
      state.reports = [...state.reports, ...action.payload];
    },
    setReasonInner(state, action) {
      const { id, data } = action.payload;
      state.ReasonInner = { ...state.ReasonInner, [id]: data };
    },
    setReasonInnerInner(state, action) {
      const { id, data } = action.payload;
      state.ReasonInnerInner = { ...state.ReasonInnerInner, [id]: data };
    },
    setModifiedReason(state, action) {
      state.ModifiedResons = action.payload;
    },
    setSpotByReasonId(state, action) {
      const { id, data } = action.payload;
      state.SpotByReasonId = { ...state.SpotByReasonId, [id]: data };
    },
    // addChats(state, action) {
    //   const { payload, pageNo } = action.payload;
    //   if (pageNo === 1) {
    //     state.chats = mergeMessages([], payload.reverse());
    //     state.currentPage = 1;
    //   } else {
    //     state.chats = mergeMessages(payload.reverse(), state.chats);
    //     state.currentPage = pageNo;
    //   }
    // },

    addChats(state, action) {
      const { payload, pageNo, isSend = false } = action.payload;
      if (isSend) {
        state.chats = mergeMessages(state.chats, payload);
        state.currentPage = pageNo;
      } else {
        if (pageNo === 1) {
          state.chats = mergeMessages([], payload);
          state.currentPage = 1;
        } else {
          state.chats = mergeMessages(payload, state.chats);
          state.currentPage = pageNo;
        }
      }
    },
    setPersonalChat(state, action) {
      const { chatId, messages } = action.payload;
      state.personalChats = {
        ...state.personalChats,
        [chatId]: messages,
      };
    },

    addOptimisticMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.personalChats[chatId]) {
        state.personalChats[chatId] = [];
      }
      state.personalChats[chatId].push(message);
    },

    removeOptimisticMessage(state, action) {
      const { chatId, messageId } = action.payload;
      if (state.personalChats[chatId]) {
        state.personalChats[chatId] = state.personalChats[chatId].filter(
          msg => msg.id !== messageId,
        );
      }
    },

    addMoreReportCommentsTop(state, action) {
      const merged = [...action.payload, ...state.reportComments];

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.reportComments = uniqueList;
    },

    addMoreReportComments(state, action) {
      const merged = [...state.reportComments, ...action.payload];

      const uniqueMap = new Map();
      merged.forEach(item => {
        uniqueMap.set(item.id, item);
      });

      const uniqueList = Array.from(uniqueMap.values());

      uniqueList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      state.reportComments = uniqueList;
    },

    AddOptimisticReportComment(state, action) {
      state.reportComments = [...state.reportComments, action.payload];
    },

    removeOptimisticReportComment(state, action) {
      state.reportComments = state.reportComments.filter(
        comment => comment.id !== action.payload,
      );
    },

    setJoinedTripIds(state, action) {
      state.joinedTripIds = action.payload;
    },

    clearTripState(state) {
      return initialState;
    },

    setTripUnread: (state, action) => {
      const { tripId, count } = action.payload;
      state.tripUnreadCounts[tripId] = count;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncStatus,
  setLastSyncTime,
  setRegions,
  setSpot,
  setCommunityList,
  addMoreCommunity,
  addMoreCommunityTop,
  updateTripCommentCount,
  setTrips,
  addMoreTrips,
  addMoreTripsTop,
  setFavouriteSpots,
  setFavouriteSpotIds,
  setCurrentTrip,
  setCurrentRegionForForecast,
  setCurrentSpotIdForForecast,
  setExpenses,
  addMoreExpenses,
  addMoreExpensesTop,
  setComments,
  addMoreCommentsTop,
  addMoreComments,
  setPendingUsers,
  setInterstedUsers,
  setReportComments,
  setSuggestedTrips,
  setSuggestedTripsByPostCode,
  setNearBySpotsForHome,
  setPassengers,
  setCurrentRegion,
  setForecast,
  setForecastTrip,
  setForecastByDay,
  setForecastByDayTrip,
  setSpotConfiguration,
  setAverageForecastByDay,
  setAverageForecastByDayTrip,
  setTideExtremes,
  setTideExtremesTrip,
  setTideExtremesByDay,
  setTideExtremesByDayTrip,
  setAstronomyByDay,
  setAstronomyByDayTrip,
  setInvitedTrips,
  setInviteeTripIds,
  removeInviteeTripId,
  setChat,
  setNearBySpots,
  setTripReports,
  addMoreTripReports,
  setReasonInner,
  setReasonInnerInner,
  setModifiedReason,
  setSpotByReasonId,
  addChats,
  clearTripState,
  setTripLikes,
  addOptimisticTripLike,
  removeOptimisticTripLike,
  setTripReportLikes,
  addOptimisticTripReportLike,
  removeOptimisticTripReportLike,
  AddOptimisticComment,
  removeOptimisticComment,
  setPersonalChat,
  addOptimisticMessage,
  removeOptimisticMessage,
  updateSuggestedTrips,
  updateTrip,
  updateCommunityList,
  addMoreReportCommentsTop,
  addMoreReportComments,
  AddOptimisticReportComment,
  removeOptimisticReportComment,
  setJoinedTripIds,
  resetJoinedTrips,
  setTripUnread,
} = tripSlice.actions;

export default tripSlice.reducer;

export const initializeNetworkListener = () => async dispatch => {
  NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable;
    dispatch(setOnlineStatus(isOnline));
  });
};

export const fetchTripUnreadCount = tripId => async (dispatch, getState) => {
  const userId = getState().auth.user.id;
  try {
    const res = await Trip.getTripChatCount(tripId);
    console.log('res====>', res);
    const count = res || 0;
    await upsertTripUnread(tripId, userId, count);
    dispatch(setTripUnread({ tripId, count }));
    return count;
  } catch (e) {
    console.log('API failed → fallback to DB', e);
    try {
      const localCount = await getTripUnread(tripId, userId);
      dispatch(setTripUnread({ tripId, count: localCount }));
      return localCount;
    } catch (dbError) {
      console.log('DB fallback error', dbError);
      dispatch(setTripUnread({ tripId, count: 0 }));
    }
  }
};

export const markTripChatAsRead = tripId => async (dispatch, getState) => {
  const userId = getState().auth.user.id;

  const state = getState();
  const unreadCount = state.trip.tripUnreadCounts[tripId] || 0;
  if (unreadCount === 0) return;
  try {
    await Trip.readTripChat(tripId);
    await resetTripUnread(tripId, userId);
    // await markTripMessagesRead(tripId, userId);
    dispatch(setTripUnread({ tripId, count: 0 }));
  } catch (e) {
    console.log('mark read error', e);
  }
};

export const fetchJoinedTrips = userId => async dispatch => {
  try {
    const isOnline = (await NetInfo.fetch()).isConnected;

    if (isOnline) {
      const trips = JSON.parse(await Trip.getJoins(userId));
      await saveJoinRequests(userId, trips);

      const ids = trips
        .filter(item => item.status === 0)
        .map(item => item.trip?.id);
      dispatch(setJoinedTripIds(ids));
    } else {
      const cached = await getJoinRequestsFromDB(userId);
      const ids = cached
        .filter(item => item.status === 0)
        .map(item => Number(item.trip?.id));

      dispatch(setJoinedTripIds(ids));
    }
  } catch (e) {
    const cached = await getJoinRequestsFromDB(userId);
    const ids = cached
      .filter(item => item.status === 0)
      .map(item => Number(item.trip?.id));

    dispatch(setJoinedTripIds(ids));
  }
};

export const getChatMessagesAction =
  (oppUserId, userId, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const chatId = `${userId}-${oppUserId}`;

      if (isOnline) {
        try {
          const resp = await Auth.getChatWithMembers(oppUserId, userId);
          const data = typeof resp === 'string' ? JSON.parse(resp) : resp;

          // Save to DB
          const latestTen = data.slice(0, 10);
          await saveChatMessages(chatId, latestTen);

          dispatch(setPersonalChat({ chatId, messages: data }));
          callback && callback(true, data);
        } catch (apiError) {
          const messages = await getChatMessagesFromDB(chatId, 1, '1000');
          dispatch(setPersonalChat({ chatId, messages }));
          callback && callback(true, messages);
        }
      } else {
        const messages = await getChatMessagesFromDB(chatId, 1, '1000');
        dispatch(setPersonalChat({ chatId, messages }));
        callback && callback(true, messages);
      }
    } catch (error) {
      const chatId = `${userId}-${oppUserId}`;
      const messages = await getChatMessagesFromDB(chatId, 1, '1000');
      dispatch(setPersonalChat({ chatId, messages }));
      callback && callback(messages.length > 0, messages, error);
    }
  };

export const sendMessageAction =
  (oppUserId, messageText, user) => async (dispatch, getState) => {
    const chatId = `${user?.id}-${oppUserId}`;

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      sender: user,
      receiver: { id: oppUserId },
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    try {
      const isOnline = await checkNetworkAndFetch();

      // Optimistic update
      dispatch(addOptimisticMessage({ chatId, message: optimisticMessage }));
      await saveChatMessages(chatId, [optimisticMessage], true); // append mode

      if (isOnline) {
        try {
          const data = { userId: oppUserId, text: messageText };
          const response = await Auth.sendMessage(data);

          // Remove optimistic, add real message
          dispatch(
            removeOptimisticMessage({
              chatId,
              messageId: optimisticMessage.id,
            }),
          );

          // Refresh to get the real message with server ID
          const resp = await Auth.getChatWithMembers(oppUserId, user?.id);
          const messages = typeof resp === 'string' ? JSON.parse(resp) : resp;
          await saveChatMessages(chatId, messages);
          dispatch(setPersonalChat({ chatId, messages }));
        } catch (apiError) {
          await addPendingAction({
            actionType: 'SEND_MESSAGE',
            entityId: chatId,
            payload: { userId: oppUserId, text: messageText, user },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        // Offline - queue for sync
        await addPendingAction({
          actionType: 'SEND_MESSAGE',
          entityId: chatId,
          payload: { userId: oppUserId, text: messageText, user },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      dispatch(
        removeOptimisticMessage({ chatId, messageId: optimisticMessage.id }),
      );
      throw error;
    }
  };

const checkNetworkAndFetch = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

export const getTripLikes = (tripId, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      try {
        const resp = await Trip.getTripLikes(tripId);
        const likes = typeof resp === 'string' ? JSON.parse(resp) : resp;

        await saveTripLikes(tripId, likes);
        dispatch(setTripLikes({ tripId, likes }));
        callback && callback(true, likes);
      } catch (apiError) {
        const likes = await getTripLikesFromDB(tripId);
        dispatch(setTripLikes({ tripId, likes }));
        callback && callback(true, likes);
      }
    } else {
      const likes = await getTripLikesFromDB(tripId);
      dispatch(setTripLikes({ tripId, likes }));
      callback && callback(true, likes);
    }
  } catch (error) {
    const likes = await getTripLikesFromDB(tripId);
    dispatch(setTripLikes({ tripId, likes }));
    callback && callback(likes.length > 0, likes, error);
  }
};

export const likeTripAction =
  (tripId, userId) => async (dispatch, getState) => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const user = getState().auth.user;

      // Optimistic update
      const optimisticLike = {
        id: `temp-${Date.now()}`,
        userLikeId: userId || user?.id,
        createdAt: new Date().toISOString(),
        isPending: true,
      };

      dispatch(addOptimisticTripLike({ tripId, like: optimisticLike }));
      await addOptimisticLike(tripId, userId || user?.id);

      if (isOnline) {
        try {
          await Trip.likeTrip(tripId);
          dispatch(getTripLikes(tripId));
        } catch (apiError) {
          await addPendingAction({
            actionType: 'LIKE_TRIP',
            entityId: tripId,
            payload: { tripId, userId: userId || user?.id },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'LIKE_TRIP',
          entityId: tripId,
          payload: { tripId, userId: userId || user?.id },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {}
  };

export const unlikeTripAction =
  (tripId, userId, likeId) => async (dispatch, getState) => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const user = getState().auth.user;

      // Optimistic update
      dispatch(
        removeOptimisticTripLike({ tripId, userId: userId || user?.id }),
      );
      await removeOptimisticLike(tripId, userId || user?.id);

      if (isOnline) {
        try {
          await Trip.deleteTripLike(tripId);
          dispatch(getTripLikes(tripId));
        } catch (apiError) {
          await addPendingAction({
            actionType: 'UNLIKE_TRIP',
            entityId: tripId,
            payload: { tripId, userId: userId || user?.id, likeId },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'UNLIKE_TRIP',
          entityId: tripId,
          payload: { tripId, userId: userId || user?.id, likeId },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {}
  };

export const getTripReportLikes = (reportId, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      try {
        const resp = await Trip.getTripReportLikes(reportId);
        const likes = typeof resp === 'string' ? JSON.parse(resp) : resp;

        await saveTripReportLikes(reportId, likes);
        dispatch(setTripReportLikes({ reportId, likes }));
        callback && callback(true, likes);
      } catch (apiError) {
        const likes = await getTripReportLikesFromDB(reportId);
        dispatch(setTripReportLikes({ reportId, likes }));
        callback && callback(true, likes);
      }
    } else {
      const likes = await getTripReportLikesFromDB(reportId);
      dispatch(setTripReportLikes({ reportId, likes }));
      callback && callback(true, likes);
    }
  } catch (error) {
    const likes = await getTripReportLikesFromDB(reportId);
    dispatch(setTripReportLikes({ reportId, likes }));
    callback && callback(likes.length > 0, likes, error);
  }
};

export const likeTripReportAction =
  (reportId, userId) => async (dispatch, getState) => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const user = getState().auth.user;

      const optimisticLike = {
        id: `temp-${Date.now()}`,
        userLikeId: userId || user?.id,
        createdAt: new Date().toISOString(),
        isPending: true,
      };

      dispatch(addOptimisticTripReportLike({ reportId, like: optimisticLike }));

      if (isOnline) {
        try {
          await Trip.likeTripReport(reportId);
          dispatch(getTripReportLikes(reportId));
        } catch (apiError) {
          await addPendingAction({
            actionType: 'LIKE_TRIP_REPORT',
            entityId: reportId,
            payload: { reportId, userId: userId || user?.id },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'LIKE_TRIP_REPORT',
          entityId: reportId,
          payload: { reportId, userId: userId || user?.id },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {}
  };

export const unlikeTripReportAction =
  (reportId, userId, likeId) => async (dispatch, getState) => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const user = getState().auth.user;
      dispatch(
        removeOptimisticTripReportLike({
          reportId,
          userId: userId || user?.id,
        }),
      );

      if (isOnline) {
        try {
          await Trip.deleteTripReportLike(reportId);
          dispatch(getTripReportLikes(reportId));
        } catch (apiError) {
          await addPendingAction({
            actionType: 'UNLIKE_TRIP_REPORT',
            entityId: reportId,
            payload: { reportId, userId: userId || user?.id, likeId },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'UNLIKE_TRIP_REPORT',
          entityId: reportId,
          payload: { reportId, userId: userId || user?.id, likeId },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {}
  };

export const commentTripAction =
  (tripId, commentText, user) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        comment: commentText,
        user: user,
        createdAt: new Date().toISOString(),
        isPending: true,
        author: user,
      };
      if (isOnline) {
        try {
          const data = { tripId, comment: commentText };
          const resp = await Trip.commentTrip(data);
          const createdComment =
            typeof resp === 'string' ? JSON.parse(resp) : resp;

          if (createdComment && createdComment.id) {
            dispatch(AddOptimisticComment(createdComment));
            await addOptimisticComment(tripId, createdComment, 'synced');
          }
        } catch (apiError) {
          await addPendingAction({
            actionType: 'COMMENT_TRIP',
            entityId: tripId,
            payload: {
              tripId,
              comment: commentText,
              user,
              tempId: optimisticComment.id,
            },
            timestamp: new Date().toISOString(),
          });
          dispatch(AddOptimisticComment(optimisticComment));
          await addOptimisticComment(tripId, optimisticComment);
          throw apiError;
        }
      } else {
        await addPendingAction({
          actionType: 'COMMENT_TRIP',
          entityId: tripId,
          payload: {
            tripId,
            comment: commentText,
            user,
            tempId: optimisticComment.id,
          },
          timestamp: new Date().toISOString(),
        });
        dispatch(AddOptimisticComment(optimisticComment));
        await addOptimisticComment(tripId, optimisticComment);
      }
    } catch (error) {
      throw error;
    }
  };

export const getTripReportComments =
  (reportId, pageNo, isBottom, isTop, isStart, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      if (isOnline) {
        try {
          const resp = await Trip.getReportComments(reportId, pageNo, '10');
          const comments = typeof resp === 'string' ? JSON.parse(resp) : resp;
          if (pageNo === 1) {
            await saveTripReportComments(reportId, comments);
          }

          if (isTop) {
            dispatch(addMoreReportCommentsTop(comments));
          } else if (isStart) {
            dispatch(setReportComments(comments));
          } else if (isBottom) {
            dispatch(addMoreReportComments(comments));
          } else {
            dispatch(setReportComments(comments));
          }

          callback && callback(true, comments?.length === 10, pageNo > 1);
        } catch (apiError) {
          const comments = await getTripReportCommentsFromDB(
            reportId,
            pageNo,
            '10',
          );

          if (isTop) {
            dispatch(addMoreReportCommentsTop(comments));
          } else if (isStart) {
            dispatch(setReportComments(comments));
          } else if (isBottom) {
            dispatch(addMoreReportComments(comments));
          } else {
            dispatch(setReportComments(comments));
          }

          callback && callback(true, comments?.length === 10);
        }
      } else {
        const comments = await getTripReportCommentsFromDB(
          reportId,
          pageNo,
          '10',
        );

        if (isTop) {
          dispatch(addMoreReportCommentsTop(comments));
        } else if (isStart) {
          dispatch(setReportComments(comments));
        } else if (isBottom) {
          dispatch(addMoreReportComments(comments));
        } else {
          dispatch(setReportComments(comments));
        }

        callback && callback(true, comments?.length === 10);
      }
    } catch (error) {
      callback && callback(false, error);
    }
  };

// Comment on Trip Report with Offline Support (update existing action):
export const commentTripReportAction = (reportData, user) => async dispatch => {
  const { tripReportId, comment } = reportData;
  const optimisticComment = {
    id: `temp-${Date.now()}`,
    comment: comment,
    author: user,
    createdAt: new Date().toISOString(),
    isPending: true,
  };

  try {
    const isOnline = await checkNetworkAndFetch();
    if (isOnline) {
      try {
        const res = await Trip.commentReport(reportData);
        const createdComment = typeof res === 'string' ? JSON.parse(res) : res;
        if (createdComment && createdComment.id) {
          dispatch(AddOptimisticReportComment(createdComment));
          await addOptimisticReportComment(
            tripReportId,
            createdComment,
            'synced',
          );
        }
      } catch (apiError) {
        await addPendingAction({
          actionType: 'COMMENT_TRIP_REPORT',
          entityId: tripReportId,
          payload: {
            tripReportId,
            comment,
            user,
            tempId: optimisticComment.id,
          },
          timestamp: new Date().toISOString(),
        });
        dispatch(AddOptimisticReportComment(optimisticComment));
        await addOptimisticReportComment(tripReportId, optimisticComment);
      }
    } else {
      await addPendingAction({
        actionType: 'COMMENT_TRIP_REPORT',
        entityId: tripReportId,
        payload: { tripReportId, comment, user, tempId: optimisticComment.id },
        timestamp: new Date().toISOString(),
      });
      dispatch(AddOptimisticReportComment(optimisticComment));
      await addOptimisticReportComment(tripReportId, optimisticComment);
    }
  } catch (error) {
    dispatch(removeOptimisticReportComment(optimisticComment.id));
    throw error;
  }
};

export const getCurrentTrip = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const resp = await Trip.getCurrentTrip(id);
      const trip = typeof resp === 'string' ? JSON.parse(resp) : resp;
      await saveCurrentTrip(trip);

      dispatch(setCurrentTrip(trip));
      callback && callback(true);
    } else {
      const trip = await getCurrentTripFromDB(id);
      if (trip) {
        dispatch(setCurrentTrip(trip));
        callback && callback(true);
      } else {
        callback && callback(false, new Error('No cached data available'));
      }
    }
  } catch (error) {
    const trip = await getCurrentTripFromDB(id);
    if (trip) {
      dispatch(setCurrentTrip(trip));
      callback && callback(true);
    } else {
      callback && callback(false, error);
    }
  }
};

export const getRegions = callback => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const params = {};
      const resp = await Trip.getRegions(params);
      const regions = typeof resp === 'string' ? JSON.parse(resp) : resp;
      await saveRegions(regions);
      dispatch(setRegions(regions));
      callback && callback(true);
    } else {
      const regions = await getRegionsFromDB();
      dispatch(setRegions(regions));
      callback && callback(true);
    }
  } catch (error) {
    const regions = await getRegionsFromDB();
    dispatch(setRegions(regions));
    callback && callback(regions.length > 0, error);
  }
};

export const getTripsPage =
  (addExpired, pageNo, isStart, isBottom, isTop, userId, callback) =>
  async (dispatch, getState) => {
    try {
      const state = getState();
      const id = userId ?? state?.auth?.user?.id;
      const isOnline = await checkNetworkAndFetch();
      if (isOnline) {
        const resp = await Trip.getTripsPagination(
          id,
          addExpired ? 'profile' : 'mytrip',
          pageNo,
          '10',
        );
        const trips = typeof resp === 'string' ? JSON.parse(resp) : resp;
        if (pageNo == 1) {
          await saveTrips(trips);
        }
        if (isTop) {
          dispatch(addMoreTripsTop(trips));
          callback && callback(true);
        } else if (isStart) {
          dispatch(setTrips(trips));
          callback &&
            callback(true, trips?.length < 3 && trips?.length > 0, pageNo > 1);
        } else if (isBottom) {
          dispatch(addMoreTrips(trips));
          callback && callback(true, trips?.length !== 10);
        } else {
          dispatch(setTrips(trips));
          callback && callback(true, trips?.length !== 10);
        }
        dispatch(setLastSyncTime(new Date().toISOString()));
      } else {
        const trips = await getTripsPaginated(
          id,
          addExpired ? 'profile' : 'mytrip',
          pageNo,
          '10',
        );
        if (isTop) {
          dispatch(addMoreTripsTop(trips));
        } else if (isStart) {
          dispatch(setTrips(trips));
        } else if (isBottom) {
          dispatch(addMoreTrips(trips));
        } else {
          dispatch(setTrips(trips));
        }
        callback && callback(true, trips?.length !== 10);
      }
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const getCommunityList =
  (pageNo, isTop, First, isBottom, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      if (isOnline) {
        const resp = await Trip.getCommunityList(pageNo, 10);
        const communityList =
          typeof resp === 'string' ? JSON.parse(resp) : resp;
        if (pageNo == 1) {
          await saveCommunityList(communityList);
        }

        if (First) {
          dispatch(setCommunityList(communityList));
        } else if (isTop) {
          dispatch(addMoreCommunityTop(communityList));
        } else if (isBottom) {
          dispatch(addMoreCommunity(communityList));
        } else {
          dispatch(setCommunityList(communityList));
        }
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback && callback(true, communityList?.length !== 10);
      } else {
        // Load from DB
        const communityList = await getCommunityListFromDB(pageNo, 10);

        if (First) {
          dispatch(setCommunityList(communityList));
        } else if (isTop) {
          dispatch(addMoreCommunityTop(communityList));
        } else if (isBottom) {
          dispatch(addMoreCommunity(communityList));
        } else {
          dispatch(setCommunityList(communityList));
        }
        callback && callback(true, communityList?.length !== 10);
      }
    } catch (error) {
      // Fallback to DB
      const communityList = await getCommunityListFromDB(pageNo, 10);
      dispatch(setCommunityList(communityList));
      callback && callback(communityList.length > 0, error);
    }
  };

export const getSpot = (regionId, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    // Try to load from cache first for instant display
    const cachedSpot = await getSpotFromDB(regionId);
    if (cachedSpot) {
      dispatch(setSpot({ id: regionId, data: cachedSpot }));
      dispatch(setCurrentRegionForForecast({ spot: cachedSpot }));
      dispatch(setCurrentRegion({ spot: cachedSpot }));
      dispatch(setCurrentSpotIdForForecast(cachedSpot?.id));

      // Load cached forecast too
      dispatch(getForecase(cachedSpot?.id, null, false, null, true));
    }

    if (isOnline) {
      try {
        const params = { regionId };
        const resp = await Trip.getSpot(params);
        const data = typeof resp === 'string' ? JSON.parse(resp) : resp;

        // Save to DB
        await saveSpot(regionId, data);

        // Update Redux
        dispatch(setSpot({ id: regionId, data }));
        dispatch(setCurrentRegionForForecast({ spot: data }));
        dispatch(setCurrentRegion({ spot: data }));
        dispatch(setCurrentSpotIdForForecast(data?.id));

        // Fetch fresh forecast
        dispatch(getForecase(data?.id, callback));
      } catch (apiError) {
        if (cachedSpot) {
          callback && callback(true);
        } else {
          callback && callback(false, apiError);
        }
      }
    } else {
      if (cachedSpot) {
        callback && callback(true);
      } else {
        callback && callback(false, new Error('No cached data and offline'));
      }
    }
  } catch (error) {
    const cachedSpot = await getSpotFromDB(regionId);
    if (cachedSpot) {
      dispatch(setSpot({ id: regionId, data: cachedSpot }));
      dispatch(setCurrentRegionForForecast({ spot: cachedSpot }));
      dispatch(setCurrentRegion({ spot: cachedSpot }));
      callback && callback(true);
    } else {
      callback && callback(false, error);
    }
  }
};

export const getExpenses =
  (tripId, pageNo, isBottom, isTop, isStart, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      if (isOnline) {
        const resp = await Trip.getExpences(tripId, pageNo, '10');
        const expense = typeof resp === 'string' ? JSON.parse(resp) : resp;

        // Save to DB
        if (pageNo == 1) {
          await saveExpenses(tripId, expense);
        }

        if (isTop) {
          dispatch(addMoreExpensesTop(expense));
          callback && callback(true);
        } else if (isStart) {
          dispatch(setExpenses(expense));
          callback && callback(true, expense?.length !== 10, pageNo > 1);
        } else if (isBottom) {
          dispatch(addMoreExpenses(expense));
          callback && callback(true, expense?.length !== 10);
        } else {
          dispatch(setExpenses(expense));
          callback && callback(true, expense?.length !== 10);
        }
      } else {
        // Load from DB
        const expense = await getExpensesFromDB(tripId, pageNo, '10');

        if (isTop) {
          dispatch(addMoreExpensesTop(expense));
        } else if (isStart) {
          dispatch(setExpenses(expense));
        } else if (isBottom) {
          dispatch(addMoreExpenses(expense));
        } else {
          dispatch(setExpenses(expense));
        }
        callback && callback(true, expense?.length !== 10);
      }
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const getComments =
  (tripId, pageNo, isBottom, isTop, isStart, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      if (isOnline) {
        try {
          const resp = await Trip.getComments(tripId, pageNo, '10');
          const comments = typeof resp === 'string' ? JSON.parse(resp) : resp;
          if (pageNo === 1) {
            await saveComments(tripId, comments);
          }
          if (isTop) {
            dispatch(addMoreCommentsTop(comments));
          } else if (isStart) {
            dispatch(setComments(comments));
          } else if (isBottom) {
            dispatch(addMoreComments(comments));
          } else {
            dispatch(setComments(comments));
          }

          callback && callback(true, comments?.length === 10, pageNo > 1);
        } catch (apiError) {
          const comments = await getCommentsFromDB(tripId, pageNo, '10');

          if (isTop) {
            dispatch(addMoreCommentsTop(comments));
          } else if (isStart) {
            dispatch(setComments(comments));
          } else if (isBottom) {
            dispatch(addMoreComments(comments));
          } else {
            dispatch(setComments(comments));
          }

          callback && callback(true, comments?.length === 10);
        }
      } else {
        const comments = await getCommentsFromDB(tripId, pageNo, '10');

        if (isTop) {
          dispatch(addMoreCommentsTop(comments));
        } else if (isStart) {
          dispatch(setComments(comments));
        } else if (isBottom) {
          dispatch(addMoreComments(comments));
        } else {
          dispatch(setComments(comments));
        }

        callback && callback(true, comments?.length === 10);
      }
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const getPassengers = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const resp = await Trip.getPassengersList(id);
      const passengers = typeof resp === 'string' ? JSON.parse(resp) : resp;
      const latestTen = passengers.slice(0, 10);
      await savePassengers(id, latestTen);

      dispatch(setPassengers(passengers));
      callback && callback(true);
    } else {
      const passengers = await getPassengersFromDB(id);
      dispatch(setPassengers(passengers));
      callback && callback(true);
    }
  } catch (error) {
    const passengers = await getPassengersFromDB(id);
    dispatch(setPassengers(passengers));
    callback && callback(passengers.length > 0, error);
  }
};

export const getPendingList = (tripId, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();
    if (isOnline) {
      const resp = await Trip.getPendingRequest(tripId);
      const pendingUsers = typeof resp === 'string' ? JSON.parse(resp) : resp;
      await savePendingUsers(tripId, pendingUsers);

      dispatch(setPendingUsers(pendingUsers));
      callback && callback(true);
    } else {
      const pendingUsers = await getPendingUsersFromDB(tripId);
      dispatch(setPendingUsers(pendingUsers));
      callback && callback(true);
    }
  } catch (error) {
    const pendingUsers = await getPendingUsersFromDB(tripId);
    dispatch(setPendingUsers(pendingUsers));
    callback && callback(pendingUsers.length > 0, error);
  }
};

export const getInterstedUser = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const resp = await Trip.getInterstedRequests(id);
      const interstedUsers = typeof resp === 'string' ? JSON.parse(resp) : resp;

      await saveInterestedUsers(id, interstedUsers);

      dispatch(setInterstedUsers(interstedUsers));
      callback && callback(true);
    } else {
      const interstedUsers = await getInterestedUsersFromDB(id);
      dispatch(setInterstedUsers(interstedUsers));
      callback && callback(true);
    }
  } catch (error) {
    const interstedUsers = await getInterestedUsersFromDB(id);
    dispatch(setInterstedUsers(interstedUsers));
    callback && callback(interstedUsers.length > 0, error);
  }
};

export const getTripReports = (id, pageNo, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const resp = await Trip.getTripReports(id, pageNo, '10');
      const report = typeof resp === 'string' ? JSON.parse(resp) : resp;

      // Save to DB
      if (pageNo == 1) {
        await saveTripReports(report);
      }

      if (pageNo == 1) {
        dispatch(setTripReports(report));
      } else {
        dispatch(addMoreTripReports(report));
      }
      callback && callback(true, report?.length !== 10);
    } else {
      // Load from DB
      const report = await getTripReportsFromDB(id, pageNo, '10');

      if (pageNo == 1) {
        dispatch(setTripReports(report));
      } else {
        dispatch(addMoreTripReports(report));
      }
      callback && callback(true, report?.length !== 10);
    }
  } catch (error) {
    callback && callback(false, error);
  }
};

// export const getChatsNew = (id, pageNo, callback) => async dispatch => {
//   try {
//     const isOnline = await checkNetworkAndFetch();

//     if (isOnline) {
//       const resp = await Trip.getChatsNew(id, pageNo, '10');
//       const chat = typeof resp === 'string' ? JSON.parse(resp) : resp;

//       // Save to DB
//       if (pageNo) {
//         await saveChatMessages(id, chat);
//       }
//       dispatch(addChats({ payload: chat, pageNo }));
//       callback && callback(true, chat?.length == 10);
//     } else {
//       // Load from DB
//       const chat = await getChatMessagesFromDB(id, pageNo, '10');
//       dispatch(addChats({ payload: chat, pageNo }));
//       callback && callback(true, chat?.length == 10);
//     }
//   } catch (error) {
//     callback && callback(false);
//   }
// };

export const getChatsNew =
  (id, pageNo, perPage = 10, callback) =>
  async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      // Always load from DB first for instant display
      const cachedChats = await getChatMessagesFromDB(id, pageNo, perPage);
      if (cachedChats.length > 0 && pageNo === 1) {
        dispatch(addChats({ payload: cachedChats, pageNo }));
      }

      if (isOnline) {
        try {
          const resp = await Trip.getChatsNew(id, pageNo, perPage);
          const chat = typeof resp === 'string' ? JSON.parse(resp) : resp;

          // Save to DB (replace for page 1, append for others)
          if (pageNo === 1) {
            await saveChatMessages(id, chat, false);
          } else {
            await saveChatMessages(id, chat, true);
          }

          dispatch(addChats({ payload: chat, pageNo }));
          callback &&
            callback(true, chat?.length?.toString() === perPage?.toString());
        } catch (apiError) {
          console.warn('API failed, using cached data:', apiError);
          callback &&
            callback(
              cachedChats.length > 0,
              cachedChats?.length?.toString() === perPage?.toString(),
            );
        }
      } else {
        // Offline mode
        if (!cachedChats.length && pageNo === 1) {
          dispatch(addChats({ payload: [], pageNo }));
        }
        callback &&
          callback(
            cachedChats.length > 0,
            cachedChats?.length?.toString() === perPage?.toString(),
          );
      }
    } catch (error) {
      console.error('getChatsNew error:', error);
      callback && callback(false);
    }
  };

export const getFavouriteSpots = callback => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      const resp = await Trip.getFavouriteSpot();
      const spots = typeof resp === 'string' ? JSON.parse(resp) : resp;
      const ids = spots?.map(item => item?.id);
      for (const spot of spots) {
        await saveSpot(spot.id, { ...spot, isFavourite: true });
      }
      dispatch(setFavouriteSpots(spots));
      dispatch(setFavouriteSpotIds(ids));
      callback && callback(true);
    } else {
      const spots = await getFavouriteSpotsFromDB();
      const ids = spots?.map(item => item?.id);
      dispatch(setFavouriteSpots(spots));
      dispatch(setFavouriteSpotIds(ids));
      callback && callback(true);
    }
  } catch (error) {
    const spots = await getFavouriteSpotsFromDB();
    const ids = spots?.map(item => item?.id);
    dispatch(setFavouriteSpots(spots));
    dispatch(setFavouriteSpotIds(ids));
    callback && callback(spots.length > 0);
  }
};

export const getForecase =
  (id, callback, isTrip = false, tripId = null, useCache = false) =>
  async dispatch => {
    try {
      const key = isTrip ? `${id}_${tripId}` : id;
      const isOnline = await checkNetworkAndFetch();

      // Try to load from cache first
      const cachedProcessed = await getForecastProcessedDataFromDB(id);
      if (cachedProcessed && useCache) {
        if (cachedProcessed.averageList) {
          dispatch(
            setAverageForecastByDay({
              id: key,
              data: cachedProcessed.averageList,
            }),
          );
        }
        if (cachedProcessed.seperateByday) {
          dispatch(
            setForecastByDay({ id: key, data: cachedProcessed.seperateByday }),
          );
        }
        if (cachedProcessed.tideExtremesByday) {
          dispatch(
            setTideExtremesByDay({
              id: key,
              data: cachedProcessed.tideExtremesByday,
            }),
          );
        }
        if (cachedProcessed.astronomyByDay) {
          dispatch(
            setAstronomyByDay({
              id: key,
              data: cachedProcessed.astronomyByDay,
            }),
          );
        }
        if (cachedProcessed.spotConfiguration) {
          dispatch(
            setSpotConfiguration({
              id: key,
              data: cachedProcessed.spotConfiguration,
            }),
          );
        }

        // Get raw forecast data
        const cachedForecast = await getForecastFromDB(
          id,
          isTrip ? 'trip' : 'weather',
        );
        if (cachedForecast?.weather?.hours) {
          dispatch(
            setForecast({ id: key, data: cachedForecast.weather.hours }),
          );
        }
        if (cachedForecast?.tideExtremes?.data) {
          dispatch(
            setTideExtremes({
              id: key,
              data: cachedForecast.tideExtremes.data,
            }),
          );
        }
      }

      if (isOnline) {
        try {
          const resp = await (isTrip
            ? Trip.getForecastForReport(tripId)
            : Trip.getForecastDetails(id));
          const forecast = typeof resp === 'string' ? JSON.parse(resp) : resp;

          // Save raw forecast
          await saveForecastData(id, forecast, isTrip ? 'trip' : 'weather');

          // Process forecast data
          const processedData = processForecastData(forecast);

          // Save processed data
          await saveForecastProcessedData(id, processedData);

          // Dispatch to Redux
          dispatch(
            setAstronomyByDay({ id: key, data: processedData.astronomyByDay }),
          );
          dispatch(
            setAverageForecastByDay({
              id: key,
              data: processedData.averageList,
            }),
          );
          dispatch(
            setForecastByDay({ id: key, data: processedData.seperateByday }),
          );
          dispatch(setForecast({ id: key, data: forecast?.weather?.hours }));
          dispatch(
            setTideExtremes({ id: key, data: forecast?.tideExtremes?.data }),
          );
          dispatch(
            setTideExtremesByDay({
              id: key,
              data: processedData.tideExtremesByday,
            }),
          );
          dispatch(
            setSpotConfiguration({
              id: key,
              data: forecast?.spotConfiguration,
            }),
          );

          callback &&
            callback(
              true,
              processedData.averageList[0],
              processedData.tideExtremesByday,
            );
        } catch (apiError) {
          if (cachedProcessed) {
            callback &&
              callback(
                true,
                cachedProcessed.averageList?.[0],
                cachedProcessed.tideExtremesByday,
              );
          } else {
            callback && callback(false, apiError);
          }
        }
      } else {
        if (cachedProcessed) {
          callback &&
            callback(
              true,
              cachedProcessed.averageList?.[0],
              cachedProcessed.tideExtremesByday,
            );
        } else {
          callback &&
            callback(false, new Error('No cached forecast and offline'));
        }
      }
    } catch (error) {
      const cachedProcessed = await getForecastProcessedDataFromDB(id);
      if (cachedProcessed) {
        callback &&
          callback(
            true,
            cachedProcessed.averageList?.[0],
            cachedProcessed.tideExtremesByday,
          );
      } else {
        callback && callback(false, error);
      }
    }
  };

const processForecastData = forecast => {
  const averageList = [];
  const seperateByday = {};
  let currentDay = null;
  let tempData = [];

  forecast?.weather?.hours.forEach(item => {
    if (currentDay == null) currentDay = moment(item.time).format('l');
    if (moment(item.time).format('l') == currentDay) {
      tempData.push(item);
    } else {
      seperateByday[currentDay] = tempData;
      tempData = [];
      currentDay = moment(item.time).format('l');
      tempData.push(item);
    }
  });
  seperateByday[currentDay] = tempData;

  // Calculate daily averages
  Object.keys(seperateByday).forEach(key1 => {
    const average = {};
    seperateByday[key1].forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'time') {
          if (average[key]) {
            average[key].sg = average[key]?.sg
              ? average[key]?.sg + item[key]?.sg / seperateByday[key1].length
              : item[key]?.sg / seperateByday[key1].length;
          } else {
            average[key] = {
              sg: item[key]?.sg / seperateByday[key1].length,
            };
          }
        }
      });
    });
    average.time = seperateByday[key1][0].time;
    averageList.push(average);
  });

  // Process tide extremes by day
  let newTemp = [];
  const tideExtremesByday = {};
  currentDay = null;
  forecast?.tideExtremes?.data?.forEach(item => {
    if (currentDay == null) currentDay = moment(item.time).format('l');
    if (moment(item.time).format('l') == currentDay) {
      newTemp.push(item);
    } else {
      tideExtremesByday[currentDay] = newTemp;
      newTemp = [];
      currentDay = moment(item.time).format('l');
      newTemp.push(item);
    }
  });
  tideExtremesByday[currentDay] = newTemp;

  // Process astronomy by day
  const astronomyByDay = {};
  forecast?.astronomy?.data?.forEach(item => {
    astronomyByDay[moment(item.time).format('l')] = item;
  });

  return {
    averageList,
    seperateByday,
    tideExtremesByday,
    astronomyByDay,
    spotConfiguration: forecast?.spotConfiguration,
  };
};

export const getReportComments = (id, callback) => async dispatch => {
  try {
    const resp = await Trip.getReportComments(id);
    const comments = typeof resp === 'string' ? JSON.parse(resp) : resp;
    dispatch(setReportComments(comments));
    callback && callback(true);
  } catch (error) {
    callback && callback(false, error);
  }
};

export const getHomeSpot = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    // Load from cache first
    const cachedSpot = await getSpotFromDB(id);
    if (cachedSpot) {
      const cachedProcessed = await getForecastProcessedDataFromDB(
        cachedSpot.id,
      );

      if (cachedProcessed) {
        const spotName = cachedSpot?.title;
        dispatch(
          setNearBySpotsForHome({
            id: cachedSpot?.id,
            data: cachedProcessed.averageList?.[0],
            tide: cachedProcessed.tideExtremesByday,
            spotName,
          }),
        );
      }
    }

    if (isOnline) {
      try {
        const resp = await Trip.getSpotById(id);
        const spot = typeof resp === 'string' ? JSON.parse(resp) : resp;

        await saveSpot(id, spot);

        dispatch(
          getForecase(spot?.id, (status, data, tide) => {
            if (status) {
              const spotName = spot?.title;
              dispatch(
                setNearBySpotsForHome({ id: spot?.id, data, tide, spotName }),
              );
              callback && callback(true, spot);
            } else {
              if (cachedSpot) {
                callback && callback(true, cachedSpot);
              } else {
                callback && callback(false);
              }
            }
          }),
        );
      } catch (apiError) {
        callback && callback(cachedSpot ? true : false, cachedSpot);
      }
    } else {
      callback && callback(cachedSpot ? true : false, cachedSpot);
    }
  } catch (error) {
    callback && callback(false);
  }
};

export const getSuggestedTrips = (lat, long, callback) => async dispatch => {
  try {
    const resp = await Trip.getSuggestedTrips(lat, long);
    const trips = typeof resp === 'string' ? JSON.parse(resp) : resp;
    const newTrip = trips.map(item => item.trip);
    dispatch(setSuggestedTrips(newTrip));
    callback && callback(true);
  } catch (error) {
    callback && callback(false);
  }
};

export const getSuggestedTripsByPostCode =
  (code, callback) => async dispatch => {
    try {
      const resp = await Trip.getSuggestedTripsByPostCode(code);
      const trips = typeof resp === 'string' ? JSON.parse(resp) : resp;
      dispatch(setSuggestedTripsByPostCode(trips));
      callback && callback(true);
    } catch (error) {
      callback && callback(false);
    }
  };

export const getInviteeTrips = (id, callback) => async dispatch => {
  try {
    const resp = await Trip.getInviteedTrips(id);
    const invites = typeof resp === 'string' ? JSON.parse(resp) : resp;
    const newInvites = [];
    for (let i = 0; i < invites.length; i++) {
      const item = invites[i];
      if (item?.status == 0) {
        try {
          const r = await Trip.getCurrentTrip(item?.tripId);
          const trip = typeof r === 'string' ? JSON.parse(r) : r;
          item.trip = trip;
          newInvites.push(item);
        } catch (error) {
          // ignore
        }
      }
    }
    callback && callback();
    dispatch(setInvitedTrips(newInvites));
  } catch (error) {
    callback && callback();
  }
};

export const getInvitedTripsPending = (id, callback) => async dispatch => {
  try {
    const resp = await Trip.getInviteedTripsPending(id);
    const invites = typeof resp === 'string' ? JSON.parse(resp) : resp;
    const newInvites = [];
    for (let i = 0; i < invites.length; i++) {
      const item = invites[i];
      if (item?.status == 0) {
        try {
          const r = await Trip.getCurrentTrip(item?.tripId);
          const trip = typeof r === 'string' ? JSON.parse(r) : r;
          item.trip = trip;
          newInvites.push(item);
        } catch (error) {
          // ignore
        }
      }
    }
    callback && callback();
    dispatch(setInvitedTrips(newInvites));
  } catch (error) {
    callback && callback();
  }
};

export const getChats = (id, callback) => async dispatch => {
  try {
    const resp = await Trip.getChats(id);
    const chat = typeof resp === 'string' ? JSON.parse(resp) : resp;
    dispatch(setChat(chat));
    callback && callback(true);
  } catch (error) {
    callback && callback(false);
  }
};

export const getNearBySpots = (lat, long, id, callback) => async dispatch => {
  try {
    const resp = await Trip.getNearBySpots(lat, long);
    const spots = typeof resp === 'string' ? JSON.parse(resp) : resp;
    dispatch(setNearBySpots({ id, data: spots }));
    callback && callback(true);
  } catch (error) {
    callback && callback(false);
  }
};

export const getNearBySpotsForHome =
  (lat, long, callback) => async dispatch => {
    try {
      const resp = await Trip.getNearBySpots(lat, long);
      const spots = typeof resp === 'string' ? JSON.parse(resp) : resp;
      if (spots[0]?.spot?.id) {
        dispatch(
          getForecase(spots[0]?.spot?.id, (status, data, tide) => {
            if (status) {
              const spotName = spots[0]?.spot?.title;
              dispatch(
                setNearBySpotsForHome({
                  id: spots[0]?.spot?.id,
                  data,
                  tide,
                  spotName,
                }),
              );
              callback && callback(true, spots[0]?.spot);
            } else {
              callback && callback(false);
            }
          }),
        );
      } else {
        callback && callback(false);
      }
    } catch (error) {
      callback && callback(false);
    }
  };

export const getChatMessages =
  (receiver, sender, callback) => async dispatch => {
    try {
      const resp = await Auth.getChatWithMembers(receiver, sender);
      const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
      callback && callback(true, data);
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const setReasonInnerThunk = (data, id) => dispatch => {
  dispatch(setReasonInner({ id, data }));
};

export const setReasonInnerInnerThunk = (data, id) => dispatch => {
  dispatch(setReasonInnerInner({ id, data }));
};

export const setModifiedReasonThunk = data => dispatch => {
  dispatch(setModifiedReason(data));
};

export const setSpotsByReasonID = (data, id) => dispatch => {
  dispatch(setSpotByReasonId({ id, data }));
};

const getFromRedux = (state, id, depth = null) => {
  try {
    let reduxData;

    if (depth === 1) {
      reduxData = state?.trip?.reasonInner?.[id];
    } else if (depth === 2) {
      reduxData = state?.trip?.reasonInnerInner?.[id];
    } else if (id === 0 && depth === 0) {
      reduxData = state?.trip?.modifiedReason;
    } else {
      reduxData = state?.trip?.spotByReason?.[id];
    }
    return reduxData;
  } catch (error) {
    return null;
  }
};

export const getReasonInner = (Id, callback) => async (dispatch, getState) => {
  try {
    const reduxData = getFromRedux(getState(), Id, 1);
    if (reduxData?.data?.length > 0) {
      dispatch(setReasonInner({ id: Id, data: reduxData.data }));
      callback?.(true);
      return;
    }
    const dbData = await getSpotReasonsFromDB(Id, 1);
    if (dbData?.length > 0) {
      dispatch(setReasonInner({ id: Id, data: dbData }));
      callback?.(true);
      return;
    }
    const isOnline = await checkNetworkAndFetch();
    if (isOnline) {
      const resp = await Trip.getRegionsmodifed(Id, 1);
      const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
      if (Array.isArray(data)) {
        await saveSpotReasons(data, Id, 1);
      }
      dispatch(setReasonInner({ id: Id, data }));
      callback?.(true);
    } else {
      dispatch(setReasonInner({ id: Id, data: [] }));
      callback?.(false);
    }
  } catch (error) {
    const fallback = await getSpotReasonsFromDB(Id, 1);
    dispatch(setReasonInner({ id: Id, data: fallback }));
    callback?.(fallback.length > 0, error);
  }
};

export const getReasonInnerInner =
  (Id, callback) => async (dispatch, getState) => {
    try {
      const reduxData = getFromRedux(getState(), Id, 2);
      if (reduxData?.data?.length > 0) {
        dispatch(setReasonInnerInner({ id: Id, data: reduxData.data }));
        callback?.(true);
        return;
      }
      const dbData = await getSpotReasonsFromDB(Id, 2);
      if (dbData?.length > 0) {
        dispatch(setReasonInnerInner({ id: Id, data: dbData }));
        callback?.(true);
        return;
      }
      const isOnline = await checkNetworkAndFetch();
      if (isOnline) {
        const resp = await Trip.getRegionsmodifed(Id, 2);
        const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
        if (Array.isArray(data)) {
          await saveSpotReasons(data, Id, 2);
        }
        dispatch(setReasonInnerInner({ id: Id, data }));
        callback?.(true);
      } else {
        dispatch(setReasonInnerInner({ id: Id, data: [] }));
        callback?.(false);
      }
    } catch (error) {
      const fallback = await getSpotReasonsFromDB(Id, 2);
      dispatch(setReasonInnerInner({ id: Id, data: fallback }));
      callback?.(fallback.length > 0, error);
    }
  };

export const getModifiedReason = callback => async (dispatch, getState) => {
  try {
    // First, always try to load from Redux (instant display)
    const reduxData = getState()?.trip?.ModifiedResons;
    if (reduxData && reduxData.length > 0) {
      dispatch(setModifiedReason(reduxData));
      callback?.(true);
    }

    let dbData = [];
    try {
      dbData = await getSpotReasonsFromDB(0, 0);
      if (dbData && dbData.length > 0) {
        dispatch(setModifiedReason(dbData));
        callback?.(true);
      }
    } catch (dbError) {}
    const isOnline = await checkNetworkAndFetch();
    if (isOnline) {
      try {
        const resp = await Trip.getRegionsmodifed(0, 0);
        const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
        if (Array.isArray(data) && data.length > 0) {
          // Save to DB for next time
          await saveSpotReasons(data, 0, 0);
          // Update Redux
          dispatch(setModifiedReason(data));
          callback?.(true);
        } else {
          callback?.(dbData.length > 0);
        }
      } catch (apiError) {
        callback?.(dbData.length > 0);
      }
    } else {
      // In offline mode, success depends on cached data
      callback?.(dbData.length > 0);
    }
  } catch (error) {
    try {
      const fallbackData = await getSpotReasonsFromDB(0, 0);
      if (fallbackData && fallbackData.length > 0) {
        dispatch(setModifiedReason(fallbackData));
        callback?.(true);
        return;
      }
    } catch (fallbackError) {}

    dispatch(setModifiedReason([]));
    callback?.(false, error);
  }
};

export const getSpotsByReasonID =
  (Id, callback) => async (dispatch, getState) => {
    try {
      // Step 1: Try Redux first (instant display)
      const reduxData = getState()?.trip?.SpotByReasonId?.[Id];
      if (reduxData && Array.isArray(reduxData) && reduxData.length > 0) {
        dispatch(setSpotByReasonId({ id: Id, data: reduxData }));
        callback?.(true);
        // Don't return - still check for fresh data
      }

      // Step 2: Try database (fast fallback)
      let dbData = [];
      try {
        dbData = await getSpotsByReasonFromDB(Id);
        if (dbData && dbData.length > 0) {
          dispatch(setSpotByReasonId({ id: Id, data: dbData }));
          callback?.(true);
        }
      } catch (dbError) {}

      // Step 3: Check network and fetch fresh data
      const isOnline = await checkNetworkAndFetch();
      if (isOnline) {
        try {
          const resp = await Trip.getSpotsByReasonID(Id);
          const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
          if (Array.isArray(data) && data.length > 0) {
            // Save to DB for next time
            await saveSpotsByReason(Id, data);
            dispatch(setSpotByReasonId({ id: Id, data }));
            callback?.(true);
          } else {
            callback?.(dbData.length > 0);
          }
        } catch (apiError) {
          callback?.(dbData.length > 0);
        }
      } else {
        callback?.(dbData.length > 0);
      }
    } catch (error) {
      try {
        const fallbackData = await getSpotsByReasonFromDB(Id);
        if (fallbackData && fallbackData.length > 0) {
          dispatch(setSpotByReasonId({ id: Id, data: fallbackData }));
          callback?.(true);
          return;
        }
      } catch (fallbackError) {}

      dispatch(setSpotByReasonId({ id: Id, data: [] }));
      callback?.(false, error);
    }
  };

export const getForecastForReport = (id, callback) => async dispatch => {
  try {
    const resp = await Trip.getForecastForReport(id);
    const forecast = typeof resp === 'string' ? JSON.parse(resp) : resp;
    const averageList = [];
    const seperateByday = {};
    let currentDay = null;
    let tempData = [];

    forecast?.weather?.hours.forEach(item => {
      if (currentDay == null) currentDay = moment(item.time).format('l');
      if (moment(item.time).format('l') == currentDay) {
        tempData.push(item);
      } else {
        seperateByday[currentDay] = tempData;
        tempData = [];
        currentDay = moment(item.time).format('l');
        tempData.push(item);
      }
    });
    seperateByday[currentDay] = tempData;

    Object.keys(seperateByday).forEach(key1 => {
      const average = {};
      seperateByday[key1].forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'time') {
            if (average[key]) {
              average[key].sg = average[key]?.sg
                ? average[key]?.sg + item[key]?.sg / seperateByday[key1].length
                : item[key]?.sg / seperateByday[key1].length;
            } else {
              average[key] = { sg: item[key]?.sg / seperateByday[key1].length };
            }
          }
        });
      });
      average.time = seperateByday[key1][0].time;
      averageList.push(average);
    });

    let newTemp = [];
    const seperateByday2 = {};
    currentDay = null;
    forecast?.tideExtremes?.data?.forEach(item => {
      if (currentDay == null) currentDay = moment(item.time).format('l');
      if (moment(item.time).format('l') == currentDay) {
        newTemp.push(item);
      } else {
        seperateByday2[currentDay] = newTemp;
        newTemp = [];
        currentDay = moment(item.time).format('l');
        newTemp.push(item);
      }
    });
    seperateByday2[currentDay] = newTemp;

    const astrologyByDay = {};
    forecast?.astronomy?.data?.forEach(item => {
      astrologyByDay[moment(item.time).format('l')] = item;
    });

    dispatch(setAstronomyByDayTrip({ id, data: astrologyByDay }));
    dispatch(setAverageForecastByDayTrip({ id, data: averageList }));
    dispatch(setForecastByDayTrip({ id, data: seperateByday }));
    dispatch(setForecastTrip({ id, data: forecast?.weather?.hours }));
    dispatch(setTideExtremesTrip({ id, data: forecast?.tideExtremes?.data }));
    dispatch(setTideExtremesByDayTrip({ id, data: seperateByday2 }));

    callback && callback(true, averageList[0], seperateByday2);
  } catch (error) {
    callback && callback(false, error);
  }
};

export const getInvitedTripsAction = (userId, callback) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    const cachedInvites = await getInvitedTripsFromDB(userId);
    if (cachedInvites.length > 0) {
      // dispatch(setInvitedTrips(cachedInvites));
    }

    if (isOnline) {
      try {
        const resp = await Trip.getInviteedTripsPending(userId);
        const invites = typeof resp === 'string' ? JSON.parse(resp) : resp;
        const invitesWithTrips = [];
        for (let i = 0; i < invites.length; i++) {
          const invite = invites[i];
          if (invite.status === 0) {
            try {
              const tripResp = await Trip.getCurrentTrip(invite.tripId);
              const trip =
                typeof tripResp === 'string' ? JSON.parse(tripResp) : tripResp;
              if (trip) {
                invitesWithTrips.push({ ...invite, trip });
              }
            } catch (error) {}
          }
        }

        await saveInvitedTrips(userId, invitesWithTrips);
        dispatch(setInvitedTrips(invitesWithTrips));
        callback && callback(true);
      } catch (apiError) {
        callback && callback(cachedInvites.length > 0);
      }
    } else {
      callback && callback(cachedInvites.length > 0);
    }
  } catch (error) {
    const cachedInvites = await getInvitedTripsFromDB(userId);
    dispatch(setInvitedTrips(cachedInvites));
    callback && callback(cachedInvites.length > 0, error);
  }
};

export const getInviteeTripsIdsAction =
  (userId, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const cachedInvites = await getInvitedIdTripFromDB();
      if (cachedInvites?.length > 0) {
        dispatch(setInviteeTripIds(cachedInvites));
      }

      if (isOnline) {
        const resp = await Trip.getInviteedTrips(userId);
        const invites = typeof resp === 'string' ? JSON.parse(resp) : resp;
        await clearInvitedTripIds();
        const dataToSave = [];

        for (let i = 0; i < invites.length; i++) {
          const item = invites[i];

          if (item?.status == 0) {
            dataToSave.push({
              inviteId: item?.id,
              tripId: item?.tripId,
            });

            await saveInvitedIdTrip({
              inviteId: item?.id,
              tripId: item?.tripId,
            });
          }
        }
        dispatch(setInviteeTripIds(dataToSave));
        callback && callback(true, dataToSave);
      } else {
        dispatch(setInviteeTripIds(cachedInvites));
        callback && callback(cachedInvites.length > 0, cachedInvites);
      }
    } catch (error) {
      const cachedInvites = await getInvitedTripsFromDB();
      dispatch(setInviteeTripIds(cachedInvites));

      callback && callback(cachedInvites.length > 0, cachedInvites);
    }
  };

export const acceptInviteAction =
  (inviteId, tripId, isDriver, user) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      await updateInviteStatusLocally(inviteId, 1);
      const updatedInvites = await getInvitedTripsFromDB(user?.id);
      dispatch(setInvitedTrips(updatedInvites));
      if (isOnline) {
        try {
          await Trip.acceptInviteInvite(inviteId, isDriver);
          dispatch(getInvitedTripsAction(user?.id));
          dispatch(
            getTripsPage(false, 1, true, false, false, user?.id, () => {}),
          );
        } catch (apiError) {
          await addPendingAction({
            actionType: 'ACCEPT_INVITE',
            entityId: inviteId,
            payload: { inviteId, tripId, isDriver, userId: user?.id },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'ACCEPT_INVITE',
          entityId: inviteId,
          payload: { inviteId, tripId, isDriver, userId: user?.id },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const rejectInviteAction = (inviteId, userId) => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();
    await updateInviteStatusLocally(inviteId, 2);
    const updatedInvites = await getInvitedTripsFromDB(userId);
    dispatch(setInvitedTrips(updatedInvites));
    if (isOnline) {
      try {
        await Trip.rejectInviteInvite(inviteId);
        dispatch(getInvitedTripsAction(userId));
      } catch (apiError) {
        await addPendingAction({
          actionType: 'REJECT_INVITE',
          entityId: inviteId,
          payload: { inviteId, userId },
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      await addPendingAction({
        actionType: 'REJECT_INVITE',
        entityId: inviteId,
        payload: { inviteId, userId },
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getSuggestedTripsAction =
  (lat, long, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const location = `${lat},${long}`;

      const cachedTrips = await getSuggestedTripsFromDB(0);
      if (cachedTrips.length > 0) {
        dispatch(setSuggestedTrips(cachedTrips));
      }

      if (isOnline) {
        try {
          const resp = await Trip.getSuggestedTrips(lat, long);
          const trips = typeof resp === 'string' ? JSON.parse(resp) : resp;
          const tripList = trips.map(item => item.trip);
          if (trips?.length > 0) {
            await saveSuggestedTrips(tripList, true);
            dispatch(setSuggestedTrips(tripList));
          }
          callback && callback(true);
        } catch (apiError) {
          callback && callback(cachedTrips.length > 0);
        }
      } else {
        callback && callback(cachedTrips.length > 0);
      }
    } catch (error) {
      const cachedTrips = await getSuggestedTripsFromDB(0);
      dispatch(setSuggestedTrips(cachedTrips));
      callback && callback(cachedTrips.length > 0, error);
    }
  };

export const getSuggestedTripsByPostCodeAction =
  (postcode, callback) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();
      const cachedTrips = await getSuggestedTripsFromDB(1);
      if (cachedTrips.length > 0) {
        dispatch(setSuggestedTripsByPostCode(cachedTrips));
      }

      if (isOnline) {
        try {
          const resp = await Trip.getSuggestedTripsByPostCode(postcode);
          const trips = typeof resp === 'string' ? JSON.parse(resp) : resp;
          if (trips?.length > 0) {
            await saveSuggestedTrips(trips, false);
            dispatch(setSuggestedTripsByPostCode(trips));
          }
          callback && callback(true);
        } catch (apiError) {
          callback && callback(cachedTrips.length > 0);
        }
      } else {
        callback && callback(cachedTrips.length > 0);
      }
    } catch (error) {
      const cachedTrips = await getSuggestedTripsFromDB(1);
      dispatch(setSuggestedTripsByPostCode(cachedTrips));
      callback && callback(cachedTrips.length > 0, error);
    }
  };

export const sendJoinRequestAction =
  (tripId, isDriver, userId) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      const requestId = await addJoinRequestOptimistic(
        tripId,
        userId,
        isDriver,
      );
      if (isOnline) {
        try {
          await Trip.sendJoin({ tripId, isDriver });
          const resp = await Trip.getJoins(userId);
          const requests = typeof resp === 'string' ? JSON.parse(resp) : resp;
          await saveJoinRequests(userId, requests);
        } catch (apiError) {
          await addPendingAction({
            actionType: 'SEND_JOIN_REQUEST',
            entityId: tripId,
            payload: { tripId, isDriver, userId },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addPendingAction({
          actionType: 'SEND_JOIN_REQUEST',
          entityId: tripId,
          payload: { tripId, isDriver, userId },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      throw error;
    }
  };

export const deleteInvitedIdTrip = async ({ inviteId, tripId }) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM invited_trips_id 
           WHERE invite_id = ? OR trip_id = ?`,
          [inviteId?.toString(), tripId?.toString()],
          () => {
            resolve(true);
          },
          (_, error) => {
            resolve(false);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const updateCommunityPassengersLocal = async (tripId, user) => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT data FROM community_list WHERE trip_id = ?`,
          [tripId],
          (_, result) => {
            if (result.rows.length > 0) {
              let row = JSON.parse(result.rows.item(0).data);

              row.passengers = [...(row.passengers || []), user];

              tx.executeSql(
                `UPDATE community_list SET data=? WHERE trip_id=?`,
                [JSON.stringify(row), tripId],
                () => {
                  resolve(true);
                },
              );
            } else {
              resolve(false);
            }
          },
        );
      });
    });
  } catch (e) {
    return false;
  }
};

export const updateSuggestedTripPassengersLocal = async (tripId, user) => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT data FROM suggested_trips WHERE trip_id = ?`,
          [tripId],
          (_, result) => {
            if (result.rows.length > 0) {
              let row = JSON.parse(result.rows.item(0).data);

              row.passengers = [...(row.passengers || []), user];

              tx.executeSql(
                `UPDATE suggested_trips SET data=? WHERE trip_id=?`,
                [JSON.stringify(row), tripId],
                () => {
                  resolve(true);
                },
              );
            } else {
              resolve(false);
            }
          },
        );
      });
    });
  } catch (e) {
    return false;
  }
};

export const getCommunityListDemo = callback => async dispatch => {
  try {
    const communityCachedList = await getCommunityListDemoFromDB();
    if (communityCachedList?.length > 0) {
      dispatch(setCommunityList(communityCachedList));
    }
    const isOnline = await checkNetworkAndFetch();
    if (!isOnline) {
      callback && callback(true, true);
      return;
    }
    const lastSync = await getLastCommunityTripSyncTime();
    const resp = await Trip.getCommunityListDemo(
      lastSync !== undefined && lastSync !== null
        ? lastSync
        : '1990-01-01T00:00:00.000Z',
    );
    const communityList = typeof resp === 'string' ? JSON.parse(resp) : resp;
    const now = new Date().toISOString();
    await setLastCommunityTripSyncTime(now);
    dispatch(setLastSyncTime(now));
    if (communityList?.length > 0) {
      await saveCommunityList(communityList);
      dispatch(setCommunityList(communityList));
    }
    callback && callback(true, true);
  } catch (error) {
    callback && callback(false, true);
  }
};

export const getCommunityListFirst = (pageNo, callback) => async dispatch => {
  dispatch(getCommunityList(pageNo, false, true, false, callback));
};

export const getCommunityListisTop = (pageNo, callback) => async dispatch => {
  dispatch(getCommunityList(pageNo, true, false, false, callback));
};

export const getCommunityListisisBottom =
  (pageNo, callback) => async dispatch => {
    dispatch(getCommunityList(pageNo, false, false, true, callback));
  };

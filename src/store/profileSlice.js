import AsyncStorage from '@react-native-async-storage/async-storage';
import NotifeeUtility from '../PushNotification/NotifeeUtility.js';
import Profile from '../api/Profile';
import { StorageKeys } from '../constants/Constants';
import { createSlice } from '@reduxjs/toolkit';
import { setUserData } from './authSlice.js';

// Import DB helper functions
import {
  upsertProfile,
  getProfile as dbGetProfile,
  insertProfileImage,
  bulkInsertProfileImages,
  getProfileImages as dbGetProfileImages,
  insertTripReport,
  bulkInsertTripReports,
  getTripReports as dbGetTripReports,
  insertFriend,
  bulkInsertFriends,
  getFriendsList as dbGetFriendsList,
  bulkInsertSentRequests,
  getSentFriendRequests as dbGetSentRequests,
  bulkInsertReceivedRequests,
  getReceivedFriendRequests as dbGetReceivedRequests,
  bulkInsertConversations,
  getConversations as dbGetConversations,
  getNotifications as dbGetNotifications,
  markNotificationAsRead as dbMarkNotificationAsRead,
  getUnreadNotificationCount as dbGetUnreadNotificationCount,
  bulkNotificationOperation as dbBulkNotificationOperation,
  insertProfileTrip,
  bulkInsertProfileTrips,
  getProfileTrips as dbGetProfileTrips,
  deleteProfileTrip as dbDeleteProfileTrip,
  insertProfileClub,
  bulkInsertProfileClubs,
  getProfileClubs as dbGetProfileClubs,
  deleteProfileClub as dbDeleteProfileClub,
  getPendingCount,
  getLastSyncTime,
  checkOnlineStatus,
  bulkInsertNotifications,
} from '../database/profileDbHelper';
import { prefetchChatsForConversations } from './chatSlice.js';
import { getDatabase } from '../database/schema.js';

const initialState = {
  data: {},
  images: [],
  tripReports: [],
  chatConversiona: [],
  originalFriendList: [],
  originalFriendListIds: [],
  friendList: [],
  receivedRequests: [],
  receivedRequestsIds: [],
  sendedRequests: [],
  sendedRequestsIds: [],
  notificationList: [],
  notificationCount: 0,
  messagenotificationCount: 0,
  profileTrips: [],
  profileClubs: [],
  lastSyncTime: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.data = action.payload;
    },
    setProfileImages(state, action) {
      state.images = action.payload;
    },
    setProfileTripReports(state, action) {
      state.tripReports = action.payload;
    },
    setNotificationCount(state, action) {
      const localNotificationsService = new NotifeeUtility();
      localNotificationsService.setNotificationBadge(
        isNaN(Number(action.payload)) ? 0 : Number(action.payload),
      );
      state.notificationCount = action.payload;
    },

    setMessageNotificationCount(state, action) {
      state.messagenotificationCount = action.payload;
    },
    setConversation(state, action) {
      state.chatConversiona = action.payload;
    },
    addMoreConversation(state, action) {
      state.chatConversiona = [...state.chatConversiona, ...action.payload];
    },
    setFriendList(state, action) {
      state.friendList = action.payload;
    },
    setFriendListSelf(state, action) {
      state.originalFriendList = action.payload;
      state.originalFriendListIds = action.payload.map(friend => friend.id);
    },
    setReceivedRequests(state, action) {
      state.receivedRequests = action.payload;
      state.receivedRequestsIds = action.payload.map(item => item?.id);
    },
    setSendedRequests(state, action) {
      state.sendedRequests = action.payload;
      state.sendedRequestsIds = action.payload.map(item => item?.id);
    },
    setNotifications(state, action) {
      state.notificationList = action.payload;
    },
    addMoreNotifications(state, action) {
      state.notificationList = [...state.notificationList, ...action.payload];
    },
    // NEW: Profile trips reducers
    setProfileTrips(state, action) {
      state.profileTrips = action.payload;
    },
    addMoreProfileTrips(state, action) {
      state.profileTrips = [...state.profileTrips, ...action.payload];
    },
    // NEW: Profile clubs reducers
    setProfileClubs(state, action) {
      state.profileClubs = action.payload;
    },
    addMoreProfileClubs(state, action) {
      state.profileClubs = [...state.profileClubs, ...action.payload];
    },
    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },
    updateProfileTripPassengers(state, action) {
      const { tripId, user } = action.payload;

      if (state.profileTrips?.length) {
        state.profileTrips = state.profileTrips.map(t => {
          if (String(t.tripId) === String(tripId)) {
            return {
              ...t,
              passengers: [...(t.passengers || []), user],
            };
          }
          return t;
        });
      }
    },
    deleteNotification(state, action) {
      const idToDelete = action.payload;
      const newList = state.notificationList.filter(
        item => item.id !== idToDelete,
      );

      const localNotificationsService = new NotifeeUtility();
      localNotificationsService.setNotificationBadge(
        isNaN(Number(state.notificationCount - 1))
          ? 0
          : Number(state.notificationCount - 1),
      );

      state.notificationList = newList;
      state.notificationCount =
        state.notificationCount > 0 ? state.notificationCount - 1 : 0;
      AsyncStorage.setItem(
        StorageKeys.BadgeCount,
        (state.notificationCount > 0
          ? state.notificationCount - 1
          : 0
        )?.toString(),
      );
    },
    notificationModification(state, action) {
      const { ids, targetType } = action.payload;
      let updatedList = [...state.notificationList];
      let updatedCount = state.notificationCount;

      if (targetType === 'read') {
        const isReadCount = updatedList.filter(
          item => ids.includes(item.id) && item.isRead === false,
        ).length;
        updatedList = updatedList.map(item =>
          ids.includes(item.id) ? { ...item, isRead: true } : item,
        );
        updatedCount = Math.max(0, updatedCount - isReadCount);
      } else if (targetType === 'unread') {
        const isUnreadCount = updatedList.filter(
          item => ids.includes(item.id) && item.isRead === true,
        ).length;
        updatedList = updatedList.map(item =>
          ids.includes(item.id) ? { ...item, isRead: false } : item,
        );
        updatedCount = Math.max(0, updatedCount + isUnreadCount);
      } else if (targetType === 'delete') {
        const deletedItems = updatedList.filter(
          item => ids.includes(item.id) && item.isRead === false,
        ).length;
        updatedList = updatedList.filter(item => !ids.includes(item.id));
        updatedCount = Math.max(0, updatedCount - deletedItems);
      }

      const localNotificationsService = new NotifeeUtility();
      localNotificationsService.setNotificationBadge(
        isNaN(Number(updatedCount)) ? 0 : Number(updatedCount),
      );

      state.notificationList = updatedList;
      state.notificationCount = updatedCount;
      AsyncStorage.setItem(StorageKeys.BadgeCount, updatedCount?.toString());
    },
    resetProfile(state) {
      const preservedChat = state.chatConversiona;
      const preservedNotificationCount = state.notificationCount;
      const preservedNotificationList = state.notificationList;

      const localNotificationsService = new NotifeeUtility();
      localNotificationsService.setNotificationBadge(state.notificationCount);

      return {
        ...initialState,
        chatConversiona: preservedChat,
        notificationCount: preservedNotificationCount,
        notificationList: preservedNotificationList,
      };
    },
    updateConversationLastMessage(state, action) {
      const { oppUserId, message } = action.payload;
      state.chatConversiona = state.chatConversiona.map(conv => {
        if (String(conv.id) === String(oppUserId)) {
          return {
            ...conv,
            lastMessage: message || '',
          };
        }
        return conv;
      });

      // Optional: move updated conversation to TOP
      state.chatConversiona.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
      );
    },

    markNotificationRead: (state, action) => {
      const id = action.payload;
      state.notificationList = state.notificationList.map(n =>
        n.id === id ? { ...n, isRead: true } : n,
      );
    },

    decrementNotificationCount: state => {
      state.notificationCount = Math.max(0, state.notificationCount - 1);
    },

    resetProfileState: state => {
      state.data = null;
      state.images = [];
      state.tripReports = [];
      state.profileTrips = [];
      state.profileClubs = [];
      state.friendList = [];
    },
    logout(state) {
      return initialState;
    },
  },
});

export const {
  markNotificationRead,
  decrementNotificationCount,
  setProfile,
  setProfileImages,
  setProfileTripReports,
  setNotificationCount,
  setMessageNotificationCount,
  setConversation,
  addMoreConversation,
  setFriendList,
  setFriendListSelf,
  setReceivedRequests,
  setSendedRequests,
  setNotifications,
  addMoreNotifications,
  setProfileTrips,
  addMoreProfileTrips,
  setProfileClubs,
  addMoreProfileClubs,
  setLastSyncTime,
  deleteNotification: deleteNotificationAction,
  notificationModification: notificationModificationAction,
  resetProfile,
  resetProfileState,
  updateConversationLastMessage,
  logout: logoutAction,
  updateProfileTripPassengers,
} = profileSlice.actions;

export default profileSlice.reducer;

export const notificationModificationThunk = payload => async dispatch => {
  dispatch(notificationModificationAction(payload));
};

export const onNewChatMessageThunk = (message, oppUserId) => async dispatch => {
  try {
    dispatch(
      updateConversationLastMessage({
        oppUserId,
        message: message,
      }),
    );
  } catch (e) {}
};

export const getProfileTrips =
  (userId, pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const online = await checkOnlineStatus();

      if (online) {
        try {
          const data = JSON.parse(
            await Profile.getProfileTrips(userId, pageNo, perPage),
          );

          if (pageNo === 1) {
            dispatch(setProfileTrips(data));
          } else {
            dispatch(addMoreProfileTrips(data));
          }
          if (pageNo === 1) {
            await bulkInsertProfileTrips(
              String(userId),
              data.map(trip => ({
                ...trip,
                userId: String(userId),
                sync_status: 'synced',
              })),
              pageNo,
            );
          }

          dispatch(setLastSyncTime(new Date().toISOString()));
          callback && callback(true, data?.length !== perPage);
          return;
        } catch (err) {}
      }

      // Offline or server failed -> read from DB
      const localTrips = await dbGetProfileTrips(userId, pageNo, perPage);

      if (pageNo === 1) {
        dispatch(setProfileTrips(localTrips));
      } else {
        dispatch(addMoreProfileTrips(localTrips));
      }

      callback && callback(true, localTrips?.length !== perPage);
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const getProfileClubs =
  (userId, pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const online = await checkOnlineStatus();

      if (online) {
        try {
          // API call to get profile clubs from server
          const data = JSON.parse(
            await Profile.getclubList(userId, pageNo, perPage),
          );

          if (pageNo === 1) {
            dispatch(setProfileClubs(data));
          } else {
            dispatch(addMoreProfileClubs(data));
          }

          // Store in local DB
          if (pageNo === 1) {
            await bulkInsertProfileClubs(
              String(userId),
              data.map(club => ({
                ...club,
                userId: String(userId),
                sync_status: 'synced',
              })),
              pageNo,
            );
          }

          dispatch(setLastSyncTime(new Date().toISOString()));
          callback && callback(true, data?.length !== perPage);
          return;
        } catch (err) {}
      }

      // Offline or server failed -> read from DB
      const localClubs = await dbGetProfileClubs(userId, pageNo, perPage);

      if (pageNo === 1) {
        dispatch(setProfileClubs(localClubs));
      } else {
        dispatch(addMoreProfileClubs(localClubs));
      }

      callback && callback(true, localClubs?.length !== perPage);
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const updateProfileTripPassengersLocal = async (
  userId,
  tripId,
  user,
) => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT data FROM profile_trips WHERE user_id=? AND trip_id=?`,
          [String(userId), String(tripId)],
          (_, result) => {
            if (result.rows.length === 0) {
              return resolve(false);
            }

            let row = JSON.parse(result.rows.item(0).data);
            row.passengers = [...(row.passengers || []), user];

            tx.executeSql(
              `UPDATE profile_trips SET data=? WHERE user_id=? AND trip_id=?`,
              [JSON.stringify(row), String(userId), String(tripId)],
              () => {
                resolve(true);
              },
              (_, error) => {
                resolve(false);
              },
            );
          },
        );
      });
    });
  } catch (e) {
    return false;
  }
};

export const getProfile = (id, callback, isSelf) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const profileData = JSON.parse(await Profile.getProfile(id));
        dispatch(setProfile(profileData));
        await upsertProfile({
          ...profileData,
          user_id: profileData.id || profileData.user_id,
          sync_status: 'synced',
        });
        dispatch(setLastSyncTime(new Date().toISOString()));
        if (isSelf) {
          dispatch(setUserData(profileData));
        }
        callback(true);
        return;
      } catch (err) {}
    }

    const localProfile = await dbGetProfile(id);
    if (localProfile) {
      dispatch(setProfile(localProfile));
      if (isSelf) {
        dispatch(setUserData(localProfile));
      }
      callback(true);
      return;
    }

    callback(false, new Error('No profile found'));
  } catch (error) {
    callback(false, error);
  }
};

export const getProfileImages = (id, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const images = JSON.parse(await Profile.getProfileImages(id));
        dispatch(setProfileImages(images));
        const latestTen = images.slice(0, 10);
        await bulkInsertProfileImages(
          id,
          latestTen.map(img => ({
            ...img,
            userId: String(id),
            sync_status: 'synced',
          })),
        );
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true);
        return;
      } catch (err) {}
    }

    const localImages = await dbGetProfileImages(id);
    dispatch(setProfileImages(localImages));
    callback(true);
  } catch (error) {
    callback(false, error);
  }
};

export const getProfileTripReports = (id, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();
    if (online) {
      try {
        const data = JSON.parse(await Profile.getTripReports(id));
        dispatch(setProfileTripReports(data));
        const latestTen = data.slice(0, 10);
        await bulkInsertTripReports(
          id,
          latestTen.map(r => ({
            ...r,
            userId: String(id),
            sync_status: 'synced',
          })),
        );
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true);
        return;
      } catch (err) {}
    }

    const local = await dbGetTripReports(id);
    dispatch(setProfileTripReports(local));
    callback(true);
  } catch (error) {
    callback(false, error);
  }
};

export const getConversions = (id, pageNo, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();
    if (online) {
      try {
        const data = JSON.parse(await Profile.getConversions(id, pageNo));
        console.log('data====>', data);
        if (pageNo == 1) {
          dispatch(setConversation(data));
          dispatch(prefetchChatsForConversations(id, data));
        } else {
          dispatch(addMoreConversation(data));
        }
        if (pageNo == 1) {
          await bulkInsertConversations(
            String(id),
            data.map(c => ({
              ...c,
              userId: String(id),
              sync_status: 'synced',
            })),
            pageNo,
          );
        }
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true, data?.length !== 10);
        return;
      } catch (err) {}
    }

    const local = await dbGetConversations(id, pageNo, 10);
    if (pageNo == 1) {
      dispatch(setConversation(local));
      dispatch(prefetchChatsForConversations(id, local));
    }
    // else {
    //   dispatch(addMoreConversation(local));
    // }
    callback(true, local?.length !== 10);
  } catch (error) {
    callback(false, error);
  }
};

export const getFriendList = (id, callback, isSelf) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getFriendList(id));
        if (isSelf) {
          dispatch(setFriendListSelf(data));
          await bulkInsertFriends(
            String(id),
            data.map(f => ({
              ...f,
              userId: String(id),
              friendUserId: String(f.id),
              friendId: `${id}_${f.id}`,
              sync_status: 'synced',
            })),
            true,
          );
        } else {
          dispatch(setFriendList(data));
          await bulkInsertFriends(
            String(id),
            data.map(f => ({
              ...f,
              userId: String(id),
              friendUserId: String(f.id),
              friendId: `${id}_${f.id}`,
              sync_status: 'synced',
            })),
          );
        }
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true);
        return;
      } catch (err) {}
    }

    const local = await dbGetFriendsList(id);
    if (isSelf) {
      dispatch(setFriendListSelf(local));
    } else {
      dispatch(setFriendList(local));
    }
    callback(true);
  } catch (error) {
    callback(false, error);
  }
};

export const getSendedRequests = (id, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getSendedRequests(id));
        dispatch(setSendedRequests(data));
        const latestTen = data.slice(0, 10);
        await bulkInsertSentRequests(
          String(id),
          latestTen.map(r => ({
            ...r,
            senderId: String(id),
            receiverId: String(r.id),
            sync_status: 'synced',
          })),
        );
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true);
        return;
      } catch (err) {}
    }

    const local = await dbGetSentRequests(id);
    dispatch(setSendedRequests(local));
    callback(true);
  } catch (error) {
    callback(false, error);
  }
};

export const getReceivedRequest = (id, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getReceivedRequest(id));
        dispatch(setReceivedRequests(data));
        const latestTen = data.slice(0, 10);
        await bulkInsertReceivedRequests(
          String(id),
          latestTen.map(r => ({
            ...r,
            receiverId: String(id),
            senderId: String(r.id),
            sync_status: 'synced',
          })),
        );
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true);
        return;
      } catch (err) {}
    }

    const local = await dbGetReceivedRequests(id);
    dispatch(setReceivedRequests(local));
    callback(true);
  } catch (error) {
    callback(false, error);
  }
};

export const getNotifications = (pageNo, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getNotificationList(pageNo, 10));
        if (pageNo == 1) {
          dispatch(setNotifications(data));
        } else {
          dispatch(addMoreNotifications(data));
        }
        const userId = await AsyncStorage.getItem(StorageKeys.userId);
        if (userId) {
          if (pageNo == 1) {
            await bulkInsertNotifications(
              String(userId),
              data.map(n => ({
                ...n,
                userId: String(userId),
                notificationId: String(n.id),
                sync_status: 'synced',
              })),
              pageNo,
            );
          }
          dispatch(setLastSyncTime(new Date().toISOString()));
        }

        callback(true, data?.length !== 10);
        return;
      } catch (err) {}
    }
    const userId = await AsyncStorage.getItem(StorageKeys.userId);
    if (userId) {
      const local = await dbGetNotifications(userId, pageNo, 10);

      if (pageNo == 1) {
        dispatch(setNotifications(local));
      } else {
        dispatch(addMoreNotifications(local));
      }

      callback(true, local?.length !== 10);
    } else {
      callback(false, new Error('User ID not found'));
    }
  } catch (error) {
    callback(false, error);
  }
};

export const getNotificationsForUser =
  (userId, pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const local = await dbGetNotifications(userId, pageNo, perPage);
      if (pageNo == 1) {
        dispatch(setNotifications(local));
      } else {
        dispatch(addMoreNotifications(local));
      }
      callback && callback(true, local?.length !== perPage);
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const getNotificationCount = callback => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getNotificationCount());
        AsyncStorage.setItem(StorageKeys.BadgeCount, data?.toString());
        dispatch(setNotificationCount(data));
        callback && callback(true);
        return;
      } catch (err) {}
    }

    const userId = await AsyncStorage.getItem(StorageKeys.userId);
    if (userId) {
      const fallbackCount = await AsyncStorage.getItem(StorageKeys.BadgeCount);
      dispatch(setNotificationCount(fallbackCount));
      callback && callback(true);
    } else {
      dispatch(setNotificationCount(0));
      callback && callback(true);
    }
  } catch (error) {
    callback && callback(false, error);
  }
};

export const getMessageNotificationCount = callback => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        const data = JSON.parse(await Profile.getMessageNotificationCount());
        AsyncStorage.setItem(StorageKeys.MeaageCount, data?.toString());
        dispatch(setMessageNotificationCount(data));
        callback && callback(true);
        return;
      } catch (err) {}
    }

    const userId = await AsyncStorage.getItem(StorageKeys.userId);
    if (userId) {
      const fallbackCount = await AsyncStorage.getItem(StorageKeys.MeaageCount);
      dispatch(setMessageNotificationCount(fallbackCount));
      callback && callback(true);
    } else {
      dispatch(setMessageNotificationCount(0));
      callback && callback(true);
    }
  } catch (error) {
    callback && callback(false, error);
  }
};

export const readNotification = (id, callback) => async dispatch => {
  try {
    const online = await checkOnlineStatus();

    if (online) {
      try {
        await Profile.readNotification(id);
        dispatch(markNotificationRead(id));
        await dbMarkNotificationAsRead(id);
        dispatch(getNotificationCount());
      } catch (err) {}
    } else {
      try {
        const storedProfile = await AsyncStorage.getItem(StorageKeys.Profile);
        if (storedProfile) {
          const profileObj = JSON.parse(storedProfile);
          const unread = await dbGetUnreadNotificationCount(
            profileObj.id || profileObj.user_id,
          );
          dispatch(setNotificationCount(unread));
          dispatch(markNotificationRead(id));
          await dbMarkNotificationAsRead(id);
        }
      } catch (e) {}
    }

    callback && callback(true);
  } catch (error) {
    callback && callback(false, error);
  }
};

export const getProfileLocal = dbGetProfile;
export const startSync = userId => getPendingCount();
export const addSyncListener = callback => () => {};
export const getPendingChangesCount = () => getPendingCount();
export const getLastSync = () => getLastSyncTime();
export const checkOnlineStatusThunk = () => checkOnlineStatus();

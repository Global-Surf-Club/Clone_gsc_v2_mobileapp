// store/authSlice.js - Updated with Offline-First
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import Auth from '../api/Auth';
import ApiService from '../api/AxiosInstance';
import { StorageKeys } from '../constants/Constants';
import { createSlice } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import * as authDbHelper from '../database/authDbHelper';
import { resetDatabaseCompletely } from '../database/resetDatabase';

const initialState = {
  user: {},
  token: '',
  GoogleApiKey: '',
  searchedUsers: [],
  isInvited: false,
  isOnline: true,
  isOfflineLogin: false,
  lastSyncTime: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setInvited(state, action) {
      state.isInvited = action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setGoogleApiKey(state, action) {
      state.GoogleApiKey = action.payload;
    },
    setSearchedUsers(state, action) {
      state.searchedUsers = action.payload;
    },
    addMoreSearchedUsers(state, action) {
      state.searchedUsers = [...state.searchedUsers, ...action.payload];
    },
    setVouchToUser(state, action) {
      const id = action.payload;
      state.searchedUsers = state.searchedUsers.map(item => {
        if (item?.id == id) {
          return { ...item, isVouch: true };
        }
        return item;
      });
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setOfflineLogin(state, action) {
      state.isOfflineLogin = action.payload;
    },
    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },
    logout(state) {
      return {
        ...initialState,
        isOnline: state.isOnline,
      };
    },
  },
});

export const {
  setUser,
  setInvited,
  setToken,
  setGoogleApiKey,
  setSearchedUsers,
  addMoreSearchedUsers,
  setVouchToUser,
  setOnlineStatus,
  setOfflineLogin,
  setLastSyncTime,
  logout: logoutAction,
} = authSlice.actions;

export default authSlice.reducer;

// ==================== HELPER FUNCTIONS ====================

const checkOnlineStatus = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// ==================== BASIC SETTERS ====================

export const setUserData = data => async dispatch => {
  dispatch(setUser(data));
};

export const setInInvited = data => async dispatch => {
  dispatch(setInvited(data));
};

export const setSearchedUserData = data => async dispatch => {
  dispatch(setSearchedUsers(data));
};

export const addMoreSearchedUserData = data => async dispatch => {
  dispatch(addMoreSearchedUsers(data));
};

export const setTokenAndApi = token => async dispatch => {
  ApiService.setToken(token);
  dispatch(setToken(token));
};

export const setGoogleApiKeyThunk = data => async dispatch => {
  dispatch(setGoogleApiKey(data));
};

// ==================== OFFLINE-FIRST SIGN IN ====================

export const signInUser = (email, password, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();
    dispatch(setOnlineStatus(isOnline));
    if (isOnline) {
      const data = {
        login: email,
        password,
      };
      const loginData = await Auth.login(data);
      const token = loginData?.token ?? '';
      await dispatch(setTokenAndApi(token));
      loginData.thumbnailProfileImage = loginData?.fullNameProfileImage;
      dispatch(setUser(loginData));
      dispatch(setOfflineLogin(false));
      await AsyncStorage.setItem(StorageKeys.Token, token);
      await AsyncStorage.setItem(StorageKeys.userId, loginData?.id?.toString());
      await authDbHelper.upsertUser(loginData, true);
      const fcmToken = await messaging()
        .getToken()
        .catch(() => '');
      await authDbHelper.createSession(loginData?.id, email, token, fcmToken);
      dispatch(updateFCM(loginData?.id));
      dispatch(checkInvited(loginData?.email, callback));
    }
  } catch (error) {
    callback(false, error);
  }
};

export const getUserData = (id, callback) => async dispatch => {
  try {
    const userID = id ?? (await AsyncStorage.getItem(StorageKeys.userId));
    const isOnline = await checkOnlineStatus();
    dispatch(setOnlineStatus(isOnline));
    const cachedUser = await authDbHelper.getUserById(userID);
    if (cachedUser) {
      dispatch(setUser(cachedUser));
    }
    if (isOnline) {
      try {
        const userData = JSON.parse(await Auth.getUserDataById(userID));
        await authDbHelper.upsertUser(userData, true);
        dispatch(setUser(userData));
        dispatch(setOfflineLogin(false));
        dispatch(checkInvited(userData?.email, callback));
        return userData;
      } catch (error) {
        if (error?.code == 401) {
          await AsyncStorage.clear();
          await authDbHelper.clearAllAuthData();
        }
        if (cachedUser) {
          callback && callback(true, { offline: true });
          return cachedUser;
        } else {
          callback && callback(false, error);
          return null;
        }
      }
    } else {
      if (cachedUser) {
        dispatch(setOfflineLogin(true));
        callback && callback(true, { offline: true });
        return cachedUser;
      } else {
        callback &&
          callback(false, { message: 'No cached user data available' });
        return null;
      }
    }
  } catch (error) {
    callback && callback(false, error);
    return null;
  }
};

// ==================== CHECK INVITED ====================

export const checkInvited = (email, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const data = { email };
      const isInvited = JSON.parse(await Auth.checkInvited(data));
      dispatch(setInvited(isInvited));
      callback && callback(true);
    } else {
      // Offline - assume invited (to not block flow)
      callback && callback(true);
    }
  } catch (error) {
    callback && callback(true);
  }
};

// ==================== UPDATE FCM ====================

export const updateFCM = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const fcmToken = await messaging().getToken();
      const data = {
        userId: id,
        fcmToken: fcmToken,
      };
      await Auth.updateFCM(data);
      callback && callback(true);
    } else {
      // Skip FCM update when offline
      callback && callback(true);
    }
  } catch (error) {
    callback && callback(false, error);
  }
};

// ==================== OFFLINE-FIRST SEARCH USERS ====================

export const getSearchUserData = (name, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();
    dispatch(setOnlineStatus(isOnline));
    const cachedUsers = await authDbHelper.searchUsersLocal(name, 1, 100);
    dispatch(setSearchedUsers(cachedUsers));

    if (isOnline) {
      const data = { name };
      const userData = JSON.parse(await Auth.getUserData(data));
      const latestTen = userData.slice(0, 10);
      await authDbHelper.bulkInsertSearchedUsers(latestTen);
      dispatch(setSearchedUsers(userData));
      callback(true);
    } else {
      callback(true);
    }
  } catch (error) {
    callback(false, error);
  }
};

export const getSearchUserDataPagination =
  (name, pageNo, callback) => async dispatch => {
    try {
      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));
      const cachedUsers = await authDbHelper.searchUsersLocal(name, pageNo, 10);
      if (pageNo == 1) {
        dispatch(setSearchedUsers(cachedUsers));
      }
      if (isOnline) {
        const data = {
          pageNo: pageNo,
          perPageCount: 10,
          name: name,
        };
        const userData = await Auth.getUserDatapagination(JSON.stringify(data));
        if (pageNo == 1) {
          await authDbHelper.bulkInsertSearchedUsers(userData, pageNo);
        }
        if (pageNo == 1) {
          dispatch(setSearchedUsers(userData));
        } else {
          dispatch(addMoreSearchedUsers(userData));
        }
        dispatch(setLastSyncTime(new Date().toISOString()));
        callback(true, userData?.length !== 10);
      } else {
        callback(true, cachedUsers?.length !== 10);
      }
    } catch (error) {
      callback(false, error);
    }
  };

// ==================== VOUCH USER ====================

export const VouchUser = id => async dispatch => {
  try {
    // Update local DB
    await authDbHelper.updateVouchStatus(id, true);

    // Update Redux
    dispatch(setVouchToUser(id));
  } catch (error) {}
};

// ==================== ACCEPT INVITE ====================

export const AcceptInvite = (email, code, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();

    if (isOnline) {
      const data = { email, code };
      await Auth.acceptInvite(data);
      callback(true);
    } else {
      callback(false, { message: 'Cannot accept invite offline' });
    }
  } catch (error) {
    callback(false, error);
  }
};

export const Logout = () => async dispatch => {
  await resetDatabaseCompletely(); // SQLite (all tables)
  await AsyncStorage.clear(); // AsyncStorage
  dispatch({ type: 'auth/logout' }); // Redux FULL RESET
};

// ==================== HARD LOGOUT (DELETE USER DATA) ====================

export const HardLogout = () => async dispatch => {
  try {
    await authDbHelper.clearAllAuthData();

    // Clear AsyncStorage
    await AsyncStorage.removeItem(StorageKeys.Token);
    await AsyncStorage.removeItem(StorageKeys.userId);

    // Clear Redux state
    dispatch(logoutAction());
  } catch (e) {}
};

// ==================== GET GOOGLE API KEY ====================

export const getGoogleApiKey = callback => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();

    // Try to get from local DB first
    const cachedKey = await authDbHelper.getSetting('google_api_key');
    if (cachedKey) {
      dispatch(setGoogleApiKey(cachedKey));
      callback && callback(true);
    }

    if (isOnline) {
      // Fetch from server
      const data = JSON.parse(await Auth.getSettings('gkey'));

      // Save to local DB
      await authDbHelper.saveSetting('google_api_key', data);

      // Update Redux
      dispatch(setGoogleApiKey(data));
      callback && callback(true);
    } else {
      // Offline - use cached key if available
      if (cachedKey) {
        callback && callback(true);
      } else {
        callback && callback(false, { message: 'No cached API key' });
      }
    }
  } catch (error) {
    callback && callback(false, error);
  }
};

export const restoreSession = () => async dispatch => {
  try {
    const activeSession = await authDbHelper.getActiveSession();

    if (activeSession && activeSession.is_active === 1) {
      const userData = await authDbHelper.getUserById(activeSession.user_id);
      if (userData) {
        await dispatch(setTokenAndApi(activeSession.token));
        dispatch(setUser(userData));

        await AsyncStorage.setItem(StorageKeys.Token, activeSession.token);
        await AsyncStorage.setItem(
          StorageKeys.userId,
          activeSession.user_id?.toString(),
        );

        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

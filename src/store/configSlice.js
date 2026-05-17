// store/configSlice.js - COMPLETE CONFIG SLICE

import { createSlice } from '@reduxjs/toolkit';
import ClubApi from '../api/ClubApi';
import * as dbHelper from '../database/eventDbHelper';
import NetInfo from '@react-native-community/netinfo';

const initialState = {
  recurringTypes: [],
  durationList: [],
  startWhenList: {},
  loading: false,
  error: null,
  lastSync: null,
  isOnline: true,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setRecurringTypes(state, action) {
      state.recurringTypes = action.payload;
    },
    setDurationList(state, action) {
      state.durationList = action.payload;
    },
    setStartWhenList(state, action) {
      const { type, data } = action.payload;
      state.startWhenList[type] = data;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setLastSync(state, action) {
      state.lastSync = action.payload;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    clearConfigState() {
      return initialState;
    },
  },
});

export const {
  setRecurringTypes,
  setDurationList,
  setStartWhenList,
  setLoading,
  setError,
  setLastSync,
  setOnlineStatus,
  clearConfigState,
} = configSlice.actions;

export default configSlice.reducer;

export const initializeAppConfig = () => async dispatch => {
  try {
    dispatch(setLoading(true));
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected;
    dispatch(setOnlineStatus(isOnline));
    const localRecurringTypes = await dbHelper.getAppConfig('recurring_types');
    if (localRecurringTypes) {
      const parsedData = JSON.parse(localRecurringTypes);
      dispatch(setRecurringTypes(parsedData));
    } else {
    }
    if (isOnline) {
      await dispatch(fetchRecurringTypes());
    } else {
    }
    dispatch(setLoading(false));
  } catch (error) {
 
    dispatch(setError(error.message));
    dispatch(setLoading(false));
  }
};

export const fetchRecurringTypes = () => async dispatch => {
  try {
    const localData = await dbHelper.getAppConfig('recurring_types');
    if (localData) {
      dispatch(setRecurringTypes(JSON.parse(localData)));
    }
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected;
    dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      const res = await ClubApi.getEventRecurringType('Recurring');
      if (res !== null && res?.length > 0) {
        const data = JSON.parse(res);
        const uniqueData = [...new Set(data)];
        await dbHelper.saveAppConfig(
          'recurring_types',
          JSON.stringify(uniqueData),
        );
        dispatch(setRecurringTypes(uniqueData));
        dispatch(setLastSync(new Date().toISOString()));
      } else {
      }
    } else {
    }
  } catch (error) {
 
    dispatch(setError(error.message));
  }
};

export const fetchStartWhenList = type => async dispatch => {
  try {
    const configKey = `start_when_${type.toLowerCase()}`;
    const localData = await dbHelper.getAppConfig(configKey);
    if (localData) {
      const parsedData = JSON.parse(localData);
      dispatch(setStartWhenList({ type, data: parsedData }));
    }
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected;
    dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      const res = await ClubApi.getEventRecurringType(type.toLowerCase());

      if (res !== null && res?.length > 0) {
        const data = JSON.parse(res);
        const uniqueData = [...new Set(data)];
        await dbHelper.saveAppConfig(configKey, JSON.stringify(uniqueData));
        dispatch(setStartWhenList({ type, data: uniqueData }));
      }
    } else {
    }
  } catch (error) {
 
    dispatch(setError(error.message));
  }
};

export const getStartWhenList = type => async (dispatch, getState) => {
  const state = getState();
  const existingData = state.config.startWhenList[type];
  if (existingData && existingData.length > 0) {
    return existingData;
  }
  const configKey = `start_when_${type.toLowerCase()}`;
  const localData = await dbHelper.getAppConfig(configKey);

  if (localData) {
    const data = JSON.parse(localData);
    dispatch(setStartWhenList({ type, data }));
    return data;
  }
  await dispatch(fetchStartWhenList(type));

  const newState = getState();
  return newState.config.startWhenList[type] || [];
};

/**
 * Sync all configs (call when coming back online)
 */
export const syncAllConfigs = () => async dispatch => {
  try {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    // Sync recurring types
    await dispatch(fetchRecurringTypes());
  } catch (error) {
 
  }
};

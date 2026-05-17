// store/sponsorSlice.js
import { createSlice } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import SponsorApi from '../api/SponsorApi';
import * as db from '../database/sponsorDbHelper';

const initialState = {
  sponsorlist: [],
  businessList: [],
  loadingLocal: false,
  loadingRemote: false,
  isOnline: true,
};

const slice = createSlice({
  name: 'sponsor',
  initialState,
  reducers: {
    setSponsors: (s, a) => {
      s.sponsorlist = a.payload;
    },
    addSponsors: (state, action) => {
      const map = new Map();
      state.sponsorlist.forEach(item => {
        map.set(item.id, item);
      });
      action.payload.forEach(item => {
        map.set(item.id, {
          ...map.get(item.id),
          ...item,
        });
      });
      const getTime = d => (d ? new Date(d).getTime() : 0);
      state.sponsorlist = Array.from(map.values()).sort(
        (a, b) => getTime(b.updatedAt) - getTime(a.updatedAt),
      );
    },

    setBusinesses: (s, a) => {
      s.businessList = a.payload;
    },
    addBusinesses: (state, action) => {
      const map = new Map();
      state.businessList.forEach(item => {
        map.set(item.id, item);
      });
      action.payload.forEach(item => {
        map.set(item.id, {
          ...map.get(item.id),
          ...item,
        });
      });

      state.businessList = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    },
    updateSponsorImage: (state, action) => {
      const { id, imageUrl } = action.payload;

      const updateItem = item =>
        item.id === id
          ? { ...item, imagePath: imageUrl, thumbnailImagePath: imageUrl }
          : item;

      state.sponsorlist = state.sponsorlist.map(updateItem);
    },
    updateBusinessImage: (state, action) => {
      const { id, imageUrl } = action.payload;

      const updateItem = item =>
        item.id === id
          ? { ...item, imagePath: imageUrl, thumbnailImagePath: imageUrl }
          : item;

      state.businessList = state.businessList.map(updateItem);
    },
    setOnline: (s, a) => {
      s.isOnline = a.payload;
    },
    setLocalLoading: (s, a) => {
      s.loadingLocal = a.payload;
    },
    setRemoteLoading: (s, a) => {
      s.loadingRemote = a.payload;
    },
    clearSponsor: () => initialState,
  },
});

export const {
  setSponsors,
  addSponsors,
  setBusinesses,
  addBusinesses,
  setOnline,
  setLocalLoading,
  setRemoteLoading,
  clearSponsor,
  updateBusinessImage,
  updateSponsorImage,
} = slice.actions;

export default slice.reducer;

const checkOnline = async () => {
  const s = await NetInfo.fetch();
  return !!s.isConnected;
};

export const getSponsors =
  (page = 1, search = '', cb) =>
  async dispatch => {
    dispatch(setLocalLoading(true));

    const local = await db.getSponsors(page, 10, search);
    page === 1 ? dispatch(setSponsors(local)) : dispatch(addSponsors(local));

    dispatch(setLocalLoading(false));

    const online = await checkOnline();
    dispatch(setOnline(online));

    if (!online) {
      // Offline है तो local data के basis पर end check करें
      const isEndReached = local.length < 10;
      return cb?.(true, isEndReached);
    }

    dispatch(setRemoteLoading(true));

    try {
      const lastSync = await db.getLastSponsorSyncTime();
      const remote = await SponsorApi.getSponsor({
        pageNo: page,
        perPageCount: 10,
        searchvalue: search,
        lastUpdatedAt: lastSync,
      });

      if (remote?.length) {
        await db.bulkInsertSponsors(remote);
        page === 1
          ? dispatch(setSponsors(remote))
          : dispatch(addSponsors(remote));
        await db.setLastSponsorSyncTime(new Date().toISOString());
      }

      // अगर remote data page size (10) से कम है, तो end है
      const isEndReached = !remote || remote.length < 10;
      cb?.(true, isEndReached);
    } catch (error) {
      const isEndReached = local.length < 10;
      cb?.(false, isEndReached);
    } finally {
      dispatch(setRemoteLoading(false));
    }
  };

export const getBusinesses =
  (page = 1, search = '', cb) =>
  async dispatch => {
    dispatch(setLocalLoading(true));

    const local = await db.getBusinesses(page, 10, search);
    page === 1
      ? dispatch(setBusinesses(local))
      : dispatch(addBusinesses(local));

    dispatch(setLocalLoading(false));

    const online = await checkOnline();
    dispatch(setOnline(online));

    if (!online) {
      const isEndReached = local.length < 10;
      return cb?.(true, isEndReached);
    }

    dispatch(setRemoteLoading(true));

    try {
      const lastSync = await db.getLastBusinessSyncTime();
      const remote = await SponsorApi.getbusiness({
        pageNo: page,
        perPageCount: 10,
        searchvalue: search,
        lastUpdatedAt: lastSync,
      });

      if (remote?.length) {
        await db.bulkInsertBusinesses(remote);
        page === 1
          ? dispatch(setBusinesses(remote))
          : dispatch(addBusinesses(remote));
        await db.setLastBusinessSyncTime(new Date().toISOString());
      }

      const isEndReached = !remote || remote.length < 10;
      cb?.(true, isEndReached);
    } catch (error) {
      const isEndReached = local.length < 10;
      cb?.(false, isEndReached);
    } finally {
      dispatch(setRemoteLoading(false));
    }
  };

export const getSponsorSpeed =
  (search = '', callback) =>
  async dispatch => {
    try {
      const cached = await db.getSponsorSpeedFromDB(search);
      if (cached?.length > 0) {
        dispatch(setSponsors(cached));
      }

      const isOnline = await checkOnline();
      dispatch(setOnline(isOnline));

      if (!isOnline) {
        callback?.(true, true);
        return;
      }

      const lastSync = await db.getLastSponsorSyncTime();
      const lastSyncfinal = lastSync || '1990-01-01T00:00:00.000Z';

      const resp = await SponsorApi.getSponsorSpeed(lastSyncfinal);
      const apiList = typeof resp === 'string' ? JSON.parse(resp) : resp;

      if (apiList?.length > 0) {
        await db.bulkInsertSponsorsSpeed(apiList);

        const updatedList = await db.getSponsorSpeedFromDB(search);

        dispatch(setSponsors(updatedList));

        await db.setLastSponsorSyncTime(new Date().toISOString());
      }

      callback?.(true, true);
    } catch (e) {
      callback?.(false, true);
    }
  };

export const getBusinessSpeed =
  (search = '', callback) =>
  async dispatch => {
    try {
      const cached = await db.getBusinessSpeedFromDB(search);
      if (cached?.length > 0) {
        dispatch(setBusinesses(cached));
      }

      const isOnline = await checkOnline();
      dispatch(setOnline(isOnline));

      if (!isOnline) {
        callback?.(true, true);
        return;
      }

      const lastSync = await db.getLastBusinessSyncTime();
      const lastSyncfinal = lastSync || '1990-01-01T00:00:00.000Z';

      const resp = await SponsorApi.getbusinessSpeed(lastSyncfinal);
      const apiList = typeof resp === 'string' ? JSON.parse(resp) : resp;

      if (apiList?.length > 0) {
        await db.bulkInsertBusinessesSpeed(apiList);

        const updatedList = await db.getBusinessSpeedFromDB(search);

        dispatch(setBusinesses(updatedList));

        await db.setLastBusinessSyncTime(new Date().toISOString());
      }

      callback?.(true, true);
    } catch (e) {
      callback?.(false, true);
    }
  };

export const createBusiness = (payload, callback) => async dispatch => {
  dispatch(setRemoteLoading(true));
  try {
    const online = await checkOnline();
    dispatch(setOnline(online));
    if (!online) {
      dispatch(setRemoteLoading(false));
      callback?.(false, {
        offline: true,
        requiresOnline: true,
        message:
          'Internet connection required to create business recommendation.',
      });
      return;
    }
    const response = await SponsorApi.createBusiness(payload);
    if (response?.id) {
      if (payload?.isSponsored) {
        await db.upsertSponsorSpeed({
          ...response,
          sync_status: 'synced',
        });
        dispatch(addSponsors([response]));
      } else {
        await db.upsertBusinessSpeed({
          ...response,
          sync_status: 'synced',
        });
        dispatch(addBusinesses([response]));
      }
      dispatch(setRemoteLoading(false));
      callback?.(true, {
        success: true,
        data: response,
      });
    } else {
      dispatch(setRemoteLoading(false));
      callback?.(false, {
        message: 'Failed to create business recommendation. Please try again.',
      });
    }
  } catch (error) {
    dispatch(setRemoteLoading(false));
    if (
      error?.response?.status === 409 ||
      error?.title?.toLowerCase()?.trim() === 'conflict'
    ) {
      callback?.(true, {
        conflict: true,
        message:
          'This business has already been recommended and may be under review.',
      });
    } else {
      callback?.(false, {
        message:
          error?.message ||
          'An error occurred while creating the business recommendation.',
      });
    }
  }
};

export const uploadBusinessImage =
  (businessId, photo, isSponsored, callback) => async dispatch => {
    dispatch(setRemoteLoading(true));
    try {
      const online = await checkOnline();
      dispatch(setOnline(online));

      if (!online) {
        dispatch(setRemoteLoading(false));
        callback?.(false, {
          offline: true,
          requiresOnline: true,
          message: 'Internet connection required to upload image.',
        });
        return;
      }

      // 1️⃣ FormData yahin banao
      const formData = new FormData();
      formData.append(0, {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `business_${Date.now()}.jpg`,
      });

      // 2️⃣ API call
      const res = await SponsorApi.postImageSponsor(businessId, formData);
      if (res) {
        if (isSponsored) {
          await db.updateSponsorImage(businessId, photo.uri);
          dispatch(
            updateSponsorImage({
              id: businessId,
              imageUrl: photo.uri,
            }),
          );
        } else {
          await db.updateBusinessImage(businessId, photo.uri);
          dispatch(
            updateBusinessImage({
              id: businessId,
              imageUrl: photo.uri,
            }),
          );
        }
      }

      dispatch(setRemoteLoading(false));
      callback?.(true, res);
    } catch (error) {
      dispatch(setRemoteLoading(false));
      callback?.(false, {
        message: 'Failed to upload image. Please try again.',
      });
    }
  };

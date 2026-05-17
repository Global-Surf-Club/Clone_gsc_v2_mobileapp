// store/clubSlice.js - Complete Offline-First Implementation
import { createSlice } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import ClubApi from '../api/ClubApi';
import * as ClubDB from '../database/clubDbHelper';
import { createSelector } from '@reduxjs/toolkit';
import * as ForumDB from '../database/forumDbHelper';

const initialState = {
  allClubs: [],
  myClubs: [],
  clubDetails: {},
  clubMembers: {},
  clubGallery: {},
  clubActiveMembers: {},
  clubForum: {},
  clubTrips: {},
  clubReports: {},
  loading: false,
  error: null,
  isOffline: false,
  lastSync: null,
};

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    setClubActiveMembers(state, action) {
      const { clubId, data } = action.payload;
      state.clubActiveMembers[clubId] = data;
    },
    setClubForum(state, action) {
      const { clubId, data } = action.payload;
      state.clubForum[clubId] = data;
    },

    prependClubForum(state, action) {
      const { clubId, data } = action.payload;
      state.clubForum[clubId] = [...data, ...(state.clubForum[clubId] || [])];
    },

    addMoreClubForum(state, action) {
      const { clubId, data } = action.payload;
      state.clubForum[clubId] = [...(state.clubForum[clubId] || []), ...data];
    },

    updateClubForumPost(state, action) {
      const { clubId, post } = action.payload;
      const list = state.clubForum[clubId] || [];
      const index = list.findIndex(p => p.id === post.id);
      if (index !== -1) list[index] = { ...list[index], ...post };
    },

    removeClubForumPost(state, action) {
      const { clubId, postId } = action.payload;
      state.clubForum[clubId] = (state.clubForum[clubId] || []).filter(
        p => p.id !== postId,
      );
    },
    setClubTrips(state, action) {
      const { clubId, data } = action.payload;
      state.clubTrips[clubId] = data;
    },
    addMoreClubTrips(state, action) {
      const { clubId, data } = action.payload;
      state.clubTrips[clubId] = [...(state.clubTrips[clubId] || []), ...data];
    },
    prependClubTrips(state, action) {
      const { clubId, data } = action.payload;
      state.clubTrips[clubId] = [...data, ...(state.clubTrips[clubId] || [])];
    },
    setClubReports(state, action) {
      const { clubId, data } = action.payload;
      state.clubReports[clubId] = data;
    },
    addMoreClubReports(state, action) {
      const { clubId, data } = action.payload;
      state.clubReports[clubId] = [
        ...(state.clubReports[clubId] || []),
        ...data,
      ];
    },
    prependClubReports(state, action) {
      const { clubId, data } = action.payload;
      state.clubReports[clubId] = [
        ...data,
        ...(state.clubReports[clubId] || []),
      ];
    },
    setAllClubs(state, action) {
      state.allClubs = action.payload;
    },
    addMoreClubs(state, action) {
      state.allClubs = [...state.allClubs, ...action.payload];
    },
    setMyClubs(state, action) {
      state.myClubs = action.payload;
    },
    addMoreMyClubs(state, action) {
      state.myClubs = [...state.myClubs, ...action.payload];
    },
    setClubDetails(state, action) {
      const { clubId, data } = action.payload;
      state.clubDetails[clubId] = data;
    },
    setClubMembers(state, action) {
      const { clubId, data } = action.payload;
      state.clubMembers[clubId] = data;
    },
    setClubGallery(state, action) {
      const { clubId, data } = action.payload;
      state.clubGallery[clubId] = data;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setOfflineStatus(state, action) {
      state.isOffline = action.payload;
    },
    setLastSync(state, action) {
      state.lastSync = action.payload;
    },
    clearClubState() {
      return initialState;
    },
    updateClub(state, action) {
      const { clubId, data } = action.payload;
      if (!clubId) return;

      const updateIfMatch = club =>
        club && club.id === clubId ? { ...club, ...data } : club;

      state.allClubs = state.allClubs.map(updateIfMatch);
      state.myClubs = state.myClubs.map(updateIfMatch);

      if (state.clubDetails[clubId]) {
        state.clubDetails[clubId] = { ...state.clubDetails[clubId], ...data };
      }
    },
    updateClubStatus(state, action) {
      const { clubId, status } = action.payload;
      if (!clubId) return;
      const fromAll = state.allClubs.find(c => c?.id === clubId);
      const fromMy = state.myClubs.find(c => c?.id === clubId);

      const updatedClub = {
        ...(fromAll || fromMy),
        status,
      };

      if (!updatedClub?.id) return;

      if (status === 'Joined') {
        state.allClubs = state.allClubs.filter(c => c.id !== clubId);
        const existsInMy = state.myClubs.some(c => c.id === clubId);
        if (!existsInMy) {
          state.myClubs.unshift(updatedClub);
        } else {
          state.myClubs = state.myClubs.map(c =>
            c.id === clubId ? updatedClub : c,
          );
        }
      } else {
        state.myClubs = state.myClubs.filter(c => c.id !== clubId);
        const existsInAll = state.allClubs.some(c => c.id === clubId);
        if (!existsInAll) {
          state.allClubs.unshift(updatedClub);
        } else {
          state.allClubs = state.allClubs.map(c =>
            c.id === clubId ? updatedClub : c,
          );
        }
      }

      if (state.clubDetails[clubId]) {
        state.clubDetails[clubId] = {
          ...state.clubDetails[clubId],
          status,
        };
      }
    },
    updateClubMemberCount(state, action) {
      const { clubId, delta } = action.payload;
      if (!clubId || typeof delta !== 'number') return;

      const updateMemberCount = club => {
        if (!club || club.id !== clubId) return club;
        const currentCount = Number(club.membersCount || 0);
        return { ...club, membersCount: Math.max(0, currentCount + delta) };
      };

      state.allClubs = state.allClubs.map(updateMemberCount);
      state.myClubs = state.myClubs.map(updateMemberCount);

      if (state.clubDetails[clubId]) {
        const currentCount = Number(
          state.clubDetails[clubId].membersCount || 0,
        );
        state.clubDetails[clubId] = {
          ...state.clubDetails[clubId],
          membersCount: Math.max(0, currentCount + delta),
        };
      }
    },
    removeClubFromList(state, action) {
      const clubId = action.payload;
      state.allClubs = state.allClubs.filter(club => club.id !== clubId);
      state.myClubs = state.myClubs.filter(club => club.id !== clubId);
      delete state.clubDetails[clubId];
    },
    addOrUpdateAllClubs(state, action) {
      const map = new Map();

      state.allClubs.forEach(c => {
        if (c?.id) map.set(c.id, c);
      });

      action.payload.forEach(c => {
        if (!c?.id) return;
        map.set(c.id, {
          ...map.get(c.id),
          ...c,
        });
      });

      state.allClubs = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
    },

    addOrUpdateMyClubs(state, action) {
      const map = new Map();

      state.myClubs.forEach(c => {
        if (c?.id) map.set(c.id, c);
      });

      action.payload.forEach(c => {
        if (!c?.id) return;
        map.set(c.id, {
          ...map.get(c.id),
          ...c,
        });
      });

      state.myClubs = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      );
    },
  },
});

export const {
  setAllClubs,
  addMoreClubs,
  setMyClubs,
  addMoreMyClubs,
  setClubDetails,
  setClubMembers,
  setClubGallery,
  setLoading,
  setError,
  setOfflineStatus,
  setLastSync,
  clearClubState,
  updateClub,
  updateClubStatus,
  updateClubMemberCount,
  removeClubFromList,
  updateClubForumPost,
  setClubActiveMembers,
  setClubForum,
  removeClubForumPost,
  addMoreClubForum,
  prependClubForum,
  setClubTrips,
  addMoreClubTrips,
  prependClubTrips,
  setClubReports,
  addMoreClubReports,
  prependClubReports,
  addOrUpdateAllClubs,
  addOrUpdateMyClubs,
} = clubSlice.actions;

export default clubSlice.reducer;

// ==================== HELPER ====================
const checkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

export const fetchAllClubsSpeed = callback => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      dispatch(setLoading(false));
      return;
    }
    const cached = await ClubDB.getAllClubsSpeedFromDB(userId);
    if (cached?.length) {
      dispatch(setAllClubs(cached));
    }
    const isOnline = await checkConnectivity();
    dispatch(setOfflineStatus(!isOnline));

    if (!isOnline) {
      dispatch(setLoading(false));
      callback?.(true);
      return;
    }
    const lastSync =
      (await ClubDB.getLastClubSyncTime()) || '1990-01-01T00:00:00.000Z';
    const res = await ClubApi.getAllClubsSpeed(lastSync);
    const clubs = typeof res === 'string' ? JSON.parse(res) : res;
    if (clubs?.length) {
      await ClubDB.bulkInsertClubsSpeed(clubs);
      dispatch(addOrUpdateAllClubs(clubs));
    }
    await ClubDB.setLastClubSyncTime(new Date().toISOString());
    dispatch(setLoading(false));
    callback?.(true);
  } catch (e) {
    dispatch(setLoading(false));
    callback?.(false);
  }
};

export const fetchMyClubsSpeed = callback => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      dispatch(setLoading(false));
      return;
    }
    const cached = await ClubDB.getMyClubsSpeedFromDB(userId);
    if (cached?.length) {
      dispatch(setMyClubs(cached));
    }
    const isOnline = await checkConnectivity();
    dispatch(setOfflineStatus(!isOnline));

    if (!isOnline) {
      dispatch(setLoading(false));
      callback?.(true);
      return;
    }
    const lastSync =
      (await ClubDB.getLastMyClubSyncTime()) || '1990-01-01T00:00:00.000Z';
    const res = await ClubApi.getMyClubsSpeed(lastSync);
    const clubs = typeof res === 'string' ? JSON.parse(res) : res;
    if (clubs?.length) {
      await ClubDB.bulkInsertClubsSpeed(clubs);
      dispatch(addOrUpdateMyClubs(clubs));
    }
    await ClubDB.setLastMyClubSyncTime(new Date().toISOString());
    dispatch(setLoading(false));
    callback?.(true);
  } catch (e) {
    dispatch(setLoading(false));
    callback?.(false);
  }
};

export const fetchAllClubs =
  (pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    dispatch(setLoading(true));
    try {
      const isOnline = await checkConnectivity();

      if (isOnline) {
        try {
          const res = await ClubApi.getAllclubs(pageNo, perPage);
          const data = JSON.parse(res);
          if (pageNo === 1) {
            await ClubDB.bulkInsertClubs(data, pageNo);
          }

          if (pageNo === 1) {
            dispatch(setAllClubs(data));
          } else {
            dispatch(addMoreClubs(data));
          }

          dispatch(setLoading(false));
          dispatch(setOfflineStatus(false));
          dispatch(setLastSync(new Date().toISOString()));
          callback && callback(true, data?.length !== perPage);
        } catch (apiError) {
          const cachedClubs = await ClubDB.getAllClubs(pageNo, perPage);

          if (pageNo === 1) {
            dispatch(setAllClubs(cachedClubs));
          } else {
            dispatch(addMoreClubs(cachedClubs));
          }

          dispatch(setLoading(false));
          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedClubs?.length !== perPage);
        }
      } else {
        // Offline - load from cache
        const cachedClubs = await ClubDB.getAllClubs(pageNo, perPage);

        if (pageNo === 1) {
          dispatch(setAllClubs(cachedClubs));
        } else {
          dispatch(addMoreClubs(cachedClubs));
        }

        dispatch(setLoading(false));
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedClubs?.length !== perPage);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const fetchMyClubs =
  (pageNo = 1, perPage = 10, callback) =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const userId = getState().auth.user?.id;
      const isOnline = await checkConnectivity();

      if (isOnline) {
        try {
          const res = await ClubApi.getMyclubs(pageNo, perPage);
          const data = JSON.parse(res);

          // Save to local database
          if (pageNo === 1) {
            await ClubDB.bulkInsertMyClubs(data, userId, pageNo);
          }

          // Update Redux
          if (pageNo === 1) {
            dispatch(setMyClubs(data));
          } else {
            dispatch(addMoreMyClubs(data));
          }

          dispatch(setLoading(false));
          dispatch(setOfflineStatus(false));
          callback && callback(true, data?.length !== perPage);
        } catch (apiError) {
          const cachedClubs = await ClubDB.getMyClubs(userId, pageNo, perPage);

          if (pageNo === 1) {
            dispatch(setMyClubs(cachedClubs));
          } else {
            dispatch(addMoreMyClubs(cachedClubs));
          }

          dispatch(setLoading(false));
          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedClubs?.length !== perPage);
        }
      } else {
        // Offline - load from cache
        const cachedClubs = await ClubDB.getMyClubs(userId, pageNo, perPage);

        if (pageNo === 1) {
          dispatch(setMyClubs(cachedClubs));
        } else {
          dispatch(addMoreMyClubs(cachedClubs));
        }

        dispatch(setLoading(false));
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedClubs?.length !== perPage);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const fetchClubDetails = (clubId, callback) => async dispatch => {
  dispatch(setLoading(true));
  try {
    const isOnline = await checkConnectivity();

    if (isOnline) {
      try {
        const res = await ClubApi.getclubsDetail(clubId);
        const data = JSON.parse(res);

        await ClubDB.insertClubDetails(data);

        dispatch(setClubDetails({ clubId, data }));
        dispatch(setLoading(false));
        dispatch(setOfflineStatus(false));
        callback && callback(true, data);
      } catch (apiError) {
        const cachedDetails = await ClubDB.getClubDetails(clubId);

        if (cachedDetails) {
          dispatch(setClubDetails({ clubId, data: cachedDetails }));
          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedDetails);
        } else {
          callback && callback(false, apiError);
        }

        dispatch(setLoading(false));
      }
    } else {
      // Offline - load from cache
      const cachedDetails = await ClubDB.getClubDetails(clubId);

      if (cachedDetails) {
        dispatch(setClubDetails({ clubId, data: cachedDetails }));
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedDetails);
      } else {
        callback && callback(false, 'No cached data available');
      }

      dispatch(setLoading(false));
    }
  } catch (err) {
    dispatch(setError(err));
    dispatch(setLoading(false));
    callback && callback(false, err);
  }
};

export const fetchClubMembers = (clubId, callback) => async dispatch => {
  dispatch(setLoading(true));
  try {
    const isOnline = await checkConnectivity();

    if (isOnline) {
      try {
        const res = await ClubApi.getAllclubsmemebers(clubId);
        const data = JSON.parse(res);
        const latestTen = data.slice(0, 10);
        await ClubDB.bulkInsertClubMembers(clubId, latestTen);
        dispatch(setClubMembers({ clubId, data }));
        dispatch(setLoading(false));
        dispatch(setOfflineStatus(false));
        callback && callback(true, data);
      } catch (apiError) {
        const cachedMembers = await ClubDB.getClubMembers(clubId);
        dispatch(setClubMembers({ clubId, data: cachedMembers }));
        dispatch(setLoading(false));
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedMembers);
      }
    } else {
      const cachedMembers = await ClubDB.getClubMembers(clubId);
      dispatch(setClubMembers({ clubId, data: cachedMembers }));
      dispatch(setLoading(false));
      dispatch(setOfflineStatus(true));
      callback && callback(true, cachedMembers);
    }
  } catch (err) {
    dispatch(setError(err));
    dispatch(setLoading(false));
    callback && callback(false, err);
  }
};

export const fetchClubGallery = (clubId, callback) => async dispatch => {
  try {
    const isOnline = await checkConnectivity();

    if (isOnline) {
      try {
        const res = await ClubApi.getAllclubgallery(clubId);
        const imagepath = JSON.parse(res);
        const latestTen = imagepath.slice(0, 10);
        await ClubDB.bulkInsertClubGallery(clubId, latestTen);
        dispatch(setClubGallery({ clubId, data: imagepath }));
        dispatch(setOfflineStatus(false));
        callback && callback(true, imagepath);
      } catch (apiError) {
        const cachedGallery = await ClubDB.getClubGallery(clubId);
        dispatch(setClubGallery({ clubId, data: cachedGallery }));
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedGallery);
      }
    } else {
      const cachedGallery = await ClubDB.getClubGallery(clubId);
      dispatch(setClubGallery({ clubId, data: cachedGallery }));
      dispatch(setOfflineStatus(true));
      callback && callback(true, cachedGallery);
    }
  } catch (err) {
    dispatch(setError(err));
    callback && callback(false, err);
  }
};

export const fetchClubActiveMembers = (clubId, callback) => async dispatch => {
  try {
    const isOnline = await checkConnectivity();

    if (isOnline) {
      try {
        const res = await ClubApi.getAllclubsActivememebers('', clubId);
        const data = res ? JSON.parse(res) : [];

        await ClubDB.bulkInsertClubMembers(clubId, data);

        dispatch(setClubActiveMembers({ clubId, data }));
        dispatch(setOfflineStatus(false));
        callback && callback(true, data);
      } catch (apiError) {
        const cachedMembers = await ClubDB.getClubMembers(clubId);
        const activeMembers = cachedMembers.filter(m => m.status === 'Active');

        dispatch(setClubActiveMembers({ clubId, data: activeMembers }));
        dispatch(setOfflineStatus(true));
        callback && callback(true, activeMembers);
      }
    } else {
      const cachedMembers = await ClubDB.getClubMembers(clubId);
      const activeMembers = cachedMembers.filter(m => m.status === 'Active');

      dispatch(setClubActiveMembers({ clubId, data: activeMembers }));
      dispatch(setOfflineStatus(true));
      callback && callback(true, activeMembers);
    }
  } catch (err) {
    dispatch(setError(err));
    callback && callback(false, err);
  }
};

export const fetchClubForum =
  (clubId, page = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const isOnline = await checkConnectivity();

      if (isOnline) {
        try {
          const res = await ClubApi.getAllclubforum(clubId, page, perPage);
          const data = res ? JSON.parse(res) : [];
          if (page === 1) {
            await ClubDB.bulkInsertClubForum(clubId, data, page);
          }

          if (page === 1) {
            dispatch(setClubForum({ clubId, data }));
          } else {
            dispatch(addMoreClubForum({ clubId, data }));
          }

          dispatch(setOfflineStatus(false));
          callback && callback(true, data);
        } catch (apiError) {
          const cachedForum = await ClubDB.getClubForum(clubId, page, perPage);
          if (page === 1) {
            dispatch(setClubForum({ clubId, data: cachedForum }));
          } else {
            dispatch(addMoreClubForum({ clubId, data: cachedForum }));
          }

          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedForum);
        }
      } else {
        const cachedForum = await ClubDB.getClubForum(clubId, page, perPage);
        if (page === 1) {
          dispatch(setClubForum({ clubId, data: cachedForum }));
        } else {
          dispatch(addMoreClubForum({ clubId, data: cachedForum }));
        }

        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedForum);
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

export const createClubForumPost =
  (clubId, postData, images = [], callback) =>
  async (dispatch, getState) => {
    try {
      const isOnline = await checkConnectivity();
      const user = getState().auth.user;

      const tempId = `temp_${Date.now()}`;

      const tempPost = {
        id: tempId,
        clubId,
        title: postData.title,
        description: postData.description,
        postImages: images.map((img, i) => ({
          id: `${tempId}_img_${i}`,
          imageUrl: img.uri,
          thumbnailImageUrl: img.uri,
          _isPending: true,
        })),
        likeCount: 0,
        commentCount: 0,
        isLike: false,
        postUser: user,
        createdAt: new Date().toISOString(),
        _isPending: true,
      };
      dispatch(prependClubForum({ clubId, data: [tempPost] }));
      await ClubDB.insertClubForum(clubId, tempPost);
      if (!isOnline) {
        await ClubDB.addClubPendingAction({
          actionType: 'create_forum',
          clubId,
          userId: user?.id,
          targetId: tempId,
          payload: {
            postData,
            images: images.map(img => ({
              uri: img.uri,
              type: img.type || 'image/jpeg',
              name: img.name || `forum_${Date.now()}.jpg`,
            })),
          },
        });

        dispatch(setOfflineStatus(true));
        return callback?.(true, tempPost, 'Post will be uploaded when online');
      }
      const param = {
        id: 0,
        Title: postData.title,
        Description: postData.description,
        ClubId: clubId,
      };
      const created = await ClubApi.createclubforum(param);
      if (images?.length > 0) {
        const imageData = new FormData();
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          imageData.append(i, item);
        }
        const imageRes = await ClubApi.postImage(created.id, imageData);
      }

      const finalPost = {
        ...tempPost,
        id: created.id,
        _isPending: false,
      };

      await ClubDB.deleteClubForum(clubId, tempId);
      await ClubDB.insertClubForum(clubId, finalPost);

      dispatch(removeClubForumPost({ clubId, postId: tempId }));
      dispatch(prependClubForum({ clubId, data: [finalPost] }));

      callback?.(true, finalPost);
    } catch (e) {
      // await ClubDB.addClubPendingAction({
      //   actionType: 'create_forum',
      //   clubId,
      //   userId: user?.id,
      // targetId: tempId,
      //   payload: {
      //     postData,
      //     images: images.map(img => ({
      //       uri: img.uri,
      //       type: img.type || 'image/jpeg',
      //       name: img.name || `forum_${Date.now()}.jpg`,
      //     })),
      //   },
      // });
      callback?.(false, null, e.message);
    }
  };

export const updateClubForumPostThunk =
  (clubId, postId, updates, removedImageIds = [], newImages = [], callback) =>
  async dispatch => {
    try {
      const isOnline = await checkConnectivity();
      await ClubDB.updateClubForum(postId, updates);
      dispatch(
        updateClubForumPost({
          clubId,
          post: { id: postId, ...updates },
        }),
      );

      if (!isOnline) {
        await ClubDB.addClubPendingAction({
          actionType: 'update_forum',
          clubId,
          userId: user?.id,
          targetId: postId,
          payload: {
            updates,
            removedImageIds,
            newImages: newImages,
          },
        });

        dispatch(setOfflineStatus(true));
        return callback?.(true, 'Will sync when online');
      }

      if (removedImageIds.length > 0) {
        await ClubApi.removeImage({ idList: removedImageIds });
      }

      await ClubApi.updateclubforum({
        id: postId,
        Title: updates.title,
        Description: updates.description,
        ClubId: clubId,
      });

      if (newImages?.length > 0) {
        const imageData = new FormData();
        for (let i = 0; i < newImages.length; i++) {
          const item = newImages[i];
          imageData.append(i, item);
        }
        const imageRes = await ClubApi.postImage(postId, imageData);
      }

      dispatch(setOfflineStatus(false));
      callback?.(true, 'Post updated');
    } catch (e) {
      callback?.(false, e.message);
    }
  };

export const deleteClubForumPost =
  (clubId, postId, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();

      dispatch(removeClubForumPost({ clubId, postId }));
      await ClubDB.deleteClubForum(clubId, postId);

      if (!isOnline) {
        await ClubDB.addClubPendingAction({
          actionType: 'delete_forum',
          clubId,
          targetId: postId,
        });
        dispatch(setOfflineStatus(true));
        return callback?.(true, 'Will sync later');
      }

      await ClubApi.fourmDelete(postId);
      dispatch(setOfflineStatus(false));
      callback?.(true);
    } catch (e) {
      callback?.(false, e.message);
    }
  };

export const toggleClubForumLike =
  (clubId, postId, isLiked) => async dispatch => {
    const newState = !isLiked;
    const delta = newState ? 1 : -1;
    const updatedPost = await ClubDB.updateClubForumLike(
      clubId,
      postId,
      newState,
    );

    await ForumDB.updatePostLikepostDetail(postId, newState, delta);

    if (updatedPost) {
      dispatch(
        updateClubForumPost({
          clubId,
          post: updatedPost,
        }),
      );
    }

    const isOnline = await checkConnectivity();
    if (!isOnline) {
      await ClubDB.addClubPendingAction({
        actionType: 'toggle_forum_like',
        clubId,
        targetId: postId,
        payload: { like: newState },
      });
      dispatch(setOfflineStatus(true));
      return;
    }

    // 3️⃣ API call
    try {
      if (newState) {
        await ClubApi.forumLike(postId, clubId);
      } else {
        await ClubApi.forumDisLike(postId);
      }
      dispatch(setOfflineStatus(false));
    } catch (e) {
      // ❗ API failed → retry later
      await ClubDB.addClubPendingAction({
        actionType: 'toggle_forum_like',
        clubId,
        targetId: postId,
        payload: { like: newState },
      });
      dispatch(setOfflineStatus(true));
    }
  };

export const fetchClubTrips =
  (clubId, page = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const isOnline = await checkConnectivity();

      if (isOnline) {
        try {
          const res = await ClubApi.getAllclubtrip(clubId, page, perPage);
          const data = res ? JSON.parse(res) : [];

          // Save to local database
          if (page == 1) {
            await ClubDB.bulkInsertClubTrips(clubId, data, page);
          }

          if (page === 1) {
            dispatch(setClubTrips({ clubId, data }));
          } else {
            dispatch(addMoreClubTrips({ clubId, data }));
          }

          dispatch(setOfflineStatus(false));
          callback && callback(true, data);
        } catch (apiError) {
          const cachedTrips = await ClubDB.getClubTrips(clubId, page, perPage);

          if (page === 1) {
            dispatch(setClubTrips({ clubId, data: cachedTrips }));
          } else {
            dispatch(addMoreClubTrips({ clubId, data: cachedTrips }));
          }

          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedTrips);
        }
      } else {
        const cachedTrips = await ClubDB.getClubTrips(clubId, page, perPage);

        if (page === 1) {
          dispatch(setClubTrips({ clubId, data: cachedTrips }));
        } else {
          dispatch(addMoreClubTrips({ clubId, data: cachedTrips }));
        }

        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedTrips);
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

export const fetchClubReports =
  (clubId, page = 1, perPage = 10, callback) =>
  async dispatch => {
    try {
      const isOnline = await checkConnectivity();

      if (isOnline) {
        try {
          const res = await ClubApi.getAllclubtripreport(clubId, page, perPage);
          const data = res ? JSON.parse(res) : [];
          if (page === 1) {
            await ClubDB.bulkInsertClubTripReports(clubId, data, page);
          }

          if (page === 1) {
            dispatch(setClubReports({ clubId, data }));
          } else {
            dispatch(addMoreClubReports({ clubId, data }));
          }

          dispatch(setOfflineStatus(false));
          callback && callback(true, data);
        } catch (apiError) {
          const cachedReports = await ClubDB.getClubTripReports(
            clubId,
            page,
            perPage,
          );

          if (page === 1) {
            dispatch(setClubReports({ clubId, data: cachedReports }));
          } else {
            dispatch(addMoreClubReports({ clubId, data: cachedReports }));
          }

          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedReports);
        }
      } else {
        const cachedReports = await ClubDB.getClubTripReports(
          clubId,
          page,
          perPage,
        );

        if (page === 1) {
          dispatch(setClubReports({ clubId, data: cachedReports }));
        } else {
          dispatch(addMoreClubReports({ clubId, data: cachedReports }));
        }

        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedReports);
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

export const joinClub = (clubId, callback) => async (dispatch, getState) => {
  try {
    const userId = getState().auth.user?.id;
    const isOnline = await checkConnectivity();
    await ClubDB.updateClubStatus(clubId, 'Pending');
    dispatch(updateClubStatus({ clubId, status: 'Pending' }));

    if (isOnline) {
      try {
        const res = await ClubApi.getJoinclubs(clubId);
        const response = JSON.parse(res);

        if (response?.responseStatus === true) {
          dispatch(setOfflineStatus(false));
          callback &&
            callback(
              true,
              'Your request to join this club has been successfully sent',
            );
        } else {
          // Revert on failure
          await ClubDB.updateClubStatus(clubId, '');
          dispatch(updateClubStatus({ clubId, status: '' }));
          callback && callback(false, 'Failed to join club');
        }
      } catch (apiError) {
        await ClubDB.addClubPendingAction({
          actionType: 'join_club',
          clubId,
          userId,
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Join request will be sent when online');
      }
    } else {
      // Offline - add to pending actions
      await ClubDB.addClubPendingAction({
        actionType: 'join_club',
        clubId,
        userId,
      });

      dispatch(setOfflineStatus(true));
      callback && callback(true, 'Join request will be sent when online');
    }
  } catch (err) {
    dispatch(setError(err));
    callback && callback(false, err);
  }
};

export const acceptClubInvitation =
  (clubId, memberId, callback) => async (dispatch, getState) => {
    try {
      const userId = getState().auth.user?.id;
      const isOnline = await checkConnectivity();

      // Update locally immediately
      await ClubDB.updateClubStatus(clubId, 'Joined');
      await ClubDB.updateClubMemberCount(clubId, 1);

      dispatch(updateClubStatus({ clubId, status: 'Joined' }));
      dispatch(updateClubMemberCount({ clubId, delta: +1 }));

      if (isOnline) {
        try {
          const res = await ClubApi.clubsJoinaccept(clubId, memberId);

          if (res) {
            dispatch(setOfflineStatus(false));
            callback && callback(true, 'Accept successfully');
          } else {
            // Revert on failure
            await ClubDB.updateClubStatus(clubId, 'InvitationSent');
            await ClubDB.updateClubMemberCount(clubId, -1);

            dispatch(updateClubStatus({ clubId, status: 'InvitationSent' }));
            dispatch(updateClubMemberCount({ clubId, delta: -1 }));

            callback && callback(false, 'Failed to accept invitation');
          }
        } catch (apiError) {
          await ClubDB.addClubPendingAction({
            actionType: 'accept_invitation',
            clubId,
            userId,
            targetId: memberId,
          });

          dispatch(setOfflineStatus(true));
          callback && callback(true, 'Acceptance will be synced when online');
        }
      } else {
        // Offline - add to pending actions
        await ClubDB.addClubPendingAction({
          actionType: 'accept_invitation',
          clubId,
          userId,
          targetId: memberId,
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Acceptance will be synced when online');
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

export const rejectClubInvitation =
  (clubId, memberId, callback) => async (dispatch, getState) => {
    try {
      const userId = getState().auth.user?.id;
      const isOnline = await checkConnectivity();

      // Update locally immediately
      await ClubDB.updateClubStatus(clubId, '');
      dispatch(updateClubStatus({ clubId, status: '' }));

      if (isOnline) {
        try {
          const res = await ClubApi.clubsJoindecline(clubId, memberId);

          if (res) {
            dispatch(setOfflineStatus(false));
            callback && callback(true, 'Decline successfully');
          } else {
            callback && callback(false, 'Failed to decline invitation');
          }
        } catch (apiError) {
          await ClubDB.addClubPendingAction({
            actionType: 'reject_invitation',
            clubId,
            userId,
            targetId: memberId,
          });

          dispatch(setOfflineStatus(true));
          callback && callback(true, 'Rejection will be synced when online');
        }
      } else {
        // Offline - add to pending actions
        await ClubDB.addClubPendingAction({
          actionType: 'reject_invitation',
          clubId,
          userId,
          targetId: memberId,
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Rejection will be synced when online');
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

/**
 * Remove Club Member with Offline Support
 */
export const removeClubMember =
  (clubId, memberId, self, callback) => async (dispatch, getState) => {
    try {
      const userId = getState().auth.user?.id;
      const isOnline = await checkConnectivity();

      // Update locally immediately
      await ClubDB.removeClubMember(clubId, memberId);
      await ClubDB.updateClubMemberCount(clubId, -1);
      await ClubDB.updateClubStatus(clubId, '');
      dispatch(updateClubStatus({ clubId, status: '' }));

      dispatch(updateClubMemberCount({ clubId, delta: -1 }));

      // Refresh members list locally
      const updatedMembers = await ClubDB.getClubMembers(clubId);
      dispatch(setClubMembers({ clubId, data: updatedMembers }));

      if (isOnline) {
        try {
          const res = await ClubApi.RemoveClubMember(clubId, memberId, self);

          if (res) {
            dispatch(setOfflineStatus(false));
            callback && callback(true, 'Deleted successfully');
          } else {
            callback && callback(false, 'Failed to remove member');
          }
        } catch (apiError) {
          await ClubDB.addClubPendingAction({
            actionType: 'remove_member',
            clubId,
            userId,
            targetId: memberId,
            payload: { self },
          });

          dispatch(setOfflineStatus(true));
          callback && callback(true, 'Removal will be synced when online');
        }
      } else {
        // Offline - add to pending actions
        await ClubDB.addClubPendingAction({
          actionType: 'remove_member',
          clubId,
          userId,
          targetId: memberId,
          payload: { self },
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Removal will be synced when online');
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

/**
 * Upload Gallery Image with Offline Support
 */
export const uploadGalleryImage =
  (clubId, photo, userId, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();
      const tempImage = {
        id: `temp_${Date.now()}`,
        imageUrl: photo?.uri || '',
        thumbnailImageUrl: photo?.uri || '',
        imageType: 'galleryimage',
        uploadedBy: userId,
        _isPending: true,
      };

      await ClubDB.insertClubGalleryImage(clubId, tempImage);
      dispatch(
        setClubGallery({
          clubId,
          data: await ClubDB.getClubGallery(clubId),
        }),
      );

      if (!isOnline) {
        await ClubDB.addClubPendingAction({
          actionType: 'upload_gallery',
          clubId,
          userId,
          payload: { photo },
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Image will be uploaded when online');
        return;
      }
      const formData = new FormData();
      formData.append(0, {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `club_${Date.now()}.jpg`,
      });

      const res = await ClubApi.postGalleryImage(formData, clubId);

      if (res === true || res === 'true') {
        await ClubDB.deleteClubGalleryImage(clubId, tempImage.id);
        dispatch(fetchClubGallery(clubId));
        dispatch(setOfflineStatus(false));

        callback && callback(true, 'Image uploaded successfully');
      } else {
        callback && callback(false, 'Failed to upload image');
      }
    } catch (err) {
      callback && callback(false, 'Upload failed');
    }
  };

export const deleteGalleryImage =
  (clubId, targetId, targetType, callback) => async (dispatch, getState) => {
    try {
      const userId = getState().auth.user?.id;
      const isOnline = await checkConnectivity();

      await ClubDB.deleteClubGalleryImage(clubId, targetId);

      dispatch(
        setClubGallery({
          clubId,
          data: await ClubDB.getClubGallery(clubId),
        }),
      );

      if (String(targetId).startsWith('temp_')) {
        callback && callback(true, 'Deleted locally');
        return;
      }

      if (!isOnline) {
        await ClubDB.addClubPendingAction({
          actionType: 'delete_gallery',
          clubId,
          userId,
          targetId,
          payload: { targetType },
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Deletion will be synced when online');
        return;
      }
      const res = await ClubApi.deleteclubgallery(clubId, targetId, targetType);
      if (res?.responseStatus === true || res?.responseStatus === 'true') {
        dispatch(setOfflineStatus(false));
        callback && callback(true, 'Deleted successfully');
      } else {
        dispatch(fetchClubGallery(clubId));
        callback && callback(false, 'Failed to delete image from server');
      }
    } catch (err) {
      dispatch(setError(err));
      callback && callback(false, err);
    }
  };

export const deleteForum = (forumId, clubId) => async (dispatch, getState) => {
  try {
    const userId = getState().auth.user?.id;
    const isOnline = await checkConnectivity();

    // Delete locally immediately
    await ClubDB.deleteClubForum(clubId, forumId);

    // Refresh forum
    const updatedForum = await ClubDB.getClubForum(clubId, 1, 10);
    dispatch(setClubForum({ clubId, data: updatedForum }));

    if (isOnline) {
      try {
        const res = await ClubApi.fourmDelete(forumId);

        dispatch(setOfflineStatus(false));
        return res;
      } catch (apiError) {
        await ClubDB.addClubPendingAction({
          actionType: 'delete_forum',
          clubId,
          userId,
          targetId: forumId,
        });

        dispatch(setOfflineStatus(true));
        return true;
      }
    } else {
      // Offline - add to pending actions
      await ClubDB.addClubPendingAction({
        actionType: 'delete_forum',
        clubId,
        userId,
        targetId: forumId,
      });

      dispatch(setOfflineStatus(true));
      return true;
    }
  } catch (err) {
    dispatch(setError(err));
    return null;
  }
};

export const rejectClubTrip = (id, clubId) => async (dispatch, getState) => {
  try {
    const userId = getState().auth.user?.id;
    const isOnline = await checkConnectivity();

    if (isOnline) {
      try {
        const res = await ClubApi.ClubTripReject(id);

        dispatch(setOfflineStatus(false));
        return res;
      } catch (apiError) {
        await ClubDB.addClubPendingAction({
          actionType: 'reject_trip',
          clubId,
          userId,
          targetId: id,
        });

        dispatch(setOfflineStatus(true));
        return true;
      }
    } else {
      // Offline - add to pending actions
      await ClubDB.addClubPendingAction({
        actionType: 'reject_trip',
        clubId,
        userId,
        targetId: id,
      });

      dispatch(setOfflineStatus(true));
      return true;
    }
  } catch (err) {
    dispatch(setError(err));
    return null;
  }
};

export const createClub =
  (clubData, imageFile, callback) => async (dispatch, getState) => {
    try {
      const isOnline = await checkConnectivity();
      const user = getState().auth.user;

      if (!isOnline) {
        callback && callback(false, 'Internet connection required');
        return;
      }
      const res = await ClubApi.createClub(clubData);

      if (!res?.id) {
        callback && callback(false, 'Failed to create club');
        return;
      }
      const clubId = res.id;
      if (imageFile) {
        const formData = new FormData();
        formData.append(0, imageFile);
        try {
          await ClubApi.postImageClubs(clubId, formData);
        } catch (imgErr) {}
      }
      const createdClub = {
        ...res,
        organizerId: user?.id,
        organizerName: user?.name || '',
        sync_status: 'synced',
      };

      await ClubDB.insertMyClub(createdClub, user?.id);
      dispatch(addMoreMyClubs([createdClub]));
      dispatch(setOfflineStatus(false));
      callback && callback(true, 'Club created successfully');
    } catch (error) {
      callback && callback(false, 'Something went wrong');
    }
  };

export const updateClubThunk =
  (clubId, clubData, imageFile, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();

      if (!isOnline) {
        callback && callback(false, 'Internet connection required');
        return;
      }
      const res = await ClubApi.updateClub(clubData);

      if (!res?.id) {
        callback && callback(false, 'Failed to update club');
        return;
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append(0, imageFile);

        try {
          await ClubApi.postImageClubs(res?.id, formData);
        } catch (imgErr) {}
      }

      await ClubDB.updateClub(clubId, {
        ...clubData,
        sync_status: 'synced',
      });

      dispatch(
        updateClub({
          clubId,
          data: { ...clubData, sync_status: 'synced' },
        }),
      );

      dispatch(setOfflineStatus(false));
      callback && callback(true, 'Club updated successfully');
    } catch (error) {
      callback && callback(false, 'Something went wrong');
    }
  };

export const syncPendingClubActions = callback => async dispatch => {
  try {
    const isOnline = await checkConnectivity();
    if (!isOnline) {
      callback?.(false, 'No internet connection');
      return;
    }

    const pendingActions = await ClubDB.getClubPendingActions();
    if (!pendingActions.length) {
      callback?.(true, 'No pending actions');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const action of pendingActions) {
      try {
        switch (action.actionType) {
          case 'join_club':
            await ClubApi.getJoinclubs(action.clubId);
            break;

          case 'accept_invitation':
            await ClubApi.clubsJoinaccept(action.clubId, action.targetId);
            break;

          case 'reject_invitation':
            await ClubApi.clubsJoindecline(action.clubId, action.targetId);
            break;

          case 'remove_member':
            await ClubApi.RemoveClubMember(
              action.clubId,
              action.targetId,
              action.payload?.self,
            );
            break;

          case 'upload_gallery': {
            const { photo } = action.payload || {};
            if (photo) {
              const imageData = new FormData();
              imageData.append(0, photo);
              await ClubApi.postGalleryImage(imageData, action.clubId);
            }
            break;
          }

          case 'delete_gallery':
            await ClubApi.deleteclubgallery(
              action.clubId,
              action.targetId,
              action.payload?.targetType,
            );
            break;

          case 'delete_forum':
            await ClubApi.fourmDelete(action.targetId);
            break;

          case 'reject_trip':
            await ClubApi.ClubTripReject(action.targetId);
            break;

          default:
            continue;
        }

        await ClubDB.markClubActionCompleted(action.id);
        successCount++;
      } catch (error) {
        if (action.retryCount >= 3) {
          await ClubDB.markClubActionFailed(action.id);
        } else {
          await ClubDB.incrementClubActionRetry(action.id);
        }

        failCount++;
      }
    }

    callback?.(true, `Synced ${successCount} actions, ${failCount} failed`);
  } catch (error) {
    callback?.(false, error.message);
  }
};

export const syncPendingClubForumActions = () => async dispatch => {
  const isOnline = await checkConnectivity();
  if (!isOnline) return;

  const actions = await ClubDB.getClubPendingActions();

  for (const a of actions) {
    try {
      switch (a.actionType) {
        case 'toggle_forum_like': {
          const isLike = a.payload?.isLike === true;

          isLike
            ? await ClubApi.forumLike(a.targetId, a.clubId)
            : await ClubApi.forumDisLike(a.targetId);
          break;
        }

        case 'create_forum': {
          const { postData, images } = a.payload;

          const created = await ClubApi.createclubforum({
            id: 0,
            Title: postData.title,
            Description: postData.description,
            ClubId: a.clubId,
          });

          if (images?.length) {
            const imageData = new FormData();
            images.forEach((img, i) => imageData.append(i, img));
            await ClubApi.postImage(created.id, imageData);
          }

          ClubDB.replaceTempForumPost(a.targetId, created.id);
          break;
        }

        case 'update_forum': {
          const { updates, removedImageIds, newImages } = a.payload;

          if (removedImageIds?.length) {
            await ClubApi.removeImage({ idList: removedImageIds });
          }

          await ClubApi.updateclubforum({
            id: a.targetId,
            Title: updates.title,
            Description: updates.description,
            ClubId: a.clubId,
          });

          if (newImages?.length) {
            const imageData = new FormData();
            newImages.forEach((img, i) => imageData.append(i, img));
            await ClubApi.postImage(a.targetId, imageData);
          }
          break;
        }
      }

      await ClubDB.markClubActionCompleted(a.id);
    } catch (e) {
      if (a.retryCount >= 5) {
        await ClubDB.markClubActionFailed(a.id);
      } else {
        await ClubDB.incrementClubActionRetry(a.id);
      }
    }
  }
};

export const EMPTY_ARRAY = [];

export const selectClubForumByClubId = (state, clubId) =>
  state.club.clubForum[clubId] ?? EMPTY_ARRAY;

export const selectClubTripsByClubId = (state, clubId) =>
  state.club.clubTrips[clubId] ?? EMPTY_ARRAY;

export const selectClubReportsByClubId = (state, clubId) =>
  state.club.clubReports[clubId] ?? EMPTY_ARRAY;

export const makeSelectClubForum = () =>
  createSelector(
    [(state, clubId) => selectClubForumByClubId(state, clubId)],
    forum => forum,
  );

export const makeSelectClubTrips = () =>
  createSelector(
    [(state, clubId) => selectClubTripsByClubId(state, clubId)],
    trips => trips,
  );

export const makeSelectClubReports = () =>
  createSelector(
    [(state, clubId) => selectClubReportsByClubId(state, clubId)],
    reports => reports,
  );

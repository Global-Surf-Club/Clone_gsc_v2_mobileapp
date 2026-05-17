// store/forumSlice.js - Complete Offline-First Implementation
import { createSlice } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import Forum from '../api/Forum';
import * as ForumDB from '../database/forumDbHelper';
import ClubApi from '../api/ClubApi';
import syncService from '../services/syncService';

const initialState = {
  data: [],
  isOffline: false,
  lastSync: null,
};

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setForum(state, action) {
      state.data = action.payload;
    },
    addMoreForum(state, action) {
      state.data = [...state.data, ...action.payload];
    },
    addMoreForumTop(state, action) {
      state.data = [...action.payload, ...state.data];
    },
    updateForumPost(state, action) {
      const updatedPost = action.payload;
      const index = state.data.findIndex(post => post.id === updatedPost.id);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...updatedPost };
      }
    },
    removeForumPost(state, action) {
      state.data = state.data.filter(post => post.id !== action.payload);
    },
    setOfflineStatus(state, action) {
      state.isOffline = action.payload;
    },
    setLastSync(state, action) {
      state.lastSync = action.payload;
    },
    clearForum(state) {
      return initialState;
    },
  },
});

export const {
  setForum,
  addMoreForum,
  addMoreForumTop,
  updateForumPost,
  removeForumPost,
  setOfflineStatus,
  setLastSync,
  clearForum,
} = forumSlice.actions;

export default forumSlice.reducer;

// ==================== HELPER FUNCTIONS ====================

const checkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

export const getForums =
  (pageNo, isTop, isFirst, isBottom, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();
      if (isOnline) {
        try {
          const data = JSON.parse(await Forum.getPosts(pageNo, 10));
          if (pageNo == 1) {
            await ForumDB.bulkInsertForumPosts(data, pageNo);
          }
          if (isFirst) {
            dispatch(setForum(data));
          } else if (isTop) {
            dispatch(addMoreForumTop(data));
          } else if (isBottom) {
            dispatch(addMoreForum(data));
          } else {
            dispatch(setForum(data));
          }
          dispatch(setOfflineStatus(false));
          dispatch(setLastSync(new Date().toISOString()));
          callback && callback(true, data?.length !== 10);
        } catch (apiError) {
          const cachedPosts = await ForumDB.getForumPosts(pageNo, 10);
          if (isFirst) {
            dispatch(setForum(cachedPosts));
          } else if (isTop) {
            dispatch(addMoreForumTop(cachedPosts));
          } else if (isBottom) {
            dispatch(addMoreForum(cachedPosts));
          } else {
            dispatch(setForum(cachedPosts));
          }

          dispatch(setOfflineStatus(true));
          callback && callback(true, cachedPosts?.length !== 10);
        }
      } else {
        const cachedPosts = await ForumDB.getForumPosts(pageNo, 10);
        if (isFirst) {
          dispatch(setForum(cachedPosts));
        } else if (isTop) {
          dispatch(addMoreForumTop(cachedPosts));
        } else if (isBottom) {
          dispatch(addMoreForum(cachedPosts));
        } else {
          dispatch(setForum(cachedPosts));
        }
        dispatch(setOfflineStatus(true));
        callback && callback(true, cachedPosts?.length !== 10);
      }
    } catch (error) {
      callback && callback(false, error);
    }
  };

export const createForumPost =
  (postData, images = [], callback) =>
  async (dispatch, getState) => {
    try {
      const isOnline = await checkConnectivity();
      const user = getState().auth.user;
      const tempId = `temp_${Date.now()}`;
      const tempPost = {
        id: tempId,
        userId: user?.id,
        title: postData.title,
        description: postData.description,
        postImages: images.map((img, index) => ({
          id: `${tempId}_img_${index}`,
          imageUrl: img.uri,
          thumbnailImageUrl: img.uri,
        })),
        commentCount: 0,
        likeCount: 0,
        isLike: false,
        createdAt: new Date().toISOString(),
        postUser: user,
        _isPending: true,
      };

      dispatch(addMoreForumTop([tempPost]));
      await ForumDB.insertForumPost(tempPost);

      if (!isOnline) {
        await ForumDB.addPendingForumAction({
          actionType: 'create',
          postId: tempId,
          ...tempPost,
          imagesData: images,
        });

        dispatch(setOfflineStatus(true));
        callback?.(true, tempPost, 'Post will be synced when online');
        return;
      }

      const createdPost = await Forum.createPost({
        id: 0,
        title: postData.title,
        description: postData.description,
      });
      let UpdatePost = {};
      if (images.length > 0) {
        const imageData = new FormData();
        images.forEach((img, i) => imageData.append(`image_${i}`, img));
        await Forum.postImage(createdPost.id, imageData);
        UpdatePost = {
          ...tempPost,
          id: createdPost.id,
          _isPending: false,
        };
      }

      const updatedPost = {
        ...tempPost,
        id: createdPost.id,
        _isPending: false,
      };

      await ForumDB.deleteForumPost(tempId);
      await ForumDB.insertForumPost(updatedPost);

      dispatch(setOfflineStatus(false));

      callback?.(true, updatedPost);
    } catch (error) {
      callback?.(false, null, error.message);
    }
  };

export const updateForumPostThunk =
  (postId, updates, removedImageIds, newImages, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();
      await ForumDB.updateForumPost(postId, updates);
      dispatch(updateForumPost({ id: postId, ...updates }));

      if (isOnline) {
        try {
          if (removedImageIds && removedImageIds.length > 0) {
            const ClubsAPi = require('../api/ClubApi').default;
            await ClubsAPi.removeImage({ idList: removedImageIds });
            for (const imageId of removedImageIds) {
              await ForumDB.deleteForumPostImage(imageId);
            }
          }

          const param = {
            id: postId,
            Title: updates.title,
            Description: updates.description,
            ClubId: -999,
          };

          const ClubsAPi = require('../api/ClubApi').default;
          await ClubsAPi.updateclubforum(param);
          if (newImages && newImages.length > 0) {
            const imageData = new FormData();
            for (let i = 0; i < newImages.length; i++) {
              imageData.append(i, newImages[i]);
            }
            await ClubsAPi.postImage(postId, imageData);
          }

          dispatch(setOfflineStatus(false));
          callback && callback(true, 'Post updated successfully');
        } catch (apiError) {
          await ForumDB.addPendingForumAction({
            actionType: 'update',
            postId,
            userId: updates.userId,
            title: updates.title,
            description: updates.description,
            imagesData: { removedImageIds, newImages },
          });

          dispatch(setOfflineStatus(true));
          callback && callback(true, 'Post will be synced when online');
        }
      } else {
        await ForumDB.addPendingForumAction({
          actionType: 'update',
          postId,
          userId: updates.userId,
          title: updates.title,
          description: updates.description,
          imagesData: { removedImageIds, newImages },
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Post will be synced when online');
      }
    } catch (error) {
      callback && callback(false, error.message);
    }
  };

export const deleteForumPostThunk = (postId, callback) => async dispatch => {
  try {
    const isOnline = await checkConnectivity();

    // Remove from Redux immediately
    dispatch(removeForumPost(postId));

    // Remove from local database
    await ForumDB.deleteForumPost(postId);

    if (isOnline) {
      try {
        // Delete on server
        await Forum.deletePost(postId);

        dispatch(setOfflineStatus(false));
        callback && callback(true);
      } catch (apiError) {
        await ForumDB.addPendingForumAction({
          actionType: 'delete',
          postId,
          userId: null,
        });

        dispatch(setOfflineStatus(true));
        callback && callback(true, 'Deletion will be synced when online');
      }
    } else {
      // Offline: Add to pending actions
      await ForumDB.addPendingForumAction({
        actionType: 'delete',
        postId,
        userId: null,
      });

      dispatch(setOfflineStatus(true));
      callback && callback(true, 'Deletion will be synced when online');
    }
  } catch (error) {
    callback && callback(false, error.message);
  }
};

export const toggleForumPostLike =
  (postId, currentlyLiked, callback) => async dispatch => {
    try {
      const isOnline = await checkConnectivity();
      const newLikedState = !currentlyLiked;
      const delta = newLikedState ? 1 : -1;
      await ForumDB.updatePostLike(postId, newLikedState, delta);
      await ForumDB.updatePostLikepostDetail(postId, newLikedState, delta);

      const updatedPost = await ForumDB.getForumPost(postId);
      if (updatedPost) {
        dispatch(updateForumPost(updatedPost));
      }

      if (isOnline) {
        try {
          if (newLikedState) {
            await ClubApi.forumLike(postId, '-999');
          } else {
            await ClubApi.forumDisLike(postId);
          }

          dispatch(setOfflineStatus(false));
          callback && callback(true);
        } catch (apiError) {
          await ForumDB.addPendingForumAction({
            actionType: 'like',
            postId,
            title: newLikedState == true ? 'like' : 'unlike',
          });
          dispatch(setOfflineStatus(true));
          callback && callback(true);
        }
      } else {
        await ForumDB.addPendingForumAction({
          actionType: 'like',
          postId,
          title: newLikedState == true ? 'like' : 'unlike',
        });
        dispatch(setOfflineStatus(true));
        callback && callback(true);
      }
    } catch (error) {
      callback && callback(false, error.message);
    }
  };

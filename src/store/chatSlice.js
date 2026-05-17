// src/store/chatSlice.js
import { createSlice } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import Auth from '../api/Auth';

// Import Chat DB Helpers
import {
  savePersonalChatMessages,
  getPersonalChatMessagesFromDB,
  addOptimisticChatMessage,
  removeOptimisticChatMessage,
  updateChatMessageStatus,
  clearChatConversation,
  getChatConversationsFromDB,
  savePendingChatAction,
  getPendingChatActions,
  deletePendingChatAction,
  updatePendingChatActionStatus,
} from '../database/chatDbHelper';
import { onNewChatMessageThunk } from './profileSlice';

const initialState = {
  personalChats: {},
  activeChats: [],
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },

    setSyncStatus(state, action) {
      state.isSyncing = action.payload;
    },

    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },

    setPersonalChat(state, action) {
      const { chatId, messages } = action.payload;
      state.personalChats[chatId] = {
        messages,
        lastSync: new Date().toISOString(),
      };
    },

    addOptimisticMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.personalChats[chatId]) {
        state.personalChats[chatId] = { messages: [], lastSync: null };
      }
      state.personalChats[chatId].messages.push(message);
    },

    removeOptimisticMessage(state, action) {
      const { chatId, messageId } = action.payload;
      if (state.personalChats[chatId]) {
        state.personalChats[chatId].messages = state.personalChats[
          chatId
        ].messages.filter(msg => msg.id !== messageId);
      }
    },

    updateMessageStatus(state, action) {
      const { chatId, messageId, status } = action.payload;
      if (state.personalChats[chatId]) {
        const message = state.personalChats[chatId].messages.find(
          m => m.id === messageId,
        );
        if (message) {
          message.isPending = status === 'pending';
          message.isFailed = status === 'failed';
        }
      }
    },

    setActiveChats(state, action) {
      state.activeChats = action.payload;
    },

    addActiveChat(state, action) {
      const chat = action.payload;
      const existingIndex = state.activeChats.findIndex(
        c => c.chatId === chat.chatId,
      );
      if (existingIndex >= 0) {
        state.activeChats[existingIndex] = chat;
      } else {
        state.activeChats.unshift(chat);
      }
    },

    updateUnreadCount(state, action) {
      const { chatId, count } = action.payload;
      state.unreadCounts[chatId] = count;
    },

    clearUnreadCount(state, action) {
      const chatId = action.payload;
      state.unreadCounts[chatId] = 0;
    },

    clearChatState(state) {
      return initialState;
    },
  },
});

export const {
  setOnlineStatus,
  setSyncStatus,
  setLastSyncTime,
  setPersonalChat,
  addOptimisticMessage,
  removeOptimisticMessage,
  updateMessageStatus,
  setActiveChats,
  addActiveChat,
  updateUnreadCount,
  clearUnreadCount,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

const checkNetworkAndFetch = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

export const initializeChatNetworkListener = () => async dispatch => {
  NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable;
    dispatch(setOnlineStatus(isOnline));
    if (isOnline) {
      dispatch(syncPendingChatActions());
    }
  });
};

export const prefetchChatsForConversations =
  (userId, conversations) => async dispatch => {
    try {
      const isOnline = await checkNetworkAndFetch();

      const tasks = conversations.map(async conv => {
        const oppUserId = conv?.id || conv?.user?.id || conv?.oppUserId;
        if (!oppUserId) return;

        const chatId = `${userId}-${oppUserId}`;

        if (isOnline) {
          try {
            const resp = await Auth.getChatWithMembers(oppUserId, userId);
            const data = typeof resp === 'string' ? JSON.parse(resp) : resp;

            const sorted = [...data].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );

            const latest50 = sorted.slice(0, 50);

            await savePersonalChatMessages(chatId, latest50);

            dispatch(
              setPersonalChat({
                chatId,
                messages: latest50,
              }),
            );
          } catch (err) {
            const local = await getPersonalChatMessagesFromDB(chatId, 50);
            dispatch(setPersonalChat({ chatId, messages: local || [] }));
          }
        } else {
          const local = await getPersonalChatMessagesFromDB(chatId, 50);
          dispatch(setPersonalChat({ chatId, messages: local || [] }));
        }
      });

      await Promise.all(tasks);
    } catch (error) {}
  };

export const getChatMessages =
  (oppUserId, userId, callback) => async dispatch => {
    console.log('userId===>', userId);
    try {
      const isOnline = await checkNetworkAndFetch();
      const chatId = `${userId}-${oppUserId}`;

      if (isOnline) {
        try {
          const resp = await Auth.getChatWithMembers(oppUserId, userId);
          const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
          const sortedChats = [...data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          dispatch(setPersonalChat({ chatId, messages: sortedChats }));
          dispatch(
            onNewChatMessageThunk(
              sortedChats.slice(0, 1)?.length > 0 &&
                sortedChats.slice(0, 1)[0]?.text,
              oppUserId,
            ),
          );
          const latestTen = sortedChats.slice(0, 50);
          await savePersonalChatMessages(chatId, latestTen);
          dispatch(setLastSyncTime(new Date().toISOString()));
          callback?.(true);
        } catch (apiError) {
          const messages = await getPersonalChatMessagesFromDB(chatId);
          dispatch(setPersonalChat({ chatId, messages }));
          callback?.(true);
        }
      } else {
        const messages = await getPersonalChatMessagesFromDB(chatId);
        dispatch(setPersonalChat({ chatId, messages }));
        callback?.(true);
      }
    } catch (error) {
      // Final fallback
      const chatId = `${userId}-${oppUserId}`;
      const messages = await getPersonalChatMessagesFromDB(chatId);
      dispatch(setPersonalChat({ chatId, messages }));
      callback?.(messages.length > 0);
    }
  };

// Send message
export const sendMessage =
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

      dispatch(addOptimisticMessage({ chatId, message: optimisticMessage }));
      await addOptimisticChatMessage(chatId, optimisticMessage);
      if (isOnline) {
        try {
          const data = { userId: oppUserId, text: messageText };
          await Auth.sendMessage(data);
          dispatch(
            removeOptimisticMessage({
              chatId,
              messageId: optimisticMessage.id,
            }),
          );
          await removeOptimisticChatMessage(chatId, optimisticMessage.id);
          dispatch(onNewChatMessageThunk(messageText, oppUserId));
          const resp = await Auth.getChatWithMembers(oppUserId, user?.id);
          const messages = typeof resp === 'string' ? JSON.parse(resp) : resp;
          const sorted = [...messages].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          dispatch(setPersonalChat({ chatId, messages: sorted }));
          await savePersonalChatMessages({ chatId, messages: sorted });
        } catch (apiError) {
          dispatch(
            updateMessageStatus({
              chatId,
              messageId: optimisticMessage.id,
              status: 'pending',
            }),
          );
          await updateChatMessageStatus(optimisticMessage.id, 'pending');

          // Queue for later sync
          await savePendingChatAction({
            actionType: 'SEND_MESSAGE',
            entityId: chatId,
            payload: { userId: oppUserId, text: messageText, user },
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await savePendingChatAction({
          actionType: 'SEND_MESSAGE',
          entityId: chatId,
          payload: { userId: oppUserId, text: messageText, user },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      // Remove failed optimistic update
      dispatch(
        removeOptimisticMessage({ chatId, messageId: optimisticMessage.id }),
      );
      await removeOptimisticChatMessage(chatId, optimisticMessage.id);

      throw error;
    }
  };

// Sync pending chat actions
export const syncPendingChatActions = () => async dispatch => {
  try {
    dispatch(setSyncStatus(true));

    const pendingActions = await getPendingChatActions();
    for (const action of pendingActions) {
      try {
        switch (action.actionType) {
          case 'SEND_MESSAGE':
            await Auth.sendMessage({
              userId: action.payload.userId,
              text: action.payload.text,
            });
            break;

          default:
        }

        // Delete action after successful sync
        await deletePendingChatAction(action.actionId);
      } catch (error) {
        // Increment retry count
        await updatePendingChatActionStatus(
          action.actionId,
          'pending',
          action.retryCount + 1,
          error.message,
        );
      }
    }

    dispatch(setLastSyncTime(new Date().toISOString()));
    dispatch(setSyncStatus(false));
  } catch (error) {
    dispatch(setSyncStatus(false));
  }
};

// Get all active conversations
export const getActiveConversations = userId => async dispatch => {
  try {
    const isOnline = await checkNetworkAndFetch();

    if (isOnline) {
      // TODO: Add API call to get conversations list
      // For now, load from DB
      const conversations = await getChatConversationsFromDB(userId);
      dispatch(setActiveChats(conversations));
    } else {
      const conversations = await getChatConversationsFromDB(userId);
      dispatch(setActiveChats(conversations));
    }
  } catch (error) {}
};

// Clear conversation
export const clearConversation = chatId => async dispatch => {
  try {
    await clearChatConversation(chatId);
    dispatch(setPersonalChat({ chatId, messages: [] }));
  } catch (error) {}
};

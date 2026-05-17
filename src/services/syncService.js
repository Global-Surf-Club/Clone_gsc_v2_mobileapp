import NetInfo from '@react-native-community/netinfo';
import * as sponsorDbHelper from '../database/sponsorDbHelper';
import ClubApi from '../api/ClubApi';
import SponsorApi from '../api/SponsorApi';
import { getDatabase } from '../database/schema';
import * as tripDbHelper from '../database/tripDbHelper';
import * as forumDbHelper from '../database/forumDbHelper';
import * as dbHelper from '../database/eventDbHelper';
import Trip from '../api/Trip';
import Forum from '../api/Forum';
import store from '../store/store';
import {
  syncPendingClubActions,
  syncPendingClubForumActions,
} from '../store/clubSlice';
import { getForums } from '../store/forumSlice';
import Auth from '../api/Auth';
import {
  AddOptimisticComment,
  AddOptimisticReportComment,
  removeOptimisticComment,
  removeOptimisticReportComment,
} from '../store/tripSlice';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.netInfoUnsubscribe = null;
  }

  init() {
    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        this.isSyncing = false;
        return;
      }

      if (state.isConnected && !this.isSyncing) {
        this.startSync();
      }
    });

    this.syncInterval = setInterval(() => {
      this.startSync();
    }, 5 * 60 * 1000);
  }

  stop() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  async startSync() {
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) return;

      await this.syncChatActions();
      await this.ensureOnline();
      await this.syncCacheActions();
      await this.ensureOnline();

      await this.syncMainQueue();
      await this.ensureOnline();

      await this.syncTripActions();
      await this.ensureOnline();

      await this.syncForumActions();
      await this.ensureOnline();

      await this.syncClubActions();
      await this.ensureOnline();

      await this.syncClubForumActions();
    } catch (e) {
    } finally {
      // 🔥 GUARANTEED RELEASE
      this.isSyncing = false;
    }
  }

  async ensureOnline() {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('Network lost');
    }
  }

  async syncCacheActions() {
    try {
      const pendingActions = await this.getPendingCacheActions(100);
      if (pendingActions.length === 0) {
        return;
      }
      const groupedActions = this.groupActionsByType(pendingActions);
      for (const [actionType, actions] of Object.entries(groupedActions)) {
        await this.processCacheActionGroup(actionType, actions);
      }
    } catch (error) {}
  }

  async syncMainQueue() {
    try {
      const pendingItems = await this.getPendingSyncItems(50);

      if (pendingItems.length === 0) {
        return;
      }

      for (const item of pendingItems) {
        try {
          let success = false;

          switch (item.actionType) {
            case 'create_business':
              success = await this.syncCreateBusiness(item);
              break;
            case 'create':
              if (item.module === 'events') {
                success = await this.syncCreateEvent(item);
              }
              break;
            case 'update':
              if (item.module === 'events') {
                success = await this.syncUpdateEvent(item);
              }
              break;
            case 'create_comment':
              if (item.module === 'events') {
                success = await this.syncCreateEventComment(item);
              }
              break;
            case 'update_attendance':
              if (item.module === 'events') {
                success = await this.syncUpdateEventAttendance(item);
              }
              break;

            default:
          }

          if (success) {
            await this.markSyncItemCompleted(item.id);
          } else {
            await this.incrementSyncRetry(item.id);
          }
        } catch (error) {
          await this.incrementSyncRetry(item.id);
        }
      }
    } catch (error) {}
  }

  async syncChatActions() {
    try {
      const chatDbHelper = require('../database/chatDbHelper');
      const pendingActions = await chatDbHelper.getPendingChatActions();
      if (pendingActions.length === 0) {
        return;
      }

      for (const action of pendingActions) {
        try {
          let success = false;

          switch (action.actionType) {
            case 'SEND_MESSAGE':
              success = await this.syncSendMessage(action);
              break;
            default:
          }

          if (success) {
            await chatDbHelper.deletePendingChatAction(action.actionId);
          } else {
            await chatDbHelper.updatePendingChatActionStatus(
              action.actionId,
              'pending',
              action.retryCount + 1,
              'Sync failed',
            );
          }
        } catch (error) {
          await chatDbHelper.updatePendingChatActionStatus(
            action.actionId,
            'pending',
            action.retryCount + 1,
            error.message,
          );
        }
      }
    } catch (error) {}
  }

  async syncSendMessage(action) {
    try {
      const Auth = require('../api/Auth').default;
      await Auth.sendMessage({
        userId: action.payload.userId,
        text: action.payload.text,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncTripActions() {
    try {
      const pendingActions = await tripDbHelper.getPendingActions();
      if (!pendingActions || pendingActions.length === 0) return;
      for (const row of pendingActions) {
        const action = {
          id: row.id,
          actionId: row.action_id,
          actionType: row.action_type,
          entityId: row.entity_id,
          retryCount: row.retry_count,
        };

        try {
          const payload = await tripDbHelper.getPendingActionPayload(action.id);
          action.payload = payload;

          let success = false;

          switch (action.actionType) {
            case 'CREATE_TRIP':
              success = await this.syncCreateTrip(action);
              break;

            case 'UPDATE_TRIP':
              success = await this.syncUpdateTrip(action);
              break;

            case 'ADD_EXPENSE':
              success = await this.syncAddExpense(action);
              break;

            case 'ADD_COMMENT':
              success = await this.syncAddComment(action);
              break;

            case 'LIKE_TRIP':
              success = await this.syncLikeTrip(action);
              break;

            case 'UNLIKE_TRIP':
              success = await this.syncUnlikeTrip(action);
              break;

            case 'LIKE_TRIP_REPORT':
              success = await this.syncLikeTripReport(action);
              break;

            case 'UNLIKE_TRIP_REPORT':
              success = await this.syncUnlikeTripReport(action);
              break;

            case 'COMMENT_TRIP':
              success = await this.syncCommentTrip(action);
              break;

            case 'COMMENT_TRIP_REPORT':
              success = await this.syncCommentTripReport(action);
              break;

            case 'LIKE_TRIP_COMMENT':
              success = await this.syncLikeTripComment(action);
              break;

            case 'UNLIKE_TRIP_COMMENT':
              success = await this.syncUnlikeTripComment(action);
              break;

            case 'LIKE_TRIP_REPORT_COMMENT':
              success = await this.syncLikeTripReportComment(action);
              break;

            case 'UNLIKE_TRIP_REPORT_COMMENT':
              success = await this.syncUnlikeTripReportComment(action);
              break;

            case 'SEND_INVITE':
              success = await this.syncSendInvite(action);
              break;

            case 'ACCEPT_INVITE':
              success = await this.syncAcceptInvite(action);
              break;

            case 'REJECT_INVITE':
              success = await this.syncRejectInvite(action);
              break;

            case 'SEND_CHAT':
              success = await this.syncSendChat(action);
              break;

            case 'CREATE_REPORT':
              success = await this.syncCreateReport(action);
              break;

            case 'REMOVE_PASSENGER':
              success = await this.syncRemovePassenger(action);
              break;

            default:
              console.warn('⚠️ Unknown actionType:', action.actionType);
          }

          if (success) {
            await tripDbHelper.updatePendingActionStatus(
              action.actionId,
              'completed',
            );
          } else {
            await tripDbHelper.updatePendingActionStatus(
              action.actionId,
              'failed',
              action.retryCount + 1,
            );
          }
        } catch (error) {
          await tripDbHelper.updatePendingActionStatus(
            row.action_id,
            'failed',
            row.retry_count + 1,
            error.message,
          );
        }
      }
    } catch (error) {}
  }

  async syncForumActions() {
    try {
      const pendingActions = await forumDbHelper.getPendingForumActions();
      if (pendingActions.length === 0) {
        return;
      }

      for (const action of pendingActions) {
        try {
          let success = false;
          switch (action.actionType) {
            case 'like':
              success = await this.syncLikeForumPost(action);
              break;
            case 'create':
              success = await this.syncCreateForumPost(action);
              break;
            case 'update':
              success = await this.syncUpdateForumPost(action);
              break;
            case 'delete':
              success = await this.syncDeleteForumPost(action);
              break;
            case 'create_comment':
              success = await this.syncCreateForumComment(action);
              break;
            case 'COMMENT_LIKE':
              success = await this.syncForumCommentLike(action);
              break;
            default:
          }

          if (success) {
            await forumDbHelper.markPendingActionCompleted(action.id);
          } else {
            await forumDbHelper.incrementRetryCount(action.id);
          }
        } catch (error) {
          await forumDbHelper.incrementRetryCount(action.id);
        }
      }
    } catch (error) {}
  }

  async syncClubActions() {
    try {
      await new Promise((resolve, reject) => {
        store.dispatch(
          syncPendingClubActions((success, message) => {
            if (success) {
              resolve();
            } else {
              reject(new Error(message));
            }
          }),
        );
      });
    } catch (error) {}
  }

  async syncClubForumActions() {
    try {
      await new Promise((resolve, reject) => {
        store.dispatch(
          syncPendingClubForumActions((success, message) => {
            if (success) {
              resolve();
            } else {
              reject(new Error(message));
            }
          }),
        );
      });
    } catch (error) {}
  }

  groupActionsByType(actions) {
    const grouped = {};
    actions.forEach(action => {
      const key = `${action.module}_${action.actionType}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(action);
    });

    return grouped;
  }

  async processCacheActionGroup(actionType, actions) {
    for (const action of actions) {
      try {
        let success = false;
        switch (action.actionType) {
          case 'business_create':
            success = await this.syncCreateBusiness(action);
            break;
          case 'comment':
            if (action.module === 'events') {
              success = await this.syncCreateEventComment(action);
            }
            break;
          case 'like':
            if (action.module === 'events') {
              success = await this.syncLikeEvent(action);
            }
            break;
          case 'like_comment':
            if (action.module === 'events') {
              success = await this.syncLikeEventComment(action);
            }
            break;
          case 'unlike_comment':
            if (action.module === 'events') {
              success = await this.syncUnlikeEventComment(action);
            }
            break;
          default:
        }

        if (success) {
          await this.markCacheActionCompleted(action.id);
        }
      } catch (error) {}
    }
  }

  async syncWebViewUrls() {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        return;
      }

      const urlKeys = ['privacy', 'terms', 'help'];

      for (const key of urlKeys) {
        try {
          const settingKey = `webview_${key}`;
          const data = JSON.parse(await Auth.getSettings(key));

          if (data) {
            await dbHelper.saveAppConfig(settingKey, data);
          }
        } catch (error) {}
      }
    } catch (error) {}
  }

  async syncCreateBusiness(item) {
    try {
      const response = await SponsorApi.createBusiness(item.payload);
      if (response?.id) {
        await sponsorDbHelper.upsertBusiness(response);
        return true;
      }
      return false;
    } catch (error) {
      if (error?.title?.toLowerCase()?.trim() === 'conflict') {
        return true;
      }

      return false;
    }
  }

  // Event sync methods
  async syncCreateEvent(item) {
    try {
      const response = await ClubApi.createEvent(
        item.payload,
        item.payload.clubId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUpdateEvent(item) {
    try {
      await ClubApi.UpdateEvent(
        item.payload,
        item.recordId,
        item.payload.clubId,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncCreateEventComment(item) {
    try {
      await ClubApi.createClubeventcommit(item.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUpdateEventAttendance(item) {
    try {
      await ClubApi.clubEventMember(item.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeEvent(action) {
    try {
      await ClubApi.EventLike({ eventId: action.recordId }, action.recordId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeEventComment(action) {
    try {
      await ClubApi.likeComment(action.recordId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUnlikeEventComment(action) {
    try {
      await ClubApi.deleteLike(action.recordId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Trip sync methods
  async syncCreateTrip(action) {
    try {
      await Trip.createTrip(action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUpdateTrip(action) {
    try {
      await Trip.updateTrip(action.entityId, action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncAddExpense(action) {
    try {
      await Trip.addExpences(action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncAddComment(action) {
    try {
      await Trip.commentTrip(action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeTrip(action) {
    try {
      await Trip.likeTrip(action.payload.tripId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUnlikeTrip(action) {
    try {
      await Trip.deleteTripLike(action.payload.likeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeTripReport(action) {
    try {
      await Trip.likeTripReport(action.payload.reportId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUnlikeTripReport(action) {
    try {
      await Trip.deleteTripReportLike(action.payload.likeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncCommentTrip(action) {
    try {
      const comment = await Trip.commentTrip(action.payload);
      store.dispatch(removeOptimisticComment(action.payload?.tempId));
      tripDbHelper.removeOptimisticComment(action.payload?.tempId);
      store.dispatch(AddOptimisticComment(comment));
      tripDbHelper.addOptimisticComment(
        comment?.payload?.tripId,
        comment,
        'synced',
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncCommentTripReport(action) {
    try {
      const comment = await Trip.commentReport(action.payload);
      store.dispatch(removeOptimisticReportComment(action.payload?.tempId));
      tripDbHelper.removeOptimisticReportComment(action.payload?.tempId);
      store.dispatch(AddOptimisticReportComment(comment));
      tripDbHelper.addOptimisticReportComment(
        comment?.payload?.tripReportId,
        comment,
        'synced',
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeTripComment(action) {
    try {
      await Trip.likeComment(action.payload.commentId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUnlikeTripComment(action) {
    try {
      await Trip.deleteLike(action.payload.likeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncLikeTripReportComment(action) {
    try {
      await Trip.likeCommentForReportComment(action.payload.commentId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUnlikeTripReportComment(action) {
    try {
      await Trip.deleteLikeForReportComment(action.payload.likeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncSendInvite(action) {
    try {
      const param = {
        tripId: action.entityId,
        isDriver: action.payload.isDriver,
      };
      await Trip.sendJoin(param);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncAcceptInvite(action) {
    try {
      await Trip.acceptInviteInvite(action.entityId, action.payload.isDriver);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncRejectInvite(action) {
    try {
      await Trip.rejectInviteInvite(action.entityId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncAddExpense(action) {
    try {
      await Trip.addExpences(action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncSendChat(action) {
    try {
      const resp = await Trip.sendChatNew(
        Array.isArray(action.payload) ? action.payload : [action.payload],
      );

      await tripDbHelper.markChatAsSynced(
        action.payload.localId,
        resp?.[0]?.id,
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  async syncCreateReport(action) {
    try {
      await Trip.postReport(action.payload);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncRemovePassenger(action) {
    try {
      await Trip.removePassenger(action.entityId, action.payload.userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Forum sync methods

  async syncLikeForumPost(action) {
    try {
      if (action.title == 'like') {
        await ClubApi.forumLike(action.postId, '-999');
      } else if (action.title == 'unlike') {
        await ClubApi.forumDisLike(action.postId);
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncCreateForumPost(action) {
    try {
      const param = {
        id: 0,
        title: action.title,
        description: action.description,
      };

      const createdPost = await Forum.createPost(param);

      // Upload images if any
      if (action.imagesData && action.imagesData.length > 0) {
        const imageData = new FormData();
        for (let i = 0; i < action.imagesData.length; i++) {
          imageData.append(i, action.imagesData[i]);
        }
        await Forum.postImage(createdPost?.id, imageData);
        store.dispatch(getForums(1, true));
      } else {
        store.dispatch(getForums(1, true));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncUpdateForumPost(action) {
    try {
      const ClubsAPi = require('../api/ClubApi').default;

      const param = {
        id: action.postId,
        Title: action.title,
        Description: action.description,
        ClubId: -999,
      };

      await ClubsAPi.updateclubforum(param);
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncDeleteForumPost(action) {
    try {
      await Forum.deletePost(action.postId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Forum comment sync methods
  async syncCreateForumComment(action) {
    try {
      const param = [
        {
          id: 0,
          postId: action.postId,
          parentId: action.parentId || 0,
          message: action.commentText,
        },
      ];

      const response = await Forum.postComment(param);
      const created = response;
      await forumDbHelper.deleteForumComment(action.commentId, action.postId);
      await forumDbHelper.insertForumComment(
        {
          id: created.id,
          postId: action.postId,
          userId: created.senderUser?.id || action.userId,
          message: created.message,
          createdAt: created.createdAt || new Date().toISOString(),
          senderUser: created.senderUser,
          quoteComment: created.quoteComment ?? null,
        },
        { skipPostCount: false },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncForumCommentLike(action) {
    try {
      const response = await Forum.postCommentLike(action.commentId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async triggerManualSync() {
    await this.startSync();
  }

  async getSyncStatus() {
    const pendingCache = await this.getPendingCacheActions(1);
    const pendingQueue = await this.getPendingSyncItems(1);

    return {
      hasPendingSync: pendingCache.length > 0 || pendingQueue.length > 0,
      pendingCacheCount: pendingCache.length,
      pendingQueueCount: pendingQueue.length,
      isSyncing: this.isSyncing,
    };
  }

  async getPendingCacheActions(limit = 100) {
    const db = await getDatabase();

    try {
      const [results] = await db.executeSql(
        `SELECT * FROM cache_actions 
       WHERE sync_status = 'pending'
       ORDER BY created_at ASC 
       LIMIT ?`,
        [limit],
      );

      const items = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        items.push({
          id: row.id,
          module: row.module,
          actionType: row.action_type,
          recordId: row.record_id,
          userId: row.user_id,
          payload: row.payload ? JSON.parse(row.payload) : {},
        });
      }
      return items;
    } catch (error) {
      return [];
    }
  }

  async getPendingSyncItems(limit = 50) {
    const db = await getDatabase();

    try {
      const [results] = await db.executeSql(
        `SELECT * FROM sync_queue 
       WHERE sync_status = 'pending' AND retry_count < 3
       ORDER BY created_at ASC 
       LIMIT ?`,
        [limit],
      );

      const items = [];
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        items.push({
          id: row.id,
          module: row.module,
          actionType: row.action_type,
          recordId: row.record_id,
          payload: JSON.parse(row.payload),
          retryCount: row.retry_count,
        });
      }
      return items;
    } catch (error) {
      return [];
    }
  }

  async markCacheActionCompleted(id) {
    const db = await getDatabase();
    try {
      await db.executeSql(
        `UPDATE cache_actions 
       SET sync_status = 'completed'
       WHERE id = ?`,
        [id],
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async markSyncItemCompleted(id) {
    const db = await getDatabase();

    try {
      await db.executeSql(
        `UPDATE sync_queue 
       SET sync_status = 'completed', updated_at = datetime('now')
       WHERE id = ?`,
        [id],
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  async incrementSyncRetry(id) {
    const db = await getDatabase();

    try {
      await db.executeSql(
        `UPDATE sync_queue 
       SET retry_count = retry_count + 1, updated_at = datetime('now')
       WHERE id = ?`,
        [id],
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
}

const syncService = new SyncService();
export default syncService;

export const addToSyncQueue = async (module, actionType, recordId, payload) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `INSERT INTO sync_queue 
       (module, action_type, record_id, payload, sync_status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', 0, datetime('now'), datetime('now'))`,
      [module, actionType, recordId, JSON.stringify(payload)],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const addCacheAction = async (
  module,
  actionType,
  recordId,
  userId,
  payload,
) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `INSERT INTO cache_actions 
       (module, action_type, record_id, user_id, payload, sync_status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [module, actionType, recordId, userId, JSON.stringify(payload || {})],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

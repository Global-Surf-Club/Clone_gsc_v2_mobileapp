import { getDatabase } from './schema';
import moment from 'moment';

export const savePersonalChatMessages = async (
  chatId,
  messages,
  append = false,
) => {
  if (!chatId || !Array.isArray(messages)) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          // Clear existing messages if not appending
          if (!append) {
            tx.executeSql(
              'DELETE FROM personal_chat_messages WHERE chat_id = ?',
              [chatId],
              () => {},
              (_, error) => {},
            );
          }

          if (messages.length === 0) {
            resolve(true);
            return;
          }

          let savedCount = 0;
          let errorCount = 0;

          messages.forEach((message, index) => {
            const messageId =
              message.id?.toString() || `temp-${Date.now()}-${index}`;
            const senderId = message.sender?.id?.toString() || '';
            const receiverId = message.receiver?.id?.toString() || '';

            tx.executeSql(
              `INSERT OR REPLACE INTO personal_chat_messages (
                message_id,
                chat_id,
                sender_id,
                sender_name,
                sender_image,
                receiver_id,
                message_text,
                created_at,
                updated_at,
                is_pending,
                is_failed,
                sync_status,
                data
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
              [
                messageId,
                chatId,
                senderId,
                message.sender?.name || message.sender?.username || '',
                message.sender?.thumbnailProfileImage || '',
                receiverId,
                message.text || '',
                message.createdAt || new Date().toISOString(),
                new Date().toISOString(),
                message.isPending ? 1 : 0,
                message.isFailed ? 1 : 0,
                message.isPending ? 'pending' : 'synced',
                JSON.stringify(message),
              ],
              (_, result) => {
                savedCount++;
                if (index < 3 || index === messages.length - 1) {
                }

                if (savedCount + errorCount === messages.length) {
                  resolve(savedCount > 0);
                }
              },
              (_, error) => {
                errorCount++;
                if (savedCount + errorCount === messages.length) {
                  resolve(savedCount > 0);
                }
              },
            );
          });
        },
        error => {
          reject(error);
        },
      );
    });
  } catch (error) {
    return false;
  }
};

export const getPersonalChatMessagesFromDB = async (chatId, limit = 1000) => {
  if (!chatId) {
    return [];
  }
  try {
    const db = await getDatabase();

    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM personal_chat_messages
           WHERE chat_id = ?
           ORDER BY datetime(created_at) DESC
           `,
          [chatId],
          (_, { rows }) => {
            const messages = [];

            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);

              let parsedMessage = null;

              try {
                parsedMessage = row.data ? JSON.parse(row.data) : {};
              } catch (e) {
                parsedMessage = {};
              }

              messages.push({
                ...parsedMessage,
              });
            }

            resolve(messages);
          },
          (_, error) => {
            resolve([]);
          },
        );
      });
    });
  } catch (error) {
    return [];
  }
};

export const addOptimisticChatMessage = async (chatId, message) => {
  if (!chatId || !message) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO personal_chat_messages (
            message_id,
            chat_id,
            sender_id,
            sender_name,
            sender_image,
            receiver_id,
            message_text,
            created_at,
            updated_at,
            is_pending,
            is_failed,
            sync_status,
            data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 'pending',?)`,
          [
            message.id,
            chatId,
            message.sender?.id?.toString() || '',
            message.sender?.name || message.sender?.username || '',
            message.sender?.thumbnailProfileImage || '',
            message.receiver?.id?.toString() || '',
            message.text || '',
            message.createdAt || new Date().toISOString(),
            new Date().toISOString(),
            JSON.stringify(message),
          ],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const removeOptimisticChatMessage = async (chatId, messageId) => {
  if (!chatId || !messageId) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM personal_chat_messages WHERE chat_id = ? AND message_id = ?',
          [chatId, messageId],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const updateChatMessageStatus = async (messageId, status) => {
  if (!messageId || !status) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE personal_chat_messages 
           SET sync_status = ?, 
               is_pending = ?, 
               is_failed = ?,
               updated_at = ?
           WHERE message_id = ?`,
          [
            status,
            status === 'pending' ? 1 : 0,
            status === 'failed' ? 1 : 0,
            new Date().toISOString(),
            messageId,
          ],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const clearChatConversation = async chatId => {
  if (!chatId) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM personal_chat_messages WHERE chat_id = ?',
          [chatId],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const getChatConversationsFromDB = async userId => {
  if (!userId) {
    return [];
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT DISTINCT chat_id,
                  MAX(created_at) as last_message_time,
                  COUNT(*) as message_count
           FROM personal_chat_messages
           WHERE sender_id = ? OR receiver_id = ?
           GROUP BY chat_id
           ORDER BY datetime(last_message_time) DESC`,
          [userId, userId],
          (_, { rows }) => {
            const conversations = [];

            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              conversations.push({
                chatId: row.chat_id,
                lastMessageTime: row.last_message_time,
                messageCount: row.message_count,
              });
            }

            resolve(conversations);
          },
          (_, error) => {
            resolve([]);
          },
        );
      });
    });
  } catch (error) {
    return [];
  }
};

export const savePendingChatAction = async action => {
  try {
    const db = await getDatabase();
    const actionId = action.actionId || `chat-action-${Date.now()}`;

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO pending_chat_actions (
            action_id,
            action_type,
            entity_id,
            payload,
            timestamp,
            retry_count,
            status,
            error
          ) VALUES (?, ?, ?, ?, ?, 0, 'pending', NULL)`,
          [
            actionId,
            action.actionType,
            action.entityId?.toString() || '',
            JSON.stringify(action.payload || {}),
            action.timestamp || new Date().toISOString(),
          ],
          (_, result) => {
            resolve({ ...action, actionId });
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return null;
  }
};

export const getPendingChatActions = async () => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM pending_chat_actions 
           WHERE status = 'pending' AND retry_count < 5
           ORDER BY timestamp ASC`,
          [],
          (_, { rows }) => {
            const actions = [];

            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              actions.push({
                id: row.id,
                actionId: row.action_id,
                actionType: row.action_type,
                entityId: row.entity_id,
                payload: JSON.parse(row.payload),
                timestamp: row.timestamp,
                retryCount: row.retry_count,
                status: row.status,
                error: row.error,
              });
            }

            resolve(actions);
          },
          (_, error) => {
            resolve([]);
          },
        );
      });
    });
  } catch (error) {
    return [];
  }
};

export const deletePendingChatAction = async actionId => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM pending_chat_actions WHERE action_id = ?',
          [actionId],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const updatePendingChatActionStatus = async (
  actionId,
  status,
  retryCount,
  error = null,
) => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE pending_chat_actions 
           SET status = ?, retry_count = ?, error = ?
           WHERE action_id = ?`,
          [status, retryCount, error, actionId],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const clearOldChatMessages = async (daysOld = 30) => {
  try {
    const db = await getDatabase();
    const cutoffDate = moment().subtract(daysOld, 'days').toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM personal_chat_messages 
           WHERE datetime(created_at) < datetime(?) 
           AND sync_status = 'synced'`,
          [cutoffDate],
          (_, result) => {
            resolve(result.rowsAffected);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return 0;
  }
};

export const getChatStorageStats = async () => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Get total messages
        tx.executeSql(
          'SELECT COUNT(*) as total FROM personal_chat_messages',
          [],
          (_, { rows }) => {
            const total = rows.item(0).total;

            // Get pending messages
            tx.executeSql(
              'SELECT COUNT(*) as pending FROM personal_chat_messages WHERE is_pending = 1',
              [],
              (_, { rows: rows2 }) => {
                const pending = rows2.item(0).pending;

                // Get failed messages
                tx.executeSql(
                  'SELECT COUNT(*) as failed FROM personal_chat_messages WHERE is_failed = 1',
                  [],
                  (_, { rows: rows3 }) => {
                    const failed = rows3.item(0).failed;

                    const stats = {
                      totalMessages: total,
                      pendingMessages: pending,
                      failedMessages: failed,
                      syncedMessages: total - pending - failed,
                    };

                    resolve(stats);
                  },
                );
              },
            );
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    return {
      totalMessages: 0,
      pendingMessages: 0,
      failedMessages: 0,
      syncedMessages: 0,
    };
  }
};

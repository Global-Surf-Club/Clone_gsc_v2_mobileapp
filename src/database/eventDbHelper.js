// database/eventDbHelper.js
import { getDatabase } from './schema';

export const saveAppConfig = async (key, value) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `INSERT OR REPLACE INTO app_settings 
       (setting_key, setting_value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [key, value],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const getAppConfig = async key => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT setting_value FROM app_settings WHERE setting_key = ?',
      [key],
    );

    if (results.rows.length > 0) {
      const value = results.rows.item(0).setting_value;
      return value;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const deleteAppConfig = async key => {
  const db = await getDatabase();
  try {
    await db.executeSql('DELETE FROM app_settings WHERE setting_key = ?', [
      key,
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getAllAppConfigs = async () => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT setting_key, setting_value FROM app_settings',
    );

    const configs = {};
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      configs[row.setting_key] = row.setting_value;
    }
    return configs;
  } catch (error) {
    return {};
  }
};

/**
 * Clear all cached WebView URLs (useful for logout/reset)
 */
export const clearWebViewCache = async () => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `DELETE FROM app_settings WHERE setting_key LIKE 'webview_%'`,
    );
    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear all app configurations (useful for logout/reset)
 */
export const clearAllAppConfigs = async () => {
  const db = await getDatabase();

  try {
    await db.executeSql('DELETE FROM app_settings');
    return true;
  } catch (error) {
    throw error;
  }
};

export const upsertEvent = async eventData => {
  const db = await getDatabase();
  try {
    const {
      id,
      event_id,
      user_id,
      club_id,
      organizerId,
      status = -1,
      isLike = 0,
      totalLikeCount = 0,
      totalCommentCount = 0,
      startDate,
      sync_status = 'synced',
    } = eventData;

    await db.executeSql(
      `INSERT OR REPLACE INTO events 
       (event_id, user_id, club_id, organizer_id, status, is_like, total_like_count, 
        total_comment_count, start_date, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        event_id || id,
        user_id,
        club_id,
        organizerId,
        status,
        isLike ? 1 : 0,
        totalLikeCount,
        totalCommentCount,
        startDate,
        sync_status,
        JSON.stringify(eventData),
      ],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const bulkInsertEvents = async (events, pageNo = 1) => {
  const db = await getDatabase();

  try {
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM events');
    }

    for (const event of events) {
      await upsertEvent(event);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getEvents = async (pageNo = 1, perPage = 10) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM events 
       ORDER BY start_date 
       LIMIT ? OFFSET ?`,
      [perPage, offset],
    );

    const events = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const eventData = JSON.parse(row.data);
      events.push({
        ...eventData,
        isLike: row.is_like === 1,
        totalLikeCount: row.total_like_count,
        totalCommentCount: row.total_comment_count,
        status: row.status,
      });
    }
    return events;
  } catch (error) {
    return [];
  }
};

// export const getEventById = async eventId => {
//   const db = await getDatabase();

//   try {
//     const [results] = await db.executeSql(
//       'SELECT * FROM events WHERE event_id = ?',
//       [eventId],
//     );

//     if (results.rows.length > 0) {
//       const row = results.rows.item(0);
//       const eventData = JSON.parse(row.data);
//       return {
//         ...eventData,
//         isLike: row.is_like === 1,
//         totalLikeCount: row.total_like_count,
//         totalCommentCount: row.total_comment_count,
//         status: row.status,
//       };
//     }
//     return null;
//   } catch (error) {
//     return null;
//   }
// };

export const getEventById = async eventId => {
  const db = await getDatabase();

  const parseRow = row => {
    const data = JSON.parse(row.data);
    return {
      ...data,
      isLike: row.is_like === 1,
      totalLikeCount: row.total_like_count,
      totalCommentCount: row.total_comment_count,
      status: row.status,
    };
  };

  try {
    let [res] = await db.executeSql(
      'SELECT * FROM my_events WHERE event_id = ? LIMIT 1',
      [eventId],
    );
    if (res.rows.length) return parseRow(res.rows.item(0));

    [res] = await db.executeSql(
      'SELECT * FROM events WHERE event_id = ? LIMIT 1',
      [eventId],
    );
    if (res.rows.length) return parseRow(res.rows.item(0));

    [res] = await db.executeSql(
      'SELECT * FROM club_events WHERE event_id = ? LIMIT 1',
      [eventId],
    );
    if (res.rows.length) return parseRow(res.rows.item(0));

    return null;
  } catch (e) {
    return null;
  }
};

export const upsertEventToContext = async (eventData, context = 'all', clubId) => {
  if (context === 'my') {
    await bulkInsertMyEvents([eventData]);
  } else if (context === 'club' && clubId) {
    await bulkInsertClubEvents(clubId, [eventData]);
  } else {
    await upsertEvent(eventData);
  }
};


export const updateEventLike = async (eventId, delta, isLike) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `UPDATE events 
       SET total_like_count = MAX(0, total_like_count + ?),
           is_like = ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, isLike ? 1 : 0, eventId],
    );
    await db.executeSql(
      `UPDATE my_events 
       SET total_like_count = MAX(0, total_like_count + ?),
           is_like = ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, isLike ? 1 : 0, eventId],
    );

    await db.executeSql(
      `UPDATE club_events 
       SET total_like_count = MAX(0, total_like_count + ?),
           is_like = ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, isLike ? 1 : 0, eventId],
    );

    return true;
  } catch (error) {
    throw error;
  }
};

export const updateEventCommentCount = async (eventId, delta = 1) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `UPDATE events 
       SET total_comment_count = total_comment_count + ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, eventId],
    );

    await db.executeSql(
      `UPDATE my_events 
       SET total_comment_count = total_comment_count + ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, eventId],
    );

    await db.executeSql(
      `UPDATE club_events 
       SET total_comment_count = total_comment_count + ?,
           updated_at = datetime('now')
       WHERE event_id = ?`,
      [delta, eventId],
    );

    return true;
  } catch (error) {
    throw error;
  }
};

export const mergeEvent = async (eventId, updatedData) => {
  const db = await getDatabase();

  try {
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) return false;

    const mergedData = { ...existingEvent, ...updatedData };

    await upsertEvent(mergedData);

    const [myEventResults] = await db.executeSql(
      'SELECT * FROM my_events WHERE event_id = ?',
      [eventId],
    );
    if (myEventResults.rows.length > 0) {
      await db.executeSql(
        `UPDATE my_events 
         SET data = ?, updated_at = datetime('now')
         WHERE event_id = ?`,
        [JSON.stringify(mergedData), eventId],
      );
    }

    const [clubEventResults] = await db.executeSql(
      'SELECT * FROM club_events WHERE event_id = ?',
      [eventId],
    );
    if (clubEventResults.rows.length > 0) {
      await db.executeSql(
        `UPDATE club_events 
         SET data = ?, updated_at = datetime('now')
         WHERE event_id = ?`,
        [JSON.stringify(mergedData), eventId],
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// ==================== MY EVENTS ====================

export const bulkInsertMyEvents = async (events, pageNo = 1) => {
  const db = await getDatabase();

  try {
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM my_events');
    }

    for (const event of events) {
      const {
        id,
        event_id,
        user_id,
        organizerId,
        status = -1,
        isLike = 0,
        totalLikeCount = 0,
        totalCommentCount = 0,
        startDate,
      } = event;

      await db.executeSql(
        `INSERT OR REPLACE INTO my_events 
         (event_id, user_id, organizer_id, status, is_like, total_like_count, 
          total_comment_count, start_date, created_at, updated_at, sync_status, data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 'synced', ?)`,
        [
          event_id || id,
          user_id,
          organizerId,
          status,
          isLike ? 1 : 0,
          totalLikeCount,
          totalCommentCount,
          startDate,
          JSON.stringify(event),
        ],
      );
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getMyEvents = async (pageNo = 1, perPage = 10) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM my_events 
       ORDER BY start_date 
       LIMIT ? OFFSET ?`,
      [perPage, offset],
    );

    const events = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const eventData = JSON.parse(row.data);
      events.push({
        ...eventData,
        isLike: row.is_like === 1,
        totalLikeCount: row.total_like_count,
        totalCommentCount: row.total_comment_count,
        status: row.status,
      });
    }
    return events;
  } catch (error) {
    return [];
  }
};

// ==================== CLUB EVENTS ====================

export const bulkInsertClubEvents = async (clubId, events, pageNo = 1) => {
  const db = await getDatabase();

  try {
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM club_events WHERE club_id = ?', [
        clubId,
      ]);
    }

    for (const event of events) {
      const {
        id,
        event_id,
        user_id,
        organizerId,
        status = -1,
        isLike = 0,
        totalLikeCount = 0,
        totalCommentCount = 0,
        startDate,
      } = event;

      await db.executeSql(
        `INSERT OR REPLACE INTO club_events 
         (event_id, club_id, user_id, organizer_id, status, is_like, total_like_count, 
          total_comment_count, start_date, created_at, updated_at, sync_status, data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 'synced', ?)`,
        [
          event_id || id,
          clubId,
          user_id,
          organizerId,
          status,
          isLike ? 1 : 0,
          totalLikeCount,
          totalCommentCount,
          startDate,
          JSON.stringify(event),
        ],
      );
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getClubEvents = async (clubId, pageNo = 1, perPage = 10) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM club_events 
       WHERE club_id = ?
       ORDER BY start_date 
       LIMIT ? OFFSET ?`,
      [clubId, perPage, offset],
    );

    const events = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const eventData = JSON.parse(row.data);
      events.push({
        ...eventData,
        isLike: row.is_like === 1,
        totalLikeCount: row.total_like_count,
        totalCommentCount: row.total_comment_count,
        status: row.status,
      });
    }
    return events;
  } catch (error) {
    return [];
  }
};

// ==================== EVENT COMMENTS ====================

export const insertComment = async (eventId, commentData) => {
  const db = await getDatabase();

  try {
    const {
      id,
      commentId,
      autherId,
      totalLikeCount = 0,
      isLiked = 0,
    } = commentData;

    await db.executeSql(
      `INSERT OR REPLACE INTO event_comments 
       (comment_id, event_id, user_id, likes_count, liked, created_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'synced', ?)`,
      [
        commentId || id,
        eventId,
        autherId,
        totalLikeCount,
        isLiked ? 1 : 0,
        JSON.stringify(commentData),
      ],
    );

    return true;
  } catch (error) {
    throw error;
  }
};

export const bulkInsertComments = async (eventId, comments, pageNo = 1) => {
  const db = await getDatabase();

  try {
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM event_comments WHERE event_id = ?', [
        eventId,
      ]);
    }

    for (const comment of comments) {
      await insertComment(eventId, comment);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getEventComments = async (eventId, pageNo = 1, perPage = 10) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM event_comments 
       WHERE event_id = ?
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [eventId, perPage, offset],
    );

    const comments = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const commentData = JSON.parse(row.data);
      comments.push({
        ...commentData,
        liked: row.liked === 1,
        likes_count: row.likes_count,
      });
    }
    return comments;
  } catch (error) {
    return [];
  }
};

export const updateCommentLike = async (commentId, delta, liked) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `UPDATE event_comments 
       SET likes_count = MAX(0, likes_count + ?),
           liked = ?
       WHERE comment_id = ?`,
      [delta, liked ? 1 : 0, commentId],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

// ==================== EVENT MEMBERS ====================

export const bulkInsertEventMembers = async (
  eventId,
  members,
  type = 'all',
  pageNo = 1,
) => {
  const db = await getDatabase();

  try {
    if (pageNo === 1) {
      await db.executeSql(
        'DELETE FROM event_members WHERE event_id = ? AND member_type = ?',
        [eventId, type],
      );
    }

    for (const member of members) {
      const { id, member_id, user_id, status } = member;

      await db.executeSql(
        `INSERT OR REPLACE INTO event_members 
         (member_id, event_id, user_id, status, member_type, created_at, data)
         VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
        [
          member_id || id,
          eventId,
          user_id,
          status,
          type,
          JSON.stringify(member),
        ],
      );
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const getEventMembers = async (
  eventId,
  type = 'all',
  pageNo = 1,
  perPage = 10,
) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    const [results] = await db.executeSql(
      `SELECT * FROM event_members 
       WHERE event_id = ? AND member_type = ?
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [eventId, type, perPage, offset],
    );

    const members = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      members.push(JSON.parse(row.data));
    }
    return members;
  } catch (error) {
    return [];
  }
};

// ==================== SYNC QUEUE ====================

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

export const getPendingSyncItems = async (limit = 50) => {
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
};

export const markSyncItemCompleted = async id => {
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
};

export const incrementSyncRetry = async id => {
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
};

// ==================== CACHE ACTIONS ====================

export const updateEventAttendance = async (eventId, status) => {
  const db = await getDatabase();
  try {
    await db.executeSql(
      `UPDATE events SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, eventId],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const updateUserEventAttendance = async (
  eventId,
  memberId,
  status,
  user,
) => {
  const db = await getDatabase();
  try {
    // First, get the user data from existing member entry if exists
    const [userResult] = await db.executeSql(
      `SELECT data FROM event_members WHERE event_id = ? AND member_id = ? LIMIT 1`,
      [eventId, memberId],
    );
    let userData = null;
    if (userResult.rows.length > 0) {
      userData = JSON.parse(userResult.rows.item(0).data);
    } else if (user) {
      userData = user;
    }

    if (!userData) {
      return true;
    }

    // Delete user from all member types
    await db.executeSql(
      `DELETE FROM event_members WHERE event_id = ? AND member_id = ?`,
      [eventId, memberId],
    );

    // Insert into appropriate types
    const types = [];
    if (status !== -1) {
      types.push('all');
    }
    if (status === 0) {
      types.push('going');
    } else if (status === 1) {
      types.push('maybe');
    }

    for (const type of types) {
      await db.executeSql(
        `INSERT OR REPLACE INTO event_members 
         (member_id, event_id, user_id, status, member_type, created_at, data)
         VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
        [
          memberId,
          eventId,
          userData.id || memberId,
          status,
          type,
          JSON.stringify(userData),
        ],
      );
    }

    return true;
  } catch (error) {
    throw error;
  }
};

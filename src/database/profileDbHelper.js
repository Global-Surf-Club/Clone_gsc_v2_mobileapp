// database/profileDbHelper.js - Complete with Sync Manager
import { getDatabase } from './schema';
import NetInfo from '@react-native-community/netinfo';

// ==================== HELPER FUNCTION ====================
const ensureDatabase = async () => {
  try {
    const db = await getDatabase();
    if (!db) {
      throw new Error('Database not available');
    }
    return db;
  } catch (error) {
    throw error;
  }
};

// ==================== PROFILE ====================

export const upsertProfile = async profileData => {
  try {
    const db = await ensureDatabase();

    // Validate required data
    if (!profileData || (!profileData.id && !profileData.user_id)) {
      return false;
    }

    const {
      id,
      user_id,
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      gender = 0,
      aboutMe = '',
      city = '',
      state = '',
      country = '',
      zipCode = '',
      boardSize = 0,
      surferSkillLevel = 0,
      carOwner = 0,
      carCapacity = 0,
      imageProfileUrl = '',
      createdAt = new Date().toISOString(),
      sync_status = 'synced',
    } = profileData;

    const userId = user_id || id;

    if (!userId) {
      return false;
    }

    await db.executeSql(
      `INSERT OR REPLACE INTO profiles 
       (user_id, first_name, last_name, email, phone, gender, about_me, 
        city, state, country, zip_code, board_size, surfer_skill_level, 
        car_owner, car_capacity, image_profile_url, created_at, 
        updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(userId),
        String(firstName || ''),
        String(lastName || ''),
        String(email || ''),
        String(phone || ''),
        Number(gender || 0),
        String(aboutMe || ''),
        String(city || ''),
        String(state || ''),
        String(country || ''),
        String(zipCode || ''),
        Number(boardSize || 0),
        Number(surferSkillLevel || 0),
        carOwner ? 1 : 0,
        Number(carCapacity || 0),
        String(imageProfileUrl || ''),
        String(createdAt),
        String(sync_status),
        JSON.stringify(profileData),
      ],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const getProfile = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return null;
    }

    const [results] = await db.executeSql(
      'SELECT * FROM profiles WHERE user_id = ?',
      [String(userId)],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      const profileData = JSON.parse(row.data);
      return {
        ...profileData,
        carOwner: row.car_owner === 1,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const updateProfileFields = async (userId, updates) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    const existingProfile = await getProfile(userId);
    if (!existingProfile) {
      return await upsertProfile({ ...updates, user_id: userId });
    }

    const updatedProfile = { ...existingProfile, ...updates };
    await upsertProfile(updatedProfile);

    await db.executeSql(
      `UPDATE profiles 
       SET sync_status = 'pending', updated_at = datetime('now')
       WHERE user_id = ?`,
      [String(userId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

// ==================== PROFILE IMAGES ====================

export const insertProfileImage = async imageData => {
  try {
    const db = await ensureDatabase();

    if (!imageData || !imageData.userId) {
      return false;
    }

    const {
      id,
      imageId,
      userId,
      imageUrl = '',
      imageType = '',
      sync_status = 'synced',
    } = imageData;

    const finalImageId = imageId || id || `img_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO profile_images 
       (image_id, user_id, image_url, image_type, created_at, 
        updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalImageId),
        String(userId),
        String(imageUrl),
        String(imageType),
        String(sync_status),
        JSON.stringify(imageData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertProfileImages = async (userId, images) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(images)) {
      return false;
    }

    await db.executeSql('DELETE FROM profile_images WHERE user_id = ?', [
      String(userId),
    ]);

    for (const image of images) {
      await insertProfileImage({ ...image, userId });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getProfileImages = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM profile_images 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [String(userId)],
    );

    const images = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        images.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return images;
  } catch (error) {
    return [];
  }
};

export const deleteProfileImage = async imageId => {
  try {
    const db = await ensureDatabase();

    if (!imageId) {
      return false;
    }

    await db.executeSql('DELETE FROM profile_images WHERE image_id = ?', [
      String(imageId),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== TRIP REPORTS ====================

export const insertTripReport = async reportData => {
  try {
    const db = await ensureDatabase();

    if (!reportData || !reportData.userId) {
      return false;
    }

    const {
      id,
      reportId,
      userId,
      tripId = '',
      title = '',
      description = '',
      rating = 0,
      images = [],
      sync_status = 'synced',
    } = reportData;

    const finalReportId = reportId || id || `report_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO profile_trip_reports 
       (report_id, user_id, trip_id, title, description, rating, 
        image_count, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalReportId),
        String(userId),
        String(tripId),
        String(title),
        String(description),
        Number(rating || 0),
        Number(images.length || 0),
        String(sync_status),
        JSON.stringify(reportData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertTripReports = async (userId, reports) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(reports)) {
      return false;
    }

    await db.executeSql('DELETE FROM profile_trip_reports WHERE user_id = ?', [
      String(userId),
    ]);

    for (const report of reports) {
      await insertTripReport({ ...report, userId });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getTripReports = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM profile_trip_reports 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [String(userId)],
    );

    const reports = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        reports.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return reports;
  } catch (error) {
    return [];
  }
};

// ==================== FRIENDS ====================

export const insertFriend = async friendData => {
  try {
    const db = await ensureDatabase();

    if (!friendData || !friendData.userId) {
      return false;
    }

    const {
      id,
      friendId,
      userId,
      friendUserId,
      status = 'active',
      sync_status = 'synced',
    } = friendData;

    const finalFriendId = friendId || id || `${userId}_${friendUserId}`;
    const finalFriendUserId = friendUserId || id;

    await db.executeSql(
      `INSERT OR REPLACE INTO friends 
       (friend_id, user_id, friend_user_id, status, created_at, 
        updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalFriendId),
        String(userId),
        String(finalFriendUserId),
        String(status),
        String(sync_status),
        JSON.stringify(friendData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertFriends = async (userId, friends, isSelf = false) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(friends)) {
      return false;
    }

    if (isSelf) {
      await db.executeSql(
        'DELETE FROM friends WHERE user_id = ? AND status = ?',
        [String(userId), 'active'],
      );
    }

    for (const friend of friends) {
      await insertFriend({
        ...friend,
        userId: String(userId),
        friendUserId: String(friend.id),
        friendId: `${userId}_${friend.id}`,
      });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getFriendsList = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM friends 
       WHERE user_id = ? AND status = 'active'
       ORDER BY created_at DESC`,
      [String(userId)],
    );

    const friends = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        friends.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return friends;
  } catch (error) {
    return [];
  }
};

export const removeFriend = async (userId, friendUserId) => {
  try {
    const db = await ensureDatabase();

    if (!userId || !friendUserId) {
      return false;
    }

    await db.executeSql(
      `DELETE FROM friends 
       WHERE user_id = ? AND friend_user_id = ?`,
      [String(userId), String(friendUserId)],
    );
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== FRIEND REQUESTS - SENT ====================

export const insertSentFriendRequest = async requestData => {
  try {
    const db = await ensureDatabase();

    if (!requestData || !requestData.senderId) {
      return false;
    }

    const {
      id,
      requestId,
      senderId,
      receiverId,
      status = 'pending',
      sync_status = 'synced',
    } = requestData;

    const finalRequestId = requestId || id || `${senderId}_${receiverId}`;
    const finalReceiverId = receiverId || id;

    await db.executeSql(
      `INSERT OR REPLACE INTO friend_requests_sent 
       (request_id, sender_id, receiver_id, status, created_at, 
        updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalRequestId),
        String(senderId),
        String(finalReceiverId),
        String(status),
        String(sync_status),
        JSON.stringify(requestData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertSentRequests = async (userId, requests) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(requests)) {
      return false;
    }

    await db.executeSql(
      'DELETE FROM friend_requests_sent WHERE sender_id = ?',
      [String(userId)],
    );

    for (const request of requests) {
      await insertSentFriendRequest({
        ...request,
        senderId: String(userId),
        receiverId: String(request.id),
      });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getSentFriendRequests = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM friend_requests_sent 
       WHERE sender_id = ?
       ORDER BY created_at DESC`,
      [String(userId)],
    );

    const requests = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        requests.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return requests;
  } catch (error) {
    return [];
  }
};

// ==================== FRIEND REQUESTS - RECEIVED ====================

export const insertReceivedFriendRequest = async requestData => {
  try {
    const db = await ensureDatabase();

    if (!requestData || !requestData.receiverId) {
      return false;
    }

    const {
      id,
      requestId,
      senderId,
      receiverId,
      status = 'pending',
      sync_status = 'synced',
    } = requestData;

    const finalRequestId = requestId || id || `${senderId}_${receiverId}`;
    const finalSenderId = senderId || id;

    await db.executeSql(
      `INSERT OR REPLACE INTO friend_requests_received 
       (request_id, sender_id, receiver_id, status, created_at, 
        updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalRequestId),
        String(finalSenderId),
        String(receiverId),
        String(status),
        String(sync_status),
        JSON.stringify(requestData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertReceivedRequests = async (userId, requests) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(requests)) {
      return false;
    }

    await db.executeSql(
      'DELETE FROM friend_requests_received WHERE receiver_id = ?',
      [String(userId)],
    );

    for (const request of requests) {
      await insertReceivedFriendRequest({
        ...request,
        receiverId: String(userId),
        senderId: String(request.id),
      });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getReceivedFriendRequests = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM friend_requests_received 
       WHERE receiver_id = ?
       ORDER BY created_at DESC`,
      [String(userId)],
    );

    const requests = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        requests.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return requests;
  } catch (error) {
    return [];
  }
};

// ==================== CONVERSATIONS ====================

export const insertConversation = async conversationData => {
  try {
    const db = await ensureDatabase();

    if (!conversationData || !conversationData.userId) {
      return false;
    }

    const {
      id,
      conversationId,
      userId,
      participantId,
      lastMessage = '',
      lastMessageTime = '',
      unreadCount = 0,
      sync_status = 'synced',
    } = conversationData;

    const finalConversationId =
      conversationId || id || `conv_${userId}_${participantId}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO conversations 
       (conversation_id, user_id, participant_id, last_message, 
        last_message_time, unread_count, created_at, updated_at, 
        sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalConversationId),
        String(userId),
        String(participantId),
        String(lastMessage),
        String(lastMessageTime),
        Number(unreadCount || 0),
        String(sync_status),
        JSON.stringify(conversationData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertConversations = async (
  userId,
  conversations,
  pageNo = 1,
) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(conversations)) {
      return false;
    }

    if (pageNo === 1) {
      await db.executeSql('DELETE FROM conversations WHERE user_id = ?', [
        String(userId),
      ]);
    }

    for (const conversation of conversations) {
      await insertConversation({ ...conversation, userId: String(userId) });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getConversations = async (userId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM conversations 
       WHERE user_id = ?
       ORDER BY last_message_time DESC 
       LIMIT ? OFFSET ?`,
      [String(userId), perPage, offset],
    );

    const conversations = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        conversations.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return conversations;
  } catch (error) {
    return [];
  }
};

// ==================== NOTIFICATIONS ====================

export const insertNotification = async notificationData => {
  try {
    const db = await ensureDatabase();

    if (!notificationData || !notificationData.userId) {
      return false;
    }

    const {
      id,
      notificationId,
      userId,
      type = '',
      title = '',
      message = '',
      isRead = 0,
      targetId = '',
      targetType = '',
      sync_status = 'synced',
    } = notificationData;

    const finalNotificationId = notificationId || id || `notif_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO notifications 
       (notification_id, user_id, type, title, message, is_read, 
        target_id, target_type, created_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(finalNotificationId),
        String(userId),
        String(type),
        String(title),
        String(message),
        isRead ? 1 : 0,
        String(targetId),
        String(targetType),
        String(sync_status),
        JSON.stringify(notificationData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertNotifications = async (
  userId,
  notifications,
  pageNo = 1,
) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(notifications)) {
      return false;
    }

    if (pageNo === 1) {
      await db.executeSql('DELETE FROM notifications WHERE user_id = ?', [
        String(userId),
      ]);
    }

    for (const notification of notifications) {
      await insertNotification({ ...notification, userId: String(userId) });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getNotifications = async (userId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM notifications 
       WHERE user_id = ?
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [String(userId), perPage, offset],
    );

    const notifications = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        const notificationData = JSON.parse(row.data);
        notifications.push({
          ...notificationData,
          isRead: row.is_read === 1,
        });
      } catch (e) {}
    }
    return notifications;
  } catch (error) {
    return [];
  }
};

export const markNotificationAsRead = async notificationId => {
  try {
    const db = await ensureDatabase();

    if (!notificationId) {
      return false;
    }

    await db.executeSql(
      `UPDATE notifications 
       SET is_read = 1
       WHERE notification_id = ?`,
      [String(notificationId)],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteNotification = async notificationId => {
  try {
    const db = await ensureDatabase();

    if (!notificationId) {
      return false;
    }

    await db.executeSql('DELETE FROM notifications WHERE notification_id = ?', [
      String(notificationId),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

export const getUnreadNotificationCount = async userId => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return 0;
    }

    const [results] = await db.executeSql(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = 0`,
      [String(userId)],
    );

    if (results.rows.length > 0) {
      return results.rows.item(0).count || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

export const bulkNotificationOperation = async (notificationIds, operation) => {
  try {
    const db = await ensureDatabase();

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return false;
    }

    if (operation === 'read') {
      for (const id of notificationIds) {
        await markNotificationAsRead(id);
      }
    } else if (operation === 'unread') {
      for (const id of notificationIds) {
        await db.executeSql(
          `UPDATE notifications SET is_read = 0 WHERE notification_id = ?`,
          [String(id)],
        );
      }
    } else if (operation === 'delete') {
      for (const id of notificationIds) {
        await deleteNotification(id);
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const insertProfileTrip = async tripData => {
  try {
    const db = await ensureDatabase();

    if (!tripData || !tripData.userId) {
      return false;
    }

    const {
      id,
      tripId,
      userId,
      title = '',
      description = '',
      startDate = '',
      endDate = '',
      location = '',
      isPublic = true,
      organizerId = '',
      sync_status = 'synced',
    } = tripData;

    const finalTripId = tripId || id || `trip_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO profile_trips 
       (trip_id, user_id, title, description, start_date, end_date, 
        location, is_public, organizer_id, created_at, updated_at, 
        sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(finalTripId),
        String(userId),
        String(title),
        String(description),
        String(startDate),
        String(endDate),
        String(location),
        isPublic ? 1 : 0,
        String(organizerId),
        tripData.createdAt || moment().toISOString(),
        tripData.updatedAt || moment().toISOString(),
        String(sync_status),
        JSON.stringify(tripData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertProfileTrips = async (userId, trips, pageNo = 1) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(trips)) {
      return false;
    }

    // Clear existing trips only on page 1
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM profile_trips WHERE user_id = ?', [
        String(userId),
      ]);
    }

    for (const trip of trips) {
      await insertProfileTrip({ ...trip, userId: String(userId) });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getProfileTrips = async (userId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM profile_trips 
       WHERE user_id = ?
       ORDER BY updated_at DESC 
       LIMIT ? OFFSET ?`,
      [String(userId), perPage, offset],
    );

    const trips = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        const tripData = JSON.parse(row.data);
        trips.push({
          ...tripData,
          isPublic: row.is_public === 1,
        });
      } catch (e) {}
    }
    return trips;
  } catch (error) {
    return [];
  }
};

export const deleteProfileTrip = async tripId => {
  try {
    const db = await ensureDatabase();

    if (!tripId) {
      return false;
    }

    await db.executeSql('DELETE FROM profile_trips WHERE trip_id = ?', [
      String(tripId),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== PROFILE CLUBS ====================

export const insertProfileClub = async clubData => {
  try {
    const db = await ensureDatabase();

    if (!clubData || !clubData.userId) {
      return false;
    }

    const {
      id,
      clubId,
      userId,
      role = 'member',
      logoPath = '',
      title = '',
      city = '',
      state = '',
      country = '',
      tripCount = 0,
      tripReportsCount = 0,
      membersCount = 0,
      organizerId = '',
      sync_status = 'synced',
    } = clubData;

    const finalClubId = clubId || id || `club_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO profile_clubs 
       (club_id, user_id, role, logo_path, title, city, state, country,
        trip_count, trip_reports_count, members_count, organizer_id,
        created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(finalClubId),
        String(userId),
        String(role),
        String(logoPath),
        String(title),
        String(city),
        String(state),
        String(country),
        Number(tripCount || 0),
        Number(tripReportsCount || 0),
        Number(membersCount || 0),
        String(organizerId),
        String(sync_status),
        JSON.stringify(clubData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertProfileClubs = async (userId, clubs, pageNo = 1) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return false;
    }

    if (!Array.isArray(clubs)) {
      return false;
    }

    // Clear existing clubs only on page 1
    if (pageNo === 1) {
      await db.executeSql('DELETE FROM profile_clubs WHERE user_id = ?', [
        String(userId),
      ]);
    }

    for (const club of clubs) {
      await insertProfileClub({ ...club, userId: String(userId) });
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getProfileClubs = async (userId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM profile_clubs 
       WHERE user_id = ?
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [String(userId), perPage, offset],
    );

    const clubs = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        clubs.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return clubs;
  } catch (error) {
    return [];
  }
};

export const deleteProfileClub = async clubId => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return false;
    }

    await db.executeSql('DELETE FROM profile_clubs WHERE club_id = ?', [
      String(clubId),
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== SYNC UTILITIES ====================

export const getPendingCount = async () => {
  try {
    const db = await ensureDatabase();

    const [results] = await db.executeSql(`
      SELECT 
      (SELECT COUNT(*) FROM profiles WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM profile_images WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM profile_trip_reports WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM friends WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM friend_requests_sent WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM friend_requests_received WHERE sync_status = 'pending') +
       (SELECT COUNT(*) FROM conversations WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM notifications WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM profile_trips WHERE sync_status = 'pending') +
        (SELECT COUNT(*) FROM profile_clubs WHERE sync_status = 'pending')
      AS total
    `);

    return results.rows.item(0).total || 0;
  } catch (error) {
    return 0;
  }
};

export const getLastSyncTime = async () => {
  try {
    const db = await ensureDatabase();

    const [results] = await db.executeSql(
      `SELECT MAX(updated_at) as last_sync FROM (
        SELECT MAX(updated_at) as updated_at FROM profiles WHERE sync_status = 'synced'
        UNION ALL
        SELECT MAX(updated_at) FROM friends WHERE sync_status = 'synced'
        UNION ALL
        SELECT MAX(updated_at) FROM notifications WHERE sync_status = 'synced'
        UNION ALL
        SELECT MAX(updated_at) FROM profile_trips WHERE sync_status = 'synced'
        UNION ALL
        SELECT MAX(updated_at) FROM profile_clubs WHERE sync_status = 'synced'
      )`,
    );

    if (results.rows.length > 0) {
      return results.rows.item(0).last_sync;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const clearDatabase = async () => {
  try {
    const db = await ensureDatabase();

    const tables = [
      'profiles',
      'profile_images',
      'profile_trip_reports',
      'friends',
      'friend_requests_sent',
      'friend_requests_received',
      'conversations',
      'notifications',
      'profile_trips',
      'profile_clubs',
    ];

    for (const table of tables) {
      await db.executeSql(`DELETE FROM ${table}`);
    }

    return true;
  } catch (error) {
    return false;
  }
};

// ==================== SYNC MANAGER - INTEGRATED ====================

class SyncManager {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.listeners = new Set();
    this.retryAttempts = 3;
    this.retryDelay = 2000;
    this.API_BASE_URL = 'https://your-api-url.com'; // CHANGE THIS

    this.initNetworkListener();
  }

  initNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      if (wasOffline && this.isOnline) {
        this.syncAll();
      }

      this.notifyListeners({ type: 'network', isOnline: this.isOnline });
    });
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {}
    });
  }

  async syncAll(userId) {
    if (this.isSyncing) {
      return { success: false, message: 'Sync in progress' };
    }

    if (!this.isOnline) {
      return { success: false, message: 'No internet connection' };
    }

    this.isSyncing = true;
    this.notifyListeners({ type: 'sync_start' });

    try {
      const pendingCount = await getPendingCount();

      this.notifyListeners({
        type: 'sync_complete',
        success: true,
        pending: pendingCount,
      });

      return {
        success: true,
        pending: pendingCount,
      };
    } catch (error) {
      this.notifyListeners({ type: 'sync_error', error: error.message });
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async checkConnectivity() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }
}

// Export singleton instance
const syncManagerInstance = new SyncManager();

export const startSync = userId => syncManagerInstance.syncAll(userId);
export const addSyncListener = callback =>
  syncManagerInstance.addListener(callback);
export const getPendingChangesCount = () => getPendingCount();
export const clearSyncErrors = async () => {
  try {
    const db = await ensureDatabase();
    const tables = [
      'profiles',
      'profile_images',
      'profile_trip_reports',
      'friends',
      'friend_requests_sent',
      'friend_requests_received',
      'conversations',
      'notifications',
    ];

    for (const table of tables) {
      await db.executeSql(
        `UPDATE ${table} SET sync_status = 'pending' WHERE sync_status = 'failed'`,
      );
    }

    return true;
  } catch (error) {
    return false;
  }
};
export const getLastSync = () => getLastSyncTime();
export const checkOnlineStatus = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    return false;
  }
};
export const SyncManager_Instance = syncManagerInstance;

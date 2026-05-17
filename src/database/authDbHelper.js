import { getDatabase } from './schema';
export const upsertUser = async (userData, isCurrentUser = false) => {
  const db = await getDatabase();
  try {
    const {
      id,
      user_id,
      email,
      username,
      firstName,
      lastName,
      imageProfileUrl,
      fullNameProfileImage,
      city,
      state,
      country,
      userRole,
      isVouch = false,
    } = userData;

    if (isCurrentUser) {
      await db.executeSql('UPDATE app_users SET is_current_user = 0');
    }
    await db.executeSql(
      `INSERT OR REPLACE INTO app_users 
       (user_id, email, username, first_name, last_name, image_profile_url, 
        city, state, country, user_role, is_vouch, is_current_user, 
        last_login, created_at, updated_at, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'), ?)`,
      [
        user_id || id,
        email,
        username,
        firstName,
        lastName,
        imageProfileUrl || fullNameProfileImage,
        city,
        state,
        country,
        userRole,
        isVouch ? 1 : 0,
        isCurrentUser ? 1 : 0,
        JSON.stringify(userData),
      ],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const db = await getDatabase();
  try {
    const [results] = await db.executeSql(
      'SELECT * FROM app_users WHERE is_current_user = 1 LIMIT 1',
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      const userData = JSON.parse(row.data);
      return {
        ...userData,
        isVouch: row.is_vouch === 1,
      };
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getUserByEmail = async email => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM app_users WHERE email = ? LIMIT 1',
      [email],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return JSON.parse(row.data);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Get User by ID
export const getUserById = async userId => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM app_users WHERE user_id = ? LIMIT 1',
      [userId],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return JSON.parse(row.data);
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Mark User as Current (Login)
export const markUserAsCurrent = async userId => {
  const db = await getDatabase();

  try {
    // Unmark all users
    await db.executeSql('UPDATE app_users SET is_current_user = 0');

    // Mark specific user as current
    await db.executeSql(
      `UPDATE app_users 
       SET is_current_user = 1, last_login = datetime('now') 
       WHERE user_id = ?`,
      [userId],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const unmarkCurrentUser = async () => {
  const db = await getDatabase();

  try {
    await db.executeSql('UPDATE app_users SET is_current_user = 0');
    return true;
  } catch (error) {
    throw error;
  }
};

export const bulkInsertSearchedUsers = async (users, pageNo = 1) => {
  const db = await getDatabase();

  try {
    for (const user of users) {
      await upsertUser(user, false);
    }
    return true;
  } catch (error) {
    throw error;
  }
};

export const searchUsersLocal = async (
  searchQuery,
  pageNo = 1,
  perPage = 10,
) => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * perPage;

  try {
    let query = `SELECT * FROM app_users WHERE is_current_user = 0`;
    let params = [];

    if (searchQuery && searchQuery.trim().length > 0) {
      query += ` AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(perPage, offset);

    const [results] = await db.executeSql(query, params);

    const users = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      const userData = JSON.parse(row.data);
      users.push({
        ...userData,
        isVouch: row.is_vouch === 1,
      });
    }
    return users;
  } catch (error) {
    return [];
  }
};

export const updateVouchStatus = async (userId, isVouch = true) => {
  const db = await getDatabase();

  try {
    await db.executeSql('UPDATE app_users SET is_vouch = ? WHERE user_id = ?', [
      isVouch ? 1 : 0,
      userId,
    ]);
    return true;
  } catch (error) {
    throw error;
  }
};

export const createSession = async (userId, email, token, fcmToken) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ?',
      [userId],
    );

    await db.executeSql(
      `INSERT INTO user_sessions 
       (user_id, email, token, fcm_token, login_time, is_active, created_at)
       VALUES (?, ?, ?, ?, datetime('now'), 1, datetime('now'))`,
      [userId, email, token, fcmToken],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const getActiveSession = async () => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM user_sessions WHERE is_active = 1 ORDER BY login_time DESC LIMIT 1',
    );

    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const endSession = async () => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `UPDATE user_sessions 
       SET is_active = 0, logout_time = datetime('now') 
       WHERE is_active = 1`,
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const getSessionByEmail = async email => {
  const db = await getDatabase();
  try {
    const [results] = await db.executeSql(
      'SELECT * FROM user_sessions WHERE email = ? ORDER BY login_time DESC LIMIT 1',
      [email],
    );

    if (results.rows.length > 0) {
      return results.rows.item(0);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveSetting = async (key, value) => {
  const db = await getDatabase();

  try {
    await db.executeSql(
      `INSERT OR REPLACE INTO app_settings 
       (setting_key, setting_value, updated_at)
       VALUES (?, ?, datetime('now'))`,
      [key, JSON.stringify(value)],
    );
    return true;
  } catch (error) {
    throw error;
  }
};

export const getSetting = async key => {
  const db = await getDatabase();

  try {
    const [results] = await db.executeSql(
      'SELECT * FROM app_settings WHERE setting_key = ? LIMIT 1',
      [key],
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return JSON.parse(row.setting_value);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const clearSearchedUsers = async () => {
  const db = await getDatabase();
  try {
    await db.executeSql('DELETE FROM app_users WHERE is_current_user = 0');
    return true;
  } catch (error) {
    throw error;
  }
};

export const clearAllSessions = async () => {
  const db = await getDatabase();
  try {
    await db.executeSql('DELETE FROM user_sessions');
    return true;
  } catch (error) {
    throw error;
  }
};

export const clearAllAuthData = async () => {
  const db = await getDatabase();
  try {
    await db.executeSql('UPDATE app_users SET is_current_user = 0');
    await db.executeSql('UPDATE user_sessions SET is_active = 0');
    return true;
  } catch (error) {
    throw error;
  }
};

export const applyDeletionSync = async deletionList => {
  if (!Array.isArray(deletionList) || deletionList.length === 0) {
    return true;
  }

  try {
    const db = await getDatabase();

    await new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          deletionList.forEach(item => {
            const { targetType, targetValues } = item;

            if (!Array.isArray(targetValues) || targetValues.length === 0)
              return;

            const ids = targetValues.map(id => String(id));
            const placeholders = ids.map(() => '?').join(',');

            /* ---------------------------------------
               1️⃣ TRIP → community_list
            --------------------------------------- */
            if (targetType === 'trip') {
              tx.executeSql(
                `DELETE FROM community_list
                 WHERE post_type = 'trip'
                 AND post_id IN (${placeholders})`,
                ids,
              );
            }

            /* ---------------------------------------
               2️⃣ TRIP REPORT → community_list
            --------------------------------------- */
            if (targetType === 'tripreport') {
              tx.executeSql(
                `DELETE FROM community_list
                 WHERE post_type = 'report'
                 AND post_id IN (${placeholders})`,
                ids,
              );
            }

            /* ---------------------------------------
               3️⃣ CLUB → clubs table
            --------------------------------------- */
            if (targetType === 'club') {
              tx.executeSql(
                `DELETE FROM clubs
                 WHERE club_id IN (${placeholders})`,
                ids,
              );
            }

            /* ---------------------------------------
               4️⃣ BUSINESS + SPONSOR
            --------------------------------------- */
            if (targetType === 'businesssponsor') {
              tx.executeSql(
                `DELETE FROM businesses
                 WHERE business_id IN (${placeholders})`,
                ids,
              );

              tx.executeSql(
                `DELETE FROM sponsors
                 WHERE sponsor_id IN (${placeholders})`,
                ids,
              );
            }

            /* ---------------------------------------
               5️⃣ OPTIONAL: Notification Cleanup
            --------------------------------------- */

            tx.executeSql(
              `DELETE FROM notifications
               WHERE reference_id IN (${placeholders})`,
              ids,
            );
          });
        },
        error => reject(error),
        () => resolve(true),
      );
    });

    return true;
  } catch (error) {
     return false;
  }
};

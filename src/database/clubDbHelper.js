// database/clubDbHelper.js
import { getDatabase } from './schema';

// ==================== HELPER ====================
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

// ==================== ALL CLUBS ====================

export const getLastClubSyncTime = async () => {
  const db = await ensureDatabase();
  const [res] = await db.executeSql(
    "SELECT value FROM sync_meta WHERE key = 'club_last_sync'",
  );
  return res.rows.length ? res.rows.item(0).value : null;
};

export const setLastClubSyncTime = async time => {
  const db = await ensureDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['club_last_sync', time],
  );
};

export const getLastMyClubSyncTime = async () => {
  const db = await ensureDatabase();
  const [res] = await db.executeSql(
    'SELECT value FROM sync_meta WHERE key = ?',
    [`my_club_last_sync`],
  );
  return res.rows.length ? res.rows.item(0).value : null;
};

export const setLastMyClubSyncTime = async time => {
  const db = await ensureDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    [`my_club_last_sync`, time],
  );
};

export const upsertClubSpeed = async club => {
  const db = await ensureDatabase();
  const id = club.id;

  const [res] = await db.executeSql(
    `SELECT data FROM clubs WHERE club_id = ? LIMIT 1`,
    [String(id)],
  );

  let existing = {};
  if (res.rows.length) {
    try {
      existing = JSON.parse(res.rows.item(0).data || '{}');
    } catch {}
  }

  const merged = {
    ...existing,
    ...club,
    updatedAt: club.updatedAt || new Date().toISOString(),
  };

  await db.executeSql(
    `
    INSERT OR REPLACE INTO clubs
    (club_id, updated_at, sync_status, data)
    VALUES (?, ?, ?, ?)
    `,
    [
      String(id),
      merged.updatedAt,
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const bulkInsertClubsSpeed = async clubs => {
  for (const club of clubs) {
    await insertClubSpeed(club);
  }
};

export const insertClubSpeed = async clubData => {
  const db = await ensureDatabase();
  if (!clubData?.id) return;
  const existing = await getClubById(clubData.id);
  const merged = {
    ...(existing || {}),
    ...clubData,
    id: clubData.id,
    updatedAt: new Date().toISOString(),
    sync_status: 'synced',
  };

  await db.executeSql(
    `INSERT OR REPLACE INTO clubs
     (club_id, title, description, organizer_id, organizer_name, logo_path,
      city, state, country, zip_code, members_count, trip_count,
      trip_reports_count, status, is_public, created_at, updated_at,
      sync_status, data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(merged.id),
      merged.title || '',
      merged.description || '',
      String(merged.organizerId || ''),
      merged.organizerName || '',
      merged.logoPath || '',
      merged.city || '',
      merged.state || '',
      merged.country || '',
      merged.zipCode || '',
      merged.membersCount || 0,
      merged.tripCount || 0,
      merged.tripReportsCount || 0,
      merged.status || '',
      merged.isPublic ? 1 : 0,
      merged.createdAt || new Date().toISOString(),
      merged.updatedAt || new Date().toISOString(),
      merged.sync_status,
      JSON.stringify(merged),
    ],
  );
};

export const getClubById = async clubId => {
  try {
    const db = await ensureDatabase();

    const result = await db.executeSql(
      `SELECT data FROM clubs WHERE club_id = ? LIMIT 1`,
      [String(clubId)],
    );

    if (result[0].rows.length === 0) return null;

    const row = result[0].rows.item(0);
    return row?.data ? JSON.parse(row.data) : null;
  } catch (error) {
    return null;
  }
};

export const upsertMyClubSpeed = async (club, userId) => {
  const db = await ensureDatabase();
  const id = club.id;

  const [res] = await db.executeSql(
    `SELECT data FROM my_clubs WHERE club_id = ? AND user_id = ? LIMIT 1`,
    [String(id), String(userId)],
  );

  let existing = {};
  if (res.rows.length) {
    try {
      existing = JSON.parse(res.rows.item(0).data || '{}');
    } catch {}
  }

  const merged = {
    ...existing,
    ...club,
    updatedAt: club.updatedAt || new Date().toISOString(),
  };

  await db.executeSql(
    `
    INSERT OR REPLACE INTO my_clubs
    (club_id, user_id, updated_at, sync_status, data)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      String(id),
      String(userId),
      merged.updatedAt,
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const bulkInsertMyClubsSpeed = async (clubs, userId) => {
  for (const c of clubs) {
    await insertClubSpeed(c);
  }
};

// export const getAllClubsSpeedFromDB = async () => {
//   const db = await ensureDatabase();
//   const [res] = await db.executeSql(
//     `SELECT * FROM clubs ORDER BY datetime(updated_at) DESC`,
//   );

//   const list = [];
//   for (let i = 0; i < res.rows.length; i++) {
//     list.push(JSON.parse(res.rows.item(i).data));
//   }
//   return list;
// };

// export const getMyClubsSpeedFromDB = async userId => {
//   const db = await ensureDatabase();
//   const [res] = await db.executeSql(
//     `
//     SELECT * FROM my_clubs
//     WHERE user_id = ?
//     ORDER BY datetime(updated_at) DESC
//     `,
//     [String(userId)],
//   );

//   const list = [];
//   for (let i = 0; i < res.rows.length; i++) {
//     list.push(JSON.parse(res.rows.item(i).data));
//   }
//   return list;
// };

export const getMyClubsSpeedFromDB = async userId => {
  const db = await ensureDatabase();
  const [res] = await db.executeSql(
    `
    SELECT data FROM clubs
    WHERE organizer_id = ?
       OR status = 'Joined'
    ORDER BY datetime(updated_at) DESC
    `,
    [String(userId)],
  );

  const list = [];
  for (let i = 0; i < res.rows.length; i++) {
    list.push(JSON.parse(res.rows.item(i).data));
  }
  return list;
};

export const getAllClubsSpeedFromDB = async userId => {
  const db = await ensureDatabase();
  const [res] = await db.executeSql(
    `
    SELECT data FROM clubs
    WHERE NOT (
      organizer_id = ?
      OR status = 'Joined'
    )
    ORDER BY datetime(updated_at) DESC
    `,
    [String(userId)],
  );

  const list = [];
  for (let i = 0; i < res.rows.length; i++) {
    list.push(JSON.parse(res.rows.item(i).data));
  }
  return list;
};

export const insertClub = async clubData => {
  try {
    const db = await ensureDatabase();

    if (!clubData || !clubData.id) {
      return false;
    }

    const {
      id,
      title = '',
      description = '',
      organizerId = '',
      organizerName = '',
      logoPath = '',
      city = '',
      state = '',
      country = '',
      zipCode = '',
      membersCount = 0,
      tripCount = 0,
      tripReportsCount = 0,
      status = null,
      isPublic = 1,
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString(),
      sync_status = 'synced',
    } = clubData;

    await db.executeSql(
      `INSERT OR REPLACE INTO clubs 
       (club_id, title, description, organizer_id, organizer_name, logo_path,
        city, state, country, zip_code, members_count, trip_count, 
        trip_reports_count, status, is_public, created_at, updated_at, 
        sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(id),
        String(title),
        String(description),
        String(organizerId),
        String(organizerName),
        String(logoPath),
        String(city),
        String(state),
        String(country),
        String(zipCode),
        Number(membersCount || 0),
        Number(tripCount || 0),
        Number(tripReportsCount || 0),
        status ? String(status) : '',
        isPublic ? 1 : 0,
        String(createdAt),
        String(updatedAt),
        String(sync_status),
        JSON.stringify(clubData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubs = async (clubs, pageNo = 1) => {
  try {
    const db = await ensureDatabase();

    if (!Array.isArray(clubs)) {
      return false;
    }

    if (pageNo === 1) {
      await db.executeSql('DELETE FROM clubs');
    }

    for (const club of clubs) {
      await insertClub(club);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getAllClubs = async (pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();
    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM clubs 
       ORDER BY updated_at DESC 
       LIMIT ? OFFSET ?`,
      [perPage, offset],
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

export const updateClubStatus = async (clubId, status) => {
  try {
    if (!clubId) return false;

    const db = await ensureDatabase();

    const [result] = await db.executeSql(
      `
      UPDATE clubs
      SET
        status = ?,
        data = json_set(
          COALESCE(data, '{}'),
          '$.status',
          ?
        ),
        updated_at = datetime('now')
      WHERE club_id = ?
      `,
      [String(status), String(status), String(clubId)],
    );
    return result.rowsAffected === 1;
  } catch (error) {
    console.error('updateClubStatus error ===>', error);
    return false;
  }
};

export const updateClubMemberCount = async (clubId, delta) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || typeof delta !== 'number') {
      return false;
    }

    await db.executeSql(
      `UPDATE clubs 
       SET members_count = MAX(0, members_count + ?), updated_at = datetime('now')
       WHERE club_id = ?`,
      [delta, String(clubId)],
    );

    await db.executeSql(
      `UPDATE my_clubs 
       SET members_count = MAX(0, members_count + ?), updated_at = datetime('now')
       WHERE club_id = ?`,
      [delta, String(clubId)],
    );

    await db.executeSql(
      `UPDATE club_details 
       SET members_count = MAX(0, members_count + ?), updated_at = datetime('now')
       WHERE club_id = ?`,
      [delta, String(clubId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

// ==================== UPDATE CLUB ====================

export const updateClub = async (clubId, updateData) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !updateData || typeof updateData !== 'object') {
      return false;
    }

    // 1️⃣ Existing data JSON fetch karo
    const [result] = await db.executeSql(
      `SELECT data FROM my_clubs WHERE club_id = ? LIMIT 1`,
      [String(clubId)],
    );

    if (!result.rows.length) {
      return false;
    }

    // 2️⃣ Parse existing JSON
    let existingData = {};
    try {
      existingData = JSON.parse(result.rows.item(0).data || '{}');
    } catch (e) {
      existingData = {};
    }

    // 3️⃣ Merge new values
    const mergedData = {
      ...existingData,
      ...updateData,
    };

    // 4️⃣ Update ONLY data column
    await db.executeSql(
      `UPDATE clubs 
       SET data = ?, updated_at = datetime('now') 
       WHERE club_id = ?`,
      [JSON.stringify(mergedData), String(clubId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const updateClubSyncStatus = async (clubId, syncStatus) => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return false;
    }

    await db.executeSql(
      `UPDATE clubs SET sync_status = ?, updated_at = datetime('now') WHERE club_id = ?`,
      [String(syncStatus), String(clubId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteClub = async clubId => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return false;
    }

    await db.executeSql(`DELETE FROM clubs WHERE club_id = ?`, [
      String(clubId),
    ]);

    return true;
  } catch (error) {
    return false;
  }
};

// ==================== MY CLUBS ====================

export const insertMyClub = async (clubData, userId) => {
  try {
    const db = await ensureDatabase();

    if (!clubData || !clubData.id || !userId) {
      return false;
    }

    const {
      id,
      title = '',
      description = '',
      organizerId = '',
      logoPath = '',
      city = '',
      state = '',
      country = '',
      membersCount = 0,
      tripCount = 0,
      tripReportsCount = 0,
      status = 'Joined',
      role = 'Member',
      sync_status = 'synced',
      createdAt = new Date().toISOString(),
      updatedAt = new Date().toISOString(),
    } = clubData;

    await db.executeSql(
      `INSERT OR REPLACE INTO my_clubs 
       (club_id, user_id, title, description, organizer_id, logo_path,
        city, state, country, members_count, trip_count, trip_reports_count,
        status, role, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(id),
        String(userId),
        String(title),
        String(description),
        String(organizerId),
        String(logoPath),
        String(city),
        String(state),
        String(country),
        Number(membersCount || 0),
        Number(tripCount || 0),
        Number(tripReportsCount || 0),
        String(status),
        String(role),
        String(createdAt),
        String(updatedAt),
        String(sync_status),
        JSON.stringify(clubData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertMyClubs = async (clubs, userId, pageNo = 1) => {
  try {
    const db = await ensureDatabase();

    if (!Array.isArray(clubs) || !userId) {
      return false;
    }

    if (pageNo === 1) {
      await db.executeSql('DELETE FROM my_clubs WHERE user_id = ?', [
        String(userId),
      ]);
    }

    for (const club of clubs) {
      await insertMyClub(club, userId);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getMyClubs = async (userId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();

    if (!userId) {
      return [];
    }

    const offset = (pageNo - 1) * perPage;

    const [results] = await db.executeSql(
      `SELECT * FROM my_clubs 
       WHERE user_id = ?
       ORDER BY updated_at DESC 
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

// ==================== CLUB DETAILS ====================

export const insertClubDetails = async clubData => {
  try {
    const db = await ensureDatabase();

    if (!clubData || !clubData.id) {
      return false;
    }

    const {
      id,
      title = '',
      description = '',
      organizerId = '',
      organizerName = '',
      organizerImage = '',
      logoPath = '',
      bannerPath = '',
      city = '',
      state = '',
      country = '',
      zipCode = '',
      membersCount = 0,
      tripCount = 0,
      tripReportsCount = 0,
      status = null,
      isPublic = 1,
      createdAt = new Date().toISOString(),
      sync_status = 'synced',
    } = clubData;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_details 
       (club_id, title, description, organizer_id, organizer_name, organizer_image,
        logo_path, banner_path, city, state, country, zip_code, members_count,
        trip_count, trip_reports_count, status, is_public, created_at, updated_at,
        last_fetched, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(id),
        String(title),
        String(description),
        String(organizerId),
        String(organizerName),
        String(organizerImage),
        String(logoPath),
        String(bannerPath),
        String(city),
        String(state),
        String(country),
        String(zipCode),
        Number(membersCount || 0),
        Number(tripCount || 0),
        Number(tripReportsCount || 0),
        status ? String(status) : null,
        isPublic ? 1 : 0,
        String(createdAt),
        String(sync_status),
        JSON.stringify(clubData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getClubDetails = async clubId => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return null;
    }

    const [results] = await db.executeSql(
      'SELECT * FROM club_details WHERE club_id = ?',
      [String(clubId)],
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

export const insertClubMember = async (clubId, memberData) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !memberData) {
      return false;
    }

    const {
      id,
      userId,
      userName = '',
      userImage = '',
      userCity = '',
      userState = '',
      role = 'Member',
      status = 'Active',
      joinedAt = new Date().toISOString(),
      sync_status = 'synced',
      createdAt = new Date().toISOString(),
    } = memberData;

    const finalMemberId = id || `${clubId}_${userId}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_members 
       (member_id, club_id, user_id, user_name, user_image, user_city,
        user_state, role, status, joined_at, created_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(finalMemberId),
        String(clubId),
        String(userId),
        String(userName),
        String(userImage),
        String(userCity),
        String(userState),
        String(role),
        String(status),
        String(joinedAt),
        String(createdAt),
        String(sync_status),
        JSON.stringify(memberData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubMembers = async (clubId, members) => {
  try {
    const db = await ensureDatabase();
    if (!clubId || !Array.isArray(members)) {
      return false;
    }
    await db.executeSql('DELETE FROM club_members WHERE club_id = ?', [
      String(clubId),
    ]);

    for (const member of members) {
      await insertClubMember(clubId, member);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getClubMembers = async clubId => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM club_members 
       WHERE club_id = ?
       ORDER BY created_at DESC`,
      [String(clubId)],
    );
    const members = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        members.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return members;
  } catch (error) {
    return [];
  }
};

export const removeClubMember = async (clubId, memberId) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !memberId) {
      return false;
    }

    await db.executeSql(
      'DELETE FROM club_members WHERE club_id = ? AND (member_id = ? OR user_id = ?)',
      [String(clubId), String(memberId), String(memberId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const insertClubGalleryImage = async (clubId, imageData) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !imageData) {
      return false;
    }

    const {
      id,
      imageUrl = '',
      imageType = 'galleryimage',
      uploadedBy = '',
      sync_status = 'synced',
    } = imageData;

    const finalImageId = id || `${clubId}_img_${Date.now()}`;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_gallery 
       (image_id, club_id, image_url, image_type, uploaded_by, 
        created_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(finalImageId),
        String(clubId),
        String(imageUrl),
        String(imageType),
        String(uploadedBy),
        String(sync_status),
        JSON.stringify(imageData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubGallery = async (clubId, images) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !Array.isArray(images)) {
      return false;
    }

    await db.executeSql('DELETE FROM club_gallery WHERE club_id = ?', [
      String(clubId),
    ]);

    for (const image of images) {
      await insertClubGalleryImage(clubId, image);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getClubGallery = async clubId => {
  try {
    const db = await ensureDatabase();

    if (!clubId) {
      return [];
    }

    const [results] = await db.executeSql(
      `SELECT * FROM club_gallery 
       WHERE club_id = ?
       ORDER BY created_at DESC`,
      [String(clubId)],
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

export const deleteClubGalleryImage = async (clubId, imageId) => {
  try {
    const db = await ensureDatabase();

    if (!clubId || !imageId) {
      return false;
    }

    await db.executeSql(
      'DELETE FROM club_gallery WHERE club_id = ? AND image_id = ?',
      [String(clubId), String(imageId)],
    );

    return true;
  } catch (error) {
    return false;
  }
};

// ==================== CLUB FORUM ====================
export const insertClubForum = async (clubId, forumData) => {
  try {
    const db = await ensureDatabase();
    if (!clubId || !forumData || !forumData.id) return false;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_forum 
       (forum_id, club_id, user_id, title, description, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(forumData.id),
        String(clubId),
        String(forumData.userId || ''),
        String(forumData.title || ''),
        String(forumData.description || ''),
        String(forumData.sync_status || 'synced'),
        JSON.stringify(forumData),
      ],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const replaceTempForumPost = async (tempForumId, serverForumId) => {
  try {
    const db = await ensureDatabase();

    // 1️⃣ Get temp forum row
    const [result] = await db.executeSql(
      `SELECT * FROM club_forum WHERE forum_id = ?`,
      [String(tempForumId)],
    );

    if (!result.rows.length) {
      return false;
    }

    const row = result.rows.item(0);
    const forumData = JSON.parse(row.data || '{}');

    // 2️⃣ Update forum object with server ID
    const updatedForum = {
      ...forumData,
      id: serverForumId,
      sync_status: 'synced',
      _isPending: false,
    };

    // 3️⃣ Delete temp row
    await db.executeSql(`DELETE FROM club_forum WHERE forum_id = ?`, [
      String(tempForumId),
    ]);

    // 4️⃣ Insert server row
    await db.executeSql(
      `INSERT OR REPLACE INTO club_forum
       (forum_id, club_id, user_id, title, description, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      [
        String(serverForumId),
        String(row.club_id),
        String(row.user_id || ''),
        String(updatedForum.title || ''),
        String(updatedForum.description || ''),
        row.created_at, // keep original create time
        'synced',
        JSON.stringify(updatedForum),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubForum = async (clubId, forums, pageNo = 1) => {
  try {
    const db = await ensureDatabase();
    if (!Array.isArray(forums) || !clubId) return false;

    if (pageNo === 1) {
      await db.executeSql(`DELETE FROM club_forum WHERE club_id = ?`, [
        String(clubId),
      ]);
    }

    for (const forum of forums) {
      await insertClubForum(clubId, forum);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getClubForum = async (clubId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();
    if (!clubId) return [];
    const offset = (pageNo - 1) * perPage;
    const [results] = await db.executeSql(
      `SELECT * FROM club_forum WHERE club_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [String(clubId), perPage, offset],
    );
    const forums = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      try {
        forums.push(JSON.parse(row.data));
      } catch (e) {}
    }
    return forums;
  } catch (error) {
    return [];
  }
};

export const deleteClubForum = async (clubId, forumId) => {
  try {
    const db = await ensureDatabase();
    await db.executeSql(
      `DELETE FROM club_forum WHERE club_id = ? AND forum_id = ?`,
      [String(clubId), String(forumId)],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const updateClubForum = async (clubId, forumId, updates = {}) => {
  try {
    const db = await ensureDatabase();
    if (!clubId || !forumId) return false;

    // Get existing forum
    const [res] = await db.executeSql(
      `SELECT data FROM club_forum WHERE club_id = ? AND forum_id = ?`,
      [String(clubId), String(forumId)],
    );

    if (res.rows.length === 0) return false;

    const existing = JSON.parse(res.rows.item(0).data);

    const updatedForum = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      sync_status: updates.sync_status || existing.sync_status || 'synced',
    };

    await db.executeSql(
      `UPDATE club_forum
       SET title = ?, 
           description = ?, 
           updated_at = datetime('now'),
           sync_status = ?, 
           data = ?
       WHERE club_id = ? AND forum_id = ?`,
      [
        String(updatedForum.title || ''),
        String(updatedForum.description || ''),
        String(updatedForum.sync_status),
        JSON.stringify(updatedForum),
        String(clubId),
        String(forumId),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

// clubDbHelper.js
export const updateClubForumLike = async (clubId, forumId, newLikedState) => {
  try {
    const db = await ensureDatabase();

    const [res] = await db.executeSql(
      `SELECT data FROM club_forum WHERE club_id = ? AND forum_id = ?`,
      [String(clubId), String(forumId)],
    );

    if (res.rows.length === 0) return null;

    const forum = JSON.parse(res.rows.item(0).data);

    const updatedForum = {
      ...forum,
      isLike: newLikedState,
      likeCount: Math.max(0, (forum.likeCount || 0) + (newLikedState ? 1 : -1)),
      sync_status: 'pending',
      updatedAt: new Date().toISOString(),
    };

    await db.executeSql(
      `UPDATE club_forum
       SET data = ?, sync_status = ?, updated_at = datetime('now')
       WHERE club_id = ? AND forum_id = ?`,
      [
        JSON.stringify(updatedForum),
        'pending',
        String(clubId),
        String(forumId),
      ],
    );

    return updatedForum;
  } catch {
    return null;
  }
};

// ==================== CLUB TRIPS ====================
export const insertClubTrip = async (clubId, tripData) => {
  try {
    const db = await ensureDatabase();
    if (!clubId || !tripData || !tripData.id) return false;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_trips 
       (trip_id, club_id, user_id, title, start_date, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(tripData.id),
        String(clubId),
        String(tripData.userId || ''),
        String(tripData.title || ''),
        String(tripData.start_date || ''),
        String(tripData.sync_status || 'synced'),
        JSON.stringify(tripData),
      ],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubTrips = async (clubId, trips, pageNo = 1) => {
  try {
    const db = await ensureDatabase();
    if (!Array.isArray(trips) || !clubId) return false;

    if (pageNo === 1) {
      await db.executeSql(`DELETE FROM club_trips WHERE club_id = ?`, [
        String(clubId),
      ]);
    }

    for (const trip of trips) {
      await insertClubTrip(clubId, trip);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getClubTrips = async (clubId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();
    if (!clubId) return [];

    const offset = (pageNo - 1) * perPage;
    const [results] = await db.executeSql(
      `SELECT * FROM club_trips WHERE club_id = ? ORDER BY start_date DESC LIMIT ? OFFSET ?`,
      [String(clubId), perPage, offset],
    );

    const trips = [];
    for (let i = 0; i < results.rows.length; i++) {
      trips.push(JSON.parse(results.rows.item(i)?.data));
    }
    return trips;
  } catch (error) {
    return [];
  }
};

// ==================== CLUB TRIP REPORTS ====================
export const insertClubTripReport = async (clubId, reportData) => {
  try {
    const db = await ensureDatabase();
    if (!clubId || !reportData || !reportData.id) return false;

    await db.executeSql(
      `INSERT OR REPLACE INTO club_trip_reports 
       (report_id, club_id, trip_id, user_id, title, created_at, updated_at, sync_status, data)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)`,
      [
        String(reportData.id),
        String(clubId),
        String(reportData.trip_id || ''),
        String(reportData.user_id || ''),
        String(reportData.title || ''),
        String(reportData.sync_status || 'synced'),
        JSON.stringify(reportData),
      ],
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const bulkInsertClubTripReports = async (
  clubId,
  reports,
  pageNo = 1,
) => {
  try {
    const db = await ensureDatabase();
    if (!Array.isArray(reports) || !clubId) return false;

    if (pageNo === 1) {
      await db.executeSql(`DELETE FROM club_trip_reports WHERE club_id = ?`, [
        String(clubId),
      ]);
    }

    for (const report of reports) {
      await insertClubTripReport(clubId, report);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getClubTripReports = async (clubId, pageNo = 1, perPage = 10) => {
  try {
    const db = await ensureDatabase();
    if (!clubId) return [];

    const offset = (pageNo - 1) * perPage;
    const [results] = await db.executeSql(
      `SELECT * FROM club_trip_reports WHERE club_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [String(clubId), perPage, offset],
    );

    const reports = [];
    for (let i = 0; i < results.rows.length; i++) {
      reports.push(JSON.parse(results.rows.item(i)?.data));
    }
    return reports;
  } catch (error) {
    return [];
  }
};

// ==================== PENDING ACTIONS ====================

export const addClubPendingAction = async actionData => {
  try {
    const db = await ensureDatabase();

    const {
      actionType,
      clubId = '',
      userId,
      targetId = '',
      payload = null,
    } = actionData;

    await db.executeSql(
      `INSERT INTO club_pending_actions 
       (action_type, club_id, user_id, target_id, payload, 
        sync_status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, datetime('now'), datetime('now'))`,
      [
        String(actionType),
        String(clubId),
        String(userId),
        String(targetId),
        payload ? JSON.stringify(payload) : null,
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getClubPendingActions = async () => {
  try {
    const db = await ensureDatabase();

    const [results] = await db.executeSql(
      `SELECT * FROM club_pending_actions 
       WHERE sync_status = 'pending' AND retry_count < 3
       ORDER BY created_at ASC`,
    );

    const actions = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      actions.push({
        id: row.id,
        actionType: row.action_type,
        clubId: row.club_id,
        userId: row.user_id,
        targetId: row.target_id,
        payload: row.payload ? JSON.parse(row.payload) : null,
        retryCount: row.retry_count,
      });
    }
    return actions;
  } catch (error) {
    return [];
  }
};

export const markClubActionCompleted = async actionId => {
  try {
    const db = await ensureDatabase();

    await db.executeSql(
      `UPDATE club_pending_actions 
       SET sync_status = 'completed', updated_at = datetime('now')
       WHERE id = ?`,
      [actionId],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const incrementClubActionRetry = async actionId => {
  try {
    const db = await ensureDatabase();

    await db.executeSql(
      `UPDATE club_pending_actions 
       SET retry_count = retry_count + 1, updated_at = datetime('now')
       WHERE id = ?`,
      [actionId],
    );

    return true;
  } catch (error) {
    return false;
  }
};

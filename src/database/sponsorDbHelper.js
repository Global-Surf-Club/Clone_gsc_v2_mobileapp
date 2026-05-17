// database/sponsorDbHelper.js
import { getDatabase } from './schema';

const executeQuery = async (query, params = []) => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(query, params);
    return result;
  } catch (error) {
    throw error;
  }
};

export const getLastSponsorSyncTime = async () => {
  const db = await getDatabase();
  const [res] = await db.executeSql(
    "SELECT value FROM sync_meta WHERE key = 'sponsor_last_sync'",
  );
  return res.rows.length ? res.rows.item(0).value : null;
};

export const setLastSponsorSyncTime = async time => {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['sponsor_last_sync', time],
  );
};

export const getLastBusinessSyncTime = async () => {
  const db = await getDatabase();
  const [res] = await db.executeSql(
    "SELECT value FROM sync_meta WHERE key = 'business_last_sync'",
  );
  return res.rows.length ? res.rows.item(0).value : null;
};

export const setLastBusinessSyncTime = async time => {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['business_last_sync', time],
  );
};

export const upsertSponsor = async sponsor => {
  const db = await getDatabase();
  const id = sponsor.sponsor_id || sponsor.id;
  const existing = await getSponsorById(id);
  const merged = { ...existing, ...sponsor };

  await db.executeSql(
    `INSERT OR REPLACE INTO sponsors
     (sponsor_id, is_activate, is_sponsored, updated_at, sync_status, data)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      merged.isActivate ? 1 : 1,
      1,
      merged?.createdAt
        ? merged?.createdAt?.toString()
        : new Date().toISOString(),
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const upsertBusiness = async business => {
  const db = await getDatabase();
  const id = business.business_id || business.id;

  const existing = await getBusinessById(id);
  const merged = { ...existing, ...business };

  await db.executeSql(
    `INSERT OR REPLACE INTO businesses
     (business_id, is_activate, updated_at, sync_status, data)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      merged.isActivate ? 1 : 1,
      merged?.createdAt
        ? merged?.createdAt?.toString()
        : new Date().toISOString(),
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const upsertBusinessSpeed = async business => {
  const db = await getDatabase();
  const id = business.business_id || business.id;

  const existing = await getBusinessById(id);
  const merged = { ...existing, ...business };

  await db.executeSql(
    `
    INSERT OR REPLACE INTO businesses
    (business_id, updated_at, sync_status, data)
    VALUES (?, ?, ?, ?)
    `,
    [
      id,
      merged.updatedAt || new Date().toISOString(),
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const upsertSponsorSpeed = async sponsor => {
  const db = await getDatabase();
  const id = sponsor.sponsor_id || sponsor.id;

  const existing = await getSponsorById(id);
  const merged = { ...existing, ...sponsor };

  await db.executeSql(
    `
    INSERT OR REPLACE INTO sponsors
    (sponsor_id, updated_at, sync_status, data)
    VALUES (?, ?, ?, ?)
    `,
    [
      id,
      merged.updatedAt || new Date().toISOString(),
      merged.sync_status || 'synced',
      JSON.stringify(merged),
    ],
  );
};

export const updateSponsorImage = async (sponsorId, imagePath) => {
  try {
    const db = await getDatabase();

    const [result] = await db.executeSql(
      `SELECT data FROM sponsors WHERE sponsor_id = ? LIMIT 1`,
      [String(sponsorId)],
    );

    if (!result.rows.length) return false;

    let existingData = {};
    try {
      existingData = JSON.parse(result.rows.item(0).data || '{}');
    } catch {
      existingData = {};
    }

    const mergedData = {
      ...existingData,
      imagePath,
      thumbnailImagePath: imagePath,
    };

    await db.executeSql(
      `UPDATE sponsors 
       SET data = ?, updated_at = datetime('now') 
       WHERE sponsor_id = ?`,
      [JSON.stringify(mergedData), String(sponsorId)],
    );

    return true;
  } catch (e) {
    return false;
  }
};

export const updateBusinessImage = async (businessId, imagePath) => {
  try {
    const db = await getDatabase();

    const [result] = await db.executeSql(
      `SELECT data FROM businesses WHERE business_id = ? LIMIT 1`,
      [String(businessId)],
    );

    if (!result.rows.length) return false;

    let existingData = {};
    try {
      existingData = JSON.parse(result.rows.item(0).data || '{}');
    } catch {
      existingData = {};
    }

    const mergedData = {
      ...existingData,
      imagePath,
      thumbnailImagePath: imagePath,
    };

    await db.executeSql(
      `UPDATE businesses 
       SET data = ?, updated_at = datetime('now') 
       WHERE business_id = ?`,
      [JSON.stringify(mergedData), String(businessId)],
    );

    return true;
  } catch (e) {
    return false;
  }
};

export const bulkInsertSponsors = async sponsors => {
  for (const s of sponsors) {
    await upsertSponsor(s);
  }
  await cleanupOldSponsors();
};

export const bulkInsertBusinesses = async businesses => {
  for (const b of businesses) {
    await upsertBusiness(b);
  }
  await cleanupOldBusinesses();
};

export const bulkInsertSponsorsSpeed = async sponsors => {
  for (const b of sponsors) {
    await upsertSponsorSpeed(b);
  }
  // await cleanupOldSponsors();
};

export const bulkInsertBusinessesSpeed = async businesses => {
  for (const b of businesses) {
    await upsertBusinessSpeed(b);
  }
  // await cleanupOldBusinesses();
};

export const getSponsors = async (pageNo, limit, search = '') => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * limit;

  let query = `
    SELECT data FROM sponsors
    WHERE is_activate = 1 AND is_sponsored = 1
  `;
  let params = [];

  if (search) {
    query += ' AND json_extract(data, "$.name") LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [res] = await db.executeSql(query, params);
  return mapRows(res);
};

export const getBusinesses = async (pageNo, limit, search = '') => {
  const db = await getDatabase();
  const offset = (pageNo - 1) * limit;

  let query = `
    SELECT data FROM businesses
    WHERE is_activate = 1
  `;
  let params = [];

  if (search) {
    query += ' AND json_extract(data, "$.name") LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [res] = await db.executeSql(query, params);
  return mapRows(res);
};

export const getSponsorById = async id => {
  const db = await getDatabase();
  const [res] = await db.executeSql(
    'SELECT data FROM sponsors WHERE sponsor_id = ?',
    [id],
  );
  return res.rows.length ? JSON.parse(res.rows.item(0).data) : null;
};

export const getBusinessById = async id => {
  const db = await getDatabase();
  const [res] = await db.executeSql(
    'SELECT data FROM businesses WHERE business_id = ?',
    [id],
  );
  return res.rows.length ? JSON.parse(res.rows.item(0).data) : null;
};

export const getSponsorSpeedFromDB = async (search = '') => {
  try {
    let query = `
      SELECT data, updated_at
      FROM sponsors
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND json_extract(data, '$.name') LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY datetime(updated_at) DESC`;

    const result = await executeQuery(query, params);

    const list = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);

      // ✅ Parse once only
      let parsed;
      try {
        parsed = JSON.parse(item.data);
      } catch {
        continue; // skip corrupted rows
      }

      // ✅ Filter from JSON safely
      if (
        parsed?.isSponsored === true &&
        parsed?.isActivate === true &&
        parsed?.isDelete !== true
      ) {
        list.push(parsed);
      }
    }

    return list;
  } catch (error) {
    return [];
  }
};

export const getBusinessSpeedFromDB = async (search = '') => {
  try {
    let query = `
      SELECT data, updated_at
      FROM businesses
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND json_extract(data, '$.name') LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY datetime(updated_at) DESC`;

    const result = await executeQuery(query, params);

    const list = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);

      let parsed;
      try {
        parsed = JSON.parse(item.data);
      } catch {
        continue;
      }

      if (
        parsed?.isSponsored !== true &&
        parsed?.isActivate === true &&
        parsed?.isDelete !== true
      ) {
        list.push(parsed);
      }
    }

    return list;
  } catch (error) {
    return [];
  }
};

export const searchSponsors = async (query, limit = 20) =>
  getSponsors(1, limit, query);

export const searchBusinesses = async (query, limit = 20) =>
  getBusinesses(1, limit, query);

export const cleanupOldSponsors = async (limit = 200) => {
  const db = await getDatabase();
  await db.executeSql(`
    DELETE FROM sponsors
    WHERE sponsor_id NOT IN (
      SELECT sponsor_id FROM sponsors
      ORDER BY updated_at DESC
      LIMIT ${limit}
    )
  `);
};

export const cleanupOldBusinesses = async (limit = 200) => {
  const db = await getDatabase();
  await db.executeSql(`
    DELETE FROM businesses
    WHERE business_id NOT IN (
      SELECT business_id FROM businesses
      ORDER BY updated_at DESC
      LIMIT ${limit}
    )
  `);
};

const mapRows = res => {
  const arr = [];
  for (let i = 0; i < res.rows.length; i++) {
    arr.push(JSON.parse(res.rows.item(i).data));
  }
  return arr;
};

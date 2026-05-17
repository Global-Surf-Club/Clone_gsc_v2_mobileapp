// database/schema.js
// ✅ FINAL FULL SCHEMA WITH ALL TABLES + ALL INDEXES (ZERO LOSS)
// Merged from FIRST + SECOND files exactly, nothing missing

import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

export const DATABASE_NAME = 'gsc_app.db';
// export const DATABASE_VERSION = 1;
export const DATABASE_VERSION = 2;

let databaseInstance = null;
let isInitialized = false;

export const initDatabase = async () => {
  if (isInitialized && databaseInstance) return databaseInstance;

  try {
    const db = await SQLite.openDatabase({
      name: DATABASE_NAME,
      location: 'default',
    });
    await createTables(db);
    await createIndexes(db); // ✅ INDEXES CREATED HERE
    await migrateDatabase(db);

    databaseInstance = db;
    isInitialized = true;

    return db;
  } catch (error) {
    throw error;
  }
};
const migrateDatabase = async db => {
  const [result] = await db.executeSql('PRAGMA user_version');
  const currentVersion = result.rows.item(0).user_version;

  if (currentVersion < 2) {
    await migrateToVersion2(db);
    await db.executeSql('PRAGMA user_version = 2');
  }
};

const migrateToVersion2 = async db => {
  await db.transaction(async tx => {
    // ✅ Check if table exists
    const [result] = await tx.executeSql(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='trip_chat_messages'
    `);

    if (result.rows.length === 0) {
      // Table doesn't exist → Fresh install case
      return;
    }

    // Existing table case
    await tx.executeSql(`
      ALTER TABLE trip_chat_messages 
      RENAME TO trip_chat_messages_old
    `);

    await tx.executeSql(`
      CREATE TABLE trip_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        trip_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_text TEXT,
        message_type TEXT DEFAULT 'text',
        created_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
      )
    `);

    await tx.executeSql(`
      INSERT INTO trip_chat_messages (
        id,
        message_id,
        trip_id,
        user_id,
        message_text,
        message_type,
        created_at,
        sync_status,
        data
      )
      SELECT
        id,
        message_id,
        trip_id,
        user_id,
        message_text,
        message_type,
        created_at,
        sync_status,
        data
      FROM trip_chat_messages_old
    `);

    await tx.executeSql(`DROP TABLE trip_chat_messages_old`);
  });
};

/* ===================== TABLE CREATION ===================== */
const createTables = async db => {
  try {
    /* ---------------- CORE / AUTH ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS app_users (
      id INTEGER PRIMARY KEY,
      user_id INTEGER UNIQUE,
      email TEXT UNIQUE,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      image_profile_url TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      user_role TEXT,
      is_vouch INTEGER DEFAULT 0,
      is_current_user INTEGER DEFAULT 0,
      last_login TEXT,
      created_at TEXT,
      updated_at TEXT,
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      email TEXT,
      token TEXT,
      fcm_token TEXT,
      login_time TEXT,
      logout_time TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY,
      setting_key TEXT UNIQUE,
      setting_value TEXT,
      updated_at TEXT
    )`);

    /* ---------------- SPONSORS / BUSINESS ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS sponsors (
      id INTEGER PRIMARY KEY,
      sponsor_id INTEGER UNIQUE,
      name TEXT,
      phone_number TEXT,
      website TEXT,
      address TEXT,
      is_sponsored INTEGER DEFAULT 1,
      is_activate INTEGER DEFAULT 1,
      qrcode_string TEXT,
      sponsorship TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY,
      business_id INTEGER UNIQUE,
      name TEXT,
      phone_number TEXT,
      website TEXT,
      email TEXT,
      address TEXT,
      is_sponsored INTEGER DEFAULT 0,
      is_activate INTEGER DEFAULT 1,
      qrcode_string TEXT,
      business_type TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    /* ---------------- SYNC / OFFLINE ---------------- */

    await db.executeSql(`CREATE TABLE IF NOT EXISTS pending_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_id TEXT UNIQUE NOT NULL,
      action_type TEXT NOT NULL,
      entity_id TEXT,
      payload TEXT,
      timestamp TEXT,
      retry_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending',
      error TEXT
    )`);
    await db.executeSql(`CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT,
      action_type TEXT,
      record_id INTEGER,
      payload TEXT NOT NULL,
      sync_status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS cache_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module TEXT,
      action_type TEXT,
      record_id INTEGER,
      user_id INTEGER,
      payload TEXT,
      sync_status TEXT DEFAULT 'pending',
      created_at TEXT
    )`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS personal_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_name TEXT,
        sender_image TEXT,
        receiver_id TEXT NOT NULL,
        message_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_pending INTEGER DEFAULT 0,
        is_failed INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
         data TEXT NOT NULL,
        UNIQUE(chat_id, message_id)
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS pending_chat_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_id TEXT UNIQUE NOT NULL,
        action_type TEXT NOT NULL,
        entity_id TEXT,
        payload TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        error TEXT
      )
    `);

    /* ---------------- REGIONS / SPOTS ---------------- */

    await db.executeSql(`CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      region_id TEXT UNIQUE NOT NULL,
      name TEXT,
      country TEXT,
      state TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS spots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spot_id TEXT UNIQUE NOT NULL,
      region_id TEXT,
      title TEXT,
      description TEXT,
      latitude REAL,
      longitude REAL,
      city TEXT,
      state TEXT,
      country TEXT,
      is_favourite INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    /* ---------------- TRIPS ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      spot_id TEXT,
      title TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      organizer_id TEXT,
      max_passengers INTEGER DEFAULT 0,
      current_passengers INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS current_trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      spot_id TEXT,
      title TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'active',
      organizer_id TEXT,
      max_passengers INTEGER DEFAULT 0,
      current_passengers INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      amount REAL DEFAULT 0,
      category TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment_text TEXT,
      parent_comment_id TEXT,
      likes_count INTEGER DEFAULT 0,
      is_liked INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      passenger_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_image TEXT,
      status TEXT DEFAULT 'pending',
      joined_at TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_pending_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pending_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      request_type TEXT DEFAULT 'join',
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_interested_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interest_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS invited_trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invite_id TEXT UNIQUE NOT NULL,
        trip_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        inviter_id TEXT,
        status INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
      )
    `);

    await db.executeSql(`
  CREATE TABLE IF NOT EXISTS invited_trips_id (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invite_id TEXT UNIQUE NOT NULL,
    trip_id TEXT NOT NULL
  )
`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS suggested_trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id TEXT UNIQUE NOT NULL,
        user_id TEXT,
        distance REAL,
        created_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS trip_reports_main (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id TEXT UNIQUE NOT NULL,
        trip_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        spot_id TEXT,
        title TEXT,
        description TEXT,
        rating INTEGER DEFAULT 0,
        image_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        is_liked INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
      )
    `);

    await db.executeSql(`
  CREATE TABLE IF NOT EXISTS trip_report_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id TEXT UNIQUE NOT NULL,
    report_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comment_text TEXT,
    likes_count INTEGER DEFAULT 0,
    is_liked INTEGER DEFAULT 0,
    created_at TEXT,
    sync_status TEXT DEFAULT 'synced',
    data TEXT NOT NULL
  )
`);
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS trip_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        trip_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_text TEXT,
        message_type TEXT DEFAULT 'text',
        created_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
     )
    `);

    /* ---------------- WEATHER / FORECAST ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS spot_forecast (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      forecast_id TEXT UNIQUE NOT NULL,
      spot_id TEXT NOT NULL,
      forecast_date TEXT,
      forecast_type TEXT,
      created_at TEXT,
      updated_at TEXT,
      expires_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS tide_extremes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tide_id TEXT UNIQUE NOT NULL,
      spot_id TEXT NOT NULL,
      tide_date TEXT,
      tide_time TEXT,
      tide_type TEXT,
      height REAL,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS astronomy_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronomy_id TEXT UNIQUE NOT NULL,
      spot_id TEXT NOT NULL,
      date TEXT,
      sunrise TEXT,
      sunset TEXT,
      moonrise TEXT,
      moonset TEXT,
      moon_phase TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS nearby_spots_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_id TEXT UNIQUE NOT NULL,
        spot_id TEXT NOT NULL,
        nearby_spot_id TEXT NOT NULL,
        distance REAL,
        created_at TEXT,
        expires_at TEXT,
        data TEXT NOT NULL
      )
    `);

    /* ---------------- COMMUNITY / FORUM ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS community_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      post_type TEXT DEFAULT 'general',
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      is_liked INTEGER DEFAULT 0,
      expiry_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS spot_reasons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reason_id TEXT NOT NULL UNIQUE,
        parent_id TEXT,
        name TEXT,
        depth TEXT,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS spots_by_reason (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        spot_id TEXT NOT NULL,
        reason_id TEXT NOT NULL,
        created_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL,
        UNIQUE(spot_id, reason_id)
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS spot_configuration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_id TEXT UNIQUE NOT NULL,
        spot_id TEXT NOT NULL,
        configuration_data TEXT,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced',
        data TEXT NOT NULL
      )
    `);

    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS trip_pending_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_id TEXT UNIQUE NOT NULL,
        action_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        payload TEXT NOT NULL,
        sync_status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      club_id TEXT DEFAULT '-999',
      author_name TEXT,
      author_image TEXT,
      author_info TEXT,
      image_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      is_liked INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS forum_post_details (
      post_id TEXT PRIMARY KEY,
      data TEXT,
      created_at TEXT,
      updated_at TEXT
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS forum_post_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id TEXT UNIQUE NOT NULL,
      post_id TEXT NOT NULL,
      image_url TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS forum_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id TEXT UNIQUE NOT NULL,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment_text TEXT,
      author_name TEXT,
      author_image TEXT,
      like_count INTEGER DEFAULT 0,
      is_liked INTEGER DEFAULT 0,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS pending_forum_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      post_id TEXT,
      user_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      images_data TEXT,
      comment_id TEXT,
      comment_text TEXT,
      parent_id TEXT,
      sync_status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )`);

    /* ---------------- PROFILE ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      gender INTEGER,
      about_me TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      zip_code TEXT,
      board_size INTEGER DEFAULT 0,
      surfer_skill_level INTEGER DEFAULT 0,
      car_owner INTEGER DEFAULT 0,
      car_capacity INTEGER DEFAULT 0,
      image_profile_url TEXT,
      trip_count INTEGER DEFAULT 0,
      report_count INTEGER DEFAULT 0,
      friend_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS profile_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      image_url TEXT,
      image_type TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS profile_trip_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      trip_id TEXT,
      title TEXT,
      description TEXT,
      rating INTEGER DEFAULT 0,
      image_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      friend_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      friend_user_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS friend_requests_sent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS friend_requests_received (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    /* ---------------- PROFILE VIEWS ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS profile_trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      location TEXT,
      is_public INTEGER DEFAULT 1,
      organizer_id TEXT,
      passenger_count INTEGER DEFAULT 0,
      driver_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL,
      UNIQUE(trip_id, user_id)
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS profile_clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      logo_path TEXT,
      title TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      trip_count INTEGER DEFAULT 0,
      trip_reports_count INTEGER DEFAULT 0,
      members_count INTEGER DEFAULT 0,
      organizer_id TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL,
      UNIQUE(club_id, user_id)
    )`);

    /* ---------------- EVENTS ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      event_id INTEGER UNIQUE,
      user_id INTEGER,
      club_id INTEGER,
      organizer_id INTEGER,
      status INTEGER DEFAULT -1,
      is_like INTEGER DEFAULT 0,
      total_like_count INTEGER DEFAULT 0,
      total_comment_count INTEGER DEFAULT 0,
      start_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS my_events (
      id INTEGER PRIMARY KEY,
      event_id INTEGER UNIQUE,
      user_id INTEGER,
      organizer_id INTEGER,
      status INTEGER DEFAULT -1,
      is_like INTEGER DEFAULT 0,
      total_like_count INTEGER DEFAULT 0,
      total_comment_count INTEGER DEFAULT 0,
      start_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_events (
      id INTEGER PRIMARY KEY,
      event_id INTEGER,
      club_id INTEGER,
      user_id INTEGER,
      organizer_id INTEGER,
      status INTEGER DEFAULT -1,
      is_like INTEGER DEFAULT 0,
      total_like_count INTEGER DEFAULT 0,
      total_comment_count INTEGER DEFAULT 0,
      start_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL,
      UNIQUE(event_id, club_id)
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS event_comments (
      id INTEGER PRIMARY KEY,
      comment_id INTEGER UNIQUE,
      event_id INTEGER,
      user_id INTEGER,
      likes_count INTEGER DEFAULT 0,
      liked INTEGER DEFAULT 0,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS event_members (
      id INTEGER PRIMARY KEY,
      member_id INTEGER,
      event_id INTEGER,
      user_id INTEGER,
      status TEXT,
      member_type TEXT DEFAULT 'all',
      created_at TEXT,
      data TEXT NOT NULL,
      UNIQUE(member_id, event_id)
    )`);

    /* ---------------- NOTIFICATIONS ---------------- */
    await db.executeSql(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notification_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT,
      title TEXT,
      message TEXT,
      is_read INTEGER DEFAULT 0,
      target_id TEXT,
      target_type TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      organizer_id TEXT,
      organizer_name TEXT,
      logo_path TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      zip_code TEXT,
      members_count INTEGER DEFAULT 0,
      trip_count INTEGER DEFAULT 0,
      trip_reports_count INTEGER DEFAULT 0,
      status TEXT,
      is_public INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS my_clubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT,
      description TEXT,
      organizer_id TEXT,
      logo_path TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      members_count INTEGER DEFAULT 0,
      trip_count INTEGER DEFAULT 0,
      trip_reports_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Joined',
      role TEXT DEFAULT 'Member',
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      club_id TEXT UNIQUE NOT NULL,
      title TEXT,
      description TEXT,
      organizer_id TEXT,
      organizer_name TEXT,
      organizer_image TEXT,
      logo_path TEXT,
      banner_path TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      zip_code TEXT,
      members_count INTEGER DEFAULT 0,
      trip_count INTEGER DEFAULT 0,
      trip_reports_count INTEGER DEFAULT 0,
      status TEXT,
      is_public INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT,
      last_fetched TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT UNIQUE NOT NULL,
      club_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      user_image TEXT,
      user_city TEXT,
      user_state TEXT,
      role TEXT DEFAULT 'Member',
      status TEXT DEFAULT 'Active',
      joined_at TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL,
      FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id TEXT UNIQUE NOT NULL,
      club_id TEXT NOT NULL,
      image_url TEXT,
      image_type TEXT DEFAULT 'galleryimage',
      uploaded_by TEXT,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL,
      FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_forum (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      forum_id TEXT UNIQUE NOT NULL,
      club_id TEXT NOT NULL,
      user_id TEXT,
      title TEXT,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT UNIQUE NOT NULL,
      club_id TEXT NOT NULL,
      user_id TEXT,
      title TEXT,
      start_date TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_pending_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      club_id TEXT,
      user_id TEXT NOT NULL,
      target_id TEXT,
      payload TEXT,
      sync_status TEXT DEFAULT 'pending',
      retry_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS club_trip_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT UNIQUE NOT NULL,
      club_id TEXT NOT NULL,
      trip_id TEXT,
      user_id TEXT,
      title TEXT,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);
    await db.executeSql(`CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      participant_id TEXT NOT NULL,
      last_message TEXT,
      last_message_time TEXT,
      unread_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
    )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id TEXT NOT NULL,
      like_id TEXT NOT NULL,
      user_like_id TEXT,
      created_at TEXT,
      synced INTEGER DEFAULT 1,
      UNIQUE(trip_id, like_id)
      )`);

    await db.executeSql(`CREATE TABLE IF NOT EXISTS trip_report_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id TEXT NOT NULL,
      like_id TEXT NOT NULL,
      user_like_id TEXT,
      created_at TEXT,
      synced INTEGER DEFAULT 1,
      UNIQUE(report_id, like_id)
      )`);
    await db.executeSql(`CREATE TABLE IF NOT EXISTS join_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT UNIQUE NOT NULL,
      trip_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      is_driver INTEGER DEFAULT 0,
      status INTEGER DEFAULT 0,
      created_at TEXT,
      sync_status TEXT DEFAULT 'synced',
      data TEXT NOT NULL
      )`);

    await db.executeSql(`
CREATE TABLE IF NOT EXISTS trip_chat_unread (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  unread_count INTEGER DEFAULT 0,
  last_read_message_id TEXT,
  updated_at TEXT,
  UNIQUE(trip_id, user_id)
)`);

    await db.executeSql(`
  CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);
  } catch (e) {
    throw e;
  }
};

/* ===================== INDEXES ===================== */
const createIndexes = async db => {
  try {
    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_personal_chat_chat_id 
      ON personal_chat_messages(chat_id)
    `);

    await db.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_personal_chat_created_at 
      ON personal_chat_messages(chat_id, created_at DESC)
    `);
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_sponsors_name ON sponsors(name)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_clubs_organizer ON clubs(organizer_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_my_clubs_user ON my_clubs(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_members_club ON club_members(club_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_members_user ON club_members(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_gallery_club ON club_gallery(club_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_forum_club ON club_forum(club_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_trips_club ON club_trips(club_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_trip_reports_club ON club_trip_reports(club_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_club_pending_actions_status ON club_pending_actions(sync_status)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_users_email ON app_users(email)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_users_username ON app_users(username)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_users_current ON app_users(is_current_user)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(sync_status)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON pending_actions(status)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_cache_actions_status ON cache_actions(sync_status)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_spots_region ON spots(region_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_spots_favourite ON spots(is_favourite)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trips ON current_trips(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trips_spot ON trips(spot_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(start_date)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip ON trip_expenses(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_comments_trip ON trip_comments(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_passengers_trip ON trip_passengers(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_pending_trip ON trip_pending_users(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_interested_trip ON trip_interested_users(trip_id)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_invited_trips_user ON invited_trips(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_reports_trip ON trip_reports_main(trip_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_trip_chat_trip ON trip_chat_messages(trip_id)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_forecast_spot ON spot_forecast(spot_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_forecast_date ON spot_forecast(forecast_date)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_tide_spot ON tide_extremes(spot_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_astronomy_spot ON astronomy_data(spot_id)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_community_created ON community_list(created_at)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_pending_forum_status ON pending_forum_actions(sync_status)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_profile_images_user ON profile_images(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_profile_reports_user ON profile_trip_reports(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_profile_trips_user ON profile_trips(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_profile_clubs_user ON profile_clubs(user_id)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date)',
    );

    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
    );
    await db.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)',
    );
  } catch (e) {
    throw e;
  }
};

export const getDatabase = async () => databaseInstance ?? initDatabase();

export const closeDatabase = async db => {
  if (!db) return;
  await db.close();
  databaseInstance = null;
  isInitialized = false;
};

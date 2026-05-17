// database/tripDbHelper.js
import { getDatabase } from './schema';
import moment from 'moment';

// Generic Helper Functions
const executeQuery = async (query, params = []) => {
  try {
    const db = await getDatabase();
    const [result] = await db.executeSql(query, params);
    return result;
  } catch (error) {
    throw error;
  }
};

const parseData = item => {
  try {
    return item.data ? JSON.parse(item.data) : null;
  } catch (error) {
    return null;
  }
};

// ==================== TRIP LIKES ====================

export const saveTripLikes = async (tripId, likes) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS trip_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_id TEXT NOT NULL,
            like_id TEXT NOT NULL,
            user_like_id TEXT,
            created_at TEXT,
            synced INTEGER DEFAULT 1,
            UNIQUE(trip_id, like_id)
          )`,
          [],
          () => {
            tx.executeSql(
              'DELETE FROM trip_likes WHERE trip_id = ?',
              [tripId.toString()],
              () => {
                if (!likes || likes.length === 0) {
                  resolve(true);
                  return;
                }

                let completed = 0;
                likes.forEach(like => {
                  tx.executeSql(
                    `INSERT INTO trip_likes (trip_id, like_id, user_like_id, created_at, synced) 
                     VALUES (?, ?, ?, ?, 1)`,
                    [
                      tripId.toString(),
                      like.id?.toString() || '',
                      like.userLikeId?.toString() || '',
                      like.createdAt || new Date().toISOString(),
                    ],
                    () => {
                      completed++;
                      if (completed === likes.length) {
                        resolve(true);
                      }
                    },
                    (_, error) => {
                      completed++;
                      if (completed === likes.length) {
                        resolve(true);
                      }
                    },
                  );
                });
              },
              (_, error) => reject(error),
            );
          },
          (_, error) => reject(error),
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const getTripLikesFromDB = async tripId => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM trip_likes WHERE trip_id = ?',
          [tripId.toString()],
          (_, { rows }) => {
            const likes = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              likes.push({
                id: row.like_id,
                userLikeId: row.user_like_id,
                createdAt: row.created_at,
              });
            }
            resolve(likes);
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

export const addOptimisticLike = async (tripId, userId) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      const tempId = `temp-${Date.now()}`;
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO trip_likes (trip_id, like_id, user_like_id, created_at, synced) 
           VALUES (?, ?, ?, ?, 0)`,
          [
            tripId.toString(),
            tempId,
            userId.toString(),
            new Date().toISOString(),
          ],
          (_, result) => resolve({ id: tempId, tempId }),
          (_, error) => reject(error),
        );
      });
    });
  } catch (error) {
    return null;
  }
};

export const removeOptimisticLike = async (tripId, userId) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM trip_likes WHERE trip_id = ? AND user_like_id = ?',
          [tripId.toString(), userId.toString()],
          () => resolve(true),
          (_, error) => reject(error),
        );
      });
    });
  } catch (error) {
    return false;
  }
};

// ==================== TRIP REPORT LIKES ====================

export const saveTripReportLikes = async (reportId, likes) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS trip_report_likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id TEXT NOT NULL,
            like_id TEXT NOT NULL,
            user_like_id TEXT,
            created_at TEXT,
            synced INTEGER DEFAULT 1,
            UNIQUE(report_id, like_id)
          )`,
          [],
          () => {
            tx.executeSql(
              'DELETE FROM trip_report_likes WHERE report_id = ?',
              [reportId.toString()],
              () => {
                if (!likes || likes.length === 0) {
                  resolve(true);
                  return;
                }

                let completed = 0;
                likes.forEach(like => {
                  tx.executeSql(
                    `INSERT INTO trip_report_likes (report_id, like_id, user_like_id, created_at, synced) 
                     VALUES (?, ?, ?, ?, 1)`,
                    [
                      reportId.toString(),
                      like.id?.toString() || '',
                      like.userLikeId?.toString() || '',
                      like.createdAt || new Date().toISOString(),
                    ],
                    () => {
                      completed++;
                      if (completed === likes.length) {
                        resolve(true);
                      }
                    },
                    (_, error) => {
                      completed++;
                      if (completed === likes.length) {
                        resolve(true);
                      }
                    },
                  );
                });
              },
              (_, error) => reject(error),
            );
          },
          (_, error) => reject(error),
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const getTripReportLikesFromDB = async reportId => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM trip_report_likes WHERE report_id = ?',
          [reportId.toString()],
          (_, { rows }) => {
            const likes = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              likes.push({
                id: row.like_id,
                userLikeId: row.user_like_id,
                createdAt: row.created_at,
              });
            }
            resolve(likes);
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

export const addPendingAction = async action => {
  try {
    const db = await getDatabase();

    const actionId = action.actionId || `action-${Date.now()}`;
    const timestamp = action.timestamp || new Date().toISOString();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO pending_actions (
            action_id,
            action_type,
            entity_id,
            payload,
            timestamp,
            status,
            retry_count
          ) VALUES (?, ?, ?, ?, datetime('now'), 'pending', 0)`,
          [
            actionId,
            action.actionType,
            action.entityId?.toString() || null,
            JSON.stringify(action.payload || {}),
          ],
          (_, result) => {
            tx.executeSql(
              `SELECT COUNT(*) as count FROM pending_actions`,
              [],
              (_, { rows }) => {},
            );

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

export const getPendingActions = async () => {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
        SELECT
          id,
          action_id,
          action_type,
          entity_id,
          timestamp,
          retry_count,
          status,
          error
        FROM pending_actions
        WHERE status = 'pending'
          AND retry_count < 3
        ORDER BY timestamp ASC
        `,
        [],
        (_, result) => {
          const actions = [];

          for (let i = 0; i < result.rows.length; i++) {
            actions.push(result.rows.item(i));
          }

          resolve(actions);
        },
        error => {
          return false;
        },
      );
    });
  });
};

export const getPendingActionPayload = async id => {
  const db = await getDatabase();

  const [result] = await db.executeSql(
    `SELECT payload FROM pending_actions WHERE id = ?`,
    [id],
  );

  if (result.rows.length === 0) return null;

  try {
    return JSON.parse(result.rows.item(0).payload);
  } catch {
    return null;
  }
};

export const saveRegions = async regions => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const region of regions) {
        const regionId = region.id?.toString() || region.regionId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO regions 
          (region_id, name, country, state, created_at, updated_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            regionId,
            region.name || '',
            region.country || '',
            region.state || '',
            region.createdAt || moment().toISOString(),
            moment().toISOString(),
            'synced',
            JSON.stringify(region),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getRegionsFromDB = async () => {
  try {
    const result = await executeQuery(
      'SELECT * FROM regions ORDER BY name ASC',
    );
    const regions = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) regions.push(data);
    }
    return regions;
  } catch (error) {
    return [];
  }
};

export const saveSpot = async (spotId, spotData) => {
  try {
    const db = await getDatabase();
    const id = spotId?.toString() || spotData.id?.toString();

    await db.executeSql(
      `INSERT OR REPLACE INTO spots 
      (spot_id, region_id, title, description, latitude, longitude, city, state, country, 
       is_favourite, created_at, updated_at, sync_status, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        spotData.regionId?.toString() || '',
        spotData.title || '',
        spotData.description || '',
        spotData.latitude || spotData.address?.locationLat || 0,
        spotData.longitude || spotData.address?.locationLng || 0,
        spotData.city || spotData.address?.city || '',
        spotData.state || spotData.address?.state || '',
        spotData.country || spotData.address?.country || '',
        spotData.isFavourite ? 1 : 0,
        spotData.createdAt || moment().toISOString(),
        moment().toISOString(),
        'synced',
        JSON.stringify(spotData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getSpotFromDB = async spotId => {
  try {
    const result = await executeQuery('SELECT * FROM spots WHERE spot_id = ?', [
      spotId?.toString(),
    ]);
    if (result.rows.length > 0) {
      const spot = parseData(result.rows.item(0));
      return spot;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getFavouriteSpotsFromDB = async () => {
  try {
    const result = await executeQuery(
      'SELECT * FROM spots WHERE is_favourite = 1 ORDER BY title ASC',
    );
    const spots = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) spots.push(data);
    }
    return spots;
  } catch (error) {
    return [];
  }
};

// ==================== TRIPS ====================

export const saveTrips = async trips => {
  try {
    const db = await getDatabase();

    db.transaction(
      tx => {
        trips.forEach(trip => {
          const tripId = trip?.id?.toString() || trip?.tripId?.toString();

          if (!tripId) return;

          tx.executeSql(
            `INSERT OR REPLACE INTO trips 
          (trip_id, user_id, spot_id, title, description, start_date, end_date, status, 
           organizer_id, max_passengers, current_passengers, created_at, updated_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              tripId,
              trip?.organizer?.id?.toString() || '',
              trip.spotId?.toString() || '',
              trip.title || '',
              trip.description || '',
              trip.startDate || '',
              trip.endDate || '',
              (trip.status && 'active') || 'active',
              trip.organizerId?.toString() || '',
              trip.maxPassengers || 0,
              trip.currentPassengers || 0,
              trip.createdAt || moment().toISOString(),
              trip.updatedAt || moment().toISOString(),
              'synced',
              JSON.stringify(trip),
            ],
          );
        });
      },
      err => {},
      () => {},
    );

    return true;
  } catch (e) {
    return false;
  }
};

export const getTripsPaginated = async (userId, filter, pageNo, pageSize) => {
  try {
    const offset = (pageNo - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    let query = 'SELECT * FROM trips';
    const params = [];

    if (filter === 'profile') {
      query += ' WHERE user_id = ? ORDER BY updated_at DESC';
      params.push(userId?.toString());
    } else {
      query += ' WHERE status = "active" ORDER BY updated_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await executeQuery(query, params);

    const trips = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) trips.push(data);
    }

    return trips;
  } catch (error) {
    return [];
  }
};

export const getCurrentTripFromDB = async tripId => {
  try {
    const result = await executeQuery(
      'SELECT * FROM current_trips WHERE trip_id = ?',
      [tripId?.toString()],
    );
    if (result.rows.length > 0) {
      return parseData(result.rows.item(0));
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveCurrentTrip = async trip => {
  try {
    const tripId = trip.id?.toString() || trip.tripId?.toString();
    const db = await getDatabase();
    await db.executeSql(
      `INSERT OR REPLACE INTO current_trips 
      (trip_id, user_id, spot_id, title, description, start_date, end_date, status, 
       organizer_id, max_passengers, current_passengers, created_at, updated_at, sync_status, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tripId,
        trip?.organizer?.id?.toString() || '',
        trip.spotId?.toString() || '',
        trip.title || '',
        trip.description || '',
        trip.startDate || '',
        trip.endDate || '',
        (trip.status && 'active') || 'active',
        trip.organizerId?.toString() || '',
        trip.maxPassengers || 0,
        trip.currentPassengers || 0,
        trip.createdAt || moment().toISOString(),
        moment().toISOString(),
        'synced',
        JSON.stringify(trip),
      ],
    );
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== EXPENSES ====================

export const saveExpenses = async (tripId, expenses) => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const expense of expenses) {
        const expenseId =
          expense.id?.toString() || expense.expenseId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO trip_expenses 
          (expense_id, trip_id, user_id, title, amount, category, description, 
           created_at, updated_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            expenseId,
            tripId?.toString(),
            expense.userId?.toString() || '',
            expense.title || '',
            expense.amount || 0,
            expense.category || '',
            expense.description || '',
            expense.createdAt || moment().toISOString(),
            moment().toISOString(),
            'synced',
            JSON.stringify(expense),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getExpensesFromDB = async (tripId, pageNo, pageSize) => {
  try {
    const offset = (pageNo - 1) * parseInt(pageSize);
    const result = await executeQuery(
      `SELECT * FROM trip_expenses WHERE trip_id = ? 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [tripId?.toString(), parseInt(pageSize), offset],
    );
    const expenses = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) expenses.push(data);
    }
    return expenses;
  } catch (error) {
    return [];
  }
};

export const saveComments = async (tripId, comments = []) => {
  if (!tripId || !Array.isArray(comments)) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          const commentsToSave = comments.slice(0, 10);
          if (commentsToSave.length === 0) {
            resolve(true);
            return;
          }

          let savedCount = 0;
          let errorCount = 0;

          commentsToSave.forEach((comment, index) => {
            // Extract comment ID properly
            const commentId =
              comment.id?.toString() ||
              comment.commentId?.toString() ||
              `temp-${Date.now()}-${index}`;

            // Extract user ID
            const userId =
              comment.userId?.toString() ||
              comment.author?.id?.toString() ||
              comment.auther?.id?.toString() ||
              '';

            // Extract comment text
            const commentText =
              comment.commentText?.toString() ||
              comment.comment?.toString() ||
              '';

            tx.executeSql(
              `INSERT OR REPLACE INTO trip_comments (
              comment_id,
              trip_id,
              user_id,
              comment_text,
              parent_comment_id,
              likes_count,
              is_liked,
              created_at,
              updated_at,
              sync_status,
              data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                commentId,
                tripId.toString(),
                userId,
                commentText,
                comment.parentCommentId?.toString() || '',
                comment.likesCount || 0,
                comment.isLiked ? 1 : 0,
                comment.createdAt || new Date().toISOString(),
                new Date().toISOString(),
                'synced',
                JSON.stringify(comment),
              ],
              (_, result) => {
                savedCount++;
                if (savedCount + errorCount === commentsToSave.length) {
                  resolve(savedCount > 0);
                }
              },
              (_, error) => {
                errorCount++;
                if (savedCount + errorCount === commentsToSave.length) {
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

export const getCommentsFromDB = async (tripId, pageNo, pageSize) => {
  if (!tripId) {
    return [];
  }

  try {
    const offset = (pageNo - 1) * parseInt(pageSize);

    const result = await executeQuery(
      `SELECT * FROM trip_comments 
       WHERE trip_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`,
      [tripId.toString(), parseInt(pageSize), offset],
    );

    const comments = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);

      try {
        const data = parseData(item);

        if (data) {
          // Ensure proper structure
          const formattedComment = {
            ...data,
            id: data.id || item.comment_id,
            comment: data.comment || data.commentText || item.comment_text,
            author: data.author ||
              data.auther || {
                id: item.user_id,
                imageProfileUrl:
                  data.author?.thumbnailProfileImage ||
                  data.auther?.thumbnailProfileImage,
              },
            createdAt: data.createdAt || item.created_at,
            isPending: item.sync_status !== 'synced',
          };

          comments.push(formattedComment);
        } else {
        }
      } catch (parseError) {}
    }

    return comments;
  } catch (error) {
    return [];
  }
};

export const savePassengers = async (tripId, passengers) => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const passenger of passengers) {
        const passengerId =
          passenger?.id?.toString() || passenger?.passengerId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO trip_passengers 
          (passenger_id, trip_id, user_id, user_name, user_image, status, 
           joined_at, created_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            passengerId,
            tripId?.toString(),
            passenger?.userId?.toString() || '',
            passenger?.userName || '',
            passenger?.userImage || '',
            passenger?.status || 'approved',
            passenger?.createdAt || moment().toISOString(),
            moment().toISOString(),
            'synced',
            JSON.stringify(passenger),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getPassengersFromDB = async tripId => {
  try {
    const result = await executeQuery(
      'SELECT * FROM trip_passengers WHERE trip_id = ? ORDER BY joined_at ASC',
      [tripId?.toString()],
    );
    const passengers = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) passengers.push(data);
    }
    return passengers;
  } catch (error) {
    return [];
  }
};

// ==================== PENDING USERS ====================

export const savePendingUsers = async (tripId, users) => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const user of users) {
        const pendingId = user.id?.toString() || user.pendingId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO trip_pending_users 
          (pending_id, trip_id, user_id, request_type, status, created_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pendingId,
            tripId?.toString(),
            user.userId?.toString() || '',
            user.requestType || 'join',
            user.status || 'pending',
            user.createdAt || moment().toISOString(),
            'synced',
            JSON.stringify(user),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getPendingUsersFromDB = async tripId => {
  try {
    const result = await executeQuery(
      'SELECT * FROM trip_pending_users WHERE trip_id = ? AND status = "pending"',
      [tripId?.toString()],
    );
    const users = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) users.push(data);
    }
    return users;
  } catch (error) {
    return [];
  }
};

// ==================== INTERESTED USERS ====================

export const saveInterestedUsers = async (tripId, users) => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const user of users) {
        const interestId = user.id?.toString() || user.interestId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO trip_interested_users 
          (interest_id, trip_id, user_id, created_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            interestId,
            tripId?.toString(),
            user.userId?.toString() || '',
            user.createdAt || moment().toISOString(),
            'synced',
            JSON.stringify(user),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getInterestedUsersFromDB = async tripId => {
  try {
    const result = await executeQuery(
      'SELECT * FROM trip_interested_users WHERE trip_id = ?',
      [tripId?.toString()],
    );
    const users = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) users.push(data);
    }
    return users;
  } catch (error) {
    return [];
  }
};

// ==================== FORECAST DATA ====================

export const saveForecastData = async (
  spotId,
  forecastData,
  type = 'weather',
) => {
  try {
    const db = await getDatabase();
    const forecastId = `${spotId}_${type}_${moment().format('YYYY-MM-DD')}`;
    const expiresAt = moment().add(6, 'hours').toISOString();

    await db.executeSql(
      `INSERT OR REPLACE INTO spot_forecast 
      (forecast_id, spot_id, forecast_date, forecast_type, created_at, updated_at, expires_at, sync_status, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        forecastId,
        spotId?.toString(),
        moment().format('YYYY-MM-DD'),
        type,
        moment().toISOString(),
        moment().toISOString(),
        expiresAt,
        'synced',
        JSON.stringify(forecastData),
      ],
    );

    return true;
  } catch (error) {
    return false;
  }
};

export const getForecastFromDB = async (spotId, type = 'weather') => {
  try {
    const now = moment().toISOString();
    const result = await executeQuery(
      `SELECT * FROM spot_forecast 
       WHERE spot_id = ? AND forecast_type = ? AND expires_at > ?
       ORDER BY created_at DESC LIMIT 1`,
      [spotId?.toString(), type, now],
    );

    if (result.rows.length > 0) {
      const forecast = parseData(result.rows.item(0));
      return forecast;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const saveForecastProcessedData = async (spotId, processedData) => {
  try {
    const db = await getDatabase();
    const {
      averageList,
      seperateByday,
      tideExtremesByday,
      astronomyByDay,
      spotConfiguration,
    } = processedData;

    // Save each type of processed data
    if (averageList) {
      await db.executeSql(
        `INSERT OR REPLACE INTO spot_forecast 
        (forecast_id, spot_id, forecast_type, created_at, expires_at, data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${spotId}_average`,
          spotId.toString(),
          'average',
          moment().toISOString(),
          moment().add(6, 'hours').toISOString(),
          JSON.stringify(averageList),
        ],
      );
    }

    if (seperateByday) {
      await db.executeSql(
        `INSERT OR REPLACE INTO spot_forecast 
        (forecast_id, spot_id, forecast_type, created_at, expires_at, data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${spotId}_byday`,
          spotId.toString(),
          'byday',
          moment().toISOString(),
          moment().add(6, 'hours').toISOString(),
          JSON.stringify(seperateByday),
        ],
      );
    }

    if (tideExtremesByday) {
      await db.executeSql(
        `INSERT OR REPLACE INTO spot_forecast 
        (forecast_id, spot_id, forecast_type, created_at, expires_at, data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${spotId}_tides`,
          spotId.toString(),
          'tides',
          moment().toISOString(),
          moment().add(6, 'hours').toISOString(),
          JSON.stringify(tideExtremesByday),
        ],
      );
    }

    if (astronomyByDay) {
      await db.executeSql(
        `INSERT OR REPLACE INTO spot_forecast 
        (forecast_id, spot_id, forecast_type, created_at, expires_at, data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${spotId}_astronomy`,
          spotId.toString(),
          'astronomy',
          moment().toISOString(),
          moment().add(6, 'hours').toISOString(),
          JSON.stringify(astronomyByDay),
        ],
      );
    }

    if (spotConfiguration) {
      await db.executeSql(
        `INSERT OR REPLACE INTO spot_configuration 
        (config_id, spot_id, configuration_data, created_at, updated_at, data)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `${spotId}_config`,
          spotId.toString(),
          JSON.stringify(spotConfiguration),
          moment().toISOString(),
          moment().toISOString(),
          JSON.stringify(spotConfiguration),
        ],
      );
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const getForecastProcessedDataFromDB = async spotId => {
  try {
    const db = await getDatabase();
    const now = moment().toISOString();

    const processedData = {};

    // Get average data
    const [avgResult] = await db.executeSql(
      `SELECT * FROM spot_forecast 
       WHERE spot_id = ? AND forecast_type = 'average' AND expires_at > ?`,
      [spotId.toString(), now],
    );
    if (avgResult.rows.length > 0) {
      processedData.averageList = JSON.parse(avgResult.rows.item(0).data);
    }

    // Get by-day data
    const [bydayResult] = await db.executeSql(
      `SELECT * FROM spot_forecast 
       WHERE spot_id = ? AND forecast_type = 'byday' AND expires_at > ?`,
      [spotId.toString(), now],
    );
    if (bydayResult.rows.length > 0) {
      processedData.seperateByday = JSON.parse(bydayResult.rows.item(0).data);
    }

    // Get tides data
    const [tidesResult] = await db.executeSql(
      `SELECT * FROM spot_forecast 
       WHERE spot_id = ? AND forecast_type = 'tides' AND expires_at > ?`,
      [spotId.toString(), now],
    );
    if (tidesResult.rows.length > 0) {
      processedData.tideExtremesByday = JSON.parse(
        tidesResult.rows.item(0).data,
      );
    }

    // Get astronomy data
    const [astroResult] = await db.executeSql(
      `SELECT * FROM spot_forecast 
       WHERE spot_id = ? AND forecast_type = 'astronomy' AND expires_at > ?`,
      [spotId.toString(), now],
    );
    if (astroResult.rows.length > 0) {
      processedData.astronomyByDay = JSON.parse(astroResult.rows.item(0).data);
    }

    // Get spot configuration
    const [configResult] = await db.executeSql(
      `SELECT * FROM spot_configuration WHERE spot_id = ?`,
      [spotId.toString()],
    );
    if (configResult.rows.length > 0) {
      processedData.spotConfiguration = JSON.parse(
        configResult.rows.item(0).configuration_data,
      );
    }

    if (Object.keys(processedData).length > 0) {
      return processedData;
    }

    return null;
  } catch (error) {
    return null;
  }
};

// ==================== COMMUNITY LIST ====================

// export const saveCommunityList = async posts => {
//   if (!Array.isArray(posts) || posts.length === 0) {
//   return false;
//   }

//   try {
//     const db = await getDatabase();

//     return new Promise((resolve, reject) => {
//       db.transaction(
//         tx => {

//           let savedCount = 0;
//           let errorCount = 0;

//           posts.forEach((post, index) => {
//             // Extract post ID from either tripId or tripReportId
//             const postId =
//               post?.id?.toString() ||
//               (Number(post?.tripId) > 0 && post?.tripId?.toString()) ||
//               post?.tripReportId?.toString();

//             if (!postId) {
//               errorCount++;
//               if (savedCount + errorCount === posts.length) {
//                 resolve(savedCount > 0);
//               }
//               return;
//             }

//             // Determine post type
//             const postType = post.tripId > 0 ? 'trip' : 'report';

//             // Extract user ID
//             const userId =
//               post.userId?.toString() ||
//               post.organizer?.id?.toString() ||
//               post.trip?.organizer?.id?.toString() ||
//               '';

//             tx.executeSql(
//               `INSERT OR REPLACE INTO community_list
//             (post_id, user_id, title, description, post_type, like_count, comment_count,
//              is_liked, created_at, updated_at, sync_status, data)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//               [
//                 postId,
//                 userId,
//                 post.title || '',
//                 post.description || '',
//                 postType,
//                 post.likeCount || 0,
//                 post.tripCommentCount || post.commentCount || 0,
//                 post.isLike ? 1 : 0,
//                 post.createdAt || moment().toISOString(),
//                 moment().toISOString(),
//                 'synced',
//                 JSON.stringify(post),
//               ],
//               (_, result) => {
//                 savedCount++;
//                 if (index < 3 || index === posts.length - 1) {
//                  }

//                 if (savedCount + errorCount === posts.length) {
//                   resolve(savedCount > 0);
//                 }
//               },
//               (_, error) => {
//                 errorCount++;
//

//                 if (savedCount + errorCount === posts.length) {
//                   resolve(savedCount > 0);
//                 }
//               },
//             );
//           });
//         },
//         error => {
//            reject(error);
//         },
//       );
//     });
//   } catch (error) {
//      return false;
//   }
// };

// export const saveCommunityList = async posts => {
//   if (!Array.isArray(posts) || posts.length === 0) {
//     return false;
//   }

//   try {
//     const db = await getDatabase();

//     return new Promise((resolve, reject) => {
//       db.transaction(
//         tx => {
//           let savedCount = 0;
//           let errorCount = 0;

//           posts.forEach((post, index) => {
//             const postId =
//               post?.id?.toString() ||
//               (Number(post?.tripId) > 0 && post?.tripId?.toString()) ||
//               post?.tripReportId?.toString();

//             if (!postId) {
//               errorCount++;
//               if (savedCount + errorCount === posts.length) {
//                 resolve(savedCount > 0);
//               }
//               return;
//             }

//             const postType = post.tripId > 0 ? 'trip' : 'report';
//             const userId =
//               post.userId?.toString() ||
//               post.organizer?.id?.toString() ||
//               post.trip?.organizer?.id?.toString() ||
//               '';
//             tx.executeSql(
//               `INSERT OR REPLACE INTO community_list
//             (post_id, user_id, title, description, post_type, like_count, comment_count,
//              is_liked, expiry_date, created_at, updated_at, sync_status, data)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//               [
//                 postId,
//                 userId,
//                 post.title || '',
//                 post.description || '',
//                 postType,
//                 post.likeCount || 0,
//                 post.tripCommentCount || post.commentCount || 0,
//                 post.isLike ? 1 : 0,
//                 (post.tripId > 0 ? post?.expiryDate : post?.trip?.expiryDate) ||
//                   moment().toISOString(),
//                 post.createdAt || moment().toISOString(),
//                 post.updatedAt || moment().toISOString(),
//                 'synced',
//                 JSON.stringify(post),
//               ],
//               (_, result) => {
//                 savedCount++;
//                 if (index < 3 || index === posts.length - 1) {
//                 }
//                 if (savedCount + errorCount === posts.length) {
//                   resolve(savedCount > 0);
//                 }
//               },
//               (_, error) => {
//                 errorCount++;
//                 if (savedCount + errorCount === posts.length) {
//                   resolve(savedCount > 0);
//                 }
//               },
//             );
//           });
//         },
//         error => {
//           reject(error);
//         },
//       );
//     });
//   } catch (error) {
//     return false;
//   }
// };

export const saveCommunityList = async posts => {
  if (!Array.isArray(posts) || posts.length === 0) {
    return false;
  }

  const toUTC = date => (date ? new Date(date).toISOString() : null);

  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          let completed = 0;
          let successCount = 0;
          let failCount = 0;
          let skippedCount = 0;

          posts.forEach((post, index) => {
            const postType = post.tripId ? 'trip' : 'report';

            let postId = null;

            if (post.tripId) {
              postId = `${postType}_${post.tripId.toString()}`;
            } else if (post.tripReportId && post.tripReportId !== 0) {
              postId = `${postType}_${post.tripReportId.toString()}`;
            } else if (post.id && post.id !== 0) {
              postId = `${postType}_${post.id.toString()}`;
            }

            if (!postId) {
              completed++;
              return;
            }
            if (!postId) {
              skippedCount++;
              completed++;
              if (completed === posts.length) {
              }
              return;
            }

            const expiryRaw =
              post.tripId > 0 ? post?.expiryDate : post?.trip?.expiryDate;

            tx.executeSql(
              `INSERT OR REPLACE INTO community_list 
              (post_id, user_id, title, description, post_type, like_count, comment_count, 
               is_liked, expiry_date, created_at, updated_at, sync_status, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                postId,
                post.userId?.toString() ||
                  post.organizer?.id?.toString() ||
                  post.trip?.organizer?.id?.toString() ||
                  '',
                post.title || '',
                post.description || '',
                postType,
                post.likeCount || 0,
                post.tripCommentCount || post.commentCount || 0,
                post.isLike ? 1 : 0,
                toUTC(expiryRaw),
                toUTC(post.createdAt) || new Date().toISOString(),
                toUTC(post.updatedAt) || new Date().toISOString(),
                'synced',
                JSON.stringify(post),
              ],
              (_, result) => {
                successCount++;
                completed++;
                if (completed === posts.length) {
                }
              },
              (_, error) => {
                failCount++;
                completed++;
                if (completed === posts.length) {
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

export const getCommunityListFromDB = async (pageNo, pageSize) => {
  try {
    const offset = (pageNo - 1) * parseInt(pageSize);

    const result = await executeQuery(
      `SELECT * FROM community_list 
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`,
      [parseInt(pageSize), offset],
    );

    const posts = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);

      try {
        const data = parseData(item);

        if (data) {
          // Ensure proper structure based on post type
          const formattedPost = {
            ...data,
            // id: data.id || item.tripId||,
            // tripId:
            //   data.tripId || (data.post_type === 'trip' ? item.post_id : 0),
            // tripReportId:
            //   data.tripReportId ||
            //   (data.post_type === 'report' ? item.post_id : 0),
            // likeCount: data.likeCount || item.like_count || 0,
            // tripCommentCount: data.tripCommentCount || item.comment_count || 0,
            // isLike: data.isLike || item.is_liked === 1,
            // createdAt: data.createdAt || item.created_at,
          };

          posts.push(formattedPost);
        }
      } catch (parseError) {}
    }

    return posts;
  } catch (error) {
    return [];
  }
};

export const runCommunityMigrationIfNeeded = async () => {
  try {
    const db = await getDatabase();
    await db.transaction(tx => {
      tx.executeSql(`DELETE FROM community_list`);
    });
    await setLastCommunityTripSyncTime(null); // reset sync
  } catch (e) {}
};

// export const getCommunityListDemoFromDB = async () => {
//   try {
//     const result = await executeQuery(
//       `SELECT * FROM community_list
//        ORDER BY datetime(created_at) DESC`,
//     );

//     const posts = [];

//     for (let i = 0; i < result.rows.length; i++) {
//       const item = result.rows.item(i);

//       try {
//         const data = parseData(item);
//         if (!data) continue;

//         posts.push({
//           ...data,
//           id: data.id ?? item.post_id,

//           tripId: data.tripId ?? (item.post_type === 'trip' ? item.post_id : 0),

//           tripReportId:
//             data.tripReportId ??
//             (item.post_type === 'report' ? item.post_id : 0),

//           likeCount: data.likeCount ?? item.like_count ?? 0,
//           tripCommentCount: data.tripCommentCount ?? item.comment_count ?? 0,

//           isLike: data.isLike ?? item.is_liked === 1,
//           createdAt: data.createdAt ?? item.created_at,
//         });
//       } catch (parseError) {
//        }
//     }

//     return posts;
//   } catch (error) {
//      return [];
//   }
// };

export const getCommunityListDemoFromDB = async () => {
  try {
    const nowUTC = new Date().toISOString();
    const result = await executeQuery(
      `
      SELECT post_id, post_type, expiry_date, updated_at, data
      FROM community_list
      WHERE expiry_date IS NULL
         OR expiry_date > ?
      ORDER BY updated_at DESC
      `,
      [nowUTC],
    );

    const posts = [];

    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      try {
        const data = parseData(item);
        if (!data) continue;

        posts.push({ ...data });
      } catch (e) {}
    }

    return posts;
  } catch (error) {
    return [];
  }
};

// Add helper to get total count of cached posts
export const getCommunityListCount = async () => {
  try {
    const result = await executeQuery(
      `SELECT COUNT(*) as count FROM community_list`,
    );

    const count = result.rows.item(0).count;
    return count;
  } catch (error) {
    return 0;
  }
};

// Add helper to clear old cached posts (optional, for cleanup)
export const clearOldCommunityPosts = async (daysOld = 7) => {
  try {
    const db = await getDatabase();
    const cutoffDate = moment().subtract(daysOld, 'days').toISOString();

    const result = await db.executeSql(
      `DELETE FROM community_list WHERE created_at < ?`,
      [cutoffDate],
    );

    return true;
  } catch (error) {
    return false;
  }
};
// ==================== TRIP REPORTS ====================

export const saveTripReports = async reports => {
  try {
    const db = await getDatabase();
    await db.transaction(async tx => {
      for (const report of reports) {
        const reportId = report?.id?.toString() || report?.reportId?.toString();
        tx.executeSql(
          `INSERT OR REPLACE INTO trip_reports_main 
          (report_id, trip_id, user_id, spot_id, title, description, rating, 
           image_count, comment_count, like_count, is_liked, created_at, updated_at, sync_status, data)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            report?.trip?.id?.toString() || '',
            report?.author?.id?.toString() || '',
            report.spotId?.toString() || '',
            report.title || '',
            report.description || '',
            report.rating || 0,
            report.imageCount || 0,
            report.tripCommentCount || 0,
            report.likeCount || 0,
            report.isLiked ? 1 : 0,
            report.createdAt || moment().toISOString(),
            moment().toISOString(),
            'synced',
            JSON.stringify(report),
          ],
        );
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getTripReportsFromDB = async (tripId, pageNo, pageSize) => {
  try {
    const offset = (pageNo - 1) * parseInt(pageSize);
    const result = await executeQuery(
      `SELECT * FROM trip_reports_main WHERE trip_id = ? 
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [tripId?.toString(), parseInt(pageSize), offset],
    );
    const reports = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      const data = parseData(item);
      if (data) reports.push(data);
    }
    return reports;
  } catch (error) {
    return [];
  }
};

// ==================== CHAT MESSAGES ====================

// export const saveChatMessages = async (tripId, messages = []) => {
//   try {
//     const db = await getDatabase();
//     await db.transaction(async tx => {
//       for (const message of messages) {
//         const messageId =
//           message.id?.toString() ||
//           message.messageId?.toString() ||
//           message.localId;

//         tx.executeSql(
//           `INSERT OR REPLACE INTO trip_chat_messages
//            (message_id, trip_id, user_id, message_text, message_type, created_at, sync_status, data)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             messageId,
//             tripId?.toString(),
//             message.userId?.toString() || message?.author?.id?.toString() || '',
//             message.messageText || message.message || message.text || '',
//             message.messageType || 'text',
//             message.createdAt || new Date().toISOString(),
//             message.sync_status || 'synced',
//             JSON.stringify(message),
//           ],
//         );
//       }
//     });
//     return true;
//   } catch (e) {
//     return false;
//   }
// };

// export const getChatMessagesFromDB = async (tripId, pageNo, pageSize) => {
//   try {
//     const offset = (pageNo - 1) * parseInt(pageSize);
//     const result = await executeQuery(
//       `SELECT * FROM trip_chat_messages
//        WHERE trip_id = ?
//        ORDER BY created_at ASC
//        LIMIT ? OFFSET ?`,
//       [tripId?.toString(), parseInt(pageSize), offset],
//     );

//     const messages = [];
//     for (let i = 0; i < result.rows.length; i++) {
//       const item = result.rows.item(i);
//       const data = JSON.parse(item.data);
//       messages.push(data);
//     }
//     return messages;
//   } catch (e) {
//     return [];
//   }
// };

// ==================== IMPROVED CHAT MESSAGES ====================

export const saveChatMessages = async (
  tripId,
  messages = [],
  append = false,
) => {
  if (!tripId || !Array.isArray(messages) || messages.length === 0) {
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
              'DELETE FROM trip_chat_messages WHERE trip_id = ?',
              [tripId.toString()],
              () => {},
              (_, error) => {
                console.warn('Failed to clear old messages:', error);
              },
            );
          }

          let savedCount = 0;
          let errorCount = 0;

          messages.forEach((message, index) => {
            const messageId =
              message.id?.toString() ||
              message.messageId?.toString() ||
              message.localId ||
              `temp-${Date.now()}-${index}`;

            const userId =
              message.userId?.toString() ||
              message.author?.id?.toString() ||
              message.sender?.id?.toString() ||
              '';

            const messageText =
              message.messageText || message.message || message.text || '';

            const syncStatus =
              message.sync_status || message.isPending ? 'pending' : 'synced';

            tx.executeSql(
              `INSERT OR REPLACE INTO trip_chat_messages 
               (message_id, trip_id, user_id, message_text, message_type, created_at, sync_status, data)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                messageId,
                tripId.toString(),
                userId,
                messageText,
                message.messageType || message.type || 'text',
                message.createdAt || new Date().toISOString(),
                syncStatus,
                JSON.stringify(message),
              ],
              () => {
                savedCount++;
                if (savedCount + errorCount === messages.length) {
                  resolve(savedCount > 0);
                }
              },
              (_, error) => {
                console.warn(`Failed to save message ${messageId}:`, error);
                errorCount++;
                if (savedCount + errorCount === messages.length) {
                  resolve(savedCount > 0);
                }
              },
            );
          });
        },
        error => {
          console.error('Transaction failed:', error);
          reject(error);
        },
      );
    });
  } catch (error) {
    console.error('saveChatMessages error:', error);
    return false;
  }
};

export const getChatMessagesFromDB = async (tripId, pageNo, pageSize) => {
  if (!tripId) {
    return [];
  }
  const safeTripId = tripId ? String(tripId) : null;
  const safePageSize = Number(pageSize) || 10;
  try {
    const offset = (pageNo - 1) * parseInt(pageSize);
    const safeOffset = Number(offset) || 0;
    const result = await executeQuery(
      `SELECT * FROM trip_chat_messages
       WHERE trip_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`,
      [safeTripId, safePageSize, safeOffset],
    );

    const messages = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      try {
        const data = JSON.parse(item.data);
        messages.push({
          ...data,
          id: item.message_id,
          isPending: item.sync_status === 'pending',
          sync_status: item.sync_status,
        });
      } catch (parseError) {
        console.warn('Failed to parse message:', parseError);
      }
    }

    return messages;
  } catch (error) {
    console.error('getChatMessagesFromDB error:', error);
    return [];
  }
};

export const markChatAsSynced = async (localId, serverId) => {
  if (!localId || !serverId) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Update the message with server ID and mark as synced
        tx.executeSql(
          `UPDATE trip_chat_messages
           SET message_id = ?, sync_status = 'synced'
           WHERE message_id = ?`,
          [serverId.toString(), localId.toString()],
          (_, result) => {
            if (result.rowsAffected > 0) {
              resolve(true);
            } else {
              console.warn(`⚠️ No message found with ID ${localId}`);
              resolve(false);
            }
          },
          (_, error) => {
            console.error('Failed to mark chat as synced:', error);
            reject(error);
          },
        );
      });
    });
  } catch (error) {
    console.error('markChatAsSynced error:', error);
    return false;
  }
};

export const clearAllTripData = async () => {
  try {
    const db = await getDatabase();
    const tables = [
      'regions',
      'spots',
      'trips',
      'trip_expenses',
      'trip_comments',
      'trip_passengers',
      'trip_pending_users',
      'trip_interested_users',
      'invited_trips',
      'suggested_trips',
      'trip_reports_main',
      'trip_report_comments',
      'trip_chat_messages',
      'spot_forecast',
      'tide_extremes',
      'astronomy_data',
      'nearby_spots_cache',
      'community_list',
      'spot_reasons',
      'spots_by_reason',
      'spot_configuration',
    ];

    for (const table of tables) {
      await db.executeSql(`DELETE FROM ${table}`);
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const addOptimisticComment = async (
  tripId,
  comment,
  isSync = 'pending',
) => {
  if (!tripId || !comment) {
    return null;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const commentId = comment.id || `temp-${Date.now()}`;
        const userId =
          comment.author?.id?.toString() || comment.user?.id?.toString() || '';
        const commentText = comment.comment?.toString() || '';

        tx.executeSql(
          `INSERT INTO trip_comments (
            comment_id, 
            trip_id, 
            user_id,
            comment_text, 
            created_at, 
            updated_at,
            sync_status, 
            data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            commentId,
            tripId.toString(),
            userId,
            commentText,
            comment.createdAt || new Date().toISOString(),
            new Date().toISOString(),
            isSync,
            JSON.stringify(comment),
          ],
          (_, result) => {
            resolve({ ...comment, id: commentId });
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

export const removeOptimisticComment = async commentId => {
  if (!commentId) {
    return false;
  }
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM trip_comments WHERE comment_id = ? AND sync_status = ?',
          [commentId.toString(), 'pending'],
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

export const updatePendingActionStatus = async (
  actionId,
  status,
  retryCount,
  error = null,
) => {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE pending_actions 
         SET status = ?, retry_count = ?, error = ?
         WHERE action_id = ?`,
        [status, retryCount, error, actionId],
        () => resolve(true),
        (_, error) => reject(error),
      );
    });
  });
};

export const clearAllOfflineData = async () => {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const tables = [
        'regions',
        'spots',
        'trips',
        'current_trip',
        'expenses',
        'comments',
        'passengers',
        'pending_users',
        'interested_users',
        'forecast_data',
        'community_list',
        'trip_reports_main',
        'chat_messages',
        'trip_likes',
        'trip_report_likes',
        'pending_actions',
      ];

      tables.forEach(table => {
        tx.executeSql(
          `DELETE FROM ${table}`,
          [],
          () => {},
          (_, error) => {},
        );
      });

      resolve(true);
    });
  });
};

export const getStorageStats = async () => {
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const stats = {};
    db.transaction(tx => {
      const tables = [
        'regions',
        'spots',
        'trips',
        'expenses',
        'comments',
        'passengers',
        'forecast_data',
        'chat_messages',
        'pending_actions',
      ];

      let completed = 0;
      tables.forEach(table => {
        tx.executeSql(
          `SELECT COUNT(*) as count FROM ${table}`,
          [],
          (_, { rows }) => {
            stats[table] = rows.item(0).count;
            completed++;
            if (completed === tables.length) {
              resolve(stats);
            }
          },
          (_, error) => {
            stats[table] = 0;
            completed++;
            if (completed === tables.length) {
              resolve(stats);
            }
          },
        );
      });
    });
  });
};

export const saveSpotReasons = async (reasons, parentID, depth) => {
  if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
    return false;
  }

  try {
    const db = await getDatabase();

    // First, ensure the table exists with proper schema
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS spot_reasons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reason_id TEXT NOT NULL,
            name TEXT,
            depth INTEGER,
            parent_id INTEGER,
            created_at TEXT,
            updated_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            data TEXT,
            UNIQUE(reason_id, depth, parent_id)
          )`,
          [],
          () => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });

    // Then save each reason individually (more reliable on iOS)
    let successCount = 0;

    for (let i = 0; i < reasons.length; i++) {
      const reason = reasons[i];
      const reasonId = reason.id?.toString() || reason.reasonId?.toString();

      if (!reasonId) {
        continue;
      }

      try {
        await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `INSERT OR REPLACE INTO spot_reasons
               (reason_id, name, depth, parent_id, created_at, updated_at, sync_status, data)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                reasonId,
                reason.name || '',
                depth?.toString() || '0',
                parentID?.toString() || '0',
                reason.createdAt || moment().toISOString(),
                moment().toISOString(),
                'synced',
                JSON.stringify(reason),
              ],
              (_, result) => {
                if (result.rowsAffected > 0) {
                  successCount++;
                  if (i < 3 || i === reasons.length - 1) {
                  }
                }
                resolve(true);
              },
              (_, error) => {
                resolve(false); // Don't reject, continue with others
              },
            );
          });
        });
      } catch (error) {}
    }

    return successCount > 0;
  } catch (error) {
    return false;
  }
};

// Fixed getSpotReasonsFromDB
export const getSpotReasonsFromDB = async (parentId = 0, depth = 0) => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First check if table exists
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='spot_reasons'`,
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve([]);
              return;
            }

            // Table exists, query it
            tx.executeSql(
              `SELECT * FROM spot_reasons 
               WHERE parent_id = ? AND depth = ?`,
              [parentId?.toString() || '0', depth?.toString() || '0'],
              (_, { rows }) => {
                const reasons = [];
                for (let i = 0; i < rows.length; i++) {
                  const row = rows.item(i);
                  try {
                    const data = JSON.parse(row.data);
                    reasons.push(data);
                  } catch (parseError) {}
                }

                resolve(reasons);
              },
              (_, error) => {
                resolve([]);
              },
            );
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

// ==================== SPOTS BY REASON ====================
export const saveSpotsByReason = async (reasonId, spots) => {
  if (!reasonId || !spots || !Array.isArray(spots) || spots.length === 0) {
    return false;
  }

  try {
    const db = await getDatabase();

    // First, ensure the table exists
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS spots_by_reason (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reason_id TEXT NOT NULL,
            spot_id TEXT NOT NULL,
            created_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            data TEXT,
            UNIQUE(reason_id, spot_id)
          )`,
          [],
          () => {
            resolve(true);
          },
          (_, error) => {
            reject(error);
          },
        );
      });
    });

    // Delete old spots for this reason
    await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM spots_by_reason WHERE reason_id = ?',
          [reasonId.toString()],
          (_, result) => {
            resolve(true);
          },
          (_, error) => {
            resolve(false); // Continue anyway
          },
        );
      });
    });

    // Save each spot individually
    let successCount = 0;

    for (let i = 0; i < spots.length; i++) {
      const spot = spots[i];
      const spotId = spot.id?.toString() || spot.spotId?.toString();

      if (!spotId) {
        continue;
      }

      try {
        await new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(
              `INSERT OR REPLACE INTO spots_by_reason 
               (reason_id, spot_id, created_at, sync_status, data) 
               VALUES (?, ?, ?, ?, ?)`,
              [
                reasonId.toString(),
                spotId,
                spot.createdAt || moment().toISOString(),
                'synced',
                JSON.stringify(spot),
              ],
              (_, result) => {
                if (result.rowsAffected > 0) {
                  successCount++;
                  if (i < 3 || i === spots.length - 1) {
                  }
                }
                resolve(true);
              },
              (_, error) => {
                resolve(false);
              },
            );
          });
        });
      } catch (error) {}
    }

    return successCount > 0;
  } catch (error) {
    return false;
  }
};

// Fixed getSpotsByReasonFromDB with table check
export const getSpotsByReasonFromDB = async reasonId => {
  if (!reasonId) {
    return [];
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First check if table exists
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name='spots_by_reason'`,
          [],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve([]);
              return;
            }

            // Table exists, query it
            tx.executeSql(
              `SELECT * FROM spots_by_reason 
               WHERE reason_id = ? 
               ORDER BY created_at ASC`,
              [reasonId.toString()],
              (_, { rows }) => {
                const spots = [];
                for (let i = 0; i < rows.length; i++) {
                  const row = rows.item(i);
                  try {
                    const data = JSON.parse(row.data);
                    spots.push(data);
                  } catch (parseError) {}
                }

                resolve(spots);
              },
              (_, error) => {
                resolve([]);
              },
            );
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

// ==================== INVITED TRIPS HELPERS ====================

export const saveInvitedTrips = async (userId, invites) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Clear old invites for this user
        tx.executeSql(
          'DELETE FROM invited_trips WHERE user_id = ?',
          [userId.toString()],
          () => {
            if (!invites || invites.length === 0) {
              resolve(true);
              return;
            }

            let completed = 0;
            let successCount = 0;

            invites.forEach((invite, index) => {
              const inviteId =
                invite.id?.toString() || `invite-${Date.now()}-${index}`;
              const tripId =
                invite.id ||
                invite.tripId?.toString() ||
                invite.trip?.id?.toString() ||
                '';

              tx.executeSql(
                `INSERT INTO invited_trips 
                 (invite_id, trip_id, user_id, inviter_id, status, created_at, updated_at, sync_status, data) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  inviteId,
                  tripId,
                  userId.toString(),
                  invite.inviterId?.toString() || '',
                  invite.status || 0,
                  invite.createdAt || new Date().toISOString(),
                  new Date().toISOString(),
                  'synced',
                  JSON.stringify(invite),
                ],
                () => {
                  successCount++;
                  completed++;
                  if (completed === invites.length) {
                    resolve(true);
                  }
                },
                (_, error) => {
                  completed++;
                  if (completed === invites.length) {
                    resolve(successCount > 0);
                  }
                },
              );
            });
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

export const getInvitedTripsFromDB = async userId => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM invited_trips WHERE user_id = ? AND status = 0 ORDER BY created_at DESC',
          [userId.toString()],
          (_, { rows }) => {
            const invites = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              try {
                const data = JSON.parse(row.data);
                invites.push({
                  ...data,
                  id: row.invite_id,
                  tripId: row.trip_id,
                  status: row.status,
                });
              } catch (e) {}
            }
            resolve(invites);
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

export const updateInviteStatusLocally = async (inviteId, status) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE invited_trips SET status = ?, updated_at = ?, sync_status = ? WHERE invite_id = ?',
          [status, new Date().toISOString(), 'pending', inviteId.toString()],
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

export const saveInvitedIdTrip = async ({ inviteId, tripId }) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO invited_trips_id (invite_id, trip_id)
           VALUES (?, ?)`,
          [inviteId?.toString(), tripId?.toString()],
          () => {
            resolve(true);
          },
          (_, error) => {
            resolve(false);
          },
        );
      });
    });
  } catch (error) {
    return false;
  }
};

export const clearInvitedTripIds = async () => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM invited_trips_id`,
          [],
          () => {
            resolve(true);
          },
          (_, error) => {
            console.error('Failed to clear invited_trips_id', error);
            resolve(false);
          },
        );
      });
    });
  } catch (error) {
    console.error('DB error', error);
    return false;
  }
};

export const getInvitedIdTripFromDB = async () => {
  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT invite_id, trip_id FROM invited_trips_id`,
          [],
          (_, { rows }) => {
            const list = [];

            for (let i = 0; i < rows.length; i++) {
              const item = rows.item(i);
              list.push({
                inviteId: Number(item.invite_id),
                tripId: Number(item.trip_id),
              });
            }

            resolve(list);
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

// ==================== SUGGESTED TRIPS HELPERS ====================

export const saveSuggestedTrips = async (trips, location) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Clear old suggestions
        tx.executeSql('DELETE FROM suggested_trips', [], () => {
          if (!trips || trips.length === 0) {
            resolve(true);
            return;
          }

          let completed = 0;
          let successCount = 0;

          trips.forEach((trip, index) => {
            const tripId =
              trip.id?.toString() ||
              trip.tripId?.toString() ||
              `trip-${Date.now()}-${index}`;

            tx.executeSql(
              `INSERT INTO suggested_trips 
               (trip_id, user_id, distance, created_at, sync_status, data) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                tripId,
                trip.organizer?.id?.toString() || '',
                location ? 0 : 1,
                trip?.createdAt ? trip?.createdAt : new Date().toISOString(),
                'synced',
                JSON.stringify(trip),
              ],
              () => {
                successCount++;
                completed++;
                if (completed === trips.length) {
                  resolve(true);
                }
              },
              (_, error) => {
                completed++;
                if (completed === trips.length) {
                  resolve(successCount > 0);
                }
              },
            );
          });
        });
      });
    });
  } catch (error) {
    return false;
  }
};

export const getSuggestedTripsFromDB = async distance => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM suggested_trips WHERE distance = ? ORDER BY created_at DESC',
          [distance],
          (_, { rows }) => {
            const trips = [];
            for (let i = 0; i < rows.length; i++) {
              const row = rows.item(i);
              try {
                const data = JSON.parse(row.data);
                trips.push({
                  ...data,
                  id: row.trip_id,
                  distance: row.distance,
                });
              } catch (e) {}
            }
            resolve(trips);
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

export const saveJoinRequests = async (userId, requests) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS join_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT UNIQUE NOT NULL,
            trip_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            is_driver INTEGER DEFAULT 0,
            status INTEGER DEFAULT 0,
            created_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            data TEXT NOT NULL
          )`,
          [],
          () => {
            tx.executeSql(
              'DELETE FROM join_requests WHERE user_id = ?',
              [userId.toString()],
              () => {
                if (!requests || requests.length === 0) {
                  resolve(true);
                  return;
                }

                let completed = 0;
                let successCount = 0;

                requests.forEach((request, index) => {
                  const requestId =
                    request.id?.toString() || `req-${Date.now()}-${index}`;
                  const tripId =
                    request.trip?.id?.toString() ||
                    request.tripId?.toString() ||
                    '';

                  tx.executeSql(
                    `INSERT INTO join_requests 
                     (request_id, trip_id, user_id, is_driver, status, created_at, sync_status, data) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                      requestId,
                      tripId,
                      userId.toString(),
                      request.isDriver ? 1 : 0,
                      request.status || 0,
                      request.createdAt || new Date().toISOString(),
                      'synced',
                      JSON.stringify(request),
                    ],
                    () => {
                      successCount++;
                      completed++;
                      if (completed === requests.length) {
                        resolve(true);
                      }
                    },
                    (_, error) => {
                      completed++;
                      if (completed === requests.length) {
                        resolve(successCount > 0);
                      }
                    },
                  );
                });
              },
              (_, error) => {
                reject(error);
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
    return false;
  }
};

export const getJoinRequestsFromDB = async userId => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // First ensure table exists
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS join_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT UNIQUE NOT NULL,
            trip_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            is_driver INTEGER DEFAULT 0,
            status INTEGER DEFAULT 0,
            created_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            data TEXT NOT NULL
          )`,
          [],
          () => {
            tx.executeSql(
              'SELECT * FROM join_requests WHERE user_id = ? ORDER BY created_at DESC',
              [userId.toString()],
              (_, { rows }) => {
                const requests = [];
                for (let i = 0; i < rows.length; i++) {
                  const row = rows.item(i);
                  try {
                    const data = JSON.parse(row.data);
                    requests.push({
                      ...data,
                      id: row.request_id,
                      trip: {
                        ...data.trip,
                        id: row.trip_id,
                      },
                      status: row.status,
                      isDriver: row.is_driver === 1,
                    });
                  } catch (e) {}
                }
                resolve(requests);
              },
              (_, error) => {
                resolve([]);
              },
            );
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

export const addJoinRequestOptimistic = async (tripId, userId, isDriver) => {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      const requestId = `temp-${Date.now()}`;
      db.transaction(tx => {
        // Ensure table exists first
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS join_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT UNIQUE NOT NULL,
            trip_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            is_driver INTEGER DEFAULT 0,
            status INTEGER DEFAULT 0,
            created_at TEXT,
            sync_status TEXT DEFAULT 'synced',
            data TEXT NOT NULL
          )`,
          [],
          () => {
            const optimisticRequest = {
              id: requestId,
              trip: { id: tripId },
              status: 0,
              isDriver,
              createdAt: new Date().toISOString(),
            };

            tx.executeSql(
              `INSERT INTO join_requests 
               (request_id, trip_id, user_id, is_driver, status, created_at, sync_status, data) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                requestId,
                tripId.toString(),
                userId.toString(),
                isDriver ? 1 : 0,
                0,
                new Date().toISOString(),
                'pending',
                JSON.stringify(optimisticRequest),
              ],
              () => {
                resolve(requestId);
              },
              (_, error) => {
                reject(error);
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
    return null;
  }
};

//Trop Report

export const saveTripReportComments = async (reportId, comments = []) => {
  if (!reportId || !Array.isArray(comments)) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          const commentsToSave = comments.slice(0, 10);

          if (commentsToSave.length === 0) {
            resolve(true);
            return;
          }

          let completed = 0;

          commentsToSave.forEach((comment, index) => {
            const commentId =
              comment.id?.toString() ||
              comment.commentId?.toString() ||
              `temp-${Date.now()}-${index}`;

            const userId =
              comment.userId?.toString() ||
              comment.author?.id?.toString() ||
              comment.user?.id?.toString() ||
              '';

            const commentText =
              comment.commentText?.toString() ||
              comment.comment?.toString() ||
              '';

            tx.executeSql(
              `INSERT OR REPLACE INTO trip_report_comments (
                comment_id,
                report_id,
                user_id,
                comment_text,
                likes_count,
                is_liked,
                created_at,
                sync_status,
                data
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                commentId,
                reportId.toString(),
                userId,
                commentText,
                comment.likesCount || 0,
                comment.isLiked ? 1 : 0,
                comment.createdAt || new Date().toISOString(),
                'synced',
                JSON.stringify(comment),
              ],
              () => {
                completed++;
                if (completed === commentsToSave.length) {
                  resolve(true);
                }
              },
              (_, error) => {
                completed++;
                if (completed === commentsToSave.length) {
                  resolve(true);
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

// Get Trip Report Comments from DB
export const getTripReportCommentsFromDB = async (
  reportId,
  pageNo,
  pageSize,
) => {
  if (!reportId) {
    return [];
  }

  try {
    const offset = (pageNo - 1) * parseInt(pageSize);
    const result = await executeQuery(
      `SELECT * FROM trip_report_comments 
       WHERE report_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT ? OFFSET ?`,
      [reportId.toString(), parseInt(pageSize), offset],
    );

    const comments = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);

      try {
        const data = parseData(item);

        if (data) {
          const formattedComment = {
            ...data,
            id: data.id || item.comment_id,
            comment: data.comment || data.commentText || item.comment_text,
            author: data.author ||
              data.user || {
                id: item.user_id,
              },
            createdAt: data.createdAt || item.created_at,
            isPending: item.sync_status !== 'synced',
          };

          comments.push(formattedComment);
        }
      } catch (parseError) {}
    }

    return comments;
  } catch (error) {
    return [];
  }
};

export const upsertTripUnread = async (tripId, userId, count) => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO trip_chat_unread 
     (trip_id, user_id, unread_count, updated_at)
     VALUES (?, ?, ?, datetime('now'))`,
    [tripId, userId, count],
  );
};

export const getTripUnread = async (tripId, userId) => {
  const db = await getDatabase();
  const res = await db.executeSql(
    `SELECT unread_count FROM trip_chat_unread 
     WHERE trip_id = ? AND user_id = ?`,
    [tripId, userId],
  );

  return res[0].rows.length > 0 ? res[0].rows.item(0).unread_count : 0;
};

export const resetTripUnread = async (tripId, userId) => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE trip_chat_unread 
     SET unread_count = 0,
         updated_at = datetime('now')
     WHERE trip_id = ? AND user_id = ?`,
    [tripId, userId],
  );
};

export const markTripMessagesRead = async (tripId, userId) => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE trip_chat_messages
     SET is_read = 1
     WHERE trip_id = ?
     AND user_id != ?`,
    [tripId, userId],
  );
};

export const addOptimisticReportComment = async (
  reportId,
  comment,
  isSync = 'pending',
) => {
  if (!reportId || !comment) {
    return null;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        const commentId = comment.id || `temp-${Date.now()}`;
        const userId =
          comment.author?.id?.toString() || comment.user?.id?.toString() || '';
        const commentText = comment.comment?.toString() || '';

        tx.executeSql(
          `INSERT INTO trip_report_comments (
            comment_id, 
            report_id, 
            user_id,
            comment_text, 
            created_at, 
            sync_status, 
            data
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            commentId,
            reportId.toString(),
            userId,
            commentText,
            comment.createdAt || new Date().toISOString(),
            isSync,
            JSON.stringify(comment),
          ],
          (_, result) => {
            resolve({ ...comment, id: commentId });
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

export const removeOptimisticReportComment = async commentId => {
  if (!commentId) {
    return false;
  }

  try {
    const db = await getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM trip_report_comments WHERE comment_id = ? AND sync_status = ?',
          [commentId.toString(), 'pending'],
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

// ==================== UTILITY: Clear old cached data ====================

export const clearOldSuggestedTrips = async (hoursOld = 24) => {
  try {
    const db = await getDatabase();
    const cutoffDate = moment().subtract(hoursOld, 'hours').toISOString();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM suggested_trips WHERE created_at < ?',
          [cutoffDate],
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

export const getLastCommunityTripSyncTime = async () => {
  const db = await getDatabase();
  const [res] = await db.executeSql(
    "SELECT value FROM sync_meta WHERE key = 'communityTrip_last_sync'",
  );
  return res.rows.length ? res.rows.item(0).value : null;
};

export const setLastCommunityTripSyncTime = async time => {
  const db = await getDatabase();
  await db.executeSql(
    'INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)',
    ['communityTrip_last_sync', time],
  );
};

// store/eventSlice.js - FIXED VERSION
import { createSlice } from '@reduxjs/toolkit';
import ClubApi from '../api/ClubApi';
import * as dbHelper from '../database/eventDbHelper';
import NetInfo from '@react-native-community/netinfo';
import { addCacheAction, addToSyncQueue } from '../services/syncService';

const initialState = {
  events: [],
  myEvents: [],
  clubEvents: {},
  eventDetails: {},
  eventComments: {},
  eventMembers: {}, // { eventId: { all: [], going: [], maybe: [] } }
  loading: false,
  error: null,
  isOnline: true,
  lastSyncTime: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setEvents(state, action) {
      const incoming = action.payload || [];
      const existing = state.events || [];
      const eventMap = new Map();

      const getId = ev => ev?.id ?? ev?.event_id;
      for (const ev of existing) {
        const id = getId(ev);
        if (id != null) {
          eventMap.set(id, ev);
        }
      }
      for (const ev of incoming) {
        const id = getId(ev);
        if (id != null) {
          const prev = eventMap.get(id) || {};
          eventMap.set(id, { ...prev, ...ev });
        }
      }
      state.events = Array.from(eventMap.values()).sort((a, b) => {
        const da = a?.startDate ? new Date(a.startDate).getTime() : 0;
        const db = b?.startDate ? new Date(b.startDate).getTime() : 0;
        return da - db; // ascending
      });
    },

    setReplacedEvent(state, action) {
      state.events = action.payload;
    },

    addMoreEvents(state, action) {
      state.events = [...state.events, ...action.payload];
    },
    setMyEvents(state, action) {
      state.myEvents = action.payload;
    },
    addMoreMyEvents(state, action) {
      state.myEvents = [...state.myEvents, ...action.payload];
    },
    setClubEvents(state, action) {
      const { clubId, data } = action.payload;
      state.clubEvents = {
        ...state.clubEvents,
        [clubId]: data,
      };
    },
    addMoreClubEvents(state, action) {
      const { clubId, data } = action.payload;
      const existing = state.clubEvents?.[clubId] || [];
      state.clubEvents = {
        ...state.clubEvents,
        [clubId]: [...existing, ...data],
      };
    },
    setEventDetails(state, action) {
      state.eventDetails = {
        ...state.eventDetails,
        [action.payload.id]: action.payload.data,
      };
    },
    setEventComments(state, action) {
      const { eventId, data } = action.payload;
      state.eventComments[eventId] = data;
    },
    addEventComments(state, action) {
      const { eventId, data } = action.payload;
      state.eventComments[eventId] = [
        ...(state.eventComments[eventId] || []),
        ...data,
      ];
    },
    // 🔥 FIX: Properly handle pagination for event members
    setEventMembers(state, action) {
      const { eventId, type, data, pageNo } = action.payload;

      if (!state.eventMembers[eventId]) {
        state.eventMembers[eventId] = {};
      }

      if (pageNo === 1) {
        state.eventMembers[eventId][type] = data;
      } else {
        const existing = state.eventMembers[eventId][type] || [];
        state.eventMembers[eventId][type] = [...existing, ...data];
      }
    },

    addMoreEventMembers(state, action) {
      const { eventId, type, data } = action.payload;

      if (!state.eventMembers[eventId]) {
        state.eventMembers[eventId] = {};
      }

      const existing = state.eventMembers[eventId][type] || [];
      state.eventMembers[eventId][type] = [...existing, ...data];
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    },
    setLastSyncTime(state, action) {
      state.lastSyncTime = action.payload;
    },
    clearEventState() {
      return initialState;
    },
    mergeEvent(state, action) {
      const { id, data } = action.payload;
      if (!id || !data) return;

      const normalizeId = ev => ev?.id || ev?.event_id;

      const mergeOrAdd = list => {
        let found = false;

        const updatedList = list.map(ev => {
          if (normalizeId(ev) === id) {
            found = true;
            return { ...ev, ...data };
          }
          return ev;
        });

        if (!found) {
          updatedList.push(data);
        }

        updatedList.sort((a, b) => {
          const da = a?.startDate ? new Date(a.startDate).getTime() : 0;
          const db = b?.startDate ? new Date(b.startDate).getTime() : 0;
          return da - db;
        });

        return updatedList;
      };

      state.events = mergeOrAdd(state.events);

      state.myEvents = mergeOrAdd(state.myEvents);

      if (state.clubEvents) {
        Object.keys(state.clubEvents).forEach(clubId => {
          state.clubEvents[clubId] = mergeOrAdd(state.clubEvents[clubId]);
        });
      }

      if (state.eventDetails[id]) {
        state.eventDetails[id] = {
          ...state.eventDetails[id],
          ...data,
        };
      } else {
        state.eventDetails[id] = data;
      }
    },

    mergeEventCreateUpdate(state, action) {
      const { id, data } = action.payload;
      if (!id || !data) return;

      const normalizeId = ev => ev?.id || ev?.event_id;

      const mergeOrAdd = list => {
        let found = false;

        const updatedList = list.map(ev => {
          if (normalizeId(ev) === id) {
            found = true;
            return { ...ev, ...data };
          }
          return ev;
        });

        if (!found) {
          updatedList.push(data);
        }

        updatedList.sort((a, b) => {
          const da = a?.startDate ? new Date(a.startDate).getTime() : 0;
          const db = b?.startDate ? new Date(b.startDate).getTime() : 0;
          return da - db;
        });

        return updatedList;
      };

      state.myEvents = mergeOrAdd(state.myEvents);
    },

    //   addCommentToEvent(state, action) {
    //     const { eventId, comment } = action.payload;
    //     if (!eventId || !comment) return;
    //     state.eventComments[eventId] = [
    //       ...(state.eventComments[eventId] || []),
    //       comment,
    //     ];
    //     const bumpCommentCount = ev => {
    //       if (!ev) return ev;

    //       const prev =
    //         Number(ev.totalCommentCount ?? ev.total_comment_count ?? 0) || 0;

    //       return {
    //         ...ev,
    //         totalCommentCount: prev + 1,
    //       };
    //     };
    //     if (state.events) {
    //       state.events = state.events.map(ev =>
    //         ev && (ev.id === eventId || ev.event_id === eventId)
    //           ? bumpCommentCount(ev)
    //           : ev,
    //       );
    //     }
    //     if (state.myEvents) {
    //       state.myEvents = state.myEvents.map(ev =>
    //         ev && (ev.id === eventId || ev.event_id === eventId)
    //           ? bumpCommentCount(ev)
    //           : ev,
    //       );
    //     }

    //     if (state.clubEvents) {
    //       Object.keys(state.clubEvents).forEach(clubId => {
    //         state.clubEvents[clubId] = state.clubEvents[clubId].map(ev =>
    //           ev && (ev.id === eventId || ev.event_id === eventId)
    //             ? bumpCommentCount(ev)
    //             : ev,
    //         );
    //       });
    //     }

    //     /* -----------------------------
    //    6️⃣ Update EVENT DETAILS
    // ------------------------------ */
    //     if (state.eventDetails[eventId]) {
    //       const prev =
    //         Number(
    //           state.eventDetails[eventId].totalCommentCount ??
    //             state.eventDetails[eventId].total_comment_count ??
    //             0,
    //         ) || 0;

    //       state.eventDetails[eventId] = {
    //         ...state.eventDetails[eventId],
    //         totalCommentCount: prev + 1,
    //       };
    //     }
    //   },

    addCommentToEvent(state, action) {
      const { eventId, comment } = action.payload;
      if (!eventId || !comment) return;

      /* -----------------------------
     1️⃣ ADD COMMENT (DEDUP + SORT)
  ------------------------------ */
      const existingComments = state.eventComments[eventId] || [];

      const alreadyExists = existingComments.some(c =>
        c.id ? c.id === comment.id : c.temp_id && c.temp_id === comment.temp_id,
      );

      if (!alreadyExists) {
        state.eventComments[eventId] = [...existingComments, comment].sort(
          (a, b) =>
            new Date(a.createdAt || a.created_date || 0) -
            new Date(b.createdAt || b.created_date || 0),
        );
      } else {
        // no-op if duplicate
        return;
      }

      /* -----------------------------
     2️⃣ COMMENT COUNT BUMPER
  ------------------------------ */
      const bumpCommentCount = ev => {
        if (!ev) return ev;

        const prev =
          Number(ev.totalCommentCount ?? ev.total_comment_count ?? 0) || 0;

        return {
          ...ev,
          totalCommentCount: prev + 1,
        };
      };

      /* -----------------------------
     3️⃣ UPDATE EVENTS LIST
  ------------------------------ */
      if (state.events) {
        state.events = state.events.map(ev =>
          ev && (ev.id === eventId || ev.event_id === eventId)
            ? bumpCommentCount(ev)
            : ev,
        );
      }

      /* -----------------------------
     4️⃣ UPDATE MY EVENTS
  ------------------------------ */
      if (state.myEvents) {
        state.myEvents = state.myEvents.map(ev =>
          ev && (ev.id === eventId || ev.event_id === eventId)
            ? bumpCommentCount(ev)
            : ev,
        );
      }

      /* -----------------------------
     5️⃣ UPDATE CLUB EVENTS
  ------------------------------ */
      if (state.clubEvents) {
        Object.keys(state.clubEvents).forEach(clubId => {
          state.clubEvents[clubId] = state.clubEvents[clubId].map(ev =>
            ev && (ev.id === eventId || ev.event_id === eventId)
              ? bumpCommentCount(ev)
              : ev,
          );
        });
      }

      /* -----------------------------
     6️⃣ UPDATE EVENT DETAILS
  ------------------------------ */
      if (state.eventDetails[eventId]) {
        const prev =
          Number(
            state.eventDetails[eventId].totalCommentCount ??
              state.eventDetails[eventId].total_comment_count ??
              0,
          ) || 0;

        state.eventDetails[eventId] = {
          ...state.eventDetails[eventId],
          totalCommentCount: prev + 1,
        };
      }
    },

    updateEventLikes(state, action) {
      const { eventId, delta } = action.payload;
      if (!eventId || typeof delta !== 'number') return;

      const isLikeValue = delta === 1 ? true : delta === -1 ? false : undefined;

      const updateLikesOnEv = ev => {
        if (!ev) return ev;
        const prev = Number(ev.totalLikeCount ?? ev.total_like_count ?? 0) || 0;
        return {
          ...ev,
          totalLikeCount: Math.max(0, prev + delta),
          ...(isLikeValue !== undefined && { isLike: isLikeValue }),
        };
      };

      state.events = state.events.map(ev =>
        ev && (ev.id === eventId || ev.event_id === eventId)
          ? updateLikesOnEv(ev)
          : ev,
      );

      state.myEvents = state.myEvents.map(ev =>
        ev && (ev.id === eventId || ev.event_id === eventId)
          ? updateLikesOnEv(ev)
          : ev,
      );

      if (state.clubEvents) {
        Object.keys(state.clubEvents).forEach(clubId => {
          state.clubEvents[clubId] = state.clubEvents[clubId].map(ev =>
            ev && (ev.id === eventId || ev.event_id === eventId)
              ? updateLikesOnEv(ev)
              : ev,
          );
        });
      }

      if (state.eventDetails[eventId]) {
        const prev =
          Number(
            state.eventDetails[eventId].totalLikeCount ??
              state.eventDetails[eventId].total_like_count ??
              0,
          ) || 0;

        state.eventDetails[eventId] = {
          ...state.eventDetails[eventId],
          totalLikeCount: Math.max(0, prev + delta),
          ...(isLikeValue !== undefined && { isLike: isLikeValue }),
        };
      }
    },
    removeOptimisticComment(state, action) {
      const { eventId, tempId } = action.payload;
      if (!eventId || !tempId) return;

      const comments = state.eventComments[eventId] || [];
      state.eventComments[eventId] = comments.filter(c => c.id !== tempId);
    },

    updateCommentLike(state, action) {
      const { eventId, commentId, delta, liked } = action.payload;
      if (!eventId || !commentId) return;

      const list = state.eventComments[eventId] || [];
      state.eventComments[eventId] = list.map(cmt => {
        const cId = cmt.id ?? cmt.comment_id;
        if (cId === commentId) {
          const prevLikes = Number(cmt.likes_count || cmt.like_count || 0);
          return {
            ...cmt,
            likes_count: Math.max(
              0,
              prevLikes + (typeof delta === 'number' ? delta : 0),
            ),
            liked: typeof liked === 'boolean' ? liked : cmt.liked,
          };
        }
        return cmt;
      });
    },
    updateEventAttendanceStatus(state, action) {
      const { eventId, status } = action.payload;
      if (!eventId) return;

      let finalStatus =
        status == 'GoingTo'
          ? 0
          : status == 'Maybe'
          ? 1
          : status == 'No'
          ? 2
          : -1;

      const updateEvent = ev => {
        if (!ev) return ev;
        const oldStatus = ev.status;
        const newStatus = finalStatus;
        let goingToCount = ev.goingToCount || 0;
        let maybeCount = ev.maybeCount || 0;

        if (oldStatus === -1 && newStatus === 0) goingToCount += 1;
        else if (oldStatus === -1 && newStatus === 1) maybeCount += 1;
        else if (oldStatus === 0 && newStatus === -1)
          goingToCount = Math.max(0, goingToCount - 1);
        else if (oldStatus === 0 && newStatus === 1) {
          goingToCount = Math.max(0, goingToCount - 1);
          maybeCount += 1;
        } else if (oldStatus === 0 && newStatus === 2)
          goingToCount = Math.max(0, goingToCount - 1);
        else if (oldStatus === 1 && newStatus === -1)
          maybeCount = Math.max(0, maybeCount - 1);
        else if (oldStatus === 1 && newStatus === 0) {
          maybeCount = Math.max(0, maybeCount - 1);
          goingToCount += 1;
        } else if (oldStatus === 1 && newStatus === 2)
          maybeCount = Math.max(0, maybeCount - 1);
        else if (oldStatus === 2 && newStatus === 0) goingToCount += 1;
        else if (oldStatus === 2 && newStatus === 1) maybeCount += 1;

        return { ...ev, status: newStatus, goingToCount, maybeCount };
      };

      state.events = state.events.map(ev =>
        ev && (ev.id === eventId || ev.event_id === eventId)
          ? updateEvent(ev)
          : ev,
      );
      state.myEvents = state.myEvents.map(ev =>
        ev && (ev.id === eventId || ev.event_id === eventId)
          ? updateEvent(ev)
          : ev,
      );

      if (state.clubEvents) {
        Object.keys(state.clubEvents).forEach(clubId => {
          state.clubEvents[clubId] = state.clubEvents[clubId].map(updateEvent);
        });
      }

      if (state.eventDetails[eventId]) {
        state.eventDetails[eventId] = updateEvent(state.eventDetails[eventId]);
      }
    },
  },
});

export const {
  setEvents,
  setReplacedEvent,
  addMoreEvents,
  setMyEvents,
  addMoreMyEvents,
  setClubEvents,
  addMoreClubEvents,
  setEventDetails,
  setEventComments,
  addEventComments,
  setEventMembers,
  addMoreEventMembers,
  setLoading,
  setError,
  setOnlineStatus,
  setLastSyncTime,
  clearEventState,
  mergeEvent,
  mergeEventCreateUpdate,
  addCommentToEvent,
  removeOptimisticComment,
  updateEventLikes,
  updateCommentLike,
  updateEventAttendanceStatus,
} = eventSlice.actions;

export default eventSlice.reducer;

const checkOnlineStatus = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// export const fetchEvents =
//   (pageNo = 1, perPage = 10, callback) =>
//   async dispatch => {
//     dispatch(setLoading(true));
//     try {
//       const localEvents = await dbHelper.getEvents(pageNo, perPage);
//       if (pageNo === 1) {
//         dispatch(setEvents(localEvents));
//       }
//       // else {
//       //   dispatch(addMoreEvents(localEvents));
//       // }
//       const isOnline = await checkOnlineStatus();
//       dispatch(setOnlineStatus(isOnline));

//       if (isOnline) {
//         const res = await ClubApi.getAllEventList(pageNo, perPage);
//         const data = JSON.parse(res);
//         if (pageNo === 1) {
//           await dbHelper.bulkInsertEvents(data, pageNo);
//         }
//         if (pageNo === 1) {
//           dispatch(setEvents(data));
//         } else {
//           dispatch(addMoreEvents(data));
//         }

//         dispatch(setLastSyncTime(new Date().toISOString()));
//         dispatch(setLoading(false));
//         callback && callback(true, data?.length !== perPage);
//       } else {
//         dispatch(setLoading(false));
//         callback && callback(true, localEvents?.length !== perPage);
//       }
//     } catch (err) {
//       dispatch(setError(err));
//       dispatch(setLoading(false));
//       callback && callback(false, err);
//     }
//   };

export const fetchEvents =
  (pageNo = 1, perPage = 10, mode = 'replace', callback) =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));

    try {
      if (pageNo === 1) {
        const localEvents = await dbHelper.getEvents(pageNo, 10);
        if (localEvents?.length > 0 && mode === 'replace') {
          dispatch(setReplacedEvent(localEvents));
        } else if (localEvents?.length > 0 && mode === 'prepend') {
          const existing = getState().event.events || [];
          dispatch(setEvents([...localEvents]));
        }
      }
      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));

      if (!isOnline) {
        dispatch(setLoading(false));
        callback?.(true, true);
        return;
      }
      const res = await ClubApi.getAllEventList(pageNo, perPage);
      const apiEvents = typeof res === 'string' ? JSON.parse(res) : res;
      if (mode === 'replace') {
        dispatch(setReplacedEvent(apiEvents));
      } else if (mode === 'append') {
        dispatch(setEvents(apiEvents));
      } else if (mode === 'prepend') {
        // const existing = getState().event.events || [];
        dispatch(setEvents([...apiEvents]));
      }
      if (pageNo === 1 && apiEvents?.length > 0) {
        await dbHelper.clearEvents();
        await dbHelper.bulkInsertEvents(apiEvents.slice(0, 10));
      }

      dispatch(setLastSyncTime(new Date().toISOString()));
      dispatch(setLoading(false));

      const isLastPage = apiEvents?.length < perPage;
      callback?.(true, isLastPage);
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback?.(false, err);
    }
  };

export const fetchMyEvents =
  (pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    dispatch(setLoading(true));
    try {
      const localEvents = await dbHelper.getMyEvents(pageNo, perPage);
      if (pageNo === 1) {
        dispatch(setMyEvents(localEvents));
      } else {
        dispatch(addMoreMyEvents(localEvents));
      }
      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));

      if (isOnline) {
        const res = await ClubApi.getMyEventList(pageNo, perPage);
        const data = JSON.parse(res);
        if (pageNo === 1) {
          await dbHelper.bulkInsertMyEvents(data, pageNo);
        }

        if (pageNo === 1) {
          dispatch(setMyEvents(data));
        } else {
          dispatch(addMoreMyEvents(data));
        }

        dispatch(setLastSyncTime(new Date().toISOString()));
        dispatch(setLoading(false));
        callback && callback(true, data?.length !== perPage);
      } else {
        dispatch(setLoading(false));
        callback && callback(true, localEvents?.length !== perPage);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const fetchClubEvents =
  (clubId, pageNo = 1, perPage = 10, callback) =>
  async dispatch => {
    dispatch(setLoading(true));
    try {
      const localEvents = await dbHelper.getClubEvents(clubId, pageNo, perPage);
      if (pageNo === 1) {
        dispatch(setClubEvents({ clubId, data: localEvents }));
      } else {
        dispatch(addMoreClubEvents({ clubId, data: localEvents }));
      }

      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));

      if (isOnline) {
        const res = await ClubApi.getclubsevent(clubId, pageNo, perPage);
        const data = JSON.parse(res);
        if (pageNo === 1) {
          await dbHelper.bulkInsertClubEvents(clubId, data, pageNo);
        }

        if (pageNo === 1) {
          dispatch(setClubEvents({ clubId, data }));
        } else {
          dispatch(addMoreClubEvents({ clubId, data }));
        }

        dispatch(setLastSyncTime(new Date().toISOString()));
        dispatch(setLoading(false));
        callback && callback(true, data?.length !== perPage);
      } else {
        dispatch(setLoading(false));
        callback && callback(true, localEvents?.length !== perPage);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const fetchEventDetails = (eventId, callback) => async dispatch => {
  dispatch(setLoading(true));
  try {
    const localEvent = await dbHelper.getEventById(eventId);
    if (localEvent) {
      dispatch(setEventDetails({ id: eventId, data: localEvent }));
    }
    const isOnline = await checkOnlineStatus();
    dispatch(setOnlineStatus(isOnline));

    if (isOnline) {
      const res = await ClubApi.getclubseventDetails(eventId);
      const data = JSON.parse(res);

      // await dbHelper.upsertEvent(data);

      dispatch(setEventDetails({ id: eventId, data }));
      dispatch(setLoading(false));
      callback && callback(true, data);
    } else {
      dispatch(setLoading(false));
      callback && callback(true, localEvent);
    }
  } catch (err) {
    dispatch(setError(err));
    dispatch(setLoading(false));
    callback && callback(false, err);
  }
};

// export const fetchEventComments =
//   (eventId, pageNo = 1, perPage = 10, options = {}, callback) =>
//   async dispatch => {
//     dispatch(setLoading(true));
//     try {
//       const localComments = await dbHelper.getEventComments(
//         eventId,
//         pageNo,
//         perPage,
//       );
//       if (pageNo === 1) {
//         dispatch(setEventComments({ eventId, data: localComments }));
//       } else {
//         dispatch(addEventComments({ eventId, data: localComments }));
//       }

//       const isOnline = await checkOnlineStatus();
//       dispatch(setOnlineStatus(isOnline));
//       if (isOnline) {
//         const res = await ClubApi.getclubeventComment(eventId, pageNo, perPage);
//         const data = typeof res === 'string' ? JSON.parse(res) : res;
//         if (pageNo === 1) {
//           await dbHelper.bulkInsertComments(eventId, data, pageNo);
//         }

//         if (pageNo === 1) {
//           dispatch(setEventComments({ eventId, data }));
//         } else {
//           dispatch(addEventComments({ eventId, data }));
//         }
//         dispatch(setLoading(false));
//         callback && callback(true, data?.length !== perPage);
//       } else {
//         dispatch(setLoading(false));
//         callback && callback(true, localComments?.length !== perPage);
//       }
//     } catch (err) {
//       dispatch(setError(err));
//       dispatch(setLoading(false));
//       callback && callback(false, err);
//     }
//   };

// eventSlice.js - Updated fetchEventComments action

export const fetchEventComments =
  (eventId, pageNo = 1, perPage = 10, options = {}, callback) =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));

    const { isBottom = false, isTop = false, isStart = false } = options;

    try {
      if (pageNo === 1 && !isTop && !isBottom) {
        const localComments = await dbHelper.getEventComments(
          eventId,
          pageNo,
          perPage,
        );

        if (localComments && localComments.length > 0) {
          dispatch(setEventComments({ eventId, data: localComments }));
        }
      }

      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));

      if (isOnline) {
        try {
          const res = await ClubApi.getclubeventComment(
            eventId,
            pageNo,
            perPage,
          );
          const data = typeof res === 'string' ? JSON.parse(res) : res;
          if (pageNo === 1 || isStart) {
            await dbHelper.bulkInsertComments(eventId, data, pageNo);
          }

          if (isTop) {
            const currentComments =
              getState().event.eventComments[eventId] || [];

            const merged = [...data, ...currentComments];
            const uniqueMap = new Map();
            merged.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) {
                uniqueMap.set(id, item);
              }
            });

            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );

            dispatch(setEventComments({ eventId, data: uniqueList }));
          } else if (isStart) {
            const uniqueMap = new Map();
            data.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) {
                uniqueMap.set(id, item);
              }
            });

            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );

            dispatch(setEventComments({ eventId, data: uniqueList }));
          } else if (isBottom) {
            const currentComments =
              getState().event.eventComments[eventId] || [];
            const merged = [...currentComments, ...data];
            const uniqueMap = new Map();
            merged.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) {
                uniqueMap.set(id, item);
              }
            });

            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );

            dispatch(setEventComments({ eventId, data: uniqueList }));
          } else {
            const uniqueMap = new Map();
            data.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) {
                uniqueMap.set(id, item);
              }
            });

            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );

            dispatch(setEventComments({ eventId, data: uniqueList }));
          }

          dispatch(setLoading(false));
          const isLastPage = data?.length < perPage;
          callback && callback(true, isLastPage);
        } catch (apiError) {
          console.error('API Error fetching comments:', apiError);

          const localComments = await dbHelper.getEventComments(
            eventId,
            pageNo,
            perPage,
          );

          if (isTop) {
            const currentComments =
              getState().event.eventComments[eventId] || [];
            const merged = [...localComments, ...currentComments];
            const uniqueMap = new Map();
            merged.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) uniqueMap.set(id, item);
            });
            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );
            dispatch(setEventComments({ eventId, data: uniqueList }));
          } else if (isStart) {
            dispatch(setEventComments({ eventId, data: localComments }));
          } else if (isBottom) {
            const currentComments =
              getState().event.eventComments[eventId] || [];
            const merged = [...currentComments, ...localComments];
            const uniqueMap = new Map();
            merged.forEach(item => {
              const id = item.id ?? item.comment_id;
              if (id != null) uniqueMap.set(id, item);
            });
            const uniqueList = Array.from(uniqueMap.values());
            uniqueList.sort(
              (a, b) =>
                new Date(a.createdAt || a.created_date || 0) -
                new Date(b.createdAt || b.created_date || 0),
            );
            dispatch(setEventComments({ eventId, data: uniqueList }));
          } else {
            dispatch(setEventComments({ eventId, data: localComments }));
          }

          dispatch(setLoading(false));
          callback && callback(true, localComments?.length < perPage);
        }
      } else {
        const localComments = await dbHelper.getEventComments(
          eventId,
          pageNo,
          perPage,
        );

        if (isTop) {
          const currentComments = getState().event.eventComments[eventId] || [];
          const merged = [...localComments, ...currentComments];
          const uniqueMap = new Map();
          merged.forEach(item => {
            const id = item.id ?? item.comment_id;
            if (id != null) uniqueMap.set(id, item);
          });
          const uniqueList = Array.from(uniqueMap.values());
          uniqueList.sort(
            (a, b) =>
              new Date(a.createdAt || a.created_date || 0) -
              new Date(b.createdAt || b.created_date || 0),
          );
          dispatch(setEventComments({ eventId, data: uniqueList }));
        } else if (isStart) {
          dispatch(setEventComments({ eventId, data: localComments }));
        } else if (isBottom) {
          const currentComments = getState().event.eventComments[eventId] || [];
          const merged = [...currentComments, ...localComments];
          const uniqueMap = new Map();
          merged.forEach(item => {
            const id = item.id ?? item.comment_id;
            if (id != null) uniqueMap.set(id, item);
          });
          const uniqueList = Array.from(uniqueMap.values());
          uniqueList.sort(
            (a, b) =>
              new Date(a.createdAt || a.created_date || 0) -
              new Date(b.createdAt || b.created_date || 0),
          );
          dispatch(setEventComments({ eventId, data: uniqueList }));
        } else {
          dispatch(setEventComments({ eventId, data: localComments }));
        }

        dispatch(setLoading(false));
        callback && callback(true, localComments?.length < perPage);
      }
    } catch (err) {
      console.error('Error in fetchEventComments:', err);
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const postEventComment =
  (payload, eventId, callback) => async dispatch => {
    dispatch(setLoading(true));
    try {
      const tempComment = {
        id: Date.now(),
        commentId: Date.now(),
        ...payload,
        totalLikeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };

      const isOnline = await checkOnlineStatus();
      if (isOnline) {
        const res = await ClubApi.createClubeventcommit(payload);
        let createdComment = res;
        try {
          createdComment = typeof res === 'string' ? JSON.parse(res) : res;
        } catch (e) {
          createdComment = res;
          await dbHelper.insertComment(eventId, tempComment, tempComment?.id);
          await dbHelper.updateEventCommentCount(eventId, 1);
          dispatch(addCommentToEvent({ eventId, comment: tempComment }));
        }
        await dbHelper.insertComment(
          eventId,
          createdComment,
          createdComment?.id,
        );
        await dbHelper.updateEventCommentCount(eventId, 1);
        dispatch(addCommentToEvent({ eventId, comment: createdComment }));

        dispatch(setLoading(false));
        callback && callback(true, createdComment);
      } else {
        await addToSyncQueue('events', 'create_comment', eventId, payload);
        await dbHelper.insertComment(eventId, tempComment, tempComment?.id);
        await dbHelper.updateEventCommentCount(eventId, 1);
        dispatch(addCommentToEvent({ eventId, comment: tempComment }));
        dispatch(setLoading(false));
        callback && callback(true, tempComment);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const likeEvent = (payload, eventId, callback) => async dispatch => {
  try {
    const delta =
      payload?.type === 'like' ? 1 : payload?.type === 'unlike' ? -1 : 1;
    const isLike = delta === 1;
    await dbHelper.updateEventLike(eventId, delta, isLike);
    dispatch(updateEventLikes({ eventId, delta }));
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.EventLike({ eventId: eventId }, eventId);
      callback && callback(true, res);
    } else {
      await addCacheAction('events', 'like', eventId, payload.user_id, payload);
      callback && callback(true, { offline: true });
    }
  } catch (err) {
    callback && callback(false, err);
  }
};

export const likeComment = (commentId, eventId, callback) => async dispatch => {
  try {
    await dbHelper.updateCommentLike(commentId, 1, true);
    dispatch(updateCommentLike({ eventId, commentId, delta: 1, liked: true }));
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.likeComment(commentId);
      callback && callback(true, res);
    } else {
      await addCacheAction('events', 'like_comment', commentId, null, {
        eventId,
      });
      callback && callback(true, { offline: true });
    }
  } catch (err) {
    callback && callback(false, err);
  }
};

export const deleteLike = (commentId, eventId, callback) => async dispatch => {
  try {
    await dbHelper.updateCommentLike(commentId, -1, false);
    dispatch(
      updateCommentLike({ eventId, commentId, delta: -1, liked: false }),
    );
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.deleteLike(commentId);
      callback && callback(true, res);
    } else {
      await addCacheAction('events', 'unlike_comment', commentId, null, {
        eventId,
      });
      callback && callback(true, { offline: true });
    }
  } catch (err) {
    callback && callback(false, err);
  }
};

export const fetchEventMembers =
  (eventId, type = 'all', pageNo = 1, perPage = 9999, callback) =>
  async dispatch => {
    dispatch(setLoading(true));
    try {
      const localMembers = await dbHelper.getEventMembers(
        eventId,
        type,
        pageNo,
        perPage,
      );

      dispatch(setEventMembers({ eventId, type, data: localMembers, pageNo }));

      const isOnline = await checkOnlineStatus();
      dispatch(setOnlineStatus(isOnline));

      if (isOnline) {
        let res;
        if (type === 'maybe') {
          res = await ClubApi.getAllMaybeList(eventId, pageNo, perPage);
        } else if (type === 'going') {
          res = await ClubApi.getAllGoingToList(eventId, pageNo, perPage);
        } else {
          res = await ClubApi.getAllClubEventMemberList(
            eventId,
            pageNo,
            perPage,
          );
        }

        const data = JSON.parse(res);
        if (pageNo === 1) {
          await dbHelper.bulkInsertEventMembers(eventId, data, type, pageNo);
        }
        dispatch(setEventMembers({ eventId, type, data, pageNo }));
        dispatch(setLoading(false));
        const isEnd = data?.length < perPage;
        callback && callback(true, isEnd);
      } else {
        dispatch(setLoading(false));
        const isEnd = localMembers?.length < perPage;
        callback && callback(true, isEnd);
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const createEvent = (payload, clubId, callback) => async dispatch => {
  dispatch(setLoading(true));
  try {
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.createEvent(payload, clubId);
      if (res?.id) {
        dispatch(
          mergeEventCreateUpdate({
            id: res?.id,
            data: res,
          }),
        );
      }
      dispatch(setLoading(false));
      callback && callback(true, res);
    } else {
      await addToSyncQueue('events', 'create', null, {
        ...payload,
        clubId,
      });
      dispatch(setLoading(false));
      callback &&
        callback(true, {
          offline: true,
          message: 'Event will be created when online',
        });
    }
  } catch (err) {
    dispatch(setError(err));
    dispatch(setLoading(false));
    callback && callback(false, err);
  }
};

export const updateEvent =
  (payload, eventId, clubId, callback) => async dispatch => {
    dispatch(setLoading(true));
    try {
      const isOnline = await checkOnlineStatus();

      if (isOnline) {
        const res = await ClubApi.UpdateEvent(payload, eventId, clubId);
        if (res?.id) {
          dispatch(
            mergeEventCreateUpdate({
              id: res?.id,
              data: res,
            }),
          );
        }
        dispatch(setLoading(false));
        callback && callback(true, res);
      } else {
        await addToSyncQueue('events', 'update', eventId, {
          ...payload,
          clubId,
        });
        dispatch(setLoading(false));
        callback &&
          callback(true, {
            offline: true,
            message: 'Event will be updated when online',
          });
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const uploadEventImage =
  (eventId, formData, recurring = false, callback) =>
  async dispatch => {
    dispatch(setLoading(true));
    try {
      const isOnline = await checkOnlineStatus();

      if (isOnline) {
        const res = recurring
          ? await ClubApi.postImageEventricurring(eventId, formData)
          : await ClubApi.postImageEvent(eventId, formData);
        dispatch(setLoading(false));
        callback && callback(true, res);
      } else {
        dispatch(setLoading(false));
        callback && callback(false, { message: 'Cannot upload image offline' });
      }
    } catch (err) {
      dispatch(setError(err));
      dispatch(setLoading(false));
      callback && callback(false, err);
    }
  };

export const fetchCommentLikes = (id, callback) => async dispatch => {
  try {
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.getLikes(id);
      callback && callback(true, JSON.parse(res));
    } else {
      callback && callback(false, { message: 'Offline' });
    }
  } catch (err) {
    callback && callback(false, err);
  }
};

export const updateEventAttendance = (payload, callback) => async dispatch => {
  try {
    const { eventId, status, memberId, user } = payload;
    dispatch(updateEventAttendanceStatus({ eventId, status }));
    await dbHelper.updateEventAttendance(eventId, status);
    await dbHelper.updateUserEventAttendance(eventId, memberId, status, user);
    const isOnline = await checkOnlineStatus();
    if (isOnline) {
      const res = await ClubApi.clubEventMember(payload);
      callback && callback(true, res);
    } else {
      await addToSyncQueue('events', 'update_attendance', eventId, payload);
      callback &&
        callback(true, {
          offline: true,
          message: 'Attendance updated offline',
        });
    }
  } catch (err) {
    callback && callback(false, err);
  }
};

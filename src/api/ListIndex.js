import ApiService from './AxiosInstance';
import { URLS } from './Urls';

function getListIndex(id, clubid, trgetType) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `community/${id}/club/${clubid}/index/${trgetType}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getPostListIndex(id, clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `post/${id}/club/${clubid}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getPostCommentListIndex(id, cummentID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `post/${id}/comment/${cummentID}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getPostCommentListIndexNew(id, cummentID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `post/${id}/comment/${cummentID}/index/new`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getEventListIndex(id, clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `event/${id}/club/${clubid}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getClubListIndex(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getClubMemberListIndex(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/${id}/members/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getEventComment(id, commentId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `event/${id}/comment/${commentId}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripComment(id, commentId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/comment/${commentId}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMyTripListIndex(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripReportComment(id, commentId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `tripreport/${id}/comment/${commentId}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getInviteTripListIndex(id, userID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${userID}/trip/invite/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripExpense(id, expenseId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/expense/${expenseId}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getClubtripListIndex(id, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/${clubID}/trip/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getClubtripReportListIndex(id, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/${clubID}/tripreport/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function gettripChatListIndex(id, tripID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${tripID}/chat/${id}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getEventAttendListIndex(eventID, memeberID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `event/${eventID}/member/${memeberID}/index`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  getListIndex,
  getPostListIndex,
  getEventListIndex,
  getClubListIndex,
  getEventComment,
  getTripComment,
  getMyTripListIndex,
  getInviteTripListIndex,
  getTripExpense,
  getPostCommentListIndex,
  getTripReportComment,
  getClubMemberListIndex,
  getClubtripListIndex,
  getClubtripReportListIndex,
  gettripChatListIndex,
  getEventAttendListIndex,
  getPostCommentListIndexNew,
};

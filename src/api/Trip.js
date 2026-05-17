import ApiService from './AxiosInstance';
import { URLS } from './Urls';

function getRegions(params) {
  return ApiService.withAuth({
    url: URLS.Region,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
  });
}

function getSearchedRegions(search) {
  return ApiService.withAuth({
    url: `region/search/${search}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSpot(params) {
  return ApiService.withAuth({
    url: URLS.Spot,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
  });
}

function createTrip(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getTrips(id, key) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${id}/trip/${key}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripsPagination(id, key, pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${id}/trip/${key}/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getCurrentTrip(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function addExpences(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/expense`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getExpences(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/expense/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getExpencesSum(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/totalexpense`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function commentTrip(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/comment`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function commentReport(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/comment`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getComments(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/comment/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getReportComments(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/comment/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeComment(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/comment/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/comment/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/comment/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeCommentForReportComment(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/comment/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteLikeForReportComment(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/comment/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getLikesForReportComment(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/comment/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function inviteForTrip(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/invite`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getPendingRequest(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/invite`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getInterstedRequests(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/join`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getPassengersList(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/passenger`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteInvite(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/invite/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function cancelTrip(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/cancel`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function sendJoin(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/join`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function acceptInvite(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/join/${id}/accept`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function acceptInviteInvite(id, isDriver) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/invite/${id}/accept/${isDriver}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function rejectInviteInvite(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/invite/${id}/decline`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function declineInvite(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/join/${id}/decline`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createAddress(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `address`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getForecastDetails(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forecast/weather/spot/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getInviteedTrips(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${id}/trip/invite`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getInviteedTripsPending(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${id}/trip/invite/pending`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function sendChat(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/chat`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function sendChatNew(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/chat/new`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getChats(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/chat`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getChatsNew(id, pageNo, perPageCount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/chat/${pageNo}/${perPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeChat(tripid, chatid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${tripid}/chat/${chatid}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteChatLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/chat/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getChatLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/chat/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripReports(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/report/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postReport(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getSuggestedTrips(lat, long) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/near?lat=${lat}&lon=${long}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getNearBySpots(lat, long) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `spot/near?lat=${lat}&lon=${long}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeTrip(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripReportLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteTripReportLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteTripLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeTripReport(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postReportImage(id, data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/image?id=${id}`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function getReportImage(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/image`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getJoins(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/${id}/trip/join`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function verifyForecast(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/forecast-report`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getVerifiedForecast(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/forecast-report`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getForecastForReport(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forecast/weather/trip/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSuggestedTripsByPostCode(code) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/search/postcode?postcode=${code}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getCommunityList(pageNo, pageSize) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/community/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getCommunityListDemo(lastSyncDate) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `user/community/speed?lastSyncDate=${lastSyncDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deletePassenger(id, key) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/passenger/${id}/${key}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteExpense(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/expense/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSpotById(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `spot/${id}`,

    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function addFavouriteSpot(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `favourite/spot`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function deleteFavouriteSpot(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `favourite/spot/{id}?spotId=${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getFavouriteSpot() {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `favourite/spots`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function checkInTrip(tripId, lat, long) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL +
      `trip/checkedin?id=${tripId}&latitude=${lat}&longitude=${long}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getNeatbySpotLocation(Id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `spot/${Id}/nearby`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getRegionsmodifed(Id, depth) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `region/depth/${depth}/parent/${Id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getSpotsByReasonID(regionid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `region/${regionid}/spot/list`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getTripChatCount(tripId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${tripId}/chat/unreadcount`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function readTripChat(tripId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${tripId}/chat/read`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  getRegions,
  addFavouriteSpot,
  deleteFavouriteSpot,
  getFavouriteSpot,
  getSpot,
  getTrips,
  getTripsPagination,
  deleteExpense,
  getCurrentTrip,
  addExpences,
  getExpences,
  commentTrip,
  getComments,
  likeComment,
  getLikes,
  deleteLike,
  inviteForTrip,
  getPendingRequest,
  getInterstedRequests,
  getPassengersList,
  deleteInvite,
  acceptInvite,
  declineInvite,
  createTrip,
  createAddress,
  getForecastDetails,
  getInviteedTrips,
  getInviteedTripsPending,
  acceptInviteInvite,
  sendChat,
  getChats,
  getTripReports,
  postReport,
  getSuggestedTrips,
  sendJoin,
  rejectInviteInvite,
  getNearBySpots,
  likeTrip,
  getTripLikes,
  deleteTripLike,
  getTripReportLikes,
  deleteTripReportLike,
  likeTripReport,
  postReportImage,
  getReportImage,
  getReportComments,
  commentReport,
  getJoins,
  likeCommentForReportComment,
  deleteLikeForReportComment,
  getLikesForReportComment,
  verifyForecast,
  getVerifiedForecast,
  getForecastForReport,
  getSuggestedTripsByPostCode,
  getCommunityList,
  getCommunityListDemo,
  cancelTrip,
  deletePassenger,
  getSpotById,
  getSearchedRegions,
  checkInTrip,
  getNeatbySpotLocation,
  getExpencesSum,
  getRegionsmodifed,
  getSpotsByReasonID,
  likeChat,
  deleteChatLike,
  getChatLikes,
  sendChatNew,
  getChatsNew,
  getTripChatCount,
  readTripChat,
};

import ApiService from './AxiosInstance';

function getProfile(id) {
  return ApiService.withAuth({
    url: `user/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getProfileImages(id) {
  return ApiService.withAuth({
    url: `user/image/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getConversions(id, PageNo) {
  return ApiService.withAuth({
    // url: `user/${id}/chatuserlist`,
    url: `user/${id}/chatgscuserlist/${PageNo}/10`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function cahtRead(id) {
  return ApiService.withAuth({
    url: `user/${id}/chat/read`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteImage(id, type) {
  return ApiService.withAuth({
    url: `user/deletegallery/${id}/${type}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getLocationData(postcode, countrycode) {
  return ApiService.withAuth({
    url: `user/postcode/${postcode}/country/${countrycode}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function vouchUser(data) {
  return ApiService.withAuth({
    url: `user/vouch/invite`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getTripReports(id) {
  return ApiService.withAuth({
    url: `user/${id}/trip/report`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postGalleryImage(data) {
  return ApiService.withAuth({
    url: `user/gallery`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function postGalleryImageForSignUp(userId, data) {
  return ApiService.withAuth({
    url: `user/profileimage/${userId}`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function updateProfileImages(data) {
  return ApiService.withAuth({
    url: `user/image`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function getFriendList(id) {
  return ApiService.withAuth({
    url: `user/${id}/friends`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function updateProfile(data) {
  return ApiService.withAuth({
    url: `user`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getSendedRequests(id) {
  return ApiService.withAuth({
    url: `user/${id}/sendedrequest`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getReceivedRequest(id) {
  return ApiService.withAuth({
    url: `user/${id}/receivedrequest`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getNotificationList(pageNo, pageSize) {
  return ApiService.withAuth({
    url: `user/notification/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getNotificationCount() {
  return ApiService.withAuth({
    url: `user/unreadnotificationCount`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMessageNotificationCount() {
  return ApiService.withAuth({
    url: `user/unread/message/count`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getFriendStatus(userid, touserid) {
  return ApiService.withAuth({
    url: `user/${userid}/friend/${touserid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteFriend(userid, fromuserid) {
  return ApiService.withAuth({
    url: `user/${fromuserid}/reject/${userid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function sendFriendRequest(userid, touserid) {
  return ApiService.withAuth({
    url: `user/${userid}/request/${touserid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function acceptFriendRequest(userid, fromuserid) {
  return ApiService.withAuth({
    url: `user/${fromuserid}/accept/${userid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteNotification(id) {
  return ApiService.withAuth({
    url: `user/notification/delete/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function readNotification(id) {
  return ApiService.withAuth({
    url: `user/notification/read/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMyclubs(PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: `club/list/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getclubList(userId, PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: `user/${userId}/club/profile/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function modifyNodifications(data) {
  return ApiService.withAuth({
    url: `notification/modification`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getProfileTrips(id, pageNo, pageSize) {
  return ApiService.withAuth({
    url: `user/${id}/trip/profile/${pageNo}/${pageSize}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  getProfile,
  getProfileImages,
  getTripReports,
  getConversions,
  postGalleryImage,
  getFriendList,
  updateProfile,
  updateProfileImages,
  getSendedRequests,
  getReceivedRequest,
  getFriendStatus,
  deleteFriend,
  sendFriendRequest,
  acceptFriendRequest,
  postGalleryImageForSignUp,
  getNotificationList,
  deleteNotification,
  getNotificationCount,
  readNotification,
  getLocationData,
  vouchUser,
  deleteImage,
  getMyclubs,
  getclubList,
  modifyNodifications,
  getProfileTrips,
  cahtRead,
  getMessageNotificationCount,
};

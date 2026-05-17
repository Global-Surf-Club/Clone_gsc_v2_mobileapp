import ApiService from './AxiosInstance';
import { URLS } from './Urls';

function getAllclubs(PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/all/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMyclubs(PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/my/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getJoinclubs(Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/join`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createClub(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function updateClub(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${data?.id}/update`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function clubsJoinaccept(Clubid, userid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/accept/${userid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function clubsJoindecline(Clubid, userid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/decline/${userid}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getclubsDetail(Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getclubsDetailFull(Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/all`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getclubsevent(Clubid, PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/event/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubsmemebers(Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/members`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubsActivememebers(name, Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/members/active?name=${name}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubtrip(Clubid, PageNo, PerPageCount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/trip/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubforum(Clubid, PageNo, PerPageCount) {
  return ApiService.withAuth({
    // url: URLS.BASE_URL_Other + `club/${Clubid}/forum/${PageNo}/${PerPageCount}`,
     url: URLS.BASE_URL_Other + `club/${Clubid}/forum/${PageNo}/${PerPageCount}/new`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubtripreport(Clubid, PageNo, PerPageCount) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other +
      `club/${Clubid}/tripreport/${PageNo}/${PerPageCount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllclubgallery(Clubid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/gallery`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createEvent(data, Clubid) {
  let URL = '';
  if (Clubid == '-999') {
    URL = URLS.BASE_URL_Other + `event`;
  } else {
    URL = URLS.BASE_URL_Other + `club/event`;
  }
  return ApiService.withAuth({
    url: URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function UpdateEvent(data, eventId, Clubid) {
  let URL = '';
  if (Clubid == '-999') {
    URL = URLS.BASE_URL_Other + `event/${eventId}`;
  } else {
    URL = URLS.BASE_URL_Other + `club/${eventId}/event`;
  }
  return ApiService.withAuth({
    url: URL,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function clubsTripsLike_Unlike(Clubid, userid) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${Clubid}/event/${userid}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteclubgallery(Clubid, targetId, targetType) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other + `club/${Clubid}/gallery/${targetId}/${targetType}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postGalleryImage(data, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${clubID}/gallery`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function getclubeventComment(eventId, pageno, pagepercount) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other +
      `event/${eventId}/comment/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function createClubeventcommit(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/event/${data?.EventId}/comment`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function createclubforum(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${data?.ClubId}/forum/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function updateclubforum(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `forum/update/${data?.id}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function postImageClubs(clubId, data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${clubId}/image`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function postImage(id, data) {
  return ApiService.withAuth({
    url: `forum/image?id=${id}`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function postClubTripReport(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${data?.clubId}/tripreport/create`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function createClubTrip(data, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${clubID}/trip`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function inviteFormember(data, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/member/invite`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function invitenongscmember(data, clubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${clubID}/member/invite/nongsc`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function EventLike(data, Id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/event/${Id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getclubseventDetails(EventId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/${EventId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function RemoveClubMember(clubId, memberId, self) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${clubId}/members/${memberId}/${self}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function likeComment(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/comment/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function deleteLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/comment/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/comment/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function postImageEvent(id, data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/${id}/image`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function postImageEventricurring(id, data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/${id}/image/recurring`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function clubEventMember(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/member`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getAllEventList(pageno, pagepercount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMyEventList(pageno, pagepercount) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `event/Organizer/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllMaybeList(eventID, pageno, pagepercount) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other +
      `event/${eventID}/members/maybe/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllGoingToList(eventID, pageno, pagepercount) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other +
      `event/${eventID}/members/goingto/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllClubEventMemberList(eventID, pageno, pagepercount) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL_Other +
      `event/${eventID}/members/${pageno}/${pagepercount}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getClubInviteMemberList(name, ClubID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `club/${ClubID}/gscmember?name=${name}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function ClubTripAccept(id, isDriver) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/invite/accept/${isDriver}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function ClubTripReject(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${id}/invite/decline`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function forumLike(id, clubId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forum/${id}/like/${clubId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function forumDisLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forum/like/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getFourmLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forum/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function removeImage(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forum/image/delete`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function fourmDelete(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `forum/delete/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function eventDelete(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `event/delete/${id}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getclubsTripsLikes(id) {
  //
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/report/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function checkusertripcount(clubid, id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/${clubid}/trippassenger/checkin/count`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getCreteClubConfirmation() {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `user/club/create`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getEventRecurringType(name) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `param/${name}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function eventLike(id, clubId) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/event/${id}/like`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function eventDisLike(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/event/${id}/like`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function geteventLikes(id) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `event/${id}/like`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getAllClubsSpeed(lastSyncDate) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/all/speed?lastSyncDate=${lastSyncDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getMyClubsSpeed(lastSyncDate) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `club/my/speed?lastSyncDate=${lastSyncDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  getMyclubs,
  getAllclubs,
  createClub,
  updateClub,
  postImageClubs,
  getJoinclubs,
  clubsJoindecline,
  clubsJoinaccept,
  getclubsDetailFull,
  getclubsDetail,
  getAllclubsmemebers,
  getAllclubsActivememebers,
  getAllclubtrip,
  getAllclubtripreport,
  getAllclubgallery,
  getclubsevent,
  createEvent,
  clubsTripsLike_Unlike,
  deleteclubgallery,
  postGalleryImage,
  getAllclubforum,
  getclubeventComment,
  createClubeventcommit,
  createclubforum,
  postImage,
  postClubTripReport,
  createClubTrip,
  inviteFormember,
  invitenongscmember,
  EventLike,
  getclubseventDetails,
  UpdateEvent,
  RemoveClubMember,
  likeComment,
  deleteLike,
  getLikes,
  postImageEvent,
  postImageEventricurring,
  clubEventMember,
  getAllEventList,
  getMyEventList,
  getAllMaybeList,
  getAllGoingToList,
  getAllClubEventMemberList,
  getClubInviteMemberList,
  ClubTripReject,
  ClubTripAccept,
  updateclubforum,
  forumLike,
  forumDisLike,
  getFourmLikes,
  removeImage,
  fourmDelete,
  eventDelete,
  getclubsTripsLikes,
  checkusertripcount,
  getCreteClubConfirmation,
  getEventRecurringType,
  eventLike,
  eventDisLike,
  geteventLikes,
  getMyClubsSpeed,
  getAllClubsSpeed,
};

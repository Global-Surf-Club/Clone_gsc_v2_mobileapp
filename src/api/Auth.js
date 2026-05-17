import ApiService from './AxiosInstance';
import { URLS } from './Urls';

function login(data) {
  return ApiService.withOutAuth({
    url: URLS.Login,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getBootstrapDeletion(data) {
  return ApiService.withOutAuth({
    url: 'deleted/records',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function VersionCheckAPi(key) {
  return ApiService.withOutAuth({
    url: `configuration/${key}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function signUp(data) {
  return ApiService.withOutAuth({
    url: `user`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function acceptInvite(data) {
  return ApiService.withOutAuth({
    url: URLS.AcceptInvite,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getUserData(params) {
  return ApiService.withAuth({
    url: URLS.GetUser,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    params,
  });
}

function getUserDatapagination(data) {
  return ApiService.withAuth({
    url: `user/allgsc`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function updateFCM(data) {
  return ApiService.withAuth({
    url: `user/Token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getUserDataById(id) {
  return ApiService.withAuth({
    url: `user/${id}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function forgotPassword(data) {
  return ApiService.withAuth({
    url: URLS.forgotPassword,
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function validateCode(data) {
  return ApiService.withAuth({
    url: `user/password/verify`,
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function resetPassword(data) {
  return ApiService.withAuth({
    url: `user/password/change`,
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getChatWithMembers(receiverId, senderId) {
  return ApiService.withAuth({
    url: `user/chat?receiverId=${receiverId}&senderId=${senderId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function sendMessage(data) {
  return ApiService.withAuth({
    url: `user/chat`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function inviteToApp(data) {
  return ApiService.withAuth({
    url: `user/invite`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function updatePassword(data) {
  return ApiService.withAuth({
    url: `user/password`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getSettings(key) {
  return ApiService.withAuth({
    url: `setting/${key}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function checkInvited(data) {
  return ApiService.withAuth({
    url: `user/checkinviteemail`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function deleteData(data) {
  return ApiService.withAuth({
    url: `user/deleterequest`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

export default {
  login,
  acceptInvite,
  getUserData,
  forgotPassword,
  getChatWithMembers,
  sendMessage,
  signUp,
  inviteToApp,
  validateCode,
  resetPassword,
  getUserDataById,
  updateFCM,
  updatePassword,
  getSettings,
  checkInvited,
  deleteData,
  getUserDatapagination,
  VersionCheckAPi,
  getBootstrapDeletion,
};

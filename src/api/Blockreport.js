import ApiService from './AxiosInstance';
import {URLS} from './Urls';

function createblockreport(data) {
  // let datanew = ApiService.withAuth({
  //   url: URLS.BASE_URL + `blockreport`,
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   data,
  // });

  // return datanew;
  return ApiService.withAuth({
    url: URLS.BASE_URL + `blockreport`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function checkblockuser(targetType, ID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `block/user/check/${targetType}/${ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function checkusertripcount(ID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trippassenger/${ID}/checkin/count`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function checkusercheckedinOrNot(tripID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `trip/${tripID}/checkedin/allow`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function unblockkuser(targetType, ID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `block/user/unblock/${targetType}/${ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function Usercheckprofileblock(targetType, ID) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `block/${ID}/me/${targetType}/check`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getuserReason() {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `param/reportoption`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  createblockreport,
  checkblockuser,
  unblockkuser,
  Usercheckprofileblock,
  getuserReason,
  checkusertripcount,
  checkusercheckedinOrNot,
};

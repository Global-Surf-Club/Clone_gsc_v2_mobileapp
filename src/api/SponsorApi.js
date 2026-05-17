import ApiService from './AxiosInstance';
import { URLS } from './Urls';

function getSponsor(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `app/sponsor`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function createBusiness(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `app/businesscreate`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function postImageSponsor(businessID, data) {
  return ApiService.withAuth({
    url: `app/business/${businessID}/image`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data`,
    },
    data,
  });
}

function getbusiness(data) {
  return ApiService.withAuth({
    url: URLS.BASE_URL_Other + `app/getallbusiness`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data,
  });
}

function getSponsorSpeed(lastSyncDate) {
  return ApiService.withAuth({
    url: URLS.BASE_URL + `app/sponsor/speed?lastSyncDate=${lastSyncDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function getbusinessSpeed(lastSyncDate) {
  return ApiService.withAuth({
    url:
      URLS.BASE_URL + `app/getallbusiness/speed?lastSyncDate=${lastSyncDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export default {
  getSponsor,
  createBusiness,
  postImageSponsor,
  getbusiness,
  getSponsorSpeed,
  getbusinessSpeed,
};

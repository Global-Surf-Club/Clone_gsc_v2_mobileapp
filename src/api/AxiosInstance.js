import axios from 'axios';
import * as RootNavigation from '../navigation/RootNavigation';
import { URLS } from './Urls';

let Authorization = '';

const OnSuccess = function (response) {
  if (response.request._method == 'GET') {
    return response.request._response;
  } else {
    return response.data;
  }
};

const OnError = function (error) {
  if (error.response) {
    if (error.response.status == 401 && Authorization !== '') {
      Authorization = '';
      RootNavigation &&
        RootNavigation?.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      throw { code: 401 };
    }
    throw error.response.data;
  } else {
    throw error;
  }
};

const withAuth = async function (option) {
  option.headers.Authorization = Authorization;
  const APIClient = axios.create({
    baseURL: URLS.BASE_URL,
  });
  return APIClient(option).then(OnSuccess).catch(OnError);
  // const temp = APIClient(option).then(OnSuccess).catch(OnError);
};

const setToken = token => {
  if (token == null) {
    Authorization = '';
  } else {
    Authorization = 'Bearer ' + token;
  }
};

const withOutAuth = async function (option) {
  const APIClient = axios.create({
    baseURL: URLS.BASE_URL,
  });

  return APIClient(option).then(OnSuccess).catch(OnError);
};

const ApiService = {
  withAuth,
  withOutAuth,
  setToken,
};
export default ApiService;

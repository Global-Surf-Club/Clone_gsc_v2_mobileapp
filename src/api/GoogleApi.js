import axios from 'axios';

export const getPlaceDetail = (id, GoogleApiKey) => {
  return axios.get(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${GoogleApiKey}`,
  );
};

export const getPlaceByPostCode = (zipCode, countryCode) => {
  return axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json?components=postal_code:' +
      zipCode +
      '|country:' +
      countryCode +
      '&sensor=false&key=' +
      GoogleApiKey,
  );
};

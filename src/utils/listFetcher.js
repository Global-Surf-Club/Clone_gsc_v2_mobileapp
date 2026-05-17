// src/utils/listFetcher.js
import NetInfo from '@react-native-community/netinfo';

const safeCallback = (cb, ...args) => {
  if (typeof cb === 'function') {
    cb(...args);
  }
};

export const fetchListWithCache = async ({
  reduxData,
  dispatch,
  setRedux,
  getFromDB,
  saveToDB,
  fetchFromAPI,
  pageNo = 1,
  pageSize = 10,
  callback,
}) => {
  try {
    // 1️⃣ Redux check
    if (pageNo === 1 && reduxData?.length > 0) {
      safeCallback(callback, true, false);
      return;
    }

    // 2️⃣ Local DB check
    const localData = await getFromDB(pageNo, pageSize);
    if (localData?.length > 0) {
      dispatch(setRedux(localData));
      safeCallback(callback, true, localData.length < pageSize);
      return;
    }

    // 3️⃣ Network check
    const netInfo = await NetInfo.fetch();
    const isOnline = netInfo.isConnected && netInfo.isInternetReachable;

    if (!isOnline) {
      safeCallback(callback, false, 'Offline & no cache');
      return;
    }

    // 4️⃣ API call
    const apiData = await fetchFromAPI(pageNo, pageSize);

    if (pageNo === 1) {
      await saveToDB(apiData.slice(0, pageSize));
    }

    dispatch(setRedux(apiData));
    safeCallback(callback, true, apiData.length < pageSize);
  } catch (err) {
     safeCallback(callback, false, err);
  }
};

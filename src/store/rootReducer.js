import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import forumReducer from './forumSlice';
import profileReducer from './profileSlice';
import sponsorReducer from './sponsorSlice';
import eventReducer from './eventSlice';
import tripReducer from './tripSlice';
import clubReducer from './clubSlice';
import configReducer from './configSlice';
import chatReducer from './chatSlice';

const appReducer = combineReducers({
  auth: authReducer,
  trip: tripReducer,
  profile: profileReducer,
  community: forumReducer,
  event: eventReducer,
  club: clubReducer,
  sponsors: sponsorReducer,
  config: configReducer,
  chat: chatReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/logout') {
    state = undefined; // 💣 FULL REDUX RESET
  }
  return appReducer(state, action);
};

export default rootReducer;

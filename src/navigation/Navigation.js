//import liraries
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {StatusBar} from 'react-native';
import {Color} from '../constants/Constants';
import {defaultNavigationOptions} from '../constants/Utility';
import DrawerContent from '../navigation/DrawerContent';
import SubitemDrawer from '../navigation/SubitemDrawer';
import NotificationsService from '../PushNotification/NotificationsService';
import AboutEdit from '../screen/AboutEdit';
import AcceptInvitation from '../screen/AcceptInvitation';
import AppInvite from '../screen/AppInvite';
import ClubHome from '../screen/ClubHome';
import ClubMytrip from '../screen/ClubMytrip';
import ClubOrganizeForm from '../screen/ClubOrganizeForm';
import ClubOrganizetrip from '../screen/ClubOrganizetrip';
import ClubProfile from '../screen/ClubProfile';
import ClubsubForcastTabItem from '../screen/ClubsubForcastTabItem';
import ClubTripdetail from '../screen/ClubTripdetail';
import Community from '../screen/Community';
import CreateClub from '../screen/CreateClub';
import CreateEvent from '../screen/CreateEvent';
import CreatePost from '../screen/CreatePost';
import CreateReport from '../screen/CreateReport';
import EventViewDetail from '../screen/EventViewDetail';
import Forgotpassword from '../screen/Forgotpassword';
import GSCMembers from '../screen/GSCMembers';
import Home from '../screen/Home';
import Invite from '../screen/Invite';
import Login from '../screen/Login';
import Mytrip from '../screen/Mytrip';
import Notification from '../screen/Notification';
import OrganizeForm from '../screen/OrganizeForm';
import Organizetrip from '../screen/Organizetrip';
import PersonalChat from '../screen/PersonalChat';
import Postcomment from '../screen/Postcomment';
import Profile from '../screen/Profile';
import Signup from '../screen/Signup';
// import SplashScreen from '../screen/SplashScreen';
import TripComments from '../screen/TripComments';
import TripDetail from '../screen/TripDetail';
import TripReport from '../screen/TripReport';
import TripReportComments from '../screen/TripReportComments';
import UpdatePassword from '../screen/UpdatePassword';
import UpdateProfile from '../screen/UpdateProfile';
import WeatherDetail from '../screen/WeatherDetail';
import WebViewScreen from '../screen/WebViewScreen';
import DeleteMyData from '../screen/DeleteMyData';
import {navigationRef} from './RootNavigation';

import ClubHomeMain from '../screen/ClubHomeMain';
import EventHomeMain from '../screen/EventHomeMain';
import ClubTripReportComments from '../screen/ClubTripReportComments';
import ClubEventComments from '../screen/ClubEventComments';
import CreateClubForumPost from '../screen/CreateClubForumPost';
import CreateClubReport from '../screen/CreateClubReport';
import ClubTripReport from '../screen/ClubTripReport';
import ClubInvite from '../screen/ClubInvite';
import ClubAppInvite from '../screen/ClubAppInvite';
import ClubForumcomment from '../screen/ClubForumcomment';
import CreateSponsor from '../screen/sponsors/CreateSponsor';
import Map from '../mapView/Map';
import SponsorsHomeMain from '../screen/sponsors/SponsorsHomeMain';
import SponsorMap from '../screen/sponsors/sponsorMap';
import PostDetailScreen from '../screen/PostDetailScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const SideDrower = () => {
  return (
    <>
      <StatusBar backgroundColor={Color.white} barStyle="dark-content" />
      <Drawer.Navigator
        screenOptions={defaultNavigationOptions}
        drawerContent={props => <DrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={Home} />
      </Drawer.Navigator>
    </>
  );
};

// create a component
const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={defaultNavigationOptions}>
        <Stack.Screen
          name="NotificationsService"
          component={NotificationsService}
        />
        {/* <Stack.Screen name="SplashScreen" component={SplashScreen} /> */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Forgotpassword" component={Forgotpassword} />
        <Stack.Screen name="AcceptInvitation" component={AcceptInvitation} />
        <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
        <Stack.Screen name="AppInvite" component={AppInvite} />
        <Stack.Screen name="SideDrower" component={SideDrower} />
        <Stack.Screen name="SubitemDrawer" component={SubitemDrawer} />
        <Stack.Screen name="Mytrip" component={Mytrip} />
        <Stack.Screen name="Organizetrip" component={Organizetrip} />
        <Stack.Screen name="OrganizeForm" component={OrganizeForm} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen name="TripReport" component={TripReport} />
        <Stack.Screen name="TripDetail" component={TripDetail} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Invite" component={Invite} />
        <Stack.Screen name="CreateReport" component={CreateReport} />
        <Stack.Screen name="WeatherDetail" component={WeatherDetail} />
        <Stack.Screen name="GSCMembers" component={GSCMembers} />
        <Stack.Screen name="Notification" component={Notification} />
        <Stack.Screen name="ClubHome" component={ClubHome} />
        <Stack.Screen name="ClubTripdetail" component={ClubTripdetail} />
        <Stack.Screen name="ClubTripReport" component={ClubTripReport} />
        <Stack.Screen name="ClubForumcomment" component={ClubForumcomment} />
       <Stack.Screen
          name="ClubsubForcastTabItem"
          component={ClubsubForcastTabItem}
        />
        <Stack.Screen
          name="ClubTripReportComments"
          component={ClubTripReportComments}
        />
        <Stack.Screen
          name="TripReportComments"
          component={TripReportComments}
        />
        <Stack.Screen name="CreateClubReport" component={CreateClubReport} />
        <Stack.Screen name="ClubEventComments" component={ClubEventComments} />
        <Stack.Screen name="ClubProfile" component={ClubProfile} />
        <Stack.Screen name="CreateClub" component={CreateClub} />
        <Stack.Screen name="ClubMytrip" component={ClubMytrip} />
        <Stack.Screen name="ClubHomeMain" component={ClubHomeMain} />
        <Stack.Screen name="EventHomeMain" component={EventHomeMain} />
        <Stack.Screen name="ClubAppInvite" component={ClubAppInvite} />
        <Stack.Screen
          name="CreateClubForumPost"
          component={CreateClubForumPost}
        />
        <Stack.Screen name="CreateEvent" component={CreateEvent} />
        <Stack.Screen name="ClubOrganizetrip" component={ClubOrganizetrip} />
        <Stack.Screen name="ClubInvite" component={ClubInvite} />
        <Stack.Screen name="EventViewDetail" component={EventViewDetail} />
        <Stack.Screen name="ClubOrganizeForm" component={ClubOrganizeForm} />
        <Stack.Screen name="TripComments" component={TripComments} />
        <Stack.Screen name="AboutEdit" component={AboutEdit} />
        <Stack.Screen name="PersonalChat" component={PersonalChat} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="Postcomment" component={Postcomment} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
        <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
        <Stack.Screen name="DeleteMyData" component={DeleteMyData} />
        <Stack.Screen name="CreateSponsor" component={CreateSponsor} />
        <Stack.Screen name="Map" component={Map} />
        <Stack.Screen name="SponsorsHomeMain" component={SponsorsHomeMain} />
        <Stack.Screen name="SponsorMap" component={SponsorMap} />
          <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
      </Stack.Navigator>

      {/* <NotificationsService /> */}
    </NavigationContainer>
  );
};

export default Navigation;

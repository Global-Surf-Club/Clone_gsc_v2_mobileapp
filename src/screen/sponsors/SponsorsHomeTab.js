import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Linking,
  Modal,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { Searchbar } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { styles } from './style';
import { SponsorsItem, BusinessesItem } from '../../components/SponsorsItem';
import CustomFlatList from '../../components/CustomFlatList';
import Loader from '../../constants/Loader';
import { Color } from '../../constants/Constants';
import { URLS } from '../../api/Urls';
import ConnectionBanner from '../../components/ConnectionBanner';
import StatusMessage from '../../components/StatusMessage';
import SyncInfo from '../../components/SyncStatus';
import { getBusinessSpeed, getSponsorSpeed } from '../../store/sponsorSlice';

export const SponsorsTab = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const sponsors = useSelector(state => state.sponsors.sponsorlist);
  const loadingLocal = useSelector(state => state.sponsors.loadingLocal);
  const loadingRemote = useSelector(state => state.sponsors.loadingRemote);
  const lastSyncTime = useSelector(state => state.sponsors.lastSyncTime);
  const [searchQuery, setSearchQuery] = useState('');
  const [network, setNetwork] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setNetwork(!!s.isConnected));
    return unsub;
  }, []);

  const load = useCallback(() => {
    dispatch(getSponsorSpeed(searchQuery));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    load();
  }, [searchQuery]);

  const onRefresh = () => {
    load();
  };

  const isInitialLoading =
    (loadingLocal || loadingRemote) && sponsors.length === 0;

  return (
    <View style={styles.container}>
      {!network && <ConnectionBanner isOnline={network} />}

      {lastSyncTime && network && !loadingLocal && !loadingRemote && (
        <SyncInfo lastSyncTime={lastSyncTime} />
      )}

      <Loader visible={isInitialLoading} />

      <View style={[styles.searchcontainer, { marginTop: 10 }]}>
        <Searchbar
          placeholder="Search sponsors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      {sponsors.length > 0 ? (
        <CustomFlatList
          data={sponsors}
          onRefresh={onRefresh}
          refreshing={isInitialLoading}
          contentContainerStyle={{
            paddingBottom: 20 + getBottomSpace(),
          }}
          renderItem={({ item }) => (
            <SponsorsItem
              {...item}
              onumberClick={() => Linking.openURL(`tel:${item.phoneNumber}`)}
              onPressGenerateCode={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
              onPressmap={(latlongArray, imagepath) => {
                navigation.navigate('SponsorMap', {
                  MakerData: latlongArray,
                  imagepath,
                });
              }}
              onPressNearbySpot={item => {
                navigation.navigate('Organizetrip', {
                  resonList: [item],
                  serchString:
                    item?.children[0]?.children[0]?.spotList[0]?.title,
                });
              }}
            />
          )}
          keyExtractor={item => item.id?.toString()}
        />
      ) : (
        !loadingLocal &&
        !loadingRemote && (
          <StatusMessage
            isOnline={network}
            hasData={false}
            title="No Sponsors Available"
          />
        )
      )}

      <Modal transparent visible={modalVisible}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.close}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-circle" size={26} />
            </Pressable>

            <QRCode
              value={URLS.BASE_URL_Other + selectedItem?.qrcodeString}
              size={120}
            />

            <Text style={styles.promoText}>
              {selectedItem?.sponsirship || 'N/A'}
            </Text>
            <Text style={styles.productName}>
              {selectedItem?.name || 'N/A'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const BusinessesTab = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const businesses = useSelector(state => state.sponsors.businessList);
  const loadingLocal = useSelector(state => state.sponsors.loadingLocal);
  const loadingRemote = useSelector(state => state.sponsors.loadingRemote);
  const lastSyncTime = useSelector(state => state.sponsors.lastSyncTime);

  const [searchQuery, setSearchQuery] = useState('');
  const [network, setNetwork] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setNetwork(!!s.isConnected));
    return unsub;
  }, []);

  const load = useCallback(() => {
    dispatch(getBusinessSpeed(searchQuery));
  }, [dispatch, searchQuery]);

  useEffect(() => {
    load();
  }, [searchQuery]);

  const onRefresh = () => {
    load();
  };

  const isInitialLoading =
    (loadingLocal || loadingRemote) && businesses.length === 0;

  return (
    <View style={styles.container}>
      {!network && <ConnectionBanner isOnline={network} />}

      {lastSyncTime && network && !loadingLocal && !loadingRemote && (
        <SyncInfo lastSyncTime={lastSyncTime} />
      )}

      <Loader visible={isInitialLoading} />

      <View style={[styles.searchcontainer, { marginTop: 10 }]}>
        <Searchbar
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
      </View>

      {businesses.length > 0 ? (
        <CustomFlatList
          data={businesses}
          onRefresh={onRefresh}
          refreshing={isInitialLoading}
          contentContainerStyle={{
            paddingBottom: 20 + getBottomSpace(),
          }}
          renderItem={({ item }) => (
            <BusinessesItem
              {...item}
              onumberClick={() => Linking.openURL(`tel:${item.phoneNumber}`)}
              onPressmap={(latlongArray, imagepath) => {
                navigation.navigate('SponsorMap', {
                  MakerData: latlongArray,
                  imagepath,
                });
              }}
              onPressNearbySpot={item => {
                navigation.navigate('Organizetrip', {
                  resonList: [item],
                  serchString:
                    item?.children[0]?.children[0]?.spotList[0]?.title,
                });
              }}
            />
          )}
          keyExtractor={item => item.id?.toString()}
        />
      ) : (
        !loadingLocal &&
        !loadingRemote && (
          <StatusMessage
            isOnline={network}
            hasData={false}
            title="No Businesses Available"
          />
        )
      )}
    </View>
  );
};

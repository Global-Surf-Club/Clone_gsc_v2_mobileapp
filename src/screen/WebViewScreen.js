// WebViewScreen.js - WITH FULL OFFLINE SUPPORT
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import Auth from '../api/Auth';
import { Header } from '../components/Header';
import { Color } from '../constants/Constants';
import Loader from '../constants/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as dbHelper from '../database/eventDbHelper';
import StatusMessage from '../components/StatusMessage';
import ConnectionBanner from '../components/ConnectionBanner';

const WebViewScreen = () => {
  const navigation = useNavigation();
  const [url, setUrl] = useState(null);
  const [loader, setLoader] = useState(false);
  const [webViewLoader, setWebViewLoader] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const route = useRoute();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    getData();
  }, [route.params]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected;
      setIsOnline(online);
      if (online && (!url || errorMessage)) {
        getData();
      }
    });

    return () => unsubscribe();
  }, [url, errorMessage]);

  const getData = async () => {
    try {
      setLoader(true);
      setErrorMessage(false);

      const netInfo = await NetInfo.fetch();
      const online = netInfo.isConnected;
      const settingKey = `webview_${route.params?.key}`;
      const cachedUrl = await dbHelper.getAppConfig(settingKey);

      if (cachedUrl) {
        setUrl(cachedUrl);
      }

      if (online) {
        try {
          const data = JSON.parse(await Auth.getSettings(route.params?.key));
          if (data && data !== cachedUrl) {
            await dbHelper.saveAppConfig(settingKey, data);
            setUrl(data);
          }
        } catch (error) {
          if (!cachedUrl) throw error;
        }
      } else {
        if (!cachedUrl) {
          setUrl(null);
          setErrorMessage(true);
        }
      }
    } catch (error) {
 
      setErrorMessage(true);
    } finally {
      setLoader(false);
    }
  };

  const onShouldStartLoadWithRequest = event => {
    try {
      const isExternalLink =
        Platform.OS === 'ios' ? event.navigationType === 'click' : true;

      if (event.url.startsWith('http') && isExternalLink) {
        Linking.canOpenURL(event.url).then(supported => {
          if (supported) Linking.openURL(event.url);
        });
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const handleWebViewError = () => {
 
    setWebViewLoader(false);
    setErrorMessage(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        backbutton={'chevron-left-circle'}
        onPressLeft={() => navigation.goBack()}
        title={route.params?.name}
        textAlign={'center'}
      />

      <ConnectionBanner isOnline={isOnline} />

      {/* ---------- STATUS MESSAGE ---------- */}
      {(errorMessage || (!url && !loader)) && (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <StatusMessage
            isOnline={isOnline}
            hasData={false}
            title={`No ${route.params?.name} Available`}
          />
        </View>
      )}

      {/* ---------- WEBVIEW ---------- */}
      {url && !errorMessage && (
        <WebView
          onLoadStart={() => setWebViewLoader(true)}
          onLoadEnd={() => setWebViewLoader(false)}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          style={styles.webview}
          source={{ uri: url }}
          cacheEnabled={true}
          cacheMode="LOAD_CACHE_ELSE_NETWORK"
        />
      )}

      {/* ---------- LOADER ---------- */}
      {(loader || webViewLoader) && !errorMessage && (
        <Loader visible={loader || webViewLoader} />
      )}
    </SafeAreaView>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  webview: {
    flex: 1,
  },
});

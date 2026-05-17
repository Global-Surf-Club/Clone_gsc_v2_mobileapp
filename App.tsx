import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import Navigation from './src/navigation/Navigation';
import {
  LogBox,
  PermissionsAndroid,
  Linking,
  Alert,
  Platform,
  BackHandler,
  AppState,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import Auth from './src/api/Auth';
import * as Sentry from '@sentry/react-native';
import { initDatabase } from './src/database/schema';
import syncService from './src/services/syncService';
import NetInfo from '@react-native-community/netinfo';
import store from './src/store/store';
import { initializeAppConfig, syncAllConfigs } from './src/store/configSlice';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { applyDeletionSync } from './src/database/authDbHelper';
import { runCommunityMigrationIfNeeded } from './src/database/tripDbHelper';

Sentry.init({
  dsn: 'https://e5759e679cab08e963abd2b9b3b055e9@o4508080856891392.ingest.de.sentry.io/4508081636180048',
});

const AppInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [initProgress, setInitProgress] = useState('Starting...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setInitProgress('Setting up local database...');
      await initDatabase();
      setInitProgress('Checking network connection...');
      const netInfo = await NetInfo.fetch();
      setInitProgress('Starting sync service...');
      syncService.init();
      if (netInfo.isConnected) {
        try {
          const deletionList = await Auth.getBootstrapDeletion();
          if (deletionList) {
            await applyDeletionSync(deletionList);
          }
        } catch (e) {
        }
        setInitProgress('Syncing data...');
        syncService.startSync().catch(err => {});
      } else {
      }
      setInitProgress('Ready!');
      setTimeout(() => {
        setIsInitialized(true);
      }, 500);
    } catch (err) {
      setInitError(err?.message || 'Failed to initialize app');
    }
  };

  if (initError) {
    return (
      <View style={styles.initContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{initError}</Text>
        <Text
          style={styles.retryButton}
          onPress={() => {
            setInitError(null);
            setIsInitialized(false);
            initializeApp();
          }}
        >
          Retry
        </Text>
      </View>
    );
  }

  return children;
};

const App = () => {
  LogBox.ignoreLogs(['EventEmitter.removeListener']);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState == 'active') {
        checkAppVersion();
      }
    });
    if (Platform.OS == 'ios') {
      checkAppVersion();
    }
  }, []);

  const checkAppVersion = async () => {
    try {
      let latestVersion = await Auth.VersionCheckAPi(
        Platform.OS === 'ios' ? 'iosversion' : 'androidversion',
      );
      if (typeof latestVersion === 'string') {
        try {
          const parsed = JSON.parse(latestVersion);
          latestVersion = parsed.version ?? parsed;
        } catch (e) {}
      }
      const currentVersion = VersionCheck.getCurrentVersion();
      if (latestVersion) {
        const latest = Number(latestVersion);
        const current = Number(currentVersion);

        if (!isNaN(latest) && !isNaN(current) && latest > current) {
         await runCommunityMigrationIfNeeded()
          Alert.alert(
            'Update Required',
            'A new version of the app is available. Please update to continue using the app.',
            [
              {
                text: 'Cancel',
                onPress: () => BackHandler.exitApp(),
                style: 'cancel',
              },
              {
                text: 'Update Now',
                onPress: () =>
                  Linking.openURL(
                    Platform.OS === 'ios'
                      ? 'https://apps.apple.com/dk/app/global-surf-club/id1639536474'
                      : 'https://play.google.com/store/apps/details?id=com.gsc.global.surf.club',
                  ),
              },
            ],
            { cancelable: false },
          );
        }
      }
    } catch (error) {}
  };

  const requestNotificationPermission = async () => {
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } catch (err) {
      if (__DEV__) {
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestNotificationPermission();
    }
    return () => {
      syncService.stop();
    };
  }, []);

  return (
    <Provider store={store}>
      <KeyboardProvider>
        <AppInitializer>
          <Navigation />
        </AppInitializer>
      </KeyboardProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  initContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  initText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  initSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#0066cc',
    borderRadius: 8,
  },
});

export default Sentry.wrap(App);

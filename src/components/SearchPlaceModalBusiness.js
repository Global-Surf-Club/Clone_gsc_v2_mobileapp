import React, { useState, useEffect } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  View,
  Pressable,
  Text,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getPlaceDetail } from '../api/GoogleApi';
import { Color, fontFamily } from '../constants/Constants';
import {
  CURRENT_WIDTH,
  dynamicSize,
  getFontSize,
} from '../constants/Responsive';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import ConnectionBanner from './ConnectionBanner';
import StatusMessage from './StatusMessage';

const SearchPlaceModalBusiness = ({ visible, onClose, onSubmit }) => {
  const GoogleApiKey = useSelector(state => state.auth.GoogleApiKey);
  const [TypedText, setTypedText] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (visible) {
      checkNetworkStatus();
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected);
      });

      return () => unsubscribe();
    }
  }, [visible]);

  const checkNetworkStatus = async () => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      setIsOnline(state.isConnected);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setTypedText('');
    onClose(TypedText);
  };

  return (
    <Modal
      presentationStyle="pageSheet"
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.topSpacing} />

        {/* Header with Close Button */}
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <MaterialCommunityIcons
            name={'chevron-left-circle'}
            size={dynamicSize(22)}
            color={Color.black}
          />
        </Pressable>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <View style={{ marginBottom: -15, marginTop: 0 }}>
            <ConnectionBanner isOnline={isOnline} />
          </View>
        )}

        {/* Main Content */}
        {isOnline ? (
          <GooglePlacesAutocomplete
            {...('defaultProps' in GooglePlacesAutocomplete &&
              typeof GooglePlacesAutocomplete.defaultProps === 'object' &&
              GooglePlacesAutocomplete.defaultProps)}
            placeholder="Search for business"
            textInputProps={{
              autoFocus: true,
              placeholderTextColor: Color.gray,
              onChangeText: text => {
                setTypedText(text);
              },
            }}
            onFail={data => {
            }}
            onPress={async (data, details = null) => {
              try {
                const place = await getPlaceDetail(
                  data?.place_id,
                  GoogleApiKey,
                );
                if (place.data.status == 'OK') {
                  const placeData = {
                    placeId: data?.place_id,
                    address1: data?.description,
                    address2: null,
                    city: null,
                    state: null,
                    country: null,
                    zipCode: null,
                    locationLat: place.data?.result?.geometry?.location?.lat,
                    locationLng: place.data?.result?.geometry?.location?.lng,
                    destinationLocationLat:
                      place.data?.result?.geometry?.location?.lat,
                    destinationLocationLng:
                      place.data?.result?.geometry?.location?.lng,
                  };
                  onSubmit(placeData, place.data?.result?.name);
                }
              } catch (error) {
 
                handleClose();
              }
            }}
            styles={{
              textInput: {
                fontFamily: fontFamily.ProximaR,
                fontSize: getFontSize(16),
                lineHeight: getFontSize(25),
                color: 'black',
                marginTop: 5,
                backgroundColor: '#f0f0f0',
              },
              textInputContainer: {
                width: CURRENT_WIDTH - 60,
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                paddingHorizontal: 10,
                borderRadius: 10,
                marginHorizontal: 10,
              },
              description: {
                fontFamily: fontFamily.ProximaR,
                fontSize: getFontSize(16),
                color: 'black',
                paddingVertical: 0,
              },
            }}
            renderLeftButton={() => (
              <FontAwesome name="search" size={16} color={'grey'} />
            )}
            query={{
              key: GoogleApiKey,
              language: 'en',
            }}
          />
        ) : (
          <View style={styles.offlineContainer}>
            <StatusMessage
              isOnline={isOnline}
              hasData={false}
            />
          </View>
        )}
      </View>
    </Modal>
  );
};

export default SearchPlaceModalBusiness;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  topSpacing: {
    paddingTop: Platform.OS == 'ios' ? 15 : 20,
  },
  closeButton: {
    position: 'absolute',
    left: 10,
    top: 20,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Offline Banner
  offlineBanner: {
    backgroundColor: Color.lightblue,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderRadius: 8,
  },
  offlineText: {
    color: 'white',
    fontSize: getFontSize(13),
    marginLeft: 10,
    fontFamily: fontFamily.ProximaAB,
    textAlign: 'center',
    flex: 1,
  },

  // Offline Container
  offlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  offlineTitle: {
    fontSize: getFontSize(20),
    fontFamily: fontFamily.ProximaBold,
    color: Color.black,
    marginTop: 20,
    textAlign: 'center',
  },
  offlineDescription: {
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaR,
    color: Color.black,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: getFontSize(22),
  },
  offlineInstruction: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    color: Color.gray,
    marginTop: 8,
    textAlign: 'center',
  },

  // Retry Button
  retryButton: {
    backgroundColor: Color.lightblue,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: Color.white,
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaBold,
    marginLeft: 8,
  },

  // Cancel Button
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  cancelButtonText: {
    color: Color.gray,
    fontSize: getFontSize(15),
    fontFamily: fontFamily.ProximaAB,
  },
});

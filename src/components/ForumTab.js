//import liraries
import { useNavigation } from '@react-navigation/native';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';

import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useDispatch, useSelector } from 'react-redux';
import { RoundButton } from '../components/Buttons';
import PostCard from '../components/PostCardItem';
import { Color, fontFamily, userSkillLevel } from '../constants/Constants';
import Loader from '../constants/Loader';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomFlatList from './CustomFlatList';
import PreviewModal from './PreviewModal';
import ClubApi from '../api/ClubApi';
import SuccessModal from '../components/SuccessModal';
import { getForums } from '../store/forumSlice';
import NetInfo from '@react-native-community/netinfo';
import syncService from '../services/syncService';
import ConnectionBanner from './ConnectionBanner';
import StatusMessage from './StatusMessage';
import SyncInfo from './SyncStatus';
import { FlashList } from '@shopify/flash-list';

let pageNo = 1;
let pageNoTop = 1;
let pageNoBottom = 1;
let isFetching = false;
let isDataLoaded = false;
let isTopLoaded = false;

const ForumTab = props => {
  const dispatch = useDispatch();
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const [rifreshLoading, setRifreshLoading] = useState(false);
  const forumList = useSelector(state => state.community.data);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [createbyID, setcreatebyID] = useState('');
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const user = useSelector(state => state.auth.user);
  const [isTopLoading, SetisTopLoading] = useState(false);
  const previousState = useRef(false);
  const [ScrollIndex, setScrollIndex] = useState(0);
  const lastSync = useSelector(state => state.community.lastSync);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);

  useEffect(() => {
    if (props?.state) {
      if (!previousState.current) {
        if (props?.ListIndex == 'ForHome') {
          getForum(true);
        } else if (props?.ListIndex == 'NoIndex') {
        } else if (
          props?.ListIndex !== -1 &&
          props?.ListIndex !== 'NoIndex' &&
          props?.ListIndex !== 'ForHome'
        ) {
          if (parseInt(props?.ListIndex) > 10) {
            let modules = parseInt(props?.ListIndex) % 10;

            if (modules == 0) {
              pageNoTop = parseInt(parseInt(props?.ListIndex) / 10);
              pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10);
              pageNo = parseInt(parseInt(props?.ListIndex) / 10);
              setScrollIndex(9);
              getForum(false, false, false, true);
            } else {
              pageNoTop = parseInt(parseInt(props?.ListIndex) / 10) + 1;
              pageNoBottom = parseInt(parseInt(props?.ListIndex) / 10) + 1;
              pageNo = parseInt(parseInt(props?.ListIndex) / 10) + 1;
              setScrollIndex(modules > 0 ? modules - 1 : 0);
              getForum(false, false, false, true);
            }
          } else {
            setScrollIndex(
              parseInt(props?.ListIndex) > 0
                ? parseInt(props?.ListIndex) - 1
                : 0,
            );
            pageNoTop = 1;
            pageNoBottom = 1;
            pageNo = 1;
            getForum(false, false, false, true);
          }
        } else {
          getForum();
        }
      }
    }
    previousState.current = props?.state;
  }, [props]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
      if (state.isConnected && !currentNetworkStatus) {
        // syncService.syncForumActions();
        getForum(true);
      }
    });
    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const getForum = (isRefresh, isBottom, isTop, First) => {
    if (isBottom) {
      setBottomLodaer(true);
    } else if (isRefresh) {
      isDataLoaded = false;
      pageNo = 1;
      pageNoBottom = 1;
      pageNoTop = 1;
      setRifreshLoading(true);
    } else if (First) {
      isDataLoaded = false;
      isTopLoaded = false;
      SetshowLoading(true);
    } else if (isTop) {
      SetisTopLoading(true);
    } else {
      isDataLoaded = false;
      SetshowLoading(true);
    }
    isFetching = true;

    dispatch(
      getForums(
        isBottom ? pageNoBottom : isTop ? pageNoTop : pageNo,
        isTop,
        First,
        isBottom,
        (status, isEnded, isOfflineMode) => {
          SetshowLoading(false);
          setBottomLodaer(false);
          SetisTopLoading(false);
          isFetching = false;

          if (isEnded && status) {
            isDataLoaded = true;
          }
          if (pageNo == 1 || pageNoTop == 1) {
            isTopLoaded = true;
          }
          if (isTop) {
            setScrollIndex(9);
          }
        },
      ),
    );
  };

  const Gotocreatepost = () => {
    navigation.navigate('CreatePost', { ForumDetails: '' });
  };

  const gotocomment = (id, postComments, ForumName) => {
    navigation.navigate('Postcomment', { id, data: postComments, ForumName });
  };

  const DeleteFourm = async forumId => {
    if (
      forumId !== null &&
      forumId !== undefined &&
      forumId !== '' &&
      forumId !== 0
    ) {
      SetshowLoading(true);
      try {
        const response = await ClubApi.fourmDelete(forumId);
        SetshowLoading(false);
        if (response) {
          setTimeout(
            () => {
              setSuccess(true);
              setSuccessDescription('deleted successfully');
            },
            Platform.OS === 'ios' ? 300 : 0,
          );
        }
      } catch (error) {
        SetshowLoading(false);
      }
    }
  };

  const onScroll = ({ nativeEvent }) => {
    if (
      nativeEvent.contentOffset.y <= 0 &&
      !isFetching &&
      !isTopLoaded &&
      pageNoTop > 1
    ) {
      pageNoTop -= 1;
      getForum(false, false, true);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader visible={showLoading && forumList?.length == 0} removeModal />

      {!currentNetworkStatus && (
        <View>
          <ConnectionBanner isOnline={currentNetworkStatus} />
        </View>
      )}

      {lastSync && !showLoading && currentNetworkStatus && (
        <View>
          <SyncInfo
            lastSyncTime={lastSync}
            showLoading={showLoading}
            currentNetworkStatus={currentNetworkStatus}
          />
        </View>
      )}

      {forumList?.length > 0 ? (
        <FlashList
          estimatedItemSize={430}
          removeClippedSubviews={Platform.OS === 'android'}
          horizontal={false}
          data={forumList}
          onRefresh={() => {
            getForum(true);
          }}
          refreshing={forumList?.length == 0 && rifreshLoading}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop:
              lastSync || !currentNetworkStatus
                ? Platform.OS === 'ios'
                  ? 5
                  : 0
                : 10,
            paddingBottom: 20 + getBottomSpace(),
          }}
          initialScrollIndex={ScrollIndex > 0 ? ScrollIndex : undefined}
          onEndReached={() => {
            if (!isFetching && !isDataLoaded) {
              pageNoBottom += 1;
              getForum(false, true);
            }
          }}
          onEndReachedThreshold={0.2}
          onScroll={onScroll}
          ListFooterComponent={() => {
            if (bottomLodaer) {
              return (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Color.black0} />
                </View>
              );
            }
            return null;
          }}
          ListHeaderComponent={() => {
            if (isTopLoading) {
              return (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color={Color.black0} />
                </View>
              );
            }
            return null;
          }}
          overrideItemLayout={(layout, item) => {
            if (item.images?.length > 0) {
              layout.size = 460;
            } else {
              layout.size = 300;
            }
          }}
          renderItem={({ item, index }) => (
            <PostCard
              item={item}
              ForumID={props?.ForumID}
              onPressImage={(image, id, Id) => {
                setImagePreviewModal(true);
                setImageUrl(image);
                setselectusersID(id);
                setcreatebyID(Id);
              }}
              onclickcomment={() => {
                gotocomment(item?.id, item?.postComments, item?.title);
              }}
              onPressUpdateForm={ForumDetails => {
                navigation.navigate('CreatePost', { ForumDetails });
              }}
              onPreaaDeleteFourm={fourmId => {
                Alert.alert(
                  'Alert',
                  'Are you sure you want to remove this forum?',
                  [
                    {
                      text: 'No',
                    },
                    {
                      text: 'Yes',
                      style: 'destructive',
                      onPress: async () => {
                        DeleteFourm(fourmId);
                      },
                    },
                  ],
                );
              }}
              onCardClick={post => {
                navigation.navigate('PostDetailScreen', { postId: post?.id ,clubId: '-999' });
              }}
            />
          )}
          keyExtractor={item => item.id.toString()}
        />
      ) : (
        !showLoading && (
          <View style={styles.emptyContainer}>
            <StatusMessage
              isOnline={currentNetworkStatus}
              hasData={forumList?.length > 0}
              title={'No Forum Available'}
            />
          </View>
        )
      )}

      <RoundButton title={'Create Post'} onPress={Gotocreatepost} />
      <PreviewModal
        visible={imagePreviewModal}
        onClose={() => {
          setImagePreviewModal(false);
        }}
        onOpen={() => {
          setImagePreviewModal(true);
        }}
        selectimageID={selectusersID}
        reportbutton={createbyID === user.id ? false : true}
        photoUrl={imageUrl}
        pageName={'forumimage'}
      />
      <SuccessModal
        visible={success}
        onClose={() => {
          setSuccess(false);
          setIserror(false);
          getForum(true);
        }}
        description={successdescription}
        iserror={iserror}
      />
    </View>
  );
};

export default memo(ForumTab);

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Color.lightblue,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 1000,
    elevation: 5,
  },
  offlineText: {
    color: Color.white,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaBold,
    textAlign: 'center',
  },
  offlineMessage: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    zIndex: 2000,
    elevation: 10,
  },
  offlineMessageText: {
    color: Color.white,
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    textAlign: 'center',
  },
  loaderContainer: {
    height: dynamicSize(50),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endMessageContainer: {
    height: dynamicSize(60),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  endMessageText: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    textAlign: 'center',
  },
  content: {
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 150,
  },
  backarrow: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginLeft: 10,
    borderRadius: 8,
    marginRight: 5,
    height: 38,
    width: 38,
  },
  popupitemtext: {
    fontSize: getFontSize(16),
    fontFamily: fontFamily.ProximaR,
    color: Color.cardgray,
    lineHeight: getFontSize(16),
    color: Color.black0,
    textAlign: 'center',
  },
  popupitem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Color.cardbg,
  },
  offlineIndicator: {
    backgroundColor: Color.lightblue,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 6,
    fontFamily: fontFamily.ProximaAB,
  },

  // Sync Info
  syncInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
  },
  syncInfoText: {
    fontSize: 11,
    color: Color.gray,
    marginLeft: 4,
    fontFamily: fontFamily.ProximaR,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Pressable,
  Keyboard,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import DetailPostCard from '../components/DetailPostCardItem';
import PostCommentItem from '../components/PostCommentItem';
import { Header } from '../components/Header';
import Forum from '../api/Forum';
import Entypo from 'react-native-vector-icons/Entypo';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import { fontFamily, Color } from '../constants/Constants';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ForumDB from '../database/forumDbHelper';
import { useDispatch, useSelector } from 'react-redux';
import { updateForumPost } from '../store/forumSlice';
import ClubApi from '../api/ClubApi';
import PreviewModal from '../components/PreviewModal';
import SuccessModal from '../components/SuccessModal';
import Loader from '../constants/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePreviewModal from '../components/ImagePreviewWithTag';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import NetInfo from '@react-native-community/netinfo';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const PostDetailScreen = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { postId, clubId, ListIndex, CommentID } = route.params;
  const user = useSelector(state => state.auth.user);
  const [postData, setPostData] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [replyId, setReplyId] = useState(null);
  const [replyData, setReplyData] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [headerHeight, setHeaderHeight] = useState(0);
  const [success, setSuccess] = useState(false);
  const [iserror, setIserror] = useState(false);
  const [successdescription, setSuccessDescription] = useState('');
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectusersID, setselectusersID] = useState('');
  const [createbyID, setcreatebyID] = useState('');
  const inputRef = useRef(null);
  const messageRef = useRef('');
  const isSendInProgressRef = useRef(false);
  const scrollToTopRef = useRef(false);
  const listRef = useRef(null);
  const [page, setPage] = useState(1);
  const isFetchingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemHeightsRef = useRef({});
  const [isReadyToScroll, setIsReadyToScroll] = useState(false);
  const hasScrolledRef = useRef(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState(CommentID);
  const [hasMoreNext, setHasMoreNext] = useState(true);
  const [hasMorePrev, setHasMorePrev] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentNetworkStatus, setCurrentNetworkStatus] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isAutoScrollingRef = useRef(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setCurrentNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [currentNetworkStatus]);

  const getPageFromIndex = index => {
    if (index === undefined || index === null || index < 0) return null;
    return Math.floor(index / PAGE_SIZE) + 1;
  };

  const menuButtonClick = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (CommentID) {
      setHighlightedCommentId(CommentID);

      const timer = setTimeout(() => {
        setHighlightedCommentId(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const toggleReplies = (id, level = 0) => {
    setExpandedComments(prev => {
      const defaultExpanded = level < 3;
      const current = prev[id] ?? defaultExpanded;
      return {
        ...prev,
        [id]: !current,
      };
    });
  };

  const getPostDetail = async () => {
    try {
      setLoading(true);

      const response = await Forum.postDetail(postId);
      const data =
        typeof response === 'string' ? JSON.parse(response) : response;

      if (data) {
        await ForumDB.upsertForumPostDetail(postId, data);
        setPostData(data);
      }
    } catch (error) {
      console.log('error====>', error);
      const response = await ForumDB.getForumPostDetail(postId);
      const data =
        typeof response === 'string' ? JSON.parse(response) : response;

      if (data) {
        setPostData(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const getComments = async (page = 1, isRefresh = false) => {
    if (isFetchingRef.current) return;

    if (!hasMoreNext && !isRefresh && page !== 1) return;

    isFetchingRef.current = true;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      if (page == 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
    }

    try {
      const response = await Forum.getCommentsReplyes(postId, page, PAGE_SIZE);

      const data =
        typeof response === 'string' ? JSON.parse(response) : response;
      if (data && Array.isArray(data)) {
        if (data.length < PAGE_SIZE) {
          setHasMoreNext(false);
        } else {
          setHasMoreNext(true);
        }

        if (page === 1) {
          setComments(data);
        } else {
          setComments(prev => {
            const existingIds = new Set(prev.map(x => x.id));
            const filtered = data.filter(x => !existingIds.has(x.id));
            return [...prev, ...filtered];
          });
        }

        if (page === 1) {
          for (const item of data) {
            await ForumDB.insertForumComment(item, {
              skipPostCount: true,
            });
          }
        }
      }
    } catch (error) {
      const localComments = await ForumDB.getForumComments(postId, 1, 10);
      const data =
        typeof localComments === 'string'
          ? JSON.parse(localComments)
          : localComments;
      setHasMoreNext(false);
      setComments(data);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadInitialComments = async () => {
    let targetPage = getPageFromIndex(ListIndex);
    if (!targetPage) {
      getComments(1);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      let data = await Forum.getCommentsReplyes(postId, targetPage, PAGE_SIZE);
      data = typeof data === 'string' ? JSON.parse(data) : data;
      let finalData = data;
      let startPage = targetPage;
      setHasMoreNext(data.length === PAGE_SIZE);
      if (data.length < PAGE_SIZE && targetPage > 1) {
        const prevData = await Forum.getCommentsReplyes(
          postId,
          targetPage - 1,
          PAGE_SIZE,
        );
        const parsedPrev =
          typeof prevData === 'string' ? JSON.parse(prevData) : prevData;

        finalData = [...parsedPrev, ...data];
        startPage = targetPage - 1;
      }
      setHasMorePrev(startPage > 1);
      setComments(finalData);
      expandAllParents(CommentID, finalData);
      setPage(startPage);
    } catch (e) {
      getComments(1);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  const loadPreviousPage = async () => {
    if (isFetchingRef.current || !hasMorePrev || page <= 1) return;
    isFetchingRef.current = true;

    try {
      const prevPage = page - 1;

      const currentOffset = await listRef.current?.getScrollOffset?.();

      let data = await Forum.getCommentsReplyes(postId, prevPage, PAGE_SIZE);

      data = typeof data === 'string' ? JSON.parse(data) : data;

      if (!data || data.length === 0) {
        setHasMorePrev(false); // 🔥 STOP loop
        return;
      }

      setComments(prev => {
        const existingIds = new Set(prev.map(x => x.id));
        const filtered = data.filter(x => !existingIds.has(x.id));

        return [...filtered, ...prev];
      });

      setPage(prevPage);

      // 🔥 IMPORTANT
      if (prevPage === 1) {
        setHasMorePrev(false);
      }

      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: currentOffset + 500,
          animated: false,
        });
      });
    } catch (e) {
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    getPostDetail();
    loadInitialComments();
    const unsubscribe = navigation.addListener('focus', () => {
      getPostDetail();
    });
    return unsubscribe;
  }, []);

  const postComment = (parentId = 0) => {
    if (isSendInProgressRef.current) return;

    inputRef.current?.blur();
    Keyboard.dismiss();

    setTimeout(async () => {
      const messageText = messageRef.current.trim();
      if (!messageText) return;

      isSendInProgressRef.current = true;
      const isReply = parentId && parentId !== 0;
      try {
        const tempId = `temp_comment_${Date.now()}`;
        const createdAt = new Date().toISOString();
        const tempComment = {
          id: tempId,
          postId: postId,
          parentId: isReply ? parentId : null,
          message: messageText,
          senderUser: user,
          createdAt,
          quoteComment: null,
          isSync: false,
        };

        messageRef.current = '';
        setMessage('');
        setReplyId(null);
        setReplyData(null);
        inputRef.current?.clear();
        inputRef.current?.setNativeProps({ text: '' });

        await ForumDB.insertForumComment(
          {
            id: tempId,
            postId: postId,
            userId: user?.id,
            message: messageText,
            createdAt,
            senderUser: user,
            quoteComment: isReply ? replyData : null,
            isSync: false,
          },
          { skipPostCount: false },
        );
        if (isReply) {
          const updatedComments = comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                childComments: [...(comment.childComments || []), tempComment],
              };
            }

            const updateChildren = children =>
              children?.map(child => {
                if (child.id === parentId) {
                  return {
                    ...child,
                    childComments: [...(child.childComments || []), tempComment],
                  };
                }
                return {
                  ...child,
                  childComments: updateChildren(child.childComments),
                };
              });

            return {
              ...comment,
              childComments: updateChildren(comment.childComments),
            };
          });

          setComments(updatedComments);
          setExpandedComments(prev => ({
            ...prev,
            [parentId]: true,
          }));
        } else {
          setComments(prev => [tempComment, ...prev]);
          setExpandedComments(prev => ({
            ...prev,
            [parentId]: true,
          }));
        }
        if (!isReply) {
          setTimeout(() => {
            listRef.current?.scrollToOffset({
              offset: headerHeight,
              animated: true,
            });
          }, 100);
        }
        scrollToTopRef.current = true;
        const updatedPostLocal = await ForumDB.getForumPost(postId);
        if (updatedPostLocal) {
          dispatch(
            updateForumPost({
              id: postId,
              commentCount: Number(updatedPostLocal.commentCount || 0),
            }),
          );
        }
        try {
          const param = [
            {
              id: 0,
              postId: postId,
              parentId: isReply ? parentId : 0,
              message: messageText,
              clubId: clubId || '-999',
            },
          ];
          const response = await Forum.postComment(param);
          console.log('responsesmdkf===>', response);
          const parsed =
            typeof response === 'string' ? JSON.parse(response) : response;
          const created = Array.isArray(parsed) ? parsed[0] : parsed;
          isSendInProgressRef.current = false;

          if (!created || !created.id) {
            throw new Error('Invalid API response');
          }
          if (isReply) {
            const updateWithReal = list =>
              list.map(item => {
                if (item.id === parentId) {
                  return {
                    ...item,
                    childComments: (item.childComments || []).map(child =>
                      child.id === tempId
                        ? { ...created, quoteComment: null }
                        : child,
                    ),
                  };
                }

                return {
                  ...item,
                  childComments: updateWithReal(item.childComments || []),
                };
              });

            setComments(prev => updateWithReal(prev));
            setExpandedComments(prev => ({
              ...prev,
              [parentId]: true,
            }));
          } else {
            setComments(prev =>
              prev.map(item =>
                item.id === tempId ? { ...created, quoteComment: null } : item,
              ),
            );
            setExpandedComments(prev => ({
              ...prev,
              [parentId]: true,
            }));
          }
          scrollToTopRef.current = true;
          await ForumDB.deleteForumComment(tempId, postId);
          await ForumDB.insertForumComment(
            {
              id: created.id,
              postId: postId,
              userId: created.senderUser?.id || user?.id,
              message: created.message,
              createdAt: created.createdAt || new Date().toISOString(),
              senderUser: created.senderUser || user,
              quoteComment: null,
            },
            { skipPostCount: false },
          );

          const updatedPostAfter = await ForumDB.getForumPost(postId);
          if (updatedPostAfter) {
            dispatch(
              updateForumPost({
                id: postId,
                commentCount: Number(updatedPostAfter.commentCount || 0),
              }),
            );
          }
        } catch (apiError) {
          console.log('apiError====>', apiError);
          await ForumDB.addPendingForumAction({
            actionType: 'create_comment',
            postId: postId,
            userId: user?.id,
            commentId: tempId,
            commentText: messageText,
            parentId: isReply ? parentId : 0,
          });
          isSendInProgressRef.current = false;
        }
      } catch (err) {
        console.log('err====>', err);
        isSendInProgressRef.current = false;
      } finally {
        isSendInProgressRef.current = false;
      }
    }, 50);
  };

  const resetImageInput = () => {
    setMessage('');
    setReplyId(null);
    setReplyData(null);
    setSelectedImages([]);
    setCurrentIndex(0);
    isSendInProgressRef.current = false;
    setShowPreview(false);
  };

  // const handleSend = async (parentId = 0) => {
  //   if (isSendInProgressRef.current) return;
  //   if (selectedImages.length === 0) return;
  //   try {
  //     Keyboard.dismiss();
  //     isSendInProgressRef.current = true;
  //     if (!currentNetworkStatus) {
  //       resetImageInput();
  //       Alert.alert(
  //         'Offline',
  //         'Image messages can only be sent when you are online.',
  //       );
  //       return;
  //     }
  //     const isReply = parentId && parentId !== 0;
  //     const requestData = selectedImages.map(img => ({
  //       id: 0,
  //       postId: postId,
  //       parentId: parentId ?? 0,
  //       message: img?.tag || '',
  //       ImageFile: img?.base64,
  //       clubId: clubId || '-999',
  //     }));
  //     await Forum.postComment(requestData);
  //     setExpandedComments(prev => ({
  //       ...prev,
  //       [parentId]: true,
  //     }));
  //     isSendInProgressRef.current = false;
  //     resetImageInput();
  //     getComments(1, true);
  //     if (!isReply) {
  //       setTimeout(() => {
  //         listRef.current?.scrollToOffset({
  //           offset: headerHeight,
  //           animated: true,
  //         });
  //       }, 100);
  //     }
  //   } catch (error) {
  //     isSendInProgressRef.current = false;
  //     resetImageInput();
  //   } finally {
  //     isSendInProgressRef.current = false;
  //   }
  // };

  const handleSend = async (parentId = 0) => {
    if (isSendInProgressRef.current) return;
    if (selectedImages.length === 0) return;
    try {
      Keyboard.dismiss();
      isSendInProgressRef.current = true;
      if (!currentNetworkStatus) {
        resetImageInput();
        Alert.alert(
          'Offline',
          'Image messages can only be sent when you are online.',
        );
        return;
      }
      const isReply = parentId && parentId !== 0;
      const requestData = selectedImages.map(img => ({
        id: 0,
        postId,
        parentId: parentId ?? 0,
        message: img?.tag || '',
        ImageFile: img?.base64,
        clubId: clubId || '-999',
      }));

      const response = await Forum.postComment(requestData);
      isSendInProgressRef.current = false;
      const parsed =
        typeof response === 'string' ? JSON.parse(response) : response;
      const created = Array.isArray(parsed) ? parsed : [parsed];
      isSendInProgressRef.current = false;
      if (isReply) {
        const insertReplies = list =>
          list.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                childComments: [...(c.childComments || []), ...created],
              };
            }
            return c.childComments?.length
              ? { ...c, childComments: insertReplies(c.childComments) }
              : c;
          });
        setComments(prev => insertReplies(prev));
      } else {
        setComments(prev => [...created, ...prev]);
      }

      setExpandedComments(prev => ({ ...prev, [parentId]: true }));
      resetImageInput();

      if (!isReply) {
        setTimeout(() => {
          listRef.current?.scrollToOffset({
            offset: headerHeight,
            animated: true,
          });
        }, 100);
      }
    } catch (error) {
      resetImageInput();
      isSendInProgressRef.current = false;
    } finally {
      isSendInProgressRef.current = false;
    }
  };

  const PostCommentLike = async comment => {
    const newIsLiked = !comment?.isLike;
    const delta = newIsLiked ? 1 : -1;
    const newLikeCount = Math.max(0, (comment?.likeCount || 0) + delta);

    const updateLikeInTree = list =>
      list.map(c => {
        if (c.id === comment.id) {
          return { ...c, isLike: newIsLiked, likeCount: newLikeCount };
        }
        if (c.childComments?.length) {
          return { ...c, childComments: updateLikeInTree(c.childComments) };
        }
        return c;
      });

    setComments(prev => updateLikeInTree(prev));

    try {
      await ForumDB.updateCommentLike(comment.id, newIsLiked, delta);
      await Forum.postCommentLike(comment.id);
    } catch (error) {
      await ForumDB.addPendingForumAction({
        actionType: 'COMMENT_LIKE',
        commentId: comment.id,
      });
    }
  };

  const DeleteFourm = async forumId => {
    if (
      forumId !== null &&
      forumId !== undefined &&
      forumId !== '' &&
      forumId !== 0
    ) {
      setShowLoading(true);
      try {
        const response = await ClubApi.fourmDelete(forumId);
        setShowLoading(false);
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
        setShowLoading(false);
      }
    }
  };

  const expandAllParents = (commentId, list) => {
    const map = {};

    const findPath = (items, targetId, parents = []) => {
      for (const item of items) {
        if (item.id === targetId) {
          parents.forEach(p => (map[p] = true));
          return true;
        }

        if (item.childComments?.length) {
          if (findPath(item.childComments, targetId, [...parents, item.id])) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(list, commentId);

    setExpandedComments(prev => ({
      ...prev,
      ...map,
    }));
  };

  const handleItemLayout = (id, height) => {
    itemHeightsRef.current[id] = height;

    const measuredCount = Object.keys(itemHeightsRef.current).length;

    // 🔥 wait for enough items (not just one)
    if (measuredCount >= 5) {
      setIsReadyToScroll(true);
    }
  };

  const flattenComments = list => {
    let result = [];

    const traverse = (items, level = 0) => {
      items.forEach(item => {
        result.push(item);

        const hasChildren = item?.childComments?.length > 0;
        if (!hasChildren) return;

        const isExpanded =
          expandedComments[item.id] !== undefined
            ? expandedComments[item.id]
            : level < 3;

        if (isExpanded) {
          traverse(item.childComments, level + 1);
        }
      });
    };

    traverse(list);
    return result;
  };

  const scrollToComment = commentId => {
    if (!commentId) return;

    isAutoScrollingRef.current = true; // 🔥 START AUTO SCROLL

    const flatList = flattenComments(comments);
    const targetIdx = flatList.findIndex(c => c.id === commentId);
    if (targetIdx === -1) {
      isAutoScrollingRef.current = false;
      return;
    }

    const rootIds = new Set(comments.map(c => c.id));
    let offset = headerHeight + 10; // contentContainer paddingTop

    for (let i = 0; i < targetIdx; i++) {
      const item = flatList[i];
      const next = flatList[i + 1];
      offset += itemHeightsRef.current[item.id] || 80;
      if (next) {
        // root→root gap = 10 (renderItem wrapper marginBottom)
        // parent→nested or nested→nested = 6 (replyContainer marginTop)
        offset += rootIds.has(next.id) ? 10 : 6;
      }
    }

    listRef.current?.scrollToOffset({
      offset: Math.max(0, offset),
      animated: true,
    });

    // 🔥 auto scroll complete hone ke baad reset
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 500);
  };

  useEffect(() => {
    if (
      isReadyToScroll &&
      headerHeight > 0 &&
      comments.length > 0 &&
      CommentID &&
      !hasScrolledRef.current
    ) {
      hasScrolledRef.current = true;

      setTimeout(() => {
        // 🔥 important for iOS
        scrollToComment(CommentID);
      }, 500); // 250–400ms works best
    }
  }, [isReadyToScroll, headerHeight]);

  // const updateTag = (index, newTag) => {
  //   setSelectedImages(prev => {
  //     const updated = [...prev];
  //     if (updated[index]) {
  //       updated[index] = { ...updated[index], tag: newTag };
  //     }
  //     return updated;
  //   });
  // };
  const updateTag = (index, newTag) => {
    const updated = [...selectedImages];
    updated[index].tag = newTag;
    setSelectedImages(updated);
  };

  const openGallery = () => {
    Keyboard.dismiss();
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 10,
        includeBase64: true,
      },
      response => {
        if (response?.assets?.length > 0) {
          setSelectedImages(prev => {
            const isFirstImageAlreadyAdded = prev.length > 0;

            const imgs = response.assets.map((asset, index) => ({
              uri: asset.uri,
              base64: `data:image/jpeg;base64,${asset.base64}`,
              tag:
                !isFirstImageAlreadyAdded && index === 0
                  ? message?.trim() || ''
                  : '',
            }));

            return [...prev, ...imgs];
          });

          setShowPreview(true);
        }
      },
    );
  };

  const openCamera = () => {
    Keyboard.dismiss();
    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
      },
      response => {
        if (response?.assets?.length > 0) {
          const asset = response.assets[0];
          setSelectedImages(prev => [
            ...prev,
            {
              uri: asset.uri,
              base64: `data:image/jpeg;base64,${asset.base64}`,
              tag: message?.trim() || '',
            },
          ]);
          setShowPreview(true);
        }
      },
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 10, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={Color.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'height' : 'height'}
      >
        <Header
          backbutton={'chevron-left-circle'}
          iconRight1={require('../assets/images/icon/bell1.png')}
          iconRight2={require('../assets/images/icon/home.png')}
          onPressLeft={menuButtonClick}
          notification={'6'}
          title={'Detailed Forum Post Page'}
          textAlign={'center'}
        />

        <Loader visible={showLoading || (loading && comments?.length == 0)} />
        <View style={{ flex: 1 }}>
          <FlatList
            ref={listRef}
            data={comments}
            extraData={expandedComments}
            keyExtractor={item => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setPage(1);
                  setHasMoreNext(true);
                  setHasMorePrev(false);
                  getPostDetail();
                  getComments(1, true);
                }}
                colors={[Color.primary]}
                tintColor={Color.primary}
              />
            }
            ListHeaderComponent={
              <View
                onLayout={e => {
                  setHeaderHeight(e.nativeEvent.layout.height);
                }}
              >
                {postData && (
                  <DetailPostCard
                    item={postData}
                    onPressImage={(image, id, Id) => {
                      setImagePreviewModal(true);
                      setImageUrl(image);
                      setselectusersID(id);
                      setcreatebyID(Id);
                    }}
                    onclickcomment={() => {
                      // gotocomment(item?.id, item?.postComments, item?.title);
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
                  />
                )}
                <View
                  style={{
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontFamily: fontFamily.ProximaBold, fontSize: 18 }}
                  >
                    Comments
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 10 }}>
                <PostCommentItem
                  item={item}
                  onPressReply={item => {
                    setReplyId(item?.id);
                    setReplyData(item);
                  }}
                  onPressLike={comment => {
                    PostCommentLike(comment);
                  }}
                  user={user}
                  inputRef={inputRef}
                  expandedComments={expandedComments}
                  toggleReplies={toggleReplies}
                  highlightedCommentId={highlightedCommentId}
                  onItemLayout={handleItemLayout}
                />
              </View>
            )}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: getBottomSpace(),
            }}
            keyboardDismissMode="interactive"
            onEndReached={() => {
              if (!isFetchingRef.current && hasMoreNext) {
                const nextPage = page + 1;
                setPage(nextPage);
                getComments(nextPage);
              }
            }}
            onEndReachedThreshold={0.5}
            onScroll={event => {
              const offsetY = event.nativeEvent.contentOffset.y;
              if (
                !isAutoScrollingRef.current && // 🔥 IMPORTANT
                offsetY <= headerHeight + 20 &&
                !isFetchingRef.current &&
                page > 1 &&
                hasMorePrev
              ) {
                loadPreviousPage();
              }
            }}
            scrollEventThrottle={16}
          />
        </View>
        <View>
          {replyData && (
            <View style={styles.replyPreview}>
              <View style={{ flex: 1 }}>
                <Text style={styles.replyingText}>
                  Replying to {replyData?.senderUser?.firstName || 'User'}
                </Text>

                <Text numberOfLines={1} style={styles.replyMessage}>
                  {replyData?.message
                    ? replyData.message
                    : replyData?.imagePath
                      ? 'Image'
                      : ''}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  setReplyId(null);
                  setReplyData(null);
                }}
              >
                <AntDesign name="close" size={20} color={Color.cardgray} />
              </Pressable>
            </View>
          )}
          <View style={styles.inputContainer}>
            <Pressable
              onPress={() => {
                isSendInProgressRef.current == false && openGallery();
              }}
              style={[styles.sendbtn]}
              disabled={isSendInProgressRef.current || !currentNetworkStatus}
            >
              <Entypo name="attachment" size={18} color={Color.cardgray} />
            </Pressable>
            <View style={styles.commentInputContainer}>
              <TextInput
                ref={inputRef}
                multiline
                style={styles.coomentinput}
                onChangeText={text => {
                  setMessage(text);
                  messageRef.current = text;
                }}
                value={message}
                placeholderTextColor={Color.cardgray}
                placeholder="Add a comment...."
                scrollEnabled={true}
                textAlignVertical="top" // 🔥 important for iOS
                editable={!isSendInProgressRef.current}
              />
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {
                isSendInProgressRef.current == false && openCamera();
              }}
              disabled={isSendInProgressRef.current || !currentNetworkStatus}
            >
              <FontAwesome name="camera" size={22} color={Color.cardgray} />
            </TouchableOpacity>
            <Pressable
              disabled={isSendInProgressRef.current}
              onPress={() => {
                postComment(replyId ?? 0);
              }}
              style={[styles.sendbtn]}
            >
              {isSendInProgressRef.current ? (
                <ActivityIndicator size="small" color={Color.cardgray} />
              ) : (
                <FontAwesome name="send" size={20} color={Color.cardgray} />
              )}
            </Pressable>
          </View>
        </View>
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
            navigation.goBack();
          }}
          description={successdescription}
          iserror={iserror}
        />

        <ImagePreviewModal
          visible={showPreview}
          images={selectedImages}
          onClose={() => {
            setShowPreview(false);
            setSelectedImages([]);
            setCurrentIndex(0);
          }}
          onSend={() => {
            handleSend(replyId ?? 0);
            setSelectedImages([]);
            setCurrentIndex(0);
          }}
          updateTag={updateTag}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  inputContainer: {
    // position: 'absolute',
    // bottom: 0,
    // left: 0,
    // right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },

  iconBtn: {
    padding: 6,
  },

  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginHorizontal: 8,
    fontSize: 14,
  },
  commentInputContainer: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Color.lightGray,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 10 : 5,
    paddingBottom: Platform.OS === 'ios' ? 15 : 3,
    marginLeft: 5,
  },
  coomentinput: {
    fontSize: getFontSize(15),
    color: Color.black,
    fontFamily: fontFamily.ProximaAL,
    maxHeight: dynamicSize(300),
  },
  sendbtn: {
    alignItems: 'center',
    paddingVertical: dynamicSize(10),
    paddingHorizontal: dynamicSize(10),
  },

  replyPreview: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },

  replyingText: {
    fontSize: 12,
    color: Color.primary,
    fontWeight: '600',
  },

  replyMessage: {
    fontSize: 12,
    color: '#555',
  },
});

export default PostDetailScreen;

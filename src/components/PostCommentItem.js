import React, { useState, memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Linking,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  Color,
  fontFamily,
  fontSize,
  Shadow,
  text,
} from '../constants/Constants';
import { dynamicSize, getFontSize } from '../constants/Responsive';
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink';
import PreviewModal from './PreviewModal';
import { useNavigation } from '@react-navigation/native';

const PostCommentItem = ({
  item,
  level = 0,
  user,
  onPressReply,
  onPressLike,
  inputRef,
  openPopover,
  setselectusersID,
  expandedComments,
  toggleReplies,
  onItemLayout,
  highlightedCommentId,
}) => {
  const navigation = useNavigation();
  const hasChildren = item?.childComments?.length > 0;
  const showReplies = hasChildren
    ? expandedComments[item.id] !== undefined
      ? expandedComments[item.id]
      : level < 3
    : true;
  const [isLike, setIsLike] = useState(item?.isLike || false);
  const [likeCount, setlikecount] = useState(item?.likeCount || 0);
  const [chatImagePreview, setChatImagePreview] = useState(false);
  const [chatImageUrl, setChatImageUrl] = useState(null);
  const isHighlighted = highlightedCommentId === item?.id;
  const containerRef = useRef(null);
  const isUserDeleted =
    Array.isArray(user?.inActiveUsers) &&
    user.inActiveUsers.some(id => String(id) === String(item?.senderUser?.id));
  const firstLetter = !isUserDeleted
    ? item?.senderUser?.firstName?.charAt(0)?.toUpperCase()
    : 'D' || '';

  const MAX_REPLY_DEPTH = 3;
  useEffect(() => {
    setIsLike(item?.isLike || false);
    setlikecount(item?.likeCount || 0);
  }, [item?.isLike, item?.likeCount]);

  return (
    <>
      <View
        ref={containerRef}
        onLayout={e => {
          onItemLayout?.(item.id, e.nativeEvent.layout.height);
        }}
        // onLayout={e => {
        //   onItemLayout?.(item.id, e.nativeEvent.layout.height);
        // }}
        style={[
          styles.card,
          {
            borderColor: isHighlighted ? Color.lightblue : Color.white,
            borderWidth: 2,
            borderRadius: 10,
          },
        ]}
      >
        <View style={styles.row}>
          <Pressable
            onPress={() => {
              !isUserDeleted &&
                navigation.navigate('Profile', {
                  userId: item?.senderUser?.id,
                });
            }}
          >
            {item?.senderUser?.thumbnailProfileImage && !isUserDeleted ? (
              <FastImage
                source={{ uri: item?.senderUser?.thumbnailProfileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{firstLetter}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.info}>
            <Text style={styles.name}>
              {isUserDeleted
                ? 'Deletion Requested'
                : item?.senderUser?.firstName +
                  ' ' +
                  item?.senderUser?.lastName}
            </Text>

            <Text style={styles.time}>
              {item?.createdAt ? moment(item.createdAt).fromNow() : ''}
            </Text>
          </View>
        </View>
        {(showReplies || !hasChildren) && (
          <Hyperlink
            onPress={url => Linking.openURL(url)}
            linkStyle={{ color: '#007bff' }}
          >
            {item?.message ? (
              <Text style={styles.commentText}>
                {isUserDeleted ? 'Member requested to delete' : item?.message}
              </Text>
            ) : null}
          </Hyperlink>
        )}

        {item?.imagePath && (showReplies || !hasChildren) ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setChatImageUrl(item?.imagePath);
              setChatImagePreview(true);
            }}
            style={styles.imageContainer}
          >
            <FastImage
              source={{ uri: item.thumbnailImagePath }}
              style={styles.commentImage}
              resizeMode="cover"
              onLoad={() => {
                requestAnimationFrame(() => {
                  containerRef.current?.measure((x, y, width, height) => {
                    onItemLayout?.(item.id, height);
                  });
                });
              }}
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.actionRow}>
          {item?.childComments?.length > 0 && (
            <TouchableOpacity
              style={styles.replyToggle}
              onPress={() => toggleReplies(item?.id, level)}
            >
              <Entypo
                name={showReplies ? 'chevron-down' : 'chevron-right'}
                size={20}
                color={Color.black}
              />
            </TouchableOpacity>
          )}

          {!showReplies && item?.childComments?.length > 0 && (
            <Text
              style={styles.ReplysText}
              onPress={() => toggleReplies(item?.id, level)}
            >
              {item?.childComments?.length} Replies
            </Text>
          )}

          {!isUserDeleted && showReplies && (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                onPressReply(item);
                inputRef?.current?.focus();
              }}
            >
              <Entypo name="reply" size={20} color={Color.black} />
              <Text style={styles.iconText}>Reply</Text>
            </Pressable>
          )}
          {showReplies && (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                const newIsLike = !isLike;

                // 🔥 instant UI update
                setIsLike(newIsLike);
                setlikecount(prev => prev + (newIsLike ? 1 : -1));

                // 🔥 backend + DB update
                onPressLike(item);
              }}
            >
              <FastImage
                source={
                  isLike
                    ? require('../assets/images/NewIcons/like_selected.png')
                    : require('../assets/images/NewIcons/like.png')
                }
                style={styles.iconimg}
              />
              <Text style={styles.nametext}>
                {likeCount > 0 ? likeCount : ''}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
      {showReplies &&
        item?.childComments?.map(reply => (
          <View
            style={[
              styles.replyContainer,
              {
                marginLeft: level <= 3 ? 12 : 0,
              },
            ]}
            key={String(reply.id)}
          >
            <View style={{ flex: 1 }}>
              <PostCommentItem
                item={reply}
                level={level + 1}
                user={user}
                onPressReply={onPressReply}
                onPressLike={onPressLike}
                inputRef={inputRef}
                openPopover={openPopover}
                setselectusersID={setselectusersID}
                expandedComments={expandedComments}
                toggleReplies={toggleReplies}
                onItemLayout={onItemLayout}
                highlightedCommentId={highlightedCommentId}
              />
            </View>
          </View>
        ))}

      <PreviewModal
        visible={chatImagePreview}
        onClose={() => {
          setChatImagePreview(false);
          setChatImageUrl(null);
        }}
        photoUrl={chatImageUrl}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.white,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 10,
    elevation: 1,
    marginHorizontal: 10,
    ...Shadow.boxShadow,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: dynamicSize(36),
    height: dynamicSize(36),
    borderRadius: 100,
  },

  avatarFallback: {
    width: dynamicSize(36),
    height: dynamicSize(36),
    borderRadius: 100,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: getFontSize(14),
    fontFamily: fontFamily.ProximaBold,
    color: '#555',
  },

  info: {
    marginLeft: 10,
    flex: 1,
  },

  name: {
    ...text.usernameboldtitle,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },

  time: {
    fontSize: fontSize.font12,
    color: Color.black,
    fontFamily: fontFamily.ProximaBold,
    lineHeight: fontSize.font16,
  },

  menu: {
    marginLeft: 'auto',
  },

  commentText: {
    fontSize: fontSize.font16,
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
    marginTop: dynamicSize(6),
  },

  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },

  actionBtn: {
    marginRight: 16,
  },

  actionText: {
    fontSize: getFontSize(13),
    color: Color.cardgray,
  },

  viewReplies: {
    marginTop: 8,
  },

  viewRepliesText: {
    fontSize: getFontSize(13),
    color: '#007bff',
    fontFamily: fontFamily.ProximaBold,
  },

  replyContainer: {
    flexDirection: 'row',
    // marginLeft: 20,
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  iconText: {
    marginLeft: 4,
    fontSize: getFontSize(16),
    color: Color.black,
    fontFamily: fontFamily.ProximaR,
  },

  replyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  viewRepliesText: {
    marginLeft: 4,
    fontSize: getFontSize(13),
    color: '#007bff',
    fontFamily: fontFamily.ProximaBold,
  },
  iconimg: {
    height: dynamicSize(20),
    width: dynamicSize(20),
    marginRight: 10,
    tintColor: Color.black,
  },
  nametext: {
    ...text.usernameboldtitle,
    color: Color.black,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  imageContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },

  commentImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  ReplysText: {
    color: Color.lightblue,
    fontFamily: fontFamily.ProximaR,
    fontSize: fontSize.font14,
  },
});

// export default memo(PostCommentItem);
// export default PostCommentItem;
export default memo(PostCommentItem, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.expandedComments === next.expandedComments &&
    prev.highlightedCommentId === next.highlightedCommentId
  );
});

//import liraries
import {useNavigation} from '@react-navigation/native';
import React, {memo, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';

import {getBottomSpace} from 'react-native-iphone-x-helper';
import {useDispatch, useSelector} from 'react-redux';
import {ClubPostCardItem} from '../components/ClubPostCardItem';
import {Color, fontFamily, userSkillLevel} from '../constants/Constants';
import Loader from '../constants/Loader';
import {dynamicSize, getFontSize} from '../constants/Responsive';
import PreviewModal from '../components/PreviewModal';

let pageNo = 1;
let isFetching = false;
let isDataLoaded = false;
const ClubForamtab = props => {
  const [imagePreviewModal, setImagePreviewModal] = useState(false);
  const [ClubForum, setCluForum] = useState(props.ClubForum);
  const [imageUrl, setImageUrl] = useState('');
  const navigation = useNavigation();
  const [showLoading, SetshowLoading] = useState(false);
  const forumList = useSelector(state => state.community.data);
  const [bottomLodaer, setBottomLodaer] = useState(false);
  const [selectusersID, setselectusersID] = useState('');
  const [createbyID, setcreatebyID] = useState('');
  const user = useSelector(state => state.auth.user);
  const previousState = useRef(false);

  const dispatch = useDispatch();

  const Gotocreatepost = () => {
    navigation.navigate('CreatePost');
  };
  const gotocomment = (id, postComments) => {
    //navigation.navigate('Postcomment', {id, data: postComments});
  };

  return (
    <View style={{flex: 1}}>
      <Loader visible={showLoading && ClubForum?.length == 0} removeModal />
      {ClubForum?.length > 0 && (
        <FlatList
          horizontal={false}
          data={ClubForum}
          refreshing={showLoading}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 20 + getBottomSpace(),
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => {
            if (bottomLodaer) {
              return (
                <View
                  style={{
                    height: dynamicSize(50),
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <ActivityIndicator color={Color.black0} />
                </View>
              );
            } else {
              return null;
            }
          }}
          renderItem={({item, index}) => (
            <ClubPostCardItem
              item={item}
              key={index.toString()}
              onPressImage={(image, id, Id) => {
                setImagePreviewModal(true);
                setImageUrl(image);
                setselectusersID(id);

                setcreatebyID(Id);
              }}
              onclickcomment={() => {
                gotocomment(item?.id, item?.postComments);
              }}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      )}

      {/* <RoundButton title={'Create Post'} onPress={Gotocreatepost} /> */}
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
    </View>
  );
};

export default memo(ClubForamtab);
const styles = StyleSheet.create({
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
});

import React, { memo, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';
import { Color, fontFamily } from '../constants/Constants';
import { dynamicSize, getFontSize, getLineSize } from '../constants/Responsive';
import InnerRegion from './InnerRegion';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../constants/Loader';
import { getReasonInner } from '../store/tripSlice';

const Region = ({ item, searchQuery = '', isSponsor = false }) => {
  const dispatch = useDispatch();
  const ReasonInnerData = useSelector(state => state.trip.ReasonInner);
  const [loader, setLoader] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const getReasonInnerData = id => {
    if (!ReasonInnerData[id]?.length > 0) {
      setLoader(true);
      dispatch(
        getReasonInner(id, () => {
          setLoader(false);
        }),
      );
    }
  };
  useEffect(() => {
    setExpanded(false);
  }, [item]);
  // return (
  //   <List.Accordion
  //     borderless={true}
  //     underlayColor={'transparent'}
  //     expanded={searchQuery.length > 0 ? true : undefined}
  //     theme={{ colors: { background: 'transparent', primary: Color.black } }}
  //     style={styles.accordioncontainer}
  //     right={props => <></>}
  //     onPress={() => { }}
  //     titleStyle={styles.accordiontitle}
  //     title={item.name}>
  //     <View style={styles.citycintainer}>
  //       {item?.children?.map(item1 => {
  //         return <InnerRegion item={item1} searchQuery={searchQuery} />;
  //       })}
  //     </View>
  //   </List.Accordion>
  // );
  return searchQuery.length > 0 ? (
    item?.children?.length > 0 ? (
      <List.Accordion
        borderless={true}
        underlayColor={'transparent'}
        expanded={true}
        theme={{ colors: { background: 'transparent', primary: Color.black } }}
        style={styles.accordioncontainer}
        right={props => <></>}
        onPress={() => {}}
        titleStyle={styles.accordiontitle}
        title={item.name}
      >
        <View style={styles.citycintainer}>
          {item?.children?.map(item1 => {
            return (
              <InnerRegion
                item={item1}
                searchQuery={searchQuery}
                isSponsor={isSponsor}
              />
            );
          })}
        </View>
      </List.Accordion>
    ) : (
      <List.Accordion
        borderless={true}
        underlayColor={'transparent'}
        expanded={expanded}
        theme={{ colors: { background: 'transparent', primary: Color.black } }}
        style={styles.accordioncontainer}
        right={props => <></>}
        onPress={() => {
          setExpanded(!expanded), getReasonInnerData(item?.tempMainID);
        }}
        titleStyle={styles.accordiontitle}
        title={item.name}
      >
        {loader ? (
          <View style={{ height: dynamicSize(150) }}>
            <Loader visible={loader} />
          </View>
        ) : (
          <View style={styles.citycintainer}>
            {ReasonInnerData[item?.tempMainID]?.map(item1 => {
              return <InnerRegion item={item1} searchQuery={searchQuery} />;
            })}
          </View>
        )}
      </List.Accordion>
    )
  ) : (
    <List.Accordion
      borderless={true}
      underlayColor={'transparent'}
      expanded={undefined}
      theme={{ colors: { background: 'transparent', primary: Color.black } }}
      style={styles.accordioncontainer}
      right={props => <></>}
      onPress={() => {
        getReasonInnerData(item?.id);
      }}
      titleStyle={styles.accordiontitle}
      title={item.name}
    >
      {loader ? (
        <View style={{ height: dynamicSize(150) }}>
          <Loader visible={loader} />
        </View>
      ) : (
        <View style={styles.citycintainer}>
          {ReasonInnerData[item?.id]?.map(item1 => {
            return <InnerRegion item={item1} searchQuery={searchQuery} />;
          })}
        </View>
      )}
    </List.Accordion>
  );
};

export default memo(Region);

const styles = StyleSheet.create({
  searchbar: {
    borderRadius: 10,
    height: 40,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 5,
  },
  listtextstyle: {
    fontFamily: fontFamily.ProximaR,
    fontSize: getFontSize(14),
    lineHeight: getLineSize(20),
  },
  listItemstyle: {
    marginHorizontal: 20,
    borderBottomColor: Color.lightGray,
    borderBottomWidth: 1,
    paddingVertical: dynamicSize(10),
  },
  citycintainer: {},
  accordiontitle: {
    fontFamily:
      Platform.OS == 'android' ? fontFamily.ProximaBold : fontFamily.ProximaR,
    // lineHeight:getLineSize(24),
    fontSize: getFontSize(16),
    paddingHorizontal: '3%',
  },
  subaccordiontitle: {
    fontSize: 16,
    fontFamily: fontFamily.ProximaR,
    paddingHorizontal: '2%',
    color: Color.black0,
  },
  accordioncontainer: {
    backgroundColor: Color.white,
    // borderBottomWidth: 1,
    // borderBottomColor: Color.lightGray,
    borderRadius: 100,
    paddingVertical: dynamicSize(5),
  },
  accordioncontainer2: {
    backgroundColor: Color.white,
    borderBottomWidth: 1,
    borderBottomColor: Color.lightGray,
    borderRadius: 100,
    marginHorizontal: 10,
  },
  viewContainer: {
    // paddingHorizontal: '5%',
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
});

import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import {Color, fontFamily, fontSize} from '../../constants/Constants';
import {dynamicSize, getFontSize} from '../../constants/Responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  searchbar: {
    borderRadius: 10,
    backgroundColor: Color.cardbg,
    shadowColor: Color.white,
  },
  inputStyle: {
    paddingVertical: 0,
  },
  searchcontainer: {
    paddingHorizontal: 8,
    borderBottomColor: Color.cardbg,
    paddingTop: 5,
  },

  openButtonText: {
    fontSize: 18,
    color: 'blue',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    // justifyContent:'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingTop: 50,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'black',
  },
  qrCode: {
    width: 100,
    height: 100,
    // marginBottom: 20,
  },
  promoText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  redeemText: {
    fontSize: 14,
    color: 'gray',
  },
  redeemCode: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  close: {
    position: 'absolute',
    right: 4,
    top: 4,
    height: dynamicSize(40),
    width: dynamicSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrContainer: {
    position: 'absolute',
    top: -50,
    backgroundColor: Color.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: Color.gray,
    shadowOffset: {height: 1, width: 0},
    shadowOpacity: Platform.OS === 'android' ? 1 : 0.5,
    shadowRadius: Platform.OS === 'android' ? 10 : 4,
    elevation: Platform.OS === 'android' ? 5 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  //offline new style add
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

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: getFontSize(16),
    color: Color.black,
    fontFamily: fontFamily.ProximaAB,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: getFontSize(14),
    color: Color.gray,
    fontFamily: fontFamily.ProximaR,
    marginTop: 8,
    textAlign: 'center',
  },
});

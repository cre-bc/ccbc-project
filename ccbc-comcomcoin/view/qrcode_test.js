import React, { Component } from "react";
import QRCode from "react-native-qrcode";
import { AppRegistry, StyleSheet, View, TextInput } from "react-native";
export default class QRCodeTest extends Component {
  render() {
    return (
      <View>
        <QRCode
          value="qr code test"
          size={100}
          bgColor="black"
          fgColor="white"
        />
      </View>
    );
  }
}

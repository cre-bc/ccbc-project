import React, { Component } from 'react'
import { StyleSheet, View, Image, AsyncStorage, Text } from 'react-native'
import { Header, Button, Icon, Avatar } from 'react-native-elements'
import BaseComponent from "./components/BaseComponent"

export default class Menu extends BaseComponent {
  state = {
    open: false,
    open2: false,
    anchor: 'left',
    activeStep1: {},
    activeStep2: {},
    activeStep3: {},
    activeStep4: {},
    activeStep5: {},
    completed: {},
    comment: {},
    coin: 0,
    tohyoCoin: 0,
    headList: [],
    resultList: [],
    userid: null,
    password: null,
    tShainPk: 0,
    imageFileName: null,
    shimei: null,
    kengenCd: null,
    configCoin: 0
  }
  constructor(props) {
    super(props)
    this.state = {}
  }
  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();
  }

  onPressLogoutButton = () => {
    AsyncStorage.removeItem('groupInfo')
    this.props.navigation.navigate('LoginGroup')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }
  onPressTohyoButton = () => {
    this.props.navigation.navigate('TohyoToroku')
  }
  onPressTohyoKekkaButton = () => {
    this.props.navigation.navigate('TohyoIchiran')
  }
  onPressCoinShokaiButton = () => {
    this.props.navigation.navigate('CoinShokai')
  }
  onPressCoinZoyoButton = () => {
    this.props.navigation.navigate('CoinZoyo')
  }
  onPressCommentShokaiButton = () => {
    this.props.navigation.navigate('CommentShokai')
  }
  onPressHomeButton = () => {
    this.props.navigation.navigate('Home')
  }
  render() {
    return (
      <View style={styles.container}>
        <Header
          leftComponent={
            <Icon
              name={'home'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressMenuButton}
            />
          }
          centerComponent={
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <View>
                <Image source={require('./../images/HARVEST3.png')} />
              </View>
              {/* <View>
                <Image
                  source={require('./../images/cvircy.png')}
                  style={{
                    width: 25,
                    height: 25
                  }}
                />
              </View>
              <View
                style={{
                  marginLeft: 10
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: '#fff',
                    fontWeight: 'bold',
                    minWidth: 100
                  }}
                >
                  Harvest
                </Text>
              </View> */}
            </View>
          }
          rightComponent={
            <Icon
              name={'sign-out'}
              type={'font-awesome'}
              color="#fff"
              onPress={this.onPressLogoutButton}
            />
          }
          style={styles.header}
        />
        <View style={styles.menu_item}>
          <View style={styles.menu_icon_view}>
            <Image
              source={require('./../images/senkyo.png')}
              style={styles.menu_icon}
            />
          </View>
          <View style={styles.menu_button_view}>
            <Button
              title="投票"
              style={styles.menu_button}
              onPress={this.onPressTohyoButton}
            />
          </View>
        </View>
        <View style={styles.menu_item}>
          <View style={styles.menu_icon_view}>
            <Image
              source={require('./../images/tohyo_kekka.png')}
              style={styles.menu_icon}
            />
          </View>
          <View style={styles.menu_button_view}>
            <Button
              title="投票結果"
              style={styles.menu_button}
              onPress={this.onPressTohyoKekkaButton}
            />
          </View>
        </View>
        <View style={styles.menu_item}>
          <View style={styles.menu_icon_view}>
            <Image
              source={require('./../images/coin_shokai.png')}
              style={styles.menu_icon}
            />
          </View>
          <View style={styles.menu_button_view}>
            <Button
              title="コイン照会"
              style={styles.menu_button}
              onPress={this.onPressCoinShokaiButton}
            />
          </View>
        </View>
        <View style={styles.menu_item}>
          <View style={styles.menu_icon_view}>
            <Image
              source={require('./../images/zoyo.png')}
              style={styles.menu_icon}
            />
          </View>
          <View style={styles.menu_button_view}>
            <Button
              title="コイン贈与"
              style={styles.menu_button}
              onPress={this.onPressCoinZoyoButton}
            />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF'
  },
  header: {},
  menu_item: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30
  },
  menu_icon: {
    width: 50,
    height: 50
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10
  }
})

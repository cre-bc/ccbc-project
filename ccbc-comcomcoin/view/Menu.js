import React, { Component } from 'react'
import { AsyncStorage, StyleSheet, View, Image } from 'react-native'
import { Header, Icon, Text } from 'react-native-elements'
import InAppHeader from './components/InAppHeader'

export default class MenuPh2 extends Component {
  state = {
    open: false
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  async componentWillMount() {
    let groupInfo = {
      saveFlg: "1",
      group_id: "CCCtest",
      db_name: "crecoin",
      bc_addr: "0x3250089B97CD64855F24B0ccE163dFE786d89B6d"
    }
    let loginInfo = {
      userid: "kadoya",
      password: "pass",
      tShainPk: 23,
      imageFileName: "man1.jpg",
      shimei: "札幌　太郎",
      kengenCd: "1",
      tokenId: "*****",
      bcAccount: "0xee6c10a136f71d1fec50464a12d16fd0d7921847"
    }
    try {
      // alert(JSON.stringify(loginInfo))
      await AsyncStorage.setItem('groupInfo', JSON.stringify(groupInfo))
      await AsyncStorage.setItem('loginInfo', JSON.stringify(loginInfo))
    } catch (error) {
      return
    }
  }

  onPressLogoutButton = () => {
    this.props.navigation.navigate('MenuPh2')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('MenuPh2')
  }
  onPressChatButton = () => {
    this.props.navigation.navigate('Chat')
  }
  onPressChatSelectButton = () => {
    this.props.navigation.navigate('ChatSelect')
  }
  onPressChatMsgButton = () => {
    this.props.navigation.navigate('ChatMsg')
  }
  onPressChatCoinButton = () => {
    this.props.navigation.navigate('ChatCoin')
  }
  onPressKijiButton = () => {
    this.props.navigation.navigate('ArticleSelect')
  }
  onPressShoppingButton = () => {
    this.props.navigation.navigate('Shopping')
  }
  onPressGroupButton = () => {
    this.props.navigation.navigate('LoginGroup')
  }
  onPressLoginButton = () => {
    this.props.navigation.navigate('Login')
  }
  onPressHomeButton = () => {
    this.props.navigation.navigate('Home')
  }
  onPressKokokuButton = () => {
    this.props.navigation.navigate('HomeAdvertise')
  }
  onPressOshiraseButton = () => {
    this.props.navigation.navigate('HomeInfoList')
  }
  onPressOshiraseShosaiButton = () => {
    this.props.navigation.navigate('HomeInformation')
  }
  onPressSaishinKijiButton = () => {
    this.props.navigation.navigate('HomeArticleList', { mode: "new" })
  }
  onPressNinkiKijiButton = () => {
    this.props.navigation.navigate('HomeArticleList', { mode: "popular" })
  }
  render() {
    return (
      <View style={styles.container}>
        <InAppHeader
          navigate={this.props.navigation.navigate}
        />
        <View style={{ marginTop: 20, marginLeft: 10 }}>
          <Text h4 onPress={this.onPressChatButton}>
            画面モックアップメニュー
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressChatSelectButton}>
            【チャット機能】チャット選択
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressChatMsgButton}>
            【チャット機能】チャット照会
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressChatCoinButton}>
            【チャット機能】コイン送付
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressKijiButton}>
            【記事投稿機能】記事投稿
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressShoppingButton}>
            【支払機能】支払
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressGroupButton}>
            【ログイン機能】グループ認証
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressLoginButton}>
            【ログイン機能】ログイン
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressHomeButton}>
            【ホーム機能】ホーム
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressKokokuButton}>
            【ホーム機能】広告
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressOshiraseButton}>
            【ホーム機能】お知らせ
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressOshiraseShosaiButton}>
            【ホーム機能】お知らせ詳細
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressSaishinKijiButton}>
            【ホーム機能】最新の記事
          </Text>
        </View>
        <View style={styles.font_view}>
          <Text style={styles.font} onPress={this.onPressNinkiKijiButton}>
            【ホーム機能】人気の記事
          </Text>
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
  font_view: {
    marginTop: 20,
    marginLeft: 30
  },
  font: {
    fontSize: 20
  },
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

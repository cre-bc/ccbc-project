import React, { Component } from 'react'
import {
  AsyncStorage,
  Alert,
  Platform
} from 'react-native'
import { createStackNavigator, createAppContainer } from 'react-navigation'
import * as Permissions from 'expo-permissions'
import { Notifications } from 'expo'

// テスト用メニュー画面
import MenuForm from './view/Menu'
// ログイン機能
import LoginGroupForm from './view/LoginGroup'
import LoginForm from './view/Login'
// ホーム機能
import HomeForm from './view/Home'
import HomeAdvertiseForm from './view/HomeAdvertise'
import HomeInfoListForm from './view/HomeInfoList'
import HomeInformationForm from './view/HomeInformation'
import HomeArticleListForm from './view/HomeArticleList'
// チャット機能
import ChatSelectForm from './view/chat_select'
import ChatMsgForm from './view/chat_msg'
import ChatCoinForm from './view/chat_coin'
// 記事機能
import ArticleSelectForm from './view/ArticleSelect'
import ArticleReferForm from './view/ArticleRefer'
import ArticleEntryForm from './view/ArticleEntry'
// ショッピング機能
import ShoppingForm from './view/shopping'

/******* Navigator *******/

var HomeNavigator = createStackNavigator(
  {
    Menu: { screen: MenuForm },
    LoginGroup: { screen: LoginGroupForm },
    Login: { screen: LoginForm },
    Home: { screen: HomeForm },
    HomeAdvertise: { screen: HomeAdvertiseForm },
    HomeInfoList: { screen: HomeInfoListForm },
    HomeInformation: { screen: HomeInformationForm },
    HomeArticleList: { screen: HomeArticleListForm },
    ChatSelect: { screen: ChatSelectForm },
    ChatMsg: { screen: ChatMsgForm },
    ChatCoin: { screen: ChatCoinForm },
    ArticleSelect: { screen: ArticleSelectForm },
    ArticleRefer: { screen: ArticleReferForm },
    ArticleEntry: { screen: ArticleEntryForm },
    Shopping: { screen: ShoppingForm },
  },
  {
    // initialRouteName: 'Menu',
    // initialRouteName: 'Home',
    initialRouteName: 'LoginGroup',
    defaultNavigationOptions: () => ({
      header: null
    })
  }
)

const AppContainer = createAppContainer(HomeNavigator)

/**************/

export default class App extends Component {
  state = {
    saveFlg: false,
    popup: []
  }

  async componentWillMount() {
    var groupInfo = await this.getGroupInfo()
    if (groupInfo != null) {
      this.setState({ saveFlg: groupInfo['saveFlg'] })
    }

    // Push通知のトークンを取得
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }
    if (finalStatus === 'granted') {
      let token = await Notifications.getExpoPushTokenAsync()
      await AsyncStorage.setItem('expo_push_token', token)
    }

    // Push通知のリスナー登録
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
    Notifications.getBadgeNumberAsync().then(badgeNumber => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeNumberAsync(badgeNumber - 1)
      }
    })
  }

  getGroupInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('groupInfo'))
    } catch (error) {
      return
    }
  }

  _handleNotification = (notification) => {
    // if (notification.origin === 'selected') {
    //   //バックグラウンドで通知
    // } else if (notification.origin === 'received') {
    //   //フォアグラウンドで通知
    // }

    if (notification.origin === 'received' && Platform.OS === 'ios') {
      // iOSはアプリ起動中にPushを受信した場合、表示されないため、自分で再通知する必要がある
      const local = ("local" in notification.data ? true : false)
      if (!local) {
        const localnotification = {
          title: notification.data.title,
          body: notification.data.message,
          data: { "local": "true" }
        }
        Notifications.scheduleLocalNotificationAsync(localnotification)
      }
    }
  }

  render() {
    return (
      <AppContainer
        ref={nav => {
          this.navigator = nav
        }}
      />
    )
  }
}

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
export const createRootNavigator = (load) => {
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
      initialRouteName: load,
      defaultNavigationOptions: () => ({
        header: null
      })
    }
  )
  return createAppContainer(HomeNavigator)
}

export default class App extends Component {
  constructor(props) {
    super(props)

    // // プッシュ通知をタップしてアプリを起動すると、「props.notification」に情報が入ってくる
    // if (props.notification) {
    //   Notifications.dismissNotificationAsync(props.exp.notification.notificationId)
    //   // alert(props.exp.notification.notificationId + " " + JSON.stringify(props.exp.notification))
    //   let notification = JSON.parse(props.notification)
    //   // チャット情報を保持し、スタート画面から直接チャット画面に遷移できるようにする
    //   if (!isNaN(notification.fromShainPk)) {
    //     let chatInfo = {
    //       fromShainPk: notification.fromShainPk,
    //       fromShimei: notification.fromShimei,
    //       fromImageFileNm: notification.fromImageFileNm,
    //       fromExpoPushToken: notification.fromExpoPushToken
    //     }
    //     this.setChatInfo(JSON.stringify(chatInfo))
    //     // alert(JSON.stringify(chatInfo))
    //   }
    // }
  }

  state = {
    load: "LoginGroup"
    // load: "Menu"
  }

  async componentWillMount() {
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

    // アプリの未読件数をクリア
    Notifications.getBadgeNumberAsync().then(badgeNumber => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeNumberAsync(0)
      }
    })

    // アプリがバックグラウンド→フォアグラウンドになった場合に未読件数を消すイベントを関連付け
    AppState.addEventListener("change", this.handleAppStateChange)
  }

  /** バックグラウンド→フォアグラウンドの切り替え */
  handleAppStateChange = (nextAppState) => {
    // アプリの未読件数をクリア
    Notifications.getBadgeNumberAsync().then(badgeNumber => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeNumberAsync(0)
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

  getLoginInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('loginInfo'))
    } catch (error) {
      return
    }
  }

  setChatInfo = async (chatInfo) => {
    try {
      await AsyncStorage.setItem('chatInfo', chatInfo)
    } catch (error) {
      return
    }
  }

  render() {
    const AppContainer = createRootNavigator(this.state.load)
    return (
      <AppContainer
        ref={nav => {
          this.navigator = nav
        }}
      />
    )
  }
}

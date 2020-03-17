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

    // プッシュ通知をタップしてアプリを起動すると、「props.notification」に情報が入ってくる
    if (props.notification) {
      // alert(JSON.stringify(props.notification))
      let notification = JSON.parse(props.notification)
      // チャット情報を保持し、スタート画面から直接チャット画面に遷移できるようにする
      let chatInfo = {
        fromShainPk: notification.fromShainPk,
        fromShimei: notification.fromShimei,
        fromImageFileNm: notification.fromImageFileNm,
        fromExpoPushToken: notification.fromExpoPushToken
      }
      this.setChatInfo(JSON.stringify(chatInfo))
      // alert(JSON.stringify(chatInfo))
    }
  }

  state = {
    load: "LoginGroup"
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

    // // Push通知のリスナー登録
    // this._notificationSubscription = Notifications.addListener(this.handleNotification)
    // Notifications.getBadgeNumberAsync().then(badgeNumber => {
    //   if (badgeNumber !== 0) {
    //     Notifications.setBadgeNumberAsync(badgeNumber - 1)
    //   }
    // })

    // // グループ情報、ログイン情報が
    // var groupInfo = await this.getGroupInfo()
    // var loginInfo = await this.getLoginInfo()
    // if (groupInfo != null && loginInfo != null) {
    //   this.setState({ load: "Home" })
    // }
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

  // handleNotification = async (notification) => {
  //   // if (notification.origin === 'selected') {
  //   //   //バックグラウンドで通知
  //   // } else if (notification.origin === 'received') {
  //   //   //フォアグラウンドで通知
  //   // }

  //   // if (notification.origin === 'selected') {
  //   //   // バックグラウンドでプッシュ通知をタップした時
  //   //   // const isMove = ("fromShainPk" in notification.data ? true : false)
  //   //   if (!isNaN(notification.data.fromShainPk)) {
  //   //     var loginInfo = await this.getLoginInfo()
  //   //     if (loginInfo != null) {
  //   //       // alert(JSON.stringify(notification.data))
  //   //       // ログイン済みであれば、チャット情報を保持し、スタート画面から直接チャット画面に遷移できるようにする
  //   //       let chatInfo = {
  //   //         fromShainPk: notification.data.fromShainPk,
  //   //         fromShimei: notification.data.fromShimei,
  //   //         fromImageFileNm: notification.data.fromImageFileNm,
  //   //         fromExpoPushToken: notification.data.fromExpoPushToken
  //   //       }
  //   //       this.setChatInfo(JSON.stringify(chatInfo))
  //   //     }
  //   //   }
  //   // }

  //   // if (notification.origin === 'received' && Platform.OS === 'ios') {
  //   //   // iOSはアプリ起動中にPushを受信した場合、表示されないため、自分で再通知する必要がある
  //   //   const local = ("local" in notification.data ? true : false)
  //   //   if (!local) {
  //   //     const localnotification = {
  //   //       title: notification.data.title,
  //   //       body: notification.data.message,
  //   //       data: { "local": "true" }
  //   //     }
  //   //     Notifications.scheduleLocalNotificationAsync(localnotification)
  //   //   }
  //   // }
  // }

  setChatInfo = async (chatInfo) => {
    try {
      await AsyncStorage.setItem('chatInfo', chatInfo)
    } catch (error) {
      //alert(error)
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

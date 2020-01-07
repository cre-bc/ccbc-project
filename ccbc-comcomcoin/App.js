import React, { Component } from 'react'
import { createStackNavigator, createAppContainer } from 'react-navigation'

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
    saveFlg: false
  }

  async componentWillMount() {
    var groupInfo = await this.getGroupInfo()
    if (groupInfo != null) {
      this.setState({ saveFlg: groupInfo['saveFlg'] })
    }
  }

  getGroupInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('groupInfo'))
    } catch (error) {
      return
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

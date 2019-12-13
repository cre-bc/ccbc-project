import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  AsyncStorage,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native'
import {
  Header,
  Icon,
  Avatar,
  Card,
  ListItem,
  FormInput,
  Divider
} from 'react-native-elements'
import { GiftedChat } from 'react-native-gifted-chat'

const restdomain = require('./common/constans.js').restdomain

export default class ChatMsgForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anchor: 'left',
      completed: {},
      comment: {},
      coin: 0,
      headList: [],
      resultList: [],
      userid: null,
      password: null,
      tShainPk: 0,
      imageFileName: null,
      shimei: null,
      kengenCd: null,
      configCoin: 0,
      text: '',
      fromShainPk: 0,
      chatUser: null,
      messages: [],
      message: [],
      kidokuPk: 0
    }
  }
  /** コンポーネントのマウント時処理 */
  async componentWillMount() {
    // var loginInfo = await this.getLoginInfo()
    // this.setState({ userid: loginInfo['userid'] })
    // this.setState({ password: loginInfo['password'] })
    // this.setState({ tShainPk: loginInfo['tShainPk'] })
    // this.state.tShainPk = Number(loginInfo['tShainPk'])
    // this.setState({ imageFileName: loginInfo['imageFileName'] })
    // this.setState({ shimei: loginInfo['shimei'] })
    // this.setState({ kengenCd: loginInfo['kengenCd'] })

    /** テスト用 */
    /**　＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/
    this.setState({ userid: '1001' })
    this.setState({ password: '5555' })
    this.setState({ tShainPk: 1 })
    this.state.userid = '1001'
    this.state.tShainPk = 1
    this.state.fromShainPk = 2
    this.state.shimei = 'テスト　太郎'
    // this.state.imageFileName = require('./../images/man1.jpg')
    /**　＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/

    // this.setState({ imageFileName: loginInfo['imageFileName'] })
    // this.setState({ shimei: loginInfo['shimei'] })
    // this.setState({ kengenCd: loginInfo['kengenCd'] })

    // 前画面情報取得
    // var chatSelectInfo = await this.getChatSelectInfo()
    // this.setState({ fromShainPk: chatSelectInfo['t_shain_Pk'] })

    // 初期表示情報取得
    this.setState({ chatUser: this.state.shimei })
    this.findChat()

    // this.setState({
    //   messages: [
    //     {
    //       _id: 5,
    //       text:
    //         '障害の原因調査について、助けていただきありがとうございました。',
    //       createdAt: new Date(),
    //       user: {
    //         _id: 6,
    //         name: '安倍　大翔',
    //         avatar: require('./../images/man1.jpg')
    //       }
    //     },
    //     {
    //       _id: 1,
    //       text: 'お疲れ様です。',
    //       createdAt: '2019/05/15',
    //       user: {
    //         _id: 2,
    //         name: '安倍　大翔',
    //         avatar: require('./../images/man1.jpg')
    //       }
    //     }
    //   ]
    // })
  }

  //ログイン情報取得
  getLoginInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('loginInfo'))
    } catch (error) {
      return
    }
  }

  // チャット選択情報取得（前画面からのパラメータ）
  getChatSelectInfo = async () => {
    try {
      return JSON.parse(await AsyncStorage.getItem('chatInfo'))
    } catch (error) {
      return
    }
  }

  //画面初期表示情報取得
  findChat = async () => {
    await fetch(restdomain + '/chat/find', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function(response) {
        return response.json()
      })
      .then(
        function(json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          // 検索結果の取得
          var dataList = json.data
          this.setState({ resultList: dataList })

          var chat = []
          for (var i in dataList) {
            // alert(dataList[i].t_chat_pk)
            chat.push({
              // _id: dataList[i].t_chat_pk,
              _id: dataList[i].t_chat_pk,
              text: dataList[i].comment,
              createdAt: dataList[i].post_dttm,
              user: {
                _id: dataList[i].from_shain_pk,
                name: 'あいうえお',
                avatar: this.state.imageFileName
              }
            })
          }
          this.setState({ messages: chat })
          alert(JSON.stringify(chat))
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  onPressLogoutButton = () => {
    this.props.navigation.navigate('Login')
  }
  onPressMenuButton = () => {
    this.props.navigation.navigate('Menu')
  }
  onPressLoginGroupButton = () => {
    this.props.navigation.navigate('LoginGroup')
  }
  onPressChatButton = () => {
    this.props.navigation.navigate('Chat')
  }
  onPressChatSelectButton = () => {
    this.props.navigation.navigate('ChatSelect')
  }
  onPressHomeButton = () => {
    this.props.navigation.navigate('Home')
  }

  onPressChatCoin() {
    // パラメータ設定
    let chatCoinInfo = {
      t_shain_Pk: this.state.fromShainPk,
      shimei: this.state.chatUser,
      image_file_nm: this.state.imageFileName
    }
    this.setChatCoinInfo(JSON.stringify(chatCoinInfo))
    // 画面遷移
    this.props.navigation.navigate('ChatCoin')
  }
  setChatCoinInfo = async chatCoinInfo => {
    try {
      await AsyncStorage.removeItem('chatCoinInfo')
      await AsyncStorage.setItem('chatCoinInfo', chatCoinInfo)
    } catch (error) {
      alert(error)
      return
    }
  }

  reply() {
    return {
      _id: 1,
      text:
        '【300コインを送付しました】\n障害の原因調査について、わかりやすく教えていただき、ありがとうございました。大変勉強になりました!',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: '安倍　大翔',
        // avatar: require('./../images/man1.jpg')
      }
    }
  }

  // onSend = async (messages = []) => {
  //   this.state.message = messages[0].text
  //   await fetch(restdomain + '/chat_msg/create', {
  //     method: 'POST',
  //     mode: 'cors',
  //     body: JSON.stringify(this.state),
  //     headers: new Headers({ 'Content-type': 'application/json' })
  //   })
  //     .then(
  //       function(response) {
  //         return response.json()
  //       }.bind(this)
  //     )
  //     .then(
  //       function(json) {
  //         if (json.status) {
  //           this.setState(previousState => ({
  //             messages: GiftedChat.append(
  //               GiftedChat.append(previousState.messages, messages)
  //             )
  //           }))
  //         }
  //       }.bind(this)
  //     )
  //     .catch(error => console.error(error))

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }))

    // this.setState(previousState => ({
    //   messages: GiftedChat.append(
    //     GiftedChat.append(previousState.messages, messages),
    //     this.reply()
    //   )
    // }))
  }

  render() {
    const { name, email } = this.state
    const footerStyle = {
      ...StyleSheet.flatten(styles.footerOverlay),
      width: this.state.footerWidth
    }
    return (
      <View style={styles.container}>
        <Header
          leftComponent={
            <Icon
              name={'chevron-left'}
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
                <Text
                  style={{
                    fontSize: 24,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {this.state.chatUser}
                </Text>
              </View>
            </View>
          }
          rightComponent={
            <TouchableHighlight onPress={() => this.onPressChatCoin()}>
              <Image
                source={require('./../images/coin_icon.png')}
                style={styles.menu_icon}
              />
            </TouchableHighlight>
          }
          backgroundColor="#ff5622"
        />
        <GiftedChat
          dateFormat={'YYYY/MM/DD'}
          timeFormat={'H:mm'}
          messages={this.state.messages} //stateで管理しているメッセージ
          onSend={messages => this.onSend(messages)} //送信ボタン押した時の動作
          user={{
            _id: 1
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 25,
    height: 25
  },
  menu_button: {},
  menu_icon_view: {},
  menu_button_view: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10
  }
})

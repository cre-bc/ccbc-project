import React, { Component } from 'react'
import { StyleSheet, View, Image, Text, TouchableHighlight } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import io from 'socket.io-client'
import BaseComponent from './components/BaseComponent'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain
const restdomain_ws = require('./common/constans.js').restdomain_ws
const socket = io(restdomain_ws, { secure: true, transports: ['websocket'] })
// const socket = io(restdomain)

export default class ChatMsgForm extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      comment: {},
      resultList: [],
      userid: null,
      password: null,
      loginShainPk: 0,
      imageFileName: null,
      shimei: null,
      kengenCd: null,
      text: '',
      fromShainPk: 0,
      chatUser: null,
      messages: [],
      message: []
    }
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.props.navigation.addListener('willFocus', () => this.onWillFocus())

    // チャットメッセージの受信（websocket）
    socket.on('comcomcoin_chat', function (message) {
      this.getChatMessage(message)
    }.bind(this))
  }

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

    // チャットルーム（自分の社員PK）に接続
    socket.emit('join', this.state.loginShainPk)

    /** テスト用 */
    /**　＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/
    // this.setState({ userid: '1001' })
    // this.setState({ password: '5555' })
    // this.setState({ loginShainPk: 1 })
    // this.state.userid = '1001'
    // this.state.loginShainPk = 2
    /**　＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝*/

    // 前画面情報取得
    // チャット相手
    this.state.fromShainPk = this.props.navigation.getParam('fromShainPk')
    // チャット相手氏名
    this.state.shimei = this.props.navigation.getParam('shimei')
    // チャット相手イメージファイル
    this.state.imageFileName = this.props.navigation.getParam('image_file_nm')

    // 初期表示情報取得
    this.setState({ chatUser: this.state.shimei })

    this.findChat()
  }

  //画面初期表示情報取得
  findChat = async () => {
    await fetch(restdomain + '/chat_msg/find', {
      method: 'POST',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(function (response) {
        return response.json()
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === 'undefined') {
            return
          }
          // 検索結果の取得
          var dataList = json.data
          this.setState({ resultList: dataList })

          var chat = []
          var chatNo = 0
          for (var i in dataList) {
            // 恐らくuser._idの値の大きい方がチャット画面の左側に表示されるため、
            // 自分（ログインユーザー）は[1]固定、チャット相手は[2]固定とする
            if (dataList[i].from_shain_pk == this.state.loginShainPk) {
              chatNo = 1
            } else {
              chatNo = 2
            }
            // 取得結果をチャットにセット
            chat.push({
              _id: dataList[i].t_chat_pk,
              text: dataList[i].comment,
              createdAt: dataList[i].post_dttm,
              user: {
                _id: chatNo,
                name: this.state.shimei,
                avatar: restdomain + `/uploads/${this.state.imageFileName}`
              }
            })
          }
          this.setState({ messages: chat })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** コイン送付ボタン押下 */
  onPressChatCoin() {
    // 画面遷移（コイン送付画面）
    this.props.navigation.navigate('ChatCoin', {
      fromShainPk: this.state.fromShainPk,
      shimei: this.state.chatUser,
      image_file_nm: this.state.imageFileName
    })
  }

  /** 送信ボタン押下 */
  onSend = async (messages = []) => {
    this.state.message = messages[0].text
    await fetch(restdomain + '/chat_msg/create', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(
        function (response) {
          return response.json()
        }.bind(this)
      )
      .then(
        function (json) {
          if (json.status) {
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, messages)
            }))
            // チャットメッセージの送信
            const message = {
              room_id: this.state.fromShainPk,
              _id: messages[0]._id,
              text: this.state.message,
              createdAt: new Date()
            }
            socket.emit('comcomcoin_chat', JSON.stringify(message))
          }
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** チャットメッセージ受信時の処理 */
  getChatMessage = async (message) => {
    var chat = JSON.parse(message)
    var user = {
      _id: 2,
      name: this.state.shimei,
      avatar: restdomain + `/uploads/${this.state.imageFileName}`
    }
    chat.user = user

    var messages = [chat]
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }))
  }

  render() {
    return (
      <View style={styles.container}>
        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />
        {/* -- 画面タイトル -- */}
        <View style={[styles.screenTitleView, { flexDirection: 'row' }]}>
          {/* 空項目 */}
          <View style={{ flex: 1, alignItems: 'flex-start' }} />
          {/* チャット相手 */}
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.screenTitleText}>{this.state.chatUser}</Text>
          </View>
          {/* コイン贈与アイコン */}
          <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
            <TouchableHighlight onPress={() => this.onPressChatCoin()}>
              <Image
                source={require('./../images/coin_icon.png')}
                style={styles.menu_icon}
              />
            </TouchableHighlight>
          </View>
        </View>
        {/* チャット内容 */}
        <GiftedChat
          dateFormat={'YYYY/MM/DD'}
          timeFormat={'HH:MM'}
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
  menu_icon: {
    width: 25,
    height: 25
  },
  screenTitleView: {
    alignItems: 'center',
    backgroundColor: '#ff5622'
  },
  screenTitleText: {
    fontSize: 18,
    color: 'white',
    padding: 10
  }
})
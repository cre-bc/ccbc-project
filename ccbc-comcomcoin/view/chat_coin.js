import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableHighlight
} from 'react-native'
import { Avatar, Card } from 'react-native-elements'
import RNPickerSelect from 'react-native-picker-select'
import BaseComponent from './components/BaseComponent'
import ConfirmDialog from './components/ConfirmDialog'
import AlertDialog from './components/AlertDialog'
import InAppHeader from './components/InAppHeader'

const restdomain = require('./common/constans.js').restdomain

export default class ChatCoinForm extends BaseComponent {
  constructor(props) {
    super(props)
    this.inputRefs = {}
    this.state = {
      comment: '',
      resultList: [],
      userid: null,
      password: null,
      loginShainPk: 0,
      imageFileName: null,
      shimei: null,
      kengenCd: null,
      fromShainPk: 0,
      coinList: [],
      target_manager: '',
      bccoin: 0,
      from_bcaccount: null,
      sofuCoin: 0,
      confirmDialogVisible: false,
      confirmDialogMessage: '',
      alertDialogVisible: false,
      alertDialogMessage: '',
      height: 0
    }
  }
  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo()

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
    // 送付コインリスト
    this.setState({
      coinList: [
        {
          label: '10コイン（ありがとう!）',
          value: 10
        },
        {
          label: '20コイン（うれしい!!）',
          value: 20
        },
        {
          label: '30コイン（感激!!!）',
          value: 30
        }
      ]
    })

    // 初期表示情報取得
    this.findChatCoin()
  }

  //画面初期表示情報取得
  findChatCoin = async () => {
    await fetch(restdomain + '/chat_coin/find', {
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
          var resbccoin = json.bccoin
          var resfrom_bcaccount = json.from_bcaccount

          this.setState({ resultList: dataList })
          this.setState({ bccoin: resbccoin })
          this.setState({ from_bcaccount: resfrom_bcaccount })
        }.bind(this)
      )
      .catch(error => console.error(error))
  }

  /** 送付ボタン押下 */
  onClickSend = async () => {
    // 入力チェック
    var alertMessage = ''

    // 送付コイン未入力チェック
    if (
      typeof this.state.target_manager === 'undefined' ||
      this.state.target_manager === null ||
      (this.state.target_manager != null &&
        this.state.target_manager.length === 0)
    ) {
      alertMessage += '送付するコイン数を選択してください\n\n'
    }

    // コメント未入力チェック
    if (
      typeof this.state.comment === 'undefined' ||
      (this.state.comment != null && this.state.comment.length === 0)
    ) {
      alertMessage += 'コメントを入力してください\n\n'
    }

    // コイン数チェック
    if (this.state.target_manager > this.state.bccoin) {
      alertMessage += 'コインが不足しています'
    }

    // エラーメッセージを設定
    if (alertMessage !== '') {
      this.setState({
        alertDialogVisible: true,
        alertDialogMessage: alertMessage
      })
      return
    }
    // 確認ダイアログを表示（YESの場合、send()を実行）
    this.setState({
      confirmDialogVisible: true,
      confirmDialogMessage: 'コインを送付します。よろしいですか？'
    })
  }

  /** 確認ダイアログでYES押下 */
  send = async () => {
    this.setState({ confirmDialogVisible: false })

    var coinComment = this.state.target_manager
    this.state.sofuCoin = coinComment
    coinComment =
      '【' + coinComment + 'コイン送付しました】\n ' + this.state.comment
    this.state.comment = coinComment

    await fetch(restdomain + '/chat_coin/create', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(this.state),
      headers: new Headers({ 'Content-type': 'application/json' })
    })
      .then(
        function(response) {
          return response.json()
        }.bind(this)
      )
      .then(
        function(json) {
          if (!json.status) {
            // TODO：エラー処理
            alert('APIエラー')
          } else {
            this.props.navigation.navigate('ChatMsg', {
              t_shain_Pk: this.state.fromShainPk,
              shimei: this.state.shimei,
              image_file_nm: this.state.imageFileName
            })
          }
        }.bind(this)
      )
      .catch(error => console.error(error))
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
            <Text style={styles.screenTitleText}>{this.state.shimei}</Text>
          </View>
          {/* 空項目 */}
          <View style={{ flex: 1, alignItems: 'flex-end' }} />
        </View>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'nowrap'
              }}
            >
              <View
                style={{
                  flexDirection: 'column',
                  flexWrap: 'nowrap'
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 16,
                    marginTop: 20,
                    color: 'gray'
                  }}
                >
                  所持コイン
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    marginLeft: 16,
                    textAlign: 'center',
                    color: '#FF683A',
                    fontWeight: 'bold'
                  }}
                >
                  {this.state.bccoin}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 16,
                    marginTop: 20,
                    color: 'gray'
                  }}
                >
                  送付相手
                </Text>
                <View style={{ flexDirection: 'row', marginLeft: 16 }}>
                  <Avatar
                    rounded
                    medium
                    source={{
                      uri: restdomain + `/uploads/${this.state.imageFileName}`
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 22,
                      marginLeft: 16,
                      marginTop: 20
                    }}
                  >
                    {this.state.shimei}
                  </Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontSize: 16,
                marginLeft: 16,
                marginTop: 20,
                color: 'gray'
              }}
            >
              コイン
            </Text>
            <RNPickerSelect
              placeholder={{
                label: '送付するコイン数を選択してください',
                value: ''
              }}
              items={this.state.coinList}
              onValueChange={value => {
                this.setState({
                  target_manager: value
                })
              }}
              style={{ ...pickerSelectStyles }}
              value={this.state.target_manager}
              ref={el => {
                this.inputRefs.picker = el
              }}
            />
            <Text
              style={{
                fontSize: 16
              }}
            />
            <Text
              style={{
                fontSize: 16,
                marginLeft: 16,
                marginTop: 20,
                color: 'gray'
              }}
            >
              コメント
            </Text>

            {/* <Card> */}
            <TextInput
              // {...this.props}
              multiline={true}
              numberOfLines={8}
              scrollEnabled={false}
              // onContentSizeChange={event => {
              //   this.setState({
              //     height: event.nativeEvent.contentSize.height
              //   })
              // }}
              // style={[
              //   styles.default,
              //   { height: Math.max(35, this.state.height), fontSize: 18 }
              // ]}
              style={[styles.inputText, { textAlignVertical: 'top' }]}
              value={this.state.comment}
              // ref={component => (this._textinput = component)}
              // underlineColorAndroid="transparent"
              // returnKeyType="default"
              // returnKeyType="done"
              onChangeText={text => {
                this.setState({
                  comment: text
                })
              }}
            />
            {/* </Card> */}

            <Text
              style={{
                fontSize: 16
              }}
            />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <TouchableHighlight onPress={() => this.onClickSend()}>
                  <View style={styles.saveButton}>
                    <Image
                      source={require('./../images/coin_icon.png')}
                      style={styles.menu_icon}
                    />
                    <View style={styles.articleTitleView}>
                      <Text style={styles.articleTitleText}>送付する</Text>
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {/* -- 確認ダイアログ -- */}
        <ConfirmDialog
          modalVisible={this.state.confirmDialogVisible}
          message={this.state.confirmDialogMessage}
          handleYes={this.send.bind(this)}
          handleNo={() => {
            this.setState({ confirmDialogVisible: false })
          }}
          handleClose={() => {
            this.setState({ confirmDialogVisible: false })
          }}
        />
        {/* -- メッセージダイアログ -- */}
        <AlertDialog
          modalVisible={this.state.alertDialogVisible}
          message={this.state.alertDialogMessage}
          handleClose={() => {
            this.setState({ alertDialogVisible: false })
          }}
        />
      </View>
    )
  }
}
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingTop: 13,
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    backgroundColor: 'white',
    color: 'black'
  }
})
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  menu_icon: {
    width: 25,
    height: 25
  },
  saveButton: {
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#ff9800',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  articleTitleView: {
    alignItems: 'center'
  },
  articleTitleText: {
    fontSize: 26,
    color: 'white',
    padding: 10
  },
  screenTitleText: {
    fontSize: 18,
    color: 'white',
    padding: 10,
    textAlign: 'center',
    alignSelf: 'center'
  },
  screenTitleView: {
    alignItems: 'center',
    backgroundColor: '#ff5622'
  },
  inputText: {
    fontSize: 16,
    color: 'black',
    padding: 5,
    borderColor: 'gray',
    borderWidth: 1
  }
})

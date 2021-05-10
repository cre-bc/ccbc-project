import React, { Component } from "react";
import * as Notifications from "expo-notifications";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  AppState,
  Platform,
  Alert,
} from "react-native";
import { Icon } from 'react-native-elements'
import { GiftedChat, Send, Actions } from "react-native-gifted-chat";
import io from "socket.io-client";
import KeyboardSpacer from "react-native-keyboard-spacer";
import Spinner from "react-native-loading-spinner-overlay";
import * as ImagePicker from 'expo-image-picker'
import moment from 'moment'
import 'moment/locale/ja'

import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

export default class ChatMsgForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      comment: {},
      resultList: [],
      text: "",
      fromShainPk: 0,
      chatUser: null,
      fromImageFileName: null,
      fromExpoPushToken: null,
      messages: [],
      message: [],
      isProcessing: false,
      test: "",
      screenNo: 11,
      imageData: {
        uri: "",
        type: "",
        name: ""
      },
      filePath: ""
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    this.setState({ "test": "componentWillMount" })
    // チャットメッセージの受信（websocket）
    socket.off("comcomcoin_chat");
    socket.on(
      "comcomcoin_chat",
      function (message) {
        this.setState({ "test": "comcomcoin_chat get message" })
        // 現在開いているチャット相手からのメッセージの場合に受信処理を行う
        if (
          Number(JSON.parse(message).to_shain_pk) ===
          Number(this.state.fromShainPk)
        ) {
          this.getChatMessage(message);
          this.setState({ "test": "comcomcoin_chat set message" })
        }
      }.bind(this)
    );

    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());

    // 画面遷移時処理（後処理）
    this.props.navigation.addListener("willBlur", () => this.onwillBlur());

    this.renderActions = props => (
      <Actions {...props} icon={() => <FontAwesome name='image' color='gray' size={22} />} />
    )


    // アプリがバックグラウンド→フォアグラウンドになった場合に再表示するようベントを関連付け
    AppState.addEventListener("change", this.handleAppStateChange);
  };

  // 画像添付ボタン押下処理
  onPressActionButton = async (messages = []) => {
    // スマホのカメラロールを開く
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All
    })
    let data = {}
    //　画像が選択された場合
    if (!result.cancelled) {
      data = {
        uri: result.uri,
        type: result.type
      }
    } else {
      data = {
        uri: "",
        type: ""
      }
    }
    this.setState({ imageData: data })
    if (this.state.imageData.uri !== "") {
      // 画像ファイルのアップロードがある場合
      const extension = this.getExtension(this.state.imageData.uri)
      const fileName = this.state.userid + "_" + moment(new Date()).format('YYYYMMDDHHmmssSS') + "." + extension
      let data = new FormData()
      data.append('image', {
        uri: this.state.imageData.uri,
        name: fileName,
        type: this.state.imageData.type + "/" + extension
      })

      // 画像をサーバーにアップロード
      await fetch(restdomain + '/chat_msg/upload', {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        }
      })
        .then(function (response) {
          return response.json()
        })
        .then(function (json) {
          // 画像のアップロードが成功した場合
          if (json.status) {
            this.state.filePath = fileName;
            this.edit(fileName)
          } else {
            alert("画像ファイルのアップロードに失敗しました")
          }
        }.bind(this))
        .catch(error => alert(error))
    }
  }

  /** 画像送信用更新処理 */
  edit = async (fileName) => {
    await fetch(restdomain + "/chat_msg/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(
        function (response) {
          return response.json();
        }.bind(this)
      )
      .then(
        function (json) {
          if (json.status) {
            var chat = [];
            chat.push({
              _id: this.state.userid + "-" + moment(new Date()).format('YYYYMMDDHHmmssSS'),
              createdAt: new Date(),
              user: {
                _id: 1,
              },
              image: restdomain + `/uploads/chat/${fileName}`
            });
            this.setState((previousState) => ({
              messages: GiftedChat.append(previousState.messages, chat),
            }));
            // チャットメッセージの送信
            const message = {
              room_id: this.state.fromShainPk,
              to_shain_pk: this.state.loginShainPk,
              _id: this.state.userid + "-" + moment(new Date()).format('YYYYMMDDHHmmssSS'),
              createdAt: new Date(),
              image: restdomain + `/uploads/chat/${fileName}`
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  }

  /** ファイルパスよりファイルの拡張子を取得 */
  getExtension = (fileName) => {
    var ret = ""
    if (!fileName) {
      return ret
    }
    var fileTypes = fileName.split(".")
    var len = fileTypes.length
    if (len === 0) {
      return ret
    }
    ret = fileTypes[len - 1]
    return ret
  }

  /** コンポーネントのアンマウント時処理 */
  componentWillUnmount = async () => {
    if (!socket.disconnected) {
      // websocket切断
      socket.close();
      socket.disconnect();
    }
    AppState.removeEventListener("change", this.handleAppStateChange);
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    this.setState({ isProcessing: true });
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog()

    // スマホの画像機能へのアクセス許可
    this.getPermissionAsync()

    // アプリの未読件数をクリア
    Notifications.getBadgeCountAsync().then((badgeNumber) => {
      if (badgeNumber !== 0) {
        Notifications.setBadgeCountAsync(0);
      }
    });

    // websocket切断
    if (socket.connected) {
      socket.close();
      socket.disconnect();
    }

    // websocket接続
    socket.connect();

    // チャットルーム（自分の社員PK）に接続
    socket.emit("join", this.state.loginShainPk);

    // 前画面情報取得
    // チャット相手
    this.state.fromShainPk = this.props.navigation.getParam("fromShainPk");
    // チャット相手氏名
    this.state.chatUser = this.props.navigation.getParam("fromShimei");
    // チャット相手イメージファイル
    this.state.fromImageFileName = this.props.navigation.getParam(
      "fromImageFileNm"
    );
    // チャット相手先EXPOプッシュトークン
    this.state.fromExpoPushToken = this.props.navigation.getParam(
      "fromExpoPushToken"
    );

    // 初期表示情報取得
    this.findChat();
    this.setState({ isProcessing: false });
  };

  /** 画面遷移時処理（後処理） */
  onwillBlur = async () => {
    if (!socket.disconnected) {
      // websocket切断
      socket.close();
      socket.disconnect();
    }
  };

  /** アクセス情報登録 */
  setAccessLog = async () => {
    await fetch(restdomain + "/access_log/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .catch((error) => console.error(error));
  }

  getPermissionAsync = async () => {
    if (Platform.OS === "ios") {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  /** 画面初期表示情報取得 */
  findChat = async () => {
    await fetch(restdomain + "/chat_msg/find", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          // 結果が取得できない場合は終了
          if (typeof json.data === "undefined") {
            return;
          }
          // 検索結果の取得
          var dataList = json.data;
          this.setState({ resultList: dataList });

          var chat = [];
          var chatNo = 0;
          for (var i in dataList) {
            // user._idの値の大きい方がチャット画面の左側に表示されるため、
            // 自分（ログインユーザー）は[1]固定、チャット相手は[2]固定とする
            if (dataList[i].from_shain_pk == this.state.loginShainPk) {
              chatNo = 1;
            } else {
              chatNo = 2;
            }
            if (dataList[i].file_path != null && dataList[i].file_path != "") {
              // 取得結果をチャットにセット(画像ありの場合)
              chat.push({
                _id: dataList[i].t_chat_pk,
                text: dataList[i].comment,
                createdAt: dataList[i].post_dttm,
                user: {
                  _id: chatNo,
                  name: this.state.chatUser,
                  avatar: restdomain + `/uploads/${this.state.fromImageFileName}`,
                },
                image: restdomain + `/uploads/chat/${dataList[i].file_path}`
              });
            } else {
              // 取得結果をチャットにセット
              chat.push({
                _id: dataList[i].t_chat_pk,
                text: dataList[i].comment,
                createdAt: dataList[i].post_dttm,
                user: {
                  _id: chatNo,
                  name: this.state.chatUser,
                  avatar: restdomain + `/uploads/${this.state.fromImageFileName}`,
                },
              });
            }
          }
          this.setState({ messages: chat });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** コイン送付ボタン押下 */
  onPressChatCoin() {
    // 画面遷移（コイン送付画面）
    this.props.navigation.navigate("ChatCoin", {
      fromShainPk: this.state.fromShainPk,
      fromShimei: this.state.chatUser,
      fromImageFileNm: this.state.fromImageFileName,
      fromExpoPushToken: this.state.fromExpoPushToken,
    });
  }

  /** 送信ボタン押下 */
  onSend = async (messages = []) => {
    console.log('messages', messages);
    this.state.message = messages[0].text;
    this.state.filePath = null;
    await fetch(restdomain + "/chat_msg/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(
        function (response) {
          return response.json();
        }.bind(this)
      )
      .then(
        function (json) {
          if (json.status) {
            this.setState((previousState) => ({
              messages: GiftedChat.append(previousState.messages, messages),
            }));
            // チャットメッセージの送信
            const message = {
              room_id: this.state.fromShainPk,
              to_shain_pk: this.state.loginShainPk,
              _id: messages[0]._id,
              text: this.state.message,
              createdAt: new Date(),
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** チャットメッセージ受信時の処理 */
  getChatMessage = async (message) => {
    await fetch(restdomain + "/chat_msg/kidoku_update", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          if (json.status) {
            var chat = JSON.parse(message);
            var user = {
              _id: 2,
              name: this.state.chatUser,
              avatar: restdomain + `/uploads/${this.state.fromImageFileName}`,
            };
            chat.user = user;
            var messages = [chat];
            this.setState((previousState) => ({
              messages: GiftedChat.append(previousState.messages, messages),
            }));
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** バックグラウンド→フォアグラウンドの切り替え */
  handleAppStateChange = (nextAppState) => {
    // アプリのForeground・Backgroundが変わったら、チャット内容を再読み込みする
    this.findChat();
  };

  render() {
    return (
      <View style={styles.container}>
        {/* -- 処理中アニメーション -- */}
        <Spinner
          visible={this.state.isProcessing}
          textContent={"Processing…"}
          textStyle={styles.spinnerTextStyle}
        />

        {/* -- 共有ヘッダ -- */}
        <InAppHeader navigate={this.props.navigation.navigate} />

        {/* -- 画面タイトル -- */}
        <View style={[styles.screenTitleView, { flexDirection: "row" }]}>
          {/* 空項目 */}
          <View style={{ flex: 1, alignItems: "flex-start" }} />
          {/* チャット相手 */}
          <View style={{ alignItems: "center" }}>
            <Text style={styles.screenTitleText}>{this.state.chatUser}</Text>
            {/* <Text style={styles.screenTitleText}>{this.state.test}</Text> */}
          </View>
          {/* コイン贈与アイコン */}
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
            <TouchableHighlight onPress={() => this.onPressChatCoin()}>
              <Image
                source={require("./../images/coin_icon.png")}
                style={styles.menu_icon}
              />
            </TouchableHighlight>
          </View>
        </View>

        {/* チャット内容 */}
        <GiftedChat
          renderSend={(props) => {
            return (
              <Send {...props} containerStyle={styles.sendContainer}>
                <Icon name="send" type="font-awesome" color="blue" />
              </Send>
            );
          }}
          dateFormat={"YYYY/MM/DD"}
          timeFormat={"HH:mm"}
          messages={this.state.messages} //stateで管理しているメッセージ
          onSend={(messages) => this.onSend(messages)} //送信ボタン押した時の動作
          placeholder={"メッセージを入力"}
          minComposerHeight={50}
          user={{
            _id: 1,
          }}
          renderActions={this.renderActions}
          onPressActionButton={(messages) => this.onPressActionButton(messages)}
        />
        {/* {Platform.OS === "android" ? <KeyboardSpacer /> : null} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory",
  },
  menu_icon: {
    width: 25,
    height: 25,
  },
  screenTitleView: {
    alignItems: "center",
    backgroundColor: "#ff5622",
  },
  screenTitleText: {
    fontSize: 18,
    color: "white",
    padding: 10,
  },
  sendContainer: {
    justifyContent: Platform.OS == "ios" ? 'flex-start' : 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: 15,
  },
});

import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  AppState,
  Platform
} from "react-native";
import { GiftedChat, Composer } from "react-native-gifted-chat";
import io from "socket.io-client";
import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";
import KeyboardSpacer from "react-native-keyboard-spacer";
import Spinner from "react-native-loading-spinner-overlay";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });
// const socket = io(restdomain)

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
      isProcessing: false
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    if (!socket.connected) {
      socket.connect();
    }
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setState({ isProcessing: true });
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());
    // チャットメッセージの受信（websocket）
    socket.on(
      "comcomcoin_chat",
      function (message) {
        // 現在開いているチャット相手からのメッセージの場合に受信処理を行う
        if (Number(JSON.parse(message).to_shain_pk) === Number(this.state.fromShainPk)) {
          this.getChatMessage(message);
        }
      }.bind(this)
    );
    this.setState({ isProcessing: false });
  };

  componentWillUnmount = async () => {
    if (!socket.disconnected) {
      socket.disconnect();
    }
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    // チャットルーム（自分の社員PK）に接続
    socket.emit("join", this.state.loginShainPk);

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
    this.state.fromShainPk = this.props.navigation.getParam("fromShainPk");
    // チャット相手氏名
    this.state.chatUser = this.props.navigation.getParam("fromShimei");
    // チャット相手イメージファイル
    this.state.fromImageFileName = this.props.navigation.getParam("fromImageFileNm");
    // チャット相手先EXPOプッシュトークン
    this.state.fromExpoPushToken = this.props.navigation.getParam("fromExpoPushToken");

    // 初期表示情報取得
    this.findChat();
  };

  //画面初期表示情報取得
  findChat = async () => {
    await fetch(restdomain + "/chat_msg/find", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" })
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
            // 恐らくuser._idの値の大きい方がチャット画面の左側に表示されるため、
            // 自分（ログインユーザー）は[1]固定、チャット相手は[2]固定とする
            if (dataList[i].from_shain_pk == this.state.loginShainPk) {
              chatNo = 1;
            } else {
              chatNo = 2;
            }
            // 取得結果をチャットにセット
            chat.push({
              _id: dataList[i].t_chat_pk,
              text: dataList[i].comment,
              createdAt: dataList[i].post_dttm,
              user: {
                _id: chatNo,
                name: this.state.chatUser,
                avatar: restdomain + `/uploads/${this.state.fromImageFileName}`
              }
            });
          }
          this.setState({ messages: chat });
        }.bind(this)
      )
      .catch(error => console.error(error));
  };

  /** コイン送付ボタン押下 */
  onPressChatCoin() {
    // 画面遷移（コイン送付画面）
    this.props.navigation.navigate("ChatCoin", {
      fromShainPk: this.state.fromShainPk,
      fromShimei: this.state.chatUser,
      fromImageFileNm: this.state.fromImageFileName,
      fromExpoPushToken: this.state.fromExpoPushToken
    });
  }

  /** 送信ボタン押下 */
  onSend = async (messages = []) => {
    this.state.message = messages[0].text;
    await fetch(restdomain + "/chat_msg/create", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" })
    })
      .then(
        function (response) {
          return response.json();
        }.bind(this)
      )
      .then(
        function (json) {
          if (json.status) {
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, messages)
            }));
            // チャットメッセージの送信
            const message = {
              room_id: this.state.fromShainPk,
              to_shain_pk: this.state.loginShainPk,
              _id: messages[0]._id,
              text: this.state.message,
              createdAt: new Date()
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
            // プッシュ通知
            if (this.state.fromExpoPushToken !== "" && this.state.fromExpoPushToken !== null) {
              fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                body: JSON.stringify([
                  {
                    to: this.state.fromExpoPushToken,
                    title: this.state.shimei,
                    body: this.state.message,
                    data: {
                      title: this.state.shimei,
                      message: this.state.message,
                      fromShainPk: this.state.loginShainPk,
                      fromShimei: this.state.shimei,
                      fromImageFileNm: this.state.imageFileName,
                      fromExpoPushToken: this.state.expo_push_token
                    }
                  }]),
                "badge": 1,
                headers: new Headers({ "Content-type": "application/json" })
              });
            }
          }
        }.bind(this)
      )
      .catch(error => console.error(error));
  };

  /** チャットメッセージ受信時の処理 */
  getChatMessage = async message => {
    await fetch(restdomain + "/chat_msg/kidoku_update", {
      method: "POST",
      body: JSON.stringify(this.state),
      headers: new Headers({ "Content-type": "application/json" })
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
              avatar: restdomain + `/uploads/${this.state.fromImageFileName}`
            };
            chat.user = user;
            var messages = [chat];
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, messages)
            }));
          }
        }.bind(this)
      )
      .catch(error => console.error(error));
  };

  handleAppStateChange = (nextAppState) => {
    // アプリのForeground・Backgroundが変わったら、チャット内容を再読み込みする
    this.findChat();
  }

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
          dateFormat={"YYYY/MM/DD"}
          timeFormat={"HH:mm"}
          messages={this.state.messages} //stateで管理しているメッセージ
          onSend={messages => this.onSend(messages)} //送信ボタン押した時の動作
          placeholder={"メッセージを入力"}
          minComposerHeight={50}
          user={{
            _id: 1
          }}
        />
        {Platform.OS === "android" ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "ivory"
  },
  menu_icon: {
    width: 25,
    height: 25
  },
  screenTitleView: {
    alignItems: "center",
    backgroundColor: "#ff5622"
  },
  screenTitleText: {
    fontSize: 18,
    color: "white",
    padding: 10
  }
});

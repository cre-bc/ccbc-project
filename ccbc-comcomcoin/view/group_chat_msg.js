import React, { Component } from "react";
import * as Notifications from "expo-notifications";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableHighlight,
  AppState,
} from "react-native";
import { Icon } from "react-native-elements";
import { GiftedChat, Send } from "react-native-gifted-chat";
import io from "socket.io-client";
import Spinner from "react-native-loading-spinner-overlay";

import BaseComponent from "./components/BaseComponent";
import InAppHeader from "./components/InAppHeader";

const restdomain = require("./common/constans.js").restdomain;
const restdomain_ws = require("./common/constans.js").restdomain_ws;
const socket = io(restdomain_ws, { secure: true, transports: ["websocket"] });

export default class GroupChatMsgForm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      comment: {},
      resultList: [],
      resultMemberList: [],
      text: "",
      chatGroupPk: 0,
      chatGroupNm: null,
      chatUser: null,
      fromExpoPushToken: null,
      messages: [],
      message: [],
      isProcessing: false,
      count: 0,
      screenNo: 18,
    };
  }

  /** コンポーネントのマウント時処理 */
  componentWillMount = async () => {
    // チャットメッセージの受信（websocket）
    socket.off("comcomcoin_chat");
    socket.on(
      "comcomcoin_chat",
      function (message) {
        // 現在開いているチャット相手からのメッセージの場合に受信処理を行う
        if (
          Number(JSON.parse(message).chatGroupPk) ===
            Number(this.state.chatGroupPk) &&
          Number(JSON.parse(message).to_shain_pk) !==
            Number(this.state.loginShainPk)
        ) {
          this.getChatMessage(message);
        }
      }.bind(this)
    );

    // 初期表示情報取得処理（gobackで戻る場合に呼ばれるようイベントを関連付け）
    this.props.navigation.addListener("willFocus", () => this.onWillFocus());

    // 画面遷移時処理（後処理）
    this.props.navigation.addListener("willBlur", () => this.onwillBlur());

    // アプリがバックグラウンド→フォアグラウンドになった場合に再表示するようベントを関連付け
    AppState.addEventListener("change", this.handleAppStateChange);
  };

  /** コンポーネントのアンマウント時処理 */
  componentWillUnmount = async () => {
    // websocket切断
    socket.close();
    socket.disconnect();
    AppState.removeEventListener("change", this.handleAppStateChange);
  };

  /** 画面遷移時処理 */
  onWillFocus = async () => {
    // ログイン情報の取得（BaseComponent）
    await this.getLoginInfo();

    //アクセス情報登録
    this.setAccessLog();

    // 前画面情報取得
    // チャットグループ
    this.state.chatGroupPk = this.props.navigation.getParam("chatGroupPk");
    // チャットグループ名
    this.state.chatGroupNm = this.props.navigation.getParam("chatGroupNm");

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

    // チャットルーム（グループPK）に接続
    socket.emit("join", this.state.chatGroupPk);

    // 初期表示情報取得
    this.findChat();
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
  };

  /** 画面初期表示情報取得 */
  findChat = async () => {
    await fetch(restdomain + "/group_chat_msg/find", {
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
          var memberDataList = json.memberData;
          this.setState({ resultList: dataList });
          this.setState({ resultMemberList: memberDataList });

          var chat = [];
          var chatNo = 0;
          for (var i in dataList) {
            // user._idの値の大きい方がチャット画面の左側に表示されるため、
            // 自分（ログインユーザー）は[1]固定、チャット相手は[i + 2]固定とする
            // ※[1]（ログインユーザー）と重ならないようにi + 2にしておく。
            // また、user._idが同じ場合、同一人物とみなされるため、相手側のuser._idは同一とならないようにする。
            if (dataList[i].from_shain_pk == this.state.loginShainPk) {
              chatNo = 1;
            } else {
              chatNo = dataList[i].from_shain_pk + 1;
            }
            // 取得結果をチャットにセット
            chat.push({
              _id: dataList[i].t_chat_pk,
              text: dataList[i].comment,
              createdAt: dataList[i].post_dttm,
              user: {
                _id: chatNo,
                name: dataList[i].user_id,
                avatar: restdomain + `/uploads/${dataList[i].image_file_nm}`,
              },
            });
          }
          this.setState({ messages: chat });
          this.setState({ count: i + 2 });
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** グループチャットPushボタン押下 */
  onPressGroupChatPush() {
    // 画面遷移（グループチャットPush画面）
    this.props.navigation.navigate("GroupChatPush", {
      chatGroupNm: this.state.chatGroupNm,
      resultMemberList: this.state.resultMemberList,
      chatGroupPk: this.state.chatGroupPk,
    });
  }

  /** 送信ボタン押下 */
  onSend = async (messages = []) => {
    this.state.message = messages[0].text;
    await fetch(restdomain + "/group_chat_msg/create", {
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
              room_id: this.state.chatGroupPk,
              to_shain_pk: this.state.loginShainPk,
              _id: messages[0]._id,
              text: this.state.message,
              createdAt: new Date(),
              imageFileName: this.state.imageFileName,
              userid: this.state.userid,
              chatGroupPk: this.state.chatGroupPk,
            };
            socket.emit("comcomcoin_chat", JSON.stringify(message));
          }
        }.bind(this)
      )
      .catch((error) => console.error(error));
  };

  /** チャットメッセージ受信時の処理 */
  getChatMessage = async (message) => {
    await fetch(restdomain + "/group_chat_msg/kidoku_update", {
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
              _id: chat.to_shain_pk + 1,
              name: chat.userid,
              avatar: restdomain + `/uploads/${chat.imageFileName}`,
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
            <Text style={styles.screenTitleText}>{this.state.chatGroupNm}</Text>
          </View>
          {/* 全員通知アイコン */}
          <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10 }}>
            <TouchableHighlight onPress={() => this.onPressGroupChatPush()}>
              <Image
                source={require("./../images/push_icon.png")}
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
    justifyContent: Platform.OS == "ios" ? "flex-start" : "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 15,
  },
});
